"""Manually authored identities for the local Hall-based editions."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('beowulf','Beowulf','central','The poem’s hero, a Geatish warrior, son of Ecgtheow and nephew of King Hygelac.')
entities[-1]['snapshots']=[dict(after=[31,8],body='The poem’s hero, now king of the Geats; Ecgtheow’s son and Hygelac’s nephew.')]
C('scyld-son','Beowulf, son of Scyld','reference','The early Danish ruler, son of Scyld and father of Healfdene; a different Beowulf from the poem’s hero.')
C('hrothgar','Hrothgar','major','The Danish king who built Heorot, husband of Wealhtheow.','Hrothgar')
C('grendel','Grendel','major','The monster who attacks Hrothgar’s hall, Heorot.','Grendel','creature')
C('grendel-mother','Grendel’s mother','major','The unnamed mother of Grendel, who lives in the waters near the moors.','mother of Grendel|Grendel’s mother|Grendel\'s mother|Grendel\'s fierce mother','creature')
C('dragon','The dragon','major','The fire-breathing dragon guarding an ancient hoard in Geatland.','','creature')
C('wiglaf','Wiglaf','major','The young warrior in Beowulf’s service, son of Weohstan and a kinsman of Beowulf.','Wiglaf')
C('hygelac','Hygelac','major','The king of the Geats, Beowulf’s uncle and lord; spelled Higelac in this translation.','Higelac|Hygelac')
C('wealhtheow','Wealhtheow','supporting','Hrothgar’s queen and the mother of Hrethric, Hrothmund and Freaware.','Wealhtheow|Wealhtheo')
C('unferth','Unferth','supporting','Hrothgar’s courtier who challenges Beowulf’s reputation, son of Ecglaf.','Unferth')
C('wulfgar','Wulfgar','supporting','Hrothgar’s court officer who receives Beowulf’s party, a prince of the Wendels.','Wulfgar')
C('hygd','Hygd','supporting','Hygelac’s queen, daughter of Hæreth and mother of Heardred.','Hygd')
C('hrothulf','Hrothulf','supporting','Hrothgar’s nephew, raised in his household and seated beside him at the feast.','Hrothulf')
C('hrethric','Hrethric','supporting','One of the sons of Hrothgar and Wealhtheow.','Hrethric')
C('hrothmund','Hrothmund','supporting','One of the sons of Hrothgar and Wealhtheow.','Hrothmund')
C('freaware','Freaware','supporting','Hrothgar and Wealhtheow’s daughter, betrothed to Ingeld of the Heathobards.','Freaware')
C('hondscio','Hondscio','supporting','One of Beowulf’s Geatish companions at Heorot.','Hondscio')
C('aeschere','Æschere','supporting','Hrothgar’s trusted adviser and companion in battle, elder brother of Yrmenlaf.','Æschere|Aeschere')
for id,name,body,aliases in [
 ('scyld','Scyld Scefing','The founding ruler of the Danish Scylding line in the poem’s opening.','Scyld the Scefing|Scyld Scefing|Scyld'),
 ('healfdene','Healfdene','The Danish king who is the father of Hrothgar, Heorogar, Halga and Elan.','Healfdene'),
 ('heorogar','Heorogar','Hrothgar’s elder brother and predecessor as Danish king, also called Heregar.','Heorogar|Heregar'),
 ('halga','Halga','Hrothgar’s brother, one of Healfdene’s sons.','Halga'),
 ('elan','Elan','Hrothgar’s sister, identified in this translation as Ongentheow’s wife.','Elan'),
 ('ongentheow','Ongentheow','The Swedish king, father of Onela and Ohthere, in the Geats’ history of their wars.','Ongentheow|Ongentheo'),
 ('ecgtheow','Ecgtheow','Beowulf’s father, who married King Hrethel’s daughter.','Ecgtheow'),
 ('hrethel','Hrethel','The former king of the Geats, Beowulf’s maternal grandfather and Hygelac’s father.','Hrethel|Hrethla|Hrethrel'),
 ('heatholaf','Heatholaf','The Wilfing warrior in Hrothgar’s account of Ecgtheow’s feud.','Heatholaf'),
 ('ecglaf','Ecglaf','Unferth’s father.','Ecglaf'),
 ('breca','Breca','Beowulf’s youthful swimming rival, son of Beanstan and a lord of the Brondings.','Breca'),
 ('beanstan','Beanstan','Breca’s father.','Beanstan'),
 ('wayland','Wayland','The legendary smith credited with making Beowulf’s armor.','Wayland'),
 ('sigmund','Sigmund','The legendary hero praised in the court poet’s dragon-fighting tale.','Sigmund|Wælsing'),
 ('fitela','Fitela','Sigmund’s nephew and companion in the tale recalled by the poet.','Fitela'),
 ('waels','Wæls','Sigmund’s father, whose name appears in his family designation.','Wæls'),
 ('heremod','Heremod','The earlier Danish king used as a warning about a ruler’s pride and cruelty.','Heremod'),
 ('ecgwela','Ecgwela','An early Danish ruler whose people are recalled in Hrothgar’s warning.','Ecgwela'),
 ('finn','Finn','The Frisian king in the hall-singer’s story, husband of Hildeburg.','Finn'),
 ('hnaef','Hnæf','The Danish leader in the Finn episode, Hildeburg’s brother.','Hnæf'),
 ('hildeburg','Hildeburg','Finn’s Danish wife, sister of Hnæf and daughter of Hoce.','Hildeburg'),
 ('hoce','Hoce','The father of Hildeburg and Hnæf.','Hoce'),
 ('hengest','Hengest','The Danish warrior who leads Hnæf’s surviving men in the Finn episode.','Hengest'),
 ('folcwalda','Folcwalda','Finn’s father.','Folcwalda'),
 ('hun','Hun','The Frisian in this translation who gives a sword to Hengest.','Hun'),
 ('guthlaf','Guthlaf','One of Hnæf’s Danish warriors in the Finn episode.','Guthlaf'),
 ('oslaf','Oslaf','One of Hnæf’s Danish warriors in the Finn episode.','Oslaf'),
 ('hama','Hama','The legendary hero who carries off the Brosingmen’s necklace in the poet’s comparison.','Hama'),
 ('eormenric','Eormenric','The king whose hostility Hama escapes in the necklace allusion.','Eormenric'),
 ('swerting','Swerting','Hygelac’s ancestor, called his grandfather in this translation.','Swerting'),
 ('yrmenlaf','Yrmenlaf','Æschere’s younger brother.','Yrmenlaf'),
 ('haereth','Hæreth','Hygd’s father.','Hæreth'),
 ('thrytho','Thrytho','The queen in the poet’s contrast with Hygd, wife of Offa.','Thrytho'),
 ('heming','Heming','A kinsman named in the account of Offa and Eomær.','Heming'),
 ('offa','Offa','The legendary king of the Angles, husband of Thrytho and father of Eomær.','Offa'),
 ('eomaer','Eomær','The son of Offa and Thrytho, grandson of Garmund.','Eomær'),
 ('garmund','Garmund','Offa’s father and Eomær’s grandfather.','Garmund'),
 ('froda','Froda','The Heathobard ruler who is Ingeld’s father.','Froda'),
 ('ingeld','Ingeld','The Heathobard prince betrothed to Hrothgar’s daughter Freaware.','Ingeld'),
 ('hereward','Hereward','Heorogar’s son, named in the history of the armor Beowulf brings home.','Hereward'),
 ('heardred','Heardred','The son of Hygelac and Hygd, who succeeds his father as king of the Geats.','Heardred'),
 ('hereric','Hereric','Heardred’s uncle.','Hereric'),
 ('ohthere','Ohthere','The Swedish prince, son of Ongentheow and father of Eanmund and Eadgils.','Ohthere'),
 ('onela','Onela','The Swedish king, brother of Ohthere and uncle of Eanmund and Eadgils.','Onela'),
 ('eadgils','Eadgils','The Swedish prince, son of Ohthere and brother of Eanmund.','Eadgils'),
 ('eanmund','Eanmund','The Swedish prince, son of Ohthere and brother of Eadgils.','Eanmund'),
 ('herebald','Herebald','King Hrethel’s eldest son, brother of Hæthcyn and Hygelac.','Herebald'),
 ('haethcyn','Hæthcyn','Hrethel’s son and Hygelac’s brother, an earlier king of the Geats.','Hæthcyn'),
 ('eofor','Eofor','The Geatish warrior in the war with Ongentheow, brother of Wulf.','Eofor'),
 ('daeghrefn','Dæghrefn','The warrior of the Hugs in Beowulf’s account of his earlier battles.','Dæghrefn'),
 ('weohstan','Weohstan','Wiglaf’s father, also called Wihstan in this translation.','Weohstan|Wihstan'),
 ('aelfhere','Ælfhere','The kinsman of Wiglaf named at his introduction.','Ælfhere'),
 ('wulf','Wulf','The Geatish warrior in the war with Ongentheow, brother of Eofor and son of Wonred.','Wulf'),
 ('wonred','Wonred','The father of Wulf and Eofor.','Wonred'),
 ('merewing','The Merovingian ruler','The Frankish ruler called Merewing in the account of Hygelac’s raid.','Merewing')]:C(id,name,'reference',body,aliases)
for id,name,role,body,kind in [
 ('coastguard','The Danish coastguard','supporting','Hrothgar’s coastal watchman, who questions Beowulf’s arriving party.','unnamed-person'),
 ('pilot','The Geatish guide','supporting','The seafaring man who shows Beowulf’s party the way before departure.','unnamed-person'),
 ('poet','The poet on the ride','supporting','The Danish poet who praises Beowulf and recalls Sigmund during the ride from the mere.','unnamed-person'),
 ('hall-singer','Hrothgar’s hall-singer','supporting','The court performer who tells the Finn and Hildeburg story at the feast.','unnamed-person'),
 ('creation-singer','The singer in Heorot','supporting','The hall-singer whose song of creation is heard at the opening of the poem.','unnamed-person'),
 ('beowulf-mother','Beowulf’s mother','reference','Hrethel’s daughter, wife of Ecgtheow and mother of Beowulf.','unnamed-person'),
 ('hildeburg-son','Hildeburg’s son','reference','The son of Hildeburg and Finn in the hall-singer’s tale.','unnamed-person'),
 ('sigmund-dragon','Sigmund’s dragon','reference','The treasure-guarding dragon in the poet’s story of Sigmund.','creature'),
 ('unferth-brothers','Unferth’s brothers','reference','The brothers whose deaths Beowulf raises in his argument with Unferth.','group'),
 ('old-heathobard','The old Heathobard warrior','reference','The veteran whom Beowulf imagines stirring resentment at Ingeld’s wedding feast.','unnamed-person'),
 ('young-heathobard','The young Heathobard warrior','reference','The young man whom the imagined veteran urges to avenge his father.','unnamed-person'),
 ('heathobard-father','The young warrior’s father','reference','The fallen Heathobard whose sword appears in Beowulf’s imagined wedding dispute.','unnamed-person'),
 ('danish-attendant','Freaware’s Danish attendant','reference','The Danish warrior wearing inherited spoils in Beowulf’s imagined wedding dispute.','unnamed-person'),
 ('last-survivor','The last survivor','reference','The unnamed man who deposits his vanished people’s treasures in the barrow.','unnamed-person'),
 ('thief','The fugitive servant','supporting','The servant who takes a cup from the dragon’s hoard while seeking refuge.','unnamed-person'),
 ('thief-master','The servant’s master','reference','The lord from whom the fugitive servant seeks forgiveness with the stolen cup.','unnamed-person'),
 ('hanged-son','The hanged son','reference','The young man on the gallows in the comparison used for Hrethel’s grief.','unnamed-person'),
 ('grieving-father','The grieving father','reference','The old father in the gallows comparison, distinct from Hrethel himself.','unnamed-person'),
 ('messenger','The Geatish messenger','supporting','The warrior who reports news of the dragon fight to the waiting Geats.','unnamed-person'),
 ('ongentheow-wife','Ongentheow’s queen','reference','The Swedish king’s wife and mother of Onela and Ohthere in the war account.','unnamed-person'),
 ('hygelac-daughter','Hygelac’s daughter','reference','The king’s unnamed daughter, given in marriage to Eofor.','unnamed-person'),
 ('mourning-woman','The mourning woman','supporting','The woman lamenting at Beowulf’s funeral, called a widow in this translation.','unnamed-person')]:C(id,name,role,body,'',kind)
for id,name,role,body,aliases in [
 ('hrunting','Hrunting','supporting','Unferth’s sword, lent to Beowulf for the journey into the mere.','Hrunting'),
 ('naegling','Nægling','supporting','Beowulf’s sword in the fight with the dragon.','Nægling'),
 ('lafing','Láfing','reference','The sword given to Hengest by Hun in this translation’s Finn episode.','Láfing|Lafing'),
 ('brosing-necklace','The Brosingmen’s necklace','reference','The legendary necklace carried off by Hama, used as a comparison for Beowulf’s gift.','Brosingmen\'s necklace|necklace of the Brosings|Brosings\' necklace')]:C(id,name,role,body,aliases,'object')
C('god','God','reference','The divine creator invoked by the poem’s narrator and speakers.','God-Father|God the Father|God|All-Father|Almighty|Creator|Providence|All-Ruler|All-Wielder|All-wielding Ruler|Ruling-God|Sooth-king|World-Ruler|Victory-Wielder|Guardian of Heaven|Meter of Justice|Measurer of Justice','deity')
C('cain','Cain','reference','The biblical son of Adam and Eve, brother of Abel, whose line the poem associates with monsters.','Cain','religious-figure')
C('abel','Abel','reference','Cain’s brother in the biblical story recalled by the narrator.','Abel','religious-figure')
C('fate','Fate','reference','Destiny personified by the poet, called Weird or Wyrd as well as Fate.','','personification')
for id,name,role,body,aliases in [
 ('danes','The Danes','supporting','Hrothgar’s people, also called Scyldings and by several Danish epithets.','Spear-Danes|Danemen|Scyldings|Danes|Ring-Danes|Dane-folk|South-Danes|East-Danes|West-Danes|Bright-Danes|Hrethmen|Victory-Scyldings|Folk-Scyldings|Armor-Danes|Ingwins'),
 ('geats','The Geats','supporting','Beowulf’s people, ruled by Hygelac when he sets out; also called Weders.','Geatmen|Geats|Weders|War-Geats|Sea-Geats|Geat-folk'),
 ('scylfings','The Scylfings','reference','The Swedish royal family and its people in the accounts of war with the Geats.','Scylfings|War-Scylfings'),
 ('waegmundings','The Wægmundings','reference','The family line shared by Beowulf and Wiglaf.','Wægmunding'),
 ('wendels','The Wendels','reference','The people of whom Wulfgar is called a prince.','Wendels'),
 ('wilfings','The Wilfings','reference','Heatholaf’s people, involved in Ecgtheow’s feud.','Wilfings|Wilfingish|Wilfing'),
 ('brondings','The Brondings','reference','Breca’s people.','Brondings'),
 ('heathoremes','The Heathoremes','reference','The people whose coast Breca reaches in Unferth’s account of the swimming contest.','Heathoremes'),
 ('finns','The Finns','reference','The people whose land Beowulf says he reaches after the swimming ordeal.','Finns'),
 ('frisians','The Frisians','reference','The people of Finn in the lay and of the region raided by Hygelac.','Frisians'),
 ('jutes','The Jutes','reference','The people called Jutemen in the Finn episode.','Jutemen|Jutes'),
 ('franks','The Franks','reference','The people encountered in the account of Hygelac’s fatal raid.','Frankmen|Franks'),
 ('hugs','The Hugs','reference','A name used here for the Franks, Dæghrefn’s people.','Hugmen|Hugs'),
 ('hetwars','The Hetwars','reference','The continental people fighting the Geats during Hygelac’s raid.','Hetwars'),
 ('heathobards','The Heathobards','reference','Ingeld’s people, whose feud with the Danes is addressed through his betrothal.','Heathobards'),
 ('gepids','The Gepids','reference','A Germanic people named among possible sources of warriors.','Gepids'),
 ('giants','The giants','reference','The ancient beings whom the narrator places among the enemies of God.','giants'),
 ('elves','The elves','reference','The supernatural beings listed in the narrator’s account of Cain’s descendants.','Elves|elves')]:C(id,name,role,body,aliases,'group')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='beowulf',contentVersion='2026-09-10.1',coverage='All 43 sections of both local Hall-based English editions: named cast, genealogies, embedded tales, reviewed unnamed roles, named weapons and peoples; separate opening Beowulf and later kingship gate.',entities=entities),ensure_ascii=False,indent=2)+'\n')
