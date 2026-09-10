"""Occurrence-reviewed twin names and concealed abbess identity."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'comedy-of-errors'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 # Bare twin names resolve to the actual addressee or the explicitly recalled person.
 # Conflated accounts (7:2,9:30) and the duke's undecidable 11:123 stay unbound.
 a={(2,0):'s',(3,0):'e',(4,58):'s',(4,85):'s',(6,1):'s',(6,57):'s',
    (9,14):'s',(11,6):'s',(11,57):'e',(11,67):'e',(11,69):'e',
    (11,93):'e',(11,105):'e',(11,109):'e'}
 d={(2,0):'s',(2,2):'s',(2,4):'s',(2,18):'e',(2,28):'e',
    (4,1):'s',(4,10):'s',(4,60):'e',(4,61):'e',(4,71):'s',(4,73):'s',(4,81):'s',
    (5,23):'s',(5,24):'e',
    (6,18):'s',(6,19):'s',(6,20):'s',(6,51):'s',(6,67):'s',
    (7,7):'e',(8,20):'s',(8,37):'s',(9,21):'s',(9,27):'s',(10,50):'e',
    (11,15):'s',(11,67):'e',(11,69):'e',(11,93):'e',(11,94):'e',(11,101):'e',
    (11,115):'s',(11,116):'e',(11,122):'e',(11,138):'s',(11,140):'s',(11,149):'s',(11,151):'s'}
 if (ch,pi) in a:add('antipholus-'+('syracuse' if a[ch,pi]=='s' else 'ephesus'),r'\bAntipholus\b(?! (?:of|\(of))')
 if (ch,pi) in d:add('dromio-'+('syracuse' if d[ch,pi]=='s' else 'ephesus'),r'\bDromio\b(?! of)')
 add('solinus',r'\b[Dd]uke\b(?! Menaphon)')
 if ch==1:
  if pi==2:
   # The only second Duke here is the hostile ruler of Syracuse.
   out=[m for m in out if not(m[2]=='solinus' and text[max(0,m[0]-5):m[0]]=='your ')]
   add('syracuse-duke',r'your Duke')
  if pi==5:
   add('egeon-wife',r'a woman (?:happy|who would)|[Mm]y wife|my spouse')
   add('factor',r'my factor|my agent');add('dromio-mother',r'[Aa] (?:mean|poor) woman');add('sailors',r'[Tt]he sailors')
  if pi==7:add('egeon-wife',r'[Mm]y wife');add('rescuing-crew',r'another ship')
 if ch==2:add('first-merchant',r'\b(?:MERCHANT|Merchant)\b')
 if ch in [7,11]:add('second-merchant',r'\b(?:MERCHANT|Merchant)\b')
 if ch in [7,10]:add('officer',r'\b(?:Officer|officer|jailer)\b')
 if ch in [8,9]:add('officer',r'\b(?:officer|sergeant)\b')
 if ch==11:
  add('solinus',r'\b[Dd]uke\b(?! Menaphon)')
  if pi==77:add('officer',r'\bofficer\b')
 if (ch,pi)==(4,1):add('innkeeper',r'mine host|my host|the innkeeper')
 if (ch,pi)==(5,65):add('courtesan',r'a wench of excellent (?:discourse|conversation)')
 if (ch,pi)==(6,23):add('nell',r'a woman')
 if (ch,pi)==(6,29):add('nell',r'kitchen wench')
 if (ch,pi) in [(10,43),(10,44)]:add('luce',r'kitchen-maid|kitchen-vestal|kitchen maid|kitchen vestal')
 if (ch,pi)==(10,62):add('pinch-assistants',r'three or four')
 if (ch,pi) in [(4,38),(4,55),(8,35)]:add('time',r'\bTime\b')
 if ch==9:
  if pi in [3,4]:add('adam',r'\bAdam\b')
  if pi==5:
   ms=list(re.finditer(r'\bAdam\b',text))
   for n,m in enumerate(ms):out.append((m.start(),m.end(),'adam' if n==0 else 'officer','reviewed-context'))
 if (ch,pi) in [(5,30),(7,16)]:add('god',r'\bLord\b')
 return out

def compile_package():return assemble('comedy-of-errors',bind)
if __name__=='__main__':run('comedy-of-errors','The Comedy of Errors',bind)
