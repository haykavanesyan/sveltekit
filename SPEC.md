# Implementation Plan

## 1. Architecture Overview

### Runtime Split

| Surface | Runtime | Platform Target | Rationale |
|---------|---------|-----------------|-----------|
| Public (`/`, `/blog`, `/blog/[slug]`) | Edge | Vercel Edge | Lowest cold-start latency globally, CDN distribution, no Node deps needed |
| Public dynamic (`/search`) | Edge | Vercel Edge | Query-param-driven but still public; edge keeps TTFB low |
| Auth (`/login`) | Node | Vercel (Serverless) | Cookie signing, session Map, crypto — these need the Node stdlib |
| Dashboard (`/dashboard`, `/dashboard/items`) | Node | Vercel (Serverless) | Streaming SSR needs Node streams; form actions with file writes need fs |

**Edge vs Node justification:**
- *Public routes on Edge*: No per-request state, no fs access needed. Cold starts < 5 ms vs 200+ ms on Node. Content is static or lightly dynamic (search). Edge workers deployed to 100+ locations globally minimises RTT for LCP-critical resources.
- *Auth + Dashboard routes on Node*: Session management uses an in-memory `Map<string,Session>` — this requires a long-lived runtime process or at least per-instance memory (acceptable on Serverless with sticky sessions via cookie). Streaming SSR (`load` returning a top-level promise) uses Node streams under the hood. Form actions that mutate data rely on `fs.writeFileSync` to persist back to the JSON source (demo-only; real API would be external).

### Rendering Strategy Per Route

| Route | Strategy | Why |
|-------|----------|-----|
| `/` (landing) | SSG — `export const prerender = true` | Fully static content, SEO-critical, identical for all users |
| `/blog` | SSG + client-side cursor load-more | Pre-render first page for SEO; subsequent pages fetched client-side via `fetch` — 20 posts, 6/page = 4 pages, all pre-renderable but load-more keeps initial payload small |
| `/blog/[slug]` | SSG — `export const prerender = true` via `entries()` | 20 deterministic posts; pre-render all at build time; instant delivery from edge |
| `/search` | SSR (Edge) — `export const ssr = true; export const prerender = false` | Dynamic query parameters; must read `?q=&tag=&sort=` on each request |
| `/login` | SSR (Node) | Form action for auth; session creation needs Node |
| `/dashboard` | SSR (Node) — layout guard | Auth gate; redirects unauthenticated users |
| `/dashboard/items` | SSR (Node) with **streamed promise** | Skeleton renders immediately; row data is a top-level promise from `load` — improves TTFB by ~200 ms while LCP is unchanged |

### Project Structure

```
├── mocks/                          # Provided mock data (unchanged shape)
├── src/
│   ├── app.html
│   ├── app.css                     # CSS custom properties (design tokens), reset
│   ├── error.svelte                # Global error boundary + error reporting beacon
│   ├── hooks.server.ts             # handle: locale detection, auth session check
│   ├── lib/
│   │   ├── components/
│   │   │   ├── primitives/
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Select.svelte
│   │   │   │   ├── Badge.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Heading.svelte
│   │   │   │   ├── Container.svelte
│   │   │   │   ├── Toast.svelte
│   │   │   │   └── Skeleton.svelte
│   │   │   ├── composites/
│   │   │   │   ├── Dialog.svelte       # Focus trap, ARIA, keyboard dismiss
│   │   │   │   ├── Combobox.svelte     # aria-combobox, keyboard nav
│   │   │   │   └── DataTable.svelte    # Sortable, paginated, keyboard-operable
│   │   │   └── layout/
│   │   │       ├── Header.svelte
│   │   │       ├── Footer.svelte
│   │   │       ├── SkipLink.svelte
│   │   │       └── LocaleSwitcher.svelte
│   │   ├── schemas/
│   │   │   ├── post.ts
│   │   │   ├── item.ts
│   │   │   ├── user.ts
│   │   │   ├── tag.ts
│   │   │   └── auth.ts               # Login form schema (shared client+server)
│   │   ├── server/
│   │   │   ├── api/
│   │   │   │   ├── posts.ts          # getAll, getBySlug, search
│   │   │   │   ├── items.ts          # getItems (paginate, filter, sort), updateItem
│   │   │   │   └── auth.ts           # verifyCredentials, createSession, getSession
│   │   │   └── database.ts           # In-memory store loaded from JSON; persists writes
│   │   ├── i18n/
│   │   │   ├── runtime.ts            # t(key, params) function, current locale
│   │   │   └── dictionaries.ts       # Loaded en.json + de.json
│   │   ├── utils/
│   │   │   ├── url-state.ts          # Codec: URLSearchParams ↔ filter/sort/pagination object
│   │   │   ├── formatters.ts         # Intl.DateTimeFormat, Intl.NumberFormat wrappers
│   │   │   ├── web-vitals.ts         # RUM: report LCP/INP/CLS/TTFB to beacon
│   │   │   └── error-reporting.ts    # window.onerror + unhandledrejection → beacon
│   │   └── types.ts                  # z.infer<> re-exports
│   ├── params/
│   │   └── locale.ts                 # Matcher: en|de
│   └── routes/
│       ├── +page.ts                  # (root) redirect to /en or /de based on Accept-Language
│       ├── robots.txt.ts             # Build-time generated
│       ├── sitemap.xml.ts            # Build-time generated, locale-aware
│       ├── og-image-[slug].png.ts    # Build-time generated OG images via satori+resvg
│       └── [locale=locale]/
│           ├── +layout.ts            # Load i18n dict, locale metadata
│           ├── +layout.svelte        # Shell: Header, SkipLink, Footer, Toast container
│           ├── +page.svelte          # Landing page (hero, features, pricing, social proof)
│           ├── blog/
│           │   ├── +page.ts          # SSG + load posts
│           │   ├── +page.svelte      # Blog list with cursor load-more
│           │   └── [slug]/
│           │       ├── +page.ts      # SSG with entries() — load single post
│           │       └── +page.svelte  # Blog post (Article JSON-LD)
│           ├── search/
│           │   ├── +page.ts          # SSR — read query, filter posts
│           │   └── +page.svelte      # Search form + results
│           ├── login/
│           │   ├── +page.server.ts   # Form action (shared Zod schema)
│           │   └── +page.svelte      # Login form
│           └── dashboard/
│               ├── +layout.server.ts # Auth guard — redirect if no session
│               ├── +layout.svelte    # Dashboard shell (sidebar/nav)
│               ├── +page.svelte      # Dashboard home (summary/stats)
│               └── items/
│                   ├── +page.server.ts  # Streamed load + form action for edit
│                   ├── +page.svelte     # DataTable with filter/sort/paginate controls
│                   └── +server.ts       # PATCH endpoint for inline edit (optimistic)
├── tests/
│   ├── unit/
│   │   ├── url-state.test.ts
│   │   ├── schemas.test.ts
│   │   ├── i18n-runtime.test.ts
│   │   ├── dialog.test.ts
│   │   └── items-api.test.ts
│   └── e2e/
│       ├── blog-search.spec.ts       # Anonymous flow
│       ├── dashboard-edit.spec.ts    # Authenticated flow + optimistic rollback
│       └── a11y.spec.ts              # Axe on dashboard
├── static/
│   ├── favicon.ico
│   └── og/                           # Pre-rendered OG images
├── svelte.config.js
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── size-limit.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── .husky/pre-commit
├── .github/workflows/ci.yml
├── tsconfig.json
├── README.md
└── package.json
```

