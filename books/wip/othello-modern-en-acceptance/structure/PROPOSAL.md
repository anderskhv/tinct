# Othello structural repair: proposal (not applied)

**Status:** proposed and source-verified. It is **not applied** to either candidate.

- `../othello-modern-en.v2.candidate.json` keeps the served structure, so it stays 1:1 with the live `original-en`.
- Applying this proposal changes **both** English editions together, so it needs Anders's approval and a Codex integration. Content only: no code was written.

## Why

All three blind readers (`../review/BLIND-TRIAGE.md`) found the same top obstacle. Parser defects in the served editions make spoken lines look like stage directions, and stage business that the source prints is missing.

These are defects of the **served structure**, shared by `original-en` and `modern-en`. No Modern English wording can fix them. The source is Project Gutenberg #1531 (`pg1531.txt`, sha256 `340a08eb…e462`), the text the served `original-en` was built from.

## Part A: spoken text bracketed as stage directions (`part-a-brackets.proposed.json`)

The parser split speeches at inline stage directions. It wrapped the continuation in `[...]` and lost the speaker prefix. The reader may then style the speech as a stage direction.

| Category | Paragraphs | Proposed repair |
|---|---|---|
| C: speech continuing after a direction | 35 | Remove the brackets and restore the speaker prefix from the source |
| E: continuation beginning mid-sentence | 3 (10.93, 12.47, 13.26) | Same repair. At 12.47 the modern text needs "You, " to keep the sentence whole |
| A: speaker tag without a period | 2 (3.4 SECOND SENATOR, 15.146 OTHELLO) | Remove the brackets and add the period the reader's speaker-label rule needs |
| B: joint speaker tag | 1 (3.28 "DUKE and SENATORS.") | Remove the brackets; keep the joint tag |
| D: song inside a speech | 2 (6.29, 6.39 IAGO) | Remove the brackets and restore the prefix; keep the song |
| G: sung line with a direction | 2 (13.27, 13.29 DESDEMONA) | Restore the prefix; the song line stays italic (`_…_`) |
| F: unattributed offstage cry | 2 (4.18, 4.41) | **No change.** The source does not attribute these lines |

This covers the base package's list of 43 paragraphs, plus the sung lines 13.27 and 13.29. The 4.18 and 4.41 entries are recorded so that the list is complete.

- **Paragraphs changed:** 45 in each edition.
- **Patched hashes if applied:**
  - `original-en`: `a8e8ae40…` becomes `f9c00fd7a2996a45bc649072fdf568556b1d8b9b0f6c0b60cfce3894b0959233`.
  - `modern-en`: v2 `ed1e3ebb…` becomes `da580d7fe433bb77ec9ae58a1d528143174407fbda3355c923500ea5d3be8044`.
- **Verification:** an independent verifier (SD1, `../review/brackets-verification.json`) checked every entry against the source lines. It confirmed:
  - the speaker from the source;
  - that the proposed original is character-identical to the served inner text and the source;
  - that the proposed modern text keeps the v2 wording.

  The one correction it raised was that 3.28's speaker is "DUKE and SENATORS.". It is applied.
- **Character cards:** re-projected and verified against the patched texts. No mention is dropped.
  - original-en: 33 mentions projected, 16 anchor points moved.
  - modern-en: 34 mentions projected, 16 anchor points moved.
  - Restoring the prefixes makes 42 optional prefix mentions available in each edition. They are listed in the file and are additive only.

## Part B: inline stage directions the parser stripped (`part-b-inline-directions.proposed.json`)

The source has 38 inline directions on speech lines, and 36 of them fall inside speech paragraphs. Only 2 survive in the served editions: 4.47 `[_To Emilia._]` and 14.80 `[_To Bianca_]`. The other **34** were stripped from both editions.

They include:

- the kneeling in 9.171–9.172;
- Iago going and returning (9.94, 9.96);
- `[_Within._]` for Emilia at the locked door (15.56–15.62);
- asides (4.77, 4.89, 6.57, 6.74, 10.22, 11.52, 11.55, 14.95);
- `[_They kiss._]` (4.88);
- `[_Reads._]` (11.130);
- addressee directions (3.24, 3.33, 3.67, 6.3, 12.22, 14.46, 14.82, 15.197).

**Proposed repair:** re-insert each direction verbatim, in Gutenberg's `[_…_]` form, at its source position:

- 26 at the start of a line;
- 5 mid-line;
- 3 at the end of a line.

In the modern text, 8 placements were decided by hand because the modern sentence order differs from the verse: 3.67, 4.88, 6.3, 9.171, 9.172, 10.22, 11.114 and 14.95. Each has a note in the file.

- **Patched hashes if applied alone:**
  - `original-en`: `cacb37f20ca3c8cac592505613b05263712c6947ff6aa025fce626adeec04e05`
  - `modern-en`: `0bf390c4d63741b39b786be783ad974f080f593d832bf5a32f6c75725a11814c`
- **Character cards:** 53 mentions projected per edition and 4 anchor points moved. No mention is dropped, and both editions verify.
- **Related case, unchanged:** 6.61 `[Cry within: “Help! help!”]` is a real stage direction and stays as it is.

## Parts A and B together

- Parts A and B touch **disjoint paragraphs**, so they can be applied in either order or together.
- The hashes above are for each part applied alone to the base. If both are adopted, Codex should apply both and recompute the final hashes, character-card blocks and paragraph hashes on the combined result.
- Whatever is adopted must be applied to `original-en` and `modern-en` in the same release, with the matching character-card blocks, `characterReleases.othello.revision` bumped, and changed paragraphs added to the narration-cache invalidation list.

## Decisions for Anders

1. Adopt Part A, which restores the speakers of 45 bracketed speeches: yes or no.
2. Adopt Part B, which restores 34 stripped stage directions: yes or no.
3. **House style:** stage directions stay byte-identical to the source convention (`[_Aside._]`, "Exeunt"), as in Hamlet and Macbeth. Modernizing directions would be a house-wide decision for every play.
