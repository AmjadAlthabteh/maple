import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db';
import { generateResponse } from '@/lib/ai/claude';
import { apiRateLimiter, getRateLimitToken } from '@/lib/security/rate-limit';
import { z } from 'zod';

const generateSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const token = getRateLimitToken(request);
    const { success, remaining } = apiRateLimiter.check(token);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = generateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { conversationId, messageId } = validationResult.data;

    // Get conversation with messages
    const conversation = await db.query.conversations.findFirst({
      where: (conversations, { eq }) => eq(conversations.id, conversationId),
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        },
        organization: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get the specific message
    const targetMessage = conversation.messages.find((m) => m.id === messageId);

    if (!targetMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Build conversation history
    const conversationHistory = conversation.messages
      .filter((m) => m.createdAt < targetMessage.createdAt)
      .map((m) => ({
        role: m.isInbound ? ('user' as const) : ('assistant' as const),
        content: m.body,
      }));

    // Get relevant knowledge base entries
    const knowledgeEntries = await db.query.knowledgeBase.findMany({
      where: (kb, { eq, and }) =>
        and(
          eq(kb.organizationId, conversation.organizationId),
          eq(kb.isActive, true)
        ),
      limit: 5,
    });

    const knowledgeContext = knowledgeEntries.map(
      (entry) => `Q: ${entry.question}\nA: ${entry.answer}`
    );

    // Generate AI response
    const result = await generateResponse({
      customerMessage: targetMessage.body,
      conversationHistory,
      brandVoice: conversation.organization.brandVoice || undefined,
      knowledgeContext,
      customerName: conversation.customerName || undefined,
    });

    // Save AI response
    const [aiResponse] = await db
      .insert(db.schema.aiResponses)
      .values({
        conversationId: conversation.id,
        messageId: targetMessage.id,
        generatedResponse: result.response,
        status: 'ready',
        confidence: result.confidence,
        suggestedTone: result.suggestedTone,
        usedKnowledgeBase: result.usedKnowledgeBase,
      })
      .returning();

    return NextResponse.json({
      aiResponse,
      remaining,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
