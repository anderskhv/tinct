"""Reviewed names and distinct messenger ownership for Oedipus Rex."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'oedipus-rex'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   flags=0 if e['kind'] in {'cultural-figure','mythical-group'} else re.I
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,flags):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 for m in re.finditer(r'\bMessenger\b',text,re.I):
  if ch in {8,9}:out.append((m.start(),m.end(),'messenger','reviewed-corinthian-speaker'))
 if (ch,pi)==(1,2):
  for m in re.finditer(r'\bIsmenus\b',text):out.append((m.start(),m.end(),'apollo','reviewed-oracular-epithet'))
 return out
def compile_package():return assemble('oedipus-rex',bind)
if __name__=='__main__':run('oedipus-rex','Oedipus Rex',bind)
