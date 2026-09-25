# Inventory: what was audited, pinned hashes, checks performed and limits

**Audit:** source completeness of Tinct's served inventory, looking for defects of the kind found in Symposium: authorial text missing from the served source edition, and therefore from its translations; misplaced text; misleading labels; and non-work text served as reading text.

**Audited commit:** `main` `1a7d89ebd816af8a2ac18239010c34fab4bf48c5`. **Date:** 2026-09-25. **Package:** `books/wip/inventory-completeness-audit/`.

**Package contents:**

- `INVENTORY.md` (this file)
- `CONFIRMED-DEFECTS.md`
- `NEEDS-INVESTIGATION.md`
- `EXISTING-REPAIRS.md`
- `HANDOFF.md`
- `reports/G01–G11.{md,findings.json}`: the first-pass audit, with disjoint book groups and one auditor each
- `verification/V01–V11.{md,json}`: the independent second review

Scripts used (the coverage comparator, screening and the short-paragraph test) stayed outside the package, as the book-task workflow requires. Their method is specified below so the results can be re-derived.

## Result at a glance

| Status after verification | Books |
|---|---|
| Defects in the served source edition (S1–S3, confirmed) | 46 |
| Source complete; defects only in modern-en or modern-da | 8 |
| Source complete; S4 cosmetic items only | 33 |
| Source complete; nothing found | 13 |
| **Total live books** | **100** (305 editions) |

"Source complete" means **COMPLETE-VS-SOURCE**: the whole text was aligned against the matched public-domain source edition, and every remaining difference was explained (headings, editorial apparatus excluded by scope, edition-variant wording). It is a **full comparison against that source edition**, not a claim that the translation or modern rendering is flawless.

No book was left at "screened only": every source edition got a whole-text comparison. The one exception is Fear and Trembling `original-en`, an AI translation with no external source, which was checked against the Danish and the accepted successor package.

## Per-book results (100 live books)

**Checks column.**

- A: whole-text comparison of every source edition against the matched public source.
- S: structural screen (divisions and labels, beginning and end, short sections, headings as body text, boilerplate).
- M: modern-en screening flags reviewed, plus modern-en and modern-da checked at every defect.
- R: the imported `books/raw/<id>` was compared with the authoritative current file.
- P: short-paragraph survival test (lead).
- V: independent second review of the book's S1–S3 claims, or of its S4 claims about missing or extraneous text. A book without V had no such claims to review.

"Share of source text found" is the proportion of the matched source's words that the served edition contains, by the k-gram test. Uncovered remainders include headings and apparatus.

★ marks the approved featured ten.

| Book | Group | Status after verification | Source edition(s) matched (share of source text found in the served edition) | Verified S1/S2/S3/S4 (+unverified S4) | Checks |
|---|---|---|---|---|---|
| `odyssey` ★ | G05 | Defects in served source edition | original-en: PG #1727 (99.5%) | 0/1/0/0 | ASMPV |
| `ulysses` | G06 | Source complete; S4 only | original-en: PG #4300 (100.0%) | 0/0/0/1 +1u | ASMPV |
| `war-and-peace` | G06 | Defects in served source edition | original-en: PG #2600 (99.9%) | 0/1/1/0 | ASMPV |
| `bible` | G11 | Defects in served source edition | bsb-en: bereanbible.com (100.0%); kjv-en: PG #10 (100.0%); web-en: PG #8294 (100.0%) | 0/1/1/5 +4u | ASMV |
| `gilgamesh` | G04 | Defects in served source edition | original-en: jasoncolavito.com (99.8%) | 0/0/1/1 | ASMRV |
| `hamlet` | G01 | Source complete; S4 only | original-en: PG #1524 (99.5%) | 0/0/0/0 +1u | ASMRP |
| `macbeth` | G01 | Defects in served source edition | original-en: PG #1533 (91.5%) | 5/1/7/0 | ASMRPV |
| `midsummer` | G01 | Source complete; S4 only | original-en: PG #1514 (99.6%) | 0/0/0/0 +1u | ASMRP |
| `romeo-and-juliet` | G01 | Source complete; S4 only | original-en: PG #1513 (99.3%) | 0/0/0/0 +2u | ASMRP |
| `the-tempest` | G01 | Defects in served source edition | original-en: MIT Shakespeare (99.5%) | 0/0/1/0 | ASMRV |
| `the-art-of-war` | G08 | Source complete; S4 only | original-en: PG #132 (95.1%) | 0/0/0/0 +1u | ASMRP |
| `pride-and-prejudice` ★ | G05 | Source complete | original-en: PG #1342 (99.5%) | 0/0/0/0 | ASMRP |
| `crime-and-punishment` ★ | G05 | Source complete | original-en: PG #2554 (100.0%) | 0/0/0/0 | ASMRP |
| `the-republic` | G03 | Source complete; S4 only | original-en: PG #1497 (100.0%) | 0/0/0/0 +1u | ASMRP |
| `meditations` ★ | G05 | Source complete; S4 only | original-en: PG #15877 (99.9%) | 0/0/0/0 +1u | ASMRP |
| `divine-comedy` | G10 | Source complete | original-en: PG #1001 (99.7%) | 0/0/0/0 | ASMRP |
| `jane-eyre` ★ | G05 | Source complete | original-en: PG #1260 (99.5%) | 0/0/0/0 | ASMRP |
| `the-aeneid` | G04 | Source complete; S4 only | original-en: PG #228 (100.0%) | 0/0/0/0 +1u | ASMRP |
| `paradise-lost` | G10 | Defects in served source edition | original-en: PG #26 (100.0%) | 1/2/0/0 | ASMRPV |
| `frankenstein` ★ | G05 | Defects in served source edition | original-en: PG #84 (99.9%) | 0/0/1/0 | ASMRPV |
| `the-manual` | G10 | Source complete; defects in modern-en/da only | original-en: PG #10661 (98.9%) | 0/0/1/1 | ASMPV |
| `apology` | G03 | Source complete; defects in modern-en/da only | original-en: PG #1656 (100.0%) | 0/0/2/0 | ASMPV |
| `symposium` | G03 | Defects in served source edition | original-en: PG #1600 (97.0%); original-en (package candidate 3521a12d…): PG #1600 (100.0%) | 1/0/1/1 | ASMPV |
| `phaedo` | G03 | Source complete; S4 only | original-en: PG #1658 (100.0%) | 0/0/0/0 +1u | ASMP |
| `crito` | G03 | Source complete; defects in modern-en/da only | original-en: PG #1657 (100.0%) | 0/0/1/0 | ASMRPV |
| `phaedrus` | G03 | Source complete | original-en: PG #1636 (100.0%) | 0/0/0/0 | ASMP |
| `poetics` | G03 | Source complete; S4 only | original-en: PG #1974 (99.8%) | 0/0/0/1 | ASMRPV |
| `moby-dick` | G06 | Defects in served source edition | original-en: PG #2701 (98.0%) | 1/1/1/0 +2u | ASMPV |
| `great-expectations` | G06 | Source complete; defects in modern-en/da only | original-en: PG #1400 (99.9%) | 0/1/0/0 | ASMRPV |
| `the-histories` | G10 | Defects in served source edition | original-en: PG #2707 (99.4%) | 1/0/0/1 +9u | ASMPV |
| `niels-lyhne` | G07 | Source complete; S4 only | original-da: runeberg.org (99.5%); original-en: PG #55389 (100.0%) | 0/0/0/0 +1u | ASMRP |
| `imitation-of-christ` | G10 | Defects in served source edition | original-en: PG #1653 (99.6%) | 0/0/2/1 +1u | ASMPV |
| `jerusalem` | G07 | Defects in served source edition | original-en: PG #15837 (99.9%) | 0/1/2/1 | ASMPV |
| `the-awakening` | G06 | Defects in served source edition | original-en: PG #160 (99.8%) | 0/1/0/0 | ASMPV |
| `brothers-karamazov` | G06 | Defects in served source edition | original-en: PG #28054 (99.8%) | 0/0/1/0 +2u | ASMRPV |
| `iliad` | G10 | Source complete | original-en: PG #2199 (100.0%) | 0/0/0/0 | ASMRP |
| `nicomachean-ethics` | G03 | Defects in served source edition | original-en: PG #8438 (99.5%) | 0/0/1/0 +2u | ASMPV |
| `the-prince` ★ | G05 | Defects in served source edition | original-en: PG #1232 (98.8%); original-it: it.wikisource (98.7%) | 0/1/1/0 +1u | ASMPV |
| `beyond-good-and-evil` | G08 | Defects in served source edition | original-en: PG #4363 (99.9%) | 1/0/0/0 +2u | ASMPV |
| `kant-groundwork` | G08 | Source complete; S4 only | original-en: PG #5682 (100.0%) | 0/0/0/0 +1u | ASMP |
| `beowulf` | G04 | Source complete | original-en: PG #16328 (99.0%) | 0/0/0/0 | ASMRP |
| `candide` ★ | G05 | Defects in served source edition | original-en: PG #19942 (98.9%) | 0/1/0/1 | ASMRPV |
| `democracy-in-america` | G09 | Source complete; S4 only | original-en: PG #815 (99.4%) | 0/0/0/0 +3u | ASMRP |
| `oedipus-rex` | G04 | Defects in served source edition | original-en: PG #31 (99.6%) | 0/0/1/0 | ASMPV |
| `oedipus-at-colonus` | G04 | Defects in served source edition | original-en: PG #31 (99.6%) | 0/0/1/0 | ASMPV |
| `antigone` | G04 | Defects in served source edition | original-en: PG #31 (99.3%) | 0/0/1/0 | ASMPV |
| `genealogy-of-morals` | G08 | Source complete | original-en: PG #52319 (99.7%) | 0/0/0/0 | ASMRP |
| `descartes-meditations` | G08 | Source complete | original-en: en.wikisource (99.5%) | 0/0/0/0 | ASMR |
| `on-liberty` | G08 | Defects in served source edition | original-en: PG #34901 (98.0%) | 0/0/1/0 | ASMRPV |
| `utilitarianism` | G08 | Source complete; S4 only | original-en: PG #11224 (99.9%) | 0/0/0/0 +1u | ASMP |
| `peloponnesian-war` | G10 | Source complete; S4 only | original-en: PG #7142 (99.8%) | 0/0/0/0 +1u | ASMRP |
| `aristotle-politics` | G03 | Defects in served source edition | original-en: archive.org `aristotlespoliti00arisiala` (93.2%) | 0/2/2/0 +1u | ASMRV |
| `leviathan` | G08 | Defects in served source edition | original-en: PG #3207 (97.6%) | 0/1/3/0 | ASMPV |
| `fear-and-trembling` | G08 | Defects in served source edition | original-da: archive.org `frygtogbvendial00kiergoog` (94.1%); original-en: — (no external source) | 0/4/1/2 +1u | ASMRV |
| `communist-manifesto` | G09 | Source complete | original-en: PG #61 (99.8%) | 0/0/0/0 | ASMRP |
| `second-treatise` | G09 | Defects in served source edition | original-en: PG #7370 (97.4%) | 0/0/1/1 | ASMRPV |
| `hume-enquiry` | G08 | Source complete; S4 only | original-en: PG #9662 (99.8%) | 0/0/0/0 +2u | ASMP |
| `social-contract` | G09 | Defects in served source edition | original-en: PG #46333 (98.0%) | 0/1/1/0 +1u | ASMRPV |
| `wealth-of-nations` | G09 | Defects in served source edition | original-en: PG #3300 (99.8%) | 1/1/4/0 | ASMPV |
| `werther` | G07 | Source complete; S4 only | original-en: PG #2527 (99.6%) | 0/0/0/0 +1u | ASMP |
| `faust-part-1` | G07 | Defects in served source edition | original-de: PG #21000 (98.6%); original-en: archive.org `cu31924026191910` (90.6%) | 4/8/4/1 | ASMRPV |
| `oresteia` | G04 | Defects in served source edition | original-en: PG #8604 (99.6%) | 0/0/1/2 +1u | ASMRPV |
| `bacchae` | G04 | Source complete; S4 only | original-en: PG #35173 (99.5%) | 0/0/0/1 +2u | ASMRPV |
| `medea` | G04 | Defects in served source edition | original-en: PG #35451 (99.7%) | 0/1/1/0 +1u | ASMRPV |
| `confessions` | G10 | Source complete; defects in modern-en/da only | original-en: PG #3296 (100.0%) | 1/0/0/0 | ASMPV |
| `notes-from-underground` | G06 | Source complete | original-en: PG #600 (99.9%) | 0/0/0/0 | ASMRP |
| `magna-carta` | G09 | Source complete; S4 only | original-en: PG #10000 (99.7%) | 0/0/0/0 +1u | ASMRP |
| `us-founding-documents` | G09 | Source complete; S4 only | original-en: National Archives (83.8%) | 0/0/0/1 | ASMRV |
| `federalist-papers` | G09 | Defects in served source edition | original-en: PG #1404 (98.3%) | 1/6/3/0 | ASMRPV |
| `frederick-douglass` | G07 | Source complete; S4 only | original-en: PG #23 (99.9%) | 0/0/0/1 | ASMPV |
| `a-little-princess` | G07 | Source complete | original-en: PG #146 (99.9%) | 0/0/0/0 | ASMRP |
| `jungle-book` | G07 | Source complete; defects in modern-en/da only | original-en: PG #236 (100.0%) | 0/0/1/0 | ASMPV |
| `around-the-world-80-days` | G07 | Source complete; S4 only | original-en: PG #103 (99.1%) | 0/0/0/1 | ASMPV |
| `heart-of-darkness` | G07 | Source complete; defects in modern-en/da only | original-en: PG #219 (100.0%) | 0/1/0/0 | ASMPV |
| `discourse-on-inequality` | G09 | Defects in served source edition | original-fr: fr.wikisource (99.7%); original-en: PG #46333 (88.9%) | 0/1/2/0 +1u | ASMPV |
| `jekyll-and-hyde` ★ | G05 | Defects in served source edition | original-en: PG #43 (99.8%) | 0/0/1/0 | ASMPV |
| `walden` | G07 | Source complete | original-en: PG #205 (100.0%) | 0/0/0/0 | ASMP |
| `vindication-rights-of-woman` | G09 | Source complete; defects in modern-en/da only | original-en: PG #3420 (99.8%) | 0/2/0/0 | ASMPV |
| `comedy-of-errors` | G01 | Source complete; S4 only | original-en: PG #1504 (99.6%) | 0/0/0/0 +1u | ASMP |
| `merchant-of-venice` | G01 | Source complete; S4 only | original-en: PG #1515 (99.3%) | 0/0/0/0 +1u | ASMP |
| `henry-v` | G01 | Defects in served source edition | original-en: PG #1521 (98.5%) | 1/0/1/0 +1u | ASMPV |
| `as-you-like-it` | G01 | Defects in served source edition | original-en: archive.org `1ws2510` (93.4%) | 2/1/1/0 +1u | ASMV |
| `winters-tale` | G01 | Source complete; S4 only | original-en: PG #1539 (99.5%) | 0/0/0/0 +1u | ASMP |
| `julius-caesar` ★ | G01 | Source complete; S4 only | original-en: PG #1522 (99.3%) | 0/0/0/0 +1u | ASMP |
| `twelfth-night` | G02 | Source complete; S4 only | original-en: PG #1526 (99.4%) | 0/0/0/0 +1u | ASMP |
| `measure-for-measure` | G02 | Defects in served source edition | original-en: PG #23045 (99.4%) | 0/0/1/0 +1u | ASMPV |
| `henry-iv-part-2` | G02 | Defects in served source edition | original-en: PG #1518 (98.4%) | 1/0/0/0 +2u | ASMPV |
| `merry-wives-of-windsor` | G02 | Defects in served source edition | original-en: PG #23044 (99.2%) | 0/0/1/0 +1u | ASMPV |
| `othello` | G01 | Defects in served source edition | original-en: PG #1531 (99.4%) | 0/1/0/1 | ASMPV |
| `king-lear` | G02 | Source complete; S4 only | original-en: PG #1532 (99.2%) | 0/0/0/0 +1u | ASMP |
| `much-ado-about-nothing` | G02 | Source complete; S4 only | original-en: PG #1519 (99.5%) | 0/0/0/0 +1u | ASMP |
| `taming-of-the-shrew` | G02 | Defects in served source edition | original-en: PG #1508 (88.6%) | 1/0/0/0 +1u | ASMPV |
| `antony-and-cleopatra` | G02 | Defects in served source edition | original-en: PG #1534 (98.8%) | 0/0/1/0 +1u | ASMPV |
| `richard-iii` | G02 | Source complete; S4 only | original-en: PG #1503 (99.4%) | 0/0/0/0 +1u | ASMP |
| `coriolanus` | G02 | Source complete; S4 only | original-en: PG #1535 (99.3%) | 0/0/0/0 +1u | ASMP |
| `cymbeline` | G02 | Source complete; S4 only | original-en: PG #1538 (99.3%) | 0/0/0/0 +2u | ASMP |
| `anna-karenina` | G06 | Defects in served source edition | original-en: PG #1399 (99.9%) | 0/0/1/0 | ASMPV |
| `don-quixote` | G06 | Defects in served source edition | original-en: PG #996 (98.5%) | 1/1/1/0 +1u | ASMPV |
| `essays-montaigne` | G09 | Defects in served source edition | original-en: PG #3600 (98.5%) | 1/0/1/0 +1u | ASMPV |
| `ivan-ilyich` | G06 | Source complete; S4 only | original-ru: ru.wikisource (99.8%); original-en: en.wikisource (99.9%) | 0/0/0/0 +1u | ASM |

