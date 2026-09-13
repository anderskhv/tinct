# Odyssey Book 2 — the collision report, dispositioned

Written by `scripts/collision_triage.py`. Every row of every arrow that touches
this Book, with a disposition on each. **Records finding R-2 and blind spot 8**
of `book07/review/findings-v1.md`: the check returned seventy-two rows touching
Book 7, eleven were acted on, and sixty-one were dismissed with no record of
having been read. This file is that record, and it is generated, not typed.

**94 rows touch Book 2.**

| disposition | rows |
|---|---|
| `artifact` | 1 |
| `common-rendering` | 6 |
| `common-word` | 9 |
| `context-rendered` | 2 |
| `homograph` | 2 |
| `kept` | 43 |
| `kept-elsewhere` | 11 |
| `matches-accepted` | 2 |
| `phrase-not-word` | 4 |
| `unavoidable-merge` | 7 |
| `variant` | 7 |

The vocabulary is defined in the script's docstring. `homograph`,
`same-referent`, `unavoidable-merge` and `phrase-not-word` are new here;
`homograph` is the one the review asked for by name.

## ARROW A — one Butler word, two or more renderings, across Books

17 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `accomplishments` | `skills` (B2-P007) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`skills`); every other entry is Butler's own `accomplishments` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `accomplishments` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `celebrate` | `hold` (B2-P012) | **`homograph`** | One Butler spelling, two unrelated senses. `celebrate his funeral rites` is *perform* (B01-P019 and B02-P012 — the same Butler sentence in two Books, rendered `hold` in both, which is the consistency the package asks for). `such as poets love to celebrate` is *sing of*. **The B01-P024 rendering was separately live and is repaired**: see the arrow C row (1, 24, `celebrate`, `sing`). |
| `continue` | `go on eating` (B2-P011) | **`variant`** | `continue eating` -> `go on eating`, the plain modern form. Same disposition as Book 9's row: Butler's `continue` is current English, but not in this construction. |
| `direct` | `guide` (B2-P012) | **`context-rendered`** | Butler's `direct` in `the girl who was to direct him` (B01-P019, B02-P012) is *show the way*, which modern `direct` has all but lost to *instruct* and *manage*; `guide` is the surviving word for it. Book 9 keeps `direct` at B09-P004, where `letting the wind and the steersmen direct our ship` is the living sense. Two senses, each rendered right. |
| `furthermore` | `next` (B2-P031) | **`context-rendered`** | Butler's paragraph-opening `Furthermore` is sequential narration at B02-P031 (`Next she went to the house of Odysseus`) and an additive grievance inside a speech at B05-P002 (`And now, wicked people are trying to murder his only son`). `Next` at the head of a complaint and `And now` at the head of a narrative step are each wrong in the other's place. |
| `girded` | `slung` (B2-P001) | **`matches-accepted`** | Butler's dressing formula is word for word the same at B02-P001 and B04-P025 and both accepted Books render `girded his sword about his shoulder(s)` as `slung his sword over his shoulder(s)` — one rendering in two Books. Book 8 keeps `girded` at B08-P038, of a different act (girding oneself for the games), and that is Book 8's decision. |
| `immediately` | `just yet` (B2-P006) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`just yet`); every other entry is Butler's own `immediately` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `immediately` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `lordly` | `lordly` (B2-P009) | **`kept`** | every entry Book 2 contributes is Butler's own `lordly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `marvelled` | `everyone marveled` (B2-P001) | **`matches-accepted`** | B02-P001 and B03-P030 render Butler's `all marvelled` identically as `everyone marveled` — his own word, D9-respelled, with `all` opened to `everyone`. One rendering in two Books. Book 1's third entry is a diff artifact of a different recast; see (1, A, `marvelled`). |
| `mycene` | `mycene` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `mycene` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `onward` | `onward` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `onward` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `opening` | `that opened` (B2-P025) | **`homograph`** | One spelling, two unrelated senses. B04-P014 is Butler's `begin opening up discourse` — starting to talk. B02-P025 is `doors opening in the middle` — a door on its hinge. No referent is shared. |
| `possessions` | `possessions` (B2-P027) | **`kept`** | every entry Book 2 contributes is Butler's own `possessions` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `rejoicing` | `to rejoice` (B2-P015) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`to rejoice`); every other entry is Butler's own `rejoicing` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `rejoicing` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `scheme` | `plan` (B2-P028) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`plan`); every other entry is Butler's own `scheme` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `scheme` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `serve` | `serve` (B2-P004) | **`kept`** | every entry Book 2 contributes is Butler's own `serve` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wrath` | `anger` (B2-P004) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`anger`); every other entry is Butler's own `wrath` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `wrath` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |

