# Translation Protocol — modern-da from modern-en

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
