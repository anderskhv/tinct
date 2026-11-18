# Batch B6: chapters 19–22 (start of Part Two)

Files: `b6-modern-en.json`, `b6-modern-da.json` (same schema as the samples; section "Part Two" / "Anden del").

| Ch | Title EN | Title DA | Paragraphs (RU = EN = DA) |
|---|---|---|---|
| 19 | 19. Margarita | 19. Margarita | 142 |
| 20 | 20. Azazello’s Cream | 20. Azazellos creme | 46 |
| 21 | 21. Flight | 21. Flugten | 96 |
| 22 | 22. By Candlelight | 22. Ved levende lys | 126 |

Words: RU 13,063; EN 17,650 (1.35×); DA 16,984 (1.30×). Translated only from the Russian; no published translation consulted.

## QA run

- Paragraph counts match the Russian 1:1 in every chapter, both languages.
- Length screen (EN < 1.0×, DA < 0.95× of the Russian word count) plus typography checks (EN curly quotes and em dashes only; DA »…« and en dashes only; balanced quotes per paragraph). 17 flags in all, each inspected:
  - Short-ratio flags (EN 19.122, 21.13, 22.49, 22.79, 22.105; DA 19.35, 19.99, 19.122, 21.13, 21.32, 22.49, 22.79): short lines, all complete. DA 19.35 had dropped «ну»; fixed ("ja, det er den rene mystik!").
  - Unbalanced-quote flags (20.11–12 and 22.16, both languages): expected. Margarita's note runs over two paragraphs (the signature is p. 12), and Koroviev's speech continues from p. 16 into p. 17, so p. 17 reopens with “ / ».
- Danish address: *De* where the Russian has *вы* (Azazello, Koroviev and Woland to Margarita; Margarita to Nikolai Ivanovich; Margarita and Natasha to each other, as in the Russian; the hog to Natasha and Margarita). *du* where it has *ты* (Margarita to the master in her thoughts, to the boy, to the fat man; Natasha to the hog; Woland to the cat; Woland to Azazello).

## New names and terms (EN / DA)

| Russian | English | Danish |
|---|---|---|
| Иванушка | Ivanushka | Ivanusjka |
| Наталья Прокофьевна; Наташка | Natalya Prokofyevna; Natashka | Natalja Prokofjevna; Natasjka |
| Дарья | Darya | Darja |
| Желдыбин | Zheldybin | Zjeldybin |
| критик Латунский (О. Латунский) | the critic Latunsky (O. Latunsky) | kritikeren Latunskij (O. Latunskij) |
| Нюра (carved on the bench) | Nyura | Njura |
| Дом Драмлита; «Дом Драматурга и Литератора» | Dramlit House; “House of the Dramatist and Man of Letters” | Dramlit-huset; »Dramatikerens og Litteratens Hus« |
| Хустов, Двубратский, Квант, Бескудников | Khustov, Dvubratsky, Kvant, Beskudnikov | Khustov, Dvubratskij, Kvant, Beskudnikov |
| Пелагея Петровна | Pelageya Petrovna | Pelageja Petrovna |
| Дуся | Dusya | Dusja |
| Ситник | Sitnik | Sitnik |
| Клавдия Петровна | Klavdia Petrovna | Klavdija Petrovna |
| Клодина | Claudine | Claudine |
| королева Марго | Queen Margot | dronning Margot |
| Гессар | Hessar | Hessar |
| Енисей | the Yenisei | Jenisej |
| Дорогомилово | the Dorogomilovo district | Dorogomilovo-kvarteret |
| дом № 302-бис на Садовой | building No. 302-bis on Sadovaya Street | hus nr. 302-bis på Sadovaja-gaden |
| Земляной вал | Zemlyanoy Val | Zemljanoj Val |
| Ганс (Woland to the cat) | Hans | Hans |
| Брокенские горы, Чертова Кафедра | the Brocken mountains, the Devil’s Pulpit | Brockenbjergene, Djævlens Prædikestol |
| мессир; мой мэтр; донна | messire; my maître; donna | messire; min maître; donna |
| бал ста королей / весенний бал полнолуния | the ball of the hundred kings / the spring ball of the full moon | de hundrede kongers bal / fuldmånens forårsbal |
| Александровский сад; манеж | the Alexander Garden; the Manege | Aleksandrovskij-haven; Manegen |
| Тверская | Tverskaya | Tverskaja |
| конек-горбунок | the Little Humpbacked Horse | Den Lille Pukkelhest |
| беккеровский кабинетный рояль | the Becker baby grand | Becker-salonflyglet |
| Секст Эмпирик, Марциан Капелла | Sextus Empiricus, Martianus Capella | Sextus Empiricus, Martianus Capella |
| (Kiev) | Kiev | Kijev |

