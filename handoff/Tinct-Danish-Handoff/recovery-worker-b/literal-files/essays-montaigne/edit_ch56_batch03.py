# coding: utf-8
from review_helpers import *
fixes('da',56,26,[('mens han befinder sig i et lastefuldt forløb','mens han lever i synd'),('indfører Guds navn','påkalder Guds navn')])
fixes('da',56,31,[('at leve med sine ønsker for offentlighedens åbne øre','at leve med sine ønsker åbent fremlagt for alle')])
fixes('da',56,34,[('tydeligt har sagt','højt har sagt')]);fixes('en',56,34,[('clearly said','said aloud')])
fixes('da',56,35,[('måtte udkæmpe arveretten til hans trone indbyrdes','måtte afgøre arvefølgen til hans trone ved at kæmpe mod hinanden')])
fixes('da',56,36,[('ordenes klang, lyd og rim','ordenes sammensætning, lyd og rækkefølge'),('utrøstet af nogen nylig forsoning med Gud','uden nogen ny forsoning med Gud'),('som vi er for fremtiden','som vi også vil være i fremtiden'),('have en sjæl, der er følsom over for de uretter, vi har begået','have en sjæl, der sørger over de uretter, vi har begået')])
fixes('en',56,36,[('the texture, sound, and jingle of the words','the arrangement, sound, and sequence of the words'),('uncomforted by any recent reconciling with God','without any renewed reconciliation with God'),('a soul sensitive to the wrongs we have done','a soul grieved by the wrongs we have done')])
for lang in ['da','en']:fixes(lang,56,37,[('terigit','tetigit')])
setslot('da',56,38,'[»Hvis en ren hånd rører ved alteret, formilder et kostbart offer ikke de vrede husguder mere end en from gave af mel og knitrende salt.« — Horats, Od., iii. 23, 17.]')
setslot('en',56,38,'["If a clean hand touches the altar, a costly victim wins over the angry household gods no better than an offering of devoutly given meal and crackling salt." — Horace, Od., iii. 23, 17.]')
ledger();wr('chapter56-source-check-batch03.json',{'chapter':56,'slots':[26,38],'witness':'https://fr.wikisource.org/w/index.php?title=Essais/Livre_I/Chapitre_56&oldid=1875832','notes':['26–38fullcomparison.34ApolloaloudcontrastswhisperLaverna.36sequencewordsnotrhyme,repentancegriefnotmeresensitivity.37tetigitOCR.38non...blandiorcostlynotmorepersuasive thanmealsalt, notclaimedcheapsuperior;farremealnotnecessarilycake.']})
d=rd('review-progress.json');d.update(reviewedSlots=1417,throughChapter=56,throughSlot=38,nextChapter=57,nextSlot=1,englishAuditCheckpoint={'chapter':56,'throughSlot':38},englishChaptersReviewed=list(range(1,57)),danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));d['remaining'][0]='chapters57–107';d['remaining'][1]='chaptertitles57–107';wr('review-progress.json',d)
