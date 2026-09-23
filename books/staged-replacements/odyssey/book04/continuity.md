# The Odyssey, Book 4 — continuity sheet

What was decided while drafting `candidate-v1.json`, and why. Read with
`../GLOSSARY.md` (names, formulas, spelling, D12's brackets),
`../PUNCTUATION.md` (quotation marks) and `../00-progress-ledger.md` (the
decision rows D1–D14).

| | |
|---|---|
| Source | `source-book4.json`, sha256 `b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70` — byte-identical to chapter 4 of the served `original-en` |
| Candidate | `candidate-v1.json`, sha256 `9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553` — **frozen** |
| Paragraphs | 81, one-to-one with the source, in order |
| Words | 8,041 against the source's 8,042 — **ratio 0.9999** |
| Butler token retention | **0.960** (Book 1 v3 0.728, Book 2 v2 0.902, Book 3 v2 0.897 **on 37 of 38 — R-1**) — read in §6, and put to the reviewer as a question |
| Packets | 27 (26×3 + 1×3), coverage `B04-P001`…`B04-P081` |

Book 4 is the longest Book the package has drafted — 8,042 source words, more
than Books 1 and 2 together — and the first that is mostly **speech**: 71
opening quotation marks, and a single narrative (Menelaus on Proteus) that
runs unbroken for twenty-two paragraphs.

## 1. The source, verified by a fourth kind of rule

`../scripts/verify_source_book4.py`. The package has now used four rules of
different kinds, and this one is deliberately unlike the other three: it uses
**no heading, no Book number, no `FOOTNOTES:` line and no digit** to find
Book 4. It takes two needles out of the **served** text itself — the opening
letter-tokens of its first paragraph and the closing letter-tokens of its
last — requires **each to occur exactly once** in PG #1727, and derives the
region from that. Paragraphs are then cut mechanically on blank lines **with
PG's apparatus still in**, so the count of 81 is an *output*; and every
difference is classified character by character **before anything is
removed**.

**Result: 81 of 81 paragraphs byte-identical after removing only the 14
classified footnote markers (36–49, ascending, no repeats); 8,042 words
compared word for word; 0 mismatches.** Four negative controls fail as they
should (two paragraphs swapped, one letter changed, one word dropped, a needle
absent from PG).

**Two non-marker differences, both classified, neither a word:**

1. **B04-P001** — the served file capitalizes Butler's lower-case `they`. PG
   opens Book IV mid-sentence, exactly as it opens Book III (whose own
   half-sentence is the Book 3 defect, D14). No word changes.
2. **B04-P034** — PG's footnote marker **44 is space-set** rather than glued
   to the word before it (`…bring with them. 44 Early to-morrow…`), and the
   served file removes the marker **and one space**. Book 2's drafter wrote a
   whitespace clause into its rule and recorded that it was a no-op in Book 2;
   in Book 4 it fires.

**One artefact of the same class, which is not a difference and which the
drafter must handle rather than the check**: marker **48**'s removal left a
**line beginning with a space** in the served B04-P050 (`…I like it the better
for that.` / `␣None of our islands…`), which becomes a **doubled space** the
moment the paragraph is flattened for display, search or audio. PG minus the
digits is exactly that, so the served file is faithful and the verification
passes. It is the only instance in Books 3 or 4. **The candidate prints one
space**, and the check block asserts both halves — the served file's artefact
and the candidate's cleanliness — so neither can change unnoticed.

## 2. Names

The census matches the source exactly, name for name:

| Greek (modern edition) | count | Butler's form | count in source |
|---|---|---|---|
| Odysseus | 18 | Ulysses | 18 |
| Zeus | 11 | Jove | 11 |
| Athena | 7 | Minerva | 7 |
| Poseidon | 3 | Neptune | 3 |
| Aphrodite | 2 | **Venus** | 2 |
| Artemis | 1 | Diana | 1 |
| Hera | 1 | **Juno** | 1 |
| Hephaestus | 1 | **Vulcan** | 1 |
| Eurycleia | 1 | Euryclea | 1 |

**Three of these are new.** Book 4 is the first Book to meet `Venus`, `Juno`
and `Vulcan`, and D5 requires the Greek forms for the Olympians who have them.
The table is **extended by enumeration, never generated** (D6 — a general
Roman→Greek list is exactly what would turn Butler's `Ops` into Rhea), and
extended on D5's own rule. The rows are added to `../GLOSSARY.md`.

**The warrant recorded here at drafting was the wrong evidence, and is
corrected** (records finding **R3** of round 1; the rows and every hazard
assertion were **upheld**). This paragraph read: *"extended on D5's own
evidence method: the served `modern-en` being replaced prints Aphrodite 14 /
Venus 0, Hera 6 / Juno 0, Hephaestus 20 / Vulcan 0."* Those counts reproduce
exactly and they are not D5's evidence. D5 rests on the **Cast** and the
**Book Onboarding** — the surfaces the reader meets beside and before the text
— and the served `modern-en` is the file this package exists to replace. On
D5's actual evidence the Cast corroborates **Hephaestus alone** (Aphrodite 0,
Hera 0), the onboarding is silent on all three and still prints `Ulysses`
twice, and the cited file itself prints `Diana` 1, `Saturn` 1 and `Ops` 2.
**The rows stand on D5's rule, which reaches all three Olympians directly;**
the counts are corroboration only. Full statement in `../GLOSSARY.md`.

**D8 fires for the second time**: Butler's `Euryclea` (B04-P066) takes the
Cast's display name **Eurycleia**, as it did in the Book 1 package.

**Not mapped, and flagged rather than corrected**, because the Cast has no
display name for either and D8 is therefore silent — the same disposition as
`Ilius` and `Mycene` the woman:

- **`Idothea`** (B04-P029), Proteus's daughter. The served `modern-en` prints
  *Eidothea*; the Cast prints neither; Butler prints `Idothea`, and so does
  the candidate.
- **`Diomed`** (B04-P022, twice), as in Book 3.

Already Greek and correctly left alone: Apollo, Hades, Proteus, Calypso,
Oceanus, Rhadamanthus, Halosydne, Paeeon, and every mortal in the Book.
`heaven` as the metonym for the gods is untouched — with **one deliberate
exception**, recorded in §5.

## 3. D12 — the poem's first two class-C brackets

Class C was settled at Book 3's round 1 (`../GLOSSARY.md`; ledger D12): **the
mark is dropped, every word stands, nothing is recast across the bracket's
boundaries, and every instance is recorded** with Butler's note and with who
bracketed it. Book 4 carries the first two instances in the poem.

**B04-P001 — PG 1552, never closed.** Butler: `…drove straight to the abode of
Menelaus [and found him in his own house, feasting with his many clansmen…`.
**Footnote 36**, quoted in full:

> *"The lines which I have enclosed in brackets are evidently an
> afterthought—added probably by the writer herself—for they evince the same
> instinctively greater interest in anything that may concern a woman, which
> is so noticeable throughout the poem. There is no further sign of any
> special festivities nor of any other guests than Telemachus and
> Pisistratus, until lines 621-624 (ordinarily enclosed in brackets) are
> abruptly introduced, probably with a view of trying to carry off the
> introduction of the lines now in question."*

Bracketed by **Butler**. The bracket **is never closed in the base text** —
PG's translation body holds 15 opening brackets against 11 closing ones, and
this is one of the four that do not close — so **its extent is not determined
here**, per class C's obligation 3, and nothing in the rendering depends on
knowing it. One drafting consequence is visible: Butler's `abode` becomes
`home` rather than `house`, because `house` recurs four words later inside
the bracketed text and **the sentence is not recast across the point where
the bracket opens**.

**B04-P052 — PG 2067, closed at PG 2070.** Butler: `Thus did they converse
[and guests kept coming to the king's house… in the courts].` **Footnote 49**:
*"See note on line 3 of this book. The reader will observe that the writer has
been unable to keep the women out of an interpolation consisting only of four
lines."* Bracketed by **Butler**; the note is about the bracket, which is why
the package's earlier claim that only three of the six class-C instances were
footnoted was wrong (records finding R3, Book 3 round 1). Mark dropped, all
four lines kept, nothing merged or compressed.

Book 4 contains **no class-A and no class-B bracket**.

## 4. Formulas — inside the Book, and carried from accepted Books

**Repeated inside Book 4, and identical in each instance, because Butler
repeats them:**

| Butler | Modern edition | Where |
|---|---|---|
| "they laid their hands on the good things that were before them" | unchanged | B04-P008, B04-P019 |
| "my brave and lion-hearted husband, who had every good quality under heaven, and whose name was great over all Hellas and middle Argos" | unchanged | B04-P065, B04-P076 |
| "tell me, therefore, for the gods know everything, which of the immortals it is that is hindering me…, and tell me also how I may sail the sea so as to reach my home" | rendered identically both times, with Butler's own `in this way` kept at P031 and absent at P039 | B04-P031, B04-P039 |
| "I will make it all quite clear to you" | unchanged | B04-P032, B04-P034 |
| "my heart was clouded with care as I went along… we got supper ready, for night was falling, and camped down on the beach" | identical where he is identical; **his differences kept** (`to the place where my ships were drawn up` / `to the ships with my companions`; `When I reached my ship` / `When we reached the ships`) | B04-P036, B04-P048 |
| "bethought her of another matter" | "thought of another matter", both times | B04-P020 (Helen), B04-P074 (Athena) |
| "the heaven-fed stream of Egypt" | unchanged | B04-P040, B04-P048 |

**Carried from accepted Books, word for word where Butler is word for word:**

- **B04-P006** is all but Butler's B01-P011. Accepted Book 1's words are used
  (`A maidservant… a fine golden pitcher… a silver basin so they could wash
  their hands… A senior servant… the carver brought plates of every kind of
  meat and set golden cups beside them`), and the candidate differs from Book
  1 **only where Butler differs**: no `then`, `while the carver`, and no
  manservant with wine. This is the paragraph with the Book's lowest
  retention (0.697) and the reason is that it is being made to match an
  accepted Book, not that it is being freely rewritten.
- **B04-P025** is Butler's B02-P001 dawn formula. Rendered in the accepted
  form — **"When Dawn, the rosy-fingered child of morning, appeared"** — and
  Butler's own difference is kept: Book 2 has `his shoulder`, Book 4 has
  `his shoulders`.
- **B04-P027** is Telemachus's suppliant appeal from accepted B03-P011. Butler
  writes it twice and **not identically**; the candidate prints accepted
  Book 3's words and differs exactly three times, where he differs: *"in the
  hope that you may tell me about my father's wretched end"* (B03 has *"may be
  willing to tell me of his…"*), *"out of any pity for myself"* (B03: *"for
  me"*), and *"harried by the Trojans"* (B03: *"harried among the Trojans"*).
  This is the discipline records finding **R1** asked for, applied at the
  drafting stage instead of at review.
- **`cloisters` → `gallery`** (B04-P044, B04-P069), the accepted Book 1 row
  (B01-P023, B01-P026); **"the suitors grew loud throughout the covered
  gallery"** at B04-P069 is accepted B01-P026's wording, as Butler's sentence
  is his own from Book 1.
- **`barrow` → `mound`** at B04-P048, the Book 1 / 2 / 3 row.
- **D3, hecatombs**: B04-P029, B04-P040 and B04-P048 all become plain
  descriptions with **no number supplied** — `my great sacrifices`, `holy
  sacrifices`, `sacrifices that were full and sufficient`.
- **`mixing-bowl` hyphenated** (B04-P020, B04-P051), the cross-Book row
  settled at Book 3's finding 27.1.
- **`maidservant` / `manservant`** closed up, as in accepted Books 1 and 2.
- **Speech tags**: `said she` / `said I` / `said he` are inverted forms the
  accepted Books do not use (0 occurrences in Books 1–3; `he said` 15, `she
  said` 6). Book 4's eight inversions are turned round.
- **`On this`** → **`At this`** (B04-P008, P019, P024, P046), the accepted
  Book 3 row (B03-P034). `whereon` / `whereupon` are on the inherited
  archaism list and do not appear.

## 5. Paragraph-level decisions worth recording

- **B04-P013 — a possessive supplied.** Butler: *"His hands and feet are just
  like Ulysses; so is his hair."* The comparison is elliptical to the point of
  ungrammatical in current English; the candidate prints **"just like
  Odysseus’s"**. A supplied `’s`, not a supplied word, and recorded here
  rather than silently.
- **B04-P034 — the Book's one departure from the `heaven` census.** Butler's
  *"about the time when the sun shall have reached mid heaven"* is a position
  in the sky, not the metonym for the gods, and is rendered **"the middle of
  the sky"**. The candidate therefore has `heaven` **15 times against the
  source's 16**, and this is the single difference — asserted, not assumed.
  Every other `heaven` is untouched, including the metonym.
- **B04-P034 — `furs the water`.** Butler's West wind *"furs the water over
  his head"*. `fur` as a verb in this sense is dead; rendered **"ruffles the
  water"**, which is the same physical picture. Recorded because it is the
  Book's one image-word replaced rather than kept.
- **B04-P037 — `ambuscade`** (twice in the Book) → **ambush**, and *"Our
  ambuscade would have been intolerable"* → *"Lying in wait there would have
  been unbearable"*: `ambuscade` is dead, and the noun cannot carry the
  sentence in modern English.
- **B04-P044 — `in the shambles`** → **"in the slaughterhouse"**. *Shambles*
  in current English means a mess, which is the opposite of what the simile
  needs.
- **B04-P065 — `You hussies`** → **"You impudent girls"**. The word is dead
  and now reads chiefly as an insult about sexual conduct, which Penelope is
  not making; her charge is that they did not wake her.
- **B04-P073 — `caught in the toils`** → **"caught in a net"**; *toils* in
  this sense is dead and the modern reader takes it as *labours*.
- **B04-P011 — `work box` kept, open, twice.** Butler prints `work-box` once
  and `work box` once; the object is a box, not a basket, so it is not
  renamed, and the edition prints it one way (D7's principle). Flagged for the
  reviewer as a genuine choice.
- **B04-P050 — `a piece of plate`** kept. It is Telemachus's own distinction
  between metalwork and horses, and **the text glosses itself at the point of
  need**: Menelaus names the object in the very next paragraph — *"the finest
  and most precious piece of plate in all my house. It is a mixing-bowl… of
  pure silver"*. **The reason first recorded here was a false cross-reference
  and is withdrawn** (finding 50.1): this note said "accepted Book 1 already
  carries `plate`", and it does not — accepted B01-P011's `plates` are the
  dinner plates the carver brings, a different word in a different sense. The
  decision is right; the reason was wrong, and it would have misled whoever
  next met `plate`. Habit adopted from this: **when a continuity note cites
  another Book, quote the sentence it cites.**
- **B04-P072 — `thole pins`** kept, unglossed and unhyphenated: it is a
  concrete object, and the sentence explains it (the oars are bound to them).
  `all in due course` becomes **"each in its place"**, not Book 3's `in due
  order`, because Butler's phrase here is about the oars' arrangement rather
  than the order of an action.
- **B04-P028 — Menelaus's simile** is kept limb for limb (hind, new born
  young, lion's lair, feeding in the forest or a grassy hollow, the lion's
  return), and `dell` becomes `hollow`.
- **B04-P042 — `large talk`** → **"big talk"**, deliberately not `boasting`,
  because Butler has already used *boasting* two sentences earlier and the two
  words are doing different work.
- **B04-P047 — Elysium kept whole**: the plain at the ends of the world,
  fair-haired Rhadamanthus, no rain, hail or snow, and Oceanus breathing a
  West wind. Nothing is glossed; the passage explains itself.
- **B04-P009 — Menelaus's 392-word speech** is the Book's longest paragraph
  and is kept as one paragraph, with every stage in Butler's order: the eight
  years, the seven peoples, the Libyan lambs and the thrice-lambing ewes, the
  brother's murder, the third of his wealth he would trade, the one man he
  grieves for above all, and the three at home.

## 6. The retention figure, 0.95958 — stated as a risk, not as a pass

**0.95958 is the highest retention in the package, and it is the first number a
reviewer should test.** Books 1–3 are 0.728, 0.902 and 0.897.

What can be said for it, with evidence rather than assertion:

- **Book 4 is mostly speech in Butler's plainest conversational register.**
  71 opening quotation marks in 8,042 words; the suitors' exchanges
  (B04-P053–P058), Medon and Penelope (P060–P063), Eurycleia (P066) and the
  vision (P075–P079) are already modern English sentence by sentence, and
  eight of those paragraphs retain 1.000 — meaning no Butler token was lost,
  though words were added.
- **Its archaism density is lower than Book 3's.** Counting one fixed list of
  dead forms over the served originals: Book 1 **2.68** per 1,000 words,
  Book 2 **4.54**, Book 3 **7.15**, Book 4 **3.98**. Book 3, the nearest
  comparison in kind, is **1.8× more archaic per word**.
- **Density does not explain the whole gap, and this sheet does not pretend it
  does.** Book 1 has the *lowest* archaism density of the four and the
  *lowest* retention by a wide margin (0.728), so retention is not a function
  of the source alone; it is also a function of how freely the drafter recast
  syntax. On that measure this draft is lighter-handed than Book 1's.
- **Two further drafting passes were made before freezing, and are why the
  number is 0.95958 rather than 0.967.** The first pass left thirty dated or stiff forms
  standing — `whereupon` (which is on the package's own archaism list and
  would have failed the guard), `hereabouts`, `if you so will`, `by means of
  which`, `be pleased to`, `nor yet`, `in the toils`, `bereft of thought and
  motion`, `suffer you to weep`, `divine commission`, `I had rather`, eight
  inverted speech tags, four `On this`, and `levelled` against the American
  standard. All were fixed. A third pass, prompted by the
  check block reporting which paragraphs were byte-identical to Butler, caught
  four more: `tell me, and tell me true` at B04-P041, which is the **Book 3
  row** (accepted B03-P021 renders the same Butler formula `tell me truly`) and
  was therefore a cross-Book inconsistency as well as an archaism;
  `broken hearted` twice (B04-P041, B04-P045) → `heartbroken`; and `bondsmen`
  at B04-P055 → `bondservants`, since *bondsman* in current English means a
  person who posts bail. None of these was found by a reviewer; all were found
  by the package's own instruments.
- **Seven paragraphs are byte-identical to Butler** — B04-P039, P054, P061,
  P063, P070, P079 and P080 — and this is recorded rather than fixed. Each was
  read against the accessibility standard and each is already plain modern
  English: Noemon's question about his ship, Medon's two speeches, the suitor's
  remark, the vision's refusal, and the two short narrative paragraphs. Book 3
  could assert that **no** paragraph was identical to its source; Book 4 cannot,
  and the check block asserts the list exactly instead, so a later edit cannot
  quietly add an eighth.

**What the reviewer is asked to do with it** is what Book 3's reviewer did
with 0.895: read the least-changed paragraphs against Butler and say whether
the lightness is the source's or the drafter's. Book 3's answer had a clear
shape — its most-rewritten paragraphs were the archaism-heavy ones and its
least-changed were the plain catalogues. **Book 4's shape is mixed, and the mixture
is the thing to look at.** Three of its six most-rewritten paragraphs are
rewritten because a **cross-Book formula forced it** — B04-P006 (0.697)
against accepted Book 1's table formula, B04-P025 the dawn formula, B04-P069
the covered gallery — and the other three are ordinary Victorian residue:
B04-P059's *"Thus did he speak… applauded his saying"*, B04-P033's *"by means
of which I may"*, B04-P071's *"let us be up and do that in silence, about
which we are all of a mind"*. So the Book 3 pattern is present but thin,
because the archaic sentences themselves are thin on the ground here; and a
reviewer should ask whether **more** of Butler's chained syntax ought to have
been recast than was.

| least retained | | most retained | |
|---|---|---|---|
| B04-P006 | 0.697 | B04-P063 | 1.000 |
| B04-P059 | 0.737 | B04-P066 | 1.000 |
| B04-P025 | 0.848 | B04-P067 | 1.000 |
| B04-P033 | 0.868 | B04-P070 | 1.000 |
| B04-P071 | 0.878 | B04-P079 | 1.000 |
| B04-P023 | 0.884 | B04-P080 | 1.000 |

## 7. Punctuation — D4 at the scale of a whole narrative

`../PUNCTUATION.md`: typographic marks throughout, no ASCII apostrophe or
double quote (asserted). Book 4 is the package's largest use of **D4** by far.

**Menelaus speaks continuously from B04-P028 to B04-P049.** Twenty-one
paragraphs are unbalanced — each opens its own `“` and closes none — and the
candidate's unbalanced set is **exactly the source's**: B04-P028 … B04-P048,
with the closing mark falling at the end of P049. Totals match the source
exactly: **71 opening marks, 50 closing**. Inside that narrative, Idothea's
and Proteus's speeches are nested in single marks, and the nesting is
reproduced mark for mark.

### Base-text defects

**B04-P040 — a quotation-mark slip in Butler, repaired and recorded.** PG and
the served original both print:

> `“Then,’ he said, ‘if you would finish your voyage…`

— a double opening mark where the nested speech needs a single one, leaving a
single closing mark with nothing to close. Every neighbouring paragraph of
Proteus's speech opens `“‘`. The candidate prints **`“‘Then,’ he said, ‘if you
would finish your voyage…`**. This is the class `PUNCTUATION.md` §3
normalizes — a mark a modern reader reads as an error, because it is one — and
it is the reason the candidate carries **25 opening single marks against the
source's 24**. No word is changed and nothing is supplied.

**No other defect.** No truncated, duplicated or spliced paragraph; nothing of
the D14 class (Book 3 ¶38 remains the only instance in the served file); no
Gutenberg apparatus inside any paragraph; the 14 footnote markers are cleanly
removed, with the two space-related artefacts recorded in §1.

## 8. One thing the drafting mechanism did, and the checks caught

The second drafting pass edited the paragraphs in memory and rewrote
`../scripts/candidates/book4.py` from the edited list. The rewrap used
`textwrap.wrap`, whose default **breaks on hyphens** — and it split three
compounds across the literal boundary, so that the rebuilt module produced
`scepter- bearing` (B04-P007), `violet- colored` (B04-P011) and
`lion- hearted` (B04-P065): a space inside a word, in three places, invisible
in a diff of wrapped lines.

**The package's own check block caught it**, and specifically the assertion
that Penelope's `brave and lion-hearted husband…` sentence occurs **twice**,
identically — B04-P076 was undamaged and B04-P065 was, so the count came back
1 instead of 2. The repeated-formula assertions exist to catch a drifting
rendering; here one caught a mechanical corruption instead.

Fixed by re-wrapping with `break_on_hyphens=False` and `break_long_words=False`
and asserting the module round-trips to the exact edited text. The frozen hash
below is the repaired build; the damaged one
(`a293f196d83ab6f6faa748288cad5a5568ecf1e8bd7f3cd7755adeba26add82a`) was never
pushed. **Recorded because the lesson generalises**: a rewrap is a text
transformation like any other and has to be asserted, not trusted, and a
`\w+- \w+` scan now runs over every candidate.

## The collision backlog, ruled

**Session `session_01K5bL9oWzAagjTMExsyUADi`, 2026-09-13, a worker that did not
build the instrument.** `scripts/collision_triage.py` exited non-zero for Books
1-6 with **221 rows carrying no disposition** — 96, 30, 27, 30, 26 and 12. The
worker that built the instrument declined to rule them, on the grounds that
writing 221 dispositions in the session that built the instrument would be the
very defect the instrument exists to catch. It was right. This section records
what ruling them found in **Book 4**.

| disposition | rows |
|---|---|
| `artifact` | 2 |
| `common-rendering` | 8 |
| `common-word` | 7 |
| `context-rendered` | 2 |
| `discrimination` | 1 |
| `free-variation` | 1 |
| `homograph` | 3 |
| `kept` | 69 |
| `kept-elsewhere` | 10 |
| `matches-accepted` | 5 |
| `phrase-not-word` | 3 |
| `same-referent` | 2 |
| `unavoidable-merge` | 9 |
| `variant` | 8 |

**130 rows, 26 of them ruled by hand. Two were live and Book 4 is owed a
successor for them; `book04/candidate-v5.json`
(`3c21549edf30a74d5f1a5bedfe01f53823267a46caae97f59e0ebf5ce6c9986d`) is it.**

* **B04-P017, `forenoon` -> `morning`. The sharpest finding of the whole
  backlog, because the candidate's own sentence convicts it.** Butler: `Morning
  will come in due course, and in the forenoon I care not how much I cry for
  those that are dead and gone.` Pisistratus is refusing to weep at the evening
  meal and naming the hours when weeping is proper. The candidate wrote
  `Morning will come in its own time, and in the morning I do not care how much
  I cry` — a sentence that says a thing will come, and that when it has come it
  will be there. The whole point of the sentence is the deferral, the deferral
  is carried entirely by the second word, and the candidate spent it on the
  first. Repaired to **`and later in the day`**. This is a small widening:
  Butler's `forenoon` is the hours before noon and `later in the day` is not
  bounded at noon. It is recorded here rather than hidden, because every
  rendering that kept the bound reused the word `morning` and so kept the
  collision.
* **B04-P040, `holy hecatombs` -> `holy sacrifices`,** one sentence from
  Butler's own `you must offer sacrifices to Zeus`. A hecatomb IS a sacrifice,
  so the referent is not lost; what is lost is the SCALE — and that is the one
  thing accepted Books 1 and 3 both paid for with an adjective (`great
  sacrifice` at B01-P003, `fine sacrifice` at B03-P007). **Book 4 was the
  accepted Book out of step**, which is the `luscious` shape a third time — the
  third consecutive run of this instrument to find something in work already
  accepted. Repaired to `great and holy sacrifices`, matching Book 1's scale
  word.

  The row does not disappear from the report and is not meant to: it is ruled
  `same-referent`, because the noun is still Butler's own. What the successor
  buys is that three accepted Books now treat his `hecatomb` the same way.

**One divergence recorded, not repaired.** Book 4 renders Butler's `dwells` as
`lives` at B04-P047; **accepted Book 7 keeps `dwells`** at B07-P021. Both
readings are defensible, neither is wrong, and repairing either would cost a
successor for no reading gain.

Every row touching this Book now carries a disposition and
`python3 scripts/collision_triage.py 4` exits zero. The full table, one row per
collision with its reason, is generated into `book04/collisions.md`.

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
`book04/candidate-v5.json`; the evidence is **100 served modern-English editions**, read only, and
a pair is `closed` only when the closed form leads the open form **3x** and
appears in at least **3 distinct editions**. The corpus is machine-generated and
is never a sole authority (ledger A5(b)).

**47 pairs.**

| pair | disposition | corpus evidence |
|---|---|---|
| `after day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `best men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `brave man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `chief men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `either man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `either side` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `end wall` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `fair fields` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `flashed fire` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `gray sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `great sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `head man` | **`kept open, standard`** | the candidate writes `head man`; corpus closed 2 in 1 editions against 5 hyphenated and 1 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `hiding place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `honorable men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `inner room` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `let water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `like sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `little way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long time` | **`kept open, standard`** | the candidate writes `long time`; corpus closed 2 in 2 editions against 0 hyphenated and 658 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `long way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `lost hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `mortal man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `mortal men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `old man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `open fields` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `open sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `opposite side` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `outer court` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `perfumed room` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `pisistratus man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `poured water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `precious piece` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `running water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `salt water` | **`kept open, standard`** | the candidate writes `salt water`; corpus closed 5 in 4 editions against 1 hyphenated and 12 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `set beds` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `short work` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `silver work` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `third man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `till night` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `trojan women` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `twelve days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `twenty days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `twenty men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `worst man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `young man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `young men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
