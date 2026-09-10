"""Source-reviewed anonymous roles, allusions and first-person frame boundaries."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'notes-from-underground'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 # The dead woman's keeper is not silently merged with Liza's employer.
 if ch==17:out=[m for m in out if m[2]!='madam']
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if (ch,pi)==(1,0):
  add('underground-man',r'author of (?:the|this) diary|writer of these notes');add('dostoevsky',r'AUTHOR[’\x27]S NOTE')
 if (ch,pi) in [(1,1),(12,1)]:
  m=re.search(r'\bI\b',text)
  if m:out.append((m.start(),m.end(),'underground-man','reviewed-narrator'))
 if ch==1:
  if pi in [3,5]:add('office-officer',r'\bofficer\b')
  if pi==7:
   add('benefactor',r'a distant relation|a distant relative');add('country-servant',r'[Mm]y servant')
 if (ch,pi)==(6,0):
  add('wine-connoisseur',r'a gentleman who');add('saltykov',r'An author')
 if (ch,pi)==(7,0):
  add('napoleon-i',r'Napoleon');add('napoleon-iii',r'the present one')
 if (ch,pi)==(12,0):add('soskice',r'Juliet Soskice')
 if (ch,pi)==(16,17):add('silvio',r'Silvio')
 if ch==12:
  if pi==1:add('clerk',r'[Oo]ne of the officials|[Oo]ne of the clerks')
  if pi==1:add('dirty-clerk',r'Another had')
  if pi>=14:add('tavern-officer',r'\bofficer\b')
  if pi==12:add('thrown-man',r'one of them thrown out (?:of )?the window')
  if pi==20:add('porter',r'\bporter\b')
  if pi==27:add('job-patron',r'an important personage|an important person')
 if (ch,pi)==(13,1):add('god',r'\bLord\b')
 if (ch,pi)==(13,3):
  add('anton-daughters',r'(?:two |[Tt]he )daughters');add('aunt',r'their aunt');add('official-visitors',r'some grey-headed gentleman|some gray-haired gentleman|two or three visitors')
 if ch==14:
  if pi==1:
   add('general',r'an ancient General|an elderly General');add('general-daughters',r'the daughters')
  if pi==38:
   add('childhood-relations',r'distant relations|distant relatives');add('school-friend',r'a friend|my friend')
 if ch==15:
  if pi==0:add('waiters',r'the servant')
  if pi==45:add('zverkov-lady',r'some exuberant lady|an exuberant lady')
 if ch==16:
  add('driver',r'\bdriver\b|son of toil')
  if pi==24:add('liza',r'the girl who had come in')
 if ch==17:
  if pi==21:add('liza-parents',r'father and mother')
  if pi==57:add('dead-woman',r'that dead woman')
  if pi==59:add('other-madam',r'her madam')
  if pi==103:
   add('loving-father',r'a father');add('loved-daughter',r'his daughter')
 if ch==18:
  if pi==0:add('salt-fish-woman',r'a woman at a door|a woman in a doorway|that very woman with the salt fish')
  if pi in [10,12]:add('student',r'medical student|the student|that student')
  if pi==10:
   add('liza-friend',r'the friend');add('dance-hosts',r'a family of')
 return out

def compile_package():return assemble('notes-from-underground',bind)
if __name__=='__main__':run('notes-from-underground','Notes from Underground',bind)
