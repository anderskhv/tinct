# The Histories character package

**All nine books (Clio to Calliope, sections 1–1525) are authored.**

Current state: 1,043 entities authored, 1,040 bound in the older translation and
all 1,043 in the modern edition, 11,285 exact mentions in each. The mention counts
are by a wide margin the highest in the library, because the nations Herodotus
names — Persians, Hellenes, Athenians, Lacedaemonians — recur through all nine
books and are bound wherever they appear, not only where they were first cast.
Content revision 2026-09-12.5.

`contentStatus` is `validated-package`; `appStatus` stays `not-integrated`.
Nothing here has been registered in the app or verified in production, and this
package makes no claim that it has.

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

## Names that stay unbound on purpose

Where a name belongs to somebody who is not carded, it is **left unbound rather
than defaulted to the first man of that name.** That is why nearly every table in
the builder has `None` for its default. The rule survived the whole nine books,
and two of the three open cases this file used to list were closed when Book 9 was
authored:

- **Leon** king of Sparta is bound at 64, 800 and 1226; the Leon sacrificed by the
  Persians at 1202 is a different man, is never identified further, and carries no
  card. Still open.
- **Ninus** father of Agron is bound at 7; the Ninos who fathered Sardanapallos at
  365 is not. Still open.
- **Bias** of Priene is bound at 27 and 169; the Bias of Argos at 1437 is now
  `bias-argos`. Closed in Book 9.
- **Artembares** the Mede is bound at 113–115; the Persian Artembares of the last
  section is now `artembares-persia`. Closed in Book 9.

Each of those was caught by the spot-read, not by a coverage test, and each is
pinned by a test.

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

## Editorial checks — the whole work

**1. Namesakes.** The four resolved above (Atys, Lycurgus, Cambyses, Alexander),
plus Leon and Ninus against their later namesakes, and the sets resolved in each
later book — listed under Books 5, 6, 7, 8 and 9 below. Across the nine books
there are **111 position tables**, and every namesake pair or triple in them is
pinned by a test. Both of the namesake cases this file once listed as deferred —
**Bias** of Argos and the Persian **Artembares** of the very last section of the
work — were closed when Book 9 was authored.

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

  Book 9 added four more. **Pleistorus**, the native god the Apsinthians sacrifice
  Oeobazus to, is cast as a deity, on the same footing as the Winds and Boreas in
  Book 8. **The Sun** whose sacred sheep Euenius fell asleep over is bound to the
  existing `helios`, by a one-entry position table, because every other
  capitalised Sun in the work is the sun in the sky. **The Pitanate division** is
  cast as a group, because it acts: it is the body that refuses to move. And the
  **adjectival forms of peoples** — *the Plataean land*, *the Theban territory*,
  *the Carystian land* — are not bound at all, since most of them are territory
  and the Theban ones are mostly the Theban Zeus in Egypt.

**3. Scriptural and mythological figures.** The four abductions that open the work
— Io, Europa, Medea, Helen — are cast as the mythological figures they are, with
cards that say what each abduction is doing in Herodotus's argument rather than
retelling the myth. Zeus, Apollo, Athena, Hera, Aphrodite and Heracles are cast
for their cult titles, since that is how Herodotus uses them: Zeus the Purifier
and Guardian of Friendship, Apollo as Loxias and as Ismenian, Aphrodite as Urania
and as the Assyrians' Mylitta.

**4. Ambiguous references.** Left unbound: **Croesus's mute son**, who has no
name in the text; the **Persian who nearly kills Croesus at Sardis**, likewise
unnamed; the **woman of Cos** who takes Pausanias by the knees at 1479, one of
the most memorable people in Book 9 and nameless in it; the **Leon** of 1202 and
the **Ninos** of 365, whom Herodotus never identifies further; and **Argos** at
1437, which is the city. Nothing is bound on an identification the text does not
make — which is also why `pytheas-father-of-lampon` is a separate card from the
Aeginetan marine, though commentators join them.

