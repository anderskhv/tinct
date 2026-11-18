import json,pathlib
p=pathlib.Path(__file__).parent
DA={8:[('Det er alt — han','Det er alt — han'),('det er alt — han','det er alt — han')],11:[('drejede hovedet, mens hendes ansigt fulgte Anna med medfølende smerte','drejede hovedet for at følge Anna med et smertefuldt, medfølende udtryk i ansigtet')],14:[('en lappet morgentrøje','en stoppet morgentrøje')],15:[('kastede med et skyldigt blik et øjekast op i hendes ansigt','så skyldbetynget ind i hendes ansigt')],17:[('bad Darja Aleksandrovna sine aftenbønner','bad Darja Aleksandrovna til Gud')],18:[('et vinglas','et lille glas'),('det aktive indholdsstof var morfin','hvoraf morfin udgjorde en væsentlig del')],19:[('den indeholdte ophidselse, den luft af at holde noget tilbage','den beherskede ophidselse, det præg af at skjule noget')],23:[('lurvede hat','hat af en type, som postkuske brugte'),('uensartede heste','heste af forskellig lød'),('overdækkede grusforplads','overdækkede, sandstrøede indkørsel')],24:[('snart ville blive kvalt','hastigt var ved at gro til')],26:[('tre potter','tre mål'),('havren er nede på femogfyrre kopek nu','hos gæstgiverne koster havren nu femogfyrre kopek'),('vær trygge','kan du tro')],32:[('fandt alle helt vel','fandt, at alle havde det godt')],33:[('og glemte den uklare følelse','idet hun glemte den uklare følelse')]}
DA.pop(8)
EN={14:[('a patched dressing jacket','a darned dressing jacket')],17:[('said her prayers','prayed to God')],18:[('a wine-glass','a small glass'),('the active ingredient being morphine','in which morphine was a substantial ingredient')],23:[('shabby hat','hat of a style worn by postilions'),('ill-matched horses','horses of different colors'),('covered gravel forecourt','covered, sand-strewn entrance')],24:[('would soon be smothered by','was rapidly becoming overgrown in')],26:[('three pots','three measures'),('oats are down to forty-five kopecks now','oats cost forty-five kopecks at the inns now')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][180]
 if lang=='da':
  for sn,t in enumerate(c['paragraphs'],1):
   for a,b in [('Alexandrovna','Aleksandrovna'),('Alexej','Aleksej')]:
    if a in t:changes.setdefault(sn,[]).insert(0,(a,b))
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=181,paragraph=sn,before=a,after=b,reason='Russian VI.XXIV: current overgrown soul metaphor, medicine component, prayer, coat/horse color/entrance details, grain measures and omitted inns.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-181.txt').write_text('Full Russian VI.XXIV DA EN read.181.18 morphine significant component, not specified only active ingredient.181.24 current rapid overgrowth of soul not future smothering.181.26 меры=measures/mål rather than pots/potter; дворники contextual innkeepers restored with price no invented price decline.181.23 полуямская hat type not evidence of shabbiness; horses different colors, not generally ill-matched; sand not gravel. Exact historical hat silhouette and grain measure calibration guide specialist pending; no modern medical claims. Native pending.\n')
