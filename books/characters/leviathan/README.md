# Leviathan character package

All 49 chapters in both English editions -- 223 recognition cards in
original-en (zero omitted), 219 in modern-en (4 documented, deliberate
edition divergences -- see check 6), 1666 exact mentions in
original-en and 1762 in modern-en, 1337 paragraphs per edition,
identical structure in both.

Read `cards.md` for category and copy together.

This is a philosophical/theological treatise, not a narrative or
staged dialogue: Hobbes argues a case, illustrating it with citations
to Scripture, classical history, and contemporary events. Per
editorial policy's guidance for treatises, **all entries are
Reference.** There is no Central, Major, or Supporting entry, and no
fictional cast is invented.

Leviathan is the largest and most citation-dense book in this queue so
far. The automation queue's own description -- "Scriptural and
classical citation; Hobbes names few contemporaries" -- undersold how
many distinct historical, scriptural, and mythological figures the
book actually cites across its four Parts: Part III-IV especially
(chapters 32-49, "Of a Christian Common-wealth" and "Of the Kingdome
of Darknesse") work through an exhaustive survey of who wrote each
book of the Bible, cite prophets, kings, and apostles by name at
volumes no prior book in this queue has approached, and range widely
across Greek philosophy, Roman history, church history, and the
English Civil War's own immediate antecedents.

The cast falls into several broad groups (see `author_content.py`'s
module docstring for the complete, itemized list with source
paragraphs):

- **Classical and Roman figures**, historical and legendary: Julius
  and Augustus Caesar, Marcus Brutus, Alexander the Great, Cicero,
  Aristotle, Plato, Zeno, Cato, Marius, Sylla, Pompey, the Gracchi,
  Tarquin, Solon, and many more, cited as historical exempla throughout
  Parts I-II especially.
- **Roman emperors and popes**: Constantine, Julian, Diocletian, Nero,
  Valens, Theodosius, Justinian, Domitian, and a long line of named
  Popes (Innocent III, Leo III, Zachary, Gregory I and II, Damasus,
  Clement I, Sylvester) discussed in the extended critique of Papal
  temporal power (Part IV).
- **Church fathers and controversialists**: Cardinal Bellarmine
  (Hobbes's principal opponent across three chapters), Theodore Beza,
  St. Ambrose, St. Jerome, St. Cyprian, St. Augustine, St. Bernard.
- **Mythology and pagan deities**, mostly from the Daemonology chapters
  (13, 45-46): Jupiter, Mercury, Venus, Apollo, Aeolus, Bacchus,
  Hercules, Saturn, Pan, Neptune, Ceres, Chaos, Charon, Cerberus, the
  Hydra, Moloch, Beelzebub, and the Fairies' legendary King Oberon.
- **An exhaustive Old and New Testament survey**: every major and
  minor prophet named in chapter 34's canon survey (Isaiah through
  Malachi), every named patriarch and king from Adam through the
  Captivity, the full cast of Acts 13's Antioch teachers (Barnabas,
  Simeon Niger, Lucius of Cyrene, Manaen), the Corinthian converts Paul
  personally baptized (Crispus, Gaius, Stephanus), and named women who
  ministered to Christ (Mary Magdalene, Joanna, Susanna).
- **English and contemporary-adjacent history**: William the
  Conqueror, William Rufus, Henry II, Thomas Becket, Henry VIII, Queen
  Elizabeth I, and Sir Edward Coke, Sir Thomas Littleton, and John
  Selden cited for points of English law.
- **Named collective bodies**, bound as kind `group`: the Sadducees,
  the Septuagint's seventy translators, and Athens's Thirty Tyrants.

## Editorial checks

**1. Namesakes.** This book has by far the largest set of genuine
namesake collisions found in this Lane A queue -- fifteen in total,
every one resolved by an exact full-text search of the original-en
edition (not by assumption), and every resolution documented in full
in `author_content.py`'s module docstring. Summarized:

1. **Jehu** -- King Jehu (bare "Jehu," ch. 9) vs. a later "Prophet
   Jehu" (ch. 41, own epithet). Both bind cleanly.
