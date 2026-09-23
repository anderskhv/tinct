# b06 verification: chapters 18–20

## Coverage

- **Changed paragraphs checked:** 89 of 89, the same count `view.py changed 18 20` reports.
  - Chapter 18: 31
  - Chapter 19: 39
  - Chapter 20: 19
- **Result:** 83 are verified clean. 6 paragraphs carry defects: 7 corrections, all non-blocking.
- **Accessibility:** all 12 items in `A.json` were screened.
- **Validation:** `apply.py check --dry` passes on the defects alone (7 applied, 0 rejected) and on defects plus the accepted and modified proposals (16 applied, 0 rejected).

## Critical passages

- **19.100 (the article):** the restored hesitations are correct: "right... that is, not an official right", "overstep... certain obstacles", "duty-bound... to _eliminate_", "all... well, legislators", "sometimes, perhaps", "it's hard for them to get out". The italics _in general_, _a new word_ and the French are back. Two small problems remain; see Defects.
- **19.103–19.109 (God and Lazarus):** "And... and", "And...", "I... I do." and "You don't say..." are all restored correctly.
- **20.58 (the louse monologue):** the fragmentation is restored: "only an illness... I was in a hurry to overstep...", "I was only capable of killing. And it seems I wasn't even capable of that...". The invented "All I proved" and "beyond doubt" are removed, and _I felt beforehand_ / _after_ is restored. The final line is now faithful: "It's for you to obey, trembling creation, and not _to have desires_". No added coherence remains apart from one small repetition loss; see Defects.

## Defects (all non-blocking)

1. **19.74, the phalanstery gloss.** "one of their socialist communes" is broadly right but imprecise. A phalanstery is Fourier's communal *building* that houses the community (the phalanx), and Razumihin's sentence is about walls, rooms and corridors.
   - Correction: "one of their socialist communal houses".
2. **19.100, hedge dropped.** The source reads "perhaps, if you like, perfectly so", but "if you like" is missing, so his concession is firmer than the source.
3. **19.100, stray dash.** The fidelity edit changed "men—Lycurgus" to "men, such as Lycurgus" but left the closing dash in "and so on—were". It now has no opening partner. Correction: a comma.
4. **19.118, "perhaps" dropped.** The source reads "at last perhaps one man out of a thousand". Without "perhaps", his figure is more certain than the source.
5. **19.159, flat and apartment mixed.** The paragraph now has both "a flat like that open" and "any apartment open".
   - The source has "flat" both times, and the second is "a flat open anywhere".
   - Correction: "a flat open anywhere".
6. **20.11, invented referent.** "sees through Zametov" names someone the source leaves as "him"; the Russian reads "At last he's guessed!". After "As for Zametov—", "him" is already clear. Correction: revert to "him".
7. **20.58, slogan varied.** The candidate has "waiting for 'universal happiness.'", but the source repeats the quoted slogan "the 'happiness of all'" all four times. Correction: restore "the 'happiness of all'".

## Accessibility verdict summary

- **Accepted (8):**
  - 0: 18.96 "Raskolnikov thought"
  - 1: 18.100 "he thought"
  - 2: 18.102 "fool" for "put people on"
  - 3: 18.113 "he thought"
  - 4: 19.76 "said Razumihin"
  - 6: 19.100 gloss "long live eternal war"
  - 7: 19.152 "did away with"
  - 8: 19.156 "Dmitri, the other painter". This is factual: 13.154 names Nikolay and Dmitri as the painters, and Razumihin is Dmitri Prokofitch.
- **Modified (1):** 5, at 19.82. The new text is "that good a pretender?". "Deceiver" adds moral weight that "dissembler" lacks.
- **Rejected (3):**
  - 9 and 10: 20.16 and 20.17, "two days". The source says "two days before" in both 20.16 and 20.17 and "three days before" in 19.160. The inconsistency is Garnett's, and the candidate follows the source in all three places.
  - 11: 20.56, "a Napoleon". The "real _Master_" is a type, and 20.57 names Napoleon immediately. Inserting the name makes his feverish thought more explicit than the source.

## Verdict

**CLEAN AFTER CORRECTIONS.** There are 7 non-blocking corrections; see Defects.
