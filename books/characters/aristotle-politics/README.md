# Politics character package

All eight Books in both English editions -- 159 recognition cards in
modern-en (158 in original-en; see check 6), 325 exact mentions in
modern-en and 330 in original-en, 478 paragraphs per edition.

Read `cards.md` for category and copy together. This is a systematic
treatise, not a dialogue -- per editorial policy's guidance ("cited
thinkers normally remain references" for treatises), 157 of 159 entries
are Reference: a lawgiver, tyrant, or historical incident cited once or a
handful of times to make a point about how constitutions rise, work, and
fall. Two entries are Major, because the book returns to them with
sustained, argued-with attention rather than a single citation:
**Socrates** and **Plato**, whose Republic and Laws occupy most of Book
2's opening critique and are revisited in Books 4 and 7.

## Editorial checks

**1. Namesakes.** This book earns its own queue warning many times over.
Nine genuine collisions, six resolved by location-scoped binding in
`build_aristotle_politics.py`, three resolved by plain global aliases and
longest-span-first with no location scoping needed:

- **Dionysius** covers two tyrants of Syracuse, father and son. Dionysius
  I is identifiable across Books 1, 3, and 5 by continuous narrative
  (asking for a bodyguard as his first step to power, 3:70; rising by
  denouncing the rich, 5:19; installed by Hipparinus, 5:21; the Locrian
  marriage that ruined that city, 5:29; grouped with other
  demagogues-turned-tyrant, 5:49; taxing his subjects into poverty within
  five years, 5:67). Dionysius II is named explicitly "the younger" at
  5:59 and is the Dionysius Dion expels at 5:61 and 5:63. Neither carries
  a global alias; `test_two_dionysii_split_by_location_not_alias` checks
  every "Dionysius" mention in the book, not a sample.
