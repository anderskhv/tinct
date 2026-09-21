# Batch D Independent Adversarial Review — Anna Karenina Ch. 72–92 (Modern English)

**Reviewer:** independent second-pass, no reliance on drafter's notes claims.
**Verdict: ACCEPT AS-IS.**

## 1. File consistency

`ak-batchD-corrected.json` and `ak-batchD-current-modern-en.json` are byte-identical (confirmed via direct Python equality check on the parsed JSON, not just file size). No discrepancy between the two.

## 2. Paragraph-count parity (all 21 chapters)

Verified programmatically against `ak-batchD-source.json`, chapter by chapter. Every chapter's paragraph count matches source exactly:

| Ch # | Title | Source ¶ | Modern ¶ |
|---|---|---|---|
| 72 | Ch.3 | 59 | 59 |
| 73 | Ch.4 | 49 | 49 |
| 74 | Ch.5 | 29 | 29 |
| 75 | Ch.6 | 38 | 38 |
| 76 | Ch.7 | 8 | 8 |
| 77 | Ch.8 | 30 | 30 |
| 78 | Ch.9 | 24 | 24 |
| 79 | Ch.10 | 52 | 52 |
| 80 | Ch.11 | 15 | 15 |
| 81 | Ch.12 | 17 | 17 |
| 82 | Ch.13 | 16 | 16 |
| 83 | Ch.14 | 10 | 10 |
| 84 | Ch.15 | 28 | 28 |
| 85 | Ch.16 | 19 | 19 |
| 86 | Ch.17 | 38 | 38 |
| 87 | Ch.18 | 34 | 34 |
| 88 | Ch.19 | 5 | 5 |
| 89 | Ch.20 | 10 | 10 |
| 90 | Ch.21 | 66 | 66 |
| 91 | Ch.22 | 40 | 40 |
| 92 | Ch.23 | 22 | 22 |

No silent merges or splits anywhere in the batch.

## 3. The three flagged long/dense paragraphs

All three were read in full, clause-by-clause, against source. All three are confirmed **kept as single unbroken paragraphs**, with no dropped or invented clauses, no compression of enumerated points, no softened content.

- **Ch. 82 (source ch. 13), paragraph 11** — Karenin's dueling/divorce interior monologue (907 words → equivalent modern rendering, 3116 → 3092 chars). Every step of the reasoning chain survives: the England aside, the imagined pistol/shudder, the "suppose I am taught to shoot" beat, the rejection of the duel on grounds of both cowardice and dishonesty, the full divorce-precedent reasoning (ceded/sold wife, pseudo-marital ties, coarse-proof requirement). Nothing softened — "corrupt woman," "she does not exist for me" register equivalents all present downstream in later paragraphs of the same chapter, also checked.
- **Ch. 83 (source ch. 14), paragraph 9** — the Egyptian-hieroglyphics / Board of Irrigation digression (6883 → 6617 chars). Every clause of the portrait description, the "brrr" shudder, and — critically — the entire enumerated four-point demand to the rival department (political/administrative/economic/ethnographic/material/religious sub-list, the document numbers 17,015/18,038, the dates, "Act 18... note to Act 36") is preserved intact and in order. No compression of the bureaucratic satire.
- **Ch. 88 (source ch. 19), paragraph 4** — Vronsky's debt accounting (5374 → 4976 chars). All three debt classes, exact figures (17,000-odd, 1,800, 4,000, 8,000, 6,000, the 1,500/2,500 Venovsky surety breakdown, the 100,000/200,000/25,000/20,000/45,000 income figures), the Varya-generosity reasoning, and the closing beat with Anna's burned notes are all present and undistorted.

## 4. Full paragraph-by-paragraph read, remainder of batch

Read every paragraph of all 21 chapters against source (not spot-checked). Checked specifically for:
- dropped or invented clauses
- negation/conditional inversions (also ran an automated negation-marker-count diff across all paragraphs as a second pass; all flagged deltas were re-inspected and are artifacts of contraction counting — e.g. "did not" (2 tokens) vs. "didn't" (1 token) — not actual polarity changes)
- compression of content
- factual/plot/relationship distortions

Scrutinized in particular the passages the drafter's notes called out as checked-and-unsoftened:
- **Karenin's cold post-confession calculus** (ch. 82, throughout) — "No honor, no heart, no religion; a corrupt woman," the tooth-extraction simile, the catalogue of other cuckolded husbands (Daryalov, Poltavsky, Karibanov, Paskudin, Dram, Semyonov, Tchagin, Sigonin), the "she is bound to be unhappy, but I am not to blame" ending — all intact, no softening of Karenin's coldness.
- **Vronsky's ledger-like weighing of Anna against ambition** (ch. 89) — the explicit principles ("must pay a cardsharper but need not pay a tailor... may lie to a woman... may cheat a husband"), the Serpuhovskoy ambition material, the "if I retire, I burn my ships" calculation — all present, unsoftened.
- **Anna's psychological unraveling** (ch. 84–85, 91) — the hair-pulling gesture, "everything beginning to be double in her soul," the torn-up letters, the "My God! my God!" repetition, the sobbing scene — all rendered at full intensity, no toning-down.
- **The bitter Levin-brothers quarrel** (ch. 72) — full back-and-forth preserved, including Levin's self-interest speech and the birch-branches metaphor exchange.

No dropped clauses, no negation flips, no plot/relationship distortions, no factual errors (names, sums, dates, document numbers, kinship terms) were found anywhere in the batch.

## Conclusion

The drafter's self-report of "0 defects found" holds up under independent adversarial re-read. This is a genuinely faithful, unabridged modern-English rendering. **Accept as-is** — no fixes required.
