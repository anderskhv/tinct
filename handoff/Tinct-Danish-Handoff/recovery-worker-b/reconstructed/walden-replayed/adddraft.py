import json,sys
from pathlib import Path
f=Path('walden-modern-da.partial.json')
d=json.loads(f.read_text());p=Path(sys.argv[1]);updates=json.loads(p.read_text())
for k,v in updates.items():
 c,i=map(int,k.split(':'));d['chapters'][c-1]['paragraphs'][i-1]=v
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
exec(Path('checkpoint.py').read_text())
