# Rulings for identity-ambiguous names

Machine-readable copies: `rulings.json` (this file’s tables) and `identity-decisions.jsonl` (one line per reviewed occurrence: edition|chapter.paragraph.offset, reference, name form, final card or `NONE`, basis, adjudicator reason, independent reviewer’s answer). The full adjudication policy the adjudicators and reviewers worked under is `review/ADJUDICATION-POLICY.md`.

## Principles applied

1. **Identity first, from the verse and its context.** Every occurrence of an ambiguous name (Mary, James, John, Judas/Judah, Simon/Simeon, Joseph, Herod, Philip, Zechariah, Ananias, Jacob/Israel, Jesus/Joshua, Elijah/Elias, Devil/Satan, the Maccabean Judas/Jonathan/Simon/Antiochus, Tobit’s Sarah/Anna and so on) was either resolved by an explicit range or context rule, or read and decided one by one. Undecidable cases are **not linked**, and the reason is recorded.
2. **Name variants are linked, pronouns are not.** Elias/Elijah, Esaias/Isaiah, Jeremias/Jeremy/Jeremiah, Simon Peter/Peter/Cephas, Simeon at Acts 15:14, Saul/Paul, Sarai/Sarah, Abram/Abraham, Noe/Noah, Hoshea/Joshua, Rachab/Rahab, Shemuel (1 Chr 6:33), the Levi of Mark 2/Luke 5 and Silvanus/Silas all resolve to the person.
3. **Tribes, nations, dynasties and places are not the person.** Where “Israel” or “Jacob” means the *people* (children of Israel, house of Jacob, God/King/Holy One of Israel, kingdom of Israel, Jacob in Numbers 23–24 and the Psalms) it is linked to the separate card `israel-the-people`, not to the patriarch. “Judah” as tribe or land, “house of X”/“X’s house”, “tribe of”, “sons of X” in a census or tribal context; “city/tower/tent of David”; “the temple of Babylon” are not linked. A patronymic or genealogy that names the man (“Manasseh son of Joseph”, “God of Abraham, Isaac and Jacob”, “sons of Israel” inside the Genesis 32–50 family narrative) is linked.
4. **Poetic Jacob/Israel parallelism is linked to `israel-the-people`** (Psalms, prophets, Numbers 23–24, tribal blessings). Where the verse itself is about the man — patriarch formulas (“Abraham, Isaac and Israel”), “son of Israel”, “born to Israel”, “Reuben the firstborn of Israel”, “Israel our father”, and the verses the blind reviewers read as the man (Ps 105:10 and 23, 1 Chr 16:17, Ezek 28:25 and 37:25, Mic 7:20, Isa 58:14, Mal 1:2 “Esau Jacob’s brother”) — it is linked to the patriarch `jacob`.
5. **Non-persons are not people.** A demon or human “devil” is not Satan; “the last Adam” is Christ, not the first man; Tubal-Cain is not Cain; Rahab of Isaiah 30:7 is Egypt; Nahum in Luke 3:25 is an ancestor, not the prophet; Augustus’ band (Acts 27:1) and the Augustus of Acts 25 (Nero) are not Luke 2’s emperor; “no temple” in Rev 21:22 and the temple of Babylon are not the Jerusalem temple.
6. **A person who shares a name with a card but is another person has no card** (other Jeremiahs, Ahab’s court, Ananias the high priest, Philip the tetrarch, Mary the wife of Clopas, Mary mother of James, Simon of Cyrene, Judas of Galilee …): not linked.

## The seven coding-window review hypotheses (verified independently, edition by edition)

These were *hypotheses*, not rulings. Each was checked against the exact span in the pinned text of all four editions; results are from the final package.

