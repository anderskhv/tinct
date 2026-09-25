# Symposium: accessibility successor (Modern English)

**Status:** reviewed **candidate**, **not accepted** and **not published**. It is a proposal pending two decisions by Anders:

1. whether to adopt it, since a parallel candidate exists (see "Parallel effort" below);
2. the open decisions of the completeness repair it builds on.

This is a content-only package. No app code, registry, live edition, live character card, shared tooling, Danish or audio was touched.

## What this is

The completeness repair (branch `claude/kind-fermi-a2b3g0`, commit `bebe95b4`) restored and corrected the text. Its Modern English (`1e970b7b…`) still failed the similarity gate at a weighted **0.866**, so it is largely Victorian Jowett.

This successor assesses that text, paragraph by paragraph, for a first-time reader or listener. It then re-renders what does not work, against the corrected source (`original-en` `3521a12d…`, Jowett).

- It **preserves** the accepted restored passages (1.0–1.8, and the C-06 paragraphs 3.3, 3.7 and 3.8) byte for byte.
- It **preserves** every passage that already worked.

## Deliverables

| File | What it is | SHA-256 |
|---|---|---|
| `candidate/symposium-modern-en.json` | Successor modern-en: 8 chapters and 226 paragraphs, 1:1 with `original-en` `3521a12d…`. Serialized like the live file | `61d0919dcf599b2162220bae9bc85254cc8d622e3b887a79a0641bf4dde9198c` |
| `cards/symposium-characters-modern-en.successor.proposed.json` | Proposed `editions["modern-en"]` card block, re-anchored and verified | `7530d25249ff6348f542d7114b2b1c262e9d09822fe549e04e1ca932819c3d49` |
| `CHANGED-PARAGRAPHS.json` | 170 paragraphs that differ from the accepted `1e970b7b…`, for narration-cache invalidation | `865d3396246b65084de26708d1c29890dbb2df297efbfdd1b2267415d0dfcdc4` |
| `LEDGER.json` | Every changed paragraph, with before and after, assessor issues, renderer, and every later edit with its source, reason and independent verdict | `8012d1f5948e4d89fc62485451eae204675ac65c981e511d15640cc70af530aa` |
| `PROTECTED-NOTES.md` | Blind-reader findings on the protected passages, as optional proposals. **Not applied** | |
| `assessment/` | The round-1 assessment (SA1 and SA2) and its summary | |
| `render/` | The round-1 renderer outputs (R1–R5), the render brief and the shared glossary | |
| `review/` | Every independent review, listed under "Review record" below | |
| `gate/gate-output.txt` | Similarity gate result | |
| `HASHES.sha256` | Every file in this folder | |

## Similarity gate: PASS, no waiver

This is the unmodified `books/classify-modern-en.py symposium --gate`, run on a scratch copy of the repo layout, with the corrected `original-en` and this candidate as modern-en:

```
symposium original-en -> modern-en  (8 chapters)
  weighted similarity : 0.578   (gate: <= 0.75)
  light+mechanical    : 0/8 = 0.0%   (gate: <= 5%)
  identical long paras: 1/170 = 0.6%   (gate: <= 5%)
  buckets: REAL-HEAVY 0  REAL 8  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS
```

The accepted repair scored 0.866 and failed. The successor passes **without a waiver**. The gate is a screen, not proof. The evidence that the text works is the review record below, including its limits.

## How it was made

The review record in detail:

| Stage | Who | Result |
|---|---|---|
| Assessment | SA1 (chapters 1–4) and SA2 (chapters 5–8), independent | 115 KEEP, 111 REPAIR |
| Rendering, round 1 | R1–R5, independent, each covering distinct chapters | 111 paragraphs re-rendered from Jowett, following the glossary |
| Fidelity review | F1 (chapters 1–4), F2 (5–6), F3 (7), F4 (8) | All **accept-with-fixes**. 8 must-fix: quotation marks and glossary terms in chapter 4 (F1), and the contradiction at 7.49 (F3). 13 should-fix. No invention, omission or order failure |
| Blind reads, round 1 | BL1 (chapters 1–4) and BL2 (chapters 5–8), no source access | Ratings by chapter: 3, 4, 3, 4, 4, 4, 3, 4. Main finding: kept linking dialogue was still Victorian; "yield" was unexplained; the chapter 7 hinges were unclear |
| Round-2 edits | Editor | 165 edits, from F1–F4, BL1 and BL2 and the glossary. Many touch paragraphs first kept |
| Re-check of round 2 | SRC1 (chapters 1–4), SRC2 (5–6), SRC3 (7), SRC4 (8), independent | SRC1: 56 accept, 2 revise, 0 reject; SRC2: 21 accept, 1 revise, 0 reject; SRC3: 48 accept, 2 revise, 0 reject; SRC4: 33 accept, 2 revise, 0 reject. In all, 158 of 165 accepted; the 7 revisions were applied in the re-checkers' own wording |
| Fresh blind reads of the round-2 text | BL3 (chapters 1 and 3) and BL4 (chapter 7), new readers | Chapters 1, 3 and 7 rated **3/5**, unchanged from round 1. Details below |
| Round-3 edits | Editor | 30 edits: every re-checker revision, and the fixable points from BL3 and BL4 |
| Final confirmation of round 3 | SFC, independent | PENDING |

