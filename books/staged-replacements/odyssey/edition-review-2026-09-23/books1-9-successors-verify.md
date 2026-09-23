# Books 1–9 successors: independent verification

Package: `/home/user/tinct-ody/books/staged-replacements/odyssey` (read-only; no file in it was edited).
Method: each accepted `bookNN/candidate-v2.json` was diffed word by word against the latest successor using difflib over the paragraph arrays, so every paragraph was compared, not a sample. Each change was then read against `source-bookN.json` at the same 0-based index and its neighbours, and checked against the recorded ruling. The `number` and `title` fields and the key sets are the same in every pair. Note: `continuity.md` and the ledger use 1-based `B0N-P0xx` labels, so P010 is index 9.

## 1–2. Every change (23 word-level changes in 18 paragraphs, 6 Books)

| # | Book ¶ (0-based) | v2 → latest | Butler | Ruling / convention | Verdict |
|---|---|---|---|---|---|
| 1 | B1 ¶9 (v4) | `and led her to a richly worked seat` → `showed her to` | `He led the way… he conducted her to a richly decorated seat` | Collision backlog (B01-P010): `led` was written twice where Butler varies it | **OK.** Butler's two verbs are distinct again, and it reads naturally. |
| 2 | B1 ¶18 (v3) | `a beloved daughter deserves` → `may expect` | `so dear a daughter may expect` | Finding 11.1, changes-v2-to-v3.md | **OK.** This is Butler's exact wording. |
| 3 | B1 ¶18 (v4) | `let me urge you` → `let me persuade you` | `let me prevail upon you` (after an earlier `I would… urge you`) | Collision backlog (B01-P019) | **OK.** It restores Butler's two degrees of pressing, and the earlier `I urge you` still stands. |
| 4 | B1 ¶18 (v4) | `a fine, capable-looking young man` → `good-looking` | `a fine, smart looking fellow` | Collision backlog (B01-P019) | **OK.** `smart looking` is about appearance, so `good-looking` fixes a change of sense. |
| 5 | B1 ¶21 (v4) | `marveled at it` → `wondered at it` | `wondered at it` | Collision backlog (B01-P022) | **OK.** This is Butler's word. |
| 6 | B1 ¶23 (v4) | `poets love to sing. Sing the suitors` → `celebrate.` | `such as poets love to celebrate. Sing the suitors` | Collision backlog (B01-P024) | **OK.** This is Butler's word, and it removes the `sing. Sing` repetition. |
| 7 | B2 ¶0 (v6) | `councillors` → `councilors` | `councillors` | A6 / D9 American spelling | OK |
| 8 | B2 ¶2 (v6) | `councillors` → `councilors` | `councillors` | A6 / D9 | OK |
| 9 | B2 ¶16 (v4) | `sea shore` → `seashore` | `sea shore` | Ruling 1 / D15 (`seashore`) | OK |
| 10 | B2 ¶24 (v6) | `store-room` → `storeroom` | `store-room` | D26 register / A6 | OK |
| 11 | B2 ¶24 (v6) | `store-room` → `storeroom` (2nd) | `store-room` | D26 / A6 | OK |
| 12 | B2 ¶32 (v5) | `water side` → `waterside` | `water side` | compound_drift closed-word axis (D15) | OK. Matches Book 6 (`waterside` ×2). |
| 13 | B2 ¶33 (v3) | `mixing bowls` → `mixing-bowls` | `mixing bowls` | Finding 27.1 / PUNCTUATION §4 table | OK. Matches Books 1, 3, 4 and 9. |
| 14 | B3 ¶0 (v3) | `sea shore` → `seashore` | `sea shore` | Ruling 1 / D15 | OK |
| 15 | B4 ¶0 (v3) | `low lying` → `low-lying` | `low lying` | D15, PUNCTUATION §4 "superseded at Book 5" | OK. Matches Book 5. |
| 16 | B4 ¶9 (v4) | `he was in two minds whether` → `he did not know whether` | `he doubted whether to let him choose…` | A4(i), fifth successor; GLOSSARY: `thus in two minds` → `still undecided` is reserved for that phrase | **OK.** It is faithful to `doubted whether` and grammatical, and it adds nothing. It stops the phrase being used for two different Butler verbs, since ¶10's `thus in two minds` is still `still undecided`. It is consistent with B06-P012 `did not know what to do`. |
| 17 | B4 ¶16 (v5) | `and in the morning I do not care` → `and later in the day I do not care` (+`later`, `morning`→`day`) | `Morning will come in due course, and in the forenoon I care not how much I cry` | Collision backlog (B04-P017), which records the widening | **Defect: non-blocking meaning issue.** The ruling was right to remove the `Morning… morning` repetition, and the result is grammatical and clear aloud. But `forenoon` means the hours before noon, and `later in the day` takes that limit away. The ruling's stated reason, that every rendering keeping the limit reused `morning`, is false: `before noon` keeps it. Fix below. |
| 18 | B4 ¶17 (v3) | `well disposed` → `well-disposed` | `well disposed` | D15, PUNCTUATION §4 | OK. Matches Books 2, 5, 6 and 7. |
| 19 | B4 ¶37 (v3) | `sea shore` → `seashore` | `sea shore` | Ruling 1 / D15 | OK |
| 20 | B4 ¶39 (v5) | `offered holy sacrifices` → `offered great and holy sacrifices` | `offered holy hecatombs to the immortal gods` | Collision backlog (B04-P040): the scale of `hecatomb` is carried by an adjective, as at B01-P003 `great sacrifice` | **OK.** `Great` puts back the scale of `hecatomb` and adds no new idea. It keeps Butler's `holy`, reads naturally aloud, and matches Book 1's word for the scale. |
| 21 | B5 ¶29 (v3) | `mountain tops` → `mountaintops` | `mountain tops` | A5(a) | OK. Matches Book 6. |
| 22 | B6 ¶10 (v3) | `mountain tops` → `mountaintops` | `mountain tops` | A5(a) | OK |

