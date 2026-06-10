# Tinct Pipelines

Last updated: 2026-05-26

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

## Active Processes

- RunPod: Kokoro audio batch may be active; verify from the pod or with `books/wip_inventory.py --audio`.
- Claude: Treasure Island Danish cleanup may be active; keep Claude scoped to translation/editorial work.
- Codex: no long-running app process.

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

Deploy only when Anders explicitly asks:

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
5. `modern-da` complete from `modern-en`.
6. Onboarding and threads added where appropriate.
7. QA passed.
8. Audio generated and verified.
9. Codex publishes.

Current WIP snapshot from `books/wip_inventory.py --audio`:

- 22 unpublished/WIP books.
- Closest: `treasure-island` has aligned editions, onboarding, and threads; remaining blockers are registry plus English/Danish audio and final Danish QA.
- 12 staged Shakespeare plays have text and English audio; all need onboarding + threads. Four also need Danish audio: `twelfth-night`, `measure-for-measure`, `henry-iv-part-2`, `merry-wives-of-windsor`.
- Hume/Kant have text but need onboarding, threads decision, and all audio.
- `leviathan` needs final text QA plus onboarding/threads/Danish audio.
- `wealth-of-nations`, `don-quixote`, `essays-montaigne`, and `anna-karenina` need real `modern-en` repair before publication; their `modern-da` is not publication-quality until regenerated from repaired English.
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
- Google Chirp for Danish.
- RunPod `CLOUDFLARE_API_TOKEN` must be the R2 upload token, not the app deploy token.
- Re-run the R2 audit after RunPod finishes.

### Publication / Codex

Owner: Codex.

A book may move into public `BOOKS` only when:

- source and editions are complete
- human English translation exists for non-English originals
- `modern-en` and `modern-da` are complete
- QA passed
- onboarding exists
- taxonomy is complete
- audio flags match actual R2 coverage
- app build and bundle verification pass

## Next Actions

1. Let Claude finish Treasure Island Danish cleanup, then Codex verifies JSON/structure/terms.
2. Continue RunPod audio backlog and rerun `python3 books/wip_inventory.py --audio`.
3. If Treasure Island audio completes and Danish QA passes, Codex can prepare registry publication.
4. Next translation work for Claude should be a narrow exact-file/chapter assignment, not a broad audit.