| Hypothesis | Evidence in the text / old link | Ruling |
|---|---|---|
| Mary at 975.3 (Luke 2:16, 2:19) | Old link: `mary-of-bethany`. The shepherds find “Mary and Joseph and the babe”; 2:19 “Mary kept all these things”. | **Confirmed wrong → `mary-mother-of-jesus`** in all four editions. Same error fixed at Luke 1:27 and 1:39. |
| Mary at 983.7 (Luke 10:39) | Old link: `mary-mother-of-jesus`. “a sister called Mary, who also sat at Jesus’ feet”, sister of Martha in the same scene. | **Confirmed wrong → `mary-of-bethany`** in all four editions. John 11:19 and 11:32 corrected the same way. |
| James at 1019.2 (Acts 1:13) | Old links: first James → `james-the-just`; “James the son of Alphaeus” → `james-the-just`; “Simon Zelotes” → `simon-magus`; Judas → `judas-iscariot` (WEB). The list is the eleven apostles after the Ascension (Iscariot is dead, 1:16–20). | **Confirmed and extended.** First James (“Peter, James, John …”) → `james-zebedee`; James son of Alphaeus → `the-other-apostles`; Simon (Zelotes/the Zealot) → `the-other-apostles`; Judas “the brother/son of James” → `the-other-apostles` (not Iscariot); the James inside “Judas the brother/son of James” → **not linked** (verse ruling: the text does not say which James). Same treatment at Luke 6:14–16 and Mark 3:17–18. |
| James at 1039.3 (Acts 21:18) | Old link: `james-zebedee`. Paul goes “unto James; and all the elders”. Zebedee’s James was killed in Acts 12:2. | **Confirmed wrong → `james-the-just`** (the Jerusalem leader; also Acts 12:17, 15:13, Gal 1:19, 2:9, 2:12, Jude 1). Acts 12:2 corrected to `james-zebedee`. |
| Herod at 931.0 (Matthew 2:1, 2:3 …) | Old link: `herod-antipas`. “Herod the king” at the birth of Jesus. | **Confirmed wrong → `herod-the-great`** (Matthew 2 ×9, Luke 1:5). `herod-antipas` is now the Galilean tetrarch (Matt 14, Mark 6, Luke 3:1, 3:19, 9:7–9, 13:31, 23:7–15, Acts 4:27, 13:1). “Herod the king” of Acts 12 (Agrippa I), Acts 12:6 and Acts 23:35 are not linked (no card). |
| John 19:25 (reader 1016.4) | Old links: `Mary` at .730 → `mary-mother-of-jesus`; `Mary` at .761 → `mary-of-bethany`. The verse lists his mother (unnamed), his mother’s sister “Mary the wife of Cleophas/Clopas”, and Mary Magdalene. | **Confirmed.** “Mary the wife of Cleophas/Clopas” has no card → **not linked**; “Mary Magdalene” → `mary-magdalene` (whole name as one span). The mother is not named in the verse, so nothing is linked for her here. |
| John 20:16 (reader 1017.3) | Old link: `mary-mother-of-jesus` (and `mary-of-bethany` at 20:18). “Jesus saith unto her, Mary.” | **Confirmed wrong → `mary-magdalene`** (John 20:1, 11–18) in all four editions, including 20:18. |

Final links at those verses in every edition (from `package/bible.v1.json`):

| Verse | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| Luke 2:16 | Mary→mary-mother-of-jesus; Joseph→joseph-husband-of-mary | Mary→mary-mother-of-jesus; Joseph→joseph-husband-of-mary | Mary→mary-mother-of-jesus; Joseph→joseph-husband-of-mary | Mary→mary-mother-of-jesus; Joseph→joseph-husband-of-mary |
| Luke 10:39 | Mary→mary-of-bethany; Jesus→jesus | Mary→mary-of-bethany; Jesus→jesus | Mary→mary-of-bethany | Mary→mary-of-bethany; Jesus→jesus |
| Acts 1:13 | Peter→simon-peter; James→james-zebedee; John→john-apostle; Andrew→andrew; Philip→philip-apostle; Thomas→thomas; Bartholomew→the-other-apostles; Matthew→matthew-apostle; James→the-other-apostles; Simon→the-other-apostles; Zelotes→the-other-apostles; Judas→the-other-apostles | Peter→simon-peter; John→john-apostle; James→james-zebedee; Andrew→andrew; Philip→philip-apostle; Thomas→thomas; Bartholomew→the-other-apostles; Matthew→matthew-apostle; James→the-other-apostles; Simon→the-other-apostles; Judas→the-other-apostles | Peter→simon-peter; John→john-apostle; James→james-zebedee; Andrew→andrew; Philip→philip-apostle; Thomas→thomas; Bartholomew→the-other-apostles; Matthew→matthew-apostle; James→the-other-apostles; Simon→the-other-apostles; Judas→the-other-apostles | Peter→simon-peter; John→john-apostle; James→james-zebedee; Andrew→andrew; Philip→philip-apostle; Thomas→thomas; Bartholomew→the-other-apostles; Matthew→matthew-apostle; James→the-other-apostles; Simon→the-other-apostles; Judas→the-other-apostles |
| Acts 21:18 | Paul→saul-paul; James→james-the-just | Paul→saul-paul; James→james-the-just | Paul→saul-paul; James→james-the-just | Paul→saul-paul; James→james-the-just |
| Matthew 2:1 | Jesus→jesus; Herod→herod-the-great | Jesus→jesus; Herod→herod-the-great | Jesus→jesus; Herod→herod-the-great | Jesus→jesus; Herod→herod-the-great |
| Matthew 2:3 | Herod→herod-the-great | Herod→herod-the-great | Herod→herod-the-great | Herod→herod-the-great |
| John 19:25 | Jesus→jesus; Mary Magdalene→mary-magdalene | Jesus→jesus; Mary Magdalene→mary-magdalene | Jesus→jesus; Mary Magdalene→mary-magdalene | Jesus→jesus; Mary Magdalene→mary-magdalene |
| John 20:16 | Jesus→jesus; Mary→mary-magdalene | Jesus→jesus; Mary→mary-magdalene | Jesus→jesus; Mary→mary-magdalene | Jesus→jesus; Mary→mary-magdalene |
| John 20:18 | Mary Magdalene→mary-magdalene | Mary Magdalene→mary-magdalene | Mary Magdalene→mary-magdalene | Mary Magdalene→mary-magdalene |

