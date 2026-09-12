# The Peloponnesian War character package — IN PROGRESS

**Books 1–3 (chapters 1–11, paragraphs 1–362) are authored. Chapters 12–26 are
not.** Status stays `in-progress` and the package must not be integrated until
all eight of Thucydides's books are covered.

Current state: 440 entities authored, all 440 bound in both editions, 5,824 and
5,885 exact mentions. Of those, 946 and 975 fall inside Book 1's chapters, 731
and 740 inside Book 2's, and 816 and 824 inside Book 3's; the rest are the
nation cards, which are bound through all twenty-six chapters because a people
is the same people in every book. Content revision 2026-09-12.3.

## What is hard about this book, and what is not

Not the spelling. Both editions are Crawley, and unlike almost every other
package in this library **the transliterations are the same in both** — no
Kyros/Cyrus, no Peisistratos/Pisistratus. The two editions differ in sentence
rhythm and in how often a pronoun gets resolved to a name, which is why the
mention counts differ by about one percent and are reported per edition.

What is hard is namesakes, and Thucydides is worse than he looks because he
introduces men by patronymic once and then uses the bare name for the rest of a
campaign. Book 1 alone has:

| Entity | Where | Against |
|---|---|---|
| `thucydides` / `thucydides-samos` | 1:0 / 4:20 | the author, and a commander at the siege of Samos given no patronymic and never said to be him |
| `aristeus-pellichas` / `aristeus-adimantus` | 2:4 / 2:30–2:33 | Pellichas's son, beaten off Epidamnus, and Adimantus's son, who commanded at Potidaea — twenty-six paragraphs apart in one chapter |
| `callias-father-of-callicrates` / `callias-calliades` | 2:4 / 2:31–2:32 | a Corinthian named in the same sentence as Aristeus the admiral, and the Athenian general killed at Potidaea |
| `pausanias-macedon` / `pausanias-sparta` | 2:31 / 4:4–5:21 | the Macedonian whose horse rode with Philip's on the Athenian side, and the Spartan regent |
| `cyrus` | 1:13, 1:15 | the King's son who paid for the Peloponnesian navy (7:20), who is not authored and carries no card |
| `darius` | 1:13, 1:15 | Darius son of Artaxerxes of Book 8 |
| `hippias` | 1:19 | Hippias the Arcadian commander of Book 3 |
| `pisistratus` | 1:19 | Pisistratus son of Hippias, the tyrant's grandson and archon, of Book 6 |

## Book 2's namesakes

| Entity | Where | Against |
|---|---|---|
| `chrysis-argos` / `chrysis-father-of-eumachus` | 6:1 / 6:33 | the priestess of Hera at Argos by whose year of office Thucydides dates the war, and a Corinthian commander's father |
| `timocrates-corinth` / `timocrates-sparta` | 6:33 / 8:14, 8:21 | Timoxenus's father, and the commissioner who killed himself when his ship went down off Naupactus |
| `callimachus-father-of-learchus` / `callimachus-father-of-phanomachus` | 7:22 / 7:25 | two fathers three paragraphs apart |
| `nicias-father-of-hagnon` / `nicias-gortys` | 7:13 / 8:14 | Hagnon's father, and the Cretan of Gortys who diverted twenty ships to Crete — neither of them the Nicias son of Niceratus who fills the later books and is not yet authored |
| `teres` / `tereus` | 6:31 | Sitalces's father and the king of the nightingale story, whom Thucydides is at pains to separate: different part of Thrace, different name |
| `pythodorus`, `tellis`, `clinias`, `evarchus`, `euphamidas`, `aristonymus`, `timagoras-tegea`, `pharnabazus`, `lycophron` | Book 2 only | later men of the same name, in books not yet read |

Seven cards cross from Book 1 into Book 2 and are enriched rather than
duplicated — Pericles, Archidamus, Perdiccas, Phormio, Pleistoanax, Hagnon and
Aristeus of Potidaea — each with a gated update, and a test asserts that each
appears in both halves on one card. The Plataeans, who are not named in Book 1
at all, are cast here.

## Book 3's namesakes

