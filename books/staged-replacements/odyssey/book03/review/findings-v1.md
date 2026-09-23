# Independent review — the Odyssey, Book 3, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer session spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/odyssey-modern-en-20260911`, worktree `/home/user/tinct/.claude/worktrees/agent-aa6e0a6a102481c67` |
| Candidate | `book03/candidate-v1.json`, sha256 `2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa` — recomputed locally; matches `provenance.json`, `manifest.json` and `README.md`. 38 paragraphs, 13 packets. |
| Source | `book03/source-book3.json` sha256 `a3dc00566e0f4517bc7fc68ca6b6dbb363a4e191bb175d1b5c1cabb420815e6a`, byte-identical to chapter 3 of `app/public/data/editions/odyssey-original-en.json` sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`; PG base `source-texts/pg1727-butler-1900.txt` sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`. All three recomputed and matching. |
| Mechanical checks | The README's block re-run verbatim, unmodified: `OK — 38 paragraphs, coverage exact, packets verbatim, names and hazards held` / `OK — ratio 0.9561 (excluding B03-P038: 0.9959), Butler token retention 0.895`. |
| Source-verification claim | **Verified independently by a third kind of rule, and it holds. Both non-marker differences are confirmed, and I add a fourth line of evidence the package does not have.** See section A. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-13.md`, in order, three paragraphs at a time (packet 13 two) with the `CONTEXT ONLY` neighbours (coverage `B03-P001`…`B03-P038`, each exactly once); then the candidate read straight through. |
| Translations consulted | Butler 1900 only. Fagles, Lattimore, Wilson, Fitzgerald and every other in-copyright translation were **not** read, and no finding claims an import from one. The served `odyssey-modern-en.json` was opened **once, as a contamination control only** (section B) — never for wording, and no proposed wording in this file is drawn from it. |

## Verdict

**Accept after corrections.**

| Severity | Count |
|---|---|
| substantive (must be fixed before acceptance) | **0** |
| minor (worth improving) | **18** paragraph-level |
| optional (preference, no defect) | **12** paragraph-level |
| records (outside the text) | **5** |
| paragraphs with no material issue at all | **12** |

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving. **optional** = preference, no defect. Every proposed wording stays inside Butler's own words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

**This is the cleanest of the package's three drafts, and nothing in it must be fixed before acceptance.** No claim, name, object, quantity, relationship, negation, condition or causal link is lost or added anywhere in B03-P001 to P037. Every check the instructions name passes: 38 paragraphs one-to-one and in order; the name census matches the source exactly (Odysseus 7, Athena 18, Zeus 8, Poseidon 6) with `Apollo`, `Hades`, `Amphitrite` correctly left alone and no Roman form surviving; `Mycenae` correct at B03-P024 and no bare `Mycene` in the Book; `Diomed` correctly flagged not corrected; every one of the seven D4 paragraphs is unbalanced in exactly the source's places, with the totals matching at 42/35 and each continuing paragraph opening its own mark; the six formulas that repeat inside the Book are identical in both places; the Book 1 formula at B03-P016 is word-for-word Book 1's accepted text, with Butler's own one-word difference preserved; the hardest paragraphs (B03-P015's voyage, B03-P024's 342 words, B03-P034 and P035's sacrifice) survive object by object and stage by stage with nothing generalized away.

The findings are small and of four kinds. Nine are the named small-loss class — an intensifier added (`alike`), a hedge dropped (`try and find out`), a noun dropped (`sir strangers`), two connectives dropped (`then`, `accordingly`), a tense flattened (`had dispersed`), a contrast turned into a cause (`but` into `for`), a precise verb replaced by a vague one (`cajoled` into `worked on`). Two are the package's own characteristic defect: one Butler word rendered two ways in one Book (`counselled`), and one Butler difference flattened into sameness (the "excellent man" warranty). Four are standard-level: three dated forms that survived the archaism guard (`sceptre`, `twelvemonth`, `towards`) and one that is simply a slip (`in course of time`). The rest are preferences.

**The four flagged decisions are ruled on in sections C and F**, and the fifth — the retention figure — is answered in section E. The D12 class-C ruling in section D unblocks Book 4, and it corrects four factual errors in D12 as written.

---

## A. Source verification, by my own rule — it holds, and both non-marker differences are confirmed

I did not re-run `scripts/verify_source_book3.py`. `book03/review/verify_source_book3_review.py` (added by this review, read-only) is a **third** kind of rule, unlike both earlier ones:

- the Book 2 drafter anchored on PG's footnote-entry list, positionally;
- the Book 3 drafter anchored structurally on the `BOOK III` / `BOOK IV` headings, read bytes, and diffed with the apparatus still in;
- **mine is anchorless and digit-blind.** It never looks for a heading, a Book number or a `FOOTNOTES:` line — so neither of the two recorded traps can fire, because neither anchor is used. It reduces both texts to lowercase letter-only tokens (PG's markers are bare digit runs, so they are never tokens and cannot be "stripped"), and then asks one question that identifies nothing in advance: **does the served Book 3 occur as an exact contiguous token block in PG #1727, exactly once?**

Result:

```
B03-P001..P037 as one contiguous token block: 4730 tokens, 1 occurrence(s) in PG
  found at PG token 11388..16118, PG lines 1123..1537
paragraphs matching PG exactly, in order, with no gap: 37/38
  MISMATCH B03-P038: 210 tokens, first 12 match PG, then PG has no more
