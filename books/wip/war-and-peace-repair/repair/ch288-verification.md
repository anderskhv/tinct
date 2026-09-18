Model: opus

# Chapter 288 — Book Thirteen (1812), Chapter 9 — independent verification

Files verified: `ch288-candidate.json` (pre-correction), `ch288-corrected.json`, `ch288-corrections-log.md`, `ch288-source.json`. `ch288-fidelity.md` read for context only; every verdict below was re-derived from the source, not from the log.

## 1. Diff vs log

Paragraph-by-paragraph diff of the two candidates (0-based indices):

| ¶ | Changed in file? | Edits in file | Logged entries |
|---|---|---|---|
| 0 | yes | 2 | 2 |
| 1 | yes | 1 | 1 |
| 2 | no | — | not logged (correct) |
| 3 | yes | 2 (anaphora + scare quotes) | 1 entry covering both |
| 4 | yes | 1 | 1 |
| 5 | yes | 1 | 1 |
| 6 | yes | 1 | 1 |
| 7 | yes | 5 | 5 |
| 8 | yes | 1 | 1 |
| 9 | no | — | not logged (correct) |
| 10 | yes | 1 | 1 |
| 11 | yes | 1 | 1 |
| 12 | no | — | not logged (correct) |
| 13 | yes | 10 | 10 |
| 14 | yes | 1 | 1 |
| 15 | no | — | not logged (correct) |
| 16 | yes | 2 | 2 |
| 17 | yes | 1 (anaphora + "military duties") | 1 entry covering both |

Fourteen paragraphs changed, fourteen logged. ¶2, ¶9, ¶12 and ¶15 are byte-identical between candidate and corrected and carry no log entry. For each entry the exact "Before" text was confirmed present in the candidate and absent from the corrected file, and the exact "After" text confirmed present in the corrected file. **No mismatch, no unlogged edit, no claimed edit that was not made.**

One log-hygiene note (not a mismatch): the ¶17 entry's "Before" line quotes only "orders were continually issued imposing severe punishment for neglect of duty" and omits the dropped opener "Regarding military discipline,", although the "After" line includes "With reference to army discipline". The finding line names the anaphora, so the change is disclosed; the quoted span is simply short.

`number` (288) and `title` ("Book Thirteen (1812) — Chapter 9") are identical across source, candidate and corrected.

## 2. The three named items

**"still kept out in the fields" (¶13) — MAJOR.**
Source: "and you scattered tillers of the soil, still kept out in the fields by groundless fear, listen!" Corrected: "and you scattered farmers still kept out in the fields by groundless fear—listen!" The inversion is repaired: the peasants are out in the open, away from home, which is what makes the same paragraph's later "come from the forests… return to your huts" coherent. **Correct, MAJOR resolved.**

**"to obtain provisions for themselves" (¶8) — MODERATE.**
Source: "Napoleon decreed that all the troops in turn should enter Moscow à la maraude * to obtain provisions for themselves, so that the army might have its future provided for." Corrected: "With regard to supplies for the army, Napoleon decreed that all troops should take turns entering Moscow à la maraude * to obtain provisions for themselves, so that the army might have its future provided for." The candidate's "to forage" (a gloss on *à la maraude*, doing the deleted clause's work) is gone; "for themselves" is back, so each man loots on his own account and the stated collective purpose is absurd again. The source's evasive passive tail is restored verbatim. The footnote marker keeps its position after *à la maraude* and ¶9 still carries the note. **Correct.**

**The "With regard to…" anaphora — chapter-level MODERATE.**
The source opens nine of eighteen paragraphs with the formula: seven exact "With regard to" (¶0, 1, 3, 4, 8, 10, 11), one "In regard to" (¶16) and one "With reference to" (¶17). Checked programmatically against the corrected file: all nine openers now match the source exactly, including ¶16's full "In regard to philanthropy, the greatest virtue of crowned heads," and ¶17's "With reference to army discipline". No paragraph carries the formula that should not. The ledger reads as a ledger. ¶15 ("With the object of raising the spirits…") is a different construction in the source and is correctly left alone. **Correct, chapter-level MODERATE resolved.**

## 3. Remaining per-change verdicts (re-derived from source)

