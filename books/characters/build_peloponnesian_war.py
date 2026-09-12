"""Reviewed bindings for the History of the Peloponnesian War.

Crawley in both editions, 26 chapters covering Thucydides's eight books, 998
paragraphs per edition. AUTHORING IS IN PROGRESS: Book 1 (chapters 1-5) is
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
 'Thucydides':({(1,0):'thucydides',(4,20):'thucydides-samos'},None),
 # The King who dethroned Croesus, and the King's son who paid for the
 # Peloponnesian navy — the second belongs to Book 2 and is not yet authored.
 'Cyrus':({(1,13):'cyrus',(1,15):'cyrus'},None),
 # Darius son of Hystaspes here; Darius son of Artaxerxes in Book 8.
 'Darius':({(1,13):'darius',(1,15):'darius'},None),
 # The tyrant, not the Arcadian commander of Book 3.
 'Hippias':({(1,19):'hippias'},None),
 # The tyrant, not his grandson the archon.
 'Pisistratus':({(1,19):'pisistratus'},None),
 # Pellichas's son commands the fleet beaten at Epidamnus; Adimantus's son
 # commands at Potidaea. Twenty-six paragraphs apart, same chapter.
 'Aristeus':({(2,4):'aristeus-pellichas',
              **{(2,i):'aristeus-adimantus' for i in [30,31,32,33]}},None),
 # Callicrates's father is a Corinthian; Calliades's son is the Athenian general
 # killed at Potidaea.
 'Callias':({(2,4):'callias-father-of-callicrates',
             (2,31):'callias-calliades',(2,32):'callias-calliades'},None),
 # The Macedonian who rode with Philip on the Athenian side, and the Spartan
 # regent of chapters 4 and 5.
 'Pausanias':({(2,31):'pausanias-macedon',
               **{(4,i):'pausanias-sparta' for i in [4,5,12,18]},
               **{(5,i):'pausanias-sparta' for i in [9,10,11,14,15,16,17,18,21]}},None),
 'Alexander':({(2,28):'alexander-macedon',(5,19):'alexander-macedon'},None),
 'Philip':({(2,28):'philip-macedon',(2,29):'philip-macedon',(2,31):'philip-macedon'},None),
 'Euthycles':({(2,21):'euthycles'},None),
 'Diotimus':({(2,20):'diotimus'},None),
 'Proteas':({(2,20):'proteas'},None),
 'Epicles':({(2,20):'epicles'},None),
 'Asopius':({(2,33):'asopius'},None),
 'Archestratus':({(2,28):'archestratus'},None),
 'Lycomedes':({(2,28):'lycomedes'},None),
 'Sthenelaidas':({(3,19):'sthenelaidas'},None),
 'Lysicles':({(4,1):'lysicles'},None),
 'Lysimachus':({(4,1):'lysimachus'},None),
 'Aristides':({(4,1):'aristides'},None),
 'Tolmides':({(4,13):'tolmides',(4,17):'tolmides'},None),
 'Tolmaeus':({(4,13):'tolmaeus',(4,17):'tolmaeus'},None),
 'Hagnon':({(4,20):'hagnon'},None),
 'Cleombrotus':({(4,4):'cleombrotus',(4,12):'cleombrotus'},None),
 'Theagenes':({(5,7):'theagenes'},None),
 'Cleomenes':({(5,7):'cleomenes'},None),
 'Gongylus':({(5,9):'gongylus'},None),
 'Artabazus':({(5,10):'artabazus',(5,15):'artabazus'},None),
 'Pharnaces':({(5,10):'pharnaces'},None),
 'Ramphias':({(5,22):'ramphias'},None),
 'Melesippus':({(5,22):'melesippus'},None),
 'Agesander':({(5,22):'agesander'},None),
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
