"""Three chorus identities, scoped servants, kinship references and ambiguous names."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'oresteia'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 chorus='argive-chorus' if ch<=10 else 'libation-chorus' if ch<=18 else 'furies'
 add(chorus,r'\bCHORUS\b|\bChorus\b')
 if ch==10 and 9<=pi<=19:add(f'elder-{pi-8}',r'ONE OF THE CHORUS|ANOTHER')
 if ch==17 and pi==2:add('doorkeeper',r'\bSLAVE\b')
 if ch==17 and pi in [50,53]:add('aegisthus-servant',r'\bSLAVE\b')
 if ch==7 and pi==5:add('robe-maidens',r'\bmaidens\b')
 if ch==24 and pi==0:add('jurors',r'twelve Athenian citizens')
 if ch==26 and pi==29:add('escort',r'escort of women and children')
 if ch==17 and pi==100:add('furies',r'mother[’\x27]s hell-hounds')
 if ch==9 and pi==45:add('scylla-monster',r'\bScylla\b')
 if ch==16 and pi==2:
  add('scylla-daughter',r'\bScylla\b');add('scylla-father',r'\bfather\b')
 if ch==16 and pi==1:add('althea-son',r'\bson\b')
 if ch==8 and pi==10:add('heracles',r'(?<=Alcmena’s )son' if edition=='original-en' else r"(?<=Alcmena's )son")
 if ch==19 and pi==0:add('earth',r'\bEarth\b')
 if ch==5 and pi==32:add('sun',r'\b(?:Sun|sun)\b')
 if (ch==21 and pi in [7,11]) or (ch==22 and pi==2) or (ch==24 and pi==55) or (ch==25 and pi in [1,5]) or (ch==26 and pi in [1,3,21,30]):add('night',r'\bNight\b')
 if (ch==17 and pi==89) or (ch==25 and pi in [1,5]) or (ch==26 and pi==24):add('justice',r'\bJustice\b')
 if ch==3 and pi==16:add('agamemnon',r'\bAtrides\b')
 if ch==4 and pi in [5,7]:add('menelaus',r'\bAtrides\b')
 if ch==24 and pi==47:add('admetus',r'\bmortal\b')
 if ch==10 and pi==47:add('thyestes-children',r'\bchildren\b')
 return out

def compile_package():return assemble('oresteia',bind)
if __name__=='__main__':run('oresteia','The Oresteia',bind)
