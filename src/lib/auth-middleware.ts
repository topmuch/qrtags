import { NextRequest, NextResponse } from 'next/server';
import { getSession, SessionUser } from '@/lib/session';

// Roles that can access /api/admin routes
const ADMIN_ALLOWED_ROLES = ['superadmin', 'admin', 'agent'];
// Roles that can access /api/agency routes
const AGENCY_ALLOWED_ROLES = ['agency', 'superadmin', 'admin', 'agent'];

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/api/admin',
  '/api/agency',
  '/api/baggage',
  '/api/reports',
  '/api/notifications',
  '/api/messages',
  '/api/qrcodes',
  '/api/scans',
  '/api/voyageurs',
  '/api/dashboard',
];

// Routes that require specific roles
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  '/api/admin': ADMIN_ALLOWED_ROLES,
  '/api/agency': AGENCY_ALLOWED_ROLES,
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth',
  '/api/scan',
  '/api/activate',
  '/api/detect-country',
  '/api/cron',
  '/api/init-demo',
  '/api/seed',
  '/api/suivi',
  '/api/blog',
  '/api/agencies',
  '/api/baggage-status',
  '/api/checklist',
  '/api/advertisements/track',
  '/api/landing',
  '/api/baggage-sets',
  '/api/agency-types',
];

/**
 * Check if a route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get required roles for a route
 */
function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_RESTRICTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Check if user has an allowed role
 */
function hasAllowedRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Higher-order function to wrap API route handlers with auth
 *
 * Usage:
 * export const GET = withAuthHandler(async (request, user) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ data: '...' });
 * }, { requiredRoles: ['superadmin', 'admin'] });
 */
export function withAuthHandler(
  handler: (request: NextRequest, user: SessionUser) => Promise<NextResponse>,
  options?: { requiredRoles?: string[]; allowPublic?: boolean }
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;

    // If explicitly marked as public, pass null user
    if (options?.allowPublic && !isProtectedRoute(pathname)) {
      return handler(request, null as unknown as SessionUser);
    }

    // Skip auth for non-protected routes
    if (!isProtectedRoute(pathname)) {
      return handler(request, null as unknown as SessionUser);
    }

    try {
      const user = await getSession();

      if (!user) {
        return NextResponse.json(
          { error: 'Non autorisé - Connexion requise' },
          { status: 401 }
        );
      }

      // Check role restrictions
      const requiredRoles = options?.requiredRoles || getRequiredRoles(pathname);
      if (requiredRoles && !hasAllowedRole(user.role, requiredRoles)) {
        return NextResponse.json(
          { error: 'Accès interdit - Permissions insuffisantes' },
          { status: 403 }
        );
      }

      return handler(request, user);
    } catch (error) {
      console.error('Auth handler error:', error);
      return NextResponse.json(
        { error: "Erreur d'authentification" },
        { status: 500 }
      );
    }
  };
}

/**
 * Utility to get current user in API routes
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

/**
 * Utility to require authentication in API routes
 */
export async function requireAuthApi(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Utility to require one of specific roles
 */
export async function requireRolesApi(roles: string[]): Promise<SessionUser> {
  const user = await requireAuthApi();
  if (!roles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/**
 * Legacy compat — single role version
 */
export async function requireRoleApi(role: string): Promise<SessionUser> {
  return requireRolesApi([role]);
}