# Symposium: Modern English accessibility pass (content package)

**Status: CONTENT ACCEPTED, handed off. NOT PUBLISHED.** The live editions, registry, character card, threads, onboarding, audio and app code are untouched. The coding owner integrates and publishes (see `RELEASE-PACKET.md`).

**Date:** 2026-09-25 · **Main checked:** `447a7a65` · **Branch:** `claude/kind-fermi-a2b3g0` · **Predecessor:** the accepted completeness repair (`../symposium-completeness-repair/`, commit `bebe95b4`) · **Source:** the corrected original-en (Jowett), `3521a12d…95a6`.

## What this pass does

The completeness repair restored the missing opening and fixed the chapter boundaries, but its modern-en still read largely as Jowett's Victorian English: the similarity gate failed at 0.866, with chapters 2 and 4–7 near-verbatim.

This pass makes modern-en understandable to a first-time reader or listener:

- archaic words and syntax;
- false friends, such as *want* meaning *lack*, *fair* meaning *beautiful*, and *God* for *a god*;
- unclear speakers and pronouns;
- Victorian euphemism;
- broken quotation marks.

It keeps every argument, example, qualification and image, the speakers' distinct positions, and the historically specific content. It changes **163 of 226 paragraphs** and retains 63, including short answers that are identical to Jowett and are clear as they stand.

**Structure is unchanged:** 226 paragraphs, the same chapters and titles, the restored opening byte-identical, and the C-06 corrections verbatim. **original-en is not changed.**

## Result

| | Before (completeness modern-en) | After (this candidate) |
|---|---|---|
| sha256 | `1e970b7b…374f` | `a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d` |
| Similarity gate (`books/classify-modern-en.py --gate`) | FAIL: weighted 0.866; 6/8 chapters LIGHT | **PASS**: weighted 0.523; LIGHT+MECHANICAL 0/8 |
| Truncation audit (`books/audit-truncation.py`) | 0 flags | 0 flags |
| Archaic tokens / British spellings (whole book) | 48 / 13 | 0 / 0 |

## Reviews

| Review | Scope | Verdict | After resolution |
|---|---|---|---|
| Reviews 1A–1D: source fidelity (four independent reviewers, source access) | Every paragraph changed in v1 (151), sentence by sentence against Jowett | ACCEPT WITH CHANGES (8 blocking, 48 should-fix, 51 optional) | Every blocking and should-fix item adopted; optional items adopted or declined with reasons |
| Review 2: blind reader (no source access) | The whole v1 text, read cold as a first-time reader; each speech explained | ACCEPT WITH CHANGES (15 should-fix, 53 optional) | 14 should-fix items adopted or already fixed; #1 (a speaker label at 1.0) declined, since Jowett has none and the restored opening is protected |
| Recheck 1 (independent, source access) | Every chapter 1–6 paragraph changed after the reviews (51) | ACCEPT WITH CHANGES (2 should-fix, 14 optional) | All adopted in v4 |
| Recheck 2 (independent, source access) | Every chapter 7–8 paragraph changed after the reviews (43) | ACCEPT (16 optional) | All adopted in v4 |
| Consistency pass (independent) | Whole book: terminology, speaker attribution, quotation convention, house style | CONSISTENT WITH CHANGES (6 should-fix, 14 optional) | All should-fix items adopted; 10 optional adopted in full or in part, 4 declined with reasons |
| Recheck 3 (independent, source access) | Every paragraph changed after v3 (37) and the declined findings | ACCEPT (9 optional) | All adopted in v5 |
| Recheck 4 (independent, source access) | Every paragraph changed after v4 (7) | ACCEPT (1 optional) | Recorded in STYLE §1a and SOURCE-NOTES §3 as the reviewer suggested; no text change |

## Contents

| Path | What |
|---|---|
| `RELEASE-PACKET.md` | How this successor relates to the completeness repair, what to integrate, the one-release dependency, checks, caches and decisions |
| `ACCEPTANCE.md` | Acceptance record: criteria, evidence, final verification output and review verdicts |
| `ASSESSMENT.md` | The assessment made before rendering (baseline profile, findings by category, decisions) and the final outcome |
| `STYLE.md` | The style guide and glossary the rendering and reviews applied, including the source policy (§1a) |
| `SOURCE-NOTES.md` | Structural and source defects reported separately (none new), and the source variants (Jowett against the Greek) |
| `CHANGES.md`, `CHANGES.json` | The changed-paragraph ledger: each change with Jowett, before and after text, hashes, categories and reason |
| `candidate/symposium-modern-en.json` | The final candidate, serialized like live |
| `assessment/paragraph-assessment.tsv` | All 226 paragraphs: decision, categories, reason, similarity before and after, hashes |
| `hashes/paragraph-hashes-modern-en.tsv` | Per-paragraph sha256, before and after |
| `impact/` | `IMPACT.md` (cards, reader data, narration and caches, other surfaces), `character-card-impact.json` (exact UTF-16 offsets), `narration-stale-modern-en.tsv` |
| `migration/` | `MIGRATION.md` and the composed live → final data: paragraph map and opcodes; completeness → final opcodes for the separate-release case |
| `reviews/` | The independent reviews, rechecks and consistency pass, and `RESOLUTION.md` |
| `HASHES.sha256` | sha256 of every file in this package |

The build and verification scripts stay outside this folder, because content folders hold no code. Every generated record can be re-derived from the pinned inputs and the candidate.
