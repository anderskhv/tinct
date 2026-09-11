# Continuity sheet — the Odyssey, Book 1 (candidate v1, frozen)

Written alongside drafting `candidate-v1.json`. Describes what the frozen
draft actually did. Name forms follow `../GLOSSARY.md` (naming decision:
Butler's own Roman forms, not Greek).

## Source

- `../../../../app/public/data/editions/odyssey-original-en.json`, chapter
  `number: 1`, title "Book 1 — The gods in council—Minerva's visit to
  Ithaca—the challenge from Telemachus to the suitors", 32 paragraphs.
  Extracted verbatim into `source-book1.json` (sha256 in `provenance.json`).
- Samuel Butler, 1900, PG #1727. See `../PROVENANCE.md` for identification
  and rights.
- Book 1 was read in full before any paragraph was drafted: the invocation
  to the Muse; the council of the gods and Jove's exchange with Minerva
  about Ulysses; Minerva's descent to Ithaca disguised as Mentes; her
  reception by Telemachus and the meal; Telemachus's complaint about the
  suitors; Minerva's questions and her account of "Mentes"; her counsel to
  Telemachus (call an assembly, go to Pylos and Sparta for news, deal with
  the suitors); her departure; Phemius's song and Penelope's grief;
  Telemachus's rebuke of his mother and of the suitors; the suitors'
  reactions (Antinous, Eurymachus); and Telemachus retiring for the night
  with Euryclea.

## Names met in Book 1, and how they were rendered

All kept exactly as Butler has them (`../GLOSSARY.md`'s naming decision):
Ulysses, Minerva, Jove, Neptune, Mercury, Saturn (as "son of Saturn," an
epithet for Jove), Telemachus, Penelope, Calypso, Ithaca, Ethiopians,
Aegisthus, Agamemnon, Orestes, Atlas, Polyphemus, Cyclopes, Thoosa, Phorcys,
Ogygian (island)/Ogygia, Achaeans, Sparta, Pylos, Mentes, Taphians, Temesa,
Rheithron, Neritum, Laertes, Phemius, Icarius, Hellas, Argos, Danaans,
Ephyra, Ilus, Mermerus, Dulichium, Same, Zacynthus, Antinous, Eupeithes,
Eurymachus, Polybus, Euryclea, Ops, Pisenor, Hyperion, Argives, Menelaus,
Nestor.

## Paragraph-level decisions

- **P00 (invocation)** — "ingenious hero" → "resourceful man" (Butler's
  "ingenious" now reads as clever-in-a-narrow, mechanical sense; the Greek
  behind it is the same root as Ulysses's defining trait of resourcefulness,
  which "resourceful" states plainly); "sacked the famous town of Troy" →
  "sacked the famous city of Troy" ("town" now undersells Troy); "Tell me,
  too, about all these things" → "Tell me about all this too" (tightened,
  no content dropped); "from whatsoever source you may know them" →
  "whatever part of it you know" (Butler's "source" here means "however you
  came to know it," not a citation; "whatever part of it" keeps the
  hedge — the Muse may know all of it or only part).
- **P01** — "So now all who escaped death in battle or by shipwreck had got
  safely home except Ulysses" restructured as "By now, everyone else...had
  made it safely home—everyone except Ulysses," moving "Ulysses" earlier
  for a modern reader's parsing while keeping the contrast Butler's sentence
  makes (everyone else vs. Ulysses); "detained by the goddess Calypso, who
  had got him into a large cave and wanted to marry him" kept as three
  distinct facts (she detains him; the cave; her wish to marry him), not
  merged or dropped.
- **P02** — "the sire of gods and men" → "the father of gods and men"
  (glossary row: fixed epithet for Jove, used every time it recurs); "a
  hecatomb of sheep and oxen" → "an offering of a hundred sheep and oxen"
  (glossary D3: folded, not kept as a term needing its own gloss, since
  Book 1 does not use "hecatomb" again).
- **P03** — Aegisthus's story condensed slightly ("he must needs make love
  to Agamemnon's wife unrighteously" → "he had to go and seduce Agamemnon's
  wife") but every step kept: the seduction, the murder, Jove's warning via
  Mercury, Orestes's coming revenge, Aegisthus's refusal to listen, and the
  final "paid for it all in full."
- **P04** — Minerva's fixed address, "Father, son of Saturn, King of kings"
  → "Father, son of Saturn, king of kings" (glossary row; lower-cased "king"
  to match modern sentence style, "Saturn" kept capitalized as a name); "a
  goddess lives there, daughter of the magician Atlas, who looks after the
  bottom of the ocean, and carries the great columns that keep heaven and
  earth asunder" → "...daughter of the magician Atlas, who knows the depths
  of every sea and holds up the great columns that keep heaven and earth
  apart" (both of Atlas's attributes kept: knowledge of the sea's depths,
  and holding up the pillars); "blandishment" → "flattery"; "the smoke of
  his own chimneys" kept as the concrete image it is, not generalized to
  "home."
