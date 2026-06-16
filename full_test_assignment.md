Take-Home Assignment
Senior Frontend Engineer
SvelteKit + Tailwind
Build a production-shaped slice of a real product in SvelteKit: a public marketing surface and an authenticated dashboard. We care about how you reason about architecture, rendering boundaries, performance, and trade-offs. Ship less, finish what you ship, and be ready to defend every decision.

Deadline
7 days from receipt
Stack
SvelteKit · TS · Tailwind
Deliverable
Repo + live URL
01The brief
You are the first frontend engineer on a new product. You're laying foundations for a codebase the team will scale on for years — the choices you'd be comfortable defending in a code review two years from now. The app has two surfaces with different rendering needs, and you must reason about both.

Public surface
SEO-critical · anonymous
/ — landing page (hero, features, pricing, social proof).
/blog — list of posts. Choose pagination, infinite scroll, or cursor-based load-more. Justify it.
/blog/[slug] — individual post page.
/search?q=…&tag=…&sort=… — search posts. All filter/sort state must round-trip through the URL (shareable, back/forward works).
/404 — custom not-found page.
Authenticated surface
interactive · behind login
/login — sign-in form with shared client+server Zod validation. Mock auth is fine; cookie/session handling must be real.
/dashboard — protected by a server handle hook or layout guard. Anonymous users redirect to /login.
/dashboard/items — a data table of ~200+ rows with:
Server-side pagination, sorting, and multi-facet filtering. URL-synced.
Inline edit on at least one column with optimistic UI and proper rollback on failure.
Streamed SSR: skeleton renders immediately; the row data is a streamed promise from load.
Empty, loading, error, and partial-failure states are all designed, not afterthoughts.
i
We provide the data
The mocks/ folder shipped with this assignment contains everything you need: 20 blog posts (EN + DE translations), 220 dashboard rows, 3 demo login accounts, a tag taxonomy, and i18n string dictionaries. Use the JSON files directly, wrap them in an in-process mock API, or load them at build time — your call, justify it. See mocks/README.md for shape, constraints, and what you may and may not change.

What we judge is the data layer and the boundaries, not the data itself. Treat items.json as if it were a real paginated/filterable/sortable API and implement those operations on the server.

02What we want to see
Rendering & runtime boundaries
required
Pick deliberately between SSG, SSR, ISR/on-demand revalidation, streamed SSR, and CSR for every route. Be ready to defend each choice on the follow-up call.
At least one route must run on an edge runtime (Cloudflare Workers, Vercel Edge, Netlify Edge). At least one must run on Node. Explain why each lives where it does — cold start, data locality, dependency constraints.
Use streamed responses (load returning promises) where it improves TTFB without hurting LCP. Show you understand the trade-off.
Performance budgets
required
Production build (npm run build && npm run preview) must hit these, and the budgets must be enforced in CI — not just measured:

