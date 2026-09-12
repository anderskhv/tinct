# Independent review — Meditations, Book XII, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree `/tmp/claude-0/med-review-12b`, recreated after the coordinator's disk sweep removed the first one; base commit `6dd9624c2`) |
| Candidate | `book12/candidate-v1.json`, sha256 `8665adc87689b8a97c26e6b16277a9c7132aa9d92762c71a702322f04e71863c` — recomputed locally; matches the assignment, `provenance.json` and `README.md` |
| Source | George Long 1862, `book12/source-book12.json` sha256 `1e7a003b8c43d502b4e5e10e3a1603e9512a3a56d5f6e9fb3b71901e4510032f` (matches), byte-identical to chapter 12 of `../meditations-original-en.staged.json` sha256 `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` (matches; 487 paragraphs, 12 chapters, profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, **36**); PG base `source/pg15877-long-1862.txt` sha256 `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` |
| Staged-original no-rebuild claim | **Verified independently, and it holds.** Not by re-running either script: I wrote my own reconstruction of PG lines 6818–7174 by a rule of a *third* kind — no indentation magnitude anywhere — *before* opening `scripts/verify_book12_source.py`. It is committed here as `review/verify_book12_source_review.py`. 36 paragraphs, one differing paragraph, XII.16, differing only by the documented dagger. See `review/README.md`. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-12.md`, in order, three paragraphs at a time with the `CONTEXT ONLY` neighbours (coverage `B12-P001`…`B12-P036`, each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (the "shall" rule as widened at Book IX acceptance; the in-text-Greek exception; the two rows fixed before Book XII was drafted), `WORKFLOW.md`, `PROVENANCE.md` §4, `00-progress-ledger.md` including **D13** and **D14**, `book12/review-instructions.md`, `book12/continuity.md`; `book11/review/findings-v1.md` read first for format and calibration |

**Verdict: Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must fix before acceptance) | **0** |
| minor (worth improving) | **11** (9 paragraph-level, 2 chapter-level/records) |
| optional (preference, no defect) | **6** (5 paragraph-level, 1 chapter-level) |
| paragraphs with no material issue | **23** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Long's words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

**Book XII is sound, and it is the cleanest book in the package on the things that matter most.** A token-level diff of all thirty-six paragraphs shows every difference between Long and the candidate accounted for by a documented decision — a thou-form, a modernised verb form, a glossary row, a bracket fold, a D11 drop, a dropped cross-reference, a listed punctuation change, or a per-paragraph entry in `continuity.md` — **with two exceptions, both punctuation, both at XII.2** (finding 2.1). Nothing is missing, nothing is added, nothing is softened, nothing is expanded, nothing is imported, and the last meditation carries no valedictory colour that Long does not have. There is no substantive finding.

The nine paragraph-level minor findings are: Long's "wilt" in a conditional treated two ways in two paragraphs (1.1 with 3.2); two undocumented punctuation changes at XII.2 (2.1); the "shall"/"will" pair at XII.4 ruled for "will" (4.1); a dead idiom left standing at XII.5 (5.1); one of the five added commas not earned (15.1); a false claim in `continuity.md` about what the XII.23 repairs cost (23.1); a Victorian sense left unmodernised in a byte-identical paragraph (34.1); and two capitalisations at XII.36 that contradict the same book two sections earlier and four accepted books (36.1). The two records findings are a wrong section number repeated in four documents (C1) and a self-contradictory sentence in the ratio note (C2).

---

## Verification performed before reading

### Hashes and mechanical checks

All four hashes recomputed locally; all four match. The mechanical-check block in `book12/README.md` was extracted and run verbatim: it printed `OK` and the three expected hashes. It covers `source-book12.json` byte-identity to chapter 12 of the staged original; 36 candidate paragraphs one-to-one and each numbered `n. `; the 487-paragraph twelve-chapter shape with 36 in Book 12; no `[Illustration`, no footnote opener and no footnote-body string anywhere in the staged file; Long's Empedocles line present inside XII.3 and `Sphairos` absent from the whole staged file; packet coverage exactly `B12-P001`…`B12-P036`; packet and readable-copy text identical to the JSON; the dagger clause with Long's comma; **the bracket arithmetic asserted from an enumerated list rather than from a numeral (4 folds + 7 D11 drops + 1 textual mark = 12)**; no bracket and no cross-reference surviving in the candidate; the "shall" inventory (Long ten, candidate one, at XII.4, first person, and no second/third-person "shall" anywhere); no thou-form or archaic inflection; the two departures from PG's letters and the three PG-over-SE readings; the punctuation tallies; and the five byte-identical paragraphs.

I recounted the twelve brackets from the source myself and reached the drafter's classification exactly — see "Rulings" below. I also recomputed the word ratio (3,131 → 3,082 = 0.9844) and every paragraph ratio, rather than accepting the aggregate; see C2 for the one statement about them that is wrong.

### The no-rebuild claim, checked the strong way — my own rule first, then the drafter's

The assignment is explicit that neither a re-run nor a reconstruction sharing the build's blind spot proves anything, and that Book XI set the standard of a reconstruction derived from a *different kind* of rule. Two rules of different kinds had already been used on this range (the build's opener state machine; the drafter's per-block indentation profile), so I wrote a third that uses **no indentation magnitude at all**.

**My rule.** Locate the range myself (a flush-left line that is a bare Roman numeral and a period; `XII.` at 6817, `INDEXES.` at 7175 — found, not taken from the documentation). Every flush-left line is body; a flush-left line opening `N. ` starts a section, any other continues the one before. For each maximal run of indented lines, decide by **sentence continuity in the body text already accumulated**: if that text breaks off mid-sentence (ends in `,` `;` or `:`) the run is Long's verse and is joined into the paragraph; otherwise it is apparatus and is dropped. Then strip `[A-D]` markers, apply the em dash, underscore, `[Greek: …]` and D14 space-before-punctuation normalisations, and **leave Long's `+` daggers in** so that a documented dagger surfaces as a diff instead of being assumed away.

**Result: 36 paragraphs, matching the staged count, and exactly one differing paragraph — XII.16 — differing only by the single `+` at PG 6963.** That is the third rule set of the third kind to reproduce the staged Book XII to the byte. The script is committed as `review/verify_book12_source_review.py` and prints its audit before its diff.

**My first run failed, and the failure is worth recording**, because it is a *different* failure from the nine-space one and it is what makes the check independent rather than confirmatory. My first continuation test was "the preceding body does not end in terminal punctuation". XII.17's body ends `[For let thy efforts be--][B]` — no terminal punctuation, because Long's Greek breaks off — so the rule joined the footnote run at PG 6969–6974 and leaked `The interpreters translate (Greek: gorgos) by the words "acer, validusque," and "skilful." … There is something wrong here, or incomplete.` into XII.17. Tightening the test to "ends in `,` `;` or `:`" — a positive test for a sentence in flight rather than a negative test for one finished — fixed it, and the staged file was right and my rule was wrong. See `review/README.md` for what that means for the method.

**The rules were then audited class by class against the raw range**, independently of both scripts, and my counts agree with the drafter's on every class: **eleven indented footnote openers** at PG 6883, 6888, 6969, 6974, 7017, 7052, 7069, 7079, 7123, 7168, 7170, **all at four spaces**; **zero flush-left openers**, so the VII.45 class does not recur, and a flush-left footnote *body* would have been read as ordinary text by my rule and shown as inserted words — none did; **eleven in-text markers, ten in flush-left text plus one at the end of the indented verse line 6866**, reconciling exactly with eleven openers; **no illustration caption**; **four `[Greek: …]` spans, none flush left** (6886, 6969, 6971, 7069), and the staged Book XII contains no `(Greek:` at all; **one dagger, at 6963**; **one verse run**, Long's Empedocles line at 6866 at three spaces, joined into XII.3, which is where the staged file has it; and **the D14 space-before-punctuation rule fires at no line in the range**, reproduced regardless so that the two texts are compared on the same rules.

**PG 6886 confirmed, and the leak lands in XII.4.** PG 6886 is the second half of footnote [A]'s body and is indented **nine** spaces, inside a maximal indented run whose profile is {4, 9}. I implemented the Book XI reviewer's alternative rule directly — split into blank-line-separated blocks, drop the blocks whose lines are indented four, join any other indented block into the paragraph before it — and ran it on this range. It keeps PG 6886 and joins `[Greek: Sphairos kykloteres monie perigethei gaion.]` **into XII.4**, not XII.3: the block stands between the end of XII.4 (PG 6881, "of ourselves.") and the start of XII.5 (PG 6890), and "the paragraph before it" is XII.4. The drafter's methodological point is exactly right and is the most valuable single line in the Book XII package; the section number attached to it is wrong in four documents. See **C1**.

`git status` clean in the worktree apart from this review directory. **The claim holds. No rebuild is needed and no accepted book is reopened.**

---

## Rulings on the five flagged decisions, the point offered for confirmation, and the two points put with reasons

### Ruling 1 — the two departures from PG's letters: **both confirmed**

**XII.27 "Briae" → "Baiae": confirmed.** The test the package has used for a departure from its base text is that the printed word *names nothing* and a one-letter slip explains it. "Briae" satisfies it: it is not a Roman place, and it sits fourth in a list of five men located at five retreats — the country, his gardens, *Briae*, Capreae, and (on Long's primary reading) nowhere. Baiae is the seaside resort of exactly that list's kind and stands beside Capreae in it naturally. Standard Ebooks has Baiae. `Br`/`Ba` is an ordinary slip. The correction restores a word that does work in the sentence in place of one that does none, which is the whole of the threshold.

**XII.29 "that is its material" → "what is its matter": confirmed, and on the stronger evidence of the two.** The sentence is a three-member series of indirect questions — "to examine everything all through, what it is itself, *X* is its material, what the formal part". The third member has already elided its verb, which only works if the second member is parallel to the first and the third. With "that", the second member stops being a question and becomes an assertion that a thing's matter *is what the thing is itself* — which is the one identity the meditation exists to deny, since the whole point of the division is that a thing is not its matter. With "what", the series is three parallel questions, the elided verb in the third is licensed by the second, and the meditation says what it sets out to say. `th`/`wh` is an ordinary slip. SE has "what". The reading is required by Long's own sentence, not imported from SE.

**Both, not one.** They are independent, each is decided on its own evidence, and neither leans on the other or on SE's authority; SE only corroborates. Two departures in one book is not itself a reason for suspicion — the count of departures is a symptom, not a standard, and the standard each must meet is unchanged. Book XII is also where the base text is under the most stress (a list of proper names and a compressed elliptical series in the same book).

### Ruling 2 — XII.3's "[to the god that is within thee]" dropped under D11: **confirmed, route and outcome**

The glossary's *daimōn* row renders Long's "the daemon (within)" as "**the god within**" and forbids "spirit", "genius" and "inner self". Applying the row to "thy own daemon" gives "obedient to the god within you". Long's bracket is then a second English rendering of what has just been rendered, and D11 drops it. That is the ordinary operation of two rules that were both fixed long before Book XII.

The drafter's discomfort — that the result is textually indistinguishable from folding the bracket and deleting Long's word — is real but immaterial. Both routes give the reader the same eight words, and those words are Long's own. The route matters only for the record, and `continuity.md` records it. The circularity worry (the row cites XII.3 as its authority, and the row is then applied to XII.3) is also answerable: the row cites XII.3 as *evidence of Long's own understanding of the word*, which is what makes "the god within" his rendering rather than an editorial choice; applying it here is the row doing its job in the one place Long shows his hand.

**The VII.17 alternative is declined.** VII.17 and VII.13 keep Long's Greek because the meditations there *are* arguments about the Greek words — a pun and an etymology that do not exist without them. XII.3 contains no such argument; "daemon" is simply the term, and the eleven accepted books have rendered it "the god within" throughout. Keeping "daemon" untranslated in the last book would put a Greek word the glossary has expressly decided against in front of the reader, once, at the end. Confirm the D11 route.

### Ruling 3 — XII.17's "[For let thy efforts be—]" as a mark of textual doubt: **confirmed, and the ledger wording does support the extension**

The XI.26 class is defined in D13 by *what the bracket is about*: "a bracket that marks **textual doubt about the Greek** rather than Long's handling of it … is treated as Long's daggers are, the mark goes and the word stands." XII.17 is that, on its face. Long's footnote is "There is something wrong here, or incomplete." — a statement that the *text* is defective, not that *he* omitted, supplied or transposed anything. It is not a D11 alternative rendering (there is no first rendering for it to be an alternative to) and not a D13 translator's note (it is not in Long's voice and not about his choices). So it falls in the third class by the test the ledger states.

**Does the ledger support extending that class from a word to a whole clause?** Yes, and directly. D13's Book XI amendment rules in terms: "**D13 does NOT acquire a size threshold** … the test is **voice and subject, not length**. A drafter meeting a long supplement must not invent a word limit." That reasoning was written for the folding/dropping boundary, but it is stated as a general proposition about how brackets in this package are classified, and a class that changed at some unstated number of words would be exactly the defect it forbids. The clause is Marcus's broken sentence, not Long's commentary, whatever its length.

**The two alternatives are rightly declined.** Dropping the clause as apparatus would silently mend a defect the reader is entitled to meet — against V.29, VII.58 and XI.18, where the package keeps Long's lacuna ellipses — and would leave XII.17 as two short lines with no sign that anything is missing. Keeping the brackets would be the only surviving bracket in twelve books. Reproducing Long's words and his dash, and stopping where he stops, is right.

**One record item, at acceptance:** D13's sentence describing the class names only XI.26's bracketed proper name. It should be widened to say "a word **or a clause**", with XII.17 named, so that the class is not read as word-sized by whoever next meets it. See **C3**.

### Ruling 4 — XII.4's "shall" beside "will" in one comparison: **ruled for "will" in both**

See finding **4.1**. Severity minor; the drafter's reading of the rule is correct and the current text is not wrong, but the rule's own licence for first-person "shall" is that it is "current English **in its own right**", and in a two-member comparison whose other member has just taken "will", it is not neutral.

### Ruling 5 — XII.27's "[or Rufus at Velia]" dropped under D11: **confirmed; D11 reaches an alternative construal**

D11's reason, as the row states it, is that a bracketed second rendering is "Long talking to the reader about his choices, like a cross-reference, not part of Marcus's sentence". An alternative *construal* of the same letters is the same act in a purer form — Long's own "or" is inside the bracket, addressed to the reader, and nothing in it is Marcus's sentence. Folding it would have Marcus name a fifth man in a list of four, which is the precise failure D11 exists to prevent.

**It is not the XI.26 textual-doubt class**, and the distinction is clean: in the XI.26/XII.17 class the bracketed words can *stand as text* once the mark is removed, because they are the text and only its soundness is in doubt. Here they cannot — "Velius Rufus or Rufus at Velia" is not a sentence Marcus wrote in either reading; it is a choice between two readings, and printing both would be printing Long's apparatus. Long's primary reading stands, as D11 directs.

Also noted, not a finding: the drop leaves "Velius Rufus" as the only man in the list without a place, where the rejected construal would have given him one. That is a consequence of Long's primary reading, not of the rule, and the package does not choose readings to tidy a list.

### Offered for confirmation — "pancratiast" at XII.9: **confirmed**

It is Long's text, not apparatus; the sentence glosses it by its own contrast (the gladiator drops the sword he uses, the pancratiast always has his hand); X.9's "Mimi" and XI.2's "pancratium" are the precedents, and XI.2 has already put the word family before the reader in an accepted book. No gloss should be added.

### Put with reasons — XII.23's two resumptive repairs: **allowed**

Long is reproducing Greek word order with a resumptive pronoun ("nor he who has done this act, **does he** suffer any evil") that modern English does not have; left alone it reads as a grammatical error rather than as a period style. The repairs move no sense, invert no emphasis, and add nothing. They are the same class as the XI.18 sentence-shape changes. Allowed. But `continuity.md`'s justification for them is factually wrong and must be corrected — see **23.1**.

### Put with reasons — the five added commas: **four earned, one not**

XII.1 (after "In accordance with piety") — earned; it makes two identical constructions in one passage agree, which is the XI.21 ruling, and SE punctuates both. XII.16 (before the folded "say") — earned; the fold is unreadable without it. XII.30 (before the elliptical second subject) — earned; it is the mark the ellipsis needs and without it "holds together and the gravitation" reads as a compound object. XII.36 (the apposition fold) — earned; an apposition requires it. **XII.15's second comma is not earned** — see **15.1**. And there are in fact **six** added commas, not five: see **2.1**.

### D13 fires nowhere in Book XII: **agreed, tested bracket by bracket**

I classified all twelve brackets from the source independently, without reference to the drafter's list, and reached the same classification: **four supplements folded** (XII.15 "[before thy death]", XII.16 "[say]", XII.36 "[the world]", XII.36 "[or three]"); **seven alternative renderings or construals dropped under D11** (XII.2 "[ruling principles]", XII.3 "[life]" ×2, XII.3 "[to the god that is within thee]", XII.8 "[forms]", XII.27 "[or Rufus at Velia]", XII.30 "[or individuals]"); **one mark of textual doubt** (XII.17). 4 + 7 + 1 = 12, and the source contains exactly twelve `[`.

**Not one of the twelve is a translator's note of the X.23 kind.** The D13 test is whether the bracket speaks *about the translation* — what Long omitted, supplied, transposed, conjectured or could not render. Taking them in turn: "[ruling principles]", "[life]" ×2, "[to the god that is within thee]", "[forms]" and "[or individuals]" are all second English words for a Greek word Long has already put into English — about the *Greek*, not about his translation of it. "[before thy death]", "[say]", "[the world]" and "[or three]" are words supplied to complete Marcus's sense; a supplement is not a note about a supplement. "[or Rufus at Velia]" is a second reading of the manuscript letters, again about the Greek. "[For let thy efforts be—]" marks the Greek as broken. So D13 has now been available for two books and has fired in neither, which is the expected shape for a rule written for a rare case rather than a common one — X.23 remains its only instance in the work. The rule is not therefore idle: it is what stopped a Books XI–XII drafter from folding such a bracket, and that is the outcome it was written for.

### The two cross-book inconsistencies: **agreed, stay closed**

IX.1's "such like" and V.1's "several" are formal divergences in closed acceptances, semantically null, and both are already recorded in `00-progress-ledger.md`. Reopening two accepted books for two adverbial formalities would cost more than it buys. They belong on the v3 list with II.5 and XI.12, and they are the first two items a cross-book terminology sweep should settle — see `review/README.md`.

---

## Paragraph findings

One entry per paragraph, in order, XII.1 to XII.36.

### XII.1 — finding 1.1 (minor)

**Long's "wilt" in a conditional is dropped here and kept at XII.3, and the treatment is not recorded.** Long: "if thou **wilt** take no notice of all the past". Candidate: "if you take no notice of all the past". At XII.3 the same modal in the same position is kept: Long "if thou **wilt** separate, I say" → candidate "if you **will** separate, I say", and "and **wilt** make thyself" → "and **will** make yourself".

The "shall" rule in `GLOSSARY.md` governs "shall / shalt" only and says nothing about "wilt", so neither treatment breaks a rule; but one paragraph drops a word of Long's and another keeps it, in the same construction, two sections apart, and `continuity.md`'s XII.1 entry does not mention the drop at all.

**Proposal:** align on the present, which is what English uses in an if-clause, and record the treatment beside the "shall" inventory: XII.3 becomes "if you separate, I say, from this ruling part …" and "and make yourself like Empedocles' sphere". **Reason:** "if you will separate" reads as volitional ("if you are willing to"), which imports a shade Long's plain future does not carry, and "and will make yourself" inside a protasis is marked English. The alternative — keep "will" in all three and convert nothing — is defensible and equally consistent; what should not stand is the two paragraphs disagreeing.

*Also noted, not a finding:* "but **because** you fear never to have begun to live" for Long's "but **if** thou shalt fear" completes the "not because … but …" correlative Long opens and abandons, loses no word and no sense, and is documented. Correct.

### XII.2 — finding 2.1 (minor)

**Two punctuation changes here are undocumented, in a sheet that says its punctuation tally is "in full".** (a) Long's comma after the long subject — "For he who regards not the poor flesh which envelops him**,** surely will not trouble himself" — is removed; `continuity.md` lists exactly one such removal, at XII.16. (b) A comma is added before the last member of Long's polysyndetic list — "and externals of that kind**,** and show"; `continuity.md` lists five added commas, at XII.1, XII.15 ×2, XII.30 and XII.36, and not this one. The net comma count for the paragraph is unchanged, which is why the mechanical check in `README.md` (which asserts *net* additions per paragraph) does not see either.

Both changes are themselves right. The removal is the X.6 / X.20 / X.33 / XI.10 / XI.21 class. The addition is earned: with "such like" moved behind the noun as "of that kind", "externals of that kind and show" can be read as "externals and show, both of that kind", and the comma prevents it.

**Proposal:** no change to the text. Record both in `continuity.md` at v2 — the removal with the other subject–verb removal, the addition with the other added commas, making the tally **one comma removed between a long subject and its verb at XII.2 and one at XII.16**, and **six commas added, not five**. **Reason:** the sheet's value is that the tally is exhaustive; a reader collating the book against Long will find these two and will not know whether they were decided or slipped in. Also: the `README.md` check should compare comma *positions*, not net counts, or a future paragraph that swaps one comma for another will pass unseen in the same way.

### XII.3 — finding 3.1 (optional), finding 3.2 (minor)

**3.1 (optional).** "whatever the external circumfluent vortex whirls round" → "whatever **the vortex that flows round you from outside** whirls about". The rendering of "circumfluent" as "that flows round" and of "external" as "from outside" is right — "circumfluent" is not current English and the sense is exactly flowing around. But the object **"you"** is supplied: Long says what the vortex is, not what it circles. **Proposal:** "whatever the vortex that flows round from outside whirls about". **Reason:** the surrounding clauses are explicit about their object ("in the body which envelops you", "attached to you"), so Long's silence here is audible; no sense is lost by keeping it. Optional because the implied object is not seriously in doubt and the addition misleads nobody.

**3.2 (minor).** The "wilt" pair — see **1.1**, with which this finding is one decision.

*Also noted, not findings:* the D11 drop of "[to the god that is within thee]" is confirmed under Ruling 2; "The things of which you are composed are three" for Long's fronted "The things are three of which thou art composed" is his own words in the order English needs; "free from disturbance" is the glossary row; the Empedocles line is kept in Long's words and his quotation marks, with the footnote not imported; and the comma before the em dash is removed as in nine accepted books. Ratio 0.95, and the whole of the shortfall is the nine-word cross-reference and four bracket-words in a 259-word meditation — verified, not accepted.

### XII.4 — finding 4.1 (minor)

**Rule for "will" in both halves of the comparison.** Candidate: "So much more respect do we have for what our neighbors **will** think of us than for what we **shall** think of ourselves."

The drafter's reading of the rule is correct: the rule keeps first-person "shall" and converts third-person plain futures, and applying it mechanically produces exactly this. But the rule's licence for first-person "shall" is stated as a condition, not a blanket: it is kept "only where it is **current English in its own right**". In every earlier instance the package keeps (II.1, VIII.45, X.6 ×5, XI.18 ×2) the "shall" stands alone, where a reader reads it as a plain future and moves on. Here two futures are set against each other four words apart in one balanced comparison, and English readers who no longer have the prescriptive distribution will hear the switch as marking a difference between the two clauses — when the whole force of the sentence is that they are the *same* act of anticipation, differently valued.

**Proposal:** "So much more respect do we have for what our neighbors will think of us than for what we **will** think of ourselves." **Reason:** it removes an unmotivated contrast from a sentence built on a symmetry, changes no sense, and does not disturb the rule's other instances, which are all unpaired. Minor, not substantive: the current text is not wrong, and a reviewer who ruled the other way would not be making an error.

*Also noted:* "bid him think … and design nothing" (bare infinitive after "bid") is right.

### XII.5 — finding 5.1 (minor)

**A dead idiom left standing.** Long: "for thou **seest even of thyself** that in this inquiry thou art disputing with the Deity". Candidate: "for you **see even of yourself** that in this inquiry you are disputing with the divine."

"Of thyself / of yourself" in the sense *unprompted, without being told* is no longer current; a modern reader meets "see even of yourself" and gets nothing, or reads "of yourself" as the object of "see". The thou-form has been converted but the idiom has not, which is the same defect the package fixed at XI.1 ("regards not") and fixes here at XII.2.

**Proposal:** "for you see **for yourself** that in this inquiry you are disputing with the divine". **Reason:** "see for yourself" is the living English for exactly Long's sense, it is one word changed, and it imposes no reading. (If "for yourself" is felt to drift toward *with your own eyes*, "you see even **without being told**" says it plainly, but "for yourself" is closer to Long and is preferred.)

*Also noted:* "benevolently" → "kindly" is the row extended before drafting, and this is its only occurrence in the work; the three bare abstracts ("the divinity" ×2, "the Deity") all correctly take "the divine"; "be thou convinced" → "be convinced" is right.

### XII.6 — No material issue found.

*Also noted:* "Practice yourself even in the things which you despair of accomplishing" keeps Long's construction "practise oneself in", which is formal but current and intelligible, and the American spelling follows the package rule and PG's own usage at XI.26. Not a defect.

### XII.7 — No material issue found.

Byte-identical to Long, and rightly: no thou-form, no archaic inflection, no glossary term, no bracket, no cross-reference. "The boundless abyss of time past and future" and "the feebleness of all matter" are plain current English and are Long's.

### XII.8 — No material issue found.

The "[forms]" drop is a second English rendering of "the formative principles" and falls squarely under D11; "formative principles" is current and is Long's primary word, and the clause supplies its own sense ("of things bare of their coverings").

### XII.9 — No material issue found.

"Pancratiast" confirmed above.

### XII.10 — No material issue found.

Byte-identical and rightly: fourteen words, all current. Note that Long here has bare "matter, form, and purpose" where XII.18 has "the formal, the material, the purpose" — the candidate leaves XII.10 untouched and renders XII.18 by the glossary row, which is correct in both places.

### XII.11 — No material issue found.

Byte-identical and rightly.

### XII.12 — No material issue found.

The cross-reference is dropped with a full stop supplied. Ratio 0.81 is the lowest in the book and the entire difference is that nine-word span — verified by removing it from the source and recomputing, not accepted from the sheet. PG's stray "18" inside the span never reaches the candidate, as claimed.

### XII.13 — No material issue found.

Byte-identical and rightly.

### XII.14 — finding 14.1 (optional)

**An article supplied and not recorded.** Long: "there is a fatal necessity **and invincible order**". Candidate: "there is a necessity of fate **and an invincible order**". The indefinite article is added; `continuity.md` records "fatal" → "of fate" and the keeping of "invincible", but not the article.

The addition is right and close to forced: once "a fatal necessity" becomes "a necessity of fate", "a necessity of fate and invincible order" would read as one compound thing, which destroys the three-way choice the whole meditation turns on (necessity, or providence, or confusion). **Proposal:** no change to the text; add the article to the XII.14 entry at v2. **Reason:** the package's standard is that every word not Long's is recorded somewhere; this one is invisible in the word count because the dropped cross-reference offsets it.

*Also noted:* "the tempest carries you away" for Long's subjunctive "carry" is the XI.16 class; "propitiated" is formal but current and is Long's; PG's "without **a** governor" rightly followed against SE.

### XII.15 — finding 15.1 (minor)

**The second added comma separates a subject from its verb, which this book removes elsewhere.** Candidate: "and will the truth which is in you**,** and justice and temperance**,** be extinguished before your death?"

The first comma does real work: without it, "the truth which is in you and justice and temperance" can be read as one relative clause with three objects of "in". The second does not. It closes a parenthesis, and its effect is to make "and justice and temperance" read as an aside about the truth rather than as two further subjects of "be extinguished" — the opposite of what is wanted. It also sits between a compound subject and its verb, which is exactly the comma the candidate removes at XII.2 and XII.16 on the X.6 / X.20 / X.33 / XI.10 / XI.21 practice. XI.21's ruling — decide two identical constructions in one passage alike — is being applied against itself here.

**Proposal:** "and will the truth which is in you, and justice and temperance be extinguished before your death?" **Reason:** keeps the disambiguation the first comma buys and drops the one that misleads, and brings the paragraph into line with the same book's other two subject–verb decisions. (Dropping both and leaving Long's unpunctuated text is also defensible — Book IX's finding 7.1 was declined on the ground that Long's uneven punctuation is not normalised for evenness — but the first comma resolves a genuine ambiguity, not an unevenness, and should stay.)

*Also noted:* "[before thy death]" folded is right — without it the question loses the comparison with the lamp, which burns to the end. "Shall … be extinguished?" → "will" is right: it is a rhetorical future, not deliberative, and the widened IX.41 clause reaches deliberative questions only. The line between XII.15 and IX.41 is drawn consistently.

### XII.16 — No material issue found.

The dagger clause stands verbatim with Long's comma — "If then you are irritable, cure this man's disposition." — with only the pronoun changed, as VI.50 / VII.16 / VIII.51 / X.25 / XI.15 require. Nothing inside it is smoothed; it is as abrupt in the candidate as in Long. The "[say]" fold with its comma is necessary and documented; the subject–verb comma removal is the settled class; the bare infinitives after causative "have" ("have the fig tree bear … infants cry … the horse neigh") are current English for Long's "to bear / to cry / to neigh"; "fig-tree" → "fig tree" is the X.36.2 hyphen convention and not a reading.

### XII.17 — No material issue found.

Confirmed under Ruling 3. Long's words, his dash, and his stopping point are reproduced exactly; the brackets go as a mark of textual doubt; the footnote is not imported.

### XII.18 — finding 18.1 (optional)

**Possessives supplied for Long's articles.** Long: "dividing it into **the** formal, **the** material, **the** purpose, and the time within which it must end." Candidate: "dividing it into **its** form, **its** matter, **its** purpose, and the time…".

The glossary row licenses "form" and "matter" for Long's nominalised adjectives, and names XII.18. It does not license the change of article. **Proposal:** "dividing it into the form, the matter, the purpose, and the time within which it must end." **Reason:** it is one fewer departure for the same clarity, it keeps Long's determiners, and it matches XII.29, where "its" is Long's own word and is therefore his. Optional: "its" is natural, the referent is unmistakable, and nothing of sense turns on it.

### XII.19 — No material issue found.

"Affects" → "feelings" is the glossary row, which names XII.19; the comma before the em dash goes as in nine accepted books; the dropped "(v. 11)" carried the sentence's question mark and it is supplied. Ratio 0.96 and the whole of it is that span.

### XII.20 — No material issue found.

"Inconsiderately" → "without consideration" is right and is the book's only expansion: the modern word means *without regard for other people*, and Long means without deliberation. The maximum paragraph ratio of 1.05 is entirely this.

### XII.21 — No material issue found.

### XII.22 — No material issue found.

"Doubled the promontory" kept: the nautical sense is current, it is Long's, and the next four words explain it ("you will find calm, everything stable, and a waveless bay"). The X.9 "gravity" reasoning applies.

### XII.23 — finding 23.1 (minor)

**The repairs are allowed; the reason given for them is false and must be corrected.** `continuity.md` says of both resumptive repairs that "**no word is added or dropped**". A word is dropped in each, and it is the same word. Long: "nor he who has done this act, **does he** suffer any evil"; candidate: "nor **does** he who has done this act suffer any evil" — the resumptive "he" is gone. Long: "nor he who has terminated this series at the proper time, **has he** been ill dealt with"; candidate: "nor **has** he who has terminated this series at the proper time been ill dealt with" — likewise.

That is exactly right as a repair: the resumptive pronoun is the construction, and removing the construction removes it. But the sheet's claim is the ground on which the repairs are put to the reviewer, and it is checkable and wrong.

**Proposal:** no change to the text. At v2, restate the XII.23 entry as: *Long's resumptive pronoun is removed with the construction it belongs to — two words in all, "he" in each clause — and no other word is added, dropped or reordered beyond the fronting the repair requires.* **Reason:** a later reader diffing the paragraph will find two missing words and a claim that none are missing.

*Also noted:* "the universal" ×2 → "the whole" and "the general interest" → "the common good" are the glossary rows; "in the same manner **as** the divine" for Long's "with the Deity" is current English for his sense; "if it ceases" for the subjunctive "cease" is the XI.16 class; PG's singular "the same thing" rightly followed under D6.

### XII.24 — No material issue found.

The three "shouldst" and one "wouldst" become "should" and "would" with no other change; "inconsiderately" → "without consideration" follows XII.20 in the same book; PG's "dwell **all** around" rightly followed against SE.

### XII.25 — No material issue found.

Fifteen words, Long's colon kept.

### XII.26 — finding 26.1 (optional)

**A predicate changed in kind.** Long: "every man's intelligence **is** a god and **is an efflux of** the Deity". Candidate: "every man's intelligence **is** a god and **flows out from** the divine."

Retiring "efflux" is right — it now reads as a discharge of fluid or gas, and the accepted Book II already renders the same noun as a flowing at II.4. But Long's sentence is two predicate nominals in parallel ("is a god", "is an efflux of"), and the candidate makes the second a finite verb phrase, so the parallel goes. **Proposal:** "every man's intelligence is a god and **an outflow from** the divine". **Reason:** "outflow" is plain current English, it keeps Long's noun and his parallel, and it is one word for one word. Optional: nothing of sense is lost as it stands, and the drafter's II.4 precedent is real.

### XII.27 — finding 27.1 (optional)

**"Catellinus" rightly stands, but the reason recorded overstates the case.** `continuity.md` says of PG "Catellinus" against SE "Catullinus" that "both are possible Roman cognomina and **nothing in the sentence decides** between them". Nothing in the *sentence* does; but Catullinus is the form the standard editions of the Meditations carry and is an attested cognomen of the gens Fabia, and Catellinus is not attested, which is an argument of the same species as — though much weaker than — the one that carries "Baiae" three words later.

**Proposal:** no change to the text. PG rightly stands: the package's threshold for departing from its base text is that the printed word *names nothing* (Briae) or *makes the sentence say the opposite of its argument* (XII.29), and "Catellinus" meets neither — it is a possible Latin formation and the sentence works with it. Reword the entry at v2 to say so: *the name is less well attested than SE's form, but it is a possible cognomen and the departure threshold is not met; PG stands under D6.* **Reason:** "nothing decides" invites a later editor to reopen it as an oversight; "the threshold is not met" closes it.

*Also noted:* "Baiae" confirmed and "[or Rufus at Velia]" confirmed above; "in fine" → "in short" is the X.26 rendering; "Smoke and ash and a tale, or not even a tale" is kept in Long's words, and it is one of the passages where an imported phrasing would have been easiest to spot — there is none.

### XII.28 — No material issue found.

### XII.29 — No material issue found.

"What is its matter, what its form" confirmed under Ruling 1. The asymmetric ellipsis (the second member keeps "is", the third drops it) is Long's own and is kept.

### XII.30 — No material issue found.

"[Or individuals]" dropped under D11 is the XI.37 "[or rules]" shape exactly. "Several" → "separate" follows XI.2 (and see the cross-book note). The added comma before Long's elliptical second subject — "the intelligent principle holds together, and the gravitation towards the same" — is earned: without it "holds together and the gravitation" reads as a compound object rather than a second subject.

### XII.31 — No material issue found.

"Movement" correctly left alone: this is physical motion, which the *hormē* row excludes. Long's dash after "wish" kept.

### XII.32 — No material issue found.

Long's two exclamation marks kept where he has them.

### XII.33 — No material issue found.

And note for XII.36: this paragraph keeps Long's lowercase after his question mark — "How does the ruling part make use of itself? **for** all lies in this." See **36.1**.

### XII.34 — finding 34.1 (minor)

**Byte-identical, and one word should not have been.** "This reflection is **most adapted to move** us to contempt of death, that even those who think pleasure to be a good and pain an evil still have despised it."

"Adapted to" in the sense *suited to* is the one dead usage among the five byte-identical paragraphs. The live modern sense of "adapted" is *altered to fit*, and a reader who takes it that way gets "this reflection has been most altered in order to move us", which is not merely obscure but wrong. This is the same class as "vesture", "raiment" and "efflux", all retired elsewhere in the book; it survived because the paragraph carried no thou-form to force a second look at it.

**Proposal:** "This reflection is **best suited to move** us to contempt of death, that even those who think pleasure to be a good and pain an evil still have despised it." **Reason:** "best suited to" is exactly Long's sense in current English, it is two words for two, it leaves the rest of the sentence untouched, and it reduces the byte-identical count from five to four — which is the right outcome, since a byte-identical paragraph is a result, not a target.

*Also noted:* the other four byte-identical paragraphs (XII.7, XII.10, XII.11, XII.13) were each checked word by word for the same defect and none has one. "Contempt of death" is current; "what a stranger he is" (XII.13) is Long's and clear.

### XII.35 — No material issue found.

"Conformable to right reason" → "in accordance with right reason" follows the XII.1 rule for Long's non-nature "conformably". Long's unfinished-looking close, "for this man neither is death a terrible thing", is his own inversion and is rightly kept — it is the kind of thing a smoothing hand would have repaired. Ratio 0.90, and the whole of the shortfall is the seven-word cross-reference.

### XII.36 — finding 36.1 (minor)

**The two capitalisations after Long's question marks are unprecedented in the package and contradict the same book two sections earlier.** Long prints "? for that which is conformable to the laws" and "? the same as if a praetor"; the candidate prints "? **For** that which is in accordance with the laws" and "? **The** same as if a praetor". `continuity.md` records this as "the only change" in those two places.

But lowercase after a question mark is Long's settled habit, the package has kept it everywhere else, and it is kept **twice in Book XII itself**: XII.15 "? **and** will the truth which is in you…" and XII.33 "? **for** all lies in this." In the accepted books it stands at VIII.17 ("? for nothing should be done without a purpose"), VIII.36 ("? for you will be ashamed to confess"), IX.40 ("? for certainly if they can co-operate"), X.1 ×2, X.24 ×5 and X.30 — including three instances in the accepted books of the very construction capitalised here, a question mark followed by "for". So the same construction is now punctuated two ways inside one paragraph-set, and one way in every other book.

**Proposal:** restore Long's lowercase in both places: "…whether for five years or three? **for** that which is in accordance with the laws is just for all." and "…but nature, who brought you into it? **the** same as if a praetor who has employed an actor dismisses him from the stage." **Reason:** consistency with XII.33 eight sections earlier, with XII.15, and with four accepted books; and the Book IX finding 7.1 ruling that Long's uneven punctuation is not normalised for evenness alone. If the other view is taken — that a question mark ending a sentence should be followed by a capital — then it must be taken for XII.15 and XII.33 too, and for the accepted books at a whole-work pass; it cannot be taken for two sentences in the last paragraph of the last book.

*Also noted, and this is the most important thing in the book:* the closing meditation carries **no valedictory colour Long does not have**. "Depart then satisfied, for he also who releases you is satisfied" is his sentence, his word "satisfied" twice, and nothing has been added to make it sound like an ending. "[The world]" folded as an apposition with its comma and "[or three]" folded are both necessary — the second is what the following sentence depends on ("I have not finished the five acts, but only three of them"). "What **will** be a complete drama" is right and the rejection of "is to be" is right: "is to be" would import an appointment Long's plain future does not carry. The actor-and-praetor image, the most quoted passage in the book, is kept in Long's words throughout.

---

## Chapter-level findings

### C1 (minor) — the nine-space leak lands in XII.4, not XII.3, and the wrong number is in four documents

The methodological finding is correct, important, and the best thing in the Book XII package: PG 6886 is the second half of footnote [A]'s body, indented **nine** spaces, and a rule keyed on the *number* four rather than on the *shape* of the rule would have kept it. I confirmed the indentation directly (the maximal indented run at 6883–6888 has the profile {4, 9}) and then implemented the Book XI reviewer's alternative rule and ran it on the range, rather than reasoning about what it would do.

**It leaks `[Greek: Sphairos kykloteres monie perigethei gaion.]` into XII.4.** The block at 6886 stands between the end of XII.4 (PG 6881, "of ourselves.") and the start of XII.5 (PG 6890); a rule that joins a non-dropped indented block into "the paragraph before it" joins it to XII.4. XII.3 ends at PG 6872 and is separated from 6886 by the whole of XII.4.

The claim "into the body of XII.3" appears in **four** places: `PROVENANCE.md` §4, `book12/README.md`, `book12/continuity.md` and `book12/review-instructions.md`.

**Proposal:** correct the section number to **XII.4** in all four at v2, and leave every other word of the finding as it stands. **Reason:** the finding's whole force is that a verification claim must be checkable; a checkable claim with the wrong number in it is the kind of thing that makes the next agent distrust the right part. Minor, not substantive: no text is affected and the conclusion — *a number taken from one book does not transfer, only the shape of the rule does* — is untouched and should be preserved verbatim.

### C2 (minor) — the ratio note contradicts itself

`continuity.md` reads: "Of the paragraphs that carry no apparatus at all, **none is below 0.96** — the lowest are **XII.19** (0.96, which is its cross-reference) and **XII.21** (0.96, likewise)." XII.19 and XII.21 both carry a cross-reference, as the same sentence says; they cannot be the lowest of the paragraphs carrying no apparatus.

I recomputed every paragraph ratio. Of the twenty-two paragraphs that carry no bracket and no cross-reference, the lowest are **XII.29 at 0.983**, XII.4 at 0.990, XII.23 at 0.991 and XII.1 at 0.992. The general claim ("none below 0.96") is true and in fact much stronger than stated.

**Proposal:** at v2, "Of the paragraphs that carry no apparatus at all, none is below **0.98**; the lowest is XII.29 at 0.983, whose entire difference is the base-text correction and the glossary row. XII.19 (0.96) and XII.21 (0.96) are the lowest paragraphs whose only apparatus is a cross-reference." **Reason:** the sentence is the evidence for the claim that the 0.984 shortfall is apparatus and nothing else, and as written it undercuts a claim that is true. I verified the claim independently, paragraph by paragraph, and it holds: every paragraph below 0.98 carries apparatus, and removing the apparatus from the source accounts for the difference in each.

### C3 (optional) — write XII.17 into D13's textual-doubt sentence at acceptance

D13's third-class sentence describes XI.26, "a bracketed proper name". XII.17 extends the class to a whole clause, correctly (Ruling 3), and it is the second and last instance in the work. **Proposal:** at acceptance, widen the sentence to "a bracket that marks textual doubt about the Greek … whether it is a **word or a whole clause** (XI.26's '[Ephesians]'; XII.17's '[For let thy efforts be—]')". **Reason:** the package's rule for itself is that the ledger is where a later agent looks for rulings; a class illustrated only by a one-word instance will be read as word-sized. Optional because D13's Book XI amendment ("voice and subject, not length") already decides it for anyone who reads the whole row.

---

## What I checked and did not find

- **No phrasing imported from another translation.** The five passages where an import would be most likely — XII.1's "a stranger in your native land", XII.3's "Empedocles' sphere", XII.22's "a mariner who has doubled the promontory … a waveless bay", XII.27's "Smoke and ash and a tale, or not even a tale", XII.36's "in life the three acts are the whole drama" and "Depart then satisfied" — all keep Long-specific turns that the familiar modern versions do not have. Long's awkwardnesses survive where a borrowed phrase would have smoothed them (XII.35's closing inversion, XII.13's "what a stranger he is", XII.29's asymmetric ellipsis).
- **No modern psychological reading imposed.** "Affects" → "feelings" (XII.19), "perturbations" → "disturbance" (XII.3), "the formal / the material" → "form / matter" (XII.18, XII.29) are all glossary rows applied as written, and none of them adds a mental-state vocabulary Long does not have.
- **Voice.** Nothing in the thirty-six paragraphs turns Marcus's self-address into advice to a reader, a moral lesson, or motivational writing. The imperatives stay bare imperatives (XII.7 "Consider", XII.8 "Contemplate", XII.22 "Take away then", XII.25 "Cast away opinion", XII.32 "Reflecting on all this"). No "we" is introduced where Long has "thou"; the two "we"s in the book (XII.4, XII.5) are Long's.
- **Glossary stability.** Every term in the `continuity.md` table was checked at every occurrence in the book, including the two rows fixed before drafting: XII.1's "the divinity within thee" → "the god within" (the corrected *daimōn* row, on the III.16 precedent) and XII.5's "benevolently" → "kindly" (the extended beneficence row, its only occurrence in the work). Long's three words for mind (intelligence, understanding, mind) are kept apart at all seven occurrences. "The divine" is used for every bare abstract and nowhere else.
- **The "shall" audit.** I classified all ten of Long's independently: XII.1 ×4 (one clause of time, three of condition), XII.3 ×2 (condition), XII.4 ×2 (noun clauses, one third person and one first), XII.15 (rhetorical, not deliberative), XII.36 (noun clause). The candidate's disposition matches mine in nine of ten; the tenth is finding 4.1, which is a ruling, not an error.
- **The dagger.** One, at XII.16, kept verbatim with Long's comma. Book XII has fewer than any other book (the next fewest is three).
- **No `[`, no `(i. `-style cross-reference, no thou-form, no archaic inflection** anywhere in the candidate; confirmed by regex over all thirty-six paragraphs, not by the `README.md` assertions alone.
