# API Documentation

## Overview

The AI Customer Support Platform provides a RESTful API for managing conversations, generating AI responses, and integrating with email providers.

## Authentication

All API routes (except public routes) require authentication using NextAuth.js sessions.

```typescript
// Example: Making an authenticated request
const response = await fetch('/api/conversations', {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include session cookies
});
```

## API Routes

### Authentication

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "organizationName": "Acme Inc"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "organization": {
    "id": "uuid",
    "name": "Acme Inc"
  }
}
```

#### POST `/api/auth/signin`

Sign in with email and password (handled by NextAuth.js).

### Conversations

#### GET `/api/conversations`

List all conversations for the authenticated user's organization.

**Query Parameters:**
- `status` (optional): Filter by status (open, pending, resolved, archived)
- `limit` (optional): Maximum number of results (default: 50)

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "customerEmail": "customer@example.com",
      "customerName": "Jane Smith",
      "subject": "Need help with billing",
      "status": "open",
      "lastMessageAt": "2024-01-15T10:30:00Z",
      "messages": [
        {
          "id": "uuid",
          "body": "I have a question about my invoice",
          "isInbound": true,
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

#### GET `/api/conversations/:id`

Get details of a specific conversation.

**Response:**
```json
{
  "conversation": {
    "id": "uuid",
    "customerEmail": "customer@example.com",
    "subject": "Need help with billing",
    "messages": [...],
    "aiResponses": [...]
  }
}
```

### AI Response Generation

#### POST `/api/ai/generate-response`

Generate an AI response for a customer message.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "messageId": "uuid"
}
```

**Response:**
```json
{
  "aiResponse": {
    "id": "uuid",
    "generatedResponse": "Thank you for reaching out...",
    "confidence": 85,
    "suggestedTone": "professional",
    "usedKnowledgeBase": true,
    "status": "ready"
  },
  "remaining": 95
}
```

### Email Integration

#### POST `/api/email/connect`

Initialize email provider connection (Gmail or Outlook).

**Request Body:**
```json
{
  "provider": "gmail"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "random-state-token"
}
```

#### GET `/api/email/gmail/callback`

OAuth callback for Gmail integration (automatically handled).

#### GET `/api/email/accounts`

List all connected email accounts.

**Response:**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "email": "support@company.com",
      "provider": "gmail",
      "isActive": true,
      "lastSyncAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### POST `/api/email/sync`

Manually trigger email synchronization.

**Request Body:**
```json
{
  "accountId": "uuid"
}
```

### Stripe Integration

#### POST `/api/stripe/create-checkout`

Create a Stripe checkout session for subscription.

**Request Body:**
```json
{
  "plan": "pro"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### POST `/api/stripe/webhook`

Stripe webhook endpoint for subscription events (automatically handled).

#### POST `/api/stripe/portal`

Create a Stripe customer portal session.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Knowledge Base

#### GET `/api/knowledge`

List knowledge base entries.

**Query Parameters:**
- `category` (optional): Filter by category
- `active` (optional): Filter by active status

#### POST `/api/knowledge`

Create a new knowledge base entry.

**Request Body:**
```json
{
  "question": "How do I reset my password?",
  "answer": "To reset your password, click...",
  "category": "account",
  "tags": ["password", "security", "account"]
}
```

#### PUT `/api/knowledge/:id`

Update a knowledge base entry.

#### DELETE `/api/knowledge/:id`

Delete a knowledge base entry.

## Rate Limiting

API routes are rate limited to prevent abuse:

- **General API routes**: 100 requests per 15 minutes
- **Authentication routes**: 5 requests per minute

When rate limited, the API returns:

```json
{
  "error": "Too many requests. Please try again later."
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Webhooks

### Gmail Push Notifications

Configure Gmail push notifications to receive real-time updates:

1. Set up Google Cloud Pub/Sub topic
2. Subscribe to `/api/email/webhook/gmail`
3. Verify webhook endpoint

### Stripe Webhooks

Configure Stripe webhook for subscription events:

1. Add webhook endpoint: `https://yourapp.com/api/stripe/webhook`
2. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize API client
class AISupport {
  constructor(private baseUrl: string) {}

  async getConversations(status?: string) {
    const params = new URLSearchParams(status ? { status } : {});
    const response = await fetch(`${this.baseUrl}/api/conversations?${params}`, {
      credentials: 'include',
    });
    return response.json();
  }

  async generateResponse(conversationId: string, messageId: string) {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId, messageId }),
    });
    return response.json();
  }
}

// Usage
const client = new AISupport('https://yourapp.com');
const conversations = await client.getConversations('open');
```

## Versioning

The API is currently at version 1. Future versions will be accessed via `/api/v2/...` etc.

## Support

For API support, contact: support@yourapp.com
