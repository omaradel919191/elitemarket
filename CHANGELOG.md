# Changelog — Elite Market (Web)

Human-readable log of notable changes and the reasoning behind them, so any
agent (Claude Code / Cowork) or teammate opening this repo understands recent
work without re-deriving it from diffs.

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
