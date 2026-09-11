#!/usr/bin/env bash
# Run from any directory inside a fresh Tinct cloud checkout.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root/app"

if ! command -v node >/dev/null 2>&1; then
  echo "Node 24 is required. Configure Node 24.13.0 in the cloud environment." >&2
  exit 1
fi
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) { console.error("Tinct cloud setup requires Node 24; found " + process.version); process.exit(1) }'
node --version
npm --version
npm ci
