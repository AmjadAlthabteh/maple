# Getting Started Guide

Welcome to the AI Customer Support Platform! This guide will help you get up and running quickly.

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd maple_speed
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```bash
# Generate a secure secret for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Generate encryption key (must be exactly 32 characters)
ENCRYPTION_KEY=$(openssl rand -base64 32 | cut -c1-32)

# Database (use local PostgreSQL or cloud provider)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_support

# Redis (use local Redis or cloud provider)
REDIS_URL=redis://localhost:6379

# Claude API key (get from https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 4. Set Up Database

Start PostgreSQL (if using Docker):

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_support -p 5432:5432 -d postgres:15
```

Run migrations:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Initial Setup

### 1. Create Your Account

1. Navigate to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Fill in your details:
   - Name
   - Email
   - Organization name
   - Password (min 8 characters)
4. Click "Create Account"

### 2. Connect Email Account (Gmail)

Before connecting Gmail, you need to set up Google OAuth:

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/email/gmail/callback`
5. Copy Client ID and Client Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
6. Restart your dev server

Now connect your Gmail:

1. Go to Dashboard → Settings → Email Accounts
2. Click "Connect Gmail"
3. Authorize the application
4. You'll be redirected back to the dashboard

### 3. Set Up Stripe (Optional for Testing)

For subscription testing:

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from https://dashboard.stripe.com/test/apikeys
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Create test products in Stripe:
   ```bash
   # Install Stripe CLI: https://stripe.com/docs/stripe-cli

   # Create products
   stripe products create --name "Starter Plan" --description "500 AI messages/month"
   stripe prices create --product prod_xxx --unit-amount 3000 --currency usd --recurring interval=month

   # Copy price IDs to .env
   STRIPE_PRICE_STARTER=price_xxx
   ```
5. Set up webhook:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # Copy webhook secret to .env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

## First Conversation

### Testing AI Response Generation

Since you likely don't have real customer emails yet, here's how to test:

1. **Manually add a test conversation** (via database):

```sql
-- Connect to your database
psql $DATABASE_URL

-- Insert a test conversation (replace UUIDs with your actual IDs)
INSERT INTO conversations (id, organization_id, email_account_id, customer_email, customer_name, subject, status)
VALUES (
  gen_random_uuid(),
  'your-org-id',
  'your-email-account-id',
  'customer@test.com',
  'Test Customer',
  'Help with product',
  'open'
);

-- Insert a test message
INSERT INTO messages (id, conversation_id, from_email, to_email, subject, body, is_inbound)
VALUES (
  gen_random_uuid(),
  'conversation-id-from-above',
  'customer@test.com',
  'support@yourcompany.com',
  'Help with product',
  'Hi, I need help understanding how to use feature X. Can you explain?',
  true
);
```

2. **Generate AI Response**:
   - Go to Dashboard → Conversations
   - Click on the test conversation
   - Click "Generate AI Response"
   - Review the AI-generated response
   - Edit if needed and send

## Customizing Brand Voice

1. Go to Dashboard → Settings
2. Find "Brand Voice" section
3. Add guidelines like:
   ```
   We use a friendly, professional tone.
   Always address customers by name.
   Keep responses concise and actionable.
   End with "Let us know if you need anything else!"
   ```
4. Save settings
5. AI responses will now follow your brand voice

## Building Knowledge Base

### Manual Entry

1. Go to Dashboard → Knowledge Base
2. Click "Add Entry"
3. Fill in:
   - Question: "How do I reset my password?"
   - Answer: "Click on 'Forgot Password' on the login page..."
   - Category: "Account"
   - Tags: password, account, security
4. Save

### Learning from Conversations

The AI automatically suggests knowledge base entries based on conversations. Review and approve them in the Knowledge Base section.

## Understanding Your Dashboard

### Conversations View
- **Open**: New inquiries needing attention
- **Pending**: Awaiting customer response
- **Resolved**: Completed conversations
- **Archived**: Old conversations

### Analytics
- Response times
- Customer satisfaction
- AI confidence scores
- Usage metrics

### Settings
- Email accounts
- Brand voice
- Team members (coming soon)
- Subscription management

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make your changes

3. Test locally:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

### Database Changes

When modifying the schema:

1. Edit `lib/db/schema.ts`
2. Generate migration:
   ```bash
   npm run db:generate
   ```
3. Apply migration:
   ```bash
   npm run db:push
   ```

### Viewing Database

Use Drizzle Studio for a visual database editor:

```bash
npm run db:studio
```

Visit https://local.drizzle.studio

## Common Issues

### Database Connection Failed

- Ensure PostgreSQL is running
- Check `DATABASE_URL` is correct
- Test connection: `psql $DATABASE_URL`

### Redis Connection Failed

- Ensure Redis is running
- Check `REDIS_URL` is correct
- Test connection: `redis-cli -u $REDIS_URL ping`

### OAuth Errors

- Verify redirect URIs match exactly
- Ensure credentials are correct
- Check OAuth consent screen is configured

### AI Generation Fails

- Verify `ANTHROPIC_API_KEY` is set
- Check API key is valid
- Review API usage limits

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## Next Steps

1. **Read the docs**:
   - [API Documentation](./API.md)
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Security Policy](../SECURITY.md)

2. **Explore the code**:
   - `/app` - Next.js pages and API routes
   - `/lib` - Utility libraries and integrations
   - `/components` - React components

3. **Join the community**:
   - GitHub Discussions
   - Discord server (coming soon)

4. **Deploy to production**:
   - Follow [Deployment Guide](./DEPLOYMENT.md)
   - Set up monitoring
   - Configure backups

## Support

Need help?
- Email: support@yourapp.com
- GitHub Issues: https://github.com/yourorg/ai-support/issues
- Documentation: https://docs.yourapp.com

Happy building! 🚀
