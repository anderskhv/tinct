# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('alle dem, han havde villet se','alle dem, han havde brug for at se'),('opretholde den ene betingelse','opfylde den ene betingelse'),('opnå skilsmisse','kræve skilsmisse'),('denne kurs','dette skridt'),('omorganiseringen af de indfødte stammer','forvaltningen af de ikke-russiske folkeslag'),('landene i Zarajskij-provinsen','markerne i Zarajsk‑guvernementet')],2:[('i en slags vældig aritmetisk progression','med voldsomt tiltagende styrke')],6:[('ru skubbede','brutalt skubbede')],10:[('finde en grund','finde på et påskud')],13:[("_la constatation d'un fait_","_la constatation d'un fait_ — at fastslå en kendsgerning")],15:[('bevilger hende det hæderlige værn om sit navn','lader hende leve i ly af hans gode navn')],16:[('gik hun for at gå sin vej','ville hun gå')],17:[('hans store hænder greb om hendes arm','hans store fingre greb om hendes arm')],23:[('animalsk lidenskab','dyrisk lidenskab')],24:[('ufrit','ustorsindet'),('det er ikke som en gentleman at slå en, der ligger ned','det er uanstændigt at slå på en, der ligger ned')],28:[('selvtilfredse complacens','selvtilfredse ro')],32:[('min hengivenhed for min søn','min kærlighed til min søn')],34:[('jeg skal snart i barselsseng','jeg skal snart føde')]}
EN={1:[('everyone he had wanted to see','everyone he needed to see'),('obtain a divorce','demand a divorce'),('the reorganization of the native tribes','the administration of the non-Russian peoples'),('the lands of Zaraisky province','the fields of Zaraisk province')],2:[('a sort of vast arithmetical progression','an enormous progression')],10:[('find a reason','invent an excuse')],13:[("_la constatation d'un fait_","_la constatation d'un fait_ — establishing a fact")],17:[('his big hands clutched','his big fingers clutched')],24:[("it isn't like a gentleman to strike someone who's down","it is indecent to strike someone who's down")],28:[('self-satisfied complacency','self-satisfied calm')],32:[('affection for my son','love for my son')],34:[('I shall soon be confined','I shall soon give birth')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][104]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   if 'Alexej Alexandrovitj' in t:changes.setdefault(sn,[]).append(('Alexej Alexandrovitj','Aleksej Aleksandrovitj'))
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=105,paragraph=sn,before=a,after=b,reason='Russian IV.IV full comparison: inorodtsy category, demand divorce, invent excuse, no added arithmetic formula, fingers, French gloss, unstinting vs indecent contrast, modern Danish.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
