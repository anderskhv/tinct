# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('hvinede af fortvivlet glæde','råbte i vild begejstring')],3:[('stramt opvundne strømper','stramt optrukne strømper'),('enfoldige, tillidsfulde','åbne, tillidsfulde')],4:[('Hvad så, er jeg ikke lige så sød som hende','Er jeg så dårligere end hende')],5:[('sødere end nogen anden','den bedste af alle')],8:[('så De tog imod olivengrenen','fik De bragt olivengrenen frem')],9:[('Min _belle-sœur_ er i det hele taget for forhastet','Min svigerinde er i det hele taget alt for resolut')],11:[('bekymret i dag','udmattet i dag')],13:[('udarbejder de den','diskuterer de den')],14:[('gav indholdet af hans brev','fortalte, hvad der stod i hans brev')],16:[('altsammen','alt sammen')],17:[('Alexej Alexandrovitj','Aleksej Aleksandrovitj'),('tage sig af sin søns måltid','være hos sin søn, mens han spiste')],18:[('årsagsløs skam','skam uden grund'),('beslutsom og hævet over enhver bebrejdelse','sikker på sig selv og uangribelig')],19:[('Alexej Alexandrovitj','Aleksej Aleksandrovitj'),('enhver kvinde, der lever i verden','enhver kvinde, der færdes i selskabslivet')]}
EN={4:[('Why, am I not as nice as her','Am I worse than her, then')],5:[("you're nicer than anyone in the world","you are the best in the world")],8:[('so you took the olive branch','did you deliver the olive branch')],9:[('_belle-sœur_ is in general too hasty','sister-in-law is altogether too resolute')],11:[("I'm so worried today","I'm so exhausted today")],13:[('work it out so pettily','discuss it so pettily')],17:[("attending to her son's meal","being with her son while he ate")],19:[('every woman living in the world','every woman moving in society')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][31]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=32,paragraph=sn,before=a,after=b,reason='Russian XXXII full comparison: brought olive branch not received, son comparison broader than nice, exhausted not worried, participate in meal not prepare it, social-world meaning and natural Danish.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
