# Completeness review A (KJV-en): david, moses, jesus, abraham, simon-peter, saul-paul, pontius-pilate, judas-iscariot, mary-magdalene, herod-the-great

Method: own regex over whitespace-normalised paragraphs (whole-word, case-sensitive), verse from superscript numerals; an occurrence counts as linked if any package mention of that character overlaps it. All mention offsets were checked to equal their text. Every package mention overlapped an occurrence I counted (no orphan mentions).

Forms used: david=David; moses=Moses; jesus=Jesus, Jesu, Christ, Messias, Messiah; abraham=Abraham, Abram; simon-peter=Peter, Cephas, Simon, Simeon; saul-paul=Saul, Paul; pilate=Pilate, Pontius; judas=Judas, Juda, Jude, Iscariot; mary-magdalene=Mary, Magdalene, Magdala; herod=Herod.

## Counts
| character | raw occurrences | package mentions | occurrences covered | EXCLUDED-OK | MISSED | span-only (unlinked token inside a linked name) | WRONG-LINK (probable) | WRONG-LINK borderline |
|---|---|---|---|---|---|---|---|---|
| david | 1064 | 989 | 989 | 74 | 1 | 0 | 5 | 3 |
| moses | 847 | 847 | 847 | 0 | 0 | 0 | 0 | 0 |
| jesus | 1552 | 1545 | 1545 | 5 (+John 4:25 borderline) | 1 (John 1:41 Messias) | 0 | 5 | 4 |
| abraham | 311 | 311 | 311 | 0 | 0 | 0 | 0 | 0 (seed-of uses, see note) |
| simon-peter | 294 | 199 (Simon Peter=20 spans) | 219 | 75 | 0 | 0 | 0 | 0 |
| saul-paul | 582 | 187 | 187 | 395 | 0 | 0 | 0 | 0 |
| pontius-pilate | 60 | 56 | 56 | 0 | 0 | 4 ("Pontius") | 0 | 0 |
| judas-iscariot | 55 | 22 (Judas Iscariot=9 spans) | 31 | 23 | 0 | 1 (Luke 22:3 "Iscariot") | 0 | 0 |
| mary-magdalene | 67 | 15 (Mary Magdalene=11 spans) | 26 | 41 | 0 | 0 | 0 | 0 |
| herod-the-great | 44 | 10 | 10 | 34 | 0 | 0 | 0 | 1 excluded-borderline (Acts 23:35) |

Random verification: at least 40 random linked mentions per character read (all of moses/abraham/pilate/paul/jesus/david samples correct); plus rule-based scan of ALL links for "house/city/tower/tribe/land/children/sons/seed/tabernacle/key of X" contexts (David, Moses, Abraham, Jesus, Pilate, Paul); full lists read for herod (10), mary-magdalene (15), judas (22), simon-peter non-"Peter" mentions (57).

