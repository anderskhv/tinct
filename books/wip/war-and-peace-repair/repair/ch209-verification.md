Model: opus

# Chapter 209 (Book Ten — Chapter 19) — independent verification

Verifier did not draft, review or correct this chapter. Paragraph indices are 0-based, matching the fidelity review and the corrections log.

Files compared:
- source: `ch209-source.json`
- pre-correction candidate: `ch209-candidate.json`
- corrected: `ch209-corrected.json`
- log: `ch209-corrections-log.md`
- context: `ch209-fidelity.md`

## 1. Diff vs log

Independently computed diff (candidate vs corrected), 0-based:

`[1, 3, 6, 11, 12, 15, 16, 18]` — 8 paragraphs changed.

Log entries: ¶1, ¶3, ¶6, ¶11, ¶12, ¶15, ¶16, ¶18 — 8 entries.

**Exact match.** No logged change is missing from the file; no changed paragraph is unlogged. No blocking mismatch.

## 2. Per-change verdicts (re-derived from source, not from the log)

### ¶1 — PASS
Source: "were the battles of Shevárdino and Borodinó **given and accepted**". Candidate had "fought and accepted"; corrected restores "given and accepted". Correct, and it re-couples the paragraph to ¶4's "In giving and accepting battle". No new drift; rest of the paragraph is byte-identical to the candidate.

### ¶3 — PASS (with one readability note, below)
Three source-anchored restorations, all correct:
- "stretching his supply lines even further" → "lengthening his lines of communication even further". Source: "lengthening his lines of communication still more". Correct — "lines of communication" is the source's term and is broader than supply.
- "seen for himself ... as he advanced" → "seen ...". Source has neither the intensifier nor the advance clause. Both invented elements removed. Correct.
- "repeated proposals to negotiate" → "repeated announcements of his wish to negotiate". Source exact. Correct — and materially different in meaning (an announced wish is not a proposal).
- "left to him" restored. Source: "the state in which Russian towns were **left to him**". The dative is back, so the sentence again says the towns were abandoned *for Napoleon to occupy*, which is the point Kutúzov's whole argument turns on.

The MODERATE finding is answered in full. No new meaning drift.

*New MINOR (non-blocking):* the restored dative is set as a mid-clause aside — "what condition the Russians were leaving their own towns in—left to him—and he had received..." — which reads a little awkwardly on first pass, because "left to him" lands after the preposition it is gapped against. Meaning is recoverable and correct; a smoother equivalent would be "...what condition the Russians were leaving their own towns in when they left them to him". Not worth another round on its own.

### ¶6 — PASS
Source: "how the battle of Borodinó **and the preceding battle of Shevárdino** were fought". Candidate collapsed the two into "the battles of Borodino and Shevardino" and added "actually". Corrected restores the source's ordering and the word "preceding" (which carries the chronology the chapter later depends on) and drops the intensifier. Correct.

### ¶11 — PASS
The pin-in-the-map image is restored verbatim in sense: "no more of a position than any other spot one might find in the Russian Empire by sticking a pin into the map at hazard". Matches source. The candidate's "any other random spot" had flattened an eleven-word figure into one adjective. Correction is complete and introduces nothing.

### ¶12 — PASS
Five restorations, each checked against source:
- "as an outpost of the position" → "in front of the position" (source: "quite senseless in front of the position where the battle was accepted"). Correct — and it removes a claim the paragraph goes on to *deny* (that the redoubt was an advanced post), so this also fixes a self-contradiction in the candidate.
- "actually accepted" → "accepted"; "was actually fought" → "was fought". Both intensifiers absent from source. Correct.
- "believed" → "were convinced". Source exact.
- "was fought on a pre-selected" → "was fought **by us** on a pre-selected". Source exact.
- "nearly unexpected" → "quite unexpected". Source: "a quite unexpected spot". This is the substantive fix — "quite" is *wholly*, and "nearly unexpected" was both weaker and incoherent. Correct.

### ¶15 — PASS
- "unexpectedly moved his army" → "unexpectedly **for the Russians** moved his army". Source exact. Restores whose expectation was defeated, which the following sentence ("not having time to begin a general battle") depends on.
- "no more advantageous than any other in Russia" → "no more advantageous **as a position** than any other in Russia". Source exact. The qualifier matters: the claim is about positional value, not the plain in general.

### ¶16 — PASS
- "could not, or would not" → "did not wish, or were not in time". Source exact. The candidate had reversed the order *and* changed the meaning: "could not" is incapacity, "were not in time" is a timing failure; "would not" is refusal, "did not wish" is disinclination. Restored reading is right.
- "decisive action" → "chief action". Source exact. Sensible, since the paragraph's last clause already supplies the decisiveness.

### ¶18 — PASS
Three small restorations, all source-anchored: "the entire battlefield" → "the entire **forthcoming** battlefield" (source: "the whole field of the forthcoming battle"); "the commanders' mistakes" → "**our** commanders' mistakes" (source exact — the possessive is the point, Tolstoy is indicting Russian historiography); "to keep the army from complete collapse" → "to keep the army **even** from complete collapse" (source exact — the "even" carries the escalation from "indecisive result" to "collapse"). Correct.

## 3. Read as a new reader

All eight corrected paragraphs read clearly. ¶12 is measurably clearer than the candidate, since the candidate asserted the redoubt was "an outpost of the position" in one sentence and denied it was "an advanced post of that position" two sentences later. ¶11's restored image is concrete and easy. The only rough spot is the ¶3 aside noted above; it is legible, just not graceful.

## 4. Structure and punctuation

- Paragraph count: source 19, candidate 19, corrected 19. Match.
- Order preserved; no paragraph moved.
- No empty or whitespace-only paragraphs.
- `number` (209) and `title` ("Book Ten (1812) — Chapter 19") identical across all three files.
- Per-paragraph `?` and `!` parity against source: **no discrepancies in any of the 19 paragraphs.**

## 5. Findings

- No MAJOR findings outstanding (the fidelity review recorded none).
- All four MODERATE findings (¶3, ¶11, ¶12, ¶15) are resolved and re-derived as correct against the source.
- One new MINOR, non-blocking: ¶3 aside placement (§2 above).
- The log's "Declined findings" section is accurate — the declined items (¶1 modal, ¶2 modal/explicitation, ¶5 wording) are all genuinely absent from the diff, and none is a MAJOR or MODERATE.

Verification: ACCEPT
sha256: c476e29e5dd374f2d85eacdb510597669da0ffc1fdd25898c52d2541b6dff502
