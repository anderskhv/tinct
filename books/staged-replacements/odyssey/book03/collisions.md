# Odyssey Book 3 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**119 rows touch Book 3.**

| disposition | rows |
|---|---|
| `artifact` | 3 |
| `common-rendering` | 5 |
| `common-word` | 13 |
| `context-rendered` | 2 |
| `homograph` | 3 |
| `kept` | 60 |
| `kept-elsewhere` | 10 |
| `matches-accepted` | 3 |
| `phrase-not-word` | 2 |
| `same-referent` | 3 |
| `unavoidable-merge` | 6 |
| `variant` | 9 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

25 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `accept` | `accept` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `accept` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `counselled` | `ago decreed` (B3-P021), `decreed` (B3-P023), `decreed` (B3-P024) | **`artifact`** | There is ONE rendering here, `decreed`, in all three of B03-P021, B03-P023 and B03-P024. The row splits only because Butler's `long since counselled` became `long ago decreed` and the diff pulled `ago` into the span. See (3, B, `decreed`) for the merge itself. |
| `decorated` | `decorated` (B3-P023) | **`kept`** | every entry Book 3 contributes is Butler's own `decorated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `firmament` | `vault` (B3-P001) | **`context-rendered`** | `swooped down through the firmament` -> `sky` (B05-P005); `rising into the firmament of heaven` -> `vault of heaven` (B03-P001). `the sky of heaven` is not English and `swooped down through the vault` loses the motion. The collocation decides it, not a preference. |
| `fleetest` | `fastest` (B3-P029) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`fastest`); every other entry is Butler's own `fleetest` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `fleetest` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `flower` | `flower` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `flower` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `havoc` | `havoc` (B3-P018) | **`kept`** | every entry Book 3 contributes is Butler's own `havoc` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `hecatomb` | `fine sacrifice` (B3-P007) | **`same-referent`** | A hecatomb IS a sacrifice, so the rendering keeps Butler's referent and marks what would otherwise be lost — the scale — with an adjective: `great sacrifice` (B01-P003) and `fine sacrifice` (B03-P007, where `fine` is carrying Butler's own `goodly` and the scale word has nowhere to stand). **Accepted Book 4 was the one out of step**, rendering `holy hecatombs` as a bare `holy sacrifices` one sentence from Butler's own `sacrifices`; the successor `book04/candidate-v5.json` brings it into line. See the arrow C row (4, 40, `hecatombs`, `sacrifices`). |
| `hence` | `so` (B3-P013) | **`variant`** | `hence` in the inferential sense rendered `so` (B03-P013), against Book 9's spatial `sailed hence` rendered `sailed on from there`. Two senses of one obsolete-in-place adverb; both plain modern equivalents. |
| `hereabouts` | `in those parts` (B3-P024) | **`context-rendered`** | **Deixis, and the clearest case of this class in the package.** B03-P024 is Nestor narrating a coast far from where he stands — `there is a high headland in those parts`. B04-P032 is Eidothea, standing on that shore, pointing — `an old immortal who lives under the sea near here`. `near here` in Nestor's mouth moves Crete to Pylos; `in those parts` in Eidothea's empties her gesture. |
| `insolence` | `insolence` (B3-P017) | **`kept`** | every entry Book 3 contributes is Butler's own `insolence` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `issue` | `outcome` (B3-P007) | **`homograph`** | **Not a collision.** Butler's `issue` is *outcome* at B03-P007 and *offspring* at B07-P007 — two words spelled alike. Both uses are archaic and both had to move, in different directions because they are different words. `without a son` is exact: Rhexenor left a daughter and no son. Upheld at findings-v1 \u00a75.2, and this is the class that gets a name here so the next `state`, `will`, `fair` or `want` does not cost a reviewer the same work from scratch. |
| `longing` | `longing` (B3-P015) | **`variant`** | every rendering in the row reduces to `long` once inflection, D9 spelling and D15 compound spacing are normalized |
| `mantle` | `fine cloak` (B3-P036) | **`matches-accepted`** | `mantle` -> `cloak` at B08-P007 is accepted B04-P013's rendering. B03-P036's `fine cloak` is the same rendering with Butler's own adjective attached. |
| `marvelled` | `everyone marveled` (B3-P030) | **`matches-accepted`** | B02-P001 and B03-P030 render Butler's `all marvelled` identically as `everyone marveled` — his own word, D9-respelled, with `all` opened to `everyone`. One rendering in two Books. Book 1's third entry is a diff artifact of a different recast; see (1, A, `marvelled`). |
| `mycene` | `mycenae` (B3-P024) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`mycenae`); every other entry is Butler's own `mycene` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `mycene` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `peoples` | `that` (B3-P025) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`that`); every other entry is Butler's own `peoples` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `peoples` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `prevail` | `prevail` (B3-P014) | **`kept`** | every entry Book 3 contributes is Butler's own `prevail` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `protected` | `sheltered` (B3-P024) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`sheltered`); every other entry is Butler's own `protected` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `protected` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `rovers` | `raiders` (B3-P009) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`raiders`); every other entry is Butler's own `rovers` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `rovers` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `scheme` | `scheme` (B3-P023) | **`kept`** | every entry Book 3 contributes is Butler's own `scheme` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `seated` | `seated` (B3-P005) | **`kept`** | every entry Book 3 contributes is Butler's own `seated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `singularly` | `remarkably swift` (B3-P012) | **`matches-accepted`** | `singularly fleet of foot and in fight valiant` is Butler's epithet for Antilochus in both Books, and both render it `remarkably swift of foot and valiant in a fight` — identical, which is exactly the cross-Book consistency arrow A exists to check for. Book 8 keeps `singularly` in a different construction. |
| `smart` | `smart` (B3-P016) | **`kept`** | every entry Book 3 contributes is Butler's own `smart` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `travel` | `travel` (B3-P025), `traveled` (B3-P037) | **`variant`** | every rendering in the row reduces to `travel` once inflection, D9 spelling and D15 compound spacing are normalized |

