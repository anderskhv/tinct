"""Speaker identities and scoped titles for the two messenger roles."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'bacchae'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==7:add('first-messenger',r'\b(?:MESSENGER|Messenger)\b')
 if ch in [10,11]:add('second-messenger',r'\bMESSENGER\b')
 if ch==6 and pi in [0,1]:add('dirce',r'\bDirce\b')
 if ch==11 and pi==103:add('actaeon-father',r'Actaeon[’\x27]s father')
 if ch==7 and pi==22:
  add('theban-women',r'\b(?:Bacchae|Bacchanals|Wild White Women)\b')
  add('townsman',r'one being there who walked the streets|one man among them')
 if ch==7 and pi==20:add('theban-women',r'Wild White Women')
 if ch==1 and pi==1:add('theban-women',r'The seed of womankind|every woman of Thebes')
 if (ch,pi) in [(3,17),(3,23),(5,1),(5,3),(7,30)]:add('dionysus',r'\bstranger\b')
 return out

def compile_package():return assemble('bacchae',bind)
if __name__=='__main__':run('bacchae','The Bacchae',bind)
