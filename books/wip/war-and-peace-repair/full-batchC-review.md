# War and Peace — Batch C Independent Review

**Reviewer:** independent second pass (not the drafting pass)
**Scope:** all 20 chapters in batch C (56, 57, 58, 59, 60, 62, 64, 65, 66, 67, 70, 71, 72, 73, 74, 75, 76, 77, 79, 80)
**Files reviewed:**
- Source: `full-batchC-source.json` (Maude)
- Pre-fix: `full-batchC-current-modern-en.json`
- Corrected: `full-batchC-corrected.json`
- Drafter's notes: `full-batchC-notes.md`

**Verdict: ACCEPT the 7 fixes — all are correct against source. But the notes' reasoning is partly wrong, and the drafter missed defects of exactly the same classes it claims to have fixed.** See "Independent findings" and "Recommendations".

---

## 1. Confirmed diff (corrected vs current)

Verified programmatically. Structure is intact:

- 20 chapters in all three files, same `number` and `title` sequence.
- Paragraph counts match source exactly in every chapter (68/34/38/35/32/43/46/25/45/45/36/20/36/26/38/28/39/17/33/28).
- **Exactly 7 paragraphs differ between current and corrected, in exactly 5 chapters: 59, 64, 66, 72, 77.** Nothing else changed. Confirmed — matches the drafter's claim.

| Ch | Para idx | Change |
|---|---|---|
| 59 | 1 | removed leading `[speaking in French] ` tag |
| 64 | 39 | English paraphrase → `"Ma foi, sire, nous ferons ce qui sera dans notre possibilité, sire,"` |
| 64 | 40 | `Footnote: "…"` → `* "…"` |
| 66 | 40 | `"Damn these Russians!" a German muttered.` → `"Zum Henker diese Russen!" muttered a German.` |
| 66 | 41 | `Footnote: "…"` → `* "…"` |
| 72 | 24 | `[speaking in French] Till tomorrow, my dear fellow.` → `À demain, mon cher.` |
| 77 | 15 | `Nikolai Andreevich` → `Nicholas Andreevich` |

---

## 2. Verification of each claimed fix

### Ch 59 §1 — `[speaking in French]` removal — **CORRECT**
Source: `"Come here, Wostóv. Let's dwink to dwown our gwief!" shouted Denísov…`
There is no French here at all; the source is rendering Denisov's r→w speech impediment. The tag was a false annotation. Removal is right. (Dropping the lisp itself in narration-adjacent lines is a pre-existing, book-wide stylistic choice — see §5.7.)

### Ch 64 §39–40 — French restoration + footnote — **CORRECT**
Source §39: `"Ma foi, sire, nous ferons ce qui sera dans notre possibilité, sire," * he answered gaily…`
Source §40: `* "Indeed, Sire, we shall do everything it is possible to do, Sire."`
The French is restored verbatim, including accents, and the footnote now matches the source's own `* "…"` wording character-for-character. The `Footnote:` label was genuinely anomalous — it occurred **exactly twice in the whole book** (ch64 and ch66, both here). Fixing it was right.

### Ch 66 §40–41 — German restoration + footnote — **CORRECT**
Source §40: `"Zum Henker diese Russen!" * muttered a German.`
Source §41: `* "Hang these Russians!"`
German restored verbatim; word order (`muttered a German`) now matches source; footnote reformatted to `*`. Especially warranted here, since the paragraph's whole point is the Russian/German/Czech babel.

### Ch 72 §24 — `À demain, mon cher.` — **CORRECT**
Source §24 ends `And that's how it is with me. À demain, mon cher." *` with footnote §25 `* Till tomorrow, my dear fellow.` The footnote paragraph was already correct in the pre-fix file, so the inline English was a pure duplicate. Restoring the French removes the duplication.

### Ch 77 §15 — `Nikolai` → `Nicholas` — **CORRECT**
Source: `…the young Prince Nicholas Andréevich was baptized.` The source itself is anglicized, and the project's normalized master (`modern-en-name-normalized.json`) contains **zero** instances of "Nikolai" across all 365 chapters. The fix restores both source fidelity and project convention.

### Footnote-convention check against the rest of the book — **the fix is right, the stated reason is wrong**
I checked every `*`-prefixed footnote paragraph in the accepted/corrected batches and in the normalized master.

