# Book 20: independent fidelity review of b20-draft.json

**Verdict: CLEAN.** There are 12 findings: 0 blocking and 12 non-blocking. They are in `b20-fidelity.json`, which `fid20_write.py` wrote after checking that every `old` string is exact and unique in its paragraph. Applying all 12 to the draft replays cleanly.

I read all **36 of 36** paragraph pairs against `source-book20.json` (Butler, PG #1727), in packets of 6 to 8 with the live baseline beside them. That includes the 15 paragraphs the drafter marked KEPT. I then re-read the whole Book for continuity. `b20-draft.json` is byte-identical to `book20/candidate-v1.json`. I compared recurring phrasing with accepted Books 16, 17 and 18 (`candidate-accepted.json`), and with B03, B11 and B13 where a GLOSSARY row points to them.

## The drafter's counts
I diffed the draft against the live baseline with quote typography normalized. **Exactly 21 paragraphs differ, and they are the 21 claimed:** ¶0, 3, 5, 6, 7, 9, 10, 11, 12, 13, 17, 18, 20, 21, 22, 27, 30, 31, 32, 33, 35. The other 15 are identical to live apart from typography. 21 + 15 = 36. Of the 12 findings, 4 are in paragraphs marked KEPT (¶16, 24, 28, 29). The other 8 are in repaired paragraphs (¶0, 3, 6, 11, 17, 18, and ¶27 twice), where each keeps a live wording that the repair did not touch.

## Non-blocking findings
| ¶ | Draft | Butler | Proposed |
|---|---|---|---|
| 0 | "like a mother dog protecting her puppies, baring her teeth at a stranger" | "so did his heart growl with anger at the evil deeds that were being done" | Restore the second half of the simile. At present the Book does not say what the anger is at. |
| 3 | "fifty bands of armed men" | "fifty bands of men" | Drop the added "armed". |
| 6 | "a sign from someone now waking" | "a sign out of the mouth of some one … now waking" | "from the lips of someone". He asks for a spoken omen, and ¶7–8 fulfil it. |
| 11 | "left the courtyard" | "went out of the court" | Use "court", as in ¶30 and ¶35 and in accepted B17 and B18. |
| 16, 17, 18 | "herdsman" / "Herdsman" | "stockman" / "Stockman" | Use "stockman". See the Philoetius row below. |
| 24 | "the sacred offering" | "the holy hecatomb" | "the holy sacrifice". This follows the GLOSSARY hecatomb row (B03 "the fine sacrifice"; B13 "great sacrifices"). |
| 27 | "Telemachus spoke angrily" | "On this Telemachus spoke fiercely" | "At this Telemachus…". This is the fixed "On this" → "At this" row. |
| 27 | "understand good and evil instead of" | "…knowledge of good and evil and understand what is going on" | Restore "understand what's going on". |
| 28 | "the best man who makes her the most advantageous offer" | "the best man, and the one who makes her the most advantageous offer" | "the best man, the one who…". The restrictive clause changes the criterion. |
| 29 | "By Zeus and by my unhappy father's sufferings" | "By Jove, Agelaus, and by the sorrows…" | Restore the vocative "Agelaus". |

## The requested checks against Butler
| Item | Result |
|---|---|
| cloister → gallery at 8 places; "court" kept | **CORRECT.** Butler has cloister(s) at exactly ¶0, 6, 9, 10, 11, 22, 30 and 35, and the draft has "gallery" at exactly those 8. No cloister, colonnade or courtyard is left standing for a cloister. Butler's "court" is kept distinct at ¶11, 30 and 35 ("the gate of the gallery and the court beyond it"; "facing the court and the gallery"), and ¶26's "paying court" idiom becomes "courting". One nit: ¶11 renders Butler's "court" as "courtyard", while the rest of the Book and B17–18 use "court" (non-blocking finding). |
| Erinyes | **CORRECT.** Butler has "the dread Erinyes" (¶5). The GLOSSARY row (B02-P008) keeps Erinyes, and "Furies" is the Roman name the edition rejects. Not re-glossing the word is consistent with the rule that a gloss appears at first use only. |
| Oceanus | **CORRECT.** Butler: "into the mouths of over-flowing Oceanus". The draft has "into the mouths of the overflowing Oceanus", which restores both the proper name and the mouths. "the" in front of the adjective is natural English, and accepted books use "the waters/stream of Oceanus". |
| "So he prayed" (¶7) | **CORRECT.** Butler opens with "Thus did he pray.", which live had dropped. "So he prayed" is the accepted formula at B03-P035, B06-P030 and B09-P046. |
| Theoclymenus's vision (¶30) | **CORRECT, full strength.** Every element is there: the shroud of darkness, wet cheeks, wailing voices, walls and **roof-beams** dripping blood, the gate of the gallery and the court beyond it full of ghosts going down into hell's night, the sun blotted out, "a **blighting** gloom". The forced laughter and the blood-smeared meat come before it. |
| "heifer's foot" (¶27) | **CORRECT.** Butler: "picked up a heifer's foot from the meat-basket". It is called back in Book 22 (source ¶28: "to repay you for the foot which you gave Ulysses"), where the stockman speaks the line. "The foot hit the wall" keeps the noun. The title keeps Butler's own title wording, "an ox's foot", which is also correct. |
| inner meats (¶21, ¶22) | **CORRECT.** Butler has "the inward meats" at both places. The GLOSSARY B03 row fixes this as "the inner meats", paired with "the outer meat" at ¶25. |
| Sicels (¶33) | **CORRECT.** Butler: "send them off to the Sicels". This is a people and not in the Roman table, so it stays as Butler spells it. |
| "unseemly" (¶27) | **CORRECT.** Butler uses "unseemly" twice (the behaviour, and "dragging the women servants about the house in an unseemly way"), and the draft keeps the repetition. Butler's separate "disgraceful scenes" is rendered "shameful scenes", which is acceptable. |
| dropped "To this" (¶29) | **CORRECT, on precedent.** Accepted Books 16–18 drop "To this" before an ordinary speaker tag in every instance: B16-P24 "Telemachus answered", B16-P39 "Eurymachus, son of Polybus, answered", B18-P13 "Odysseus answered", B18-P24 "Penelope replied". They keep it only in the second-person formula "To this you answered, swineherd Eumaeus" (B16-P8, B17-P52, B17-P58). Separately, the same paragraph drops the vocative "Agelaus" (finding). |
| Philoetius as "herdsman" | **NOT CONSISTENT (non-blocking finding, ¶16–18).** The drafter says that "No accepted Book has yet fixed a convention". That is inaccurate on two counts. Accepted B03 keeps Butler's "stockman" ("tell the stockman to look me out a heifer"). Accepted B10 and B14–B17 use "herdsman/herdsmen" for Butler's own separate word "herdsman" (B14 "the herdsman's four dogs" at Eumaeus's station; B16 "us herdsmen"). So "herdsman" merges two Butler words. Butler calls Philoetius "the stockman" through Books 21, 22 and 24, including the B22 foot callback, so the choice made here binds those Books. The recommendation is "stockman", which is plain modern English. |
| Diana → Artemis in title | **CORRECT.** The title matches Butler's title word for word, except for Ulysses → Odysseus (×2) and Diana → Artemis. |

## Quotation structure (coordinator's check: ¶7, 14, 16, 27, 28)
**All correct. No finding.** No source paragraph in Book 20 leaves a speech unclosed at a paragraph break, and none does in the draft, so the D4 unclosed-quote convention does not apply. Every draft paragraph is balanced. There are no ASCII quotes.

The count differences all come from the same cause. Butler interrupts a speech with a speaker tag, and the draft moves the tag in front of one continuous quotation. Nothing is lost, and the speaker stays unambiguous:
- ¶7: `“Father Jove,” said she, “you, who rule…` becomes `spoke to her master: “Father Zeus, ruler of…`
- ¶14: `“Are you still here, stranger,” said he, “to pester…` becomes `began taunting Odysseus: “Are you still here, stranger, pestering…`
- ¶16: `“Good day to you, father stranger,” said he, “you seem…` becomes `took his right hand: “Good day, father stranger. You seem…` The turn from Odysseus to Zeus and back is kept inside the one speech, as in Butler.
- ¶27: `“It is a good thing for you,” said he, “that…` becomes `to Ctesippus: “It’s lucky for you that…`
- ¶28 (nested): Butler has `‘As long,’ I would say, ‘as you had…not yours.’”`. The draft has `which I hope both will accept: ‘As long as you had…not yours.’”`. There is one inner ‘…’ pair, correctly curled and correctly closed inside the outer ”, and the embedded speech is complete. "I would say" is absorbed by the lead-in, which is acceptable.

## Continuity and conventions
- The Greek-name mapping is complete. No Ulysses, Minerva, Jove, Diana, Venus, Juno or Euryclea is left, and there is no "Furies". Ops and Arete do not occur.
- Spelling is American ("offense", "behavior"). Em dashes are unspaced in the text, and the title's "Book 20 — " matches B16–18.
- "At this" appears at ¶6 and ¶20, but ¶27 is missing it (finding). "fountain" matches B17. "mixing-jugs" (¶11) and "mixing bowls" (¶21) keep Butler's two different words. "Hades’ house" matches B11. "thought it best" and the dawn formula do not occur in this Book.
