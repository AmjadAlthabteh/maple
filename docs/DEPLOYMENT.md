# Deployment Guide

## Overview

This guide covers deploying the AI Customer Support Platform to production.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ database
- Redis 6+ instance
- Anthropic API key
- Stripe account
- Google Cloud Console project (for Gmail integration)
- Domain name (optional but recommended)

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**

   In Vercel dashboard, add all environment variables from `.env.example`:
   - Database URL (from Railway/Neon/Supabase)
   - Redis URL (from Upstash/Redis Cloud)
   - All API keys and secrets

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Docker Compose (Full Stack)

1. **Create `.env` file**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**
   ```bash
   docker-compose exec app npm run db:push
   ```

### Option 3: Railway

1. **Create new project**
   - Go to https://railway.app
   - Create new project from GitHub

2. **Add services**
   - PostgreSQL (from Railway marketplace)
   - Redis (from Railway marketplace)
   - Web service (your app)

3. **Configure environment variables**
   - Add all required env vars in Railway dashboard

4. **Deploy**
   - Railway automatically deploys on git push

## Database Setup

### Using Neon (Serverless PostgreSQL)

1. Create account at https://neon.tech
2. Create new database
3. Copy connection string
4. Update `DATABASE_URL` in environment variables

### Using Supabase

1. Create account at https://supabase.com
2. Create new project
3. Get database connection string
4. Update `DATABASE_URL` in environment variables

### Running Migrations

```bash
npm run db:push
```

## Redis Setup

### Using Upstash

1. Create account at https://upstash.com
2. Create new Redis database
3. Copy Redis URL
4. Update `REDIS_URL` in environment variables

### Using Redis Cloud

1. Create account at https://redis.com
2. Create new subscription
3. Copy connection string
4. Update `REDIS_URL` in environment variables

## API Keys Configuration

### Anthropic Claude API

1. Get API key from https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY` environment variable

### Google OAuth (Gmail Integration)

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/email/gmail/callback`
6. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Stripe

1. Get keys from https://dashboard.stripe.com
2. Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`
3. Create webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
4. Set `STRIPE_WEBHOOK_SECRET`

### Create Stripe Products

```bash
# Using Stripe CLI
stripe products create --name "Starter Plan" --description "Perfect for solo founders"
stripe prices create --product <PRODUCT_ID> --unit-amount 3000 --currency usd --recurring interval=month

# Repeat for Pro and Business plans
```

## Security Configuration

### Generate Encryption Key

```bash
openssl rand -base64 32
```

Set as `ENCRYPTION_KEY` environment variable.

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Set as `NEXTAUTH_SECRET` environment variable.

### Configure CORS

Update `next.config.js` for production domains:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        ],
      },
    ];
  },
};
```

## Domain Configuration

1. **Add custom domain in Vercel/Railway**
2. **Update environment variables**
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
   - `NEXTAUTH_URL=https://yourdomain.com`
3. **Update OAuth redirect URIs**
4. **Update Stripe webhook URL**

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] SSL certificate active
- [ ] OAuth redirect URIs updated
- [ ] Stripe webhooks configured
- [ ] Test user registration
- [ ] Test email connection (Gmail)
- [ ] Test AI response generation
- [ ] Test Stripe checkout
- [ ] Set up monitoring (see below)

## Monitoring & Logging

### Vercel

- Built-in analytics in Vercel dashboard
- Add Vercel Log Drains for external logging

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Uptime Monitoring

- Use UptimeRobot or Pingdom
- Monitor endpoints:
  - `https://yourdomain.com/api/health`
  - `https://yourdomain.com`

## Backup Strategy

### Database Backups

**Automated (Recommended):**
- Enable automated backups in database provider
- Neon: automatic
- Supabase: configure in dashboard

**Manual:**
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Environment Variables

Store securely in password manager or secrets manager (AWS Secrets Manager, 1Password, etc.)

## Scaling

### Database

- Use connection pooling (PgBouncer)
- Enable read replicas for heavy read workloads
- Consider Neon's autoscaling

### Application

- Vercel: automatic scaling
- Railway: configure scaling in dashboard
- Docker: use orchestration (Kubernetes, Docker Swarm)

### Redis

- Use Redis cluster for high availability
- Enable persistence for important data

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
1. Runs tests on push
2. Type checks
3. Lints code
4. Deploys to production on main branch

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check connection pool
# Increase max connections if needed
```

### Redis Connection Issues

```bash
# Test connection
redis-cli -u $REDIS_URL ping
```

### Webhook Issues

- Verify webhook signatures
- Check webhook logs in Stripe dashboard
- Use ngrok for local testing: `ngrok http 3000`

### Build Failures

- Check environment variables
- Verify Node.js version (18+)
- Clear build cache and retry

## Support

For deployment support:
- Email: support@yourapp.com
- Documentation: https://docs.yourapp.com
- GitHub Issues: https://github.com/yourorg/ai-support/issues