LCP < 2.0s, CLS < 0.1, INP < 200ms on Lighthouse mobile (Moto G Power throttling) for /, /blog/[slug], and /dashboard/items.
Lighthouse Performance / Accessibility / SEO / Best Practices ≥ 95. Lighthouse CI fails the build if any drop below threshold.
JS budget enforced via size-limit or equivalent: initial route JS ≤ 80 KB gzip on the public surface, ≤ 150 KB on the dashboard. Pick your own numbers if you justify them; the point is the budget exists and is enforced.
Data layer & API contract
required
Define your API contract once and derive types from it: Zod schemas (preferred) or OpenAPI with codegen. No hand-typed response shapes. The provided mocks/schemas.json is an informal reference — translate it into proper schemas.
Validate mocks/posts.json, items.json, and users.json at the boundary. Don't trust the JSON blindly.
Share the validation schema between client form and server endpoint — single source of truth.
Distinguish loaders (read) from form actions / endpoints (write). Mutations invalidate the right loaders, not the whole tree.
Network errors, validation errors, and 401/403 each render differently and recover sensibly.
Internationalization
required
Two locales: en and de (translations and UI strings are provided in mocks/). Locale segment in the URL: /en/blog, /de/blog.
Correct hreflang, per-locale canonicals, locale-aware sitemap entries.
One date and one number formatted via Intl — not a string template.
Tailwind & design tokens
required
Define semantic design tokens (colors, spacing, radii, typography) in tailwind.config and theme via CSS variables — avoid raw bg-blue-500 in components.
Support light and dark mode driven by tokens, not by parallel class lists.
No utility sprawl: factor repeated patterns into Svelte components or @apply'd primitives. Be ready to justify either choice.
Component architecture
required
Build ~8–10 reusable primitives (Button, Card, Badge, Input, Select, Container, Heading, Toast, Dialog, etc.) with variants driven by your token system.
Build at least one complex composite: a fully accessible Dialog/Combobox/Menu (focus trap, ARIA, keyboard, dismissal) — not a wrapper around a library.
Declare your state-management approach (Svelte 5 runes vs stores vs context) and stay consistent. Be ready to defend it.
TypeScript everywhere. No any, no @ts-ignore, no implicit unknown in your own code.
Accessibility
required
Semantic HTML. Landmarks, headings in order, skip link, visible focus.
Keyboard navigable end-to-end. The dashboard table must be operable without a mouse — sort, filter, paginate, edit.
Color contrast meets WCAG AA against your tokens, in both themes.
@axe-core/playwright wired into E2E tests. CI fails on any serious or critical violation.
SEO
required
Per-route <title>, meta description, canonical, Open Graph, Twitter card. Per-locale where relevant.
JSON-LD structured data on blog posts (Article with breadcrumbs) and home (Organization). Validates clean.
sitemap.xml and robots.txt generated at build time, locale-aware.
Dynamically generated OG images for blog posts (edge function, satori, or pre-rendered — your call, justify it).
Testing
required
≥ 5 meaningful Vitest unit tests covering at least one composite component and one piece of business logic (e.g. URL state codec). No snapshot noise.
≥ 2 Playwright E2E flows: one anonymous (search → click → post), one authenticated (login → dashboard → edit row with optimistic update → assert rollback path).
Axe accessibility assertions on at least the dashboard route.
One visual regression snapshot via Playwright on a key component or route.
Tooling, CI & observability
required
ESLint + Prettier + svelte-check + tsc --noEmit, all passing.
Pre-commit hook (Husky + lint-staged) blocks bad commits locally.
CI pipeline runs lint → typecheck → unit → build → Playwright → Lighthouse CI → bundle-size check, and fails the PR on any regression.
Real RUM wired up: web-vitals shipping LCP/INP/CLS/TTFB to a beacon endpoint you implement (the endpoint can console-log; the wiring must be real). Include sampling logic.
Client-side error boundary + error reporting wired to the same beacon (Sentry stub is fine).
Nice to have
optional
View Transitions API used meaningfully (not as decoration).
Image pipeline: responsive srcset, AVIF/WebP, LQIP/blur-up, priority hints.
Service worker / offline shell for the dashboard.
Partial pre-rendering or islands for the marketing surface.
Feature flag wired through SSR without flicker.
03Deliverables
A public GitHub repository with a clean commit history (atomic, well-described commits — we read them).
A live deployed URL with the dashboard reachable behind a demo login (credentials in the README).
A short README.md with how to run locally, how to run tests, and the demo credentials for the dashboard.
A green CI run on main at submission time.
04How we evaluate
Architecture & rendering boundaries
20%
Deliberate SSG/SSR/streamed/edge choices per route, defensible runtime split, clean separation of public vs authenticated surfaces.

Performance (measured + enforced)
15%
Real CWV numbers hit on real builds; budgets enforced in CI, not just documented; bundle and hydration cost reasoned about.

Data layer & interactivity
15%
Single-source-of-truth schemas, optimistic UI done correctly (incl. rollback), error/loading/empty states designed, URL-as-state.

Code quality & TypeScript
10%
Precise types, composable components, no dead abstractions, sensible folder structure, atomic commit history.

Design system & Tailwind
10%
Tokenized, themable, no utility sprawl, primitives reused, one non-trivial composite built from scratch.

A11y, SEO, i18n
10%
Real semantics, keyboard parity on dashboard, axe-clean, structured data validates, hreflang/canonical correct per locale.

Testing, CI, observability
10%
Tests exercise real behavior; CI gates are real (perf, a11y, bundle, types); RUM and error reporting wired end-to-end.

Communication & judgment
10%
Commit messages tell the story; cuts are deliberate; code reads as if a teammate wrote it for the team to maintain.

★
What we value most
Taste, judgment, and finished edges. A small surface area that is genuinely production-grade beats a sprawling demo that's 80% there everywhere.