---

## 2. Data Layer

### Zod Schemas

All schemas live in `src/lib/schemas/` and are the single source of truth for types. Inferred types are re-exported from `src/lib/types.ts`.

**`src/lib/schemas/post.ts`**
```ts
import { z } from 'zod';

const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const TranslationSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1), // markdown
});

export const PostSchema = z.object({
  id: z.string().startsWith('post_'),
  slug: z.string().min(1),
  translations: z.record(z.enum(['en', 'de']), TranslationSchema),
  tags: z.array(z.string()),
  author: AuthorSchema,
  publishedAt: z.string().datetime(),
  readingTimeMinutes: z.number().int().positive(),
  coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const PostsArraySchema = z.array(PostSchema);

export type Post = z.infer<typeof PostSchema>;
```

**`src/lib/schemas/item.ts`**
```ts
import { z } from 'zod';

const OwnerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ItemSchema = z.object({
  id: z.string().startsWith('cmp_'),
  name: z.string().min(1),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']),
  channel: z.enum(['email', 'sms', 'web', 'social', 'push']),
  owner: OwnerSchema,
  budget: z.number().nonnegative(),
  spent: z.number().nonnegative(),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  ctr: z.number().min(0).max(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()),
});

export const ItemsArraySchema = z.array(ItemSchema);

// Schemas for filter/sort/pagination params (URL codec)
export const ItemsFilterSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  channel: z.string().optional(),
  owner: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

// Schema for inline edit (PATCH body)
export const ItemPatchSchema = z.object({
  budget: z.number().nonnegative().optional(),
  name: z.string().min(1).optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']).optional(),
});

export type Item = z.infer<typeof ItemSchema>;
export type ItemsFilter = z.infer<typeof ItemsFilterSchema>;
export type ItemPatch = z.infer<typeof ItemPatchSchema>;
```

**`src/lib/schemas/user.ts`**
```ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(1),   // plaintext — demo only
  name: z.string().min(1),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export const UsersArraySchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;
```

**`src/lib/schemas/auth.ts`** (shared client + server)
```ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginData = z.infer<typeof LoginSchema>;
```

**`src/lib/schemas/tag.ts`**
```ts
import { z } from 'zod';

export const TagSchema = z.object({
  slug: z.string(),
  label: z.object({
    en: z.string(),
    de: z.string(),
  }),
});

export const TagsArraySchema = z.array(TagSchema);

export type Tag = z.infer<typeof TagSchema>;
```

### Validation at Boundary

In `src/lib/server/database.ts`, all JSON mocks are parsed through their Zod array schemas on first load. If parsing fails, the application throws a startup error — fail fast, not silently.

```ts
// src/lib/server/database.ts — conceptual
import rawPosts from '$mocks/posts.json';
import { PostsArraySchema } from '$lib/schemas/post';

if (!PostsArraySchema.safeParse(rawPosts).success) {
  throw new Error('posts.json failed schema validation');
}
```

### Mock API Contract

All server-side operations live in `src/lib/server/api/`. They receive parsed, validated inputs and return typed results. No hand-typed response shapes.

**Posts API** (`src/lib/server/api/posts.ts`):
- `getAll(locale?: string): Post[]` — returns all posts sorted by publishedAt desc
- `getBySlug(slug: string, locale: string): Post | undefined` — single post
- `search(params: { q?: string; tag?: string; sort?: string; cursor?: string; limit?: number }): { posts: Post[]; nextCursor: string | null }` — cursor-based pagination; `q` searches title + excerpt; `tag` filters by tag slug; `sort` is `date` (default, desc) or `date_asc`

**Items API** (`src/lib/server/api/items.ts`):
- `getItems(params: ItemsFilter): { items: Item[]; total: number; page: number; pageSize: number; totalPages: number }` — server-side filter, sort, paginate. Always validates `params` through `ItemsFilterSchema`.
- `updateItem(id: string, patch: ItemPatch): Item` — validates through `ItemPatchSchema`, applies to in-memory store, writes back to JSON file (simulates persistence). Throws `NotFoundError` or `ValidationError`.

**Auth API** (`src/lib/server/api/auth.ts`):
- `verifyCredentials(email: string, password: string): User | null` — linear scan over users (3 users; O(1) in practice)
- `createSession(userId: string): string` — generates a session token (crypto.randomUUID), stores in Map
- `getSession(token: string): Session | null` — looks up session Map
- `destroySession(token: string): void`

### Mutations & Cache Invalidation

