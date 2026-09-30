# Codex prompt — three-book content package (Alice, Wuthering Heights, Middlemarch)

You are working in the Tinct repo (github.com/anderskhv/tinct). Anders's Codex subscription ends tomorrow, so this session is a content-generation sprint. Claude will do all later integration and publication. Your job is to produce three isolated, gate-checked content packages and push them often.

## Read first (required, in this order)
1. `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`
2. `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `docs/workflow-boundaries.md`
Where these say Codex owns registry/integration/publication: for THIS task you do content only. Ignore any instruction to integrate or deploy.

## Hard rules
- Content only. Write ONLY under `books/wip/{book-id}/` (and `books/raw/{book-id}/` for sources). Do NOT edit `app/**`, the registry, live edition/onboarding paths, scripts, tests, config or shared trackers. Do not merge to main, deploy, publish, or start narration generation.
- Zero Anthropic API spend. Never call `api.anthropic.com` or run `generate-editions.cjs`. Write the renderings yourself.
- Public-domain sources only. Validate the Gutenberg header (`Title:` / `Author:`) before parsing; a wrong ID must fail loudly. Record URL, edition, hash and rights evidence in `SOURCE.md`.
- English only. No Danish, no kids editions, no audio.
- `modern-en` must be a genuine sentence-by-sentence modern rendering: paragraph count identical to `original-en`, one output paragraph per input paragraph, no merging/splitting/dropping, no summarizing, keep names, quotations, allusions, exclamation marks, accents and the author's voice and ambiguity. Paragraph N must begin with the equivalent of source paragraph N and normally be >=75% of its word count. Regex/spelling cleanup alone is forbidden.
- Mandatory blocking gate, per batch and on the whole book: `python3 books/classify-modern-en.py {book-id} --gate` (use `--chapters N-M` per batch). A prose claim of quality does not substitute for a passing gate. Run existing read-only tools only; do not change them.
- Validate every JSON with `python3 -m json.tool`, and check chapter/paragraph counts.
- Commit only content artifacts inside your owned folders (inspect `git status`/diff before each commit; never stash/reset/overwrite others' work). Prefix `content:`.

## Books, in priority order (finish each before starting the next)
Agreed structure defaults (Anders may adjust):

| Order | Book id | Gutenberg | Structure |
|---|---|---|---|
| 1 | `alice-in-wonderland` | 11 | 12 chapters, flat. Keep verse poems intact as paragraphs. |
| 2 | `wuthering-heights` | 768 | 34 chapters, flat. Preserve Yorkshire dialect voice in modern-en (Joseph) as readable, not flattened. |
| 3 | `middlemarch` | 145 | Prelude + 86 chapters + Finale as flat reading units; Book titles ("Miss Brooke", "Old and Young", etc.) go in chapter titles. No `sections` hierarchy. Chapter epigraphs stay with their chapter. |

Verify each parsed chapter is a real reading unit (no apparatus, no Gutenberg boilerplate, no duplicated captions). Confirm completeness against the source, including openings and endings.

## Per-book package (in `books/wip/{book-id}/`)
- `SOURCE.md`, pinned source hash, `raw` under `books/raw/{book-id}/`
- `editions/{book-id}-original-en.json` and `editions/{book-id}-modern-en.json` (format: `{"chapters":[{"number","title","paragraphs":[...]}],"sections":[]}`)
- `onboarding/{book-id}.json`: About, `acclaim` (1-3 quotes, each verifiable in a primary source, with `{quote, source, context}`; omit rather than invent), `whyItMatters` (exactly 3 `{title, body}`: declarative, book-focused, ONE brief contemporary line at the end of each, no aphorisms), reading angles (4 cards), cast. No generic filler.
- `characters/` proposal (identity decisions, aliases) and `taxonomy.md` (House, Shelf, form, era, canon/list metadata — propose, do not register)
- `HANDOFF.md`: branch, exact commit, file hashes, chapter/paragraph counts, gate output, spot-read notes, known issues, integration requirements. Report "content accepted" and "published" as separate statuses; nothing is published.

## Working method and priorities
- Tokens expire tomorrow: work in batches (~8-10 chapters), run the gate, commit and PUSH after every batch to branch `content/{book-id}-codex`, so nothing is lost. Push a `STATUS.md` update with each push (chapters done / remaining).
- If you cannot finish Middlemarch's modern-en, stop cleanly at a chapter boundary with the gate passing on the completed range, and record the exact resume point in `STATUS.md`. A partial book must be clearly marked NOT READY; never pad it with scaffold or unrendered text.
- Do not start a book's modern-en before its original-en is validated and committed.
- Final report: per book, completed editions, gate results, remaining chapters, blockers.
