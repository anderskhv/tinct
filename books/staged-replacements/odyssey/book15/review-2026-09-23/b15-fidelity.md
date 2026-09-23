# Book 15 — independent fidelity review (b15-draft.json)

**Verdict: BLOCKING FINDINGS.** There are 25 findings: 6 blocking and 19 non-blocking. They are listed in `b15-fidelity.json`. A script checked every `old` string and confirmed it is exact and unique in its paragraph. Applying all 25 findings to the draft also runs cleanly.

I read all **48 of 48** paragraphs against `source-book15.json` (Butler, PG #1727). I read them in packets of 6 to 10, with one neighbouring paragraph on each side, and then re-read the whole Book for continuity. `b15-draft.json` is byte-identical to `book15/candidate-v1.json`. I compared recurring phrasing with accepted Book 13 and with the parallel passages in accepted Books 2, 3, 9, 10, 11 and 12.

## Blocking findings
| ¶ | Draft | Butler | Fix |
|---|---|---|---|
| 15 | "he whipped his horses" | "he lashed his horses" | "lashed" (accepted B03-P037 keeps "lashed") |
| 15 | "Pisistratus urged his horses forward, and they flew ahead willingly enough" | "Pisistratus lashed his horses on and they flew forward nothing loth" | "Pisistratus lashed his horses on, and they flew forward readily enough", which is accepted Book 3's text for the identical line |
| 21 | "my father is Odysseus—or was, if he ever lived" | "as surely as that he ever lived" (an asseveration) | "my father is Odysseus, as surely as he ever lived" |
| 37 | "have all of you killed" | "have all of you murdered" | "murdered" (the draft softens violence) |
| 38 | "feasting with my father in his official capacity" | "as being in attendance on him" | "feasting with my father as his attendants" |
| 43 | "At this, Theoclymenus" | "On this Theoclymenus" | no comma after "At this" (binding brief rule) |

## The 19 claimed repairs, checked against Butler
**What actually changed:** diffed against `live-baseline-book15.json` with quote typography normalized, **16 paragraphs** differ: ¶1, 4, 5, 10, 14, 15, 17, 18, 19, 24, 25, 31, 33, 37, 40 and 47. The other 32 paragraphs match live except for typography. The notes' counts are internally wrong. They say "KEPT 29 / REPAIRED 19", but the notes themselves list 16 repaired paragraphs and 32 KEPT paragraphs, and 32 + 16 = 48.

| Claim | Result |
|---|---|
| ¶1 Eurymachus, not Antinous | **CORRECT.** Butler: "urging her to marry Eurymachus". "Night and day" and "well disposed toward you" are also Butler's. |
| ¶5 Hellas, ¶10 Achaeans | **CORRECT.** Both are in GLOSSARY "Names that change in no Book". ¶10 "outer court" is also correct and matches ¶15. |
| ¶33 Ctesius | **CORRECT.** Butler: "Ctesius son of Ormenus". There is no Cast entry, so D8 is silent and Butler's spelling stands. |
| ¶19 Oicleus (twice) | **CORRECT.** Butler's spelling, restored in both places. |
| ¶19 "Eos, enthroned in gold" | **CORRECT** under D5 (widened; the ledger names Aurora→Eos). It is the only Aurora in PG #1727 (line 6758), and "enthroned in gold" matches accepted B12-P011. Non-blocking finding: "Eos" appears nowhere else in the edition, which everywhere else says "Dawn", so it needs a short gloss for a listener. |
| ¶19 "dread Erinys" | **CORRECT.** GLOSSARY's Book 2 gloss row rules out "the Furies" as the Roman name. Book 2 already glossed the Erinyes, so no gloss is needed here. |
| ¶15 dawn formula | **CORRECT.** "When Dawn, the rosy-fingered child of morning, appeared" matches the GLOSSARY row and accepted B03-P037. |
| ¶15 Diocles patronymic | **CORRECT.** Book 15's Butler says "son of Ortilochus, the son of Alpheus". This differs from Book 3's Butler ("grandson to Alpheus"), and the draft keeps the difference. |
| ¶15 "willingly enough" | **INCORRECT (blocking).** GLOSSARY's row says "willingly enough", but accepted Book 3 (`candidate-v3.json` B03-P037, its `continuity.md` row and its README assertion `count('readily enough') == 2`) prints **"readily enough"** for this identical line. "willingly enough" is also Butler's own phrase for Clytemnestra at B03-P023. The same sentence also turns Butler's "lashed … on" into "urged … forward", and his first "lashed" into "whipped". Both are blocking. |
| ¶17 "thought it best" | **CORRECT.** |
| "tell me, and tell me true" → "tell me truly" | **CORRECT, but it is in ¶31, not ¶32** (Odysseus's question). ¶32 is unchanged from live. |
| ¶24, ¶40, ¶47 "hawser" | **CORRECT.** Butler has "let go the hawsers", "made fast the hawsers" and "loose / loosed the hawsers", and the draft keeps "catch hold of the ropes" distinct. Accepted Books differ from one another here: B02, B09 and B13 have "hawser(s)", while B11-P053 has "mooring ropes". Butler's word is right under D29. The notes cite "book13 ¶8", but it is ¶7. |
| ¶25 "the flying islands" | **CORRECT.** "within himself" is also Butler's. |
| ¶40 "dinner" | **CORRECT** for the first "got dinner ready". Butler's second "dinner" in the same paragraph is still "feast" (non-blocking). "mooring stones" and "made fast the hawsers" are correct. |
| ¶14 "a god" | **CORRECT.** Butler: "as though you were a god". |
| ¶4 "shirt", ¶18 "my men", ¶37 "prison" / "funny" | **CORRECT.** Each is Butler's word. |

## Quotation structure, index for index
For every paragraph, the source and the draft have the same counts of “ ” ‘, and the same answer to whether the paragraph opens with “ and whether it ends with ”. The script check is in `fid15_chk.py`. There is no ASCII ' or ", no spaced em dash, and no bare "Odysseus’".

- **Eumaeus's tale runs from ¶32 to ¶38, not ¶32 to ¶43 as the notes say.** ¶32 opens “ and ends with Butler's colon, left open. ¶33–¶37 each reopen “ and do not close it. ¶38 closes with ”. ¶39 is Odysseus's reply, a new closed speech.
- **The nested dialogue is in ¶34–¶37, not ¶39–¶42 as the notes say.**
  - ¶34: the narration's “ frames the woman's ‘I come from Sidon … price for me.’
  - ¶35: the seducer's ‘…’ sits inside the outer “.
  - ¶36: it opens “‘ exactly as Butler does, with ‘I’ll do so gladly,’ … ‘if you men …’.
  - ¶37: the woman's ‘Be quiet now … foreign lands.’ sits inside the outer “.
- ¶41–¶43 are ordinary closed speeches, as in Butler. ¶1 and ¶27 each hold a single closed speech.

## Names and hazards
Butler's names map to the draft in equal counts:
- Ulysses→Odysseus, Minerva→Athena, Jove→Zeus, Juno→Hera, Vulcan→Hephaestus, Mercury→Hermes, Diana→Artemis and Aurora→Eos.
- Hellas, Achaeans, Argives, Erinys, Apollo, Hades and all the minor names are unchanged: Melampus, Neleus, Phylacus, Antiphates, Mantius, Oicleus, Amphiaraus, Alcmaeon, Amphilochus, Polypheides, Cleitus, Hyperesia, Crouni, Chalcis, Pheae, Elis, Epeans, Syra, Ortygia, Ctesius, Ormenus, Ctimene, Arybas, Phaedimus, Piraeus and Clytius.
- "Melampus" rises from 2 to 4 because the draft names the referent where Butler's "he" was ambiguous. This is correct.
- "Greece", "Greeks", "Fury", "Oecleus" and "Ctesias" do not appear.
- "heaven" has the same count in every paragraph. All numbers are kept.

## Cross-Book consistency
- **Held:** "At this" at ¶24; "thought it best"; the dawn formula; "tell me truly"; "outer court"; "harbor"; "toward"; "drink offering(s)"; "shirt and cloak"; "enthroned in gold" (B12).
- **Inconsistent, raised as findings:** "willingly enough" versus B03's "readily enough", and "whipped" / "urged" versus "lashed" (blocking). "favorable winds" (¶1, ¶38) versus this Book's own "a fair wind" at ¶24 and B11/B12's "a fair wind". "prophet" for Butler's "seer" (B09, B10 and B11 keep "seer"). "bribes" for Butler's "gifts" (Butler writes "bribes" only in B11-P042). "With that" for "On this" at ¶38. "whereon" dropped or rendered "and" at ¶12 and ¶38 (GLOSSARY's Book 4 row says "at that", as B12-P011 does, although B11 is itself mixed).
- **Not raised:** "golden pitcher" / "senior servant" (¶10). Accepted Books differ from one another here: B01 and B04 have "pitcher" / "senior", and B07 has "ewer" / "upper".

## Records issues for the coordinator (not text findings)
1. GLOSSARY.md's Book 3 row ("nothing loth" → "willingly enough", citing B03-P037) contradicts accepted Book 3's text and its README assertion ("readily enough"). The row should be corrected so later Books do not inherit the wrong form.
2. The draft notes' repair count (19) and KEPT count (29) are wrong: the actual counts are 16 and 32. Several of the notes' index citations are also wrong: "tell me truly" is at ¶31, not ¶32; the unclosed tale runs ¶32–38, not ¶32–43; the nested dialogue is in ¶34–37, not ¶39–42; "most persistent wooer" is at ¶42, not ¶47; the patronymic chain is at ¶19, not ¶24; "shirt and cloak" is at ¶28 and ¶30, not ¶33 and ¶35; "On this" → "At this" is at ¶43, while ¶38's "On this" was rendered "With that"; and "book13 ¶8" is actually ¶7.
3. At ¶38 Butler's "On this she went back" is rendered "With that she returned". This is raised as a non-blocking convention finding, fixed to "At this", under the brief's binding "On this" → "At this" rule.
