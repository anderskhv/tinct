# Confessions character package

All thirteen Books in both English editions -- 72 recognition cards in each
(73 authored, one omitted), 233 exact mentions per edition, 462 paragraphs
per edition (38, 18, 21, 31, 25, 27, 27, 31, 38, 70, 41, 42, 53). One
omitted entity on both sides: Augustine himself.

Read `cards.md` for category and copy together. Like Meditations, this is
a private address, spoken entirely to God as "Thou," not a dialogue or a
novel with a cast -- so per editorial policy's guidance for treatises
("cited thinkers normally remain references"), most of the 72 bound
entries are Reference: a philosopher cited to make a point, a biblical
patriarch invoked in an exegetical aside, a pagan god named once in a
mocking list. Unlike Meditations, though, Books 1-9 are genuine
autobiographical narrative with a real recurring human cast -- friends,
a mother, a bishop -- so several entries earn a higher tier:

- **Central:** Augustine, the narrator and author, whose conversion the
  whole book recounts. He never names himself in the running text -- the
  entire work addresses God as "Thou" -- so, per editorial policy's
  instruction not to cast a treatise's or memoir's own narrator as a
  spoken-of character, this entry carries no bindable alias and is the
  package's one omitted entity, the same treatment Meditations gives
  Marcus Aurelius.
