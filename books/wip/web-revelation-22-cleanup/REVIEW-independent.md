# Independent review — WEB `web-en` Revelation 22 Gutenberg-trailer removal

Reviewer: independent adversarial review (Claude), 2026-09-24. Read-only against the repo. This is the only file written here. Scratch work is under the session scratchpad `review-rev22/`. No Anthropic API calls were made.

## Scope

Artifact: `books/wip/web-revelation-22-cleanup/` (RELEASE-PACKET.md, prepare.py, out/*). The claim under review: the live `app/public/data/editions/bible-web-en.json` has the Project Gutenberg #8294 trailer appended to chapter 1189 (Revelation 22), paragraph 4. The candidate removes only that trailer and keeps all 21 verses verbatim. The packet also gives a verse→offset map and the character-card impact.

## Method

I wrote my own checks in Node and Python. I did not run `prepare.py` or rely on its output.
- I downloaded `pg8294.txt` and compared its hash and header.
- I parsed the live and candidate JSON and compared every chapter, including all keys, every paragraph and the top-level `sections`.
- I byte-diffed the two files using a common prefix and suffix.
- I parsed Revelation 22 from Gutenberg (`022:NNN` lines), removed the `{…}` notes, collapsed whitespace and compared each verse with the candidate verse spans.
- I recomputed the verse label, start and end offsets with a superscript-label regex on JS strings, which gives UTF-16 offsets.
- I reimplemented the chapter/manifest serialisation from `app/scripts/split-edition-chapters.cjs` in memory. It read only the candidate and wrote nothing, and I compared the result with the live shard directory.
- I reimplemented the runtime card validation from `app/src/services/characters/characterCards.ts`: `normalizeParagraph`, then sha256 of the UTF-8 bytes, `sourceSha256`, mention slices and character points.

## Results per check

1. **Source.** The download is 4,797,039 bytes, sha256 `abf7c2da…fe7d`, which matches the pin. The header reads "The Project Gutenberg eBook of The World English Bible (WEB), Complete", with Title "The World English Bible (WEB), Complete" and "[eBook #8294]". PASS. In Gutenberg, only blank lines sit between 022:021 and the END marker.
2. **Candidate vs live.**
   - The top-level keys are the same (`sections`, `chapters`). `sections` is identical, and there are 1189 chapters in both files.
   - The only differing field in the whole edition is chapter 1189, paragraph 4 (18,247 → 67 UTF-16 units). Titles, sections and all other paragraphs are identical.
   - The byte diff is one contiguous deletion of 18,284 JSON bytes right after `…saints. Amen.`. The shared prefix is 4,407,032 bytes and the shared suffix is 21 bytes.
   - The removed span is `" *** END OF THE PROJECT GUTENBERG EBOOK THE WORLD ENGLISH BIBLE (WEB), COMPLETE *** Updated editions…"`. It is one separator space followed by text that starts at the END marker.
   - With whitespace normalised, the removed text equals Gutenberg from the END marker to EOF (18,179 characters each). I read it. It is the license trailer: Sections 1–5, trademark, donations and newsletter text. It contains no superscript verse labels and no `NNN:NNN` references.
   - The kept paragraph is exactly `²¹ The grace of the Lord Jesus Christ be with all the saints. Amen.`
   - All 21 verses match Gutenberg once the `{…}` notes are removed. Verse 1 is the only one with a note: `{TR adds "pure"}`.
   - Chapter 1189 still has 5 paragraphs and 21 verse labels.

   PASS.
3. **Verse mapping.** My recomputed label, start and end values match all 21 rows of the RELEASE-PACKET table. They also match `change-record.json` `verseMapping` on ref, paragraph, labelStart, start, end and `textSha256`, with 0 mismatches. Only REV.22.1 lists apparatus. Paragraphs 0–3 are unchanged, and paragraph 4 starts identically. PASS.
4. **Shard.** My reimplementation of the script's serialisation (`JSON.stringify({number,title,[section],paragraphs})+"\n"`) on the candidate reproduces `out/ch1189.candidate.json` byte for byte. Across all 1,189 chapters, `ch1189.json` is the only shard that would differ from the live directory. The regenerated `manifest.json` matches the live one byte for byte, with `paragraphCount` still 5. `out/baseline-ch1189.json` matches the live shard (`e8bb0cb2…d6e0`). PASS.
5. **Character cards.**
   - The runtime convention is sha256(UTF-8(`normalizeParagraph(p)`)), where `normalizeParagraph` replaces `\n` with a space and collapses runs of spaces. Plain sha256 of the raw text happens to disagree in 5 paragraphs elsewhere (990/7, 1026/7, 1033/6, 1042/1, 1062/5), which contain double spaces. Using the real convention, every chapter's hashes match the live edition.
   - Paragraph 1189/4 has no double spaces or newlines before or after the change, so the normalized hash equals the raw hash. The old hash `9401d3e2…1e01` matches the stored value, and the new one is `7c307a62…4f34`.
   - Old `sourceSha256` is `46d20663…eeae`. The candidate hash is `b0f49165…62aa`.
   - With only those two values substituted, the candidate passes full validation: all chapter hash arrays match, all 1,437 mentions resolve, and there are 0 invalid character points.
   - Chapter 1189 has 4 mentions: jesus ¶4 25–30, john-apostle ¶1 277–281, god-the-lord ¶3 554–557 and the-lamb ¶0 387–395. All resolve at unchanged offsets. No character point falls in chapter 1189.

   PASS.
6. **Live files untouched.**
   - `git diff app/` is empty, and `git status` is clean. HEAD `b99fda2b`, committed during this review, adds files only under `books/` and `DECISIONS.md` and touches nothing in `app/`.
   - The live edition and shard still have the baseline hashes.
   - The candidate edition has no match for /gutenberg/i, `***`, /ebook/i, /license/i, `www.` or `http` in any paragraph, chapter title or section. In the live edition, only 1189/4 matches.
   - Searching the repo for the END-marker phrase finds only the live edition, the live shard and this package. `qa/reports/structural-report.json` holds only a warning with an 80-character preview for `web-en ch1189/p5`, not the trailer itself.

   PASS.
7. **Packet claims.**
   - All stated SHA-256 values and byte counts are correct: live edition 4,425,337, shard 21,214, candidate 4,407,053, candidate shard 2,930, removed-text `fd4d478b…d1bc`, and both paragraph hashes.
   - The BSB README quote exists on `origin/codex/bsb-staging-20260921` (README line 49).
   - `web-en` has `hasAudio: true` in `bookRegistry.ts`.
   - The linked audio doc exists.

## Defects

**Blocking:** none.

**Should-fix (packet hygiene; does not affect candidate bytes):**
- S1. Under "Reproduce", the packet runs `sha256sum -c SHA256SUMS`, but no `SHA256SUMS` file exists and `prepare.py` does not write one. Either add the file (for the out/* hashes listed in the packet) or change the step to use the hashes in `change-record.json`.
- S2. The status line gates integration on "[REVIEW.md](REVIEW.md) records acceptance", but no `REVIEW.md` exists. This review is `REVIEW-independent.md`. Update the link, or have the integrator treat this file as the gate.

**Notes:**
- N1. The removed span is 18,180 UTF-16 units (67–18,247), and it includes the separator space. `removed-text.txt` and its sha256 cover only the 18,179 characters without that space. The packet says so, but a consumer who checks `utf16End − utf16Start` against `chars` will find a difference of one.
- N2. The packet says the character-card hashes are paragraph hashes but does not name the normalisation (`prose-reader-v1`, meaning `normalizeParagraph` before sha256). The stated values are right because 1189/4 contains no double spaces. Naming the convention would stop an integrator from recomputing raw hashes elsewhere and hitting the 5 unrelated paragraphs where raw and normalized hashes differ.
- N3. The sentence "Across the repository the text appears only in … `qa/reports/structural-report.json`" is loose. The report holds a preview and a warning, not the trailer.
- N4. The Gutenberg file is mutable ("Most recently updated: December 26, 2020"). Its hash matched today (2026-09-24).

Verdict: ACCEPT
