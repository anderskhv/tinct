# R3 re-verification

Verifier: an independent fidelity re-verifier, with no part in R3. The drafts were not edited. I ran `assemble.py` only, and it left `candidate/` unchanged against HEAD `53087e587`.

## Method

1. **Baseline:** `drafts/history/*.r4pre-R3.json` is byte-identical to the drafts at commit `6a3d4e54d`, the last commit before R3, for all 14 files.
2. **Reconstruction:** a script parsed the 34 rows of the R3 edits table and applied them to each baseline. It then ran the F1 `curl()` conversion on P-ch5 and P-ch6 and compared the result, as full JSON, with the current drafts. Every one of the 14 files matched exactly, and every old string occurred exactly once in its paragraph.
   - **So there are no unlisted changes.** No text, note, anchor, `fromPilot` or structural field differs from what the edits table plus the quote conversion produce.
3. **Fidelity:** I read each changed sentence against `source/original-da-final.json` and checked it against §C of `STYLE-AND-TERMINOLOGY.md`.
4. **Anchors:** every `anchorAfterEn` occurs exactly once in its paragraph, in all 14 drafts.
5. **Assembly:** `python3 assemble.py` reports `ASSEMBLY CHECKS: PASS`, with 184 paragraphs [4, 15, 14, 35, 29, 22, 61, 4], 18 footnotes and 43,656 words. The modern-en candidate's sha256 is `c48a3252…11fb8`.

## Per-change verdicts

