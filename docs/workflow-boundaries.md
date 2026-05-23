# Workflow Boundaries

Tinct has three active workstreams. Keep them separate in commits, branches, terminals, and tokens.

## App Work

Use for reader UX, auth, sync, billing, library UI, Cloudflare Worker code, and deploys.

- Primary paths: `app/src/**`, `app/public/**`, `app/scripts/**`, `app/wrangler.jsonc`
- Commit prefix: `feat:`, `fix:`, `chore:`
- Typical branch: `app/asger-feedback`, `app/reader-fix`
- Verification: from `app/`, run `npm run build` and `npm run verify-bundle`
- Deploy: only when Anders explicitly asks, from `app/` with `npm run deploy`

`app/.env` is for local app and deploy configuration. Its `CLOUDFLARE_API_TOKEN` should be the Workers deploy token, not the RunPod/R2 upload token.

## Content Work

Use for adding or editing book texts, onboarding JSON, taxonomy registration, and generated SEO metadata.

- Primary paths: `books/**`, `app/public/data/editions/**`, `app/public/data/onboarding/**`
- Registry path: `app/src/data/bookRegistry.ts`, only for the relevant book entries
- Commit prefix: `content:`
- Typical branch: `content/add-anna-karenina`, `content/shakespeare-batch`
- Public release boundary: do not add a book to the public registry until taxonomy, onboarding, QA, and intended audio flags are correct

Generated files such as `app/public/sitemap.xml` and `app/src/data/bookMetaGenerated.ts` should be committed only with content/library changes that require them.

## Audio Work

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

If Claude is adding books while Codex is coding, commit or stash each workstream before switching tasks. Do not mix reader fixes with generated edition files unless the feature explicitly requires both.
