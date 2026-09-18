# Clickable-names pass, batch 2: The Histories, Divine Comedy, Moby-Dick

Following the war-and-peace pilot (see
`character-coverage-clickable-names-plan-2026-09-17.md`), worked the next
three books in the cast-density ranking. Same pipeline throughout: spaCy
PERSON-NER scan → read every real candidate in context → bind minimal
cards → round-trip validate → real-browser verify → commit.

## The Histories: 22 → 114 characters

Herodotus reuses names heavily across unrelated generations and figures.
Found and disambiguated 6 real homonym pairs by reading every occurrence
in context before binding anything (same discipline as the Bible homonym
audit earlier this session):

- **Aristagoras**: the ruler of Miletos who leads the Ionian revolt (55
  occurrences) vs. two unrelated minor figures named once each in a list
  of commanders (Aristagoras of Kyzicos, of Kyme).
- **Aristodemos**: a legendary Heraclid ancestor of the Spartan kings vs.
  "Aristodemos the coward," a Thermopylai survivor sent home too ill to
  fight. Split into `aristodemos-ancestor` / `aristodemos-thermopylae`.
- **Lycurgos**: an Athenian faction leader vs. the Spartan lawgiver.
  Split into `lycurgos-athenian` / `lycurgos-spartan` (a third,
  ultra-minor "Lycurgos an Arcadian" patronymic mention excluded from
  both).
- **Hegesistratos**: a despot of Sigeion vs. an unrelated diviner of Elis
  at Plataea. Split into `hegesistratos-sigeion` / `hegesistratos-diviner`.
- **Tisamenos**: a one-off legendary ancestor mention vs. the diviner of
  Elis at Plataea — the ancestor mention excluded, rest bound to the
  diviner.
- **Kimon** and **Adeimantos**: each has one incidental mention of an
  unrelated same-named relative — excluded rather than risk
  misattribution.
- **Atys**: bound only to Croesus's son (the boar-hunt story); several
  purely genealogical "Atys" ancestor-name mentions left unbound, no
  narrative content to card.
- **Labynetos** skipped entirely: the text itself notes two Babylonian
  rulers shared the name, and safely distinguishing them wasn't possible
  without deeper research.

New shared helper `books/characters/add_histories_helpers.py`
(`bind_excluding()`/`add_entity_excluding()`) extends `add_entity.py`
with paragraph-level include/exclude lists for exactly this kind of
disambiguation — reusable for the Iliad, Odyssey, and other
genealogy-heavy epics still ahead in the queue.

**Real-browser verification caught one more untappable-mention bug**: the
Spartan lawgiver's first occurrence reads "...laws thus:—Lycurgos..." —
the name glued directly to a colon-plus-em-dash, no space, so the
reader's whitespace-only word tokenizer could never isolate it as a tap
target. Same class as the Frithjof bug in niels-lyhne (round 3). Fixed by
removing that one mention and re-anchoring to the next clean occurrence.

92 new characters. modern-en lags original-en slightly (95 vs. 114 — 15
aliases had no match in that translation's spelling) but was not chased
down to full parity this round, unlike war-and-peace. Final suite:
**162/162 passed.**

## Divine Comedy: 28 → 81 characters

The book Anders used as his own example: a minor figure named once,
tapped to learn who they are. Two more homonym pairs, same discipline:

- **Francis**: Francis of Accorso, a jurist among the sodomites in Hell
  (one mention) vs. Saint Francis of Assisi, given an extended tribute in
  Paradiso (four mentions). Split into `francis-of-accorso` /
  `saint-francis`.
- **Brutus**: Lucius Junius Brutus, praised in Limbo, vs. Marcus Brutus,
  damned in Satan's mouth for betraying Caesar. Split into
  `brutus-lucius` / `brutus-marcus`.

"Charles" was checked and skipped — several different historical
Charleses across cantos with no clean single-mention split available.
"Saint John" (one mention) named the Florence baptistery, not a person.
"Mantuan" is Virgil addressed by epithet — bound as an alias on the
existing `virgil` card, not a new character.

**A real gap found along the way**: "Christ" had zero mentions bound
anywhere despite 40 occurrences — spaCy tagged it inconsistently, so the
NER scan itself never surfaced it at the count threshold used. Caught by
checking "Jesus" (which did surface) against what was and wasn't already
carded. Added as a major reference card with "Jesus" as an alias.

Also added **Buonconte da Montefeltro** — a real, narratively significant
figure in Purgatorio (his death and last-moment redemption) that spaCy's
NER never flagged at all; caught only by reading the context around the
"Giovanna" candidate it did flag. Worth stating plainly: automated NER
missed two genuinely important figures in one book (Christ, Buonconte),
both caught only because a human read the surrounding context rather
than trusting the candidate list as exhaustive.

53 new characters. modern-en at 80 vs. original-en's 81 (one alias
skipped for that edition). Final suite: **180/180 passed.**

## Moby-Dick: 16 → 62 characters

Already had 16 cards (Jonah added round 3) despite a large cast of named
minor sailors, whaling captains, and the many real historical naturalists
and authors Melville cites in "Extracts" and the Cetology chapters.

