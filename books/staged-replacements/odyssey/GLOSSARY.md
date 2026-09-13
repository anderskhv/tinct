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
| 7 | Diana | **Artemis** | 0 in Book 1 | Recorded for later Books. First occurrence B04-P011. |
| 8 | Euryclea | **Eurycleia** | 1 | Not a Roman→Greek row at all: **D8**, the Cast's display name wins. Second firing B04-P066. |
| 9 | **Venus** | **Aphrodite** | 0 in Book 1 | *Added 2026-09-12 at Book 4 step 2, the first Book to meet her (B04-P001, B04-P021).* |
| 10 | **Juno** | **Hera** | 0 in Book 1 | *Added 2026-09-12 at Book 4 step 2 (B04-P043).* |
| 11 | **Vulcan** | **Hephaestus** | 0 in Book 1 | *Added 2026-09-12 at Book 4 step 2 (B04-P051).* |
| 12 | **Ceres** | **Demeter** | 0 in Book 1 | *Added 2026-09-12 at Book 5 step 2, the first Book to meet her (B05-P010).* The first row added under the **corrected warrant**: it rests on D5's rule, not on a count. The product's corroboration is thin, exactly as R3 predicted for a figure outside the Cast — Cast `Ceres` 0 / `Demeter` 0, onboarding 0 / 0, served `modern-en` **Demeter 1 / Ceres 0**. |
| **13** | **Mars** | **Ares** | 0 in Book 1 | *Added 2026-09-13 at Book 8 step 2, the first Book to meet him (B08-P019 to B08-P030, thirteen occurrences — the lay of Ares and Aphrodite).* Added on **D5's rule alone**, which is what the corrected warrant below says to do: the Cast is silent (`Ares` 0 / `Mars` 0) and so is the onboarding. Ares is an Olympian with a Roman name, which is the class D5 names. **The hazard here is `Arete`**, the Phaeacian queen, named six times in this Book and eleven in Book 7: a stem-based or case-insensitive `Ares` rule destroys her. The mapping is word-bounded and case-sensitive (D6) and the build asserts her count before and after. |

**The table is extended by enumeration when a Book meets a Roman name it does
not yet carry, and never generated** (hazard 1).

**One name is OUTSIDE the table and is flagged rather than added: `Hercules`
(B08-P016).** Book 8's draft writes **`Heracles`** — but D5 as written covers
*"the Olympians who have Roman ones"*, and Heracles is a hero, not an Olympian,
so the letter of the rule does not reach him and the Cast has no display name
for him (**D8** is silent). The draft applies the rule's evident purpose and
**puts the question to the reviewer** (`book08/review-instructions.md` question
1) instead of adding a row on its own authority. If the ruling is that D5
should read *any figure Butler names in a Roman form*, this becomes row 14 and
Books 11 and 12 will meet more of them. Each addition is recorded here
with the Book and paragraph that forced it, so the table's growth is legible
and no row ever arrives from a general deity list.

**The warrant for rows 9–11, corrected 2026-09-12** (records finding **R3** of
Book 4's round 1; the rows themselves were **upheld**, and every hazard
assertion with them). They were first recorded as resting on "D5's own evidence
method: the served `modern-en` being replaced prints Aphrodite 14 / Venus 0,
Hera 6 / Juno 0, Hephaestus 20 / Vulcan 0." Those six counts are true and they
are **the wrong evidence**:

- **D5's evidence was never the served `modern-en`** — it is the **Cast**
  (`odyssey-threads.json`: Odysseus 319, Athena 21, Zeus 24, Poseidon 19,
  Hermes 12) and the **Book Onboarding** (Odysseus 21), the two surfaces the
  reader meets *beside* and *before* the text. The served `modern-en` is the
  file this package exists to replace.
- **On D5's actual evidence, two of the three rows have no support at all.**
  The Cast names **Hephaestus once** and is silent on Aphrodite and Hera
  (Aphrodite 0, Venus 0, Hera 0, Juno 0). The onboarding is silent on all
  three — and still prints **`Ulysses` twice** beside its 21 `Odysseus`, so
  D5's "two names for one man on the same screen" argument does not reach
  Venus or Juno.
