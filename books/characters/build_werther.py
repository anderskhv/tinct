"""Review-scoped role bindings, abbreviated names and the embedded Ossian poems."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'werther'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 if ch==49:out=[m for m in out if m[2]!='ambassador']
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def word(w,id):add(r'(?<!\w)'+w+r'(?!\w)',id)
 loc=(ch,pi)
 if loc in ((1,0),(84,1)):word('I','editor')
 if ch==2:
  if pi==0:
   word('mother','mother');word('aunt','aunt');word('Leonora','leonora');word('sister','leonora-sister');add(r'My dear friend|my dear friend|Dear friend','wilhelm')
 if loc==(6,2):add(r'servant-girl|servant girl','well-girl')
 if loc==(7,2):add(r'friend of my youth','early-friend')
 if loc==(7,4):add(r'eldest daughter','charlotte');word('wife','charlotte-mother')
 if loc==(9,1):
  add(r'good old woman|old woman','innkeeper');add(r'little boy about four|boy of about four','philip');add(r'child about six months old|baby of about six months','hans')
 if loc==(10,0):
  add(r'young woman','boys-mother');word('mother','boys-mother');add(r'eldest boy','eldest-boy');word('husband','boys-father');word('schoolmaster','schoolmaster-father')
 if loc==(10,1):word('mother','boys-mother')
 if ch==11 and pi==3:
  add(r'A peasant|a peasant','peasant');word('widow','widow');word('mistress','widow');add(r'former husband|first husband','widow-husband')
 if ch==12:
  if pi==7:
   word('S—','judge');word('partner','partner');word('aunt','partner-aunt');word('father','albert-father');add(r'very worthy man|very fine man','albert')
  if pi==8:word('maid','maid')
  if pi in (10,13,16):word('aunt','partner-aunt')
  if pi==12:word('Leonora','fictitious-leonora')
  if pi==21:add(r'a lady|a woman','warning-lady')
 if loc==(13,1):word('father','judge')
 if loc==(16,0):
  add(r'Vicar of S—|vicar at S—|vicar of S—|vicar of St—|old man|old gentleman','old-vicar')
  for m in re.finditer(r'\bfather\b',text):
   before=text[max(0,m.start()-16):m.start()]
   id='judge' if 'her ' in before and 'wife' not in before else 'vicar-predecessor'
   out.append((m.start(),m.end(),id,'reviewed-family-context'))
  word('predecessor','vicar-predecessor');add(r'vicar.s wife|my wife|My wife','vicar-wife');add(r'vicar(?=.s,|.s house)','old-vicar')
 if loc==(16,1):word('vicar','old-vicar')
 if loc==(20,0):word('physician','m-doctor');word('doctor','m-doctor')
 if loc==(20,1):word('prophet','elijah')
 if ch in (23,):word('servant','servant')
 if ch in (25,49,50,51):word('mother','mother')
 if loc==(31,0):
  m=re.search(r'\bfather\b',text)
  if m:out.append((m.start(),m.end(),'judge','reviewed-family-context'))
 if loc==(31,1):add(r'excellent mother|her mother','charlotte-mother')
 if loc==(32,0):
  word('servant','pistol-servant');word('maid','pistol-maid');word('surgeon','pistol-surgeon');add(r'friend(?=.s)','albert-host')
 if ch in (36,46,50):word('minister','minister')
 if loc==(40,6):add(r'my mother','charlotte-mother')
 if loc==(40,7):add(r'your mother','charlotte-mother');word('father','judge')
 if loc==(42,2) or ch==48:word('count','count-c')
 if loc==(42,7) or loc==(48,6):word('aunt','b-aunt')
 if loc==(48,1):
  add(r'honourable Lady|Lady von S—','lady-s');add(r'noble husband|her lord','lady-s-husband');add(r'scheming daughter|gosling of a daughter','lady-s-daughter');add(r'deaf wife','chancellor-wife');word('I—','i-guest');word('J—','i-guest')
 if loc==(51,0):word('father','werther-father')
 if ch in (52,53,54):word('prince','prince')
 if loc==(58,0):word('mother','boys-mother');word('husband','boys-father');add(r'eldest boy','eldest-boy');add(r'good old woman','boys-mother')
 if loc==(61,1):word('mistress','widow')
 if loc==(61,2):
  word('brother','widow-brother');word('mistress','widow');add(r'another servant','replacement')
 if loc==(65,0):
  word('schoolmaster','tree-schoolmaster');word('steward','tree-steward');word('bailiff','tree-steward')
  for m in re.finditer(r'\bvicar\b',text):out.append((m.start(),m.end(),'old-vicar' if m.start()<text.find('trees') else 'new-vicar','reviewed-incumbent-context'))
  add(r'vicar.s wife|wife of the present incumbent|wife of the present man','new-vicar-wife')
 if loc==(69,0):word('N—','ill-n');add(r'friend of Charlotte.s','visitor')
 if loc==(80,1):
  add(r'man in a tattered coat|man in a shabby green coat','henry');word('father','henry-father');add(r'old woman','henry-mother')
 if loc==(81,0):word('father','judge')
 if ch==84:
  if pi in (4,10,40,109,111):word('father','judge')
  if pi in (14,15,18):word('judge','judge')
  if pi in (46,120,121):word('steward','judge');word('bailiff','judge')
  if pi in (10,12):word('widow','widow')
  if pi==10:add(r'murdered man|the victim','replacement')
  if pi in (12,13,15):word('prisoner','peasant')
  if pi==12:word('servant','peasant')
  if pi in (37,104):word('mother','mother')
  if pi in (42,45,48,83,84,91,100,101,102,103,106,114):word('servant','servant')
  if pi in (57,82):word('servant','charlotte-servant');word('maid','charlotte-servant')
  if pi==63:word('father','colma-father');word('brother','colma-brother')
  if pi==65:word('brother','colma-brother')
  if pi in (67,72):word('father','torman')
  if pi==71:word('mother','morar-mother');word('daughter','morglan-daughter')
  if pi==76:
   word('brother','erath-brother')
   # Last brother refers to Arindal, not Erath's deceased brother.
   bs=list(re.finditer(r'\bbrother\b',text))
   if len(bs)>1:
    m=bs[-1];out=[x for x in out if not(x[0]==m.start() and x[1]==m.end())];out.append((m.start(),m.end(),'arindal','reviewed-family-context'))
   word('father','armin')
  if pi==78:word('father','armin')
  if pi==90:word('mother','charlotte-mother')
  if pi==96:add(r'neighbouring official|neighboring official','albert-official')
  if pi==103:word('count','count-m')
  if pi==109:word('priest','priest')
  if pi==113:word('neighbour','neighbor');word('neighbor','neighbor')
  if pi in (114,115):word('surgeon','surgeon');word('doctor','surgeon');word('doctors','surgeon')
 return out
def compile_package():return assemble('werther',bind)
if __name__=='__main__':run('werther','The Sorrows of Young Werther',bind)