- Only `/dashboard/items` has mutations (inline edit via PATCH + form action)
- After a successful mutation, the affected item row is updated in the in-memory store and the JSON file
- The `load` function for items does **not** cache — it always reads from the store
- This means no explicit invalidation is needed; the next load() call picks up the latest data
- If we were using SvelteKit's `invalidate()` or `invalidateAll()`, we'd call it after the form action returns, but since the store is mutable in-memory, the next navigation or `fetch` will see the new data

### Error Handling

| Error Type | HTTP Equivalent | UI Treatment |
|------------|----------------|--------------|
| Validation | 422 | Field-level messages on form; toast for API calls |
| Not Found | 404 | `error(404)` thrown in load → custom 404 page |
| Unauthorized | 401 | Redirect to `/login` with `?redirect=` param |
| Forbidden | 403 | Toast: "You don't have permission" |
| Server Error | 500 | Global `error.svelte` + error beacon |
| Network Failure | — | Retry button + toast |

---

## 3. Routing & Rendering Boundaries

### SSG Routes (Edge, prerender = true)

| Route | File | Config |
|-------|------|--------|
| `/en` (landing) | `src/routes/[locale]/+page.ts` | `export const prerender = true; export const ssr = true;` |
| `/en/blog` (list) | `src/routes/[locale]/blog/+page.ts` | `export const prerender = true;` — first page only |
| `/en/blog/[slug]` | `src/routes/[locale]/blog/[slug]/+page.ts` | `export const prerender = true;` + `entries()` returning all 20 × 2 locale slugs |

**Justification**: These pages have zero user-specific content. Pre-rendering at build time produces static HTML that can be served directly from the edge cache — zero server execution on request. For 20 posts × 2 locales = 40 pages + landing, the build cost is negligible.

### SSR Route (Edge, ssr = true, prerender = false)

| Route | File | Config |
|-------|------|--------|
| `/en/search?q=&tag=&sort=` | `src/routes/[locale]/search/+page.ts` | Dynamic query params per request |

**Justification**: Search queries are infinite-dimensional — cannot pre-render. Edge runtime handles this with minimal overhead (cold start < 5ms). The search index is loaded into module scope at import time (static JSON), so there's no database round-trip.

### SSR Route (Node, ssr = true, prerender = false)

| Route | File | Config | Notes |
|-------|------|--------|-------|
| `/en/login` | `src/routes/[locale]/login/+page.server.ts` | Form action writes session cookie | Needs Node for crypto |
| `/en/dashboard` | `src/routes/[locale]/dashboard/+layout.server.ts` | Auth guard — reads session cookie | — |
| `/en/dashboard/items` | `src/routes/[locale]/dashboard/items/+page.server.ts` | **Streaming**: load returns `{ streamed: { rows: promise<...> } }` | Skeleton renders first, rows stream in |

### Streamed SSR Detail (`/dashboard/items`)

The `load` function in `+page.server.ts`:
```ts
export async function load(event) {
  const filter = ItemsFilterSchema.parse(event.url.searchParams);
  const params = { ...filter, pageSize: 10 };
  
  // Non-streamed: total count (needed for pagination UI)
  const { total, totalPages } = itemsApi.getCount(params);
  
  // Streamed: row data (simulate 200ms async work — e.g., DB query)
  const rowsPromise = new Promise<Item[]>((resolve) => {
    setTimeout(() => {
      resolve(itemsApi.getPage(params));
    }, 200);
  });

  return {
    total,
    totalPages,
    page: params.page,
    streamed: {
      rows: rowsPromise,
    },
  };
}
```

In the page component:
```svelte
<script lang="ts">
  let { data } = $props();
  let rows = $derived($data.streamed.rows ?? []);
</script>

<Skeleton.Table />  <!-- renders immediately -->
{#await data.streamed.rows}
  <!-- skeleton stays visible -->
{:then rows}
  <DataTable {rows} />
{:catch error}
  <ErrorState {error} />
{/await}
```

**Trade-off**: TTFB improves because the shell (nav, skeleton table, pagination controls) streams immediately without waiting for the row data. LCP is unaffected because the skeleton occupies the same layout space. The downside is a slightly longer time-to-interactive if the promise takes long, but at 200ms simulated delay the impact is negligible.

### 404

Custom `src/routes/[locale]/+page.ts` with `load` that calls `error(404)` — SvelteKit renders `src/error.svelte`. Pre-rendered at build time (? — no, 404 is dynamic). Routes that don't match any pattern go here.

---

## 4. Internationalization

### Locale Routing

- URL pattern: `/[locale=locale]/...` where `locale` param matcher accepts `en` or `de`
- Root `/` redirects to `/en` or `/de` based on `Accept-Language` header (in `hooks.server.ts`)
- Matcher: `src/params/locale.ts` — `export function match(value) { return value === 'en' || value === 'de'; }`

### Translations

- Dictionaries loaded from `mocks/i18n.en.json` and `mocks/i18n.de.json` at server startup in `src/lib/i18n/dictionaries.ts`
- Runtime `t(key, params?)` function in `src/lib/i18n/runtime.ts`:
  - Dot-notation key lookup (e.g., `t('blog.readingTime', { minutes: 3 })`)
  - Simple `{placeholder}` replacement via regex
  - Falls back to key if not found (visible during development)
- The current locale is available via `event.params.locale` in load functions and via a Svelte context in components

### Layout Data

`src/routes/[locale]/+layout.ts`:
```ts
export function load({ params }) {
  const locale = params.locale as 'en' | 'de';
  return { locale };
}
```

Layout component sets `document.documentElement.lang` via `$effect` and provides locale via `setContext`.

### hreflang & Canonicals

Each page's `+page.svelte` or layout includes:
```svelte
<svelte:head>
  <link rel="alternate" hreflang="en" href="https://example.com/en{path}" />
  <link rel="alternate" hreflang="de" href="https://example.com/de{path}" />
  <link rel="alternate" hreflang="x-default" href="https://example.com/en{path}" />
  <link rel="canonical" href="https://example.com/{locale}{path}" />
</svelte:head>
```

