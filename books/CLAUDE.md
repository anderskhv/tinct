# Tinct Book Factory — Claude Guide

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](../STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

Use this guide from the current cloud checkout. Start with [Adding books](README.md); historical Mac paths are not cloud-accessible work destinations.

Current sources of truth:

- Repo-wide rules: `../AGENTS.md`
- Book/content rules: `AGENTS.md`
- Workflow split: `../docs/workflow-boundaries.md`
- Cross-workstream dashboard: `../PIPELINES.md`

If this file conflicts with any of those, follow the AGENTS files.

## Role

Claude owns the content package for new books.

Codex owns publication: final registry/public `BOOKS` changes, app verification, and deploy after verify per `../AGENTS.md` (do not ask first unless Anders said local-only).

From this folder, default to content work only. Do not edit reader UX, React components, hooks, CSS, sync/pagination/auth/billing code, Cloudflare Worker code, build config, or deploy configuration unless Anders explicitly asks.

## First Command

Before starting any task, check the working tree from the repo root:

```bash
bash scripts/tinct-status.sh
git status --short
git branch --show-current
```

Before answering what books are WIP, publishable, or missing translation/audio,
run the current-file inventory. Do not rely on memory, prior chat, or stale
reports:

```bash
python3 books/wip_inventory.py
python3 books/wip_inventory.py --audio
```

Published/live means present in `app/src/data/bookRegistry.ts` `BOOKS`. Ignore
duplicate files like `* 2.json` and `.bak` unless the app references them.

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

Finish-to-publish discipline: do not start a NEW source while a staged book is
blocked only by content work this lane can do (modern-en repair,
threads, onboarding). Default next task is the staged book closest to
publishable per `wip_inventory.py`, unless Anders directs otherwise.

1. Discuss structure with Anders before downloading or parsing:
   chapter division, hierarchy, editions, paragraph grouping, metadata, taxonomy.
2. Find and validate the public-domain source.
3. Parse the original text.
4. For non-English works, keep the original-language edition when available and add a public-domain human English translation as the English baseline.
5. Create `modern-en`.
5b. Similarity gate (mandatory, blocking): `python3 books/classify-modern-en.py {book-id} --gate`
   must PASS before content handoff. Run per batch with
   `--chapters N-M` while rendering. A prose claim that the rendering is
   "real" does not substitute for a passing gate.
6. Create onboarding content and threads when appropriate.
7. Run QA: JSON validity, paragraph alignment, truncation checks, and manual spot reads.
8. Hand off accepted text with exact hashes, whole-book review evidence, changed paragraph coordinates and character-card impact. Do not prescribe legacy Kokoro regeneration in release packets.
9. Codex publishes approved text repairs with required character-card compatibility. New-book registry publication still follows the agreed package and runtime availability contract; audio work is separately scoped.

## Edition selection and reader defaults

**Approved by Anders, 2026-09-24.**

- Fetch the original-language text when a suitable, verifiable source is available. Document any availability gap; do not invent an original or silently substitute a translation.
- For works not originally written in English, fetch multiple good human English translations when available and permitted for Tinct's use. Select for fidelity, completeness and readability, not quantity. Record each translator, edition, provenance and rights evidence separately.
- Select and pin one authoritative human English baseline for Tinct Modern E. Other translations may inform review, but do not silently mix their readings; document substantive source variants.
- Default primary reading edition: **Tinct Modern E** (`modern-en`), once reviewed and accepted.
- Default Compare edition: **the most accessible suitable human English translation**, or **the English original** for works originally written in English. Record the editorial choice and its reason. A non-English original remains an optional edition, not the automatic comparison default for an English reader.
- Additional translations remain selectable. Preserve each translation's own text and paragraph structure; verify cross-edition mappings before marking it aligned. Do not force independent human translations into false paragraph equality.
- These are initial defaults, not instructions to overwrite readers' saved edition choices. App changes implementing them belong to the coding agent.

For an English-original work such as Virginia Woolf's *To the Lighthouse*, fetch the original English text; there is no separate English human translation to source. The intended reading pair is accepted Tinct Modern E as primary and Woolf's original as Compare. The original is the fetched source, not the only eventual reading edition. Preserve deliberate literary ambiguity and voice in any modernization.

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

After parsing, verify that chapter entries are real reading units, not parser artifacts.

- For plays, chapters should be real acts/scenes or another agreed scene unit.
- Do not leave separate chapters for textual apparatus, editor collation notes, transcriber's notes, source variants, scene-number crosswalks, or bracket debris.
- Titles like `] SCENE 6. Pope`, `SCENA QUARTA Ff`, `Capell`, `Rowe`, `Hanmer`, `Collier`, `conj.`, or `om.` are blockers, not acceptable reader-facing chapter titles.
- Cambridge/Gutenberg Shakespeare apparatus paragraphs are not reading text. Remove them before `modern-en`, threads, onboarding, or audio.
- If cleanup changes chapter structure, apply the same structure to the included editions, then re-key threads to the repaired chapter numbers.
- Do not generate audio over apparatus/stub chapters.

## Translation Rules

Modern English must be a real modern-English rendering, not a summary and not a mechanical cleanup.

- Paragraph count must match the source exactly.
- Preserve one output paragraph for every input paragraph. Do not merge, split, reorder, drop, or invent paragraphs.
- Preserve proper nouns, allusions, quotations, historical content, and meaningful punctuation.
- Do not condense arguments, examples, dialogue, or descriptive detail.
- Shakespeare and plays keep speaker tags and stage-direction conventions.
- Rewrite sentence by sentence for present-day clarity while preserving the source's claims, sequence, tone, and examples.
- For already-readable public-domain translations such as Garnett, Ormsby, or older philosophical prose, still produce a fresh modern reading edition. A light spelling pass is not enough.
- Do not create `modern-en` by bulk regex, dictionary lemma replacement, quote normalization, or spelling modernization alone. Those operations may be used only as preparation before a human-quality paragraph-by-paragraph rendering.
- If Anders explicitly asks for a lightly cleaned original translation, keep it as an original/human-translation edition or ask what edition key to use; do not label it `modern-en`.
- Paragraph N must begin with content equivalent to source paragraph N and should normally remain at least 75% of the source paragraph's word count unless the source is genuinely verbose/repetitive.

Paragraph alignment is sacred. If alignment breaks, stop and fix alignment before continuing translation or audio.

## Audio

**Current adding-book policy — 24 September 2026:** English narration uses Grok streaming and shared caching. This applies to new books and text repairs. Do not generate a full audiobook as an onboarding step: no Kokoro, Edge TTS, RunPod or GPU job, and no legacy manifest/timing regeneration gate.

Follow the [adding-book guide](README.md), [audio architecture](../docs/audiobook-architecture-2026-09-21.md) and [Grok release contract](../docs/grok-narration-2026-09-23.md). The coding agent verifies runtime narration eligibility and exact text/language/provider/model/voice/settings cache compatibility. Changed text must not use stale cached speech; unchanged compatible chunks remain reusable.

Opening prewarming and real-provider checks follow their separately approved scope and budget. A new book does not automatically join the featured-ten preparation job. Preserve legacy assets pending separately authorized cleanup. Record changed paragraph coordinates in release packets; do not prescribe retired-engine regeneration.

Danish translation, narration and onboarding remain out of scope unless Anders reopens them.

## Registry And Publishing

Every production book must include:

- validated source
- original edition
- public-domain human English translation for non-English originals
- `modern-en`
- verified alignment for advertised pairs; independent human translations retain their own structure
- no stubs or untranslated scaffold content
- no textual apparatus/stub chapters or polluted scene titles
- runtime narration availability follows the agreed current architecture; text repairs are not blocked on legacy Kokoro regeneration
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