| # | File ¶ | Finding | Change | Danish checked | Verdict |
|---|---|---|---|---|---|
| 1 | A ch2 ¶3 | F2 | "…tempted Abraham and said to him: … your only son, whom you love, and go to the land of Moriah" | *og sagde til ham … som Du elsker, og gaae hen i det Land Morija*. It now matches ch3 ¶5 word for word, apart from the "and" that the Danish carries here (ch3 ¶5 keeps "; go to", because *gaa hen* has no *og* there). ch3 ¶7 "whom you love" also matches. | OK |
| 2 | P ch6 ¶2 | F3 | "one should not stop there" | *blive staaende derved*. The go-further / stop-at refrain now holds. | OK |
| 3 | P ch6 ¶2 | F3 | "Socrates had already gone further, much further" | *gaaet videre, langt videre*. The ironic echo of "going further" is now audible, and the following clause "that he fell short of it" still reads correctly. | OK |
| 4 | D ch4 ¶13 | F4 | "Abraham stands at this extreme point." | *Paa denne Spidse staaer Abraham*. This matches the amended §C. | OK |
| 5 | P ch5 ¶19 | F4 | "keeps him at the extreme point" | *ved hvilket han bliver paa Spidsen*. | OK |
| 6 | P ch5 ¶0 | F5 | "he is in a spiritual trial, and he can work his way out of it only by repenting…" | *da er han i Anfægtelse, af hvilken han kun arbeider sig ud*. The sentence is grammatical and complete, and the first-use gloss stands at ch4 ¶7. | OK |
| 7 | P ch5 ¶2 | F5 | "nothing incommensurable remains in a human being except in the sense that this incommensurable element is evil" | *der intet Incommensurabelt bliver tilbage i Mennesket paa anden Maade, end at…*. The syntax is intact, and the first-use gloss stands at ch4 ¶10. | OK |
| 8 | P ch5 ¶4 | F5 + F16 | "This position cannot be mediated; for all mediation takes place precisely by virtue of the universal. Now and forever it remains a paradox…" | *lader sig ikke mediere; thi al Mediation skeer netop i Kraft af det Almene; det er og bliver…*. The notes follow. | OK |
| 9 | P ch6 ¶6 | F6 | "understood by another individual who is in the same position" | *for en anden Enkelt, der er i samme Casus*. | OK |
| 10 | P ch6 ¶14 | F6 | "and every individual who understands him understands the universal through him" | *at enhver Enkelt, der forstaaer ham, igjen i ham forstaaer det Almene*. The pre-existing omission of *igjen* ("in turn") is not an R3 change and leaves the sense intact. | OK |
| 11 | P ch6 ¶20 | F6/F7 | "He does not comprehend at all what is at issue: that if another individual is to walk the same path, he must become the single individual in exactly the same way" | *Han fatter slet ikke … at forsaavidt en anden Enkelt skal gaae den samme Vei, maa han … blive den Enkelte*. | OK |
| 12 | P ch6 ¶6 | F7 | "But it is also what is terrible — which I can comprehend even better." | *hvilket jeg endnu bedre kan fatte*. | OK |
| 13 | D ch4 ¶16 | F7 | "and then he grasped everything again by virtue of the absurd" | *da greb han Alt igjen*. The *gribe* of faith now reads the same way as in ch4 ¶20, ¶21, ¶24 and ¶27. | OK |
| 14 | P ch5 ¶25 | F8 | "and dares to say: “Weep for him…”" | *at han da tør sige*. The poet who *tør*, the poet's "daring" and the knight who "dares" now build as one sequence. | OK |
| 15 | I ch7 ¶33 | F9 | "where torturing heroes is concerned" | *naar det gjælder om at pine Heltene*. It now echoes "torturer of heroes". | OK |
| 16 | I ch7 ¶36 | F9 | "the universal will keep torturing him" | *det Almene vil bestandig pine ham*. | OK |
| 17 | H ch7 ¶22 | F10 | "it could happen in real life that a merman…" | *at det kunde forekomme i Virkeligheden*. This is an idiomatic rendering and no longer collides with "reality" for *Realitet*. | OK |
| 18 | J ch7 ¶46 | F11 | A newline before "[Who sued…" | The source German text is unchanged. The format now matches ch7 ¶29. The n7.67a anchor "Wer sprach von Liebe." is unique, and its offset is unchanged. | OK |
| 19 | C ch4 ¶7 | F12 | "worthy to be called God’s chosen one" | *værdig at kaldes Guds Udvalgte*. It now matches ch7 ¶24. | OK |
| 20 | E ch4 ¶30 | F13 | "to chop the firewood" | *kløve Brændet*. It now matches ch3 ¶8 and ¶10. | OK |
| 21 | J ch7 ¶58 | F14 | "Yet I by no means say, on that account, that it is something lowly; on the contrary, it is the only marvel." | *men derfor siger jeg ingenlunde, at det er noget Ringe, da det tværtimod er det eneste Vidunderlige*. "Marvel" for *det Vidunderlige* is a slight nominalization, but it is faithful, and it echoes ch4 ¶12 and ¶16 as intended. The rest of the sentence ("by no means", "on that account") correctly keeps J's own rendering of *ingenlunde*. | OK |
| 22 | P ch5 ¶23 | F14 | "to speak inhumanly about what is great" | *at tale umenneskeligt om det Store*. It now parallels "let it be great … stops being great" (*Stort*) better than "greatness" did. | OK |
| 23 | D ch4 ¶15 | F15 | "If one wants to learn the movements of swimming, one can have oneself hung in a harness from the ceiling; one may well describe the movements, but one does not swim." | *Naar man vil lære … da kan man lade sig hænge i Seler … man beskriver vel Bevægelserne, men man svømmer ikke*. The sentence is grammatical and flows into "Just so, I can describe…". No "you" is left in ¶15. | OK |
| 24 | D ch4 ¶16 | F15 | "to look at him, one would swear it was the grocer" | *naar man seer ham, skulde man sværge paa*. No generic "you" is left in ¶16; the paragraph now uses "one would think" and "one would swear" consistently. | OK |
| 25 | P ch6 ¶21 | F16 | "— or else there has never been faith…; or else Abraham is lost; or else one must explain…" | *eller ogsaa … eller ogsaa … eller ogsaa*. It now matches ch5 ¶4. "So either … — or else" is idiomatic. | OK |
| 26 | P ch5 ¶4 | F16 | "by virtue of the universal" | *i Kraft af det Almene*. All 33 instances of *i Kraft af* now line up. | OK |
| 27 | P ch6 ¶0 | F16 | "and as such it is in turn the divine" | *og som saadant igjen det Guddommelige*. It now matches the opening of ch7 ¶0. | OK |
| 28 | J ch7 ¶42 | F16 | "in being disclosed he is the beloved son of ethics" | *i denne Aabenbarelse Ethikens elskelige Søn*. It now matches ch7 ¶10. | OK |
| 29 | E ch4 ¶24 | F16 | "By faith Abraham did not renounce Isaac" | *gav Abraham ikke Afkald paa Isaak*. It is consistent with the paragraph's other uses of *give Afkald*. | OK |
| 30 | P ch5 ¶26 | F16 | "Was it not terrible … terrible to share a meal with him?" | *forfærdeligt* ×2. | OK |
| 31 | P ch5 ¶8 | F16 | "that he was willing to sacrifice her for the common good" | *at han for det Heles Vel vilde offre hende*. §C *offre* = sacrifice. The nearby "make this sacrifice" renders *bringe dette Offer*, so the repetition is sanctioned by the source. | OK |
| 32 | A ch2 ¶10 | F17 | "afterward" | *senere* | OK |
| 33 | G ch7 ¶16 | F17 | "unrivaled" | *mageløs*. The same sentence keeps "cancelled", which R3 ruled to leave, since it is used uniformly across the book. | OK |
| 34 | E ch4 ¶28 | F17 | "compendia" | *Compendier*. It matches F n7.15a. | OK |