| Entity | Where | Against |
|---|---|---|
| `asopius` / `asopius-son-of-phormio` | 2:33 / 9:6 | Phormio's father, and the son the Acarnanians insisted on because they would take no commander not of his family |
| `pausanias-macedon` / `pausanias-sparta` / `pausanias-king` | 2:31 / 4:4–10:18 / 9:25 | three men: the Macedonian, the regent of Plataea, and Pleistoanax's boy son |
| `nicias-father-of-hagnon` / `nicias-gortys` / `nicias-niceratus` | 7:13 / 8:14 / 10:0, 11:4 | three men, the third of them the Nicias of the rest of the war |
| `callias-father-of-callicrates` / `callias-calliades` / `callias-father-of-hipponicus` | 2:4 / 2:31 / 11:4 | three men |
| `timocrates-corinth` / `timocrates-sparta` / `timocrates-father-of-aristotle` | 6:33 / 8:14 / 11:24 | three men |
| `tolmides` / `tolmides-soothsayer` | 4:13, 4:17 / 9:19 | Tolmaeus's son, and Theaenetus the Plataean soothsayer's father |
| `cleomenes` / `cleomenes-commander` | 5:7 / 9:25 | the Lacedaemonian who drove out the accursed, and the regent for the boy king |
| `lysicles` / `lysicles-general` | 4:1 / 9:18 | Abronichus's father, and the general killed on the Meander |
| `hippias` / `hippias-arcadia` | 1:19 / 9:33 | the tyrant, and the Arcadian commander Paches trapped by a safe-conduct |
| `pythodorus` / `pythodorus-isolochus` | 6:1 / 11:33 | the archon of the year the war began, and the general sent to relieve Laches |
| `thucles` / `procles` / `leon-heraclea` / `dorieus` | Book 3 only | later men of the same name, in books not yet read |
| `locrians` / `locrians-italy` | passim / 10:36, 11:13, 11:17, 11:33 | the Ozolian and Opuntian Locrians of Greece, and the Epizephyrian Locrians who were for Syracuse |

**The river Eurymedon is water.** Book 1 fights a battle "at the river
Eurymedon"; Book 3's Eurymedon is Thucles's son, the general who lay seven days
off Corcyra while the city butchered itself. The river carries no card, and a
test pins it.

**Xenoclides is one man under two spellings.** Both editions print Xenoclides at
2:21 and Xenocleides at 11:32, in each case son of Euthycles and in each case a
Corinthian commander. One card, two aliases.

## How the unauthored books are handled

The rule is this. A name that **has a namesake anywhere in the work** is bound
by a position table keyed only to the chapters that have been authored, so that
its later occurrences carry no card at all rather than the wrong one. A name
that is **single-referent across the whole work** — Brasidas, Archidamus,
Perdiccas, Phormio, Pericles, Sitalces, Cleon, Demosthenes, Laches — is bound by
alias and therefore appears in chapters that have not been authored yet, with a
card that says only what the authored chapters support. Every table has `None`
for its default; there are 54 of them. Where the later man has not been read at
all, the name is table-keyed anyway, because a coverage number is not worth a
wrong card.

The nations are the opposite case and are bound by alias throughout, because the
Athenians of chapter 26 are the Athenians of chapter 1. A test pins both halves
of that rule: `athenians` appears in all twenty-six chapters, `cylon` in none
after chapter 5.

## Editorial checks — Book 1

**1. Namesakes.** The eight in the table above, each pinned by a test.

**2. Person or not.** Cities, rivers, mountains, seas and countries are excluded,
which in Thucydides removes most of the proper nouns in the narrative — Athens,
Corinth, Corcyra, Potidæa, Epidamnus, Lacedaemon, Mycenæ, Ithome, Sybota,
Leukimme and the rest are places and carry no card, while the peoples of them
do. Four judgement calls:

- **Adjectival forms of peoples are bound**: *the Athenian ships*, *the
  Corinthian garrison*, *the Median War*. This follows the Histories package,
  which binds *Median* to the Medes.
- **A war named after a people is that people.** *The Median War*, *the Persian
  War* and *the Peloponnesian War* all carry the card of the people they are
  named for. The alternative — excluding them — would have meant treating
  Thucydides's own title differently from Herodotus's Median War, for no gain to
  a reader.
- **But the Hellenic sea is water.** `Hellenic` is bound to the Hellenes by
  default with one lookahead exclusion, because at 1:3 it is the name of a body
  of water. The older translation writes *Hellenic sea* and the modern one
  *Hellenic Sea*, so the exclusion has to allow for both — which the first
  version of it did not, and a test caught.
