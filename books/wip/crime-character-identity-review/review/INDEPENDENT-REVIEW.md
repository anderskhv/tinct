# Crime and Punishment modern-en: independent review of character-mention identity

Reviewer: independent second reviewer. I was not briefed on the lead's conclusions.
Scope: the 438 existing modern-en mentions (R001–R408, M01–M30) in paragraphs that the accepted candidate changed.
Output: `review/independent-verdicts.jsonl` (438 lines). Tools: `review/reviewer_tools/`.

## 1. Method

**Order of work.** I wrote all 438 verdicts before opening `ledger/decisions.jsonl`. I did not read the lead's scripts in `tools/` or `evidence/crosscheck.json` at any point. From `evidence/` I used only `entries.json`, and only for entry IDs and the live offsets.

**Inputs verified.** The sha256 of `baseline-live-modern-en.json` (914bcdfa…) and of `candidate.json` (18be4155…) match the pinned values.

**Offsets (`reviewer_tools/align.py`).**
1. For every entry I normalized the live, candidate and source paragraphs with `text.replace(/\n/g,' ').replace(/ {2,}/g,' ')`. I converted UTF-16 offsets to Python indices with my own code.
2. All 438 live mentions check out:
   - The text at `startOffset..endOffset` in the live paragraph equals the mention text (438/438).
   - Each mention exists with identical fields in `crime-and-punishment.v1.json` `editions["modern-en"].mentions` (438/438).
3. I aligned live against candidate independently. The method was difflib `SequenceMatcher` over word and punctuation tokens, after folding only these known Garnett respellings: Sonya/Sonia, Dunya/Dounia, Razumikhin/Razumihin, Svidrigailov/Svidrigaïlov, -ich/-itch. This produced a proposed span for 437 entries. M01 falls in a deleted block.
4. I recomputed each final span's UTF-16 offsets and checked them by slicing the UTF-16-LE encoding of the candidate paragraph (0 mismatches). My spans agreed with the evidence file's `mapped` field in 437/437 cases. I treated that agreement only as a consistency check, not as evidence of identity.

**Reading the contexts (`reviewer_tools/view.py`, output `views.txt`).**
- For each entry I read a ±130-character window of the live paragraph and of the candidate paragraph around the span. When the two windows are identical after respelling (255 entries), I read the candidate window once. When they differ (183 entries), I read both side by side.
- For each window I also checked the rank of the occurrence and the count of the name in the live, candidate and Garnett paragraphs.
- Where the counts differed, I read the full paragraphs. This covered all the M entries, plus 2.20, 4.1, 9.18, 10.68, 10.107, 34.0 and 34.8. I established which occurrence is the counterpart by the clause and the speaker, not by rank. For M01, I also read 8.121 and the changes.jsonl rows for 8.120. For R125, I read 4.10–4.14.
- I searched every live span for family or other-person risks: a plural "Svidrigailovs", a preceding "Marfa Petrovna" or "Mrs.", and a following "'s wife". Only R026 ("Marfa Petrovna -- Mr. Svidrigaïlov's wife") turned up, and it names Svidrigaïlov himself.

**How evidence was written.**
- For ordinary entries, `make_verdicts.py` generates evidence recording: the candidate context; the occurrence's rank k/n among occurrences of the exact live and candidate forms; and whether the ±130-character window is unchanged apart from spelling or reworded nearby. I read every one of these contexts; the template only phrases what I checked.
- Entries that needed judgment have hand-written evidence: all 30 M entries, and R026, R125, R154, R171, R172 and R402.
- Seven entries additionally note that Garnett uses a pronoun or "the latter" where the modern text uses the name: R003, R103, R156, R179, R194, R255 and R266. The antecedent in Garnett is the same person in each case.

## 2. Counts by decisionClass