## MISSED
1. david - Zechariah 12:8 "shall be as David" (the person David, used as the standard of a mighty man) - unlinked, should link.
2. jesus - John 1:41 "We have found the Messias, which is, being interpreted, the Christ" (Andrew about Jesus; Messias = Christ form) - unlinked. (John 4:25 "I know that Messias cometh" is the woman's expectation, left excluded-borderline; Daniel 9:25,26 "Messiah" prophetic, EXCLUDED-OK.)

## WRONG-LINK
david (probable, dynasty/family not the person, per "house of X" policy):
- 1 Kings 11:39 "afflict the seed of David" (dynasty)
- 2 Chronicles 13:8 "in the hand of the sons of David" (dynasty)
- 2 Chronicles 23:3 "said of the sons of David" (dynasty)
- Ezra 8:2 "of the sons of David; Hattush" (a returning family/clan)
- Jeremiah 33:22 "multiply the seed of David my servant" (descendants/dynasty; borderline-probable)
david (borderline): 2 Chronicles 32:33 "sepulchres of the sons of David" (royal descendants); Revelation 3:7 "key of David" (cf. Isa 22:22 "key of the house of David" excluded); Hosea 3:5 "David their king" (future Davidic king). Note NT "seed of David" for Jesus (John 7:42, Rom 1:3, 2 Tim 2:8) is ancestry -> fine under rule 6.
jesus (probable, "Christ" used of false claimants, not Jesus): Matthew 24:5, Mark 13:6, Luke 21:8 ("saying, I am Christ"); Matthew 24:23, Mark 13:21 ("Lo, here is Christ" - false christs).
jesus (borderline, title asked/denied about others): Luke 3:15 (whether John were the Christ), John 1:20, John 1:25, John 3:28 (John denies being the Christ).
abraham note: "seed/children/daughter of Abraham" (Ps 105:6, Isa 41:8, 2 Chr 20:7, John 8:33,37, Luke 13:16, Rom 9:7, 11:1, 2 Cor 11:22, Gal 3:7,29, Heb 2:16) are linked; consistent with policy rule 6 (ancestry) but arguably nation-synonym in Ps 105:6/Isa 41:8. Not counted as wrong.

## EXCLUDED-OK (grouped)
david (74): "city of David" x~46 (2 Sam 5:7,9; 6:10,12,16; 1 Kgs 2:10; 3:1; 8:1; 9:24; 11:27,43; 14:31; 15:8,24; 22:50; 2 Kgs 8:24; 9:28; 12:21; 14:20; 15:7,38; 16:20; 1 Chr 11:5,7; 13:13; 15:1,29; 2 Chr 5:2; 8:11; 9:31; 12:16; 14:1; 16:14; 21:1,20; 24:16,25; 27:9; 32:5,30; 33:14; Neh 3:15; 12:37; Isa 22:9; Luke 2:4,11); "house of David" (1 Sam 20:16; 2 Sam 3:1,6; 1 Kgs 12:19,20,26; 13:2; 14:8; 2 Kgs 17:21; 1 Chr 17:24; 2 Chr 8:11; 10:19; 21:7; Neh 12:37; Ps 122:5; Isa 7:2,13; 22:22; Jer 21:12; Zech 12:7,8,10,12; 13:1; Luke 1:27); "tower of David" Song 4:4; "tabernacle of David" Isa 16:5, Amos 9:11, Acts 15:16.
jesus (5): Acts 7:45 and Heb 4:8 (Jesus = Joshua), Col 4:11 (Jesus called Justus), Dan 9:25,26 (Messiah, prophecy).
simon-peter (75): Simeon the son of Jacob/tribe of Simeon x~44 (Gen 29:33 - Ezek 48:33, Rev 7:7); Simeon of Luke 2:25,34; Luke 3:30; Simeon Niger Acts 13:1; Simon the Canaanite/Zelotes Matt 10:4, Mark 3:18, Luke 6:15, Acts 1:13; Simon brother of Jesus Matt 13:55, Mark 6:3; Simon the leper Matt 26:6, Mark 14:3; Simon of Cyrene Matt 27:32, Mark 15:21, Luke 23:26; Simon the Pharisee Luke 7:40,43,44; father of Judas John 6:71, 12:4, 13:2, 13:26; Simon Magus Acts 8:9,13,18,24; Simon the tanner Acts 9:43, 10:6,17,32(second).
saul-paul (395): King Saul (1 Sam x297, 2 Sam x66, 1 Chr x28), Saul of Rehoboth Gen 36:37,38, Gibeah of Saul Isa 10:29, Acts 13:21 (king). None in Acts 7:58ff/epistles are unlinked. ("Sergius Paulus" not counted as a Paul token.)
judas-iscariot (23): Judah the patriarch (Matt 1:2,3; Luke 3:33 "Juda"), Juda tribe/land/son-of (Matt 2:6 x2; Luke 1:39; Luke 3:26,30; Heb 7:14; Rev 5:5; 7:5), Judas/Juda brother of Jesus (Matt 13:55; Mark 6:3), Judas brother of James Luke 6:16, Acts 1:13, Judas not Iscariot John 14:22 (Judas + "Iscariot" token), Judas of Galilee Acts 5:37, Judas of Damascus Acts 9:11, Judas Barsabas Acts 15:22,27,32, Jude Jude 1.
mary-magdalene (41): Mary mother of Jesus (Matt 1:16,18,20; 2:11; Luke 1:27,30,34,38,39,41,46,56; 2:5,16,19,34; Acts 1:14; Mark 6:3; Matt 13:55), Mary of Bethany (Luke 10:39,42; John 11:1,2,19,20,28,31,32,45; 12:3), Mary of Cleophas John 19:25, "the other Mary"/mother of James and Joses (Matt 27:56,61; 28:1; Mark 15:40,47; 16:1; Luke 24:10), Mary of Acts 12:12, Rom 16:6, Magdala (place) Matt 15:39.
herod-the-great (34): Herod Antipas (Matt 14:1,3,6x2; Mark 6:14,16,17,18,20,21,22; 8:15; Luke 3:1,19x2; 8:3; 9:7,9; 13:31; 23:7x2,8,11,12,15; Acts 4:27; 13:1); Herod Agrippa I (Acts 12:1,6,11,19,20,21). Borderline: Acts 23:35 "Herod's judgment hall" (praetorium built by Herod the Great; name reference is to the building, excluded).

## Span-only (not counted as MISSED)
- pontius-pilate: "Pontius" not covered by the mention (mention is "Pilate" only): Matt 27:2, Luke 3:1, Acts 4:27, 1 Tim 6:13.
- judas-iscariot: Luke 22:3 "Iscariot" (mention is "Judas" only).
