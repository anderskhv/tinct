"""Historical namesakes and regnal titles are resolved in their source contexts."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'the-prince'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if ch==14:
  out=[(a,b,'charles7' if id=='charles8' else 'louis11' if id=='louis12' else id,how) for a,b,id,how in out]
 if (ch,pi)==(20,17):out=[m for m in out if m[2]!='caesar'] # Caesar is an imperial title offered to Albinus.
 if (ch,pi)==(8,17):out=[(a,b,'colonna-cardinal' if id=='colonna' else id,how) for a,b,id,how in out]
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch in [4,8,9,12,13,19]:add(r'\bAlexander\b','alexander6')
 if ch in [5,15,17,25]:add(r'\bAlexander\b','alexander-great')
 if ch==20:add(r'\bAlexander\b','alexander-severus')
 if ch==5:add(r'\bDarius\b','darius3')
 if ch==8:add(r'\bDarius\b','darius1')
 if ch in [4,25]:add(r'\bPhilip(?: of Macedon)?\b','philip5')
 if ch in [13,14]:add(r'\bPhilip(?: of Macedon)?\b','philip2')
 if (ch,pi)==(3,2):add(r'Duke of Ferrara','ferrara')
 if (ch,pi)==(4,15):
  add(r'Duke of Ferrara','ercole');add(r'[Ll]ords of Faenza, (?:of )?Pesaro, (?:of )?Rimini, (?:of )?Camerino, (?:of )?Piombino','lords')
 if (ch,pi)==(9,4):add(r'\bPagolo\b','pagolo-vitelli')
 if ch==9:add(r'\bGiovanni\b','fogliani')
 if (ch,pi)==(13,7):
  matches=list(re.finditer(r'\bSforza\b',text))
  for j,m in enumerate(matches):out.append((m.start(),m.end(),'muzio' if j==1 else 'francesco','reviewed-context'))
  add(r'Duke of Milan','filippo')
 if (ch,pi)==(13,15):add(r'\bSforza\b','muzio')
 if (ch,pi)==(20,6):
  matches=list(re.finditer(r'\bAnnibale\b',text))
  for j,m in enumerate(matches):out.append((m.start(),m.end(),'annibale2' if j==1 else 'annibale1','reviewed-context'))
  add(r'one of the Bentivogli family in Florence|one of the Bentivogli in Florence|a Bentivogli in Florence','sante')
 if (ch,pi)==(27,4):add(r'Giuliano de[’\x27] Medici|\bGiuliano\b','clement')
 if ch==27:add(r'your illustrious house','medici')
 if ch==4:add(r'King of France','charles8' if pi==14 else 'louis12')
 if (ch,pi) in [(12,2),(13,2)]:add(r'King of France','charles8')
 if (ch,pi) in [(17,2),(26,6)]:add(r'King of France','louis12')
 if (ch,pi) in [(8,3),(15,0)]:add(r'Duke of Milan','francesco')
 if (ch,pi)==(8,4):add(r'Duke of Milan','filippo')
 if (ch,pi) in [(8,6),(22,4),(25,1)]:add(r'Duke of Milan','lodovico')
 return out
def compile_package():return assemble('the-prince',bind)
if __name__=='__main__':run('the-prince','The Prince',bind)
