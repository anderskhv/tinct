exec(open('audit.py').read().split('aud=[]')[0]);import bisect
from collections import defaultdict
out=[]
for i,o in enumerate(ds[0],1):
 a=s.find(id=f'chap{i+1:02}').parent.parent;a.h2.extract();words=[];spans=[];orig=[];oc=[]
 for j,p in enumerate(o['paragraphs'],1):
  vals=w(p);orig+=vals;oc += [j]*len(vals)
 for t in a.find_all(recursive=False):
  token=w(t.get_text(' ',strip=True));lo=len(words);words+=token;spans.append((lo,len(words),t))
 mt=difflib.SequenceMatcher(None,words,orig,autojunk=True);m={}
 for lo,ro,z in mt.get_matching_blocks():
  for k in range(z):m[lo+k]=ro+k
 for lo,hi,t in spans:
  if t.name=='pre' or t.get('class') in [['poem'],['fig']] or (t.find('br') and t.name!='h2') or t.get('class')==['center']:
   slots=sorted({oc[m[k]] for k in range(lo,hi) if k in m});txt=t.get_text(separator='',strip=False).replace('\r','').strip()
   if not slots:
    prev=next((oc[m[k]] for k in range(lo-1,-1,-1) if k in m),None);nxt=next((oc[m[k]] for k in range(hi,len(words)) if k in m),None)
   else:prev=nxt=None
   out.append(dict(ch=i,slots=slots,prev=prev,next=nxt,typ=t.name if t.name=='pre' else ' '.join(t.get('class',[])),text=txt,html=str(t)))
save('special-source-slot-map.json',out)
for k,x in enumerate(out):print(k,x['ch'],x['slots'],x['typ'],x['text'][:45])
