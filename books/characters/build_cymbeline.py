"""Reviewed assumed names, two Caesars and scene-local roles for Cymbeline.

Both settings print plain capital speech cues. The work here is the play's three
layers of concealment — Imogen as Fidele, Belarius as Morgan with Cymbeline's
stolen sons as Polydore and Cadwal, Posthumus in Roman and then British clothes —
and the tribute argument in scene 13, where bare "Caesar" means Julius in one
line and Augustus in the next.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'cymbeline'
# The bare imperial name, occurrence by occurrence within its paragraph. Each entry
# lists the zero-based occurrences in that paragraph that mean Julius; every other
# bare occurrence in the play means the reigning Augustus. Reviewed line by line.
JULIUS_BARE={(13,2):[1],(13,5):[0,1],(13,9):[0],(13,11):[1]}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 # The names the runaways and the exiles go by. The reader is let into all of
 # them; the court is not until the last scene.
 add(r'(?<![A-Za-z0-9])Fidele(?![A-Za-z0-9])','imogen')
 add(r'(?<![A-Za-z0-9])Polydore(?![A-Za-z0-9])','guiderius')
 add(r'(?<![A-Za-z0-9])Cadwal(?![A-Za-z0-9])','arviragus')
 add(r'(?<![A-Za-z0-9])Morgan(?![A-Za-z0-9])','belarius')
 # Two Caesars. "Julius Caesar" and "Augustus Caesar" are the longer spans and win
 # where they appear; the bare name is decided per occurrence.
 name=r'Cæsar' if edition=='original-en' else r'Caesar'
 add(r'Julius '+name,'julius-caesar');add(r'Augustus '+name,'augustus')
 julius=JULIUS_BARE.get((ch,pi),[])
 for i,mo in enumerate(re.finditer(r'(?<![A-Za-z0-9])'+name+r'(?![A-Za-z0-9])',text)):
  if (ch,pi)==(13,8):continue  # Release review: emperor identity not certain.
  out.append((mo.start(),mo.end(),'julius-caesar' if i in julius else 'augustus','reviewed-context'))
 # "There be many Caesars ere such another Julius" is Cloten on emperors at large;
 # the plural is not bound, and the bare Julius there is the conqueror.
 if (ch,pi)==(13,4):add(r'(?<![A-Za-z0-9])Julius(?![A-Za-z0-9])','julius-caesar')
 # Imogen's woman answers to Helen at her bedside; Dorothy is named once and never
 # appears, and the play does not say the two are the same woman.
 if (ch,pi)==(9,2):add(r'Helen','helen')
 # One LADY cue, two households: Imogen's woman in scenes 4, 9 and 10, and one of
 # the Queen's flower-gatherers in scene 6.
 if ch==6:
  out=[m for m in out if m[2]!='helen']
  add(r'(?<![A-Za-z0-9])LADY(?![A-Za-z0-9])','queen-lady','reviewed-cue')
 # One LORD cue, two places: Cymbeline's court in scene 23 and the battlefield in 27.
 if ch in (23,27):add(r'(?<![A-Za-z0-9])LORD(?![A-Za-z0-9])','court-lord' if ch==23 else 'battle-lord','reviewed-cue')
 # Scene-local messengers.
 if ch in (10,28):add(r'(?<![A-Za-z0-9])MESSENGER(?![A-Za-z0-9])','court-messenger' if ch==10 else 'prison-messenger','reviewed-cue')
 if ch in (10,28):add(r'(?<![A-Za-z0-9])Messenger(?![A-Za-z0-9])','court-messenger' if ch==10 else 'prison-messenger')
 # Iachimo's brother is named only by his title.
 if (ch,pi)==(22,142):add(r'Sienna|Siena','siena')
 # Lucius names the soothsayer at the end.
 if (ch,pi)==(29,149):add(r'Philarmonus','soothsayer')
 return out

def compile_package():return assemble('cymbeline',bind)
if __name__=='__main__':run('cymbeline','Cymbeline',bind)