- The `* "…"` **footnote format** is unambiguously the book's convention (70 such paragraphs; only the 2 `Footnote:` ones in this batch deviated). ✅ Drafter correct.
- But the drafter's claim that `[speaking in French]` is "not used anywhere else in the book's established convention" is **false**. The tag appears **79 times across 29 chapters** in the live modern-en (`[Speaking in French]` ×60, `[speaking in French]` ×11, `[speaking in German]` ×7, `[Speaking in Italian]` ×1), and it **survives in already-accepted review batches** (`early-flags-accepted.json` ch6/26, `drift-batchD1-accepted.json` ch5/19/31) and in `full-batchA-corrected.json` (44) and `full-batchB-corrected.json` (23).
- The drafter's claim that "chapters 72, 74, 76, 79 all correctly keep foreign phrases in-language" is also **false for ch74** — see §5.1. Only ch76 (`fruschtique`) and ch79 (`Vasili Dmitrich*`) keep the foreign token, and neither is a translated quote.

The book's *de facto* prevailing pattern is: English inline (sometimes tagged), foreign original dropped, `*` footnote kept — which leaves the footnote redundant. The drafter's fixes move 3 spots toward source fidelity. I agree those spots are better now, but this is a **convention change applied to 3 of ~80 sites**, not a defect repair against an established convention.

---

## 3. Method of my independent pass

1. Automated triage of all ~700 paragraph pairs: word-count ratio bands, numeral-set diffs, proper-noun-loss proxy.
2. Full manual side-by-side read of **every paragraph of all 20 chapters** against source, including the 15 marked "sound."
3. Cross-checks against `modern-en-name-normalized.json`, the live `app/public/data/editions/war-and-peace-modern-en.json`, and all sibling accepted/corrected batch files for convention baselines.

Note on provenance: `full-batchC-current-modern-en.json` is byte-identical to the **live** edition file, not to `modern-en-name-normalized.json`. The live file still carries 82 "Andrei" and 12 "Nikolai"; the normalized file has zero of each. That is why ch77's "Nikolai" existed at all.

---

## 4. Chapter-by-chapter result

| Ch | Drafter | My finding |
|---|---|---|
| 56 | sound | sound; 2 trivia (§36 "adjutant"→"errand boy" breaks the term thread; §51 doublet collapsed) |
| 57 | sound | sound |
| 58 | sound | sound; §15 "party of the young"→"war party" (trivial) |
| 59 | fixed | fix correct; **missed: §21 dropped `Quelle terrible chose que la guerre!`** (see 5.2) |
| 60 | sound | **defect found: §7 material compression** (see 5.3); §19 allusion loss |
| 62 | sound | sound; two `Vive l'Empereur!` translated inline (5.6) |
| 64 | fixed | fix correct; **missed: 11× "Prince Andrei", "Mikhail Ilarionovich" ×2** (5.4); §30 "Empress' Field" dropped then kept in §31 |
| 65 | sound | **missed: 14× "Prince Andrei"** (5.4) |
| 66 | fixed | fix correct; rest sound |
| 67 | sound | sound |
| 70 | sound | **missed: "Maria Ivanovna"** (src "Mary Ivánovna") (5.4); §1 "civilian life" (he is on leave, not discharged) |
| 71 | sound | **missed: "Pyotr Ivanovich" / "Pavel Ivanovich"** (src "Peter"/"Paul") (5.4) |
| 72 | fixed | fix correct; §12 "his eyes dropped"→"his eyes darkened" (minor inversion); §11 "Peterkin"→"Petrusha" |
| 73 | sound | sound |
| 74 | sound | **NOT sound — 4 findings incl. the batch's worst** (5.1) |
| 75 | sound | sound |
| 76 | sound | sound |
| 77 | fixed | fix correct; **§16 "drowned in the font" → "dropped into the font"** (5.5) |
| 79 | sound | sound |
| 80 | sound | sound |

---

## 5. Independent findings the drafting pass missed

### 5.1 Ch 74 — HIGH-ish. The chapter is not sound; it contains the batch's worst single defect.
The drafter marked ch74 sound and cited it as the model of correct foreign-quote handling. It is the opposite.

