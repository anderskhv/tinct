import json,pathlib
p=pathlib.Path(__file__).parent
maps={'da':{'Serjoja':'Serjozja','Sviazjskij':'Svijazjskij','Mjakaja':'Mjagkaja','Nadinka':'Nadjenka','Alexandrovna':'Aleksandrovna','Alexandrovitj':'Aleksandrovitj','Alexej':'Aleksej','Mikhail':'Mikhajl','Mikhalitj':'Mikhajlytj'},'en':{'Servian':'Serbian','Servia':'Serbia'}}
for l in ('da','en'):
 f=p/f'candidate-anna-karenina-modern-{l}.json';d=json.loads(f.read_text());lf=p/('DANISH-REPAIRS.json' if l=='da' else 'ENGLISH-REPAIRS.json');a=json.loads(lf.read_text());n=0
 for c in d['chapters']:
  for i,s in enumerate(c['paragraphs']):
   for old,new in maps[l].items():
    if old in s:
     a.append(dict(chapter=c['number'],paragraph=i+1,before=old,after=new,reason='Global consistency: same named person/modern country spelling; original context preserved.'));s=s.replace(old,new);n+=1
   c['paragraphs'][i]=s
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');lf.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');print(l,n)
