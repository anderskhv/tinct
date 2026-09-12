# Changes v1 → v2 — the Odyssey, Book 1

Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by
paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`).
Applied mechanically by `../scripts/build_book01_v2.py`, which asserts that v1
is at its frozen hash `8316ff76…` before reading it, that each "old" string
below occurs **exactly once** in its paragraph, that each correction landed
and its v1 form is gone, and that every hazard in `../GLOSSARY.md` holds
before and after the name mapping.

Three passes, in this order and no other: **(1)** the paragraph corrections
below; **(2)** the Roman → Greek name mapping of standing finding **S1**;
**(3)** the typographic-apostrophe pass of `../PUNCTUATION.md` §1.

**Totals.** 37 corrections in 27 paragraphs; 47 name substitutions (46
Roman → Greek plus one `Euryclea` → `Eurycleia`) in 20 paragraphs plus the
chapter title; 22 apostrophes normalized in 15 paragraphs. **29 of the 32
paragraphs differ between v1 and v2.** The three that are byte-identical are
**B01-P011, B01-P020 and B01-P022** — the servants' meal, the guest-gift
offer, and Athena's departure: no finding, no name in the mapping, no
apostrophe. Paragraph count 32, alignment 1:1 with `source-book1.json`,
word ratio **0.9425 → 0.9462**.

## Pass 1 — the paragraph corrections

| Paragraph | Finding | v1 | v2 |
|---|---|---|---|
| B01-P001 | 1.1 | that resourceful **man** who wandered | that resourceful **hero** who wandered |
| B01-P001 | 1.2 | daughter of Jove, **whatever part of it you know.** | daughter of Jove, **from whatever source you know it.** |
| B01-P002 | 2.1 *(optional, applied)* | without **let-up** | without **pause** |
| B01-P003 | 3.1 *(optional, applied)* | **an offering of a hundred** sheep and oxen | **a great sacrifice of** sheep and oxen |
| B01-P004 | 4.2 | See how men **blame us gods for their troubles, when it is really their own folly that brings them grief.** | See how men **lay the blame on us gods for what is, after all, nothing but their own folly.** |
| B01-P004 | **4.1 (substantive)** | seduce Agamemnon's wife, and then kill Agamemnon | seduce Agamemnon's wife **wrongfully**, and then kill Agamemnon |
| B01-P005 | 5.1 | who **knows the depths of every sea** and holds up | who **has charge of the depths of the sea** and holds up |
| B01-P006 | **6.1 (substantive)** | for blinding **his son** Polyphemus, king of the Cyclopes. | for blinding **the eye of** Polyphemus, king of the Cyclopes. |
| B01-P007 | 7.1 | his sheep and **cattle** without number | his sheep and **oxen** without number |
| B01-P007 | 7.2 | of his dear father's return—**and this will win him a good name among men.** | of his dear father's return—**for this will make people speak well of him.** |
| B01-P008 | 8.1 | spear, so **heavy and strong,** | spear, so **stout and sturdy and strong,** |
| B01-P009 | 9.1 | **Telemachus was the first to see her.** | **Telemachus saw her long before anyone else did.** |
| B01-P009 | 9.2 | He took her right hand in his, **took her spear from her,** and said, | He took her right hand in his **own, asked her for her spear,** and said, |
| B01-P010 | 10.1 | a cloth of **fine linen** | a cloth of **damask** |
| B01-P012 | 12.1 | the crowning **pleasures** of a banquet | the crowning **ornaments** of a banquet |
| B01-P013 | 13.1 | rather than a **fatter** purse | rather than a **longer** purse |
| B01-P013 | 13.2 | for you **can hardly** have come by land | for you **cannot** have come by land |
| B01-P014 | 14.2 | under the wooded **hill of** Neritum | under the wooded **mountain** Neritum |
| B01-P014 | 14.1 | for he is not dead, **and not yet on the mainland.** | for he is not dead, **and yet he is not on the mainland.** |
| B01-P016 | 16.1 | while Penelope has **a son like you** | while Penelope has **such a fine son as you** |
| B01-P017 | 17.2 | would have built **him a burial mound** | would have built **a mound over his ashes** |
| B01-P017 | 17.1 | I have inherited nothing but **grief.** | I have inherited nothing but **dismay.** |
| B01-P018 | 18.1 | he would soon **deal with** these **worthless** suitors | he would soon **set about** these **villainous** suitors |
| B01-P019 | **19.1 (substantive)** | and **let your mother marry** again. | and **give your mother in marriage** again. |
| B01-P019 | 19.2 | and make yourself a name. | and make yourself a name **in story.** |
| B01-P021 | 21.1 *(optional, applied)* | **Give me** a fine one, and I will give you **something of equal value** in return. | **You shall give me** a fine one, and I will give you **one of no less value** in return. |
| B01-P023 | 23.1 (a) | and the **hardships** Minerva had laid on the Achaeans | and the **sufferings** Athena had laid on the Achaeans |
| B01-P024 | 24.1 | you know many other **tales** of gods and heroes | you know many other **deeds** of gods and heroes |
| B01-P025 | 23.1 (b) + 25.1 | Singers do not create the **misfortunes** they sing of; it is Jove **who does that**, sending | Singers do not create the **sufferings** they sing of; it is Zeus, **not they, who does it**, sending |
| B01-P025 | 25.2 | and the **running of your maids.** | and the **direction of your servants.** |
| B01-P026 | 26.1 *(optional, applied)* | in wonder, **taking her son's words to heart.** | in wonder, **and kept her son's words in her heart.** |
| B01-P027 | 27.1 | a voice as **fine** as Phemius's | a voice as **divine** as Phemius's |
| B01-P029 | 29.1 | But I will be **master** in my own house, **at least,** and rule **over** those Ulysses won for me. | But I will be **chief** in my own house, and rule those **whom** Odysseus won for me. |
| B01-P030 | 30.1 | but you shall **certainly** be master in your own house | but you shall be master in your own house |
| B01-P031 | 31.1 | and even **when** some rumor reaches me | and even **if** some rumor reaches me |
| B01-P032 | 32.1 | looking out over the **courtyard** | looking out over the **outer court** |
| B01-P032 | R2 | under a **woollen** fleece | under a **woolen** fleece |

*(The v2 column shows the paragraph as it finally reads, so the name mapping
of pass 2 is visible in it where it touches the same clause.)*

## Pass 2 — the name mapping (standing finding S1)

Applied by script from the **closed** seven-row table in `../GLOSSARY.md`,
**case-sensitively and word-bounded**. Counts are substitutions actually made,
asserted against the reviewer's independent census:

| Butler | Modern edition | substitutions |
|---|---|---|
| Ulysses | Odysseus | **17** (14 plain + 3 `Odysseus’s`) |
| Minerva | Athena | **12** |
| Jove | Zeus | **6** |
| Neptune | Poseidon | **6** (5 plain + 1 `Poseidon’s`) |
| Mercury | Hermes | **3** |
| Saturn | Cronus | **2** (both inside the fixed epithet) |
| Diana | Artemis | **0** — does not occur in Book 1 |
| Euryclea | Eurycleia | **1** (Cast display name; not a Roman → Greek row) |

**46 Roman → Greek substitutions across 20 of the 32 paragraphs, plus one
spelling**, and the chapter title: *Book 1 — The gods in council—**Athena's**
visit to Ithaca—the challenge from Telemachus to the suitors*, which is
byte-identical to the title the served `modern-en` already uses.

### Every hazard, and how it was handled

The script asserts all six before and after the pass. Each of these is a way
a naive find-and-replace corrupts the text.

1. **`Ops` was not mapped, and is asserted to survive.** B01-P032's
   "Eurycleia, daughter of Ops, son of Pisenor" is Butler's Ὦψ — Eurycleia's
   grandfather, a man, and already Greek. *Ops* is also the Roman name of
   Rhea, so a table assembled from a general Roman → Greek deity list carries
   `Ops → Rhea` and would replace a man's name with a goddess's in the middle
   of the genealogy. The table in `../GLOSSARY.md` is therefore **closed and
   enumerated**, not generated; the script asserts `Ops` still occurs once,
   that the phrase "daughter of Ops, son of Pisenor" is intact, and that
   **`Rhea` never appears anywhere in the candidate**.
2. **`Saturn` occurs only inside the fixed epithet, and the glossary row was
   rewritten with it.** Both occurrences are "Father, son of Saturn, king of
   kings" (B01-P005, B01-P007). The script asserts that after the pass the
   string "son of Cronus, king of kings" occurs **exactly twice** and that
   the spelling **`Cronos`** — which `../GLOSSARY.md` used in two places —
   occurs nowhere. *Cronus* is settled as the form. Without the glossary
   edit, Book 2 would have been drafted against a row describing an edition
   that no longer exists.
3. **The possessive is decided once and recorded: `Odysseus's`.** It matches
   the candidate's own `Telemachus's`, `Phemius's` and `Agamemnon's`, and is
   what an English reader says aloud; Butler's bare `Ulysses’` is not carried
   over. The script asserts exactly **three** `Odysseus’s` and that **no bare
   `Odysseus’`** survives. Recorded in `../GLOSSARY.md` hazard 3 so every
   later Book inherits it.
4. **Matching is case-sensitive.** A case-insensitive pass would have
   destroyed the island `Same` in B01-P017. The script asserts the string
   "Dulichium, Same, and wooded Zacynthus" survives the pass verbatim.
5. **`heaven` was not touched.** Ten occurrences, all Butler's metonym for
   the gods collectively ("it rests with heaven to decide", "call heaven to
   witness", "heaven has laid other sorrows on me", "some message from
   heaven"); it is not a stand-in for Jove. The script counts `heaven` before
   and after and asserts the count is unchanged at **10**.
6. **`Hyperion` stays, and is not expanded to Helios.** B01-P001's
   "the cattle of the sun-god Hyperion" is already Greek. The script asserts
   the phrase survives and that **`Helios` never appears**.

The script also asserts, after the pass, that **no Roman form survives** —
zero occurrences of Ulysses, Minerva, Jove, Neptune, Mercury, Saturn, Diana
or Euryclea anywhere in the candidate.

## Pass 3 — typographic apostrophes (records finding R1)

22 ASCII apostrophes → 22 typographic ones, in 15 paragraphs. Book 1 has no
contractions, so all 22 are possessives or the plural possessive `Danaans’`.
The script asserts 22 before, 22 after, and that **no ASCII apostrophe and no
ASCII double quote survives**. Decided together with the possessive rule, as
the reviewer asked; the reasoning is in `../PUNCTUATION.md` §1.

## Invariants the build re-asserts

- **Butler's unclosed quotation (D4) is untouched**: B01-P018 still ends
  without a closing mark, B01-P019 still opens with one, and the Book's
  quotation balance is still **30 open / 29 close** — the same one-pair
  difference from the source that `../PUNCTUATION.md` §3 accounts for.
- **Paragraph alignment**: 32 paragraphs, 1:1 with `source-book1.json`, and
  **no embedded newline** in any candidate paragraph (the served `modern-en`
  and `modern-da` have none; the served `original-en` preserves PG's hard
  wraps, which is why source and candidate differ there and it is correct).
- **`draughts`** (B01-P008) is asserted to stay: it is the game's name, not a
  British spelling.
- Two places the reviewer raised as "also noted" and declined to make
  findings of are asserted **unchanged**, so a later pass does not drift into
  them: B01-P013's doubled "brought", and B01-P010's "over" for Butler's
  "under" (recorded in `continuity.md`, not corrected).

## Record-only findings (no word of the text changes)

- **R3** — the source crux at B01-P014 is now recorded in `continuity.md`'s
  "Unresolved source issues", with the reading chosen and why. The file
  previously said Book 1 contains no defective source sentence; it contains
  one. *(The reading itself changed, under finding 14.1, in pass 1.)*
- **R4** — `../GLOSSARY.md`'s citation for the "tell me, and tell me true"
  row is corrected: four instances in **three** paragraphs, B01-P013 ×2,
  B01-P014, B01-P016, cited in `B01-Pnnn` IDs. The old row cited "P12, P13,
  P15, P18 in Butler's paragraphing" — miscounted, and numbered on the
  0-indexed source array against the 1-indexed packet IDs. The same
  off-by-one in `continuity.md` (which labelled Telemachus's longest speech
  "P16" and then explained in a parenthesis that it is B01-P017) is
  corrected in the same pass: `continuity.md` now uses `B01-Pnnn` throughout.
- **R5** *(optional, applied as a record)* — the two Victorian quotation
  habits v1 normalized silently, at B01-P018 and B01-P027, are now stated as
  a class in `../PUNCTUATION.md` §3, beside D4's preservation, with the rule
  that separates them.
- **R2** — the spelling standard (American, matching the served editions) is
  recorded in `../GLOSSARY.md`. Its one text consequence, `woollen` →
  `woolen`, is in the table above.

## Findings applied: all 3 substantive, all 33 minor, all 5 optional

Every one of the 41 findings is answered, as step 6 requires. **Nothing was
declined**; the five optional findings are discussed one by one below, since
"applied" is a decision in each case and the reviewer's own confidence was
low or medium on three of them.

### The three substantive findings

**4.1 — applied, in the smallest form.** B01-P004 had `he had to go and
seduce Agamemnon's wife, and then kill Agamemnon`, dropping Butler's
**`unrighteously`**. This is Zeus's opening speech, and the poem's
programmatic statement about human responsibility: men suffer beyond their
allotted share **by their own wrongdoing**, and then blame the gods. The
adverb is what makes the act a moral offence rather than a piece of
stupidity, and it is the hinge the speech turns on — Aegisthus was warned,
did it anyway, and did it *wrongly*. "Seduce" carries impropriety; it does
not carry wrong. v2 reads **`seduce Agamemnon's wife wrongfully`**. The
reviewer's fuller alternative (`wrong Agamemnon by seducing his wife, and
then kill him`) was weighed and declined: it is no clearer, and it breaks
Butler's own `Agamemnon … Agamemnon` repetition, which names the victim twice
because the offence is twice against the same man. `had to go and` stays —
it is doing the tonal work of Butler's `must needs`, as the reviewer says,
and now that `wrongfully` is back it is not being asked to carry the moral
weight as well.

**6.1 — applied, both halves.** B01-P006 had `for blinding his son
Polyphemus, king of the Cyclopes`, where Butler has `for having blinded an
eye of Polyphemus king of the Cyclopes`.

- **The blinding is restored.** It is the single most consequential physical
  act in the Odyssey's back-story and the detail that makes the next eleven
  Books cohere. Butler's phrasing is odd — the Cyclops has one eye, so "an
  eye of Polyphemus" reads strangely — and that oddity is very likely why it
  got smoothed away; a reader who meets "blinding Polyphemus" has been told
  that Odysseus attacked him, not that he put out his eye.
- **`his son` is removed.** It pre-empts Butler's own next sentence, which
  gives the genealogy in full — `Polyphemus is son to Neptune by the nymph
  Thoosa, daughter to the sea-king Phorcys` — a sentence the candidate keeps.
  With `his son` in place the reader is told twice, and the second telling,
  the one carrying Thoosa and Phorcys and the reason *Poseidon specifically*
  is the enemy, arrives as redundant. Butler's order is the grievance first,
  then why it is Poseidon's grievance.

v2 reads **`for blinding the eye of Polyphemus, king of the Cyclopes`**.
The definite article for Butler's indefinite is a deliberate resolution of a
Victorian slip and is recorded at B01-P006 in `continuity.md`.

**19.1 — applied.** B01-P019 had `let your mother marry again` for Butler's
`make your mother marry again`. This reverses the agency in one of the ten
instructions Athena gives. Butler's Athena tells Telemachus to *give his
mother in marriage* — an act he performs, as head of the household, and one
of the concrete duties she loads onto him beside calling the assembly, taking
a ship and killing the suitors. `let` makes it permission he grants if she
asks, which is not a duty at all, and it removes the one piece of the counsel
that requires him to act against his mother's wishes. The alternative reading
— that the drafter softened a line harsh to a modern ear — was considered; if
that is what happened it is an interpretive change to the content, and the
register is Homer's, so the reader is entitled to it. Telemachus says the
same thing in his own voice in Book 2. v2 reads **`give your mother in
marriage again`**.

### The five optional findings — all applied, with the reason in each case

**2.1 — applied.** `without let-up` → **`without pause`**. The reviewer calls
it the one phrase in the Book that drops below the register the package set
("no colloquial rewrite"), and is right: *let-up* is current, but it belongs
to a different kind of prose. The fix is one word for two, no sense moves,
and the package has no competing reason on record to keep the drafter's word.

**3.1 — applied, and the glossary row is rewritten with it.** `an offering of
a hundred sheep and oxen` → **`a great sacrifice of sheep and oxen`**. The
*fold* is upheld — decision D3 stands, Book 1 never needs the word "hecatomb"
again, and a loanword needing its own gloss is worse than a description. But
the reviewer's caveat is decisive on its own terms: **the fold supplies a
number Butler declines to give.** By Homer's period *hecatomb* had long
stopped meaning literally a hundred of anything, Butler knew it, and
everything else in this candidate is scrupulous about not stating quantities
the source leaves open (the same paragraph keeps "twenty oxen" and "twenty
men" exactly because Butler does state those). The reviewer rated its own
confidence low that this should change; the reason it changes anyway is the
one the reviewer gives for raising it at all — **later Books contain many
hecatombs**, and the rule they inherit should not manufacture a number
twenty-three more times. `../GLOSSARY.md`'s row now reads "a great sacrifice
of …".

**21.1 — applied.** `Give me a fine one, and I will give you something of
equal value in return.` → **`You shall give me a fine one, and I will give
you one of no less value in return.`** Two things move back. Butler's
**statement** (`You shall give me`) had become an **imperative**, which is a
different speech act from a god who has just refused the gift and deferred
it. And his litotes `of no less value` — which leaves open that her return
gift will be *greater*, as a god's gift to a mortal generally is — had become
the flat `equal`, which closes it. The reviewer's confidence is low-medium
and it recorded this as a preference; it is applied because the litotes is a
semantic hedge, not a stylistic one, and hedges are a class the accessibility
standard names. Neither change costs a modern reader anything.

**26.1 — applied, and the formula gets a glossary row before Book 2.**
`taking her son's words to heart` → **`and kept her son's words in her
heart`**. Butler's `laid her son's saying in her heart` is the Homeric
formula for *pondering* something, turning it over inwardly; "take to heart"
in modern English means *accept* it, or be wounded by it. Both readings work
dramatically here — Penelope does go on to weep and sleep — which is why the
reviewer rated the finding low-medium. What it rated **high** is that the
formula recurs through the poem and should be fixed now rather than
rediscovered at Book 6, and that is the reason it is applied rather than
left: an optional finding whose real subject is a rule for twenty-three more
Books is cheaper to settle at Book 1. Row added to `../GLOSSARY.md`.

