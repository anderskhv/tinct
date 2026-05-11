# Book Factory Agent Instructions

This directory is for adding and maintaining Tinct book content. Follow `../AGENTS.md` first.

## Scope

Book work is content-only unless Anders explicitly asks for app changes.

Allowed write paths:

- `books/**`
- `app/public/data/editions/{book-id}-*.json`
- `app/public/data/onboarding/{book-id}.json`
- `app/public/audio/{book-id}/**`
- `app/src/data/bookRegistry.ts` only to register or unregister a book

Forbidden without explicit approval:

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
- `app/scripts/**`
- static app shell files such as `app/public/landing.html`

If adding a book requires new app behavior, stop and ask Anders.

## Core Rules

- Zero Anthropic API spend for development.
- Do not run scripts that call `api.anthropic.com`.
- Discuss structure before downloading/parsing a new source.
- Use public-domain sources only.
- Validate downloaded source metadata before parsing. Gutenberg `Title:` and `Author:` must match the intended work.
- Maintain paragraph alignment across editions.
- No kids editions.
- Publishing minimum is `original-en` plus `modern-en`; Danish is optional unless Anders asks.
- Modern Danish is translated from `modern-en`, not from the original.

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

Validate every JSON file after writing:

```bash
python3 -m json.tool path/to/file.json >/dev/null
```

## Translation Quality

Modern English:

- Complete content, not summary.
- Paragraph count must match source.
- Preserve proper nouns, allusions, quotations, and historical content.
- Do not soften period language or add editorial corrections.
- Preserve punctuation that carries meaning.
- Shakespeare/play texts keep speaker tags and stage-direction conventions.

Modern Danish:

- Natural Danish, not word-for-word English.
- Dialogue uses `»...«`.
- Straight apostrophes for contractions/possessives.
- Em dashes for interruptions and parentheticals.
- Preserve names and diacritics.
- Do not soften historical content.
- Watch for false cognates and English word order.

Run truncation/quality audits after chapter batches where those scripts exist, especially for large or allusion-heavy works.

## Audio

- English audio uses Kokoro.
- Danish audio uses Google Chirp.
- Do not mix engines.
- If text changes after audio generation, mark the affected book/edition/chapter/paragraphs and regenerate the corresponding audio/manifest before considering the book final.
- R2 uploads must use the remote Cloudflare target, not a local emulator.

## Registry

When editing `app/src/data/bookRegistry.ts`, only add/update/remove the relevant book entry. Do not restructure unrelated registry code.

After registration, verify:

- Book appears in the app.
- Chapter count and labels are correct.
- Editions switch correctly.
- Split/Compare alignment works for aligned editions.
- Onboarding loads for the book.

## Reporting

For long-running book work, leave a concise status note in `books/` documenting:

- completed editions
- pending editions
- QA/audit results
- audio status
- registry status
- known blockers
