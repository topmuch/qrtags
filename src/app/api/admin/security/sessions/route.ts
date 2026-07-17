import { NextResponse } from 'next/server';
import { getActiveSessions } from '@/lib/session';
import { withAuthHandler } from '@/lib/auth-middleware';

/**
 * GET /api/admin/security/sessions
 * Get all active sessions
 */
async function getHandler() {
  try {
    const sessions = await getActiveSessions();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });