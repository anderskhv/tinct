# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={2:[('Jeg er Dem meget taknemmelig for Deres tillid til mig','Jeg er dig meget taknemmelig for din tillid til mig'),('det fortrolige, kærlige »du«','det fortrolige »du«')],3:[('De gned mod hinanden','De gned langsomt mod hinanden')],6:[('dit eget','Deres eget')],7:[('vanskelige private anliggender','vanskelige familieanliggender')],9:[('fingererede nervøst ved kvasten','fingrede nervøst ved kvasterne')],13:[('Nå« (','Alligevel« ('),('det »nå«','det »alligevel«'),('de er ved at slå hende ihjel','de vil lade hende dø')],15:[('du bebrejder mig','De bebrejder mig'),('jeg er på kanten','jeg er irritabel'),('men gå venligst','men gå nu')],17:[('lade de forbindelser fortsætte','tillade, at de genoptog forbindelsen'),('alt, hvad han satte pris på','alt, hvad han elskede') ]}
EN={2:[('intimate, affectionate','intimate')],3:[('They were rubbing each other','They were slowly rubbing each other')],7:[('difficult private matters','difficult family matters')],9:[('the tassel of her dressing-gown','the tassels of her dressing-gown')],13:[("they're killing her","they'll let her die")],15:[('but please, go away','but go away')],17:[('everything he cared about','everything he loved')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][120]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   for a,b in [('Alexej','Aleksej'),('Alexandrovitj','Aleksandrovitj')]:
    if a in t:changes.setdefault(sn,[]).append((a,b))
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=121,paragraph=sn,before=a,after=b,reason='Russian IV.XX full comparison: ty/vy switches restored, intimate not necessarily affectionate, slowly rubbing hands, plural tassels, future umoryat, all the things he loved; Danish grammar.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
