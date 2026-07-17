import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuthHandler } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

// GET - Get lead details with observations
async function getHandler(
  request: NextRequest,
  _params: unknown,
  _user: unknown
) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // .../leads/[id] => get [id]
    
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true }
        },
        observations: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });

  } catch (error) {
    console.error('Get lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update lead
async function putHandler(
  request: NextRequest,
  _params: unknown,
  _user: unknown
) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2];

    const body = await request.json();
    const { status, assignedToId, notes, company, phone, email, name } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    if (notes !== undefined) updateData.notes = notes;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({ lead });

  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });
export const PUT = withAuthHandler(putHandler, { requiredRole: 'superadmin' });