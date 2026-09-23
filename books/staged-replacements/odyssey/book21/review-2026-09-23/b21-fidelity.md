# Book 21: independent fidelity review of b21-draft.json

**Verdict: BLOCKING FINDINGS.** There are 14 findings: 1 blocking and 13 non-blocking. They are in `b21-fidelity.json`. `fid21_write.py` checked that every `old` string is exact and unique in its paragraph, and all 14 replay cleanly. After the replay there is no ASCII quote and no bare "Odysseus’".

I read all **42 of 42** paragraph pairs against `source-book21.json` (Butler, PG #1727), in packets of 8 or 9 with the live baseline beside them. That includes the 21 paragraphs marked KEPT. I then re-read the whole Book for continuity. `b21-draft.json` is byte-identical to `book21/candidate-v1.json`. I compared recurring phrasing with accepted Books 18, 19 and 20, and with B01 where a GLOSSARY row points to it.

## The drafter's counts
I diffed the draft against live with quote typography normalized. **Exactly 21 paragraphs differ, and they are the 21 claimed:** ¶1, 3, 5, 6, 8, 9, 10, 11, 14, 15, 16, 17, 18, 23, 24, 28, 32, 33, 38, 39, 40. The other 21 match live apart from typography. 21 + 21 = 42. Six of the 14 findings are in KEPT paragraphs (¶0, 13, 20, 26, 27, 31), including the blocking one. The other 8 are in repaired paragraphs (¶1, 9, ¶10 ×3, 14, 32, 33). In each of those, the repair left a live wording untouched that departs from Butler.

There are three errors in the drafter's notes. None affects the text. (1) ¶10 is described as having "three defects", but two are listed and both are fixed. (2) The cupbearer precedent is accepted **B18**-P37/P39, not B20-P32. (3) The pavement precedent is B20-P22 ("paved with stone") and B18-P4 ("the smooth pavement in front of the doorway"), not B20-P27.

## Blocking
| ¶ | Draft | Butler | Fix |
|---|---|---|---|
| 31 | "She went back into the house wondering and took her son’s words to heart." | "She went wondering back into the house, and laid her son’s saying in her heart." | "She went back into the house in wonder, and kept her son’s words in her heart." This is Butler's **identical sentence** from B01-P026, and accepted B01 prints exactly this fix. The GLOSSARY formula row was written to remove "took … to heart", because that phrase means *accepted* and Butler means *pondered*. It is a meaning error in a fixed formula, and ¶31 is marked KEPT. |

## Non-blocking
| ¶ | Draft | Butler | Proposed |
|---|---|---|---|
| 0, 1 | "her servants" (×2) | "her maidens" | "her maids". Accepted B18-P20 and B19-P38 use this. "servants" merges Butler's separate word. |
| 9 | "when he pours the wine" | "when he is handing round the wine" | "when he hands the wine around". The turns follow the cupbearer's circuit. |
| 10 | "the suitors’ priest" | "sacrificial priest to the suitors" | Restore "sacrificial". |
| 10 | "hands were soft" | "hands were weak" | "weak" (D29). |
| 10 | "Some of us are … but when he has seen" | "Some one of us is … but when he has seen" | "Someone among us is". As drafted, "he" has no antecedent for a listener. |
| 13, 14 | "ball of fat" | "ball of lard" | "lard". Butler's concrete noun is still current English. |
| 20 | "Let this be our signal: the suitors" | "let this moreover be the token between us; the suitors" | "Let this also be our signal; the suitors". Under PUNCTUATION §6 an added colon is allowed only to introduce a list. |
| 26 | "the Lapiths" | "the Lapithae" | Keep Butler's spelling. It is not a Roman-table name. |
| 27 | "string mighty Odysseus’s bow" | "string the mighty bow of Ulysses" | "the mighty bow of Odysseus", as at ¶2. The epithet belongs to the bow. |
| 32 | "hunting dogs" | "boarhounds" | "boarhounds". |
| 33 | "the stronger man of the two" | "the better man of the two" (then "as much stronger") | "better". Butler uses two different words here. |

## Requested checks against Butler
| Item | Result |
|---|---|
| gallery (×5) | **CORRECT.** Butler has cloister(s) at exactly ¶1 (×2), 15, 32 and 33. The draft has "gallery" at exactly those five places, and no "hall" is left. ¶1's "supporting the roof of the gallery" matches B18. |
| stockman | **CORRECT.** Butler has it at ¶3, 15, 16 (vocative) and 17. The draft has "stockman" at all four and "cattle herder" nowhere. This matches accepted B20-P16–18. Philoetius is named only where Butler names him (¶20, ¶36). |
| "At this" | **CORRECT.** Butler's "On this" at ¶8 and ¶11 becomes "At this" at both, with no comma, per the GLOSSARY row (B20-P6/20/27 likewise). ¶22's "At this moment" is Butler's own wording. |
| Achaeans | **CORRECT.** ¶28, 39 and 40 all have "Achaeans", matching Butler's three. No "Greeks" is left. |
| "pavement" | **CORRECT.** ¶6 and ¶10 read "onto the pavement", as in Butler ("on to the pavement"). Live's "threshold" is gone. Butler's only "threshold" (¶1, the storeroom sill) is kept. |
| "handle-holes of the axes" | **CORRECT.** The draft has "every one of the axes’ handle-holes, one after another". "holes" is restored, "axes’" is a plural possessive (not a bare-name form), and "one after another" covers "from the first onwards". Acceptable as it stands. |
| "ripped", against Book 19 | **CORRECT.** ¶18 reads "the scar from the boar’s tooth that ripped me", which is Butler word for word. Accepted B19-P27 has "ripping him above the knee" and "the boar had ripped him". Butler writes "tooth" here, and live's "tusk/gored" is gone. |
| cupbearer | **CORRECT.** ¶9 and ¶23 read "cupbearer", matching accepted B18-P37 and P39. ¶23's "Let the cupbearer go around with his cups" parallels B18-P39. |
| mixing-bowl | **CORRECT** under PUNCTUATION §4 (D15 table, `mixing-bowl`). It appears at ¶10 and ¶24, matching B11 and B13. **Cross-Book note:** accepted **B20-P21 prints the open "mixing bowls"** (and B15-P7/8 print "mixing bowl"), so the drift is in the accepted Books, not in Book 21. The compound-drift check should flag it. This is not a Book 21 finding. |
| "foremost" | **CORRECT.** ¶14 reads "by far the foremost among them all". Live's invented "strongest" is gone. |
| "bard" | **CORRECT.** ¶38 reads "a skilled bard". This is Butler's word and matches the accepted B13, B16 and B17 usage. |
| "Great heavens!" | **CORRECT.** ¶5 has Butler's own exclamation, and live's "Good heavens" is gone. The accepted books keep "Good heavens" only where Butler writes it (B16-P34). |
| papyrus gloss | **CORRECT, acceptable.** Butler's "a ship’s cable of byblus fibre" becomes "a ship’s cable made of papyrus fiber". Byblus is papyrus, so this is accurate. It is a word for the thing, not a description (D29's "forced" class), and no accepted Book meets the word. It replaces the word rather than adding to it, which is proportionate for a listener. |

