# The Odyssey, Book 5 — continuity, decisions and evidence

Written at steps 1–3 of `../WORKFLOW.md`, before the independent review, and
**corrected and extended at steps 6–8** — every such passage says so in place,
with the round-1 finding that required it. Every claim here is asserted
mechanically by the check block in `README.md` or by
`../scripts/build_book05_v2.py` unless it says otherwise.

| | |
|---|---|
| **Accepted** | **`candidate-v2.json`**, sha256 `acbfcb03f15e8244dc46ec7f29d14d48da9179443191016525636d30b51479e9` — see `ACCEPTANCE.md` |
| Frozen predecessor | `candidate-v1.json`, sha256 `7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf` — **frozen**, not edited (**D10**) |
| Source | `source-book5.json`, sha256 `c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57` |
| Paragraphs | 37, one-to-one with the source |
| Words | v2 **4,652** against 4,666 — ratio **0.99700**; lowest paragraph ratio **0.963** at B05-P036 (v1: 4,660, 0.99871, 0.968 at B05-P028) |
| Butler token retention | v2 **0.93808** (v1 **0.94211**; Books 1–4: 0.727, 0.902, 0.897 **on 37 of Book 3's 38 — R-1**, 0.95872) |
| **Splitting rate (D17)** | **sentences 153 → 189, +23.5%**; **sixty-word sentences 9 → 1, 89% broken** (v1: 9 → 3) |
| **Semicolons against Butler's (D19)** | **34 → 13** (v1 **34 → 12**) |
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
- **B05-P007 — `Ulysses was not within` → `Odysseus was not in the cave`.**
  *(Recorded at step 6, finding 7.1.)* A location Butler leaves to context is
  supplied. It is an improvement and the same class as ruling 2's upheld `and`;
  what was missing was the record, not the judgement.
- **B05-P007 / P008 / P015 / P016 — the mark before a speech.**
  *(Recorded at step 6, finding C-15, declined as a change.)* Butler prints a
  colon at all four. The edition prints a **colon where the speech begins in
  the next paragraph** (P008 → P009, P016 → P017) and a **comma or full stop
  where it follows inline** (P007, P015). That is one disposition, not two; the
  rule was simply never written down.
- **B05-P012 — `crying aloud for his despair` → `in his despair`.**
  *(Recorded at step 6, finding 12.1.)* A **D16** repair of a preposition a
  modern reader reads as an error, beside B05-P011's.
- **B05-P021 — `the wain` → `the Wain` is a RENDERING decision, not
  normalization.** *(Reclassified at step 6, finding 21.2.)* Capitalizing a
  common-noun gloss into a proper name changes what the word is, which is
  D15's own test for a rendering decision. The capital stands; its
  classification was wrong.
- **B05-P023 — `pressing me so sorely` → `so hard`, against `sorely against my
  will` kept at B05-P031.** *(Recorded at step 6, finding 23.1, declined as a
  change.)* One Butler word, two dispositions: the second is a carried
  cross-Book formula matching accepted B04-P043, the first is ordinary use.
  Defensible, and it belongs on the record as a one-word-two-ways row.
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

**Corrected at step 6 (finding C-12).** Three of the thirteen compounds this
Book touches were missing from this table — `sweet smelling` (kept, silently),
`half way` (kept, silently) and `sea-water` → `sea water` (moved, silently).
D15 makes the *typographic* change silent; it does not make the table optional,
and the table is the only place a later Book can look up what this Book did.
The `open, kept` row is gone: round 1 found that every one of its members was
either a third form or a Victorian setting, and all of them moved.

| direction | Butler | edition (v1) | **edition (v2, accepted)** |
|---|---|---|---|
| closed | `sandal wood`, `home sickness`, `sea-gull`, `goat skin`, `yard arm`, `foot hold`, `hill side`, `day time` | `sandalwood`, `homesickness`, `seagull`, `goatskin`, `yardarm`, `foothold`, `hillside`, `daytime` | unchanged |
| **closed at step 6** | `sea-shore` / `sea shore`, `half way`, `river bed`, `sea-water` | `sea shore`, `half way`, `river bed`, `sea water` | **`seashore`** (ruling 1), **`halfway`** (24.1), **`riverbed`** (36.1), **`seawater`** (35.1) |
| hyphenated | `well found ship` | `well-found ship` | unchanged |
| **hyphenated at step 6** | `mid ocean`, `sweet smelling` | `mid ocean`, `sweet smelling` | **`mid-ocean`** (10.1), **`sweet-smelling`** (6.1) |
| Butler's own, untouched | `sea-crows`, `olive-wood`, `fire-seed`, `low-lying`, `late-setting`, `surf-beaten`, `rosy-fingered`, `well-to-do`, `well-disposed`, `thrice-ploughed` → `thrice-plowed` (D9) | | |

`sea water` was the case D15 exists to prevent by name: Butler hyphenates, v1
opened, and modern English closes — **a third form**, which is `sea side` →
`sea side` exactly (Book 4's finding 37.1). `river bed` and `hill side` were in
the same paragraph, one opened and one closed: one paragraph, two dispositions
for one class.

**The cross-Book check now sees this class.** `../scripts/compound_drift.py`
keys each compound on its letters with the separator stripped and fails on any
key carrying more than one setting across the Books, which the old
`hyphen_drift()` could not do. Running it forced the three `seashore`
successors and surfaced two drifts nobody had raised — `low-lying` and
`well-disposed`, hyphenated in this Book and open in accepted Book 4, now
carried by `book04/candidate-v3.json`.

## 9. American spelling (D9)

`honour` → `honor` (×3), `harbour(s)` → `harbor(s)`, `skilfully` →
`skillfully`, `ploughed` → `plowed`, `towards` → `toward`, `neighbour` →
`neighbor` (the served text already prints `neighbor` at B05-P037, which is
PG's own inconsistency and is left alone in the source column). Butler's
capitalized `Autumn winds` becomes `autumn winds`: seasons are lower case in
the modern standard, and this is the D9 class, not a rendering decision.

## 10. The splitting rate, and the three sentences left long

**D17 is met with room to spare: 153 → 189 sentences (+23.5%), and six of
Butler's nine sixty-word periods are broken.** Three sixty-word sentences
remain, in paragraphs 17, 30 and 37.

> **Corrected at step 6 (records finding R-5).** The word *survive* is wrong for
> all three, and it was hiding something. B05-P017's Butler period is **102**
> words; v1 split it and what remained was a 62-word **residue**, not a
> surviving sentence. B05-P030's 62-word simile was recast and came out at
> **65** — three words *longer* than Butler's, which is a defect in itself, and
> invisible to a census that counts sentences at or above 60 without reporting
> the delta. B05-P037's 61 came out at 60. The count 9 → 3 was right; the claim
> of survival was not. **In the accepted v2, P017 is divided (ruling 5), P030
> is back inside Butler's 62, and P037 is 59 after finding 37.1 — so the
> accepted figure is 9 → 1, and the build now fails on any recast that grows a
> sentence to 50 words or more beyond its source's longest.**

The three, as v1 left them, each on purpose:

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

## 11. The near-identical report, published (records finding R-7)

**Corrected at step 6.** This section used to say the report flags
"B05-P002, P004, P014, P016, P017, P018, P019, P030", and
`review-instructions.md` told the reviewer that "B05-P014, P019 and P030 are
within one or two word-level edits of Butler at 40+ words". Run the package's
own `near_identical()` (40+ source words, ≤4 word-level edits) and **none of
those three is flagged**: P014 is 84 words with 14 edits, P019 is 23 words and
below the threshold, and P030 is 184 words with 25 edits — one of the
most-edited paragraphs in the Book. The report was computed and then not
published, and a reviewer steered to the wrong three paragraphs is a review
that did not happen where it was needed.

The report's actual output on **v1** — the eight the reviewer names in S-1:

| paragraph | source words | edits |
|---|---|---|
| B05-P001 | 60 | 4 |
| B05-P003 | 59 | 2 |
| B05-P013 | 108 | 1 |
| B05-P015 | 97 | 3 |
| B05-P016 | 92 | 3 |
| B05-P017 | 119 | 4 |
| B05-P018 | 90 | 1 |
| B05-P029 | 51 | 2 |

On the accepted **v2**, P017 leaves the list (ruling 5 divided it) and the
remaining seven are in `checks-v2.md` §4, written by the build rather than
transcribed. **P013, P018 and P029 are defensible and deliberate**: Butler is
already speaking plain modern English in the first two, and P029's undivided
51-word sentence is the one place in the Book where the drafter ran the flow
instrument against the gate's own incentive — dividing `But Athena decided … ;
but she roused …` would have produced two consecutive sentences opening `But`.

The one-word-two-ways report returns 87 rows on v2, almost all function words.
It is noise-heavy by design and is a reader's instrument, never an assertion;
the full table is in `checks-v2.md` §3.

## 12. Steps 6, 7 and 8

- **Step 6** — `changes-v1-to-v2.md`: 30 substitutions in 20 of 37 paragraphs
  by `../scripts/build_book05_v2.py`, five findings declined and asserted still
  present. New checks in `checks-v2.md`.
- **Step 7** — `flow-read.md`: one change, F-1, folded back into the build
  script.
- **Step 8** — `ACCEPTANCE.md`: accepted at `candidate-v2.json`, sha256
  `acbfcb03f15e8244dc46ec7f29d14d48da9179443191016525636d30b51479e9`,
  retention **0.93808**, splitting **153 → 189 (+23.5%)**, sixty-word
  **9 → 1**, semicolons **34 → 13**.

## The collision backlog, ruled

**Session `session_01K5bL9oWzAagjTMExsyUADi`, 2026-09-13, a worker that did not
build the instrument.** `scripts/collision_triage.py` exited non-zero for Books
1-6 with **221 rows carrying no disposition** — 96, 30, 27, 30, 26 and 12. The
worker that built the instrument declined to rule them, on the grounds that
writing 221 dispositions in the session that built the instrument would be the
very defect the instrument exists to catch. It was right. This section records
what ruling them found in **Book 5**.

| disposition | rows |
|---|---|
| `common-rendering` | 4 |
| `common-word` | 3 |
| `context-rendered` | 4 |
| `discrimination` | 1 |
| `free-variation` | 1 |
| `homograph` | 2 |
| `kept` | 45 |
| `kept-elsewhere` | 13 |
| `matches-accepted` | 5 |
| `unavoidable-merge` | 4 |
| `variant` | 7 |

**89 rows, 17 of them ruled by hand, and none live.** Nothing in Book 5 needed a
successor.

Book 5 is where the class `context-rendered` earns its keep, four times:

* `retired` -> `retreated` of a wave (B05-P032) and `withdrew` of two people
  going to bed (B05-P019). Water retreats and people withdraw; `the pair
  retreated into the cave` makes them flee and `the wave withdrew` gives it an
  intention.
* `sorely` kept in `sorely against my will` (B05-P031) — a living fixed
  collocation — and moved to `hard` in `pressing me so sorely` (B05-P023),
  where it is not.
* `firmament` -> `sky` for a flight through it (B05-P005) against `vault of
  heaven` for the sun rising into it (B03-P001). `the sky of heaven` is not
  English and `swooped down through the vault` loses the motion.
* `furthermore` -> `and now` at the head of a grievance (B05-P002) against
  `next` at the head of a narrative step (B02-P031).

**And the row this entire check was built for is now clean.** The drafter of
Book 6 named `herbage`/`grass` as a call no single-Book instrument could see.
Both accepted Books render `greenery` — B06-P009 plain, B05-P006 with `lush`
carrying Butler's own `luscious`. One rendering in two Books, ruled
`matches-accepted` from both sides.

Every row touching this Book now carries a disposition and
`python3 scripts/collision_triage.py 5` exits zero. The full table, one row per
collision with its reason, is generated into `book05/collisions.md`.

### What this exercise says about the instrument, from this Book's side

The 221 rows were **mostly noise, and the noise had one cause**: `kept`
dismissed a row from the KEEPER's side and there was no class to dismiss it from
the MOVER's side, so every row where one Book modernized a word another Book
could keep stayed open forever in whichever Book had done the modernizing. One
missing mirror, `kept-elsewhere`, absorbs **104 of the 214 rows of that shape**
that survive into the repaired corpus, measured by running the triage with every
hand ruling for Books 1-6 switched off. **110 rows needed a person, and 7 of
them were live** — 103 reasoned dismissals for 7 repairs, a signal rate of 6% of
the rows a person had to read and 3% of the backlog as reported.

**But the noise was not worthless, and the seven were not findable any other
way.** Six of the seven came from arrow C, the proximity arrow. The seventh —
`smart looking` -> `capable-looking` at B01-P019 — came from arrow B across
paragraphs, and is the first live instance of **blind spot 6** being closed by
accident rather than by design: *a discrimination lost ACROSS paragraphs*, which
arrow C cannot see. That it was caught at all is luck, not coverage, and the
blind spot stands.

## H.1 — the compound register

Ledger **A5(c)**, and the answer to **A4(ii)** in the negative: one disposition
line per H.1 compound pair, so the class is a checklist somebody went through
rather than a blind spot. Generated by `scripts/compound_register.py` from
`book05/candidate-v3.json`; the evidence is **100 served modern-English editions**, read only, and
a pair is `closed` only when the closed form leads the open form **3x** and
appears in at least **3 distinct editions**. The corpus is machine-generated and
is never a sole authority (ledger A5(b)).

**36 pairs.**

| pair | disposition | corpus evidence |
|---|---|---|
| `above water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `after day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `bear men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `best place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `caught hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `chattering sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `deep water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `earth sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `fallow field` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `found ship` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `four days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `good man` | **`kept open, standard`** | the candidate writes `good man`; corpus closed 7 in 5 editions against 0 hyphenated and 237 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `good night` | **`kept open, standard`** | the candidate writes `good night`; corpus closed 18 in 8 editions against 22 hyphenated and 153 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `good way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `got hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `keep house` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `landing place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `large fire` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long time` | **`kept open, standard`** | the candidate writes `long time`; corpus closed 2 in 2 editions against 0 hyphenated and 658 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `long way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `mortal man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `mortal woman` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `neither ships` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `over land` | **`kept open, standard`** | the candidate writes `over land`; corpus closed 15 in 5 editions against 0 hyphenated and 12 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `saw land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `seals men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `see land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `seventeen days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `third day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `timbers hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `time day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `touch land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `tremendous sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `twenty days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `under water` | **`kept open, standard`** | the candidate writes `under water`; corpus closed 8 in 3 editions against 0 hyphenated and 18 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `whole work` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
