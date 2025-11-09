# Quick Start - Get Running in 5 Minutes

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment

Create a `.env` file:

```bash
# Copy the example
cp .env.example .env
```

For now, use these minimal settings (just paste into `.env`):

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database - we'll use a simple free cloud database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_support

# Redis - we'll use a simple free cloud option
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-change-in-production-min-32-chars

# Claude AI - GET YOUR KEY FROM: https://console.anthropic.com
ANTHROPIC_API_KEY=your-key-here

# Encryption (generate with: openssl rand -base64 32 | cut -c1-32)
ENCRYPTION_KEY=12345678901234567890123456789012

# Optional for now - can skip Gmail/Stripe initially
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

## Step 3: Start Database & Redis (Easy Option)

### Option A: Use Docker (Easiest)
```bash
docker-compose up -d postgres redis
```

### Option B: No Docker? Use Free Cloud Services

**For Database - Neon (Free):**
1. Go to https://neon.tech
2. Sign up (free)
3. Create database
4. Copy connection string to `DATABASE_URL` in `.env`

**For Redis - Upstash (Free):**
1. Go to https://upstash.com
2. Sign up (free)
3. Create Redis database
4. Copy connection string to `REDIS_URL` in `.env`

## Step 4: Set Up Database Tables

```bash
npm run db:push
```

## Step 5: Run the App!

```bash
npm run dev
```

## Step 6: Open in Browser

Go to: http://localhost:3000

You should see the beautiful landing page!

## Step 7: Create an Account

1. Click "Get Started" or "Sign Up"
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Organization: My Company
   - Password: password123
3. Click "Create Account"
4. You'll be redirected to login
5. Login with your credentials

## What You Can Do Now

### Without Gmail/Stripe Setup:
- ✅ View the landing page
- ✅ Create an account
- ✅ Login to dashboard
- ✅ See the UI
- ❌ Can't connect email yet (need Google OAuth)
- ❌ Can't test payments (need Stripe)

### To Test AI Responses:
You'll need an Anthropic API key:
1. Go to https://console.anthropic.com
2. Sign up
3. Get API key
4. Add to `.env` as `ANTHROPIC_API_KEY`
5. Restart server

## Common Issues

### "Cannot connect to database"
- If using Docker: `docker-compose up -d postgres`
- Check if PostgreSQL is running: `docker ps`
- Or use Neon.tech free tier

### "Cannot connect to Redis"
- If using Docker: `docker-compose up -d redis`
- Check if Redis is running: `docker ps`
- Or use Upstash.com free tier

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### Port 3000 already in use
```bash
# Kill the process
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

## Next Steps

Once running:
1. Explore the landing page
2. Create an account
3. Login to dashboard
4. Check out the UI

Then we can set up:
- Gmail integration (to receive real emails)
- Stripe (for payment testing)
- AI features (with Anthropic key)
