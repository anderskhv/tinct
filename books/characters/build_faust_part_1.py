"""Reviewed bindings for Faust, Part One.

A play: most identification happens through speaker tags, so every speaking part
is carried under its capitalised tag as well as under the name other characters
use for it. Case matters — MARGARET is the tag, Margaret is the name in
dialogue, and both are aliases of one person.

The original edition is a scan with visible damage. It prints Marearet for
Margaret once, keeps German running heads (ABEND, GARTEN, FELD, KERKER) in the
text, and spells the Brocken critic PROCKTOPHANTASMIST where the modern edition
has PROKTOPHANTASMIST. Those are carried as aliases; no source byte is touched.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'faust-part-1'

SPLIT={
 # SPIRIT is the Earth Spirit in the study and nothing else; the Evil Spirit
 # and the Chorus of Spirits carry their own tags.
 'SPIRIT':({(4,3):'earth-spirit',(4,5):'earth-spirit',(4,7):'earth-spirit',
            (4,9):'earth-spirit',(4,11):'earth-spirit'},None),
 # "You may call me Lord Baron" is Mephistopheles giving himself a title, not
 # the Lord of the Prologue.
 'Lord':({(9,36):None},'the-lord'),
}

CIRCUMSTANCE=[
 (r'[Mm]y father was a dark man of honour|[Mm]y father was a sombre, honest man','fausts-father'),
 (r'[Yy]our father', 'fausts-father'),
]

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default)
  if entry is None:continue
  for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 if ch==5 and pi in (7,9,11):
  for pat,who in CIRCUMSTANCE:
   for m in re.finditer(pat,text):out.append((m.start(),m.end(),who,'reviewed-context'))
 return out

def compile_package():return assemble('faust-part-1',bind)
if __name__=='__main__':run('faust-part-1','Faust, Part One',bind)
