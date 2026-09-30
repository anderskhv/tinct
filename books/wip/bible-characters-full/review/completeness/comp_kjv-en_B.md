# Completeness review B, kjv-en (isaac, solomon, samuel, elijah, isaiah, jeremiah, stephen, barnabas, hezekiah, nebuchadnezzar)

Method: own regex over normalised paragraphs (name forms below, incl. possessive), each occurrence matched to package mentions by chapter/paragraph/offset overlap. No orphan package mentions (every mention lies on a counted name occurrence).

| char | forms counted | raw occ | linked | EXCLUDED-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|---|
| isaac | Isaac, Isaac's | 132 | 130 | 2 | 0 | 0 |
| solomon | Solomon, Solomon's | 304 | 302 | 2 (borderline) | 0 | 0 definite (1 borderline inconsistency, see below) |
| samuel | Samuel, Shemuel | 145 | 142 | 2 | 1 | 0 |
| elijah | Elijah, Elias, Eliah | 101 | 98 | 3 | 0 | 0 |
| isaiah | Isaiah, Esaias, Jesaiah | 55 | 53 | 2 | 0 | 0 |
| jeremiah | Jeremiah(+'s), Jeremy, Jeremias | 150 | 139 | 11 | 0 | 0 |
| stephen | Stephen (Stephanas not counted, different man) | 7 | 7 | 0 | 0 | 0 |
| barnabas | Barnabas, Joses | 35 | 30 | 5 | 0 | 0 |
| hezekiah | Hezekiah, Ezekias, Hizkiah, Hizkijah | 132 | 127 | 5 | 0 | 0 |
| nebuchadnezzar | Nebuchadnezzar, Nebuchadrezzar | 91 | 91 | 0 | 0 | 0 |

## Unlinked occurrences
### isaac
- Amos 7:9 "high places of Isaac" - EXCLUDED-OK (nation)
- Amos 7:16 "house of Isaac" - EXCLUDED-OK (house-of/nation)
### solomon
- John 10:23 "Solomon's porch" - EXCLUDED-OK (borderline; place named for him)
- Acts 5:12 "Solomon's porch" - EXCLUDED-OK (borderline; same)
### samuel
- Num 34:20 Shemuel son of Ammihud (Simeon) - EXCLUDED-OK (other man)
- 1 Chr 7:2 Shemuel (Issachar) - EXCLUDED-OK (other man)
- 1 Chr 6:33 "Heman ... son of Joel, the son of Shemuel" - MISSED. Heman's grandfather Shemuel is the prophet Samuel (1 Chr 6:28 "sons of Samuel" is linked, Joel = his son; 6:33 is the same genealogy). Policy rule 4 (name variants). Paragraph 344, start of "Shemuel" in 6:33.
### elijah
- 1 Chr 8:27 Eliah (Benjamite) - EXCLUDED-OK
- Ezra 10:21 Elijah (son of Harim) - EXCLUDED-OK
- Ezra 10:26 Eliah (son of Elam) - EXCLUDED-OK
### isaiah
- 1 Chr 3:21 Jesaiah (son of Hananiah) - EXCLUDED-OK
- Neh 11:7 Jesaiah (ancestor of a Benjamite) - EXCLUDED-OK
### jeremiah (all EXCLUDED-OK, other men)
- 2 Kings 23:31 and 24:18 Jeremiah of Libnah (Hamutal's father); 1 Chr 5:24 (Manasseh chief); 1 Chr 12:4, 12:10, 12:13 (Benjamite/Gadite warriors); Neh 10:2, 12:1, 12:12, 12:34 (priests/princes); Jer 35:3 (Jaazaniah son of Jeremiah, Rechabite).
### barnabas (all EXCLUDED-OK: Joses = brother of Jesus / son of Mary, a different man from Acts 4:36)
- Matt 13:55; Matt 27:56; Mark 6:3; Mark 15:40; Mark 15:47. (Acts 4:36 Joses is linked, correct.)
### hezekiah
- 1 Chr 3:23 (son of Neariah) - EXCLUDED-OK
- Ezra 2:16 and Neh 7:21 "children of Ater of Hezekiah" - EXCLUDED-OK (family/clan label, text does not identify the king)
- Neh 10:17 Hizkijah (signatory) - EXCLUDED-OK
- Zeph 1:1 Hizkiah (great-grandfather of Zephaniah) - EXCLUDED-OK (tradition says the king, text does not; policy rule 3)

## MISSED
1. samuel: 1 Chr 6:33 Shemuel (paragraph of chapter number 344, "the son of Shemuel"), a spelling variant of Samuel the prophet.

## WRONG-LINK
None definite. All linked mentions were inspected in full for isaac, isaiah, stephen, barnabas, hezekiah (non-narrative books), jeremiah (non-Jeremiah books plus ~1/3 of the book), samuel (all non-1 Samuel plus ~1/3), elijah (all non-Kings plus 40 random), solomon (all outside 1 Kings/2 Chr plus 1/4 of those), nebuchadnezzar (half). No cross-person errors found.
Borderline items for the lead to decide (policy on "named for a person"):
- Acts 3:11 "Solomon's porch" is LINKED while John 10:23 and Acts 5:12 (same porch) are NOT linked: inconsistent. Either link all three or none.
- Ezra 2:55, 2:58; Neh 7:57, 7:60; Neh 11:3 "children of Solomon's servants" are linked; a guild named after Solomon, arguably not the person (linked 5 mentions; not counted as wrong).
- Song 8:12 "thou, O Solomon" (address, linked, fine).
