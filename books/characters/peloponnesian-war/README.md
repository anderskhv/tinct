# The Peloponnesian War character package — COMPLETE

**All eight of Thucydides's books are authored: chapters 1–26, the whole work,
including the unfinished Book 8 that breaks off in mid-sentence.** The whole-work
editorial checks have been run and `contentStatus` is `validated-package`.
Validated is not deployed: nothing here has been registered in the app or
verified in production, and `appStatus` stays `not-integrated` until the release
owner says otherwise.

Current state: 833 entities authored, all 833 bound in both editions, 7,510 and
7,586 exact mentions. Of those, 956 and 985 fall inside Book 1's chapters, 754
and 763 inside Book 2's, 853 and 857 inside Book 3's, 1,095 and 1,101 inside
Book 4's, 1,119 and 1,133 inside Book 5's, 753 in each inside Book 6's, 797 and
803 inside Book 7's, and 1,183 and 1,191 inside Book 8's. The nation cards are
bound through all twenty-six chapters, because a people is the same people in
every book. Content revision 2026-09-12.8.

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
| `nicias-father-of-hagnon` / `nicias-gortys` | 7:13 / 8:14 | Hagnon's father, and the Cretan of Gortys who diverted twenty ships to Crete — neither of them the Nicias son of Niceratus who fills the later books |
| `teres` / `tereus` | 6:31 | Sitalces's father and the king of the nightingale story, whom Thucydides is at pains to separate: different part of Thrace, different name |
| `pythodorus`, `tellis`, `clinias`, `evarchus`, `euphamidas`, `aristonymus`, `timagoras-tegea`, `pharnabazus`, `lycophron` | Book 2 only | later men of the same name, each of whom got his own card when his book was reached |

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
| `thucles` / `procles` / `leon-heraclea` / `dorieus` | Book 3 only | later men of the same name — except Dorieus, whom Book 8 identifies with the Olympic victor of 9:7 |
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
in a chapter further on.

| Entity | Where | Against |
|---|---|---|
| `aristeus-pellichas` / `aristeus-adimantus` / `aristeus-lacedaemon` | 2:4 / 2:30–7:22 / 14:67 | three men, the third a Lacedaemonian inspector sent out to Brasidas |
| `aristonymus` / `aristonymus-athens` | 6:33, 14:54 / 14:57 | Euphamidas's father signs the armistice; the Athenian commissioner who carried it round refuses to include Scione three paragraphs later |
| `theagenes` / `theagenes-athens` | 5:7 / 12:34 | the tyrant of Megara, and the Athenian chosen with Cleon to go and look at Pylos |
| `aristides` / `aristides-archippus` | 4:1 / 13:8, 14:0 | Lysimachus's son on the embassy about the wall, and Archippus's son who arrested Artaphernes |
| `tolmaeus` / `tolmaeus-father-of-autocles` | 4:13, 4:17 / 13:11, 14:54 | Tolmides's father and Autocles's father. **The history never identifies them**, so neither card does |
| `lycophron` / `lycophron-corinth` | 8:14 / 13:1, 13:2 | the Lacedaemonian commissioner sent to Cnemus, and the Corinthian general killed at Solygia |
| `hippocrates-ariphron` | 13:24–14:25 | against the tyrant of Gela at 18:4 and `hippocrates-sparta` of Book 8 |
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

## Book 6's namesakes

The archaeology of Sicily at the head of Book 6 hands back four names the
earlier books have already used, and the digression on the tyrannicides puts two
Pisistratuses three sentences apart.

