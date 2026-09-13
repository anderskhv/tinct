# Odyssey Book 2 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**93 rows touch Book 2.**

| disposition | rows |
|---|---|
| `UNRULED` | 30 |
| `common-rendering` | 5 |
| `common-word` | 9 |
| `kept` | 41 |
| `matches-accepted` | 1 |
| `phrase-not-word` | 1 |
| `unavoidable-merge` | 2 |
| `variant` | 4 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

17 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `accomplishments` | `skills` (B2-P007) | **`UNRULED`** |  |
| `begin` | `begin` (B2-P019) | **`kept`** | every entry Book 2 contributes is Butler's own `begin` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `celebrate` | `hold` (B2-P012) | **`UNRULED`** |  |
| `furthermore` | `next` (B2-P031) | **`UNRULED`** |  |
| `girded` | `slung` (B2-P001) | **`UNRULED`** |  |
| `immediately` | `just yet` (B2-P006) | **`UNRULED`** |  |
| `infinite` | `infinite` (B2-P002) | **`matches-accepted`** | `infinite trouble` -> `endless trouble` at B08-P012 is word for word accepted B05-P018's rendering. The other rendering in the row is Book 2's, where B02-P002 keeps Butler's `infinite` because it is current English in its own context; that is Book 2's decision. |
| `lordly` | `lordly` (B2-P009) | **`kept`** | every entry Book 2 contributes is Butler's own `lordly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `marvelled` | `everyone marveled` (B2-P001) | **`UNRULED`** |  |
| `mycene` | `mycene` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `mycene` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `opening` | `that opened` (B2-P025) | **`UNRULED`** |  |
| `possessions` | `possessions` (B2-P027) | **`kept`** | every entry Book 2 contributes is Butler's own `possessions` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `presence` | `front` (B2-P011) | **`UNRULED`** |  |
| `rejoicing` | `to rejoice` (B2-P015) | **`UNRULED`** |  |
| `scheme` | `plan` (B2-P028) | **`UNRULED`** |  |
| `serve` | `serve` (B2-P004) | **`kept`** | every entry Book 2 contributes is Butler's own `serve` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wondered` | `wondered` (B2-P009) | **`kept`** | every entry Book 2 contributes is Butler's own `wondered` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW B — one rendering, two or more Butler words, across Books

66 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `account` | `shall reckon` (B2-P008) | **`UNRULED`** |  |
| `after` | `after` (B2-P010), `after` (B2-P011), `after` (B2-P019), `after` (B2-P025), `after` (B2-P026), `after` (B2-P034), `assented whereon` (B2-P007) | **`common-rendering`** | `after` is a word Butler himself uses in 38 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `agreed` | `assented whereon` (B2-P007) | **`UNRULED`** |  |
| `among` | `among` (B2-P004), `among` (B2-P009), `among` (B2-P019), `among` (B2-P021), `among` (B2-P027), `amongst` (B2-P024) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `anger` | `anger` (B2-P011), `wrath` (B2-P004) | **`UNRULED`** |  |
| `being` | `being` (B2-P004) | **`kept`** | every entry Book 2 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `beside` | `beside` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B2-P025), `called` (B2-P031), `convened` (B2-P004) | **`common-rendering`** | `called` is a word Butler himself uses in 13 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `charge` | `charge` (B2-P013), `charge` (B2-P025) | **`kept`** | every entry Book 2 contributes is Butler's own `charge` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cross` | `cross` (B2-P034) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `eating` | `continue to eat` (B2-P011), `eating` (B2-P004), `eating` (B2-P007) | **`UNRULED`** |  |
| `enough` | `enough` (B2-P011), `enough` (B2-P021) | **`kept`** | every entry Book 2 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `everlasting` | `everlasting` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `everlasting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `fairly` | `equitably` (B2-P014) | **`UNRULED`** |  |
| `front` | `the presence` (B2-P011) | **`UNRULED`** |  |
| `going` | `going` (B2-P010), `going` (B2-P019), `going` (B2-P021), `going` (B2-P023), `going` (B2-P026), `going` (B2-P034), `prating` (B2-P011) | **`common-rendering`** | `going` is a word Butler himself uses in 25 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `great` | `great` (B2-P004), `great` (B2-P006), `great` (B2-P007), `great` (B2-P015) | **`kept`** | every entry Book 2 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `guide` | `direct` (B2-P012) | **`UNRULED`** |  |
| `handed` | `singlehanded` (B2-P004) | **`UNRULED`** |  |
| `harshly` | `rigorously` (B2-P008) | **`UNRULED`** |  |
| `heads` | `fuddle them` (B2-P031), `heads` (B2-P014) | **`UNRULED`** |  |
| `herald` | `herald` (B2-P004) | **`kept`** | every entry Book 2 contributes is Butler's own `herald` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `himself` | `himself` (B2-P015) | **`kept`** | every entry Book 2 contributes is Butler's own `himself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `housekeeper` | `house keeper` (B2-P025) | **`variant`** | every rendering in the row reduces to `housekeeper` once inflection, D9 spelling and D15 compound spacing are normalized |
| `husband` | `husband` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `keeping` | `keeping` (B2-P011), `keeping` (B2-P026) | **`kept`** | every entry Book 2 contributes is Butler's own `keeping` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leather` | `leathern` (B2-P019), `leathern` (B2-P026) | **`UNRULED`** |  |
| `leave` | `leave` (B2-P004), `leave` (B2-P008) | **`kept`** | every entry Book 2 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `marveled` | `all marvelled` (B2-P001) | **`UNRULED`** |  |
| `matter` | `matter` (B2-P003), `matter` (B2-P004) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B2-P022) | **`kept`** | every entry Book 2 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `morning` | `morning` (B2-P001) | **`kept`** | every entry Book 2 contributes is Butler's own `morning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `offense` | `offence` (B2-P008) | **`UNRULED`** |  |
| `opened` | `opening` (B2-P025) | **`variant`** | every rendering in the row reduces to `open` once inflection, D9 spelling and D15 compound spacing are normalized |
| `others` | `others` (B2-P022), `others` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `people` | `people` (B2-P001), `people` (B2-P009), `people` (B2-P012), `people` (B2-P015), `people` (B2-P021), `people` (B2-P027) | **`kept`** | every entry Book 2 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `plainly` (B2-P009), `plainly` (B2-P013) | **`kept`** | every entry Book 2 contributes is Butler's own `plainly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `property` | `property` (B2-P021), `property` (B2-P024) | **`kept`** | every entry Book 2 contributes is Butler's own `property` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `rejoice` | `for rejoicing` (B2-P015) | **`UNRULED`** |  |
| `search` | `quest` (B2-P012), `search` (B2-P018) | **`UNRULED`** |  |
| `settle` | `shall reckon` (B2-P008) | **`UNRULED`** |  |
| `single` | `singlehanded` (B2-P004) | **`UNRULED`** |  |
| `sitting` | `sitting` (B2-P031) | **`kept`** | every entry Book 2 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B2-P011), `something` (B2-P012), `something` (B2-P015) | **`kept`** | every entry Book 2 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `somewhere` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `somewhere` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `strength` | `score` (B2-P007) | **`UNRULED`** |  |
| `suppose` | `suppose` (B2-P011), `suppose` (B2-P023) | **`kept`** | every entry Book 2 contributes is Butler's own `suppose` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `talked` | `talked` (B2-P025) | **`unavoidable-merge`** | `talked` carries Butler's `converse` (B04-P052, B07-P028) and his own `talked` (B02-P025). `converse` as an intransitive verb is archaic and `talk` is its only plain modern equivalent; the alternative is a register difference Butler does not make. B07-P028 matches accepted B04-P052 word for word, which is the consistency the package asks for. |
| `their` | `fuddle them` (B2-P031), `their` (B2-P002), `their` (B2-P004), `their` (B2-P009), `their` (B2-P010), `their` (B2-P014), `their` (B2-P019), `their` (B2-P031), `their` (B2-P032), `their` (B2-P034) | **`common-rendering`** | `their` is a word Butler himself uses in 92 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `there` | `there` (B2-P003), `there` (B2-P004), `there` (B2-P006), `there` (B2-P008), `there` (B2-P014), `there` (B2-P015), `there` (B2-P019), `there` (B2-P025) | **`kept`** | every entry Book 2 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B2-P019) | **`kept`** | every entry Book 2 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `thought` | `thought` (B2-P004), `thought` (B2-P019) | **`kept`** | every entry Book 2 contributes is Butler's own `thought` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `together` (B2-P001), `together` (B2-P026), `together` (B2-P033) | **`kept`** | every entry Book 2 contributes is Butler's own `together` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `until` | `until` (B2-P003) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `waste` | `waste` (B2-P012) | **`kept`** | every entry Book 2 contributes is Butler's own `waste` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `water` | `water` (B2-P030), `water` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `where` | `where` (B2-P015), `where` (B2-P023), `where` (B2-P025), `where` (B2-P027) | **`kept`** | every entry Book 2 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `which` (B2-P011), `which` (B2-P014), `which` (B2-P015), `which` (B2-P019), `which` (B2-P030) | **`kept`** | every entry Book 2 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wickedness` | `naughtiness` (B2-P014), `wickedness` (B2-P010) | **`UNRULED`** |  |
| `without` | `without` (B2-P006), `without` (B2-P010), `without` (B2-P011), `without` (B2-P014), `without` (B2-P019), `without` (B2-P028) | **`kept`** | every entry Book 2 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B2-P006), `woman` (B2-P007), `woman` (B2-P029) | **`kept`** | every entry Book 2 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `worked` | `worked` (B2-P002) | **`kept`** | every entry Book 2 contributes is Butler's own `worked` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `working` | `working` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `working` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `young` | `young` (B2-P003), `young` (B2-P011), `youngster` (B2-P023) | **`common-rendering`** | `young` is a word Butler himself uses in 29 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

10 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `call` | `called them` (B2-P001) | **`UNRULED`** |  |
| `made` | `called them` (B2-P001) | **`common-word`** | `made` is an ordinary word Butler uses in 64 paragraphs and the two uses share no referent |
| `speak` | `his speech` (B2-P002) | **`common-word`** | `speak` is an ordinary word Butler uses in 21 paragraphs and the two uses share no referent |
| `far` | `much` (B2-P011) | **`common-word`** | `far` is an ordinary word Butler uses in 28 paragraphs and the two uses share no referent |
| `give` | `make` (B2-P012) | **`common-word`** | `give` is an ordinary word Butler uses in 35 paragraphs and the two uses share no referent |
| `home` | `return` (B2-P012) | **`common-word`** | `home` is an ordinary word Butler uses in 85 paragraphs and the two uses share no referent |
| `never` | `will not return` (B2-P014) | **`common-word`** | `never` is an ordinary word Butler uses in 33 paragraphs and the two uses share no referent |
| `round` | `beat` (B2-P019) | **`common-word`** | `round` is an ordinary word Butler uses in 34 paragraphs and the two uses share no referent |
| `now` | `henceforward` (B2-P019) | **`common-word`** | `now` is an ordinary word Butler uses in 81 paragraphs and the two uses share no referent |
| `made` | `caused` (B2-P031) | **`common-word`** | `made` is an ordinary word Butler uses in 64 paragraphs and the two uses share no referent |

