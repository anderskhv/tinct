# Codex Handoff — Book Content Repairs, 2026-09-26 assignment

**Branch:** `claude/cool-clarke-ngd780`
**This document's commit:** HEAD at time of writing is `67a67084`
**Scope:** content-only. No `app/**`, registry, character-card, threads,
onboarding, audio, or live-data file was touched by this assignment. No
publication, deployment, reader-data migration, or audio cleanup was
performed. Codex owns all of that, per `books/BOOK-TASK-WORKFLOW.md`.

**Completion claim (read carefully): all 16 originally-held editions
listed below are editorially accepted as content candidates** — each has
passed independent review to the standard documented per-package. **This
is not a claim that any defect is fixed live**, that every finding in the
broader 700+-book library audit is resolved, or that these packages are
safe to publish without Codex's own integration verification. Several
specific gaps, discovered during this final reconciliation pass, are
recorded honestly in Part 3 below — they are not fixed, and are not
hidden.

---

## Part 1 — What "16 held editions" means

The original assignment named editions across 9 books, held for repair
pending this content work:

- Macbeth: `original-en`, `modern-en`, `modern-da` (3)
- As You Like It: `original-en`, `modern-en`, `modern-da` (3)
- Faust Part I: `original-en`, `modern-en`, `modern-da` (3)
- Jerusalem: `modern-en`, `modern-da` (2)
- Confessions: `modern-da` (1)
- Paradise Lost: `modern-da` (1)
- Heart of Darkness: `modern-da` (1)
- Discourse on Inequality: `modern-da` (1)
- A Vindication of the Rights of Woman: `modern-da` (1)

**Total: 16.**

**Two additional packages, outside the 16 holds, also produced and
accepted in this assignment:**
- Jerusalem `original-en` (touched only for the chapter-9/10 parsing fix
  and one completed quotation; the 16-hold list only named `modern-en`,
  but the structural fix required touching `original-en` too, per
  Anders's instruction to preserve it except for that one parsing
  correction).
- Faust Part I `original-de` (a separate, narrowly-scoped transcriber's-note
  removal — not part of the 16-hold list, authorized as its own small fix).

---

## Part 2 — Consolidated matrix, all 18 packages

Every row: branch is `claude/cool-clarke-ngd780` for all. "Final commit"
is the last commit that touched that package's content or review record.

### Macbeth

| Field | original-en | modern-en | modern-da |
|---|---|---|---|
| Candidate path | `books/wip/macbeth-completeness-repair/editions/macbeth-original-en.json` | `books/wip/macbeth-completeness-repair/editions/macbeth-modern-en.json` | `books/wip/macbeth-modern-da-repair/editions/macbeth-modern-da.json` |
| SHA-256 | `9df987bdf1a1a8c50d44e0c4c2ab6a18e2580f47114810232e8022eecca207c6` | `c597a985ce096a923b03a5072e52f6d8bd5bbc44c0c11fd924ff4e0019351bec` | `6441958cec4ddadeb9408414db103cb8228ad9694c39a19c7e359261417a3a18` |
| Replaces live SHA-256 | `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608` | `0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1` | `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57` |
| Source/baseline | Project Gutenberg #1533 (unchanged public-domain edition identity — only completeness restored, no re-source) | Same source; modernized from the corrected original-en | Danish translation of the 34 restored passages, inserted at the accepted modern-en's coordinates into the pre-existing Danish text |
| Structural mapping | 806→840 paragraphs (34 speech blocks restored); 28 chapters unchanged | 840 paragraphs, chapter-for-chapter matching original-en | 28 chapters, paragraph counts match modern-en exactly; 12 of 28 chapters entirely untouched (byte-identical to live) |
| Review evidence | Independent review: re-derived all 34 restorations from source, ACCEPT, no defects (`macbeth-completeness-repair/INDEPENDENT-REVIEW.md`) | Same package/review as original-en | Independent review, full re-derivation of all 38 change-list entries plus specific scrutiny of 2 judgment calls beyond the task's 2 named special cases; ACCEPT, no defects (`macbeth-modern-da-repair/INDEPENDENT-REVIEW.md`) |
| Acceptance scope | Whole-edition completeness (34 restorations); prose elsewhere in original-en NOT touched, per Anders's instruction to preserve it | Whole-edition, same 34 locations plus 2 re-segmented paragraphs | Whole-edition (all 34 restorations translated); does not re-review the 12 untouched chapters' pre-existing fidelity beyond byte-identity confirmation |
| Final commit | `cac00f9b` | `cac00f9b` | `606e8a61` |
| Unresolved | Character-card re-anchoring data provided, not applied. Danish-scope decision (reopening `STRATEGY.md` freeze) needed only insofar as Codex chooses whether/when to integrate — but Macbeth Danish was explicitly authorized this round, so no further scope decision is pending for this book specifically. | (same) | (same) |

