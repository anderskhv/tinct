"""Reviewed namesakes for the Comedy.

Chapters 1-34 are the Inferno, 35-67 the Purgatorio, 68-100 the Paradiso.

Longfellow's blank verse and the modern prose align paragraph for paragraph.
Longfellow spells the guide Virgilius where the prose says Virgil; both are
aliases of one entity.

The hard part of this poem is that so many of its people share a first name.
Five different men are called Guido in the Inferno alone, and the only thing
that separates them is the canto they stand in.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'divine-comedy'

# name -> ({(chapter, paragraph): id or [ids by occurrence index]}, default or None)
SPLIT={
 'Guido':   ({(10,20):'guido-cavalcanti',(16,12):'guido-guerra',(20,39):'guido-bonatti',
              (28,25):'guido-cassero',(30,25):'guido-romena',
              (50,41):'guido-da-castel',(48,32):'guido-carpigna',
              (48,34):'guido-da-prata',(48,26):'guido-del-duca'},None),
 'Brutus':  ({(4,42):'brutus-elder',(34,21):'brutus-caesar'},None),
 'Alexander':({(12,35):'alexander-tyrant',(14,10):'alexander-great'},None),
 'Rinier':  ({(12,45):['rinier-corneto','rinier-pazzo']},None),
 'Buoso':   ({(25,46):'buoso-abati',(30,14):'buoso-donati'},None),
 'Michael': ({(7,3):'michael',(20,38):'michael-scot'},None),
 'Jacopo':  ({(6,26):'jacopo-rusticucci',(13,44):'jacopo-sant-andrea',
              (16,14):'jacopo-rusticucci'},None),
 'Alberto': ({(29,36):'alberto-siena'},None),
 'Alessandro':({},'alessandro-romena'),
 'Albert':  ({(32,18):'albert-alberti',(29,36):'alberto-siena'},None),
 'Pier':    ({(28,24):'pier-da-medicina',(41,41):'peter-of-aragon'},None),
 'Simon':   ({(19,0):'simon-magus'},None),
 'Boniface':({(19,17):'boniface',(58,9):'boniface-ravenna'},None),
 # Purgatorio namesakes.
 'Thomas':  ({(54,22):'thomas-aquinas-purg'},None),
 'Nicholas':({},'nicholas-saint'),
 'Pygmalion':({(54,34):'pygmalion-tyre'},'pygmalion'),
 'Orestes': ({(47,10):'orestes-purg'},None),
 'Marco':   ({(50,15):'marco-lombardo',(50,43):'marco-lombardo'},None),
 'Charles': ({(54,22):'charles-of-anjou'},None),
 'Clement': ({},'clement-iv'),
 'Henry':   ({(41,43):'henry-of-england'},None),
 'Peter':   ({(41,41):'peter-of-aragon'},'peter'),
 'Frederick':({(41,39):'frederick-sicily'},'frederick-ii'),
 'James':   ({(41,39):'james-aragon'},None),
 'Constance':({(41,42):'constance-aragon'},'constance-empress'),
 'Costanza': ({},'constance-empress'),
 'Albert':  ({(32,18):'albert-alberti',(29,36):'alberto-siena',(40,32):'albert-of-germany'},None),
 'Ugolin':  ({(48,34):'ugolin-dazzo',(48,40):'ugolin-fantoli'},None),
 'Pallas':  ({(46,10):'pallas-goddess'},None),
 'Lycurgus':({},'lycurgus-purg'),
 'Argus':   ({},'argus-purg'),
 'Justinian':({},'justinian-purg'),
 'Marcellus':({},'marcellus-purg'),

 # Adam is the first father everywhere except the canto of the counterfeiters.
 'Adam':    ({(30,20):'master-adam',(30,33):'master-adam',(30,34):'master-adam'},'adam'),
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default)
  if entry is None:continue
  if isinstance(entry,list):
   for i,m in enumerate(re.finditer(word(name),text)):
    who=entry[i] if i<len(entry) else None
    if who:out.append((m.start(),m.end(),who,'reviewed-context'))
  else:
   for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 # Figures the poem identifies only by circumstance. Each rule carries an
 # alternative for Longfellow's wording and one for the prose.
 for pat,who in [
  (r'grand old man|great Old Man','old-man-of-crete'),
  (r'elders of (?:Saint|Santa) Zita','santa-zita-elder'),
  (r'the kingdom of Navarre','ciampolo'),
  (r'false woman (?:is who|who) accused','potiphars-wife'),
  (r'breast and shadow','mordred'),
  (r'counsell?ed the Pharisees','caiaphas'),
  (r'from the mountains (?:there )?between Urbino','guido-montefeltro'),
  (r'who both keys had in keeping|held both keys to Frederick','pier-della-vigna'),
  (r'Master (?:I beheld )?of those who know','aristotle'),
  (r'that city was which to the Baptist|the city that changed its patron saint','florentine-suicide'),
  (r'successor Petri','adrian'),
  (r'large-nosed','henry-of-navarre'),
  (r'[Ff]rom Tours','martin-iv'),
  (r'Lemosin|one from Limoges','giraut'),
  (r'San Zeno.s Abbot|Abbot of San Zeno','abbot-san-zeno'),
 ]:
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),who,'reviewed-context'))
 # Figures the poem identifies only by circumstance.
 return out

def compile_package():return assemble('divine-comedy',bind)
if __name__=='__main__':run('divine-comedy','The Divine Comedy',bind)
