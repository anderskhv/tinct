"""Reviewed names with paragraph-scoped unnamed roles; no general pronoun inference."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'gilgamesh'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==1 and pi in [8,9,10]:add('trapper-father',r'(?:his|His) father')
 if (ch==1 and pi in [17,18,19,20]) or (ch==2 and pi in [14,16,18]):add('ninsun',r'\b(?:mother|Mother)\b')
 if ch==2 and pi in [5,6,7,8]:add('wedding-guest',r'\b(?:man|Man|traveler|traveller)\b')
 if ch==9 and pi in [5,6]:add('scorpion-wife',r'\bwife\b')
 if ch==7 and pi==9:add('dream-attacker',r'\b(?:A man|a man)\b')
 if ch==7 and pi==10:add('underworld-scribe',r'scribe of the (?:earth|underworld)')
 if ch==11 and pi in [21,23,29]:add('utnapishtim-wife',r'\bwife\b')
 if ch==12 and pi==0:
  add('carpenter',r'\bcarpenter\b')
  add('carpenter-wife',r'wife of the carpenter')
  add('carpenter-daughter',r'daughter of the carpenter')
 if ch==6 and pi==4:
  add('lover-lion',r'\blion\b');add('lover-horse',r'\bhorse\b');add('lover-shepherd',r'\bshepherd\b')
 if ch==11 and pi==34:add('snake',r'\b(?:snake|serpent)\b')
 return out

def compile_package():return assemble('gilgamesh',bind)
if __name__=='__main__':run('gilgamesh','The Epic of Gilgamesh',bind)
