# Release Packet — Meditations (Marcus Aurelius), modern-en

Status: **Accepted and ready for release handoff** (see `ACCEPTANCE-RECORD.md`).

This package is staged only. No live edition, character card, audio, registry, application, deployment or shared tracker file was changed. The coding agent owns integration and publication.

## Artifact

| Item | Value |
|---|---|
| Source (fidelity anchor) | `books/wip/green-meditations/source.json`, byte-identical to the served `app/public/data/editions/meditations-original-en.json` (sha256 `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830`). George Long 1862, Project Gutenberg #15877, verified word-for-word |
| Candidate | `books/wip/green-meditations/candidate.json` |
| **Accepted sha256** | **`4623d1191fbd1c09f9257acf7e73b49d5467e35fa0d9979e35c910bb24b9cc9f`** |
| Destination | `app/public/data/editions/meditations-modern-en.json` — copy byte for byte |
| Replaces live sha256 | `e2cc6090b4cde62db3f991dd5f6714c5d194232c499de3bbe8ddd04915803d10` (kept as `baseline-live-modern-en.json`) |
| Structure | 12 chapters, 487 paragraphs. Per-chapter counts 17/17/16/51/36/59/75/61/42/38/39/36, with titles "Book 1"–"Book 12". Identical to the source and to the live edition, so paragraph alignment with `original-en` is intact |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv` (first 16 hex characters of each paragraph's sha256, keyed `chapter.index`) |
| Word count | 45,498 by whitespace split (live: 45,451). The registry `wordCount` may be updated if wanted |

## Changed passages

**482 of 487 paragraphs** differ from the live edition. This is a full re-rendering from Long to a written standard; the live text had failed the repository's similarity gate. `CHANGED-PARAGRAPHS.md` gives, for each paragraph, its old and new hash and the reason for the change, including the specific review findings behind it.

- **Per chapter:**
  - ch1: 17 of 17
  - ch2: 17 of 17
  - ch3: 16 of 16
  - ch4: 50 of 51
  - ch5: 36 of 36
  - ch6: 58 of 59
  - ch7: 73 of 75
  - ch8: 60 of 61
  - ch9: 42 of 42
  - ch10: 38 of 38
  - ch11: 39 of 39
  - ch12: 36 of 36
- **Unchanged:** 4.16, 6.53, 7.41, 7.42, 8.32.

## Integration items for the coding agent

1. **Character cards.**
   - **Where it stands:** `meditations` has a character package, `app/public/data/characters/meditations.v1.json`, at contentVersion `2026-09-12.2`. Its `modern-en` edition is pinned to the live bytes (`sourceSha256` e2cc6090…), so the reader will fail closed on the new text until the package is re-anchored. `original-en` is unchanged and needs nothing.
   - **What to re-anchor:**
     - `sourceSha256`, set to the accepted hash;
     - the modern-en paragraph hashes for the 482 changed paragraphs;
     - the offsets of all **81 modern-en mentions** (every one falls in a changed paragraph);
     - bump the release revision.
   - **Mentions whose text is gone:** 51 mentions still find their text in the new paragraph. **30 do not**, and all 30 belong to the figure `the-ruling-part`. The live text said "ruling part"; the accepted text says "ruling faculty" throughout, which is the standard's stable rendering.
   - **What to do:** re-anchor those 30 mentions to "ruling faculty", and consider updating the figure's display name to match. Details are in `character-card-impact.json`.
   - **Precedent:** `app/scripts/reanchor-meditations-characters.py` did the same job for the 2026-09-12 re-basing.
2. **Audio scope.** Legacy narration, manifests and timings are not release prerequisites. This handoff is text plus the required character compatibility only; it involves no GPU/TTS generation, audio regeneration or voice-architecture change. Any future narration of the new text follows the separately approved audiobook architecture.
3. **Stored reading positions.** Paragraph indices are unchanged, so no position remapping is needed. `rebasedEditions.ts` concerns the earlier Casaubon→Long change and is unaffected.
4. **Verify after publication.**
   - The served sha256 must equal `4623d1191fbd1c09f9257acf7e73b49d5467e35fa0d9979e35c910bb24b9cc9f`.
   - The counts must be 12 chapters / 487 paragraphs, with per-chapter counts as above.
   - The character cards must load on modern-en.

## Unresolved dependencies and notes (none block the text release)

- **Character-card re-anchoring:** described in item 1. Required for cards to show on the new text, and owned by the coding agent.
- **`original-en` oddities in Long's printed text.** The source file was not modified. Each is corrected only in modern-en and logged in `AMBIGUITIES.md`:
  - 6.40 "thou wilt not blame the gods", which Long's argument and the Greek contradict;
  - 8.36 "Fergamus" (Pergamus);
  - 10.14 "Let me see" ("Let men see");
  - 12.26 "Briae" (Baiae);
  - small slips at 5.0, 5.14, 5.28, 5.31 and 9.33.

  All of them are in Gutenberg #15877 itself. Whether to correct the served original is a separate decision.
- **Stale raw source record.** `books/raw/meditations/raw.txt` and `SOURCE.md` still hold and describe Gutenberg #2680 (Casaubon), not Long #15877. They were not changed here, being out of scope; a documentation fix is suggested.
- **Book onboarding and SEO copy** were not reviewed against the new wording. Quotations of the modern text in `app/public/data/onboarding/meditations.json` or `app/scripts/seo/meditations.cjs`, if any, may differ from the new wording.

## Evidence

- `STYLE-AND-TERMINOLOGY.md`: the standard.
- `AMBIGUITIES.md`: 134 recorded readings.
- `reviews/LEAD-SOURCE-COMPARISON.md`: lead coverage.
- `reviews/R1-fidelity-bookNN.md`, `reviews/R1-accessibility-bookNN.md`: the per-book independent reviews.
- `reviews/R1-applied-bookNN.md`: dispositions for every finding.
- `reviews/R1-reverify-bookNN.md` and `R2-reverify-book02.md`: re-verification of every change.
- `reviews/FINAL-reverify.md`, `reviews/FINAL-crossbook-*.md`: the final re-verification and whole-book consistency reviews.
- `drafts/`: per-book drafts and drafter notes.
