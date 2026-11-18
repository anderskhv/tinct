import json,sys
from pathlib import Path
ch,start=int(sys.argv[1]),int(sys.argv[2]);f=Path('fear-and-trembling-modern-da.json');d=json.loads(f.read_text());p=d['chapters'][ch-1]['paragraphs'];a=Path(sys.argv[3]).read_text().strip().split('\n\n');assert len(a)==int(sys.argv[4]);p[start-1:start-1+len(a)]=a;f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
s=json.load(open('state.json'));s.update(reviewedDanishSlots=s['reviewedDanishSlots']+len(a),lastRange=f'{ch}:{start}–{start+len(a)-1}');Path('state.json').write_text(json.dumps(s,indent=2))
