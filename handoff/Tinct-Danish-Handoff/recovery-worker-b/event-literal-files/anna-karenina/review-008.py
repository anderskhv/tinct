import json,pathlib
p=pathlib.Path(__file__).parent
DA={4:[('styrede dem begges andele','bestyrede begges andele'),('den måde, han selv ønskede, han skulle','den måde, han selv ønskede')],5:[('amtsrådet','zemstvoen')],7:[('medlem af rådet','medlem af bestyrelsen')],11:[('giv vores ret til lokalt selvstyre','giv de samme rettigheder, som vores lokale selvstyre har'),('gennem dem','gennem de rettigheder')],14:[('Måske ikke','Måske')],16:[('en mand, der var fuldstændig ruineret','en mand, der havde forspildt sit liv')],22:[('med den fremmede, men velkendte håndskrift','det, der stod med den sære, velkendte håndskrift'),('Det er den eneste tjeneste, jeg beder mine nådige brødre om','Det er det eneste, jeg kræver af mine elskværdige brødre')],25:[('ville af hele mit hjerte have ønsket','ville af hele mit hjerte ønske')],28:[('jeg ikke kunne få fred','jeg ikke kan finde ro')],29:[('en lektion i ydmyghed','en lære i ydmyghed')],31:[('nyt om Sjtjerbatskijs','nyt om familien Sjtjerbatskij')]}
EN={7:[('a member of the board','a member of the executive board')],14:[('Perhaps not','Perhaps')],22:[("That's the only favor I ask of my gracious brothers","That's the only thing I demand of my dear brothers")],25:[('would have wished','would wish')],28:[("I couldn't be at peace","I can't be at peace")]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][7]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=8,paragraph=sn,before=a,after=b,reason='Russian chapterVIII: local executive board, present-tense emotional positions, Nikolaj demand vs favor, modern Danish syntax and idiom.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
