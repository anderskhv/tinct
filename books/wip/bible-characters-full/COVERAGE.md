# Coverage

All numbers are for the accepted candidate `package/bible.v1.json` (contentVersion `2026-09-30.1`, SHA-256 `740258f37b4944efb105e40bb32b6e22d18d262548d2154f77ac271d3f24c9ed`), computed from the pinned edition bytes in `SOURCES-PINNED.md`.

## Per-edition summary

| | kjv-en | web-en | bsb-en | webc-en |
|---|---:|---:|---:|---:|
| Characters | 149 | 149 | 149 | 195 |
| Characters with ≥1 link | 149 | 149 | 149 | 195 |
| **Links (mentions)** | **9,948** | **10,026** | **11,034** | **11,175** |
| Links in the live file (main fe699e90) | 1,444 | 1,437 | none | none |
| Name-form hits scanned (person lexicon, 235 forms) | 14,645 | 14,730 | 15,083 | 16,279 |
| … linked as a person | 9,749 | 9,823 | 10,825 | 10,970 |
|    – by name-range rule | 9,041 | 9,112 | 10,061 | 9,873 |
|    – by context pattern (e.g. “John the Baptist”) | 106 | 101 | 97 | 99 |
|    – by per-occurrence adjudication | 602 | 610 | 667 | 998 |
| … deliberately **not** linked | 4,896 | 4,907 | 4,258 | 5,309 |
|    – tribe / nation / other person / place by rule range | 4,127 | 4,160 | 3,517 | 4,425 |
|    – “house of X” / “X’s house” (dynasty, family) | 318 | 318 | 304 | 335 |
|    – city / tower / tent of X (place compounds) | 57 | 66 | 58 | 70 |
|    – by context pattern (e.g. “Simon the tanner”) | 26 | 22 | 18 | 19 |
|    – by per-occurrence adjudication | 355 | 331 | 351 | 449 |
|    – by verse ruling (RULINGS.md) | 11 | 9 | 9 | 9 |
|    – type use (“the last Adam”, “sons of Adam”) | 2 | 1 | 1 | 2 |

Every hit of a lexicon name form is in exactly one of these buckets, and every unlinked bucket is either a rule range, a pattern, or a per-occurrence decision recorded in `identity-decisions.jsonl`/`RULINGS.md`. The cap of about 20 links per major character is gone.

Non-person cards (God/the LORD, Ark, the Temple, Babylon, Zion) are **not** expanded: they are carried forward at their old sampled counts and re-anchored by verse (see Open questions in README). Holy Spirit, the Word, the Lamb and the Eden serpent are completed by exact phrase.

## Headline characters (links per edition; old = live file)

| Character | old kjv | old web | kjv-en | web-en | bsb-en | webc-en |
|---|---:|---:|---:|---:|---:|---:|
| David (`david`) | 20 | 20 | 980 | 1054 | 1041 | 1064 |
| Jesus (`jesus`) | 20 | 20 | 1541 | 1532 | 1971 | 1538 |
| Moses (`moses`) | 20 | 20 | 847 | 849 | 870 | 877 |
| Abraham (`abraham`) | 40 | 40 | 311 | 313 | 335 | 326 |
| Simon Peter (`simon-peter`) | 20 | 20 | 199 | 199 | 220 | 200 |
| Paul (`saul-paul`) | 40 | 40 | 187 | 186 | 249 | 186 |
| Israel (`jacob`) | 40 | 40 | 266 | 270 | 298 | 282 |
| Joseph (`joseph-patriarch`) | 20 | 20 | 180 | 179 | 211 | 183 |
| Solomon (`solomon`) | 20 | 20 | 301 | 303 | 308 | 308 |
| John the Baptist (`john-the-baptist`) | 14 | 14 | 92 | 92 | 110 | 92 |
| John (`john-apostle`) | 14 | 14 | 35 | 34 | 40 | 35 |
| Mary (`mary-mother-of-jesus`) | 14 | 14 | 19 | 19 | 21 | 19 |
| Mary Magdalene (`mary-magdalene`) | 11 | 11 | 15 | 15 | 15 | 15 |
| Judas Iscariot (`judas-iscariot`) | 14 | 14 | 22 | 22 | 34 | 22 |
| Herod Antipas (`herod-antipas`) | 8 | 8 | 27 | 27 | 31 | 27 |
| Herod (`herod-the-great`) | 8 | 8 | 10 | 10 | 10 | 10 |
| Elijah (`elijah`) | 20 | 20 | 98 | 98 | 123 | 102 |
| Isaiah (`isaiah`) | 20 | 20 | 53 | 53 | 56 | 55 |
| Jeremiah (`jeremiah`) | 20 | 20 | 138 | 138 | 142 | 145 |
| Pontius Pilate (`pontius-pilate`) | 14 | 14 | 56 | 56 | 64 | 56 |
| the Lamb (`the-lamb`) | 14 | 14 | 28 | 29 | 35 | 29 |
| the Holy Spirit (`holy-spirit`) | 14 | 14 | 91 | 93 | 94 | 96 |

