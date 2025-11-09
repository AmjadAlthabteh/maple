import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getGmailAuthUrl } from '@/lib/email/gmail';
import { generateToken } from '@/lib/security/encryption';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await request.json();

    if (provider === 'gmail') {
      // Generate state token for CSRF protection
      const state = generateToken(16);

      // Store state in session or database for verification
      // In production, use Redis or database

      const authUrl = getGmailAuthUrl(state);

      return NextResponse.json({ authUrl, state });
    }

    if (provider === 'outlook') {
      // TODO: Implement Outlook OAuth
      return NextResponse.json(
        { error: 'Outlook integration coming soon' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize email connection' },
      { status: 500 }
    );
  }
}
