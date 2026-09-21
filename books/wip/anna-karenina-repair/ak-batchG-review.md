# Anna Karenina — Batch G Independent Adversarial Review (Chapters 135–155)

## Scope and method

This is an independent re-check of the drafter's self-reported "0 defects
found" verdict for Batch G. I did not take the notes file at face value.
Verification performed:

1. **Byte-identity check**: `ak-batchG-corrected.json` vs
   `ak-batchG-current-modern-en.json` — confirmed programmatically identical
   (Python `==` on parsed JSON).
2. **Structural check**: paragraph counts and chapter numbers for all 21
   chapters compared programmatically between `ak-batchG-source.json` and
   `ak-batchG-current-modern-en.json`. All 21/21 chapters match exactly
   (586 paragraphs total, chapter numbers 135–155 / "Chapter 11"–"Chapter 31"
   aligned one-to-one).
3. **Full manual read**: every paragraph of every chapter read side-by-side
   against the Garnett source, not spot-checked. This included dumping all
   586 paragraph pairs to side-by-side text and reading them in full,
   chapter by chapter, in this session.
4. **Automated length-ratio scan** (independent of the drafter's own scan),
   at a tighter threshold (flagging any paragraph pair outside 0.7–1.5 word
   ratio, vs. the drafter's ~0.65/1.35). This produced only 3 flags across
   the entire batch (140/22, 149/1, 150/11) — all individually verified as
   faithful, non-lossy renderings (see below).
5. **Special scrutiny on Nikolay's death scene** (chapter 144, "Chapter 20",
   56 paragraphs — identified independently by searching source text for
   death-related terms, not by trusting the notes file's chapter pointer):
   read in full, paragraph by paragraph, against source.

## Verdict: ACCEPT AS-IS

I found no content-fidelity defects. The drafter's self-report holds up
under independent, full re-read. Specifically:

- **No dropped clauses or sentences** anywhere in the 586 paragraphs.
- **No invented content.**
- **No negation/conditional inversions.** Checked polarity-sensitive lines
  particularly closely (e.g., ch153 para 40 "I never believed it" ↔ "I
  never believed it"; ch144 death-scene negations "did not show any sign of
  life" ↔ "showed no sign of life"; "would not have recognized me" ↔
  preserved) — all correct.
- **No compressed passages that lose content.** The only paragraphs flagged
  by length-ratio scanning are economical modern phrasing of the same
  content (e.g., ch150/11: "What do you say? Where?" → "What? Where?";
  ch149/1: "She was changing her dress." → "She was changing." — both
  preserve full meaning, nothing substantive dropped).
- **No factual/plot/relationship distortions.** Names, titles/honors
  (Alexander Nevsky, Vladimir, Andrey Pervozvanny), relationships (Marya
  Nikolaevna as Nikolay's former mistress, Countess Lidia Ivanovna's
  unspoken infatuation with Karenin, Seryozha's belief his mother is not
  really dead, Vronsky's family's cold reception of Anna, Betsy's
  performative "courage"), and plot beats all check out precisely against
  source.

### Nikolay's death scene (ch144) — specific verification

Read in full (56/56 paragraphs). Confirmed faithful and unsoftened on every
beat that matters for this kind of check:

- The extreme unction scene and Levin's cynical internal "if Thou dost
  exist" prayer — preserved in full, including the parenthetical irony.
- Nikolay's bitter sarcasm ("I'll lie down soon enough... when I'm dead")
  — tone and word choice intact, not softened.
- The physically graphic deterioration (bedsores, "picking at himself,"
  the wasted limbs, the inability to feel pity described starkly: "he felt
  utterly cold, and was not conscious of sorrow nor of loss, less still of
  pity for his brother. If he had any feeling for his brother at that
  moment, it was envy") — rendered without euphemism.
- The actual death moment — "He is gone," the twitch, "Not quite ... soon,"
  the brightening face, the women laying out the corpse — all present,
  paragraph-for-paragraph, with the unsettling post-mortem detail intact.
- Levin's admission of relief/envy rather than grief is preserved as bluntly
  as the source states it — not rounded off into something more palatable.

No softening, sanitizing, or trimming detected in this scene.

## Paragraphs checked for possible compression (length-ratio flags)

| Ch. | Para idx | Ratio | Verdict |
|---|---|---|---|
| 140 | 22 | 1.54 | Faithful expansion ("Well, for one thing then, because this woman's there whom you can't meet." → "...that woman is there — and you can't be in the same room with her.") — same meaning, no distortion. |
| 149 | 1 | 0.60 | Faithful compression, no content lost. |
| 150 | 11 | 0.40 | Faithful compression, no content lost. |

(These overlap with the drafter's own flagged list; I independently
re-verified each against source rather than trusting the notes file's
characterization.)

## Chapter-by-chapter confirmation

All 21 chapters (135–155 / "Chapter 11"–"Chapter 31") read in full and
confirmed faithful: Mihailov's studio scene and the Pilate/Christ painting
critique (135–137), Anna's portrait and Vronsky's dilettantism (138), the
opening of Levin and Kitty's married life and their first quarrel (139–140),
the journey to Nikolay's deathbed and Levin/Kitty's contrasting reactions to
illness (141–143), Nikolay's death (144), Levin's reflection on Kitty's and
Agafea Mihalovna's intuitive competence around death and Kitty's pregnancy
being confirmed (145), Karenin's isolation and humiliation (146), Countess
Lidia Ivanovna's backstory and her interception of Anna's letter (147–148),
the Part Five/Six boundary (mid-chapter 148/149 in this numbering — no
structural anomaly), Seryozha's birthday and his father's coldness (150–151),
Vronsky and Anna's chilly reception in Petersburg society (152), Anna's
secret visit to see Seryozha on his birthday (153–154), and Anna's jealousy
and the Yashvin dinner-invitation scene closing the batch (155).

## Disposition

No edits required. `ak-batchG-corrected.json` is confirmed identical to
`ak-batchG-current-modern-en.json`, and both are confirmed faithful,
paragraph-aligned, unsoftened renderings of the Garnett source across all
21 chapters. This batch is safe to accept as-is.