**(a) §26 — content omission that breaks the sentence's referent. This is the most serious find in the batch.**
Source:
> …"that Dólokhov was my lover," she said in French with her coarse plainness of speech, uttering the word *amant* as casually as any other word, "and you believed it! … That you're a fool, *que vous êtes un sot*, but everybody knew that."

Corrected:
> …"that Dolokhov was my lover," she said with her characteristic blunt directness, **tossing out the word as casually as any other**, "and you believed it! … That you're a fool — but everybody already knew that."

Three losses: "in French" is dropped, `amant` is dropped, `que vous êtes un sot` is dropped. The surviving clause "tossing out the word as casually as any other" now refers to **no word at all** — the sentence is semantically broken, and Helene's characterising detail (using the blunt French noun) is gone. §30's `(des amants)` is likewise dropped.

**(b) §8/§9 — foreign quote translated inline *and the footnote rewritten to match the invention*.**
Source §8: `"…Allez-vous promener," * she used to say.` / §9 footnote: `* "You clear out of this."`
Corrected §8: `"…Get lost,' she used to say."` / §9 footnote: `* "Get lost."`
Not only was the French dropped (same class as the ch64/66/72 fixes), the **footnote text itself was altered away from the source** to agree with the paraphrase. That is a step beyond what happened in ch64/66.

**(c) §15/§16 — Molière allusion mistranslated in both inline and footnote.**
Source: `"Mais que diable allait-il faire dans cette galère?"` / footnote `* "But what the devil was he doing in that galley?"`
Corrected: `"But what the devil was he doing in that boat?"` in **both** places. `galère` is a galley; the line is from *Les Fourberies de Scapin* and the galley is the point of the joke. "Boat" flattens the allusion, and again the footnote was edited away from the source rather than preserved.

**(d) §36 — small meaning inversion.** Source `Hélène's face became terrible` (i.e. frightening to behold) → `Helene's face became terrified`. Reverses who is frightened, in the beat immediately before she shrieks and flees.

Also low: §37 "Great Russia" → "central Russia" (a defined historical region flattened to an approximation).

### 5.2 Ch 59 §21 — MEDIUM. Dropped foreign line, in a chapter the drafter edited.
Source: `"What a terrible thing war is: what a terrible thing! Quelle terrible chose que la guerre!"` — Tolstoy deliberately has Alexander say it twice, once in each language.
Corrected: `"What a terrible thing war is — what a terrible thing!"` The French half is simply gone. The drafter opened this exact chapter to remove a `[speaking in French]` tag and did not notice it.

### 5.3 Ch 60 §7 — MEDIUM. Genuine content compression (the only outright omission of descriptive detail I found).
Source:
> …Wheels creak on their axles as the cogs engage one another and the revolving pulleys whirr with the rapidity of their movement, but a neighboring wheel is as quiet and motionless as though it were prepared to remain so for a hundred years; but the moment comes when the lever catches it…

Corrected:
> …And just as the untouched parts of a clock sit completely still until the motion reaches them — wheels that could remain idle for a hundred years — **so it is in an army.** But the moment comes when the lever catches…

