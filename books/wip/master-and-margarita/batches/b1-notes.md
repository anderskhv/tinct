# Batch b1: notes

Scope: `b1-modern-en.json` holds chapters 3–6. `b1-modern-da.json` holds chapters 2–6. Both are translated directly from `editions/master-and-margarita-original-ru.json`, aligned 1:1 by paragraph. No published translation was consulted. The Danish was made from the Russian, and the English was checked only so that the same choices are made in both.

| Ch | RU paras | EN paras / words | DA paras / words | RU words |
|---|---|---|---|---|
| 2 | 261 | (sample) | 261 / 8,508 | 6,722 |
| 3 | 50 | 50 / 1,816 | 50 / 1,779 | 1,354 |
| 4 | 65 | 65 / 2,891 | 65 / 2,855 | 2,142 |
| 5 | 104 | 104 / 4,554 | 104 / 4,305 | 3,383 |
| 6 | 105 | 105 / 2,991 | 105 / 2,925 | 2,241 |

## QA screens run

- Paragraph counts are equal to the Russian in every chapter. The JSON is valid and uses the sample schema, with `sections` "Part One" / "Første del".
- Length screen: EN under 1.0× the Russian word count, DA under 0.95×. **12 flags, all inspected, all complete.** They are short lines where English or Danish is naturally compact.
  - EN: 4.23, 5.41, 6.18, 6.67, 6.85.
  - DA: 2.96, 2.121, 2.171, 2.240, 6.18, 6.21, 6.67.
- Sentence-count screen: 2 flags (EN 3.45, 4.30). Both are artifacts of a full stop placed outside the Russian «…»; nothing is missing.
- Mechanical checks: numerals match the Russian paragraph by paragraph. Quotes are balanced. There are no straight quotes in EN and no curly quotes or em dashes in DA. «?..» and «!..» are kept wherever the Russian has them.

## New names and terms (EN / DA)

