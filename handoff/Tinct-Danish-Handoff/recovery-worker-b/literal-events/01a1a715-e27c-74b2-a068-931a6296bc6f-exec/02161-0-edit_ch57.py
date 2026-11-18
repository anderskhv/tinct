# coding: utf-8
from review_helpers import *
d=rd('modern-da.json');d['chapters'][56]['title']='Om alder';wr('modern-da.json',d)
fixes('da',57,1,[('de, der med hvad jeg ikke ved for et naturforløb beroliger sig selv og lover sig selv nogle år ud over det','de, der trøster sig med et eller andet såkaldt naturligt livsforløb og lover sig selv nogle år mere'),('et kraftstab','svigtende kræfter')])
fixes('da',57,2,[('to eller tre generationer','to eller tre århundreder'),('den almindelige spændvidde','den almindelige livslængde')]);fixes('en',57,2,[('two or three generations','two or three centuries')])
fixes('da',57,3,[('sendes til kakkelovnen','trække sig tilbage til ildstedet')]);fixes('en',57,3,[('until fifty-five or sixty','before fifty-five or sixty')])
for lang in ['da','en']:fixes(lang,57,5,[('rion picque','nou picque')])
fixes('da',57,8,[('tredive års alderen','trediveårsalderen'),('min konstitution','min krop')])
fixes('da',57,10,[('blodet og kraften ebber ud','lemmerne svigter, når kræfterne sløves')]);fixes('en',57,10,[('with blood and vigour ebbing away','and the limbs fail as their strength grows blunt')])
fixes('da',57,11,[('en sygdom uden megen smerte for den lidende','en lidelse, som den ramte kun i ringe grad mærker')]);fixes('en',57,11,[('a disease of no great pain to the sufferer','an affliction little perceived by the sufferer')])
fixes('da',57,12,[('langsomt-lærende lærlingetid','langsom lærlingetid')])
ledger();wr('chapter57-source-check.json',{'chapter':57,'slots':12,'witness':'https://bribes.org/trismegiste/es1ch57.htm','notes':['All12includingeditorialFlorio/Cottonnote.2sieclescenturiesnotgenerations;Cotton40ageadditionabsentFrenchkeptedition.3before retirementage ENoppositeuntil fixed.5Dauphineproverbnou notrionOCR.10Latinlimbsnotblood.11littleperceiveddeclinenotmerelypainless. Historicalage/demographics/politicalanddevelopmentalclaimsretainauthorcontext, notmodernstatisticalassertions. EndFrenchBookI;retainedchapter58startsBookII.']})
d=rd('review-progress.json');d.update(reviewedSlots=1429,throughChapter=57,throughSlot=12,nextChapter=58,nextSlot=1,englishAuditCheckpoint={'chapter':57,'throughSlot':12},englishChaptersReviewed=list(range(1,58)),danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));d['remaining'][0]='chapters58–107';d['remaining'][1]='chaptertitles58–107';wr('review-progress.json',d)
