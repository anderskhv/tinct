# coding: utf-8
from review_helpers import *
d=rd('modern-da.json');d['chapters'][47]['title']='Om krigsheste, eller destrierer';wr('modern-da.json',d)
fixes('da',48,1,[('uden ved øre','på anden måde end ved at lytte'),('førerheste','håndheste'),('vores tjenesteheste','vores krigsheste'),('vores romaner','vores ridderromaner'),('en føreshest','en håndhest')])
fixes('da',48,4,[('når de først er bidt fast','når de først er kommet i kamp'),('så du efterlades i hænderne på deres kamp','så du er prisgivet deres kamp')])
fixes('da',48,5,[('en valet de chambre','en kammertjener'),('holdt derfor tappert sin grund','holdt derfor tappert stand')])
fixes('da',48,6,[('monteret på bar ryg','ridende uden sadel'),('hvis forhove lignede en mands, med hovene delt som fingre','hvis forfødder lignede et menneskes, med hovene delt som fingre'),('som han efter hestens død rejste en statue til gudinden Venus for','som han efter dens død lod afbilde i en statue, han indviede til gudinden Venus')])
fixes('en',48,6,[("and to whom, after the horse's death, he dedicated a statue to the goddess Venus","and after its death he dedicated a statue of it to the goddess Venus")])
fixes('da',48,7,[('hvad enten det går godt eller dårligt','hvad enten jeg er rask eller syg')])
for lang in ['da','en']:fixes(lang,48,10,[('baud dubie','haud dubie')])
setslot('en',48,11,'["In which the Roman undoubtedly excels." — Livy, ix. 22.]')
ledger();wr('chapter48-source-check-batch01.json',{'chapter':48,'slots':[1,12],'witness':'https://fr.wikisource.org/w/index.php?title=Essais/Livre_I/Chapitre_48&oldid=1875817','notes':['1–12 fullcomparison.1 ledhorses handhorses not leadinghorses; romances chivalric.5 Englishidiom holdground naturalDanish.6 statue ofhorse dedicatedVenus clarified.7 healthmeaning wellorill not circumstantial luck.10haud. Retained classical horse-anatomy and combat claims remain author claims.']})
d=rd('review-progress.json');d.update(reviewedSlots=1227,throughChapter=48,throughSlot=12,nextChapter=48,nextSlot=13,englishAuditCheckpoint={'chapter':48,'throughSlot':12},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));wr('review-progress.json',d)