**5. Spot-read.** Mentions drawn at random and read back against their own
paragraphs, book by book as each was authored: twelve per edition per book through
Book 5, eight per edition for Book 6, eight for Book 7, eight for Book 8, fourteen
for Book 9, and a final twenty drawn from the whole work at once. All correct after
the three fixes above; before them, the Leon of 1202 was carrying the Spartan
king's card.

The **adjacency sweep** — every mention whose matched text abuts a capitalised
word — is the check that actually earns its keep. It is what caught the bare alias
`Royal` binding the king's Royal Judges and Royal Secretaries in Book 6, the
translator's gloss at 936 binding the Hellenes to the Greek *language*, and
**"Plataean Hera"** at 1464 binding the goddess's epithet to the people. No test
written from the cards would have found any of the three.

**Book 2 adds its own namesake and its own place-versus-person case.**
**Alexander** is Paris again in the long Egyptian passage of sections 327-335,
where Herodotus argues that Helen never reached Troy at all — so Paris is bound
there as well as in section 3, and the Macedonian of Books 5 and 7-9 still is
not. **Moeris** is a king in sections 221, 228 and 316 and a lake everywhere
else; only the king is cast, and a test pins it.

**6. Both editions independently.** Three entities are missing from the older
translation — the **Smyrnaeans**, the **Cymeans** and the **Crotoniats**, where
Macaulay writes only "the men of Smyrna", "the men of Kyme" and "those of
Croton" — and none from the modern. **No entity is missing from both**, in all
nine books, and a test asserts it. Both editions finish on 11,285 mentions, which
is a coincidence rather than a guarantee: the per-edition counts diverged at every
earlier stage and are reported separately for that reason. Book 2 added another twelve transliteration divergences,
all of them closed with aliases: Ladike, Esop, Etearchos, Hecataios, Menelaos,
Lynkeus, Linos, Dioscuroi, Samothrakians, Keltoi, Kilikians, and the Hephaistos
/ Hephaestus and Dionysos / Dionysus pairs that alternate within both editions.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The chapter titles number sections **continuously for Books 1–3** ("Book 2 — Euterpe, Chapter 216") and **restart at 1 for Books 4–9** ("Book 4 — Melpomene, Chapter 1"). The underlying chapter numbers are continuous throughout. | Reader-facing labels are inconsistent between the first three books and the last six. No effect on offsets or on this package; worth fixing in the edition metadata. |
| Stray editorial section numbers survive inside the running text of the older translation — e.g. "against the Medes, 15 and he drove the Kimmerians", "to Egypt, not agreeing therein with the Hellenes, 3" | Cosmetic in the reader; **do not strip them**, since removing them would move every UTF-16 offset in the file and invalidate this package's hashes. |
| The modern edition inserts a translator's parenthetical at section 936 — *(The Greek word krios also means "ram.")* — where the older translation carries the same information as a footnote. | The word *Greek* there means the language, and the package-wide alias binds it to the Hellenes. One mention in one edition; not repaired, because editing it would move every offset after 936. |
| Both editions print **Erechththeus** for Erechtheus at section 1211, though both spell him correctly at 843, 1304 and 1315. | Carried as an alias rather than repaired; editing it would move every offset after 1211. |
| The older translation prints **Mardonions** for Mardonios at section 1441. | Carried as an alias on `mardonius`, so the mention binds; a test pins the misprint so that nobody later "fixes" the alias away. |
| The older translation prints **Tisamenes** at section 938 where it prints Tisamenos at 703 for the same man. | Carried as an alternative in the position table's pattern. |
| The older translation writes "when **he** gave this counsel to Mardonios" at section 1442 where the modern edition writes "when **Timagenides** gave this advice". | Not a defect — the modern edition resolves a pronoun. It is the reason Timagenides has one more mention in the modern edition than in Macaulay, and the reason mention counts are reported per edition rather than as one number. |

No edition byte was touched.

## Remaining work — for the release owner, not for authoring

Authoring is complete. What is left is outside this package's remit:

- **Runtime registration and production verification.** `appStatus` is
  `not-integrated`. Nothing here has been loaded by the app, and only the release
  owner can move that status on evidence.
- **Two `None` defaults stay open by design** — the Leon of 1202 and the Ninos of
  365 — because Herodotus never identifies either man further. They are not
  oversights and should not be closed by guessing.
