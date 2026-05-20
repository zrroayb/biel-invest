#!/usr/bin/env bash
# Restore Cloudflare Worker secrets from a local env file (default: .env.local).
# Does NOT commit secrets. Requires: npx wrangler login
#
# Usage:
#   ./scripts/cf-restore-env.sh
#   ./scripts/cf-restore-env.sh /path/to/.env.local
#
# After this, also add the SAME keys in Cloudflare Dashboard:
# Workers & Pages → bielinvest → Builds → Build configuration → Environment variables
# (Git deploy needs build-time env for NEXT_PUBLIC_* and WRANGLER_BUILD_*)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT/.env.local}"
WORKER_NAME="bielinvest"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Dosya yok: $ENV_FILE"
  echo "Önce .env.example kopyala: cp .env.example .env.local"
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# wrangler secret bulk: KEY=value lines; skip comments and empty
grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | grep -v '^#' >"$TMP" || true

if [[ ! -s "$TMP" ]]; then
  echo "Env dosyasında KEY=value satırı yok: $ENV_FILE"
  exit 1
fi

echo "Worker: $WORKER_NAME"
echo "Kaynak: $ENV_FILE"
echo "Satır sayısı: $(wc -l <"$TMP" | tr -d ' ')"
echo ""
echo "Cloudflare'a secret yüklenecek (mevcut secret'ları günceller, silmez)."
read -r -p "Devam? [y/N] " ok
[[ "${ok,,}" == "y" ]] || exit 0

cd "$ROOT"
npx wrangler secret bulk "$TMP" --name "$WORKER_NAME"

echo ""
echo "Liste:"
npx wrangler secret list --name "$WORKER_NAME" || true

echo ""
echo "=== Sıradaki adım (Git build için zorunlu) ==="
echo "Dashboard → Workers & Pages → $WORKER_NAME → Builds → Build configuration → Edit"
echo "→ Environment variables: .env.local içeriğinin TAMAMINI + şunları ekle:"
echo "  WRANGLER_BUILD_PLATFORM=node"
echo "  WRANGLER_BUILD_CONDITIONS=   (değer boş bırakılabilir)"
echo "  NEXT_PUBLIC_SITE_URL=https://bielinvest.gcradg.workers.dev"
echo ""
echo "Kaydet → Redeploy. Sonra: /api/health → firebaseConfigured: true"
