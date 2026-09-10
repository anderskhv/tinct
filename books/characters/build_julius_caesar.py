"""Reviewed Caesar/Octavius, Cinna, Cato, Publius and Flavius distinctions."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'julius-caesar'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pat):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def word(id,pat):add(id,r'\b(?:'+pat+r')\b')
 def replace(id,pat):
  nonlocal out
  for m in re.finditer(pat,text):
   out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())]
   out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch<=3:word('flavius-tribune','Flavius')
 if ch>=16:word('flavius-officer','Flavius')
 word('cinna-poet' if ch==10 else 'cinna-conspirator','CINNA|Cinna')
 if ch in [5,8]:word('publius-senator','Publius')
 if ch==11:word('publius-nephew','Publius')
 if ch==8 and pi in [29,30]:word('publius-cimber',r'(?:Thy|Your|my) (?:banish[’\x27]d |banished )?brother')
 if (ch,pi)==(11,2):word('lepidus-brother','Your brother')
 if (ch,pi)==(11,5):word('antony-sister','your sister')
 if (ch,pi)==(2,44):
  # Only the last Brutus is the legendary ancestor, not the man addressed.
  ms=list(re.finditer(r'\bBrutus\b',text))
  if ms:
   m=ms[-1];out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())];out.append((m.start(),m.end(),'brutus-ancestor','reviewed-context'))
 if (ch,pi)==(4,91) or (ch,pi)==(14,44):word('cato-elder','Cato')
 if ch>=16:
  word('cato-young','Cato')
  # Long Marcus Cato is the father in the son's declaration; longest span wins.
  if (ch,pi)==(17,6):
   ms=list(re.finditer(r'\bCato\b',text));m=ms[-1];out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())];out.append((m.start(),m.end(),'cato-elder','reviewed-context'))
 if ch==5:word('caesar-servant','SERVANT|Servant')
 if ch==8:word('antony-servant' if pi<100 else 'octavius-servant','SERVANT|Servant')
 if ch==9:word('octavius-servant','SERVANT|Servant')
 if ch==12:
  for n,s in enumerate(['FIRST','SECOND','THIRD'],1):word(f'soldier-camp-{n}',s+' SOLDIER')
 if ch==17:
  for n,s in enumerate(['FIRST','SECOND'],1):word(f'soldier-antony-{n}',s+' SOLDIER')
  # The captors' 'Brutus' is Lucilius's assumed identity, visible from his cue.
  if pi in [10,12,15]:replace('lucilius',r'\bBrutus\b')
 for n,s in enumerate(['FIRST','SECOND','THIRD','FOURTH'],1):word(f'citizen-{n}',s+' CITIZEN')
 if (ch,pi)==(14,25):
  ms=list(re.finditer(r'\bCaesar\b',text));m=ms[-1];out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())];out.append((m.start(),m.end(),'octavius','reviewed-context'))
 if (ch,pi)==(14,26):replace('octavius',r'\bCaesar\b')
 if (ch,pi)==(3,4):word('omen-slave','common slave');word('omen-women','hundred ghastly women|hundred terrified women')
 return out
def compile_package():return assemble('julius-caesar',bind)
if __name__=='__main__':run('julius-caesar','Julius Caesar',bind)
