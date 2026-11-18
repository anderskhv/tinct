import json,pathlib
p=pathlib.Path(__file__).parent
DA={13:[('et urolig blik','et uroligt blik')],18:[('finder De det også spændende','finder du det også spændende')],21:[('indvilgede Vronskij ligegyldigt','svarede Vronskij distræt')],26:[('mere end fyrre kilometer','fyrre verst')],28:[('mandelolieagtige smil','sukkersøde smil')],36:[('idet han og hans bror stillede sig op','idet Levin og hans bror stillede sig op')],41:[('pressede noget på ham','tilbød ham noget at spise'),('galerierne','gallerierne'),('med brille','med briller')],42:[('Så klar og præcis, det hele!','Så klart! Og man kan høre hvert ord!')],45:[('stabskaptajn Jevgenij Ivanovitj Apukhtin','stabsritmester Jevgenij Ivanovitj Opukhtin'),('Afslået!','Han har afslået!')],46:[('den hemmelige rådgiver','hofråd')],47:[('Afslået!','Han har afslået!')],48:[('»Afslået«','»Han har afslået«'),('galerierne','gallerierne')],50:[('sit nummer','sit garderobenummer til pelsen')],51:[('Dmitrievitj','Dmitritj')]}
EN={21:[('agreed indifferently','said absently')],26:[('over thirty miles','forty versts')],36:[('as he and his brother fell in','as Levin and his brother fell in')],41:[('pressed something on him','offered him something to eat')],42:[('So clear and precise, all of it!','So clear! And you can hear every word!')],45:[('Apuhtin','Opukhtin')],46:[('privy councilor','court councilor')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][186]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   if 'Sviazjskij' in t:changes.setdefault(sn,[]).insert(0,('Sviazjskij','Svijazjskij'))
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=187,paragraph=sn,before=a,after=b,reason='Russian VI.XXX: forty versts, Levin with his brother not Stiva brother, audibility not precision, court councillor not privy rank, candidate name and fluency.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-187.txt').write_text('Full Russian VI.XXX DA EN read.187.36 he+brother=Levin/Sergey not Stiva unnamedbrother.187.42 audible not precise.187.46 надворныйсоветник court councillor/hofråd not higher privy councillor; title glossary historical review.187.45 source Опухтин vs inherited Apukhtin restored Opukhtin.187.26 contradictory no case/everycase author text retained, not silently rationalized.187.39 кандидатпредводителя role needs guide explanation re competing deputy/alternate ballot and higher total; candidate text remains broad pending historical verification. Native pending.\n')
