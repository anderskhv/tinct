# Moby-Dick modern-en: independent review of 23 unresolved character mentions

**Result: 3 map, 20 drop.** Every ruling is by clause-level correspondence. None uses name-occurrence order or a bare string match.

## Inputs and reproduction

| Input | sha256 |
|---|---|
| in/live-modern-en.json | 2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c |
| in/candidate-modern-en.json | 1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c |
| in/original-en.json | 30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952 |
| in/moby-dick.v1.json | dccdb35d2c4d2cfc7e1c8faba22807c1754cdaf356127f9229c836502fe34019 |
| in/prepare-reviewed-editions.py | 18707f6ea00430d25f9d05893ccce2c080b58150d864384f23eb459da756a9b2 |

I loaded the tool read-only with importlib and started from the card's 1779 modern-en mentions. I removed the 7 `goneMentions`; each matched exactly one mention on (characterId, chapterNumber, paragraphIndex, text). I then ran `reanchor(asset, live, candidate, rev, allow_alias_changes=False)` with no approved mappings. The run gave 1749 retained mentions, **23 `droppedMentions`** and 51 `relocatedExactNames`. Script: `scripts/reproduce_inventory.py`.

### Rule applied

A mention is mapped only when the candidate keeps the **same reference**. That means the same clause and the same role in it, expressed with one of the character's reviewed spellings, which are the exact, case-sensitive `text` values from both editions:

| Character | Reviewed spellings |
|---|---|
| ahab | Ahab, Captain Ahab |
| bildad | Bildad, Captain Bildad |
| peleg | Peleg, Captain Peleg |
| moby-dick-whale | Moby Dick, the White Whale |
| every other character | its single name |

A mapped span must not overlap a retained span. If the candidate uses a pronoun, an epithet or a descriptor at that reference, the mention is dropped. It is also dropped when the clause no longer names the character or the live sentence has no counterpart. Free occurrences of a name elsewhere in the paragraph were never used, because this release creates no new binding.

## Rulings

| # | Character | Ch/¶ | Existing (live) | Decision | Final span (candidate) | Reason |
|---|---|---|---|---|---|---|
| 1 | queequeg | 13/0 | [110,118) Queequeg | drop | – | "using Queequeg's money" → "using, however, **my comrade's** money" (epithet) |
| 2 | queequeg | 13/6 | [963,971) Queequeg | drop | – | "Queequeg grabbed the man" → "**the brawny savage** caught him" (epithet) |
| 3 | queequeg | 16/2 | [557,565) Queequeg | **map** | **[557,565) "Queequeg"** | "a day of … prayer for Queequeg and Yojo" → "for it seemed that for Queequeg and Yojo that day was some sort of Lent or Ramadan" (same clause) |
| 4 | peleg | 16/62 | [55,60) Peleg | drop | – | "turning solemnly toward Peleg" → "toward **him**" (pronoun) |
| 5 | queequeg | 18/21 | [313,321) Queequeg | drop | – | "grasping both Queequeg's hands" → "grasping **those hands**" (no name) |
| 6 | moby-dick-whale | 41/18 | [766,775) Moby Dick | drop | – | "came to identify with Moby Dick" → "identify with **him**" (pronoun) |
| 7 | ahab | 44/8 | [501,505) Ahab | drop | – | The live recasts the sentence with Ahab as subject. In Melville and the candidate the agent is "the Pequod … she would infallibly meet him there", so Ahab is not referenced. |
| 8 | moby-dick-whale | 44/8 | [589,598) Moby Dick | drop | – | "to find Moby Dick" corresponds to "meet **him** there" (pronoun). The same-sentence "Moby Dick" [655,664) is in a different, concessive clause. |
| 9 | ahab | 44/9 | [844,848) Ahab | drop | – | The live route sentence is invented. In Melville and the candidate the counterpart is "lay before **him** … **he** would spend" (pronoun). |
| 10 | ahab | 48/20 | [851,855) Ahab | drop | – | The candidate drops the repeated subject. The one "Ahab" [692,696) is held by the retained mention from live @733. |
| 11 | ahab | 48/20 | [1368,1372) Ahab | **map** | **[1294,1298) "Ahab"** | "though from his closer vicinity Ahab had observed it" → "though Ahab, being closer, had observed it" (same clause) |
| 12 | flask | 48/23 | [616,621) Flask | drop | – | The live sentence ("Flask would still be the first to see a whale") is invented. The candidate has only "King-Post". |
| 13 | stubb | 48/30 | [670,675) Stubb | drop | – | "Instantly, Stubb's pipe went out of his mouth" appears only in the live. |
| 14 | tashtego | 54/2 | [1626,1634) Tashtego | drop | – | "This is the story Tashtego half-consciously told us" appears only in the live. |
| 15 | tashtego | 61/14 | [543,551) Tashtego | drop | – | The fouled-line and knife episode appears only in the live. The candidate restores "Stern all! … It was the magical line". |
| 16 | stubb | 61/18 | [365,370) Stubb | drop | – | The live invents the main clause "Stubb delivered his thrusts". In the candidate the clause's subject is **the boat**. |
| 17 | moby-dick-whale | 64/2 | [389,398) Moby Dick | drop | – | "not one could be Moby Dick" → "bring **his grand, monomaniac goal** one jot closer" (descriptor) |
| 18 | starbuck | 64/4 | [336,344) Starbuck | drop | – | The live mistranslates the sentence. Melville and the candidate ("One small … cause of all this liveliness in Stubb") do not reference Starbuck. |
| 19 | queequeg | 66/2 | [397,405) Queequeg | drop | – | "Queequeg wielded his blade…" appears only in the live. The candidate reads "**they** kept up a ceaseless murdering of the sharks". |
| 20 | queequeg | 66/2 | [514,522) Queequeg | drop | – | "Queequeg's keen spade … sliced" appears only in the live. The free "Queequeg's" [1273,1281) is a different clause, about the shark biting his hand. |
| 21 | queequeg | 72/7 | [282,290) Queequeg | drop | – | "Queequeg was further protected by…" → "**he** had yet another protection" (pronoun) |
| 22 | daggoo | 78/4 | [169,175) Daggoo | drop | – | "Daggoo, having cleared the foul line" → "**the negro**, having cleared the foul line" (epithet, restored from Melville) |
| 23 | moby-dick-whale | 134/13 | [628,643) the White Whale | **map** | **[522,537) "the White Whale"** | "did the White Whale now reveal his vicinity" → "For the White Whale now revealed his nearness" (same clause) |

