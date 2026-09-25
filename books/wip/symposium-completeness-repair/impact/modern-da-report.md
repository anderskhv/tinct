# Danish edition (`symposium-modern-da.json`): findings and compatibility

The Danish edition was inspected as required. No Danish text was written, and no edition was changed or removed.

- **Baseline:** `app/public/data/editions/symposium-modern-da.json` at `main` `38a97c63`, sha256 `2a98c5281c40f5e309f8b33d5ad42661fad045b8b857142cfee0a2ab95a2b215`. It has 217 paragraphs, split 40/8/12/10/18/13/115/1, and is registered `aligned: true`.
- **Evidence:** a full paragraph-by-paragraph audit of all 217 Danish paragraphs against modern-en and Jowett at the same coordinate, by a separate auditor (`da-audit/DA-AUDIT.md`, per-paragraph record `da-audit/da-paragraph-audit.json`). Its two most consequential claims were re-checked directly: Danish 2.7 does read "Achilleus var elskeren, ikke den elskede — idéen om, at Patroklos var den elskede, er en tåbelig fejl…", and Danish 3.4 does open with English 3.5's "En elsker må bede, trygle, sværge eder…".

## Findings

1. **The same opening is missing.** Danish 1.0 is "APOLLODOROS: Ja, ven…", which matches English baseline 1.0. None of the Apollodorus–Glaucon opening exists in Danish.
2. **Same misplaced chapter-7/8 boundary.** Danish 7.69 "Da Sokrates var færdig…" through 7.114 is the Alcibiades episode, and chapter 8 is only the closing paragraph. The same 7.69/7.70 split is present ("Vil I drikke med mig eller ej?'").
3. **Chapter 3 is misaligned today, independent of this repair.**
   - Danish 3.3 merges English 3.3 and 3.4.
   - Danish 3.4–3.6 render English 3.5–3.7.
   - Danish 3.7–3.9 spread English 3.8 and 3.9 across three paragraphs.
   - A count check cannot see this, because the chapter still has 12 paragraphs.
   - It can be fixed by re-splitting the existing Danish at sentence boundaries, without new text; the recipe is in `da-audit/DA-AUDIT.md`. English 3.7's last sentence has no Danish equivalent at all.
4. **One reversal of meaning.** Danish 2.7 makes Achilles the lover, whereas English 2.7 makes Patroclus the lover. The paragraph then contradicts itself.
5. **33 condensed paragraphs:**
   - 3 major: 3.1, 5.3 and 5.4.
   - 7 moderate: 3.2, 4.2, 4.4, 5.6, 7.60, 7.62 and 7.105.
   - 23 minor.

   The larger omissions consistently remove the text's explicit references to love of youths and male–male desire.
6. **Typos and artefacts:** examples include "fortrolder" and the untranslated English "coy" in 7.98, and a stray `',` at the end of 3.0 that closes Pausanias's quotation early.
7. **Titles** agree with modern-en.

## What the English repair means for Danish

| Area | Effect if Danish is left as is | Can it be fixed without new Danish text? |
|---|---|---|
| Chapter 1 | English gains 9 opening paragraphs, so every Danish chapter-1 paragraph sits 9 slots early in Compare (Danish 1.0 beside English 1.0 "Concerning the things…") | **No.** Danish has no text for them. Placeholder or empty paragraphs would be stubs, which the content rules forbid |
| Chapters 7/8 | English chapter 8 starts at Alcibiades's arrival, while Danish chapter 8 is still only the closing, so chapter-level navigation between languages disagrees | **Yes.** The same `move` and `renumber` rows (`mapping/paragraph-map.tsv`, chapters 7–8) apply to Danish one for one with no text change. That needs a Danish reader-data remap (offsets unchanged) and re-keying of Danish per-paragraph audio and manifests |
| Chapter 3 | Already misaligned today (7 of 12 paragraphs) | **Yes, structurally,** by re-segmenting. That is a split/merge, so Danish annotations in 3.3 and 3.7–3.9 need offset-shifted migration and four Danish clips become stale. The missing content still needs new Danish |
| 2.7 reversal and omissions | Visible in Compare | **No.** They need new Danish text |

## Options (decision for Anders)

- **(A) Recommended.** In the same release as the English repair:
  - Set `modern-da` `aligned: false`.
  - Leave the Danish text and structure untouched.

  `aligned` controls only the Compare/split edition lists and cross-edition projection, so Danish stays fully readable as a primary edition. No Danish reader data or audio needs migrating. The registry stops claiming an alignment that is already false in chapter 3 and would become false in chapter 1.

  Readers whose saved Compare edition is Danish would see the default Compare edition instead. Their saved preference should not be overwritten.
- **(B)** Option A, plus apply the mechanical chapter-7/8 regroup to Danish so its chapter titles match its content. This costs a Danish data remap and audio re-keying for limited benefit while Danish is out of scope.
- **(C)** Reopen Danish scope. A Danish owner would translate the 9 opening paragraphs, re-segment chapter 3, correct 2.7 and restore the omitted content, after which Danish could be re-aligned. This is explicitly not started here.
- **Not recommended:**
  - Keep `aligned: true` unchanged. It would present a 9-paragraph offset in chapter 1 and the existing chapter-3 shift as aligned.
  - Insert placeholder paragraphs.

## Related Danish strings (flag only)

- The Danish thread text for `glaucon` in `symposium-threads.json` repeats the English error that Glaucon is the unnamed companion (see `proposed-threads-corrections.json`).
- `symposium.da.json` (Danish onboarding) was not assessed beyond noting that it is unaffected by the English repair.
