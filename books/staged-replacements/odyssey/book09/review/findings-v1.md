# Odyssey Book 9, `candidate-v1.json` — round 1, independent review

**Subject:** `book09/candidate-v1.json`, sha256 recomputed here as
`41f452ac577054aa820eba1cf1bb20cc24b382e6e3330b74af8c24f657c481fb` — the
frozen hash, and `scripts/draft_book09_v1.py` reproduces the file byte for byte
on a fresh copy. Source `book09/source-book9.json`, sha256 recomputed as
`575f8c8693ccefbd4c2a3a9b36d5e61244ecba2f6cb042f65d257fd6aa77561f`.
44 paragraphs, 15 packets; `manifest.json`'s coverage claim independently
re-checked (44 assigned, 44 unique, none missing), and every packet quotes its
source and candidate paragraphs verbatim.
**Trunk:** `claude/odyssey-modern-en-20260911` @ `2c6931356`.
**Review branch:** `claude/odyssey-book09-review-20260913`, own worktree.
**Reviewer:** a separate session. Did not draft this Book.

Nothing outside `book09/review/` and the final `RESUME.md` / ledger commit was
written. `candidate-v1.json` is untouched (**D10**). `app/public/data/editions/**`
was read and never written. Zero Anthropic API spend; no network call to
`api.anthropic.com`; `generate-editions.cjs` not invoked. English only.

**Basis: all 44 paragraphs** (R-1). Every figure below was recomputed by
`book09/review/recompute.py`, which imports nothing from `scripts/` and
re-implements each measure from `GLOSSARY.md` and from the prose of
`checks.py`'s docstrings. Source verification is
`book09/review/verify_source_book9_review.py`, a fifteenth kind of rule. The
third attack on the manifest is `book09/review/attack_manifest_a11.py`.

---

## 1. Verdict

**Accept with corrections.** The text is good: Butler's clauses are cut apart
and not shuffled, thirty of his dividing marks are cashed where cashing is
right, and fourteen of the fifteen pre-freeze collision repairs resolve toward
**Butler's own word**, which is a better discipline than the one that produced
Book 8's `minstrelsy` error. But the Book's headline claim — *not one of the
41 dividing marks is the draft's own* — is **false as stated**, the D4
paragraph in `continuity.md` §4 is **wrong at both ends**, six rendering
collisions survived the check, and the published retention is a figure no file
in the package produces.

| severity | count |
|---|---|
| **substantive** | **7** |
| minor | 9 |
| records | 8 |
| optional | 3 |
| **paragraphs covered** | **44 of 44, each exactly once** |

Nothing here requires the candidate to be rebuilt from scratch. S-1, S-2, R-1
and R-2 are corrections to the **record**; S-3, S-4 and S-5 are eleven word
changes in nine paragraphs.

---

## 2. The five numbers, recomputed, with the basis on every one

All on **all 44 paragraphs**, source `book09/source-book9.json`, candidate
`book09/candidate-v1.json`.

| | published | **recomputed here** | |
|---|---|---|---|
| Butler token retention (canonical, aggregate-join) | 0.92164 *(README, `continuity.md`, ledger, `RESUME.md`)* / 0.92181 *(`checks-v1.md`, `manifest.json`)* | **0.92181** | **R-1 — the package publishes two, and the prose one is wrong** |
| raw splitting rate (D17) | +21.1% | **+21.1%** (171 → 207) | agrees |
| **NORM RATE, D27, on Butler's pointing — the compared figure** | +2.5% | **+2.5%** as the package defines it; **+1.7%** on strict mark identity; **+1.2%** discounting the P041 bracket artefact | **S-1** |
| dividing marks, kept + added | 71 → 41, **41 kept + 0 added** | 71 → 41; **39 kept by identity + 2 class-changed + 0 newly written** | **S-1** |
| MOVE-GAP / displaced runs | 0.01266 / 2 | **0.01266 / 2** (`«we saw a great cave»` P011, `«with such a noise»` P014) | agrees |

Also recomputed and agreeing: sixty-word 16 → 0; semicolons 54 → 24 with
24 kept and 0 added; bag retention 0.93447; order retention 0.92181; five
sentences grown to 40+ and none past 50; 37 candidate sentences over 40 words.
**Word ratio is 0.99138**, not the 0.993 published in `README.md` and
`continuity.md` §1 (R-3).

`python3 scripts/checks.py 9` reproduces `book09/checks-v1.md` **byte for
byte** on a fresh copy, and `--all`, `--manifests` and `--declarations` all
exit 0. The instruments are sound; four of the five prose copies of their
output are not.

---

## 3. Substantive findings

### S-1 — "41 kept + 0 added" is not what it says, and the compared figure is between +1.2% and +1.7%

The census counts a candidate mark as **kept** when the strongest mark Butler
wrote in the aligned span is *any* member of `DIVIDING`. It does not ask
whether it is **the same mark**. Book 9 contains two places where it is not:

| ¶ | Butler | candidate |
|---|---|---|
| **B09-P009** | `Heaven sent us excellent sport**;** I had twelve ships` | `Heaven sent us excellent sport**:** I had twelve ships` |
| **B09-P013** | `They were kept in separate flocks**;** first there were the hoggets` | `They were kept in separate flocks**:** first the yearlings` |

and two places where a colon of Butler's was cashed for a period:

| ¶ | Butler | candidate |
|---|---|---|
| **B09-P012** | `and one housekeeper**:** when he drank it` | `and one housekeeper**.** When he drank it` |
| **B09-P021** | `the best plan to do as follows**:** The Cyclops had` | `the best plan**.** The Cyclops had` |

The colon census therefore reads `7 → 7` and calls the class untouched, and it
is **not** untouched: two of Butler's colons were spent and two new ones were
written over his semicolons. **This is substantive finding S-1/M-4 of Book 8's
round recurring one Book later**, in the class D27 was widened to cover. The
em dashes are clean — all ten are Butler's, in Butler's places — and so are
all 24 semicolons.

What it costs the headline. `norm_rate_butler_ext` is
`(207 + kept) / (171 + 71)`:

* as the package computes it, `kept = 41` → 248/242 = **+2.5%**;
* counting a mark as kept only when Butler wrote **that mark** there,
  `kept = 39` → 246/242 = **+1.7%**;
* and one of the six net divisions is not a division of Butler's prose at all
  but the mechanical consequence of deleting his unclosed square bracket at
  P041 (§4, R-6): 245/242 = **+1.2%**.

`README.md`'s *"not one of the 41 marks the candidate carries is its own — on
the semicolon, the colon or the dash"* is false on the colon, and
`continuity.md` §1's *"there is nothing in this Book's figure that a keystroke
paid for"* is true of the count and not of the identity.

**Neither conversion is wrong as English** — a colon is better than Butler's
semicolon in both places, because both introduce a list. The finding is that
the package cannot see the difference between improving Butler's pointing and
leaving it alone, and published a claim that depends on the difference.

**Fix (records, not text):** split `kept_added_div()` into *kept*,
*class-changed* and *added*, publish the three, and say in `continuity.md` §1
which two marks moved class and why.

### S-2 — the D4 paragraph is wrong at both ends, and the app question is four chapters long, not one

`continuity.md` §4 and question 1 of `review-instructions.md` both state that
*"every paragraph from P001 to P044 opens with `“` and none but the last closes
one."* Measured (`recompute.py`, and trivially by hand):

* **B09-P001 does not open with `“`.** It opens `And Odysseus answered, “King
  Alcinous, …` — the poet's frame, then the quotation.
