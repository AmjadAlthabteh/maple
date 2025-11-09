import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

export interface GenerateResponseParams {
  customerMessage: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  brandVoice?: string;
  knowledgeContext?: string[];
  customerName?: string;
}

export interface GenerateResponseResult {
  response: string;
  confidence: number;
  usedKnowledgeBase: boolean;
  suggestedTone: string;
}

/**
 * Generates an AI response to a customer message using Claude
 */
export async function generateResponse({
  customerMessage,
  conversationHistory = [],
  brandVoice,
  knowledgeContext,
  customerName,
}: GenerateResponseParams): Promise<GenerateResponseResult> {
  try {
    // Build the system prompt
    const systemPrompt = buildSystemPrompt(brandVoice, knowledgeContext);

    // Build the conversation messages
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...conversationHistory,
      {
        role: 'user',
        content: customerMessage,
      },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Analyze the response for confidence and tone
    const analysis = await analyzeResponse(responseText, customerMessage);

    return {
      response: responseText,
      confidence: analysis.confidence,
      usedKnowledgeBase: (knowledgeContext?.length || 0) > 0,
      suggestedTone: analysis.tone,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Builds the system prompt for Claude
 */
function buildSystemPrompt(brandVoice?: string, knowledgeContext?: string[]): string {
  let prompt = `You are an AI customer support assistant. Your role is to help draft professional, empathetic, and helpful responses to customer emails.

Key guidelines:
- Be professional but friendly and approachable
- Show empathy and understanding for customer concerns
- Provide clear, actionable solutions
- Keep responses concise but complete
- Use proper grammar and spelling
- Sign off appropriately for business communication`;

  if (brandVoice) {
    prompt += `\n\nBrand Voice Guidelines:\n${brandVoice}`;
  }

  if (knowledgeContext && knowledgeContext.length > 0) {
    prompt += `\n\nRelevant Knowledge Base Information:\n${knowledgeContext.join('\n\n')}`;
    prompt += `\n\nUse the knowledge base information above to provide accurate and specific answers when relevant.`;
  }

  return prompt;
}

/**
 * Analyzes the generated response for confidence and tone with advanced scoring
 */
async function analyzeResponse(
  response: string,
  originalMessage: string,
  knowledgeBaseUsed: boolean = false
): Promise<{ confidence: number; tone: string; reasoning: string }> {
  try {
    const analysisPrompt = `Analyze this customer support response in detail:

Original customer message: "${originalMessage}"

AI Response: "${response}"

Evaluate the following factors:
1. Completeness: Does it fully address the customer's question? (0-100)
2. Accuracy: Is the information specific and actionable? (0-100)
3. Clarity: Is it clear and easy to understand? (0-100)
4. Professionalism: Is the tone appropriate? (0-100)
5. Uncertainty indicators: Does it contain phrases like "I'm not sure", "maybe", "possibly" that reduce confidence?

Calculate an overall confidence score (0-100) considering all factors.
Higher scores for:
- Complete, specific answers
- Clear action steps
- No hedging language
${knowledgeBaseUsed ? '- Response uses verified knowledge base information (+10 bonus)' : ''}

Lower scores for:
- Vague or generic responses
- Uncertainty phrases
- Incomplete answers
- Off-topic responses

Also identify the tone (professional, friendly, empathetic, formal, casual).

Respond in JSON format: {"confidence": number, "tone": string, "reasoning": "brief explanation"}`;

    const analysis = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: analysisPrompt }],
    });

    const analysisText = analysis.content[0].type === 'text'
      ? analysis.content[0].text
      : '{"confidence": 70, "tone": "professional", "reasoning": "Default scoring"}';

    const parsed = JSON.parse(analysisText);

    // Apply knowledge base bonus
    let finalConfidence = Math.min(100, Math.max(0, parsed.confidence || 70));

    // Penalty for very short responses (likely incomplete)
    if (response.length < 100) {
      finalConfidence = Math.max(0, finalConfidence - 15);
    }

    // Penalty for uncertainty keywords
    const uncertaintyKeywords = ['not sure', 'maybe', 'possibly', 'might be', 'i think', 'uncertain'];
    const hasUncertainty = uncertaintyKeywords.some(keyword =>
      response.toLowerCase().includes(keyword)
    );
    if (hasUncertainty) {
      finalConfidence = Math.max(0, finalConfidence - 20);
    }

    return {
      confidence: Math.round(finalConfidence),
      tone: parsed.tone || 'professional',
      reasoning: parsed.reasoning || 'Analysis completed',
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { confidence: 60, tone: 'professional', reasoning: 'Error in analysis, using default score' };
  }
}

/**
 * Extracts key information from a customer message
 */
export async function extractMessageIntent(message: string): Promise<{
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
  category?: string;
}> {
  try {
    const prompt = `Analyze this customer support message and extract:
1. Primary intent (what does the customer want?)
2. Sentiment (positive, neutral, or negative)
3. Urgency level (low, medium, or high)
4. Category (billing, technical, general inquiry, feature request, complaint, etc.)

Message: "${message}"

Respond in JSON format: {"intent": string, "sentiment": string, "urgency": string, "category": string}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);

    return {
      intent: parsed.intent || 'General inquiry',
      sentiment: parsed.sentiment || 'neutral',
      urgency: parsed.urgency || 'medium',
      category: parsed.category,
    };
  } catch (error) {
    console.error('Intent extraction error:', error);
    return {
      intent: 'General inquiry',
      sentiment: 'neutral',
      urgency: 'medium',
    };
  }
}

/**
 * Generates knowledge base entries from conversation history
 */
export async function generateKnowledgeBaseEntry(
  question: string,
  answer: string
): Promise<{ question: string; answer: string; category: string; tags: string[] }> {
  try {
    const prompt = `Given this customer question and answer, create a knowledge base entry:

Question: "${question}"
Answer: "${answer}"

Provide:
1. A generalized version of the question (remove specific details)
2. A clear, concise answer
3. A category for this entry
4. 3-5 relevant tags

Respond in JSON format: {"question": string, "answer": string, "category": string, "tags": string[]}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);

    return {
      question: parsed.question || question,
      answer: parsed.answer || answer,
      category: parsed.category || 'General',
      tags: parsed.tags || [],
    };
  } catch (error) {
    console.error('Knowledge base generation error:', error);
    return {
      question,
      answer,
      category: 'General',
      tags: [],
    };
  }
}
