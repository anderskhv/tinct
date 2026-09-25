# Re-verification of the Symposium repair, v1 → v2

- **Role:** independent re-verifier. I did not author the repair and did not take part in Review 1 or Review 2. I had read-only access to the repository. All scripts and outputs are in `scratchpad/reverify/`. No Anthropic API was called.
- **Date:** 2026-09-25. Checks ran from about 10:47 to 11:11 UTC.
- **v2 candidates verified.** These are the working-tree files. Neither changed during the review; I re-hashed them at about 10:47, 11:01, 11:08 and 11:11 UTC.
  - `candidate/symposium-original-en.json`: sha256 `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`, git blob `5d5be8c31348aa4fc6dd3be5b8a452dd137a375c`, 121,441 bytes. Byte-identical to v1.
  - `candidate/symposium-modern-en.json`: sha256 `073ca5b4eeda36bb0293be8fab1d97f6f37d7feb9f4cc4d6fc82e0244d693eae`, git blob `2e14d4734f0a8b7b5ad5c89c7a1d9e701f0a4db4`, 121,375 bytes.
- **v1:** commit `9e0f5d65`, identical at `89045260`. original-en `3521a12d…95a6`; modern-en `43f03333a255d90378a12ab1d1d384620e515e1725cb4ba8132e794fa504e550`. Both were verified.
- **Baseline:** commit `38a97c63`. original-en `e2943777…797c0`, modern-en `7816d1eb…8fcce8`, card `symposium.v1.json` `83f8a6a9…8628`, source `pg1600.txt` `8b5c599e…6f`.
- **Records as checked (sha256):**
  - `CHANGES.json` `08e2b69b…4c74`; `CHANGES.md` `da8837ed…01ab`
  - `mapping/paragraph-map.tsv` `c0fc5d0b…2352`; `mapping/inserted-paragraphs.tsv` `23ec2e5e…172a`; `mapping/changed-paragraph-ops.json` `38b5ba73…b285`; `mapping/MAPPING.md` `77001723…5284`
  - `hashes/build-summary.json` `2b766ab7…275b`; `hashes/paragraph-hashes-original-en.tsv` `57630823…1740`; `hashes/paragraph-hashes-modern-en.tsv` `c9601fb6…a4a1`
  - `impact/character-card-impact.json` `816cf76c…171d`; `impact/IMPACT.md` `220d41c0…8241`
  - `source/SOURCE.md` `fb701ec4…5855`; `coverage/COVERAGE.md` `ab82888c…d7e9`; `reviews/RESOLUTION.md` `e10eadf1…5519`
- **Package activity during the review.**
  - `STATUS.md` was rewritten at 10:47:53, while I was reading it. It now describes v2 and says this re-verification is running.
  - The author committed the working tree as `af6c80a1` ("content: Symposium repair WIP - candidate v2 after independent reviews", author date 10:47:53). I did not make that commit. I found it at 11:11 UTC, after my checks.
  - Every file checked here is byte-identical in `af6c80a1`: both candidates, every record listed above, and `STATUS.md` `39cf90d8…`. The verdicts therefore apply to that commit as well.
  - No candidate or other record changed after 10:46.

## Verdicts

