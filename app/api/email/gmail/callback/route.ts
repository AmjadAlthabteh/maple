import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getGmailTokens, getGmailUserEmail } from '@/lib/email/gmail';
import { db, emailAccounts } from '@/lib/db';
import { encrypt } from '@/lib/security/encryption';

// In-memory state store (for development only - use Redis in production)
// TODO: Replace with Redis for production: https://github.com/vercel/next.js/discussions/48954
const stateStore = new Map<string, { userId: string; timestamp: number }>();
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Clean up expired states periodically
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.timestamp > STATE_EXPIRY_MS) {
      stateStore.delete(state);
    }
  }
}, 60 * 1000); // Clean every minute

export function storeState(state: string, userId: string): void {
  stateStore.set(state, { userId, timestamp: Date.now() });
}

function verifyState(state: string, userId: string): boolean {
  const stored = stateStore.get(state);
  if (!stored) return false;

  const isValid = stored.userId === userId && Date.now() - stored.timestamp < STATE_EXPIRY_MS;
  if (isValid) {
    stateStore.delete(state); // Single-use token
  }
  return isValid;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=no_code', request.url)
      );
    }

    if (!state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_state', request.url)
      );
    }

    // Verify state token for CSRF protection
    if (!verifyState(state, session.user.id)) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getGmailTokens(code);

    // Get organization
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=user_not_found', request.url)
      );
    }

    const org = await db.query.organizations.findFirst({
      where: (organizations, { eq }) => eq(organizations.ownerId, user.id),
    });

    if (!org) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=org_not_found', request.url)
      );
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.accessToken);
    const encryptedRefreshToken = encrypt(tokens.refreshToken);

    // Get the actual Gmail email address from Google API
    const email = await getGmailUserEmail(tokens.accessToken);

    // Save email account
    await db.insert(emailAccounts).values({
      organizationId: org.id,
      email,
      provider: 'gmail',
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt: new Date(tokens.expiryDate),
      isActive: true,
    });

    return NextResponse.redirect(
      new URL('/dashboard/settings?success=email_connected', request.url)
    );
  } catch (error) {
    console.error('Gmail callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=callback_failed', request.url)
    );
  }
}
