"""Resolve namesakes and composite source units; publishing boilerplate is not play text."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'as-you-like-it'
FOOTERS={2:range(51,55),12:range(27,31),14:range(61,65),17:range(70,76)}
def bind(edition,ch,pi,text,entities):
 if pi in FOOTERS.get(ch,[]):return []
 out=exact(edition,ch,pi,text,entities)
 if (ch,pi)==(2,57):out=[(a,b,'adam-bible' if id=='adam' else id,how) for a,b,id,how in out]
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def wordlist(pat,ids):
  for j,m in enumerate(re.finditer(pat,text)):out.append((m.start(),m.end(),ids[j],'reviewed-context'))
 if (ch,pi)==(1,3):add(r'banished father','senior')
 if (ch,pi)==(1,4):wordlist(r'\bfather\b',['senior','frederick','senior'])
 if (ch,pi)==(1,6):
  wordlist(r'\bfather\b',['frederick','senior']);add(r'\bRose\b','rosalind')
 if (ch,pi)==(1,51):add(r'old man','wrestlers-father');add(r'three sons','three-wrestlers')
 if (ch,pi)==(1,55):add(r'old man|their father','wrestlers-father');add(r'eldest of the three|the second|the third','three-wrestlers')
 if (ch,pi)==(1,106):add(r'\bfather\b','senior')
 if (ch,pi)==(2,42):add(r'\buncle\b','senior')
 if (ch,pi)==(2,47):add(r'own page','ganymede-myth')
 if ch in [1,2,3,4,8,14,15,16,17]:
  id='frederick' if ch in [1,3,4] or (ch==2 and pi<55) or (ch==8 and pi>=43) or (ch,pi)==(17,54) else 'senior'
  add(r'\bDuke\b|\bDUKE\b',id)
  if (ch,pi)==(1,118):
   out=[m for m in out if not(m[2]=='frederick' and text[max(0,m[0]-10):m[0]].endswith("banish'd "))]
   add(r"banish'd Duke|banished Duke",'senior')
 if (ch,pi)==(4,5):add(r'\bYour brother\b|\bYour Brother\b|\byour brother\b','oliver')
 if ch==2 and pi>=55 or ch==8 and pi<43:
  add(r'FIRST LORD','forest-first-lord');add(r'SECOND LORD','forest-second-lord')
 if ch==3:
  add(r'FIRST LORD','court-first-lord');add(r'SECOND LORD','court-second-lord')
 if ch==13:add(r'\bLORD\b','hunting-lord')
 if (ch,pi)==(5,32):add(r'\bmaster\b','corin-master')
 if (ch,pi)==(12,23):add(r'old carlot|old peasant','corin-master')
 if (ch,pi)==(8,8):add(r'\bfool\b','touchstone')
 if (ch,pi)==(8,10):add(r'worthy fool','touchstone')
 if (ch,pi) in [(9,128),(9,134)]:add(r'\buncle\b','rosalind-uncle')
 if (ch,pi)==(9,144):add(r'(?<=Yes, )one','cured-lover')
 if (ch,pi)==(15,19):add(r'\bmagician\b','magician')
 if (ch,pi)==(15,21):add(r'\bmagician\b','rosalind')
 if (ch,pi)==(12,12):add(r'Dead shepherd','marlowe')
 if (ch,pi)==(17,52):add(r'old religious man','religious-man')
 if (ch,pi)==(10,33):
  out=[m for m in out if m[2]!='oliver']
  wordlist(r'\bOliver\b',['martext','song-oliver','song-oliver'])
 return out
def compile_package():return assemble('as-you-like-it',bind)
if __name__=='__main__':run('as-you-like-it','As You Like It',bind)
