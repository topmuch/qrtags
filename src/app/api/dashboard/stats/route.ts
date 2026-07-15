import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [
      totalAgencies,
      activeAgencies,
      totalBaggageSets,
      totalQRCodes,
      totalScans,
      scansToday,
      agenciesByTypeData,
      recentScans,
    ] = await Promise.all([
      db.agency.count(),
      db.agency.count({ where: { isActive: true } }),
      db.baggageSet.count(),
      db.baggage.count(),
      db.scanLog.count(),
      db.scanLog.count({
        where: {
          scannedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      db.agency.groupBy({
        by: ['agencyType'],
        _count: true,
      }),
      db.scanLog.findMany({
        take: 10,
        orderBy: { scannedAt: 'desc' },
        include: {
          baggage: { select: { reference: true } },
          agency: { select: { name: true } },
        },
      }),
    ])

    const agenciesByType: Record<string, number> = {}
    for (const item of agenciesByTypeData) {
      agenciesByType[item.agencyType] = item._count
    }

    return NextResponse.json({
      totalAgencies,
      activeAgencies,
      totalBaggageSets,
      totalQRCodes,
      totalScans,
      scansToday,
      agenciesByType,
      recentScans,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}