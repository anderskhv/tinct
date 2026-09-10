"""Reviewed exact names and locally scoped unnamed people."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'jekyll-and-hyde'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  if ch not in e.get('chapters',[ch]):continue
  for alias in e['aliases']:
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 pats=[]
 if (ch,pi)==(1,7):pats=[(r'\bgirl\b|\bchild\b','girl'),(r'\bdoctor\b','girl-doctor'),(r'\bchild’s father\b','girl-father')]
 if (ch,pi)==(2,3):pats=[(r'\bbutler\b','lanyon-butler')]
 if ch==4:
  if pi in {0,4,7}:pats.append((r'\bmaid(?: servant)?\b','witness-maid'))
  if pi in {10,11,12,13}:pats.append((r'\b(?:old )?woman\b','hyde-housekeeper'))
  if pi in {4,7}:pats.append((r'\bofficer\b','newcomen'))
 if ch==8:
  if pi==21:pats.append((r'\bmaid\b','jekyll-housemaid'))
  if pi==58:pats.append((r'\bfootman\b','bradshaw'))
  if pi==59:pats.append((r'\bboy\b','knife-boy'))
 for pat,id in pats:
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 return out
def compile_package():return assemble('jekyll-and-hyde',bind)
if __name__=='__main__':run('jekyll-and-hyde','Dr. Jekyll and Mr. Hyde',bind)
