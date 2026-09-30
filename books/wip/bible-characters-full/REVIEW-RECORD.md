# Review record

**Status of the package: content accepted / handed off — not published.** Independence caveat, stated up front: the author (this session, which built the rulebook, arbitrated disagreements and applied fixes) and every adjudicator/reviewer are Claude model sessions. The reviewers were *separate sessions* that did not write the rules and, in the blind passes, were never shown the author’s or another adjudicator’s answer; they are independent of the authoring process, not of the model family. A human spot check by Anders or the coding window is still worth doing on the policy questions listed in README.

## What was reviewed, by whom, and what it found

| Stage | Scope | Who | Result |
|---|---|---|---|
| 1. Adjudication pass 1 | 957 ambiguous KJV occurrences, 16 shards. Each answer must quote 3–8 words copied exactly from the verse; a checker rejects answers whose quote is not an exact substring, whose card is not a candidate, or whose reason repeats. A first pilot that bulk-labelled with a shell one-liner was thrown away and re-run under the quote rule. | adjudicator sessions | 957 decisions |
| 2. Blind re-adjudication | 527 Jacob/Israel-family and other calls that first-pass adjudicators made inconsistently, re-decided blind under policy addendum 2 (10 shards). | separate adjudicator sessions | disagreements arbitrated by the author (5 KJV overrides, see `decs` list in RULINGS) |
| 3. Transfer | KJV decisions carried to web/bsb/webc by verse identity + name form + ordinal; anything whose count or candidate set differed was adjudicated in place (13 shards, 700 occurrences). | adjudicator sessions | ambiguous occurrences: kjv 957, web 941, bsb 1,018, webc 1,447 |
| 4. Independent blind review — identity | Every ambiguous occurrence **and** every context-pattern decision of an ambiguous family, all four editions (88 shards, 6,899 occurrences). Reviewers saw text + candidate cards + policy only. | reviewer sessions (not the adjudicators) | agreed 6,862 of 6,897 (99.49%); 35 disagreements left — all in `RULINGS.md` |
| 5. Link sample audit | Random + per-card stratified links: kjv-en 538, web-en 537, bsb-en 534, webc-en 423 = 2,032 links (≥300 per edition). Each shown with its verse and asked OK/BAD. | audit sessions | 15 flagged (kjv-en 3, web-en 7, bsb-en 2, webc-en 3); 13 fixed by rule, 2 kept as contested |
| 6. Completeness sample | 20 characters per edition (two reviewers × 10). Reviewers counted every occurrence of the name forms in the pinned text with their own regex and matched them to links by offset. | completeness sessions | see below |
| 7. Structural verification | Hashes, paragraph hashes, UTF-16 offsets = text, unknown ids, identical/partially-overlapping spans, first-mention and snapshot ordering (a second implementation, run on the file as committed). | author (independent second implementation of `verifyCharacters` rules) | 0 errors in all four editions; `review/structural-verification.json` |
| 8. App verifier | `verifyCharacters`, `resolveCharacter`, `releasedCard` from main, run on the candidate for all four editions (scratch copy with only the `characterReleases.bible.editions` line extended). | author | all four editions verify; every mention resolves to its own card (0 null, 0 wrong); highlights → null; every snapshot reveal boundary correct. Details in `INTEGRATION-NOTES.md` |

## Link sample audit (stage 5)

All 2,032 verdicts, with the quoted evidence, are in `review/link-sample-verdicts.jsonl`. The 15 items flagged BAD and what was done:

