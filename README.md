# Demo Co. - SvelteKit Full-Stack Application

A production-grade marketing site + authenticated dashboard built with SvelteKit, TypeScript, and Tailwind CSS.

## Stack

- **Framework**: SvelteKit 2 (Svelte 5 runes)
- **Language**: TypeScript 6
- **Styling**: Tailwind CSS v4 with design tokens + dark mode
- **Validation**: Zod (shared client + server)
- **Testing**: Vitest (unit) + Playwright (E2E + a11y + visual regression)
- **CI**: GitHub Actions (lint → typecheck → unit → build → E2E → Lighthouse → bundle-size)

## Quick Start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Demo Login Credentials

| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Admin  | admin@demo.test    | demo1234  |
| Editor | editor@demo.test   | demo1234  |
| Viewer | viewer@demo.test   | demo1234  |

## Routes

### Public Surface (Edge)

| Route            | Strategy | Description |
|------------------|----------|-------------|
| `/` → `/{locale}` | SSG      | Redirects based on Accept-Language, then landing page |
| `/{locale}/`      | SSG      | Landing page (hero, features, pricing, social proof) |
| `/{locale}/blog`  | SSG + cursor load-more | Blog listing, first page pre-rendered |
| `/{locale}/blog/[slug]` | SSG | Individual article with JSON-LD |
| `/{locale}/search` | SSR (Edge) | Full-text search with URL-roundtripped filters |
| `/404`            | Static   | Custom not-found page |

### Authenticated Surface (Node)

| Route                              | Strategy       | Description |
|------------------------------------|----------------|-------------|
| `/{locale}/login`                  | SSR (Node)     | Sign-in with shared Zod validation |
| `/{locale}/dashboard`              | SSR (Node)     | Stats overview (total budget, active campaigns) |
| `/{locale}/dashboard/campaigns`    | SSR + Streamed | Data table with inline edit, optimistic UI |

## Tests

```bash
# Unit tests
npm run test:unit

# E2E tests (requires build first)
npm run build
npm run test:e2e

# All checks
npm run lint
npm run check
npm run size
```

## CI

Every push/PR runs: lint → svelte-check → tsc --noEmit → unit tests → build → Playwright E2E → Lighthouse CI → size-limit.

## Edge / Node Runtime Split

| Runtime | Routes | Rationale |
|---------|--------|-----------|
| **Edge** | Public (`/`, `/blog`, `/blog/[slug]`, `/search`) | Lowest cold-start latency, CDN distribution, no Node deps |
| **Node** | Auth (`/login`), Dashboard (`/dashboard/*`) | Cookie signing, session Map, streaming SSR, form actions |
