"""Reviewed Roman/Greek name pairs, Homeric namesakes and Odysseus's assumed names.

Butler's original uses the Roman names for the gods and for the hero; the modern
edition uses the Greek. Both forms are carried as aliases on one entity, so the
divergence needs no edition-specific code. What does need code is the set of
names the poem gives to more than one person, and the names Odysseus invents.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'odyssey'

# Namesakes, keyed by paragraph. Both editions place these identically; the
# alignment was verified paragraph by paragraph before these tables were written.
SPLIT={
 'Ajax':      ({(4,41):'ajax-oileus'},'ajax'),
 'Amphion':   ({(11,22):'amphion-orchomenus'},'amphion'),
 'Antiphates':({(15,19):'antiphates-melampus'},'antiphates'),
 'Antiphus':  ({(17,6):'antiphus-elder'},'antiphus'),
 'Castor':    ({(14,11):'castor-hylax'},'castor'),
 'Anchialus': ({(1,13):'anchialus-taphian',(8,7):'anchialus-phaeacian'},None),
 'Pisenor':   ({(2,3):'pisenor-herald'},'pisenor'),
 'Iasus':     ({(11,22):'iasus-orchomenus',(17,42):'iasus-cyprus'},None),
 'Perseus':   ({},'perseus-nestorid'),
 # The dog only; every other Argos in the poem is the place.
 'Argos':     ({(17,26):'argos',(17,29):'argos'},None),
 # Eurymachus's father unless the paragraph names another man of the name. The
 # fountain-builder Polyctor at 17:17 is deliberately left unbound: the text
 # does not say whether he is the suitors' father.
 'Polybus':   ({(4,10):'polybus-egypt',(8,31):'polybus-phaeacian',
                (22,25):'polybus-suitor',(22,28):'polybus-suitor'},'polybus-eurymachus'),
 'Polyctor':  ({(18,27):'polyctor',(22,25):'polyctor'},None),
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  who=table.get((ch,pi),default)
  if who:add(word(name),who,'reviewed-context')
 # The singular Cyclops is always Polyphemus; the plural is the people.
 add(word('Cyclops'),'polyphemus')
 # Odysseus's assumed name in the cave. Lowercase "nobody" in the same
 # sentence is the pun, not the name, and is left alone.
 if ch==9:add(word('Noman')+'|'+word('Nobody'),'noman','reviewed-name')
 # Unnamed figures the text identifies only by relationship.
 # Bind the relationship, not the father's name: Dymas is bound by his own alias.
 if (ch,pi)==(6,1):add(r'(?<=[’\x27]s )daughter','dymas-daughter')
 if (ch,pi)==(23,18):add(r'a single maidservant|one maid','actor-daughter')
 # The modern edition names the Phaeacian nurse Eurynome, which is also the name
 # of Penelope's housekeeper. Here it is the Phaeacian; see the package README.
 if (ch,pi)==(7,0):out=[(a,bb,'eurymedusa' if id=='eurynome' else id,how) for a,bb,id,how in out]
 if (ch,pi)==(24,12):add(r'old Sicel woman|old Sicilian woman','sicel-woman')
 return out

def compile_package():return assemble('odyssey',bind)
if __name__=='__main__':run('odyssey','The Odyssey',bind)
