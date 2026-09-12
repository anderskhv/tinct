"""Reviewed bindings for the History of the Peloponnesian War.

Crawley in both editions, 26 chapters covering Thucydides's eight books, 998
paragraphs per edition. AUTHORING IS IN PROGRESS: Books 1-5 (chapters 1-17) are
authored.

The two editions share almost all their transliterations, so unlike most of this
library the work here is not spelling variants but namesakes, of which Thucydides
has a great many: two men called Aristeus inside one chapter, two called Callias
in the same paragraph-range, a Macedonian Pausanias four paragraphs from the
Spartan regent, a Cyrus who is the King's son and not the King, two kings called
Darius, a Hippias who is an Arcadian commander and not the tyrant, and a
Pisistratus who is the tyrant's grandson.

Names that belong to a person this pass has not authored are left unbound rather
than defaulted to the Book 1 man of the same name. That is why the person tables
below have no defaults. The nations are bound throughout, by alias, because a
people is the same people in every book.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'peloponnesian-war'

# name -> ({(chapter, paragraph): id}, default or None)
SPLIT={
 # The author names himself in the first sentence; the Thucydides at Samos is
 # given no patronymic and is never said to be him.
 'Thucydides':({(1,0):'thucydides',(7,25):'thucydides',(8,33):'thucydides',
                (9,24):'thucydides',(11,1):'thucydides',(11,34):'thucydides',
                **{k:'thucydides' for k in [(13,9),(14,30),(14,31),(14,32),
                   (14,33),(14,70),(16,1)]},
                (4,20):'thucydides-samos'},None),
 # The King who dethroned Croesus, and the King's son who paid for the
 # Peloponnesian navy — the second belongs to Book 2 and is not yet authored.
 'Cyrus':({(1,13):'cyrus',(1,15):'cyrus'},None),
 # Darius son of Hystaspes here; Darius son of Artaxerxes in Book 8.
 'Darius':({(1,13):'darius',(1,15):'darius',(14,28):'darius'},None),
 # The tyrant, not the Arcadian commander of Book 3.
 'Hippias':({(1,19):'hippias',(9,33):'hippias-arcadia'},None),
 # The tyrant, not his grandson the archon.
 'Pisistratus':({(1,19):'pisistratus',(11,18):'pisistratus'},None),
 # Pellichas's son commands the fleet beaten at Epidamnus; Adimantus's son
 # commands at Potidaea. Twenty-six paragraphs apart, same chapter.
 'Aristeus':({(2,4):'aristeus-pellichas',
              **{(2,i):'aristeus-adimantus' for i in [30,31,32,33]},
              (7,22):'aristeus-adimantus',
              (14,67):'aristeus-lacedaemon'},None),
 # Callicrates's father is a Corinthian; Calliades's son is the Athenian general
 # killed at Potidaea.
 'Callias':({(2,4):'callias-father-of-callicrates',
             (2,31):'callias-calliades',(2,32):'callias-calliades',
             (11,4):'callias-father-of-hipponicus'},None),
 # The Macedonian who rode with Philip on the Athenian side, and the Spartan
 # regent of chapters 4 and 5.
 'Pausanias':({(2,31):'pausanias-macedon',
               **{(4,i):'pausanias-sparta' for i in [4,5,12,18]},
               **{(5,i):'pausanias-sparta' for i in [9,10,11,14,15,16,17,18,21]},
               (6,23):'pausanias-sparta',(8,0):'pausanias-sparta',(8,1):'pausanias-sparta',
               (10,3):'pausanias-sparta',(10,7):'pausanias-sparta',(10,18):'pausanias-sparta',
               (15,14):'pausanias-sparta',(16,8):'pausanias-sparta',
               (9,25):'pausanias-king'},None),
 'Alexander':({(2,28):'alexander-macedon',(5,19):'alexander-macedon',
               (6,31):'alexander-macedon',(8,24):'alexander-macedon',(8,28):'alexander-macedon'},None),
 'Philip':({(2,28):'philip-macedon',(2,29):'philip-macedon',(2,31):'philip-macedon',
            (8,24):'philip-macedon',(8,29):'philip-macedon'},None),
 'Euthycles':({(2,21):'euthycles',(11,32):'euthycles'},None),
 'Diotimus':({(2,20):'diotimus'},None),
 'Proteas':({(2,20):'proteas',(6,25):'proteas'},None),
 'Epicles':({(2,20):'epicles',(6,25):'epicles'},None),
 'Asopius':({(2,33):'asopius',(9,6):'asopius-son-of-phormio'},None),
 'Archestratus':({(2,28):'archestratus'},None),
 # Archestratus's father, and the father of the general at Melos.
 'Lycomedes':({(2,28):'lycomedes',
                (17,0):'lycomedes-father-of-cleomedes'},None),
 'Sthenelaidas':({(3,19):'sthenelaidas'},None),
 'Lysicles':({(4,1):'lysicles',(9,18):'lysicles-general'},None),
 'Lysimachus':({(4,1):'lysimachus'},None),
 'Aristides':({(4,1):'aristides',
               (13,8):'aristides-archippus',(14,0):'aristides-archippus',
               (15,20):'aristides'},None),
 'Tolmides':({(4,13):'tolmides',(4,17):'tolmides',(9,19):'tolmides-soothsayer'},None),
 'Tolmaeus':({(4,13):'tolmaeus',(4,17):'tolmaeus',
              (13,11):'tolmaeus-father-of-autocles',
              (14,54):'tolmaeus-father-of-autocles'},None),
 'Hagnon':({(4,20):'hagnon',(7,13):'hagnon',(8,24):'hagnon',
            (14,28):'hagnon',(15,9):'hagnon',(15,26):'hagnon',
            (15,35):'hagnon'},None),
 'Cleombrotus':({(4,4):'cleombrotus',(4,12):'cleombrotus',(8,0):'cleombrotus'},None),
 'Theagenes':({(5,7):'theagenes',(12,34):'theagenes-athens',
               (15,26):'theagenes-athens',(15,35):'theagenes-athens'},None),
 'Cleomenes':({(5,7):'cleomenes',(9,25):'cleomenes-commander'},None),
 'Gongylus':({(5,9):'gongylus'},None),
 'Artabazus':({(5,10):'artabazus',(5,15):'artabazus'},None),
 # Artabazus's father, and the satrap who housed the expelled Delians.
 'Pharnaces':({(5,10):'pharnaces',(15,0):'pharnaces-satrap'},None),
 # One card for the envoy of Book 1 and the commander of Book 5, who are
 # given no patronymic either time; Clearchus's father stays unbound.
 'Ramphias':({(5,22):'ramphias',(15,10):'ramphias',(15,11):'ramphias',
              (15,12):'ramphias'},None),
 'Melesippus':({(5,22):'melesippus',(6,11):'melesippus',(6,12):'melesippus'},None),
 'Agesander':({(5,22):'agesander'},None),
 # ------------------------------------------------- Book 2 (chapters 6-8)
 # The priestess of Hera at Argos by whose year of office the war is dated, and
 # a Corinthian commander's father.
 'Chrysis':({(6,1):'chrysis-argos',(6,33):'chrysis-father-of-eumachus',
             (14,68):'chrysis-argos'},None),
 # The archon of the year the war began; a different Pythodorus commands in
 # Book 3.
 'Pythodorus':({(6,1):'pythodorus',(11,33):'pythodorus-isolochus',
                (12,1):'pythodorus-isolochus',
                (13,23):'pythodorus-isolochus',
                (15,26):'pythodorus-signatory',
                (15,35):'pythodorus-signatory'},None),
 'Tellis':({(6,27):'tellis',(10,19):'tellis',(13,28):'tellis',
            (15,26):'tellis-signatory',(15,35):'tellis-signatory'},None),
 # Cleopompus's father, not Alcibiades's.
 'Clinias':({(6,28):'clinias',(7,13):'clinias',
             (16,19):'clinias-father-of-alcibiades',
             (16,38):'clinias-father-of-alcibiades'},None),
 # The tyrant of Astacus, not the Catanaean of Book 6.
 'Evarchus':({(6,32):'evarchus',(6,33):'evarchus'},None),
 'Euphamidas':({(6,33):'euphamidas',(14,54):'euphamidas',
                (16,41):'euphamidas'},None),
 'Aristonymus':({(6,33):'aristonymus',(14,54):'aristonymus',
                 (14,57):'aristonymus-athens'},None),
 # Timoxenus's father is a Corinthian; the commissioner who killed himself off
 # Naupactus is a Lacedaemonian.
 'Timocrates':({(6,33):'timocrates-corinth',
                (8,14):'timocrates-sparta',(8,21):'timocrates-sparta',
                (11,24):'timocrates-father-of-aristotle',
                (15,26):'timocrates-athens',(15,35):'timocrates-athens'},None),
 # Hagnon's father, and the Cretan of Gortys. Neither is the Nicias son of
 # Niceratus who fills the later books, and who is not yet authored.
 'Nicias':({(7,13):'nicias-father-of-hagnon',(8,14):'nicias-gortys',
            (14,28):'nicias-father-of-hagnon',
            **{k:'nicias-niceratus' for k in [(10,0),(11,4),(12,34),(12,35),
               (13,0),(13,11),(13,12),(14,54),(14,64),(14,65),(14,67),
               (15,14),(15,26),(15,35),(16,19),(16,21),(16,22),(16,81)]}},None),
 'Timagoras':({(7,22):'timagoras-tegea'},None),
 'Pharnabazus':({(7,22):'pharnabazus'},None),
 # Learchus's father and Phanomachus's father, three paragraphs apart.
 'Callimachus':({(7,22):'callimachus-father-of-learchus',
                 (7,25):'callimachus-father-of-phanomachus'},None),
 'Lycophron':({(8,14):'lycophron',
               (13,1):'lycophron-corinth',(13,2):'lycophron-corinth'},None),

 # ------------------------------------------------ Book 3 (chapters 9-11)
 # Thucles's son, the general. The Eurymedon of Book 1 is a river in Pamphylia
 # and carries no card; the Thucles of Book 6 founded Naxos in Sicily.
 'Eurymedon':({(10,30):'eurymedon',(10,31):'eurymedon',(10,35):'eurymedon',
               (11,4):'eurymedon',(11,33):'eurymedon',
               **{k:'eurymedon' for k in [(12,1),(12,2),(12,7),(13,4),
                  (13,23)]}},None),
 'Thucles':({(10,30):'thucles',(11,4):'thucles',(11,33):'thucles'},None),
 # Demosthenes's colleague, not the Spartan of the peace of Book 5.
 'Procles':({(11,4):'procles',(11,12):'procles',
             (15,26):'procles-signatory',(15,35):'procles-signatory'},None),
 # One of the three founders of Heraclea; the Leons of the later books are other
 # men.
 'Leon':({(11,5):'leon-heraclea',
          (15,26):'leon-athens',(15,35):'leon-athens',
          (16,21):'leon-sparta'},None),
 # The Rhodian athlete; a Dorieus commands in Book 8.
 'Dorieus':({(9,7):'dorieus'},None),
 # The Locrians of Italy, allies of Syracuse, against the Ozolian and Opuntian
 # Locrians of Greece.
 'Locrians':({k:'locrians-italy' for k in [(10,36),(11,13),(11,17),(11,33),
                                            (12,0),(12,30),(12,31),(12,32),
                                            (15,3)]},'locrians'),
 # The singular carries no default: the Opuntian and Ozolian coasts of Greece and
 # the Locrian fort in Italy are all called Locrian.
 'Locrian':({(11,2):'locrians',(11,4):'locrians',(11,11):'locrians',
             (11,33):'locrians-italy',(12,0):'locrians-italy',
             (15,3):'locrians-italy'},None),

 # ----------------------------------------------- Book 4 (chapters 12-14)
 # The Camarinaean traitor, not the Corinthian who founded Syracuse.
 'Archias':({(12,32):'archias-camarina'},None),
 # Ariphron's son, who took the long walls of Megara and died at Delium. The
 # tyrant of Gela and the Lacedaemonian of Book 8 are other men.
 'Hippocrates':({k:'hippocrates-ariphron' for k in [(13,24),(13,25),(14,1),
                 (14,2),(14,13),(14,14),(14,17),(14,18),(14,20),(14,25)]},None),
 # Hermocrates's father; the Hermon of Book 8 commands the Peripoli at Munychia.
 'Hermon':({(13,16):'hermon'},None),
 # Nicostratus's father. The Diitrephes who takes the Thracians home in Books 7
 # and 8 is not said to be the same man, and carries no card yet.
 'Diitrephes':({(10,25):'diitrephes',(14,54):'diitrephes',
                (14,64):'diitrephes'},None),
 # The Athenian general at Amphipolis, not the Syracusan elected in Book 6.
 'Eucles':({(14,30):'eucles'},None),
 # Pasitelidas's father, not the Thespian commander of Book 7.
 'Hegesander':({(14,67):'hegesander'},None),
 # Boeotian Orchomenus at Delium; the Orchomenians of Book 5 are Arcadians.
 'Orchomenians':({(14,17):'orchomenians-boeotia',
                  (16,47):'orchomenians-arcadia',
                  (16,64):'orchomenians-arcadia'},None),
 # Of Thrace here; the Chalcidian race in Sicily is a different people, and the
 # Chalcidians of Books 6 and 7 are theirs, so neither form takes a default.
 'Chalcidians':({k:'chalcidians' for k in [(2,28),(2,29),(2,32),(2,33),(6,31),
                 (7,13),(8,8),(8,24),(8,28),(8,31),(12,6),(14,4),(14,5),(14,8),
                 (14,29),(14,59),(15,1),(15,28),(16,6),(16,79),(16,80),
                 (16,81)]},None),
 'Chalcidian':({**{k:'chalcidians' for k in [(8,8),(8,24),(14,3),(14,7),
                  (14,35),(14,40),(14,58),(15,4),(15,8)]},
                **{k:'chalcidians-sicily' for k in [(10,36),(12,32),(13,19),
                  (13,22)]}},None),

 # ----------------------------------------------- Book 5 (chapters 15-17)
 # A Lacedaemonian signatory of the Peace of Nicias who shares his name with
 # the Andrian colony of Book 4; the town carries no card.
 'Acanthus':({(15,26):'acanthus-signatory',(15,35):'acanthus-signatory'},None),
 # Pleistoanax's brother, and the polemarch who would not move his company at
 # Mantinea.
 'Aristocles':({(15,14):'aristocles-brother-of-pleistoanax',
                (16,56):'aristocles-polemarch',
                (16,57):'aristocles-polemarch'},None),
 # The ephor who kept the Boeotian alliance, and Cnidis's son killed at
 # Heraclea. The history does not say whether they are the same man.
 'Xenares':({(16,11):'xenares',(16,12):'xenares',(16,13):'xenares',
             (16,22):'xenares',(16,37):'xenares-cnidis'},None),
 # Three Athenian signatories whose namesakes command in books not yet
 # authored: no patronymic is given in either list, so the later men are left
 # unbound rather than identified with them.
 'Euthydemus':({(15,26):'euthydemus-signatory',
                (15,35):'euthydemus-signatory'},None),
 'Thrasycles':({(15,26):'thrasycles-signatory',
                (15,35):'thrasycles-signatory'},None),
 'Aristocrates':({(15,26):'aristocrates-signatory',
                  (15,35):'aristocrates-signatory'},None),

 # Adjectival forms of two peoples, bound by default rather than by alias. The
 # Hellenic sea is water and is excluded by lookahead (the older translation
 # lowercases the noun, the modern one capitalises it); the Peloponnesian War is
 # not excluded, because a war named after a people is that people, which is how
 # the Median War is bound in the Histories package.
 r'Hellenic(?!\s+[Ss]ea)':({}, 'hellenes'),
 r'Peloponnesian':({}, 'peloponnesians'),
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
 return out

def compile_package():return assemble('peloponnesian-war',bind)
if __name__=='__main__':run('peloponnesian-war','History of the Peloponnesian War',bind)
