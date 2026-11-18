from prep import *
import copy
V=rd('source-witness-variants.json')
holes={(x['scene'],x['slot']+int((x['scene'],x['slot']) in [(5,12),(7,3),(13,8)])) for x in V}
D=copy.deepcopy(parent);mapping={}
for j,c in enumerate(en,1):
 n=0;d=[]
 for i,s in enumerate(c['paragraphs'],1):
  if (j,i) in holes:d.append('');src=None
  else: d.append(da[j-1]['paragraphs'][n]);n+=1;src=n
  mapping[f'{j}.{i}']=src
 assert n==len(da[j-1]['paragraphs']),j
 D['chapters'][j-1]['paragraphs']=d
wr('alignment.json',mapping);wr('aligned-da.json',D)
for j,i in sorted(holes):print(j,i,en[j-1]['paragraphs'][i-1])
