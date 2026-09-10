"""Reviewed first identities, report roles and disputed allusions in Othello."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'othello'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==1:
  add('desdemona',r'[Yy]our (?:fair |beautiful )?daughter|[Mm]y daughter')
  if pi==4:add('iago-patrons',r'Three (?:great ones|important men) of the city|Three important men in the city')
  if pi in [10,11]:add('brabantio',r'her father')
  if pi==47:add('gratiano',r'my brother')
 if ch==3:
  if pi==71:add('emilia',r'(?:your|thy) wife')
  add('venice-messenger',r'\b(?:MESSENGER|Messenger)\b')
  if pi==45:add('headless-men',r'men whose heads')
 if ch==4:add('cyprus-messenger',r'\b(?:MESSENGER|Messenger)\b')
 if ch==6 and pi==39:add('stephen',r'King Stephen')
 if (ch,pi)==(10,38):
  add('othello-mother',r'my mother');add('othello-father',r'my father')
 if (ch,pi)==(13,19):
  add('barbary',r'\bBarbary\b');add('desdemona-mother',r'[Mm]y mother');add('barbary-lover',r'he she lov[’\x27]d|the man she loved')
 if (ch,pi)==(15,133):
  add('othello-mother',r'my mother');add('othello-father',r'[Mm]y father')
 if (ch,pi)==(15,190):
  add('aleppo-turk',r'a malignant and a turban[’\x27]d Turk|a malicious and turban-wearing Turk')
  add('aleppo-venetian',r'a Venetian')
 # Roman is Othello's taunting address to Cassio, not a new named Roman.
 if (ch,pi)==(11,60):add('cassio',r'Roman')
 return out

def compile_package():return assemble('othello',bind)
if __name__=='__main__':run('othello','Othello',bind)
