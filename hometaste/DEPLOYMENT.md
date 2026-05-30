# HomeTaste Full Deployment Guide

**Status**: Code complete ✅ | Tests passing ✅ | Ready for deployment

---

## Quick Start Checklist

- [ ] Part A: Winston logging fixed (silent: true added)
- [ ] Create/gather external account credentials (B1)
- [ ] Deploy backend to Railway (B3)
- [ ] Deploy web to Vercel (B4)
- [ ] Configure mobile environment (B5)
- [ ] Setup EAS builds (B6)
- [ ] Wire Stripe webhooks (B7)
- [ ] Configure push notifications (B8)
- [ ] Deploy admin to Vercel (B9)
- [ ] Add GitHub Actions secrets (B10)
- [ ] Run final verification checklist

---

## PART A: Winston Logging ✅

**Status**: COMPLETE
- Added `silent: true` to `backend/jest.config.mjs`
- Tests pass: 10 suites / 30 tests
- Console output minimal during test runs

---

## PART B: Full Deployment

### Prerequisites

You'll need accounts and credentials for:

1. **Supabase** (PostgreSQL)
   - Visit: https://supabase.com
   - Create project → Copy connection string

2. **Upstash** (Redis)
   - Visit: https://upstash.com
   - Create Redis database (EU region recommended)
   - Copy REST URL or redis:// connection string

3. **Cloudinary** (Image upload)
   - Visit: https://cloudinary.com
   - Create upload preset: `hometaste_uploads`
   - Copy: Cloud name, API key, API secret

4. **Stripe** (Payments)
   - Visit: https://dashboard.stripe.com (developers)
   - Create test API keys
   - Add webhook endpoint (URL: `https://YOUR_DOMAIN/api/payments/webhook`)
   - Copy: Secret key, Publishable key, Webhook secret

5. **iyzico** (Turkey payments - sandbox)
   - Visit: https://sandbox.iyzipay.com
   - Copy: API key, Secret key

6. **Resend** (Email)
   - Visit: https://resend.com
   - Create API key
   - Copy: API key (re_...)

7. **Expo** (Push notifications)
   - You already have account from mobile setup
   - Visit: https://expo.dev → Account Settings → Access Tokens
   - Copy: Token value

8. **Railway** (Backend hosting)
   - Visit: https://railway.app
   - Install CLI: `npm install -g @railway/cli`
   - Login: `railway login`

9. **Vercel** (Web hosting)
   - Visit: https://vercel.com
   - Install CLI: `npm install -g vercel`
   - Login: `vercel login`

---

### B2: Supabase Database Setup

```bash
# Set Supabase connection temporarily
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres"

# Run migrations
cd hometaste
pnpm --filter @hometaste/backend exec prisma migrate deploy

# Verify migrations
pnpm --filter @hometaste/backend exec prisma migrate status
```

Also, in Supabase SQL Editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

### B3: Deploy Backend to Railway

#### B3a: Initialize Railway

```bash
npm install -g @railway/cli
railway login
cd hometaste/backend
railway init
railway link
```

#### B3b: Create railway.json

✅ **ALREADY CREATED** at `backend/railway.json`

#### B3c: Health endpoint

✅ **ALREADY UPDATED** in `backend/src/app.ts`

#### B3d: Set Railway Environment Variables

```bash
# Core
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=warn

# Database (from Supabase)
railway variables set DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres"

# Redis (from Upstash)
railway variables set REDIS_URL="redis://default:PASSWORD@HOST:PORT"

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
railway variables set JWT_ACCESS_SECRET="<64-char-hex>"
railway variables set JWT_REFRESH_SECRET="<64-char-hex>"
railway variables set JWT_ACCESS_EXPIRY="15m"
railway variables set JWT_REFRESH_EXPIRY="30d"

# Cloudinary
railway variables set CLOUDINARY_CLOUD_NAME="your_cloud_name"
railway variables set CLOUDINARY_API_KEY="your_api_key"
railway variables set CLOUDINARY_API_SECRET="your_api_secret"
railway variables set CLOUDINARY_UPLOAD_PRESET="hometaste_uploads"

# Stripe
railway variables set STRIPE_SECRET_KEY="sk_test_..."
railway variables set STRIPE_PUBLISHABLE_KEY="pk_test_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."

# iyzico
railway variables set IYZICO_API_KEY="your_api_key"
railway variables set IYZICO_SECRET_KEY="your_secret_key"
railway variables set IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"

# Resend
railway variables set RESEND_API_KEY="re_..."
railway variables set RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Expo
railway variables set EXPO_ACCESS_TOKEN="your_expo_token"

# CORS (update after getting Vercel URL)
railway variables set CLIENT_ORIGIN="https://hometaste.vercel.app"
```

