# Ulysses character package — IN PROGRESS

**Episode 1 of 18 is authored. The rest are not.** Status stays `in-progress`
and the package must not be integrated until the whole book is covered.

Current state: 50 entities authored, all 50 bound in the older edition and 48 in
the modern one, 869 and 871 exact mentions. Of those, 337 and 339 fall inside
episode 1; the rest are later occurrences of names that belong to one person
through the whole book — Stephen, Mulligan, Haines, Cranly, Wilde — bound by
alias and carded to be true anywhere. Content revision 2026-09-14.1.

## What is hard about this book

**A surname in Ulysses is almost never one man.** *Dedalus* is Stephen in
episode 1, his father Simon from episode 6, and his sisters in episode 10.
*Bloom* will be Leopold, Molly, Milly, Rudolph and Rudy. *Mulligan* is Buck
everywhere except 10:349, where it is John Mulligan, the manager of the
Hibernian bank. *Malachi* is Buck everywhere except 12:50, where it is the ardri
Malachi among the Irish heroes, and 12:513, where it is Saint Malachy walking
with Saint Patrick. Even *Stephen* is not always Stephen: 17:39 is 16 Stephen's
Green, the Dublin square, and 15:407 is Saint Stephen's day in the wren-boys'
song.

All five of those were found in the episode-1 pass by the one discipline this
library has learned to do first: **list every occurrence of a name across the
whole book before choosing between an alias and a key.** None of them is in
episode 1. Every one of them would have been a wrong card in a chapter nobody
had read yet.

**The modern edition is a rewrite, not a normalisation.** This is the finding
the release owner most needs. In other books in this library the modern edition
modernises spelling and resolves a pronoun here and there. Here it changes the
cast of a paragraph:

| Older edition (1:x) | Modern edition | Effect |
|---|---|---|
| "what **Algy** calls it" (35) | "what **Swinburne** calls it" | a nickname replaced by the surname |
| "**Billy** Pitt had them built" (268) | "**William** Pitt had them built" | a nickname replaced by the formal name |
| "poor **dogsbody**!" (47) | "poor old **Stephen**!" | a nickname replaced by a name, adding a mention |
| "watching **him** still" (13) | "watching as **Mulligan** propped" | a pronoun resolved, adding a mention |
| "**Chrysostomos**." (9) | *(the word is gone)* | a mention removed |
| "**Mercury's** hat quivering" (293) | "**his** hat quivering" | a mention removed |
| "Chuck **Loyola**, Kinch" (101) | "Forget your Jesuit brooding" | a mention removed |
| "pseudomalachi" (9:194) | "false Malachi" | a compound split, adding a mention |
| "Sonmulligan" (9:331) | "Son-Mulligan" | a compound split, adding a mention |

Two entities are therefore **absent from the modern edition's text altogether**
— Chrysostomos and Mercury — and are recorded as `omittedEntities` for that
edition with the reason on the card. That is the mechanism the editorial policy
provides for exactly this case, and it is the first time in this library that it
has been needed for a name the translation simply deleted.

**Joyce's people think in half-names.** Mulligan calls Stephen *Kinch* and
Swinburne *Algy*; Stephen is *dogsbody* and *the bard*; the ashplant calls him
*Steeeeeeeeeeeephen*, which no alias can match and which is keyed by hand. A
half-name is bound only where the text settles who it is.

**Nine people in episode 1 are named only by a description**: Mulligan's aunt,
his mother, his brother, the milkwoman, the young man and the elderly man at the
fortyfoot hole, the boatman and the businessman on the cliff, and the man who
was drowned nine days ago. Each has a card and is bound on the phrase the text
uses. Stephen's mother is a tenth: she is the presence the whole episode turns
on and she is never named in it.

## Editorial checks — episode 1

