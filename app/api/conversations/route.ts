import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      with: {
        organizations: true,
      },
    });

    if (!user?.organizations?.[0]) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgId = user.organizations[0].id;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Fetch conversations
    let query = db.query.conversations.findMany({
      where: (conversations, { eq, and }) => {
        const conditions = [eq(conversations.organizationId, orgId)];
        if (status) {
          conditions.push(eq(conversations.status, status));
        }
        return and(...conditions);
      },
      with: {
        messages: {
          orderBy: (messages, { desc }) => [desc(messages.createdAt)],
          limit: 1,
        },
        emailAccount: true,
      },
      orderBy: (conversations) => [desc(conversations.lastMessageAt)],
      limit,
    });

    const conversations = await query;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