## ARROW B — one rendering, two or more Butler words, across Books

67 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `account` | `shall reckon` (B2-P008) | **`phrase-not-word`** | `Jove shall reckon with you in full` -> `Zeus will settle the account with you in full`, word for word the same in both accepted Books, of Butler's own sentence repeated verbatim across them. `settle the account` is one fixed idiom; its two head words happen to coincide with Butler's own `account` (three times in Book 4) and his own `settle` (Books 5 and 7). One idiom, not two borrowed words. Ruled the same way from the other head at (1/2, B, `settle`). |
| `after` | `after` (B2-P010), `after` (B2-P011), `after` (B2-P019), `after` (B2-P025), `after` (B2-P026), `after` (B2-P034), `assented whereon` (B2-P007) | **`common-rendering`** | `after` is a word Butler himself uses in 40 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `agreed` | `assented whereon` (B2-P007) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`assented whereon`); every other entry is Butler's own `agreed` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `agreed` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `anger` | `anger` (B2-P011), `wrath` (B2-P004) | **`unavoidable-merge`** | `anger` carries Butler's own `anger` in five Books, his `wrath of heaven` (B02-P004) and his `wife's resentment` (B01-P032). `wrath` is elevated and archaic and `anger` is its plain modern equivalent; `resentment` is current English and needed no change, but the referent is the same jealousy and the alternative is a register distinction Butler is not making. |
| `being` | `being` (B2-P004) | **`kept`** | every entry Book 2 contributes is Butler's own `being` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `beside` | `beside` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `beside` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `besides` | `besides` (B2-P008) | **`kept`** | every entry Book 2 contributes is Butler's own `besides` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `called` | `called` (B2-P025), `called` (B2-P031), `convened` (B2-P004) | **`common-rendering`** | `called` is a word Butler himself uses in 16 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `charge` | `charge` (B2-P013), `charge` (B2-P025) | **`kept`** | every entry Book 2 contributes is Butler's own `charge` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `children` | `children` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `children` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `cross` | `cross` (B2-P034) | **`unavoidable-merge`** | `cross` carries Butler's `traverse` at B08-P049 and his own `cross` in four accepted Books. `traverse the sea` is not plain modern English and `cross` is its only ordinary equivalent. |
| `eating` | `continue to eat` (B2-P011), `eating` (B2-P004), `eating` (B2-P007) | **`variant`** | `continue to eat up Telemachus's estate` -> `go on eating up` (B02-P011), beside Butler's own `eating` in the same Book. One verb in two forms: the rendering changes `continue` to `go on`, not `eat` to anything. |
| `enough` | `enough` (B2-P011), `enough` (B2-P021) | **`kept`** | every entry Book 2 contributes is Butler's own `enough` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `first` | `first` (B2-P002), `first` (B2-P004), `first` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `first` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `going` | `going` (B2-P010), `going` (B2-P019), `going` (B2-P021), `going` (B2-P023), `going` (B2-P026), `going` (B2-P034), `prating` (B2-P011) | **`common-rendering`** | `going` is a word Butler himself uses in 30 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `great` | `great` (B2-P004), `great` (B2-P006), `great` (B2-P007), `great` (B2-P015) | **`kept`** | every entry Book 2 contributes is Butler's own `great` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `guide` | `direct` (B2-P012) | **`unavoidable-merge`** | `guide` carries Butler's `conduct` (B06-P010), his `direct` (B01-P019 and B02-P012 — the same sentence in two Books, rendered identically) and his own `guide` (B05-P005). All three are Butler's free variants for showing somebody a way; `some heaven-sent message may direct you` and `may guide you` are the same sentence in his own idiom, and no discrimination exists to lose. |
| `handed` | `singlehanded` (B2-P004) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`singlehanded`); every other entry is Butler's own `handed` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `handed` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `harshly` | `rigorously` (B2-P008) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`rigorously`); every other entry is Butler's own `harshly` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `harshly` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `heads` | `fuddle them` (B2-P031), `heads` (B2-P014) | **`phrase-not-word`** | `She caused their drink to fuddle them` -> `made their drink go to their heads` (B02-P031). `go to someone's head` is a fixed idiom whose head noun coincides with Butler's own `heads` elsewhere (`wager their heads`, `the Malean heads`); there is no second referent. |
| `herald` | `herald` (B2-P004) | **`kept`** | every entry Book 2 contributes is Butler's own `herald` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `housekeeper` | `house keeper` (B2-P025) | **`variant`** | every rendering in the row reduces to `housekeeper` once inflection, D9 spelling and D15 compound spacing are normalized |
| `husband` | `husband` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `husband` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `keeping` | `keeping` (B2-P011), `keeping` (B2-P026) | **`kept`** | every entry Book 2 contributes is Butler's own `keeping` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `leather` | `leathern` (B2-P019), `leathern` (B2-P026) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`leathern`); every other entry is Butler's own `leather` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `leather` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `leave` | `leave` (B2-P004), `leave` (B2-P008) | **`kept`** | every entry Book 2 contributes is Butler's own `leave` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `maids` | `maids` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `maids` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `matter` | `matter` (B2-P003), `matter` (B2-P004) | **`variant`** | every rendering in the row reduces to `matter` once inflection, D9 spelling and D15 compound spacing are normalized |
| `meaning` | `meaning` (B2-P006) | **`kept`** | every entry Book 2 contributes is Butler's own `meaning` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `meanwhile` | `meanwhile` (B2-P022) | **`kept`** | every entry Book 2 contributes is Butler's own `meanwhile` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `myself` | `myself` (B2-P004), `myself` (B2-P011), `myself` (B2-P019) | **`kept`** | every entry Book 2 contributes is Butler's own `myself` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `offense` | `offence` (B2-P008) | **`unavoidable-merge`** | D9, `offence` -> `offense`, plus one recast: Butler's `you will not be offended with what I am going to say` (B01-P013) becomes `you will not take offense at what I am about to say`, which is the idiom Butler HIMSELF uses at B02-P008 and B06-P012 (`take offence at`). The merge makes Book 1 agree with two accepted Books on one speech act. |
| `onward` | `onward` (B2-P034) | **`variant`** | every rendering in the row reduces to `onward` once inflection, D9 spelling and D15 compound spacing are normalized |
| `opened` | `opening` (B2-P025) | **`variant`** | every rendering in the row reduces to `open` once inflection, D9 spelling and D15 compound spacing are normalized |
| `others` | `others` (B2-P022), `others` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `others` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `people` | `people` (B2-P001), `people` (B2-P009), `people` (B2-P012), `people` (B2-P015), `people` (B2-P021), `people` (B2-P027) | **`kept`** | every entry Book 2 contributes is Butler's own `people` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `places` | `places` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `places` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `plainly` | `plainly` (B2-P009), `plainly` (B2-P013) | **`kept`** | every entry Book 2 contributes is Butler's own `plainly` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `property` | `property` (B2-P021), `property` (B2-P024) | **`kept`** | every entry Book 2 contributes is Butler's own `property` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `rejoice` | `for rejoicing` (B2-P015) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`for rejoicing`); every other entry is Butler's own `rejoice` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `rejoice` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `search` | `quest` (B2-P012), `search` (B2-P018) | **`unavoidable-merge`** | **Butler himself alternates, inside one speech, which settles it.** He writes `sail the seas in search of my father who has so long been missing` at B02-P018 and `go to Sparta and to Pylos in quest of my father who has so long been missing` at B02-P012 — the same formula, six paragraphs apart, in his own two words. `quest` is archaic outside fixed phrases; `search` is what he means by both, and three accepted Books render it identically. |
| `settle` | `shall reckon` (B2-P008) | **`phrase-not-word`** | The other head of the same idiom — see (1/2, B, `account`). `settle the account` renders Butler's `reckon with you`, and `settle` in it is not a second use of his own `settle` at B05-P013 and B07-P008. |
| `single` | `singlehanded` (B2-P004) | **`kept-elsewhere`** | Book 2 supplies the row's only rendering (`singlehanded`); every other entry is Butler's own `single` carried through unchanged by another Book. There is one rendering decision in this row, not two, so there is nothing to reconcile. **Declared blind:** this class cannot say whether a Book that KEPT `single` should also have moved it. That residue is ruled by hand in `RULINGS_BY_BOOK` wherever the kept word is not current English in its own context (see `luscious` at Book 5). |
| `sitting` | `sitting` (B2-P031) | **`kept`** | every entry Book 2 contributes is Butler's own `sitting` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `someone` | `been missing some one` (B2-P012) | **`artifact`** | `some one` -> `someone`, a typographic normalization (D15, silent). Not a rendering. |
| `something` | `something` (B2-P011), `something` (B2-P012), `something` (B2-P015) | **`kept`** | every entry Book 2 contributes is Butler's own `something` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `somewhere` | `somewhere` (B2-P011) | **`kept`** | every entry Book 2 contributes is Butler's own `somewhere` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `strength` | `score` (B2-P007) | **`common-rendering`** | `strength` is a word Butler himself uses in 8 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `suppose` | `suppose` (B2-P011), `suppose` (B2-P023) | **`kept`** | every entry Book 2 contributes is Butler's own `suppose` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `talked` | `talked` (B2-P025) | **`unavoidable-merge`** | `talked` carries Butler's `converse` (B04-P052, B07-P028) and his own `talked` (B02-P025). `converse` as an intransitive verb is archaic and `talk` is its only plain modern equivalent; the alternative is a register difference Butler does not make. B07-P028 matches accepted B04-P052 word for word, which is the consistency the package asks for. |
| `telling` | `telling` (B2-P011), `telling` (B2-P030) | **`kept`** | every entry Book 2 contributes is Butler's own `telling` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `their` | `fuddle them` (B2-P031), `their` (B2-P002), `their` (B2-P004), `their` (B2-P009), `their` (B2-P010), `their` (B2-P014), `their` (B2-P019), `their` (B2-P031), `their` (B2-P032), `their` (B2-P034) | **`common-rendering`** | `their` is a word Butler himself uses in 105 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |
| `there` | `there` (B2-P003), `there` (B2-P004), `there` (B2-P006), `there` (B2-P008), `there` (B2-P014), `there` (B2-P015), `there` (B2-P019), `there` (B2-P025) | **`kept`** | every entry Book 2 contributes is Butler's own `there` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `those` | `those` (B2-P019) | **`kept`** | every entry Book 2 contributes is Butler's own `those` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `three` | `three` (B2-P002), `three` (B2-P006), `three` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `three` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `together` | `together` (B2-P001), `together` (B2-P026), `together` (B2-P033) | **`kept`** | every entry Book 2 contributes is Butler's own `together` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `until` | `until` (B2-P003) | **`phrase-not-word`** | `hitherto` -> `until now` at B07-P018, beside Butler's own `until` elsewhere. `until now` is a fixed adverbial phrase, not a second use of the preposition, and there is no second referent. Upheld. |
| `waste` | `waste` (B2-P012) | **`kept`** | every entry Book 2 contributes is Butler's own `waste` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `water` | `water` (B2-P030), `water` (B2-P034) | **`kept`** | every entry Book 2 contributes is Butler's own `water` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `where` | `where` (B2-P015), `where` (B2-P023), `where` (B2-P025), `where` (B2-P027) | **`kept`** | every entry Book 2 contributes is Butler's own `where` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `which` | `which` (B2-P011), `which` (B2-P014), `which` (B2-P015), `which` (B2-P019), `which` (B2-P030) | **`kept`** | every entry Book 2 contributes is Butler's own `which` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `wickedness` | `naughtiness` (B2-P014), `wickedness` (B2-P010) | **`unavoidable-merge`** | `violence in the naughtiness of their hearts` -> `in the wickedness of their hearts` (B02-P014), beside Butler's own `put a stop to this wickedness` (B02-P010). Butler's `naughtiness` is the older strong sense — it IS wickedness — and modern `naughtiness` means the opposite in force, so it had to move; both phrases name the same conduct of the same suitors four paragraphs apart, which is why the merge is the correct reading. |
| `without` | `without` (B2-P006), `without` (B2-P010), `without` (B2-P011), `without` (B2-P014), `without` (B2-P019), `without` (B2-P028) | **`kept`** | every entry Book 2 contributes is Butler's own `without` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `woman` | `woman` (B2-P006), `woman` (B2-P007), `woman` (B2-P029) | **`kept`** | every entry Book 2 contributes is Butler's own `woman` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `worked` | `worked` (B2-P002) | **`kept`** | every entry Book 2 contributes is Butler's own `worked` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `working` | `working` (B2-P007) | **`kept`** | every entry Book 2 contributes is Butler's own `working` carried through unchanged; the decision in this row belongs to whichever Book moved |
| `young` | `young` (B2-P003), `young` (B2-P011), `youngster` (B2-P023) | **`common-rendering`** | `young` is a word Butler himself uses in 33 paragraphs across seven Books, so its reuse as a rendering is not a decision; arrow B is ungated on this side on purpose and arrow C carries the residue |

