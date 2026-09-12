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
| substantive (must be fixed before acceptance) | **1** (Book-level, **S-1**, naming 12 paragraphs) |
| minor (worth improving) | **16** paragraph-level |
| optional (preference, no defect) | **11** paragraph-level |
| records (outside the text) | **7** |
| paragraphs carrying a finding of their own | **25** |
| paragraphs with no material issue at all (no finding, not in the S-1 set) | **50** |

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

---

## C. Ruling on the three new name rows — **upheld, and the warrant is wrong**

> **Venus → Aphrodite, Juno → Hera, Vulcan → Hephaestus are right, applied correctly, and every hazard holds. But the evidence cited for them is the weakest of the three sources D5 used, and the rows should rest on D5's rule instead.**

### C.1 The application is clean, asserted by enumeration, and I can confirm every hazard

I ran an independent census rather than checking the drafter's: every capitalized token in the source, against every capitalized token in the candidate.

```
capitalised source tokens NOT present in the candidate:
  Bid, Daughter, Diana, Euryclea, Jove, Juno, Master, Minerva, Neptune,
  Our, Therefore, Thereon, Thus, Ulysses, Venus, Vulcan, Would
capitalised tokens NEW in the candidate:
  Aphrodite, Artemis, Athena, Eurycleia, Everyone, Hephaestus, Hera,
  Lying, Odysseus, Poseidon, Zeus
```

Every proper name that leaves is a mapped Roman form; every proper name that arrives is its mapped Greek form. The rest of both lists is sentence-initial words and `Everyone`/`Lying`. **No name was invented and none was lost.** Counts match the source exactly, name for name (Odysseus 18, Zeus 11, Athena 7, Poseidon 3, Aphrodite 2, Artemis 1, Hera 1, Hephaestus 1, Eurycleia 1).

Hazards, asserted rather than assumed: `Ops` does not occur in Book 4 at all, so the hazard that actually fires elsewhere cannot fire here, and `Rhea` is absent — correct; `Same` does not occur (Butler writes `Samos` in this Book), so case-insensitivity could not have destroyed it here; `Helios` and `Cronos` absent. Already Greek and correctly untouched: Apollo, Hades, Proteus, Calypso, Oceanus, Rhadamanthus, Halosydne, Paeeon, and every mortal. `Diomed` flagged not corrected, twice, as in Book 3. `Idothea` left alone — **correct**: the Cast has no display name for her (I checked `odyssey-threads.json` directly: `Idothea` 0, `Eidothea` 0), so D8 is silent and the same disposition as `Ilius` and Mycene-the-woman applies. That the served `modern-en` prints *Eidothea* once is not evidence under D8, which is about the Cast.

### C.2 The warrant is the wrong one, and it is worth correcting before Book 5

`continuity.md` §2 extends the table "on D5's own evidence method: the served `modern-en` being replaced prints Aphrodite 14 / Venus 0, Hera 6 / Juno 0, Hephaestus 20 / Vulcan 0." I reproduced those six counts exactly. **They are true and they are the wrong evidence**, for three reasons:

