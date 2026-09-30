# Completeness review A - webc-en (david, moses, jesus, abraham, simon-peter, saul-paul, pontius-pilate, judas-iscariot, mary-magdalene, herod-the-great)

Method: own regex over normalised paragraphs (case-sensitive word starts: David; Moses; Jesus|Christ; Abram|Abraham; Peter|Cephas|Simon|Simeon; Saul|Paul; Pilate; Judas|Iscariot; Mary|Magdalene; Herod). A token counts as linked if a mention of the same character overlaps its span. All package offsets verified to match the text (0 mismatches). Multi-token names (Simon Peter, Judas Iscariot, Mary Magdalene) give 2 tokens for 1 mention.

## Counts
| character | raw tokens | package mentions | tokens linked | unlinked | EXCLUDED-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|---|---|
| david | 1153 | 1141 | 1141 | 12 | 12 | 0 | 63 definite (+6 borderline) |
| moses | 877 | 877 | 877 | 0 | 0 | 0 | 0 |
| jesus | 1548 | 1540 | 1540 | 8 | 8 | 0 | 0 |
| abraham | 326 | 326 | 326 | 0 | 0 | 0 | 0 |
| simon-peter | 379 | 200 | 220 | 159 | 159 | 0 | 0 |
| saul-paul | 587 | 186 | 186 | 401 | 401 | 0 | 0 |
| pontius-pilate | 56 | 56 | 56 | 0 | 0 | 0 | 0 |
| judas-iscariot | 177 | 22 | 29 | 148 | 147 | 1 (minor) | 0 |
| mary-magdalene | 66 | 15 | 26 | 40 | 40 | 0 | 0 |
| herod-the-great | 54 | 10 | 10 | 44 | 44 | 0 | 0 |

Random precision samples (40 each, seed 7/11) for david, abraham, moses, jesus, simon-peter, saul-paul, pontius-pilate, plus full reading of every linked mention for herod, mary-magdalene, judas-iscariot, all Simon/Simeon links, all Saul links: only the David issues below found.

