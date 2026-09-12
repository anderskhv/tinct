# Acceptance — the Odyssey, Book 1

**Accepted file:** `candidate-v2.json`, sha256
`f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45`
(32 paragraphs, B01-P001–B01-P032, one per source paragraph, aligned 1:1 with
`source-book1.json`; word ratio **0.9462** to Butler, up from v1's 0.9425;
minimum paragraph ratio **0.8621** at B01-P017, which the round-1 reviewer
diffed clause by clause and ruled complete; maximum **1.0337** at B01-P003,
which is finding 3.1's rewritten hecatomb fold). Readable copy
`candidate-v2-readable.md`, sha256
`4dd69c21267bea2fe7ef7a10d099a021b56b00ea747ae535cfc76b82a8d96600`.

**Date:** 2026-09-12. **By:** the content agent for this thread, after the
steps below; the coordinator's reviewer session did not draft the candidate
and the drafter did not review it.

**Source of record:** `source-book1.json` sha256
`fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4`,
byte-identical to chapter 1 of
`app/public/data/editions/odyssey-original-en.json` sha256
`da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`, which is
Samuel Butler's 1900 public-domain prose translation, PG #1727
(`../source-texts/pg1727-butler-1900.txt` sha256
`ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`). All four
hashes re-verified at acceptance. **Frozen v1:**
`8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9`, never
edited; the v2 build asserts it before reading it.

## Review rounds applied

**Round 1** — `review/findings-v1.md`, independent reviewer session spawned
by the coordinator, on `candidate-v1.json`. Verdict: **Accept after
corrections**. Coverage complete: all eleven packets read in order with their
`CONTEXT ONLY` neighbours, every ID `B01-P001`…`B01-P032` answered exactly
once, then `candidate-v1-readable.md` read straight through.

| Severity | Count | Disposition |
|---|---|---|
| standing (book-wide, coordinator decision) | 1 | applied |
| substantive | 3 | all applied |
| minor | 33 (29 paragraph-level + 4 records) | all applied |
| optional | 5 | **all applied** |
| paragraphs with no material issue | 5 | — |

**No second round was requested.** Every finding was applied and none was
declined, so there is no disputed disposition for a second reader to rule on;
each correction is confined to the clause the finding quotes; and the name
mapping was applied mechanically from a closed table with every hazard
asserted, not by judgement paragraph by paragraph.

The reviewer's own summary of what it did *not* find is part of the record:
paragraph alignment exact, no paragraph dropped or merged, every proper name
occurring the same number of times in candidate and source, direct speech
kept as direct speech in all thirteen speeches, Butler's unclosed-quotation
carry-over reproduced exactly, all three glossary formulas applied every time
they occur, **zero of Butler's eleven dead words or forms surviving**, and no
invented content, no explanatory gloss, and nothing traceable to another
translation anywhere in the 32 paragraphs.

## Step 6 — corrections applied and verified

**All 41 findings applied. Nothing declined.** 37 text corrections in 27
paragraphs, 47 name substitutions in 20 paragraphs plus the chapter title,
22 apostrophes normalized. 29 of the 32 paragraphs differ from v1;
B01-P011, B01-P020 and B01-P022 are byte-identical.
`changes-v1-to-v2.md` lists every one by paragraph ID against the finding it
answers. Applied by `../scripts/build_book01_v2.py`, which asserts v1's
frozen hash before reading it, that each "old" string occurs exactly once in
its paragraph, that each correction landed and its v1 form is gone, and every
invariant below.

### The standing finding — S1, the name mapping

**Applied, by script, from a closed seven-row table now written into
`../GLOSSARY.md`** so Books 2–24 inherit it: Ulysses → **Odysseus** (17, of
which 3 possessive), Minerva → **Athena** (12), Jove → **Zeus** (6), Neptune →
**Poseidon** (6, of which 1 possessive), Mercury → **Hermes** (3), Saturn →
**Cronus** (2), Diana → **Artemis** (0 in Book 1). **46 Roman → Greek
substitutions across 20 of the 32 paragraphs**, plus `Euryclea` →
**`Eurycleia`** (1), plus the chapter title — which is now byte-identical to
the title the served `modern-en` already uses.

This reverses ledger decision **D1** and answers **A1**. The drafter's
reasoning for D1 was correct on its brief and is left on the record rather
than deleted; the reviewer's evidence is the product's, not the
translation's, and is one-sided: the Cast data the reader sees beside the
text names these figures Odysseus (319), Athena (21), Zeus (24), Poseidon
(19), Hermes (12), with every Roman form in it living inside a `searchNames`
alias array. A reader who meets "Odysseus" in the onboarding, taps a
highlighted "Odysseus" in the Cast and then reads "Ulysses" in the modern
edition has been handed two names for one man by the same product on the same
screen.

**Every hazard the reviewer named is handled, and asserted by the build both
before and after the pass:**

1. **`Ops` is not mapped and survives.** B01-P032's "Eurycleia, daughter of
   Ops, son of Pisenor" is Butler's Ὦψ — a man, already Greek. *Ops* is also
   the Roman name of Rhea, so any table built from a general Roman → Greek
   deity list carries `Ops → Rhea` and would put a goddess in a man's place
   in the middle of a genealogy. **The table is closed and enumerated in
   `../GLOSSARY.md`, not generated.** The build asserts `Ops` still occurs
   once, that the phrase "daughter of Ops, son of Pisenor" is intact, and
   that **`Rhea` never appears**.
2. **`Saturn` occurs only inside the fixed epithet, and the glossary row was
   rewritten with it**, not just the candidate — otherwise Book 2 would be
   drafted against a row describing an edition that no longer exists. The row
   now reads **"son of Cronus, king of kings"**, and the file's two loose
   spellings of *Cronos* are settled to **Cronus**. The build asserts the
   epithet occurs **exactly twice** and that `Cronos` occurs nowhere.
3. **The possessive is decided once and recorded: `Odysseus's`.** It matches
   the candidate's own `Telemachus's`, `Phemius's`, `Agamemnon's`; Butler's
   bare `Ulysses’` is not carried over. The build asserts **three**
   `Odysseus’s` and **no bare `Odysseus’`**. Recorded as `../GLOSSARY.md`
   hazard 3 for every later Book.
4. **Matching is case-sensitive and word-bounded**, so the island **`Same`**
   in B01-P017 survives. The build asserts "Dulichium, Same, and wooded
   Zacynthus" verbatim after the pass.
5. **`heaven` was not touched** — ten occurrences, all Butler's metonym for
   the gods collectively, none of them a stand-in for Jove. The build counts
   it before and after and asserts the count is unchanged at **10**.
6. **`Hyperion` stays and is not expanded to Helios.** The build asserts the
   phrase "sun-god Hyperion" survives and `Helios` never appears.

And, after the pass, that **no Roman form survives anywhere** in the
candidate.

### The three substantive findings

- **4.1 — `unrighteously` restored.** B01-P004, Zeus's opening speech and the
  poem's programmatic statement about human responsibility. The adverb is
  what makes Aegisthus's act a moral offence rather than a piece of
  stupidity, and it is the hinge the speech turns on: he was warned, did it
  anyway, and did it *wrongly*. "Seduce" carries impropriety; it does not
  carry wrong. v2: **"he had to go and seduce Agamemnon's wife wrongfully,
  and then kill Agamemnon"** — the reviewer's smallest form. Its fuller
  alternative was declined because it breaks Butler's own `Agamemnon …
  Agamemnon`, which names the victim twice because the offence is twice
  against the same man.
- **6.1 — the blinding restored, `his son` removed.** B01-P006. The blinding
  is the single most consequential physical act in the poem's back-story and
  the detail that makes the next eleven Books cohere; a reader who meets
  "blinding Polyphemus" has been told that Odysseus attacked him, not that he
  put out his eye. And `his son` pre-empted Butler's own next sentence, which
  gives the genealogy in full — Thoosa, Phorcys, and the reason *Poseidon
  specifically* is the enemy — a sentence the candidate keeps, and which as a
  result had begun to read as redundant. v2: **"for blinding the eye of
  Polyphemus, king of the Cyclopes."** Butler's indefinite "an eye" is
  resolved to "the eye" as a deliberate reading of a Victorian slip, and that
  resolution is recorded at B01-P006 in `continuity.md` rather than left to
  be found.
- **19.1 — the agency restored.** B01-P019. Butler's Athena tells Telemachus
  to *give his mother in marriage*, an act he performs as head of the
  household and one of the concrete duties she loads onto him beside calling
  the assembly, taking a ship and killing the suitors; `let your mother marry
  again` makes it permission he grants if she asks, which is not a duty at
  all, and removes the one piece of the counsel that requires him to act
  against his mother's wishes. v2: **"give your mother in marriage again."**

### The 33 minor findings

All applied. 29 are paragraph-level and are in `changes-v1-to-v2.md`'s table.
Several were about consistency Butler is deliberate about, and those are the
ones the edition now holds steady, with rows in `../GLOSSARY.md` so later
Books inherit them:

- **13.1 — the pun.** "longer legs rather than a **fatter** purse" broke
  Butler's joke, which *is* the repeated adjective. v2: **longer** purse.
- **29.1 — the four-fold word.** Antinous wishes Telemachus never be **chief**
  in Ithaca; he answers that he will be **chief** if he can, that it is no bad
  thing to be a **chief**, and then turns it: he will be **chief in his own
  house**. v1 rendered the fourth as *master*, dropping the retort and
  colliding with B01-P030, where Butler genuinely does write *master* in
  Eurymachus's mouth. The public title and the domestic one are now apart, as
  Butler keeps them.
- **17.1 — two words, not one.** What Telemachus inherits is *dismay*;
  the *grief* named twenty words later is what the trouble does **not** end
  with. v1 used "grief" for both and the distinction vanished.
- **23.1 — one word, not two.** Butler's *ills* had become "hardships" at
  B01-P023 and "misfortunes" at B01-P025, two paragraphs apart and **about
  the same song**. Both are now **sufferings**. *(The third "sufferings" in
  the Book, at B01-P005, is Butler's own word and untouched.)*
- **7.1 — oxen, never cattle**, the thread that runs to the end of the poem.

The four records findings change no reading text and are fixed in the record:

- **R1 — punctuation.** v1 mixed curly double quotes with ASCII apostrophes
  and recorded no decision. Settled as **typographic throughout**, in a new
  `../PUNCTUATION.md` §1, and applied as a final pass — 22 apostrophes, with
  the build asserting no ASCII apostrophe or double quote survives. Decided
  in the same pass as the possessive rule, as the reviewer asked.
- **R2 — spelling.** The American default is now recorded in
  `../GLOSSARY.md` (it matches the served editions and the rest of the
  product), and its one survivor, `woollen`, is now `woolen`. `draughts` is
  recorded as staying: it is the game's name, not a spelling variant.
- **R3 — the source crux at B01-P014.** `continuity.md` had said Book 1
  contains no defective source sentence; it contains one. Butler's
  unpunctuated `for he is not dead yet not on the mainland` is now recorded
  in "Unresolved source issues" with both available readings and the reason
  the **adversative** one is taken: the next sentence draws an inference that
  follows from *not on the mainland* and not from *not yet*, and the temporal
  reading would have Mentes assert an itinerary he disclaims knowledge of two
  sentences later.
- **R4 — a wrong citation.** `../GLOSSARY.md`'s "tell me, and tell me true"
  row cited four paragraphs for what are four instances in **three**, and
  numbered them on the 0-indexed source array against the 1-indexed packet
  IDs used everywhere else. Corrected, and the same off-by-one is gone from
  `continuity.md`, which now uses `B01-Pnnn` throughout.

### The five optional findings — all applied, each with its reason

The reasoning is in full in `changes-v1-to-v2.md`; in brief:

- **2.1 — applied.** `without let-up` → `without pause`. The one phrase in
  the Book below the register the package set, and nothing on record argued
  for the drafter's word.
- **3.1 — applied, and the glossary row rewritten.** The hecatomb *fold*
  stands (D3), but it must not **supply a number Butler declines to give**.
  The reviewer rated its own confidence low; it is applied anyway because
  later Books contain many hecatombs and the inherited rule should not
  manufacture a number twenty-three more times. Now "a great sacrifice of …".
- **21.1 — applied.** Butler's statement had become an imperative, and his
  litotes *of no less value* — which leaves open that a god's return gift
  will be *greater* — had become a flat "equal". A hedge, not a style
  preference.
- **26.1 — applied, and the formula gets a row.** "Take to heart" in modern
  English means *accept*; Butler's "laid her son's saying in her heart" is
  the Homeric formula for *pondering*. Applied because its real subject is a
  rule for twenty-three more Books.
- **R5 — applied as a record, no word changes.** The two Victorian quotation
  normalizations at B01-P018 and B01-P027 are both right and both stay; they
  were silent, which made D4's *preservation* read as an inconsistency rather
  than a decision. Both are now stated in `../PUNCTUATION.md` §3, with the
  rule that separates them: a convention a modern reader would misread as an
  error is normalized; a convention that carries information is preserved.

### Verification of the changed passages

Each changed passage was re-read against `source-book1.json` after the build.
The build's own per-correction assertions confirm that only the intended
tokens moved: each "old" string matched exactly once, each "new" string is
present, each "old" string is gone. Two places the reviewer raised as "also
noted" and declined to make findings of are asserted **unchanged**, so that a
later pass cannot drift into them: B01-P013's doubled "brought", and
B01-P010's "over" for Butler's "under" (now recorded in `continuity.md`
instead).

**Invariants re-asserted after v2:** Butler's unclosed quotation (D4) intact
at B01-P018 → B01-P019, quotation balance still 30/29, 32 paragraphs aligned
1:1, no embedded newline in any candidate paragraph, `draughts` kept, and the
full README check block re-run verbatim — it prints
`OK — 32 paragraphs, coverage exact, packets verbatim, all hazards held, ratio 0.9462`
and the four expected hashes.

**The frozen v1 artefacts were deliberately not regenerated.**
`candidate-v1.json`, `candidate-v1-readable.md` and `review-packets/` stay in
Butler's Roman forms, because they are the record of what round 1 actually
reviewed; regenerating them would make `review/findings-v1.md` quote text
that no longer exists. Recorded in `manifest.json` and `continuity.md`.

## Step 7 — flow read

`candidate-v2-readable.md` read continuously, B01-P001 to B01-P032. **No
change was made from the read.**

The corrected passages read without a snag in place. The opening now ends
"Tell me about all this too, daughter of Zeus, from whatever source you know
it" and begins "that resourceful hero", which is the line every reader reads.
Zeus's speech carries its moral qualifier again, and B01-P006's order is
Butler's once more: the grievance, then whose grievance and why — so Thoosa
and Phorcys arrive as information rather than as repetition. Telemachus's
long complaint at B01-P017 now distinguishes *dismay* from the *grief* in its
next clause, and the mound is over his ashes, which is the rite he is saying
he was denied. The Antinous exchange holds four *chiefs* and hands *master*
back to Eurymachus one paragraph later, which is where Butler puts it. The
two songs at B01-P023 and B01-P025 are about the same *sufferings*.

The book reads as one voice, and the register holds: third-person narration
alternating with thirteen speeches, all of them still speeches. The Greek
names read as the product's names and not as an intrusion — which is the
point of S1, and the one thing a flow read can confirm that a script cannot.
The reviewer's Book-level observation about the last third — *fine* doing the
work of *divine*, *beautiful* and *great* in four places — is answered where
it was a finding (27.1 restores *divine*; 16.1 restores *fine* where Butler
has it as a compliment) and no residue of it was audible on the read.

## Step 8 — acceptance

No substantive issue remains: all three were fixed at step 6 and verified.
Book 1 is accepted as **`candidate-v2.json`**.

## What remains open

- **Nothing content-side for Book 1.** Every one of the 41 round-1 findings
  is applied; none is declined, so nothing is carried as an unresolved
  disagreement.
- **B01-P014's crux** is resolved on a stated reading, not settled by the
  source. A later reader who prefers the temporal reading has the argument to
  argue against, in `continuity.md` "Unresolved source issues" item 1; the
  route is a `candidate-v3.json` with the same change-log discipline.
- **B01-P006's "an eye" → "the eye"** is the candidate's one deliberate
  resolution of a Victorian indefinite, recorded rather than silent.
- **Ledger D1 is reversed and A1 is answered.** Recorded as answered by the
  coordinator, not deleted. **A2 (the Book 10 pilot's disposition) is
  narrowed but still open**: applying S1 removes the name-form conflict that
  was one of its two stated blockers, so Book 10's disposition is now a
  question about its unreviewed status alone.
- `candidate-v1.json` stays frozen at `8316ff76…` and is not to be edited.
- Nothing here is merged, registered, deployed, or written into
  `app/public/data/editions/`. This package stages a replacement; it does not
  install one.
- Errors can remain. This record claims the process was followed and every
  finding answered, not that the text is beyond correction. A second reader
  would find things the first did not, and the reviewer says so itself.
