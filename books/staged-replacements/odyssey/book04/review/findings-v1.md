# Independent review — the Odyssey, Book 4, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer session; did not draft the candidate, did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/odyssey-modern-en-20260911`, own worktree off head `d6d97ebb1` |
| Candidate | `book04/candidate-v1.json`, sha256 `9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553` — recomputed locally; matches `README.md`, `provenance.json`, `manifest.json` and `continuity.md`. 81 paragraphs, 27 packets. |
| Source | `book04/source-book4.json` sha256 `b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70`, recomputed and byte-identical to chapter 4 of `app/public/data/editions/odyssey-original-en.json` sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`; PG base `source-texts/pg1727-butler-1900.txt` sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`. All recomputed and matching. |
| Mechanical checks | The README's block re-run verbatim, unmodified, from `books/staged-replacements/odyssey`: `OK — 81 paragraphs, coverage exact, packets verbatim, names and hazards held` / `OK — ratio 0.9999 | Butler token retention 0.960 | D4 unbalanced paragraphs 21`, and the three printed hashes identical to the README's expected output. **Every assertion in that block passes.** |
| Source-verification claim | **Verified independently by a fifth kind of rule, and it holds** — with one property added that the package does not currently assert. Section A. |
| Packets reviewed | `packet-01.md` … `packet-27.md`, in order, three paragraphs at a time with the `CONTEXT ONLY` neighbours; then the candidate read straight through against Butler. Coverage `B04-P001`…`B04-P081`, each exactly once. |
| Translations consulted | Butler 1900 only. Fagles, Lattimore, Wilson, Fitzgerald and every other in-copyright translation were **not** read. The served `odyssey-modern-en.json` was opened **once**, to count occurrences of three names and nothing else (section C); no wording in this file comes from it. |
| Files added by this review | `book04/review/findings-v1.md`, `book04/review/README.md`, `book04/review/verify_source_book4_review.py`, `book04/review/retention_measure.py`. Nothing else is touched; the candidate is not modified. |

## Verdict

**Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must be fixed before acceptance) | **1** (Book-level, naming 12 paragraphs) |
| minor (worth improving) | **21** paragraph-level |
| optional (preference, no defect) | **11** paragraph-level |
| records (outside the text) | **7** |
| paragraphs with no material issue at all | **53** |

**Nothing is lost and nothing is invented.** A full scan for content words the candidate adds that are not in its own source paragraph returns substitutions and spellings only: no claim, motive, quantity, relationship, genealogy, negation, condition or causal link is added anywhere in the Book, and none is dropped. Every quantity the instructions list survives intact — the two baths, two tripods and ten talents; the four seal skins and four pits; the twenty warriors and the twenty-man crew; the two talents; the twelve brood mares; the eight years, the twenty days, the whole year, the ten-or-twelve days twice, the twelve months, the three best men, the three horses. Every genealogy is exact. The name census matches the source name for name. Every one of the twenty-one D4 paragraphs is unbalanced in exactly the source's places, 71 open against 50 close, each continuing paragraph opening its own mark. The three hecatombs are plain descriptions with no number. The hyphen corruption is genuinely absent, everywhere.

**The one substantive finding is the answer to the question this Book was sent to review with.** It is not a defect of meaning; it is a defect of scope. Book 4 v1 modernizes Butler's *vocabulary* thoroughly and his *syntax* hardly at all, and the gap between those two is what 0.960 is measuring. The three accepted Books broke 100%, 43% and 33% of their sixty-word Victorian sentences; Book 4 breaks **one of seventeen**, out of the densest supply of them in the package. Section B rules on it, with the measure, the audit of the measure, and the twelve paragraphs by name.

All five things the Book puts to the reviewer are ruled on: the retention figure (**section B**, substantive), the three new name rows (**C**, upheld, warrant corrected), D12 class C at B04-P001 and B04-P052 with `abode` → `home` (**D**, upheld), the B04-P040 quotation repair (**E**, upheld), and the one break in the `heaven` census (**F**, upheld). The two further questions put by the task — `tell me, and tell me true` against Book 3's row with the seven byte-identical paragraphs (**H**), and Butler's open `sweet meats` at B03-P037 (**I**) — are ruled on as well.

