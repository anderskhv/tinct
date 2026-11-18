# coding: utf-8
from review_helpers import *
fixes('da',40,22,[('dør hurtigere, end de bliver truede','er døde, før de overhovedet føler sig truet'),('dens sædvanlige herold','dens sædvanlige forløber')])
fixes('da',40,25,[('endnu mere bestemt','med endnu større sandsynlighed')])
fixes('da',40,26,[('utålmodigheden ved forestillingen om døden, der gør os utålmodige over for smerten','vores manglende evne til at udholde tanken om døden, der gør os ude af stand til at udholde smerten'),('vi synes smerten dobbelt tung','vi føler smerten dobbelt så tungt')])
fixes('da',40,27,[('det værste tilfælde i vor tilværelse','det værste, der kan ramme os'),('at lindre den ved tålmod','at lindre den ved tålmodighed'),('selv om krop og fornuft gør mytteri, at holde sjælen i god stand','selv om kroppen bliver rystet, at holde sjælen og fornuften i god forfatning')])
fixes('en',40,27,[('even if body and reason mutiny, to keep the soul in good condition','even if the body is shaken, to keep the soul and reason in good condition')])
fixes('da',40,30,[('uden at vinde tilbage til syning, brænding og sondering af sår','uden at lade sine sår sy, brænde og undersøge med en sonde')])
for lang in ['da','en']:fixes(lang,40,31,[('Non est enim','Non enim')])
setslot('da',40,32,'[»For de er ikke lykkelige ved munterhed, overgivenhed, latter eller spøg, letsindets følgesvend; ofte er de lykkelige selv i sorgen ved fasthed og standhaftighed.« — Cicero, De Finib. ii. 10.]')
setslot('en',40,32,'["For they are happy not through merriment, wantonness, laughter or jesting, the companion of levity; often, even when sorrowful, they are happy through firmness and constancy." — Cicero, De Finib. ii. 10.]')
fixes('da',40,33,[('på krigens vovestykke','med krigens farer')])
ledger();wr('chapter40-source-check-batch03.json',{'chapter':40,'slots':[19,34],'witness':'https://fr.wikisource.org/wiki/Essais/Livre_I/Chapitre_14','notes':['27 important source correction: body shaken while soul AND reason remain sound, not reason mutinying. Both fixed.','31 removed intruding est, as French quotation.32 no not-only construction: happiness not based on gaiety; can persist in sadness through firmness. Both glosses fixed.','30 garbled surgical action corrected; no new clinical information added.','25 probability not confident assertion distinction. Historical view of toothache/gout and endurance philosophy preserved as source.']})
d=rd('review-progress.json');d.update(reviewedSlots=1014,throughSlot=34,nextSlot=35,englishAuditCheckpoint={'chapter':40,'throughSlot':34},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));wr('review-progress.json',d)
