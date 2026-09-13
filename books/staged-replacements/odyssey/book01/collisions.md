# Odyssey Book 1 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**164 rows touch Book 1.**

| disposition | rows |
|---|---|
| `UNRULED` | 96 |
| `artifact` | 1 |
| `common-rendering` | 14 |
| `common-word` | 22 |
| `homograph` | 1 |
| `kept` | 20 |
| `phrase-not-word` | 1 |
| `variant` | 9 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

55 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `accept` | `receive` (B1-P003) | **`UNRULED`** |  |
| `around` | `once` (B1-P017) | **`UNRULED`** |  |
| `behaving` | `behave` (B1-P016) | **`UNRULED`** |  |
| `bottom` | `has charge` (B1-P005) | **`UNRULED`** |  |
| `carries` | `holds up` (B1-P005) | **`UNRULED`** |  |
| `cease` | `stop` (B1-P024) | **`UNRULED`** |  |
| `ceasing` | `end` (B1-P024), `pause` (B1-P002) | **`UNRULED`** |  |
| `celebrate` | `hold` (B1-P019), `sing` (B1-P024) | **`UNRULED`** |  |
| `closely` | `completely` (B1-P017) | **`UNRULED`** |  |
| `conduct` | `take` (B1-P007) | **`UNRULED`** |  |
| `conducted` | `led` (B1-P010) | **`UNRULED`** |  |
| `couple` | `couple` (B1-P018), `pair` (B1-P032) | **`UNRULED`** |  |
| `decorated` | `worked` (B1-P010) | **`UNRULED`** |  |
| `depart` | `leave` (B1-P027) | **`variant`** | every rendering in the row reduces to `leave` once inflection, D9 spelling and D15 compound spacing are normalized |
| `detaining` | `holding` (B1-P014) | **`UNRULED`** |  |
| `distaff` | `spinning` (B1-P025) | **`UNRULED`** |  |
| `faring` | `faring` (B1-P014) | **`artifact`** | Butler writes `sea-faring` with a hyphen and the tokenizer splits it, so `faring` is not a word either text uses. D15 closes it to `seafaring`, matching accepted B06-P021. There is no rendering pair. |
| `feared` | `fear of` (B1-P032), `feared` (B1-P018) | **`UNRULED`** |  |
| `flower` | `finest` (B1-P014) | **`UNRULED`** |  |
| `glittering` | `bright` (B1-P008) | **`UNRULED`** |  |
| `grasped` | `and took up` (B1-P008) | **`UNRULED`** |  |
| `handmaids` | `maids` (B1-P023), `maids` (B1-P026) | **`UNRULED`** |  |
| `havoc` | `laying waste to` (B1-P017) | **`UNRULED`** |  |
| `hearers` | `listeners` (B1-P023) | **`UNRULED`** |  |
| `hecatomb` | `great sacrifice` (B1-P003) | **`UNRULED`** |  |
| `inherit` | `have inherited` (B1-P017) | **`UNRULED`** |  |
| `insolence` | `rudeness` (B1-P010) | **`UNRULED`** |  |
| `laying` | `set` (B1-P008) | **`UNRULED`** |  |
| `lighted` | `lit` (B1-P032) | **`UNRULED`** |  |
| `living` | `everlasting` (B1-P018) | **`UNRULED`** |  |
| `longing` | `longed` (B1-P002) | **`variant`** | every rendering in the row reduces to `long` once inflection, D9 spelling and D15 compound spacing are normalized |
| `looks` | `has charge` (B1-P005) | **`UNRULED`** |  |
| `lordly` | `proud` (B1-P008) | **`UNRULED`** |  |
| `marvelled` | `listened amazed` (B1-P028) | **`UNRULED`** |  |
| `meantime` | `meanwhile` (B1-P007) | **`UNRULED`** |  |
| `nation` | `people` (B1-P013) | **`UNRULED`** |  |
| `offended` | `take offense at` (B1-P013) | **`UNRULED`** |  |
| `persist` | `go on` (B1-P007), `go on feeding off` (B1-P027) | **`UNRULED`** |  |
| `possessions` | `property` (B1-P030) | **`UNRULED`** |  |
| `prevail` | `urge` (B1-P019) | **`UNRULED`** |  |
| `prevented` | `kept` (B1-P001) | **`UNRULED`** |  |
| `pulled` | `pulling` (B1-P032) | **`variant`** | every rendering in the row reduces to `pull` once inflection, D9 spelling and D15 compound spacing are normalized |
| `refreshed` | `rested then` (B1-P020) | **`UNRULED`** |  |
| `riches` | `wealth` (B1-P029) | **`UNRULED`** |  |
| `seated` | `sitting` (B1-P008) | **`UNRULED`** |  |
| `serve` | `be no use to` (B1-P013) | **`UNRULED`** |  |
| `shrift` | `quick end` (B1-P018) | **`UNRULED`** |  |
| `smart` | `capable` (B1-P019) | **`UNRULED`** |  |
| `storm` | `storms` (B1-P017) | **`variant`** | every rendering in the row reduces to `storm` once inflection, D9 spelling and D15 compound spacing are normalized |
| `thence` | `then` (B1-P019) | **`UNRULED`** |  |
| `tired` | `sick` (B1-P005), `tired` (B1-P014) | **`UNRULED`** |  |
| `value` | `valuable` (B1-P020), `value` (B1-P021) | **`UNRULED`** |  |
| `wilderness` | `the wild` (B1-P013) | **`UNRULED`** |  |
| `wondered` | `in himself marveled` (B1-P022) | **`UNRULED`** |  |
| `yonder` | `there` (B1-P014) | **`UNRULED`** |  |

