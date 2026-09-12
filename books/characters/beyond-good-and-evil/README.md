# Beyond Good and Evil character package

All eleven sections in both English editions -- the Preface, nine numbered
chapters, and the closing poem "From the Heights": 119 recognition cards,
287 exact mentions in `original-en` and 284 in `modern-en`, 325 paragraphs
per edition. Zero omitted entities on either side.

Read `cards.md` for category and copy together. This is an aphoristic
philosophical work, not a novel, and it names more real historical,
mythological and literary figures per page than any Lane A book authored so
far -- exactly as flagged in the automation queue ("Nietzsche's
philosophers, composers and nations"). 111 of 119 entries are Reference --
named philosophers, writers, composers, rulers, and mythological or literary
figures Nietzsche cites once or a handful of times to make a point. Eight
entries are Major, because Nietzsche returns to them repeatedly across
multiple chapters in sustained, substantive discussion rather than a single
citation: **Plato** and **Socrates** (the twin targets/originators of the
"morality as error" argument running from the Preface through Chapter 6);
**Kant** (Chapter 1's critique of synthetic judgments a priori, revisited in
Chapters 6 and 7); **Pascal** (the Religious Mood chapter's central case
study, closing with an imagined "divine hammer" confronting his
self-mutilation); **Napoleon** and **Goethe** (paired repeatedly across
Chapters 6-9 as exemplars of "good Europeans"); **Wagner** (Chapters 3, 8 and
9, culminating in the long Chapter 9 assessment); and **Schopenhauer**
(discussed at length in Chapters 1, 3, 4, 6, 7 and 9).

## Editorial checks

**1. Namesakes.** Two genuine collisions, both resolved by location-scoped
binding in `build_beyond_good_and_evil.py` rather than a shared alias --
neither entity carries a global alias for the bare name:

- **"Frederick"** names two different men: Frederick II of Hohenstaufen, the
  medieval Holy Roman Emperor Nietzsche calls "the first of Europeans" by
  his own taste (6:14, grouped with Alcibiades, Julius Caesar and Leonardo
  as men whose inherited contrariety became conquering strength), and
  Frederick the Great of Prussia, the subject of Chapter 7's parable about a
  new, harder German skepticism (7:5, three mentions: "father of Frederick
  the Great," "the young Frederick," "the great Frederick"). `test_two_
  fredericks_split_by_location_not_alias` checks every "Frederick" mention
  in the book, not a sample, and confirms each resolves to exactly one of
  the two.
- **"Sand"** names two different people: George Sand the novelist (8:19,
  "Monsieur George Sand," one of three women Nietzsche says no one should
  cite as proof of "woman as she is"), and Karl Ludwig Sand, the nationalist
  student who assassinated the playwright Kotzebue in 1819 (9:4). The
  aphorism there -- "Kotzebue certainly knew his Germans well enough... but
  Sand also thought he knew them" -- is a dark joke about that
  assassination, not a second reference to the novelist.

A third near-collision is a source-text quirk rather than a real namesake:
original-en spells the Renaissance condottiere "Caesar Borgia," which
contains the bare word "Caesar" and would otherwise misbind to Julius
Caesar (named separately at 6:14, "Alcibiades and Caesar"). The build script
excludes that one location from the Caesar alias explicitly; modern-en
spells him "Cesare Borgia" and never collides at all, since "Cesare" and
"Caesar" are different strings. `test_caesar_borgia_does_not_leak_into_
julius_caesar` checks this in both editions.

A fourth near-collision resolves itself without any special handling:
Dionysus, the god who narrates the confessional close of Chapter 10, and
Dionysius, the tyrant of Syracuse named only in Epicurus's joke about Plato
at 2:6 ("Dionysiokolakes," flatterers of Dionysius), are spelled differently
enough (-us vs. -ius) that the exact matcher never confuses them --
`test_dionysus_and_dionysius_stay_distinct` confirms neither entity's
locations bleed into the other's.

**2. Person or not.** Excluded as non-persons: peoples and nations (the
Jews, the Germans, the French, the English, the Greeks, the Romans, the
Jesuits, the Puritans, Positivists, Socialists, Utilitarians, and so on, all
treated at length as collectives but never as one named individual), places
(Europe, Germany, France, England, Russia, Asia, Athens, Florence, Naples,
Venice, Konigsberg), and work titles cited without inventing a person from
them: Goethe's *Faust* (the play, cited at 9:4 for how Napoleon's appearance
made Goethe rewrite it), Schumann's *Manfred* (a Byron-derived title, not a
character reference the way Kundry and Siegfried are), Schiller's *William
Tell* (an original-en-only footnote citing Act IV, Scene 3 -- dropped
entirely in modern-en), Wagner's opera titles (*Tannhauser*, *Parsifal*, the
*Meistersinger*, *Tristan and Isolde*), Weber's and Marschner's opera titles,
and Schopenhauer's *Grundprobleme der Ethik* (an original-en-only footnote
crediting its English translator, Arthur B. Bullock, by name -- also dropped
in modern-en; deliberately not given its own card, since it identifies a
translation's translator rather than a figure in Nietzsche's own argument).
One deliberate exception among fictional figures: Dr. Marianus, the
character from Goethe's *Faust, Part II* whose actual line is quoted
("Here is the prospect free, the mind exalted") with his name given in a
footnote -- this is a specific character's words directly cited, not a
title, so he gets a card. Kundry and Siegfried, similarly, are treated as
the characters Wagner staged rather than as their operas' titles, since
Nietzsche discusses both as figures in their own right ("the figure of
Siegfried, that very free man...").

**3. Scriptural and mythological references.** Jesus is quoted directly
(5:101) and discussed at length as a psychological case study (10:12).
Eros, Circe, Nausicaa, Ulysses (aliased to Odysseus, since modern-en renames
him at 5:33 but keeps "Ulysses" at 8:16), Oedipus, the Sphinx, Ariadne,
Dionysus, Hercules (named for the constellation, not the labors), and Wotan
(quoted via an old Scandinavian saga) are all bound as specific,
individually-invoked mythological figures. Excluded as generic rather than
specific: "a Cyclops" (5:108, indefinite article -- a type of creature, not
the named Polyphemus), unlike "the Sphinx" (definite article, both times) or
"the god Dionysus" (definite and directly self-naming).

**4. Ambiguous or generic references.** Left deliberately unbound: "the
great Chinaman of Konigsberg" (7:6, a nickname for Kant the text itself
never resolves to his name at that spot -- the archphilosopher pattern from
the Second Treatise package); the "problematic, crazy father of Frederick
the Great" (7:5, Frederick William I of Prussia, never named); "the mother
of Napoleon" (8:24, Letizia Bonaparte, never named); and "ce senateur
Pococurante" (8:14), Galiani's witty nickname for Helvetius borrowed from
Voltaire's blase *Candide* character -- a comparison, not a reference to an
actual "Pococurante" appearing in this book, so Helvetius's own card
explains the joke rather than a separate Pococurante entity being invented.

**5. Spot-read the bindings.** I read every location cited in checks 1-4
above in full context in both editions while authoring (not a random sample
after the fact, given how the collision-heavy chapters demanded it), plus
every location where a name's mention count differed between editions --
each difference traced to a footnote or bracketed citation present in
original-en's Gutenberg apparatus and folded into or dropped from modern-en's
prose (Schiller's *William Tell* footnote, Horace's *Epistles* footnote, and
Schopenhauer's *Grundprobleme der Ethik* translator credit), never to a
missing or invented character.

**6. Both editions independently.** I read both editions in full,
paragraph by paragraph across all eleven sections, before authoring, and
built the candidate list from a systematic capitalized-word sweep of both
texts rather than relying on memory or the (nonexistent) threads file for
this book. `omittedEntities: []` on both sides confirms no entity is bound
in one edition and silently missing in the other. Several names needed a
second, ALL-CAPS alias to catch this translation's emphasis rendering
(PLATO'S, KANT, LOCKE, BIZET, DIONYSUS all appear in full caps somewhere in
original-en) -- `test_all_caps_emphasis_aliases_bind` checks each. Several
others needed a diacritic-restored alias for modern-en, which reintroduces
accents original-en's plain-ASCII Gutenberg text dropped (Moliere/Moliere,
Duhring/Duhring, Helvetius/Helvetius, Stael/Stael, Saint-Evremond/Saint-
Evremond, Epinay/Epinay) -- `test_accented_spelling_variants_bind_in_modern_en`
checks each. One genuine false-positive was caught and fixed: original-en's
"Pascal-like SACRIFIZIA DELL' INTELLETO" (8:15) is an adjective, not a
citation -- the hyphen (not a word character) let the word-boundary-safe
matcher through where modern-en's own word there, "Pascalian," correctly
never matches at all; `test_pascal_like_adjective_is_not_a_mention` checks
this is excluded in both editions.

## Source review

Both source files have 11 sections and 325 paragraphs, with identical
paragraph counts per section (2, 23, 21, 18, 123, 18, 10, 25, 17, 37, 31) on
both sides. No source edits. The final paragraph of the poem (11:30) is
Project Gutenberg's own end-of-text credit line ("End of Project Gutenberg's
Beyond Good and Evil, by Friedrich Nietzsche") left over from incomplete
boilerplate stripping in both editions -- left as printed per the automation
queue's rule against editing edition files, and not treated as a mention of
Nietzsche himself, since it identifies the file's author rather than
naming him within his own argument. original-en's Gutenberg text also
carries several bracketed footnotes (citing Schiller, Horace, and
Schopenhauer's English translator) that modern-en either folds into the
main sentence or drops outright; these account for every mention-count
difference between editions documented in check 5 above.

## Commands

```sh
python3 books/characters/beyond-good-and-evil/author_content.py
python3 books/characters/build_beyond_good_and_evil.py
python3 books/characters/build_beyond_good_and_evil.py --check
python3 -m unittest books.characters.test_beyond_good_and_evil -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Eleven tests: saved-package freshness; exact UTF-16 spans and source
hashes; no invented outcomes or missing reference entries (119 entries,
zero omissions, one snapshot each); the eight Major entries being exactly
Plato, Socrates, Kant, Pascal, Goethe, Napoleon, Wagner and Schopenhauer;
the two Fredericks and two Sands splitting cleanly by location across every
mention, not a sample; Caesar Borgia never leaking into Julius Caesar; the
Pascal-like adjective never binding; the five ALL-CAPS emphasis aliases
each firing at least once; six diacritic-restored modern-en aliases each
firing at least once; and Dionysus/Dionysius staying distinct.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
