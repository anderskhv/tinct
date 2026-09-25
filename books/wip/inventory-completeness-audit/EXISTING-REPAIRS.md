# Existing repairs, accepted successors and prior records

**Purpose.** This register keeps the audit from reporting as new a defect that another package already repairs or has recorded, and from duplicating work already under way. It also names the packages that would **inherit** a defect because they were verified against the incomplete served text, and the packages whose paragraph coordinates a structural repair would move.

**How it was compiled (2026-09-25, about 12:00 UTC).**

- Every `books/wip/*` and `books/staged-replacements/*` path at the tip of each of the 381 remote branches and of `main` was listed: 119 distinct paths.
- Each relevant package's README, acceptance record, release packet and parked notes were read with `git show`.
- The open pull requests were checked. They are #193, #163 (Odyssey hold), #160 (Jane Eyre hold), #159 (Pride hold), #131 (BSB staging, draft), and older lab and audio PRs.
- Every group auditor also searched its own books' packages. Their references are carried into each finding in `reports/*.findings.json` (`existing_repair`).

Commits are branch tips unless a finding names a specific commit. "Released" means merged to `main`. "Deployed" means `https://tinct.app` serves the same bytes; that was checked on 2026-09-25 for all 305 editions.

## A. Packages that already repair (all or part of) a defect in this audit — do not duplicate

