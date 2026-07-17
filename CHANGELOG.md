# Changelog — Elite Market (Web)

Human-readable log of notable changes and the reasoning behind them, so any
agent (Claude Code / Cowork) or teammate opening this repo understands recent
work without re-deriving it from diffs.

**Convention:** every work session that changes anything appends a dated
`## YYYY-MM-DD — <title>` entry here (what changed, why, next step), so this file
stays the single source of truth for recent work across Cowork and Claude Code.

---

## 2026-07-17 — Conversion redesign: product-first homepage, discovery & link-in-bio

**Context / why**
- Owner runs strong Instagram/TikTok ads with decent views but **near-zero
  sales**. Diagnosis from the code: (1) the homepage was a 620vh cinematic
  scroll with no products or search above the fold, (2) search was hidden on
  mobile, (3) with hundreds of products there was no way to filter/sort. Decided
  goal (confirmed with owner): **maximize Amazon-affiliate click-throughs**, and
  make the homepage **product-first**.

**What changed**
- **Product-first homepage** (`src/app/[locale]/page.tsx`): now HeroSearch →
  FeaturedProducts → CategoryShowcase → HowItWorks → ValueProps → CtaBand.
  - New `src/components/home/hero-search.tsx`: search box + category chips +
    trust row above the fold; search submits to `/shop?q=`.
  - The full cinematic scroll experience moved to its own page,
    `src/app/[locale]/story/page.tsx` (`/story`), so it's preserved, not lost.
- **Link-in-bio page** (`src/app/[locale]/links/page.tsx`, `/links`): the single
  URL to put in the IG/TikTok bio — brand, search, category shortcuts, and the
  most-recently-added products (what's being advertised) surfaced first. Uses
  `src/components/home/bio-search.tsx`.
- **Shop filter + sort** (`src/components/shop/shop-browser.tsx`): comprehensive
  client-side filtering (query, category, audience, brand, price range, sale,
  in-stock, own/affiliate, rating) + sorting (featured / price / rating / name /
  brand), state synced to the URL. Powers the collection and category pages.
- **Admin filter + sort** (`src/components/admin/products-table.tsx`): search +
  category/type/audience/deal filters and sortable columns on the admin list.
- **Mobile search fix** (`src/components/layout/site-header.tsx`): the search
  icon is always visible now (was `hidden sm:flex`) + a prominent search link at
  the top of the mobile menu.
- **Payload trim** (`toCardProduct` in `src/lib/catalog-types.ts`): listing
  pages serialize a slimmed product (heavy pros/cons/features/gallery dropped)
  to keep the client payload small with hundreds of products.
- **Catalog growth**: batch-4 (68 watch ASINs) + batch-5 (186 sunglasses/perfume
  ASINs) staged for the manual bulk import; `scripts/bulk-import.py` given
  gentler, escalating back-off + a cooldown after Amazon blocks so a rate-limited
  run can be re-run to pick up the remaining `pending` items.

**Revisit / next step**
- Marketing is now the bottleneck, not the site: put `…/links` in the IG/TikTok
  bio. Possible follow-ups discussed: a "copy link" button / QR for stories, and
  click tracking on the "See price on Amazon" out-links to measure ad performance.
- Confirm the bulk import reached all 254 products (re-run `bulk-import.py` while
  any `pending` remain — it's resumable).

---

## 2026-07-17 — Apply "hide affiliate price" to the link-in-bio page

**What changed**
- `/links` (link-in-bio) "Just Added" cards now use `publicPrice(p)` instead of
  `displayPrice(p)`, so affiliate products show "شوف السعر على أمازون" /
  "See price on Amazon" instead of a hard price — bringing this page in line
  with the affiliate-price policy below (it had been missed).

**Why**
- The earlier "hide fixed price" pass updated the product page, product card,
  compare and assistant, but not the newer `/links` page, so it was still
  printing affiliate prices. This closes that gap.

**Revisit / next step**
- The `/shop` filter/sort still uses `displayPrice` for its price *range filter*
  and price *sort* (it never displays the number). Left as-is for now since ~all
  products are affiliate; revisit whether to hide those controls or scope them to
  own products once there are more own products.

---

## 2026-07-17 — Affiliate products: hide fixed price, show "See price on Amazon"

**What changed**
- Affiliate products no longer display a hard price number. They show a
  "شوف السعر على أمازون" / "See price on Amazon" out-link instead.
- Own products (sold on-site via Stripe) are unchanged — they still show price.
- New helper `publicPrice(p)` in `src/lib/catalog-types.ts`: returns the price
  for `own` products and `null` for affiliate products.
- Applied in: `src/app/[locale]/product/[slug]/page.tsx` (price block +
  schema.org `offers` gated to own), `src/components/shop/product-card.tsx`,
  `src/components/shop/compare-client.tsx`, and `src/app/api/assistant/route.ts`
  (assistant no longer emits a price for affiliate items).
- Commit: `hide fixed price on affiliate products`.

**Why**
- Goal was to auto-update affiliate prices every ~2 days to match real Amazon
  prices, for free, with no manual work. That combo is not currently possible:
  - Amazon PA-API / Creators API is **blocked** — the account has **0 qualifying
    sales**, which is required for API access.
  - Scraping Amazon is fragile, gets blocked, and **risks the Associates
    account** (affiliates may only display prices obtained via the official API).
  - Paid data services (Keepa ~€49/mo, Rainforest ~$66/mo) aren't worth the cost
    before any sales exist.
- Chosen path: never print a hard affiliate price; let the shopper see the live,
  always-correct price on Amazon via the button. Free, compliant, zero-risk.

**Revisit / next step**
- Build the real automatic price sync **only after** the first qualifying sales
  unlock the official Amazon API (free path). Getting sales is marketing work =
  the separate "Elite Market — Marketing" project.

---

## Context notes (durable facts about this project)

- **Where the ~400 products live:** in the live catalog JSON inside a persistent
  Docker volume (`elitemarket_content` → `/app/content/products.json`) on the
  VPS — NOT in `content/products.json` in the repo (that's 4 seed items only).
  Redeploys and admin edits persist; deploying never overwrites those products.
- **Deploy flow:** commit + push locally → `ssh root@72.61.117.194` →
  `cd /opt/elitemarket` → `git pull` →
  `docker compose -f docker-compose.prod.yml up -d --build`. The real build /
  typecheck happens inside that container build (`npm run build`). Root `/`
  returns HTTP 307 → `/en`, which is expected, not an error.
- **Parallel work:** an "Elite Market — Marketing" session pushes large updates
  to the same `main`; expect the local repo to be behind origin and to need a
  `git pull` (merge) before pushing.
- **n8n "Weekly Price Sync" workflow** is misnamed — it syncs social-post
  **captions** into a rotation Data Table, not Amazon or site prices. Part of the
  Marketing project.
- **`content/import/*.json` + `scripts/bulk-import.py`** are staging data for a
  **manual** bulk import; deploying does NOT run them (container CMD is just
  `node server.js`).
- Never print or commit `.env` / `.env.production`.
