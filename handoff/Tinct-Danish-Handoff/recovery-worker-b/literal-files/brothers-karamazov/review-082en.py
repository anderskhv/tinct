# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-en.json';d=json.loads(f.read_text());r=json.loads((p/'ENGLISH-REPAIRS.json').read_text());c=d['chapters'][81]
changes={4:[('he spoke Russian fluently','he spoke Russian often and readily')],
5:[('“aberration”','“a fit of passion”'),('in a state of aberration','in a morbid state of passionate agitation')],
6:[('temporary aberration','the state of passionate agitation'),('‘Ethics!’','‘Ethicses!’')],8:[('the mental aberration','the special “fit of passion”')],
21:[('for no one else ever bought me a pound of nuts','for no one else ever bought me a pound of nuts back then'),('‘Boy, _Gott der Vater_.’','‘Boy, _Gott der Vater_—God the Father.’'),('... ‘_Gott der Sohn_.’','... ‘_Gott der Sohn_—God the Son.’'),('‘_Gott der heilige Geist_.’ Then','‘_Gott der heilige Geist_—God the Holy Spirit.’ Then')]}
for n,items in changes.items():
 for a,b in items:
  t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=82,paragraph=n,before=a,after=b,reason='Russian XII III page83: affect distinction, ethics mispronunciation callback, German theological glosses and precise timeframe.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'ENGLISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
