# Odyssey Book 5 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**91 rows touch Book 5.**

| disposition | rows |
|---|---|
| `UNRULED` | 26 |
| `common-rendering` | 4 |
| `common-word` | 3 |
| `discrimination` | 1 |
| `kept` | 47 |
| `matches-accepted` | 3 |
| `unavoidable-merge` | 2 |
| `variant` | 5 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

18 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `approach` | `come to` (B5-P034) | **`UNRULED`** |  |
| `closely` | `closely` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `closely` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `compassion` | `pity on` (B5-P025) | **`UNRULED`** |  |
| `counsels` | `plans` (B5-P010) | **`UNRULED`** |  |
| `firmament` | `sky` (B5-P005) | **`UNRULED`** |  |
| `furthermore` | `and now` (B5-P002) | **`UNRULED`** |  |
| `glittering` | `glittering` (B5-P005) | **`kept`** | every entry Book 5 contributes is Butler's own `glittering` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `grasped` | `grasped` (B5-P023) | **`kept`** | every entry Book 5 contributes is Butler's own `grasped` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `harbours` | `harbors` (B5-P030) | **`variant`** | D9, `harbours` -> `harbors`. The trailing `their` in the row is the parallel possessive Butler dropped and B07-P005 restores, recorded in `continuity.md`; the diff attached it to the same span. |
| `herbage` | `lush greenery` (B5-P006) | **`UNRULED`** |  |
| `infinite` | `endless` (B5-P018) | **`matches-accepted`** | `infinite trouble` -> `endless trouble` at B08-P012 is word for word accepted B05-P018's rendering. The other rendering in the row is Book 2's, where B02-P002 keeps Butler's `infinite` because it is current English in its own context; that is Book 2's decision. |
| `luscious` | `lush greenery` (B5-P006) | **`UNRULED`** |  |
| `pretty` | `fairly` (B5-P006) | **`UNRULED`** |  |
| `raiment` | `clothing` (B5-P004) | **`discrimination`** | **Ruled, and the two renderings are deliberate.** Butler uses `raiment` twice in this Book for two different things: the divine dress the Graces put on Aphrodite at B08-P030, rendered `robes`, and the gift-clothes the Phaeacians pack in Arete's chest at B08-P040, rendered `clothing` — which is word for word accepted B05-P004's rendering. `clothing of the most enchanting beauty` said of a goddess is flat, and `robes` said of a chest of presents is wrong. |
| `retired` | `retreated and` (B5-P032), `withdrew` (B5-P019) | **`UNRULED`** |  |
| `sorely` | `hard` (B5-P023), `sorely` (B5-P031) | **`UNRULED`** |  |
| `tired` | `tired` (B5-P012) | **`kept`** | every entry Book 5 contributes is Butler's own `tired` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wherein` | `in which` (B5-P006) | **`UNRULED`** |  |

## ARROW B — one rendering, two or more Butler words, across Books