One homonym pair: **"Gabriel"** — one incidental archangel reference
(chapter 1) vs. 18 mentions of a Jeroboam crew member who proclaims
himself the archangel and commands the ship as a self-styled prophet
(chapter 71). Split via exclusion, bound the prophet as `gabriel-prophet`.
"Yarman" is Stubb's nickname for Derick De Deer ("the German") — bound as
an alias, not a new character.

Five checked and excluded as not people: "Jeroboam" and "Rachel" name
ships, not the biblical figures reused for those names; "Mark" is the
imperative "mark ye," a false-positive NER tag; "Dan Coopman" is the
title of a fictional Dutch book (Melville's joke — Dutch for "the
cooper"); "Woebegone" and "Savesoul" are rhetorical invented names in a
satirical passage; "Jenny" was too ambiguous in Pip's delirious dialogue
to identify safely.

46 new characters, both editions reaching 62 — no modern-en gap this
time. **Real-browser verification caught the third untappable-mention bug
of this batch**: Peter Coffin's first occurrence is the inn's sign text,
"The Spouter Inn:—Peter Coffin," glued to a colon-plus-em-dash. Same fix
pattern as the other two. Final suite: **194/194 passed.**

## Process notes

- **Three of three books this batch hit the same untappable-mention bug
  class** (name glued to punctuation with no space, defeating the
  reader's whitespace-only word tokenizer): Lycurgos (the-histories),
  Peter Coffin (moby-dick), and Frithjof (niels-lyhne, round 3). This is
  now a known, recurring pattern worth checking for explicitly on every
  book touched, not just something real-browser verification happens to
  catch.
- **The homonym-disambiguation workflow held up across three very
  different books** (Herodotus's genealogies, Dante's cantos, Melville's
  citations). `add_histories_helpers.py`'s exclude/only-paragraph
  mechanism is now the standard tool for this, not a one-off.
- **NER is a floor, not a ceiling.** Two real, significant figures in
  Divine Comedy alone (Christ, Buonconte da Montefeltro) were missed by
  spaCy entirely and caught only by reading context around adjacent
  candidates. Any future pass should expect a small number of misses like
  this and not treat the NER candidate list as the full truth.

## Running total, clickable-names pass

war-and-peace (32→135, both editions), the-histories (22→114 original-en,
95 modern-en), divine-comedy (28→81 original-en, 80 modern-en),
moby-dick (16→62, both editions). **237 new characters across 4 books**,
11 real homonym pairs disambiguated, 3 untappable-mention bugs fixed, all
real-browser verified.

## Next in the priority queue

Don Quixote, The Aeneid, Paradise Lost, Anna Karenina, Peloponnesian War,
Iliad, Faust Part 1, Brothers Karamazov. Ulysses, Leviathan, and Essays
(Montaigne) remain flagged as needing a noise-filter pass before their
candidate lists are usable.

## Release status

All fixes on branch `claude/great-clarke-mugpy4`, not yet live.

## Addendum (2026-09-18): Don Quixote, and two tooling fixes applied library-wide

**Don Quixote: 24 → 104 characters** (102 modern-en). Same pipeline.
"Pedro" (91 occurrences) split four ways after reading every one —
Master Pedro the puppeteer, the goatherd of the Chrysostom story, Don
Pedro de Aguilar, Pedro Alonso — with a dozen one-off "Pedro X" names
left unbound. Corchuelo, Clara, Sancha, Maria and Amadis each had one
unrelated occurrence excluded. Master Pedro's and the Countess Trifaldi's
cards describe only what the reader knows at first appearance (both are
unmasked later). Five aliases folded onto existing cards (Aldonza
Lorenzo → Dulcinea, Alonso Quixano → Don Quixote, Antonia Quixana → the
niece, Mari Gutierrez → Teresa Panza, Chloris → Camilla).

**`prune_untappable.py`** — the "name glued to punctuation" bug had now
surfaced in three consecutive books via browser verification, one first
mention at a time. This tool mirrors the reader's word-trimming rules
exactly and removes every mention no tap can resolve, re-anchoring
`firstMention` only when the pruned mention was the earliest. Run across
all 13 finished books it removed **385 dead taps**, several in
pre-existing cards (Dorothea's and Maritornes's original first mentions
in Don Quixote were dead; War and Peace had "Orlóv-Denísov" — a different
man — bound to Denísov). It is now a standard post-step after binding.

Stated limit: names inside *curly single quotes* (`‘Sancho,’`) are
untappable today but were **kept, not pruned** — the reader trims curly
double quotes but not U+2018/U+2019, a one-regex gap in
`wordSelectionOffsets` (app lane). 61 such mentions across the 13 books
come back to life when that is fixed.

**`validate_package.py`** — the ad-hoc structural checks, made a tool,
with a new cross-character overlap check. It immediately caught a round-3
bug: bare `PAGE` had been bound inside every `MISTRESS PAGE` span in
Merry Wives (13 original-en, all 120 of her speaker labels in
modern-en), so tapping "PAGE" on her lines resolved to her husband under
the narrowest-match rule. Fixed, and every binder (`add_entity`,
`add_aliases`, `add_histories_helpers`, `bind_speaker_labels`) now skips
any match overlapping another character's span, not just exact-span
collisions.

Real-browser suite after all of the above: **222/222 passed**, every
earlier check re-run against the pruned data.

Running total: **317 new characters across 5 books**, 13 homonym groups
disambiguated, 385 dead taps removed library-wide.