| Book | Package (branch @ tip · path) | Status | What it covers | What remains open (this audit) |
|---|---|---|---|---|
| **Symposium** | `claude/kind-fermi-a2b3g0` @ `bebe95b42a` · `books/wip/symposium-completeness-repair/` | **Content accepted, not published** (2026-09-25) | Restores the missing frame opening (648 words, 1.0–1.8) in original-en (C-01) and modern-en (C-02). Regroups the ch7/ch8 boundary at "When Socrates had done speaking" (C-03). Harmonises the ch5 title (C-04). Corrects three modern-en sentences (C-06). | The live files are byte-identical to the package baseline (`e2943777…`, `7816d1eb…`, `2a98c528…`), and G03 re-aligned the candidate at 100% against PG #1600. Open owner decisions: modern-da (same omission; reported only) and the similarity-gate waiver. **No new work needed from this audit.** |
| **Moby-Dick** | `claude/charming-shannon-mojaef` @ `52c7200491` · `books/wip/moby-dick-structural/` | Accepted, **not released** | Etymology and Extracts restored as front matter (original-en and modern-en); split titles in chapters 56, 57 and 73 reassembled; paragraph mapping and character impact included. | The Hawthorne dedication is not covered. It is confirmed missing (G06-moby-dick-02, S3): the 1851 first printing carries it, PG #2701 does not. The package's front-matter schema (option A) needs a Codex decision (HANDOFF §1). |
| Moby-Dick modern-en | same branch · `books/wip/green-moby-dick/` (candidate `1a3f31bb…`) | Accepted, **not released** | Rewrites all 52 compressed modern-en paragraphs, including the 22 whole-sentence drops that screening flagged. | Nothing beyond publication. |
| **Fear and Trembling** | `claude/hopeful-tesla-7s5ziw` @ `f5aa101bc8` · `books/wip/fear-and-trembling-tinct-en/` | **Accepted successor**, ready for Codex, not published | Corrected, scan-verified Danish original-da. A new modern-en translated from the Danish. Restores the two weaning passages (final 2.7 and 2.10), *fatte* (6.6), *i* (7.18) and the Attunement numerals. Carries all 18 footnotes as separate records, plus front matter. Retires the AI-translated `original-en` mislabelled "Original (English)". The 232→184 structure map comes with a position-migration rule. | G08 confirmed that the served hashes equal the package's "replaces live" values. The **currently served** text still has every listed defect until publication. The modern-da retirement is escalated to Anders in the package. The same branch also carries `fear-and-trembling-clarity-pilot/`. An older `staged-replacements/fear-and-trembling` (`claude/fear-and-trembling-modern-en-20260911`, 2026-09-11) predates the corrected source and should be treated as superseded. |
| **Odyssey** 3.37 splice | `claude/admiring-brahmagupta-rb9sws` @ `7994156f13` · `books/wip/featured-source-cleanup/odyssey/` | Verified, **not released**; PR #163 on hold | Truncates the served original-en 3.37 to Butler's clause, removing the invented Nestor speech and the modern paraphrase. | The modern-en fix is in `claude/odyssey-modern-en-completion` @ `0a76d6ce72` (`books/staged-replacements/odyssey/`), not released. modern-da carries the same splice and has no fix. |
| Jane Eyre, Pride and Prejudice structure | `featured-source-cleanup` and `books/wip/structure-migration-20260924/` | **Released on main (#192), not yet deployed** | Jane Eyre: 13 illustration captions removed. Pride and Prejudice: 7 illustration splits rejoined. Positions migrated. | G05 found no body text missing in either book. PRs #159 and #160 ("hold … for accepted structural successor") look superseded by #192; Codex should confirm and close them. |
| **Crito** modern-en 2.9 | `claude/friendly-albattani-qgyqfi` @ `0252b80dbc` · `books/wip/green-crito/` (candidate `511340f4…`) | Accepted, **not released** | Fixes modern-en 2.9, which repeated 2.11 in place of Socrates's premise. | modern-da has the same duplication and no fix. |
| **The Manual** modern-en §42 | `codex/manual-complete-repair-2026-09-17` @ `01ddd9b2cd` · `books/wip/manual-repair-2026-09-17/`; also `green-manual` on `friendly-albattani` | Accepted, **not released** | Restores the dropped "true conjunction" sentence in §42. | modern-da is not covered. |
| **Vindication** modern-en chapters 7–9 | `claude/sleepy-hamilton-0f1kqi` @ `1748c0aa64` · `books/wip/vindication-modern-en/` (candidate `6a398f5b…`) | Accepted, **not released** | Re-renders 752 of 778 modern-en paragraphs, including chapters 7–9, which are currently the unmodernised original. | modern-da serves English in most chapters and is not covered. |
| **Second Treatise** chapter ends | `claude/gracious-fermat-bjef6w` @ `971cb3ae67` · `books/wip/second-treatise-modern-en/` (HANDOFF item 6) | Candidate package | Its modern-en candidate completes the chapter-final words that the served original-en loses (last four characters of chapters 1–18). | **original-en is not fixed by it.** |
| **War and Peace** modern-en | `friendly-albattani` · `books/wip/war-and-peace-repair/` | Tail batches A–C accepted; **not released** | Restores modern-en omissions, including 150.12 and the drift around 350; fixes the drift at 358. | Chapter-title mislabelling at Book boundaries: the repair notes only ch337 and ch353 (G06 found 16 Books affected). |
| **Wealth of Nations** modern-en 11.207 | `friendly-albattani` · `books/wip/wealth-of-nations-repair/` (`wn-batchC-corrected.json`) | Not released | Completes the truncated paragraph. | The missing Introduction and Plan of the Work, the Book structure and the stale chapter shards are not addressed by any package. |
| **Othello** bracketed speeches | `claude/cool-galileo-tyen9m` @ `15d3d67e53` · `books/wip/othello-modern-en/HANDOFF.md`, open issue 1 | modern-en package; the structural fix is **deferred** | Documents the 43 speech continuations served inside `[…]` with no speaker. | The fix is still needed in every edition. Dropped asides (G01-othello-02) are not recorded there. |

## B. Prior records that documented a defect without repairing it

| Book | Record | What it recorded | This audit |
|---|---|---|---|
| Henry V | `friendly-albattani` · `books/wip/green-henry-v/PARKED.md` | The opening Prologue is missing from the source parse; the pipeline was parked. | Same gap. PARKED.md treats the Chorus placement as "convention", which this audit reports as MISPLACED. |
| Macbeth | `friendly-albattani` · `books/wip/green-macbeth/PARKED.md` | Two soliloquies missing (raven, dagger). | The real extent is 34 speech blocks, about 1,300 words (G01). PARKED.md also misattributes "Great Glamis!" to Macbeth. |
| Macbeth | `claude/macbeth-modern-en-20260911` @ `5608dfa812` · `books/staged-replacements/macbeth/PROVENANCE.md` §3 | "Who comes here?" is unattributed. | That line is one of the 34 dropped continuations. The staged replacement covers chapters 1–2 only and inherits every gap. |
| Apology | `friendly-albattani` · `books/wip/green-apology/fidelity-review-1.md` B1 | Verdict DO NOT ACCEPT: modern-en ch2 omits source ¶4 (the exile argument) and renders ¶5 twice. | Still live in modern-en and modern-da. No repair candidate exists. |
| Leviathan | `friendly-albattani` · `books/wip/leviathan-pilot-ch10/fidelity-review-1.md` N5 | The Chapter IX Table of the Sciences is truncated, marked out of scope. | Still live; the pilot follows the truncated source. |
| Jerusalem, The Jungle Book, Vindication and others | `docs/edition-divergence-audit-2026-09-12.md` (main) | High verbatim rates for modern-en (a quality signal). | Confirmed and sharpened (whole chapters byte-identical); see CONFIRMED-DEFECTS. |
| Bible (KJV) | `qa/reports/structural-report.json` (main, historical) | ch1062 `²⁶ ²⁷` flagged as a short paragraph. | See G11-bible-08 (empty verse numbers). |
| Meditations | `claude/wonderful-archimedes-nhig2x` @ `eb85681725` · `green-meditations/ACCEPTANCE-RECORD.md` | "Stale repository record": `books/raw/meditations` is Casaubon, while the served text is Long. | Same; not fixed on main (S4). |
| Genealogy of Morals | `books/raw/genealogy-of-morals/SOURCE.md` (main) | Claims First Essay §11 is missing. | **Incorrect**: G08 found §11 served at 2.16. The record needs correcting. |
| Henry IV Part 2 | `books/characters/henry-iv-part-2/README.md` (main) | Claims all nineteen scenes are present "including the Induction". | **Incorrect**: the Induction is absent. The Rumour card binds only to Warwick's line at 8.17. |

## C. Packages that accepted or entrench a completeness defect — the Symposium failure mode

These candidates were reviewed against the served, incomplete `original-en` (their `source.json`). If released as they stand, they carry the defect forward. None of them is wrong about modern-English quality. The problem is only that their completeness checks were circular.

| Package (all on `friendly-albattani` unless noted) | What it accepted | Consequence |
|---|---|---|
| `green-taming-of-the-shrew` (ACCEPTANCE-RECORD lines 51–54, 171–172) | The absent Induction and Christopher Sly frame as "a genuine property of the locked source". | The accepted modern-en has no Induction either. The onboarding copy promotes a frame the reader never gets. |
| `green-medea` (fidelity-review-1 lines 105–111) | Misplaced stage directions, cleared because they "exist in source.json itself". | The candidate inherits all 32 misplacements. |
| `green-oresteia` (ACCEPTANCE-RECORD lines 49 and 167–172) | "All 26 are real reading units"; bracketed cries treated as a source property. | Entrenches the mislabels and the bracket artefacts. |
| `green-gilgamesh` (fidelity-review-1 lines 87–89) | "Restored" *Niir* as the source spelling. | Entrenches an import error (Niṣir). |
| `green-oedipus-rex`, `green-antigone`, `green-oedipus-at-colonus` | Unit titles copied from the source parse. `green-oedipus-rex` calls Storr's translation "Jebb-lineage". | Inherits the mislabelled odes and episodes. |
| `green-the-prince` (`claude/lucid-turing-vhssi3`; released to main 2026-09-23) | Marriott's translator footnotes kept as "footnote-style paragraphs". | 48 notes are served as body text in every edition. |
| `green-romeo-and-juliet`, `green-the-tempest` | Attributions "correct" when checked only against the served source; the songs' presence checked, not their singer. | Inherits Ariel's misattributed songs (Tempest) and 8 bracket-wrapped lines (Romeo and Juliet). |
| `green-frankenstein`, `green-jekyll-and-hyde` (released) | Completeness checked only against the imported PG raw. | The Frankenstein front matter and the Jekyll dedication remain absent (scope decision). |
| `green-nicomachean-ethics` | Keeps the translator's Posterior Analytics appendix as the end of Book 6. | Inherits it. |
| `wealth-of-nations-repair`, `montaigne-repair`, `don-quixote-repair`, `confessions-repair` | Served original-en used as locked ground truth. | They do not record the missing Introduction (Smith), "To the Reader" (Montaigne), the Part I Prologue and verses (Cervantes), or the modern-da placeholders (Confessions). |
| `green-merry-wives-of-windsor` (hard-parked), `green-cymbeline` | Apparatus scans that missed Cambridge line numbers and the split titles. | Inherits them. |

## D. Packages whose paragraph coordinates a structural repair would move

Any repair that inserts, removes or regroups paragraphs changes `(chapter, paragraph)` coordinates. In that case these packages must be rebased on the repaired structure, or published first and then migrated, following the mapping the repair supplies.

- **Macbeth:** `green-macbeth` (parked candidate) and `staged-replacements/macbeth`.
- **Henry V:** `green-henry-v` (parked).
- **Taming of the Shrew:** `green-taming-of-the-shrew` (accepted).
- **As You Like It** and **Henry IV Part 2:** none.
- **Don Quixote:** `don-quixote-repair`.
- **Federalist, Montaigne, Social Contract, Herodotus, Faust, The Awakening, Paradise Lost, Imitation of Christ, Jerusalem:** no text package. Montaigne has `montaigne-repair`.
- **Wealth of Nations:** `wealth-of-nations-repair`, and `codex/emergency-checkpoint-2026-08-29` · `books/wip/wealth-of-nations`.
- **Leviathan:** `leviathan-repair` and the `leviathan-pilot-*` folders.
- **Othello:** `othello-modern-en`.
- **Crito, Apology, Medea, Oresteia, Gilgamesh:** their green packages above.
- **Every live book** also has a released character package (`app/public/data/characters/<id>.v1.json`, 101 entries in `characterReleases`). Each is pinned to edition bytes and paragraph hashes.
- Threads (76 files), SEO chapter pages (`app/public/read/<id>/`) and legacy audio keys also key on chapter numbers or paragraph indices.

## E. Other active or recent packages on audited books (no completeness bearing found)

| Package | Branch @ tip | Status |
|---|---|---|
| `books/staged-replacements/hamlet` | `claude/hamlet-modern-en-20260911` @ `121d8c7189` | modern-en ch1 only. It confirms PG #1524; Hamlet is COMPLETE-VS-SOURCE. |
| `books/staged-replacements/meditations`, `green-meditations` | `claude/meditations-modern-en-20260911-v2`, `claude/wonderful-archimedes-nhig2x` | The Meditations modern-en release is on main and deployed. |
| `green-crime-and-punishment`, `crime-character-identity-review`, `crime-svidrigailov-snapshot-correction` | `claude/awesome-euler-pjc7jv`, `claude/intelligent-babbage-c97wdv` @ `9efd60d7c1` | Released or accepted; character content. |
| `green-jane-eyre`, `jane-eyre-targeted-clarity-review`, `jane-eyre-repair` | `claude/laughing-hypatia-svxsjf`, `claude/admiring-ritchie-0esb31` @ `88ebdd4c97`, `friendly-albattani` | modern-en quality. |
| `green-pride-and-prejudice` | `claude/upbeat-dirac-jw9ghg` @ `e004aad949` | modern-en quality. |
| `confessions-modern-en` | `claude/peaceful-thompson-akn7f0` @ `f998a3906c` | The modern-en rewrite was released in #192. Follow-up branch. |
| `review-codex-content-followup` | `claude/admiring-mayer-vff40y` @ `c6f3f0ed5f` | Accepted for a narrow release. |
| Bible: `staged-replacements/bible-bsb` (PR #131, draft); `bible-web-catholic`, `web-revelation-22-cleanup` | `codex/bsb-staging-20260921` @ `2209b11443`; `claude/magical-wozniak-dim3fg` @ `30e7f8233f` | The BSB import is live. The WEB Revelation 22 cleanup is released (#166). |
| `green-comedy-of-errors`, `green-merchant-of-venice`, `green-winters-tale`, `green-twelfth-night`, `green-coriolanus`, `green-richard-iii`, `green-descartes-meditations`, `green-werther`, `green-ivan-ilyich`, `green-frederick-douglass`, `green-bacchae`, `green-cymbeline`, `green-julius-caesar`, `green-candide` | `friendly-albattani`, `lucid-turing` | modern-en quality packages. Candide, The Prince and Julius Caesar are released to main but not yet deployed. |
| New books, not live: `to-the-lighthouse`, `treasure-island` (+ `-da`) | `claude/beautiful-allen-5llaf8`; main | Out of scope: not served. |

**No other completeness audit was found** on any branch or open PR. The closest prior work is the Symposium package's whole-book coverage (`coverage/COVERAGE.md`), which this audit generalised to the whole inventory.
