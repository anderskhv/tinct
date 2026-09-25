# Release packet — Odyssey modern-en accessibility successor (for PR #163)

**Status: the accessibility follow-up is complete and independently verified. Publication acceptance is NOT granted.** The unchanged similarity gate still fails (see `GATE-DISPOSITION.md`), so publication waits on Anders's explicit decision.

Nothing under `app/**`, the registry, live data, cards, audio or shared tooling was changed.

## Artifact

| | |
|---|---|
| Successor candidate | `edition/odyssey-modern-en.candidate.json` |
| sha256 | **`db6bfd23e97e1fe2eb0b2ce9926c36a665a996cfb024796ee0903e935931c9ce`** |
| Serialization | `json.dumps(indent=2, ensure_ascii=False)`, no trailing newline, the same format as `bd05c7f4…` and the live file. Size 607,791 bytes |
| Destination | `app/public/data/editions/odyssey-modern-en.json` |
| Replaces live | `813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc` (unchanged on main `1a7d89eb` and `945e15b21`) |
| Supersedes | PR #163's modern-en `bd05c7f43da64bfe4ad9908531f2a1434e79acc8635ca54cb1ad39942e9afc9c` (`claude/odyssey-modern-en-completion` `0a76d6ce`) |
| Reproducible from `bd05c7f4…` | Yes. Apply the 64 edits in `edits.json`; each `old` occurs exactly once in its paragraph. Independent verifiers reproduced the result byte for byte, in each round |
| Pairs with original-en | Option A `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` from `7994156f`, unchanged. See `OPTION-A-RECONCILIATION.md` |
| Structure | 24 chapters and 1,027 paragraphs; per-chapter counts and keys identical to `bd05c7f4…`, live and original-en |
| Titles | Identical to `bd05c7f4…`. The six title changes against live (Books 9, 17, 19, 20, 22, 23) are exactly the ones PR #163 already accepts |
| Changed paragraphs vs live | **1,011, exactly the same set as `bd05c7f4…`.** None of the 56 paragraphs this follow-up touched was identical to live |
| Changed paragraphs vs `bd05c7f4…` | 56, listed in `edition/changed-vs-accepted.tsv` with both hashes and edit IDs |
| Per-paragraph hashes | `edition/accepted-paragraph-hashes.tsv`. Same columns as the package file PR #163 checks: `chapter`, `paragraph_index`, `sha256_raw`, `sha256_prose_reader_v1`, with a trailing newline |

## What changes in `app/scripts/prepare-odyssey-release.py` (coding agent's work; nothing was changed here)

- **Candidate source.** Take modern-en from this folder at this package's commit instead of `0a76d6ce`: `books/wip/odyssey-accessibility-followup/edition/odyssey-modern-en.candidate.json`.
- **Hash pins.** Pin `db6bfd23…` in `HASHES["modern-en"]`. Take `accepted-paragraph-hashes.tsv` from this folder.
- **Original-en.** Keep taking it from `7994156f`. Its assertion that the cleanup copy equals the candidate must be dropped or pointed at this successor, because the cleanup package carries `bd05c7f4…` byte for byte.
- **Assertions that still hold unchanged:** `titles == [9,17,19,20,22,23]` and `len(changes) == 1011`.
- **Character cards.** Keep the same 30 explicitly rejected modern spans. They come from `character-card-impact.json` at `0a76d6ce`, are keyed on the live card and live text, and are unaffected by this successor. Then call `reanchor(…, allow_alias_changes=True)`.
  - A read-only dry run on this successor with main's unchanged `prepare-reviewed-editions.py` gave **632 retained, 0 dropped, 0 bad spans**.
  - **Identities match the `bd05c7f4…` result.** A count match alone does not show this, so each mention was projected through the text alignment in all 28 changed paragraphs that carry mentions (50 mentions), and each landed on exactly the same character and occurrence. The other 582 mentions, in unchanged paragraphs, are byte-identical. The one added name, "Zeus" at 3.23 (B03-03), is left unbound, and the existing Zeus mention there is unchanged. Details are in `card/character-card-impact-dryrun.json`.
  - The script's `impact["after_sha256"] == bd05…` check must be relaxed or re-pinned. The impact file itself is still valid, because its rejected spans live in the old text.
  - The original-en block and the Nestor-splice removal are unchanged.

## Changed paragraphs by Book (vs `bd05c7f4…`)

| Book | Paragraphs changed |
|---|---|
| 1 | 4 |
| 2 | 23 |
| 3 | 7, 19, 23 |
| 4 | 3, 8, 14, 26, 27, 28, 39, 42, 54, 57, 61, 64 |
| 5 | 1, 3, 5, 8, 19, 22, 23, 34, 36 |
| 6 | 8, 11, 20 |
| 7 | 6, 7, 12, 17 |
| 8 | 1, 2, 3, 15, 19, 20, 21, 41 |
| 9 | 36, 40 |
| 10 | 16, 22, 24 |
| 12 | 26 |
| 17 | 10 |
| 23 | 12, 16, 27 |
| 24 | 10, 14, 15, 20, 23 |

## User data, narration and migration

- **Paragraph identities are unchanged.** Saved positions, reading history and chapter shards keyed by paragraph index are unaffected.
- **Highlights, notes and cached narration.** The only paragraphs whose text differs from live are the same 1,011 that PR #163 already handles. Any migration or invalidation plan for those covers these too, and this follow-up adds no new affected paragraph.
- **Narration.** No audio was generated. `bd05c7f4…` was never published, so no cached speech exists for it. Serve the new text through the normal Grok streaming path.

## Verify after publication (if Anders approves)

- Served bytes: sha256 `db6bfd23…`; 24/1,027.
- Spot-check the reading:

  | ¶ | Should read |
  |---|---|
  | 5.5 | "whose business is in the waters" |
  | 10.24 | "she mixed a brew in a golden goblet" |
  | 4.14 | "I would have founded a city" |
  | 23.27 | "had had his fill both of his wife and of rest" |
  | 12.26 | "As long as the grain and wine held out" |

- Character cards resolve on both editions; 632 modern-en mentions.
- `python3 books/classify-modern-en.py odyssey --gate` prints the numbers in `GATE-DISPOSITION.md`. It will print **GATE FAIL** unless the depth pass happens first; that failure is the open decision, not a regression.
