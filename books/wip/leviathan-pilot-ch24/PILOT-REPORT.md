# Leviathan Expansion Batch — edition ch24 (Hobbes ch23) Report

**Chapter:** edition chapter 24 / Hobbes's own Chapter 23, "Of the
Publique Ministers of Soveraign Power." Identity verified directly
against the live files before drafting (not assumed from array
position): source title "Chapter 23. Of the Publique Ministers of
Soveraign Power," opening "In the last Chapter I have spoken of the
Similar parts of a Common-wealth..."; 13 paragraphs confirmed matching
between `-original-en.json` and `-modern-en.json`.

**Final file:** `leviathan-ch24-final.json`
```
sha256: 791e117aa5ef698e7cc7ef87b4a0ecf0eaeaa48f9f280518c2b7bed98b8abd68
source sha256: daf8a0a595741be412801c3226b4bb0c1b60174636a9627d46f51d4b933dbc64
```

## Process (5 rounds — not a single pass)

1. **Round 0 — drafting.** Sonnet drafted against the locked source,
   using the existing modern-en (already REAL-classified, sim 0.546) as
   a reference, not required wording. No citation flagged as a likely
   source error by the drafter.
2. **Round 1 — full independent review.** Blind accessibility (all 13
   paragraphs) + Opus fidelity (4 packets covering all 13 paragraphs +
   whole-chapter re-read). Verdict: ACCEPT WITH FIXES REQUIRED — one
   blocking (unmodernized chapter title), five recommended (D2-D6).
   Three source-level historical claims flagged as *possible* errors in
   Hobbes's own text (S1-S3, see below) — none corrected, all preserved
   as written.
3. **Round 2 — fixes + re-verification.** All D1-D6 applied, plus
   accessibility fixes for 8 more flagged spots (unglossed "similar/
   organic parts," "cofferers," "economy," "judicature," a dense
   nested-conditional sentence, the unglossed "author"/tangled
   secret-agent sentence, a circular counsellor sentence). Fresh blind
   accessibility + targeted fidelity re-check found: all six original
   fixes correctly applied, but **one new blocking defect (N1)** — an
   invented, factually wrong gloss claiming ch22's "similar parts" are
   "private citizens" (they are not; ch22 is about subordinate
   systems/bodies, and this session doesn't have ch22's text to state
   the correct answer, so the false claim was deleted rather than
   replaced with another guess).
4. **Round 3 — fixes + re-verification.** N1 and six more recommended
   fixes (N2-N7) applied, plus new accessibility glosses. Fresh review
   found **a serious regression**: a scripting bug (plain assignment
   instead of a targeted string replace) had silently deleted
   two-thirds of paragraph 1 — the entire "public minister" definition,
   the two-capacities frame, and the ushers/cofferers example — while
   *adding* the one gloss that edit intended. Caught by the reviewer's
   word-count ratio check (0.36 vs. the ~1.0 baseline for every other
   paragraph), not by trusting the diff. Also found three smaller
   regressions (a dropped duration bound, a narrowed gloss, a
   reintroduced hedge word).
5. **Round 4/5 — fix the regression, verify, one last polish fix.**
   Paragraph 1 restored in full from the last known-good version and
   the gloss correctly reapplied (using ch18's already-accepted house
   wording, since the round-3 phrasing had also overreached). The three
   smaller regressions fixed. A word-count ratio sanity check added as
   a standing tripwire for this failure class. Final fresh blind
   accessibility review found one more real (not stylistic) issue: a
   confusing shared-predicate sentence structure at the end of
   paragraph 1 — inherited from an ambiguity in Hobbes's own source
   sentence, but worth resolving in a modern rendering rather than
   reproducing. Restructured as two explicit parallel statements. A
   final full, non-sampled fidelity pass (all 13 paragraphs, not just
   the fix sites) then returned **ACCEPT AS-IS**.

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** Full independent pass on the final file
  (not just a diff of the fixes) found zero blocking defects: no
  content loss anywhere (the round-3 regression is fully repaired and
  independently reconfirmed), no actor swaps, no flipped/dropped
  negation, no invented claims, no silent historical corrections. A
  handful of non-blocking, optional stylistic notes remain (documented
  below) — these are not required fixes; further chasing them would be
  iterating for taste, not correctness.
- **Accessibility: substantially accessible.** The chapter's real
  comprehension problems (an unglossed load-bearing technical term used
  a dozen times, several garden-path sentences, one factually wrong
  gloss, one confusing shared-predicate construction) are all resolved.
  What's left is genre-appropriate density in a 17th-century
  philosophical-legal treatise, not accessibility defects.

## What went wrong and how it was caught (worth keeping in view)

This chapter is the clearest demonstration in this whole pilot of why
"every edit needs rechecking" isn't a formality:

- Round 2 introduced a **factually wrong invented gloss** that a
  reviewer with no access to the referenced chapter still caught,
  because it read as suspiciously specific for something the chapter
  itself never explains.
