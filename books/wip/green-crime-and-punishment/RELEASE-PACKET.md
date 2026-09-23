# Release packet: Crime and Punishment, modern-en

**Status: Accepted and ready for release handoff** (see `ACCEPTANCE-RECORD.md`).

Nothing here is published. No live edition, character-card, audio, registry or application file was touched. The coding agent owns integration and publication.

## Scope

This is a text release with required character-card compatibility only.

- It involves no GPU/TTS generation, no Kokoro or legacy audio regeneration, and no change of voice or provider.
- Audio synchronization follows the separately approved [audiobook architecture](../../../docs/audiobook-architecture-2026-09-21.md). It is not a prerequisite for this text.
- The `original-en` edition is unchanged.

## Artifact

| Item | Value |
|---|---|
| Source (fidelity anchor) | `books/wip/green-crime-and-punishment/source.json`, byte-identical to the served `app/public/data/editions/crime-and-punishment-original-en.json`. sha256 `6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978` |
| Candidate | `books/wip/green-crime-and-punishment/candidate.json` |
| **Accepted sha256** | **`18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb`** |
| Destination | `app/public/data/editions/crime-and-punishment-modern-en.json`, copied byte for byte (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline, the same serialization as live) |
| Replaces live sha256 | `914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834`, kept as `baseline-live-modern-en.json` |
| Structure | 41 chapters and 3,904 paragraphs, with `sections`, chapter numbers, titles and per-chapter paragraph counts unchanged from live and from the source. Paragraph alignment with `original-en` is intact. |
| Per-paragraph hashes | `accepted-paragraph-hashes.tsv` gives the full sha256 per `chapter.paragraph` (1-based chapter, 0-based paragraph), plus a `changed` flag |

## Changed paragraphs

**1,270 of 3,904 paragraphs** differ from live.

- `CHANGED-PARAGRAPHS.md` lists each one with its old and new sha16, the review rounds that touched it, and the reason for every edit.
- `ledger/changes.jsonl` holds the exact old and new text of each of the 1,963 edits. Replaying it from the baseline reproduces the accepted file byte for byte.

By type:

| Type | Edits |
|---|---|
| Contractions in the stiff dialogue of ch 11–16 | 462 |
| Name/patronymic normalization to Garnett forms | 280 |
| Omissions restored | 274 |
| Hesitations restored | 247 |
| Meaning | 212 |
| Italic emphasis | 157 |
| Certainty | 79 |
| Invented content removed | 57 |
| Period language | 34 |

The rest are accessibility, typography and verifier corrections.

## Integration items for the coding agent

1. **Character cards.** `crime-and-punishment` is in `characterReleases` at revision `2026-09-12.1`.
   - Its package, `app/public/data/characters/crime-and-punishment.v1.json`, pins the live modern-en hash (`914bcdfa…`). It must be re-anchored to the accepted hash, and the release revision bumped. `character-card-impact.json` has the details.
   - **Paragraph hashes:** the 1,270 changed paragraphs need their modern-en `paragraphHashes` updated from `accepted-paragraph-hashes.tsv`.
   - **Mentions:** 1,869 of the 3,664 mentions fall in changed paragraphs.
     - 1,431 still have the same text. A new offset, found by occurrence rank, is suggested for each.
     - 408 now use the Garnett form of the name (Sonya→Sonia, Dunya/Dunia→Dounia, Svidrigailov→Svidrigaïlov, Razumikhin→Razumihin, -ich→-itch). A new text and offset is suggested for each.
     - **30 need manual review**, because the mention text or its occurrence count changed.
   - **Anchor offsets:** 42 offset anchors (`roleVisibleAt`, `firstMention` and snapshot `availableAt`) sit in changed paragraphs and need re-deriving.
   - All suggestions are conveniences computed by script and must be re-validated.
   - **Display names:** the card display names (for example "Sonya Marmeladova", "Dunya Raskolnikova", "Dmitri Razumikhin", "Porfiry Petrovich") are card content and were not changed here. They now differ in spelling from the edition text. Aligning them with the Garnett forms is a card-content decision for the owner of the cards.
   - The `threads.json` `searchNames` already include both spellings.
2. **Audio.** Changed paragraphs invalidate any legacy per-paragraph audio or timings for those coordinates, under the current architecture's cache and synchronization rules. Do not regenerate Kokoro audio, and do not block this text release on audio.
3. **Verify after publication:**
   - The served sha256 equals the accepted hash.
   - The structure is 41 chapters and 3,904 paragraphs, with per-chapter counts unchanged.
   - `python3 books/classify-modern-en.py crime-and-punishment --gate` reports PASS. Against the accepted file it reports weighted similarity 0.612, 41 REAL chapters and 0 truncated quotations.

## Decisions for Anders (logged, not blocking)

These are recorded here because the shared decision log was out of scope for this task.

| Paragraph | Decision |
|---|---|
| 4.4 | Garnett's racial slur ("a nigger on a plantation") is **not** restored. The text keeps "a slave on a plantation" and adds "a Latvian peasant with a German master". This is a deliberate exception to the no-softening rule; the meaning is preserved. |
| 6.3, 27.2 | "rich as a Jew" and "why on earth was I such a Jew?" are restored under the no-softening rule. They are the characters' prejudices. |
| 12.79, 33.20, 39.42 | Garnett's footnote paragraphs are kept for alignment and labelled "Translator's note: …", with no `[*]` marker. |
| 7.82 | "Them!" is kept, where Garnett prints "Hey!". |
| Whole book | Typography varies between chapters (`--` vs `—`; chapter 36 uses curly quotes) and is left as it is. |

## Evidence

- **`ASSESSMENT.md`:** the pinned inputs, the four side-by-side sample reads, the failure types F1–F7 with book-wide measurements, and the editorial approach.
- **`rounds/bNN/`** (b01–b13):
  - `F.json`/`F.md`: the fidelity review, with coverage and what was considered and rejected.
  - `A.json`/`A.md`: the blind accessibility review.
  - `V.json`/`V.md`: verification of every changed paragraph, plus the screening of each A item.
  - `AV-apply.json`: the edits actually applied.
  - `R*.json`/`R*.md`, `LEAD-R.md`: re-verification.
- **`rounds/assembly/`:** assembly edits, with independent verification (`V-assembly`) and re-check (`R-assembly`).
- **`rounds/LEAD-R-checks.md`:** the lead's phrase-by-phrase checks of the small corrections authored by re-verifiers.
- **`PROGRESS.md`:** the batch tracker and lead decisions.
- **`ACCEPTANCE-RECORD.md`:** full coverage, the whole-novel checks, the conventions, and the verdict.
