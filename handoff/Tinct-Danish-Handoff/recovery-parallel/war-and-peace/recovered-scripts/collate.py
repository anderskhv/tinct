from pathlib import Path
import json,re,hashlib,collections,copy
D=Path(__file__).resolve().parent
def read(p):return json.loads((D/p).read_text())
def put(p,data):
 dest=D/p
 dest.with_suffix('.tmp').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
 dest.with_suffix('.tmp').replace(dest)
def parse():
 raw=(D/'input/pg2600.txt').read_text(encoding='utf-8-sig').split('*** END OF THE PROJECT GUTENBERG')[0]
 raw=raw[raw.rindex('BOOK ONE: 1805'):]
 out=[]; buff=[]; heading=None
 for line in raw.splitlines()+['BOOK END:']:
  if re.fullmatch(r'(?:BOOK [A-Z]+:.*|FIRST EPILOGUE:.*|SECOND EPILOGUE|CHAPTER [IVXLC]+)',line):
   if buff and heading:
    ps=[' '.join(p.split()) for p in re.split(r'\n\s*\n','\n'.join(buff).strip()) if p.strip()]
    if ps:out.append((book,heading,ps))
   buff=[];heading=None
   if line.startswith('CHAPTER'):heading=line
   else:book=line
  else:buff.append(line)
 return out
if __name__=='__main__':
 src=parse()
 a=read('input/war-and-peace-original-en.json')['chapters']
 print(len(src),len(a))
 mismatches=[(i+1,x[0],len(x[2]),len(y['paragraphs'])) for i,(x,y) in enumerate(zip(src,a)) if x[2]!=y['paragraphs']]
 print(len(mismatches),mismatches[:30])
 for i,_,_,_ in mismatches[:5]:
  for j,(p,q) in enumerate(zip(src[i-1][2],a[i-1]['paragraphs'])):
   if p!=q:print(i,j,repr(p[:150]),repr(q[:150]));break