67 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B5-P004), `after` (B5-P009), `after` (B5-P017), `after` (B5-P021), `after` (B5-P030), `after` (B5-P031) | **`kept`** | every entry Book 5 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `among` | `among` (B5-P035) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `anger` | `anger` (B5-P034) | **`kept`** | every entry Book 5 contributes is Butler's own `anger` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `anyone` | `prayerfully any one` (B5-P034) | **`UNRULED`** |  |
| `aware` | `aware` (B5-P018) | **`matches-accepted`** | `perceived` -> `was aware of` at B08-P047 is the rendering accepted B05-P018 already uses. It was chosen at this Book precisely to keep `noticed` free for Butler's own `noticed` at B08-P007, which arrow C caught flattened in the first draft. |
| `being` | `being` (B5-P006) | **`kept`** | every entry Book 5 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `beside` | `beside` (B5-P001), `beside` (B5-P008) | **`kept`** | every entry Book 5 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `blessed` | `blessed` (B5-P015), `blest` (B5-P023), `safe to perish blest` (B5-P023) | **`UNRULED`** |  |
| `called` | `called` (B5-P025) | **`kept`** | every entry Book 5 contributes is Butler's own `called` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `carried` | `carried` (B5-P009), `carried` (B5-P024), `carried` (B5-P032) | **`kept`** | every entry Book 5 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B5-P030) | **`kept`** | every entry Book 5 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `cloak` (B5-P020) | **`kept`** | every entry Book 5 contributes is Butler's own `cloak` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `clothing` | `raiment` (B5-P004) | **`matches-accepted`** | See (A, raiment). B08-P040 uses accepted B05-P004's rendering exactly; B07-P022's `clothing` is Butler's own word kept. |
| `completely` | `completely` (B5-P035) | **`kept`** | every entry Book 5 contributes is Butler's own `completely` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cross` | `cross` (B5-P009), `cross` (B5-P010) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `dangerous` | `perilous` (B5-P004) | **`UNRULED`** |  |
| `decreed` | `decreed` (B5-P004), `decreed` (B5-P009), `decreed` (B5-P022) | **`kept`** | every entry Book 5 contributes is Butler's own `decreed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B5-P008), `enough` (B5-P037), `sufficiently` (B5-P006) | **`common-rendering`** | `enough` is a word Butler himself uses in 20 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `escorted` | `convoyed` (B5-P004) | **`UNRULED`** |  |
| `everlasting` | `everlasting` (B5-P002) | **`kept`** | every entry Book 5 contributes is Butler's own `everlasting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `fairly` | `equitably` (B5-P002), `pretty` (B5-P006) | **`UNRULED`** |  |
| `forth` | `shuttlecock with it` (B5-P024) | **`UNRULED`** |  |
| `going` | `going` (B5-P013) | **`kept`** | every entry Book 5 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B5-P002), `great` (B5-P006), `great` (B5-P015), `great` (B5-P020), `great` (B5-P024), `great` (B5-P025), `great` (B5-P026), `great` (B5-P028), `great` (B5-P031), `great` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `greenery` | `luscious herbage` (B5-P006) | **`UNRULED`** |  |
| `grieving` | `grieving` (B5-P013) | **`kept`** | every entry Book 5 contributes is Butler's own `grieving` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `guide` | `guide` (B5-P005) | **`kept`** | every entry Book 5 contributes is Butler's own `guide` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `herald` | `harbinger` (B5-P001) | **`UNRULED`** |  |
| `himself` | `himself` (B5-P010), `himself` (B5-P022), `himself` (B5-P023), `himself` (B5-P027), `himself` (B5-P028), `himself` (B5-P031), `himself` (B5-P035), `himself` (B5-P036), `himself` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `himself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `holding` | `holding` (B5-P005) | **`kept`** | every entry Book 5 contributes is Butler's own `holding` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `hurrying` | `hurry skurrying` (B5-P003) | **`UNRULED`** |  |
| `inner` | `inner` (B5-P019) | **`kept`** | every entry Book 5 contributes is Butler's own `inner` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leave` | `leave` (B5-P012), `leave` (B5-P026), `leave` (B5-P031) | **`kept`** | every entry Book 5 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lives` | `lives` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `lives` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `loaded` | `loaded` (B5-P006), `loaded` (B5-P008) | **`kept`** | every entry Book 5 contributes is Butler's own `loaded` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lying` | `lying` (B5-P002), `lying` (B5-P030), `lying` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `lying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B5-P016) | **`kept`** | every entry Book 5 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B5-P007), `matter` (B5-P027) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B5-P020) | **`kept`** | every entry Book 5 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `morning` | `morning` (B5-P020) | **`kept`** | every entry Book 5 contributes is Butler's own `morning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `neighbor` | `neighbor` (B5-P037) | **`variant`** | D9, `neighbour` -> `neighbor`. The trailing `saying` in the row is Butler's participle, which the recast `and one would turn to his neighbor and say` absorbed; the diff attached it to the same span. |
| `ourselves` | `ourselves` (B5-P004) | **`variant`** | every rendering in the row reduces to `ourselv` once inflection, D9 spelling and D15 compound spacing are normalized |
| `people` | `people` (B5-P002), `people` (B5-P009), `people` (B5-P028) | **`kept`** | every entry Book 5 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `prayer` | `prayerfully any one` (B5-P034) | **`UNRULED`** |  |
| `quickly` | `rapidly` (B5-P016) | **`UNRULED`** |  |
| `rejoice` | `rejoice` (B5-P030) | **`kept`** | every entry Book 5 contributes is Butler's own `rejoice` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `search` | `search` (B5-P031) | **`kept`** | every entry Book 5 contributes is Butler's own `search` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `settle` | `settle` (B5-P013) | **`kept`** | every entry Book 5 contributes is Butler's own `settle` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `single` | `single` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `single` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B5-P010), `sitting` (B5-P012) | **`kept`** | every entry Book 5 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B5-P014) | **`kept`** | every entry Book 5 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `start` | `start` (B5-P017) | **`kept`** | every entry Book 5 contributes is Butler's own `start` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `streams` | `rills` (B5-P006), `streams` (B5-P024) | **`UNRULED`** |  |
| `strength` | `strength` (B5-P030) | **`kept`** | every entry Book 5 contributes is Butler's own `strength` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `struck` | `struck` (B5-P010) | **`kept`** | every entry Book 5 contributes is Butler's own `struck` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `their` | `their` (B5-P001), `their` (B5-P002), `their` (B5-P006), `their` (B5-P009), `their` (B5-P016), `their` (B5-P022), `their` (B5-P030) | **`kept`** | every entry Book 5 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `there` (B5-P001), `there` (B5-P002), `there` (B5-P003), `there` (B5-P006), `there` (B5-P009), `there` (B5-P014), `there` (B5-P028), `there` (B5-P030), `there` (B5-P033), `there` (B5-P036), `there` (B5-P037) | **`kept`** | every entry Book 5 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B5-P023) | **`kept`** | every entry Book 5 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `thought` | `deemed` (B5-P037), `thought` (B5-P003), `thought` (B5-P033) | **`common-rendering`** | `thought` is a word Butler himself uses in 13 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `together` | `together` (B5-P006), `together` (B5-P020), `together` (B5-P023), `together` (B5-P027) | **`kept`** | every entry Book 5 contributes is Butler's own `together` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `watched` | `watched` (B5-P028) | **`kept`** | every entry Book 5 contributes is Butler's own `watched` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `water` | `irrigate` (B5-P006), `water` (B5-P006), `water` (B5-P013), `water` (B5-P020), `water` (B5-P021), `water` (B5-P024), `water` (B5-P030), `water` (B5-P031), `water` (B5-P032), `water` (B5-P037) | **`common-rendering`** | `water` is a word Butler himself uses in 42 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `where` | `where` (B5-P002), `where` (B5-P005), `where` (B5-P009), `where` (B5-P016), `where` (B5-P017), `where` (B5-P020), `where` (B5-P021), `where` (B5-P022), `where` (B5-P026), `where` (B5-P027), `where` (B5-P028), `where` (B5-P029), `where` (B5-P030) | **`kept`** | every entry Book 5 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `wherein` (B5-P006), `which` (B5-P005), `which` (B5-P006), `which` (B5-P020), `which` (B5-P028), `which` (B5-P031) | **`common-rendering`** | `which` is a word Butler himself uses in 81 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `without` | `without` (B5-P003), `without` (B5-P004), `without` (B5-P030) | **`kept`** | every entry Book 5 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B5-P017), `woman` (B5-P018) | **`kept`** | every entry Book 5 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wrapped` | `enveloped` (B5-P030) | **`unavoidable-merge`** | `wrapped` carries Butler's `enveloped` (B05-P030, B07-P012) and his own `wrapped` (B03-P035). `envelop` is not plain modern English of a mist, `wrap` is, and the two Books render it identically, which is the consistency the package asks for. |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

6 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `reached` | `got to` (B5-P005) | **`common-word`** | `reached` is an ordinary word Butler uses in 20 paragraphs and the two uses share no referent |
| `water` | `irrigate` (B5-P006) | **`common-word`** | `water` is an ordinary word Butler uses in 42 paragraphs and the two uses share no referent |
| `always` | `ever filled with` (B5-P012) | **`UNRULED`** |  |
| `mean` | `meaning` (B5-P014) | **`UNRULED`** |  |
| `good` | `well` (B5-P017) | **`common-word`** | `good` is an ordinary word Butler uses in 71 paragraphs and the two uses share no referent |
| `lay` | `laid himself` (B5-P035) | **`UNRULED`** |  |

