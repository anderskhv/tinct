# Translation Protocol — modern-da from modern-en

> **Modern-EN repair:** the procedure for repairing or upgrading a `modern-en` edition is the designated section at the end of this file, "Modern-EN repair procedure". It supersedes this file's model and subagent restrictions for modern-en repair only. Danish policy below is unchanged.

This file governs how to translate a book's `modern-da` edition from its `modern-en` source, without repeating the failure mode that destroyed The Awakening modern-da (125/1044 paragraphs severely truncated, 12% fabrication/meaning reversals).

Read this before starting ANY modern-da translation work.

## What caused the Awakening failure

Translations were generated as hardcoded Python string literals inside batch scripts. When the batch exceeded output-token ceiling, the model silently summarized long paragraphs and occasionally hallucinated filler to maintain paragraph counts. Structural checks (count matches) passed while content was destroyed.

## What worked in the retranslation (0% truncation, verified)

- Main Opus conversation (not agents, not scripts)
- 1-3 chapters per turn (never fill the output window)
- `Write` tool → JSON directly (never hardcoded Python strings)
- Length-ratio audit after each batch
- Paragraph count exact match after each chapter

## Hard rules

1. **Opus main conversation only.** No subagents. No scripts that hold translation strings. Sonnet agents are fine for parsing/QA/threads but NEVER for translation.
2. **Fresh conversation per book.** Open Claude from `books/` for each book. Do not mix books in one conversation.
3. **Max 3 chapters per turn.** If a chapter has >50 paragraphs or avg para >500 chars, do one chapter per turn.
4. **Write directly to per-chapter temp JSON** via the `Write` tool: `books/translations_in_progress/{book-id}/{book-id}_da_ch{N}.json` (or `ch{N-M}.json` for multi-chapter batches). Persistent location so fresh sessions can resume. Merge at the end.
5. **Verify after EVERY batch** before moving on. See "Per-batch checks" below.
6. **Any paragraph with ratio < 0.5 → retranslate that paragraph before proceeding.** No exceptions.
7. **Translate from modern-en, not from original.** Never from the original text.
8. **Zero Anthropic API spend** — all translation happens through CLI conversation (parent CLAUDE.md rule).

## Per-batch checks (mandatory)

After writing each chapter's temp JSON, run:

```python
python3 -c "
import json
en = json.load(open('app/public/data/editions/{book}-modern-en.json'))
en_ch = en['chapters'][N-1]  # 0-indexed
da = json.load(open('/tmp/{book}_da_ch{N}.json'))
assert len(en_ch['paragraphs']) == len(da['paragraphs']), 'PARA COUNT MISMATCH'
ratios = [len(d)/len(e) for e,d in zip(en_ch['paragraphs'], da['paragraphs'])]
for i, (r, e, d) in enumerate(zip(ratios, en_ch['paragraphs'], da['paragraphs'])):
    if r < 0.5 and len(e) >= 50:
        print(f'REJECT p{i}: r={r:.2f} EN={len(e)} DA={len(d)}')
print(f'Ch{N}: min={min(ratios):.2f} max={max(ratios):.2f} avg={sum(ratios)/len(ratios):.2f}')
"
```

If anything prints "REJECT": retranslate those paragraphs before moving on.

## Anti-summarization prompt (use when translating)

Put this at the top of your mental process for each chapter:

> Translate the complete content of each paragraph. Do not summarize, condense, or omit any arguments, examples, or details. If the original contains a quotation, allusion, or proper name you are uncertain about, preserve it verbatim rather than paraphrasing. Every EN paragraph becomes exactly one DA paragraph of similar information density. Length ratio target: 0.9–1.2.

## Style rules

- Natural, contemporary Danish. No translationese.
- Character names: match the threads/cast file. English titles like "Mr./Mrs." stay English (matches existing library convention).
- French phrases in the original (e.g., "Allez vous-en") stay verbatim.
- Straight double quotes `"..."` (matches existing DA books).
- Chapter titles: use Danish form, matching the book's convention (e.g., "Kapitel I" for Roman-numeraled books, "Kapitel 1" for Arabic).

## Merge + final QA

When all chapters are done:

1. Merge: concatenate `/tmp/{book}_da_ch{1..N}.json` into `app/public/data/editions/{book}-modern-da.json`.
2. Run full-book audit (`books/audit_da_truncation.py` pattern):
   - All chapters paragraph-aligned to modern-en
   - Zero paragraphs below 0.5 ratio
   - Spot-read first 3 paragraphs of ch1, middle ch, last ch