## ARROW C — one paragraph, one rendering ← a word Butler keeps in that same paragraph

10 rows.

| key | this Book's entries | disposition | reason |
|---|---|---|---|
| `call` | `called them` (B2-P001) | **`variant`** | `sent the criers round to call the people in assembly, so they called them` -> `to call the people to assembly; they made the call`. One lexeme, verb and noun, inside Butler's own immediate repetition of it. There is no second word. |
| `made` | `called them` (B2-P001) | **`common-word`** | `made` is an ordinary word Butler uses in 72 paragraphs and the two uses share no referent |
| `speak` | `his speech` (B2-P002) | **`common-word`** | `speak` is an ordinary word Butler uses in 21 paragraphs and the two uses share no referent |
| `far` | `much` (B2-P011) | **`common-word`** | `far` is an ordinary word Butler uses in 37 paragraphs and the two uses share no referent |
| `give` | `make` (B2-P012) | **`common-word`** | `give` is an ordinary word Butler uses in 38 paragraphs and the two uses share no referent |
| `home` | `return` (B2-P012) | **`common-word`** | `home` is an ordinary word Butler uses in 93 paragraphs and the two uses share no referent |
| `never` | `will not return` (B2-P014) | **`common-word`** | `never` is an ordinary word Butler uses in 36 paragraphs and the two uses share no referent |
| `round` | `beat` (B2-P019) | **`common-word`** | `round` is an ordinary word Butler uses in 39 paragraphs and the two uses share no referent |
| `now` | `henceforward` (B2-P019) | **`common-word`** | `now` is an ordinary word Butler uses in 88 paragraphs and the two uses share no referent |
| `made` | `caused` (B2-P031) | **`common-word`** | `made` is an ordinary word Butler uses in 72 paragraphs and the two uses share no referent |

