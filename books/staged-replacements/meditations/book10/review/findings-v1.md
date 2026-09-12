# Independent review — Meditations, Book X, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree `/tmp/claude-0/med-review-10` at commit `9301fad45`) |
| Candidate | `book10/candidate-v1.json`, sha256 `95ce5f7c67cb2ba7a2403c95d0b97b85827c35f4ab375cb98f5fbe9a11995c5d` — recomputed locally; matches `provenance.json`, `README.md` and the assignment |
| Source | George Long 1862, `book10/source-book10.json` sha256 `db635cde6d55681018839d302ebd165c329f265a27275b5c4a574256aeca7f8c` (matches), byte-identical to chapter 10 of `../meditations-original-en.staged.json` sha256 `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` (matches, the twice-rebuilt file, 487 paragraphs, Book 10 = 38); PG base `source/pg15877-long-1862.txt` sha256 `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` |
| Staged-original no-rebuild claim | **Verified independently, and it holds.** Not by re-running either script. PG lines 5866–6374 were re-extracted by my own listing of the range and the drafter's reconstruction was audited rule by rule rather than trusted for its output. See `review/README.md` and the section below. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-13.md`, in order, three paragraphs at a time with the `CONTEXT ONLY` neighbours (coverage `B10-P001`…`B10-P038`, each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (including the "shall" rule as **widened at Book IX acceptance**, the in-text-Greek exception, and the two rows extended before Book X was drafted), `WORKFLOW.md`, `book10/review-instructions.md`, `book10/continuity.md`, `PROVENANCE.md` §4, `00-progress-ledger.md`; `book9/review/findings-v1.md` read first for format and calibration |

**Verdict: Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must fix before acceptance) | **0** |
| minor (worth improving) | **6** (five paragraph-level, one chapter-level) |
| optional (preference, no defect) | **5** |
| paragraphs with no material issue | **29** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Long's words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

**This is the cleanest book in the package so far as prose.** A token-level diff of all thirty-eight paragraphs shows that *every* difference between Long and the candidate is accounted for by a documented decision — a thou-form, a modernised verb form, a glossary row, a bracket fold, a dropped cross-reference, a listed punctuation change, or a per-paragraph decision in `continuity.md`. Nothing is missing, nothing is added, nothing is softened, nothing is expanded, and nothing is imported. The complete list of words the candidate uses that do not occur anywhere in Long's Book X is eleven, and every one is documented: *pleases, preservation, breathed, particular, resentful, beg, falling, single, calm, wake, apart, flees, accordance, perhaps* (plus the you-forms). There is no substantive finding. The six minor findings are: one undocumented punctuation change, one bracket classified against the package's own D11 test, one typographic repair inside a quotation, one ledger entry the package needs, one wording preference at X.32 where I rule against the drafter, and one arithmetic error in the package's own records.

---

## Verification performed before reading

### Hashes and mechanical checks

All four hashes recomputed locally; all four match. The mechanical-check block in `book10/README.md` was re-run verbatim and printed `OK` with the three expected hashes. It covers `source-book10.json` byte-identity to chapter 10 of the staged original; 38 candidate paragraphs one-to-one and each numbered `n. `; the 487-paragraph twelve-chapter shape with 38 in Book 10; no `[Illustration` and no footnote opener or footnote-content string anywhere in the staged file; X.34's Homer verse present and the footnote-[B] Odyssey quatrain absent; packet coverage exactly `B10-P001`…`B10-P038`; packet and readable-copy text identical to the JSON; the four dagger clauses; no bracket and no cross-reference surviving in the candidate; the folds spot-checked; the "shall" inventory; and the base-text points.

### The no-rebuild claim, checked the strong way — and the reconstruction itself audited

The assignment is explicit that byte-identity to a re-run proves nothing, and I took the further step the assignment asked for: **a reconstruction that shares a blind spot with the build also proves nothing**, so I audited `scripts/verify_book10_source.py`'s *rules* against the raw PG range before I looked at its output.

The script's rules are: take lines 5866–6374 (asserting `X.` at 5865 and `XI.` at 6375); drop `[Illustration…]` lines; drop an **indented** block whose first line opens `[A-D] `, consuming every following blank-or-indented line until flush-left text resumes; strip remaining `[A-D]` markers; `[Greek: …]` → `(Greek: …)`; `--`/`---` → em dash; drop underscores; split on blank lines; **join any block that does not open with `N. ` onto the block before it**; prefix `1. ` to the first block. Daggers are deliberately **left in** so they show as diffs.

Three of those rules can fail silently, and each was tested against the raw text rather than against the script:

