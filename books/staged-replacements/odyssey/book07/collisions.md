# Odyssey Book 7 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**80 rows touch Book 7.**

| disposition | rows |
|---|---|
| `artifact` | 3 |
| `common-rendering` | 7 |
| `common-word` | 2 |
| `discrimination` | 1 |
| `homograph` | 1 |
| `kept` | 46 |
| `kept-elsewhere` | 1 |
| `matches-accepted` | 1 |
| `phrase-not-word` | 2 |
| `same-referent` | 2 |
| `unavoidable-merge` | 3 |
| `variant` | 11 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

16 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `bloom` | `bloom` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `bloom` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `closely` | `closely` (B7-P010) | **`kept`** | every entry Book 7 contributes is Butler's own `closely` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `depart` | `to leave` (B7-P022) | **`variant`** | every rendering in the row reduces to `leave` once inflection, D9 spelling and D15 compound spacing are normalized |
| `dwells` | `dwells` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `dwells` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `entered` | `entered` (B7-P009) | **`kept`** | every entry Book 7 contributes is Butler's own `entered` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `faring` | `seafaring` (B7-P004) | **`artifact`** | Butler writes `sea-faring` with a hyphen and the tokenizer splits it, so `faring` is not a word either text uses. D15 closes it to `seafaring`, matching accepted B06-P021. There is no rendering pair. |
| `follow` | `follow` (B7-P025) | **`kept`** | every entry Book 7 contributes is Butler's own `follow` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `harbours` | `harbors their` (B7-P005) | **`variant`** | D9, `harbours` -> `harbors`. The trailing `their` in the row is the parallel possessive Butler dropped and B07-P005 restores, recorded in `continuity.md`; the diff attached it to the same span. |
| `husbands` | `beside her husband` (B7-P007), `husbands` (B7-P008) | **`variant`** | One word, inflected for number. O-6's repair recasts Butler's comparison from *`honored of all those who keep house along with their husbands`* to *`honors more than any other woman who keeps house beside her husband`*, which is singular because the comparison now has one term. Butler's own plural at B07-P008 stands. |
| `issue` | `a son` (B7-P007) | **`homograph`** | **Not a collision.** Butler's `issue` is *outcome* at B03-P007 and *offspring* at B07-P007 — two words spelled alike. Both uses are archaic and both had to move, in different directions because they are different words. `without a son` is exact: Rhexenor left a daughter and no son. Upheld at findings-v1 \u00a75.2, and this is the class that gets a name here so the next `state`, `will`, `fair` or `want` does not cost a reviewer the same work from scratch. |
| `lighted` | `lighted` (B7-P010) | **`kept`** | every entry Book 7 contributes is Butler's own `lighted` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `luscious` | `luscious` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `luscious` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `possessions` | `possessions` (B7-P013) | **`kept`** | every entry Book 7 contributes is Butler's own `possessions` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `precincts` | `courtyard` (B7-P012) | **`discrimination`** | **Ruled at Book 8, and the two renderings are deliberate.** B07-P012 is a man crossing a threshold into an enclosure, and there `precincts` was rendered `courtyard` for two reasons (finding M-1): `walls` was a sense change, and the Book's walls are literally bronze. B08-P004 is the plural grounds of a palace — *the outbuildings, the yards, and all the precincts were filled with crowds* — where `precincts` is current English and needs no change. Recorded in `book08/continuity.md` §6. |
| `rejoicing` | `rejoicing` (B7-P018) | **`kept`** | every entry Book 7 contributes is Butler's own `rejoicing` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `storm` | `storm` (B7-P022) | **`variant`** | every rendering in the row reduces to `storm` once inflection, D9 spelling and D15 compound spacing are normalized |

## ARROW B — one rendering, two or more Butler words, across Books