**Special-attention items:**
- **Removed glosses (#6–8):** all three sentences read correctly.
  - **"cannot be mediated; for all mediation" (#8):** grammatical, and it mirrors the Danish *mediere; thi*. It is also the book's house pattern: "; for" occurs 101 times in the candidate. The clause that follows gives the reader the sense of "mediation" in context, and this is the first main-text use.
- **"one" in D ¶15–16 (#23–24):** clean.
- **"comprehend … another individual" in ch6 ¶20 (#11):** clean. It restores the Danish contrast *en anden Enkelt / den Enkelte*.
- **"or else" in ch6 ¶21 (#25):** clean.
- **J ¶58 (#21):** clean.
- **Genesis 22:2 (#1):** clean.

## Quote conversion in P-ch5 and P-ch6 (F1)

- **No straight quotes left.** There are no straight `"` or `'` in either P file, in text, notes or anchors. Book-wide, straight apostrophes remain only in the German verse elisions (ch7 ¶29 *dreh'nden*, *hink'*; ¶46 *kniet'*), which reproduce the source. That is correct.
- **Double quotes balance and nest correctly** in every paragraph and note. No quote is ever open inside another double quote, no “ follows a letter, and no ” is followed by a letter.
- **One nested quote:**
  - **Where:** ch6 ¶15, "…but it is always ‘a test.’” Nor could Abraham…".
  - **What:** single quotes inside double quotes, with the period inside both, in US style. This is correct.
  - **Source:** the inner quote marks are a pre-existing English addition; the Danish has no inner marks around *en Prøvelse*. That is acceptable as scare quotes and is not an R3 change.
- **Every other ’ in P sits between two letters** (possessives and so on). There are no plural possessives or leading elisions that the conversion could have turned the wrong way.
- **Greek elision:** ch6 ¶8 now reads `κατ’ ἀναλογίαν`, with U+2019. This matches the Danish source (`κατ’`) and I ch7 (`κατ’ ἐξοχήν`). Correct.

**Verdict on F1:** OK.

## Anchors and assembly

- **Anchors:** all 18 `anchorAfterEn` strings occur exactly once in their paragraphs.
- **Assembly:** `assemble.py` passes, and the regenerated `candidate/` and `candidate/review/*.md` are identical to what was committed in `53087e587`.

**Verdict:** OK.

## Unlisted changes

None. The drafts are exactly the baseline plus the 34 table edits plus `curl()`.

## Handoff issues outside the drafts: DEFECT (release artifacts)

These are not translation defects, but they block a clean handoff.

- **D1. The release artifacts are stale after R3.**
  - **Stale hashes in `HASHES.txt`:**
    - it still lists `4188280f…` for the modern-en candidate, but the actual value is `c48a3252…11fb8`;
    - it still lists `6198c78b…` for `candidate/footnotes.json`, but the actual value is `345f2eeb…70b1e`.
  - **Stale rows in `accepted-paragraph-hashes.tsv`:** 54 rows still carry pre-R3 modern-en hashes: 2.3, 2.10, 4.7, 4.13, 4.15, 4.16, 4.24, 4.28, 4.30, 29 rows across ch5–6, and 7.16, 7.22, 7.33, 7.36, 7.42, 7.46 and 7.58.
  - **Stale `character-card-impact.json`:**
    - it pins `candidateModernEnSha256` to the pre-R3 candidate;
    - its proposed mention offsets may shift in ch5 ¶0, ¶2 and ¶4, where the removed glosses changed paragraph length.
  - **Fix:** run `python3 build_character_impact.py && python3 build_release.py` after `assemble.py`, then commit. `SIMILARITY.md` is a diagnostic; to keep it current, also re-run `python3 similarity_report.py`.
- **D2. `README.md` references a missing file.**
  - **The problem:** `README.md` lists `RELEASE-PACKET.md` as "Handoff for Codex", and `ACCEPTANCE-RECORD.md` line 10 cites it for the final hashes. The file does not exist in the working tree or in git history.
  - **Fix:** write `RELEASE-PACKET.md` after D1 is regenerated, or remove the references.

## Final verdict

- **Translation: ready for handoff.**
  - All 34 R3 edits and the P quote conversion are faithful to the Danish, grammatical and consistent with §C.
  - There are no unlisted changes.
  - The anchors are intact, and `assemble.py` passes.
  - No draft edits are needed.
- **Package: not yet ready.** First regenerate the release artifacts (D1) and resolve the missing `RELEASE-PACKET.md` (D2). After that, the book is ready for handoff.
