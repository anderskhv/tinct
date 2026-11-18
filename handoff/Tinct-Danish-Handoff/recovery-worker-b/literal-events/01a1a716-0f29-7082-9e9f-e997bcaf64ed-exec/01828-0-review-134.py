# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('holde værtinden hen','klare værtinden')],3:[('Så lad det bare ikke trække ud så længe','Så lad være med at lade gælden vokse')],4:[('lukkede døren','låste døren')],5:[('Åh — fanden tage dem alle sammen!','Åh, kunne jeg dog bare synke i jorden et sted!'),('talgpletter','stearinpletter')],6:[('Talgpletten','Stearinpletten')],7:[('Han havde lige skitseret denne nye positur','Han var ved at tegne denne nye positur'),('talgpletten','stearinpletten')],11:[('det, han forsøgte at formidle','det, han havde villet formidle og havde formidlet')],12:[('udtrykket af generthed og ængstelig selvvigtighed','udtrykket af generthed og ønsket om at bevare sin værdighed')]}
EN={1:[('fend off the landlady','deal with the landlady')],3:[("Then don't let it run on so long","Then don't let the debt build up")],4:[('shut the door','locked the door')],5:[('Oh — the devil take them all!','Oh, if only I could sink into the ground somewhere!'),('candle-grease spots','stearin spots')],6:[('spot of tallow','spot of stearin')],7:[('He had sketched this new pose','He was sketching this new pose'),('spot of tallow','spot of stearin')],11:[('what he was trying to convey in that picture','what he had meant to convey and had conveyed in that picture')],12:[('timidity and anxious self-importance','timidity and a wish to preserve his dignity')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][133]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=134,paragraph=sn,before=a,after=b,reason='Russian V.X full comparison: debt, locked door, wish to disappear not curse everyone, stearin, ongoing sketch, achieved expression not merely attempted, preserve dignity not self-importance.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
