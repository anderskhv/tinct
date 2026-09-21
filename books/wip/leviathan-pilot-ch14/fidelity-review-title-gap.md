# Fidelity Review — Ch14 Title-Edit Gap Closure

**Scope:** Narrow, targeted check of the single post-acceptance edit to
`candidate-sonnet.json` (title spelling "Naturall" → "Natural"), made after
the chapter's full non-sampled ACCEPT AS-IS fidelity verdict. This review
covers only the isolation and correctness of that one edit — paragraph
content fidelity is taken as already certified by the prior full pass.

## Checks performed

1. **Title text, exact match.**
   Candidate title is now:
   `"Chapter 13. Of the Natural Condition of Mankind, as Concerning Their Felicity, and Misery"`
   This is byte-exact against the required string. The only change from the
   source title (`"...Naturall Condition..."`) is the single letter drop
   `Naturall` → `Natural`. No other word, number, comma, or capitalization
   changed. Pure spelling modernization, nothing else touched. **Pass.**

2. **Edit isolation — nothing else in the file changed.**
   Verified via `git show` on the commit that made this edit
   (`2acfe0b2`, "ch14 final fidelity ACCEPT AS-IS + title modernization
   fix"). The diff touches exactly one line of `candidate-sonnet.json`: the
   `title` field. All 14 `paragraphs` entries are untouched (no diff hunks
   against them), and the `number` field (14) is untouched. This matches
   the prior full-pass certification's content exactly — the edit is
   surgically confined to the title string. **Pass.**

3. **Consistency with house style / `current-modern-en.json`.**
   `current-modern-en.json`'s title field reads:
   `"Chapter 13. Of the Natural Condition of Mankind, as Concerning Their Felicity, and Misery"`
   — i.e. it already uses "Natural", not "Naturall". The candidate edit
   brings ch14 into alignment with this existing reference file, and with
   the title-modernization pattern already applied and accepted in ch10,
   ch18, ch24, and ch27. This is closing a pre-existing inconsistency
   (candidate lagging behind established style), not introducing a new
   one. **Pass.**

## Verdict

**ACCEPT AS-IS.**

The title edit is a pure, correctly-spelled, fully isolated spelling
modernization ("Naturall" → "Natural") that brings `candidate-sonnet.json`
into line with `current-modern-en.json` and the batch's established
title-modernization convention. No other content in the file was touched.
The chapter's prior full non-sampled ACCEPT AS-IS verdict stands; this gap
is closed and the file is ready to be pinned.