- **The Argilians** are cast as a people although the only person the name
  refers to is one man: Thucydides calls Pausanias's courier "an Argilian" and
  never gives him a name.

**3. Mythological figures.** The archaeology of chapter 1 is cast as what it is:
Minos, Agamemnon, Pelops, Atreus, Eurystheus, Perseus, Tyndareus, Hellen,
Deucalion, Philoctetes and Leos are `mythological-figure`, with cards that say
what each is doing in Thucydides's argument about the weakness of early times
rather than retelling the myth. Homer is cast as a person, because Thucydides
treats him as a witness to be cross-examined.

**4. Ambiguous references.** Left unbound: the **Argilian** courier and the
**master of the merchantman** who hid Themistocles, both nameless; the
**goddess of the Brazen House**, whom Thucydides never names; and every name in
chapters 6–26 belonging to a person this pass has not authored.

**5. Spot-read and sweep.** Fifty-four mentions drawn at random — ten per
edition for Book 1, nine for Book 2 and eight for Book 3 — read back against
their paragraphs: all correct. The unbound-tabled-names audit over each
authored range comes back with one line, the Cyrus of 7:20, who is the King's
son and belongs to a book that has not been read. The adjacency sweep over every
Book 1 mention whose matched text abuts a capitalised word produced a hundred
and eighty-seven hits and no mis-binding — sentence-initial *The Athenians*,
cult titles like *the Delian Apollo* and *Zeus Meilichios*, *King Xerxes*, *the
Ozolian Locrians*, *the Opuntian Locrians* — and it is what turned up the
lowercase *Hellenic sea*.

**6. Both editions independently.** No entity is missing from either edition,
which is the first package in this library where that is true of a work this
size. The mention counts still differ (4,435 against 4,489), almost entirely
because the modern edition resolves pronouns the older one leaves standing.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The older translation misprints three names: **Bradidas** for Brasidas at 8:14, **Amphiraus** for Amphiaraus at 8:32, and **Antichus** for Antiochus at 8:9. All three are spelled correctly in the modern edition and elsewhere in the older one. | Carried as aliases so the mentions still bind, and pinned by a test so that nobody later "fixes" the aliases away. Not repaired: editing them would move every offset after them. |
| Both editions print the æ ligature inconsistently: **Potidæa** and **Mycenæ** always, but **Aegina** and **Aeginetans** never, and **Æthæans** in one edition against **Aethaeans** in the other. | Carried as aliases. Not repaired: editing a ligature moves every UTF-16 offset after it and invalidates this package's hashes. |
| The older translation writes **Hellenic sea** at 1:3 where the modern writes **Hellenic Sea**. | Handled in the binder's lookahead, which allows both cases. |
| The older translation names the **Tanagraeans** at 4:13 where the modern writes "the walls of Tanagra". | One mention in one edition. The people are bound in both editions from their later chapters, so nothing is omitted. |
| The modern edition writes **Greeks** once, at 1:11, where the older writes **Hellenes**; and resolves a pronoun to the name it stands for in a handful of places — *Aristeus*, *Pausanias*, *Pericles*, *Hagnon*. | Carried as an alias on the Hellenes. It is the main reason the two editions' mention counts differ. |

No edition byte was touched.

## Remaining work

- **Chapters 12–14** (Thucydides's Book 4): Pylos and Sphacteria, Delium,
  Brasidas in Thrace, the fall of Amphipolis. Demosthenes, Cleon, Nicias,
  Eurymedon, Sophocles, Pythodorus, Agis, Nicostratus, Laches, Thucles, Procles,
  Leon, Salynthius, Clinias, Euphamidas, Aristonymus, Lycophron, Tellis and the
  nations all have recurrences there; the table-bound ones are currently unbound
  and must be keyed in.
- **Chapters 15–26** after that, one of Thucydides's books per pass.
- The person tables extended as each book is authored, and the `None` defaults
  replaced only where the later man is actually carded.
- The six editorial checks re-run over the whole work, and a fresh spot-read.

## Validation

`python3 books/characters/build_peloponnesian_war.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Thirty-two
focused tests so far. No edition changes, no network generation, no API spend:
every card here was written in the authoring conversation and committed as a
file.
