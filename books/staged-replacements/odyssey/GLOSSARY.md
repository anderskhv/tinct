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

Do not silently correct a Butler spelling that looks unusual (his own
inconsistencies between Books, if any turn up) — flag it in the Book's
`continuity.md` instead, per the Book 10 pilot's precedent for
"Laestrygones" vs. "Laestrygonians." The one exception is the Cast-display-name
rule above.

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
