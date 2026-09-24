# Independent structural verification: Moby-Dick (2026-09-24)

Verifier scripts were written from scratch and are kept in the session scratchpad at `v/v1.py`, `v3.py`, `v4.py` and `v56.py`. No existing file was edited.

| # | Item | Verdict |
|---|---|---|
| 1 | Structural editions vs base | **PASS** |
| 2 | PARAGRAPH-MAPPING.tsv | **PASS** |
| 3 | Front-matter fidelity and emendations | **PASS**, with one evidence gap |
| 4 | Character-annotation impact | **PASS** |
| 5 | modern-da quotes | **PASS** |
| 6 | modern-en front matter shape | **PASS** |

## 1. Structural editions vs base: PASS

**Hashes**
- `base-original-en.json` is `30974242…c952`. It is identical to the live `moby-dick-original-en.json`.
- `base-modern-en.accepted.json` is `1a3f31bb…d52c`.
- `green-moby-dick/candidate.json` is still `1a3f31bb…d52c`, so it is frozen.

**Content, checked for both editions**
- There are 136 chapters and 2,429 paragraphs. The base has 2,432.
- Only chapters 56, 57 and 73 differ. In each one:
  - the new title equals the old title + " " + paragraph 0 with its final period removed;
  - paragraph 0 is removed;
  - the remaining paragraphs are identical and in the same order.
- The other 133 chapters are identical.

**Serialization:** re-serializing with `json.dumps(indent=2, ensure_ascii=False)` reproduces all four files byte for byte. None has a trailing newline.

**Titles against the raw source:** the reassembled titles match the TOC headings and the body headings in `pg2701.txt` (sha `907420db…`, lines 156, 159, 192, 10697, 10822 and 12765). The only difference is heading style: "CHAPTER n." becomes "Chapter n —".

## 2. PARAGRAPH-MAPPING.tsv: PASS

- Each edition has 67 rows. They cover the titles plus every old index in chapters 56 (0–8), 57 (0–11) and 73 (0–43), with nothing missing and nothing extra.
- I recomputed every `old_sha16` and `new_sha16` value (the first 16 hex digits of sha256) and every target index. There are 0 errors.

## 3. Front-matter fidelity: PASS, with one evidence gap

**Word order:** a token diff of `front-matter.original-en.json` against `evidence/pg2701-lines-336-843.txt` (3,600 tokens on each side) finds only five differences:
- the two unit titles, in place of "ETYMOLOGY." and "EXTRACTS.";
- the three listed emendations, at extracts paragraphs 12, 54 and 60.

**The emendations:** each one is backed by PG #15 and Standard Ebooks against PG #2701, so it has 2 of 3 witnesses.
- "Octher": PG #15 line 350, and `se-extracts.xhtml` line 54.
- "Spermacetti": PG #15 line 614, and SE line 299.
- "spout": PG #15 line 658, and SE line 360.

**Evidence gap:** the committed `evidence/pg15-frontmatter-excerpt.txt` has only 187 lines. It stops at Davenant, so it does **not** contain the Spermacetti or spout readings. I confirmed both from the full `pg15.txt`, whose sha `cca79713…` matches `SOURCE.md`. Recommendation: extend the excerpt through the end of Extracts, so that the committed evidence alone supports all three emendations.

**Other three-way variants:** no other variant should have been emended. In each case SE agrees with PG #2701, or the variant is a layout or heading artifact:
- "Purchas" against "Purchass";
- "colour" against "color";
- the omitted "different";
- the repeated headings and the placement of the subtitles.

**Note:** extracts paragraph 3 keeps the inner "EXTRACTS." sub-heading as a body paragraph. All three witnesses have this sub-heading, so this is acceptable, but Codex may prefer to render it as a heading.

## 4. Character-annotation impact: PASS

I checked `moby-dick.v1.json`, sha `dccdb35d…`, which matches the impact file.
- Mentions in chapters 56, 57 and 73:
  - 38 in original-en;
  - 36 in modern-en.
- My recomputed list of mention shifts (character, chapter, from, to, text) is exactly equal to the impact file's `shifts`.
- Nothing sits in paragraph 0: I found 0 mentions, 0 `ignoredContextMatches`, and 0 anchors or snapshots (checked recursively for `chapterNumber`) in these chapters.
- The `paragraphHashes` array lengths are 9, 12 and 43 in both editions.

**Caveat:** the modern-en package is pinned to the live modern-en file (`2ab04dd7…`), not to `1a3f31bb`. The proposal already says the modern-en count is indicative for that reason.

## 5. modern-da quotes: PASS

In the live `moby-dick-modern-da.json` (sha `208eb395…`, 136 chapters), the title and paragraph 0 of chapters 56, 57 and 73 match the proposal's backtick quotes exactly. Each proposed result equals title + " " + fragment with the final period removed.

## 6. modern-en front matter: PASS

- The unit ids and titles match the original-en file: `etymology`/"Etymology" and `extracts`/"Extracts".
- The paragraph counts match: 6 and 86.
- No paragraph is empty.
- The serialization style is the same as the original-en file.
- Spot checks at extracts paragraphs 0, 3, 12, 54, 60 and 85 are aligned.
