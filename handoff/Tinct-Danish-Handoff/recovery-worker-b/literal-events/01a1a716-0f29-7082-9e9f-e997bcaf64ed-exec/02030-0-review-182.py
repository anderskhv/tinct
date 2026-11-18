import json,pathlib
p=pathlib.Path(__file__).parent
DA={1:[('en del af vinteren','en del af efteråret'),('en uudtalt aftale','en aftale')],2:[('De havde overflod af alt; de havde et barn','De havde overflod af alt; de var sunde og raske; de havde et barn'),('den seriøse litteratur i mode','seriøs litteratur, der var på mode')],3:[('hovedtanke gik stadig om hende selv','største bekymring gjaldt stadig hende selv'),('hvede','korn'),('hård som klippen','hård som flint'),('Trods alle den tyske forvalters listighed og snildhed','Trods al den tyske forvalters list og snilde'),('krydsforhørte ham','spurgte ham ud'),('aller bedste','allerbedste')],4:[('provinsvalg i Kasjinskij-provinsen','adelsvalg i Kasjin-guvernementet'),('Sviazjskij','Svijazjskij')],5:[('Sviazjskij','Svijazjskij'),('det mest dystre slags efterårsvejr','den tungeste og tristeste tid på efteråret'),('ude af stand til at gøre rede for denne ro','uden at forstå denne ro')],8:[('lægge den tone','slå den tone an')]}
EN={1:[('part of the winter','part of the autumn'),('an unspoken agreement','an agreement')],2:[('They had abundance of everything; they had a child','They had abundance of everything; they had their health; they had a child')],3:[('timber, wheat, and wool','timber, grain, and wool'),('hard as rock','hard as flint')],4:[('provincial elections in the Kashinsky province','elections of the nobility in Kashin province')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][181]
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=182,paragraph=sn,before=a,after=b,reason='Russian VI.XXV: autumn not winter, explicit health omitted, grain not wheat, noble elections, fluency.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-182.txt').write_text('Full Russian VI.XXV DA EN read.182.1 autumn not winter fixes chronology.182.2 omitted health restored.182.4 nobility elections not generic provincial election, essential later chapters.182.3 хлеб grain not specifically wheat.182.7 Gautier bookseller identity guide research pending. Native pending.\n')
