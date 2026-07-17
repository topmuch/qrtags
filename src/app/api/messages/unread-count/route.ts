import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth-middleware';
import type { SessionUser } from '@/lib/session';
import { db } from '@/lib/db';

// Unread messages count for notifications
async function getHandler(_request: NextRequest, _user: SessionUser) {
  try {
    const count = await db.message.count({
      where: { status: 'non_lu' },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ count: 0 });
  }
}

export const GET = withAuthHandler(getHandler);