| id | ref | name | was linked to | auditor’s reason | disposition |
|---|---|---|---|---|---|
| kjv-en|737.2.821 | Isaiah 58:14 | Jacob | `jacob` | Prophetic promise to the people; Jacob stands for Israel's inheritance | Fixed: Isa 58:14 unlinked in all editions (people’s heritage). |
| kjv-en|1045.0.147 | Acts 27:1 | Augustus | `caesar-augustus` | Augustus here names an imperial cohort, not the emperor of Luke 2. | Fixed: rule NONE Acts 27:1. |
| kjv-en|1188.4.228 | Revelation 21:22 | the temple | `the-temple` | No physical temple; God and the Lamb themselves are the temple. | Fixed: Rev 21:22 temple dropped. |
| web-en|4.4.194 | Genesis 4:22 | Cain | `cain` | Tubal-Cain, descendant of Lamech, is a different man | Fixed: Tubal-Cain unlinked. |
| web-en|208.2.296 | Joshua 21:13 | Aaron | `aaron` | Priestly clan/descendants of Aaron, not the man himself | **Kept (contested)**: “children of Aaron the priest” = descendants named by patronymic. |
| web-en|408.2.670 | Ezra 5:14 | the temple | `the-temple` | pagan temple in Babylon, not Jerusalem's temple | Fixed: temple of Babylon dropped. |
| web-en|709.1.352 | Isaiah 30:7 | Rahab | `rahab` | Rahab here is symbolic name for Egypt, not Jericho woman | Fixed: Rahab of Isa 30:7 (Egypt) unlinked. |
| web-en|975.0.418 | Luke 2:4 | David | `david` | Dynasty phrase 'house and family of David', not David personally | Fixed: “house and family/lineage/line of David” unlinked in all editions. |
| web-en|976.4.563 | Luke 3:25 | Nahum | `nahum` | Nahum in Jesus' genealogy is an obscure ancestor, not the prophet | Fixed: Luke 3:25 Nahum unlinked. |
| web-en|1077.8.540 | 1 Corinthians 15:45 | Adam | `adam` | 'The last Adam' is Christ, not the first man | Fixed: “the last Adam” not linked (rule applies to all editions). |
| bsb-en|775.19.4 | Jeremiah 30:9 | David | `david` | Future king raised up; not the historical David, ambiguous | **Kept (contested)**: “David their king” (Jer 30:9). |
| bsb-en|976.25.54 | Luke 3:25 | Nahum | `nahum` | Ancestor in Jesus' genealogy, not the prophet Nahum | Fixed: Luke 3:25 Nahum. |
| webc-en|388.0.800 | 2 Chronicles 21:6 | Ahab | `ahab` | Dynasty/family house of Ahab, not the man | Fixed: “Ahab’s house” = dynasty. |
| webc-en|400.3.45 | 2 Chronicles 33:14 | David | `david` | City of David is a place, not the man | Fixed: “David’s city” = place. |
| webc-en|976.12.281 | Luke 3:25 | Nahum | `nahum` | Nahum here is an ancestor in Luke's genealogy, not the prophet | Fixed: Luke 3:25 Nahum. |

Each *class* of error the audit found was then searched for across the whole Bible, not just the sampled item: possessive/dynastic “X’s house”, “X’s city”, “city of his father David”, “house of your servant David”, “like that of Jeroboam”, the “last Adam”, Nahum in Luke 3, Rahab, Augustus, Solomon’s porch/colonnade and the temple cards. The 0.74% flag rate describes the audited candidate; after the class-wide fixes the only known flagged items still linked are the two contested ones.

## Completeness sample (stage 6)

Reports: `review/completeness/comp_<edition>_{A,B}.md`. The reports were written against the candidate as it stood before the fixes below.

| Report | Missed | Wrong link | What was done |
|---|---|---|---|
| kjv A (david, moses, jesus, abraham, simon-peter, saul-paul, pilate, judas-iscariot, mary-magdalene, herod-the-great) | 2: Zech 12:8 David (already linked in the final package), John 1:41 “Messias” | 10: “seed/sons of David” ×5; “Christ” by false claimants ×5 | John 1:41 linked; the 10 unlinked (verse rulings) |
| kjv B (isaac, solomon, samuel, elijah, isaiah, jeremiah, stephen, barnabas, hezekiah, nebuchadnezzar) | 1: 1 Chr 6:33 “Shemuel” | 0 firm (Solomon’s porch inconsistency) | Shemuel linked; Solomon’s porch unlinked everywhere |
| web A | 1: 1 Thess 1:10 “--Jesus” | 0 firm; 2 borderline (David’s tower, “house and family of David”) | the scanner now reads a name after “--”; both borderline cases unlinked |
| web B | 0 | 2: Solomon’s porch Acts 3:11; Jeremiah 52:1 | both unlinked |
| bsb A | 1–3: John 1:41 “Messiah”; John 4:25 (borderline); Matt 1:23 Immanuel (optional) | 1: Acts 13:22 “After removing Saul” → Paul | John 1:41 linked; Acts 13:22 → `saul-king`; 4:25 and Immanuel declined |
| bsb B | 0 | 4: “Solomon’s Colonnade” ×3; Jeremiah 52:1 | all unlinked |
| webc A | 1: Luke 22:3 “Iscariot” epithet | 63 + 6 borderline: “David’s city” ×46, “David’s house” ×17 … | possessive forms unlinked like their “city/house of David” counterparts; Luke 22:3 one span |
| webc B (samuel, elijah, isaiah, jeremiah, judith, holofernes, tobit, tobias, susanna, judas-maccabeus) | 0 | 1: Jeremiah 52:1 | unlinked |