Note for the coding window: `app/src/services/characters/webRevelationRelease.test.ts` pins these five spans as *conflicting* (resolver returns `null`, `ambiguousMentions === 10`). In this package every one of them is a single, correct card and there are no identical or partially overlapping spans anywhere, so that expectation has to change (see `INTEGRATION-NOTES.md`).

## How the ambiguous families came out (links by card, final package)

Counts are name occurrences by final decision; `NONE` = deliberately not linked.

**Mary**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `mary-mother-of-jesus` | 19 | 19 | 21 | 19 |
| `mary-magdalene` | 14 | 14 | 14 | 14 |
| `mary-of-bethany` | 11 | 11 | 12 | 11 |
| NONE (not linked) | 10 | 10 | 10 | 10 |

**James**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `james-zebedee` | 21 | 21 | 21 | 21 |
| `james-the-just` | 11 | 11 | 11 | 11 |
| `the-other-apostles` | 4 | 4 | 4 | 4 |
| NONE (not linked) | 6 | 6 | 6 | 6 |

**John**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `john-the-baptist` | 92 | 92 | 110 | 92 |
| `john-apostle` | 35 | 34 | 40 | 35 |
| `mark-evangelist` | 5 | 5 | 5 | 5 |
| NONE (not linked) | 1 | 1 | 5 | 16 |

**Judas / Judah / Juda / Jude**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `judah-patriarch` | 35 | 35 | 38 | 35 |
| `judas-maccabeus` | 0 | 0 | 0 | 132 |
| `judas-iscariot` | 22 | 22 | 34 | 22 |
| `the-other-apostles` | 3 | 3 | 3 | 3 |
| `jude-apostle` | 2 | 2 | 2 | 2 |
| NONE (not linked) | 797 | 809 | 814 | 852 |

**Simon / Simeon**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `simon-peter` | 51 | 52 | 50 | 52 |
| `simon-maccabeus` | 0 | 0 | 0 | 68 |
| `simon-magus` | 4 | 4 | 4 | 4 |
| `the-other-apostles` | 4 | 4 | 4 | 4 |
| NONE (not linked) | 67 | 66 | 59 | 79 |

**Joseph / Joses**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `joseph-patriarch` | 180 | 179 | 211 | 183 |
| `joseph-husband-of-mary` | 16 | 16 | 15 | 16 |
| `joseph-of-arimathea` | 6 | 6 | 7 | 6 |
| `barnabas` | 1 | 1 | 1 | 1 |
| NONE (not linked) | 53 | 53 | 49 | 59 |

**Herod**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `herod-antipas` | 27 | 27 | 31 | 27 |
| `herod-the-great` | 10 | 10 | 10 | 10 |
| NONE (not linked) | 7 | 7 | 10 | 7 |

**Philip**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `philip-apostle` | 16 | 16 | 15 | 16 |
| NONE (not linked) | 20 | 18 | 19 | 29 |

**Zechariah / Zacharias**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `zechariah-prophet` | 6 | 6 | 6 | 6 |
| NONE (not linked) | 48 | 48 | 56 | 50 |

