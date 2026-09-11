# Paradise Lost character package

Both full English editions, 12 books, 1,188 paragraphs each, aligned paragraph
for paragraph. 171 entities authored, 167 bound in Milton's verse and all 171 in
the modern prose, 1,138 and 1,208 exact mentions. **No entity is missing from
both editions.** Content revision 2026-09-11.1.

## Why this book needs cards

Book 1 names eighteen fallen angels in ninety lines and explains none of them,
because Milton expects a reader who already knows that Chemos is the god of Moab
and that Thammuz is the one the women of Jerusalem wept for. That reader no
longer exists. The whole catalogue rests on one argument — that the gods of
Canaan, Egypt and Greece *were* these devils, worshipped afterwards under other
names — so Moloch's card has to be a rebel angel and the idol of Rabba at once.
It is.

## Verse against prose

The original is Milton's blank verse; the modern edition is prose. Milton
capitalises every line-opening, so a capital letter is not evidence of a proper
noun there. The inventory was built from the prose and checked back against the
verse, line by line where the two disagreed.

Milton's own spellings are carried as aliases: **Charlemain**, **Dalilah**,
**Philistean**, **Montezume**, **Atabalipa**, **Temir** for Tamerlane,
**Delia** for Diana, **Cytherea**, **Canaanite**, and the adjectives he uses in
place of names — **Orphean**, **Circean**, **Pegasean**. A test pins seven of
them.

## Editorial checks

**1. Namesakes.** Milton has few repeated names but three hard ones, all of them
the word *Son*:

- **The Son** of God, who speaks in Books 3, 6, 7, 10 and 11.
- **Adam**, whom Raphael addresses as "Son of Heaven and Earth" (5:55).
- **Death**, whom Sin addresses as "O Son" at 10:30.

A position table separates them and a test pins all three. The fourth is
**Jesus** at 12:39 — "Joshua, whom the Gentiles Jesus call" — where the name
belongs to Joshua, not to Christ. That is Milton's whole point about the type
and the thing typified, and binding it to the Son would have flattened it.

**2. Person or not.** Places, rivers, mountains and constellations are excluded,
which in this poem removes about half the proper nouns: Milton's geography runs
from Vallombrosa to Sofala to El Dorado, and almost none of it is a person. Four
decisions worth recording:

- **Sin**, **Death** and **Chaos** are each a person *and* the thing itself, and
  Milton means them to be. They are bound as the persons — Satan's daughter, her
  son, the Anarch old — with cards that say the fusion is deliberate. The
  exceptions are skipped by table: "Sin-bred" at 4:36 is a compound, and Book
  12's "stirring up Sin against law" is the act.
- **Night** is different. She is Chaos's consort in Books 1–3 and 10 and plain
  nightfall everywhere else, so she is cast only where she sits beside the
  throne — fifteen locations, listed in the builder. A test asserts no Night is
  bound outside those four books.
- **Serpent** appears thirty-two times and is bound **once**, at 1:4, where the
  poem itself says "It was the infernal Serpent". Every other Serpent is the
  animal Satan borrows, and none is bound. A test pins that to one location.
- The **winds** of Book 10 — Boreas, Caecias, Argestes, Thrascias, Notus, Afer,
  Eurus, Sirocco, Libecchio — are one card rather than nine, because what the
  reader needs is the fact that the winds are named at all, and that before the
  fall none of them blew hard.

**3. Scriptural and mythological figures.** The two layers are the poem's
substance, not decoration. Where Milton lays a classical story beside a
scriptural one — Pandora beside Eve, Proserpine beside Eden, Deucalion and
Pyrrha beside Adam and Eve praying — the cards say what the comparison is for
rather than retelling the myth.

**4. Ambiguous references.** Left unbound:

- **Aeneas** at 9:1, whom Milton calls only "Cytherea's son"; Cytherea herself
  is bound, her son is not.
- **Noah** in Book 11, shown at length and never named in the verse.
- **Nimrod** in Book 12, called only "a mighty hunter" and "that execrable son".
- **Cain**, **Abel** and **Enoch**, all shown in Adam's visions and none of them
  named.
- **Arthur**, whom the prose supplies at 1:56 where Milton writes only "Uther's
  son". Uther is bound; Arthur is recorded as an original-edition omission.

**5. Spot-read.** Twenty mentions drawn at random, ten per edition, read back
against their paragraphs. All twenty correct. A second sweep over every mention
abutting a capitalised word — the check that caught three real errors in the
Divine Comedy — turned up two here: the Heavenly Muse of line 6 bound to the nine
of Olympus rather than to Urania, and the Jesus of 12:39 bound to Christ rather
than to Joshua. Both fixed before the package was closed.

**6. Both editions independently.** Four entities are missing from Milton's verse
— Aeneas, Arthur, Noah and the Chaldeans, each a place where he writes a
periphrasis or a place-name and the prose supplies the person — and **none is
missing from both**, which is the check that separates paraphrase from a binding
that was never made. The modern edition omits nothing.

## Source defects

None. Both editions parse cleanly into 12 books and 1,188 paragraphs, align
paragraph for paragraph, and carry no line numbers or apparatus. The four
divergences above are translation choices, not defects, and no edition byte was
touched.

## Validation

`python3 books/characters/build_paradise_lost.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Twelve focused
tests. No edition changes, no network generation, no production verification
claimed here.
