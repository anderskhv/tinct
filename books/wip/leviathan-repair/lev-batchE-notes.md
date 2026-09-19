# Leviathan Batch E — Content Fidelity Review Notes

**Scope:** Chapters 41–49 (source `number` fields 41–49), covering original chapter
titles "Chapter 40" through "A Review and Conclusion" — Hobbes's final chapters,
including the polemical "kingdom of darkness" material (chs. 44–47) attacking
scholastic philosophy and the Roman clergy, plus the concluding review.

**Method:** Every paragraph of `lev-batchE-current-modern-en.json` was read
side-by-side against the corresponding paragraph of `lev-batchE-source.json`
(0-indexed, matched 1:1 by position within each chapter; 364 paragraphs total
across the 9 chapters). Checked for dropped/
invented clauses, negation flips, conditional reversals, compressed argument
steps, terminological drift, and softening of polemical content. A programmatic
scan also compared word counts (flagging >35–45% compression) and counted
negation-marker density per paragraph as a secondary signal for dropped
"not/no/never/nor" clauses; every flagged paragraph was manually re-checked
against source.

## Overall verdict: PASS — no content-fidelity defects found

All 9 chapters (364 paragraphs total) were read in full. This modern-English
rendering is a genuinely faithful, sentence-level modernization: it updates
spelling, punctuation, syntax, and register (contractions, modern word order,
dropped archaic "doth/hath/thee"), and it reorganizes some numbered-list
constructions (e.g., turning "First... Secondly..." run-on sentences into
clean lists), but it does not drop clauses, invert meanings, flip negations/
conditionals, compress argument steps, or soften Hobbes's polemic. Scripture
quotations are consistently modernized (KJV wording → smoother modern
phrasing) but preserve their citations and force. Latin technical terms
(Jure Divino, De Jure Divino Mediato, Cui Bono, etc.) are retained and glossed
identically to source usage.

### Per-chapter verdicts

- **Ch. 41 "Of the Rights of the Kingdome of God..." (source #41, 16 paragraphs)** — PASS. No defects.
- **Ch. 42 "Of the Office of Our Blessed Saviour" (source #42, 10 paragraphs)** — PASS. No defects.
- **Ch. 43 "Of Power Ecclesiasticall" (source #43, 138 paragraphs)** — PASS. The longest chapter in the batch (Hobbes's point-by-point rebuttal of Cardinal Bellarmine on papal power); read in full. No defects found, including in the dense scripture-citation passages and the numbered rebuttal of Bellarmine's eleven "places."
- **Ch. 44 "Of What Is Necessary for a Mans Reception Into the Kingdome of Heaven" (source #44, 27 paragraphs)** — PASS. No defects.
- **Ch. 45 "Of Spirituall Darknesse from Misinterpretation of Scripture" (source #45, 38 paragraphs)** — PASS, with one **non-defect observation**: in paragraph 21, the modern rendering adds a bracketed citation correction — "expounded Heb. 13.5" (source) is rendered "expounded Heb. 11:5 (which Hobbes here cites as 13:5)" — flagging that Hobbes's own citation is off (the quoted verse is actually Hebrews 11:5, not 13:5). This is an editorial gloss on a citation error in the 1651 original, not a distortion of Hobbes's argument or content, and does not affect the sentence's meaning. Left as-is since it adds clarity without altering fidelity; flagging here for visibility per the task's "any other content-fidelity break" catch-all, but judged **not a defect** worth reverting.
- **Ch. 46 "Of Daemonology, and Other Reliques of the Religion of the Gentiles" (source #46, 39 paragraphs)** — PASS. The sharp material on transubstantiation ("turning of Consecration into Conjuration"), the Egyptian-conjurer analogy, and the "leeks and onions" jab at Catholic Eucharistic doctrine are all rendered at full polemical strength, with no softening. No defects.
- **Ch. 47 "Of Darknesse from Vain Philosophy, and Fabulous Traditions" (source #47, 42 paragraphs)** — PASS. Hobbes's attack on Aristotelian "Schoole Divinity" and its absurdities (separated essences, "Nunc-stans," transubstantiation logic) is rendered fully and sharply, including the barbed closing lines about scholastic writings being "meaningless strings of strange and barbarous words." No defects.
- **Ch. 48 "Of the Benefit That Proceedeth from Such Darknesse..." (source #48, 37 paragraphs)** — PASS. This is Hobbes's most extended and cutting polemic — the point-by-point "Cui Bono" indictment of the papacy's material interests (paras 3–18) and the extended "Kingdom of Fairies" analogy for the Roman clergy (paras 23–35) — and it is rendered with full satirical force in the modern-English version: "ghost of the deceased Roman empire, sitting crowned on the grave of it," the fairies/ecclesiastics point-by-point comparison (marriage, tithes as cream-skimming, incubi/priestly celibacy, elves/superstitious subjects, etc.), and the closing warning about "an assembly of spirits worse than he" returning are all intact and undiluted. No defects, no softening.
- **Ch. 49 "A Review and Conclusion" (source #49, 17 paragraphs)** — PASS. No defects.

### Method notes on false positives ruled out

The automated negation-count scan (comparing counts of not/no/never/none/nor/
neither/nothing/without/cannot per paragraph) flagged ~30 paragraphs across
chapters 43, 44, 45, 46, and 47 for negation-count deltas of 1–3. Every flagged
paragraph was manually re-checked against source. In all cases the deltas were
explained by ordinary modernization choices — e.g., collapsing "not... nor...
nor" into a single "neither... nor" clause, replacing "cannot" with "can't"-
style contractions counted differently by the regex, or converting an archaic
double-negative construction into a single modern negative with identical
truth value. None represented an actual dropped or inverted negation.

## Files produced

- `lev-batchE-corrected.json` — identical in content to
  `lev-batchE-current-modern-en.json` (no edits were needed); paragraph counts
  verified programmatically to match `lev-batchE-source.json` exactly,
  chapter-by-chapter (16, 10, 138, 27, 38, 39, 42, 37, 17 — totaling 364
  paragraphs across 9 chapters).
