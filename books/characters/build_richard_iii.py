"""Reviewed royal namesakes for Richard III.

No play in the canon repeats its names harder. "Edward" is five different men,
"Richard" four, "George" three things and "York" four. None of the four is bound
by a global alias: each occurrence is assigned by paragraph and by its position
within the paragraph, from a table reviewed line by line against the speech.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'richard-iii'

# Every bare "Edward" in the play, keyed by paragraph, listing the entity for each
# zero-based occurrence in that paragraph. E4 = King Edward the Fourth; PRINCE =
# his elder son; LANC = Henry the Sixth's son, Lady Anne's husband.
E4,PRINCE,LANC='edward-iv','prince-edward','edward-lancaster'
EDWARD={(5,1):[E4],(5,4):[E4],(5,7):[E4],(5,9):[E4],(5,13):[E4],(5,16):[E4],(5,20):[E4],
 (5,26):[E4],(5,30):[E4],(5,34):[E4],(5,36):[E4],(5,38):[E4],(23,52):[LANC],
 (1,1):[E4,E4],(1,20):[E4],(1,38):[E4,E4],(2,1):[LANC],(2,27):[E4],(2,43):[LANC],
 (2,69):[E4],(2,73):[LANC],(2,103):[LANC,LANC],(3,46):[LANC],(3,56):[E4,E4,E4],
 (3,78):[LANC,PRINCE,LANC],(4,10):[E4],(4,79):[E4],(4,83):[E4],(5,0):[E4],(5,40):[E4],
 (6,17):[E4],(6,18):[E4],(6,21):[E4],(6,23):[E4],(6,24):[E4],(6,29):[E4,E4],
 (6,31):[E4,PRINCE],(7,8):[E4],(9,0):[PRINCE],(9,77):[PRINCE],(12,30):[E4],
 (13,25):[E4,E4,E4],(15,3):[E4],(15,20):[E4],(15,39):[PRINCE,E4,PRINCE],
 (17,7):[PRINCE],(17,11):[PRINCE],(17,13):[PRINCE],(18,13):[E4],(19,8):[PRINCE],
 (19,11):[PRINCE,LANC],(19,23):[LANC,PRINCE],(19,27):[E4,LANC,PRINCE,LANC,LANC],
 (19,66):[E4],(19,72):[E4,E4],(19,104):[PRINCE],(19,201):['edward-courtney'],
 (21,3):[E4,LANC],(21,5):[E4],(23,51):[LANC,LANC],(23,97):[E4]}
# Every bare "Richard". R3 is Richard of Gloucester; the exceptions are the boy
# duke, Richard's own father, and King Richard the Second at Pomfret.
R3,YB,RY='richard-iii','york-boy','richard-york-father'
RICHARD={(9,41):[YB],(11,0):['ratcliffe'],(11,1):['ratcliffe'],(11,5):['richard-ii'],
 (19,23):[R3,R3,R3,YB,R3],(19,24):[RY]}
# Every "York": the boy duke, the Duchess, the brothers' father, the Archbishop,
# and the royal house itself.
DUC,ARCH,HOUSE='duchess','archbishop','house-of-york'
YORK={(1,1):[HOUSE],(2,69):[RY],(3,78):[RY],(4,4):[HOUSE],(4,87):[RY],(6,0):[DUC],
 (8,0):[ARCH,YB,DUC],(8,3):[YB],(8,11):[YB],(8,13):[YB],(9,9):[YB],(9,13):[YB],
 (9,14):[YB],(9,15):[YB],(9,39):[YB],(9,40):[YB],(9,41):[YB],(9,44):[YB],(9,65):[YB],
 (9,77):[YB],(9,78):[YB],(13,25):[RY],(16,0):[DUC],(16,7):[YB],(16,17):[DUC],
 (19,3):[DUC],(19,27):[YB],(19,29):[RY],(19,104):[YB],(19,187):[HOUSE,HOUSE],
 (23,70):[HOUSE],(25,7):[HOUSE]}
# "George" is Clarence, Stanley's son, and the Garter badge of Saint George.
CL,GS,SG='clarence','george-stanley','saint-george'
GEORGE={(1,6):[CL],(1,8):[CL],(1,38):[CL],(19,133):[SG],(19,136):[SG],(19,197):[GS],
 (20,1):[GS,GS],(23,32):[GS],(23,45):[GS],(23,133):[SG],(23,149):[SG],(23,163):[GS],
 (23,164):[GS],(23,165):[SG],(25,3):[GS]}
# "Plantagenet" singular. The plural at 2:43 is the family and is bound as a group.
PLANT={(2,57):[R3],(4,80):[LANC],(15,31):[R3],(16,1):['girl'],(19,8):[PRINCE],
 (19,10):[PRINCE,LANC],(19,44):['edward-clarence']}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 def table(word,tab,default=None):
  # Both settings print these names, but the modern uppercases them inside stage
  # directions where the original keeps title case. Matching both forms keeps the
  # occurrence numbering identical in the two files, which is what the tables index.
  ids=tab.get((ch,pi),[])
  if not ids and default is None:return
  for i,mo in enumerate(re.finditer(r'(?<![A-Za-z0-9])(?:'+word+'|'+word.upper()+r')(?![A-Za-z0-9])',text)):
   who=ids[i] if i<len(ids) else default
   if who:out.append((mo.start(),mo.end(),who,'reviewed-context'))
 add(r'Julius C(?:æ|ae)sar','julius-caesar')
 if (ch,pi)==(19,44):add(r'(?<![A-Za-z0-9])Ned(?![A-Za-z0-9])','edward-clarence')
 # Every occurrence of the five repeated names is assigned from its table. Richard
 # and York have a default because one man holds nearly all of theirs; Edward,
 # George and Plantagenet have none, so a paragraph missing from the table leaves
 # its name unbound rather than guessed at, and the coverage tests catch it.
 for word,tab,default in [('Edward',EDWARD,None),('Richard',RICHARD,'richard-iii'),
                          ('York',YORK,'york-boy'),('George',GEORGE,None),('Plantagenet',PLANT,None)]:
  table(word,tab,default)
 # Rivers' own name, and the Queen under the name she had by her first husband.
 # "My Lady Grey" is Queen Elizabeth, not either of the Lord Greys at court.
 if (ch,pi)==(1,9):add(r'Antony Woodville','rivers');add(r'Lady Grey','queen-elizabeth')
 # Courtney's brother is named only by his see.
 if (ch,pi)==(19,201):add(r'Bishop of Exeter','bishop-exeter')
 return out

def compile_package():return assemble('richard-iii',bind)
if __name__=='__main__':run('richard-iii','Richard III',bind)
