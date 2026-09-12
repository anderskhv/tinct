# Walden character package

All eighteen chapters in both English editions -- 121 recognition cards in
each (122 authored, one omitted), 206 exact mentions per edition, 502
paragraphs per edition (136, 26, 12, 27, 19, 27, 21, 6, 35, 17, 18, 18, 22,
26, 15, 23, 30, 24). One omitted entity on both sides: Thoreau himself.

Read `cards.md` for category and copy together. Like Meditations and
Confessions, this is a private book with almost no plot, addressed to no
one -- per editorial policy's guidance for treatises ("cited thinkers
normally remain references"), the great majority of entries are Reference:
a philosopher or explorer cited once to make a point, a god named in a
mocking or admiring aside, an old authority quoted for a fact about
farming or entomology. What makes Walden's cast larger and stranger than
Meditations' is a genuine local layer underneath the citations -- real,
named former inhabitants of Walden Woods, real Concord contemporaries, and
two chapters staged partly or wholly as dialogue with capitalized speaker
tags.

- **Central:** Thoreau, the narrator, present on every page of his own
  book but never once named -- the whole thing is written in the first
  person. Per editorial policy's instruction not to cast a memoir's own
  narrator as a spoken-of character, this entry carries no bindable alias
  and is the package's one omitted entity, the same treatment Meditations
  gives Marcus Aurelius and Confessions gives Augustine.
- **No Major entries.** Unlike Confessions, Walden has no sustained human
  companion who recurs across many chapters by name. The two recurring
  unnamed visitors of Chapter 14 -- real-world scholarship identifies them
  as Ellery Channing ("a poet") and Bronson Alcott ("one of the last of "
  "the philosophers") -- are never given a proper name anywhere in the
  text and are deliberately left unbound; see check 4.
- **Supporting** (each gets a dedicated narrative paragraph or scene, the
  standard Meditations' README applies to Book 1's named teachers): **John
  Field** (the Baker Farm tenant of Chapter 10), **Cato Ingraham**,
  **Brister Freeman**, **Fenda**, **Zilpha**, and **Hugh Quoil** (Chapter
  14's former inhabitants of Walden Woods), **John Farmer** (the closing
  parable of Chapter 11), and the **Hermit** and **Poet** of Chapter 12's
  staged dialogue.

## Editorial checks

**1. Namesakes.** Five genuine collisions, three resolved by
location-scoped binding in `build_walden.py`, two by plain global aliases
and longest-span-first with no location scoping needed:

- **"Cato"** names two different men with no shared global alias: Cato
  the Elder, the Roman agricultural writer quoted four times for farming
  and household advice (1:102 -- the bread recipe Thoreau follows
  himself -- 2:6, 7:19, 13:5), and Cato Ingraham, the formerly enslaved
  Concord resident of Chapter 14 (14:1, three times, and 14:11) -- whom
  the text itself disambiguates from the Roman Cato of Utica in the same
  breath: "Cato, not Uticensis, but Concordiensis." `cato-elder` carries
  the global alias "Cato"; `cato-ingraham` carries none, and its
  location-scoped bind at 14:1/14:11 explicitly excludes `cato-elder`'s
  own match there first, to avoid a same-span two-entity conflict.
  `test_two_catos_split_by_location_not_alias` checks every "Cato"
  mention in the book, not a sample.
