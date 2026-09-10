"""Source-scoped identities keep namesakes, ships and the appendix parody distinct."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'frederick-douglass'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 # Smith's Wharf is a place; the parody's Tom and Ned are not the narrative's men.
 out=[(a,b,id,how) for a,b,id,how in out if not(id=='smith' and ch!=10)]
 if ch==7:out=[(a,b,'little-thomas' if id=='thomas' else id,how) for a,b,id,how in out]
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if (ch,pi)==(1,0):add(r'^I\b','douglass')
 if (ch,pi)==(1,1):add(r'\bIsaac\b','isaac-grandfather')
 if (ch,pi)==(1,2):add(r'\bfather\b','father')
 if (ch,pi)==(2,0):add(r'\bIsaac\b','isaac-crew')
 if ch in [2,4]:add(r'\b(?:Mr\. )?Hopkins\b','hopkins-overseer')
 if ch==10:add(r'\b(?:Mr\. |Rev\. )?Hopkins\b','rigby')
 if (ch,pi)==(3,2):
  add(r'\bEdward\b','edward-lloyd');add(r'\bDaniel\b','daniel-lloyd')
  add(r'(?<=old and young )Barney\b','barney-young')
 if (ch,pi)==(3,5):add(r'\bLloyd\b','lloyd')
 if (ch,pi)==(4,6):
  add(r'(?<=wife of )Mr\. Giles Hicks','giles')
  add(r'(?<=The )wife(?= of Mr\.)','mrs-hicks')
  add(r'my wife’s cousin','cousin-anna')
 if (ch,pi)==(4,8):add(r'old man|elderly man','old-oysterman')
 if (ch,pi)==(5,9):
  add(r'\bThomas\b','little-thomas');add(r'\bMr\.(?= and Mrs\.)','hugh');add(r'\bMrs\. Auld\b','sophia')
 if (ch,pi)==(6,2):
  add(r'\bMr\. Auld\b','hugh');add(r'\bMrs\. Auld\b','sophia')
 if (ch,pi)==(6,3):add(r'\bHamilton\b','thomas-hamilton')
 if ch==7:
  add(r'\bBailey\b','bailey-yard')
  if pi==3:add(r'little white boys|white boys','schoolboys')
  if pi==6:add(r'two Irishmen|Irishmen','irishmen')
 if (ch,pi)==(8,3):add(r'little brother|younger brother','brother')
 if (ch,pi)==(8,5):add(r'\bAmanda\b','amanda')
 if (ch,pi)==(10,3):
  add(r'\bwife\b','mrs-covey')
  add(r'married man','harrison-man')
 if (ch,pi)==(10,10):add(r'free wife','sandy-wife')
 if ch==10:
  add(r'\bJohn\b','john-harris')
  add(r'\bHenry\b(?! Bailey)','henry-harris')
  if pi==37:add(r'Master William\b','freeland')
 if ch>=9:add(r'\bMr\. Hamilton\b','william-hamilton')
 if ch in [10,11]:add(r'\bThomas\b(?! Lowe)','thomas')
 if (ch,pi)==(11,11):
  add(r'(?<![A-Za-z])Bailey(?![A-Za-z])','douglass');add(r'(?<![A-Za-z])Johnson(?![A-Za-z])','douglass')
 if (ch,pi)==(11,13):add(r'Mr\.(?= and Mrs\. Johnson)','nathan')
 if (ch,pi)==(11,18):add(r'newly-married wife|newly married wife','anna')
 if (ch,pi)==(11,20):add(r'young man','anonymous-friend')
 if (ch,pi)==(12,7):
  for name in ['Jack','Nell','Tony','Doll','Sam','Jacob','Tom','Dick','Ned','Nanny']:add(r'\b'+name+r'\b','parody-'+name.lower())
 # Italic wrappers are punctuation in these exact source contexts.
 if (ch,pi)==(11,6):
  add(r'Mr\. David Ruggles','ruggles');add(r'(?<![A-Za-z])Darg(?![A-Za-z])','darg')
 return out
def compile_package():return assemble('frederick-douglass',bind)
if __name__=='__main__':run('frederick-douglass','Narrative of the Life of Frederick Douglass',bind)
