# The Republic character package

Both full English editions, 10 books, 4,308 paragraphs each, aligned paragraph
for paragraph. 143 entities authored, 139 bound in the original and all 143 in
the modern edition, 620 and 652 exact mentions. **No entity is missing from both
editions.** Content revision 2026-09-12.1.

## Why a dialogue needs cards more than a novel does

There are no speaker tags. Socrates narrates the whole thing in the first person
and everyone else is "he said", so by the middle of Book 1 a reader genuinely
cannot tell whether Polemarchus or Thrasymachus is the one being refuted. Eleven
men are in the room; five of them argue and six are named once and never speak
again.

The other half of the cast is the one Plato quotes. Socrates argues by citation —
Homer, Hesiod, Simonides, Pindar, Aeschylus, Archilochus, Stesichorus — and then
proposes to censor most of them. Reading Book 3 without knowing who Eurypylus or
Chryses or Autolycus is means reading a list.

## Editorial checks

**1. Namesakes.** Three, and all three are traps:

- **Glaucon** the interlocutor and **Glaucus** the sea-god are one letter apart.
  The sea-god appears exactly once, at 10:278, as the image of the soul
  encrusted by the body. A test pins him to that one paragraph.
- **Diomedes** the hero of Book 3 and the proverbial "necessity of Diomede" in
  Book 6 are the same man, and are one entity carrying both spellings. The card
  says what the proverb means, since the text does not.
- **Ariston**, father of Glaucon and Adeimantus, against **Aristonymus**, father
  of Cleitophon. Distinct strings, so no rule was needed — but they are one
  paragraph apart at 1:18 and worth a reviewer's eye.

**2. Person or not.** Places, festivals and poem titles are excluded. Three
decisions:

- The **planets** at 10:313 — Saturn, Mercury, Venus, Mars, Jupiter — are the
  translator's parenthetical gloss on the colours of the whorls, not gods. Not
  cast.
- **Bendis** is cast and **the Piraeus** is not, though the festival of the one
  in the other is the occasion of the whole dialogue.
- **The Forms** are not a person, and are cast anyway. They are what Books 5 to 7
  are about, and a reader meeting "the Forms are known but not seen" without a
  card is stuck.

**3. Scriptural and mythological figures.** The gods are here almost entirely as
defendants: Zeus with his two jars, Hephaestus binding his mother, Ares and
Aphrodite in the net. Each card says what the story is and that Book 2 or 3
forbids it, because that is the use Plato makes of them. The myth of Er at the
end has its own small pantheon — Necessity, her three daughters, the Interpreter
— and all seven of those figures are confined to Book 10, which a test asserts.

**4. Ambiguous references.** Left unbound: the **many anonymous "he said"
speakers**, since a dialogue's attribution cannot be recovered from a name that
is not printed; **"the Muse of Philosophy"** at 6:210, which is a figure of
speech rather than one of the nine; and the **lowercase "ideas"** throughout
Jowett outside the four passages listed below, because the word is far too
common in ordinary English to bind on sight.

**5. Spot-read.** Twenty mentions drawn at random, ten per edition, read back
against their paragraphs. All twenty correct. The adjacency sweep over every
mention abutting a word found no errors — the first package in this run where it
did not.

**6. Both editions independently.** Four entities are missing from the original
and none from the modern. All four are the powers of Book 8 — **Insolence,
Anarchy, Waste and Shamelessness** — which the modern edition capitalises into
persons crowned with garlands and Jowett leaves as lower-case nouns (and calls
the fourth "impudence"). That is a translation choice, recorded as an
`omittedEntities` divergence and asserted by a test, not forced into the older
text.

## Two translation divergences that needed rules

**Jowett spells Hera "Here."** That cannot be an alias — it is one of the
commonest words in English. The goddess is bound by position at the three
paragraphs where the word is her name (2:245, 2:309, 3:92) and nowhere else. A
test pins all three.

**Jowett writes "idea" where the modern edition writes "Form."** Same problem,
same solution: the Forms are bound in the older translation only at the four
passages that define them — 6:330 "brought under a single idea", 6:332 "the
ideas are known but not seen", 6:396 "in and through the ideas themselves", and
10:14 "a corresponding idea or form". Each pattern is written so that it cannot
also match the modern edition's wording, which the plain alias already covers.

Jowett also writes **Athene** for Athena and **Cheiron** for Chiron, and uses
**Love** where the modern edition writes **Eros**. All three are carried as
aliases.

## Source defects

None. Both editions parse cleanly into 10 books and 4,308 paragraphs, align
paragraph for paragraph, and carry no apparatus or line numbers. No edition byte
was touched.

## Validation

`python3 books/characters/build_the_republic.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Eleven focused
tests. No edition changes, no network generation, no production verification
claimed here.
