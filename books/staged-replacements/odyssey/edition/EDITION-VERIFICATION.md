# Odyssey modern-en — whole-edition verification (2026-09-23)

Everything below was run on the final assembled candidate `edition/odyssey-modern-en.candidate.json`. Reproduce the assembly with `python3 edition/assemble.py <out.json>`.

## 1. Source completeness and structural alignment

- Candidate sha256 `bd05c7f43da64bfe4ad9908531f2a1434e79acc8635ca54cb1ad39942e9afc9c`, 607698 bytes.
- Serialization identical in form to live (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline): True
- 24 chapters numbered 1–24: True. Paragraph counts [32, 35, 38, 81, 37, 26, 29, 50, 44, 49, 54, 39, 38, 35, 48, 45, 63, 41, 39, 36, 42, 52, 29, 45], total 1027; equal to original-en: True; equal to live: True.
- Keys: top-level `chapters` only; each chapter exactly `number`, `title`, `paragraphs`: True
- Empty paragraphs: none. Duplicate paragraphs: none.
- Every accepted Book file survives assembly exactly (number, title, every paragraph): True
- `scripts/pg_source.py`: PG #1727 file sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`; all 24 served original-en chapters derive from PG apart from the 4 enumerated A7 divergences: True
- Per-Book source files (bookNN/source-bookN.json) derive from PG and equal the served chapter:
  - Book 1: `fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4` OK
  - Book 2: `3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7` OK
  - Book 3: `a3dc00566e0f4517bc7fc68ca6b6dbb363a4e191bb175d1b5c1cabb420815e6a` OK
  - Book 4: `b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70` OK
  - Book 5: `c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57` OK
  - Book 6: `351c2f4647245348450458e2309214b96cf6f6af5e670e9efbc6ddbcdaec5668` OK
  - Book 7: `1c3c67f99747b2e919845a310867f190e592131be953b34e4f5b66c895d35152` OK
  - Book 8: `5140b989049ffd9aefaa818f4abf652b7ced16816defe0748b57fa72424090a6` OK
  - Book 9: `575f8c8693ccefbd4c2a3a9b36d5e61244ecba2f6cb042f65d257fd6aa77561f` OK
  - Book 10: `15064e9ba044d246876933bcb7a3ca5cd3199e70e84e34feaeca825a6106455f` OK
  - Book 11: `402da093497e6e90dab711a677175ed64619d0c8bf3416e45693766c5e006eb6` OK
  - Book 12: `732d8e2bf01b0449b77834496ddc7fb3345f4184492e4838c3af20eb56a4aeef` OK
  - Book 13: `ab393bbe3e606bbb2ead18df1ec22c4484d2bf99c538e0dbf62afabaeb0929ae` OK
  - Book 14: `bd861c3447830839f14d43bd6c37b18b9b8491e49f3afc263004fd431936aef8` OK
  - Book 15: `b0d1a6209600e0c4727b8cce61621a67a74ca8adc3b7652a9afad07a53348201` OK
  - Book 16: `18c4e20420d1df1300835cfb1b3387dc2859d4600ca109b80eb44c07f962cec7` OK
  - Book 17: `4f7da02f6e15d109ecf56da52ed0b87f539a1d9953a3cb02f4a16262d924066b` OK
  - Book 18: `3bfa68a81c8f2b53d451dc2e6ce6f979630451a818a5c5563034231df4630f2e` OK
  - Book 19: `afc251f7c2e59eba2e3db3f83ef572a9bbbd95dcb3d10fc56f859abcc15305ef` OK
  - Book 20: `9c277327649b37101122227572fc0f0ef97a546985fcb70453e0b83de720768e` OK
  - Book 21: `b5df611f128137de645ef6d900ab52990c75235fbe2bf1c4d0528a9317449126` OK
  - Book 22: `9f49606926643c230a00bfabfa6b1775c019e59a8a056615617707bbc16abc5a` OK
  - Book 23: `75e87aeb85a32ff6cebd51f509888df53e9af1aff91bd7136e393ff320c3175c` OK
  - Book 24: `b715a588d1133b8dd3a85e307e15a653cc5892c603acd243bdfc82f82b789c6b` OK