| # | Claim | Verdict | Evidence (short) |
|---|---|---|---|
| R1 | Exact change set v1→v2 | **CONFIRMED** | `cmp` shows original-en byte-identical to v1. In modern-en, a JSON-level diff of all 226 paragraphs, 8 titles, chapter numbers and keys finds exactly 8 differing paragraphs: 1.0, 1.3, 1.5, 1.7, 1.8, 3.3, 3.7 and 3.8. Taking v1's bytes and replacing only those 8 JSON string literals reproduces v2 byte for byte. So there is no other difference, not even in whitespace, escaping or key order. The line diff agrees: lines 7, 10, 12, 14, 15, 79, 83 and 84 of 277. |
| R2 | Fidelity of revised modern 1.0, 1.3, 1.5, 1.7, 1.8 | **CONFIRMED** (F9 applied in part by decision; optional polish in N11) | I compared each paragraph clause by clause against Jowett ¶0, 3, 5, 7 and 8. Every name, hedge, time reference and quotation is kept, and the frame (Apollodorus → companion; Glaucon two days earlier; the companion replies in 1.8) is intact. No addition changes meaning. The pun note is omitted by convention. Review 2 SHOULD-FIX 1–3 are resolved. F9: "only" was removed and "not yet three years" adopted; "whole story" was kept (see N5). Quotation marks balance in every paragraph. All quotes are straight single quotes, all 8 em-dashes are spaced, there are no `--` and no British spellings, and the text is NFC with no control characters. |
| R3 | C-06 corrections in 3.3, 3.7 and 3.8; Review 1 F2 resolved | **CONFIRMED** | Each corrected sentence renders Jowett's sentence faithfully. For all three paragraphs, `old.replace(sentenceBefore, sentenceAfter) == new`, and the character diffs fall only inside the corrected final sentence. I read all 12 chapter-3 pairs in full against original-en and found no remaining dropped clause or qualification of the F2 kind. Small nuance shifts remain, most of them closer to the Greek (N12). Taken with Review 1's whole-book screen, C7 ("no omission") now holds. |
| R4 | Records consistency | **CONFIRMED** (one stale aggregate: N3) | The opcodes equal a recomputation using `prepare-structural-migration.py`'s own `char_ops`/`word_ops`. They tile both texts, all 16 equal spans round-trip in UTF-16 bytes, and rebuilding from the old equal spans plus the new non-equal spans gives v2 exactly. `paragraph-map.tsv` has 217 rows (130 keep, 41 renumber, 46 move). Exactly 3 rows (3.3, 3.7, 3.8) have `text_changed=modern-en`, with correct old and new hashes; old and new hashes are equal on every other row. The inserted-paragraph TSV and both paragraph-hash TSVs match v2 (sha256, words, UTF-16 length) for every paragraph. The CHANGES.json C-01/C-02/C-06 entries equal the v2, baseline and source texts and hashes, and CHANGES.md quotes them verbatim. In `build-summary.json`, the sha256, git blob, bytes, counts and titles all match. |
| R5 | Character-card impact after the changes | **PARTLY** | (a) 510 of 510 and 506 of 506 mentions re-resolve by UTF-16 slice. My move lists (398 and 392) are identical to the record's. My projection of modern 3.3 gives exactly the 10 listed `offsetChanges`, and no card coordinate falls in modern 3.7 or 3.8. (b) The 23 and 25 new mentions slice exactly, do not overlap, and cover every personal name. The anchor from/to values are correct. (c) The four informant mentions and their anchors resolve. (d) The Phoenix body is accurate. **However,** `paragraphHashesChaptersToRecompute` for modern-en still reads `[1, 7, 8]`; it must be `[1, 3, 7, 8]` (F1). IMPACT.md also keeps stale sentences (N2). |
| R6 | Resolution decisions | **CONFIRMED** (no decision is wrong; one rationale inaccurate: N5) | Keeping the plural "my friends", keeping "deme" (the "Myrrhinusian" precedent exists at modern 1.41), leaving "your friend" unnamed, deferring 3.2, 3.6 and 4.1, and not splitting paragraphs are all sound. The rationale for keeping "whole story" misreads Jowett and is inconsistent with finding #5 (N5). Some "done" statements in the log run ahead of the package or were only partly carried through (N6–N8). |
| R7 | Corrected claims in SOURCE.md and COVERAGE.md | **CONFIRMED** (wording notes N9 and N10) | All 10 slips appear verbatim in both the source and candidate original-en at the stated coordinates, and the intended readings are right. The header dates are TXT line 20 "November 7, 2008" and HTML line 219 "March 4, 2013". The baseline has 36 parenthetical groups: 20 notes in 17 paragraphs, plus 16 others (15 in the speakers' own words and the "(daimon)" gloss), and all 16 others survive in modern-en. Re-running the gate on scratch copies gives the baseline 0.877 (5/8 LIGHT+MECHANICAL: ch 2, 4–7) and v2 0.866 (6/8: ch 2, 4–8). Chapter 1 goes from 0.831 to 0.743. The restored block scores 0.4896 at 86.4–118.8% of source length. |

### R2 detail: the revised restored paragraphs against Jowett

- **1.0.**
  - The chain of informants is preserved: "Someone told me what he had heard from Phoenix, the son of Philip". "His account was very vague" can now only refer to the go-between. This is Jowett's sense and the Greek order (ἄλλος … ἀκηκοὼς Φοίνικος).
  - "I was just looking for you" renders "only just now". "Only" was trimmed from "the day before yesterday".
  - "Who better than you to report your friend's words?" and "were you at that gathering yourself?" are unchanged.
- **1.3.**
  - "not yet three years" renders Jowett's "not three have elapsed" (Greek οὔπω).
  - "began keeping company with" renders "became acquainted with" (συνδιατρίβω).
  - "thinking I was doing something worthwhile" renders "fancying myself to be well employed" and echoes 1.7.
  - All hedges are kept: "for many years", "really", "no better than you are now".
- **1.5.** The second sentence, "It was the day after he and his chorus had offered their victory sacrifice", now dates the gathering, as Jowett does. It agrees with the existing 1.13: "I turned down his invitation yesterday — his victory sacrifice".
- **1.7.**
  - "No, not Socrates" renders "No indeed".
  - The name now comes before the description, and "the deme of Cydathenaeum" and "never wore shoes" are kept.
  - "whether some parts of Aristodemus's account were true" renders "the truth of some parts of his narrative", with Aristodemus's narrative correctly identified. "Himself" adds emphasis only.
  - Glaucon's quoted line is closed correctly.
  - The return to the present is now marked by "And that is why, as I told you at the start" (see 1.0) and "again for you". "Rich men and businessmen like you" and the plural "my friends" follow Jowett.
  - "I suppose" renders "I dare say", and "think I'm miserable" renders "whom you regard as an unhappy creature". The closing antithesis is kept.
- **1.8.** "In this you live up to your old nickname, 'Apollodorus the madman.' I don't know how you came by it, but it suits you, for you're always raging…" The concessive "however deserved" and the "for" clause keep Jowett's logic, and the join to 1.9 ("the reason people say I'm crazy") still works.

### R6 detail: the declined and adapted items

- **Plural "my friends" (#12): sound.** Jowett's "you who are my companions" is plural, and so is the Greek (ὑμᾶς τοὺς ἑταίρους; πυνθάνεσθε at 172a). One companion speaks for the group, which is why 1.9 addresses a single "friend".
- **"Deme" (#10): sound.** It is Jowett's term, and the edition keeps comparable terms ("Phaedrus the Myrrhinusian", modern 1.41). It is inferable in context.
- **"Your friend" left unnamed (#6): sound.** Jowett and the Greek (τοῦ ἑταίρου) leave it implicit, and 1.3 makes it explicit. The claim that the list of speakers lets the reader infer it is weak, but the decision does not depend on it.
- **3.2, 3.6 and 4.1 not changed: sound to defer.**
  - 3.2: "for surely" (Greek ἐπεί, "since") → "But surely" turns an explanation into a rebuttal, but the proposition itself is intact.
  - 3.6: "both of them" (the two kinds of lover) → "both lover and beloved". The two kinds stay explicit in the same sentence ("yield to the one sort of lover and avoid the other").
  - 4.1: "our friends" is Jowett's gloss on οἵδε, and "the poets here" keeps the "here".
- **No paragraph splits: sound.** Tinct's translation rules require source-paragraph alignment.
- **Review 2 #1 and #3 adapted: sound.** "Again for you" is a slightly weaker cue than the reader's "this time for you", but it is sufficient. "It suits you" matches Jowett's concessive better than "you certainly deserve it".
- **Review 1 F9 in part:** acceptable in outcome; the rationale needs correcting (N5).

## Findings

No BLOCKING finding is introduced by v2. Review 1's F1 policy gate is still open (N13).

### F1. SHOULD-FIX: the card impact record was not updated for C-06; modern-en chapter-3 `paragraphHashes` must also be recomputed

- **Where:** `impact/character-card-impact.json` → `editions["modern-en"].paragraphHashesChaptersToRecompute` = `[1, 7, 8]`. `impact/IMPACT.md` §2, line 44, says: "`paragraphHashes` must be recomputed for chapters 1, 7 and 8."
- **Evidence:** I compared the v2 per-chapter hashes with the baseline card's `paragraphHashes`.
  - modern-en differs in chapters **1, 3, 7 and 8**. In chapter 3 the differences are 3.3 `800d9f90…`→`524ce031…`, 3.7 `f3cd77c2…`→`b3a63977…` and 3.8 `11ab27fb…`→`0f34ee93…`.
  - original-en differs in 1, 7 and 8 only, so its record is correct.
  - The v1 record also read `[1, 7, 8]`, which was right then. It was not updated when C-06 was added.
- **Consequence if the record is followed literally:**
  - `verifyCharacters` (`app/src/services/characters/characterCards.ts:145`) compares every chapter's hashes and returns `null` on any mismatch. The whole modern-en card would therefore be rejected, and character links would silently disappear in the default reading edition.
  - Symposium is not among the complete-package cases in `characterCards.test.ts`, so CI would not catch this.
  - Codex's existing `prepare-reviewed-editions.py` recomputes all chapters, which lowers the practical risk. The handoff record should still be right.
- **Fix:**
  - Set the modern-en list to `[1, 3, 7, 8]`.
  - Change IMPACT.md §2 to "chapters 1, 7 and 8 (original-en); 1, 3, 7 and 8 (modern-en)".

### N2. NOTE: IMPACT.md keeps sentences that C-06 made false

- **Line 40**, "…No anchor offset exceeds its paragraph. No offset changes." This is contradicted by line 38 and by the 10 `offsetChanges`. Suggested: "No offsets change except the ten modern-en 3.3 entries in `offsetChanges`."
- **Line 92**, "All 217 old paragraphs per edition are unchanged, so their cached chunks stay valid and reusable." For modern-en this is 214. Line 93 then contradicts line 92. Suggested: "All 217 original-en and 214 modern-en old paragraphs are unchanged…"
- **§6 seek-map bullet (line 94).** It lists only chapters 1, 7 and 8. The architecture doc says "A paragraph edit makes its old map stale" (`docs/audiobook-architecture-2026-09-21.md` l.56). Suggest adding "and the paragraph maps of modern-en 3.3, 3.7 and 3.8".

### N3. NOTE: an edition-agnostic count in `build-summary.json` is now stale for modern-en

- `verification.oldParagraphsCarriedByteForByte: 217` is true for original-en. For modern-en it is now 214. MAPPING.md states this correctly: "In `modern-en`, 214 do."
- **Fix:** split the count per edition (217 / 214), or note the C-06 exception.

### N4. NOTE: the C-06 card anchors sit at insertion points, so re-projecting them depends on bias

- MAPPING.md says that the Aristogeiton and Harmodius mentions "and their eight anchor offsets fall inside equal spans".
- The mentions do. The anchors at old 1015 and 1055 sit at the closing end of an equal span, exactly where "'s love" and "'s constancy" are inserted.
- With end bias they project to 998 and 1019. Those are the listed values, and they are semantically right: the end of each name. A start-bias projection would give 1005 and 1031.
- **Fix:**
  - State in MAPPING.md that the listed `offsetChanges` are to be applied as given, not re-projected.
  - Say "at the end boundary of" rather than "inside".

### N5. NOTE: the rationale for keeping "whole story" (Review 1 F9; Review 2 #11) is inaccurate and inconsistent

- RESOLUTION F9 says "whole story" "renders Jowett's 'the tale over again', meaning in full". But "over again" means "once more" or "anew", not "in full".
- RESOLUTION #11 says the Greek is simply "why not tell it to me?".
- RESOLUTION #5 rejects the reader's "the whole story" in 1.0 "because it is not in Jowett", yet keeps the same phrase in 1.7.
- The word itself is harmless. It contrasts with the vague version, and Review 1 called it harmless.
- **Fix:** either record it honestly ("a small addition, kept for contrast with the vague version Glaucon had heard") or use "let's have the story" or "tell it to me, then".

### N6. NOTE: RESOLUTION.md reports as done several things that do not exist yet

- F10: "`STATUS.md` removed. `README.md`, `RELEASE-PACKET.md`, `ACCEPTANCE.md` and `HASHES.sha256` written. All checks re-run on the final bytes." At review time `STATUS.md` exists ("IN PROGRESS") and none of the other files exist.
- F1 and F4 cite `RELEASE-PACKET.md` §6, §3.5 and §6.1, and `COVERAGE.md` line 100 cites `RELEASE-PACKET.md`. Neither the file nor those sections exist.
- F6 says `COVERAGE.md` and `SOURCE.md` "count 20 notes in 17 paragraphs". Both say 20, which is correct, but neither states "17 paragraphs".
- **Fix:** make these true at the final commit, and re-run the record checks on the final bytes.

### N7. NOTE: the F3 correction has not reached COVERAGE.md

- `coverage/COVERAGE.md` line 28 still reads: "names Aristodemus of Cydathenaeum as the eyewitness source (with Phoenix, son of Philip, as a garbled second-hand source)".
- This is the misattribution that F3 corrected in the card. The indistinct narrative belongs to Glaucon's informant, not to Phoenix.
- **Suggested wording:** "…with Phoenix, son of Philip, as the intermediate link through whom a garbled version reached Glaucon".

### N8. NOTE: the F7 correction has not reached CHANGES.md

- CHANGES.md, "Checked and deliberately not changed", still lists only four upstream slips: 5.16, 6.4, 6.10 and 3.9.
- SOURCE.md now lists 10, and RESOLUTION F7 says "All 10 slips listed".
- **Fix:** refer to SOURCE.md's table, or list all 10.

### N9. NOTE: SOURCE.md overstates what modern-en does with the slips

- SOURCE.md line 44 says: "`modern-en` renders the intended sense in each case."
- That is not so for 6.4 and 6.10. Both slips are inside Jowett notes, which modern-en omits. Modern 6.4 has no note, and modern 6.10 keeps "(as Euripides would say)" without the citation.
- **Fix:** add "…except 6.4 and 6.10, whose notes modern-en omits by convention."

### N10. NOTE: COVERAGE.md describes the band imprecisely

- COVERAGE.md line 96 says the block score is "at the boundary of the REAL and REAL-HEAVY bands". The value is 0.4896, below the 0.50 cut, so it is inside REAL-HEAVY.
- The numbers themselves (0.490, 86–119%, 0.831→0.743) reproduce exactly.
- **Suggested wording:** "just inside REAL-HEAVY (0.490 < 0.50)".

### N11. NOTE: optional polish in the new text (none of these is a defect)

- **1.0:** "He did say, though, that you knew about them, so I'd like to hear about them from you." The fix for the repeated "account" introduced a repeated "about them". Jowett has just "he said that you knew", so "…that you knew, so I'd like to hear about them from you" would do.
- **1.3:** "began keeping company with Socrates" is faithful to συνδιατρίβω. In a dialogue about eros, though, "keeping company" can carry a courting sense. "began spending time with" avoids it.
- **3.7:** "…only one honorable way that custom allows for the beloved to yield…" can briefly parse as "allows for". It is acceptable. An optional alternative: "…only one honorable way, sanctioned by custom, for the beloved to yield…".

### N12. NOTE: re-screen of modern-en chapter 3 (pre-existing text; no dropped clause of the F2 kind)

These are small shifts against Jowett, several of them closer to the Greek (checked from memory). I recommend listing them with the 3.2, 3.6 and 4.1 items in CHANGES.md for the later re-rendering. No action is needed now.

- **3.0:** Jowett's softener "quite" is dropped: "has not been set before us, I think, quite in the right form" → "I don't think the question has been framed correctly". The Greek, Οὐ καλῶς μοι δοκεῖ… προβεβλῆσθαι, has no "quite".
- **3.1:** "is apt to be of women as well as of youths" → "directed equally at women and at youths". The Greek οὐχ ἧττον ("no less") supports "equally".
- **3.3:**
  - "loves of youths share the evil repute" → "love between males shares the evil reputation", which is broader.
  - "In Ionia and other places, and generally in countries which are subject to the barbarians" → "In Ionia, … and in other places generally subject to the barbarians". The Greek ὅσοι ὑπὸ βαρβάροις οἰκοῦσι supports this structure.
- **3.4:** "the custom of mankind allows him" → "custom allows him" (Greek ὁ νόμος). "the explanation of it is rather perplexing" → "it's a rather perplexing one".
- **3.5:** "parents" → "fathers" (Greek οἱ πατέρες).
- **3.7:** "frightened into surrender by the loss of them" → "by the fear of losing them". This shifts from an actual loss to an anticipated one; the Greek is κακῶς πάσχων.
- **3.8:** the restored 'uses base' is the only quoted phrase in a chapter that does not quote speech. It is faithful and marked as a quotation, so it is acceptable.

### N13. NOTE: Review 1 F1 (similarity gate; BLOCKING by policy) is still open

- v2 does not change the gate's status: 0.866 against 0.877 for the baseline, with LIGHT+MECHANICAL at 6/8. There is no regression, and chapter 3 moves from 0.629 to 0.633 through C-06.
- Acceptance still needs Anders's recorded waiver or decision. `RELEASE-PACKET.md`, which is to carry it, does not exist yet.

## Methods

- **R1.**
  - `cmp` of v1 against v2 for original-en.
  - JSON-level comparison of top-level keys, each chapter's number and title, paragraph counts and all 226 paragraphs.
  - Byte-level reconstruction: I took v1's raw file, replaced each differing paragraph's `json.dumps(…, ensure_ascii=False)` literal (each unique) with v2's, and compared the result with v2's bytes.
  - Line `diff` as a cross-check (`r1_diff.py`).
- **R2 and R3.**
  - Parsed the PG TXT dialogue from "Concerning the things…" (CRLF normalised, blank-line paragraphs, whitespace collapsed; 180 paragraphs). Checked that original-en 1.0–1.8 equal source ¶0–8.
  - Read Jowett, v1 and v2 side by side with word-level diffs (`r2_show.py`, `r3_show.py`).
  - Read all of 1.0–1.8 and all 12 chapter-3 pairs sentence by sentence. The Greek was consulted from memory for 172a–173e and 180c–185c where Jowett is ambiguous.
  - Ran an automated dropped-content, negation and name screen (`screen.py`), and resolved every flag by reading.
  - House-style checks (`r2_style.py`): quote-token balance with apostrophes excluded, curly and double quotes, `--`, em-dash spacing, British spellings, double spaces, non-ASCII, control characters and NFC.
  - Possessive style: "Aristodemus's" and "Harmodius's" match "Pausanias's" and "Phaedrus's" elsewhere.
- **R4 (`r4_records.py`, `r4_changes.py`).**
  - Recomputed the opcodes with the exact `char_ops`/`word_ops` definitions from `app/scripts/prepare-structural-migration.py` (read from commit `7a12bb78` on `origin/codex/edition-structure-migration-20260924`), and compared them with the JSON.
  - Checked tiling, the UTF-16 byte round-trip of the equal spans, rebuilding each new paragraph, the sentence-replacement identity, and the old and new text against the baseline, v1 and v2.
  - Checked every row of `paragraph-map.tsv`: hashes, op consistency and text carry.
  - Checked `inserted-paragraphs.tsv` and both `paragraph-hashes-*.tsv` against v2 (sha256, whitespace word count, UTF-16 length).
  - Checked the CHANGES.json and CHANGES.md texts and hashes.
  - Checked `build-summary.json` sha256, `git hash-object`, bytes, counts and titles for the baseline, the candidates and the sources.
  - Grepped for v1 hashes and phrases that should no longer appear. They appear only in the reviews and the log, as history.
- **R5 (`r5_cards.py`).**
  - Remapped every baseline mention and anchor (roleVisibleAt, firstMention, snapshot availableAt, evidence throughOffset) through `paragraph-map.tsv`. Projected modern 3.3, 3.7 and 3.8 offsets through the opcodes, with start bias for mention starts and end bias for mention ends and anchors, then sliced v2 in UTF-16.
  - Compared my move and `offsetChanges` lists with the record.
  - Recomputed the per-chapter paragraph hashes against the card; the loader's `normalizeParagraph` is the identity on these texts.
  - Checked the new mentions by slicing, for overlaps, and for exhaustiveness (a name regex plus a capitalised-token listing).
  - Checked that each proposed anchor equals the end offset of its character's first new mention, and that each "from" equals the remapped baseline anchor.
  - Read the proposed bodies against 1.0–1.8.
  - Read `verifyCharacters` and the card tests to judge the effect of F1.
- **R6.** Read RESOLUTION.md against both reviews and the v2 text, and checked every quoted "resulting text" against v2. Checked the "Myrrhinusian" precedent (modern 1.41) and judged each declined or adapted item against Jowett and the Greek.
- **R7.**
  - Checked each slip string verbatim in the source and at the stated candidate coordinate, and the modern renderings.
  - Checked the header lines in the TXT and HTML.
  - Ran a balanced-parenthesis scan of baseline original-en (36 groups), and checked each of the 16 non-note groups in modern-en.
  - Ran `books/classify-modern-en.py` from a scratch copy whose `EDITIONS_DIR` points at scratch copies of the baseline, v1 and v2. Output is in `out/gate.txt`. v1 reproduces Review 1's 0.868 and 0.549.
  - Computed the length-weighted block score and length ratios for 1.0–1.8.
- All outputs are saved in `scratchpad/reverify/out/`.
