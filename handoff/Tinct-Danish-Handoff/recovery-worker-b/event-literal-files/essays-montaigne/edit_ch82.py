from review_helpers import *
d=rd('modern-da.json');d['chapters'][81]['title']='Man skal ikke spille syg';wr('modern-da.json',d)
fixes('da',82,1,[('gigt','podagra'),('morgenlevéer','morgenmodtagelser'),('en podagrarampendes','en podagrapatients')])
fixes('en',82,2,[('Quantum curs','Quantum cura')])
fixes('da',82,3,[('gig ten','podagra'),('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
fixes('da',82,3,[('gig ten','podagra')]) if False else None
setslot('da',82,3,'[»Så meget formår omhu og kunsten at spille smerte: Caelius er holdt op med at foregive podagra — nu har han den.« — Martial, Ep., vii. 39, 8.]')
fixes('da',82,4,[('synets funktion blev mat af så længe at have ligget brak','synsevnen blev svækket af så længe ikke at blive brugt'),('gigtisk væske','væske, der gav podagra')])
fixes('da',82,5,[('et bånd af unge engelske herrer','en flok unge engelske adelsmænd')])
fixes('da',82,6,[('endog med en vis elegance ved det','og endda søge elegance i det og støtte mig til den med en affekteret holdning'),('Hvis det sker, bliver jeg den første i min slægt med gigt','Jeg støtter mig til, at jeg i så fald ville være den første i min slægt med podagra')])
fixes('en',82,6,[('even with a certain elegance about it','even seeking elegance in it and leaning on it in an affected pose'),('If so, I will be the first of my family to have gout','I take comfort in the fact that I would be the first of my family to have gout')])
fixes('da',82,8,[('men ligger og plager sin vogter','men plager uophørligt sin vogter'),('byen kræver en svær udgift','byen kræver store udgifter'),('en sødt sukket og henrivende medicin','en mild og behagelig medicin')])
ledger();q=rd('review-progress.json');q.update(reviewedSlots=2964,throughChapter=82,throughSlot=8,nextChapter=83,nextSlot=1,englishAuditCheckpoint={'chapter':82,'throughSlot':8},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));q['englishChaptersReviewed']=list(range(1,83));q['remaining'][0]='chapters83–107';q['remaining'][1]='chaptertitles83–107';wr('review-progress.json',q)
wr('review-notes-ch82.json',{'chapter':82,'slots':8,'status':'main-review-complete-apparatus-pending','source':'https://bribes.org/trismegiste/es2ch25.htm','changes':['Title modernDA;gout=podagra,notgenericarthritis;2 curaOCR','5 band=groupnotbånd;6 omitted leaning/affectation and takingcomfort in familyabsence restored','8 incessantly notlyingdown,nonsense sødt sukket removed'],'limits':['2 QuantumCotton/TantumFrench primaryMartial check','Medical blindness/humoral/podagra causation speculation sourcehistoricalnotendorsed;SenecaHarpaste portrayaldignity contextguide']})