**Jacob**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `jacob` | 236 | 240 | 267 | 250 |
| `israel-the-people` | 137 | 137 | 138 | 153 |
| NONE (not linked) | 4 | 4 | 4 | 4 |

**Israel**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `israel-the-people` | 2520 | 2528 | 1917 | 2697 |
| `jacob` | 53 | 53 | 56 | 56 |
| NONE (not linked) | 1 | 2 | 1 | 2 |

**Jesus**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `jesus` | 974 | 975 | 1426 | 979 |
| `jesus-ben-sira` | 0 | 0 | 0 | 3 |
| `joshua` | 2 | 0 | 0 | 0 |
| NONE (not linked) | 1 | 1 | 1 | 2 |

**Elijah / Elias**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `elijah` | 98 | 98 | 123 | 102 |
| NONE (not linked) | 1 | 3 | 3 | 3 |

**Ananias**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `ananias-of-damascus` | 6 | 6 | 6 | 6 |
| `ananias-and-sapphira` | 3 | 3 | 3 | 3 |
| NONE (not linked) | 2 | 2 | 2 | 5 |

**Devil**

| card | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| `satan` | 87 | 87 | 84 | 88 |
| NONE (not linked) | 30 | 3 | 3 | 3 |

## Verse-level rulings applied to every edition after adjudication and review

| Where | Name | Result | Why |
|---|---|---|---|
| 1 Chronicles 4:1 | Judah | not linked | “the sons of Judah: Pharez, Hezron, Carmi, Hur and Shobal” — a tribal genealogy that includes later descendants, not the patriarch’s own sons. The blind reviewers of KJV, BSB and WEBC would link the patriarch; policy: ancestor of a genealogy is linked only when the text makes the man himself the subject. |
| Luke 6:16, Acts 1:13 | the James in “Judas the brother/son of James” | not linked | The text does not say which James (Alphaeus’ or the Lord’s brother). Undecided ⇒ NONE. |
| Matthew 24:5, 24:23; Mark 13:6, 13:21; Luke 21:8 | Christ | not linked | Impostors use the title (“I am Christ”, “Lo, here is Christ”); it is not a reference to Jesus. Generic uses that name the expected Messiah of the real Jesus story (Luke 3:15, John 1:20, 1:25, 3:28 …) stay linked. |
| 1 Kings 11:39; 2 Chronicles 13:8, 23:3, 32:33; Ezra 8:2; Jeremiah 33:22 | David | not linked | “seed of David”, “sons of David” as dynasty/family, “sepulchres of the sons of David”, a clan in Ezra 8:2 — same treatment as “house of David”. |
| Isaiah 58:14; Ps 105:10, 23; 1 Chr 16:17; Ezek 28:25, 37:25; Mic 7:20; Mal 1:2 (first Jacob); Ezra 8:18; Judges 18:29 | Jacob / Israel | → `jacob` (the man) | Independent reviewers read the patriarch in every edition (“heritage of Jacob thy father”, “my servant Jacob”, “truth to Jacob, mercy to Abraham”, “Esau Jacob’s brother”, “Levi, the son of Israel”, “Dan … born to Israel”). Supersedes the earlier unlinked ruling. |
| Every other Jacob / Israel that means the nation | Jacob / Israel | → `israel-the-people` | New card. About 2,000–2,700 links per edition: children/house/kingdom of Israel, King/God/Holy One of Israel, Jacob and Israel in Psalms, prophets, Numbers 23–24, tribal blessings, and NT uses. Man-readings that stay with the patriarch: patriarch triads (Abraham, Isaac, Israel), “son of Israel”, “born to Israel”, “Reuben the firstborn of Israel”, “our father Israel”. Skipped entirely: Joseph’s father Jacob (Matt 1:15–16), Genesis 49:24 (Jacob’s own words), El-elohe-Israel (Gen 33:20), Jacob’s well. |
| Genesis 4:22 | Cain (Tubal-Cain) | not linked | A descendant of Lamech, not Adam’s son. |
| Luke 3:25 | Nahum | not linked | An ancestor in Jesus’s genealogy, not the prophet Nahum. |
| Acts 25:21, 25:25, 27:1 | Augustus | not linked | The emperor of Acts 25 is Nero; “Augustus’ band” (27:1) is a cohort. Only Luke 2:1 is Caesar Augustus. |
| Isaiah 30:7; Psalm 87:4, 89:10; Isaiah 51:9; Job 9:13, 26:12 | Rahab | not linked | A poetic name for Egypt / the sea monster, not the woman of Jericho. |
| Acts 3:11; John 10:23; Acts 5:12 | Solomon (Solomon’s porch / colonnade) | not linked | A place named for him. Now unlinked identically in all editions. |
| Jeremiah 52:1 | Jeremiah | not linked | “Hamutal the daughter of Jeremiah of Libnah” — Hamutal’s father, not the prophet (2 Kings 23:31 and 24:18 were already unlinked). |
| 1 Corinthians 15:45; Sirach 40:1 | Adam (“the last Adam”, “sons of Adam”) | not linked | Type/humankind uses. 1 Cor 15:45 “the first man Adam” stays linked. |
| Revelation 21:22; Ezra 5:14 | the temple | not linked (card `the-temple`) | “I saw no temple therein” and “the temple of Babylon” are not the Jerusalem temple. (Exodus 23:19 was already dropped.) |
| Acts 13:22 (BSB), Acts 13:21–22 (all) | Saul | → `saul-king` | “After removing Saul, He raised up David” is King Saul; the old rule sent it to Paul in BSB. |
| Luke 22:3 | Judas … Iscariot | → `judas-iscariot` (one span “Judas surnamed/called Iscariot”) | Epithet form in all four editions. |
| John 1:41 | Messiah/Messias | → `jesus` | Andrew’s “We have found the Messiah” names Jesus. John 4:25 (the Samaritan woman’s general expectation), Daniel 9:25–26 and Matthew 1:23 “Immanuel” are **not** linked. |
| 1 Chronicles 6:33 | Shemuel | → `samuel` | KJV spelling of Samuel; Numbers 34:20 and 1 Chr 7:2 are other men. |
| Possessive place/dynasty forms | David’s city/tower/tent; X’s house (David, Saul, Ahab, Eli, Joab …); “house of your servant David”; “city of his father David”; “like that of Jeroboam”; “house and lineage/family of X” | not linked | So that KJV “house of X”/“city of David” and WEB/WEBC “X’s house”/“David’s city” and BSB “city of his father David” all behave the same way. Literal residences stay linked: 1 Samuel 19:11 and Psalm 59:1 “David’s house”. |
| Mark 2:15; Luke 5:27–29 | Levi | → `matthew-apostle` | Levi the tax collector (identified with Matthew by the Matt 9:9 parallel; see Contested). |

