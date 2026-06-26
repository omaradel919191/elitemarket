# Deploying Elite Market

Production runs as a single Docker container (Next.js standalone) behind the
host's existing **Traefik** reverse proxy. No host ports are published — Traefik
routes to the container over a shared Docker network and terminates TLS.

Target VPS: `72.61.117.194` (Hostinger). Traefik already owns ports 80/443.
Domain: `eliteperfumesuae.com` (+ `www`).

---

## 1. DNS

Point the domain at the VPS:

| Type | Name | Value           |
|------|------|-----------------|
| A    | `@`  | `72.61.117.194` |
| A    | `www`| `72.61.117.194` |

Wait for propagation (`dig eliteperfumesuae.com +short` → the VPS IP).

## 2. Get the code on the server

```bash
git clone <repo-url> /opt/elitemarket      # or rsync the project
cd /opt/elitemarket
```

## 3. Configure environment

```bash
cp .env.example .env
nano .env
```

Set at least:

- `ADMIN_PASSWORD` — strong password for the `/admin` dashboard.
- `AUTH_SECRET` — `openssl rand -base64 48`.
- `DOMAIN` — `eliteperfumesuae.com`.
- `TRAEFIK_NETWORK` — the **existing** Traefik network name. Confirm it:
  ```bash
  docker network ls                       # find Traefik's network (e.g. n8n_default)
  ```
- `CERT_RESOLVER` — the Traefik ACME resolver name. Confirm it:
  ```bash
  docker inspect <traefik-container> | grep -i certificatesresolvers
  ```
- Optional: `ANTHROPIC_API_KEY` (AI), `AMAZON_AFFILIATE_TAG` /
  `NOON_AFFILIATE_QUERY` (commission), `DATABASE_URL` (real catalog DB).

## 4. Build & start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This builds `elitemarket-web:latest` and starts `elitemarket-prod-web` on the
shared Traefik network. Traefik issues a certificate and begins routing on the
first request.

## 5. Verify

```bash
docker compose -f docker-compose.prod.yml ps      # web is healthy
docker compose -f docker-compose.prod.yml logs -f web
curl -I https://eliteperfumesuae.com              # 200, valid TLS
```

Check: homepage loads, `/shop` + a product page render, `/admin/login` works
with your `ADMIN_PASSWORD`, `/sitemap.xml` and `/robots.txt` resolve.

## 6. Updating

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Notes

- **Isolation:** this stack (`elitemarket-prod`) does not touch other stacks on
  the host. It publishes no host ports and only joins the Traefik network.
- **Products:** the catalogue ships with 4 launch products (one per category)
  and is edited in the admin (`/admin → Products → Add / Edit`). Data lives in
  `${DATA_DIR}/products.json`; the compose file mounts a named volume
  (`elitemarket_content`) at `/app/content` so admin edits persist across
  redeploys. Add the real Amazon/Noon URLs per product — until then each shows a
  clear "Buy links coming soon" state (never a dead link).
- **Affiliate:** set `AMAZON_ASSOCIATE_TAG` (e.g. `elitemarke072-21`) and, when
  available, `NOON_AFFILIATE_TAG`. The tag is appended to out-links at `/go`.
- **AI:** set `ANTHROPIC_API_KEY` to enable the shopping assistant and the
  admin "AI fill copy" button; both fall back gracefully without it.
- **Admin security:** always set `ADMIN_PASSWORD` + `AUTH_SECRET`. The login page
  warns while the insecure dev default is in use.
- **Locale:** URLs are prefixed (`/en`, `/ar`); `/` redirects to `/en`.
