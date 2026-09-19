# Leviathan Batch B — Independent Adversarial Review

**Reviewer:** independent second-pass agent, verifying the drafter's "0 defects found" claim
against `lev-batchB-notes.md`. Nothing in the notes was taken on trust; every claim below was
re-derived from the JSON files directly.

## 1. File identity check

`diff lev-batchB-current-modern-en.json lev-batchB-corrected.json` → **byte-identical, no
differences.** The drafter's claim that no fixes were made (files unchanged) is confirmed
mechanically, not just asserted.

## 2. Paragraph-count / structural check

Programmatically compared chapter numbers, titles, and paragraph counts between
`lev-batchB-source.json` and `lev-batchB-corrected.json` for all 10 chapters:

| Output # | Source Ch. | Title | Source paras | Modern paras | Match |
|---|---|---|---|---|---|
| 11 | 10 | Power, Worth, Dignity, Honour, Worthiness | 51 | 51 | ✓ |
| 12 | 11 | Difference of Manners | 28 | 28 | ✓ |
| 13 | 12 | Religion | 32 | 32 | ✓ |
| 14 | 13 | Natural Condition of Mankind | 14 | 14 | ✓ |
| 15 | 14 | First/Second Laws of Nature, Contracts | 34 | 34 | ✓ |
| 16 | 15 | Other Laws of Nature | 43 | 43 | ✓ |
| 17 | 16 | Persons, Authors, Things Personated | 18 | 18 | ✓ |
| 18 | 17 | Causes/Generation/Definition of Commonwealth | 16 | 16 | ✓ |
| 19 | 18 | Rights of Sovereigns by Institution | 24 | 24 | ✓ |
| 20 | 19 | Kinds of Commonwealth, Succession | 23 | 23 | ✓ |

Total 283/283, one-to-one, no merges/splits/drops/inventions. **Confirmed as claimed.**

## 3. Full paragraph-level read

Every paragraph across all 10 chapters was read against source. As a corroborating
mechanical check, I also computed a source-word-count vs. modern-word-count ratio for all
283 paragraph pairs and flagged any pair outside a 0.75–1.6 ratio band (a proxy for gross
compression, i.e. dropped clauses, or unexplained expansion, i.e. invented content):
**zero paragraphs flagged.** This corroborates the notes' claim of full clause-level fidelity
across the whole batch, not just the sampled paragraphs.

I then did close, sentence-level manual comparison on:
- **All 14 paragraphs of ch.14/source ch.13** (state of nature) — full text, no sampling.
- **All 34 paragraphs of ch.15/source ch.14** (first/second laws, contracts) — full text, no sampling.
- **All numbered-law paragraphs of ch.16/source ch.15** (other laws of nature).
- **All 24 paragraphs of ch.19/source ch.18** (sovereign rights), specifically the eleven
  numbered rights.
- Randomly sampled paragraphs (4 each) from ch.11, ch.12, ch.13, ch.17, ch.18.

