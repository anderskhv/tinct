# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][81]
changes={1:[('forsvarslinje','forsvar'),('på Katerina Ivanovnas insisteren','efter Katerina Ivanovnas ihærdige krav')],
2:[('en grå og skaldet','en gråhåret og skaldet'),('iblandt os','hos os'),('slumkvarterer og hytter','usle kamre og hytter'),('forlangte femogtyve','forlangte mindst femogtyve'),('styrtede til at konsultere ham','skyndte sig at opsøge ham')],
3:[('en overordentlig mine, bemærkelsesværdig under omstændighederne','et usædvanligt og efter omstændighederne påfaldende udtryk')],
4:[('han talte russisk flydende','han talte meget og gerne russisk'),('af distraktion','af distræthed'),('gik ham af hovedet','smuttede fra ham')],
5:[('»aberration«','»affekt«'),('en tilstand af aberration','en sygelig affekttilstand')],
6:[('midlertidig aberration','affekten'),('‘Etik!\'','‘Efik!\''),('ikke begærlig','ikke pengegrisk')],
7:[('spøgefuldheden i denne teori','det spøgefulde ved denne slutning'),('hele hans fremtid afhænger','hele hans skæbne afhænger'),('positivt og eftertrykkeligt','bestemt og eftertrykkeligt')],
8:[('den sidste komiske tone','et særligt komisk præg'),('den mentale aberration','den særlige »affekt«'),('på hvem hans skæbne afhang','som hans skæbne afhang af')],
9:[('Bravo, doktor!','Bravo, læge!')],
10:[('gammel beboer i byen','mangeårig indbygger i byen')],
12:[('Han kendte den gamle mands vane med at tale langsomt og betænksomt, ligegyldigt med det indtryk, han gjorde, og den forsinkelse, han forårsagede, og han satte stor pris på sin flade, kedelige og altid skadefro selvtilfredse tyske vid.','Han kendte længe den gamle mands vane med at tale langsomt og langtrukkent uden at bekymre sig om, hvilket indtryk det gjorde, eller at han lod andre vente. Tværtimod satte lægen selv stor pris på sit træge, kartoffeltunge og altid fornøjet selvtilfredse tyske vid.')],
13:[('hans forstand gik','han sendte sin egen forstand af sted'),('Hvor gik den hen?','Hvor sendte han den hen?'),('Han fortsatte, idet han førte hånden foran øjnene','fortsatte han, mens han drejede hånden foran øjnene')],
14:[('Vandrende?','Ud at gå?')],
15:[('Åh ja, vandrende','Åh ja, ud at gå'),('Nå, hans forstand gik vandrende og faldt i et så dybt hul, at han mistede sig selv','Så gik hans forstand tur og kom så langt ned i dybet, at den blev væk'),('følsom dreng','følsom ung mand')],
16:[('Fetjukovitj begyndte ligefrem og fangede øjeblikkeligt fat, som om han færtede noget.','Fetjukovitj fór ligefrem sammen, som om han anede noget, og greb straks fat i det.')],
17:[('jeg var så ked af det for drengen dengang','jeg havde så ondt af drengen dengang')],
19:[('og knækker dem','og kr-r-ras!')],
21:[('min studereværelse','mit arbejdsværelse'),('en blomstrende ung mand','en ung mand i sin fulde kraft'),('og jeg var meget ked af det igen for hans skyld','og jeg fik igen meget ondt af ham'),('for ingen anden har nogensinde købt mig et pund nødder','for ingen andre købte mig dengang et pund nødder'),('De er en taknemmelig ung mand, for De har husket hele Deres liv det pund nødder, jeg købte Dem i Deres barndom','Du er en taknemmelig ung mand, for du har hele livet husket det pund nødder, jeg gav dig, da du var barn')],
22:[('du hellige mand','du Guds mand')],
23:[('den vigtigste sensation','det største indtryk'),('syntes lykken faktisk på én gang markant gunstigere for Mitja','syntes lykken pludselig for alvor at smile til Mitja'),('positivt bevis mod','et direkte modbevis mod')]
}
for n,items in changes.items():
 for a,b in items:
  t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=82,paragraph=n,before=a,after=b,reason='Russian XII III page83 full comparison: affect not aberration, Efik callback, doctor rather than prosecutor self-conceit, intentional wordfinding joke and contemporary Danish.'))
# First occurrences gloss Trinity while retaining child's later repetitions in German.
for a,b in [('‘Dreng, _Gott der Vater_.\'','‘Dreng, _Gott der Vater_ — Gud Fader.\''),('... ‘_Gott der Sohn_.\'','... ‘_Gott der Sohn_ — Gud Søn.\''),('‘_Gott der heilige Geist_.\' Så','‘_Gott der heilige Geist_ — Gud Helligånd.\' Så')]:
 t=c['paragraphs'][20];assert a in t,a;c['paragraphs'][20]=t.replace(a,b,1);r.append(dict(chapter=82,paragraph=21,before=a,after=b,reason='Russian German Trinity dialogue and source footnote glosses retained within same slot.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
e=json.loads((p/'candidate-brothers-karamazov-modern-en.json').read_text());
for n in [4,5,6,8,12,21]:print(n,e['chapters'][81]['paragraphs'][n-1])
