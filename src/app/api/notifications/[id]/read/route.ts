import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth-middleware';
import type { SessionUser } from '@/lib/session';
import { db } from '@/lib/db';

// POST - Mark notification as read
async function postHandler(request: NextRequest, _user: SessionUser) {
  try {
    // Extract notification ID from URL path: /api/notifications/[id]/read
    const pathname = request.nextUrl.pathname;
    const pathParts = pathname.split('/');
    const id = pathParts[3]; // /api/notifications/{id}/read

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await db.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuthHandler(postHandler);