# Moby-Dick character-card link rulings (modern-en)

Status: **content accepted / handed off (not published).** Content-only; nothing under `app/`, no registry, scripts, or live files were touched, and `moby-dick.v1.json` is unmodified.

## What was ruled
The accepted modern-en repair (`candidate.json`, sha256 `1a3f31bb…d52c`) rewrote 1,614 paragraphs. The live package `moby-dick.v1.json` (sha256 `dccdb35d…4019`, read from origin/main `fe699e90`) has 1779 modern-en name links. Every link was compared with the candidate:

| Category | Links |
|---|---|
| In unchanged paragraphs (untouched, byte-identical) | 457 |
| In changed paragraphs | 1322 |
| &nbsp;&nbsp;KEEP (same coordinates still valid) | 323 |
| &nbsp;&nbsp;RE-POINT (new coordinates) | 959 |
| &nbsp;&nbsp;DROP | 40 |

**The earlier count of 23 spans was not reliable.** Of the 1,322 links in changed paragraphs, 325 have their text still at the old offsets (323 KEEP; 2 of the 325 are coincidences where a different token of the same name now sits at the old offset, so those links were re-pointed to their own mention), 990 keep their text in the paragraph but at shifted offsets, and 7 have no matching text at all. In total 999 links need action: 959 RE-POINT and 40 DROP.

The 7 "text gone" links in `character-card-impact.json` resolve as: "Captain Ahab" ch33 p6 -> RE-POINT to "Ahab" (L0478, same clause, now "Ahab, my Captain"); Daggoo x2 (ch48 p23, p34), Fedallah ch50 p6, Stubb ch64 p8, Moby Dick ch111 p3 and Ahab ch123 p3 -> DROP.

Per character (links in each category):

| Character | Total | Unchanged para | KEEP | RE-POINT | DROP |
|---|---|---|---|---|---|
| ahab | 487 | 99 | 73 | 304 | 11 |
| bildad | 76 | 31 | 20 | 25 | 0 |
| daggoo | 36 | 9 | 10 | 14 | 3 |
| elijah | 15 | 6 | 5 | 4 | 0 |
| father-mapple | 9 | 0 | 2 | 7 | 0 |
| fedallah | 26 | 6 | 5 | 14 | 1 |
| flask | 94 | 30 | 19 | 44 | 1 |
| ishmael | 18 | 1 | 2 | 15 | 0 |
| moby-dick-whale | 142 | 25 | 13 | 99 | 5 |
| peleg | 73 | 31 | 16 | 25 | 1 |
| pip | 70 | 18 | 11 | 41 | 0 |
| queequeg | 246 | 57 | 41 | 139 | 9 |
| starbuck | 188 | 58 | 39 | 90 | 1 |
| stubb | 245 | 78 | 59 | 103 | 5 |
| tashtego | 54 | 8 | 8 | 35 | 3 |

## Method
1. Baseline (`baseline-live-modern-en.json`, sha256 `2ab04dd7…763c`) verified byte-equal to the package's pinned `sourceSha256`; all 1779 links' text verified at their old offsets.
2. For each changed paragraph containing links, name occurrences (all linked forms, longest-first) were extracted from old and new text and aligned. Where the sequence of name forms is identical old→new the occurrences were matched in order (checked against context similarity); the other 56 paragraphs plus 5 mis-aligned or recast ones were ruled by hand-reading old and new text.
3. **Rule:** RE-POINT/KEEP only when the same mention (same clause, possibly recast) survives. If the clause was replaced, the name became a pronoun/epithet, or two successors are equally plausible, the link is DROPped: identity is never guessed. Link text is the literal name form in the candidate; when the form changed the link takes the new form (L0121 "Peleg"→"Captain Peleg", L0478 "Captain Ahab"→"Ahab").
4. Identity: every linked token is the character's own name string (no biblical Ahab/Peleg/Bildad, no "Pippin", no plural "Ahabs" ch123 p7, no generic white whale); the six "Captain X" forms remain titles of the person. Flask/Stubb/Starbuck and Bildad/Peleg tokens were confirmed against the surrounding clause by ruler and by two independent review rounds.
5. Reveal points: every character's first link (the introduction anchor) remains the earliest link; no re-pointed link precedes it; the candidate has no earlier name occurrences than the baseline (word-boundary search for each name before its anchor: 0 in both). See VERIFICATION.md.

## Anchors (snapshots / first mentions)
Seven characters have their introduction paragraph in a changed paragraph: ishmael, tashtego, daggoo (offsets unchanged) and queequeg (3/65: end offset 53→57), father-mapple (8/0: 279→299), peleg (16/3: 1003→1062), pip (27/8: 2385→2564). `anchorRulings` in RULINGS.json lists the four fields per snapshot (`firstMention`, `roleVisibleAt`, `availableAt`, `evidence[].throughOffset`) to update. Snapshot/card copy itself does not depend on paragraph text and needs no edit.

