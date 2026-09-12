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
 # BOOK 4. The royal house of Cyrene, where the oracle itself says there will
 # be "four named Battus and four named Arcesilaus". The founder, his grandson
 # the Fortunate, and his great-great-grandson the Lame are three men; so are
 # the three Arcesilauses. Where the name stands for the dynasty rather than a
 # man — the oracle at 719, the spared kinsmen at 758 — it goes to the house.
 'Batt(?:us|os)':({(706,0):'battus-i',(709,0):'battus-i',(710,0):'battus-i',(711,0):'battus-i',(711,1):'battus-i',(711,2):'battus-i',(712,0):'battus-i',(713,2):'battus-i',
              (715,0):['battus-i','battus-ii'],
              (716,0):'battus-ii',
              (717,0):'battus-iii',(718,0):'battus-iii',(761,0):'battus-iii',
              (719,0):'battiadae',(758,0):'battiadae'},None),
 'Ar(?:cesilaus|kesilaos)':({(715,0):'arcesilaus-i',
              (716,0):'arcesilaus-ii',(717,0):'arcesilaus-ii',
              (718,0):'arcesilaus-iii',(720,0):'arcesilaus-iii',
              (721,0):'arcesilaus-iii',(723,0):'arcesilaus-iii',
              (756,0):'arcesilaus-iii',(758,0):'arcesilaus-iii'},None),
 # Two kings called Etearchus: the Ammonian of Book 2, and the Cretan of Oaxus
 # who swore his own daughter away.
 'Etearch(?:us|os)':({(247,0):'etearchus',(248,0):'etearchus',
                      (710,0):'etearchus-oaxos'},None),
 # Anacharsis the Scythian, killed by his brother the king; Book 10 of the
 # Republic's Anacharsis is the same man but belongs to another book entirely.
 'Anacharsis':({(602,0):'anacharsis-scythian',(632,0):'anacharsis-scythian',
                (633,0):'anacharsis-scythian'},None),
 # Pythagoras named only as the master Salmoxis is supposed to have served.
 'Pythagoras':({(651,0):'pythagoras-samos'},None),
 # Two men called Archias in one paragraph: the Lacedaemonian who died inside
 # Samos, and his grandson of the same name, whom Herodotus met at Pitane. Only
 # the fourth occurrence is the grandson.
 'Archias':({(452,0):['archias-samos','archias-samos','archias-samos',
                      'archias-grandson','archias-samos','archias-samos']},None),
 # BOOK 3. The impostor is never given the name Smerdis in narration — every
 # literal "Smerdis" in the text is Cyrus's son — so he is bound on the word
 # "Magian", which the caste of the same name also answers to. Position
 # separates the three: the usurper (singular, Book 3 and the four later
 # backward glances), the two brothers (plural, Book 3), and the priestly caste
 # (everywhere else).
 'Magian': ({(458,0):'smerdis-the-magian',(459,0):'smerdis-the-magian',(460,0):'smerdis-the-magian',(461,0):'smerdis-the-magian',(462,0):'smerdis-the-magian',(464,0):'smerdis-the-magian',(465,0):'smerdis-the-magian',(466,0):'smerdis-the-magian',(468,0):'smerdis-the-magian',(470,0):'smerdis-the-magian',(475,0):'smerdis-the-magian',(476,0):'magians',(477,0):'smerdis-the-magian',(485,0):'smerdis-the-magian',(515,0):'smerdis-the-magian',(537,0):'smerdis-the-magian',(547,0):'smerdis-the-magian',(550,0):'smerdis-the-magian',(106,0):'magians',(107,0):'magians',(127,0):'magians',(131,0):'magians',(688,0):'magians'},None),
 'Magians':({(458,0):'magian-brothers',(460,0):'magian-brothers',(462,0):'magian-brothers',(463,0):'magian-brothers',(471,0):'magian-brothers',(472,0):'magian-brothers',(473,0):'magian-brothers',(475,0):'magian-brothers',(476,0):'magian-brothers',(477,0):'magian-brothers',(523,0):'magian-brothers',(100,0):'magians',(119,0):'magians',(139,0):'magians',(1045,0):'magians',(1062,0):'magians',(1067,0):'magians',(1135,0):'magians',(1213,0):'magians'},None),
 'Alexander':({(3,0):'alexander-paris',(327,0):'alexander-paris',
               (328,0):'alexander-paris',(329,0):'alexander-paris',
               (330,0):'alexander-paris',(331,0):'alexander-paris',
               (332,0):'alexander-paris',(333,0):'alexander-paris',
               (334,0):'alexander-paris',(335,0):'alexander-paris'},None),
}

# Section 476 mixes the two usurpers with the caste being massacred, and the two
# translations distribute the plural differently inside the paragraph, so this
# one paragraph needs a list per edition.
EDITION_SPLIT={
 ('modern-en','Ar(?:cesilaus|kesilaos)'):{(719,0):['arcesilaus-iii','battiadae']},
 ('original-en','Ar(?:cesilaus|kesilaos)'):{(719,0):['arcesilaus-iii','arcesilaus-iii','battiadae']},
 ('modern-en','Magians'):{(476,0):['magian-brothers','magian-brothers','magian-brothers',
                                   'magians','magians']},
 ('original-en','Magians'):{(476,0):['magian-brothers','magian-brothers','magians',
                                     'magian-brothers','magians','magians','magians']},
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=EDITION_SPLIT.get((edition,name),{}).get((ch,pi))
  if entry is None:entry=table.get((ch,pi),default)
  if entry is None:continue
  if isinstance(entry,list):
   # one id per occurrence, in order; None skips that occurrence
   for i,m in enumerate(re.finditer(word(name),text)):
    who=entry[i] if i<len(entry) else None
    if who:out.append((m.start(),m.end(),who,'reviewed-context'))
  else:
   for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 return out

def compile_package():return assemble('the-histories',bind)
if __name__=='__main__':run('the-histories','The Histories',bind)
