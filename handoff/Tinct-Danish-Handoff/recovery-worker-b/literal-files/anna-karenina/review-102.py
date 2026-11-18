# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('Karenins, mand og kone','Ægteparret Karenin')],2:[('mod sin egen vilje eller sine egne ønsker','ufrivilligt')],3:[('han havde det greb at opføre sig','han forstod at optræde'),('vejleder ved at tilfredsstille begge drifter','vejleder i begge dele'),('omhyggelig pasning af sin tilstand','omhyggelig pleje af sin krop')],4:[('var blevet ven med','havde indledt et forhold til'),('skudt gemser','nedlagt en gemse'),('rød frakke over hække','rød ridefrakke over hegn'),('jaget på ryggen af en elefant','redet på en elefant')],5:[('væddeløbsheste','travheste'),('kom​mer','kom​mer')],6:[('balletdanserinder og hvidsegl-champagne','en balletdanserinde og champagne med hvidt segl'),('var foragtelig','var fuld af foragt'),('jævnhumoreret','ligevægtig'),('fri og imødekommende','fri og ligefrem')],7:[('Hjerneløst kødfjæs','Dumme kødbjerg')]}
DA[5]=DA[5][:1]
EN={2:[('against his own will or wishes','involuntarily')],4:[('made friends with a Spanish girl','became intimate with a Spanish woman'),('killed chamois','killed a chamois'),('over hedges','over fences'),('hunted on the back of an elephant','ridden an elephant')],5:[('race horses','trotting horses')],6:[('ballet dancers','a ballet dancer'),('free and engaging','free and straightforward')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][101]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   for a,b in [('Alexej Alexandrovitj','Aleksej Aleksandrovitj'),('Fyrsten','Prinsen'),('fyrsten','prinsen'),('fyrster','prinser'),('fyrste','prins')]:
    if a in t:changes.setdefault(sn,[]).append((a,b));t=t.replace(a,b)
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=102,paragraph=sn,before=a,after=b,reason='Russian IV.I full comparison: contemporary Danish, names, singular chamois/dancer, elephant ride not hunt, trotting horses, contempt and formality.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
