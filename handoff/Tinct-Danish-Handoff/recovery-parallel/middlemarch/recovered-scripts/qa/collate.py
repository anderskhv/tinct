from pathlib import Path
from xml.etree import ElementTree as ET
from difflib import SequenceMatcher
import re,json
P=Path(__file__).resolve().parents[1]; SE=P/'reference/se/src/epub/text'
def tok(s):return re.findall(r'[^\W_]+',s.lower())
rows=[]
for ix,c in enumerate(json.loads((P/'reference/original-en.json').read_text())['chapters']):
 f='preface' if ix==0 else 'epilogue' if ix==87 else f'chapter-{ix}'
 body=ET.parse(SE/(f+'.xhtml')).getroot().find('.//{*}body')
 for node in body.iter():
  for tag in list(node):
   if tag.tag.rsplit('}',1)[-1] in ('h2','h3'):node.remove(tag)
 vals=tok(''.join(body.itertext()));a=tok(' '.join(c['paragraphs'])); sm=SequenceMatcher(None,a,vals,autojunk=False)
 diff=[]
 for op,i,j,k,l in sm.get_opcodes():
  if op=='equal':continue
  diff.append(dict(op=op,witness=' '.join(a[i:j]),secondary=' '.join(vals[k:l]),before=' '.join(a[max(0,i-8):i])))
 rows.append(dict(unit=ix+1,secondaryFile=f,referenceWords=len(a),secondaryWords=len(vals),variations=diff))
(P/'qa/secondary-collation.json').write_text(json.dumps(rows,ensure_ascii=False,indent=1))
for row in rows:
 for d in row['variations']:
  if max(len(d['witness'].split()),len(d['secondary'].split()))>=5:print(row['unit'],d)