Done via a `SeoHead.svelte` component that accepts `{ locale, path, title, description }`.

### Locale-aware Sitemap

Generated at build time in `src/routes/sitemap.xml.ts`:
```ts
export const prerender = true;
export async function GET() {
  // For each locale: add landing, blog pages, each blog post
  const urls = locales.flatMap(locale => [
    { loc: `/${locale}`, changefreq: 'monthly', priority: 1.0 },
    { loc: `/${locale}/blog`, changefreq: 'weekly', priority: 0.8 },
    ...posts.map(p => ({
      loc: `/${locale}/blog/${p.slug}`,
      lastmod: p.publishedAt,
      changefreq: 'monthly',
      priority: 0.6,
      'xhtml:link': { rel: 'alternate', hreflang: 'en', href: `https://example.com/en/blog/${p.slug}` },
    })),
  ]);
  // Return XML
}
```

Also include `<xhtml:link rel="alternate" hreflang="..." />` per `<url>` entry (Google recommendation).

### Date & Number Formatting

Only uses `Intl` — no string templates:

```ts
// src/lib/utils/formatters.ts
export function formatDate(dateStr: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(dateStr));
}

export function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatPercent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 2 }).format(value);
}
```

---

## 5. Design System & Components

### Design Tokens

Defined entirely via CSS custom properties in `src/app.css`, referenced in `tailwind.config.ts` via the `theme.extend.colors` and `theme.extend.spacing` maps.

```css
/* src/app.css — Light theme (default) */
:root {
  --color-bg: #ffffff;
  --color-bg-muted: #f8fafc;
  --color-bg-inverse: #0f172a;
  --color-fg: #0f172a;
  --color-fg-muted: #64748b;
  --color-fg-inverse: #ffffff;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-border: #e2e8f0;
  --color-border-focus: #3b82f6;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-muted: #1e293b;
  --color-bg-inverse: #ffffff;
  --color-fg: #f1f5f9;
  --color-fg-muted: #94a3b8;
  --color-fg-inverse: #0f172a;
  --color-border: #334155;
}
```

**`tailwind.config.ts`** maps these to Tailwind utilities:
```ts
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          muted: 'var(--color-bg-muted)',
          inverse: 'var(--color-bg-inverse)',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          muted: 'var(--color-fg-muted)',
          inverse: 'var(--color-fg-inverse)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-border-focus)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
};
```

Components use `bg-bg`, `text-fg`, `border-border`, `bg-primary` etc. — **never** raw `bg-blue-500` or `text-gray-900`. Dark mode is handled by the `data-theme` attribute; no parallel class lists.

### Primitives

All in `src/lib/components/primitives/`. Each component:
- Uses Svelte 5 runes (`$props()`, `$state()`, `$derived`, `$effect`)
- Accepts variants via destructured props with defaults
- Exposes `$$restProps` for forwarding
- Is fully TypeScript-typed

**Button.svelte** — `variant: 'primary' | 'secondary' | 'ghost' | 'danger'`, `size: 'sm' | 'md' | 'lg'`, `disabled`, `loading` (shows spinner, disables click), `type: 'button' | 'submit'`
**Input.svelte** — `label`, `error` (string), `value`, `placeholder`, forwarded `oninput`, `onblur`; shows error message below
**Select.svelte** — native `<select>` styled with tokens; `options: { value: string; label: string }[]`, `value`, `onchange`
**Badge.svelte** — `variant: 'default' | 'success' | 'warning' | 'danger' | 'info'`; maps to status/channel colors
**Card.svelte** — `padding: 'none' | 'sm' | 'md' | 'lg'`, `shadow: boolean`
**Heading.svelte** — `level: 1 | 2 | 3 | 4 | 5 | 6` renders `<h1>`–`<h6>`; `size` maps to token-based text sizes
**Container.svelte** — wrapper with `max-width` and horizontal padding; `size: 'sm' | 'md' | 'lg' | 'xl'`
**Toast.svelte** — static container at bottom-right; notification queue via Svelte context; types: `success | error | info`
**Skeleton.svelte** — pulse animation placeholder; `width`, `height`, `rounded` props; also `Skeleton.Table` composite

### Composites

**Dialog.svelte** (`src/lib/components/composites/Dialog.svelte`):
- Full custom implementation (no wrapper library)
- `open` prop (reactive), `onclose` callback
- Focus trap: on open, focus first focusable element; Tab/Shift+Tab cycles within the dialog
- ESC to dismiss
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` referencing the title
- Click-outside to dismiss (backdrop click)
- Body scroll lock when open
- Uses `use:focusTrap` action (defined in `src/lib/actions/focusTrap.ts`)
- Renders via a portal to `<body>` using Svelte's `{@html}` or a wrapper div at root level

