# Delta re-verification of the Symposium repair, v2 → v3

- **Role:** independent re-verifier, the same one who wrote `REVERIFY.md` on v2. I did not author the repair. I had read-only access to the repository. All scripts and outputs are in `scratchpad/reverify/`, with the delta outputs in `delta/`. No Anthropic API was called.
- **Date:** 2026-09-25. Checks ran from 11:15 to 11:21 UTC.
- **v3 candidates verified.** These are the working-tree files, and they did not change during the check (re-hashed at 11:15:46 and 11:20:57 UTC).
  - `candidate/symposium-original-en.json`: sha256 `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`, git blob `5d5be8c31348aa4fc6dd3be5b8a452dd137a375c`, 121,441 bytes. Byte-identical to v2 and v1.
  - `candidate/symposium-modern-en.json`: sha256 `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f`, git blob `8049f40fe1837595fcf0ceda718f2e51bedb632a`, 121,364 bytes.
- **v2 reference:** commit `af6c80a1`. modern-en `073ca5b4…3eae`, original-en `3521a12d…95a6`.
- **Records as checked (full sha256; each is identical in commit `019a9ecd`):**
  - `CHANGES.json` `029b75fd9ecad4812169c9f84bfd05144bf2d0493bcbff75af6b0569e9ab836c`
  - `CHANGES.md` `0cb3f15dc3e61875013966ebdb7ede0d827052c3e4f827907388469ca0033e5c`
  - `mapping/paragraph-map.tsv` `08961a454ecf16cfb91ad86c1d1a882d0a5d54382a3eaa55c138c1a1a57382c6`
  - `mapping/inserted-paragraphs.tsv` `35112fe550e6395bc841ecf8ac14aadd212dbcbbf28ebe6904aa2392e0734601`
  - `mapping/changed-paragraph-ops.json` `a9017702be24e706b4dc5c3ce7ab6efdeb1b2958a01adfca0b025021f0336d85`
  - `mapping/MAPPING.md` `d26debb4c842f074bff6ac2ea7b9258a272ab16470276a669ef327e8b87d28a3`
  - `hashes/build-summary.json` `4ce7acd4a72ac0633b23cb45622a4369df1e66301acccd90ce1e951a2e3306a8`
  - `hashes/paragraph-hashes-original-en.tsv` `57630823aa9c6c4426700eb907b91486bd57bb6fe17dd3771cffbf60bbf41740`
  - `hashes/paragraph-hashes-modern-en.tsv` `c75b928d6c0dc63e801acfc829530e48d0622f524b3236568d9a587803f1f101`
  - `impact/character-card-impact.json` `2440ec3e6ff26213bae210b5b2c647263a4bae3940c1c50ac22dd6078829e9fc`
  - `impact/IMPACT.md` `a982f0eab417f883541ffb739f3b2188370677abd11e543490f577233441ea03`
  - `source/SOURCE.md` `d27de4b37cbc68af5ca858f84da28ccc23d1b0ed945994edc792d73dfd39d0a2`
  - `coverage/COVERAGE.md` `8f1370b5e4366fa2ef7bee31da4f3113fd412561cdad4c3a7ce16b3cea357f8f`
  - `reviews/RESOLUTION.md` `3b1fb6b81933b2c3a8584ff4d38e12e2791333e4d1514be6a1e7e59a7304f106`
  - `STATUS.md` `d64574969156591943c16918d69d9dc5f490895c52545a6051b0f146ed7776a5`
- **Package activity during the check.**
  - The author committed the working tree as `019a9ecd` ("content: Symposium repair WIP - candidate v3 after re-verification", 11:17:10). I did not make that commit.
  - All 20 package files I compared are byte-identical between the working tree I verified and `019a9ecd`, so these verdicts apply to that commit as well.
  - `reviews/REVERIFY.md` in the package is byte-identical to my v2 report.

## Verdicts

