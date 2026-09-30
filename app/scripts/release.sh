#!/usr/bin/env bash
# Staged release commands. Use these through the npm scripts, never raw wrangler:
#   npm run release:upload            build + verify + upload a Worker Version (NOT live)
#   npm run release:promote -- <id>   send 100% of production traffic to that version
#   npm run rollback                  return production to the previous deployment
#   npm run rollback -- <version-id>  return production to a specific version
set -euo pipefail
cd "$(dirname "$0")/.."

# Local runs read app/.env; CI supplies CLOUDFLARE_* in the environment.
set -a
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi
set +a

cmd="${1:-}"
shift || true

case "$cmd" in
  upload)
    npm run build
    npm run verify-bundle
    node scripts/check-deploy-source.cjs --head-only
    npx wrangler versions upload \
      --tag "$(git rev-parse --short=12 HEAD)" \
      --message "$(git log -1 --format=%s | cut -c1-100)"
    ;;
  promote)
    id="${1:?usage: release.sh promote <version-id>}"
    npx wrangler versions deploy "${id}@100%" --yes --message "promote $(git rev-parse --short=12 HEAD)"
    ;;
  rollback)
    # No id: Cloudflare rolls back to the previous deployment.
    # Cloudflare refuses if a Durable Object migration landed in between.
    if [ -n "${1:-}" ]; then
      npx wrangler rollback "$1" --yes --message "rollback to $1"
    else
      npx wrangler rollback --yes --message "rollback to previous deployment"
    fi
    ;;
  *)
    echo "usage: release.sh upload | promote <version-id> | rollback [version-id]" >&2
    exit 2
    ;;
esac