- **Three entities are absent from the older translation only**: `smyrnaeans`,
  `cymeans`, `crotoniats`, where Macaulay writes "the men of Kyme" and the modern
  edition names the people. Recorded as edition divergences, not repaired.
- **The edition defects in the table above** are for the edition owner. No edition
  byte was touched by this package, and none should be until somebody has decided
  what the offset churn costs.

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

## Book 7: the catalogue, and what to do with four hundred names

Polymnia is the longest book in the work and the largest single cast in the
library: **243 new entities**, and 3,354 mentions inside its own sections across
the two editions. Most of the new names come from one place — the muster at
Doriscus, where Herodotus walks down forty-odd nations giving each one its dress,
its weapons and its Persian commander, and then never mentions most of them
again.

### Two decisions about the catalogue

**The commanders are cast; the nations are not, one by one.** Every named
commander gets a card, however little the text says about him, because a reader
meeting *Pherendates son of Megabazus* wants to know he is the commander of the
Sarangae and nothing more is known. The nations that appear **only** inside
Herodotus's lists are bound instead to a single card, **The nations of the
lists** — Cissians, Hyrcanians, Gandarians, Sarangae, Utii, Myci, Moschi,
Tibareni, Macrones, Mossynoeci, Mares, Alarodians, Mariandyni, Milyans,
Lasonians, Pactyes and the rest. Forty cards each reading "one of the nations of
the army list" would be noise; this is the same reasoning that gives the Divine
Comedy package one card for the thirty Florentine houses. Peoples that do
anything in the narrative keep their own cards, and Book 7 adds four of them:
**the Immortals**, **the Sagartians** with their leather nooses, **the Satrae**
who have never submitted to anyone, and **the Bessi** who interpret their oracle.

**The old names are folded into the peoples they belong to.** Herodotus keeps
saying what a nation used to be called, and each of those names is now an alias
on the people itself rather than a card of its own: **Artaeans** and **Cephenes**
for the Persians, **Medonians** and **Maeonians** for the Lydians, **Briges** for
the Phrygians, **Hypachaeans** for the Cilicians, **Termilae** for the Lycians,
**Bithynians** for the Thracians of Asia, **Olympieni** for the Mysians.

### Namesakes

The catalogue reuses names without troubling to distinguish them, and eight of
its men share a name with somebody cast from an earlier book:

| Entity | Where | Against |
|---|---|---|
| `arsames-son-of-darius` | 1092, 1093 | Darius's grandfather Arsames |
| `artachaees-father-of-otaspes` | 1087 | the Artachaees who dug the Athos channel |
| `hystaspes-son-of-darius` | 1088 | Darius's father |
| `sisamnes-son-of-hydarnes` | 1090 | the judge Cambyses had flayed |
| `ariomardus-caspians` / `ariomardus-son-of-darius` | 1090 / 1100 | each other |
| `gobryas-son-of-darius` | 1095 | Gobryas of the seven |
| `prexaspes-son-of-aspathines` | 1119 | the Prexaspes who killed Smerdis |
| `megabyzus-son-of-zopyrus` | 1104, 1143 | his grandfather, of the seven |
| `megabazus-son-of-megabates` | 1119 | the conqueror of Thrace |

**Section 1105 names two men in three words.** "Hydarnes son of Hydarnes" is the
commander of the Immortals and the conspirator of Book 3, in that order; from
that point on every Hydarnes of this campaign is the son — the host who tells the
two Spartans they have never tasted freedom, and the man sent over the mountain
path. The patronymic at 1090 could be either and carries no card.

**Section 1120, the roll of ship captains, is worse than the catalogue**: it has
a Histiaeus, a Tymnes, a Pigres, a Candaules and a Siromus, and not one of them
is the man of that name already cast. Herodotus's Carian captains have nothing to
do with Histiaeus of Miletus, the Scythian steward Tymnes, the Paeonian Pigres,
the Lydian king Candaules or the Cyprian Siromus. Each earlier entity lost its
bare alias so a position table could own both.

