# Book 16 — independent fidelity review (b16-draft.json)

**Verdict: BLOCKING FINDINGS.** There are 32 findings: 3 blocking and 29 non-blocking. They are in `b16-fidelity.json`, written by `fid16_write.py`, which checked every `old` string and confirmed it is exact and unique in its paragraph. Applying all 32 findings to the draft runs cleanly.

I read all **45 of 45** paragraphs against `source-book16.json` (Butler, PG #1727), in packets of 6 or 7 with the neighbouring paragraphs, and then re-read the whole Book for continuity. I read every paragraph the notes label CONVENTIONS or KEPT as well. `b16-draft.json` is byte-identical to `book16/candidate-v1.json`. I compared recurring phrasing with accepted Book 14 (`candidate-accepted.json`) and with the parallel lines in accepted Books 1, 3, 4, 9–13.

## Blocking findings
| ¶ | Draft | Butler | Fix |
|---|---|---|---|
| 21 | "I am who I am—after long wandering…" | "Such as I am, it is I, who after long wandering…" | "Such as I am, it is I who, after long wandering and great hardship, have come home…" The draft turns Odysseus's claim of identity into a tautology. The tautology echoes the divine self-naming of Exodus, and it comes three paragraphs after he says "I'm no god". |
| 22 | "What ship brought you here to Ithaca, dear father? What crew did they claim to be? You certainly couldn't have come on foot." | "In what ship, my dear father, did your crew bring you to Ithaca? Of what nation did they declare themselves to be—for you cannot have come by land?" | The question about nationality is lost, "What crew did they claim to be?" is nonsense, and "certainly" is added. The fix uses the formula fixed by accepted B01-P012 and B14-P009 ("what people they said they were … you can't have come here by land"). |
| 38 | "Now you're consuming his property without payment, courting his wife, and trying to kill his son." | "…without paying for it, and break my heart by wooing his wife and trying to kill his son." | Penelope's "break my heart" is omitted. This is a paragraph the drafter repaired. |

## The 15 claimed repairs, checked against Butler
**What actually changed:** diffed against `live-baseline-book16.json` with quote typography normalized, exactly the 15 claimed paragraphs differ from live (¶2, 3, 4, 5, 7, 8, 9, 12, 22, 24, 31, 34, 35, 37, 38). The 25 CONVENTIONS paragraphs are identical to live apart from typography, and so are the 5 KEPT paragraphs (¶16, 30, 33, 40, 44). 15 + 25 + 5 = 45. The labels are accurate as descriptions of what changed. They are not a verdict on fidelity: 19 of the 32 findings fall in 13 CONVENTIONS or KEPT paragraphs (¶1, 10, 11, 17, 21, 23, 26, 27, 28, 30, 33, 43, 44), including blocking ¶21.

| Claim | Result |
|---|---|
| ¶2 "his master", "beautiful eyes" | **CORRECT.** Butler: "made towards his master … both his beautiful eyes"; "young" was invented. |
| ¶3 "light of my eyes that you are", "into the country to see us herdsmen" | **CORRECT.** Also "So you've come" for Butler's "So you are come" (live's "come back" was an addition). |
| ¶4 "So be it, old friend", "without bedding" | **CORRECT.** Both are Butler's. |
| ¶5 "continually" | **CORRECT.** |
| ¶7 "bowls of ivy-wood" | **CORRECT.** The same paragraph's "on foot" has a separate non-blocking finding. |
| ¶8 formula, "real truth", "a Cretan", "suppliant" | **CORRECT.** "To this you answered, swineherd Eumaeus," matches B14-P003/P009/P018/P024 exactly. "My boy" for Butler's "My son" has a separate non-blocking finding. |
| ¶9 "insolent" | **CORRECT.** Butler: "they are very insolent". "insolent" occurs in ¶9, ¶10 ("insolently") and ¶38; the notes' "P15" reference is wrong. "tunic" has a separate non-blocking finding. |
| ¶12 "wasting the flesh off his bones" | **CORRECT.** |
| ¶22 "half-fledged" | **CORRECT.** But the same paragraph's question is blocking (see above). |
| ¶24 "council" | **CORRECT.** Butler: "in the field and in council". The draft then renders the suitors' own "held a council" at ¶30 as "held a meeting" (non-blocking finding). |
| ¶31 "Telemachus's" | **CORRECT.** Butler writes "Telemachus's". "Friends" and the dropped "very" have a non-blocking finding. |
| ¶34 "Good heavens" | **CORRECT.** It is Butler's own phrase, and live's "Damn it" was a register defect. |
| ¶35 "speaking to them plainly and in all honesty" | **CORRECT.** It is the GLOSSARY Book 2 formula (Butler's "in all honestly" is a PG slip, rightly read as "honesty"). |
| ¶37 "roof of the gallery" | **CORRECT.** Butler's "cloister" → "gallery" per GLOSSARY. |
| ¶38 "insolent and wicked", "counselor" | **CORRECT.** But the paragraph still omits "break my heart" (blocking). |

## The recognition scene (¶14–¶22)
- **Held and correct:** Athena's "beautiful, tall, and wise" matches B13-P025. "Odysseus, noble son of Laertes" is kept. The transformation in ¶16 is faithful, and so is "I'm no god … I am your father" in ¶18. The tear held back in ¶19, the mortal/god reasoning in ¶20 and the eagles/vultures simile in ¶22 are faithful too.
- **Defects:** ¶21 "I am who I am" (blocking). ¶22's question (blocking). ¶17 "your appearance has completely altered" for Butler's "your colour is not the same", which loses the echo of ¶16 "restored his color". ¶17 "fine gold" for "wrought gold" (B13 prints "worked gold"). ¶21 "great goddess" for "redoubtable" (the accepted Books print "formidable").

## The suitors' council (¶29–¶39)
- **Held and correct:** "Eurymachus, son of Polybus" and "Antinous, son of Eupeithes". The ¶33 "At this" is the correct rendering of "On this". The numbers and the genealogy (Amphinomus, son of Nisus, son of King Aretias; Dulichium) are all kept. Antinous's plan in ¶34 keeps its sequence: ambush, then division of property, then the alternative of gifts from each man's own house. Eurymachus's false oath and the narrator's unmasking in ¶39 are faithful.
- **Defects (non-blocking):**
  - ¶30 "held a meeting" and "outer courtyard". The accepted Books keep "council" and "outer court".
  - ¶34 drops the hedge "never likely", and turns "whose lot it is to win her" into "has the best luck".
  - ¶35 "terrible" for "heinous", and "Friends" for "My friends" (also at ¶31).
  - ¶37 "scolded" for "rebuked".
  - ¶29 and ¶33 "weapons" for Butler's "armour". Accepted B04-P071 has "armor" in the same ship scene.

## Structure, names, conventions
- The script `fid16_chk.py` found, per paragraph:
  - the source's “ ” ‘ counts, and whether a paragraph opens with “ and closes with ”, are preserved in all 45 paragraphs;
  - no ASCII ' or ";
  - no spaced em dash;
  - no bare "Odysseus’".
- No speech spans a paragraph break in this Book, so D4 does not arise here, as the notes say.
- Names map in equal counts: Ulysses→Odysseus, Minerva→Athena, Jove→Zeus, Mercury→Hermes ("Hermes's hill", ¶42). Arceisius, Laertes, Dulichium, Same, Zacynthus, Thesprotian, Taphian, Clytius, Medon, Amphinomus, Nisus, Aretias, Eupeithes, Polybus, Icarius, Achaeans and Phaeacians are unchanged. "heaven" has the same count in every paragraph. All numbers are kept (52, 6, 24, 20, 12, twentieth year, ten years).
- **Cross-Book formulas, held:** "To this you answered, swineherd Eumaeus,"; the helping-themselves formula in ¶7 (matches B14-P025); "outcome rests with heaven"; "tell you the truth".
- **Cross-Book formulas, inconsistent (non-blocking findings):**
  - "on foot" for "by land" at ¶7 (B01/B14 print "by land").
  - "remember this carefully" for "Furthermore I say, and lay my saying to your heart" at ¶27 (B11-P037 prints "Furthermore I say—and take my words to heart—").
  - "the nobles" for "the chiefs" at ¶11 (B01-P016).
  - "tunic" for "shirt" at ¶9.
  - "gift of sleep" for "boon of sleep" at ¶44 (B04-P022).
- **Observed, not raised (to avoid churn):**
  - Butler's two "whereon" (¶6, ¶14) are rendered "and" / "so", not GLOSSARY's "at that". Accepted Book 14 is itself mixed (1 of 5 "At that").
  - ¶14 "put on his sandals" for "took his sandals, bound them to his feet".
  - ¶16 drops "fair" from "fair clean shirt".
  - ¶27 "weapons" for "armour", where the hiding context reads naturally.

## Other non-blocking findings (meaning)
- ¶1: "being friendly" breaks Butler's repeated "fawning".
- ¶8: "My boy" for "My son".
- ¶10: the passive drops "men dragging" the serving women and softens "unseemly", and "wine wasted" replaces Butler's "drawn".
- ¶11: "enemies" for "marauders".
- ¶23: "destruction" softens "killing", and the "list … who, and how many" is reduced to a count.
- ¶24: "regret coming here for revenge" for "rue your coming, and your revenge".
- ¶26: "certainly" is added and "a couple of" is dropped.
- ¶27: "has come" for "is at hand".
- ¶28: "my character" is added, and "freely" replaces "with impunity".
- ¶43: "though" for "so that", which loses the deliberate concealment.

**Counts:** 45/45 paragraphs read. 32 findings: 3 blocking (¶21, ¶22, ¶38) and 29 non-blocking. All 15 claimed repairs are correct against Butler. **Verdict: BLOCKING FINDINGS.**
