from revise import load,write,p
from bs4 import BeautifulSoup
import re,difflib,unicodedata
s=BeautifulSoup((p/'source-standardebooks.xhtml').read_bytes(),'html.parser');orig=load('source-original-en.json');stats=[]
norm=lambda s: re.findall(r'[a-z0-9]+',unicodedata.normalize('NFKD',s).lower().replace('\u00ad','').replace('\u2060',''))
for n,(c,e) in enumerate(zip(orig['chapters'],s.select('section[epub\\:type="chapter"]')),1):
 raw=' '.join(z.get_text('',strip=False)for z in e.select('p'));x=norm(' '.join(c['paragraphs']));y=norm(raw);ops=[]
 for tag,i,j,k,l in difflib.SequenceMatcher(None,x,y,autojunk=False).get_opcodes():
  if tag!='equal':ops.append({'type':tag,'repo':' '.join(x[i:j]),'witness':' '.join(y[k:l]),'ctx':' '.join(x[max(0,i-4):min(len(x),j+4)])})
 stats.append({'chapter':n,'repoTokens':len(x),'primaryTokens':len(y),'editionsMatch':x==y,'diff':ops})
print('matched',sum(z['editionsMatch']for z in stats),'of',len(stats),'diffs',sum(len(z['diff'])for z in stats));
for z in stats:
 if z['diff']:print(z['chapter'],str(z['diff'])[:500]);
write('source-completeness-audit.json',{'primaryUrl':'https://standardebooks.org/ebooks/virginia-woolf/to-the-lighthouse/text/single-page','chapters':stats,'otherWitness':'Gutenberg Australia uses variant wording and14 final-part subdivisions; Standard Ebooks, like repo, has13. Do not merge editions mechanically.'})
