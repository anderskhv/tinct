# Anna Karenina — Batch C (Chapters 51–71) — Independent Adversarial Review

## Verdict: ACCEPT AS-IS

This is an independent re-verification of the drafter's "0 defects found" claim in
`ak-batchC-notes.md`. I did not trust that claim at face value. I read every paragraph
of all 21 chapters (551 paragraph pairs) against the locked Garnett source myself,
ran automated cross-checks as a second layer, and specifically re-verified each of the
five passages the drafter's notes singled out as checked. I found no dropped or
invented clauses, no negation/conditional inversions, no compressed or summarized
passages, and no factual/plot/relationship distortions anywhere in the batch.

## 1. File identity check

`ak-batchC-corrected.json` and `ak-batchC-current-modern-en.json` are byte-identical
(confirmed programmatically: `json.load` equality on both files returns `True`). This
matches the notes' claim that no fixes were needed or applied.

## 2. Paragraph counts

Verified programmatically for all 21 chapters — source vs. modern-en, chapter by
chapter — and all match exactly:

| Ch. # | Title | Source paras | Modern-en paras |
|---|---|---|---|
| 51 | Ch.17 | 37 | 37 |
| 52 | Ch.18 | 8 | 8 |
| 53 | Ch.19 | 37 | 37 |
| 54 | Ch.20 | 42 | 42 |
| 55 | Ch.21 | 37 | 37 |
| 56 | Ch.22 | 42 | 42 |
| 57 | Ch.23 | 28 | 28 |
| 58 | Ch.24 | 39 | 39 |
| 59 | Ch.25 | 21 | 21 |
| 60 | Ch.26 | 18 | 18 |
| 61 | Ch.27 | 28 | 28 |
| 62 | Ch.28 | 34 | 34 |
| 63 | Ch.29 | 47 | 47 |
| 64 | Ch.30 | 9 | 9 |
| 65 | Ch.31 | 39 | 39 |
| 66 | Ch.32 | 52 | 52 |
| 67 | Ch.33 | 21 | 21 |
| 68 | Ch.34 | 61 | 61 |
| 69 | Ch.35 | 67 | 67 |
| 70 | Part 3, Ch.1 | 9 | 9 |
| 71 | Part 3, Ch.2 | 18 | 18 |

No paragraph was added, dropped, split, or merged. Total: 551/551.

## 3. Full manual paragraph-by-paragraph read

Every paragraph in every chapter (not a sample) was read side by side against the
Garnett source. No content-fidelity defect was found in any chapter. Register is
consistently modernized (contractions, updated idiom, dropped archaic constructions
like "would say" habituals rendered as "used to say") while clause-level meaning,
sequence, and detail are preserved throughout.

## 4. Independent verification of the drafter's five cited passages

All five were confirmed present in this batch, complete, and unsoftened — I located
and read each in full rather than trusting the notes' chapter attribution.

- **Anna's pregnancy disclosure to Vronsky** — Ch.56 (Chapter 22), paragraph 29:
  `"I'm with child," she said, softly and deliberately.` → `"I am with child," she said, softly and deliberately.`
  Vronsky's reaction ("He turned white... his head sank on his breast") and the
  immediately following turning-point conversation (paras 30–41, including "Leave
  your husband and make our life one") are intact and complete.

- **Frou-Frou's fatal fall and Vronsky's culpability** — Ch.59 (Chapter 25),
  paragraphs 15–19. The fall itself, Vronsky's "fearful, unpardonable mistake,"
  the line "The clumsy movement made by Vronsky had broken her back," and the
  closing line attributing the misfortune explicitly to "his own fault" are all
  preserved verbatim in sense: `"...misfortune beyond remedy, and caused by his
  own fault."` → `"...misfortune past mending, and caused by his own fault."`
  Culpability is not softened or hedged anywhere in the modern-en rendering.

- **Alexey Alexandrovitch's cold carriage confrontation of Anna** — Ch.63
  (Chapter 29), paragraphs 21–41. His formal accusation ("your behavior has been
  unbecoming"), Anna's direct confession — `"I love him, I am his mistress; I
  can't bear you; I'm afraid of you, and I hate you.... You can do what you like
  to me."` — and his cold, controlled response demanding "strict observance of
  the external forms of propriety" are all present and unaltered in force.

- **Madame Stahl's substituted-child backstory** — Ch.66 (Chapter 32), paragraph 1.
  The full account (her own child dying, being secretly swapped for the chief
  cook's daughter born the same night, Varenka being that child) is rendered
  completely and matches the source in every plot particular.

- **Kitty/Varenka exchange on shame and humiliation** — Ch.66 (Chapter 32),
  paragraphs 27–41. The full back-and-forth ("isn't it humiliating...", "Worse
  than wrong — shameful," "I hate him; I can't forgive myself," "The shame, the
  humiliation!") is intact, with Kitty's projection of her own Vronsky
  humiliation onto the conversation about Varenka's past preserved exactly as
  in the source.

I also confirmed Part Three's opening (Ch.70/71) — Sergey Ivanovitch's and
Konstantin Levin's contrasting views of country life and the peasantry, and the
hay-making/fishing scene with the riddle about grass and water — is rendered in
full, including the long comparative paragraph (Ch.70 para 0) that runs to nearly
500 words in both source and modern-en with no compression.

## 5. Automated cross-checks (used to target extra scrutiny, not as sole evidence)

- **Length-ratio scan** (modern-en word count vs. source word count per paragraph,
  flagging ratios outside 0.6–1.9): 0 flags across all 551 paragraphs. No paragraph
  is anomalously compressed or expanded.
- **Negation-density scan** (counting `not/never/no/n't/none/nothing/...` per
  paragraph pair, flagging differences ≥2): 17 flags, all manually reviewed. Every
  one was a false positive — either a faithful paraphrase that expresses the same
  negation with different surface words (e.g., "would not see... did not see" →
  "wouldn't see... didn't see," undercounted by the regex because `n't` inside a
  contraction doesn't hit a word boundary), or a legitimate rewording that doesn't
  change meaning. No actual negation/conditional inversion was found.
- **Proper-noun/number presence scan** (crude capitalized-token diff): 5 flags, all
  false positives from sentence-boundary capitalization artifacts in long paragraphs
  (e.g., "But," "This," "Moreover" flagged as "missing names" because the modern
  rendering restructured sentence breaks). No actual character name, place name, or
  number was dropped anywhere in the batch.

## Conclusion

The drafter's self-report of "0 defects found" for Batch C holds up under
independent, full re-verification. No paragraph-count mismatches, no dropped or
invented content, no meaning inversions, and no softening of any of the load-bearing
plot/character beats in this batch (pregnancy disclosure, the race fall, the carriage
confrontation, the Madame Stahl backstory, the Kitty/Varenka exchange, or the Part
Three opening). `ak-batchC-corrected.json` can proceed to publication as-is.
