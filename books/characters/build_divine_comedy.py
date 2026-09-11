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
 'Michael': ({(7,3):'michael',(20,38):'michael-scot',(71,15):'michael'},None),
 'Jacopo':  ({(6,26):'jacopo-rusticucci',(13,44):'jacopo-sant-andrea',
              (16,14):'jacopo-rusticucci'},None),
 'Alberto': ({(29,36):'alberto-siena'},None),
 'Alessandro':({},'alessandro-romena'),
 'Albert':  ({(32,18):'albert-alberti',(29,36):'alberto-siena'},None),
 'Pier':    ({(28,24):'pier-da-medicina',(41,41):'peter-of-aragon'},None),
 'Simon':   ({(19,0):'simon-magus'},None),
 'Boniface':({(19,17):'boniface',(58,9):'boniface-ravenna'},None),
 # Purgatorio namesakes.
 'Thomas':  ({(54,22):'thomas-aquinas',(77,32):'thomas-aquinas',(79,36):'thomas-aquinas',
              (79,47):'thomas-aquinas',(81,1):'thomas-aquinas',(83,42):'thomas-apostle'},None),
 'Nicholas':({},'nicholas-saint'),
 'Pygmalion':({(54,34):'pygmalion-tyre'},'pygmalion'),
 'Orestes': ({(47,10):'orestes-purg'},None),
 'Marco':   ({(50,15):'marco-lombardo',(50,43):'marco-lombardo'},None),
 'Charles': ({(19,32):'charles-of-anjou',(39,22):'charles-of-anjou',(45,45):'charles-of-anjou',
              (54,22):'charles-of-anjou',(54,23):'charles-of-valois',(73,35):'charles-ii',
              (75,23):'charles-ii',(76,0):'charles-martel',(87,20):'charles-ii'},None),
 'Clement': ({},'clement-iv'),
 'Henry':   ({(41,43):'henry-of-england',(84,27):'henry-vii',(97,45):'henry-vii'},None),
 'Peter':   ({(41,41):'peter-of-aragon',(77,35):'peter-lombard',(78,29):'pietro-bernardone',
              (79,44):['peter-mangiatore','peter-of-spain'],(88,40):'peter-damian'},'peter'),
 # Frederick Novello and Frederick Tignoso carry their own surnames; the
 # emperor must not be bound over the top of them.
 'Frederick':({(40,5):None,(48,35):None,(41,39):'frederick-sicily',
               (87,20):'frederick-sicily'},'frederick-ii'),
 'James':   ({(41,39):'james-aragon',(66,24):'james-apostle',(66,25):'james-apostle'},None),
 'John':    ({(19,5):'john-baptist',(63,34):'john-evangelist',(66,24):'john-evangelist',
              (66,25):'john-evangelist',(83,8):'john-baptist',(99,10):'john-baptist',
              (99,42):'john-evangelist'},None),
 # Manfred's daughter and his grandmother share the name; he speaks of both.
 'Constance':({(37,47):'constance-aragon',(41,42):'constance-aragon'},'constance-empress'),
 'Costanza': ({(37,47):'constance-aragon',(41,42):'constance-aragon'},'constance-empress'),
 'Albert':  ({(32,18):'albert-alberti',(29,36):'alberto-siena',(40,32):'albert-of-germany',
              (77,32):'albert-of-cologne',(86,38):'albert-of-germany'},None),

 # Paradiso namesakes.
 'Anselm':  ({(33,16):'anselmuccio',(79,45):'anselm-canterbury'},None),
 'Dionysius':({(12,35):'dionysius',(95,43):'dionysius-areopagite'},None),
 'Bernard': ({(78,26):'bernard-quintavalle'},'bernard-clairvaux'),
 'Hugh':    ({(54,16):'hugh-capet',(79,44):'hugh-st-victor'},None),
 'William': ({(41,44):'marquis-william',(85,15):'william-of-orange',
              (87,20):'william-of-sicily'},None),
 'Guglielmo':({(16,23):'guglielmo-borsiere',(45,19):'guglielmo-aldobrandeschi',
               (87,20):'william-of-sicily'},None),
 # Lombardy the region, the Lombard people, Peter Lombard and the great
 # Lombard of Verona. Only the last three are cast.
 'Lombard': ({(73,31):'lombards',(84,23):'bartolommeo-scala'},None),
 'Soldanier':({(32,40):'gianni-soldanier'},'old-florentine-houses'),
 'Soldanieri':({(32,40):'gianni-soldanier'},'old-florentine-houses'),
 # The angelic order, not the three theological virtues of Purgatorio VII.
 'Virtues': ({(95,40):'virtues'},None),
 # Currado Malaspina in the valley of the princes; Currado da Palazzo in
 # Marco Lombardo's roll of the three old men.
 'Currado': ({(42,21):'currado-malaspina',(42,39):'currado-malaspina',
              (50,41):'currado-da-palazzo'},None),
 # Longfellow writes Francesco d'Accorso as "Francis of Accorso".
 'Francis': ({(15,36):'francesco-accorso'},'francis'),
 # Franco Bolognese's surname is not the Bolognese people.
 'Bolognese':({(45,27):None},'bolognese'),
 'Ugolin':  ({(48,34):'ugolin-dazzo',(48,40):'ugolin-fantoli'},None),
 'Pallas':  ({(46,10):'pallas-goddess'},None),
 'Lycurgus':({},'lycurgus-purg'),
 'Argus':   ({},'argus-purg'),
 'Justinian':({},'justinian'),
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
  (r'fifth light','solomon'),
  (r'regal prudence|kingly prudence','solomon'),
  (r'great baron','hugh-the-great'),
  (r'advocate of the Christian','orosius'),
  (r'Cripple of Jerusalem','cripple-of-jerusalem'),
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
