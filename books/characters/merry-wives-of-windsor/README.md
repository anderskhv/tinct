# The Merry Wives of Windsor character package

All twenty-three scenes in both actual English editions: 47 recognition cards in each, with no omitted entities on either side. The cards.md review copy shows Central, Major, Supporting or Reference beside every entry. Falstaff and the two wives are Central; the two husbands, the parson, Mistress Quickly, the three suitors, the Host, Pistol, Simple and Anne are Major; the rest of the speaking and stage cast and the two groups are Supporting; the assumed names and the legendary and classical figures are Reference.

Ordinary identity is supplied at first mention: Mistress Page is Master Page's wife and Anne's mother, Slender is Shallow's cousin, Simple is Slender's servant, Rugby is Doctor Caius's. Later cards stay short and there are only four. Ford's alias unlocks after 6:60, where he takes the name Brook; Falstaff's escape in the gown after 19:7; Anne's marriage to Fenton after 23:80. Coordinates are reading-unit number and zero-based paragraph, with gates at paragraph end.

## Four Pages and two Fords

**Page** is Master Page, Mistress Page, Anne Page and William Page. **Ford** is Master Ford and Mistress Ford. Neither surname is bound by a plain alias. Longer spans are taken first — "Mistress Page", "Master Page", "Anne Page", "Mistress Ford", "Master Ford", "Master Thomas Page" — and every remaining bare occurrence falls to the householder of that name, with a short reviewed exception list. The exceptions are:

- **1:18, 13:48 and 23:63**, where a printed line number in the original stands between the given name and the surname, so the surname is left standing alone in the text: "there is Anne 40 Page", "Farewell, Mistress 75 Page", "to marry Mistress Anne 175 Page". In each case the orphaned surname is bound to the person it belongs to. The modern setting prints all three whole, and a test checks that both editions reach the same person either way.
- **5:15 and 14:3**, where Mistress Ford is addressed by her own surname: "Sir Alice Ford!" and "gossip Ford!"
- **5:17**, "the name of Page and Ford differs". Mistress Page is comparing the addresses on the two letters. Whether that means the two wives or their two husbands is not settled by the text, so neither surname is bound there and the paragraph carries only her own cue. This is a deliberate omission, recorded here rather than guessed at.

The householders' given names are bound too: George for Master Page and Frank for Master Ford, each used only by his wife.

**Two women called Alice.** Ford's wife, and Alice Shortcake, the neighbour Slender lent his Book of Riddles to. "Alice Shortcake" is the longer span and wins; the other Alice is Mistress Ford.

## Other binding review

- **Brook is Ford.** The reader watches him take the name at 6:60, so every "Brook" in the play binds to him.
- **Mother Prat and the witch of Brentford are not people.** They are what Mistress Page and Ford call the gown while Falstaff is inside it, and both are bound with kind `unresolved-name`. The fat woman of Brentford whose gown it is — Mistress Ford's maid's aunt — has her own Reference entry, bound where she is described.
- Sir Hugh Evans is bound from both his title and his surname; Doctor Caius, the Host of the Garter and Mistress Quickly likewise.
- Windsor, Eton, Brentford, Datchet Mead, Frogmore, the Garter and Herne's oak are places and are not bound as people; Herne the Hunter himself is.
- Generic titles are not bound. Bare "the doctor", "the parson", "mine host" as an office and "my wife" are left alone.

## Source review

Both source files have 23 aligned scenes and 1,155 paragraphs, and neither omits an entity the other has. No source edits. Three differences are recorded, none blocking safe enablement:

1. **The original is a Gutenberg-style setting.** Speech cues are abbreviated and wrapped in italic underscores (`_Mrs Ford._`, `_Slen._`, `_Sec. Serv._`), and stage names are italicised. Underscore is a word character, so the shared exact-alias matcher in `reviewed_aliases` cannot see either end of those names; this book therefore binds with letter/digit boundaries in its own builder and expands the original's twenty-three abbreviated cues. The modern setting spells every cue out in capitals and carries no abbreviations, so `reviewed-cue` mentions exist in the original only.
2. **Printed line numbers sit inside the prose of the original**, and in three places they fall between a given name and a surname, as listed above. They were deliberately **not** stripped: stripping them would move every UTF-16 offset in the file. The binding handles the split instead.
3. **Spelling.** The original prints `Actæon` with the ligature where the modern prints `Actaeon`. Both are aliases on the one entry.

The local complete text supplies the card evidence. [Folger's complete play](https://www.folger.edu/explore/shakespeares-works/the-merry-wives-of-windsor/read/) and its [editorial cast list](https://www.folger.edu/explore/shakespeares-works/the-merry-wives-of-windsor/read/characterList/) were consulted for the speaking-role distinctions, for the householders' given names, and for Alice Shortcake as a separate woman. Folger is a comparison edition, not the offset source.

Run `python3 books/characters/build_merry_wives_of_windsor.py --check` and `python3 -m unittest discover -s books/characters -p test_merry_wives_of_windsor.py`. Eight tests cover source hashes, exact UTF-16 spans, the four Pages and two Fords, the deliberately unbound surnames at 5:17, the assumed names, the original-only cues and the split names, the four gates, and every paragraph-end snapshot. Release owner must register both English editions, version the asset, run app gates and production verification. Validated content is not live coverage.