| # | Claim | Verdict | Evidence (short) |
|---|---|---|---|
| D1 | Exact change set v2→v3 | **CONFIRMED** | `cmp` shows original-en byte-identical. In modern-en, the JSON-level diff of all 226 paragraphs and all chapter metadata finds exactly **1.0, 1.3, 1.7 and 3.7**. Replacing only those 4 JSON string literals in v2's bytes reproduces v3 byte for byte. Each character diff is exactly the claimed edit (table below). |
| D2 | Fidelity and clarity of the 4 changed sentences | **CONFIRMED** (2 notes: D-N1, D-N2) | Each sentence still renders Jowett ¶0, ¶3, ¶7 and Jowett 3.7. No name, hedge, time reference or quotation is lost. 1.7 drops Jowett's "over again", which the Greek lacks (D-N2). 3.7 keeps the custom qualification but now as a comma-set modifier (D-N1). Quotation marks balance in all four paragraphs; the quotes are straight and the em-dashes spaced; there is no British spelling or `--`, and the only non-ASCII character is the em dash. |
| D3 | All records consistent with v3 bytes | **CONFIRMED** | The v2 check scripts were re-run unchanged on v3 with 0 problems. The 3.7 opcodes are regenerated, equal a recomputation with `prepare-structural-migration.py`'s `char_ops`/`word_ops`, tile both texts, round-trip every equal span in UTF-16 and rebuild v3 exactly. The other records all match v3: map hashes, the three `text_changed` rows, the inserted-paragraph and hash TSVs (sha, words, UTF-16 length), CHANGES.json and CHANGES.md C-02/C-06, and build-summary sha, blob, bytes, counts and titles. In the card impact: modern-en needs `[1, 3, 7, 8]` and original-en `[1, 7, 8]`, both matching my own hash comparison. 510/510 and 506/506 existing mentions re-resolve, the 10 `offsetChanges` are still exact, the 23/25 new mentions are exact and exhaustive, and the informant mentions and anchors resolve. |
| D4 | Claimed doc fixes present and correct; RESOLUTION.md accurate | **PARTLY** (all substantive fixes correct; two small wording errors in IMPACT.md) | F1, N3, N7, N8, N9 and N10 are present and correct. The gate re-run on v3 gives 0.866 overall, chapter 1 at 0.742 and a restored-block score of 0.48722, at 85.9–118.8% of source length. N2's rewrite of line 40 says the offset changes are "described below"; they are described above, on line 38 (D-N3). N4 is fixed in MAPPING.md, but IMPACT.md line 38 still says "They project exactly through equal spans" (D-N4). RESOLUTION.md is accurate for what can be checked now; its final-commit statements can only be confirmed at that commit (D-N5). |
| D5 | Anything else wrong | **Nothing above NOTE** | There is a slightly inaccurate rationale in CHANGES.md 1.7 (D-N2). The N12 list is missing one small 3.4 item (D-N6). Nothing is blocking and nothing needs fixing before release. |

### D1 detail: v2 → v3 character diffs (modern-en)

| ¶ | v2 → v3 paragraph sha256 | UTF-16 length | Edit |
|---|---|---|---|
| 1.0 | `c1ef8b39…` → `ef725028…` | 815 → 809 | "so I'd like to hear ~~about~~ them from you." (delete at [676,682)) |
| 1.3 | `7b275449…` → `17aef37d…` | 481 → 481 | "since I ~~began keeping company~~ **started spending time** with Socrates" (same length, so later offsets do not move) |
| 1.7 | `cc23c4e7…` → `3e044ef2…` | 1211 → 1205 | "'let's ~~have the whole~~ **hear the** story." (at [413,425)) |
| 3.7 | `b3a63977…` → `aec0ca2a…` (baseline `f3cd77c2…`) | 875 → 876 | "only one honorable way ~~that custom allows~~ **, allowed by custom,** for the beloved to yield" |

No card mention or anchor is affected:
- 1.0: the change is after the last mention at 576.
- 1.3: the Socrates mention at [159,167) sits after the change, and the replacement has the same length, so its offsets are unchanged.
- 1.7: the change is after the last mention at 403.
- 3.7: the paragraph has no card coordinates.

## Findings (all NOTE; no BLOCKING or SHOULD-FIX)

### D-N1. NOTE (no action required): 3.7 now uses a non-restrictive modifier

- **v3:** "There remains, then, only one honorable way, allowed by custom, for the beloved to yield — the way of virtue."
- **Jowett:** "only one way of honourable attachment **which custom allows** in the beloved". This is restrictive: custom allows only one way.
- Set off by commas, "allowed by custom" reads as an aside about the one honorable way. The custom qualification that F2 restored is still there, and the paragraph's framing ("considered dishonorable", "there is dishonor in…") keeps the claim tied to custom, so the meaning holds.
- Review 1's own suggested fix ("— the one our custom allows —") had the same appositive form. The v3 wording also follows the optional alternative I offered in REVERIFY N11. I record the nuance only for exactness.
- **Optional, tighter rendering:** "Custom, then, leaves the beloved only one honorable way to yield — the way of virtue." This is close to the Greek λείπεται δὴ τῷ ἡμετέρῳ νόμῳ μία μόνη ὁδός, checked from memory. It would change the 3.7 opcodes again.

### D-N2. NOTE: 1.7 drops "over again", and CHANGES.md gives a slightly wrong reason

