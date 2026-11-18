# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent
changes={
1:[('som i dens tvang finder et bånd på deres egen ivrige retorik','som søger faste rammer for at holde deres egen utålmodige begejstring i tømme'),('»første elsker«','»tidligere«, »uomtvistelige« elsker')],
2:[('resignerede han','bøjede han sig for det')],
3:[('kan ikke lade være at','kan ikke lade være med at'),('et uimodståeligt ønske om retfærdighed','et ubønhørligt behov for sandhed'),('i selv samme øjeblik','i selvsamme øjeblik')],
4:[('fløj han øjeblikkeligt til én vanvittig plan','greb han straks til én vanvittig plan'),('hos sin ven Perhotin','hos embedsmanden Perhotin'),('Ganske vist var han en digter','Det var jo ikke for ingenting, han var digter'),('slå min hjerne ud','skyde mit hoved i stykker')],
5:[('en kærlighed til effekt','hang til store scener'),('de har deres Hamlet\'er','derovre har de deres Hamlet-skikkelser')],
7:[('afslutte sin roman','afslutte sit digt'),('fra den indledende undersøgelse','fra bevisførelsen her i retten')],
8:[('fører deres egen hævn mere fuldkomment frem end nogen jordisk retfærdighed','selv hævner sig mere fuldstændigt end nogen jordisk retsorden'),('lindrer positivt naturens straf','ligefrem lindrer naturens straf')],
9:[('I parentes vil jeg i øvrigt bemærke et punkt af betydning for det lys, det kaster over fangens situation i det øjeblik.','Jeg vil i forbifarten fremhæve noget, der er vigtigt for at forstå den tiltaltes situation netop da.'),('Gennem hele deres svireri','Under hele den berusede fest')],
10:[('slavebundet af disse påvirkninger','slavebundet af tre kræfter, der fuldstændig havde overmandet ham'),('påvirkningen af drik','beruselsen'),('dansens dunk','dansens trampen'),('larm og ophidselse','festtummel og larm'),('på sin skammelige vogn','på sin skændselsvogn')],
12:[('forsvinden af lige knap halvdelen','at en hel halvdel var forsvundet'),('for at have dem','for at have dem'),('i tilfælde af nødstilfælde','for alle tilfældes skyld'),('To yderpunkter','To afgrunde'),('kan rumme to yderpunkter','kan se to afgrunde')],
13:[('sin skæbnes afgørere','dem, der skulle afgøre hans skæbne')],
14:[('Denne åndens skærsild','Denne sjælens kvalfulde vandring'),('selv hos advokaten','selv hos forhørsdommeren')],
15:[('et bart benægtelse','en ren benægtelse'),('sådan en forhastet hast','sådan en utålmodig hast')],
16:[('sagernes stilling','sagens omstændigheder')],
17:[('ransage ham','visitere ham'),('Ransagningen','Visitationen'),('bestræbte sig smerteligt på','pinte sig selv med at forsøge'),('de undersøgende jurister','forhørsmyndighederne')],
18:[('bag skærmen','bag skillevæggen'),('åndfulde','skarpsindige'),('for at forbedre tingene','for at rette op på situationen')],
19:[('historier, som','historier, som'),('en gammel bomuldsklud af hende','en gammel stivet bomuldsklud, hun havde'),('bag skærmen (der er en skærm','bag skillevæggen (der er en skillevæg')],
20:[('alle de er trivialiteter.','»Alt det er bagateller,« siger han.'),('substantiel, virkelig','håndgribelig, virkelig'),('fangens udtryk','den tiltaltes ansigtsudtryk')],
21:[('sin afsluttende peroration','sin afslutning'),('blodet af faren myrdet af sin søn','blodet fra den far, hans egen søn havde myrdet')],
22:[('kaldt halt over','råbt om at standse'),('den hastende åbenbaring','den fremstormende skikkelse'),('Hob ikke deres voksende had op','Giv ikke deres voksende had mere næring')],
23:[('bære alt for sig','besejre dem alle')],
24:[('trak kun foragteligt','trak kun foragtfuldt')],
25:[('et kort interval','en kort pause')],
39:[('Han havde ingen forretning med at stikke til Petersborg-manden på den måde','Han skulle ikke have stukket til manden fra Petersborg på den måde')],
44:[('»Ja, hvad må det ikke være for Mitja?«','»Ja, hvordan må lille Mitja ikke have det?«\n»Men hvad mon forsvareren vil sige?«')],
47:[('general-kone','generalsfrue')],
50:[('piquant','pikant')],
55:[('en mand med en sorg','en forurettet mand')],
57:[('De har Hamlet\'er','Derovre har de Hamlet-skikkelser')],
68:[('Ikke et let job.','Der er langt for vadefuglene.')],
69:[('Ikke et let job? Hvorfor ikke?','Hvilke vadefugle? Hvorfor er der langt?')]
}
changes[12]=[x for x in changes[12] if x[0]!=x[1]];changes[19]=[x for x in changes[19] if x[0]!=x[1]]
f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());rf=p/'DANISH-REPAIRS.json';r=json.loads(rf.read_text());c=d['chapters'][87]
for n,pairs in changes.items():
 for a,b in pairs:
  t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=88,paragraph=n,before=a,after=b,reason='Full Russian XII IX page89 comparison: prosecutor voice, omitted crowd question, poem/abysses callbacks, contemporary Danish. Bird exchange translated literally and flagged for native/editorial review.'))
a=c['title'];c['title']='IX. Psykologi for fuld damp. Den galopperende trojka. Afslutningen på anklagerens tale';r.append(dict(chapter=88,field='title',before=a,after=c['title'],reason='Restore omitted first component of Russian chapter title.'))
# Jury is plural I/jer; retain formal singular only inside quoted examination.
import re
for n in [7,12,14,19,20,22]:
 t=c['paragraphs'][n-1];a=t
 if n==19:
  # narrative addresses only, not prisoner questions.
  for x,y in [('kan De tro det','kan I tro det'),('forestil Dem','forestil jer')]:t=t.replace(x,y)
 else:
  t=re.sub(r'\bDem\b','jer',t);t=re.sub(r'\bDeres\b','jeres',t);t=re.sub(r'\bDe\b','I',t)
 if t!=a:c['paragraphs'][n-1]=t;r.append(dict(chapter=88,paragraph=n,before=a,after=t,reason='Plural jury address I/jer; singular court examination preserved.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
