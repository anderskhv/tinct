# The Histories character package — IN PROGRESS

**Books 1–6 (sections 1–1026) are authored. Books 7–9 are not.** Status stays
`in-progress` and the package must not be integrated until all nine books are
covered.

Current state: 595 entities authored, 592 bound in the older translation and all
595 in the modern edition, 10,024 and 9,989 exact mentions. The mention counts are
by a wide margin the highest in the library, because the nations Herodotus names —
Persians, Hellenes, Athenians, Lacedaemonians — recur through all nine books and
are bound wherever they appear, not only where they were first cast. Content
revision 2026-09-12.2.

## Why this is the hardest book in the queue

Herodotus names several hundred people and nearly as many nations, explains almost
none of them, and reuses names freely across generations and empires. In the first
hundred sections alone there are **two men called Atys** — Croesus's son and the
ancient king the Lydians are named after — **two called Lycurgus**, the Athenian
faction leader and the Spartan lawgiver, six sections apart; and **two called
Cambyses**, Cyrus's father through the whole book and Cyrus's son in its last
pages. The **Alexander** who carries off Helen in section 3 is not the Alexander
who will rule Macedon in Book 5.

None of that can be resolved by a name list. Almost all the work here is position
tables.

## How the unauthored books are handled

Where a name in Books 2–9 belongs to somebody this pass has not authored, it is
**left unbound rather than defaulted to the Book 1 man of the same name.** That is
why every table in the builder has `None` for its default. Three cases are already
in place:

- **Leon** king of Sparta is bound at 64, 800 and 1226; the Leon sacrificed by the
  Persians at 1202 is a different man and carries no card.
- **Ninus** father of Agron is bound at 7; the Ninos who fathered Sardanapallos at
  365 is not.
- **Bias** of Priene is bound at 27 and 169; the Bias of Argos at 1437 is not.

Each of those was caught by the spot-read, not by a coverage test, and each is
pinned by a test now.

## Two translations, two transliteration systems

The older translation is Macaulay's, which keeps the Greek endings; the modern
edition latinises them. Every one of these is carried as an alias on a single
entity: **Heracleidai / Heraclids**, **Mermnadai**, **Alcaios**, **Ninos**,
**Myrsos**, **Myrsilos**, **Lydos**, **Adrastos**, **Hyroiades**, **Deïokes**,
**Kyaxares**, **Labynetos**, **Tellos**, **Peisistratos**, **Lycurgos**,
**Alcmaion**, **Kypselos**, **Thrasybulos**, **Pittacos**, **Inachos**,
**Athene**, **Kimmerians**, **Phenicians**, **Achaians**, **Belos**,
**Lacedemonians**, **Aiolians**, **Lykians**, **Phocaians**, **Massagetae**. A
test pins eleven of them.

## Editorial checks — Books 1 to 5

**1. Namesakes.** The four resolved above (Atys, Lycurgus, Cambyses, Alexander),
plus Leon, Ninus and Bias against their later namesakes, plus **Artembares** the
Mede in sections 113–115 against the Persian Artembares of the very last section
of the work, who is not yet authored and not bound.

**2. Person or not.** Cities, rivers, mountains, seas and countries are excluded,
which in Herodotus removes more than half the proper nouns. Four judgement calls:

- **The Pythian prophetess** is cast as a person, not as a place-name — she speaks,
  and the reader needs to know who is answering.
- **The Magians** are cast as a people, because Herodotus treats them both as one
  of the six Median tribes and as the caste that reads dreams.
- **Leleges** is cast, though it is only the old name of the Carians, because the
  text uses it as a people-name.
- **Kyme**, **Smyrna** and **Phocaia** are cities and are not cast; the peoples of
  the first two appear only in the modern edition and are recorded as omissions.

**3. Scriptural and mythological figures.** The four abductions that open the work
— Io, Europa, Medea, Helen — are cast as the mythological figures they are, with
cards that say what each abduction is doing in Herodotus's argument rather than
retelling the myth. Zeus, Apollo, Athena, Hera, Aphrodite and Heracles are cast
for their cult titles, since that is how Herodotus uses them: Zeus the Purifier
and Guardian of Friendship, Apollo as Loxias and as Ismenian, Aphrodite as Urania
and as the Assyrians' Mylitta.

