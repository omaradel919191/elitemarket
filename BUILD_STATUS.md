# Elite Market — Build Status & Roadmap

Luxury **affiliate** storefront (no cart/checkout/payments — products redirect to
Amazon & Noon). Bilingual EN/AR with full RTL. Domain: `eliteperfumesuae.com`.

> Code lives **outside** OneDrive at `C:\Users\omara\elite-market` (avoids sync locks).
> Brand assets are mirrored from `…\01_PROJECTS\Elite Market\Logo` into `public/brand`.

## Stack
- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 (CSS-first `@theme` in `src/app/globals.css`)
- next-intl (EN/AR routing, `as-needed` prefix, RTL via `dir`)
- Framer Motion + GSAP-ready + Lenis smooth scroll
- PostgreSQL + Drizzle ORM (schema layer — pending wiring)
- Anthropic SDK (AI product generator + shopping assistant — pending keys)

## Brand system
- Colors: ink `#08080A`, primary `#0F172A`, gold `#D4AF37`, silver/chrome, ash `#94A3B8`
- Fonts: EN → Cormorant Garamond (display) + Inter (body); AR → El Messiri + Tajawal
- Utilities: `text-gold-gradient`, `text-chrome-gradient`, `glass`, `glow-gold`,
  `spotlight`, `sheen`, `grain`, `gold-rule`

## Done (Milestone 1 — verified live in EN + AR)
- [x] Project scaffold, deps, brand assets
- [x] i18n routing + middleware/proxy + EN/AR messages (Arabic, no tashkeel)
- [x] Luxury design system (Tailwind v4 theme + utilities)
- [x] Root + locale layouts (fonts, dir, metadata/OG/alternates, providers)
- [x] Header (scroll-aware glass, mobile menu, language switcher)
- [x] Footer (columns, social, newsletter, affiliate disclosure)
- [x] Homepage: cinematic hero (product-universe orbit), category showcase,
      how-it-works, value props, CTA band
- [x] Newsletter API stub (`/api/newsletter`)
- [x] Live verification: EN/LTR + AR/RTL render correctly

## Next (Milestone 2 — data + pages)
- [ ] Drizzle schema: products, categories, deals, blog, media, redirects,
      subscribers, admin users, settings; migrations + seed (NO fake products)
- [ ] Product data-access layer + types + empty-state-ready queries
- [ ] ProductCard, rating, badges (Trending/Editor's Choice/Best Seller/...)
- [ ] Pages: Shop, Category (×4), Product detail (gallery/pros/cons/best-for +
      Buy on Amazon/Noon), Deals, Blog, Guides, About, Contact, Disclosure,
      Privacy, Terms, Search, Wishlist, Compare
- [ ] Affiliate outbound redirect route (`/go/[id]`) with disclosure + tracking

## Next (Milestone 3 — admin + AI)
- [ ] Admin auth (JWT) + dashboard shell (English-only, `/admin`)
- [ ] Modules: Products, Categories, Deals, Blog, Media, SEO Center,
      Homepage Builder, Affiliate Links, Settings, Users
- [ ] AI Product Generator (name + Amazon/Noon URL → copy/SEO, editable)
- [ ] AI Shopping Assistant (site-scoped product finder, EN/AR)
- [ ] SEO: sitemap, robots, JSON-LD (Product/Review/Article), OG images
- [ ] Analytics wiring (GA / Search Console / Clarity from settings)

## Next (Milestone 4 — deploy) — CREDENTIAL-GATED
- [ ] VPS deploy (Hostinger + Nginx + SSL) — **needs SSH access + DNS for
      `eliteperfumesuae.com`**
- [ ] Provider keys: `ANTHROPIC_API_KEY`, Amazon/Noon affiliate tags
- [ ] Production env + DB provisioning

## Run
```bash
cd C:\Users\omara\elite-market
npm run dev   # http://localhost:3300 (configured in repo launch)
```