## How the audit was done

### 1. What "served" means here

- **Pinned commit:** `main` = `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` ("Jane Eyre + Pride structural release, Confessions modern-en rewrite, saved-data migration (#192)"). The audit branch starts at exactly this commit.
- **Live inventory:** the 100 books in `BOOKS` in `app/src/data/bookRegistry.ts`. One further `Book` constant (`treasure-island`) is staged, not public, and is out of scope. There are 305 served editions.
- **Served paths.** The whole-book file is `app/public/data/editions/{book}-{edition}.json`, served at `/data/editions/…`. For 48 editions the reader's **primary view** instead loads chapter shards. `App.tsx` calls `loadEditionWindow()`, which uses `app/public/data/editions-chapters/{book}-{edition}/manifest.json` and `chNNNN.json`. Compare, search and Worker narration read the whole-book file. Both paths were checked.
- **Runtime patch overlay.** `/api/edition-patches` can replace individual paragraphs from Supabase `edition_patches`. It cannot add paragraphs. A read-only query for Macbeth (original-en, modern-en), As You Like It and Symposium returned `[]`. The table itself was not readable from this environment.
- **Production.** On 2026-09-25 at about 11:56 UTC, all 305 edition files were downloaded from `https://tinct.app/data/editions/`. **294 are byte-identical to main.** The other 11 differ because main already carries text that has not been deployed yet: Jane Eyre and Pride and Prejudice original-en and modern-en (structural release #192), and modern-en for Candide, The Prince, Julius Caesar, Confessions, Jekyll and Hyde and Crime and Punishment, plus `bible-web-en`. For those 11, production still serves the pre-release bytes. The hashes are listed in the table. No finding in this audit depends on that deployment lag.

### 2. Screening (all 100 books, all 305 editions)

A structural card was generated for every book. Each card records:

- per edition, every chapter's title, paragraph count and word count;
- the first and last paragraphs.

It also carries heuristic flags:

- short chapters;
- headings parsed as body text;
- mid-sentence paragraph splits;
- adjacent near-duplicate paragraphs;
- modern-en paragraphs under 45% of the original's length;
- chapter and paragraph count mismatches between editions;
- Gutenberg and licence boilerplate anywhere in the text.

The flags are leads, not findings.

### 3. Whole-text source comparison

For each book the auditor identified the public-domain edition that matches the served source edition: same work, same translator and edition. Where `books/raw/{book}` held a local copy, it was also compared with the authoritative current file, because an incomplete imported source is how the Symposium defect passed review.

The comparison uses a k-gram coverage method (k = 6 word tokens):

- **Tokenisation.** Text is lower-cased, accents are stripped by Unicode normalisation, and Greek and Cyrillic are kept.
- **Missing runs.** A source token counts as covered when any 6-token window containing it occurs in the served edition. Uncovered source runs are candidate omissions. Each is located after the last served paragraph that precedes it.
- **Extra runs.** The same test in the other direction finds served text that is not in the source: boilerplate, notes, splices and text from other works.
- **Order and duplication.** Each paragraph's unique source anchor must move forward, and repeated runs are reported.

The method was calibrated on Symposium. Against PG #1600 it reports exactly one gap for the live text: 657 tokens, the known opening. It reports none for the accepted repair candidate.

Every run of 25 or more tokens was inspected by hand. The remaining uncovered tokens were explained: edition wording variants, headings, stage-direction typography, and editorial notes excluded by scope. Only then was a book classed **COMPLETE-VS-SOURCE**. A book checked only by structure, beginning and ending is classed **SCREENED**. Paragraph and word counts alone were never treated as evidence of completeness.

### 3b. Short-paragraph survival test (all groups)

The coverage method cannot see a dropped paragraph shorter than its minimum run of 12 tokens. So the lead ran a second, independent test over 91 source editions whose matched source was cached. For every source paragraph of 11 tokens or fewer, it checks whether the served text contains that paragraph between its neighbouring context, or the neighbours joined without it.

- **Drops found:** The Awakening (the importer's under-20-characters rule) and Macbeth's short continuations. Everything else it flagged was headings, captions and illustration markers.
- **Not covered:** the 15 editions whose sources were not cached (listed in NEEDS-INVESTIGATION §D). These relied on their auditor's run-level inspection.

### 4. Translations of each defect

- **modern-en.** Every defect in a source edition was located in `modern-en`, to show whether the translation inherits it (usually) or independently has or lacks the text. Screening flags on `modern-en` were also read for whole-passage omissions and duplicated paragraphs.
- **modern-da.** This was checked for presence only, at the defect coordinates. No Danish repair was produced.

### 5. Independent verification

Every proposed S1, S2 and S3 defect was given to an independent second reviewer (V01–V11), and so was every S4 claim about missing or extraneous text: 160 claims in all. The reviewer received the claim only, not the first auditor's reasoning. They fetched the source independently, usually with a second copy of the same edition, and inspected the served JSON directly.

- **Outcome:** 127 confirmed, 32 confirmed with corrections, **1 rejected** (the Bill of Rights preamble: an edition-scope matter), 0 unresolved. Severity changed in 6 cases, all upward: Othello, Candide, Fear and Trembling footnotes, and three Paradise Lost items.
- **Symposium:** its three items were confirmed by that package's own independent reviews.
- **Where the rest went:**
  - Confirmed facts that are really scope decisions (8), the reviewers' own new observations (59) and the 74 S4 items that were not second-reviewed are in `NEEDS-INVESTIGATION.md`.
  - Only confirmed defects appear in `CONFIRMED-DEFECTS.md`.

### 6. Limits of coverage

- `modern-en` completeness is established only where the source edition is defective, or where a screening flag led to a paragraph-level read. This audit is not a paragraph-by-paragraph fidelity review of 100 modern-English editions.
- `modern-da` is outside the current language scope. It was inspected only at defect coordinates.
- Where no matching public source edition could be identified, the book is SCREENED only, as marked in its row.
- Runtime paragraph patches could not be enumerated. The overlay cannot insert missing paragraphs, but it could in principle alter a paragraph's text.
- Text differences between editions of the same translation (for example, Gutenberg re-releases) are reported as VARIANT, not as defects.

## Served-path integrity (checked for every sharded edition)

- **48 editions are chapter-sharded.** The reader's primary view loads the shards (`App.tsx` → `loadEditionWindow`). Compare, search and Worker narration read the whole-book file. For the 45 non-Bible sharded editions, the lead compared every shard with its whole-book JSON; G11 did the same for the three Bible editions.
- **All sharded original-en and Bible editions match their whole-book files exactly.**
- **Mismatches found:**
  - `wealth-of-nations-modern-en`: all 32 chapters differ. The shards are about 80% the 1776 original text, while the whole JSON holds the modernised rendering. This is confirmed S2 (G09-wealth-of-nations-06 / V09, and the lead's own count: 1,748 of 2,026 long paragraphs verbatim).
  - `essays-montaigne-modern-en` and `-modern-da`: `["…"]` wrappers in the shards (S4).
  - Five modern-da manifests carry English chapter titles (brothers-karamazov, democracy-in-america, don-quixote, federalist-papers, peloponnesian-war). Don Quixote modern-da text also differs in 60 chapters (V07-N4, single reviewer).
- **Runtime patch overlay.** `/api/edition-patches` returned `[]` for the sampled books. It can only replace a paragraph's text, never add paragraphs, and it was not enumerated.

## Production versus main (2026-09-25, about 11:56 UTC)

All 305 edition files were downloaded from `https://tinct.app/data/editions/`. **294 are byte-identical to main.** The 11 below differ because main already carries text that has not been deployed: #192 and the reviewed modern-en releases. Every finding in this audit refers to main.

| Edition file | Served by tinct.app (sha256) | main `1a7d89eb` (sha256) |
|---|---|---|
| `bible-web-en.json` | `46d206635dc79214cb29a8b27f392f3d4a5f856bdedb3441315973f542c4eeae` | `b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa` |
| `candide-modern-en.json` | `136767b698e00213fd92520233136c3e1ed5b12b409ec781eb3832d9394ffb9a` | `e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25` |
| `confessions-modern-en.json` | `420b17153b6cb46f6a74e41bb633dcbc88099975720dac27c6bfb0bf6be51b4e` | `949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7` |
| `crime-and-punishment-modern-en.json` | `914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834` | `18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb` |
| `jane-eyre-modern-en.json` | `bbfe4c30163ecf07291e2fa5faef69d1e57348644afe2ab0dfc96edff3cecad0` | `0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6` |
| `jane-eyre-original-en.json` | `055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96` | `d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257` |
| `jekyll-and-hyde-modern-en.json` | `f2cf24e93c77b354a9fa617d3440b6daaa09acd36e6fdb1df236469ac570a5ae` | `7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b` |
| `julius-caesar-modern-en.json` | `ab371bca564b2e2fa495d17fa53c243dd33131b2b18f886c1682db0a40d9915c` | `95a3e5b7516276f703bd77fb42992c6d76f27894619e1d7f147c290170baa952` |
| `pride-and-prejudice-modern-en.json` | `d914bb2dc33dfb525d7c21b142cc1ae4ea85dcfdd84378c2a839c90d90c250e1` | `6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463` |
| `pride-and-prejudice-original-en.json` | `5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6` | `6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c` |
| `the-prince-modern-en.json` | `b9145c66f97bbdf5373a974f843da6bacb6aaeb1bb5ac60f7b49dbda42e2be17` | `d99629fa3c3e1a345c92e1b9749115111985bfdff520fd7a37037d6a3731d582` |

## Limits of coverage (summary; details in NEEDS-INVESTIGATION §D)

- **modern-en** was not given a paragraph-by-paragraph fidelity review. It was checked at every source-edition defect and wherever screening flagged it, and the second reviewers found invented text in four books. A separate modern-en integrity sweep is recommended.
- **modern-da** was checked only at defect coordinates and in spot checks.
- **Text differences between versions of the same translation** are reported as VARIANT, not as defects.
- **Books that are not served** were not audited: the staged `treasure-island` and the WIP `to-the-lighthouse`.

## Pinned edition hashes (all 305 served editions at `1a7d89eb`)

| # | Book id | Edition | Label | sha256 (main `1a7d89eb`) | Ch | ¶ | Words | Shards | Production 2026-09-25 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `odyssey` | `original-en` | Butler (Prose, 1900) — Samuel Butler | `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` | 24 | 1027 | 117228 | no | same |
| 2 | `odyssey` | `modern-en` | Modern English | `813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc` | 24 | 1027 | 104916 | no | same |
| 3 | `odyssey` | `modern-da` | Moderne Dansk | `0b8a114304427d3efca8d011edba338e8886a632a18fef8ad5a66129d4d0bead` | 24 | 1027 | 101339 | no | same |
| 4 | `ulysses` | `original-en` | Original (1922) | `ddc3418890b6a623e7c9bcb730272fe01539e86a2872c268eed43dbe01121428` | 18 | 7148 | 264931 | yes | same |
| 5 | `ulysses` | `modern-en` | Modern English | `ac853e0de7c6f8da3edecb426136e8037f39f03e4c7218fa15611bee241233a6` | 18 | 7148 | 268222 | yes | same |
| 6 | `ulysses` | `modern-da` | Moderne Dansk | `b0cff115dcc73fbb46c59dc660b755f9961001d2678127758edc93f77f9ec678` | 18 | 7148 | 258904 | yes | same |
| 7 | `war-and-peace` | `original-en` | Maude Translation (1922) — Aylmer & Louise Maude | `6112db117bbc36641e45240ff4a0ecd7d63a2975bdd691a6ad1624a6c6879864` | 365 | 11340 | 561695 | yes | same |
| 8 | `war-and-peace` | `modern-en` | Modern English | `d3ecdb9d013f45e5681b1c091b6a018564e33d7eab1072cb247c284698a5f3f6` | 365 | 11340 | 534552 | yes | same |
| 9 | `war-and-peace` | `modern-da` | Moderne Dansk | `773c92e1606817232ae7381f79df9a6bb074384397e0583b5b60e6ddd3c9d140` | 365 | 11340 | 537122 | yes | same |
| 10 | `bible` | `bsb-en` | Berean Standard Bible | `8da0bc1ae32d9c2e05ba5811d953e24bdff8351913ad8f2199142ca0081c61d9` | 1189 | 38464 | 756675 | yes | same |
| 11 | `bible` | `kjv-en` | King James Version (1611) | `53823ea3d19a3d7b986563f9fb7015be4a75bb102bd6e6a714ee64ceed0ff26e` | 1189 | 6704 | 820729 | yes | same |
| 12 | `bible` | `web-en` | World English Bible | `b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa` | 1189 | 6704 | 794878 | yes | differs: `46d206635dc79214…` |
| 13 | `gilgamesh` | `original-en` | Prose Compilation | `1c9886e2b341187c3dd2b0e4fbcbfc285e65f7631ae6944d094424ac50ef31cc` | 12 | 253 | 18845 | no | same |
| 14 | `gilgamesh` | `modern-en` | Modern English | `419a43b05bfcbf84dce9f1948158a8f3d34a4b6dc41c93767c827aede87ad63c` | 12 | 253 | 16439 | no | same |
| 15 | `gilgamesh` | `modern-da` | Moderne Dansk | `70a40c3d7e96da38870fda747ccf3d7bd7fb5c111271547fd22ef88385231094` | 12 | 253 | 15167 | no | same |
| 16 | `hamlet` | `original-en` | Original Text | `77f9bf6e33516a710b6e7a747cd0ae3e1518eca29483c0470341f69d8de6e58f` | 20 | 1391 | 31621 | no | same |
| 17 | `hamlet` | `modern-en` | Modern English | `b355830766b696812decba35f95dee0ee68ff7662e36370194a129bc2147fda5` | 20 | 1391 | 30903 | no | same |
| 18 | `hamlet` | `modern-da` | Moderne Dansk | `fea31e2b8d327f0fb7d7b11e4942ff6d73e048446304070b0edfa7962e7022d4` | 20 | 1391 | 31375 | no | same |
| 19 | `macbeth` | `original-en` | Original Text | `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608` | 28 | 806 | 16520 | no | same |
| 20 | `macbeth` | `modern-en` | Modern English | `0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1` | 28 | 806 | 17683 | no | same |
| 21 | `macbeth` | `modern-da` | Moderne Dansk | `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57` | 28 | 806 | 17616 | no | same |
| 22 | `midsummer` | `original-en` | Original Text | `9ddba0b7d8617c6c0d2c0f5a31659f43ded8b51f03cb95808a63ae04c341ad4e` | 9 | 641 | 17017 | no | same |
| 23 | `midsummer` | `modern-en` | Modern English | `f9eca722e0488f7a4f44fd865e487d2ed0361fab9b783b11ff3ccd32b43a8666` | 9 | 641 | 17813 | no | same |
| 24 | `midsummer` | `modern-da` | Moderne Dansk | `5b516f16b544ccb0e30e21e1af9a29d98104acb40f7f3b6dc163ccc006d43e4d` | 9 | 641 | 17596 | no | same |
| 25 | `romeo-and-juliet` | `original-en` | Original Text | `d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276` | 25 | 1062 | 25515 | no | same |
| 26 | `romeo-and-juliet` | `modern-en` | Modern English | `47fdf4f9a1b309f6747b48d00add73181cff9cd0a4c0063f81774a1a8a95bae6` | 25 | 1062 | 25597 | no | same |
| 27 | `romeo-and-juliet` | `modern-da` | Moderne Dansk | `bed47cb3281aa1e9f70885921ff6cb79b603f4a5a124e2445c19167778877046` | 25 | 1062 | 26036 | no | same |
| 28 | `the-tempest` | `original-en` | Original Text | `c7b057ac30de314a239d6ebc1f133bf36195d1e4a0109650ceb97a25a972ac23` | 10 | 790 | 17269 | no | same |
| 29 | `the-tempest` | `modern-en` | Modern English | `ddbade7e7141e485ae8a36fb6b34401a95c87de48054ff9d2053c5fb8d1e063f` | 10 | 790 | 18102 | no | same |
| 30 | `the-tempest` | `modern-da` | Moderne Dansk | `82dcfbf3e42e6ebd5485e19ac7fdcc23e278794e7d7c709b38ac953955932417` | 10 | 790 | 18293 | no | same |
| 31 | `the-art-of-war` | `original-en` | Giles Translation (1910) — Lionel Giles | `60beeb94051b07312e0c554ce215a73ebc87e503006e7832cba7e09309be1d61` | 13 | 445 | 10847 | no | same |
| 32 | `the-art-of-war` | `modern-en` | Modern English | `bf41e7a3a441202531c419e259f908a16b2e0f32fc2fd38beef00755e5267cf5` | 13 | 445 | 8329 | no | same |
| 33 | `the-art-of-war` | `modern-da` | Moderne Dansk | `07668460e503123590944e04a067ace0f6c123eaa12a6847f3fccb52380dbb5c` | 13 | 445 | 8070 | no | same |
| 34 | `pride-and-prejudice` | `original-en` | Original (1813) | `6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c` | 61 | 2053 | 121546 | no | differs: `5a44024668550ab8…` |
| 35 | `pride-and-prejudice` | `modern-en` | Modern English | `6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463` | 61 | 2053 | 114391 | no | differs: `d914bb2dc33dfb52…` |
| 36 | `pride-and-prejudice` | `modern-da` | Moderne Dansk | `3c84f6b06dd8258d09e6f6f148354cb71129908f22a40be3785b00ae79cea3e5` | 61 | 2060 | 117600 | no | same |
| 37 | `crime-and-punishment` | `original-en` | Garnett Translation (1914) — Constance Garnett | `6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978` | 41 | 3904 | 202615 | yes | same |
| 38 | `crime-and-punishment` | `modern-en` | Modern English | `18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb` | 41 | 3904 | 190324 | yes | differs: `914bcdfae3967924…` |
| 39 | `crime-and-punishment` | `modern-da` | Moderne Dansk | `04df4893cc4340badba95fa8f9ad41717c08e3f2d0c67314b92faec9f64d8bd9` | 41 | 3904 | 185593 | yes | same |
| 40 | `the-republic` | `original-en` | Jowett Translation (1871) — Benjamin Jowett | `338cc5908ed34b108c6775dad4e437feccb19ba86f6fdcd868ea5821d777b0a6` | 10 | 4308 | 118264 | no | same |
| 41 | `the-republic` | `modern-en` | Modern English | `02082bbef9bf9026cdcdb11c0bc60e0e518a832d63f19dcbcab65ca794078f57` | 10 | 4308 | 108521 | no | same |
| 42 | `the-republic` | `modern-da` | Moderne Dansk | `9de2ff16ca374bdbe70339db2067375b7d8c68d6abed6e8edcab10fd50d68859` | 10 | 4308 | 93266 | no | same |
| 43 | `meditations` | `original-en` | Long Translation (1862) — George Long | `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` | 12 | 487 | 46058 | no | same |
| 44 | `meditations` | `modern-en` | Modern English | `4623d1191fbd1c09f9257acf7e73b49d5467e35fa0d9979e35c910bb24b9cc9f` | 12 | 487 | 45498 | no | same |
| 45 | `divine-comedy` | `original-en` | Longfellow Translation (1867) — Henry Wadsworth Longfellow | `494a37942b0005c1a6ca5fab8720dcd8db1f1a7c1ec80831d7bab9bdcbd4c452` | 100 | 4812 | 111060 | no | same |
| 46 | `divine-comedy` | `modern-en` | Modern English | `5938ed2727d6a26ed7928e97b382254d7d2acfd382d180604e97b518a2660ad2` | 100 | 4812 | 109841 | no | same |
| 47 | `divine-comedy` | `modern-da` | Moderne Dansk | `d46657c4f927cb4221603cd82458c4a85122d13e8b2d2371e8b5f7e5e9d3f48b` | 100 | 4812 | 106455 | no | same |
| 48 | `jane-eyre` | `original-en` | Original (1847) | `d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257` | 38 | 4034 | 184227 | yes | differs: `055aad5e04c0c9db…` |
| 49 | `jane-eyre` | `modern-en` | Modern English | `0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6` | 38 | 4034 | 178676 | no | differs: `bbfe4c30163ecf07…` |
| 50 | `jane-eyre` | `modern-da` | Moderne Dansk | `2c2fad5c5aff97de327a3826ecb6d277d0e585d86109459decc21e7c5c644b96` | 38 | 4047 | 176107 | yes | same |
| 51 | `the-aeneid` | `original-en` | Dryden Translation (1697) — John Dryden | `4a763d99af704695d1fbe4fc6c9740c2335dedc7bbf7e2b22aff8af23903aaf0` | 12 | 544 | 107470 | no | same |
| 52 | `the-aeneid` | `modern-en` | Modern English | `1e9b6dd64911f96374ae6e9322379d4eb30a9d9dfc8e0a994e717c71f3a05c07` | 12 | 544 | 109977 | no | same |
| 53 | `the-aeneid` | `modern-da` | Moderne Dansk | `ed6ef13cbfdd867014f73b37289032705160a65f17e6d116761ee446abc9b9b8` | 12 | 544 | 38520 | no | same |
| 54 | `paradise-lost` | `original-en` | Original (1674) | `56c47aa192f17e38ae996d1abfc268dc0090a8c365a2e8f7578160dea2f81185` | 12 | 1188 | 79739 | no | same |
| 55 | `paradise-lost` | `modern-en` | Modern English | `87727e7760ea487d5b4527570d9bdaeaeb3158c782ed372f9c0a554cbf8562ba` | 12 | 1188 | 84141 | no | same |
| 56 | `paradise-lost` | `modern-da` | Moderne Dansk | `266ada0a3a74b0838b1dfe4a54a08d2959f03d627ddc955e954fcb306ead117c` | 12 | 1188 | 70481 | no | same |
| 57 | `frankenstein` | `original-en` | Original (1831) | `71008d6d1e14b5818d70ca24bd2875303772b39af6c3894c9e26c50fdcce7b51` | 28 | 764 | 74919 | no | same |
| 58 | `frankenstein` | `modern-en` | Modern English | `a99352b3bf5f9d1f7a78970b658f2a35722a2b5031d4037a398d284c6ab390ff` | 28 | 764 | 65020 | no | same |
| 59 | `frankenstein` | `modern-da` | Moderne Dansk | `f52630181990e7aefcdbd89f4cf76ae1f25e1c336108f8c76b8796b4ecdeeda9` | 28 | 764 | 63456 | no | same |
| 60 | `the-manual` | `original-en` | Long (1877) — George Long | `23835259e0a0d52214f7554e44b0adaf44c5ec5e8a356bd196d3ccb948dc803e` | 52 | 68 | 8111 | no | same |
| 61 | `the-manual` | `modern-en` | Modern English | `2ac0db1347defd5bea73e993f4db672a37136f53bcf69423dab544de20040f35` | 52 | 68 | 6221 | no | same |
| 62 | `the-manual` | `modern-da` | Moderne Dansk | `08b3e433b8b9c74cc6ee9d72c8cff97502c1095ab827e9c09ffd290e93c83879` | 52 | 68 | 6508 | no | same |
| 63 | `apology` | `original-en` | Jowett (1871) — Benjamin Jowett | `a951009eaf834d24ac88e79ffdea2841d939897b88a52d821cd9a7710b303fe8` | 3 | 92 | 11383 | no | same |
| 64 | `apology` | `modern-en` | Modern English | `f09399f0fe5348b3e3e809044f9907175515d9a6b113edd1dadd6a98a2444e4b` | 3 | 92 | 7856 | no | same |
| 65 | `apology` | `modern-da` | Moderne Dansk | `7478955a3818154feab390f4c2768009dd40e064105d55f91ae4cdf03ed80795` | 3 | 92 | 7840 | no | same |
| 66 | `symposium` | `original-en` | Jowett (1871) — Benjamin Jowett | `e2943777fd54eaaa0888076c5c03a9104bc1b1ffa681a5362ab114e327f797c0` | 8 | 217 | 21429 | no | same |
| 67 | `symposium` | `modern-en` | Modern English | `7816d1eb6ac9cc6d178c4c123bbeb8ad6daced1f7d7fc8c036f2bded3b8fcce8` | 8 | 217 | 21457 | no | same |
| 68 | `symposium` | `modern-da` | Moderne Dansk | `2a98c5281c40f5e309f8b33d5ad42661fad045b8b857142cfee0a2ab95a2b215` | 8 | 217 | 15681 | no | same |
| 69 | `phaedo` | `original-en` | Jowett (1871) — Benjamin Jowett | `c2a1b3b99c2826d41e1692c521d889b3a324afd762723210c7817960ea6c3044` | 9 | 652 | 27292 | no | same |
| 70 | `phaedo` | `modern-en` | Modern English | `2c46156a475567697bb7aadb6a66d362e08ea37cc23fc80d124c2be7e0cff8c7` | 9 | 652 | 26337 | no | same |
| 71 | `phaedo` | `modern-da` | Moderne Dansk | `087b269dcd42ffb7d3677cb5bf78d9a3bc06e7602b8020467f17e1777d096e93` | 9 | 652 | 20372 | no | same |
| 72 | `crito` | `original-en` | Jowett (1871) — Benjamin Jowett | `19dbc33de3076411f4abedfd1016529a244dc3ac9b31fe1f792e629e219fd0b7` | 3 | 95 | 5347 | no | same |
| 73 | `crito` | `modern-en` | Modern English | `5ff432e7e028e7caff6b11984a50ca0db43f3ce976b68af8f5466f7f23293add` | 3 | 95 | 4576 | no | same |
| 74 | `crito` | `modern-da` | Moderne Dansk | `4f2aa8b2b6f2c8b36d90026c6e563015d6599f89595dc5f8c56960ade78d1237` | 3 | 95 | 4542 | no | same |
| 75 | `phaedrus` | `original-en` | Jowett (1871) — Benjamin Jowett | `687f5a5e9b73892ce4226633fa3371ba3394bc728edbed38d6147303df6c542c` | 6 | 408 | 23027 | no | same |
| 76 | `phaedrus` | `modern-en` | Modern English | `a246a86ca83ff33521735c1ff70681037ed4d956f87e71d0812ddf864979e06c` | 6 | 408 | 21683 | no | same |
| 77 | `phaedrus` | `modern-da` | Moderne Dansk | `f779e3b14e3a18803657bcfde238eb90b554fe67c263e401fc02c0f34fcde66b` | 6 | 408 | 21144 | no | same |
| 78 | `poetics` | `original-en` | Butcher (1895) — S. H. Butcher | `00113ffc33cceda9f2e3efd76a4e2c6f0d058b0174554248beba39c82354dd27` | 26 | 130 | 14802 | no | same |
| 79 | `poetics` | `modern-en` | Modern English | `20c7f0695e0360b9ea800ae11c0720bfe38d1e7e85b828d0a19bed542a9b175e` | 26 | 130 | 13507 | no | same |
| 80 | `poetics` | `modern-da` | Moderne Dansk | `98b7db8373b61d59aaecb9a77afb2241f163245b76ac692cf9cda44185d61ee9` | 26 | 130 | 12548 | no | same |
| 81 | `moby-dick` | `original-en` | Original (1851) | `30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952` | 136 | 2432 | 207804 | yes | same |
| 82 | `moby-dick` | `modern-en` | Modern English | `2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c` | 136 | 2432 | 191004 | yes | same |
| 83 | `moby-dick` | `modern-da` | Moderne Dansk | `208eb3954e5eb637955d17df0a19c768c21d69db4790231904d3af660db42355` | 136 | 2432 | 188468 | yes | same |
| 84 | `great-expectations` | `original-en` | Original (1861) | `e4c4863487b9b9ce4cabb8a64cb518ee3038cb31169dbac220569522dc1b6e70` | 59 | 3835 | 184218 | yes | same |
| 85 | `great-expectations` | `modern-en` | Modern English | `760e685ddbc2b7cf547b644a10c7869da7be2b73a448909d56dbd24ec61484b1` | 59 | 3835 | 181350 | no | same |
| 86 | `great-expectations` | `modern-da` | Moderne Dansk | `a44e786c7e5313728ea2236291c071f65690a5d0d1363e061fe253ceea351a91` | 59 | 3835 | 182528 | yes | same |
| 87 | `the-histories` | `original-en` | Macaulay (1890) — George Campbell Macaulay | `f442e468e59838d5783d0c30d14b3f180e06c4175261913597d5f2182c22de31` | 1525 | 1626 | 284922 | yes | same |
| 88 | `the-histories` | `modern-en` | Modern English | `d79ea955070c9d8cbfae1b6153f0087d263d6aa87cc59e410e69fb427f744d54` | 1525 | 1626 | 259323 | yes | same |
| 89 | `the-histories` | `modern-da` | Moderne Dansk | `6e7874e0da84539d861d65c4e89ee2c33a7817035c6014e6a145842504a73bce` | 1525 | 1626 | 247769 | yes | same |
| 90 | `niels-lyhne` | `original-da` | Original (1880) | `3e90c0967db4e2147ae055608a28336af15e7eb8605eb3b47264f9d8f595ea94` | 14 | 1159 | 66780 | no | same |
| 91 | `niels-lyhne` | `original-en` | Larsen (1919) — Hanna Astrup Larsen | `5f30145593a20bee6deb22f8a524314193b9bf5319c053c6e0b6afd547872d37` | 14 | 912 | 68196 | no | same |
| 92 | `niels-lyhne` | `modern-en` | Modern English | `88dc925851aae72fa3602b26917ec696e13a8499117c98298e71c6909f87521a` | 14 | 912 | 68875 | no | same |
| 93 | `niels-lyhne` | `modern-da` | Moderne Dansk | `497ef5e8a0d3c3d8b6081d3facf886daa965b53f59558bf1ee2ad58d0b20d005` | 14 | 1159 | 66923 | no | same |
| 94 | `imitation-of-christ` | `original-en` | Benham (1886) | `43902ea5bf50af978562e161b9e3202475777fc150ab067a8af13e144e54d0a2` | 114 | 774 | 61341 | no | same |
| 95 | `imitation-of-christ` | `modern-en` | Modern English | `8805af64c4357b3f56e843e5c4c43b5746622547d774e2237711205000c727aa` | 114 | 774 | 56603 | no | same |
| 96 | `imitation-of-christ` | `modern-da` | Moderne Dansk | `02c25fe5430acc68a6815f8d42fd640ab91c6f8c0bdaeeed1135f0022b159ff6` | 114 | 774 | 55867 | no | same |
| 97 | `jerusalem` | `original-en` | Howard (1915) — Velma Swanston Howard | `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c` | 18 | 1787 | 77761 | no | same |
| 98 | `jerusalem` | `modern-en` | Modern English | `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` | 18 | 1787 | 73351 | no | same |
| 99 | `jerusalem` | `modern-da` | Moderne Dansk | `c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223` | 18 | 1787 | 71516 | no | same |
| 100 | `the-awakening` | `original-en` | Original (1899) | `78824e511ea979f2f1a1b41d67105d161559c0a9dcff3bbb826e9814dbf44703` | 39 | 1044 | 49605 | no | same |
| 101 | `the-awakening` | `modern-en` | Modern English | `06a1d8570cba2c315f444cbbb455dc57aa9b25853198f00643256f69ba24ccf1` | 39 | 1044 | 47867 | no | same |
| 102 | `the-awakening` | `modern-da` | Moderne Dansk | `9afc197ea21772a6d9f1dee1cb42d4bd568ddd95f0570c8e5811d5e8106a68a7` | 39 | 1044 | 48308 | no | same |
| 103 | `brothers-karamazov` | `original-en` | Garnett (1912) — Constance Garnett | `b8ada3e43c6f997a0d55f77e1f22bb769f021071aaeff3d0cb25dcd1acb80736` | 96 | 5836 | 349373 | yes | same |
| 104 | `brothers-karamazov` | `modern-en` | Modern English | `5b2d957d5fdca2f1c6374afe61fd7a3e72e2316f06f5bc1f5796939485f91378` | 96 | 5836 | 349146 | yes | same |
| 105 | `brothers-karamazov` | `modern-da` | Moderne Dansk | `9dc6d62c74ef9097a5030071a6be9c783cf25c2873077ec29b896cc2e0bf16d7` | 96 | 5836 | 349484 | yes | same |
| 106 | `iliad` | `original-en` | Butler (1898) — Samuel Butler | `3ba331f36cb935cb861bedb51994a4d410cda83013ba8c63bb04a126bb45e86c` | 24 | 1137 | 152639 | no | same |
| 107 | `iliad` | `modern-en` | Modern English | `d424a2e68fd2e302781a4f2ecd4ce3f85ff84c7b80f35b066a32f342cd59fa75` | 24 | 1137 | 151096 | no | same |
| 108 | `iliad` | `modern-da` | Moderne Dansk | `07123206c3467abd8ddd2a74529073baf9b3358da40f042ee3523c913e6000e6` | 24 | 1137 | 143164 | no | same |
| 109 | `nicomachean-ethics` | `original-en` | Chase (1847) / Ross tradition — D.P. Chase | `214c4025cd1ef25c68685bf7207bc0d59552a3cdc5a85df6becb8ae99c90df1c` | 10 | 1195 | 92325 | no | same |
| 110 | `nicomachean-ethics` | `modern-en` | Modern English | `c6128f1563bbe0eb4c95a4d31b9355efe834dc010b976e25b568cd49968bcdcf` | 10 | 1195 | 79500 | no | same |
| 111 | `nicomachean-ethics` | `modern-da` | Moderne Dansk | `b48d05b6bc5da844f6f9a46082837298a490161c9124a394788e11eb98269725` | 10 | 1195 | 78090 | no | same |
| 112 | `the-prince` | `original-it` | Il Principe (1532) | `f5d8ecdaa3b7380fe8fdd1e8f42b6db7357133aa2d0c691d01df4b854df5f95f` | 27 | 92 | 27279 | no | same |
| 113 | `the-prince` | `original-en` | Marriott (1908) — W.K. Marriott | `288e7bcf4427ef042d2d90214c130756d32273c2ae75ea7da84ad7dd97ff1e95` | 27 | 254 | 32405 | no | same |
| 114 | `the-prince` | `modern-en` | Modern English | `d99629fa3c3e1a345c92e1b9749115111985bfdff520fd7a37037d6a3731d582` | 27 | 254 | 28830 | no | differs: `b9145c66f97bbdf5…` |
| 115 | `the-prince` | `modern-da` | Moderne Dansk | `ab97b2cfba5114b6a7347e0e9d1c5cb50b910f81663eb0ef663d940f86f8e067` | 27 | 254 | 28289 | no | same |
| 116 | `beyond-good-and-evil` | `original-en` | Zimmern (1907) — Helen Zimmern | `a906a663863727ff37c8e40b5561165088d6835111f736210604dbf95f484e43` | 11 | 325 | 62412 | no | same |
| 117 | `beyond-good-and-evil` | `modern-en` | Modern English | `5b14eaa83a4b695afc10e74b203001ac33490f732a1fb42c141749687859d08a` | 11 | 325 | 63623 | no | same |
| 118 | `beyond-good-and-evil` | `modern-da` | Moderne Dansk | `ee3d488e2e798a6ab56dd102f7d3dfbc32b02d475966f6549a781acd38451646` | 11 | 325 | 60068 | no | same |
| 119 | `kant-groundwork` | `original-en` | Abbott (1879) — Thomas Kingsmill Abbott | `39baa06718f8c7378638c7b389876fae8f5e089aa9774ed8495b6203285e1ae7` | 4 | 193 | 30736 | no | same |
| 120 | `kant-groundwork` | `modern-en` | Modern English | `2ac2fce500388299d084ecf5b8e3be84c6f06bfc3747aa7262a4bacc7459d84d` | 4 | 193 | 30431 | no | same |
| 121 | `kant-groundwork` | `modern-da` | Moderne Dansk | `1ec3983ff14eba1aed249aae2c85a4c53fb79546a8db14acdd3b2b82a5039da6` | 4 | 193 | 28778 | no | same |
| 122 | `beowulf` | `original-en` | Hall (1892) — J. Lesslie Hall | `18c82694331e87f4cdde7be99e9aba59cb4181b98a74a4bdc446e651c77e5c6a` | 43 | 375 | 24338 | no | same |
| 123 | `beowulf` | `modern-en` | Modern English | `e015cde16836f30df6af311f08d15bcbb7b9fcdf0bac4bce1dd180276e00b16a` | 43 | 375 | 25923 | no | same |
| 124 | `beowulf` | `modern-da` | Moderne Dansk | `3f0b1ff0518a747671f01fd8fb9d7d4214d90172baaa42a4b53d4d62d870d63d` | 43 | 375 | 23690 | no | same |
| 125 | `candide` | `original-en` | Fleming (1901) — William F. Fleming | `fd3eff9b64e01756c82a13f9fda47f0553a379377077f8feb5b7e3ff8e01a37d` | 30 | 709 | 32209 | no | same |
| 126 | `candide` | `modern-en` | Modern English | `e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25` | 30 | 709 | 31650 | no | differs: `136767b698e00213…` |
| 127 | `candide` | `modern-da` | Moderne Dansk | `5d461138e1b097dd40dadb76aedf108ec8e7efea4f19eb3d935af20a44d4e90d` | 30 | 709 | 31191 | no | same |
| 128 | `democracy-in-america` | `original-en` | Reeve / Bowen (1862) — Henry Reeve, revised by Francis Bowen | `9fbec200460aebc0c454ac87814dd7c13d93a1eff0c4c467078591c3bd5f35a4` | 96 | 2258 | 308203 | yes | same |
| 129 | `democracy-in-america` | `modern-en` | Modern English | `347cc8f0729f7fe0520163d153554a78e36d82e87b8c59777f4745a74e545662` | 96 | 2258 | 303372 | yes | same |
| 130 | `democracy-in-america` | `modern-da` | Moderne Dansk | `667bddd4728ecb4c64cb48efc5c01f3bbe87c39b318923957b6ae765bd5407f5` | 96 | 2258 | 277656 | yes | same |
| 131 | `oedipus-rex` | `original-en` | Storr (1912) — Francis Storr | `44edb377baee3bf5968e15927e1e6e9d581e4a8052eac4609fb49db9253b7926` | 11 | 474 | 12439 | no | same |
| 132 | `oedipus-rex` | `modern-en` | Modern English | `f96170b779e2c9faf1050b0ad4fa43222dc42ab4f96b2b58a5c372e09dc21281` | 11 | 474 | 13764 | no | same |
| 133 | `oedipus-rex` | `modern-da` | Moderne Dansk | `bd607d8644de54d136ec2b81a65dcfc6050963d959b09d745ee850ada8a1537a` | 11 | 474 | 13416 | no | same |
| 134 | `oedipus-at-colonus` | `original-en` | Storr (1912) — Francis Storr | `72f7f95bf433c0ba963a3e14521b6ca31c5811f1ba3478fb7af52f6f59c29b6e` | 11 | 566 | 13557 | no | same |
| 135 | `oedipus-at-colonus` | `modern-en` | Modern English | `5c18460809bf2eacfd1d3f17e5f31b7959f2fada81ddccc59a3588ba92683a7b` | 11 | 566 | 14767 | no | same |
| 136 | `oedipus-at-colonus` | `modern-da` | Moderne Dansk | `04a3c0a06f626a6508b1ae3d03b53acb4bb1016e26e964437b4bfda007c44885` | 11 | 566 | 14526 | no | same |
| 137 | `antigone` | `original-en` | Storr (1912) — Francis Storr | `628086763bedd01d73e653b9a372cb0f679a2870f524e8f25bf2703e663bf61b` | 11 | 318 | 10026 | no | same |
| 138 | `antigone` | `modern-en` | Modern English | `923ec3c1b9bcc3e1c2ddeeae4b6e65e4a1dfd72a425f769f02ff12565cdd05ff` | 11 | 318 | 10689 | no | same |
| 139 | `antigone` | `modern-da` | Moderne Dansk | `5bfac8c577539e955a8375d4d5db11ff1e4e46e98d47fcdb564f79cee06c5dbb` | 11 | 318 | 10391 | no | same |
| 140 | `genealogy-of-morals` | `original-en` | Samuel (1913) — Horace B. Samuel | `2377b4157b8e28c24a35bcb25e98c2b51a25be3abf0cb5bde71a59aa75550f4f` | 4 | 124 | 51776 | no | same |
| 141 | `genealogy-of-morals` | `modern-en` | Modern English | `72ca79453b9a485fa0a8277df452809dba80b87ecaf6985121e020ef51d30a9c` | 4 | 124 | 52860 | no | same |
| 142 | `genealogy-of-morals` | `modern-da` | Moderne Dansk | `4e1dc72f97f6c9ac48a3d65e98f1de0f0d85d6f7bf3d3f03083c2299b2b9e71e` | 4 | 124 | 49435 | no | same |
| 143 | `descartes-meditations` | `original-en` | Veitch (1901) — John Veitch | `98e410390472e0f6e3701987e10f2b44974cdac1e277ba4d520a9e959103961a` | 9 | 144 | 30126 | no | same |
| 144 | `descartes-meditations` | `modern-en` | Modern English | `789863ff9c80db5b86ba5d351db4ad2b1067dab0539bd118a7d66a2aba65ea51` | 9 | 144 | 29003 | no | same |
| 145 | `descartes-meditations` | `modern-da` | Moderne Dansk | `1327a6cd7eed7244bbb345cb49a1972debf6fabbb84bcc37762255969f6627d6` | 9 | 144 | 28476 | no | same |
| 146 | `on-liberty` | `original-en` | Original (1859) | `ce17fe17570e069d551921dbbf21ff84ac6d268fe6e624ebb8d64ba3a6d1c979` | 5 | 126 | 47029 | no | same |
| 147 | `on-liberty` | `modern-en` | Modern English | `12be1b0b5132554b0e19863654e4c0fa077e0cc267962106ed5e6e80eb6f1ff7` | 5 | 126 | 47144 | no | same |
| 148 | `on-liberty` | `modern-da` | Moderne Dansk | `d6e0ac08b19b767231d3c75a72b1a261e9d27905d63427578dee04a5db92d6e8` | 5 | 126 | 44797 | no | same |
| 149 | `utilitarianism` | `original-en` | Mill (1863) | `29360c7dbdc7de58c0b4e5794df9dfca5b9ca0199644499f45663130ea3c3acf` | 5 | 94 | 27499 | no | same |
| 150 | `utilitarianism` | `modern-en` | Modern English | `7457e909ce911b5043c692ccf51e7ce30266b5824aec22c10997931dfb737361` | 5 | 94 | 27074 | no | same |
| 151 | `utilitarianism` | `modern-da` | Moderne Dansk | `46ed443acf9c23bbce899a7a2b67b938192b6e4f6f1828e165e27594dc21cc94` | 5 | 94 | 26249 | no | same |
| 152 | `peloponnesian-war` | `original-en` | Crawley (1874) — Richard Crawley | `e50ada55ab4db8be8238f5b201f241478ff145f75073b79e09af48472e5f3d6a` | 26 | 998 | 204120 | yes | same |
| 153 | `peloponnesian-war` | `modern-en` | Modern English | `c035038d032ca4ec110b18df43b68d5a15c33cfef7c934170699a51313b90f75` | 26 | 998 | 200417 | yes | same |
| 154 | `peloponnesian-war` | `modern-da` | Moderne Dansk | `be09de1996e60086785e35052f5621b4b98fb776261e8398fa9e917f43053321` | 26 | 998 | 194376 | yes | same |
| 155 | `aristotle-politics` | `original-en` | Jowett (1885) — Benjamin Jowett | `0bf42e46f4c5c3738c11c437513f104b0e92847432128873d10a49f9fc16c2fc` | 8 | 478 | 90701 | no | same |
| 156 | `aristotle-politics` | `modern-en` | Modern English | `8ce0b1f6570584b4ba8168b25cb6ae365afcd0cc157cc4a0f15cd2d3efc62224` | 8 | 478 | 86194 | no | same |
| 157 | `aristotle-politics` | `modern-da` | Moderne Dansk | `57d699612aa360b08a72c2a5c6c800e0eae6c838b69f91a648295c389d1865fa` | 8 | 478 | 79838 | no | same |
| 158 | `leviathan` | `original-en` | Hobbes (1651) | `3ec71396aaa6dd3717e75900cffb1ecdd457189a6e945ef2e2be6ca96b41deb5` | 49 | 1337 | 207403 | yes | same |
| 159 | `leviathan` | `modern-en` | Modern English | `e3462f5d27dbc2f5af67dcc97ef4e37907d98977ab0c87730b9b13eea9fb0133` | 49 | 1337 | 209039 | yes | same |
| 160 | `leviathan` | `modern-da` | Moderne Dansk | `8d4bddbe08112fe26ef0efaa58189c01805f9ec987bc5e60b55a29e2d0d274e9` | 49 | 1337 | 198526 | yes | same |
| 161 | `fear-and-trembling` | `original-da` | Original (1843) | `c61144bbf51a930748799d4ff30ff48031ee12452ada5eb5391f684e8961d63a` | 8 | 232 | 40013 | no | same |
| 162 | `fear-and-trembling` | `original-en` | Original (English) | `d6f7ab72adfe4c161c5ab69b5bedda7e3bb519a92b0050d8b0b6f07d294e45a1` | 8 | 232 | 43777 | no | same |
| 163 | `fear-and-trembling` | `modern-en` | Modern English | `152776f19e1b707b610d2bee033d6984ed0f1e26826b314e2d0541d9c0b49132` | 8 | 232 | 43817 | no | same |
| 164 | `fear-and-trembling` | `modern-da` | Moderne Dansk | `f23fe5bb5f7d3fe3e575260bf4c2e5a6381cdf0927410ded72753bf5efaae3cf` | 8 | 232 | 40154 | no | same |
| 165 | `communist-manifesto` | `original-en` | Moore (1888) — Samuel Moore (edited by Engels) | `8b5b839176167eefeff135ee6e2a66d631af44293367540d09fa92e18cbdd5d3` | 5 | 213 | 11395 | no | same |
| 166 | `communist-manifesto` | `modern-en` | Modern English | `909c7496f66b1314666a2053ca056d1f2defc2cdf50ad44719208b38c153fc62` | 5 | 213 | 11282 | no | same |
| 167 | `communist-manifesto` | `modern-da` | Moderne Dansk | `6c4fafb667b40f265943a6bb531a4246a92f7c47192c0e2247abc1e6a7c5485e` | 5 | 213 | 10021 | no | same |
| 168 | `second-treatise` | `original-en` | Original (1689) | `efbd7cabd14ed99f98aabae7a95f48e8102db75f0b7aaae0054d0ffe4675b0d0` | 19 | 301 | 54832 | no | same |
| 169 | `second-treatise` | `modern-en` | Modern English | `177b364414c437af89fe5d09b8922d71ff772ccf7da6ec2e64c710ed061269bf` | 19 | 301 | 55556 | no | same |
| 170 | `second-treatise` | `modern-da` | Moderne Dansk | `7f5a7c98a4b9fe1a2dc409d0290364f93b9e8e77ec0a375605104f4d1f34929c` | 19 | 301 | 53431 | no | same |
| 171 | `hume-enquiry` | `original-en` | Hume (1748) | `49ce7d94889fd07f4cad5b5a8e81f15d3fb2c6707c33a6444e961d61d511f8b9` | 19 | 318 | 53644 | no | same |
| 172 | `hume-enquiry` | `modern-en` | Modern English | `8b9b306e32e35f9047f4f5247d07562b601024e014d9e93a373e6104204d3290` | 19 | 318 | 53188 | no | same |
| 173 | `hume-enquiry` | `modern-da` | Moderne Dansk | `228687c99a0293b8c616763c55a336081117e47d5154ae2fe79ed86e5aa74f3a` | 19 | 318 | 51710 | no | same |
| 174 | `social-contract` | `original-en` | Cole (1913) — G. D. H. Cole | `7bf5ababb7c4dfe1cec0230d44f64960d8b447c4802b6a716b52d770a5854157` | 48 | 491 | 44073 | no | same |
| 175 | `social-contract` | `modern-en` | Modern English | `cf7facb77bfc5bafc99cb4d7a236fd4f59d5f9ffc4554c6f063ee8daae273843` | 48 | 491 | 43231 | no | same |
| 176 | `social-contract` | `modern-da` | Moderne Dansk | `2b6fcfad924735d9fb32d6104d06057a066a2d5ce95b3422592b03e05c15ef3d` | 48 | 491 | 40640 | no | same |
| 177 | `wealth-of-nations` | `original-en` | Smith (1776) | `986785410f5c74e8e0d6efd4b963e93e80461eb2ec619788eb3e772d87f90c4b` | 32 | 2173 | 379438 | yes | same |
| 178 | `wealth-of-nations` | `modern-en` | Modern English | `d894aec39397bf2acd501fa3825eabbe0a60de6566bfee1b7a4272e3adf3f946` | 32 | 2173 | 352310 | yes | same |
| 179 | `wealth-of-nations` | `modern-da` | Moderne Dansk | `0aaf422e8430f3575b174215e3b77f2d13941ec64f22222ca06351b6500aff32` | 32 | 2173 | 336669 | no | same |
| 180 | `werther` | `original-en` | Boylan (1779) — R. D. Boylan | `db7393bfc33628a2f6eda4afbdac9918093740440ed4d6c5e23fe0e29dfdc374` | 84 | 354 | 42304 | no | same |
| 181 | `werther` | `modern-en` | Modern English | `f45d353204e356b34bd473e250ed557c8ec899d83cfd8076aeb7ee16b1a05bc0` | 84 | 354 | 40815 | no | same |
| 182 | `werther` | `modern-da` | Moderne Dansk | `e97c294c690fe118eb1a5556a5b399de7a1a7689f658a650d25deebb2b446916` | 84 | 354 | 40617 | no | same |
| 183 | `faust-part-1` | `original-de` | Goethe (1808) | `edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5` | 28 | 1056 | 30589 | no | same |
| 184 | `faust-part-1` | `original-en` | Bayard Taylor (1870) — Bayard Taylor | `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395` | 28 | 895 | 35368 | no | same |
| 185 | `faust-part-1` | `modern-en` | Modern English | `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` | 28 | 895 | 34570 | no | same |
| 186 | `faust-part-1` | `modern-da` | Moderne Dansk | `ce719108b40e89f1f008d16a62e1fa7dc9e1f1600b2481439696873f9b471191` | 28 | 895 | 33391 | no | same |
| 187 | `oresteia` | `original-en` | Morshead (1881) — E. D. A. Morshead | `c6189c462535c35845f110ed8a4c4fab2ac5be8ca9e5ce0879fc185fea54818c` | 26 | 771 | 34061 | no | same |
| 188 | `oresteia` | `modern-en` | Modern English | `861b154ade47183257f3bfe4e503fa758404a0e421659baa246840e3eb1aecfd` | 26 | 771 | 36797 | no | same |
| 189 | `oresteia` | `modern-da` | Moderne Dansk | `c131aa0ae927e741d6f08a78a042aa5c0fee844ab0d9c765b0eb54774c053f3c` | 26 | 771 | 35572 | no | same |
| 190 | `bacchae` | `original-en` | Murray (1906) — Gilbert Murray | `fd89db94d47b8a03eb008a7b94752c13145a9d2dcfb17e4e00adff5e474c8539` | 11 | 336 | 13451 | no | same |
| 191 | `bacchae` | `modern-en` | Modern English | `9d205d8b021e5028bcd59cfc5d4b6754cd9bfdf3df13e41348780f064f3322c3` | 11 | 336 | 14283 | no | same |
| 192 | `bacchae` | `modern-da` | Moderne Dansk | `0b34847e60f068f015fd5e93138749675e6079da410cc3f7de7a58d8fe535567` | 11 | 336 | 13644 | no | same |
| 193 | `medea` | `original-en` | Murray (1906) — Gilbert Murray | `6e6e27372c778b45fc9512196746a88cf8c3bbbdcd67ab0cf4145c9e3df01731` | 7 | 241 | 14167 | no | same |
| 194 | `medea` | `modern-en` | Modern English | `2d30ac0eb7fa802a6e5eef0b25e921ed119ef97a12d99622c118afac3978b3ae` | 7 | 241 | 14719 | no | same |
| 195 | `medea` | `modern-da` | Moderne Dansk | `37e6cf0812bb8bb70026a5281e6acc1be5aac81238e274ca6713ae6c4ba0849d` | 7 | 241 | 14522 | no | same |
| 196 | `confessions` | `original-en` | Pusey (1838) — Edward Bouverie Pusey | `64b39a8ae77d7175c904625fcc0bf3de13cb59e346e964b37ec8f5e47d95a6d7` | 13 | 462 | 111775 | no | same |
| 197 | `confessions` | `modern-en` | Modern English | `949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7` | 13 | 462 | 120854 | no | differs: `420b17153b6cb46f…` |
| 198 | `confessions` | `modern-da` | Moderne Dansk | `4935d43ca05f87da69b94c37d3b2079ed8591a7769cf45f57a213690ec0b19bb` | 13 | 462 | 63389 | no | same |
| 199 | `notes-from-underground` | `original-en` | Garnett (1918) — Constance Garnett | `c600f3f5ac6508240ab0bf733bff2b8944ef082c08d14b7834df52977698c237` | 21 | 495 | 44050 | no | same |
| 200 | `notes-from-underground` | `modern-en` | Modern English | `8df3e74890b26ce3febb108540f3a7a32fd3afdc93b1d047cbe6b053793a0449` | 21 | 495 | 42757 | no | same |
| 201 | `notes-from-underground` | `modern-da` | Moderne Dansk | `5654b6b12c596775fe92516cbf5c5c609087cbb787987870548fcd8159cf96fe` | 21 | 495 | 43942 | no | same |
| 202 | `magna-carta` | `original-en` | English Translation | `ca7447fb99a427bd9e12b00dcb4a0f5c7452f6da410b4111eb35d47bfacc560f` | 1 | 74 | 4525 | no | same |
| 203 | `magna-carta` | `modern-en` | Modern English | `cf7d388da295fff52af25f55d6dd692644b4ca96b521db4e9dc2525deaa5f586` | 1 | 74 | 4593 | no | same |
| 204 | `magna-carta` | `modern-da` | Moderne Dansk | `2f92e891bba2460c177191df84ba11efaaa60710b387c43264de0ab66da20800` | 1 | 74 | 4236 | no | same |
| 205 | `us-founding-documents` | `original-en` | Original (1776–1992) | `0972836459be1c06334145b4ae0130ae75f6355bdefab52e10fa9b3f2e2e953a` | 4 | 153 | 8851 | no | same |
| 206 | `us-founding-documents` | `modern-en` | Modern English | `4c6888a7cc0b24e1fa68f8781b71d052243828710063173f634c2ef8dcd8873b` | 4 | 153 | 8777 | no | same |
| 207 | `us-founding-documents` | `modern-da` | Moderne Dansk | `cfd2e1fea563365957e0dabfc5eb9523b86e07a46f6518fddb60afc6ee315527` | 4 | 153 | 7854 | no | same |
| 208 | `federalist-papers` | `original-en` | Original (1788) | `c733011184b5b42d48ac29dc73660ee631d039df0ff0572761724c7e0509d7e8` | 85 | 1279 | 188055 | yes | same |
| 209 | `federalist-papers` | `modern-en` | Modern English | `1974574ebce6859b2c7fdde48b524360b6348e0492e425861e8259076297278d` | 85 | 1279 | 178251 | yes | same |
| 210 | `federalist-papers` | `modern-da` | Moderne Dansk | `0f4dc8cf0faeb96af887a7d305960833122404dfd0f3bb51fae052547545656b` | 85 | 1279 | 167604 | yes | same |
| 211 | `frederick-douglass` | `original-en` | Douglass (1845) | `64bc808575f553642c412702be86b9a26164b15d63bc4266471645858b5e930a` | 12 | 162 | 36168 | no | same |
| 212 | `frederick-douglass` | `modern-en` | Modern English | `695db129557f339345670d8ea3abeceae6625101d91c530891ee303fe8321b0b` | 12 | 162 | 35673 | no | same |
| 213 | `frederick-douglass` | `modern-da` | Moderne Dansk | `45495079dc5f8ac4ce50d97bd56b9d4eab9f8117cf6218e85f114daa56a33bfe` | 12 | 162 | 36176 | no | same |
| 214 | `a-little-princess` | `original-en` | Original (1905) | `db6f42f1bdcc817ab8762339790b40606fd6512e95464ef4222af6e86aed1cdb` | 19 | 1701 | 66175 | no | same |
| 215 | `a-little-princess` | `modern-en` | Modern English | `5e359e936c37e8e79ea7738597da244b7356369558e59ada48fc0f32fde8a020` | 19 | 1701 | 66160 | no | same |
| 216 | `a-little-princess` | `modern-da` | Moderne Dansk | `3df7d45b3c5249db64d9b08b123489ee0efa1829c8c8cb8a352ca0062f823f99` | 19 | 1701 | 67106 | no | same |
| 217 | `jungle-book` | `original-en` | Kipling (1894) | `f1a9afbb1c7ee5ab30915e4c394588f6537ed74adc0880d514ff850b61e17d0b` | 7 | 944 | 50774 | no | same |
| 218 | `jungle-book` | `modern-en` | Modern English | `821357c6bb7dc016b819f89fd9f857ffcc78b057f5718cf0e66068b3f249c640` | 7 | 944 | 50675 | no | same |
| 219 | `jungle-book` | `modern-da` | Moderne Dansk | `574838d49e38cec0d3d8dae6b2e1c20ba89a2dd1dbd81867e020489769f8fa16` | 7 | 944 | 48749 | no | same |
| 220 | `around-the-world-80-days` | `original-en` | George Towle (1873) — George Towle | `e23ae1708c6e03657d0f542e70465cc32ba772fd21a6936d9cf7f1a63b5417d9` | 37 | 1613 | 62197 | no | same |
| 221 | `around-the-world-80-days` | `modern-en` | Modern English | `13b90c0526762af96d550fa512941dff043473c31c55efa877bb9465770745af` | 37 | 1613 | 61964 | no | same |
| 222 | `around-the-world-80-days` | `modern-da` | Moderne Dansk | `2d9a0c994c7eac94a2031ac7673ec4db5d392ad09a1d540d0eb715f42cff0c61` | 37 | 1613 | 59272 | no | same |
| 223 | `heart-of-darkness` | `original-en` | Conrad (1899) | `9d7234592e087f7d60a6dd460551347da283d5225fdcf81099a4b78b62bcede8` | 3 | 198 | 37904 | no | same |
| 224 | `heart-of-darkness` | `modern-en` | Modern English | `169c288c26f0c8c07be6d181855123cd982023a0b780262576944f5833afa435` | 3 | 198 | 37897 | no | same |
| 225 | `heart-of-darkness` | `modern-da` | Moderne Dansk | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` | 3 | 198 | 37898 | no | same |
| 226 | `discourse-on-inequality` | `original-fr` | Original (1755) | `6d62dac119c1f5cea89b175a3cc20ae2f1a9a7829c0475845360be4648f92cb8` | 4 | 170 | 30142 | no | same |
| 227 | `discourse-on-inequality` | `original-en` | Cole (1913) — G. D. H. Cole | `d3e7e7975ac634b98f685abcd7f6aae64b3621a74db31e1d229f2b6cfc4ba3bd` | 4 | 170 | 31639 | no | same |
| 228 | `discourse-on-inequality` | `modern-en` | Modern English | `78356e4ffdf62ec28c056fe871521967da428d31fafe694cad8b064f7019c62f` | 4 | 170 | 30692 | no | same |
| 229 | `discourse-on-inequality` | `modern-da` | Moderne Dansk | `383db95bbf30559d6ba41eb2045d37f2a24db49e9a3e80b2e246efb8e6b2c224` | 4 | 170 | 30253 | no | same |
| 230 | `jekyll-and-hyde` | `original-en` | Stevenson (1886) | `dc134b812fa478e45dfbe647db97ad0294463587b4b68a01a956f5c9fb34532b` | 10 | 339 | 25531 | no | same |
| 231 | `jekyll-and-hyde` | `modern-en` | Modern English | `7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b` | 10 | 339 | 25260 | no | differs: `f2cf24e93c77b354…` |
| 232 | `jekyll-and-hyde` | `modern-da` | Moderne Dansk | `5cf16e3333eefe1e73a96609acf6087e83f7fd726c9f9d2860d5777f7e00e105` | 10 | 339 | 24511 | no | same |
| 233 | `walden` | `original-en` | Thoreau (1854) | `880a909fb8da73db303b4b2ea43be64a1800bdafd82ffcac7cb2847232ed5cb3` | 18 | 502 | 106344 | no | same |
| 234 | `walden` | `modern-en` | Modern English | `d2d20614cb168f7dac5413213f98d41a9d21bd90ac3126fa592e52b58571f8ec` | 18 | 502 | 106370 | no | same |
| 235 | `walden` | `modern-da` | Moderne Dansk | `a289d165e360133b36b93d897734bdcd46ff440779413d1d6c381ff804aa081a` | 18 | 502 | 103081 | no | same |
| 236 | `vindication-rights-of-woman` | `original-en` | Wollstonecraft (1792) | `3e168f00ba7901f8a31cc36902f0046e9555d6fd5245566c437b029331e91aac` | 15 | 778 | 84393 | no | same |
| 237 | `vindication-rights-of-woman` | `modern-en` | Modern English | `4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63` | 15 | 778 | 83951 | no | same |
| 238 | `vindication-rights-of-woman` | `modern-da` | Moderne Dansk | `41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880` | 15 | 778 | 84072 | no | same |
| 239 | `comedy-of-errors` | `original-en` | Shakespeare (1623) | `84bba3a2afd91e5fa77f769259098cb68b45748e9e3f8a8f355a82215e0f354c` | 11 | 690 | 15997 | no | same |
| 240 | `comedy-of-errors` | `modern-en` | Modern English | `6319d77729e29c7b62f5f8f651469fcbd2cffb337b4e3b67367c364ee2698353` | 11 | 690 | 16186 | no | same |
| 241 | `comedy-of-errors` | `modern-da` | Moderne Dansk | `8c099fc4f43b2bd269d7c9161abcaab3e24adf75fb60a0a7bb9db116129beda2` | 11 | 690 | 16836 | no | same |
| 242 | `merchant-of-venice` | `original-en` | Shakespeare (1600) | `4897042eb44535622771253d9f1155d184c56b1b7450e17a3b2fcfa98ecbad20` | 20 | 779 | 21975 | no | same |
| 243 | `merchant-of-venice` | `modern-en` | Modern English | `a15d3a630dbfe538acdc0adc6db09ba391483c375fd24a02746a9a43b8443641` | 20 | 779 | 21608 | no | same |
| 244 | `merchant-of-venice` | `modern-da` | Moderne Dansk | `17d56d29af1104af20658b8d288d94cfa19919616e181011aed04fbbe9916c8e` | 20 | 779 | 22714 | no | same |
| 245 | `henry-v` | `original-en` | Shakespeare (1600) | `c66a930a2d877fc78b00c4a793a4c63d550f2042609b51c922ec3d9a18da081b` | 23 | 883 | 26750 | no | same |
| 246 | `henry-v` | `modern-en` | Modern English | `f2b9cab47fef45f65a6bb9b53aec30aaaaa33e9944de3e62ee482df133b9bb42` | 23 | 883 | 27135 | no | same |
| 247 | `henry-v` | `modern-da` | Moderne Dansk | `a31bc433de6026f9c34f84022e6fd0a1aa72fae9ed0dd49bb861ad05f4f6a85e` | 23 | 883 | 26991 | no | same |
| 248 | `as-you-like-it` | `original-en` | Shakespeare (1623) | `2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179` | 17 | 901 | 21470 | no | same |
| 249 | `as-you-like-it` | `modern-en` | Modern English | `df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4` | 17 | 901 | 21482 | no | same |
| 250 | `as-you-like-it` | `modern-da` | Moderne Dansk | `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` | 17 | 901 | 22227 | no | same |
| 251 | `winters-tale` | `original-en` | Shakespeare (1623) | `e725492b2ca705fc0dc46687b555a88e106100dff1b76a2cc0900473ea0b4295` | 15 | 911 | 25744 | no | same |
| 252 | `winters-tale` | `modern-en` | Modern English | `b85a81abca26b0a3d5ba2afe80e39afc13618c44b1de3addff024be57d53c346` | 15 | 911 | 26229 | no | same |
| 253 | `winters-tale` | `modern-da` | Moderne Dansk | `dc48224cf47bdced5c1ee828517ae300d7ed9cc8a5dad6c9604d9ffad832a553` | 15 | 911 | 27460 | no | same |
| 254 | `julius-caesar` | `original-en` | Shakespeare (1623) | `5368eeed767055335f97e708cd163dfb2fa17576a7cf4909844236438d8c087c` | 18 | 997 | 20592 | no | same |
| 255 | `julius-caesar` | `modern-en` | Modern English | `95a3e5b7516276f703bd77fb42992c6d76f27894619e1d7f147c290170baa952` | 18 | 997 | 20831 | no | differs: `ab371bca564b2e2f…` |
| 256 | `julius-caesar` | `modern-da` | Moderne Dansk | `977a7ebb2044578e99c50ce80ca0e68cef3160b4dc5abdd46851c5f8d94b6ee3` | 18 | 997 | 21542 | no | same |
| 257 | `twelfth-night` | `original-en` | Shakespeare (1623) | `bf69ddee77f588e6032f726a7cb81a18b3d60ca37f380ed2d76a5f9d756baed3` | 18 | 1120 | 21028 | no | same |
| 258 | `twelfth-night` | `modern-en` | Modern English | `95580e0b935cdfce4931acc61bd345c90b2ebbbae92bad677f09909ed2a5a5a0` | 18 | 1120 | 21490 | no | same |
| 259 | `twelfth-night` | `modern-da` | Moderne Dansk | `6082c3cbef7468f7144738817cc795c28d35fc112b53ef4635bbfe0f7379c9ff` | 18 | 1120 | 21747 | no | same |
| 260 | `measure-for-measure` | `original-en` | Shakespeare (1623) | `b99ee3fc8f98dca8ec96d44d1f88d3851a67c34b575ea3818d1616e32d22b343` | 17 | 1006 | 23200 | no | same |
| 261 | `measure-for-measure` | `modern-en` | Modern English | `d0e5a5ae2cf437bb6abaa4002d938224ec977e5d6f17360d7482d7e7a12f8331` | 17 | 1006 | 23245 | no | same |
| 262 | `measure-for-measure` | `modern-da` | Moderne Dansk | `f5e4e26b9dc5ac808959924b52a874ba4f8923978f8ce087cbf2410598ec014d` | 17 | 1006 | 23562 | no | same |
| 263 | `henry-iv-part-2` | `original-en` | Shakespeare (1600) | `5312386825366dc9945e915fa5474a680d89fcc2dbceb740f84288a4f5e2f38c` | 19 | 1081 | 26974 | no | same |
| 264 | `henry-iv-part-2` | `modern-en` | Modern English | `5488605e212b451b6693e21690babd7690cb5f295a62ffac479519cb394cd203` | 19 | 1081 | 27330 | no | same |
| 265 | `henry-iv-part-2` | `modern-da` | Moderne Dansk | `789c2f3e84b5af3fdc2a68538963d9ec98490a10e7f4236f84ed7d4f2c47d267` | 19 | 1081 | 27654 | no | same |
| 266 | `merry-wives-of-windsor` | `original-en` | Shakespeare (1623) | `4ee59167c634e42eb81ede9d58ec481aedf55931bfd5fd953b9c0713a2c6b280` | 23 | 1155 | 23458 | no | same |
| 267 | `merry-wives-of-windsor` | `modern-en` | Modern English | `9c5531e4d3ff43f4604e08517a3059460d3aee6f9f59fde3282fa61203f61010` | 23 | 1155 | 23555 | no | same |
| 268 | `merry-wives-of-windsor` | `modern-da` | Moderne Dansk | `f41ce14ebf382e02174e0d971bf0efc161d2b8fb579abfcd5e586b20e8f88f28` | 23 | 1155 | 24011 | no | same |
| 269 | `othello` | `original-en` | Shakespeare (1622) | `a8e8ae40b054bce1b60dcba35fcd194f08e74829fcc0faa6665456f962b5d1df` | 15 | 1391 | 27549 | no | same |
| 270 | `othello` | `modern-en` | Modern English | `5beb0f0093ef10f1d725b797c3eef7cdfe370b3d74be8738f4fd01431dbdb04d` | 15 | 1391 | 28200 | no | same |
| 271 | `othello` | `modern-da` | Moderne Dansk | `048b82fecf563ec728efa40b1a0bcb94cfc7cef907ef6c07c3e780a842d5b168` | 15 | 1391 | 28989 | no | same |
| 272 | `king-lear` | `original-en` | Shakespeare (1608) | `6a8c008eae10905969decc11ef6f7c56e563c68de8597f11f7c52dc3d7732bb5` | 26 | 1371 | 27157 | no | same |
| 273 | `king-lear` | `modern-en` | Modern English | `9f4719b82396b06f919866a68fcfab53427865248f959dd6eff16e80b04b920c` | 26 | 1371 | 27973 | no | same |
| 274 | `king-lear` | `modern-da` | Moderne Dansk | `b330f5edaddf72173f8958ee61ba3d027fdc5f6d0a5fb111e8bdc6bef56c9cf5` | 26 | 1371 | 28472 | no | same |
| 275 | `much-ado-about-nothing` | `original-en` | Shakespeare (1600) | `dd00eb7a88235b9852807ce3d52b7bc5c99d2dd391816465e063fffd0d2c7628` | 17 | 1118 | 22347 | no | same |
| 276 | `much-ado-about-nothing` | `modern-en` | Modern English | `3b92db2e6ffc9d6b06eb0e3e6b15edaba45f2ed3495ddb2cb999c5b10eddf1af` | 17 | 1118 | 21977 | no | same |
| 277 | `much-ado-about-nothing` | `modern-da` | Moderne Dansk | `2d45f4afa4ee771a8258be9ce63e68d4c5aaeef83372fc81d5d4f0affa2a38fa` | 17 | 1118 | 22966 | no | same |
| 278 | `taming-of-the-shrew` | `original-en` | Shakespeare (1623) | `2fa6c01140bd2544025574f3b486668695917743734092cf297cce0ddce72b8e` | 12 | 1021 | 19554 | no | same |
| 279 | `taming-of-the-shrew` | `modern-en` | Modern English | `65f0c9c6d2da2732126c82386f4da63be0089283e42ef7001697c53dc8882376` | 12 | 1021 | 20283 | no | same |
| 280 | `taming-of-the-shrew` | `modern-da` | Moderne Dansk | `9764e1bffb4062b35dcddd22e41de0f70f26169e0d8c5b8a9afa7652a3671e2e` | 12 | 1021 | 21070 | no | same |
| 281 | `antony-and-cleopatra` | `original-en` | Shakespeare (1623) | `1e768f7514f9746ced869799b520c0592a96165101c6a8be4f1f5347093a8a8b` | 42 | 1513 | 25987 | no | same |
| 282 | `antony-and-cleopatra` | `modern-en` | Modern English | `6cd4739c60b8cda93545514560503eca9bfeef36355dff9896a6a087bf4c2654` | 42 | 1513 | 26847 | no | same |
| 283 | `antony-and-cleopatra` | `modern-da` | Moderne Dansk | `97f45e0b01d5a14aaa5b91d6b127a80f7ecf0af0ed30ed0e86475850aa850b8f` | 42 | 1513 | 27731 | no | same |
| 284 | `richard-iii` | `original-en` | Shakespeare (1597) | `891ead74f6cbcfa6acd05afc92b3e7798c4aa2105a1e7011086e8b2853e3a449` | 25 | 1420 | 30808 | no | same |
| 285 | `richard-iii` | `modern-en` | Modern English | `30204ef16006235b5dfad0a5281469da176f220f6b89e97f071efb523ce56b6f` | 25 | 1420 | 31425 | no | same |
| 286 | `richard-iii` | `modern-da` | Moderne Dansk | `15ce2bdaa6368395328d71fba70adb9f3eb75064831ae228a8bcfa14fc90943b` | 25 | 1420 | 31720 | no | same |
| 287 | `coriolanus` | `original-en` | Shakespeare (1623) | `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da` | 29 | 1379 | 28925 | no | same |
| 288 | `coriolanus` | `modern-en` | Modern English | `cb7175962445184e3d28082130a5eee53b66dee497c1f92d9d516f512de8b488` | 29 | 1379 | 29795 | no | same |
| 289 | `coriolanus` | `modern-da` | Moderne Dansk | `187cf22c3daab3d621d7b1906c4de9e2c76d3b6aa70e1957c4f7830b0f42f462` | 29 | 1379 | 30556 | no | same |
| 290 | `cymbeline` | `original-en` | Shakespeare (1623) | `5f25167f50db13c867e42eaa594a989b52651e122034987181c5065cfd919749` | 29 | 1133 | 28441 | no | same |
| 291 | `cymbeline` | `modern-en` | Modern English | `9fbacf6307e227a64ec6ccb4624a1afc4b41b890f045904eb2ca1276040580b0` | 29 | 1133 | 29610 | no | same |
| 292 | `cymbeline` | `modern-da` | Moderne Dansk | `0ed7dbb0a97f39216e9a520a85e4fa31dc1fe7658630fcc9c7a3e7d904e12dd6` | 29 | 1133 | 30097 | no | same |
| 293 | `anna-karenina` | `original-en` | Garnett (1901) — Constance Garnett | `6318124f6f65f5deef18f48553b01e219487ccd87fbfee1db90e36d63e25cbf0` | 239 | 7442 | 349256 | yes | same |
| 294 | `anna-karenina` | `modern-en` | Modern English | `e19b01c5f4c5264ba44191e90cb08c6436d485a44ed30277311e7d4c918bcfb7` | 239 | 7442 | 347559 | yes | same |
| 295 | `anna-karenina` | `modern-da` | Moderne Dansk | `c7048c6c352472195d0db79e152e930465a58704b556cd016671989cb2a098e5` | 239 | 7442 | 350806 | yes | same |
| 296 | `don-quixote` | `original-en` | Ormsby (1885) — John Ormsby | `f7f7785e59136d881566bd893f76d3661a027e7c094cfacc5937f350b4e4e2f3` | 126 | 3939 | 402675 | yes | same |
| 297 | `don-quixote` | `modern-en` | Modern English | `6610ca122d1db97f18ec521c390c73ff15360073ed919c7598d6efa6ad44bdf2` | 126 | 3939 | 395083 | yes | same |
| 298 | `don-quixote` | `modern-da` | Moderne Dansk | `4865fe9fbead905576cc28f242b01f1b48f7ef9012b811108e2a731aa6281fe2` | 126 | 3939 | 394739 | yes | same |
| 299 | `essays-montaigne` | `original-en` | Cotton/Hazlitt (1877) — Charles Cotton, ed. William Hazlitt | `2d7353e85164e3a1426003ae17857136460edc0e2dab21a1ee0ee507c8076dd5` | 107 | 4897 | 477531 | yes | same |
| 300 | `essays-montaigne` | `modern-en` | Modern English | `b9a1d95cff1ad62b23d0250e242ed8f7541bf0a77495faf52f1a9cad6338b4ed` | 107 | 4897 | 467978 | yes | same |
| 301 | `essays-montaigne` | `modern-da` | Moderne Dansk | `2648f8229519686a4ddaa3f8c587a3f168e333dbd3937255240ab3f38ea326fe` | 107 | 4897 | 463080 | yes | same |
| 302 | `ivan-ilyich` | `original-ru` | Смерть Ивана Ильича (1886) | `3e9654b561b5e2c6d890b1292d37b88499a3c0ce8b112ba454979900ca0d5e93` | 12 | 374 | 17758 | no | same |
| 303 | `ivan-ilyich` | `original-en` | Maude — Louise & Aylmer Maude | `2b9d02f6a874058e212f44b6f0c978db24171aa66d4623a6ebf5242a11d4ccda` | 12 | 298 | 22285 | no | same |
| 304 | `ivan-ilyich` | `modern-en` | Modern English | `1bb15d1bc0758feadd7ccd239ecc5f8b87d53b9676915d4b3e222d9235e0d5a6` | 12 | 298 | 22810 | no | same |
| 305 | `ivan-ilyich` | `modern-da` | Moderne Dansk | `7b420f9e7d3d8a477ae024fb20aa0f8746a62aeec9839c42e007e0af9098093a` | 12 | 298 | 23148 | no | same |
