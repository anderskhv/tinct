# Release Packet — Macbeth, modern-da completeness repair

Status: candidate, awaiting independent whole-edition review. Not
published. Explicitly authorized (Danish repair for Macbeth named
directly in the assignment).

## What this fixes

The live Danish `modern-da` was translated from the OLD, defective
`modern-en` and is missing the same 34 speech blocks (~1,300 words) the
accepted English completeness repair (`books/wip/macbeth-completeness-repair/`)
restored — including the dagger soliloquy and "the raven himself is
hoarse... unsex me here."

## Method

Used the accepted package's `CHANGED-PARAGRAPHS.json` (38 entries: most
are straightforward insertions of the accepted English text, translated
fresh into Danish; two are structural split/trim edits at existing merged
paragraphs). All ~30 genuinely new paragraphs were translated fresh from
the accepted English into elevated, Shakespearean-register Danish prose
matching each chapter's existing translation. Final per-chapter paragraph
counts verified programmatically against the accepted `modern-en`'s
per-chapter counts — exact match across all 28 chapters; all 12 untouched
chapters confirmed byte-identical to the live file.

## Two judgment calls beyond the assignment's two named special cases

The task named chapter 5 (letter/soliloquy split) and chapter 15 (toast
trim) as needing special handling beyond plain insertion. In executing
these, two additional judgment calls were made that were not explicitly
anticipated:

1. **Chapter 5, new paragraph 2** (the "Glamis thou art..." soliloquy):
   rather than translating fresh from the given English text, the
   discarded tail of the old merged paragraph 1 turned out to already be
   a complete, accurate, register-matched Danish translation of the same
   soliloquy (apparently translated from `modern-en`'s own paraphrase
   already). That existing tail was reused verbatim instead of
   retranslating, to avoid a register clash with the rest of the chapter's
   prose-paraphrase style.
2. **Chapter 15**: beyond the flagged trim at old paragraph 40, the old
   paragraph 6 (marked "unchanged" in the source task) was found to
   already merge Macbeth's public toast with his aside about blood on the
   murderer's face — duplicating content the `None -> 7` insertion entry
   asked to be added fresh. Rather than duplicate, the existing merged
   paragraph was split at the same seam matching `modern-en`'s own
   segmentation into paragraphs 6 and 7, and each half reused.

Both decisions are flagged explicitly for independent review's scrutiny,
since they go beyond the two special cases the task anticipated.

## Candidate

| Item | Value |
|---|---|
| `editions/macbeth-modern-da.json` | sha256 `6441958cec4ddadeb9408414db103cb8228ad9694c39a19c7e359261417a3a18` — 28 chapters, paragraph counts matching the accepted `modern-en` exactly, chapter by chapter |
| Replaces live sha256 | `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57` |

## What independent review should check

1. The two judgment-call decisions above (chapter 5 paragraph 2 reuse;
   chapter 15 paragraph 6/7 split) — independently verify both against
   the accepted English for completeness and correct segmentation.
2. All ~30 fresh translations, especially the two soliloquies, for
   completeness and register.
3. Confirm all 12 untouched chapters are byte-identical to the live file.
4. Confirm final per-chapter paragraph counts match `books/wip/macbeth-completeness-repair/editions/macbeth-modern-en.json` exactly.