---

## A. Source verification, by my own rule — it holds, and I can add one property to the record

I did not re-run `scripts/verify_source_book4.py`. `book04/review/verify_source_book4_review.py` (added by this review, read-only) is a **fifth** kind of rule, unlike the four already used:

- Book 2's drafter anchored on PG's footnote-entry list, positionally;
- Book 3's drafter anchored structurally on the `BOOK III` / `BOOK IV` headings and diffed with the apparatus still in;
- Book 3's reviewer asked whether the served Book occurs as one contiguous letter-token block in PG, exactly once — anchorless and digit-blind;
- Book 4's drafter took two needles out of the served text, required each to occur exactly once, and derived a region from them.

**Mine is global per-paragraph fingerprint alignment.** It uses no heading, no Book number, no `FOOTNOTES:` line, no digit and no needle, and it never derives a region. It cuts the **whole** PG file into blank-line blocks with the apparatus still in (1,382 blocks — an output), fingerprints every block as a lowercase letters-only token tuple, fingerprints each served paragraph the same way, and asks three questions whose answers are outputs: does each served paragraph's fingerprint occur **exactly once** in the whole file; are the 81 hits **strictly consecutive**; and does a character-level diff against those blocks contain anything but classified markers, case and whitespace.

```
blocks in the whole file: 1382  (an OUTPUT — no region is assumed)
all 81 served paragraphs have a fingerprint match somewhere in PG
each of the 81 matches is UNIQUE among the 1382 blocks of the whole file
the 81 matched blocks are STRICTLY CONSECUTIVE, blocks 164..244
region: PG lines 1551..2269  (an OUTPUT, never an assumption)
footnote-marker deletions : 14      letter-case differences : 1 [('B04-P001','t','T')]
whitespace-only diffs     : 0       every other difference  : 0
markers: [36,37,38,39,40,41,42,43,44,45,46,47,48,49]  ascending, no repeats
of those, NOT glued to the previous word: 1 [('B04-P034','44','44 ')]
every digit run inside the located region is one of the classified markers
81 of 81 paragraphs match PG word for word; 8042 words compared, 0 mismatches
```

**Every claim the package makes about this Book's source is confirmed, independently**: 81 of 81 byte-identical after removing only the 14 markers, 8,042 words word-for-word, B04-P001's `they` → `They`, and marker **44 space-set** rather than glued — reproduced by a rule that has no glued-only removal step anywhere in it, so the confirmation is not the same clause firing twice.

**Six negative controls**, including two the earlier rules could not run: two paragraphs swapped breaks consecutiveness; two paragraphs **merged** is detected, because a merged paragraph's fingerprint matches no single block; one letter changed; one word dropped; an invented paragraph occurs zero times; and a changed **number-word** is detected. The last is the declared limit paid for rather than waved away: a letters-only fingerprint is blind to numerals, and step 3 shows that **every digit run in the located region is a footnote marker**, so Butler writes all of Book 4's quantities in words and there is no numeral of his for the fingerprint to be blind to.

**The property I can add, which the package does not currently assert.** A contiguous-token-block rule proves the *words* are PG's and in PG's order; it is blind to where the paragraph breaks fall, because breaks are not tokens. A needle-and-region rule proves the boundaries of the region. Neither proves the *interior* boundaries. Consecutive unique per-paragraph matches do: **the served file's paragraph division in Book 4 is PG's own blank-line division, paragraph for paragraph.** That is the property the product's alignment contract actually rests on — audio, Cast data and saved reading positions key on the paragraph index — and it is worth stating in `PROVENANCE.md` in those terms rather than as a count that matches. (Records finding **R7**.)

**Verdict on section A: the source verification holds under my own method, and the record in `book04/README.md`, `continuity.md` §1 and `provenance.json` is accurate as written.**

### A bis — the two whitespace artefacts, confirmed from PG directly

Both are real, and both are exactly as recorded.

