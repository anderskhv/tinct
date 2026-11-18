import json,pathlib
p=pathlib.Path(__file__).parent
fixes={'da':[(171,39,'hun i sin tilstand rystede i hele ansigtet, og at hendes ansigt var elendigt og knust','hendes ansigt skælvede i den tilstand, hun var i, og at hun så ulykkelig og knust ud'),(191,52,'som en høg','som en falk'),(191,52,'sine lakaj og portner','sin lakaj og portner'),(196,22,'om væddeløbene','om dagens væddeløb'),(227,1,'en hveps','en gedehams'),(128,21,'sølvmessehagel','sølvfarvede præstekåbe')],'en':[(171,39,'in her condition she was trembling all over her face, and her face was wretched and crushed','in her condition her whole face was trembling and she looked wretched and crushed'),(191,52,'like a hawk','like a falcon'),(217,17,'I know that from the very first moment I sacrificed everything for him!','I know I sacrificed everything for him from the very first moment!')]}
for l,fs in fixes.items():
 f=p/f'candidate-anna-karenina-modern-{l}.json';d=json.loads(f.read_text());lf=p/('DANISH-REPAIRS.json' if l=='da' else 'ENGLISH-REPAIRS.json');a=json.loads(lf.read_text())
 for n,i,b,v in fs:
  s=d['chapters'][n-1]['paragraphs'][i-1];assert b in s,(l,n,i,b);d['chapters'][n-1]['paragraphs'][i-1]=s.replace(b,v);a.append(dict(chapter=n,paragraph=i,before=b,after=v,reason='Targeted final follow-up against Russian: fluent trembling face, falcon proverb, race date, hornet and Orthodox vestment; no change to source meaning.'))
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');lf.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