PG continues: "book iv the visit to king menelaus ... they reached the low lying city ..."
digit runs inside the located region: 12 -> [24 ... 35]   ascending, no repeats, 12/12 glued
control A (all 38 paragraphs as one block): 0   control B (first two swapped): 0
control C (one letter added to one word): 0
```

The location is an **output**: 4,730 tokens of served text occur once and only once in a 117,000-word file, contiguous and in order, so B03-P001 to P037 is PG's text, in PG's words and PG's order, with nothing inserted between paragraphs. Digit-blindness is paid for rather than waved away — every digit run in the located region is listed with context, and all twelve are ascending, glued markers 24 to 35, so no numeral of Butler's was silently dropped. Three negative controls fail as they should.

**Both of the drafter's non-marker differences are confirmed, independently:**

1. **B03-P001 capitalization.** PG reads `but as the sun was rising from the fair sea`; the served file capitalizes `But`. Printed side by side by the script. No word changes.
2. **B03-P038.** Only the first 12 tokens of the served paragraph exist in PG, and what follows them in PG is the `BOOK IV` heading. The remaining 196 words are not in the base text.

**A fourth line of evidence, which the package does not have and which settles the paragraph without reference to PG at all.** The served `original-en` is typographic throughout — 1,027 paragraphs, and the **only** paragraph in the entire file containing an ASCII double quote is Book 3 ¶38, which contains two. Every other quotation mark in the file is typographic. The splice carries its own fingerprint. And the spliced text differs from the served `modern-en`'s ¶38 by exactly one substitution — `covered` to `was over` — that is, someone edited two words of a 207-word modern paragraph and dropped it into the original. This is corroboration of a completely different kind from a PG diff, and it is worth adding to `PROVENANCE.md` section 4.

**Verdict on section A: the source verification holds under my own method, and the record in `PROVENANCE.md` section 4, `book03/README.md` and `book03/continuity.md` is accurate as written.**

## B. Contamination control — no evidence of import, and the evidence of independence is strong

Because a piece of the served `modern-en` is sitting inside the served *original* in this Book, I ran one check the instructions do not require and then closed the file: for every candidate paragraph, the longest word-run shared with the served `modern-en`'s Book 3. Raw overlap is uninformative — Butler's own paragraphs share 12-word runs with it, because it is a light rewrite of Butler. The informative measure is **shared innovations**: n-grams present in both modernizations and absent from Butler. 20 to 31 percent of the candidate's departures from Butler are shared with the served file, which sounds alarming and is not: reading the list, they are the forced choices (name mapping, speech-tag reordering) and the single obvious modern equivalent (`left his bed` for *couch*, `painless arrows` for *shafts*, `fastest` for *fleetest*). Seven single-word coincidences across 4,700 words, in two modernizations of the same sentences, is convergence.

**The decisive evidence runs the other way, and it is exactly where contamination would have been easiest.** The splice put the served file's rendering of B03-P037's territory into the original column, unavoidably in front of the drafter. In every place where a choice existed the candidate diverges from it: `grain lands` against *wheat lands*; `readily enough` against *eagerly*; `lashed` against *whipped*; `darkness lay over` against *darkness covered*; `sweetmeats` kept against *delicacies*; and `the Trito-born` kept at B03-P030 where the served file deletes the epithet entirely. The claim in `continuity.md` that no word of it reached the candidate is supported.

---

## C. Ruling 1 — B03-P038, where the served `original-en` is corrupt

**Ship the drafter's answer: Butler's twelve words and nothing else. It is the only one of the four options that is still correct after the served file is repaired.**

The drafter's three reasons are right as far as they go. I add the one I think is decisive, which is not in `continuity.md`:

- **Option (b) — render the served 208 words — is the only option that makes the repair harder.** A3 recommends repairing `odyssey-original-en.json` so that ¶38 is Butler's clause alone. That repair is right and will very likely happen. If the new modern edition has meanwhile rendered the splice, then on the day of the repair the modern column's ¶38 becomes 200 words with no source at all: a paragraph of the *replaced* file's prose, aligned against twelve words of Butler, permanently, with nobody left who remembers why. Option (a) is correct both before and after the repair. That is what "laundering a corruption" costs in practice, and it is a stronger argument than the duplication or the provenance rule, because it survives someone deciding they do not mind the duplication.
- Option (c) — borrowing Book IV's opening words — is rightly rejected, and for a reason worth putting in the ledger rather than only in `continuity.md`: it would invent a Book-boundary policy for a 24-Book edition on the strength of one paragraph, and this is not the only place Butler runs a sentence across the join — his Book III opens the same way, on a lower-case `but`.
- Option (a)'s cost is real, visible, and correctly not minimized. 208 words against 12 in split view will be read as a bug. It is still the right trade: the modern column says exactly what the base text says there, and the thing that looks like a bug **is** a bug, in the other file.

**Yes — the package should carry a decision row, and it should be written for the class, not for this paragraph.** Proposed, as **D14**:

> **D14 — Where the served `original-en` is demonstrably not the base text, the candidate renders the base text, never the served corruption.** The divergence is recorded per paragraph in the Book's `continuity.md` with the evidence, the cost is stated plainly, and a repair to the served file is escalated (A3) rather than performed. Paragraph alignment is preserved in every case: the paragraph exists and is non-empty. First and so far only application: B03-P038, where 196 of the served paragraph's 208 words are the served `modern-en`'s own ¶38, spliced in to complete a half-sentence Butler leaves open at the end of his Book III.

The reason for a class-level row rather than a note on one paragraph: `scan_staged_original_vs_pg.py` shows there is no second instance in *this* file, but the class is now known to exist in the product, that scan does not cover the library's other books, and a drafter who meets a similar splice without a rule will do the natural thing — modernize what is in front of them — and will be right to, absent a rule.

**One thing to add to the package, which costs nothing and converts "outside our scope" into "prepared and waiting":** put the exact repaired paragraph — Butler's `Now when the sun had set and darkness was over the land,` — into `book03/ACCEPTANCE.md` and into A3, together with the before and after sha256 of `odyssey-original-en.json` that the repair would produce. A3 then becomes a one-line patch somebody can apply with confidence instead of a research task.

**No apparatus in the text.** The candidate must not mark, footnote or explain the short paragraph to the reader. It does not, and it should not start.

## D. Ruling 2 — D12 class C, which unblocks Book 4

> **Class C: the mark is dropped, every word stands, nothing is recast across the bracket's boundaries, and every instance is recorded. The same disposition as classes A and B — but on a *third* warrant, and with obligations the other two classes do not carry.**

I read footnote 36, footnotes 49, 81, 82, 91, 101, 107 and 122, and all six class-C passages in PG #1727 directly. The class as D12 describes it does not survive that reading, and four of D12's factual statements about it are wrong. The ruling follows from what Butler actually says.

### What Butler's notes actually say

**Footnote 81 is not merely "worth reading before the decision is made." It settles the premise, and it says the opposite of D12's test:**

> *"lines enclosed in brackets are almost always genuine; all that brackets mean is that the bracketed passage puzzled some early editor, who nevertheless found it too well established in the text to venture on omitting it."*

D12 defines class C as "a passage Butler brackets to mark his doubt that it belongs to the poem." By his own statement, a bracket in this text is **not** a verdict of spuriousness, and his working assumption is that bracketed lines are genuine.

**What his own class-C notes claim is authorship history, not doubt about the text:**

- **fn 36** (PG 1552, Book IV): *"evidently an afterthought—added probably by the writer herself—for they evince the same instinctively greater interest in anything that may concern a woman, which is so noticeable throughout the poem."*
- **fn 82** (PG 4260, Book IX): *"I am inclined to think it is interpolated (probably by the poetess herself)… See 'The Authoress of the Odyssey' pp. 254-255."*
- **fn 91** (PG 4884, Book XI): *"added by the author when she enlarged her original scheme."*
- **fn 107** (PG 5691, Book XII): *"an afterthought **but to have been written by the same hand as the rest of the poem**."*

Every one of these is Butler arguing his *Authoress of the Odyssey* thesis: the passage is by the poem's own author, composed at a later stage. That is a claim about when the words were written, addressed by the translator to his reader, with the argument in footnotes and in a separate book the edition does not carry. It is not a claim that the passage does not belong, and there is no textual doubt in it to preserve.

- **fn 49** (PG 2067, Book IV) *is* about that bracket — *"an interpolation consisting only of four lines"* — so this instance is footnoted too.
- **fn 122** (PG 6016, Book XIII) shows **the brackets there are not Butler's at all**: *"some one has enclosed in brackets the two lines in which the second cave is mentioned, I presume because he found himself puzzled…"* — and Butler goes on to argue they are mistaken, because he has been to the place and there are two caves. Reproducing that bracket would print another editor's error that Butler's own note refutes.

### The fact that decides the disposition

**Four of the six class-C brackets are never closed in the base text.** PG's translation body (lines 375 to 10842) contains **fifteen opening brackets and eleven closing ones**, and the served `original-en` reproduces exactly the same imbalance, 15 and 11. All nine class-A and class-B brackets close within their line. The four that do not close are all class C: PG 1552 (Book 4 ¶1), PG 4260 (Book 9 ¶41), PG 5691 (Book 12 ¶38), PG 6016 (Book 13 ¶28). Only PG 2067 to 2070 and PG 4884 to 4902 close.

So "keep the mark verbatim" is not available as an honest option. In four of six instances it means either printing an opening bracket that never closes — which in a paginated reader is indistinguishable from a typo, and which the reader would meet on the **first paragraph of Book 4** — or supplying the close yourself, which means deciding the extent of the passage, which is the drafter adding to the text. That the transcription closes every class-A and class-B bracket and drops four of six class-C closes is itself evidence about what these marks are: apparatus, handled loosely, not text.

### The principle, stated by class

**The class is decided by whose voice the bracket is in and what it is about** — D12's own line, which I keep. Applied honestly to what Butler writes:

- **Class A** — Butler supplying words the Greek lacks, flagged in a note: his voice, about *his English*. Mark dropped, words stand, pointing supplied. Unchanged.
- **Class B** — Butler explaining inside the line, unflagged: his voice, about *the sense*. Mark dropped, words stand, each instance flagged. Unchanged, and upheld at B03-P001 (section F1).
- **Class C** — Butler, or an earlier editor, marking off a passage and arguing, in a note the edition does not carry, about *when and by whom it was composed*: his voice, about *the poem's history*. **Mark dropped, every word stands** — because the words are Homer's text and the claim is Butler's commentary. This is the Meditations **D13** test applied to a bracket instead of a note, and it reaches the same answer that package reached for its own textual-doubt marks (`[Ephesians]`, `[For let thy efforts be—]`): the mark goes and the words stand, whether the bracket holds a word or a clause.

And a fourth reason, which holds even if every one of the above were arguable: **the mark cannot carry the meaning in this edition anyway.** There is no apparatus, no footnote layer, and no way for the page to say what a bracket means. Butler's argument lives in footnotes 36, 82, 91 and 107, which are not in the edition and are not going to be. A bare bracket transmits "something is set off here" and nothing more. The choice was never between preserving Butler's doubt and losing it; it is between an uninterpretable mark — broken, in four cases — and clean text with the decision recorded. Butler's bracket also remains visible in the `original-en` column beside the modern one, where the reader who wonders can see it: the same answer this package already gave for `Ilius` and for `Mycene` the woman.

### The obligations that keep class C a class

The disposition is the same as A and B. The obligations are not, and this is why the class must stay in the glossary rather than be folded into B:

1. **Record every instance** in the Book's `continuity.md` by PG line, with Butler's note quoted in full where he has one, and with **who bracketed it** where his note says (PG 6016 is not his).
2. **Restraint inside the passage.** A class-C passage is never abridged, summarized, merged with a neighbouring sentence, reordered or "tidied", and is rendered closer to Butler than the surrounding prose — no recasting of sentence structure across the bracket's boundaries. The risk is concrete, not hypothetical: **PG 4260 and PG 4884 are the same prophecy printed twice**, which is Butler's whole point in fn 91, and a drafter who notices the repetition will be tempted to compress one of them. Both stand, in full, in Butler's words.
3. **Where the bracket is unclosed, record that and do not determine the extent.** Nothing in the rendering depends on knowing where it ends, because the disposition is identical on both sides of the boundary — which is precisely why this ruling is safe despite the four missing closes, and why the alternative is not.
4. **Class assignment now changes no word**, so a B-versus-C borderline costs a line in the record, not a corruption of the text. PG 5410's `[A large fig tree in full leaf grows upon it]` therefore **stops blocking Book 12**: record it as C — a whole bracketed sentence, with fn 101, *"I suppose this line to have been intercalated by the author"*, which is the same authorship-history claim as fns 36, 82, 91 and 107 — render it under the same rule, and move on.
5. **If the product ever gains a note layer**, class C becomes a note — *"Butler marks these lines as probably added later by the poem's own author"* — and that is the doubt's right home. Logged as an app-side item beside `PUNCTUATION.md` section 2's, not acted on here.

### What Book 4's drafter does next

Book 4 ¶1 carries the poem's first class-C bracket, in its first sentence. Drop the opening mark, render `and found him in his own house, feasting with his many clansmen…` as ordinary text, do not recast the sentence across the point where the bracket opened, and record the instance with fn 36 quoted and with the note that the bracket is never closed in the base text. Book 4 ¶52 carries the second (PG 2067, closed at 2070, fn 49). **Book 4 is unblocked.**

### D12's text needs four corrections (records findings R3 and R4)

1. Class C is described as recorded doubt that the passage belongs to the poem. Footnote 81 says bracketed lines are "almost always genuine", and fns 36, 82, 91 and 107 claim the opposite of spuriousness — same author, later stage; fn 107 says so in terms.
2. "Three classed on shape alone, none with a note about the bracket." **Five of six are footnoted about the bracket**: fn 49 calls PG 2067 "an interpolation consisting only of four lines", and fn 82 calls PG 4260 "interpolated (probably by the poetess herself)".
3. PG 6016's brackets are **not Butler's**; fn 122 attributes them to someone else and argues against them.
4. The first class-C bracket opens at **PG line 1552**, not 1551. Small, but this package's currency is exactness.

---

## E. The retention figure, 0.895 — treated as a question, and the answer is that the lightness is the source's

Per-paragraph retention over B03-P001 to P037, on the Book 2 reviewer's measure:

| least changed | | most rewritten | |
|---|---|---|---|
| B03-P034 | 0.975 | B03-P004 | 0.641 |
| B03-P015 | 0.971 | B03-P007 | 0.750 |
| B03-P023 | 0.964 | B03-P030 | 0.805 |
| B03-P035 | 0.943 | B03-P002 | 0.812 |
| B03-P024 | 0.942 | B03-P021 | 0.829 |

I read the five least-changed paragraphs against Butler line by line, which is what the question asks. **The two ends of the table are sorted by exactly one thing: whether the paragraph contains an archaism.**

- **B03-P034 and B03-P035** are the sacrifice — a sequence of physical acts and objects (anvil, hammer, tongs, ewer, basket, axe, bucket, two layers of fat, five-pronged spits). Butler's prose there is already plain modern narration; there is nothing to modernize but connectives, and the candidate changed what there was (`that the goddess might have pleasure` to `so that … take pleasure`, `began with washing` to `began by washing`, `upon the fire` to `onto the fire`, `daughters in law` to `daughters-in-law`). Nothing was left archaic in order to keep the number up.
- **B03-P015 and B03-P024** are the voyage catalogues — place names and stages, where the only Victorian residue is `hereabouts` and `dwell`, both of which are gone.
- **B03-P023** had `moreover`, `counselled` and `batten upon`, and all three are handled.

Against that, the most-rewritten paragraphs are precisely the ones carrying `thou/thee/thy`, `vouchsafe`, `shewed`, `redoubtable`, `aforetime`, `the public weal` and Butler's chained subordination. That is the pattern a faithful modernization produces, and it is the opposite of the pattern a light touch-up produces, where the archaism-heavy paragraphs would be the *lightly* touched ones.

**So: the lightness is the source's, and 0.895 is a pass.** With one qualification, which is about the instrument rather than the draft: three dated forms did survive (`sceptre`, `twelvemonth`, and the slip `in course of time`, plus `towards` against the American standard), and the README's archaism regression guard does not test for any of them. Findings 25.1, 32.1, 37.1 and 18.2; records finding R5.

---

## F. The other three flagged decisions

### F1. `[on the embers]` at B03-P001 — class B upheld, and the reasoning in `continuity.md` section 3 is the right reasoning

The bracket is inside the sentence's grammar, adds no claim the sentence does not make, carries no note (fn 25 attaches to *inward meats* earlier in the line — checked), and is printed in the served `original-en` that sits in the next column. Mark dropped, words kept, flagged: right. The stated warrant — that dropping the words would put the modern column *behind* the original beside it, which alignment makes visible, and that dropping the mark asserts nothing Butler does not already print — is correct, and it is the argument to reuse at PG 4367, 4368, 5543, 8057, 9351 and 10132.

One addition for the record, now available: the class-A and class-B brackets are all **closed** in the base text and four of six class-C brackets are not (section D). That asymmetry is further evidence that A and B are text and C is apparatus, and it is worth a line in `GLOSSARY.md`.

### F2. B03-P028's `so few cloaks and as to be` — the drafter's handling is right

Drop the stray `and`, supply nothing. The `rugs` conjecture is plausible — Butler's own `store both of rugs and cloaks` two sentences later is real evidence — but it is a conjecture, the sentence is grammatical and complete without it, and supplying a noun to the base text is a different act from deleting a word that cannot be construed. The argument is correctly recorded for a later reader to argue against, on the B01-P014 model. No change.

### F3. "Nestor, the horseman of Gerene" and "the Trito-born" — both upheld

**"the horseman of Gerene"** is right and the reasoning is right. *Knight* in current English is unambiguously medieval and would put a mailed European into a Bronze-Age chariot; Butler's sense is the plain one, and the Book itself supplies the evidence — Nestor's sons are the ones who yoke and drive, and the Book ends with two of them on a chariot. Both elements of the epithet survive. Use it every time it recurs, as the glossary says.

**"the Trito-born", unglossed,** is right for the stated reason and for one more the drafter could not have known without opening the file being replaced: the served `modern-en` at its ¶30 deletes the epithet outright (*"Zeus's formidable daughter, Athena"*). Keeping it is a deliberate divergence from that flattening, of exactly the kind the package made for `Ilius`, and the sentence has already told the reader she is Zeus's daughter. A gloss would have to choose between disputed etymologies or run to a paragraph. No change.

---

## G. Findings, paragraph by paragraph

Coverage: `B03-P001` to `B03-P038`, each exactly once.

### B03-P001

**1.1 — minor.** Current: `to shed light on mortals and immortals alike`. Proposed: `to shed light on mortals and immortals`. Reason: `alike` is an intensifier Butler does not have, and this is the class Book 1's round 1 named (*certainly*, *at least*, *his son*). Butler's phrase is a plain pair, not an emphasis.

*Also noted, not raised:* `Now the people of Pylos were gathered` to `The people of Pylos were gathered` drops Butler's narrative `Now`; modern English tolerates the loss here, and the same word is kept where it does work (B03-P009, B03-P038). `guilds` to `companies` and `firmament` to `vault` are both right and both recorded.

### B03-P002

**2.1 — minor.** Current: `You have made this voyage to find out where your father is buried`. Proposed: `You have made this voyage to try to find out where your father is buried`. Reason: Butler's `to try and find out` is a hedge, not a filler — the whole Book turns on whether Telemachus finds out, and he does not. Dropping it upgrades an attempt into a purpose achieved.

**2.2 — minor.** Current: `he will tell you no lies` (B03-P002). Proposed: `he will tell no lies`. Reason: **Butler's two instances of the warranty are not identical.** B03-P002 reads `he will tell no lies`; B03-P025 reads `he will tell **you** no lies`. The candidate prints the B03-P025 form in both places, flattening a difference Butler wrote — against this package's own precedent, applied four paragraphs later at B03-P016, where Butler's one-word difference from B01-P019 (`show your mettle, **then**`) is deliberately kept "because he wrote it". The same rule, applied here, restores the bare form at B03-P002. `GLOSSARY.md` and `continuity.md` both assert the two are "word for word"; they are not (records finding R1).

*Also noted:* `in the least` to `for a moment` swaps a degree qualifier for a duration idiom; both are emphatic negatives and nothing is lost.

### B03-P003

**3.1 — minor.** Current: `I am ashamed to begin by questioning a man so much older than myself`. Proposed: `I am ashamed to start questioning a man so much older than myself`. Reason: `begin by questioning` says the questioning is his *opening move* among others; Butler's `begin questioning` says he is ashamed to question at all. The shift is small and it changes what he is ashamed of.

*Also noted:* `I have never yet been used` to `I have never been used` drops `yet`; too small to urge.

### B03-P004

**4.1 — optional.** Current: `heaven will prompt you with the rest`. Proposed: `heaven will prompt you further`. Reason: `with the rest` asserts that heaven covers the remainder; Butler's `further` claims only that heaven will prompt him beyond what instinct supplies. A promise slightly firmer than the one Athena makes. This is the Book's most rewritten paragraph at 0.641 retention, and every other change in it is warranted — the passive is turned active and `from the time of your birth` becomes `from the day you were born`, both plain gains.

### B03-P005

**5.1 — optional.** Current: `while the men around him were busy getting dinner ready`. Proposed: `while his companions around him were busy getting dinner ready`. Reason: Butler's `his company round him` is his retinue — the men who are *his* — and `the men around him` loses the possessive relation in a scene about a host and his household. `company` is current English and needs no replacement.

### B03-P006

**6.1 — optional.** Current: `for a man cannot live without God in the world`. Proposed: `for man cannot live without God in the world`. Reason: Butler's `man` is the species, in an aphorism; `a man` makes it about an individual, which is a smaller claim. The generic `man` is still ordinary in this sententious register, and the sentence is Pisistratus's one general statement in the Book.

### B03-P007

**7.1 — minor.** Current: `…to have given it to her first, and she began praying heartily to Poseidon`. Proposed: `…to have given it to her first, so she began praying heartily to Poseidon`. Reason: Butler's `accordingly` is a causal connective — she prays *because* she was honored first, which is the point of Pisistratus's courtesy and of the whole cup-to-Athena-first detail. `and` makes the two facts merely consecutive. Same class as Book 2's dropped causal `for`.

*Also noted:* the prayer's second person (`thou … encirclest … thy servants`) going to plain `you` is correct, and the vocative is correctly kept as a vocative; `goodly hecatomb` to `fine sacrifice` applies D3 correctly and supplies no number.

### B03-P008

**8.1 — optional.** Current: `he prayed in his turn`. Proposed: `he prayed in the same way`. Reason: Butler's `likewise` is about manner — Telemachus prays *as she did* — and `in his turn` substitutes sequence. Both are true of the scene; only one is what Butler says.

### B03-P009

**9.1 — minor.** Current: `Who are you, then, sirs, and from what port have you sailed?`. Proposed: `Who are you, then, strangers, and from what port have you sailed?`. Reason: `sir strangers` loses its noun. *Stranger* is the load-bearing word of the whole scene — guest-strangers arriving at a sacrifice, welcomed before they are asked who they are — and Nestor's question is the formal moment where the host names the relation. `sirs` is bare courtesy and carries none of it.

*Also noted:* `rovers` to `raiders` is right, and the pirate formula (`your hand against every man, and every man's hand against you`) is kept whole.

