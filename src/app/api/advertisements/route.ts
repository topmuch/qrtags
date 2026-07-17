import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET - Get active advertisements for current user/agency
export async function GET(req: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ advertisements: [] });
    }

    return NextResponse.json({
      advertisements: await getAdvertisements(user),
    });
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    return NextResponse.json({ advertisements: [] });
  }
}

async function getAdvertisements(user: { id: string; role: string; agencyId: string | null }) {
  const now = new Date();

  const allAds = await db.advertisement.findMany({
    where: {
      status: 'active',
      startDate: { lte: now },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 10,
  });

  const advertisements = allAds
    .filter((ad) => {
      if (ad.endDate && new Date(ad.endDate) < now) {
        return false;
      }

      if (ad.targetScope === 'all') {
        return true;
      }

      if (ad.targetScope === 'agency' && ad.agencyId === user.agencyId) {
        return true;
      }

      if (ad.targetScope === 'agents' && user.role === 'agent') {
        return true;
      }

      return false;
    })
    .slice(0, 5);

  return advertisements;
}