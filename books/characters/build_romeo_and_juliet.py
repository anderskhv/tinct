"""Reviewed household names, servants, guest-list syntax and textual apparatus exclusions."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'romeo-and-juliet'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 # Household surname in direct address can identify a younger person, not the father.
 montague_romeo={(8,23),(8,37),(25,18),(25,20),(25,85)}
 montague_family={(2,7),(2,9),(2,11),(6,17),(6,19),(6,56),(8,9),(8,13),(13,68),(13,71)}
 for n,m in enumerate(out):
  if m[2]=='montague' and text[m[0]:m[1]]=='Montague':
   id='romeo' if (ch,pi) in montague_romeo else 'montagues' if (ch,pi) in montague_family else None
   if id:out[n]=(*m[:2],id,'reviewed-context')
  if m[2]=='capulet' and text[m[0]:m[1]]=='Capulet':
   id='capulets' if (ch,pi) in [(6,44),(8,6)] else 'tybalt' if (ch,pi)==(13,26) else None
   if id:out[n]=(*m[:2],id,'reviewed-context')
 # Surnames inside the named tomb are place references.
 if (ch,pi) in [(23,4),(25,36)]:out=[m for m in out if m[2] not in ['capulet','capulets']]
 # Saint Peter's Church is a place, not the servant or an additional onstage person.
 out=[m for m in out if not(m[2]=='peter' and text[max(0,m[0]-6):m[0]]=='Saint ')]
 # Inherited doubled speaker tag: actual speech belongs to THIRD WATCH.
 if (ch,pi)==(25,74):out=[m for m in out if m[2]!='watch-first']
 if ch!=3:add('paris',r'\b(?:County|Count)\b(?! Paris)')
 # Single Francis/John words are deliberately not blind aliases (poor John is fish).
 if ch not in [24]:add('lawrence',r'\bFriar\b(?! (?:Lawrence|John))')
 for chapter,id in [(3,'invitation-servant'),(4,'dinner-servant'),(6,'torch-servant')]:
  if ch==chapter:add(id,r'(?<!FIRST )(?<!SECOND )\b(?:SERVANT|Servant)\b')
 for chapter,prefix in [(6,'feast'),(19,'wedding'),(21,'kitchen')]:
  if ch==chapter:
   add(prefix+'-first',r'FIRST SERVANT|First Servant|first Servant')
   add(prefix+'-second',r'SECOND SERVANT|Second Servant|second Servant')
 if (ch,pi)==(3,22):
  # Explicit noun phrases retain both a widow and her named deceased husband.
  add('utruvio-widow',r'(?:[Tt]he lady |the )widow')
  for id,pattern in [('martino-wife',r'his wife'),('martino-daughters',r'daughters'),('anselmo-sisters',r'his (?:beauteous|beautiful) sisters'),('placentio-nieces',r'his lovely nieces')]:
   m=re.search(pattern,text)
   if m:out.append((m.start(),m.end(),id,'reviewed-guest-list'))
  start=text.index('uncle Capulet');end=text.index('Rosaline')
  part=text[start:end]
  for id,pattern in [('uncle-wife',r'his wife'),('uncle-daughters',r'daughters')]:
   m=re.search(pattern,part)
   if m:out.append((start+m.start(),start+m.end(),id,'reviewed-guest-list'))
 if ch==4 and pi in [12,14]:add('nurse-husband',r'my husband')
 if (ch,pi)==(6,12):add('lucentio-son',r'[Hh]is son')
 if (ch,pi)==(6,50):add('tiberio-son',r'[Tt]he son and heir')
 if (ch,pi)==(24,4):
  add('friar-companion',r'a barefoot brother|a fellow friar');add('health-officials',r'the searchers of the town|the city health officials')
 if ch==25:add('watch',r'\bwatch\b')
 if edition=='modern-en' and (ch,pi) in [(9,13),(11,9)]:add('god',r'\bLord\b')
 if (ch,pi)==(11,17):add('mary',r'God[’\x27]s lady dear')
 return out

def compile_package():return assemble('romeo-and-juliet',bind)
if __name__=='__main__':run('romeo-and-juliet','Romeo and Juliet',bind)
