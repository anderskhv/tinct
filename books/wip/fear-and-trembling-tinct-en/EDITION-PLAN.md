# Edition label and retirement plan: Fear and Trembling

A proposal for Codex, who owns integration and publication. Nothing here has been applied. No registry entry, live edition, character card, onboarding, threads or audio file was touched.

## 1. Current live state (registry `FEAR_AND_TREMBLING`, served files)

| Key | Current label | What it actually is | Structure |
|---|---|---|---|
| `original-da` | Original (1843) | Kierkegaard's Danish from OCR of the 3rd ed. (Reitzel/Grøn 1895). It contains OCR errors, it is missing the two Attunement weaning passages, footnote text stands as body paragraphs, and page-break splits run through it | 232 slots |
| `original-en` | **Original (English)** | **Not a human or original translation.** It is an AI translation generated in 2026 (commit b76fa5649, "Add original-en edition"). No public-domain human English translation of the complete book exists: Lowrie's 1941 translation was renewed in 1969 (R458284), and Hong's 1983 translation is in copyright | 232 slots |
| `modern-en` | Modern English (hasAudio) | An AI modernization derived from the above | 232 slots |
| `modern-da` | Moderne Dansk (hasAudio) | An AI Danish modernization. Danish is out of scope as of 2026-09-21 | 232 slots |

The "Original (English)" label presents an AI text as a human original, which is misleading. This package corrects that.

## 2. Proposed edition set

| Key | File to serve | Proposed label | Notes |
|---|---|---|---|
| `original-da` | `candidate/fear-and-trembling-original-da.candidate.json` | **Original Danish (1843)** (or keep "Original (1843)") | The corrected, scan-verified text in the printed 184-paragraph structure. The printed source is the 1895 3rd edition. Footnotes are in `candidate/footnotes.json` (`danishText`). This is the fidelity anchor for the translation |
| `modern-en` | `candidate/fear-and-trembling-modern-en.candidate.json` | **Tinct Modern English — translated from Danish** | A new translation made directly from the Danish, with independent wording. It is paragraph-aligned with the new `original-da` (184 ↔ 184), `aligned: true` |
| `original-en` | none | **Retire** | Remove it from the registry's `editions`. Do not relabel it and keep serving it. It sits on the old 232-slot structure, so it cannot stay aligned with the corrected Danish. It carries known defects (see the pilot's `SOURCE-NOTES`, e.g. P-II ¶7/¶8 "comprehend", and the missing weaning passages). A relabel such as "AI English (2026)" would give readers two competing machine English texts. The file can stay in git history. Whether to delete it from `app/public/data/editions/` is Codex's cleanup decision |
| `modern-da` | none, or unchanged but unaligned | **Decision for Anders** (it deletes an edition, which means escalation) | It cannot stay `aligned: true` under the 184 structure. Danish is no longer a delivery requirement. The recommendation is to retire it with `original-en`. The only alternative that keeps it is to mark it `aligned: false` and disable its audio; this package does not recommend that |

After the change the book has one English edition. That fits the user's approval for this book: "an existing public-domain human English translation is not required", and the Danish remains the original. The default edition for English readers is `modern-en`.

## 3. Things that must move with the text (Codex)

1. **Paragraph structure (232 → 184).** Use `STRUCTURE-MAP.json` / `STRUCTURE-MAP.md` to migrate saved positions, highlights, notes and bookmarks. Chapter numbers 1–8 are unchanged.
2. **Footnotes.** There are 18 of them, in `candidate/footnotes.json`. Each has an `id`, an exact English anchor (`anchorAfterEn` plus `anchorOffsetUtf16` into the paragraph string) and the matching Danish anchor and text. The main text carries no markers. How the notes are presented (marker, pop-up, end-of-paragraph, or narration) is Codex's decision. The `[* Note: …]` form in `candidate/review/*.md` is a review format only.
3. **Section numerals and dividers.** These are the numerals I–IV in the Attunement and the Eulogy and the rules and asterisms. They are in `candidate/structure.json` as fields, not as text.
4. **Front matter.** `front-matter.json` holds the subtitle "A Dialectical Lyric", the pseudonym, the Hamann epigraph with a Tinct English rendering, and the "Problemata" part heading before ch4. Where these go is Codex's decision.
5. **Chapter titles.** The new English titles are in the candidate file: ch2 **Attunement** (served: "Exordium"), ch3 Eulogy on Abraham, ch4 Preliminary Expectoration, and the Problema titles as rendered from the Danish.
6. **Character cards.** `character-card-impact.json` has the details. All 10 mentions in each edition map into the new text. 7 are found verbatim and 3 need the variant string shown, for example "Abraham was greater than everyone" and "Understanding Hegel". Codex must:
   - re-anchor `modern-en` to the accepted hash (sourceSha256, paragraphCount 184, paragraphHashes, offsets, firstMention, roleVisibleAt, snapshot availableAt);
   - drop the `original-en` card edition when that edition is retired;
   - bump the release revision.
7. **Card, onboarding and threads wording.** These files are not edited here. They quote the old English wording or titles, and Codex, or a later content task, should align them with the new text:
   - "Exordium" (onboarding ×2, threads ×3) should become **Attunement**;
   - "Johannes de Silentio" (cards, onboarding ×6, threads ×7): the book prints *Johannes de silentio* with a lower-case s, and the new translation keeps that;
   - card `hegel` "Preliminary Expostulation" should become **Preliminary Expectoration**;
   - card `abraham` "greater than all" should become "greater than everyone";
   - card `johannes-de-silentio` quotes "Most respectfully, Johannes de Silentio"; check it against the new Preface wording.
8. **Audio.** `modern-en` and `modern-da` currently declare `hasAudio: true` with paragraph audio on the 232-slot structure. That audio no longer matches the text. Per the current audio rules, legacy audio is not a release prerequisite and is not regenerated here. Codex should set `hasAudio` false (or equivalent) for the new `modern-en` until the separately approved narration plan produces matching audio. No GPU or TTS work belongs to this package.
9. **Registry metadata.** `wordCount` is about 43,700 for modern-en. The description's "Johannes de Silentio" should become "Johannes de silentio".