**Combobox.svelte** (`src/lib/components/composites/Combobox.svelte`):
- ARIA `combobox` pattern: `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `listbox` with `option` roles
- Keyboard: ArrowDown/ArrowUp to navigate, Enter to select, ESC to close
- Filterable: input filters options list
- `value`, `options: { value: string; label: string }[]`, `onchange`

**DataTable.svelte** (`src/lib/components/composites/DataTable.svelte`):
- Column headers are sortable: click toggles asc/desc; `aria-sort` on `<th>`
- Keyboard: Tab navigates through filter controls and pagination; Enter on sort header toggles sort
- Uses URL-synced state: reading from `$page.url.searchParams` and updating via `goto()`
- Columns: Name (inline-edit target), Status (Badge), Channel (Badge), Owner, Budget (editable), Spent, CTR, Updated (formatted date)
- Pagination controls at bottom: Previous/Next buttons + page numbers; aria-labels on all buttons
- Empty state: "No campaigns yet" with illustration
- Loading state: skeleton rows
- Error state: error message + retry button

### State Management

- **Svelte 5 runes exclusively**: `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`
- **No stores** (`writable`, `derived`, `readable`) — they are a migration path from Svelte 4; runes are the canonical Svelte 5 approach
- **Context** is used for shared state like locale, i18n t() function, toast queue — via `setContext`/`getContext` wrapped in typed helpers
- **URL is state**: filter, sort, pagination, search query, active tag — all live in URL search params; the page reads them and updates via `goto()` from `$app/navigation`

---

## 6. Public Surface Implementation Steps

1. **Initialize project**: `npx sv create take-home --template minimal --types ts`
2. **Install deps**: `zod`, `tailwindcss`, `@tailwindcss/typography`, `husky`, `lint-staged`, `eslint`, `prettier`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `size-limit`, `@size-limit/file`
3. **Configure tooling**: `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `.eslintrc.cjs`, `.prettierrc`, `vitest.config.ts`, `playwright.config.ts`, `size-limit.config.ts`
4. **Write app.css**: CSS custom properties (design tokens), reset, typography, dark mode
5. **Create all Zod schemas** in `src/lib/schemas/`
6. **Create i18n runtime** in `src/lib/i18n/`
7. **Create database.ts**: load and validate all JSON mocks
8. **Create API layer** in `src/lib/server/api/`
9. **Create primitives** (Button, Input, Select, Badge, Card, Heading, Container, Toast, Skeleton)
10. **Create Dialog composite**
11. **Create `hooks.server.ts`**: locale redirect from `/`, cookie-based auth check
12. **Create `src/params/locale.ts`**
13. **Create `[locale]/+layout.ts`** and **`+layout.svelte`**: header, footer, skip link, locale switcher, SEO head
14. **Create landing page** `[locale]/+page.svelte`: hero, features, pricing, social proof — all static
15. **Create `[locale]/blog/+page.ts`**: load all posts (SSG, pre-render first page), pass to page
16. **Create `[locale]/blog/+page.svelte`**: card grid with load-more using cursor
17. **Create `[locale]/blog/[slug]/+page.ts`**: `entries()` returning all slug+locale combos; post or 404
18. **Create `[locale]/blog/[slug]/+page.svelte`**: article body with Article JSON-LD, reading time, author
19. **Create `[locale]/search/+page.ts`**: SSR — parse query params, filter posts
20. **Create `[locale]/search/+page.svelte`**: search input, tag filter, sort selector, results
21. **Create `robots.txt.ts`** and **`sitemap.xml.ts`** (build-time generated)
22. **Create OG image generation**: `og-image-[slug].png.ts` using satori+resvg at build time

### Blog Pagination Decision

**Cursor-based load-more** with a "Load more" button (not infinite scroll).

Rationale:
- First page is pre-rendered (SEO-critical).
- Cursor avoids offset drift if posts were added/deleted (not relevant for static mock, but establishes the right pattern).
- "Load more" button respects user intent and is keyboard-accessible.
- Not infinite scroll because: footer reachability, accidental scroll triggers, and screen-reader confusion.
- Each request returns `{ posts, nextCursor }`; cursor is the `publishedAt` date of the last post.
- Client-side `fetch` to a well-known endpoint or directly calling the API in the browser.

---

## 7. Authenticated Surface Implementation Steps

### Auth Flow

1. **Login form** (`[locale]/login/+page.svelte` + `+page.server.ts`):
   - Client: Input components bound to form; validation via `LoginSchema.safeParse` on submit
   - Server form action: validates again via `LoginSchema`, calls `verifyCredentials`, on success calls `createSession` and sets a `session` cookie (httpOnly, secure, sameSite=lax, path=/)
   - On failure: returns `{ error: t('login.error') }` — rendered as inline error
   - On success: redirect to `/en/dashboard` (or `?redirect=` param)
   - The login schema is imported from `src/lib/schemas/auth.ts` on both client and server

2. **Session handling** (`src/lib/server/api/auth.ts`):
   - Session Map: `Map<string, { userId: string, expiresAt: number }>`
   - Session token: `crypto.randomUUID()`
   - Cookie name: `session`
   - No persistent storage (in-memory only — demo)

3. **Auth guard** (`[locale]/dashboard/+layout.server.ts`):
   ```ts
   export async function load(event) {
     const sessionToken = event.cookies.get('session');
     if (!sessionToken) throw redirect(303, `/${event.params.locale}/login`);
     const session = getSession(sessionToken);
     if (!session || Date.now() > session.expiresAt) {
       event.cookies.delete('session', { path: '/' });
       throw redirect(303, `/${event.params.locale}/login`);
     }
     const user = users.find(u => u.id === session.userId);
     return { user };
   }
   ```

### Dashboard Items Page

**Streamed SSR** (`[locale]/dashboard/items/+page.server.ts`):
```ts
export async function load(event) {
  const filter = ItemsFilterSchema.parse(Object.fromEntries(event.url.searchParams));
  const { total, totalPages } = itemsApi.getCount(filter);
  const rowsPromise = itemsApi.getPageAsync(filter); // returns Promise<Item[]>
  return {
    filter,
    total,
    totalPages,
    streamed: { rows: rowsPromise },
  };
}
```

**Page component** (`[locale]/dashboard/items/+page.svelte`):
- Filter bar: text input (name search), status Select, channel Select, owner Select — all URL-synced via `$derived` + `goto()`
- `DataTable` with skeleton while `streamed.rows` is pending
- Inline edit column (budget): click to switch to `<Input>`; save on blur/Enter; cancel on Escape
- Optimistic update + rollback (see below)

**URL Sync**:
```ts
let params = $derived.by(() => ({
  q: $page.url.searchParams.get('q') ?? '',
  status: $page.url.searchParams.get('status') ?? '',
  channel: $page.url.searchParams.get('channel') ?? '',
  sortBy: $page.url.searchParams.get('sortBy') ?? 'updatedAt',
  sortDir: $page.url.searchParams.get('sortDir') ?? 'desc',
  page: Number($page.url.searchParams.get('page') ?? '1'),
}));

function updateURL(partial: Partial<typeof params>) {
  const next = { ...params, ...partial };
  const sp = new URLSearchParams();
  Object.entries(next).forEach(([k, v]) => { if (v) sp.set(k, String(v)); });
  goto(`?${sp}`, { replaceState: true, keepFocus: true });
}
```