1. **The footnote-consumption rule can swallow Long's own indented verse** if a verse block follows a footnote with only blank lines between. I listed every maximal indented run in the range independently and printed its indentation profile. There are **twelve** indented runs. Eleven are footnote runs, every line indented **four** spaces (the footnote-[B] Odyssey quatrain inside run 6009–6036 at **seven**). The twelfth, **6305–6307, is indented five spaces, contains no footnote opener, and is not adjacent to any footnote run** — the nearest preceding run ends at 6269 and the nearest following opens at 6319. So Long's Homer couplet cannot have been swallowed, and it is not: it is in the reconstruction and in the staged text. This is exactly the pairing the assignment asked me to look at, and the two verse blocks are separated by indentation (5 vs 7) *and* by containment, not by a guess.
2. **The "join a block that does not start with a number" rule can silently absorb a page number, running head or catchword** instead of exposing it. It cannot hide one, though: absorbed text would appear as an extra word in a paragraph and would show as a diff against the staged file. None did. Independently, I looked for standalone short flush-left lines in the range and found **none at all** — so there is no running head, page number or catchword, and the drafter's "exactly one standalone flush-left line (the `X.` header)" is off only in that the header sits at 5865, *outside* the reviewed range; inside the range the count is zero. No consequence.
3. **A flush-left footnote body of the VII.45 kind would be read as Long's text.** That is the point of the method, and it is a true test: such a body would show as an inserted paragraph or inserted words. None did. I also counted the markers directly: **16** `[A-D]` markers in flush-left lines, **1** more at the end of the indented verse line 6306 (`So is the race of men."[A]`), **17** indented footnote openers (5886, 5968, 6009, 6015, 6050, 6054, 6077, 6082, 6158, 6172, 6188, 6257, 6264, 6268, 6319, 6353, 6370). 16 + 1 = 17 markers for 17 footnotes, in eleven runs. **The drafter's class-by-class account is exactly right, including the seventeenth marker inside the verse.**

Running the script then reproduces its claim: 38 reconstructed paragraphs, count match, and **four differing paragraphs — X.9, X.19, X.25, X.31 — each differing only by one `+`**, the four dagger marks `PROVENANCE.md` §4 documents. Boundaries checked by eye: 5865 `X.`, 5868 the unnumbered opening "Wilt thou, then, my soul…", 6368 the last words of X.38, 6370 the closing footnote, 6375 `XI.`. `git status` is clean.

**The claim holds. No rebuild is needed and no accepted book is reopened.**

### Bracket arithmetic, recounted from the source

I extracted every square-bracket span in Book X rather than trusting the count. There are **eighteen**, in twelve paragraphs: X.2 ×1, X.6 ×2, X.7 ×4, X.8 ×1, X.11 ×1, X.13 ×1, X.15 ×2, X.21 ×1, X.23 ×1, X.31 ×1, X.32 ×1, X.33 ×2. **Eighteen is right.** The dispositions, however, are **fifteen folded, two dropped under D11, one dropped as a translator's note** — not sixteen folded. See finding **C1**.

### The "shall" audit — all 23, one at a time

Long has 23; the candidate keeps 6 and removes 17. I checked every one against the widened rule.

**Kept (6) — all licensed.** X.6's five "I shall" are first person, which the rule names explicitly (II.1, VIII.45); they are plain futures, but the rule keeps first-person "shall" regardless of function because it is current English in its own right. X.36's "that there **shall not be** by him … some who are pleased" is the negative consecutive subjunctive of the VIII.32 class; "there will not be" would turn the shape of the claim into a forecast about every man. Correct.

**Removed (17) — all correctly removed, and the two hard ones are right.**
Plain futures in statements or relative clauses taking "will": X.1 "wherein thou shalt have longer enjoyment" → "in which you will have"; X.8 "where thou shalt maintain them" → "where you will maintain them"; X.25 "or shall be" → "or will be"; X.33 "such shall be to thee" → "such will be to you"; X.34 "those who shall receive" → "who will receive"; X.34 "thou shalt close thy eyes" → "you will close your eyes".
Conditional, temporal and indefinite-relative clauses taking the plain present or present perfect: X.1 "whatever shall please them" → "whatever pleases them"; X.1 "whatever they shall give" → "whatever they give"; X.2 ×2 "shall not be made worse by it" → "is not made worse by it"; X.8 "if thou shalt perceive" → "if you perceive"; X.31 "until thou shalt have made" → "until you have made"; X.32 "whoever shall think" → "whoever thinks"; X.32 "unless thou shalt be such" → "unless you are such".
The two questions: **X.11's indirect "what any man shall say or think about him"** → "will say or think" is right. A deliberative question asks what *is to be done*; this asks what men will in fact say, and Marcus's point is that the contemplative man does not attend to it. **X.32's direct "who is he that shall hinder thee"** → "who is he that will hinder you" is also right, for the same reason: it is a rhetorical future, not "what shall be done". The widened IX.41 clause does not reach either. Book X contains no deliberative question at all, direct or indirect, so the widened wording never fires here — which the drafter says, correctly.
**One case worth naming because it is the rule's edge.** X.1's "be such that thou **shalt** so dwell in community" is a *consecutive* clause, the same clause type as X.36's, and it was removed while X.36's was kept. The distinguishing feature under the rule as written is the negative — X.36 is "shall **not** be", X.1 is positive — and the candidate's recast ("be such that you live in community … in such a way as") sidesteps the question by using the plain present, which is what the rule directs for a subordinate clause of this kind. So the two are consistent under the rule's letter and under its spirit. No finding.

**Verdict on the audit: the line is drawn consistently, in all three kinds, and Book X adds no new case to the three third-person plain futures already recorded in the ledger under "Open, not blocking".**

### Ruling on the word ratio and on the five identical paragraphs

