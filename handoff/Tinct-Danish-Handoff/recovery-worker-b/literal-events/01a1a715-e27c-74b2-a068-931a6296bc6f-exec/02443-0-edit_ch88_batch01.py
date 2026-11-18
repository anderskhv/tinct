from review_helpers import *
d=rd('modern-da.json');d['chapters'][87]['title']='Om vrede';wr('modern-da.json',d)
fixes('da',88,1,[('efter sin egen tåbelige og uoverlagte indfald','efter sine egne tåbelige og uoverlagte indfald')])
setslot('da',88,4,'[»Med leveren brændende af raseri styrter de hovedkulds af sted som klipper, der løsnes fra bjergtoppene, når bjerget mister sit underlag, og den hængende skråning skrider bort.« — Juvenal, Sat., vi. 647.]')
setslot('en',88,4,'["With fury burning in their liver, they rush headlong like rocks torn from mountain peaks when the mountain’s support gives way and its overhanging slope collapses." — Juvenal, Sat., vi. 647.]')
fixes('da',88,5,[('krøblinges','lemlæstes'),('forsku bninger','ledskred')]) if False else None
fixes('da',88,5,[('krøblinges','lemlæstes'),('forsku bninger','ledskred')]) if False else None
fixes('da',88,5,[('krøblinges','lemlæstes'),('forskubninger','ledskred')])
fixes('en',88,6,[('patria;','patriae'),('patrix','patriae')])
fixes('da',88,7,[('krigens og fredens forretninger','krigens og fredens anliggender')])
fixes('da',88,8,[('deres ret dømmekraft','deres sunde dømmekraft')])
fixes('da',88,9,[('En sulten mand bruger mad','En sulten mand spiser'),('med vægt og skøn','med alvor og omtanke')])
setslot('da',88,11,'[»Ansigterne svulmer af vrede, årerne mørkner af blod, og øjnene glimter vildere end Gorgonens ild.« — Ovid, De Art. Amandi, iii. 503.]')
setslot('en',88,11,'["Their faces swell with anger, their veins darken with blood, and their eyes flash more fiercely than Gorgon fire." — Ovid, De Art. Amandi, iii. 503.]')
fixes('da',88,13,[('end ikke en der skriver om dyd og handling','især når han skriver om dyd og handling'),('i toppen af sin vrede gav alt, hvad han havde skrevet, falskhed på','i sin voldsomme vrede modsagde alt, hvad han havde skrevet')])
fixes('en',88,13,[('even one writing of virtue and of action','especially one writing of virtue and action')])
fixes('da',88,14,[('banke dine sider grundigt','give dig en ordentlig omgang prygl')])
ledger();q=rd('review-progress.json');q.update(reviewedSlots=3070,throughChapter=88,throughSlot=15,nextChapter=88,nextSlot=16,englishAuditCheckpoint={'chapter':88,'throughSlot':15},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));wr('review-progress.json',q)
wr('review-notes-ch88-partial.json',{'chapter':88,'throughSlot':15,'status':'partial','source':'https://bribes.org/trismegiste/es2ch31.htm','changes':['Title translated;1agreement;4 fullrockcollapse/liverimage restored','5 malformedkrøblinges,dislocations;6LatinOCR;11 bloodnotrage and fiercerthanGorgoncomparative restored','13especiallynot even virtueauthors;naturalDA'], 'limits':['2 dresserunefarce may mean prank/intervention vsstagingtheatre;investigate lexically','13Plutarchslaveflogging historicalargument tension with condemnationchildabuse,guidecontext']})
