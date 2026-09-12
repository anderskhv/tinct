# The Imitation of Christ character package

All 114 chapters (the four Books' chapters are numbered sequentially
1-114 in the edition files, restarting only as a display title,
"Chapter 1," within each Book) in both English editions -- 27
recognition cards in each, zero omitted, 255 exact mentions in
original-en and 252 in modern-en, 774 paragraphs per edition (Book I: 25
chapters, 158 paragraphs; Book II: 12 chapters, 84 paragraphs; Book III:
59 chapters, 396 paragraphs; Book IV: 18 chapters, 136 paragraphs).

Read `cards.md` for category and copy together. This is a devotional
treatise addressed almost entirely to God/Christ as "Thou," with next to
no narrative cast -- matching the automation queue's own description of
this book, "Scriptural and saintly references; no cast." Per editorial
policy's guidance for treatises, nearly every bound entry is Reference: a
patriarch or apostle invoked once as an example, a saint quoted for a
maxim.

- **Central: Christ.** Addressed as "Thou" throughout and also named
  directly, over a hundred times, as Christ, Jesus, and the Son of Man.
  Much of Books III and IV is written as his own first-person counsel to
  the reader ("My Son..."), and Book IV's alternating "Voice of Christ"
  sections give him an explicit speaking part in its staged dialogue.
- **Major: the Disciple.** The book's other named voice -- the reader's
  own persona, given an explicit label, "The Voice of the Disciple,"
  heading alternating sections throughout Book IV's staged dialogue on
  the Eucharist. In Books I-III the same first-person voice is the
  ordinary, unnamed-narrator convention of a devotional treatise (the
  same standard Meditations, Confessions, and Walden apply to their own
  narrators), and is not labelled there.

## Editorial checks

**1. Namesakes.** None. No bare word in this book names two different
people anywhere in the text.

