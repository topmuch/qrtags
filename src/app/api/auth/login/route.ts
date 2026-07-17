import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, logLoginAttempt } from '@/lib/session';

// Role access matrix: which user.role can log in via which login context
const LOGIN_CONTEXT_ROLES: Record<string, string[]> = {
  admin: ['superadmin', 'admin', 'agent'],
  agency: ['agency', 'superadmin', 'admin', 'agent'],
  agent: ['superadmin', 'admin', 'agent'],
};

// Redirect URLs by role
function getRedirectUrl(role: string): string {
  switch (role) {
    case 'superadmin':
    case 'admin':
    case 'agent':
      return '/admin/tableau-de-bord';
    case 'agency':
      return '/agence/tableau-de-bord';
    default:
      return '/';
  }
}

export async function POST(request: NextRequest) {
  const { email, password, role: loginContext } = await request.json();

  try {
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        agency: true,
      },
    });

    if (!user) {
      await logLoginAttempt({
        email,
        success: false,
        failureReason: 'Utilisateur non trouvé',
      });

      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isValidPassword) {
      await logLoginAttempt({
        userId: user.id,
        email,
        success: false,
        failureReason: 'Mot de passe incorrect',
      });

      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Vérifier le contexte de connexion (rôle demandé vs rôle réel)
    const allowedRoles = LOGIN_CONTEXT_ROLES[loginContext];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      await logLoginAttempt({
        userId: user.id,
        email,
        success: false,
        failureReason: `Accès ${loginContext} non autorisé pour le rôle ${user.role}`,
      });

      return NextResponse.json(
        { error: 'Accès non autorisé - Vérifiez vos identifiants' },
        { status: 403 }
      );
    }

    // Créer une session sécurisée avec cookie HTTP-only
    await createSession(user.id);

    // Log successful login
    await logLoginAttempt({
      userId: user.id,
      email,
      success: true,
    });

    // Retourner les infos utilisateur (sans le mot de passe)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        agency: user.agency ? {
          id: user.agency.id,
          name: user.agency.name,
          slug: user.agency.slug,
          email: user.agency.email,
          phone: user.agency.phone,
          address: user.agency.address,
          agencyType: user.agency.agencyType,
          plan: user.agency.plan,
        } : null,
      },
      redirectUrl: getRedirectUrl(user.role),
    });
  } catch (error) {
    console.error('Login error:', error);

    await logLoginAttempt({
      email,
      success: false,
      failureReason: 'Erreur serveur',
    });

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}