- **Marker 44 is space-set.** PG line 1880 reads `bring with them. 44 Early to-morrow morning…`. My diff classifies the deletion as `'44 '` — the marker *and* one following space — which is the served file's own behaviour, and the net effect is a single space. Confirmed.
- **Marker 48's artefact.** PG line 2055 *begins* `48 None of our islands have much level ground…`. Removing the glued marker leaves a line that begins with a space, so the served B04-P050 contains `\n None of our islands`, which flattens to a doubled space for display, search and audio. Confirmed as the only instance in Books 3–4. **The candidate prints one space**, and my own scan of the frozen candidate finds no doubled space, no leading or trailing space, no tab, no non-breaking space and no newline in any of the 81 paragraphs. The check block asserts both halves and should keep doing so.

This is the right disposition and it deserves one sentence in `PROVENANCE.md` that it does not have: the served file is **faithful** here — PG minus the digits is exactly that — so the doubled space is not a defect of the served file to be repaired under A3, it is a property of the base text that the modern column silently normalizes. Recorded so that a later worker meeting it does not open a repair ticket against `odyssey-original-en.json`.

---

## B. Ruling on the retention figure — **substantive finding S-1**

> **0.960 is half the source's and half the drafter's, and the drafter's half is entirely on Butler's syntax. Book 4 v1 is a thorough modernization of Butler's vocabulary and a touch-up of his sentences. More of his chained syntax should have been recast, and the twelve paragraphs where it should have been are named below.**

### B.1 Why retention alone cannot settle it, and what I measured instead

`continuity.md` §6 is right that the question is open and right that the archaism-density argument does not close it. The reason it does not close it is structural: **retention is one number doing two jobs.** It falls when a drafter replaces a word and it falls when a drafter moves a word — and a Victorian period is modernized mostly by the second operation, which a vocabulary swap does not perform. A draft that replaces every dead word and moves nothing scores high; so does a draft whose source had no dead words. Those are the two explanations on the table, and the figure cannot tell them apart.

`book04/review/retention_measure.py` (added by this review, read-only) splits it exactly:

```
    bag retention    Rb = |multiset(cand) ∩ multiset(src)| / |src|     pure vocabulary
    order retention  Ro = LCS(src, cand) / |multiset intersection|      pure syntax
    retention R = Rb × Ro, exactly
    ΔS = (candidate sentences − source sentences) per 100 source words
```

and scores the source's *demand* on two axes computed on Butler alone: **A**, dead forms per 100 words on the package's own guard list; **C**, chain load — mean sentence length, semicolons, and mid-sentence coordinations per 100 words. The standard it is scored against is **not my taste**: it is the 98 paragraphs of accepted Books 1 v3, 2 v3 and 3 v2, which went through this package's own independent review and were accepted.

### B.2 The audit, which threw half the measure away before I used it

Printed by section 1 of the script, and the fourth test is the one that matters:

| | |
|---|---|
| **A1 identity** | `Rb × Ro` reproduces the package's retention exactly for Books 2, 3 (excluding B03-P038, as `book03/README.md` does) and 4. It does **not** reproduce Book 1's quoted 0.721 — records finding **R2**. |
| **A2 floor** | the seven paragraphs the check block calls byte-identical score `Rb = Ro = 1.000`, `ΔS = 0`. The measure's zero is where it must be. |
| **A3 discrimination** | 95 of 186 paragraphs have \|Rb − Ro\| > 0.05. The split is not cosmetic. |
| **A4 predictiveness** | in the **accepted** Books, chain load C predicts sentence splitting (Spearman ρ = **+0.380**, n = 98) and does **not** predict order retention (ρ = +0.048). |
| **A5 name blindness** | the Roman→Greek map is normalized on both sides; no mapped name can move a number. |
| **A6 length** | ρ(C, paragraph words) = **−0.001**. C is not paragraph length in disguise. |

**A4 is the audit that decides what may be used.** A demand measure that predicts nothing in accepted work cannot convict a new draft of anything. So **only the C → ΔS channel grounds a finding**; `Ro` is reported throughout and is never the basis of one. That is a real cost — it means I cannot convict on clause reordering, only on sentence division — and the finding survives it comfortably.

