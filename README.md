# Odyssey

A polished restaurant operations dashboard built with the Odyssey fullstack stack.

---

## Tech stack

- **Frontend:** `apps/dashboard` — Expo + React Native Web
- **Backend:** `services/backend` — Hono on Cloudflare Workers compatible runtime
- **Database:** PostgreSQL
- **ORM / schema:** Drizzle ORM + `drizzle-zod`
- **API contracts:** Zod → OpenAPI → Orval generated client
- **Data fetching:** React Query
- **Shared packages:** `packages/shared`, `packages/types`, `packages/api-client`

---

## Quick start

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d
pnpm seed
pnpm gen:contract
pnpm dev
```

If you want to start the backend and dashboard separately:

```bash
pnpm dev:backend
pnpm dev:dashboard
```

### Local defaults

- Backend: `http://127.0.0.1:8787`
- Dashboard: Expo web address shown in terminal

---

## Available scripts

| Script | Description |
|---|---|
| `pnpm dev` | Run backend + dashboard in parallel via Turborepo |
| `pnpm dev:dashboard` | Start Expo dashboard web app |
| `pnpm dev:backend` | Start Hono API locally |
| `pnpm dev:backend:worker` | Start Cloudflare Workers compatible backend |
| `pnpm gen:contract` | Regenerate OpenAPI & Orval client |
| `pnpm seed` | Reset and seed PostgreSQL |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm test` | Run backend + dashboard tests |

---

## Features

- Dashboard pages: **Overview**, **Orders**, **Menu**, **Customers**, **Settings**, **UI Library**
- Backend state machine with deliberate order actions: `accept`, `prepare`, `ready`, `complete`, `cancel`
- Menu categories and items management
- Customer list with order history and spend data
- Settings persistence for prep time, auto accept, service availability, and opening hours
- Summary KPIs for daily orders, revenue, pending orders, popular items, and recent orders
- Design system tokens, reusable UI primitives, skeleton loading, status feedback, and modal flows

---

## Architecture notes

- **Contract-first API**
  - Drizzle schema defines persisted data
  - `api-schemas.ts` defines shared request/response Zod schemas
  - `services/backend/scripts/generate-openapi.ts` generates `openapi.json`
  - Orval generates `packages/api-client/src/generated/index.ts`
  - Frontend uses generated React Query hooks from `@odyssey/api-client`

- **Clean frontend structure**
  - `AppShell` manages navigation and layout
  - Pages remain thin and use shared hooks/components
  - Reusable primitives are in `apps/dashboard/components/ui-primitives.tsx`
  - Tokens are centralized in `packages/shared/src/tokens.ts`

- **Backend behavior**
  - Business rules live in `services/backend/src/lib/order-rules.ts`
  - SQL persistence is handled via `postgres.js` with safe query interpolation
  - Backend validation uses `@hono/zod-validator`
  - The API exposes typed error responses and 422 for invalid flows

---

## Notes & tradeoffs

- Native mobile is supported by Expo, but the UI is optimized for web review.
- Authentication is intentionally omitted for focus and scope.
- The backend includes both raw SQL and Drizzle schema definitions; the schema remains the source of truth.

---

## Validation commands

```bash
curl http://127.0.0.1:8787/health
curl http://127.0.0.1:8787/orders
curl "http://127.0.0.1:8787/orders?status=pending"
curl http://127.0.0.1:8787/categories
curl http://127.0.0.1:8787/summary
curl -X POST http://127.0.0.1:8787/orders/1/accept
```

---

## Project structure

```text
apps/dashboard          Expo + React Native Web
services/backend        Hono API, PostgreSQL, seed + OpenAPI generation
packages/shared         Design tokens and UI tokens
packages/types          Shared domain labels
packages/api-client     Orval-generated API client/hooks
```
