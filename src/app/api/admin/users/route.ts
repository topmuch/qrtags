import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { withAuthHandler } from '@/lib/auth-middleware';
import { SessionUser } from '@/lib/session';

// Validation schema
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['superadmin', 'admin', 'agent', 'agency']),
  agencyId: z.string().optional(),
});

// Password hashing with bcrypt (compatible with login API)
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// GET - List all users
async function getHandler(_request: NextRequest, _user: SessionUser) {
  try {
    const users = await db.user.findMany({
      include: { agency: true },
      orderBy: { createdAt: 'desc' }
    });

    // Remove passwords from response
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json({ users: safeUsers });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user
async function postHandler(request: NextRequest, _user: SessionUser) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name || null,
        password: hashedPassword,
        role: validatedData.role,
        agencyId: validatedData.agencyId || null,
      }
    });

    // Remove password from response
    const { password, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
async function putHandler(request: NextRequest, _user: SessionUser) {
  try {
    const body = await request.json();
    const { id, password, ...data } = body;

    const updateData: Record<string, unknown> = { ...data };
    
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
async function deleteHandler(request: NextRequest, _user: SessionUser) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuthHandler(getHandler, { requiredRole: 'superadmin' });
export const POST = withAuthHandler(postHandler, { requiredRole: 'superadmin' });
export const PUT = withAuthHandler(putHandler, { requiredRole: 'superadmin' });
export const DELETE = withAuthHandler(deleteHandler, { requiredRole: 'superadmin' });