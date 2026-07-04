#!/usr/bin/env python3
"""
Bulk-import affiliate products into the LIVE Elite Market catalog from a list of
Amazon.ae URLs. Built for large batches (100+): it is polite to Amazon, retries
on throttling, and is fully RESUMABLE — products already in the catalog are
skipped, so if Amazon blocks you part-way, just run it again later and it picks
up where it left off.

For each new product it:
  1. fetches the Amazon page (browser UA, retries),
  2. extracts title / price / image gallery,
  3. writes bilingual EN + AR copy via the store's Anthropic key,
  4. appends the product to the live catalog volume (persisted after each one).

Usage (on the server, from /opt/elitemarket, ideally inside tmux):
    python3 scripts/bulk-import.py content/import/urls.txt
    python3 scripts/bulk-import.py content/import/my-list.xlsx

Accepts a plain-text file (one URL per line) OR an .xlsx — any /dp/ASIN links
inside are picked up. Re-run until it reports 0 pending.
"""
import glob
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
import zipfile

CONTAINER = "elitemarket-prod-web"
LIVE_PATH = "/app/content/products.json"
ENV_FILE = os.path.join(os.path.dirname(__file__), "..", ".env")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
MODEL = "claude-haiku-4-5-20251001"
CATS = ("perfumes", "watches", "sunglasses")
BADGES = ("best-pick", "luxury-deal", "editor-choice")
AUDS = ("men", "women", "unisex")
DELAY = 5          # base seconds between products (politeness)
RETRIES = 4        # fetch attempts per product before marking pending
BLOCK_COOLDOWN = 25  # seconds to let the IP cool after a product is blocked


# ---------- input ----------
def read_urls(path: str) -> list:
    if path.lower().endswith(".xlsx"):
        z = zipfile.ZipFile(path)
        text = ""
        if "xl/sharedStrings.xml" in z.namelist():
            text = z.read("xl/sharedStrings.xml").decode("utf-8", "ignore")
    else:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    asins = []
    seen = set()
    for m in re.finditer(r"/dp/([A-Z0-9]{10})", text):
        a = m.group(1)
        if a not in seen:
            seen.add(a)
            asins.append(a)
    return asins


def env_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key and os.path.exists(ENV_FILE):
        for line in open(ENV_FILE, encoding="utf-8"):
            m = re.match(r'\s*ANTHROPIC_API_KEY\s*=\s*"?([^"\n]+)"?', line)
            if m:
                key = m.group(1).strip()
                break
    if not key:
        sys.exit("ERROR: ANTHROPIC_API_KEY not found (env or .env).")
    return key


# ---------- live catalog (docker volume) ----------
def read_live() -> list:
    r = subprocess.run(["docker", "exec", CONTAINER, "cat", LIVE_PATH],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"ERROR reading live catalog: {r.stderr.strip()}")
    return json.loads(r.stdout)


def write_live(products: list) -> None:
    payload = json.dumps(products, ensure_ascii=False, indent=1)
    json.loads(payload)  # sanity
    w = subprocess.run(["docker", "exec", "-i", CONTAINER, "sh", "-c",
                        f"cat > {LIVE_PATH}"], input=payload, text=True,
                       capture_output=True)
    if w.returncode != 0:
        sys.exit(f"ERROR writing catalog: {w.stderr.strip()}")


def existing_asins(catalog: list) -> set:
    out = set()
    for p in catalog:
        for l in p.get("links", []):
            m = re.search(r"/dp/([A-Z0-9]{10})", l.get("url", ""))
            if m:
                out.add(m.group(1))
    return out


# ---------- scrape ----------
def fetch(asin: str) -> str:
    try:
        req = urllib.request.Request(
            f"https://www.amazon.ae/dp/{asin}",
            headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9",
                     "Accept": "text/html"})
        return urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
    except Exception:
        return ""


def extract(h: str) -> dict:
    t = re.search(r"<title>(.*?)</title>", h, re.S)
    title = html.unescape(t.group(1)).split(" : ")[0].strip() if t else ""
    if "Robot Check" in h or "captcha" in h.lower():
        title = ""
    price = None
    m = re.search(r'"priceAmount":\s*([0-9]+(?:\.[0-9]+)?)', h)
    if m:
        price = float(m.group(1))
    imgs = [x.replace("\\/", "/") for x in re.findall(r'"hiRes":"(https://[^"]+)"', h)]
    if not imgs:
        imgs = [x.replace("\\/", "/") for x in re.findall(r'"large":"(https://[^"]+)"', h)]
    seen, gallery = set(), []
    for i in imgs:
        if "media-amazon" in i and i not in seen:
            seen.add(i)
            gallery.append(i)
    return {"title": title, "priceAed": price, "images": gallery[:4]}


