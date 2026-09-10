"""Exact names and reviewed paragraph-scoped kinship/divine titles."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'oedipus-at-colonus'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==1 and pi==17:
  add('furies',r'\b(?:goddesses|Goddesses)\b');add('earth',r'\bEarth\b');add('night',r'\bDarkness\b')
 if ch==1 and pi==27:add('colonus',r'\bColonus\b')
 if ch==1 and pi==43:add('night',r'\bNight\b')
 if (ch,pi) in [(2,63),(8,2)]:add('jocasta',r'\bmy mother\b')
 if (ch,pi)==(4,43):add('jocasta',r'\bmother\b')
 if ch==9 and pi==48:add('polyneices-wife',r'(?<=Adrastus’ )child' if edition=='original-en' else r'daughter(?= of King Adrastus)')
 if ch==8 and pi==11:
  add('demeter',r'\bQueen\b');add('persephone',r'\bMaid\b')
 if ch==11 and pi==13:
  add('persephone',r'Queen infernal|Queen of the underworld')
  add('cerberus',r'Watch-dog of the gates of hell|watchdog of the gates of hell')
  add('death',r'[Gg]iver of eternal sleep');add('earth',r'\b(?:earth|Earth)\b')
 if (ch,pi)==(6,6):add('creon-men',r'his company')
 if (ch,pi)==(8,13):add('theseus-men',r'Theseus our chieftain[’\x27]s men|Theseus[’\x27]s men')
 return out

def compile_package():return assemble('oedipus-at-colonus',bind)
if __name__=='__main__':run('oedipus-at-colonus','Oedipus at Colonus',bind)
