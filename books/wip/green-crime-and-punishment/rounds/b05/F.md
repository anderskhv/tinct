# b05 fidelity and repair review: Ch 15–17 (Part 3, Ch 1–3)

## Coverage

| Chapter | Range read | Paragraphs |
|---|---|---|
| Ch 15 (Part 3, Ch 1) | 15.0–15.88 | 89 |
| Ch 16 (Part 3, Ch 2) | 16.0–16.84 | 85 |
| Ch 17 (Part 3, Ch 3) | 17.0–17.136 | 137 |
| **Total** | | **311** |

Every source/candidate pair was read in order, in slices of 15–25 paragraphs, with the neighbouring paragraphs in view. The batch brief gives Ch 17 as 17.0–17.136; that is 137 paragraphs, not 136. The brief's total of 311 is correct (89 + 85 + 137).

The checker (`apply.py F.json check --dry`) reports **160 applied, 0 rejected**.

## Findings summary

160 proposals, 15 of them blocking.

| Category | Count |
|---|---|
| register (F3) | 96 |
| hesitation (F4) | 31 |
| omission | 16 |
| meaning | 8 |
| certainty | 5 |
| emphasis | 3 |
| invented | 1 |

By chapter: Ch 15 has 73, Ch 16 has 50 and Ch 17 has 37.

**F3 register (Ch 15–16).** Contractions are restored in almost all dialogue and inner speech, including Razumihin's drunken rushes (15.33, 15.37, 15.40, 15.42, 15.48, 15.50, 15.73, 15.86, 15.88), Pulcheria's and Dounia's speech, and Razumihin's morning self-reproach (16.4–16.5). Many of these are whole-paragraph proposals that also carry a fidelity fix. A post-application scan of the quoted speech found only deliberate uncontracted forms left, listed under "Considered and rejected" below.

**Most important fixes:**
- **16.58, omission.** Luzhin's letter drops a whole sentence, his ultimatum: "if, in spite of my request, I meet Rodion Romanovitch, I shall be compelled to withdraw immediately and then you have only yourself to blame." Raskolnikov analyses this sentence in 17.124 ("blame yourselves"). It is now restored in the letter's stiff register.
- **15.33, invented.** "The doctor is obviously more useful." is not in the source and has been removed. The source's repetition "he is not drunk; he is not drunk, he is never drunk" is restored.
- **15.50, hesitation.** Razumihin's near-confession "not because I'm in... hm!" had been flattened to "not because I... hmm! Let us leave it at that." This is restored, along with "a fool, a fool".
- **16.47, meaning.** The source is "I simply rejoiced at her death"; the candidate softened it to "relieved when she died".
- **16.14, meaning.** The source says someone "had insulted him with this suspicion"; the candidate had "planted this suspicion in his head".
- **16.45, omission.** Restores the hearsay "I'm told, positively ugly" (the candidate softened this to "plain") and Razumihin's repetition of "good qualities".
- **17.12, 17.37, 17.39, 17.96, 17.103, F4 hesitation.** Raskolnikov's stammers and trailing pauses were tidied into fluent argument. Key restorations include "it... and... and... weighs on me", "Oh, how I... hate them all!" and the broken musing on overstepping a line.
- **17.108, omission.** Restores "It's despotism, it's tyranny!" and the pause before "I'm not committing murder!", which is what makes him turn pale.
- **17.65, omission.** Restores the mother's dropped "You shouldn't have, Dounia...." and her repeated "I'm happy now".
- **15.17, certainty.** In the source, "perhaps" qualifies "not fit to talk". The candidate had moved it onto "you are tired".
- **17.76, certainty.** "I believe I've met him somewhere—..." had become the firmer "I think I did meet him".
- **Emphasis.** Restored `_the way I did yesterday_` (17.4), `_speak_` (17.67) and `_fiancé_` (17.86).
- **Smaller fixes:**
  - 15.75 restores "by all that's unholy" (the candidate had "for the love of God").
  - 15.85–86: "fascinated" had become "lead her on", which implies deception. It now reads "captivate".
  - 15.73 restores "You -- a doctor --".
  - 16.61 restores "ordered".
  - 16.31 restores "He says he's so busy".
  - 17.5 and 17.7 restore Zossimov's hedges and self-corrections.

## Considered and rejected

These looked like possible defects but are left as they are:
- **Uncontracted forms kept deliberately:**
  - 15.31 "I cannot!" is an emphatic repetition, as in the source.
  - 15.40 "He is not drunk!" is emphatic.
  - 15.42 "I am a man because I err!" is an aphorism.
  - 15.43 "I really do not know" follows the source's own uncontracted form.
  - 15.45 "you are a fountain" is Razumihin's rapture.
  - 16.3 "I would have made a point" is a quoted resolve.
  - 16.22 "I was not granted" is Zossimov's mock-formal "vouchsafed".
  - Luzhin's letter (16.58) is uncontracted by design.
- **Emphasis the candidate added:** 15.57 `_that_` and 16.8 `_them_` are not italic in the source. They are harmless and consistent with the speakers' stress, so I left them.
- **Paraphrases that keep the meaning:**
  - "crest-fallen" became "tail between his legs"
  - "loose fish" became "ladies' man"
  - "fetching" became "charming"
  - "providence" became "guardian angel"
  - "farthing" became "kopeck"
  - the French proverb in 17.37 is translated
- **Small losses judged not worth an edit:**
  - 15.49 "Excuse me"
  - 15.58 "simple-hearted"
  - 16.29 "Ah,"
  - 16.51 "vulgar politeness"
  - 16.68 "levées"
  - 17.20 the ellipsis before "Because"
  - 17.136 the final ellipsis

## Verdict

After these repairs the batch is faithful. The only large content defect was the dropped ultimatum sentence in 16.58, which is fixed. There is one invented line (15.33), now removed. In Ch 17, the hesitation losses (F4) were systematic and have been restored paragraph by paragraph. There are no unresolved passages. All edits stay within their paragraphs; nothing moves across a paragraph boundary.