### Inline Edit with Optimistic UI & Rollback

1. User clicks on budget cell → enters edit mode (`isEditing = $state(false)`)
2. Renders `<Input type="number" bind:value={editValue} />` in place of the text
3. On Enter or blur:
   - Save previous value for rollback
   - Optimistically set `item.budget = editValue` (local state)
   - Fire `fetch('PATCH', '/dashboard/items/' + item.id, { body: JSON.stringify({ budget: editValue }) })`
   - On success: nothing (already optimistically updated)
   - On failure: rollback `item.budget = previousValue`, show error toast
4. On Escape: cancel edit, revert to previous value without API call
5. The PATCH endpoint in `+server.ts` validates with `ItemPatchSchema`, calls `updateItem`, returns the updated item

```ts
// Conceptual inline edit handler
async function handleSave(item: Item) {
  const prev = item.budget;
  item.budget = editValue; // optimistic
  isEditing = false;
  try {
    const res = await fetch(`/dashboard/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ budget: editValue }),
    });
    if (!res.ok) throw new Error();
  } catch {
    item.budget = prev; // rollback
    toast.error('Failed to save. Reverted.');
  }
}
```

### State Coverage

| State | UI |
|-------|----|
| **Loading** (initial) | Skeleton rows × 10 |
| **Loading** (page change) | Skeleton for new page + faded old rows |
| **Empty** (no rows match filter) | Empty state illustration + "No campaigns match these filters. Try clearing them." |
| **Empty** (no items at all) | "No campaigns yet." + "New campaign" button |
| **Error** (load failure) | Error card + "Try again" button → re-runs load |
| **Partial failure** (edit save fails) | Toast + rollback to previous value |
| **Unauthorized** (session expired) | Redirect to login with `?redirect=` |
| **Forbidden** (viewer role editing) | Toast: "You don't have permission to edit" |

---

## 8. SEO & OG Images

### Per-Route SEO

A `SeoHead.svelte` component is included in each page or layout:
```svelte
<script lang="ts">
  let { title, description, locale, path, ogImage, jsonLd }: Props = $props();
</script>

<svelte:head>
  <title>{title} — Demo Co.</title>
  <meta name="description" {description} />
  <link rel="canonical" href="https://example.com/{locale}{path}" />
  <link rel="alternate" hreflang="en" href="https://example.com/en{path}" />
  <link rel="alternate" hreflang="de" href="https://example.com/de{path}" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="https://example.com/{locale}{path}" />
  <meta property="og:type" content={ogType ?? 'website'} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  {#if jsonLd}
    <script type="application/ld+json">{@html jsonLd}</script>
  {/if}
</svelte:head>
```

### JSON-LD

**Blog post page** (`[slug]/+page.svelte`):
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Sub-second LCP on a content site",
  "description": "...",
  "author": { "@type": "Person", "name": "Omar Haddad" },
  "datePublished": "2026-05-31T00:00:00Z",
  "image": "https://example.com/og/sub-second-lcp-on-a-content-site.png"
}
```
With `BreadcrumbList`:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/en" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://example.com/en/blog" },
    { "@type": "ListItem", "position": 3, "name": "Sub-second LCP on a content site" }
  ]
}
```

**Home page**: `Organization` JSON-LD.

### OG Images

**Approach**: Pre-render at build time using `satori` (JSX→SVG) + `resvg` (SVG→PNG). No runtime overhead. Images served as static files from `https://example.com/og/<slug>.png`.

**Implementation**: `src/routes/og-image-[slug].png/+server.ts`:
```ts
export const prerender = true;
export async function GET({ params }) {
  const post = postsApi.getBySlug(params.slug, 'en');
  if (!post) return new Response('Not found', { status: 404 });

  const svg = await satori(
    <div style={{ background: post.coverColor, width: 1200, height: 630 }}>
      <h1>{post.translations.en.title}</h1>
      <p>{post.author.name} · {post.readingTimeMinutes} min read</p>
    </div>,
    { width: 1200, height: 630, fonts: [...] }
  );
  const png = await resvg(svg).render();
  return new Response(png.asPng(), { headers: { 'content-type': 'image/png' } });
}
```

Generate one per slug per locale (or just EN slugs, with a shared fallback).

---

## 9. Accessibility Checklist

- [x] **Semantic HTML**: `<nav>`, `<main>`, `<aside>`, `<article>`, `<section>`, `<header>`, `<footer>` — all pages
- [x] **Landmarks**: skip link at top of every page (`SkipLink.svelte` → `<a href="#main-content">`); `#main-content` id on `<main>`
- [x] **Heading hierarchy**: `h1` → `h2` → `h3`... never skip levels; exactly one `h1` per page
- [x] **Focus management**: visible `:focus-visible` ring styled via design tokens; Dialog traps focus; DataTable filter controls keyboard-accessible
- [x] **Color contrast**: both light and dark themes meet WCAG AA (4.5:1 for normal text, 3:1 for large text); verified with `@axe-core/playwright`
- [x] **Forms**: all `<input>` and `<select>` have associated `<label>`; error messages linked via `aria-describedby`; native form validation as fallback
- [x] **Images**: all decorative; author avatars are CSS circles with initials, not `<img>` (no alt needed); OG images are `meta` only
- [x] **Keyboard**: full keyboard navigation of Dialog (Tab, Shift+Tab, Enter, Escape, Arrow keys), Combobox (ArrowUp/Down, Enter, Escape), DataTable (Tab through filters, Enter to sort)
- [x] **ARIA live regions**: toast notifications use `role="alert"` or `aria-live="polite"`; loading states use `aria-busy="true"`
- [x] **Motion**: `prefers-reduced-motion` respected; no auto-playing animations; skeleton pulse disables if `prefers-reduced-motion: reduce`
- [x] **Screen reader**: DataTable uses `<table>` with `<caption>`, `<th scope="col">`; pagination controls have `aria-label="Page N"`, `aria-current="page"`
- [x] **CI enforcement**: `@axe-core/playwright` integration fails CI on any serious or critical violation

