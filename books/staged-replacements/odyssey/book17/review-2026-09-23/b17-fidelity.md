# Book 17 — independent fidelity review (b17-draft.json)

**Verdict: BLOCKING FINDINGS.** There are 21 findings, 3 blocking and 18 non-blocking, all in `b17-fidelity.json`. `fid17_write.py` wrote the file and confirmed that every `old` string is exact and unique in its paragraph. Applying all 21 findings to the draft runs cleanly.

I read all **63 of 63** paragraphs against `source-book17.json` (Butler, PG #1727), in packets of 8 to 10 with the live baseline beside them. That includes all 20 paragraphs the notes mark KEPT. I then re-read the whole Book for continuity. `b17-draft.json` is byte-identical to `book17/candidate-v1.json`. I compared recurring phrasing with the previous accepted Book (`book16/candidate-accepted.json`) and with the parallel lines in accepted Books 1, 3, 4, 7, 8, 10, 14 and 15.

**The counts are accurate.** I diffed against `live-baseline-book17.json` with quote typography normalized. Exactly 43 paragraphs differ, and the other 20 (¶7, 9, 11, 12, 13, 15, 16, 17, 22, 32, 33, 39, 40, 46, 51, 57, 58, 59, 60, 61) are identical to live. That list matches the notes' KEPT list exactly.

## Blocking findings
| ¶ | Draft | Butler | Fix |
|---|---|---|---|
| 8 | "drew up a polished table" | "drew a clean table" | "a clean table". This is the fixed hospitality formula, printed "clean table" in B01-P010, B04-P005, B07-P015, B10-P028 and B15-P010. "polished" is invented. |
| 10 | "By Zeus, Athena, and Apollo" | "By father Jove, Minerva, and Apollo" | "By father Zeus…". The draft drops "father", and accepted B04-P027 prints this same speech with it. |
| 10 | "A doe might as well lay her newborn fawns in a lion's den, then go off to graze in the forest or meadow." | "A hind … new-born young in the lair of a lion … in the forest or in some grassy dell" | Restore "grassy dell" and echo B04-P027 ("A hind … new born young in the lair of a lion"). |

## The claims I was asked to check
- **Lacedaemon (¶10): CORRECT.** Butler writes "Lacedaemon", and live's "Sparta" substituted a different name. Accepted B04, B13 and B15 print Lacedaemon where Butler does.
- **Aegyptus (¶41): CORRECT.** Butler writes "the river Aegyptus", and live's "Nile River" was a normalization. It matches accepted B14-P012, "the river Aegyptus".
- **Argives/Achaeans against "Greeks" (¶10, ¶52): CORRECT.** ¶10 now reads "so many, both Argives and Trojans", as in Butler, and keeps "all the Greeks cheered", which is Butler's own word there. Accepted B04-P027 has "Achaeans" in the same speech, but Butler's Book 4 has "Achaeans" there too, so keeping "Greeks" here is right. ¶52 "these Achaeans" is correct. No other "Greeks" appears.
- **Oxen (¶53): CORRECT.** "our oxen" is restored and "sacrificing" is Butler's word. ¶46 "his cattle" is Butler's own "cattle" and is correctly kept: the GLOSSARY row governs Butler's *oxen* and does not rewrite his *cattle*.
- **Gallery/court: CORRECT.** Butler has 7 "cloister" instances (¶2 ×2, 6, 8, 29, 50 "banqueting-cloister", 62), and all 7 are now "gallery" or "banqueting-gallery". Butler has 6 "court(s)" instances (¶23, 31, 43, 45, 47, 62), and the draft has 6 at the same places. Live's "courtyard" and "hall(s)" are gone. ¶43's "the open part of the court" matches the GLOSSARY bracket row.
- **Softened insults: all 3 CORRECT.** ¶47 "the servants shall flay you alive", ¶35 "You precious idiot" and ¶21 "You ill-conditioned cur" are each Butler's exact insult. Live's invented "Listen to this!" is gone.
- **Hedges and concrete details: CORRECT, except ¶43.** I verified each of these against Butler:
  - ¶0: "a drink and a piece of bread", "so much the worse for him"
  - ¶4 and ¶5: "full and sufficient" (matches B04-P047)
  - ¶23: "outer court", "double folding"
  - ¶24: "indeed"
  - ¶25: "heed"
  - ¶26: "hares"
  - ¶27 and ¶28: "hound", "half the goodness"
  - ¶31: "rule and line"
  - ¶36: "birth is good", "healer of hurts", "seer"
  - ¶37: "bitterest"
  - ¶38: "I bid you take it"
  - ¶41: "roving robbers", "it pleased Zeus"
  - ¶42: "gleam of armor" (matches B14-P013), "spread panic", "great man"
  - ¶44: "my fine sir"
  - ¶48: "tramp"
  - ¶50: "darkness of death"
  - ¶56: "insolence"
  - ¶3: "Light of my eyes"

  **¶43 is wrong.** Butler wrote "such a **pestilence** to plague us", not "plague to plague". The draft invents a repetition (non-blocking finding).
- **The ¶19 connective: the judgment is wrong (non-blocking finding).** Butler has 5 sentence-opening "On this" (¶2, 19, 35, 44, 62). The draft renders 4 of them as "At this" and drops the one at ¶19. The notes say the no-comma rule forbids "At this,". That is a misreading: the rule forbids *adding* a comma, and at ¶19 the comma is Butler's own, closing off "as he passed". Accepted B10-P044 prints "At this, many dead men's ghosts" for Butler's "On this, many dead men's ghosts". GLOSSARY renders one "At this" per Butler instance, and the connective carries the fact that the kick answers his speech. Fix: "At this, as he passed, he kicked Odysseus…".
- **The unclosed quotation at ¶41→¶42: CORRECT.** ¶41 opens with “ and has no closing mark. ¶42 opens with a fresh “ and closes at "great misery.”" The open/close quote counts in every paragraph match the source.

**Two claims in the notes are false.** The Book 4 connective conventions are otherwise applied correctly: ¶6 and ¶34 ×2 print "At that", and ¶40 "on which" is relative and correctly untouched.
- ¶10: the notes say "whereon he said" became "At that he said", but the draft prints "Then he said". It also flattens "the whole truth" to "everything". Non-blocking finding.
- ¶49: the notes list it as an "On this" paragraph, but Butler has none there.

## Consistency with the previous accepted Book (16) and earlier Books (non-blocking)
- **Bearing-post (¶2, ¶8, ¶31):** B16-P037 has "one of the pillars supporting the roof of the gallery", and so do B01-P009 and B08-P004, P041 and P043. The draft reverted live's "pillar" to a new term, "post".
- **Station (¶15, ¶17):** Accepted Book 16 calls Eumaeus's place "station" (B16-P008, P009 ×2, P014). The draft keeps "station" for Melanthius at ¶18 but uses "farm" and "farmhand" for Eumaeus's station.
- **"I understand and heed" (¶25):** B16-P012 renders the same formula "I understand and will obey".
- **"congratulate you" (¶13):** B15-P044 prints this formula as "congratulate you". The draft's "call you blessed" is a KEPT paragraph that brings in a scriptural colouring.
- **"carver" and "seat" (¶30):** The accepted Books keep "carver". Butler's "seat" became "stool", which blurs it with Antinous's footstool.
- **Menelaus's speech (¶10):** This is a near-verbatim repeat of Book 4. Accepted B04-P027 keeps "short shrift and a sorry wedding".
- **Matches the accepted Books:** "To this you answered, swineherd Eumaeus" (¶52, ¶58) matches B14 and B16, "shirt" matches, "At this" with no comma matches, and "pitcher" and "senior servant" in ¶8 and ¶22 match.

## Other non-blocking findings
- ¶14: Medon's "Dinner is not a bad thing, at dinner time" loses its deliberate repetition.
- ¶36: "public service" is dropped.
- ¶41: "accounted wealthy" became "respected".
- ¶12: "exactly" is added.
- ¶60: "bring them to a bad end" is intensified to "destroy", and the causal "for he had explained" is lost.

## Outside the paragraph format (not a finding)
The title keeps Butler's British "recognised". The body uses "recognized" (¶29), and the spelling standard is American.

## Mechanical checks (all pass)
- 63 paragraphs, 1:1 with the source.
- No straight quotes and no spaced dashes.
- No bare "Odysseus’", and "Telemachus’s" is used.
- Every Roman-name mapping count matches, and "Eurycleia" is used.
- The "heaven" count changes only at ¶52, where "heaven-taught" became "divinely inspired". That is not a name.
- Wallet → "bag" (×5) matches accepted B05-P020.
