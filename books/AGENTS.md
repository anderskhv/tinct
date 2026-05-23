# Book Factory Agent Instructions

This directory is for adding and maintaining Tinct book content. Follow `../AGENTS.md` first. Older `CLAUDE.md` files are historical references only; this file is the Codex-facing source of truth for book work.

## Scope

Book work is content-only unless Anders explicitly asks for app changes.

Allowed write paths:

- `books/**`
- `app/public/data/editions/{book-id}-*.json`
- `app/public/data/onboarding/{book-id}.json`
- `app/public/audio/{book-id}/**`
- `app/src/data/bookRegistry.ts` only to register or unregister the relevant book
- When SEO work is explicitly requested: `app/scripts/seo/{book-id}.cjs` and `app/public/read/{book-id}/**`

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
- unrelated files in `app/scripts/**`
- static app shell files such as `app/public/landing.html`, `app/public/app.html`, and `app/public/about.html`

If adding a book requires new app behavior, stop and ask Anders to handle it as app work.

## Core Rules

- Zero Anthropic API spend for development.
- Do not run scripts that call `api.anthropic.com`.
- Do not run `generate-editions.cjs`.
- Discuss structure before downloading or parsing a new source.
- Use public-domain sources only.
- Validate downloaded source metadata before parsing. Gutenberg `Title:` and `Author:` must match the intended work.
- Maintain paragraph alignment across editions.
- No kids editions.
- Every production book must be classified in the library taxonomy: House, Shelf membership, form, era, and relevant canon/list metadata.
- Claude owns the content package for new books: source discovery, original parsing, human English translation sourcing for non-English works, `modern-en`, and `modern-da`.
- Codex owns publication: final registry/public `BOOKS` changes, app verification, and deploy when Anders explicitly asks.
- Modern Danish is translated from `modern-en`, not from the original.
- Preserve user changes and never overlap deploy work with active edition writes.

## Structure Discussion

Before downloading anything, discuss the intended structure with Anders:

- Chapter division: chapters, books, cantos, acts/scenes, biblical books, or another natural unit.
- Hierarchical sections: usually no for novels; often yes for Bible, Divine Comedy, Canterbury Tales, and similar works.
- Editions: standard publishing target is original text, a human English translation when the original is non-English, `modern-en`, and `modern-da`. For English-original books, the original edition is `original-en`.
- Paragraph grouping: prose paragraphs, verse stanzas, Bible verse ranges, or play speech blocks.
- Book metadata: title, author, year, word count, cover colors, description, taxonomy.

## Source Text

Use Project Gutenberg, Standard Ebooks, Internet Archive, or another public-domain source. Save raw text under `books/raw/{book-id}/raw.txt` and document the source URL in `books/raw/{book-id}/SOURCE.md`.

After download, validate the source before parsing:

```bash
head -30 books/raw/{book-id}/raw.txt | grep -E "^(Title|Author):"
```

If the title or author does not match the intended work, stop and find the correct source. A wrong Gutenberg ID must fail loudly, not silently substitute another text.

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

Also verify chapter and paragraph counts:

```bash
python3 -c "import json; d=json.load(open('path/to/file.json')); print(len(d['chapters']), sum(len(c['paragraphs']) for c in d['chapters']))"
```

## Modern English

Modern English must be complete content, not a summary.

- Paragraph count must match the source exactly.
- Preserve proper nouns, allusions, quotations, historical content, and meaningful punctuation.
- Do not soften period language or add editorial corrections.
- Preserve exclamation marks unless the sentence is genuinely restructured.
- Preserve proper noun accents and diacritics.
- Shakespeare and play texts keep speaker tags and stage-direction conventions, such as `MACBETH.` and `[Enter MACBETH]`.
- Prefer contemporary clarity, but do not condense arguments, examples, dialogue, or descriptive detail.

Anti-truncation prompt requirements:

1. Translate the complete content of each paragraph. Do not summarize, condense, or omit arguments, examples, dialogue, or descriptive detail.
2. Preserve every quotation, allusion, proper noun, place name, and specific detail. If uncertain, copy from the source rather than paraphrase.
3. Paragraph N must start with content equivalent to the first sentence of source paragraph N. Do not merge content across paragraph boundaries.
4. Output length per paragraph should usually be at least 75% of the source word count. If it falls below that, inspect for dropped content.

## Modern Danish

Modern Danish is translated from `modern-en`.

- Natural Danish, not word-for-word English.
- Paragraph count must match `modern-en` exactly.
- Dialogue uses `»...«`.
- Straight apostrophes for contractions and possessives.
- Em dashes for interruptions and parentheticals.
- Preserve names and diacritics.
- Do not soften historical content.
- Honorifics from 19th-century Anglo sources, such as `Mrs.` and `Mr.`, normally stay in English form.
- Avoid false cognates, English word order, invented compound words, and direct calques of English idioms.

## QA Gates

Run focused QA after chapter batches and before considering an edition complete:

- Paragraph alignment against the source edition.
- Empty or stub paragraphs, especially paragraphs under 20 characters.
- Content alignment spot checks across first, middle, and last chapters.
- Proper noun and name consistency.
- Truncation audit where scripts exist, especially for large, verse-to-prose, or allusion-heavy works.
- Manual spot-read: first 3 paragraphs of chapters 1, middle, and last.
- For Danish, run a byte-identity audit against `modern-en` before audio. More than 5% identical long paragraphs means the translation has gaps.

