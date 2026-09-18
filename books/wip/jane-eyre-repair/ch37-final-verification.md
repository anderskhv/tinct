# Jane Eyre — Chapter 37 (Ferndean) — FINAL Independent Verification

**Date:** 2026-09-17
**Scope:** Round 2 candidate `ch37-corrected-round2.json` (262 paragraphs) vs. source `ch37-source.json` (262 paragraphs)
**Method:** Independently re-derived diffs; full close read of the entire chapter (all 262 paragraphs read against source, not just the requested sample ranges). Word-ratio scanning deliberately NOT used as the primary instrument, per round 1's methodological finding.

---

## 1. Confirmed round-2 diff set

Independently re-derived by exact string comparison:

```
ch37-corrected.json (r1)  vs  ch37-corrected-round2.json (r2):
  changed = [6, 9, 30, 50, 111, 117, 194, 201, 250]   (9 paragraphs)
```

**CONFIRMED** — exactly the 9 the orchestrator reported, nothing else. All 253 other paragraphs are byte-identical between r1 and r2, so the 28 round-1 fixes are untouched.

Cross-check against the original damaged file:

```
ch37-current-modern-en.json vs r1: 28 changed
  [0,1,3,7,8,10,15,48,57,63,66,71,72,76,85,86,91,92,93,104,110,113,114,115,116,118,248,256]
ch37-current-modern-en.json vs r2: 37 changed
  = the 28 above ∪ [6,9,30,50,111,117,194,201,250]
```

**CONFIRMED** — the two rounds are disjoint (28 + 9 = 37, no overlap, no drift). All paragraph counts are 262 in source, r1, r2 and the original; no insertion or deletion of paragraphs occurred in either round.

---

## 2. Per-paragraph verification of the 9 round-2 fixes

