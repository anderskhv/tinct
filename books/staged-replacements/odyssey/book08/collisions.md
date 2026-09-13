# Odyssey Book 8 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**97 rows touch Book 8.**

| disposition | rows |
|---|---|
| `artifact` | 3 |
| `common-rendering` | 2 |
| `common-word` | 3 |
| `discrimination` | 3 |
| `homograph` | 1 |
| `kept` | 70 |
| `kept-elsewhere` | 1 |
| `matches-accepted` | 4 |
| `unavoidable-merge` | 3 |
| `variant` | 7 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

27 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `accomplishments` | `accomplishments` (B8-P017) | **`kept`** | every entry Book 8 contributes is Butler's own `accomplishments` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ambuscade` | `ambush` (B8-P046) | **`matches-accepted`** | `ambuscade` -> `ambush` at B08-P046 is word for word accepted B04-P044's rendering of the same Butler word. The third rendering in the row, `lying in wait there` at B04-P037, is Book 4's phrase-level recast, where `ambuscade` has no word rendering at all. |
| `appearance` | `appearance` (B8-P002), `arrive` (B8-P038) | **`homograph`** | One Butler spelling, two senses. `the appearance of Odysseus` at B08-P002 is how he looks; `the presents began to make their appearance` at B08-P038 is an idiom meaning they arrived. Two words that happen to be spelled alike, like `issue` at Book 7. |
| `approach` | `approach` (B8-P009) | **`kept`** | every entry Book 8 contributes is Butler's own `approach` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carries` | `carries` (B8-P014) | **`kept`** | every entry Book 8 contributes is Butler's own `carries` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cease` | `cease` (B8-P048) | **`kept`** | every entry Book 8 contributes is Butler's own `cease` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `couple` | `couple` (B8-P009) | **`kept`** | every entry Book 8 contributes is Butler's own `couple` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `dozen` | `dozen` (B8-P004) | **`kept`** | every entry Book 8 contributes is Butler's own `dozen` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `fleetest` | `fleetest` (B8-P024) | **`kept`** | every entry Book 8 contributes is Butler's own `fleetest` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `follow` | `follows all the more` (B8-P039) | **`kept-elsewhere`** | Book 8 supplies the row's only rendering (`follows all the more`); every other entry is Butler's own `follow` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `follow` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `girded` | `girded` (B8-P038) | **`kept`** | every entry Book 8 contributes is Butler's own `girded` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `havoc` | `havoc` (B8-P009) | **`kept`** | every entry Book 8 contributes is Butler's own `havoc` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `hearers` | `hearers` (B8-P014) | **`kept`** | every entry Book 8 contributes is Butler's own `hearers` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `hosts` | `hosts` (B8-P048) | **`kept`** | every entry Book 8 contributes is Butler's own `hosts` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `humane` | `humane` (B8-P050) | **`kept`** | every entry Book 8 contributes is Butler's own `humane` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `looks` | `looks` (B8-P001), `looks` (B8-P014) | **`kept`** | every entry Book 8 contributes is Butler's own `looks` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `mantle` | `cloak` (B8-P007) | **`matches-accepted`** | `mantle` -> `cloak` at B08-P007 is accepted B04-P013's rendering. B03-P036's `fine cloak` is the same rendering with Butler's own adjective attached. |
| `nation` | `nation` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `nation` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `peoples` | `peoples` (B8-P050) | **`kept`** | every entry Book 8 contributes is Butler's own `peoples` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `precincts` | `precincts` (B8-P004) | **`discrimination`** | **Ruled at Book 8, and the two renderings are deliberate.** B07-P012 is a man crossing a threshold into an enclosure, and there `precincts` was rendered `courtyard` for two reasons (finding M-1): `walls` was a sense change, and the Book's walls are literally bronze. B08-P004 is the plural grounds of a palace — *the outbuildings, the yards, and all the precincts were filled with crowds* — where `precincts` is current English and needs no change. Recorded in `book08/continuity.md` §6. |
| `raiment` | `clothing that` (B8-P040), `robes` (B8-P030) | **`discrimination`** | **Ruled, and the two renderings are deliberate.** Butler uses `raiment` twice in this Book for two different things: the divine dress the Graces put on Aphrodite at B08-P030, rendered `robes`, and the gift-clothes the Phaeacians pack in Arete's chest at B08-P040, rendered `clothing` — which is word for word accepted B05-P004's rendering. `clothing of the most enchanting beauty` said of a goddess is flat, and `robes` said of a chest of presents is wrong. |
| `remained` | `was` (B8-P042) | **`artifact`** | Butler's `who as long as he remained with her had taken as good care of him` became `who for as long as he was with her` — a phrase-level recast made to keep `stayed` free for Butler's own `staid`/`stayed` (B03-P015, B04-P009, B07-P022). The diff paired `remained` with `was`; there is no rendering pair to rule on. |
| `seated` | `seated` (B8-P044) | **`kept`** | every entry Book 8 contributes is Butler's own `seated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `singularly` | `singularly` (B8-P017) | **`kept`** | every entry Book 8 contributes is Butler's own `singularly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `toils` | `toils` (B8-P021) | **`kept`** | every entry Book 8 contributes is Butler's own `toils` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `uncivilised` | `uncivilized` (B8-P050) | **`artifact`** | `uncivilised` -> `uncivilized` is D9, the spelling rule. Book 9's row is the separate question of Butler's tautologous `uncivilised savages`. |
| `yonder` | `yonder` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `yonder` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW B — one rendering, two or more Butler words, across Books

