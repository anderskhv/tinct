# R2 re-verification applied (ch4) and restoration of reverted R1-reverify fixes

Lead editor. Pre-edit copies are in `drafts/history/{C,D,E,G,H}-*.r3pre-restore.json`.

## 1. Reverted fixes restored

The ch4 re-verifier found that the R2 readability edits to C and D had been made on stale copies. A mechanical check covered every part: `scratchpad/revert_check.py` flags any R2 hunk whose new text matches an older snapshot but not the pre-R2 copy. It found the same problem in G and H. Every reversion was restored to the approved reverify wording, and the genuine R2 edits were kept.

| Part ¶ | Regressed | Restored (approved) | Basis |
|---|---|---|---|
| C ¶4 | thoughtless glorification | thoughtless praise | R1-reverify-applied-CE |
| C ¶6 | one may speak of it | one dares to speak of it | *tør* ruling |
| C ¶7 | grasped in its greatness | understood in its greatness | *opfatte* ruling (grasp = *gribe*) |
| D ¶12 | he did not do this | he did no such thing | R1-reverify-applied-D |
| D ¶16 | no solid citizen, dressed up for his Sunday-afternoon walk out to Frederiksberg, | no dressed-up citizen walking out to Frederiksberg on a Sunday afternoon | R1-reverify-applied-D |
| D ¶17 | the relationship is such that | the circumstances are such that | R1-reverify-applied-D |
| D n4.21a | the whole reality of what is actual | the whole reality of actuality | STYLE §C, *Realitet* row |
| G ¶15 | offended against the girl | wronged the girl | R1-reverify-applied-FG |
| G n7.19a | rattling-about of particularities | clatter of particularities | R1-reverify-applied-FG |
| H ¶22 | torment strength out | wring strength out | *pine* = wring ruling (Danish: *pine Kræfter ud af*) |
| H ¶23 | a contradiction of the universal for it to want | a contradiction on the universal's part to want | R1-reverify-applied-H |
| H n7.34a | supreme ethical expression | highest ethical expression | R1-reverify-applied-H |
| H ¶25 | then he presumably finds peace | then he does indeed find peace | R1-reverify-applied-H (concessive *vel … men*) |

The checker flagged three other hunks. They are deliberate and were kept:
- A-ch2 ¶4 "Then for a moment Abraham turned away", a re-rendering that removes a 32-word shared run;
- H ¶28 "their explanation", reversed at the lead's request;
- B-ch3 ¶0, which is still in its R2 round and will be checked after it.

## 2. ch4 R2 MINOR items applied (reviews/R2-reverify-ch04.md §2)

| ¶ | Old | New |
|---|---|---|
| C ¶4 | Or perhaps, just as he had ethically forgotten that Isaac was the son, that speaker had also forgotten something that corresponds to it. | Or perhaps that speaker had forgotten something that corresponds to his ethical forgetting — his forgetting that Isaac was the son. |
| C ¶6 | the terrible deed that love | the terrible thing that love (keeps the *det Forfærdelige* echo) |
| C ¶7 | that he can attain blessedness along with everyone else — though not here, in time. | that he can become blessed along with everyone else — though he does not become so within time. (*blive salig … i Tiden bliver han det ikke*) |
| D ¶12 | handles all its exchanges | handles its exchanges |
| D ¶14 | may even manage this | may manage this |
| D ¶17 | his thinking it through | his reasoning |
| E ¶26 | …a foreigner. It was conceivable too… To get the princess in this way | …a foreigner. For it was conceivable too… No — to get the princess in this way (makes *thi* explicit) |
| E ¶28 | Irony and humor also reflect on themselves | Irony and humor also turn their reflection on themselves (matches ¶12, *ogsaa*) |

## 3. Result

With these applied, ch4 meets the reverifier's approval condition. `assemble.py` passes. The candidate was regenerated.
