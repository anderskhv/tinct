# Tinct Book Factory — Claude Guide

This file is for sessions opened from `/Users/andershvelplund/Documents/Projects/Tinct/books`.

Current sources of truth:

- Repo-wide rules: `../AGENTS.md`
- Book/content rules: `AGENTS.md`
- Workflow split: `../docs/workflow-boundaries.md`

If this file conflicts with any of those, follow the AGENTS files.

## Role

Claude owns the content package for new books.

Codex owns publication: final registry/public `BOOKS` changes, app verification, and deploy when Anders explicitly asks.

From this folder, default to content work only. Do not edit reader UX, React components, hooks, CSS, sync/pagination/auth/billing code, Cloudflare Worker code, build config, or deploy configuration unless Anders explicitly asks.

## First Command

Before starting any task, check the working tree from the repo root:

```bash
git -C /Users/andershvelplund/Documents/Projects/Tinct status --short
git -C /Users/andershvelplund/Documents/Projects/Tinct branch --show-current
```

Classify dirty files before editing:

- `app/src/**`, `app/wrangler.jsonc`, app CSS/components/hooks = app work, normally Codex-owned.
- `app/public/data/editions/**`, onboarding JSON, registry entries, `books/**` = content work.
- audio scripts/backlog/R2 generation = audio work.

Do not mix unrelated dirty files into a content commit.

## Allowed Paths

Content work may touch:

- `books/**`
- `app/public/data/editions/{book-id}-*.json`
- `app/public/data/onboarding/{book-id}.json`
- `app/public/audio/{book-id}/**`
- `app/src/data/bookRegistry.ts`, only for the relevant book entry
- SEO paths only when explicitly requested: `app/scripts/seo/{book-id}.cjs` and `app/public/read/{book-id}/**`

Forbidden unless Anders explicitly asks:

- `app/src/App.tsx`
- `app/src/components/**`
- `app/src/hooks/**`
- `app/src/services/**`
- `app/src/utils/**`
- `app/src/contexts/**`
- `app/src/index.css`
- `app/src/main.tsx`
- `app/src/worker.ts`
- `app/vite.config.ts`
- `app/wrangler.jsonc`
- `app/package.json`
- static app shell files such as `app/public/landing.html`, `app/public/app.html`, and `app/public/about.html`

If a book requires new app behavior, stop and ask Anders to handle it as app/Codex work.

## Canonical Book Flow

1. Discuss structure with Anders before downloading or parsing:
   chapter division, hierarchy, editions, paragraph grouping, metadata, taxonomy.
2. Find and validate the public-domain source.
3. Parse the original text.
4. For non-English works, keep the original-language edition when available and add a public-domain human English translation as the English baseline.
5. Create `modern-en`.
6. Create `modern-da` from `modern-en`.
7. Create onboarding content and threads when appropriate.
8. Run QA: JSON validity, paragraph alignment, truncation checks, byte-identity checks for Danish, and manual spot reads.
9. Generate audio only after text QA passes:
   Kokoro/RunPod for English editions, Google Chirp for Danish.
10. Hand off to Codex for final publication once all content, audio, onboarding, taxonomy, and registry data are ready.

## Source Rules

Use public-domain sources only: Project Gutenberg, Standard Ebooks, Internet Archive, or another verifiable public-domain source.

Save raw sources under:

```text
books/raw/{book-id}/raw.txt
books/raw/{book-id}/SOURCE.md
```

For Gutenberg texts, validate the header before parsing:

```bash
head -30 books/raw/{book-id}/raw.txt | grep -E "^(Title|Author):"
```

If title or author does not match the intended work, stop and find the correct source.

## Edition Format

Edition JSON:

```json
{
  "chapters": [
    { "number": 1, "title": "Chapter Title", "paragraphs": ["..."] }
  ],
  "sections": []
}
```

Validate every changed JSON file:

```bash
python3 -m json.tool path/to/file.json >/dev/null
```

Check chapter and paragraph counts:

```bash
python3 -c "import json; d=json.load(open('path/to/file.json')); print(len(d['chapters']), sum(len(c['paragraphs']) for c in d['chapters']))"
```

## Translation Rules

Modern English must be complete content, not a summary.

- Paragraph count must match the source exactly.
- Preserve proper nouns, allusions, quotations, historical content, and meaningful punctuation.
- Do not condense arguments, examples, dialogue, or descriptive detail.
- Shakespeare and plays keep speaker tags and stage-direction conventions.

Modern Danish is translated from `modern-en`, not from the original.

- Paragraph count must match `modern-en`.
- Use natural Danish.
- Dialogue uses `»...«`.
- Preserve names, diacritics, historical content, quotations, and allusions.
- Do not leave English scaffold text in Danish files.

Before Danish audio, run a byte-identity audit against `modern-en`. More than 5% identical long paragraphs means the translation has gaps.

## Audio Rules

- English audio uses Kokoro.
- Danish audio uses Google Chirp.
- Do not mix engines.
- For non-English originals, do not invent source-language audio by default. The required audio package is the human English translation, `modern-en`, and `modern-da`.
- Regenerate audio if text changes after audio generation.
- R2 uploads must use the remote Cloudflare target, not a local emulator.

RunPod still exports a variable named `CLOUDFLARE_API_TOKEN` because `run-kokoro-cloud.py` expects that name, but the value must be the R2 upload token, not the app deploy token.

For production English audio backlog decisions, use:

```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/books
python3 r2_missing_english_audio.py --scope all --runpod-command
```

That script is the source of truth for RunPod jobs. Avoid hand-assembled long RunPod commands unless they were produced by that script.

## Registry And Publishing

Every production book must include:

- validated source
- original edition
- public-domain human English translation for non-English originals
- `modern-en`
- `modern-da`
- paragraph alignment across editions
- no stubs or untranslated scaffold content
- required Kokoro/Chirp audio generated, manifested, uploaded, and verified
- onboarding
- taxonomy: House, shelves, form, era, and relevant canon/list metadata
- correct registry entry and edition flags

The `Book` constant may exist as staged while pieces are being filled in. Do not add it to the public `BOOKS` array until the full package is ready.

Codex performs final publication and app verification.

## Commits

Keep commits separated:

- `content:` for book text, onboarding, registry, generated SEO/content files.
- `tools:` for content/audio scripts and pipeline docs.
- `chore:` for docs/process/config templates.
- `fix:` / `feat:` for app behavior, normally not from this folder.

Before ending a session, report:

- completed editions
- pending editions
- QA/audit results
- audio status
- registry/publication status