### B03-P010

No material issue found.

### B03-P011

**11.1 — minor.** Current: `honor of the Achaean name` (also at B03-P017). Proposed: `honor to the Achaean name`, in both places and in the glossary row. Reason: Butler's `honour to the Achaean name` is the ordinary English idiom for *a credit to* — "he is an honour to his profession" — addressed to Nestor as a compliment. `honor of the Achaean name` is a genitive that does not mean that and does not mean anything very definite; it reads as though the name possesses the honor. Nothing in `to` is archaic, so the change buys nothing, and this is a fixed form of address that will recur through the poem.

*Also noted, not raised:* `harassed among the Trojans` to `being harried among the Trojans` moves from a plain current word to a less common one, which is the wrong direction on the reading standard — but `harassed` now carries strong workplace and sexual connotations that would misfire here, so the substitution is defensible and I decline to raise it. `melancholy end` to `wretched end` shades from *sorrowful* toward *pitiable*; `sorrowful end` would be exact, but `wretched` is within range.

### B03-P012

**12.1 — optional.** Current: `what mortal tongue could tell the whole story?`. Proposed: `what mortal tongue indeed could tell the whole story?`. Reason: Butler's `indeed` marks the rhetorical question as a reinforcement of the sentence before it; without it the question free-floats slightly.

