# Ulysses character package — IN PROGRESS

**Episodes 1 to 4 of 18 are authored. The rest are not.** Status stays
`in-progress` and the package must not be integrated until the whole book is
covered.

Current state: 191 entities authored, 190 bound in the older edition and 188 in
the modern one, 1,294 and 1,287 exact mentions, 43 focused tests. Content
revision 2026-09-14.4.

## What is hard about this book

**A surname in Ulysses is almost never one man**, and after two episodes that is
not a caution but a measurement. Of the twelve surnames episode 2 introduces,
**twelve belong to somebody or something else elsewhere in the book**: Cochrane
is Cantrell and Cochrane's ginger ale at 5:65, Talbot is lord Talbot de Malahide
at 10:43, Halliday is Jacob Halliday the vintner at 12:312, Curran is John
Philpot Curran at 7:380 and Sara Curran at 12:172, Temple is Temple bar at
10:235, Blake is Phil Blake's weekly Pat and Bull story at 7:42, Price is Henry
Price the basket manufacturer at 17:587, and Gerty and Lily belong to other women
in six later episodes. Not one of them is an alias in this package. The working
rule for the rest of the book is therefore the opposite of the rule in every
other book in this library: **key by default, alias only on proof.**
 *Dedalus* is Stephen in
episode 1, his father Simon from episode 6, and his sisters in episode 10.
*Bloom* will be Leopold, Molly, Milly, Rudolph and Rudy. *Mulligan* is Buck
everywhere except 10:349, where it is John Mulligan, the manager of the
Hibernian bank. *Malachi* is Buck everywhere except 12:50, where it is the ardri
Malachi among the Irish heroes, and 12:513, where it is Saint Malachy walking
with Saint Patrick. Even *Stephen* is not always Stephen: 17:39 is 16 Stephen's
Green, the Dublin square, and 15:407 is Saint Stephen's day in the wren-boys'
song.

Episode 3 adds four more of the same kind, all of them found before a single
binding was written. *Richie* is Stephen's uncle here and **Richard Shakespeare**
at 9:375 and 9:391, where Stephen calls him one of the two noble kinsmen,
nuncle Richie and nuncle Edmund. *Pat* is Kevin Egan's son twice at 3:59 and is
bald Pat the waiter through the whole of episode 11, besides Pat Dignam, Pat
Farrell, Pat Claffey, Pat Kinsella and Pat Tobin. *Walter* is Richie's crosseyed
son and also Walter Sexton, Sir Walter Raleigh and Walter Bapty. *Sara* is the
aunt here and Sara Curran at 12:172. And *Tandy* is two men forty paragraphs
apart inside this one episode: master Shapland Tandy, who reads uncle Richie's
bills of costs at 3:19, and Napper Tandy of the song at 3:59.

All of those were found by the one discipline this
library has learned to do first: **list every occurrence of a name across the
whole book before choosing between an alias and a key.** None of them is in
episode 1. Every one of them would have been a wrong card in a chapter nobody
had read yet.

**The modern edition is a rewrite, not a normalisation.** This is the finding
the release owner most needs. In other books in this library the modern edition
modernises spelling and resolves a pronoun here and there. Here it changes the
cast of a paragraph — and episode 3 shows it doing so in **both** directions.

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

Episode 3 adds the opposite case, which is new in this library. Four people are
named in the modern edition and named nowhere in Joyce's paragraph: **Aristotle**
at 3:0, where the older edition has only *but he adds: in bodies* and the Italian
tag *maestro di color che sanno*; **Brian Boru** at 3:57, where Joyce wrote *the
Dalcassians*, which is the name of the king's people and not of a man; **Deasy**
at 3:10, where the older edition has only *his letter for the press*; and
**Queen Victoria** at 3:94, where the older edition has only *the old hag with
the yellow teeth*. Brian Boru is therefore an entity that exists **in the modern
edition alone** and is an `omittedEntity` for the *older* edition — the inverse
of Chrysostomos and Mercury, and the first time this package has had one.
Nothing in episode 3 goes the other way: every binding in the older edition is
also in the modern one, and a test asserts it.

Two entities are **absent from the modern edition's text altogether**
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

