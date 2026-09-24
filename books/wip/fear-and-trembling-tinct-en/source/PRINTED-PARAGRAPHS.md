# Printed paragraphing of *Frygt og Bæven* (1895) compared with `original-da-v2.json`

Verifier: independent check, 2026-09-24. I did not modify any existing file. The machine-readable result is in `printed-paragraphs.json`.

## Method

- **Sources.** I used the processed page images from the Internet Archive item (`frygtogbvendial00kiergoog_tif.zip`) and the line coordinates from `_djvu.xml`. I tied each raw OCR line to its leaf and its pixel box, as in `SCAN-VERIFICATION.md`. Leaf *L* is printed page *L − 6*.
- **Indent measure.** For each page I took the median left edge of the full body lines. For each line I then computed `dl`, the line's left edge minus that median, and `dr`, the right-margin shortfall.
  - The paragraph indent measures **+165 to +186 px** (about 1 em) on every page.
  - Continuation lines measure **−15 to +15 px**.
  - Nothing falls between the two groups except the cases listed below, each of which I viewed.
- **Mapping v2 to the page.** Each v2 paragraph's text was aligned token by token to the raw OCR, with footnote lines excluded. That gives the raw line, and the word position within the line, where each v2 paragraph starts.
- **Classification rule.** A v2 boundary counts as a **PRINTED BREAK** only if the next paragraph starts at the beginning of an indented line. If it starts flush left, whether at the top of a page or mid-page, or in the middle of a line, it is a **NO BREAK**.
  - At a page top, the previous page's last line was also checked for being full width.
  - Every exception in the tables was viewed in the images.
- **Internal breaks.** Every indented body line whose first word falls inside a v2 paragraph, rather than at its start, is an internal break. Each one was viewed in the image.
- **Other breaks.** Rules and asterisms were found through large vertical gaps between lines, through the OCR junk lines that asterisms produce, and by viewing the pages.

## Summary

- Boundaries between consecutive v2 paragraphs: **217**. Of these, **169 are PRINTED BREAKS** and **48 are NO BREAK**.
- Printed paragraph breaks **inside** a v2 paragraph: **7**. The parse merged these.
- Section divisions (headings, asterisms, rules): **12**. Two of them are not recorded anywhere in v2: an asterism in ch3 and a rule in ch7.
- The printed text therefore has 225 − 48 + 7 = **184 paragraph units**. That count treats the Forord signature and the two German verse blocks as units.

### NO BREAK boundaries with a full stop before the split

These are the cases where a sentence ends at the split but the printed paragraph continues:

- ch4 after 18 (p. 44): "…varm Mad til ham. | naar han kommer hjem". The next word is lowercase, so the sentence continues.
- **ch6 after 12 (p. 83):** "…fuldkommen i Kjærlighed. | Hvad man da hos et Menneske…". Both lines are on the same page, and the second is flush left. The parse split here without cause.
- **ch7 after 22 (p. 106→107):** "…glemme denne Sag o. s. v. | Dersom derimod Himlens Villie…". The last line of p. 106 is full width, and p. 107 starts flush left.
- **ch7 after 54 (p. 128→129):** "…frelse en Anden. | Dette allerede viser tilstrækkelig…". The last line of p. 128 is full width, and p. 129 starts flush left.
- ch7 after 34 ("sagde: | Staa op Søster!") and ch7 after 47 ("thi den siger: | „Du skal anerkjende…"). In both, a quotation is run into the sentence.

Every other NO BREAK falls in the middle of a sentence or a word, at a page break or at a footnote.

## 1. Every boundary

