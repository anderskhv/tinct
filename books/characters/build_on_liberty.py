"""The crucified God/Almighty passages refer to Christ; generic God stays separate."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'on-liberty'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if (ch,pi)==(2,13):out=[(a,b,'jesus' if id=='god' and text[max(0,a-10):a].endswith('crucified ') else id,how) for a,b,id,how in out]
 pat={(2,12):r'Almighty',(2,36):r'\bMaster\b'}.get((ch,pi))
 if pat:
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),'jesus','reviewed-religious-context'))
 return out
def compile_package():return assemble('on-liberty',bind)
if __name__=='__main__':run('on-liberty','On Liberty',bind)
