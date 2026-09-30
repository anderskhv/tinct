# Completeness review web-en, group A (independent)

Method: own regex scan of bible-web-en.json (paragraphs normalised, verse refs from superscripts), name forms chosen from the text (multiword forms merged: Simon Peter, Judas Iscariot, Mary Magdalene). An occurrence is "linked" if a package mention of that character overlaps it. Package mention totals equal my linked-occurrence totals for all 10 characters (no orphan mentions).

## Counts
| character | forms scanned | raw occ | linked (=pkg mentions) | EXCLUDED-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|---|
| david | David | 1138 | 1065 | 73 | 0 | 0 firm, 2 borderline (SoS 4:4, Luke 2:4 inconsistency) |
| moses | Moses | 849 | 849 | 0 | 0 | 0 |
| jesus | Jesus, Christ | 1535 | 1533 | 1 | 1 | 0 |
| abraham | Abram, Abraham | 313 | 313 | 0 | 0 | 0 |
| simon-peter | Simon Peter, Peter, Cephas, Simon, Simeon | 273 | 199 | 74 | 0 | 0 |
| saul-paul | Saul, Paul | 585 | 186 | 399 | 0 | 0 |
| pontius-pilate | Pilate | 56 | 56 | 0 | 0 | 0 |
| judas-iscariot | Judas Iscariot, Judas, Iscariot | 34 tokens | 22 | 12 tokens (8 other Judas + 4 "Iscariot" tokens that are appositions) | 0 | 0 |
| mary-magdalene | Mary Magdalene, Mary, Magdalene | 55 | 15 | 40 | 0 | 0 |
| herod-the-great | Herod | 44 | 10 | 34 | 0 | 0 |

Random-sample checks: 40 random linked mentions each for moses, abraham, pontius-pilate, saul-paul, all correct. All linked mentions were read for judas-iscariot (22), herod-the-great (10), mary-magdalene (15), simon-peter non-"Peter" forms (Simon/Simeon/Cephas), all `Christ` linked mentions (559), and every David linked mention preceded by house/city/tent/tower/key/throne of. No wrong ones except the borderlines below.

## MISSED
1. jesus: 1 Thessalonians 1:10 "whom he raised from the dead--Jesus, who delivers us from the wrath to come" (unlinked; clearly the Lord).

## WRONG-LINK (none firm; borderline only)
- david, Song of Solomon 4:4 "like David's tower built for an armory" is a structure named for David (place-type), not the person. Borderline, arguably should be unlinked.
- david, Luke 2:4 "of the house and family of David" is linked, while Luke 1:27 "of the house of David" and all other "house of David" are excluded. Inconsistent under the policy; the rule-consistent choice is to unlink Luke 2:4 (the "city of David" in Luke 2:4 is correctly excluded).
- david (informational, acceptable): "throne of David" (2 Sam 3:10; 1 Kings 2:12,24,45; Isa 9:7; Jer 17:25, 22:2,4,30, 29:16, 36:30) and Rev 3:7 "key of David" are linked; these name the person's throne/key, kept as person references, not house/city.
- jesus (informational): Matt 26:68 "you Christ!" and Luke 23:2 are the Lord; fine. Nothing else questionable.

