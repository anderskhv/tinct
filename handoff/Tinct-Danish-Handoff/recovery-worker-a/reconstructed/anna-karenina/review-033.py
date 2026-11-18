# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('ministermødet','ministeriet'),('et par mennesker, der spiste hos Karenins','omkring tre gæster, der spiste hos familien Karenin'),('afdelingens kontorchef','en departementsdirektør'),('det bronceindfattede Peter den Førstes ur havde færdiggjort at slå fem','bronzeuret med Peter den Store havde slået sit femte slag'),('hvid slipsknude og selskabsfrakke','hvidt slips og kjolefrakke')],2:[('De aner','Du aner'),('_ubekvemt_','_ubehageligt_')],3:[('før hun rejste fra Moskva','før hun rejste til Moskva'),('to af dem slet ikke var blevet gjort','to af dem slet ikke var færdige'),('signede ham med korsets tegn','slog korsets tegn over ham')],15:[('Efter at have drukket sin anden kop te med fløde og brød','Efter at have drukket sit andet glas te med fløde og spist brød til')],18:[('Duc de Lille, _Poésie des Enfers_','Duc de Lille, _Poésie des Enfers_ — hertugen af Lilles _Helvedes poesi_')],19:[('sprang Alexej Alexandrovitj aldrig noget over i kunstens verden','overså Alexej Alexandrovitj aldrig noget, der vakte opsigt i kunstens verden'),('altsammen','alt sammen')],20:[('en afskærmet stearinlys','et lys med en skærm')],23:[('den afmålte slæben af hans hjemmesko','hans regelmæssige skridt i hjemmesko')],26:[('den iver','den livlighed'),('slukket i hende, gemt','slukket i hende eller gemt')]}
EN={1:[('the meeting of the ministers','the ministry'),('a few people dining','about three guests dining'),('the chief secretary of the department','the director of a department')],3:[('before leaving Moscow','before leaving for Moscow'),('two of them had not been done at all','two of them were not finished at all')],15:[('Having drunk his second cup of tea with cream, and bread','Having finished his second glass of tea with cream and eaten some bread')],16:[("You've been dull","You've been bored")],18:[('Duc de Lille, _Poésie des Enfers,_','Duc de Lille, _Poésie des Enfers_ — the Duke of Lille\'s _Poetry of Hell_,')],19:[('never passed over anything in the world of art','never passed over anything that made a stir in the world of art')],23:[('the measured shuffle of his slippers','his measured footsteps in slippers')],26:[('quenched in her, hidden','quenched in her, or hidden')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][32]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=33,paragraph=sn,before=a,after=b,reason='Russian XXXIII full comparison: departure for Moscow not from, ministry not ministers meeting, three guests, art works that attract attention, source title gloss and modern Danish.'))
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   a='Alexej Alexandrovitj';b='Aleksej Aleksandrovitj'
   if a in t:c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=33,paragraph=sn,before=a,after=b,reason='Consistent Danish name transliteration.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
