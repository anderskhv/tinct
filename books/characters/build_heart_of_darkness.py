"""Reviewed paragraph scopes distinguish frame and Company roles."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'heart-of-darkness'
SCOPED={
 (1,2):[(r'Director of Companies','host')],
 (1,3):[(r'\bI\b','narrator'),(r'Accountant','frame-accountant'),(r'director','host')],
 (1,19):[(r'chief of the village','chief'),(r'chief[’\x27]s son','chief-son')],
 (1,21):[(r'one fat','older-knitter'),(r'other slim|slim one','younger-knitter'),(r'white-haired secretarial head','secretary'),(r'great man','company-head')],
 (1,23):[(r'younger one','younger-knitter'),(r'old one|Old knitter','older-knitter')],
 (1,24):[(r'young chap|some clerk','clerk')],
 (1,32):[(r'Her captain|captain was a Swede','swedish-captain'),(r'a man who hanged himself','swedish-traveler')],
 (1,35):[(r'Six black men','chain-gang'),(r'one of the reclaimed','guard')],
 (1,39):[(r'The man seemed young','young-worker'),(r'good Swede','swedish-captain')],
 (1,41):[(r'a white man','chief-accountant')],
 (1,42):[(r'one of the native women','laundry-worker')],
 (1,44):[(r'sick man|invalid agent','sick-agent')],
 (1,47):[(r'homeward-bound agent','sick-agent')],
 (1,49):[(r'a white man in an unbuttoned uniform','road-official'),(r'white companion','walking-companion')],
 (1,51):[(r'his [’\x27]boy[’\x27]','manager-boy')],
 (1,55):[(r'A nigger','beaten-worker'),(r'first-class agent','brickmaker')],
 (1,65):[(r'we listeners','narrator')],
 (2,0):[(r'nephew','manager')],
 (2,19):[(r'One of my hungry and forbearing friends','poleman')],
 (2,32):[(r'a man','russian')],
 (2,34):[(r'Russian','russian')],
 (2,28):[(r'His mother','kurtz-mother'),(r'his father','kurtz-father')],
 (3,12):[(r'a woman','african-woman')],
 (3,43):[(r'manager[’\x27]s boy','manager-boy')],
 (3,48):[(r'His mother','kurtz-mother'),(r'clean-shaved man|spectacled man','company-representative'),(r'Kurtz[’\x27]s cousin|the cousin','cousin'),(r'Ultimately a journalist','journalist')],
 (3,76):[(r'his own mother','kurtz-mother')],
 (3,86):[(r'Director','host'),(r'\bI\b','narrator')]
}
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   flags=0 if e['kind']=='cultural-figure' or e['id'] in {'lawyer','intended'} else re.I
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,flags):
    if e['id']=='manager' and (ch,pi) in {(1,58),(1,60)}:continue
    out.append((m.start(),m.end(),e['id'],'reviewed-name-or-role'))
 for pat,id in SCOPED.get((ch,pi),[]):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-local-role'))
 if ch==1 and 41<=pi<=47:
  for m in re.finditer(r'\baccountant\b',text,re.I):out.append((m.start(),m.end(),'chief-accountant','reviewed-station-accountant'))
 if ch==3:
  for m in re.finditer(r'\bRussian\b',text):out.append((m.start(),m.end(),'russian','reviewed-trader'))
 if (ch,pi) in {(1,58),(1,60)}:
  for m in re.finditer(r'assistant[- ]manager|General Manager',text,re.I):out.append((m.start(),m.end(),'kurtz' if pi==58 else 'brickmaker','reviewed-speculative-title'))
 return out
def compile_package():return assemble('heart-of-darkness',bind)
if __name__=='__main__':run('heart-of-darkness','Heart of Darkness',bind)
