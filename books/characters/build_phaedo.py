"""Framing speakers, prison roles, and referenced rather than present figures."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'phaedo'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 # Geographic Pillars, rather than a second appearance of the mythical hero.
 if (ch,pi)==(8,34):out=[m for m in out if m[2]!='heracles']
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==1 and pi==7:
  add('apollo-priest',r'\bpriest\b');add('fourteen',r'fourteen youths|fourteen young people')
 if ch==1 and pi==25:
  add('doorkeeper',r'\bjailer\b|prison guard')
  add('young-child',r'his child|their child')
  add('crito-people',r'Crito[’\x27]s people|Crito[’\x27]s attendants|Crito[’\x27]s servants')
 if ch==1 and pi==55 or ch==9 and pi==7:add('poison-attendant',r'\battendant\b')
 if ch==9:
  if pi in [1,5]:add('sons',r'\bchildren\b|two young sons and an (?:elder|older) one')
  if pi==5:add('women',r'women of his family')
  if pi==6:add('prison-officer',r'\bjailer\b|prison guard|servant of the Eleven')
  if pi==10:
   add('crito-servant',r'\bservant\b');add('poison-attendant',r'\bjailer\b|\bguard\b|[Tt]he man')
  if pi==11:add('poison-attendant',r'[Tt]he man who had given him the poison|[Tt]he man')
 if ch==8 and pi in [26,27,45]:add('guiding-spirit',r'\bgenius\b|guardian spirit|guiding spirit')
 if ch==7:add('weaver',r'\bweaver\b')
 return out

def compile_package():return assemble('phaedo',bind)
if __name__=='__main__':run('phaedo','Phaedo',bind)
