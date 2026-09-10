"""Exact reviewed Antigone names, roles and allusions."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'antigone'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  if e['id']=='niobe' and (ch,pi)!=(9,5):continue
  for alias in e['aliases']:
   flags=0 if e['kind'] in {'cultural-figure','mythical-group'} else re.I
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,flags):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 for m in re.finditer(r'\bGUARD\b',text):out.append((m.start(),m.end(),'guard','reviewed-speaker'))
 for m in re.finditer(r'\bMESSENGER\b',text):
  if text[max(0,m.start()-7):m.start()]!='SECOND ':out.append((m.start(),m.end(),'messenger','reviewed-speaker'))
 if (ch,pi)==(9,22):
  for pat,id in [(r'step-dame|stepmother','stepmother'),(r'step-sons twain|two stepsons','phineus-sons')]:
   for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-choral-allusion'))
 if (ch,pi)==(9,23):
  for m in re.finditer(r"their mother[’']s",text):out.append((m.start(),m.end(),'cleopatra','reviewed-choral-allusion'))
 return out
def compile_package():return assemble('antigone',bind)
if __name__=='__main__':run('antigone','Antigone',bind)
