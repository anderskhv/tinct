"""Resolve assumed names without turning false allegations into identities."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'much-ado-about-nothing'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if (ch,pi)==(1,120):out=[(a,b,'pedro' if id=='claudio' else id,how) for a,b,id,how in out]
 if (ch,pi) in [(4,72),(4,80)]:out=[(a,b,'claudio' if id=='benedick' else id,how) for a,b,id,how in out]
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def replace(pat,id):
  nonlocal out
  for m in re.finditer(pat,text):
   a,b=m.span(1);out=[x for x in out if not(a<x[1] and b>x[0])];out.append((a,b,id,'reviewed-context'))
 if (ch,pi)==(5,14):
  replace(r'call Margaret [\x27’]?(Hero)','margaret');replace(r'(?:term|call) me [\x27’]?(Claudio)','borachio')
 if (ch,pi)==(9,63):replace(r'(?:by|under) the name of (Hero)','margaret')
 if (ch,pi)==(1,101):add(r'\bAdam\b','adam-bell')
 if ch==4:add(r'\bAdam\b','adam')
 if (ch,pi)==(17,25):
  ms=list(re.finditer(r'\bEuropa\b',text))
  if ms:
   m=ms[-1];out.append((m.start(),m.end(),'europa','reviewed-context'))
 if ch in [1,11,17]:add(r'\bMessenger\b|\bMESSENGER\b',{1:'army-messenger',11:'wedding-messenger',17:'capture-messenger'}[ch])
 if (ch,pi)==(1,7):add(r'\buncle\b','claudio-uncle')
 if (ch,pi)==(1,42):add(r'\bmother\b','hero-mother')
 if (ch,pi)==(1,17):add(r'\bfool\b','fool')
 if (ch,pi)==(2,1):add(r'\bson\b','antonio-son')
 if (ch,pi)==(2,4):add(r'a man of mine|one of my men|one of my servants','antonio-servant')
 if (ch,pi)==(4,130):add(r'\bfather\b','pedro-father')
 return out
def compile_package():return assemble('much-ado-about-nothing',bind)
if __name__=='__main__':run('much-ado-about-nothing','Much Ado About Nothing',bind)
