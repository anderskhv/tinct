from collate import *
import sys
pat=re.compile(r'\b(?:'+'|'.join(sys.argv[1:])+r')\b',re.I)
for c in read('modern-da.json')['chapters']:
 for i,p in enumerate(c['paragraphs'],1):
  for m in pat.finditer(p):print(f"{c['number']}.{i}",p[max(0,m.start()-24):m.end()+35])
