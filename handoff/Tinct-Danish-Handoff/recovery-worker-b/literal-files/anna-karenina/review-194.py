import json,pathlib
p=pathlib.Path(__file__).parent
DA={1:[('Ved koncerten den eftermiddag','Ved formiddagskoncerten'),('_King Lear;_','_Kong Lear på steppen;_'),('damerne i kapper','damerne i hatte')],2:[('_King Lear,_','_Kong Lear,_'),('sprang, ligesom en gal mands, op ud af det blå','forsvandt, ligesom en gal mands, lige så uventet')],4:[('Dmitrievitj','Dmitritj')],5:[('skildre kong Lear','skildre kong Lear på steppen')],9:[('Under _entr’acten_','I pausen'),('Under _entr\'acten_','I pausen'),('skygger','skygger')],12:[('måske er de ikke hjemme','måske tager de ikke imod besøg') ]}
DA[9]=[("Under _entr'acten_",'I pausen')]
EN={1:[('At the concert that afternoon','At the morning concert'),('_King Lear;_','_King Lear on the Steppe;_')],2:[("sprang up out of nowhere",'passed away unexpectedly')],5:[('depict King Lear.','depict King Lear on the steppe.')],12:[("perhaps they won't be at home","perhaps they won't receive visitors")]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.load(open(f));rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.load(open(rf));c=d['chapters'][193]
 for sn,pairs in changes.items():
  for a,b in pairs:
   assert a in c['paragraphs'][sn-1],(lang,sn,a)
   c['paragraphs'][sn-1]=c['paragraphs'][sn-1].replace(a,b);r.append(dict(chapter=194,paragraph=sn,before=a,after=b,reason='Russian VII.V: morning concert, full fictional title, hats not cloaks, feelings pass not arise, not receiving visitors versus absence.'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
(p/'SOURCE-NOTES-194.txt').write_text('Full Russian VII.V DA EN read.194.1 утренний morningconcert retained despite after1pm priorchapter; periodmatinee not silently afternoon.194.1/5 КорольЛирвстепи fulltitle restored, notmereKingLear. Scholarly commentary https://rvb.ru/tolstoy/02comm/0031_2.htm calls fictionalfantasy parodyofprogrammemusic; do notidentify directlywithBalakirevactualwork. Downloadedsource-rvb-annotations.html forguide.194.2 feelingsPASSunexpectedlynotarise.194.9 sculpture shadows/phantoms and stairs/ladder historicalmonumentidentification pendingguide.194.4 GoetheFaust eternal feminine Germanallusion glossneeded. Native pending.\n')