| Entity | Where | Against |
|---|---|---|
| `thucles-founder` | 18:2 | Eurymedon's father |
| `archias-corinth` | 18:2 | the Camarinaean who was going to betray his town |
| `evarchus-catana` | 18:2 | the tyrant of Astacus |
| `hippocrates-gela` | 18:4 | Ariphron's son, and the Lacedaemonian of Book 8 |
| `pisistratus` / `pisistratus-archon` | 19:21, 19:22 ×2 / 19:22, 19:23 | the tyrant and his grandson the archon. **19:22 names both**, so that paragraph is keyed by occurrence — `[tyrant, tyrant, grandson]` — the only place in this package where a paragraph needs it |
| `callias-father-of-myrrhine` | 19:24 | a fifth Callias: Hyperechides's son, whose daughter married Hippias |
| `lysimachus-father-of-heraclides` | 20:11 | Aristides's father |
| `eucles-syracuse` | 20:44 | the Athenian who lost Amphipolis |
| `athenagoras` | 19:3, 19:9 | the Cyzicene whose son Timagoras appears in Book 8 |
| `chalcidians-sicily` | widened | now **The Chalcidian Race**, covering Euboea and the Sicilian cities out of it, since Hermocrates argues from both ends of the same descent |

**Three pieces of geography read like people.** The **river Sicanus** in Iberia
at 18:1, against Execestes's son the Syracusan general at 20:11; the **place
called Leon** at 20:38, half a mile from Epipolae, against the three men of that
name; and the **Ionian and Sicilian seas**, which are the Hellenic-sea problem
again. `Ionian` is bound to the people by default with a lookahead that excludes
*Ionian sea* and *Ionian gulf* in either capitalisation. `Sicilian` has nothing
to look ahead for — *the Tyrrhenian and Sicilian mains*, *the Sicilian and
Cretan seas*, *the Sicilian across the open main* — so its three water positions
are suppressed by name in the table, which is what the `None` entry in a
position table is for. Both of the `Sicilian` water positions in Books 4 and 5
had been wrongly bound to the people until this pass; the adjacency sweep had
missed them because the neighbouring words are lowercase.

**Phytodorus is not Pythodorus.** At 20:46 both editions print *Phytodorus*, with
no patronymic. He gets his own card, and neither of the two men called
Pythodorus is claimed.

**The Hermae are the one object cast in this package.** They are not a person or
a people, and the scope line excludes everything else that is neither; but
Thucydides never explains what they are, never names Hermes, and the whole
second half of Book 6 turns on the night they were defaced. The card says what
they are and what the city did about them.

## Book 7's namesakes

| Entity | Where | Against |
|---|---|---|
| `gongylus-corinth` | 21:1 | the Eretrian who carried Pausanias's letter to the King |
| `hegesander-thespiae` | 21:20 | Pasitelidas's father |
| `diitrephes-commander` | 21:30 | Nicostratus's father. He is the man the Book 4 table was deliberately keeping the name away from, and he arrives here with the Thracians who sacked Mycalessus |
| `euthydemus-general` | 21:17, 23:20 | the signatory of the Peace of Nicias. Still no patronymic in either place, so still no identification |
| `messapians-iapygia` | 21:35 | the Ozolian Locrian town of Book 3. The two forms happen to differ — *Messapians* there, *Messapian* here — so no table is needed, but they are two peoples and a later pass must not merge them |
| `aenians` | 23:7 | the **Aenianians** who helped destroy Heraclea in Trachis. Two peoples, two cards, and the names are one letter apart |
| `histiaeans` (Hestiaeans) | 4:x / 23:7 | one people under two spellings |

**Two more seas.** *Iapygian* is the promontory the fleets cross to at 18:30,
19:2, 19:12 and 21:35, and a people at 21:35 and 23:8 — and 21:35 has both, the
promontory first, so that paragraph is keyed by occurrence. *Tyrrhenian* is the
main at 12:30 and the Sea at 23:9, and the people who guarded the breakwater for
Athens at 23:3 and 23:8; the two water positions are suppressed by name, as with
*Sicilian*.

**The muster before Syracuse** at 23:7–23:9 lists nearly forty peoples on the two
sides — Thucydides's own answer to the Homeric catalogue, and his argument that
right and community of blood counted for less than interest or compulsion. Every
one of them carries a card, and a test names them all.

## Book 8's namesakes

Book 8 is the one that most often gives a patronymic to a name an earlier book
left bare — and almost every time, the patronymic belongs to somebody new. Seven
fathers in this book carry the name of a man from an earlier one, and the history
never connects them, so each gets his own card and each card says so.

