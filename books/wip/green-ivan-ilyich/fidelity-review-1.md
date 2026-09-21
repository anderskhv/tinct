# Fidelity Review 1 — The Death of Ivan Ilyich (candidate.json vs. source.json)

**Reviewer:** independent fidelity pass, working directly from source.json (the
locked fidelity anchor — the printed English translation staged in this
directory, spelling convention "Ivan Ilych," likely Louise and Aylmer Maude's
public-domain translation based on characteristic wording, though the file
carries no explicit translator credit).

**Coverage:** Full, non-sampled. All 12 chapters, all 298 paragraphs, read
source-against-candidate in packets of the whole chapter at a time (chapters
here run 7–52 paragraphs, well within a single packet with full neighboring
context on both sides — every paragraph was read individually, none skimmed).
Special attention paid, per instructions, to Ivan Ilych's psychological arc
(denial in ch6, bargaining in ch5/ch9, isolation and rage in ch7–ch9,
ch11–ch12) and to whether physical/psychological decline was rendered with
full honesty rather than softened.

## Method note

Given the paraphrase-heavy nature of a modern-English rendering, packet
comparison was done by close reading (actors, negation, causality,
hedging/certainty, conditions, omissions, additions, silent corrections,
unmodernized quotations) rather than mechanical diffing. A programmatic
proper-noun frequency audit (counting every capitalized token in both files)
was also run across the whole book as a supplementary check specifically
aimed at the silent-name-correction failure class called out in
`SECOND-BATCH-TRACKER.md` — this is what surfaced the defects below; they
were then independently confirmed by reading the exact paragraph in both
files side by side.

## Defects found (all in the silent-name/spelling-correction class)

1. **BLOCKING — Ch6, Ch7, Ch8: protagonist's name spelled "Ilyich" instead
   of source's "Ilych."** Source spells the name "Ivan Ilych" (or "Ilych"
   alone) consistently in every one of its 12 chapters (180 of 181 total
   occurrences; one stray "Ilyich" appears once, in ch4 — see defect 2).
   The candidate matched this in chapters 1–5 and 9–12, but chapters 6, 7,
   and 8 systematically used "Ilyich" instead — 4 occurrences in ch6, 20 in
   ch7, 25 in ch8 (52 total). This is exactly the silent-"correction"-to-a-
   different-standard-spelling failure this batch was warned about: "Ilyich"
   is a more common modern transliteration of the Russian, but it is not
   what this locked source prints. Example — ch6 [0], candidate before fix:
   "Ivan Ilyich could see that he was dying..." where source [0] reads "Ivan
   Ilych saw that he was dying..." **Fix applied:** every "Ilyich" in
   chapters 6, 7, 8 changed to "Ilych" (52 words across 23 paragraphs: ch6
   [0,1,5,6]; ch7 [0,2,4,9,10,11,13,15,21,24,25,26,27]; ch8
   [2,6,13,14,15,17,22,24,26,31,35,36,44,46,48,50]).

2. **BLOCKING (technical, single word) — Ch4 [1]: source's own one-off
   "Ilyich" not reproduced.** Source paragraph 4[1] itself prints "It was
   not a question of Ivan Ilyich's life or death..." — the single stray
   instance of this spelling anywhere in the source. The candidate had
   normalized this to "Ilych," matching the rest of chapter 4 but not what
   source actually prints at that specific spot. Per protocol, fidelity is
   to source.json's literal printed form, including its own internal
   inconsistencies — not to a "corrected," internally-consistent version of
   it. **Fix applied:** restored "Ivan Ilyich's" at that one spot to match
   source exactly.

