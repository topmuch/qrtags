import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateWhatsAppMessage, analyzeScanSuspicion } from '@/lib/groq';
import { GROQ_AI_ENABLED, GROQ_SCAN_GUARD_ENABLED, GROQ_AUTO_TRANSLATE_ENABLED } from '@/lib/config';
import { isFeatureEnabled } from '@/lib/features';
import { logMetric } from '@/lib/logger';
import { detectLocaleFromHeaders, LANGUAGE_COOKIE_NAME, LANGUAGE_COOKIE_MAX_AGE_DAYS } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

// GET - Retrieve baggage info for scan page (trouveur)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    const baggage = await db.baggage.findUnique({
      where: { reference },
      include: { agency: true }
    });

    if (!baggage) {
      return NextResponse.json({
        status: 'not_found',
        message: 'Code QR non valide',
        theme: 'error'
      });
    }

    // Check status - redirect to activation if pending
    if (baggage.status === 'pending_activation') {
      return NextResponse.json({
        status: 'pending_activation',
        type: baggage.type,
        message: 'Cet objet doit être activé',
        theme: 'standard'
      });
    }

    if (baggage.status === 'blocked') {
      return NextResponse.json({
        status: 'blocked',
        message: 'Cet objet a été bloqué',
        theme: 'error'
      });
    }

    // Check expiration
    if (baggage.expiresAt && new Date() > baggage.expiresAt) {
      return NextResponse.json({
        status: 'expired',
        message: 'Cet objet a expiré',
        theme: 'error',
        expiredAt: baggage.expiresAt.toISOString(),
        agency: baggage.agency?.name || null,
        baggage: {
          type: baggage.type,
          travelerName: `${baggage.travelerFirstName} ${baggage.travelerLastName}`
        }
      });
    }

    // Check if baggage is declared lost (but not yet found)
    const isDeclaredLost = baggage.declaredLostAt && !baggage.foundAt;

    // AI-FEATURE: Detect locale and set cookie for server-side i18n
    let detectedLocale: Language = 'fr';
    try {
      if (GROQ_AI_ENABLED && GROQ_AUTO_TRANSLATE_ENABLED) {
        const autoTranslateEnabled = await isFeatureEnabled('auto_translate').catch(() => false);
        if (autoTranslateEnabled) {
          detectedLocale = detectLocaleFromHeaders(request.headers);
        }
      }
    } catch {
      // Silent fallback to 'fr'
    }

    // Theme: lost-urgent for declared lost, standard otherwise
    const theme = isDeclaredLost ? 'lost-urgent' : 'standard';

    const response = NextResponse.json(
      {
      status: isDeclaredLost ? 'lost' : 'active',
      theme,
      type: baggage.type,
      baggage: {
        reference: baggage.reference,
        type: baggage.type,
        travelerName: `${baggage.travelerFirstName} ${baggage.travelerLastName}`,
        baggageIndex: baggage.baggageIndex,
        status: baggage.status,
        objectCategory: baggage.objectCategory,
        // Lost baggage description fields
        itemDescription: baggage.itemDescription,
        itemColor: baggage.itemColor,
        itemBrand: baggage.itemBrand,
        identificationMark: baggage.identificationMark,
        agency: baggage.agency?.name || null,
        whatsappOwner: baggage.whatsappOwner || null,
        declaredLostAt: baggage.declaredLostAt,
        foundAt: baggage.foundAt,
        createdAt: baggage.createdAt?.toISOString() || null,
        customData: baggage.customData,
      },
      // Agency branding for white-label scan page
      agencyBranding: baggage.agency ? {
        name: baggage.agency.name,
        agencyType: baggage.agency.agencyType,
        logoUrl: baggage.agency.logoUrl,
        primaryColor: baggage.agency.primaryColor,
        secondaryColor: baggage.agency.secondaryColor,
        customMessage: baggage.agency.customMessage,
        phone: baggage.agency.phone,
      } : null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
    );

    // Set locale cookie
    try {
      response.cookies.set(LANGUAGE_COOKIE_NAME, detectedLocale, {
        path: '/',
        maxAge: LANGUAGE_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
        sameSite: 'lax',
        httpOnly: false,
      });
    } catch {
      // Cookie setting can fail — silent
    }

    return response;

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Log scan and generate WhatsApp link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await request.json();

    const { location, finderName, finderPhone, message, latitude, longitude, country, city, ipAddress } = body;

    const baggage = await db.baggage.findUnique({
      where: { reference }
    });

    if (!baggage || !baggage.whatsappOwner) {
      return NextResponse.json(
        { error: 'Baggage not found or not activated' },
        { status: 404 }
      );
    }

    // AI-FEATURE: Scan Guard (Anti-Doublon)
    let isFlagged = false;
    let scanGuardAnalysis: Record<string, unknown> | undefined;

    try {
      if (GROQ_AI_ENABLED && GROQ_SCAN_GUARD_ENABLED) {
        const scanGuardEnabled = await isFeatureEnabled('scan_guard').catch(() => false);
        if (scanGuardEnabled) {
          const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
          const recentScans = await db.scanLog.findMany({
            where: {
              baggageId: baggage.id,
              createdAt: { gte: thirtyMinAgo },
            },
            select: {
              ipAddress: true,
              city: true,
              country: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          });

          const scannerIp = ipAddress ||
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip')?.trim() ||
            'unknown';

          const guardResult = await analyzeScanSuspicion({
            reference: baggage.reference,
            scannerIp,
            userAgent: request.headers.get('user-agent') || undefined,
            city: city || undefined,
            country: country || undefined,
            recentScans: recentScans.map((s) => ({
              ip: s.ipAddress || 'unknown',
              city: s.city || undefined,
              country: s.country || undefined,
              createdAt: s.createdAt.toISOString(),
            })),
          });

          if (guardResult.analyzed && guardResult.analysis) {
            scanGuardAnalysis = {
              feature: 'scan_guard',
              isSuspicious: guardResult.analysis.isSuspicious,
              reason: guardResult.analysis.reason,
              confidence: guardResult.analysis.confidence,
              analyzedAt: guardResult.analysis.analyzedAt,
              latencyMs: guardResult.latencyMs,
            };

            logMetric('groq', 'scan_guard', guardResult.latencyMs, true, {
              key: reference,
              details: `flagged=${guardResult.analysis.isSuspicious}, confidence=${guardResult.analysis.confidence}, reason=${guardResult.analysis.reason.substring(0, 50)}`,
            });

            if (guardResult.analysis.isSuspicious) {
              isFlagged = true;
              return NextResponse.json({
                success: true,
                flagged: true,
                message: 'Votre signalement est en cours de vérification.',
              });
            }
          } else {
            logMetric('groq', 'scan_guard', guardResult.latencyMs, false, {
              key: reference,
              details: 'analysis_failed',
            });
          }
        }
      }
    } catch (error) {
      console.warn('[Groq/ScanGuard] Error → fail-open:', error instanceof Error ? error.message : 'unknown');
    }

    // ─── IA: Générer le message WhatsApp via Groq (si activé) ───
    let aiGenerated = false;
    let aiLatencyMs: number | null = null;

    try {
      if (!GROQ_AI_ENABLED) {
        console.log('[Groq/WhatsApp] Désactivé via GROQ_AI_ENABLED=false (env var)');
      } else {
        const groqFlag = await db.featureFlag.findUnique({
          where: { key: 'groq_api' },
          select: { enabled: true },
        });

        if (groqFlag?.enabled) {
          const detectedLocale = detectLocaleFromHeaders(request.headers);

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrtags.com';

          const aiResult = await generateWhatsAppMessage({
            reference: baggage.reference,
            location: {
              city: city || 'Inconnue',
              country: country || '',
            },
            time: new Date().toLocaleTimeString(),
            link: `${appUrl}/suivi/${baggage.reference}`,
            language: detectedLocale,
          });

          if (aiResult.generated) {
            aiGenerated = true;
            aiLatencyMs = aiResult.latencyMs;
            logMetric('groq', 'generate_message', aiResult.latencyMs, true, {
              key: baggage.reference,
            });
          }
        }
      }
    } catch (error) {
      logMetric('groq', 'generate_message', 0, false, {
        key: baggage.reference,
        details: error instanceof Error ? error.message : 'unknown',
      });
    }

    // Create scan log
    await db.scanLog.create({
      data: {
        baggageId: baggage.id,
        location,
        message,
        latitude,
        longitude,
        country,
        city,
        ipAddress,
        aiMessageUsed: false,
        groqUsed: aiGenerated || !!scanGuardAnalysis,
        groqLatencyMs: aiLatencyMs,
        aiAnalysis: scanGuardAnalysis ? JSON.parse(JSON.stringify(scanGuardAnalysis)) : undefined,
        context: 'static_location',
        finderName: finderName?.trim() || null,
        finderPhone: finderPhone?.trim() || null,
      }
    });

    const isDeclaredLost = baggage.declaredLostAt && !baggage.foundAt;

    const updateData: Record<string, unknown> = {
      lastScanDate: new Date(),
      lastLocation: location,
      status: baggage.status === 'active' ? 'scanned' : baggage.status,
    };

    if (finderName && finderName.trim()) {
      updateData.founderName = finderName.trim();
      updateData.founderAt = new Date();
    }

    if (finderPhone && finderPhone.trim()) {
      updateData.founderPhone = finderPhone.trim();
    }

    await db.baggage.update({
      where: { id: baggage.id },
      data: updateData
    });

    // ─── WhatsApp message template ───
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrtags.com';
    const trackingUrl = `${appUrl}/suivi/${reference}`;

    const ownerFirstName = baggage.travelerFirstName?.trim() || 'à toi';
    const lieu = city || location || 'lieu non précisé';
    const address = latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : (location || 'non précisée');
    const finderNameDisplay = finderName?.trim() || 'Une personne';
    const finderPhoneDisplay = finderPhone?.trim() || 'numéro non précisé';

    const whatsappText =
      `🎉 Bonne nouvelle ${ownerFirstName} !\n\n` +
      `Quelqu'un a trouvé votre objet à ${lieu} !\n` +
      `📍 Il est actuellement à ${address}\n` +
      `👤 La personne qui l'a trouvé s'appelle ${finderNameDisplay}\n` +
      `📞 Contactez-le au ${finderPhoneDisplay}\n` +
      `💬 Ou écrivez-lui sur WhatsApp\n` +
      `Suivez tous les détails ici :\n` +
      `👉 ${trackingUrl}\n` +
      `Ne paniquez pas, tout va bien se passer ! 💪\n` +
      `L'équipe QRTags`;

    const phone = baggage.whatsappOwner.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
      isDeclaredLost,
      aiMessageUsed: false,
    });

  } catch (error) {
    console.error('Scan POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}