## EXCLUDED-OK, itemised
### david (73, all 'house of / city of / tent of David')
- city of David (36): 2 Sam 5:7,9; 6:10,12,16; 1 Kgs 2:10; 3:1; 8:1; 9:24; 11:27,43; 14:31; 15:8,24; 22:50; 2 Kgs 8:24; 9:28; 12:21; 14:20; 15:7,38; 16:20; 1 Chr 11:5,7; 13:13; 15:1,29; 2 Chr 5:2; 8:11; 9:31; 12:16; 14:1; 16:14; 21:1,20; 24:16,25; 27:9; 32:5,30; 33:14; Neh 3:15; 12:37; Isa 22:9; Luke 2:4, 2:11 (place).
- house of David (dynasty/household/palace): 1 Sam 20:16; 2 Sam 3:1,6; 1 Kgs 12:19,20,26; 13:2; 14:8; 2 Kgs 17:21; 1 Chr 17:24; 2 Chr 8:11 (palace), 10:19, 21:7; Neh 12:37; Isa 7:2,13; 22:22; Jer 21:12; Zech 12:7,8,10,12; 13:1; Luke 1:27.
- tent of David (dynasty): Isa 16:5; Amos 9:11; Acts 15:16.
### jesus (2)
- Col 4:11 "Jesus who is called Justus": EXCLUDED-OK (another man).
- 1 Thess 1:10: MISSED (above).
- Not counted as name forms (no card text): "Messiah" John 1:41, 4:25 (both glossed "Christ", and the "Christ" gloss tokens are linked); "the Anointed One" Dan 9:25-26. No "Bar-Jesus" or Jesus/Joshua ambiguity in WEB text.
### simon-peter (74)
- Simeon, son/tribe of Jacob (48): Gen 29:33; 34:25,30; 35:23; 42:24,36; 43:23; 46:10; 48:5; 49:5; Ex 1:2; 6:15 (x2); Num 1:6,22,23; 2:12 (x2); 7:36; 10:19; 13:5; 26:12; 34:20; Deut 27:12; Josh 19:1 (x2),8,9 (x2); 21:9; Judg 1:3 (x2),17; 1 Chr 2:1; 4:24,42; 6:65; 12:25; 2 Chr 15:9; 34:6; Ezek 48:24,25,33; Rev 7:7. Also Luke 2:25, 2:34 (Simeon of the temple), Luke 3:30 (ancestor), Acts 13:1 (Simeon Niger).
- Simon, other men (22): Matt 13:55 and Mark 6:3 (Jesus' brother); Matt 26:6, Mark 14:3 (the leper); Matt 27:32, Mark 15:21, Luke 23:26 (of Cyrene); Luke 7:40,43,44 (the Pharisee); John 6:71, 12:4, 13:2, 13:26 (father of Judas); Acts 9:43, 10:6, 10:17, 10:32 (the tanner).
- Simon the Zealot/Canaanite, assigned to the-other-apostles (4): Matt 10:4; Mark 3:18; Luke 6:15; Acts 1:13.
- Simon Magus, assigned to simon-magus (4): Acts 8:9,13,18,24.
### saul-paul (399)
- Saul king (382, linked to saul-king), incl. Acts 13:21.
- Saul, no card (17): "house of Saul" (2 Sam 3:1 x2, 3:6 x2, 3:8, 3:10, 9:1,2,3, 16:5, 16:8, 19:17; 1 Chr 12:29), "Gibeah of Saul" (1 Sam 11:4; 15:34; 2 Sam 21:6; Isa 10:29).
- "Paul": every occurrence linked.
### judas-iscariot
- Judas other men: Matt 13:55 (brother, jude-apostle); Luke 6:16 first "Judas the son of James", John 14:22, Acts 1:13 (other-apostles); Acts 5:37 (of Galilee); Acts 15:22 (Barsabbas), 15:27, 15:32.
- "Iscariot" as apposition (not separate person): Luke 22:3, John 6:71, John 13:26 (their Judas is linked); John 14:22 "Judas (not Iscariot)" belongs to other-apostles.
- Note: WEB Acts 9:11 reads "house of Judah", so no Judas of Damascus token exists.
### mary-magdalene (40 Mary tokens, other women)
- mary-mother-of-jesus (19): Matt 1:16,18,20; 2:11; 13:55; Mark 6:3; Luke 1:27,30,34,38,39,41,46,56; 2:5,16,19,34; Acts 1:14.
- mary-of-bethany (11): Luke 10:39,42; John 11:1,2,19,20,28,31,32,45; 12:3.
- no card, other Marys (10): Matt 27:56 ("Mary the mother of James and Joses"), 27:61 and 28:1 ("the other Mary"); Mark 15:40, 15:47, 16:1; Luke 24:10; John 19:25 (wife of Clopas); Acts 12:12; Rom 16:6.
### herod-the-great (34)
- Herod Antipas card (27): Matt 14:1,3,6 (x2); Mark 6:14,16,17,18,20,21,22; 8:15; Luke 3:1,19 (x2); 8:3; 9:7,9; 13:31; 23:7 (x2),8,11,12,15; Acts 4:27; 13:1.
- Herod Agrippa I, no card (6): Acts 12:1,6,11,19,20,21.
- Acts 23:35 "Herod's palace": no card (place; built by Herod the Great, but not a person reference). Borderline-OK.
- Linked (10): Matt 2:1,3,7,12,13,15,16,19,22; Luke 1:5.
### moses, abraham, pilate: no unlinked occurrences.