67 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B8-P004), `after` (B8-P008), `after` (B8-P045) | **`kept`** | every entry Book 8 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ambush` | `ambuscade` (B8-P046) | **`unavoidable-merge`** | `ambush` carries Butler's `ambuscade` and his own `ambush` (B04-P034, B04-P081). `ambuscade` is archaic and `ambush` is its only plain modern equivalent; both accepted Book 4 and Book 8 render it so. |
| `anyone` | `anyone` (B8-P016) | **`kept`** | every entry Book 8 contributes is Butler's own `anyone` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `appease` | `and propitiation for` (B8-P046) | **`artifact`** | Butler's `as an offering and propitiation for the gods` became `as an offering to appease the gods`. `propitiation` is a noun and `appease` a verb; the diff paired the spans across the recast. |
| `aware` | `perceived` (B8-P047) | **`matches-accepted`** | `perceived` -> `was aware of` at B08-P047 is the rendering accepted B05-P018 already uses. It was chosen at this Book precisely to keep `noticed` free for Butler's own `noticed` at B08-P007, which arrow C caught flattened in the first draft. |
| `being` | `being` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `beside` | `beside` (B8-P044) | **`kept`** | every entry Book 8 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `blessed` | `blessed` (B8-P022), `blessed` (B8-P023) | **`kept`** | every entry Book 8 contributes is Butler's own `blessed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B8-P045) | **`kept`** | every entry Book 8 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `charge` | `charge` (B8-P038) | **`kept`** | every entry Book 8 contributes is Butler's own `charge` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B8-P047) | **`kept`** | every entry Book 8 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `cloak` (B8-P015), `cloak` (B8-P034), `cloak` (B8-P039), `cloak` (B8-P040), `cloak` (B8-P042), `mantle` (B8-P007) | **`common-rendering`** | `cloak` is a word Butler himself uses in 10 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `clothing` | `raiment which` (B8-P040) | **`matches-accepted`** | See (A, raiment). B08-P040 uses accepted B05-P004's rendering exactly; B07-P022's `clothing` is Butler's own word kept. |
| `company` | `company` (B8-P006), `company` (B8-P044) | **`kept`** | every entry Book 8 contributes is Butler's own `company` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `conversation` | `conversation` (B8-P014) | **`kept`** | every entry Book 8 contributes is Butler's own `conversation` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cross` | `traverse` (B8-P049) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `decide` | `decide` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `decide` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B8-P003), `enough` (B8-P006), `enough` (B8-P007) | **`kept`** | every entry Book 8 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `escorted` | `escorted` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `escorted` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `first` | `first` (B8-P009), `first` (B8-P014), `first` (B8-P016), `first` (B8-P019), `first` (B8-P042) | **`kept`** | every entry Book 8 contributes is Butler's own `first` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forward` | `forward` (B8-P009), `forward` (B8-P018), `forwards` (B8-P032) | **`variant`** | every rendering in the row reduces to `forward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `going` | `going` (B8-P008), `going` (B8-P021), `going` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B8-P004), `great` (B8-P014), `great` (B8-P019), `great` (B8-P032), `great` (B8-P035), `great` (B8-P043), `great` (B8-P048) | **`kept`** | every entry Book 8 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `halios` | `halios` (B8-P008), `halius` (B8-P032) | **`variant`** | **Butler spells one man's name two ways** — `Halios` at B08-P008 and `Halius` at B08-P032, for the same son of Alcinous, and the check found it. This is the **D13** shape with the opposite resolution: D13 split `Mycene` by *referent* because there were two people; here there is one man, so one spelling, and Butler's first is taken. Recorded in `continuity.md`, not silently regularized. |
| `hurried` | `hurried` (B8-P015), `hurried` (B8-P018), `hurried` (B8-P019) | **`kept`** | every entry Book 8 contributes is Butler's own `hurried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `husband` | `husband` (B8-P043), `husband` (B8-P047) | **`kept`** | every entry Book 8 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leather` | `leather` (B8-P004) | **`kept`** | every entry Book 8 contributes is Butler's own `leather` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `leave` (B8-P003), `leave` (B8-P028), `leave` (B8-P048) | **`kept`** | every entry Book 8 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B8-P040) | **`kept`** | every entry Book 8 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B8-P003), `matter` (B8-P006), `matter` (B8-P016), `matter` (B8-P049) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meaning` | `meaning` (B8-P017) | **`kept`** | every entry Book 8 contributes is Butler's own `meaning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `meanwhile` | `meanwhile` (B8-P019), `meanwhile` (B8-P040) | **`kept`** | every entry Book 8 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `myself` | `myself` (B8-P029), `myself` (B8-P034), `myself` (B8-P039) | **`kept`** | every entry Book 8 contributes is Butler's own `myself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `neighbor` | `neighbour saying` (B8-P023) | **`variant`** | D9, `neighbour` -> `neighbor`. The trailing `saying` in the row is Butler's participle, which the recast `and one would turn to his neighbor and say` absorbed; the diff attached it to the same span. |
| `others` | `others` (B8-P003), `others` (B8-P004), `others` (B8-P008), `others` (B8-P009), `others` (B8-P035), `others` (B8-P046) | **`kept`** | every entry Book 8 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ourselves` | `ourselves` (B8-P048) | **`variant`** | every rendering in the row reduces to `ourselv` once inflection, D9 spelling and D15 compound spacing are normalized |
| `people` | `people` (B8-P008), `people` (B8-P012), `people` (B8-P033), `people` (B8-P047), `people` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `places` | `places` (B8-P019) | **`kept`** | every entry Book 8 contributes is Butler's own `places` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quick` | `quick` (B8-P014) | **`kept`** | every entry Book 8 contributes is Butler's own `quick` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `robes` | `raiment` (B8-P030) | **`discrimination`** | See (A, raiment). `robes` carries Butler's `raiment` at B08-P030 and his own `robes` at B06-P003 — both are garments worn, and the merge is the correct reading rather than a loss. |
| `seafaring` | `seafaring` (B8-P031) | **`variant`** | every rendering in the row reduces to `seafar` once inflection, D9 spelling and D15 compound spacing are normalized |
| `servant` | `servant` (B8-P004), `servant` (B8-P005), `servant` (B8-P008), `servant` (B8-P018), `servant` (B8-P042), `servant` (B8-P044), `servant` (B8-P045) | **`kept`** | every entry Book 8 contributes is Butler's own `servant` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `settled` | `settled` (B8-P003), `settled` (B8-P046) | **`kept`** | every entry Book 8 contributes is Butler's own `settled` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `showed` | `showed` (B8-P005) | **`kept`** | every entry Book 8 contributes is Butler's own `showed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `since` | `since` (B8-P042) | **`kept`** | every entry Book 8 contributes is Butler's own `since` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B8-P007), `sitting` (B8-P042), `sitting` (B8-P047) | **`kept`** | every entry Book 8 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B8-P011), `something` (B8-P050) | **`kept`** | every entry Book 8 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `somewhere` (B8-P003) | **`kept`** | every entry Book 8 contributes is Butler's own `somewhere` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `start` | `start` (B8-P019) | **`kept`** | every entry Book 8 contributes is Butler's own `start` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `strength` | `strength` (B8-P009), `strength` (B8-P014) | **`kept`** | every entry Book 8 contributes is Butler's own `strength` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `supper` | `supper` (B8-P034), `supper` (B8-P039), `supper` (B8-P044), `supper` (B8-P048) | **`kept`** | every entry Book 8 contributes is Butler's own `supper` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `suppose` | `suppose` (B8-P013) | **`kept`** | every entry Book 8 contributes is Butler's own `suppose` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `talked` | `converse` (B8-P025) | **`unavoidable-merge`** | `talked` carries Butler's `converse` (B04-P052, B07-P028) and his own `talked` (B02-P025). `converse` as an intransitive verb is archaic and `talk` is its only plain modern equivalent; the alternative is a register difference Butler does not make. B07-P028 matches accepted B04-P052 word for word, which is the consistency the package asks for. |
| `their` | `their` (B8-P006), `their` (B8-P013), `their` (B8-P017), `their` (B8-P018), `their` (B8-P019), `their` (B8-P021), `their` (B8-P032), `their` (B8-P035), `their` (B8-P038), `their` (B8-P042), `their` (B8-P044), `their` (B8-P045), `their` (B8-P046), `their` (B8-P049), `their` (B8-P050) | **`kept`** | every entry Book 8 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `there` (B8-P001), `there` (B8-P003), `there` (B8-P004), `there` (B8-P008), `there` (B8-P009), `there` (B8-P011), `there` (B8-P013), `there` (B8-P019), `there` (B8-P022), `there` (B8-P026), `there` (B8-P032), `there` (B8-P034), `there` (B8-P044), `there` (B8-P045), `there` (B8-P046), `there` (B8-P048), `there` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B8-P013), `those` (B8-P015), `those` (B8-P016), `those` (B8-P047), `those` (B8-P048), `those` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `three` | `three` (B8-P008), `three` (B8-P026), `three` (B8-P046) | **`kept`** | every entry Book 8 contributes is Butler's own `three` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `times` | `times` (B8-P026) | **`kept`** | every entry Book 8 contributes is Butler's own `times` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `converse` (B8-P025), `together` (B8-P006), `together` (B8-P022) | **`common-rendering`** | `together` is a word Butler himself uses in 16 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `water` | `water` (B8-P004), `water` (B8-P011), `water` (B8-P039), `water` (B8-P040) | **`kept`** | every entry Book 8 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `whatever` | `whatever` (B8-P003), `whatever` (B8-P049) | **`variant`** | every rendering in the row reduces to `whatever` once inflection, D9 spelling and D15 compound spacing are normalized |
| `where` | `where` (B8-P005), `where` (B8-P015), `where` (B8-P030), `where` (B8-P046), `where` (B8-P050) | **`kept`** | every entry Book 8 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `which` (B8-P001), `which` (B8-P002), `which` (B8-P005), `which` (B8-P008), `which` (B8-P016), `which` (B8-P017), `which` (B8-P019), `which` (B8-P035), `which` (B8-P037), `which` (B8-P039), `which` (B8-P046), `which` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wiped` | `wiped` (B8-P007) | **`kept`** | every entry Book 8 contributes is Butler's own `wiped` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `without` | `without` (B8-P015), `without` (B8-P029), `without` (B8-P049) | **`kept`** | every entry Book 8 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B8-P047) | **`kept`** | every entry Book 8 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `young` | `young` (B8-P003), `young` (B8-P004), `young` (B8-P016), `young` (B8-P018), `young` (B8-P032) | **`kept`** | every entry Book 8 contributes is Butler's own `young` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

3 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `come` | `came` (B8-P003) | **`common-word`** | `come` is an ordinary word Butler uses in 66 paragraphs and the two uses share no referent |
| `said` | `his saying` (B8-P035) | **`common-word`** | `said` is an ordinary word Butler uses in 143 paragraphs and the two uses share no referent |
| `out` | `issued from` (B8-P046) | **`common-word`** | `out` is an ordinary word Butler uses in 89 paragraphs and the two uses share no referent |

