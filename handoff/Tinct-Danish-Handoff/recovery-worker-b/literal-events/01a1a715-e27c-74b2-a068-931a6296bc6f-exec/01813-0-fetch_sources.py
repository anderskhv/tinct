import subprocess,json,base64,pathlib,concurrent.futures,requests
p=pathlib.Path(__file__).parent
files={k:'app/public/data/editions/essays-montaigne-'+k+'.json' for k in ['original-en','modern-en','modern-da']};files.update({'onboarding-en':'app/public/data/onboarding/essays-montaigne.json','onboarding-da':'app/public/data/onboarding/essays-montaigne.da.json'})
def f(k):
 q=json.loads(subprocess.check_output(['gh','api','repos/anderskhv/tinct/contents/'+files[k]],text=True));content=base64.b64decode(q.get('content',''))
 if not content: content=subprocess.check_output(['gh','api','repos/anderskhv/tinct/git/blobs/'+q['sha'],'--jq','.content']);content=base64.b64decode(content)
 obj=json.loads(content);(p/('source-'+k+'.json')).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
 if k!='original-en':(p/(k+'.json')).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
 return k,{'path':files[k],'sha':q['sha'],'size':q['size'],'ref':'main','readDate':'2026-11-09'}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:results=dict(ex.map(f,files))
(p/'provenance.json').write_text(json.dumps(results,indent=2)+'\n')
r=requests.get('https://www.gutenberg.org/files/3600/3600-h/3600-h.htm',timeout=60);r.raise_for_status();(p/'witness-gutenberg3600.html').write_text(r.text)
for k in files:
 o=json.loads((p/('source-'+k+'.json')).read_text());print(k,list(o),len(o.get('chapters',[])),sum(len(c['paragraphs']) for c in o.get('chapters',[])))