* **B09-P044 does not close one either.** Every one of the 44 paragraphs,
  P044 included, ends with quote balance **+1**. Butler closes this quotation
  nowhere in Book IX.

The served `original-en` corpus says where it does close. Counting paragraphs
that open a quotation and do not close it: **chapter 9 has 43 of 44, chapter 10
has 49 of 49, chapter 11 has 47 of 54, chapter 12 has 38 of 39**, and chapter
12's last paragraph is the first since B09-P001 to end with `”`. Chapter 13's
quote balance is zero. Odysseus's speech is opened at B09-P001 and closed four
chapters later, and **177 paragraphs in between open a quotation nobody
closes**.

This changes the answer to question 1 rather than answering it. In a paginated
reader the convention is not *43 paragraphs without a closing mark*; it is
**186 paragraphs across four chapters** — every chapter boundary among them a
place where a reader who opens chapter 10, 11 or 12 directly meets an opening
quotation mark on every paragraph and no speaker. This Book is not "the largest
instance the edition will ever have"; it is the first quarter of it.

**Fix:** correct §4 and `PUNCTUATION.md` §2; state the span as chapters 9-12;
and put the app question as *"how does the reader know, on entering chapter 11,
who is speaking?"*, which is a different and larger question than a dropped
quote.

### S-3 — six rendering collisions survived the check, all of them on words too common for arrow B's gate, and one of them is the repair's own doing

`rendering_collisions.py` states its design in its own docstring: **"only
Butler's rare words count"** — `rare = {w for w, n in freq.items() if n <=
RARE_MAX and len(w) >= MIN_LEN}`, with `RARE_MAX = 3` paragraphs and
`MIN_LEN = 5` letters. Every collision below is on a word that clears neither
bar. **Four of the six appear nowhere in the 110-row report**; `snatch`,
`clutch`, `cried`, `exclaimed`, `drove`, `mob` and `flock` are absent from
`book09/collisions.md` entirely. **Two were reported and dismissed**, and
their dispositions are the subject of the note after the table.

| ¶ | Butler | candidate | the word it collides with |
|---|---|---|---|
| **P019** | `with a sudden **clutch** he gripped up two of my men` | `with a sudden **snatch** he gripped two of my men` | Butler's own `I **snatched** up a long pole`, P036 |
| **P019** | `The cruel wretch **vouchsafed** me not one word of answer` | `The cruel wretch **gave** me not one word of answer` | Butler's own `gave`, P005, P017, P021, P024 |
| **P019** | `and **supped upon** them` | `and **made his supper of** them` | Butler's own `supper`, P014 (twice) and P021 |
| **P018** | `‘Neptune,’ said I, ‘**sent** my ship on to the rocks` | `‘Poseidon,’ said I, ‘**drove** my ship on to the rocks` | Butler's own `drove`, seven times, always of driving flocks — and his own `We were **driven** on to them` in the very next sentence |
| **P037** | `‘Do not,’ they **exclaimed**` | `‘Do not,’ they **cried**` | Butler's own `cried`, P020 and P039 |
| **P033** | `but lead the **mob** with a run` | `but lead the **flock** at a run` | Butler's own `flocks`, P011, P013, P021 |

**P019's `snatch` is the answer to question 3, and it is not a good one.** The
collision record's own row reads:

> P020 · `he snatched up two more` → `he clutched up two more` · B ·
> collided with Butler's own `I snatched up a long pole` at P036.

The repair is correct and it restored Butler's word. But in the same draft, one
paragraph earlier, Butler's `clutch` was rendered `snatch` — so the collision
the P020 repair removed was re-created at P019, and Butler's own
`clutch`/`clutched` pair at P019/P020 was flattened in the opposite direction
at the same time. **Nothing checks whether an arrow's repair is right, and
nothing checks whether the draft creates the same collision somewhere the arrow
cannot look.** Here the arrow could not look because `snatch` (5 letters,
common) is under its own gate.

**And the two that WERE reported were dismissed by a disposition that answers
a different question.** This is blind spot 8 — *whether a disposition is
right* — with two instances:

* **`vouchsafed` → `gave`** is row 65, dispositioned `variant`: *"`vouchsafe`
  survives only in legal and liturgical registers; the sentence's force is in
  `not one word`, which is kept exactly."* True, and beside the point: the row
  was raised by **arrow A**, which is keyed on Butler's word across Books, so
  the disposition rules on whether `gave` is an acceptable modernization of
  `vouchsafed` and never asks whether `gave` is free in Book 9. It is not —
  Butler uses it four times.
* **`supper`** is row 126, dispositioned `common-rendering`: *"`supper` is a
  word Butler himself uses in 16 paragraphs across seven Books, so its reuse as
  a rendering is not a decision; arrow B is ungated on this side on purpose and
  **arrow C carries the residue**."* Arrow C is **same-paragraph only** — the
  record says so in four places. P019's `made his supper of them` and P014's
  and P021's `supper` are in different paragraphs, so the residue this
  disposition hands to arrow C is residue arrow C cannot take. **The
  disposition invokes a safety net that does not cover the row it is
  dismissing.**

**Fix:** P019 `a sudden clutch` (Butler's word, and current English);
`would not give me one word of answer` → something that is not `gave`, e.g.
`The cruel wretch did not answer me with one word`; P019 `ate them for his
supper` → `devoured them`; P018 `sent my ship on to the rocks` (Butler's own);
P037 `they said` or `they begged`; P033 `lead the ewes at a run`.

### S-4 — `humane` → `civilized` at B09-P010, justified by citing the draft's own word as Butler's

Butler: *"I want to see if they are **uncivilised savages**, or a hospitable and
**humane** race."*
Candidate: *"I want to see whether they are **wild savages**, or a hospitable
and **civilized** race."*

**And the collision check raised it.** Arrow A prints the row —
`humane · civilized (B9-P010) | humane (B6-P011) | humane (B8-P050)` — and
`book09/collisions.md` row 45 dismisses it, `kept-elsewhere`:

> Book 9 supplies the row's only rendering (`civilized`); every other entry is
> Butler's own `humane` carried through unchanged by another Book. **There is
> one rendering decision in this row, not two, so there is nothing to
> reconcile.**

There is one rendering decision in the row and **that decision is the
problem**. The disposition is boilerplate — the identical two sentences, word
for word, dispose of `bloom`, `dozen`, `entered` and thirteen other rows — and
it answers a cross-Book consistency question the row does not pose. A generated
sentence that is the same for sixteen rows is a record that somebody ran a
script, not a record that somebody ruled.

`continuity.md` §6 records only the first half of the change and its reason:

> `uncivilised savages` → `wild savages`. Butler's pair is tautologous in
> modern English; the contrast the sentence draws is with `a hospitable and
> civilized race`, **which keeps the root**.

The root is kept by a word **the draft wrote**. Butler's second limb is
`humane`, and the draft changed it. The recorded rationale is circular: it
removes `uncivilised` on the ground that `civilized` survives, and `civilized`
survives only because it replaced `humane`.

And the substitution costs the sentence its point. `humane` is *merciful,
kind* — the quality the Cyclops is about to be shown not to have, in an
episode whose whole subject is what a host owes a guest. `civilized` makes
Odysseus's question about technology and law, which is the question the
previous paragraph (P006-P007: no ploughing, no ships, no assemblies) has
already answered.

**Fix:** `wild savages, or a hospitable and kindly race` — or restore Butler
whole: `savages with no law, or a hospitable and humane people`.

### S-5 — three words are supplied, and `continuity.md` §5 asserts that none is

§5 lists one supplied word (`you` at B09-P015, under D16 clause (b)) and then
says:

> **No other word is supplied anywhere in the Book**, which the draft script
> does not assert (it cannot) and which a reviewer should test.

Tested. Three others:

| ¶ | Butler | candidate |
|---|---|---|
| **B09-P022** | `how can you expect people to **come see** you any more` | `how can you expect people to **come and see** you any more` |
| **B09-P035** | `You wretch, **eat up** your visitors in your own house?` | `You wretch, **to eat up** your visitors in your own house!` |
| **B09-P044** | `I **bade my men on board** and loose the hawsers` | `I **told my men to go on board** and loose the hawsers` |

P044's and P035's are grammatical restructurings and need no rule. **P022's is
not**: `come see you` is a defect of the same kind as `Where do sail from?`,
in the same Book, four paragraphs later — an elided word — and the draft
repaired it silently while declaring the other one. Either both are D16(b) or
neither is.

**Fix:** add P022 to the §5 table with the same rule and the same parallel
(`come and see`, and Butler's own `go on board` at P005 and P044); and
soften §5's closing sentence, which as written is a claim a reviewer disproved
in one grep.

### S-7 — A7 is incomplete, and Butler's Preface says so: PG's Book II does not end with the comma Butler says he preferred

This is outside Book 9, and it is here because the round was asked to prefer
**evidence from the source over inference from the package**, and because
A3-widened is prepared and waiting on Anders.

The same sentence of the Preface to the First Edition that settled the capitals
settles something else beside them:

> *"the Leipsic Teubner edition of 894 makes **Books ii. and iii. end with a
> comma** … from a spirit of mere conservatism, **I have preferred to do so**."*

**Two Books, ii and iii. PG honours it for iii only.** Verified in the file:

| | PG #1727 | |
|---|---|---|
| end of **Book II** | `Thus, then, the ship sped on her way through the watches of the night from dark till dawn**.**` | a **full stop** |
| opening of **Book III** | `**but** as the sun was rising from the fair sea…` | **lower case** |
| end of **Book III** | `Now when the sun had set and darkness was over the land**,**` | a **comma** |
| opening of **Book IV** | `**they** reached the low lying city of Lacedaemon…` | **lower case** |

Book III's lower-case opening is internal evidence, independent of the
Preface, that something ends in a comma before it — and what precedes it ends
in a full stop. **PG's Book II terminal period is almost certainly a
transcription slip**, and it is a third member of the register S-5's ruling
asks for: a defect PG and the served file share.

**What this costs A3-widened, which nobody has noticed.** A3-widened restores
the lower-case openings of Books III and IV. Applied as prepared, the served
edition would then read:

> … from dark till dawn**.**
>
> **but** as the sun was rising from the fair sea …

— a lower-case sentence opening after a full stop, which is not Butler's
device, is not PG's intention, and looks like a bug for a reason A7's write-up
does not mention. A7 argues the capitals destroy a half-sentence; restoring the
capital's absence without restoring the comma leaves the half-sentence half
restored.

**Recommendation for Anders, with A7:** either widen A3 once more, to Book II's
terminal comma — for which Butler's own stated preference is the authority, and
which makes the served text match what Butler says he wrote — or leave Book
III's opening capitalized and restore only Book IV's, whose protasis (Book
III's comma) PG does carry. **The two cannot be decided separately**, and the
patch as prepared and hashed (`e45d6c4d…`) decides only one of them.

### S-6 — the manifest, third attack: **nothing pins Butler** (A11)

`scripts/prove_manifest.py` is nine attacks and twenty-five assertions, and
every one of them moves the **candidate** or the **manifest**. None moves the
**source**, and no clause pins it. Full write-up and a reproducible script in
§7.

---

## 4. Minor findings

**M-1 — B09-P021 and B09-P031: a cataphoric `this` stranded by a cashed
colon.** Butler: *"In the end I deemed it would be the best plan **to do as
follows:** The Cyclops had a great club …"*. Candidate: *"In the end I judged
**this** would be the best plan. The Cyclops had a great club …"*. `this` now
points forward across a full stop, so a reader takes it backward first and has
to re-read. Same shape at P031 (*"In the end I judged that **this plan** would
be the best."*), where Butler's semicolon did the same work. This is blind spot
2 — a garden path the draft builds out of a mark — and it is the clearest case
in the Book of a mark that should **not** have been cashed. Suggested: *"In the
end this was the plan I settled on: the Cyclops had a great club …"*

**M-2 — B09-P042: `So did he pray` reads first as *he prayed too*.** Butler's
`Thus did he pray` cannot. This is Book 8's M-2 (`Even so`) in a new place;
note that where the candidate keeps the inversion **and** the correlative
(`Even so did we bore`, `even so did the Cyclops' eye hiss`, P026) there is no
hazard, so the fix is local. Butler's `Thus` survives at P009 and P044 and is
dropped at P026 (twice), P032, P033 and P042 — `checks-v1.md` §9 prints
`thus · 5 changed · 2 kept` and nothing acted on it. Suggested: *"So he
prayed, and Poseidon heard his prayer."*

