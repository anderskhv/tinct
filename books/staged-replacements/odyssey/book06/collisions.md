# Odyssey Book 6 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**84 rows touch Book 6.**

| disposition | rows |
|---|---|
| `UNRULED` | 12 |
| `artifact` | 1 |
| `common-rendering` | 6 |
| `common-word` | 9 |
| `discrimination` | 1 |
| `homograph` | 1 |
| `kept` | 47 |
| `unavoidable-merge` | 1 |
| `variant` | 6 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

19 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `appearance` | `appearance` (B6-P019) | **`homograph`** | One Butler spelling, two senses. `the appearance of Odysseus` at B08-P002 is how he looks; `the presents began to make their appearance` at B08-P038 is an idiom meaning they arrived. Two words that happen to be spelled alike, like `issue` at Book 7. |
| `around` | `around` (B6-P005) | **`kept`** | every entry Book 6 contributes is Butler's own `around` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `conduct` | `guide` (B6-P010) | **`UNRULED`** |  |
| `counsels` | `counsels` (B6-P001) | **`kept`** | every entry Book 6 contributes is Butler's own `counsels` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `decorated` | `decorated` (B6-P002) | **`kept`** | every entry Book 6 contributes is Butler's own `decorated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `faring` | `seafaring` (B6-P021) | **`artifact`** | Butler writes `sea-faring` with a hyphen and the tokenizer splits it, so `faring` is not a word either text uses. D15 closes it to `seafaring`, matching accepted B06-P021. There is no rendering pair. |
| `forth` | `out over` (B6-P009) | **`UNRULED`** |  |
| `handmaids` | `handmaids` (B6-P009) | **`kept`** | every entry Book 6 contributes is Butler's own `handmaids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `herbage` | `greenery` (B6-P009) | **`UNRULED`** |  |
| `immediately` | `immediately` (B6-P003) | **`kept`** | every entry Book 6 contributes is Butler's own `immediately` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `nation` | `nation` (B6-P021) | **`kept`** | every entry Book 6 contributes is Butler's own `nation` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `prepared` | `made` (B6-P008) | **`UNRULED`** |  |
| `pretty` | `pretty` (B6-P002) | **`kept`** | every entry Book 6 contributes is Butler's own `pretty` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `pulled` | `pulled` (B6-P008) | **`variant`** | every rendering in the row reduces to `pull` once inflection, D9 spelling and D15 compound spacing are normalized |
| `thence` | `from there` (B6-P001) | **`UNRULED`** |  |
| `travel` | `travel` (B6-P021) | **`variant`** | every rendering in the row reduces to `travel` once inflection, D9 spelling and D15 compound spacing are normalized |
| `wherein` | `in which` (B6-P004) | **`UNRULED`** |  |
| `wilderness` | `wilderness` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `wilderness` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wondered` | `wondered` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `wondered` carried through unchanged; the decision in this row belongs to whichever Book moved |

## ARROW B — one rendering, two or more Butler words, across Books

55 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B6-P009), `after` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `among` | `among` (B6-P001), `among` (B6-P003), `among` (B6-P011), `among` (B6-P021), `amongst` (B6-P011) | **`variant`** | every rendering in the row reduces to `among` once inflection, D9 spelling and D15 compound spacing are normalized |
| `apart` | `apart` (B6-P016) | **`kept`** | every entry Book 6 contributes is Butler's own `apart` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `arrows` | `arrows` (B6-P021) | **`kept`** | every entry Book 6 contributes is Butler's own `arrows` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `blessed` | `blessed` (B6-P004) | **`kept`** | every entry Book 6 contributes is Butler's own `blessed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B6-P015), `called` (B6-P016), `called` (B6-P020), `convened` (B6-P005) | **`common-rendering`** | `called` is a word Butler himself uses in 13 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `carried` | `carried` (B6-P008) | **`kept`** | every entry Book 6 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `cloak` (B6-P017) | **`kept`** | every entry Book 6 contributes is Butler's own `cloak` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B6-P009), `enough` (B6-P012), `enough` (B6-P017) | **`kept`** | every entry Book 6 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `entrance` | `entrance` (B6-P021) | **`unavoidable-merge`** | `entrance` carries Butler's `vestibule` at B08-P021 and his own `entrance` at B06-P021 — the same part of the same kind of house. `doorway` was not available: Butler uses it himself two paragraphs later at B08-P023, where the gods stand in it. |
| `everlasting` | `everlasting` (B6-P004) | **`kept`** | every entry Book 6 contributes is Butler's own `everlasting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `front` | `front` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `front` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `girls` | `girls` (B6-P016) | **`kept`** | every entry Book 6 contributes is Butler's own `girls` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B6-P003), `going` (B6-P005), `going` (B6-P013), `going` (B6-P021), `going` (B6-P022), `going` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B6-P004), `great` (B6-P012), `great` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `greenery` | `herbage` (B6-P009) | **`UNRULED`** |  |
| `guide` | `conduct` (B6-P010) | **`UNRULED`** |  |
| `heads` | `heads` (B6-P009) | **`kept`** | every entry Book 6 contributes is Butler's own `heads` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `himself` | `himself` (B6-P011), `himself` (B6-P012), `himself` (B6-P018) | **`kept`** | every entry Book 6 contributes is Butler's own `himself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `husband` | `husband` (B6-P014), `husband` (B6-P019), `husband` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `inner` | `inner` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `inner` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lying` | `lying` (B6-P003) | **`kept`** | every entry Book 6 contributes is Butler's own `lying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B6-P005), `maids` (B6-P008), `maids` (B6-P010), `maids` (B6-P016), `maids` (B6-P017), `maids` (B6-P018), `maids` (B6-P021), `maids` (B6-P023), `maids` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B6-P009), `matter` (B6-P020), `matter` (B6-P023) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B6-P020) | **`kept`** | every entry Book 6 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `morning` | `morning` (B6-P005) | **`kept`** | every entry Book 6 contributes is Butler's own `morning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `offense` | `offence` (B6-P012) | **`UNRULED`** |  |
| `others` | `others` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `people` | `people` (B6-P001), `people` (B6-P003), `people` (B6-P011), `people` (B6-P013), `people` (B6-P015), `people` (B6-P016), `people` (B6-P021), `people` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `prayer` | `prayer` (B6-P026) | **`kept`** | every entry Book 6 contributes is Butler's own `prayer` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `proud` | `proud` (B6-P003), `proud` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `proud` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quickly` | `quickly` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `quickly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `robes` | `robes` (B6-P003) | **`discrimination`** | See (A, raiment). `robes` carries Butler's `raiment` at B08-P030 and his own `robes` at B06-P003 — both are garments worn, and the merge is the correct reading rather than a loss. |
| `seafaring` | `sea faring` (B6-P021) | **`variant`** | every rendering in the row reduces to `seafar` once inflection, D9 spelling and D15 compound spacing are normalized |
| `search` | `quest` (B6-P012) | **`UNRULED`** |  |
| `sheltered` | `sheltered` (B6-P016) | **`kept`** | every entry Book 6 contributes is Butler's own `sheltered` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `since` | `since` (B6-P017), `since` (B6-P020) | **`kept`** | every entry Book 6 contributes is Butler's own `since` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B6-P005), `sitting` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B6-P016), `something` (B6-P019) | **`kept`** | every entry Book 6 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `somewhere` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `somewhere` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `spinning` | `spinning` (B6-P005), `spinning` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `spinning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `start` | `start` (B6-P003), `start` (B6-P010) | **`kept`** | every entry Book 6 contributes is Butler's own `start` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `strength` | `strength` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `strength` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `suppose` | `conjecture` (B6-P013), `suppose` (B6-P003), `suppose` (B6-P022) | **`UNRULED`** |  |
| `their` | `their` (B6-P001), `their` (B6-P005), `their` (B6-P008), `their` (B6-P009), `their` (B6-P014), `their` (B6-P021), `their` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `thence` (B6-P001), `there` (B6-P002), `there` (B6-P009), `there` (B6-P013), `there` (B6-P014), `there` (B6-P015), `there` (B6-P017), `there` (B6-P023), `there` (B6-P024) | **`common-rendering`** | `there` is a word Butler himself uses in 100 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `those` | `those` (B6-P003), `those` (B6-P011) | **`kept`** | every entry Book 6 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `thought` | `deemed` (B6-P012), `thought` (B6-P019) | **`common-rendering`** | `thought` is a word Butler himself uses in 13 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `water` | `water` (B6-P009), `water` (B6-P010), `water` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `whatever` | `whatever` (B6-P007) | **`variant`** | every rendering in the row reduces to `whatever` once inflection, D9 spelling and D15 compound spacing are normalized |
| `where` | `where` (B6-P009), `where` (B6-P012), `where` (B6-P016), `where` (B6-P021), `where` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `wherein` (B6-P004), `which` (B6-P002), `which` (B6-P003), `which` (B6-P004), `which` (B6-P005), `which` (B6-P009), `which` (B6-P010), `which` (B6-P021) | **`common-rendering`** | `which` is a word Butler himself uses in 81 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `without` | `without` (B6-P008), `without` (B6-P016), `without` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `scion` (B6-P013), `woman` (B6-P013) | **`common-rendering`** | `woman` is a word Butler himself uses in 17 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `young` | `scion` (B6-P013), `young` (B6-P003), `young` (B6-P011), `young` (B6-P012), `young` (B6-P013), `young` (B6-P017), `young` (B6-P018), `young` (B6-P022) | **`common-rendering`** | `young` is a word Butler himself uses in 29 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

