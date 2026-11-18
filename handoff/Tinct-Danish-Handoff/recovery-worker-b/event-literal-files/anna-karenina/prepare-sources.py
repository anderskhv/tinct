import json,pathlib,urllib.request,concurrent.futures
p=pathlib.Path(__file__).parent
sha=json.load(urllib.request.urlopen('https://api.github.com/repos/anderskhv/tinct/commits/main'))['sha'];(p/'SOURCE-COMMIT.txt').write_text(sha+'\n')
paths=[f'app/public/data/editions/anna-karenina-{e}.json' for e in ['original-en','modern-en','modern-da']]+[f'app/public/data/onboarding/anna-karenina{s}.json' for s in ['', '.da']]
def get(path):
 b=urllib.request.urlopen(f'https://raw.githubusercontent.com/anderskhv/tinct/{sha}/{path}').read();(p/('source-'+path.rsplit('/',1)[1])).write_bytes(b);return path,len(b)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as e:
 for r in e.map(get,paths):print(r)
for lang in ['da','en']:
 x=json.loads((p/f'source-anna-karenina-modern-{lang}.json').read_text());(p/f'candidate-anna-karenina-modern-{lang}.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');print(lang,len(x['chapters']),sum(len(c['paragraphs']) for c in x['chapters']))
(p/'PROGRESS.json').write_text(json.dumps({'status':'sources downloaded; review not begun','reviewed_chapters':[],'native_review':'pending','release_authorized':False},indent=2)+'\n')
