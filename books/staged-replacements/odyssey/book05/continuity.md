# The Odyssey, Book 5 — continuity, decisions and evidence

Written at steps 1–3 of `../WORKFLOW.md`, before the independent review.
Every claim here is asserted mechanically by the check block in `README.md`
unless it says otherwise.

| | |
|---|---|
| Candidate | `candidate-v1.json`, sha256 `7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf` — **frozen** |
| Source | `source-book5.json`, sha256 `c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57` |
| Paragraphs | 37, one-to-one with the source |
| Words | 4,660 against 4,666 — ratio **0.999**; lowest paragraph ratio **0.968** at B05-P028 |
| Butler token retention | **0.94211** (Books 1–4: 0.727, 0.902, 0.897, 0.95872) |
| **Splitting rate (D17)** | **sentences 153 → 189, +23.5%**; **sixty-word sentences 9 → 3, 67% broken** |
| Packets | 13, coverage `B05-P001`…`B05-P037` |

## 1. The source, verified by a sixth kind of rule

`../scripts/verify_source_book5.py`. The five rules used before all **searched
for Book N and then proved something about what they found**. This one never
looks for Book 5 at all: it locates the other twenty-three served chapters in
PG, each independently and each required to occur **exactly once in the whole
file**, and identifies Book 5 as the **residue** — the stretch of PG that
everything else is not.

That is worth the trouble for one reason. In a search-then-verify rule, the
thing being checked chooses where the check looks; a served Book that had been
altered would move the region, and the rule cannot test for it. Here the region
is an output of twenty-three alignments **none of which can see Book 5**.

```
PG letter-token stream: 133038 tokens  (an OUTPUT)
the twenty-three spans are pairwise DISJOINT and strictly ordered by chapter
chapter 4 ends at token 24264 (PG line 2269)
chapter 6 begins at token 28997 (PG line 2687)
residue: 4733 tokens, PG lines 2274..2684  (an OUTPUT)
served chapter 5: 4716 tokens, INSIDE the residue
residue tokens BEFORE it: book v calypso ulysses reaches scheria on a raft
residue tokens AFTER  it: book vi the meeting between nausicaa and ulysses
blank-line blocks in the located region: 37  (an OUTPUT) — served paragraphs 37
byte-identical paragraphs 32 of 37
footnote-marker deletions 5, markers [50,51,52,53,54], ascending, no repeats
  glued to the word before: 50, 52, 53, 54     SPACE-SET: ' 51'
letter-case differences 0   whitespace-only 0   every other difference 0
4666 words compared word for word, 0 mismatches
```

**The residue is exhausted.** The only tokens in it besides the served
chapter 5 are two Book headings, and each is checked against **the served
file's own `title` field** rather than against a string the script carries — so
"nothing of Butler's is silently missing from the served file between Book 4
and Book 6" is a result, not an assumption.

**One chapter cannot participate, and it is named rather than skipped.**
Chapter 3's served paragraph 38 is the base-text defect recorded as **A3** and
ruled on as **D14**: 196 of its 208 words are not Butler's. The script uses its
first 37 paragraphs and **asserts that paragraph 38 is the reason** — that it
occurs nowhere in PG, and that the other 37 match contiguously and uniquely.

**The rule's blindness, paid for rather than waved away.** A paragraph *merge*
leaves the token stream untouched, so this rule cannot see one. The property
that carries paragraph division is the blank-line block count in step 3, and
the merge control is run against **that** check instead, together with a split
control. Eight negative controls in all, and all eight fire: two paragraphs
swapped, two merged (against the block count), one split (against the block
count), one letter changed, one word dropped, a paragraph that is not Butler's,
and a changed **number-word** — the last because a letters-only stream would
otherwise be blind to quantities, and this Book's five digit runs are **all**
classified footnote markers, so Butler writes every quantity of Book 5 in
words.

**An audit of the rule before it was trusted, and it found a bug.** Two of the
negative controls were first written as `paragraph.replace("the", …)`, which is
a **no-op** on a paragraph that happens not to contain `the` — a control that
cannot fail is worse than no control. They are now built from the paragraph's
**own** words, and the script asserts that each mutation actually changed the
text before it claims the control fired.

## 2. Names — the closed table gains one row, by enumeration

