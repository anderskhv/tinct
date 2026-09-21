# Anna Karenina — Batch J (Chapters 198–218) — Independent Adversarial Review

**Reviewer:** Independent second-pass review. Did not trust `ak-batchJ-notes.md`'s claims;
re-derived every finding from `ak-batchJ-source.json` directly.

## Verdict: ACCEPT AS-IS

The corrected file (`ak-batchJ-corrected.json`) is faithful to the locked source across
all 21 chapters. The single claimed fix is real, correctly diagnosed, and correctly
repaired. No additional defects were found in an independent full read.

## 1. Diff scope — confirmed exact

Programmatically diffed `ak-batchJ-current-modern-en.json` against
`ak-batchJ-corrected.json` paragraph-by-paragraph across all 21 chapters (649 paragraphs
total). Exactly **one** paragraph differs:

- Chapter 213 ("Chapter 24"), paragraph index 30 (0-based).
- Old: "Respect was invented to fill the empty space where love used to be. And if you
  don't love me anymore, it would be better and more honest to say so."
- New: "Respect was invented to paper over the empty place where love ought to be. And
  if you don't love me anymore, it would be better and more honest to say so."

No other paragraph in any of the 21 chapters was touched. The drafter's claim that this
is the only change is correct.

## 2. Claimed fix — verified correct against source

Source paragraph (ch213, P30):

> "Respect was invented to cover the empty place where love should be. And if you don't
> love me any more, it would be better and more honest to say so."

The source states a general/structural aphorism ("where love *should be*" — i.e., where
love belongs in general, a claim about the concept of respect). The pre-fix rendering
("where love *used to be*") converted this into a specific claim that love had existed
between Anna and Vronsky and was now gone — collapsing the aphorism into a restatement
of the very next sentence ("if you don't love me any more..."), and losing the
philosophical point Anna is making a beat before she makes the personal accusation
explicit. The corrected rendering ("where love *ought to be*") restores the source's
generality. This diagnosis and fix are correct. "Cover" → "paper over" is a legitimate
modern-register substitution that doesn't change meaning (both mean concealment/pretense
over an absence).

## 3. Full independent paragraph-by-paragraph read — no additional defects

Read every paragraph of all 21 chapters (198–218) against source, not just the passages
the notes file flagged. Paragraph counts match source exactly for all 21 chapters (see
§5). No dropped or invented clauses, no negation/conditional inversions, no
plot/factual distortions, and no compression of argument or dialogue were found beyond
the single already-fixed instance.

Special scrutiny was given to the emotionally heavy passages the notes file claims were
checked and left unsoftened. All are present, complete, and rendered with full weight:

- **Anna's jealousy / self-pity** (ch212/213/214, e.g. "Chapter 23"–"Chapter 25"):
  fully intact, including the interior monologue on jealousy having no fixed object
  ("she was jealous... of the decrease of his love. Not having got an object for her
  jealousy, she was on the lookout for it") and the self-pity passages ("feeling tears
  of self-pity coming into her eyes" / "feeling tears of self-pity rising in her eyes").
- **Opium and suicidal/death ideation** (ch215/"Chapter 26", P8): the passage where
  Anna measures out her opium dose and dwells with pleasure on Vronsky's future
  suffering is rendered without softening — "she began to dwell with pleasure on how he
  would suffer" is preserved almost verbatim, and the full "Death!" / cold-sweat
  sequence, the near-loss of the candle, and the flight to his room are all intact.
- **The recurring nightmare** (ch215, P10): the old-man/iron nightmare is rendered in
  full, including "felt that the peasant was taking no notice of her, but was doing
  something hideous with the iron — over her," matching source closely.
- **Kitty's labor** (ch202/203/204 — "Chapter 13"–"Chapter 15"): the full duration,
  the doctor's maddening calm, the "Lord have mercy" refrain, and Levin's terror are
  all present at full length and intensity; nothing is compressed or summarized.
- **Levin's initial revulsion toward the newborn** (ch204/205 — "Chapter 15"–"Chapter
  16"): "He had long ago ceased to wish for the child. By now he loathed this child...
  all he longed for was the end of this awful anguish" is rendered as "By now he hated
  this child" — unsoftened, matching the notes' own quoted line. The later "disgust and
  compassion" / "nothing cheerful and joyous ... a new torture of apprehension" passage
  is also intact.
- **Anna's later self-loathing/immoral-woman outburst** (ch213, P48): "An immoral
  woman! A stone round your neck" is preserved verbatim in substance ("An immoral
  woman! A stone around your neck").

No instance was found anywhere in the batch of a difficult passage being softened,
hedged, or shortened relative to source.

## 4. Other fidelity checks

- Proper nouns, place names, sums of money, times, ages, and French/Latin phrases
  (_une couveuse_, _Vos scrupules_, _tant pis pour elle_, _le fameux Jules Landau, le
  clairvoyant_, etc.) are preserved correctly throughout.
- Dialogue structure and turn-taking match source; no lines are merged, dropped, or
  reassigned to a different speaker.
- Plot facts checked and correct: Kitty's son is named Dmitri; the baby's sex ("a boy
  too") is preserved; Seryozha's age/schooling details; the Landau/Bezzubov séance
  scene and its consequence (Karenin refuses the divorce) are all rendered accurately;
  Stiva's Petersburg appointment negotiation (amounts, names — Pomorsky, Mordvinsky,
  Bartnyansky, Volgarinov) all check out against source.

## 5. Paragraph counts — verified programmatically, all match source

| Ch. (source #) | Title | Corrected | Source | Match |
|---|---|---|---|---|
| 198 | Chapter 9 | 17 | 17 | OK |
| 199 | Chapter 10 | 50 | 50 | OK |
| 200 | Chapter 11 | 25 | 25 | OK |
| 201 | Chapter 12 | 20 | 20 | OK |
| 202 | Chapter 13 | 29 | 29 | OK |
| 203 | Chapter 14 | 39 | 39 | OK |
| 204 | Chapter 15 | 17 | 17 | OK |
| 205 | Chapter 16 | 23 | 23 | OK |
| 206 | Chapter 17 | 30 | 30 | OK |
| 207 | Chapter 18 | 28 | 28 | OK |
| 208 | Chapter 19 | 28 | 28 | OK |
| 209 | Chapter 20 | 30 | 30 | OK |
| 210 | Chapter 21 | 53 | 53 | OK |
| 211 | Chapter 22 | 13 | 13 | OK |
| 212 | Chapter 23 | 20 | 20 | OK |
| 213 | Chapter 24 | 51 | 51 | OK |
| 214 | Chapter 25 | 68 | 68 | OK |
| 215 | Chapter 26 | 24 | 24 | OK |
| 216 | Chapter 27 | 28 | 28 | OK |
| 217 | Chapter 28 | 39 | 39 | OK |
| 218 | Chapter 29 | 17 | 17 | OK |

Total: 649 paragraphs in both source and corrected, 21/21 chapters matching in number,
title, and order.

## Conclusion

The drafter's self-report is accurate. `ak-batchJ-corrected.json` is ready to accept.
No edits are required beyond the one already made.
