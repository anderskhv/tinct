# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-en.json';d=json.loads(f.read_text());r=json.loads((p/'ENGLISH-REPAIRS.json').read_text());c=d['chapters'][80]
changes={7:[('decoction','tincture'),('that evening','that evening before bed')],
8:[('saffron','sage')],9:[('saffron','sage')],10:[('Milfoil','Plantain')],18:[('A glass or two','A small spirits glass or two')],
32:[('But before Grigory','So the defense counsel had achieved his aim after all. But before Grigory')],
44:[('_The Life of the Deceased Elder, Father Zossima_','_The Life of the Elder Father Zossima, Who Has Fallen Asleep in God_')],
53:[('an opportunist','a careerist')],
59:[('left no receipt','left no signature'),('added it all up','worked it all out on the abacus')],
62:[('a different pack of cards','his own pack of cards'),('had cheated during the game','had manipulated a card while holding the bank')]}
for n,items in changes.items():
 for a,b in items:
  t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=81,paragraph=n,before=a,after=b,reason='Russian XII II page82: sage and plantain not saffron/milfoil, drink volume, omitted conclusion32, theological title, abacus and card dealing.'))
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'ENGLISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