**IMPORTANT**: Do NOT set PORT as a variable. Railway assigns it automatically.

#### B3e: Deploy

```bash
cd hometaste/backend
railway up --detach

# Watch logs
railway logs --tail
```

#### B3f: Get Railway Domain

```bash
railway domain
# Output: hometaste-backend.up.railway.app (example)
```

Save this URL. You'll use it in web/mobile config.

**Verify:**
```bash
curl https://YOUR_RAILWAY_DOMAIN/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0","service":"hometaste-api"}
```

---

### B4: Deploy Web to Vercel

#### B4a: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### B4b: Create .env.production

File: `apps/web/.env.production`
```env
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=https://hometaste.vercel.app
NEXTAUTH_SECRET=<32-char-random>
NEXTAUTH_URL=https://hometaste.vercel.app
```

Generate NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### B4c: Deploy

```bash
cd apps/web
vercel --prod
```

When prompted:
- Project name: `hometaste-web`
- Framework: Next.js (auto)
- Root: `./`

#### B4d: Set Vercel Environment Variables

Go to: vercel.com → hometaste-web → Settings → Environment Variables

Add all variables from `.env.production`

#### B4e: Update Railway CORS

```bash
railway variables set CLIENT_ORIGIN="https://YOUR_VERCEL_DOMAIN"
```

**Verify:**
```bash
curl -I https://hometaste.vercel.app/en
# Expected: HTTP/2 200
```

---

### B5: Configure Mobile App

#### B5a: Create .env

File: `apps/mobile/.env`
```env
EXPO_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_APP_URL=https://hometaste.vercel.app
```

#### B5b: Create .env.production

File: `apps/mobile/.env.production`
```env
EXPO_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_APP_URL=https://hometaste.app
```

**Note**: Update pk_live_ when you have production Stripe keys.

#### B5c: Check API Client

✅ **ALREADY UPDATED** in `apps/mobile/services/api.ts`
- Uses `EXPO_PUBLIC_API_URL` environment variable
- Defaults to `http://localhost:4173`

---

### B6: EAS Build Setup

#### B6a: Login to EAS

```bash
cd apps/mobile
npx eas-cli login
npx eas-cli whoami
```

#### B6b: Initialize EAS

```bash
npx eas-cli init
# Answer "yes" to create project
# Project name: HomeTaste
```

#### B6c: Set EAS Secrets

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL \
  --value "https://YOUR_RAILWAY_DOMAIN"

eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY \
  --value "pk_test_..."
```

#### B6d: Build Android APK (Preview)

```bash
cd apps/mobile
eas build --platform android --profile preview
# Takes 10-20 minutes
# Follow QR code to install
```

#### B6e: Build iOS (Simulator)

```bash
eas build --platform ios --profile development
eas build:run --platform ios --latest
```

---

### B7: Stripe Webhook Setup

#### B7a: Verify Webhook Endpoint

File: `backend/src/routes/payments.routes.ts`

Must use raw body (already configured in `app.ts`):
```ts
app.use("/api/payments", express.raw({ type: "application/json" }), paymentsWebhookRouter);
app.use(express.json()); // AFTER webhook
```

#### B7b: Test with Stripe CLI

```bash
# Install: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to https://YOUR_RAILWAY_DOMAIN/api/payments/webhook

