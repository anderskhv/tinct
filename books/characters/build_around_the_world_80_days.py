"""Source-scoped ordinary identities and late revelations across all 37 chapters."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'around-the-world-80-days'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pat):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def word(id,pat):add(id,r'\b(?:'+pat+r')\b')
 if ch==1 and pi==13:word('passepartout','new servant')
 if ch==1 and pi==14:word('passepartout','young man')
 if ch==1 and pi==15:word('passepartout','John')
 if ch==3:word('bank-robber',r'robber|thief')
 if (ch,pi)==(4,27):word('beggar','beggar-woman|beggar woman')
 if (ch,pi)==(4,28):word('beggar','beggar|good woman')
 if ch in [6,7,8]:word('suez-consul',r'(?:British )?[Cc]onsul')
 if ch==9 and pi==2:
  word('tax-collector',r'tax-collector|tax collector');word('cromarty','brigadier-general|brigadier general')
 if ch==10:
  if pi==14:word('bombay-director',r'director of the Bombay police|director')
  if pi==18:word('bombay-priests',r'three enraged priests|three furious priests|priests')
 if ch==11:
  word('conductor-india','conductor')
  if 41<=pi<=48:word('elephant-owner','Indian')
 if 11<=ch<=14:
  word('guide',r'guide')
  if ch!=11 or pi==48:word('guide','Parsee|Parsi')
 # The Parsee in the guide's account at 13:9 is Aouda, not the guide.
 if (ch,pi)==(13,9):
  out=[m for m in out if not(m[2]=='guide' and text[m[0]:m[1]] in ['Parsee','Parsi'])]
  word('aouda-father','wealthy Bombay merchant')
 if ch==12:
  if pi==20:word('aouda','a woman|This woman|This young woman');word('juggernaut','Juggernaut');word('pillaji-priests','Brahmins')
  if pi==21:word('rajah','old man|rajah|Hindoo prince|Hindu prince')
  if pi==28:word('rajah','prince|her husband|rajah')
 if ch==13:word('rajah','old rajah')
 if (ch,pi)==(14,5):word('allahabad-dealer','Jew|dealer')
 if ch in [13,14]:word('pillaji-priests','priests|Brahmins')
 if (ch,pi)==(14,19):word('jeejeeh','Parsee relation|Parsi relative|Parsee relative')
 if ch==15:
  word('calcutta-officer','policeman|police officer')
  word('oysterpuff','clerk')
  # Passepartout's mistaken accusation still refers to the Bombay men before him.
  word('bombay-priests','priests')
 if ch==18:word('hongkong-pilot','pilot')
 if ch in [17,18]:word('rangoon-captain','captain')
 if (ch,pi)==(18,23):word('hongkong-broker','broker')
 if (ch,pi)==(19,7):word('carnatic-clerk','clerk')
 if (ch,pi)==(19,9):word('opium-attendants','waiters')
 if ch in [20,21]:word('bunsby',r'sailor|pilot(?![ -]boat)')
 if ch==20 and pi>=64:word('tankadere-crew','crew|four sailors|sailors')
 if (ch,pi)==(22,2):word('opium-attendants','two waiters')
 if (ch,pi)==(23,2):word('yokohama-dealer','dealer|The man')
 if (ch,pi)==(24,0):word('yokohama-captain','captain')
 if (ch,pi)==(25,25):word('proctor','big brawny fellow|big, brawny fellow')
 if ch==27:
  if pi>=8:word('smith',r'Smith(?:, junior)?')
  if pi==8:
   word('joseph-bible','tribe of Joseph');word('mormon-prophet','Mormon prophet');word('mormon-son','son Mormon');word('messenger-smith','celestial messenger|heavenly messenger')
  if pi==9:word('smith-father','his father');word('mummy-showman','mummy[ -]showman')
  if pi>=21:word('late-mormon','Mormon|gentleman')
 if ch in [28,29,30]:
  word('conductor-america','conductor')
  # General Dodge's historical chief-engineer title is not the train driver.
  if (ch,pi)!=(29,3):word('engineer-forster','engineer|Forster')
  word('stoker','stoker')
 if (ch,pi)==(28,33):word('signalman','signal-man|signalman')
 if (ch,pi)==(29,39):word('proctor-second','a Yankee|his second')
 if ch==29 and pi>=53 or ch in [30,31]:word('sioux-attackers','Sioux|Indians')
 if (ch,pi)==(29,56):word('sioux-chief','Sioux chief')
 if ch==29 and pi==66 or ch==30:word('kearney-soldiers','soldiers|volunteers')
 if ch==30:
  word('captain-kearney','commanding officer|captain')
  if pi==21:word('sergeant-kearney','old sergeant|older sergeant')
  if pi==53:word('mudge','a man')
 if ch==31:word('mudge','American')
 if ch==32 and pi!=37:word('speedy','captain')
 if ch in [32,33]:word('henrietta-crew','crew|sailors|stokers')
 if (ch,pi)==(34,19):word('liverpool-engineer','engineer')
 if (ch,pi)==(34,13):word('bank-robber','robber')
 return out
def compile_package():return assemble('around-the-world-80-days',bind)
if __name__=='__main__':run('around-the-world-80-days','Around the World in Eighty Days',bind)