- **The file cited is not itself consistent**: the same served `modern-en`
  prints **`Diana` 1, `Saturn` 1 and `Ops` 2**. (Its two `Ops` are useful from
  a third direction: the replaced file also left Ops a man, which corroborates
  hazard 1's disposition.)

**The warrant, as it should be read by the next Book's drafter:** *D5's rule
reaches these three directly.* D5 says in terms that the modern edition uses
the Greek forms for **the Olympians who have Roman ones**, and Aphrodite, Hera
and Hephaestus are inside that class by any reading. The served `modern-en`'s
counts are **corroboration**, and the Cast corroborates **Hephaestus alone**.
A drafter meeting `Mars` or `Ceres` applies D5 and does **not** go looking for
permission in the file being replaced.

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
   genealogy. **The table above is closed: it holds exactly the rows
   listed and no others, and it grows only by an enumerated addition recorded
   against the Book that forced it** (Book 4 added Venus, Juno and Vulcan;
   it did not add `Ops`, and no Book ever will). Assert `Ops` survives and
   `Rhea` never appears.
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

**Flagged, not corrected, on the same rule** (the Cast has no display name, so
**D8** is silent and supplies no authority): `Ilius` beside Butler's own
*Troy*; `Mycene` the woman; `Diomed` (B03-P015, B04-P022); and **`Idothea`**
(B04-P029), Proteus's daughter — the served `modern-en` prints *Eidothea*, the
Cast prints neither, and Butler's spelling therefore stands.

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
**fifteen brackets, in three classes.** Butler's own footnotes 18, 36, 49, 81,
82, 91, 101, 107 and 122 supply the classification; they are quoted, not
inferred.

**The body holds fifteen opening brackets and eleven closing ones**, and the
served `original-en` reproduces the same imbalance exactly (records finding
**R4**, verified independently 2026-09-12). **All nine class-A and class-B
brackets close within their line; four of the six class-C brackets never close
at all** — PG 1552, 4260, 5691 and 6016. That asymmetry is itself evidence
about what the marks are: A and B are text, C is apparatus, handled loosely.

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
| 5410 | XII | `[A large fig tree in full leaf grows upon it]` — **borderline, and no longer blocking**: a whole clause, with footnote 101 attaching inside it. Classed **C** at Book 3's round 1 (fn 101 is the same authorship-history claim as fns 36, 82, 91 and 107), which changes no word, because A, B and C now share one disposition. |

### Class C — a passage set off by a bracket whose note argues about when and by whom it was composed

**SETTLED 2026-09-12 at Book 3's round 1 (ruling 2,
`book03/review/findings-v1.md` section D). Disposition: the mark is dropped,
every word stands, nothing is recast across the bracket's boundaries, and
every instance is recorded** — the same disposition as classes A and B, but on
a *third* warrant, and with obligations the other two classes do not carry.
**Book 4 is unblocked.**

*(This section previously read "a passage Butler brackets to mark editorial
doubt that it belongs to the poem — Disposition: OPEN". That description does
not survive reading Butler's notes; four of its factual statements were wrong
and are corrected below, records finding **R3**.)*

**Test:** a bracket sets off a passage, and the note attached to it — where
there is one — makes a claim about the poem's **composition history**: an
afterthought, an interpolation, a later addition, or another editor's
puzzlement. It is not about Butler's English (class A) and not an explanation
inside the sentence (class B).

#### Why the mark goes, in four steps

1. **A bracket in this text is not a verdict of spuriousness, by Butler's own
   statement.** Footnote 81: *"lines enclosed in brackets are almost always
   genuine; all that brackets mean is that the bracketed passage puzzled some
   early editor, who nevertheless found it too well established in the text to
   venture on omitting it."* There is no editorial doubt about whether the
   words belong that a mark could preserve.
2. **What his own class-C notes claim is authorship history, not doubt.**
   fn 36: *"evidently an afterthought—added probably by the writer herself."*
   fn 82: *"I am inclined to think it is interpolated (probably by the poetess
   herself)."* fn 91: *"added by the author when she enlarged her original
   scheme."* fn 107: *"an afterthought **but to have been written by the same
   hand as the rest of the poem**."* Every one is Butler arguing his
   *Authoress of the Odyssey* thesis — a claim about **when** the words were
   written, by the translator, to his reader. fn 122 is not even his bracket:
   *"some one has enclosed in brackets the two lines in which the second cave
   is mentioned, I presume because he found himself puzzled"* — and Butler
   argues they are mistaken.
