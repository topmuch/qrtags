import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import crypto from 'crypto'

// ─── Schemas ───────────────────────────────────────────────────────────────────

const createBaggageSetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  agencyId: z.string().min(1, 'Agency ID is required'),
  quantity: z.number().int().min(1).max(500, 'Quantity must be between 1 and 500'),
  prefix: z.string().optional().default('QRT'),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateReference(prefix: string): string {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${suffix}`
}

// ─── GET: List all baggage sets ────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')

    const where: Record<string, unknown> = {}
    if (agencyId) {
      where.agencyId = agencyId
    }

    const baggageSets = await db.baggageSet.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
        _count: {
          select: {
            baggages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ baggageSets })
  } catch (error) {
    console.error('[GET /api/baggage-sets] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch baggage sets' },
      { status: 500 }
    )
  }
}

// ─── POST: Create a baggage set with QR codes ──────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = createBaggageSetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { name, agencyId, quantity, prefix } = parsed.data

    // Validate agency exists
    const agency = await db.agency.findUnique({ where: { id: agencyId } })
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 400 }
      )
    }

    // Generate unique references (check for collisions)
    const references: string[] = []
    for (let i = 0; i < quantity; i++) {
      let ref: string
      let attempts = 0
      do {
        ref = generateReference(prefix)
        attempts++
      } while (
        (references.includes(ref) ||
          (await db.baggage.findUnique({ where: { reference: ref } }))) &&
        attempts < 10
      )
      references.push(ref)
    }

    // Create the baggage set with all baggages in a transaction
    const baggageSet = await db.baggageSet.create({
      data: {
        name,
        agencyId,
        quantity,
        prefix,
        baggages: {
          create: references.map((ref) => ({ reference: ref })),
        },
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
        baggages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ baggageSet }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/baggage-sets] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create baggage set' },
      { status: 500 }
    )
  }
}