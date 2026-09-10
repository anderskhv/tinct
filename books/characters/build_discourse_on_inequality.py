"""Context distinguishes the two Plinys and identifies implicit named references."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'discourse-on-inequality'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if (ch,pi)==(2,4):out=[(a,b,'pliny-elder' if id=='pliny-younger' else id,how) for a,b,id,how in out]
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if (ch,pi)==(1,16):add(r'virtuous citizen|best of fathers','isaac')
 if (ch,pi)==(1,17):add(r'\bfather\b','isaac')
 if (ch,pi)==(2,22):add(r'first man','adam')
 if (ch,pi)==(3,5):add(r'Another illustrious philosopher|another illustrious philosopher|Another famous philosopher','montesquieu')
 if (ch,pi)==(3,33):add(r'author of the Fable of the Bees','mandeville')
 return out
def compile_package():return assemble('discourse-on-inequality',bind)
if __name__=='__main__':run('discourse-on-inequality','Discourse on the Origin of Inequality',bind)