## Editorial checks — episodes 1 and 2

**1. Namesakes.** Twelve of episode 2's names are keyed for the reason set out
above, and each key carries a comment naming the other bearer. Eight names in
episode 1 belong to somebody else elsewhere in the book, and all eight are keyed rather than aliased: Ursula (12:513 is S.
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

**4. Spot-read.** Twenty-eight mentions in episode 1 and twenty-four in episode
2 were read as sentences across both editions; all fifty-two were right.

**5. Adjacency sweep.** Twenty-three hits in episode 1 and thirty-four in episode
2, all sound, and it is what found that *Malachi Mulligan* at 1:15 was taking two
adjacent spans instead of one.

**5b. The apostrophe.** The older edition sets O'Connell and O'Rourke with a
curly apostrophe and the modern one with a straight one. A pattern that spells
only one binds in one edition alone, which is the commonest way to lose half a
book's mentions in this library, and a test pins both forms.

**6. Both editions independently.** Seven bindings fall in one edition and not
the other, and all seven are the rewrite class set out in the table above. No
card differs between the editions.

## Editorial checks — episode 3 (*Proteus*)

Stephen alone on Sandymount strand: no scene, one remembered visit, and the
densest allusion in the book so far. 101 paragraphs, 65 new entities.

**1. Namesakes.** Nine names are keyed rather than aliased, each with a comment
in the builder naming the other bearer: Richie (Richard Shakespeare at 9:375 and
9:391), Pat (bald Pat the waiter, Pat Dignam, Pat Farrell, Pat Claffey, Pat
Kinsella, Pat Tobin), Walter (Walter Sexton, Sir Walter Raleigh, Walter Bapty),
Sara (Sara Curran), Burke (O'Madden Burke, Pisser Burke, Edmund Burke, Burke's
public house), Victoria (Victoria Frances, a Purefoy child, at 14:49), Adam (Adam
and Eve's church and tavern in five episodes, Adam Findlater, Villiers de
l'Isle-Adam, an Adam's apple), Fiacre (the church of Saint Fiacre in Horto at
12:360) and Lucifer (a match at 15:991). **Tandy is two men inside this one
episode** and is handled by two full-name aliases: master Shapland Tandy at 3:19
and Napper Tandy at 3:59. **Malachi at 3:67 is the high king who wore the collar
of gold**, not Buck Mulligan: the book-wide alias had to be suppressed at that
paragraph for the key to reach it, and the same key binds the ardri Malachi of
the roll of heroes at 12:50.

**Columbanus reached back into an episode already signed off.** Listing his
occurrences before choosing between an alias and a key found him at **2:73** —
*his mother's prostrate body the fiery Columbanus in holy zeal bestrode* — in a
chapter that had been called finished without him. He now binds there too. This
is the sixth time in this library that the occurrence list has found a figure
cast nowhere in an already-signed-off chapter.

**2. Person or not.** Deliberately **not** cast, and each one a trap: *delta of
Cassiopeia* at 3:82 is a star; *Tatters* at 3:72 is the cocklepickers' dog;
*Madeline the mare* at 3:2 is a horse in a song, and is not the Madeleine of
Rodot's at 3:56 — the two are spelt differently; *Marsh's library*, *Hodges
Figgis'*, *Rodot's*, *the bar MacMahon* and *Strasburg terrace* are places named
after people; *the Dalcassians* and *the Lochlanns* and *the red Egyptians* are
peoples; *Houyhnhnm* at 3:35 is a species out of Gulliver's Travels used as an
adjective; *Old Father Ocean* at 3:92 is the sea in an advertisement's voice; and
*the Hannigan famileye* at 3:54 is a rhyme in Mulligan's limerick, where the
aunt herself is bound instead.

**3. Scriptural and mythological references.** Adam and Eve are cast from 3:7,
where Joyce gives them their kabbalistic names — Adam Kadmon and Heva — and the
cards say so without importing Genesis. The Blessed Virgin is cast from 3:37,
Saint Ambrose from 3:89, Lucifer from the Latin of the Easter Exsultet at 3:93.
**Christ and the Christian God stay uncast**, as in every other package here, so
*the Holy Spirit* at 3:43 carries no card while Joseph the Joiner, already cast
in episode 1, binds there. The two Marys at 3:66 are cast as the women at the
tomb, which is what Stephen calls the two figures in the tide; the cocklepickers
themselves have their own two cards.

**4. Ambiguous or generic references, deliberately unbound.** *A hater of his
kind ran from them to the wood of madness* (3:35) and *Abbas father, furious
dean* (3:35) are Swift, and the text never names him. *A primrose doublet,
fortune's knave* (3:68) is a courtier with no name. *She serves me at his beck*
(3:57) is a Paris waitress known only by a pronoun. *There was a fellow I knew
once in Barcelona* (3:57) is never named. *One of her sisterhood* (3:6) is a
second midwife. Each is left unbound rather than guessed.

**5. Spot-read.** Sixteen mentions, eight from each edition, read as whole
sentences; all sixteen were right.

**6. Both editions independently.** The edition-asymmetry census over episode 3
returns **nothing bound in the older edition and not in the modern one**, and
four bindings the modern edition supplies on its own (Aristotle, Brian Boru,
Deasy, Queen Victoria — see the table above). Seven places describe the same
person in different words and are bound in both: *the panthersahib* / *the
panther-dreaming Englishman* and *his pointer* / *his gun dog* at 3:63 (Haines
and Mulligan asleep in the tower), *Belluomo* / *a handsome man* at 3:56, *Sir
Lout* / *some giant* at 3:65, *the head centre* / *the rebel leader* at 3:58,
*the virgin at Hodges Figgis'* / *the young woman at the bookshop* at 3:83, and
*madame in rue Gît-le-Cœur* / *the madam on the Street of the Lying Heart* at
3:59.

**A mechanical trap worth recording.** *Los Demiurgos* at 3:1 sits inside
Gutenberg italic underscores, and the shared alias binder guards its matches with
`\w`, which an underscore satisfies — so the name **could not be bound by alias
at all**, silently. The keyed tables guard with `[A-Za-z]` instead and reach it,
so the demiurge is bound as a phrase and a test pins it. Any alias in this
library whose only occurrence is inside `_italics_` is invisible in exactly this
way.

**Fourteen people in episode 3 are named only by a description** and are bound on
the phrase the text uses: the cocklepicker and his woman, the girl at the
bookshop window, the two Marys, Kevin Egan's wife, the froeken at Upsala, the
Bruce's brother, the cornet player, the bishop of Cloyne, Mulligan's aunt again
at 3:53 and 3:54, and the man who was drowned, who is the same man the cliff
watchers were waiting for in episode 1. **The head centre is the hardest of
them**: the text names him by his office and never by his name, and the card says
so rather than supplying the name from outside the book.

## Editorial checks — episode 4 (*Calypso*)

Bloom arrives. 173 paragraphs, 34 new entities, and the hardest single table in
the book.

**1. Namesakes — and the reason there is no `Bloom` key at all.** *Bloom* is
five people (Leopold, Marion, Milly, Rudolph and Rudy) **and a mountain range**:
4:38 is *Slieve Bloom*, in Offaly, in the middle of Bloom's own thoughts about
the schoolboys' geography. Every mention in this episode is therefore keyed on a
longer phrase — `Mr Leopold Bloom`, `Mr Bloom`, `Mrs Marion Bloom`, `Milly
Bloom`, `Mr and Mrs L. M. Bloom` — and the bare surname is not a key anywhere in
the builder. A test asserts that it never becomes one.

Nine more names are keyed with the other bearer named in the comment: *Boylan*
(16:19 and 16:23 are Boylan the billsticker, whom nobody in the book connects
with this one; 12:260 is a Mr Boylan in the citizen's deaf-man story), *Molly*
(the Molly Maguires at 12:364, *Molly bawn* at 18:3, two songs), *Marion* (Rotha
Marion at 12:59, S. Marion Calpensis at 12:513), *Dignam* (his son, Master
Patrick Aloysius, in episodes 10 and 15), *Tweedy* (the crown solicitor for
Waterford at 6:103; Molly herself as Madam Marion Tweedy from episode 16),
*Woods* (Williams and Woods, the jam makers, at 18:5), *Beaufoy* (Mrs Beaufoy at
8:85, 13:98 and 15:203, who is **Mrs Purefoy under a slip of Bloom's tongue**),
*Kearney* (Kathleen Kearney), *Mastiansky* and *Moisel* (their wives). *Ruby* at
4:117 is two things in one paragraph — the **title** of the book, which carries
no card, and the **girl** on the floor, who does — and is keyed by occurrence.

**The head centre of episode 3 gets his name here.** At 4:159 Bloom thinks *the
chap in the paybox there got away James Stephens, they say* — and the man
episode 3 could only call by his office is named. The card was rewritten and the
entity now binds at 4:159, 8:133, 12:234 and 15:433. **9:126 is a different
James Stephens**, the writer *doing some clever sketches*, and gets no card.

**Bannon joins up across three episodes.** He sends a card from Westmeath in
episode 1 about a sweet young thing, a photo girl; Milly writes home from
Mullingar in episode 4 about *a young student comes here some evenings named
Bannon*. Same man, and the occurrence list is what connects them.

**2. Person or not.** The shops of Dublin keep their owners' names and are not
cast: *Buckley's*, *Denny's*, *Boland's*, *Plasto's*, *Drago's*, *M'Auley's*,
*Andrews*, *Cassidy's*, *Thornton's*, *Hengler's*. Larry O'Rourke and Dlugacz
**are** cast, because both are men in the scene and not only names over a door.
Also not cast: the cat, who has more dialogue in this episode than most of the
human cast; *Agendath Netaim*, a planting company; *George's church* and *Saint
Joseph's National school*; *Erin's King*, a pleasure boat; *Titbits*, *Photo
Bits* and the *Freeman*; the *Bath of the Nymph* over the bed; *Don Giovanni*,
which the modern edition supplies at 4:97 and 4:107 as the name of the opera the
arias come from; and *Towers, Battersby, North, MacArthur*, who are auctioneers'
names on a bill.

**4. Ambiguous references, deliberately unbound.** *O'Brien.* at 4:159 — one
word on its own after the thought about James Stephens, and the book never says
which O'Brien. *Did Roberts pay you yet?* at 4:164 — there is a George Roberts
at 9:126 and a Lord Roberts at 18:1, and nothing here settles it. *May's band*
at 4:165 is a music warehouse, not a woman. *Mr Coghlan took one of me and Mrs*
at 4:135 — Mrs Coghlan is never named. *The aproned curate* at 4:30 is a barman
with no name. Each is left unbound.

**5. Spot-read.** Sixteen mentions, eight from each edition, read as whole
sentences; all sixteen were right.

**6. Both editions independently.** The asymmetry census over episode 4 returns
exactly two bindings in the older edition and none in the modern: **Adam
Findlater and Dan Tallon at 4:37**, where *they blossom out as Adam Findlaters
or Dan Tallons* becomes *they blossom into successful businessmen*. Findlater is
named nowhere else in the book and is an `omittedEntity` for the modern edition;
Tallon survives at 17:109 as the new lord mayor, Daniel Tallon. The modern
edition also deletes *Hanlon's* from 4:13, leaving only *the milkman* — both
editions bind the milkman, on the phrase each one uses.

**The italic trap caught a second name, and now has a standing test.**
*Matcham's Masterstroke* stands in Gutenberg italics at 4:162 and 4:163, so the
alias `Matcham` bound in the modern edition and silently not in the older one —
the same failure as *Los Demiurgos* at 3:1, and found the same way, by the
edition-asymmetry census. Both are keyed now. A test (`test_no_alias_in_this_
package_is_hidden_by_italics`) now compares every alias's matches under the
shared binder's `\w` guard against a `[A-Za-z]` guard over episodes 1–4 and
fails if they differ. Run over all eighteen episodes it reports two more, both
in unread territory and both worth knowing now: **Stephen at 15:1133**, inside a
stage direction, which will need a key when *Circe* is read; and **Patrice at
16:212**, which is not Patrice Egan at all but *the faubourg Saint Patrice
called Ireland for short*, and will need suppressing.

## Source defects — recorded, not repaired

No edition byte was touched.

| What | How it is handled |
|---|---|
| **The modern edition deletes three of Joyce's allusions** — Chrysostomos at 1:9, Mercury's hat at 1:293, and Chuck Loyola at 1:101. | Not repaired. Chrysostomos and Mercury are `omittedEntities` for that edition; Loyola binds at 9:65 in both and so is not omitted, only absent from this paragraph. A reader of the modern edition will not be offered these cards, and the release owner should know that before integration. |
| **The modern edition renames two people** — Algy to Swinburne at 1:35, Billy Pitt to William Pitt at 1:268. | Both forms are aliases on one card, and the card says which edition prints which. |
| **The modern edition supplies four names Joyce did not write** — Aristotle at 3:0, Brian Boru at 3:57 (for *the Dalcassians*), Deasy at 3:10, Queen Victoria at 3:94. | Not repaired. Each is bound in the modern edition and left unbound in the older one, where the text offers no name. Brian Boru exists in the modern edition alone and is an `omittedEntity` for the older edition. A reader of the older edition is never offered his card. |
| **The modern edition respells three names** — Ferrando to Fernando at 3:32, Patk MacCabe to Patrick MacCabe at 3:6, Haroun al Raschid to Haroun al Rashid at 3:74; and it renames Dan Occam to William of Ockham at 3:36, Joachim Abbas to Joachim of Fiore at 3:35, and Columbanus to Saint Columban at 2:73 and 3:51. | Every form is an alias on one card, and each card says which edition prints which. |
| **`_Los Demiurgos_` at 3:1 and `_Matcham's Masterstroke_` at 4:162 sit inside Gutenberg italic underscores**, which the shared alias binder counts as word characters. | Not repaired — no edition byte is touched. Both are bound by keyed patterns instead, and a standing test compares every alias under both guards. This is a **binder limitation, not a source defect**, and it applies to every book in this library: an alias whose only occurrences are inside `_italics_` binds nothing and nothing reports it. |
| **The modern edition deletes two Dublin names at 4:37** — *Adam Findlaters or Dan Tallons* becomes *successful businessmen* — and *Hanlon's* at 4:13. | Not repaired. Adam Findlater is an `omittedEntity` for the modern edition; Dan Tallon survives at 17:109; the milkman is bound in both editions on the phrase each one uses. |

## Remaining work

- **Episodes 5–18.** 6,299 paragraphs, and the three longest are 15 (*Circe*,
  1,441 paragraphs), 17 (*Ithaca*, 654) and 11 (*Sirens*, 635). Episode 18
  (*Penelope*) is eight paragraphs of Molly's monologue and will be the densest
  page-for-page in the book.
- **The Bloom family is keyed, never aliased.** Leopold, Molly and Milly are
  cast; Rudy is an alias because his name belongs to nobody else; Rudolph, the
  father, has not been named yet and arrives in episode 6. `Bloom` itself must
  never become a key — see the episode 4 checks above.
- **Run the occurrence list on every new name.** It found five wrong bindings in
  unread episodes during the first pass alone.
- **The `Dedalus` table is the one to watch.** It has seven keys, all in episode
  1, and a `None` default. Simon Dedalus now exists as a second entity — he is
  bound once, at 3:11, where he is only a voice in his son's head — and from
  episode 6, where the man himself appears, *Mr Dedalus* and *Dedalus* are him
  and not Stephen. The two must never share a default.
- **The Goulding household will be back.** Richie, aunt Sara, Walter and Crissie
  are all named again in episodes 6, 11, 13, 15 and 17, and 17:39 is the
  paragraph that states the relationships outright: *his aunt Sara, wife of
  Richie (Richard) Goulding*. Those keys should be extended, not aliased, when
  those episodes are read. 11:385 in particular is this Walter, crosseyed, and
  is deliberately left unbound until episode 11 is read in full.

## Validation

`python3 books/characters/build_ulysses.py --check`, then `python3 -m unittest
discover -s books/characters -p 'test_*.py'` — 43 focused tests for this book so
far. No edition changes, no network generation, no API spend: every card here was
written in the authoring conversation and committed as a file.
