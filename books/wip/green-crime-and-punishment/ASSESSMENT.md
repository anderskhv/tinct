# Crime and Punishment modern-en: repair-need assessment

- **Date:** 2026-09-23
- **Book id:** `crime-and-punishment` · **Edition:** `modern-en`

## Pinned inputs

| Item | Path | sha256 |
|---|---|---|
| Source (fidelity anchor) | `source.json`, byte-identical to served `app/public/data/editions/crime-and-punishment-original-en.json`. Constance Garnett translation (1914), Project Gutenberg #2554 | `6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978` |
| Raw source text | `books/raw/crime-and-punishment/raw.txt` (see `SOURCE.md` there) | `943fb2b89ab6bb50c70922edac36471d1386e26b709fd0c93ce3a4e4857c624b` |
| Baseline (live modern-en) | `baseline-live-modern-en.json`, byte-identical to served `app/public/data/editions/crime-and-punishment-modern-en.json` at repo commit `a9dbee7e` (last content commit `8347c856`) | `914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834` |
| Character-card package (not modified) | `app/public/data/characters/crime-and-punishment.v1.json`, release revision `2026-09-12.1`; pins both source and baseline hashes | — |

## Existing repairs and reviews

These were searched for across `books/wip/`, all remote branches, `books/SESSION-NOTES.md`, `books/scan-report.md`, `books/MODERN-EN-REPAIR-STATUS.md` and `docs/`.

- **No earlier repair package or review exists for this book.**
- `SESSION-NOTES.md` (historical) reported a structural misalignment at ch36 p92. The current baseline no longer has it: 36.86–36.99 are aligned one to one with the source. That finding is superseded.
- The same notes reported a "severity 68" deep-scan score, attributed mostly to name transliteration. The name variance this assessment found confirms that attribution.

## Structure and screens (baseline)

- 41 chapters and 3,904 paragraphs. Numbers, titles, sections and per-chapter paragraph counts are identical to the source.
- There are no dialogue-start mismatches: every paragraph that opens with a quotation in the source opens with one in the baseline, which rules out paragraph drift.
- Median word ratio (modern/source) is 0.97.
  - 27 paragraphs of 15+ source words fall below 0.75.
  - 3 paragraphs are above 1.4, one of them 8.120 at 2.39.
- `classify-modern-en.py --gate`: **PASS**. Weighted similarity is 0.599, all 41 chapters are REAL or REAL-HEAVY, and 3 long paragraphs are identical to the source.
- `audit-truncation.py`: 16 flags. `content-verify.py` flags are almost all name transliterations.

These screens show that **the edition is a genuine modern rendering, not a mechanical cleanup, and it does not need wholesale rewriting.** The defects are targeted and are listed below.

## Side-by-side reads (required samples)

| Sample | Paragraphs | What it showed |
|---|---|---|
| Opening | 1.0–1.9 | Fluent and mostly faithful. There are small qualification drifts:<br>• 1.8 "did not realise this himself" became "did not fully admit this to himself", which alters his self-awareness.<br>• 1.2 "hypochondria" became "nervous collapse" (a new diagnosis), and "abject" was dropped.<br>• 1.4 "Jack the Giant-killer" was flattened to "fairy tales".<br>• 1.9 "sinking heart" became "heart pounding". |
| Central dialogue | 19.96–19.112 (Porfiry on the article) | Hesitation is systematically smoothed into certainty:<br>• 19.106 Raskolnikov's "I... I do." (on Lazarus) became "I do."<br>• 19.103 and 19.105 Porfiry's "And... and" is removed.<br>• 19.100 the self-interruptions "the right... that is not an official right" and "all... well, legislators" are removed.<br>• 19.109 "You don't say so...." became "I see.", which loses Porfiry's irony.<br>• 19.100 the italic _eliminate_, _in general_ and _a new word_ are dropped. |
| Psychologically dense | 8.0–8.5 (waking after the murder) | Faithful and vivid. There is only minor flattening. |
| Ending | 41.22–41.29 | The religious language (risen again, resurrection, Lazarus, New Testament) and the closing cadence are preserved. Drifts:<br>• 41.24 "He had even *fancied*" became "*noticed*" (imagined turned into observed).<br>• 41.25 "could not think for long together" became "think coherently".<br>• 41.25 and 41.28 lose the source's italic "_all_" and "_only_". |

