"""Context-sensitive references in the locally excerpted Symposium."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'symposium'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 # Title citations do not announce a person's appearance in the frame.
 if (ch,pi)==(7,45):out=[m for m in out if m[2] not in ['alcibiades','gorgias']]
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==1:
  if pi==16:add('welcoming-servant',r'[Aa] servant')
  if pi==21:
   add('welcoming-servant',r'[Tt]he servant');add('reporting-servant',r'another servant')
  if pi==24:add('servants',r'\bservants\b')
  if pi==34:add('first-flute-girl',r'flute-girl|flute-player|flute player')
 if ch==2:
  if pi in [1,2]:add('earth',r'\bEarth\b')
  if pi==6:
   add('admetus',r'her husband');add('admetus-parents',r'father and (?:a )?mother');add('eurydice',r'her whom he sought|the woman he sought|the woman he was seeking')
  if pi==7:
   add('thetis',r'his mother');add('eros',r'\bGod\b')
 if ch==5:
  if pi==0:add('original-humans',r'original human nature|original nature of man')
  if pi==5:add('zeus',r'\bGod\b')
  if pi==6:add('eros',r'\bGod\b')
 if ch==7:
  if pi in [47,66,83]:add('divinity',r'\bGod\b')
  if pi==69:
   add('second-flute-girl',r'flute-girl|flute-player|flute player')
   add('alcibiades-attendants',r'his attendants')
   # Initial attendants are Agathon's household, later ones belong to Alcibiades.
   for m in re.finditer(r'Agathon told the (attendants)',text):out.append((m.start(1),m.end(1),'servants','reviewed-context'))
 if ch==8 and pi==0:add('late-revellers',r'band of revellers|band of revelers|crowd of revelers')
 return out

def compile_package():return assemble('symposium',bind)
if __name__=='__main__':run('symposium','Symposium',bind)
