# HomeTaste

Production monorepo for a homemade food marketplace.

```text
hometaste/
  apps/mobile   Expo React Native
  apps/web      Next.js customer web
  apps/admin    Next.js admin dashboard
  backend       Express + Prisma API
  packages/*    shared types, i18n, config, utilities
```

## Prerequisites

- Node.js 20.x
- pnpm 9.x
- Expo CLI and EAS CLI for mobile builds
- PostgreSQL 16, Redis, Cloudinary, Stripe, Resend credentials for production

## Setup

```bash
pnpm install
cp backend/.env.example backend/.env
pnpm --filter @hometaste/backend db:generate
```

## Run Locally

```bash
pnpm --filter @hometaste/backend dev
pnpm --filter @hometaste/mobile dev
pnpm --filter @hometaste/web dev
pnpm --filter @hometaste/admin dev
```

## Tests And Checks

```bash
pnpm turbo check-types
pnpm --filter @hometaste/backend test
pnpm turbo lint
```

## Environment Variables

Backend production requires `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IYZICO_*`, `RESEND_API_KEY`, `EXPO_ACCESS_TOKEN`, and `CLIENT_URL`.

Mobile uses `EXPO_PUBLIC_API_URL`. Web uses `BACKEND_URL`.

## Build Mobile

```bash
cd apps/mobile
eas build --platform android --profile preview
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Deploy

- Backend: connect `backend` service to Railway and set production env vars.
- Web: connect `apps/web` to Vercel with `BACKEND_URL`.
- Mobile: use EAS profiles in `apps/mobile/eas.json`.

## Add A New Language

1. Add `packages/i18n/src/translations/es.json`.
2. Match the `en.json` namespace structure.
3. Add locale routing/UI exposure when you want it visible in apps.

## Database Migrations

```bash
pnpm --filter @hometaste/backend db:migrate
pnpm --filter @hometaste/backend db:generate
```

## Troubleshooting

- Node engine warning: install/use Node 20.x.
- Stripe card form: set real publishable and secret keys.
- EAS asset warnings: replace placeholder assets with final 1024px icon and splash artwork.
