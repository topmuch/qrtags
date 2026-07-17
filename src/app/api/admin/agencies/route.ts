import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sendEmail, getEmailSettings, getNewAgencyEmailTemplate } from '@/lib/email';
import { withAuthHandler } from '@/lib/auth-middleware';

// Validation schema
const agencySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  agencyType: z.enum(['travel', 'hotel', 'bus', 'school', 'medical', 'company', 'event']).optional().default('travel'),
  logoUrl: z.string().optional().or(z.literal('')),
  primaryColor: z.string().default('#2563EB'),
  secondaryColor: z.string().default('#F97316'),
  customMessage: z.string().optional().or(z.literal('')),
});

// GET - List all agencies
async function getHandler(_request: NextRequest) {
  try {
    const agencies = await db.agency.findMany({
      include: {
        _count: {
          select: { baggages: true, users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ agencies });

  } catch (error) {
    console.error('Get agencies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new agency
async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = agencySchema.parse(body);

    // Check if slug already exists
    const existing = await db.agency.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const agency = await db.agency.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        agencyType: validatedData.agencyType,
        logoUrl: validatedData.logoUrl || null,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        customMessage: validatedData.customMessage || null,
      }
    });

    // 📧 Send email notification to superadmin
    try {
      const emailSettings = await getEmailSettings();
      if (emailSettings) {
        const recipientEmail = emailSettings.recipientEmail || emailSettings.fromEmail;
        if (recipientEmail) {
          const template = getNewAgencyEmailTemplate({
            name: agency.name,
            agencyType: agency.agencyType,
            email: agency.email || undefined,
            phone: agency.phone || undefined,
            address: agency.address || undefined,
          });

          await sendEmail({
            to: recipientEmail,
            subject: `🏢 Nouvelle agence créée — ${agency.name}`,
            html: template.html,
            text: template.text,
            type: 'new_agency',
          });
          console.log(`📧 New agency notification sent for ${agency.name} to ${recipientEmail}`);
        }
      }
    } catch (emailError) {
      console.error('Failed to send new agency email:', emailError);
    }

    // 🔔 Create in-app notification for SuperAdmin
    await db.notification.create({
      data: {
        type: 'new_agency',
        message: `🏢 Nouvelle agence créée : ${agency.name}${agency.email ? ` (${agency.email})` : ''}`,
        read: false,
      }
    });

    return NextResponse.json({ agency });

  } catch (error) {
    console.error('Create agency error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update agency
async function putHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, active, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    // Validate only the fields that are present
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.agencyType !== undefined) updateData.agencyType = data.agencyType;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null;
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updateData.secondaryColor = data.secondaryColor;
    if (data.customMessage !== undefined) updateData.customMessage = data.customMessage || null;
    if (active !== undefined) updateData.active = active;

    // Check slug uniqueness if slug is being updated
    if (data.slug) {
      const existingWithSlug = await db.agency.findFirst({
        where: { slug: data.slug, NOT: { id } }
      });
      if (existingWithSlug) {
        return NextResponse.json(
          { error: 'Ce slug est déjà utilisé par une autre agence' },
          { status: 400 }
        );
      }
    }

    const agency = await db.agency.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ agency });

  } catch (error) {
    console.error('Update agency error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete agency
async function deleteHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    await db.agency.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete agency error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });
export const POST = withAuthHandler(postHandler, { requiredRole: 'superadmin' });
export const PUT = withAuthHandler(putHandler, { requiredRole: 'superadmin' });
export const DELETE = withAuthHandler(deleteHandler, { requiredRole: 'superadmin' });