| ch | after v2 ¶ | printed break | page | evidence |
|---|---|---|---|---|
| 1 | 0 | no | 6 | "Sjeldenhed i vor Tid! Car…" flush left (no indent), first line of p.6; p.5 ends "…k! Ak! Ak! det er en stor" — same printed paragraph |
| 1 | 1 | **BREAK** | 7 | first line "I vor Tid bliver Enhver i…" indented (+178px ≈ 1 em); previous line "…er i vor Tid Enhver." short |
| 1 | 2 | **BREAK** | 7 | first line "Nærværende Forfatter er i…" indented (+175px ≈ 1 em); previous line "… for at gaae videre." short |
| 1 | 3 | **BREAK** | 8 | closing formula: "Ærbødigst / Johannes de silentio." set right-aligned on its own lines (p.8), not a prose paragraph |
| 2 | 0 | **BREAK** | 10 | first line "Hiin Mand var ikke Tænker…" indented (+178px ≈ 1 em); previous line "…, men Tankens Gysen." short |
| 2 | 1 | **BREAK** | 10 | first line "Hiin Mand var ikke lærd E…" indented (+177px ≈ 1 em); previous line "…nd Ingen vidste det." short |
| 2 | 2 | **BREAK** | 11 | first line "„Og Gud fristede Abraham …" indented (+185px ≈ 1 em) at top of page; previous line "…ællingen om Abraham." short |
| 2 | 3 | **BREAK** | 11 | first line "Det var en aarle Morgen, …" indented (+175px ≈ 1 em); previous line "…m jeg vil vise Dig.“" full width |
| 2 | 4 | **BREAK** | 12 | first line "Naar Barnet skal vænnes f…" indented (+176px ≈ 1 em); previous line "…tabe Troen paa Dig.“" short |
| 2 | 5 | **BREAK** | 13 | first line "Det var en aarle Morgen, …" indented (+175px ≈ 1 em) at top of page; previous line "…at vænne Barnet fra!" short |
| 2 | 6 | **BREAK** | 13 | first line "Naar Barnet er blevet sto…" indented (+178px ≈ 1 em); previous line "…ae ikke Glæden mere." short |
| 2 | 7 | **BREAK** | 14 | first line "Det var en aarle Morgen, …" indented (+182px ≈ 1 em) at top of page; previous line "…ledes tabte Moderen!" short |
| 2 | 8 | **BREAK** | 14 | first line "Det var en stille Aften, …" indented (+179px ≈ 1 em); previous line "…et, han drog Kniven." short |
| 2 | 9 | **BREAK** | 14 | first line "Naar Barnet skal vænnes f…" indented (+173px ≈ 1 em); previous line "… var forfærdeligere?" short |
| 2 | 10 | **BREAK** | 15 | first line "Det var en aarle Morgen, …" indented (+182px ≈ 1 em) at top of page; previous line "…øvede at sørge mere!" full width |
| 2 | 11 | **BREAK** | 15 | first line "Da vendte de atter hjem, …" indented (+181px ≈ 1 em); previous line "…Abraham drog Kniven." full width |
| 2 | 12 | **BREAK** | 15 | first line "Naar Barnet skal vænnes f…" indented (+175px ≈ 1 em); previous line "…ogen havde seet det." short |
| 2 | 13 | **BREAK** | 15 | first line "Saaledes og paa mange lig…" indented (+172px ≈ 1 em); previous line "…re Føde ved Haanden." short |
| 3 | 0 | **BREAK** | 17 | first line "Nei! Ingen skal glemmes, …" indented (+178px ≈ 1 em); previous line "… hænger han ved ham." short |
| 3 | 1 | no | 18 | "Tusinde, men den, der str…" flush left (no indent), first line of p.18; p.17 ends "…n, Mand mod Mand, Een mod" — same printed paragraph |
| 3 | 2 | **BREAK** | 18 | first line "Ved Troen vandrede Abraha…" indented (+178px ≈ 1 em); previous line "…er Had til sig selv." full width |
| 3 | 3 | **BREAK** | 20 | first line "Da var der Glæde i Abraha…" indented (+178px ≈ 1 em); previous line "…men han troede ikke." short |
| 3 | 4 | **BREAK** | 20 | first line "Dog saaledes skulde det i…" indented (+180px ≈ 1 em); previous line "…a Guldbryllupsdagen." short |
| 3 | 5 | **BREAK** | 20 | first line "Saa var da Alt forspildt,…" indented (+182px ≈ 1 em); previous line "…m jeg vil vise Dig.“" short |
| 3 | 6 | no | 21 | "Opfyldelse. Hvo er da den…" flush left (no indent), first line of p.21; p.20 ends "…en korte Glæde ved Troens" — same printed paragraph |
| 3 | 7 | **BREAK** | 21 | first line "Dog Abraham troede og tro…" indented (+181px ≈ 1 em); previous line "…der prøvede Abraham." short |
| 3 | 8 | **BREAK** | 22 | first line "Men Abraham troede og tvi…" indented (+180px ≈ 1 em); previous line "…en, som han elskede." short |
| 3 | 9 | **BREAK** | 22 | first line "Men Abraham troede. Han b…" indented (+182px ≈ 1 em); previous line "…relser den Ængstede." full width |
| 3 | 10 | **BREAK** | 22 | first line "Vi læse i hine hellige Sk…" indented (+184px ≈ 1 em); previous line "…rem med sine Bønner." short |
| 3 | 11 | no | 23 | "men Abraham svarede: her …" flush left (no indent), first line of p.23; p.22 ends "…aham, Abraham hvor er Du?" — same printed paragraph |
| 3 | 12 | **BREAK** | 23 | first line "Hvo styrkede Abrahams Arm…" indented (+178px ≈ 1 em); previous line "… og han drog Kniven." short |
| 3 | 13 | **BREAK** | 24 | first line "Hvis Abraham, da han stod…" indented (+175px ≈ 1 em); previous line "…var kun en Prøvelse." short |
| 3 | 14 | **BREAK** | 24 | first line "Ærværdige Fader Abraham! …" indented (+183px ≈ 1 em); previous line "…at Abraham tvivlede." short |
| 3 | 15 | no | 25 | "Skjød, Du fængsler her ha…" flush left (no indent), first line of p.25; p.24 ends "…ør ham hisset salig i Dit" — same printed paragraph |
| 4 | 0 | **BREAK** | 30 | first line "Der er en Viden, der form…" indented (+178px ≈ 1 em); previous line "…øder sin egen Fader." short |
| 4 | 1 | **BREAK** | 30 | first line "Fortællingen om Abraham h…" indented (+176px ≈ 1 em); previous line "… gjorde den søvnløs?" short |
| 4 | 2 | **BREAK** | 32 | first line "Hvis Synderen derimod ikk…" indented (+180px ≈ 1 em); previous line "…om Præsten prædiker." short |
| 4 | 3 | **BREAK** | 32 | first line "Hvoraf forklarer man en s…" indented (+183px ≈ 1 em); previous line "…ider, omkommer ikke." short |
| 4 | 4 | no | 33 | "religieuse er, at han vil…" flush left (no indent), first line of p.33; p.32 ends "…an vilde myrde Isaak, det" — same printed paragraph |
| 4 | 5 | **BREAK** | 33 | first line "Jeg for mit Vedkommende m…" indented (+178px ≈ 1 em); previous line "… gjør ham det svært." short |
| 4 | 6 | **BREAK** | 33 | first line "Kan man da uforbeholdent …" indented (+182px ≈ 1 em); previous line "…en Lune af Skjæbnen." short |
| 4 | 7 | **BREAK** | 35 | first line "Naar jeg da saaledes havd…" indented (+177px ≈ 1 em); previous line "…dblive at elske ham?" full width |
| 4 | 8 | no | 35 | "…ethvert saadant / har altid" - mid-sentence, runs on in the same printed paragraph (p.35) |
| 4 | 9 | no | 35 | "Menneske lettere kommer h…" flush left (no indent) mid-page on p.35 — same printed paragraph |
| 4 | 10 | **BREAK** | 35 | first line "Kjærligheden har dog i Di…" indented (+178px ≈ 1 em); previous line "…lettere kommer hen.“" short |
| 4 | 11 | no | 36 | "anvendt adskillig Tid paa…" flush left (no indent), first line of p.36; p.35 ends "…g for mit Vedkommende har" — same printed paragraph |
| 4 | 12 | **BREAK** | 36 | first line "Jeg er ikke ukjendt med h…" indented (+175px ≈ 1 em); previous line "…iver jeg paralytisk." short |
| 4 | 13 | **BREAK** | 37 | first line "Mon virkelig Enhver i min…" indented (+180px ≈ 1 em); previous line "…g skal aldrig negte." short |
| 4 | 14 | **BREAK** | 39 | first line "Men hvad gjorde Abraham? …" indented (+177px ≈ 1 em); previous line "…kun Isaak i Smerten." short |
| 4 | 15 | **BREAK** | 40 | first line "Paa denne Spidse staaer A…" indented (+181px ≈ 1 em); previous line "…reflekterer paa Gud." short |
| 4 | 16 | **BREAK** | 41 | first line "Abraham kan jeg ikke fors…" indented (+174px ≈ 1 em); previous line "…n uendelig foragtet." short |
| 4 | 17 | **BREAK** | 41 | first line "Var det dog ikke bedst, a…" indented (+174px ≈ 1 em); previous line "… gjør Viin til Vand." short |
| 4 | 18 | no | 44 | "naar han kommer hjem, f. …" flush left (no indent), first line of p.44; p.43 ends "…lle Ret varm Mad til ham." — same printed paragraph |
| 4 | 19 | no | 45 | "Smerten af at forsage Alt…" flush left (no indent), first line of p.45; p.44 ends "…lighed, han har fornummet" — same printed paragraph |
| 4 | 20 | **BREAK** | 46 | first line "Dog dette Vidunder kan sa…" indented (+180px ≈ 1 em); previous line "…det eneste Vidunder." short |
| 4 | 21 | no | 47 | v2 split falls mid-line on p.47 ("…i dette Øieblik / er Liv og Død. …") — same printed paragraph |
| 4 | 22 | no | 48 | "saa er han ikke Ridder. D…" flush left (no indent), first line of p.48; p.47 ends "…abe paa det andet — kort," — same printed paragraph |
| 4 | 23 | **BREAK** | 48 | first line "Ridderen gjør da Bevægels…" indented (+175px ≈ 1 em); previous line "… og dybere i Mudret." short |
| 4 | 24 | **BREAK** | 50 | first line "I den uendelige Resignati…" indented (+180px ≈ 1 em); previous line "… ikke bedrage hende." short |
| 4 | 25 | **BREAK** | 51 | first line "Den uendelige Resignation…" indented (+180px ≈ 1 em); previous line "…t oplyste Tidsalder." short |
| 4 | 26 | **BREAK** | 52 | first line "Vi ville nu lade Troens R…" indented (+175px ≈ 1 em); previous line "…t gribe Tilværelsen." short |
| 4 | 27 | **BREAK** | 52 | first line "Troen er derfor ingen æst…" indented (+180px ≈ 1 em); previous line "…ndelige Resignation." short |
| 4 | 28 | **BREAK** | 53 | first line "Indsee kan jeg da, at der…" indented (+177px ≈ 1 em); previous line "…ligheden under Øine." short |
| 4 | 29 | **BREAK** | 53 | first line "Til at resignere hører de…" indented (+178px ≈ 1 em); previous line "…en ud for godt Kjøb." short |
| 4 | 30 | **BREAK** | 55 | first line "Timeligheden, Endelighede…" indented (+178px ≈ 1 em); previous line "…ed hans Resignation." short |
| 4 | 31 | **BREAK** | 55 | first line "See denne Bevægelse kan j…" indented (+181px ≈ 1 em); previous line "…raft af det Absurde." full width |
| 4 | 32 | no | 56 | "Livet, men til denne myst…" flush left (no indent), first line of p.56; p.55 ends "… Smerte. Jeg kan svømme i" — same printed paragraph |
| 4 | 33 | **BREAK** | 56 | first line "Dersom nu virkelig Enhver…" indented (+178px ≈ 1 em); previous line "…t beundre det Store." short |
| 4 | 34 | **BREAK** | 57 | first line "Er det virkelig saa, er a…" indented (+179px ≈ 1 em); previous line "…n kjøre med 4 Heste." short |
| 4 | 35 | **BREAK** | 57 | first line "Den sidste Bevægelse, Tro…" indented (+172px ≈ 1 em); previous line "…t for Virkeligheden." short |
| 4 | 36 | **BREAK** | 58 | first line "Man opfatter Fortællingen…" indented (+177px ≈ 1 em); previous line "…ste og det Sværeste." short |
| 4 | 37 | **BREAK** | 58 | first line "Og dog lovpriser man Abra…" indented (+182px ≈ 1 em); previous line "…or at hvæsse Kniven." short |
| 4 | 38 | **BREAK** | 59 | first line "Lad os saa enten slaae en…" indented (+162px ≈ 1 em); previous line "…ikede sidste Søndag." short |
| 4 | 39 | **BREAK** | 59 | first line "Skulde man da ikke turde …" indented (+178px ≈ 1 em); previous line "… ad paa samme Maade." short |
| 4 | 40 | **BREAK** | 60 | first line "Det er da nu min Agt af F…" indented (+179px ≈ 1 em); previous line "…a er det latterligt." short |
| 5 | 0 | **BREAK** | 62 | first line "Forholder det sig saalede…" indented (+176px ≈ 1 em); previous line "…, der er dets τέλος." short |
| 5 | 1 | **BREAK** | 62 | first line "Troen er nemlig dette Par…" indented (+178px ≈ 1 em); previous line "…vises som en Morder." short |
| 5 | 2 | **BREAK** | 62 | first line "Man hører ikke sjeldent M…" indented (+178px ≈ 1 em); previous line "…havt græske Studier." short |
| 5 | 3 | **BREAK** | 63 | first line "Troen er netop dette Para…" indented (+178px ≈ 1 em); previous line "…s sot, qui l'admire." short |
| 5 | 4 | **BREAK** | 63 | first line "At dette Paradox for den …" indented (+179px ≈ 1 em); previous line "…saa er Abraham tabt." short |
| 5 | 5 | **BREAK** | 64 | first line "Fortællingen om Abraham i…" indented (+181px ≈ 1 em); previous line "…t fra en Anfægtelse." short |
| 5 | 6 | **BREAK** | 64 | first line "Abrahams Forhold til Isaa…" indented (+175px ≈ 1 em); previous line "…mere end alle Andre." short |
| 5 | 7 | **BREAK** | 65 | first line "Naar et Foretagende, der …" indented (+179px ≈ 1 em); previous line "… Ethiskes Teleologi." short |
| 5 | 8 | **BREAK** | 65 | first line "Naar den kjække Dommer, d…" indented (+171px ≈ 1 em); previous line "…un tilhørte Faderen." short |
| 5 | 9 | **BREAK** | 66 | first line "Naar en Søn forglemmer si…" indented (+175px ≈ 1 em); previous line "…er tages fra Folket?" short |
| 5 | 10 | **BREAK** | 66 | first line "Hvis derimod Agamemnon, m…" indented (+178px ≈ 1 em); previous line "…erligere end Brutus." short |
| 5 | 11 | **BREAK** | 66 | first line "Naar Agamemnon, Jephtah, …" indented (+180px ≈ 1 em); previous line "…forstaaet dem bedre?" short |
| 5 | 12 | **BREAK** | 67 | first line "Forskjellen mellem den tr…" indented (+175px ≈ 1 em); previous line "… saa kunde troe det?" short |
| 5 | 13 | **BREAK** | 67 | first line "Med Abraham forholder det…" indented (+178px ≈ 1 em); previous line "…f selve det Ethiske." short |
| 5 | 14 | **BREAK** | 67 | first line "Hvorfor gjør Abraham det …" indented (+182px ≈ 1 em); previous line "…Du tilintetgjør Alt." short |
| 5 | 15 | **BREAK** | 68 | first line "Her viser Nødvendigheden …" indented (+178px ≈ 1 em); previous line "…ket for Guds Villie." short |
| 5 | 16 | **BREAK** | 68 | first line "Abraham kan ikke medieres…" indented (+180px ≈ 1 em); previous line "…ediere i det Almene." short |
| 5 | 17 | **BREAK** | 68 | first line "Medens derfor Abraham væk…" indented (+182px ≈ 1 em); previous line "…ene, han overtræder." short |
| 5 | 18 | **BREAK** | 70 | first line "Men naar nu det Ethiske s…" indented (+174px ≈ 1 em); previous line "… ved Djævelens Magt." short |
| 5 | 19 | **BREAK** | 70 | first line "Hvorledes forvisser da de…" indented (+183px ≈ 1 em); previous line "…at være den Enkelte." short |
| 5 | 20 | no | 71 | "Retning af Paradoxet, da …" flush left (no indent), first line of p.71; p.70 ends "…i vor Tid hører et Svar i" — same printed paragraph |
| 5 | 21 | **BREAK** | 72 | first line "Desuden er Udfaldet (fors…" indented (+180px ≈ 1 em); previous line "…ed, at han begyndte." short |
| 5 | 22 | **BREAK** | 72 | first line "Men Udfaldet er man nysgj…" indented (+180px ≈ 1 em); previous line "…t mindre berettiget?" full width |
| 5 | 23 | **BREAK** | 72 | first line "Det er min Sjæl imod, at …" indented (+181px ≈ 1 em); previous line "…es sælger det Store." short |
| 5 | 24 | **BREAK** | 73 | first line "Hvo var stor i Verden som…" indented (+176px ≈ 1 em); previous line "…lintetgjør man selv." short |
| 5 | 25 | no | 74 | "Billeder frem, han kan ik…" flush left (no indent), first line of p.74; p.73 ends "…er engang har faaet disse" — same printed paragraph |
| 5 | 26 | **BREAK** | 74 | first line "Det er Stort, naar Digter…" indented (+175px ≈ 1 em); previous line "…bleve det ved disse." short |
| 5 | 27 | **BREAK** | 75 | first line "Man bliver rørt, man søge…" indented (+178px ≈ 1 em); previous line "… græd over Dig selv." short |
| 5 | 28 | **BREAK** | 75 | first line "Dog jeg vender tilbage ti…" indented (+176px ≈ 1 em); previous line "… der saae det Rette." short |
| 5 | 29 | **BREAK** | 75 | first line "Abrahams Historie indehol…" indented (+175px ≈ 1 em); previous line "…nd alle Mediationer." short |
| 5 | 30 | no | 76 | "Vidunder, og dog er intet…" flush left (no indent), first line of p.76; p.75 ends "…gen forstaae. Troen er et" — same printed paragraph |
| 6 | 0 | **BREAK** | 78 | first line "Dersom nu det her Udvikle…" indented (+179px ≈ 1 em); previous line "… at elske sin Næste." short |
| 6 | 1 | **BREAK** | 78 | first line "For den ethiske Betragtni…" indented (+151px ≈ 1 em); previous line "…høiere end det lige." short |
| 6 | 2 | no | 79 | "Inderlighed. Dette maa ik…" flush left (no indent), first line of p.79; p.78 ends "…ed hiin første, men en ny" — same printed paragraph |
| 6 | 3 | **BREAK** | 79 | first line "Troens Paradox er da dett…" indented (+176px ≈ 1 em); previous line "…roen kan bryde frem." short |
| 6 | 4 | **BREAK** | 80 | first line "Forholder det sig ikke sa…" indented (+183px ≈ 1 em); previous line "…thisk talt er Pligt." short |
| 6 | 5 | **BREAK** | 80 | first line "Dette Paradox lader sig i…" indented (+180px ≈ 1 em); previous line "…n gav efter for den." short |
| 6 | 6 | **BREAK** | 80 | first line "I Fortællingen om Abraham…" indented (+175px ≈ 1 em); previous line "…e til hans Gjerning." short |
| 6 | 7 | **BREAK** | 82 | first line "Der foredrages som bekjen…" indented (+177px ≈ 1 em) at top of page; previous line "…dnu bedre kan fatte." short |
| 6 | 8 | **BREAK** | 82 | first line "Dersom hiin fromme og kje…" indented (+180px ≈ 1 em); previous line "…an opføre Bygningen." short |
| 6 | 9 | **BREAK** | 83 | first line "Ordene ere forfærdelige, …" indented (+186px ≈ 1 em); previous line "…rd at reise sig for." short |
| 6 | 10 | **BREAK** | 83 | first line "Man indseer nu let, at hv…" indented (+174px ≈ 1 em); previous line "…t eneste ydmyge Mod." short |
| 6 | 11 | no | 83 | "…at opdage og / deri see" - mid-line, same printed paragraph (p.83) |
| 6 | 12 | no | 83 | "Hvad man da hos et Mennes…" flush left (no indent) mid-page on p.83 — same printed paragraph |
| 6 | 13 | no | 84 | "paa Egoisme og Dumhed, de…" flush left (no indent), first line of p.84; p.83 ends "…e vilde ansee for et Tegn" — same printed paragraph |
| 6 | 14 | **BREAK** | 84 | first line "Men hvorledes da hade dem…" indented (+180px ≈ 1 em); previous line "…illing om Guddommen." full width |
| 6 | 15 | **BREAK** | 84 | first line "Stedet hos Lucas maa frem…" indented (+176px ≈ 1 em); previous line "…liver han en Morder." short |
| 6 | 16 | no | 85 | "Enkelte er kommen ind i P…" flush left (no indent), first line of p.85; p.84 ends "…d i den, og saa snart den" — same printed paragraph |
| 6 | 17 | **BREAK** | 85 | first line "Man afholder sig i Almind…" indented (+177px ≈ 1 em); previous line "… hvori han forsøges." short |
| 6 | 18 | **BREAK** | 86 | first line "Lad os saa lidt nærmere o…" indented (+183px ≈ 1 em); previous line "…ler ei dets Storhed." short |
| 6 | 19 | **BREAK** | 87 | first line "Troens Ridder veed, at de…" indented (+171px ≈ 1 em); previous line "…ædsommere en Hykler." short |
| 6 | 20 | no | 88 | "Cunetator, han standsede …" flush left (no indent), first line of p.88; p.87 ends "…er berømt ved sit Tilnavn" — same printed paragraph |
| 6 | 21 | **BREAK** | 88 | first line "Dette er det Forfærdelige…" indented (+180px ≈ 1 em); previous line "…liver publici juris." full width |
| 6 | 22 | **BREAK** | 88 | first line "Den tragiske Helt er snar…" indented (+182px ≈ 1 em); previous line "…r ham i 3die Person." short |
| 6 | 23 | **BREAK** | 88 | first line "Troens Ridder har da førs…" indented (+182px ≈ 1 em); previous line "…n udenfor Paradoxet." short |
| 6 | 24 | no | 90 | "Alt. Den tragiske Helt gj…" flush left (no indent), first line of p.90; p.89 ends "…n Troens Ridder er ene om" — same printed paragraph |
| 6 | 25 | **BREAK** | 90 | first line "Om den Enkelte nu virkeli…" indented (+179px ≈ 1 em); previous line "…e gavner det Almene." short |
| 6 | 26 | **BREAK** | 91 | first line "Troens Ridder han er alen…" indented (+176px ≈ 1 em); previous line "…forfærdelige Ansvar." short |
| 6 | 27 | **BREAK** | 92 | first line "Enten er der da en absolu…" indented (+177px ≈ 1 em); previous line "…lgængeligt for Alle." short |
| 7 | 0 | **BREAK** | 93 | first line indented (image p.93); page median skewed by drop cap "Det" of Problema III |
| 7 | 1 | **BREAK** | 94 | first line "Det bliver det Bedste her…" indented (+181px ≈ 1 em); previous line "…altid har været til." short |
| 7 | 2 | **BREAK** | 95 | first line "Aristoteles siger i hans …" indented (+177px ≈ 1 em); previous line "…il saadanne Smaaord?" short |
| 7 | 3 | **BREAK** | 96 | first line "Ogsaa i det nyere Drama h…" indented (+179px ≈ 1 em); previous line "…en han er ansvarlig." short |
| 7 | 4 | no | 97 | "Hyklere, den prisgiver ha…" flush left (no indent), first line of p.97; p.96 ends "… er ingen Ven af skaldede" — same printed paragraph |
| 7 | 5 | **BREAK** | 97 | first line "Veien, som jeg har at gaa…" indented (+170px ≈ 1 em); previous line "…rsøgelses Interesse." short |
| 7 | 6 | **BREAK** | 97 | first line "Et Par Exempler. En Pige …" indented (+178px ≈ 1 em); previous line "…lute Forskjellighed." short |
| 7 | 7 | **BREAK** | 98 | first line "Men Ethiken kjender ikke …" indented (+178px ≈ 1 em); previous line "…lige hurtig for den." short |
| 7 | 8 | **BREAK** | 98 | first line "Æsthetiken fordrede altsa…" indented (+181px ≈ 1 em); previous line "…eget An- og Tilsvar." short |
| 7 | 9 | **BREAK** | 99 | first line "Undertiden fordrer imidle…" indented (+182px ≈ 1 em); previous line "…raffede Skjultheden." short |
| 7 | 10 | **BREAK** | 99 | first line "Ethiken har imidlertid in…" indented (+177px ≈ 1 em); previous line "… er Alt i sin Orden." short |
| 7 | 11 | **BREAK** | 100 | indented paragraph (image p.100); the OCR "—" is a speck left of the indent, no dash printed |
| 7 | 12 | **BREAK** | 100 | first line "Tiltrods for den Strenghe…" indented (+178px ≈ 1 em); previous line "…n Tilfredsstillelse." short |
| 7 | 13 | **BREAK** | 100 | first line "Inden jeg imidlertid gaae…" indented (+182px ≈ 1 em); previous line "…dne med den Enkelte." short |
| 7 | 14 | no | 101 | "at de om muligen i deres …" flush left (no indent), first line of p.101; p.100 ends "…re dem i at staae stille," — same printed paragraph |
| 7 | 15 | no | 102 | "Begivenhed neppe af uden …" flush left (no indent), first line of p.102; p.101 ends "… ikke. I Delphi gik denne" — same printed paragraph |
| 7 | 16 | no | 103 | "med, ja Bruden havde end …" flush left (no indent), first line of p.103; p.102 ends "…de være hende behjælpelig" — same printed paragraph |
| 7 | 17 | **BREAK** | 103 | first line "Dog jeg afbryder her; jeg…" indented (+178px ≈ 1 em); previous line "…ik hendes Dør forbi." short |
| 7 | 18 | no | 105 | "adskiller. Dog bliver den…" flush left (no indent), first line of p.105; p.104 ends "…r et Par, som Himlen selv" — same printed paragraph |
| 7 | 19 | **BREAK** | 105 | first line "Ethiken vil imidlertid fo…" indented (+184px ≈ 1 em); previous line "…ed samt dens Ulykke." short |
| 7 | 20 | no | 106 | "…at han skal / tale." across p.105→106 (footnote between); p.106 first line "tale." flush left - page-break continuation |
| 7 | 21 | **BREAK** | 106 | first line "Men hvortil nu denne Skiz…" indented (+173px ≈ 1 em); previous line "…Mellemliggende over." short |
| 7 | 22 | no | 107 | "Dersom derimod Himlens Vi…" flush left (no indent), first line of p.107; p.106 ends "…glemme denne Sag o. s. v." — same printed paragraph |
| 7 | 23 | **BREAK** | 107 | first line "Nu vil jeg lade en Skizze…" indented (+177px ≈ 1 em); previous line "… forvexler sig selv." short |
| 7 | 24 | no | 110 | p.110 first line "Nærheden;" starts with a small gap (~half an indent) where the letter "i" is missing (type dropped); p.109 last line full width; sentence continues ("en Havmand [i] Nærheden") - continuation |
| 7 | 25 | **BREAK** | 110 | first line "Vi ville nu give Havmande…" indented (+184px ≈ 1 em); previous line "…ddel, det er Uskyld." short |
| 7 | 26 | **BREAK** | 110 | first line "Forsaavidt nu Angeren gri…" indented (+178px ≈ 1 em); previous line "… da er han aabenbar." short |
| 7 | 27 | **BREAK** | 110 | first line "Hengiver han sig til dett…" indented (+168px ≈ 1 em); previous line "…rtrer ham, jo bedre." short |
| 7 | 28 | **BREAK** | 111 | first line "Ved Hjælp af det Dæmonisk…" indented (+176px ≈ 1 em); previous line "…n til at martre ham." short |
| 7 | 29 | no | 112 | "Mod til at fravriste sig …" flush left (no indent), first line of p.112; p.111 ends "…e ligger. Han vil da have" — same printed paragraph |
| 7 | 30 | **BREAK** | 113 | first line "Saasnart jeg bevæger mig …" indented (+167px ≈ 1 em); previous line "… er det Umiddelbare." short |
| 7 | 31 | no | 114 | "Alt let, men hvad her er …" flush left (no indent), first line of p.114; p.113 ends "…i disse Sphærer, da gaaer" — same printed paragraph |
| 7 | 32 | no | 116 | "— alene denne Forestillin…" flush left (no indent), first line of p.116; p.115 ends "…l at begynde paa en frisk" — same printed paragraph |
| 7 | 33 | **BREAK** | 117 | first line "Vilde man have et Anlæg i…" indented (+176px ≈ 1 em); previous line "… hvad der var glemt?" short |
| 7 | 34 | no | 119 | "Staa op Søster! og vi vil…" flush left (no indent), first line of p.119; p.118 ends "…obias af Sengen og sagde:" — same printed paragraph |
| 7 | 35 | **BREAK** | 119 | first line "Dersom en Digter læste de…" indented (+176px ≈ 1 em); previous line "… sig over os (8, 4)." short |
| 7 | 36 | **BREAK** | 119 | first line "Lad Sara være en Mand, og…" indented (+173px ≈ 1 em); previous line "…vem hun skyldte Alt!" short |
| 7 | 37 | no | 120 | "Medlidenhed. Der ligger e…" flush left (no indent), first line of p.120; p.119 ends "…taale, den kan ikke taale" — same printed paragraph |
| 7 | 38 | **BREAK** | 121 | start of indented German verse block (Richard III, 8 lines) p.121 |
| 7 | 39 | **BREAK** | 121 | prose resumes after the verse block, indented (p.121) |
| 7 | 40 | **BREAK** | 123 | first line "Endnu et Tilfælde vil jeg…" indented (+166px ≈ 1 em); previous line "…Møie at opdage Lidt." short |
| 7 | 41 | no | 124 | "Gang. Dette er Digternes …" flush left (no indent), first line of p.124; p.123 ends "…postat, der gaaer Kjødets" — same printed paragraph |
| 7 | 42 | **BREAK** | 124 | first line "Kun naar man saaledes bøi…" indented (+178px ≈ 1 em); previous line "…den forreste Margen." short |
| 7 | 43 | no | 125 | "gjennemhøre Repliken, om …" flush left (no indent), first line of p.125; p.124 ends "… Bevægelse, han kan strax" — same printed paragraph |
| 7 | 44 | **BREAK** | 125 | first line "Man kan stundom høre Menn…" indented (+173px ≈ 1 em); previous line "…ffer for det Almene." short |
| 7 | 45 | **BREAK** | 126 | first line "Det følger af sig selv, a…" indented (+176px ≈ 1 em); previous line "…e om sin Kjærlighed." short |
| 7 | 46 | **BREAK** | 126 | first line "Tier han, da dømmer Ethik…" indented (+182px ≈ 1 em); previous line "…an vil forvirre Alt." short |
| 7 | 47 | no | 127 | "„Du skal anerkjende det A…" flush left (no indent), first line of p.127; p.126 ends "…hiken ham; thi den siger:" — same printed paragraph |
| 7 | 48 | **BREAK** | 127 | first line "Tier han paa eget An- og …" indented (+176px ≈ 1 em); previous line "…Hensyn til Ansvaret." short |
| 7 | 49 | **BREAK** | 127 | first line "Kan Tvivleren derimod bli…" indented (+178px ≈ 1 em); previous line "…rede Din Beslutning." short |
| 7 | 50 | **BREAK** | 127 | first line "Selv det nye Testament vi…" indented (+177px ≈ 1 em); previous line "…faae en anden Tvivl." short |
| 7 | 51 | **BREAK** | 128 | first line "Men nu Abraham, hvorledes…" indented (+178px ≈ 1 em); previous line "…ee paa andre Tanker." short |
| 7 | 52 | **BREAK** | 128 | first line "Abraham talte altsaa ikke…" indented (+176px ≈ 1 em); previous line "…orklare end Abraham." short |
| 7 | 53 | **BREAK** | 128 | first line "Æsthetiken tillod, ja for…" indented (+176px ≈ 1 em); previous line "…k end Familie-Livet." short |
| 7 | 54 | no | 129 | "Dette allerede viser tils…" flush left (no indent), first line of p.129; p.128 ends "…ie kunde frelse en Anden." — same printed paragraph |
| 7 | 55 | **BREAK** | 129 | first line "Den egentlige tragiske He…" indented (+180px ≈ 1 em); previous line "… tale, men vil ikke." short |
| 7 | 56 | **BREAK** | 129 | first line "Nu staae vi da ved Parado…" indented (+179px ≈ 1 em); previous line "…ne og han er skjult." short |
| 7 | 57 | **BREAK** | 129 | first line "Forsaavidt kan det atter …" indented (+179px ≈ 1 em); previous line "…r en æsthetisk Helt." short |
| 7 | 58 | **BREAK** | 129 | first line "Abraham tier — men han ka…" indented (+181px ≈ 1 em); previous line "…saa hæves Paradoxet." full width |
| 7 | 59 | **BREAK** | 130 | start of indented German verse block (3 lines, "Wer bat für ihn?…") p.130 |
| 7 | 60 | **BREAK** | 130 | prose resumes after verse block, indented (p.130) |
| 7 | 61 | **BREAK** | 131 | first line "Denne Nød kan jeg vel for…" indented (+176px ≈ 1 em); previous line "… han taler i Tunger." short |
| 7 | 62 | **BREAK** | 131 | first line "Abraham kan ikke tale; th…" indented (+176px ≈ 1 em); previous line "…n ikke Abraham mere." short |
| 7 | 63 | no | 131 | "Bevægelse. Dette er hans …" flush left (no indent) mid-page on p.131 — same printed paragraph |
| 7 | 64 | no | 132 | "dog vil det ikke skee, el…" flush left (no indent), first line of p.132; p.131 ends "… Trøst. Han siger nemlig:" — same printed paragraph |
| 7 | 65 | **BREAK** | 132 | first line "Abraham talede da ikke. K…" indented (+178px ≈ 1 em); previous line "…enhed en Vaudeville." short |
| 7 | 66 | **BREAK** | 132 | first line "Dette sidste Ord af Abrah…" indented (+178px ≈ 1 em); previous line "…ændofferet min Søn!“" short |
| 7 | 67 | **BREAK** | 132 | first line "Det har ofte været Gjenst…" indented (+180px ≈ 1 em); previous line "…se sig i Forvirring." short |
| 7 | 68 | **BREAK** | 132 | first line "Det følger af sig selv, a…" indented (+185px ≈ 1 em); previous line "… i Forhold til Aand." short |
| 7 | 69 | no | 133 | "Culminations Øieblik, lig…" flush left (no indent), first line of p.133; p.132 ends "…t den tragiske Helt i sit" — same printed paragraph |
| 7 | 70 | **BREAK** | 134 | first line "Hvad her kortelig er anty…" indented (+177px ≈ 1 em); previous line "…k at holde ham oppe." short |
| 7 | 71 | no | 135 | "Sagte, uden dog derved at…" flush left (no indent), first line of p.135; p.134 ends "…nd forstaae Abraham i det" — same printed paragraph |
| 7 | 72 | **BREAK** | 135 | first line "Inden jeg gaaer over til …" indented (+174px ≈ 1 em); previous line "… naaer ingen Digter." full width |
| 7 | 73 | **BREAK** | 135 | first line "Imidlertid er der dog opb…" indented (+180px ≈ 1 em); previous line "… nogen tragisk Helt." short |
| 7 | 74 | no | 136 | "jeg ogsaa forstaae Abraha…" flush left (no indent), first line of p.136; p.135 ends "…n forstaae Paradoxet, kan" — same printed paragraph |
| 7 | 75 | **BREAK** | 137 | first line "Det viser sig da atter he…" indented (+167px ≈ 1 em); previous line "…n paa Troens Ridder." short |
| 7 | 76 | **BREAK** | 137 | first line "Og hvad dømte nu Samtiden…" indented (+171px ≈ 1 em); previous line "…eneste Vidunderlige." full width |
| 7 | 77 | **BREAK** | 137 | first line "Enten er der da et Parado…" indented (+179px ≈ 1 em); previous line "…ne og glemmer Intet." short |
| 8 | 0 | no | 139 | "Henseende til dette begyn…" flush left (no indent), first line of p.139; p.138 ends "…lægt af en foregaaende. I" — same printed paragraph |
| 8 | 1 | **BREAK** | 139 | first line "Men den høieste Lidenskab…" indented (+180px ≈ 1 em); previous line "…løs og daarlig Tale." short |
| 8 | 2 | **BREAK** | 140 | first line "Troen er den høieste Lide…" indented (+174px ≈ 1 em); previous line "…r hører til at lege?" short |
| 8 | 3 | **BREAK** | 140 | first line "„Man maa gaae videre; man…" indented (+186px ≈ 1 em); previous line "…en anden Forklaring." short |
| 8 | 4 | no | 141 | "Flod. Den dunkle Heraklit…" flush left (no indent), first line of p.141; p.140 ends "…o Gange gjennem den samme" — same printed paragraph |

