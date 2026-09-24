# Book Factory Agent Instructions

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](../STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

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
- Do not answer book-status, publication-readiness, or "what is missing?"
  questions from memory. Run `python3 books/wip_inventory.py` from the repo root
  first, and add `--audio` when English audio status matters.
- Finish-to-publish discipline: do not download or parse a NEW source while a
  staged book is blocked only by content work this lane can do (modern-en
  repair, threads, onboarding). Default next task is the staged book
  closest to publishable per `wip_inventory.py`, unless Anders directs otherwise.
- Discuss structure before downloading or parsing a new source.
- Use public-domain sources only.
- Validate downloaded source metadata before parsing. Gutenberg `Title:` and `Author:` must match the intended work.
- Maintain paragraph alignment across editions.
- No kids editions.
- Every production book must be classified in the library taxonomy: House, Shelf membership, form, era, and relevant canon/list metadata.
- Claude owns the content package for new books: source discovery, original parsing, human English translation sourcing for non-English works, `modern-en`.
- Codex owns publication: final registry/public `BOOKS` changes, app verification, and deploy after verify per `../AGENTS.md` (do not ask first unless Anders said local-only).
- Preserve user changes and never overlap deploy work with active edition writes.

## Structure Discussion

Before downloading anything, discuss the intended structure with Anders:

- Chapter division: chapters, books, cantos, acts/scenes, biblical books, or another natural unit.
- Hierarchical sections: usually no for novels; often yes for Bible, Divine Comedy, Canterbury Tales, and similar works.
- Editions: standard publishing target is original text, a human English translation when the original is non-English, `modern-en`. For English-original books, the original edition is `original-en`.
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

## Edition Structure QA

After parsing source text, verify that chapter entries represent the agreed reading units, not parser artifacts.

- For plays, chapter entries must be real acts/scenes or other agreed scene units. Do not leave separate chapters for textual apparatus, editorial collation notes, transcriber's notes, source variants, or scene-number crosswalks.
- Titles must be reader-facing labels, for example `Act 2, Scene 3`, not source-apparatus fragments such as `] SCENE 6. Pope`, `SCENA QUARTA Ff`, `Capell`, `Rowe`, `Hanmer`, `Collier`, `conj.`, `om.`, or bracket debris from parser splits.
- Edition-note paragraphs from Cambridge/Gutenberg-style Shakespeare sources are not reading text. Remove them before `modern-en`, threads, onboarding, or audio work.
- If source cleanup removes or merges chapters, apply the same structure to every included edition and then re-key threads to the repaired chapter numbers.
- Do not generate audio for a book with suspected apparatus/stub chapters. Repair text first; audio manifests over bad chapter structure are not publication-ready.

For Shakespeare or other heavily annotated public-domain sources, run an apparatus scan before translation/audio. Treat hits as blockers until manually inspected:

```bash
BOOK=measure-for-measure python3 - <<'PY'
import json, os, re
book = os.environ["BOOK"]
pat = re.compile(r'(\] SCENE|SCENA|Transcriber|Pope|Rowe|Hanmer|Capell|Collier|Ff|F1|F2|F3|F4|conj\.|om\.)')
for ed in ("original-en", "modern-en"):
    path = f"app/public/data/editions/{book}-{ed}.json"
    try:
        data = json.load(open(path))
    except FileNotFoundError:
        continue
    hits = []
    for i, ch in enumerate(data["chapters"], 1):
        title = ch.get("title", "")
        paras = ch.get("paragraphs", [])
        if pat.search(title) or (len(paras) <= 3 and any(pat.search(p) for p in paras)):
            hits.append((i, title, len(paras)))
    print(ed, len(data["chapters"]), "apparatus/stub suspects:", len(hits))
    for hit in hits[:10]:
        print(" ", hit)
PY
```

## Modern English

Modern English must be a real modern-English rendering, not a summary and not a mechanical cleanup.

- Paragraph count must match the source exactly.
- Preserve one output paragraph for every input paragraph. Do not merge, split, reorder, drop, or invent paragraphs.
- Preserve proper nouns, allusions, quotations, historical content, and meaningful punctuation.
- Do not soften period language or add editorial corrections.
- Preserve exclamation marks unless the sentence is genuinely restructured.
- Preserve proper noun accents and diacritics.
- Shakespeare and play texts keep speaker tags and stage-direction conventions, such as `MACBETH.` and `[Enter MACBETH]`.
- Prefer contemporary clarity, but do not condense arguments, examples, dialogue, or descriptive detail.
- Rewrite sentence by sentence for present-day clarity while preserving the source's claims, sequence, tone, and examples.
- For already-readable public-domain translations such as Garnett, Ormsby, or older philosophical prose, still produce a fresh modern reading edition. A light spelling pass is not enough.
- Do not create `modern-en` by bulk regex, dictionary lemma replacement, quote normalization, or spelling modernization alone. Those operations may be used only as preparation before a human-quality paragraph-by-paragraph rendering.
- If Anders explicitly asks for a lightly cleaned original translation, keep it as an original/human-translation edition or ask what edition key to use; do not label it `modern-en`.

Anti-truncation prompt requirements:

1. Translate the complete content of each paragraph. Do not summarize, condense, or omit arguments, examples, dialogue, or descriptive detail.
2. Preserve every quotation, allusion, proper noun, place name, and specific detail. If uncertain, copy from the source rather than paraphrase.
3. Paragraph N must start with content equivalent to the first sentence of source paragraph N. Do not merge content across paragraph boundaries.
4. Output length per paragraph should usually be at least 75% of the source word count. If it falls below that, inspect for dropped content.

## QA Gates

**Similarity gate (mandatory, blocking).** Run the committed similarity gate before content handoff:

```bash
python3 books/classify-modern-en.py {book-id} --gate            # whole book
python3 books/classify-modern-en.py {book-id} --gate --chapters 1-8   # per batch
```

The gate fails on weighted similarity > 0.75, > 5% LIGHT/MECHANICAL chapters, or
> 5% byte-identical long paragraphs. This is the instrument that caught the
2026-05 mechanical-modernization failure (539 fake chapters); it exists so that
failure class cannot recur silently. A prose claim that a rendering is "real"
does not substitute for a passing gate. Run it per batch during rendering and on
the whole book before handing off for publication.

Run focused QA after chapter batches and before considering an edition complete:

- Paragraph alignment against the source edition.
- Edition structure check: chapter entries are real reading units, not editorial apparatus or parser stubs.
- Empty or stub paragraphs, especially paragraphs under 20 characters.
- Content alignment spot checks across first, middle, and last chapters.
- Proper noun and name consistency.
- Truncation audit where scripts exist, especially for large, verse-to-prose, or allusion-heavy works.
- Manual spot-read: first 3 paragraphs of chapters 1, middle, and last.

Truncation audits should use existing local tooling when available, for example:

```bash
python3 audit-truncation.py {book-id} en
```

Every flagged paragraph requires human inspection. Natural compression is acceptable; genuine omitted content is not.

## Audio

**Current adding-book policy — 24 September 2026:** English narration uses Grok streaming and shared caching. This applies to new books and text repairs. Do not generate a full audiobook as an onboarding step: no Kokoro, Edge TTS, RunPod or GPU job, and no legacy manifest/timing regeneration gate.

Follow the [adding-book guide](README.md), [audio architecture](../docs/audiobook-architecture-2026-09-21.md) and [Grok release contract](../docs/grok-narration-2026-09-23.md). The coding agent verifies runtime narration eligibility and exact text/language/provider/model/voice/settings cache compatibility. Changed text must not use stale cached speech; unchanged compatible chunks remain reusable.

Opening prewarming and real-provider checks follow their separately approved scope and budget. A new book does not automatically join the featured-ten preparation job. Preserve legacy assets pending separately authorized cleanup. Record changed paragraph coordinates in release packets; do not prescribe retired-engine regeneration.

Danish translation, narration and onboarding remain out of scope unless Anders reopens them.

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
- all included editions are paragraph-aligned
- no stubs or untranslated scaffold content remain
- runtime narration availability follows the agreed current architecture; accepted text repairs are not blocked on legacy Kokoro regeneration
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

After those gates pass, deploy per `../AGENTS.md` or `../docs/cloud-deploy.md`. Until Tinct has more than 10 users, do not ask first unless Anders said local-only. Never run raw `wrangler deploy`. Never deploy from a dirty or unreconciled local checkout. Never deploy secrets. Never skip verify-bundle. Never deploy or stash during active edition writes.

Automated deploy from GitHub Actions or Cursor Cloud Agents requires `CLOUDFLARE_API_TOKEN` (Workers deploy token) — see `../docs/cloud-deploy.md`.

## Reporting

For long-running book work, leave a concise status note in `books/` documenting:

- completed editions
- pending editions
- QA/audit results
- audio status
- registry status
- known blockers

When Anders asks for status, present a single compact table:

| Book | Editions | Modern EN | Audio | Threads |
|------|----------|-----------|-------|---------|

Every cell should be `Complete` or `Not complete` with a short note on the gap.

## Known Failure Modes

- Do not trust reports that a translation is committed; verify the file contents.
- Do not run multiple writers against the same edition JSON in parallel.
- Do not deploy or stash during active edition writes.
- Do not rely only on absence of `[untranslated]`; scaffolded English can look clean while still untranslated.
- Do not confuse legacy R2 recording coverage with current Grok streaming eligibility. Verify the active runtime contract; do not add a full-recording gate.