- **Major** (sustained, substantive presence across multiple Books, not a
  single scene): **Monnica** (present from Book 1 through the extended
  death narrative of Book 9, though her proper name is used only once, in
  Book 9's closing memorial -- elsewhere always "my mother"), **Alypius**
  (Thagaste through Milan, with his own Book 6 gambling-addiction story),
  **Nebridius** (fellow seeker across Books 4, 6, 7, 9), **Ambrose**
  (whose preaching unlocks Scripture for Augustine and who is shown
  defending his church against imperial pressure in Book 9).
- **Supporting** (recurring or locally significant, without Major's
  multi-Book weight): **Patricius** (Augustine's father, a brief but real
  Book 9 portrait), **Adeodatus** (his son, present at Cassiacum and
  baptism), **Simplicianus** (whose account of Victorinus precipitates
  Book 8), **Victorinus** (the converted rhetorician whose story
  Simplicianus tells), **Pontitianus** (whose account of Antony triggers
  the garden crisis), **Faustus** (the Manichaean bishop whose
  disappointing meeting begins Augustine's break with the sect).

## Editorial checks

**1. Namesakes.** No genuine collisions were found -- unlike Aristotle's
Politics (nine collisions) or Meditations (five), this translation never
uses one bare word for two different people anywhere in the text. The one
near-collision is **Paul / Saul / Paulus** at 8:10: "that least of Thy
apostles ... for his former name Saul, was pleased to be called Paul,"
immediately after "Paulus the Proconsul, his pride conquered." Paul (the
apostle, formerly Saul) and Paulus (Sergius Paulus, the Roman proconsul
whose conversion in Acts a Christian tradition -- which Augustine repeats
without endorsing its accuracy -- says the apostle's new name honored) are
two different people, but they never need location-scoped `bind()`: "Paul"
and "Paulus" are different letter-strings, and word-boundary-safe matching
(`(?<!\w)Paul(?!\w)`) cannot match "Paul" inside "Paulus," because the
trailing "-us" is a word character and breaks the boundary. Both entities
carry plain global aliases (`Paul|Saul` on `paul`; `Paulus` on
`paulus-proconsul`) and `build_confessions.py` needs no custom `bind()`
override at all -- it uses `reviewed_aliases.bind` directly.
`test_paul_saul_paulus_distinct_by_spelling_not_location` and
`test_no_bind_override_needed` check this.

Two entities intentionally share one card because the text itself treats
them as one identity under two names: **Jove/Jupiter** (`Jove|Jupiter`,
the same pagan god) and **Cicero/Tully** (`Cicero|Tully`, the same
person -- "Tully's Orations" at 5:10, "Cicero's Hortensius" at 8:17).
`test_jove_alias_covers_both_names` and
`test_cicero_tully_alias_covers_both_names` check both aliases fire.

**2. Person or not.** Excluded as non-persons: **"Hortensius"** (3:6,
8:17) is the title of Cicero's dialogue ("a certain book of Cicero ...
called 'Hortensius'"), not a person -- easy to mistake for one given how
often character-card work runs into "a work named after its author," but
here it is the reverse (a work Augustine names by its own title, which
happens to sound like a personal name). Generic sect and demonym
collectives are excluded throughout: Manichees/Manichee/Manichaean
(Augustine's former sect, referred to as a body, never a specific
organized collective the way "the Thirty" was in Meditations), Catholics,
Platonists, Academics/Academicians, Arians, Christians, Gentiles,
Egyptians, Athenians, Latins, Greeks. `Israel` (10:51, "Thou that keepest
Israel shalt neither slumber nor sleep") is a place/nation reference in a
liturgical formula, not the patriarch Jacob-Israel as a person, and stays
unbound. `Jerusalem`, `Rome`, `Carthage`, `Milan`, `Ostia`, `Thagaste`,
`Africa`, `Alexandria`, `Egypt`, `Macedonia`, `Thessalonica` are places,
watched carefully per the "cities named after founders" warning -- none of
them is used here to actually address the person a city is named after
(contrast Meditations' "the lovely city of Cecrops," which does). Also
excluded: `Duad`/`Monad` (Manichaean numerological concepts, not persons)
and the angelic orders `Principalities`/`Powers`/`Thrones`/`Dominions`/
`Cherubim`/`Seraphim` listed at 12:29 (ranks, not named individuals).
`test_hortensius_and_generic_sect_names_not_bound` checks the sect/
demonym exclusions.

**3. Scriptural and mythological references.** Bound to confirm identity
without importing the whole surrounding story: the Genesis patriarchs
Adam, Eve, Abraham, Isaac, Jacob, Esau, Joseph; the lawgiver Moses (the
subject of sustained address in Books 11-12, where Augustine questions
what Moses himself meant and intended by the creation account, not merely
citing him); David, Solomon, Isaiah, Noah, Elijah, Tobias; the Virgin
Mary; the apostle Paul and, in Book 13's Philippians exegesis, Onesiphorus
and Epaphroditus. The pagan pantheon -- Jove/Jupiter, Juno, Venus, Saturn,
Mars, Minerva, Neptune, and the Egyptian Anubis -- is bound as
`cultural-figure`, kept distinct from the non-divine classical/literary
figures bound as `literary-figure`: Aeneas, Dido, Creusa (all from
Virgil's Aeneid), Danae (from the Terence-quoted Jove story), Medea, and
the Pylades/Orestes friendship pair. Manichaeus (Mani, the sect's founder,
named five times in Book 5 as the author of doctrines Augustine tests
against astronomical calculation) is kept distinct from the generic,
unbound "Manichees" -- he is a specific named person, not a collective.

**4. Ambiguous or generic references.** Left deliberately unbound: the
unnamed physician of Book 4 who advises Augustine against astrology
(never given a name, only "that old man" -- he cites Hippocrates, who is
bound, but is not himself named); the unnamed beggar and unnamed powerful
senator of Book 6; "my mother," "my father," and similar unnamed-relation
references throughout Books 1-8 before Monnica and Patricius are finally
named by proper noun in Book 9 (the same pattern Meditations' README
documents for Marcus's unnamed father and teachers -- a possessive
relation is not a bindable proper noun); the bare "Emperor"/"Empress" at
9:14-15 (Valentinian and Justina are named by proper noun elsewhere in the
same passage and are bound there); and the plural, unnamed "brethren"
supplying Paul's needs "out of Macedonia" at 13:36, distinct from the two
named individuals (Onesiphorus, Epaphroditus) in the same Philippians
passage.

**5. Spot-read the bindings.** I spot-read more than ten mentions per
edition at random (`random.seed(7)`, 12 per edition, 24 total) after
building the package, cross-checking each against the paragraph context
read while authoring; every one resolved to the person expected --
`nebridius` at 6:16 and 4:5, `firminus` at 7:8, `verecundus` at 9:5,
`homer` at 1:22, `jove` at 1:26 and 1:24 (including the `Jove's` and
`Jove` spellings), `moses` at 12:31, `alypius` at 8:13 and 7:24, `cicero`
at 3:6 ("Cicero"), `pontitianus` at 8:16, `elijah` at 13:39,
`paulus-proconsul` at 8:10 ("Paulus," correctly distinct from the `paul`
entity's "Saul" three words later in the same paragraph), `cyprian` at
5:14, `creusa` at 1:21, `juno` at 1:33, `simplicianus` at 8:2, `jove` at
1:25 (the `Jupiter` spelling), `ambrose` at 5:22, `catiline` at 2:10, and
`photinus` at 7:24. I additionally read every location cited in checks
1-4 above in full context in both editions while authoring.

**6. Both editions independently.** I read all thirteen Books in full,
paragraph by paragraph, in both editions before authoring, and built the
candidate list from a systematic capitalized-word frequency sweep of both
texts (`\b([A-Z][a-z']+(?:[-'][A-Z][a-z']+)*)\b`, minus a stopword set),
the same method used for Meditations -- there is no
`confessions-threads.json` for this book to use even as a lead. The two
editions render every name identically: `omittedEntities: ["augustine"]`
on both sides (the same one entity, for the same reason, on each), and
mention counts match exactly, 233 to 233. Unlike Aristotle's Politics,
this translation shows no footnote/page-header apparatus bleeding into
the running prose on either side -- the candidate-frequency sweep found
near-identical counts and locations for every name across both editions
throughout, and no paragraph was found with a name present in one edition
and a garbled or missing parallel in the other.
`test_both_editions_agree_on_mention_count` checks this explicitly.

## Source review

Both source files have 13 chapters and 462 paragraphs, with identical
per-chapter paragraph counts (38, 18, 21, 31, 25, 27, 27, 31, 38, 70, 41,
42, 53) on both sides. No source edits. No boilerplate, footnotes, or
bracketed apparatus differences were found between editions.

## Commands

```sh
python3 books/characters/confessions/author_content.py
python3 books/characters/build_confessions.py
python3 books/characters/build_confessions.py --check
python3 -m unittest books.characters.test_confessions -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Thirteen tests: saved-package freshness; exact UTF-16 spans and source
hashes; no invented outcomes (72 of 73 entries bound, one omission --
Augustine -- on both sides, one snapshot each); Augustine confirmed never
bound under his own name; the four Major entries being exactly Monnica,
Alypius, Nebridius, and Ambrose; the six Supporting entries being exactly
Patricius, Adeodatus, Simplicianus, Victorinus, Pontitianus, and Faustus;
Paul/Saul and Paulus resolving to two different entities purely by
spelling, at the same location, with no location-scoped `bind()`
anywhere in the package; the Jove/Jupiter and Cicero/Tully aliases each
firing under both spellings; Hortensius and the generic sect/demonym
collectives confirmed never bound; both editions agreeing exactly on
mention count and omission; and the kind taxonomy (39 person, 18
religious-figure, 8 cultural-figure, 7 literary-figure) matching exactly
on both sides.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
