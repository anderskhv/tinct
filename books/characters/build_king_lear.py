"""Reviewed title succession, disguises, place names and scene-specific roles."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'king-lear'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if (ch,pi) in [(14,7),(16,5),(18,8),(18,30),(22,101),(26,31),(26,47),(26,58),(26,64)]:out=[(a,b,'edmund' if id=='gloucester' else id,how) for a,b,id,how in out]
 # The German location is not another appearance of the earl; Kent remains the person.
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if (ch,pi)==(1,14):add(r'\bKing\b','lear')
 if (ch,pi) in [(4,23),(4,41),(4,42),(4,45),(10,6)]:add(r'\bfool\b','fool')
 if (ch,pi)==(1,6):add(r'young fellow[’\x27]s mother','edmund-mother')
 if (ch,pi)==(1,8):add(r'a son','edgar')
 if (ch,pi)==(2,1):add(r'honest madam','edgar-mother');add(r'Nature','nature')
 if (ch,pi)==(2,38):add(r'Tom o[’\x27]\s*Bedlam','tom-bedlam')
 if ch>=8:add(r'\bTom\b','edgar')
 if (ch,pi)==(13,30):add(r'Pillicock(?= sat)','pillicock')
 if (ch,pi)==(13,34):add(r'\bTurk\b','turk')
 if (ch,pi)==(13,39):add(r'\bnightmare\b','nightmare')
 if (ch,pi)==(13,53):add(r'learned Theban','edgar')
 if (ch,pi)==(13,69):add(r'good Athenian','edgar')
 if (ch,pi)==(16,70):add(r'bedlam|Bedlam beggar','edgar')
 if ch==1 and pi not in [78,82] or (ch,pi) in [(2,3),(9,86),(19,1),(20,8)]:
  # Vineyards / milk denote the lands, not new cast mentions.
  if (ch,pi)!=(1,29):add(r'\bFrance\b','france');add(r'\bBurgundy\b','burgundy')
 if (ch,pi)==(19,4):
  out=[m for m in out if m[2]!='france'] # Marshal of France: country.
 if ch in [5,9,10,19,22,23,26]:
  id='lear-gentleman' if ch in [5,9] else 'heath-gentleman' if ch==10 else 'final-gentleman' if ch==26 else 'cordelia-gentleman'
  add(r'\bGENTLEMAN\b|\bGentleman\b',id)
 if ch in [18,20]:add(r'\bMESSENGER\b|\bMessenger\b','cornwall-messenger' if ch==18 else 'army-messenger')
 if ch in [20,24,26]:add(r'\bOFFICER\b|\bOfficer\b','french-officer' if ch==20 else 'british-officer')
 if ch==26:add(r'\bcaptain\b','captain');add(r'\bherald\b','herald')
 if ch==4:add(r'\bAttendant\b','attendants')
 return out

def compile_package():return assemble('king-lear',bind)
if __name__=='__main__':run('king-lear','King Lear',bind)
