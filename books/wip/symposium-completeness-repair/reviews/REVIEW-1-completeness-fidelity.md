# Review 1: completeness and fidelity of the Symposium repair

- **Reviewer role:** independent reviewer 1 (completeness and fidelity). I did not author the repair. I had read-only access to the repository. All scripts ran from `scratchpad/review1/`, and no Anthropic API was called.
- **Date:** 2026-09-25. Checks ran from 10:05 to 10:36 UTC.
- **Candidates reviewed (unchanged throughout; re-hashed at 10:05, 10:21, 10:28 and 10:35 UTC):**
  - `candidate/symposium-original-en.json`: sha256 `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`, git blob `5d5be8c31348aa4fc6dd3be5b8a452dd137a375c`, 121,441 bytes.
  - `candidate/symposium-modern-en.json`: sha256 `43f03333a255d90378a12ab1d1d384620e515e1725cb4ba8132e794fa504e550`, git blob `3059225d503a0c47a326fcaaa589e3facd600ca1`, 121,319 bytes.
- **Baseline:** commit `38a97c63`.
  - original-en `e2943777…797c0` and modern-en `7816d1eb…8fcce8`. Both were verified.
  - Card `symposium.v1.json` sha256 `83f8a6a9824cdf1f718b5ebfeb78a20b9d8671d7df5218c5c96d345efd5f8628`.
- **Sources:**
  - `pg1600.txt` `8b5c599e…d6f` and `pg1600-images.html` `c69cb6e7…e0d`.
  - I downloaded both again from gutenberg.org/cache/epub/1600/ at about 10:30 UTC. The copies were byte-identical.
- **Records verified (sha256 at time of check):**

  | Record | sha256 |
  |---|---|
  | `mapping/paragraph-map.tsv` | `119ce82f…357b` |
  | `mapping/inserted-paragraphs.tsv` | `ba058fbf…16c9` |
  | `coverage/passage-coverage.tsv` | `482a4218…48fa` |
  | `coverage/split-inventory.tsv` | `aec945a4…22bb` |
  | `hashes/build-summary.json` | `6efce366…16deed` |
  | `hashes/paragraph-hashes-original-en.tsv` | `57630823…1740` |
  | `hashes/paragraph-hashes-modern-en.tsv` | `6947a29b…2ee8` |
  | `impact/character-card-impact.json` | `8c78f3ae…ff20` |
  | `CHANGES.json` | `db5f1768…00bf` |

- **The package changed while I was reviewing it.**
  - The author committed it as work in progress in `9e0f5d65` and `89045260`, at 10:26 UTC. I did not make those commits. Both contain the candidate blobs reviewed here.
  - `STATUS.md` says the package is "IN PROGRESS".
  - `COVERAGE.md` was rewritten at 10:22.
  - `impact/modern-da-report.md`, `impact/da-audit/` and `STATUS.md` appeared.
  - I did not read `reviews/REVIEW-2-blind-reader.md`, so that this review stays independent.

## Verdicts