| Russian | English | Danish |
|---|---|---|
| Ермолаевский переулок | Yermolayevsky Lane | Jermolajevskij-stræde |
| «Метрополь» | the Metropol | »Metropol« (›Metropol‹ inside dialogue) |
| бюро иностранцев | the foreigners’ bureau | udlændingebureauet |
| регент (Koroviev) | choirmaster | korleder |
| Патриарший переулок | Patriarch’s Lane | Patriarkstræde |
| Спиридоновка; Никитские ворота | Spiridonovka; the Nikitsky Gate | Spiridonovka; Nikitskij-porten |
| Арбатская площадь; Большая Никитская (улица Герцена) | Arbat Square; Bolshaya Nikitskaya (Herzen Street) | Arbat-pladsen; Bolsjaja Nikitskaja (Herzen-gaden) |
| улица Кропоткина; Остоженка | Kropotkin Street; Ostozhenka | Kropotkin-gaden; Ostozjenka |
| Кирюшка; Федор Иванович | Kiryushka; Fyodor Ivanovich | Kirjusjka; Fjodor Ivanovitj |
| толстовка | tolstovka (smock) | tolstovka(-kittel) |
| Москва-река | the Moscow River | Moskva-floden |
| Татьяна; «Евгений Онегин» | Tatiana; Eugene Onegin | Tatjana; »Eugen Onegin« |
| Дом Грибоедова; Грибоедов | Griboyedov House; Griboyedov’s | Griboedov-huset; Griboedov |
| «Горе от ума» | Woe from Wit | »Forstand giver kvaler« |
| М. В. Подложная; Поклевкина; Перелыгино | M. V. Podlozhnaya; Poklevkina; Perelygino | M. V. Podlozjnaja; Poklevkina; Perelygino |
| Амвросий; Фока; Арчибальд Арчибальдович | Amvrosy; Foka; Archibald Archibaldovich | Amvrosij; Foka; Arkhibald Arkhibaldovitj |
| «Колизей»; Театральный проезд | the Coliseum; Teatralny Passage | ›Colosseum‹; Teatralnyj-passagen |
| Бескудников; Двубратский; Загривов | Beskudnikov; Dvubratsky; Zagrivov | Beskudnikov; Dvubratskij; Zagrivov |
| Настасья Лукинишна Непременова, «Штурман Жорж» | Nastasya Lukinishna Nepremenova, “Navigator Georges” | Nastasja Lukinisjna Nepremenova, »Styrmand Georges« |
| Иероним Поприхин; Абабков; Глухарев; Денискин; Квант; Лаврович | Ieronim Poprikhin; Ababkov; Glukharev; Deniskin; Kvant; Lavrovich | Ieronim Poprikhin; Ababkov; Glukharev; Deniskin; Kvant; Lavrovitj |
| Клязьма | the Klyazma | Kljazma |
| Желдыбин | Zheldybin | Zjeldybin |
| Тамара Полумесяц; Жукопов; Драгунский; Чердакчи; Семейкина-Галл | Tamara Polumesyats; Zhukopov; Dragunsky; Cherdakchi; Semeikina-Gall | Tamara Polumesjats; Zjukopov; Dragunskij; Tjerdaktji; Semejkina-Gall |
| Иоганн из Кронштадта; Витя Куфтик | Johann from Kronstadt; Vitya Kuftik | Johann fra Kronstadt; Vitja Kuftik |
| Павианов, Богохульский, Сладкий, Шпичкин, Адельфина Буздяк | Pavianov, Bogokhulsky, Sladky, Shpichkin, Adelfina Buzdyak | Pavianov, Bogokhulskij, Sladkij, Sjpitjkin, Adelfina Buzdjak |
| Пантелей; Николай (doorman) | Panteley; Nikolai | Pantelej; Nikolaj |
| Скатертный переулок | Skatertny Lane | Skatertnyj-stræde |
| Сашка (Ryukhin) | Sashka | Sasjka |
| Абрау; рыбец | Abrau; rybets | Abrau; rybets |
| ch. 2, DA only: кесарь; Тиверий; Гамала; Нижний Город; Елеонская гора; Антиохия; Соломонов пруд; себастийская / итурейская когорта; калиги | (EN sample: Caesar; Tiberius; Gamala; the Lower City; the Mount of Olives; Antioch; Solomon’s Pool; Sebastian / Ituraean cohort; caligae) | kejseren; Tiberius; Gamala; Den Nedre By; Oliebjerget; Antiokia; Salomons dam; den sebastiske / itureiske kohorte; caligae |

## Passages I was unsure of

