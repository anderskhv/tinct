# Tinct Pipelines

Last updated: 2026-05-23

Use this as the quick overview before opening Claude, Codex, or RunPod. Keep it short and current. Git history keeps the detailed record.

Run this first:

```bash
bash scripts/tinct-status.sh
```

## Active Processes

- RunPod: Kokoro English audio batch is the only known live external process.
- Claude: no active Claude book window.
- Codex: no long-running app process.

## Working Tree

- Current known dirty content file: `app/public/data/editions/wealth-of-nations-modern-en.json`
- Treat that file as Claude/content work. Do not mix it into app or process commits.

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

Current content state from the closed Claude session:

- Text complete, awaiting audio + public promotion:
  - Othello
  - Richard III
  - Antony & Cleopatra
  - Twelfth Night
  - Taming of the Shrew
  - Much Ado About Nothing
  - Cymbeline
  - King Lear
  - Coriolanus
  - Henry IV Part 2
  - Measure for Measure
  - Merry Wives of Windsor
  - Hume — Enquiry
  - Kant — Groundwork
- Partial:
  - Leviathan: 4/49 chapters `modern-en` done; chunked retries needed.
  - Wealth of Nations: 10/32 chapters `modern-en` done; `modern-da` not started.
- Scaffold only:
  - Don Quixote
  - Montaigne — Essays
  - Anna Karenina
- Source/parser unresolved:
  - Summa Theologica
  - Canterbury Tales
  - Hegel — Phenomenology of Spirit
  - Mrs Dalloway / To the Lighthouse

Claude can start more books, but only after the current dirty content file is committed, stashed, or deliberately left as the active content lane.

### Audio / RunPod

Owner: RunPod plus local audit scripts.

Production backlog source of truth:

```bash
cd books
python3 r2_missing_english_audio.py --scope all --runpod-command
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

1. Check RunPod. If finished, run the R2 missing-audio audit.
2. Inspect and either commit or discard/stash the Wealth of Nations content edit.
3. Decide whether Claude should continue existing partial books before starting new scaffold-only books.
4. Let Codex publish only complete packages.
