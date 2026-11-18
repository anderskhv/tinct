from pathlib import Path
import json,sys,re
p=Path(__file__).resolve().parents[1]
e,d,m=[json.loads((p/'reference'/(q+'.json')).read_text())['chapters'] for q in ['original-en','modern-da','modern-en']]
for i in range(int(sys.argv[1]),int(sys.argv[2])+1):
 s=d[i-1]['paragraphs']
 j=next((j for j in range(len(s)-1,0,-1) if len(s[j])<500),len(s)-1)
 print(i,j,e[i-1]['paragraphs'][j], ' | ',s[j])
