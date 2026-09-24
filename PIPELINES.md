# Tinct Pipelines

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

Last updated: 2026-09-24

Use this as the quick overview before starting content or coding work. Keep it short and current. Git history keeps the detailed record.

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

## Current release policy — 23 September 2026

Accepted text repairs publish with required character-card compatibility. Legacy Kokoro audio/manifests do not block them. Text releases authorize no GPU/TTS generation, audio regeneration or voice changes. The separately approved [Grok audiobook rollout](docs/audiobook-architecture-2026-09-21.md) defines the four voices, five-minute/two-default-voice preparation for the ten approved books, Play-only on-demand scheduling and acceptance/cleanup sequence. The implementation, bounded opening preparation and production cutover are tracked in [Grok release evidence](docs/grok-narration-2026-09-23.md). Check its acceptance receipts and the production deployment before claiming release completion.

## Historical process snapshot — not current jobs

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

Current adding-book guide: [books/README.md](books/README.md). English only; Grok streaming replaces full-book audio generation. No Danish translation or legacy Kokoro/Edge TTS/RunPod step is required.

Canonical book package:

1. Source found and validated.
2. Original parsed.
3. Public-domain human English translation added for non-English originals.
4. `modern-en` complete.
5. Onboarding and threads added where appropriate.
6. QA passed.
7. Required character compatibility and current runtime availability verified; do not add a legacy Kokoro regeneration gate to text repairs.
8. Codex publishes accepted text; separately scoped audio work follows the current architecture.

Historical WIP snapshot (rerun the inventory before status decisions; old audio blockers below are not current text-release policy):

- 22 unpublished/WIP books.
- Closest: `treasure-island` has aligned editions, onboarding, and threads; remaining blockers are registry plus English audio and final text QA.
- 12 staged Shakespeare plays have text and English audio; all need onboarding + threads.
- Hume/Kant have text but need onboarding, threads decision, and all audio.
- `leviathan` needs final text QA plus onboarding/threads.
- `wealth-of-nations`, `don-quixote`, `essays-montaigne`, and `anna-karenina` need real `modern-en` repair before publication.
- `frederick-douglass` and `werther` are loose source-only starts.

Claude should translate or editorially repair only exact assigned files/chapters.
Codex owns inventory, publication readiness, registry, app verification, and deploy.

### Audiobook migration / Codex

Follow [Audiobook architecture](docs/audiobook-architecture-2026-09-21.md), and the [Grok release contract](docs/grok-narration-2026-09-23.md). English narration now selects Grok streaming with shared caching; retained Google/Bella paths are historical rollback code. Do not resume the legacy Kokoro/RunPod backlog or infer spend from a content repair. Preserve old assets for rollback until accepted migration and exact cleanup inventory.

### Publication / Codex

Owner: Codex.

A book may move into public `BOOKS` only when:

- source and editions are complete
- human English translation exists for non-English originals
- `modern-en` is complete
- QA passed
- onboarding exists
- taxonomy is complete
- narration flags match the current Grok runtime contract; full-book R2 recording coverage is not a publication gate
- app build and bundle verification pass

## Historical Bella word-sync repair — 2026-09-21

See [repair plan](docs/bella-word-sync-repair-plan-2026-09-21.md) and [execution evidence](docs/bella-word-sync-execution-2026-09-21.md). Anders authorized audio-data work without reader changes. The current non-modern English inventory has 846 chapters missing timings, 12 invalid timing files and 12 chapters without audio; historical voice identity is not proven per recording. A three-chapter cloud pilot produced one verified publication: Winter’s Tale original-en chapter 6, 179 words. Reader code, recordings and text were untouched; no app deployment or rented GPU job. Remaining repairs and modern-English retention decisions are open.

## Historical next actions — superseded by current release policy

1. Confirm Claude's current modern-English repair assignment, then verify JSON/structure/terms.
2. Continue RunPod audio backlog and rerun `python3 books/wip_inventory.py --audio`.
3. If Treasure Island audio completes and text QA passes, Codex can prepare registry publication.
4. Next translation work for Claude should be a narrow exact-file/chapter assignment, not a broad audit.
