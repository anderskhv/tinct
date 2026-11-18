# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('foran hende','bøjet over hende'),('hvordan eller hvorfor','hvad han skulle berolige hende med eller over')],2:[('kvalt stemme','skælvende stemme')],4:[('snøftende','hulkende')],5:[('deres åndelige nøgenhed','hendes egen åndelige nøgenhed'),('knugede hende og smittede ham','knugede hende og forplantede sig til ham')],6:[('gjorde en anstrengelse over sig selv','tog sig sammen')],8:[('ét eneste øjebliks lykke','ét minut af denne lykke')],11:[('lægge ord på','sætte ord på'),('vulgarisere denne følelse med upassende ord','gøre følelsen banal med upræcise ord'),('det indviklede i sine følelser','hele kompleksiteten i sine følelser')],14:[('Alexej Alexandrovitj','Aleksej Aleksandrovitj'),('Alexej Vronskij','Aleksej Vronskij'),('Hvor lykkelige vi nu er','Hvor er det godt nu'),('Og hun undrede sig over, at det engang havde forekommet hende umuligt, forklarede dem leende','Og mens hun undrede sig over, at det før havde forekommet hende umuligt, forklarede hun dem leende')]}
EN={1:[('stood before her','stood over her'),('not knowing how or why','not knowing what to calm her about or how')],2:[('a choked voice','a trembling voice'),("for pity's sake","for God's sake")],5:[('their spiritual nakedness','her own spiritual nakedness')],8:[('one instant of this happiness','one minute of this happiness')],9:[("For pity's sake","For God's sake")],11:[('inappropriate words','inexact words')],14:[('How happy we are now!','How good it is now!')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][44]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=45,paragraph=sn,before=a,after=b,reason='Russian PartII.XI full comparison: trembling voice, her own nakedness, what/how comfort not why, minute, imprecise not inappropriate words, source exclamations and modern idiom.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