*Also noted, and deliberately not raised:* Butler's `rovers` (B03-P009) and `privateering` (B03-P012) both go to the `raid` root. Two Butler words to one is the shape of the package's named defect, but the two are near-synonyms for the same activity, nothing in the poem turns on telling them apart, and the alternatives for `privateering` are all worse. Recorded so a later pass does not "discover" it.

*Confirmed:* the four-name death list is exact; Antilochus keeps both qualities; the dash-strung aside is resolved into sentences with every limb in Butler's order; D4 is reproduced.

### B03-P013

**13.1 — minor.** Current: `…as heaven scattered us, Zeus saw fit to make the Argives' homeward voyage a hard one`. Proposed: `… then Zeus saw fit …`. Reason: Butler's sentence is a `When … , and … , then …` construction, and the candidate drops the `then` that closes it. After a long double subordinate clause, the main clause needs its marker in modern English at least as much as in Butler's.

**13.2 — minor.** Current: `as heaven scattered us`. Proposed: `as heaven had scattered us`. Reason: Butler's pluperfect places the scattering *before* the embarkation it describes; the simple past makes the two simultaneous, which is a different account of what happened at Troy.

*Also noted:* `vex the Argives on their homeward voyage` to `make the Argives' homeward voyage a hard one` is a paraphrase where a plain verb was available (`to trouble the Argives on their homeward voyage`); acceptable, and the second mention of Zeus's displeasure is intact.