Counts differ between editions because the translations differ in wording, not because coverage differs: WEB and WEBC say “David’s city” where KJV and BSB say “city of David” (all unlinked); BSB says “Jesus” where KJV often has “Christ”; the BSB text is longer (one poetic line per paragraph) and repeats some names; WEBC adds the Catholic books.

## Independent completeness sample (20 characters per edition)

For each edition two independent reviewers took 10 characters each (20 in total), counted every occurrence of the character’s name forms in the pinned text with their own regex, and matched them to the package by offset. Reports are in `review/completeness/`. They were run on the pre-fix candidate; every finding was applied or ruled on (`REVIEW-RECORD.md`). Result before fixes: 0 orphan links in all eight reports; the misses and wrong links are listed in the record.

| Edition | Reviewer A characters | Reviewer B characters |
|---|---|---|
| kjv-en, web-en, bsb-en | david, moses, jesus, abraham, simon-peter, saul-paul, pontius-pilate, judas-iscariot, mary-magdalene, herod-the-great | isaac, solomon, samuel, elijah, isaiah, jeremiah, stephen, barnabas, hezekiah, nebuchadnezzar |
| webc-en | the same ten as A | samuel, elijah, isaiah, jeremiah, judith, holofernes, tobit, tobias, susanna, judas-maccabeus |

## New Catholic-only characters (webc-en only, 46 cards)

