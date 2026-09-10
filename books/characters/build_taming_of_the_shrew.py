"""Disguised addressees, real people, framing actors and references stay distinct."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'taming-of-the-shrew'
FAKE_LUCENTIO={(2,81),(3,40),(3,168),(5,1),(5,59),(5,91),(5,93),(7,1),(7,11),(7,15),(7,17),(9,15),(9,16),(9,18),(9,20),(11,51),(11,62),(11,63),(11,74)}
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if ch==4:out=[(a,b,'lucentio' if id=='pedant' else id,how) for a,b,id,how in out]
 out=[(a,b,'tranio' if id=='lucentio' and text[a:b]=='Lucentio' and (ch,pi) in FAKE_LUCENTIO else id,how) for a,b,id,how in out]
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def remap_occurrences(word,ids):
  nonlocal out
  matches=list(re.finditer(r'\b'+word+r'\b',text))
  positions={(m.start(),m.end()):ids[j] for j,m in enumerate(matches)}
  out=[(a,b,positions.get((a,b),id),how) for a,b,id,how in out]
 if (ch,pi)==(1,62):remap_occurrences('Lucentio',['tranio','lucentio'])
 if (ch,pi)==(1,69):remap_occurrences('Lucentio',['tranio'])
 if (ch,pi) in [(1,71),(4,12)]:remap_occurrences('Lucentio',['lucentio','tranio'])
 if (ch,pi)==(11,52):remap_occurrences('Lucentio',['tranio','lucentio'])
 if (ch,pi) in [(3,168),(5,48)]:out=[m for m in out if m[2]!='vincentio']
 if (ch,pi)==(7,35):remap_occurrences('Vincentio',['pedant','vincentio'])
 if (ch,pi)==(11,51):remap_occurrences('Vincentio',['pedant'])
 if (ch,pi)==(1,75):add(r'FIRST SERVANT','frame-servant');add(r'[Mm]y lord','sly')
 if (ch,pi)==(1,77):add(r'[Mm]y lord','sly')
 if (ch,pi)==(1,78):add(r'madam lady|my lady','page')
 if ch in [3,4]:add(r'\bSERVANT\b|\bServant\b','baptista-servant')
 if ch==6:
  add(r'FIRST SERVANT|\bServant\b','petruchio-servant');add(r'ALL SERVANTS|\bServants\b','servants')
 if (ch,pi)==(5,1):add(r'\bpriest\b','wedding-priest')
 if ch==5 and pi in [59,61]:add(r'\bpriest\b|\bvicar\b','wedding-priest')
 if ch==9:add(r'\bpriest\b','luke-priest')
 if (ch,pi)==(7,31):add(r'ancient (?:sort of )?angel','pedant')
 if (ch,pi)==(1,48):add(r'\bdaughter\b','europa')
 if (ch,pi)==(2,22):add(r'(?<=Florentius’ )love|(?<=Florentius\x27s )love','florentius-wife')
 if (ch,pi)==(2,81):add(r'\bdaughter\b(?= had)','helen')
 if (ch,pi)==(4,25):add(r'\bgrandfather\b','aeacus')
 if ch==4:add(r'(?<![A-Za-z])Priami(?![A-Za-z])','priam')
 if (ch,pi)==(6,14):add(r'Jack','song-jack')
 if (ch,pi)==(7,45):
  for j,m in enumerate(re.finditer(r'\bDuke\b',text)):out.append((m.start(),m.end(),'venice-duke' if j==0 else 'mantua-duke','reviewed-context'))
 if (ch,pi)==(11,52):add(r'\bDuke\b','padua-duke')
 return out
def compile_package():return assemble('taming-of-the-shrew',bind)
if __name__=='__main__':run('taming-of-the-shrew','The Taming of the Shrew',bind)