| Butler | modern edition | count, source = candidate |
|---|---|---|
| Ulysses | **Odysseus** | 29 |
| Jove | **Zeus** | 12 |
| Mercury | **Hermes** | 9 |
| Minerva | **Athena** | 6 |
| Neptune | **Poseidon** | 6 |
| Diana | **Artemis** | 1 |
| **Ceres** | **Demeter** | 1 |

**`Ceres` → `Demeter` is new, and it is the first row added under the corrected
warrant** (records finding R3 of Book 4's round 1). It rests on **D5's rule**,
which says the modern edition uses the Greek forms for the Olympians who have
Roman ones; Demeter is inside that class by any reading. The counts in the
product are **corroboration only**, and they are thin, exactly as R3 predicted
they would be for a figure who is not in the Cast: `odyssey-threads.json` has
Ceres 0 and Demeter 0, the Book Onboarding has both at 0, and the served
`modern-en` being replaced prints **Demeter 1 / Ceres 0**. The row is added to
`../GLOSSARY.md` **by hand, by enumeration** (D6); it is not generated, because
a general Roman→Greek deity list is what turns Butler's `Ops` into Rhea.

**Hazards asserted, not assumed.** `Ops` does not occur in Book 5, and `Rhea`,
`Helios` and `Cronos` are absent from the candidate. `Same` does not occur.
No Roman form survives anywhere: Ulysses, Minerva, Jove, Neptune, Mercury,
Saturn, Diana, Venus, Juno, Vulcan, Ceres and Euryclea are all 0.

**Already Greek and correctly untouched**: Calypso, Tithonus, Telemachus,
Penelope, Laertes, Pylos, Lacedaemon, Scheria, Phaeacians, Argus, Pieria,
Orion, Ortygia, Iasion, Styx, Pleiads, Bootes, Oceanus, Solymi, Ethiopians,
Danaans, Achaeans, Achilles, Atreus, Priam, Troy, Ino, Cadmus, Leucothea,
Amphitrite, Aegae. **D8 does not fire in this Book**: the Cast has a display
name for Calypso and spells it as Butler does.

**D7 possessives.** Butler's bare `Ulysses’ heart` (twice) and `Ulysses’ knees`
become `Odysseus’s`; `Jove’s message` → `Zeus’s message`. No bare possessive of
a name ending in *s* survives.

## 3. The `heaven` census, unbroken in this Book

Butler uses `heaven` four times and the candidate four times. **No break is
taken**, and one of the four is worth naming because it is the class Book 4
broke once: B05-P023's *"How black is Jove making heaven with his clouds"* is
the sky, not the metonym. It is **kept** as `heaven` here, because unlike Book
4's `mid heaven` it is not a position being measured — the line works in the
metonymic sense too (Zeus blackening the heavens is Zeus doing it), and
flattening it to *the sky* would resolve an ambiguity Butler leaves open.
Recorded as a deliberate difference from Book 4's disposition, with the reason,
rather than left to look like inconsistency. **Put to the reviewer as
question 3.**

## 4. D3, D4, D12 — what does and does not fire

- **D3 (no quantity supplied for a hecatomb).** One instance, B05-P009:
  Butler's *"sacrifices or choice hecatombs"* becomes *"sacrifices or choice
  offerings"* — no number, and **not** `sacrifices`, which is Butler's own word
  four words earlier in the same clause and would collapse his pair into a
  repetition. `hecatomb` and `hecatombs` are asserted absent.
- **D4 (Butler's unclosed quotation across a paragraph break).** **Does not
  fire in Book 5.** All 31 opening marks are matched by 31 closing marks and
  **no paragraph is unbalanced** — source or candidate. Asserted both ways, so
  the absence is a result.
- **D12 (Butler's square brackets).** **Does not fire.** No bracket occurs in
  the source or the candidate.
- **D14 (the served original is not the base text).** Does not fire here; Book
  5 is byte-clean against PG apart from the five classified markers.

## 5. Paragraph-level decisions

- **B05-P011 — Butler's period outside the closing quotation mark.** He prints
  `…punish you”.`; the candidate prints `…punish you.”` This is
  `PUNCTUATION.md` §5 / **D16**: a modern reader reads the first as an error,
  because it is one. The mark totals are unchanged (31/31), so the repair does
  not hide inside a count.
- **B05-P012 — Butler's sentence is defective.** He prints *"Calypso then went
  close up to him said:"*, with no conjunction. The candidate prints *"Then
  Calypso went close up to him and said:"* — one word supplied, the smallest
  repair available, and the same class as accepted B03-P028's stray `and`.
  **Put to the reviewer as question 2.**
- **B05-P021 — `Days seven and ten did he sail over the sea`** becomes **"For
  seventeen days he sailed over the sea"**. Butler's phrase is an archaic
  additive numeral, and the next clause (*"and on the eighteenth"*) fixes the
  arithmetic beyond doubt. The quantity is unchanged; the inversion is not.
- **B05-P021 — `found him in much good meat`** becomes **"supplied him with
  plenty of good meat"**. *Find someone in* meaning *provide them with* is dead.
- **B05-P021 — `the Bear—which men also call the wain`** keeps the gloss
  Butler himself wrote and capitalizes it, **the Wain**, because in modern
  usage it is a name.
- **B05-P020 — `adzed them smooth`** becomes **"trimmed them smooth"**. The
  **adze itself is kept**, two sentences earlier, where Calypso gives it to
  him: the object survives, the dead verb does not.
- **B05-P024 — `playing battledore and shuttlecock with it`** becomes
  **"batting it back and forth between them"**. The game is dead and its name
  is opaque; the image — four winds striking one light thing between them — is
  Butler's and survives intact. This is the Book's only image-word replaced
  rather than kept, and the counterpart of Book 4's `furs` → `ruffles`.
  **Put to the reviewer as question 4.**
- **B05-P032 — `the suckers of a polypus`** becomes **"the suckers of an
  octopus"**. `Polypus` is Butler's word for the animal English now calls an
  octopus; the simile's mechanics (suckers torn, stones coming up with it) are
  untouched.
- **B05-P034 — `riverhood` is KEPT.** It is Butler's own coinage for the
  river-god's person and there is no modern word for it; the sentence explains
  itself (*"cling to the knees of your riverhood"*). `I approach you
  prayerfully` becomes `I come to you in prayer` rather than *as a suppliant*,
  because Butler's own `I declare myself your suppliant` closes the paragraph
  and the two must not be collapsed.
- **B05-P010 — `live with him in open matrimony`** becomes **"live with him
  openly as husband and wife"**. Calypso is describing a public union, which is
  the whole of her complaint; *openly as his wife* would have narrowed it.
- **B05-P009 — `transgress his orders`** → `disobey his orders`;
  **B05-P003 — `hurry-skurrying`** → `scurrying`; **B05-P017 — `no whit less`**
  → `not a bit less`; **B05-P037 — `deemed`** → `thought`;
  **B05-P034 — `wherefore`** → `and so`; **B05-P005 — `Forthwith`** → `At
  once`; **B05-P001 — `harbinger of light`** → `bringer of light`;
  **B05-P035 — `staid his stream`** → `stayed his stream`;
  **B05-P006 — `hither and thither`** → `this way and that`, `rills` →
  `streams`, `wherein` → `in which`, `reek` → `smoke`.

## 6. Connectives — one Butler form, one rendering (the Book 4 rows applied)

| Butler | count | modern edition | where |
|---|---|---|---|
| `Thereon` | 3 | **Then** | P001, P023, P030 |
| `On this` | 2 | **At this** | P012, P028 |
| `whereon` | 2 | **At that** | P019, P035 |

This is finding 64.2 of Book 4's round 1, applied across a Book rather than
repaired inside one. Two Butler forms that mean *at that point* keep two
renderings, because he wrote two; `Thereon` keeps the `Then` that accepted
Books 1–4 give it. No fourth rendering exists in the Book: `at which` and the
sentential `on which` are asserted absent.

## 7. Formulas carried from the accepted Books

- **The dawn formula.** B05-P020 opens *"When Dawn, the rosy-fingered child of
  morning, appeared"* — word for word the accepted form in Books 2, 3 and 4.
- **The guest-welcome formula.** B05-P016 carries *"they laid their hands on
  the good things that were before them"*, identical to accepted Book 4's two
  instances and Book 1's.
- **`still undecided`.** Butler's *"While he was thus in two minds"* occurs
  twice in this Book (P028, P032) and once in accepted Book 4 (B04-P011), where
  it is rendered **`still undecided`**. Both of Book 5's take the same
  rendering, so the cross-Book row holds and Butler's own repetition survives.
- **`sorely against my will`.** Kept, matching accepted B04-P043's *"sorely
  against his will"*. `Sorely` is not archaic in this collocation and the
  accepted Book has it.
- **`sea shore`, open.** Kept open to match accepted Book 4, which asserts the
  open form. **This is the Book's one known cross-Book hazard and it is put to
  the reviewer as question 1**, because under the new compound rule (**D15**,
  `PUNCTUATION.md` §4) the modern standard form is arguably the closed
  `seashore`, and Butler's own setting in Book 5 is the hyphenated `sea-shore`.
  Rendering `seashore` here would have created exactly the cross-Book drift
  D15 exists to prevent, so the drafter kept the accepted Book's form and
  raised the question instead of splitting the difference. **The package's own
  `hyphen_drift()` check cannot see this class**: it compares *hyphenated in
  one Book* against *open in another*, and is blind to *closed* against *open*.

## 8. Compounds, under D15

| direction | Butler | edition |
|---|---|---|
| closed | `sandal wood`, `home sickness`, `sea-gull`, `goat skin`, `yard arm`, `foot hold`, `hill side`, `day time` | `sandalwood`, `homesickness`, `seagull`, `goatskin`, `yardarm`, `foothold`, `hillside`, `daytime` |
| hyphenated | `well found ship` | `well-found ship` |
| open, kept | `sea-shore` / `sea shore`, `mid ocean`, `river bed` | `sea shore` (question 1), `mid ocean`, `river bed` |
| Butler's own, untouched | `sea-crows`, `olive-wood`, `fire-seed`, `low-lying`, `late-setting`, `surf-beaten`, `rosy-fingered`, `well-to-do`, `thrice-ploughed` → `thrice-plowed` (D9) | |

## 9. American spelling (D9)

`honour` → `honor` (×3), `harbour(s)` → `harbor(s)`, `skilfully` →
`skillfully`, `ploughed` → `plowed`, `towards` → `toward`, `neighbour` →
`neighbor` (the served text already prints `neighbor` at B05-P037, which is
PG's own inconsistency and is left alone in the source column). Butler's
capitalized `Autumn winds` becomes `autumn winds`: seasons are lower case in
the modern standard, and this is the D9 class, not a rendering decision.

## 10. The splitting rate, and the three sentences left long

**D17 is met with room to spare: 153 → 189 sentences (+23.5%), and six of
Butler's nine sixty-word periods are broken.** Three survive, each on purpose:

- **B05-P030's 65-word simile** — *"as children rejoice when their dear father
  begins to get better…"* — one of the poem's great similes, where the chain
  is the effect. This is the B04-P038 disposition applied to a simile rather
  than to a metamorphosis.
- **B05-P037's 60-word simile** — the man banking his fire-seed in the ashes,
  the last sentence of the Book, which closes on Athena shedding sleep on
  Odysseus's eyes. Dividing it would put a full stop inside the cadence the
  Book ends on.
- **B05-P017's 62-word sentence** — Calypso's offer of immortality, a single
  unbroken act of persuasion from *"if you could only know"* to *"day after
  day"*. **This is the one of the three the drafter is least sure of, and it is
  put to the reviewer as question 5** — it is also the paragraph the
  near-identical report flags (119 words, four word-level edits).

## 11. What the drafter could not check, and hands to the reviewer

- The near-identical report (40+ words, ≤4 word-level edits) flags **B05-P002,
  P004, P014, P016, P017, P018, P019, P030**. Of these, **P014, P019 and P030**
  have one or two edits each. Each was read again: Butler is already plain in
  them and the divisions are doing the work. But "already plain" is exactly the
  claim Book 4's round 1 showed a drafter cannot certify about its own draft.
- The one-word-two-ways report returns 76 rows, almost all function words. The
  content-word rows were read; none is a rendering split. That report is
  **noise-heavy by design** and it is a reader's instrument, not an assertion.
