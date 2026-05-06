#!/usr/bin/env bash
# seo-deploy.sh — guided deploy that combines the Odyssey SEO pages with
# whatever onboarding work is also in flight in the other agent window.
#
# CONTEXT (2026-05-05)
# --------------------
# Two parallel work streams have been touching the tree:
#
#   Window A (this work) shipped the Odyssey SEO page set:
#     - 28 static HTML pages under app/public/read/odyssey/
#     - app/public/sitemap.xml (themes + 24 chapter URLs added)
#     - app/src/worker.ts: BOOK_META map, meta-tag injection for /read/{bookId},
#       and the SEO route regex extended to include themes + chapter-N
#     - app/src/App.tsx: a deep-link useEffect that consumes ?chapter & ?edition,
#       sets the reader chapter/edition, and bypasses book onboarding
#     - app/vite.config.ts: dev middleware that mirrors the worker's clean-URL
#       rewrite (so /read/odyssey/summary etc. works without .html in dev)
#
#   Window B (other agent) is rewriting Book Onboarding v2 — files include
#     app/src/components/BookOnboardingPreface.tsx and friends. None of those
#     paths overlap with Window A.
#
# The two streams are mechanically independent. The only structural touchpoint
# is App.tsx — Window A added a single useEffect that marks a book as
# "onboarded" when ?chapter or ?edition is present, so the new onboarding
# modal doesn't fire on a deep link. If the new onboarding uses a storage key
# other than `book-onboarded:{bookId}`, that one line will need updating once
# the rewrite lands. Cheap follow-up.
#
# This script does NOT auto-stage Window B's changes. It stages exactly the
# Window A paths and prints the unstaged tree so the operator can decide what
# else to add for the combined commit. Run this from the repo root.
#
# USAGE
# -----
#   bash app/scripts/seo-deploy.sh          # interactive — prompts before each step
#   bash app/scripts/seo-deploy.sh --check  # dry run, no changes
#
# After the SEO commit lands, the operator can either commit Window B's work
# in a follow-up commit or amend before deploying. Either way, `npm run deploy`
# at the end builds from committed state only.

set -euo pipefail

REPO_ROOT="/Users/andershvelplund/Documents/Projects/Tinct"
APP_DIR="$REPO_ROOT/app"
DRY_RUN=0
if [[ "${1:-}" == "--check" ]]; then DRY_RUN=1; fi

cd "$REPO_ROOT"

heading() { printf "\n\033[1m== %s ==\033[0m\n" "$1"; }
note()    { printf "  %s\n" "$1"; }
run()     { if [[ $DRY_RUN -eq 1 ]]; then echo "  [dry] $*"; else "$@"; fi; }
prompt()  { read -rp "  $1 [y/N] " answer; [[ "$answer" =~ ^[Yy]$ ]]; }

# ---------------------------------------------------------------------------
heading "1. Sanity checks"
# ---------------------------------------------------------------------------
note "Branch: $(git rev-parse --abbrev-ref HEAD)"
note "Ahead of origin: $(git rev-list --count origin/main..HEAD) commit(s)"

# Refuse to run if we're not on main. Add a flag if you ever want to override.
if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
  echo "ERROR: not on main. Aborting." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
heading "2. Show what Window A will stage"
# ---------------------------------------------------------------------------
SEO_PATHS=(
  "app/public/read/odyssey/"
  "app/public/sitemap.xml"
  "app/src/App.tsx"
  "app/src/worker.ts"
  "app/vite.config.ts"
  "app/scripts/seo-deploy.sh"
  "docs/seo-pages-blueprint.md"
)
for p in "${SEO_PATHS[@]}"; do
  status=$(git status --short -- "$p" 2>/dev/null | head -1)
  if [[ -n "$status" ]]; then
    note "  $status"
  fi
done

# ---------------------------------------------------------------------------
heading "3. Show what is OUTSIDE Window A's scope (Window B + misc)"
# ---------------------------------------------------------------------------
note "These will NOT be auto-staged. Operator must decide whether to include:"
git status --short \
  | grep -vE '^\?\? app/public/read/odyssey/' \
  | grep -vE '^\?\? app/public/sitemap\.xml$' \
  | grep -vE '^ M app/src/App\.tsx$' \
  | grep -vE '^ M app/src/worker\.ts$' \
  | grep -vE '^ M app/vite\.config\.ts$' \
  | grep -vE '^\?\? app/scripts/seo-deploy\.sh$' \
  | grep -vE '^\?\? docs/seo-pages-blueprint\.md$' \
  | sed 's/^/  /' \
  | head -40