## 2. Printed paragraph breaks inside v2 paragraphs (to split)

| ch | v2 ¶ | new printed paragraph starts with | preceded by | page | evidence |
|---|---|---|---|---|---|
| 3 | 3 | „Ved Troen modtog Abraham Forjættelsen, at i…“ | …saligere at betragte den Troende. | 18 | indented +≈178 px after a short line; viewed in the image |
| 4 | 7 | „Der lod sig da vel tale om…“ | …baade Bedriften og den Forvildede. | 34 | indented +≈178 px after a short line; viewed in the image |
| 4 | 18 | „Jeg tilstaaer oprigtigt, jeg har i min…“ | …dybt foragter — med Spidsborgerlighed. | 42 | indented +≈178 px after a short line; viewed in the image |
| 7 | 15 | „Aristoteles fortæller i hans Politik en Historie…“ | …kunne opdage Eet og Andet. | 101 | indented +≈178 px after a short line; viewed in the image |
| 7 | 30 | „Havmanden staaer paa en dialektisk Spidse. Hvis…“ | …meget godt med et Menneske. | 112 | indented +≈178 px after a short line; viewed in the image |
| 7 | 32 | „Havmandens Bevægelser kan jeg derfor forstaae, medens…“ | …og nu Paradoxet gjentager sig. | 114 | indented +≈178 px after a short line; viewed in the image |
| 7 | 70 | „Socrates kan man bruge som et Exempel.…“ | …bliver udødelig efter sin Død. | 133 | indented +≈178 px after a short line; viewed in the image |

