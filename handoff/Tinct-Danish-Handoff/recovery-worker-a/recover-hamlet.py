import pathlib,json,re,sys,ast,contextlib,io,shlex,urllib.request
root=pathlib.Path(__file__).parent;out=root/'reconstructed'/'hamlet';old='/tmp/tinct-da-prep-20261104/hamlet'
# Explicitly fetch public production witness, not historical shell.
# Source witness unavailable today (HTTP 503); reconstruct bodies first.
for lang in ['da','en']:(out/f'candidate-hamlet-modern-{lang}.json').write_bytes((out/f'source-hamlet-modern-{lang}.json').read_bytes())
rows=json.loads((root/'anna-hamlet-executed-commands.json').read_text());records=[]
def audit(event,args):
 if event=='open':
  path,mode,flags=args
  if (isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and flags & (1|2|64|512|1024)):
   if not isinstance(path,(str,bytes)) or not str(path).startswith(str(root)):raise RuntimeError('Write outside recovery blocked')
 if event.startswith(('subprocess.','socket.','os.system','os.remove','os.rename')):raise RuntimeError('External action blocked')
sys.addaudithook(audit)
def run(src,ordinal,filename='<recovery> ',argv=[]):
 src=src.replace(old,str(out))
 if ordinal in [16795,16809,16816]:records.append({'ordinal':ordinal,'skipped':'Gutenberg witness unavailable'});return
 if ordinal==17457:src='import json,pathlib\np=pathlib.Path('+repr(str(out))+')\n'+src[src.index("f=p/'candidate-hamlet-modern-da.json'"):]
 tree=ast.parse(src)
 imports=[]
 for n in ast.walk(tree):
  if isinstance(n,ast.Import):imports.extend(x.name.split('.')[0] for x in n.names)
  if isinstance(n,ast.ImportFrom):imports.append(n.module.split('.')[0])
 if set(imports)-{'json','pathlib','hashlib','re','sys'}:records.append({'ordinal':ordinal,'skip_imports':imports});return
 g={'__file__':filename,'__name__':'__main__'};save=sys.argv;sys.argv=[filename,*argv]
 try:
  with contextlib.redirect_stdout(io.StringIO()) as b:exec(compile(tree,filename,'exec'),g)
  records.append({'ordinal':ordinal,'ok':True,'stdout':b.getvalue()[:3000]})
 except Exception as e:records.append({'ordinal':ordinal,'error':str(e),'filename':filename})
 finally:sys.argv=save
pattern=re.compile(r"(?m)^cat (>>|>) ([^\n]+?) <<'([^']+)'\n(.*?)\n\3(?:\n|$)|^python3? - <<'([^']+)'\n(.*?)\n\5(?:\n|$)|^python3? (/tmp/tinct-da-prep-20261104/hamlet/[^\n]+)",re.S)
for row in rows:
 if old not in row['cmd'] or row['ordinal']<16795 or row['exit_code']!=0:continue
 for m in pattern.finditer(row['cmd']):
  if m[1]:
   dest=pathlib.Path(shlex.split(m[2])[0].replace(old,str(out)));assert dest.is_relative_to(out)
   with dest.open('a'if m[1]=='>>'else'w')as f:f.write(m[4]+'\n')
  elif m[5]:
   if 'write_' in m[6]:run(m[6],row['ordinal'])
  else:
   a=shlex.split(m[7]);f=pathlib.Path(a[0].replace(old,str(out)))
   if f.name=='finalize-packet.py':continue
   run(f.read_text(),row['ordinal'],str(f),a[1:])
(root/'hamlet-reconstruction-report.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print(json.dumps([x for x in records if 'error'in x or 'skip_imports'in x],indent=2));print('replayed',len(records))
