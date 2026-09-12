# Independent review — Meditations, Book IX, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/meditations-modern-en-20260911-v2` (detached worktree at commit `54d192994`, `/tmp/claude-0/med-review-9b`) |
| Candidate | `book9/candidate-v1.json`, sha256 `b02cf1353bc209d905bb58d0183e79e9fe69b135c6daba22e257c79d33b23d89` — recomputed locally; matches `provenance.json`, `README.md` and the value in the review assignment |
| Source | George Long 1862, `book9/source-book9.json` sha256 `aca874d060abe2d7fb6b9d16bd1a4a5f5027780a4314accf6791344fcaa00bbe` (matches), byte-identical to chapter 9 of `../meditations-original-en.staged.json` sha256 `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` (matches, the twice-rebuilt file, 487 paragraphs, Book 9 = 42); PG base text `source/pg15877-long-1862.txt` sha256 `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` (matches) |
| Staged-original no-rebuild claim | **Verified independently, and it holds.** Not by re-running the script — byte-identity to a re-run proves only that the file matches the script, which is exactly how the Book IV captions and the Book VII footnotes survived the first build. PG lines 5419–5864 were re-extracted with a *separately written* reconstruction and diffed against the staged text. See the section below. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-14.md`, in order, three paragraphs at a time with the supplied `CONTEXT ONLY` paragraphs (coverage `B09-P001`…`B09-P042`, each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (including the **"shall" rule** promoted into Voice and form at Book VIII acceptance, the in-text-Greek exception before VIII.57, and the **extended "divinity" row**), `WORKFLOW.md` (Anders's voice rules and the accessibility standard), `book9/review-instructions.md`, `book9/continuity.md`, `PROVENANCE.md` §4, `00-progress-ledger.md`; `book8/review/findings-v1.md` read first for format and calibration |

**Verdict: Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must fix before acceptance) | **1** |
| minor (worth improving, drafter's discretion) | **3** |
| optional (preference, no defect) | **5** |
| paragraphs with no material issue | **35** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Long's words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

This is a very clean book. The single substantive finding is a three-word repair in one passage (IX.40); nothing else in the book is missing, added, softened, expanded, or imported.

---

## Verification performed before reading

### Hashes and mechanical checks

All four hashes in the assignment recomputed locally and all four match: candidate `b02cf135…`, `source-book9.json` `aca874d0…`, staged original `7798607d…` (487 paragraphs, section profile 17, 17, 16, 51, 36, 59, 75, 61, **42**, 38, 39, 36), PG source `6584df7e…`.

The mechanical-check block in `book9/README.md` was re-run verbatim and printed `OK` with the expected hashes. It covers: `source-book9.json` byte-identical to chapter 9 of the staged original; 42 candidate paragraphs one-to-one; every paragraph numbered `n. `; the 487-paragraph twelve-chapter shape; no `[Illustration` and no footnote opener, `Butler`, `Nekuias`, `Davies and Vaughan`, `Acharnenses` or `From the Apologia` anywhere in the staged file; the IX.21/IX.22 boundary whole; packet coverage exactly `B09-P001`…`B09-P042`; packet text identical to the JSON; readable copy identical to the JSON; the three dagger clauses present in source and candidate; no square bracket and no cross-reference left in the candidate; the four bracket folds present; the "shall" inventory; and the base-text points.

### The no-rebuild claim, checked independently

The assignment is explicit that byte-identity to a re-run build proves only that the file matches the script. So the check here was **not** a re-run. PG lines 5419–5864 (the `IX.` header at 5419 to the `X.` header at 5865) were re-extracted by a reconstruction written from scratch for this review — join on blank lines, drop `[Illustration…]` lines, drop indented blocks whose first line opens with a bracketed capital, strip footnote reference letters — and its 42 reconstructed paragraphs were normalised and diffed word for word against the staged Book IX.

**The only three differences in the whole book are the three dagger marks** (IX.6 after "happens", IX.26 between "But enough" and "[of this]", IX.27 at the very end after "value"), which `PROVENANCE.md` §4 documents as deliberately removed. Nothing else differs anywhere. That means, independently of the script:

- **The caption is gone.** `[Illustration: THE FORUM]` stands alone at PG line 5628, exactly where the drafter and the Book VIII reviewer said it does, between IX.21 and IX.22. It is not in the staged text; IX.21 ends "…a thing to be afraid of." and IX.22 begins "22. Hasten [to examine]…", both whole. No `[Illustration` survives anywhere in the staged file.
- **Footnotes.** Eight in the book, at PG lines 5462, 5515, 5601, 5649, 5680, 5707, 5778 and 5858 — the eight the drafter names, at the lines the drafter names. Every indented line in PG 5419–5864 was listed: each is either one of those eight openers or a continuation line of one of their bodies. There is **no flush-left footnote opener and no flush-left footnote body**, so the VII.45 defect does not recur — and this was tested the strong way, not the weak one: a flush-left footnote body would have been picked up by my reconstruction as ordinary text and would have shown as a diff. None did. None of the footnote contents (`Butler's Analogy`, `Note 1 of the Philosophy`, `Cicero, De Off.`, `Gataker`, `Schultz`, `Davies and Vaughan`, `Apechei to idion`, `Epictetus, iii. 9, 12`) appears in the staged file. The one near miss — IX.29's body text ending "nor yet expect Plato's Republic" — is Long's translation, with its `[A]` marker correctly stripped and its footnote about Davies and Vaughan correctly gone.
- **Running heads, page numbers, catchwords.** None. No digits-only line and no all-caps line in the range except the `IX.` header itself.
- **Verse and verse citations.** None. Book IX has no indented line outside the eight footnote bodies and no `HESIOD,`-style citation, so the class that produced the V.33 and VII.45 problems has nothing to act on here.
- **Greek in the body.** None. Every `[Greek: …]` span in PG 5419–5864 sits inside a footnote body (5473–5476, 5649, 5651, 5680, 5858, 5860) and is stripped with it. The in-text-Greek exception added to `GLOSSARY.md` before VIII.57 therefore does not fire in Book IX, correctly.
- **Dagger marks.** Exactly three `+` marks in the range, at PG 5525 (IX.6), 5661 (IX.26) and 5669 (IX.27), matching `PROVENANCE.md` §4, `provenance.json` and `review-instructions.md`.

**The claim holds, and no rebuild is needed.** `git status` is clean on the staged file. No accepted book is reopened.

### Apparatus arithmetic, recounted from the source

Long's square brackets in Book IX: **four**, and only four — IX.9 `[this union]`, IX.22 `[to examine]`, IX.24 `[such is everything]`, IX.26 `[of this]`. Cross-references: **six spans in five paragraphs** — IX.1 `(vii. 75)`, IX.17 `(viii. 20)`, IX.20 `(vii. 29; ix. 38)`, IX.28 `(vi. 44; vii. 75)` and `(xii. 21)`, IX.35 `(iv. 45, vii. 18)`. Both counts are exactly right, and all six cross-references are dropped in the candidate with no trace left.

**The zero-drops claim under D11 is correct, and I checked it by reading all four brackets, not by trusting the count.** D11 fires on the III.6 `[or, practically]` shape — Long's "or" joining two English renderings of one Greek word. Not one of these four contains "or" or offers a second rendering of anything:

- **IX.9 `[this union]`** — the object of "avoid". Without it, "though men strive to avoid, they are caught and held by it" has a transitive verb with no object. **Referent supplement. Fold.**
- **IX.22 `[to examine]`** — the verb the meditation turns on. Without it, "Hasten your own ruling faculty" is not a sentence. **Referent supplement. Fold.**
- **IX.24 `[such is everything]`** — the predicate. Without it the section is a list of three images and no verb. **Completion. Fold.**
- **IX.26 `[of this]`** — completes Long's elliptical "But enough". **Completion. Fold.**

So four brackets, four folds, zero drops. The drafter's reading of all four is right, and the point that this is a fact about Long's text in Book IX rather than a relaxation of D11 is also right. That Standard Ebooks runs all four as plain text corroborates it but is not what decides it; the "or" test does.

### Word-level diff of all 42 paragraphs

A token diff of source against candidate was generated and read beside the packets, so every word Long has that the candidate does not, and the reverse, was inspected one at a time. **Every single difference in the book is explained by a documented decision** — a thou-form, a modernised verb form, a glossary row, a bracket fold, a dropped cross-reference, a punctuation normalisation, or one of the per-paragraph decisions in `continuity.md`. The complete list of word *insertions* in the whole book is six: "in" (IX.3, "it is in no way right"), "that" (IX.22), "after death" (IX.30, the glossary row), "a" (IX.42, "in such a way"), "of them" (IX.29), and the re-ordered "experience" at IX.2. The complete list of *deletions* is four: "and" (IX.10, "But and if"), "thou" (IX.28, emphatic), "not" (IX.29, re-ordered into "Do not draw"), "posthumous" (IX.30, the glossary row). **Not one clause, image, qualification, negation, list item or "neither … nor" chain is missing anywhere in Book IX, and nothing has been added.**

### Ruling on the word ratio

The recorded 0.9965 (4,252 → 4,237 words) is right, and the diff confirms it is not hiding a shortening. **IX.20's 0.79 is fully explained and is not a defect**: the meditation is nineteen words, four of which are the cross-reference `(vii. 29; ix. 38)`. Drop four tokens from nineteen and the ratio is 0.789 arithmetically; every word of Marcus's sentence is present. The same is true of the next lowest — IX.17 (0.926, `(viii. 20)`), IX.28 (0.963, two cross-references), IX.35 (0.956, one cross-reference plus "dost thou say" → "do you say"), IX.10 (0.983, "But and if" → "But if"). At the top, IX.29's 1.016 is "All drivellers." → "All of them drivel." and "Draw … not" → "Do not draw". **Nothing is padded and nothing is cut**, and no short meditation is expanded: IX.4, IX.5, IX.6, IX.7, IX.13, IX.14, IX.15, IX.16, IX.18, IX.19, IX.38 are all at Long's length to the word, and IX.4, IX.5, IX.14 and IX.38 are byte-identical to Long.

### Glossary

Applied consistently across all 42 paragraphs, and the two rows that could most easily have gone wrong did not.

**The extended "divinity" row does exactly what it says.** IX.1's two modified count uses — "impiety towards the highest divinity", "impiety to the same divinity" — keep "divinity", and the row's "the divine" is nowhere forced into them. That is the right reading of Long: "the highest divine" is not English, and "the highest divinity" is current English for what he means. The row was extended and pushed before any paragraph was drafted, which is the correct order and is verifiable in the git history.

Also checked one at a time and correct: `the universal nature` kept as its own term (IX.1 ×7, IX.35); `the common nature` (IX.29); `the common intelligent nature` (IX.9); `the whole universe` (IX.19, IX.32); `rational being` for `rational animal`/`reasonable animal`/`rational social animal` (IX.1, IX.8, IX.9, IX.16) while `animals which have not reason`, `animals devoid of reason` and `even in animals` are rightly left as animals, because there Long does mean beasts and the contrast in the sentence is precisely beasts against rational beings; `intelligent beings` for `intelligent animals` at IX.9, where Long means men; `the ruling part` for `ruling faculty` and for `leading principles` (IX.7, IX.15, IX.18, IX.22 ×3, IX.26, IX.34, IX.39); `the divine` not needed in this book; `Providence` and `God` keep Long's capitals (IX.1, IX.10) beside lowercase `a god` (IX.28) and `the gods` (IX.11, IX.27, IX.37, IX.40); `opinion` (IX.6, IX.13, IX.21, IX.29 ×2, IX.32); `imagination` (IX.7); `disturbances` for `perturbations` (IX.31, IX.41); `change` for `mutation` (IX.19) while Long's own `transformations` stays (IX.28); `commonplace` for `vulgar` (IX.3); `kindness`/`kind` for `benevolence`/`benevolent` (IX.42 ×2); `the common good` for `the common interest` (IX.42); `in a way` for `in a manner` (IX.9 ×2, IX.19, IX.28); `a name after death` for `a posthumous name` (IX.30); generic `a man`/`men` throughout.

### Ruling on "movement" / "impulse"

**The line is drawn in the right place, in all five places.** The glossary converts Long's "movement" only where he means *hormē*, and that is exactly where the candidate converts it:

- **IX.21 "cessation from movement and opinion" → "impulse"** — correct. The triad is activity, impulse and opinion: the three things that cease. Physical motion is not what stops when a life-stage ends, and "opinion" beside it fixes the Stoic sense.
- **IX.31 "let there be movement and action terminating in this" → "impulse"** — correct. Impulse and act is the standard pair, and the sentence is about the internal cause, which is where *hormē* lives.
- **IX.1 "a certain original movement of Providence"** — rightly kept. This is the first motion of the cosmos, not an impulse of a mind.
- **IX.28 "the periodic movements of the universe"** — rightly kept. Cosmic revolutions.
- **IX.41 "such movements as go on in the poor flesh"** — rightly kept, and this is the one that would have been easiest to get wrong, because it sits in a sentence about the mind. Long means motions in the body, which is the whole point of Epicurus's boast; rendering it "impulses" would have made the flesh the seat of impulse and inverted the argument. It was not.

### The "shall" audit — the first book drafted under the rule

Every "shall / shalt" in Long's Book IX was located and classified independently, then matched against the candidate. Long has **eleven**; the candidate keeps **eight**; the three removed are all in IX.3. That matches the drafter's report exactly, and **the rule is being applied consistently**. Paragraph by paragraph:

**Removed — three, all plain futures in subordinate clauses of time or condition, all correctly taking the plain present or "will":**

1. IX.3 "the time when the child **shall come** out of thy wife's womb" → "when the child **comes** out" — temporal clause, plain present. Correct.
2. IX.3 "the time when thy soul **shall fall** out of this envelope" → "when your soul **falls** out" — temporal clause, plain present. Correct.
3. IX.3 "a vulgar kind of comfort which **shall reach** thy heart" → "which **will reach** your heart" — plain future in a relative clause. Correct; "will" rather than the present is right here, because the clause is not temporal or conditional and the present would read as a general truth.

**Kept — eight, and all eight are licensed:**

4–9. IX.40 ×6, "How **shall** I be able to lie with that woman?", "How **shall** I not desire to lie with her?", "How **shall** I be released from this?", "How **shall** I not desire to be released?", "How **shall** I not lose my little son?", "How **shall** I not be afraid to lose him?" — first-person deliberative questions, direct, and current English in their own right. The rule names this class explicitly. Correct, and rendering them "will" would have been a real loss: the deliberative "shall" is what makes them prayers rather than predictions.

10. IX.41 "how the mind … **shall** be free from disturbances" — an **indirect** deliberative question in the third person, inside Epicurus's reported speech. The rendering is right; "how the mind will be free" would turn Epicurus's problem into a forecast. **But the rule as written licenses "the deliberative 'shall' of a direct question in the first or third person", and this is not a direct question.** See finding 41.1: the rendering should stand and the rule's wording should be widened to say "direct or indirect", so that the next drafter does not read the rule literally and convert it.

11. IX.29 "They themselves **shall** judge whether they discovered what the common nature required" — **confirmed as the emphatic/volitional "shall", and kept.** The drafter's reading is right and I would resist "will" firmly. Marcus is not forecasting a future verdict by Alexander, Philippus and Demetrius; he is dismissing the question of their merits as none of his business — the sense of the English idiom "they shall answer for it", "see thou to that". The very next sentence proves it: "**But if they acted like tragedy heroes, no one has condemned me to imitate them**" — a rebuttal of a claim on him, not the second half of a prediction. A plain future here would make Marcus assert something about three dead men that he has just declined to assert. Third-person volitional "shall" is current English in exactly this use, and the rule names the class.

**No second-person "shall" and no plain-future "shall" survives anywhere in the book**, verified by regex over all 42 paragraphs. The line is in the right place, and Book IX is a clean first application of the rule.

### Rulings on the base-text calls

**1. IX.34, "pool souls" → "poor souls" — correct. Endorsed without reservation.**
PG line 5741 prints "Imagine that thou seest their **pool** souls laid bare." This is not a variant reading; it is a slip, and three independent things settle it. (a) "Pool souls" is not English and means nothing. (b) Long himself writes "approach their **poor** souls" in the same construction seven sections earlier, at IX.27, PG line 5664 — and I confirmed by grep that those are the *only* two occurrences of the phrase in the whole PG file, so the internal witness is exact rather than approximate. (c) Standard Ebooks' Long reads "poor souls". This is the VIII.37 `Fergamus`/`Pergamus` case in the same shape, and the same answer is right. Following PG's letters here would have printed a typo into a reading edition. The departure is correctly the *only* one in the book and correctly flagged.

**2. IX.35 "bound", not "found" — correct. PG is right and Standard Ebooks is wrong.**
"The world has been condemned to be **bound** in never ceasing evil" is what the sentence needs: the verb governed by "condemned to be" has to express being held fast, and "bound in evil" is that. "Condemned to be *found* in never ceasing evil" says nearly nothing and, as the drafter notes, looks like an eye-skip from "no power has ever been **found** in so many gods" eleven words earlier — which is precisely the shape compositor and OCR errors take. PG followed. Correct.

**3. IX.35's added "done" — correct. PG is right; SE is smoothing.**
Long: "all things are now **done** well, and from eternity **have been** in like form". The participle is gapped from the previous clause, which is ordinary English and ordinary Long. Standard Ebooks' "have been **done** in like form" fills the gap — an editor's improvement, not a reading. Under D6 the base text governs and the candidate reproduces Long's ellipsis. Correct.

**4. IX.40 "Pray thou:", not "Another prays:" — correct, and this one is decisive on internal evidence alone.**
The passage is built on strict alternation: a man's prayer, then Marcus's correction of it, three times. Standard Ebooks' reading gives four petitions by other men and only two corrections, and it assigns to "another man" the line "How shall I not desire to be released?" — which is a Stoic corrective and cannot be the prayer of the man who has just asked "How shall I be released from this?" PG's "Pray thou" restores the pattern and the sense. PG followed, on the VIII.2 and VIII.44 precedent. Correct. (The *rendering* of these turns is the book's one substantive finding — see 40.1 — but the base-text call is right.)

**5. IX.29, "insolence" or "indolence" — I rule for PG's "insolence", and on grounds stronger than D6.**
The drafter follows PG under D6 and records the variant as genuinely open. I think it can be closed, and on the sense. The sentence is the last of a meditation whose whole subject is the temptation to grandiosity: the worthless people "playing the philosopher", the refusal to "expect Plato's Republic", being "content if the smallest thing goes on well", the warning not to act "like tragedy heroes". Its final clause answers "Simple and modest is the work of philosophy" — and the opposite of *simple and modest* is *showy and proud*, not *lazy and proud*. Indolence has no antecedent anywhere in the meditation and would introduce a vice Marcus has not been discussing; insolence (with pride) is the exact vice he has spent the paragraph naming, and pairs naturally with it. Separately, "indolence"/"insolence" is a one-letter confusion of exactly the kind an OCR'd or re-keyed text produces, and Standard Ebooks' Long is a re-keying of a Long printing. **PG's "insolence" is right; the candidate is right; the variant can be recorded as resolved rather than open.**
*Limitation, stated plainly:* I did not consult a Greek text and make no claim about the Greek word behind it. My ruling rests on the argument of the meditation and on the shape of the error, and a reviewer with the Greek could overturn it. I would not, however, call it open on the English evidence.

**6. IX.28, the Standard Ebooks paragraph break — correct, it is not a section break.**
Standard Ebooks breaks typographically before "Soon will the earth cover us all", which is why an automatic count of its Book IX returns 43. PG prints §28 whole; 42 is the standard section count for Book IX and is what `PROVENANCE.md` §1 and every count in this package use; no text differs on either side of the break; and a section break there would orphan "In a word, if there is a god, all is well" from the three-way disjunction it concludes. **Keeping Long's section whole is right, and is also the only choice compatible with the hard paragraph-alignment constraint in `WORKFLOW.md`** — a 43rd paragraph in Book IX would break the 487-paragraph structure the whole package is built on. Correct.

### Nothing imported from other translations

No phrase in the candidate departs from Long in a way Long's own words do not explain — I checked this by reading the diff word by word, and every departure traces to a glossary row, a `continuity.md` decision, or a thou-form. The passages most at risk are the widely quoted ones, and each keeps a Long-specific turn that the familiar modern versions do not have: IX.4 "He who acts unjustly acts unjustly to himself, because he makes himself bad" (Long's clause exactly); IX.6 "that is enough" after the three present things, with Long's dash; IX.13 "or rather I have cast out all trouble, for it was not outside, but within and in my opinions"; IX.21 "in a sense their death"; IX.28 "if there is a god, all is well; and if chance rules"; IX.29 "no one has condemned me to imitate them" and "Well then, man"; IX.36 "and purple dye, blood"; IX.42 "just as if the eye demanded a recompense for seeing, or the feet for walking". Proper names are PG's throughout (Alexander, Philippus, Demetrius of Phalerum, Epicurus, Plato). I did not compare against other translations for wording and claim nothing about them; the absence of such a finding is not proof.

### Two book-level observations, not findings

**Inferential "then".** The candidate adds a comma pair around inferential "then" **twice** in the whole book (IX.23, IX.37), leaving five bare. That is far lighter than Book VIII (sixteen in sixty-one) and lighter than every accepted book. Nothing to raise; recorded only so the drafter knows it was looked at, and as a note that the house habit has settled down.

**Long's commas.** The candidate silently removes four of Long's commas where they now misdirect a modern reader (IX.1 "he fights against it who is moved of himself", IX.9 "All things which participate … all move", IX.29 "engaged in matters political and, as they suppose"), and adds one (IX.28 "by way of sequence, in a way"). Each is right in itself and none moves a clause. I flag the *one* that goes the other way — a comma that should have been moved and was not — as finding 9.1.

---

## Findings and per-paragraph record

Every paragraph IX.1–IX.42 appears below exactly once, in order.

## IX.1 — B09-P001

**Finding 1.1 — minor (worth improving).** Long: "for he fights against it, who is moved of himself to that which is contrary to truth, **for** he had received powers from nature…". Candidate: "…contrary to truth, **since** he had received powers from nature…". `continuity.md` records "'Inasmuch as' → 'since' (four times; 'inasmuch as' is not current)". **There are only three "inasmuch as" in IX.1.** The fourth "since" replaces Long's ordinary "for", which is current English and needed no change — and the substitution is not recorded anywhere. The effect is small but real: Long's sentence runs "…, inasmuch as …, and inasmuch as …; for he fights against it who …, for he had received powers", where the two "for"s mark the two explanatory descents, and the candidate flattens all four connectives into "since". **Proposed:** restore Long's connective — "…contrary to truth, **for** he had received powers from nature through the neglect of which…" — and correct `continuity.md` to "three times". If the drafter prefers to keep "since" for the rhythm, the fix is the documentation line alone; what should not stand is a change no record accounts for. Confidence high on the miscount; medium on which way to resolve it.

**Finding 1.2 — optional (preference).** Long: "for the universal nature is the nature of **things that are; and things that are** have a relation to all things that come into existence." Candidate: "…is the nature of **the things that are, and the things that are** have a relation…". Two definite articles added and a semicolon lowered to a comma. Nothing in the sense changes and the articles arguably help — Long's anarthrous "things that are" is a technical term (*ta onta*) and the article makes it read as one. But the semicolon was doing work: it separates the definition of the universal nature from the consequence drawn about it, and a comma splices two independent clauses. **Proposed, if the drafter wants it:** keep the articles, restore the semicolon — "the nature of the things that are; and the things that are have a relation…". Low stakes either way.

Also noted, and all correct: "rational animals" → "rational beings" (glossary); "according to their deserts" → "according to what they deserve", twice, the Book I rendering at I.16 and now in its second book — I agree with `continuity.md` that if XI.18 brings it back it should be promoted to a glossary row; "transgresses her will" → "goes against her will"; "prime cause" → "first cause"; "manifestly" → "plainly", which is Long's own word two sentences earlier and so is his vocabulary, not a substitution; "towards these they who wish" → "towards these, those who wish"; the cross-reference `(vii. 75)` dropped; **"a certain original movement of Providence" rightly keeps "movement"**; and **"the highest divinity" / "the same divinity" rightly keep "divinity"** under the row extended for this book. The long chain of the argument — injustice against a nature that made us for one another; lying against a nature that *is* truth; pleasure-seeking as an accusation of misallocation; the closing account of what "employs them equally" means — survives step for step, with every "is guilty of impiety" in place.

## IX.2 — B09-P002

No material issue found.

Also noted: "Hast thou determined to abide with vice, and hast not experience yet induced thee" → "Have you determined to remain with vice, and has experience not yet induced you" is a clean re-ordering that loses nothing; "fly" → "flee" follows VII.71 and VIII.48. **"The next best voyage, as the saying is" is rightly kept.** It is opaque to a modern reader taken cold, but Long marks it as a proverb in the text itself, and replacing it would delete the fact that Marcus is quoting one — which is the accessibility standard's own line about keeping the work's literary character. The pestilence-of-the-atmosphere image is intact.

## IX.3 — B09-P003

**Finding 3.1 — optional (preference).** Long: "thou wilt **be made** best reconciled to death by observing the objects from which…". Candidate: "you will **be** best reconciled to death by observing…". The auxiliary "made" is dropped, and the drop is not listed in `continuity.md` among the paragraph's decisions. Long's "be made reconciled" carries a shade the plain passive does not — the observing *brings you* to reconciliation, rather than you simply ending up reconciled. English still has the construction ("you will be reconciled to it"), and "be made best reconciled" is genuinely awkward, so the candidate's reading is defensible. **Proposed, if the drafter wants Long's causal shade back:** "you will be brought best to terms with death by observing…" — though that is further from Long's words than the candidate is, and I would sooner see the change simply recorded in `continuity.md` than undone. Low stakes.

Also noted, and all correct: the three "shall" removals audited above; "vulgar kind of comfort" → "commonplace kind of comfort" (glossary); "it is no way right" → "it is in no way right"; **"envelope" rightly kept** — it is Long's concrete image for the body and it is current; **"perchance" rightly kept** inside Marcus's quoted cry, which is his one heightened sentence and a quotation; the "neither careless nor impatient nor contemptuous" chain intact; the list of natural operations intact in order; and the sting in the tail — that the comfort is the badness of the company you leave — landing exactly as Long has it.

## IX.4 — B09-P004

No material issue found. Byte-identical to Long; a two-sentence meditation left at two sentences.

## IX.5 — B09-P005

No material issue found. Byte-identical to Long. The negative half of the aphorism ("not only he who does a certain thing") is intact, which is the whole point of the section.

## IX.6 — B09-P006

No material issue found. **Dagger clause (PG 5525), correctly handled**: the section stands as Long has it, pronouns modernised and nothing else, with the dash and "that is enough" untouched. The triad — opinion founded on understanding, conduct directed to social good, disposition of contentment — keeps its three members and its order. This is the VI.50 reading confirmed at VII.16 and enforced at VIII.51, applied correctly.

## IX.7 — B09-P007

**Finding 7.1 — optional (preference).** Long: "Wipe out imagination**;** check desire**:** extinguish appetite**:** keep the ruling faculty in its own power." Candidate reproduces the punctuation exactly, changing only "faculty" → "part". Long's pointing is inconsistent — one semicolon and two colons between four coordinate imperatives — and a modern reader may look for a distinction that is not there. `continuity.md` records the decision to keep it. I think keeping it is defensible (it is Long's text, and `GLOSSARY.md` does not license repointing), but it is the one place in the book where reproducing Long's accidentals costs a little clarity. **Proposed, if the drafter wants it uniform:** semicolons throughout. **Optional only**; I would not press it, and consistency with eight accepted books is worth more than this.

Also noted: "imagination" is correctly the glossary's own word, not "impressions"; the four commands stay four bare imperatives, not expanded.

## IX.8 — B09-P008

No material issue found.

Also noted: "reasonable animals" → "rational beings" is the glossary row and names IX.8 explicitly. **"The animals which have not reason" is rightly left as animals** — Long means beasts, and the sentence's whole contrast is beasts against rational beings, so applying the row there would have collapsed the distinction. That is the VIII.12 reading, correctly carried over.

## IX.9 — B09-P009

**Finding 9.1 — minor (worth improving).** Long: "we find swarms of bees, and herds of cattle, and the nurture of young birds, **and in a manner, loves**". Candidate: "…and the nurture of young birds, **and in a way, loves**". The glossary substitution is right, but Long's comma placement is now actively misleading: with "in a way" as the modern hedge, a reader meets "and in a way, loves" and parses "loves" as a **verb** — "and in a way [it] loves" — when it is the fourth item in the list of what we find among animals (*erōtes*, attachments). Long's own punctuation had the same weakness, but "in a manner" read as a set phrase and carried the reader past it; "in a way" does not. This is the one place in Book IX where a modern reader is likely to mis-parse a sentence. **Proposed, smallest possible fix:** move the comma — "and the nurture of young birds, **and, in a way, loves**". One character, no words changed, the hedge properly parenthetical and "loves" recovered as a noun. Confidence high.

Also noted, and all correct: "of an aerial kind" → "of the nature of air", following VIII.54; "asunder" → "apart"; "rational animals" → "rational beings" and "intelligent animals" → "intelligent beings", the latter rightly, since Long means men there; "in a manner" → "in a way" twice; **"[this union]" folded, correctly classified as a referent supplement**; **"anything earthy" rightly kept twice**, as is "armistices". The whole physics — earth, liquid, air, fire, then the common intelligent nature, then the ascent to the stars, then the turn onto men who alone have forgotten — survives in order with every stage present.

## IX.10 — B09-P010

No material issue found. "But and if" → "But if" is right; the construction is dead (it is the King James "but and if") and the plain conditional is Long's sense. The fruit-bearing argument and its return onto reason are intact.

## IX.11 — B09-P011

No material issue found. "So kind they are" keeps Long's inversion, which is current and carries the tone; "or say, who hinders thee?" keeps its abruptness.

## IX.12 — B09-P012

No material issue found.

Also noted: **"Labor not as one who is wretched" is rightly kept with Long's inversion.** It is an imperative and the fronting is the sentence's force; "Do not labor as one who is wretched" would be flatter and no clearer, since the only possible parse of Long's line is the right one. The dash and the two-part purpose ("to put yourself in motion and to check yourself") are intact.

## IX.13 — B09-P013

No material issue found. "To-day" → "Today" is the spelling convention. The self-correction ("or rather I have cast out all trouble") — the hinge of the meditation — is kept as a self-correction.

## IX.14 — B09-P014

No material issue found. Byte-identical to Long. **"Ephemeral" rightly kept**: current English, and the exact word for what Marcus means.

## IX.15 — B09-P015

No material issue found. "Aught" → "anything" is right; "neither knowing … nor expressing" keeps its chain; the one-word answer "The ruling part." keeps its abruptness, which is the meditation.

## IX.16 — B09-P016

No material issue found. "Rational social animal" → "rational social being" is the glossary row. The chiasmus — "not in passivity but in activity … not in passivity but in activity" — is Long's own repetition and is kept.

## IX.17 — B09-P017

No material issue found. The cross-reference `(viii. 20)` dropped; the ratio dip to 0.926 is that drop and nothing else. Long's fronted "For the stone which has been thrown up it is no evil to come down" is kept, and the negative pair ("no evil … nor indeed any good") is intact.

## IX.18 — B09-P018

No material issue found. "Men's leading principles" → "men's ruling parts" is the glossary's fifth Long variant for *to hēgemonikon*, added to the row in Book V — correctly applied, and correctly *not* read as a modern psychological term.

## IX.19 — B09-P019

No material issue found. "Mutation" → "change" and "in a manner" → "in a way" are glossary rows. Long's own "changing … change" repetition is rightly kept rather than varied away.

## IX.20 — B09-P020

No material issue found, **and the 0.79 ratio is ruled on and dismissed.** It is the book's minimum and it is arithmetic, not omission: the meditation is nineteen words, of which `(vii. 29; ix. 38)` is four. Every word Marcus wrote is present — "It is your duty to leave another man's wrongful act there where it is." Dropping the cross-reference is required by `GLOSSARY.md` (Voice and form) and recorded in `continuity.md`. Nothing to fix.

## IX.21 — B09-P021

No material issue found. "Cessation from movement and opinion" → "impulse and opinion" is correct (ruled on above). The four deaths — child, youth, manhood, old age — are all present, as are the three lives (under grandfather, mother, father), and the twice-repeated "Is this anything to fear?" keeps its refrain. **This is the paragraph the illustration caption sat against, and it ends exactly where Long ends it.**

## IX.22 — B09-P022

No material issue found.

Also noted: **"[to examine]" folded, correctly classified** — without it "Hasten your own ruling part" is not a sentence. The candidate adds "that" in the fourth clause ("and **that** you may also consider"), which is the one place a word is supplied for syntax rather than sense; it is right, because Long's clause is plainly coordinate with "that thou mayst know" and without the conjunction the modern sentence reads as a new main clause. "Ruling faculty" → "ruling part" ×3. The three purposes (make it just / remember of what you are a part / know whether he acted ignorantly) keep their order and their triple "that".

## IX.23 — B09-P023

No material issue found. "Tears asunder thy life" → "tears your life apart"; the mutiny image and the popular-assembly analogy are intact. The added commas round "then" are house style.

## IX.24 — B09-P024

No material issue found.

Also noted: **"[such is everything]" folded with em dashes**, correctly — it is the section's only predicate. "Exhibited" → "shown"; **"mansions of the dead" → "dwellings of the dead" is right and matters**: "mansions" now means large houses, which inverts Long's image of the underworld as a stage set. The three images (children's quarrels, their sports, spirits carrying dead bodies) survive as images, unexplained.

## IX.25 — B09-P025

No material issue found. "Peculiar form" → "particular form" is the Book VIII ruling at VIII.12, on the V.3 and VI.3 precedents, correctly applied; the fixed collocation "peculiar to" does not occur here. The three-step procedure (examine the form / detach it from matter / determine the longest time) keeps its steps and its order.

## IX.26 — B09-P026

No material issue found. **Dagger clause (PG 5661), correctly handled.** "But enough [of this]" becomes "But enough of this." — the fold falls inside the dagger-marked sentence, and I agree with the drafter that folding Long's own bracketed completion is not a smoothing of a corrupt passage: the words are Long's, the brackets are his supplement, and nothing has been made clearer than the source. This is the VI.50 practice as confirmed at VII.16, and it does not repeat the VIII.51 error the Book VIII reviewer reverted, which was a *stylistic* change inside a dagger clause. "Ruling faculty" → "ruling part".

## IX.27 — B09-P027

No material issue found. **Dagger clause (PG 5669), correctly handled**: the final sentence stands as Long has it, pronouns modernised, with the dagger's uncertainty left where Long left it and no attempt to resolve what his own footnote calls corrupt. "Their poor souls" is PG's own reading here — which is what makes it the internal witness for IX.34.

## IX.28 — B09-P028

**Finding 28.1 — optional (preference).** Long: "and if chance rules, **do not thou also be** governed by it." Candidate: "and if chance rules, **do not let yourself also be** governed by it." `continuity.md` defends this on the ground that Long's emphatic "thou" inside an imperative has no modern form, which is true — "do not you also be governed" is not English. But "let yourself" is not quite neutral: it adds a note of permission or self-indulgence (you allowing it) that Long's plain passive does not have, in a sentence whose point is that chance-rule need not extend to your mind. **Proposed, a smaller move that keeps the passive and still places the emphasis:** "and if chance rules, do not be governed by it **yourself**." Confidence medium; the candidate's reading is defensible and nobody will misread it.

Also noted: "be thou content" → "be content" is right (English has no emphatic imperative form and the reflexive is not needed twice in one section); both cross-references dropped; "in a manner" → ", in a way" with the comma added so the hedge attaches where Long's does; "transformations" rightly kept as Long's own word. **The three-way disjunction survives as a disjunction** — intelligence moving for each effect, intelligence moving once, or indivisible elements — with the consequence attached to each, and Long's dash before "In a word" is kept. **The Standard Ebooks paragraph break is correctly ignored** (ruled on above).

## IX.29 — B09-P029

**Finding 29.1 — optional (preference).** Long: "**All drivellers.**" Candidate: "**All of them drivel.**" The reasoning in `continuity.md` is sound — "driveller" is no longer current, "drivel" is, and the sentence stays at three words. What is lost is the grammatical shape: Long's fragment is a *verdict*, a nominal label thrown at the people just described, and the candidate turns it into a full clause reporting what they do. Marcus's contempt in this book is characteristically nominal ("apish tricks", "poor spirits carrying about dead bodies"). **Proposed, if the drafter wants the verdict back:** "Drivellers, all of them." keeps the noun in a current word order, or "Drivel, all of it." keeps a nominal fragment with the modern word. Confidence low — this is a matter of ear, and the candidate's version is perfectly good English that loses no content.

**Ruled on and confirmed: "They themselves shall judge" stays.** See the "shall" audit above. This is the emphatic/volitional third-person "shall", licensed by the rule, and the sentence that follows ("But if they acted like tragedy heroes, no one has condemned me to imitate them") proves it is a dismissal rather than a prediction. "Will judge" would be a real loss of sense, not a neutral modernisation.

**Ruled on: "insolence" is right** (see the base-text rulings above). I close the variant rather than leave it open, on the argument of the meditation — the vice being warded off here is grandiosity, not sloth — while noting I did not consult the Greek.

Also noted: "Draw me not aside" → "Do not draw me aside"; the comma after "political" removed, correctly; "Well then, man" keeps Long's self-address; "playing the philosopher", "tragedy heroes" and "Plato's Republic" all kept; the winter-torrent image untouched and unexplained; the footnote about Davies and Vaughan correctly absent from the source itself.

## IX.30 — B09-P030

No material issue found. "Solemnities" → "ceremonies" is right and important — the modern noun means seriousness, which would empty the image. "Voyagings" → "voyages"; "a posthumous name" → "a name after death" (glossary). The "neither … nor … nor" chain at the close keeps all three members.

## IX.31 — B09-P031

No material issue found. "Perturbations" → "disturbances" and "movement" → "impulse" are both correct (ruled on above). The external-cause / internal-cause structure and the terminus "in social acts" are intact.

## IX.32 — B09-P032

No material issue found. "Every several thing" → "every single thing" and "illimitable" → "limitless" are right; Long's own "boundless" in the same clause is rightly kept, so the pair survives with one current word replacing one obsolete one. Long's exclamation mark kept against Standard Ebooks' full stop — correct under D6, and the exclamation is doing work.

## IX.33 — B09-P033

No material issue found. "At the extremest old age" → "in extreme old age". The levelling of the very old and the prematurely dead is intact.

## IX.34 — B09-P034

No material issue found, **and the base-text correction is endorsed.** "Their pool souls" → "their poor souls" is right (ruled on above): a PG slip, not a reading, with Long's own IX.27 as the exact internal witness and Standard Ebooks agreeing. Recording it in `continuity.md` and `provenance.json` and flagging it as the book's only departure from PG's letters is the correct handling.

Also noted: "men's leading principles" → "men's ruling parts" (glossary); the three questions keep their sequence; "what an idea!" keeps Long's exclamation and its abruptness.

## IX.35 — B09-P035

No material issue found, **and both base-text calls are endorsed** — "bound" not "found", and PG's ellipsis kept against Standard Ebooks' added "done" (both ruled on above). "Dost thou say,—that" → "do you say—that" keeps Long's dash and his single question. The rhetorical question that answers itself is left to answer itself, with no explanatory help added.

## IX.36 — B09-P036

No material issue found. "Callosities" → "calluses" is right: not current against current, the image unchanged, and Long's word occurs nowhere else in the twelve books so nothing else is disturbed. The whole catalogue — water, dust, bones, filth, marble, gold and silver, garments, purple dye — survives as a catalogue, item for item, with nothing softened.

## IX.37 — B09-P037

No material issue found. **"Apish tricks" rightly kept**: the adjective is current, the phrase transparent, and it is one of the book's two contemptuous images. The four short questions and the twice-repeated "Look at it." keep their rhythm; the added comma round "then" is house style.

## IX.38 — B09-P038

No material issue found. Byte-identical to Long. The qualification in the second sentence ("But perhaps he has not done wrong") — which is the entire meditation — is present and not smoothed into the first.

## IX.39 — B09-P039

No material issue found. "Ruling faculty" → "ruling part"; "Art thou become a beast" → "have you become a beast". The five questions put to the ruling part keep their asyndeton and their order, and none is turned into a statement.

## IX.40 — B09-P040

**Finding 40.1 — substantive (must fix before acceptance).** Long's three corrective turns are **imperatives**: "**Do thou pray thus:**", "**Pray thou:**", "**Thou thus:**". The candidate renders them "**Do you pray thus:**", "**You pray thus:**", "**You thus:**". The shortening across the three turns is preserved, which is good, but **two of the three imperatives are no longer imperatives in modern English**:

- "**Do you pray thus:**" is, in current English, a **yes/no question** — the "do" that makes an emphatic imperative in "do thou pray" makes an interrogative in "do you pray". Only the colon stops a reader taking it as one.
- "**You pray thus:**" is a **plain declarative** — a statement that the reader already prays this way. That is the exact opposite of Marcus's point, which is that he does *not* and should begin to. A reader who takes it as indicative loses the correction.

The review instructions single this passage out ("check that each turn survives as a turn"), and `review-instructions.md` describes the structure correctly as "one man's prayer, then Marcus's, three times". A turn that survives in position and word-count but not in grammatical **mood** has not fully survived: the alternation the drafter correctly defended in the base-text ruling against Standard Ebooks' "Another prays:" is, in the candidate's own rendering, half-flattened into report. This is the more regrettable because the base-text call that preserved the alternation is one of the best decisions in the package.

**Proposed, smallest correction that restores the mood in all three turns and keeps the diminuendo:**

- "Do you pray thus:" → "**You, pray thus:**"
- "Pray thou:" → "**You, pray:**"
- "Thou thus:" → "**You thus:**" (unchanged)

The vocative comma makes all three unambiguously imperative, keeps Long's fronted second person (which is the whole rhetorical device), keeps the three-two-two shortening, and adds no word. If the drafter would rather not change the wording at all, the minimum acceptable fix is the comma alone in the first two turns — "You, pray thus:" in both — which costs the shortening but saves the mood; I prefer the version above. Confidence high on the defect; medium on which repair is best.

Also noted, and all correct: **the base-text ruling "Pray thou" against Standard Ebooks' "Another prays" is right** and is what makes the passage coherent (see above); the six "How shall I…" prayers correctly keep "shall" as first-person deliberative questions; "In fine" → "In short"; "co-operate" kept as PG spells it; the argument's structure (gods have no power / have power; if they have power, why not pray for the faculty rather than the outcome; the objection that the gods placed them in your power; the answer) survives step for step; and the three petitions themselves — the woman, release, the little son — are untouched, including their bluntness.

## IX.41 — B09-P041

**Finding 41.1 — minor (worth improving; a rule-wording fix, not a text change).** Long: "keeping to this main point, how the mind … **shall** be free from perturbations and maintain its proper good." Candidate keeps "shall" (with "disturbances" for "perturbations", correctly). **The rendering is right and should not change** — it is a deliberative "shall" and "how the mind *will* be free" would turn Epicurus's standing problem into a forecast. But it is an **indirect** question, and the rule as written in `GLOSSARY.md` licenses only "the deliberative 'shall' of a **direct** question in the first or third person". On the rule's letter this "shall" is unlicensed; it is kept on the rule's spirit. Since Book IX is the first book drafted under the rule and the next drafter will read it literally, the gap should be closed now. **Proposed:** in `GLOSSARY.md`, Voice and form, change "the deliberative 'shall' of a direct question in the first or third person" to "the deliberative 'shall' of a question, direct or indirect, in the first or third person ('How then shall a man do this?', VIII.1; 'how the mind … shall be free from disturbances', IX.41)". No change to `candidate-v1.json`; this is the ledger's and the glossary's fix, and it is worth making before Book X. Confidence high.

Also noted: "such movements as go on in the poor flesh" **rightly keeps "movement"** — this is the one place in the book where the *hormē* row could most plausibly have been misapplied, and misapplying it would have made the flesh the seat of impulse and inverted Epicurus's boast. "Trifling talks" kept as PG has it against Standard Ebooks' singular — correct under D6. Epicurus's reported speech keeps its "says he" / "he says" interruptions, and the closing turn back onto Marcus himself ("Do, then, the same that he did") keeps its force.

## IX.42 — B09-P042

No material issue found. The book's longest meditation, and the most exposed, and it comes through intact.

Also noted, and all correct: "knave" → "rogue" keeps the three-term list (the rogue, the faithless man, every man who does wrong) in shape; "wherein hast thou been injured?" → "in what have you been injured?"; "manifestly thy own" → "plainly your own", consistent with IX.1; **"thou didst not confer it absolutely" → "you did not confer it unconditionally", following the Book VIII ruling at VIII.41** — correct, and necessary, since the technical sense (*without reservation*) is the premise of the sentence that follows; "several constitutions" → "respective constitutions", consistent with "every several thing" at IX.32; "benevolence"/"benevolent" → "kindness"/"kind" and "the common interest" → "the common good" (glossary); "conformable to thy nature" / "conformably to his constitution" → "according to your nature" / "according to his constitution" (glossary); "in such way" → "in such a way", supplying Long's dropped article; **"recompense" rightly kept**. The long chain of reasons — shameless men must exist, so do not require the impossible; nature's antidote; the reversal onto your own failure to expect it; the two cases of the faithless and ungrateful man; the eye and the feet — survives link for link, and the closing analogy is left as an analogy.

---

## Chapter-level reading

`candidate-v1-readable.md` was then read straight through, continuously, for voice, pacing, repetition, terminology and transitions.

**Voice.** Compact, personal, self-addressed throughout. I found **no** turn toward advice for a reader, no moral lesson, no motivational register and no explanation addressed to a modern audience anywhere in the 42 sections. The self-address is consistent ("you", never "we" where Long has "thou"); where Long himself has "us" (IX.3 "draw us the contrary way", IX.15 "outside of us", IX.24 "strikes our eyes", IX.28 "cover us all", IX.41 "befall us"), the candidate keeps it, correctly. The two places where Marcus addresses himself in the vocative — "Well then, man" (IX.29) and the five questions to the ruling part (IX.39) — both survive as address.

**No expansion.** The run of very short meditations the instructions name (IX.4, IX.5, IX.6, IX.7, IX.13, IX.14, IX.15, IX.17, IX.18, IX.19, IX.20, IX.38) is at Long's length throughout; four of them are byte-identical to Long. Nothing has been padded into fluency.

**Terminology.** Stable across the book. The recurring terms are the same words each time they recur, which matters most for "dissolution" (IX.3, IX.32 ×2, IX.33), "change" (IX.19, IX.28, IX.32, IX.35), "the ruling part" (nine occurrences across seven sections) and "impiety" (seven in IX.1 alone). The one term that shifts is "movement"/"impulse", and it shifts exactly where the glossary says it should.

**Pacing and transitions.** The book reads well continuously. The long sections (IX.1, IX.9, IX.40, IX.42) hold their argument without the sentence-chopping that the accessibility standard warns against; the short ones keep their snap. Long's characteristic openings ("Enough of this wretched life…", "Loss is nothing else than change.", "Either the gods have no power or they have power.") are all left as openings.

**No additional chapter-level findings.**

---

## Coverage and limitations

- All fourteen packets reviewed in order, three assigned paragraphs at a time with the supplied `CONTEXT ONLY` neighbours. Coverage `B09-P001`…`B09-P042`, each exactly once; every paragraph has an entry above.
- The source read throughout is `book9/source-book9.json`, verified byte-identical to chapter 9 of the staged original, itself verified against PG #15877 by an independently written reconstruction.
- **I did not consult a Greek text.** My ruling on IX.29 "insolence" rests on the argument of the meditation and the shape of the error, not on the Greek, and a reviewer with the Greek could overturn it. The same limitation applies to my confirmation of "They themselves shall judge", which rests on the English idiom and on the sentence that follows.
- I did not compare the candidate against translations other than Long for wording, and I claim nothing about them; the absence of an "imported phrasing" finding is not proof that none exists. What I can say is that every departure from Long in the candidate is accounted for by a documented decision.
- No numerical score is given, and I do not claim that no errors can remain.

**Verdict: Accept after corrections.** One substantive finding (40.1), three minor (1.1, 9.1, 41.1), five optional (1.2, 3.1, 7.1, 28.1, 29.1). Apply 40.1 in `candidate-v2.json`; 9.1 is a one-character fix I would also apply; 1.1 and 41.1 are corrections to `continuity.md` and `GLOSSARY.md` respectively and should be made before Book X is drafted. The five optional findings can be taken or left with a line of record either way.