## Catholic historical figures added in the second round (webc-en only)

Resolved by verse ranges (the names are unambiguous inside these books) and then re-decided blind for all 280 occurrences (`REVIEW-RECORD.md`, stage 9). Anything the text does not settle is **not linked**.

| Card | Linked in | Deliberately not linked |
|---|---|---|
| `nicanor` | 1 Macc 3:38, 7:26–47, 9:1; 2 Macc 8–9, 14–15 | 2 Macc 12:2 (Nicanor governor of Cyprus) |
| `bacchides` | 1 Macc 7–10 | 2 Macc 8:30 (“Timotheus and Bacchides”, possibly another officer) |
| `alcimus` | 1 Macc 7, 9; 2 Macc 14 |  |
| `gorgias` | 1 Macc 3–5; 2 Macc 8:9, 10:14, 12:32–37 |  |
| `tryphon` | 1 Macc 11:39–15:39 |  |
| `lysias` | 1 Macc 3–7; 2 Macc 10–14 | Claudius Lysias (Acts 23–24) |
| `razis` | 2 Macc 14:37 | only one mention: the rest of the story uses “he” |
| `bagoas` | Judith 12–14 |  |
| `manasses-judith` | Judith 8, 10, 16 | Manasses in Tobit 14:10 |
| `gabael` | Tobit 1:14–10:2 | Tobit 1:1 (Gabael the ancestor) |
| `demetrius-i` | 1 Macc 7:1–10:66 (incl. the second “Demetrius” in “Demetrius, son of Demetrius”, 10:67); 2 Macc 14 |  |
| `demetrius-ii` | 1 Macc 10:67 (first occurrence)–15:22; 2 Macc 1:7 (169th year) | Demetrius the silversmith stays `demetrius-silversmith` |
| `alexander-balas` | 1 Macc 10:1–11:39 | Alexander the Great (1 Macc 1:1, 1:7, 6:2) and all other Alexanders (Mark 15:21, Acts 4:6, 19:33, 1 Tim 1:20, 2 Tim 4:14) |
| `ptolemy-philometor` | 1 Macc 1:18, 10:51–11:18; 2 Macc 1:10, 9:29 | 1 Macc 15:16 (King Ptolemy addressed by Rome), 2 Macc 6:8, 8:8–9, 10:12 (Macron) — identity not settled by the text |
| `ptolemy-dorymenes` | 1 Macc 3:38; 2 Macc 4:45–46 |  |
| `ptolemy-abubus` | 1 Macc 16:11–18 |  |
| `jason-high-priest` | 2 Macc 1:7, 4:7–5:6 | Jason son of Eleazar (1 Macc 8:17), Antipater son of Jason (12:16, 14:22), Jason of Cyrene (2 Macc 2:23), Jason of Thessalonica (Acts 17) |
| `apollonius-samaria` | 1 Macc 3:10–12 |  |
| `apollonius-coelesyria` | 1 Macc 10:69–89 |  |
| `apollonius-menestheus` | 2 Macc 4:4, 4:21 | Apollonius of Tarsus (2 Macc 3:5, 3:7), the “lord of pollutions” (5:24), son of Gennaeus (12:2) — identity not settled by the text |