**M-3 — B09-P016: a supplication becomes a command.** Butler: *"**May your
excellency fear** the wrath of heaven, for we are your suppliants."*
Candidate: *"**Fear** the wrath of heaven, **sir**, for we are your
suppliants."* Two sentences earlier the candidate has *"We therefore humbly beg
you"*. Odysseus does not order the Cyclops to do anything until P035, after he
is at sea. `continuity.md` §6 rules only on `your excellency` → `sir`, which is
right; the imperative is the part that moved and it is not recorded. Suggested:
*"Fear the wrath of heaven, sir"* → *"We beg you to fear the wrath of heaven,
sir"*.

**M-4 — B09-P039: `whereas` → `and`, dropping the contrast the sentence is
made of.** Butler: *"I have been all along expecting some one of imposing
presence and superhuman strength, **whereas** he turns out to be a little
insignificant weakling."* The candidate writes `and`. `whereas` is kept at
P022, so this is one Butler word two ways inside one Book, and the rendering
that changed is the one where the word was load-bearing.

**M-5 — B09-P026: `besmirched` → `besmeared`.** A current English word
replaced by a rarer one, for nothing. This is the `luscious` shape — the third
occurrence of which the collision check caught at P007 in this same draft — and
it went uncaught because it is a substitution, not a collision.

**M-6 — B09-P013: `ill to deal with` → `bad to deal with`.** Butler's idiom
means *hard to deal with*; `bad to deal with` is not English. `hard` is free
here (the draft's own `hard pressed` at P003 is Butler's).

**M-7 — B09-P003: `my men very foolishly would not obey me` → `my men were
fools and would not obey me`.** Butler grades an action; the candidate grades
the men, who are about to be eaten. A small register change in the direction of
harshness.

**M-8 — B09-P016: `but by the will of Jove` → `and by the will of Zeus`.** The
concessive is the point: *we are on our way home from Troy — **but** we have
been driven off course.*

