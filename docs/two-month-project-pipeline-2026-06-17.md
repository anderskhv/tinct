# Tinct Two-Month Resume Pipeline — 2026-06-17

Audience: Anders and any agent resuming after travel.

Purpose: one current project pipeline across architecture, app stability, SEO, content, and APK. This supersedes stale counts in older roadmap docs. Do not execute blindly: inspect current code, run inventory, and verify production before changing anything.

## Resume Checkpoint

- Production is live and smoke-tested.
- Latest deployed Worker: `1fece18c-5bf3-4f6a-9943-2ad629544477`.
- Latest app/SEO deploy commit: `8c0ce4fba seo: add social cards to generated book pages`.
- Android test APK: `/Users/andershvelplund/Desktop/Tinct-test-2026-06-17.apk`.
- Public catalog: 100 books, including Ivan Ilyich.
- Sitemap: 3,965 URLs.
- IndexNow submitted successfully on 2026-06-17.
- Production smoke test: 15/15 passing.
- Verification gates passed before deploy: `npm run build`, `npm run verify-bundle`, `npm test -- --run`.

## First Hour Back

1. Do not start with architecture work. Install and use the APK first; collect actual field bugs from reading.
2. Re-establish the repo state:

```bash
bash scripts/tinct-status.sh
python3 books/wip_inventory.py
python3 books/wip_inventory.py --audio
```

3. Do not deploy from the primary local repo until it is reconciled. At shutdown it was dirty and diverged from `origin/main`; the good SEO state is reproducible from `origin/main` and the clean deploy worktree, not from that stale local checkout.
4. Verify production still matches the checkpoint:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
bash scripts/smoke-test.sh
```

5. Check the SEO surface:

```bash
curl -I https://tinct.app/read/odyssey
curl -s https://tinct.app/read/odyssey | rg "Modern Translation|og:image|twitter:card"
curl -s https://tinct.app/sitemap.xml | rg -c "<url>"
```

## Architecture Pipeline

### A. Stability Before Refactor

- Treat reading position as the highest-risk surface.
- If the APK is stable in real use, avoid Reader architecture work until there is a concrete bug or narrow refactor target.
- If a position bug appears, trace the actual writer/path first; do not patch by intuition.

### B. Position Anchoring

Current long-term direction: paragraph-first anchoring plus content-local intra-paragraph offset.

- Persist `chapterNumber`, `paragraphIndex`, and optional `charOffset`.
- Use `paragraphIndex` as the stable cross-edition anchor.
- Use `charOffset / paragraphLength` as same-edition exact restore and cross-edition refinement.
- Keep `scrollFraction` only as legacy fallback, progress signal, and regression guard.
- Detailed plan: `docs/position-anchor-plan.md`.

Do this only if position issues remain after real APK use.

### C. Reader Slice 4

Already extracted into `app/src/components/reader/`:

- `selectionGeometry.ts`
- `useDefine.ts`
- `issueReport.ts`
- `SelectionPopup.tsx`

Remaining fragile work:

1. Selection engine extraction, only if there is an active selection/highlight bug.
2. Pagination extraction, only with focused regression tests and desktop/mobile device verification.

Do not combine these with SEO or book publication work.

### D. Pre-Deploy Guard

Add a guard so staged book files cannot publish just because files exist in `app/public/data`.

Current inventory after final deploy:

- Live books are entries in `BOOKS`.
- Staged book: Treasure Island.
- Run `python3 books/wip_inventory.py` before making publication claims.

## SEO Pipeline

### Current SEO Baseline

- 100 generated book landing pages are committed and served at `/read/{bookId}`.
- Generated titles/descriptions are CTR-oriented and capped:
  - generated titles <= 60 chars;
  - generated descriptions <= 155 chars;
  - Odyssey is an explicit hand-tuned exception.
- Generated pages include `og:image`, `twitter:card`, and `twitter:image`.
- Live Odyssey was verified with:
  - title: `Read The Odyssey Online — Modern Translation, AI Companion, Audiobook | Tinct`;
  - `og:image`: `https://tinct.app/og-image.png`;
  - image HTTP 200, `image/png`.
- SEO roadmap: `docs/seo-roadmap.md`.

### Next SEO Actions

1. Build strategic translation-comparison pages. This is the highest-leverage next SEO move.
   - Start with Crime and Punishment.
   - Target: `Crime and Punishment modern English`, `best translation of Crime and Punishment`, `Crime and Punishment free online`.
   - Make Tinct the answer: original/public-domain text, modern English comparison, no ads, AI companion, Cast, audio.
2. Split sitemap into an index:
   - marketing/library;
   - generated book landing pages;
   - full-tier chapter/theme/cast pages;
   - strategic translation-comparison pages.
3. Stabilize `lastmod` so it changes only when relevant source content changes.
4. Make SEO/static page cache headers cacheable where safe; avoid blanket `no-store` for crawler-facing static pages.
5. In Bing Webmaster Tools:
   - manually raise crawl quota;
   - resubmit/fetch the sitemap;
   - monitor crawl capacity and indexed pages after one to two weeks.
6. Consider promoting Ivan Ilyich to a Full or focused strategic page set. It is short, curriculum-friendly, and has onboarding + threads.

## Content Pipeline

### Treasure Island

- Treasure Island remains staged, not published.
- Do not assume its repaired modern-en work is live.
- Before publishing, run:

```bash
python3 books/wip_inventory.py
python3 books/wip_inventory.py --audio
```

- Keep content publication separate from app/SEO deploys.

### New Books

- A book is live only when it is in `BOOKS`.
- Every production book must be classified in the Library taxonomy.
- Do not use Anthropic APIs or `generate-editions.cjs` for development content work.

## APK Pipeline

Use the latest Desktop APK first:

```text
/Users/andershvelplund/Desktop/Tinct-test-2026-06-17.apk
```

To rebuild:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run build:android
cd android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Users/andershvelplund/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
./gradlew assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk /Users/andershvelplund/Desktop/Tinct-test-$(date +%Y-%m-%d).apk
```

## Verification And Deploy

For app/SEO changes:

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run build
npm run verify-bundle
npm test -- --run
```

Until Tinct has more than 10 users, deploy-after-verify is the default. After the gates above pass, deploy with `npm run deploy` from `app/` using the Node 24 nvm path. Do not ask first unless Anders said local-only. Never run raw `wrangler deploy`. Never deploy from a dirty or unreconciled local checkout. Never deploy secrets. Never skip verify-bundle.

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run deploy
bash scripts/smoke-test.sh
```

After SEO deploys:

```bash
npm run indexnow
```

Then verify a live sample, not just the deploy output.

## Files To Read First

- `AGENTS.md` — current Codex source of truth.
- `docs/two-month-architecture-handoff-2026-06-16.md` — detailed architecture checkpoint.
- `docs/seo-roadmap.md` — current SEO checkpoint and next SEO actions.
- `docs/position-anchor-plan.md` — position-anchor proposal.
- `docs/workflow-boundaries.md` — app/content/audio boundaries.
