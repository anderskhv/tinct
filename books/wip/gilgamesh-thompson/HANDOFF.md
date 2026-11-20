# Handoff: Gilgamesh rebuilt on R. Campbell Thompson (1928)

**Status:** content accepted by gates; ready for Anders' review of the coverage table and the Friedrich decision. Not integrated, not published.

- **Branch:** `content/gilgamesh-thompson`, from `origin/main` 5502a2e5e4 (16 Nov 2026).
- **Instructions read:** CLAUDE.md, AGENTS.md, `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md`, STRATEGY.md (language scope), `docs/workflow-boundaries.md`, and `books/wip/modern-da-quality-20261102/STYLE.md` for Danish.
- **Owned path:** only `books/wip/gilgamesh-thompson/`. No code, registry, `editionAvailability`, `app/public` data, push, merge, deploy or API call.
- **Prior work:** the v2 package (`origin/content/replace-gilgamesh-sonnet:books/wip/replace-gilgamesh-v2/`) was read for its method and gates; none of its text is used.

## Deliverables

| File | What | sha256 |
|---|---|---|
| `editions/gilgamesh-original-en.json` | Thompson's translation as printed. 12 chapters "Tablet I" ... "Tablet XII", 161 paragraphs, no embedded newlines. | `ec9136edf0eff6a7cf51806c468c2926b191dddad7ef7c2cd06c1a6a45e302ec` |
| `editions/gilgamesh-modern-en.json` | Fresh modern English, aligned 1:1, same titles. | `05cb382aad0432e5c211dd558d581903a0e858877a86604a709e5486fe2b8287` |
| `editions/gilgamesh-modern-da.json` | Fresh modern Danish (added at Anders' request, relayed by the coordinator on 16 Nov), aligned 1:1. Titles "Tavle I" ... "Tavle XII". | `7cca66d5ffc21e33c44696ad37a39d54bc47815713125554fd50e0dbc5ad6f3a` |
| `provenance-map.json` | Per paragraph: source tag, printed pages, column/line locator, Thompson's gap and editorial notes, kind, words, rights flag. Also lists the editorial conventions and the corrigenda applied. | `9f727ebc8a77895fb9046c13749b9395e8b220ab3be223dc384ee18a708e5c04` |

Supporting files:
- `SOURCE.md`: rights evidence.
- `STATUS.md`
- `gates-last-run.txt`: full gate output.
- `extracts/`: the OCR text and `download-manifest.json` with URLs and hashes.

## original-en: pure Thompson

**No non-Thompson paragraphs were added.** Every paragraph is Thompson's printed text, including the Old Babylonian passages he interpolates himself. The only typographic changes are listed in `provenance-map.json` "conventions":
- restoration brackets and footnote/line numbers are removed;
- gap dots are normalised to " . . . ";
- his italic section headings are dropped;
- his own corrigenda are applied.

Five paragraphs are Thompson's italic notes that print translated lines: V.5, VII.2, VII.3, VIII.1 and IX.5. The Scorpion-man / Road of the Sun journey in IX.5, for example, survives only in such a note. modern-en and modern-da render the story content of these notes, not their apparatus framing. That is why VII.3 falls to 0.71 of its source word count; it is the only paragraph below 0.75.

## Coverage table (paragraphs / words)

"Live" is the old Colavito-based text on main. v2 is the previous package.

| Tablet | Live original | Live modern-en | v2 original | v2 modern-en | **This original-en** | **This modern-en** | **This modern-da** |
|---|---|---|---|---|---|---|---|
| I | 21 / 2,299 | 21 / 2,087 | 6 / 275 | 6 / 246 | 24 / 2,359 | 24 / 2,217 | 24 / 2,077 |
| II | 33 / 2,009 | 33 / 1,765 | 37 / 2,232 | 37 / 2,202 | 8 / 854 | 8 / 838 | 8 / 763 |
| III | 19 / 1,390 | 19 / 1,245 | 10 / 500 | 10 / 465 | 18 / 1,963 | 18 / 1,867 | 18 / 1,719 |
| IV | 17 / 1,229 | 17 / 1,096 | 17 / 940 | 17 / 941 | 7 / 584 | 7 / 463 | 7 / 423 |
| V | 18 / 1,038 | 18 / 911 | 2 / 86 | 2 / 91 | 8 / 909 | 8 / 757 | 8 / 704 |
| VI | 19 / 1,492 | 19 / 1,261 | 16 / 1,027 | 16 / 969 | 17 / 1,460 | 17 / 1,338 | 17 / 1,242 |
| VII | 16 / 1,450 | 16 / 1,253 | 4 / 256 | 4 / 224 | 9 / 1,063 | 9 / 836 | 9 / 761 |
| VIII | 12 / 765 | 12 / 670 | 5 / 212 | 5 / 195 | 7 / 526 | 7 / 459 | 7 / 433 |
| IX | 15 / 852 | 15 / 693 | 7 / 387 | 7 / 369 | 8 / 773 | 8 / 683 | 8 / 607 |
| X | 27 / 2,125 | 27 / 1,866 | 10 / 720 | 10 / 654 | 18 / 1,718 | 18 / 1,543 | 18 / 1,458 |
| XI | 38 / 2,900 | 38 / 2,439 | 29 / 2,897 | 29 / 2,699 | 22 / 2,849 | 22 / 2,686 | 22 / 2,491 |
| XII | 18 / 1,296 | 18 / 1,153 | 9 / 760 | 9 / 708 | 15 / 1,134 | 15 / 1,094 | 15 / 988 |
| **Total** | **253 / 18,845** | **253 / 16,439** | **152 / 10,292** | **152 / 9,763** | **161 / 16,192** | **161 / 14,781** | **161 / 13,666** |

This package's modern-en is 90% of the live modern-en word count; v2 was 59%.

**Source per paragraph** (full detail per paragraph in `provenance-map.json`):

| Tablet | Sources |
|---|---|
| I | Thompson, Assyrian version (TH-A): 24 paragraphs |
| II | Thompson, Old Babylonian Pennsylvania tablet (TH-OB): 8 |
| III | TH-OB Yale tablet: 12; TH-A: 5; Assyrian restored from the Old Babylonian (TH-A+OB): 1 |
| IV | TH-A: 7 |
| V | TH-A: 5; Akkadian Boghazköy fragment in Thompson's note (TH-BOG): 1; **Hittite version via Friedrich/Ungnad (TH-HIT): 2** |
| VI | TH-A: 17 |
| VII | TH-A: 8; **TH-HIT: 1** |
| VIII | TH-A: 7 |
| IX | TH-A: 6; TH-OB Meissner/Berlin tablet: 2 |
| X | TH-A: 15; TH-OB Berlin tablet: 3 |
| XI | TH-A: 22 |
| XII | TH-A: 15 |

## Gates (on the final files; see `gates-last-run.txt`)

| Gate | Result |
|---|---|
| `books/classify-modern-en.py <abs>/editions/gilgamesh --gate` | PASS. Weighted similarity 0.329 (limit 0.75). All 12 tablets REAL-HEAVY; 0 light or mechanical; 0 identical long paragraphs. |
| `overlap-check.py` modern-en vs old live original + modern, `--allow original-en`, n=10 | 0/161 flagged |
| Same at n=8 | 0/161 flagged |
| original-en vs old live, n=10 (for information; original-en is exempt) | 0/161 |
| JSON shape `{"chapters":[{number,title,paragraphs}],"sections":[]}`, 12 chapters | Pass for all three files |
| 1:1 alignment, chapter by chapter | 161 = 161 = 161 |
| No embedded newlines | Pass (all three) |
| modern-en: no `[ ]`, `*`, `(?)` or round brackets | 0 paragraphs |
| modern-en word count ≥ 75% of original-en | 160/161 pass. VII.3 is at 0.71 (a printed editorial note; see above). |
| `!` count equal per paragraph, original-en vs modern-en | Pass for all 161 |
| Transcription check: original-en trigrams vs both OCR layers | 99.0% hit; misses are OCR artifacts |
| modern-da: Danish quotes »…« ›…‹, no English quotes, no apparatus, no English residue | Pass |
| modern-da length vs modern-en | Overall 0.92; one paragraph (XII.10) at 0.76, complete. |
| `books/danish-lint.py` | 0 findings. The tool hard-codes a Mac path, so it was run unmodified through a scratch wrapper that sets its `EDITIONS_DIR` to a temp dir: all live `*-modern-da.json` plus this candidate. |
| overlap-check modern-da vs old live `gilgamesh-modern-da.json`, n=10 and n=8 | 0/161 each. Also 0 with a tokenizer that handles æ/ø/å. |

**Where the gate scripts live.** `overlap-check.py` was copied to scratch from `origin/content/replace-gilgamesh-sonnet:books/wip/replace-gilgamesh-v2/overlap-check.py`; v2 took it from `origin/claude/busy-fermi-111knc:books/tools/overlap-check.py`. It is not committed here, to keep code out of the content folder.

**Spans flagged during writing.** When the overlap gate flagged shared runs, I rephrased my own sentences. To find them I printed only my own candidate wording, never the reference text. The flagged runs were stock formulas such as "Uruk with its high walls".

## Honest remaining gaps

1. **Thompson's text is fragmentary where the tablets are.**
   - Tablet IV is short (7 paragraphs; Columns II-IV are lost).
   - Tablet V has the dreams and the Hittite fight, but the Assyrian fight itself is lost.
   - Tablet VII's Column II exists only as Thompson's summary note.
   - Tablet VIII ends after the funeral preparations (Column VI lost).
   - Tablet XII has two gaps of about 17 and 25 lines.

   These are real 1928 lacunae. Nothing was invented. modern-en and modern-da end at a gap with an em dash, or use a short bridge clause only where Thompson's own text or note makes the meaning plain. Examples: "Along the way they met a man" (III.14, from his note); the Road of the Sun (IX.5).
2. **Siduri is present** (X.1-8, including her "fill your belly" speech), and so is the whole Flood. **Humbaba's defeat exists only in the Hittite (Friedrich-derived) paragraphs.** If those are dropped, Tablet V goes from the dreams straight to "they cut off the head of Humbaba".
3. **Two recensions, as Thompson printed them:**
   - Tablet II is entirely the Old Babylonian Pennsylvania tablet. Thompson notes that it repeats the dreams from Tablet I.
   - Tablet III is mostly the Old Babylonian Yale tablet, then the Assyrian Tablet III, so the elders' advice appears twice (III.13 and III.15/18).
   - Tablets IX-X interpolate the Old Babylonian Berlin tablet (Shamash, Siduri's philosophy, Ur-Shanabi's naming), so Siduri's and Ur-Shanabi's questions repeat.

   Each passage is a separate paragraph, in Thompson's order. A one-line book note in app copy is advisable ("Thompson fills gaps in the Assyrian tablets with passages from the older Babylonian version").
4. **Thompson's tablet order is his own** ("I have departed from the accepted order of several of the fragments"). Examples: Tablet III ends with a repetition of the elders' speech; Tablet IV's dream fragments.
5. **Names.** original-en uses Thompson's forms (Gilgamish, Erech, Uta-Napishtim, Ur-Shanabi, Nin-sun). modern-en and modern-da use Gilgamesh, Uruk, Utnapishtim, Urshanabi and Ninsun throughout. "Erech" becomes "Uruk" only in the modern editions.
6. **Readability of original-en.** Thompson's hexameters, round-bracket amplifications and gap dots read stiffly. That is expected for a "literal ... hexameters" edition. The registry label "Prose Compilation" no longer fits; suggest "Thompson (1928)".
7. **modern-da** follows the Danish style draft. It has passed the mechanical checks but **has not had a native Danish read or an independent fidelity review.** The style guide makes those final acceptance steps; do not represent them as done. Numbers are kept as Thompson gives them ("halvtreds mil", "fyrre mil"), as the style guide asks, without unit conversion. Ordinals for 40/60 use "fyrre/tres" to avoid the lint's archaic-number flag.

## Needs your decision (Anders)

**Keep or drop the three Friedrich-derived Hittite paragraphs** (V.6, V.7, VII.2): see SOURCE.md, rights doubt 1.
- Keep: US-clean, and the most complete story.
- Drop: clean under a strict EU life+70 reading for every contributor, but Humbaba's defeat and the gods' death sentence on Enkidu are lost.

The drop is an index deletion from all three editions plus the provenance map; nothing else depends on those paragraphs.

## What integration will need to regenerate

Paragraph content, counts and chapter titles all change, so nothing keyed to the old text is reusable:
- **Editions:**
  - Replace `app/public/data/editions/gilgamesh-{original-en,modern-en,modern-da}.json`.
  - Chapter titles change from "Tablet N - subtitle" to "Tablet N" / "Tavle N".
  - Registry `wordCount` (30000 → about 16,000).
  - The original-en edition `label` (e.g. "Thompson (1928)").
  - `danishTitles.ts` if it maps chapter titles.
- **Threads:** `app/public/data/editions/gilgamesh-threads.json` is keyed to the old paragraphs; regenerate it.
- **Characters:** check `app/public/data/characters/gilgamesh.v1.json` mentions and passage anchors against the new paragraphs. Shamhat is unnamed in Thompson ("the courtesan-girl, the hetaera"), and Siduri, Ur-Shanabi and the Scorpion-man are present.
- **Onboarding and intro:**
  - `app/public/data/onboarding/gilgamesh.json` and `gilgamesh.da.json`;
  - `app/public/lab/library_2/intro-data/gilgamesh.json` (author flap and intro: translator credit becomes R. Campbell Thompson, 1876-1941);
  - `app/src/data/prefaces/gilgamesh.txt`;
  - `books/raw/gilgamesh/SOURCE.md` (still documents the old source).

  Remove any Colavito attribution.
- **Narration:** Grok streaming caches for all three editions are stale. Do not reuse cached speech; `hasAudio` flags stay as the runtime contract decides.
- **SEO:** regenerate any `/read/gilgamesh` generated pages (`book.html` search head and text) from the new onboarding and text.
- **Readers' saved positions and highlights** in Gilgamesh point at old paragraph indices. Per the position invariants they must be validated against the new structure. Expect resets, since no reliable old→new mapping exists (different translation and paragraphing).
- **Book note** for the recension mix (gap 3).

## A modern-da step for later

Anders asked for it on 16 Nov, so modern-da is already done here. What remains for final Danish acceptance:
- a native Danish full read;
- an independent fidelity spot-check against Thompson;
- Danish onboarding (`gilgamesh.da.json`) rewritten for the Thompson text.

Note for whoever regenerates: modern-da is translated from this modern-en with Thompson beside it, so any later modern-en change must be mirrored by paragraph index.
