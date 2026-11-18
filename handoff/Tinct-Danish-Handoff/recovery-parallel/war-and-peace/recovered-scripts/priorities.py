from collate import *
import sys
a=collections.defaultdict(list)
for f in (D/'qa').glob('verified-pairs-*.json'):
 c=int(f.stem.split('-')[-1])
 for p,l,d,s,t,m in json.loads(f.read_text()):
  if len(t)<30:continue
  a[c,p,l].append((s,d,t,m))
for l in ('da','en'):
 print(l)
 for val,(c,p,k),items in sorted((min(s for s,d,t,m in v)+max(-.24,-.035*sum(s<.42 for s,d,t,m in v)),k,v) for k,v in a.items() if k[2]==l)[:int(sys.argv[1])]:
  v=min(items);print(f'{c}.{p} {v[0]}',{0:'source',1:'draft'}[v[1]],v[2][:100], ' | ',v[3][:88])