Line breaks inside verse. These are not paragraphs, but they are lost in v2:

- ch7 ¶39 (p. 121): 8 indented verse lines, beginning "… Ich, roh geprägt, und aller Reize baar." The ellipsis is printed.
- ch7 ¶60 (p. 130): 3 indented verse lines, "Wer bat für ihn? … / Zu Füssen mir … / Wer sprach von Bruderpflicht? Wer sprach von Liebe*)."

## 3. Section divisions, asterisms and ornaments

| ch | where | page | what the image shows |
|---|---|---|---|
| 2 | between ¶2 and ¶3 | 10 | short centred rule ends the introduction on p.10; I. starts on a new page (p.11) |
| 2 | heading on ¶3 | 11 | centred "I." on new page; motto „Og Gud fristede…“ in letterspaced type, followed by extra space |
| 2 | between ¶4 and ¶5 | 12 | "* * *" (three asterisks, triangle) before weaning passage "Naar Barnet skal vænnes fra, da sværter…"; short rule at foot of p.12 ends section I |
| 2 | heading on ¶6 | 13 | centred "II." on new page |
| 2 | between ¶6 and ¶7 | 13 | "* * *" before "Naar Barnet er blevet stort…"; short rule ends section II |
| 2 | heading on ¶8 | 14 | centred "III." on new page |
| 2 | between ¶9 and ¶10 | 14 | "* * *" before "Naar Barnet skal vænnes fra, da er ei heller…"; short rule ends section III |
| 2 | heading on ¶11 | 15 | centred "IV." on new page |
| 2 | between ¶12 and ¶13 | 15 | "* * *" before "Naar Barnet skal vænnes fra, da har Moderen…" |
| 2 | between ¶13 and ¶14 | 15 | centred short rule before closing paragraph "Saaledes og paa mange lignende Maader…"; double rule after it ends the chapter |
| 3 | between ¶14 and ¶15 | 24 | "* * *" between "…at Abraham tvivlede." and "Ærværdige Fader Abraham! Da Du drog hjem…" (not recorded in v2 or CORRECTIONS.md) |
| 7 | between ¶51 and ¶52 | 128 | centred short rule with extra space between "…saa kom de maaskee paa andre Tanker." and "Men nu Abraham, hvorledes handlede han?" (not recorded in v2) |

