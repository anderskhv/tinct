# Re-verification r1-3: chapters 47-61

**Coverage:** the input has 46 changed paragraphs and I verified all 46. For each one I compared the source (Austen 1813), the baseline and the candidate, and read the full candidate paragraph. The candidate text in the input matches `candidate.json` for all 46 paragraphs.

**Verdicts:** 44 CLEAN, 2 DEFECT, 0 REVERT.

## Non-CLEAN items

- **47.9 (DEFECT, small punctuation fix):** the restored "for the last six months—no, for a whole year—" is correct. But the closing em dash is followed by a stray space: `year— she's`. It is the only open-spaced em dash of this kind in the edition. Fix: `year—she's`.
- **53.26 (DEFECT, word order):** in "her neighbors might all see Mr. Bingley before they did because of it", the phrase "because of it" now seems to explain why the Bennets saw him. In the source, "in consequence of it" explains why the neighbours would see him first. Fix: "her neighbors might all, because of it, see Mr. Bingley before they did."

## Notes (no action needed)

- 56.45: "heavy punishments" (source: "heavy misfortunes") is pre-existing baseline wording and was not part of this repair. It is a slight drift but defensible in context, so I did not flag it.
- 48.19: "fairly be inferred" sits close to "fairly well acquainted". The repetition is only a stylistic matter.
- 49.3: "look for him upstairs with their mother" keeps the source's own ambiguity. That is acceptable.

## Overall verdict

The repairs are sound. They correct real misreadings in the baseline: "I do, indeed" (47.2), "dishonest" (47.11), "I hope not" (47.68), "within fifty miles" (48.32), "calculating mother" (54.10), "innocence" (58.23), "reserve" for "sly" (52.3), "though" for "or else" (52.14), "later than planned" (55.19) and "was even greater than" (56.1). They also mend the broken sentences in 48.19 and 52.35. Apply the two small fixes above; everything else can stand.
