from prep import *
import copy
D=copy.deepcopy(parent);E=rd('source-modern-en.json');led={'da':[],'en':[]}
for k,doc,b in [('da',D,da),('en',E,modern)]:
 for f in sorted(p.glob(f'patch-{k}-*.txt')):
  for ln in f.read_text().splitlines():
   if not ln:continue
   j,i,v=ln.split(' ',2);j=int(j);i=int(i);v=v.replace(' | ','\n')
   dest=doc['chapters'][j-1]['paragraphs'];before=b[j-1]['paragraphs'][i-1];assert dest[i-1]==before,(j,i)
   dest[i-1]=v;led[k].append({'episode':j,'slot':i,'original':en[j-1]['paragraphs'][i-1],'before':before,'after':v})
 wr('modern-'+k+'.json',doc);wr('working-'+k+'-changes.json',led[k])
