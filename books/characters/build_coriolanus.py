"""Reviewed Martian namesakes, scene-local roles and the earned name for Coriolanus.

Both settings print plain capital speech cues, and the cue for the central figure
changes from MARTIUS to CORIOLANUS once the army gives him the name. The care here
goes to the family name: "Martius" is Caius Martius nearly everywhere, but the
Senate's praise at 13:97 traces the house of the Martians back to King Ancus
Martius, and a Volscian in the crowd at 29:45 mourns a cousin called Marcus.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'coriolanus'

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 # The genealogy speech: "Ancus Martius" is the longer span and takes precedence
 # over the bare family name, which elsewhere always means Caius Martius.
 if (ch,pi)==(13,97):add(r'Ancus Martius','ancus-martius')
 # The son's name sits inside italic markup in the original at 26:28 and 26:32,
 # where underscore defeats the shared matcher's word boundary. Bind it with
 # letter/digit boundaries instead, in both settings, so coverage matches.
 if ch==26:add(r'(?<![A-Za-z0-9])[Yy]oung Martius(?![A-Za-z0-9])','young-martius')
 # A Volscian's dead cousin, not the Roman the crowd is shouting at.
 if (ch,pi)==(29,45):add(r'(?<![A-Za-z0-9])Marcus(?![A-Za-z0-9])','marcus-volscian')
 # Two gentlewomen in one scene: Virgilia's, who announces the visit, and the one
 # who comes in attending Valeria.
 if (ch,pi) in [(3,4),(3,10)]:add(r'Gentlewoman','virgilia-gentlewoman')
 if (ch,pi)==(3,13):add(r'Gentlewoman','valeria-gentlewoman')
 # The two agents on the road name each other.
 if (ch,pi)==(19,1):add(r'Adrian','adrian')
 if (ch,pi) in [(19,4),(19,12)]:add(r'Nicanor','nicanor')
 return out

def compile_package():return assemble('coriolanus',bind)
if __name__=='__main__':run('coriolanus','Coriolanus',bind)
