from review import *
import sys
def sort(l):return sorted(l,key=lambda r:r[0])
pats=[]
for p in Path('chapters').glob('semantic*'):
 n=int(p.stem[-3:])
 if not(int(sys.argv[2])<=n<=int(sys.argv[3])):continue
 for d in load(p):
  if d['language']!=sys.argv[1]:continue
  j=d['paragraph'];t=cs[2 if sys.argv[1]=='da' else 1][n-1]['paragraphs'][j-1]
  if len(t)>int(sys.argv[4]):continue
  pats.append((d['score'],n,j,d['source'],t))
for score,n,j,s,t in sort(pats)[:int(sys.argv[5])]: print(f'{n}.{j} {score}: {s[:255]} || {t[:320]}')
