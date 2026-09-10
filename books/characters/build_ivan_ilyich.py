"""Exact, context-reviewed Tolstoy name bindings."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'ivan-ilyich'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  id=e['id']
  if id=='peter-footman' and ch<8:continue
  if id=='dmitri' and (ch,pi)!=(7,9):continue
  if id=='reader' and ch!=1:continue
  for alias in e['aliases']:
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text):
    owner='minister-peter' if id=='peter-ivanovich' and (ch,pi)==(3,4) else id
    out.append((m.start(),m.end(),owner,'reviewed-name'))
 pats=[]
 if (ch,pi)==(1,16):pats.append((r"Ivan Ilych's sister|Ivan Ilyich's sister",'sister'))
 if (ch,pi)==(2,1):pats.append((r'His sister','sister'))
 if ch in {3,5}:pats.append((r'brother-in-law','brother-in-law'))
 if ch==8 and pi in {31,34,35}:pats.append((r'(?:celebrated|famous) specialist','specialist'))
 if ch in {1,11}:pats.append((r'\bpriest\b','priest'))
 for pat,id in pats:
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 return out
def compile_package():return assemble('ivan-ilyich',bind)
if __name__=='__main__':run('ivan-ilyich','The Death of Ivan Ilyich',bind)
