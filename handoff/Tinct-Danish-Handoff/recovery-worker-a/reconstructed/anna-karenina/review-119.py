# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('Karenins veranda','trappen foran Karenins hus'),('med så stolt og lethed','så stolt og let'),('var nået at kende','havde lært at kende'),('og efterladt hende','og havde efterladt hende'),('den andens sandhed og sin egen løgn','at den anden havde ret, og at han selv havde uret')],2:[('En slæde','En droske')],3:[('en slæde','en droske')],4:[('lagde Vronskij sig på sofaen','lagde Vronskij sig med ansigtet nedad på sofaen')],6:[('Annas ansigt med dens','Annas ansigt med dets')],7:[('Sov! Glem!','Sov! Sov!')],8:[('hun vil viske','hun ønsker at viske'),('Hvordan kan vi forenes?','Hvordan kan vi forsones?')],10:[('Han fingererede ved puden','Han rørte ved pudens kvast'),('Hans tanke for hurtigt','Hans tanke fór hurtigt')],12:[('så sig omkring','så på den')],13:[('ti gange','snesevis af gange')],14:[('den samme fortryllede kreds','den samme onde cirkel'),('greb fast om den med hele hånden, som om han klemte den i sin knytnæve','rykkede voldsomt med hele armen, som om han pludselig knyttede hånden'),('trykkede aftrækkeren over','trykkede på aftrækkeren')],15:[('Idiotisk! Forbi!','Dumt! Jeg ramte ikke!')],16:[('Den elegante, knebelsbartede tjener','Den elegante tjener med bakkenbarter'),('plejede at klage uendeligt','flere gange havde klaget') ]}
EN={1:[('kind and straightforward and large','kind and straightforward and majestic'),("the other man's truth and his own falsehood","that the other man was right and he himself was wrong")],2:[('A sledge','A cab')],3:[('a sledge','a cab')],4:[('lay down on the sofa','lay face down on the sofa')],7:[('Sleep! Forget!','Sleep! Sleep!')],12:[('looked around him','looked it over')],13:[('ten times','dozens of times')],14:[('the same spellbound circle','the same vicious circle'),('gripping it firmly with his whole hand, as if squeezing it in his fist','jerking his whole arm sharply, as if suddenly clenching his fist')],16:[('The elegant, whiskered manservant, who used to complain endlessly','The elegant manservant with side-whiskers, who had repeatedly complained')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][118]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   for a,b in [('Alexej','Aleksej'),('Alexandrovitj','Aleksandrovitj')]:
    if a in t:changes.setdefault(sn,[]).append((a,b))
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=119,paragraph=sn,before=a,after=b,reason='Russian IV.XVIII full comparison: steps, cab, face-down posture, Sleep repetition, reconciliation, tassel, inspected weapon not surroundings, dozens, movement, missed not finished, side-whiskers and Danish syntax.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
