# Database Setup - Get Maple Running!

## Option 1: Quick Cloud Setup (5 minutes, FREE)

### Neon - Serverless PostgreSQL (Recommended)

1. **Go to** https://neon.tech
2. **Sign up** with GitHub/Google (free, no credit card)
3. **Create a project** named "maple"
4. **Copy the connection string** (looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`)
5. **Paste it in your `.env` file:**
   ```
   DATABASE_URL=postgresql://user:pass@...
   ```

### Upstash - Redis (FREE)

1. **Go to** https://upstash.com
2. **Sign up** (free, no credit card)
3. **Create Redis database**
4. **Copy connection string**
5. **Paste in `.env`:**
   ```
   REDIS_URL=redis://...
   ```

## Option 2: Docker (If you have Docker installed)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Your .env is already configured for this!
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_support
REDIS_URL=redis://localhost:6379
```

## Option 3: Local PostgreSQL (If you have it installed)

```bash
# Create database
psql -U postgres
CREATE DATABASE maple;
\q

# Update .env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/maple
```

## After Setting Up Database

1. **Run migrations:**
   ```bash
   npm run db:push
   ```

2. **Restart the server** (Ctrl+C then `npm run dev`)

3. **Go to** http://localhost:3001

4. **Click "Get Started"** and create your account!

## That's It!

You can now:
- ✅ Create an account
- ✅ Login to dashboard
- ✅ See conversations
- ✅ Use all features

## Need Help?

If using Neon (cloud):
- Free tier: 0.5GB storage, 10GB transfer
- No credit card needed
- Takes 2 minutes to set up
- Just copy/paste the connection string!

Most people choose Neon - it's the easiest option!