### B03-P014

No material issue found.

### B03-P015

**15.1 — optional.** Current: `This we did, and a fair wind sprang up`. Proposed: `This we therefore did, and a fair wind sprang up`. Reason: Butler's `therefore` marks the action as following from the sign they were shown; without it the sign and the sailing are merely adjacent. The Book's longest passage of navigational reasoning is the place to keep an inference marker.

*Confirmed, and this is the best paragraph in the Book:* every leg survives in Butler's order — Tenedos, the second quarrel, the ships that turned back under Odysseus, the son of Tydeus, Lesbos, the choice between outside Chios by Psyra and inside Chios past Mimas, the sign, the crossing to Euboea, the night passage to Geraestus, the sacrifices, Diomed's ships at Argos four days later, and the wind that never fell light. `mischief` is rendered `trouble` in both of its occurrences here.

### B03-P016

**16.1 — optional.** Current: `and a fearful reckoning Aegisthus paid for it before long`. Proposed: `and Aegisthus paid a fearful reckoning for it before long`. Reason: Butler's emphasis comes from a full inversion (`did Aegisthus presently pay`), which modern English cannot keep; the candidate fronts the object without the inversion, leaving a construction that is neither Butler's nor ordinary. The plain order loses the emphasis, but reads.

*Confirmed:* `show your mettle and make yourself a name in story` is word-for-word accepted B01-P019's tail, and Butler's own one-word difference between the two (`show your mettle, **then**` in Book 1) is correctly preserved. This is the package's consistency discipline working exactly as intended, and it is the precedent finding 2.2 asks to be applied to the "excellent man" warranty.

