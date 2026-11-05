# Batch b2: chapters 7–10 (modern-en, modern-da)

Translated directly from `editions/master-and-margarita-original-ru.json`. No published translation was consulted. Danish was translated from the Russian, with the English used only to keep choices consistent.

| Ch | English title | Danish title | Paragraphs (RU = EN = DA) |
|---|---|---|---|
| 7 | The Bad Apartment | Den slemme lejlighed | 104 |
| 8 | The Duel Between the Professor and the Poet | Duellen mellem professoren og digteren | 97 |
| 9 | Koroviev’s Tricks | Korovjevs numre | 95 |
| 10 | News from Yalta | Nyt fra Jalta | 140 |

Files: `b2-modern-en.json` and `b2-modern-da.json`. Both follow the sample schema, with `sections` = Part One / Første del → [7, 8, 9, 10].

## QA done

- Paragraph counts match the Russian in every chapter, in both languages.
- Length screen: there are 7 EN flags (below 1.0× the Russian word count) and 13 DA flags (below 0.95×). I inspected all 20. Every flagged paragraph is a short line, such as “You know Khustov, then?”, «Godmorgen!», «Ingen svarede.» or «Hvorhen?», and is complete. I also read side by side every paragraph of 20 or more Russian words with a ratio under 1.12 (EN) or 1.02 (DA). None of them has an omission.
- Sentence-count screen: one paragraph differs by 2 or more sentences, EN 8.61. Ivan's thought there is split into two quoted sentences. This is a punctuation difference only.
- Typography check: EN has curly quotes and unspaced em dashes. DA has »…« and ›…‹ with spaced en dashes. Neither has straight quotes. Ellipses are written `...` as in the samples. Every «?..» and «!..» in the Russian is kept, and the counts match per paragraph.

## New names (EN / DA)

| Russian | English | Danish |
|---|---|---|
| Анна Францевна де Фужере | Anna Frantsevna de Fougeray | Anna Frantsevna de Fougeray |
| Беломут (мадам Беломут) | Belomut (Madame Belomut) | Belomut (madame Belomut) |
| Анфиса | Anfisa | Anfisa |
| Груня | Grunya | Grunja |
| Хустов | Khustov | Khustov |
| Сходня | Skhodnya | Skhodnja |
| Божедомка | Bozhedomka Street | Bozjedomka-gaden |
| «Метрополь» | the Metropol | Metropol |
| Харьков; Воронеж; Ялта; Севастополь; Пушкино; Ницца | Kharkov; Voronezh; Yalta; Sevastopol; Pushkino; Nice | Kharkov; Voronezj; Jalta; Sevastopol; Pusjkino; Nice |
| Миша | Misha | Misja |
| Мессир | Messire | messire |
| Александр Николаевич (Stravinsky) | Alexander Nikolayevich | Aleksandr Nikolajevitj |
| Федор Васильевич | Fyodor Vasilyevich | Fjodor Vasiljevitj |
| дядя Федор / дядя Федя | Uncle Fyodor / Uncle Fedya | onkel Fjodor / onkel Fedja |
| Вологда | Vologda | Vologda |
| Желдыбин | Zheldybin | Zjeldybin |
| Пелагея Антоновна; «Иваныч» | Pelageya Antonovna; “Ivanych” | Pelageja Antonovna; »Ivanytj« |
| Тимофей Кондратьевич Квасцов | Timofei Kondratyevich Kvastsov | Timofej Kondratjevitj Kvastsov |
| дом № 302-бис | building No. 302-bis | ejendommen nr. 302-bis |
| Карпов | Karpov | Karpov |
| Московская областная зрелищная комиссия | the Moscow Regional Entertainment Commission | Moskvas Regionale Forlystelseskommission |
| интуристское бюро | the Intourist bureau | Intourist-bureauet |
| жилтоварищество; председатель | tenants’ association; chairman | beboerforening; formand |
| финдиректор; администратор | financial director; house manager | finansdirektør; administrator |
| угрозыск | criminal investigation (department) | kriminalpolitiet |
| (сверх)молния (telegram) | (extra-)urgent telegram; «молнируйте» = “wire urgently” | (super)lyntelegram; «lyntelegrafér» |
| контрамарка / контрамарочники | free pass / free-pass seekers | fribillet / fribilletjægere |
| толстовка | Tolstoy blouse | tolstojbluse |

Floors: EN uses American counting, the same as the Russian (fifth floor, second floor). DA uses Danish counting (пятый этаж = fjerde sal, второй этаж = første sal, нижний этаж = stueetagen).

## Passages I was unsure of