| decisionClass | count | detail |
|---|---:|---|
| map/spelling-variant | 408 | Svidrigaïlov 169 (incl. 'Arkady Ivanovitch Svidrigaïlov'), Dounia 99, Razumihin 82, Sonia 25, Ilya Petrovitch 19, Pyotr Petrovitch (Luzhin) 13, 'Rodion Romanovitch Raskolnikov' 1 |
| map/same-text | 29 | Sofya Semyonovna 9, Raskolnikov/Rodion Romanovitch 7, Porfiry 5, Dounia 4, Katerina Ivanovna 3, Zametov 1 |
| map/changed-form | 0 | |
| drop/replaced-by-pronoun | 0 | |
| drop/removed | 1 | M01 |
| changed-identity | 0 | |
| ambiguous | 0 | |
| **total** | **438** | 437 map, 1 drop |

Every one of the 408 R entries is a same-position respelling of the same reference. For the 29 same-text M entries, the name form is unchanged; the script sent them to manual review only because the candidate added or removed other occurrences nearby. That makes rank unreliable in six places:

| Entry | Occurrence (rank-in-candidate) |
|---|---|
| M05 | 3rd, not 2nd |
| M07 | unaffected |
| M12 | 4th, not 3rd |
| M16 | 3rd, not 2nd |
| M17–M23 | each shifted by one |
| M27 | 3rd, not 2nd |
| M28 | 4th, not 3rd |

## 3. Comparison with the lead's ledger

Class labels were matched as equivalent: `spelling-variant` = `map/spelling-variant`, `same-text` = `map/same-text`, and `removed-with-duplicate-text` = `drop/removed`.

**Field-level result:**
- 438/438 agree on `decision`.
- 438/438 agree on `decisionClass`.
- 438/438 agree on exact `finalCandidateSpan` (startOffset, endOffset and text).
- 438/438 agree on characterId, chapter and paragraph.

**There are no field-level disagreements**, so I did not have to maintain or concede any verdict. The table below lists the differences I have with the lead's *rationale or identityNote*. None of them changes a mapping.

| entryId | my verdict | lead verdict | resolution | reason |
|---|---|---|---|---|
| R125 | map/spelling-variant @11–23, concern: allusive taunt | map/spelling-variant @11–23, identityNote `allusive-use` | Agree on the mapping and the flag. I dispute one claim in the rationale. | The lead writes that "the card explains the allusion". It does not. The only Svidrigaïlov snapshot (available from 3.38@2530) reads "Dunya's former employer, with a dark reputation / Wealthy, unsettling, and recently widowed, he pursued Dunya … His arrival in St. Petersburg alarms the whole Raskolnikov family." Nothing in it says the name is being thrown at a stranger. |
| R154 | map/spelling-variant @173–182 | same | Agree on the decision. The rationale is inaccurate. | The lead's template says "same name in the same position". The sentence was rewritten: "So I haven't come to Razumikhin on purpose?" became "Why, I've come to Razumihin's without meaning to!" (Garnett: "of myself"). The name changed from object to possessive. The lead gave R062 a specific note for a comparable reordering but not R154. |
| R062 (and other reworded windows) | map/spelling-variant | same | Agree | The lead's note on R062 is correct. More generally, the template "in the same position" appears on about 145 R entries whose ±130-character window was revised: for example R059 "The poor madman was treated rather harshly" became "It really was treating the crazy fellow too harshly", and R302 "Wait! Stay a little!" became "A-ach! Sit down, stay a little!". I read each of these and the referent never changes, but the ledger's rationale does not show that these were read rather than templated. |
| M09 | map/same-text @84 | same | Agree; a wording point only | The lead says the restored clause "adds a second 'Katerina Ivanovna'". More precisely, it replaces the live pronoun ("She was very anxious…" became "…and Katerina Ivanovna was very anxious it should be so", as in Garnett). Either way, @177 is new and unbound, and the mention stays at @84. |
| M01 | drop/removed | drop (removed-with-duplicate-text) | Agree | The lead's rationale is accurate. 8.121@37 already binds the same glance, and that text is unchanged, so relinking M01 would create a duplicate mention. |