**4. Ambiguous references.** Left unbound: **Croesus's mute son**, who has no
name in the text; the **Persian who nearly kills Croesus at Sardis**, likewise
unnamed; and every name in Books 2–9 that belongs to a person this pass has not
authored.

**5. Spot-read.** Sixty-four mentions drawn at random, twelve per edition per
book through Book 5 and eight more per edition for Book 6, read back against
their paragraphs. All correct after the three fixes
above; before them, the Leon of 1202 was carrying the Spartan king's card.

**Book 2 adds its own namesake and its own place-versus-person case.**
**Alexander** is Paris again in the long Egyptian passage of sections 327-335,
where Herodotus argues that Helen never reached Troy at all — so Paris is bound
there as well as in section 3, and the Macedonian of Books 5 and 7-9 still is
not. **Moeris** is a king in sections 221, 228 and 316 and a lake everywhere
else; only the king is cast, and a test pins it.

**6. Both editions independently.** Two entities are missing from the older
translation — the **Smyrnaeans**, the **Cymeans** and the **Crotoniats**, where
Macaulay writes only "the men of Smyrna", "the men of Kyme" and "those of
Croton" — and none from the modern. **No entity
is missing from both.** Book 2 added another twelve transliteration divergences,
all of them closed with aliases: Ladike, Esop, Etearchos, Hecataios, Menelaos,
Lynkeus, Linos, Dioscuroi, Samothrakians, Keltoi, Kilikians, and the Hephaistos
/ Hephaestus and Dionysos / Dionysus pairs that alternate within both editions.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The chapter titles number sections **continuously for Books 1–3** ("Book 2 — Euterpe, Chapter 216") and **restart at 1 for Books 4–9** ("Book 4 — Melpomene, Chapter 1"). The underlying chapter numbers are continuous throughout. | Reader-facing labels are inconsistent between the first three books and the last six. No effect on offsets or on this package; worth fixing in the edition metadata. |
| Stray editorial section numbers survive inside the running text of the older translation — e.g. "against the Medes, 15 and he drove the Kimmerians", "to Egypt, not agreeing therein with the Hellenes, 3" | Cosmetic in the reader; **do not strip them**, since removing them would move every UTF-16 offset in the file and invalidate this package's hashes. |
| The modern edition inserts a translator's parenthetical at section 936 — *(The Greek word krios also means "ram.")* — where the older translation carries the same information as a footnote. | The word *Greek* there means the language, and the package-wide alias binds it to the Hellenes. One mention in one edition; not repaired, because editing it would move every offset after 936. |

No edition byte was touched.

## Remaining work

- Books 7–9 (sections 1027–1525): Thermopylae, Salamis and Plataea. Several
  hundred more people and nations, and the largest concentration of Persian
  commanders in the work — where the fourth, fifth and sixth men called Otanes
  turn up, all of them still unbound.

  Books 1 to 6 are done. Books 7–9 remain.

- The namesake tables extended as each book is authored, and the `None` defaults
  replaced only where the later man is actually carded.
- The six editorial checks re-run over the whole work, and a fresh spot-read.

## The Smerdis problem, and how it is solved

Book 3 turns on one deception and the package has to carry it exactly.

Herodotus is more careful than he is usually given credit for: **every literal
"Smerdis" in the text is Cyrus's son.** The impostor is never given the name in
narration — he is always "the Magian" — and the one place the two come closest,
section 464, says he usurped "the place of his namesake Smerdis son of Cyrus",
naming the dead man, not the living one. So:

- **`smerdis-son-of-cyrus`** is bound on the word *Smerdis*, everywhere, and a
  test asserts that every mention of him quotes that word.
- **`smerdis-the-magian`** is bound on the word *Magian*, and a test asserts that
  no mention of him quotes the word *Smerdis* at all.

The one genuinely undecidable case is section 460, where Prexaspes interrogates
the herald: *"you say you have come as a messenger from Smerdis son of Cyrus."*
The name spoken means Cyrus's son; the man it refers to is the Magian. It is
bound to Cyrus's son, because that is the name on the page, and the whole force
of the scene is that the two have not yet been separated.