Notes on the Exordium (ch2):

- I, II, III and IV each begin on a new page under a centred Roman numeral.
- The motto „Og Gud fristede Abraham …“ is set in letterspaced type, with extra space after it, directly under "I.".
- Each variation's narrative is followed by a centred asterism "\* \* \*" (three asterisks in a triangle) and then the weaning paragraph.
- Sections I, II and III each end with a short centred rule. Section IV's weaning paragraph is followed by a short rule, then the closing paragraph "Saaledes og paa mange lignende Maader…", then a double rule that ends the chapter.
- The introduction (¶0–2) ends with a short rule on p. 10.
- In v2, the four weaning paragraphs (¶5, ¶7, ¶10, ¶13) and the second paragraph of III (¶9, "Det var en stille Aften") all begin with a printed indent. That matches v2.

Other ornaments:

- Problema I–III, the Foreløbig Expectoration and the Epilog open with a large initial ("Det", "Et", "Da").
- Chapters end with a double rule or a small ornament, as at the end of the Epilog on p. 141.
- The rules above footnotes are not section breaks.
- No other asterisms or rules occur inside chapters. I checked every gap wider than 2.5 line-spacings on every page, and every OCR junk line.

## Uncertain or special cases

- **ch1 after 3 ("Ærbødigst / Johannes de silentio.", p. 8):** a signature set right-aligned on two lines. It is classified as a break, as its own unit, but it is not a prose paragraph.
- **ch7 after 0 ("Her staae vi atter…", p. 93):** the page median is skewed by the drop cap and the heading, so the offset measured only +29 px. The image clearly shows a normal indent, so this is a BREAK.
- **ch7 after 11 (p. 100):** an indented paragraph. The OCR "—" is a speck, as in SCAN-VERIFICATION F9. This is a BREAK.
- **ch7 after 24 (p. 110, "Nærheden;"):** the first line starts about 104 px in, roughly half an indent, where a character is missing. The last line of p. 109 is full width, and the sentence requires "i". I classify it as NO BREAK. This physically supports the reading that a type "i" dropped out at the start of the line.
- **ch7 after 38, 39, 59 and 60:** these are the boundaries around the two German verse blocks. They are classified as BREAK because the verse is set off, indented and on its own lines.
- **ch6 after 1 („For den ethiske Betragtning…", p. 78):** the indent measured +151 px because the line opens with a quotation mark. This is a BREAK.
- **ch4 after 8, ch6 after 11 and ch7 after 20:** v2's first token could not be aligned automatically. I checked each one by its text and page position. Each is a mid-sentence continuation, so NO BREAK.
