from review_helpers import *
setslot('da',69,545,'»Forfærdet over denne uvante ulykke, både rig og ulykkelig, ønsker han at slippe fra sin rigdom og hader det, han lige har bedt om.«')
setslot('da',69,548,'»Hvis du vil have et råd, så lad guderne selv afgøre, hvad der passer os og gavner vores forhold. Mennesket er dem kærere, end det er sig selv.«')
setslot('en',69,548,'If you want advice, let the gods themselves decide what suits us and benefits our affairs. Man is dearer to them than he is to himself.')
fixes('da',69,549,[('bede ham','bede dem'),('han kaster dig','de kaster dig'),('sætter dig på et kast af terningerne','lader din skæbne afhænge af et terningkast')])
fixes('en',69,549,[('ask of him','ask of them'),('that he throw you','that they throw you')])
fixes('da',69,550,[('hele filosofiens forstand','hele filosofiens grundlag')])
ledger();q=rd('review-progress.json');q.update(reviewedSlots=2381,throughSlot=550,nextSlot=551,englishAuditCheckpoint={'chapter':69,'throughSlot':550},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));wr('review-progress.json',q)
n=rd('review-notes-ch69-partial.json');n['throughSlot']=550;n['changes']+=['545 unfamiliar misfortune not novelty of evil;548 removed freely invented verse-gloss expansions, translated actual Latin only','549 plural gods restored per French/preceding Juvenal verse;550 philosophic basis'];n['limits']+=['550 Varro 288 schools retained Cotton number;French witness 280 variant requires apparatus check rather than silent harmonization'];wr('review-notes-ch69-partial.json',n)
