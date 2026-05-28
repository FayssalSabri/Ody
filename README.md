# Odyssey Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/React%20Native-0DB7ED?style=for-the-badge&logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/Hono-111827?style=for-the-badge" alt="Hono">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle-2E8B57?style=for-the-badge" alt="Drizzle">
  <img src="https://img.shields.io/badge/drizzle--zod-7A3E9A?style=for-the-badge" alt="drizzle-zod">
  <img src="https://img.shields.io/badge/Zod-000000?style=for-the-badge" alt="Zod">
  <img src="https://img.shields.io/badge/OpenAPI-F7B500?style=for-the-badge" alt="OpenAPI">
  <img src="https://img.shields.io/badge/Orval-009688?style=for-the-badge" alt="Orval">
  <img src="https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="React Query">
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm">
  <img src="https://img.shields.io/badge/Turborepo-000000?style=for-the-badge" alt="Turborepo">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

A polished, production-ready restaurant operations dashboard built using the Odyssey fullstack architecture. Designed to meet strict engineering constraints, it enforces strong API contracts and features a highly decoupled, modular frontend.

---

## Architecture & Technical Highlights

This project implements a **contract-first, type-safe fullstack architecture**:

- **Strict Contracts**: The backend exposes Drizzle schemas mapped to Zod validators. These generate an OpenAPI spec (`openapi.json`), which Orval consumes to automatically generate React Query hooks (`packages/api-client`). This guarantees end-to-end type safety.
- **Server-Side Validation**: Business logic is heavily protected on the backend. Order totals are recalculated server-side, and status transitions (e.g., `pending` -> `preparing`) are enforced by a strict state machine. Invalid actions return `422 Unprocessable Entity`.
- **Decoupled Frontend**: UI logic is strictly separated from component presentation. Complex local states (e.g., form validation, order drafts) have been extracted into dedicated custom hooks (`useCreateOrderFlow`, `useMenuForm`).
- **Premium Design System**: The app uses a scalable design system (`packages/shared/src/tokens.ts`) with custom semantic tokens, refined elevation shadows for web, and elegant transitions.
- **Monorepo Structure**: Managed via Turborepo and pnpm workspaces for fast, isolated builds and shared package consumption.

---

## Tech Stack

- **Frontend:** `apps/dashboard` — Expo + React Native Web
- **Backend:** `services/backend` — Hono (Cloudflare Workers compatible)
- **Database:** PostgreSQL
- **ORM & Schema:** Drizzle ORM + `drizzle-zod`
- **API Contracts:** Zod → OpenAPI → Orval generated client
- **Data Fetching:** React Query
- **Shared Packages:** `packages/shared`, `packages/types`, `packages/api-client`

---

## Quick Start

Ensure you have Docker and pnpm installed, then run the following commands:

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d
pnpm seed
pnpm gen:contract
pnpm dev
```

If you prefer to start the backend and dashboard in separate terminal tabs:

```bash
pnpm dev:backend
pnpm dev:dashboard
```

### Local Development Endpoints
- **Backend**: `http://127.0.0.1:8787`
- **Dashboard**: Expo will output the local web address in your terminal.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run backend + dashboard in parallel via Turborepo |
| `pnpm dev:dashboard` | Start the Expo dashboard web app |
| `pnpm dev:backend` | Start the Hono API locally |
| `pnpm dev:backend:worker` | Start Cloudflare Workers compatible backend |
| `pnpm gen:contract` | Regenerate OpenAPI spec & Orval client hooks |
| `pnpm seed` | Reset and seed the PostgreSQL database |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | Run TypeScript compilation checks across all packages |
| `pnpm test` | Run backend + dashboard tests |

---

## Features

- **Operations Dashboard**: View high-level KPIs, active orders, and revenue insights.
- **Order Management System**: Strict kitchen workflows with deliberate order actions (`accept`, `prepare`, `ready`, `complete`, `cancel`).
- **Menu & Catalog**: Form-driven creation and management of menu categories and items.
- **CRM Integration**: Detailed customer profiles, order history, and spend analytics.
- **System Settings**: Configurable prep times, auto-accept toggles, and business hours.
- **UI Component Library**: A dedicated `/ui-library` route showcasing the design system tokens, typography scales, spacing tokens, and reusable primitives.

---

## Design & Engineering Decisions

1. **Why React Native Web + Expo?** 
   While the UI is heavily optimized for desktop web review, using Expo allows for an immediate transition to native iOS/Android applications without rewriting the presentation layer.
2. **Why Hono?**
   Hono provides an extremely fast, lightweight web framework that natively supports Edge runtimes (like Cloudflare Workers) while integrating flawlessly with Zod for runtime validation.
3. **No Authentication?**
   Authentication and authorization layers have been intentionally omitted to focus purely on the architectural flow (Data -> API -> UI) and design implementation for the scope of this assignment.

---

## Validation & Testing

You can manually interact with the API to verify the backend state machine and persistence logic:

```bash
curl http://127.0.0.1:8787/health
curl http://127.0.0.1:8787/orders
curl "http://127.0.0.1:8787/orders?status=pending"
curl http://127.0.0.1:8787/categories
curl http://127.0.0.1:8787/summary
curl -X POST http://127.0.0.1:8787/orders/1/accept
```

## Project Layout

```text
apps/dashboard          Expo + React Native Web (Frontend)
services/backend        Hono API, PostgreSQL connection, DB seeding
packages/shared         Design tokens and UI constants
packages/types          Shared domain definitions and types
packages/api-client     Orval-generated API client and React Query hooks
```
