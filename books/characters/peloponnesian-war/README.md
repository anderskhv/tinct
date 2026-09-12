# The Peloponnesian War character package — IN PROGRESS

**Books 1–5 (chapters 1–17) are authored. Chapters 18–26 are not.** Status stays
`in-progress` and the package must not be integrated until all eight of
Thucydides's books are covered.

Current state: 626 entities authored, all 626 bound in both editions, 6,518 and
6,589 exact mentions. Of those, 947 and 976 fall inside Book 1's chapters, 736
and 745 inside Book 2's, 827 and 832 inside Book 3's, 1,085 and 1,091 inside
Book 4's, and 1,115 and 1,129 inside Book 5's; the rest are the nation cards,
which are bound through all twenty-six chapters because a people is the same
people in every book. Content revision 2026-09-12.5.

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

## Book 4's namesakes

Book 4 is where the pile-up starts. Three men called Aristeus, two called
Aristonymus three paragraphs apart in the same list, and a whole group of
patronymics — Hermon, Eucles, Hegesander, Archias — that belong to somebody else
in a chapter nobody has read yet.

| Entity | Where | Against |
|---|---|---|
| `aristeus-pellichas` / `aristeus-adimantus` / `aristeus-lacedaemon` | 2:4 / 2:30–7:22 / 14:67 | three men, the third a Lacedaemonian inspector sent out to Brasidas |
| `aristonymus` / `aristonymus-athens` | 6:33, 14:54 / 14:57 | Euphamidas's father signs the armistice; the Athenian commissioner who carried it round refuses to include Scione three paragraphs later |
| `theagenes` / `theagenes-athens` | 5:7 / 12:34 | the tyrant of Megara, and the Athenian chosen with Cleon to go and look at Pylos |
| `aristides` / `aristides-archippus` | 4:1 / 13:8, 14:0 | Lysimachus's son on the embassy about the wall, and Archippus's son who arrested Artaphernes |
| `tolmaeus` / `tolmaeus-father-of-autocles` | 4:13, 4:17 / 13:11, 14:54 | Tolmides's father and Autocles's father. **The history never identifies them**, so neither card does |
| `lycophron` / `lycophron-corinth` | 8:14 / 13:1, 13:2 | the Lacedaemonian commissioner sent to Cnemus, and the Corinthian general killed at Solygia |
| `hippocrates-ariphron` | 13:24–14:25 | against the tyrant of Gela at 18:4 and the Lacedaemonian of Book 8, both unbound |
| `hermon` | 13:16 | against the Hermon who commands the Peripoli at Munychia in Book 8 |
| `eucles` | 14:30 | against the Syracusan general elected in Book 6 |
| `hegesander` | 14:67 | against the Thespian commander of Book 7 |
| `archias-camarina` | 12:32 | against the Corinthian who founded Syracuse, at 18:2 |
| `diitrephes` | 10:25, 13:11, 14:54, 14:64 | Nicostratus's father only. The Diitrephes who takes the Thracians home in Books 7 and 8 is **never said to be the same man** and carries no card |
| `chalcidians` / `chalcidians-sicily` | Thrace / 10:36, 12:32, 13:19, 13:22 | Brasidas's allies on the Thracian seaboard, and the Ionian Chalcidian race Hermocrates argues about at Gela |
| `orchomenians-boeotia` | 14:17 | against the Arcadian Orchomenians of Book 5 |
| `locrians` / `locrians-italy`, singular `Locrian` | 11:2, 11:4, 11:11 / 11:33, 12:0 | the singular had been left uncovered through Book 3; it is split now on the same keys as the plural |

**Nicostratus's father under two spellings.** *Diotrephes* at 13:11, *Diitrephes*
at 10:25, 14:54 and 14:64, in each case the father of the same general. One
card. The plain spelling has to be a table because of the later commander, so
the variant carries the alias and the table carries the rest.

**Seuthes's father under two spellings.** *Spardacus* at 8:31, *Sparadocus* at
14:27. One card, two aliases.

**Thucydides appears in his own history as a man who lost a city.** At 14:30 he
is named with his father and with the gold-mining rights that gave him influence
on that coast, and he sails from Thasos too late for Amphipolis and just in time
for Eion. The `thucydides` table carries those four paragraphs as well as the
year-end signatures at 13:9 and 14:70.

## Book 5's namesakes