All 23 changes are listed in the table. Row 11 counts the second `store-room` and row 17 covers two word operations, which is how 22 rows make 23. Every other change to a successor is accounted for in the rulings, and none was made without one.

On book01 ¶9, 18, 21 and 23 specifically: each change restores a word of Butler's or a distinction he makes. They add no new content, and in each paragraph the surrounding accepted text is otherwise unchanged.

Observation, out of scope because it is not a successor change: `book04/continuity.md` says that after this change "three accepted Books now treat his `hecatomb` the same way". Accepted Book 5 ¶8 still renders Butler's `choice hecatombs` as `choice victims`, and Book 4 ¶28 and ¶47 carry the scale in other ways (`great sacrifices`, `full and sufficient`). That is not a defect in the text, but the claim should be read as covering Books 1, 3 and 4 only.

## 3. Structure

| File | ¶ | source ¶ | empty ¶ |
|---|---|---|---|
| book01/candidate-v4.json | 32 | 32 | 0 |
| book02/candidate-v6.json | 35 | 35 | 0 |
| book03/candidate-v3.json | 38 | 38 | 0 |
| book04/candidate-v5.json | 81 | 81 | 0 |
| book05/candidate-v3.json | 37 | 37 | 0 |
| book06/candidate-v3.json | 26 | 26 | 0 |
| book07/candidate-v2.json | 29 | 29 | 0 |
| book08/candidate-v2.json | 50 | 50 | 0 |
| book09/candidate-v2.json | 44 | 44 | 0 |

No candidate file in Books 1–9 has an empty paragraph.

## 4. Hashes