## Quotation structure, punctuation, names
- **Speaker tags.** Every place where Butler interrupts a speech with a tag (¶3, 5, 17, 27, 28, 29) keeps the tag in the same position. ¶5's comma-continuation ("he exclaimed, “Jove…") becomes a full stop and a capital, per PUNCTUATION §3. No tag is moved in a way that changes who is speaking. The nested speech in ¶28 is one ‘…’ pair, closed inside the outer ”. Every paragraph balances in both source and draft, so D4 does not apply.
- **Colons and semicolons.** One colon is added, at ¶20 (a finding). No semicolons are added: the draft has 0 against Butler's many. Butler's colon at ¶27 falls before a new subject ("none of you") and becomes a full stop, which is within §6.
- **Dashes.** All are unspaced, and there are no spaced dashes. Eight em dashes stand where Butler has a comma or semicolon (¶2, 5, 12, 20, 27, 28, 30, 33). All come from live, and each marks a resumption, a list or a comma splice in the way accepted B18–B20 do. They are not findings.
- **Names.** There is no bare "Odysseus’" and no ASCII quote. No Ulysses, Minerva, Jove, Saturn, Hercules or Euryclea is left. Mycene → Mycenae at ¶5 follows D13 (the city). Eurycleia appears at ¶34–35. The title matches Butler's apart from the mapping. "Lapiths" is a finding.
