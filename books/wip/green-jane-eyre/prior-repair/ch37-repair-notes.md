# Jane Eyre — Chapter 37 (Ferndean reunion) — Modern-EN Repair Notes

**Method:** computed modern_word_count / source_word_count for all 262 paragraphs.
Flagged every paragraph where the source paragraph was 25+ words and the ratio fell
below 0.85 (36 candidates). Each candidate was read against source in full; 8 were
judged to be legitimate modern-English tightening with no loss of content or meaning
(indices 106, 126, 136, 143, 145, 212, 249, 250) and were left untouched. 28 were
judged genuinely damaged (invented substitutions, dropped clauses/images, or altered
facts) and were restored from source. Paragraph 89 was flagged by the audit's
description ("John's wife" → "Mary's voice") but on inspection the current text
already reads "Mary's voice" correctly — no change was needed there.

**Result:** 262/262 paragraphs preserved in count. 28 paragraphs changed
(diff-verified against `ch37-current-modern-en.json`), 234 left byte-identical.

## Changed paragraph indices (0-based, diff-verified)

0, 1, 3, 7, 8, 10, 15, 48, 57, 63, 66, 71, 72, 76, 85, 86, 91, 92, 93, 104, 110, 113,
114, 115, 116, 118, 248, 256

## Word-ratio scan: before vs. after (source word count → before ratio → after ratio)

| idx | src words | before words | before ratio | after words | after ratio |
|-----|-----------|--------------|--------------|-------------|-------------|
| 0   | 101 | 82  | 0.81 | 87  | 0.86 |
| 1   | 145 | 114 | 0.79 | 132 | 0.91 |
| 3   | 152 | 123 | 0.81 | 145 | 0.95 |
| 7   | 53  | 38  | 0.72 | 56  | 1.06 |
| 8   | 96  | 77  | 0.80 | 93  | 0.97 |
| 10  | 142 | 82  | 0.58 | 140 | 0.99 |
| 15  | 155 | 113 | 0.73 | 145 | 0.94 |
| 48  | 66  | 35  | 0.53 | 63  | 0.95 |
| 57  | 48  | 28  | 0.58 | 48  | 1.00 |
| 63  | 130 | 44  | 0.34 | 134 | 1.03 |
| 66  | 82  | 51  | 0.62 | 80  | 0.98 |
| 71  | 52  | 36  | 0.69 | 52  | 1.00 |
| 72  | 70  | 47  | 0.67 | 65  | 0.93 |
| 76  | 41  | 33  | 0.80 | 41  | 1.00 |
| 85  | 119 | 50  | 0.42 | 125 | 1.05 |
| 86  | 96  | 46  | 0.48 | 96  | 1.00 |
| 91  | 123 | 48  | 0.39 | 116 | 0.94 |
| 92  | 59  | 22  | 0.37 | 54  | 0.92 |
| 93  | 38  | 26  | 0.68 | 39  | 1.03 |
| 104 | 73  | 32  | 0.44 | 67  | 0.92 |
| 110 | 131 | 92  | 0.70 | 135 | 1.03 |
| 113 | 80  | 60  | 0.75 | 76  | 0.95 |
| 114 | 52  | 41  | 0.79 | 51  | 0.98 |
| 115 | 108 | 59  | 0.55 | 96  | 0.89 |
| 116 | 93  | 39  | 0.42 | 90  | 0.97 |
| 118 | 105 | 65  | 0.62 | 104 | 0.99 |
| 248 | 188 | 132 | 0.70 | 186 | 0.99 |
| 256 | 128 | 93  | 0.73 | 128 | 1.00 |

All ratios now sit between 0.86 and 1.06 (natural range for faithful modernization).
The full scan (all 262 paragraphs, before/after) can be reproduced with the script
used to build this file — see the repro note at the bottom.

## Candidates examined but NOT changed (legitimate tightening, no content lost)

106, 126, 136, 143, 145, 212, 249, 250 — all below the 0.85 threshold on a
word-count basis, but each was checked clause-by-clause against source and found
to preserve every fact/image, just phrased more economically in modern idiom.

## What was wrong, paragraph by paragraph

- **0** — "fitted up for the accommodation of the squire when he went there in the
  season to shoot" had been changed to "for Mr. Rochester's occasional overnight
  stays," altering the stated reason the rooms existed. Restored the shooting-season
  detail.
