# Jane Eyre caption cleanup: independent review

Reviewer: independent verifier (Claude), 2026-09-24. I did not run any package scripts. The only file I wrote is this one.

## Method
- Pulled both inputs with `git show d47d80f8…:books/wip/green-jane-eyre/{source,candidate}.json`. Their sha256 hashes match the expected values (055aad5e… / 5e270560…).
- Read `books/raw/jane-eyre/raw.txt` (PG #1260). This text has no `[Illustration]` markers. Each caption is a separate block that follows two or more blank lines, repeats a nearby line, and usually has no final punctuation. To check completeness, I listed every block in the body (CHAPTER I to END) that follows two or more blank lines. I also scanned the source JSON in two ways:
  - paragraphs whose normalised text is contained in a paragraph within ±4 positions;
  - paragraphs with no terminal punctuation.
- Rebuilt the expected output as the input minus the 13 listed coordinates, then compared it with the package outputs one paragraph at a time. I also checked chapter metadata, the serialization format, CHANGES.json and paragraph-map.tsv against that rebuild.

## Claim 1: the 13 deletions are PG captions. PASS
In raw.txt, each of the 13 follows a double blank line and repeats text from its neighbours. Raw line numbers:
- 4.83 → l.1569
- 12.46 → l.5198
- 15.45 → l.6802
- 18.92 → l.8811
- 19.78 → l.9139
- 25.83 → l.13146
- 28.6 → l.14928
- 28.51 → l.15189
- 28.117 → l.15513
- 33.92 → l.17750
- 34.114 → l.18683
- 36.53 → l.19795
- 38.17 → l.20978

For all but 38.17, the full text of the caption appears in the neighbouring paragraph, allowing for normalisation such as fore-feet/forefeet and "What is it? and" vs "What is it and". 38.17 is the same text as 38.16 without the quotation marks.

## Claim 2: the set is complete and no narrative was deleted. PASS
Only these blocks follow a double blank line and are not chapter openings or section breaks:
- the 13 captions above;
- 37 l.20248 "You are altogether a human being, Jane? …". This is a caption, but the pinned source JSON already omits it: source 37.87 is the quoted narrative line, and 37.88 is "I conscientiously believe so…". Nothing remains to remove.
- "It was dated three years back." (ch.21), "I soon forgot storm in music." (ch.32) and the John Eyre letter close. These are genuine section-break narrative, and all of them were kept.

The duplicate and missing-punctuation scans found no other candidates. The rest were repeated short dialogue lines ("Yes, sir.") and 34.150 "He had done. Turning from me, he once more". That last one is genuine text that runs into the verse line "Looked to river, looked to hill." (raw l.18914), and it was kept. All 13 deleted paragraphs are captions.

## Claim 3: the modern-en content is still present, and the 36.53 fold is faithful. PASS
For the other 12 deletions, the modern neighbour that was kept already contains the caption's content:
- 4.82, 12.45, 15.43, 18.91, 19.79, 25.82, 28.5, 28.50, 28.116, 33.91, 34.113, 38.16.

At 36.52, the input ended "…she yelled and gave a leap—\"". The output ends "…she yelled and gave a leap, and the next moment she lay smashed on the pavement.\"". The first 716 characters are unchanged. Only the dash and closing quote were replaced, by ", and the next moment she lay smashed on the pavement.\"". This matches source 36.52 ("gave a spring, and the next minute she lay smashed on the pavement.”") and follows the deleted modern 36.53 ("The next moment…"). Nothing else was added.

## Claim 4: everything else is byte-identical, in order, with counts aligned. PASS
- For original-en, the output equals the input minus the 13 paragraphs exactly.
- For modern-en, it equals the input minus the 13, with 36.52 as the only other difference.
- Both editions still have 38 chapters, and the chapter keys and titles are unchanged.
- Per-chapter paragraph counts match between the editions. Each edition has 4034 paragraphs, down from 4047.

## Claim 5: no narrative lost, duplicated or invented. PASS
This follows from claims 1–4. The 36.52 fold restores a clause that the modern input had moved into the caption. It adds nothing new.

## Claim 6: serialization convention. PASS
Both outputs equal `json.dumps(obj, indent=2, ensure_ascii=False)` exactly, with no trailing newline. The inputs follow the same convention.

## Other observations (not defects in this change)
- CHANGES.json has 27 records: 13 deletions per edition plus 1 modern edit. Every `before` field matches the pinned input, and the edit's `after` field matches the output.
- My rebuild matches paragraph-map.tsv exactly: 13 deletions, the correct renumbering, and no extra or missing rows.
- The map lists 36.52 as `keep` with offset 0. That is correct for positions 0–715. However, a modern-en annotation anchored at or after character 716 of 36.52 (the old "—\"" tail) would point into the new text.
- Pre-existing issue, not introduced here: modern-en 34.113–34.115 still use curly quotes and `_can_` markup, unlike the rest of the modern edition.
- The HASHES.sha256 entries for the jane-eyre JSON files match the files on disk.

VERDICT: VERIFIED