- **"Nutting"** and **"Stratton"** each name two different people the
  same way: a bare surname in Chapter 14 (a former-inhabitant family, no
  first name ever given -- "lived Nutting and Le Grosse," "some homestead
  of the Stratton family") and a full name in Chapter 15 (Sam Nutting the
  bear-hunter, owner of the fox-hound Burgoyne; Hezekiah Stratton, a
  French-war sergeant, quoted from an old trader's 1743 ledger) -- each
  followed, later in the same Chapter 15 sentence, by a bare backward
  reference to the individual just named, which would otherwise collide
  with the Chapter 14 family's bare surname. Both resolve identically:
  the Chapter 15 individual carries the full-name global alias only; the
  Chapter 14 family carries no global alias and is bound only by
  location-scoped match; the Chapter 15 individual's bare backward
  reference is bound by a second location-scoped match covering all of
  15:10 (the redundant match inside the full-name phrase is silently
  dropped as a contained shorter span). `test_nutting_and_stratton_
  split_by_location_not_alias` checks both.
- **"Adam"** is a clean split needing no location scoping at all: the
  biblical Adam (six bare mentions) and Adam Smith the economist (one
  mention, always with "Smith," 1:79) resolve via longest-span-first, the
  same pattern Meditations uses for Fabius/Fabius Catulinus.
  `test_adam_resolves_by_longest_span` checks it.
- **"Say"** is not a namesake collision but a common-word one: Jean-
  Baptiste Say, the economist named once alongside Adam Smith and
  Ricardo (1:79, in the same sentence as the Adam/Adam Smith collision),
  shares his surname with the ordinary English verb "say," which the
  text also capitalizes at two sentence-openings ("Say, some hollow
  tree," 12:1; "Say what you have to say," 18:16). `say-economist`
  carries no global alias at all and is bound only by a location-scoped
  match at 1:79, so the two unrelated capitalized "Say"s are never
  touched. `test_say_bound_only_at_economist_location` checks all three
  locations.

**2. Person or not.** Watched carefully for the "cities/features named
after founders" caution, and resolved the opposite way from the usual
warning: **Flint**, the farmer Thoreau spends an entire paragraph
denouncing for having his name attached to Flint's Pond (9:29), is never
actually named by his own bare surname anywhere in that paragraph or
anywhere else in the book -- the whole critique is conducted through the
possessive place-name "Flint's Pond" and pronouns ("the unclean and
stupid farmer... his name... his fingers"), plus a pun on "skin-flint"
that is a different word, not a name-reference. With no clean,
distinguishable person-mention of "Flint" apart from the place-name he is
attached to, no card is authored for him -- the closest thing to a case
the queue's own warning describes, resolved by leaving it unbound rather
than assuming the place-name usage names the man. **"The Merlin"** (17:25)
is the common name of a small falcon species (Falco columbarius), not the
wizard; excluded as a bird, not a person. Excluded as non-persons
throughout: generic ethnic and demonym collectives (Irishmen, Yankees,
Algonquins, the Puri Indians, the Mucclasse Indians), the cenobites (a
generic monastic-lifestyle term, not a specific body), the Jesuits
(mentioned once, generically, not as a specific organized collective the
text develops), invented placeholder names Thoreau uses for satire or
example rather than real people (Zebulon and Sephronia, the tale of "The
Skip of the Tip-Toe-Hop," "Squire Make-a-stir," "John Smith, Cuttingsville,
Vermont" as a generic shipping-label addressee, "Jonathan" as the stock
personification of the American, "a young Patrick" as a stock ethnic-type
name for an Irish laborer), and business names (Harper & Brothers, Redding
& Co., Dobson & Sons).

**3. Scriptural and mythological references.** Bound to confirm identity
without importing the whole surrounding story: the pagan pantheon
(Jupiter, Ceres, Plutus, Saturn, Minerva, Juno, Hebe, Hygeia, Æsculapius,
Vulcan, Terminus, Atropos, Brahma, Vishnu, Indra, Thor) kept as
`cultural-figure`, distinct from the non-divine heroic/legendary figures
kept as `literary-figure` (Ulysses, Achilles, Patroclus, Theseus, Hercules
-- a demigod, kept with the gods -- Antæus, the Sirens, Orpheus, Robin
Hood, Actæon, Robin Goodfellow, Reynard, William Tell, Old Mortality).
Biblical Adam and Eve are bound as `religious-figure`, as are Zoroaster,
Jesus Christ, and Damodara (an epithet of Krishna). "Atropos" is printed
italicized with markdown-style underscores ("_Atropos_"), which the
ordinary word-boundary-safe alias regex cannot match (underscore is a
`\w` character, so both the lookbehind and lookahead see a word
character, not a boundary); a dedicated custom-bind rule matches the
underscored form directly and binds only the inner word, so the mention
text reads "Atropos," not "_Atropos_."
`test_atropos_italic_underscores_bind_cleanly` checks this.

**4. Ambiguous or generic references.** Left deliberately unbound: the
two recurring Chapter 14 visitors real-world scholarship identifies as
Ellery Channing and Bronson Alcott, who are described at length (a poet
"actuated by pure love"; a philosopher to whom "Connecticut gave him to
the world," who "peddled first her wares, afterwards... his brains") but
never given a proper name in the text itself -- the same standard that
excludes Marcus's unnamed father in Meditations. The famous "Canadian
woodchopper" of Chapter 6 (real-world identity: Alek Therien) is a
sharper case still: Thoreau explicitly announces the omission --
"he had so suitable and poetic a name that I am sorry I cannot print it
here" -- making this the clearest possible instance of a deliberately
unbound reference anywhere in this Lane A queue so far. Also unbound:
Flint (see check 2); "the Moore of Moore Hill" (9:23), a punning,
hypothetical local champion (playing on "the Moor of Venice") who is
never said to do anything and may name no real individual at all; "a
Weston Squire" (15:9), unnamed by proper name; the unnamed old fisherman,
old settler, and "elderly dame" of Chapters 5, 9, and 16, each described
at length but never named; and "the philosopher" Thoreau quotes at 18:17
without naming him (the words are Confucius's, but the text itself
supplies no name at that exact point, so no card is invented there).

**5. Spot-read the bindings.** I spot-read more than ten mentions per
edition at random (`random.seed(11)`, 12 per edition, 24 total) after
building the package, cross-checking each against the paragraph context
read while authoring; every one resolved to the person expected --
`davis-hosmer` at 12:11, `cato-ingraham` at 14:1 ("Cato, not Uticensis"),
`brahma` at 18:15, `aeneas-sylvius` and `nicholas-pistoriensis` at 12:13,
`cato-elder` at 13:5, `brister-freeman` at 14:3, `toscar` at 5:4, `jupiter`
at 4:11, `adam-biblical` at 18:20, `saturn` at 13:6, `hugh-quoil` at
14:10, `wyman-elder` at 14:9, `croesus` at 18:17, `memnon` at 2:16,
`buttrick` and `sir-kenelm-digby` at 12:11 and 7:10, `homer` at 3:5 and
2:16, `goody-blake` at 13:13, `hezekiah-stratton` at 15:10, and `ricardo`
at 1:79. I additionally read every location cited in checks 1-4 above in
full context in both editions while authoring, given how namesake-heavy
Chapters 14 and 15 (the former-inhabitants chapters) and Chapter 1 (the
economists) demanded it.

**6. Both editions independently.** I read all eighteen chapters in full,
paragraph by paragraph, in both editions before authoring, and built the
candidate list from a systematic capitalized-word frequency sweep of both
texts (`\b([A-Z][a-z']+(?:[-'][A-Z][a-z']+)*)\b`, minus a stopword set),
the same method used for Meditations and Confessions -- there is no
`walden-threads.json` for this book to use even as a lead. The two
editions render every name identically: `omittedEntities: ["thoreau"]` on
both sides, and mention counts match exactly, 206 to 206. Unlike
Aristotle's Politics, this translation shows no footnote/page-header
apparatus bleeding into the running prose on either side. One
edition-specific spelling variant surfaced during authoring and needed
both forms aliased on the same entity: `chaucers-nun`'s "Chaucer's nun"
uses a typographic apostrophe (’) in original-en and a straight apostrophe
(') in modern-en; both are aliased so the entity binds in both editions
rather than only one. `test_both_editions_agree_on_mention_count` checks
the overall agreement explicitly.

## Source review

Both source files have 18 chapters and 502 paragraphs, with identical
per-chapter paragraph counts (136, 26, 12, 27, 19, 27, 21, 6, 35, 17, 18,
18, 22, 26, 15, 23, 30, 24) on both sides. No source edits. No
boilerplate, footnotes, or bracketed apparatus differences were found
between editions beyond the apostrophe-style variant documented in check
6 above.

## Commands

```sh
python3 books/characters/walden/author_content.py
python3 books/characters/build_walden.py
python3 books/characters/build_walden.py --check
python3 -m unittest books.characters.test_walden -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Twelve tests: saved-package freshness; exact UTF-16 spans and source
hashes; no invented outcomes (121 of 122 entries bound, one omission --
Thoreau -- on both sides, one snapshot each); Thoreau confirmed never
bound under his own name; no Major entries; the nine Supporting entries
being exactly the real local cast and the two dialogue-tag roles; the two
Catos splitting cleanly by location, not a sample; Nutting and Stratton
each splitting the same way; Adam and Adam Smith resolving by
longest-span-first; Say bound only at its one economist location, never
at either sentence-opening verb; the italic-underscore "Atropos" binding
cleanly to a plain-text mention; and both editions agreeing exactly on
mention count and omission.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