10 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `from` | `thence` (B6-P001) | **`common-word`** | `from` is an ordinary word Butler uses in 131 paragraphs and the two uses share no referent |
| `out` | `forth upon` (B6-P009) | **`common-word`** | `out` is an ordinary word Butler uses in 69 paragraphs and the two uses share no referent |
| `among` | `amongst` (B6-P011) | **`common-word`** | `among` is an ordinary word Butler uses in 47 paragraphs and the two uses share no referent |
| `great` | `much` (B6-P013) | **`common-word`** | `great` is an ordinary word Butler uses in 54 paragraphs and the two uses share no referent |
| `woman` | `scion` (B6-P013) | **`UNRULED`** |  |
| `young` | `scion` (B6-P013) | **`common-word`** | `young` is an ordinary word Butler uses in 29 paragraphs and the two uses share no referent |
| `man` | `another` (B6-P019) | **`common-word`** | `man` is an ordinary word Butler uses in 86 paragraphs and the two uses share no referent |
| `tell` | `bid` (B6-P021) | **`common-word`** | `tell` is an ordinary word Butler uses in 56 paragraphs and the two uses share no referent |
| `over` | `and topes` (B6-P023) | **`common-word`** | `over` is an ordinary word Butler uses in 73 paragraphs and the two uses share no referent |
| `far` | `distant` (B6-P023) | **`common-word`** | `far` is an ordinary word Butler uses in 28 paragraphs and the two uses share no referent |

