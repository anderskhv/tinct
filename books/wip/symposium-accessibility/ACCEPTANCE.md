# Acceptance record: Symposium modern-en accessibility pass

**Decision (2026-09-25): CONTENT ACCEPTED for integration. NOT PUBLISHED.**

- The final candidate below is modern-en only. It keeps Jowett's arguments, examples, qualifications and images, the speakers' distinct positions, and the dramatic frame. It keeps the completeness repair's structure exactly.
- It was independently reviewed for source fidelity (every changed paragraph) and by a blind reader. The findings were resolved, every later edit was independently rechecked, and the whole book was checked for consistency.
- Integration, the reader-data migration, the character-card update and publication belong to the coding owner. None of them has started. **Nothing is published.**

## Accepted candidate

| File | sha256 | git blob | Bytes | Paragraphs |
|---|---|---|---|---|
| `candidate/symposium-modern-en.json` | `a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d` | `0ea53f86c6a3621c7f3e729ce234b78694db695c` | 118,836 | 226: 49, 8, 12, 10, 18, 13, 69, 47 |

- **original-en is not part of this pass.** Integrate it from the completeness package: `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`.
- **Supersedes the completeness modern-en** (`1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f`), on which it is built.
- **Not for integration.** These interim versions are superseded:
  - modern-en v1 `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e` (reviewed by Reviews 1A–1D and 2);
  - modern-en v2 `0f9d7c4c9cb7e97f89b93c7314aaa783d17375815d54d8d451a33ba01dba4d46`;
  - modern-en v3 `72838e2974791827de76d8d65900310541e4146abf71a975eb47d60b570e6ddf` (rechecked by Rechecks 1–2 and the consistency pass);
  - modern-en v4 `50cc0004ebb506b6d947bb12140441a9f4d095afa1e9d7c6a296ef145e134b32` (rechecked by Recheck 3).

## Criteria and evidence

