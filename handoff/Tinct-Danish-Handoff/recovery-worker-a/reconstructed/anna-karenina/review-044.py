# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('Fra det tidspunkt','Fra den aften'),('Alexej Alexandrovitj','Aleksej Aleksandrovitj'),('en slags overrasket forundring','en slags munter uforståenhed'),('afventede han ydmygt det slag, han fornemmede var hævet over ham','ventede han føjeligt på slaget fra den øksehammer, han følte var løftet over ham'),('og han talte til hende i en tone, der ganske og aldeles ikke var den, han havde tænkt sig','og han sagde noget helt andet og i en helt anden tone end den, han havde tænkt sig'),('der behøvedes at sige til hende','han havde brug for at sige til hende')]}
EN={1:[('From that time','From that evening'),('the blow that he sensed was raised over him','the blow from the back of the axe he sensed was raised over him'),('and he spoke to her in a tone quite unlike that in which he had meant to speak','and he said quite different things, in quite a different tone from the one he had intended')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][43]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=44,paragraph=sn,before=a,after=b,reason='Russian PartII.X full comparison: evening, cheerful bafflement, axe-back slaughter image, both different content and tone, natural Danish.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
