# On the Genealogy of Morals character package

All four reading units (Preface, First Essay, Second Essay, Third Essay) in
both English editions: 72 recognition cards, 199 exact mentions in each
edition, 124 paragraphs per edition. The source files are byte-identical to
the checkout at authoring (see Source review below).

Read `cards.md` for category and copy together. This is a treatise with no
invented cast: 70 of 72 entries are Reference — named philosophers,
historians, poets, theologians, and mythological or scriptural figures
Nietzsche cites, mostly once or twice, never as staged participants in a
narrative. Two entries are Major, not because they are "characters" but
because they anchor sustained, multi-paragraph analysis rather than a single
citation: **Schopenhauer** (Preface §5–6; the philosopher paying homage to
the ascetic ideal across most of the Third Essay's opening sections) and
**Wagner** (the artist case study that opens the Third Essay, §2–6). Every
entry has exactly one recognition snapshot; there are no plot developments
to gate, since nothing here is a spoiler in the ordinary sense.

## Editorial checks

**1. Namesakes.** The one real collision risk in this book is **Paul**: Dr.
Paul Rée, the target of the Preface's polemic, and Paul the apostle, named
in the First Essay (2:35) among the figures before whom "almost half the
world" now bows. They never collide because a bare "Paul" never occurs in
either edition: Rée is always "Dr. Paul Rée" or "Dr. Rée," and the apostle
is always "Paul the tent-maker." `test_paul_ree_and_paul_the_apostle_never_collide`
asserts neither entity's mention text is ever the bare string "Paul." I also
swept both editions for every other bound name (and for "Zeus"/"Jove" and
several adjectival forms) before authoring; no other name recurs for two
different people. **Peter** is named twice, 2:35 ("Peter the fisher") and
4:32 ("An immortal Peter!") — the same apostle both times, not a namesake
collision; `test_peter_and_jesus_spread_across_both_essays` pins both
locations to one entity.

**2. Person or not.** Excluded as non-persons: places (Sils-Maria, the
Piazza di San Marco, Corioles-style city names do not occur here but Rome,
Judaea, Ephesus and Persia do, and are left unbound), books and their
titles (Human all-too-Human, Beyond Good and Evil, The Dawn of Day, Joyful
Wisdom, the Talmud, the New Testament), a school of philosophy (Vedanta,
Sankhyam) and a coin-like eponym that names a rest cure rather than a
disease (the "Weir-Mitchell isolation" — bound instead to the physician the
cure is named for, Silas Weir Mitchell, since he is the one being invoked).
The one real "work named after its protagonist" trap in this book is
**Zarathustra**: "my Zarathustra" (1:9) and the "Thus Spake Zarathustra"
epigraph attribution before the Third Essay (4:0) both name Nietzsche's own
book, not a person, and are left unbound. Only the Second Essay's closing
line — "open alone to Zarathustra, Zarathustra the godless" (3:31) — invokes
him as a distinct voice, and that is the only location bound to the entity.
`build_genealogy_of_morals.py` binds it with a location-scoped rule rather
than a bare alias for exactly this reason; `test_zarathustra_is_not_the_book_title`
asserts the entity is bound only at 3:31.

**3. Scriptural and mythological references.** Jesus, Peter, Paul and Mary
(First Essay, 2:35) are bound as the historical/scriptural figures named. A
much larger cluster is quoted in Latin from Tertullian's *De Spectaculis*
(2:33), naming Jove, Rhadamanthus, Minos and Christ among the fates awaiting
pagans after judgment. I left every proper name inside that Latin block
unbound except **Tertullian** himself, who is named in the surrounding
English gloss ("Tertullian is henceforth referring to the Jews") rather than
in the Latin. Binding names inside an extended, mostly-untranslated Latin
quotation risks matching inflected Latin forms as if they were the English
alias, and none of those figures do any other work in the book — the glosses
already in the source text explain what the reader needs. **Zeus** is bound
only at Nietzsche's own English-language invocations (3:19, "whether he be
called Zeus or Chance"; 3:26, the Homeric Zeus quotation) and specifically
*not* at "ipso Jove" inside the Tertullian Latin — a different author's
reference, in a different language, embedded in the block just excluded.
`test_zeus_is_nietzsches_own_greek_reference_only` asserts no mention text
is ever "Jove." Mythological figures invoked as one-line metaphors rather
than narratives (Heracles, Ixion, Pygmalion, Achilles, Aegisthus) are bound
where the author names them, with cards that say plainly they are being
invoked as a comparison, not retold as a story.

**4. Ambiguous or generic references.** Left deliberately unbound: honorifics
and offices ("the Pope" as an office — only Innocent III and, in the Luther
passage, an unnamed later pope referred to as "that devil's hog, the Pope,"
are not the same reference and neither is bound to a specific pope by that
epithet alone), and collective peoples/confessions central to the essays'
own argument — **the Jews**, **the Germans**, **the Greeks**, **the
Romans**, and **Buddhists** as a group. These are not incidental background
figures the way a "the provincial governors" gloss is; they are the actual
subject of extended argument, and giving any one of them a "person" card
would flatten the essay's own claims about peoples and moralities into a
single figure. Bare "the Philosopher," "our author," and "the Stagirite"
type honorifics do not occur in this book. One reference I could not
resolve from the text is deliberately unbound: **"Sir Christopher" in
Shakespeare** (4:23, cited alongside vegetarianism's opponents). I could not
pin this to one identifiable Shakespeare character or speech from the
Genealogy's text alone, and a Folger-style comparison text was out of scope
for this pass; `test_sir_christopher_deliberately_unbound` asserts it
carries no entity.

**5. Spot-read the bindings.** I read the surrounding sentence for 10
mentions per edition, chosen at random (`random.seed(42)` over the compiled
mention list), plus every mention flagged by the tests above. All 20 read
correctly in context: e.g. `jesus` at 2:35 ("to the mother of the aforesaid
**Jesus**, named Mary") correctly resolves the anaphoric "aforesaid Jesus"
back to the Jesus of Nazareth named earlier in the same sentence, not to a
different Jesus; `kuno-fischer` at 3:17 is Spinoza's commentator, not
Spinoza himself; `vicvamitra` at 4:13 is the Indian king of the "new heaven"
story, not a generic "king."

**6. Both editions independently.** `modern-en` is, for every proper noun in
this book, a byte-for-byte-identical set of names in identical chapter/
paragraph locations to `original-en` — verified by an exhaustive per-name
location sweep of both files before authoring, and confirmed by the build's
own `omittedEntities: []` on both editions. This is a treatise translated
paragraph-by-paragraph with names preserved, not a work where one edition
drops or adds a character; there are no `omittedEntities` to record for
either edition.

## Source review

Both source files have 4 chapters (Preface, First Essay, Second Essay,
Third Essay, stored as one reading unit each) and 124 paragraphs, with
identical paragraph counts per chapter (11, 40, 32, 41) on both sides. No
source edits. The original prints occasional non-ASCII Greek and Latin
(ἐσθλος, κακός, ἀγαθός, εὐπράττειν and others; the extended Tertullian
quotation) that `modern-en` reproduces unchanged, since these are quotations
within Nietzsche's own text rather than passages requiring modernization.
One OCR-style spacing artifact in the original ("Ubigaudeam" for "Ubi
gaudeam" inside the Tertullian Latin) is carried unchanged in both editions,
as printed; it is inside the untranslated Latin block already excluded from
binding, so it affects no offsets.

## Binding notes not covered above

- **Dühring** is bound under `E. Dühring`, `Eugen Dühring`, and bare
  `Dühring`; the single alias `Dühring` alone is sufficient (word-boundary
  matching finds it inside all three forms), but all three are listed for
  clarity since he is named differently across the Second and Third Essays.
- **Achilles** is bound both at its one-line metaphorical use (2:10, "a
  veritable Achilles of free thought") and its literal use as Homer's
  literary creation (4:5) — the same underlying mythological/literary
  figure either way.
- Adjectival forms of bound names (Homeric, Wagnerian, Schopenhauerian,
  Lutherian, Anacreontic) are never captured as mentions, since the
  exact-alias matcher requires a word boundary after the alias;
  `test_no_mention_leaks_into_an_adjective` asserts this directly.

## Commands

```sh
python3 books/characters/genealogy-of-morals/author_content.py
python3 books/characters/build_genealogy_of_morals.py
python3 books/characters/build_genealogy_of_morals.py --check
python3 -m unittest books.characters.test_genealogy_of_morals -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Ten tests: saved-package freshness; exact UTF-16 spans and source hashes;
the Paul Rée / Paul-the-apostle non-collision; Peter and Jesus spread across
both essays without collision; Zeus bound only to Nietzsche's own Greek
invocations, never the Latin "Jove"; Zarathustra bound only at its one
person reference, never the book-title uses; no mention leaking into an
adjective; no invented outcomes or missing reference entries (72 entries,
zero omissions, one snapshot each); and the Major-category entries being
exactly Schopenhauer and Wagner.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
