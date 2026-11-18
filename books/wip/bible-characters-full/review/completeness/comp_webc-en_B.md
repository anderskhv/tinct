# Completeness review B - webc-en (independent)

Method: regex over normalised paragraphs (newline->space, collapse spaces) for each character's name forms; compared with package mentions (exact offset match). All mention texts matched edition text at their offsets (0 mismatches, 0 duplicates, 0 linked mentions on a form I did not count). I read ALL linked mentions with context for every character (not just 40).

Forms used: samuel=Samuel; elijah=Elijah (Elias absent); isaiah=Isaiah; jeremiah=Jeremiah, Jeremy (Baruch 6:1); judith=Judith; holofernes=Holofernes; tobit=Tobit; tobias=Tobias (Tobiah counted separately = Nehemiah's man / Ezra 2:60, always other); susanna=Susanna; judas-maccabeus=Judas, Maccabaeus.

## Counts
| character | raw occurrences | linked | excluded-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|
| samuel | 144 | 144 | 0 | 0 | 0 |
| elijah | 105 | 102 | 3 | 0 | 0 |
| isaiah | 55 | 55 | 0 | 0 | 0 |
| jeremiah | 157 | 146 | 11 (10 unlinked + see WRONG) | 0 | 1 (Jer 52:1) |
| judith | 33 | 32 | 1 | 0 | 0 |
| holofernes | 45 | 45 | 0 | 0 | 0 |
| tobit | 23 | 23 | 0 | 0 | 0 |
| tobias | 33 (Tobias only) | 32 | 1 | 0 | 0 |
| susanna | 11 | 10 | 1 | 0 | 0 |
| judas-maccabeus | 197 (Judas+Maccabaeus, incl. NT) | 163 | 34 | 0 | 0 |

Note jeremiah: raw 157 = 146 linked + 11 unlinked (all other men). Of the 146 linked, 1 is wrong (Jer 52:1), so correct links = 145. (Excluded-OK column = 11 unlinked.)
Tobias: additionally 15 "Tobiah" occurrences (Ezra 2:60; Neh 2:10,19; 4:3,7; 6:1,12,14,17 x2,19; 7:62; 13:4,7,8) = other man, all correctly unlinked.

## Unlinked - EXCLUDED-OK
- elijah (3): 1 Chr 8:27; Ezra 10:21; Ezra 10:26 - other men named Elijah in lists.
- jeremiah (11): 2 Kings 23:31; 2 Kings 24:18 (Hamutal's father of Libnah); 1 Chr 5:24; 1 Chr 12:4, 12:10, 12:13 (warriors); Neh 10:2; 12:1; 12:12; 12:34 (priests); Jer 35:3 (father of Jaazaniah, Rechabite).
- judith (1): Gen 26:34 (Esau's wife).
- tobias (1): 2 Macc 3:11 (Hyrcanus son of Tobias). Plus 15 Tobiah (above).
- susanna (1): Luke 8:3.
- judas-maccabeus (34): NT Judas/other men: Matt 10:4, 13:55, 26:14, 26:25, 26:47, 27:3; Mark 3:19, 14:10, 14:43; Luke 6:16 (x2), 22:3, 22:47, 22:48; John 6:71, 12:4, 13:2, 13:26, 13:29, 14:22, 18:2, 18:3, 18:5; Acts 1:13, 1:16, 1:25, 5:37, 15:22, 15:27, 15:32 (Iscariot / son of James / Galilean / Barsabbas) ; 1 Macc 11:70 (Judas son of Chalphi); 1 Macc 16:2, 16:9, 16:14 (Judas son of Simon Maccabee - a different man, per policy "other men named Judas").

## MISSED
None found.

## WRONG-LINK
- jeremiah: **Jeremiah 52:1** ("Hamutal the daughter of [[Jeremiah]] of Libnah") - the mother's father of king Zedekiah, not the prophet. Inconsistent with the (correct) exclusion of the same person at 2 Kings 23:31 / 24:18. Should be removed.
Everything else read as correct, including borderline cases: Samuel 1 Chr 6:28/6:33 (prophet's sons/descendants), Samuel Ps 99:6, Jer 15:1, Heb 11:32; Elijah Mal 4:5, NT "Elijah" (John the Baptist question, Matt 11:14); Jeremiah Baruch 6:1 "Jeremy", Matt 2:17/16:14/27:9, Jer 26:20, 29:27, 2 Macc 15:14; Isaiah all; Tobit/Tobias all in Tobit only (Tobit 1:9 "father of Tobias"); Susanna Dan 13 all 10; 2 Macc 1:10 "Judas, to Aristobulus" and 2 Macc 10:19 "Maccabaeus, having left Simon and Joseph" (Maccabee); 1 Macc 13:8, 14:18 (Judas brother of Jonathan/Simon).

## Housekeeping note
While working I accidentally overwrote two helper scripts in this comp/ directory (an.py and an2.py, which appeared to belong to an earlier reviewer). They are analysis scripts only (no data); my own scripts live in scratchpad/rvB/.