### As You Like It

| Field | original-en | modern-en | modern-da |
|---|---|---|---|
| Candidate path | `books/wip/as-you-like-it-completeness-repair/editions/as-you-like-it-original-en.json` | `books/wip/as-you-like-it-completeness-repair/editions/as-you-like-it-modern-en.json` | `books/wip/as-you-like-it-modern-da-repair/editions/as-you-like-it-modern-da.json` |
| SHA-256 | `8ab533a42958f570a59d12e686793d4397ff0efe6c9b061acfb468d645254358` | `5a4e95bbf50e3affb4581cc5acd53d19322642e81894342bc56bd03fc7f75e48` | `1229f6875d9177eff984f7ed40d57c883ba88c9844e63bb8154406bd6b8b25b5` |
| Replaces live SHA-256 | `2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179` | `df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4` | `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` |
| Source/baseline | 1990-93 World Library etext (`1ws2510.txt`), same underlying transcription as before — notice removed, structure corrected, Act 1 Scene 1 restored from the same source family | Modernized from corrected original-en | Danish: 880 relocated paragraphs (pure relocation of pre-existing Danish text) + 51 newly translated (Act 1 Scene 1, 47 paragraphs; 4 scene captions) |
| Structural mapping | 17→23 chapters (22 scenes + separated Epilogue), 901→931 paragraphs (Act 1 Scene 1 restored, 21 notice/apparatus paragraphs removed, 4 captions added). Full `PARAGRAPH-MAP.json` in package. | Same structure as original-en | Same 23-chapter/931-paragraph structure; relocation via the same `PARAGRAPH-MAP.json` |
| Review evidence | Independent review found 1 defect (missing scene captions at 4 split chapters), fixed, re-verified (`as-you-like-it-completeness-repair/ACCEPTANCE-RECORD.md`) | Same package | Independent review: full (not sampled) check of all 880 relocated paragraphs, full read of Act 1 Scene 1, plus a whole-edition fidelity re-check of the pre-existing relocated translation (~21% sample + 2 full chapters) — found and fixed 1 pre-existing defect (`as-you-like-it-modern-da-repair/INDEPENDENT-REVIEW.md`) |
| Acceptance scope | Whole-edition structural/completeness repair | Same | Whole-edition, including a first-ever fidelity check of the pre-existing (not authored by this session) relocated Danish text |
| Final commit | `6cbac3ad` | `6cbac3ad` | `09f1a9dc` |
| Unresolved | **Rights/provenance question, explicitly not resolved** — see Part 5. Two low-severity (S4) findings from a later review pass not addressed by this repair: Jaques's final bequest speech (chapter 22, paragraph 57 onward) served as unlabelled paragraphs rather than individually speaker-tagged; duplicate "EPILOGUE"/"EPILOGUE." heading paragraphs at the start of chapter 23. Both confirmed still present in the final candidate (see Part 3). | (same) | (same) |

### Faust Part I