| Latest file | sha256 (computed) | Ledger / RESUME record | Full hash elsewhere |
|---|---|---|---|
| book01/candidate-v4.json | 6e5ecb0a4b7a40d2ca2ccf17ef36408bb95c6980a2584b522d37526959a77de8 | ledger `6e5ecb0a…` ✓ | continuity.md, checks-v4.md ✓ |
| book02/candidate-v6.json | a6fb810374a9d378559234ae71d85ff7deec96884b7823c2c54b3473a23798ba | ledger `a6fb8103…` ✓ | checks-v6.md ✓ |
| book03/candidate-v3.json | a79bacf6fd5f4a995b27d404e38e58790487bd4586bb144c7a0503408554ce1e | ledger `a79bacf6…8554ce1e` ✓ | checks-v3.md ✓ |
| book04/candidate-v5.json | 3c21549edf30a74d5f1a5bedfe01f53823267a46caae97f59e0ebf5ce6c9986d | ledger `3c21549e…` ✓ | continuity.md, checks-v5.md ✓ |
| book05/candidate-v3.json | c8af4cc34217aba462a4f432d23382a61229ac35d54c44ffa01f24ce328cd3ff | ledger `c8af4cc3…` ✓ | checks-v3.md ✓ |
| book06/candidate-v3.json | 1ae67a524c88f3a3f51b3fdcfe5bb4966e020e5129f5860314440b07157c8541 | ledger `1ae67a52…` ✓ | checks-v3.md ✓ |
| book07/candidate-v2.json | e79eb82b5ce6051dc3c61ca39c4480406cf0e2a106c0d53f5182fafe1d3163ac | ledger `e79eb82b…` ✓ | ACCEPTANCE.md full ✓ |
| book08/candidate-v2.json | 12f2904e6e40ac839a608797cf8f866d1f1e5227ae415f11aee6c0238f43de22 | RESUME `12f2904e…` ✓ | ACCEPTANCE.md full ✓ |
| book09/candidate-v2.json | f762b7a33e3517af11fe6113908e16318fbe26ad30dc17e6534854b643d36485 | RESUME full ✓ | ACCEPTANCE.md full ✓ |

Caveat: the ledger and RESUME record most of these hashes as 8-character prefixes only. Every prefix matches, and the full hash of each file matches the full value recorded in that Book's `checks-vN.md`, `continuity.md` or `ACCEPTANCE.md`.

For Books 7–9, `candidate-v2.json` is the only successor file. It is the file named in each `ACCEPTANCE.md`, and its sha256 equals the hash recorded there, so it is byte-identical to the accepted file. Accepted v2 files for Books 1, 2, 5 and 6 match their full hashes in the ledger. The Book 3 and Book 4 v2 files match their ledger prefixes.

## Overall verdict: **DEFECTS FOUND** (1, non-blocking)

The other 22 changes are faithful to Butler, follow their recorded rulings, are grammatical and natural aloud, and add nothing new. Structure and hashes are clean.

Finding (also in `books1-9-successors-findings.json`):

```json
[{"book":4,"paragraph":16,"old":"and later in the day I do not care how much I cry","new":"and in the hours before noon I do not care how much I cry","category":"meaning","blocking":false,"reason":"Butler's 'in the forenoon I care not how much I cry' ends at noon, and 'later in the day' drops that limit; book04/continuity.md accepts the widening because 'every rendering that kept the bound reused the word morning', but 'before noon' keeps the limit without using 'morning' a second time."}]
```

The `old` string was checked in python: it occurs exactly once in `book04/candidate-v5.json` ¶16. With the fix the sentence reads: "Morning will come in its own time, and in the hours before noon I do not care how much I cry for those that are dead and gone."

---

## Addendum: book04/candidate-v6.json (the coordinator's fix)

- **sha256:** `289384111ad98c014acb13f75a5474e9e58e682073d99c4dd15d848c595fcfbe`. This matches the prefix the coordinator gave (`289384111ad98c01…`).
- **Diff against v5:** only ¶16 changed. `number`, `title` and the keys are unchanged. Applying the proposed replacement to v5 ¶16 gives v6 ¶16 exactly, and nothing else in the paragraph changed.
- **Inputs untouched:** v5 still hashes to `3c21549e…6c9986d`, and accepted v2 still hashes to `b3bef2f3…c674c446`.
- **¶16 against the source:** Butler has "Morning will come in due course, and in the forenoon I care not how much I cry for those that are dead and gone". v6 has "Morning will come in its own time, and in the hours before noon I do not care how much I cry for those that are dead and gone".
  - The limit at noon is back, and "morning" appears once, as in Butler.
  - The sentence is grammatical, reads clearly aloud and adds nothing.
- **Neighbours:** ¶15 introduces Pisistratus's speech, and ¶17 has Menelaus answering "Your discretion… We will put an end, then, to all this weeping". Both still connect naturally to the new sentence.
- **Structure:** 81 paragraphs, the same as the source, and none is empty.

**Addendum verdict: VERIFIED CLEAN.** The one defect in the main report is resolved in `book04/candidate-v6.json`.
