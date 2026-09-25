# Odyssey accessibility follow-up — independent fidelity verification brief

You are an INDEPENDENT VERIFIER. You did not propose or apply these changes. Tinct's
modern-English Odyssey is built from Samuel Butler's 1900 prose translation (Project
Gutenberg #1727). A comprehension review changed some paragraphs to remove real
barriers for present-day readers: archaic words, false friends and tangled syntax.
Check every change strictly. Do not rubber-stamp.

## Inputs (read-only)

- `packets/bookNN.md`: for every changed paragraph, BUTLER, BEFORE (the accepted
  candidate) and AFTER (the successor), plus one paragraph of CONTEXT ONLY before and
  after, and the change list with each stated reason.
- `glossary/GLOSSARY.md`: the package's binding conventions (Greek name forms, fixed
  formulas and renderings, spelling). Consult it when a change touches a name, epithet
  or formula.

## For each changed paragraph

Compare BUTLER → BEFORE → AFTER, clause by clause. The verdict is **VERIFIED CLEAN** or
**DEFECT**. A defect is any of:

1. **Meaning changed.** The AFTER says something Butler does not: a different action,
   agent, object, relationship, number, qualifier, hedge, tense or sequence. This
   includes a changed speaker or addressee.
2. **Content lost or added.** A detail, image, name, epithet or qualifier was dropped
   or invented. Interpretation or explanation was added. A gloss sits inside dialogue.
3. **Problem not fixed.** The change does not remove the comprehension problem named
   in its reason, or creates a new ambiguity or misreading.
4. **Register or anachronism.** Slang, modern idiom that jars in an epic, or a
   technical anachronism.
5. **Conventions broken.**
   - American spelling.
   - `toward` not `towards`.
   - Typographic quotes “ ” ‘ ’ and apostrophe ’.
   - Closed em dash —.
   - Greek name forms.
   - A fixed rendering from GLOSSARY.md changed without need.
6. **Collision (package rule D26 / "arrow C").** Inside the same paragraph, the new
   wording reuses a word Butler uses there for something else, or renders two different
   Butler words with one modern word where Butler keeps them apart. Say whether it
   actually misleads.
7. **Grammar or punctuation error** introduced, including broken quotation structure.
8. **Unnecessary change.** The BEFORE was already clear and faithful, and the edit is
   mere rewording. Report it as a defect of class "unnecessary"; it may be reverted.

Quote the exact words for every defect and propose a precise fix. The fix must be
either Butler's own word, if it is still current English, or the minimal faithful
alternative.

## Also check

- **Scope.** The packet's change list matches the BEFORE → AFTER difference exactly,
  with no unlisted edits.
- **Coverage.** Every paragraph in the packet has a verdict.

## Output

Write `out/bookNN-verify.json` as valid JSON:

```json
{"book": 4,
 "paragraphs": [
   {"p": 8, "verdict": "VERIFIED CLEAN" | "DEFECT",
    "defects": [{"class": "meaning|content|not-fixed|register|conventions|collision|grammar|unnecessary",
                 "quote": "...", "explanation": "...", "proposed_fix": "..."}],
    "notes": "optional"}],
 "summary": "counts and overall judgment"}
```

Also write `out/bookNN-verify.md`, a readable table with the same content. End it with
`OVERALL: VERIFIED CLEAN` or `OVERALL: DEFECTS FOUND (n)`.