| id | name | links | first mention (chapter.paragraph.offset) |
|---|---|---:|---|
| `tobit` | Tobit | 23 | 1190.0.27 |
| `tobias` | Tobias | 32 | 1190.1.1348 |
| `anna-tobit` | Anna | 8 | 1190.1.1279 |
| `raguel` | Raguel | 23 | 1192.2.52 |
| `edna` | Edna | 7 | 1196.0.172 |
| `sarah-raguel` | Sarah | 12 | 1192.2.30 |
| `raphael-angel` | Raphael | 14 | 1192.3.70 |
| `ahikar` | Ahikar | 7 | 1190.2.1049 |
| `asmodaeus` | Asmodaeus | 2 | 1192.2.197 |
| `judith` | Judith | 32 | 1211.0.16 |
| `holofernes` | Holofernes | 45 | 1205.1.94 |
| `achior` | Achior | 13 | 1208.1.7 |
| `uzziah-bethulia` | Ozias | 13 | 1209.4.189 |
| `nebuchadnezzar-judith` | Nebuchadnezzar | 20 | 1204.0.38 |
| `susanna` | Susanna | 10 | 1327.0.84 |
| `joakim-susanna` | Joakim | 6 | 1327.0.43 |
| `mattathias` | Mattathias | 11 | 1221.0.16 |
| `judas-maccabeus` | Judas Maccabaeus | 163 | 1221.0.231 |
| `jonathan-maccabeus` | Jonathan | 92 | 1221.0.303 |
| `simon-maccabeus` | Simon | 68 | 1221.0.199 |
| `antiochus-epiphanes` | Antiochus Epiphanes | 25 | 1220.2.41 |
| `eleazar-scribe` | Eleazar | 2 | 1241.4.3 |
| `onias-iii` | Onias | 15 | 1238.0.116 |
| `menelaus` | Menelaus | 17 | 1239.4.48 |
| `heliodorus` | Heliodorus | 13 | 1238.0.1096 |
| `jesus-ben-sira` | Jesus son of Sirach | 3 | 1270.0.398 |
| `nicanor` | Nicanor | 41 | 1222.8.46 |
| `bacchides` | Bacchides | 20 | 1226.1.467 |
| `alcimus` | Alcimus | 15 | 1226.1.57 |
| `gorgias` | Gorgias | 11 | 1222.8.59 |
| `tryphon` | Tryphon | 21 | 1230.7.291 |
| `lysias` | Lysias | 24 | 1222.7.889 |
| `razis` | Razis | 1 | 1249.8.52 |
| `bagoas` | Bagoas | 6 | 1215.5.160 |
| `manasses-judith` | Manasses | 6 | 1211.0.360 |
| `gabael` | Gabael | 7 | 1190.1.1723 |
| `demetrius-i` | Demetrius I | 19 | 1226.0.39 |
| `demetrius-ii` | Demetrius II | 27 | 1229.17.40 |
| `alexander-balas` | Alexander Balas | 24 | 1229.0.36 |
| `ptolemy-philometor` | Ptolemy Philometor | 13 | 1220.4.274 |
| `ptolemy-dorymenes` | Ptolemy son of Dorymenes | 3 | 1222.8.16 |
| `ptolemy-abubus` | Ptolemy son of Abubus | 3 | 1235.2.3 |
| `jason-high-priest` | Jason | 11 | 1236.1.200 |
| `apollonius-samaria` | Apollonius | 2 | 1222.1.3 |
| `apollonius-coelesyria` | Apollonius | 5 | 1229.17.226 |
| `apollonius-menestheus` | Apollonius | 2 | 1239.0.535 |

The 149 existing ids are unchanged and no id was removed. The 46 new ids exist only in `webc-en`; the other three editions do not contain the Catholic-only books.

## Per-character counts (all ids)