Book ratio **0.9943** (4,537 → 4,511), recomputed. Minimum **0.88 at X.23**: I ruled on it directly rather than accepting the explanation. X.23's source is 66 words of which nine are the bracketed translator's note; with the note set aside the meditation is 57 words against the candidate's 58 (ratio 1.02), and every clause, the three places ("the top of a mountain, or on the sea-shore, or wherever you choose to be") and Plato's sentence entire are present. **The 0.88 is entirely the dropped note. There is no compression anywhere in the book.** The next two lowest, X.5 (0.90) and X.13 (0.951), are likewise dropped cross-references and nothing else. Maximum 1.077 at X.29 is the two words of "One by one" for "Severally".

**The five byte-identical paragraphs are a real result, not an omission.** I checked each against the accessibility standard on its own: X.16, X.17, X.18, X.19 and X.35 contain **no thou-form, no archaic verb inflection, no glossary term needing a row, no bracket, no cross-reference and no dagger-affected wording** (X.19's dagger falls between "imperious" and "and arrogant", where the candidate changes nothing). Long's English in those five is already the modern edition's English. Leaving them identical is correct; changing them would have been the error.

### Nothing imported from other translations

The eleven-word list of new vocabulary above is itself the strongest evidence: a candidate that borrowed phrasing would show clusters of words Long does not use. There are none. I checked the seven passages most likely to attract a familiar modern rendering — X.1 "more plain to see than the body which surrounds you", X.8 "what does the work of a fig-tree is a fig-tree", X.15 "Live as on a mountain", X.16 "but be such", X.17 "the turning of a gimlet", X.34 "Leaves, also, are your children", X.38 "this which pulls the strings" — and each keeps a Long-specific turn that Hays, Farquharson and Staniforth do not have. **No import found anywhere.**

---

## Rulings on the items referred to the reviewer

**1. X.23's bracketed translator's note dropped as apparatus — UPHELD, and yes, it needs a decision entry of its own.** "[The three last words are omitted in the translation.]" is not a supplement to Marcus's sentence and not a second rendering of a word: it is George Long, in his own voice, telling his reader what he did with Plato's Greek. It is the same species as a cross-reference and a footnote, both of which this package drops, and folding it would be absurd — it would have Marcus say that three words are omitted from a translation he did not write. Standard Ebooks' omitting it corroborates without deciding. **Drop it.** But the classification does need its own row: D11 as worded covers only "bracketed *alternative renderings*", and the glossary's bracket rule covers supplements, cross-references and verse citations. A translator's note about the translator's own practice is a **third** kind, and a drafter of Books XI–XII reading D11 literally would have no rule for it. See finding **23.1**.

**2. X.21's "[is wont]" folded rather than dropped — CONFIRMED.** In form it is a D11 case; in substance it is not. The meditation is that one Greek verb carries both senses: common speech says a thing "loves" to be produced where it means the thing "is wont" to be produced, and Long's bracket is the only place in the English where the second sense exists at all. Dropping it does not remove a note about Long's choices; it deletes the observation the section is made of, leaving "And is not this too said that 'this or that loves to be produced?'" — a sentence with no point. That is exactly the VII.13 / VIII.57 principle in another form. **Fold, as drafted.** The *execution* needs a small repair; see finding **21.1**.

**3. X.2 "[social]" and X.33 "[order]" dropped under D11 while the rest are folded — the line is drawn consistently, with one exception.** The operative test, stated in the drafter's own reasoning, is: *does the meditation's point survive the drop?* X.2's ladder of natures survives with "a political being" (and "social" would in any case now be the glossary's rendering of a different row); X.33's chain survives with "law", which Long then uses four more times, so a single folded "order" would dangle. X.21's point does not survive. That is a principled line and I endorse it. **The exception is X.15's "[political community]", which is the same shape as "[social]" — a second English rendering of one Greek word beside Long's primary "state" — and was folded, not dropped.** See finding **15.1**.

**4. X.15 "Let me see" → "Let men see" — UPHELD.** Four independent grounds converge: the clause is one half of a parallel pair with "let them know" and changing subject mid-pair is motiveless; "them" is left without an antecedent under "let me see"; the section is about how Marcus is seen by those among whom he lives, not about what he sees; and a dropped single letter is the commonest class of transcription slip. Standard Ebooks reads "men". Same class as VIII.37 "Fergamus"/"Pergamus" and IX.34 "pool souls"/"poor souls", both upheld at round 1. **Keep "Let men see"**, and keep it recorded as the one departure from PG's letters in Book X.

**5. X.9 "Mimi" kept untranslated — UPHELD, and no gloss exception is warranted.** It is Long's text, not apparatus: he prints the Latin genre name and explains it only in a footnote this package drops. "Mimes" would import the footnote's content *and* mislead, since a modern "mime" is a silent performer rather than the broad farce Marcus means. A bracketed or appositive gloss would be the imported-footnote content the no-glosses rule exists to prevent, and Book X has no continuity-sheet gloss slot spent elsewhere that would justify spending one here. The reader meets an unfamiliar proper noun in a list of five distractions and takes it as a kind of show, which is close enough to right. **Keep "Mimi", ungloss'd**, on the IX.2 "the next best voyage, as the saying is" precedent.

**6. X.32's vocative-comma imperative — REJECTED; I rule for the other option, modified.** See finding **32.1**. The IX.40 repair earned its vocative because that passage is an *alternation* ("One man prays thus: … You, pray thus: …"), where the fronted pronoun does the rhetorical work of setting Marcus's turn against the other man's. X.32 has no such contrast, so the fronted "You," carries nothing and reads as a summons to a stranger; worse, "You, only determine" invites the misparse "only you determine". Long's emphasis here is carried by "only", which survives untouched.

