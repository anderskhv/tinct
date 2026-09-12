# Glossary — stable renderings for the Odyssey modern edition

Fixed before drafting Book 1 (2026-09-11). **Revised 2026-09-12** at Book 1's
step 6, when the round-1 reviewer's standing finding **S1** reversed the
naming decision. Extended book by book as new names, epithets, and recurring
formulas are met — add rows before the paragraph that first uses them is
drafted, per `WORKFLOW.md` step 2.

## Naming decision (binding) — Greek forms, not Butler's Roman ones

**Superseded decision, recorded so the reversal is legible.** Between
2026-09-11 and Book 1's acceptance this file said the opposite: *every proper
name is kept in the exact form the served `original-en` (Samuel Butler, 1900)
uses it.* That was ledger decision **D1**, a correct reading of the drafting
brief, and Book 1's `candidate-v1.json` applied it exactly (the reviewer's
name census confirms not one name was silently moved off Butler's form).

**It is overruled, by the coordinator, at round 1 of Book 1's review**
(`book01/review/findings-v1.md`, standing finding S1). The modern edition
uses the **Greek** forms. The reasons are the product's, not the
translation's, and the evidence in the repository is one-sided:

- `app/public/data/editions/odyssey-threads.json` — the Cast data shown beside
  the text — uses **Odysseus (319), Athena (21), Zeus (24), Poseidon (19),
  Hermes (12)**, against one occurrence each of Ulysses, Minerva, Jove,
  Neptune and Mercury, every one of them inside a `searchNames` alias array
  rather than a display name.
- `app/public/data/onboarding/odyssey.json` — what a first-time reader meets
  *before* the text — uses **Odysseus 21 times**, Poseidon 4, Athena 1.
