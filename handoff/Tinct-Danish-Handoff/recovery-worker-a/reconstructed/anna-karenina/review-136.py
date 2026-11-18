# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('stadig red på sin bølge af kløgt','blev ved med sin kloge talestrøm')],4:[('en gammel studie','et gammelt studie')],6:[('sit forrevne, hørgule hoved','sit hoved med det pjuskede, lyse hår')],10:[('potentielle fuldkommenhed','fuldkommenhed')],11:[('Kristi forkortede ben','Perspektivforkortningen af Kristi ben'),('hinsides perfektion','selve fuldkommenheden'),('at retoucherede','at retouchere')],12:[('alt, hvad kunstneren havde øst af livet','alt, hvad kunstneren havde gennemlevet'),('den sædvanlige fejl','den fælles ulykke')]}
EN={1:[('was still riding his wave of cleverness','kept up his clever flow of talk')],10:[('potential perfection','perfection')],11:[('beyond perfection','the height of perfection')],12:[('everything the artist had drawn from life','everything the artist had lived through'),('the standard defect','the shared misfortune')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][135]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=136,paragraph=sn,before=a,after=b,reason='Russian V.XII full comparison: artist certainty perfection not potential, foreshortening not physical shortened leg, tousled hair, lived-through experience and shared misfortune; Danish grammar.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
