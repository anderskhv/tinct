# Book 19 — independent fidelity review (b19-draft.json)

**Verdict: BLOCKING FINDINGS.** There are 32 findings: 8 blocking and 24 non-blocking. They are in `b19-fidelity.json`, written by `fid19_write.py`, which checked that every `old` string occurs exactly once in its paragraph of the draft. Applying all 32 findings runs cleanly.

I read all **39 of 39** paragraph pairs against `source-book19.json` (Butler, PG #1727). I read them in packets of 5 to 8, with the neighbouring paragraphs alongside. Then I re-read the whole Book for continuity. `b19-draft.json` is byte-identical to `book19/candidate-v1.json`. All 39 paragraphs are new drafting, so I checked each one line by line for omissions, additions and meaning changes. I compared recurring phrasing with accepted Book 18, and also with Books 2, 3, 4-v6, 10, 11, 16 and 17 where Butler repeats himself.

## Blocking findings (8)
| ¶ | Issue |
|---|---|
| 12 | The draft has "his people prosper under him", but Butler has "his people do good deeds under him". This changes the meaning, although the notes claim the clause was kept. |
| 22 | The draft has "he alone has kept you", but Butler has "he has prevented you **alone**". Butler's "alone" is on Odysseus, the only one kept from home, and the draft moves it onto Zeus. |
| 13 (×3) | The weaving trick diverges from accepted **B02-P005**, where Butler's words are identical. B02 prints "embroidery frame / fine needlework / skill in needlework perish unrecorded / a pall for the hero Laertes / without a pall". The draft prints "loom / weaving / go to waste / a shroud for old Laertes / without a shroud". The notes say there was "no prior row", which overlooks the accepted Book. |
| 21, 27 | Two instances of the bare possessive `Odysseus’` violate GLOSSARY hazard 3, which is build-asserted: the form must be `Odysseus’s`. |
| 27 | The dawn formula is left in Butler's order. The fixed form is "When Dawn, the rosy-fingered child of morning, appeared," as in B10, B12, B13, B15 and B17. |

## Non-blocking findings (24)
- ¶0: the B16 echo is only partial (details below).
- ¶1: "rooms" should be "room".
- ¶7: "lovely" is added.
- ¶9: "abominably" is softened to "badly".
- ¶10: "waiting-woman" should be "waiting woman", as in B17.
- ¶12 (×2): the draft drops "dare", compares her fame rather than Penelope herself to the king, adds "without fail", and has "good rule" for "virtues".
- ¶13 (×2): the draft has "seasons turned" for "waning of moons", "worthless maids" for "hussies", and drops "the stitches".
- ¶14: "am called" becomes "was called", and "hence" is dropped.
- ¶15: "cunningly" becomes "carefully".
- ¶16 (×2): the formula "lay my saying to your heart" becomes "mean it seriously", and "like-minded" does not parse.
- ¶18: "disfigure" becomes "wear yourself down".
- ¶19: a comma continues the speech after the tag, which PUNCTUATION §3 normalizes to a full stop.
- ¶20: "foresworn" should be "forsworn".
- ¶21: "propriety" and "in all things" are lost.
- ¶24 (×2): "basin" for "cauldron", and "liar" for "perjurer".
- ¶25: the name-quote structure is lost (below).
- ¶27: the scar is dropped from the last line of the story.
- ¶33: "a little longer" for "briefly".
- ¶35 (×2): the formula differs from B11, and "fatuous" becomes "deceptive".

## Requested checks
| Item | Result |
|---|---|
| ¶0 reuses the armor-removal wording of B16-P27 | **PARTIAL.** Butler's span from "say that you have taken it … to use them" is word-identical in the two Books. The draft keeps B16's "gather … weapons", "stained and blackened with soot", "Add especially", "disgrace both the feast", "the sight of weapons sometimes tempts people to use them". It differs in "went away"/"left", "set them quarreling … and that they might do each other some harm that would disgrace"/"make them quarrel … and harm each other, which would disgrace", and "wooing"/"courtship". The non-blocking finding aligns the draft to B16. The draft's own wording is closer to Butler, so the other option is a B16 successor, but the echo should read identically. |
| Cnossus, Ilithuia, Pelasgi | **CORRECT.** Each occurs once, exactly as in Butler. Knossos, Eileithyia and Pelasgians are absent. Eteocretans, Amnisus, Aethon and Deucalion are also kept as Butler spells them. "Cape Malea" matches accepted B09-P3. |
| Title | **CORRECT.** The mapping gives Ulysses→Odysseus (×3) and Euryclea→Eurycleia. American spelling gives armour→armor and recognises→recognizes, as in B17's title. The internal em dashes are unspaced and Butler's wording is otherwise unchanged. |
| hecatombs → sacrifices (¶22) | **CONSISTENT.** Butler has "finer hecatombs" and the draft has "finer sacrifices". This is the B03-P6 pattern ("goodly hecatomb" → "fine sacrifice"), in which Butler's adjective stands in for "great". There is no number and no loanword. B04-v6's "great and holy sacrifices" renders "holy hecatombs", where there is no adjective of size, so it does not conflict. |
| loom / shroud (¶13) | **NOT CONSISTENT** (blocking, above). The same Butler speech is accepted at B02-P005/P006 as "embroidery frame", "needlework", "pall" and "unpick the stitches". "web" is kept in both Books. |
| Nested quotations | **CORRECT** at these points. In the weaving-trick speech (¶13), the outer “ ” encloses the inner ‘Sweethearts … without a shroud.’, closed before "That's what I told them". In the geese dream (¶33), ‘Be of good courage,’ he said, ‘daughter of Icarius … disgraceful end.’ closes before "At this I woke", and the outer quote closes at "as usual.”". **¶21** keeps two separate quoted spans, the address to Odysseus and then “Come here,” she said, “Eurycleia, …”, as in Butler. **¶32→33**: ¶32 ends on "said:" and ¶33 opens with “ and closes with ”, exactly as in Butler. This is not a case of the unclosed-quote convention, and none occurs anywhere in this Book in either the source or the draft. |
| ¶25 quote-count mismatch (coordinator) | **CONFIRMED, and it is the only paragraph with a mismatch.** The source counts are 2/2/1 and the draft's are 2/2/0 for “ ” ‘. Butler writes: so name the child ‘Ulysses,’ or the child of anger. The draft drops the single quotes that mark the name as a word, and the "or" that introduces the etymology. This is not a speaker error, because the mark is a name mention and not nested speech. I have therefore filed it as a non-blocking convention finding that restores ‘Odysseus,’ or. |
| Boar-hunt scar story (¶24–¶28) | **COMPLETE.** It covers the scar and the danger of recognition, and Autolycus the thief and perjurer with Hermes's gift (but see the "liar" finding). It covers the naming scene, the Parnassus visit and Amphithea, the five-year-old bull and the feast until sundown, and dawn. It covers the upland valleys, Oceanus, the dell, the hounds, the lair (wind, rain and sun kept out, the fallen leaves), the bristles and the fire in the boar's eyes, the side-charge, and the wound above the knee that did not reach the bone. It covers the spear through the right shoulder, the binding, the spell, the healing, the presents, the return, and the account to his parents. The one loss is the word "scar" in the last line (non-blocking finding at ¶27). |

## Mechanical checks
- There are no ASCII quotes and no spaced em dashes; the one spaced dash is in the "Book 19 — " title prefix.
- No Roman name survives, and neither do cloister, towards, or British -our or -ise forms.
- Ops and Arete do not occur, and neither do Rhea or Helios.
- Paragraph count is 39 = 39. The quote-glyph counts match the source in every paragraph except ¶25.
- The draft has 5,643 words against Butler's 5,989.
- ¶4 renders Butler's "whereon" as "At this" (GLOSSARY: `whereon` → "at that"). As the Book 18 review noted, accepted Books 14–18 render it in mixed ways, so it is not raised as a finding.
