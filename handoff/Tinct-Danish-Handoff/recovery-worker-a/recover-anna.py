import pathlib,json,re,sys,ast,contextlib,io,shlex,os
root=pathlib.Path(__file__).parent;out=root/'reconstructed'/'anna-karenina';old='/tmp/tinct-da-prep-20261104/anna-karenina';out.mkdir(exist_ok=True)
base=pathlib.Path('/Users/andershvelplund/Developer/Tinct/app/public/data')
for src in list((base/'editions').glob('anna-karenina-*.json'))+list((base/'onboarding').glob('anna-karenina*.json')):
 if src.name.endswith('threads.json'):continue
 (out/('source-'+src.name)).write_bytes(src.read_bytes())
for lang in ['da','en']:(out/f'candidate-anna-karenina-modern-{lang}.json').write_text(json.dumps(json.loads((out/f'source-anna-karenina-modern-{lang}.json').read_text()),ensure_ascii=False,indent=2)+'\n')
for n in ['DANISH-REPAIRS.json','ENGLISH-REPAIRS.json']:(out/n).write_text('[]')
rows=json.loads((root/'anna-executed-full.json').read_text());records=[]
def audit(event,args):
 if event=='open':
  path,mode,flags=args
  if (isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and flags & (1|2|64|512|1024)):
   if not isinstance(path,(str,bytes)) or not str(pathlib.Path(path).absolute()).startswith(str(root)):raise RuntimeError('Write outside recovery blocked')
 if event.startswith(('subprocess.','socket.','os.system','os.remove','os.rename')):raise RuntimeError('External action blocked')
sys.addaudithook(audit);os.chdir(out)
def run(src,ordinal,filename='<recovery>',argv=[]):
 src=src.replace(old,str(out))
 try:tree=ast.parse(src)
 except SyntaxError as e:records.append({'ordinal':ordinal,'syntax_error':str(e)});return
 imports=[]
 for n in ast.walk(tree):
  if isinstance(n,ast.Import):imports.extend(x.name.split('.')[0] for x in n.names)
  if isinstance(n,ast.ImportFrom):imports.append(n.module.split('.')[0])
 if set(imports)-{'json','pathlib','hashlib','re','sys','copy','unicodedata','collections','datetime'}:records.append({'ordinal':ordinal,'skip_imports':imports});return
 # No arbitrary dynamic code, subprocess, system, or network use allowed.
 if any(isinstance(n,ast.Name) and n.id in {'eval','exec','__import__'} for n in ast.walk(tree)):records.append({'ordinal':ordinal,'skip_dynamic':True});return
 g={'__file__':filename,'__name__':'__main__'};save=sys.argv;sys.argv=[filename,*argv]
 try:
  with contextlib.redirect_stdout(io.StringIO()) as b:exec(compile(tree,filename,'exec'),g)
  records.append({'ordinal':ordinal,'ok':True,'filename':filename,'stdout':b.getvalue()[:1500]})
 except Exception as e:records.append({'ordinal':ordinal,'error':str(e),'filename':filename})
 finally:sys.argv=save
pattern=re.compile(r"(?m)^cat (>>|>) ([^\n]+?) <<'([^']+)'\n(.*?)\n\3(?:\n|$)|^python3? - <<'([^']+)'\n(.*?)\n\5(?:\n|$)|^python3? ([^\n]+)",re.S)
for row in rows:
 if row['ordinal']<9927:continue
 for m in pattern.finditer(row['cmd']):
  if m[1]:
   dest=pathlib.Path(shlex.split(m[2])[0].replace(old,str(out)));dest=dest if dest.is_absolute()else out/dest
   if not dest.is_relative_to(out):continue
   with dest.open('a'if m[1]=='>>'else'w')as f:f.write(m[4]+'\n')
  elif m[5]:
   if 'write_' in m[6] or '.write('in m[6] or 'json.dump('in m[6]:run(m[6],row['ordinal'])
  else:
   if 'SyntaxError:'in (row.get('output')or''):records.append({'ordinal':row['ordinal'],'historical_syntax_failure_skipped':True});continue
   a=shlex.split(m[7]);f=pathlib.Path(a[0].replace(old,str(out)));f=f if f.is_absolute()else out/f
   if not f.is_relative_to(out)or not f.exists():continue
   run(f.read_text(),row['ordinal'],str(f),a[1:])
(root/'anna-reconstruction-report.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print(json.dumps([x for x in records if 'error'in x or 'skip_imports'in x or 'skip_dynamic'in x],indent=2));print('replayed',len(records))