**R5 — applied as a record, no word changes.** The two quotation
normalizations at B01-P018 and B01-P027 are **both right**, as the reviewer
says, and both stay. What was missing is that they were silent, in the one
package that documents this class carefully: D4 went to real trouble over
Butler's *preserved* unclosed quotation, and beside two unrecorded
normalizations it reads as an inconsistency rather than a decision. Both are
now stated in `../PUNCTUATION.md` §3 with the rule that separates them — a
convention a modern reader would misread as an error is normalized; a
convention that carries information is preserved.

### The reviewer's unnumbered "also noted" remarks

None required a change, and two are asserted **unchanged** by the build so
that a later pass cannot drift into them: B01-P013's doubled "brought" (the
reviewer considered a finding and declined) and B01-P010's "over" for
Butler's "under" (let go, and now recorded in `continuity.md` instead). The
rest are confirmations of renderings `continuity.md` or `../GLOSSARY.md`
already fixes — the glossary epithets applied at B01-P003, B01-P005 and
B01-P007; `bearing-post` → `pillar` and `cloisters` → `gallery` applied
consistently across B01-P010, B01-P023 and B01-P026; the Poseidon pronoun
disambiguation at B01-P006; `draughts`, `sea-girt`, `imperishable` and
`middle Argos` all kept.

### Two findings whose proposed wording was not taken verbatim

Both are applied; only the wording differs from the reviewer's first
proposal, and in each case the reviewer offered the alternative itself.

- **8.1** — the reviewer proposed `so thick and sturdy and strong` **or**
  Butler's own `so stout and sturdy and strong`. **Butler's is taken.** None
  of his three words is archaic, *stout* is still ordinary current English of
  a shaft or a stick, and the tricolon and its alliteration are the point of
  the finding. `heavy`, which Butler does not have and which is wrong about a
  spear Athena carries, is gone either way.
- **18.1** — the reviewer proposed `set about these rascally suitors`, with
  `villainous` offered "if 'rascally' is judged too light for a modern ear".
  **It is.** *Rascally* now reads jocular, and Butler's suitors are
  villainous, which is the reviewer's own gloss of the word. `deal with` →
  **`set about`** is taken exactly: the violence is the sentence, and it is
  the line that plants Book 22.