**7. Long's comma inside the X.25 dagger clause — CONFIRMED, keep it.** "And he also who is grieved or angry or afraid, is discontented because…" The comma closes a long relative subject, which is ordinary nineteenth-century practice and creates no misreading for a modern reader — it is a rhythm mark, not a syntax error waiting to trip anyone. And it falls at the dagger, where the settled practice (VI.50, VII.16, VIII.51, IX.6/26/27) is that the clause stands as Long has it with only pronouns and glossary renderings changed. Removing it would be a stylistic change inside a dagger clause, which is the exact thing the Book VIII reviewer reverted. **Keep.**

**8. X.6 and X.36, PG right against Standard Ebooks — both CONFIRMED.** SE's "turn **an** my efforts" is not English and is plainly a transcription error for "all"; PG's "all" is also what the argument needs (Marcus is describing a total redirection, not a partial one). SE's "at **last** someone" puts "at last" twice inside eleven words — "at last someone to say … Let us at last breathe freely" — and flattens Long's concessive "at least some one" into a temporal. PG followed, correctly, in both.

**9. The "thou are" slip present in both texts — correctly invisible.** PG has it at X.32 "thou **are** not simple", SE at "thou **are** not good"; each text gets right the clause the other gets wrong. Both become "you are" under the thou-rule, so neither slip reaches the candidate and no base-text decision is needed. Recording it in `continuity.md` anyway is the right call: a later collator comparing the two texts would otherwise think one of them had been silently preferred.

**10. PG's Latin name forms at X.27 — CONFIRMED.** D6 governs, IX.29 already keeps "Philippus", and "Hadrianus / Antoninus / Philippus / Alexander / Croesus" is a consistent set as Long prints it. Modernising two of five would produce a mixed roll.

**11. SE's five typographic paragraph breaks ignored — CONFIRMED.** None is a section break: PG prints each section whole, no text differs on either side of any break, 38 is the standard section count for Book X, and a 39th or 43rd paragraph would break the 487-paragraph alignment the whole package is built on. Same ruling as IX.28.

**12. The three terms deliberately kept out of glossary rows — all three right.** X.7's "**the universal reason**" is Long's adjective + noun, of the same shape as "the universal nature", which the glossary keeps as its own term; converting it to "the reason of the whole" would invent a phrase Long does not use and would collide with the paragraph's own "the whole". X.8's "**the intelligent part**" is not one of the five variants the ruling-part row collects (ruling faculty / ruling part / ruling principle / that which rules within / leading principle) and names a different thing — the part that understands, elevated above sensation — so folding it into "the ruling part" would merge two of Long's distinctions. X.33's "**irrational soul**" is current English and Long's own. Keep all three.

---

## Findings by paragraph

### B10-P001 — X.1

**Finding 1.1 (minor).** Current: `1. Will you then, my soul, never be good and simple…`. Long: `Wilt thou, then, my soul, never be good and simple…`. The candidate removes Long's comma after the pronoun, leaving "then" unpaired inside the address. The removal is *right* — "Will you, then, my soul," would give four comma-separated fragments before the verb and now reads as fussy — but it is the **only punctuation change in Book X that `continuity.md` does not list**, and the sheet lists every other one exhaustively (four removed, one raised to a semicolon, two added). A later collator will find a sixth change and no record of it. **Proposed correction:** keep the wording and add the removal to `continuity.md`'s X.1 entry and to the punctuation tally. Confidence high on the gap; the wording itself needs no change.

*Also noted, no finding.* "More manifest than" → "more plain to see than" is right: "manifest" as a predicate adjective is stiff and, next to "naked", faintly clinical. "Conservation" → "preservation" is right for the reason given — "conservation" now names environmental care, the one sense Long cannot mean. The recast close ("such that you live in community with gods and men in such a way as neither to find fault with them at all, nor to be condemned by them") keeps Long's "so … as" correlative, both limbs of the "neither … nor", and the question mark. All five questions survive as questions, and the long third question keeps every one of its clauses and its "but".

### B10-P002 — X.2
No material issue found. The ladder of natures — governed by nature, a living being, a rational being, and so a political being — survives intact, and "a political being" is the glossary row extended before drafting. Both conditional "shall not be made worse by it" correctly take the plain present.

### B10-P003 — X.3
No material issue found. The four-fold "formed by nature to bear it" is kept entire, which is the meditation. "In such wise" ×2 and "in such way" ×1 all take "in such a way", which is right: Long's three spellings are one phrase.

### B10-P004 — X.4
No material issue found. "Blame not even thyself" → "do not blame even yourself" keeps the focus on "even yourself" rather than moving it to the verb, which "do not even blame yourself" would do. Ten words against Long's nine; no expansion.

### B10-P005 — X.5
No material issue found. Cross-reference dropped; the image of the implication of causes spinning the thread is untouched.

### B10-P006 — X.6
No material issue found. Both folds are necessary — without them neither limb of "Whether the universe is … or nature …" has a predicate. The five "I shall" are correctly kept. "The nature of the universe" → "the nature of the whole" is the glossary row and, standing among the paragraph's six plain "whole"s, sharpens rather than blurs Long's play of part and whole. The comma removed before "who continues a course of action" is right: Long's comma makes every citizen's life happy, which reverses the sentence.

