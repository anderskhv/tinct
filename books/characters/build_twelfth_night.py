"""Reviewed literal addressees, reported mistaken identities and ordinary family ties."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'twelfth-night'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pat):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def word(id,pat):add(id,r'\b(?:'+pat+r')\b')
 def change(id,m):
  nonlocal out
  out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())];out.append((m.start(),m.end(),id,'reviewed-context'))
 # Cesario normally addresses Viola, but Sebastian is the man in scene 15
 # and the assailant in Andrew's later report.
 word('sebastian' if ch==15 or (ch,pi)==(18,75) else 'viola','Cesario')
 if (ch,pi)==(14,173):
  for m in re.finditer(r'\bSebastian\b',text):change('viola',m)
 if (ch,pi)==(18,99):
  ms=list(re.finditer(r'\bSebastian\b',text));change('father-sebastian',ms[0])
 if (ch,pi) in [(1,7),(1,8),(2,16),(3,1),(5,31),(5,34)]:word('olivia-brother','brother')
 if (ch,pi) in [(2,3),(2,5),(2,6),(14,177),(14,179)]:word('sebastian','brother')
 if (ch,pi) in [(2,13),(6,4),(9,43),(9,47),(18,99),(18,101)]:word('father-sebastian',r'(?:my|My) father')
 if (ch,pi)==(2,16):word('olivia-father','a count')
 if (ch,pi)==(9,4):word('olivia-father',r'the Lady Olivia[’\x27]s father|Lady Olivia[’\x27]s father')
 if (ch,pi)==(9,43):word('viola','a daughter')
 if (ch,pi)==(3,27) or (ch==3 and 'Mistress Accost' in text):word('maria','Mistress Accost')
 if (ch,pi)==(8,5):word('maria','Marian')
 if (ch,pi)==(8,38):word('babylon-man','man in Babylon')
 if (ch,pi)==(10,69):word('sowter','hound')
 if ch==16 or ch==18:word('feste','Sir Topas')
 if (ch,pi)==(16,6):word('gorboduc-niece','a niece')
 if (ch,pi) in [(17,3),(17,4),(17,5),(18,54),(18,65)]:word('priest','holy man|good man|good father|holy father|father|Father')
 if (ch,pi) in [(18,105),(18,114),(18,153)]:word('captain','captain')
 return out
def compile_package():return assemble('twelfth-night',bind)
if __name__=='__main__':run('twelfth-night','Twelfth Night',bind)