1. **«кесарь»** (ch. 2, DA). The English sample says "Caesar". In Danish I used *kejseren*, the word of the Danish Bible ("Giv kejseren, hvad kejserens er"), which comes from *Caesar* in any case. «кесарь император» is *kejseren og imperatoren* / *kejseren, imperatoren*. If Anders wants a word-for-word match with the English, "Cæsar" is the alternative.
2. **«Тесно мне… тесно мне стало с тобой, Каифа»** (DA ch. 2, 210/213). This follows the English choice of suffocation: »Jeg kan ikke få luft« / »det er dig, Kajfas, der tager luften fra mig«.
3. **«Не знаю, кто подвесил твой язык, но подвешен он хорошо»** (DA 2.114). It is kept literal, as in the English, to carry on the hanging-hair image: »hvem der har hængt din tunge op, men den hænger godt«.
4. **«темный, как мулат»** (DA 2.258) is »mørk som en mulat«, following the open question on the English sample.
5. **«звучными стихами, которые он сочинил к первому числу»** (6.32). "The first" is almost certainly the 1 May holiday, but Bulgakov does not say so. I wrote "for the holiday on the first" / »til festdagen den første«, which is slightly more explicit than the Russian.
6. **«Взвейтесь!» да «развейтесь!»** (6.32). Ryukhin's rhyming slogan-verse: "Soar on high!" and "Unfurl and fly!" / ›Svæv mod det høje!‹ og ›Fold dig ud!‹. The rhyme is only partly kept.
7. **«Буря мглою…»** (6.98). This is the first line of Pushkin's "Winter Evening", translated here myself: "The storm with darkness veils..." / ›Stormen hyller med mørke...‹. The monument is not named, as in the Russian.
8. **«Караул!»** (4.28–29) is rendered "Help! Police!" / ›Hjælp! Politi!‹. The Russian cry means "help" and "call the watch" at once.
9. **«Карский раз! Зубрик два! Фляки господарские!!»** (5.50). These are kitchen orders: a Kars-style shashlik, "zubrik" (unclear: perhaps a dish, perhaps a nickname for bison-grass vodka), and Polish-style tripe. I wrote "Kars shashlik, one! Zubrik, two! Tripe hospodar-style!!" / »Karsk-shashlik én! Zubrik to! Hospodar-kallun!!«. Zubrik is left untranslated because I could not settle what it is.
10. **«Они не понимают!»** (4.21). Koroviev uses the deferential plural, rendered "The gentleman doesn’t understand!" / »Herren forstår ikke!«. Likewise the doorman's «если они — член Массолита» (5.92) is "if the gentleman is a member" / »når herren er medlem«.
11. **«гривенник»** (4.38–42) is "a ten-kopeck piece" / »en tikopekmønt«, saving "ten kopecks" / »ti kopek«. I avoided a Danish *tiøre* so the money stays Soviet.
12. **«лихачи»** (5.60) are "cabbies" / »vognmænd med fine heste« (a *likhach* was a cab with a fast horse). «А вот на беговой!» (5.103) is "Here, take a racehorse!" / »Hér er en travhest!«.
13. **Chapter titles.** "3. The Seventh Proof" / "Det syvende bevis". "4. The Chase" / "Jagten". "5. It Happened at Griboyedov’s" / "Det skete i Griboedov": «Было дело» is colloquial ("there was a business"), and I chose the plain idiom. "6. Schizophrenia, as Was Foretold" / "Skizofreni, som forudsagt": «как и было сказано» points back to Woland's line in ch. 1.

## Puns and wordplay

- **«Вот так история!»** (3.16) is "Well, here’s a story!" / »Sikken en historie!«. It echoes Woland's "interesting history" in ch. 1. The Danish *historie* keeps both senses, and the English keeps the echo only loosely.
- **«помилуйте» / «не помилую»** (5.86–87). "Pardon me" and "have mercy" are the same Russian word, which the English renders "for pity’s sake" / "you of all people are the one I’ll show no pity". The Danish is »hav dog barmhjertighed« / »du er den sidste, jeg vil vise barmhjertighed«.
- **Speaking names in ch. 5** are transliterated, not translated, as with Bezdomny, so the jokes are lost without a gloss: Perelygino (*perelgat'*, "to out-lie"), Podlozhnaya ("forged"), Poklevkina ("a bite", as in fishing), Dvubratsky ("two-brother"), Bogokhulsky ("blasphemer"), Sladky ("sweet"), Pavianov ("baboon"), Polumesyats ("half-moon"), Johann from Kronstadt (a parody of the priest John of Kronstadt). This is the same question as Bezdomny (open question 1 in the README).
- **«Ве»** (5.79). Ivan remembers the letter "W", the Latin letter on Woland's card in ch. 1, and his guesses (Wagner, Weiner, Wegner, Winter, Wolf) keep the W in both languages.
- **«О боги, боги мои, яду мне, яду!..»** (5.52) repeats Pilate's words from ch. 2 and is rendered to match them: "O gods, my gods, poison, give me poison!.." / »O guder, mine guder, gift, giv mig gift!..«.

## Suspected OCR errors in the Russian (not edited)

1. **5.35 «Глухаревсценарист»**: a missing space or hyphen. It should read «Глухарев-сценарист» (or «Глухарев, сценарист»). Translated as "Glukharev the screenwriter".
2. **5.18 «от первого попавшего молодого человека»**: possibly «попавшегося». This is uncertain, because «первый попавший» also occurs in the period, so it may be correct as printed. It does not affect the translation.

No other errors were noticed in chapters 2–6 during the paragraph-by-paragraph reading.
