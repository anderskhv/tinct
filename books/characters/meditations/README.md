# Meditations character package

All twelve Books in both English editions -- 109 recognition cards in each,
165 exact mentions per edition, 412 paragraphs per edition. Zero omitted
entities on either side.

Read `cards.md` for category and copy together. This is a private notebook,
addressed to no one and with no dialogue -- almost nobody in it
"participates" in anything on the page, so per editorial policy's guidance
for treatises ("cited thinkers normally remain references"), 96 of 109
entries are Reference: a philosopher cited to make a point, a name in one
of Marcus's own recurring "and where are they now?" lists of the dead, an
obscure contemporary invoked once for a comparison whose point is lost to
us. Eleven of Book 1's named teachers get Supporting, the same reasoning
Apology gives Socrates's friends that tier: each receives Marcus's own
dedicated paragraph of personal memory, not just a citation -- Verus
(his grandfather), Diognetus, Rusticus, Apollonius, Sextus, Alexander the
Grammarian, Fronto, Alexander the Platonist, Catulus, Severus, and
Claudius Maximus. Two entries are Major, because the book returns to them
with sustained, substantive attention across multiple Books rather than a
single citation: **Socrates** (discussed at length in Books 3, 7, and 11)
and **Antoninus Pius** (Book 6 gives him the single longest character
portrait of anyone in the work).

## Editorial checks

**1. Namesakes.** Five genuine collisions, all resolved by location-scoped
binding in `build_meditations.py` rather than a shared global alias:

- **"Verus"** names two different men: Marcus's paternal grandfather, in the
  book's opening line (1:0), and Marcus's own father, who died when Marcus
  was a small child, in Book 8's "Lucilla buried Verus; then was Lucilla
  herself buried by others" (8:23) -- read, per standard scholarship, as
  Marcus's mother outliving his father before dying in turn. Marcus's
  co-emperor Lucius Verus is never named "Verus" (or by any name at all)
  anywhere in the text. `test_two_veruses_split_by_location_not_alias`
  checks every "Verus" mention in the book, not a sample.
