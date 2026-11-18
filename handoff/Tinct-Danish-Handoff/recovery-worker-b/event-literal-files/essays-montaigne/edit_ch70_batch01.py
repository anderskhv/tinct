from review_helpers import *
for l,title in [('da','Om at bedømme andres død')]:
 d=rd(f'modern-{l}.json');d['chapters'][69]['title']=title;wr(f'modern-{l}.json',d)
fixes('da',70,1,[('hele helheden','hele universet'),('og vi er af den opfattelse, at de har lige så meget brug for os, som vi har for dem','og vi synes, at tingene svigter vores syn, i samme takt som synet svigter dem')])
fixes('en',70,1,[('and we are of the opinion they need us as much as we need them','and we think things fail our sight as our sight fails them')])
fixes('da',70,4,[('menneskenes manerer','menneskenes skikke')])
fixes('da',70,7,[('en der ikke går så let af','noget, der ikke foregår så let')])
fixes('da',70,12,[('Hvis du nægter at sejle til Italien under gudernes myndighed, så stol på min','Hvis du nægter at sejle til Italien på himlens bud, så ret dig efter mig')])
fixes('en',70,12,[('If you refuse to sail to Italy under the gods\' authority, trust to mine','If you refuse to sail to Italy at heaven’s bidding, look to me')])
ledger();q=rd('review-progress.json');q.update(reviewedSlots=2512,throughChapter=70,throughSlot=21,nextChapter=70,nextSlot=22,englishAuditCheckpoint={'chapter':70,'throughSlot':21},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));wr('review-progress.json',q)
wr('review-notes-ch70-partial.json',{'throughSlot':21,'source':'https://bribes.org/trismegiste/es2ch13.htm','changes':['1 world fails altered sight not reciprocal need;12 heaven forbids sailing contrast Caesar authority','Danish title translated;4 customs;7 idiom'],'limits':['Latin quotation references pending final apparatus audit']})
