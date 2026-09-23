# Acceptance record: Crime and Punishment (Dostoevsky, trans. Garnett), modern-en

**Book:** `crime-and-punishment` · **Edition:** `modern-en` · **Date:** 2026-09-23

## Inputs and output

| | Path | sha256 |
|---|---|---|
| Source (fidelity anchor) | `source.json`, byte-identical to served `crime-and-punishment-original-en.json` (Garnett 1914, Gutenberg #2554) | `6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978` |
| Raw text | `books/raw/crime-and-punishment/raw.txt` | `943fb2b89ab6bb50c70922edac36471d1386e26b709fd0c93ce3a4e4857c624b` |
| Baseline (live modern-en) | `baseline-live-modern-en.json`, byte-identical to served `crime-and-punishment-modern-en.json` | `914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834` |
| **Accepted candidate** | `candidate.json` | **`18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb`** |

### Source completeness

`source.json` was compared word by word against the raw Gutenberg text.

- It contains no text that is not in the raw file.
- The only raw text it omits is apparatus:
  - the title page and Garnett's 810-word translator's preface;
  - the "PART / CHAPTER" headings, which are carried as chapter titles.

## Why this was a repair, not a rewrite

`ASSESSMENT.md` records the evidence.

- The baseline was already a genuine modern rendering: gate PASS, weighted similarity 0.599, 41/41 chapters REAL.
- It was structurally aligned (3,904/3,904 paragraphs, with no dialogue drift), and the historical ch36 misalignment was already fixed.

Side-by-side reads of the opening, the Porfiry article dialogue, the aftermath of the murder and the ending, followed by a review of the whole novel, found targeted defects:

| Failure type | Description | Scope |
|---|---|---|
| F1 | Inconsistent name, patronymic and place forms | 279 paragraphs |
| F2 | Duplicated or invented content | 8.120 duplicated 8.121, plus 57 invented details found in review |
| F3 | Uncontracted, stiff dialogue in ch 11–16 | 462 contraction repairs |
| F4 | Hesitation and stammer smoothed into certainty | 247 repairs |
| F5 | Italic emphasis lost | 253 spans in the source, 70 in the baseline, 257 in the candidate (the extra 4 are italic glosses or foreign phrases) |
| F6 | Qualification, certainty and motive drift | 79 certainty and 212 meaning repairs |
| F7 | Softened period language and flattened references | 34 repairs |

Readable, faithful paragraphs were left alone: 2,634 of 3,904 paragraphs are byte-identical to the baseline.

## Review coverage (no sampling)

Every stage wrote its own files under `rounds/`, and every edit is in `ledger/changes.jsonl`. The ledger holds 1,963 entries, and replaying it from the baseline reproduces `candidate.json` byte for byte.

**Stages of review:**

1. **F:** an independent source-based fidelity and repair review read every paragraph pair of its batch in order. Together the 13 batches cover all 3,904 paragraphs.
2. **A:** a separate candidate-only accessibility review. The reviewer never saw the source, and it read every paragraph of its batch.
3. **V:** an independent source-based verifier checked every changed paragraph in the batch (1,229 in total, 100% coverage audited), and screened every A proposal against the source.
4. **R:** wording authored by a verifier was re-verified by a different agent or by the lead. The lead checks are listed in `rounds/LEAD-R-checks.md` and `rounds/b11/LEAD-R.md`.

| Batch | Chapters | Paras | F proposals (blocking) | A proposals (blocking) | V: changed paras checked | V defects | A accept/modify/reject | Re-verification | Result |
|---|---|---|---|---|---|---|---|---|---|
| b01 | 1–6 | 340 | 85 (12) | 8 (1) | 67 | 2 | 4/0/4 | lead | accepted |
| b02 | 7–9 | 332 | 48 (13) | 13 (0) | 71 | 3 | 9/2/2 | R: clean | accepted |
| b03 | 10–12 | 316 | 238 (5) | 7 (2) | 131 | 2 | 3/1/3 | lead | accepted |
| b04 | 13–14 | 364 | 186 (6) | 9 (1) | 139 | 2 | 6/2/1 | lead | accepted |
| b05 | 15–17 | 311 | 160 (15) | 15 (1) | 129 | 1 | 3/1/11 | lead | accepted |
| b06 | 18–20 | 360 | 120 (31) | 12 (1) | 89 | 7 | 8/1/3 | R, then 2 hedge fixes checked by lead | accepted |
| b07 | 21–23 | 299 | 124 (15) | 14 (2) | 87 | 5 | 6/2/6 | R, then 1 fix checked by lead | accepted |
| b08 | 24–25 | 315 | 130 (26) | 8 (1) | 88 | 2 | 5/0/3 | R: clean | accepted |
| b09 | 26–29 | 317 | 139 (20) | 10 (3) | 99 | 1 | 3/4/3 | lead | accepted |
| b10 | 30–31 | 280 | 71 (14) | 5 (0) | 63 | 3 | 2/2/1 | R, then R2 on 30.134, then 3 fixes checked by lead | accepted |
| b11 | 32–35 | 265 | 113 (13) | 10 (1) | 106 | 1 | 5/2/3 | lead | accepted |
| b12 | 36–38 | 269 | 51 (8) | 12 (0) | 106 | 0 | 5/3/4 | R, then 3 fixes checked by lead | accepted |
| b13 | 39–41 | 136 | 71 (19) | 8 (1) | 55 | 4 | 5/1/2 | R, then 3 fixes checked by lead | accepted |
| **Total** | 1–41 | **3,904** | **1,536 (197)** | **131 (14)** | **1,229** | **33** | 64/21/46 | | |

The **assembly round** covered typography, the translator's-note convention, a gate fix at 7.34 and fiancé accents.

- 13 edits were checked by an independent verifier (`rounds/assembly/V-assembly.*`). It found 2 defects, including a blocking ambiguity at 7.34 that the lead's own gate fix had introduced.
- The fixes were applied and re-checked by the same independent verifier, which reported them clean (`R-assembly.*`).

## Whole-novel checks after assembly

- **Structure:** 41 chapters with numbers, titles and sections identical to the source, and 3,904 paragraphs with per-chapter counts identical. The text contains no empty, untrimmed or newline-containing paragraphs.
- **Dialogue alignment:** 0 paragraphs where the source and candidate disagree on opening with a quotation.
- **Names:** no proper noun remains in a form absent from the source, apart from ordinary words and accurate glosses (Marie Antoinette, Latvian, August, Dussaut's).
- **Forms of address:** consistent (Rodya, Rodion Romanovitch, Avdotya Romanovna, Sofya Semyonovna, and so on).
- **Terminology:** motif counts match the source for louse (14), Napoleon (13), Lazarus (7), New Jerusalem (2), yellow ticket/passport (5), Hay Market (20), Siberia (15), and Porfiry's and Luzhin's "he-he", which was restored where the source has it.
  - Where "overstep" is rendered "cross the line" (17.39, 22.65), the meaning is preserved. The explicit "overstep" and "step over" remain in Raskolnikov's article (19.100) and in Svidrigaïlov's echo (36.59).
- **Typography:** each chapter's dash style is uniform. Chapter 36 keeps its curly quotes. There are no unbalanced `_emphasis_` markers.
- **`classify-modern-en.py --gate`:** PASS. Weighted similarity is 0.612, all 41 chapters are REAL, and there are 0 truncated quotations. (The only interim failure, at 7.34, was fixed.)
- **`audit-truncation.py`:** 14 screening flags, down from 16:
  - 3.13, 3.21, 3.36, 5.42, 7.62
  - 17.42, 18.15
  - 19.68, 19.96, 19.157
  - 30.29, 33.37, 38.45, 38.60

  Each one was read in full, side by side with the source, by its batch's fidelity reviewer, who read every paragraph; a flagged paragraph that was also changed was checked again by the verifier. None is an omission: all are short lines with natural compression. The length and similarity screens were used as aids only.

## Conventions and lead decisions

- **Names:** the source's Garnett forms are used throughout (Dounia, Razumihin, Sonia, Svidrigaïlov, -itch patronymics, Hay Market, Mahomet, Tchebarov, and so on).
- **Source inconsistencies are kept, not corrected:**
  - Vassily and Afanasy Ivanovitch Vahrushin (3.38 vs 3.39 and 4.6).
  - "two days" and "three days" (19.160 vs 20.16–17).
  - Dounia's "Mama" and "Mother".
  - The peasant and porter in 39.74–75.
  - Luzhin's letter as quoted back in 17.124.
- **Translator's notes** (12.79, 33.20, 39.42) are kept as the source's own paragraphs for alignment. Each is labelled "Translator's note: …" and has no inline `[*]` marker.
- **13.20:** the live edition's line break inside the song was removed, since the source has none. The edition now contains 0 newlines.
- **7.82:** "Them!" is kept, where Garnett prints "Hey!". It is clearer and matches the Russian, and "Hey!" would misattribute the shout.
- **Period language** follows the protocol's no-softening rule:
  - 6.3 "rich as a Jew" and 27.2 "why on earth was I such a Jew?" are restored. These are the characters' prejudices.
  - **4.4 exception:** Garnett's racial slur is *not* restored. The text reads "a slave on a plantation or a Latvian peasant with a German master"; the meaning is preserved and "Lett" is glossed. **This is flagged for Anders.**
- **Foreign phrases:** kept where the source keeps them, with a brief gloss only where a listener would otherwise be lost. Several reviewers' glosses were rejected as redundant or out of voice.
- **Accepted typographic variation:** `--` vs `—` between chapters, and chapter 36's curly quotes.

## Verdict

**ACCEPTED — ready for release handoff.**

- A full independent source-based fidelity review and a separate candidate-only accessibility review cover all 3,904 paragraphs.
- Every changed paragraph was independently verified against the source, and every correction authored by a verifier was re-verified.
- The whole-novel structural, terminology and gate checks pass.

No passage is blocked by an unresolved dependency.