1. **ch7 p5, «в большом шестиэтажном доме, покоем расположенном»**: «покоем» means "in the shape of the letter П". EN: "laid out in a U". DA: «der lå i en hestesko».
2. **ch7 p31, «полетит к чертовой матери в преисподнюю»**: the devil vocabulary is kept. EN: "fly headfirst to the devil’s mother, down into the underworld". DA uses the idiom «til fandens oldemor nede i underverdenen». The idiom gives "great-grandmother", not "mother", but it is the natural Danish devil phrase. ch8 p21 «к чертовой бабушке» is "to the devil’s grandmother" / «gå til fandens bedstemor».
3. **ch7 p87, «Они, они!»**: Koroviev speaks of Styopa in the plural, a servant's mock-deference. EN: "Them, them!" DA: «Jamen de, de!», with a lowercase *de* (they) so that it cannot be read as the formal *De* (you). In ch10 p84 «Они заняты» (of Woland) is DA «de er optaget» for the same reason.
4. **ch7 p94 «Брысь!!»**: a word for shooing cats. EN: "Scat!!" DA: «Kys!!».
5. **ch7 p24**: the words of «Что вам угодно?» split across treble and bass. EN: «What can I do for you?» (treble "what", bass "can I", "do for you" never comes out). DA: «Hvad ønsker De?» (hvad / ønsker / De).
6. **ch8, «славно, славно»**: Stravinsky's catchword. EN: "splendid". DA: «dejligt». Both are used consistently through the chapter.
7. **ch8 p18, «фабрика-кухня»**: a Soviet mass-catering plant. EN: "factory-kitchen". DA: «fabrikskøkkenet». Neither is glossed.
8. **ch9 p52, «Эйн, цвей, дрей!»**: Koroviev's mock German. Both languages give "Ein, zwei, drei!"
9. **ch9 p53, sayings**: «денежка счет любит» → "money loves to be counted" / «penge vil tælles». «свой глазок — смотрок» → "your own eye is your best watchman" / «eget øje er den bedste vagt».
10. **ch9 p87, «У нас в доме нечистая сила!»**: «нечистая сила» is the folk term for devilry. EN: "There are unclean powers in our building!" DA: «Der er urene ånder i vores ejendom!»
11. **ch9 p89, «Покайся, Иваныч! Тебе скидка выйдет!»**: literally "you'll get a discount" (a reduced sentence). EN: "They’ll go easier on you!" DA: «Så får du strafnedsættelse!»
12. **ch10 p30, «Здравствуйте, я ваша тетя!»**: a stock comic catchphrase of disbelief, from *Charley's Aunt*. It is kept literally: "Well, hello, I’m your auntie!" / «Goddag, jeg er Deres tante!»
13. **ch10 p31, «Лжедимитрий»**: "A False Dmitry" / «En falsk Dmitrij». Not glossed.
14. **ch10 p46, «...скалы, мой приют...»**: a sung fragment. "...rocks, my refuge..." / «...klipper, mit tilflugtssted...», translated from the Russian words.
15. **ch10 p102, «В Пушкине открылась чебуречная «Ялта»»**: «в Пушкине» can be the locative of Pushkino (near Moscow) or of Pushkin (Tsarskoye Selo). Varenukha's point is a drive out of town, so I chose Pushkino. EN: "A cheburek house called the Yalta has opened in Pushkino!" DA: «et tjeburek-sted, der hedder ›Jalta‹». Please check this choice.
16. **ch10 p135, «Предупрежди... дали... дили...»**: Varenukha's broken «предупреждали». EN: "I was w... warn... wurned..." DA: «Ad... adva... advarede...»
17. **The poster (ch10 p11–14)** is kept in capitals, as printed, one line per paragraph. It is part of the book's text, not UI chrome. If house style wants sentence case here too, only these four paragraphs change.
18. **Telegrams (ch10)** stay in telegraphese with no punctuation, as in the Russian. In Rimsky's dictated reply, «точка» is rendered as "stop" / «stop».
19. **ch10 p132, «один глаз с бельмом»**: Azazello's walleye. EN: "a film over one eye". DA: «med en hinde over det ene øje».

## Suspected OCR errors in the Russian (not edited)

1. **ch8 p22**: «волейневолей». Probably «волей-неволей», with the hyphen lost at a line end. Translated as "willy-nilly" / «nolens volens».
2. **ch9 p8**: «Нои тогда не открыли.» Probably «Но и тогда», with two words run together. Translated as "But even then".
3. **ch10 p2**: «Убранство кабинета, Помимо письменного стола,…». The capital «П» after a comma is probably an OCR case error for «помимо».

Not errors: «галстухом» (ch7 p18) is Bulgakov's colloquial spelling, and «одел ли монтер в сетку лампу» (ch10 p125) is his colloquial «одел» for «надел».
