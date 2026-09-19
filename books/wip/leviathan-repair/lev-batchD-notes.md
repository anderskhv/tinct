# Leviathan Batch D — Content Fidelity Review Notes

Scope: chapters 31–40 (source numbering; Hobbes's own chapter numbers 30–39),
covering Part III, "Of a Christian Commonwealth." Every paragraph of
`lev-batchD-current-modern-en.json` was read against the corresponding
paragraph of `lev-batchD-source.json`, in order, chapter by chapter.

Paragraph counts verified programmatically: all 10 chapters match the
source 1:1 (32, 39, 9, 27, 28, 20, 20, 14, 30, 5 paragraphs respectively).
`lev-batchD-corrected.json` is a byte-for-byte copy of the fixed
`lev-batchD-current-modern-en.json`.

## Method

- Full side-by-side read of all 225 paragraphs (source vs. modern-en),
  checking clause-by-clause for drops, additions, inversions, compressed
  argument steps, and altered/dropped scripture citations.
- Programmatic sanity checks as a second pass: (a) negation-word count
  (not/no/never/none/nothing/nor/neither) per paragraph, source vs. modern,
  flagging any delta ≥ 3 — none found, i.e. no paragraph shows a large
  swing in negation density that would suggest a flipped conditional or
  dropped "not"; (b) paragraph length ratio (modern/source), flagging
  outside 0.65–1.6× — none found, i.e. no paragraph shows gross
  compression or padding.

## Per-chapter verdict

| # | Title | Paragraphs | Verdict |
|---|---|---|---|
| 31 | Of the Office of the Sovereign Representative | 32 | Faithful — no defects found |
| 32 | Of the Kingdom of God by Nature | 39 | Faithful — no defects found |
| 33 | Of the Principles of Christian Politics | 9 | Faithful — no defects found |
| 34 | Of the Number, Antiquity, Scope, Authority, and Interpreters of the Books of Holy Scripture | 27 | Faithful — no defects found |
| 35 | Of the Signification of Spirit, Angel, and Inspiration in the Books of Holy Scripture | 28 | Faithful — no defects found |
| 36 | Of the Signification in Scripture of Kingdom of God, of Holy, Sacred, and Sacrament | 20 | **1 defect found and fixed** (see below) |
| 37 | Of the Word of God, and of Prophets | 20 | Faithful — no defects found |
| 38 | Of Miracles, and Their Use | 14 | Faithful — no defects found |
| 39 | Of the Signification in Scripture of Eternal Life, Hell, Salvation, the World to Come, and Redemption | 30 | Faithful — no defects found |
| 40 | Of the Signification in Scripture of the Word Church | 5 | Faithful — no defects found |

Across all ten chapters, the existing modern-English rendering is a close,
accurate, sentence-level paraphrase. Hobbes's theologically provocative
claims (e.g., that angels/spirits described in Scripture are corporeal
substances rather than immaterial ghosts; that the Kingdom of God is a
literal, earthly civil sovereignty rather than a metaphor; that the
resurrection and salvation occur on Earth, not in a celestial "Empyrean
Heaven"; that miracles/prophecy require the sovereign's authorization to be
believed; that hellfire and torment are to be read as finite,
metaphorical, and terminating in the "second death" of annihilation rather
than eternal conscious torment) are all rendered without softening,
exactly as forcefully as the original.

## Defect found and fixed

**Chapter 36 (Hobbes ch. 35), paragraph index 16** — meaning distortion
from mistranslating Hobbes's technical term "propriety" (= ownership/
property, the operative concept this whole paragraph and the surrounding
discussion of "Holy" are built on: "by Holy, is always understood... that
which is Gods in propriety") as the unrelated "in general."

- **Source text (exact):** "Mankind is Gods Nation in propriety: but the
  Jews only were a Holy Nation. Why, but because they became his
  Propriety by covenant."
- **Defective modern-en text (exact, before fix):** "Mankind is God's
  nation in general, but the Jews only were a holy nation. Why? Because
  they became his property by covenant."
- **Problem:** Hobbes's argument in this paragraph and the two preceding
  it turns on a specific technical distinction: "Holy" = "God's in
  propriety" (i.e., owned by God in a special, exclusive sense), by
  analogy with "Public" = "the king's." The closing sentence restates that
  all mankind is God's *by ownership/dominion* in the general sense
  (God's by right of creation/power), while only the Jews were "holy"
  because they became God's *special* property by the Sinai covenant. The
  translation "in general" erases the ownership/property sense of
  "propriety" that the sentence needs (and that the very next clause,
  "became his property by covenant," depends on for its contrast) and
  instead substitutes a vague, unrelated qualifier ("in general") that
  breaks the logical parallel Hobbes is drawing between ordinary divine
  ownership of all mankind and the special, covenanted ownership of
  Israel.
- **Fix applied:** "Mankind is God's nation by ownership, but the Jews
  only were a holy nation. Why? Because they became his property by
  covenant." This restores the ownership/property sense of "propriety"
  (matching how "propriety" is translated as "property" one sentence
  earlier by the same editors — "something of property, gotten by
  consent" — and in the immediately following clause), while keeping the
  modern-English register of the rest of the passage.

## Items considered and deliberately left unchanged (not fidelity defects)

These are transcription-level oddities in the *source* JSON (evidently
OCR/digitization artifacts of the original 1651 text) where the
modern-en file already carries the historically correct reading. Reverting
them to match the source's typo would introduce a factual error rather
than fix one, so they were left as-is:

- **Ch. 31 (Hobbes ch. 30), para 8:** source has "the foolish daughters of
  Peleus (in the fable)"; modern-en has "Pelias." The myth referenced
  (daughters tricked by Medea into boiling their father to renew his
  youth) is the myth of Pelias, not Peleus (Achilles's father, unrelated
  story). Modern-en's "Pelias" is the historically correct name.
- **Ch. 35 (Hobbes ch. 34), para 11:** source cites "(Ezek. 2.30.)" for
  "the spirit entered into me, and set me on my feet"; modern-en cites
  "Ezek. 2:2," which is the correct verse for that quotation (Ezekiel 2
  has only 10 verses).
- **Ch. 39 (Hobbes ch. 38), para 4:** source has "except Enos and Elias";
  modern-en has "except Enoch and Elijah." The doctrine referenced (men
  traditionally held not to have died) applies to Enoch (Gen. 5:24) and
  Elijah (2 Kings 2:11), not Enos/Enosh (a different, ordinary-mortal
  figure in Genesis 4–5). Modern-en's "Enoch" is correct; "Enos" in the
  source appears to be a digitization error.
- **Ch. 37 (Hobbes ch. 36), para 18:** source cites "when Ahab (1 Kings
  12.)"; the correct citation for the 400-prophets episode is 1 Kings 22.
  Modern-en renders this as "1 Kings 22 [which Hobbes here numbers as
  12]," which preserves Hobbes's original (mis-)citation while flagging
  the correct one — a reasonable editorial choice, not a fidelity break.

None of these affect Hobbes's argument, only citation/proper-noun
mechanics, and in each case the modern-en file is already more accurate
than the literal source transcription.

## Verification

```
python3 -c "
import json
src = json.load(open('lev-batchD-source.json'))
mod = json.load(open('lev-batchD-corrected.json'))
assert len(src) == len(mod) == 10
for s, m in zip(src, mod):
    assert s['number'] == m['number']
    assert len(s['paragraphs']) == len(m['paragraphs'])
print('OK')
"
```
Output: `OK` — all 10 chapters present, chapter numbers match, and every
chapter's paragraph count matches the source exactly (no paragraphs
added, dropped, split, or merged).
