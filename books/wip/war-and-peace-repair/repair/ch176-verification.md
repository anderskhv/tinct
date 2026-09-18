Model: opus

# Chapter 176 — Book Nine (1812), Chapter 9 — independent verification

Files verified: `ch176-candidate.json` (pre-correction), `ch176-corrected.json`, `ch176-corrections-log.md`, `ch176-source.json`. `ch176-fidelity.md` was read for context only; every verdict below was re-derived from the source, not from the log. I did not draft, review or correct this chapter.

## 1. Diff vs log

Python paragraph-by-paragraph diff of candidate against corrected (0-based indices, matching the log's numbering):

| ¶ | Changed in file? | Logged? |
|---|---|---|
| 1 | yes | yes |
| 2 | yes | yes |
| 6 | yes | yes |
| 8 | yes | yes |
| 10 | yes | yes |
| 11 | yes | yes |
| 12 | yes | yes |
| 13 | yes | yes |
| 14 | yes | yes |
| 15 | yes | yes |
| 16 | yes | yes |
| 17 | yes | yes |
| 18 | yes | yes |

Thirteen paragraphs changed; thirteen logged. Set equality exact. Beyond index matching I compared every log **Before** block against the candidate paragraph and every **After** block against the corrected paragraph: **all 26 blocks match their file text verbatim.** The log claims no edit it did not make and makes no edit it did not log. **No mismatch.**

Non-paragraph structure (`number` 176, `title` "Book Nine (1812) — Chapter 9", key set) is identical across source, candidate and corrected.

## 2. Per-change verdicts (re-derived from source)

**¶13 — MAJOR ×1, MODERATE ×1. Correct.**
Source: "A third, in the absence of opponents, between two councils would simply solicit a special gratuity…"; "A fourth while seemingly overwhelmed with work would often come accidentally under the Emperor's eye"; "…would produce arguments more or less forcible and correct."
Corrected: "A third, in the absence of opponents, between two councils, would simply ask for a special bonus…"; "A fourth, while seemingly overwhelmed with work, would often come accidentally under the Emperor's eye"; "…produce arguments more or less convincing and correct to that end."
Both flagged losses are restored. The MAJOR is fully answered: the defining detail (the pretence of being swamped with work) is back, and the candidate's asserted contrivance ("would keep arranging to appear") is gone — the source's ironic "accidentally" now carries the irony alone, as it should. "before the Emperor's eyes" → "under the Emperor's eye" matches the source idiom. The doublet "and correct" is restored. "convincing" for "forcible" is register, not meaning. No new drift; the five-item list of ruses is again five items each with its own content.

**¶15 — MAJOR. Correct.**
Source: "…who, without sharing any of those conflicting opinions, were able to take a detached view… escape from this muddle, indecision, intricacy, and weakness."
Corrected: "…who, without sharing any of those conflicting opinions, were able to take a detached view… ways out of this muddle, indecision, intricacy, and weakness."
The clause that defines the ninth party is restored verbatim in sense, and "intricacy" is restored as the fourth distinct term (the candidate's "confusion" duplicated "muddle" and collapsed a four-term series to three). Word-count ratio against source rises from 84% to 100%. No new drift.

**¶2 — MODERATE + 2 MINOR. Correct.**
Source: "…did not know in what capacity he was questioned by Bennigsen, the Grand Duke, Arakchéev, or Prince Volkónski, or was given this or that advice and did not know whether a certain order received in the form of advice emanated from the man who gave it or from the Emperor, and whether it had to be executed or not."
Corrected: "…did not know in what capacity he was questioned by Bennigsen, the Grand Duke, Arakcheev, or Prince Volkonsky, or was given this or that piece of advice, and did not know whether a certain order received in the form of advice came from the man who gave it or from the Emperor, and whether it had to be carried out or not."
Both uncertainties are separated again, and the "emanated from the man who gave it or from the Emperor" test is back on *orders*, where the source puts it, not on questions. "émigré" diacritic and "good general" (neutral, not the candidate's evaluative "competent") restored. No new drift.

**¶12 — MODERATE + MINOR. Correct.** "especially around young sovereigns" restores the general claim the candidate had restricted; "and insisted" restores the source's doublet "only desired and insisted". Verified against source wording.

**¶1, ¶6, ¶8, ¶10, ¶11, ¶14, ¶16, ¶17, ¶18 — MINOR. All correct, all source-anchored.** Checked individually against the source: "Bolkonski" restored as the source's word (¶1); added intensifier "great" removed (¶1); added hedge "supposedly" removed and "remembering Suvorov… not to reason" restored (¶6); the source's deliberate break in the series, "Of a fourth opinion", and "the quality and the defect of frankness in their opinions" restored (¶8); the gloss ", in the war against Napoleon" inserted *inside quoted speech* removed and "showed his incapacity" restored (¶10); "at any rate" restored and a second gloss inside quoted speech removed (¶11); "rubles, decorations, and promotions" restored (the candidate had added "and money", a fourth item the source does not have) and "egotism" restored (¶14); "fluctuation of relations" restored in place of the candidate's metaphor "web of relationships", and "the action of fifty thousand men" restored (¶16); "on the plea that" restored (¶17); and ¶18's em-dash appositive structure restored so that "the very incitement which was the chief cause of Russia's triumph" again modifies the arousing itself rather than standing as a separate sentence.

No correction introduced a claim, attribution, number, or evaluation absent from the source.

## 3. Readability of the changed paragraphs

Re-read cold, all thirteen are clear. ¶13's restored "A fourth, while seemingly overwhelmed with work, would often come accidentally under the Emperor's eye" is the only sentence where the source's irony has to be inferred, and that inference is exactly what the source asks of its own reader — restoring it is right. ¶2 is a long sentence, but it was long in the source and the two uncertainties are now separated by "or was given… and did not know whether", which makes the structure easier to follow than the candidate's merged version. ¶15's restored clause makes the ninth party's definition land where it previously did not exist.

## 4. Structure and punctuation

- Paragraph count: source 19, candidate 19, corrected 19. Order unchanged; the six unchanged paragraphs are byte-identical to the candidate.
- No empty or whitespace-only paragraphs.
- Question-mark and exclamation-mark parity with source: **exact in all 19 paragraphs.** No restructuring exceptions needed.
- Valid JSON; keys `number`, `title`, `paragraphs`.
- Word-count ratio against source 98% (candidate 97%); no paragraph below the 75% floor.

## 5. Terminology ruling — "party" → "faction"

Ruled against the source, as asked. The source uses "party" 21 times and "group" once; the corrected file uses "faction" 15 times, "group" 4 times, "party" once.

**Verdict: MINOR. Not MODERATE. The corrector was right to leave it.**

Reasons: (a) In this chapter "party" means a faction at headquarters, not a political party — in present-day English "faction" is the accurate word for that sense, and "party" is the one that misleads. This is a translation choice in the right direction, not drift. (b) Nothing is added, dropped or sharpened: each grouping keeps its members, its position and its enumeration ("The second faction…", "The fifth faction…", "The sixth faction…"), so the chapter's nine-part spine survives intact. (c) The connotation of "faction" — divisive, self-interested — runs with Tolstoy's satire here, not against it. (d) Where the source deliberately breaks the series ("Of a fourth **opinion** the most conspicuous representative was…"), the corrector restored "opinion" rather than normalising it, which shows the series was handled with attention rather than swept.

Two residual MINOR notes, non-blocking: the eighth grouping is "group" in the corrected text at both ¶13 and ¶14 where the source says "group" then "party" — that is a normalisation of the *source's* own inconsistency and reads better, so I would keep it; and ¶15 leaves "the party of older, reasonable men" as "party" while the other eight are "factions", which makes the ninth look briefly like a different category. A one-word change to "faction" at ¶15 would close the series. Neither affects meaning.

## 6. New findings

- **MINOR, non-blocking (introduced this round).** ¶18 uses unspaced em dashes ("country—the", "Moscow—was") where the rest of the chapter uses spaced " — " (26 instances against these 2). The restored structure is correct; only the dash spacing is off-house. Cosmetic, fix on any later pass.
- **MINOR, non-blocking (pre-existing, not touched).** ¶15 renders the source's "the party of the elders" as "older, reasonable men"; "the elders" carries a shade of standing that "older" does not. Not drift, and not in scope for this round.
- No new drift was introduced by any of the thirteen corrections. No MAJOR or MODERATE finding from `ch176-fidelity.md` remains outstanding: both MAJOR (¶13, ¶15) and all three MODERATE (¶2, ¶12, ¶13) are addressed and verified against the source.

Verification: ACCEPT
sha256: c323cb96482ca9bdccb8eccfa9a2c99686ebfca1c212d46d938a94aab13c2f3a
