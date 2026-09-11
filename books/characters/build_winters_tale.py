"""Reviewed scene-local roles, assumed names and mocking by-names for The Winter's Tale.

Both settings print plain capital speech cues, except that the original prints
Cleomenes' cue without its stopping period; the shared exact-alias matcher covers
both. The work here is separating four scene-local SERVANT roles, keeping the
king's counsellor Camillo distinct from the disguise he wears at the feast, and
binding the names characters are called rather than born with.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'winters-tale'
# One SERVANT cue serves four different households across sixteen years.
SERVANTS={5:'leontes-servant',7:'trial-servant',12:'shepherd-servant',13:'late-servant'}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 if ch in SERVANTS:
  add(r'(?<![A-Za-z0-9])SERVANT(?![A-Za-z0-9])',SERVANTS[ch],'reviewed-cue')
  add(r'(?<![A-Za-z0-9])Servant(?![A-Za-z0-9])',SERVANTS[ch])
 # Florizel woos Perdita as Doricles; the reader has watched him take the name.
 add(r'(?<![A-Za-z0-9])Doricles(?![A-Za-z0-9])','florizel')
 # Leontes' two mocking by-names for Paulina. Dame Partlet and Lady Margery are
 # proverbial names for a hen and a goose; both denote Paulina in these lines.
 if (ch,pi)==(5,29):add(r'Dame Partlet','paulina')
 if (ch,pi)==(5,52):add(r'Lady Margery','paulina')
 # The gentleman who enters at 14:5 is greeted as Rogero and speaks as SECOND
 # GENTLEMAN two lines later.
 if (ch,pi)==(14,6):add(r'Rogero','second-gentleman')
 # Hermione names her father only by his title at the trial.
 if (ch,pi)==(7,19):add(r'The Emperor of Russia','emperor-of-russia')
 return out

def compile_package():return assemble('winters-tale',bind)
if __name__=='__main__':run('winters-tale','The Winter’s Tale',bind)