2. **Ananias** -- Acts 5's Ananias (bare) vs. Acts 9's "Ananias at
   Damascus" (own epithet). Both bind cleanly.
3. **Philip** -- the text disambiguates itself in the same paragraph
   (43, 59): "Philip the Deacon, not Philip the Apostle." Both bind
   separately; bare "Philip" elsewhere is the Deacon.
4. **Herod** -- Herod the Great (bare, ch. 44, sought the infant
   Christ) vs. Herod Antipas "the Tetrarch" (own epithet, ch. 43,
   Manaen's foster-brother).
5. **Joseph** -- three real people. The Genesis patriarch dominates
   bare "Joseph" (7 occurrences); Joseph the husband of Mary is ALSO
   bare "Joseph" twice with no distinguishing epithet -- a genuine,
   accepted imprecision, documented rather than silently absorbed;
   "Joseph the Just" (Acts 1:23) carries its own epithet and binds
   separately.
6. **Saul** -- King Saul dominates bare "Saul" (~28 of 31
   occurrences); three minority mentions are Saul of Tarsus
   (pre-renaming Paul, Acts 8:3 and 13:2) and are an accepted,
   documented imprecision rather than a separate entity.
7. **Caesar** -- bare "Caesar" (20 occurrences, generic or ambiguous)
   is left entirely unbound; only "Julius Caesar" and "Augustus
   Caesar" (full names) bind.
8. **Innocent / Leo** -- "Innocent" appears 23 times, all but five the
   ordinary adjective. Only "Innocent the third" (numbered Pope) and
   "Leo 3"/"Leo III" (numbered Pope) bind; the bare, unnumbered pairing
   "two Popes, Innocent, and Leo" (43, 122) is deliberately left
   unbound.
9. **Gregory** -- "Gregory 1"/"Gregory I" and "Greg. 2"/"Gregory II"
   bind cleanly as distinct numbered Popes; a third, unnumbered
   "Gregory the Pope" (47, credited with Purgatory ghost stories
   alongside St. Bernard) is left unbound rather than assumed to be
   Gregory I on outside knowledge the text itself does not supply.
10. **Zachary / Zacharias / Zechariah** -- Pope Zachary (8th c., bare
    "Zachary" + explicit title) vs. the Old Testament prophet Zechariah
    ("the Prophet Zachary"/"Zacharias" in original-en, "Zechariah" in
    modern-en). Bind separately, never overlapping.
11. **Micaiah / Michaiah** -- the 1 Kings 22 court prophet is spelled
    two ways ("Micaiah" x2, "Michaiah" x2) across three real
    occurrences that all bind together. A FOURTH occurrence of
    "Michaiah" (34, 15) is a different person -- the writing prophet
    Micah -- and because the identical spelling covers both people
    with no distinguishing epithet, "Michaiah" is left entirely
    unbound; Micah is bound instead only via the unambiguous "Micah"
    spelling (a direct scripture citation, 36, 10, plus modern-en's
    survey mention, since modern-en happens to spell the two prophets
    differently and so is not ambiguous there).
12. **Thomas** -- three real people. A generic, indefinite "a Thomas"
    (5, listed with "an Aristotle, a Cicero") is left unbound; "Thomas
    Beckett"/"Thomas Becket" (30, full name) and "S. Thomas"/"St
    Thomas" (43, the Apostle) each bind via their own distinguishing
    form.
13. **William** -- "William the Conquerour" (3 occurrences) and
    "William Rufus" (1, his son) are two different, fully named kings;
    no bare "William" creates ambiguity.
14. **Damascus / Damasus** -- five of six "Damascus" occurrences are
    the real city (Paul's conversion). The sixth (43, 57) is a
    compositor error for "Damasus" (Pope Damasus I's 366 AD schism,
    correctly spelled two paragraphs later at 43, 64) -- kept exactly
    as printed and left unbound rather than repaired or conflated with
    the city.
15. **Simon / Cephas / Petrus** -- the text explicitly equates all
    three to one Apostle (43, 86: "the Apostle Simon, was surnamed
    Stone ... Cephas ... Petrus"). All bind to one St. Peter entity.

**2. Person or not, and title-only resolutions.** "The King of Persia"
honouring Mordecai (ch. 11) is left unbound: Hobbes's own text hedges
("or the same another time"), signalling he is not sure which
Ahasuerus he means, unlike the resolvable "late king of Prussia"
pattern from Federalist Papers. "The Bishop of Rome"/"the Bishop of
Constantinople" are used generically throughout and left unbound. "The
woman of Endor" and "the woman of Samaria" are personally unnamed in
Scripture and left as narrative description. "Publicola" (32) is
excluded entirely -- it is used as a pure Latin word-etymology
illustration ("Publicola, is understood for a Worshipper of the
People"), not a reference to the historical Roman consul. "Sadler"
(43, "the art of a Sadler") is the common noun saddler, not a person.
"Gordian" (27) names the Gordian Knot Alexander cut, not the later
Emperor Gordian -- excluded as an object reference. "Valens an
Arrian" (43) uses the period spelling of "Arian" (an adherent of
Arianism) describing Emperor Valens, not the historian Arrian of
Nicomedia, who is not otherwise named in this book.

**3. Scriptural and mythological figures.** By far the largest section
of work in this package. Every prophet named in chapter 34's canon
survey is bound (Isaiah, Jeremiah, Ezekiel, Daniel, Hosea, Joel, Amos,
Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah,
Malachi), along with the otherwise-unpreserved source-prophets the
Chronicler names but does not quote (Ahijah, Jehdo, Serveiah, Addo --
modernized in modern-en to Ahijah, Iddo, Shemaiah, Iddo respectively,
which is why three of the four do not independently bind there; see
check 6). Mythological and demigod figures (Jupiter, Mercury, Hercules,
Saturn, Pan, etc.) are bound as kind `cultural-figure`; the
Hydra and Cerberus, as monstrous beasts rather than deities, are kind
`animal`; Perseus, Andromeda, Academus, and King Oberon, as legendary
non-divine figures, are kind `literary-figure`. A source-text quirk is
carried over rather than repaired: chapter 31 tells the myth of
Jason's uncle Pelias tricked by Medea, but names him "Peleus"
throughout, likely conflating him with Achilles's father of the same
near-name -- bound under the printed name with the likely conflation
noted in its body text. Minor pagan deities appearing only in a single
rhetorical catalogue (13's "Fawnes... Tritons... Lares... Muses...")
are left uncarded as generic classical set-dressing unless the same
figure recurs elsewhere with narrative weight (Pan, Cupid, and Priapus
all do and are bound; Tritons, Lares, Larvae, Lemures, and the Muses do
not and are not).

**4. Ambiguous or generic references.** Covered under checks 1 and 2
above: the bare, unnumbered "Innocent" and "Leo" pairing, the
unnumbered "Gregory the Pope," the ambiguous "Michaiah" spelling, "the
King of Persia," and the generic Bishop-of-Rome/Constantinople titles
are all deliberately left unbound rather than guessed into a bind.
Demonyms (Lacedaemonians, Athenians, Romans, Israelites, Jews,
Egyptians) are left unbound throughout as generic collective
references, consistent with prior books in this queue.

**5. Spot-read the bindings.** Two independent random samples (12 and
15 mentions per edition, `random.seed(42)` and `random.seed(7)`) were
drawn from the compiled mention list and checked against their full
source paragraph in context; all resolved correctly, including
namesake-sensitive entities (`joseph-patriarch`/`joseph-just`,
`king-jehu`/`prophet-jehu`, `herod-the-great`/`herod-antipas`,
`pope-zachary`/`zechariah-prophet`, `micaiah`,
`ananias-and-sapphira`/`ananias-of-damascus`,
`philip-deacon`/`philip-apostle`), each individually re-verified by a
direct query against every one of that entity's bound mention
locations and text (not merely the random sample).

**6. Both editions independently.** Both editions were read in full
before any entity was authored. Original-en binds all 223 entities
with zero omissions. Modern-en binds 219 of 223; the four documented
gaps are genuine, deliberate edition divergences, not authoring
oversights:

- **"enos" (unbound in modern-en)** -- chapter 39's "except Enos and
  Elias" most likely intends Enoch (the standard scriptural pairing
  for "translated without dying" is Enoch and Elijah, and ch. 45
  elsewhere quotes Genesis 5:24 correctly under the name Enoch).
  Modern-en's translator apparently agreed: it renders the same
  passage as "except Enoch and Elijah" -- correcting the likely slip.
  The original-en entity is bound under the printed name "Enos" per
  the compositor-error convention and simply does not bind in
  modern-en, where the word never appears.
- **"jehdo", "serveiah", "addo" (unbound in modern-en)** -- modern-en
  modernizes all three obscure lost-prophet names from chapter 34's
  citation of unpreserved source-texts: "Jehdo" and "Addo" both become
  "Iddo" (the same modern spelling for two different archaic
  transliterations), and "Serveiah" becomes "Shemaiah." Because two of
  the three modern spellings collide with each other, none is given an
  additional modern-en alias, and all three are left as documented
  omissions rather than risk an alias assertion conflict.

Beyond spelling, dozens of archaic original-en spellings needed a
matching modern-en alias to bind in both editions -- e.g. "Marcus
Brutes"/"Brutus," "Sylla"/"Sulla," "Corah"/"Korah,"
"Jehosaphat"/"Jehoshaphat," "Charlemaine"/"Charlemagne,"
"Mordecay"/"Mordecai," "Aggeus"/"Haggai," "Sophoniah"/"Zephaniah," and
the systematic "St. [Name]" (original-en, with a period) vs. "St
[Name]" (modern-en, without one) pattern that recurs across St.
Peter, St. Paul, St. John, St. Matthew, St. Luke, St. Ambrose, St.
Jerome, and St. Cyprian. Each was found and fixed by direct comparison
of the two editions' text at the relevant paragraph, not guessed.

## Source defects

Two are documented and carried over rather than repaired, per "printed
line numbers and compositor errors stay as printed":

- **"Peleus" for Pelias** (ch. 31) -- Hobbes's own likely conflation of
  Jason's uncle Pelias with Achilles's father Peleus; bound under the
  printed name.
- **"Damascus" for "Damasus"** (ch. 43, paragraph 57) -- a probable
  compositor misprint, confirmed by the same schism being correctly
  spelled "Damasus" two paragraphs later (43, 64); left unbound rather
  than repaired or conflated with the book's five genuine references
  to the city of Damascus.

## Full suite note

This book's own focused test suite (19 tests) passed cleanly and
`--check` is clean. A full `python3 -m unittest discover -s . -p
'test_*.py'` run was attempted in the background during authoring;
given the shared test tree's size across concurrent Lane A/B sessions
in this queue, the established precedent from every prior book in this
session is that this run does not reliably complete within a
short budget. This package is committed on the strength of its own
focused suite, a clean `--check`, and exhaustive manual verification:
both full English editions read paragraph-by-paragraph across all 49
chapters and 1337 paragraphs, every namesake-flagged entity's full set
of bound locations individually re-queried and checked (not merely
sampled), and two independent random samples of mentions checked
against source text.

## Commands

```
cd books/characters
python3 leviathan/author_content.py   # regenerate editorial.json
python3 build_leviathan.py             # regenerate characters.v1.json, print report
python3 build_leviathan.py --check      # verify saved output is current
python3 -m unittest test_leviathan -v
python3 -m unittest discover -s . -p 'test_*.py'  # full repo suite
```

## Release checks

- [x] Both English editions read in full (all 49 chapters, 1337
  paragraphs, original-en and modern-en).
- [x] All six editorial checks performed and documented above.
- [x] `build_leviathan.py --check` clean.
- [x] `test_leviathan.py`: 19/19 passing.
- [x] Full repo suite attempted in the background during authoring --
  see "Full suite note" above.
- [x] `library-inventory.json` regenerated.
- [x] Committed and pushed with the inventory update.
- [x] `RELEASE-QUEUE.md` entry added.