## Passages I was unsure of

1. **«согласна идти к черту на кулички!»** (19.139): the idiom means "to the devil's back of beyond" and carries the devil. EN "I agree to go to the devil’s own back of beyond!"; DA «jeg går med til at tage derhen, hvor fanden siger godnat!», a real Danish idiom that keeps *fanden*.
2. **«Ну вас к чертовой матери!»** (20.35, plural): EN "To the devil’s mother with the lot of you!"; DA «Gå til fandens mor, allesammen!». **«Пошел ты к чертовой матери»** (21.85, singular): EN "Go to the devil’s mother."; DA «Gå du til fandens mor.» Kept literal per the devil-vocabulary rule.
3. **Chess** (22): «Шах королю» is rendered "Check to the king" / «Skak for kongen» (Woland's formula is kept), and «шаха королю нет» as "There is no check to the king" / «kongen står ikke i skak». «офицер» is the Russian name for the **bishop** (EN "bishop", DA «løber»), not an officer. «Король на клетке г-два» → "The king is on g2" / «Kongen står på g2».
4. **«Как причудливо тасуется колода! Кровь!»** (22.53, echoing Koroviev's 22.31): EN "How whimsically the deck is shuffled! Blood!"; DA «Hvor lunefuldt kortene bliver blandet! Blodet!» The two passages are worded to match.
5. **«Душенька!» / «Королева моя французская»** (Natasha, 21.60–62): EN "My darling!" / "My French queen"; DA «Min søde!» / «Min franske dronning». "Darling" from a maid is warmer than the usual register, but so is the Russian, and it is part of her new witch's cheek.
6. **«шут гороховый»** (22.59): EN "this tomfool buffoon", DA «den bajads». **«словесная пачкотня»** (22.66–67): the cat picks the word up ("verbal smearing" / «ordsmøreri», then "smearing" / «smøreri») so that his retort still works.
7. **«Вот-с»** (Koroviev's servile *-s*, 22.17, 22.21): EN "There you have it, madam" / "there you are"; DA «Se» / «Nå, sådan». The particle cannot be carried over directly.
8. **«Невидима!»**: feminine in Russian. EN "Invisible!", DA «Usynlig!» (no gender marking available).
9. **«А вы пользуетесь этим. Лезу я в какую-то странную историю»** (19.127): «история» here means "affair/business" (EN "some strange business", DA «en eller anden mærkelig historie», where Danish *historie* covers both).
10. **Floor numbers**: Danish follows the Russian numbering literally («ottende etage», «anden etage»), not Danish *sal* numbering, so the apartment numbers and floors stay consistent with the Russian.
11. **«Гессар»** (21.86): Bulgakov's form of the name (the "bloody wedding" is Margot's, at St Bartholomew's). I rendered it "Hessar" in both languages. It could also be transliterated "Gessar"; it needs a decision once for the whole book.
12. **«Мастер ошибался … в тот час, когда ночь переваливалась через полночь»** (19.3): EN "at the hour when night was tipping over past midnight", DA «i den time, hvor natten vippede over midnat»: the odd image is kept.

## Suspected OCR errors in the Russian (not edited)

| Ch.para | Printed in our text | Probable reading |
|---|---|---|
| 19.79 | «Ая вас не знаю» | «А я вас не знаю» (lost space) |
| 21.20 | «рвала и мяса молотком струны» | «рвала и мяла молотком струны» |
| 21.54 | «не то конекгорбунок» | «не то конек-горбунок» (lost hyphen) |
| 22.48 | «свистнул посуфлерски» | «свистнул по-суфлерски» (lost hyphen) |
| 22.73 | «Три белых пешкиландскнехты» | «Три белых пешки-ландскнехты» (lost hyphen) |

The translations follow the probable readings.
