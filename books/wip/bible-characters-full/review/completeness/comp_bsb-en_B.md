# BSB-en completeness review B (isaac, solomon, samuel, elijah, isaiah, jeremiah, stephen, barnabas, hezekiah, nebuchadnezzar)

Method: whole-word regex over normalised paragraphs. Forms found in the BSB: Isaac, Solomon, Samuel, Elijah, Isaiah, Jeremiah, Stephen, Barnabas, Hezekiah, Nebuchadnezzar. Elias, Isaias, Esaias, Jeremias, Jeremy and Nebuchadrezzar do not occur. Barnabas is also named "Joseph" at Acts 4:36. Every package mention matched an occurrence (offsets exact), with no orphans, except the Barnabas Joseph mention, which is intended.

| character | raw occurrences | linked | EXCLUDED-OK | MISSED | WRONG-LINK |
|---|---|---|---|---|---|
| isaac | 141 | 139 | 2 | 0 | 0 |
| solomon | 311 | 311 | 0 | 0 | 3 (place name) |
| samuel | 142 | 142 | 0 | 0 | 0 |
| elijah | 126 | 123 | 3 | 0 | 0 |
| isaiah | 56 | 56 | 0 | 0 | 0 |
| jeremiah | 154 | 143 | 11 | 0 | 1 |
| stephen | 14 | 14 | 0 | 0 | 0 |
| barnabas | 35 (+1 "Joseph" at Acts 4:36) | 36 (35 Barnabas + 1 Joseph) | 0 | 0 | 0 |
| hezekiah | 143 | 139 | 4 | 0 | 0 |
| nebuchadnezzar | 95 | 95 | 0 | 0 | 0 |

## MISSED
None for the names themselves.
Optional note, not counted: 2 Samuel 12:25 "Jedidiah" is Solomon's second name (a different form, not "Solomon"). It is unlinked. Include it only if alias forms are in scope.

## WRONG-LINK (4)
1. solomon, John 10:23 "Solomon's Colonnade": a place named for him, not the person. Policy says NONE.
2. solomon, Acts 3:11 "Solomon's Colonnade": same.
3. solomon, Acts 5:12 "Solomon's Colonnade": same.
4. jeremiah, Jeremiah 52:1 "Hamutal daughter of Jeremiah; she was from Libnah": the father of Josiah's wife, a different man, not the prophet. The same phrase at 2 Kings 23:31 and 24:18 was correctly left unlinked.

Judgement calls (kept as correct):
- Solomon: "servants of Solomon" (Ezra 2:55,58; Neh 7:57,60; 11:3) refers to the king's servants. "Solomon" in the Psalm 72 and 127 headings, Proverbs and Song of Solomon is the king. Both are fine.
- Samuel: 1 Chr 6:28 and 6:33 are the prophet's genealogy, and are fine.
- Elijah: 2 Chr 21:12 and Malachi 4:5 are the prophet, and the NT uses are fine.

## EXCLUDED-OK (unlinked occurrences)
- isaac
  - Amos 7:9 "high places of Isaac": the nation. EXCLUDED-OK.
  - Amos 7:16 "house of Isaac": the nation. EXCLUDED-OK.
- elijah
  - 1 Chronicles 8:27: a Benjamite son of Jeroham, another man.
  - Ezra 10:21: a priest of that name, another man.
  - Ezra 10:26: a layman of that name, another man.
- jeremiah (all other men of the name)
  - 2 Kings 23:31: father of Hamutal.
  - 2 Kings 24:18: father of Hamutal.
  - 1 Chronicles 5:24: head of a Manassite family.
  - 1 Chronicles 12:4: a Benjamite warrior.
  - 1 Chronicles 12:10: a Gadite warrior.
  - 1 Chronicles 12:13: a Gadite warrior.
  - Nehemiah 10:2: a priest who signed.
  - Nehemiah 12:1: a returning priest.
  - Nehemiah 12:12: a priestly house head.
  - Nehemiah 12:34: a procession member.
  - Jeremiah 35:3: father of Jaazaniah the Rechabite.
- hezekiah
  - Ezra 2:16: ancestor of a returning family "through Hezekiah".
  - Nehemiah 7:21: same.
  - Nehemiah 10:17: a signer of the covenant.
  - Zephaniah 1:1: Zephaniah's ancestor Hezekiah. The text does not identify him as the king, so NONE is right under the "cannot tell" rule.

## Checks done
- All non-core-book links were read for every character: Samuel 12 outside Samuel, Elijah 35 outside Kings, all Isaiah, Stephen, Barnabas, Nebuchadnezzar, Hezekiah, Solomon and Isaac outside Genesis, and Jeremiah outside the book.
- 40 random links each from Samuel, Elijah, Jeremiah (book) and Isaac (Genesis) were read, with no errors beyond those listed above.
- A pattern scan of every link preceded by "son/daughter/house/servants/father of" found only the Jeremiah 52:1 error.
