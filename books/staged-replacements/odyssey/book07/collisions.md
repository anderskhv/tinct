# Odyssey Book 7 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**83 rows touch Book 7.**

| disposition | rows |
|---|---|
| `artifact` | 2 |
| `common-rendering` | 5 |
| `common-word` | 1 |
| `homograph` | 1 |
| `kept` | 49 |
| `phrase-not-word` | 2 |
| `repair` | 9 |
| `same-referent` | 1 |
| `unavoidable-merge` | 2 |
| `variant` | 11 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

12 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `became` | `became` (B7-P012) | **`kept`** | every entry Book 7 contributes is Butler's own `became` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `closely` | `closely` (B7-P010) | **`kept`** | every entry Book 7 contributes is Butler's own `closely` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `depart` | `to leave` (B7-P022) | **`variant`** | every rendering in the row reduces to `leave` once inflection, D9 spelling and D15 compound spacing are normalized |
| `dwells` | `dwells` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `dwells` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `endowed` | `endowed` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `endowed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `faring` | `seafaring` (B7-P004) | **`artifact`** | Butler writes `sea-faring` with a hyphen and the tokenizer splits it, so `faring` is not a word either text uses. D15 closes it to `seafaring`, matching accepted B06-P021. There is no rendering pair. |
| `harbours` | `harbors their` (B7-P005) | **`variant`** | D9, `harbours` -> `harbors`. The trailing `their` in the row is the parallel possessive Butler dropped and B07-P005 restores, recorded in `continuity.md`; the diff attached it to the same span. |
| `issue` | `a son` (B7-P007) | **`homograph`** | **Not a collision.** Butler's `issue` is *outcome* at B03-P007 and *offspring* at B07-P007 — two words spelled alike. Both uses are archaic and both had to move, in different directions because they are different words. `without a son` is exact: Rhexenor left a daughter and no son. Upheld at findings-v1 \u00a75.2, and this is the class that gets a name here so the next `state`, `will`, `fair` or `want` does not cost a reviewer the same work from scratch. |
| `lighted` | `lighted` (B7-P010) | **`kept`** | every entry Book 7 contributes is Butler's own `lighted` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `luscious` | `luscious` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `luscious` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `rejoicing` | `rejoicing` (B7-P018) | **`kept`** | every entry Book 7 contributes is Butler's own `rejoicing` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `storm` | `storm` (B7-P022) | **`variant`** | every rendering in the row reduces to `storm` once inflection, D9 spelling and D15 compound spacing are normalized |

## ARROW B — one rendering, two or more Butler words, across Books

60 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B7-P017), `after` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `agreed` | `agreed` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `agreed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `among` | `among` (B7-P012), `among` (B7-P014), `among` (B7-P015), `among` (B7-P019), `among` (B7-P023), `among` (B7-P027) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `being` | `being` (B7-P011), `being` (B7-P025) | **`kept`** | every entry Book 7 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `called` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B7-P001), `carried` (B7-P011), `carried` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B7-P008) | **`kept`** | every entry Book 7 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `cloak` (B7-P012), `cloak` (B7-P020) | **`kept`** | every entry Book 7 contributes is Butler's own `cloak` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `clothing` | `clothing` (B7-P022) | **`kept`** | every entry Book 7 contributes is Butler's own `clothing` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `content` | `content` (B7-P019) | **`variant`** | every rendering in the row reduces to `content` once inflection, D9 spelling and D15 compound spacing are normalized |
| `enough` | `enough` (B7-P012) | **`kept`** | every entry Book 7 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forward` | `forwards` (B7-P010) | **`variant`** | every rendering in the row reduces to `forward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `front` | `front` (B7-P002) | **`kept`** | every entry Book 7 contributes is Butler's own `front` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B7-P012) | **`kept`** | every entry Book 7 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B7-P005), `great` (B7-P006), `great` (B7-P007), `great` (B7-P013), `great` (B7-P019), `great` (B7-P021), `great` (B7-P022) | **`kept`** | every entry Book 7 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `handed` | `handed` (B7-P017) | **`kept`** | every entry Book 7 contributes is Butler's own `handed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `himself` | `himself` (B7-P008), `himself` (B7-P018) | **`kept`** | every entry Book 7 contributes is Butler's own `himself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `housekeeper` | `housekeeper` (B7-P015) | **`variant`** | every rendering in the row reduces to `housekeeper` once inflection, D9 spelling and D15 compound spacing are normalized |
| `inner` | `inner` (B7-P029) | **`kept`** | every entry Book 7 contributes is Butler's own `inner` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `depart` (B7-P022) | **`common-rendering`** | `leave` is a word Butler himself uses in 20 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `lives` | `lives` (B7-P004), `lives` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `lives` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B7-P020), `maids` (B7-P024), `maids` (B7-P025), `maids` (B7-P028) | **`kept`** | every entry Book 7 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B7-P018), `matter` (B7-P019), `matter` (B7-P026) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `middle` | `midst` (B7-P005) | **`common-rendering`** | `middle` is a word Butler himself uses in 8 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `morning` | `morning` (B7-P018) | **`kept`** | every entry Book 7 contributes is Butler's own `morning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `others` | `others` (B7-P010), `others` (B7-P011), `others` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `ourselves` | `our selves` (B7-P018) | **`variant`** | every rendering in the row reduces to `ourselv` once inflection, D9 spelling and D15 compound spacing are normalized |
| `people` | `people` (B7-P001), `people` (B7-P004), `people` (B7-P006), `people` (B7-P008), `people` (B7-P012), `people` (B7-P018), `people` (B7-P023), `people` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `pillars` | `pillars` (B7-P009) | **`kept`** | every entry Book 7 contributes is Butler's own `pillars` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `plainly` (B7-P014) | **`kept`** | every entry Book 7 contributes is Butler's own `plainly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `property` | `property` (B7-P019) | **`kept`** | every entry Book 7 contributes is Butler's own `property` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `proud` | `proud` (B7-P002) | **`kept`** | every entry Book 7 contributes is Butler's own `proud` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `scold` | `scold` (B7-P025) | **`kept`** | every entry Book 7 contributes is Butler's own `scold` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `servant` | `servant` (B7-P001), `servant` (B7-P016) | **`kept`** | every entry Book 7 contributes is Butler's own `servant` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `settle` | `settle` (B7-P008) | **`kept`** | every entry Book 7 contributes is Butler's own `settle` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sheltered` | `sheltered` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `sheltered` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `since` | `inasmuch as` (B7-P020) | **`common-rendering`** | `since` is a word Butler himself uses in 8 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `single` | `single` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `single` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B7-P006), `sitting` (B7-P015), `sitting` (B7-P016) | **`kept`** | every entry Book 7 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `stayed` | `stayed` (B7-P022) | **`variant`** | every rendering in the row reduces to `stay` once inflection, D9 spelling and D15 compound spacing are normalized |
| `streams` | `streams` (B7-P011) | **`kept`** | every entry Book 7 contributes is Butler's own `streams` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `struck` | `struck` (B7-P021) | **`kept`** | every entry Book 7 contributes is Butler's own `struck` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `talked` | `converse` (B7-P028) | **`unavoidable-merge`** | `talked` carries Butler's `converse` (B04-P052, B07-P028) and his own `talked` (B02-P025). `converse` as an intransitive verb is archaic and `talk` is its only plain modern equivalent; the alternative is a register difference Butler does not make. B07-P028 matches accepted B04-P052 word for word, which is the consistency the package asks for. |
| `their` | `harbours` (B7-P005), `their` (B7-P005), `their` (B7-P007), `their` (B7-P008), `their` (B7-P010), `their` (B7-P011), `their` (B7-P012), `their` (B7-P014), `their` (B7-P017), `their` (B7-P018), `their` (B7-P020), `their` (B7-P028) | **`common-rendering`** | `their` is a word Butler himself uses in 77 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `there` | `there` (B7-P010), `there` (B7-P011), `there` (B7-P012), `there` (B7-P015), `there` (B7-P016), `there` (B7-P020), `there` (B7-P021), `there` (B7-P022), `there` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B7-P007), `those` (B7-P010), `those` (B7-P019), `those` (B7-P020), `those` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `thought` | `thought` (B7-P004), `thought` (B7-P025) | **`kept`** | every entry Book 7 contributes is Butler's own `thought` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `converse` (B7-P028), `together` (B7-P023) | **`common-rendering`** | `together` is a word Butler himself uses in 11 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `traveler` | `wayfarer` (B7-P018) | **`repair`** | **O-7.** `wayfarer` -> `traveler` at B07-P018 lands on the rendering of Butler's `traveller` at accepted B03-P011 and B04-P027. `wayfarer` is genuinely archaic and had to move; `lone traveler` keeps Butler's solitary sense without the merge. Applied in v2. |
| `trouble` | `trouble` (B7-P013), `trouble` (B7-P018), `trouble` (B7-P019), `trouble` (B7-P022) | **`kept`** | every entry Book 7 contributes is Butler's own `trouble` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `until` | `hitherto` (B7-P018) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `walls` | `precincts` (B7-P012), `walls` (B7-P005), `walls` (B7-P009) | **`repair`** | **M-1, and the row nobody ruled on.** `precincts` -> `walls` at B07-P012, three paragraphs from B07-P009's literal bronze walls and B07-P005's city walls. It is a sense change as well as a collision: `precincts` is the enclosure, and the next sentence has Odysseus going straight through the court, so `inside the walls of the house` puts him inside the building. Repaired in v2 to `inside the courtyard of the house`. |
| `water` | `water` (B7-P011), `water` (B7-P015), `water` (B7-P016), `water` (B7-P017), `water` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `whatever` | `whatever` (B7-P015) | **`variant`** | every rendering in the row reduces to `whatever` once inflection, D9 spelling and D15 compound spacing are normalized |
| `where` | `where` (B7-P001), `where` (B7-P009), `where` (B7-P021), `where` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `which` (B7-P005), `which` (B7-P010), `which` (B7-P011), `which` (B7-P012), `which` (B7-P021), `which` (B7-P022), `which` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `without` | `without` (B7-P007), `without` (B7-P018), `without` (B7-P026) | **`kept`** | every entry Book 7 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B7-P001), `woman` (B7-P006), `woman` (B7-P007), `woman` (B7-P008) | **`kept`** | every entry Book 7 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wrapped` | `enveloped` (B7-P012) | **`unavoidable-merge`** | `wrapped` carries Butler's `enveloped` (B05-P030, B07-P012) and his own `wrapped` (B03-P035). `envelop` is not plain modern English of a mist, `wrap` is, and the two Books render it identically, which is the consistency the package asks for. |
| `young` | `young` (B7-P010), `young` (B7-P023) | **`kept`** | every entry Book 7 contributes is Butler's own `young` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

11 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `son` | `male issue` (B7-P007) | **`same-referent`** | Butler's `issue` here IS the son — Rhexenor left a daughter and no son, which the same paragraph states. Using Butler's own `son` for his `male issue` is precision, not flattening. Upheld at \u00a75.2. |
| `house` | `abode` (B7-P009) | **`repair`** | **M-2.** Butler writes `the abode of Erechtheus` and, eleven words later, `the house of Alcinous`; the candidate writes `house` twice. This is the B06-P019 shape the drafter identified and repaired at B07-P021 and did not apply here. Repaired in v2 to `the home of Erechtheus` (and `his own home` at B07-P020, the same shape again). |
| `made` | `fashioned expressly` (B7-P010) | **`repair`** | **Unreported by round 1 — arrow C's own finding.** In one paragraph Butler writes that Hephaestus `fashioned` the mastiffs and that the women of the house `made` the hangings. The candidate writes `made` for both, and the distinction it loses is between a god's craft and household work, in the paragraph whose whole subject is the wonder of the palace. Repaired in v2 to `had fashioned specially`; `fashion` is current English and needed no change. |
| `men` | `persons` (B7-P010) | **`repair`** | **M-10.** `chief persons` -> `chief men`, against the candidate's own `chief people` two paragraphs later at B07-P012 rendering the same Butler phrase. In a Book whose argument turns on Arete it narrows a word Butler chose to be open. Repaired in v2 to `chief people`. |
| `never` | `nor` (B7-P011) | **`repair`** | Butler: `The fruits never rot nor fail all the year round`. The candidate writes `never rot and never fail`, doubling a word Butler used once and pointing a parallel he pointed with `nor`. Repaired in v2 to `never rot or fail`. |
| `tell` | `and bid` (B7-P015) | **`repair`** | **Unreported by round 1 — arrow C's own finding.** Echeneus says `tell him, then, to rise` and, in the same speech, `bid your servants mix some wine`. The candidate writes `tell` for both. `bid` is a command through an intermediary and `tell` is not. Repaired in v2 to `have your servants mix some wine`. |
| `now` | `hitherto` (B7-P018) | **`phrase-not-word`** | `until now` again — see (B, until). Butler's other `now` is the discourse adverb in `so now go home to bed`, a different clause and a different part of speech. |
| `nothing` | `itself` (B7-P019) | **`artifact`** | `dwell only on the due replenishing of itself` was recast to `think of nothing but being refilled`, a sound collision repair against accepted B04-P016's `filling`. The diff paired `itself` with `nothing` across the recast; Butler's other `nothing` is nine sentences away in `I have nothing of the immortal about me`. |
| `eat` | `sup` (B7-P019) | **`repair`** | **M-5.** `let me sup in spite of sorrow` and, thirty words later, Butler's own `that I shall eat and drink`. The candidate writes `eat` for both, at a supper, where `sup` is the meal in front of the speaker and not decoration. Repaired in v2 to `let me have my supper in spite of sorrow`. |
| `said` | `his saying` (B7-P020) | **`common-word`** | `Every one approved his saying` -> `Everyone approved what he said`, beside `so she said` in a different clause two sentences later. `said` is one of the commonest words in the corpus and the two uses share no referent. |
| `told` | `bade` (B7-P022) | **`repair`** | **Unreported by round 1 — arrow C's own finding, and the sharpest of the three.** Butler: `she bade me depart of her own free will, either because Jove had told her she must, or because she had changed her mind`. The sentence turns on the difference between Calypso's own bidding and Zeus's telling; the candidate writes `told` for both and flattens exactly the distinction the sentence exists to pose. Repaired in v2 to `she sent me on my way`. |

