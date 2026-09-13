# Odyssey Book 6 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**82 rows touch Book 6.**

| disposition | rows |
|---|---|
| `artifact` | 2 |
| `common-rendering` | 4 |
| `common-word` | 9 |
| `context-rendered` | 1 |
| `discrimination` | 1 |
| `free-variation` | 1 |
| `homograph` | 1 |
| `kept` | 50 |
| `kept-elsewhere` | 1 |
| `matches-accepted` | 2 |
| `unavoidable-merge` | 5 |
| `variant` | 5 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

18 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `appearance` | `appearance` (B6-P019) | **`homograph`** | One Butler spelling, two senses. `the appearance of Odysseus` at B08-P002 is how he looks; `the presents began to make their appearance` at B08-P038 is an idiom meaning they arrived. Two words that happen to be spelled alike, like `issue` at Book 7. |
| `around` | `around` (B6-P005) | **`kept`** | every entry Book 6 contributes is Butler's own `around` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `conduct` | `guide` (B6-P010) | **`context-rendered`** | `the girl who was to conduct him to the city` -> `guide` (B06-P010) and `I will also conduct him to Sparta` -> `take` (B01-P007). Nausicaa shows Odysseus a way he does not know; Athena proposes to convey Telemachus on a voyage she is arranging. `guide him to Sparta` would say Telemachus cannot find it, and `take him to the city` would take the showing out of Nausicaa's hands. |
| `counsels` | `counsels` (B6-P001) | **`kept`** | every entry Book 6 contributes is Butler's own `counsels` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `decorated` | `decorated` (B6-P002) | **`kept`** | every entry Book 6 contributes is Butler's own `decorated` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `faring` | `seafaring` (B6-P021) | **`artifact`** | Butler writes `sea-faring` with a hyphen and the tokenizer splits it, so `faring` is not a word either text uses. D15 closes it to `seafaring`, matching accepted B06-P021. There is no rendering pair. |
| `follow` | `follow` (B6-P021) | **`kept`** | every entry Book 6 contributes is Butler's own `follow` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `handmaids` | `handmaids` (B6-P009) | **`kept`** | every entry Book 6 contributes is Butler's own `handmaids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `herbage` | `greenery` (B6-P009) | **`matches-accepted`** | **The row this whole check was built for, and it is now consistent.** The drafter of Book 6 named `herbage`/`grass` as a call no single-Book instrument could see. Both accepted Books now render `greenery` — B06-P009 plain, B05-P006 with `lush` carrying Butler's own `luscious`. One rendering in two Books. |
| `humane` | `humane` (B6-P011) | **`kept`** | every entry Book 6 contributes is Butler's own `humane` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `immediately` | `immediately` (B6-P003) | **`kept`** | every entry Book 6 contributes is Butler's own `immediately` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `nation` | `nation` (B6-P021) | **`kept`** | every entry Book 6 contributes is Butler's own `nation` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `prepared` | `made` (B6-P008) | **`kept-elsewhere`** | Book 6 supplies the row's only rendering (`made`); every other entry is Butler's own `prepared` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `prepared` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `pretty` | `pretty` (B6-P002) | **`kept`** | every entry Book 6 contributes is Butler's own `pretty` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `pulled` | `pulled` (B6-P008) | **`variant`** | every rendering in the row reduces to `pull` once inflection, D9 spelling and D15 compound spacing are normalized |
| `travel` | `travel` (B6-P021) | **`variant`** | every rendering in the row reduces to `travel` once inflection, D9 spelling and D15 compound spacing are normalized |
| `uncivilised` | `uncivilized` (B6-P011) | **`artifact`** | `uncivilised` -> `uncivilized` is D9, the spelling rule. Book 9's row is the separate question of Butler's tautologous `uncivilised savages`. |
| `wherein` | `in which` (B6-P004) | **`free-variation`** | `in which` at B05-P006 and B06-P004, `where` at B04-P022, all rendering Butler's relative `wherein`, all after a concrete place noun (a wood, a peacefulness of light, a wooden horse). No sense, register or referent separates them. Recorded, not repaired: three accepted Books would have to move to close a difference no reader can act on. |

## ARROW B — one rendering, two or more Butler words, across Books

54 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `after` | `after` (B6-P009), `after` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `after` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `apart` | `apart` (B6-P016) | **`kept`** | every entry Book 6 contributes is Butler's own `apart` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `arrows` | `arrows` (B6-P021) | **`kept`** | every entry Book 6 contributes is Butler's own `arrows` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `blessed` | `blessed` (B6-P004) | **`kept`** | every entry Book 6 contributes is Butler's own `blessed` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B6-P015), `called` (B6-P016), `called` (B6-P020), `convened` (B6-P005) | **`common-rendering`** | `called` is a word Butler himself uses in 16 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `carried` | `carried` (B6-P008) | **`kept`** | every entry Book 6 contributes is Butler's own `carried` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cloak` | `cloak` (B6-P017) | **`kept`** | every entry Book 6 contributes is Butler's own `cloak` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `enough` | `enough` (B6-P009), `enough` (B6-P012), `enough` (B6-P017) | **`kept`** | every entry Book 6 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `first` | `first` (B6-P014), `first` (B6-P019) | **`kept`** | every entry Book 6 contributes is Butler's own `first` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `girls` | `girls` (B6-P016) | **`kept`** | every entry Book 6 contributes is Butler's own `girls` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B6-P003), `going` (B6-P005), `going` (B6-P013), `going` (B6-P021), `going` (B6-P022), `going` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `going` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `great` | `great` (B6-P004), `great` (B6-P012), `great` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `greenery` | `herbage` (B6-P009) | **`matches-accepted`** | The mirror of (5/6, A, `herbage`). Both accepted Books render Butler's `herbage` as `greenery`; B05-P006's longer span is his `luscious herbage` taken together. |
| `guide` | `conduct` (B6-P010) | **`unavoidable-merge`** | `guide` carries Butler's `conduct` (B06-P010), his `direct` (B01-P019 and B02-P012 — the same sentence in two Books, rendered identically) and his own `guide` (B05-P005). All three are Butler's free variants for showing somebody a way; `some heaven-sent message may direct you` and `may guide you` are the same sentence in his own idiom, and no discrimination exists to lose. |
| `heads` | `heads` (B6-P009) | **`kept`** | every entry Book 6 contributes is Butler's own `heads` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `husband` | `husband` (B6-P014), `husband` (B6-P019), `husband` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `inner` | `inner` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `inner` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `lying` | `lying` (B6-P003) | **`kept`** | every entry Book 6 contributes is Butler's own `lying` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B6-P005), `maids` (B6-P008), `maids` (B6-P010), `maids` (B6-P016), `maids` (B6-P017), `maids` (B6-P018), `maids` (B6-P021), `maids` (B6-P023), `maids` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B6-P009), `matter` (B6-P020), `matter` (B6-P023) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meanwhile` | `meanwhile` (B6-P020) | **`kept`** | every entry Book 6 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `myself` | `myself` (B6-P017), `myself` (B6-P021), `myself` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `myself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `offense` | `offence` (B6-P012) | **`unavoidable-merge`** | D9, `offence` -> `offense`, plus one recast: Butler's `you will not be offended with what I am going to say` (B01-P013) becomes `you will not take offense at what I am about to say`, which is the idiom Butler HIMSELF uses at B02-P008 and B06-P012 (`take offence at`). The merge makes Book 1 agree with two accepted Books on one speech act. |
| `others` | `others` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `people` | `people` (B6-P001), `people` (B6-P003), `people` (B6-P011), `people` (B6-P013), `people` (B6-P015), `people` (B6-P016), `people` (B6-P021), `people` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `places` | `places` (B6-P021) | **`kept`** | every entry Book 6 contributes is Butler's own `places` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `prayer` | `prayer` (B6-P026) | **`kept`** | every entry Book 6 contributes is Butler's own `prayer` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `proud` | `proud` (B6-P003), `proud` (B6-P013) | **`kept`** | every entry Book 6 contributes is Butler's own `proud` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `quickly` | `quickly` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `quickly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `robes` | `robes` (B6-P003) | **`discrimination`** | See (A, raiment). `robes` carries Butler's `raiment` at B08-P030 and his own `robes` at B06-P003 — both are garments worn, and the merge is the correct reading rather than a loss. |
| `seafaring` | `sea faring` (B6-P021) | **`variant`** | every rendering in the row reduces to `seafar` once inflection, D9 spelling and D15 compound spacing are normalized |
| `search` | `quest` (B6-P012) | **`unavoidable-merge`** | **Butler himself alternates, inside one speech, which settles it.** He writes `sail the seas in search of my father who has so long been missing` at B02-P018 and `go to Sparta and to Pylos in quest of my father who has so long been missing` at B02-P012 — the same formula, six paragraphs apart, in his own two words. `quest` is archaic outside fixed phrases; `search` is what he means by both, and three accepted Books render it identically. |
| `settled` | `settled` (B6-P001) | **`kept`** | every entry Book 6 contributes is Butler's own `settled` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sheltered` | `sheltered` (B6-P016) | **`kept`** | every entry Book 6 contributes is Butler's own `sheltered` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `since` | `since` (B6-P017), `since` (B6-P020) | **`kept`** | every entry Book 6 contributes is Butler's own `since` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `sitting` | `sitting` (B6-P005), `sitting` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `something` | `something` (B6-P016), `something` (B6-P019) | **`kept`** | every entry Book 6 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `somewhere` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `somewhere` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `spinning` | `spinning` (B6-P005), `spinning` (B6-P023) | **`kept`** | every entry Book 6 contributes is Butler's own `spinning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `start` | `start` (B6-P003), `start` (B6-P010) | **`kept`** | every entry Book 6 contributes is Butler's own `start` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `strength` | `strength` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `strength` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `suppose` | `conjecture` (B6-P013), `suppose` (B6-P003), `suppose` (B6-P022) | **`unavoidable-merge`** | `I can only conjecture that you are Zeus's daughter` -> `suppose` (B06-P013), beside Butler's own `suppose` twice in the same Book and in four others. `conjecture` as a finite verb is formal to the point of stiffness in a castaway's plea, and `suppose` is what Butler himself writes elsewhere for exactly this hedged guess. |
| `their` | `their` (B6-P001), `their` (B6-P005), `their` (B6-P008), `their` (B6-P009), `their` (B6-P014), `their` (B6-P021), `their` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `their` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `there` | `there` (B6-P002), `there` (B6-P009), `there` (B6-P013), `there` (B6-P014), `there` (B6-P015), `there` (B6-P017), `there` (B6-P023), `there` (B6-P024) | **`kept`** | every entry Book 6 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B6-P003), `those` (B6-P011) | **`kept`** | every entry Book 6 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `three` | `three` (B6-P006) | **`kept`** | every entry Book 6 contributes is Butler's own `three` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `times` | `times` (B6-P009) | **`kept`** | every entry Book 6 contributes is Butler's own `times` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `water` | `water` (B6-P009), `water` (B6-P010), `water` (B6-P012) | **`kept`** | every entry Book 6 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `whatever` | `whatever` (B6-P007) | **`variant`** | every rendering in the row reduces to `whatever` once inflection, D9 spelling and D15 compound spacing are normalized |
| `where` | `where` (B6-P009), `where` (B6-P012), `where` (B6-P016), `where` (B6-P021), `where` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `wherein` (B6-P004), `which` (B6-P002), `which` (B6-P003), `which` (B6-P004), `which` (B6-P005), `which` (B6-P009), `which` (B6-P010), `which` (B6-P021) | **`common-rendering`** | `which` is a word Butler himself uses in 95 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `without` | `without` (B6-P008), `without` (B6-P016), `without` (B6-P022) | **`kept`** | every entry Book 6 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `scion` (B6-P013), `woman` (B6-P013) | **`common-rendering`** | `woman` is a word Butler himself uses in 17 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `young` | `scion` (B6-P013), `young` (B6-P003), `young` (B6-P011), `young` (B6-P012), `young` (B6-P013), `young` (B6-P017), `young` (B6-P018), `young` (B6-P022) | **`common-rendering`** | `young` is a word Butler himself uses in 33 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

