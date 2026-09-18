Model: opus

# Chapter 265 (Book Twelve (1812) — Chapter 2) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch265-candidate.json` vs `ch265-corrected.json`; every change re-derived from
`ch265-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 2, 5, 6, 12** — 5 paragraphs.
Log entries: **0, 2, 5, 6, 12** — 5 entries.

**Exact match. No unlogged change, no logged change missing.** Every `Before:` and `After:`
string in the log was compared byte-for-byte against the corresponding paragraph in the two
files: **all 5 match exactly.**

## 2. Per-change verdicts (re-derived from source)

| ¶ (1-based) | Change | Source check | Verdict |
|---|---|---|---|
| 1 | "much heavier than theirs" → "much heavier than ours" | "the French losses were much heavier than ours" | OK — Maude's Russian first person inside the reported dispatch is restored, and with it the narrator's momentary standing inside the news |
| 3 | "their true magnitude" → "their real strength and completeness"; "inevitably cluster" → "involuntarily group themselves"; "including the names of the generals Tuchkov and Bagration, and of Kutaysov" → "among which figured the names of Tuchkov, Bagration, and Kutaysov"; "instinctively centered" → "involuntarily centered"; "perfectly arranged" → "successfully arranged"; "everyone greeted each other with the words" → "everyone met with the words" | all six verbatim in source | OK — **all three MODERATEs in this paragraph answered.** (a) "completeness" is back, so the second failure of court perception is named and the rest of the paragraph illustrates it; (b) "involuntarily" no longer asserts necessity, and the same word is now used for both of Tolstoy's occurrences instead of three different ones; (c) the "generals" gloss is gone, so the flat list of three war dead is flat again and Kutaysov is no longer implied to be a non-general |
| 6 | "suffered on the Emperor's account, from the very suspense that was causing him to suffer" → "suffered because of the suffering that the suspense was causing the Emperor" | "The courtiers suffered because of the suffering the suspense occasioned the Emperor." | OK — **MODERATE answered, and answered the right way.** The causal chain is second-hand again: the cause of the courtiers' suffering is *his* suffering, not the suspense itself. This is the chapter's subject stated at its most compact (cf. ch 264 ¶1 "phantoms and reflections of real life") and it is now intact. The corrector took the reviewer's proposal verbatim; I re-derived it from the source independently and it is right. Only "occasioned" is modernised to "was causing", which changes nothing |
| 7 | "terrible news arrived" → "a terrible piece of news was added"; "the latter produced letters … that made them immediately drop the matter" → "the latter had produced such letters … that they had immediately let the matter drop" | "a terrible piece of news was added"; "the latter had produced such letters from the unfortunate deceased that they had immediately let the matter drop" | OK — "was added" is cumulative and lands on the pile the paragraph has been building; the correlative "such … that" (letters of a kind that cannot be described) and the pluperfect inside the chain of hearsay are both back |
| 13 | "the following message" → "the following rescript" | "with the following rescript" | OK — the category is restored and the paragraph that follows is in fact a sovereign's written reply |

No correction split, merged, lengthened or shortened a paragraph beyond the wording listed.
No new meaning drift found in any of the 5.

## 3. Readability of changed paragraphs

Re-read as a new reader. All five are clear. ¶6 was the one at risk — Maude's original
("suffered because of the suffering the suspense occasioned the Emperor") is a genuine
tangle, and a corrector restoring fidelity could easily have restored the tangle with it.
The chosen wording keeps the suffer/suffering repetition that enacts the relay of feeling
while making the grammar parse on first reading. ¶1's "heavier than ours" reads naturally
because the sentence is already inside Kutuzov's report. "Rescript" in ¶13 is glossed by the
document printed immediately after it.

## 4. Structure and punctuation

- Paragraph count 14 = 14 = 14 (source / candidate / corrected). Order unchanged.
- `number` 265 and `title` "Book Twelve (1812) — Chapter 2" identical to source.
- No empty paragraphs. JSON valid.
- Per-paragraph `?` and `!` parity with source: **clean across all 14 paragraphs.**
- Typography conforms: unspaced em dashes (4), straight double quotes, no curly quotes, no
  bracket tags. No footnote slots in this chapter.
- Names conform: Volkonsky (baseline majority, 13:0), Kutuzov, Tatarinova, Tuchkov, Bagration,
  Kutaysov, Rostopchin, Prince Vasili (4), Helene. The two quoted documents (¶12 Rostopchin,
  ¶14 the rescript) are untouched by this round and remain verbatim, which is correct.

## 5. Cross-chapter callback (with ch 264) — repaired at the other end

The fidelity review flagged ¶1's "premonition" as echoing nothing, because ch 264 ¶27 had
rendered "I have a favorable presentiment!" as "I have a good feeling about it!", and gave
two remedies: "Fixing ch 264 ¶27 repairs it; alternatively use 'presentiment' in both." The
first remedy was taken — ch 264 ¶27 now reads "I have a favorable presentiment!" — so ¶1's
"Anna Pavlovna's premonition was in fact fulfilled" refers back explicitly and by name. The
echo is semantic rather than verbally identical, which the reviewer sanctioned. **¶1 must not
be changed as well**; doing so would be applying both alternatives to one finding.

## 6. New findings

None blocking. **No MAJOR or MODERATE finding remains** — no MAJOR existed, and all four
MODERATEs (¶3 ×3, ¶6) are fully answered. Ten of the eleven MINORs were applied.

- **Non-blocking, MINOR, unapplied and unrecorded — ¶9 "his daughter Helene's death".** The
  fidelity review graded this MINOR and ruled the addition supported (Helene's death is
  reported in ¶7 and ¶8) but not free: Maude's bare "his daughter's death", set against Prince
  Vasili's fluent public grief in the same sentence, is colder than the named version. The
  corrector kept the drafter's name, which is a defensible reading of a MINOR that the review
  itself declined to raise to MODERATE, and the drafter's reason is on record in
  `ch265-candidate-notes.md`. It is not carried into the corrections log as a deliberate keep,
  so the accounting is incomplete even though the file is defensible.
- **Non-blocking, pre-existing — ¶7 "protege".** The source has "protégé". CONVENTIONS marks
  the diacritics rule a **Proposal** and instructs drafters to leave existing handling
  unchanged until it is decided, so leaving it is correct here. Noted only so the pending
  diacritics pass picks it up.
- **Author-intrinsic ruling, ¶7 (carried from the candidate notes, confirmed).** The Queen of
  Spain's physician, the "small doses … to produce a certain effect" and the fatal large dose
  are Tolstoy's own euphemism for an abortifacient and a suicide or overdose. The paragraph's
  juxtaposition makes the outcome recoverable; the referent is withheld by the author, not by
  the translation. Kept unspelled-out.

Verification: ACCEPT
sha256: 934d8e57bab2c24bd330b540a8c46dc244f677cbbc14cf617379e270a1a165ba