- **P05** — Jove's reply: "than whom there is no more capable man on
  earth" → "the most capable man on earth" (same claim, modern syntax);
  Polyphemus's parentage (son of Neptune by the nymph Thoosa, daughter of
  the sea-king Phorcys) kept in full, not trimmed — this genealogy matters
  for why Neptune specifically is angry.
- **P06** — Minerva's plan: the three actions kept distinct and in order
  (send Mercury to Calypso; go herself to Ithaca to embolden Telemachus;
  take him to Sparta and Pylos for news) — nothing merged or reordered.
- **P07** — Minerva's arming and descent: "imperishable" kept as a
  qualifier on the sandals (not dropped as decorative); "redoubtable
  bronze-shod spear" → "formidable bronze-tipped spear" (both physical
  facts — bronze, and its formidable weight/strength — kept); the suitors'
  scene (hides of oxen, draughts, servants mixing wine, wiping tables,
  carving meat) kept as a full inventory of actions, not summarized.
- **P08** — "vexed that a stranger should be kept waiting for admittance" →
  "annoyed that a stranger should be left waiting to be let in" (Telemachus's
  motive for going to the gate himself, kept as a stated reason, not
  dropped).
- **P09** — kept Butler's own pronoun assignment exactly: "that she might
  not be annoyed... and that he might ask her more freely" (Minerva as
  "she," Telemachus as "he") — this is easy to garble by assuming both
  clauses share a subject; checked against the source word for word.
- **P10–P11** — the sequence of servants and their specific tasks (ewer,
  basin, table; bread and food; carver and meats; wine) kept as discrete
  actions in Butler's order, not collapsed into a general "they were served
  a meal."
- **P12** — Telemachus's aside to Minerva: "Singing comes cheap to those
  who do not pay for it" kept as the bitter aphorism it is, not softened;
  "grinding to powder in the surf" kept as the specific, grim image (bones
  literally being worn down by the sea) rather than generalized to "lost at
  sea."
- **P13** — Minerva/Mentes's long speech (the longest single paragraph in
  the Book, 327 words): every biographical claim kept — Mentes's
  parentage and kingship, the voyage's cargo (iron out, copper back), the
  ship's exact location (harbor Rheithron, under Neritum), the friendship
  with Laertes, Laertes's present isolation and his old woman housekeeper,
  the report that Ulysses was thought home, Mentes's disclaimer of prophetic
  skill alongside his confident prediction, and the final personal note
  about resemblance and old friendship. Ratio for this paragraph is 0.94 —
  close to 1:1 despite the sentence restructuring.
- **P14** — "it is a wise child that knows his own father" kept as Butler's
  proverb, not modernized into a different saying.
- **P15** — Minerva's questions about the feast kept as a run of distinct
  questions (what is this feasting, who are these people, banquet or
  wedding, why does no one bring provisions), not compressed into one
  question.
- **P16** — Telemachus's longest speech in the Book (232 words; the
  paragraph with the lowest word ratio, 0.858, B01-P017 by review-packet ID
  since packet IDs are 1-indexed against 0-indexed source array positions —
  see `00-progress-ledger.md` "Open, not blocking"). Every claim kept: the
  counterfactual (better if he'd died at Troy, with a mound and inherited
  renown), the "no trace" image, the naming of the three island chiefdoms
  (Dulichium, Same, Zacynthus) plus Ithaca's own leading men, and Penelope's
  refusal either to remarry or refuse outright. Long chained clauses split
  into several modern sentences without dropping any clause's content.
