import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import crypto from 'crypto'

// ─── Context params helper ─────────────────────────────────────────────────────

interface RouteParams {
  params: Promise<{ id: string }>
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

const updateAgencySchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  agencyType: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  customMessage: z.string().nullable().optional(),
  plan: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function uniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const where = excludeId
    ? { slug: baseSlug, id: { not: excludeId } }
    : { slug: baseSlug }
  const exists = await db.agency.findFirst({ where })
  if (!exists) return baseSlug
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${baseSlug}-${suffix}`
}

// ─── GET: Single agency by ID ──────────────────────────────────────────────────

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const agency = await db.agency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            baggageSets: true,
            scanLogs: true,
          },
        },
      },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Exclude password from response
    const { password: _pw, ...agencyWithoutPassword } = agency

    return NextResponse.json({ agency: agencyWithoutPassword })
  } catch (error) {
    console.error('[GET /api/agencies/:id] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agency' },
      { status: 500 }
    )
  }
}

// ─── PUT: Update agency ────────────────────────────────────────────────────────

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check agency exists
    const existing = await db.agency.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateAgencySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // If email is being updated, check uniqueness
    if (data.email && data.email !== existing.email) {
      const emailTaken = await db.agency.findUnique({
        where: { email: data.email },
      })
      if (emailTaken) {
        return NextResponse.json(
          { error: 'An agency with this email already exists' },
          { status: 400 }
        )
      }
    }

    // If name is being updated, regenerate slug
    let slug: string | undefined
    if (data.name && data.name !== existing.name) {
      const baseSlug = generateSlug(data.name)
      slug = await uniqueSlug(baseSlug, id)
    }

    const updateData: Record<string, unknown> = { ...data }
    if (slug) {
      updateData.slug = slug
    }
    // Handle nullable fields explicitly
    if ('phone' in data) updateData.phone = data.phone
    if ('address' in data) updateData.address = data.address
    if ('logoUrl' in data) updateData.logoUrl = data.logoUrl
    if ('customMessage' in data) updateData.customMessage = data.customMessage

    const agency = await db.agency.update({
      where: { id },
      data: updateData,
    })

    const { password: _pw, ...agencyWithoutPassword } = agency

    return NextResponse.json({ agency: agencyWithoutPassword })
  } catch (error) {
    console.error('[PUT /api/agencies/:id] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update agency' },
      { status: 500 }
    )
  }
}

// ─── DELETE: Delete agency (cascades) ──────────────────────────────────────────

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await db.agency.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    await db.agency.delete({ where: { id } })

    return NextResponse.json({ message: 'Agency deleted successfully' })
  } catch (error) {
    console.error('[DELETE /api/agencies/:id] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete agency' },
      { status: 500 }
    )
  }
}