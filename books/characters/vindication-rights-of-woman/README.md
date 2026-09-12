# A Vindication of the Rights of Woman character package

All 15 chapters (edition numbering: 1 Dedication, 2 Introduction, 3-15
the book's own "Chapter 1" through "Chapter 13") in both English
editions -- 71 recognition cards in each, zero omitted, 183 exact
mentions in each edition, 778 paragraphs per edition, identical
structure in both.

Read `cards.md` for category and copy together.

This is a polemical treatise addressed to a named dedicatee (M.
Talleyrand-Perigord, then Bishop of Autun) and argued almost entirely in
the author's own first-person voice. Nobody experiences events in it;
nobody speaks in a staged dialogue except where the text quotes another
author's own fictional dialogue at length (Rousseau's Emile). Per
editorial policy's guidance for treatises -- "provide useful
people/reference identification without inventing a fictional cast or
calling the author a protagonist" and "cited thinkers normally remain
references" -- **every one of the 71 entries here is Reference.** There
is no Central and no Major entry. Rousseau receives by far the most
sustained engagement of anyone in the book (chapter 7/"Chapter 5"
section 5.1, roughly 60 paragraphs, quotes and rebuts Emile point by
point, and he recurs constantly elsewhere), but he is still, in the end,
a cited author being argued with, not a participant in anything the book
itself dramatizes -- so he stays Reference, per policy's explicit
instruction not to except heavily-cited thinkers from that rule. The
author herself is never named in the running text (the Dedication is
signed only "M. W.") and gets no entry at all.

The cast is a large flat list of real cited persons, named biblical and
mythological figures, and fictional characters from the books under
discussion:

- Contemporary conduct-book writers who are the book's actual
  argumentative targets: Rousseau, Dr. Gregory, Dr. Fordyce, Lord
  Chesterfield.
- Women writers praised or criticized by name: Catharine Macaulay, the
  Baroness de Stael, Madame Genlis, Mrs. Chapone, Mrs. Piozzi, Mrs.
  Barbauld.
- A long tail of one-off citations: Dr. Johnson, Mr. Locke, Dr.
  Priestley, Lord Bacon, Dryden, Cowper, Cowley, Dean Swift, Shakespeare,
  Richardson, Leibnitz, Mr. Hume, Knox, Boswell, Milton, Pope, Sir Isaac
  Newton, General Washington, Fabricius, Cato, Tully (Cicero), Butler,
  Forster, Swedenborg, Hervey, Dr. Price, Louis XIV, Dr. Smith, Theresa
  (Rousseau's Therese Levasseur), the Empress of Russia, Madame d'Eon,
  Sappho, Mr. Day, and Cervantes.
- Named biblical and religious figures: Jesus Christ, Moses, Peter,
  Solomon, Adam, Eve, Satan, Mahomet.
- Fictional characters from the books under discussion: Rousseau's
  Emilius, Sophia, Eloisa (Julie), and St. Preux; Richardson's Clarissa
  and Lovelace; Shakespeare's Hamlet and Macbeth; Cervantes's Quixote;
  Fenelon's Telemachus; Inkle (from "Inkle and Yarico"); and a single
  quoted line from a character called Ranger.
- A real historical woman sharing a spelling collision with a fictional
  one: Heloise.
- Named mythological figures invoked idiomatically: Diana, Argus,
  Pallas, Hymen, Cerberus.

## Editorial checks

**1. Namesakes.** One genuine collision, and it is the book's sharpest
editorial hazard: **"Eloisa" names two different women.**

- At (4, 51), original-en and modern-en alike: "Rousseau make[s] the
  mistress of his soul, Eloisa, love St. Preux" while her life is
  fading -- unambiguously Julie, the heroine of Rousseau's novel La
  Nouvelle Heloise, given the adjoining names "Rousseau" and "St.
  Preux" (St. Preux is her lover only in that novel).
- At (6, 85), the *identical spelling*, "Eloisa," appears in a
  parenthetical list of real historical women "who, from having
  received a masculine education, have acquired courage and
  resolution" -- Sappho, [Eloisa], Mrs. Macaulay, the Empress of Russia,
  Madame d'Eon. Every other name in that list is a real, historically
  documented woman; a fictional heroine praised for her own "masculine
  education" and real-world "courage and resolution" does not fit the
  sentence's own logic. This can only be the real medieval Heloise,
  Peter Abelard's pupil, correspondent, and eventual wife, famed for her
  learning.
- At (9, 21), a third, differently spelled occurrence, "Heloisa" (with
  an H), describes "a woman [who] gives up all the world, deliberately,
  for love" -- the real Heloise's own most famous words on record (she
  said she would rather be Abelard's mistress than the world's empress),
  confirming this is the historical woman again, not Rousseau's Julie.

