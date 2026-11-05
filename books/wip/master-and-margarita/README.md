# The Master and Margarita (Мастер и Маргарита): content package, stage 1

- **Book id (proposed):** `master-and-margarita`
- **Author:** Mikhail Bulgakov (1891–1940). Written 1928–1940; first published, censored, in the journal *Moskva*, 1966–67.
- **Stage:** source, structure, and sample translation for Anders to review the quality before the full job. **Status: content candidate, not accepted, not integrated, not published.**
- **Branch:** `content/master-and-margarita`. Instruction revision: `origin/main` as fetched on 5 Nov 2026 (`books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `STRATEGY.md`, `AGENTS.md`, `docs/workflow-boundaries.md`).
- **Owned path:** `books/wip/master-and-margarita/` only. No app, registry, live-data, script, test or DECISIONS.md changes.

## Contents

| File | What it is | SHA-256 |
|---|---|---|
| `editions/master-and-margarita-original-ru.json` | Bulgakov's Russian text, complete: 33 units, 3,958 paragraphs (23 mechanical OCR fixes at harmonisation) | `9a2cf57330f217a157f9081f6b982467873369dbdc93a7e1da8a24f5c96c5b3d` |
| `editions/master-and-margarita-modern-en.json` | Tinct Modern English. Full translation, independently reviewed, fixes applied (`REVIEW-APPLIED.md`); harmonised, aligned 1:1 | `c067c7bf19ad3cc094e6ad236b01bd12a905b54a506033d95e55f416023028ee` |
| `editions/master-and-margarita-modern-da.json` | Tinct Modern Danish. Full translation, independently reviewed, fixes applied (`REVIEW-APPLIED.md`); harmonised, aligned 1:1, translated from the Russian | `6ce1f882cb3f4d2e37c1f9209dfa9cf60912d6d31487356532835337f07a45cc` |
| `editions/master-and-margarita-modern-en.sample-ch1-2.json` | Tinct Modern English, chapters 1–2 (sample), aligned 1:1 | `1fd83f7278ba2179856d6d5f61bfdd6b80273cf788758ef092f652a870e88b09` |
| `editions/master-and-margarita-modern-da.sample-ch1.json` | Tinct Modern Danish, chapter 1 (sample), aligned 1:1, translated from the Russian | `576dcac4bb98d28a72bd452136cfb949ad756db4e87771a6c0d95498a043029f` |
| `provenance/extraction-log.json` | Every correction made to the OCR text layer during collation, plus `harmonisation_fixes` | `45b1d582514e429b267ee3ab4218a59bf347e91ebd96f62b7492987303432fdd` |
| `GLOSSARY.md` | Master glossary (Russian / English / Danish), binding for both translations | |
| `HARMONISATION.md` | Every global change made in the harmonisation pass, with counts, and the open questions | |
| `reviews/revEN-A…D`, `reviews/revDA-A…D` (`.json` + `.md`) | The eight independent reviews against the Russian (EN and DA, ch. 1–9, 10–18, 19–25, 26–33) | |
| `REVIEW-APPLIED.md` | How the 244 review fixes and the book-wide review decisions were applied, with counts and validation | |

The edition files use the house shape (`chapters[]` with `number`, `title`, `section`, `paragraphs`; `sections[]`). No third-party web page or scan is stored in the repo.

## Decision recorded: Tinct translates from the Russian (Anders, 5 Nov 2026)

Every English translation (Glenny 1967, Ginsburg 1967, Burgin/O'Connor 1995, Pevear/Volokhonsky 1997 and later ones) and the Danish translation are still in copyright. Internet Archive lending scans may not be used. Tinct therefore translates the novel itself, directly from the Russian original, which has been in the public domain in Denmark and the EU since 1 January 2011.

Editions:

- `original-ru`: Bulgakov's Russian.
- `modern-en`: Tinct Modern English, translated directly from the Russian.
- `modern-da`: Tinct Modern Danish, translated directly from the Russian, **not** through the English. Anders requested this edition specifically on 5 Nov 2026. It does not reopen the general Danish scope in `STRATEGY.md`.

**Deviation from the workflow.** `books/README.md` and `books/AGENTS.md` require pinning an authoritative public-domain human English translation as the baseline for Modern English, and using a human translation as the default Compare edition. Tinct has no permitted human translation of this novel, so neither rule can be followed. Modern English here is a first translation, not a modernisation of an English baseline. Effects for integration:

- There is no `original-en` edition. The Compare default has to be decided (see open questions).
- The mandatory similarity gate (`books/classify-modern-en.py --gate`) measures how far modern-en has moved from an English source edition. It has nothing to compare against here. The quality gates have to be replaced with review against the Russian (see the plan below). I did not change or run the gate.
- No copyrighted translation was consulted or reproduced. All English and Danish wording was written in this session from the Russian.

## Source and provenance

**Text followed:** the canonical 1990 text prepared by **L. M. Yanovskaya**: М. А. Булгаков, *Собрание сочинений в пяти томах*, т. 5: *Мастер и Маргарита. Письма*. Москва: Художественная литература, 1990 (ISBN 5-280-00982-2). Commentary by G. A. Lesskis. The edition is identified by its title page ("Подготовка текста Л. М. Яновской («Мастер и Маргарита»)") and by its characteristic opening, «В час жаркого весеннего заката на Патриарших прудах появилось двое граждан». The 1973 text opens «Однажды весною, в час небывало жаркого заката, в Москве, на Патриарших прудах, появились два гражданина».

**Witnesses (all retrieved 5 Nov 2026):**

| Witness | Use | URL | SHA-256 of the raw download |
|---|---|---|---|
| A. ImWerden PDF of the 1990 vol. 5 (scan with a text layer; PDF metadata: Creator «Некоммерческая электронная библиотека ImWerden», Producer imwerden.de, created 25 May 2020), as mirrored on Internet Archive item `5-5.-..-1990` (a public download, not a lending item; uploaded 15 Jul 2022) | primary text | `https://archive.org/download/5-5.-..-1990/` file «Булгаков М.А. - Собрание сочинений в 5 томах  Том 5.  — М.  Художественная литература, 1990.pdf» (IA sha1 `375c433c0db434779785212d61a1fb1ab20c3d7a`) | `ca001187aa65225c1617a3847e0222abec6289a5414398b08cc88952d9a981ff` |
| B. Internet Archive's own OCR of the same scan | collation (an independent OCR of the same pages) | same item, `…1990_djvu.txt` (IA sha1 `4a15e1151dcc4920d7955ea6862a0110b1d65545`) | `2633d091ac4d97327a5e2c4cf49a3131b32f3ff2e1fa5fc297f85ead47bdc609` |
| C. Internet Archive OCR of *Мастер и Маргарита*, М.: Худож. лит., 1988 ("Классики и современники"; text printed from the 1973 edition) | collation (third witness; differs textually where 1973 ≠ 1990) | `https://archive.org/download/B-001-029-642-ALL/B-001-029-642-03_djvu.txt` (Nicolai Woodenko library collection, not lending) | `e076ed18943c372c69695e70fa048c69db2374405d07674632750f280cd960e3` |

**Candidates checked and rejected:**

- ru.wikisource: there is no page for the novel. The title 404s, and both prefix and full-text searches return nothing.
- lib.ru `/BULGAKOW/` lists only drafts and rewritten chapters (`mm7.txt`, `ma_chernowiki.txt`). `master.txt` returns 404 now and is only in the Wayback Machine, which the session's egress policy blocks.
- az.lib.ru's Bulgakov page says «И не ищите здесь "Мастера и Маргариту"».
- ilibrary.ru/text/459 says «Произведение удалено из библиотеки по требованию правообладателя» ("removed at the rights holder's request"; its source was the Azbuka 2002 edition).
- Fan sites (masterimargo.ru, masterandmargarita.ru) give no edition provenance.
- A 2022 "opensource" IA upload (`20220406_20220406_2210`) is an unidentified scan.

**Extraction method.** Code was used only in scratch space; none is committed.

1. `pdftotext -layout` of PDF pages 10–387 (book pp. 7–384). Paragraphs come from first-line indentation. The page-number lines and printer's signature marks («2 М. А. Булгаков, т. 5», «3* 67») are removed. Line-end hyphenation is resolved, and the text layer's letter-spaced words («Н о», «п р о ф е с с о р») are rejoined, using B for word boundaries.
2. Editorial material is removed. **PDF p. 26 is excluded:** it is the 1990 edition's inserted «План Иерусалима I в. н. э.», not Bulgakov's text. Lesskis's commentary and the letters are not used.
3. A word-level collation of A against B and C (about 112,300 tokens) found 596 differences. Where A disagreed with B and C agreed with A, A was kept, because B had made the OCR error. Where B and C agreed against A, their reading was taken (145 applied: dropped letters such as «эт» → «это», split words, hyphens). Ten cases were judged by hand, and one was checked against the page image («если б имели», p. 247).
4. A punctuation collation between aligned words and at paragraph ends applied 43 fixes, for example commas that A lost at line ends. Doubtful cases were checked against page images (e.g. «и тут в соседней комнате», p. 226).
5. After the collation every word in the edition occurs in B or C. All fixes are listed in `provenance/extraction-log.json`.

**Known limits of the Russian text:**

- Italics in the print (a few emphasised words) are not kept, because the house format has no inline markup.
- The epigraph from *Faust* is stored as paragraph 1 of chapter 1, so that it is not lost. Integration may present it differently, but every edition must keep the same position.
- Verse and the poster in chapters 10, 12, 17 and 20 are kept as one line per paragraph, as printed.
- The 1990 text uses «е» for «ё» except in a handful of names. The text keeps exactly what the print has.
- «в пятнадцатой книге, а главе 44-й» (ch. 1) reads «а» in both the 1990 and 1973 witnesses and has been left as printed.
- The source is OCR. Three-witness collation catches errors only where the witnesses disagree. Errors that all three OCRs share are unlikely but possible. Every paragraph will be read against the Russian again during translation, which is the final proofreading pass for each chapter.

**Completeness check** (first and last words of each unit; Russian word counts are tokens of letters and digits, hyphenated compounds counted once):

| # | Section | Title | Paras | Words | Opens | Ends |
|---|---|---|---|---|---|---|
| 1 | Часть первая | Никогда не разговаривайте с неизвестными | 144 | 3,405 | (epigraph) «В час жаркого весеннего заката…» | «…весеннего месяца нисана...» |
| 2 | | Понтий Пилат | 261 | 6,722 | «В белом плаще с кровавым подбоем…» | «Было около десяти часов утра.» |
| 3 | | Седьмое доказательство | 50 | 1,354 | «— Да, было около десяти часов утра…» | «Это была отрезанная голова Берлиоза.» |
| 4 | | Погоня | 65 | 2,142 | «Утихли истерические женские крики…» | «…пел о своей любви к Татьяне.» |
| 5 | | Было дело в Грибоедове | 104 | 3,383 | «Старинный двухэтажный дом кремового цвета…» | «…милиционера, Пантелея и Рюхина.» |
| 6 | | Шизофрения, как и было сказано | 105 | 2,241 | «Когда в приемную знаменитой психиатрической клиники…» | «На поэта неудержимо наваливался день.» |
| 7 | | Нехорошая квартира | 104 | 3,088 | «Если бы в следующее утро Степе Лиходееву…» | «Сознание покинуло его.» |
| 8 | | Поединок между профессором и поэтом | 97 | 2,560 | «Как раз в то время, когда сознание покинуло Степу…» | «…а поближе сверкала река.» |
| 9 | | Коровьевские штуки | 95 | 2,477 | «Никанор Иванович Босой…» | «…и вместе с ним пропал.» |
| 10 | | Вести из Ялты | 140 | 3,048 | «В то время, как случилось несчастье с Никанором Ивановичем…» | «…лишился чувств и поцелуя не ощутил.» |
| 11 | | Раздвоение Ивана | 26 | 1,012 | «Бор на противоположном берегу реки…» | «— Тссс!» |
| 12 | | Черная магия и ее разоблачение | 154 | 3,947 | «Маленький человек в дырявом желтом котелке…» | «…в кресле с полинявшей обивкой.» |
| 13 | | Явление героя | 195 | 5,694 | «Итак, неизвестный погрозил Ивану пальцем…» | «…и гость скрылся.» |
| 14 | | Слава петуху! | 71 | 2,471 | «Не выдержали нервы, как говорится…» | «С ним вместе пропал и Римский.» |
| 15 | | Сон Никанора Ивановича | 143 | 3,292 | «Нетрудно догадаться, что толстяк…» | «…была эта гора оцеплена двойным оцеплением...» |
| 16 | | Казнь | 90 | 3,679 | «Солнце уже снижалось над Лысой Горой…» | «Ни Левия, ни тела Иешуа на верху холма в это время уже не было.» |
| 17 | | Беспокойный день | 119 | 3,364 | «Утром в пятницу…» | «И тут же Василия Степановича арестовали.» |
| 18 | | Неудачливые визитеры | 228 | 5,683 | «В то самое время, как старательный бухгалтер…» | «За мной, читатель!» |
| 19 | Часть вторая | Маргарита | 142 | 3,777 | «За мной, читатель!…» | «…побежала из Александровского сада вон.» |
| 20 | | Крем Азазелло | 46 | 1,466 | «Луна в вечернем чистом небе висела полная…» | «…совершенно обезумевший вальс.» |
| 21 | | Полет | 96 | 3,971 | «Невидима и свободна!…» | «…Маргарита понеслась в Москву.» |
| 22 | | При свечах | 126 | 3,849 | «Ровное гудение машины…» | «…в дверях возник Коровьев.» |
| 23 | | Великий бал у сатаны | 119 | 4,392 | «Полночь приближалась…» | «…и вошла Маргарита.» |
| 24 | | Извлечение мастера | 301 | 6,587 | «В спальне Воланда все оказалось, как было до бала.» | «…Да, тьма...» |
| 25 | | Как прокуратор пытался спасти Иуду из Кириафа | 131 | 2,938 | «Тьма, пришедшая со Средиземного моря…» | «…и пришли сумерки.» |
| 26 | | Погребение | 243 | 6,347 | «Может быть, эти сумерки…» | «…пятый прокуратор Иудеи Понтий Пилат.» |
| 27 | | Конец квартиры № 50 | 117 | 4,744 | «Когда Маргарита дошла до последних слов главы…» | «…один силуэт обнаженной женщины.» |
| 28 | | Последние похождения Коровьева и Бегемота | 110 | 3,419 | «Были ли эти силуэты…» | «…с двумя балыковыми бревнами под мышкой.» |
| 29 | | Судьба мастера и Маргариты определена | 66 | 1,315 | «На закате солнца высоко над городом…» | «Воланд перестал быть видим в ее мгле.» |
| 30 | | Пора! Пора! | 132 | 3,508 | «— Ты знаешь, — говорила Маргарита…» | «…— это женщина.» |
| 31 | | На Воробьевых горах | 24 | 780 | «Грозу унесло без следа…» | «…оставил по себе только туман.» |
| 32 | | Прощение и вечный приют | 33 | 1,843 | «Боги, боги мои! Как грустна вечерняя земля!…» | «…всадник Понтий Пилат.» |
| 33 | | Эпилог | 81 | 3,792 | «Но все-таки, что же было дальше-то в Москве…» | «…всадник Понтий Пилат.» |
| | | **Total** | **3,958** | **112,290** | | |

The links between chapters that Bulgakov built into the text are all present: 1→2 (Woland's sentence becomes the opening of chapter 2), 2→3 («около десяти часов утра»), 15→16 (Bald Mountain), 18→19 («За мной, читатель!»), 24→25 («тьма»), 26→27 (Margarita reading). The Yershalaim chapters (2, 16, 25, 26) and Woland's scenes are complete. The closing date «1929—1940» is dropped as a dateline.

## Structure

- **Reading units:** the 32 chapters and the Epilogue, so 33 units numbered 1–33. Titles are as printed, in sentence case: `"1. Никогда не разговаривайте с неизвестными"`, …, `"Эпилог"`.
- **Grouping:** `sections` = «Часть первая» (1–18) and «Часть вторая» (19–32). The Epilogue stands outside both parts and has no `section`. If the reader requires every chapter to belong to a section, integration should add a third section «Эпилог» → [33] in every edition.
- **Paragraphs:** prose paragraphs as printed. Each dialogue line is its own paragraph, as in the Russian. Translations keep paragraph N = paragraph N.
- **English and Danish typography:** dialogue dashes become quotation marks. English uses curly “ ” and ‘ ’ with unspaced em dashes. Danish uses » « and › ‹ with spaced en dashes, as in the live modern-da editions. Bulgakov's «?..» and «!..» are kept as written, which is a house-style question (see below).

## Sample translation (for review before the full job)

- `modern-en`: chapters 1 and 2 complete (144 + 261 paragraphs; 4,386 + 9,129 English words for 3,405 + 6,722 Russian).
- `modern-da`: chapter 1 complete (144 paragraphs; 4,274 Danish words).
- **Brief:** clear, natural contemporary English and Danish for a modern adult reader, faithful in meaning, detail, irony and voice. Moscow's mock-official narrator ("kindly note", the police reports) stays dry and comic. Pilate's chapter keeps its solemn, slow, concrete register. No glosses or additions.
- **Review pass done:** every paragraph was reread against the Russian. Paragraph counts are checked automatically, as are length ratios (flag below 1.0× for EN or 0.95× for DA against the Russian word count) and sentence counts. The flagged paragraphs were inspected and are complete (Danish is naturally compact). Fixes from the review: «фигурку» is singular (EN "a figurine", DA "en lille figur"); «Очень приятно» → "A pleasure" / «Det glæder mig»; the devil vocabulary is kept wherever Bulgakov uses it («Фу ты черт!» → "Phew, the devil!" / «Puh, for fanden!»; «к черту» → "to the devil" / «fanden i vold»), because the motif matters.

### Glossary (names and terms; one rendering, kept throughout)

This is the stage-1 sample glossary. The binding, complete glossary for the full translation is now [`GLOSSARY.md`](GLOSSARY.md).

| Russian | English | Danish | Note |
|---|---|---|---|
| Патриаршие пруды / Патриаршие | Patriarch's Ponds / Patriarch's | Patriarkdammene | |
| Воланд | Woland | Woland | The card shows "W" in both |
| Михаил Александрович Берлиоз (Миша) | Mikhail Alexandrovich Berlioz (Misha) | Mikhail Aleksandrovitj Berlioz (Misja) | |
| Иван Николаевич Понырев, Бездомный | Ivan Nikolayevich Ponyrev, Bezdomny | Ivan Nikolajevitj Ponyrev, Bezdomnyj | "Bezdomny" (homeless) is left untranslated; see questions |
| Массолит | Massolit | Massolit | |
| Аннушка | Annushka | Annusjka | |
| Иешуа Га-Ноцри | Yeshua Ha-Notsri | Jeshua Ha-Notsri | |
| Понтий Пилат; Пилат Понтийский | Pontius Pilate; Pilate of Pontus | Pontius Pilatus; Pilatus fra Pontus | |
| прокуратор Иудеи | procurator of Judea | Judæas prokurator | |
| игемон | hegemon | hegemon | Kept as a title |
| всадник (Золотое Копье) | the knight (Golden Spear) | ridderen (Den Gyldne Lanse) | Equestrian rank |
| Ершалаим | Yershalaim | Jersjalaim | Bulgakov's deliberate form, not "Jerusalem" |
| Марк Крысобой | Mark Ratslayer | Markus Rottedræber | |
| Левий Матвей | Levi Matvei | Levi Matvej | Bulgakov's form, not "Matthew" |
| Иуда из Кириафа | Judas from Kiriath | Judas fra Kiriat | |
| Каифа (Иосиф) | (Joseph) Caiaphas | (Josef) Kajfas | Standard forms |
| Вар-равван | Bar-Rabban | Bar-Rabban | Bulgakov's form, not "Barabbas" |
| Дисмас, Гестас | Dismas, Gestas | Dismas, Gestas | |
| Виффагия | Bethphage | Betfage | |
| Сузские ворота | the Susa Gate | Susaporten | |
| Лысая Гора | Bald Mountain | Det Skaldede Bjerg | |
| Малый Синедрион | the Lesser Sanhedrin | Det Lille Sanhedrin | |
| кентурия / кентурион / когорта / ала / турма / манипул | century / centurion / cohort / ala / turma / maniple | centurie / centurion / kohorte / ala / turma / manipel | |
| Двенадцатый Молниеносный легион; легион Фульмината | the Twelfth Lightning Legion; the Fulminata legion | Den Tolvte Lynlegion; Fulminata-legionen | |
| Кесария Стратонова; Капрея | Strato's Caesarea; Capreae | Stratons Cæsarea; Capreae | |
| Идиставизо, Долина Дев | Idistaviso, the Valley of the Maidens | Idistaviso, Jomfrudalen | |
| гемикрания | hemicrania | hemikrani | |
| Банга | Banga | Banga | |
| Садовое кольцо; Малая Бронная; Садовая | the Garden Ring; Malaya Bronnaya Street; Sadovaya | Sadovoje-ringen; Malaja Bronnaja-gaden; Sadovaja | |
| «Литературная газета» | the Literary Gazette | »Litteraturnaja Gazeta« | |
| «Наша марка» | Our Brand | Vores Mærke | Cigarette brand |
| нарзан; абрикосовая | Narzan; apricot soda | Narzan; abrikossodavand | |
| комсомолка | Komsomol girl | komsomolpige | |
| Соловки | Solovki | Solovki | |

Danish forms for names that do not occur in chapter 1 are proposed and will be fixed when chapter 2 is translated into Danish.

### Passages to flag for Anders (choices made in the sample)

1. **Bezdomny** ("Homeless") is left untranslated in both languages, so the joke behind the pen name is lost on readers. A one-line onboarding note could cover it without glossing the text.
2. **«…будет интересная история!»** The pun on historian/history/story survives as "some interesting history" in English and as «historie» in Danish, which carries both senses.
3. **«Я не знаю, кто подвесил твой язык, но подвешен он хорошо»** is rendered literally ("hung your tongue… hung well") to keep the hanging-thread image from the line before. In English this is a little strange, but deliberately so.
4. **«Тесно мне»** is rendered "I can't breathe" and, in the reply, "it is you, Caiaphas, who leave me no air". The literal sense is "I feel cramped, constricted". I chose this so the image of suffocation stays clear.
5. **«темный, как мулат»** is kept as "dark as a mulatto" for fidelity. The term is dated in modern English. Decide whether to keep it.
6. **«?..», «!..»** are kept as Bulgakov wrote them. English and Danish house style might prefer "?…" or just "?".
7. **Formal address in Danish:** strangers say *De/Dem/Deres* (Russian *вы*) and friends say *du*. This keeps the 1930s register, which a modern adult reader will accept. Switching to *du* everywhere would flatten Woland's courtliness.
8. **«а главе 44-й»** reads «а» in both witnesses, probably a slip for «в». It is translated as "chapter 44".
9. **The epigraph** is translated from Bulgakov's Russian wording of Goethe, not from Goethe's German.

## Rights reasoning (for Anders; this is a summary of facts and risks, not legal advice)

- **Denmark and EU:** Bulgakov died on 10 March 1940. Under the EU term (life + 70 years, counted from 1 January after death) his works entered the public domain on 1 January 2011. The novel was first published in 1966–67, within the term, so the EU's 25-year right for works first published after copyright expiry does not apply. This matches the decision Anders recorded.
- **Russia:** the novel appears to be treated as protected there. For works first published after the author's death, Russian law counts 70 years from publication, which on our reading means about 2037. Russian libraries do not carry it (az.lib.ru, lib.ru), and ilibrary.ru removed it "at the rights holder's request". Tinct is not a Russian service, but distribution to Russia carries risk.
- **USA (open risk):** the novel was first published in 1966–67 in the USSR. Foreign works still protected in their source country on 1 Jan 1996 had their US copyright restored, and a 1966–67 publication would then run 95 years. **The novel may therefore be under US copyright until about 2061–62.** I cannot confirm this, and it needs a decision before US readers are served the Russian text or a translation of it (for example by geo-restriction or legal advice).
- **Editorial text:** the 1990 volume carries «© Подготовка текста, комментарии, оформление. Издательство "Художественная литература", 1990 г.»: the publisher claims copyright in the *preparation of the text*. Yanovskaya's work was choosing Bulgakov's readings among his manuscripts and typescripts. She added no prose of her own, so this differs in kind from Max Brod's structuring of *The Trial*. Whether her choices are protectable in Denmark is a legal question I cannot settle. Some EU states give critical editions a short related right (Germany 25 years, Italy 20 years from publication), which would have expired in 2015 and 2010 for a 1990 edition. I do not know of an equivalent in Danish law.
  - **Elena Bulgakova:** both the 1973 and the 1990 texts rest partly on typescripts that Elena Sergeyevna Bulgakova (d. 1970) corrected after his death. If any of her changes counted as authorship they would remain protected in the EU until 2040. Scholars generally treat her work as carrying out Bulgakov's dictated corrections.
  - **Mitigation already applied:** the package contains only the novel's text. The editor's commentary, the plan of Jerusalem and the edition's design are excluded. A 1973-based text (witness C) is available if Anders prefers the older edition, but it raises the same question about Elena Bulgakova and is the less authoritative text.
- **Tinct's translations** are Tinct's own work, made from the Russian. No copyrighted translation was consulted.

## Editions plan

| Edition | Key | Status |
|---|---|---|
| Russian original | `original-ru` | Complete candidate (33 units, 3,958 paragraphs); OCR-collated; final proofread during translation |
| Tinct Modern English | `modern-en` | Full translation, independently reviewed, fixes applied |
| Tinct Modern Danish | `modern-da` | Full translation, independently reviewed, fixes applied |
| Human English translation | none | None permitted; Compare default to be decided |

## Remaining volume and plan to finish

**Remaining Russian source words:** English 102,163 (31 units; about 136,000 English words at the sample ratio of 1.33). Danish 108,885 (32 units; about 137,000 Danish words at 1.26).

Proposed batches (Russian words), each translated, self-reviewed and then independently reviewed before the next:

| Batch | Units | Russian words |
|---|---|---|
| B1 | 3–6 | 9,120 |
| B2 | 7–10 | 11,173 |
| B3 | 11–13 | 10,653 |
| B4 | 14–16 | 9,442 |
| B5 | 17–18 (end of Part One) | 9,047 |
| B6 | 19–22 | 13,063 |
| B7 | 23–24 | 10,979 |
| B8 | 25–26 | 9,285 |
| B9 | 27–29 | 9,478 |
| B10 | 30–33 | 9,923 |

Danish adds chapter 2 to B1 (15,842 words), then follows the same batches.

The order is English first, then Danish once the English batch is accepted. Danish is still translated from the Russian, but it reuses the reviewed glossary and decisions.

**QA per batch**, in place of the similarity gate, which cannot run here:

1. 1:1 paragraph alignment and JSON validity.
2. Length ratio and sentence-count screens against the Russian, with every flag inspected.
3. A full read of every paragraph against the Russian by an independent session, logging omissions, mistranslations and register slips.
4. A glossary consistency check.
5. A read in the target language alone, for flow.

Results are recorded per batch under `reviews/`. When the last batch is done, the whole book gets a read for continuity, then onboarding (without acclaim quotes unless they can be verified in a primary source), taxonomy, threads and character material.

## Open questions for Anders

1. **Style approval:** do the samples hit the right register? Look especially at the narrator's irony in chapter 1 and Pilate's solemnity in chapter 2. Should the English stay as close as it is now, or move more freely toward idiomatic English?
2. **US rights:** how should the possible US protection until about 2061–62 be handled: geo-restrict, get legal advice, or accept the risk?
3. **Editorial text:** is the 1990 Yanovskaya text (with the © line on "preparation of the text") acceptable, given the Kafka/Brod precedent? Or should a legal opinion come first?
4. **Compare edition:** with no human English translation, should Compare default to `original-ru`, or should there be no Compare default?
5. **Epilogue grouping:** leave it without a section, or add an «Эпилог» section?
6. **Danish register:** keep formal *De*, as in the sample, or use *du* throughout?
7. **The flagged choices** above: "Bezdomny" untranslated, "dark as a mulatto", and Russian-style «?..» punctuation.
8. **Batch size and cadence** as proposed, and whether Danish waits for the English to be accepted or runs in parallel.

## Integration notes (for the separately assigned integration step)

- No registry entry, live editions or onboarding have been created. Proposed metadata: title "The Master and Margarita"; author "Mikhail Bulgakov"; year 1967 (first publication; written 1928–1940); original language Russian; form novel; era 20th century. The taxonomy House and shelves still have to be confirmed with Anders.
- The `modern-en` and `modern-da` sample files are named `*.sample-*.json` so they cannot be taken for full editions.
- The quality gates in `books/AGENTS.md` assume an English source edition and need a documented exception for this book.
- Narration (Grok streaming, English) applies to `modern-en` once it is accepted. Nothing is generated at this stage.
