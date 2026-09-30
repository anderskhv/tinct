# Independent completeness review, bsb-en, characters set A

Method: normalised paragraphs (newlines to space, runs of spaces collapsed); word-boundary regex over every paragraph; verse ref derived from superscript numbers. All 11063 package offsets verified to slice to their `text`. "Raw" counts are word-level (a compound like "Simon Peter" counts as 2 raw words but is 1 mention).
Name forms used (decided from text, hints checked afterwards): david: David | moses: Moses | jesus: Jesus, Christ, Messiah (Immanuel checked separately) | abraham: Abram, Abraham | simon-peter: Peter, Cephas, Simon, Simeon | saul-paul: Saul, Paul | pilate: Pilate (Pontius checked) | judas-iscariot: Judas, Iscariot | mary-magdalene: Mary, Magdalene | herod-the-great: Herod.

## Counts

| character | raw words | linked (mentions) | raw words unlinked | EXCLUDED-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|---|
| david | 1125 | 1056 | 69 | 69 | 0 | 0 |
| moses | 870 | 870 | 0 | 0 | 0 | 0 |
| jesus | 1979 | 1973 | 6 | 4 | 2 (John 1:41, John 4:25 "Messiah"; borderline, see below) plus Matt 1:23 "Immanuel" (outside the form list) | 0 firm (50 borderline generic "the Christ", see below) |
| abraham | 335 | 335 | 0 | 0 | 0 | 0 (4 "children/sons of Abraham" are OK under rule 6) |
| simon-peter | 307 (287 distinct occurrences, "Simon Peter" x20 merged) | 220 | 67 | 67 | 0 | 0 |
| saul-paul | 651 | 250 | 401 | 401 | 0 | 1 (Acts 13:22) |
| pontius-pilate | 64 | 64 | 0 | 0 | 0 | 0 |
| judas-iscariot | 55 (Judas 44 + Iscariot 11) | 34 (27 "Judas" + 7 "Judas Iscariot") | 14 | 14 | 0 | 0 |
| mary-magdalene | 69 (Mary 57 + Magdalene 12) | 15 | 43 | 43 | 0 | 0 |
| herod-the-great | 51 | 10 | 41 | 41 | 0 | 0 |

