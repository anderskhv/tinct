# Acceptance record: Symposium completeness repair

**Decision (2026-09-25): CONTENT ACCEPTED for integration. NOT PUBLISHED.**

- The accepted candidates below are complete against the pinned Jowett source, structurally corrected, and independently reviewed and re-verified.
- **Publication is conditional** on Anders's decisions in `RELEASE-PACKET.md` §6. In particular, modern-en does not pass the repository's similarity gate. That failure predates this repair and is not worsened by it.
- Integration, reader-data migration and release belong to the coding agent. None of them has started.

## Accepted candidates

| File | sha256 | git blob | Bytes | Paragraphs |
|---|---|---|---|---|
| `candidate/symposium-original-en.json` | `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6` | `5d5be8c31348aa4fc6dd3be5b8a452dd137a375c` | 121,441 | 226: 49, 8, 12, 10, 18, 13, 69, 47 |
| `candidate/symposium-modern-en.json` | `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f` | `8049f40fe1837595fcf0ceda718f2e51bedb632a` | 121,364 | 226: same |

**Not for integration.** These interim versions are superseded:

- modern-en v1 `43f03333a255d90378a12ab1d1d384620e515e1725cb4ba8132e794fa504e550`
- modern-en v2 `073ca5b4eeda36bb0293be8fab1d97f6f37d7feb9f4cc4d6fc82e0244d693eae`

Original-en has been `3521a12d…95a6` since v1.

**C-04 variant.** If only the chapter-5 retitle is declined, use the original-en variant `0615b9566818ba69f8bc45dfdb5ef4c6d3f2300c947494fd29fe4590354c506a`.

## Criteria and evidence

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Source identified, pinned and validated. Dialogue separated from Jowett's introduction and the Gutenberg boilerplate | `source/SOURCE.md` and byte-exact files; Review 1 C1 | **Met** |
| 2 | Whole-book comparison of original-en with the complete source; every omission identified | The only gap was dialogue ¶0–8 (648 words). No duplication, reordering, join or altered word (`coverage/COVERAGE.md`; Review 1 C2) | **Met** |
| 3 | Missing passages restored verbatim | Candidate original-en word stream = the complete dialogue; 1.0–1.8 byte-identical to the TXT; pure ASCII (build assertions, final verifier, Review 1 C3) | **Met** |
| 4 | Every source passage accounted for in order | `coverage/passage-coverage.tsv`: all 180 source paragraphs → candidate coordinates, each reproduced exactly; 46 pre-existing splits, all at sentence ends (`coverage/split-inventory.tsv`) | **Met** |
| 5 | Restored passages rendered as clear, faithful Modern English | Review 1 C8 (v1); Review 2 blind read (v1: accept with changes, resolved); re-verification R2 (v2); delta D2 (v3) | **Met** |
| 6 | Modern-en whole-book completeness; confirmed defects corrected with reasons | Review 1 C7 found 3.7 (and F8: 3.3, 3.8), corrected by C-06; re-verification R3 re-read chapter 3 and found no remaining omission | **Met** |
| 7 | Editorial chapter boundaries corrected and documented, not attributed to Plato | Chapter 7 ends with Socrates's last words, chapter 8 starts at "When Socrates had done speaking…"; nothing lost or duplicated (Review 1 C5; `CHANGES.md` C-03) | **Met** |
| 8 | English editions paragraph-aligned | 226 = 226, with equal per-chapter counts and titles | **Met** |
| 9 | Explicit old→new mapping, with unchanged and specially migrated passages identified | `mapping/`: 217 rows (130 keep, 41 renumber, 46 move), 9 inserts. Offsets are exact everywhere except modern-en 3.3, 3.7 and 3.8, which have opcodes (Review 1 C4; re-verification R4; delta D3) | **Met** |
| 10 | Character-link impact complete | All 510 and 506 mentions re-resolve after remapping, and 10 offset changes in modern 3.3. The recompute list is derived. Proposals are exact (Review 1 C9; re-verification R5 after F1; delta D3) | **Met** |
| 11 | JSON valid; serialization identical to live | `indent=2`, UTF-8, no trailing newline; round-trips (final verifier) | **Met** |
| 12 | Truncation and stub checks | `books/audit-truncation.py` (en): 0 flags before and after. Paragraphs under 20 characters are genuine one-line answers present in Jowett | **Met** |
| 13 | Repository similarity gate for modern-en (`books/classify-modern-en.py --gate`) | FAIL: weighted 0.866 (baseline 0.877); 6/8 chapters LIGHT. This is pre-existing (commit `67aa9c16`) and not rewritten, per the assignment | **Not met: decision needed** |
| 14 | Downstream impact recorded; proposed corrections staged, not applied | `impact/`: cards, threads, onboarding, SEO, narration/caches, user data, Danish | **Met** |
| 15 | Danish inspected and reported, with no Danish generated and nothing removed | `impact/modern-da-report.md` and the archived audit | **Met** |
| 16 | Isolation: only content artifacts in the owned staging folder; no code, live files, registry or deploy | Commit-scope check at each commit (final commit in the handoff message) | **Met** |