### B.3 Where Book 4's source really is plainer, and where it is not

| Book | dead forms / 1,000 words | median words / sentence | median chain load C |
|---|---|---|---|
| 1 | 1.46 | 30.2 | 6.75 |
| 2 | 3.35 | 30.0 | 6.65 |
| 3 | 4.49 | 28.1 | 6.21 |
| 4 | **2.98** | **29.8** | **6.70** |

The drafter's vocabulary claim **reproduces on a different word list**: Book 4's source is markedly less archaic per word than Book 3's. My list gives a ratio of 1.5× where the package quotes 1.8×, which is the expected spread between two hand-built lists and is the same direction. That half of the defence is sound, and the 71 speech openings are real.

**The syntax claim is not available, because it is not true.** Butler's sentences in Book 4 are as long and as chained as in Books 1–3, and by the plainest count his sixty-word periods are **denser** here than anywhere else in the package: 17 in 8,042 words, 2.11 per 1,000, against 1.95, 1.67 and 1.92. Book 4 is not a plainer Book to modernize. It is a Book whose *words* are plainer and whose *sentences* are the hardest the package has met.

### B.4 The answer, in two counts that need no measure of mine

| Book | sentences, source → candidate | 60+ word sentences, source → candidate |
|---|---|---|
| 1 v3 (accepted) | 132 → 159 (**+20.5%**) | 8 → 0 (**−100%**) |
| 2 v3 (accepted) | 137 → 159 (**+16.1%**) | 7 → 4 (**−43%**) |
| 3 v2 (accepted) | 164 → 173 (**+5.5%**) | 9 → 6 (**−33%**) |
| **4 v1 (candidate)** | **281 → 282 (+0.4%)** | **17 → 16 (−6%)** |

And with the calibrated bands, on paragraphs of 40+ words, using terciles of chain load taken from the accepted corpus:

| corpus | tier | n | median ΔS | adds **no** sentence |
|---|---|---|---|---|
| accepted 1–3 | low | 32 | +0.00 | 84% |
| accepted 1–3 | mid | 32 | +0.00 | 53% |
| accepted 1–3 | **HIGH** | 33 | **+0.68** | **39%** |
| Book 4 v1 | low | 26 | +0.00 | 100% |
| Book 4 v1 | mid | 20 | +0.00 | 95% |
| Book 4 v1 | **HIGH** | 25 | **+0.00** | **100%** |

Accepted work splits **61%** of its most chained paragraphs. Book 4 v1 splits **0%** of its own — twenty-five paragraphs, not one of them broken. On the same test, 7 of 33 accepted HIGH-tier paragraphs (21%) keep both Butler's sentence count and his clause order; in Book 4, 20 of 25 (80%) do.

**So: the lightness is the source's on the vocabulary axis and the drafter's on the syntax axis, and the second is the larger half of the gap between 0.960 and the 0.897–0.902 the package has been accepting.** This is not a hidden defect. It is visible in the text: B04-P041 is a single ninety-three-word sentence of Butler's that reaches the candidate as a single eighty-nine-word sentence with two words changed (`broken hearted` → `heartbroken`, `tell me, and tell me true` → `tell me truly`). Read as a modern reading edition, that paragraph has not been modernized; it has been proof-read.

### B.5 Why this is substantive rather than minor

The package's own accessibility standard, quoted in `WORKFLOW.md`, requires that "old vocabulary and **tangled syntax** are simplified without simplifying away the ideas", and its voice rules require replacing "long chained clauses with clear modern syntax". The accepted Books do it; this draft, for the hardest source in the package, does it once. A reader who meets Books 1–3 and then Book 4 meets a different edition at Book 4 — and the paragraphs where they meet it are the ones carrying instructions they have to follow (Idothea's ambush recipe, Proteus's conditions for getting home), which is the worst possible place for a ninety-four-word chain.

It is also the class of defect a correction round can fix cheaply and safely. Every proposed recast below is a **division** of a sentence Butler already wrote, using his own words and his own order — the operation the accepted Books performed 58 times between them. Nothing needs new wording.