3. **The mark cannot carry the meaning in this edition anyway.** There is no
   apparatus and no footnote layer. Butler's argument lives in notes we will
   never print, so a bare bracket transmits "something is set off here" and
   nothing more. The choice was never between preserving his doubt and losing
   it; it is between an uninterpretable mark and clean text with the decision
   recorded. His bracket also stays visible in the `original-en` column beside
   the modern one — the same answer the package gave for `Ilius` and for
   `Mycene` the woman.
4. **Four of the six brackets are never closed, so "keep the mark verbatim" is
   not an honest option** (records finding **R4**). PG's translation body
   (lines 375–10842) holds **fifteen opening brackets and eleven closing
   ones**, and the served `original-en` reproduces the same imbalance exactly,
   15 and 11 — **verified independently 2026-09-12**. All nine class-A and
   class-B brackets close within their line. The four that do not are all
   class C: **PG 1552, 4260, 5691, 6016**. Keeping the mark there means either
   printing an opening bracket that never closes — which the reader would meet
   on the **first paragraph of Book 4**, indistinguishable from a typo — or
   supplying the close yourself, which is the drafter deciding the passage's
   extent. That the transcription closes every A and B bracket and drops four
   of six C closes is itself evidence about what these marks are: apparatus,
   handled loosely, not text.

#### The obligations that keep class C a class

1. **Record every instance** in the Book's `continuity.md` by PG line, with
   Butler's note quoted in full where he has one, and with **who bracketed
   it** where the note says (PG 6016 is not his).
2. **Restraint inside the passage.** A class-C passage is never abridged,
   summarized, merged with a neighbouring sentence, reordered or tidied, and
   no sentence is recast across the point where the bracket opened or closed.
   The risk is concrete: **PG 4260 and PG 4884 are the same prophecy printed
   twice**, which is Butler's whole point in fn 91, and a drafter who notices
   the repetition will be tempted to compress one. Both stand, in full.
3. **Where the bracket is unclosed, record that and do not determine the
   extent.** Nothing in the rendering depends on knowing where it ends,
   because the disposition is identical on both sides of the boundary — which
   is precisely why this ruling is safe despite the four missing closes, and
   why the alternative is not.
