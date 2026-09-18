Model: opus

# Chapter 264 (Book Twelve (1812) — Chapter 1) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch264-candidate.json` vs `ch264-corrected.json`; every change re-derived from
`ch264-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 1, 2, 3, 9, 12, 14, 18, 21, 23, 26** — 11 paragraphs.
Log entries: **0, 1, 2, 3, 9, 12, 14, 18, 21, 23, 26** — 11 entries.

**Exact match. No unlogged change, no logged change missing.** Every `Before:` and `After:`
string in the log was compared byte-for-byte against the corresponding paragraph in the two
files: **all 11 match exactly.**

## 2. Per-change verdicts (re-derived from source)

| ¶ (1-based) | Change | Source check | Verdict |
|---|---|---|---|
| 1 | "the chancellor Rumyantsev" → "Rumyantsev"; "the dowager empress Maria Fedorovna" → "Marya Fedorovna"; "Empress Maria" → "Empress Marya"; "greater intensity" → "greater heat"; "what instructions she would give" → "would be pleased to give"; "court interests and intrigues" → "court interests and service interests and intrigues" | "between the parties of Rumyántsev, the French, Márya Fëdorovna, the Tsarévich, and others"; "with greater heat than ever"; "The Empress Márya"; "what instructions she would be pleased to give" | OK — **MAJOR (service interests) and both MODERATEs answered.** The triad is whole again; the two unsupported ranks are gone; the name now matches the source, the conventions table (patronymic "Marya X") and the baseline majority. The courtly formula is restored |
| 2 | "the Bishop" → "His Lordship the Bishop"; "political purpose" → "political significance" | "a letter from His Lordship the Bishop when sending the Emperor an icon"; "had a political significance" | OK — honorific restored per CONVENTIONS (forms of address are kept); "significance" no longer asserts Anna Pavlovna's design. Dropping Maude's "when" is harmless: the letter still accompanies the icon |
| 3 | "the star" → "the ornament" | "gatherings of which she was usually the ornament" | OK — salon register restored, and it now matches "enchanting" in ¶4 |
| 4 | "the inconvenience of having married two husbands" → "an inconvenience resulting from having married two husbands" | "an inconvenience resulting from marrying two husbands at the same time, and that the Italian's cure consisted in removing such inconvenience" | OK — **MAJOR answered.** The indirection is back: the inconvenience is now a *consequence* of the bigamy, so "removing that inconvenience" once again points at the thing Petersburg will not name, and the sentence stops claiming a doctor can undo a marriage |
| 10 | "admiring" → "esteeming" | "that does not prevent my esteeming her as she deserves" | OK — Anna Pavlovna's public-defensible verb restored |
| 13 | "deliver one of his witticisms" → "utter one of his mots" | "utter one of his mots" | OK — Bilibin's running French term restored; the candidate's sentence split (colon → full stop) is retained, so readability is not lost |
| 15 | "the witticism she had heard before" → "the mot, which she had heard before" | "securing silence for the mot, which she had heard before" | OK — and the non-restrictive comma is back, so the aside that she is staging a joke she already knows survives |
| 19 | "he uttered the first words" → "he uttered in that way the first words" | "at every opportunity he uttered in that way the first words that entered his head" | OK — the method (loudly and unexpectedly) is the point and is restored |
| 22 | "uncomfortable, as if wondering what they were to blame for" → "intimidated, as if asking in what they were to blame" | "many of those present appeared intimidated, as if asking in what they were to blame" | OK — de-softened |
| 24 | "strike" → "smite"; "welfare" → "weal" | "shall suddenly smite his head"; "our country's weal" | OK — pulpit register restored inside the quoted document, which is where the chapter's comedy lives |
| 27 | "I have a good feeling about it!" → "I have a favorable presentiment!" | "I have a favorable presentiment!" | OK — register restored, and this is the remedy the ch 265 review named for the broken cross-chapter callback (see §5) |

No correction split, merged, lengthened or shortened a paragraph beyond the wording listed.
No new meaning drift found in any of the 11.

## 3. Readability of changed paragraphs

Re-read as a new reader. All eleven are clear. Two restorations were worth checking because
they trade modern words for period ones and both survive it: "mot" is glossed by its own
context twice over (¶13 "preparing to smooth it out again and utter one of his mots", ¶15
Anna Pavlovna "securing silence" for it), and "smite"/"weal" sit inside a quoted ecclesiastical
letter whose archaism is the joke. ¶1 is now a bare roll call of names — which is the source's
effect, and the Empresses are identified four sentences later, exactly as Maude arranges it.

## 4. Structure and punctuation

- Paragraph count 27 = 27 = 27 (source / candidate / corrected). Order unchanged.
- `number` 264 and `title` "Book Twelve (1812) — Chapter 1" identical to source.
- No empty paragraphs. JSON valid.
- Per-paragraph `?` and `!` parity with source: **clean across all 27 paragraphs.**
- Typography conforms: unspaced em dashes throughout (8), straight double quotes, no curly
  quotes, no bracket tags. No footnote slots in this chapter.
- Names conform to the conventions table: Marya Fedorovna, Empress Marya, Prince Vasili (6),
  Anna Pavlovna, Bilibin, Hippolyte, Kutuzov, Wittgenstein, Borodino.

## 5. Cross-chapter callback (with ch 265) — repaired

The ch 265 fidelity review recorded the callback as broken at this end and named the remedy:
"Fixing ch 264 ¶27 repairs it; alternatively use 'presentiment' in both." ¶27 now reads
"I have a favorable presentiment!", and ch 265 ¶1 opens "Anna Pavlovna's premonition was in
fact fulfilled", which refers back explicitly and by name. The echo is semantic rather than
verbally identical, which is the remedy the reviewer sanctioned. No further change needed in
either chapter, and I record it here so a later round does not "fix" ch 265 ¶1 twice.

## 6. New findings

None blocking. **No MAJOR or MODERATE finding remains** — both MAJORs (¶2 service interests,
¶4 the euphemism) and both MODERATEs (¶1 chancellor, ¶1 dowager empress / Maria) are fully
answered, and every MINOR in the fidelity review was also applied.

- **Non-blocking, MINOR, unapplied and unrecorded — ¶1 "the Tsarevich (heir to the throne)".**
  The fidelity review graded this MINOR "at the edge of acceptable": it asserts a succession
  status the source never states, and the Tsarevich here (Constantine) was heir presumptive.
  It is the only one of ¶1's three glosses left standing now that "chancellor" and "dowager
  empress" have been removed from the same list, which makes it read as an arbitrary
  exception. Applying MINOR findings is discretionary under the protocol, so this does not
  block; but unlike the drafter's deliberate keeps it is not recorded anywhere in the
  corrections log, so the file is right and the accounting is incomplete. Suggested for a
  later round: drop the parenthesis, or reduce it to a bare category.
- **No finding, confirmed — ¶14 "the Russian general Wittgenstein".** The fidelity review
  ruled this clean (bare category, supported in the same sentence). Unchanged, correctly.
- **Author-intrinsic ruling, ¶19 (carried from the candidate notes, confirmed).** Prince
  Hippolyte's "The path to Warsaw" remark is meaningless by design — the paragraph says so
  itself ("He knew no more than the others what his words meant"). Nothing to recover and
  nothing to invent. Kept.

Verification: ACCEPT
sha256: 7a00305506c4f96a60e1b3cbdc9a7db7d2ced57a60ee504cc044de2e097ebb53