- **B01-P018–B01-P019** — **Butler's own quotation convention preserved.**
  In the source, Minerva's speech beginning "Is that so?" runs through
  source paragraph index 17 (B01-P018) and continues into index 18
  (B01-P019) as the same uninterrupted speech; Butler does not close the
  quotation mark at the end of index 17, and index 18 opens with its own
  opening quotation mark. The candidate reproduces this exactly (no
  closing quotation mark ends B01-P018's text; B01-P019's text opens with
  one) rather than
  "fixing" it into two separately closed and opened quotations, which would
  misrepresent that this is one continuous speech split only by a paragraph
  break. Content: Ephyra, Ilus son of Mermerus, the poison-for-arrows
  request and its outcome, and the full ten-point counsel that follows in
  B01-P019 (call assembly; dismiss the suitors; give Penelope's remarriage back
  to her father's household with dowry; take a ship and crew of twenty; go
  to Pylos then Sparta; the wait-twelve-months-or-act-on-news branching
  instruction; the Orestes comparison) are all kept as distinct pieces of
  advice in Butler's order.
- **P19–P20** — Telemachus's offer of a guest-gift and Minerva's answer
  (decline now, collect later, an equally valuable gift in return) kept as
  the specific reciprocal-gift exchange it is — a concrete social
  convention (xenia), not generalized to "she said goodbye."
- **P21** — "flew away like a bird into the air" kept as the literal image
  of Minerva's departure (not softened to "she left" or "vanished").
- **P22** — Penelope's entrance: the staircase, the two handmaids, the
  bearing post, the veil, the weeping — every physical detail of the
  scene kept.
- **P23** — Penelope's request to Phemius kept as a direct plea, not
  summarized; "whose name was great over all Hellas and middle Argos" kept
  as the specific geographic claim about Ulysses's fame, not generalized to
  "famous everywhere."
- **P24** — Telemachus's rebuke of his mother: the claim that Jove, not the
  bards, makes the ills men suffer is kept as the argument it is (a defense
  of Phemius's choice of song); "your loom, your distaff" → "your loom and
  your spinning" (distaff is the specific tool for spinning thread by hand;
  "spinning" names the activity a modern reader recognizes without needing
  the tool's name); the closing claim of household authority ("speech is
  man's matter... I am master here") kept in full, not softened.
- **P25** — Penelope's silent withdrawal and the suitors' clamor kept as
  two parallel actions in the same paragraph, in Butler's order.
- **P26** — Telemachus's public warning to the suitors: the specific
  proposal (feast tonight without brawling; tomorrow's assembly; feast at
  their own houses in turn, at their own cost, if they refuse to leave) kept
  as three distinct terms, not blurred into a general "he told them to
  behave."
- **P27–P29** — Antinous's mocking reply and Eurymachus's more measured
  one kept as two different suitor voices with two different tones (open
  contempt vs. a show of deference while asking pointed questions about the
  stranger) — not homogenized into one generic "suitor" response.
- **P30** — Telemachus's answer to Eurymachus and the narrator's aside ("But
  in his heart he knew that it had been the goddess") kept as the dramatic
  irony it is — the reader knows what Telemachus does not fully register.
- **P31** — The closing scene (Telemachus's tower room, Euryclea's history
  with Laertes, the torches, the folded shirt, the silver catch and bolt,
  Telemachus's night of thought) kept as a full sequence of concrete detail,
  including the aside about Laertes not taking Euryclea to his bed for fear
  of his wife's resentment — a small but specific fact about the household,
  not trimmed as incidental.

## Nothing imported from other translations

No wording was taken from any translation other than Butler's. Book 1's
opening lines are among the most frequently retranslated passages in
English (Fagles's "Sing to me of the man, Muse," Fitzgerald's "Sing in me,
Muse," Wilson's "Tell me about a complicated man," and others); the
candidate's "Tell me, Muse, about that resourceful man" was built from
Butler's own "Tell me, O Muse, of that ingenious hero," not from memory of
any other translation's famous opening. Proper names are Butler's own forms
throughout (see `../GLOSSARY.md`).

## Unresolved source issues (Butler's text)

- No corrupted, truncated, or mid-sentence source paragraphs were found in
  Book 1. All 32 source paragraphs are complete sentences/passages ending in
  terminal punctuation, except source paragraph index 17 / B01-P018 (Butler's own
  un-closed quotation mark at a paragraph break within one continuous
  speech — see B01-P018–B01-P019 above; this is Butler's printing convention, not a
  defect).
- No footnote markers, editorial brackets, or Gutenberg apparatus were found
  inside Book 1's paragraphs (unlike the Book 10 pilot's note about
  bracketed editorial insertions "[to be milked]" / "[to feed]" in its
  chapter — none of that kind appears in Book 1).
