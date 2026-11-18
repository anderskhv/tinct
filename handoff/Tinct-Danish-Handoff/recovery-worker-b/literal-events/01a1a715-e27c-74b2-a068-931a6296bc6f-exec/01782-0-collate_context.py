from review_helpers import *
from bs4 import BeautifulSoup
from difflib import SequenceMatcher
import re
s=BeautifulSoup((p/'witness-gutenberg2554.html').read_text(),'html.parser')
ds=[d for d in s.select('div.chapter') if d.find(['h2','h3']) and d.find(['h2','h3']).get_text().strip().startswith(('CHAPTER','EPILOGUE'))]
o=rd('source-original-en.json');out=[]
for c,d in enumerate(ds,1):
 w=re.findall(r'\w+', ' '.join(e.get_text(' ',strip=True) for e in d.find_all(['p','pre'])).lower());slots=o['chapters'][c-1]['paragraphs'] if c<40 else o['chapters'][39]['paragraphs']+o['chapters'][40]['paragraphs'];r=[];ids=[]
 for i,v in enumerate(slots,1):
  a=re.findall(r'\w+',v.lower());r+=a;ids +=[i]*len(a)
 for tag,a,b,x,y in SequenceMatcher(None,w,r,autojunk=False).get_opcodes():
  if tag=='equal':continue
  out.append({'chapter':c,'slot':ids[min(x,len(ids)-1)],'witness':' '.join(w[max(0,a-9):min(len(w),b+9)]),'retained':' '.join(r[max(0,x-9):min(len(r),y+9)]),'diff':[w[a:b],r[x:y]]})
wr('collation-context.json',out)
for a in out:
 if a['chapter']<=14:print(a)
