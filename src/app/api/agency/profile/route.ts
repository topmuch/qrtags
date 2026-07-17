import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth-middleware';
import type { SessionUser } from '@/lib/session';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - Fetch agency profile (uses user's agencyId)
async function getHandler(request: NextRequest, user: SessionUser) {
  try {
    const agencyId = user.agencyId;
    if (!agencyId) {
      return NextResponse.json(
        { error: 'Aucune agence associée à ce compte' },
        { status: 400 }
      );
    }

    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true,
        name: true,
        slug: true,
        agencyType: true,
        email: true,
        phone: true,
        address: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        customMessage: true,
        active: true,
        plan: true,
        onboardingCompleted: true,
        maxTags: true,
        tagsUsed: true,
        createdAt: true,
      },
    });

    if (!agency) {
      return NextResponse.json(
        { error: 'Agence non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agency });

  } catch (error) {
    console.error('Error fetching agency profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

// PUT - Update agency profile or change password
async function putHandler(request: NextRequest, user: SessionUser) {
  try {
    const body = await request.json();
    const agencyId = user.agencyId;

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Aucune agence associée à ce compte' },
        { status: 400 }
      );
    }

    // Password change flow
    if (body.currentPassword && body.newPassword) {
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!confirmPassword) {
        return NextResponse.json({ error: 'Confirmez le nouveau mot de passe' }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
      }

      // Verify current password
      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (!dbUser?.password) {
        return NextResponse.json({ error: 'Aucun mot de passe défini' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
      }

      // Hash and save new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ success: true, message: 'Mot de passe mis à jour' });
    }

    // Profile update flow
    const { name, email, phone, address } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;

    const agency = await db.agency.update({
      where: { id: agencyId },
      data: updateData,
    });

    return NextResponse.json({ success: true, agency });

  } catch (error) {
    console.error('Error updating agency profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler);
export const PUT = withAuthHandler(putHandler);