# ---------- AI bilingual copy ----------
SYSTEM = (
    "You write catalogue entries for Elite Market, a curated luxury affiliate "
    "storefront in the UAE. From the scraped product info, produce a polished "
    "bilingual entry. Arabic must use NO tashkeel (no diacritics). Keep it "
    "premium, specific and HONEST — never invent specs, prices or materials. "
    f"Pick category from exactly: {' | '.join(CATS)}. "
    f"Pick badge from exactly: {' | '.join(BADGES)}. "
    f"Pick audience from exactly: {' | '.join(AUDS)}. "
    "Return ONLY a JSON object, no markdown, with keys: name, nameAr, blurb, "
    "blurbAr, category, audience, badge, brand, bestFor, bestForAr, "
    "pros (3), prosAr (3), cons (1-2), consAr (1-2), features (3), featuresAr (3)."
)


def ai_copy(key: str, title: str, price, url: str) -> dict:
    user = (f"Title: {title}\nPrice (AED): {price if price is not None else 'unknown'}\n"
            f"URL: {url}")
    body = json.dumps({
        "model": MODEL, "max_tokens": 1100, "system": SYSTEM,
        "messages": [{"role": "user", "content": user}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=body,
        headers={"x-api-key": key, "anthropic-version": "2023-06-01",
                 "content-type": "application/json"})
    raw = urllib.request.urlopen(req, timeout=60).read().decode()
    text = "".join(b.get("text", "") for b in json.loads(raw).get("content", []))
    return json.loads(re.search(r"\{[\s\S]*\}", text).group(0))


# ---------- build ----------
def slugify(s: str) -> str:
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", s.lower()))[:60]


def build(ai: dict, data: dict, asin: str, taken: set) -> dict:
    slug = slugify(ai.get("name") or asin) or asin.lower()
    if slug in taken:
        slug = f"{slug}-{asin.lower()}"[:70]
    cat = ai.get("category") if ai.get("category") in CATS else "watches"
    badge = ai.get("badge") if ai.get("badge") in BADGES else "best-pick"
    aud = ai.get("audience") if ai.get("audience") in AUDS else "unisex"
    price = data["priceAed"]
    url = f"https://www.amazon.ae/dp/{asin}"
    imgs = data["images"]
    return {
        "slug": slug, "category": cat, "brand": ai.get("brand", "").strip() or "ELITE",
        "name": ai.get("name", data["title"])[:200], "nameAr": ai.get("nameAr", ""),
        "blurb": ai.get("blurb", ""), "blurbAr": ai.get("blurbAr", ""),
        "image": imgs[0], "images": imgs[1:],
        "rating": None, "priceAed": price, "stock": None, "deal": False, "wasAed": None,
        "badge": badge, "bestFor": ai.get("bestFor", ""), "bestForAr": ai.get("bestForAr", ""),
        "pros": ai.get("pros", []), "prosAr": ai.get("prosAr", []),
        "cons": ai.get("cons", []), "consAr": ai.get("consAr", []),
        "features": ai.get("features", []), "featuresAr": ai.get("featuresAr", []),
        "source": "affiliate", "audience": aud,
        "links": [{"retailer": "amazon", "url": url, "priceAed": price}],
    }


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 scripts/bulk-import.py <urls.txt|list.xlsx>")
    key = env_key()
    asins = read_urls(sys.argv[1])
    catalog = read_live()
    done = existing_asins(catalog)
    taken = {p["slug"] for p in catalog}
    todo = [a for a in asins if a not in done]
    print(f"{len(asins)} URLs, {len(todo)} new to import, {len(asins) - len(todo)} already present.")

    added, pending = 0, []
    for i, asin in enumerate(todo, 1):
        data = None
        for att in range(RETRIES):
            data = extract(fetch(asin))
            if data["title"] and data["images"]:
                break
            time.sleep(8 * (att + 1))  # escalating back-off eases throttling
            data = None
        if not data:
            pending.append(asin)
            print(f"[{i}/{len(todo)}] {asin}  BLOCKED (will retry next run)", flush=True)
            time.sleep(BLOCK_COOLDOWN)  # let the IP cool before the next fetch
            continue
        try:
            ai = ai_copy(key, data["title"], data["priceAed"], f"https://www.amazon.ae/dp/{asin}")
            product = build(ai, data, asin, taken)
        except Exception as e:
            pending.append(asin)
            print(f"[{i}/{len(todo)}] {asin}  copy failed: {e}", flush=True)
            time.sleep(DELAY)
            continue
        catalog.append(product)
        taken.add(product["slug"])
        write_live(catalog)  # persist after each — safe to interrupt
        added += 1
        print(f"[{i}/{len(todo)}] {asin}  added: {product['name'][:50]}"
              f" ({product['category']}, {product['priceAed']})", flush=True)
        time.sleep(DELAY)

    print(f"\nDone this run: added {added}, pending {len(pending)}.")
    if pending:
        print("Pending (Amazon throttled) — re-run later to finish:")
        print(" ".join(pending))


if __name__ == "__main__":
    main()
