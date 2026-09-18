Model: opus

# Chapter 294 (Book Thirteen — Chapter 15) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch294-candidate.json` vs `ch294-corrected.json`; every change re-derived from
`ch294-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **1, 2, 3, 4, 5, 6, 7** — 7 paragraphs.
Log entries: **1, 2, 3, 4, 5, 6, 7** — 7 entries.

**Exact match. No unlogged change, no logged change missing.** Every `**Before:**` string is
byte-identical to the candidate paragraph and every `**After:**` string byte-identical to the
corrected paragraph (checked mechanically on all 7).

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 1 | "the village of Forminsk" → "Forminsk"; "emboldened by the easy victory" → "excited by the memory of the easy victory" | "troops of Broussier's division had been seen at Formínsk"; "Generals on the staff, excited by the memory of the easy victory at Tarútino" | OK — unsupported "village of" removed; the memory (not the fact) of Tarutino is what moves the staff, and "emboldened" had supplied a motive the source does not |
| 2 | **"in command at the most critical position in every engagement" → "commanding wherever the position was most difficult all through the Russo-French wars"** | "but whom we find commanding wherever the position was most difficult all through the Russo-French wars from Austerlitz to the year 1813" | OK — **MODERATE answered**. The universal claim about every engagement is gone; the source's claim (the hardest place, wherever it happened to be) is restored |
| 2 | "when everyone was fleeing" → "when everyone was fleeing and perishing" | "when all were flying and perishing" | OK — **MODERATE answered**; the dying is what makes staying at the dam an act |
| 2 | "whom no one has ever described drawing up battle plans" → "whom no one had described to us as drawing up plans of battles, dashing about in front of regiments, showering crosses on batteries, and so on"; "lacking insight" → "undiscerning"; scare quotes removed from "irresolute and undiscerning"; "the left flank" → "our left flank"; "Many heroes of that time" → "Many heroes" | source wording as quoted, incl. "this same irresolute and undiscerning Dokhtúrov" with no quotation marks and "nine tenths of the men of our left flank" | OK — the narrator's "to us"/"our" standpoint is consistent again, and the scare quotes that turned Tolstoy's flat irony into a citation are gone |
| 2 | "General Bagration" → "Bagration" | "when Bagratión was killed" | OK — added rank removed |
| 3 | "that campaign" → "that period of the campaign"; "clearest proof" → "clearest testimony" | "many geniuses and heroes of that period of the campaign"; "the clearest testimony to his merit" | OK |
| 4 | "a wood shaving" → "a shaving" | "a shaving that has fallen into it by chance" | OK — the source never specifies wood |
| 5 | "Marshal Murat's position" → "Murat's position"; "toward" → "reached"; "for no apparent reason" → "for no reason"; "began pouring into" → "began to enter"; "Then the entire French army" → "when Dokhturov had gone … , the entire French army" | "the whole French army having, in its convulsive movement, reached Murat's position apparently in order to give battle—suddenly without any reason turned off to the left … and began to enter Formínsk" | **PARTIAL — see finding below.** Arrival, the un-hedged "without any reason", the neutral "began to enter" and the `when`-subordination are all correctly restored, and the added rank is gone. But "in its convulsive movement" — present in the source and present in the candidate as "lurched convulsively" — is absent from the corrected text |
| 6 | "a house servant" → "a house serf"; "Cossacks" → "Some Cossacks"; "marching toward Borovsk" → "marching along the road to Borovsk"; "no longer clear what he should do" → "no longer clear to him what he should do" | "a house serf who had come from Bórovsk"; "Some Cossacks of Dokhtúrov's detachment"; "marching along the road to Bórovsk"; "it was not clear to him now what he ought to do" | OK — serf restored (a social fact, not a synonym), the partitive restored, and the road (not the town) is what the Guards are on |
| 7 | "they chose a capable officer named Bolkhovitinov" → "a capable officer, Bolkhovitinov, was chosen"; "General Staff headquarters" → "the General Staff" | "a capable officer, Bolkhovítinov, was chosen"; "galloped off to the General Staff" | OK — the passive (no agent named) is restored; "headquarters" was an addition |

## 3. Readability of changed paragraphs

Re-read as a new reader. All seven remain clear. ¶2 is long but its list structure is the
source's own and the restored "commanding wherever the position was most difficult" reads
more naturally than the candidate's "in command at the most critical position in every
engagement". ¶5's re-subordination ("On October tenth, when Dokhturov had gone halfway …,
the entire French army … suddenly … veered left") is a long sentence but tracks cleanly.

## 4. Structure and punctuation

- Paragraph count 8 = 8 = 8 (source / candidate / corrected). Order unchanged.
- `number` 294 and `title` "Book Thirteen (1812) — Chapter 15" identical to source.
- No empty paragraphs.
- Per-paragraph `?` and `!` parity with source: **clean across all 8 paragraphs**.
- No paragraph falls below 0.75 of its source word count.
- Quote characters normalised to straight throughout (the candidate mixed curly and straight).
- JSON valid.

## 5. New findings

### BLOCKING — new MODERATE introduced by this round

**¶5 — "in its convulsive movement" dropped.**

- Source: "the whole French army having, **in its convulsive movement,** reached Murat's
  position apparently in order to give battle—suddenly without any reason turned off to the
  left onto the new Kalúga road…"
- Candidate: "the entire French army—having **lurched convulsively** toward Marshal Murat's
  position as if to give battle—…"
- Corrected: "the entire French army—having reached Murat's position as if to give
  battle—suddenly, for no reason, veered left…"

The fidelity finding asked only that "toward" be restored to "reached". In rewriting the
clause the corrector answered that finding and, unannounced, removed the narrator's
characterisation of the army's motion. The log's before/after strings are accurate, so this
is not a mis-logged edit — but the finding line for ¶5 does not mention it, so the loss is
unaccounted for.

Why MODERATE and not MINOR: "convulsive movement" is not decoration. It is the narrator's
judgement that the army is no longer manoeuvring but convulsing, and it is the premise the
rest of the paragraph turns on — the army reaches a position as if to give battle and then
"suddenly without any reason" veers off. It also sets up the chapter's own machine-and-shaving
figure at ¶4 and the melting/decomposition figure carried into ch298. The pipeline rated the
comparable loss of "and perishing" (same chapter, ¶2) MODERATE; this is the same class.

**Remedy (one clause, no other change needed):** restore the phrase to ¶5, e.g.
"…the entire French army—having, in its convulsive movement, reached Murat's position as if
to give battle—suddenly, for no reason, veered left onto the new Kaluga road…". Re-verify
against the new hash.

### Non-blocking

- **MINOR, ¶2:** "which turned out to be a most difficult and important one" was reduced to
  the appositive "a most difficult and important one". The retrospective framing ("turned out
  to be") is lost. The corrector was right to delete the candidate's unsupported "of the
  campaign"; the retrospect could have stayed.
- **MINOR, pre-existing:** ¶2 renders "from Austerlitz" as "from the Battle of Austerlitz";
  an added gloss that asserts nothing. ¶5 still drops "the orders he had received" to "his
  orders". Neither was flagged by the fidelity review.
- Every paragraph carrying a fidelity finding was edited; no finding sits on an untouched
  paragraph. All four original MODERATE findings (¶2 ×2, ¶5 ×2) are answered.

**One new MODERATE remains (¶5, introduced by this round).**

Verification: ANOTHER ROUND
sha256: f915cef90e73b486bafd9a95b3a2b6947cd7c89976269138be513d0ac59fe7f7
