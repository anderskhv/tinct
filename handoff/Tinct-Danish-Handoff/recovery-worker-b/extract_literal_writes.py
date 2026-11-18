import pathlib,json,re,ast,hashlib
root=pathlib.Path(__file__).parent
prefix='/tmp/tinct-da-prep-20261104/'
manifest=[];commands=[]
for log in sorted(root.glob('*-exec.json')):
 for ci,call in enumerate(json.loads(log.read_text())):
  for mi,m in enumerate(re.finditer(r'\bcmd\s*:\s*("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')',call,re.S)):
   try:cmd=json.loads(m[1]) if m[1][0]=='"' else ast.literal_eval(m[1])
   except:continue
   wm=re.search(r'\bworkdir\s*:\s*("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')',call)
   try:cwd=ast.literal_eval(wm[1]) if wm else ''
   except:cwd=''
   commands.append({'log':log.name,'call':ci,'cmd':cmd,'cwd':cwd})
   for hm in re.finditer(r'(?:^|\n)cat\s+(>{1,2})\s*([^\n]+?)\s*<<\s*[\'\"]?([A-Za-z_][\w]*)[\'\"]?\s*\n',cmd):
    end=re.search(r'^'+re.escape(hm[3])+r'\s*$',cmd[hm.end():],re.M)
    if not end:continue
    path=hm[2].strip().strip("'\""); body=cmd[hm.end():hm.end()+end.start()]
    if not path.startswith('/') and cwd:path=cwd+'/'+path
    if not path.startswith(prefix):continue
    relative=path[len(prefix):]
    if '..' in pathlib.Path(relative).parts:continue
    out=root/'literal-files'/relative;out.parent.mkdir(parents=True,exist_ok=True)
    if hm[1]=='>>':
     if out.exists():out.write_text(out.read_text()+body)
     else:out.write_text(body)
    else:out.write_text(body)
    ev=root/'literal-events'/log.stem/f'{ci:05}-{mi}-{pathlib.Path(relative).name}';ev.parent.mkdir(parents=True,exist_ok=True);ev.write_text(body)
    manifest.append({'log':log.name,'call':ci,'old_path':path,'relative_path':relative,'mode':hm[1],'bytes':len(body.encode()),'sha256':hashlib.sha256(body.encode()).hexdigest(),'event':str(ev)})
(root/'literal-writes-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(root/'commands-evidence.json').write_text(json.dumps(commands,ensure_ascii=False,indent=2))
from collections import Counter
print('commands',len(commands),'literal writes',len(manifest));print(Counter(x['relative_path'].split('/')[0] for x in manifest))