## ARROW B — one rendering, two or more Butler words, across Books

76 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `account` | `shall reckon` (B1-P027) | **`UNRULED`** |  |
| `after` | `after` (B1-P001), `after` (B1-P004), `after` (B1-P014) | **`kept`** | every entry Book 1 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `among` | `among` (B1-P002), `among` (B1-P009), `among` (B1-P014), `among` (B1-P029), `among` (B1-P030) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `anger` | `resentment she` (B1-P032) | **`UNRULED`** |  |
| `apart` | `asunder` (B1-P005) | **`UNRULED`** |  |
| `arrows` | `arrows` (B1-P018) | **`kept`** | every entry Book 1 contributes is Butler's own `arrows` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `being` | `being` (B1-P005) | **`kept`** | every entry Book 1 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `beside` | `beside` (B1-P011) | **`kept`** | every entry Book 1 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `bright` | `glittering` (B1-P008) | **`UNRULED`** |  |
| `brings` | `brings` (B1-P029), `quells` (B1-P008) | **`UNRULED`** |  |
| `capable` | `capable` (B1-P006), `smart` (B1-P019) | **`UNRULED`** |  |
| `carried` | `spirited` (B1-P017) | **`common-rendering`** | `carried` is a word Butler himself uses in 13 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `charge` | `looks after the bottom` (B1-P005) | **`UNRULED`** |  |
| `completely` | `closely` (B1-P017) | **`UNRULED`** |  |
| `decide` | `decide` (B1-P030), `determine` (B1-P019) | **`UNRULED`** |  |
| `eating` | `eating` (B1-P007), `eating` (B1-P017) | **`kept`** | every entry Book 1 contributes is Butler's own `eating` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B1-P016) | **`kept`** | every entry Book 1 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `everlasting` | `ever living` (B1-P018) | **`UNRULED`** |  |
| `finest` | `flower` (B1-P014) | **`UNRULED`** |  |
| `flattery` | `blandishment` (B1-P005) | **`UNRULED`** |  |
| `front` | `front` (B1-P008) | **`kept`** | every entry Book 1 contributes is Butler's own `front` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B1-P026) | **`kept`** | every entry Book 1 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B1-P005), `great` (B1-P008), `great` (B1-P023), `great` (B1-P024), `great` (B1-P029), `hecatomb` (B1-P003) | **`common-rendering`** | `great` is a word Butler himself uses in 54 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `grieving` | `sorrowful` (B1-P024) | **`UNRULED`** |  |
| `guide` | `direct` (B1-P019) | **`UNRULED`** |  |
| `heads` | `heads` (B1-P006) | **`kept`** | every entry Book 1 contributes is Butler's own `heads` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `himself` | `himself` (B1-P003), `himself` (B1-P010), `himself` (B1-P013), `wondered` (B1-P022) | **`common-rendering`** | `himself` is a word Butler himself uses in 35 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `holding` | `who are detaining` (B1-P014) | **`UNRULED`** |  |
| `hurried` | `hurried` (B1-P030), `were bustling` (B1-P008) | **`UNRULED`** |  |
| `husband` | `husband` (B1-P019), `husband` (B1-P026) | **`kept`** | every entry Book 1 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `keeping` | `keeping` (B1-P014), `preventing` (B1-P006) | **`UNRULED`** |  |
| `laying` | `making havoc of` (B1-P017) | **`UNRULED`** |  |
| `leave` | `depart` (B1-P027) | **`common-rendering`** | `leave` is a word Butler himself uses in 23 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `lives` | `lives` (B1-P005), `lives` (B1-P014) | **`kept`** | every entry Book 1 contributes is Butler's own `lives` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `handmaids` (B1-P023), `handmaids into her room` (B1-P026), `maids` (B1-P012) | **`common-rendering`** | `maids` is a word Butler himself uses in 23 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `marveled` | `wondered` (B1-P022) | **`UNRULED`** |  |
| `matter` | `matters` (B1-P017) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `in the meantime` (B1-P007) | **`common-rendering`** | `meanwhile` is a word Butler himself uses in 10 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `morning` | `morning` (B1-P019), `morning` (B1-P027) | **`kept`** | every entry Book 1 contributes is Butler's own `morning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `offense` | `be offended with` (B1-P013) | **`UNRULED`** |  |
| `opened` | `opened` (B1-P032) | **`variant`** | every rendering in the row reduces to `open` once inflection, D9 spelling and D15 compound spacing are normalized |
| `others` | `some cutting` (B1-P008) | **`common-rendering`** | `others` is a word Butler himself uses in 20 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `people` | `nation` (B1-P013), `people` (B1-P002), `people` (B1-P007), `people` (B1-P013), `people` (B1-P016), `people` (B1-P019), `people` (B1-P025) | **`common-rendering`** | `people` is a word Butler himself uses in 54 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `playing` | `playing` (B1-P008) | **`homograph`** | One spelling, two unrelated senses. `the playing that goes with it` at B08-P007 renders Butler's `minstrelsy`; his own `playing` elsewhere is children at play (B01-P008, B07-P023) and a flame playing about a tripod (B08-P040). No referent is shared. |
| `property` | `possessions` (B1-P030) | **`UNRULED`** |  |
| `proud` | `lordly` (B1-P008) | **`UNRULED`** |  |
| `pulling` | `pulled` (B1-P032) | **`variant`** | every rendering in the row reduces to `pull` once inflection, D9 spelling and D15 compound spacing are normalized |
| `quick` | `short shrift` (B1-P018) | **`UNRULED`** |  |
| `rested` | `refreshed yourself` (B1-P020) | **`UNRULED`** |  |
| `sacrifice` | `hecatomb` (B1-P003) | **`UNRULED`** |  |
| `scold` | `chide with` (B1-P029) | **`UNRULED`** |  |
| `search` | `quest` (B1-P019) | **`UNRULED`** |  |
| `servant` | `servant` (B1-P011), `servant` (B1-P012) | **`kept`** | every entry Book 1 contributes is Butler's own `servant` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `settle` | `shall reckon` (B1-P027) | **`UNRULED`** |  |
| `since` | `inasmuch as` (B1-P004), `since` (B1-P015) | **`common-rendering`** | `since` is a word Butler himself uses in 9 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `sitting` | `seated` (B1-P008), `sitting` (B1-P009) | **`common-rendering`** | `sitting` is a word Butler himself uses in 18 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `something` | `partaken of food` (B1-P009), `something` (B1-P019) | **`common-rendering`** | `something` is a word Butler himself uses in 13 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `spears` | `lances` (B1-P018), `spears` (B1-P010) | **`UNRULED`** |  |
| `spinning` | `distaff` (B1-P025) | **`UNRULED`** |  |
| `their` | `their` (B1-P001), `their` (B1-P004), `their` (B1-P010), `their` (B1-P011), `their` (B1-P012), `their` (B1-P017), `their` (B1-P024), `their` (B1-P028), `their` (B1-P032) | **`kept`** | every entry Book 1 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `simply` (B1-P017), `there` (B1-P003), `there` (B1-P005), `there` (B1-P008), `there` (B1-P010), `there` (B1-P015), `there` (B1-P016), `there` (B1-P019), `there` (B1-P027), `there` (B1-P029), `there` (B1-P030), `yonder` (B1-P014) | **`common-rendering`** | `there` is a word Butler himself uses in 100 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `those` | `those` (B1-P029) | **`kept`** | every entry Book 1 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `together` (B1-P006) | **`kept`** | every entry Book 1 contributes is Butler's own `together` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `until` | `until` (B1-P032) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `waste` | `making havoc of` (B1-P017), `waste` (B1-P019) | **`UNRULED`** |  |
| `water` | `water` (B1-P008), `water` (B1-P011), `water` (B1-P012) | **`kept`** | every entry Book 1 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wealth` | `riches` (B1-P029) | **`UNRULED`** |  |
| `whatever` | `whatsoever` (B1-P001) | **`variant`** | every rendering in the row reduces to `whatever` once inflection, D9 spelling and D15 compound spacing are normalized |
| `where` | `where` (B1-P013), `where` (B1-P014), `where` (B1-P018), `where` (B1-P022), `where` (B1-P030), `whither` (B1-P017) | **`common-rendering`** | `where` is a word Butler himself uses in 58 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `which` | `wherewith` (B1-P008), `which` (B1-P010) | **`common-rendering`** | `which` is a word Butler himself uses in 81 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `wiped` | `cleaning` (B1-P008) | **`UNRULED`** |  |
| `without` | `without` (B1-P002), `without` (B1-P017), `without` (B1-P024) | **`kept`** | every entry Book 1 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B1-P014), `woman` (B1-P032) | **`kept`** | every entry Book 1 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `worked` | `decorated` (B1-P010) | **`UNRULED`** |  |
| `working` | `pottering about` (B1-P014) | **`UNRULED`** |  |
| `young` | `young` (B1-P029), `young` (B1-P032) | **`kept`** | every entry Book 1 contributes is Butler's own `young` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

33 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `home` | `back` (B1-P002) | **`common-word`** | `home` is an ordinary word Butler uses in 85 paragraphs and the two uses share no referent |
| `sea` | `ocean` (B1-P005) | **`common-word`** | `sea` is an ordinary word Butler uses in 74 paragraphs and the two uses share no referent |
| `got` | `right` (B1-P005) | **`common-word`** | `got` is an ordinary word Butler uses in 44 paragraphs and the two uses share no referent |
| `down` | `quells` (B1-P008) | **`common-word`** | `down` is an ordinary word Butler uses in 47 paragraphs and the two uses share no referent |
| `led` | `he conducted` (B1-P010) | **`UNRULED`** |  |
| `set` | `took` (B1-P010) | **`common-word`** | `set` is an ordinary word Butler uses in 45 paragraphs and the two uses share no referent |
| `poured` | `brought` (B1-P011) | **`UNRULED`** |  |
| `brought` | `fetched them` (B1-P011) | **`common-word`** | `brought` is an ordinary word Butler uses in 29 paragraphs and the two uses share no referent |
| `set` | `offered` (B1-P011) | **`common-word`** | `set` is an ordinary word Butler uses in 45 paragraphs and the two uses share no referent |
| `truly` | `and tell me true` (B1-P013) | **`UNRULED`** |  |
| `said` | `declared themselves to be` (B1-P013) | **`common-word`** | `said` is an ordinary word Butler uses in 128 paragraphs and the two uses share no referent |
| `about` | `going` (B1-P013) | **`common-word`** | `about` is an ordinary word Butler uses in 101 paragraphs and the two uses share no referent |
| `people` | `nation` (B1-P013) | **`common-word`** | `people` is an ordinary word Butler uses in 54 paragraphs and the two uses share no referent |
| `tell` | `say that` (B1-P013) | **`common-word`** | `tell` is an ordinary word Butler uses in 56 paragraphs and the two uses share no referent |
| `men` | `those` (B1-P013) | **`common-word`** | `men` is an ordinary word Butler uses in 68 paragraphs and the two uses share no referent |
| `truly` | `and tell me true` (B1-P014) | **`UNRULED`** |  |
| `away` | `back` (B1-P014) | **`common-word`** | `away` is an ordinary word Butler uses in 41 paragraphs and the two uses share no referent |
| `longer` | `never` (B1-P014) | **`UNRULED`** |  |
| `same` | `so also with myself` (B1-P017) | **`UNRULED`** |  |
| `tell` | `bid` (B1-P019) | **`common-word`** | `tell` is an ordinary word Butler uses in 56 paragraphs and the two uses share no referent |
| `find` | `get` (B1-P019) | **`common-word`** | `find` is an ordinary word Butler uses in 26 paragraphs and the two uses share no referent |
| `marriage` | `marry` (B1-P019) | **`UNRULED`** |  |
| `home` | `place` (B1-P019) | **`common-word`** | `home` is an ordinary word Butler uses in 85 paragraphs and the two uses share no referent |
| `urge` | `prevail upon` (B1-P019) | **`UNRULED`** |  |
| `once` | `then having` (B1-P019) | **`common-word`** | `once` is an ordinary word Butler uses in 37 paragraphs and the two uses share no referent |
| `give` | `make` (B1-P021) | **`common-word`** | `give` is an ordinary word Butler uses in 35 paragraphs and the two uses share no referent |
| `held` | `supported` (B1-P023) | **`UNRULED`** |  |
| `sing` | `celebrate` (B1-P024) | **`UNRULED`** |  |
| `man` | `fellow` (B1-P025) | **`common-word`** | `man` is an ordinary word Butler uses in 86 paragraphs and the two uses share no referent |
| `took` | `did not take` (B1-P032) | **`common-word`** | `took` is an ordinary word Butler uses in 54 paragraphs and the two uses share no referent |
| `out` | `that looked on to` (B1-P032) | **`common-word`** | `out` is an ordinary word Butler uses in 69 paragraphs and the two uses share no referent |
| `went` | `then returned` (B1-P032) | **`common-word`** | `went` is an ordinary word Butler uses in 74 paragraphs and the two uses share no referent |
| `woman` | `women` (B1-P032) | **`UNRULED`** |  |