| Field | original-en | modern-en | modern-da |
|---|---|---|---|
| Candidate path | `books/wip/faust-part-1-english-repair/editions/faust-part-1-original-en.json` | `books/wip/faust-part-1-english-repair/editions/faust-part-1-modern-en.json` | `books/wip/faust-part-1-modern-da-repair/editions/faust-part-1-modern-da.json` |
| SHA-256 | `e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d` | `7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe` | `04e36f410cdaea3019cc593bdb2c52fe2ffed56eca39db7fc2ad3d178f980bb5` |
| Replaces live SHA-256 | `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395` | `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` | `ce719108b40e89f1f008d16a62e1fa7dc9e1f1600b2481439696873f9b471191` |
| Source/baseline | **Full source-identity replacement**: was mislabeled Hayward/Buchheim OCR (bilingual-scan-derived, incomplete, German-contaminated); now Bayard Taylor's complete 1870/71 translation, PG #14591, verified byte-identical to a fresh independent re-download this session | Full fresh render from the corrected Taylor original-en | Full fresh translation (5 parallel batches) from the accepted modern-en |
| Structural mapping | **Not coordinate-preserving.** 895→1,060 paragraphs, same 28 chapters/scenes but different underlying text throughout — no old→new paragraph map exists or is possible, since the source text itself changed, not just its structure. | Same 1,060-paragraph structure as original-en | Same 1,060-paragraph structure |
| Review evidence | Independent review: 12 scenes deep-diffed word-for-word against raw source; found and fixed 2 defects (leaked illustration caption, stray footnote digits) (`faust-part-1-english-repair/INDEPENDENT-REVIEW.md`) | Independent review: structural parity, word-ratio check, close read of every priority passage, dark-content-unsoftened check, archaism scan; ACCEPT, no defects (`MODERN-EN-INDEPENDENT-REVIEW.md`) | Independent review across all 5 translation batches, exhaustive speaker-name consistency check; found and fixed 2 cosmetic issues (title spelling, a grammar glitch) (`faust-part-1-modern-da-repair/INDEPENDENT-REVIEW.md`) |
| Acceptance scope | Whole-book replacement, editorially accepted | Whole-book, editorially accepted | Whole-book, editorially accepted |
| Final commit | `0bc58bb0` | `0bc58bb0` | `c0c7f100` |
| Unresolved | **Edition-identity and reader-coordinate migration are explicitly NOT resolved by this content package** — this is the single largest unresolved integration question in this whole assignment. See Part 5/6. Character-card and onboarding impact not assessed (text changed, not just structure, so a mechanical index shift is insufficient). | (same) | (same) |

### Jerusalem

| Field | original-en (additional, not in the 16 holds) | modern-en | modern-da |
|---|---|---|---|
| Candidate path | `books/wip/jerusalem-completeness-repair/editions/jerusalem-original-en.json` | `books/wip/jerusalem-completeness-repair/editions/jerusalem-modern-en.json` | `books/wip/jerusalem-modern-da-repair/editions/jerusalem-modern-da.json` |
| SHA-256 | `abc0618b87f5384b803432bf430fcdab4c31280924460609e9efc7c17286d407` | `16d31a4e0c35879737c9b95c2ad2a9bfc59127e1065db1fa14b89d50e0916b0f` | `6f6cd917ea610763f025623a055b8e043e4398651fe6095c1943f000606b6297` |
| Replaces live SHA-256 | `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c` | `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` | `c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223` |
| Source/baseline | Project Gutenberg #15837 (Velma Swanston Howard translation, 1915) — same source, only the chapter-9/10 parsing fix and one completed quotation applied; no other prose in original-en touched | Full whole-edition re-render (all 17 chapters, all 1,787 paragraphs) from the corrected original-en, after the mandatory similarity gate failed at 0.892 on a narrower first pass | Danish: structural merge (18→17 chapters) plus 61+12=73 paragraphs retranslated for fidelity across 3 review rounds |
| Structural mapping | 18→17 chapters (spurious chapter-split merge), 1,787 paragraphs total unchanged | 17 chapters, 1,787 paragraphs, matching original-en | 17 chapters, 1,787 paragraphs, matching modern-en; `sections` array corrected in both original-en/modern-en and modern-da |
| Review evidence | 3 independent review rounds: narrow-fix review, whole-edition review (found 5 fabricated paragraphs), targeted recheck (`WHOLE-EDITION-REVIEW.md`, `RECHECK-CH3-CH5.md`) | Same 3 rounds — see Part 3 for the exact defect-by-defect reconciliation, since this book's fabrication history is the most extensive in this assignment | 2 independent review rounds: round 1 found 10 further defects (beyond the 61 already-known-pattern fixes), fix pass + full chapter-4 manual read found 2 more, round 2 (recheck) confirmed all 12 fixes clean (`INDEPENDENT-REVIEW.md`, `RECHECK.md`) |
| Acceptance scope | Structural fix only; explicitly NOT a re-review of the rest of original-en's prose | Whole-edition fidelity repair — gate PASSES at 0.747 (was 0.892) | Whole-edition fidelity repair, matching the English's standard |
| Final commit | `ff67eca2` | `ff67eca2` | `06f32d9e` |
| Unresolved | **G07-jerusalem-04 (heading fragments served as body paragraphs) is NOT fixed** — see Part 3, newly discovered during this reconciliation. Danish-scope was already reopened for Jerusalem this round, so no further scope decision pending. | Same G07-jerusalem-04 gap | Same G07-jerusalem-04 gap (inherited unchanged from original-en/modern-en) |

