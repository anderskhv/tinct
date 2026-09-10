"""Book-specific reviewed Apology aliases and contextual references."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'apology'
def bind(edition,ch,pi,text,entities):
 candidates=[]
 for e in entities:
  if e['id']=='chaerephon-brother' and (ch,pi)!=(1,9):continue
  for alias in e['aliases']:
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text):candidates.append((m.start(),m.end(),e['id'],'reviewed-name'))
 # A descriptive reference to Achilles includes his mother's name; retain
 # the separately selectable Thetis rather than assigning an overlapping span.
 if (ch,pi) in {(1,74),(3,7)}:
  for m in re.finditer(r'\b(?:three sons|my sons|sons)\b',text):candidates.append((m.start(),m.end(),'children','reviewed-family'))
 return candidates
def compile_package():return assemble('apology',bind)
if __name__=='__main__':run('apology','Apology',bind)