**M-9 — B09-P002: a crux Butler footnotes at length is settled silently.**
Butler: *"It lies squat on the horizon, **all highest up in the sea towards the
sunset**"* — and footnote [48] of PG #1727 is four hundred words on exactly
this clause, beginning *"I give the usual translation, but I do not believe the
Greek will warrant it"*, and offering `on the horizon, all highest up in the
sea towards the West` against `some way off it to the East` for the other
islands. The candidate writes `Ithaca lies low on the horizon, farthest out to
sea toward the sunset`, which takes the side Butler declines to take. Defensible
for a modern edition — a modern edition must choose — but it should be
**recorded**, because the served `original-en` strips the footnotes and the
reader of the modern text has no way to know a choice was made. Same class as
R-6.

---

## 5. Records findings

**R-1 — the published retention is a figure no file in the package
produces.** `README.md`, `continuity.md` §1, `RESUME.md`'s table and the
ledger's comparability table all print **0.92164**, and `continuity.md` §1
prints bag retention **0.93430**. `checks-v1.md` and `manifest.json` print
**0.92181** and **0.93447**, and those are what the frozen candidate gives —
independently confirmed here, and `checks.py 9` reproduces `checks-v1.md` byte
for byte. The two differ by 0.00017 in **both** measures, and 0.00017 × 5 845
source tokens = **exactly one token**: the prose figures were computed over a
candidate one matched token away from the frozen one, i.e. **before the last
collision repair**. `continuity.md` §1's opening sentence — *"Every one of them
is written by `scripts/checks.py`, not typed"* — is false for these two and for
the word ratio.

**R-2 — and `scripts/draft_book09_v1.py` publishes a third.** Its docstring
says *"Retention **0.91976** on the canonical aggregate-join measure"*. Three
retentions for one file, in three committed places. The same docstring says the
compared figure is *"within a fifth of a point of the unguarded one (+2.5%)"*
and then prints +2.5% for both, which is zero points, not a fifth.

**R-3 — word ratio.** Published as **0.993** in `README.md` and
`continuity.md` §1. It is **0.99138** (5 800 → 5 750 whitespace words), as
`checks-v1.md` correctly prints. 0.99138 rounds to 0.991.

**R-4 — PG's inline numerals are footnote anchors, not page numbers.**
`continuity.md` §2 and `RESUME.md` both describe the fourteenth rule's audit
failure as *"PG prints **page numbers** inline, sometimes as a bare token (`72`,
Book 8) and sometimes glued to the preceding word (`dawn.75`, `another.76`,
`lotus77`, Book 9)."* They are **footnote reference numerals**: `lotus77` is
the anchor of note **[77]**, which reads *"cf. 'Il.' ii. 776 … In the 'Iliad'
they are used of the horses of Achilles' followers as they stood idle,
**'champing lotus.'**"* The numbering is global, 1 to 187, strictly increasing
through the body, and the package **already uses it** — it is the first of the
fourteen rules, and the twelfth's clause 2 strips it by name. Calling it a page
number hides that it is an ordered, checkable stream and makes the audit's
lesson smaller than it was.

**R-5 — (b3) covers the manifest and nothing covers the prose.** Clause (b3)
of `verify_manifest` recomputes sixteen figures and compares them with
`manifest.json`. Four other committed files carry the same figures —
`README.md`, `continuity.md`, `RESUME.md`, `00-progress-ledger.md` — and
nothing compares any of them with anything. That is exactly how R-1 survived
the freeze, and it is the same disease as the one `checks.py`'s own docstring
describes: *a check written once and never called again*. A one-page
`--prose` clause that greps the four files for the manifest's numbers would
close it.

**R-6 — Butler rules on the B09-P041 bracket himself, twice, and the record
cites neither.** `continuity.md` §5 removes the unclosed `[` under D16 and D12
and calls it *"an editor's mark for a suspected interpolation"*. Butler says
which interpolation, in two places no rule in this package has read:

* **Footnote [82]:** *"This line exists in the text here but not in the
  corresponding passage xii. 141. I am inclined to think it is interpolated
  (probably by the poetess herself) from the first of lines xi. 115-137, which
  I can hardly doubt were added by the writer when the scheme of the work was
  enlarged and altered."*
* **Preface to the First Edition:** *"the introduction of lines xi., 115-137
  and of **line ix., 535** … were the only things that were done to give even a
  semblance of unity to the old scheme and the new."*

Line ix. 535 **is** the bracketed clause. This is the same channel — Butler's
own Preface — that settled A7, and it is the standard the round was asked to
hold to: **evidence from the source over inference from the package.** The
removal is right; the reason recorded for it is a guess where a statement was
available. Recommended: quote both in §5, and note that the new full stop it
creates is counted as one of the Book's six net divisions although Butler wrote
no prose there to divide (S-1).

**R-7 — `collisions.md` is regenerated from the FROZEN candidate, so the
fifteen repairs are invisible in it.** The generated report contains no row for
`snatch`, `clutch`, `cried`, `exclaimed`, `drove`, `mob`, `flock`, `horrid`,
`spring`, `growing`, `turns`, `belly`, `known`, `stayed` or `settled` — the
words the repairs moved — because the repairs removed the rows. The only record
that the fifteen repairs happened is `continuity.md` §7's **hand-typed** table,
which nothing checks, over a draft state that no committed file preserves. A
reviewer cannot verify a single one of the fifteen from the generated
artefact; I verified them against PG by hand instead (§9, question 3).
Recommended: have the drafter write the pre-repair report to
`book09/collisions-predraft.md` and hash it into the manifest, so the claim
"fifteen repairs, six of them arrow B" is evidence rather than testimony.

**R-8 — `README.md` over-reads the agreement of the two NORM RATEs.** *"the
two NORM RATEs (guarded and unguarded) agree to the decimal, which is what it
looks like when a figure is not bought with pointing."* They agree because the
**count** of Butler's marks the candidate carries equals the count of marks it
carries at all. S-1 shows the identity is not asserted, so the agreement rules
out *newly written* marks and does not rule out *exchanged* ones — which is
what happened.

---

## 6. Optional

**O-1 — B09-P019 word order.** Butler *"So we stayed sobbing and sighing where
we were"* → *"So we stayed where we were, sobbing and sighing"*. Both read;
Butler's puts the sobbing first, which is the point of the sentence.

**O-3 — `checks-v1.md` §6 is headed *"Every candidate sentence over 40 words
(absolute)"* and lists sentences of exactly 40.** Three of the 37 are 40-word
sentences; the code's threshold is `>= 40` and the heading says *over*. The
count 37 is right for the threshold the code uses; the sentence above it is
wrong by three. Independently recomputed: 37 at `>= 40`, 34 at `> 40`. (§5's
five growth rows and §8's seven near-identical paragraphs both reproduce
exactly.)

**O-2 — hyphenation drift in two directions.** `drink-offering` →
`drink offering` (P022) opens a compound Butler closes; `bowl full` →
`bowlful` (P023) closes one he opens. Neither is wrong; neither is recorded,
and `compound_drift()` sees neither, because `drink offering` and `bowl full`
both have a stop-word or a non-head element. Worth a line in §H.1 if the
successor touches them.

---

## 7. The third attack on the manifest — A11, and A9's hatch is wider than stated

Script: `book09/review/attack_manifest_a11.py`; output beside it.

### The hole

Every one of `prove_manifest.py`'s nine attacks moves the **candidate** (A6,
A7, A8), a **manifest field** (A1-A5), the **renderer** (A10) or a
**declaration** (A9). Clause (b3) is the strongest clause in the file and it
reads:

```python
fr = figures(book, load("book%02d/source-book%d.json" % (book, book)),
             load(ck["candidate_file"]))
```

The candidate is named by the manifest, hashed by the manifest and checked by
(b) and (b2). **The source is loaded by naming convention and is hashed by
nothing.** Its sha256 appears in no `manifest.json`, in no `ACCEPTED` row, in
no `DECLARED` row, in no `SUPERSEDED` row and in no assertion of
`prove_manifest.py`. Retention, the splitting rate, both semicolon censuses,
both dividing-mark censuses, MOVE-GAP, the sixty-word gate, the thinness gate,
the growth gate and the byte-identity gate are **all** computed against it. It
is the one end of every comparison the package makes, and it is unheld.

`verify_source_bookN.py` does tie it to PG #1727 — but those scripts are
standalone. `--all` does not call them, `--manifests` does not call them,
`build_book_package.py` does not call them and `prove_manifest.py` does not
call them. Their evidence is a committed `.txt` that no clause re-derives, and
`source-verification.txt` is not in any manifest either.

### A11(a), the loud form — **it lands, on the Book under review**

Turn twelve of Butler's full stops in `book09/source-book9.json` into
semicolons: the source's sentence count falls, its dividing-mark count rises,
and the candidate looks as though it divided far more than it did. Then run the
**ordinary workflow**, `python3 scripts/checks.py 9 --write-manifest`.

```
BEFORE regenerating, --manifests DOES catch it — clause (b3) is doing its job:
  ✗ manifest: book09 records sentences = [171, 207], and
    book09/candidate-v1.json gives [159, 207]

after `checks.py 9 --write-manifest`:
  ✓ checks.py 9 passes          ✓ --manifests exits 0
  ✓ --all exits 0               ✓ --declarations exits 0
  published raw D17   21.1%  ->  30.2%
  published retention 0.92181 -> 0.92181     (no token moved)
  and DECLARED is byte-identical — no declaration was needed
```

**A Book's headline rate is raised by nine points and every instrument in the
package says the figures reproduce**, because they do: they reproduce against
a Butler nobody holds.

### A11(a) on an ACCEPTED Book — caught, and not by anything about the source

The same attack on `book08/source-book8.json` **is** caught: `--manifests`
fails afterwards. But the failures name **book01 … book07**, not book08. Book 8
is accepted, so its figures are printed in the cross-Book table of every other
Book's `checks-vN.md`, and those generated files stop reproducing — the **A10**
clause, firing on an **accidental coupling**. Two things follow. **Book 9 is
not in that table**, so an unaccepted Book has no such accident protecting it;
and the documented remedy for A10 — *"accepting a Book now means re-running
`checks.py N --write-manifest` for every Book"* — is also the attacker's next
move, and it is one command.

### A11(b), the silent form, and it is the worse one

Remove **one comma** from one paragraph of `book08/source-book8.json`
(`Now when the child of morning, rosy-fingered Dawn, appeared,` →
`Now when the child of morning rosy-fingered Dawn, appeared,`). No token moves,
so retention, bag retention and MOVE-GAP do not move. No sentence boundary
moves, so D17, the sixty-word gate and both NORM RATEs do not move. No `;`, `:`
or sentence-internal `—` moves, so neither census moves. Not one of the sixteen
recorded figures changes, the `checks-vN.md` the code would render is
byte-identical, **and nothing has to be regenerated at all.**

```
  ✓ checks.py 8 still passes over a corrupted Butler   ("all gates pass")
  ✓ --manifests still exits 0
  ✓ --all still exits 0 — "every published figure reproduces"
  ✓ and the source on disk really did change
```

The committed manifest is untouched, `checks.py` is untouched, `DECLARED` is
untouched, and every instrument in the package passes over a Butler that is not
Butler's. **13 of 13 assertions held**; the full output is beside the script.

### And A9's hatch is wider than the record says

`RESUME.md` says of A9: *"What the repair buys is that the reason must exist,
be evaluated, and appear in a diff."* Two qualifications:

1. **A11 needs no declaration at all.** `DECLARED` is unchanged, `checks.py`
   is byte-identical, and the diff a reviewer would read is a diff of
   `source-bookN.json` — a file whose job is to be a verbatim copy of
   something else, and which therefore nobody reads for content.
2. **`DECLARED` only requires a reason when a row declares something.**
   `declaration_coverage()` demands a written reason only `if any(d[k] for k in
   ("byte_identical", "thin", "growth", "compound"))`. Every other gate —
   D17's floor, the sixty-word survival gate, D9/D12 hygiene, the word-ratio
   band — has **no** declarable escape, which is good; but it means A9's
   "declare it" is narrower than the sentence suggests, while A11's "don't
   declare anything" is wider.

### What would close it

One line in `--write-manifest` and one clause in `verify_manifest`:

```
"source_file":   "book09/source-book9.json",
"source_sha256": "…",
```

and, in the same clause, an assertion that `source-bookN.json` is
**character-identical to the corresponding chapter of
`app/public/data/editions/odyssey-original-en.json`** — which is read-only to
this package and is the thing the source rules actually verify. The
per-chapter sha256s of the nine source files are printed at the end of the
attack's output so the first manifest write has them to hand.

---

## 8. Source verification — a fifteenth kind of rule, and it holds

`book09/review/verify_source_book9_review.py`, output beside it. Exit 0.

**The channel is Butler's own PREFACE**, which `RESUME.md` names as the one
still unused and which A7 has just shown to be load-bearing. The Preface to
the First Edition states the architecture of the poem in Butler's words:

> *"This poem includes the Phaeacian episode, and the account of Ulysses'
> adventures as told by himself **in Books ix.-xii.**"*

That is a claim about a region of the text made **outside** the text. The rule
turns it into a locator that reads **two characters** — `“` and `”` — and
nothing else: no letter, no word, no word length, no capital, no digit, no
line break, no heading, no apparatus.

Butler's convention for a speech running across paragraphs (the package's D4)
is to re-open at every paragraph and close only at the end. So score every
blank-line block of PG's body `+1` if it begins with an opening double quote
and carries more openers than closers, `-1` otherwise, and take the
**maximum-sum contiguous subarray**. Kadane's algorithm **has no parameter**,
which is what stops a locating clause being fitted to the answer it is meant
to find.

```
argmax interval: blocks [389..578], length 190, sum +164
best DISJOINT interval: [183..202] length 20 sum +20     (reported, not bounded)
Book IX predicted at blocks [388..431] (44 paragraphs)
clause 5: PG blocks [388..431], footnote numerals stripped, are the served
          chapter 9 paragraph for paragraph
clause 6: the served chapter 9 occurs in PG exactly once, at block 388
```

**Nine controls, and the audit failed the rule twice while it was being
built** — both failures are the kinds `review-instructions.md` names:

* the first version of control **C9** changed `Ismarus` in the wrong paragraph
  and was therefore a **no-op — a control inside the rule's null space**, which
  passed as "did not fire" for a reason that had nothing to do with the rule.
  It now asserts that its own mutation changed the input (D18's clause (a))
  before it asserts anything about the verdict;
* a doubled escape in the anchor-stripping regex made **nine chapters** fail to
  match for a reason unrelated to their text — a locating clause failing for
  the wrong reason, the mirror of the fourteenth rule's own failure.

**The controls that fire:** the **B03-P038 splice** planted at B09-P021; a
paragraph of **Butler's Book VIII** (adjacent) and one of his **Book XXII**
(not adjacent), so the control is not about adjacency; one word added; two
paragraphs transposed; one letter changed.

**The control that answers *a chapter matching itself*:** **C6** replaces the
served chapter 9 **entirely** with filler and asserts the interval comes back
`[389..578]` unchanged while clause 5 fires. A locator that cannot be moved by
rewriting its own subject did not find its subject by matching it against
itself.

**The control that answers *a count of zero reported as a pass*:** **C7**
strips every quotation mark from PG; the argmax collapses to a single block
with sum −1 and the rule **fails**, rather than reporting "no anomalies".
Clause 1 also asserts the argmax sum is positive and prints it.

**And C8** deletes the Preface sentence and asserts clause 0 **refuses to
run** — so the rule cannot quietly degrade into a constant somebody typed.

**Three declared blindnesses:** a defect PG and the served file share; the
locating clause's inability to see anything inside a paragraph (C9 asserts the
division of labour rather than implying it); and the fact that the locator
finds the four-Book region, not the Book — the cut between IX and X is made by
arithmetic on the served chapter's paragraph count, and it is clause 6's
uniqueness, not the locator, that bounds this.

**What it says about the other chapters.** 22 of 24 locate uniquely and
exactly two fail: **chapters 3 and 4**, whose divergences are the initial
capitals of ledger A7 (`but as the sun was rising` → `But`, `they reached the
low lying city` → `They`) — and chapter 3's second divergence, the B03-P038
splice, is found by the same run. Chapter 1 **locates**, because its recorded
divergence (B01-P025) survives whitespace normalization: the fourteenth rule
sees it and this one does not, which is a difference of channel and is
declared, not a defect. The two rules' verdicts are complementary, and between
them they account for every recorded divergence.

**Verdict: the served Odyssey chapter 9 is PG #1727's Book IX, and
`book09/source-book9.json` is character-identical to it** (checked
independently of the served file's own copy).

---

## 9. The four questions, ruled

### Question 1 — the forty-four-paragraph quotation

**The premise is wrong; see S-2.** P001 opens with the poet's frame, not a
quotation mark, and P044 closes nothing. Butler opens the quotation at
B09-P001 and closes it at the end of **chapter 12**.

**Is it right in the text?** Yes — Butler's convention should be preserved
exactly, and it is (D4, and the candidate matches Butler mark for mark on all
44). **Is it right in the app?** The question is real and it is four times
larger than stated, and it is not a Book 9 question: it is a *reader* question
about chapters 9-12, and the largest single instance is the reader who opens
**chapter 11** directly from a library or a share link and meets 54 paragraphs
of unattributed speech. Recommended for `PUNCTUATION.md` §2: record the span
as chapters 9-12; and record that the fix is an app affordance (a persistent
"Odysseus is speaking" attribution on chapters 9-12), not a punctuation change,
because any punctuation change here is a change to Butler.

### Question 2 — the thirty cashed and the twenty-four kept

I read all 71 of Butler's dividing marks, dashes included, as Book 8's round
requires.

**The thirty conversions: twenty-eight are right, two are not.**

* **Right, and the class is right:** every semicolon Butler uses to chain a
  narrative sequence — P003 (×2), P004, P005, P007 (×2 of 5), P008 (×2), P009,
  P011, P012, P013, P014, P018, P019, P020, P021 (×2), P026, P030, P031, P032,
  P034, P037 (×2), P039, P041, P043. Butler's Book IX is one long paratactic
  chain and thirty periods is not too many.
* **Wrong — the two colons.** **B09-P021's `to do as follows:`** and
  **B09-P012's `one housekeeper:`** are the two marks in the Book that a modern
  reader needs *kept*. P021's is M-1: cashing it strands a forward-pointing
  `this` across a full stop. P012's is milder but the same shape: Butler's
  colon makes *when he drank it he mixed twenty parts of water to one* the
  **explanation** of the secrecy in the clause before it, and the full stop
  makes it a new fact.

**The twenty-four kept: twenty-two are right, two I would look at again.**

* **The one to keep above all others is B09-P028's**, and I agree with the
  draft without reservation: *"Noman is killing me by fraud; no man is killing
  me by force."* The semicolon is what holds the two halves of the pun in one
  breath. A period would make them two statements and kill the joke; a comma
  would make it a comma splice. Keep.
* **B09-P013's colon-then-semicolon chain over the three flocks** — the one the
  instructions are least sure of — **is right, and the colon is an
  improvement**, subject to S-1's bookkeeping point. *"They were kept in
  separate flocks: first the yearlings, then the oldest of the younger lambs,
  and last the very young ones, all kept apart from one another; as for his
  dairy, …"* The colon introduces the enumeration; the semicolon turns the
  paragraph from the lambs to the dairy. Butler wrote a semicolon in the first
  place and a semicolon in the second, and using two different marks for two
  different jobs is what a modern reader expects. **Keep both — and declare
  the first as a class change** (S-1).
* **B09-P029** — *"you must be ill; when Zeus makes people ill there is no help
  for it, and you had better pray to your father Poseidon"* — is the one kept
  semicolon I would cash. It is the Cyclopes shouting through a door; three
  short sentences is how people shout. And the candidate has already dropped
  Butler's comma after `ill` in the second clause, so the sentence now runs 19
  words with one internal mark.
* **B09-P039's kept semicolon** (`till he grew old; he told me`) is defensible
  but marginal: Butler's sentence is 59 words in the candidate, the longest
  four-limb chain left in the Book, and a period after `grew old` costs
  nothing.

**And the dividing mark that is not a semicolon.** Book 8's worst break was a
dash, so all ten of Butler's sentence-internal em dashes were read: **P002,
P007 (×2), P012, P014, P020, P021, P026 (×2), P039.** All ten are kept in
place, all ten still have a word on each side, and none of them has been made
to carry a different job. **No finding.** The nearest thing to one is P026's
pair — *"into cold water to temper it—for it is this that gives strength to the
iron—and it makes a great hiss"* — a 54-word sentence with a parenthesis inside
a simile, which reads because both dashes survive; had one been cashed it would
have been B08-P047 again.

### Question 3 — the fifteen repairs

**The diagnoses are sound and the repairs are better than Book 8's**, for a
reason worth writing into the rules. Checked one at a time against PG:

* **Eleven restore Butler's own word verbatim** — `all manner of subtlety`,
  `renowned`, `hazardous adventures`, `becomes fair`, `luscious`, `yield
  heavily at harvest time`, `the wrath of heaven`, `his huge paunch`,
  `clutched up`, `remained bleating`, `bubbling fountain`.
* **Two keep Butler's own phrasing and modernize only the word that is not
  current** — `the morning lasted` (his `So long as the day waxed and it was
  still morning`), `preventing us from sleeping` (his `preventing us from
  being able to sleep`).
* **Two are new renderings, and both are forced** — `such a horrible sight`
  for `horrid`, `wedged` for `esconced`, neither of Butler's being current
  English. Both are still *a word for the thing*, not a description of it.

**Not one of the fifteen invents a paraphrase of the referent**, which is
exactly what went wrong with Book 8's `minstrelsy` → *the playing that goes
with it*: that repair described a bard instead of naming what he does, and
described him wrongly.

**Recommendation, and it is the general form of Book 8's M-4:** write it down
as a rule — *an arrow's repair prefers Butler's own word; a third rendering
requires a reason.* Arrow C's constraint says what the repair may not be; this
says what it should be, and it is free.

**The one that is not right is P020's**, and it is not wrong in itself —
`clutched up` is Butler's and restoring it was correct. It is wrong as a
**closure**: the draft simultaneously wrote `snatch` at P019 for Butler's
`clutch`, so the collision the repair removed was re-created one paragraph
earlier and Butler's `clutch`/`clutched` pair was flattened at the same time.
See S-3. **Nothing in the package checks a repair against the rest of the same
draft**, and this is the instance.

**And question 4's shapes, hunted for deliberately: six found, all
cross-paragraph, all under arrow B's rarity gate.** S-3's table. The gate is
stated in `rendering_collisions.py`'s own docstring — *"only Butler's rare
words count"* — and the words Butler uses as **discriminators** in this Book
(`gave`, `drove`, `cried`, `supper`, `flock`, `clutch`/`snatch`) are all
common. The blind spot is not that arrow B looks across paragraphs badly; it is
that **arrow B cannot see the words a narrative repeats**, which are exactly
the words a flattening rendering lands on.

**A cheap closure that needs no new instrument:** run arrow B a second time
with the rarity gate replaced by a *within-Book repetition* gate — any
candidate word that renders two different Butler words **inside one Book** is a
row, however common, because the Book is small enough that the report stays
readable. On this Book that produces exactly the six rows above.

### Question 4 — A10 and the exemption list

**The diagnosis is right and the remedy is the wrong kind of thing.**

`an olive-wood handle` against `of green olive wood` is attributive
hyphenation, which is a rule of English and not a compound with two settings.
`continuity.md` §8 says so correctly, and the false-positive direction is the
expensive one.

But `NOT_COMPOUNDS["olivewood"]` exempts the **compound**, and the false
positive is a property of the **position**. The exemption therefore buys one
false positive at the price of a permanent, silent false **negative**: from now
on, if any Book writes `olivewood` closed, or writes `olive wood` attributively
against another Book's `olive-wood` as a noun, `compound_drift()` will say
nothing. A check that trades a noisy true statement for a quiet false one has
moved in the wrong direction, and the record half-knows it — *"the exemption
list is itself the hazard"*, *"if that list ever carries more than a handful,
the check has to become position-aware."*

**Two things are wrong with that as a safeguard.** First, *a handful* is not a
number and **nothing counts it**, so the threshold cannot be crossed
observably; `ivy-wood bowl` against `ivy wood` is already visible in this same
Book and will make it three. Second, position-awareness does not need the
vendored word list that A4(ii) escalated as a new external dependency. It needs
one distinction the text already carries: **compare settings only within the
same position.** For each occurrence, record whether the pair is premodifying
(a content word follows before any punctuation or function word) or not, and
report drift only between occurrences of the same class. `a beautiful
olive-wood handle` and `it was of green olive wood` then fall into different
classes and never meet; a genuine drift — two Books hyphenating differently in
the *same* position — still fires.

**Ruling: not sound as a standing practice.** Keep the `olivewood` row as an
interim, and make the trigger mechanical instead of rhetorical: **assert
`len(NOT_COMPOUNDS) <= 2` in the self-test**, so that the third exemption
*fails the check* and forces the position-aware rewrite. That is the package's
own standard — *made impossible rather than absent* — applied to its own
escape hatch. Exemption-by-name is becoming the way to clear red precisely
because clearing red by exemption costs nothing today and the cost lands on a
worker who will not know it was paid.

---

## 10. Every paragraph, once

`manifest.json`'s `coverage_check` asserts each of the 44 is assigned to
exactly one packet; each is ruled here exactly once.

| ¶ | ruling |
|---|---|
| **B09-P001** | No material issue. `sitting orderly` → `sitting in their places`, `Now, however, since` → `But since` — both read; nothing added, nothing moved. 45- and 49-word sentences against Butler's 50. |
| **B09-P002** | **M-9** (the `all highest up in the sea` crux settled silently against footnote [48]). Otherwise sound: the semicolon and the em dash are both Butler's and both kept; `renowned` and `all manner of subtlety` are the two arrow repairs and both restore Butler. |
| **B09-P003** | **M-7** (`very foolishly` → `were fools`). Three of Butler's semicolons, two cashed and one kept at `though they outnumbered us;` — the right one to keep, since the clause after it reverses the one before. |
| **B09-P004** | No material issue. Four sentences out of Butler's three, no mark bought, `hard by` and `doubling` correctly modernized. |
| **B09-P005** | No material issue. Butler's one semicolon cashed and the `nevertheless` it carried rendered as `all the same`, which keeps the concession. |
| **B09-P006** | No material issue. The semicolon at `high mountains;` is kept and should be: it separates the Cyclopes' dwelling from their politics. |
| **B09-P007** | No material issue, and it is the best-handled paragraph in the Book: five semicolons, two kept and three cashed, both em dashes kept around the sportsmen parenthesis, and three of the fifteen collision repairs land here (`luscious`, `yield heavily at harvest time`, `becomes fair`) — all three restoring Butler. |
| **B09-P008** | No material issue. Butler's two semicolons both cashed; the 74-word sentence becomes three, and `nor were there any breakers` → `and there were no breakers` is the right direction. |
| **B09-P009** | **S-1** — Butler's semicolon at `excellent sport;` becomes the candidate's colon. Right as English, wrong in the census. Otherwise sound. |
| **B09-P010** | **S-4** (`humane` → `civilized`, with a circular rationale). The colon is Butler's and is kept. |
| **B09-P011** | No material issue. One of the two displaced runs (`«we saw a great cave»`) is here and it is a legitimate fronting, not a shuffle: Butler's `there, on the face of a cliff near the sea, we saw a great cave overhung with laurels` becomes `we saw a great cave on the face of a cliff near the sea, overhung with laurels`. |
| **B09-P012** | **S-1** (Butler's colon at `one housekeeper:` cashed) and **question 2's second wrong conversion**. The em dash before the list of Maron's gifts is kept. |
| **B09-P013** | **S-1** (semicolon → colon) and **M-6** (`ill to deal with` → `bad to deal with`). `hoggets` → `yearlings` is right: the paragraph's point is three age-graded flocks and `yearlings` is the one word that carries an age. |
| **B09-P014** | No material issue. The second displaced run (`«with such a noise»`) is here and is a legitimate recast. Butler's colon before the Cyclops's speech is kept, the cave-stone em dash is kept, `two and twenty` → `twenty-two`. |
| **B09-P015** | **The supplied `you`** — see the ruling below the table. |
| **B09-P016** | **M-3** (supplication becomes command) and **M-8** (`but` → `and`). `your excellency` → `sir` is right and is recorded. |
| **B09-P017** | No material issue. Dropping Butler's `indeed` from `Talk to me, indeed, about fearing the gods` loses a little of the sneer, but the question mark carries it. |
| **B09-P018** | **S-3** (`sent` → `drove`, against Butler's own `drove` seven times and his `driven` in the next sentence). |
| **B09-P019** | **S-3 three times** (`clutch` → `snatch`; `vouchsafed` → `gave`; `supped upon` → `made his supper of`) and **O-1**. The paragraph is otherwise the best-divided in the Book: Butler's 66-word sentence becomes two and no mark is bought. |
| **B09-P020** | No material issue in the text; the **P020 repair is right and is half of S-3's first row**. Butler's semicolon cashed, his em dash kept. |
| **B09-P021** | **M-1** (the stranded cataphoric `this`) and **S-1** (Butler's colon at `to do as follows:` cashed). Four of Butler's semicolons, two kept; the cave em dash and the closing colon both kept. `ivy-wood bowl` is the next instance of the attributive-hyphenation class (question 4). |
| **B09-P022** | **S-5** (`come see` → `come and see`, a supplied word, undeclared) and **O-2** (`drink-offering` → `drink offering`). The D16 repair of the missing `‘` is correct and correctly recorded. |
| **B09-P023** | No material issue. `Nectar and Ambrosia` → lower case is a D15 typographic change and is declared. Three edits over 84 words. |
| **B09-P024** | No material issue. Butler's four semicolons, two kept (`some more;`, `my name is Noman;`) and two cashed; the colon before the speech is kept. Keeping the semicolon before `my name is Noman` is right — it is the setup of the pun. |
| **B09-P025** | No material issue. `This is the present` → `That is the present` is the right deixis for a promise about the future. |
| **B09-P026** | **M-5** (`besmirched` → `besmeared`) and **M-2's near miss** — `Even thus did we bore` → `Even so did we bore` keeps the inversion and therefore keeps the correlative reading, which is exactly what B08-P047 lost. Both em dashes kept; Butler's semicolon cashed; the 58-word sentence is the longest in the candidate against Butler's 69. |
| **B09-P027** | No material issue. The `preventing us from sleeping` repair is Butler's own phrasing, shortened. |
| **B09-P028** | No material issue, and the kept semicolon is the single best punctuation decision in the Book. See question 2. |
| **B09-P029** | Semicolon kept; **I would cash it** (question 2). No other issue. |
| **B09-P030** | No material issue. `stratagem` → `trick` introduces no collision — `trick` occurs nowhere else in either text. |
| **B09-P031** | **M-1's second instance**. `withies` → `willow twigs` and `esconced` → `wedged` are both right and both recorded; the `wedged` repair correctly freed `settled` for Butler's `colonised` at P007. The kept semicolon after `the lives of my companions` is right. |
| **B09-P032** | No material issue. Butler's semicolon cashed, his closing colon kept, `without being sharp enough` → `and was not sharp enough` reads better and costs nothing. |
| **B09-P033** | **S-3** (`mob` → `flock`). The kept semicolon at `come home again at night; but now you lag last of all` is right — the `but` depends on it. `no-good` → `good-for-nothing`, `bubbling fountain` restored. |
| **B09-P034** | No material issue. One semicolon cashed, one kept. |
| **B09-P035** | **S-5** (`eat up` → `to eat up`, and `?` → `!`). Butler's rhetorical question becomes an exclamation; defensible, unrecorded. One edit over 51 words otherwise. |
| **B09-P036** | No material issue. `snatched up a long pole` is Butler's and is kept — which is what makes P019's `snatch` a collision. |
| **B09-P037** | **S-3** (`exclaimed` → `cried`). Both of Butler's semicolons cashed and both cashings are right: this is a crew shouting a warning in short bursts. |
| **B09-P038** | No material issue. Two edits over 47 words. |
| **B09-P039** | **M-4** (`whereas` → `and`). Semicolon kept, em dash kept, `come here, then` correctly promoted to a sentence. |
| **B09-P040** | No material issue. |
| **B09-P041** | **R-6** — the bracket removal is right and its recorded reason is a guess where Butler's own footnote [82] and Preface were available. The first semicolon is cashed and the second kept, which is the right way round: the `or if he must get back` clause is the alternative to the one before it. Note that the full stop replacing the `[` is counted as one of the Book's six net divisions (S-1). |
| **B09-P042** | **M-2** (`Thus did he pray` → `So did he pray`). One edit otherwise. |
| **B09-P043** | No material issue. Both semicolons kept and both should be. `divided them fairly among us, so that no one might have reason to complain` matches the candidate's own rendering of the same Butler formula at P003 — a consistency the collision arrows cannot see and that is worth noting as a success. |
| **B09-P044** | **S-2** (it closes no quotation) and **S-5** (`bade my men on board` → `told my men to go on board`). The verbatim echo of P004's opening is preserved exactly, which is right: Butler repeats it and so should the candidate. |

### The supplied `you` at B09-P015 — the ruling question 3 asks for

**Both claims are true, and they are not exclusive: the instruction's
"only one can be right" is a false dichotomy, and I am declining it.**

* **For the candidate, D16 clause (b) is correct and correctly applied.**
  Butler's text is defective, the word is supplied from his own parallel eleven
  words later (`do you sail the sea as rovers`), and the second person is fixed
  by the preceding clause (`who are you`). The modern edition cannot print
  `Where do sail from?`.
* **But ledger A7 cannot record it**, because A7 is the register of places
  where the **served file diverges from PG**, and here the served file and PG
  **agree**. The defect is upstream of both.

So what the package is missing is not a decision between the two; it is a
**third register**: *places where PG #1727 and the served file share a reading
that is probably not Butler's print*. `RESUME.md` already names this as blind
spot 11 — *"a defect PG and the served file SHARE. Every source rule in the
package is blind to it by construction"* — and B09-P015 is the **first
concrete instance the package has found**. It should be recorded as such,
because the blindness is now demonstrated rather than assumed, which is the
package's own standard for a declared blindness.

And it has a second member already: **B09-P022's `come see you`** (S-5), in the
same speech-pair, repaired silently. Two instances is a register.

---

## 11. What the checks would still not catch — additions to `RESUME.md`'s list

1. **A mark EXCHANGED for another mark of the same class** (S-1). D27 counts
   `;` + `:` + internal `—` on both sides and the provenance clause asks only
   whether Butler's mark was in the set. Cashing a colon and writing a colon
   somewhere else is invisible, and it moves the compared figure by 0.8 points
   on this Book.
2. **A figure that is right in the manifest and wrong in the prose** (R-1,
   R-2, R-3, R-5). (b3) recomputes sixteen figures against `manifest.json`.
   Four committed files carry the same figures and nothing checks any of them —
   which is how three wrong retentions reached a freeze.
3. **The SOURCE** (S-6/A11). Every gate, every figure and every census is
   computed against `bookNN/source-bookN.json`, and nothing hashes it, names it
   in a manifest, or re-derives the verification that ties it to PG.
4. **A rendering collision on a word Butler uses often** (S-3). All three
   arrows gate on rarity; a narrative's discriminators are its common words.
5. **A repair that re-creates its own collision elsewhere in the same draft**
   (S-3, P019/P020). The collision record is a list of rows with dispositions;
   nothing re-runs the arrows over the repaired draft *against the repairs*.
6. **A rationale that cites the draft's own invention as the source's**
   (S-4). `continuity.md` is prose and nothing reads it.
7. **A word supplied where the source is defective, undeclared** (S-5).
   `checks.py` has no clause for D16 at all; the count of supplied words is
   asserted by a sentence in `continuity.md` and by nothing else.
8. **A claim about the shape of the text that is simply not true of it**
   (S-2). No instrument reads quotation balance, and the D4 paragraph has been
   wrong at both ends since the freeze.
9. **An exemption that converts a false positive into a permanent false
   negative** (question 4). `NOT_COMPOUNDS` is a list, its growth trigger is
   the word *handful*, and nothing counts it.

---

## 12. Where I pushed back

* **Question 3's framing** — *"They are different claims and only one can be
  right"* — is wrong, and §10's ruling declines it. Both are right; the
  package needs a third register, and the instruction's dichotomy would have
  forced the round to delete one true statement.
* **Question 1's premise** is wrong on the facts (S-2), and answering it as put
  would have recorded a false description of Butler's punctuation in
  `PUNCTUATION.md`.
* **`README.md`'s and `continuity.md`'s headline claim** about the 41 dividing
  marks is not a summary I could sign; S-1 gives the numbers instead.
* **`continuity.md` §5's closing sentence** invites the reviewer to test a
  claim that is false (S-5), and I have reported it as false rather than
  reporting the test as passed.