No dropped or invented clauses, no negation/conditional inversions, no silently-skipped
premises were found in any paragraph read. Argument chains (e.g. the three causes of
quarrel → three motives → the definition of War → the consequences of War → "nasty,
brutish, and short" → the Fool's argument → the enumerated Laws) all carry every step
present in source, in source order.

The "nasty, brutish, and short" line (ch.14/source ch.13, para 8) is rendered as a direct
quotation, verbatim including the archaic spelling ("solitary, poore, nasty, brutish, and
short"), which is a defensible and arguably more careful choice than modernizing it, since it
preserves the line as a citable quotation.

## 4. Laws of Nature — numbering and named examples

**Numbering claim verified.** In source ch.15 ("Of Other Laws of Nature"), Hobbes numbers
some laws inline (third, fourth, fifth, sixth, seventh — confirmed at source paragraphs 0,
15, 16, 17, 19) and leaves others unnumbered, introduced only by "another," "also a Law of
Nature," etc. (paragraphs 22, 23, 25, 26, 29), while occasional marginal notes carry ordinal
numbers unconnected to the surrounding paragraph's own ordinal count (e.g. "The Seventh"
heading at para 18 sits directly before the paragraph that itself says "A seventh is...";
"The Eighteenth" heading appears at para 32 over material about judicial impartiality with
no adjacent inline ordinal).

The modern text reproduces this exact pattern: Third/Fourth/Fifth/Sixth/Seventh appear at
the same paragraphs with the same words, the unnumbered laws remain unnumbered ("another,"
"also a law of nature"), and the marginal-note headers are rendered as bracketed section
headers (e.g. `[The Seventh: That In Revenges, Men Respect Only The Future Good.]`,
`[The Eighteenth: No Man To Be Judge, That Has In Him Cause Of Partiality.]`) with their
numerals unchanged. The drafter's claim that the source's own inconsistent numbering was
preserved rather than "corrected" is **verified as accurate** — inventing continuous
numbering here would in fact have been the defect.

Ch.19/source ch.18 (Rights of Sovereigns) numbering was independently checked in full: all
eleven rights (First through Eleventh) are present, in order, correctly numbered in both
source and modern text, including the interspersed marginal-note numerals ("3.", "7.",
"11." in source → "Third:", "Seventh:", "Eleventh:" in modern, correctly matched to the
paragraph that follows).

**Named examples — verified present in both source and modern text:**
- Phormio/Scipio — ch.14/source ch.13, para 7
- Numa Pompilius — ch.14/source ch.13, para 19
- The Golden Calf — ch.14/source ch.13, para 28
- Coke (and Littleton) — ch.16/source ch.15, para 3
- King James's Union of the Crowns — ch.20/source ch.19, para 22 (present as lowercase
  "union of his two realms of England and Scotland" in the modern text — same fact, not a
  drop; my first automated grep pass missed it only because it was case-sensitive for
  "Union")

All examples the notes claim survive do in fact survive, with names and content intact.

## 5. Evaluation of the two flagged non-defect observations

- **Ch.14/source ch.13, para 7, "(a war of all against all)" parenthetical.** Confirmed
  present, confirmed redundant with the immediately preceding clause ("a war... of every man
  against every man"), confirmed it adds no new claim and drops nothing. **Agree: harmless.**
  It's a stylistic tic (an editorializing gloss that wasn't asked for), not a fidelity defect,
  and not worth a fix.
- **Bracketed Latin/Greek transliterations** (e.g. Prosopon (πρόσωπον), Kurios (κύριος),
  pleonexia (πλεονεξία)). Confirmed these are additions not in the 1651 source, confirmed
  they gloss rather than alter meaning, confirmed no case where the added transliteration
  contradicts or narrows Hobbes's own gloss. **Agree: harmless**, and arguably a genuine
  improvement for a modern reader encountering transliterated Greek without the original
  alphabet.

I'd add one observation the notes didn't flag: the bracketed marginal-note section headers
(item 3 in the notes' "minor observations") are a reasonable formatting solution to source
marginalia that has no natural place in flowing prose, and I found no case where a header
duplicates or contradicts the paragraph it precedes.

## Verdict: **Accept as-is.**

The drafter's "0 defects found" self-report holds up under independent re-verification:
file identity confirmed byte-for-byte, paragraph counts confirmed exact across all 10
chapters, full-text close reading of the two highest-stakes chapters (state of nature, ch.14;
first/second laws and contracts, ch.15) turned up no fidelity defects, the Laws-of-Nature
numbering claim (preserved unevenness, not invented uniformity) is independently verifiable
and correct, all cited named historical examples are present in both source and modern text,
all eleven numbered sovereign rights are present and correctly numbered, and a mechanical
word-count-ratio sweep across all 283 paragraphs found no outliers suggestive of dropped or
invented content. The two flagged "minor observations" are correctly characterized as
harmless and require no action.

No fixes are required. No files were edited during this review.
