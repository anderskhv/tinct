"""Local references only: generic constitutional offices are not people."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'us-founding-documents'
def bind(edition,ch,pi,text,entities):
 patterns=[]
 if ch==1:
  patterns=[(r'God|Creator|Supreme Judge|Divine Providence','god')]
  if pi==2:patterns.append((r'King of Great Britain','george-iii'))
  if pi==30:patterns.append((r'Prince','george-iii'))
 if (ch,pi)==(2,92):patterns.append((r'our Lord','jesus'))
 return [(m.start(),m.end(),id,'reviewed-context') for pat,id in patterns for m in re.finditer(r'(?<!\w)(?:'+pat+r')(?!\w)',text)]
def compile_package():return assemble('us-founding-documents',bind)
if __name__=='__main__':run('us-founding-documents','United States Founding Documents',bind)
