import json,pathlib
p=pathlib.Path(__file__).parent
DA={1:[('Levins havde været i Moskva i tre måneder','Levin og Kitty boede nu på tredje måned i Moskva'),('Men hun var stadig oppe og i gang','Men hun var stadig gravid')],4:[('hans rolige, venlige, gæstfri væsen','hans rolige, venlige og gæstfri væsen'),('med en panik, der næsten var skinsyg','med en uro, der endda vakte hendes jalousi'),('hans fine opdragelse','hans ordentlighed'),('forklare sin tilstand','forklare hans tilstand')],5:[('kunne ikke holde tanken om','kunne ikke udholde tanken om')],6:[('næsten aldrig','aldrig')],9:[('holdt hendes åndedræt op','hoppede hendes åndedræt et øjeblik over'),('hver eneste lille tonefald','hvert eneste lille tonefald')]}
EN={1:[('had been in Moscow three months','were now in their third month in Moscow'),('she was still up and about','she was still carrying the child'),('monthly nurse','midwife')],4:[('his fine breeding','his decency')],6:[('hardly ever','never')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][189]
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=190,paragraph=sn,before=a,after=b,reason='Russian VII.I: third month not three elapsed, still pregnant not merely active, midwife, decency, no quarrels absolute, pronoun and Danish grammar.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-190.txt').write_text('Full Russian VII.I DA EN read.190.1 thirdmonth not3completed; носила stillpregnant notupandabout; ENmidwife.190.4 hisstate pronoun corrected; порядочность decency/ordentlighed notbreeding.190.6 neverquarrel nothardlyever. Native pending.\n')
