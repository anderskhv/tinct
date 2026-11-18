from pathlib import Path
import json,re
def load(p):return json.loads(Path(p).read_text())
cs=[load('source/moby-dick-'+e+'.json')['chapters'] for e in ('original-en','modern-en','modern-da')]
if __name__=='__main__':
 for n in [24,34,36,40,42,56,57,60,62,65,71,73,75,84,88,95,100,132,135,136]:
  for ed in cs: print(n,ed[n-1]['title'],ed[n-1]['paragraphs'][0][:300])