One occurrence (`webc-en|1226.8.648`, 1 Macc 7:44 “Nicanor had fallen”) was not returned by its blind reviewer; it is the direct continuation of 7:43 and is trivially Nicanor.

## Where the independent reviewers disagreed with the final decision

Blind reviewers re-decided **7,176** occurrences (every identity-ambiguous occurrence plus every context-pattern decision of an ambiguous family). They agreed with the final package on 7,147 (99.60%; for Jacob/Israel a reviewer’s NONE from before the people card existed counts as agreeing with a link to `israel-the-people`, which has its own review, `REVIEW-RECORD.md` stage 10). The remaining 29 disagreements are listed here; none is an unresolved error — each is a policy hard case, an author ruling above, or a candidate-list limitation.

| id | ref | form | final | reviewer | disposition |
|---|---|---|---|---|---|
| kjv-en|926.0.143 | Malachi 1:2 | Esau | NONE | esau | “Was not Esau Jacob’s brother?” names the man (linked to `jacob`); “yet I loved Jacob / hated Esau” contrasts the nations (Jacob linked to `israel-the-people`; Esau nation-use unlinked). Reviewers split on the second Jacob. |
| kjv-en|342.0.14 | 1 Chronicles 4:1 | Judah | NONE | judah-patriarch | Verse ruling (genealogy of later descendants). |
| kjv-en|143.5.311 | Numbers 26:28 | Joseph | NONE | joseph-patriarch | “sons/children of Joseph” in a tribal census or allotment = the tribes (addendum 2). |
| kjv-en|583.4.140 | Psalms 105:23 | Israel | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| kjv-en|830.4.946 | Ezekiel 28:25 | Jacob | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| kjv-en|839.4.946 | Ezekiel 37:25 | Jacob | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| kjv-en|926.0.148 | Malachi 1:2 | Jacob | jacob | NONE | “Was not Esau Jacob’s brother?” names the man (linked to `jacob`); “yet I loved Jacob / hated Esau” contrasts the nations (Jacob linked to `israel-the-people`; Esau nation-use unlinked). Reviewers split on the second Jacob. |
| kjv-en|979.3.28 | Luke 6:16 | James | NONE | the-other-apostles | Verse ruling: which James is not stated. |
| kjv-en|1019.2.551 | Acts 1:13 | James | NONE | the-other-apostles | Verse ruling: which James is not stated. |
| web-en|963.0.412 | Mark 6:3 | Judah | jude-apostle | NONE | Deterministic: Matt 13:55/Mark 6:3 Judas is Jesus’s brother → `jude-apostle`; the reviewer was offered only the patriarch card. |
| web-en|737.2.818 | Isaiah 58:14 | Jacob | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| web-en|926.0.140 | Malachi 1:2 | Jacob | jacob | NONE | “Was not Esau Jacob’s brother?” names the man (linked to `jacob`); “yet I loved Jacob / hated Esau” contrasts the nations (Jacob linked to `israel-the-people`; Esau nation-use unlinked). Reviewers split on the second Jacob. |
| web-en|33.3.536 | Genesis 33:20 | Israel | NONE | jacob | “El-elohe-Israel” is an altar name (God, the God of Israel), not the man — not linked. |
| web-en|583.4.152 | Psalms 105:23 | Israel | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| web-en|583.4.181 | Psalms 105:23 | Jacob | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| web-en|143.5.299 | Numbers 26:28 | Joseph | NONE | joseph-patriarch | “sons/children of Joseph” in a tribal census or allotment = the tribes (addendum 2). |
| bsb-en|952.10.307 | Matthew 23:35 | Zechariah | NONE | zechariah-prophet | Zechariah son of Berechiah: whether the prophet or the son of Jehoiada (2 Chr 24:20) is disputed; cannot tell ⇒ NONE. |
| bsb-en|203.1.39 | Joshua 16:4 | Joseph | NONE | joseph-patriarch | “sons/children of Joseph” in a tribal census or allotment = the tribes (addendum 2). |
| bsb-en|211.16.252 | Joshua 24:32 | Joseph | NONE | joseph-patriarch | “sons/children of Joseph” in a tribal census or allotment = the tribes (addendum 2). |
| bsb-en|926.3.9 | Malachi 1:2 | Esau | NONE | esau | “Was not Esau Jacob’s brother?” names the man (linked to `jacob`); “yet I loved Jacob / hated Esau” contrasts the nations (Jacob linked to `israel-the-people`; Esau nation-use unlinked). Reviewers split on the second Jacob. |
| bsb-en|342.0.21 | 1 Chronicles 4:1 | Judah | NONE | judah-patriarch | Verse ruling (genealogy of later descendants). |
| bsb-en|583.44.8 | Psalms 105:23 | Israel | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| webc-en|1229.0.68 | 1 Maccabees 10:1 | Antiochus | NONE | antiochus-epiphanes | “Alexander Epiphanes, the son of Antiochus”: the text does not say which Antiochus; cannot tell ⇒ NONE. |
| webc-en|342.0.14 | 1 Chronicles 4:1 | Judah | NONE | judah-patriarch | Verse ruling (genealogy of later descendants). |
| webc-en|963.0.411 | Mark 6:3 | Judah | jude-apostle | NONE | Deterministic: Matt 13:55/Mark 6:3 Judas is Jesus’s brother → `jude-apostle`; the reviewer was offered only the patriarch card. |
| webc-en|143.1.2717 | Numbers 26:28 | Joseph | NONE | joseph-patriarch | “sons/children of Joseph” in a tribal census or allotment = the tribes (addendum 2). |
| webc-en|737.4.406 | Isaiah 58:14 | Jacob | jacob | NONE | Reviewers read the patriarch; now linked to `jacob`. |
| webc-en|926.3.13 | Malachi 1:2 | Jacob | jacob | NONE | “Was not Esau Jacob’s brother?” names the man (linked to `jacob`); “yet I loved Jacob / hated Esau” contrasts the nations (Jacob linked to `israel-the-people`; Esau nation-use unlinked). Reviewers split on the second Jacob. |
| webc-en|33.12.346 | Genesis 33:20 | Israel | NONE | jacob | “El-elohe-Israel” is an altar name (God, the God of Israel), not the man — not linked. |