| # | Criterion (from the assignment) | Evidence | Result |
|---|---|---|---|
| 1 | Content only; every file inside `books/wip/symposium-accessibility/`; the accepted completeness package untouched | Commit-scope check at every commit of this pass (final commit in the handoff message). `git diff bebe95b4 -- books/wip/symposium-completeness-repair/` is empty | **Met** |
| 2 | Source and baseline pinned | Source: corrected original-en (Jowett) `3521a12d…95a6`. Baseline: accepted modern-en `1e970b7b…374f` at `bebe95b4`. Both hashes are asserted by every build and verification script | **Met** |
| 3 | Assess first, concentrating on chapters 2 and 4–7; similarity not treated as a defect; clear, faithful language not paraphrased to lower the score | `ASSESSMENT.md` and `assessment/paragraph-assessment.tsv`, one row per paragraph with its decision and reason. 63 paragraphs retained, among them short answers that are identical to Jowett and stay so | **Met** |
| 4 | Restored opening, corrected chapter boundaries and the 226-paragraph structure preserved; fixed paragraph order and count | Verifier: 1.0–1.8 byte-identical; counts 49, 8, 12, 10, 18, 13, 69, 47; titles unchanged; chapter 7 ends with Socrates, chapter 8 begins "When Socrates had finished speaking"; the three C-06 corrections verbatim; verse wording unchanged | **Met** |
| 5 | Every argument, example, qualification and image kept | Source reviews 1A–1D compared every paragraph changed in v1 with Jowett, sentence by sentence. Rechecks 1–4 did the same for every later change. All blocking and should-fix findings were resolved (`reviews/RESOLUTION.md`) | **Met** |
| 6 | The characters' positions kept distinct | STYLE §2 voice table. Review 2 §3 found the voices distinct. The consistency pass checked speaker attribution throughout | **Met** |
| 7 | No euphemism, sanitizing or modern judgment | Victorian euphemisms replaced by plain terms ("genitals", "women who take female lovers"). Ages, pederastic relations, slavery terms and the speakers' views kept as Jowett states them. Jowett's own softenings kept in his words (STYLE §1a). Reviews 1A–1D and Review 2 §4 | **Met** |
| 8 | Explain economically; never put interpretation into a speaker's mouth | Glosses are one phrase each (STYLE §5; listed in reviews 1A–1D). Suggestions that would add argument steps or notes to a speech were declined with reasons (for example Review 2 #16 and #38). The three editorial exceptions are documented (STYLE §1a) | **Met** |
| 9 | Structural or source defects reported separately | `SOURCE-NOTES.md`: no new defect; structural observations; source variants (Jowett against the Greek) with the edition following Jowett throughout | **Met** |
| 10 | Review: a source reviewer checks every changed paragraph against Jowett | Reviews 1A–1D compared all 151 paragraphs changed in v1 with Jowett. Rechecks 1–2 did the same for the 94 paragraphs changed after those reviews (v1 → v3), Recheck 3 for the 37 changed after v3, and Recheck 4 for the 7 changed after v4. Each of the 163 changed paragraphs was therefore checked against Jowett in its final form by an independent reviewer: 7 by Recheck 4, 31 by Recheck 3, 60 by Rechecks 1–2, 65 by Reviews 1A–1D | **Met** |
| 11 | Review: a blind reader explains each speech and flags unclear passages | Review 2 §1 explains the frame and every speech; §2 flags 68 passages (15 should-fix, 53 optional) | **Met** |
| 12 | Findings resolved; every later change independently rechecked | `reviews/RESOLUTION.md` gives the disposition of every finding. Every edit made after a review was rechecked independently against the findings it resolves: Recheck 1, ACCEPT WITH CHANGES (2 should-fix and 14 optional, all adopted); Recheck 2, ACCEPT (16 optional, all adopted); Recheck 3, ACCEPT (9 optional, all adopted); Recheck 4, ACCEPT (1 optional): its one note (7.54 birth imagery) recorded without a text change | **Met** |
| 13 | Whole-book terminology, speaker-attribution and consistency pass | `reviews/CONSISTENCY-PASS-v3.md`: CONSISTENT WITH CHANGES. All 6 should-fix items adopted (7.45 tag, 7.47/7.51/7.52 tags, 8.26 wording, Mantineia); of 14 optional items, 10 adopted in full or in part and 4 declined with reasons (retained accepted paragraphs 3.4, 3.9 and 8.46) | **Met** |
| 14 | Mechanical check that no accepted fix was reverted | Non-regression script over the final candidate (restored opening, the three C-06 corrections, verse wording, structure and chapter boundary; none of the 151 v1 paragraphs back at baseline wording; all 245 adopted review edits present, 221 verbatim and 24 replaced by a later recorded edit; 45 restored Jowett readings and the content of all 8 blocking fixes present: 0 failures) | **Met** |
| 15 | Similarity and completeness checks rerun, unchanged, and reported honestly | `books/classify-modern-en.py symposium --gate`: **PASS**, weighted 0.523 (baseline FAIL, 0.866). `books/audit-truncation.py symposium en`: 0 flags. No waiver and no gate change | **Met** |
| 16 | Handoff contents | Candidate and full sha256; per-paragraph hashes (`hashes/`); changed-paragraph ledger with reasons (`CHANGES.md`, `CHANGES.json`); independent reviews and the resolution record (`reviews/`); this acceptance record; card and annotation impact (`impact/`); `RELEASE-PACKET.md` | **Met** |
| 17 | Character links: exact offsets, unresolved cases identified, availability checked | `impact/character-card-impact.json` and `impact/IMPACT.md` §2. 453 mentions in changed paragraphs: 441 exact, 12 with changed text, 0 unresolved; 35 proposed new mentions; 308 anchor offsets moved, 0 unresolved; every proper-name occurrence in a changed paragraph covered exactly once. The completeness package's early anchors were checked for availability: 4 split into recognition and identity snapshots, 6 accepted | **Met** |
| 18 | Reader data: no discarding of highlights and no snapping of precise annotations to paragraph starts | `migration/MIGRATION.md`: composed live → final data; unresolved highlights and notes kept with quote and coordinates | **Met** |
| 19 | No Danish translation or audio generation; stale-cache list | No Danish or audio written. `impact/narration-stale-modern-en.tsv` lists every modern-en paragraph whose text differs from live | **Met** |
| 20 | Main checked before finalizing; dependency documented | `origin/main` `447a7a65` does not carry the completeness repair. The one-release dependency is in `RELEASE-PACKET.md` §3 | **Met** |

## Final verification run (on the accepted bytes)

**Package verifier** (structure, protected text, house style; quotation-mark counts as soft flags):

