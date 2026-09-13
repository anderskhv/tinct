# Odyssey Book 4 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**133 rows touch Book 4.**

| disposition | rows |
|---|---|
| `UNRULED` | 30 |
| `artifact` | 2 |
| `common-rendering` | 9 |
| `common-word` | 7 |
| `homograph` | 1 |
| `kept` | 70 |
| `matches-accepted` | 2 |
| `same-referent` | 1 |
| `unavoidable-merge` | 4 |
| `variant` | 7 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

33 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `ambuscade` | `ambush` (B4-P044), `lying in wait there` (B4-P037) | **`matches-accepted`** | `ambuscade` -> `ambush` at B08-P046 is word for word accepted B04-P044's rendering of the same Butler word. The third rendering in the row, `lying in wait there` at B04-P037, is Book 4's phrase-level recast, where `ambuscade` has no word rendering at all. |
| `begin` | `start a conversation` (B4-P014) | **`UNRULED`** |  |
| `behaving` | `behaving` (B4-P053) | **`kept`** | every entry Book 4 contributes is Butler's own `behaving` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `bottom` | `bottom` (B4-P032), `bottom` (B4-P037) | **`kept`** | every entry Book 4 contributes is Butler's own `bottom` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `compassion` | `compassion` (B4-P077) | **`kept`** | every entry Book 4 contributes is Butler's own `compassion` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `conducted` | `conducted` (B4-P024) | **`kept`** | every entry Book 4 contributes is Butler's own `conducted` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `detaining` | `keeping` (B4-P050) | **`UNRULED`** |  |
| `distaff` | `distaff` (B4-P011) | **`kept`** | every entry Book 4 contributes is Butler's own `distaff` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `dwells` | `lives` (B4-P047) | **`UNRULED`** |  |
| `forth` | `forth` (B4-P035) | **`kept`** | every entry Book 4 contributes is Butler's own `forth` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `girded` | `slung` (B4-P025) | **`UNRULED`** |  |
| `hereabouts` | `near here` (B4-P032) | **`UNRULED`** |  |
| `inherit` | `inherit` (B4-P066) | **`kept`** | every entry Book 4 contributes is Butler's own `inherit` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `insolence` | `insolence` (B4-P053) | **`kept`** | every entry Book 4 contributes is Butler's own `insolence` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `laying` | `laying` (B4-P060) | **`kept`** | every entry Book 4 contributes is Butler's own `laying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `living` | `living` (B4-P009) | **`kept`** | every entry Book 4 contributes is Butler's own `living` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `mantle` | `cloak` (B4-P013) | **`matches-accepted`** | `mantle` -> `cloak` at B08-P007 is accepted B04-P013's rendering. B03-P036's `fine cloak` is the same rendering with Butler's own adjective attached. |
| `meantime` | `meantime` (B4-P081) | **`kept`** | every entry Book 4 contributes is Butler's own `meantime` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `offended` | `offended` (B4-P031) | **`kept`** | every entry Book 4 contributes is Butler's own `offended` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `opening` | `start a conversation` (B4-P014) | **`UNRULED`** |  |
| `prepared` | `prepared` (B4-P044) | **`kept`** | every entry Book 4 contributes is Butler's own `prepared` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `prevented` | `prevented` (B4-P015) | **`kept`** | every entry Book 4 contributes is Butler's own `prevented` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `protected` | `protected` (B4-P043) | **`kept`** | every entry Book 4 contributes is Butler's own `protected` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `refreshed` | `refreshed` (B4-P080) | **`kept`** | every entry Book 4 contributes is Butler's own `refreshed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `remained` | `remained` (B4-P042) | **`artifact`** | Butler's `who as long as he remained with her had taken as good care of him` became `who for as long as he was with her` — a phrase-level recast made to keep `stayed` free for Butler's own `staid`/`stayed` (B03-P015, B04-P009, B07-P022). The diff paired `remained` with `was`; there is no rendering pair to rule on. |
| `riches` | `riches` (B4-P009) | **`kept`** | every entry Book 4 contributes is Butler's own `riches` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `serve` | `serve` (B4-P020) | **`kept`** | every entry Book 4 contributes is Butler's own `serve` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `shrift` | `shrift` (B4-P028) | **`kept`** | every entry Book 4 contributes is Butler's own `shrift` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `singularly` | `remarkably swift` (B4-P017) | **`UNRULED`** |  |
| `sorely` | `sorely` (B4-P043) | **`kept`** | every entry Book 4 contributes is Butler's own `sorely` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `stratagem` | `scheme` (B4-P033) | **`UNRULED`** |  |
| `toils` | `a net` (B4-P073) | **`UNRULED`** |  |
| `wherein` | `where` (B4-P022) | **`UNRULED`** |  |

## ARROW B — one rendering, two or more Butler words, across Books

89 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `account` | `account` (B4-P009), `account` (B4-P012), `account` (B4-P013) | **`kept`** | every entry Book 4 contributes is Butler's own `account` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `after` | `after` (B4-P001), `after` (B4-P008), `after` (B4-P018), `after` (B4-P021), `after` (B4-P030), `after` (B4-P037), `after` (B4-P043), `after` (B4-P048), `after` (B4-P066) | **`kept`** | every entry Book 4 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ambush` | `ambuscade` (B4-P044), `ambush` (B4-P034), `ambush` (B4-P081) | **`unavoidable-merge`** | `ambush` carries Butler's `ambuscade` and his own `ambush` (B04-P034, B04-P081). `ambuscade` is archaic and `ambush` is its only plain modern equivalent; both accepted Book 4 and Book 8 render it so. |
| `among` | `among` (B4-P009), `among` (B4-P014), `among` (B4-P021), `among` (B4-P035), `among` (B4-P038), `among` (B4-P041), `among` (B4-P042), `among` (B4-P053), `among` (B4-P076) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `anger` | `anger` (B4-P048), `anger` (B4-P057) | **`kept`** | every entry Book 4 contributes is Butler's own `anger` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `being` | `being` (B4-P009), `being` (B4-P027), `being` (B4-P039), `harassed` (B4-P027) | **`common-rendering`** | `being` is a word Butler himself uses in 12 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `beside` | `beside` (B4-P006) | **`kept`** | every entry Book 4 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `blessed` | `blessed` (B4-P018), `blessed` (B4-P023) | **`kept`** | every entry Book 4 contributes is Butler's own `blessed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `bondservants` | `bondsmen` (B4-P055) | **`artifact`** | Butler's `bondsmen` is rendered `bondservants` in BOTH accepted B04-P055 and B07-P019 — the row exists only because §8's reordering of `see my property once more` pulled `property` into the diff's span, so the two source sides read `bondsmen` and `property my bondsmen`. There is one rendering and it is consistent. |
| `bright` | `bright` (B4-P016) | **`kept`** | every entry Book 4 contributes is Butler's own `bright` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B4-P022), `called` (B4-P029), `called` (B4-P081) | **`kept`** | every entry Book 4 contributes is Butler's own `called` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B4-P042), `carried` (B4-P043), `carried` (B4-P071) | **`kept`** | every entry Book 4 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B4-P001), `children` (B4-P060), `offspring` (B4-P018) | **`common-rendering`** | `children` is a word Butler himself uses in 8 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `cloak` | `cloak` (B4-P010), `mantle` (B4-P013) | **`common-rendering`** | `cloak` is a word Butler himself uses in 10 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `content` | `content` (B4-P005), `contented` (B4-P050) | **`variant`** | every rendering in the row reduces to `content` once inflection, D9 spelling and D15 compound spacing are normalized |
| `conversation` | `begin opening up discourse` (B4-P014), `conversation` (B4-P050), `conversation` (B4-P079) | **`UNRULED`** |  |
| `courtyard` | `courtyard` (B4-P005) | **`same-referent`** | The M-1 repair. `courtyard` now carries Butler's own `courtyard` (accepted B04-P005) and his `precincts` (B07-P012) — and his `precincts` IS the courtyard: the next sentence has Odysseus going `straight through the court`. Using Butler's own word for the thing he is describing is what M-1 asked for, and it is what frees `walls` for the bronze. |
| `cross` | `cross` (B4-P054) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `dangerous` | `dangerous` (B4-P032) | **`kept`** | every entry Book 4 contributes is Butler's own `dangerous` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `decreed` | `decreed` (B4-P040) | **`kept`** | every entry Book 4 contributes is Butler's own `decreed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B4-P004), `enough` (B4-P008), `enough` (B4-P066), `enough` (B4-P077) | **`kept`** | every entry Book 4 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `finest` | `finest` (B4-P051) | **`kept`** | every entry Book 4 contributes is Butler's own `finest` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forth` | `forth` (B4-P035) | **`kept`** | every entry Book 4 contributes is Butler's own `forth` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forward` | `forward` (B4-P029) | **`variant`** | every rendering in the row reduces to `forward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `friendship` | `an intercourse` (B4-P015) | **`UNRULED`** |  |
| `front` | `front` (B4-P053) | **`kept`** | every entry Book 4 contributes is Butler's own `front` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `girls` | `hussies` (B4-P065) | **`UNRULED`** |  |
| `going` | `going` (B4-P032), `going` (B4-P061), `going` (B4-P071), `going` (B4-P076) | **`kept`** | every entry Book 4 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `granted` | `granted` (B4-P015), `vouchsafed` (B4-P001) | **`UNRULED`** |  |
| `great` | `great` (B4-P009), `great` (B4-P015), `great` (B4-P027), `great` (B4-P029), `great` (B4-P034), `great` (B4-P037), `great` (B4-P038), `great` (B4-P042), `great` (B4-P065), `great` (B4-P076), `great` (B4-P081) | **`kept`** | every entry Book 4 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `handed` | `handed` (B4-P008), `handed` (B4-P060) | **`kept`** | every entry Book 4 contributes is Butler's own `handed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `harshly` | `harshly` (B4-P060) | **`kept`** | every entry Book 4 contributes is Butler's own `harshly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `headland` | `foreland` (B4-P043) | **`UNRULED`** |  |
| `heads` | `heads` (B4-P017) | **`kept`** | every entry Book 4 contributes is Butler's own `heads` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `himself` | `himself` (B4-P021), `himself` (B4-P035), `himself` (B4-P038), `himself` (B4-P042), `himself` (B4-P043) | **`kept`** | every entry Book 4 contributes is Butler's own `himself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `hurrying` | `hurrying` (B4-P003) | **`kept`** | every entry Book 4 contributes is Butler's own `hurrying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `husband` | `husband` (B4-P011), `husband` (B4-P021), `husband` (B4-P065), `husband` (B4-P076) | **`kept`** | every entry Book 4 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `inner` | `inner` (B4-P024) | **`kept`** | every entry Book 4 contributes is Butler's own `inner` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `keeping` | `detaining` (B4-P050), `keeping` (B4-P047) | **`UNRULED`** |  |
| `laying` | `laying` (B4-P060) | **`kept`** | every entry Book 4 contributes is Butler's own `laying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leather` | `leather` (B4-P072) | **`kept`** | every entry Book 4 contributes is Butler's own `leather` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `leave` (B4-P009), `leave` (B4-P015), `leave` (B4-P050), `leave` (B4-P055), `leave` (B4-P057), `leave` (B4-P060), `leave` (B4-P062), `leave` (B4-P065), `leave` (B4-P067), `leave` (B4-P074), `leave` (B4-P076) | **`kept`** | every entry Book 4 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lives` | `dwells` (B4-P047), `lives` (B4-P032) | **`UNRULED`** |  |
| `loaded` | `charged` (B4-P011) | **`UNRULED`** |  |
| `lying` | `lying` (B4-P001), `lying` (B4-P022), `our ambuscade` (B4-P037) | **`UNRULED`** |  |
| `maids` | `maids` (B4-P024), `maids` (B4-P060), `maids` (B4-P064), `maids` (B4-P066), `maids` (B4-P067) | **`kept`** | every entry Book 4 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B4-P020), `matter` (B4-P046), `matter` (B4-P058), `matter` (B4-P065), `matter` (B4-P074) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B4-P037), `meanwhile` (B4-P053), `meanwhile` (B4-P069) | **`kept`** | every entry Book 4 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `morning` | `forenoon` (B4-P017), `morning` (B4-P017), `morning` (B4-P018), `morning` (B4-P025), `morning` (B4-P034), `morning` (B4-P037), `morning` (B4-P038), `morning` (B4-P048), `morning` (B4-P056) | **`common-rendering`** | `morning` is a word Butler himself uses in 18 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `others` | `others` (B4-P020), `others` (B4-P057), `others` (B4-P059) | **`kept`** | every entry Book 4 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ourselves` | `ourselves` (B4-P048) | **`variant`** | every rendering in the row reduces to `ourselv` once inflection, D9 spelling and D15 compound spacing are normalized |
| `people` | `people` (B4-P004), `people` (B4-P007), `people` (B4-P009), `people` (B4-P014), `people` (B4-P015), `people` (B4-P021), `people` (B4-P032), `people` (B4-P076) | **`kept`** | every entry Book 4 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `in all plainness` (B4-P027) | **`UNRULED`** |  |
| `playing` | `playing` (B4-P037), `playing` (B4-P057) | **`homograph`** | One spelling, two unrelated senses. `the playing that goes with it` at B08-P007 renders Butler's `minstrelsy`; his own `playing` elsewhere is children at play (B01-P008, B07-P023) and a flame playing about a tripod (B08-P040). No referent is shared. |
| `plotting` | `plotting` (B4-P060), `plotting` (B4-P061), `plotting` (B4-P076) | **`variant`** | every rendering in the row reduces to `plott` once inflection, D9 spelling and D15 compound spacing are normalized |
| `prayer` | `prayer` (B4-P069) | **`kept`** | every entry Book 4 contributes is Butler's own `prayer` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `pulling` | `pulling` (B4-P074) | **`variant`** | every rendering in the row reduces to `pull` once inflection, D9 spelling and D15 compound spacing are normalized |
| `quick` | `quick` (B4-P048) | **`kept`** | every entry Book 4 contributes is Butler's own `quick` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quickly` | `quickly` (B4-P040) | **`kept`** | every entry Book 4 contributes is Butler's own `quickly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `scheme` | `stratagem` (B4-P033) | **`UNRULED`** |  |
| `scoundrels` | `miscreants` (B4-P027) | **`UNRULED`** |  |
| `servant` | `menial` (B4-P021), `servant` (B4-P003), `servant` (B4-P006) | **`common-rendering`** | `servant` is a word Butler himself uses in 15 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `showed` | `displayed` (B4-P022) | **`UNRULED`** |  |
| `single` | `single` (B4-P020), `single` (B4-P021) | **`kept`** | every entry Book 4 contributes is Butler's own `single` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B4-P042), `sitting` (B4-P053), `sitting` (B4-P064) | **`kept`** | every entry Book 4 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B4-P037), `something` (B4-P061), `something` (B4-P076) | **`kept`** | every entry Book 4 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `somewhere` (B4-P055) | **`kept`** | every entry Book 4 contributes is Butler's own `somewhere` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `spears` | `spears` (B4-P053) | **`kept`** | every entry Book 4 contributes is Butler's own `spears` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `start` | `begin opening up discourse` (B4-P014) | **`UNRULED`** |  |
| `strength` | `strength` (B4-P035) | **`kept`** | every entry Book 4 contributes is Butler's own `strength` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `struck` | `smote` (B4-P048), `struck` (B4-P002) | **`UNRULED`** |  |
| `suppose` | `suppose` (B4-P015), `suppose` (B4-P076) | **`kept`** | every entry Book 4 contributes is Butler's own `suppose` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `talked` | `converse` (B4-P052) | **`unavoidable-merge`** | `talked` carries Butler's `converse` (B04-P052, B07-P028) and his own `talked` (B02-P025). `converse` as an intransitive verb is archaic and `talk` is its only plain modern equivalent; the alternative is a register difference Butler does not make. B07-P028 matches accepted B04-P052 word for word, which is the consistency the package asks for. |
| `their` | `their` (B4-P003), `their` (B4-P004), `their` (B4-P005), `their` (B4-P006), `their` (B4-P008), `their` (B4-P019), `their` (B4-P027), `their` (B4-P029), `their` (B4-P030), `their` (B4-P042), `their` (B4-P050), `their` (B4-P052), `their` (B4-P053), `their` (B4-P054), `their` (B4-P060), `their` (B4-P061), `their` (B4-P072), `their` (B4-P081) | **`kept`** | every entry Book 4 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `our ambuscade` (B4-P037), `there` (B4-P002), `there` (B4-P003), `there` (B4-P009), `there` (B4-P014), `there` (B4-P017), `there` (B4-P020), `there` (B4-P021), `there` (B4-P022), `there` (B4-P024), `there` (B4-P029), `there` (B4-P032), `there` (B4-P042), `there` (B4-P044), `there` (B4-P047), `there` (B4-P054), `there` (B4-P060), `there` (B4-P064), `there` (B4-P065), `there` (B4-P066), `there` (B4-P071), `there` (B4-P077), `there` (B4-P079), `there` (B4-P081) | **`common-rendering`** | `there` is a word Butler himself uses in 100 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `those` | `those` (B4-P009), `those` (B4-P017), `those` (B4-P042), `those` (B4-P056), `those` (B4-P065) | **`kept`** | every entry Book 4 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `thought` | `thought` (B4-P037), `thought` (B4-P055), `thought` (B4-P073) | **`kept`** | every entry Book 4 contributes is Butler's own `thought` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `converse` (B4-P052), `together` (B4-P053) | **`common-rendering`** | `together` is a word Butler himself uses in 14 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `traveler` | `traveller` (B4-P027) | **`unavoidable-merge`** | **O-7, declined, and the reason is that the proposed repair does not repair anything.** `wayfarer` -> `traveler` at B07-P018 does land on the rendering of Butler's `traveller` at accepted B03-P011 and B04-P027. But O-7 offers `lone traveler` to keep the solitary sense without the merge, and the candidate **already writes `solitary traveler`** — the same repair in a different word, with the merge untouched either way, because `traveler` is the only plain modern equivalent of `wayfarer`. |
| `treachery` | `perfidy` (B4-P009) | **`UNRULED`** |  |
| `waste` | `waste` (B4-P045), `waste` (B4-P060) | **`kept`** | every entry Book 4 contributes is Butler's own `waste` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `water` | `water` (B4-P006), `water` (B4-P018), `water` (B4-P019), `water` (B4-P029), `water` (B4-P034), `water` (B4-P035), `water` (B4-P038), `water` (B4-P042), `water` (B4-P048), `water` (B4-P072) | **`kept`** | every entry Book 4 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wealth` | `wealth` (B4-P009) | **`kept`** | every entry Book 4 contributes is Butler's own `wealth` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `where` | `where` (B4-P001), `where` (B4-P004), `where` (B4-P009), `where` (B4-P020), `where` (B4-P034), `where` (B4-P036), `where` (B4-P042), `where` (B4-P043), `where` (B4-P050), `where` (B4-P061), `where` (B4-P081), `wherein` (B4-P022) | **`common-rendering`** | `where` is a word Butler himself uses in 58 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `which` | `which` (B4-P008), `which` (B4-P011), `which` (B4-P021), `which` (B4-P024), `which` (B4-P029), `which` (B4-P031), `which` (B4-P033), `which` (B4-P035), `which` (B4-P037), `which` (B4-P038), `which` (B4-P039), `which` (B4-P042), `which` (B4-P043), `which` (B4-P047), `which` (B4-P048), `which` (B4-P051), `which` (B4-P060), `which` (B4-P074) | **`kept`** | every entry Book 4 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `without` | `bereft of` (B4-P073), `without` (B4-P009), `without` (B4-P014), `without` (B4-P028), `without` (B4-P029), `without` (B4-P030), `without` (B4-P033), `without` (B4-P055), `without` (B4-P062), `without` (B4-P065) | **`common-rendering`** | `without` is a word Butler himself uses in 32 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `woman` | `woman` (B4-P012), `woman` (B4-P020), `woman` (B4-P065) | **`kept`** | every entry Book 4 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `worked` | `worked` (B4-P009) | **`kept`** | every entry Book 4 contributes is Butler's own `worked` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `young` | `young` (B4-P012), `young` (B4-P014), `young` (B4-P028), `young` (B4-P055), `young` (B4-P056), `young` (B4-P058), `young` (B4-P064) | **`kept`** | every entry Book 4 contributes is Butler's own `young` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

11 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `now` | `henceforward` (B4-P004) | **`common-word`** | `now` is an ordinary word Butler uses in 81 paragraphs and the two uses share no referent |
| `beside` | `by the side of` (B4-P006) | **`UNRULED`** |  |
| `brought` | `fetched them` (B4-P006) | **`common-word`** | `brought` is an ordinary word Butler uses in 29 paragraphs and the two uses share no referent |
| `set` | `offered` (B4-P006) | **`common-word`** | `set` is an ordinary word Butler uses in 45 paragraphs and the two uses share no referent |
| `morning` | `forenoon` (B4-P017) | **`UNRULED`** |  |
| `man` | `person` (B4-P017) | **`common-word`** | `man` is an ordinary word Butler uses in 86 paragraphs and the two uses share no referent |
| `great` | `hecatombs` (B4-P029) | **`common-word`** | `great` is an ordinary word Butler uses in 54 paragraphs and the two uses share no referent |
| `wait` | `our ambuscade` (B4-P037) | **`UNRULED`** |  |
| `sacrifices` | `hecatombs` (B4-P040) | **`UNRULED`** |  |
| `from` | `henceforward` (B4-P060) | **`common-word`** | `from` is an ordinary word Butler uses in 131 paragraphs and the two uses share no referent |
| `tell` | `bid` (B4-P065) | **`common-word`** | `tell` is an ordinary word Butler uses in 56 paragraphs and the two uses share no referent |