echo

if [[ $DRY_RUN -eq 1 ]]; then
  echo "Dry run complete. Re-run without --check to proceed."
  exit 0
fi

prompt "Continue and stage the Window A paths above?" || { echo "Aborted."; exit 0; }

# ---------------------------------------------------------------------------
heading "4. Stage Window A paths"
# ---------------------------------------------------------------------------
for p in "${SEO_PATHS[@]}"; do
  if [[ -e "$p" ]]; then
    run git add "$p"
  fi
done

note "Staged:"
git diff --cached --stat | sed 's/^/  /'

# ---------------------------------------------------------------------------
heading "5. Local build check (committed-state simulation)"
# ---------------------------------------------------------------------------
# CRITICAL: use `git stash -u` (includes untracked) — never `git clean -fd`.
# A previous version of this script used `stash create` + `clean -fd`, which
# silently destroyed untracked files (TopUpModal.tsx, services/dictionary.ts)
# during a deploy on 2026-05-05. Untracked files are NOT in `git stash create`
# unless you pass `-u`, and `git clean -fd` deletes them irreversibly.
note "Stashing all unstaged Window B work (tracked + untracked)..."
STASHED=0
if ! git diff --quiet HEAD -- ':!app/scripts/seo-deploy.sh' ':!docs/seo-pages-blueprint.md' \
   || git ls-files --others --exclude-standard | grep -qv -e '^app/scripts/seo-deploy.sh$' -e '^docs/seo-pages-blueprint.md$'; then
  if git stash push -u --keep-index -m "seo-deploy parking — Window B WIP" >/dev/null 2>&1; then
    STASHED=1
  fi
fi

note "Running npm run build in $APP_DIR ..."
if ! ( cd "$APP_DIR" && npm run build ); then
  echo "BUILD FAILED. Restoring Window B work and aborting." >&2
  if [[ $STASHED -eq 1 ]]; then git stash pop; fi
  exit 1
fi

if [[ $STASHED -eq 1 ]]; then
  note "Restoring Window B working tree..."
  git stash pop
fi

# ---------------------------------------------------------------------------
heading "6. Commit Window A"
# ---------------------------------------------------------------------------
prompt "Create the SEO commit now?" || { echo "Skipped commit. Exiting."; exit 0; }

git commit -m "$(cat <<'EOF'
Add Odyssey SEO page set + per-book reader meta tags

5 page types per book (summary / themes / chapters / cast / chapter-N):
- 28 static HTML pages for The Odyssey at /read/odyssey/{type}
- Sitemap entries for all 28 pages
- Worker route extended to serve themes + chapter-N as clean URLs
- Worker injects book-specific meta tags into the SPA shell at /read/{bookId}
  so transactional searches (read odyssey free, odyssey AI companion) get
  proper title/description instead of the generic SPA title
- App.tsx consumes ?chapter=N&edition=X URL params from SEO deep links,
  jumps the reader to that chapter/edition, and bypasses book onboarding
- Vite dev middleware mirrors the worker rewrite so clean URLs work locally

Pattern is templated for re-use; see docs/seo-pages-blueprint.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

note "Commit landed. Window B's work is still uncommitted in the working tree."

# ---------------------------------------------------------------------------
heading "7. Deploy"
# ---------------------------------------------------------------------------
prompt "Run npm run deploy now? (Skip if Window B wants to land their commit first)" \
  || { echo "Skipped deploy. To deploy later, run: ( cd app && npm run deploy ) && ./app/scripts/smoke-test.sh"; exit 0; }

( cd "$APP_DIR" && npm run deploy )

# ---------------------------------------------------------------------------
heading "8. Smoke test"
# ---------------------------------------------------------------------------
"$APP_DIR/scripts/smoke-test.sh"

# ---------------------------------------------------------------------------
heading "9. Production sanity for the new pages"
# ---------------------------------------------------------------------------
note "Hand-checking a few of the new SEO URLs..."
for path in \
  /read/odyssey/summary \
  /read/odyssey/themes \
  /read/odyssey/chapter-9 \
  /read/odyssey/cast
do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://tinct.app$path")
  printf "  %-32s %s\n" "$path" "$status"
done

note "Done. Open https://tinct.app/read/odyssey/summary in a private window to verify."
