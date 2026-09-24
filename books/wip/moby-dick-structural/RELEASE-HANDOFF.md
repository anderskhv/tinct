# Release Handoff: Moby-Dick structural follow-up (split titles and front matter)

**Status:** Accepted, content-only, ready for Codex to decide the runtime structure and implement it.
- Nothing is published.
- No live edition, code, character package, audio, registry or tracker file was touched.
- No Danish text was generated.

> **This follow-up does not supersede or block the accepted modern-en text repair.** That repair (`books/wip/green-moby-dick/`, sha256 `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c`) is frozen and unchanged, and is queued with Codex on its own. It can ship first and alone. This package is built *on top of* it: `modern-en.structural.json` is the accepted text with only the three-title change applied. The two can ship in either order, as long as modern-en's structural change is applied to the accepted text.

## What this package does

1. **Reassembles three chapter titles** that the Gutenberg line wrap had split, and removes their fragment paragraphs. No content is lost; the fragment words move into the title:
   - 56: *Of the Less Erroneous Pictures of Whales, and the True Pictures of Whaling Scenes*
   - 57: *Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in Stone; in Mountains; in Stars*
   - 73: *Stubb and Flask kill a Right Whale; and Then Have a Talk over Him*
2. **Restores Melville's "Etymology" and "Extracts"** in original-en, from the verified public-domain source, with a faithful, independently reviewed Tinct modern-en counterpart.
3. **Proposes a runtime shape** that preserves every existing chapter identity (`STRUCTURE-PROPOSAL.md`, option A: a keyed `frontMatter` array, with chapters 1–136 unchanged). The decision belongs to Codex.

## Files and hashes

| File | Role | sha256 |
|---|---|---|
| `base-original-en.json` | Input: copy of live original-en | `30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952` |
| `base-modern-en.accepted.json` | Input: copy of the frozen accepted repair | `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c` |
| `original-en.structural.json` | Output: titles reassembled, 3 fragments removed (136 chapters, 2,429 paragraphs) | `6cd304e0cb723af093125c8a92d712cf25321251d344140d36f6bedd8ddeac63` |
| `modern-en.structural.json` | Output: the same change on the accepted text (136 chapters, 2,429 paragraphs) | `f3cc665021db5ace4459516373191d224c9ed450c635cdf450a6ea500fb943ea` |
| `front-matter.original-en.json` | Output: Etymology (6 paragraphs), Extracts (86) | `03e855762063bedfcccdeb0231f53a991c77622b1b50e5397327174497ce368e` |
| `front-matter.modern-en.json` | Output: aligned modern-en counterpart (6 and 86 paragraphs) | `3cca436f9d6cb1e6bd84203affafe0e0dc26686685fbfd4eecc034dd57501c15` |
| `PARAGRAPH-MAPPING.tsv` | Old-to-new mapping for every paragraph in chs 56, 57 and 73 in both editions, with hashes; all other chapters map to themselves | `b304b0266de72f47f90e63924470a5d96e08819cfdca35ef14a2ec2596e5bc2e` |
| `paragraph-hashes.tsv` | Per-paragraph and title hashes for all four output files | `32e78e8bb486209e927d90c16551d67d9d01eb01aac4acd3ad84fa86f12a544e` |
| `character-annotation-impact.json` | Character package impact, rule and every mention shift | `45507765edc6d8365b36fef01f389e87e7c1ed73a8e5ca9f2e680c4f4563bb33` |

Output JSON uses the live serialization: 2-space indent, UTF-8, no trailing newline.

## Source evidence (`SOURCE.md`, `evidence/`)

- **Base text:** Project Gutenberg #2701, sha `907420db…fef1a18b`. This is the same transcription as the live original-en body. The front matter is at raw lines 336–843, and the committed excerpt is `evidence/pg2701-lines-336-843.txt`.
- **Independent witnesses:**
  - Project Gutenberg #15 (1991), sha `cca79713…bbf8fc`; excerpt at lines 214–869, sha `58742eae…4e3`
  - Standard Ebooks (CC0) at commit `013b51e2d9d6bb28b1d054bfc30beeeff4b85480`: `etymology.xhtml` and `extracts.xhtml`
  - A three-way word-level comparison is in `evidence/three-way-variants.json`.
