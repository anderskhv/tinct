Model: opus

# Chapter 298 (Book Fourteen — Chapter 19) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch298-candidate.json` vs `ch298-corrected.json`; every change re-derived from
`ch298-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11** — 11 paragraphs
(¶7 unchanged).
Log entries: **0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11** — 11 entries.

**Exact match. No unlogged change, no logged change missing.** Every `**Before:**` string is
byte-identical to the candidate paragraph and every `**After:**` string byte-identical to the
corrected paragraph (checked mechanically on all 11).

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 0 | "march a thousand miles" → "go a thousand miles"; "you must believe" → "you must imagine" | "To be able to go a thousand miles he must imagine that something good awaits him" | OK — "believe" had upgraded an act of imagination into a conviction, which is the opposite of the paragraph's point |
| 1 | "tell yourself" → "say to himself"; "rest for the night" → "rest and spend the night"; "that first day's march" → "that first day's journey" | "to say to himself: 'Today I shall get to a place twenty-five miles off where I shall rest and spend the night,' and during the first day's journey" | Partly OK — all three restorations are right, but the person conversion is incomplete; see finding below |
| 2 | "their officers" → "their superior officers"; "present suffering" → "present privations" | "their superior officers, and Napoleon himself, knew that provisions were scarce"; "endure their present privations" | OK — rank restored (it is the officers above them, not officers generally); "privations" keeps the supply theme that "suffering" generalised away |
| 3 | "bound the entire French mass into one body" → "bound the whole crowd of French into one mass"; "another force holding them together" → "another cause binding them together" | "bound the whole crowd of French into one mass and supplied them with a certain energy, there was another cause binding them together" | OK — the candidate had swapped the source's crowd/mass terms and turned a cause into a force |
| 4 | **"the gravitational pull of Smolensk" → "the force of this common attraction to Smolensk, their goal"; "seized every opportunity" → "availed themselves of every convenient opportunity"; "such opportunities didn't always arise" → "such pretexts did not always occur"; "the speed of their movement" → "their crowded and swift movement" + "deprived them of that possibility and"; "halt them" → "stop this movement, to which the French were directing all their energies"; "No mechanical force could hasten the process of decomposition beyond a certain point." → "Beyond a certain limit, no mechanical disruption of the body could hasten the process of decomposition."** | source as quoted in full in the fidelity review | OK — **MAJOR answered**. "deprived them of that possibility" ties the sentence back to the surrender argument that is the paragraph's whole point; "crowded" is back; "to which the French were directing all their energies" is back. **The accompanying MODERATE is also answered**: the limit now bounds what force can do past a threshold (as in the source) rather than bounding how far decomposition can be hastened, and "of the body" restores the corpse image that "decomposition" completes |
| 5 | "In fact," → "On the contrary," | "On the contrary the greater the heat the more solidified the remaining snow becomes." | OK — the source marks a reversal, not an intensification |
| 6 | "became well established" → "became well defined"; "the night of the eleventh" → "the night of the eleventh of October"; "crush the French" → "overthrow the French" | "became well defined"; "on the night of the eleventh of October"; "to cut off, to seize, to capture, and to overthrow the French" | OK — the date is complete again, and "overthrow" is restored so the callback at ¶11 can land |
| 8 | "what we can say now" → "what we say now"; "inhumanely" kept; "already melted away on the march" → "melted away on the road"; "without a single battle" → "without any battle"; "drawing on his years of wisdom" kept | "He could not tell them what we say now"; "a third of their army has melted away on the road from Moscow to Vyázma without any battle" | OK — the added modality is gone, the **road** (the thing Kutuzov is arguing about not blocking) is restored in place of "the march", and the sharpened "a single battle" is back to "any battle" |
| 9 | **"…a blank sheet of paper in an envelope—their way of telling him nothing" → "…a blank sheet of paper in an envelope"** | "by way of reporting their intention to Kutúzov they sent him a blank sheet of paper in an envelope" | OK — **MODERATE answered**. The gesture is narrated and left open, as in the source; the candidate had chosen one of at least three readings and stated it as fact |
| 10 | "the Russians attacked" → "our men attacked"; "advanced with music playing" → "advanced to the attack with music playing" | "our men attacked, trying to bar the road"; "advanced to the attack with music and with drums beating" | OK — the narrator's first person plural is consistent again with "we are told" in the same sentence; "to the attack" restored |
| 11 | "cut off or capture anyone" → "cut off or overthrow anyone"; "continued to melt steadily away as it pursued its fatal path" → "continued, while steadily melting away, to pursue its fatal path" | "they did not cut off or overthrow anybody and the French army … continued, while steadily melting away, to pursue its fatal path to Smolénsk" | OK — the verb callback to ¶6 lands, and the chapter's last image ends on the fatal path rather than on the melting, as the source does |

No correction introduced new drift of meaning. No content present in both source and candidate
was dropped by the correction, and no wording absent from both was introduced (both checked
mechanically at stem level). ¶4, the most compressed paragraph in the candidate, is restored
to full length.

## 3. Readability of changed paragraphs

Re-read as a new reader. Ten of the eleven are clear.

- ¶4 is now long, but it is the source's own architecture — surrender wish, then the two
  counter-forces, then the mechanical limit — and each clause has its own job. The restored
  "deprived them of that possibility" is what makes the paragraph an argument rather than a
  list, so the added length buys clarity, not costs it.
- ¶8 keeps the "golden bridge" gloss, which the fidelity review ruled allowed; it remains
  the longest interpolation in the four chapters but adds no claim of its own.
- ¶9 ends on the blank sheet with no explanation. As a new reader this is the intended
  effect: "by way of reporting their intention … a blank sheet of paper" is legible as
  insolence without being told so.
- ¶1 is the exception — see below. Still clear, but it now mixes grammatical person.

## 4. Structure and punctuation

- Paragraph count 12 = 12 = 12 (source / candidate / corrected). Order unchanged.
- `number` 298 and `title` "Book Fourteen (1812) — Chapter 19" identical to source.
- No empty paragraphs.
- Per-paragraph `?` and `!` parity with source: clean on 11 of 12.
  **¶8 carries 3 question marks against the source's 2** — the source's compound
  "Why fight, why block the road, losing our own men…?" is rendered as two questions
  ("Why fight? Why block the road…?"). This is a genuine sentence restructuring, it predates
  this round (the candidate did the same), it adds no content and removes none, and rule 4
  allows parity to move for a genuine restructure. Not a finding.
- No paragraph falls below 0.75 of its source word count; ¶4, which the fidelity review put
  at 0.75, is back above it.
- Quote characters normalised to straight throughout (the candidate mixed curly and straight).
- JSON valid.

## 5. New findings

None blocking.

- **New MINOR (introduced by this round), ¶1 — person conversion left half-done.** The log
  records the fix as "third person slid into second ('someone … tell yourself') — restored to
  'say to himself'", and that clause is indeed restored. But the same sentence still ends
  "…the resting place eclipses the ultimate destination and draws all **your** hopes and
  desires", where the source has "attracts all **his** hopes and desires". The candidate was
  at least internally consistent in the second person; the corrected paragraph now reads
  "for someone traveling a thousand miles … say to himself … draws all your hopes and
  desires". One word ("your" → "his") completes the fix the log claims. The underlying
  fidelity finding was MINOR and the paragraph is still clear, so this does not block, but it
  should be swept before Gate A rather than carried forward.
- **Non-blocking (MINOR, pre-existing):** ¶0–¶1 use "you" where the source uses "a man … he";
  the fidelity review's whole-chapter note asks for this to be settled once across the
  essayistic chapters rather than per paragraph. Unchanged by this round apart from the
  partial ¶1 conversion above.
- **Non-blocking (MINOR, pre-existing):** ¶1/¶2 render "their native land" as "their
  homeland" throughout; consistent, and no claim is added.
- Every paragraph carrying a fidelity finding was edited; no finding sits on an untouched
  paragraph.
- The one MAJOR (¶4 restored clauses) and both MODERATE findings (¶4 mechanical limit, ¶9
  blank sheet) are fully answered. **No MAJOR or MODERATE finding remains.**

Verification: ACCEPT
sha256: d9def77eeed815db18152e02d2d3cc7ec5dd3f066a6d16540496fffa25634eac