- **Periander** covers two tyrants. Periander of Corinth is named in full
  ("Periander of Corinth ... the great master" of tyranny's arts) at
  5:67, and is identifiable everywhere else by the corn-field anecdote he
  shares with Thrasybulus of Miletus (3:54 x2, 5:52) and by the Cypselid
  dynasty's reign lengths (5:75, 5:76). Periander of Ambracia is named in
  full ("Periander, the tyrant of Ambracia") at 5:54, and identifiable by
  the city name in the same sentence at 5:15. Corinth's Periander carries
  the global alias "Periander"; the build script excludes 5:15 and 5:54
  from it and rebinds those two locations to Ambracia's Periander instead
  -- the same exclude-and-rebind pattern used for a source-spelling quirk
  in a prior Lane A package (Beyond Good and Evil's "Caesar Borgia").
- **Thrasybulus** covers two different men: Thrasybulus of Miletus, who
  receives Periander of Corinth's advice (3:54 x2, 5:52), and Thrasybulus
  of Syracuse, Hiero's brother and successor, driven out after eleven
  months (5:63, 5:76). Neither carries a global alias.
- **Pausanias** covers three different men, all bare "Pausanias" with no
  distinguishing epithet directly attached: a Spartan king who tried to
  curb the ephors and was later accused of reaching for personal power
  (5:2 and 7:57, both explicitly "king Pausanias"); the regent who
  commanded at Plataea, named with the epithet "general in the Persian
  War" (5:26); and Philip of Macedon's assassin, identified by the
  surrounding Philip/Attalus narrative rather than an epithet (5:54).
  None carries a global alias; `test_three_pausaniases_split_by_
  location_not_alias` checks all three against every "Pausanias" mention
  in the book.
- **Cleisthenes** covers grandfather and grandson: Cleisthenes of Sicyon,
  the Orthagorid tyrant, identifiable by the Sicyon narrative around him
  (5:74, 5:78), and Cleisthenes of Athens, the democratic reformer,
  identifiable by "at Athens" in the same sentence (3:5, 6:11). Neither
  carries a global alias.
- **Timophanes** covers two unrelated men: an otherwise unidentified
  wealthy citizen of Mitylene whose daughters occasion a revolution
  (5:14), and the Corinthian general who seized a tyranny with his
  mercenaries (5:22) -- historically the brother the liberator Timoleon
  later killed for it, though Aristotle never names Timoleon. Neither
  location has an epithet to hang a global alias on, so both are bound
  by location.
- **Amyntas**, **Chares**, and **Pheidon** are clean splits resolved
  without any location scoping, because in each pair at least one name
  always carries its epithet directly in the text and longest-span-first
  does the rest: "Amyntas the little"/"Amyntas the Little" (global alias)
  outscores the unrelated bare "Amyntas" (Archelaus's own son, no alias)
  at the same paragraph, 5:54; "Chares the Parian"/"Chares of Paros"
  (Book 1's agricultural writer) never collides with bare "Chares" (Book
  5's political intermediary at Aegina, almost certainly the well-known
  Athenian general, though the text supplies no epithet to confirm it);
  and "Pheidon the Corinthian" (the ancient legislator, 2:22) never
  collides with bare "Pheidon" (the king of Argos turned tyrant, 5:49).
  `test_pheidon_and_chares_resolve_by_longest_span_no_scoping` and
  `test_two_amyntases_at_same_paragraph_resolve_by_epithet` check these.

**2. Person or not.** Excluded as non-persons: peoples, demonyms, and
ethnic groups cited as collectives rather than as one named individual
(Athenians, Spartans/Lacedaemonians, Cretans, Argives, Thebans,
Carthaginians, and dozens of others -- this book names more cities and
peoples than any prior Lane A book, exactly as its queue entry warns);
places themselves, including several named after a founder, watched
carefully per the "cities named after founders" rule -- Italy is named
for its legendary founder-king Italus (7:33), who *is* carded as a
person, while the place "Italy" is not; offices and institutions (the
Ephoralty, the Areopagus, the Aesymnetia); and terms of art (oligarchy,
democracy, polity). Five ruling families or clans are specific enough to
card in their own right at kind `family`, matching the precedent set by
a prior package's "the Pompeys": the Peisistratidae, the Basilidae, the
Aleuadae, the Penthalidae, and the Cypselidae. The Partheniae -- Sparta's
illegitimate sons sent to colonize Tarentum -- are carded at kind `group`
rather than `family`, since the text describes them as a class defined
by birth status and shared fate, not a single lineage.

**3. Scriptural and mythological references.** Homer, Hesiod, and the
tragedians are quoted for specific lines rather than their whole
narratives. Mythological and cultic figures are bound to confirm
identity without importing surrounding myth: Daedalus and Hephaestus
(self-moving tools, 1:16), Heracles (left behind by the Argonauts, an
image for ostracism, 3:54), Athene (invented and discarded the flute,
8:19), Stentor (proverbial loud voice, 7:14), Achilles and Agamemnon
(quoted for a single line each about honour, not their whole Iliad
arcs), Odysseus and Musaeus (quoted on the pleasures of music, 8:4,
8:11). Minos, Sesostris, and Italus are legendary founder-kings treated
as ordinary `person` entities per the Apology precedent for legendary
figures (Minos, Rhadamanthus, and the other judges of the dead there are
plain `person`), not as `cultural-figure` -- that kind is reserved here
for actual deities and demigods (Hephaestus, Athene, and, as a Homeric
hero rather than a full deity, the Achilles/Agamemnon/Odysseus/Stentor
group is also marked `cultural-figure` for consistency with how the
Apology package treated Homeric figures like Achilles and Hector).

**4. Ambiguous or generic references.** Left deliberately unbound: the
Ionian tyrants (5:49, a plural, unnamed group); "the Persian king" as a
generic office-holder rather than a named individual (2:53, 3:54, 5:67 --
distinct from the specific, named Xerxes and Darius at 5:58); "the
notables," "the people," "the demagogue" throughout, as class terms
rather than individuals; and the unnamed lovers, brothers, and family
members behind several of Book 5's local revolutions (the anonymous
Syracusan love-quarrel at 5:13, the Hestiaea inheritance dispute at 5:13,
the Delphi and Epidamnus marriage quarrels at 5:14), none of which the
text ever names. "Darius" at 5:58 is bound but explicitly hedged as
probably Xerxes's own son of that name (hanged, apparently on
Artapanes's initiative), not Darius I "the Great," since nothing in the
sentence settles which Darius is meant beyond the immediate father-son
context with Xerxes.

**5. Spot-read the bindings.** I spot-read 14 mentions per edition at
random (`random.seed(11)`, 28 total) after building the package,
cross-checking each against the paragraph context read while authoring;
every one resolved to the person expected -- `dionysius-ii` at 5:59,
`diocles-olympic-victor` at 2:70 (the original-en "Diodes" spelling
defect), `darius-son-of-xerxes` at 5:58, `crataeus` and `peisistratidae`
at 5:54 and 5:76, among others. I additionally read every location cited
in checks 1-4 above in full context in both editions while authoring,
not as a random sample after the fact, given how the namesake-heavy
Books 2, 3, and 5 demanded it -- Book 5 (the revolutions catalog) was
read in full, sequentially, rather than through the candidate-sweep
method used for the less name-dense Books 4, 6, and 8.

**6. Both editions independently.** I built the candidate list from a
systematic capitalized-word frequency sweep of both texts, then read
Books 1, 2, and 5 in full sequential narrative and every entity-bearing
paragraph of Books 3, 4, 6, 7, and 8 in context, in both editions, before
authoring -- there is no `aristotle-politics-threads.json` for this book
to use even as a lead. Two real divergences between editions were found
and are recorded as `omittedEntities`, both source defects rather than
missing characters:

- Original-en's older, Bekker/Gutenberg-apparatus translation bleeds
  editorial footnotes, page headers, and cross-reference citations
  directly into the running paragraph text at dozens of points (`Cp. N.
  Eth. iv. 1`, running headers like "Sparta: Inequality of Property",
  and OCR-mangled words: Bernays -> "Beriiays", Diocles -> "Diodes",
  Bekker's -> "Btkker's"). modern-en, translated fresh from a clean
  source, carries none of this. Two consequences, both left as printed
  per the hard constraint against editing edition files: "Aristotle"
  appears twice in original-en (7:39, 8:3) as a footnote annotator's own
  third-person cross-reference to the author -- neither location is
  bound to any entity, and no "Aristotle" entity exists in this package.
- At 5:59, the corruption goes further: original-en's sentence naming
  Sardanapalus is garbled into an unattributed relative clause ("whom
  some one saw carding wool with his women"), and the name itself never
  appears anywhere in original-en's text. modern-en's clean rendering
  ("Sardanapalus was slain by one who saw him carding wool with his
  women") keeps it. `sardanapalus` is therefore bound in modern-en only,
  and appears in original-en's `omittedEntities`
  (`test_sardanapalus_only_in_modern_en_source_defect` checks this
  explicitly) -- the one and only entity absent from either edition.

`omittedEntities: []` on modern-en confirms nothing else is bound in one
edition and silently missing from the other.

## Commands

```sh
python3 books/characters/aristotle-politics/author_content.py
python3 books/characters/build_aristotle_politics.py
python3 books/characters/build_aristotle_politics.py --check
python3 -m unittest books.characters.test_aristotle_politics -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Fourteen tests: saved-package freshness; exact UTF-16 spans and source
hashes; no invented outcomes (159 entries in modern-en, 158 in
original-en, one snapshot each); the two Major entries being exactly
Socrates and Plato; the "Aristotle" footnote apparatus never binding
anywhere and no such entity existing; the two Dionysii, two Perianders,
two Thrasybuluses, three Pausaniases, two Cleisthenes, and two
Timophaneses each splitting cleanly by location across every mention in
the book, not a sample; the Pheidon/Chares and Amyntas pairs resolving by
epithet and longest span with no location scoping; and Sardanapalus's
edition-specific presence confirmed as the one documented source defect.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
