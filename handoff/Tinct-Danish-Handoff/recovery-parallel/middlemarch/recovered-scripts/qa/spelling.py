from pathlib import Path
from collections import Counter
import re,json,subprocess
P=Path(__file__).resolve().parents[1]
src=json.loads((P/'reference/modern-da.json').read_text())['chapters']
words=Counter(t for c in src for p in c['paragraphs'] for t in re.findall(r"[^\W\d_]+",p) if t.islower() and len(t)>2)
p=subprocess.run(['hunspell','-d','/tmp/tinct-ge-dictionary/da_DK','-l'],input='\n'.join(words)+'\n',capture_output=True,text=True,check=True)
flags=sorted(set(p.stdout.splitlines()))
(P/'qa/spelling-queue.txt').write_text('\n'.join(f'{t} {words[t]}' for t in flags))
print(len(flags)); print(' '.join(flags[:400]))
