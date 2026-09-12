# Continuity sheet — the Odyssey, Book 1 (accepted at candidate v2)

Written alongside drafting `candidate-v1.json` and **revised 2026-09-12 at
step 6**, after round 1 of independent review (`review/findings-v1.md`). It
now describes the **accepted** file, `candidate-v2.json`; every change from
v1 is listed in `changes-v1-to-v2.md` by paragraph ID against the finding it
answers.

Paragraph IDs are `B01-Pnnn`, 1-indexed, throughout. *(Records finding R4:
v1 of this file mixed these with 0-indexed "P16"-style labels taken from the
source array, which caused an off-by-one in `../GLOSSARY.md`'s formula
citation. The parallel numbering is gone.)*

Name forms follow `../GLOSSARY.md`'s **revised** naming decision: the Greek
forms (Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus), not Butler's Roman
ones. v1 used Butler's forms, correctly under the decision in force when it
was drafted; standing finding **S1** reversed that decision, and the mapping
was applied by script at step 6.

## Source

- `../../../../app/public/data/editions/odyssey-original-en.json`, chapter
  `number: 1`, 32 paragraphs. Extracted verbatim into `source-book1.json`
  (sha256 in `provenance.json`); byte-identity re-verified at acceptance.
- Samuel Butler, 1900, PG #1727. See `../PROVENANCE.md` for identification
  and rights. The round-1 reviewer re-verified the extraction independently,
  by its own reconstruction of PG #1727 lines 376–740 built from a property
  of the text the build does not use (PG's own numbered footnote-entry list),
  and reproduced all 32 paragraphs byte-for-byte with zero diffs.
- Book 1 was read in full before any paragraph was drafted: the invocation
  to the Muse; the council of the gods and Zeus's exchange with Athena
  about Odysseus; Athena's descent to Ithaca disguised as Mentes; her
  reception by Telemachus and the meal; Telemachus's complaint about the
  suitors; Athena's questions and her account of "Mentes"; her counsel to
  Telemachus (call an assembly, go to Pylos and Sparta for news, deal with
  the suitors); her departure; Phemius's song and Penelope's grief;
  Telemachus's rebuke of his mother and of the suitors; the suitors'
  reactions (Antinous, Eurymachus); and Telemachus retiring for the night
  with Eurycleia.
- The accepted candidate was read continuously at step 7
  (`candidate-v2-readable.md`), and no change was made from that read.

## Names met in Book 1, and how they are rendered

**Remapped to the Greek forms** (`../GLOSSARY.md`, standing finding S1;
counts are substitutions made by `../scripts/build_book01_v2.py`):
Ulysses → **Odysseus** (17), Minerva → **Athena** (12), Jove → **Zeus** (6),
Neptune → **Poseidon** (6), Mercury → **Hermes** (3), Saturn → **Cronus**
(2, both inside the fixed epithet). Diana does not occur in Book 1. The
chapter title is remapped too, to the form the served `modern-en` already
uses.

**Spelling aligned to the Cast:** Butler's *Euryclea* → **Eurycleia**
(B01-P032), the display name in `odyssey-threads.json`, which keeps
"Euryclea" as a `searchNames` alias so Cast highlighting works either way.
This is the last name on which the edition and the Cast disagreed.

**Kept exactly as Butler has them** (already Greek, or with no Roman form in
common use): Telemachus, Penelope, Calypso, Ithaca, Ethiopians, Aegisthus,
Agamemnon, Orestes, Atlas, Polyphemus, Cyclopes, Thoosa, Phorcys, Ogygia,
Achaeans, Sparta, Pylos, Mentes, Anchialus, Taphians, Temesa, Rheithron,
Neritum, Laertes, Phemius, Icarius, Hellas, Argos, Danaans, Ephyra, Ilus,
Mermerus, Dulichium, Same, Zacynthus, Antinous, Eupeithes, Eurymachus,
Polybus, **Ops**, Pisenor, Hyperion, Argives, Menelaus, Nestor, Troy,
Olympus/Olympian.

**Two of these are traps and are asserted by the build.** `Ops`
(B01-P032, Eurycleia's grandfather) is Butler's Ὦψ, a man, and is *also* the
Roman name of Rhea — a mapping table built from a general Roman → Greek
deity list would turn him into a goddess. `Same` (B01-P017, the island) is
destroyed by any case-insensitive pass. See `../GLOSSARY.md`, hazards 1 and 4.

## Paragraph-level decisions

Entries marked **[v2]** record a change made at step 6; the finding number is
in `changes-v1-to-v2.md`.

- **B01-P001 (invocation)** — "ingenious" → "resourceful" (Butler's word now
  reads as clever-in-a-narrow, mechanical sense; the Greek behind it is the
  same root as Odysseus's defining trait, which "resourceful" states
  plainly). **[v2]** "hero" is **kept**, not reduced to "man": it is Butler's
  own word in the poem's first line and it tells a first-time reader what
  kind of book this is before the sentence has finished (1.1). "sacked the
  famous town of Troy" → "city of Troy" ("town" now undersells Troy).
  **[v2]** "from whatsoever source you may know them" → **"from whatever
  source you know it"** — Butler's *source* is the origin of the Muse's
  knowledge, not the *extent* of it, and v1's "whatever part of it you know"
  substituted a different and smaller hedge (1.2).
- **B01-P002** — Butler's contrast (everyone else vs. Odysseus) kept, with
  "Odysseus" moved earlier for a modern reader's parsing; Calypso's three
  facts kept as three (she detains him; the cave; her wish to marry him).
  **[v2]** "without let-up" → **"without pause"**: the one phrase in the Book
  that dropped below the register the package set (2.1, optional).
- **B01-P003** — "the sire of gods and men" → "the father of gods and men"
  (glossary row). **[v2]** "a hecatomb of sheep and oxen" → **"a great
  sacrifice of sheep and oxen"**, revised from v1's "an offering of a hundred
  sheep and oxen": the fold stands (D3), but it must not supply a number
  Butler declines to give, and later Books' hecatombs inherit this form
  (3.1, optional).
- **B01-P004** — Aegisthus's story keeps every step: the seduction, the
  murder, Zeus's warning via Hermes, Orestes's coming revenge, Aegisthus's
  refusal to listen, "paid for it all in full". **[v2, substantive]**
  Butler's **`unrighteously`** is restored as **"wrongfully"** — the
  load-bearing word of the poem's programmatic statement about human
  responsibility, and the hinge Zeus's speech turns on (4.1). **[v2]** v1's
  "blame us gods for their troubles… their own folly that brings them grief"
  added two nouns Butler does not have; v2 reads "lay the blame on us gods
  for what is, after all, nothing but their own folly" — the thing they blame
  the gods for *is* their own folly, and saying so in one clause is Butler's
  construction and the sharper one (4.2).
- **B01-P005** — Athena's fixed address: **[v2]** "Father, son of Cronus,
  king of kings" (glossary row, rewritten with the mapping; "king"
  lower-cased to modern sentence style). **[v2]** Atlas "looks after the
  bottom of the ocean" → **"has charge of the depths of the sea"**, revised
  from v1's "knows the depths of every sea": Butler's Atlas has *charge* of
  the ocean floor, and v1 had replaced one attribute with another — and,
  in doing so, silently moved the clause toward the Greek ("who knows the
  depths of all the sea"), which would be a different and larger project
  than modernizing Butler (5.1). "blandishment" → "flattery"; "the smoke of
  his own chimneys" kept as the concrete image it is.
- **B01-P006** — "than whom there is no more capable man on earth" → "the
  most capable man on earth". Butler's genuinely ambiguous pronoun ("he will
  not kill Ulysses outright") is resolved to "Poseidon", the one name census
  difference between source and candidate. **[v2, substantive]** "blinding
  his son Polyphemus" → **"blinding the eye of Polyphemus"** (6.1): the
  blinding, the single most consequential physical act in the poem's
  back-story, was dropped, and "his son" pre-empted Butler's own next
  sentence, which gives the genealogy in full and is kept. **Recorded
  deliberate resolution:** Butler writes "**an** eye of Polyphemus", which
  reads as a slip now that the reader knows the Cyclops has one eye; the
  candidate writes "**the** eye". This is the candidate's one silent
  resolution of a Victorian indefinite, and it is recorded here rather than
  left to be found.
- **B01-P007** — the three actions of Athena's plan kept distinct and in
  order (send Hermes to Calypso; go to Ithaca to embolden Telemachus; take
  him to Sparta and Pylos). **[v2]** "his sheep and cattle" → **"his sheep
  and oxen"**: Butler's *oxen* is the word the candidate uses at B01-P003,
  B01-P008 and B01-P032, and the suitors' consumption of Odysseus's oxen is a
  thread that runs to the end of the poem (7.1). **[v2]** "—and this will win
  him a good name among men" → **"—for this will make people speak well of
  him"**: Butler's *for* makes the reputational benefit a reason Athena gives
  for sending him, which is the seed of Telemachus's whole arc, and "among
  men" was an addition; Butler says "people" (7.2).
- **B01-P008** — "imperishable" kept as a qualifier on the sandals;
  "bronze-shod" → "bronze-tipped" (an improvement: *shod* now suggests
  footwear, three words after sandals). **[v2]** "so heavy and strong" →
  **"so stout and sturdy and strong"**, Butler's own tricolon restored: the
  triple and its alliteration are Homeric, none of the three words is
  archaic, and *heavy* is a property Butler does not assign — *stout* and
  *sturdy* are about thickness and solidity, not weight (8.1). The suitors'
  scene keeps its full inventory. **`draughts` is kept** as the game's name;
  "checkers" would be an Americanism the register does not license, and it is
  not covered by the spelling standard.
- **B01-P009** — **[v2]** "Telemachus was the first to see her" →
  **"Telemachus saw her long before anyone else did"**: Butler is not ranking
  reaction times, he is saying that Telemachus alone in a hall of men is
  awake to what is happening (9.1). **[v2]** "took her spear from her" →
  **"asked her for her spear"**: Butler's Telemachus *asks*, which is a
  different act from a young host toward an armed stranger — and v1 had him
  take the spear twice, since B01-P010 sets it in the rack (9.2).
  Telemachus's stated motive for going to the gate himself is kept.
- **B01-P010** — Butler's own pronoun assignment kept exactly ("that she
  might not be annoyed… and that he might ask her more freely"), the easiest
  thing in the paragraph to garble. **[v2]** "a cloth of fine linen" →
  **"a cloth of damask"**: damask is a figured, self-patterned weave, not a
  fibre, materials are a checked class, and the word is not obscure (10.1).
  **Recorded, not corrected:** Butler throws the cloth **under** the seat and
  the candidate spreads it **over** it. Butler's "under" is itself odd,
  "over" is what a modern reader pictures, and nothing turns on it — but it
  is a silent change and it is recorded here rather than left unexplained.
  Asserted unchanged by the build so a later pass does not drift into it.
- **B01-P011** — the five servants and their five distinct tasks kept as
  five (ewer and basin and drawn table; bread and the good things of the
  house; plates and golden cups; wine). "ewer" → "pitcher", "upper servant" →
  "senior servant". **Byte-identical between v1 and v2**: no finding, no
  mapped name, no apostrophe.
- **B01-P012** — the compulsion on Phemius is kept ("whether he wished to or
  not"): he is not a willing entertainer, and Book 22 turns on it. **[v2]**
  "the crowning pleasures of a banquet" → **"the crowning ornaments of a
  banquet"**: an embellishment is an ornament, not a pleasure, and Butler's
  cooler claim — that music and dancing are what *finish* a feast — sets up
  Telemachus's bitterness three sentences later (12.1).
- **B01-P013** — "Singing comes cheap to those who do not pay for it" kept as
  the bitter aphorism it is; "grinding to powder in the surf" kept exactly.
  "tell me truly" applied twice here per the glossary. **[v2]** "a fatter
  purse" → **"a longer purse"**: Butler's joke is the repeated adjective —
  *longer* legs, *longer* purse — and that pun is the whole of the wit
  (13.1). **[v2]** "you can hardly have come by land" → **"you cannot have
  come by land"**: Ithaca is an island, Butler's is a flat statement of fact,
  and it is the premise of the question Telemachus is asking (13.2).
  **Considered and left as drafted:** "what kind of ship brought you, and how
  your crew brought you to Ithaca" repeats *brought* in nine words. The
  reviewer considered a finding and declined; it is clumsy, not defective,
  and it is asserted unchanged by the build.
- **B01-P014** — Mentes's long speech (the Book's longest paragraph): every
  biographical claim kept — parentage and kingship, the cargo (iron out,
  copper back), the ship's exact location, the fathers' friendship, Laertes's
  isolation and his one old woman, the report that Odysseus was home, the
  disclaimer of prophecy beside the confident prediction, the resemblance
  about the head and eyes. **[v2]** "the wooded hill of Neritum" → **"the
  wooded mountain Neritum"**: Neritum is Ithaca's mountain, the one Odysseus
  names in Book 9 when he identifies his home, and geography is a checked
  class (14.2). **[v2]** the source crux — see "Unresolved source issues"
  below — is re-read adversatively: **"for he is not dead, and yet he is not
  on the mainland"** (14.1).
- **B01-P015** — the proverb kept as a proverb ("it is a wise child who knows
  his own father"); "Would that I were son to one who had grown old upon his
  own estates" → "I wish I were the son of some man who had grown old on his
  own land", which is exactly the transformation the package exists for.
- **B01-P016** — Butler's run of distinct questions survives as distinct
  questions. **[v2]** "while Penelope has a son like you" → **"such a fine
  son as you"**: *fine* is a compliment, not filler — this is Athena
  flattering a boy she is trying to embolden, immediately before she turns
  the conversation to the suitors (16.1).
- **B01-P017** — Telemachus's longest speech, and the Book's lowest word
  ratio (0.858 at v1). The reviewer diffed it clause by clause and ruled the
  paragraph **complete**: every claim is present and in Butler's order — the
  counterfactual death at Troy, the mound, the inherited renown, the
  storm-winds, the no-trace image, the "nothing but" inheritance, the
  escalation to a second kind of sorrow, all three islands by name plus
  Ithaca's own leading men, the pretext of courtship, and Penelope's double
  refusal. The shortfall is real syntactic compression of one 232-word
  Victorian sentence-chain. **[v2]** Two restorations, neither of them about
  length: "a burial mound" → **"a mound over his ashes"** (the cremation is
  the precise rite Telemachus is saying he was denied, and "burial mound"
  implies the opposite one — 17.2); and "nothing but grief" → **"nothing but
  dismay"** (Butler distinguishes *dismay* — bewilderment at a disappearance
  with no body and no rite — from the *grief* he names twenty words later as
  the thing the trouble does **not** end with; v1 used one word for both and
  the distinction vanished — 17.1).
- **B01-P018 → B01-P019** — **Butler's own quotation convention preserved**
  (ledger **D4**, confirmed at review, and unchanged by v2). Athena's speech
  beginning "Is that so?" runs through B01-P018 and continues into B01-P019
  as one uninterrupted speech; Butler does not close the quotation at the end
  of B01-P018, and B01-P019 opens with its own opening mark. The candidate
  reproduces this exactly rather than "fixing" it into two separately closed
  quotations, which would tell the reader that Athena stopped speaking and
  started again. It is the only unbalanced paragraph in either file, in both.
  See `../PUNCTUATION.md` §2 — including the reviewer's point that the
  convention must survive into the paginated reader for the same reason.
  Content kept in full: Ephyra, Ilus son of Mermerus, the poison-for-arrows
  request and its outcome, and the ten pieces of counsel in B01-P019 in
  Butler's order, including the conditional branch (twelve months' patience
  if the news is good; immediate return and the full sequence of rites if it
  is bad). **[v2]** "he would soon deal with these worthless suitors" →
  **"he would soon set about these villainous suitors"**: *lay his hands
  about* means to set about them physically, and "deal with" is a managerial
  euphemism that could as easily mean dismiss them — this is the line that
  plants Book 22; and *rascally* means villainous, not worthless. The
  reviewer's own first wording, "rascally", was declined as too light for a
  modern ear, which the reviewer offered as the alternative (18.1).
- **B01-P019** — **[v2, substantive]** "let your mother marry again" →
  **"give your mother in marriage again"**: Butler's "make your mother marry
  again" is an act Telemachus performs as head of the household, one of the
  concrete duties Athena loads onto him, and the one piece of the counsel
  that requires him to act against his mother's wishes; "let" turns a duty
  into permission (19.1). **[v2]** "make yourself a name" → **"make yourself
  a name in story"**: fame *in song* is what Athena has just held out by
  naming Orestes, whose praises people are singing two sentences earlier, and
  it is what the poem is about being (19.2).
- **B01-P020 – B01-P021** — the guest-gift exchange kept as the specific
  reciprocal convention (xenia) it is: the bath and rest offered first, then
  the keepsake, then the going on his way. **B01-P020 is byte-identical
  between v1 and v2.** **[v2]** at B01-P021, "Give me a fine one, and I will
  give you something of equal value in return" → **"You shall give me a fine
  one, and I will give you one of no less value in return"**: Butler's
  statement had become an imperative, and his litotes — which leaves open
  that a god's return gift will be *greater* — had become a flat "equal"
  (21.1, optional).
- **B01-P022** — "flew away like a bird into the air" kept as the literal
  image, unsoftened and unexplained: the reader is meant to be as unsure as
  Telemachus about what just happened. **Byte-identical between v1 and v2.**
- **B01-P023** — Penelope's entrance keeps every physical detail: the
  staircase, the two maids, the pillar, the veil, the weeping.
  "bearing-post" → "pillar" and "cloisters" → "gallery" applied consistently
  across B01-P010, B01-P023 and B01-P026. **[v2]** "the hardships Athena had
  laid on the Achaeans" → **"the sufferings…"** — see B01-P025 (23.1).
- **B01-P024** — the plea stays a direct plea; "middle Argos" → "central
  Argos", left unglossed because glossing Butler's obscure phrase would be
  commentary. **[v2]** "many other tales of gods and heroes" → **"many other
  deeds…"**: Butler's *feat* is the deed, the raw material, which is why
  Penelope can ask for a different one; "tales that poets sing" is circular
  and loses the distinction between what happened and what is sung — the
  distinction B01-P025 then argues about (24.1).
- **B01-P025** — the claim of household authority kept in full and
  unsoftened; it is a shocking line and it is meant to be. **[v2]** three
  changes. Butler's **`ills`** is now one word in both places — **"the
  sufferings Athena had laid on the Achaeans"** (B01-P023) and **"Singers do
  not create the sufferings they sing of"** (here) — because the two passages
  are about the same song, and using a different noun in each broke a chain
  the scene is built on (23.1). Butler's explicit contrast is restored: "it
  is Zeus, **not they**, who does it" — a boy defending a man in front of a
  hostile room, where the rhetorical shape of the defence is the repetition
  (25.1). And "the running of your maids" → **"the direction of your
  servants"**: Butler's word is *servants*, the house has men-servants, pages
  and a carver named earlier in this same Book, and the mistress's authority
  covers them (25.2). "your loom, your distaff" → "your loom and your
  spinning" stands: *distaff* is the tool, *spinning* the activity a modern
  reader recognizes without needing the tool's name.
- **B01-P026** — **[v2]** "taking her son's words to heart" → **"and kept her
  son's words in her heart"**: Butler's "laid her son's saying in her heart"
  is the Homeric formula for *pondering*, turning something over inwardly,
  where "take to heart" in modern English means *accept* it or be wounded by
  it. The formula recurs through the poem and now has its own row in
  `../GLOSSARY.md` (26.1, optional — applied because its real subject is a
  rule for twenty-three more Books).
- **B01-P027** — all three terms of the ultimatum stay distinct: feast
  tonight without brawling; assembly in the morning for formal notice;
  thereafter feast at one another's houses in turn at their own cost. The
  accounting metaphor is kept ("Zeus will settle the account with you in
  full"). **[v2]** "a voice as fine as Phemius's" → **"as divine as
  Phemius's"**: *divine* is the specific claim — the bard's gift is
  god-given, which is exactly what Telemachus argued two paragraphs earlier
  when he said Zeus, not the singers, sends what they sing about — and "fine"
  severs that link (27.1). The regrouping of Butler's split vocative here is
  recorded as a class in `../PUNCTUATION.md` §3 (R5).
- **B01-P028 – B01-P030** — Antinous's open contempt and Eurymachus's show of
  deference kept as two different suitor voices, not homogenized.
  **B01-P028 is byte-identical between v1 and v2 apart from Jove → Zeus.**
  **[v2]** at B01-P029, "I will be master in my own house, at least, and rule
  over those Odysseus won for me" → **"I will be chief in my own house, and
  rule those whom Odysseus won for me"**: *chief* is the word the whole
  exchange is fought over — Antinous wishes Telemachus never be **chief** in
  Ithaca; he answers that he will be **chief** if he can, that it is no bad
  thing to be a **chief**, and then turns it: whatever happens outside, he
  will be **chief in his own house**. Four uses of one word, and v1 rendered
  the fourth as "master", which both drops the retort and collides with
  B01-P030, where Butler genuinely does write *master* in Eurymachus's mouth.
  The public title and the domestic one are now kept apart, as Butler keeps
  them; "at least" was an addition and goes with the fix (29.1). **[v2]** at
  B01-P030, "you shall **certainly** be master" → **"you shall be master"**:
  Butler's flat "you shall be" is already a guarantee, and the intensifier
  made Eurymachus warmer than he is, blurring the very distinction from
  Antinous the scene depends on (30.1).
- **B01-P031** — the dramatic irony left to do its own work, with no added
  signalling ("But in his heart he knew it had been the goddess"). **[v2]**
  "even **when** some rumor reaches me" → **"even **if**"**: Butler's is a
  concessive condition — he would not believe one *even supposing* one came —
  and v1 turned it into a statement that rumours do in fact arrive, which
  also weakens the next sentence, where the soothsayer is introduced as the
  thing that *does* happen (31.1).
- **B01-P032** — the closing scene keeps every concrete detail: the pair of
  blazing torches, the twenty oxen, Eurycleia's purchase and Laertes's
  respect, the reason he never took her to his bed, her nursing of
  Telemachus, the folded shirt, the peg by the bedside, the silver catch, the
  bolt drawn home by its strap, the fleece. The aside about Laertes's fear of
  his wife's resentment is kept, not trimmed as incidental. **[v2]** "looking
  out over the courtyard" → **"over the outer court"**: the *outer* court is
  a specific part of a Homeric house — the one the suitors feast in, the one
  Odysseus bars the doors of in Book 22 — and it is distinguished from the
  inner rooms Penelope withdraws to (32.1). **[v2]** `woollen` → **`woolen`**,
  the one British survivor in an otherwise American-spelled candidate (R2).
  **[v2]** Euryclea → **Eurycleia**, and **Ops is untouched**.

## Nothing imported from other translations

No wording was taken from any translation other than Butler's. Book 1's
opening lines are among the most frequently retranslated passages in English;
the candidate's "Tell me, Muse, about that resourceful hero" was built from
Butler's own "Tell me, O Muse, of that ingenious hero", not from memory of
any other translation's famous opening. The round-1 reviewer looked for the
tell — clusters of vocabulary Butler does not use, or a famous phrase
arriving intact — and found **no import anywhere in the 32 paragraphs**.
Fagles, Lattimore, Wilson and Fitzgerald were not read by the drafter or by
the reviewer.

The Greek name forms are **not** an import from another translation: they are
the product's own forms, taken from `odyssey-threads.json` and
`odyssey-onboarding`, and the mapping was applied mechanically from a closed
table (`../GLOSSARY.md`).

## Unresolved source issues (Butler's text)

1. **B01-P014 — a genuine source crux, and the candidate resolves it.**
   *(Added at step 6, records finding **R3**; v1 of this file stated that
   Book 1 contains no defective source sentence, and it contains this one.)*
   Butler prints, with no comma and ungrammatically:
   `for he is not dead yet not on the mainland.` Verified directly at PG
   #1727 line 538 and in the served original — it is not a transcription slip
   in the staged file. Two readings are available:
   - *adversative*: "he is not dead, **yet** not on the mainland" — he is
     alive, **but** he is not on land;
   - *temporal*: "he is not dead, and **not yet** on the mainland" — which is
     what v1 chose, silently.

   **The adversative reading is taken**, because the very next sentence draws
   the inference: *It is more likely he is on some sea-girt island in mid
   ocean.* That follows from *not on the mainland*; it does not follow from
   *not yet on the mainland*, which would instead imply he is on his way —
   and would have Mentes assert an itinerary he explicitly disclaims
   knowledge of two sentences later ("I am no prophet"). v2 reads
   **"for he is not dead, and yet he is not on the mainland."** The sentence
   stays slightly awkward because the source is; making it smooth would be
   choosing a reading the source does not settle.
2. **B01-P018 — Butler's unclosed quotation mark** at a paragraph break
   within one continuous speech. **Not a defect**: it is his printing
   convention, and it is preserved. See B01-P018 → B01-P019 above, ledger
   **D4**, and `../PUNCTUATION.md` §2.
3. **No other corrupted, truncated, or mid-sentence source paragraph** was
   found in Book 1: all 32 source paragraphs are complete passages ending in
   terminal punctuation, apart from item 2.
4. **No footnote markers, editorial brackets, or Gutenberg apparatus** appear
   inside Book 1's paragraphs. The round-1 reviewer audited this
   independently and found the range's **only** apparatus class to be
   **bare-digit footnote references glued to the text** — sixteen of them in
   Book 1 (`Temesa4`, `middle Argos.”9`, `mine above all others 10—for it is
   I`, `cloisters11,`) — all correctly stripped, with no doubled space and no
   orphaned dash left behind. Each is a place a sloppy rule leaves visible
   damage; the one inside B01-P025 was checked specifically.
5. **The staged `original-en` preserves PG's hard line wraps** as literal
   newlines inside every paragraph; the candidate contains **no newlines at
   all**, matching the served `modern-en` and `modern-da`, which have zero
   across all 1,027 paragraphs. The difference between the two files is
   correct, not a defect, and is asserted by the build.

## What the frozen v1 artefacts still are

`candidate-v1.json`, `candidate-v1-readable.md` and `review-packets/` are
**not regenerated** with the Greek names. They are the record of what round 1
actually reviewed, and rewriting them would make the findings file cite text
that no longer exists. `candidate-v2.json` and `candidate-v2-readable.md`
carry the accepted text. `review-instructions.md` keeps the wording the
round-1 reviewer was actually given, with a dated note at its head marking
the naming paragraph superseded for any later round.
