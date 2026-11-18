# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][70]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=71,paragraph=n,before=a,after=b,reason='Full Russian XI II page72 comparison: natural Danish while preserving rambling character voice, exact gossip, verse, affect term and source French glosses.'))
a=c['title'];c['title']='II. Den syge fod';r.append(dict(chapter=71,field='title',before=a,after=c['title'],reason='Source says sick foot; injury not established.'))
changes={1:[('en fascinerende, men passende _déshabillé_','et indtagende, men anstændigt hjemmedress'),('pandehår, bånd, løse slåbroker','små hårpynt, sløjfer og løse morgenjakker'),('afviste sådanne tanker som overfladiske','jog den slags ørkesløse tanker på flugt')],
2:[('melde hans navn til Lise','melde ham hos Lise'),('smart klædt','festligt klædt'),('i en tilstand af ekstrem nervøs ophidselse','overordentlig nervøst ophidset')],
3:[('den vigtigste ting','det allervigtigste'),('Zossima','Zosima'),('smilede hun kokette','tilføjede hun med et koket smil'),('Min De selv minde mig om det','Vær sød selv at minde mig om det'),('spændt fast til sin stol','bundet til sin stol'),('Jeg har sådan en travl','Jeg har sådan travlt'),('miste mit greb om alting','miste overblikket over alting'),('De er så kede','De keder Dem så meget'),('det vil være alt, jeg ser af Dem','så ser jeg ikke mere til Dem')],
7:[('bragt ruin over alle','bragt ulykke over alle'),('ret sent i forløbet','lovlig sent'),('Tys, tys','Ti stille, ti stille'),('tage med, jeg arrangerer det','tage derhen, jeg forbereder mig')],
9:[('De forstyrrer mig','De bringer mig ud af det'),('denne barbariske affære','denne vilde gerning'),('_cette charmante personne_','_cette charmante personne_ — denne charmerende person —'),('offentligheden','al den omtale')],
11:[('nu betaler det mig tilbage','nu rammer det mig selv')],
13:[('Afsnittet var meget typisk','Avisnotitsen var meget karakteristisk')],
14:[('blandt andre lige så troværdige sager','ind imellem de sande nyheder'),('Zossima','Zosima'),('sat af fra klosteret','stukket af fra klosteret'),('prallende reaktionær','fræk tilhænger af livegenskabet'),('midaldrende ynder','fyrreårige ynder')],
15:[('skyndte hun sig igen','plaprede hun videre'),('midaldrende ynder','fyrreårige ynder')],
20:[('men så skælder han alle ud','men han skælder jo alle ud'),('opgivet ham','afvist ham')],
21:[('malplaceret','ved siden af'),('Zossima','Zosima'),('overfladiske unge mand','letsindige unge mand'),('arbejder her i tjenesten','er embedsmand her'),('hvordan de gik sammen','når de mødtes'),('pludselig kommer Rakitin ind','pludselig kommer Mikhail Ivanovitj ind'),('af egen komposition','som han selv havde skrevet')],
22:[('En fortryllende lille fod.','Den lille fod, den lille fod,\nhar det ikke rigtig godt …')],
23:[('en poesibog','et poesialbum'),('sort som natten ud','mørk som natten ud'),('gik i gang med at kritisere det','gik i gang med at kritisere dem'),('en simpel pennefægter','en embedsmand'),('den mest galante tone','den mest noble tone'),('en scene eller ej','et skrig eller ej'),('›Tal,‹','›Skrig,‹'),('›Nej, tal ikke.‹','›Nej, skrig ikke.‹')],
25:[('Hør — hvad er en aberration?','Hør — hvad vil det sige at være i affekt?')],
26:[('Hvilken aberration?','Hvad for en affekt?')],
27:[('En aberration, hvor alt er undskyldeligt','En affekttilstand, hvor man får alt tilgivet')],
29:[('jeg talte om aberration','jeg talte om affekt'),('få en aberration','komme i affekt'),('i en tilstand af aberration','i affekt'),('led af aberration','var i affekt'),('aberrationen','affekten')],
30:[('Han blev mere og mere syg af angst og utålmodighed','Uroen og utålmodigheden fik stadig mere magt over ham')],
35:[('Han led af aberration','Han kom i affekt'),('led han af aberration','kom han i affekt'),('mens han var bevidstløs, eller rettere, mens han var ved bevidsthed, men ikke vidste, hvad han gjorde','uden at være sig selv, eller rettere, med fuld bevidsthed, men uden at vide, hvordan det var gået til'),('blev jeg så slået','blev jeg så forbløffet'),('blive gjort til fredsdommer','blive fredsdommer'),('hvem lider ikke af aberration nu om dage','hvem er ikke i affekt nu om dage'),('i en tilstand af aberration','i affekt'),('det hele skyldes aberration','det hele skyldes affekt'),('Lise sørger mig så meget','Lise gør mig så ulykkelig')],
39:[('vidende hvor meget han har at gøre, som det er','når jeg ved, hvor meget han allerede har at tage sig af'),('_vous comprenez, cette affaire et la mort terrible de votre papa_','_vous comprenez, cette affaire et la mort terrible de votre papa_ — De forstår, denne sag og Deres fars frygtelige død —'),('en aften, for fire dage siden','en nat, for fire dage siden'),('den aberration','den affekt'),('jeg er altid høflig over for mine tjenestefolk','jeg siger De til mine tjenestepiger'),('finde alt ud af hende','få det hele at vide af hende'),('befri os fra vores spænding','afgør vores skæbne')],
42:[('slog en hastig retræte','skyndte sig væk')]}
for n,pairs in changes.items():
 for a,b in pairs:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':71,'danish_paragraphs_reviewed':'1–43','english_followup':'pending','remaining_paragraphs':'none'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