### B.6 The paragraphs, named

**Primary — recast required (nine):** each keeps Butler's sentence count **exactly** (ΔS = 0) and each contains a surviving sentence of **sixty words or more**. Seven of the nine are in the HIGH chain-load tier (C ≥ 7.74); **B04-P029** (C = 7.67) and **B04-P037** (C = 7.49) sit just under it and are named on the long-sentence count alone, which is stated here rather than blurred.

| para | words | surviving long sentence | what is wrong with leaving it |
|---|---|---|---|
| **B04-P041** | 89 | the whole paragraph, **one sentence** | the clearest case in the Book: two lexical swaps and nothing else, over a ninety-word period with a nested quotation inside it |
| **B04-P035** | 94-word sentence | "He will turn himself into every kind of creature… what you must do to reach your home over the seas." | five semicolons in one sentence, and it is a **set of instructions the reader has to follow**; Butler's own semicolons mark the joints where it divides |
| **B04-P021** | 80-word sentence | "He killed many Trojans… deficient either in person or understanding." | carries the dead connective `for all which things` **unchanged** (finding 21.1) at the hinge of the longest sentence in Helen's speech |
| **B04-P045** | 77-word sentence | "Presently, when I had had my fill of weeping and writhing on the ground, the old man of the sea said, ‘Son of Atreus…" | a 30-word subordinate front-load before the speech tag is reached |
| **B04-P050** | 74-word sentence | "I will take no horses back with me to Ithaca… and I like it the better for that." | Telemachus's refusal, its reason, the Lacedaemon catalogue and the Ithaca contrast in one period held together by `for` and `whereas` |
| **B04-P009** | 71-word opener | "No one, my sons, can hold his own with Zeus… before I could get home with my fleet." | the Book's longest speech opens on a 71-word sentence with two `but`s and a dash-parenthesis; the accepted Books break exactly this shape |
| **B04-P040** | 68-word sentence | "‘Then,’ he said, ‘if you would finish your voyage… reign in heaven." | Proteus's **conditions**, the load-bearing sentence of the Book's plot, in one chain |
| **B04-P037** | 67-word sentence | "Lying in wait there would have been unbearable… killed the smell of the seals." | a dash-parenthesis inside a `but here, too` reversal inside a `for` clause |
| **B04-P029** | 66-word sentence | "Now off Egypt, about as far as a ship can sail in a day… to help me forward." | the Pharos geography, an em-dash parenthesis and the becalming in one sentence; the geography is what a reader must hold |

**Secondary — should be looked at in the same pass (three):** **B04-P064** (HIGH tier, 64-word sentence, and see finding 64.2), **B04-P066** (HIGH tier, 62-word sentence inside Eurycleia's confession), **B04-P011** (mid tier, 62-word Polybus catalogue, where the gifts a reader is asked to keep straight arrive in one sentence).

**Deliberately NOT named, and why — this is a limit on the finding, not an oversight.** **B04-P038**'s 105-word sentence is the longest surviving in the Book and I am **not** asking for it to be divided: it is Proteus's shape-changing, where the chain *is* the effect — lion, dragon, leopard, boar, water, tree arriving without a stop is the sentence doing the work of the scene. **B04-P042**, **B04-P072** and **B04-P076** likewise read cleanly at length. The accepted Books did not break every long sentence either; Book 2 kept four and Book 3 kept six. The finding is not "no sentence may exceed sixty words". It is that **sixteen of seventeen** is not a judgement, it is an absence of the operation.

### B.7 What the correction round should do, and what should not happen to the number

Divide the nine, look at the three, leave B04-P038 alone. **Retention will fall — that is the point, and it must not be resisted.** Sentence division alone moves retention very little (it neither drops nor moves a word), so the figure will land near 0.95, not near 0.90; **do not chase 0.897 by replacing words to make the number move.** Book 2's round 1 established that a correction round raising retention is healthy when the corrections put Butler's words back; the mirror rule belongs beside it: a correction round whose whole content is dividing Butler's own sentences should barely move retention at all, and if it moves a long way, something other than the finding was done.