Truncation audits should use existing local tooling when available, for example:

```bash
python3 audit-truncation.py {book-id} en
python3 audit-truncation.py {book-id} da
```

Every flagged paragraph requires human inspection. Natural compression is acceptable; genuine omitted content is not.

## Audio

- English audio uses Kokoro.
- Danish audio uses Google Chirp.
- Do not mix engines.
- For non-English originals, do not invent source-language audio by default. The required audio package is the human English translation, `modern-en`, and `modern-da`.
- Generate or regenerate audio only after the relevant text passes QA.
- If text changes after audio generation, mark the affected book, edition, chapter, and paragraph numbers; regenerate the corresponding audio and manifest before considering the book final.
- Chapter title audio should be present where the audio pipeline supports it.
- R2 uploads must use the remote Cloudflare target, not a local emulator.

Always use `--remote` for R2 uploads. Without it, Wrangler may write to a local emulator and appear to succeed.

For bulk R2 uploads, prefer moderate parallelism such as `-P 8`. If rate limits or fetch failures occur, retry the failed files sequentially.

Kokoro can hang on specific paragraphs. For large books, prefer a subprocess-per-paragraph pattern with timeouts rather than one unbounded long run.

## Registry

When editing `app/src/data/bookRegistry.ts`, only add, update, or remove the relevant book entry. Do not restructure unrelated registry code.

Every production book must include:

- correct title, author, year, description, and display metadata
- edition entries for the editions that actually exist
- correct `aligned` and `hasAudio` flags
- taxonomy classification: House, Shelf membership, form, era, and relevant canon/list metadata

If the taxonomy target is unclear, stop and ask Anders before considering the book registered.

After registration, verify:

- Book appears in the app.
- Chapter count and labels are correct.
- Editions switch correctly.
- Split/Compare alignment works for aligned editions.
- Onboarding loads for the book.

## Onboarding

Onboarding content belongs at `app/public/data/onboarding/{book-id}.json`.

Expected content normally includes:

- About text.
- Why it still matters.
- Reading angles.
- Cast or key figures when relevant.
- Pre-reading chat responses.
- Opening background text.

Keep onboarding specific to the book. Avoid generic literary filler.

## Threads

Narrative and dialogue-heavy books may need `{book-id}-threads.json` in `app/public/data/editions/`.

Use the existing convention-based loader. Do not change app code just to load a threads file.

For treatises, journals, and similar works, threads may be unnecessary; use judgment or ask Anders.

## SEO Page Pipeline

Only do SEO page work when Anders explicitly asks.

Two tiers exist under `app/public/read/{book-id}/`:

- Stub tier: `summary.html`, generated from onboarding and registry data.
- Full tier: `summary.html`, `chapters.html`, `themes.html`, `cast.html`, per-chapter pages, and `_tour.js`, generated from `app/scripts/seo/{book-id}.cjs`.

Canonical `.cjs` fields include `id`, `title`, `author`, `byline`, `titleAccent`, `hook`, `genre`, `about`, `chapterLabel`, `groups`, `themes`, `cast`, `castGroups`, and `chapters`.

For books over roughly 30 chapters, use chunked generation:

1. Write chapter-entry JSON chunks outside the app source.
2. Merge chunks into one JSON file.
3. Reference the merged chapter data from the `.cjs` rather than inlining huge arrays.
4. Run the existing SEO page generator.

SEO prose should be declarative, specific, and factually exact. Cite named characters, events, and chapter details. Avoid generic AI-style phrasing.

## Publishing Readiness

A book is ready for the public registry only when the agreed publishing standard for that work is complete. At minimum this means:

- public-domain source validated
- original edition exists
- for non-English originals, a public-domain human English translation exists
- `modern-en` exists
- `modern-da` exists
- all included editions are paragraph-aligned
- no stubs or untranslated scaffold content remain
- required audio is generated, manifested, uploaded, and verified: Kokoro for English editions and Chirp for Danish
- onboarding exists
- registry entry is correct
- taxonomy is complete
- local app verification passes

Do not publish a partially complete book as if it were finished. A staged `Book` constant may exist in the registry while pieces are being filled in, but it should not join the public `BOOKS` array until the agreed standard is met.

## Verification

For content-only changes:

- Validate every changed JSON file.
- Run alignment and truncation checks where applicable.
- Build the app if registry or public data shape changes could affect runtime behavior.

For app verification, follow `../AGENTS.md`:

```bash
cd app
npm run build
npm run verify-bundle
```

Do not deploy unless Anders explicitly asks.

## Reporting

For long-running book work, leave a concise status note in `books/` documenting:

- completed editions
- pending editions
- QA/audit results
- audio status
- registry status
- known blockers

When Anders asks for status, present a single compact table:

| Book | Editions | Modern EN | Modern DA | Audio | Threads |
|------|----------|-----------|-----------|-------|---------|

Every cell should be `Complete` or `Not complete` with a short note on the gap.

## Known Failure Modes

- Do not trust reports that a translation is committed; verify the file contents.
- Do not run multiple writers against the same edition JSON in parallel.
- Do not deploy or stash during active edition writes.
- Do not start Danish audio before confirming the Danish file is actually Danish.
- Do not rely only on absence of `[untranslated]`; scaffolded English can look clean while still untranslated.
- Do not let audio live only in staging. If users need it, it must be in R2 with manifests.
