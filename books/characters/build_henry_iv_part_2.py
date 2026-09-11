"""Reviewed Bardolphs, Harrys, Johns and the two kings of Henry IV Part 2.

Two men are called Bardolph and two are called Harry; John is Falstaff's name,
the Prince John's, a rebel knight's, Gaunt's and Robin Hood's man's; and the
original prints a single KING cue for both kings, where the modern splits it into
HENRY IV and HENRY V. None of the four names is bound by a global alias.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'henry-iv-part-2'
# Lord Bardolph of the rebel party speaks only in scenes 1 and 3; every other
# Bardolph in the play is the corporal of Falstaff's following.
LORD_B_SCENES={1,3}
# The King's son and Hotspur are both Harry, and the King is called Harry twice
# himself. Zero-based occurrence indexes within their paragraph.
PH,H4,HS='prince-henry','henry-iv','hotspur'
HARRY={(1,13):[PH,PH],(1,20):[HS],(1,21):[HS],(1,34):[PH],(2,63):[PH],(3,17):[PH],
 (4,44):[PH],(5,44):[PH],(6,4):[HS,HS],(12,34):[PH],(14,40):[PH],(14,43):[PH,PH,PH],
 (14,45):[PH,PH],(14,55):[H4],(15,29):[PH],(16,10):[H4,PH],(16,25):[PH,H4,H4,PH],
 (16,31):[PH],(17,73):[H4],(17,74):[H4],(17,75):[H4],(17,76):[PH]}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 # The original's one KING cue covers both reigns: Henry the Fourth through
 # scene 14, and his son from scene 16, where the modern prints HENRY V.
 add(r'(?<![A-Za-z0-9])KING(?![A-Za-z0-9])','henry-iv' if ch<=14 else 'prince-henry','reviewed-cue')
 # Bare "Bardolph" outside the two rebel scenes is Falstaff's corporal.
 add(r'(?<![A-Za-z0-9])(?:Bardolph|BARDOLPH)(?![A-Za-z0-9])',
     'lord-bardolph' if ch in LORD_B_SCENES else 'bardolph')
 # "Harry ten shillings" at 9:106 is a coin, not a person, and is left unbound.
 if (ch,pi)!=(9,106):
  ids=HARRY.get((ch,pi),[])
  for i,mo in enumerate(re.finditer(r'(?<![A-Za-z0-9])(?:Harry|HARRY)(?![A-Za-z0-9])',text)):
   if i<len(ids):out.append((mo.start(),mo.end(),ids[i],'reviewed-context'))
 # Every John. The longer spans are named first and win; the rest is Falstaff,
 # except the one in Silence's Robin Hood ballad.
 claimed=[]
 def claim(pat,id):
  for m in re.finditer(pat,text):
   claimed.append((m.start(),m.end()));out.append((m.start(),m.end(),id,'reviewed-context'))
 claim(r'John a Gaunt|John of Gaunt','gaunt');claim(r'Sir John Umfrevile','umfrevile')
 claim(r'John Doit','john-doit');claim(r'Sir John Colevile','colevile')
 claim(r'(?:Prince|Lord) John(?: of Lancaster)?','lancaster')
 claim(r'(?<=son )John(?![A-Za-z0-9])','lancaster');claim(r'(?<=my )John of Lancaster','lancaster')
 if (ch,pi)==(17,67):claim(r'(?<![A-Za-z0-9])John(?![A-Za-z0-9])','little-john')
 for m in re.finditer(r'(?<![A-Za-z0-9])Johns?(?![A-Za-z0-9])',text):
  if not any(a<m.end() and b>m.start() for a,b in claimed):
   out.append((m.start(),m.end(),'falstaff','reviewed-context'))
 # Named only by relation or by a phrase.
 if (ch,pi)==(13,33):add(r'(?<=great-grandsire, )Edward','edward-iii')
 if (ch,pi)==(9,5):add(r'(?<=cousin )William','william-shallow')
 if (ch,pi)==(17,67):add(r'(?<![A-Za-z0-9])Robin Hood(?![A-Za-z0-9])','robin-hood')
 return out

def compile_package():return assemble('henry-iv-part-2',bind)
if __name__=='__main__':run('henry-iv-part-2','Henry IV Part 2',bind)