Also here: **two men called Cadmus** (the Phoenician, and the man of Cos who
carried Gelon's money to Delphi and brought every coin back), **two called
Cleander** in one sentence at 1177 (the tyrant of Gela and his nephew), **two
called Cretines**, **two called Achaemenes** (the ancestor at the head of the
line, and Xerxes's brother), **two called Aristeas**, **two called Leoprepes**
(Theasides's father and Simonides's), **a third Atys** and **a third Otanes,
fourth, and fifth**.

### It corrects five things in the books already done

The adjacency sweep and the namesake work turned up four mis-bindings and one
gap in Books 1 to 5:

- **"Achaemenes" at 472** — where Prexaspes traces Cyrus's descent from the head
  of the line — was bound to Xerxes's brother, who was not born for two
  generations.
- **"Tymnes" at 798**, Histiaeus of Termera's father, was bound to Ariapeithes's
  Scythian steward.
- **The river Lycus at 632 and 679** was bound to Lycus son of Pandion. Rivers
  are not cast.
- **"Royal" was an alias of the Royal Scythians**, so the king's **Royal
  Judges** (411, 428, 786, 1216) and his **Royal Secretaries** (525) were being
  bound to a Scythian tribe. Both are now cards of their own — the judges are a
  named body Herodotus stops to explain — and the tribe answers to *Royal
  Scythians*.
- **Artabanus**, who talks Darius out of nothing in Book 4 (639, 699) and argues
  against the whole war here, had no card at all; neither did **Gorgo**, who at
  eight told her father to get up and leave before Aristagoras corrupted him and
  years later read the blank tablet from Susa.

### Deliberately unbound

- **Two Otaneses in the catalogue** — Patiramphes's father (1064) and Anaphes's
  (1086). There are at least five men of the name in the work and the text does
  not say which of them these are.
- **Hydarnes at 1090**, as above, and **Callias son of Hipponicus at 1173**, who
  is the grandson of the Callias of Book 6 and belongs to a later generation.
- **The rivers Lycus, Marsyas and Kephisos**, against the Silenus whose skin
  hangs at Celaenae, Thyia's father, and Lycus son of Pandion.
- **The Ariaramnes of Book 8** (1349), a Persian who died at Salamis, against the
  ancestor in Xerxes's genealogy.
- **The Etesian winds and the compass winds** (1061, 1190, and the Etesians of
  Book 6), against the Winds the Delphians built an altar to.
- **The Artayntes, Adeimantus, Aristodemus, Archidamus, Anaxilaus, Agis,
  Hegesilaus and Polydorus of Books 8 and 9**, which are other men of the same
  names and belong to books not yet authored.

Two dynastic names are left on one card each and flagged rather than split:
**Teaspis** (Sataspes's father in Book 4, Pharandates's here) and **Syennesis**
(Cilician kings of Book 1, Book 5 and Book 7). Herodotus gives no basis for
separating them, and no basis for joining them either; the cards say so.

### Judgement calls

- **The Winds** are cast as the power Delphi told the Delphians to pray to, and
  **Boreas** with his Attic wife Oreithuia as the one of them the Athenians
  claimed as a relative. **Thetis and the Nereids**, whom the Magi sacrificed to
  at Sepias, are cast for the same reason.
- **The Royal Judges** and **the Royal Secretaries** are cast as named bodies,
  like the Ephors and the Pythians of Book 6.
- **Talthybius** is cast as the hero whose anger fell on Sparta, and his
  descendants the **Talthybiads** separately, because the text treats them as two
  things.
- **Perses**, the son of Perseus and Andromeda from whom the Persians take their
  name, is cast: Xerxes's claim of kinship with Argos turns on him.

### An edition divergence inside an oracle

The Spartans' oracle at 1241 says their city will be sacked by **"the children of
Perses"** in Macaulay and by **"the sons of Perseus"** in the modern edition.
Each edition is bound to the figure it prints — Perses in the one, Perseus in the
other — and a test pins both. It is the only place in the package where the two
texts name different people in the same line.

### Spot-read and sweep

Twenty mentions drawn at random, ten per edition: all correct. The adjacency
sweep over every Book 7 mention whose matched text abuts a capitalised word
turned up the **"Royal Judges"** mis-binding described above, which had been
sitting in Books 3 and 5 since those books were authored. That is the third time
the sweep has found something no coverage test could.

## Book 8: a smaller cast, and two king-lists that look alike

Urania is Artemisium, the burning of the Acropolis, Salamis, and the embassies
of the spring after. It adds **106 entities** and 2,043 mentions inside its own
sections — a third of Book 7's intake, because most of its principals were cast
there and are bound forward: Xerxes, Mardonius, Artabazus, Artemisia,
Themistocles, Leotychides, Hydarnes the younger, Demaratus, Alexander of
Macedon, the Immortals.

What is new is the Greek command — **Eurybiades**, who held supreme authority
because the allies would not follow Athens, and **Adeimantus of Corinth**, who
was bought at Artemisium and told Themistocles at Salamis that a man without a
city had no vote; **Aristides**, ostracised and rowing through the blockade to
tell his worst enemy that the fleet was surrounded; **Mnesiphilus**, whose
argument Themistocles repeated to Eurybiades as his own; and **Sikinnos**, the
servant sent twice across the water with a lie, who was made a Thespian citizen
and a rich man for it.

### The namesakes are all pairs this time

| Entity | Where | Against |
|---|---|---|
| `phylacos-delphi` / `phylacos-samos` | 1299 / 1345 | the Delphian hero, and the Samian who destroyed Greek ships |
| `polycritos-aegina` | 1351, 1352 | Crius's *father* Polycritus of Book 6 — this is Crius's son |
| `histiaeus-samos` | 1345 | Histiaeus of Miletus, and Histiaeus of Termera |
| `ariaramnes-salamis` | 1349 | the ancestor in Xerxes's genealogy |
| `adeimantus-corinth` | 1265–1353 | Aristeas of Corinth's father |
| `charilaos-sparta` | 1390 | Maeandrius's brother |
| `anaxandridas-eurypontid` | 1390 | Cleomenes's and Leonidas's father |
| `artayntes-samos` / `ithamitres-samos` | 1389 | **each other's Book 7 counterparts** |

The last of those is the neatest inversion in the work. Book 7 has *Artayntes
son of Ithamitres* commanding the Pactyes; Book 8 has *Artayntes son of
Artachaees* commanding at Samos, with *Ithamitres his brother's son* in joint
command. Two men of each name, and the father-and-son relation runs the opposite
way. All four are now separate cards and a test walks them.

### Two king-lists that look alike

Section 1226 recites the **Agiad** descent for Leonidas; section 1390 recites the
**Eurypontid** descent for Leotychides. Eleven of the twelve new names in the
second list are men who appear nowhere else, and four of them share a name with
somebody already cast — Anaxandridas, Charilaus, Anaxilaus, Archidamus,
Hegesilaus. Both lists are now bound name by name, and a test asserts that no
name in one is bound to a man from the other. Section 1390 also names
**Leotychides twice**: the admiral, and the ancestor he was called after.

The Macedonian descent at 1396–1398 does the same thing on a smaller scale:
**two men called Aëropos** — Perdiccas's brother and Alcetes's father — and
**three called Amyntas in one sentence**, the king twice and then his grandson in
Asia, who was given Alabanda in Phrygia.

### The personified powers

Book 8 is the richest book in the work for these, and they are cast:

- **Justice, Insolence, Riot and Victory** in the oracle of Bakis on Salamis —
  Justice subdues Riot, Insolence's first-born son, and the day of freedom comes
  from Zeus and from Victory.
- **Persuasion and Compulsion**, the two great deities Themistocles said the
  Athenians had brought to Andros, against **Poverty and Helplessness**, the two
  unprofitable gods the Andrians said never leave their island — which is why
  they would not pay. It is the best joke in the Histories and it is unreadable
  without four cards.
- **Iacchus**, the cry Dicaeus heard coming out of deserted Eleusis.

### Source oddities

Macaulay prints **Anaxandriddes** with a doubled *d* at 1390, and **Keïans**,
**Phaÿlos**, **Autonoös**, **Artaÿntes**, **Aëropos** and **Ischenoös** with
diaereses; all are carried as aliases. The one place the two editions differ in
what they name is the escort Sparta gave Themistocles: the modern edition
capitalises the three hundred **"Horsemen"** as a body, Macaulay writes
*horsemen* in lower case, and so they are not cast.

### Gated outcomes

Five cards written from earlier books gain snapshots here rather than rewrites:
**Xerxes** at 1031 (he inherits and is talked into the war) and at 1356 (the
mole, the messenger, the flight), **Mardonius** at 1359 (he asks to stay behind
with three hundred thousand), **Artemisia** at 1347 (she rams her own side to get
an Athenian off her tail, and Xerxes says his men have become women),
**Themistocles** at 1371 (the money — the Euboeans', the islanders', and the
five talents he passed to Eurybiades as his own), and **Leotychides** at 1390
(the command of the fleet at Aegina).

### Spot-read and sweep

Sixteen mentions drawn at random, eight per edition: all correct. The adjacency
sweep over Book 8's mentions turned up nothing — the first book where it found no
mis-binding, which is what it should look like once the namesake tables are right
before the sweep is run rather than after.

## Book 9: Plataea, Mycale, and the last of the namesakes

Calliope is the shortest book of the nine and the one with the smallest new cast,
because almost everybody who matters at Plataea was already carded in Books 7 and
8 and is bound forward: **Mardonius**, **Artabazus**, **Masistius**,
**Leotychides**, **Aristides**, **Themistocles**, **Xerxes**, **Amestris**,
**Masistes**, **Artayctes**, **Artayntes of Samos**, **Ithamitres of Samos**,
**Tigranes**, **Mardontes**, **Alexander of Macedon**, **Theomestor**,
**Aristodemus the Coward**, **Xanthippus**, **Sophanes**, **Eurybates**,
**Pharandates**. It adds **99 entities**, and 1,123 mentions in the older
translation and 1,117 in the modern one fall inside its own sections.

### Pausanias was never carded, and he is named in four books

The general of the most famous victory in the work had **no card at all** before
this pass, although his name stands in Book 4 (the bronze mixing-bowl at the mouth
of the Pontus), Book 5 (the satrap's daughter he afterwards sought in marriage)
and Book 8 (the arrogance the Athenians later used as their pretext for taking the
leadership of Greece away from Sparta). Forty-five mentions in Macaulay and
forty-seven in the modern edition were going unbound. He is `pausanias`, `central`,
with two gated updates — the regency and the march out at 1413, and the victory and
what he did with it at 1467.

That is the one thing the coverage tests could not have caught: a name that appears
in four books and is nobody's namesake simply never got written. It was the Book 9
name census that found it, on a run whose purpose was to list what the *new* book
needed.

### Namesakes

Nine this time, and three of them are three-way:

| Entity | Where | Against |
|---|---|---|
| `hegesistratus-sigeum` / `hegesistratus-elis` / `hegesistratus-samos` | 855 / 1440–1444 / 1493–1495 | Peisistratus's son, Mardonius's diviner, and the Samian envoy whose name Leotychides took for an omen |
| `lampon-athens` / `lampon-aegina` / `lampon-samos` | 1424 / 1481 / 1493 | Olympiodorus's father, the Aeginetan who wanted Mardonius impaled, and the Samian envoy — all in one book |
| `oeobazus-three-sons` / `oeobazus` / `oeobazus-cardia` | 640 / 1091 / 1518–1522 | the father whose three sons Darius killed for asking, Siromitres's father in the catalogue, and the man who carried the bridge-ropes into Sestos |
| `tisamenus` / `tisamenus-diviner` | 703, 938 / 1436–1439 | Autesion's father in the Theban descent, and the Elean the Spartans made a citizen |
| `arimnestus-sparta` / `arimnestus-plataea` | 1467 / 1475 | the Spartan who killed Mardonius, and the Plataean who heard Callicrates die — eight sections apart |
| `artembares-mede` / `artembares-persia` | 113–115 / 1525 | the Mede whose son the boy Cyrus whipped, and Artayctes's forefather in the last sentence of the work |
| `thersander` / `thersander-orchomenos` | 703, 938 / 1419 | Polyneices's son, and the Orchomenian who reported the weeping Persian |
| `bias` / `bias-argos` | 27, 169 / 1437 | Bias of Priene, and Melampus's brother in the Argive bargain |
| `artontes` / `artontes-son-of-mardonius` | 525 / 1487 | Bagaeus's father, and Mardonius's son paying men to say they buried him |
| `aeropos-brother` / `aeropos-father-of-alketes` / `aeropos-tegea` | 1396 / 1398 / 1429 | two Macedonians and Echemus's father |
| `megarians` / `megarians-sicily` | passim / 1178 | Megara on the Isthmus, and the Megarians Gelon sold out of Sicily |

Two of those closed `None` defaults the earlier books had deliberately left open
and recorded in this file: **Bias of Argos** and the **Persian Artembares**. Both
are now bound, and the notes above have been updated rather than left standing.

### Two aliases had to be withdrawn to make room

`tisamenus` carried the aliases *Tisamenus* and *Tisamenos*, which bound the
Theban ancestor to the diviner at Plataea as well; `pytheas` carried *Pytheas*,
which bound the Aeginetan marine of Book 7 to Lampon's father at 1481; and
`artontes` carried *Artontes*. In each case the alias was stripped and a position
table put in its place, because the compiler refuses two ids on the same span —
which is how the collision surfaces, and is the reason the check for it is run
before every build rather than after a failure.

### Lampon's father is left unidentified on purpose

Herodotus writes "Lampon son of Pytheas, one of the leading men of Aegina" at 1481
and never says whether this is the Pytheas son of Ischenous whom the Persians
dressed in myrrh and fine linen and showed off to the army. Commentators identify
them; the text does not. So `pytheas-father-of-lampon` is its own reference card
and says so in its body. The same restraint applies to Herodotus's unnamed
figures: the woman of Cos who took Pausanias by the knees is one of the most
memorable people in the book and has no name in it, so she has no card — the scope
line says named people and named peoples, and it means it.

### The adjectival forms of peoples are not bound

Book 9 is full of them: *the Plataean land*, *the Plataean region*, *the Plataean
city*, *the Theban territory*, *the Carystian land*. Six of the nine singular
"Plataean"s are territory rather than people, and of the ten "Theban"s in the work
most are **the Theban Zeus in Egypt**, which has nothing to do with the Thebans of
Boeotia at all. Singular forms were added for `eleians`, `tegeans`, `apsinthians`
and `megarians`, where every occurrence is ethnic, and withdrawn again for
Plataean, Theban and Carystian after the sweep showed what they were binding. A
test pins the withdrawal.

### Peoples the catalogue at 1431 named and nobody had cast

The battle order of the Greek army names twenty-four contingents, and eleven of
them had no card: the **Megarians** (sixteen mentions across five books), the
**Phliasians**, **Lepreates**, **Anactorians**, **Palians** of Pale in
Cephallenia, **Tirynthians**, **Mycenaeans** and the Arcadian **Orchomenians** —
distinct from the Boeotian Orchomenus that Thersander came from — plus the
**Messenians** (five books), **Cadmeians**, **Enchelians**, **Dekeleians**,
**Edonians**, **Asopians**, **Apolloniates**, **Iamidae** and **Telliadae**.
Herodotus's battle orders are the densest source of uncast peoples in the work,
which is worth knowing for the next translated history in the queue.

### Spot-read and sweep

Twenty-eight mentions drawn at random, fourteen per edition: all correct. The
adjacency sweep over Book 9's mentions found eighty-odd hits and no mis-binding
except **"Plataean Hera"** at 1464, which is the goddess's epithet and not the
people — the finding that led to withdrawing the singular adjectives above. The
unbound-tabled-names audit over 1404–1525 came back with a single line,
**"Argos"** at 1437, which is the city and correctly carries no card.

## Validation

`python3 books/characters/build_the_histories.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Seventy-nine
focused tests for this package. No edition changes, no network generation, no API
spend: every card in this package was written in the authoring conversation and
committed as a file.