4. **Class assignment now changes no word**, so a B-versus-C borderline costs
   a line in the record, not a corruption of the text. PG 5410's `[A large fig
   tree in full leaf grows upon it]` therefore **stops blocking Book 12**:
   record it as C, with fn 101 (*"I suppose this line to have been
   intercalated by the author"* — the same authorship-history claim as fns 36,
   82, 91 and 107), render it under this rule, and move on.
5. **If the product ever gains a note layer, class C becomes a note** —
   *"Butler marks these lines as probably added later by the poem's own
   author"* — and that is the doubt's right home. An app-side item, beside
   `PUNCTUATION.md` §2's; not acted on here.

#### The six instances, corrected

| PG line | Book | closed? | what is bracketed | Butler's note **about the bracket** |
|---|---|---|---|---|
| **1552** | **IV** | **never closed** | Menelaus's double wedding feast, a long passage, opening `[and found him in his own house, feasting with his many clansmen…` | **fn 36** — *"The lines which I have enclosed in brackets are evidently an afterthought—added probably by the writer herself—for they evince the same instinctively greater interest in anything that may concern a woman, which is so noticeable throughout the poem."* |
| 2067 | IV | closed at 2070 | `[and guests kept coming to the king's house…courts]` | **fn 49** — *"the writer has been unable to keep the women out of an interpolation consisting only of four lines."* |
| 4260 | IX | **never closed** | the end of Polyphemus's curse, `[let him reach his home in another man's ship and find trouble in his house.'` | **fn 82** — *"I am inclined to think it is interpolated (probably by the poetess herself)… See 'The Authoress of the Odyssey' pp. 254-255."* |
| 4884 | XI | closed at 4902 | Teiresias's prophecy of the homecoming — **the same prophecy as PG 4260** | **fn 91** — *"added by the author when she enlarged her original scheme by the addition of books i.-iv. and xiii. (from line 187)-xxiv."* |
| 5691 | XII | **never closed** | `[The gale from the West had now spent its force…` | **fn 107** — *"an afterthought but to have been written by the same hand as the rest of the poem."* |
| 6016 | XIII | **never closed** | `[near it is the cave sacred to the Naiads;…` | **fn 122 — the brackets are NOT Butler's**: *"some one has enclosed in brackets the two lines in which the second cave is mentioned, I presume because he found himself puzzled…"* and he argues against them. |

**Four corrections to the previous text of this section and of ledger D12**
(records finding **R3**), each verified against PG #1727 directly:

1. The class is **not** "recorded doubt that the passage belongs". fn 81 says
   bracketed lines are "almost always genuine"; fns 36, 82, 91 and 107 claim
   the opposite of spuriousness — same author, later stage.
2. **Five of the six are footnoted about the bracket**, not three: fn 49 and
   fn 82 are both about their own brackets. **Both of Book 4's instances were
   confirmed by direct reading at Book 4's round 1** (PG 1552 / fn 36, and
   PG 2067–2070 / fn 49), so the count now stands at five of six with two
   confirmed and is not to be re-derived a third time.
3. **PG 6016's brackets are not Butler's** (fn 122).
4. The first class-C bracket opens at **PG 1552**, not PG 1551.

#### What Book 4's drafter does

Book 4 ¶1 carries the poem's first class-C bracket, in its first sentence:
drop the opening mark, render `and found him in his own house, feasting with
his many clansmen…` as ordinary text, **do not recast the sentence across the
point where the bracket opened**, and record the instance in
`book04/continuity.md` with fn 36 quoted and with the note that the bracket is
never closed in the base text. Book 4 ¶52 carries the second (PG 2067, closed
at 2070, fn 49), recorded the same way.

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
- **`toward`, never `towards`** (first met B03-P018 and B03-P024). *Added
  2026-09-12 at Book 3's round 1, finding 18.2.* `towards` is the
  British-preferred form, and the evidence base this glossary used for `gray`
  says so more strongly here: the served `modern-en` is **toward 40,
  towards 1**; Butler is **towards 55, toward 2**. Books 1 and 2 contain
  neither form, so Book 3 sets the precedent for the remaining twenty-one
  Books and for all fifty-five of Butler's.
- **`scepter`, never `sceptre`** (first met B03-P032). *Added 2026-09-12 at
  Book 3's round 1, finding 32.1, which **withdrew** an exemption.* Book 3's
  v1 exempted `sceptre` on the `draughts` reasoning — "the object's ordinary
  English name, not a spelling variant". That reasoning does not transfer:
  *draughts* is a different **word** from *checkers*, whereas
  *sceptre*/*scepter* is a US-UK spelling pair exactly like *centre*/*center*.
  The served `modern-en` has **scepter 3, sceptre 0**, which is the test that
  settled `gray`.
- **Dead forms the archaism guard must name explicitly** (records finding
  **R5**, Book 3 round 1): `twelvemonth`/`twelve-month`, `towards`, and the
  article-less phrase `in course of time`. All three stood through a draft
  because the guard did not list them; a regression guard catches only what it
  is told to catch, and this is the maintenance that costs one line.
  Implemented in `scripts/build_book3_v2.py` and inherited by every later
  Book's build.
- **`sweetmeats` is kept** (B03-P037, finding 37.2) with its reason recorded:
  the plain modern word here would be *delicacies*, and `delicacies fit for
  princes` is verbatim the served `modern-en` splice sitting inside the served
  *original* at B03-P038 — the one wording the package must not use. Butler
  prints `sweet meats` open; the candidate's closed-up form is the dictionary
  form of the word, a typographic normalization and not a substitution.
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

## Recurring epithets and formulas first met in Book 3

Fixed before B03-P001 was drafted, per `WORKFLOW.md` step 2.

| Butler (source) | Modern edition | Notes |
|---|---|---|
| B03-P002: "Beg of him to speak the truth, and he will tell no lies, for he is an excellent person."<br>B03-P025: "Beg of him to speak the truth, and he will tell **you** no lies, for he is an excellent person." | B03-P002: **"Ask him to speak the truth, and he will tell no lies, for he is an excellent man."**<br>B03-P025: **"Ask him to speak the truth, and he will tell you no lies, for he is an excellent man."** | Butler says it **twice in Book 3** — Athena of Nestor at B03-P002, Nestor of Menelaus at B03-P025 — and the repetition is the point: the same warranty is handed down the chain of hosts Telemachus is being passed along. **The two are NOT word for word: B03-P025 has `you` and B03-P002 does not**, and the edition prints each as he wrote it. *(Corrected 2026-09-12 at Book 3's round 1, finding 2.2 and records finding **R1**. This row previously said "word for word" and the v1 draft printed the P025 form in both places — the one place the package's consistency discipline was applied to a sameness Butler had not written. Settled under the package's own precedent four paragraphs later at B03-P016, where Butler's one-word difference from B01-P019 is kept because he wrote it.)* Every other word of the two sentences is identical. "excellent man" rather than "excellent person" matches accepted **B02-P003**, where the reviewer considered the same narrowing and let it go. |
| "Nestor, knight of Gerene" | **"Nestor, the horseman of Gerene"** | Butler's standing epithet for Nestor (Γερήνιος ἱππότα Νέστωρ), once in Book 3 (B03-P008) and often later. **"knight" is the one word here that cannot stand**: in current English it is unambiguously medieval, and Butler's sense is the plain one — a man of the chariot and the horse, which is also why his sons are the ones who yoke and drive. Both elements kept: the place, and the horsemanship. Use this exact form every time it recurs. |
| "honour to the Achaean name" (addressing Nestor) | **"honor to the Achaean name"** | Telemachus's fixed form of address, twice in Book 3 (B03-P011, B03-P017), both times after "Nestor, son of Neleus". American spelling per the standard; **`to`, not `of`** — Butler's idiom is the ordinary English *a credit to*, and a genitive does not mean that. *(Corrected 2026-09-12 at Book 3's round 1, findings 11.1 and 17.1; v1 printed `honor of` in both places.)* A fixed form of address that will recur, so it changes in both places or in neither. |
| "peer of gods in counsel" | **"the equal of the gods in counsel"** | Butler uses it of Patroclus (B03-P012) and of Neleus (B03-P032) in one Book. Rendered identically; it is a formula, not a description of either man in particular. |
| "Neptune lord of the Earthquake" | **"Poseidon, lord of the Earthquake"** | Butler's epithet at B03-P001. Kept whole — the earthquake is Poseidon's, not a decoration, and Book 3 opens on a sacrifice to him. |
| "Minerva, daughter of Aegis-bearing Jove" / "Jove's daughter Minerva" | **"Athena, daughter of aegis-bearing Zeus"** / **"Zeus's daughter Athena"** | B03-P031 and B03-P013. *Aegis* is kept, not glossed: it is named again in later Books and a gloss at every occurrence would be noise; here it is plainly an attribute of Zeus and nothing in Book 3 turns on knowing it is a goatskin. Lower-cased "aegis-bearing" as an ordinary compound adjective. |
| "the Trito-born" (of Athena) | **"the Trito-born"** — kept, unglossed | B03-P030. Butler's rendering of Τριτογένεια, an epithet whose sense is disputed among scholars; a gloss would either invent a certainty or run to a paragraph. Nothing in the Book turns on it, and the sentence it stands in has already identified her as **"Zeus's formidable daughter"**, which is the information the reader needs. Flagged in `book03/continuity.md` rather than solved. |
| "nothing loth" | **"willingly enough"** | B03-P037, **twice in one paragraph**, of the horses. Butler's repetition is kept as a repetition. *Loth/loath* is dead in this construction. |
| "the inward meats" / "the outer meats" | **"the inner meats"** / **"the outer meats"** | Butler's pair for the two courses of a Greek sacrifice — the entrails, tasted first, and the rest of the animal, roasted on spits afterwards. Three uses of the first (B03-P001, P005, P035) and two of the second (B03-P008, P036). **Kept as a pair and not glossed**, because the text teaches it: the reader watches the thigh bones burn, the inner meats tasted, then the rest cut up, spitted and roasted, and sees the order for himself. Butler's *inward* modernized to *inner*; nothing else moves. |
| "hecatomb" / "hecatombs" | *see the Book 1 table (**D3**)* | B03-P007 "the goodly hecatomb they are offering you" → **"the fine sacrifice they are offering you"**; B03-P014 "till we had offered hecatombs" → **"until we had made great sacrifices"**. Plain description, and **no number supplied**. |
| "a barrow heaped up for him" | **"a mound"** | B03-P022, inheriting the Book 1 / Book 2 row. |
| "tell me, and tell me true" | *see the Book 1 table* | B03-P021 "Tell me, therefore, Nestor, and tell me true" → **"So tell me truly, Nestor"**. |
| the dawn formula | *see the Book 2 table* | B03-P032 and B03-P037, both rendered **"When Dawn, the rosy-fingered child of morning, appeared"**. |

### Names first met in Book 3

Already Greek in Butler and left exactly as he spells them: Pylos, Neleus,
Nestor, Pisistratus, Thrasymedes, Echephron, Stratius, Perseus, Aretus,
Polycaste, Eurydice, Clymenus, Laerceus, Diocles, Ortilochus, Alpheus,
Pherae, Geraestus, Tenedos, Lesbos, Chios, Psyra, Mimas, Euboea, Sunium,
Malean, Crete, Cydonians, Iardanus, Gortyn, Phaestus, Egypt, Amphitrite,
Priam, Ajax, Achilles, Patroclus, Antilochus, Neoptolemus, Myrmidons, Poias,
Philoctetes, Idomeneus, Aegisthus, Clytemnestra, Orestes, Tydeus, Atreus,
Lacedaemon, Cauconians, Hades, Apollo, Gerene, Phrontis, Trito.

`Apollo` is **not** a mapping row: it is the god's Greek name as well as his
Roman one, and the closed table has seven rows and no others. `Hades`,
`Amphitrite` and `Hyperion` are likewise already Greek.

**One flagged, on the `Ilius` precedent:** **`Diomed`** (B03-P015), Butler's
form for Diomedes. The Cast has no entry for him, so **D8** is silent and
supplies no authority; Butler's spelling stands and is recorded rather than
corrected. This is the third flagged spelling in the package, and all three
are decided the same way — the Cast's display name wins where the Cast has
one, and nowhere else.

**One mapped under D13:** **`Mycene`** at B03-P024 is the **city** — *"For
seven years after he had killed Agamemnon he ruled in Mycene"* — and becomes
**`Mycenae`**. It is the first application of D13, and the woman of B02-P007
is untouched by it.

### Glosses

The package's standing rule is the shortest useful explanation, folded into
the sentence, at first use only. Book 1 needed none. **Book 2 has one:**

| Term | Gloss | Why |
|---|---|---|
| "the Erinyes" (B02-P008) | **"the Erinyes—the spirits of vengeance—to avenge her"** | Three words, at first use, on the Book 10 pilot's "cubit → roughly eighteen inches" model. The familiar English alternative is *the Furies*, which is the **Roman** name and is therefore unavailable to an edition that has just decided against Roman names — so the choice is Butler's Greek word plus a gloss, or Butler's Greek word bare. |

## Recurring epithets and formulas first met in Book 5 and Book 6

Fixed before drafting, per `WORKFLOW.md` step 2.

| Butler (source) | Modern edition | Notes |
|---|---|---|
| "Hear me, daughter of Aegis-bearing Jove, unweariable" | **"daughter of aegis-bearing Zeus, unwearying"** | Athena's prayer-formula. Accepted **B04-P068** fixed it, including `unweariable` → **`unwearying`**, and **B06-P025** carries it word for word — Odysseus in the grove, praying to the goddess who will not show herself. `aegis-bearing` also at **B06-P009** (the wood nymphs), matching accepted B03-P031 and B04-P066. Lower-case, unglossed, hyphen kept, Butler's capital dropped. |
| "bethought her/him of another matter" | **"thought of another matter"** | Accepted Book 4, twice; **B06-P020**, of Nausicaa. |
| "do as I bid you" | **"as I tell you"** | Accepted **B05-P026** (Ino to Odysseus); **B06-P021** and **B06-P023** (Nausicaa to Odysseus, twice in one speech). |
| "deemed it best" | **"thought it best"** | Accepted **B05-P037** (*"In the end he thought it best to take to the woods"*); **B06-P012** (*"In the end he thought it best to entreat her from a distance"*) — Butler's own formula, in the same position in consecutive Books. |
| "thus in two minds" | **"still undecided"** | Accepted **B04-P011**, **B05-P028**, **B05-P032**. **It is reserved for that phrase.** Butler's *other* deliberation verb, `doubted whether` (**B06-P012**), takes *"did not know what to do"*, because rendering both with one phrase would flatten two of his into one — the mirror defect, and the one finding 9.1 convicted. |
| "girdle" / "girdles" | **"belt" / "belts"** | Accepted **B05-P020** (Calypso's golden belt); **B06-P003** (the laundry). |
| "creature" | **"creature"** | Accepted **B05-P010**, Calypso of Odysseus. **Reserved**, which is why Butler's `scion` at **B06-P013** becomes *"so fair a young woman as yourself"* and not *"so fair a creature"*. |
| "skilled" vs. "skilful" | **"skilled"** vs. **"skillful"** | Two Butler words, kept apart: *a skilled shipwright* (accepted **B05-P020**) and *a skillful workman* (**B06-P018**, the American spelling of his own word under D9). |
| "herbage" | **"greenery"** (B05) / **"grass"** (B06) | *Recorded as an open question, not as a settled row.* Accepted **B05-P006** has *"the beds of violets and lush greenery"* (garden planting) and **B06-P009** has *"the sweet juicy grass"* (pasture for the mules). One Butler word, two renderings across Books — a discrimination by referent, or the package's characteristic defect? **Put to Book 6's reviewer as question 2.** |
| "discomfits" | **"thwarts"** | **B06-P014**. *Dismays* is unavailable: the Book 1 row keeps `dismay` and `grief` apart. |
| "topes" | **"drinks"** | **B06-P023**, of Alcinous on his throne. |
| "hie" | **"made her way"** | **B06-P001**. `in furtherance of` → *"to help bring … home"*. |

### Names first met in Book 6

Already Greek in Butler and left exactly as he spells them: Nausicaa,
Alcinous, Nausithous, Dymas, Phaeacians/Phaeacian, Hypereia, Scheria,
Taygetus, Erymanthus, Delos, Ogygian, Leto.

**Book 6 adds NO row to the mapping table**, and that is asserted rather than
passed over: every Roman name it carries — Ulysses, Minerva, Jove, Neptune,
Diana, Vulcan — is already in it.

**`Leto` is hazard 1's mirror image, and it is worth naming.** Butler writes
the **Greek** *Leto* at B06-P009, not the Roman *Latona*. The closed table has
nothing to say about her, so she is untouched; a general deity list run in
*either* direction would have had something to say, and would have been wrong.
`Latona` is asserted absent from the source as well as the candidate, so the
claim is a result.

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

---

## Recurring words the edition holds steady — added at Book 4

| Butler | Modern edition | Why it is fixed |
|---|---|---|
| `whereon` (×5) and the **sentential** `on which` (×1) | **`at that`** | One connective rendered four ways in one Book — `at which` (B04-P003, P064), `and` (P036, P043, P048) and `on which` left standing (P038) — with `and` at P043 dropping the consequence Butler's connective carries. Finding **64.2**. Applied at B04-P003, P036, P038, P043, P048, P064, and asserted one per Butler instance. |
| `On this` (×4), Butler's *other* sentential connective | **`At this`** | The accepted Book 3 row, unchanged. Two Butler forms, two renderings: the package does not flatten a difference Butler wrote, and does not invent one he did not. B04-P008, P019, P024, P046. |
| the relative `on which` with a **nominal** antecedent | **untouched** | `the part on which Ajax was sitting` (B04-P042) is ordinary modern English and is not the connective. Asserted by name so the connective rule cannot swallow it. |

### `tell me, and tell me true` — a flattening the package accepts, on purpose (R6)

Butler writes **two** phrases and the edition renders both `tell me truly`:
the doubled `tell me, and tell me true`, and the plain `tell me truly`.

| | Butler | accepted / candidate |
|---|---|---|
| B01-P013 | "tell me and tell me true, who you are" | **"tell me truly who you are"** |
| B01-P014 | "But tell me, and tell me true, can Ulysses really have…" | **"But tell me truly—can Odysseus really have…"** |
| B01-P016 | "But tell me, and tell me true, what is the meaning of…" | **"But tell me truly, what is all this feasting about"** |
| B03-P021 | "Tell me, therefore, Nestor, and tell me true; how did…" | **"So tell me truly, Nestor: how did…"** |
| B04-P041 | "but now tell me, and tell me true, whether all the Achaeans…" | **"but now tell me truly, whether all the Achaeans…"** |
| B03-P011, B04-P027, B04-P055 | "tell me truly" (plain) | **"tell me truly"** |

**It is a package row, not a Book 3 precedent** — accepted Book 1 settled it
three times before Book 3 met it. **And it is a flattening, recorded as one:**
the doubling is a formulaic intensifier of oral epic, not a distinction of
sense, and English has no natural doubling to carry it that is not worse than
the loss. Written down here because "a Butler difference flattened into
sameness" is otherwise a finding at every future round. Records finding **R6**
of Book 4's round 1.

### Compound spelling

See `PUNCTUATION.md` §4 (**D15**). Compound spelling follows the modern
standard form, in whichever direction that moves Butler's setting; the test for
whether the change is typographic at all is *does it alter what a reader says
aloud?* Recorded at Book 4's records finding **R4**, after one Book moved
compounds in three directions at once.

## The retention measure — what it means, exactly (R1, R2)

The package's retention figure is **Butler token retention in the
aggregate-join form**: paragraphs joined with a space, lower-cased,
letters-only tokens, Roman names mapped to their Greek forms on both sides,
then `difflib.SequenceMatcher` matching-block total divided by the number of
source tokens. The canonical implementation is `token_retention()` in
`scripts/build_book02_v2.py`, reproduced unchanged in
`scripts/build_book04_v2.py`.

**Use that form and no other.** A per-paragraph variant of the same measure
differs by about 0.006 on Book 1, and dropping the name map moves it by about
0.010 in the other direction. Someone will implement the wrong one.

**Corrections of record, both from Book 4's round 1:**

- **R1.** Book 4 v1's retention was printed as **0.960** in four places and
  **0.961** in two headings. Computed exactly it is **0.95958**. Corrected
  everywhere in the package on 2026-09-12; the figure is now carried to five
  decimal places wherever it is quoted, because it was rounded twice, two ways.
- **R2.** Book 1's quoted baseline of **0.721 is not reproducible.** The
  canonical function gives **0.72703** for accepted `book01/candidate-v2.json`
  and **0.72751** for the successor `candidate-v3.json`. The figure 0.721 came
  from the Book 2 reviewer's own implementation and was quoted onward into
  `RESUME.md`, three `provenance.json` files, two `continuity.md` files, two
  `ACCEPTANCE.md` files and two `review-instructions.md`. Corrected everywhere
  on 2026-09-12. **No ranking changes**: Book 1 is still by far the lowest
  (0.727/0.728 against 0.902, 0.897 **on Book 3's 37-of-38 basis** and 0.959), and every argument the package
  has built on the ordering survives unchanged. The two round-1 findings sheets
  that carry 0.721 (`book02/review/`) are **not** rewritten — they are dated
  records of another session, and this row supersedes them.

## The splitting rate — the second number, added at Book 4 (D17)

Retention alone cannot tell a modernization from a touch-up, and Book 4 v1
proved it: it satisfied every mechanical check in the package **perfectly**
while breaking one of its source's seventeen sixty-word sentences and adding
0.4% to its sentence count. Nothing in the checks counted a sentence.

Every Book from Book 4 onward reports, beside its retention:

- **sentences, source → candidate, as a percentage added** (the accepted
  Books: **+20.5%** on 32 paragraphs, **+16.1%** on 35, **+5.5%** on **37 of Book 3's 38**, the D14 splice excluded — R-1);
- **sentences of sixty words or more, source → candidate, and the percentage
  broken** (the accepted Books: **100%**, **43%**, **33%**).

`scripts/build_book04_v2.py` implements both in four lines around one splitter
(taken verbatim from the round-1 reviewer's `retention_measure.py`, so the
numbers stay comparable) and **fails the build** if the rate falls below half
the weakest accepted Book's, or if more than three quarters of the source's
sixty-word sentences survive.

**Two limits, stated rather than left to be rediscovered.**

1. The gate is a **floor to clear, not a target**. Book 4's flow read reverted
   a division that the gate would happily have counted, because dividing both
   semicolons of one sentence left two consecutive sentences opening `But`.
2. The measure convicts on **sentence division only**. The reviewer's own audit
   found that chain load predicts splitting in accepted work (ρ = +0.380,
   n = 98) and does **not** predict clause order (ρ = +0.048), so order
   retention was refused as grounds for a finding. A draft that divides Butler's
   sentences and leaves every clause in his order passes the gate. Only a
   continuous read sees that.