**1. Namesakes.** Eight names in episode 1 belong to somebody else elsewhere in
the book, and all eight are keyed rather than aliased: Ursula (12:513 is S.
Ursula of the eleven thousand virgins), Aubrey (9:294 is the theatre owner of the
Shakespeare argument), Mrs Cahill (10:542 is Cahill's corner, a place), Lily (six
women of the name), Butterly (15:449 is Maurice Butterly, farmer), Bannon,
Hamlet and Shakespeare. Three more are suppressed where the book-wide alias
would be wrong: Stephen at 17:39 and 15:407, Mulligan at 10:349, Malachi at
12:50 and 12:513.

**2. Person or not.** Excluded: Dublin and its places (Kingstown, Sandycove,
Clongowes, Bray Head, the Muglins, Bullock harbour, the Forty Foot), the pubs and
institutions (the Ship, Dottyville, the Mater, Richmond, Magdalen), the peoples
(Irish, English, Saxon, Britisher), and the books and songs (the Mabinogion, the
Upanishads, the ballad of joking Jesus).

**3. Deliberate gaps, each pinned by a test.**

- **"By Jove" at 1:156** is Haines's exclamation, not the god — the same judgment
  as the epicycle of Mercury in the Montaigne package.
- **"Mercurial Malachi" at 1:250** is an adjective, and Mulligan is bound there by
  his own name in the same phrase.
- **Christ is deliberately not cast**, with the Christian God, as in every other
  package in this library — so the ballad of joking Jesus at 1:288 and 1:296
  names him and he carries no card. Joseph the Joiner, who is a character in the
  ballad rather than an object of devotion, *is* cast.
- **The word "mother" is not always Stephen's mother**: the sea is a great sweet
  mother at 1:35, our mighty mother at 1:37 and hailed as one at 1:45; 1:83 is
  Mulligan's mother, who has her own card; 1:155 and 1:162 are part of mother
  Grogan's name; 1:288 is the jew mother of the ballad.

**4. Spot-read.** Twenty-eight mentions were read as sentences across both
editions; all twenty-eight were right.

**5. Adjacency sweep.** Twenty-three hits, all sound, and it is what found that
*Malachi Mulligan* at 1:15 was taking two adjacent spans instead of one.

**6. Both editions independently.** Seven bindings fall in one edition and not
the other, and all seven are the rewrite class set out in the table above. No
card differs between the editions.

## Source defects — recorded, not repaired

No edition byte was touched.

| What | How it is handled |
|---|---|
| **The modern edition deletes three of Joyce's allusions** — Chrysostomos at 1:9, Mercury's hat at 1:293, and Chuck Loyola at 1:101. | Not repaired. Chrysostomos and Mercury are `omittedEntities` for that edition; Loyola binds at 9:65 in both and so is not omitted, only absent from this paragraph. A reader of the modern edition will not be offered these cards, and the release owner should know that before integration. |
| **The modern edition renames two people** — Algy to Swinburne at 1:35, Billy Pitt to William Pitt at 1:268. | Both forms are aliases on one card, and the card says which edition prints which. |

## Remaining work

- **Episodes 2–18.** 6,780 paragraphs, and the three longest are 15 (*Circe*,
  1,441 paragraphs), 17 (*Ithaca*, 654) and 11 (*Sirens*, 635). Episode 18
  (*Penelope*) is eight paragraphs of Molly's monologue and will be the densest
  page-for-page in the book.
- **Bloom has not been read yet.** He arrives in episode 4 and the *Bloom*
  surname is five people. Nothing should be aliased there until all five are
  separated.
- **Run the occurrence list on every new name.** It found five wrong bindings in
  unread episodes during the first pass alone.
- **The `Dedalus` table is the one to watch.** It has seven keys, all in episode
  1, and a `None` default. Simon Dedalus in episode 6 must be a second entity,
  not a default.

## Validation

`python3 books/characters/build_ulysses.py --check`, then `python3 -m unittest
discover -s books/characters -p 'test_*.py'` — 18 focused tests for this book so
far. No edition changes, no network generation, no API spend: every card here was
written in the authoring conversation and committed as a file.