### B10-P007 — X.7
No material issue found. Dropping the first-limb "whether" is right; the "or" carries the alternative unaided and "For whether did Nature herself design" is dead. All four folds are referent or qualifier supplements, not renderings. "Vexed" → "resentful", "contrary to nature" → "against nature", "peculiar quality" → "particular quality" (VI.3, VIII.12) and "inspired" → "breathed in" are all glossary or settled precedent. Keeping "from the airy to the aerial" is right: both words are current, the distinction is Long's, and rendering one would collapse a pair he meant to keep apart. The comma raised to a semicolon repairs a genuine comma splice. **Long's own footnote says the end of this section is perhaps corrupt and its meaning very obscure; the candidate makes it no clearer than Long, which is correct.**

### B10-P008 — X.8
No material issue found. The four names, their three definitions with Long's capitals, the half-devoured fighters, the islands of the Happy and the closing fig-tree/dog/bee all survive in order. "In order, however to the remembrance of these names" → "To remember these names, however" is the right repair of a construction that is no longer English, and Long's triple "remembrance / rememberest / rememberest" survives as a triple "remember". "Intreat" → "beg" and "hitherto" → "until now" are both required. Keeping "islands of the Happy" with its capital is right — it is transparent and it is Long's phrase for the Fortunate Isles.

*Also noted.* "If thou shouldst lose them" → "if you lose them" drops Long's contingent modal. It costs nothing here — the conditional is already contingent — and "if you should lose them" would be stiffer. No change wanted.

### B10-P009 — X.9

**Finding 9.1 (optional).** Current: `For when will you enjoy simplicity, when gravity, and when the knowledge of every single thing…`. Long has "gravity" and the candidate keeps it. The word is current, but its dominant modern sense is the physical one, and standing in a bare list beside "simplicity" it can read for a beat as the wrong noun. Long's sense is seriousness of bearing. **Proposed (optional) correction:** leave it. I raise it only so the decision is on the record: the alternatives ("seriousness", "weight") either flatten a word Marcus uses as a virtue-name or import a reading, and the list's parallelism ("when simplicity, when gravity") recovers the sense within two words. Confidence medium; I would not change it.

Otherwise no material issue. The dagger falls at a sentence boundary and affects no clause. The seven-part closing question keeps all seven members and their order. "Mimi" upheld above.

### B10-P010 — X.10
No material issue found. The catch-list — fly, hare, fish, boars, bears, Sarmatians — is untouched, and the sting of the last item is left to work without a note, which is right.

### B10-P011 — X.11
No material issue found. "[Of philosophy]" is a referent fold. "What any man shall say or think" → "will say or think" is correctly read as a plain future rather than a deliberative indirect question. Long's dash before "with acting justly" is kept.

### B10-P012 — X.12
No material issue found. "Tranquil" → "calm" is the glossary. Keeping Long's emphatic "if you **do** fail" is right — the auxiliary is current and the emphasis is his.

### B10-P013 — X.13
No material issue found. Two cross-references dropped; the single long question survives as one question with its mark where Long puts it.

*Also noted, no finding.* "…fidelity, modesty, truth, law, a good god within—happiness?" The em-dash apposition closing a comma list closing a question is the busiest piece of punctuation in the book, and I looked hard at it. It is nonetheless the right solution: a comma ("a good god within, happiness?") would read as a sixth list item, and parentheses would reintroduce the apparatus look the package removes. It follows VII.17 as the extended glossary row requires. No change.

### B10-P014 — X.14
No material issue found. Nature's two-clause address is left as Marcus reports it, and the answering sentence keeps "not proudly, but obediently".

### B10-P015 — X.15

**Finding 15.1 (minor).** Current: `…if he lives everywhere in the world as in a state, a political community.` Long: `…as in a state [political community].` This bracket is folded, but by the package's own D11 test it is the same shape as X.2's "[social]", which is dropped: a second English rendering of one Greek word (*polis*) beside the primary rendering Long has already given, and the meditation's point — that the world is the community one lives in, so place is indifferent — survives the drop entirely. Long then uses neither word again in the section, so the X.33 "[order]" objection (that the primary word recurs and a folded gloss would dangle) does not save it either. **This is the one place where I think the D11 line is drawn inconsistently.** Proposed correction: drop it under D11 — `…if he lives everywhere in the world as in a state.` — and list it with X.2 and X.33 in `continuity.md`.

*Plausible alternative reading, and why I still call it a finding.* "Political community" can be read not as a second rendering of "state" but as a *supplement* telling the reader which sense of "state" is meant — a civic community, not a nation-state — in which case folding is correct and this is a supplement of the X.33 "[our life]" kind. That reading is available and is probably what the drafter had in mind; the glossary's own row ("political community" as its own term) leans that way too. But the same defence would save "[social]" at X.2, and it was not allowed to. **Either disposition is defensible; what is not defensible is the two being decided differently without a stated reason.** So: drop it, *or* keep the fold and add one sentence to `continuity.md` distinguishing it from X.2. Confidence medium on the substance, high that the package must choose one and say so.

*Also noted.* "[As men do]" folded is right — it completes "to live thus" and without it the comparison has no second term. "Let men see" upheld above.

### B10-P016 — X.16
No material issue found. Byte-identical to Long, and correctly so: no thou-form, no archaic word, nothing to modernise. "No longer talk at all about the kind of man that a good man ought to be, but be such" is already the modern edition's sentence.

