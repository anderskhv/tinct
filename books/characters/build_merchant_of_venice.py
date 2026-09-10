"""Source-reviewed namesakes, family and court-disguise bindings."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'merchant-of-venice'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pat):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def word(id,pat):add(id,r'\b(?:'+pat+r')\b')
 if (ch,pi)==(1,34):
  ms=list(re.finditer(r'\bPortia\b',text))
  if len(ms)>1:
   m=ms[-1];out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())];out.append((m.start(),m.end(),'portia-roman','reviewed-context'))
 if ch==2:
  word('portia-father',r'(?:my|Your|your) (?:dead )?father')
  if pi==18:word('saxony-nephew',r'young German')
  if pi in [15,17]:word('falconbridge','Englishman')
  if pi==17:word('lebon','Frenchman')
  if pi==30:word('morocco-forerunner','forerunner|messenger')
 if ch==3 and pi==28:word('rebecca','his wise mother|his clever mother')
 if ch==4:word('morocco','Moor');word('portia-father','my father')
 if ch==5:
  # Gobbo in the son's self-address is Launcelet; speaker GOBBO is his father.
  if pi==1:word('launcelet','Gobbo')
  word('bassanio-servant','Servant')
  if pi in [29,31]:word('god','Lord')
 if ch==12:
  if pi==21:word('bassanio-forerunner','young Venetian')
 if ch==13:word('antonio-servant','SERVANT|Servant')
 if (ch,pi)==(14,9):word('hesione','virgin tribute')
 if ch==16:word('balthazar-servant','Balthazar')
 if ch==17 and pi in [12,13]:word('moor-woman','Moor|negro')
 if ch==18:
  if pi==22:word('court-messenger','messenger')
  if pi in [36,40,41]:word('balthazar-lawyer','doctor|Balthazar')
  if pi>=42:word('portia','doctor')
  if pi>=26:word('nerissa','clerk|Clerk')
 if ch in [19,20]:
  word('portia','doctor')
  word('nerissa','clerk')
 # The lawyer is compared to Daniel; retain the biblical reference separately.
 return out
def compile_package():return assemble('merchant-of-venice',bind)
if __name__=='__main__':run('merchant-of-venice','The Merchant of Venice',bind)