### Confessions, Paradise Lost, Heart of Darkness, Discourse on Inequality, Vindication — `modern-da` only

| Field | Confessions | Paradise Lost | Heart of Darkness | Discourse on Inequality | Vindication |
|---|---|---|---|---|---|
| Candidate path | `books/wip/confessions-modern-da-repair/editions/confessions-modern-da.json` | `books/wip/paradise-lost-modern-da-repair/editions/paradise-lost-modern-da.json` | `books/wip/heart-of-darkness-modern-da-repair/editions/heart-of-darkness-modern-da.json` | `books/wip/discourse-on-inequality-modern-da-repair/editions/discourse-on-inequality-modern-da.json` | `books/wip/vindication-modern-da-repair/editions/vindication-rights-of-woman-modern-da.json` |
| SHA-256 | `1a0fad4ebb7be4c49d85f19254aa7fda8481bdd861ba8905ee56a959836383c8` | `caac94f81ee07d40ebfdaf30f820baa8dbaa1c03d27911a13baf33d33e072f7c` | `2bc45f4bf5a3280a1c86099e9f83357a9fdfdc09492b62f5936233d4e13074c9` | `b7143d44f029fad16d1d4baa38ba7e8307929338f6fc1f980daea2f638fcf439` | `a6c4dd4a2d7f603c88756f7e3ac0d9173565864bcc7a6f9d40af8cc48652b2af` |
| Replaces live SHA-256 | `4935d43ca05f87da69b94c37d3b2079ed8591a7769cf45f57a213690ec0b19bb` | `266ada0a3a74b0838b1dfe4a54a08d2959f03d627ddc955e954fcb306ead117c` | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` | `383db95bbf30559d6ba41eb2045d37f2a24db49e9a3e80b2e246efb8e6b2c224` | `41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880` |
| Baseline | Accepted `modern-en` (Books 10-13 only; Books 1-9 pre-existing) | Accepted `modern-en`, Books 1/2/5/6 (only abridged books touched) | Accepted `modern-en`, chapter 3 only | Accepted `modern-en`, chapter 4 only | Accepted `modern-en` (chapters 1-6, 10-15; chapters 7-9 pre-existing) |
| Structural mapping | 13 chapters unchanged; 206 of 462 paragraphs replaced (Books 10-13) | 12 chapters unchanged; 165 of 1,188 paragraphs replaced across Books 1/2/5/6 | 3 chapters unchanged; 87 of 198 paragraphs (all of chapter 3) replaced | 4 chapters unchanged; 67 of 170 paragraphs (all of chapter 4) replaced | 15 chapters unchanged; 544 of 778 paragraphs replaced (chapters 1-6, 10-15) |
| Review evidence | Independent review ACCEPT (`ACCEPTANCE-RECORD.md`); separate Books 1-9 first-time check, 100% coverage, clean (`BOOKS-1-9-COMPLETENESS-CHECK.md`); combined coverage confirmed (`WHOLE-EDITION-COVERAGE-CONFIRMATION.md`) | Independent review ACCEPT, no defects | Independent review ACCEPT after fixing a slur-consistency error and a word-order slip | Independent review ACCEPT after 3 copyedit fixes | Independent review round 1: DO NOT ACCEPT (1 defect) → fixed → ACCEPT; then a 100%-coverage full fidelity review (this final round), zero defects, 3 typos fixed |
| Acceptance scope | **Books 10-13 only** (explicitly not the whole 13-book edition — see `WHOLE-EDITION-COVERAGE-CONFIRMATION.md`) | Books 1/2/5/6 abridgment fix only; Books 3/4/7-12 untouched (already clean per audit) | Chapter 3 only; chapters 1-2 already Danish and untouched | Chapter 4 only; chapters 1-3 already Danish and untouched | Chapters 1-6 and 10-15; chapters 7-9 pre-existing Danish, untouched, and NOT independently reviewed by this assignment |
| Final commit | `1b79a192` (100% coverage review); `67a67084` (whole-edition confirmation) | `5d537bba` | `a6b46ae0` | `ddf1b115` | `1b79a192` |
| Unresolved | None within scope. | None within scope; note G10-paradise-lost-01/02 (missing Arguments + "The Verse" front matter, affecting all 3 editions) are a SEPARATE, unaddressed audit finding — see Part 3. | None within scope. | None within scope; note G09-discourse-on-inequality-02 (missing Cole's Appendix + 9 footnotes, affecting all 3 editions) is a SEPARATE, unaddressed audit finding — see Part 3. | Rights/provenance not at issue for this book. Chapters 7-9's own fidelity was never independently reviewed by anyone in this assignment (pre-existing, out of scope, not flagged defective by the audit). |

### Faust Part I `original-de` — additional, not in the 16 holds

| Field | Value |
|---|---|
| Candidate path | `books/wip/faust-part-1-original-de-fix/editions/faust-part-1-original-de.json` |
| SHA-256 | `0dff98ddf2336b64769fe76e1658b61abfe178dd1c5b121c54927296afdd7d65` |
| Replaces live SHA-256 | `edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5` |
| Source/baseline | PG #21000 (German original), same source — only the trailing transcriber's-note removal at chapter 28's final paragraph |
| Structural mapping | 28 chapters, paragraph counts unchanged; only the content of the last paragraph trimmed |
| Review evidence | Independent review: verified against raw source and a direct diff vs. live file — exactly one difference, ACCEPT (`faust-part-1-original-de-fix/INDEPENDENT-REVIEW.md`) |
| Acceptance scope | This ONE fix only |
| Final commit | `dc77f925` |
| Unresolved | **G07-faust-part-1-15, -16, -17 are NOT fixed** — dropped speaker labels in the Vor dem Thor crowd scene, missing scene-opening stage directions/speaker labels in most scenes, and heading fragments served as text. These are separate, confirmed audit findings in `original-de` that this narrow package never addressed. See Part 3. |

---

## Part 3 — Audit reconciliation: every major confirmed finding vs. final candidates

Source: `books/wip/inventory-completeness-audit/CONFIRMED-DEFECTS.md` and
`NEEDS-INVESTIGATION.md` on `origin/claude/laughing-maxwell-3d7f5l`
(the original library-wide audit this assignment worked from).

**Method note, per instruction:** status below is based on reading the
actual candidate text against source/baseline at the cited coordinates —
not on similarity scores, paragraph counts, or language scans alone.
Where a status rests only on a scan or count (e.g. structural parity),
that is stated explicitly, not offered as fidelity proof.

### FIXED and INDEPENDENTLY VERIFIED (paragraph-level read, not just counts/scans)

| Finding ID | Book | What | Verification |
|---|---|---|---|
| G01-macbeth-01 through -13 | Macbeth | 34 dropped speech blocks, incl. both soliloquies | Independent review re-derived all 34 from source directly; separately re-verified in the Danish package | 
| G01-as-you-like-it-01 | As You Like It | Missing Act 1 Scene 1 (1,493 words) | Independent review re-derived the scene from source, confirmed 47/47 paragraphs, correct attribution |
| G01-as-you-like-it-02 | As You Like It | Wholesale chapter mislabeling, merged scenes | Independent review independently re-derived the full 23-chapter structure from source |
| G01-as-you-like-it-03/04 | As You Like It | World Library licence notice served as reading text (4 places) | Independent review confirmed zero occurrences of the notice text anywhere in the candidate, in both English and Danish |
| G07-faust-part-1-01 through -13 | Faust (English) | Wrong translation labelled; ~1,870 words missing; ~2,590 German words mixed in | **Superseded by full source replacement**, not fixed paragraph-by-paragraph — the old Hayward/Buchheim-derived text these findings describe no longer exists in the candidate at all; Taylor's translation has none of these defects by construction (verified: no German-bleed possible in a monolingual source; completeness verified via 12-scene deep-diff against the actual Taylor raw text) |
| G07-faust-part-1-14 | Faust (German) | PG transcriber's note appended to final line | Independent review: direct diff vs. live, exactly this one paragraph changed, confirmed against raw source |
| G07-jerusalem-01 | Jerusalem | Spurious chapter split ("Unity, Unity.") | Independent review (round 2, whole-edition) confirmed the merge seam reads as one continuous narrative, quote completed correctly |
| G07-jerusalem-02 | Jerusalem | 51 modern-en paragraphs (chapters 1-8) lose endings, replaced with invented material; modern-da copies it | **Fixed across 3 rounds of review** — English: narrow 17-paragraph fix, then whole-edition re-render, then 2 more rounds catching 5 further fabricated paragraphs (ch3: 16,35,36; ch5: 16,17) plus a 23-paragraph "looser" range (ch5 38-60); Danish: same 28 locations retranslated, plus 33 more found by this package's own scan, plus 12 more found by round-1 independent review (10) and the mandated chapter-4 full read (2). Spot-verified in this reconciliation pass: chapter 1 paragraphs 10, 11, 17, 24, 25, 56 (cited in NEW-1, see below) all read faithful against the corrected English, no fabrication remaining. |
| G07-jerusalem-03 | Jerusalem | modern-en chapters 15-18 (now 14-17) byte-identical to original-en, served as "Modern English" | Fixed by the whole-edition re-render — independent review confirmed no chapter reads as LIGHT/mechanical, all 17 chapters show sustained sentence-level rewriting |
| G07-jerusalem-05 (implicit, sections metadata) | Jerusalem | `sections` array stale after chapter merge | Found and fixed in round 1 of English independent review; same fix applied and re-verified in the Danish package |
| G09-vindication-rights-of-woman-02 | Vindication | modern-da chapters 1-6, 10-15 serve unmodernized English | Fixed: full retranslation, independently reviewed at 100% paragraph coverage (two review passes), zero remaining English detected by whole-word function-word scan across all in-scope paragraphs |
| G10-confessions-01 | Confessions | modern-da Books 10-13 all `[TBD]` placeholders | Fixed: full translation, independently reviewed, zero placeholders remain |
| G10-paradise-lost-03 | Paradise Lost | modern-da abridged ~11,400 words in Books 1/2/5/6 | Fixed: 165 paragraphs replaced, independently reviewed against full-length English, word-ratio and direct reads both confirm |
| G07-heart-of-darkness-01 | Heart of Darkness | modern-da chapter 3 served in English | Fixed: full chapter 3 translated, independently reviewed |
| G09-discourse-on-inequality-04 | Discourse on Inequality | modern-da chapter 4 served in English | Fixed: full chapter 4 translated, independently reviewed |

### NEW findings surfaced by this assignment's own review process (not in the original audit, found and fixed)

| Finding | Book | What | Status |
|---|---|---|---|
| NEW-1 (this assignment) | Jerusalem (Danish) | 10 further drop/fabrication defects beyond the 61 already-pattern-matched, 6 clustered in chapter 4 | Fixed, independently rechecked, ACCEPT |
| NEW-2 (this assignment) | Jerusalem (Danish) | 2 more of the same class, found only by the mandated full chapter-4 manual read | Fixed, independently rechecked, ACCEPT |
| NEW-3 (this assignment) | As You Like It (Danish) | 1 pre-existing translation slip (missing verb) in relocated text, never reviewed by anyone before this pass | Fixed |
| NEW-4 (this assignment) | Faust (Danish) | Chapter-title spelling drift, one grammar glitch | Fixed |
| NEW-5 (this assignment) | Vindication (Danish) | 1 fully untranslated paragraph; later, 3 minor spelling typos | Fixed |

### UNRESOLVED — confirmed findings this assignment did NOT fix (discovered or reconfirmed during this reconciliation pass; not fixed now, reported honestly)

| Finding ID | Book/edition | What | Why unresolved |
|---|---|---|---|
| G07-jerusalem-04 | Jerusalem, all 3 editions (`original-en`, `modern-en`, `modern-da`) | Book/part heading fragments ("II", "III", "IV", "BOOK TWO"/"ANDEN BOG", "BOOK THREE"/"BOG TRE") served as standalone body paragraphs at original-en 1.55, 1.87, 1.132, 1.307, 8.235 | **Newly reconfirmed present, unchanged, in all three final candidates** during this reconciliation (verified directly: all 5 paragraphs still read as bare heading fragments in `original-en`, `modern-en`, and `modern-da`, chapter and index unchanged from the audit's citation). Jerusalem's repair scope was the chapter-9/10 split and modern-en/modern-da fidelity — this apparatus-as-text defect was never in scope for either pass and was missed. Not fixed in this assignment. |
| G07-faust-part-1-15 | Faust, `original-de` | ~17 speaker labels dropped in the Vor dem Thor crowd scene (5.0-5.10, 5.19), merging different characters' lines under one speaker tag | The `original-de` package only removed the chapter-28 transcriber's note; this defect was never in that package's scope. Confirmed still unaddressed. |
| G07-faust-part-1-16 | Faust, `original-de` | Scene-opening stage directions and the first speaker label dropped in most scenes (17 scenes affected) | Same package-scope reason; unaddressed. |
| G07-faust-part-1-17 | Faust, `original-de` | Heading fragments and markup served as body text (e.g. "lustige Person._", "Der Tragödie", "Walpurgisnachtstraum / oder") | Same package-scope reason; unaddressed. |
| G09-discourse-on-inequality-02 | Discourse on Inequality, `original-en`/`modern-en`/`modern-da` | Cole's Appendix (Rousseau's Note IX, 3,112 words) and 9 footnotes (~450 words) missing from all three editions; footnote markers [1]-[8] remain with no footnote text | This assignment's Discourse package only translated the existing chapter 4 into Danish — it did not add the missing Appendix/footnote content to any edition. Confirmed still absent from all three. |
| G10-paradise-lost-01 | Paradise Lost, all 3 editions | Milton's 12 prose Arguments (2,399 words) missing | This assignment's Paradise Lost package only fixed the Book 1/2/5/6 Danish abridgment — it did not add the missing Arguments to any edition. Confirmed still absent. |
| G10-paradise-lost-02 | Paradise Lost, all 3 editions | Milton's prefatory note "The Verse" (236 words) missing | Same reason; confirmed still absent. |
| V06-NEW-1 | As You Like It | Jaques's final bequest speech (chapter 22, from paragraph 57) served as 7 unlabelled paragraphs instead of individually speaker-tagged | Low severity (S4/informational in the audit), not part of this assignment's named repair scope. Confirmed still present in the final candidate. |
| V06-NEW-2 | As You Like It | Duplicate "EPILOGUE"/"EPILOGUE." heading paragraphs at the start of chapter 23 | Same — low severity, not in scope, confirmed still present. |

### Findings explicitly outside this assignment (named for completeness, not evaluated further here)

These come from the same original audit but concern books, editions, or
questions this assignment was never asked to touch. Listed so nobody
mistakes their absence above as an oversight:

- All findings for books not named in this assignment (the audit covers
  700+ books; only 9 were in scope here).
- `V07-N4` (Don Quixote/Karamazov shard-vs-whole-file inconsistency),
  `NEW-V09-1/2` (Democracy in America, Essays-Montaigne shard drift),
  and other shard/whole-file consistency findings — a different defect
  class (serving infrastructure, not content) outside this assignment.
- The audit's own recommendation for "a separate modern-en integrity
  sweep" across the whole library (`NEEDS-INVESTIGATION.md`, section on
  modern-en fidelity) — explicitly named as future work beyond any single
  completeness audit, and beyond this assignment's 9 named books.
- Jerusalem `NEW-2` (static SEO pages publishing the spurious "Unity,
  Unity." chapter) — an `app/public/read/jerusalem/` static-file issue,
  not a content-edition defect; Codex's domain, not touched here.

---

## Part 4 — Confessions whole-edition coverage (see also `books/wip/confessions-modern-da-repair/WHOLE-EDITION-COVERAGE-CONFIRMATION.md`)

Books 1-9 (256 paragraphs) + Books 10-13 (206 paragraphs) = 462/462,
100%, no gap, no overlap — confirmed programmatically. Books 1-9 were
never flagged as defective by the original audit; this assignment
checked them anyway, for the first time, at Anders's explicit request,
and found them complete and faithful (two trivial stylistic notes, not
defects).

---

## Part 5 — As You Like It provenance, preserved exactly

**No legal clearance is claimed. No withdrawal is required by this
assignment.** The exact evidence, preserved verbatim from the audit and
this session's own packages:

- The served text is the 1990-93 World Library etext (`1ws2510.txt`).
  Its own embedded notice reads, in part: "NEITHER SHAREWARE NOR PUBLIC
  DOMAIN," and restricts commercial redistribution — of **that specific
  transcription and its distribution terms**, not of Shakespeare's
  underlying public-domain text.
- This assignment's repair removed the notice from *reading text* (it
  was being served to readers as if it were play content) and fixed the
  chapter structure — it did not decide, and does not claim to have
  decided, whether continuing to serve this transcription's specific
  wording is sound for a paid product.
- The audit's own suggested alternative — a full re-base onto PG #1523 or
  PG #100 — was checked this session and found PG #1523 has only ~90%
  token overlap with the currently served text, meaning a re-base would
  replace most of the book's prose, not just address the notice. That is
  a substantially larger undertaking than this bounded repair, and a
  distinct decision from removing the notice.
- **This remains an open legal/business call for Anders/Codex.** A
  website's copyright notice is evidence to weigh, not proof of
  restriction on Shakespeare's text, and not by itself grounds to require
  withdrawing or re-basing the edition. Equally, this assignment does not
  claim the notice's removal clears any legal question — it only stops
  serving apparatus text as if it were the play.

---

## Part 6 — What Codex owns from here

Unchanged from every individual package's own release notes, restated
here as the single list:

1. **Package verification** — re-derive/spot-check this handoff's claims
   independently before integration, per Codex's own process; nothing
   here should be taken purely on this session's word.
2. **Faust edition identity** — the registry label, translator
   attribution, and any user-facing "which translation is this" copy for
   both `original-en`/`modern-en` (English) and `modern-da` (Danish),
   given the full source-text replacement.
3. **Reader-data / coordinate compatibility** — Faust has no
   coordinate-preserving migration path (source text changed, not just
   structure); every other touched book has a paragraph map or explicit
   coordinate table in its own package for character-card/threads
   re-anchoring, which Codex still needs to apply.
4. **Audio cleanup** — exactly which cached narration is now stale (text
   changed under the same or shifted coordinates) is Codex's call per
   book; this assignment did not generate, request, or invalidate any
   audio itself.
5. **Serialized deployment** — integration order, registry updates, and
   the actual publish step for all 18 packages above.
6. **Production verification** — after Codex integrates, confirming the
   live app actually serves the intended text is Codex's/Anders' own
   verification, not something this content-only assignment can attest to.
7. **The specific open decisions** flagged per-book above: As You Like
   It's rights/provenance question (Part 5); Faust's edition-identity and
   coordinate handling (Part 2, Part 6 item 2-3); and the newly-surfaced
   unresolved findings in Part 3, which remain confirmed-but-unfixed and
   are Anders'/Codex's to prioritize, not silently patched by this
   session.

---

## Final completion claim

**All 16 originally-held editions are editorially accepted as content
candidates**, each independently reviewed to the standard documented
per-package above, plus 2 additional packages (Jerusalem `original-en`,
Faust `original-de`) accepted on the same basis.

**This is not a claim that all defects are fixed live**, that
publication is safe without Codex's own verification, or that every
finding in the broader library audit — or even every confirmed finding
for these 9 books — has been resolved. Part 3 above lists the specific
confirmed findings this assignment did not fix, discovered or
reconfirmed during this final reconciliation, so that gap is explicit
rather than implied by the packages' silence.
