# Symposium: completeness repair (content package)

**Status: CONTENT ACCEPTED, handed off. NOT PUBLISHED.** The live editions, registry, character card, threads, onboarding, audio and app code are untouched. The coding agent integrates and publishes (see `RELEASE-PACKET.md`).

**Date:** 2026-09-25 · **Baseline:** `main` `38a97c63` · **Branch:** `claude/kind-fermi-a2b3g0` · **Source:** Project Gutenberg #1600, Plato, *Symposium*, trans. Benjamin Jowett.

## Findings

| Area | Finding | Resolution |
|---|---|---|
| Completeness, original-en | The served text lacked the dialogue's first 9 paragraphs (648 words): Apollodorus meeting Glaucon, the dating of the banquet, and Aristodemus named as the source. A whole-book comparison against the complete Jowett text found no other omission, duplication, reordering, join or altered word. | Restored verbatim (C-01) |
| Completeness, modern-en | Missing the same 9 paragraphs. The whole-book review also found a dropped qualification (3.7, "which custom allows"), a dropped hedge and quotation (3.8) and a garbled clause (3.3). Otherwise complete: only Jowett's 20 bracketed notes are omitted, by convention | New Modern English rendering (C-02); three sentences corrected (C-06); independently reviewed and re-verified |
| Chapter boundaries | Chapter 7 "Socrates & Diotima" ran into Alcibiades's arrival and speech, and chapter 8 "Alcibiades" held only the closing paragraph | Regrouped at "When Socrates had done speaking…" (C-03). Text unchanged |
| Labels | original-en chapter 5 was titled "Agathon & Aristophanes", unlike modern-en and modern-da | Harmonised to "Aristophanes's Speech" (C-04, separable) |
| Danish (`modern-da`) | Same missing opening and chapter-7/8 problem. Chapter 3 is internally misaligned (7 paragraphs), and 33 paragraphs are condensed | Reported only; decision needed |
| Modern-en quality gate | The mandatory similarity gate fails before and after (0.877 → 0.866). Chapters 2 and 4–7 are near-verbatim Jowett, a result of commit `67aa9c16` | Not rewritten (per assignment); waiver or separate re-rendering needed (decision) |

## Candidate hashes

| File | sha256 | Paragraphs |
|---|---|---|
| `candidate/symposium-original-en.json` | `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6` | 226 (49, 8, 12, 10, 18, 13, 69, 47) |
| `candidate/symposium-modern-en.json` | `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f` | 226 (same) |

## Reviews

| Review | Scope | Verdict on v1 | After resolution |
|---|---|---|---|
| Review 1: completeness and fidelity (independent, source access) | Whole book: source provenance; original-en against the complete Jowett text; all 226 modern-en pairs screened, with chapters 1, 3 and 8 read in full; the 9 restored modern paragraphs; chapter regroup; mapping, hashes and character-card re-resolution | C1–C6, C8 and C9 confirmed. C7 partly held (3.7 dropped "which custom allows"). F1 is the pre-existing similarity-gate failure | F2 and F8 (3.3, 3.8) fixed by C-06. F3, F6, F7, F9 and F11 fixed. F1 and F4 escalated as decisions. All in `reviews/RESOLUTION.md` |
| Review 2: blind reader (no source access) | The new Modern English opening in context, and the chapter 7→8 transition | ACCEPT WITH CHANGES (3 should-fix, 10 optional) | All 3 should-fix items adopted; 9 of 10 optional items adopted in full or in part, each checked against Jowett; declined items reasoned in `reviews/RESOLUTION.md` |
| Re-verification (independent, source access) | Every change made after the reviews | On v2: R1–R4, R6 and R7 CONFIRMED; R5 PARTLY (F1: stale paragraph-hash recompute list, fixed). Delta on v3: D1–D3 CONFIRMED; D4 PARTLY (two record wording notes, fixed); D5 notes only. Nothing blocking | `reviews/REVERIFY.md` (v1→v2) and `reviews/REVERIFY-DELTA.md` (v2→v3); every finding resolved in `reviews/RESOLUTION.md` |

## Contents

| Path | What |
|---|---|
| `RELEASE-PACKET.md` | Integration instructions, hard dependencies and decisions for the coding agent and Anders |
| `ACCEPTANCE.md` | Final acceptance record: checks run, review verdicts, re-verification and remaining issues |
| `CHANGES.md`, `CHANGES.json` | Changed-passage ledger: every change with its before/after text, hashes and reason |
| `candidate/` | Corrected `symposium-original-en.json` and `symposium-modern-en.json` (serialized like live) |
| `source/` | Byte-exact PG #1600 HTML and TXT, plus `SOURCE.md` (provenance, what counts as the dialogue, notes, upstream typos) |
| `coverage/` | `COVERAGE.md` (whole-book method and results), `passage-coverage.tsv` (all 180 source paragraphs → baseline and candidate coordinates), `split-inventory.tsv` |
| `mapping/` | `paragraph-map.tsv` (all 217 old → new), `inserted-paragraphs.tsv`, `changed-paragraph-ops.json` (UTF-16 and word opcodes for the three C-06 paragraphs), `MAPPING.md` (where offsets are preserved and what needs special migration) |
| `hashes/` | `build-summary.json` (baseline, source and candidate hashes, plus the C-04 variant) and per-paragraph hash tables for both candidates |
| `impact/` | `IMPACT.md` (user data, cards, threads, onboarding, SEO, narration and caches), `character-card-impact.json`, `proposed-threads-corrections.json`, `modern-da-report.md`, `da-audit/` (the full Danish paragraph audit) |
| `reviews/` | `REVIEW-1-completeness-fidelity.md`, `REVIEW-2-blind-reader.md`, `REVERIFY.md`, `REVERIFY-DELTA.md`, `RESOLUTION.md` |
| `HASHES.sha256` | sha256 of every file in this package |

The build and verification scripts are kept outside this folder, as the book-task workflow requires, because content folders hold no code. The `hashes/` and `coverage/` records they produced can each be re-derived from the pinned inputs as described in `coverage/COVERAGE.md` and `mapping/MAPPING.md`.