3. Register `hasAudio: false` (for now) in `app/src/data/bookRegistry.ts` modern-da edition
4. Then generate DA audio via Chirp (`generate-audio-chirp.py`) and upload to R2 (`--remote` flag mandatory)

## Books pending modern-da translation (as of 2026-04-17)

| Book | Chapters | Paragraphs | Est. sessions |
|------|----------|------------|---------------|
| the-histories | 450 | 485 | 1 |
| imitation-of-christ | 114 | 774 | 1 |
| jerusalem | 18 | 1787 | 2 |
| moby-dick | 136 | 2432 | 2-3 |
| great-expectations | 59 | 3835 | 3-4 |

## How to start a translation session

Open Claude from `/Users/andershvelplund/Documents/Projects/Tinct/books/` and say:

> Translate {book-id} modern-da. Follow TRANSLATION_PROTOCOL.md strictly.

That's it. The project CLAUDE.md + this protocol give the session all the rules it needs.

## Resuming a translation in progress

When starting a fresh session on a book that already has partial translation in `books/translations_in_progress/{book-id}/`:

1. `ls books/translations_in_progress/{book-id}/` — see what's already done.
2. Verify the existing files with the per-batch check (above) before continuing.
3. Start from the lowest un-translated chapter number.
4. Use the same batch pattern: single-chapter files or multi-chapter `ch{N-M}.json` batches.

## In-progress translations (as of 2026-04-17)

- **the-histories**: ch1-20 done (20/450), saved in `books/translations_in_progress/the-histories/`. Ratios verified 0.88-1.22, zero flags. Continue from ch21.

---

# Modern-EN repair procedure

**Scope:** repairing or upgrading an existing `modern-en` edition, or rendering one from an identified public-domain source. Established 2026-09-18 from the War and Peace, Confessions and Jane Eyre repair passes. Content-only: no app code, reader behaviour, audio assets or published editions change under this procedure. Candidates are staged under `books/wip/{book}-repair/`.

**Supersession, modern-en only:** for modern-en repair, drafting and review run as CLI subagents (Sonnet drafts, Opus reviews, see Models). The "Opus main conversation only, no subagents, Sonnet never translates" hard rule above remains in force for modern-da and is not changed by this section.

## Target

Tinct Modern English may become the default reading edition. It must be faithful **and** genuinely accessible to an intelligent new reader without specialist knowledge. Ordinary vocabulary, natural sentence structure, essential unfamiliar concepts explained briefly inside the prose without turning literature into commentary, necessary philosophical terms retained with minimal clarification. Difficult sentences may be split; a run of choppy sentences is a defect. The author's voice, images, ambiguity, humour, repetition and argumentative structure stay. Already-clear sentences may stay unchanged. There is no minimum rewrite percentage and no sentence-length target.

## Definitions

- **Fidelity means preserving meaning, not syntax.** Every source sentence and meaningful clause is accounted for; one source sentence may become several. Actors, actions, quantities, negation, conditions, degree of certainty, comparisons and causal relationships are preserved. The candidate is never more definite than the source: sequence does not become causation, difficulty does not become impossibility, an unstated motive does not become an explanation.
- **Fidelity anchor:** exactly one identified source edition per book, pinned by sha256. Nothing is imported from remembered originals or other translations.
- **Alignment identifier:** paragraph array index within a chapter. Paragraph boundaries and count are preserved exactly. A defective source structure (misnumbered title, garbled paragraph) is flagged for a separate structural repair, never silently changed in one edition.

## Steps

