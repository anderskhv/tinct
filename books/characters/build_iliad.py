"""Reviewed Roman/Greek name pairs and the Iliad's very dense namesakes.

Butler's original uses the Roman names for the gods and for Odysseus; the modern
edition uses the Greek. Both forms are aliases on one entity, so the divergence
needs no edition-specific code.

What does need code is the battle catalogue. The Iliad gives the same name to
two, three, four and in one case five different men, and the only thing that
separates them is where they stand. Every table below was built by reading every
occurrence of the name in the original and checking that the modern edition
places it in the same paragraph.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'iliad'

# Ajax son of Oileus, by paragraph and by zero-based occurrence index within it.
# Every other Ajax in the poem is Telamon's son; Ajaxes is the pair.
AJAX_OILEUS={(12,16):[1],(13,7):[0],(13,46):[1],(13,47):[0],(14,35):[0],(14,40):[1],
             (15,26):[0],(16,19):[0],(23,33):[0],(23,34):[0],(23,35):[0,1],
             (23,55):[0,1,2,3,4],(23,56):[0]}

# name -> ({(chapter, paragraph): id or [ids by occurrence index]}, default id or None)
SPLIT={
 'Helenus':   ({(5,54):'helenus-oenops'},'helenus'),
 'Lycaon':    ({(2,70):'lycaon-zelea',(4,7):['laodocus','lycaon-zelea','lycaon-zelea'],
                (5,18):['lycaon-zelea','lycaon-zelea','lycaon-zelea'],
                (5,21):'lycaon-zelea',(5,10):'lycaon-zelea',(5,17):'lycaon-zelea',
                (5,20):'lycaon-zelea',(5,23):'lycaon-zelea',(5,24):'lycaon-zelea',
                (3,29):'lycaon'},'lycaon'),
 'Eurypylus': ({(2,52):None},'eurypylus'),
 'Sthenelus': ({(19,10):'sthenelus-perseus'},'sthenelus'),
 'Actor':     ({(2,34):'actor-azeus',(2,45):'actor-moliones',(11,50):'actor-moliones',
                (13,14):'actor-moliones',(23,46):'actor-moliones',(16,9):'actor-echecles'},'menoetius-father'),
 'Schedius':  ({(15,42):'schedius-perimedes'},'schedius'),
 'Epistrophus':({(2,53):'epistrophus-lyrnessus',(2,78):'epistrophus-halizoni'},'epistrophus-phocean'),
 'Iphitus':   ({(8,11):'iphitus-archeptolemus'},'iphitus-naubolus'),
 'Amphimachus':({(2,82):'amphimachus-carian'},'amphimachus'),
 'Eurytus':   ({(2,45):'eurytus-molione'},'eurytus'),
 'Tlepolemus':({(16,25):'tlepolemus-myrmidon'},'tlepolemus'),
 'Antiphus':  ({(2,52):'antiphus-thessalus',(2,81):'antiphus-meonian'},'antiphus-priam'),
 'Medon':     ({(17,13):'medon-trojan'},'medon'),
 'Phylacus':  ({(6,4):'phylacus-trojan'},'phylacus'),
 'Caletor':   ({(13,38):'caletor-aphareus'},'caletor'),
 'Bias':      ({(4,23):'bias-pylian',(13,46):'bias-athenian',(20,34):'bias-trojan'},None),
 'Haemon':    ({(4,23):'haemon-pylian',(4,29):'haemon-maeon',(17,28):'haemon-laerces'},None),
 'Menesthius':({(7,2):'menesthius-arne'},'menesthius'),
 'Borus':     ({(5,4):'borus-meonian'},'borus'),
 'Pisander':  ({(11,8):'pisander-antimachus',(11,10):'pisander-antimachus',
                (16,9):'pisander-myrmidon'},'pisander-trojan'),
 'Phorbas':   ({(9,30):'phorbas-lesbos'},'phorbas-trojan'),
 'Lampus':    ({(3,13):'lampus-elder',(15,42):'lampus-elder'},'lampus'),
 'Clytius':   ({(3,13):'clytius-elder',(11,21):'clytius-dolops',(15,34):'clytius-elder'},'clytius-elder'),
 'Dardanus':  ({(20,34):'dardanus-bias'},'dardanus'),
 'Tros':      ({(20,34):'tros-alastor'},'tros'),
 'Laodice':   ({(9,10):'laodice-agamemnon',(9,17):'laodice-agamemnon'},'laodice'),
 'Orestes':   ({(5,54):'orestes-charioteer',(9,10):'orestes',(9,17):'orestes',
                (12,5):'orestes-trojan',(12,7):'orestes-trojan'},None),
 'Acamas':    ({(2,74):'acamas-thracian',(5,38):'acamas-thracian',(6,2):'acamas-thracian'},'acamas'),
 'Laodocus':  ({(17,46):'laodocus-greek'},'laodocus'),
 'Hippothous':({(24,17):'hippothous-priam'},'hippothous'),
 'Nestor':    ({(24,17):'nestor-trojan'},'nestor'),
 'Chromius':  ({(4,23):'chromius-pylian',(5,16):'chromius-priam',(5,52):'chromius-lycian',
                (8,24):'chromius-teucer'},'chromius-aeneas'),
 'Alastor':   ({(4,23):'alastor-pylian',(5,52):'alastor-lycian',(8,27):'alastor-squire',
                (13,32):'alastor-squire',(20,34):'alastor-tros'},None),
 'Adrestus':  ({(2,71):'adrestus-trojan',(5,33):'adrastus',(23,23):'adrastus',
                (16,45):'adrestus-patroclus'},'adrestus-captive'),
 'Echepolus': ({(23,22):'echepolus-sicyon'},'echepolus'),
 'Anchises':  ({(23,22):'anchises-sicyon'},'anchises'),
 'Hypsenor':  ({(13,31):'hypsenor-hippasus'},'hypsenor'),
 'Hippasus':  ({(13,31):'hippasus-hypsenor',(17,21):'hippasus-apisaon'},'hippasus-socus'),
 'Apisaon':   ({(17,21):'apisaon-hippasus'},'apisaon'),
 'Polyidus':  ({(5,15):'polyidus-eurydamas'},'polyidus-seer'),
 'Eetion':    ({(21,3):'eetion-imbros',(17,37):'eetion-podes',(17,38):'eetion-podes'},'eetion'),
 'Idaeus':    ({(5,2):'idaeus-dares',(5,3):'idaeus-dares'},'idaeus'),
 'Scamandrius':({(6,29):'astyanax'},'scamandrius-hunter'),
 'Astynous':  ({(15,36):'astynous-protiaon'},'astynous'),
 'Phaenops':  ({(17,18):'phaenops-phorcys',(17,38):'phaenops-asius'},'phaenops'),
 'Orsilochus':({(8,24):'orsilochus-teucer',
                (5,43):['orsilochus','orsilochus-river','orsilochus'],
                (5,44):'orsilochus'},None),
 'Opheltius': ({(11,21):'opheltius-hector'},'opheltius'),
 'Aesepus':   ({(6,4):'aesepus'},None),
 'Pedasus':   ({(6,4):'pedasus-twin',(16,7):'pedasus',(16,31):'pedasus'},None),
 'Amphius':   ({(5,48):'amphius-selagus'},'amphius'),
 'Periphas':  ({(17,19):'periphas-epytus'},'periphas'),
 'Coeranus':  ({(5,52):'coeranus'},None),
 'Noemon':    ({(23,45):'noemon-greek'},'noemon'),
 'Mydon':     ({(21,10):'mydon-paeonian'},'mydon'),
 'Otus':      ({(15,42):'otus-cyllenian'},'otus'),
 'Oenomaus':  ({(5,54):'oenomaus-greek'},'oenomaus'),
 'Thoon':     ({(5,15):'thoon-phaenops',(11,32):'thoon-ulysses',(12,5):'thoon-asius',
                (13,38):'thoon-antilochus'},None),
 'Autonous':  ({(16,45):'autonous-trojan'},'autonous'),
 'Dolops':    ({(11,21):'dolops-clytius'},'dolops-lampus'),
 'Agelaus':   ({(8,22):'agelaus-phradmon'},'agelaus-greek'),
 'Pylartes':  ({(16,45):'pylartes-patroclus'},'pylartes'),
 'Mulius':    ({(16,45):'mulius-patroclus',(20,35):'mulius-achilles'},'mulius'),
 'Ormenus':   ({(8,24):'ormenus-teucer',(9,22):'ormenus-amyntor',(10,22):'ormenus-amyntor'},'ormenus-leonteus'),
 'Mecisteus': ({(6,4):'mecisteus-talaus',(8,27):'mecisteus-echius',(13,32):'mecisteus-echius',
                (15,26):'mecisteus-polydamas'},'mecisteus-talaus'),
 'Echius':    ({(15,26):'echius-polites',(16,25):'echius-damastor'},'echius-mecisteus'),
 'Melanippus':({(8,24):'melanippus-teucer',(16,45):'melanippus-patroclus',
                (19,17):'melanippus-greek'},'melanippus-hiketaon'),
 'Periphetes':({(14,40):'periphetes-teucer'},'periphetes'),
 'Erymas':    ({(16,25):'erymas-patroclus'},'erymas'),
 'Laogonus':  ({(20,34):'laogonus-bias'},'laogonus'),
 'Thestor':   ({(1,9):'thestor-calchas',(12,18):'thestor-alcmaon'},'thestor'),
 'Echeclus':  ({(20,35):'echeclus-achilles'},'echeclus'),
 'Ophelestes':({(21,10):'ophelestes-paeonian'},'ophelestes-teucer'),
 'Deucalion': ({(20,35):'deucalion-trojan'},'deucalion-crete'),
 'Areithous': ({(7,2):'areithous-mace'},'areithous'),
 'Oeneus':    ({(21,10):'oeneus-paeonian'},'oeneus'),
 'Hippolochus':({(11,8):'hippolochus-antimachus',(11,9):'hippolochus-antimachus',
                 (11,10):'hippolochus-antimachus'},'hippolochus'),
 'Perseus':   ({(19,10):'perseus'},None),
 'Castor':    ({(3,21):'castor'},None),
 'Clymene':   ({(3,12):'clymene',(18,3):'clymene-nereid'},None),
 'Phoenix':   ({(14,25):'phoenix-father'},'phoenix'),
 'Oileus':    ({(11,6):'oileus-charioteer'},'oileus'),
 'Xanthus':   ({(5,15):'xanthus-phaenops',(8,17):'xanthus-hector',
                (16,7):'xanthus-horse',(19,28):'xanthus-horse',(19,29):'xanthus-horse',
                (19,30):'xanthus-horse',(20,7):'scamander',(21,8):'scamander',
                (21,18):'scamander',(21,20):'scamander',(21,23):'scamander'},None),
 'Podargus':  ({(23,22):'podargus'},'podargus'),
 # Paeon heals the gods; Agastrophus's father shares the name once.
 'Paeon':     ({(11,26):'paeon-agastrophus'},'paeon'),
 'Lampus-h':  ({},None),
}
GENERIC={'menoetius-father':'menoetius'}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 def rule(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 # Ajax, by occurrence index.
 for i,m in enumerate(re.finditer(word('Ajax(?:es)?'),text)):
  who='ajaxes' if m.group(0)=='Ajaxes' else ('ajax-oileus' if i in AJAX_OILEUS.get((ch,pi),[]) else 'ajax')
  out.append((m.start(),m.end(),who,'reviewed-context'))
 for name,(table,default) in SPLIT.items():
  name=name.split('-')[0]
  entry=table.get((ch,pi),default)
  if entry is None:continue
  if isinstance(entry,list):
   for i,m in enumerate(re.finditer(word(name),text)):
    who=entry[i] if i<len(entry) else default
    if who:out.append((m.start(),m.end(),GENERIC.get(who,who),'reviewed-context'))
  else:
   rule(word(name),GENERIC.get(entry,entry))
 # Hector's four horses are called by name only in his one address to them.
 if (ch,pi)==(8,17):rule(word('Lampus'),'lampus')
 # Relationships the text names without naming the person.
 if (ch,pi)==(1,54):rule(r'the Muses','muses')
 if (ch,pi)==(14,21):rule(word('Sleep'),'sleep')
 if ch==14 and pi in (19,20,21,22,23,24,26,27,29):rule(word('Sleep'),'sleep')
 if (ch,pi)==(16,47):rule(word('Sleep'),'sleep')
 if (ch,pi)==(18,3):rule(r'goddesses daughters of Nereus','sea-nymphs')
 if (ch,pi)==(18,10):rule(r'the sea-nymphs her sisters|her sea-nymph sisters','sea-nymphs')
 if (ch,pi)==(12,5):rule(r'the mountain savages','centaurs')
 if (ch,pi)==(2,59):rule(r'the shaggy mountain savages','centaurs')
 return out

def compile_package():return assemble('iliad',bind)
if __name__=='__main__':run('iliad','The Iliad',bind)