### B10-P017 — X.17
No material issue found. Byte-identical, correctly. "Gimlet" kept: the word is current, the tool is a small boring tool, and a whole life as one turn of it *is* the meditation — a gloss would explain the image away.

*Also noted.* "A grain of a fig" is an odd phrase in modern English (Long means a fig-seed), but it is Long's, it is not obscure in context beside "the whole of substance", and replacing it would be a rewriting, not a modernising. Leave.

### B10-P018 — X.18
No material issue found. Byte-identical, correctly. "Putrefaction" is current and exact; "decay" would soften it.

### B10-P019 — X.19
No material issue found. Byte-identical, correctly — including the dagger-marked clause, where the dagger falls between "imperious" and "and arrogant" and the candidate changes nothing. The clause stands as Long has it, which is the VI.50 / VII.16 / VIII.51 practice.

### B10-P020 — X.20
No material issue found. The comma removed before "which the universal nature brings to each" is right and necessary: the relative is the whole claim, and Long's comma turns it into an aside that would let the sentence assert that everything is for each thing's good.

### B10-P021 — X.21

**Finding 21.1 (minor).** Current: `And is not this too said that "this or that loves—is wont—to be produced?"` Long: `And is not this too said that "this or that loves [is wont] to be produced?"`. The fold is right (confirmed above), but the execution puts Long's gloss **inside the quotation marks**, so the candidate now attributes to common speech words common speech does not use. Long's brackets were the universally understood signal "not part of the quoted text"; em dashes are not, and removing the brackets removed the signal. The meditation depends on the quoted saying being exactly what people say, with the second sense supplied *from outside* it.

**Proposed correction**, which keeps every word, Long's order, his quotation marks and his question mark where he puts it:

> And is not this too said that "this or that loves"—is wont—"to be produced?"

**Alternative if the drafter would rather not split the quotation:** leave the wording and add a line to `continuity.md` noting that the dashes stand inside the quotation because Long's brackets do, and that the gloss is not claimed as part of the saying. I prefer the repair. Confidence high on the defect; medium on which repair is best.

*Also noted.* "I love as you love", addressed to the universe, is right — Long's "I love as thou lovest" is second-person address to the universe itself, not to Marcus, and the you-form keeps it.

### B10-P022 — X.22
No material issue found. The three-limbed disjunction and "But besides these things there is nothing" are untouched, and "Be of good cheer, then" keeps its position.

### B10-P023 — X.23

**Finding 23.1 (minor, process).** The drop of "[The three last words are omitted in the translation.]" is **right** (ruled above), but the package has no decision row that covers it. D11 covers bracketed *alternative renderings*; `GLOSSARY.md`'s bracket rule covers *supplements* (folded), *cross-references* and *verse citations* (dropped). A **translator's note about the translator's own practice** is a third kind, and this is the first time it has arisen. A drafter working Books XI–XII from D11's letter would have no rule, and the natural mistake — folding it — would put a sentence about the translation into Marcus's mouth.

**Proposed correction:** add a row to `00-progress-ledger.md`, e.g.

> **D13** — Long's bracketed *translator's notes* about his own handling of the Greek ("[The three last words are omitted in the translation.]", X.23) are apparatus of the cross-reference and footnote kind and are dropped, not folded. They are neither a supplement to Marcus's sentence nor a second rendering of a word; folding one would make Marcus comment on a translation he did not write. Each drop is listed in the book's `continuity.md`. Raised at the Book X round-1 review.

and cite D13 rather than D11 in `book10/continuity.md`'s X.23 entry. Confidence high.

Otherwise no material issue: Plato's sentence is kept exactly as Long gives it, unmarked and unexplained, and the three places are all present.

### B10-P024 — X.24
No material issue found. "Ruling faculty" → "the ruling part" is the glossary; "rent asunder" → "torn apart" follows IX.9 and IX.23. The six questions keep their asyndeton and Long's lower-case openings after the question marks, which is right — they are one breath.

### B10-P025 — X.25
No material issue found. "Flies" → "flees" is necessary (a modern "flies from" reads as aviation) and follows VII.71, VIII.48, IX.2. "Dissatisfied" → "discontented" is the glossary. "Or shall be" → "or will be" is a plain future. Long's comma after "afraid" kept — confirmed above.

### B10-P026 — X.26
No material issue found. "In fine" → "in short" follows IX.40. Both exclamations kept as exclamations; the cross-reference dropped.

### B10-P027 — X.27
No material issue found. The Latin name forms are upheld above; the roll of courts keeps Long's order and his closing "only with different actors".

### B10-P028 — X.28
No material issue found. "The rational animal" → "the rational being" is the glossary. The pig that kicks and screams and the man on his bed are left adjacent with nothing added to join them, which is right — Long's "Like this pig also is he" is the only bridge and it is kept.

### B10-P029 — X.29
No material issue found. "Severally" → "One by one" is right: the distributive adverb survives in modern English only in the legal formula. The two added words are the paragraph's whole difference and are why its ratio is 1.077; a twenty-six-word meditation is still a twenty-eight-word meditation.

### B10-P030 — X.30
No material issue found. "Forthwith" → "immediately" is Long's own word elsewhere. Keeping "in what like manner you err yourself" is right — the point is that the fault is of the same kind, which "in what way" would lose.

