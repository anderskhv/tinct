"""Three Catos, Borgia/Caesar, religious references and surviving note context."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'social-contract'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 for pat,id in [(r'(?<![A-Za-z])Livy(?![A-Za-z])','livy'),(r'(?<![A-Za-z])Miltiades(?![A-Za-z])','miltiades'),(r'(?:Marquis )?d[’\']Argenson','argenson'),(r'(?:M\. )?d[’\']Alembert','alembert')]:add(pat,id)
 if (ch,pi)==(2,7):add(r'comrades','ulysses-companions')
 if (ch,pi)==(2,8):
  add(r'three great monarchs','noah-sons');add(r'children(?= of Saturn)','saturn-children')
 if (ch,pi)==(4,14):
  for i,m in enumerate(re.finditer(r'\bCato\b',text)):out.append((m.start(),m.end(),'cato-son' if i==0 else 'cato-elder','reviewed-family-context'))
 if (ch,pi)==(47,40):add(r'\bCato\b','cato-younger')
 if (ch,pi)==(16,10):add(r'child(?= of Ishmael)','muhammad')
 if (ch,pi)==(16,13):add(r'his genius|great man','calvin')
 if (ch,pi)==(27,10):
  add(r'younger Dionysius','dionysius-younger')
  ms=list(re.finditer(r'\bfather\b',text))
  for i,m in enumerate(ms):out.append((m.start(),m.end(),'dionysius-elder' if i==0 else 'dionysius-grandfather','reviewed-family-context'))
 return out
def compile_package():return assemble('social-contract',bind)
if __name__=='__main__':run('social-contract','The Social Contract',bind)
