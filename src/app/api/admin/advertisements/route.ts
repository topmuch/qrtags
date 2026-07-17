import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuthHandler } from '@/lib/auth-middleware';
import { SessionUser } from '@/lib/session';

// GET - List all advertisements
async function getHandler(request: NextRequest, _user: SessionUser) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const targetScope = searchParams.get('targetScope');
    const agencyId = searchParams.get('agencyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (targetScope && targetScope !== 'all') {
      where.targetScope = targetScope;
    }
    if (agencyId && agencyId !== 'all') {
      where.agencyId = agencyId;
    }

    // Get total count
    const total = await db.advertisement.count({ where });

    // Get advertisements
    const advertisements = await db.advertisement.findMany({
      where,
      include: {
        _count: {
          select: { adImpressions: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    });

    // Get agencies for reference
    const agencies = await db.agency.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      advertisements,
      agencies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des publicités' },
      { status: 500 }
    );
  }
}

// POST - Create new advertisement
async function postHandler(request: NextRequest, _user: SessionUser) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      linkTarget,
      position,
      targetScope,
      agencyId,
      startDate,
      endDate,
      status,
      priority
    } = body;

    // Validation
    if (!title || !imageUrl || !startDate) {
      return NextResponse.json(
        { error: 'Titre, image et date de début requis' },
        { status: 400 }
      );
    }

    if (targetScope === 'agency' && !agencyId) {
      return NextResponse.json(
        { error: 'Une agence doit être sélectionnée pour le ciblage par agence' },
        { status: 400 }
      );
    }

    // Create advertisement
    const advertisement = await db.advertisement.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        linkTarget: linkTarget || '_blank',
        position: position || 'footer',
        targetScope: targetScope || 'all',
        agencyId: targetScope === 'agency' ? agencyId : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'draft',
        priority: parseInt(String(priority)) || 0
      }
    });

    return NextResponse.json({ success: true, advertisement });

  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la publicité: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update advertisement
async function putHandler(request: NextRequest, _user: SessionUser) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      imageUrl,
      linkUrl,
      linkTarget,
      position,
      targetScope,
      agencyId,
      startDate,
      endDate,
      status,
      priority
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la publicité requis' },
        { status: 400 }
      );
    }

    // Check if advertisement exists
    const existing = await db.advertisement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Publicité non trouvée' },
        { status: 404 }
      );
    }

    // Update advertisement
    const advertisement = await db.advertisement.update({
      where: { id },
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        linkTarget: linkTarget || '_blank',
        position: position || 'footer',
        targetScope: targetScope || 'all',
        agencyId: targetScope === 'agency' ? agencyId : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        priority: parseInt(String(priority)) || 0
      }
    });

    return NextResponse.json({ success: true, advertisement });

  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la publicité' },
      { status: 500 }
    );
  }
}

// DELETE - Delete advertisement
async function deleteHandler(request: NextRequest, _user: SessionUser) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la publicité requis' },
        { status: 400 }
      );
    }

    // Delete advertisement (cascade will delete impressions)
    await db.advertisement.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la publicité' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });
export const POST = withAuthHandler(postHandler, { requiredRole: 'superadmin' });
export const PUT = withAuthHandler(putHandler, { requiredRole: 'superadmin' });
export const DELETE = withAuthHandler(deleteHandler, { requiredRole: 'superadmin' });