## Hard cases
- **Ordinal traps.** ch61 p8 has three "Stubb" tokens in old and new, but the old middle one ("ahead of Stubb's boat") vanished; ordinal matching would have moved a link onto the wrong clause. Handled by hand (L0871–L0873 region). Round-2 planted-error testing showed reviewers detect this class.
- **Recast paragraphs.** ch44 p8/p9/p11, ch47 p12, ch64 p4, ch66 p2, ch72 p0/p7, ch113 p27, ch118 p1: sentences replaced, so links drop even though same-name tokens remain nearby (listed in `optional-new-occurrences.json`, informational only).
- **Text-form changes:** ch33 p6 "Captain Ahab"→"Ahab" (word order became "Ahab, my Captain"); ch16 p43 "Peleg"→"Captain Peleg".
- **Reorders:** ch109 p19 (Starbuck/Ahab swap order): L1267–L1268 follow the mention, not the position.
- **ch111 p3** ("hated White Whale"): dropped as a non-package form; reviewers flagged as low-confidence but agreed.
- **Moderate-confidence keeps:** ch44 p11 L0700 ("what seemed Ahab rushed from his room" as the recast sleepwalker sentence).

## All 40 drops
| Id | Character | Old link | Reason |
|---|---|---|---|
| L0058 | queequeg | ch13 p0 110-118 "Queequeg" | "using Queequeg's money" became "my comrade's money"; no name. |
| L0072 | queequeg | ch13 p6 963-971 "Queequeg" | "Queequeg grabbed the man" became "the brawny savage caught him"; no name. |
| L0158 | peleg | ch16 p62 55-60 "Peleg" | "turning solemnly toward Peleg" became "toward him"; no name. |
| L0263 | queequeg | ch18 p21 313-321 "Queequeg" | "grasping both Queequeg's hands" became "grasping those hands"; no name. |
| L0658 | moby-dick-whale | ch41 p18 766-775 "Moby Dick" | "identify with Moby Dick" became "identify with him"; no name. |
| L0688 | ahab | ch44 p8 501-505 "Ahab" | Paragraph expanded ~3x; the sentences carrying the three old links ("Ahab could not hope... to find Moby Dick", "Ahab could put himself in the best position") no longer exist. The new "So although Moby Dick had... been seen" is a different clause. |
| L0689 | moby-dick-whale | ch44 p8 589-598 "Moby Dick" | Paragraph expanded ~3x; the sentences carrying the three old links ("Ahab could not hope... to find Moby Dick", "Ahab could put himself in the best position") no longer exist. The new "So although Moby Dick had... been seen" is a different clause. |
| L0690 | ahab | ch44 p8 782-786 "Ahab" | Paragraph expanded ~3x; the sentences carrying the three old links ("Ahab could not hope... to find Moby Dick", "Ahab could put himself in the best position") no longer exist. The new "So although Moby Dick had... been seen" is a different clause. |
| L0692 | ahab | ch44 p9 844-848 "Ahab" | Old "Ahab could hope... Moby Dick might be spotted" replaced by a new sentence. The surviving "the White Whale ... turn up" / "blow Moby Dick into ... wake" are ambiguous successors (text form differs, two candidates) so dropped. |
| L0693 | moby-dick-whale | ch44 p9 914-923 "Moby Dick" | Old "Ahab could hope... Moby Dick might be spotted" replaced by a new sentence. The surviving "the White Whale ... turn up" / "blow Moby Dick into ... wake" are ambiguous successors (text form differs, two candidates) so dropped. |
| L0698 | ahab | ch44 p11 931-935 "Ahab" | Sentences recast. "Ahab's deeper self" (L0698) and "Ahab's eternal, living principle" (L0699) clauses are gone; the nearby new "this Ahab who had gone to his hammock" is an apposition to "crazy Ahab", and "in Ahab's case" is a different clause. Reviewers R3/R3b judged both drops. |
| L0699 | ahab | ch44 p11 1328-1332 "Ahab" | Sentences recast. "Ahab's deeper self" (L0698) and "Ahab's eternal, living principle" (L0699) clauses are gone; the nearby new "this Ahab who had gone to his hammock" is an apposition to "crazy Ahab", and "in Ahab's case" is a different clause. Reviewers R3/R3b judged both drops. |
| L0737 | tashtego | ch47 p12 539-547 "Tashtego" | "Suddenly Tashtego gave a tremendous shout" removed; new "the fish Tashtego had seen" is a different clause. |
| L0772 | ahab | ch48 p20 851-855 "Ahab" | The old sentence "Ahab was seen steadily managing his steering oar" was merged into the previous clause with no repeated name. |
| L0780 | daggoo | ch48 p23 569-575 "Daggoo" | Old closing sentence ("the huge Daggoo loomed... Flask would still be the first to see a whale") replaced; no Daggoo/Flask in the new ending. |
| L0781 | flask | ch48 p23 616-621 "Flask" | Old closing sentence ("the huge Daggoo loomed... Flask would still be the first to see a whale") replaced; no Daggoo/Flask in the new ending. |
| L0793 | stubb | ch48 p30 670-675 "Stubb" | "Instantly, Stubb's pipe went out" replaced by Tashtego's cry; no Stubb. |
| L0795 | daggoo | ch48 p34 581-587 "Daggoo" | Old "he cried to Daggoo" clause removed; no Daggoo in the new paragraph. |
| L0826 | fedallah | ch50 p6 554-562 "Fedallah" | "Fedallah's crew" became "Beelzebub himself"; no Fedallah. |
| L0835 | ahab | ch51 p9 839-843 "Ahab" | Old "Ahab stubbornly refused to seek shelter in the cabin" is now carried by "he"; the new "still wordless Ahab stood up" is in added material (R3 and R3b). |
| L0847 | tashtego | ch54 p2 1626-1634 "Tashtego" | The closing sentence "the story Tashtego half-consciously told us" was removed. |
| L0872 | stubb | ch61 p8 252-257 "Stubb" | Old "ahead of Stubb's boat" became "ahead of the smoker's boat"; no name. (Ordinal matching would have mis-aimed this; caught by the ruler.) |
| L0880 | tashtego | ch61 p14 543-551 "Tashtego" | "Tashtego snatched his knife" clause removed. |
| L0886 | stubb | ch61 p18 365-370 "Stubb" | "Stubb delivered his thrusts" clause replaced by a nameless clause. |
| L0895 | moby-dick-whale | ch64 p2 389-398 "Moby Dick" | "not one could be Moby Dick" became "not one of them would bring his goal closer"; no name. |
| L0899 | starbuck | ch64 p4 336-344 "Starbuck" | Old "small helpful task from Starbuck was readily accepted by Stubb" sentence replaced by different content; the nearby new "Stubb" tokens belong to different clauses. |
| L0900 | stubb | ch64 p4 369-374 "Stubb" | Old "small helpful task from Starbuck was readily accepted by Stubb" sentence replaced by different content; the nearby new "Stubb" tokens belong to different clauses. |
| L0904 | stubb | ch64 p8 734-739 "Stubb" | "Stubb's whale" sentence removed. |
| L0924 | queequeg | ch66 p2 397-405 "Queequeg" | Old "Queequeg wielded his blade / Queequeg's keen spade" clauses replaced; the surviving "poor Queequeg's hand" is a different clause. |
| L0925 | queequeg | ch66 p2 514-522 "Queequeg" | Old "Queequeg wielded his blade / Queequeg's keen spade" clauses replaced; the surviving "poor Queequeg's hand" is a different clause. |
| L0954 | queequeg | ch72 p0 533-541 "Queequeg" | Old clauses ("At the time of my telling this, Queequeg was working...", "Queequeg and I were joined") replaced by a different narrative; new Queequeg mentions belong to different clauses. |
| L0955 | queequeg | ch72 p0 771-779 "Queequeg" | Old clauses ("At the time of my telling this, Queequeg was working...", "Queequeg and I were joined") replaced by a different narrative; new Queequeg mentions belong to different clauses. |
| L0962 | queequeg | ch72 p7 282-290 "Queequeg" | Old "Queequeg was further protected by his harpooner friends" and "careful not to strike Queequeg himself" became nameless ("he", "over his head"); new Queequeg mentions are different clauses. |
| L0963 | queequeg | ch72 p7 487-495 "Queequeg" | Old "Queequeg was further protected by his harpooner friends" and "careful not to strike Queequeg himself" became nameless ("he", "over his head"); new Queequeg mentions are different clauses. |
| L1024 | daggoo | ch78 p4 169-175 "Daggoo" | "Daggoo, having cleared the foul line" became "the negro, having cleared..."; no name. |
| L1303 | moby-dick-whale | ch111 p3 345-354 "Moby Dick" | "nearing Moby Dick" became "the hated White Whale must even then be swimming": text form differs ("the hated White Whale" is not a package form). Dropped conservatively; possible optional new link, see optional-new-occurrences.json. |
| L1323 | ahab | ch113 p27 481-485 "Ahab" | Old closing sentence "presented to Ahab" replaced; the new "Ahab moodily stalked away" is a different sentence. |
| L1344 | ahab | ch118 p1 431-435 "Ahab" | Old "One morning, Ahab raised his ivory leg... quadrant" clause replaced; new Ahab tokens are in different sentences. |
| L1409 | ahab | ch123 p3 230-234 "Ahab" | "which Ahab was to steer" became "which he was to steer"; no name. |
| L1623 | ahab | ch133 p32 116-120 "Ahab" | "long tension of Ahab's bodily strength" became "his bodily strength"; new sentence-initial "Ahab was dragged" is a different clause. |

## Files
`RULINGS.json` (machine-readable; one entry per link, old/new coordinates, review record), `optional-new-occurrences.json` (informational, unreviewed), `paragraph-hash-updates.tsv`, `review/` (raw reviewer outputs), `VERIFICATION.md`, `INTEGRATION-NOTES.md`.