Book 5 prints two lists of thirty-four names — the seventeen Lacedaemonians and
seventeen Athenians who swore to the Peace of Nicias, and the same men again for
the alliance — with **no patronymics at all**. A dozen of those names belong to
somebody else elsewhere in the work. The rule applied is the one this package
already uses for the Thucydides at Samos: where the list cannot be tied to a
known man, the signatory gets his own card and the card says what the history
does not say.

| Entity | Where | Against |
|---|---|---|
| `euthydemus-signatory` | 15:26, 15:35 | the Euthydemus who commands in Sicily, at 21:17 and 23:20 |
| `thrasycles-signatory` | 15:26, 15:35 | the Thrasycles of Book 8 |
| `aristocrates-signatory` | 15:26, 15:35 | the general of 24:9 and Scellias's son of 26:9 |
| `procles-signatory` | 15:26, 15:35 | Theodorus's son, who was killed in Aetolia — so this one cannot be him |
| `pythodorus-signatory` | 15:26, 15:35 | the archon of 6:1 and Isolochus's son; no way to tell which |
| `tellis-signatory` | 15:26, 15:35 | Brasidas's father. Standard history says they are the same man; Thucydides does not, and the card says so |
| `timocrates-athens` | 15:26, 15:35 | three earlier Timocrateses, none Athenian |
| `leon-athens` / `leon-sparta` / `leon-heraclea` | 15:26, 15:35 / 16:21 / 11:5 | three men in the authored range, and more in Books 6 and 8 |
| `theagenes-athens` | 12:34, 15:26, 15:35 | the tyrant of Megara |
| `acanthus-signatory` | 15:26, 15:35 | the Andrian colony of the same name, which is a place and carries no card |
| `damagetus` (Damagetis / Damagetus) | 15:26 / 15:35 | one man, spelled two ways in the two lists |
| `isthmonicus` (Isthmonicus / Isthmionicus) | 15:26 / 15:35 | likewise |

Outside the lists:

| Entity | Where | Against |
|---|---|---|
| `aristocles-brother-of-pleistoanax` / `aristocles-polemarch` | 15:14 / 16:56, 16:57 | the king's brother, and the polemarch banished for not filling the gap at Mantinea |
| `xenares` / `xenares-cnidis` | 16:11–16:22 / 16:37 | the ephor who kept the Boeotian alliance, and Cnidis's son killed at Heraclea. **Not identified with each other** |
| `clinias-father-of-alcibiades` | 16:19, 16:38 | Cleopompus's father |
| `lycomedes-father-of-cleomedes` | 17:0 | Archestratus's father |
| `pharnaces-satrap` | 15:0 | Artabazus's father |
| `orchomenians-arcadia` / `orchomenians-boeotia` | 16:47, 16:64 / 14:17 | two towns called Orchomenos and two peoples called Orchomenians |

**Ramphias is the one identification this pass does make.** The envoy who brings
the ultimatum in Book 1 and the commander who marches for Thrace in Book 5 are
each named without a patronymic, and nothing distinguishes them; splitting them
would produce two cards saying the same thing. One card covers both, and
Clearchus's father in Book 8 is left unbound. Tellis is the opposite case,
because the existing card asserts a relationship — Brasidas's father — that the
signatory list does not support; so there the split is made.

**Lichas is bound by alias through the whole work**, because the history gives
him a patronymic every time and he is plainly one man from Olympia to Miletus.

## How the unauthored books are handled

The rule is this. A name that **has a namesake anywhere in the work** is bound
by a position table keyed only to the chapters that have been authored, so that
its later occurrences carry no card at all rather than the wrong one. A name
that is **single-referent across the whole work** — Brasidas, Archidamus,
Perdiccas, Phormio, Pericles, Sitalces, Cleon, Demosthenes, Laches — is bound by
alias and therefore appears in chapters that have not been authored yet, with a
card that says only what the authored chapters support. Every table has `None`
for its default; there are 70 of them. Where the later man has not been read at
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