| # | Claim | Verdict | Source evidence / notes |
|---|---|---|---|
| 6 | Recognition beat restored | **CONFIRMED** | Source: "Dusk as it was, I had recognised him—it was my master, Edward Fairfax Rochester, and no other." R2 now matches exactly in sense and naming. The invented block ("I nearly revealed myself—but I held back… prepare myself for the shock—and to prepare him.") is gone. |
| 9 | Dialogue/interiority restored | **CONFIRMED** | Source: "A soft hope blent with my sorrow that soon I should dare to drop a kiss on that brow of rock, and on those lips so sternly sealed beneath it: but not yet. I would not accost him yet." R2 renders this faithfully; the invented "I could feel his heart was still warm… find the right approach" is gone. |
| 30 | "Answer me—speak again!" restored | **CONFIRMED** | Source has both the "unavailing and distressing attempt!" aside and the imperious "Answer me—speak again!" R2 has both ("a useless, distressing effort!" / "he ordered, loud and commanding"). The invented "An expression of pain and bewilderment crossed his face" is gone. |
| 50 | Interiority about the reality of the moment | **CONFIRMED** | Source: "He suddenly seemed to arouse himself: the conviction of the reality of all this seized him." R2 matches. The invented "A look of grateful joy broke over his worn face" is gone. This paragraph is the hinge into 51 ("It is you—is it, Jane?"), and now reads correctly as the moment belief takes hold. |
| 111 | Walk-promise setup restored | **CONFIRMED** | Source: "there is a tender shining after it: you shall have a walk soon." R2: "there's a soft glow after it. You'll have a walk soon." The invented "Can you see the light?" — grotesque addressed to a blind man — is gone, and the promise now correctly sets up 115 ("Most of the morning was spent outdoors"). |
| 117 | Rochester's wounded reaction restored | **CONFIRMED** | Source: "the little I did say lacerated his faithful heart deeper than I wished." R2 restores this clause. The invented "The hunger, the cold, the exhaustion—I touched on them lightly, emphasizing instead my rescue" is gone. **Span 115-119 checked continuously and reads coherently:** 115 (fields, his knee) → 116 (his demand for her story) → 117 (she tells it, softened; it wounds him) → 118 (his reproach, "He was certain I had suffered more than I'd admitted") → 119 (her reply and St. John's name being seized on). 118's closing sentence now follows directly from 117's restored wound; previously it did not. |
| 194 | "Jane, leave me: go and marry Rivers" restored | **CONFIRMED** | Source ends: "But it is useless grieving. Jane, leave me: go and marry Rivers." R2 matches. The invented substitution ("But it's only natural enough. You said he was young, handsome, talented. And I—what am I now?") is gone. **195 is untouched** (not in either changed set) and now works: "Shake me off, then, sir—push me away. I won't leave on my own." is a direct answer to a command to leave, which the invented text had not issued. 196-200 then escalate correctly to "the husband you've chosen… this St. John Rivers." |
| 201 | Jane's closing question restored | **CONFIRMED** | Source: "He has no indulgence for me—no fondness. He sees nothing attractive in me; not even youth—only a few useful mental points.—Then I must leave you, sir, to go to him?" R2 restores both the indulgence/fondness/mental-points clause and the closing question. The invented replacement ("He has no hold on my sympathy or warmth… No warmth rises in me at his approach.") is gone. Critically, 202 ("I shuddered involuntarily, and pressed closer") and 203 ("Is this true?") only make sense as responses to that closing question; the chain now holds. |
| 250 | Both fixes: her own-limits plea, and the involuntary cry | **CONFIRMED (both)** | Source: "That I merited all I endured, I acknowledged—that I could scarcely endure more, I pleaded". The damaged text had "I could hardly expect mercy. But I begged for it" — a theologically and psychologically different proposition (about God's mercy, not about the limit of his own endurance). R2: "I admitted I deserved everything I'd endured—but I pleaded that I could scarcely bear any more." Correct. Second fix: source "the alpha and omega of my heart's wishes broke **involuntarily** from my lips in the words—'Jane! Jane! Jane!'"; damaged text had the flat, volitional "Then I cried out". R2: "And the sum of my heart's whole desire broke involuntarily from my lips in the words: 'Jane! Jane! Jane!'" Correct. |

### Supernatural call-and-response logic (250-257) — checked continuously

The chain now holds exactly as Brontë built it:

- 249 fixes the night and hour (last Monday, between eleven and midnight).
- 250 — the cry breaks from him **involuntarily**, i.e. it is not a deliberate utterance. This is the load-bearing word: it is what makes the exchange a summons rather than a shout.
- 251-252 — Jane's "Did you speak those words aloud?" and his "I did… with such desperate force" only have a point to ask if the cry was involuntary; against the damaged "Then I cried out" the question was near-redundant.
- 253 confirms the timing; 254 flags the strangeness; 255 gives the answering voice ("I am coming: wait for me" / "Where are you?").
- 256 (a round-1 fix) gives the mountain echo and the "in spirit… we must have met" reading.
- 257 — Jane's silent confirmation that she received the same summons at the same hour, and her decision not to tell him.

Verdict: the supernatural call-and-response is now coherent and carries its full weight.

---

## 3. Close-read findings (whole chapter, all 262 paragraphs)

Requested ranges 0-50, 100-130, 180-220, 240-262 were read in full against the source; I extended the read to 51-99 and 131-179 so that the entire chapter has now been checked line by line. Findings below are **all new** (none previously flagged in round 1 or round 2), and none of them fall inside the 37 changed paragraphs.

### Substantive (recommend fixing)

- **Paragraph 19 — invented sentence.**
  Source: "'You are to send in your name and your business,' she replied. She then proceeded to fill a glass with water, and place it on a tray, together with candles."
  R2 adds a full sentence with no source basis: **"I noticed her hand was shaking."**
  This is exactly the defect class this repair exists to remove: fabricated stage business, invisible to ratio scanning because it lengthens rather than shortens. It also mis-assigns the trembling — in the source it is *Jane's* hands that shake, four paragraphs later ("The tray shook as I held it", 23). Inventing a tremor for Mary blunts that beat.

- **Paragraph 24 — factual distortion of Rochester's posture.**
  Source: "leaning over it, with his head supported against the high, old-fashioned mantelpiece, appeared the blind tenant of the room."
  R2: "Leaning over it, with his head propped on his hand, **sat** the blind tenant of the room."
  The source image is Rochester *standing* at the fire, forehead against the mantelpiece — the caged-animal stance that pairs with the "sightless Samson" image of paragraph 8. R2 seats him and substitutes an invented gesture ("head propped on his hand"). The "high, old-fashioned mantelpiece" is dropped entirely. Same paragraph, minor: source "he returned and sighed" becomes "he returned to his brooding" (loses the sigh, adds a summary); and Pilot's "removed out of the way" is dropped.

### Minor (acceptable modernization, logged for completeness — no fix strictly required)

- **Para 11** — R2 adds an attribution ("said a voice. It was John.") not in the source; harmless, since 10 already introduces John, but it is added text.
- **Para 13** — "I heard him close the door" adds a sensory frame ("I heard") to source's plain "closed the door"; Jane is watching, not listening, at this point.
- **Para 48** — "hopeless" dropped from the triad "dark, lonely, hopeless".
- **Para 53** — "under some stream" dropped.
- **Para 62** — weakened close. Source: "Cease to look so melancholy, my dear master; you shall not be left desolate, so long as I live." R2: "Stop looking so gloomy, sir. I will not let you be sad." Loses both the address ("my dear master") and the lifelong vow, which is the paragraph's whole point. This is the most notable of the "minor" items and borderline substantive.
- **Para 100** — "quite more refined and exalted" rendered as "much more refined, and with much better manners"; "exalted" (moral elevation) becomes a matter of etiquette.
- **Para 112** — "I had wakened the glow: his features beamed" becomes "His features lit up at once", dropping Jane's agency in causing it.
- **Para 173** — "Did he teach you nothing?" inverted to "Did he teach you anything?", flattening Rochester's needling cross-examination tone.
- **Para 247** — "He pursued his own thoughts without **heeding** me" rendered as "without **hearing** me". Meaning shift: he hears her and disregards her; he is not deaf.

### Confirmed clean

Ranges 25-47, 51-99 (incl. the reunion core at 85-93), 101-110, 113-172, 174-246, 248-262 read as faithful, full-weight modern English with no invented content and no distortion beyond routine modernization. Dialogue-heavy stretches (120-200, 211-245) are particularly tight to the source.

---

## 4. Full 37-paragraph changed set — integrity check

All 37 changed paragraphs were compared against source individually:

- The 28 round-1 fixes are **byte-identical between r1 and r2** — no drift, no re-edit, no regression.
- The 9 round-2 fixes are all correct (table above).
- No paragraph outside the 37 was touched in either round (verified by exact comparison of all 262 paragraphs across `current → r1 → r2`).
- Paragraph count and ordering preserved (262 throughout); no merges, splits or reorderings.

---

## 5. Whole-chapter coherence assessment

Read continuously: the approach to Ferndean (0-13), the recognition (5-10), the entrance and first contact (14-50), the reunion core (51-93), the morning and the year's story (109-119), the St. John cross-examination and the false-jealousy crisis (120-203), the proposal and reconciliation (204-245), the supernatural call-and-response (246-258), and the closing prayer and walk home (259-261).

The chapter now reads as a coherent and faithful rendering of Brontë's reunion scene. The three structural failures that round 1 and round 2 removed are all genuinely gone:

1. **Jane's deliberateness.** The invented material in 6 and 9 had made Jane strategic — managing Rochester, "preparing him", looking for "the right approach". Brontë's Jane simply recognizes him and holds back from tenderness, not from tactics. Restored.
2. **Rochester's crisis of belief.** The damaged 30 and 50 had softened his desperation into pathos ("an expression of pain and bewilderment", "a look of grateful joy"). The restored text keeps the violence of his doubt and the shock of conviction, which is what makes 46-51 land.
3. **The Rivers misunderstanding.** With 194 and 201 restored, the false-jealousy sequence now has a real command ("go and marry Rivers") and a real question ("Then must I leave you, sir, to go to him?") — the two hinges on which 195 and 202-204 turn. Previously both hinges were missing and the surrounding untouched paragraphs answered questions that had never been asked.

The emotional arc is intact end to end. The two residual defects in paragraphs 19 and 24 are local and do not damage the arc, but they are the same species of fabrication the repair set out to eliminate.

---

## 6. Final verdict

**NOT YET ACCEPTED — a short third round is needed.**

Round 2's nine fixes are all correct, and the chapter is very close. But a full close read found two residual defects that neither prior round caught, both outside the 37-paragraph changed set:

**Round 3 must fix, at minimum:**

1. **Paragraph 19** — delete the invented sentence "I noticed her hand was shaking." (no source basis; also pre-empts Jane's own trembling in 23).
2. **Paragraph 24** — restore Rochester's posture: he is *standing*, leaning over the fire with his head against the high, old-fashioned mantelpiece, not sitting with his head on his hand. Restore "he returned and sighed" in place of "he returned to his brooding".

**Strongly recommended in the same round (cheap, all one-line):**

3. **Paragraph 62** — restore "my dear master" and the vow: "you shall not be left desolate, so long as I live."
4. **Paragraph 247** — "heeding", not "hearing".
5. **Paragraph 173** — restore the negative: "Did he teach you nothing?"
6. **Paragraph 112** — restore Jane's agency: "I had wakened the glow."

Items 1-2 are required; 3-6 are quality. Nothing else in the chapter needs touching. After a round 3 limited to these paragraphs — and a diff confirming *only* those paragraphs changed — Chapter 37 can be marked accepted.

**Methodological note for round 3 and for the remaining chapters:** both residual defects here were length-neutral or length-increasing, and both sat in paragraphs that no ratio scan would ever flag. The only instrument that finds this class of damage is a paragraph-by-paragraph read against source. Ratio scanning should be treated as a triage aid, never as a completion criterion.
