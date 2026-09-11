# Glossary — stable renderings for the Hamlet modern edition

Started while drafting Act 1, Scene 1 (`ch01`). Rows are added before first
use in a later scene, not retrofitted; each row's "First used" tells you
which scene fixed it. The left column is the served `original-en`'s wording;
the middle column is the candidate rendering, used every time that wording
recurs unless a scene's `continuity.md` records an exception; the right
column explains why.

## Archaic grammar and forms of address

| Original | Candidate | Notes | First used |
|---|---|---|---|
| thou / thee / thy / thine / thyself | you / your / yours / yourself | Second-person singular, archaic even in Shakespeare's day for formal register; modern English has one second person. Never turned into "we". | ch01 |
| 'tis / 'twill / 'twas | it's / it'll / it was | | ch01 |
| hath | has | | ch01 |
| doth | does | | ch01 |
| e'en | even | Not used in ch01 draft yet; reserved. | — |
| dost / didst / art | do / did / are | Verb forms that go with "thou"; collapse to modern "do/did/are" with "you". | ch01 |
| -'d past participles (appear'd, reliev'd, seiz'd, gag'd, etc.) | -ed (appeared, relieved, seized, gaged, etc.) | Spelled out in full; the apostrophe marked a dropped unstressed "e" for the meter, not a different word. | ch01 |
| Marry (interjection) | — | Not met in ch01; when it appears, render as a plain interjection ("Indeed" / "Well") fitted to context, not literally "marry". | — |

## Address, titles, and period terms

| Original | Candidate | Notes | First used |
|---|---|---|---|
| the Dane (as a title for the King of Denmark) | the Dane | Kept as Shakespeare's own title-by-nationality (parallel to calling a French king "the Frenchman"); not glossed inline, since context (liegemen to the Dane) makes it plain enough on a first read, and rewriting it away would lose the idiom. | ch01 |
| liegemen | loyal subjects | Feudal term for sworn followers of a lord; "loyal subjects" is the plain modern equivalent in a line about allegiance to the crown. | ch01 |
| partisan (weapon) | spear | A partisan is a long-bladed pole weapon (a type of halberd); "partisan" now means something else entirely in English, so it is replaced with the closer general term rather than glossed. | ch01 |
| sledded Polacks | sledded Poles | "Polack" is Shakespeare's plain period word for a Pole (not derogatory in his usage); modernized to the current demonym. "Sledded" (traveling on sledges, i.e. sleds, over ice) is kept as the concrete image. | ch01 |
| russet mantle (of the morning) | dressed in reddish-brown | The image (dawn as a figure wearing a reddish-brown cloak) is kept, described rather than left in an unfamiliar color-word; "mantle" itself is folded into the description rather than kept as a separate archaic noun. | ch01 |
| the god of day | the god of day | Kept: a clear periphrasis for the sun, not obscure to a modern reader. | ch01 |
| Neptune's empire | the sea | Horatio's line uses Neptune metonymically for the sea/tides; "the sea" makes the literal sense explicit without losing the image, since the surrounding sentence already carries the personification ("the moist star… was sick"). | ch01 |
| climatures | lands / region | "Our climatures" = the lands or region under a given sky; rendered "our own lands" in context. | ch01 |
| whisper (= rumor) | whisper | Kept: "so the whisper goes" reads naturally in modern English as is. | ch01 |
| moiety competent | an equal portion | A moiety is a share or portion (not necessarily a half in Shakespeare's use); "competent" here means "sufficient/matching", so together: a portion equal to what was staked. | ch01 |
| shark'd up (a list of men) | gathered | "Shark up" = to gather indiscriminately/predatorily; rendered with the plain verb, since "shark" as a verb is obsolete in this sense and would mislead. | ch01 |
| resolutes | (lawless) men | "Lawless resolutes" = desperate, lawless men willing to take any risk; "a band of lawless men" carries the sense without the obsolete noun. | ch01 |

## Voice and form

- **Self-address is not at issue here** (unlike Meditations) — Hamlet is
  dialogue between characters, so "thou/you" changes are ordinary
  second-person modernization, not a shift in who is being addressed.
- **Speaker labels and stage directions are copied verbatim** from the served
  `original-en`, never modernized or reworded — they are already plain
  English (`[Enter Francisco and Barnardo, two sentinels]`, `[Exit.]`).
- **No expansion.** A one-line exchange stays one line; a long speech keeps
  its full argument, image for image, without added connective explanation.
- **No glosses beyond the glossary.** A period term is either translated to
  its plain modern equivalent (this table) or, if already clear, left as is;
  nothing is explained in a bracket or an added clause.
- **Verse capitalization.** Where the source paragraph capitalizes the start
  of each verse line inside one flowing sentence (a holdover from the
  original layout, flattened into the JSON string), the candidate follows
  ordinary modern sentence capitalization instead — capitals only at the
  start of a sentence — since the line breaks themselves are not preserved
  in the served JSON and keeping mid-sentence capitals would look like an
  error rather than a verse convention.
- **Punctuation.** Straight apostrophes and quotation marks, em dashes
  without spaces, matching the staged original's convention.
- **Spelling.** American, matching the served editions' convention
  (e.g. "armor", not "armour").