## Failure types found (book-wide evidence)

| # | Type | Evidence | Scope |
|---|---|---|---|
| F1 | **Inconsistent names, patronymics and places** | The baseline mixes Garnett forms with modern transliterations:<br>• Dounia 161 / Dunya 93 / Dunia 18<br>• Razumihin 245 / Razumikhin 74<br>• Sonia 332 / Sonya 24<br>• Svidrigaïlov 33 / Svidrigailov 154<br>• -itch / -ich patronymics<br>• Hay Market / Haymarket; Mahomet / Mohammed; Tchebarov / Chebarov, and so on | Book-wide, 279 paragraphs |
| F2 | **Duplicated or invented content** | 8.120 appended the whole of source 8.121, which 8.121 also renders | Rare; each batch review checks for more |
| F3 | **Flattened character voice (register)** | In chapters 11–16 (Part 2 ch 4 to Part 3 ch 2) dialogue is uncontracted: 3–19% contractions against 85–98% everywhere else. Razumihin's drunken rush in 15.50 reads "I do not dare say why… Let us leave it at that… I am off!" | About 790 paragraphs in 6 chapters |
| F4 | **Hesitation, stammer and self-correction smoothed into certainty** | Ellipsis count is reduced in 369 paragraphs, heavily in ch 17–27. An explicit "X... X" stammer is lost in 28 paragraphs. | Mainly ch 17–27, scattered elsewhere |
| F5 | **Lost italic emphasis** | The source has 253 `_emphasis_` spans; the baseline has 70, lost across 146 paragraphs. The reader renders these as `<em>` (`app/src/lab/labEmphasis.tsx`) | Book-wide |
| F6 | **Qualification, certainty and motive drifts** | fancied→noticed, realise→admit, hypochondria→nervous collapse, and similar | Scattered; found only by full reading |
| F7 | **Softened period language and flattened references** | 6.3 "rich as a Jew" became "rich as a Rothschild"; 1.4 Jack the Giant-killer became "fairy tales"; 27.7 "the Darwinian theory" became "Darwin" | Scattered |

## Editorial approach

1. **Repair, don't rewrite.** Readable, faithful paragraphs stay as they are. Edits are minimal and local, each with a stated reason tied to F1–F7 or to the brief's four repair targets (missing or invented content; changed motive, qualification, chronology or meaning; unnecessarily hard syntax or vocabulary; unclear references on first listen).
2. **Names:** the source's Garnett forms are used throughout. This follows the protocol rule to preserve proper nouns and diacritics, the Frankenstein precedent, and majority usage in the baseline. Applied deterministically as Phase 0 (`ledger/changes.jsonl`, round `P0-names`) and verified by a not-in-source proper-noun scan.
3. **Preserve** psychological complexity, hesitations, repetition, uncertainty, emotional intensity, religious language, forms of address (patronymics, "Rodya", "Rodion Romanovitch", "Avdotya Romanovna", "Sofya Semyonovna") and each character's voice. Raskolnikov's reasoning must not become more coherent or certain than the source makes it.
4. **Not changed (documented convention, not a defect):**
   - Typography varies by chapter: `--` or `—`, and chapter 36 uses curly quotes where the rest uses straight quotes. Readers and listeners do not notice this. Normalizing it would touch about 1,500 paragraphs and every character-card offset for no reading gain.
   - American spelling and "rubles" are used.
5. **Process per batch:**
   1. An independent source-based fidelity and repair review of every paragraph pair.
   2. The lead applies the fidelity repairs.
   3. A separate candidate-only accessibility review (the reviewer never sees the source).
   4. An independent source-based verifier checks every applied change and screens every accessibility proposal against the source.
   5. The lead applies the accepted proposals and corrections.
   6. Any correction is re-verified.
   7. Progress is committed.