```text
PASS serialization indent=2, ensure_ascii=False, no trailing newline
PASS top-level keys unchanged
PASS chapter paragraph counts 49,8,12,10,18,13,69,47 (226)
PASS chapter numbers 1..8
PASS chapter titles unchanged
PASS chapter titles equal original-en
PASS chapter 1 keys unchanged
PASS chapter 2 keys unchanged
PASS chapter 3 keys unchanged
PASS chapter 4 keys unchanged
PASS chapter 5 keys unchanged
PASS chapter 6 keys unchanged
PASS chapter 7 keys unchanged
PASS chapter 8 keys unchanged
PASS restored opening 1.0-1.8 byte-identical to accepted baseline
PASS C-06 fix preserved verbatim in 3.3: For Aristogeiton's love and Harmodius's constancy ...
PASS C-06 fix preserved verbatim in 3.7: There remains, then, only one honorable way, allow...
PASS C-06 fix preserved verbatim in 3.8: because he has done his best to show that he would...
PASS C-06 fix preserved verbatim in 3.8: for the sake of money; and that is not honorable....
PASS verse paragraph 1.16: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 1.18: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 1.21: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 1.23: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 1.45: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 2.1: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 2.3: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 6.1: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 6.5: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 8.11: verse text unchanged (quotation marks may follow the continuation rule)
PASS verse paragraph 8.34: verse text unchanged (quotation marks may follow the continuation rule)
PASS 8.46 (closing paragraph) unchanged
PASS chapter 7 ends with Socrates's closing words (7.68)
PASS chapter 8 starts at the post-speech narration (8.0)
PASS no empty/padded/multi-space/newline paragraphs []
PASS only non-ASCII character is the em-dash (found ['—'])
INFO changed paragraphs: 163
INFO archaic tokens remaining in whole candidate: 0 []
SOFT FINDINGS: 99 heuristic flags, each reviewed by hand: 44 capitalized source words not found verbatim; 29 single-quote counts in paragraphs that continue a quotation; 21 source number words rephrased; 3 negation-count differences; 2 renderings under 80% of source length
HARD FAILURES: 0
```

**Quotation continuity** (every quotation left open at a paragraph end is reopened at the start of the next, per STYLE §3.4; nesting levels alternate; double quotes balance). The same check fails on the baseline at 1.33, 1.45, 4.5 and 5.7, among others, which were quotation defects this pass fixed:

```text
open-ended paragraphs (quotation continued in the next paragraph): 28
  1.15, 1.16, 1.17, 1.18, 1.20, 1.21, 1.44, 1.45, 5.1, 6.9, 7.47, 7.48, 7.51, 7.53, 7.55, 7.56, 7.58, 7.59, 7.60, 7.61, 7.62, 7.63, 7.64, 7.65, 8.0, 8.10, 8.11, 8.29
PASS every open quotation is continued in the next paragraph; double quotes balance in every paragraph
```

**Non-regression** (accepted fixes and every adopted review edit still present, or replaced by a later recorded edit):

```text
PASS restored opening 1.0-1.8 byte-identical to the accepted completeness text (C-02)
PASS the three C-06 corrections (3.3, 3.7, 3.8) present verbatim
PASS verse wording of the 11 verse paragraphs unchanged (quotation marks aside)
PASS structure 226 = 49, 8, 12, 10, 18, 13, 69, 47 (C-03 regroup kept)
PASS chapter 7/8 boundary kept (C-03)
PASS none of the 151 paragraphs changed in v1 is back to baseline wording []
INFO B2 (5.1) replaced by later recorded edit R1-12
INFO B9 (5.6) replaced by later recorded edit R1-13
INFO B11 (5.7) replaced by later recorded edit R1-14
INFO B15 (5.15) replaced by later recorded edit K-12a
INFO A5 (3.5) replaced by later recorded edit R1-5
INFO A7 (3.8) replaced by later recorded edit R1-7
INFO A8 (4.1) replaced by later recorded edit CAP-41
INFO C17 (7.45) replaced by later recorded edit E44
INFO C22bc (7.49) replaced by later recorded edit K-17
INFO C27a (7.54) replaced by later recorded edit E48a
INFO C3 (7.60) replaced by later recorded edit R2-7
INFO C25a (7.62) replaced by later recorded edit E52a
INFO C14 (7.63) replaced by later recorded edit C4, E53a
INFO C4 (7.63) replaced by later recorded edit E53a, E53c
INFO C28-764c (7.64) replaced by later recorded edit R2-8
INFO D27 (8.28) replaced by later recorded edit E62
INFO D20d (8.30) replaced by later recorded edit R2-12
INFO CAP-750 (7.50) replaced by later recorded edit R2-5
INFO E34 (4.8) replaced by later recorded edit R1-10
INFO E42 (7.0) replaced by later recorded edit R2-1
INFO E43 (7.45) replaced by later recorded edit K-2
INFO E68 (8.43) replaced by later recorded edit R2-15
INFO E5h (1.45) replaced by later recorded edit R1-1
INFO E58a (8.10) replaced by later recorded edit R2-9
PASS 245 adopted edits from 10 edit files: 221 present verbatim, 24 replaced by a later recorded edit, 0 missing
PASS 45 Jowett readings restored under the source policy (SOURCE-NOTES.md §3) all present []
PASS content of all 8 BLOCKING fixes present []
FAILURES: 0
```

**Repository similarity gate and truncation audit** (unchanged scripts, run read-only with `EDITIONS_DIR` pointed at a scratch copy):