## WRONG-LINK
1. saul-paul, Acts 13:22 (chapter 1031, para 7, offset 213-217): "After removing [[Saul]], He raised up David" is King Saul (Paul's sermon retelling 1 Sam). The same paragraph also links Acts 13:21 "Saul son of Kish" to saul-king correctly, so 13:22 should be saul-king (or dropped from saul-paul). Only wrong link found among saul-paul's 35 linked "Saul" (all checked) and 215 "Paul".

## MISSED (real references not linked)
1. jesus, John 1:41 "We have found the [[Messiah]]" (which is translated as Christ): Andrew states Jesus is the Messiah; the parenthetical "Christ" in the same verse IS linked, so "Messiah" is inconsistent. Low severity.
2. jesus, John 4:25 "I know that [[Messiah]] is coming": the woman's generic expectation; Jesus answers "I am He" at 4:26. Borderline; consistent with the package's own linking of generic "the Christ" (see below), so link or drop both.
3. jesus, Matt 1:23 "they will call Him [[Immanuel]]": name/title of Jesus, not in the package. Optional (a title, not the name). Isa 7:14 and Isa 8:8 Immanuel are prophecy or address and correctly unlinked.
No other MISSED items for any of the 10 characters.

## Borderline linked (not counted as WRONG)
- jesus "the Christ" as generic title, not Jesus by name: Matt 24:5 ("I am the Christ", false claimants), Matt 24:23, Mark 13:21 (false "here is the Christ"), Luke 3:15 (could John be the Christ), John 1:20, 1:25, 3:28 (John denies being the Christ), John 7:26, 7:27, 7:31, 7:41 (x2), 7:42, 12:34 (crowd's expectation), Matt 2:4 and 22:42 (messianic office). All are the Messiah title that the text identifies with Jesus, so a link is defensible; flagged for a policy call. Dan 9:25-26 "Messiah" is unlinked, which is consistent with a cautious policy.
- abraham "children/sons of Abraham": 1 Chr 1:28, John 8:39, Acts 13:26, Gal 3:7 (linked; fine under rule 6 genealogy / ancestor naming).
- pontius-pilate: mention span covers only "Pilate"; "Pontius" (Luke 3:1, Acts 4:27, 1 Tim 6:13) is not in the span. Cosmetic.

## EXCLUDED-OK (unlinked, grouped by reason)
### david (69)
- "house of David" (dynasty): 1 Sam 20:16; 2 Sam 3:1, 3:6; 1 Kgs 12:19, 12:20, 12:26, 13:2, 14:8; 2 Kgs 17:21; 2 Chr 8:11 (2nd), 10:19, 21:7; Neh 12:37 (2nd); Ps 122:5; Isa 7:2, 7:13, 22:22; Jer 21:12; Zech 12:7, 12:8, 12:10, 12:12, 13:1; Luke 1:27 (Joseph "of the house of David").
- "City of David" (place): 2 Sam 5:7, 5:9, 6:10, 6:12, 6:16; 1 Kgs 2:10, 3:1, 8:1, 9:24, 14:31, 15:8; 2 Kgs 8:24, 9:28, 12:21, 14:20, 15:7, 15:38, 16:20; 1 Chr 11:5, 11:7, 13:13, 15:1, 15:29; 2 Chr 5:2, 8:11 (1st), 12:16, 14:1, 16:14, 21:1, 21:20, 24:16, 24:25, 27:9, 32:5, 32:30, 33:14; Neh 3:15, 12:37 (1st); Isa 22:9; Luke 2:4, 2:11.
- "tower of David" Song 4:4 (place); "tent of David" Isa 16:5, Amos 9:11, Acts 15:16 (dynasty/kingdom).
### jesus (4)
- Dan 9:25, 9:26 "Messiah" (prophecy, policy-cautious); Acts 13:6 "Bar-Jesus" (sorcerer); Col 4:11 "Jesus, who is called Justus" (other man).
### simon-peter (67)
- Simeon son of Jacob / tribe of Simeon (42 words): Gen 29:33, 34:25, 34:30, 35:23, 42:24, 42:36, 43:23, 46:10, 48:5, 49:5; Exod 1:2, 6:15 x2; Num 1:6, 1:22, 1:23, 2:12, 10:19, 13:5, 26:12, 26:14, 34:20; Deut 27:12; Josh 19:1, 19:8, 21:4, 21:9; 1 Chr 2:1, 4:24, 6:65, 12:25; 2 Chr 15:9, 34:6; Ezek 48:24, 48:25, 48:33; Rev 7:7 (Luke 3:30 Simeon son of Judah is also an ancestor in the genealogy, other man; Luke 2:25, 2:28, 2:34 Simeon of the temple; Acts 13:1 Simeon called Niger).
- Simon the Zealot (linked to the-other-apostles): Matt 10:4, Mark 3:18, Luke 6:15, Acts 1:13.
- Simon brother of Jesus: Matt 13:55, Mark 6:3.
- Simon the Leper: Matt 26:6, Mark 14:3. Simon of Cyrene: Matt 27:32, Mark 15:21, Luke 23:26. Simon the Pharisee: Luke 7:40, 7:43, 7:44.
- Simon father of Judas (Simon Iscariot): John 6:71, 13:2, 13:26.
- Simon Magus (linked to simon-magus): Acts 8:9, 8:13, 8:18, 8:24. Simon the tanner: Acts 9:43, 10:6, 10:17, 10:32.
- Acts 15:14 (Simeon/Simon at the Jerusalem council) IS linked (BSB reads "Simon"). Every Peter (181) and Cephas (9) is linked.
### saul-paul (401)
- 400 "Saul" in the OT and Acts 13:21 = King Saul (linked to saul-king), other Sauls (Gen 36:37-38, Simeonite Shaul, 1 Chr etc.). No unlinked Saul or Paul occurs in the Acts 7:58-26:14 / Epistles range; all 215 "Paul" and 34 correct "Saul" are linked.
### judas-iscariot (14)
- Judas brother of Jesus (jude-apostle): Matt 13:55, Mark 6:3. Judas son of James (the-other-apostles): Luke 6:16, Acts 1:13. Judas "not Iscariot": John 14:22 (Judas and Iscariot words). Judas the Galilean: Acts 5:37. Judas of Damascus: Acts 9:11. Judas Barsabbas: Acts 15:22, 15:27, 15:32. "Simon Iscariot" (Iscariot as father's epithet): John 6:71, 13:2, 13:26 (the Judas in each verse is linked).
### mary-magdalene (43)
- Mary mother of Jesus (linked to mary-mother-of-jesus): Matt 1:16, 1:18, 1:20, 1:24, 2:11, 13:55; Mark 6:3; Luke 1:27, 1:29, 1:30, 1:34, 1:38, 1:39, 1:41, 1:46, 1:56, 2:5, 2:16, 2:19, 2:34; Acts 1:14.
- Mary of Bethany (linked to mary-of-bethany): Luke 10:39, 10:42; John 11:1, 11:2, 11:19, 11:20, 11:28, 11:29, 11:31, 11:32, 11:45, 12:3.
- Other Marys (policy NONE): Matt 27:56, 27:61, 28:1; Mark 15:40, 15:47, 16:1; Luke 24:10 (mother of James / the other Mary); John 19:25 (wife of Clopas); Acts 12:12 (mother of John Mark); Rom 16:6.
- Every "Mary Magdalene" (11), Luke 8:2 "Mary called Magdalene" (2 words) and John 20:11, 20:16 "Mary" are linked.
### herod-the-great (41)
- Herod Antipas (linked to herod-antipas): Matt 14:1, 14:3, 14:5, 14:6 x2; Mark 6:14, 6:16, 6:17 x2, 6:18, 6:20, 6:21 x2, 6:22, 8:15; Luke 3:1, 3:19, 3:20, 8:3, 9:7, 9:9, 13:31, 23:7 x2, 23:8, 23:9, 23:11, 23:12, 23:15; Acts 4:27, 13:1.
- Herod Agrippa I (policy NONE): Acts 12:1, 12:3, 12:4, 12:6, 12:11, 12:19, 12:20, 12:21, 12:23.
- Acts 23:35 "Herod's Praetorium": place named for a person.
- All 10 linked are Matt 2:1, 2:3, 2:7, 2:12, 2:13, 2:15, 2:16, 2:19, 2:22 and Luke 1:5; that is every Herod in Matt 2 and Luke 1:5.

## Wrong-link sampling
Read all linked mentions for simon-peter (Simon/Simon Peter/Cephas, 59), saul-paul "Saul" (35), judas-iscariot (34), mary-magdalene (15), herod-the-great (10) and all 64 pilate mentions in a random 42 plus the anomaly filter; random 42 each of david, moses, jesus, abraham, Peter, Paul; all 50 "the Christ" contexts and all linked mentions preceded by "house/city/tribe/sons/children of" were inspected. Only Acts 13:22 was wrong.
