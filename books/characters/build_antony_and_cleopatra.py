"""Reviewed Caesars, Pompeys and the two Ptolemys for Antony and Cleopatra.

Both settings print plain capital speech cues, but the modern also uppercases
names inside stage directions where the original keeps title case, so every
person carries both forms as aliases. The real work is the bare imperial and
Pompeian names: "Caesar" means the living Octavius in all but eleven of its occurrences, and
"Pompey" means Sextus in all but three.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'antony-and-cleopatra'
# Bare "Caesar" occurrences that mean Julius, listed as zero-based occurrence
# indexes within their paragraph. Every other bare occurrence is Octavius.
# Reviewed one at a time against the speech each stands in.
JULIUS={(5,15):[0],(5,26):[0],(5,27):[0],(5,29):[0],(5,30):[0],(7,86):[0],
        (11,3):[0],(11,31):[0],(19,19):[0],(25,62):[0],(14,40):[0]}
# Bare "Pompey" occurrences that mean Pompey the Great rather than his son Sextus.
GREAT={(2,106):[1],(5,15):[0],(19,19):[0]}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 def indexed(pat,exceptions,default,other):
  for i,mo in enumerate(re.finditer(pat,text)):
   out.append((mo.start(),mo.end(),other if i in exceptions else default,'reviewed-context'))
 # Unlike Cymbeline, both settings of this play spell the name "Caesar" plainly.
 caesar='Caesar'
 # "Julius Caesar" and "Octavius Caesar" are longer spans and take precedence.
 add(r'Julius '+caesar,'julius-caesar')
 indexed(r'(?<![A-Za-z0-9])'+caesar+r'(?![A-Za-z0-9])',JULIUS.get((ch,pi),[]),'octavius','julius-caesar')
 indexed(r'(?<![A-Za-z0-9])Pompey(?![A-Za-z0-9])',GREAT.get((ch,pi),[]),'sextus','pompey-great')
 # Two men named Ptolemy: Cleopatra's dead brother-husband, and the son who is
 # given Syria at the enthronement.
 if (ch,pi) in [(4,1),(4,3)]:add(r'Ptolemy','ptolemy-king')
 if (ch,pi)==(18,3):add(r'Ptolemy','ptolemy-son');add(r'Alexander','alexander-helios')
 # Antony's brother and Octavius's adoptive father are named only by relation.
 if (ch,pi)==(2,60):add(r'(?<=my brother )Lucius','lucius-antonius')
 if (ch,pi)==(25,44):add(r'(?<=[’\x27]s )father','julius-caesar')
 if (ch,pi)==(11,41):add(r'(?<=Thy )father|(?<=Your )father','pompey-great')
 # "The guard" as a body of men. "Court of guard" is a watch-post and "good guard
 # for itself" is abstract; neither is a group of people and neither is bound.
 add(r'(?<!court of )(?<!good )(?<![A-Za-z0-9])[Gg]uard(?![A-Za-z0-9])(?!\s+for itself)','guards')
 # The two men killed at Philippi, named in Pompey's reproach and Enobarbus's report.
 if (ch,pi)==(11,3):add(r'(?<![A-Za-z0-9])Brutus(?![A-Za-z0-9])','brutus');add(r'(?<![A-Za-z0-9])Cassius(?![A-Za-z0-9])','cassius')
 return out

def compile_package():return assemble('antony-and-cleopatra',bind)
if __name__=='__main__':run('antony-and-cleopatra','Antony and Cleopatra',bind)