| Entity | Where | Against |
|---|---|---|
| `sthenelaidas-father-of-alcamenes` | 24:5 | the ephor whose speech sent Sparta to war in Book 1 |
| `diotimus-father-of-strombichides` | 24:15 | Strombichus's son, who took the thirty ships to Corcyra in Book 1 |
| `archestratus-father-of-chaereas` | 25:33 | Lycomedes's son, who took the thirty ships to Macedonia in Book 1 |
| `ramphias-father-of-clearchus` | 24:8 | the envoy of Book 1 and the commander of Book 5, who are one card |
| `agesander-father-of-agesandridas` | 26:16 | the Spartan envoy of Book 1 |
| `leon-father-of-pedaritus` / `leon-chios` / `leon-general` | 24:31 / 25:21 / 24:26–25:33 | three more men called Leon, against the Heraclean, the Athenian signatory and the Spartan of the earlier books — six in all |
| `athenagoras-cyzicus` | 24:11 | the popular leader of Syracuse in Book 6. This one is Timagoras the Cyzicene's father |
| `thucydides-pharsalus` | 26:12 | the author, who is named in the same chapter. The history does not connect them |
| `pharnabazus-satrap` | 24:11 | Pharnaces's son, against the Pharnabazus of Book 2 |
| `hippocrates-sparta` | 25:24 | Ariphron's son of Book 4 and the tyrant of Gela of Book 6 |
| `hermon-munychia` | 26:14 | Hermocrates's father, of Book 4 |
| `epicles-euboea` | 26:16 | Proteas's father |
| `aristocrates-scellias` | 26:9 | the general of 24:9 and the signatory of the Peace, neither of them identified with him |

**Dorieus is the one man Book 8 does settle.** The Rhodian named at 9:7 for the
Olympiad of his second victory and the Diagoras's son who brings the Thurian
ships at 24:38 are read as one man: 9:7 gives the city and 24:38 gives the
father, the history never distinguishes them, and splitting them would produce
two cards saying nothing. His card carries a gated Book 8 update rather than a
second entry. Every other Book 8 identification the earlier passes
refused is still refused: Tellis, Euthydemus, Thrasycles, Aristocrates, Procles,
Pythodorus, Ramphias, Xenares and Diitrephes all keep their separate cards,
because Book 8 gives no patronymic that would join them.

**The bodies are cast as well as the men.** The Four Hundred, the Five Thousand,
the Three Hundred at Samos, the Council of Five Hundred, the crew of the Paralus,
the Eumolpidae and the Ceryces each carry a card: in this book a constitution is
an actor, and a reader who meets "the Four Hundred" in chapter 25 needs to know
what it is more than he needs to know who Alexicles was.

## How the person tables work

The rule is this. A name that **has a namesake anywhere in the work** is bound
by a position table keyed to the paragraphs that identify each man, so that a
paragraph the history leaves ambiguous carries no card at all rather than the
wrong one. A name that is **single-referent across the whole work** — Brasidas,
Archidamus, Perdiccas, Phormio, Pericles, Sitalces, Cleon, Demosthenes, Laches —
is bound by alias through all twenty-six chapters. There are 82 tables; 70 of
them have `None` for a default, which is what makes an unkeyed paragraph silent.
The remaining twelve are the peoples whose adjectives need a lookahead rather
than a key.

The nations are the opposite case and are bound by alias throughout, because the
Athenians of chapter 26 are the Athenians of chapter 1. A test pins both halves
of that rule: `athenians` appears in all twenty-six chapters, `cylon` in none
after chapter 5.

## Editorial checks — the whole work

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
**goddess of the Brazen House**, whom Thucydides never names; and every bare
name the history gives to more than one man without saying which — the nine
signatories of the Peace, the second Euthydemus, the second Aristocrates, the
Ramphias who is Clearchus's father. Those all carry cards of their own where
the history supports one, and no card at all where it does not.

**5. Spot-read and sweep.** Two hundred and two mentions drawn at random — ten
per edition for Book 1, nine for Book 2, eight for Book 3, twelve each for Books
4 through 8, and a final fourteen per edition drawn from all twenty-six chapters
at once — read back against their paragraphs: all correct.