05Ground rules
You may use any UI library for inspiration, but the primitives and the composite you ship must be yours (no copy-paste of full kits).
Tell us your actual time spent on submission — honest numbers count in your favor.
If something is ambiguous, make a call. Don't email us to ask — be ready to defend it on the follow-up call.
We will read your commit history. Squash-into-one-commit submissions are a negative signal.
06Submission
Reply to the original email thread with:

GitHub repo URL.
Live deployed URL.
Approximate time spent.
Anything you'd want to talk through in the follow-up call.
The follow-up is a 45-minute call where we'll walk through your code together, ask you to extend one piece live, and discuss the trade-offs you made.

08Mock data
Everything below is rendered live from the JSON in the mocks/ folder. Use the "Raw JSON" toggle on each block to see the exact shape you'll be parsing.

20
Posts
220
Dashboard rows
3
Demo users
8
Tags
2
Locales
{}
posts.json
EN
DE
20 entries
Sub-second LCP on a content site
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

performance
engineering
OH
Omar Haddad
·
31 May 2026
·
3 min
A pragmatic design token system
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

design
AB
Anna Becker
·
28 May 2026
·
3 min
Why we moved off the SPA default
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

engineering
performance
MD
Marek Dvořák
·
25 May 2026
·
3 min
Accessible combobox from scratch
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

accessibility
tutorials
MD
Marek Dvořák
·
22 May 2026
·
3 min
Stop fighting your form library
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

engineering
tutorials
OH
Omar Haddad
·
19 May 2026
·
3 min
Streaming SSR, in plain English
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

performance
engineering
PI
Priya Iyer
·
16 May 2026
·
3 min
What good error states look like
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

design
product
AB
Anna Becker
·
13 May 2026
·
3 min
Edge or Node: a sober comparison
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

engineering
performance
AB
Anna Becker
·
10 May 2026
·
3 min
How we cut our bundle by 60%
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

performance
MD
Marek Dvořák
·
7 May 2026
·
3 min
Designing for keyboard users first
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

accessibility
design
PI
Priya Iyer
·
4 May 2026
·
3 min
The cost of an extra round-trip
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

performance
engineering
OH
Omar Haddad
·
1 May 2026
·
3 min
Shipping AI features without the slop
We've been quietly rebuilding the way our content is delivered, and the change has been more interesting than we expected. The numbers are…

ai
product
MD
Marek Dvořák
·
28 Apr 2026
·
3 min
[]
items.json
220 entries
Filter by name…

All statuses

