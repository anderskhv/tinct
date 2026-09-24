# Provenance: Tinct Modern English translation of *Fear and Trembling*

**Edition label (proposed):** Tinct Modern English — translated from Danish
**Date:** 2026-09-24

## Source text

- **Work:** Søren Kierkegaard, *Frygt og Bæven. Dialektisk Lyrik*, published under the pseudonym Johannes de silentio (Copenhagen 1843). The author died in 1855, so the work is in the public domain worldwide.
- **Printed source used:** 3rd edition, C. A. Reitzel (Grøn), Copenhagen 1895. This is the Internet Archive item [`frygtogbvendial00kiergoog`](https://archive.org/details/frygtogbvendial00kiergoog), a Google Books scan from the University of California collection.
- **Raw OCR:** `books/raw/fear-and-trembling/raw.txt`, documented in `books/raw/fear-and-trembling/SOURCE.md`.
- **Reconstruction.** The served Danish (`original-da`, 232 slots) was reconstructed from the raw OCR and corrected. It was then **checked against all 152 page images**, including every restored passage, every footnote boundary and every uncertain OCR reading. The records are:
  - `source/CORRECTIONS.md`, which lists every correction, with raw-line references and the scan-verification addendum F1–F10;
  - `source/SCAN-VERIFICATION.md`;
  - `source/check_corrected_source.py`, a raw-collation check (result: PASS, 0 unexplained differences).
- **Structure.** Printed paragraphing (`source/PRINTED-PARAGRAPHS.md`). The final 184-paragraph Danish is `source/original-da-final.json`, staged for serving as `candidate/fear-and-trembling-original-da.candidate.json`.
- **Authorial versus other text.** Authorial text is:
  - the main text;
  - Johannes's 18 footnotes, kept separate;
  - the title-page subtitle, the pseudonym, the Hamann motto and the part title "Problemata" (all in `front-matter.json`).

  Running heads, page numbers, printer's signature marks and OCR debris are excluded; `CORRECTIONS.md` §2 lists them. Obvious misprints in the 1895 printing are emended and recorded as `emend:` entries. Greek accentuation is normalized editorially.

## Translation

- **Method:** a direct translation from the corrected Danish, drafted in ten parallel parts (A–J) plus the accepted pilot (Problema I–II). Each part went through these review rounds:
  - independent fidelity review against the Danish (R1);
  - applied fixes, then re-verification;
  - a readability review of the English only, from a newcomer's point of view (R1-readability);
  - applied wording fixes (R2), then re-verification against the Danish;
  - a whole-book consistency review (R3).
- **Independence.** Drafters were forbidden to consult any English translation: the served `original-en` and `modern-en`, and Lowrie, Hong, Hannay, Walsh, Payne, Kirmmse and Hollander (`DRAFTING-BRIEF.md`). The wording is independent. Overlap with the copyrighted Lowrie (1941) and Hong (1983) translations was **screened as a diagnostic** by counting shared word runs, with fixed formulas masked. Calibration: Lowrie and Hong share 3.8% of words in 12-word runs and 1.4% in 16-word runs. Passages with high overlap were re-rendered from the Danish when the result stayed accurate. They were not distorted to meet a number, and the runs that remain are forced by quotation, scripture or literal formulas; each part's `R*-applied` file records them. The screen does not establish legal clearance.
- **Quotations inside the text:**
  - Scripture is rendered freshly from the Danish.
  - The two German *Richard III* quotations (Schlegel's translation) are kept in German, each followed by Shakespeare's own public-domain English lines in brackets.
  - The Latin, Greek and French quotations are kept as printed, with an English rendering where the standard requires one.
- **Terminology** is set in `STYLE-AND-TERMINOLOGY.md`. It extends the accepted pilot's `TERMINOLOGY.md`.
- **The accepted pilot** (Problema I–II) is carried over from `../fear-and-trembling-clarity-pilot/final/candidate-final.json` (sha256 `1ffe55af…`). The only changes are the documented structural joins and the passages re-reviewed against the corrected source (`drafts/NOTES-P.md`, `reviews/R1-pilot-rereview*.md`).
- **No API spend.** Everything was produced in this CLI session. Nothing called `api.anthropic.com` and no generation scripts were used.

## Served English editions (context)

The served `original-en` ("Original (English)") is **not** a human or published translation. It is a 2026 AI translation (commit `b76fa5649`). No complete English translation is in the public domain: Lowrie's 1941 translation was renewed in 1969 (R458284). The evidence is in `../fear-and-trembling-clarity-pilot/PROVENANCE.md`. See `EDITION-PLAN.md` for the proposed retirement.
