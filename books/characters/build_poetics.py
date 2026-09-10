"""Reviewed named references; no inference of cast roles from work prominence."""
from pathlib import Path
import re
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'poetics'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,[e for e in entities if e['id'] not in {'cleon','cleon-father'}])
 if (ch,pi)==(20,7):
  for m in re.finditer(r'(Cleon) son of (Cleon)',text):
   for group,id in [(1,'cleon'),(2,'cleon-father')]:out.append((*m.span(group),id,'reviewed-grammar-example'))
 return out
def compile_package():return assemble('poetics',bind)
if __name__=='__main__':run('poetics','Poetics',bind)