- Round 3 introduced a **real content-loss bug** — not a bad
  paraphrase, an actual deletion — that a diff-only check could have
  missed if the reviewer had trusted the "these six items were fixed"
  framing instead of re-deriving coverage from the file itself. The
  word-count ratio check that caught it (now added as a standing
  tripwire) is cheap and worth keeping in the toolkit for any chapter
  with substantial paragraph edits.

Neither of these would have been caught by a similarity-score gate —
both edits made the text *more* different from source, which a
naive "more rewriting = better" heuristic would have rewarded. They
were caught by an independent reader re-deriving the paragraph's
content from scratch.

## Non-blocking items left as documented, not fixed further

- Four of Hobbes's explanatory sentence-initial "For"s render as flat
  assertions rather than explicit causal connectives (paragraphs 2, 4,
  6, 9) — same minor class as one item that was fixed at paragraph 8;
  not fixed everywhere, since it doesn't change any claim.
- Paragraph 7: "is therefore either to" softened to "may either" —
  obligation phrased as permission; meaning-preserving in context (the
  sovereign's options either way), flagged as a nuance, not a defect.
- A handful of micro word-choice notes (paragraph 1 "any affaires" →
  "some affair," paragraph 5 "enable" → "authorize," paragraph 6
  "as...so" → "since...so," paragraph 11's "him" resolved to "the
  prince") — all confirmed accurate, logged for completeness only.
- `Dei Gratia` glossed slightly differently in two adjacent clauses
  (paragraph 5) — cosmetic.
- Three **possible source-level historical claims** (not candidate
  defects) flagged by round-1 review and left untouched, per the
  editorial-transparency requirement:
  - **S1 (highest confidence):** Hobbes's account of how a peer's
    judges were chosen ("as many as would be present," "a privilege of
    favour... such as they had themselves desired") likely
    overstates how consensual English trial-by-peers actually was —
    out of parliamentary session, peers were tried before the Lord High
    Steward with Crown-selected Lords Triers, not judges of their own
    choosing. This is load-bearing for Hobbes's argument ("judged by
    his own judges"), so a reader may want to know the historical
    picture is more contested than Hobbes presents it.
  - **S2:** the jury-challenge passage implies an unlimited right to
    keep objecting until twelve unobjected-to men remain; in practice
    peremptory challenges in felony cases were capped. Same direction
    of overstatement as S1.
  - **S3 (low confidence):** `Dei Providentia et Voluntate Regis` may
    be an illustrative formula Hobbes constructed rather than an
    attested chancery/episcopal title — flagged for completeness, not
    corrected, since "fixing" it to the real attested Latin styles
    would be exactly the silent correction the protocol forbids.
  - **Recommended handling for all three, unchanged from round 1:**
    leave the text exactly as rendered; if the edition ever adds notes,
    these are candidates for a short editorial endnote.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility, blind, all 13 paragraphs | `accessibility-review-1.md` | needs targeted fixes |
| 1 | Fidelity, 4 packets + whole-chapter re-read, all 13 paragraphs | `fidelity-review-1.md` | ACCEPT WITH FIXES REQUIRED |
| 2 | Accessibility, blind, all 13 paragraphs | `accessibility-review-2.md` | needs targeted fixes |
| 2 | Fidelity, changed-passage re-check (diff-derived, not claim-derived) | `fidelity-review-2.md` | ACCEPT WITH FIXES REQUIRED (N1 blocking) |
| 3 | Accessibility, blind, all 13 paragraphs | `accessibility-review-3.md` | substantially accessible |
| 3 | Fidelity, changed-passage re-check | `fidelity-review-3.md` | ACCEPT WITH FIXES REQUIRED (D7 blocking regression) |
| final | Accessibility, blind, all 13 paragraphs | `accessibility-review-final.md` | needs one more fix (applied) |
| final | Fidelity, FULL non-sampled pass, all 13 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |

Every reviewer stated exact coverage in their own file. No reviewer
sampled a full chapter without saying so.

**Post-acceptance verification gap, found and closed.** One edit (the
full D9 fix, broadening the "economy" gloss) was made *after*
`fidelity-review-final.md` had already returned ACCEPT AS-IS — a
"trivial" one-clause edit that had never itself been independently
checked. Closed with a dedicated verification pass,
`fidelity-review-D9-verification.md`: paragraph 3 (the edited paragraph)
plus paragraphs 2 and 4 (neighboring context) independently re-checked
against source on the full fidelity checklist. Verdict: the edit
strictly *improved* fidelity (removed a partial narrowing toward
finance that the earlier wording had introduced) and created no new
defect; both neighboring paragraphs confirmed byte-identical to their
already-reviewed state and still consistent across the boundary
(general/special contrast with paragraph 2, "first"/"Second" enumeration
with paragraph 4). The file's hash was unchanged by this pass (no
further edit was needed) but is now genuinely pinned to a
fully-verified final state, not just the state before the last edit.

## Status

Nothing has been published. `leviathan-ch24-final.json` is a staged
candidate only, not copied into any live edition file. Verified final
hash (confirmed identical for both `candidate-sonnet.json` and
`leviathan-ch24-final.json`):
`791e117aa5ef698e7cc7ef87b4a0ecf0eaeaa48f9f280518c2b7bed98b8abd68`.
