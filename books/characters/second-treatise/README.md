# Second Treatise of Government character package

All nineteen chapters in both English editions: 47 recognition cards, 107
exact mentions in `original-en` and 108 in `modern-en`, 301 paragraphs per
edition. Zero omitted entities on either side.

Read `cards.md` for category and copy together. This is a political
treatise, not a novel: 44 of 47 entries are Reference — named biblical,
classical, medieval and contemporary figures Locke cites once or twice to
make a point. Three entries are Major, because the whole argument turns on
them rather than a single citation: **Sir Robert Filmer**, whose *Patriarcha*
this entire treatise (continuing the First Treatise) is written against;
**Adam**, the linchpin of Filmer's argument from paternal dominion that
Locke spends chapters 1, 5, 6 and 18 dismantling; and **Richard Hooker**,
quoted approvingly and at length throughout as Locke's own chief authority.

## Editorial checks

**1. Namesakes.** I swept every candidate name across both editions before
authoring (see the finder script referenced in the commit) and found **no
namesake collisions** in this book: every one of the 47 bound names resolves
to exactly one person. The one real risk area — five Genesis figures cited
in a single sentence at 5:14 (Cain, Abel, Abraham, Lot, Esau) — resolves
cleanly because each name is distinct and none recurs for a different
person elsewhere in the book. `test_five_genesis_figures_in_one_paragraph_
stay_distinct` asserts all five bind, to five different entities, at that
one location.

Two things are source-text spelling *quirks*, not namesakes, and are
documented rather than repaired: original-en spells Jephthah as "Jeptha"
(no middle h) at 19:45, while spelling it "Jephtha" at its other three
appearances (3:5, 8:17, 16:1); modern-en spells it "Jephtha" at all four
locations, including 19:45. Neither edition ever prints the modern
"Jephthah". And original-en lowercases "juvenal" at 19:33 (a Roman
satirist quoted in Latin) where modern-en capitalizes "Juvenal". Both
variants are carried as aliases; `test_jephthah_spelling_variants_all_bind`
and `test_juvenal_case_variant_binds_in_both_editions` assert both forms
occur where expected.

**2. Person or not.** Excluded as non-persons: peoples and nations (Israel,
the Saxons, the Britons, the Normans, the Danes as a people, the Jews,
the Grecian Christians), places (Sparta, Delphi, Hebron, Mount Seir,
Algiers, Peru, Mexico, America), a book/metaphor (Hobbes's *Leviathan*,
invoked only as "the mighty Leviathan" for the state, never as a person),
and generic titles or offices rather than named individuals: "Czar," "Grand
Seignior" (18:9, unnamed rulers-in-general), "the thirty tyrants at Athens"
and "the Decemviri at Rome" (18:5, historical bodies rather than individual
people Locke names), and "the author of the Mirrour" (19:43, an anonymous
medieval legal text Locke cites alongside Bracton and Fortescue without
naming its author, because the source itself doesn't). One genuine
"honorific vs. name" trap did not need resolving here, unlike the
Genealogy of Morals package: Hooker's own footnote at 6:24 calls Aristotle
"the archphilosopher" without naming him, and since the text itself never
gives the name, that mention is deliberately left unbound rather than
inferred (see check 4 below).

**3. Scriptural and mythological references.** Genesis supplies Adam, Eve,
Cain, Abel, Noah, Abraham, Lot, and Esau (5:0–5:15, on property before
fixed boundaries); Melchizedek is named once, in a Hooker footnote, for the
ancient union of kingship and priesthood. The Judges/Samuel narrative
(8:17) supplies Jephthah, Jotham, Gideon, Abimelech, Samuel, and Saul, cited
as evidence that early Israelite "judges" and kings were chiefly war
leaders; David appears both there and earlier (5:0, quoted from a Psalm).
2 Kings supplies Hezekiah and Ahaz (16:22), on a conquered king's son justly
throwing off a foreign yoke. Classical mythology supplies Hymen (7:3, the
god of marriage, cited for how long animal mates stay paired) and, in
Chapter 19's argument against passive obedience, Jupiter, Polyphemus, and
Ulysses (19:19, 19:23) — Locke's ironic image of Ulysses "preaching passive
obedience" while waiting to be eaten is a joke at the doctrine's expense,
not an endorsement, and the card says so.

**4. Ambiguous or generic references.** Left deliberately unbound: "the
archphilosopher" (6:24, a Hooker-footnote epithet for Aristotle that the
text itself never resolves to a name — see check 2); "one at Syracuse"
(18:5, an unnamed tyrant cited only by city); the kings of Assyria in
general (16:22, as distinct from the two named Assyrian-era kings of
Judah, Hezekiah and Ahaz, who are bound); and the anonymous "author of the
Mirrour" (19:43). None of these are namesake problems — they are cases
where Locke himself does not supply a name, and inventing one would
misattribute a specific identity the source never gives.

**5. Spot-read the bindings.** I read the surrounding sentence for 10
mentions per edition, chosen at random (`random.seed(11)`), plus every
mention flagged by the tests above. All 20 read correctly in context — e.g.
`saul` at 8:17 ("How shall this man save us?") is the people's doubt about
Saul specifically, not a generic king; `hubba` and `ahaz` at 16:22 are
distinct from the adjacent `hezekiah` and `hingar` mentions in the same
dense paragraph; `barclay` and `bilson` both land correctly within the long
final paragraph of Chapter 19, which cites nearly a dozen different jurists
and historians in a row.

**6. Both editions independently.** I read both editions in full and swept
every candidate name's locations across both before authoring. Both
editions agree on every name and location except the two spelling variants
(`Jeptha`/`Jephtha` and `juvenal`/`Juvenal`) already covered in check 1;
`omittedEntities: []` on both sides confirms no entity is present in one
edition and silently missing from the other. The small residual difference
in total mention count (107 vs. 108) is ordinary paraphrase: modern-en
names Samuel three times in 8:17 where original-en names him twice, the
third instance replaced by nothing more than a pronoun in the original —
not a dropped or added character.

## Source review

Both source files have 19 chapters and 301 paragraphs, with identical
paragraph counts per chapter (8, 16, 6, 4, 30, 27, 22, 34, 12, 2, 19, 6, 10,
10, 7, 23, 2, 15, 48) on both sides. No source edits. Chapter titles in
both editions repeat the chapter number in the title string itself (e.g.
"Chapter 5 — Of Property"); this is the source formatting, left as printed,
and titles are not indexed paragraph text in any case, so it does not
affect any offsets.

## Commands

```sh
python3 books/characters/second-treatise/author_content.py
python3 books/characters/build_second_treatise.py
python3 books/characters/build_second_treatise.py --check
python3 -m unittest books.characters.test_second_treatise -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Ten tests: saved-package freshness; exact UTF-16 spans and source hashes;
no invented Isaac or Jacob entities (unlike Fear and Trembling, this book
never names either); the Jephthah spelling variants (Jeptha/Jephtha, never
Jephthah) all binding correctly; the juvenal/Juvenal case variant binding in
both editions; Filmer's three citation locations forming the argument's
structural spine; five Genesis figures in one paragraph (5:14) staying
distinct; no mention leaking into an adjective; no invented outcomes or
missing reference entries (47 entries, zero omissions, one snapshot each);
and the Major-category entries being exactly Filmer, Adam, and Hooker.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