- **v3:** "'Then,' said Glaucon, 'let's hear the story.'"
- **Jowett:** "let us have the tale over again".
- Dropping "over again" is defensible. The Greek is "why not tell it to me?", and the reader already knows from 1.0–1.1 that Glaucon heard a vague version. The later "I'll go through them again for you" keeps the idea of retelling.
- CHANGES.md 1.7 says "'Over again' is dropped because it implied Glaucon had heard the story before". But Glaucon had heard it before, in its vague form. The accurate reasons are the Greek, and that "again" could suggest he had already heard the full account. RESOLUTION #11 gives the Greek reason correctly.
- **Fix (wording only):** "…dropped because the Greek has no 'again' and it could suggest Glaucon had already heard the full account".

### D-N3. NOTE: the N2 rewrite in IMPACT.md points the wrong way

- IMPACT.md line 40 now reads: "Offsets are unchanged except the ten modern-en 3.3 offset changes described **below**."
- Those changes are described **above**, on line 38. Nothing later in the file describes them.
- **Fix:** change "below" to "above", or to "listed under `offsetChanges`".

### D-N4. NOTE: the N4 imprecision remains in IMPACT.md

- MAPPING.md is now exact: the anchors sit at span ends and are to be applied as listed (998 and 1019), not re-projected.
- IMPACT.md line 38 still says the 3.3 mentions "and their eight anchor offsets … They project exactly through equal spans."
- **Fix:** "The mentions project exactly; the anchors sit at insertion points, so apply the listed `offsetChanges` as given (see MAPPING.md)."

### D-N5. NOTE: RESOLUTION.md statements that can only be checked at the final commit

- The following describe the final commit and cannot be verified yet:
  - F10: "`STATUS.md` is replaced there, and `README.md`, `RELEASE-PACKET.md`, `ACCEPTANCE.md` and `HASHES.sha256` are added. All checks are re-run on the final bytes (`ACCEPTANCE.md`)"
  - N6: "all of it is true at the final commit, as checked in `ACCEPTANCE.md`"
  - F1 and N13: `RELEASE-PACKET.md` §6
  - F4: §3.5 and §6.1
  - `REVERIFY-DELTA.md`
- At the time of this check `STATUS.md` (committed, 11:17) correctly says the package is in progress and lists those files as still to come.
- The final commit must include them, with those section numbers, and the final hash manifest must cover every record.
- Everything else in RESOLUTION.md checks out against the v3 bytes:
  - the re-verification summary line;
  - the F1, N2–N4 and N7–N11 results;
  - the updated F2, F6, F9, #5, #7 and #11 rows;
  - the 0.487 figure.

### D-N6. NOTE (trivial): the N12 list in CHANGES.md is missing one 3.4 item

- The list gives "3.4 drops 'of mankind'".
- It omits the other 3.4 shift: "the explanation of it is rather perplexing" → "it's a rather perplexing one".
- Optional: add it, for a complete record for the later modern-English pass.

## Methods

- **D1.** Extracted v2 from `af6c80a1`. Ran `cmp` on original-en. Diffed modern-en at JSON level (keys, chapter metadata and counts, all paragraphs), then rebuilt v3 byte for byte by replacing only the differing JSON string literals in v2. Ran character-level `difflib` per changed paragraph (`delta/d1_diff.py`, output in `delta/d1_out.txt`).
- **D2.**
  - Read the four v3 paragraphs in full against Jowett (PG #1600 ¶0, ¶3, ¶7; original-en 3.7) and the surrounding text.
  - Ran the house-style checks (`r2_style.py`) on v3: quote-token balance, curly and double quotes, `--`, em-dash spacing, British spellings, spacing and non-ASCII characters.
- **D3.**
  - Re-ran the v2 verification scripts unchanged on the v3 working tree: `r4_records.py`, `r4_changes.py` and `r5_cards.py`, with outputs in `delta/*_v3.txt`. They cover:
    - opcode recomputation, tiling, UTF-16 round-trip and rebuild;
    - the paragraph map, inserted-paragraph TSV and hash TSVs;
    - CHANGES.json and CHANGES.md verbatim texts and hashes;
    - build-summary against `git hash-object`;
    - the card remap with offset projection, `offsetChanges`, per-chapter hash comparison, new mentions, anchors and informant mentions.
  - Validated all JSON records.
- **D4.**
  - Diffed every record against `af6c80a1` and checked each claimed fix against the text.
  - Re-ran `classify-modern-en.py --gate` on scratch copies of v3 (`delta/gate_v3.txt`: 0.866; chapter 1 0.742; chapter 3 0.631), and recomputed the restored-block score (0.48722) and length ratios (85.9–118.8%).
  - Checked every line of the new RESOLUTION.md table.
- **D5.**
  - Grepped all current records for stale v2 hashes and wording. They appear only in historical review text (REVIEW-2, REVERIFY, and the RESOLUTION history rows).
  - Compared all 20 package files between the working tree and commit `019a9ecd`.
