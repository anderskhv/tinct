# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={8:[('Jeg fantaserer ikke','Jeg taler ikke i vildelse')],10:[('Selvfølgelig gør jeg ikke det','Det gør jeg vel ikke')],12:[('imellem hende og hendes angrende mand','mellem hende med hendes anger og hendes mand')],20:[('hans hænder','hans hånd')],23:[('blive gjort stærkere af','blive endnu stærkere af')],28:[('alene — med dig og din familie','alene — du og jeg som vores egen familie')],35:[('i sit hus i Petersborg','i sin lejlighed')]}
EN={10:[("Of course I won't","I suppose I won't")],12:[('between her and her repentant husband','between her, with her repentance, and her husband')],20:[('his hands','his hand')],23:[('will be made stronger','would be made stronger')],28:[('alone — with you and your family','alone — you and I as our own family')],35:[('in his Petersburg house','in his apartment')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][123]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   for a,b in [('Alexej','Aleksej'),('Alexandrovitj','Aleksandrovitj')]:
    if a in t:changes.setdefault(sn,[]).append((a,b))
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=124,paragraph=sn,before=a,after=b,reason='Russian IV.XXIII full comparison: delirium, tentative reply, repentance belongs to Anna not husband, singular hand, their own family not Vronsky family, apartment; preserve PartFive header.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