One further occurrence (`bsb-en|977.11.12`, Luke 4:13 “the devil” → `satan`) has no reviewer line; the same verse in KJV, WEB and WEBC was reviewed and agreed.

## Contested cases that were kept (linked)

| Where | Card | Note |
|---|---|---|
| Joshua 21:13 (and similar “children of Aaron the priest”) | aaron | Priestly descendants named by patronymic. Policy rule 6 links patronymic/ancestry uses; one audit read it as a group. Kept. |
| Jeremiah 30:9, Ezekiel 34:23–24, 37:24–25, Hosea 3:5 (“David their king/servant”) | david | A future Davidic ruler is called David. Kept as a reference to the named man; a strict reading could unlink. |
| Revelation 3:7 “key of David”; 12 × “throne of David” | david | The throne and key are the man’s own possessions. (Isaiah 22:22 “key of the house of David” is a dynasty phrase and unlinked.) |
| Mark 2:14, Luke 5:27–29 “Levi” | matthew-apostle | Depends on the Matthew 9:9 parallel, not on the verse alone. Kept. |
| Acts 15:14 “Simeon”; 1 Thess 1:1/2 Thess 1:1 “Silvanus”; Acts 13:13, 1 Peter 5:13 “John/Mark” | simon-peter; silas; mark-evangelist | Standard identifications of the same person under a variant name. |
| Genesis 36:8 “Esau is Edom”; Genesis 46:8 “Jacob and his sons”; 1 Kings 18:31 and 2 Kings 17:34 (“Jacob, … whom he named Israel”) | esau; jacob | The verse itself ties the name to the man. |
| “seed/children/daughter of Abraham” (Psalm 105:6, Isaiah 41:8, John 8:39 …) | abraham | Ancestry phrases name the man (rule 6). Psalm 105:6/Isaiah 41:8 read close to the nation. |
| Luke 3:15, John 1:20, 1:25, 3:28 “the Christ” (John denying he is the Christ); John 7:26–42, 12:34 | jesus | Messianic title about the person Jesus is identified as; kept. |
| “Solomon’s servants” (Ezra 2:55, 2:58; Neh 7:57, 7:60, 11:3) | solomon | A guild named after the king’s own servants; kept. |
| Genesis 11:29 Sarai, 1 Samuel 10:2 “Rachel’s tomb”, Genesis 36:3 “Ishmael’s daughter” | sarah; rachel; ishmael | Possessives of the person. |

