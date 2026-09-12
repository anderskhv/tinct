# Independent review — Meditations, Book XI, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/meditations-modern-en-20260911-v2` (detached worktree `/tmp/claude-0/med-review-11` at commit `11ee02b06`) |
| Candidate | `book11/candidate-v1.json`, sha256 `d0db3918d436dfe970dd2eb6a1050cb87fdf9ff7d727dc454b5cc2b1fd821028` — recomputed locally; matches the assignment, `provenance.json` and `README.md` |
| Source | George Long 1862, `book11/source-book11.json` sha256 `41ff9b0757dadcff4c9e47ffe7f268eb62e3323bbb683905a3adf1618199fef4` (matches), byte-identical to chapter 11 of `../meditations-original-en.staged.json` sha256 `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` (matches, 487 paragraphs, 12 chapters, profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, **39**, 36); PG base `source/pg15877-long-1862.txt` sha256 `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` |
| Staged-original no-rebuild claim | **Verified independently, and it holds.** Not by re-running either script: I wrote my own reconstruction of PG lines 6376–6816 with my own rules *before* reading `scripts/verify_book11_source.py`, then audited the drafter's rules class by class against the raw range. See `review/README.md` and the section below. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-13.md`, in order, three paragraphs at a time with the `CONTEXT ONLY` neighbours (coverage `B11-P001`…`B11-P039`, each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (the "shall" rule as widened at Book IX acceptance and covering the deliberative "shall" of an indirect question; the in-text-Greek exception; the two rows fixed before Book XI was drafted), `WORKFLOW.md`, `PROVENANCE.md` §4, `00-progress-ledger.md` including **D13**, `book11/review-instructions.md`, `book11/continuity.md`; `book10/review/findings-v1.md` read first for format and calibration |

**Verdict: Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must fix before acceptance) | **0** |
| minor (worth improving) | **8** (five paragraph-level, three chapter-level/records) |
| optional (preference, no defect) | **3** |
| paragraphs with no material issue | **31** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Long's words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

**Book XI is sound.** A token-level diff of all thirty-nine paragraphs shows that every difference between Long and the candidate is accounted for by a documented decision — a thou-form, a modernised verb form, a glossary row, a bracket fold, a D11 drop, a dropped cross-reference or citation, a listed punctuation change, or a per-paragraph entry in `continuity.md`. Nothing is missing, nothing is added, nothing is softened, nothing is expanded, nothing is imported. There is no substantive finding. The five paragraph-level minor findings are: one archaic finite negative left standing at XI.1 while the same construction was modernised eleven sections later; one unidiomatic adverb at XI.18; one dangling cross-reference in `continuity.md` at XI.19; one subject–verb comma treated two ways inside a single paragraph at XI.21; and one partitive turned definite at XI.26. The three records findings are two small miscounts in the step-1 write-up and the recommendation that the newly found build rule get a decision row of its own.

---

## Verification performed before reading

### Hashes and mechanical checks

All four hashes recomputed locally; all four match. The mechanical-check block in `book11/README.md` was extracted and run verbatim: it printed `OK` and the three expected hashes. It covers `source-book11.json` byte-identity to chapter 11 of the staged original; 39 candidate paragraphs one-to-one and each numbered `n. `; the 487-paragraph twelve-chapter shape with 39 in Book 11; no `[Illustration`, no footnote opener and no footnote-content string anywhere in the staged file; XI.6's two verse lines present and the Sophocles footnote absent; packet coverage exactly `B11-P001`…`B11-P039`; packet and readable-copy text identical to the JSON; the three dagger clauses with Long's commas; the bracket arithmetic asserted from an enumerated list; no bracket, no cross-reference and no citation surviving in the candidate; the "shall" inventory; no thou-form anywhere; the base-text points; the punctuation tallies; and the seven byte-identical paragraphs.

### The no-rebuild claim, checked the strong way — my own reconstruction first, then the drafter's rules

The assignment is explicit that neither a re-run nor a reconstruction sharing the build's blind spot proves anything. So I did two things, in this order.

**First, I wrote my own reconstruction of PG lines 6376–6816 before opening `scripts/verify_book11_source.py`,** with rules chosen independently: classify maximal indented runs by indentation and drop the **four-space** runs as footnotes (a different rule from the build's, which keys on an `[A-D]` opener and then consumes blank-or-indented lines); strip `[A-D]` markers; `--`/`---` → em dash; drop underscores; split on blank lines; join a block not opening `N. ` onto the block before; prefix `1. `; close a space before `,;:.?!`; leave daggers in so they surface as diffs. Result: **39 paragraphs, and exactly three differing from the staged Book XI — XI.8, XI.15, XI.17 — each differing only by one `+`.** A rule set written from a different angle reproducing the staged file to the byte is the strongest form the check takes, and it agrees with the drafter's.

**Second, I audited the build's and the drafter's rules class by class against the raw range**, because the build's footnote rule is the one that can fail silently. Reading `scripts/build_original_en_from_pg15877.py`, its footnote state machine is: on an indented (or flush-left, since the Book VII fix) `[A-D]` opener set `in_fn`, then **consume every following indented *or blank* line until flush-left text resumes**. That rule will swallow an indented verse block if the block follows a footnote with only blank lines between. So:

1. **Maximal indented runs, enumerated independently with their indentation profiles.** There are **seventeen**, and my listing agrees with the drafter's line for line: twelve at **four** spaces (eleven with `[A-D]` openers at 6398, 6401, 6420, 6459, 6461, 6554, 6647, 6702, 6750, 6753, 6757, plus the unmarked continuation of footnote [A]'s two-paragraph body at 6558–6559); **three verse runs in XI.6 at six spaces** (6441–6442, 6446, 6450); and two verse citations at 26 and 17 (6777, 6780). **The six-space verse and the four-space footnotes are separated by indentation *and* by flush-left text.** I checked the adjacency by eye in the raw file: the nearest footnote run before the verse ends at 6422 and is followed by the whole of XI.4, XI.5 and the opening of XI.6 flush left; Long's own connectives "And again,—" (6444), "And,—" (6448) and "And other things of the same kind." (6452) stand flush left *between* the three verse runs; and the next footnote run opens at 6459, after the flush-left "After tragedy the old comedy…" paragraph. **The consumption rule cannot have reached the verse, and it did not: both quoted lines are in XI.6 in the staged file and in both reconstructions.**
2. **The marker recount reconciles exactly, and the marker inside the verse is real.** Counting `[A-D]` occurrences in the range myself: **ten on flush-left lines** (6388, 6395, 6416, 6437, 6549, 6645, 6700, 6734, 6742, 6746) and **one at the end of the indented verse line 6442** (`This has its reason too."[B]`) — eleven in-text markers for **eleven indented openers**. The drafter's count is right, including the one embedded in the verse, which is precisely the case the assignment asked me to look at.
3. **No flush-left footnote opener** (I searched `^\[[A-D]\]` across the range: none), so the VII.45 class does not recur; and a flush-left footnote *body* would have been read as ordinary text by both reconstructions and shown as an inserted paragraph or inserted words. None did.
4. **No illustration caption** in the range (the Book IV class).
5. **The only three standalone short flush-left lines** are the XI.6 connectives above — no running head, page number or catchword.
6. **No Greek in the body**: every `[Greek: …]` occurrence in the range sits on an indented footnote line (6398, 6554, 6555, 6702, 6757), and the staged Book XI contains no `(Greek:` at all. See finding **C1** on the numeral.
7. **Three daggers, at 6488, 6544, 6577**, exactly as `PROVENANCE.md` §4 documents, and they are the only diffs.