## Final verification run (on the accepted bytes)

The independent verifier (a script that shares no code with the build) was run on the accepted bytes: **50 checks passed, 0 failed**. These are its checks:

```text
PASS pg1600.txt hash pinned
PASS pg1600-images.html hash pinned
PASS Gutenberg metadata
PASS dialogue = 180 paragraphs, correct first/last
PASS HTML <p> blocks equal TXT paragraphs after em-dash normalisation
PASS original-en candidate sha256 matches build-summary
PASS original-en serialization indent=2, ensure_ascii=False, no trailing newline
PASS original-en chapter counts
PASS original-en chapter numbers 1..8
PASS original-en top-level keys unchanged
PASS original-en no empty/padded/multi-space paragraphs
PASS modern-en candidate sha256 matches build-summary
PASS modern-en serialization indent=2, ensure_ascii=False, no trailing newline
PASS modern-en chapter counts
PASS modern-en chapter numbers 1..8
PASS modern-en top-level keys unchanged
PASS modern-en no empty/padded/multi-space paragraphs
PASS original-en candidate is pure ASCII
PASS original-en candidate word stream == complete dialogue
PASS restored 1.0-1.8 verbatim
PASS every source paragraph boundary is a candidate boundary
PASS 46 extra splits, all after sentence-final punctuation
PASS paragraph-map has 217 rows
PASS exactly three text-changed paragraphs recorded (modern-en 3.3, 3.7, 3.8)
PASS original-en: every baseline paragraph byte-identical at its mapped coordinate, except recorded C-06 edits (verified via opcodes)
PASS original-en: map is injective; only 1.0-1.8 unmapped
PASS original-en: zero offset shifts
PASS modern-en: every baseline paragraph byte-identical at its mapped coordinate, except recorded C-06 edits (verified via opcodes)
PASS modern-en: map is injective; only 1.0-1.8 unmapped
PASS modern-en: zero offset shifts
PASS map marks exactly 3 text-changed rows
PASS original-en: ch7 ends with Socrates, ch8 starts at "When Socrates had done speaking"
PASS modern-en: ch7 ends with Socrates, ch8 starts at "When Socrates had done speaking"
PASS chapter titles identical across English editions
PASS only original-en chapter 5 title differs from baseline
PASS original-en: paragraph-hashes file correct (226 rows)
PASS modern-en: paragraph-hashes file correct (226 rows)
PASS coverage: all 180 source paragraphs reproduced exactly by listed candidate paragraphs
PASS coverage: exactly source 0-8 missing from baseline
PASS original-en: all 510 card mentions re-resolve after remap
PASS original-en: proposed new mentions resolve and cover all 23 names in 1.0-1.8
PASS modern-en: all 506 card mentions re-resolve after remap
PASS modern-en: proposed new mentions resolve and cover all 25 names in 1.0-1.8
PASS original-en: paragraphHashesChaptersToRecompute == [1, 7, 8]
PASS original-en: card impact pinned to candidate sha256
PASS modern-en: paragraphHashesChaptersToRecompute == [1, 3, 7, 8]
PASS modern-en: card impact pinned to candidate sha256
PASS CHANGES C-01 texts equal source 0-8
PASS CHANGES C-02 texts equal modern candidate 1.0-1.8
PASS CHANGES C-06 before/after equal baseline/candidate modern 3.3, 3.7, 3.8
FAILURES: 0
```

