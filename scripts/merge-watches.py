#!/usr/bin/env python3
"""
Merge affiliate watch products into the LIVE Elite Market catalog.

The live catalog lives in the Docker volume (elitemarket_content) mounted at
/app/content/products.json inside the running container — NOT in this repo. The
app reads that file on every request, so no restart/rebuild is needed.

Idempotent: products already present (by slug) are skipped, so re-running is safe.
Backs up the current catalog to /tmp before writing.

Usage (on the server, from /opt/elitemarket):
    python3 scripts/merge-watches.py
"""
import json
import os
import subprocess
import sys

CONTAINER = "elitemarket-prod-web"
LIVE_PATH = "/app/content/products.json"
NEW_FILE = os.path.join(os.path.dirname(__file__), "..", "content", "import", "watches.json")
BACKUP = "/tmp/products.backup.json"


def read_live() -> list:
    r = subprocess.run(
        ["docker", "exec", CONTAINER, "cat", LIVE_PATH],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        sys.exit(f"ERROR reading live catalog: {r.stderr.strip()}")
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError as e:
        sys.exit(f"ERROR: live catalog is not valid JSON: {e}")


def write_live(products: list) -> None:
    payload = json.dumps(products, ensure_ascii=False, indent=1)
    json.loads(payload)  # sanity: must round-trip
    w = subprocess.run(
        ["docker", "exec", "-i", CONTAINER, "sh", "-c", f"cat > {LIVE_PATH}"],
        input=payload, text=True, capture_output=True,
    )
    if w.returncode != 0:
        sys.exit(f"ERROR writing catalog: {w.stderr.strip()}")


def main() -> None:
    live = read_live()
    with open(NEW_FILE, encoding="utf-8") as f:
        new = json.load(f)

    with open(BACKUP, "w", encoding="utf-8") as f:
        json.dump(live, f, ensure_ascii=False, indent=1)

    have = {p["slug"] for p in live}
    added = [p for p in new if p["slug"] not in have]
    skipped = [p["slug"] for p in new if p["slug"] in have]

    if not added:
        print(f"Nothing to add — all {len(new)} products already present.")
        return

    write_live(live + added)
    print(f"Backup: {BACKUP}")
    print(f"Live catalog had {len(live)} products, added {len(added)}, now {len(live) + len(added)}.")
    if skipped:
        print(f"Skipped (already present): {', '.join(skipped)}")
    print("Live now — the app reads the catalog per request, no restart needed.")


if __name__ == "__main__":
    main()
