import pathlib,json,re,shlex
r=pathlib.Path(__file__).parent;vfs={};events=[];prefix='/tmp/tinct-da-prep-20261104/'
for row in json.load(open(r/'event-commands-evidence.json')):
 cmd=row['cmd'];cwd=row['cwd'];m=re.search(r'(?:^|&&|;)\s*cd\s+([^\s;&]+)',cmd)
 if m:cwd=m[1]
 for hm in re.finditer(r'(?:^|\n|&&|;)\s*cat\s+(>{1,2})\s*([^\n]+?)\s*<<\s*[\'\"]?([A-Za-z_][\w]*)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[3])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  path=hm[2].strip().strip("'\"");path=path if path.startswith('/') else cwd+'/'+path
  if not path.startswith(prefix):continue
  body=cmd[hm.end():hm.end()+end.start()];vfs[path]=(vfs.get(path,'') if hm[1]=='>>' else '')+body
  events.append({'log':row['log'],'call':row['call'],'path':path,'kind':'cat','mode':hm[1]})
 if cmd.startswith("printf '%s' "):
  try:
   tok=shlex.split(cmd)
   if len(tok)==5 and tok[0]=='printf' and tok[1]=='%s' and tok[3] in ['>','>>'] and tok[4].startswith(prefix):
    path=tok[4];vfs[path]=(vfs.get(path,'') if tok[3]=='>>' else '')+tok[2];events.append({'log':row['log'],'call':row['call'],'path':path,'kind':'printf','mode':tok[3]})
  except ValueError:pass
for path,body in vfs.items():
 rel=path[len(prefix):]
 if '..' in pathlib.Path(rel).parts:continue
 out=r/'event-literal-files'/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(body)
(r/'event-literal-manifest.json').write_text(json.dumps(events,ensure_ascii=False,indent=2))
from collections import Counter
print('files',len(vfs),'writes',len(events));print(Counter(x[len(prefix):].split('/')[0] for x in vfs))
