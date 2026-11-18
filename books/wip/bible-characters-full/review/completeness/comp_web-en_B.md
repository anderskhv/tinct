# Completeness review web-en, batch B (independent)

Method: regex over normalised paragraphs. Forms searched: Isaac; Solomon; Samuel; Elijah|Elias; Isaiah|Esaias; Jeremiah|Jeremy|Jeremias; Stephen; Barnabas (+ "Joses" at Acts 4:36); Hezekiah|Hizkiah|Hizkijah|Ezekias; Nebuchadnezzar|Nebuchadrezzar. Only Elijah, Isaiah-less variants etc. as listed actually occur (Elias/Esaias/Jeremy/Jeremias/Ezekias/Nebuchadrezzar: 0 hits). Every package mention matched a counted occurrence by offset (no offset drift), except Barnabas's "Joses" (Acts 4:36), which is a correct link.

| char | raw occurrences | linked | EXCLUDED-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|
| isaac | 132 | 130 | 2 | 0 | 0 |
| solomon | 306 | 304 | 2 | 0 | 1 (Acts 3:11, inconsistency) |
| samuel | 142 | 142 | 0 | 0 | 0 |
| elijah | 101 | 98 | 3 | 0 | 0 |
| isaiah | 53 | 53 | 0 | 0 | 0 |
| jeremiah | 150 | 139 | 11 | 0 | 1 (Jeremiah 52:1) |
| stephen | 7 | 7 | 0 | 0 | 0 |
| barnabas | 29 (+1 "Joses") | 30 | 0 | 0 | 0 |
| hezekiah | 132 (131 Hezekiah + 1 Hizkiah) | 127 | 5 | 0 | 0 |
| nebuchadnezzar | 91 | 91 | 0 | 0 | 0 |

Note: linked counts include the WRONG-LINKs (solomon 304 incl. Acts 3:11; jeremiah 139 incl. Jer 52:1). Raw = linked + excluded-OK for every character.

## MISSED
None for any of the 10 characters.

## WRONG-LINK
1. solomon, Acts 3:11 "in the porch that is called Solomon's" - a place (Solomon's Porch), not the person. Policy says places named for a person are NOT the person; the two other occurrences (John 10:23, Acts 5:12) are correctly unlinked, so Acts 3:11 is inconsistent. Remove the link.
2. jeremiah, Jeremiah 52:1 "Hamutal the daughter of Jeremiah of Libnah" - a different man (Josiah's father-in-law), not the prophet. Remove the link. (The parallel 2 Kings 23:31 and 24:18 are correctly unlinked.)

Borderline, left as-is (judgement call, not counted as wrong): Solomon linked in "children of Solomon's servants" (Ezra 2:55,58; Neh 7:57,60; 11:3): possessive of the person Solomon, defensible as a reference to him.

## EXCLUDED-OK (unlinked occurrences)
isaac (2): Amos 7:9 "high places of Isaac" (nation); Amos 7:16 "house of Isaac" (house-of/nation).
solomon (2): John 10:23 "Solomon's porch"; Acts 5:12 "Solomon's porch" (place).
elijah (3): 1 Chronicles 8:27 (Benjamite, son of Jeroham); Ezra 10:21 (son of Harim); Ezra 10:26 (son of Elam) - other men.
jeremiah (11): 2 Kings 23:31 and 24:18 (Hamutal's father of Libnah); 1 Chronicles 5:24 (head of Manasseh half-tribe); 1 Chronicles 12:4, 12:10, 12:13 (Benjamite/Gadite warriors of David); Nehemiah 10:2 (signatory priest); Nehemiah 12:1, 12:12 (priest heads); Nehemiah 12:34 (Judah/Benjamin procession); Jeremiah 35:3 (father of Jaazaniah the Rechabite). All different men.
hezekiah (5): 1 Chronicles 3:23 "Hizkiah" (descendant of Neariah); Ezra 2:16 and Nehemiah 7:21 ("children of Ater, of Hezekiah", clan); Nehemiah 10:17 (signatory); Zephaniah 1:1 (Zephaniah's ancestor "the son of Hezekiah"; identity with king uncertain, so NONE per rule 3).
samuel, isaiah, stephen, barnabas, nebuchadnezzar: no unlinked occurrences.

## Wrong-link audit
Checked, per character, well over 40 random linked mentions (plus every linked mention in non-home books for samuel, elijah, jeremiah, hezekiah, solomon; all 7 Stephen; all 30 Barnabas; all 130 Isaac scanned via patriarch/genealogy formulas). Only the two WRONG-LINKs above found. Isaac formulas (God of Abraham, Isaac and Jacob; Amos not linked) all fine; Elijah NT references (Matt 16:14, Mark 6:15, John 1:21 etc.) are the prophet by name and fine; Barnabas Acts 4:36 both "Joses" and "Barnabas" correctly linked.
