import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuthHandler } from '@/lib/auth-middleware';

/**
 * GET /api/admin/security/logs
 * Get login audit logs
 */
async function getHandler() {
  try {
    // Get login logs from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const logs = await db.loginLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });