/**
 * WhatsApp Pre-Filled Message Generator — Page Suivi
 *
 * Generic lost-baggage oriented template.
 * Generates a pre-filled WhatsApp message for the OWNER to contact the FINDER.
 *
 * Template:
 *   📍 Objet trouvé !
 *   🧳 [REFERENCE]
 *   👤 [FINDER_NAME]
 *   📱 [FINDER_WHATSAPP]
 *   👉 Suivi : qrtags.com/suivi/[REF]
 *   QRTags – Protégez vos objets, en toute sérénité.
 *
 * Constraints:
 *   - Max 400 characters (wa.me pre-filled limit)
 *   - WhatsApp formatting (*bold*, `monospace`)
 *   - i18n FR/EN/AR
 *   - Robust fallbacks
 */

import type { Language } from './i18n';

type WhatsAppLocale = 'fr' | 'en' | 'ar';

interface PreFilledMessageParams {
  baggage: {
    reference: string;
    objectCategory?: string;
    itemColor?: string;
    itemBrand?: string;
    transportMode?: string;
    airlineName?: string;
    flightNumber?: string;
    trainCompany?: string;
    trainNumber?: string;
    shipName?: string;
    shipCabin?: string;
    busCompany?: string;
    busLineNumber?: string;
    destination?: string;
    bagType?: string;
  };
  scanData: {
    city: string;
    address: string;
    context?: string;
  };
  finder: {
    name: string;
    whatsapp: string;
  };
  locale?: WhatsAppLocale;
  ownerName?: string;
}

const TITLES: Record<WhatsAppLocale, string> = {
  fr: 'Objet trouvé !',
  en: 'Object found!',
  ar: 'تم العثور على الكائن!',
};

const SEE_TRACKING: Record<WhatsAppLocale, string> = {
  fr: '👉 Suivi :',
  en: '👉 Tracking:',
  ar: '👉 تتبع:',
};

const SIGNATURES: Record<WhatsAppLocale, string> = {
  fr: 'QRTags – Protégez vos objets, en toute sérénité.',
  en: 'QRTags – Protect your belongings with peace of mind.',
  ar: 'QRTags – احمِ ممتلكاتك براحة بال.',
};

const CTA: Record<WhatsAppLocale, string> = {
  fr: '👉 Contactez-le pour organiser la récupération !',
  en: '👉 Contact them to arrange pickup!',
  ar: '👉 اتصل به لترتيب الاستلام!',
};

function sanitize(input: string): string {
  if (!input) return '';
  return input.replace(/[^\p{L}\p{N}\s\-_.@+()]/gu, '').trim();
}

function resolveLocale(loc?: string): WhatsAppLocale {
  if (loc === 'fr' || loc === 'en' || loc === 'ar') return loc;
  return 'fr';
}

function smartTruncate(message: string, maxChars: number, locale: WhatsAppLocale): string {
  if (message.length <= maxChars) return message;

  const lines = message.split('\n');
  let truncated = false;

  // Remove signature
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('QRTags') || lines[i].startsWith('*QRTags')) {
      lines.splice(i, 1);
      truncated = true;
      break;
    }
  }
  let joined = lines.join('\n');
  if (joined.length <= maxChars) return joined + '…';

  // Remove CTA
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('👉') && !lines[i].includes('qrtags.com')) {
      lines.splice(i, 1);
      truncated = true;
      break;
    }
  }
  joined = lines.join('\n');
  if (joined.length <= maxChars) return joined + '…';

  // Remove finder phone
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('📱')) {
      lines.splice(i, 1);
      truncated = true;
      break;
    }
  }
  joined = lines.join('\n');
  if (joined.length <= maxChars) return joined + '…';

  // Remove finder name
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('👤')) {
      lines.splice(i, 1);
      truncated = true;
      break;
    }
  }
  joined = lines.join('\n');
  if (joined.length <= maxChars) return joined + '…';

  return joined.substring(0, maxChars - 1).trim() + '…';
}

/**
 * Generate a pre-filled WhatsApp message for the owner to contact the finder.
 */
export function generatePreFilledMessage(params: PreFilledMessageParams): string {
  const { baggage, finder, locale: rawLocale } = params;
  const locale = resolveLocale(rawLocale);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
    : 'https://qrtags.com';
  const sanitizedRef = sanitize(baggage.reference);

  const lines: string[] = [];

  // Line 1: Title
  lines.push(`📍 *${TITLES[locale]}*`);

  // Line 2: Reference
  lines.push(`🧳 \`${sanitizedRef}\``);

  // Line 3: Tracking link
  lines.push(`${SEE_TRACKING[locale]} ${appUrl}/suivi/${sanitizedRef}`);

  // Line 4: Finder name
  const finderName = sanitize(finder.name);
  if (finderName) {
    lines.push(`👤 ${finderName}`);
  }

  // Line 5: Finder WhatsApp
  const finderWhatsapp = sanitize(finder.whatsapp);
  if (finderWhatsapp) {
    lines.push(`📱 ${finderWhatsapp}`);
  }

  // Line 6: CTA
  lines.push(CTA[locale]);

  // Line 7: Signature
  lines.push(SIGNATURES[locale]);

  let message = lines.join('\n');
  message = smartTruncate(message, 400, locale);

  console.log(`[WhatsApp/PreFilled] ${locale} → ${message.length} chars`);

  return message;
}

/**
 * Build a complete WhatsApp URL for contacting the finder.
 */
export function buildWhatsAppUrl(finderPhone: string, message: string): string {
  const cleanPhone = finderPhone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * @deprecated Use generatePreFilledMessage with the new interface
 */
export function resolveBagTypeLabelExported(
  baggageType: string,
  _transportMode?: string,
  _shipCabin?: string | null,
  locale: WhatsAppLocale = 'fr'
): string {
  const labels: Record<string, Record<WhatsAppLocale, string>> = {
    cabine: { fr: 'Cabine', en: 'Cabin', ar: 'مقصورة' },
    soute:  { fr: 'Soute', en: 'Hold', ar: 'شحن' },
  };
  const dbType = (baggageType || '').trim().toLowerCase();
  return labels[dbType]?.[locale] || baggageType || '—';
}