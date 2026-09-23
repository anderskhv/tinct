# b12 fidelity + repair review (F)

## Coverage
- Ch 36 (Part 6, Ch 5): 36.0–36.127 (128)
- Ch 37 (Part 6, Ch 6): 37.0–37.62 (63)
- Ch 38 (Part 6, Ch 7): 38.0–38.77 (78)
- **Total: 269**, matching the batch spec (128 + 63 + 78 = 269). I read every source/candidate pair in order, in slices of up to 37.

**Alignment:** all three chapters are aligned paragraph for paragraph. In Ch 36 I checked each boundary around the historical 36.92 break, from 36.86 to 36.100. Every candidate paragraph renders only its own source paragraph. No content crosses a boundary in 37 or 38 either.

## Findings summary
There are 51 proposals, 8 of them blocking.

| Category | Count |
|---|---|
| omission | 13 |
| meaning | 13 |
| certainty | 6 |
| hesitation | 5 |
| invented | 5 |
| emphasis | 4 |
| period | 3 |
| syntax | 1 |
| other (typography) | 1 |

Most important (blocking):
- **38.66:** "vile noxious insect" was rendered "vile, harmful creature, a filthy old pawnbroker woman". The insect image is lost and "filthy" is invented.
- **38.65:** Dounia's "facing the suffering" became "face your punishment", which loses the book's key idea of suffering.
- **38.70:** the sarcastic "Ah, it's not picturesque, not æsthetically attractive!" became an admission ("…pleasing, I admit!"). His double "never, never" is also lost twice (non-blocking companions).
- **38.68:** the known stammer loss "But I... I couldn't" is restored. Non-blocking companions remove the invented "since the beginning of the world" and restore "that stupidity".
- **38.9:** the mother's heartbreak had been moved onto the rejected manuscripts. The source's chronology is restored: six or seven days ago, over Rodya's food and clothes.
- **37.8:** Sonia's broken-off "please don't consider..." had been completed with words borrowed from 37.10.
- **37.43:** "He suddenly fancied" had become "thought". The proposal restores "fancied" to keep the dream's ambiguity. Also, "a full glass of wine" becomes "a full glass to drink", because the source does not name wine. Everything else in the dream, including "harlot", "depravity" and "Accursed child", is kept at full strength.
- **36.38:** Dounia's pause "not a man... of honour" is restored.

Non-blocking highlights:
- Italic emphasis restored at 36.5 _positive_, 36.59 _une théorie comme une autre_, 37.32 _too_ and 38.76 _None of this would have happened._
- Svidrigaïlov's "material and superior persons" and "the charm of his social position" are restored (36.59).
- The repetitions "a bad sign" ×3 (37.33) and "Nothing, nothing" (37.25) are restored, and so are the narrator's ironic "interesting pursuit" (37.45) and "he said" (37.59).
- 38.76 "I'm cruel" is corrected back to "I'm wicked".

## Known stammer losses (from brief)
- **36.67:** the stammer ("you were lying… lying") is intact. I proposed only removing the added "it now" after "I see", which made her sound more certain.
- **36.80:** the stammer "I… I will save him" is intact in the candidate. No change is needed; I fixed only a mismatched inner quote mark.
- **36.110:** "I… I'll kill you" is intact. No change.
- **36.118:** "And… and you can't?" is intact. No change.
- **38.68:** the stammer was lost and is restored (blocking).

## Considered and rejected
- **36.1:** "I thought I said..." became "—". The trailing off survives as a dash, which is the chapter's typography.
- **36.102:** "the heat of propaganda" became "your reforming zeal". This is an acceptable clarification of what she was propagandizing.
- **37.39:** "Ah, the signal!" became "The flood signal!". The added word is a useful clarification for a listener.
- **37.47:** the period ethnic stereotype about Achilles's face is preserved in the candidate, as F7 requires. It is not softened.
- **37.0:** "Katia too turned up" became "turned up again". This is harmless.
- **37.52–54:** the dropped "To" in "To foreign parts?" and "To America." does not change the meaning.
- **38.2:** the dropped "anyway" was too marginal to propose.
- **38.29:** "for him" after "terrible minute" was too marginal to propose.
- **38.67:** Dounia's "Why, you have shed blood?" became an exclamation. The shocked tone survives.
- **38.73:** "onetime fiancee" (spelled without the accent) is acceptable.
- **38.66:** "I have no intention of atoning" for "I am not thinking of expiating it" was judged close enough. The defiance is intact, and his uncertainty survives in "perhaps also for my own advantage".
- **Typography:** Ch 36 keeps curly double quotes, straight apostrophes and "…". Ch 37 uses straight quotes with "...". Ch 38 uses "--" and "...". Every proposal follows the typography of its own paragraph.

## Checker note
`apply.py F.json check --dry`: **applied 51, rejected 0**. On its first run the checker aborted on the pre-existing verse newline in 13.20, which the baseline also has. `apply.py` has since been updated to allow newlines that are already in the baseline, and the rerun passes.

## Verdict
After these repairs the batch is faithful. Svidrigaïlov's nightmares keep their ambiguity and horror, and Raskolnikov's farewell keeps its defiant, self-contradicting uncertainty. Every passage was resolved.