# In another terminal:
stripe trigger payment_intent.succeeded
```

Expected logs: `POST /api/payments/webhook 200`

---

### B8: Push Notifications Setup

✅ **NOTIFICATION SERVICE CREATED** at `backend/src/services/notification.service.ts`

The service is ready. When saving push tokens on login, call this service:

```ts
import { sendPushNotification } from '../services/notification.service.js';

// After order status update:
await sendPushNotification(
  userPushToken,
  'Order Updated',
  'Your order is being prepared...',
  { orderId }
);
```

---

### B9: Deploy Admin to Vercel

```bash
cd apps/admin
vercel --prod
```

Same process as B4 for web.

---

### B10: GitHub Actions Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions

Add:
```
VERCEL_TOKEN = (from vercel.com → Account → Tokens)
VERCEL_ORG_ID = (from vercel.com → Settings)
VERCEL_PROJECT_ID_WEB = (from vercel.com → web project → Settings)
VERCEL_PROJECT_ID_ADMIN = (from vercel.com → admin project → Settings)
RAILWAY_TOKEN = (from railway.app → Account → Tokens)
EXPO_TOKEN = (from expo.dev → Account → Access Tokens)
```

---

## Final Verification Checklist

### Code Quality
```bash
pnpm --filter @hometaste/backend test
# ✅ 10 suites / 30 tests

pnpm turbo check-types && pnpm turbo lint
# ✅ Zero errors
```

### Infrastructure
```bash
# Backend health
curl https://YOUR_RAILWAY_DOMAIN/health
# ✅ {"status":"ok",...}

# Web alive
curl -I https://hometaste.vercel.app/en
# ✅ HTTP/2 200

# Database
pnpm --filter @hometaste/backend exec prisma migrate status
# ✅ All migrations applied
```

### App Functionality (Manual Testing)

**Android APK:**
- [ ] Installs without error
- [ ] Welcome screen shows country selector
- [ ] Register new account
- [ ] Browse dishes loads from production backend
- [ ] Add item to cart → total updates
- [ ] Checkout with Stripe test card: `4242 4242 4242 4242`
- [ ] Order tracking shows PLACED status
- [ ] Push notification arrives on order status change
- [ ] Change language to Arabic → RTL layout works
- [ ] Change language to Turkish → text translates

**Web:**
- [ ] https://hometaste.vercel.app/en loads
- [ ] No console errors
- [ ] Can login with test account
- [ ] Browse works
- [ ] Cart persists across refresh

**Email:**
- [ ] Test email sent via Resend API
- [ ] Appears in inbox

**Payments:**
- [ ] Stripe test card accepted
- [ ] Webhook fires successfully
- [ ] Order marked as paid

---

## When Everything Is Live

1. **Update URLs in code** for production domains
2. **Switch Stripe to live mode** (sk_live_, pk_live_)
3. **Enable real iyzico** (not sandbox)
4. **Setup SSL certificates** (Vercel/Railway handle this)
5. **Configure real email domain** (Resend)
6. **Archive test data** from Supabase

---

## Troubleshooting

### Railway build fails
- Check logs: `railway logs --tail`
- Verify Node version in nixpacks.toml
- Ensure all env vars are set

### Web can't reach backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS on Railway (CLIENT_ORIGIN)
- Confirm Railway is running: `curl /health`

### Mobile build fails
- Check EAS logs
- Verify Node modules: `cd apps/mobile && npm ci`
- Try: `eas build --platform android --profile preview --clear-cache`

### Stripe webhook not firing
- Verify webhook URL in Stripe dashboard
- Check railway logs for POST requests
- Ensure raw body middleware is BEFORE express.json()

### Push notifications not arriving
- Verify EXPO_ACCESS_TOKEN is valid
- Check token is valid Expo token (not random)
- Ensure notification service is called on order status change

---

## Deployment Complete ✨

When all checkboxes are green, HomeTaste is live and ready for users!

For support, check logs on:
- Railway: `railway logs --tail`
- Vercel: vercel.com dashboard
- Expo: expo.dev/builds
