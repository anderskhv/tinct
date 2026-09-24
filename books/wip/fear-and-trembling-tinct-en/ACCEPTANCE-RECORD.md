# Acceptance Record: Fear and Trembling (Kierkegaard), Tinct Modern English

- **Book id:** `fear-and-trembling`
- **Edition:** `modern-en`, proposed label "Tinct Modern English — translated from Danish"
- **Date:** 2026-09-24
- **Branch:** `claude/hopeful-tesla-7s5ziw`
- **Scope approved by Anders:** a complete new translation made directly from Kierkegaard's public-domain Danish. For this book a public-domain human English translation is not required, and the Danish remains the original.
- **Source (fidelity anchor):** the corrected, scan-verified Danish of the 3rd edition (Reitzel/Grøn 1895), in `source/original-da-final.json`. It is staged for serving as `candidate/fear-and-trembling-original-da.candidate.json`. See `PROVENANCE.md`.
- **Structure:** 8 chapters and 184 paragraphs, following the printed paragraphing (4/15/14/35/29/22/61/4). This replaces the served 232-slot OCR structure; the explicit map is in `STRUCTURE-MAP.md`/`.json`. `modern-en` and `original-da` are aligned one to one.
- **Final hashes:** `HASHES.txt`, `RELEASE-PACKET.md`.

## 1. Source verification

| Step | Scope | Result |
|---|---|---|
| Reconstruction and collation | Every served slot against the raw OCR (`source/check_corrected_source.py`) | PASS, with 0 unexplained differences. Every correction is recorded in its slot and in `source/CORRECTIONS.md` |
| Independent scan verification | All 152 page images: every restored passage, footnote boundary and uncertain OCR reading (`source/SCAN-VERIFICATION.md`) | 10 further fixes (F1–F10) applied and re-collated. Uncertain readings are resolved or marked |
| Authorial and editorial separation | Whole book | 18 authorial footnotes are kept separate. Front matter (`front-matter.json`) is separated. Running heads, page numbers and signature marks are excluded. Misprints are emended as `emend:` entries |
| Printed paragraphing | 217 boundaries checked on the scans (`source/PRINTED-PARAGRAPHS.md`) | 184 printed paragraphs. The map covers 132 identical, 82 joined, 9 split and 9 removed (footnote-only) slots |

## 2. Translation review coverage (no sampling)

| Round | Scope | Reviewer | Result / evidence |
|---|---|---|---|
| Pilot (P-I, P-II), earlier task | ch5–6 | Independent fidelity and accessibility reviews | Accepted. See `../fear-and-trembling-clarity-pilot/` |
| Pilot re-review against the corrected source | Every join point, changed reading and footnote in ch5–6 | Fresh verifier | Defects fixed: P-I 24, P-II 15, P-I 20, the German colon, and the n5.31a page reference (p. 223). See `R1-pilot-rereview*.md` |
| R1 fidelity | All paragraphs and notes in parts A–J | A fresh, independent reviewer per part, Danish against English | Every finding was applied or answered (`R1-fidelity-*`, `R1-applied-*`) |
| R1 re-verification | Every R1 change | Fresh verifiers | Residual items applied (`R1-reverify-*`, `R1-reverify-applied-*`) |
| Readability | Whole book, English only | Newcomer readers, one each for ch1/2/8, ch3, ch4 and ch7. The pilot was reviewed in its own task | SEVERE items were fixed in ch4 and ch7. MODERATE and LIGHT wording items were fixed where the Danish allows. Idea-level difficulties are kept on purpose (`R1-readability-*`, `R2-applied-*`) |
| R2 re-verification | Every readability edit | Fresh verifiers (`R2-reverify-ch04.md`, `R2-reverify.md`) | Found that the R2 edits to C, D, G and H had reverted approved R1 fixes (stale copies). A mechanical reversion check covered all parts, and every reversion was restored (`R2-reverify-applied-ch4-and-restorations.md`). The 12 remaining defects were fixed |
| R3 whole-book consistency | All 184 paragraphs and 18 notes, across parts | Independent reviewer against the Danish | 18 findings and 34 edits covering terminology, repeated passages, glosses, voice, spelling and verse format, plus typographic quotes in the pilot. All applied (`R3-consistency.md`, `R3-applied.md`) |
| R3 re-verification | Every R3 change (the edits table was replayed mechanically on the pre-R3 copies, which matched exactly) | Fresh verifier | No translation defects. The book is ready for handoff once the release files are regenerated, which is done (`R3-reverify.md`) |

## 3. Automated checks on the final candidate

- `assemble.py`: PASS. It checks:
  - 184 paragraphs, matching the Danish per chapter;
  - no empty paragraph;
  - all 18 notes present exactly once;
  - every `anchorAfterEn` found;
  - no marker or note text in the main text.
- JSON validity: all candidate, draft and sidecar files.
- Quotes: double quotes balance in every paragraph. The only straight apostrophes left are the German elisions printed in the Shakespeare quotations.
- Character-card mapping (`character-card-impact.json`): 10 of 10 mentions map in `modern-en`; 7 verbatim and 3 with a stated variant string.
- Similarity diagnostic against the served English (`SIMILARITY.md`): 0.59 against original-en and 0.66 against modern-en. There are no byte-identical units, and every unit at 0.85 or above is short and literal.
- Independence screen against Lowrie and Hong (a diagnostic, not legal clearance; calibration Lowrie against Hong is 3.8% at 12 words and 1.4% at 16 words). Runs of 16+ words are 0–1.5% in most parts. The higher figures come from forced runs:
  - the verbatim Latin (A-ch1);
  - the Genesis 22:2 quotation, the Kyrie and the Attunement refrain (A-ch2);
  - the German Shakespeare with Shakespeare's own English (I, ch7 ¶29);
  - one literal sentence in n7.34a (H).

  No wording was distorted to meet a number.

## 4. Conventions and rulings

These are set in `STYLE-AND-TERMINOLOGY.md` §C, which extends the pilot's `TERMINOLOGY.md`. Key rulings:

- *Virkelighed* is "actuality" and *Realitet* is "reality".
- *den Enkelte* is "the single individual"; *en Enkelt* is "an individual".
- *fatte*/*opfatte* is "comprehend"/"understand"; *gribe* is "grasp".
- *tør* is "dare".
- *Qval* is "torment"; *pine* is "wring" or "torture"; *martre* is "torture".
- *Spidse* is "extreme point".
- Glosses appear at first use only: spiritual trial (ch4 ¶7), incommensurable (ch4 ¶10), mediation (n4.22a), and the aesthetic, defined at ch4 ¶22.
- The demonic, the absurd and paradox are left unglossed.
- Johannes's lower-case "de silentio" is kept.
- US spelling, typographic quotes, spaced em dashes, and no contractions in the narration.

## 5. Deliberately kept difficulties

The readability reviewers flagged a number of idea-level difficulties that remain: the double movement; "give up" against "renounce"; the direct and inverse sense of incommensurability; the ram counterfactual in the Eulogy; the "strange dialectic" of pity; and the demonic paradox. They are Kierkegaard's own difficulties, and resolving them would add explanation that the Danish does not contain. Each drafter's `R2-applied-*` file lists these as KEPT, with reasons.

## 6. Not done here (by instruction)

This package makes no application code, live edition, registry, character-card, onboarding, threads or audio changes, and no deployment. Codex owns integration and publication (`EDITION-PLAN.md`, `RELEASE-PACKET.md`).