3. **BLOCKING (technical, single word) — Ch3 [5]: source's own one-off
   "Sachar" not reproduced.** Source prints "Zachar Ivanovich" three times
   and "Sachar Ivanovich" once (ch3 [5], second mention in that paragraph:
   "...it was highly favourable for Ivan Ilych, since Sachar Ivanovich was a
   friend and colleague of his"). The candidate normalized both mentions in
   that paragraph to "Zachar." **Fix applied:** restored "Sachar" at that
   one spot to match source's literal printed text.

4. **BLOCKING — Ch11 [0] and [8]: "Praskovya Fyodorovna" instead of source's
   consistent "Praskovya Fedorovna."** Source spells the wife's patronymic
   "Fedorovna" everywhere in the book (37+ occurrences, including elsewhere
   in ch11). The candidate wrote "Fyodorovna" (a more standard modern
   transliteration) at exactly these two spots — ch11 [0] ("The next day
   Praskovya Fyodorovna walked into her husband's room...") and ch11 [8]
   ("...told Praskovya Fyodorovna that the case was very grave..."). Same
   failure class as defects 1–3: a silent correction to a "better"
   spelling that the source does not use. **Fix applied:** both instances
   changed to "Fedorovna."

## Non-blocking items (checked, not defects)

- **French/Latin social-register phrases left untranslated** (*le phénix de
  la famille*, *comme il faut*, *bon enfant*, *de gaieté de coeur*, *à la
  Capoul*, *respice finem*, *Il faut que jeunesse se passe*): correctly
  preserved in the source language rather than translated. This is
  fidelity-correct, not a defect — the narrator's use of French for the
  gentry's affectations is a deliberate characterization device in the
  source, and translating these phrases into English would erase exactly
  the point being made about Ivan Ilych's social class. Non-blocking,
  reader-centered reason: preserving a period social marker the source uses
  on purpose.
- **Diacritic on "de gaieté de coeur"**: candidate adds an acute accent
  (é) that the source's own printed text lacks ("de gaiete de coeur," almost
  certainly an ASCII/OCR limitation in the scanned public-domain text, not a
  deliberate spelling by the translator). Checked against the rest of the
  source file for consistency: the source is not otherwise systematically
  stripped of French diacritics (compare "*le phénix de la famille*," which
  does carry its accent in source), so this reads as an isolated
  transcription gap rather than a considered choice. Left as-is
  (non-blocking): correcting an evidently-missing accent on a common French
  idiom is not the kind of "name/spelling/transliteration" correction the
  batch's failure lessons are warned against (those are about proper names
  and person-referring spellings, where source's own choice carries
  narrative weight); it does not change any claim, actor, or meaning, and
  a reader is better served by the correctly-accented French phrase.
- **Numbers, dates, rubles amounts, ages, chapter/paragraph counts**: spot-
  checked throughout (800/3,500/5,000/3,500 rubles, forty-five rubles,
  two hundred rubles, five hundred rubles, age forty-five, seventeen years,
  twenty years, February 4 1882, three days of screaming, etc.) — all
  preserved exactly.
- **Frank physical/psychological content** (the corpse's smell in ch1, the
  bodily-function ordeal and Ivan Ilych's "bare, withered thighs" in ch7,
  the screaming and rage in ch9/ch12, the hatred toward his wife in ch5/ch8/
  ch11, the "no God at all" line in ch9): checked line by line against
  source for softening. None found — every instance of frank illness,
  bodily decline, denial, rage, and despair in source is rendered with full
  force in the candidate, matching or slightly intensifying the source's own
  directness (e.g. "the ordeal of filth and indecency and stench" for
  source's "the uncleanliness, the unseemliness, and the smell"). This is
  the specific failure pattern (Gilgamesh-style softening) the task asked to
  watch for, and it was not found here.
- **Vladimir Ivanovich / Vasya**: source itself refers to the son by both
  his formal name and the nickname "Vasya" without reconciling them; the
  candidate reproduces this exactly as source does, not "fixing" the
  apparent inconsistency. Correct behavior, not a defect.
- **Unmodernized quotations check**: no archaic-island quotations found —
  all dialogue and quoted formulas (the death notice in ch1, the syllogism
  in ch6, Ivan Ilych's prayers in ch9) are rendered in the same modern
  register as the surrounding prose.

## Whole-chapter cross-boundary re-read (step C)

After the packet-by-packet pass and the name-frequency audit, the whole book
was re-read once more end to end (both files) specifically for
cross-chapter consistency of recurring images and relationships: the
"It"/death personification introduced in ch6 and carried through ch7–ch10;
Gerasim's role and dialogue across ch7 and ch9; Praskovya Fedorovna's
"attitude" toward the illness as stated in ch4, ch8, and ch11; the black
sack/falling image in ch9 and ch12; the recurring vermiform-appendix
bargaining thread across ch5, ch8, and ch11. All carried consistent
terminology and correct actor attribution across chapter boundaries in both
source and (post-fix) candidate. No new defects surfaced in this pass beyond
the four already listed and fixed above.

## Verdict

**ACCEPT WITH FIXES REQUIRED** at the time of this review. All four required
fixes (defects 1–4) have been applied to candidate.json using
`content_edit_helpers.safe_replace` (for the two single-occurrence fixes)
and a verified, diff-checked global token substitution for the two
whole-chapter "Ilyich→Ilych" corrections (a plain paraphrase-level
`safe_replace` was not the right tool for 52 repeated-token instances across
23 paragraphs; each paragraph's exact changed set was verified against
`diff_report`/`assert_only_changed` before and after, and every fixed
paragraph was independently re-read against source.json — see
ACCEPTANCE-RECORD.md for the re-verification pass and final hash).