Because the exact string "Eloisa" is shared by both referents at
different locations, **neither entity carries a global alias for it.**
`eloisa-julie` and `heloise-historical` are each bound only by a custom,
location-scoped `bind()` match (`build_vindication_rights_of_woman.py`'s
`ELOISA_LOCATIONS` dict) -- the identical pattern Walden used for its
own Cato collision. `heloise-historical` additionally carries a plain
global alias for the unambiguous spelling "Heloisa," which occurs only
once in the book.

No other bare word in this book names two different people. (Two
different Catos are a documented hazard in other 18th-century essay
collections in this queue, but this book names only one: Cato the Elder,
at (15, 60), discussing his hostility to Carthage.)

**2. Person or not.** Two real people are named only by title in
bindable paragraph text, never by their own personal names -- both
resolved as genuine (if title-only) person-mentions, not left unbound,
because the identity is unambiguous from context:

- **Talleyrand**, the book's own dedicatee, is named in full only in the
  chapter-1 TITLE metadata ("Dedication. To M. Talleyrand Perigord, Late
  Bishop of Autun"), which is not bindable paragraph text, and the
  Dedication's body addresses him throughout only as "Sir." But the
  running prose cites his own recent pamphlet on national education
  twice, both times by his ecclesiastic title alone: "a very sensible
  pamphlet written by the late bishop of Autun" (14, 42) and,
  parenthetically, "(The Bishop of Autun)" (14, 54). Talleyrand did
  publish a well-known 1791 report on public education matching this
  description, and the cross-reference to the book's own dedicatee
  removes any doubt. Bound via alias `bishop of Autun|Bishop of Autun`
  (both case forms occur).
- **Catherine the Great**, Empress of Russia at the time of writing
  (1792), is named once, only by title, in the same list of exceptional
  women discussed above: "the Empress of Russia" (6, 85). Bound via the
  full phrase, not the bare place name "Russia" (which recurs once
  elsewhere, at (15, 81), in an unrelated aside about opening a "trade
  with Russia for whips" that must not be swept into her mentions --
  confirmed by test).

Every other candidate proper noun that could be mistaken for a
person-or-place ambiguity checked out cleanly: "Isles of the South Sea"
(6, 67) is Forster's book title, not a person; the "Java tree" (10, 17)
is a poison-tree metaphor, not a place-as-person; "Whitehall" (11, 21)
is the London street, not a person.

**3. Scriptural and mythological references.** Confirmed each without
importing the whole story:

- **Jesus Christ** -- named directly three times: as an example of true
  modesty alongside Moses (humble) and Peter (vain) at (9, 2); for his
  healing miracles and "be whole, and sin no more" at (15, 18); and for
  his teaching that his true followers are known by their works, not by
  invoking his name, at (15, 19).
- **Moses** -- (7, 5) his "poetical cosmogony" (Genesis) and the Fall;
  (9, 2) the modesty/humility/vanity triad above.
- **Peter** -- (9, 2) only, the same triad.
- **Solomon** -- (4, 39) only, via "a wiser than Solomon hath said" (an
  allusion to Christ's own teaching, echoing Matthew 12:42, that the
  heart rather than ceremony must be made clean).
- **Adam** -- (7, 43) "the male line from Adam downwards," and (4, 5)
  Milton's Paradise Lost, quoted directly, giving Adam his own speech.
- **Eve** -- (4, 5) the same Miltonic passage, quoting Eve's own words
  of devotion to Adam.
- **Satan** -- (5, 3) only, via Milton: "did Milton tremble when he led
  Satan far from the confines of his dreary prison" -- Milton's literary
  Satan, not an independent theological digression.
- **Mahomet** -- (4, 60) only, via "the vulgar tale of Mahomet's coffin"
  (the legend of his coffin suspended in mid-air), used purely as a
  simile; no further claim about Islam is imported.
- **Diana, Argus, Pallas, Hymen, Cerberus** -- each a single idiomatic
  invocation (the moon-goddess of chastity; "lull their Argus to sleep";
  "like another Pallas" throwing away her pen; "Hymen banishes
  modesty"; "silence Cerberus"), bound as the specific mythological
  figure named, not expanded into their full myths.

No deliberately-unbound scriptural/mythological figure was found this
book couldn't otherwise resolve -- see check 4 for the generic/group
cases that were deliberately left unbound instead.

**4. Ambiguous or generic references.** Deliberately left unbound,
because the text uses them as a type or a demonym rather than naming a
specific individual:

- **"these Rebekahs"** (12, 3) -- a plural, generic use of the biblical
  Rebekah's name to characterize a type of mother who sacrifices
  justice for her own children's sake, not a mention of the historical
  Rebekah herself.
- **"Pharisees"** (10, 12), **"Essenes,"** and **"the Jews"** (9, 29) --
  group/demonym references, not individuals.
- **"Spartans"** (3, 16) and **"the Spartan"** (4, 22) -- likewise a
  demonym, not a named individual.
- **"Sybarites"** (5, 20) and **"Turkish bashaws"** (5, 6) -- demonyms
  used as a byword for luxury/tyranny.
- **"Yahoos"** and **"Houyhnhnm"** (7, 158) -- Swift's fictional
  non-human races from Gulliver's Travels, referenced as races/types,
  not individual named characters.
- **"Pantaloon"** (7, 156) -- a generic commedia dell'arte stock
  character type ("Pantaloon's tricks"), not a specific individual, the
  same category as Walden's "the learned pig."

One bare epithet was resolved rather than left unbound, because the
context made the referent unmistakable: "the citizen of Geneva" (3, 17)
is Rousseau's own well-known self-description (he was born in Geneva),
appearing in a paragraph that has been discussing Rousseau by name for
several sentences running -- bound to `rousseau`, not treated as a
separate anonymous reference.

**5. Spot-read the bindings.** Twelve mentions per edition were sampled
at random (`random.seed(11)`) and each checked against its full
paragraph in context; every one resolved correctly, including the
higher-risk cases: `thomas-day` at (5, 9) (Mr. Day's Sandford and
Merton, not a calendar reference), `adam-smith` at (10, 16) (the
parenthetical "(Smith.)" citing the Theory of Moral Sentiments), and
several `rousseau` mentions spread across chapters 5, 7, 9, 10, and 11,
all genuine references to the man rather than to "Rousseau's" quoted
fictional characters nearby. All 183 mentions in original-en and all 183
in modern-en were additionally reviewed by direct read of their source
paragraph during authoring (not merely sampled), since the book's
argumentative, quotation-heavy prose makes every mention worth checking
individually.

**6. Both editions independently.** Both editions are byte-identical in
paragraph and chapter structure (778 paragraphs, 15 chapters, same
chapter titles) and produce exactly the same 71/71 entities and 183/183
mentions -- but two edition-specific phrasing differences had to be
aliased explicitly rather than assumed to match:

- **Louis XIV's name**: original-en's topic sentence at (6, 14) spells
  it "Lewis the XIVth"; modern-en modernizes it to "Louis XIV." Both
  editions use the older spelling "Lewis XIV" in the (6, 22) block
  quotation from Adam Smith, since that passage is quoted verbatim in
  both. Aliased `Lewis|Louis` to cover both spellings.
- **Mahomet's coffin's apostrophe**: original-en uses a straight
  apostrophe ("Mahomet's coffin"), modern-en a typographic one
  ("Mahomet's coffin", U+2019) -- the same apostrophe-style mismatch
  Walden's "Chaucer's nun" had. Aliased both forms.

No divergence was found in which edition names or omits a person
outright (unlike The Imitation of Christ's Holy Spirit case): every one
of the 71 entities binds in both editions with the same mention count,
183 and 183.

## Source defects

None found. Both editions parse cleanly; paragraph counts match exactly
(778 each); no textual apparatus, scene-crosswalk, or transcriber-note
paragraphs to strip.

## Commands

```
cd books/characters
python3 vindication-rights-of-woman/author_content.py   # regenerate editorial.json
python3 build_vindication_rights_of_woman.py             # regenerate characters.v1.json, print report
python3 build_vindication_rights_of_woman.py --check      # verify saved output is current
python3 -m unittest test_vindication_rights_of_woman -v
python3 -m unittest discover -s . -p 'test_*.py'          # full repo suite
```

## Release checks

- [x] Both English editions read in full (all 15 chapters, 778
  paragraphs, original-en and modern-en).
- [x] All six editorial checks performed and documented above.
- [x] `build_vindication_rights_of_woman.py --check` clean.
- [x] `test_vindication_rights_of_woman.py`: 10/10 passing.
- [x] Full repo suite (`python3 -m unittest discover -s . -p
  'test_*.py'`) run; see commit message for the result obtained at
  authoring time, given this session's shared-suite runtime has grown
  unpredictable as concurrent Lane A/B batches land in the same test
  tree.
- [ ] `library-inventory.json` regenerated (next step).
- [ ] Committed and pushed with the inventory update.
- [ ] `RELEASE-QUEUE.md` entry added.
