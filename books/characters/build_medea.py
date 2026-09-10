"""Review-scoped Medea aliases; chorus labels and children stay distinct."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'medea'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   flags=0 if e['kind']=='cultural-figure' or alias.isupper() else re.I
   if e['id']=='helios' and (ch,pi) not in {(3,24),(4,71),(6,12),(7,10),(7,30)}:continue
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,flags):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 if (ch,pi)==(1,1):
  for m in re.finditer(r"Creon['’]s (child|daughter)",text):out.append((m.start(1),m.end(1),'bride','reviewed-princess'))
  for m in re.finditer(r'daughters of King Pelias',text):out.append((m.start(),m.start()+len('daughters'),'peliads','reviewed-family'))
 if (ch,pi)==(7,6):
  for m in re.finditer(r'(?:woman old|old grey woman)',text):out.append((m.start(),m.end(),'old-handmaid','reviewed-attendant'))
 return out
def compile_package():return assemble('medea',bind)
if __name__=='__main__':run('medea','Medea',bind)