| id | name | old kjv | old web | kjv-en | web-en | bsb-en | webc-en |
|---|---|---:|---:|---:|---:|---:|---:|
| `aaron` | Aaron | 14 | 14 | 346 | 347 | 356 | 355 |
| `abel` | Abel | 8 | 8 | 12 | 12 | 12 | 12 |
| `abraham` | Abraham | 40 | 40 | 311 | 313 | 335 | 326 |
| `absalom` | Absalom | 8 | 8 | 108 | 109 | 100 | 110 |
| `achior` | Achior | – | – | – | – | – | 13 |
| `adam` | Adam | 14 | 8 | 28 | 18 | 20 | 21 |
| `agrippa-ii` | Agrippa | 5 | 5 | 12 | 12 | 11 | 12 |
| `ahab` | Ahab | 14 | 14 | 74 | 74 | 78 | 74 |
| `ahikar` | Ahikar | – | – | – | – | – | 7 |
| `alcimus` | Alcimus | – | – | – | – | – | 15 |
| `alexander-balas` | Alexander Balas | – | – | – | – | – | 24 |
| `amos` | Amos | 7 | 7 | 7 | 7 | 7 | 8 |
| `ananias-and-sapphira` | Ananias and Sapphira | 1 | 1 | 4 | 4 | 4 | 4 |
| `ananias-of-damascus` | Ananias | 5 | 5 | 6 | 6 | 6 | 6 |
| `andrew` | Andrew | 8 | 8 | 13 | 13 | 13 | 13 |
| `anna-tobit` | Anna | – | – | – | – | – | 8 |
| `antiochus-epiphanes` | Antiochus Epiphanes | – | – | – | – | – | 25 |
| `apollonius-coelesyria` | Apollonius | – | – | – | – | – | 5 |
| `apollonius-menestheus` | Apollonius | – | – | – | – | – | 2 |
| `apollonius-samaria` | Apollonius | – | – | – | – | – | 2 |
| `apollos` | Apollos | 5 | 5 | 10 | 10 | 11 | 10 |
| `ark-of-the-covenant` | the Ark of the Covenant | 14 | 14 | 14 | 14 | 14 | 14 |
| `asa` | Asa | 5 | 5 | 59 | 59 | 60 | 59 |
| `asmodaeus` | Asmodaeus | – | – | – | – | – | 2 |
| `babylon` | Babylon | 14 | 14 | 14 | 14 | 14 | 14 |
| `bacchides` | Bacchides | – | – | – | – | – | 20 |
| `bagoas` | Bagoas | – | – | – | – | – | 6 |
| `balaam` | Balaam | 8 | 8 | 63 | 63 | 73 | 63 |
| `barabbas` | Barabbas | 5 | 5 | 11 | 11 | 12 | 11 |
| `barnabas` | Barnabas | 8 | 8 | 30 | 30 | 36 | 30 |
| `baruch-neriah` | Baruch | 8 | 8 | 23 | 23 | 24 | 25 |
| `bathsheba` | Bathsheba | 8 | 8 | 10 | 11 | 14 | 11 |
| `benjamin` | Benjamin | 8 | 8 | 20 | 20 | 20 | 20 |
| `boaz` | Boaz | 8 | 8 | 25 | 25 | 30 | 27 |
| `caesar-augustus` | Caesar Augustus | 5 | 2 | 1 | 1 | 1 | 1 |
| `caiaphas` | Caiaphas | 8 | 8 | 9 | 9 | 10 | 9 |
| `cain` | Cain | 8 | 8 | 19 | 20 | 23 | 20 |
| `caleb` | Caleb | 8 | 8 | 27 | 27 | 31 | 30 |
| `cornelius` | Cornelius | 5 | 5 | 10 | 9 | 10 | 9 |
| `cyrus` | Cyrus | 8 | 8 | 23 | 23 | 22 | 24 |
| `daniel` | Daniel | 20 | 20 | 77 | 77 | 71 | 111 |
| `daniels-companions` | Shadrach, Meshach, and Abednego | 8 | 8 | 60 | 60 | 60 | 61 |
| `david` | David | 20 | 20 | 980 | 1054 | 1041 | 1064 |
| `deborah` | Deborah | 8 | 8 | 9 | 9 | 10 | 9 |
| `delilah` | Delilah | 6 | 6 | 6 | 6 | 7 | 6 |
| `demetrius-i` | Demetrius I | – | – | – | – | – | 19 |
| `demetrius-ii` | Demetrius II | – | – | – | – | – | 27 |
| `demetrius-silversmith` | Demetrius | 2 | 2 | 2 | 2 | 3 | 2 |
| `edna` | Edna | – | – | – | – | – | 7 |
| `eleazar-scribe` | Eleazar | – | – | – | – | – | 2 |
| `eli` | Eli | 8 | 8 | 30 | 31 | 37 | 31 |
| `elijah` | Elijah | 20 | 20 | 98 | 98 | 123 | 102 |
| `elisha` | Elisha | 14 | 14 | 59 | 59 | 110 | 62 |
| `esau` | Esau | 8 | 8 | 84 | 86 | 88 | 86 |
| `esther` | Esther | 20 | 20 | 57 | 56 | 49 | 45 |
| `eve` | Eve | 2 | 2 | 4 | 4 | 4 | 5 |
| `ezekiel` | Ezekiel | 2 | 2 | 2 | 2 | 2 | 3 |
| `ezra` | Ezra | 14 | 14 | 22 | 22 | 26 | 22 |
| `felix` | Felix | 5 | 5 | 9 | 9 | 9 | 9 |
| `festus` | Festus | 5 | 5 | 13 | 13 | 16 | 13 |
| `gabael` | Gabael | – | – | – | – | – | 7 |
| `gamaliel` | Gamaliel | 5 | 5 | 2 | 2 | 3 | 2 |
| `gideon` | Gideon | 14 | 14 | 53 | 53 | 70 | 54 |
| `god-the-lord` | God | 20 | 20 | 20 | 20 | 20 | 20 |
| `gorgias` | Gorgias | – | – | – | – | – | 11 |
| `habakkuk` | Habakkuk | 2 | 2 | 2 | 2 | 2 | 7 |
| `hagar` | Hagar | 8 | 8 | 12 | 14 | 17 | 14 |
| `haggai` | Haggai | 5 | 5 | 11 | 11 | 11 | 11 |
| `haman` | Haman | 8 | 8 | 53 | 53 | 51 | 55 |
| `heliodorus` | Heliodorus | – | – | – | – | – | 13 |
| `herod-antipas` | Herod Antipas | 8 | 8 | 27 | 27 | 31 | 27 |
| `herod-the-great` | Herod | 8 | 8 | 10 | 10 | 10 | 10 |
| `hezekiah` | Hezekiah | 14 | 14 | 127 | 127 | 139 | 131 |
| `holofernes` | Holofernes | – | – | – | – | – | 45 |
| `holy-spirit` | the Holy Spirit | 14 | 14 | 91 | 93 | 94 | 96 |
| `hosea` | Hosea | 3 | 3 | 4 | 4 | 6 | 4 |
| `isaac` | Isaac | 14 | 14 | 130 | 130 | 139 | 136 |
| `isaiah` | Isaiah | 20 | 20 | 53 | 53 | 56 | 55 |
| `ishmael` | Ishmael | 8 | 8 | 20 | 20 | 22 | 20 |
| `jacob` | Israel | 40 | 40 | 266 | 270 | 298 | 282 |
| `james-the-just` | James | 8 | 8 | 11 | 11 | 11 | 11 |
| `james-zebedee` | James son of Zebedee | 8 | 8 | 21 | 21 | 21 | 21 |
| `jason-high-priest` | Jason | – | – | – | – | – | 11 |
| `jehoshaphat` | Jehoshaphat | 5 | 5 | 77 | 77 | 79 | 77 |
| `jehu` | Jehu | 8 | 8 | 49 | 49 | 70 | 49 |
| `jeremiah` | Jeremiah | 20 | 20 | 138 | 138 | 142 | 145 |
| `jeroboam` | Jeroboam | 8 | 8 | 79 | 79 | 80 | 80 |
| `jesus` | Jesus | 20 | 20 | 1541 | 1532 | 1971 | 1538 |
| `jesus-ben-sira` | Jesus son of Sirach | – | – | – | – | – | 3 |
| `jezebel` | Jezebel | 14 | 14 | 22 | 22 | 22 | 22 |
| `joab` | Joab | 8 | 8 | 139 | 140 | 149 | 140 |
| `joakim-susanna` | Joakim | – | – | – | – | – | 6 |
| `job` | Job | 20 | 20 | 59 | 59 | 67 | 59 |
| `jobs-friends` | Eliphaz, Bildad, and Zophar | 8 | 8 | 15 | 15 | 15 | 15 |
| `joel` | Joel | 1 | 1 | 2 | 2 | 2 | 2 |
| `john-apostle` | John | 14 | 14 | 35 | 34 | 40 | 35 |
| `john-the-baptist` | John the Baptist | 14 | 14 | 92 | 92 | 110 | 92 |
| `jonah` | Jonah | 14 | 14 | 28 | 28 | 30 | 30 |
| `jonathan` | Jonathan | 8 | 8 | 97 | 97 | 97 | 97 |
| `jonathan-maccabeus` | Jonathan | – | – | – | – | – | 92 |
| `joseph-husband-of-mary` | Joseph | 8 | 8 | 16 | 16 | 15 | 16 |
| `joseph-of-arimathea` | Joseph of Arimathea | 5 | 5 | 6 | 6 | 7 | 6 |
| `joseph-patriarch` | Joseph | 20 | 20 | 180 | 179 | 211 | 183 |
| `joshua` | Joshua | 20 | 20 | 209 | 210 | 210 | 213 |
| `josiah` | Josiah | 14 | 14 | 54 | 54 | 64 | 57 |
| `judah-patriarch` | Judah | 8 | 8 | 35 | 35 | 38 | 35 |
| `judas-iscariot` | Judas Iscariot | 14 | 14 | 22 | 22 | 34 | 22 |
| `judas-maccabeus` | Judas Maccabaeus | – | – | – | – | – | 163 |
| `jude-apostle` | Jude | 1 | 1 | 3 | 3 | 3 | 3 |
| `judith` | Judith | – | – | – | – | – | 32 |
| `lazarus-of-bethany` | Lazarus | 8 | 8 | 11 | 11 | 15 | 11 |
| `leah` | Leah | 8 | 8 | 34 | 34 | 36 | 35 |
| `lot` | Lot | 8 | 8 | 34 | 34 | 37 | 36 |
| `luke-evangelist` | Luke | 2 | 2 | 2 | 2 | 2 | 2 |
| `lydia` | Lydia | 3 | 2 | 2 | 2 | 2 | 2 |
| `lysias` | Lysias | – | – | – | – | – | 24 |
| `malachi` | Malachi | 1 | 1 | 1 | 1 | 1 | 1 |
| `manasseh-king` | Manasseh | 5 | 5 | 26 | 26 | 32 | 26 |
| `manasses-judith` | Manasses | – | – | – | – | – | 6 |
| `mark-evangelist` | Mark | 4 | 4 | 12 | 12 | 12 | 12 |
| `martha` | Martha | 8 | 8 | 13 | 13 | 14 | 13 |
| `mary-magdalene` | Mary Magdalene | 11 | 11 | 15 | 15 | 15 | 15 |
| `mary-mother-of-jesus` | Mary | 14 | 14 | 19 | 19 | 21 | 19 |
| `mary-of-bethany` | Mary of Bethany | 8 | 8 | 11 | 11 | 12 | 11 |
| `mattathias` | Mattathias | – | – | – | – | – | 11 |
| `matthew-apostle` | Matthew | 4 | 4 | 8 | 8 | 13 | 8 |
| `melchizedek` | Melchizedek | 2 | 5 | 11 | 11 | 14 | 11 |
| `menelaus` | Menelaus | – | – | – | – | – | 17 |
| `micah` | Micah | 1 | 1 | 2 | 2 | 2 | 2 |
| `miriam` | Miriam | 8 | 8 | 14 | 14 | 12 | 14 |
| `mordecai` | Mordecai | 8 | 8 | 58 | 58 | 60 | 59 |
| `moses` | Moses | 20 | 20 | 847 | 849 | 870 | 877 |
| `naaman` | Naaman | 5 | 5 | 12 | 12 | 19 | 12 |
| `nahum` | Nahum | 1 | 1 | 1 | 1 | 1 | 1 |
| `naomi` | Naomi | 8 | 8 | 21 | 21 | 30 | 22 |
| `nathan-prophet` | Nathan | 8 | 8 | 29 | 30 | 31 | 31 |
| `nathanael` | Nathanael | 5 | 5 | 6 | 6 | 6 | 7 |
| `nebuchadnezzar` | Nebuchadnezzar | 14 | 14 | 91 | 91 | 95 | 97 |
| `nebuchadnezzar-judith` | Nebuchadnezzar | – | – | – | – | – | 20 |
| `nehemiah` | Nehemiah | 8 | 8 | 5 | 5 | 6 | 14 |
| `nicanor` | Nicanor | – | – | – | – | – | 41 |
| `nicodemus` | Nicodemus | 5 | 5 | 5 | 5 | 5 | 5 |
| `noah` | Noah | 14 | 14 | 54 | 54 | 57 | 56 |
| `obadiah-prophet` | Obadiah | 1 | 1 | 1 | 1 | 1 | 1 |
| `onesimus` | Onesimus | 2 | 2 | 2 | 2 | 2 | 2 |
| `onias-iii` | Onias | – | – | – | – | – | 15 |
| `pharaoh-exodus` | Pharaoh | 14 | 14 | 130 | 130 | 135 | 133 |
| `philemon` | Philemon | 1 | 1 | 1 | 1 | 1 | 1 |
| `philip-apostle` | Philip | 5 | 5 | 16 | 16 | 15 | 16 |
| `pontius-pilate` | Pontius Pilate | 14 | 14 | 56 | 56 | 64 | 56 |
| `priscilla-and-aquila` | Priscilla and Aquila | 5 | 5 | 12 | 12 | 14 | 12 |
| `ptolemy-abubus` | Ptolemy son of Abubus | – | – | – | – | – | 3 |
| `ptolemy-dorymenes` | Ptolemy son of Dorymenes | – | – | – | – | – | 3 |
| `ptolemy-philometor` | Ptolemy Philometor | – | – | – | – | – | 13 |
| `rachel` | Rachel | 8 | 8 | 47 | 48 | 49 | 48 |
| `raguel` | Raguel | – | – | – | – | – | 23 |
| `rahab` | Rahab | 8 | 8 | 8 | 8 | 11 | 8 |
| `raphael-angel` | Raphael | – | – | – | – | – | 14 |
| `razis` | Razis | – | – | – | – | – | 1 |
| `rebekah` | Rebekah | 8 | 8 | 31 | 31 | 32 | 31 |
| `rehoboam` | Rehoboam | 8 | 8 | 52 | 52 | 56 | 53 |
| `ruth` | Ruth | 12 | 12 | 13 | 13 | 24 | 13 |
| `samson` | Samson | 14 | 14 | 39 | 39 | 50 | 39 |
| `samuel` | Samuel | 20 | 20 | 143 | 142 | 142 | 144 |
| `sarah` | Sarah | 28 | 28 | 59 | 59 | 56 | 59 |
| `sarah-raguel` | Sarah | – | – | – | – | – | 12 |
| `satan` | Satan | 14 | 14 | 87 | 87 | 84 | 88 |
| `saul-king` | Saul | 14 | 14 | 376 | 382 | 385 | 383 |
| `saul-paul` | Paul | 40 | 40 | 187 | 186 | 249 | 186 |
| `sennacherib` | Sennacherib | 8 | 8 | 13 | 13 | 18 | 18 |
| `serpent-eden` | the serpent | 6 | 6 | 6 | 6 | 6 | 6 |
| `silas` | Silas | 8 | 8 | 17 | 16 | 21 | 16 |
| `simon-maccabeus` | Simon | – | – | – | – | – | 68 |
| `simon-magus` | Simon Magus | 5 | 5 | 4 | 4 | 4 | 4 |
| `simon-peter` | Simon Peter | 20 | 20 | 199 | 199 | 220 | 200 |
| `solomon` | Solomon | 20 | 20 | 301 | 303 | 308 | 308 |
| `stephen` | Stephen | 7 | 7 | 7 | 7 | 14 | 7 |
| `susanna` | Susanna | – | – | – | – | – | 10 |
| `the-lamb` | the Lamb | 14 | 14 | 28 | 29 | 35 | 29 |
| `the-other-apostles` | Bartholomew, James son of Alphaeus, Thaddaeus, and Simon the Zealot | 3 | 4 | 20 | 18 | 17 | 18 |
| `the-temple` | the Temple | 14 | 14 | 12 | 13 | 12 | 12 |
| `the-word` | the Word | 4 | 3 | 6 | 6 | 6 | 6 |
| `thomas` | Thomas | 12 | 11 | 12 | 11 | 11 | 11 |
| `timothy` | Timothy | 7 | 8 | 24 | 24 | 26 | 24 |
| `titus` | Titus | 5 | 5 | 13 | 13 | 14 | 14 |
| `tobias` | Tobias | – | – | – | – | – | 32 |
| `tobit` | Tobit | – | – | – | – | – | 23 |
| `tryphon` | Tryphon | – | – | – | – | – | 21 |
| `uriah` | Uriah the Hittite | 5 | 5 | 27 | 27 | 28 | 27 |
| `uzziah-bethulia` | Ozias | – | – | – | – | – | 13 |
| `zacchaeus` | Zacchaeus | 3 | 3 | 3 | 3 | 4 | 4 |
| `zechariah-prophet` | Zechariah | 4 | 4 | 6 | 6 | 6 | 6 |
| `zephaniah` | Zephaniah | 1 | 1 | 1 | 1 | 1 | 1 |
| `zerubbabel` | Zerubbabel | 5 | 5 | 25 | 25 | 25 | 26 |
| `zion` | Zion | 8 | 8 | 8 | 8 | 8 | 8 |
