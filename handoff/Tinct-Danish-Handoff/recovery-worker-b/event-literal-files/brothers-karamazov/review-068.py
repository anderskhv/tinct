# -*- coding: utf-8 -*-
import pathlib,json,re
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][67]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=68,paragraph=n,before=a,after=b,reason='Full Russian X VI page69 comparison; fluent Danish, formal mutual address, psychological distinctions and exact literary/foreign quotations.'))
changes={1:[('Hvad tror du lægen','Hvad tror du, lægen')],
3:[('under sådan triste omstændigheder','under så triste omstændigheder')],
4:[('varmere og mere demonstrativt','varmere og mere åbenhjertigt')],
5:[('Jeg har længe lært at respektere dig som et sjældent menneske','Jeg har for længst lært at værdsætte det sjældne menneske, du er'),('karakterer som din','naturer som din')],
10:[('med en afsluttende mine','kort')],
11:[('blev særligt slået af Aljosjas tilsyneladende tøven om sin mening om Voltaire','blev især forbløffet over, at Aljosja virkede så usikker på sin egen mening om Voltaire'),('Han syntes at lade spørgsmålet stå åbent, for ham — lille Kolja — at afgøre','Det var, som om han overlod afgørelsen til ham — lille Kolja')],
13:[('en absurd, groteske gammel oversættelse','en gammel, klodset, latterlig oversættelse')],
15:[('sno sig ind i sig selv','rode sig helt ind i det')],
18:[('rødmede han vredt','udbrød han og blev ildrød')],
19:[('alderens indflydelse på ens overbevisninger','hvad alder betyder for ens overbevisninger')],
22:[('revolutionernes rækker','revolutionærenes rækker')],
24:[('sandheden kommer for en dag','sandheden kan man ikke skjule'),('Mr. Rakitin','hr. Rakitin')],
26:[('lige meget','men hvad pokker')],
28:[('jeg har ikke læst alt af ham','jeg har ikke rigtig læst ham')],
30:[('Mr. Rakitin','hr. Rakitin'),('kvinder er en undertvunget race og må adlyde','kvinden er et underordnet væsen og skal adlyde'),('_Les femmes tricottent_, som Napoleon sagde','_Les femmes tricottent_ — »kvindens opgave er at strikke«, som Napoleon sagde'),('den pseudo-store mand','denne falske store mand'),('en enorm mængde frugtbart arbejde, der står åbent for os','masser af frugtbart arbejde at tage fat på')],
32:[('de har presset på, at jeg skulle','nogen har prøvet at lokke mig til det'),('det hemmelige politi','Tredje Afdeling, det hemmelige politi')],
33:[('Længe vil du huske huset ved Kædebroen.','Du skal nok huske huset\nved Kædebroen!')],
38:[('som ved en eksercits','som om han indtog en kampstilling')],
39:[('en så charmerende natur','en så dejlig natur')],
40:[('dumt nærtagende, groft nærtagende','dumt mistænksom, groft mistænksom')],
41:[('en kritik, som en tysker, der havde boet i Rusland, fremsatte om vore studerende og skoledrenge i dag','en udtalelse fra en tysker, der havde boet i Rusland, om vor tids skoleungdom og studerende')],
42:[('Indbildskhed, ja — det kommer af ungdom, og det vil blive rettet, hvis det er nødvendigt','Indbildskhed, lad gå — det kommer af ungdommen, og det retter sig, hvis det da behøver at rette sig'),('Stadigvæk havde tyskeren ret alligevel','Men tyskeren havde nu alligevel ret')],
44:[('der inde','derinde'),('krøblige','krøblede'),('sød og rørende','god og ynkværdig')],
45:[('Nå, du kommer ofte; du vil se, hvordan hun er','Når du kommer her, vil du se, hvad hun er for et menneske'),('varmt','ivrigt'),('Det ville have mere virkning på dig end noget andet','Det vil forandre dig mere end noget andet')],
46:[('hvor fortryder jeg og bebrejder mig selv for ikke at være kommet før','hvor jeg fortryder, at jeg ikke kom før, og bebrejder mig selv det')],
47:[('det er meget skade','det er meget sørgeligt')],
48:[('den modbydelige stædighed','den modbydelige trang til at bestemme'),('et bæst','en slyngel')],
49:[('en charmerende natur','en dejlig natur'),('sygeligt nærtagende','sygeligt følsomme'),('varmt','ivrigt')],
51:[('følsom','mistænksom'),('lige nu, mens du fortalte din historie, tænkte jeg, idet jeg så på dig','derinde i værelset tænkte jeg netop, mens jeg så på dig og hørte dig fortælle')],
52:[('Sikke et øje du har!','Hvor er du dog skarpsynet!'),('fik den sætning ud af en bog','læste den sætning i en bog'),('begynde at flyde over i samme øjeblik, han er glad','kaste sig om halsen på alle af glæde'),('det var alt sammen i min indbildning','det var noget, jeg selv bildte mig ind')],
53:[('bekymrer','plager')],
54:[('bekymrer','plager')],
55:[('Er ikke alle hele tiden enten latterlige eller synes at være det?','Hvor ofte er man ikke latterlig, eller ser i det mindste sådan ud?'),('det er ganske enkelt djævelen','netop djævelen')],
57:[('her er du ikke skamfuld over at tilstå','du skammede dig jo ikke nu over at indrømme')],
60:[('en undselig, smeltende stemme','en blød og genert stemme')],
62:[('en smule skamfuld','lidt forlegen'),('en slags listig lykke','et snedigt og næsten lykkeligt udtryk')],
63:[('skamfuld','forlegen')],
66:[('lidt skamfuld','lidt forlegen')],
67:[('»Ved du, Kolja, du bliver meget ulykkelig i livet,« noget fik Aljosja til at sige pludselig','»Ved du, Kolja, du bliver for resten også et meget ulykkeligt menneske i livet,« sagde Aljosja pludselig af en eller anden grund')],
69:[('i det hele taget','som helhed')],
70:[('fuldstændig som ligemand','som en fuldstændig ligemand')],
72:[('Ah, her er lægen. Du godeste!','Ah, her er lægen. Herregud!')]}
for n,pairs in changes.items():
 for a,b in pairs:fix(n,a,b)
# Formal address applies to the two speakers; quotations and verse are excluded.
for n,t in enumerate(c['paragraphs'],1):
 if n in [4,9,11,13,17,33,41]:continue
 parts=re.split(r'(›.*?‹)',t)
 for i,s in enumerate(parts):
  if s.startswith('›'):continue
  for a,b in [('du','De'),('Du','De'),('dig','Dem'),('din','Deres'),('dit','Deres'),('dine','Deres')]:s=re.sub(r'\b'+a+r'\b',b,s)
  parts[i]=s
 b=''.join(parts)
 if t!=b:fix(n,t,b)
fix(44,'Hvorfor er du ikke kommet før?','Hvorfor er De ikke kommet før?')
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':68,'danish_paragraphs_reviewed':'1–72','english_followup':'pending','remaining_paragraphs':'none'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
