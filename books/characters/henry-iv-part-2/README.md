# Henry IV Part 2 character package

All nineteen scenes in both actual English editions, including the Induction and the Epilogue: 121 recognition cards in each, with no omitted entities on either side. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Falstaff and Prince Henry are Central; the King, the court, the rebel lords and the Eastcheap and Gloucestershire company are Major; the rest of the speaking and stage cast and the six named groups are Supporting; the men and women named only in Shallow's and the Hostess's talk, and the classical, biblical and balladic allusions, are Reference.

Ordinary identity is supplied at first mention: Falstaff is an old knight of the Prince's company, the Hostess keeps the Boar's Head, Shallow is a Gloucestershire justice, Prince John is the King's second son. Later cards stay short and there are only four. The crown passes to the Prince after 14:55, the King's Jerusalem line; Falstaff's banishment unlocks after 19:52; Prince John's taking of the rebels at Gaultree after 11:37; Northumberland's flight to Scotland after 6:8, where the two women talk him out of the war. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end.

## Four names, and none of them bound globally

**Two Bardolphs.** Lord Bardolph is a rebel nobleman; Bardolph is the red-faced corporal of Falstaff's following. Both appear in the play and both are called Bardolph in dialogue and in stage directions. The split is by scene: the lord speaks and is spoken of only in scenes 1 and 3, and the corporal never appears in either. A test asserts that neither man is ever bound in the other's scenes, and Lord Bardolph's card says outright that he is not the corporal.

**Two Harrys.** The Prince, called Harry Monmouth, and Hotspur, Harry Percy, dead before the play opens. The King calls himself Harry once, in the line about dying in Jerusalem at 14:55. Warwick's "the heavy issue of dead Harry" at 16:10 is the King and "the living Harry" in the same line is his son. The new king's own "Not Amurath an Amurath succeeds, but Harry Harry" at 16:25 runs new, old, old, new. Every occurrence is assigned from a table indexed by position within its paragraph.

**"Four Harry ten shillings" is a coin.** At 9:106 Bullcalf offers Bardolph four coins bearing a king's head. It is not a person and it is bound to nobody; a test asserts that no card is offered on that span.

**Five Johns.** Falstaff holds nearly all of them. The exceptions are Prince John of Lancaster, Sir John Umfrevile who turns Travers back at 1:20, Sir John Colevile who yields at Gaultree, John of Gaunt in Shallow's boasting, and Little John in the scrap of Robin Hood ballad Silence sings at 17:67, where Robin Hood and Scarlet stand beside him. The specific names are claimed first and the remainder falls to Falstaff, so a John that matched nothing specific can never quietly become one of the others.

## Other binding review

- **The original prints one KING cue for two reigns.** Henry the Fourth speaks under it through scene 14; from scene 16 the same cue belongs to his son, who is by then Henry the Fifth. The modern setting splits the cue into `HENRY IV.` and `HENRY V.` and so needs no rule. The builder assigns the original's cue by scene, and a test checks that both editions reach the King and the Prince the same number of times.
- Warwick is bound from his family name Nevil at 8:13, where the King calls him "cousin Nevil".
- Thomas Mowbray, Duke of Norfolk, whom Falstaff served as page (9:9), is the rebel Mowbray's father and has his own entry.
- Doll Tearsheet is bound from "Mistress Dorothy" as well as from Doll.
- Master Surecard (9:33) and Hiren (Pistol's sword) are bound with kind `unresolved-name`: neither is a person the play produces.
- Gaultree Forest, Eastcheap, Clement's Inn, Gray's Inn, Saint George's Field, the Dolphin chamber, Woncot, Barson and Basingstoke are places and are not bound as people. The Dolphin chamber in particular is a room at the Boar's Head, not the French Dauphin.
- Generic titles are not bound. Bare "King", "Prince", "the Lord Chief Justice" as an office and "my lord" are left alone.

## Source review

Both source files have 19 aligned scenes and 1,081 paragraphs, and neither omits an entity the other has. No source edits. Three differences are recorded, none blocking safe enablement:

1. **The KING cue is split in the modern**, as described above. This is the largest single difference between the two files and the reason the King and the Prince need a scene rule in the original.
2. **Spelling.** The original prints `Rumour` and `John a Gaunt`; the modern prints `Rumor` and `John of Gaunt`. Both forms are carried as aliases and a test asserts each appears only in its own edition.
3. **The modern uppercases names inside stage directions** where the original keeps title case, as in the other plays in this batch. Every person carries both forms.

The local complete text supplies the card evidence. [Folger's complete play](https://www.folger.edu/explore/shakespeares-works/henry-iv-part-2/read/) and its [editorial cast list](https://www.folger.edu/explore/shakespeares-works/henry-iv-part-2/read/characterList/) were consulted for the two Bardolphs, for Warwick as a Nevil, for the elder Mowbray, and for the coin at 9:106. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_henry_iv_part_2.py --check` and `python3 -m unittest discover -s books/characters -p test_henry_iv_part_2.py`. Eight tests cover source hashes, exact UTF-16 spans, the two Bardolphs by scene, the two Harrys and the coin, all five Johns, the one cue that serves two kings, the four gates and the edition spellings, and every paragraph-end snapshot. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.
