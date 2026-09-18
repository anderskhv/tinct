Model: opus

# Chapter 196 (Book Ten — Chapter 6) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch196-candidate.json` vs `ch196-corrected.json`; every change re-derived from
`ch196-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 1, 2, 3, 5, 8, 10, 12, 13, 14, 17, 19** — 12 paragraphs.
Log entries: **0, 1, 2, 3, 5, 8, 10, 12, 13, 14, 17, 19** — 12 entries.

**Exact match. No unlogged change, no logged change missing.** Before/after excerpts in the
log correspond to the actual file states on all twelve.

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 0 | "unmade them" → "unmade them again"; the spelled-out doubled sentence → "remained just as they had been—the one seven and the other five years before"; "the European sovereigns' submission to him" → "the subservience shown to him by the European sovereigns"; enthusiasm → ecstasy | "unmade them again"; "remained just as they had been—the one seven and the other five years before"; "the subservience shown to him by the European sovereigns"; "talked with the same ecstasy in 1812 as in 1808" | OK — four separate restorations, each matching the source. The epigram is back and the one/other ambiguity is no longer resolved for the reader; "ecstasy" again distinct from the "enthusiasm" used for the Moscow enthusiasm in ¶1–¶2 |
| 1 | "dyed-in-the-wool royalists" → "deep-rooted legitimists"; expected → obliged | "deep-rooted legitimists"; "which every clever man was obliged to visit" | OK — party name restored, so ch196 and ch168 now agree on "legitimists"; "obliged" (no choice) restored |
| 2 | ", the ancient biographer," deleted | "as Plutarch speaks of the deeds of the ancients" | OK — added gloss removed; the "ancient … ancients" stumble goes with it |
| 3 | "cautiously suggested that Kutuzov might be" → "cautiously ventured to suggest that Kutuzov would be" | "cautiously ventured to suggest that Kutúzov would be the man to satisfy all requirements" | OK — MODERATE answered. The timidity sits in "ventured to" again and the proposal itself is confident, not hedged |
| 5 | "wouldn't listen to me… They didn't listen." → "did not listen to me… They did not listen to me." | "but they did not listen to me… They did not listen to me." | OK — the exact repetition that is Vasili's rhetoric is restored, and refusal reverts to failure |
| 8 | "in no hurry to repeat it" → "not now in any hurry to express it" | "though he was not now in any hurry to express it" | OK — "now" restored; "express" no longer implies he had voiced it again since |
| 10 | "a real leader" → "a man"; "around the drawing room" → "around at everyone in the drawing room" | "At last we have a man!"; "glancing sternly and significantly round at everyone in the drawing room" | OK — idiom restored, added noun and intensifier gone, and he is once more daring each person present |
| 12 | echoing → reminding | "said he, reminding Prince Vasíli of his own words" | OK — the pointed, impolite act (the point of ¶11) restored |
| 13 | "Nonsense!" → "Eh? Nonsense!" | "Eh? Nonsense! He sees well enough" | OK — dropped interjection restored |
| 14 | repeated → added | "He sees well enough," he added. | OK — the speech verb no longer states the repetition the reader is meant to notice |
| 17 | "like a girl being read a romantic novel" → "like a girl to whom Joconde is read," | "he blushed like a girl to whom Joconde is read" | OK — MODERATE answered. The proper noun is back and the incorrect substitute description is gone; the indecency of La Fontaine's tale, which is the joke, is no longer sanitised into a romance |
| 19 | "Prince Vasili warmly objected" → "warmly rejoined Prince Vasili" | "warmly rejoined Prince Vasíli" | OK — a reply, not an objection |

No correction introduced new drift. All twelve edits are local word/phrase restorations;
no paragraph was split, merged or reordered.

## 3. Readability of changed paragraphs

Re-read as a new reader. All twelve remain clear. Two need a note and neither needs
another round:

- ¶17 "like a girl to whom *Joconde* is read" restores an unglossed proper noun. A modern
  reader will not know *Joconde*, but the sentence still lands — "blushed like a girl to
  whom X is read" reads as embarrassment at something improper — and the fidelity review's
  proposal was to keep the name, glossing "only if necessary". Correct call.
- ¶0's restored epigram ("the one seven and the other five years before") asks the reader
  to carry the two salons across the dash. That is the source's own compression and the
  antecedents are four words away; clear enough.

## 4. Structure and punctuation

- Paragraph count 27 = 27 = 27 (source / candidate / corrected). Order unchanged.
- `number` 196 and `title` "Book Ten (1812) — Chapter 6" identical to source.
- No empty paragraphs.
- JSON valid.
- Per-paragraph `?` / `!` parity with source: clean on 26 of 27. **¶6** differs — source
  `? 4 / ! 5`, corrected `? 5 / ! 4`. Traced: the source's exclamative rhetorical question
  "How could they make a man commander in chief who cannot mount a horse, who drops asleep
  at a council, and has the very worst morals!" is punctuated with a question mark in the
  candidate. This is a genuine restructuring of one sentence (interrogative in form, so "?"
  is defensible), it is **pre-existing in the candidate and not introduced by this round**
  (¶6 is byte-identical between candidate and corrected), and the fidelity review did not
  raise it. Every other exclamation and question in ¶6 — Bucharest, "A fine idea, a blind
  general!", "positively blind?", "blindman's buff?", "He can't see at all!" — is preserved.
  Non-blocking.

## 5. New findings

None blocking.

- Both MODERATE findings (¶17 *Joconde*, ¶3 "ventured to suggest… would be") are fully
  answered, and every MINOR finding in the fidelity review was applied.
- The two COSMETIC items are correctly accounted for in the log and correctly left alone:
  ¶26 "naivety" (diacritic decision pending) and ¶6 "blindman's buff" (silent, correct fix
  of the source typo "bulff").
- **Non-blocking (pre-existing, unchanged by this round):** ¶17 now opens "They say the
  Emperor was reluctant…" and continues "They say he blushed…", where the source varies
  with "It is said that…". A small repetition, inherited from the candidate, not worth
  another round. ¶19 drops "himself" from "not only admirable himself"; also inherited.
- **No MAJOR or MODERATE finding remains.**

Verification: ACCEPT
sha256: d62f850e2401638f49fd8c67cd8be773f11a1d451c006a626fcc3994f2df48e4