---

## 10. Performance Budgets & Enforcement

### Budgets

| Metric | Target | Measured On | Device |
|--------|--------|-------------|--------|
| LCP | < 2.0s | `/`, `/blog/[slug]`, `/dashboard/items` | Moto G Power (simulated) |
| CLS | < 0.1 | Same | Same |
| INP | < 200ms | Same | Same |
| Lighthouse Performance | ≥ 95 | Same | Same |
| Lighthouse Accessibility | ≥ 95 | Same | Same |
| Lighthouse SEO | ≥ 95 | Same | Same |
| Lighthouse Best Practices | ≥ 95 | Same | Same |
| JS (public surface, initial route) | ≤ 80 KB gzip | `/en` | — |
| JS (dashboard) | ≤ 150 KB gzip | `/en/dashboard/items` | — |
| Total page size | ≤ 500 KB | All routes | — |

### Bundle Size Enforcement (`size-limit`)

```js
// size-limit.config.js
module.exports = [
  {
    name: 'Public surface (/)',
    path: '.svelte-kit/output/client/**/*.js',
    limit: '80 KB',
    gzip: true,
    // Only count files used by the / route
  },
  {
    name: 'Dashboard (/dashboard/items)',
    path: '.svelte-kit/output/client/**/*.js',
    limit: '150 KB',
    gzip: true,
  },
];
```

Note: `size-limit` doesn't have built-in route-level analysis out of the box. We use a convention: measure the total client output and ensure it stays under dashboard budget. If it exceeds the public budget, we know a public route pulls in too much JS — we audit via `svelte-kit analyze` to find the culprit.

Alternative: Use `svelte-kit analyze` (built into SvelteKit) to get per-route JS bundles and assert in CI.

### Lighthouse CI

```yaml
# .github/workflows/ci.yml (partial)
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.js
```

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/en',
        'http://localhost:4173/en/blog',
        'http://localhost:4173/en/blog/sub-second-lcp-on-a-content-site',
        'http://localhost:4173/en/dashboard/items',
      ],
      startServerCommand: 'npm run build && npm run preview',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop', // or 'mobile' for Moto G4 throttling
        onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 11. Testing Strategy

### Unit Tests (Vitest) — ≥ 5 meaningful tests

**1. URL state codec** (`tests/unit/url-state.test.ts`):
- Test `encode` (object → URLSearchParams) with all fields, partial fields, empty
- Test `decode` (URLSearchParams → ItemsFilter) with valid, missing, and extra params
- Test round-trip: decode(encode(obj)) === obj
- Test edge cases: negative page number coerces to 1, invalid enum falls back to default

**2. Zod schema validation** (`tests/unit/schemas.test.ts`):
- Test `PostsArraySchema.parse(mockPosts)` succeeds
- Test with a malformed post (missing required field) fails
- Test with invalid hex color fails
- Test `LoginSchema.parse` valid / invalid emails

**3. i18n runtime** (`tests/unit/i18n-runtime.test.ts`):
- Test `t('blog.readingTime', { minutes: 3 })` returns correct string for en and de
- Test missing key returns key itself
- Test interpolation with multiple placeholders

**4. Dialog composite** (`tests/unit/dialog.test.ts`):
- Test component opens/closes based on `open` prop
- Test ESC key calls `onclose`
- Test focus trap: Tab cycles through focusable elements

**5. Items API server logic** (`tests/unit/items-api.test.ts`):
- Test `getItems` with default params returns first 10 items
- Test filtering by status returns only matching items
- Test sorting by budget desc
- Test pagination: page 2 skips first 10

**No snapshot tests** — they add noise without meaningful assertions.

### E2E Tests (Playwright)

**1. Anonymous: search → click → read post** (`tests/e2e/blog-search.spec.ts`):
```ts
test('user can search and read a blog post', async ({ page }) => {
  await page.goto('/en');
  await page.click('text=Blog');
  // Search is on the blog page or a dedicated search page
  await page.fill('[name="q"]', 'LCP');
  await page.waitForResponse(/search/);
  await page.click('text=Sub-second LCP');
  await expect(page).toHaveURL(/\/en\/blog\/sub-second-lcp/);
  await expect(page.locator('h1')).toHaveText('Sub-second LCP on a content site');
});
```

**2. Authenticated: login → dashboard → edit row with optimistic update → assert rollback** (`tests/e2e/dashboard-edit.spec.ts`):
```ts
test('user can edit a row and see rollback on failure', async ({ page }) => {
  await page.goto('/en/login');
  await page.fill('[name="email"]', 'admin@demo.test');
  await page.fill('[name="password"]', 'demo1234');
  await page.click('text=Sign in');
  await expect(page).toHaveURL(/\/en\/dashboard/);
  await page.click('text=Campaigns');
  
  // Click first budget cell
  await page.locator('table tr').first().locator('[data-editable]').click();
  const input = page.locator('table tr').first().locator('input[type="number"]');
  await input.fill('99999');
  await input.press('Enter');
  
  // Wait — if the mock PATCH endpoint is configured to fail, assert rollback
  // Otherwise, we can force the endpoint to return 500 by sending an invalid value
  // and assert the value reverts to original
});
```

**3. Axe accessibility** (`tests/e2e/a11y.spec.ts`):
```ts
import AxeBuilder from '@axe-core/playwright';

test('dashboard page has no serious or critical a11y violations', async ({ page }) => {
  await page.goto('/en/login');
  // ... login ...
  await page.goto('/en/dashboard/items');
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(violations).toHaveLength(0);
});
```

### Visual Regression

One Playwright snapshot test comparing a key component (e.g., the `DataTable` with known data) against a stored baseline:

```ts
test('DataTable matches visual snapshot', async ({ page }) => {
  await page.goto('/en/dashboard/items');
  await page.waitForSelector('table');
  await expect(page.locator('table')).toHaveScreenshot('data-table.png');
});
```