I checked every offset delta the lead quotes for M entries (+194 M05, +3 M07, +8 M08, +5 M12, +4 M13, −2 M14, +15 M15, +87 M16–M23, +93 M25, +52 M26, +169 M27, +195 M28, −17 M30). They are correct. The lead's `referent` strings are correct for all 10 character IDs.

## 4. Ambiguous or concerning entries

**Ambiguous:** none. For every entry, a single candidate span is the counterpart (or, for M01, none), established from the clause, the speaker and the Garnett source.

**R125 (4.13, "Hey! You, Svidrigaïlov! What do you want here?")**
- **The correspondence is certain.** The paragraph is unchanged apart from spelling, the name is its only occurrence, and Garnett reads the same.
- **The concern is with the live binding, not the candidate.** Raskolnikov is shouting at the stout dandy stalking the drunk girl on K---- Boulevard (4.11–4.12; the man replies in 4.14). He throws Svidrigaïlov's name, known to him only from his mother's letter, at the man as an insult.
- The token denotes Svidrigaïlov, but the person being addressed is someone else. Svidrigaïlov does not appear in person until the end of Part 3.
- **My view:** keep the mapping, because the migration should not silently change editorial policy. The card owner should then decide one of the following:
  - (a) mark this mention as allusive, or add an allusion note (the current card does not explain it), or
  - (b) unbind it.
- Tapping the name at this point opens a card about the real Svidrigaïlov, which is thematically apt. It could mislead a reader into thinking the dandy *is* Svidrigaïlov. I would lean to (a).

**M01 (8.120, "He shot a contemptuous glance at Raskolnikov")**
- This is a drop: the invented duplicate of 8.121 was removed (changes.jsonl, P0-structure).
- Nothing is lost, because 8.121@37 carries the same moment and is already bound. It must not be re-pointed to 8.121.

**Other observations** (outside the scope of the 438 decisions, recorded for the card owner):
1. **New, unbound name occurrences in the candidate.** These come from access-reference edits and restored omissions, and none of them is a counterpart of an existing mention:
   - 13.108@141 and 13.204@71 (Raskolnikov)
   - 16.58@1082 (Rodion Romanovitch)
   - 17.65@374 (Dounia)
   - 18.5@158 and 18.21@177 (Katerina Ivanovna)
   - 26.67@286 (Porfiry)
   - 29.64@1072 (Sofya Semyonovna)
   - 31.73@239 (Katerina Ivanovna)
   - 33.13@3848 (Zametov)
   - 40.3@1373 (Raskolnikov)
   - 40.9@558 (Dounia)

   They could be bound in a follow-up coverage pass.
2. **Possible spoiler in the Svidrigaïlov card.** The snapshot available from 3.38 mentions his being "recently widowed" and his "arrival in St. Petersburg". Both are revealed later than 3.38/4.13. This is a card-content issue, not a migration issue.
3. **Where Garnett uses a pronoun** ("the latter", "him", "she", "that man"), the modern edition supplies the name: R003, R103, R156, R179, R194, R255 and R266. In every case the antecedent is the named person, so identity holds.
4. **R026** ("Marfa Petrovna -- Mr. Svidrigaïlov's wife") and **R172** ("not Razumihin, as everyone calls me") look risky but are correct bindings. The possessive names Svidrigaïlov himself, and in R172 Razumihin is naming himself.

## 5. Confirmation statement

I independently confirmed **438 of 438** entries:
- 437 maps, each with an exact span I recomputed myself and a referent checked by reading the context.
- 1 drop (M01), with the removal verified against the candidate, the source and changes.jsonl.

My verdicts agree with the lead's ledger on decision, class and exact span for all 438. I have no unresolved disagreements. The open items are an editorial policy question on R125 (allusive binding, and the rationale's incorrect claim that the card explains it) and the out-of-scope observations in §4.
