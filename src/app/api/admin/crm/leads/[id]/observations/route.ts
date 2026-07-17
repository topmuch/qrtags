import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuthHandler } from '@/lib/auth-middleware';
import { SessionUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

// POST - Add observation to lead
async function postHandler(request: NextRequest, _user: SessionUser) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 3]; // .../leads/[id]/observations => get [id]
    
    const body = await request.json();
    const { type, content, date, userId } = body;

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // Create observation
    const observation = await db.observation.create({
      data: {
        leadId: id,
        type,
        content,
        date: date ? new Date(date) : new Date(),
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({ observation });

  } catch (error) {
    console.error('Create observation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Get observations for lead
async function getHandler(request: NextRequest, _user: SessionUser) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 3]; // .../leads/[id]/observations => get [id]
    
    const observations = await db.observation.findMany({
      where: { leadId: id },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ observations });

  } catch (error) {
    console.error('Get observations error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const POST = withAuthHandler(postHandler, { requiredRole: 'superadmin' });
export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });