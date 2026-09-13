# Odyssey Book 3 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**121 rows touch Book 3.**

| disposition | rows |
|---|---|
| `UNRULED` | 27 |
| `artifact` | 1 |
| `common-rendering` | 5 |
| `common-word` | 13 |
| `homograph` | 1 |
| `kept` | 62 |
| `matches-accepted` | 1 |
| `phrase-not-word` | 1 |
| `unavoidable-merge` | 3 |
| `variant` | 7 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

25 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `accept` | `accept` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `accept` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `begin` | `start` (B3-P003) | **`UNRULED`** |  |
| `counselled` | `ago decreed` (B3-P021), `decreed` (B3-P023), `decreed` (B3-P024) | **`UNRULED`** |  |
| `decorated` | `decorated` (B3-P023) | **`kept`** | every entry Book 3 contributes is Butler's own `decorated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `firmament` | `vault` (B3-P001) | **`UNRULED`** |  |
| `fleetest` | `fastest` (B3-P029) | **`UNRULED`** |  |
| `flower` | `flower` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `flower` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `havoc` | `havoc` (B3-P018) | **`kept`** | every entry Book 3 contributes is Butler's own `havoc` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `hecatomb` | `fine sacrifice` (B3-P007) | **`UNRULED`** |  |
| `hereabouts` | `in those parts` (B3-P024) | **`UNRULED`** |  |
| `insolence` | `insolence` (B3-P017) | **`kept`** | every entry Book 3 contributes is Butler's own `insolence` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `issue` | `outcome` (B3-P007) | **`homograph`** | **Not a collision.** Butler's `issue` is *outcome* at B03-P007 and *offspring* at B07-P007 — two words spelled alike. Both uses are archaic and both had to move, in different directions because they are different words. `without a son` is exact: Rhexenor left a daughter and no son. Upheld at findings-v1 \u00a75.2, and this is the class that gets a name here so the next `state`, `will`, `fair` or `want` does not cost a reviewer the same work from scratch. |
| `longing` | `longing` (B3-P015) | **`variant`** | every rendering in the row reduces to `long` once inflection, D9 spelling and D15 compound spacing are normalized |
| `mantle` | `fine cloak` (B3-P036) | **`matches-accepted`** | `mantle` -> `cloak` at B08-P007 is accepted B04-P013's rendering. B03-P036's `fine cloak` is the same rendering with Butler's own adjective attached. |
| `marvelled` | `everyone marveled` (B3-P030) | **`UNRULED`** |  |
| `mycene` | `mycenae` (B3-P024) | **`UNRULED`** |  |
| `peoples` | `that` (B3-P025) | **`UNRULED`** |  |
| `prevail` | `prevail` (B3-P014) | **`kept`** | every entry Book 3 contributes is Butler's own `prevail` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `protected` | `sheltered` (B3-P024) | **`UNRULED`** |  |
| `scheme` | `scheme` (B3-P023) | **`kept`** | every entry Book 3 contributes is Butler's own `scheme` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `seated` | `seated` (B3-P005) | **`kept`** | every entry Book 3 contributes is Butler's own `seated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `singularly` | `remarkably swift` (B3-P012) | **`UNRULED`** |  |
| `smart` | `smart` (B3-P016) | **`kept`** | every entry Book 3 contributes is Butler's own `smart` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `stratagem` | `stratagem` (B3-P012) | **`kept`** | every entry Book 3 contributes is Butler's own `stratagem` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `travel` | `travel` (B3-P025), `traveled` (B3-P037) | **`variant`** | every rendering in the row reduces to `travel` once inflection, D9 spelling and D15 compound spacing are normalized |

## ARROW B — one rendering, two or more Butler words, across Books

79 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B3-P018), `after` (B3-P023), `after` (B3-P024), `after` (B3-P027), `after` (B3-P028), `thereafter also` (B3-P007) | **`common-rendering`** | `after` is a word Butler himself uses in 38 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `among` | `among` (B3-P011), `among` (B3-P015), `among` (B3-P021), `among` (B3-P024), `among` (B3-P025), `among` (B3-P029), `among` (B3-P030) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `anger` | `anger` (B3-P014), `anger` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `anger` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `appease` | `appease` (B3-P014) | **`artifact`** | Butler's `as an offering and propitiation for the gods` became `as an offering to appease the gods`. `propitiation` is a noun and `appease` a verb; the diff paired the spans across the recast. |
| `arrows` | `shafts` (B3-P024) | **`UNRULED`** |  |
| `being` | `harassed` (B3-P011) | **`common-rendering`** | `being` is a word Butler himself uses in 12 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `beside` | `beside` (B3-P037) | **`kept`** | every entry Book 3 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B3-P014), `called` (B3-P024) | **`kept`** | every entry Book 3 contributes is Butler's own `called` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B3-P023), `carried` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `charge` | `charge` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `charge` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B3-P030) | **`kept`** | every entry Book 3 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `fair mantle` (B3-P036) | **`common-rendering`** | `cloak` is a word Butler himself uses in 10 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `company` | `company` (B3-P011), `guild` (B3-P001) | **`UNRULED`** |  |
| `cross` | `cross` (B3-P025) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `dangerous` | `dangerous` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `dangerous` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `decreed` | `counselled` (B3-P023), `counselled` (B3-P024), `since counselled` (B3-P021) | **`UNRULED`** |  |
| `eating` | `eating` (B3-P001) | **`kept`** | every entry Book 3 contributes is Butler's own `eating` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B3-P008), `enough` (B3-P023), `enough` (B3-P036) | **`kept`** | every entry Book 3 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `flattery` | `flattery` (B3-P022) | **`kept`** | every entry Book 3 contributes is Butler's own `flattery` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forward` | `forward` (B3-P015), `forward` (B3-P024), `forward` (B3-P037) | **`variant`** | every rendering in the row reduces to `forward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `friendship` | `friendship` (B3-P029) | **`kept`** | every entry Book 3 contributes is Butler's own `friendship` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `front` | `front` (B3-P032) | **`kept`** | every entry Book 3 contributes is Butler's own `front` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B3-P027), `going` (B3-P030) | **`kept`** | every entry Book 3 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B3-P012), `great` (B3-P018), `great` (B3-P022), `great` (B3-P024), `great` (B3-P030), `great` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `handed` | `handed` (B3-P007), `handed` (B3-P008), `handed` (B3-P018), `handed` (B3-P027) | **`kept`** | every entry Book 3 contributes is Butler's own `handed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `headland` | `headland` (B3-P015), `headland` (B3-P024) | **`kept`** | every entry Book 3 contributes is Butler's own `headland` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `heads` | `heads` (B3-P024) | **`kept`** | every entry Book 3 contributes is Butler's own `heads` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `himself` | `himself` (B3-P010), `himself` (B3-P021), `himself` (B3-P031) | **`kept`** | every entry Book 3 contributes is Butler's own `himself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `holding` | `holding` (B3-P003) | **`kept`** | every entry Book 3 contributes is Butler's own `holding` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `housekeeper` | `housekeeper` (B3-P031), `housekeeper` (B3-P037) | **`variant`** | every rendering in the row reduces to `housekeeper` once inflection, D9 spelling and D15 compound spacing are normalized |
| `hurried` | `hurried` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `hurried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `inner` | `inner` (B3-P031), `inward` (B3-P001), `inward` (B3-P005), `inward` (B3-P035) | **`UNRULED`** |  |
| `keeping` | `keeping` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `keeping` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `leave` (B3-P016), `leave` (B3-P025), `leave` (B3-P028) | **`kept`** | every entry Book 3 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lives` | `lives` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `lives` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lying` | `lying` (B3-P005) | **`kept`** | every entry Book 3 contributes is Butler's own `lying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `marveled` | `all marvelled` (B3-P030) | **`UNRULED`** |  |
| `matter` | `matter` (B3-P007), `matter` (B3-P011) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B3-P024), `meanwhile` (B3-P036) | **`kept`** | every entry Book 3 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `morning` | `morning` (B3-P015), `morning` (B3-P032), `morning` (B3-P037) | **`kept`** | every entry Book 3 contributes is Butler's own `morning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `others` | `others` (B3-P016), `others` (B3-P031) | **`kept`** | every entry Book 3 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `people` | `people` (B3-P001), `people` (B3-P003), `people` (B3-P005), `people` (B3-P007), `people` (B3-P012), `people` (B3-P014), `people` (B3-P024), `people` (B3-P025), `people` (B3-P026) | **`kept`** | every entry Book 3 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `in all plainness` (B3-P011) | **`UNRULED`** |  |
| `plotting` | `plotted` (B3-P024), `plotting` (B3-P017) | **`variant`** | every rendering in the row reduces to `plott` once inflection, D9 spelling and D15 compound spacing are normalized |
| `prayer` | `prayer` (B3-P006), `prayer` (B3-P031), `prayer` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `prayer` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `property` | `property` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `property` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quick` | `quick` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `quick` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quickly` | `quickly` (B3-P005), `quickly` (B3-P020) | **`kept`** | every entry Book 3 contributes is Butler's own `quickly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `rested` | `rested` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `rested` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sacrifice` | `goodly hecatomb` (B3-P007), `sacrifice` (B3-P001), `sacrifice` (B3-P030), `sacrifice` (B3-P034) | **`UNRULED`** |  |
| `scheme` | `scheme` (B3-P023) | **`kept`** | every entry Book 3 contributes is Butler's own `scheme` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `scoundrels` | `scoundrels` (B3-P018) | **`kept`** | every entry Book 3 contributes is Butler's own `scoundrels` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sheltered` | `protected` (B3-P024) | **`UNRULED`** |  |
| `showed` | `manifested` (B3-P033), `shewed` (B3-P030) | **`UNRULED`** |  |
| `since` | `since` (B3-P016), `since` (B3-P030) | **`kept`** | every entry Book 3 contributes is Butler's own `since` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `single` | `single` (B3-P018) | **`kept`** | every entry Book 3 contributes is Butler's own `single` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B3-P005) | **`kept`** | every entry Book 3 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B3-P021) | **`kept`** | every entry Book 3 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `elsewhither` (B3-P021) | **`UNRULED`** |  |
| `start` | `begin` (B3-P003), `start` (B3-P036) | **`UNRULED`** |  |
| `their` | `their` (B3-P001), `their` (B3-P005), `their` (B3-P009), `their` (B3-P014), `their` (B3-P015), `their` (B3-P018), `their` (B3-P027), `their` (B3-P031), `their` (B3-P032), `their` (B3-P034), `their` (B3-P035), `their` (B3-P036), `their` (B3-P037) | **`kept`** | every entry Book 3 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `there` (B3-P001), `there` (B3-P005), `there` (B3-P012), `there` (B3-P020), `there` (B3-P021), `there` (B3-P022), `there` (B3-P023), `there` (B3-P024), `there` (B3-P029), `there` (B3-P031) | **`kept`** | every entry Book 3 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `hereabouts` (B3-P024), `those` (B3-P030) | **`common-rendering`** | `those` is a word Butler himself uses in 24 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `thought` | `thought` (B3-P007), `thought` (B3-P014) | **`kept`** | every entry Book 3 contributes is Butler's own `thought` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `together` (B3-P014) | **`kept`** | every entry Book 3 contributes is Butler's own `together` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `traveler` | `traveller` (B3-P011) | **`unavoidable-merge`** | **O-7, declined, and the reason is that the proposed repair does not repair anything.** `wayfarer` -> `traveler` at B07-P018 does land on the rendering of Butler's `traveller` at accepted B03-P011 and B04-P027. But O-7 offers `lone traveler` to keep the solitary sense without the merge, and the candidate **already writes `solitary traveler`** — the same repair in a different word, with the merge untouched either way, because `traveler` is the only plain modern equivalent of `wayfarer`. |
| `treachery` | `treachery` (B3-P020) | **`kept`** | every entry Book 3 contributes is Butler's own `treachery` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `until` | `until` (B3-P004) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `watched` | `beheld it` (B3-P030) | **`UNRULED`** |  |
| `water` | `water` (B3-P015), `water` (B3-P027), `water` (B3-P033), `water` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `where` | `whence` (B3-P011), `where` (B3-P002), `where` (B3-P005), `where` (B3-P015), `where` (B3-P024), `where` (B3-P025), `where` (B3-P029), `where` (B3-P033), `where` (B3-P037) | **`common-rendering`** | `where` is a word Butler himself uses in 58 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `which` | `which` (B3-P015), `which` (B3-P023), `which` (B3-P024), `which` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wickedness` | `wickedness` (B3-P022) | **`kept`** | every entry Book 3 contributes is Butler's own `wickedness` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `without` | `without` (B3-P006), `without` (B3-P016) | **`kept`** | every entry Book 3 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B3-P022) | **`kept`** | every entry Book 3 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `worked` | `worked` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `worked` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wrapped` | `wrapped` (B3-P035) | **`unavoidable-merge`** | `wrapped` carries Butler's `enveloped` (B05-P030, B07-P012) and his own `wrapped` (B03-P035). `envelop` is not plain modern English of a mist, `wrap` is, and the two Books render it identically, which is the consistency the package asks for. |
| `young` | `young` (B3-P016), `young` (B3-P029), `young` (B3-P030), `young` (B3-P035) | **`kept`** | every entry Book 3 contributes is Butler's own `young` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