The **unbound-tabled-names audit** enumerates every pattern in `SPLIT` against
the text and lists the paragraphs where it matches and no key covers it. Over
the whole work it now comes back with seventeen positions per edition, every one
of them deliberate geography: the river Eurymedon at 4:7; the river Sicanus at
18:1; the Iapygian promontory at 18:30, 19:2 and 19:12; the place called Leon at
20:38; the town of Acanthus at 14:8, 14:9, 14:40, 14:55 and 15:20, whose name is
a person's only in the treaty lists; the Tyrrhenian main and the Tyrrhenian Sea;
and the three Sicilian waters. Run over each book as it was authored it found
real gaps every time — thirty-six over Book 4, every one a table whose new
chapters had not been keyed in yet, Thucydides himself at Amphipolis among them;
twenty over Book 5, Thucydides again at the second preface; twenty over Book 6;
ten over Book 7, Nicias in twenty-eight paragraphs among them. **That audit is
the reason these passes are trustworthy and the tests are not**; the tests all
passed while Thucydides was unbound in six paragraphs of his own history. A
table with no key produces no mention, so nothing at the mention level can see
the gap.

The **adjacency sweep** — which is what caught the Ionian Sea — reads every
mention whose matched text abuts a capitalised word. Over the whole work it
produces thirteen hundred hits and no mis-binding: sentence-initial *The
Athenians*, cult titles like *the Delian Apollo* and *Zeus Meilichios*, *King
Xerxes*, *the Ozolian Locrians*, *the Opuntian Locrians*, *the Acarnanian
Evarchus*, *the Rhodian Dorieus*, *the Messenian Chromon*. It is what turned up
the lowercase *Hellenic sea*, and it is deliberately blind to a mis-binding
whose neighbours are lowercase — which is how *the Sicilian and Cretan seas*
survived two books.

**6. Both editions independently.** No entity is missing from either edition,
which is the first package in this library where that is true of a work this
size. The mention counts still differ (7,510 against 7,586), almost entirely
because the modern edition resolves pronouns the older one leaves standing.

**7. Adjectival singulars of peoples.** Deferred since Book 4 and run once over
the finished work: every cast people's plural alias was singularised and the
singular looked for in both editions. Thirty-nine forms came back uncovered, and
each was read in context rather than bound on sight.

- **Twenty-seven are the people everywhere they occur** and are now plain
  aliases: *Theban*, *Plataean*, *Trojan*, *Thurian*, *Aetolian*, *Libyan*,
  *Illyrian*, *Cnidian*, *Rhodian*, *Teian*, *Phocian*, *Phocaean*, *Pellenian*,
  *Oropian*, *Ophionian*, *Methymnian*, *Melian*, *Lampsacene*, *Italiot*,
  *Eurytanian*, *Erythraean*, *Crotonian*, *Cranian*, *Carthaginian*,
  *Apodotian*, *Agraean*, *Tanagraean*. A man named by his city, a people's
  troops, ships, coinage, colony or territory, and a war named after them, are
  all that people.