Three entities answer to the word, not two. **`magians`** is the priestly caste
and Median tribe of Books 1, 5, 7 and 8. **`magian-brothers`** is the usurper and
Patizeithes together, which is what the plural means through the conspiracy.
**`smerdis-the-magian`** is the usurper alone.

**Section 476 is the hardest paragraph in the work.** In a single paragraph the
two Magians are beheaded, every Magian in Persia is then hunted down, and the
festival of the Magophonia is explained — so the word switches from the two men
to the caste mid-paragraph, and *the two translations distribute the singular and
the plural differently while doing it.* Macaulay writes "every one of the
Magians" where the modern edition writes "every Magian". That paragraph carries
a separate occurrence list per edition, and a test walks its bindings in source
order and asserts the switch happens.

## Also in Book 3

**Two men called Archias in one paragraph** (452): the Lacedaemonian who died
inside Samos, and the grandson of the same name whom Herodotus says he talked to
at Pitane. Only the fourth occurrence is the grandson; a test pins it.

**The tribute roll of sections 489–495** names about forty nations with their
assessments. It is bound to one card — *The tribute nations* — on the same
reasoning as the Florentine houses in the Divine Comedy package: forty cards
reading "one of the peoples of Darius's twentieth division" is noise, and what
the reader needs is to know what the list is and why Herodotus troubled to copy
it out.

**Gated identities.** Smerdis son of Cyrus, and the Magian, both carry
identity updates released at the paragraph where the text itself releases them —
427 for the secret killing, 464 for the seven months' reign, 477 for the
Magophonia. A reader at section 430 is not told by a card what only section 458
reveals.

## The royal house of Cyrene

Book 4's namesake cluster is a dynasty, and the oracle in the text names the
problem for you: *"For four named Battus and four named Arcesilaus — eight
generations of men — Loxias grants you to be kings of Cyrene."*

Herodotus narrates three of each, and they are three men each:

| Entity | Who | Where |
|---|---|---|
| `battus-i` | the founder, the stammerer sent to Libya, forty years | 706–715 |
| `battus-ii` | Battus the Fortunate, the third king, who invited all Greece | 715, 716 |
| `battus-iii` | Battus the Lame, for whom Demonax wrote a constitution | 717, 718, 761 |
| `arcesilaus-i` | the founder's son, sixteen years | 715 |
| `arcesilaus-ii` | who lost seven thousand hoplites and was strangled by his brother | 716, 717 |
| `arcesilaus-iii` | exiled to Samos, burnt his enemies in a tower, murdered at Barca | 718–758 |
| `battiadae` | the house itself, where the name stands for the line | 719, 758 |

**Section 715 names two different Battuses in one sentence** — "the first settler
Battus, who reigned forty years… but in the time of the third king, called Battus
the Fortunate" — so it carries an occurrence list, and a test walks that sentence
in source order and asserts the two are different men. Section 719 is the oracle,
where both names mean the dynasty and neither means a king; a test asserts that
too. Macaulay spells them Battos and Arkesilaos, and calls Battus II the
Prosperous rather than the Fortunate.

**Two kings called Etearchus**: the Ammonian who told the Nasamonian story in
Book 2, and the Cretan of Oaxus in Book 4 who swore his own daughter away. The
Book 2 entity lost its alias so that a table could own both.

## Book 5: five namesakes in one book

The Ionian revolt is the densest namesake book in the work so far, and one of
them has been waiting since section 3.

**Alexander.** The Macedonian son of Amyntas finally appears at 778, seven
hundred and seventy-five sections after the Alexander who carried off Helen. Both
are now bound, and a test asserts that neither reaches into the other's
territory: Paris stops before section 400, the Macedonian begins at 778.

**Aristagoras.** Three men. The Milesian who starts the revolt is the default,
because he accounts for almost every occurrence in the work — but not all of
them. The **tyrant of Cyzicus** in Darius's fleet at the Ister (694) and the
**Samian father of Hegesistratos** in Book 9 (1493) are other men; the first has
his own card, the second is suppressed until Book 9 is authored. Section 798
names the Milesian and **Aristagoras of Cyme** in one sentence, the Cymean first,
and a test walks that sentence in order. This is the case that shows why the
`None` defaults elsewhere are worth the trouble: a plain default here would have
quietly given a Cyzicene and a Samian the Milesian's card.

