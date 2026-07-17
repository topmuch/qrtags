import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth-middleware';
import type { SessionUser } from '@/lib/session';
import { z } from 'zod/v4';
import { db } from '@/lib/db';

// ─── Schemas ───────────────────────────────────────────────────────────────────

const createScanSchema = z.object({
  baggageReference: z.string().min(1, 'Baggage reference is required'),
  finderName: z.string().optional(),
  finderPhone: z.string().optional(),
  finderMessage: z.string().optional(),
  location: z.string().optional(),
})

// ─── GET: List scan logs ───────────────────────────────────────────────────────

async function getHandler(request: NextRequest, _user: SessionUser) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')
    const status = searchParams.get('status')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Number(limitParam), 200) : 50

    const where: Record<string, unknown> = {}
    if (agencyId) {
      where.agencyId = agencyId
    }
    if (status) {
      where.status = status
    }

    const scanLogs = await db.scanLog.findMany({
      where,
      include: {
        baggage: {
          select: {
            id: true,
            reference: true,
            ownerName: true,
            itemDescription: true,
            itemColor: true,
            itemBrand: true,
            identificationMark: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ scanLogs })
  } catch (error) {
    console.error('[GET /api/scans] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan logs' },
      { status: 500 }
    )
  }
}

// ─── POST: Create a scan log ───────────────────────────────────────────────────

async function postHandler(request: NextRequest, _user: SessionUser) {
  try {
    const body = await request.json()

    const parsed = createScanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { baggageReference, finderName, finderPhone, finderMessage, location } =
      parsed.data

    // Find baggage by reference
    const baggage = await db.baggage.findUnique({
      where: { reference: baggageReference },
      include: {
        set: {
          select: { agencyId: true },
        },
      },
    })

    if (!baggage) {
      return NextResponse.json(
        { error: 'Baggage not found with this reference' },
        { status: 404 }
      )
    }

    // Determine status: 'reported_found' if finder info provided, otherwise 'scanned'
    const status = finderName ? 'reported_found' : 'scanned'

    // Create scan log
    const scanLog = await db.scanLog.create({
      data: {
        baggageId: baggage.id,
        agencyId: baggage.set.agencyId,
        finderName: finderName ?? null,
        finderPhone: finderPhone ?? null,
        finderMessage: finderMessage ?? null,
        location: location ?? null,
        status,
      },
      include: {
        baggage: {
          select: {
            id: true,
            reference: true,
            ownerName: true,
            itemDescription: true,
            itemColor: true,
            itemBrand: true,
            identificationMark: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
            primaryColor: true,
            secondaryColor: true,
            logoUrl: true,
            customMessage: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({ scanLog }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/scans] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create scan log' },
      { status: 500 }
    )
  }
}

export const GET = withAuthHandler(getHandler);
export const POST = withAuthHandler(postHandler);