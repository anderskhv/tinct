# Richard III character package

All twenty-five scenes in both actual English editions: 94 recognition cards in each, with no omitted entities on either side. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Richard of Gloucester is Central; the court, the Queen's kindred, Richard's agents and Richmond are Major; the rest of the speaking and stage cast and the twelve named groups are Supporting; the dead of both houses and the figures named only in report are Reference.

Ordinary identity is supplied at first mention: Richard is the youngest of the three York brothers, Clarence the middle one, the Duchess their mother, Queen Elizabeth King Edward's wife, Anne the widow of Henry the Sixth's son. Later cards stay short. The crown unlocks after 15:52, where Buckingham proclaims him; Anne's ring after 2:91 and her coronation after 16:19; Buckingham's break with Richard after 17:76; Queen Elizabeth's widowhood after 6:17; Stanley's bind after 23:32, where his son is taken as a hostage. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end. Richard's first card does not call him King.

## The repeated names

No play in the canon repeats its names harder, and **none of the five is bound by a global alias**. Every occurrence of Edward, Richard, York, George and Plantagenet is assigned from a table keyed by paragraph and by position within the paragraph, reviewed line by line against the speech it stands in. A test walks both source files and asserts that *no* occurrence of any of the five is left unbound, so a paragraph missing from a table fails the build rather than passing silently.

**Five Edwards.** King Edward the Fourth; Prince Edward, his elder son; Edward, Prince of Wales, the son of Henry the Sixth and Lady Anne's husband; Edward Plantagenet, Clarence's son, called Ned; and Sir Edward Courtney of Devonshire. Some speeches hold three or four of them. At 6:31 Buckingham says "Drown desperate sorrow in dead Edward's grave, and plant your joys in living Edward's throne": the first is the King, the second his heir. At 15:39 Buckingham's proof of bastardy runs son, father, son. At 19:27 Margaret runs through four in five lines. Each is pinned by a test.

**Four Richards.** Richard of Gloucester holds all but five: the boy Duke of York at 9:41 and 19:23, the brothers' father at 19:24, King Richard the Second at Pomfret at 11:5, and Sir Richard Ratcliffe at 11:0 and 11:1. At 19:23 Margaret's "Thou hadst a Richard, till a Richard killed him" is the nephew and then the uncle, in that order.

**Four Yorks.** The boy duke, the Duchess, the brothers' father, the Archbishop — and the royal house itself, which has its own group entry for "the wars of York and Lancaster", "what heir of York", "the wronged heirs of York" and the opening "this son of York". The entry direction at 8:0 names three different people in one line, and a test checks that its three "York" spans go to three different entries.

**Three Georges.** Clarence; George Stanley, held hostage; and the Garter badge of Saint George that Richard swears by at 19:133 and Queen Elizabeth throws back at him at 19:136. "Saint George" as a battle cry is the same entry as the badge.

**Plantagenet** is Richard naming himself (2:57, 15:31), the Lancastrian prince (4:80), Clarence's daughter (16:1), Prince Edward (19:8) and Clarence's son (19:44). The plural at 2:43 is the family and has a group entry.

**Two arguable lines are recorded rather than smoothed over.** Margaret's aside at 19:10–19:11, "Plantagenet doth quit Plantagenet; Edward for Edward pays a dying debt", is bound as the York prince first and her own Lancastrian son second, on the reading that the York boy pays the debt owed for hers. The line will bear the other order; the choice is stated here rather than presented as settled.

## Other binding review

- **"My Lady Grey" is Queen Elizabeth**, under the name she had by her first husband, not either of the Lord Greys at court. At the same line, 1:9, Rivers is named by his own name, Antony Woodville. Both are bound and a test asserts that no Grey is bound at 1:9.
- Lord Stanley and the Earl of Derby are one man, bound from both titles; his son George Stanley is separate.
- Humphrey Hower (19:61), Jockey of Norfolk and Dickon (23:154–155) are bound with kind `unresolved-name`. Humphrey Hower is a name Richard invents to put his mother off, and his card says no such man exists in the play; Jockey and Dickon are the rhyme's names for Norfolk and Richard themselves.
- The Bishop of Ely and John Morton are one man, bound from both.
- Pomfret, Chertsey, Crosby Place, Baynard's Castle, Ludlow, Brecknock, Salisbury, Exeter, Devonshire, Kent and Yorkshire are places and are not bound as people.
- Generic titles are not bound. Bare "King", "Queen", "Prince" and "Duke" are left alone: the play uses each for several people, and no context rule carries that safely.

## Source review

Both source files have 25 aligned scenes and 1,420 paragraphs. No source edits. Two differences are recorded, and neither blocks safe enablement:

1. **The modern uppercases names inside stage directions where the original keeps title case.** Because the tables index occurrences by position, this matters: a title-case-only scan would count differently in the two files and shift every index after it. The builder therefore matches both forms of each of the five names, which makes the per-paragraph counts identical across the two editions — verified everywhere except one place, below. The same rewriting turns the original's `Halberds`, `Citizens`, `Attendants` and `Bishops` into `halberdiers`, `CITIZENS`, `attendants` and `BISHOPS`; each form is carried as an alias so neither edition omits the group.
2. **One stage direction names the ghost twice in the modern.** At 23:51 the original reads "Enter the Ghost of young Prince Edward, son to Harry the Sixth" and the modern "[Enter the GHOST OF EDWARD, young Prince Edward, son to Henry VI.]" The table allows for both. The same line is the play's only "Harry" for "Henry", and both forms are aliases on Henry the Sixth.

The local complete text supplies the card evidence. [Folger's complete play](https://www.folger.edu/explore/shakespeares-works/richard-iii/read/) and its [editorial cast list](https://www.folger.edu/explore/shakespeares-works/richard-iii/read/characterList/) were consulted for the speaking-role distinctions, for Rivers as Antony Woodville, for Stanley as Earl of Derby, and for the identity of each Edward in the disputed speeches. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_richard_iii.py --check` and `python3 -m unittest discover -s books/characters -p test_richard_iii.py`. Nine tests cover source hashes, exact UTF-16 spans, the completeness of all five name tables across both files, the five Edwards, the four Richards and four Yorks, the three Georges and the Plantagenets, Lady Grey as the Queen, the six gates and the three invented names, and every paragraph-end snapshot. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.
