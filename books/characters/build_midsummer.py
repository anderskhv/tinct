"""Scene-scoped theatrical and fairy identities; no generic moon/lion matching."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'midsummer'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   flags=re.I if e['kind']=='person' or e['id'] in {'puck','peaseblossom','cobweb','moth','mustardseed','pyramus','thisbe'} else 0
   if e['id']=='fairy' and ch!=3:continue
   if e['id']=='moonshine' and ch not in {5,9}:continue
   if e['id']=='learning' and (ch,pi)!=(9,12):continue
   if e['id']=='helena' and alias=='Helen' and (ch,pi) in {(9,2),(9,53)}:continue
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,flags):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 for m in re.finditer(r'^ALL(?=\.)',text):out.append((m.start(),m.end(),'fairies' if ch==5 else 'players','reviewed-collective'))
 if (ch,pi)==(3,3):
  for pat,id in [(r'(?:lovely boy)','boy'),(r'Indian king','indian-king')]:
   for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-identity'))
 if (ch,pi)==(3,15):
  for m in re.finditer(r'His mother',text):out.append((m.start(),m.end(),'mother','reviewed-family'))
 if (ch,pi) in {(9,2),(9,53)}:
  for m in re.finditer(r'\bHelen\b',text):out.append((m.start(),m.end(),'helen-troy' if pi==2 else 'hero','reviewed-allusion'))
 return out
def compile_package():return assemble('midsummer',bind)
if __name__=='__main__':run('midsummer','A Midsummer Night’s Dream',bind)
