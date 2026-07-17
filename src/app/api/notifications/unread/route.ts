import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth-middleware';
import type { SessionUser } from '@/lib/session';
import { db } from '@/lib/db';

// GET - Fetch unread notifications for SuperAdmin
async function getHandler(_request: NextRequest, _user: SessionUser) {
  try {
    // Get all unread notifications (broadcast to superadmins)
    const notifications = await db.notification.findMany({
      where: {
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler);