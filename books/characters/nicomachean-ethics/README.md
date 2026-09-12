# The Nicomachean Ethics character package

All 10 Books (edition chapters 1-10, "Book 1" through "Book 10") in both
English editions -- 57 recognition cards in each, zero omitted, 118
exact mentions in original-en and 119 in modern-en (one legitimate
paraphrase variance, not an omission -- see check 6), 1195 paragraphs
per edition, identical structure in both.

Read `cards.md` for category and copy together.

Like Aristotle's Politics, already in this queue, this is a
lecture-course argument with no narrative or staged dialogue of its
own: Aristotle never appears as a character, nobody experiences events,
and nothing here is dramatized. Per editorial policy's guidance for
treatises -- "cited thinkers normally remain references... without
inventing a fictional cast or calling the author a protagonist" --
**all 57 entries are Reference.** There is no Central, Major, or
Supporting entry. Aristotle himself is never named in the running text
and gets no entry.

The cast is a large flat list of names cited as authorities, examples,
or targets of a quoted line:

- **Philosophers and scientists** (real, cited for a specific doctrine
  or argument): Socrates, Plato, Heraclitus, Empedocles, Anaxagoras,
  Thales, Eudoxus, Speusippus, Protagoras.
- **The Pythagoreans**, a named school, bound as a group (kind
  `group`), distinct from any individually-named member.
- **Poets and playwrights**, quoted or cited for a specific line or
  play: Homer, Hesiod, Euripides, Aeschylus, Sophocles, Agathon,
  Epicharmus, Anaxandrides, Evenus, Theodectes, Carcinus, Theognis,
  Simonides, Demodocus.
- **Statesmen, lawgivers, and one general**: Solon, Anacharsis,
  Pittacus, Bias, Pericles, Brasidas.
- **Craftsmen** cited for skill: Phidias, Polyclitus.
- **Legendary/historical bywords**: Sardanapalus (luxury), Phalaris
  (cruelty), Milo (an athlete's appetite), Xenophantus (uncontrollable
  laughter).
- **Homeric and tragic figures**, quoted or cited directly: Hector,
  Priam, Diomedes, Polydamas, Odysseus, Calypso, Helen, Glaucus,
  Agamemnon, Thetis, Neoptolemus, Philoctetes, Alcmaeon, Merope, Niobe,
  Cercyon, Rhadamanthus, Endymion.
- **Deities**: Zeus, Aphrodite.
- **The Sophists**, a second named group, bound distinctly from
  Protagoras (an individually-named Sophist elsewhere in the book).

## Editorial checks

**1. Namesakes.** None found. The automation queue's own caution --
"treatises are not exempt" from hidden namesake collisions, citing
Hume's two Alexanders and two Catos as a warning -- was checked against
every name in this book that recurs more than once: Homer (10
occurrences), Socrates (9), Hector (5-6), Euripides (4), Heraclitus
(4), Diomedes/Tydides (3), Empedocles (3), Odysseus (3), Philoctetes
(3), Plato (3), Priam (3), Solon (3), Agathon (2), Anaxagoras (2),
Eudoxus (2), Neoptolemus (2), Phalaris (2), Sophocles (2), Speusippus
(2), Theognis (2). Every occurrence of every one of these names was
read in its full paragraph context during authoring, and each names
the same person throughout its book -- no bare word here does double
duty for two different people.

**2. Person or not.** Two genuine hazards, both resolved from the text
itself:

- **"Demus" (8, 66)**: "and those of the same tribe, or Demus, in like
  manner." This is Aristotle's own technical term for a deme (an
  Athenian territorial/political subdivision), used generically here
  alongside "tribe," not a personal name. No entity is authored for
  it, and no mention is bound at this location (confirmed by test).
- **"Alope" (7, 68)**: "Cercyon in the Alope of Carcinus." Alope is the
  *title* of Carcinus's now-lost tragedy (about the mythical woman
  Alope, daughter of Cercyon), not a character named as an agent in
  this sentence -- the sentence names the playwright (Carcinus) and the
  character within the play (Cercyon), both of which are bound; Alope
  herself is never named as acting in the running text and gets no
  entry, the same "book title, not a person" treatment other Lane A
  packages have applied to cited works.

Two further candidates were checked and confirmed to be places, not
people, and left unbound: "Euripus" (9, 44), the strait between Euboea
and the mainland known for reversing currents ("their wishes... do not
ebb and flow like the Euripus"), and "Hermaeum" (3, 116), a battle
site ("which as you know really happened at the Hermaeum"). "Pontus"
(7, 48) is likewise a place (the Black Sea region), not a person.

**3. Scriptural and mythological references.** Every Homeric, tragic,
and divine figure was checked for a specific, textually-grounded
mention rather than an imported backstory: Hector and Priam (Iliad,
Priam's praise of Hector as "more than mortal," and Priam's own
reversal of fortune in old age); Diomedes (Iliad, his boast under the
patronymic "Tydides," and his armor-trade with Glaucus); Odysseus and
Calypso (Odyssey, her advice to steer clear of danger); Helen (via the
Trojan elders who send her away despite her beauty); Agamemnon (Homer's
epithet "shepherd of the people"); Thetis (never mentioning her own
kindnesses to Zeus); Neoptolemus and Philoctetes (Sophocles' and
Theodectes' separate tragedies on the wounded hero); Alcmaeon (a lost
Euripides play on his matricide); Merope (a near-miss filicide from
tragedy, cited for the *kind* of ignorance involved, not the full
story); Niobe (excessive maternal pride, quarreling with the gods);
Cercyon (Carcinus's Alope); Rhadamanthus (the underworld judge, cited
only for a maxim attributed to him); Endymion (eternal sleep, cited
only as an image of total inactivity); Zeus and Aphrodite (each cited
for one specific epithet or line, not their wider mythology).

**4. Ambiguous or generic references.** Deliberately left unbound,
because the text treats them as types or demonyms rather than naming
specific individuals: **Lacedaemonians/Spartans**, **Persians**,
**Celts**, **Cretans**, **Scythians**, **Argives**, **Sicyonians**,
**Milesians/Miletians**, **Athenians** (all demonyms, never resolved to
a named individual lawgiver or ruler -- e.g. "the lawgivers of the
Cretans and Lacedaemonians" at 1, 95 never names Lycurgus or Minos).
Two named groups, by contrast, *were* bound (see the Pythagoreans and
the Sophists above), because in both cases the text attributes specific
doctrines or practices to the named group collectively, not merely a
generic collective noun.

**5. Spot-read the bindings.** Twelve mentions per edition were sampled
at random (`random.seed(13)`) and checked against their full paragraph
in context; all 24 resolved correctly. All 118 mentions in original-en
and all 119 in modern-en were additionally reviewed by direct read of
their source paragraph during authoring (not merely sampled), given the
density of citations in this book (Book 3 and Book 7 alone account for
roughly a third of all mentions).

**6. Both editions independently.** Both editions are structurally
identical (1195 paragraphs, 10 chapters, same chapter titles) and
produce 57/57 entities in each, but several edition-specific phrasing
differences required explicit handling rather than being assumed to
match:

- **Ulysses / Odysseus**: original-en uses the Latin name "Ulysses"
  throughout; modern-en uses the Greek "Odysseus." Aliased both.
- **Jupiter+Jove / Zeus**: original-en uses "Jupiter" at three
  locations and "Jove" (inside a quoted line from Euripides) at a
  fourth; modern-en uses "Zeus" at all four. Aliased all three forms.
- **Venus / Aphrodite**: original-en uses "Venus," modern-en
  "Aphrodite," both at the same single location (7, 54). Aliased both.
- **Anexagoras / Anaxagoras**: original-en itself spells the
  philosopher's name two different ways for the same person --
  "Anexagoras" at (6, 41) and "Anaxagoras" at (10, 98) -- a source
  inconsistency, not corrected here per the "record source defects,
  don't repair them" rule. modern-en spells it "Anaxagoras" both
  times. Aliased both spellings under one entity.
- **Sophists / sophists**: modern-en itself capitalizes "Sophists" at
  its first occurrence (9, 4) but lowercases "sophists" at the other
  two (10, 117; 10, 120) -- again a source inconsistency internal to
  one edition, not corrected. Both cases are aliased.
- **Hector, one legitimate extra mention in modern-en**: at (3, 105),
  original-en reads "The latter says," while modern-en reads "Hector
  says" -- a paraphrase that names Hector explicitly where original-en
  uses a pronoun-equivalent. This gives modern-en one more genuine
  mention of Hector than original-en (6 vs. 5) with no omission on
  either side; confirmed and pinned down by a dedicated test rather
  than left as an unexplained count mismatch.

No divergence was found in which edition names or omits a person
outright: every one of the 57 entities binds in both editions, and the
only two mention-count differences (Hector, Sophists) are both fully
accounted for above, not silent gaps.

## Source defects

original-en's own inconsistent spelling of Anaxagoras ("Anexagoras"
once, "Anaxagoras" once) and modern-en's own inconsistent
capitalization of "Sophists"/"sophists" are recorded above per check 6.
Neither was corrected in the edition files themselves, per the standing
rule against editing `app/public/data/editions/**`.

## Commands

```
cd books/characters
python3 nicomachean-ethics/author_content.py   # regenerate editorial.json
python3 build_nicomachean_ethics.py             # regenerate characters.v1.json, print report
python3 build_nicomachean_ethics.py --check      # verify saved output is current
python3 -m unittest test_nicomachean_ethics -v
python3 -m unittest discover -s . -p 'test_*.py'  # full repo suite
```

## Release checks

- [x] Both English editions read in full (all 10 Books, 1195
  paragraphs, original-en and modern-en).
- [x] All six editorial checks performed and documented above.
- [x] `build_nicomachean_ethics.py --check` clean.
- [x] `test_nicomachean_ethics.py`: 10/10 passing.
- [x] Full repo suite (`python3 -m unittest discover -s . -p
  'test_*.py'`) run; see commit message for the result obtained at
  authoring time.
- [ ] `library-inventory.json` regenerated (next step).
- [ ] Committed and pushed with the inventory update.
- [ ] `RELEASE-QUEUE.md` entry added.
