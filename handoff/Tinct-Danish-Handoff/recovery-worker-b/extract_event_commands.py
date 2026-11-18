import json,pathlib,subprocess,urllib.parse
r=pathlib.Path(__file__).parent;rows=[]
for saved in sorted(r.glob('*-exec.json')):
 ident=saved.name.removesuffix('-exec.json');p=next(pathlib.Path('/Users/andershvelplund/.codex/sessions/2026/11/04').glob('*'+ident+'*'));f=subprocess.Popen(['zstd','-dc',str(p)],stdout=subprocess.PIPE,text=True);ci=-1;seen=set()
 for line in f.stdout:
  q=json.loads(line).get('payload',{})
  if q.get('name')=='exec':ci+=1
  it=q.get('item',{})
  if it.get('type')=='CommandExecution' and it['id'] not in seen:
   seen.add(it['id']);cmd=it.get('command',[]);cwd=it.get('cwd','');cwd=urllib.parse.unquote(cwd.removeprefix('file://'))
   rows.append({'log':saved.name,'call':ci,'cmd':cmd[-1] if isinstance(cmd,list) else cmd,'cwd':cwd,'exit_code':it.get('exit_code'),'output':it.get('aggregated_output','')})
(r/'event-commands-evidence.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print(len(rows))
