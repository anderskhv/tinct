from prep import *
import re
def patchscene(c,filename,end=None):
 a=rd('modern-da.json')['chapters'][c-1]['paragraphs'];ed={}
 for l in (p/filename).read_text().splitlines():
  if not l:continue
  n,s=l.split(' ',1);i=int(n);prefix=re.match(r'^([A-ZÆØÅ][A-ZÆØÅ .’-]+?\. )',a[i-1]);ed[i]=(prefix.group(0) if prefix and not s.startswith('!') else '')+s.removeprefix('!').replace(' | ','\n')
 save(c,ed,end or len(a))
