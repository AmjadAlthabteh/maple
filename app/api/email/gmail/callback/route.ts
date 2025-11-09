import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getGmailTokens } from '@/lib/email/gmail';
import { db, emailAccounts } from '@/lib/db';
import { encrypt } from '@/lib/security/encryption';

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

    // TODO: Verify state token for CSRF protection

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

    // Get user's email from Google
    // In production, fetch this from Google API
    const email = user.email; // Simplified for now

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