All channels
220 of 220 rows
Autumn — Beta program #213	active	web	
JL
Jonas Lindqvist	$15,000	$6,345	5.26%	29 Jun 2026
Reactivation — NPS push #046	draft	email	
JL
Jonas Lindqvist	$15,000	$0	0.00%	27 Jun 2026
Cross-sell — Pricing change #160	completed	sms	
MD
Marek Dvořák	$1,000	$940	2.11%	26 Jun 2026
Trial — Lifecycle nudge #196	completed	social	
OH
Omar Haddad	$5,000	$4,290	2.75%	21 Jun 2026
Re-engagement — Webinar series #026	active	sms	
MD
Marek Dvořák	$1,000	$228	2.78%	20 Jun 2026
Announcement — Product update #163	scheduled	social	
MD
Marek Dvořák	$50,000	$0	0.00%	19 Jun 2026
Win-back — Beta program #181	draft	sms	
MD
Marek Dvořák	$2,500	$0	0.00%	17 Jun 2026
Win-back — NPS push #199	active	sms	
SR
Sofia Romero	$1,000	$291	3.48%	17 Jun 2026
Re-engagement — GA release #031	active	email	
JL
Jonas Lindqvist	$15,000	$9,020	1.20%	15 Jun 2026
Autumn — Product update #107	paused	sms	
MD
Marek Dvořák	$15,000	$6,188	3.09%	14 Jun 2026
Showing 1–10 of 220
‹
1
2
3
4
5
›
{}
users.json
3 entries · password: demo1234
DA
Demo Admin
admin@demo.test
admin
DE
Demo Editor
editor@demo.test
editor
DV
Demo Viewer
viewer@demo.test
viewer
[]
tags.json
8 entries
Engineering
engineering
Design
design
Product
product
Performance
performance
Accessibility
accessibility
AI
ai
Culture
culture
Tutorials
tutorials
i18
i18n.{en,de}.json
41 keys × 2 locales
Key	EN	DE
nav.home	Home	Start
nav.blog	Blog	Blog
nav.pricing	Pricing	Preise
nav.search	Search	Suche
nav.login	Sign in	Anmelden
nav.dashboard	Dashboard	Dashboard
nav.logout	Sign out	Abmelden
home.hero.title	Build a faster web, without the fight.	Baue ein schnelleres Web, ohne Kampf.
home.hero.subtitle	A performance-first stack for teams that ship.	Ein Performance-Stack für Teams, die ausliefern.
home.hero.cta	Get started	Loslegen
home.features.title	What you get	Das bekommst du
blog.title	Writing	Texte
blog.empty	No posts found.	Keine Beiträge gefunden.
blog.readMore	Read post	Beitrag lesen
blog.readingTime	{minutes} min read	{minutes} Min. Lesezeit
search.placeholder	Search posts…	Beiträge durchsuchen…
search.results	{count} results for "{query}"	{count} Treffer für "{query}"
search.noResults	No matches. Try a different query.	Keine Treffer. Versuche eine andere Suche.
login.title	Sign in	Anmelden
login.email	Email	E-Mail
login.password	Password	Passwort
login.submit	Sign in	Anmelden
login.error	Invalid email or password.	Ungültige E-Mail oder Passwort.
dashboard.title	Dashboard	Dashboard
dashboard.items.title	Campaigns	Kampagnen
dashboard.items.new	New campaign	Neue Kampagne
dashboard.items.empty	No campaigns yet.	Noch keine Kampagnen.
dashboard.items.column.name	Name	Name
dashboard.items.column.status	Status	Status
dashboard.items.column.channel	Channel	Kanal
dashboard.items.column.owner	Owner	Besitzer
dashboard.items.column.budget	Budget	Budget
dashboard.items.column.spent	Spent	Ausgegeben
dashboard.items.column.ctr	CTR	CTR
dashboard.items.column.updated	Updated	Aktualisiert
common.loading	Loading…	Wird geladen…
common.error	Something went wrong.	Etwas ist schiefgelaufen.
common.retry	Try again	Erneut versuchen
common.save	Save	Speichern
common.cancel	Cancel	Abbrechen
footer.copy	© 2026 Demo Co.	© 2026 Demo Co.
{}
schemas.json
informal reference
{
  "Post": {
    "id": "string",
    "slug": "string",
    "translations": {
      "<locale>": {
        "title": "string",
        "excerpt": "string",
        "body": "string (markdown)"
      }
    },
    "tags": "string[]",
    "author": {
      "id": "string",
      "name": "string",
      "avatarColor": "string (hex)"
    },
    "publishedAt": "string (ISO 8601)",
    "readingTimeMinutes": "number",
    "coverColor": "string (hex)"
  },
  "Item": {
    "id": "string",
    "name": "string",
    "status": "enum: draft|scheduled|active|paused|completed|archived",
    "channel": "enum: email|sms|web|social|push",
    "owner": {
      "id": "string",
      "name": "string"
    },
    "budget": "number (USD)",
    "spent": "number (USD)",
    "impressions": "number",
    "clicks": "number",
    "ctr": "number (0-1)",
    "startDate": "string (YYYY-MM-DD)",
    "endDate": "string (YYYY-MM-DD)",
    "updatedAt": "string (ISO 8601)",
    "tags": "string[]"
  },
  "User": {
    "id": "string",
    "email": "string (email)",
    "password": "string (plaintext — demo only)",
    "name": "string",
    "role": "enum: admin|editor|viewer"
  }
}
09FAQ
Can I use Svelte 5 / runes?
Yes — preferred, in fact. Latest stable SvelteKit.

Can I use a component library like shadcn-svelte / Skeleton / Bits UI?
You can take inspiration, but the primitives you commit should be yours. We want to see your component design instincts.

Does the content need to be real?
No. The provided mocks include placeholder copy that's good enough. The structure and metadata matter, the prose doesn't.

Can I swap the provided mocks for a different data source?
No — please use what's in mocks/. The data is part of the spec so we can compare submissions on equal footing and run the dashboard table at a known scale. You may extend the data (add fields, regenerate with more rows) but not replace it.

Questions about logistics only (not the task itself): reply to the email thread. Good luck — we're looking forward to seeing how you think.