- **1** — Source's closing image (the grass-grown track winding on and on, "no sign
  of habitation or grounds was visible") was replaced with unrelated invented text
  ("no clear drive... crept up to the very doorstep... wild and untrimmed") that
  doesn't belong to this paragraph. Restored source's actual description.
- **3** — Dropped the closing sentence: the church-like stillness and the rain on
  forest leaves as the only sound. Restored.
- **7** — Source's "restraining my voice from exclamation, my step from hasty
  advance" was replaced with an invented "I held back the tears that threatened."
  Restored the source description of the sudden, silent meeting.
- **8** — Dropped the eagle/Samson simile ("The caged eagle, whose gold-ringed eyes
  cruelty has extinguished, might look as looked that sightless Samson") — a key
  classical/biblical allusion tying blindness to the Samson theme running through
  the chapter. Restored.
- **10** — Cut ended with an invented "He let his hand fall, then turned and went
  back inside," which **contradicts** paragraph 13, where he later gropes his way
  back into the house after the John exchange (paras 11–13) — i.e., the current
  text had him going inside twice. Restored source's actual ending, "At this
  moment John came toward him from somewhere nearby," which correctly sets up the
  John dialogue in the following paragraphs.
- **15** — Dropped/altered several plot details: the destination for fetching the
  trunk was changed from "the turnpike house" to "the inn at Millcote" (not in
  source), and the entire passage about negotiating to stay the night at the Manor
  House was replaced with an invented "I sat down to collect my thoughts." Restored
  source's actual sequence of events.
- **48** — Dropped Rochester's dream-speech ending: "my heart famished and never to
  be fed... but kiss me before you go—embrace me, Jane." This is emotionally
  significant material cut without replacement. Restored.
- **57** — **Setup/payoff break.** Dropped "What, Janet! Are you an independent
  woman? A rich woman?" — this is the direct setup for paragraph 58's reply,
  "Quite rich, sir." Without the question, para 58 is a non-sequitur. Restored.
- **63** — **Setup/payoff break.** Dropped Jane's realization that Rochester hasn't
  proposed as she expected, and — critically — "I began gently to withdraw myself
  from his arms—but he eagerly snatched me closer." Paragraph 64 opens with "No—no
  —Jane; you must not go," which only makes sense as a response to her trying to
  pull away. Restored the full paragraph including the withdrawal/snatch beat.
- **66** — Replaced Rochester's actual dialogue (about being a "kind little nurse,"
  the parenthetical about her affectionate heart, and the "fatherly feelings"
  question) with invented text about "the blind man in his cell." Restored source
  dialogue.
- **71** — Replaced Jane's actual reasoning ("these last words gave me an insight
  as to where the difficulty lay... no difficulty with me... relieved from
  embarrassment") with an unrelated invented line about not letting the
  conversation "drift into despair." Restored source meaning.
- **72** — Dropped the Nebuchadnezzar allusion ("You have a 'faux air' of
  Nebuchadnezzar in the fields about you") and the bird-claws joke about his
  nails, replaced with a flat "whether it has been combed lately." Restored both.
- **76** — **Setup/payoff break.** Dropped "Can you tell when there is a good
  fire?" — the direct setup for paragraph 77's "Yes; with the right eye I see a
  glow." Restored the question.
- **85** — **The chapter's emotional core** (per audit). Omitted the passage
  central to the whole reunion: "There was no harassing restraint... Delightful
  consciousness! It brought to life and light my whole nature: in his presence I
  thoroughly lived; and he lived in mine. Blind as he was, smiles played over his
  face..." — replaced with an invented, distancing line about Rochester being
  "astonished, even a little overwhelmed." Restored the source passage in full.
- **86** — Dropped the setup for the following dialogue beat: "my sole present aim
  was to cheer him. Cheered... he was: and yet but by fits. If a moment's silence
  broke the conversation, he would turn restless, touch me, then say, 'Jane.'"
  Current text substituted an invented "I wanted to keep certain things back until
  another time" and cut the dialogue cue entirely. Restored, so the "Jane" cue that
  follows is properly set up.
- **91** — Dropped Rochester's entire account of his months of despair: "merging
  night in day; feeling but the sensation of cold when I let the fire go out...
  for her restoration I longed, far more than for that of my lost sight."
  Restored.
- **92** — **Setup/payoff break** (per audit). Dropped the "scorched eyebrows"
  detail — the direct setup for the later "Have you a pocket-comb about you, sir?"
  exchange (not itself rewritten, just verified downstream — it still reads
  correctly once this setup is restored). Restored.
- **93** — Dropped "whither and how to me unknown, and for me remaining afterwards
  undiscoverable," compressing Rochester's fear of losing her again into a vaguer
  line. Restored.
- **104** — Dropped the witty callback to the glass-of-water incident earlier in
  the chapter ("I must bring an egg at the least, to say nothing of fried ham").
  Restored.
- **110** — Replaced the source's central image (Rochester as "a lamp quenched,
  waiting to be re-lit," dependent on someone else to "kindle the lustre of
  animated expression") with invented content about Pilot resting his head on
  Rochester's hand. Restored the source's actual imagery.
- **113** — Dropped the wry parenthetical "(I am glad it is not naturally a silent
  one)." Restored.