Drops by class:

| Class | Count | Items |
|---|---|---|
| drop-live-invention | 7 | #12–16, #19, #20 |
| drop-pronoun | 5 | #4, #6, #8, #9, #21 |
| drop-epithet | 3 | #1, #2, #22 |
| drop-not-referenced-in-counterpart | 2 | #7, #18 |
| drop-no-name-in-clause | 1 | #5 |
| drop-descriptor | 1 | #17 |
| drop-merged-into-held-span | 1 | #10 |

## Concerns on the 23

1. **#8 is the closest call.** A sentence-level policy would map it to "Moby Dick" [655,664) in the same candidate sentence. That occurrence is the subject of "although Moby Dick had in a former year been seen … on the Seychelle ground", and the live sentence does not render that clause. The live object "find Moby Dick" corresponds to "meet him there". I rule **drop**. If the other reviewer mapped it to [655,664), the difference is one of policy, not a slicing error.
2. **#3 has a coincidental offset.** The live and candidate spans are both [557,565) because the preceding text happens to be the same length. The map rests on clause correspondence. The paragraph also has a free "Queequeg" [276,284), "no effect on Queequeg", where the live had "him". It is a different reference and must stay unbound. Naive occurrence-order matching (4th of 5 live → 4th of 6 candidate) would have chosen [483,491). That span is the held "I left Queequeg shut up with Yojo", so the result would have been wrong. The tool itself refuses here because the counts differ.
3. **Decoys that a string match would take:**

   | Paragraph | Free name | Why it is not a replacement |
   |---|---|---|
   | 44/8 | Ahab [1161,1165), [1428,1432) | In sentences the live omitted |
   | 44/8 | Moby Dick [655,664), [1674,1683) | Different clause (see #8); a sentence the live omitted |
   | 66/2 | Queequeg [1273,1281) | Shark-bite clause, not the live's spade clause |
   | 72/7 | Queequeg [824,832), [906,914) | The "poor Queequeg … prayed to his Yojo" sentence |
   | 61/14 | Stubb [585,590), [997,1002) | A different character from the dropped Tashtego mention |

   None of these is the same reference, so none is mapped.
4. **#23 uses the lower-case spelling.** "the White Whale", with a lower-case "the", is the exact reviewed spelling, and the tool's `unchanged_name_span` skips names that start in lower case. That is why this mention reached the inventory even though the name count (1 and 1) matches.

## Other findings in the same 20 paragraphs

**Retained mentions.** I paired all 54 retained mentions in these paragraphs with their live sources and compared clauses (`retained-audit-affected-paragraphs.json`). All 54 name the correct character. 51 sit on the corresponding clause. Three sit on a different or loosely matching clause. None of the three is an identity error:

| Ch/¶ | Retained (live → candidate) | Problem |
|---|---|---|
| 44/8 | ahab @782 → [2173,2177) | **Wrong clause.** The live sentence "The key was this: … Ahab could put himself in the best possible position, narrowing the odds" is a loose condensation. The anchor is Melville's last sentence, "with which Ahab threw his brooding soul into this unfaltering hunt", which the live never rendered. The nearest counterpart would be "as Ahab fondly thought" [1428,1432). |
| 44/9 | moby-dick-whale @914 → [1021,1030) | **Loose clause.** "Moby Dick might be spotted" comes from an invented live sentence. The anchor "might blow Moby Dick into … the Pequod's circumnavigating wake" is in a sentence the live omitted. The closer counterpart is "in case the White Whale … should by chance turn up" [673,688). |
| 72/7 | queequeg @487 → [575,583) | **Different clause of the corresponding sentence.** The live "careful not to strike Queequeg himself" corresponds to "in their hasty zeal to help him … closer to cutting off a leg" (a pronoun). The anchor is "They wanted Queequeg's greatest happiness". |

The retained Stubb in 64/4 (@369 → [392,397), "liveliness in Stubb") is acceptable. It sits on the corresponding sentence, which the live mistranslated. That mistranslation is also why #18 (Starbuck) drops.

**Unbound names the candidate restores.** These 15 names come back with Melville's text in these paragraphs. Each one matches a binding in the original-en card. They stay unbound under this release's no-new-binding rule and are candidates for a later binding pass:

| Ch/¶ | Unbound spans |
|---|---|
| 16/2 | Queequeg [276,284) |
| 44/8 | Moby Dick [655,664), Ahab [1161,1165), Ahab [1428,1432), Moby Dick [1674,1683) |
| 44/9 | the White Whale [673,688) |
| 54/2 | Captain Ahab [696,708) |
| 61/14 | Stubb [585,590), Stubb [997,1002) |
| 64/4 | Stubb [429,434) |
| 66/2 | Queequeg [1273,1281) |
| 72/7 | Tashtego [386,394), Daggoo [399,405), Queequeg [824,832), Queequeg [906,914) |

## Outside the 23 paragraphs: a duplicate the tool creates (please fix before release)

My check across every retained span found **one overlap, and it is an exact duplicate**. In ch61 ¶8 the retained output contains `stubb [344,349) "Stubb"` twice.

- Live @314 ("Stubb counted on the honor of the kill") projects correctly to [344,349) ("Stubb counted on the honor of the capture").
- Live @252 ("being now ahead of **Stubb's** boat") corresponds in Melville and the candidate to "ahead of **the smoker's** boat", an epithet ("the smoker's" starts at offset 276), so it should be **dropped**. `unchanged_name_span` instead moved it by occurrence order (the 2nd of 3 in both texts) onto [344,349), which duplicates the mention above.
- The candidate's third "Stubb" [605,610) ("still puffing at his pipe, Stubb cheered") stays unbound.

**Recommended fix:** remove the relocated duplicate that came from live @252.

The other 50 occurrence-order relocations name the correct character. A context-similarity screen (`scripts/screen_relocations.py`) shows several land on a different clause in heavily rewritten paragraphs, such as 72/0 and 44/11. I did not rule on those; audit them if clause-accurate anchoring matters.

## Verification

- `scripts/build_rulings.py` asserts four things:
  - Every quoted Live, Melville and Candidate fragment in `evidence` is a verbatim, unique substring of the normalized paragraph.
  - The live quote contains the existing span.
  - Each map span is located inside its unique clause quote, not by occurrence order.
  - Each map span's slice equals `text`, is a reviewed spelling for the character, and overlaps no retained span.
- `scripts/verify_rulings.py` re-checks the output on a separate code path: raw JSON, then normalization, then UTF-16 slicing. It confirms inventory order, the schema, the slices, reviewed spellings, word boundaries and no overlap. Passed.
- A separate check sliced all 54 candidate offsets cited in the evidence and concern text. Each one is the stated name.
- Retained mentions plus the 3 maps give 1752 modern-en mentions. Every slice verifies. No map overlaps anything; the only overlap is the ch61 ¶8 duplicate above.

## Files (out/)

| File | Contents |
|---|---|
| `reviewer-rulings.json` | The 23 rulings, in inventory order |
| `inventory.json` | The 23 dropped mentions as the tool emits them |
| `retained-modern-en-mentions.json` | The 1749 re-anchored mentions |
| `removed-gone-mentions.json` | The 7 removed mentions |
| `relocated-exact-names.json` | The 51 occurrence-order relocations |
| `retained-audit-affected-paragraphs.json` | The 54 retained mentions in these 20 paragraphs, with live/candidate context and my judgment |
| `scripts/` | The scripts used for this review |