### B03-P017

**17.1 — minor.** Current: `honor of the Achaean name`. Proposed: `honor to the Achaean name`. Reason: see 11.1; the two must change together, and the glossary row with them.

*Also noted:* `for he has avenged his father nobly` to `for he avenged his father nobly` drops the present perfect, which ties the deed to the fame the sentence before it describes; small enough to leave.

### B03-P018

**18.1 — optional.** Current: `some of these suitors would soon forget their wooing`. Proposed: `some of these wooers would soon forget their wooing`. Reason: Butler varies `suitors` (earlier in this paragraph) and `wooers` (here), and the candidate prints `suitors` for both. Nothing in the poem turns on the distinction and the `woo` root survives in `wooing`, so this is recorded rather than urged.

**18.2 — minor.** Current: `ill-disposed towards you` (and `towards Crete` at B03-P024). Proposed: `toward`, in both. Reason: **D9 fixes American spelling**, and `towards` is the British-preferred form. The evidence base the glossary itself used for `gray` says the same thing here and more strongly: the served `modern-en` is **toward 40, towards 1**; Butler is **towards 55, toward 2**. Books 1 and 2 contain neither form, so Book 3 sets the precedent for the remaining twenty-one Books, where Butler's fifty-five will all have to be decided the same way. This belongs in `GLOSSARY.md`'s spelling section as a row, not in one Book's continuity sheet.

*Confirmed:* the parenthesis is kept as a parenthesis; the double conditional (`If Athena were to take as great a liking … if she would take as good care …`) survives limb for limb.

### B03-P019

No material issue found. Telemachus's flat refusal to hope is intact, hedge for hedge, and `Even though` to `Even if` is the right reading of a counterfactual.

### B03-P020

No material issue found. Both halves of Athena's trade-off survive, and so does the closing qualification that death is certain even so; nothing is upgraded into a promise.

### B03-P021

No material issue found. (`counselled` to `decided on` is raised at B03-P024, where the inconsistency lies, not here.)

### B03-P022

**22.1 — minor.** Current: `worked on Agamemnon's wife Clytemnestra with unceasing flattery`. Proposed: `cajoled Agamemnon's wife Clytemnestra with unceasing flattery`. Reason: `cajole` is current English, and precise — to coax by flattery, which is exactly what the sentence then says he did, with flattery — while `worked on` is both vaguer and a register below the surrounding prose. Butler's word needed no replacing.

*Also noted:* `you have yourself divined` to `you have guessed for yourself` shades inference toward chance; `you have worked it out for yourself` would be exact. `barrow` to `mound` correctly inherits the Book 1 and Book 2 row.

### B03-P023

**23.1 — optional.** Current: `left him there for crows and seagulls to feed on`. Proposed: `left him there for crows and seagulls to gorge on`. Reason: Butler's `batten upon` is gorging, and it is the ugliest image in Aegisthus's treatment of the bard; `feed on` is neutral. `gorge on` is plain modern English and keeps the picture.

### B03-P024

**24.1 — minor.** Current: `Zeus planned evil against him`. Proposed: one rendering for all three of Butler's uses — for example `Zeus decreed evil against him`, with `the gods long ago decreed his destruction` (B03-P021) and `when heaven had decreed her destruction` (B03-P023). Reason: **Butler uses `counselled` three times in this Book, always of a god resolving harm, and the candidate renders it `decided on` twice and `planned` once.** That is the package's named characteristic defect — one Butler word rendered two ways in one Book — and it is the reason the "recurring words the edition holds steady" table exists. `decreed` fits all three contexts and is a plain current word; if `decreed` reads too formal, `decided on` in all three is the alternative, and either is better than two.