**5. Spot-read and sweep.** A hundred and two mentions drawn at random — ten per
edition for Book 1, nine for Book 2, eight for Book 3, twelve for Book 4 and
twelve for Book 5 — read back against their paragraphs: all correct. The
unbound-tabled-names audit over the whole authored range, chapters 1–17, comes
back with three lines: the Cyrus of 7:20, who is the King's son and belongs to a
book that has not been read; the river Eurymedon of 4:7; and the town of
Acanthus, whose name is a person's only in the treaty lists. Run first over Book
4 alone it came back with thirty-six, every one of them a table whose new
chapters had not been keyed in yet — Thucydides himself at Amphipolis among
them; run over Book 5 it came back with twenty tables to extend, including
Thucydides again at the second preface. That audit is the reason these passes
are trustworthy and the tests are not; the tests all passed while
Thucydides was unbound in six paragraphs of his own history. The adjacency sweep over every
Book 1 mention whose matched text abuts a capitalised word produced a hundred
and eighty-seven hits and no mis-binding — sentence-initial *The Athenians*,
cult titles like *the Delian Apollo* and *Zeus Meilichios*, *King Xerxes*, *the
Ozolian Locrians*, *the Opuntian Locrians* — and it is what turned up the
lowercase *Hellenic sea*.

**6. Both editions independently.** No entity is missing from either edition,
which is the first package in this library where that is true of a work this
size. The mention counts still differ (6,518 against 6,589), almost entirely
because the modern edition resolves pronouns the older one leaves standing.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The older translation misprints three names: **Bradidas** for Brasidas at 8:14, **Amphiraus** for Amphiaraus at 8:32, and **Antichus** for Antiochus at 8:9. All three are spelled correctly in the modern edition and elsewhere in the older one. | Carried as aliases so the mentions still bind, and pinned by a test so that nobody later "fixes" the aliases away. Not repaired: editing them would move every offset after them. |
| Both editions print the æ ligature inconsistently: **Potidæa** and **Mycenæ** always, but **Aegina** and **Aeginetans** never, and **Æthæans** in one edition against **Aethaeans** in the other. | Carried as aliases. Not repaired: editing a ligature moves every UTF-16 offset after it and invalidates this package's hashes. |
| The older translation writes **Hellenic sea** at 1:3 where the modern writes **Hellenic Sea**. | Handled in the binder's lookahead, which allows both cases. |
| The older translation names the **Tanagraeans** at 4:13 where the modern writes "the walls of Tanagra". | One mention in one edition. The people are bound in both editions from their later chapters, so nothing is omitted. |
| The older translation names the **Messinese** at 11:1 and 11:3 where the modern writes "Messina" and "the people of Messina"; and the modern writes **Messinian territory** at 12:31 where the older writes "the territory of Messina". | Three mentions that exist in one edition only, in both directions. The people are bound in both editions from 12:32, so nothing is omitted. Two tests pin the divergence. |
| The modern edition writes **Greeks** once, at 1:11, where the older writes **Hellenes**; and resolves a pronoun to the name it stands for in a handful of places — *Aristeus*, *Pausanias*, *Pericles*, *Hagnon*. | Carried as an alias on the Hellenes. It is the main reason the two editions' mention counts differ. |

No edition byte was touched.

## Remaining work

- **Chapters 18–20** (Thucydides's Book 6): the mutilation of the Hermae, the
  Sicilian expedition, the story of Harmodius and Aristogiton, and Alcibiades at
  Sparta. Hippocrates, Eucles, Hermon, Archias, Chalcidians, Chalcidian, Leon,
  Pisistratus, Nicias, Lamachus, Euphamidas, Alcibiades, Clinias, Hagnon,
  Callias and the Sicilian peoples all have occurrences waiting there. **Run the
  unbound-tabled-names audit before believing the tests** — use
  `tabhits.py`-style enumeration of every SPLIT pattern against the new
  chapters, not the mention list, since a table with no key produces no mention
  to audit.
- **Chapters 21–26** after that, one of Thucydides's books per pass.
- Adjectival singulars of peoples are bound only where the plural's own book
  bound them (*Edonian*, *Thasian*, *Rhegian*, *Mendaean*, *Andrian*,
  *Thespian*, *Lyncestian* were added in Book 4; *Thracian*, *Theban*,
  *Plataean*, *Argive*, *Sicyonian*, *Phocian*, *Acarnanian* and others are
  still uncovered). A single sweep over the adjectival forms belongs in the
  whole-work editorial checks at the end, not in a per-book pass.
- The person tables extended as each book is authored, and the `None` defaults
  replaced only where the later man is actually carded.
- The six editorial checks re-run over the whole work, and a fresh spot-read.

## Validation

`python3 books/characters/build_peloponnesian_war.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Sixty-four
focused tests so far. No edition changes, no network generation, no API spend:
every card here was written in the authoring conversation and committed as a
file.