Boundaries checked by eye: 6375 `XI.`, 6377 the opening "These are the properties of the rational soul", 6813–6815 the last words of XI.39, 6817 `XII.`. `git status` clean. **The claim holds. No rebuild is needed and no accepted book is reopened.**

### Ruling on the newly found build rule (space before `,;:.?!` closed up)

**The drafter's call is right on every count, and the rule should also get a decision row of its own.**

- *Right to reproduce it in the reconstruction rather than treat it as a defect.* The reconstruction exists to compare the staged file against the raw text **on the same rules**; a reconstruction that omits one of the build's normalisations manufactures a diff that is not a defect, which is what happened on the drafter's first run at XI.18. Reproducing it is what makes the diff meaningful.
- *Right to document it in `PROVENANCE.md` §4 rather than rebuild.* I verified the rule in the build script (`re.sub(r'\s+([,;:.?!])', r'\1', t)`, applied after marker and dagger removal and after whitespace collapse) and verified its effect across the whole translation body myself. **It changes no word anywhere.** It is a typographic normalisation of exactly the class §4 already lists for `--` → em dash and for underscores. D12's standard is not engaged, because no paragraph and no count would change on a rebuild. Four of the firings are in accepted books; reopening them for a closed-up space would be a worse outcome than recording the rule.
- *But it should be recorded as a decision of its own.* §4 is a list of normalisations; the ledger is where the package keeps rulings a later agent must be able to find. Every earlier apparatus question that reached this level got a row (D5, D11, D12, D13). A future rebuild that silently dropped this rule would reintroduce " ..." into five places in the staged original and break the byte-identity guarantee D12 turns on. See finding **C3**, and see finding **C2** for a correction to the rule's stated scope.

### Bracket arithmetic and D13, recounted from the source

I extracted every square-bracket span in Long's Book XI rather than trusting the count. There are **eleven**, in nine paragraphs: XI.4, XI.10, XI.13, XI.15, XI.18 ×2, XI.20, XI.21, XI.26, XI.37 ×2. **Eleven is right, and the disposition 6 folded + 5 dropped under D11 + 0 under D13 = 11 is right.**

**D13 genuinely does not fire anywhere in Book XI.** I applied its own test — *whose voice is the bracket in, and what is it about* — to each of the eleven. Not one speaks about the translation: none says what Long omitted, supplied, transposed, conjectured or could not render. Six are supplements completing Long's own syntax or naming a referent; four are second English renderings of one Greek word (D11); and XI.26's "[Ephesians]" marks a doubtful manuscript reading, which is a statement about the *Greek text*, not about Long's *handling* of it — the distinction D13's own wording draws. The drafter's "no D13 drop in this book" is correct, and Book XI is not evidence that D13 was unnecessary; it simply has nothing of the X.23 kind.

### The "shall" audit — all eight, one at a time

Long has **eight** "shall / shalt" in Book XI; the candidate keeps **two** and removes **six**. I checked each against the rule as widened.

**Kept (2), both XI.18, both licensed twice over.** "How then **shall** I take away these opinions?" — first person *and* the deliberative "shall" of a direct question, the VIII.1 case exactly. "I **shall** certainly not be injured" — first person, the II.1 / VIII.45 case. Both correct.