*Also noted:* `protected` to `sheltered` creates an echo with the following `shelter` that Butler does not have (he wrote `protected … shelter`); the echo arguably improves the epigram, and it is recorded rather than urged. `Mycene` to `Mycenae` is correct and is D13's first application. Every stage and place-name in the Book's longest paragraph survives — Sunium, the painless arrows, Phrontis dead with the helm in his hand, the Malean heads, the division of the fleet, the Cydonians on the Iardanus, Gortyn, Phaestus, the wreck with the crews saved, the five ships to Egypt, the seven years, the eighth year, Orestes back from Athens.

### B03-P025

**25.1 — minor.** Current: `even birds cannot fly that distance in a twelvemonth`. Proposed: `even birds cannot fly that distance in a year`. Reason: `twelvemonth` is dead in current English — it is not a quantity Butler states that would be lost, it is the same span in an obsolete word — and it survived the README's archaism guard because the guard does not list it. The quantity is preserved exactly by `a year`. Butler prints `twelve-month`; the candidate's closing-up to `twelvemonth` is if anything more archaic.

*Cross-reference:* the warranty at the end of this paragraph is the instance Butler writes with `you`; see 2.2, which changes B03-P002 rather than this one.

### B03-P026

No material issue found.

### B03-P027

**27.1 — minor.** Current: `pages filled the mixing bowls with wine and water`. Proposed: `mixing-bowls`, matching accepted Book 1 — or `mixing bowls` in Book 1 as well. Reason: **accepted `book01/candidate-v3.json` prints `mixing-bowls` twice; Book 3 prints `mixing bowls`.** Butler is inconsistent (hyphenated at B01-P008, B01-P012 and B03-P027, open at B02-P034) and, on D7's principle, the edition should not be. Either form is defensible; the split across accepted Books is not. This is the first cross-Book typographic drift in the package and it is worth catching now, while it costs one substitution.

*Confirmed:* `drunk as much as each of them wanted` is used identically here and at B03-P031 for Butler's `drunk each as much as he was minded`.

### B03-P028

**28.1 — minor.** Current: `… — not while I live — nor will my sons after me, for they will keep open house as I have done.` Proposed: `… — not while I live — nor will my sons after me; they will keep open house as I have done.` Reason: Butler's `but` is the corrective *instead*: they will not permit it; on the contrary, they will keep open house. `for` converts it into a cause, asserting a logical relation Butler does not — and the glossary's voice rules name cause, contrast and sequence as the connections that must survive. A semicolon carries the contrast without an archaism.

*Confirmed:* the defective clause is handled correctly (section F2); Butler's `store both of rugs and cloaks` keeps its `both`; the interrupted opening is regrouped under `PUNCTUATION.md` section 3, which is the right class for it.

### B03-P029

**29.1 — optional.** Current: `He shall go back with you and sleep at your house`. Proposed: `He shall therefore go back with you and sleep at your house`. Reason: Butler's `he, therefore, shall return with you` draws the arrangement as a consequence of Nestor's offer; the candidate's flat statement loses the connective. Third small connective loss in the Book, with 7.1 and 15.1, which is why they are worth listing together rather than individually.

### B03-P030

No material issue found. `vouchsafe`, `shewed` and `redoubtable` are all correctly gone; the heifer keeps all four attributes and the gilding promised twice; `the Trito-born` is upheld (section F3).

*Also noted:* `all marvelled as they beheld it` to `everyone marveled as they watched her go` adds a departure to Butler's `it`; the departure is in the previous clause, so nothing is asserted that is not there.

### B03-P031

No material issue found. The eleven-year-old wine, the housekeeper's lid, the room over the gateway, the one unmarried son and the inner room all survive exactly.

### B03-P032

**32.1 — minor.** Current: `so Nestor sat in his seat, sceptre in hand`. Proposed: `scepter in hand`. Reason: **`sceptre` is the British spelling of `scepter`**, and D9 fixes American spelling. `continuity.md` and the README's check both exempt it on the ground that it is "the object's ordinary English name, not a spelling variant" — that is the `draughts` reasoning, and it does not transfer: *draughts* is a different **word** from *checkers*, whereas *sceptre* and *scepter* are a US-UK spelling pair exactly like *centre* and *center*. The glossary's own evidence method confirms it: the served `modern-en` has **scepter 3, sceptre 0**, which is the same test that settled `gray`. The README's British-spelling assertion currently whitelists `sceptr` by name, so this needs fixing in the check as well as in the text.

*Also noted:* `benches of white and polished marble` to `white polished marble` drops Butler's `and`, joining two attributes into one modifier string; trivial, but it is a concrete-detail smoothing of the kind the glossary warns about.

*Confirmed:* the six sons are named in Butler's order, `aforetime` and `the public weal` are gone, and `the equal of the gods in counsel` matches B03-P012 word for word.

### B03-P033

No material issue found.

*Also noted:* `propitiate` to `win the favor of` shades appeasement toward goodwill, which the context supports, since she has just appeared favorably; `The rest, stay all of you where you are` to `The rest of you, stay where you are` drops Butler's `all`, which was doing emphasis rather than counting.

### B03-P034

No material issue found. The anvil, hammer and tongs, the flower-patterned ewer and the basket of barley meal in one man's two hands, the sharp axe and the bucket all survive; so does Athena herself coming to accept the sacrifice.

### B03-P035

**35.1 — optional.** Current: `They cut out the thigh bones in due order`. Proposed: `They cut out all the thigh bones in due order`. Reason: Butler's `all in due course` carries a completeness marker as well as an order marker; `in due order` keeps the order and drops the `all`. The rendering `in due order` itself is right — see records finding R2 — because the modern idiom `in due course` has narrowed to *in time*, which is not the sense here.

*Confirmed:* the stroke through the tendons, the two layers of fat with raw meat on top, the five-pronged spits, and `screamed with delight` all stand; softening the ritual cry would have been a retelling, and it was not softened.

### B03-P036

No material issue found. Polycaste washing and anointing are kept as two acts; `henchmen` to `attendants` and `fair mantle` to `fine cloak` are both right.

### B03-P037

**37.1 — minor.** Current: `and in course of time completed their journey`. Proposed: `and in the course of time completed their journey`. Reason: this is a slip rather than a modernization. Butler has `in the course of time`; `in course of time` without the article is not current English and reads as a dropped word — the only outright error I found in the Book.