```text
Before: the accepted completeness modern-en (1e970b7b…374f)
== classify-modern-en.py symposium --gate --per-chapter  (EDITIONS_DIR=<scratch>/base-ed)
  ch    1  sim 0.742  REAL        The Gathering
  ch    2  sim 0.914  LIGHT       Phaedrus's Speech
  ch    3  sim 0.631  REAL        Pausanias's Speech
  ch    4  sim 0.909  LIGHT       Eryximachus's Speech
  ch    5  sim 0.937  LIGHT       Aristophanes's Speech
  ch    6  sim 0.950  LIGHT       Agathon's Speech
  ch    7  sim 0.901  LIGHT       Socrates & Diotima
  ch    8  sim 0.915  LIGHT       Alcibiades
symposium original-en -> modern-en  (8 chapters)
  weighted similarity : 0.866   (gate: <= 0.75)
  light+mechanical    : 6/8 = 75.0%   (gate: <= 5%)
  identical long paras: 3/170 = 1.8%   (gate: <= 5%)
  buckets: REAL-HEAVY 0  REAL 2  LIGHT 6  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE FAIL
exit status: 1
== audit-truncation.py symposium en  (EDITIONS_DIR=<scratch>/base-ed)
== symposium: modern-en vs original-en ==
  TOTAL: 0

After: this candidate (a848700f…b76d)
== classify-modern-en.py symposium --gate --per-chapter  (EDITIONS_DIR=<scratch>/gate-ed)
  ch    1  sim 0.565  REAL        The Gathering
  ch    2  sim 0.529  REAL        Phaedrus's Speech
  ch    3  sim 0.617  REAL        Pausanias's Speech
  ch    4  sim 0.474  REAL-HEAVY  Eryximachus's Speech
  ch    5  sim 0.465  REAL-HEAVY  Aristophanes's Speech
  ch    6  sim 0.531  REAL        Agathon's Speech
  ch    7  sim 0.509  REAL        Socrates & Diotima
  ch    8  sim 0.510  REAL        Alcibiades
symposium original-en -> modern-en  (8 chapters)
  weighted similarity : 0.523   (gate: <= 0.75)
  light+mechanical    : 0/8 = 0.0%   (gate: <= 5%)
  identical long paras: 2/170 = 1.2%   (gate: <= 5%)
  buckets: REAL-HEAVY 2  REAL 6  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS
exit status: 0
== audit-truncation.py symposium en  (EDITIONS_DIR=<scratch>/gate-ed)
== symposium: modern-en vs original-en ==
  TOTAL: 0
```

## Review record

| Review | Scope | Verdict | After resolution |
|---|---|---|---|
| Reviews 1A–1D: source fidelity (four independent reviewers, source access) | Every paragraph changed in v1 (151), sentence by sentence against Jowett | ACCEPT WITH CHANGES (8 blocking, 48 should-fix, 51 optional) | Every blocking and should-fix item adopted; optional items adopted or declined with reasons |
| Review 2: blind reader (no source access) | The whole v1 text, read cold as a first-time reader; each speech explained | ACCEPT WITH CHANGES (15 should-fix, 53 optional) | 14 should-fix items adopted or already fixed; #1 (a speaker label at 1.0) declined, since Jowett has none and the restored opening is protected |
| Recheck 1 (independent, source access) | Every chapter 1–6 paragraph changed after the reviews (51) | ACCEPT WITH CHANGES (2 should-fix, 14 optional) | All adopted in v4 |
| Recheck 2 (independent, source access) | Every chapter 7–8 paragraph changed after the reviews (43) | ACCEPT (16 optional) | All adopted in v4 |
| Consistency pass (independent) | Whole book: terminology, speaker attribution, quotation convention, house style | CONSISTENT WITH CHANGES (6 should-fix, 14 optional) | All should-fix items adopted; 10 optional adopted in full or in part, 4 declined with reasons |
| Recheck 3 (independent, source access) | Every paragraph changed after v3 (37) and the declined findings | ACCEPT (9 optional) | All adopted in v5 |
| Recheck 4 (independent, source access) | Every paragraph changed after v4 (7) | ACCEPT (1 optional) | Recorded in STYLE §1a and SOURCE-NOTES §3 as the reviewer suggested; no text change |

## Remaining issues (open, not resolved by this package)

1. **Integration dependency.** Main still serves the pre-repair editions. Ship the completeness repair and this pass as **one** content release, using the composed migration data (`RELEASE-PACKET.md` §3).
2. **Character card.** Apply the staged proposals: remap, text changes, new mentions and the availability-checked anchors. The conservative Alcibiades alternative is documented.
3. **Danish.** Mark `modern-da` `aligned: false` in the same release. No Danish is written.
4. **Caches.** Exclude stale narration and rebuild the seek maps for every modern-en chapter. No audio is generated.
5. **Recorded, not changed:** the structural observations and source variants in `SOURCE-NOTES.md`; the ten upstream Gutenberg slips in original-en (completeness package).