- **Emendations to #2701** (`evidence/emendations.json`), each made only where the other two witnesses agree against #2701:
  1. extracts: "Other or **Octher**'s verbal narrative" (#2701 repeats "Other")
  2. extracts: "…Extending the **Spermacetti** Whale Fishery" (the spelling of Colnett's title)
  3. extracts: "I saw his **spout**" (#2701 has "sprout")

  Where #2701 agreed with one witness ("Purchas", "colour", no "different"), it was kept.
- **Completeness:** every one of the 3,738 source words is present, in order. The only differences are the three emendations. This was verified by the lead and independently (`verification/structural-verify.md`).
- **Split titles:** the full titles match the #2701 table of contents and the body headings "CHAPTER 56.", "CHAPTER 57." and "CHAPTER 73.".

## Modern English: how it was made and reviewed

- **Brief:** `FM-BRIEF.md`, built on the accepted edition's `STYLE-BRIEF.md` and its Lead decisions 1–8.
  - Narrator prose is fully modernized.
  - Quoted prose is modernized sentence by sentence, keeping every fact.
  - Scripture and verse keep their wording and archaic pronouns (decision 8).
  - Attribution names and titles are kept as printed.
  - The etymology headwords are kept exactly, including the Hebrew with its bidirectional marks, and the Greek.
- **Review rounds:**

| Round | Scope | Result |
|---|---|---|
| Render | All 92 paragraphs, by 2 editors | `fm-round1/` |
| Fidelity | All 92, by 2 fresh source-based reviewers | Both PASS, with 2 non-blocking fixes (extracts.11, .59). `fm-round2/fa-fid.*`, `fb-fid.*` |
| Accessibility | All 92, by a candidate-only reviewer | 4 edits applied (extracts.2, .12 walrus gloss, .34, .70 balanced quote). `fm-round2/acc.*`, screening in `fm-round2/SCREENING.md` |
| Re-verification | All 6 changed paragraphs, plus a whole-file scan | **PASS**. `fm-round3/reverify.md` |
| Structural verification | Title change, mapping, completeness, emendations, character counts, Danish quotations | **PASS 6/6**. `verification/structural-verify.md` |

- **Change ledger:** `fm-ledger.jsonl` records every applied change.
- **Similarity to source** (informational; the gate covers chapters only): Etymology 0.67, Extracts 0.73.
- **Structural pair gate:** `books/classify-modern-en.py --gate` on the two structural files gives **GATE PASS** (0.727; 0 LIGHT or MECHANICAL chapters).
- **Other checks on the structural pair:** truncation audit 0; content-verify only the 6 known false positives.

## Compatibility requirements (summary; detail in `STRUCTURE-PROPOSAL.md`)

1. **original-en and modern-en:** apply the structural change together so they stay aligned.
2. **modern-da:** apply the same mechanical change, moving the existing Danish fragment into the Danish title and dropping paragraph 0 in chs 56, 57 and 73. The exact strings are listed; no new translation is needed. Danish front matter is out of scope: hide the units for modern-da, or fall back.
3. **Character package:** in chs 56, 57 and 73, shift `paragraphIndex` down by 1 (38 original-en mentions; 36 modern-en, pending re-anchoring to the accepted repair). Offsets are unchanged. Drop `paragraphHashes[ch][0]`, set `paragraphCount` to 2,429, recompute `sourceSha256` and bump the revision. No anchor is lost. The front matter needs no character data.
4. **User data** (positions, highlights, notes, edition patches): in chs 56, 57 and 73 only, map `p ≥ 1 → p − 1`.
5. **Narration and audio maps, timing artifacts, chapter shards, manifest and SEO chapter pages:** adjust for chs 56, 57 and 73 only. Threads are unaffected.
6. **Front matter under option A:** a new key namespace for positions and annotations. No existing key changes.

## Verdict

**ACCEPTED as a content package.** Source completeness, emendations, structure and alignment were verified independently. The modern-en front matter passed independent source-based fidelity review, candidate-only accessibility review and re-verification of every change. The runtime structure decision and all integration belong to Codex.