## ARROW B — one rendering, two or more Butler words, across Books

77 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B3-P018), `after` (B3-P023), `after` (B3-P024), `after` (B3-P027), `after` (B3-P028), `thereafter also` (B3-P007) | **`common-rendering`** | `after` is a word Butler himself uses in 40 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `anger` | `anger` (B3-P014), `anger` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `anger` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `appease` | `appease` (B3-P014) | **`artifact`** | Butler's `as an offering and propitiation for the gods` became `as an offering to appease the gods`. `propitiation` is a noun and `appease` a verb; the diff paired the spans across the recast. |
| `arrows` | `shafts` (B3-P024) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`shafts`); every other entry is Butler's own `arrows` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `arrows` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `being` | `harassed` (B3-P011) | **`common-rendering`** | `being` is a word Butler himself uses in 15 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `beside` | `beside` (B3-P037) | **`kept`** | every entry Book 3 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B3-P014), `called` (B3-P024) | **`kept`** | every entry Book 3 contributes is Butler's own `called` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B3-P023), `carried` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `charge` | `charge` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `charge` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B3-P030) | **`kept`** | every entry Book 3 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `fair mantle` (B3-P036) | **`common-rendering`** | `cloak` is a word Butler himself uses in 10 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `company` | `company` (B3-P011), `guild` (B3-P001) | **`homograph`** | One spelling, two unrelated senses. `nine guilds with five hundred men in each` -> `nine companies` (B03-P001) is a body of men; `sacked the town of Troy in company with yourself` -> `in your company` (B03-P011) is accompaniment. No referent is shared. |
| `cross` | `cross` (B3-P025) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `dangerous` | `dangerous` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `dangerous` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `decreed` | `counselled` (B3-P023), `counselled` (B3-P024), `since counselled` (B3-P021) | **`unavoidable-merge`** | `decreed` carries Butler's `counselled` (B03-P021, B03-P023, B03-P024) and his own `decreed` (B04-P040, three times in Book 5). `counsel` used transitively of a god ordaining a death — `heaven had counselled her destruction` — is dead English, and `decreed` is what it means; Butler himself uses `decreed` for the identical act. |
| `eating` | `eating` (B3-P001) | **`kept`** | every entry Book 3 contributes is Butler's own `eating` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B3-P008), `enough` (B3-P023), `enough` (B3-P036) | **`kept`** | every entry Book 3 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `first` | `first` (B3-P005), `first` (B3-P007), `first` (B3-P012), `first` (B3-P015), `first` (B3-P023), `first` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `first` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `flattery` | `flattery` (B3-P022) | **`kept`** | every entry Book 3 contributes is Butler's own `flattery` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `forward` | `forward` (B3-P015), `forward` (B3-P024), `forward` (B3-P037) | **`variant`** | every rendering in the row reduces to `forward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `friendship` | `friendship` (B3-P029) | **`kept`** | every entry Book 3 contributes is Butler's own `friendship` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B3-P027), `going` (B3-P030) | **`kept`** | every entry Book 3 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B3-P012), `great` (B3-P018), `great` (B3-P022), `great` (B3-P024), `great` (B3-P030), `great` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `handed` | `handed` (B3-P007), `handed` (B3-P008), `handed` (B3-P018), `handed` (B3-P027) | **`kept`** | every entry Book 3 contributes is Butler's own `handed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `headland` | `headland` (B3-P015), `headland` (B3-P024) | **`kept`** | every entry Book 3 contributes is Butler's own `headland` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `heads` | `heads` (B3-P024) | **`kept`** | every entry Book 3 contributes is Butler's own `heads` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `holding` | `holding` (B3-P003) | **`kept`** | every entry Book 3 contributes is Butler's own `holding` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `housekeeper` | `housekeeper` (B3-P031), `housekeeper` (B3-P037) | **`variant`** | every rendering in the row reduces to `housekeeper` once inflection, D9 spelling and D15 compound spacing are normalized |
| `hurried` | `hurried` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `hurried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `inner` | `inner` (B3-P031), `inward` (B3-P001), `inward` (B3-P005), `inward` (B3-P035) | **`variant`** | `inward meats` -> `inner meats` at B03-P001, B03-P005 and B03-P035 — one rendering, three times, consistent — beside Butler's own `inner room` at B03-P031. `inward` and `inner` are one word in two forms. |
| `keeping` | `keeping` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `keeping` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `leave` (B3-P016), `leave` (B3-P025), `leave` (B3-P028) | **`kept`** | every entry Book 3 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lives` | `lives` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `lives` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lying` | `lying` (B3-P005) | **`kept`** | every entry Book 3 contributes is Butler's own `lying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B3-P033) | **`kept`** | every entry Book 3 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B3-P007), `matter` (B3-P011) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B3-P024), `meanwhile` (B3-P036) | **`kept`** | every entry Book 3 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `myself` | `myself` (B3-P003), `myself` (B3-P006), `myself` (B3-P007), `myself` (B3-P019), `myself` (B3-P028) | **`kept`** | every entry Book 3 contributes is Butler's own `myself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `others` | `others` (B3-P016), `others` (B3-P031) | **`kept`** | every entry Book 3 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `parts` | `hereabouts` (B3-P024) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`hereabouts`); every other entry is Butler's own `parts` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `parts` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `people` | `people` (B3-P001), `people` (B3-P003), `people` (B3-P005), `people` (B3-P007), `people` (B3-P012), `people` (B3-P014), `people` (B3-P024), `people` (B3-P025), `people` (B3-P026) | **`kept`** | every entry Book 3 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `places` | `places` (B3-P005), `places` (B3-P031) | **`kept`** | every entry Book 3 contributes is Butler's own `places` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `in all plainness` (B3-P011) | **`unavoidable-merge`** | `tell me in all plainness exactly what you saw` -> `tell me plainly and exactly`, identical in both accepted Books, beside Butler's own `plainly` in Books 2 and 7. His `in all plainness` is an adverbial periphrasis for exactly the adverb he uses elsewhere; modern English has the adverb and not the periphrasis, so the merge is what modernizing this phrase means. |
| `plotting` | `plotted` (B3-P024), `plotting` (B3-P017) | **`variant`** | every rendering in the row reduces to `plott` once inflection, D9 spelling and D15 compound spacing are normalized |
| `prayer` | `prayer` (B3-P006), `prayer` (B3-P031), `prayer` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `prayer` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `property` | `property` (B3-P025) | **`kept`** | every entry Book 3 contributes is Butler's own `property` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quick` | `quick` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `quick` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quickly` | `quickly` (B3-P005), `quickly` (B3-P020) | **`kept`** | every entry Book 3 contributes is Butler's own `quickly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `rested` | `rested` (B3-P015) | **`kept`** | every entry Book 3 contributes is Butler's own `rested` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sacrifice` | `goodly hecatomb` (B3-P007), `sacrifice` (B3-P001), `sacrifice` (B3-P030), `sacrifice` (B3-P034) | **`same-referent`** | The other direction of (1/3, A, `hecatomb`). `sacrifice` carries Butler's `hecatomb` and his own `sacrifice`, and a hecatomb is a sacrifice — Butler's own other word for the same act. Both Books mark what the merge would otherwise cost with an adjective of scale. |
| `scoundrels` | `scoundrels` (B3-P018) | **`kept`** | every entry Book 3 contributes is Butler's own `scoundrels` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sheltered` | `protected` (B3-P024) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`protected`); every other entry is Butler's own `sheltered` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `sheltered` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `showed` | `manifested` (B3-P033), `shewed` (B3-P030) | **`unavoidable-merge`** | `showed` carries Butler's `shewed` (B03-P030 — his own archaic spelling of this very word), his `manifested herself visibly` (B03-P033) and his `what courage he displayed` (B04-P022). A goddess manifesting and a man displaying courage are both `showing` in plain English, and the third is not a second word at all. |
| `since` | `since` (B3-P016), `since` (B3-P030) | **`kept`** | every entry Book 3 contributes is Butler's own `since` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `single` | `single` (B3-P018) | **`kept`** | every entry Book 3 contributes is Butler's own `single` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B3-P005) | **`kept`** | every entry Book 3 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B3-P021) | **`kept`** | every entry Book 3 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `elsewhither` (B3-P021) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`elsewhither`); every other entry is Butler's own `somewhere` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `somewhere` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `start` | `start` (B3-P036) | **`homograph`** | One spelling, two unrelated senses. `ashamed to begin questioning` -> `start questioning` (B03-P003) and `begin opening up discourse` -> `start a conversation` (B04-P014) are *commence*; Butler's own `that he may start at once` (B03-P036) and its kin in Books 5, 6 and 8 are *set out on a journey*. The two senses never meet. |
| `their` | `their` (B3-P001), `their` (B3-P005), `their` (B3-P009), `their` (B3-P014), `their` (B3-P015), `their` (B3-P018), `their` (B3-P027), `their` (B3-P031), `their` (B3-P032), `their` (B3-P034), `their` (B3-P035), `their` (B3-P036), `their` (B3-P037) | **`kept`** | every entry Book 3 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `there` (B3-P001), `there` (B3-P005), `there` (B3-P012), `there` (B3-P020), `there` (B3-P021), `there` (B3-P022), `there` (B3-P023), `there` (B3-P024), `there` (B3-P029), `there` (B3-P031) | **`kept`** | every entry Book 3 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `hereabouts` (B3-P024), `those` (B3-P030) | **`common-rendering`** | `those` is a word Butler himself uses in 29 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `three` | `three` (B3-P021) | **`kept`** | every entry Book 3 contributes is Butler's own `three` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `together` (B3-P014) | **`kept`** | every entry Book 3 contributes is Butler's own `together` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `traveler` | `traveller` (B3-P011) | **`unavoidable-merge`** | **O-7, declined, and the reason is that the proposed repair does not repair anything.** `wayfarer` -> `traveler` at B07-P018 does land on the rendering of Butler's `traveller` at accepted B03-P011 and B04-P027. But O-7 offers `lone traveler` to keep the solitary sense without the merge, and the candidate **already writes `solitary traveler`** — the same repair in a different word, with the merge untouched either way, because `traveler` is the only plain modern equivalent of `wayfarer`. |
| `treachery` | `treachery` (B3-P020) | **`kept`** | every entry Book 3 contributes is Butler's own `treachery` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `until` | `until` (B3-P004) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `watched` | `beheld it` (B3-P030) | **`kept-elsewhere`** | Book 3 supplies the row's only rendering (`beheld it`); every other entry is Butler's own `watched` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `watched` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `water` | `water` (B3-P015), `water` (B3-P027), `water` (B3-P033), `water` (B3-P034) | **`kept`** | every entry Book 3 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `where` | `whence` (B3-P011), `where` (B3-P002), `where` (B3-P005), `where` (B3-P015), `where` (B3-P024), `where` (B3-P025), `where` (B3-P029), `where` (B3-P033), `where` (B3-P037) | **`common-rendering`** | `where` is a word Butler himself uses in 66 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
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
| `among` | `amid` (B3-P011) | **`common-word`** | `among` is an ordinary word Butler uses in 52 paragraphs and the two uses share no referent |
| `tell` | `certify` (B3-P011) | **`common-word`** | `tell` is an ordinary word Butler uses in 62 paragraphs and the two uses share no referent |
| `great` | `much` (B3-P012) | **`common-word`** | `great` is an ordinary word Butler uses in 66 paragraphs and the two uses share no referent |
| `made` | `offered hecatombs` (B3-P014) | **`common-word`** | `made` is an ordinary word Butler uses in 72 paragraphs and the two uses share no referent |
| `came` | `returned` (B3-P016) | **`common-word`** | `came` is an ordinary word Butler uses in 63 paragraphs and the two uses share no referent |
| `home` | `returned` (B3-P016) | **`common-word`** | `home` is an ordinary word Butler uses in 93 paragraphs and the two uses share no referent |
| `else` | `elsewhither` (B3-P021) | **`phrase-not-word`** | `voyaging elsewhither among mankind` -> `voyaging somewhere else`. `somewhere else` is a fixed adverbial phrase; Butler's own `else` in this paragraph is the bound postpositive of `something else` and `anyone else`, which is a different construction and not a second referent. |
| `from` | `off` (B3-P025) | **`common-word`** | `from` is an ordinary word Butler uses in 153 paragraphs and the two uses share no referent |
| `man` | `person` (B3-P025) | **`common-word`** | `man` is an ordinary word Butler uses in 100 paragraphs and the two uses share no referent |
| `good` | `pleased` (B3-P029) | **`common-word`** | `good` is an ordinary word Butler uses in 74 paragraphs and the two uses share no referent |
| `said` | `thus spoken` (B3-P030) | **`common-word`** | `said` is an ordinary word Butler uses in 143 paragraphs and the two uses share no referent |
| `house` | `abode` (B3-P031) | **`common-word`** | `house` is an ordinary word Butler uses in 93 paragraphs and the two uses share no referent |
| `him` | `by his side` (B3-P031) | **`common-word`** | `him` is an ordinary word Butler uses in 168 paragraphs and the two uses share no referent |
| `each` | `he was minded` (B3-P031) | **`artifact`** | Butler's `had drunk each as much as he was minded` became `had drunk as much as each of them wanted`. `each` did not move — the clause was reordered around it — and the diff paired `he was minded` with the `each` that crossed the seam. There is no rendering pair. |
| `prayed` | `pray` (B3-P031) | **`variant`** | `Thus did he pray` -> `So he prayed`, beside Butler's own `he prayed much` -> `he prayed at length` in the same paragraph. One word, two tenses; the inversion is what changed. |
| `tell` | `shall bid` (B3-P033) | **`common-word`** | `tell` is an ordinary word Butler uses in 62 paragraphs and the two uses share no referent |
| `horses` | `steeds take` (B3-P037) | **`same-referent`** | Butler writes `horses` four times in this paragraph and `steeds` once, at its close — `so well did their steeds take them`. The candidate writes `so well did their horses carry them`. They are the same animals and Butler's own commoner word is the one used, which is the `courtyard` ruling at Book 7: his own other word for the thing he is describing. What the merge costs is the lift of register at the end of a travel formula, and the candidate pays it back with `carry` for `take`. |

