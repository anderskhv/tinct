"""Exact aliases with the Here/Hera and Eleatic Palamedes distinctions."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'phaedrus'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==1 and pi==32:
  for m in re.finditer(r'By (Here)',text):out.append((m.start(1),m.end(1),'hera','reviewed-context'))
 if ch==4 and pi==21:
  for m in re.finditer(r'followers of (Here)',text):out.append((m.start(1),m.end(1),'hera','reviewed-context'))
 if ch==1 and pi==9:
  add('lysias-youth',r'fair youth|beautiful young man');add('nonlover',r'\bnon-lover\b')
 if ch==3 and pi==27:
  add('socrates-youth',r'fair boy|beautiful boy')
  add('cunning-lover',r'one special cunning one|one especially cunning lover|one particularly cunning lover|One of them was especially cunning')
 if ch==4 and pi==9:
  add('socrates-youth',r'fair youth|beautiful youth')
  add('pythia',r'prophetess at Delphi');add('dodona',r'priestesses at Dodona')
 if ch==4 and pi in [13,15,22,23]:add('charioteer',r'\bcharioteer\b')
 if ch==4 and pi==22:
  add('noble-horse',r'right-hand horse|obedient steed|obedient horse')
  add('unruly-horse',r'crooked lumbering animal|crooked, lumbering animal')
 if ch in [1,5]:add('cicadas',r'\bcicadae\b|\bcicadas\b|\bgrasshoppers\b')
 if ch==5 and pi==115:add('bronze-maiden',r'maiden of bronze')
 if ch==4 and pi==25 or ch==5 and pi==126:add('eros',r'\bLove\b')
 return out

def compile_package():return assemble('phaedrus',bind)
if __name__=='__main__':run('phaedrus','Phaedrus',bind)
