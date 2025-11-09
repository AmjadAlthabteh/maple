# AI Customer Support Platform

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Transform your customer support with AI-powered email responses. Built with Claude AI, Next.js, and modern web technologies.

## Overview

An intelligent customer support platform that uses Claude AI to read, understand, and draft personalized responses to customer emails. Perfect for solo founders, small startups, and freelancers who need professional customer support without the enterprise price tag.

### Key Features

- **AI-Powered Responses**: Claude AI analyzes customer emails and drafts personalized responses in your brand voice
- **Multi-Inbox Support**: Connect Gmail, Outlook, or custom email addresses
- **Knowledge Base**: Automatically builds and learns from every interaction
- **Real-time Updates**: Instant notifications for new messages using WebSocket
- **Brand Voice Learning**: AI adapts to your specific communication style
- **Team Collaboration**: Multiple team members can review and approve AI responses
- **Analytics Dashboard**: Track response times, customer satisfaction, and AI performance

## Pricing Tiers

| Plan | Price | Inboxes | AI Messages | Features |
|------|-------|---------|-------------|----------|
| **Starter** | $30/mo | 1 | 500/mo | Perfect for solo founders |
| **Pro** | $79/mo | 5 | 2,000/mo | For small teams |
| **Business** | $149/mo | Unlimited | Unlimited | Growing companies |

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Socket.io Client** - Real-time updates

### Backend
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Main database (via Drizzle ORM)
- **Redis** - Caching and real-time features
- **BullMQ** - Background job processing

### AI & Integration
- **Claude API** (claude-sonnet-4-20250514) - AI intelligence layer
- **Gmail API** - Gmail integration
- **Microsoft Graph** - Outlook integration
- **Stripe** - Payment processing

### DevOps
- **Vercel** - Frontend deployment
- **Railway/Render** - Backend services
- **GitHub Actions** - CI/CD pipeline

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Anthropic API key
- Google Cloud Console project (for Gmail)
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd maple_speed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_URL` - Redis connection string
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - Configure Stripe, Google, and Microsoft credentials

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
maple_speed/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── landing/             # Landing page components
│   └── dashboard/           # Dashboard components
├── lib/                     # Utility libraries
│   ├── db/                  # Database schema & client
│   ├── ai/                  # Claude AI integration
│   ├── email/               # Email integration
│   ├── stripe/              # Stripe integration
│   └── utils/               # Helper functions
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── config/                  # Configuration files
```

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `organizations` - Team/organization management
- `email_accounts` - Connected email accounts (Gmail/Outlook)
- `conversations` - Customer conversation threads
- `messages` - Individual messages in conversations
- `ai_responses` - AI-generated response drafts
- `knowledge_base` - Learned information and FAQs
- `subscriptions` - Stripe subscription data

## API Routes

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Email Integration
- `POST /api/email/connect` - Connect email account
- `GET /api/email/accounts` - List connected accounts
- `POST /api/email/sync` - Sync emails
- `POST /api/email/webhook` - Gmail/Outlook webhook

### Conversations
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations/:id/respond` - Send response

### AI
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/learn` - Add to knowledge base
- `GET /api/ai/suggestions` - Get response suggestions

### Subscriptions
- `POST /api/stripe/create-checkout` - Create Stripe checkout
- `POST /api/stripe/webhook` - Stripe webhook
- `GET /api/stripe/portal` - Customer portal

## Security Features

### Authentication & Authorization
- NextAuth.js for secure authentication
- JWT tokens with HTTP-only cookies
- Role-based access control (RBAC)
- Session management with Redis

### Data Protection
- Encryption at rest for sensitive data
- API key encryption using AES-256
- Email tokens encrypted before storage
- HTTPS-only in production

### API Security
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries
- XSS protection

### Email Security
- OAuth 2.0 for email account connections
- Webhook signature verification
- Token refresh handling
- Secure credential storage

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables
- `ANTHROPIC_API_KEY` - Claude AI API key
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `NEXTAUTH_SECRET` - Auth secret key
- `STRIPE_SECRET_KEY` - Stripe secret
- `ENCRYPTION_KEY` - Data encryption key

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Railway/Render (Backend Services)
1. Create PostgreSQL database
2. Create Redis instance
3. Configure environment variables
4. Deploy worker processes for BullMQ

### Database Migrations
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Apply to database
```

## Development

### Code Quality
```bash
npm run lint          # ESLint
npm run type-check    # TypeScript
```

### Database Management
```bash
npm run db:studio     # Drizzle Studio UI
```

## Testing

### Local Testing with Gmail
1. Create Google Cloud Console project
2. Enable Gmail API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add test users in Google Console
6. Use ngrok for webhook testing: `ngrok http 3000`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [Your docs URL]
- Issues: GitHub Issues
- Email: support@yourapp.com

## Roadmap

- [ ] Slack integration
- [ ] WhatsApp Business API
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Custom AI training on brand data
- [ ] Sentiment analysis
- [ ] Auto-categorization of tickets
- [ ] SLA tracking and alerts

## Acknowledgments

- Claude AI by Anthropic
- Next.js team at Vercel
- Open source community

---

Built with ❤️ for founders who deserve better customer support tools.