## Considered and **not** linked (title/general uses)

- John 4:25 “Messiah is coming” (woman’s general expectation); Matthew 1:23 “Immanuel” (a title); “Pontius” in “Pontius Pilate” (only “Pilate” is the span; cosmetic).
- Zephaniah 1:1 “Hizkiah” (not stated to be the king); 1 Chr 3:23 Hizkiah.
- 2 Samuel 23:1 “the God of Jacob” and Malachi 1:2 second Jacob (“yet I loved Jacob”) are linked to the people although one reviewer each read them otherwise.


## Non-person cards linked everywhere (final round)

Scope: `god-the-lord`, `ark-of-the-covenant`, `the-temple`, `babylon`, `zion` — every occurrence in all four editions, minus the exclusions below (matched by verse identity, so BSB and WEBC follow the KJV/WEB verse ruling).

- **God/LORD/Yahweh:** one card. Every capitalised “God”, “GOD”, “LORD”, “Yahweh”, “Jehovah”, “Jah/Yah” (also inside “God of Israel”, “house of the LORD”). Mixed-case “Lord” is **not** linked (Adonai, Jesus, or a human lord depending on verse). Idols/“gods” in lowercase are not linked.
- **Ark:** every “ark” except Noah’s ark (Gen 6:14–9:18, Matt 24:38, Luke 17:27, Heb 11:7, 1 Pet 3:20, Sir 44:17–18, Wis 10:4) and Moses’ basket (Ex 2:3–5). Revelation 11:19 “ark of his testament” is linked.
- **Zion:** every Zion/Sion except Deut 4:48 (Sion = Hermon).
- **Babylon:** every occurrence (city, empire, and Revelation’s Babylon).
- **Temple:** the Jerusalem temple of Solomon, the second temple and Herod’s. Not linked: Pentateuch/Joshua/Judges/1–2 Samuel “house of the LORD/God” (tabernacle, Shiloh, Nob, Bethel), 1 Chr 6:31–48 and 9:23 (tent), Ezekiel 40–48 (visionary), Revelation (heavenly; Rev 11:1–2 also, ruled consistently), pagan temples (of Dagon, Rimmon, Diana/Artemis, Baal, Bel, Babylon, Nanaea; Isa 15:2; Bar 6:13; 2 Macc 1:13–15, 9:2; 1 Macc 6:1–4), Jesus’ body (John 2:19, 2:21), church-as-temple metaphors (1 Cor 3:16–17, 6:19, 2 Cor 6:16, Eph 2:21, 1 Tim 3:15, 1 Pet 2:5, 4:17, 1 Cor 8:10, Acts 17:24, Heb 10:21), 2 Thess 2:4, and uncertain referents (Ps 11:4, Ps 18:6 / 2 Sam 22:7, Hos 8:1, Amos 8:3, Mic 1:2, 1:7, Bar 3:24). John 2:20 (Herod’s building) is linked; 2 Chr 36:7 (temple vessels taken to Babylon) is linked.
- **Judgement calls to overrule if wanted:** 2 Thess 2:4, Psalm 11:4/18:6, Rev 11:1–2 (reviewers split; left unlinked).
