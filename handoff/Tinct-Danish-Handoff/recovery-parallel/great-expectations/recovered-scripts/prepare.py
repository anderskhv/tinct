from pathlib import Path
import json, hashlib,re,subprocess,sys,difflib
p=Path(__file__).parent; repo=Path.home()/'Developer/Tinct'; src=p/'sources'
def put(q,obj): q.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
def get(q):return json.loads(q.read_text())
def hyd():
 tree=dict(x.split('\t') for x in (src/'github-main-tree.tsv').read_text().splitlines())
 prov={}
 for k,v in {'modern-da':'app/public/data/editions/great-expectations-modern-da.json','original-en':'app/public/data/editions/great-expectations-original-en.json','modern-en':'app/public/data/editions/great-expectations-modern-en.json','wip-da':'books/wip/great-expectations/editions/great-expectations-modern-da.json','onboarding-da':'app/public/data/onboarding/great-expectations.da.json','onboarding-en':'app/public/data/onboarding/great-expectations.json','primer-da':'app/public/lab/library_2/primer-data/great-expectations.da.json','primer-en':'app/public/lab/library_2/primer-data/great-expectations.en.json','gutenberg-1400':'books/raw/great-expectations/raw.txt'}.items():
  name=k+Path(v).suffix; q=src/name
  b=subprocess.run(['git','-C',str(repo),'cat-file','blob',tree[v]],capture_output=True)
  if b.returncode:
   import base64
   b=base64.b64decode(json.loads(subprocess.check_output(['gh','api',f'repos/anderskhv/tinct/git/blobs/{tree[v]}']))['content'])
  else:b=b.stdout
  assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==tree[v]
  q.write_bytes(b);prov[name]={'path':v,'commit':'a1ee0ffda8de113b06814e2986802f90e24eccff','blob':tree[v],'sha256':hashlib.sha256(b).hexdigest()}
 put(src/'provenance.json',prov)
if __name__=='__main__' and sys.argv[-1]=='hydrate':hyd()