### B10-P031 — X.31
No material issue found. The nine names and their pairings are untouched and unexplained, which is correct: Long's footnote saying that nothing is known of several of them is apparatus and is rightly not imported. "[For thy activity]" is a referent fold; "until you have made these things your own" is the correct temporal-clause treatment. The dagger after "the Socratic," changes nothing in the candidate.

### B10-P032 — X.32

**Finding 32.1 (minor).** Current: `You, only determine to live no longer unless you are such.` Long: `Do thou only determine to live no longer unless thou shalt be such.` The vocative comma is borrowed from the IX.40 repair, but the two passages are not alike. **At IX.40 the fronted pronoun does rhetorical work**: the passage is an alternation ("One man prays thus: … You, pray thus: … Another prays thus: … You, pray: …"), and the comma preserves a contrast that would otherwise vanish. **X.32 has no contrast at all.** The fronted "You," carries nothing, and in isolation a bare vocative "You," before an imperative reads as a summons to a stranger rather than as self-address — which is the one register Anders's brief rules out. There is also a live misparse: "You, only determine…" can be read for a beat as "only *you* determine…", the reverse of the sense. Long's emphasis is carried by "only", which survives untouched in every candidate reading.

**Proposed correction:**

> Only determine to live no longer unless you are such.

This is a true imperative, unambiguous in mood, self-addressed like every other imperative in the edition, and it keeps "only" exactly where Long has it. The self-address is not lost — no imperative in this edition carries an overt pronoun, and the sentences on either side ("this is altogether in your power", "if you are not such") hold the second person firmly.

**Alternative:** "Do only determine to live no longer unless you are such" is also a true emphatic imperative and keeps Long's "do"; I like it slightly less because "Do only determine" reads as a concession ("do at least"), which is a shade off Long's force. Confidence high that "You," should go; medium between the two replacements. **Severity minor, not substantive**: unlike IX.40, the mood does not collapse here — "You, only determine" is still readable as an imperative — so this is register and ambiguity, not lost meaning.

*Also noted.* "[Thee to live]" folded is right; "does not allow" needs its object. The "thou are"/"thou art" slips in both base texts correctly leave no trace.

### B10-P033 — X.33

**Finding 33.1 (optional).** Current: `What is that which, as to this material, our life, can be done or said in the way most in accordance with reason?` Long: `What is that which as to this material [our life] can be done or said…`. The fold is right, but it lands four commas in eleven words and momentarily suspends "which … can be done" across two nested appositives; the reader has to hold the relative open through both. **Proposed (optional) correction:** set the apposition with em dashes, as X.13's and X.21's are — `What is that which, as to this material—our life—can be done or said…`. Keeps every word and Long's order. Confidence medium; the current version is correct, only slightly clotted, and a drafter who prefers to keep dashes rare in this book has a good reason to leave it.

Otherwise no material issue. "[Order]" dropped under D11 is right for the stated reason — "law" recurs four more times in the closing chain. "Conformable to" → "in accordance with" ×2 follows I.16 and IV.32, and "according to his own nature" is correctly left alone where Long has "according to". The two commas removed before restrictive relatives are right and are the same class as X.6 and X.20: with Long's commas, "nothing harms him who is really a citizen, which does not harm the state" would let "which" take the whole clause as antecedent. The long closing chain — citizen, state, law, misfortunes, back to citizen — keeps every link and its order, and the cylinder, the stone and the blazing fire are kept as images.

### B10-P034 — X.34

**Finding 34.1 (optional, package-level as much as paragraph-level).** Current: `For example:— "Leaves, some the wind scatters on the ground— So is the race of men."` The candidate is byte-identical to the staged original here, so this is **not** a drafting defect; it is the verse-joining rule showing through. But the result is two em dashes each followed by a space, in a package whose punctuation rule is "em dashes without spaces", and the second one ("ground— So") is a line-end dash that now reads as a mid-sentence break. **Proposed (optional) correction:** leave the text exactly as it is — it matches the source, and the alternative is to touch verse-joining, which is a `PROVENANCE.md` §4 matter affecting five other books — and add a line to `continuity.md` noting that X.34's two spaced dashes are inherited from the verse join and are deliberate. Confidence high that nothing should be changed in the candidate; the finding is about the record.

Otherwise no material issue. The Homer couplet is Long's text and is correctly kept (see the source verification: it is five-space indented body text, not the seven-space Odyssey quatrain inside footnote [B]). "After-times" kept as Long's compound. The four-fold "leaves" chain is intact, "are produced in the season of spring" is kept as a quotation and "as the poet says" is left unidentified, correctly.

### B10-P035 — X.35
No material issue found. Byte-identical to Long, and correctly: the healthy eye, hearing, smelling, stomach and understanding are already plain modern English, and "an eye which seeks for green things, or teeth which seek for soft things" needs nothing.

### B10-P036 — X.36

**Finding 36.1 (optional).** Current: `There is no man so fortunate that there shall not be by him when he is dying some who are pleased with what is going to happen.` Long has "by him" and the candidate keeps it. The "shall" is correctly kept (negative consecutive subjunctive), but **"by him" is the harder word**: in modern English "be by him" reads first as agentive ("done by him") and only on a second pass as locative ("at his side"), and the reader is already holding a long correlative open. Long means beside him. **Proposed (optional) correction:** `…that there shall not be beside him when he is dying some who are pleased…`. One word, Long's sense exactly, nothing added. Confidence medium: this is the opening sentence of the longest meditation in the second half of the book, so a beat lost here costs more than elsewhere; against that, "by him" is not *wrong*, and the package is rightly conservative about touching a clause whose "shall" it has just defended.