**¶0 — "carefully oversaw the fortification" → "gave careful directions about the fortification".** Source exact. Napoleon issues orders; he does not supervise work. **Correct.**
**¶3 — scare quotes around "scoundrel" removed.** Source: "And the scoundrel Rostopchín was punished by an order to burn down his houses." The epithet is reported deadpan again. **Correct.**
**¶5 — "CITIZENS OF MOSCOW!" → "INHABITANTS OF MOSCOW!"** Source exact; the distinction from "fellow citizens" at ¶7 is back. **Correct.**
**¶6 — "your municipal government" → "your municipality or city government".** Source exact; the self-glossing doublet belongs to the proclamation's register. **Correct.**
**¶7 — "twenty ward commissioners to the city's different districts" → "twenty commissaries or captains of wards have been appointed to the different wards of the city".** Source exact; parallel with the kept "commissaries general, or police chiefs" restored. **Correct.**
**¶7 — "unite to resist the evil-minded" → "unite to defeat the intentions of the evil-minded".** Source exact. **Correct.**
**¶13 — "Come to us without fear." → "Respond, therefore, to his benevolent intentions and come to us without fear."** Source exact. The proclamation's central demand and its connective are restored. **Correct, MAJOR resolved.**
**¶13 — "Return to your villages" → "return to your huts"; "And you, peasants—" → "And lastly you too, peasants,".** Source exact on both; "huts" answers "the forests where you are hiding" and "lastly" closes the enumeration of addressees. **Correct.**
**¶13 — "industrious workers" → "industrious artisans".** Source exact. **Correct.**
**¶13 — markets sentence.** Source: "Markets are established in the city where peasants can bring their surplus supplies and the products of the soil. The government has taken the following steps to ensure freedom of sale for them:" Corrected matches: the two-item list is whole, the addressee is third-person again, and free sale is a purpose rather than an accomplished fact. **Correct.**
**¶13 — condition (1): "farmers and those living near Moscow" → "peasants, husbandmen, and those living in the neighborhood of Moscow".** Source exact; three classes again. **Correct.**
**¶13 — condition (2): "take his goods home—no one may hinder him" → "take his goods back to his village, and no one may hinder him under any pretense".** Source exact. **Correct.**
**¶13 — condition (3): "to protect supply carts" → "at such distances from the town as to protect the carts".** Source exact; the operative condition is back. **Correct.**
**¶13 — condition (4): "Similar measures will protect peasants returning with their carts." → "Similar measures will be taken that peasants with their carts and horses may meet with no hindrance on their return journey."** Source exact; "and horses" and the non-hindrance guarantee restored. **Correct.**
**¶14 — "Place your trust at his feet" → "Place your respect and confidence at his feet".** Source: "Lay your respect and confidence at his feet". Pair restored. **Correct.**
**¶16 — "Ennobling… he had relief distributed to fire victims" → "Raising… he let relief be distributed to those who had been burned out".** Source exact inside the Thiers quotation. Thiers has Napoleon *permit* relief, which is the act Tolstoy is quoting him in order to mock. **Correct.**
**¶17 — "neglect of duty" → "the nonperformance of military duties".** Source exact. **Correct.**

## 4. Reader check — two new defects introduced by this round

Both are in ¶7, both are grammar/reference breaks the candidate did not have, and both were created by lifting source wording into a sentence the candidate had already restructured.

**(a) Dangling "in them".** Corrected ¶7: *"Your fellow citizens are returning daily, and orders have been given that they shall find **in them** the help and protection due to their misfortunes."* In the source the antecedent is three words earlier: "Your fellow citizens are returning every day **to their homes** and orders have been given that they should find in them the help and protection due to their misfortunes." The candidate had cut "to their homes" (never flagged, COSMETIC) and compensated with "shall find help and protection **in their homes**". The correction restored "in them" — which answers the logged MODERATE about "due to their misfortunes" — but did not restore the antecedent, so "them" now points at nothing the reader can resolve. A reader hits "find in them" and has to stop. Fix: restore "returning daily to their homes", which satisfies both the source and the finding.

**(b) Subjectless modal inside a list of imperatives.** Corrected ¶7: *"But to achieve this, you must add your own efforts: forget, if possible, the misfortunes you've suffered; **should entertain the hope of a less cruel fate**; be certain that inevitable, shameful death awaits anyone who threatens your persons or your remaining property; and you should not doubt that these will be safeguarded…"* The source runs the whole series on "it is necessary that you should… and should… should… should…", so "should entertain the hope" is grammatical there. The candidate recast the series as a colon plus imperatives ("forget…; trust…; be certain…"). Dropping the source's clause into that frame yields an ungrammatical second item — a modal with no subject sitting between two imperatives. This is a straight regression from the candidate, which read correctly. The logged finding it answers is only a MINOR (confidence vs. tentative hope) and is fully served by an in-frame fix such as "hope for a less cruel fate". The fourth item ("and you should not doubt that these will be safeguarded") is grammatical and its "these" does resolve to "your persons or your remaining property" in the preceding item, so it is uneven but not broken; it can stay.

Neither defect touches fidelity — both restorations are faithful to the source — but verification step 3 asks whether the changed paragraph is now clear to a new reader, and ¶7 is not. One ungrammatical clause and one unresolvable pronoun in a reader-facing paragraph is enough to send this back.

## 5. Structure and punctuation

- Paragraph count 18 in source, candidate and corrected; order unchanged; no empty paragraphs.
- Per-paragraph question-mark and exclamation-mark counts match the source in all eighteen paragraphs (checked programmatically, source vs corrected). The proclamations' exclamations at ¶5, ¶6, ¶7, ¶13 and ¶14 are all intact.
- `number` and `title` unchanged.

## 6. Findings summary

- Both MAJOR findings (¶13 inversion, ¶13 "Respond, therefore") are addressed. All MODERATE findings — ¶0 "oversaw", ¶3 scare quotes, ¶7 "due to their misfortunes", ¶7 "these will be safeguarded", ¶8 "for themselves", ¶13 ×5, ¶16 agency, and the chapter-level anaphora — are addressed. **No MAJOR or MODERATE finding from the review remains.**
- **Two new blocking findings introduced by the corrections, both in ¶7:** dangling "in them" (no antecedent after "to their homes" was left out), and the ungrammatical "should entertain the hope of a less cruel fate" inside an imperative series. Both are local; neither requires revisiting any other paragraph or any fidelity decision.
- Non-blocking, pre-existing (declined on the record): "General Sebastiani" spelling vs. Maude's "Sabastiani" (pending a conventions decision), the ¶1 gloss "Rostopchin, the governor of Moscow", and COSMETIC items at ¶2, ¶9, ¶14, ¶16.
- The correct round-two scope is ¶7 only: restore "to their homes" in the fellow-citizens sentence, and recast the second list item as an imperative that keeps the source's tentativeness. Nothing else in the corrected file needs to move.

Verification: ANOTHER ROUND
sha256: fb7c938e7497757b161ce78143ef4501fcc32dd82878f4e756ecc83a05e89e93