## Review record

| Review | Scope | Verdict on v1 | After resolution |
|---|---|---|---|
| Review 1: completeness and fidelity (independent, source access) | Whole book: source provenance; original-en against the complete Jowett text; all 226 modern-en pairs screened, with chapters 1, 3 and 8 read in full; the 9 restored modern paragraphs; chapter regroup; mapping, hashes and character-card re-resolution | C1–C6, C8 and C9 confirmed. C7 partly held (3.7 dropped "which custom allows"). F1 is the pre-existing similarity-gate failure | F2 and F8 (3.3, 3.8) fixed by C-06. F3, F6, F7, F9 and F11 fixed. F1 and F4 escalated as decisions. All in `reviews/RESOLUTION.md` |
| Review 2: blind reader (no source access) | The new Modern English opening in context, and the chapter 7→8 transition | ACCEPT WITH CHANGES (3 should-fix, 10 optional) | All 3 should-fix items adopted; 9 of 10 optional items adopted in full or in part, each checked against Jowett; declined items reasoned in `reviews/RESOLUTION.md` |
| Re-verification (independent, source access) | Every change made after the reviews | On v2: R1–R4, R6 and R7 CONFIRMED; R5 PARTLY (F1: stale paragraph-hash recompute list, fixed). Delta on v3: D1–D3 CONFIRMED; D4 PARTLY (two record wording notes, fixed); D5 notes only. Nothing blocking | `reviews/REVERIFY.md` (v1→v2) and `reviews/REVERIFY-DELTA.md` (v2→v3); every finding resolved in `reviews/RESOLUTION.md` |

## Remaining issues (open, not resolved by this package)

1. **Similarity gate.** Criterion 13; a decision for Anders.
2. **Danish.** The same opening is missing, and chapters 7/8 have the same problem. Chapter 3 is misaligned, 2.7 reverses the lover and beloved, and 33 paragraphs are condensed. Recommendation: `aligned: false` in the same release; a decision for Anders.
3. **Character-card proposals** (new mentions and identities, anchor re-selection, optional informant) are staged proposals for integration. The conservative anchor alternative is documented.
4. **Pre-existing, recorded, not changed:**
   - modern-en typography and British spellings;
   - chapter-3 and 4.1 nuance shifts;
   - the 8.0/8.1 split inside Alcibiades's speech;
   - the 10 upstream Gutenberg slips (reproduced verbatim);
   - the unverified registry label "Jowett (1871)";
   - the onboarding `openingText`, which is not verbatim Jowett (optional correction staged);
   - the Cast name-search limitation for "Glaucon".
5. **Staged content corrections** in `impact/proposed-threads-corrections.json`: the `glaucon` thread error is recommended, and the Danish thread string is flagged only.

## Status

| Stream | Status |
|---|---|
| Content (this package) | **Accepted and handed off.** Branch `claude/kind-fermi-a2b3g0`; the commit is given in the handoff message |
| Integration (registry/editions, cards, migration, caches, SEO regeneration) | Not started. Coding agent |
| Publication | **Not published** |
| Narration | No audio generated or authorised. Stale text-dependent audio and caches are identified for exclusion (`impact/IMPACT.md` §6) |