- The served `odyssey-modern-en.json` being replaced uses the Greek forms
  throughout, **including in its chapter titles** ("Book 1 — The gods in
  council—Athena's visit to Ithaca—…").
- The Odyssey Book 10 pilot independently chose the Greek forms.

A reader who meets "Odysseus" in the onboarding, taps a highlighted
"Odysseus" in the Cast and then reads "Ulysses" in the modern edition has
been handed two names for one man by the same product on the same screen.
Butler's forms stay, correctly, in `original-en`, which *is* Butler; the
modern edition is not Butler and does not owe them.

### The mapping (apply by script, case-sensitive, word-bounded)

| # | Butler (source) | Modern edition | Book 1 count | Notes |
|---|---|---|---|---|
| 1 | Ulysses | **Odysseus** | 17 (14 plain + 3 possessive) | |
| 2 | Minerva | **Athena** | 12 | |
| 3 | Jove | **Zeus** | 6 | |
| 4 | Neptune | **Poseidon** | 6 (5 plain + 1 possessive) | |
| 5 | Mercury | **Hermes** | 3 | |
| 6 | Saturn | **Cronus** | 2 | Both inside the fixed epithet; see the epithet table. |
| 7 | Diana | **Artemis** | 0 in Book 1 | Recorded for later Books. |

**Chapter titles are remapped too.** The candidate's `title` field carries the
served original's chapter title; in the modern edition it takes the Greek
form, matching the served `modern-en` the replacement sits in.

### Hazards — every one of these is a way a naive pass corrupts the text

Each is asserted by the build script that applies the mapping
(`scripts/build_book01_v2.py`, and every later Book's equivalent), so that a
rebuild cannot lose one silently.

1. **`Ops` is NOT mapped. It is already Greek.** Butler's "Euryclea, daughter
   of Ops, son of Pisenor" (B01-P032) is Ὦψ, Eurycleia's grandfather — a man.
   *Ops* is **also** the Roman name of Rhea, so any mapping table assembled
   from a general Roman→Greek deity list carries the row `Ops → Rhea`, and
   applying it here replaces a man's name with a goddess's and breaks the
   genealogy. **The table above is closed: it has seven rows and no others.**
   Assert `Ops` survives and `Rhea` never appears.
2. **`Saturn` occurs only inside the fixed epithet**, so the epithet's row
   below is rewritten with it rather than the candidate alone. The Greek form
   is **`Cronus`** — this file previously spelled it *Cronos* in two places;
   *Cronus* is the standard English form and is settled here. There is no
   Cast entry for this figure, so `odyssey-threads.json` supplies no
   authority either way.
3. **The possessive of a name ending in -s is `'s`: `Odysseus's`.** Decided
   once, here, for every Book. It matches the candidate's existing
   `Telemachus's`, `Phemius's` and `Agamemnon's`, and it is what an English
   reader says aloud. Butler's own `Ulysses’` (bare apostrophe) is not
   carried over. Assert that no bare `Odysseus’` survives.
4. **Matching is case-sensitive and word-bounded.** `Same` is the island in
   B01-P017 ("Dulichium, Same, and wooded Zacynthus"). A case-insensitive
   pass over a table containing any short name destroys ordinary words, and
   this is the paragraph where it shows. Assert the island phrase survives.
5. **`heaven` is not a name and is never touched.** Ten occurrences in Book 1
   alone, all Butler's metonym for the gods collectively ("it rests with
   heaven to decide", "call heaven to witness", "heaven has laid other
   sorrows on me", "some message from heaven"). It is not a stand-in for
   Jove and does not become "Zeus". Assert the count is unchanged by the
   mapping pass.
6. **`Hyperion` stays.** B01-P001, "the cattle of the sun-god Hyperion" —
   already Greek. Butler's "Sun-god" is a description, not a Roman name. Do
   not expand to "Helios". Assert `Helios` never appears.

### `Euryclea` → `Eurycleia`

**Settled with the mapping, though it is not a Roman→Greek substitution.**
Butler spells the nurse *Euryclea*; the Cast's display name is **Eurycleia**
(`odyssey-threads.json`, with "Euryclea" kept there as a `searchNames` alias,
so Cast highlighting works either way). Since the edition is adopting the
product's Greek forms, it adopts the product's spelling: **Eurycleia**, one
occurrence in Book 1 (B01-P032). This removes the last name on which the
edition and the Cast disagree. No other Butler spelling is "corrected" on
these grounds: the rule is *the Cast's display name wins where the Cast has
one*, not *the drafter's judgement of what looks Greek enough*.

### Names that change in no Book

Already Greek in Butler, and left exactly as he spells them: Telemachus,
Penelope, Calypso, Circe, Laertes, Nestor, Menelaus, Agamemnon, Orestes,
Aegisthus, Atlas, Thoosa, Phorcys, Polyphemus, Cyclopes, Mentes, Anchialus,
Taphians, Temesa, Rheithron, Neritum, Phemius, Icarius, Antinous, Eupeithes,
Eurymachus, Polybus, Pisenor, Ephyra, Ilus, Mermerus, Dulichium, Same,
Zacynthus, Ithaca, Troy, Sparta, Pylos, Ogygia, Achaeans, Danaans, Argives,
Argos, Hellas, Ethiopians, Olympus/Olympian, Hyperion, Ops.

Book 2 adds: Aegyptius, Antiphus, Eurynomus, Themis, Erinyes, Halitherses,
Mentor, Leiocritus, Evenor, Noemon, Phronius, Tyro, Alcmena, Ilius.
**`Mycene` is not in this list**: Butler spells two different things with it,
and it has its own row below.

### `Mycene` — two referents, one Butler spelling (D13)

**Settled 2026-09-12 at Book 2's step 6, on Book 2 records finding R1, before
Book 3 is drafted.** The previous row listed `Mycene` under "names that change
in no Book" with a note that she is the woman and not the city. That is right
for Book 2 and wrong as a rule: **Butler spells the city `Mycene` too**, and
Book 3's drafter meets the city four hundred lines after Book 2 ends.

All three occurrences in Butler, verified directly in
`source-texts/pg1727-butler-1900.txt`:

| PG line | Book | Butler | Referent | Modern edition |
|---|---|---|---|---|
| 843 | II | "Tyro, Alcmena, **Mycene**, and the famous women of old" | the **woman** Mykene, in a list of women | **`Mycene`** — unchanged |
| 1377 | III | "For seven years after he had killed Agamemnon he ruled in **Mycene**" | the **city** | **`Mycenae`** |
| 9326 | XXI | "a woman whose peer is not to be found in Pylos, Argos, or **Mycene**" | the **city**, in a list of places | **`Mycenae`** |

**The city takes `Mycenae`, under decision D8** (the Cast's display name wins
where the Cast has one): `app/public/data/editions/odyssey-threads.json` gives
Agamemnon the epithet **"Murdered King of Mycenae"** — the file's only
occurrence of either spelling — so the reader who taps Agamemnon in the Cast
is shown *Mycenae*, and the edition beside it must not print *Mycene* for the
same place. The **woman** has no Cast entry at all, so D8 is silent about her
and Butler's spelling stands; the list she stands in does the disambiguating,
and a reader who takes her for the city is in Butler's own reader's position.

Two things worth recording, because they make this D8 applied as written
rather than the drafter's judgement of what looks Greek:

- **The served `modern-en` being replaced already draws exactly this line** —
  `Mycene` at its Book 2 ¶7 (the woman), `Mycenae` at Book 3 ¶24 and Book 21
  ¶6 (the city). It made the choice without recording it, as it did with the
  name forms; this package records it.
- **This is not a licence to "correct" other Butler spellings.** D8 is narrow.
  `Ilius` stands beside Butler's own `Troy` and is *not* flattened
  (Book 2's reviewer ruled on it), precisely because the Cast has no display
  name for it. The two decisions look opposite and rest on the same rule.

Do not silently correct a Butler spelling that looks unusual (his own
inconsistencies between Books, if any turn up) — flag it in the Book's
`continuity.md` instead, per the Book 10 pilot's precedent for
"Laestrygones" vs. "Laestrygonians." The one exception is the Cast-display-name
rule above. **Two flagged so far, both first met in Book 2:** `Ilius`, Butler's
form for Ilion/Troy at B02-P002, which stands in the same chapter as his own
`Troy` at B02-P010 — **ruled on at Book 2's round 1: both forms kept, no gloss**,
because they answer to Homer's own two names and flattening them erases a
distinction the Greek makes; and `Mycene` at B02-P007, who is the **woman**
Mykene in a list of famous women of old, not the city — **settled at Book 2's
step 6, and it is now its own row** (see "`Mycene` — two referents, one Butler
spelling" above), because Butler spells the city `Mycene` too.

## Butler's square brackets — the rule, written by class (D12)

**Settled 2026-09-12 at Book 2's step 6, on Book 2's round-1 ruling 1 and
records finding R4, before Book 3 is drafted.** Book 2 met the package's first
bracket and disposed of it correctly on a reason that was wrong. The reason
matters, because **Butler brackets at least three different things and one
disposition cannot be right for all three** — Book 3 meets the second class in
its opening pages and Book 4 the third.

The enumeration is this package's own, made directly over PG #1727's
translation body (the 24 `BOOK` headings at lines 375–10842, ending at the
real `FOOTNOTES:` at line 10843 and not the indented one at line 75):
**fifteen brackets, in three classes.** Butler's own footnotes 18, 36, 81, 91
and 107 supply the classification; they are quoted, not inferred.

### Class A — a supplement Butler makes because the Greek lacks the words, flagged as supplied

**Disposition: the mark is dropped and the words stand**, with the pointing the
bracket was carrying supplied in ordinary modern punctuation where it carried
any. Recorded per instance in the Book's `continuity.md`.

**Test:** Butler says, in his own note, that he *supplied* the words and that
the sense requires them. That is a translator's supplement, defended in a note
— so keeping the words is not our editorial judgement at all, it is his.

- **PG 802, Book II** — `[do not] hold back, my friends`. Footnote 18: *"The
  authoress has bungled by borrowing these words verbatim from the 'Iliad',
  without prefixing the necessary 'do not,' which I have supplied."* Rendered
  at B02-P004 as `…who is the beginning and the end of councils: do not hold
  back, my friends…`, the colon carrying the bracket's pointing. It is the
  only class-A bracket in the poem.

### Class B — an explanatory supplement inside the line, unflagged

**Disposition: the same — the mark is dropped and the words stand — but the
warrant is different and weaker, so every instance is recorded AND flagged in
the Book's `continuity.md`, named as class B.**

**Test:** the bracket sits inside a sentence, adds no claim the sentence does
not already make, and carries no note. It is Butler explaining rather than
Butler translating.

**Why keep it, given that the package adds nothing explanatory.** The rule
this package is bound by is that *the drafter* adds nothing to the base text.
Butler's supplement **is** the base text — it is printed in the served
`original-en` and every reader of the original column sees it — so dropping
the words would put the modern edition *behind* the original beside it, which
is the one thing paragraph alignment makes visible. Dropping the mark asserts
nothing Butler does not already print as part of his sentence: unlike class C,
his bracket here records no doubt about what the poem says.

Eight instances, none of them footnoted:

| PG line | Book | bracket |
|---|---|---|
| **1129** | **III** | `burning the thigh bones [on the embers] in the name of Neptune` |
| 4367 | X | `driving in his sheep and goats [to be milked]` |
| 4368 | X | `driving out his flock [to feed]` |
| 5543 | XII | `the [Wandering] rocks` |
| 8057 | XVIII | `brought him [into the open part of the court]` |
| 9351 | XXI | `against the door [that led into the house]` |
| 10132 | XXIII | `at right angles [to that by which she had entered]` |
| 5410 | XII | `[A large fig tree in full leaf grows upon it]` — **borderline**: a whole clause, and footnote 101 attaches inside it. Decide it when Book 12 is drafted, against class C as well as this class; it is not Book 3's problem. |

### Class C — a passage Butler brackets to mark editorial doubt that it belongs to the poem

**Disposition: OPEN. Neither default is right, and this class must not be
drafted under the class-A/B rule. It needs a coordinator decision before
Book 4 is drafted.**

**Test:** Butler's note says the bracketed lines are an afterthought, an
interpolation, or a later addition — a statement about the *text*, not about
his English. Footnote 36: *"The lines which I have enclosed in brackets are
evidently an afterthought—added probably by the writer herself."* Footnote 91:
*"I suppose the lines I have enclosed in brackets to have been…"* Footnote
107: *"I suppose the passage within brackets to have been an…"* (Footnote 81
is Butler reasoning about received-text brackets generally — *"all that
brackets mean is that the bracketed passage puzzled some early editor"* — and
is worth reading before the decision is made.)

**Why the class-A/B rule silently damages it.** Dropping the mark converts
Butler's recorded editorial doubt into plain narration, so the reader is told
as fact what Butler flags as probably added later — and a drafter applying
"the bracket rule" from Book 2 will do exactly that without noticing.
Dropping the words instead loses content. **The damage is invisible in the
output**, which is why this is a decision and not a drafting judgement.

Six instances, the first of them in Book 4:

| PG line | Book | what is bracketed | Butler's note on the bracket |
|---|---|---|---|
| **1551–2** | **IV** | Menelaus's double wedding feast, a long passage | **fn 36** — *"The lines which I have enclosed in brackets are evidently an afterthought—added probably by the writer herself"* |
| 4884 | XI | Teiresias's prophecy of the homecoming, `[in another man's ship, and you will find trouble in your house…]`, closing at PG 4902 | **fn 91** — *"I suppose the lines I have enclosed in brackets to have been added by the author when she enlarged her original scheme"* |
| 5691 | XII | `[The gale from the West had now spent its force…]` | **fn 107** — *"I suppose the passage within brackets to have been an afterthought but to have been written by the same hand as the rest of the poem"* |
| 2067 | IV | `[and guests kept coming to the king's house…]` | none about the bracket (fn 49 sits after it and is about something else) |
| 4260 | IX | the end of Polyphemus's curse, `[let him reach his home in another man's ship…]` | none about the bracket |
| 6016 | XIII | `[near it is the cave sacred to the Naiads…]` | none about the bracket |

The last three are classed here on shape alone — a whole passage or sentence
bracketed, of the same kind as the three Butler explains, and two of them
(PG 4260, PG 4884) are the *same* bracketed prophecy in two places, which is
itself Butler's point in footnote 91. **A drafter meeting one of them still
stops**: a class-C bracket without a note is not thereby a class-B bracket.

**Until that decision is made, no Book containing a class-C bracket is
drafted.** Books 1, 2 and 3 contain none, so Book 3 is unaffected.

### The one line to remember

**The class is decided by whose voice the bracket is in and what it is about**
— the same test the Meditations package's D13 settles for Long's brackets, and
for the same reason: a bracket that speaks about *the translation* or about
*the state of the text* is the translator addressing his reader, and folding
it silently into the narration puts an editor's doubt into Homer's mouth. It
is **not** decided by length: class A is two words and class B's longest is
nine, while class C's shortest is a clause and its longest runs for pages.

## Spelling and punctuation standard

Settled at Book 1 step 6 from records findings **R2** and **R1**; see
`PUNCTUATION.md` for the punctuation half in full.

- **American spelling**, matching the served editions and the rest of the
  product (the served `modern-en` being replaced is American throughout:
  honor 38, favor 24, traveled 15, neighbor 15, labor 9). Butler is British
  (`honour`, `travelled`, `harbour`, `rumour`) and his forms are modernized.
  Book 1 carries `favor`, `honored`, `honor` ×2, `offense`, `harbor`,
  `marveled`, `rumor` — and, in v1, one British survivor, `woollen`, now
  `woolen`.
- **`draughts`** (B01-P008) is not a spelling variant and stays: it is the
  game's name, and "checkers" would be an Americanism the register does not
  license.
- **Typographic quotation marks and apostrophes throughout** — `“ ” ’` — as
  the served `original-en` has them and as the candidate's own double quotes
  already were. The ASCII apostrophe is not used.

## Recurring epithets and formulas (Book 1)

| Butler (source) | Modern edition | Notes |
|---|---|---|
| "son of Saturn, King of kings" (address to Jove) | **"son of Cronus, king of kings"** | Athena's fixed form of address to Zeus; kept every time it recurs (Book 1: twice, B01-P005 and B01-P007). Lower-cased "king" to match modern sentence-style capitalization elsewhere in the candidate; "Cronus" capitalized as a proper name, per mapping row 6. |
| "sire of gods and men" (of Jove) | **"father of gods and men"** | Standard Homeric epithet for Zeus; "father" is the plain modern word for "sire" (which now reads either archaic or specifically about horse-breeding), keeping the same formulaic function. Book 1: once, B01-P003. Use this exact phrase every time Butler uses "sire of gods and men". |
| "tell me, and tell me true" (and variants) | **"tell me truly"** | Butler's repeated formula for an insistent request for honest information. **Four instances in Book 1, in three paragraphs: B01-P013 twice** ("tell me and tell me true, who you are" and "Tell me also truly, for I want to know"), **B01-P014**, **B01-P016**. *(Corrected at step 6, records finding R4: this row previously cited "P12, P13, P15, P18 in Butler's paragraphing", which was both miscounted — four instances fall in three paragraphs, not four — and numbered on the 0-indexed source array against the 1-indexed `B01-Pnnn` IDs used everywhere else. All IDs in this file are `B01-Pnnn`.)* Rendered the same way each time, dropping the doubled "tell me… tell me" (a stutter in modern English) while keeping the emphasis on truthfulness the doubling exists to add. |
| "laid her son's saying in her heart" (of pondering) | **"kept her son's words in her heart"** | Homeric formula for turning something over inwardly, **not** for accepting it. Fixed at Book 1 step 6 (optional finding 26.1 applied): "taking her son's words to heart" — which in modern English means *accepting* or *being wounded by* — became "kept her son's words in her heart" at B01-P026. The formula recurs through the poem; use "kept … in his/her heart" each time. |
| "hecatomb" | **"a great sacrifice of …"** | Technical term for a formal sacrifice of (originally) a hundred oxen, though by Homer's period it no longer meant literally a hundred of anything. Folded into a plain description at first use rather than kept as a gloss-needing loanword — **but without supplying a number Butler declines to give** (revised at step 6, optional finding 3.1: v1's "an offering of a hundred sheep and oxen" became "a great sacrifice of sheep and oxen" at B01-P003). Later Books' hecatombs inherit this form. |
| patronymics ("Odysseus, son of Laertes" and the like) | *(not yet met as a fixed formula in Book 1; Laertes is named as Odysseus's father at B01-P014 and B01-P032 without the formula itself appearing)* | Watch for Butler's fuller patronymic epithets in later Books (e.g. "Ulysses, noble son of Laertes," used repeatedly by Circe in Book 10) and fix a single rendering the first time the full formula appears. |

## Recurring epithets and formulas first met in Book 2

| Butler (source) | Modern edition | Notes |
|---|---|---|
| "Now when the child of morning, rosy-fingered Dawn, appeared" | **"When Dawn, the rosy-fingered child of morning, appeared"** | The dawn formula, the poem's most-repeated line-opening. All three elements kept — *child of morning*, *rosy-fingered*, and Dawn as a person — with only the apposition reordered, because Butler's order leaves "Dawn" as the last word before the main clause and a modern reader parses "appeared Telemachus rose" as one phrase. First use B02-P001; use this exact form every time it recurs. |
| "spoke to them plainly and in all honesty" / "plainly and in all honesty addressed them thus" | **"spoke to them plainly and in all honesty, and said:"** | Butler's mark for a speaker who is telling the truth. Book 2 uses it twice, of Halitherses (B02-P009) and of Mentor (B02-P013), in a Book where nobody else is; rendered identically both times. |
| "Hear me, men of Ithaca" | **"Hear me, men of Ithaca"** | Kept identical at B02-P010 and B02-P014. Butler's own variation at B02-P003 ("Men of Ithaca… hear my words" → "hear what I have to say") is kept different, because he wrote it different. |
| "the grey-eyed daughter of Jove" | **"the gray-eyed daughter of Zeus"** | Athena's epithet. **`gray`**, not `grey`, under the spelling standard above — the served `modern-en` uses "gray" twelve times and "gray-eyed" itself. First use B02-P034. |
| "a barrow to his memory" | **"a mound to his memory"** | Fixed at Book 1 (B01-P019) and applied identically at B02-P012. |
| "spunging upon one man" | **"feeding off one man"** | Fixed at Book 1 (B01-P027) and applied identically at B02-P008. |
| "moodily" | **"in low spirits"** | Fixed at Book 1 (B01-P009) and applied identically at B02-P020. |
| "cloisters" / "the cloister" | **"the gallery"** | Fixed at Book 1 (B01-P023, B01-P026) and applied identically at B02-P033 — it is the same part of the house. |
| "all the marriage gifts that so dear a daughter may expect" | **"all the marriage gifts a beloved daughter may expect"** | Book 1 (B01-P019) and Book 2 (B02-P011). **Settled 2026-09-12 at Book 2's step 6, on Book 2 round-1 finding 11.1**, after being deferred twice. The earlier rendering was "a beloved daughter **deserves**", which moves Butler's claim from *custom* (what a well-loved daughter can look to receive) to *desert* (what she has earned) — a moral judgement put into the mouth of **Eurymachus**, mid-threat, at B02-P011. Butler's own verb contains no archaism, so it is restored; the drafter's improvement of "so dear a daughter" to "a beloved daughter" stands. Applied in both Books at once, per the cross-Book formula rule: `book01/candidate-v3.json` (a recorded successor to accepted v2 — see `book01/changes-v2-to-v3.md`) and `book02/candidate-v2.json`. |
| the Zeus-reckoning close: "Jove shall reckon with you in full, and when you fall in my father's house there shall be no man to avenge you" | **"Zeus will settle the account with you in full, and when you fall in my father's house, there will be no one to avenge you"** | Telemachus says it twice in the poem's first two Books, to two different audiences (B01-P027, B02-P008). Rendered identically, accounting metaphor included. |
| "hecatomb" → *see the Book 1 table* | | |

### Glosses

The package's standing rule is the shortest useful explanation, folded into
the sentence, at first use only. Book 1 needed none. **Book 2 has one:**

| Term | Gloss | Why |
|---|---|---|
| "the Erinyes" (B02-P008) | **"the Erinyes—the spirits of vengeance—to avenge her"** | Three words, at first use, on the Book 10 pilot's "cubit → roughly eighteen inches" model. The familiar English alternative is *the Furies*, which is the **Roman** name and is therefore unavailable to an edition that has just decided against Roman names — so the choice is Butler's Greek word plus a gloss, or Butler's Greek word bare. |

## Recurring words the edition holds steady

Fixed at Book 1 step 6 from round-1 findings; each exists because one word of
Butler's had been rendered two ways in one Book, or two of his words
collapsed into one.

| Butler | Modern edition | Why it is fixed |
|---|---|---|
| "ills" (of what a bard sings, and of what a god lays on men) | **"sufferings"** | Butler's *ills* was rendered "hardships" at B01-P023 and "misfortunes" at B01-P025 — two paragraphs apart and **about the same song**. Phemius sings the ills; Penelope asks him to stop; Telemachus defends him by saying singers do not make the ills. One word in both places (finding 23.1). |
| "oxen" | **"oxen"**, never "cattle" | The suitors' consumption of Odysseus's *oxen* is a thread that runs to the end of the poem (finding 7.1). |
| "chief" (of rank in Ithaca) vs. "master" (of a household) | **kept apart** | Butler uses *chief* four times in the Antinous exchange (B01-P028–P029) and *master* in Eurymachus's mouth at B01-P030; the two are a public title and a domestic one, and the exchange turns on Telemachus throwing *chief* back (finding 29.1). |
| "dismay" vs. "grief" | **kept apart** | What Telemachus inherits is *dismay* — bewilderment at a disappearance with no body and no rite — and the *grief* named twenty words later is what the trouble does **not** end with (finding 17.1). |

## Voice and form

- Third-person narration and direct speech are kept as Butler has them;
  speeches remain speeches (quoted dialogue), never converted to indirect
  or reported speech.
- Where Butler's sentence runs long through chained clauses joined by
  semicolons, the candidate may break it into two or more modern sentences,
  provided every clause's content, logical connection (cause, contrast,
  sequence), and any hedge or qualification survives — see each Book's
  `continuity.md` for specific instances.
- **Every image, qualification and meaningful repetition survives.** Book 1's
  round-1 review found a recurring class of small losses at the level of the
  single word — concrete nouns softened to general ones (*damask*,
  *mountain*, *outer court*, *an eye of*), qualifiers dropped
  (*unrighteously*, *divine*, *fine*), deliberate repetitions broken
  (*longer* legs / *longer* purse; four uses of *chief*), and intensifiers
  added that Butler does not have (*certainly*, *at least*, *his son*). Each
  is individually small; together they are the difference between a
  modernization and a retelling. Later Books are drafted against this.
- Concrete physical detail — objects, gestures, numbers, distances,
  materials — is kept exactly: "twenty men," "twenty oxen," "a couple of
  blazing torches," "a silver catch" are never generalized away. **A quantity
  Butler does not state is not supplied either** (the hecatomb row).
- Necessary glosses for a term a modern reader would not otherwise
  understand are kept to the shortest useful explanation, folded into the
  sentence at first use, following the Book 10 pilot's model (cubit →
  "roughly eighteen inches"). None was needed in Book 1.