17 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `among` | `amid` (B3-P011) | **`common-word`** | `among` is an ordinary word Butler uses in 47 paragraphs and the two uses share no referent |
| `tell` | `certify` (B3-P011) | **`common-word`** | `tell` is an ordinary word Butler uses in 56 paragraphs and the two uses share no referent |
| `great` | `much` (B3-P012) | **`common-word`** | `great` is an ordinary word Butler uses in 54 paragraphs and the two uses share no referent |
| `made` | `offered hecatombs` (B3-P014) | **`common-word`** | `made` is an ordinary word Butler uses in 64 paragraphs and the two uses share no referent |
| `came` | `returned` (B3-P016) | **`common-word`** | `came` is an ordinary word Butler uses in 54 paragraphs and the two uses share no referent |
| `home` | `returned` (B3-P016) | **`common-word`** | `home` is an ordinary word Butler uses in 85 paragraphs and the two uses share no referent |
| `else` | `elsewhither` (B3-P021) | **`UNRULED`** |  |
| `from` | `off` (B3-P025) | **`common-word`** | `from` is an ordinary word Butler uses in 131 paragraphs and the two uses share no referent |
| `man` | `person` (B3-P025) | **`common-word`** | `man` is an ordinary word Butler uses in 86 paragraphs and the two uses share no referent |
| `good` | `pleased` (B3-P029) | **`common-word`** | `good` is an ordinary word Butler uses in 71 paragraphs and the two uses share no referent |
| `said` | `thus spoken` (B3-P030) | **`common-word`** | `said` is an ordinary word Butler uses in 128 paragraphs and the two uses share no referent |
| `house` | `abode` (B3-P031) | **`common-word`** | `house` is an ordinary word Butler uses in 89 paragraphs and the two uses share no referent |
| `him` | `by his side` (B3-P031) | **`common-word`** | `him` is an ordinary word Butler uses in 157 paragraphs and the two uses share no referent |
| `each` | `he was minded` (B3-P031) | **`UNRULED`** |  |
| `prayed` | `pray` (B3-P031) | **`UNRULED`** |  |
| `tell` | `shall bid` (B3-P033) | **`common-word`** | `tell` is an ordinary word Butler uses in 56 paragraphs and the two uses share no referent |
| `horses` | `steeds take` (B3-P037) | **`UNRULED`** |  |

