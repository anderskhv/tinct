# Moby-Dick — character-span ledger (readable form)

The authoritative form is `ledger/final-mapping.jsonl` (sha256 `4ed6343f72440f4c8cea1cbfda413dafc04fe272332a1a06276b15ef0cc34b3f`, 24 rows). Offsets are UTF-16 code units in the paragraph after `prose-reader-v1` normalization. "Existing" spans are in the live modern-en `2ab04dd7…`. Final spans are in the accepted candidate `1a3f31bb…`. Paragraph indices are 0-based.

**Result:** 3 map and 20 drop for the 23-span inventory. One more drop (MD-24) removes a duplicate that the tool creates outside the inventory. The independent reviewer agreed on all 24, decision and exact span.

| ID | Character | Ch.¶ | Existing (live) | Decision | Final span (candidate) | Class | Reason (short) |
|---|---|---|---|---|---|---|---|
| MD-01 | queequeg | 13.0 | [110,118) "Queequeg" | **drop** | — | descriptor-in-source | live "using Queequeg's money" → candidate restores "my comrade's money" |
| MD-02 | queequeg | 13.6 | [963,971) "Queequeg" | **drop** | — | epithet-in-source | live "Queequeg grabbed the man" → "the brawny savage caught him" (Melville's epithet) |
| MD-03 | queequeg | 16.2 | [557,565) "Queequeg" | **map** | [557,565) "Queequeg" | moved-within-clause | same clause, reordered: "for Queequeg and Yojo that day was some sort of Lent" |
| MD-04 | peleg | 16.62 | [55,60) "Peleg" | **drop** | — | pronoun-in-source | "turning solemnly toward him" (Melville's pronoun) |
| MD-05 | queequeg | 18.21 | [313,321) "Queequeg" | **drop** | — | no-name-in-clause | "grasping those hands": no name in the clause |
| MD-06 | moby-dick-whale | 41.18 | [766,775) "Moby Dick" | **drop** | — | pronoun-in-source | "came to identify with him" (Melville's pronoun) |
| MD-07 | ahab | 44.8 | [501,505) "Ahab" | **drop** | — | live-sentence-not-in-source | invented live condensation; the counterpart sentence names the Pequod, not Ahab |
| MD-08 | moby-dick-whale | 44.8 | [589,598) "Moby Dick" | **drop** | — | pronoun-in-source | live "to find Moby Dick" = candidate "meet him there"; the same-sentence "Moby Dick" is a clause the live omitted (closest call) |
| MD-09 | ahab | 44.9 | [844,848) "Ahab" | **drop** | — | live-sentence-not-in-source | invented live route sentence; Melville's counterpart uses pronouns |
| MD-10 | ahab | 48.20 | [851,855) "Ahab" | **drop** | — | resumptive-repetition-removed | resumptive repetition merged; the single "Ahab" is already held |
| MD-11 | ahab | 48.20 | [1368,1372) "Ahab" | **map** | [1294,1298) "Ahab" | moved-within-clause | same clause, reordered: "though Ahab, being closer, had observed it" |
| MD-12 | flask | 48.23 | [616,621) "Flask" | **drop** | — | live-sentence-not-in-source | invented live sentence; the candidate restores Melville's King-Post sentence |
| MD-13 | stubb | 48.30 | [670,675) "Stubb" | **drop** | — | live-sentence-not-in-source | invented live sentence ("Stubb's pipe went out") |
| MD-14 | tashtego | 54.2 | [1626,1634) "Tashtego" | **drop** | — | live-sentence-not-in-source | invented live sentence ("the story Tashtego … told us") |
| MD-15 | tashtego | 61.14 | [543,551) "Tashtego" | **drop** | — | live-sentence-not-in-source | invented live episode (knife, fouled line) |
| MD-16 | stubb | 61.18 | [365,370) "Stubb" | **drop** | — | no-name-in-clause | invented live main clause; in the candidate the boat is the subject |
| MD-17 | moby-dick-whale | 64.2 | [389,398) "Moby Dick" | **drop** | — | no-name-in-clause | "his grand, monomaniac goal": no name |
| MD-18 | starbuck | 64.4 | [336,344) "Starbuck" | **drop** | — | live-sentence-not-in-source | live mistranslation; Melville's "cause of all this liveliness in Stubb" does not name Starbuck |
| MD-19 | queequeg | 66.2 | [397,405) "Queequeg" | **drop** | — | live-sentence-not-in-source | invented live blubber-cutting scene |
| MD-20 | queequeg | 66.2 | [514,522) "Queequeg" | **drop** | — | live-sentence-not-in-source | invented live blubber-cutting scene; the later "poor Queequeg's hand" is a different event |
| MD-21 | queequeg | 72.7 | [282,290) "Queequeg" | **drop** | — | pronoun-in-source | "he had yet another protection" (Melville's pronoun) |
| MD-22 | daggoo | 78.4 | [169,175) "Daggoo" | **drop** | — | descriptor-in-source | candidate restores Melville's descriptor; consistent with lead decision 1 (48.23, 48.34) |
| MD-23 | moby-dick-whale | 134.13 | [628,643) "the White Whale" | **map** | [522,537) "the White Whale" | moved-within-clause | same clause, reordered: "For the White Whale now revealed his nearness" |
| MD-24 | stubb | 61.8 | [252,257) "Stubb" | **drop** | — | epithet-in-source | not in the inventory: the tool relocated live "Stubb's boat" (Melville: "the smoker's boat") by occurrence order onto [344,349), which a retained mention already holds. Drop the duplicate |

Full rationale, verbatim context quotes, paragraph hashes and the reviewer's independent evidence for every row are in the JSONL.