## Honest limits

- **Chapter-level comprehension did not rise for the hardest chapters.** Fresh blind readers still rate chapters 1, 3 and 7 at **3/5**. Sentence-level problems are fixed: archaic wording, false friends, contradictions, broken quotation marks, and unclear speakers. What remains is mostly:
  - **Plato's own structure:** the nested frame narration in chapter 1; premises asserted rather than argued in chapter 7; Diotima's philosophical vocabulary;
  - **Greek social context:** the lover and beloved custom, the two Aphrodites, and the names and places in 3.3;
  - **protected passages:** 1.0–1.8, 3.3, 3.7 and 3.8. Proposals for these are in `PROTECTED-NOTES.md`.

  Adding exposition to Plato's text would break fidelity. These obstacles are better met by Tinct's reading aids, such as onboarding and the Primer, than by the edition.
- **Set speeches are unquoted.** Phaedrus, Pausanias and Agathon speak without quotation marks, while Aristophanes and Socrates are quoted (F2). This book-wide convention was left for Anders to decide.
- **Every reviewer is an AI agent** working from Jowett and public-domain knowledge.

## Parallel effort (decision needed)

After this work began, the completeness-repair owner started its own accessibility pass on the same base:

- **Branch:** `claude/kind-fermi-a2b3g0`, commit `dbc98ad9`, 2026-09-25 15:50 UTC
- **Folder:** `books/wip/symposium-accessibility/`
- **Contents:** an assessment, a style guide and "review candidate v1", `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e`

That folder was **not touched**. Neutral comparison figures, from this package's scratch run of the same gate script:

| | This successor | Parallel candidate v1 |
|---|---|---|
| Gate (weighted) | 0.578, PASS | 0.515, PASS |
| Paragraphs changed from `1e970b7b…` | 170 | 151 |
| Changed in both | 146 | |
| Protected 3.3, 3.7, 3.8 | unchanged | changed |
| Independent reviews | complete (above) | none recorded at `dbc98ad9` |

**Only one should proceed.** Two routes are possible:

- Adopt this successor. Its review record is complete.
- Let the owner continue. This package's review files (`review/`) and `PROTECTED-NOTES.md` can then serve as independent review input for that candidate.

## Integration dependencies (Codex)

1. **The completeness repair must be integrated first, or in the same release.** This successor's base is its modern-en `1e970b7b…`, and its `original-en` is `3521a12d…`. The repair's open decisions still apply (its `RELEASE-PACKET.md` §6): the C-04 variant, Danish `aligned: false`, and the repair's card anchors. The repair's similarity-gate waiver would be **moot** if this successor ships, because the successor passes the gate.
2. Replace `app/public/data/editions/symposium-modern-en.json` with `candidate/symposium-modern-en.json`. Replace `editions["modern-en"]` in `characters/symposium.v1.json` with the proposed block. Use the repair's proposed `original-en` block unchanged. Bump `characterReleases.symposium.revision`.
3. Invalidate narration caches for the paragraphs in `CHANGED-PARAGRAPHS.json`, together with the repair's own changed and moved paragraphs.
4. modern-da is out of scope, and is recorded only.

## Character card (modern-en)

The successor card is derived from the completeness repair's proposed modern-en card, which has 531 mentions and 94 characters. That card was re-anchored to the successor text as follows:

| | Mentions |
|---|---|
| Carried over | 515 |
| Placed by hand after rewording (for example "Discretion" → "Cunning Intelligence" and "God" → "a god" at 7.47) | 14 |
| Dropped, because the text no longer names the referent: "inspired by a god" (2.7) is now generic, and "love is the love of what one lacks" (7.32) is now impersonal | 2 |
| Added, for names the successor spells out (for example "Aristodemus" at 1.32 and "Socrates" at 6.11), keeping the accepted card's full name coverage | 46 |
| **Total** | **575** |

Three anchor sets (Admetus, Achilles and the original humans) were placed by hand. The block verifies against the reader's `verifyCharacters` rules with **no errors**: source hash, all 226 paragraph hashes, every mention slice, every point in range, and no snapshot before its first mention.