**Cleisthenes.** The Athenian and his mother's father the tyrant of Sicyon,
named in the same sentence at 828 and again at 830 — and the two translations put
a different number of them in each paragraph, so both paragraphs carry a list per
edition, as section 476 does in Book 3.

**Otanes.** At least six men in the work. The conspirator of the seven (Book 3,
and again commanding at Samos), **Sisamnes's son** in Thrace (Book 5), and the
commanders of 877 and 883 and the patronymics of Books 7 to 9, all of whom stay
unbound because the text does not say which Otanes they are and the later books
are not authored. A test asserts that none of those four sections is bound to
either of the two named men.

**Adrastus.** The Phrygian suppliant who killed Croesus's son in Book 1, and the
Argive hero whose shrine Cleisthenes tried to starve out in Book 5.

## Book 6: the worst namesake book in the work, and the first that reaches forward

Erato is Lade, the fall of Miletus, the deposing of Demaratus and Marathon. It
adds 156 entities and about 950 new mentions per edition — its own sections now
carry 2,449 between the two editions — and it breaks the pattern of the five books
before it in two ways.

**One family carries four shared names.** The house of the Chersonese runs
Cypselus → Miltiades → (brother) Cimon → Stesagoras and Miltiades → Cimon, and
Herodotus uses the same four names for two men each:

| Entity | Who | Where |
|---|---|---|
| `miltiades-cypselus` | Cypselus's son, the founder the oracle sent the Dolonkians for | 920–923, 989 |
| `miltiades` | Cimon's son, tyrant of the Chersonese and general at Marathon | 693, 694, 920, 925–927, 989–1026 |
| `cimon` | the father, murdered by night near the City Hall | 920–989, 1023, 1026 |
| `cimon-son-of-miltiades` | the son, who paid the fifty-talent fine | 1022, 1129 |
| `stesagoras-elder` | Cimon's father, named only in the descent | 920, 989 |
| `stesagoras` | Cimon's elder son, killed with an axe in the city hall | 924, 925, 989 |

**Section 920 names both Miltiadeses in one sentence** and **section 989 names
them five times between them in a single paragraph**, alternating. Both carry
occurrence lists, and a test walks 920 and 989 in source order.

**The Alcmaeonid genealogy of 1011–1017 does the same thing with three
Megacleses, two Agaristes, two Cleistheneses and a fourth Hippocrates**, and here
the two translations do not agree on how many times to repeat the names: the prose
of 1017 says "He was the son of Megacles; Megacles also had another son,
Hippocrates" where the verse says only "this son, I say, was born to Megacles, and
also Hippocrates". So 1017 carries an occurrence list per edition, as section 476
of Book 3 and section 828 of Book 5 do.

**Four men called Hippocrates**: Peisistratus's father (58, 826, 989), the tyrant
of Gela who sold his Zanclaean allies (909, and again in Book 7), Smindyrides's
father of Sybaris (1013), and the Alcmaeonid (1017). **Two called Artaphrenes**,
father and son, in the one phrase "Artaphernes son of Artaphernes" — the son
first, and he is the commander who is named again at Marathon in Book 7. **Two
called Euphorion**, **two called Diactorides**, **two called Aeaces** in the same
sentence at 899, and **three called Aeaces** counting the grandfather in the
patronymic.

Eight more Book 6 men share a name with somebody already cast from an earlier
book, and in each case the earlier entity lost its alias so that a table could
own both: **Cypselus** of Athens against the tyrant of Corinth, **Harpagus** the
Persian of Mysia against the Mede who was made to expose Cyrus, **Oebares** the
governor's father against Darius's groom, **Procles** the Spartan twin against
the despot of Epidaurus, **Chilon** son of Demarmenos against the sage,
**Callias** the Athenian against the Elean diviner, **Tisander** Hippocleides's
father against Isagoras's, and **Lycurgus** the Arcadian against both the
Spartan lawgiver and the Athenian faction leader.

### It reaches forward, and it reaches back