- **"Antoninus"** (bare, without "Pius") is genuinely three-way ambiguous.
  Book 8:23 uses it twice in one sentence -- "So Antoninus Pius, Faustina
  his wife; then Antoninus himself" -- both referring to his father, the
  second a backward reference to the first. But at 6:22 and 6:35, bare
  "Antoninus" is Marcus naming *himself* ("how this word Antoninus is
  written"; "my city and country, as I am Antoninus, is Rome") -- Marcus
  was born Marcus Annius Verus and took the name Antoninus on adoption.
  Per editorial policy's instruction not to cast a treatise's author as a
  character, both self-references are deliberately left unbound, and
  `antoninus-pius` carries no global bare-name alias -- only the full
  phrase "Antoninus Pius," plus a location-scoped bare match at 8:23 only.
  `test_marcus_self_references_to_antoninus_stay_unbound` checks all four
  locations.
- **"Maximus"** names two different men: Claudius Maximus, the revered
  Stoic teacher of Book 1 (named in full only at 1:11; bare "Maximus" at
  1:12 and 1:13 refers back to him), and an unrelated household figure
  paired with "Secunda" in Book 8's list of paired deaths (8:23) -- clearly
  not the teacher, given the company he keeps there (Epitynchanus,
  Diotimus, Celer, Charax, Eudaemon, all household or attendant figures).
  Neither entity carries a global bare-"Maximus" alias.
  `test_two_maximuses_split_by_location_not_alias` checks all four
  locations.
- **"Cato" and "Scipio" (4:27) are left entirely unbound.** Book 1:10 names
  a "Cato" unambiguously -- grouped with Thrasea, Helvidius, Dio, and
  Brutus, the standard ancient roll-call of Republican libertas exemplars,
  this is Cato the Younger, and it is bound. But 4:27's bare "Cato" and
  "Scipio" sit in an undifferentiated chronological list of once-famous,
  now-forgotten Roman names (Camillus, Caeso, Volesius, Leonnatus; Scipio,
  Cato; then Augustus, Hadrian, Antoninus Pius) with no epithet
  distinguishing which Cato (the Younger? the Elder, i.e. the Censor?) or
  which Scipio (Africanus? Aemilianus? another?) is meant. Classical
  scholarship does not agree on this passage either. Per the namesake
  check, an occurrence that cannot be resolved from the text itself stays
  unbound rather than guessed -- neither word is bound at 4:27, in either
  edition. `test_cato_bound_at_1_10_only_scipio_and_4_27_cato_unbound`
  checks this.
- **"Severus"** names Marcus's teacher-"brother" at 1:10 (bound), but a
  second, bare "Severus" appears once more in Book 10's private list of
  obscure contemporary namesakes ("when Xenophon, of Crito, or Severus,"
  10:29). Nothing in that list's context ties it back to the Book 1
  figure, so 10:29's occurrence is left unbound rather than assumed to be
  the same man. `test_severus_bound_at_1_10_only_10_29_severus_unbound`
  checks this.

Two further near-collisions resolve cleanly through plain global aliases
and longest-span-first matching, with **no location scoping needed**:

- **Alexander** is a clean three-way split, not really a collision:
  "Alexander the Grammarian" (1:6) and "Alexander the Platonic"/"the
  Platonist" (1:8) are two named Book 1 teachers, each always accompanied
  by his distinguishing epithet in the text; every other, unadorned
  "Alexander" (3:2, 6:21, 8:2, 9:27, 10:25) is Alexander the Great. All
  three resolve because the longer epithet always outscores the bare name
  at the same starting position. `test_two_alexanders_named_teachers_
  resolve_by_longest_span` checks every "Alexander" mention in the book.
- **"Fabius"** (bare, 4:41, an unidentified name in another vanitas list)
  and **"Fabius Catulinus"** (12:19, a distinct Book 12 figure) resolve the
  same way. `test_two_fabiuses_resolve_by_longest_span` checks both.
- **"Demetrius"** never actually appears bare: "Demetrius the Platonic"
  (8:23) and "Demetrius Phalereus" (9:27) are different people, each always
  carrying its own distinguishing epithet, so plain global aliases suffice.
  `test_two_demetriuses_resolve_by_epithet_alias` checks both.

**2. Person or not.** Excluded as non-persons: generic ethnic and
philosophical-school demonyms cited as collectives rather than specific
named bodies (the Quadi, the Sarmatai, the Ephesians, the Pythagoreans, the
Lacedaemonians, the Chaldeans, the Astrologers/Astrologians, the Sophists,
"the Athenians," "the Romans," "the Grecians"); places (Rome, Athens,
Sinuessa, Carnuntum, Cajeta, Macedon, Asia, Europe, Mount Athos, Helice,
Pompeii, Herculaneum, the Isles of the Blessed/Elysian Fields); the racing
factions and gladiator types of 1:1 (Prasini, Veneti, Parmularii,
Secutores), which are types, not individuals; and personified abstractions
-- "Nomos" and "Nemon" at 10:23, Marcus's own Greek wordplay for "Law" and
"Distributor" describing the divine governor of the universe, not a
distinct named figure, and the plural "Muses" (11:15), a generic
invocation rather than a specific address to any of the nine. Two
collectives are specific enough to card in their own right: "the Senate"
(8:27, kind `group`) and "the Pompeys" (8:28, kind `family`, the gens
Pompeia, cited via the epitaph "he was the last of his own kindred").
Watched carefully per the "cities named after founders" warning: "the
lovely city of Cecrops" (4:18) names Athens by its legendary founder, but
the entity carded is Cecrops the person, not the city -- the sentence
itself is quoting a saying that addresses him, not it.

**3. Scriptural and mythological references.** Chryses (1:13, the priest
from the opening of Homer's Iliad, praying by the seashore), Cecrops (4:18,
Athens's legendary founding king), Hercules (11:15, "the guide and leader
of the Muses," source of a maxim, not the labors), Empedocles's image of
the soul as a sphere (11:10, 12:1, the philosophical doctrine, not a
narrative import), and Aesculapius (6:34, the healing god, kind
`cultural-figure`) are each bound to confirm identity without importing
surrounding myth. Hymen (10:29) is treated cautiously: likely a person
bearing the marriage-god's name as an ordinary personal name in Marcus's
list of private comparisons, not an invocation of the god himself, and the
card says so rather than asserting either reading as certain.

**4. Ambiguous or generic references.** Left deliberately unbound: Marcus's
own self-references as "Antoninus" (6:22, 6:35 -- see check 1); the
undifferentiated "Cato" and "Scipio" at 4:27 (see check 1); the
undifferentiated "Severus" at 10:29 (see check 1); "the poet" quoted
without attribution at 11:5 and 12:16 (Euripides is the likely source for
at least one of these two "Cithaeron"/leaf-falling quotations, but the text
does not name him, so no card is invented); and "him that begot me," "my
mother," "my great-grandfather," "him that brought me up," and similar
unnamed family references throughout Book 1, which never surface a proper
noun for the card system to bind against (Marcus's actual father and
several teachers are described at length but never named -- only the
named Book 1 figures listed above get entries). "Cadicianus" is bound
carefully: original-en prints "Cadiciant's," a Gutenberg transcription
slip missing a syllable (should be "Cadicianus's"); both spellings are
aliased and the slip is left exactly as printed, per the hard constraint
against editing edition files.

**5. Spot-read the bindings.** I spot-read more than ten mentions per
edition at random (`random.seed(7)`, 12 per edition, 24 total) after
building the package, cross-checking each against the paragraph context I
had read while authoring; every one resolved to the person I expected --
`leon-of-salamis` at 7:36 ("Salaminius"), `verus-father` at 8:23 ("Verus"),
`severus-brother` at 1:10, `fabius-obscure` at 4:41, `alexander-the-great`
at 3:2, `demetrius-the-platonic` at 8:23, `alciphron` and `euphrates` at
10:29, `cato-the-younger` at 1:10, and more. I additionally read every
location cited in checks 1-4 above in full context in both editions while
authoring, not as a random sample after the fact, given how the
namesake-heavy Book 1 and Book 8 demanded it.

**6. Both editions independently.** I read all twelve Books in full,
paragraph by paragraph, in both editions before authoring, and built the
candidate list from a systematic capitalized-word frequency sweep of both
texts (`\b([A-Z][a-z']+(?:[-'][A-Z][a-z']+)*)\b`, minus a stopword set)
rather than relying on memory alone -- there is no `meditations-threads.json`
for this book to use even as a lead. `omittedEntities: []` on both sides
confirms no entity is bound in one edition and silently missing in the
other; unlike some Lane A books, both editions here render every name
closely enough (differing only in spelling, never in presence or absence)
that mention counts match exactly, 165 to 165.
`test_both_editions_agree_on_mention_count` checks this explicitly. Several
names needed a second, ligature-restored alias for original-en's older,
Gutenberg-sourced translation, which renders ae/oe as æ/œ where modern-en
spells them out in full (Crœsus/Croesus, Mæcenas/Maecenas, Cæso/Caeso,
Phœbus/Phoebus) -- `test_diacritic_and_ligature_spelling_variants_bind_
both_editions` checks each, plus the Cadicianus/Cadiciant transcription
slip above.

## Source review

Both source files have 12 Books and 412 paragraphs, with identical
per-Book paragraph counts (17, 14, 17, 43, 30, 51, 44, 58, 43, 37, 31, 27)
on both sides. No source edits. No boilerplate, footnotes, or bracketed
apparatus differences were found between editions beyond the ligature and
transcription-slip spelling variants documented in check 6 above -- unlike
Beyond Good and Evil, this translation pair carries no Gutenberg footnote
apparatus to strip or fold.

## Commands

```sh
python3 books/characters/meditations/author_content.py
python3 books/characters/build_meditations.py
python3 books/characters/build_meditations.py --check
python3 -m unittest books.characters.test_meditations -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Fifteen tests: saved-package freshness; exact UTF-16 spans and source
hashes; no invented outcomes or missing reference entries (109 entries,
zero omissions, one snapshot each); the two Major entries being exactly
Socrates and Antoninus Pius; the eleven Supporting entries being exactly
Book 1's dedicated teacher portraits; the two Veruses, two Maximuses, and
two Alexanders each splitting cleanly by location or epithet across every
mention, not a sample; Cato/Scipio at 4:27 and Severus at 10:29 confirmed
unbound; Marcus's own two self-references to "Antoninus" confirmed unbound
while the 8:23 backward reference to his father still binds; the two
Demetriuses and two Fabiuses resolving by epithet and longest span; five
ligature/transcription-slip spelling variants each firing at least once in
the edition that needs them; and both editions agreeing exactly on mention
count.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
