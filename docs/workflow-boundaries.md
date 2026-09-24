# Workflow Boundaries

Tinct has three active workstreams. Keep them separate in commits, branches, terminals, and tokens.

## App Work

Use for reader UX, auth, sync, billing, library UI, Cloudflare Worker code, and deploys.

- Primary paths: `app/src/**`, `app/public/**`, `app/scripts/**`, `app/wrangler.jsonc`
- Commit prefix: `feat:`, `fix:`, `chore:`
- Typical branch: `app/asger-feedback`, `app/reader-fix`
- Verification: from `app/`, run `npm run build` and `npm run verify-bundle`
- Deploy: after `npm run build` and `npm run verify-bundle` pass, from `app/` with `npm run deploy` using the Node 24 nvm path. Until Tinct has more than 10 users, do not ask first unless Anders said local-only. Never run raw `wrangler deploy`. Never deploy from a dirty or unreconciled local checkout. The deploy command now blocks unless the checkout is clean and its exact `HEAD` is current `origin/main`, then checks the same revision again after the build; this prevents an older local checkout or queued workflow from replacing a newer release. Never deploy secrets. Never skip verify-bundle.

`app/.env` is for local app and deploy configuration. Its `CLOUDFLARE_API_TOKEN` should be the Workers deploy token, not the RunPod/R2 upload token.

## Content Work

**Book requests automatically activate [BOOK-TASK-WORKFLOW.md](../books/BOOK-TASK-WORKFLOW.md).** Claude writes only its isolated content package; the runtime/registry paths below belong to Codex integration. Claude may code in an explicitly assigned separate coding task, never implicitly as part of adding a book.


Use for adding or editing book texts, onboarding JSON, taxonomy registration, and generated SEO metadata.

- Primary paths: `books/**`, `app/public/data/editions/**`, `app/public/data/onboarding/**`
- Registry path: `app/src/data/bookRegistry.ts`, only for the relevant book entries
- Commit prefix: `content:`
- Typical branch: `content/add-anna-karenina`, `content/shakespeare-batch`
- Public release boundary: do not add a book to the public registry until taxonomy, onboarding, QA, and intended audio flags are correct

Canonical new-book flow:

1. Claude finds and validates the public-domain source.
2. Claude parses the original text. For non-English works, keep the original-language text when available.
3. Claude adds a public-domain human English translation for non-English originals.
4. Claude creates `modern-en`.
5. Hand off accepted text with exact hashes, review evidence and character-card impact. For approved repairs to published editions, Codex publishes the text with required character compatibility; legacy Kokoro audio or manifests are not a release prerequisite.
6. New-book registry publication still requires its agreed content, onboarding, taxonomy and runtime availability contract. Audio work is separately scoped under the current [audiobook architecture](audiobook-architecture-2026-09-21.md); a text repair does not authorize synthesis or provider changes.

Generated files such as `app/public/sitemap.xml` and `app/src/data/bookMetaGenerated.ts` should be committed only with content/library changes that require them.

## Audio Work

**Current policy — 23 September 2026:** the Kokoro/RunPod backlog is historical, not the current English production plan or a text-publication gate. Follow [Audiobook architecture](audiobook-architecture-2026-09-21.md) for the separately approved Grok migration. The Frankenstein/Jekyll text release includes no GPU/TTS generation, audio regeneration or voice changes. Existing assets remain available for rollback until migration acceptance and an exact cleanup inventory; do not infer permission for destructive deletion from a text release.

The paths and credential notes below describe retained legacy tooling, not commands to resume it.

Use for local audits, RunPod generation, and R2 audio uploads.

- Primary docs/tools: `books/ENGLISH_AUDIO_PIPELINE.md`, `books/r2_missing_english_audio.py`
- Commit prefix: `tools:` for scripts/docs, `content:` only when text/audio flags change
- Typical branch: `audio/r2-backlog`

For production audio backlog decisions, use:

```bash
cd books
python3 r2_missing_english_audio.py --scope all --runpod-command
```

The RunPod terminal may still export a variable named `CLOUDFLARE_API_TOKEN` because `run-kokoro-cloud.py` expects that name, but the value must be the R2 upload token. Do not copy the app deploy token from `app/.env` into RunPod.

## Before Any Commit

Run from the repo root:

```bash
git status --short
```

Classify changed files before staging:

- App changes and content changes should usually be separate commits.
- Audio tooling/docs should be separate from generated book text.
- Scratch folders, logs, raw sources, and local audio should remain ignored.

If Claude is adding books while Codex is coding, use isolated branches/checkouts and owned content folders. Never stash or alter another stream's work. Hand content to Codex for integration; do not mix reader fixes into the book task.