This is the first book whose cast is bound outside its own sections on purpose.
**Xerxes, Artaxerxes, Mardonius, Datis, Demaratus, Leotychides, the Plataeans,
the Sacae, the Helots and the Ephors** are each one referent for the whole work,
so they are bound wherever they appear — which is most of Books 7 to 9. Their
cards were written from what Book 6 itself says about them and will be enriched,
not replaced, when those books are authored.

It also closed four gaps in the books already done:

- **Section 693–694, the roll of the tyrants at the Ister bridge**, was only
  partly cast. Miltiades, Aeaces of Samos, Ariston of Byzantium, Daphnis,
  Hippoclos, Herophantus, Metrodorus, Strattis and Laodamas now have cards; only
  Aristagoras of Cyzicus and Aristagoras of Cyme had them before.
- **Section 703 was wrong.** "The sons of Aristodemus, Eurysthenes and Procles"
  was binding Procles to the despot of Epidaurus, because that entity carried the
  bare alias. The Spartan twin now owns 703, 938 and 1390.
- **The modern edition spells Aristogeiton *Aristogiton* at 995 and 1009** and
  **Alcmaeonidae *Alcmaeonids* at 1001**; both were unbound in that edition until
  this pass added the aliases. **Aeaces** was likewise unbound at 397 in the
  modern edition, which spells him Aeaces where Macaulay writes Aiakes.
- **Phoebus** is Apollo at 570, 711 and 947 and was carried by no alias.

### Deliberately unbound

- **Hydarnes** at 1019, to whom Lysagoras denounced Miltiades. Herodotus does not
  say whether this is the conspirator of Book 3 or his son, and a test asserts
  that the section carries no card.
- **The city of Argos**, against the hero Argos whose grove Cleomenes burned. The
  hero owns the sanctuary and the grove at 961, 964, 966 and 968; the city owns
  "conquer Argos" in the same paragraphs, and cities are not cast. Both editions
  distribute them identically.
- **The island of Thasos**, against Thasus the Phoenician who settled it. Only
  the first two occurrences of 933 are the man.
- **The Euphorion of Book 2**, Aeschylus's father. He is almost certainly the same
  man as Cynegirus's father at 1000, but Herodotus never says so, so the Book 2
  mention is left as it was rather than folded into a card that would assert it.
- **Six men in the genealogies of Books 7 to 9** who share a Book 6 name and are
  not the Book 6 man: the Aristodemus who came back alive from Thermopylae, the
  Archidamus, Anaxilaus and Agis of the Spartan king-lists, the Demarmenos of
  Book 5, Simonides's father Leoprepes, Polycritus son of Crius, the Coan Scythes,
  the Cleanders of Gela, the Theban Laodamas, the later Callias son of Hipponicus,
  and the Glaucus of Chios who made the iron stand in Book 1.

### Judgement calls

- **The Ephors** and **the Pythians** are cast, as the Magians were: they are
  named bodies rather than places, and section 943 exists to explain what the
  Pythians are. **Oath** is cast as the power the Pythia sets against Glaucus,
  because the oracle gives it a son with no name, no hands and no feet, and the
  Glaucus story is unreadable without it.
- **The hero Argos** is cast, since the joke of the oracle is that Cleomenes
  conquered him and not the city.
- **The roll-call problem does not arise here.** The suitor list of 1013 names
  thirteen men with their fathers and their cities, and each of them gets his own
  card: Herodotus is telling you who came from where, and the list is short enough
  to read. Nothing in Book 6 needed the single shared card that the Divine Comedy
  package gives the thirty Florentine houses.

### Spot-read and sweep

Sixteen mentions drawn at random, eight per edition, read back against their
paragraphs: all sixteen correct, as were twenty-four more from a first pass. The
adjacency sweep over every one of the 2,449 Book 6 mentions whose matched text
abuts a capitalised word turned up **one** questionable binding, and it is a
translator's insertion rather than a name: the modern edition adds the gloss *(The
Greek word krios also means "ram.")* at 936, and the package-wide alias `Greek`
binds it to the Hellenes, where it means the language. Recorded below rather than
special-cased, since the same alias is doing correct work in two thousand other
places.

## Validation

`python3 books/characters/build_the_histories.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Forty-one
focused tests so far. No edition changes, no network generation.
