"""Reviewed bindings for the Histories.

Nine books, 1,525 sections, 1,626 paragraphs per edition, aligned paragraph for
paragraph. AUTHORING IS IN PROGRESS: Book 1 (sections 1-215) is authored.

Herodotus reuses names across generations and empires, so most of the work here
is position tables rather than aliases. In Book 1 alone there are two men called
Atys, two called Lycurgus and two called Cambyses, and the Alexander who carries
off Helen is not the Alexander who will rule Macedon in Book 5.

Names that belong to a person Herodotus has not yet been authored for are left
unbound rather than defaulted to the Book 1 man of the same name. That is why
the tables below have no defaults.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'the-histories'

# name -> ({(section, paragraph): id}, default or None)
SPLIT={
 # The Athenian faction leader, then the Spartan lawgiver, six sections apart.
 'Lycurg(?:us|os)':({(58,0):'lycurgus-athenian',(59,0):'lycurgus-athenian',
              (64,0):'lycurgus-spartan',(64,1):'lycurgus-spartan',
              (65,0):'lycurgus-spartan'},None),
 # Croesus's son, and the ancient king from whom the Lydians are named.
 'Atys':    ({(7,0):'atys-son-of-manes',(93,0):'atys-son-of-manes',
              (34,0):'atys-son-of-croesus'},None),
 # Cyrus's father everywhere in Book 1 except the handover at the end, where
 # it is Cyrus's son.
 'Cambyses':({(45,0):'cambyses-i',(72,0):'cambyses-i',(106,0):'cambyses-i',
              (107,0):'cambyses-i',(110,0):'cambyses-i',(121,0):'cambyses-i',
              (123,0):'cambyses-i',(206,0):'cambyses-i',
              (207,0):'cambyses-ii'},None),
 # The Mede whose son the boy Cyrus whipped. A different Artembares appears in
 # the last section of Book 9 and is not yet authored.
 'Artembares':({(113,0):'artembares-mede',(114,0):'artembares-mede',
                (115,0):'artembares-mede'},None),
 # The Spartan king of Croesus's day.
 'Ariston': ({(66,0):'ariston-spartan'},None),
 # Leon king of Sparta, Leonidas's grandfather. The Leon sacrificed by the
 # Persians in Book 8 is a different man and is not yet authored.
 'Leon':    ({(64,0):'leon',(800,0):'leon',(1226,0):'leon'},None),
 # Agron's grandfather. The Ninos who fathered Sardanapallos is another man.
 'Nin(?:us|os)':({(7,0):'ninus'},None),
 # Bias of Priene. The Bias of Book 9 is Melampus's brother at Argos.
 'Bias':    ({(27,0):'bias',(169,0):'bias'},None),
 # Book 2. The king Moeris, not the lake that carries his name; the lake is a
 # place and is not cast.
 'Mo(?:e|i)ris':({(221,0):'moeris-king',(228,0):'moeris-king',
                 (316,0):'moeris-king'},None),
 # Paris again, in Egypt with Helen and the stolen goods.
 'Alexander':({(3,0):'alexander-paris',(327,0):'alexander-paris',
               (328,0):'alexander-paris',(329,0):'alexander-paris',
               (330,0):'alexander-paris',(331,0):'alexander-paris',
               (332,0):'alexander-paris',(333,0):'alexander-paris',
               (334,0):'alexander-paris',(335,0):'alexander-paris'},None),
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default)
  if entry is None:continue
  for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 return out

def compile_package():return assemble('the-histories',bind)
if __name__=='__main__':run('the-histories','The Histories',bind)