**2. Person or not.** The book's real editorial hazard is not a
namesake but a citation format: this edition prints scripture references
as dedicated footnote-list paragraphs -- 76 of 774 paragraphs in each
edition consist of nothing but strings like "(1) Job vii. 1 (Vulg.). (2)
1 Corinthians x. 13." Every book-title candidate this produces --
Matthew, Mark, Luke, John, Romans, Corinthians, Philippians, Hebrews,
James, Acts, Psalm(s), Genesis, Exodus, Leviticus, Numbers, Deuteronomy,
Joshua, Samuel, Kings, Chronicles, Job, Ecclesiastes, Proverbs, Isaiah,
Jeremiah, Ezekiel, Nahum, Zechariah, Zephaniah, Revelation, plus the
abbreviations "Vulg." (Vulgate), "Wisd." (Wisdom), "Cant." (Canticles),
and "1 Mac." (Maccabees) -- is a book title, not a person, and is never
bound, even where the cited book happens to be traditionally credited to
a real person who *does* get a card elsewhere (Matthew, Luke, John,
James, and 1 Peter are all traditionally attributed to real evangelists
or apostles). Ten names common to both a citation and a genuine person
mention -- David, Solomon, Noah, Joshua, Samuel, Moses, Job, Luke, John
the Baptist, and Peter -- are resolved by checking every occurrence
individually and binding only where the running prose itself names the
person as an agent (e.g. "as the Evangelist Luke hath it," "the blessed
Apostle Peter beseecheth"), via a location-scoped custom `bind()` match
rather than a global alias, so a footnote citation of the same bare word
elsewhere (e.g. "1 Samuel," "1 Peter ii. 11") is never mistaken for a
fresh mention. `test_bible_book_named_entities_never_bind_inside_
footnote_citations` and `test_footnote_citation_paragraphs_never_bind_a_
person` check every one of the 76 footnote paragraphs against every
mention of these ten names, not a sample. A sharper case within the same
family: "Job" appears in the running prose twice as a bare book-citation
("it is written in Job," "as is written in Job," 13:1 and 106:3) and
once as a genuine person-citation ("Wherefore holy Job saith," 34:5);
only the third is bound. Also excluded as non-persons: generic titles
and epithets ("King," "Bishop," "Pope," used only generically, never for
a specific identified ruler or prelate); the divine epithets "Father,"
"Comforter," "Author," and "Giver" (checked individually and found to
address God broadly, not the specific Trinitarian person of the Father,
so no separate entity is authored for him -- see check 4); the doctrinal
concept "Trinity"; and the nation "Israel" ("the children of Israel"),
a place/people reference, not a person.

**3. Scriptural and mythological references.** Bound to confirm identity
without importing the whole surrounding story: the patriarchs and
prophets (Moses, Samuel, Solomon, Noah, Joshua, David, Abraham, Adam,
Eve, Job), the apostles and evangelist (Paul, Peter, Luke, John the
Baptist), the Bethany household (Martha, Lazarus, and Mary Magdalene --
identified, per this genre's own traditional conflation, with the "Mary"
of the Bethany household as well as the "Mary Magdalene" of the
resurrection appearance), the Virgin Mary (kept as a separate entity from
Mary Magdalene, distinguished by the full phrase "Virgin Mary," see check
5), Zacchaeus, Satan, and the Holy Ghost (the Trinity's third person,
named separately from Christ; see check 6 for its edition-specific
phrasing). Three post-biblical saints are cited for a maxim rather than a
narrative episode: St. Francis of Assisi, the martyr Laurence, and Pope
Sixtus II (Laurence's "chief priest, whom he dearly loved"); a fourth,
St. Agatha, is named not in the running prose but in an editorial
footnote identifying the source of a quoted line as her own words rather
than a scriptural citation -- included anyway, since (unlike a Bible-book
citation) the citation itself names the actual person, not a book named
after her.

**4. Ambiguous or generic references.** Left deliberately unbound: "My
Son," Christ's most frequent form of address to the Disciple, which
names no one but the person already being addressed (not a distinct
"Son" entity, and not to be confused with the Trinitarian title "the Son
of Man," which is aliased to the Christ entity itself); the generic
divine epithets "Father," "Comforter," "Author," and "Giver," checked
individually (each addresses God or Christ in general terms in its
context, not specifically the Father as distinct from Christ and the
Spirit); "King," "Bishop," and "Pope," used only as generic offices; and
the 76 footnote-citation paragraphs' book-title references (see check
2).

**5. Spot-read the bindings.** I spot-read more than ten mentions per
edition at random (`random.seed(13)`, 14 per edition, 28 total) after
building the package, cross-checking each against the paragraph context
read while authoring; every one resolved to the person expected --
`christ` at 33:0-1, 80:2, 107:0, 97:14, 104:0, 26:1/3/5, 70:2, 32:0-1,
101:4, 74:5, 93:6, 99:3, 3:6, 36:3 (across both editions, as "Christ" and
"Jesus"), `the-disciple` at 100:1 ("The Voice of the Disciple"),
`lazarus` at 70:2, `luke-evangelist` at 19:7, `samuel-prophet` at 39:1,
and `holy-spirit` at 26:1 (correctly resolving "Holy Spirit" in
modern-en). I additionally read every location cited in checks 1-4 above
in full context in both editions while authoring, given how the
footnote-citation hazard demanded checking every Bible-book-named
candidate's every occurrence individually rather than sampling.

**6. Both editions independently.** I read all 114 chapters in full,
paragraph by paragraph, in both editions before authoring, and built the
candidate list from a systematic capitalized-word frequency sweep of both
texts (`\b([A-Z][a-z']+(?:[-'][A-Z][a-z']+)*)\b`, minus a stopword set),
the same method used for Meditations, Confessions, and Walden -- there is
no `imitation-of-christ-threads.json` for this book to use even as a
lead. Both editions carry the identical footnote-citation structure (76
of 774 paragraphs each). Every entity binds in both editions with zero
omissions, but mention counts diverge slightly by two names, both
paraphrase variance rather than a defect: `christ` (200 mentions in
original-en, 198 in modern-en) and `holy-spirit` (9 vs. 8) -- modern-en
occasionally uses a pronoun or otherwise paraphrases where original-en
repeats the name. The larger, structural divergence is terminology:
original-en's "Holy Ghost" is modern-en's "Holy Spirit" throughout (a
genuine, consistent modernization, not an error); both phrasings are
aliased on the same entity so it binds fully in each edition rather than
being omitted from one. `test_holy_spirit_binds_both_edition_phrasings`
checks this explicitly, and `test_both_editions_bind_every_entity`
confirms the zero-omission result on both sides.

## Source review

Both source files have 114 chapters and 774 paragraphs, with identical
per-chapter paragraph counts and an identical footnote-citation structure
(76 paragraphs beginning "(1)" in each). No source edits.

## Commands

```sh
python3 books/characters/imitation-of-christ/author_content.py
python3 books/characters/build_imitation_of_christ.py
python3 books/characters/build_imitation_of_christ.py --check
python3 -m unittest books.characters.test_imitation_of_christ -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Nine tests: saved-package freshness; exact UTF-16 spans and source
hashes; no invented outcomes (all 27 entries bound in both editions, one
snapshot each, zero omissions); Christ and the Disciple being exactly
the Central and Major entries; every Bible-book-named entity's every
mention checked against every one of the book's 76 footnote-citation
paragraphs, confirming none collide; Mary Magdalene and the Virgin Mary
resolving by longest-span-first; the Holy Ghost/Holy Spirit
edition-phrasing difference binding correctly in both; and both editions
agreeing on zero omissions.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
