import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import crypto from 'crypto'

// ─── Schemas ───────────────────────────────────────────────────────────────────

const createAgencySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  agencyType: z.string().optional().default('travel'),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional().default('#059669'),
  secondaryColor: z.string().optional().default('#F97316'),
  customMessage: z.string().optional(),
  plan: z.string().optional().default('free'),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return slug
}

async function uniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  const exists = await db.agency.findUnique({ where: { slug } })
  if (!exists) return slug
  // Append random 4-char hex suffix
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase()
  slug = `${baseSlug}-${suffix}`
  // Verify uniqueness again (extremely unlikely collision)
  const exists2 = await db.agency.findUnique({ where: { slug } })
  if (!exists2) return slug
  // Fallback: add timestamp
  return `${baseSlug}-${Date.now()}`
}

// ─── GET: List all agencies ────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const plan = searchParams.get('plan')

    const where: Record<string, unknown> = {}

    if (type) {
      where.agencyType = type
    }
    if (plan) {
      where.plan = plan
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const agencies = await db.agency.findMany({
      where,
      include: {
        _count: {
          select: {
            baggageSets: true,
            scanLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ agencies })
  } catch (error) {
    console.error('[GET /api/agencies] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    )
  }
}

// ─── POST: Create a new agency ─────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = createAgencySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Validate email uniqueness
    const existingEmail = await db.agency.findUnique({
      where: { email: data.email },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An agency with this email already exists' },
        { status: 400 }
      )
    }

    // Generate slug
    const baseSlug = generateSlug(data.name)
    const slug = await uniqueSlug(baseSlug)

    // Create agency (store password as plain text for demo)
    const agency = await db.agency.create({
      data: {
        name: data.name,
        slug,
        email: data.email,
        password: data.password,
        phone: data.phone ?? null,
        address: data.address ?? null,
        agencyType: data.agencyType,
        logoUrl: data.logoUrl ?? null,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        customMessage: data.customMessage ?? null,
        plan: data.plan,
      },
    })

    // Exclude password from response
    const { password: _pw, ...agencyWithoutPassword } = agency

    return NextResponse.json({ agency: agencyWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/agencies] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create agency' },
      { status: 500 }
    )
  }
}