**37.2 — optional, and recorded chiefly for the reason.** Current: `bread, wine and sweetmeats fit for the sons of princes`. Reason: `sweetmeats` is opaque to most readers today — it means candied delicacies, not sweet meat — and is the fourth dated form to survive the guard. **I do not propose the obvious replacement.** The plain modern word here is *delicacies*, and `delicacies fit for princes` is verbatim the served `modern-en` splice sitting in the next paragraph of the served original, which the build explicitly asserts has not reached the candidate. Changing it would collide with that assertion and would look, to any later reader of the diff, exactly like the import the package has been careful to avoid. **Recommendation: keep `sweetmeats`, and record this reason**, so that a later pass does not "improve" it into the one word it must not use.

*Confirmed:* `nothing loth` to `readily enough` twice, as Butler repeats it; `corn lands` to `grain lands` is right for an American reader; `lashed` is kept; `darkness lay over all the land` matches B03-P038's rendering of the same Butler clause and deliberately avoids the splice's `covered`.

### B03-P038

**No material issue found in the rendering.** `Now when the sun had set and darkness lay over the land,` is Butler's clause, complete, and it is consistent with the same clause's rendering at B03-P037. The decision behind it is ruled on in **section C**: ship it, add decision row **D14**, and prepare the served-file repair text so that A3 becomes a one-line patch.

---

## H. Records findings, outside the text

**R1 — `GLOSSARY.md` and `book03/continuity.md` both state that Butler says the "excellent man" warranty twice "word for word". He does not.** B03-P002 is `he will tell no lies`; B03-P025 is `he will tell **you** no lies`. Correct both rows, and settle the flattening under the package's own B01-P019 and B03-P016 precedent (finding 2.2). The consistency discipline is the package's best feature, and this is the one place where it was applied to a sameness Butler had not written.

**R2 — `book03/continuity.md` lists `in due order` under "carried over from accepted Books 1 and 2". Neither Book contains the phrase** (checked in `book01/candidate-v3.json` and `book02/candidate-v2.json`: zero occurrences). What Book 2 carries is `in due course`, at B02-P011, rendering the *temporal* sense of the same Butler idiom. Rendering the two senses differently is correct and should be kept, so the fix is to the provenance claim, not to the text: record `in due order` as a Book 3 row, with the reason that the modern idiom has narrowed to the temporal sense.

**R3 — D12's class-C description and table are wrong in four respects**, set out with Butler's own words in section D: the class is described as recorded doubt that the passage belongs, and footnote 81 says the opposite; five of six instances are footnoted about the bracket, not three (fn 49 and fn 82 are both about their brackets); PG 6016's brackets are not Butler's at all (fn 122); and the first class-C bracket opens at PG 1552, not 1551.

**R4 — nothing in the package records that four of the six class-C brackets are never closed.** PG's translation body holds **15 opening brackets and 11 closing ones**, and the served `original-en` reproduces the same imbalance exactly. All nine class-A and class-B brackets close; PG 1552, 4260, 5691 and 6016 do not. This is decisive for the class-C ruling and should be recorded in `GLOSSARY.md` beside the enumeration, with the asymmetry noted as evidence about what the marks are.

**R5 — the README's archaism regression guard does not cover the forms that actually survived.** Add `twelvemonth`, `sweetmeats`, `in course of time` as a phrase, and `towards`, and remove the `sceptr` exemption from the British-spelling assertion. The guard is a good instrument and it passed while four dated forms stood; that is worth one line of maintenance rather than a finding against the draft.

---

## I. What I checked and found clean, so a later pass does not redo it

- **Alignment and identity.** 38 paragraphs, one-to-one, in order; no paragraph contains a newline; `source-book3.json` byte-identical to the served chapter; the candidate's title is the source's title and contains no mapping-row name.
- **Names.** Odysseus 7, Athena 18, Zeus 8, Poseidon 6, each matching the source's Roman count exactly; no Roman form survives; `Rhea`, `Helios`, `Cronos` never appear; `heaven` is 12 in both files, untouched; `Apollo`, `Hades`, `Amphitrite` correctly not mapped; `Diomed` kept and flagged; `Mycenae` correct and unique.
- **Possessives.** `Telemachus’s` four times, `Achilles’s`, `Menelaus’s`, no bare survivor, per D7 — against a source that is inconsistent.
- **Punctuation.** Zero ASCII quotes or apostrophes; 42 open and 35 close, matching the source; the seven D4 paragraphs are exactly the source's seven, and each continuing paragraph opens its own mark. This is the package's largest use of D4 and it is exact.
- **Formulas inside the Book.** `he is an excellent man` twice (but see 2.2 on the word before it), `honor … the Achaean name` twice (see 11.1), `the equal of the gods in counsel` twice, the dawn formula twice, `readily enough` twice, `inner meats` three times and `outer meats` twice — all identical in each pair.
- **Formulas across Books.** `show your mettle and make yourself a name in story`, `tell me truly`, `mound` for *barrow*, `drink offering`, and the Book 1 and Book 2 rows generally — all consistent with accepted Books 1 and 2. The only cross-Book drift found is 27.1's hyphen.
- **Speeches.** Every direct speech is direct speech; none is summarized or reported; the three regrouped speech tags (B03-P006, P009, P011) and B03-P028's are all of the class `PUNCTUATION.md` section 3 normalizes, and B03-P003's interrupted question is correctly left alone.
- **Quantities and objects.** Nine companies of five hundred and nine bulls each; the sheepskins; the golden cup; the marble benches; the anvil, hammer and tongs; the gold; the ewer and basket in one man's two hands; the axe; the bucket; two layers of fat; five-pronged spits; eleven-year-old wine; the room over the gateway; the seven years, eighth year, four days, three generations, nine years, five and six years. Nothing generalized, nothing supplied.
- **Genealogies.** Six named sons and which is unmarried; Eurydice eldest daughter of Clymenus; Polycaste youngest; Diocles son of Ortilochus and grandson of Alpheus; Neoptolemus son of Achilles; Philoctetes son of Poias; the sons of Atreus; Clytemnestra Agamemnon's wife. All exact.
- **No imported phrasing.** Section B.