10 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `from` | `thence` (B6-P001) | **`common-word`** | `from` is an ordinary word Butler uses in 153 paragraphs and the two uses share no referent |
| `out` | `forth upon` (B6-P009) | **`common-word`** | `out` is an ordinary word Butler uses in 89 paragraphs and the two uses share no referent |
| `among` | `amongst` (B6-P011) | **`common-word`** | `among` is an ordinary word Butler uses in 52 paragraphs and the two uses share no referent |
| `great` | `much` (B6-P013) | **`common-word`** | `great` is an ordinary word Butler uses in 66 paragraphs and the two uses share no referent |
| `woman` | `scion` (B6-P013) | **`unavoidable-merge`** | **The row the whole check was built to convict, ruled at last.** The drafter of Book 6 made this call by hand and refused `creature` because it is the edition's rendering of Butler's OWN `creature` in Books 4 and 5 — which is the defect arrow B exists to catch, avoided before arrow B existed. `so fair a scion as yourself` became `so fair a young woman as yourself`, beside Butler's own `a mortal woman` and `neither man nor woman` in the same paragraph. `scion` is a shoot of a plant and has no plain modern equivalent for a person; what it prefigures — the young palm at Delos, three sentences later — is carried by that simile itself, in Butler's own words, kept. Recorded rather than repaired: no available word both reads as modern English and keeps the graft metaphor. |
| `young` | `scion` (B6-P013) | **`common-word`** | `young` is an ordinary word Butler uses in 33 paragraphs and the two uses share no referent |
| `man` | `another` (B6-P019) | **`common-word`** | `man` is an ordinary word Butler uses in 100 paragraphs and the two uses share no referent |
| `tell` | `bid` (B6-P021) | **`common-word`** | `tell` is an ordinary word Butler uses in 62 paragraphs and the two uses share no referent |
| `over` | `and topes` (B6-P023) | **`common-word`** | `over` is an ordinary word Butler uses in 78 paragraphs and the two uses share no referent |
| `far` | `distant` (B6-P023) | **`common-word`** | `far` is an ordinary word Butler uses in 37 paragraphs and the two uses share no referent |