**Finding 36.2 (optional).** Current: `will there not be at least some one to say to himself…`. PG prints "some one" as two words and the candidate follows. The base-text ruling that PG is right against SE here is about **"least" vs "last"**, not about the space, and "some one" as two words is a typographic convention of 1862, not a reading — the package already normalises spelling (American), quotation marks and dashes. **Proposed (optional) correction:** `at least someone`. Confidence medium; leaving it is defensible as following PG's letters, but then it should be named as such in `continuity.md` rather than left to look like an oversight.

Otherwise no material issue. "Perchance" → "perhaps" is right, and the distinction from IX.3 holds: there it stands inside a quoted heightened cry to death, here in a plain reported reflection about associates hoping for a small advantage, where the archaic word has no work to do. "Benevolent" → "kind" is the glossary. The whole of the dying man's speech, the dash before "This is what is said of a good man", the turn back onto Marcus, the reflection in the first person and the closing "for this, too, is one of the things according to nature" are all kept in Long's order.

### B10-P037 — X.37
No material issue found. The two commas added round "on the occasion of anything being done by any person" are right and are the only punctuation added in the book that is not answering an ambiguity inside a clause: without them the long adverbial reads as attaching to "possible". Long's "But begin with thyself, and examine thyself first" keeps both verbs and its order.

### B10-P038 — X.38
No material issue found. "Like to an axe" → "like an axe" is required. The three closing instruments — the weaver's shuttle, the writer's pen, the driver's whip — keep their order and their possessives, and "this which pulls the strings" is kept rather than explained.

---

## Chapter-level findings

**Finding C1 (minor, records).** `continuity.md` ("Brackets in Long's Book X: eighteen. **Sixteen** folded, two dropped" and "*Folded — sixteen*"), `README.md` ("sixteen folds"), `review-instructions.md` ("**Sixteen are folded**") and `00-progress-ledger.md` ("Eighteen brackets: sixteen folded, two dropped") all say sixteen folds. **The correct count is fifteen.** Recounted from the source: eighteen brackets total = **fifteen folded** (X.6 ×2, X.7 ×4, X.8, X.11, X.13, X.15 ×2, X.21, X.31, X.32, X.33 ×1) + **two dropped under D11** (X.2 "[social]", X.33 "[order]") + **one translator's note dropped** (X.23). Sixteen + two + one would be nineteen, one more than the eighteen the same sentences assert and the mechanical check verifies. The *list* in `continuity.md` is correct and complete; only the numeral above it is wrong. `README.md`'s own check block is labelled "the sixteen folds" and then spot-checks thirteen, which is how the error survived. **Proposed correction:** change "sixteen" to "fifteen" in all four files and in `provenance.json` if it carries the count. Confidence high — this is arithmetic, not judgement. (If finding 15.1 is taken and "[political community]" is dropped, the final counts become **fourteen folded, three dropped under D11, one translator's note**.)

**Continuous read.** I read `candidate-v1-readable.md` straight through after the packets. The voice is Marcus's throughout: compact, personal, self-addressed, with no turn toward advice for a reader, no moral lesson, no motivational register and no explanation aimed at a modern audience anywhere in the thirty-eight sections. Where Long himself has "we" and "us" (X.26 "just as we see the power", X.28 "the bonds in which we are held", X.27 "such dramas as we see now", X.36's "us" throughout the dying man's speech) the candidate keeps them, correctly, and introduces no "we" where Long has "thou". The pacing survives the modernisation intact — the long argumentative sections (X.1, X.6, X.7, X.8, X.31, X.33, X.36) still run long and the run of one-line meditations in the middle (X.14, X.16, X.17, X.18, X.20, X.22) still lands as a change of tempo, which is much of what Book X is. Terminology is stable across the book: "the whole" and "the universe" never drift into each other, "the ruling part" and "the intelligent part" stay distinct, "reason" is never "rationality", and "according to nature" / "in accordance with" are used on the rule stated in `continuity.md` rather than interchangeably. No repetition that Long makes deliberate has been varied away, and no transition has been smoothed in. **No further chapter-level finding.**

---

## Summary for the drafter

**Verdict: Accept after corrections.** Nothing in the thirty-eight paragraphs is missing, added, softened, expanded, mistranslated or imported, and there is no substantive finding. To close the round:

1. **21.1** — repair the quotation marks at X.21 (or record why they stand).
2. **32.1** — replace "You, only determine" with "Only determine" at X.32.
3. **15.1** — decide X.15's "[political community]" against X.2's "[social]" and say which rule applies.
4. **23.1** — add **D13** to the ledger for translator's notes.
5. **C1** — correct sixteen → fifteen folds in the four files.
6. **1.1** — record the X.1 comma removal in `continuity.md`.
7. Optional, drafter's discretion: **9.1** (gravity — I would leave it), **33.1**, **34.1** (record only), **36.1**, **36.2**.

The source verification holds and the no-rebuild finding is correct. The "shall" audit is consistent in all three kinds. The five byte-identical paragraphs are right. The 0.88 minimum ratio at X.23 is the dropped note and nothing else.
