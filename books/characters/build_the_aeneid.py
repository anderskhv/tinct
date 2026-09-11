"""Reviewed namesakes, and the four galleys named after monsters.

Dryden's Aeneid is rhymed couplets, the modern edition is prose; they align
paragraph for paragraph but Dryden paraphrases freely, so some names appear in
only one of them. Those are recorded as omittedEntities, not repaired.

Dryden uses the Roman names throughout, so there is no Greek/Roman split. What
needs resolving is the reuse of names in the Italian catalogues, and the boat
race in book five, which names four ships Chimaera, Scylla, Centaur and Dolphin.
Ships are not cast, so those occurrences are deliberately left unbound.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'the-aeneid'

# name -> ({(chapter, paragraph): id or [ids by occurrence index]}, default id or None)
PALLAS={(8,3):'pallas-ancestor',(8,15):'pallas-athena',(8,24):'pallas-athena',
        (11,27):'pallas-athena'}

SPLIT={
 'Abas':   ({(1,9):'abas-trojan',(3,13):'abas-greek',(10,14):'abas-etruscan',
             (10,33):'abas-etruscan'},None),
 'Gyas':   ({(10,27):'gyas-italian'},'gyas'),
 'Lycus':  ({(1,13):'lycus-trojan',(9,34):'lycus-tower'},None),
 'Amycus': ({(1,13):'amycus-trojan',(9,49):'amycus-huntsman',(12,45):'amycus-horseman'},None),
 'Bitias': ({(1,37):'bitias-carthage'},'bitias-trojan'),
 'Pandarus':({(5,21):'pandarus-lycian'},'pandarus-trojan'),
 'Alcanor':({(9,43):'alcanor-father',(10,28):'alcanor-italian'},None),
 'Capys':  ({(6,28):'capys-alban'},'capys'),
 'Caeneus':({(6,16):'caeneus-underworld'},'caeneus-trojan'),
 'Idaeus': ({(6,17):'idaeus-charioteer'},'idaeus-trojan'),
 'Actor':  ({(12,10):'actor-auruncan'},'actor-trojan'),
 'Butes':  ({(5,16):'butes-boxer',(9,42):'butes-squire',(11,38):'butes-trojan',
             (12,33):'butes-turnus'},None),
 'Thoas':  ({(2,8):'thoas-greek',(10,32):'thoas-italian'},None),
 'Menoetes':({(5,6):'menoetes-pilot',(12,47):'menoetes-arcadian'},None),
 'Remus':  ({(1,17):'remus-brother',(9,22):'remus-rutulian'},None),
 'Ilus':   ({(6,23):'ilus-trojan',(10,31):'ilus-italian'},None),
 'Teucer': ({(1,33):'teucer-salamis'},'teucer-trojan'),
 'Silvius':({(6,28):['silvius','silvius-aeneas','silvius-aeneas']},None),
 'Orestes':({(3,16):'orestes'},None),
 # Ufens is a Latin captain and also a river; the river is geography.
 'Ufens':  ({(7,44):None},'ufens'),
 # Nisus is the Trojan; "Nisus' top" in book 6 is Bacchus's mountain, not a man.
 'Nisus':  ({(6,29):None},'nisus'),
 # Asylas the Etruscan diviner arrives in book 10. The Asylas of 9:36 is on the
 # walls before that fleet lands and is a different man; see the README.
 'Asylas': ({(9,36):None},'asylas-etruscan'),
 # Liger drives his brother Lucagus's chariot in book 10. The Liger of 9:36 is
 # left unbound for the same reason.
 'Liger':  ({(9,36):None},'liger'),
 'Numa':   ({(10,43):'numa'},None),
 'Cydon':  ({(10,27):'cydon'},None),
 'Erymanthus':({(9,44):'erymanthus'},None),
 'Ida':    ({(9,36):'ida'},None),
 'Dymas':  ({(2,13):'dymas'},None),
 # The monsters, and the galleys named after them. Book five's race is ships.
 'Scylla': ({(1,12):'scylla',(3,19):'scylla',(3,32):'scylla'},None),
 'Chimaera':({(6,11):'chimaera',(7,44):'chimaera'},None),
 'Centaur':({(10,16):'centaurs'},None),
 'Orsilochus':({(11,36):'orsilochus'},None),
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default) if (ch,pi) in table else default
  if entry is None:continue
  if isinstance(entry,list):
   for i,m in enumerate(re.finditer(word(name),text)):
    who=entry[i] if i<len(entry) else None
    if who:out.append((m.start(),m.end(),who,'reviewed-context'))
  else:
   for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 # Pallas is three people. The goddess holds books one to seven and three later
 # paragraphs; Evander's son holds book eight onward; the ancestor appears once,
 # in the line that explains where Pallanteum got its name.
 who=PALLAS.get((ch,pi),'pallas-athena' if ch<=7 else 'pallas')
 for m in re.finditer(word('Pallas'),text):out.append((m.start(),m.end(),who,'reviewed-context'))
 # The Tiber is a river through most of the poem; it is a god only where it
 # rises out of the poplars and speaks, and where Aeneas prays to Father Tiber.
 if (ch,pi)==(8,3):
  for m in re.finditer(r'the father of the Roman flood|the father of Roman waters',text):
   out.append((m.start(),m.end(),'tiberinus','reviewed-context'))
 if (ch,pi)==(8,4):
  for m in re.finditer(r'Father Tiber',text):out.append((m.start(),m.end(),'tiberinus','reviewed-context'))
 # Sleep is a god only where the text says so; ordinary sleep is left alone.
 for m in re.finditer(r'God of Sleep|house of Sleep|Death.s half-brother, Sleep',text):
  out.append((m.start(),m.end(),'somnus','reviewed-context'))
 return out

def compile_package():return assemble('the-aeneid',bind)
if __name__=='__main__':run('the-aeneid','The Aeneid',bind)
