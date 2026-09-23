# b08 verification: chapters 24–25

## Coverage
- Chapter 24: 54 of 54 changed paragraphs checked.
- Chapter 25: 34 of 34 changed paragraphs checked.
- Total: 88. This matches the count from `view.py changed 24 25`.
- Accessibility items screened: 8 of 8 (A.json indices 0–7).
- Result: 86 paragraphs verified clean, 2 with non-blocking defects.

**Lazarus reading (24.157–24.187).** Only 24.160 changed in this round. Its candidate text restores the source's trailing "...." as "...", which is where Sonia's voice breaks off (24.161). I also compared every verse paragraph 24.157–24.187 with the source. The wording is identical throughout. The only differences are KJV-style commas and capitals, such as "Thy brother", "Behold" and "Could not", which were already in the baseline. No words are added, dropped or modernized.

**Restored hesitations and italics.** I checked each one against the source text and found all of them in Garnett. The italics are:
- 24.47 _insatiable_
- 24.100 _for nothing_
- 24.156 _own_, _secret treasure_, _him_, _now_
- 24.176 _he, he_
- 24.179 _four_
- 24.200 _your own_
- 24.209 _the idea_
- 25.2/25.3 _tout court_
- 25.8 _I believe_
- 25.32 _he_, _psychologically_
- 25.36 _Hof-kriegsrath_, _special case_ ×2, _too natural_
- 25.55 _to take a flat_, _good_

Every restored ellipsis matches a "..." or "...." in the source. Stammers such as "I--I", "or... or", "and... and" and "said... said" are rendered as "I... I!", "or... or", "and... and" and "said... said".

Other points checked:
- Names follow the Garnett forms: Semyonovitch, Hay Market, Razumihin, Porfiry Petrovitch.
- The meaning repairs are faithful. For example, 25.100 "there's no escaping form" reverses the baseline's opposite sense, and 24.105 restores "most revolting".
- The certainty repairs remove hedges or intensifiers that the source does not have. Examples are 24.196 "for certain", 25.18 "clearly/utterly", 25.42 and 25.56 "genuinely", 25.72 "clearly" and 24.204 "may be".

## Defects (both non-blocking)
1. **24.61**
   - Change: "I'd really come chiefly to show" → "I'd come chiefly to show".
   - Reason: the restored "chiefly" (source: "I'd gone in chiefly") now sits next to the baseline's "really", which is redundant.
2. **25.0**
   - Change: "the next morning he was surprised" → "the next morning, he was surprised".
   - Reason: removing ", as requested," also removed the comma that closed the long introductory clause.

Both defects pass `apply.py check --dry` with 2 applied and 0 rejected.

## Accessibility verdict summary
- **Accept (5):** indices 0, 1, 2, 4 and 5.
  - 0 (24.103): "uniqueness" contradicts the "not unique" just before it.
  - 1 (24.149): adds "he thought" to what is Raskolnikov's unspoken thought.
  - 2 (24.202): names Katerina Ivanovna. The source's "She" refers to her, while the "you" taken to hospital is Sonia.
  - 4 (25.36): glosses _Hofkriegsrath_.
  - 5 (25.36): repairs a clause left unfinished. This is **blocking**, and the fix restores the source's sense of "don't think of that when they overstep".
- All five `old` strings still match the candidate: `apply.py check --dry` reports 5 applied, 0 rejected.
- **Reject (3):** indices 3, 6 and 7.
  - 3: it puts a gloss of "tout court" in Porfiry's mouth, and 25.3 depends on the French standing out unglossed.
  - 6: it adds a "—Razumihin—" aside to Porfiry's speech.
  - 7: "that fat fellow" is already clear, because "experienced doctor" comes just before it, and the change would lose Porfiry's voice.
- None of the proposals overlaps a defect.

## Verdict
CLEAN AFTER CORRECTIONS. The two small non-blocking fixes above are needed, and the accepted accessibility items should be applied, including the blocking 25.36 syntax repair (index 5).