59 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B7-P017), `after` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `agreed` | `agreed` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `agreed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `begged` | `besought` (B7-P023) | **`kept-elsewhere`** | **The one rendering decision in this row is Book 7's `begged` → `besought`, and it is the thing to rule on.** Every other entry is Butler's own `begged` carried through unchanged by another Book, so there is no cross-Book inconsistency — which is a different question from whether `besought` is the right word here, and this class cannot answer that one. **Declared blind, twice:** it cannot say whether a Book that KEPT `begged` should also have moved it (ruled by hand in `RULINGS_BY_BOOK` where the kept word is not current English in context — see `luscious` at Book 5), and it cannot say whether the single rendering is accurate to Butler's sense (Book 9 S-4: `humane` is *merciful*, and `civilized` is not). |
| `being` | `being` (B7-P011), `being` (B7-P025) | **`kept`** | every entry Book 7 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `beside` | `along with their husbands` (B7-P007), `beside` (B7-P016) | **`common-rendering`** | `beside` is a word Butler himself uses in 9 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `blossom` | `blossom` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `blossom` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `bondservants` | `property my bondsmen` (B7-P019) | **`artifact`** | Butler's `bondsmen` is rendered `bondservants` in BOTH accepted B04-P055 and B07-P019 — the row exists only because §8's reordering of `see my property once more` pulled `property` into the diff's span, so the two source sides read `bondsmen` and `property my bondsmen`. There is one rendering and it is consistent. |
| `called` | `called` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `called` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B7-P001), `carried` (B7-P011), `carried` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B7-P008), `children` (B7-P013) | **`kept`** | every entry Book 7 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `cloak` (B7-P012), `cloak` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `cloak` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `clothing` | `clothing` (B7-P022) | **`matches-accepted`** | See (A, raiment). B08-P040 uses accepted B05-P004's rendering exactly; B07-P022's `clothing` is Butler's own word kept. |
| `content` | `content` (B7-P019) | **`variant`** | every rendering in the row reduces to `content` once inflection, D9 spelling and D15 compound spacing are normalized |
| `courtyard` | `precincts` (B7-P012) | **`same-referent`** | The M-1 repair. `courtyard` now carries Butler's own `courtyard` (accepted B04-P005) and his `precincts` (B07-P012) — and his `precincts` IS the courtyard: the next sentence has Odysseus going `straight through the court`. Using Butler's own word for the thing he is describing is what M-1 asked for, and it is what frees `walls` for the bronze. |
| `enough` | `enough` (B7-P012) | **`kept`** | every entry Book 7 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `first` | `first` (B7-P006), `first` (B7-P007), `first` (B7-P019), `first` (B7-P020), `first` (B7-P022), `first` (B7-P024) | **`kept`** | every entry Book 7 contributes is Butler's own `first` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forward` | `forwards` (B7-P010) | **`variant`** | every rendering in the row reduces to `forward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `going` | `going` (B7-P012) | **`kept`** | every entry Book 7 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B7-P005), `great` (B7-P006), `great` (B7-P007), `great` (B7-P013), `great` (B7-P019), `great` (B7-P021), `great` (B7-P022) | **`kept`** | every entry Book 7 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `handed` | `handed` (B7-P017) | **`kept`** | every entry Book 7 contributes is Butler's own `handed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `housekeeper` | `housekeeper` (B7-P015) | **`variant`** | every rendering in the row reduces to `housekeeper` once inflection, D9 spelling and D15 compound spacing are normalized |
| `husband` | `along with their husbands` (B7-P007), `husband` (B7-P006), `husband` (B7-P013) | **`common-rendering`** | `husband` is a word Butler himself uses in 15 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `inner` | `inner` (B7-P029) | **`kept`** | every entry Book 7 contributes is Butler's own `inner` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `depart` (B7-P022), `leave` (B7-P013) | **`common-rendering`** | `leave` is a word Butler himself uses in 26 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `lives` | `lives` (B7-P004), `lives` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `lives` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B7-P020), `maids` (B7-P024), `maids` (B7-P025), `maids` (B7-P028) | **`kept`** | every entry Book 7 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B7-P018), `matter` (B7-P019), `matter` (B7-P026) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `myself` | `myself` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `myself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `others` | `others` (B7-P010), `others` (B7-P011), `others` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ourselves` | `our selves` (B7-P018) | **`variant`** | every rendering in the row reduces to `ourselv` once inflection, D9 spelling and D15 compound spacing are normalized |
| `people` | `people` (B7-P001), `people` (B7-P004), `people` (B7-P006), `people` (B7-P008), `people` (B7-P012), `people` (B7-P018), `people` (B7-P023), `people` (B7-P026), `persons` (B7-P010) | **`common-rendering`** | `people` is a word Butler himself uses in 64 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `persuade` | `persuade` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `persuade` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `places` | `places` (B7-P005) | **`kept`** | every entry Book 7 contributes is Butler's own `places` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `plainly` (B7-P014) | **`kept`** | every entry Book 7 contributes is Butler's own `plainly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `proud` | `proud` (B7-P002) | **`kept`** | every entry Book 7 contributes is Butler's own `proud` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `scold` | `scold` (B7-P025) | **`kept`** | every entry Book 7 contributes is Butler's own `scold` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `seafaring` | `sea faring` (B7-P004) | **`variant`** | every rendering in the row reduces to `seafar` once inflection, D9 spelling and D15 compound spacing are normalized |
| `servant` | `servant` (B7-P001), `servant` (B7-P016) | **`kept`** | every entry Book 7 contributes is Butler's own `servant` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `settle` | `settle` (B7-P008) | **`kept`** | every entry Book 7 contributes is Butler's own `settle` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sheltered` | `sheltered` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `sheltered` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `since` | `inasmuch as` (B7-P020) | **`common-rendering`** | `since` is a word Butler himself uses in 10 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `single` | `single` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `single` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B7-P006), `sitting` (B7-P015), `sitting` (B7-P016) | **`kept`** | every entry Book 7 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `streams` | `streams` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `streams` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `talked` | `converse` (B7-P028) | **`unavoidable-merge`** | `talked` carries Butler's `converse` (B04-P052, B07-P028) and his own `talked` (B02-P025). `converse` as an intransitive verb is archaic and `talk` is its only plain modern equivalent; the alternative is a register difference Butler does not make. B07-P028 matches accepted B04-P052 word for word, which is the consistency the package asks for. |
| `their` | `harbours` (B7-P005), `their` (B7-P005), `their` (B7-P008), `their` (B7-P010), `their` (B7-P011), `their` (B7-P012), `their` (B7-P013), `their` (B7-P014), `their` (B7-P017), `their` (B7-P018), `their` (B7-P020), `their` (B7-P028) | **`common-rendering`** | `their` is a word Butler himself uses in 105 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `there` | `there` (B7-P010), `there` (B7-P011), `there` (B7-P012), `there` (B7-P015), `there` (B7-P016), `there` (B7-P020), `there` (B7-P021), `there` (B7-P022), `there` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B7-P010), `those` (B7-P019), `those` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `converse` (B7-P028), `together` (B7-P023) | **`common-rendering`** | `together` is a word Butler himself uses in 16 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `traveler` | `wayfarer` (B7-P018) | **`unavoidable-merge`** | **O-7, declined, and the reason is that the proposed repair does not repair anything.** `wayfarer` -> `traveler` at B07-P018 does land on the rendering of Butler's `traveller` at accepted B03-P011 and B04-P027. But O-7 offers `lone traveler` to keep the solitary sense without the merge, and the candidate **already writes `solitary traveler`** — the same repair in a different word, with the merge untouched either way, because `traveler` is the only plain modern equivalent of `wayfarer`. |
| `until` | `hitherto` (B7-P018) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `water` | `water` (B7-P011), `water` (B7-P015), `water` (B7-P016), `water` (B7-P017), `water` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `whatever` | `whatever` (B7-P015) | **`variant`** | every rendering in the row reduces to `whatever` once inflection, D9 spelling and D15 compound spacing are normalized |
| `where` | `where` (B7-P001), `where` (B7-P009), `where` (B7-P021), `where` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `which` (B7-P005), `which` (B7-P010), `which` (B7-P011), `which` (B7-P012), `which` (B7-P021), `which` (B7-P022), `which` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `without` | `without` (B7-P007), `without` (B7-P018), `without` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B7-P001), `woman` (B7-P006), `woman` (B7-P007), `woman` (B7-P008) | **`kept`** | every entry Book 7 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wrapped` | `enveloped` (B7-P012) | **`unavoidable-merge`** | `wrapped` carries Butler's `enveloped` (B05-P030, B07-P012) and his own `wrapped` (B03-P035). `envelop` is not plain modern English of a mist, `wrap` is, and the two Books render it identically, which is the consistency the package asks for. |
| `young` | `young` (B7-P010), `young` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `young` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

5 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `son` | `male issue` (B7-P007) | **`same-referent`** | Butler's `issue` here IS the son — Rhexenor left a daughter and no son, which the same paragraph states. Using Butler's own `son` for his `male issue` is precision, not flattening. Upheld at \u00a75.2. |
| `now` | `hitherto` (B7-P018) | **`phrase-not-word`** | `until now` again — see (B, until). Butler's other `now` is the discourse adverb in `so now go home to bed`, a different clause and a different part of speech. |
| `nothing` | `itself` (B7-P019) | **`artifact`** | `dwell only on the due replenishing of itself` was recast to `think of nothing but being refilled`, a sound collision repair against accepted B04-P016's `filling`. The diff paired `itself` with `nothing` across the recast; Butler's other `nothing` is nine sentences away in `I have nothing of the immortal about me`. |
| `said` | `his saying` (B7-P020) | **`common-word`** | `Every one approved his saying` -> `Everyone approved what he said`, beside `so she said` in a different clause two sentences later. `said` is one of the commonest words in the corpus and the two uses share no referent. |
| `away` | `home` (B7-P020) | **`common-word`** | `away` is an ordinary word Butler uses in 48 paragraphs and the two uses share no referent |

