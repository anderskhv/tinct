"""Reviewed namesakes, heralds, ambassador groups and edition spellings for Henry V.

Both settings print plain capital speech cues, so the shared exact-alias matcher
carries most of the binding. What it cannot do alone is separate the play's many
repeated first names — four Edwards, four Johns, three Richards, two Thomases,
two Queen Isabels, two Dauphins, an Alexander who is a private soldier and an
Alexander who is king of Macedon — or tell the French herald from the English one.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'henry-v'

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 def drop(id,*where):
  if (ch,pi) in where:
   nonlocal out;out=[m for m in out if m[2]!=id]
 # Repeated given names. Each is bound at its own occurrence, never globally.
 if (ch,pi)==(2,39):add(r'Richard Earl of Cambridge','cambridge');add(r'Henry Lord Scroop','scroop');add(r'Sir Thomas Grey','grey')
 if (ch,pi)==(4,27):add(r'Richard Earl of Cambridge','cambridge');add(r'Henry Lord Scroop','scroop');add(r'Thomas Grey','grey')
 if (ch,pi)==(4,23):add(r'Richard Earl of Cambridge','cambridge')
 # Richard the Second is named only in the possessive, in the King's prayer.
 if (ch,pi)==(14,91):add(r'Richard(?=[’\x27]s)','richard-second')
 if (ch,pi)==(21,39):add(r'Sir Richard Ketly','ketly');add(r'Edward the Duke of York','york')
 if (ch,pi)==(21,36):add(r'Charles Duke of Orleans','orleans');add(r'John Duke of Bourbon','bourbon')
 if (ch,pi)==(21,37):add(r'John, Duke of Alençon','alencon');add(r'Anthony, Duke of Brabant','brabant');add(r'Edward, Duke of Bar','bar')
 if (ch,pi)==(3,47) or (ch,pi)==(5,4):add(r'Sir John(?![A-Za-z0-9])','falstaff')
 if (ch,pi)==(14,45):add(r'John Bates','bates');add(r'Alexander Court','court');add(r'Michael Williams','williams')
 if (ch,pi)==(14,46):add(r'John Bates','bates')
 # Alexander Court is a private soldier; Fluellen's Alexander is the Macedonian.
 drop('alexander-the-great',(14,45))
 # King Henry's father and the king his father deposed are never named. Bind the
 # phrases that identify them, not the recurring word "father".
 if (ch,pi)==(1,9):add(r'his father[’\x27]s body','henry-fourth')
 if (ch,pi)==(23,41):add(r'my father[’\x27]s ambition|my father[’\x27]s ambition','henry-fourth')
 if (ch,pi)==(4,11):add(r'your father[’\x27]s enemies','henry-fourth')
 if (ch,pi)==(14,91):add(r'My father|my father','henry-fourth')
 # Two Queen Isabels: the pedigree's and the one who comes to the peace meeting.
 drop('queen-isabel',(2,9))
 if (ch,pi)==(2,9):
  add(r'Queen Isabel','isabel-grandmother')
  # "Charles, the foresaid/said Duke of Lorraine" is the same man as the earlier
  # full form; Charlemagne and Charlemain stay separate figures in both settings.
  add(r'Charles, the (?:foresaid|said) Duke of Lorraine','charles-lorraine')
 # Lewis the Emperor is the longer span at 2:9 and wins; "the Emperor" elsewhere
 # is the Holy Roman Emperor of the Chorus and of Pistol's boast.
 if (ch,pi) in [(14,19),(21,48)]:add(r'Emperor','holy-roman-emperor')
 # Guichard Dauphin is a surname in the roll of the dead, not the king's son.
 drop('dauphin',(21,37))
 if (ch,pi)==(21,37):add(r'Sir Guichard Dauphin','guichard-dauphin')
 # "Bar" at 11:8 is the verb "bar"; only the duke in the list of peers is a person.
 if (ch,pi)==(11,8):
  out=[m for m in out if not (m[2]=='bar')]
  add(r'(?<=Brabant, )Bar(?=, and Burgundy)','bar')
 # Heralds. Montjoy holds every "herald" except King Henry's own at 20:14, where
 # he sends an English herald out before Montjoy has entered.
 for pat in [r'(?<![A-Za-z0-9])herald(?![A-Za-z0-9])']:
  if ch in [11,12,16,20] and (ch,pi)!=(20,14):add(pat,'montjoy')
  if (ch,pi)==(20,14):add(pat,'english-herald')
 if (ch,pi)==(16,24):add(r'(?<![A-Za-z0-9])Herald(?![A-Za-z0-9])','montjoy')
 if (ch,pi) in [(21,32),(21,38)]:add(r'(?<![A-Za-z0-9])Herald(?![A-Za-z0-9])','english-herald')
 # Two embassies: France's to England in scene 2, England's to France in scene 6.
 if (ch,pi) in [(2,26),(2,34)]:add(r'Ambassadors','french-ambassadors')
 if (ch,pi)==(6,7):add(r'Ambassadors','english-ambassadors')
 # Scene-local messengers: the French court in scene 6, the French camp overnight.
 if (ch,pi)==(6,7):add(r'MESSENGER','french-court-messenger','reviewed-cue')
 if (ch,pi) in [(13,64),(13,66),(15,13)]:add(r'MESSENGER','french-camp-messenger','reviewed-cue')
 if (ch,pi) in [(6,6),(13,63),(15,12)]:add(r'Messenger','french-court-messenger' if ch==6 else 'french-camp-messenger')
 if (ch,pi)==(6,9):add(r'Messenger','french-court-messenger')
 # The Chorus's own London present tense: neither figure is named in the play.
 if (ch,pi)==(21,48):add(r'gracious empress','empress');add(r'general(?= of our gracious empress)','irish-general')
 # Nell Quickly and the Hostess are one woman.
 if (ch,pi)==(3,7):add(r'Nell Quickly','hostess')
 # Le Fer gives his name in French; the Boy renders it in English.
 if (ch,pi)==(17,13):add(r'Monsieur le Fer','french-soldier')
 if (ch,pi) in [(17,14),(17,15)]:add(r'Master Fer|Fer(?![A-Za-z0-9])','french-soldier')
 # Harfleur's townspeople on the walls.
 if (ch,pi)==(9,0):add(r'citizens','citizens')
 return out

def compile_package():return assemble('henry-v',bind)
if __name__=='__main__':run('henry-v','Henry V',bind)
