"""Exact bindings reviewed against the complete Crito dialogue."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble, main as run
BASE=Path(__file__).resolve().parent/'crito'
def bind(edition,ch,pi,text,entities):
 candidates=[]
 for e in entities:
  for alias in e['aliases']:
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,re.I):candidates.append((m.start(),m.end(),e['id'],'reviewed-name'))
 patterns=[]
 if (ch,pi)==(1,4):patterns.append((r'keeper of the prison|prison keeper','keeper'))
 if (ch,pi)==(1,22):patterns.append((r'\bwoman\b','dream-woman'))
 if (ch,pi)==(2,6):patterns.append((r'\byour own children\b','children'))
 if ch==3:
  if edition=='modern-en':patterns.append((r'\bLaws\b','laws'))
  else:
   if pi==0:patterns.append((r'\blaws\b','laws'))
   if pi==2:patterns.extend([(r'\bthe law\b','laws'),(r'\bDo the laws\b','laws')])
   if pi==4:patterns.extend([(r'\bThen the laws\b','laws'),(r'\bus laws\b','laws'),(r'\bus the laws\b','laws')])
 for pat,id in patterns:
  for m in re.finditer(pat,text):candidates.append((m.start(),m.end(),id,'reviewed-context'))
 return candidates
def compile_package():return assemble('crito',bind)
if __name__=='__main__':run('crito','Crito',bind)