1. **Conventions first.** Write `books/wip/{book}-repair/CONVENTIONS.md`: source and provenance with hashes, character-name mapping by identity, recurring terms, foreign-language handling, footnote-slot policy, typography, known defects classified as structural / fidelity / accessibility / consistency. Names are normalised by character and context, never by blind global replacement. Anything needing Anders is marked DECISION NEEDED and left unchanged until decided. Template: `books/wip/war-and-peace-repair/CONVENTIONS.md`.
2. **Stage inputs.** Per chapter: `chNNN-source.json`, `chNNN-baseline.json`, hashes in a `MANIFEST.md`. Verify chapter identity by `number` and opening sentence.
3. **Draft** with `books/prompts/modern-en-repair/draft.md`. The drafter gets source, baseline candidate and conventions, and writes `chNNN-candidate.json` plus `chNNN-candidate-notes.md`. Drafter self-checks do not count as review.
4. **Mechanical checks** on the candidate: `python3 books/edition_checks.py {book} --candidate books/wip/{book}-repair/chNNN-candidate.json`. BLOCK lines fail the candidate. FLAG lines are places to inspect, handed to the reviewers; they are not verdicts and are never "fixed" blindly. Also run the similarity gate `books/classify-modern-en.py` on the assembled edition before handoff.
5. **Gate A, accessibility review**, `review-accessibility.md`: a reviewer who has not seen the source reads the candidate only, marks each paragraph clear / hard / unclear, quotes the obstacle, does not rewrite. Reading the source first makes unclear wording seem understandable, so this review always runs candidate-only and before the same reader sees any source.
6. **Gate B, fidelity review**, `review-fidelity.md`: a separate reviewer compares candidate and source in packets of 2–3 paragraphs with neighbouring context, checks every paragraph (coverage recorded), then reads the whole chapter for what crosses packets. Severity MAJOR / MODERATE / MINOR / COSMETIC.
7. **Correction**, `correct-and-verify.md`: apply findings source-anchored, log every change with index, exact before/after text and the finding it answers. Touch nothing else.
8. **Verification** by someone other than the corrector: diff the files, confirm every logged change is present and every present change is logged, re-derive each correction from source, re-read as a new reader, structural and punctuation-parity checks. Records the sha256 of the verified file.
9. **Author-intrinsic findings.** A Gate A `hard` or `unclear` finding that the source itself carries (an ambiguity, an unreconciled detail, an unexplained motive that the author chose not to explain) does not block acceptance, but only when the fidelity reviewer or editor confirms against the source that the same obstacle exists there and that resolving it would narrow or add meaning. The acceptance record quotes both texts and the ruling. This is not an escape hatch for dense prose: if the source is merely long-winded, the obstacle is the candidate's to fix.
10. **Acceptance** applies to that exact hash and requires **both** gates to pass: Gate A with no `unclear` paragraphs, Gate B with zero MAJOR or MODERATE findings. "Faithful but dense" is more work; "clear but inaccurate" is more work. Neither compensates for the other. Remaining uncertainties are written down, not rounded to "accepted".
11. **Assembly.** Accepted chapters are merged into a staged whole-edition file. Re-run `edition_checks.py` and the similarity gate on the assembled file. Any later assembly, normalisation or scripted pass re-runs the checks; an edit after acceptance invalidates that chapter's acceptance until re-verified. Whole-book consistency (names, quotes, titles, footnote slots, dash style) is checked on the assembled edition, not on batches.
12. **Changed-passage records.** For every paragraph whose text differs from the previously published edition, emit `{book_id, edition_key, chapter_number, paragraph_index, old_sha256, new_sha256, patched_text}` to `books/wip/{book}-repair/changed-passages.json`. This matches the key of the `pending_audio_regen` table (`book_id, edition_key, chapter_number, paragraph_index`, with `patched_text`); the audio workstream consumes it. Audio is never regenerated under this procedure.

## Metrics are flags, not verdicts

Long sentences, near-verbatim blocks, archaic tokens, ratio outliers, name variants, quote-style outliers, footnote remnants and title-sequence breaks identify where to look. They do not require rewriting and are not acceptance criteria. Definite structural failures (chapter count, paragraph count, empty paragraph) block; everything else is judgment.

## Models

- Sonnet is the economical drafting baseline and the accessibility reader (candidate-only; a cheaper model is a fairer stand-in for a new reader).
- Opus does the fidelity review and verification.
- Do not assume Opus drafts better because it catches Sonnet's errors. For dense philosophical prose, compare Sonnet and Opus on the same chapter, blinded (labels A/B, reviewers do not know which is which), before changing drafting policy. The pilot record for this is `books/wip/war-and-peace-repair/pilot/`.
- Record the model of every draft, review and verification in the batch notes. Never claim independence when the drafting session reviewed itself.
- Everything runs in the CLI conversation. Zero Anthropic API spend in development.

## What needs Anders

Conventions marked DECISION NEEDED (for example a book's French convention, a cast-name alignment), any change to a source edition or to more than one edition at once, merging a staged edition into the live file, and anything that costs money (audio). Per-chapter work inside an approved convention does not.