## WRONG-LINK (David, policy inconsistency)
The package correctly leaves every "house/city/tent/tabernacle of David" unlinked, but links the possessive twins "David's city / David's house", which the policy says are NOT the person (city of David = place; house = dynasty).
1. "David's city" (place, City of David) - 46, definite WRONG-LINK: 2 Sam 5:7, 5:9, 6:10, 6:12, 6:16; 1 Kings 2:10, 3:1, 8:1, 9:24, 11:27, 11:43, 14:31, 15:8, 15:24, 22:50; 2 Kings 8:24, 9:28, 12:21, 14:20, 15:7, 15:38, 16:20; 1 Chr 11:5, 11:7, 13:13, 15:1, 15:29; 2 Chr 5:2, 8:11, 9:31, 12:16, 14:1, 16:14, 21:1, 21:20, 24:16, 24:25, 27:9, 32:5, 32:30, 33:14; Neh 3:15, 12:37 (first); Isa 22:9; Luke 2:4, 2:11.
2. "David's house" (dynasty/kingdom), 17 definite WRONG-LINK: 2 Sam 3:1, 3:6; 1 Kings 12:19, 12:20, 12:26, 13:2, 14:8; 2 Kings 17:21; 2 Chr 10:19, 21:7; Ps 122:5; Isa 7:2; Zech 12:7, 12:8, 12:10, 12:12, 13:1.
3. Borderline (policy-arguable, 6): 1 Sam 19:11 (David's own dwelling - arguably person, keep); 1 Sam 20:16 (covenant with David's house - family/dynasty); Neh 12:37 second (David's house = palace/place); Isa 22:22 (key of David's house, parallel to Rev 3:7 "key of David" also linked); Luke 1:27 (of David's house = lineage); Song 4:4 ("David's tower" = a structure).
4. "David's throne" (11 links: 2 Sam 3:10; 1 Kings 2:24, 2:45; Isa 9:7; Jer 13:13, 17:25, 22:2, 22:4, 22:30, 29:16, 36:30) - acceptable (personal possession), not counted as wrong.
Recommendation: unlink groups 1 and 2 (63 mentions) for consistency with the unlinked "of David" forms.

## MISSED
- judas-iscariot, Luke 22:3 "Judas, who was also called [Iscariot]": the epithet "Iscariot" names the same man and is unlinked while the preceding "Judas" is linked (minor; span could be extended to "Judas ... Iscariot" or left as-is).
- No other MISSED items for any of the 10 characters.

## EXCLUDED-OK (unlinked, itemised by reason)
### david (12)
- house of David (dynasty), 5: 1 Chr 17:24; 2 Chr 8:11 ("house of David king of Israel" - possibly David's own residence, borderline); Sir 48:15; Isa 7:13; Jer 21:12
- city of David (place), 4: 1 Macc 1:33, 2:31, 7:32, 14:36
- tent/tabernacle of David (dynasty/kingdom), 3: Isa 16:5, Amos 9:11, Acts 15:16
(total 5+4+3 = 12)
### jesus (8)
- Jesus ben Sira (author): Sir prologue ("my grandfather Jesus"), 50:27, 51 heading - 3 (these are linked to jesus-ben-sira)
- Jesus son of Josedek (high priest): Sir 49:12
- "Christian(s)": Acts 11:26, 26:28; 1 Pet 4:16
- Jesus called Justus: Col 4:11
### moses, abraham, pontius-pilate: nothing unlinked.
### simon-peter (159)
- Simeon son of Jacob / tribe of Simeon / Simeonites (OT, Rev 7:7, Ezek 48, Judith 6:15, 9:2, 1 Macc 2:1 ancestor): 45 + 4 suffixed (Simeonites) + Judith/1 Macc 1 = 50 tokens in Gen 29:33 to 2 Chr 34:6, Ezek 48:24, 48:25, 48:33, Rev 7:7, Judith 6:15, 9:2, 1 Macc 2:1
- Simon Maccabeus (1 Macc 2:3 - 16:16; 2 Macc 8:22, 14:17; linked to simon-maccabeus) 
- Simon of Benjamin / other Simons in 2 Macc 3:4, 3:11, 4:1, 4:3, 4:4, 4:6, 4:23, 10:19, 10:20; Simon son of Onias, Sir 50:1
- Simon the Zealot (the-other-apostles): Matt 10:4; Mark 3:18; Luke 6:15; Acts 1:13
- Simon brother of Jesus: Matt 13:55; Mark 6:3
- Simon the leper: Matt 26:6; Mark 14:3
- Simon of Cyrene: Matt 27:32; Mark 15:21; Luke 23:26
- Simon the Pharisee: Luke 7:40, 7:43, 7:44
- Simon father of Judas Iscariot: John 6:71, 12:4, 13:2, 13:26
- Simon Magus (simon-magus): Acts 8:9, 8:13, 8:18, 8:24
- Simon the tanner: Acts 9:43, 10:6, 10:17, 10:32
- Simeon (Luke 2:25, 2:34 the temple prophet; Luke 3:30 ancestor; Acts 13:1 Simeon Niger)
Every Peter (142) and Cephas (6) token is linked; all 31 Simon and Acts 15:14 Simeon links are Peter.
### saul-paul (401)
- King Saul (saul-king): 398 tokens in 1 Sam, 2 Sam, 1 Chr, Ps 18/52/54/57/59 titles, Isa 10:29 (Gibeah of Saul), Acts 13:21, 1 Macc 4:30 (Jonathan son of Saul, a different man)
- Sergius Paulus (Acts 13:7, "Paul" inside the name)
No Saul or Paul token in Acts, epistles is unlinked. Acts 13:21 (Saul son of Kish) correctly not linked.
### judas-iscariot (147 + 1 MISSED)
- Judas Maccabeus and other Judases of 1-2 Macc: 136 (unlinked here; per addendum 3)
- Judas brother of Jesus: Matt 13:55
- Judas son of James (other apostle): Luke 6:16; Acts 1:13; John 14:22 "Judas (not Iscariot)" - two tokens ("Judas" and the contrastive "Iscariot")
- Judas of Galilee: Acts 5:37
- Judas Barsabbas: Acts 15:22, 15:27, 15:32
- "Iscariot" as Simon's epithet: John 6:71, 13:26
- Luke 22:3 "Iscariot" -> the MISSED item above
### mary-magdalene (40)
- Mary mother of Jesus (40 tokens incl. linked-elsewhere): Matt 1:16, 1:18, 1:20, 2:11, 13:55; Mark 6:3; Luke 1:27-2:34 (13 tokens); Acts 1:14
- Mary of Bethany: Luke 10:39, 10:42; John 11:1, 11:2, 11:19, 11:20, 11:28, 11:31, 11:32, 11:45, 12:3
- "the other Mary"/Mary mother of James and Joses: Matt 27:56 (2nd Mary), 27:61, 28:1; Mark 15:40, 15:47, 16:1; Luke 24:10
- Mary wife of Clopas: John 19:25 (first Mary)
- Mary mother of John Mark: Acts 12:12
- Mary of Rom 16:6
### herod-the-great (44)
- Herod Antipas (herod-antipas): Matt 14:1, 14:3, 14:6 (x2); Mark 6:14-6:22, 8:15; Luke 3:1, 3:19 (x2), 8:3, 9:7, 9:9, 13:31, 23:7 (x2), 23:8, 23:11, 23:12, 23:15; Acts 4:27, 13:1
- Herodias: Matt 14:3, 14:6; Mark 6:17, 6:19, 6:22; Luke 3:19
- Herodians: Matt 22:16; Mark 3:6, 12:13
- Herodion: Rom 16:11
- Herod Agrippa I (Acts 12): Acts 12:1, 12:6, 12:11, 12:19, 12:20, 12:21; Acts 23:35 ("Herod's palace" - Caesarea, built by Herod the Great, referenced as a place, not the person; borderline but consistent)
Matt 2:1,3,7,12,13,15,16,19,22 and Luke 1:5 are all linked.

## Notes
- mary-magdalene: Luke 8:2 has two separate mentions ("Mary" and "Magdalene") for one reference; cosmetic. The 15 mentions cover Matt 27:56, 27:61, 28:1; Mark 15:40, 15:47, 16:1, 16:9; Luke 8:2, 24:10; John 19:25, 20:1, 20:11, 20:16, 20:18 - complete.
- Hebrews 4:8/Acts 7:45 use "Joshua" in this edition, so no Jesus=Joshua risk; Matt 27:17,20,26 Barabbas is not named "Jesus" in the text.
- Lowercase "christs" (false christs) and "Messiah" are not counted as name forms.