1. **D5's evidence was not the served `modern-en`.** D5's recorded warrant is the **Cast** (`odyssey-threads.json`: Odysseus 319 / Athena 21 / Zeus 24 / Poseidon 19 / Hermes 12) and the **Book Onboarding** (Odysseus 21) — the two surfaces the reader meets *beside and before* the text. The served `modern-en` is the file this package exists to replace. Citing it as "D5's own evidence method" misdescribes D5.
2. **On D5's actual evidence, two of the three rows have no support at all.** The Cast names **Hephaestus once** and is silent on Aphrodite and Hera (`Aphrodite` 0, `Venus` 0, `Hera` 0, `Juno` 0). The onboarding is silent on all three (`Aphrodite`, `Venus`, `Hera`, `Juno`, `Hephaestus`, `Vulcan` all 0) — and still prints `Ulysses` **twice** beside its 21 `Odysseus`. So the "two names for one man on the same screen" argument, which is D5's whole force, does not reach Venus or Juno.
3. **The file cited is not itself consistent.** The same served `modern-en` that prints Venus 0 and Juno 0 also prints **`Diana` 1, `Saturn` 1 and `Ops` 2**. It is a file with residual Roman forms in it, offered as proof that the product is uniformly Greek. (Its two `Ops` are, usefully, corroboration from a third direction that hazard 1's disposition is right: the replaced file also left `Ops` a man.)

**None of this changes the rows.** D5 is not a rule about counting; it says in terms that "the modern edition uses Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus, Artemis" for "the Olympians who have" Roman forms, and Aphrodite, Hera and Hephaestus are inside that class by any reading. The correction is to the **recorded reason**, which is the thing later Books inherit: write the warrant as *"D5's rule reaches these three directly; the served `modern-en`'s counts are corroboration, and the Cast corroborates Hephaestus alone"*, so that Book 5's drafter, meeting `Mars` or `Ceres`, applies D5 and does not go looking in the file being replaced for permission. Records finding **R3**.

**And keep the enumeration.** D6's requirement that the table be extended by hand and asserted is what makes this safe, and it was honoured: three rows, three assertions, the full `for roman in (…)` list re-asserted at zero, and `Rhea`/`Helios`/`Cronos` asserted absent. That is the discipline; only the sentence explaining *why* the three rows exist needs rewriting.

---

## D. Ruling on D12 class C at B04-P001 and B04-P052 — **upheld**, and `abode` → `home` is right

**The disposition is correct and correctly executed.** I read both passages against PG directly and confirmed independently what the drafter reports: the poem's translation body holds 15 opening brackets against 11 closing, Book 4 carries 2 open and 1 close, and **PG 1552 never closes** — my own bracket report is in section 6 of `verify_source_book4_review.py`. The mark is dropped in both places, every word stands, nothing is merged or compressed, PG 2070's close is kept with all four lines intact (`in the courts.`), and both are recorded with Butler's footnotes 36 and 49 quoted and with who bracketed them (Butler, in both cases). This is class C as Book 3's round 1 settled it, applied without drift on its first use in the poem.

**On the unclosed bracket at B04-P001, the drafter is right not to determine the extent** — obligation 3 — and right that nothing in the rendering depends on knowing it. I would add one observation to `continuity.md` for the later class-C instances: the extent is undeterminable **and unnecessary** here because the disposition is extent-free by construction. Dropping a mark requires knowing where the mark is, not where the passage ends. That is worth stating, because PG 4260, 5691 and 6016 are also unclosed and a later drafter will meet the same question three more times.

**`abode` → `home` rather than `house`: upheld, and the reasoning is better than the sheet claims.** `abode` is on the package's archaism list and had to go. The recorded reason is that `house` "recurs four words later inside the bracketed text" and the sentence must not be recast across the point where the bracket opens. That is right as far as it goes, but the stronger reason is the one the sheet does not give: **`house` four words later is Butler's own word for the same building**, so rendering `abode` as `house` would produce "drove straight to the house of Menelaus and found him in his own house" — a repetition Butler does not commit and which a reader would read as an error in *our* text. `home` is the ordinary modern word for the same thing, it is not inside the bracket, and it leaves Butler's `his own house` doing exactly the work he gave it. Upheld.

**One thing the D12 record should gain, which costs nothing.** Both Book 4 instances are footnoted *about the bracket*. The package corrected itself once already on this point (records finding R3 of Book 3's round 1: five of six, not three). The count now stands at five of six with both of Book 4's confirmed by direct reading; `GLOSSARY.md`'s enumeration should say **five, with the two Book 4 instances marked confirmed at Book 4's round 1**, so the number is not re-derived a third time.

---

## E. Ruling on the B04-P040 quotation repair — **upheld**

The base text prints `“Then,’ he said, ‘if…` — a double opening mark where the nested speech needs a single one, leaving a single closing mark with nothing to close. The candidate prints `“‘Then,’ he said, ‘if…`, carrying 25 opening single marks against the source's 24. **Repair it.**

Three reasons, of which only the first is in `continuity.md`:

1. It is `PUNCTUATION.md` §3's class exactly — a mark a modern reader reads as an error because it is one — and every neighbouring paragraph of Proteus's speech opens `“‘`.
2. **The alternative is not "leave Butler's mark", it is "print a mark that means something false".** In this edition's typography a bare `“` at that position tells the reader Menelaus has started speaking; he has not — Proteus has. D4 makes the opening marks *load-bearing* in this Book, because twenty-one consecutive paragraphs are held together by them. A wrong one is not a blemish here, it is a wrong speaker.
3. **It does not cost the D4 invariant.** The double/single totals are asserted separately (71/50 doubles matching the source exactly; singles source + 1), so the repair is visible in the check block rather than hidden inside a total. That is the right shape for a repair: one assertion that names it.

**One thing to add.** The candidate is inconsistent about this class, and the inconsistency should be ruled rather than left: **B04-P046** keeps `…unable to get home? or is he dead?` — a lower-case sentence opening after a question mark, which is the same Victorian typographic habit and the only other instance in the Book (finding 46.1). I think **both** should be normalized, but the decision that matters is that one rule covers both; repairing one and keeping the other is the state to avoid.

---

## F. Ruling on the one break in the `heaven` census — **upheld**

Butler's `about the time when the sun shall have reached mid heaven` is a position in the sky. The metonym `heaven` for the gods is a different word doing a different job, and it survives untouched fifteen times, including in the same Book's `heaven grant`, `heaven vouchsafed`, `heaven-fed` and `every good quality under heaven`. Rendering this one as `the middle of the sky` is **not** a break in a naming rule; it is the refusal to flatten two meanings into one token — the mirror-image defect Book 3's round 1 named. The equality assertion is a hazard check, not a translation rule, and the right handling is exactly what was done: **break it once, assert the break by name, and assert the paragraph it happens in** (`assert n('heaven') == 15 and n('heaven', s) == 16`, plus the `mid heaven` / `middle of the sky` pair at index 33). A census that cannot record a deliberate exception is a census that will eventually force a wrong rendering.

`furs the water` → `ruffles the water` in the same paragraph is also right, and is the Book's only image-word replaced rather than kept: `fur` as a verb in this sense is dead, `ruffles` is the same physical picture at the same scale, and nothing is added.

---

## G. The rewrap corruption — genuinely absent, and nothing of its shape survives anywhere

I did not take this on trust from the check block's single `\w+- \w+` assertion. I scanned the **frozen candidate**, the **readable copy**, all **27 packets**, and `scripts/candidates/book4.py` — the module the corruption actually lived in — for eleven shapes:

| shape | result |
|---|---|
| `\w+- \w+` (the recorded corruption) | clean in all 30 files |
| `\w+ -\w+` (the mirror) | clean |
| hyphen at end of a paragraph | clean |
| doubled space | clean |
| newline, tab, non-breaking space inside a paragraph | clean |
| leading or trailing space | clean |
| `--`, `\w+ - \w+` | clean |

**The three damaged compounds are intact in the frozen file**: `scepter-bearing` (B04-P007), `violet-colored` (B04-P011) and `lion-hearted` (B04-P065, twice, identical to B04-P076). The repair holds and the module round-trips.

**The lesson the sheet draws is right and it is drawn one notch too narrow.** `continuity.md` §8 says a rewrap is a text transformation and has to be asserted. True. But the *reason it was caught* is the part to generalize: the corruption was found by an assertion about **meaning** (a repeated formula must occur twice, identically), not by an assertion about **shape** — and it was caught in only one of the three damaged paragraphs, because only one of them happened to be covered by such an assertion. The `\w+- \w+` scan now added covers this shape; it would not have caught a rewrap that broke on an em-dash, that dropped a line, or that duplicated one. What actually protects the file is that **every paragraph is diffable against a source**, and the cheapest strengthening available is one step from what `provenance.json` already stores: it records the aggregate counts and the single worst paragraph ratio (`min_paragraph_ratio 0.939` at B04-P006), but not the **per-paragraph word counts**. Storing those 81 integers and asserting them turns every shape of rewrap damage — hyphen, em-dash, dropped line, duplicated line — into one failing assertion, instead of relying on which paragraph happened to be covered by a formula check. Records finding **R5**.

---

## H. `tell me, and tell me true` at B04-P041, and the seven byte-identical paragraphs

### H.1 The formula — **the candidate is right, and its warrant is twice as strong as the sheet claims**

`continuity.md` §6 records the third-pass fix as answering "the **Book 3** row (accepted B03-P021 renders the same Butler formula `tell me truly`)". I checked all four Books, source and candidate:

| | Butler | accepted / candidate |
|---|---|---|
| B01-P013 | "tell me and tell me true, who you are" | **"tell me truly who you are"** |
| B01-P014 | "But tell me, and tell me true, can Ulysses really have…" | **"But tell me truly—can Odysseus really have…"** |
| B01-P016 | "But tell me, and tell me true, what is the meaning of…" | **"But tell me truly, what is all this feasting about"** |
| B03-P021 | "Tell me, therefore, Nestor, and tell me true; how did…" | **"So tell me truly, Nestor: how did…"** |
| **B04-P041** | "but now tell me, and tell me true, whether all the Achaeans…" | **"but now tell me truly, whether all the Achaeans…"** |

**Accepted Book 1 settled this three times before Book 3 met it.** The rendering is not a Book 3 row, it is a package row established at the first Book and applied consistently in every Book since. The correction at B04-P041 was right and the sheet under-credits it; `GLOSSARY.md` should carry the row with all five instances, so that Book 5's drafter finds it as a rule rather than as a Book 3 precedent.

**The one thing to record honestly while doing so**, because it is the mirror-image defect and it is being done deliberately: Butler writes **two** phrases — the doubled `tell me, and tell me true` and the plain `tell me truly` (B03-P011, B04-P027, B04-P055) — and the package renders both as `tell me truly`, so a difference Butler wrote is flattened. I rule that this is **correct and should stay**: the doubling is a formulaic intensifier of oral epic, not a distinction of sense, and English has no natural doubling to carry it that is not worse than the loss. But it should be *written down* as a flattening the package accepts, with its reason, rather than left implicit in five paragraphs — because "a Butler difference flattened into sameness" is otherwise a finding at every future round, and the next reviewer will raise it. Records finding **R6**.

### H.2 The list of seven — **the list is right, and each is defensible**

The check block asserts `[39, 54, 61, 63, 70, 79, 80]`. My own paragraph-by-paragraph diff, run from the source rather than from the assertion, returns `IDENTICAL` for exactly those seven and for no others. **The list is correct.**

Each read against the accessibility standard:

- **B04-P039** (Menelaus to Proteus) — plain, and it is Butler's deliberate near-repetition of B04-P031; the two differ exactly where Butler differs (`in this way` present at P031, absent at P039). Leaving it identical is what preserves that. *One note, in section K under 39.1: it ends a request with a question mark, Butler's own.*
- **B04-P054** (Noemon's question), **B04-P061** and **B04-P063** (Medon's two speeches), **B04-P070** (the suitor's remark), **B04-P079** (the vision's refusal) — all short, plain modern dialogue. There is nothing in them to change that would not be change for its own sake.
- **B04-P080** (the vision vanishing) — the only one I would look at again, for `was dissipated into thin air` (finding 80.1). It is not archaic; it is stiffer than the register around it.

**The asserted-list mechanism is the right one and should be kept for every later Book.** Book 3 could assert zero; Book 4 cannot, and an exact list is strictly better than either a count or a silence, because it makes an eighth impossible to add quietly. What it does **not** do is protect against the opposite error, which is this Book's actual problem: a paragraph one word away from byte-identical passes it. The measure in section B is the instrument for that, and the two counts in B.4 are the cheap version of it.

---

## I. Ruling on `sweet meats` → `sweetmeats` at accepted B03-P037 — **typographic normalization, the drafter is right**

The question is whether closing up Butler's open `sweet meats` is normalization (allowed silently) or substitution (a rendering decision that must be recorded). **It is normalization, and it sets the precedent correctly** — but the precedent must now be written down, because this very Book shows what happens when it is not.

Why it is normalization: `sweetmeats` is the same word, in the same sense, with the same syllables; the open setting is a Victorian compositor's habit, not a lexical choice, and no reader distinguishes them. The test that decides it is the one the package should adopt: **does the change alter what a reader would say aloud?** It does not. Compare a real substitution — the served `modern-en` renders the same phrase *delicacies*, which is a different word with a different range, and the accepted Book 3 correctly did **not** take it. That contrast is also, incidentally, good contamination evidence: at the one point where the replaced file's own prose was spliced into the original column and sat in front of the drafter, the candidate kept Butler's word.

**But the precedent cannot stay unwritten, because Book 4 applies it in three directions at once.** In one Book the candidate:

- **closes** `maid-servant` → `maidservant`, `man-servant` → `manservant`, `to-morrow` → `tomorrow`, `bath room` → `bathroom`;
- **hyphenates** `fine spun` → `fine-spun`, `violet coloured` → `violet-colored`, `mixing bowl` → `mixing-bowl` (the last a recorded cross-Book row);
- **opens** `sea-side` → `sea side`, `drink-offering` → `drink offering`, `thole-pins` → `thole pins`, `work-box` → `work box`.

Three of those are recorded decisions and the rest are silent. Two are wrong on the normalization test itself: **`sea side`** is neither Butler's hyphen nor modern English's `seaside` (finding 37.2), and `drink offering` opens a compound the package closed in the same file. This is precisely the class that produced the cross-Book `mixing bowl` / `mixing-bowl` drift caught at Book 3's finding 27.1 and fixed in Book 2 by a whole successor version.

**Recommendation, as a `PUNCTUATION.md` row rather than a Book 4 note:** compound spelling follows the modern standard form of the compound, whichever direction that moves Butler's setting; the change is typographic and silent; a change that alters what a reader says aloud, or that renames the object (`work-box` → *basket*), is a rendering decision and is recorded. Records finding **R4**.

---

## K. Paragraph-by-paragraph — `B04-P001` … `B04-P081`, each exactly once

Severity: **substantive** = must be fixed before acceptance; **minor** = worth improving; **optional** = preference, no defect. Findings numbered by paragraph. "Also noted" remarks inside an entry are not numbered findings. Every proposed wording stays inside Butler's own words and the glossary. Paragraphs in the **S-1** set (section B.6) carry that mark in addition to any finding of their own; S-1 is one substantive finding, not twelve.

**B04-P001** — No material issue found. The class-C bracket and `abode` → `home` are ruled in section D; `vouchsafed` → `granted`, `Achilles’` → `Achilles’s` (D7) and `fair as` → `as fair as` are all correct. Also noted: the added comma in `the Myrmidons, over whom` is a gain, since without it the city and the relative clause run together.

**B04-P002** — **2.1 (minor).** `when the man struck up with his tune` → `whenever the man struck up his tune`. `whenever` states a frequency Butler does not: his `when` locates the tumblers' performance relative to the bard's playing, and does not assert it happened repeatedly. Frequency is on the instructions' own checklist. Read `when the man struck up his tune`.

**B04-P003** — No material issue found. `stayed their horses` → `stopped their horses`, `Master` → `master` and `as they best can` → `as best they can` are all right. Also noted: `whereon` → `at which` is one of three renderings this Book gives that connective — see **64.2**.

**B04-P004** — No material issue found. `staid` → `stayed` and `henceforward` → `from now on` are correct and `from now on` is used again at P060 for the same word, which is the consistency the package asks for.

**B04-P005** — **5.1 (minor).** `They took their sweating steeds from under the yoke` → `They took the sweating horses…`. The possessive is dropped, and with it whose horses these are: Butler's `their` refers to the guests, and at this moment in the scene the ownership is the point of the action. Read `took their sweating horses`.

**B04-P006** — No material issue found. I checked this against accepted `book01/candidate-v3.json` B01-P011 word for word: the candidate uses accepted Book 1's wording throughout and differs from it **only where Butler differs** (no `then`, `while the carver`, no manservant with wine). It is the Book's lowest-retention paragraph for exactly the reason the sheet gives. Also noted, and not a Book 4 finding: `of what there was in the house` → `from the stores of the house` supplies *stores*; it is accepted Book 1 text and the place to revisit it, if ever, is Book 1.

**B04-P007** — No material issue found. `sceptre-bearing` → `scepter-bearing` is the American standard correctly applied, and this is one of the three paragraphs the rewrap damaged — intact in the frozen file (section G).

**B04-P008** — No material issue found. `On this` → `At this` is the accepted Book 3 row, applied here and at P019, P024 and P046 without exception. The semicolon split into a full stop is one of the few structural changes in the Book and is right.

**B04-P009** — **S-1** (71-word opening sentence). **9.1 (optional).** `the ruin of a stately mansion` → `a stately house,`: *mansion* is not archaic and carries a scale that *house* does not, in a sentence whose subject is the size of what Menelaus lost. Also noted, and **not** a finding: `Would that I had only a third of what I now have so that I had stayed at home` → `so long as I had stayed at home` reads Butler's result clause as a condition, which is the correct reading of the wish and is the harder of the two to get right.

**B04-P010** — No material issue found. `bethought him` → `thought`, `thus mentioned` → `mentioned in this way`, `doubted whether` → `was in two minds whether`. Also noted: the last borrows the phrase Butler uses in the *next* paragraph (`While he was thus in two minds`), and the candidate then renders that one `still undecided`. The anaphoric link survives intact, and the two words are simply swapped between the paragraphs; no loss.

**B04-P011** — **S-1, secondary** (62-word Polybus catalogue). No other material issue. `to wit` → `namely`, `charged with` → `loaded with`, `Diana` → `Artemis`; `violet-colored` and `fine-spun` are correct and this is a rewrap-damaged paragraph, intact in the frozen file. The two silver baths, two tripods and ten talents are exact.

**B04-P012** — No material issue found. `said she` → `she said`, the inverted-tag row, applied without exception in this Book.

**B04-P013** — No material issue found. The supplied possessive `just like Odysseus’s` is right, recorded, and is a `’s` rather than a word. `mantle` → `cloak` is **not** a flattening: I checked accepted Book 3, which renders Butler's only other `mantle` (B03-P036) as `cloak` in exactly the same way, so this is the cross-Book row applied.

**B04-P014** — No material issue found. `begin opening up discourse` → `start a conversation`, and `so divinely interesting as` → `as divinely interesting as` is the right reading of Butler's comparative.

**B04-P015** — **15.1 (optional).** `with most marked distinction` → `with every mark of distinction` turns a statement of degree (very marked) into one of quantity (all the marks there are). `with the most marked distinction` keeps Butler's sense at no cost in plainness. Also noted: `an intercourse` → `a friendship` is right — the word has moved too far to leave.

**B04-P016** — No material issue found. `Thus did he speak` → `So he spoke` and `Thereon` → `Then`.

**B04-P017** — **17.1 (optional).** `Morning will come in due course` → `soon enough`. Butler's phrase says *in its own time*; `soon enough` carries an edge of impatience, and Pisistratus is being courteous. Read `in its own time`, which also avoids `morning… in the morning` two clauses apart, where Butler had `Morning… forenoon`.

**B04-P018** — No material issue found. `as regards wife and offspring` → `in his wife and in his children` is a genuine recast and a good one.

**B04-P019** — No material issue found. The `laid their hands on the good things that were before them` formula is identical to P008's, as Butler's is.

**B04-P020** — **20.1 (minor).** `an herb` → `a herb`. This is a change away from Butler *and* away from the package's own standard: D9 fixes American spelling, and American usage is `an herb` (the *h* is not sounded). Restore Butler's `an herb`. **20.2 (minor).** `a son hewn in pieces before his very eyes` → `cut down before his very eyes`. *Hewn in pieces* is dismemberment; *cut down* is being felled, and is what happens to soldiers in battle. The image Butler chose is the more terrible one and it is the reason the drug is remarkable. Read `hacked to pieces` or keep `hewn in pieces`, which is not archaic. Also noted: `mixing-bowl` hyphenated, matching P051 and the Book 2/3 cross-Book row.

**B04-P021** — **S-1** (80-word sentence). **21.1 (minor).** `for all which things the Trojan women made lamentation` is carried over **unchanged**. It is a dead Victorian relative connective — as dead as `whereon`, which the same draft removes five times — and it sits at the hinge of the longest sentence in Helen's speech. Read `and for all this the Trojan women wailed`, or divide there, which is where the recast in S-1 naturally falls. Also noted: `by no means deficient either in person or understanding` → `certainly not lacking either in looks or in understanding` keeps the litotes and is right.

**B04-P022** — No material issue found. `wherein` → `where`, `did you go… and pat it` → `you went… and patted it`. Diomed correctly flagged, not corrected. The whole wooden-horse episode survives stage by stage.

**B04-P023** — No material issue found. `of no avail` → `of no use`, `be pleased to send us` → `please send us`; `nor yet his own iron courage` → `nor was his own iron courage` keeps both limbs of the negation.

**B04-P024** — No material issue found.

**B04-P025** — No material issue found. I checked this against accepted `book02/candidate-v3.json` B02-P001: the dawn formula is word for word the accepted form, and **Butler's own difference is kept** — Book 2 `his shoulder`, Book 4 `his shoulders`. `comely` is accepted Book 2's word too.

**B04-P026** — No material issue found. `Are you on public, or private business?` → `on public business, or private?` is a clean repair of an ambiguous ellipsis.

**B04-P027** — No material issue found. I checked this against accepted `book03/candidate-v2.json` B03-P011: it prints accepted Book 3's words and differs exactly three times, in the three places Butler differs (`in the hope that you may tell me` / `may be willing to tell me`; `for myself` / `for me`; `harried by` / `harried among`). This is the discipline Book 2's records finding R1 asked for, done at drafting rather than at review.

**B04-P028** — **28.1 (optional).** `I will not prevaricate nor deceive you` → `I will not evade them nor deceive you` supplies an object (*them*, the questions) that Butler's intransitive does not have. `I will not evade you nor deceive you` keeps the parallel and needs nothing supplied. Also noted: `such` → `such a man` is a supplied noun and the right one; the hind-and-lion simile survives limb for limb, with `dell` → `hollow`.

**B04-P029** — **S-1** (66-word Pharos sentence). No other material issue. The hecatomb becomes `my great sacrifices` with no number, per D3; the twenty days of calm are exact; `Idothea` correctly untouched (section C).

**B04-P030** — No material issue found.

**B04-P031** — No material issue found. This is the first half of the appeal-to-Proteus pair; it is rendered identically with P039 except where Butler differs, and Butler's `in this way` is kept here and absent there.

**B04-P032** — No material issue found. `hereabouts` → `near here`, `if you so will` → `if you wish`.

**B04-P033** — **33.1 (minor).** `some stratagem by means of which I may catch this old god` → `some trick by which I can catch…`. Butler distinguishes Menelaus's *stratagem* from Proteus's *tricks*, and he uses *tricks* for Proteus twice in the next five paragraphs (P034 `all the tricks that the old man will play you`, P038 `his old tricks`). Rendering the first as `trick` collapses a distinction Butler draws, in the one place where who is outwitting whom is the subject. Read `some scheme by which I can catch`, or `some way to catch`.

**B04-P034** — No material issue found. The `heaven` census break and `furs` → `ruffles` are ruled in section F; `grey` → `gray`, `to-morrow` → `tomorrow`; the three best men are exact. This is the paragraph carrying the space-set marker 44, and the candidate's spacing is clean.

**B04-P035** — **S-1** (94-word instruction sentence, five semicolons). **35.1 (minor).** `put forth all your strength` → `put out all your strength`. *Put forth* is not archaic, and *put out* in this position reads first as *extinguish* and second as *inconvenience*; neither is the sense. Keep `put forth`, or read `use all your strength`.

**B04-P036** — No material issue found. The beach-camp formula is identical to P048's where Butler is identical, and **Butler's two differences are kept** (`to the place where my ships were drawn up` / `to the ships with my companions`; `When I reached my ship` / `When we reached the ships`).

**B04-P037** — **S-1** (67-word sentence). **37.1 (minor).** `sea-side` → `sea side`, twice in the Book (here and P072). This opens a compound in the one direction that is neither Butler's nor modern English's: the standard form is `seaside`. See section I and records finding **R4**. Also noted: `Our ambuscade would have been intolerable` → `Lying in wait there would have been unbearable` is a real recast and a good one — the only place in the Book where a noun that cannot carry a modern sentence is turned into a clause.

**B04-P038** — **38.1 (minor).** `Which of the gods was it, Son of Atreus` → `son of Atreus`, while **P045 keeps `Son of Atreus`** — the same vocative, from the same speaker, to the same man, seven paragraphs later in the same scene, and Butler capitalizes both. One of the two must move. (P014 and P024 are `son of Atreus` in Butler and in the candidate; it is only Proteus's vocative that is capitalized, and it should stay capitalized in both places or neither.) Also noted, and deliberately **not** an S-1 paragraph: the 105-word shape-changing sentence is the longest left standing in the Book and should **stay** — see section B.6.

**B04-P039** — No material issue found; byte-identical to Butler and defensible (section H.2). **39.1 (optional).** It ends `…how I may sail the sea so as to reach my home?’` — a request punctuated as a question, Butler's own, where the twin sentence at P031 ends in a full stop. I would leave it: it is a genuine indirect question and the mark is not wrong, only old-fashioned. Recorded because the draft repairs a different Butler punctuation slip at P040 and the two decisions should be made under one rule, not separately (section E).

**B04-P040** — **S-1** (68-word sentence carrying Proteus's conditions). The quotation-mark repair is ruled **upheld** in section E; the hecatombs become `holy sacrifices` with no number, per D3. No other material issue.

**B04-P041** — **S-1, and the clearest case in the Book**: eighty-nine words in a single sentence, changed in two words. `tell me, and tell me true` → `tell me truly` is **correct** and is ruled in section H.1; `broken hearted` → `heartbroken` is right and is applied again at P045. No other material issue.

**B04-P042** — No material issue found. `large talk` → `big talk` is right and the recorded reason is right — *boasting* is Butler's own word two sentences earlier and the two are doing different work. The Ajax narrative survives rock by rock.

**B04-P043** — **43.1 (minor).** `…for the gods backed the wind into its old quarter and they reached home; whereon Agamemnon kissed his native soil` → `…and they reached home; and Agamemnon kissed his native soil`. Replacing `whereon` with `and` leaves a semicolon followed by `and` inside a sentence that already has an `and` eight words earlier, and it drops the consequence Butler's connective carries. Read `; and at that Agamemnon kissed` or `; and then Agamemnon kissed`, or divide the sentence. See **64.2**.

**B04-P044** — **44.1 (minor).** `when, therefore, this man saw Agamemnon go by, he went and told Aegisthus` keeps Butler's interrupted-inversion intact inside a 60-word sentence; `so when the man saw Agamemnon go by, he went and told Aegisthus` is the same content in modern order. **44.2 (optional).** `nor yet one of Aegisthus’` → `nor one of Aegisthus’s` drops the concessive force of *nor yet* (*nor even*), in the line that closes the massacre. Read `nor even one of Aegisthus’s`. Also noted: `ambuscade` → `ambush`, `shambles` → `slaughterhouse`, `cloister`/`cloisters` → `gallery`/`galleries` with Butler's singular/plural kept, and `Aegisthus’` → `Aegisthus’s` under D7 — all correct.

**B04-P045** — **S-1** (77-word sentence with a 30-word front-load before the speech tag). No other material issue.

**B04-P046** — **46.1 (minor).** `is he still alive, but at sea, and unable to get home? or is he dead?` keeps a lower-case sentence opening after a question mark — Butler's typographic habit, and the only instance in the Book. It is the same class the draft repairs at P040, and one rule should cover both (section E). Read `…unable to get home? Or is he dead?`

**B04-P047** — No material issue found. Elysium survives whole — the plain at the ends of the world, fair-haired Rhadamanthus, no rain, hail or snow, Oceanus and the West wind — and nothing is glossed, which is right. `there falls not rain` → `there falls neither rain` is a clean repair of a negation.

**B04-P048** — No material issue found. `barrow` → `mound` is the Book 1/2/3 row; `smote` → `struck`; the hecatombs become `sacrifices that were full and sufficient` with no number; the beach-camp and dawn formulas match P036 and P025 with Butler's differences kept.

**B04-P049** — **49.1 (optional).** `drink-offering` → `drink offering` opens a compound in a file that closes `maidservant`, `manservant` and `tomorrow` — the hyphenation class of section I and records finding **R4**. `drink offering` is defensible as the standard open form; it should be recorded as a decision rather than left as a silent third direction.

**B04-P050** — **S-1** (74-word sentence). **50.1 (minor, records-adjacent).** `a piece of plate` is kept, and `continuity.md` §5 justifies it on the ground that "accepted Book 1 already carries `plate`". It does not: accepted B01-P011's `plates` are the dinner plates the carver brings, a different word in a different sense. The **decision is right** — Menelaus explains the object in the very next paragraph (`the finest and most precious piece of plate… It is a mixing-bowl… of pure silver`), so the text glosses itself at the point of need — but the recorded reason is a false cross-reference and will mislead whoever meets `plate` in a later Book. Also noted: this is the paragraph carrying marker 48's doubled-space artefact in the served original; the candidate prints one space (section A bis).

**B04-P051** — **51.1 (minor).** `Phaedimus… gave it me` is left standing, while the identical dead dative five paragraphs later is repaired (`I lent it him` → `I lent it to him`, P056). Same construction, same Book, two dispositions. Read `gave it to me`. Also noted: `thither` → `there` and `within his own` → `in his own` are right; `mixing-bowl` and `Hephaestus’s` are correct.

**B04-P052** — No material issue found. The second class-C bracket is ruled **upheld** in section D: mark dropped, all four lines kept, `in the courts.` intact, nothing merged or compressed.

**B04-P053** — No material issue found. `levelled` → `leveled`, `Ulysses’` → `Odysseus’s` under D7, and the commas added around `son of Phronius` are a gain.

**B04-P054** — No material issue found; byte-identical to Butler and defensible. The twelve brood mares with yearling mule foals are exact.

**B04-P055** — No material issue found. `bondsmen` → `bondservants` is right for the recorded reason — *bondsman* now means a person who posts bail — and Butler's own `Tell me truly` is kept as `Tell me truly`, matching section H.1.

**B04-P056** — No material issue found. `I lent it him` → `I lent it to him` is correct; see **51.1** for the paragraph where the same repair was not made.

**B04-P057** — No material issue found.

**B04-P058** — No material issue found. The twenty-man crew and the Ithaca–Samos straits are exact.

**B04-P059** — No material issue found. `Thus did he speak… applauded his saying` → `So he spoke… applauded what he said` is one of the Book's genuine recasts.

**B04-P060** — No material issue found. `ere` → `before`, `man servant` → `manservant`, `henceforward` → `from now on` matching P004.

**B04-P061** — No material issue found; byte-identical to Butler and defensible.

**B04-P062** — No material issue found. `any one` → `anyone` is the right split of the two senses, and `any one of them` is correctly kept at P064.

**B04-P063** — No material issue found; byte-identical to Butler and defensible.

**B04-P064** — **S-1, secondary** (64-word sentence). **64.2 (minor).** `whereon all the maids in the house` → `at which all the maids…`. Taken with P003 (`whereon` → `at which`), P036, P043 and P048 (`whereon` → `and`), and Butler's own `on which` kept untouched at P038 and P042, **one connective is rendered four ways in one Book** — `at which`, `and`, `on which` and, at P043, `and` where a consequence was meant. `at which` and `on which` are both stiff relatives of the same family as `whereon`, and keeping two of them while removing five is the package's named characteristic defect in its clearest form. Fix as a set, and record the rule.

**B04-P065** — **65.1 (optional).** `bent upon it` → `set on it`, while `bent on killing him` is kept at P076. Butler's near-identical idiom is turned into a real difference. Read `bent on it`. Also noted: `You hussies` → `You impudent girls` is right, and the recorded reason is right — Penelope's charge is that they did not wake her; `Bid him go` → `Tell him to go`; the `brave and lion-hearted husband…` formula is identical to P076's, as Butler's is, and this is the third rewrap-damaged paragraph, intact in the frozen file.

**B04-P066** — **S-1, secondary** (62-word sentence). No other material issue. `Euryclea` → `Eurycleia` under D8; `Aegis-bearing Jove` → `aegis-bearing Zeus` correctly unglossed; the ten-or-twelve days and the race of Arceisius are exact.

**B04-P067** — No material issue found.

**B04-P068** — No material issue found. `unweariable` → `unwearying`; `bear it in mind now as in my favour` → `now in my favor`, matching P027 and accepted B03-P011 exactly.

**B04-P069** — No material issue found. `the suitors grew loud throughout the covered gallery` is accepted Book 1's B01-P026 wording, correctly reused because Butler's sentence is his own from Book 1.

**B04-P070** — No material issue found; byte-identical to Butler and defensible.

**B04-P071** — **71.1 (minor).** `Let us be up and do that in silence, about which we are all of a mind` → `Let us get up and do in silence the thing we are all of a mind about`. The recast is one of the Book's few and it ends on a stranded preposition after a heavy noun phrase, which reads worse than what it replaced. Read `Let us get up and do in silence the thing we are all agreed on`, or `…the thing we have all agreed`. Also noted: `lest` → `in case` here and at P076 is consistent, and weaker than Butler's apprehensive; `for fear that` is closer and is not archaic.

**B04-P072** — **72.1 (optional).** `thole-pins` → `thole pins` and `sea-side` → `sea side` in one sentence: the hyphenation class again (**37.1**, section I, records **R4**). Keeping `thole pins` unglossed is right — the sentence explains the object — and `all in due course` → `each in its place` is right for the recorded reason.

**B04-P073** — No material issue found. `caught in the toils` → `caught in a net` and `bereft of thought and motion` → `without thought or movement` are both correct; the simile keeps the huntsmen on every side.

**B04-P074** — No material issue found. `Minerva bethought her of another matter` → `Athena thought of another matter` matches P020's rendering of the same Butler formula exactly, which is the consistency the package asks for. Iphthime's genealogy is exact.

**B04-P075** — No material issue found. `will not suffer you to weep` → `will not let you weep`.

**B04-P076** — not in the S-1 set: its 62-word sentence reads cleanly at length and is one of the four long sentences section B.6 deliberately leaves alone. **76.1 (optional).** `lest something should happen to him` → `in case something should happen` — see the note at **71.1**; `for fear something should happen to him` is closer to Butler's apprehensive and no less plain. Also noted: the `brave and lion-hearted husband…` formula is identical to P065's, as Butler's is.

**B04-P077** — No material issue found. `compassion upon you` → `on you`, `bear you this message` → `bring you this message`.

**B04-P078** — No material issue found. `sent here by divine commission` → `by divine command` is a small narrowing (a commission is an errand one is sent on, a command is an order) but Penelope's point is that the vision was sent, and `command` carries it.

**B04-P079** — No material issue found; byte-identical to Butler and defensible. The vision's refusal to say whether Odysseus is alive is intact, which the instructions flag and which is the paragraph a paraphrase would most easily damage.

**B04-P080** — **80.1 (optional).** `was dissipated into thin air` is the one phrase among the seven byte-identical paragraphs that is stiffer than the register around it. `melted into thin air` or `vanished into thin air` is plainer; against that, `vanished` is already the paragraph's first verb, so the repetition may be worse than the stiffness. Leave it if the flow read agrees. `thong-hole` is correctly kept, matching P074's description of the same hole.

**B04-P081** — No material issue found. Asteris, the harbour on either side, and the ambush are exact.

---

## L. Records findings — outside the text

**R1 — the retention figure is printed three ways.** `book04/README.md`, `continuity.md`'s table and `provenance.json` say **0.960**; `review-instructions.md` says **0.961** twice, and `continuity.md` §6's own heading says **0.961** while its first line says 0.960. Computed exactly, on the package's own normalization, it is **0.95958**, which rounds to 0.960. Fix the two headings. It changes nothing in this review, but the figure is quoted into three later files at a time and one of them will carry the wrong one forward.

**R2 — Book 1's baseline 0.721 does not reproduce.** The package's own `token_retention()` (in `scripts/build_book02_v2.py`, the function that defines the measure) applied to accepted `book01/candidate-v2.json` gives **0.727**, and to `candidate-v3.json` **0.7275**; a per-paragraph variant gives 0.733, and dropping the name map gives 0.717. None of them is 0.721, which came from the Book 2 reviewer's own implementation and is now quoted in `RESUME.md`, three `provenance.json` files, `book02/continuity.md`, `book04/continuity.md`, `book04/README.md` and two `review-instructions.md`. **No ranking changes** — Book 1 is still by far the lowest, and the whole argument in section B survives either figure. Recompute it once with the canonical function, correct it everywhere, and note in `GLOSSARY.md` that the measure means the aggregate-join form, since the per-paragraph form differs by 0.006 and someone will implement the wrong one.

**R3 — the warrant for the three new name rows is the wrong evidence** (section C.2). The Cast corroborates `Hephaestus` alone; it is silent on Aphrodite and Hera. The onboarding is silent on all three and still prints `Ulysses` twice. The served `modern-en` cited as proof of a uniformly Greek product itself prints `Diana` 1, `Saturn` 1 and `Ops` 2. Rewrite the warrant as D5's rule reaching these three directly, with the counts as corroboration; keep the enumeration and the assertions exactly as they are.

**R4 — the package has no compound-hyphenation rule, and Book 4 moves compounds in three directions at once** (section I). Four closed, three hyphenated, four opened, of which three are recorded decisions and the rest are silent; two of the opened ones (`sea side`, `drink offering`) land on a form that is neither Butler's nor the modern standard. This is the class that already cost the package a whole successor version at Book 2 (`mixing bowl` → `mixing-bowl`). Add the row to `PUNCTUATION.md` with the test in section I: does the change alter what a reader says aloud?

**R5 — store the per-paragraph word counts and assert them** (section G). `provenance.json` records the aggregate counts and the single worst paragraph ratio but not the 81 integers. Storing and asserting them turns every shape of rewrap damage into one failing assertion, instead of depending on which paragraph a formula check happened to cover — which is how the `lion- hearted` corruption was actually caught, and why two of the three damaged compounds were found only by luck.

**R6 — record the `tell me truly` flattening as an accepted flattening** (section H.1). Butler writes two phrases and the package renders both one way, in five paragraphs across three Books. It is the right call, and while it is unwritten it is a finding waiting to be raised at every future round. Put the row in `GLOSSARY.md` with all five instances and the reason.

**R7 — `PROVENANCE.md` can claim a property it does not currently claim** (section A). The reconstructions so far establish that the served text's *words* are PG's, in PG's order, within a region located without assumption. Consecutive unique per-paragraph fingerprint matches establish something stronger and more useful: **the served file's paragraph division is PG's own blank-line division**, paragraph for paragraph. That is the property the product's alignment contract rests on — audio, Cast data and saved reading positions all key on the paragraph index — and it is now demonstrated for Book 4 and cheap to demonstrate for the rest of the file. Also add the one sentence in section A bis: the served B04-P050 doubled space is **faithful to PG**, so nobody opens a repair ticket for it under A3.

---

## M. What the package's own checks still would not catch

Recorded because this is the part a check block cannot tell you about itself.

1. **The finding in section B.** The check block asserts a retention figure to ±0.001 and a word ratio to ±0.0005 — both of which a pure vocabulary swap satisfies perfectly. Nothing in it counts a sentence. The two counts in B.4 are four lines of Python and would have turned S-1 into a failing assertion at drafting time. **Add them**: candidate sentence count against source, and sentences over sixty words, with the accepted Books' figures as the comparison.
2. **One word rendered two ways inside a Book**, when neither way is archaic and neither is a glossary row. The guard list catches dead forms; the formula assertions catch a drifting *formula*. Nothing catches `gave it me` kept while `lent it him` is repaired (51.1), `Son of Atreus` capitalized once and lower-cased once (38.1), `bent upon` changed while `bent on` stands (65.1), or one connective rendered four ways (64.2). All four are the package's named characteristic defect and all four passed every check. A cheap partial guard: for each Butler word-type the candidate ever changes, list the paragraphs where the same Butler type is **left alone**, and print the list for a human to read. It will be long and mostly innocuous; that is fine, it takes a minute to scan.
3. **A Butler word restored in the wrong direction of the spelling standard.** `an herb` → `a herb` (20.1) is both a change away from the source and a change away from D9's American standard, and it is invisible to a check that only looks for British spellings in a list.
4. **A justification that cites the wrong precedent.** 50.1's `a piece of plate` is defended by a cross-reference to a homograph in accepted Book 1. The disposition is right and the reason is wrong, and nothing mechanical can see that — only a reader who follows the reference. Worth a habit rather than a check: when a continuity note cites another Book, quote the sentence it cites.
5. **The byte-identical assertion's blind spot.** An exact list of identical paragraphs is the right instrument and it stops at Hamming distance zero. B04-P041 — eighty-nine words, two changed — passes it, and is the clearest instance of the substantive finding.
6. **Punctuation slips of the same class treated differently.** P040 repaired, P046 left (46.1), P039's terminal question mark left (39.1). Each decision is defensible on its own; there is no check, and no rule in `PUNCTUATION.md`, that makes them one decision.

---

## Summary for the coordinator

- **Verdict: accept after corrections.** 1 substantive, 16 minor, 11 optional, 7 records. 50 of 81 paragraphs carry no material issue at all. Coverage `B04-P001`…`B04-P081`, each exactly once.
- **The source verification holds** under a fifth, independent kind of rule, and can be strengthened into a claim about paragraph division (R7).
- **The 0.960 question is answered and it is the substantive finding.** The source's plainness is real but lexical; on syntax, Book 4's Butler is the hardest in the package and the draft is the lightest. Nine paragraphs to recast, three to look at, one long sentence explicitly to leave alone.
- **All five flagged decisions are upheld**: the three name rows (warrant corrected), D12 class C with `abode` → `home`, the B04-P040 repair, and the one `heaven` census break. The two further questions — `tell me truly` and `sweet meats` — are upheld too, each with a record the package should now write down.
- **Nothing needs new wording.** Every S-1 recast divides a sentence Butler already wrote; every other proposal restores one of his words or repairs a spelling.