**Removed (6), every one a plain future, and the two hard ones are right.**
XI.13 "Suppose any man shall despise me" → "despises" (a supposition is a clause of condition; the plain present is what the rule directs). XI.19 "when thou shalt reproach thyself" → "when you reproach yourself" (clause of time). XI.20 "until again the universal shall sound" → "until the whole again sounds" (clause of time). XI.21 "an object which shall be of a common kind" → "which is" (a relative clause stating the object's required character; the X.1 positive-consecutive case, plain present). XI.29 "before thou shalt have first learned" → "before you have first learned" (clause of time, present perfect for future time).
**XI.13's "Shall any man hate me?" → "Will any man hate me?" is right.** A deliberative question asks what *is to be done*; this asks whether a thing will in fact happen, and its pair one sentence earlier ("Suppose any man shall despise me") fixes it as a plain future about other men's conduct. The widened IX.41 clause reaches indirect deliberative questions, not rhetorical futures, and does not touch it. Same disposition as X.11 and X.32.

**Verdict on the audit: the line is drawn consistently, and Book XI adds no new case to the three third-person plain futures already recorded in the ledger under "Open, not blocking".** No second-person "shall" and no plain-future "shall" survives; I searched for both.

### Ruling on the 0.977 ratio and the seven identical paragraphs — checked paragraph by paragraph, not in aggregate

Recomputed: **3,902 → 3,813 words, ratio 0.9772**, the lowest in the package. I did not accept the aggregate explanation; I computed every paragraph's ratio and classified each paragraph by whether it carries apparatus in the source.

- **The three lowest are entirely dropped citations.** XI.32 0.643 (14 → 9; the five words `HESIOD, Works and Days, 184.`), XI.31 0.667 (9 → 6; the three words `Odyssey, ix. 413.`), XI.36 0.714 (14 → 10; the four words `(Epictetus, iii. 22, 105)`). In each case Long's own line survives word for word. Then XI.33 0.867, XI.12 0.906, XI.35 0.923, XI.10 0.936, XI.34 0.939 — every one a dropped citation or cross-reference and nothing else.
- **XI.18, the longest meditation, is 0.954 (922 → 880)**, and the eight dropped cross-reference spans account for 42 of the 42 missing words. I diffed it token by token: the nine rules, the tenth present, the "Not so, my child … my child" speech with both vocatives, and every clause of the closing argument are present. There is no compression.
- **Of the twenty-two paragraphs carrying no apparatus at all, the minimum is XI.7 at 0.964** (28 → 27, the removal of "does" from the archaic inversion). **None is below 0.96 — the claim holds.** Twenty-two paragraphs sit between 0.99 and 1.02, as stated. Maximum 1.015 at XI.3.
- One refinement for the record: "the whole of the shortfall is apparatus" is true to within two words. The apparatus-bearing paragraphs net −87; the non-apparatus paragraphs net −2 (−1 XI.7, −1 XI.29, −2 XI.2, −2 XI.9, +3 XI.1, +1 XI.3). Not a finding — the substance is exact — but the sheet could say "all but two words of the shortfall".

**The seven byte-identical paragraphs are a real result, not an omission.** I checked each against the accessibility standard on its own. XI.14, XI.22, XI.24, XI.25, XI.28, XI.38 and XI.39 contain **no thou-form, no archaic verb inflection, no glossary term needing a row, no bracket, no cross-reference and no dagger-affected wording**. XI.39's "What do you want" is Long's genuine plural, not a thou-form; XI.24's "Lacedaemonians" is current in a classical context and is the same class as X.27's Latin name forms; XI.25's "I would not perish by the worst of all ends" reads in current English as the refusal it is. Long's English in these seven is already the modern edition's English. Leaving them identical is correct; changing them would have been the error.

### Nothing imported from other translations

I looked for the tell of an import — clusters of vocabulary Long does not use — and found none. The token-level diff of all thirty-nine paragraphs shows no inserted phrase anywhere except the seven documented words (`it itself enjoys` at XI.1, `to` at XI.3, `the whole` at XI.20, `come` at XI.19, `often happens` relocated at XI.8, `exist` relocated at XI.35, `Apollo` unbracketed at XI.18). I checked the seven passages most likely to attract a familiar modern rendering — XI.1 "the fruit which it bears", XI.3 "without tragic show", XI.6 "O Cithaeron", XI.15 "like a man who smells strong", XI.18 "Not so, my child", XI.22 "the alarm and trepidation of the town mouse", XI.27 "there is no veil over a star", XI.33 "To look for the fig in winter" — and each keeps a Long-specific turn that Hays, Farquharson and Staniforth do not have. **No import found anywhere.**

---

## Rulings on the base-text work

**All eight base-text calls are right. I would decide every one the same way.**

1. **XI.18, PG "nattering" → "flattering". UPHELD, and it is not a close call.** PG's `nattering` is not an 1862 word in this sense — "natter" is a nineteenth-century dialect verb for chattering that does not enter standard written English until much later, and it makes no sense paired against "being vexed at them". Long writes "flatter" of precisely this at XI.14, eleven sections earlier ("Men despise one another and **flatter** one another"), the sentence's whole shape is the pairing of flattery against resentment, and Standard Ebooks reads "flattering". A single-letter OCR slip (`fl` ligature → `n`) is the ordinary explanation. Same class as VIII.37 "Fergamus", IX.34 "pool souls" and X.15 "Let me see", all upheld at round 1 of their books. **The one departure from PG's letters in Book XI is justified.**
2. **XI.18, PG "vexed" against SE "veied". PG right.** "Veied" is not a word in any register; "vexed" is Long's and takes the glossary's "resenting". That the two base texts each carry a slip inside the same eleven words is a coincidence worth recording, and the drafter records it; it does not weaken either call, because each is decided on its own evidence rather than on a general preference for one text.
3. **XI.8, PG "again to become a part" against SE "be to come". PG right.** SE's reading is a word-split corruption of "become" and yields no English.
4. **XI.10, PG plural "the natures of things" against SE "the nature of things". PG right**, and the decisive evidence is inside the sentence: Long's own next clause is "the most comprehensive of **all natures**". SE's singular is the easier reading and therefore the suspect one.
5. **XI.6, PG "gradually sank down" against SE "sunk". PG right.** "Sank" is the simple past the clause needs; "sunk" as a past tense is the older, looser form.
6. **XI.10, PG's missing full stop after "the skill of art", supplied. Right.** The sentence cannot run on into "Now all arts do the inferior things"; SE has the stop; no word changes. A typographic slip, repaired, not a reading adopted.
7. **XI.15, PG "What are thou doing" for "art". Correctly identified and correctly treated as invisible.** Both readings become "What are you doing" under the thou-rule, so nothing turns on it. The X.32 case in this book's form. Recording it anyway is right: a later collator diffing PG against the candidate would otherwise find an unexplained difference.
8. **The two open variants, both followed under D6. Both right, and I would choose PG on the merits as well as on the rule.**
   - **XI.1: PG "Thus the right reason differs not at all from the reason of justice" against SE "Thus then right reason differs…".** PG's reading is the better one independently: the sentence closes a list of the rational soul's properties, and "the right reason" — a definite thing already under discussion — pairs with "the reason of justice" in the same clause, where SE's adverbial "then" adds a connective the sentence does not need and drops the article from one half of a paired phrase. **Follow PG.**
   - **XI.35: PG "the dried grape, are all changes" against SE "all are changes".** Genuinely open; nothing of sense turns on it. PG's order puts slight weight on "all", which suits a list of three. **Follow PG**, under D6, as drafted.
9. **Long's broken XI.18 ending kept. Right.** "…but either when he is alone, and if others are present..." is a lacuna Long himself flags in a footnote that the package drops as apparatus. Reproducing the ellipsis and importing nothing is the V.29 / VII.58 precedent, and it is the only honest option: completing the sentence would be composing Marcus, and dropping it would silently mend a defect the reader is entitled to meet.
10. **The three 1862 hyphenations normalised** ("wrong-doers", "mad-man's", "To-morrow" → "wrongdoers", "madman's", "Tomorrow"). Right, on the X.36.2 ruling: a convention of 1862 typesetting, not a reading. See finding **26.1** for the one place where that ruling was stretched past its class.

---

## Rulings on the five flagged decisions and the one point offered for confirmation

**1. XI.18's "flattering" for PG's "nattering" — UPHELD.** See base-text ruling 1 above. Keep as drafted.

**2. XI.18's nine-word bracket folded — UPHELD, and D13 should NOT be read to cover a bracket by size.** Three reasons, and the first is decisive and is stronger than the one the sheet gives.
   - **The bracket carries the enumeration.** "[If any have offended against thee, consider first]" contains the word *first*, and the meditation then runs "Second, … Third, … Fourth, … Fifth, … Sixth, … Seventh, … Eighth, … Ninth," and closes "Remember these **nine rules**". Drop the bracket and the list has nine members and eight labels, an incoherence on the page. Folding is not merely the better reading; it is the only one that leaves Long's own text consistent with itself.
   - **It passes D13's test cleanly.** D13 asks whose voice the bracket is in and what it is about. This one is in Marcus's voice and is about the occasion of the rules — it tells the reader what the nine rules are *for*, not what Long did with the Greek. Nothing in it reports an omission, a supplement, a transposition or a conjecture. It is a supplement of the ordinary kind that the glossary's bracket rule folds.
   - **Size is not the test, and making it one would be a bad rule.** D13's own limit clause already says the question is whether dropping removes a note about Long's choices or deletes the observation the section is made of. A size threshold would fail exactly the case D13 was written to get right: X.23's translator's note is *nine words too*, and it is dropped — on its content, not its length. **Recommend the ledger say so explicitly** when it records this ruling, so a Book XII drafter meeting a long supplement does not invent a word limit.
   - One small mechanical note, no finding: the colon after the bracket is Long's own, outside the bracket, and the candidate keeps it. Correct.

**3. XI.10's "[things indifferent]" dropped under D11 — UPHELD, with the opacity answered rather than denied.** In shape it is X.2's "[social]" and X.15's "[political community]" exactly: a second English rendering of one Greek term (*ta mesa*) beside the primary rendering Long has already given. D11 fires, and folding would make Marcus name two classes where he names one. The drafter is right that the primary word left standing is here the *less* transparent one, which is a real cost — but the three alternatives are each worse. Folding contradicts the Book X ruling on identical shapes. Extending the glossary's "indifferent" row to swallow "middle things" is folding by another name, and it would overwrite Long's word with his gloss, which is the one thing the bracket rules exist to prevent. Adding a clarification would breach the no-glosses rule. And the cost is smaller than it looks: the clause supplies its own sense ("justice will not be observed, if we either care for middle things, or are easily deceived and careless and changeable"), where "middle things" is plainly the class of things one should *not* care about, and the accepted Book II already gives the reader Long's own gloss at II.11. **Keep as drafted**, and record this ruling in `continuity.md` so the question does not reopen at XII.

**4. XI.26's "[Ephesians]" folded as a mark of textual doubt — CONFIRMED.** Long brackets the name because the manuscript reading is uncertain — his footnote reports Gataker's conjecture of *Epikoureion* for *Ephesion* — not because "Ephesians" is his supplement or his second English word for something. The bracket is therefore a **textual mark**, and the package's settled practice with textual marks is that the mark goes and the word stands: that is exactly what it does with Long's daggers, three of them in this same book. Classifying it under D11 would be wrong (there is no primary rendering for it to be an alternative to) and under D13 would be wrong (it says nothing about Long's *handling*; it marks the state of the *Greek*). **Keep as drafted.** Worth one sentence in the ledger, since this is the first bracket of this class in the package and XII may contain another.

**5. XI.15's "at once" for Long's "forthwith" — the reasoning is UPHELD; see finding 15.1 for a better word.** The drafter is right to refuse the X.30 rendering "immediately": Long's own "immediately" stands nine words earlier in the same sentence, and using it twice would manufacture an echo Long does not have and, worse, would make the dagger clause and the clause after it chime. Leaving "forthwith" is not an option either — it is dead, and being inside the dagger *sentence* does not protect it, since the dagger clause itself ends at "in his eyes" and the package's dagger practice protects the clause, not the sentence. So the disposition is right. Only the replacement is questionable, and that is finding 15.1.

**6. "Pancratium" kept untranslated at XI.2 — CONFIRMED.** It is Long's text, not apparatus; it stands third in a list of three entertainments ("pleasing song and dancing and the pancratium") where the reader takes it as one from its company; Long himself reuses it later in the same section, so a dropped or replaced word would have to be replaced twice; and any gloss would import the footnote content the no-glosses rule exists to prevent. Exactly the X.9 "Mimi" case. **Keep as drafted.**

**7. The four Epictetus references dropped — CONFIRMED (put to the reviewer with reasons rather than flagged).** They should be dropped. `(Epictetus, iii. 24, 87)`, `(Epictetus, iii. 24, 88)`, `(Epictetus, iii. 24)` and `(Epictetus, iii. 22, 105)` are Long's parenthetical citations of Arrian's *Discourses* by book, chapter and section — the same apparatus class as "(vi. 28)" and as the Hesiod citation dropped at V.33. The objection that they point outside the Meditations to a source Marcus names does not survive contact with the text: **Marcus's own naming of Epictetus is in the body and is kept** — "said Epictetus" and "No word is a word of bad omen, said Epictetus" at XI.34, "Epictetus also said" at XI.37 — so the reader loses no attribution. What is dropped is a chapter-and-verse locator to a nineteenth-century edition of another book, which Marcus did not write and could not have written. Standard Ebooks omits every one of them. **Drop confirmed.**

---

## Findings by paragraph

### B11-P001 — XI.1

**Finding 1.1 (minor).** Current: `Thus the right reason differs not at all from the reason of justice.` Long: `Thus the right reason differs not at all from the reason of justice.` This is a finite negative without do-support — archaic English, and the **only one left standing in Book XI**. I searched the whole candidate for the construction: every other instance is either a modal or infinitive ("not to write them", "not to speak", "for not going") or was modernised, including the identical shape at XI.19, where Long's `comes not from the real thoughts` becomes `does not come from the real thoughts`. Two sentences of the same grammar, eighteen sections apart, decided two ways in one book. **Proposed correction:** `Thus the right reason does not differ at all from the reason of justice.` (Keeping PG's "the" per D6 and base-text ruling 8.) Nothing else changes; the sentence's weight falls where Long puts it, on "not at all". Confidence high.

*Also noted, no finding.* The reorder `the fruit which it bears itself enjoys` → `it itself enjoys the fruit which it bears` is right and I would make it: Long's fronted object makes a modern reader parse "bears itself" as a unit, and the contrast the sentence turns on — the soul enjoys its own fruit, where plants and animals do not — is only visible once the subject is in front. "Itself" is Long's own word and keeps his emphasis. The double rendering of "comprehends" is right and well argued: `embraces and takes in the periodical renovation` (the older *encompass* sense, the VI.9 defect) and `it understands that those who come after us…` (governing a that-clause, which *is* the modern sense). `periodical renovation` → `periodic renewal` is necessary — "renovation" now names building work — and imports nothing of the Stoic *palingenesia* footnote the package drops. `such like things` → `things of that kind`; `in a manner` → `in a way`; "the property of Law" keeps Long's capital as X.25 does.

### B11-P002 — XI.2
No material issue found. `distribute` → `divide` is justified from Long's own "division" four clauses later. The plural distributive `several` → `separate` ×2 is right: the sense of "several" that Long uses is dead outside legal English, and "single" (the IX.32 / X.8 / X.9 rendering) would be wrong for a plural. `ask thyself as to each, if thou art mastered` → `whether you are mastered` removes a genuine ambiguity after "ask". `movement` correctly left as "movement" here — this is the physical sense the glossary's *hormē* row explicitly leaves alone, and the same word is correctly rendered "impulse" at XI.20 and XI.37. "Pancratium" confirmed above.

### B11-P003 — XI.3
No material issue found. The supplied `to` in `either to be extinguished or dispersed or to continue to exist` restores Long's own parallel — his first limb has it, and without it "continue" attaches to "readiness". One word, no sense added. `as with the Christians` kept exactly and unglossed is right: it is Long's text, it is the only such remark in the Meditations, and a note would be commentary of the kind the standard forbids. `without tragic show` kept.

### B11-P004 — XI.4
No material issue found. `[doing such good]` folded as the completion of "never stop" — a supplement of the plainest kind, and without it the imperative has no object. `the general interest` → `the common good` (glossary).

### B11-P005 — XI.5
No material issue found. `the nature of the universe` → `the nature of the whole` (glossary). Two sentences, both left at Long's length; "What is your art? To be good." is not expanded, which is the temptation here.

### B11-P006 — XI.6
No material issue found. `even they bear them who cry out` → `even those bear them who cry out` is one word for one word and repairs a pronoun that now dangles before its relative. The three dramatic quotations are kept in Long's words and joined into the paragraph, as the staged original has them and as every other verse in the package is handled. Two commas before dashes removed (`And again,—` → `And again—`, `And,—` → `And—`); Long's own `especially:—` kept, correctly, on the X.34 ruling that the package's dash convention governs the candidate's dashes and not the source's. `magisterial freedom of speech`, `mimic artifice` and `dramaturgy` all kept: all three are current and all three are his. `sank` follows PG (base-text ruling 5).

### B11-P007 — XI.7
No material issue found. `How plain does it appear that` → `How plain it appears that` removes an interrogative inversion inside an exclamation, which is the archaism; the verb and the emphasis are untouched. At 0.964 this is the lowest-ratio apparatus-free paragraph in the book, and the single missing word is "does".

### B11-P008 — XI.8
No material issue found. The dagger clause stands verbatim: `it grows with the rest of the tree, but that it has not the same mind with it`. The un-dislocation — `if it often happens, this kind of separation, it makes it difficult` → `if this kind of separation often happens, it makes it difficult` — uses only Long's words in a different order and removes a spoken right-dislocation a modern reader has to re-read. `ingrafted` → `grafted on`: the verb is dead, the image is not, and "grafted on" is what a gardener says. PG's `become` followed against SE's garbled "be to come" (base-text ruling 3).

### B11-P009 — XI.9
No material issue found. `benevolent feelings` → `kind feelings` and `to be vexed at them` → `to resent them` are both the glossary. One comma before a dash removed. `toward` kept here against Long's `towards` in the same section, correctly — both are current and the variation is his, not a defect to tidy.

### B11-P010 — XI.10
No material issue found. `[things indifferent]` dropped under D11 — upheld above with reasons. The missing full stop after `the skill of art` supplied (base-text ruling 6) and the subject–verb comma before `cannot fall short` removed. PG's plural `natures` followed (base-text ruling 4). Cross-reference dropped with its sentence's stop supplied. `the universal nature` correctly kept as its own glossary term and not collapsed into "the whole".

### B11-P011 — XI.11
No material issue found. `in a manner` → `in a way`; `Let then thy judgment` → `Then let your judgment`, which is Long's own word in the position current English puts it. The conditional keeps its shape and the closing "you will not be seen either pursuing or avoiding" is not expanded.

### B11-P012 — XI.12

**Finding 12.1 (optional).** Current: `…when it is neither extended towards any object, nor contracted inwards, nor dispersed, nor sinks down…`. Long: identical. Long's series shifts from three past participles to a finite present verb in the fourth limb, which is ungrammatical in the series for a modern reader: "is neither extended … nor contracted … nor dispersed, nor **sinks** down". `continuity.md` records the shift as Long's and keeps it, which is a defensible reading of the fidelity rule. **Proposed correction (drafter's discretion):** `nor sunk down`, which changes the form of Long's own word and nothing else and completes the parallel he plainly intends — *or*, if the drafter prefers to leave Long's text alone, add it to `00-progress-ledger.md` under "Open, not blocking" beside the II.5 dangling relative, which is the same class of decision and was handled that way. What should not happen is that it stays unrecorded anywhere except as a per-paragraph note. Confidence medium on the wording; high that one of the two routes should be taken.

*Also noted.* Comma before dash removed; cross-reference dropped with a stop supplied. `The spherical form of the soul maintains its figure` kept entire — this is the image the section is made of.

### B11-P013 — XI.13
No material issue found. `[parts]` folded — the noun Long's adjective "the interior" requires. `dissatisfied` → `discontented`, `benevolent` → `kind`, `the nature of the universe` → `the nature of the whole`, `the common advantage` → `the common good`, all glossary, the last on the row extended before drafting. `Shall any man hate me?` → `Will any man hate me?` upheld in the "shall" audit above. `that I be not discovered` → `that I am not discovered` is the right call on an archaic subjunctive in a purpose clause. **Phocion kept entire, including Long's doubt** ("unless indeed he only assumed it") and with no note about who Phocion was — correct; a note would be the historical fact the standard forbids adding.

### B11-P014 — XI.14
No material issue found. Byte-identical to Long, and correctly so: no thou-form, no archaic inflection, no glossary term, no bracket, no cross-reference. "Men despise one another and flatter one another; and men wish to raise themselves above one another, and crouch before one another" is already the modern edition's sentence — and it is also the sentence that decides the "nattering" question four sections later.

### B11-P015 — XI.15

**Finding 15.1 (optional).** Current: `just as he who is beloved at once reads everything in the eyes of lovers.` Long: `…forthwith reads everything in the eyes of lovers.` The *disposition* is right and I uphold it above: "forthwith" is dead and X.30's "immediately" would manufacture an echo of Long's own "immediately" nine words earlier. But "at once" has a second current sense — *simultaneously* — and it sits immediately before "everything", so "at once reads everything" can be read as "reads everything at the same time", which is not the sense. **Proposed correction:** `just as he who is beloved instantly reads everything in the eyes of lovers.` "Instantly" is unambiguous, is the same plain register, does not echo "immediately", and is one word for one word. Confidence medium — this is a preference between two correct renderings, and the drafter may keep "at once" — but the ambiguity is real and "instantly" has no cost.

*Also noted.* The dagger clause stands as Long has it, **including his comma** (`Such as a man's character is, he immediately shows it in his eyes`), on the X.25 ruling; correct, and correctly not tidied even though it separates a subject from its verb, which the same book removes elsewhere. `[false friendship]` dropped under D11 — right; the wolf is the image and the image is the point, and Long's footnote referring it to the fable is apparatus and stays out. `whether he choose` → `chooses`; `benevolent` → `kind`. PG's "are thou" slip correctly identified as invisible (base-text ruling 7).

### B11-P016 — XI.16
No material issue found. Two archaic subjunctives (`if it be indifferent`, `even if it bring no reputation`) both modernised, and decided the same way in the same paragraph, which is what consistency requires. `perchance` → `perhaps` here is right: this is a plain reported clause, the X.36 case. `contrary to nature` → `against nature` and `conformable to thy own nature` → `in accordance with your own nature` (glossary). `easy to thee` → `easy for you`. The long central sentence keeps every one of its "and it being in our power" limbs; at 199 words against Long's 199 there is no compression in the hardest paragraph in the book to keep at length.

### B11-P017 — XI.17
No material issue found. `whence each thing is come` → `where each thing has come from` and `what kind of a thing` → `what kind of thing`, both plain modernisations before the dagger. The dagger clause stands as Long has it, **including his comma** (`and of what it consists, and into what it changes`), on the X.25 ruling.

### B11-P018 — XI.18

**Finding 18.1 (minor).** Current: `Sixth, consider when you are greatly resentful or grieved, that man's life is only a moment…`. Long: `Sixth, consider when thou art much vexed or grieved…`. "Greatly resentful" is not idiomatic English — the adverb that goes with "resentful" is *deeply* or *bitterly*, not *greatly* — and it reads as a workaround, which is what it is: the glossary gives "resent" for "be vexed at", "much resentful" is impossible, and "greatly" was reached for. **Proposed correction:** `Sixth, consider when you are deeply resentful or grieved…`. "Deeply resentful" is current, is the same register as Long's "much vexed", and preserves the pairing with "or grieved". Confidence high on the defect, high on the fix; the glossary row is untouched either way. (`resentment` for "vexation", `angry and resentful` for "angry and vexed", and `resenting them` for "being vexed at them" elsewhere in the paragraph are all idiomatic and need nothing.)

*Also noted, no finding.* The nine-word bracket fold and the "flattering" correction are both upheld above, the first on the enumeration argument. `[Apollo]` folded as an apposition (`from the leader of the Muses, Apollo`) is the VI.50 / VII.2 / X.7 referent class and is right. All **eight** cross-reference spans dropped with a stop supplied where Long's parenthesis carried one; I checked each of the eight sentences reads as a complete sentence afterwards, and each does. `wrong-doers` → `wrongdoers` (X.36.2). `men's ruling principles` → `men's ruling parts` (glossary; the IX.18 rendering). Both retained "shall" licensed. Long's broken ending kept with its ellipsis and no imported footnote (base-text ruling 9). The nine rules keep their numbering and their "Second, … Third, …" openings; the tenth present keeps its place; "Not so, my child … my child" keeps both vocatives; and at 880 words against 922 the whole of the difference is the eight citations. This is the hardest paragraph in the package and it is handled well.

### B11-P019 — XI.19

**Finding 19.1 (minor, records).** `continuity.md` says of XI.19, "**'The superior faculty' is kept** as Long's own phrase — see the flagged decisions", and the glossary-terms table repeats "Long's own phrase, kept; flagged below". **It is not in the flagged list**, which has five items and does not include it. A reader following the cross-reference finds nothing, and — worse — the point it gestures at is a real one that the package should settle in writing: `the superior faculty` stands at XI.19 while `the ruling faculty` becomes `the ruling part` at XI.20, eleven lines later, so the candidate uses "faculty" once and drops it once, in adjacent sections. **My ruling on the substance: keep the rendering.** "The superior faculty" is not one of the five variants the *hēgemonikon* row collects, the package's settled practice with Long's own phrases that the row does not name is to keep them (VI.14 "a rational soul", X.33 "an irrational soul", X.8 and XI.20 "the intelligent part"), and the section's own argument — the superior part overpowered by the perishable part — is about superiority, not about ruling. **Proposed correction:** keep the wording; either add it to the flagged list as a sixth item, or remove the dangling "see the flagged decisions" and replace it with the one-sentence reason above, in both places in `continuity.md`. Confidence high on the documentation gap, high on the substance.

*Also noted.* `comes not from the real thoughts` → `does not come from the real thoughts` is the modernisation that finding 1.1 asks for at XI.1. `an evidence of` → `evidence of`; `the diviner part` → `the more divine part`, right — Long's comparative survives only as a stiff literary form and the comparison itself is the sense. `thou shalt reproach thyself` → `you reproach yourself` (clause of time; the "shall" rule). Cross-reference dropped with a stop supplied. The four aberrations keep their numbering and the fourth keeps its whole apparatus of "the less honorable and to the perishable part, the body, and to its gross pleasures".

### B11-P020 — XI.20
No material issue found. `the disposition of the universe` → `the ordering of the universe` is the paragraph's best decision and is well argued: "disposition" now means temperament, which is the very sense Long uses two sections earlier ("a good disposition", XI.18), and "ordering" is Long's own word for this at IX.1. `perforce` → `of necessity`, Long's own phrase at XI.8. `the universal` ×2 → `the whole` (glossary, the Book VI extension) and the "shall" removed from the temporal clause. `movement` → `impulse` in the *hormē* sense while XI.2's physical "movement" stays — the glossary line drawn exactly where the row draws it. `the ruling faculty` → `the ruling part` while `your intelligent part` stays distinct, as X.8 does. `comprehended under the generic term` → `included under the general term` — "generic" now means unbranded, and this is the VI.9 "comprehend" case again, consistent with XI.1. `[the body]` folded as an apposition, which is the book's one added comma.

### B11-P021 — XI.21

**Finding 21.1 (minor).** Current, first sentence: `He who has not one and always the same object in life, cannot be one and the same all through his life.` Current, last sentence: `For he who directs all his own efforts to this object will make all his acts alike…`. Long has a comma in both. The candidate **removes the subject–verb comma in the last sentence and keeps it in the first**, in the same paragraph, in two sentences of identical construction — a `He who …` subject, long, followed directly by its verb. `continuity.md` lists the removal (with XI.10's) and does not mention the retention, so the inconsistency is not a recorded decision. **Proposed correction:** remove it in the first sentence too — `He who has not one and always the same object in life cannot be one and the same all through his life.` — and add it to the punctuation tally, which then reads three subject–verb commas removed rather than two. (The opposite route — restoring both — is also internally consistent, but it would break with X.6 / X.20 / X.33.) Confidence high that the two must be decided alike; medium-high on which way, with the X-book precedent favouring removal.

*Also noted.* `[social]` dropped under D11 — right, the X.2 case exactly, and Long's primary words "of a common kind" stand immediately before "political", which answers most of the opacity worry. `the common interest` → `the common good` (glossary). `an object which shall be` → `which is` (the "shall" rule, the X.1 positive-consecutive case).

### B11-P022 — XI.22
No material issue found. Byte-identical to Long, and correctly: nothing archaic, nothing bracketed, nothing glossed. The town mouse and the country mouse are left to do their own work, which is the whole meditation.

### B11-P023 — XI.23
No material issue found. Comma before dash removed. **Long's own gloss "bugbears to frighten children" correctly kept** — it is in his text, unbracketed and not in a footnote, so it is not apparatus and the bracket rules do not reach it. Dropping it would have deleted Marcus's own explanation of Lamiae.

### B11-P024 — XI.24
No material issue found. Byte-identical to Long, correctly. "Lacedaemonians" kept in Long's spelling under D6, as X.27's Latin name forms were; it is current in a classical context and any substitution would be an editorial choice the package does not make.

### B11-P025 — XI.25
No material issue found. Byte-identical to Long, correctly. "I would not perish by the worst of all ends" reads in current English as the refusal Long means; "would not" needs no help.

### B11-P026 — XI.26

**Finding 26.1 (minor).** Current: `…this precept, constantly to think of one of the men of former times who practiced virtue.` Long: `…constantly to think of **some one** of the men of former times who practiced virtue.` `continuity.md` files this under the X.36.2 ruling on "some one" → "someone" as a 1862 typographic convention. **That ruling does not reach this case.** At X.36 "some one" was the indefinite pronoun *someone*, printed as two words in 1862; here "some one of the men of former times" is a **partitive** — "one or another of them", indefinite as to which — and the X.36 normalisation would have produced the ungrammatical "someone of the men". The drafter, rightly seeing that, deleted "some" instead; but deleting it changes the sense, turning "one or another of the men of former times" into "one of the men", which reads as one particular man the precept has in mind. That is not Long's precept: the Ephesian rule is to keep *some* exemplar or other constantly before you. **Proposed correction:** `…this precept, constantly to think of one or another of the men of former times who practiced virtue.` — or simply keep Long's "some one of the men", which is still readable modern English. Either restores the indefiniteness; what should not stand is the bare "one". Confidence high on the class error, high on the sense.

*Also noted.* `[Ephesians]` folded as a mark of textual doubt — confirmed above, with the reasons; Gataker's conjecture correctly left out as apparatus.

### B11-P027 — XI.27
No material issue found. `nudity` → `nakedness` is right and is already the edition's word for Long's same noun at III.11: "nudity" is now almost exclusively of human bodies, which is not the sense of stars. Long's own closing explanation, "For there is no veil over a star", correctly kept — it is his text, not a gloss.

### B11-P028 — XI.28
No material issue found. Byte-identical to Long, correctly. Nothing archaic; Xanthippe, the cloak and the skin are left as they are, and the sentence deliberately withholds what Socrates said, which is the meditation.

### B11-P029 — XI.29
No material issue found. `wilt thou be able` → `will you be able`; `before thou shalt have first learned` → `before you have first learned` (clause of time, present perfect for future time; the "shall" rule). "Much more is this so in life" left at Long's length and in his inversion, correctly — it is current and it is the sting.

### B11-P030 — XI.30
No material issue found. `A slave thou art` → `A slave you are` keeps Long's fronted complement, which is right: the fronting is the taunt, and "You are a slave" would flatten it. Eleven words against eleven.

### B11-P031 — XI.31
No material issue found. `Odyssey, ix. 413.` dropped as apparatus, on the V.33 Hesiod precedent; Long's line stands word for word, and its 0.667 ratio is the three-word citation and nothing else. No stop needed — Long's line already carries one.

### B11-P032 — XI.32
No material issue found. `HESIOD, Works and Days, 184.` dropped, as XI.31. Ratio 0.643, entirely the five-word citation. "And virtue they will curse, speaking harsh words" is untouched, inversion and all.

### B11-P033 — XI.33
No material issue found. `mad-man's` → `madman's` (X.36.2, correctly within its class here — a hyphenation, not a construction). Epictetus reference dropped with a stop supplied; confirmed above. "To look for the fig in winter" kept exactly, which is the line the section is remembered for.

### B11-P034 — XI.34

**Finding 34.1 (optional).** Current: `he should whisper to himself, "Tomorrow perchance you will die."` Long: `"To-morrow perchance thou wilt die."` `perchance` is **kept** here and **modernised to "perhaps" at XI.16**, on the IX.3 precedent that heightened quoted speech keeps it. I uphold the distinction — the whisper is a formal quotation inside a quotation and its solemnity is its point — but it is the weakest instance of the IX.3 precedent in the package so far: IX.3 is Marcus's own heightened cry, where this is a father's murmur to himself, reported by Epictetus, reported by Marcus. **Proposed correction (drafter's discretion, and I would leave it):** either keep as drafted, or render `perhaps` and note the retreat from IX.3. If it is kept, `continuity.md` should say *why this counts as heightened speech* rather than only citing IX.3, because a Book XII drafter meeting a third case will have only the citation to go on. Confidence low on any change; medium that the reason wants one more sentence.

*Also noted.* `To-morrow` → `Tomorrow` (X.36.2). The Epictetus citation dropped and the stop it carried supplied **inside** the closing quotation mark, which is correct — the sentence ends there, and a stop outside would have left the quotation unclosed. Long's dashes round "But those are words of bad omen" kept exactly, so the three-voice exchange still reads as an exchange.

### B11-P035 — XI.35
No material issue found. `which exists not yet` → `which does not exist yet` — the same modernisation finding 1.1 asks for at XI.1. PG's `are all changes` followed under D6 (base-text ruling 8). Epictetus citation dropped with a stop supplied. The three grapes keep their order and their asyndeton.

### B11-P036 — XI.36
No material issue found. Epictetus citation dropped with a stop supplied. "No man can rob us of our free will" left at Long's ten words; "free will" is his phrase and is kept. The 0.714 ratio is the four-word citation and nothing else.

### B11-P037 — XI.37
No material issue found. Two D11 drops, both right: `[or rules]` is the III.6 "[or, practically]" shape exactly, Long's own "or" included, and `[aversion]` is his second English word for *ekklisis* beside "avoidance", which stands unaided and is transparent. `movements` → `impulses` (the *hormē* sense). The two archaic subjunctives `that they be made … that they be consistent` → `are`, decided as at XI.16. `assent` kept (glossary). Epictetus named in the body and kept, which is what makes the dropped citations harmless.

### B11-P038 — XI.38
No material issue found. Byte-identical to Long, correctly. "The dispute then, he said, is not about any common matter, but about being mad or not" needs nothing.

### B11-P039 — XI.39
No material issue found. Byte-identical to Long, correctly — and this is the paragraph where identity is most obviously right: Socrates's six turns, the dashes that carry them, "souls of rational men or irrational" (Long's own phrase, kept under the corrected glossary row), and the unpunctuated final question are the meditation. "What do you want" is Long's genuine plural, not a thou-form, and is correctly untouched.

---

## Chapter-level findings

**Finding C1 (minor, records).** `book11/README.md`, `continuity.md`, `provenance.json` and `PROVENANCE.md` §4 all say "**all five** `[Greek: …]` spans are inside indented footnote bodies". **There are seven spans, on five lines** (6398 ×1, 6554 ×2, 6555 ×1, 6702 ×1, 6757 ×2). The material claim is right — every one of the seven is inside an indented footnote body, and the staged Book XI contains no `(Greek:` at all, which I verified directly — but the numeral counts lines and calls them spans. **Proposed correction:** "all seven `[Greek: …]` spans, on five indented footnote lines". Confidence high; this is a count, not a judgement. It matters because the step-1 check is the package's defence against a Book VII-class leak, and its numbers should be reproducible by anyone re-running the audit.

**Finding C2 (minor, records).** `PROVENANCE.md` §4, `continuity.md`, `README.md`, `provenance.json` and `00-progress-ledger.md` all say the newly documented space-before-punctuation rule "fires in exactly **five lines in the whole translation body** — 3156 (IV.19), 3779 (V.29), 4712 (VII.58), **4889 (VII.66)** and 6645 (XI.18)". **PG line 4889 is not in the translation body.** It is inside an indented footnote of Long's — `    things ... principle." I do not exactly know what he means by` — four spaces, part of the long note whose body runs through 4885–4900 and which the build strips before any normalisation applies. I confirmed the consequence in the staged file: **VII.66 contains no ellipsis at all.** So the rule fires on **four** lines of the translation body (IV.19, V.29, VII.58, XI.18) and once more inside a footnote that never reaches the staged original. This *strengthens* the "changes no word" conclusion and changes no ruling, but the claim as written is checkable and wrong, and the next reviewer will check it. **Proposed correction:** "fires in exactly four lines of the translation body — 3156 (IV.19), 3779 (V.29), 4712 (VII.58) and 6645 (XI.18) — and once more at 4889, inside a Book VII footnote body that the build strips", in all five files.

**Finding C3 (minor, records).** The space-before-punctuation rule should be given **its own ledger decision row (D14)**, not left as a bullet in `PROVENANCE.md` §4. Reasons set out in the ruling above: §4 is a list of normalisations, the ledger is where the package keeps rulings a later agent must find, every comparable apparatus question got a row (D5, D11, D12, D13), and a rebuild that silently dropped this rule would reintroduce " ..." into four places in the staged original and break the byte-identity guarantee D12 depends on. **Proposed row:** *D14 — A space before `,` `;` `:` `.` `?` `!` is closed up by the build. It fires only at Long's ellipses marking lacunae in the Greek (IV.19, V.29, VII.58, XI.18), changes no word, and is a typographic normalisation of the em-dash class, so it is documented rather than rebuilt out and must be preserved by any future rebuild; any reconstruction used to verify the staged original reproduces it, so that the two are compared on the same rules.* Confidence high.

**Continuous read.** I read `candidate-v1-readable.md` straight through after the packets. The voice is Marcus's throughout: compact, personal, self-addressed, with no turn toward advice for a reader, no moral lesson, no motivational register and no explanation aimed at a modern audience anywhere in the thirty-nine sections. XI.18's nine rules are the place where the pull toward self-help prose is strongest in the whole package, and the candidate does not yield to it once — the rules stay numbered assertions in the second person singular, not steps. Where Long has "we" and "us" (XI.16 throughout, XI.18's "it is our own opinions which disturb us", XI.27's "the Pythagoreans bid us") the candidate keeps them and introduces no "we" where Long has "thou". Pacing survives: the long argumentative sections (XI.1, XI.6, XI.8, XI.16, XI.18, XI.19, XI.20, XI.21) still run long, and the closing run of Epictetus fragments and one-line meditations (XI.29–XI.38) still lands as an accelerating tempo change, which is much of what Book XI is. Terminology is stable across the book: "the whole" and "the universe" never drift into each other, "the ruling part" and "the intelligent part" stay distinct, "impulse" and "movement" are used on the glossary's line and not interchangeably, "resent" never varies to "be annoyed", and "opinion" is never expanded. No repetition that Long makes deliberate has been varied away, and no transition has been smoothed in. **No further chapter-level finding.**

---

## Summary for the drafter

**Verdict: Accept after corrections.** Nothing in the thirty-nine paragraphs is missing, added, softened, expanded, mistranslated or imported, and there is no substantive finding. To close the round:

1. **1.1** — `differs not at all` → `does not differ at all` at XI.1, the book's one surviving archaic finite negative.
2. **18.1** — `greatly resentful` → `deeply resentful` at XI.18.
3. **26.1** — restore the indefiniteness at XI.26 (`one or another of the men of former times`, or keep Long's `some one of`), and note that the X.36.2 ruling does not reach a partitive.
4. **21.1** — decide XI.21's two subject–verb commas alike; removal is the X-book precedent.
5. **19.1** — fix the dangling "see the flagged decisions" for XI.19's `the superior faculty` in both places in `continuity.md`; the rendering itself stands.
6. **C1** — seven Greek spans on five lines, not five spans, in four files.
7. **C2** — four body firings of the space-before-punctuation rule, not five; PG 4889 is inside a footnote and VII.66 has no ellipsis. In five files.
8. **C3** — add **D14** to the ledger for the space-before-punctuation rule.
9. Optional, drafter's discretion: **12.1** (XI.12 `nor sinks down` — change to `nor sunk down` or log it beside II.5), **15.1** (XI.15 `at once` → `instantly` — I would take it), **34.1** (XI.34 `perchance` — I would leave it and add one sentence of reason).

**The source verification holds and the no-rebuild finding is correct**, tested by an independently written reconstruction and then by a rule-by-rule audit against the raw range. The six-space verse and the four-space footnotes are separated by indentation and by flush-left text in every case, so the consumption rule cannot have swallowed Long's XI.6 quotations; the eleven markers reconcile with the eleven openers, including the one at the end of the indented verse line 6442. **The space-before-punctuation rule is rightly reproduced and rightly documented rather than rebuilt out, and should also be a decision of its own.** The "shall" audit is consistent in all three kinds. **D13 genuinely does not fire anywhere in Book XI**, tested bracket by bracket against its own voice-and-subject test. The 0.977 ratio is apparatus and nothing else, verified paragraph by paragraph: the lowest apparatus-free paragraph is XI.7 at 0.964. The seven byte-identical paragraphs are each rightly identical. **All eight base-text calls are upheld, including "flattering" for PG's "nattering" — the one departure from PG's letters in the book, and the best-evidenced one in the package.**