- **114** — Dropped the concrete closing action, "I dashed off the salt drops, and
  busied myself with preparing breakfast," replaced with a vaguer "I would not
  weep now." Restored the concrete action.
- **115** — Dropped several physical/intimate details (the dry tree stump, Jane
  being pulled onto his knee, Pilot lying beside them) and — importantly — the
  paragraph's final clause, "clasping me in his arms," which is the direct
  physical transition into paragraph 116's outburst. Restored.
- **116** — Dropped most of Rochester's account of discovering Jane's flight: the
  untouched pearl necklace, the corded and locked trunks, and the direct question
  "What could my darling do... left destitute and penniless? And what did she do?
  Let me hear now." Restored.
- **118** — **Factual/thematic distortion, not just omission.** Source: "he would
  never have forced me to be his mistress" — a central plot point (Jane fled to
  avoid an illegitimate marriage). Current text had substituted "he would never
  have forced me to remain at Thornfield," erasing that meaning. Also dropped "he
  would have given me half his fortune, without demanding so much as a kiss in
  return" and "I had endured... more than I had confessed to him." Restored all,
  including the correct "mistress" wording.
- **248** — Dropped a large middle section of Rochester's confession: "You know I
  was proud of my strength: but what is it now, when I must give it over to
  foreign guidance, as a child does its weakness? Of late, Jane—only—only of
  late—I began to see and acknowledge the hand of God in my doom." Restored.
- **256** — Dropped the paragraph's closing assertion that he actually heard
  Jane's voice call his name across the distance ("for those were your accents—as
  certain as I live—they were yours!"), replaced with a vaguer "must have felt it
  at the same moment" that undercuts the novel's supernatural call-and-response
  beat. Restored the direct assertion.

## Setup/payoff pairs verified after repair (downstream line NOT rewritten, only
checked for sense)

- **57 → 58**: "Are you an independent woman? A rich woman?" → "Quite rich, sir."
- **63 → 64**: Jane withdraws from his arms → "No—no—Jane; you must not go."
- **76 → 77**: "Can you tell when there is a good fire?" → "Yes; with the right eye
  I see a glow."
- **86 → 87** (dialogue cue "Jane" preserved, downstream dialogue verified intact).
- **92 → [later pocket-comb exchange]**: scorched eyebrows restored so the later
  "Have you a pocket-comb about you, sir?" line is no longer a non-sequitur.
- **115 → 116**: "clasping me in his arms—" → "Cruel, cruel deserter!" outburst.
- **116 → 117**: "Let me hear now" (his direct prompt) → "Thus urged, I began the
  narrative..." (Jane's narration).

## Reproducibility note

The word-ratio scan and the fixed paragraph text were generated by a script
(`build_corrected.py`, run in the session scratchpad) that:
1. Loads `ch37-source.json` and `ch37-current-modern-en.json`.
2. Computes `len(modern.split()) / len(source.split())` per paragraph.
3. Applies the 28 hand-authored replacement paragraphs above by index.
4. Diffs the result against the original current file and asserts the diff set
   equals exactly the intended 28 indices before writing `ch37-corrected.json`.