- Double-quote counts differ from Butler in 6 paragraphs [(1, 8), (11, 29), (20, 7), (20, 14), (20, 16), (20, 27)]. Each is one of Butler's split speech tags ("“Welcome,” said he, “to…”") merged into a single quotation; the speaker is named in the lead-in and no words of speech are lost (checked by hand).
- ASCII quotes, Roman names, "—-" or spaced dashes in the body: none. Titles use the single spaced "Book N — " form: True
- Colons before a quotation that Butler lacks: 0.
- Dawn formula "When Dawn, the rosy-fingered child of morning, appeared," occurs 19 times, against Butler's 19 "child of morning" occurrences.

The Book boundaries were read in context for all 23 joins. Book 2→3 and Book 3→4 are Butler's own sentences that run across the Book boundary (PG prints Books III and IV opening in lower case; ledger A7 and ruling D14). The Book 12 ending closes Odysseus's narrative frame, and Book 13 opens in narration. The dawn formula matches across boundaries.

## 2. Cross-Book consistency passes (each edit independently verified)

| Pass | Edits | Books | Verification |
|---|---|---|---|
| Names, titles, compounds (Book 9 title "Ulysses" and "—-"; Book 11 ¶7 "sun god"; mixing-bowl) | 7 | 9, 11, 15, 20, 22 | `edition-review-2026-09-23/edition-consistency-verify.md`: VERIFIED CLEAN |
| Books 1–9 candidate-only accessibility review (never run before) | 6 applied of 48 findings, with reasons for each | 2, 5, 6, 7, 8, 9 | `edition-review-2026-09-23/books01-09-accessibility/`: DEFECTS FOUND in round 1 (2, fixed); round 2 VERIFIED CLEAN |
| Speech formulas ("So he spoke" / "So they talked") and the Book 20 ¶2 omission | 19 + 3 fixes | 13, 14, 15, 16, 18, 20, 21, 22, 23 | `edition-formula-verify.md`: round 1 found 3 doubled "so" (fixed); round 2 VERIFIED CLEAN |
| Colons added before quotations (PUNCTUATION §6) | 14 | 2, 11, 20 | `edition-colon-verify.md`: VERIFIED CLEAN; the whole set now has 0 |

Consistency items checked and left as they are, each with its reason:
- **"At this,"** carries a comma exactly where Butler's "On this," does, in all 24 Books.
- **Butler's own spellings are kept:** "Telepylus" (B10) and "Telepylos" (B23), under the GLOSSARY rule against silently correcting a Butler spelling. "Greeks" stays at B17 ¶10, where it is Butler's word.
- **"So they talked together" (Books 4, 7, 8)** is an accepted variant of "So they talked" in Books 1–9.
- **Erebus** gets no gloss, because Butler has none and the underworld context carries it.
- **"nothing loth":** the GLOSSARY row "willingly enough" differs from Book 3's "readily enough"; both are faithful, and Book 3 is not changed.

## 3. Screening tools (screening aids only)

Existing `books/audit-truncation.py` and `books/content-verify.py` were run through path-adapted copies. The adaptation points their hard-coded editions directory at a scratch folder holding the served original-en and this candidate.

- **Truncation, below 0.75 of the source word count: 5 paragraphs.**
  - B3 ¶37 is the D14 splice. The candidate correctly renders Butler's 12 words.
  - B13 ¶29, B16 ¶24, B20 ¶1 and B20 ¶14 were read against Butler. They are compressions of Butler's syntax with no event or speech content lost (B20 ¶14 keeps its speaker in the lead-in).
  - The screen also flagged B20 ¶2 for a real omission, which is now restored (see §2).
- **Fabrication suspects: 15.**
  - 13 of them come from Roman→Greek name mapping (Ulysses/Odysseus, Jove/Zeus, etc.), which the tool cannot see.
  - B3 ¶37 is the D14 splice.
  - B9 ¶22 differs only in the case of Butler's "Nectar"/"Ambrosia".
  - None is a fabrication.
