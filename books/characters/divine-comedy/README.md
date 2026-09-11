# The Divine Comedy character package — IN PROGRESS

**Inferno (1–34) and Purgatorio (35–67) are authored. Paradiso (68–100) is not
yet done.** Status stays `in-progress` until all three canticles are
covered. Do not integrate this package yet.

Current state: 433 entities authored, 414 bound in the original and 431 in the
modern, 926 and 990 exact mentions. **No entity is missing from both editions**;
every remaining gap is one edition paraphrasing a name the other prints. Content revision 2026-09-11.1.

## Why this book matters most for cards

Almost everyone in the Comedy is a real person — a Florentine neighbour, a pope,
an emperor, a classical poet, a saint — and a reader without notes simply cannot
place them. Farinata, Cacciaguida, Piccarda, Pier della Vigna: the poem assumes
you know who they are. That is exactly what these cards are for, which is why
this package is worth the length it will take.

## Verse against prose

The original is Longfellow's blank verse; the modern edition is prose. Both run
to 100 cantos and 4,812 paragraphs and align paragraph for paragraph. As with the
Aeneid, Longfellow capitalises every verse line-opening, so the entity inventory
was built from the prose edition and checked back against the verse.

**Longfellow spells the guide Virgilius where the prose says Virgil**, and both
are aliases of one entity. He also writes **Guidoguerra** as one word,
**Francis of Accorso** for Francesco d'Accorso, **Ganellon**, **Soldanier**,
**Launcelot** and **Diomed** — all carried as aliases.

**Dante names himself exactly once in the whole poem**, when Beatrice calls him
by name in the earthly paradise (64:18). A test pins that to one location in
both editions; it is the kind of fact a reader should be able to check.

## Editorial checks — Inferno and Purgatorio

**1. Namesakes.** **Five different men are called Guido in the Inferno alone**:
Cavalcanti's son (10:20), Guido Guerra (16:12), Guido Bonatti (20:39), Guido del
Cassero of Fano (28:25) and Guido di Romena (30:25). Nothing but the canto
separates them.

Also: **two men named Brutus** — the republican who drove out Tarquin, seen in
Limbo, and Caesar's assassin in Lucifer's mouth; **two named Alexander** — the
tyrant in the boiling blood and Alexander the Great in India; **two named Buoso**
— the thief who becomes a serpent and the dead man Gianni Schicchi impersonated;
**Michael** the archangel against **Michael Scot** the astrologer; **Jacopo**
Rusticucci against Jacopo da Sant'Andrea; **Adam** the first father against
**Master Adam** the counterfeiter, who holds all of canto 30 and none of the rest
of the poem.

**2. Person or not.** Places, rivers, mountains and book titles are excluded.
The rivers of Hell are cast only as the powers they are where the poem treats
them so.

**3. Figures the poem does not name.** The Comedy identifies many souls only by
circumstance. Where the circumstance can be bound to a span that exists in *both*
editions, it is: the Old Man of Crete ("a grand old man" / "a great Old Man"),
the elder of Santa Zita, the Navarrese barrator ("the kingdom of Navarre"),
Guido da Montefeltro ("from the mountains between Urbino"), **Pier della Vigna**
("who both keys had in keeping" / "held both keys to Frederick"), Aristotle
("the Master of those who know"), Caiaphas, Potiphar's wife, and Mordred.

Eight more were **dropped rather than bound**, because the two editions word the
circumstance too differently to bind the same span in both: the one who made the
great refusal, the messenger from Heaven, Guy de Montfort, Andrea de' Mozzi,
Malatestino, Francesca's companion, Galeotto, and God. A card needs a span to
hang on; inventing one in a single edition would make the two editions disagree.

**4. Deliberately not invented.** Eight entities in the first draft came from
knowledge of Dante rather than from these two texts — Cavalcante, Griffolino,
Napoleone, Ceres, Annas and others — and the compiler reported every one as
having no mentions. They were removed. This is the second package in a row where
that check caught the same failure, and it is why the check exists.

**5. Spot-read.** Pending — will be run across all three canticles before the
package is set to `validated-package`.

**6. Both editions independently.** Twenty-one entities diverge and **none is
missing from both**, which is the check that matters: a name absent from one
edition is paraphrase, a name absent from both is a binding I failed to make.
Longfellow drops nineteen names the prose prints — among them Sychaeus,
Azzolino, Eurypylus, Elisha, Roland, Phaethon, Deianira, Rudolf, Wenceslaus,
Terence and Agathon — and the prose drops Mahomet and Camicion. Recorded as
`omittedEntities` and asserted by a test.

Purgatorio adds its own namesake work: **Pope Boniface the Eighth in Inferno 19
against Boniface of Ravenna in Purgatorio 58**; Saint Nicholas against Pope
Nicholas; Clement the Fourth against Clement the Fifth; three men called Ugolin
— the count in the tower, Ugolin d'Azzo and Ugolin de' Fantoli; Pallas the
goddess in the carved rout of the giants; and Peter of Aragon, whom Longfellow
calls **Pier** where the prose says Peter.

## Remaining work

- Paradiso (chapters 68–100): Piccarda, Justinian, Cunizza, Folco, Thomas
  Aquinas, Bonaventure, Cacciaguida, Peter Damian, Benedict, Saint Peter,
  Saint James, Saint John, Adam, and Bernard.
- The six editorial checks re-run over the whole poem.
- Spot-read of ten mentions per edition.

## Validation

`python3 books/characters/build_divine_comedy.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Eleven focused
tests so far. No edition changes, no network generation.
