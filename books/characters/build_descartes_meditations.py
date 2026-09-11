"""Keep the hypothetical demon separate from God and ordinary self-deception."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'descartes-meditations'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 patterns=[]
 if (ch,pi)==(1,2):patterns.append((r'Lord','god'))
 if (ch,pi)==(4,11):patterns.extend([(r'malignant demon','demon'),(r'this deceiver','demon')])
 if (ch,pi)==(5,5):patterns.append((r'malignant being','demon'))
 if (ch,pi)==(5,2):patterns.append((r'I know not what being|some being — I know not who','demon'))
 for pat,id in patterns:
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 return out
def compile_package():return assemble('descartes-meditations',bind)
if __name__=='__main__':run('descartes-meditations','Meditations on First Philosophy',bind)