Using Playwright's built-in `toHaveScreenshot()` with a component-level test (likely requires isolating the component via a dedicated test route or story).

---

## 12. CI Pipeline & Observability

### GitHub Actions (`./github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run check

      - name: Unit tests
        run: npm run test:unit

      - name: Build
        run: npm run build

      - name: Bundle size
        run: npx size-limit

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: E2E tests
        run: npm run test:e2e

      - name: Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hook

`.husky/pre-commit`:
```sh
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,svelte}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

### Observability / RUM

**`src/lib/utils/web-vitals.ts`**:
```ts
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals';

export function initWebVitals(sampleRate: number = 0.1) {
  if (Math.random() > sampleRate) return; // 10% sampling

  const send = (metric: any) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: location.pathname,
      locale: document.documentElement.lang,
      timestamp: Date.now(),
    });
    // Use sendBeacon (fire-and-forget, doesn't block page unload)
    navigator.sendBeacon('/api/beacon', body);
  };

  onLCP(send);
  onINP(send);
  onCLS(send);
  onTTFB(send);
}
```

**Beacon endpoint** (`src/routes/api/beacon/+server.ts`):
```ts
export async function POST({ request }) {
  const body = await request.text();
  console.log('[RUM]', body);
  // In production: forward to your analytics backend
  return new Response('ok');
}
```

**Error reporting** (`src/lib/utils/error-reporting.ts`):
```ts
export function initErrorReporting() {
  window.onerror = (message, source, lineno, colno, error) => {
    navigator.sendBeacon('/api/beacon', JSON.stringify({
      type: 'error',
      message,
      stack: error?.stack,
      url: location.href,
      timestamp: Date.now(),
    }));
  };
  window.addEventListener('unhandledrejection', (e) => {
    navigator.sendBeacon('/api/beacon', JSON.stringify({
      type: 'unhandledrejection',
      reason: e.reason?.message ?? String(e.reason),
      stack: e.reason?.stack,
      timestamp: Date.now(),
    }));
  });
}
```

**Initialized** in `src/app.html` or the root layout `onMount`:
```ts
import { initWebVitals } from '$lib/utils/web-vitals';
import { initErrorReporting } from '$lib/utils/error-reporting';

onMount(() => {
  initWebVitals(0.1); // 10% sample
  initErrorReporting();
});
```

---

## 13. Final Polish & Verification

### Order of Operations

1. **Scaffold**: `npx sv create`, install deps, configure all tooling files
2. **Design tokens**: `app.css` (CSS vars), `tailwind.config.ts`
3. **Schemas**: all Zod schemas in `src/lib/schemas/`
4. **I18n**: `runtime.ts`, `dictionaries.ts`
5. **Database**: `src/lib/server/database.ts` — load + validate all JSON
6. **API layer**: `posts.ts`, `items.ts`, `auth.ts`
7. **Primitives**: Button, Input, Select, Badge, Card, Heading, Container, Toast, Skeleton
8. **Composites**: Dialog (with focus trap), Combobox, DataTable
9. **Utils**: `url-state.ts`, `formatters.ts`, `web-vitals.ts`, `error-reporting.ts`
10. **Hooks**: `hooks.server.ts` (locale redirect, auth session)
11. **Layout**: `[locale]/+layout.ts`, `+layout.svelte`, `SeoHead.svelte`, `Header.svelte`, `Footer.svelte`, `SkipLink.svelte`, `LocaleSwitcher.svelte`
12. **Landing**: `[locale]/+page.svelte` (hero, features, pricing, social proof)
13. **Blog list**: `[locale]/blog/+page.ts` + `+page.svelte`
14. **Blog post**: `[locale]/blog/[slug]/+page.ts` + `+page.svelte`
15. **Search**: `[locale]/search/+page.ts` + `+page.svelte`
16. **Login**: `[locale]/login/+page.server.ts` + `+page.svelte`
17. **Dashboard guard + shell**: `[locale]/dashboard/+layout.server.ts` + `+layout.svelte`
18. **Dashboard home**: `[locale]/dashboard/+page.svelte`
19. **Dashboard items**: `[locale]/dashboard/items/+page.server.ts` + `+page.svelte` + `+server.ts`
20. **SEO**: `robots.txt.ts`, `sitemap.xml.ts`, OG image generation
21. **Tests**: unit tests, E2E tests, a11y, visual regression
22. **CI**: GitHub Actions workflow, `.husky/pre-commit`
23. **Polish**: README.md with demo credentials, commit history cleanup
24. **Final verification**: `npm run build`, `npm run preview`, Lighthouse run, bundle check

### Verification Checklist

- [ ] `npm run build` succeeds without errors
- [ ] `npm run preview` serves all routes
- [ ] All links navigate correctly
- [ ] Login works for all 3 accounts with password `demo1234`
- [ ] Dashboard redirects to login when unauthenticated
- [ ] Dashboard items loads with skeleton, then rows
- [ ] Pagination, sorting, filtering all work with URL sync
- [ ] Inline edit updates optimistically, rolls back on error
- [ ] Locale switcher toggles between EN and DE
- [ ] hreflang and canonical links present on all pages
- [ ] sitemap.xml has all locale-specific URLs
- [ ] OG images generate and render in social previews
- [ ] Lighthouse scores ≥ 95 on all categories
- [ ] `npx size-limit` passes
- [ ] `npm run lint` passes
- [ ] `npm run check` (svelte-check) passes
- [ ] `npm run test:unit` passes
- [ ] `npm run test:e2e` passes
- [ ] Axe finds zero serious or critical violations
- [ ] Visual regression snapshot matches
- [ ] Web vitals beacon fires on page load
- [ ] Error boundary catches and reports errors
- [ ] No `any`, no `@ts-ignore`, no `any` in own code
- [ ] Color contrast meets WCAG AA in both themes
- [ ] Keyboard navigation works end-to-end
- [ ] Pre-commit hook blocks bad commits
- [ ] CI passes on the `main` branch
