# Tinct Pipelines

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

Last updated: 2026-09-21

Use this as the quick overview before opening Claude, Codex, or RunPod. Keep it short and current. Git history keeps the detailed record.

Run this first:

```bash
bash scripts/tinct-status.sh
```

For publication/WIP book inventory, run current-file checks instead of reading
this dashboard as a source of truth:

```bash
python3 books/wip_inventory.py
python3 books/wip_inventory.py --audio
```

## Instruction scope — September 21, 2026

Translation instructions and publication requirements now cover English editions only. Retired language-specific guides are recoverable in Git history. Existing texts, audio, schemas and runtime language support are untouched. Historical snapshots below are not a fresh status verification; use current-file checks. The next content-pipeline task is reconciling the approved modern-English review procedure.

## Active Processes

- RunPod: Kokoro audio batch may be active; verify from the pod or with `books/wip_inventory.py --audio`.
- Claude: modern-English content repairs; confirm current assignments before starting.
- Codex: library glass reel and librarian implementation is in release verification; see `docs/library-glass-librarian-2026-09-16.md`.
- Claude (cloud): Fish Audio narration pilot on `claude/eloquent-wozniak-4il2zo`, opt-in only, waiting on a Fish API key and the release owner; see `docs/fish-audio-pilot-2026-09-18.md`.

## Working Tree

- Last known status: dirty worktree across app/content/audio docs; always classify with `bash scripts/tinct-status.sh`.
- Always confirm with `bash scripts/tinct-status.sh` before opening Claude or Codex.

Detailed modern-English repair tracker: `books/MODERN-EN-REPAIR-STATUS.md`.

Important: the reported mechanical `modern-en` batch for Wealth of Nations, Leviathan, Don Quixote, Montaigne, and Anna Karenina should not be treated as final `modern-en` without review or regeneration. `modern-en` means a full modern-English rendering, not regex/dictionary cleanup.

## Work Lanes

### App / Codex

Owner: Codex.

Use for reader UX, auth, sync, billing, library UI, Cloudflare Worker code, deploys, and publication.

Gate:

```bash
cd app
npm run build
npm run verify-bundle
```

Until Tinct has more than 10 users, deploy-after-verify is the default. After the gates above pass, deploy with `npm run deploy` from `app/` using the Node 24 nvm path. Do not ask first unless Anders said local-only. Never run raw `wrangler deploy`. Never deploy from a dirty or unreconciled local checkout. Never deploy secrets. Never skip verify-bundle.

```bash
cd app
export PATH=/Users/andershvelplund/.nvm/versions/node/v24.13.0/bin:$PATH
npm run deploy
```

### Book Content / Claude

Owner: Claude from `books/`.

Canonical book package:

1. Source found and validated.
2. Original parsed.
3. Public-domain human English translation added for non-English originals.
4. `modern-en` complete.
5. Onboarding and threads added where appropriate.
6. QA passed.
7. Audio generated and verified.
8. Codex publishes.

Current WIP snapshot from `books/wip_inventory.py --audio`:

- 22 unpublished/WIP books.
- Closest: `treasure-island` has aligned editions, onboarding, and threads; remaining blockers are registry plus English audio and final text QA.
- 12 staged Shakespeare plays have text and English audio; all need onboarding + threads.
- Hume/Kant have text but need onboarding, threads decision, and all audio.
- `leviathan` needs final text QA plus onboarding/threads.
- `wealth-of-nations`, `don-quixote`, `essays-montaigne`, and `anna-karenina` need real `modern-en` repair before publication.
- `frederick-douglass` and `werther` are loose source-only starts.

Claude should translate or editorially repair only exact assigned files/chapters.
Codex owns inventory, publication readiness, registry, app verification, and deploy.

### Audio / RunPod

Owner: RunPod plus local audit scripts.

Production backlog source of truth:

```bash
python3 books/wip_inventory.py --audio
cd books && python3 r2_missing_english_audio.py --scope all --runpod-command
```

Rules:

- Kokoro/RunPod for English editions.
- RunPod `CLOUDFLARE_API_TOKEN` must be the R2 upload token, not the app deploy token.
- Re-run the R2 audit after RunPod finishes.

### Publication / Codex

Owner: Codex.

A book may move into public `BOOKS` only when:

- source and editions are complete
- human English translation exists for non-English originals
- `modern-en` is complete
- QA passed
- onboarding exists
- taxonomy is complete
- audio flags match actual R2 coverage
- app build and bundle verification pass

## Bella word-sync planning — 2026-09-21

See [Bella word-sync repair plan](docs/bella-word-sync-repair-plan-2026-09-21.md). Planning only: first refresh the Bella-specific production ledger, recover reusable results, and choose a small representative pilot. No new paid alignment, publication or deployment has started. Existing historical audio backlog instructions do not authorize execution of this proposed repair plan.

## Next Actions

1. Confirm Claude's current modern-English repair assignment, then verify JSON/structure/terms.
2. Continue RunPod audio backlog and rerun `python3 books/wip_inventory.py --audio`.
3. If Treasure Island audio completes and text QA passes, Codex can prepare registry publication.
4. Next translation work for Claude should be a narrow exact-file/chapter assignment, not a broad audit.