In all eight reports every link sat on a counted occurrence of the character’s name (the only ‘extra’ form is the intended Barnabas “Joseph/Joses” at Acts 4:36). Checked characters had their unlinked occurrences classified as correct exclusions (tribe/nation, other men of the same name, dynasty/place); the exclusion lists are in the reports.

## Changes made after the audits (and how they were re-checked)

The audited candidate and the accepted package differ by the following link changes (full list in `review/post-audit-changes.json`):

|  | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| Links in audited candidate | 9,976 | 10,057 | 11,072 | 11,042 |
| Links removed | 31 | 35 | 43 | 130 |
| Links added | 3 | 4 | 5 | 2 |
| Links in accepted package | 9,948 | 10,026 | 11,034 | 10,914 |

Added links (all): kjv-en: 1 Chronicles 6:33 'Shemuel'→`samuel`, Luke 22:3 'Judas surnamed Iscariot'→`judas-iscariot`, John 1:41 'Messias'→`jesus`; web-en: Genesis 46:6 'Jacob'→`jacob`, Luke 22:3 'Judas, who was surnamed Iscariot'→`judas-iscariot`, John 1:41 'Messiah'→`jesus`, 1 Thessalonians 1:10 'Jesus'→`jesus`; bsb-en: Numbers 34:23 'Joseph'→`joseph-patriarch`, Mark 2:15 'Levi'→`matthew-apostle`, Luke 5:28 'Levi'→`matthew-apostle`, John 1:41 'Messiah'→`jesus`, Acts 13:22 'Saul'→`saul-king`; webc-en: Luke 22:3 'Judas, who was also called Iscariot'→`judas-iscariot`, John 1:41 'Messiah'→`jesus`.

Every changed occurrence was re-read individually after the change (rulebook diff of all four editions before/after each rule edit), and a **cross-edition consistency scan** was run at the end: for every verse and name form the set of linked cards was compared across the four editions. Only 4 verse/name pairs differ, all because the translations word the verse differently (Num 34:23 “Manasseh son of Joseph” is a patronymic in BSB only; 2 Sam 6:10 and 1 Chr 13:13 name David as a person in KJV/WEB/WEBC but by pronoun in BSB; 1 Kings 15:6 names Rehoboam in KJV/WEB/WEBC but “the houses of Rehoboam and Jeroboam” in BSB). The scan also found the BSB “Levi’s house” gap (Mark 2:15, Luke 5:28), fixed.

Author rulings on reviewer disagreements: KJV 143.5.311 and 143.7.237 (Num 26:28, 26:37 tribal), 900.3.685 (Mic 7:20), 583.4.140 and 583.4.173 (Ps 105 parallelism) → NONE; `webc-en|1228.8.102` (Judas in 1 Macc 8) → `judas-maccabeus` after the validator rejected an adjudicator’s `jonathan-maccabeus`; `web-en|33.3.536` (Gen 33:20 altar name) → NONE; `bsb-en|151.12.68` (Num 34:23 “Manasseh son of Joseph”) → `joseph-patriarch`; brothers of Jesus at Matt 13:55 / Mark 6:3 → `jude-apostle` in every edition.

## Not reviewed / known limits

- The lexicon covers person **name forms** (222 forms, `name-forms.json`). Epithets and descriptions that name a person without the name (“the son of Jesse”, “the Baptist” alone, “the disciple whom Jesus loved”) are not linked, by the “name and its variants, not pronouns” rule.
- The eight completeness reviewers sampled 20 characters per edition, not all 175. The other cards are covered by the same rulebook and the cross-edition scan, but were not counted independently.
- One occurrence (`bsb-en|977.11.12`, Luke 4:13) has no reviewer line (see RULINGS).
- New Catholic cards (26) got the same identity review as everything else; their **card texts** (name/subtitle/body) were written for this package and have a spoiler-safe reveal chain but no separate editorial review beyond the author’s.

