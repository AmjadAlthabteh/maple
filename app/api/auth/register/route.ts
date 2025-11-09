import { NextRequest, NextResponse } from 'next/server';
import { db, users, organizations } from '@/lib/db';
import { hashPassword } from '@/lib/security/encryption';
import { authRateLimiter, getRateLimitToken } from '@/lib/security/rate-limit';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const token = getRateLimitToken(request);
    const { success } = authRateLimiter.check(token);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, organizationName } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and organization in a transaction
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: 'user',
      })
      .returning();

    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: organizationName,
        ownerId: newUser.id,
        plan: 'starter',
        monthlyMessageLimit: 500,
        inboxLimit: 1,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        organization: {
          id: newOrg.id,
          name: newOrg.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
