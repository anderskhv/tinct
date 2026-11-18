from pathlib import Path
import json, re,sys
p=Path(__file__).parent
def rd(f):return json.loads((p/f).read_text())
def wr(f,v):(p/f).write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
en=rd('source-original-en.json')['chapters'];parent=rd('source-modern-da.json');da=parent['chapters'];modern=rd('source-modern-en.json')['chapters']
def view(c,l=1,h=9999):
 for i in range(l,min(h,len(en[c-1]['paragraphs']))+1):print(i,en[c-1]['paragraphs'][i-1], '\n',da[c-1]['paragraphs'][i-1])
def apply(c,f,end):
 out=rd('modern-da.json') if (p/'modern-da.json').exists() else rd('source-modern-da.json')
 a=out['chapters'][c-1]['paragraphs']
 for line in (p/f).read_text().splitlines():
  n,s=line.split(' ',1);i=int(n)-1
  sp=re.match(r'^([A-ZÆØÅÉ][A-ZÆØÅÉ .’-]*?\. )',da[c-1]['paragraphs'][i]);a[i]=('' if s.startswith('!') or not sp else sp.group(0))+s.removeprefix('!').replace(' | ','\n')
 wr('modern-da.json',out);r=rd('review-progress.json') if (p/'review-progress.json').exists() else {};r[str(c)]=end;wr('review-progress.json',r)
if __name__=='__main__':view(*map(int,sys.argv[1:]))