| Claim | Verdict | Evidence (short) |
|---|---|---|
| C1 Source identity and dialogue bounds | **CONFIRMED** | Both headers read `Title: Symposium`, `Author: Plato`, `Translator: Benjamin Jowett`, `[eBook #1600]`. I parsed TXT (blank-line paragraphs) and HTML (`<p>`) independently. Both give PERSONS, SCENE and 180 dialogue paragraphs (22,077 words). After replacing `--` with `—` (114 instances), all 180 are identical, with no whitespace or other differences. The HTML dialogue has no other non-ASCII characters and no inline markup. The dialogue starts and ends as claimed. The introduction (52 paragraphs) and the Gutenberg header and licence are outside it. The only differences are in the header metadata: HTML "Most recently updated: March 4, 2013" against TXT "November 7, 2008" (F7). |
| C2 Baseline gap is only ¶0–8 | **CONFIRMED** | All 217 baseline paragraphs, joined with single spaces, reproduce source ¶9–179 exactly (21,429 words). The gap is ¶0–8 (648 words). There is nothing else omitted, duplicated, reordered or altered. |
| C3 Candidate original-en complete, verbatim and ASCII; splits pre-existing | **CONFIRMED** (see F5) | The 226 paragraphs reproduce all 180 source paragraphs in order. 1.0–1.8 equal TXT ¶0–8 byte for byte, and the file is pure ASCII. 23 source paragraphs (each ≥ 288 words) carry 46 extra boundaries, identical to the baseline's. 43 fall after `.` and 3 after `?`. No paragraph spans a source boundary. One split, 8.0/8.1, falls inside Alcibiades's quotation (F5). |
| C4 Byte-for-byte carry and counts | **CONFIRMED** | For all 217 map rows in each edition, the baseline text equals the candidate text, both hashes match, and the ops are consistent (130 keep, 41 renumber, 46 move). The flat order is preserved, with a uniform +9 shift. The only unmapped coordinates are 1.0–1.8. Both editions have 49/8/12/10/18/13/69/47 (226). `inserted-paragraphs.tsv` hashes, word counts and UTF-16 lengths are all correct. |
| C5 Chapter 7/8 regroup | **CONFIRMED** | In both editions, chapter 7 ends at ¶141 ("…or anything else which you please."; modern 7.68 closes Socrates's quote opened at 7.45), and chapter 8.0 starts at ¶142 with narration. Every chapter starts at a source-paragraph start (¶0, 49, 55, 59, 65, 76, 86, 142). No other boundary cuts a sentence or speech in a way that is a defect (F12). |
| C6 Only title change is original-en ch 5 | **CONFIRMED** | The title lists differ only at original-en ch 5: "Agathon & Aristophanes" became "Aristophanes's Speech", which equals the modern-en title. Numbers and keys are unchanged. I also verified the `variantWithoutC04` hash (`0615b956…`) and the git blob. |
| C7 Modern completeness, whole book | **PARTLY** | Every paragraph is aligned and complete except for one dropped qualification in pre-existing text, 3.7 "which custom allows" (F2), plus minor nuance losses (F8). All 20 Jowett notes are omitted consistently. The brief's "17" counts paragraphs; there are 20 notes (F6). There is no truncation: the lowest word ratio is 0.88. |
| C8 Restored modern 1.0–1.8 | **CONFIRMED** (see F9) | Meaning, speaker framing (Apollodorus to the companion, recounting Glaucon two days earlier), names, hedges, time references ("day before yesterday", "not … three years", "when we were still boys", "the day after … victory sacrifice") and the quoted nickname are all preserved. There are only trivial additions ("only", "whole", "even"). Omitting the pun note is consistent with the other 20 notes and with the Republic 7.257 precedent. "Called out playfully" and "you Phalerian!" still convey the jest. The style matches 1.9–1.15: single-quoted reported speech, speaker labels, spaced em-dashes, American spelling and contractions. |
| C9 Character-card impact | **CONFIRMED** (see F3 and F11) | After remapping, 510 of 510 (original-en) and 506 of 506 (modern-en) mentions re-resolve to their exact text by UTF-16 slice. 372 and 364 anchors are all in range. The impact move lists (398 and 392) are identical to mine. Each edition has 23 new mentions with correct offsets, exhaustive for personal names. The remaining capitalised tokens are sentence-initial words, places (Phalerum, Athens, Cydathenaeum), the demonym "Phalerian" and "(Greek)". All anchor changes equal the end offset of the first new mention, and each "from" equals the remapped baseline anchor. The identity decisions are sound (separate `glaucon-questioner`; Phoenix and Philip as reference characters). The proposed Phoenix body text is inaccurate (F3). |

## Findings

**F1: BLOCKING (policy gate; pre-existing; disclosed in COVERAGE.md). modern-en fails the mandatory similarity gate.**

- **Result.** I ran `books/classify-modern-en.py symposium --gate` on scratch copies.
  - Candidate: weighted similarity **0.868** (gate ≤ 0.75); LIGHT+MECHANICAL **6/8 = 75%** (gate ≤ 5%); **GATE FAIL**.
  - Baseline: 0.877 and 5/8, also FAIL.
  - Chapter 8 goes from REAL-HEAVY (0.272) to LIGHT (0.915), because the unchanged Alcibiades paragraphs move into it.
- **How close the text is to Jowett.** With punctuation normalised, 195 of 226 modern paragraphs are ≥ 0.85 token-similar to Jowett. Most of 5.8–5.17, chapter 6, 7.1–7.68 and 8.2–8.45 are Jowett's words with quote marks added. Twelve paragraphs are byte-identical: 1.16, 1.18, 1.21, 1.23, 1.42, 1.48, 2.3, 7.3, 7.31, 8.1, 8.33 and 8.34.
- **Archaisms survive.** Examples:
  - 8.4 "Please to see to this".
  - 8.13 "you have not spoken but have well drunken".
  - 8.26 "See you how fond he is of the fair? … Know you that beauty…".
- **Policy.** `books/AGENTS.md` calls the gate "mandatory, blocking" before content handoff.
- **Fix.** Either record an explicit waiver from Anders scoped to this completeness-only repair (in ACCEPTANCE or RELEASE-PACKET), or commission a full re-rendering of modern chapters 2 and 4–8 (not 8.46). Do not describe modern-en as passing the gate.

**F2: SHOULD-FIX (pre-existing modern text; refutes C7's "no omission"). modern-en 3.7 drops "which custom allows".**

- Original: "There remains, then, only one way of honourable attachment **which custom allows** in the beloved, and this is the way of virtue;"
- Modern: "There remains, then, only one honorable way for the beloved to yield — the way of virtue."
- The word "custom" no longer appears anywhere in modern 3.7. Pausanias's point about Athenian *nomos* becomes an absolute claim.
- **Fix.** "There remains, then, only one honorable way — the one our custom allows — for the beloved to yield: the way of virtue."
- Modern 3.7 has no card mentions. Editing it would still change its paragraph hash and the offsets of any user annotations in 3.7. Either add a 3.7 offset row in this release, or defer the fix to the re-rendering in F1.

**F3: SHOULD-FIX (proposed card content, both editions). The Phoenix body misattributes the vague account.**

- **The problem.**
  - The proposed body reads: "Philip’s son, who heard about the banquet from Aristodemus and passed on a vague account of the speeches." IMPACT.md §2 repeats it.
  - In the text, the indistinct narrative belongs to Glaucon's informant, not to Phoenix: 1.0 "Phoenix, the son of Philip, told another person who told me of them; his narrative was very indistinct" and 1.1 "Your informant, Glaucon, I said, must have been very indistinct indeed". The Greek at 172b makes the ἄλλος the subject of οὐδὲν εἶχε σαφὲς λέγειν.
- **Fix.** "Philip’s son, who heard about the banquet from Aristodemus and passed the story on; it reached Glaucon only as a vague second-hand account." The staged threads correction ("passed on from Phoenix") is already accurate.

**F4: SHOULD-FIX (release coupling; documented in `impact/modern-da-report.md`). The Danish edition would stay flagged as aligned.**

- **The problem.**
  - `modern-da` is not part of the candidates. It is sha256 `2a98c528…`, 217 paragraphs in the old 40/…/115/1 structure, and registered `aligned: true, hasAudio: true`.
  - After the English repair, Danish chapter 1 is offset by nine paragraphs, and chapters 7 and 8 disagree between languages.
- **Fix.**
  - The acceptance record must carry Anders's decision. The report recommends option A: set `aligned: false`.
  - Codex must apply that decision in the same release.
  - The English candidates must not ship while `modern-da` still claims to be aligned.

**F5: NOTE (pre-existing; disclosed). The 8.0 | 8.1 split falls inside Alcibiades's quoted speech.**

- 8.0 ends "…shall we have the understanding of which I spoke (supra Will you have a very drunken man? etc.)?".
- 8.1 is only "Will you drink with me or not?'", seven words with a closing quote and no opening quote. It is identical in both editions.
- The splitter broke at the `?` that follows Jowett's note. The other 45 splits are sound; the only other short piece, 7.57, has 25 words.
- **Fix.** In a later structural pass, merge 8.1 into 8.0. This needs an offset-shift map row: 8.1 offset *x* becomes 8.0 offset len(8.0)+1+*x*.

**F6: NOTE. Note counts and classification.**

- **Count.** There are 20 other note instances, in 17 paragraphs. The brief's "17" counts paragraphs; `SOURCE.md` and `COVERAGE.md` correctly say 20. modern-en omits all 20:
  - 1.19 and 1.24 (Iliad)
  - 1.43, 2.4 and 3.3
  - 5.5 (two notes)
  - 6.4, 6.9 and the inner citation at 6.10
  - 7.45 (three notes)
  - 8.0, 8.11, 8.23, 8.28, 8.35, 8.36 and 8.37
- **"(daimon)" at 7.47.** This is Jowett's transliteration gloss. modern-en keeps it, which is fine, but `COVERAGE.md` lists it among the "speakers' own words". It should be reclassified as a retained gloss.
- **"(Greek)" in 1.0.** Original-en 1.0 now shows the transcription placeholder "(Greek)" inside the verbatim note. This is disclosed in `SOURCE.md` and consistent with the verbatim-note convention.

**F7: NOTE. Accuracy of `SOURCE.md` and `CHANGES.md`.**

- **(a) Header date.** "The Gutenberg header reads … Most recently updated: November 7, 2008" is true of the TXT only. The HTML header reads "March 4, 2013".
- **(b) Incomplete list of upstream slips.** The list gives four (5.16, 6.4, 6.10, 3.9). It misses:
  - 1.40 "as of none of the company"
  - 3.5 "that there no loss of character"
  - 4.1 "there is an absurdity saying"
  - 5.4 "what I am saving"
  - 7.62 "the beauty in every form is and the same"
  - 8.29, where the closing quote after "'Do you know what I am meditating?" is missing

  All six are reproduced verbatim in original-en. modern-en silently corrects them, for example "saying" and "one and the same".
- **(c) Edition year.** The PG header gives no edition year. "Matches … Jowett (1871)" is therefore a match on translator only.

**F8: NOTE (pre-existing modern-en nuance and clarity issues; not omissions).**

- **3.3 is garbled.** It reads "For the love between Aristogeiton and the steadfast devotion of Harmodius proved strong enough…" It should read "Aristogeiton's love and Harmodius's steadfast devotion…".
- **3.2 reverses a connector.** The original's "…evil of them; **for** surely nothing … can justly be censured" becomes "…evil in them. **But** surely…".
- **3.6 shifts a referent.** "would have both of them proven" (the two kinds of lover) becomes "both lover and beloved thoroughly tested".
- **3.8 loses a quotation and a hedge.** "done his best to show … any one's 'uses base'" becomes "has shown … for any base use", losing the quotation marks.
- **4.1 drops a phrase.** "as our friends the poets here tell us" becomes "as the poets here tell us".
- **1.46 drops inner quotation marks.** Phaedrus's quoted complaint ("…In an indignant tone: What a strange thing … been neglected. Now in this Phaedrus seems to me…") no longer shows where his words end.
- **Disclosed typography.**
  - 1.20 ends `who',`.
  - 1.33 opens with `''I may touch you` and ends with `sought.''`.
- **Leftover British forms.**
  - "theatre" at 5.11–5.13, "marvellous" at 8.5, 8.26 and 8.31, and "revellers/reveller" at 8.0 and 8.24 (8.46 has "revelers").
  - "Hellenes" at 7.61 against "Greeks" at 1.34.
- **Fix.** Fold all of these into the re-rendering in F1.

**F9: NOTE (restored modern paragraphs). Minor additions not in Jowett.**

- 1.0 "In fact, **only** the day before yesterday".
- 1.3 "it's not **even** three years", where Jowett has "not three have elapsed" and the Greek οὔπω means "not yet".
- 1.7 "let's have the **whole** story again".
- These are harmless. Optionally drop "only" and "whole", and use "not yet three years". Nothing else is added, and no omission was found.

**F10: NOTE. Records were in flux, with dangling references, during the review.**

- `COVERAGE.md` cites `RELEASE-PACKET.md`, which does not exist yet.
- `STATUS.md` says "Not accepted; do not integrate", and promises `README.md`, `RELEASE-PACKET.md`, `ACCEPTANCE.md` and `HASHES.sha256`.
- **Fix.** At the final commit, regenerate the hash manifest over every record and re-run the record checks. The TSV and JSON files above verified clean.

**F11: NOTE (optional card consistency).**

- Glaucon's unnamed informant ("another person" and "someone" in 1.0; "your informant" in 1.1) has no entry. Comparable unnamed figures do have entries, for example `reporting-servant` and `welcoming-servant`.
- The possessive style differs between the proposed "Charmides’s father" and the existing "Charmides’ father".

**F12: NOTE. Chapter lead-ins.**

- 5.17 ends "…and then speak:--" and 6.12 ends "Socrates then proceeded as follows:--". Each colon-dash introduces the speech that opens the next chapter.
- Both boundaries fall at source-paragraph ends, and no sentence is cut. Both are unchanged from the baseline, and I judge them acceptable.

## Methods

- **Source parsing.** TXT: CRLF normalised, dialogue taken from "Concerning the things…" up to the END marker, blank-line paragraphs, lines joined with single spaces. HTML: every `<p>` after the second `SYMPOSIUM` `<h2>`, tags stripped, entities unescaped, whitespace collapsed. I compared all 180 paragraph pairs exactly after mapping `--` to `—`. I also inventoried the tags, entities and non-ASCII characters in the HTML dialogue, and downloaded both PG files again to confirm the hashes.
- **Tiling proof (C2, C3).**
  - Each source paragraph must equal the single-space join of consecutive edition paragraphs; any mismatch fails. This covers the baseline against ¶9–179 and the candidate against ¶0–179.
  - Split signatures were compared between baseline and candidate.
  - Every split boundary was inspected for its final character, the case of the next character and the length of the fragment.
- **Records.** I recomputed every sha256, word count and UTF-16 length in `paragraph-map`, `inserted-paragraphs`, `paragraph-hashes-*`, `passage-coverage` (TXT and HTML hashes, coordinates, status, opening) and `split-inventory`. I also checked `build-summary` (file sha256, git blob, bytes, counts, titles, the `variantWithoutC04` rebuild) and `CHANGES.json`. Every one matched.
- **Cards (C9).**
  - I remapped every baseline mention and anchor (roleVisibleAt, firstMention, snapshot availableAt, evidence throughOffset) through the map and sliced the candidate text in UTF-16. My move list matched the impact file's exactly.
  - I verified each new mention by slice. I checked exhaustiveness with a capitalised-token scan of 1.0–1.8, and checked anchor "from/to" consistency.
  - I checked the identity precedents cited (`ptolemy-king/son`, `joseph-*`) and read the threads file.
- **Modern screening (C7), two tiers.**
  - Tier 1: difflib alignment of punctuation-normalised tokens for all 226 pairs. For the 195 pairs with similarity ≥ 0.85 I reviewed every non-equal operation (231 in all) in context.
  - Tier 2: a dropped-run and clause-coverage screen with light stemming and an archaism map. It also compared proper names, numerals, negations, `?`/`!` counts and a truncation ratio (threshold 0.75; none fell below it). All 33 paragraphs it flagged were resolved.
  - Read in full against Jowett: every pair in chapters 1 (49), 3 (12) and 8 (47), plus 7.0. That set contains all 31 pairs below 0.85. I also read 5.4, 6.9, 6.10, 7.47 and 7.61 in full.
  - I found every Jowett parenthetical by balanced-parenthesis scan and classified each one.
- **Gate.** I ran `classify-modern-en.py --gate --per-chapter` on scratch copies of the candidate and the baseline, with `EDITIONS_DIR` redirected to scratch. I also checked the metric reported for the nine new paragraphs (0.549, 88–119% of source length).
- **Restored paragraphs (C8).** I compared them sentence by sentence against Jowett, with the Greek consulted from memory for 172a–173d. I checked style against 1.9–1.15: quote marks, em-dash spacing, spelling and contractions.
