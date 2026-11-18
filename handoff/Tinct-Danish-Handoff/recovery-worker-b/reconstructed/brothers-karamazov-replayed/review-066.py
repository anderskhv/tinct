# -*- coding: utf-8 -*-
import pathlib,json,re
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][65]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=66,paragraph=n,before=a,after=b,reason='Full Russian X IV page67 comparison; modern Danish, source details, character psychology and formal mutual address.'))
a=c['title'];c['title']='IV. Sjutjka';r.append(dict(chapter=66,field='title',before=a,after=c['title'],reason='Restore original chapter title naming dog.'))
changes={1:[('med en mine af værdighed','med en værdig mine'),('foragtelig ligegyldighed','foragtfuld ligegyldighed'),('Hemmeligt længtes han dog efter at gøre hans bekendtskab','I al hemmelighed længtes han dog efter at lære ham at kende'),('slog ham som sympatisk og tiltrækkende','havde virket sympatisk og tiltrækkende på ham'),('tænke på mig som tretten','tænke, at jeg er tretten')],
2:[('holdt Kolja på spring','gjorde Kolja urolig'),('dette reducerede ham sommetider næsten til fortvivlelse','det drev ham somme tider ligefrem til fortvivlelse'),('høje kindben','brede kindben'),('vendte han sig forargeligt væk','gik han vredt væk'),('Men det skal ikke antages, at hans sind var optaget af hans ansigt og højde','Men man skal ikke tro, at bekymringen om hans ansigt og højde optog hele hans sind')],
3:[('en velskåret frakke','en velsyet diplomatfrakke'),('uden frakke','uden overfrakke'),('åbenlyst','tydeligvis')],
5:[('Der var grunde, du vil få at vide om et øjeblik','Der var grunde til det, som du får at vide om et øjeblik')],
6:[('var alligevel nødt til at mødes','ville under alle omstændigheder have lært hinanden at kende')],
9:[('medicin er en svindel','lægekunsten er noget svineri'),('varmt','ivrigt')],
13:[('børn som det','den slags børn'),('bukser var for små for ham','bukser stumpe­de på ham'),('stod straks op for ham','tog straks hans parti'),('to små kyllinger i hænderne hjemme','to små unger at passe derhjemme'),('holdt mig op','forsinkede mig'),('han ville gøre den mindste ting, jeg bad om','han fulgte min mindste befaling'),('ville han straks løbe hen til mig, og jeg ville tilbringe tid med ham','løb han straks hen til mig, og så gik vi rundt sammen'),('Hvis det er min lyst, er det nok','Sådan vil jeg have det, og dermed basta'),('rede-unger','fugleunger'),('en vis blødhed og sentimentalitet komme over drengen','en vis følsomhed og sentimentalitet udvikle sig hos drengen'),('jeg har et positivt had til denne fåreagtige sentimentalitet','jeg er en afgjort fjende af alt sentimentalt pjat'),('ville hans øjne pludselig flamme, og han ville nægte at være enig med mig; han ville skændes, fare op i raseri','flammede hans øjne pludselig, og han nægtede at give mig ret; han diskuterede og for op i raseri'),('fremlagde sommetider visse ideer bare for at se','fremlagde sommetider visse ideer'),('for at træne ham ordentligt, jo blødere han blev, jo koldere blev jeg','for at sætte ham på prøve blev jeg koldere, jo mere hengiven han viste sig'),('banke ham i form','rette ham til'),('forstår du mig på et ord','forstår du mig på et halvt ord'),('Jeg gravede det frem fra ham','Jeg trængte ind på ham'),('knappenål','knappenål'),('gadehunde','gårdhunde'),('›Hun løb hylende væk, hun løb hylende væk‹','›Hun løber og hyler, hun løber og hyler‹'),('jeg foregav at være mere forarget, end jeg virkelig var','jeg lod, som om jeg var fuld af en forargelse, som jeg måske slet ikke følte'),('En dag eller to senere','Dagen efter'),('sende ham i karantæne','fryse ham ude'),('›Så han er gået i et lille hidsigt anfald,‹','›Nå, han har fået en frihedstrang,‹'),('Husker du? Du må indse','Husker du det med Skurekluden? Du må indse'),('›Blårtot, blårtot!‹','›Skureklud, skureklud!‹'),('Jeg stod et par meter væk','Jeg stod ti skridt derfra'),('ville jeg vende mig væk','vendte jeg mig væk'),('om et øjeblik var jeg løbet hen','et øjeblik til, så var jeg løbet hen'),('brød i tårer','brast i gråd'),('lappe det sammen med ham','slutte fred med ham')],
14:[('med følelse','bevæget'),('hvilket forhold I to var på','hvordan dit forhold til ham havde været'),('gå til ham med mig','besøge ham sammen med mig'),('Vil du tro, da han havde feber, talte han om dig i sit delirium','Tænk, han talte om dig i febervildelse'),('Vil du tro, siden han er blevet syg, har jeg tre gange hørt ham gentage med tårer','Tænk, mens han har været syg, har jeg tre gange hørt ham grædende sige'),('hunden kunne blive fundet og vist at være i live','man bare kunne finde hunden og vise ham, at den ikke var død, men levede')],
16:[('overtale Iljusja om','overbevise Iljusja om'),('mastiff-hvalp','mastiffhvalp')],
17:[('bajads','bajas')],
18:[('Der er mennesker af dyb følelse','Der er dybt følende mennesker'),('Hos dem bliver bajaseri til en slags harmfuld ironi mod mennesker, de ikke tør fortælle sandheden, fra år med ydmygelse og at være blevet intimideret af dem','Deres klovnerier er en slags bitter ironi rettet mod dem, som de efter mange års ydmygende frygtsomhed ikke tør sige sandheden op i ansigtet'),('den slags bajaseri','den slags klovneri'),('Hele hans liv er nu indviklet i Iljusja','Alt i hans liv, alt på jorden, er nu samlet i Iljusja'),('dræbe sig selv','tage sit eget liv')],
19:[('med følelse','indtrængende')],
20:[('bragte Sjutjka','havde Sjutjka med')],
21:[('mastiff-hvalpen','mastiffhvalpen'),('Men — det siger jeg — jeg holder dig stående herude!','Men gud dog — hvorfor holder jeg dig stående herude!'),('Du har ikke engang en frakke på','Du står kun i diplomatfrakke')],
22:[('Bekymrer dig ikke om det','Bare rolig')],
23:[('Nikolaj Ivanovitj Krassotkin, eller som de siger i officielle dokumenter, ›Krassotkin, søn af.‹','Nikolaj Ivanov Krasotkin, eller som der står på embedsmandssprog: ›Nikolaj, Ivans søn, Krasotkin.‹')],
25:[('så almindeligt','så embedsmandsagtigt')],
26:[('Du er tretten?','Du er altså i dit trettende år?')],
27:[('Nej, fjorten — eller rettere, jeg fylder fjorten meget snart, om fjorten dage','Nej, i mit fjortende. Jeg fylder fjorten om to uger, meget snart'),('én svaghed af min over for dig alene','en af mine svagheder over for dig alene'),('der går om mig','der går om mig'),('en komplet bagvaskelse','ren bagvaskelse'),('der går altid en eller anden fjollet historie omkring','her sætter de altid et eller andet vrøvl i omløb')],
30:[('eventyrene fra alle slags helte','alle mulige heltes eventyr'),('i sit første stadium','i sin spæde begyndelse'),('de udspringer af de unges voksende kunstneriske instinkter','de er udtryk for et spirende behov for kunst i det unge sind'),('mens i disse lege er unge mennesker selv skuespillerne','mens de unge i legene selv er skuespillerne')],
31:[('afsluttede Kolja, hans stemme fuld af spontan følelse','sluttede Kolja med en indtrængende og åbenhjertig stemme')],
33:[('grundigt tilfreds','overordentlig tilfreds')],
36:[('bliver her i gangen og er død','bliver her i gangen og spiller død'),('læg dig og vær død','læg dig og spil død'),('Du ser, hvordan han er død','Se, nu er han død'),('så fløjter jeg på ham, når jeg synes, det er det rette øjeblik','så fløjter jeg på ham, når tiden er inde: »Ici, Perezvon!«')]}
for n,pairs in changes.items():
 for a,b in pairs:
  if a!=b:fix(n,a,b)
# Keep the Russian formal mutual address: Alyosha treats the young boy as an equal.
for n in list(range(4,33))+[34,35,36]:
 t=c['paragraphs'][n-1];parts=re.split(r'(›.*?‹)',t)
 for i,s in enumerate(parts):
  if s.startswith('›'):continue
  for a,b in [('du','De'),('Du','De'),('dig','Dem'),('din','Deres'),('dit','Deres'),('dine','Deres')]:s=re.sub(r'\b'+a+r'\b',b,s)
  parts[i]=s
 b=''.join(parts)
 if b!=t:fix(n,t,b)
for n,t in enumerate(c['paragraphs'],1):
 if 'Krassotkin' in t:fix(n,'Krassotkin','Krasotkin')
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