- **Five are mixed** and are bound by lookahead, because the base name is a
  region or an island with a name of its own and most of its adjectives locate
  something inside it rather than naming the people. *Thracian* binds only
  before *tribes*, *swordsmen*, *independent*, *host*, *mercenaries*, *race* and
  *horse* — not the Thracian towns, places, country, gates, possessions, allies
  or Chalcidians. *Acarnanian* binds except before *coast* and *capital*.
  *Cretan* except before *Sea*/*seas*. *Euboean* except before *Chalcidians*.
  *Egyptian* except before *border* — the Egyptian revolt is the Egyptians', the
  Egyptian border is Egypt's.
- **Six are never the people and stay uncovered.** *Delian* is Apollo's cult
  title and Delos's festival and dance; this is the Histories precedent, where
  binding *Plataean Hera* to the Plataeans was withdrawn for the same reason.
  *Achaean* is the promontory Rhium and a city of Achaea. *Malian* and *Pierian*
  are gulfs. *Paralian* is a district of Attica and the state galley *Paralus*.
  *Cyprian* is an expedition to the island.

Four tests pin all three groups, including the six that must stay unbound.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The older translation misprints three names: **Bradidas** for Brasidas at 8:14, **Amphiraus** for Amphiaraus at 8:32, and **Antichus** for Antiochus at 8:9. All three are spelled correctly in the modern edition and elsewhere in the older one. | Carried as aliases so the mentions still bind, and pinned by a test so that nobody later "fixes" the aliases away. Not repaired: editing them would move every offset after them. |
| Both editions print the æ ligature inconsistently: **Potidæa** and **Mycenæ** always, but **Aegina** and **Aeginetans** never, and **Æthæans** in one edition against **Aethaeans** in the other. | Carried as aliases. Not repaired: editing a ligature moves every UTF-16 offset after it and invalidates this package's hashes. |
| The older translation writes **Hellenic sea** at 1:3 where the modern writes **Hellenic Sea**. | Handled in the binder's lookahead, which allows both cases. |
| The older translation names the **Tanagraeans** at 4:13 where the modern writes "the walls of Tanagra". | One mention in one edition. The people are bound in both editions from their later chapters, so nothing is omitted. |
| The modern edition calls the people of Sicilian Messana the **Messenians** at 11:1 and 11:3 — twice in the plural and once in the singular — where Crawley writes **Messinese**. "Messenians" is the name the Helots settled at Naupactus carry everywhere else in the work, so the modern edition gives two unrelated peoples one name. | Not repaired. The plural and singular are bound by a position table instead of an alias, so 11:1 and 11:3 go to the Messinese in both editions and every other paragraph goes to the Messenians. A test pins all six mentions. |
| The modern edition writes **Messinian territory** at 12:31 where the older writes "the territory of Messina". | One mention in one edition. The people are bound in both editions from 11:1, so nothing is omitted. A test pins the divergence. |
| The older translation misprints **Onamacles** for Onomacles at 24:33 and **Silenus** for Selinus at 24:29. | Onamacles is carried as an alias so the general still binds. Silenus is a place and carries no card in either edition. |
| The modern edition writes **Greeks** once, at 1:11, where the older writes **Hellenes**; and resolves a pronoun to the name it stands for in a handful of places — *Aristeus*, *Pausanias*, *Pericles*, *Hagnon*. | Carried as an alias on the Hellenes. It is the main reason the two editions' mention counts differ. |

No edition byte was touched.

## What is left, and for whom

Nothing in this package is left for the authoring lane. What remains belongs to
the release owner:

- **Production verification.** Register the asset, open the book in the reader,
  and check that a card opens on the right person in both editions and at a
  chapter boundary. `appStatus` stays `not-integrated` until that has been done
  and the evidence recorded; this lane never sets it.
- **Two source defects to decide about**, both recorded in the table above and
  neither repaired here, because editing an edition byte moves every UTF-16
  offset after it and invalidates the hashes this package is pinned to: the
  older translation's three misprinted names, and the modern edition's
  **Messenians** at 11:1 and 11:3 for Crawley's Messinese. The bindings are
  correct either way; the question is whether the edition text should be fixed.
- **Judgement calls a human may want to overturn.** Each is pinned by a test, so
  overturning one means changing the test on purpose rather than by accident:
  Ramphias of Book 1 and Ramphias of Book 5 read as one man; Tellis the
  signatory kept apart from Brasidas's father; Dorieus the Olympic victor
  identified with Diagoras's son of Book 8; the Hermae cast although they are
  neither a person nor a people; the Chalcidian Race widened to cover Euboea and
  Sicily at once.

## Validation

`python3 books/characters/build_peloponnesian_war.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Ninety-nine
focused tests, all passing. The four audits behind the editorial checks are not
tests and have to be run by hand — the unbound-tabled-names audit in particular,
because a table with no key produces no mention, so no test can see the gap.

No edition changes, no network generation, no API spend: every card here was
written in the authoring conversation and committed as a file.