The creaking axles / engaging cogs / whirring pulleys are deleted, and "so it is in an army" is inserted (source does not say it there — it is the *following* paragraph's job). Word ratio 0.71. Per the project's translation rules ("do not condense arguments, examples, dialogue, or descriptive detail"; ≥75% of source word count), this one is over the line. **Recommend a repair.**

### 5.4 Name normalization — MEDIUM. The ch77 fix was one instance of a defect class with 15+ other instances in this batch, all left in place.
Every case below has the source using the anglicized form and the candidate substituting a Russian form — identical in kind to the Nikolai→Nicholas slip:

| Location | Source | Corrected | Count |
|---|---|---|---|
| ch64 | Prince Andrew | Prince **Andrei** | 11 |
| ch65 | Prince Andrew | Prince **Andrei** | 14 |
| ch64 §25, §30 | Michael Ilariónovich | **Mikhail** Ilarionovich | 2 |
| ch70 §30 | Mary Ivánovna | **Maria** Ivanovna | 1 |
| ch71 §17 | Prince Peter Ivánovich Bagratión | Prince **Pyotr** Ivanovich | 1 |
| ch71 §17 | Paul Ivánovich Kutúzov | **Pavel** Ivanovich Kutuzov | 1 |

The Andrei case is the reader-visible one: chapters 56/58/60/74/75/76/77 all say "Prince Andrew" (69×) while chapters 64 and 65 — the Austerlitz climax and the "lofty sky" chapter, adjacent in the reading flow — say "Prince Andrei" (25×). The same character changes name mid-battle. `modern-en-name-normalized.json` has 1140 "Andrew" and **zero** "Andrei" book-wide, so the normalized master already resolves this; the batch was cut from the live file, which still carries 82 stragglers. **Recommend either applying the normalization to ch64/65/70/71 in this batch, or confirming that the separate name-normalization pass will land over the top of it.**

### 5.5 Ch 77 §16 — LOW. Meaning change in the paragraph adjacent to the fix.
Source: `faint with fear lest the baby should be **drowned** in the font` → corrected: `faint with fear that the baby might be **dropped** into the font`. Andrew's specific superstitious dread (drowning during immersion baptism, which the floating-wax omen in the same sentence answers) becomes an ordinary fear of clumsiness. One paragraph after the name fix.

### 5.6 Untouched foreign quotes elsewhere in the batch — consistency, not fidelity
For completeness, the same "foreign text translated inline" pattern that was fixed in ch64/66/72 also occurs, untouched, at: ch56 §6 (`petisenfans, allay cushay dormir`), ch59 §11 (`Alley! Alley!`), ch59 §21 (see 5.2), ch62 §8 and §39 (`Vive l'Empereur!`, twice), ch74 §8/§12/§15/§26/§30 (see 5.1). Most have no `*` footnote attached, so they are less visibly broken, but the batch is now internally inconsistent about the policy.

### 5.7 Pre-existing, out of scope, noted for the record
Denisov's speech impediment is dropped in ch59 §1/§32 and ch73 §2–3 but kept in ch79 §5 and ch80 §5/§8/§13/§16/§25. Book-wide inconsistency, not introduced by this batch; the drafter flagged it and correctly declined to re-litigate it here.

### 5.8 Trivia (no action needed)
ch56 §10 "sinners of the line" → "poor infantry sinners" (Rostov is cavalry, but "the line" vs the Guards is the sense and it survives); ch56 §51 "are you dumb?" → "are you deaf?"; ch58 §21 "Tra-di-ri-di-ra" paraphrased; ch60 §19 "Cunctators" → "procrastinators" (Fabius allusion lost); ch64 §30 "Empress' Field" → "the parade ground" while §31 and §44 keep "Empress's Field", breaking the deliberate echo; ch66 §25 dialogue tag dropped; ch67 §22 "bad opinion" → "harsh word"; ch70 §35 "smeared with clay" → "get your hands dirty"; ch71 §18 trailing "etc." dropped; ch72 §11 "Peterkin" → "Petrusha"; ch72 §12 "his eyes dropped" → "his eyes darkened"; ch76 §37 "mounted the stairs again" → "went down … and then came back up"; ch80 §0 "Gorchakov" → "Gortchakov".

---

## 6. Final verdict

**The corrected file is safe to accept.** All 7 edits are verified correct against the Maude source; the diff is exactly what was claimed; no paragraph counts, chapter numbers, or titles were disturbed; no edit introduced a new error.

**The review that produced it was not complete.** Of the 15 chapters certified "sound," at least three are not: ch74 (four defects, one of them a sentence-breaking omission), ch60 (one material compression), and ch59/64/65/70/71/77 carry residual instances of the two defect classes the pass claims to have eliminated. The pass also documented its rationale from an incorrect reading of the book's conventions.

**Recommended before this batch is marked accepted:**
1. **Must fix** — ch74 §26 (restore "in French", `amant`, `que vous êtes un sot`; the sentence is currently broken).
2. **Should fix** — ch74 §9 and §16 footnotes (restore source wording: "You clear out of this.", "…in that galley?"); ch59 §21 (restore `Quelle terrible chose que la guerre!`); ch60 §7 (restore the creaking-cogs/whirring-pulleys clause).
3. **Should resolve** — the Andrei/Andrew split across ch64–65 and the other 4 name slips (or confirm coverage by the normalization pass).
4. **Project decision needed** — whether `[Speaking in X]` + inline English stays (79 sites, incl. accepted batches A/B/D1/early-flags) or the foreign original is restored book-wide. Batch C now does it both ways.
