# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={6:[('sit værelse','sit arbejdsværelse')],8:[('hænges gardiner op','flyttes gardiner')],10:[('du gør altid besvær','hold nu op med at gøre alting besværligt')],14:[('Hvorfor ser I altid ned','Hvorfor ser du sådan ned')],16:[('hos Oblonskijs','hos familien Oblonskij')],18:[('den krøllede Serjozja','sin krølhårede Serjozja'),('reposen af den store, varme hovedtrappe','reposen på den store, opvarmede hovedtrappe')],22:[('passerede toppen af trappen','passerede trappen'),('stod lige over for trappen','var på højde med trappens midte'),('kalde ham op','bede ham komme ind')],23:[('komme op','komme ind')],24:[('komme op','komme ind'),('Han har været hjemme','Han har været hjemme hos os'),('han kom ikke op','han kom ikke ind')],26:[('en planlagt middagsselskab','et planlagt middagsselskab'),('det syntes alle af dem alligevel sælsomt','alligevel forekom det dem alle mærkeligt'),('Frem for alt syntes det Anna sælsomt og forkert','Mest af alle syntes Anna, at der var noget mærkeligt og forkert ved det')]}
EN={6:[('his room','his study')],8:[('hang up blinds','rehang the curtains')],22:[('passing the top of the staircase','passing the staircase'),('directly facing the stairs','level with the middle of the staircase'),('come up','come in')],23:[('come up','come in')],24:[('come up','come in'),('He has been at home','He has been to our house')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][20]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=21,paragraph=sn,before=a,after=b,reason='Russian XXI full comparison: Kitty means her family home, stair position and invitation inside, curtains relocation, singular familiar address and modern Danish.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
