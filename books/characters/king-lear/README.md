# King Lear character package

All twenty-six scenes in both actual English editions: 67 recognition cards in each. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Lear is Central; the family and principal companions are Major; local speakers are Supporting; named gods, fiends and quoted song figures are Reference. The dogs Lear imagines remain explicitly imagined animals.

Ordinary family relationships, occupations and titles are supplied at first mention. Later cards stay short. Kent’s banishment unlocks after 1:58, his disguise after 4:0 and its name Caius after 26:128. Edgar’s Poor Tom disguise unlocks after 8:1, peasant appearance after 22:0, public self-identification after 26:75. Edmund’s earldom unlocks after 14:7. Cordelia’s selection as France’s wife unlocks after 1:82; wife/queen wording after 19:0. Regan’s widowhood unlocks after the death report at 18:23; Gloucester’s blindness after 16:61. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end. No late deaths or outcomes are imported into early identities.

## Binding review

- Gloucester denotes Edmund at 14:7, 16:5, 18:8, 18:30, 22:101, 26:31, 26:47, 26:58 and 26:64. Other name/cue uses denote the father. The forged letter’s Edgar signature still denotes its purported signer, not the actual forger.
- Edgar first appears implicitly as the lawful son in 1:8. Edmund’s mother is introduced in 1:6; Edgar’s mother in 2:1. No invented names.
- Tom o’ Bedlam at 2:38 is a stock beggar, not Edgar in disguise. Tom from scene 8 onward and Turlygod denote Edgar. Lear’s learned Theban and good Athenian denote Edgar, not new classical references.
- France and Burgundy are context-bound: vineyards/milk at 1:29, prospective Duchess of Burgundy at 1:78, countries at 1:82, travel to France, and Marshal of France are excluded. France departing in 2:3 is the king. No place-only France card.
- The scene-4 Knight is distinct from the gentleman attending Lear in scenes 5/9, the gentleman Kent encounters on the heath in scene 10, Cordelia’s gentleman in scenes 19/22/23, and the final messenger with the bloody knife. Scene-local descriptions avoid asserting unsupported cross-scene biography. The two MESSENGER roles are separate.
- Cordelia’s search officer is distinct from the British officer and Edmund’s captain. The herald and three Cornwall servants remain distinct. Unspecified stage attendants are grouped rather than assigned invented personal identities.
- Pillicock’s second occurrence denotes the hill and is excluded. Dolphin in the original and Dauphin in the modern are the same song address, not a new French prince. Swithold/Saint Withold are one charm figure. No identification beyond what the fragments justify. Modo and Mahu retain separate named entries even though Edgar also uses them as names for the prince of darkness.
- Goneril named in the mock trial refers to the real daughter imagined on trial, not another person. Generic fools, gods’ titles, stars and constellations are not converted into invented human cast. Nature is bound only at Edmund’s goddess invocation. The final “my poor fool” does not receive a literal court-jester binding.

## Source review

Both source files have 26 aligned scenes and 1,371 paragraphs. No source edits. The modern source has inherited odd wording at 13:34 (“out-pampered” for “out-paramour’d”) and spells Dolphin as Dauphin; cards do not assert a historical dauphin. Restore/correct source bytes only with fresh binding review and rebuilding.

The local complete text supplies the card evidence. [Folger’s complete play](https://www.folger.edu/explore/shakespeares-works/king-lear/read/) and [editorial cast list](https://www.folger.edu/explore/shakespeares-works/king-lear/read/characterList/) were consulted for family roles, disguise chronology and speaking-role distinctions. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_king_lear.py --check` and `python3 -m unittest discover -s books/characters -p test_king_lear.py`. Nine tests cover source hashes, exact UTF-16 spans, title succession, ordinary identity and disguise gates, Tom namesakes, places, officers, song variants and all paragraph-end snapshots. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.
