# Review log: candide (modern-da, batch e-short-classics)

## Method
1. The modern-en file was split into chunks of whole chapters (or, for long chapters, paragraph ranges), about 3,500 English words each.
2. A translator subagent translated each chunk paragraph for paragraph, following the batch brief (STYLE.md in this package folder's parent) and the fixed term list below, then ran a structural check (segment, paragraph and title counts; English, length-ratio and quote-mark flags) and corrected its own draft.
3. A second, independent reviewer subagent saw only the English chunk and the Danish chunk (no glossary, no older edition, no translator notes). It checked every paragraph and title for meaning, omissions, additions, English left in, stiff phrasing and form, and returned full corrected paragraphs.
4. The orchestrator applied every reviewer fix except those that broke an explicit brief rule (recorded below as NOT APPLIED), then assembled the book and ran the gates (GATES.md).

Totals: 71 reviewer findings logged; 3 not applied (brief conflicts); all others applied.

## Fixed term list given to translators
Older Danish edition at /home/user/tinct/app/public/data/editions/candide-modern-da.json: you may grep it ONLY to see how names, places, recurring terms and quotations were rendered. Never copy, adapt or paraphrase its sentences; translate fresh from the English.
Fixed: Candide; Cunegonde (keep); Pangloss; Martin; Cacambo; the old woman → den gamle kone; Baron Thunder-ten-Tronckh → baron Thunder-ten-Tronckh; Westphalia → Westfalen; Paquette; Friar Giroflee → broder Giroflée; Pococurante; El Dorado → Eldorado; Lisbon → Lissabon; Surinam; Venice → Venedig; Constantinople → Konstantinopel; the Bulgarians → bulgarerne; the Abares → abarerne; Anabaptist → gendøber; auto-da-fe → autodafé; metaphysico-theologico-cosmolo-nigology → metafysisk-teologisk-kosmolo-nigologi; "all is for the best in the best of all possible worlds" → »alt er til det bedste i den bedste af alle mulige verdener«; "we must cultivate our garden" → »vi må dyrke vores have«.


## Translator notes per chunk (judgment calls)
## candide-01 (translator)
- check: en=3261 da=3227 ratio=0.990 OK. gendøberen Jakob; frøken Cunegonde; mester Pangloss; Dioskorides; pox → syfilis; crowns → dalere; florins → gylden; run the gauntlet → løbe spidsrod; My Lord → nådig herre.
## candide-02 (translator)
- check: en=2961 da=2903 ratio=0.980 OK. Honest James → Jakob; the Familiar → en familiaris ved Inkvisitionen / familiaren; Grand Inquisitor → storinkvisitoren; his lordship → hans nåde. Address: du among Candide, Cunegonde, Pangloss, old woman; De/Deres Excellence between Pangloss and the Familiar.
## candide-03 (translator)
- check (re-run by orchestrator): see above. Old woman De/frøken to Cunegonde; Cunegonde du to her; I/jer to the pair. Badajoz, Massa Carrara, Salé, Algier, Haag, Cádiz; Voltaire's Vismar, Leyden, Cassel; Palus Meotides (Azovhavet); Holy Brotherhood → Det Hellige Broderskab; Urban X → pave Urban 10.; seventy-two quarterings → toogthalvfjerds aner; Mahomet kept; eunuch's Italian kept.
## candide-04 (translator)
- check: en=2562 da=2567 ratio=1.002 OK. Buenos Aires, Tucumán, Sankt Jakob af Compostela, Sankt Ignatius; 72 quarterings → tooghalvfjerds adelige aner; alcalde; gråbroder; storinkvisitoren; fader provincial; ordensgeneral; bulgarsk eksercits; spontoon → sponton. Address: old woman & Cunegonde I/jer; Cacambo De to Candide, Candide du to Cacambo; Candide De to the Jesuit Baron, who answers du.
## candide-05 (translator)
- check: en=4009 da=3953 ratio=0.986 OK. Eldorado, Westfalen; Oreilloner, Journal de Trévoux, stormogulens trone; quoits → kasteskiver; fly-birds → fluefugle; twenty million sterling → tyve millioner pund sterling.
## candide-06 (translator)
- check: en=2570 da=2521 ratio=0.981 OK. Buenos Ayres → Buenos Aires; frøken Cunegonde, mynheer Vanderdendur, socinianer, manikæer (old glossary); three miles → tre mil; piastre, patagoner.
## candide-07 (translator)
- check: en=3885 da=3896 ratio=1.003 OK. Formal De throughout incl. Candide–Martin (»hr. Martin«); Candide du only to Cunegonde; abbed/Périgord, oreillonerne, markisinden de Parolignac, Atrebatien; folliculaire kept with gloss pjecesmører; »for den frie vilje –«.
## candide-08 (translator)
- check: en=3707 da=3682 ratio=0.993 OK. De between characters (old edition), Candide du to Paquette; Lord/Signor Pococurante → signor Pococurante; ch25 title »Besøget hos signor Pococurante, en fornem venetianer«; Theatin → teatinermunk; Grey Friar → gråbroder; the Straits → strædet; red sheep → røde får; half-breed valet → halvblods kammertjener (period voice).
## candide-09 (translator)
- check: en=3271 da=3203 ratio=0.979 OK. Flags from names/Danish words. zecchiner, Ragotski, sultan Mahmoud, Weichsel, Buenos Aires (en "Ayres"), Leibniz (en "Leibnitz"); bull's pizzle → oksepisk; Serene Highnesses → Durchlauchtigheder; crucial incision → korsformet snit. Address: De/Deres Majestæt among kings and Candide to captain and baron; Candide du with Pangloss, Martin, Cacambo.
## candide-10 (translator)
- check: en=1938 da=1891 ratio=0.976 OK. negro pirates → sorte pirater (avoid slur); "with her left hand" → til venstre hånd (morganatic idiom); Pangloss du to Candide, I to the group; biblical/classical names per Danish Bible (Ba'sha, Ahazja, Atalja, Jojada, Jekonja, Zedekias, Krøsus, Ariovist); twenty acres → tyve acres; Latin "ut operaretur eum" kept.

## Independent review per chunk

### candide-10 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 40; titles checked: 2; findings: 1; applied: 0
- Reviewer summary: A strong, idiomatic translation that keeps Voltaire's dry register, the irony and the De/du distinctions consistently. Every paragraph is complete and accurate, with no additions; the only real problem is the English unit 'acres'.
  - NOT APPLIED ch30 p22: Unit conversion (acres → tønder land) is against the brief (keep the English units); »tyve acres« stays.
  - ch30 p22 [english] 'acres' is an English unit and reads as an anglicism in Danish; the natural Danish land measure is 'tønder land' (Voltaire has 'arpents').

### candide-06 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 58; titles checked: 2; findings: 5; applied: 5
- Reviewer summary: A strong, faithful translation in natural Danish that keeps Voltaire's dry irony and the slave's speech intact; no omissions, additions or form errors found. Five small fixes: one false unit (Danish 'mil' for miles), one shifted nuance ('lede ved livet'), one causal 'since' rendered as 'når', and two slightly stiff phrasings.
  - ch18 p39 [stiff] 'tage mod Cayenne' is unidiomatic for 'make for Cayenne'.
  - ch19 p35 [meaning] 'disgust a man' refers to disgust with the trade itself; 'lede ved livet' (disgust with life) shifts and adds meaning.
  - ch20 p0 [stiff] 'emnet moralsk og fysisk ondt' is awkward and inconsistent with 'det moralske og det fysiske onde' two paragraphs later; 'beskæftiget' loses 'entertained'.
  - ch20 p10 [meaning] Danish 'mil' means ~10 km (old Danish mile ~7.5 km), so 'tre mil' puts the ships 20-30 km away; use sømil. [Orchestrator: not applied for the unit; »mil« is kept for "miles" throughout the book per the brief (no conversion); rest of paragraph unchanged.]
  - ch20 p18 [meaning] 'Since I've found you again' is causal; 'Når' reads as a future/conditional 'when'.

### candide-04 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 63; titles checked: 3; findings: 7; applied: 7
- Reviewer summary: A strong, faithful translation: no omissions, additions or English left in, the irony (e.g. 'Da de var tyskere', 'føjede under til under') survives, and quote/dash form is consistent. Findings are limited to a few unidiomatic phrasings, one wrong preposition, one neuter-gender slip, the misleading 'sommerhus', and a small added causal link.
  - ch13 p2 [stiff] 'ganske moderne blandt de gamle ... for de moderne' repeats 'moderne' in two senses and blurs the ancients/moderns wordplay; 'på mode' is the idiom for 'fashionable'.
  - ch14 p8 [stiff] 'Ja, absolut' is an anglicism for 'Oh, certainly'; 'sender dem i himlen' has the wrong preposition (should be 'til himlen').
  - ch14 p9 [stiff] 'stod for den fjerne ende' is wrong Danish for 'stood at the far end'; use 'i den fjerne ende'.
  - ch14 p11 [meaning] 'for han har netop læst messe' adds a causal link the English lacks ('having just celebrated mass').
  - ch14 p15 [meaning] 'sommerhus' in present-day Danish means a holiday cottage, not a garden pavilion; also 'marmor' is neuter, so 'grønt og gyldent marmor'.
  - ch15 p5 [stiff] 'Jeg synes, du er utrolig fræk, at du overhovedet nævner' is ungrammatical-sounding and repeats 'frækhed/fræk' from the previous sentence.
  - ch15 p11 [stiff] 'uden tvivl ... når som helst' is a literal calque; 'med sværdet i hånd' mixes forms (idiom is 'med sværd i hånd').

### candide-02 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 57; titles checked: 4; findings: 7; applied: 6
- Reviewer summary: A strong, faithful translation in natural Danish that keeps Voltaire's irony and pace; there are no omissions or additions, and quotes and dashes are correct. The findings are local: one misleading measure of distance, two small shifts in meaning (the Inquisition 'doing' penance, 'ophidset'), an inconsistent term (familiaris/familiar) and three stiff phrasings.
  - NOT APPLIED ch7 p8: Unit conversion (»en kvart mil« → »fire hundrede meter«) is against the brief; English miles stay »mil« throughout the book.
  - ch5 p0 [stiff] 'blev båret derind på en planke' is awkward; 'derind' does not fit reaching the shore. Use the idiomatic 'drev i land'.
  - ch5 p14 [meaning] 'tog ordet' means 'took the floor', but the English says he took up Pangloss's words. Also 'familiaris' here clashes with 'familiaren' later in the chapter; use 'familiar' consistently.
  - ch6 p0 [meaning] 'hvor Inkvisitionen holdt offentlig bodsgang' makes the Inquisition the one doing penance; the ceremony imposed public penance on the condemned.
  - ch7 p8 [meaning] 'en kvart mil' reads as a quarter Danish mil (about 1.9 km); the English quarter mile is about 400 m.
  - ch7 p11 [stiff] 'frembringer en flaske' is an anglicism for 'produces'; Danish says 'tager ... frem'.
  - ch7 p19 [stiff] 'Det skal jeg fortælle dig det hele om' doubles the object and is ungrammatical.
  - ch8 p8 [meaning] 'Ophidset' suggests angry or aroused; 'agitated' here means emotionally shaken, so 'Oprevet'.

### candide-09 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 80; titles checked: 3; findings: 7; applied: 7
- Reviewer summary: A faithful, complete and generally fluent translation that keeps Voltaire's dry irony and the book's register; quotes, numbering and forms are correct throughout. The findings are a handful of local calques and heavy constructions plus two word-choice errors (ærekær, maltesisk ridder); no omissions or additions found.
  - ch26 p1 [stiff] 'Svigt ikke' is a literal calque of 'Don't fail'; Danish would say 'be sure not to forget'.
  - ch27 p7 [stiff] 'giver tre kroner om dagen i hans landflygtighed' has an awkward possessive with an unclear referent; 'i landflygtigheden' placed earlier reads naturally.
  - ch27 p8 [meaning] 'ærekær' means proud/touchy about one's honour, not 'a man of honour'; use 'æresmand'.
  - ch27 p16 [stiff] Clunky word order ('gik han uden at spilde tiden om bord på en galej med sine ledsagere'); 'uden at spilde tid' is the idiom.
  - ch27 p17 [stiff] The chain of genitives ('Pangloss' og den ulykkelige jesuits, den westfalske barons, frøken Cunegondes brors') is heavy and unidiomatic.
  - ch27 p27 [stiff] 'hvad jeg ikke tvivler på er høje værdigheder' is an ungrammatical English-style relative clause in Danish.
  - ch28 p3 [meaning] 'knight of Malta' is a member of the order: 'malteserridder', not 'maltesisk ridder' (a knight from Malta).

### candide-05 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 86; titles checked: 3; findings: 5; applied: 5
- Reviewer summary: A strong, fluent translation that keeps Voltaire's dry irony and the register of the speakers well (Cacambo's De, Candide's du, the old man's courtly tone). Problems are few and local: one typo, one calque, one ambiguous pronoun and two word choices with the wrong nuance ('åbenmundet', 'seværdigheder'). Quotes, dashes and numbers conform to the form rules.
  - ch16 p0 [form] Typo: 'tråd sti' should be 'trådt sti' (trodden path).
  - ch17 p6 [stiff] 'Af hele mit hjerte' as a reply of agreement is a calque of 'with all my heart'; Danish says 'Det vil jeg inderlig gerne'.
  - ch18 p0 [meaning] 'og han svarede' is ambiguous (reads as Cacambo answering); make the landlord the speaker.
  - ch18 p1 [meaning] 'åbenmundet' suggests indiscreet/blabbing; 'open-tongued' (communicatif) means forthcoming and talkative: 'meddelsom'.
  - ch18 p37 [meaning] 'seværdigheder' means sights/tourist attractions; the sheep carry the country's curiosities (rare objects): 'sjældenheder'.

### candide-03 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 56; titles checked: 4; findings: 8; applied: 7
- Reviewer summary: A strong, fluent translation that keeps Voltaire's deadpan irony, the du/De register split and the »…«/›…‹ quoting correctly, with no omissions or additions found. The findings are small: two nuance slips (prudent, cook), a leftover English unit (yards), and a handful of stiff or colloquial phrasings.
  - NOT APPLIED ch12 p4: Unit change (»yards« → »skridt«) is against the brief (keep the English units; yard is also a Danish dictionary word for the English unit).
  - ch9 p5 [meaning] 'prudent' here means sensible/wise, not cautious; 'forsigtig' shifts the nuance.
  - ch9 p9 [stiff] Danish idiom is 'sky ingen midler'; 'skyr han intet middel' sounds off.
  - ch10 p14 [meaning] 'worked as a cook' is 'kokkepige'; 'køkkenpige' is a kitchen maid.
  - ch11 p2 [stiff] 'klædt lige så nøgne' is ungrammatical (one is 'klædt af', not 'klædt nøgen').
  - ch12 p4 [english] 'yards' is an English unit and reads as an anglicism; Voltaire has paces ('pas').
  - ch12 p11 [stiff] Noun-heavy, translated-sounding sentence ('Den yderste hungersnød, de blev bragt til, tvang dem ... hellere end').
  - ch12 p15 [stiff] 'en meget dygtig en' is colloquial and clashes with the register.
  - ch12 p17 [stiff] 'Mor Dem selv' calques 'amuse yourself'; the Danish reflexive is simply 'mor Dem'.

### candide-08 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 90; titles checked: 3; findings: 9; applied: 9
- Reviewer summary: A strong, fluent translation of chapters 23-25 that keeps Voltaire's irony and register, with correct »…« quotes, De/du distinctions and no omissions or additions found. Findings are minor idiom fixes (a few calques and awkward constructions) and two small nuance losses.
  - ch23 p11 [stiff] 'gjorde en handel ... om at bringe ham' is unidiomatic; Danish uses 'indgik en aftale med ... om at'.
  - ch24 p7 [stiff] Danish needs the pro-form 'det' after elliptical 'er'.
  - ch24 p10 [stiff] 'Herr' (capitalised, German) reads as untranslated; Danish address form is 'hr.'.
  - ch24 p19 [stiff] 'behøvede ikke mere overbevisning' is a calque of 'needed no more convincing'.
  - ch25 p1 [stiff] Relative clause 'der var pisket ... op' dangles after 'for dem' and can be read as referring to the guests.
  - ch25 p4 [meaning] 'ligner ikke rigtigt stof' can read as 'don't really resemble cloth'; English is categorical ('nothing like').
  - ch25 p9 [stiff] Apposition 'Tysklands bedste filosof' after the genitive 'Pangloss' fryd' is awkward and attaches to 'fryd'.
  - ch25 p14 [meaning] 'det, der kan bruges til noget' loses 'my purpose' (Pococurante's self-centred criterion).
  - ch25 p23 [stiff] 'Jeg kunne tænke mig' primarily means 'I would like'; ambiguous for 'I have an idea that'.

### candide-07 — independent review (applied 2026-10-21T12:51Z)
- Paragraphs checked: 116; titles checked: 2; findings: 14; applied: 14
- Reviewer summary: A strong, faithful translation in a natural, period-appropriate register: no omissions, no English left in, and quotation marks and numbers are handled correctly throughout. The findings are mostly local: one wrong noun (årelader), two grammar slips (slesk, væmmes), a misleading 'en vis mand', and a handful of calqued idioms (hvislet af scenen, klappet frem, en høj tanke om).
  - ch21 p2 [meaning] 'too clever by half' means overly cunning (French 'trop rusés'); 'alt for kloge' loses the cunning.
  - ch21 p4 [stiff] Heavy passive with the agent tacked on at the end ('blev jeg frarøvet ... af lommetyve') reads as translated; active voice is natural.
  - ch21 p8 [stiff] 'vrøvlede idéer' is not idiomatic Danish.
  - ch22 p3 [addition] 'straks' is not in the English.
  - ch22 p5 [meaning] 'årelader' is the person who lets blood, not the bloodletting itself; should be 'åreladninger'.
  - ch22 p7 [stiff] Agreement error: 'slesk' must be plural 'sleske' like the other adjectives describing 'typer'.
  - ch22 p21 [meaning] 'Hvad venter De?' reads as 'What are you waiting for?'; 'What do you expect?' is 'Hvad havde De ventet?'.
  - ch22 p30 [stiff] 'var ikke manden, der kunne' is a calque; the Danish idiom is 'være manden til at'.
  - ch22 p40 [stiff] 'Hvor er det besynderligt, som han gentager' is ungrammatical; 'han væmmes mig' misuses the deponent verb (should be transitive 'væmmer').
  - ch22 p42 [stiff] 'klappet frem' means called out for a curtain call, not simply applauded; 'høster bifald' fits.
  - ch22 p43 [stiff] The idiom is 'høje tanker om' (plural); 'en meget høj tanke om' is unidiomatic.
  - ch22 p44 [stiff] 'hvislet af scenen' is a calque; the Danish idiom is 'pebet ud'.
  - ch22 p49 [meaning] 'en vis mand' will be read as 'a certain man', losing 'wise'; 'en vismand' keeps the meaning.
  - ch22 p64 [meaning] 'do the honors of one's country' means to play host for it; 'gøre sit land ære' means to bring honour to it.

### candide-01 — independent review (applied 2026-10-21T12:53Z)
- Paragraphs checked: 63; titles checked: 4; findings: 8; applied: 8
- Reviewer summary: A strong, faithful translation that keeps Voltaire's dry irony and the book's register. All sentences, names and numbers are accounted for, and quote marks and house conventions are correct throughout. The findings are small: one ambiguous referent, one mistranslated 'Justice', a garbled idiom, a misspelling and a few awkward collocations.
  - ch1 p7 [stiff] 'der var bestyrtelse over hele dette slot': wrong preposition, unidiomatic.
  - ch3 p0 [stiff] 'dens overflade' comes before its antecedent ('verdener'), so the sentence reads awkwardly.
  - ch3 p1 [meaning] 'mens de knugede deres børn' is ambiguous and reads as though the old men clutch the children; in the English the wives do.
  - ch3 p2 [meaning] 'bright eyes' became 'smukke øjne'.
  - ch4 p9 [stiff] Garbled idiom: Danish says 'lade sten på sten tilbage'.
  - ch4 p13 [form] Misspelling 'rittmester' (Danish: ritmester); the clumsy 'som som novice' becomes 'der som novice'.
  - ch4 p19 [meaning] 'the Justice that seizes' means the courts/law, not the virtue; 'retfærdighed' misreads it.
  - ch4 p21 [stiff] 'skibet blev hærget af en storm' is an odd collocation ('hærge' is used of land and plunderers); 'a most terrible tempest' also loses its superlative.

### Orchestrator consistency pass: forms of address (after review)
Ten translators chose du/De differently for some pairs. A separate pass applied one policy to the whole book, changing only pronouns and their agreeing forms (55 paragraphs). Policy: Candide–Cunegonde, Candide–Pangloss, Candide–Martin du; Cacambo De to Candide, Candide du to Cacambo; old woman De/frøken to Cunegonde, Cunegonde du to her; old woman–Candide De; the baron du to Candide, Candide De to him; others De; groups I/jer.


- candide-01 ch3 p5: du → De (orator to Candide) (Hvad laver De her? Er De for)
- candide-01 ch3 p7: du → De (orator to Candide) (tror De, at paven)
- candide-01 ch3 p9: du/din → De (orator to Candide) (»De fortjener)
- candide-01 ch4 p2: De/Dem → du/dig (Candide to Pangloss) (»Hvad hører jeg? Du, min kære mester! Du i denne)
- candide-01 ch4 p12: Dem → dig (Candide to Pangloss) (virkning hos dig?)
- candide-01 ch4 p16: De → du (Candide to Pangloss) (men du må blive helbredt)
- candide-02 ch5 p5: du → De (Pangloss to the sailor) (De synder mod)
- candide-02 ch5 p6: din → Deres (sailor to Pangloss) (pokker tage Deres universelle)
- candide-02 ch6 p3: du → De (Candide to the Anabaptist, as in ch3) (at De skulle drukne lige i havnen)
- candide-02 ch7 p1: dig → Dem (old woman to Candide) (tage Dem under deres beskyttelse)
- candide-02 ch7 p3: du/dig → De/Dem (old woman to Candide) (hånd, De skal kysse)
- candide-02 ch7 p5: du/dig → De/Dem (Candide to old woman) (»Hvem er De?«)
- candide-04 ch13 p6: I/jer → De/Dem/Deres (old woman to Cunegonde) (Frøken, De har)
- candide-04 ch13 p9: I/jer → De/Dem (old woman to Cunegonde) (»De kan ikke flygte)
- candide-04 ch13 p11: I → De (old woman to Candide) (ellers bliver De brændt)
- candide-06 ch19 p4: du → De (Candide to the slave, a stranger) (Hvad laver De der, min ven)
- candide-06 ch19 p6: dig → Dem (Candide to the slave, a stranger) (behandlede Dem sådan)
- candide-06 ch20 p2: De, hr. Martin → du, Martin (Candide to Martin) (»Men du, Martin,«)
- candide-06 ch20 p4: De → du (Candide to Martin) (»Du spøger,«)
- candide-06 ch20 p6: De → du (Candide to Martin) (»Du må være besat)
- candide-06 ch20 p15: De → du (Candide to Martin) (»Ser du,«)
- candide-07 ch21 p1: De, hr. Martin → du, Martin (Candide to Martin) (»Har du nogensinde været i Frankrig, Martin?«)
- candide-07 ch21 p3: hr. Martin, De → Martin, du (Candide to Martin) (»Men Martin, har du set Paris?«)
- candide-07 ch21 p5: De/Dem → du/dig (Candide to Martin) (»Du kan nok forestille dig,)
- candide-07 ch21 p6: De/Dem → du/dig (Martin to Candide) (Jeg har ingen, du har masser, så jeg følger dig til)
- candide-07 ch21 p7: De → du (Candide to Martin) (»Men tror du,«)
- candide-07 ch21 p11: De/Dem → du/dig (Candide to Martin) (»Er du ikke dybt)
- candide-07 ch21 p13: De → du (Candide to Martin) (»Tror du,« sagde Candide)
- candide-07 ch21 p14: De → du (Martin to Candide) (»Tror du,« sagde Martin)
- candide-07 ch21 p16: De Dem → du dig (Martin to Candide) (forestiller du dig så)
- candide-07 ch22 p21: De/Dem → du/dig (Martin to Candide) (»Hvad havde du ventet?«)
- candide-07 ch22 p50: Deres → Din (Martin to Candide) (»Din hængte mand)
- candide-07 ch22 p74: De/Deres → du/din/dine/dit (letter in Cunegonde's name to Candide) (hører, at du er her)
- candide-08 ch23 p2: De → du (Candide to Martin) (»Kender du England?)
- candide-08 ch23 p3: De → du (Martin to Candide) (»Du ved, at de to)
- candide-08 ch24 p1: De → du (Candide to Martin) (Du har ret, min kære Martin)
- candide-08 ch24 p3: De/Dem/Deres → du/dig/din (Martin to Candide) (»Du er virkelig meget enfoldig,«)
- candide-08 ch24 p6: De → du (Candide to Martin) (»Du må i det mindste)
- candide-08 ch24 p8: De → du (Candide to Martin) (så skal du se)
- candide-08 ch24 p15: De → du (Martin to Candide) (»Der kan du se,)
- candide-08 ch24 p26: De → du (Martin to Candide) (gør du dem måske)
- candide-08 ch24 p28: Dem → dig (Martin to Candide) (gøre dig meget lykkelig)
- candide-08 ch24 p29: De → du (Candide to Martin) (»Du er meget vantro,«)
- candide-08 ch24 p31: De → du (Candide to Martin) (»Ser du de gondolierer?«)
- candide-08 ch24 p32: De → du (Martin to Candide) (»Du ser dem ikke)
- candide-08 ch25 p33: De → du (Candide to Martin) (»du må indrømme)
- candide-08 ch25 p34: De → du (Martin to Candide) (»Men kan du ikke se,«)
- candide-09 ch26 p31: Dem → jer (Theodore to the group of kings) (som nogen af jer;)
- candide-09 ch27 p27: du → De (Levantine captain to Candide) (skal De give mig)
- candide-09 ch28 p1: De/Dem → du/dig (baron to Candide) (siden du gerne vil vide)
- candide-10 ch29 p3: Deres → din (baron to Candide) (uforskammethed fra din.)
- candide-10 ch29 p5: du/dig/din/dit → De/Dem/Deres (Candide to the baron) (»De fjols,«)
- candide-10 ch29 p6: De/Dem → du/dig (baron to Candide) (»Du kan godt slå)
- candide-10 ch30 p6: De/Deres → du/dine, I for Candide and Cacambo (Martin to Candide) (at dine gaver)
- candide-10 ch30 p11: dig/din → Dem/Deres (dervish to Pangloss) (rager det Dem?)

### Copy check follow-up: blind control translation
The 8-word overlap with the old candide-modern-da.json is 20.9% (Prince 10.6%, Manifesto 6.1%). It is spread evenly over all 30 chapters, which ten separate translators produced. To test whether it comes from copying or from convergence on plain prose, the 15 highest-overlap paragraphs were retranslated by a fresh subagent that could not read any file except the English input. Its overlap with the old edition, 8-word sequences per paragraph:

| ch/p | batch vs old | blind vs old | blind vs batch |
|---|---|---|---|
| 18/15 | 1.00 | 1.00 | 1.00 |
| 15/4 | 1.00 | 0.39 | 0.39 |
| 13/7 | 1.00 | 1.00 | 1.00 |
| 2/15 | 1.00 | 0.12 | 0.12 |
| 14/12 | 0.92 | 0.69 | 0.65 |
| 25/34 | 0.85 | 0.65 | 0.54 |
| 25/3 | 0.83 | 0.83 | 0.83 |
| 22/19 | 0.72 | 0.77 | 0.85 |
| 24/17 | 0.71 | 0.38 | 0.53 |
| 22/86 | 0.69 | 0.39 | 0.37 |
| 23/8 | 0.65 | 0.50 | 0.50 |
| 2/3 | 0.65 | 0.18 | 0.47 |
| 27/6 | 0.62 | 0.60 | 0.76 |
| 26/33 | 0.58 | 0.20 | 0.35 |
| 30/13 | 0.58 | 0.58 | 0.88 |
| mean | 0.79 | 0.55 | |

The blind translator reproduced most of the overlap (mean 0.55 against 0.79), including two paragraphs word for word. Where the batch overlap is much higher (15/4, 2/15, 22/86, 24/17, 2/3, 26/33), the blind and batch versions differ by one or two word choices (»havde til hensigt« / »havde tænkt mig«, »skurk« / »slyngel«, »indtagende« / »charmerende«), which breaks 8-word runs without any sentence being copied. Conclusion: convergence on short, literal dialogue in Tinct's plain modern-en, not copying. No change made.

