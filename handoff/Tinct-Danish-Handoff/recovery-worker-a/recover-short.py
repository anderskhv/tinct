import pathlib,json,re,sys,ast,contextlib,io,shlex,os,shutil
root=pathlib.Path(__file__).parent;book=sys.argv[1];out=root/'reconstructed'/book;old='/tmp/tinct-da-prep-20261104/'+book;out.mkdir(exist_ok=True);other=root.parent/'recovery-worker-b';base=pathlib.Path('/Users/andershvelplund/Developer/Tinct/app/public/data')
for src in list((base/'editions').glob(book+'-*.json'))+list((base/'onboarding').glob(book+'*.json')):
 if src.name.endswith('threads.json'):continue
 (out/('source-'+src.name)).write_bytes(src.read_bytes())
if book in ['to-the-lighthouse','leviathan']:
 for f in (other/'filechange-files'/book).iterdir():(out/f.name).write_bytes(f.read_bytes())
for src in (other/'event-literal-files'/book).iterdir():(out/src.name).write_bytes(src.read_bytes())
if book=='ulysses':
 for f in out.glob('patch-*.txt'):f.unlink()
rows=json.loads((other/'event-commands-evidence.json').read_text());rows=[x for x in rows if old in x['cmd']+x['cwd']]
if book=='beyond-good-and-evil':rows=json.loads((root/'kant-beyond-commands.json').read_text())+rows
records=[]
def audit(event,args):
 if event=='open':
  path,mode,flags=args
  if (isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and flags & (1|2|64|512|1024)):
   if not isinstance(path,(str,bytes)) or not str(pathlib.Path(path).absolute()).startswith(str(root)):raise RuntimeError('Write outside recovery blocked')
 if event.startswith(('subprocess.','socket.','os.system','os.remove','os.rename')):raise RuntimeError('External action blocked')
sys.addaudithook(audit);os.chdir(out);sys.path.insert(0,str(out));sys.dont_write_bytecode=True
helpers={f.stem for f in out.glob('*.py')}|{'prep','edithelpers'}
def run(src,idx,filename='<recovery>',argv=[]):
 src=src.replace('/private'+old,str(out)).replace(old,str(out))
 if book=='ulysses' and str(idx).endswith((':1027',':1028')) and 'requests' in src:
  src=src.replace('import sys,requests,re','import sys,re').replace('import sys,requests','import sys').replace('from bs4 import BeautifulSoup','')
  src=src.split('\ns=requests.get')[0].split('\nb=BeautifulSoup')[0]
 try:tree=ast.parse(src)
 except SyntaxError as e:records.append({'call':idx,'syntax_error':str(e)});return
 imports=[]
 for n in ast.walk(tree):
  if isinstance(n,ast.Import):imports.extend(x.name.split('.')[0] for x in n.names)
  if isinstance(n,ast.ImportFrom):imports.append(n.module.split('.')[0])
 if set(imports)-({'json','pathlib','hashlib','re','sys','copy','unicodedata','collections','datetime','difflib','xml','bs4','bisect','glob'}|helpers):records.append({'call':idx,'skip_imports':imports});return
 if any(isinstance(n,ast.Name) and n.id in {'__import__','eval'} for n in ast.walk(tree)):return
 g={'__file__':filename,'__name__':'__main__'};save=sys.argv;sys.argv=[filename,*argv]
 try:
  with contextlib.redirect_stdout(io.StringIO())as b:exec(compile(tree,filename,'exec'),g)
  records.append({'call':idx,'ok':True,'filename':filename,'stdout':b.getvalue()[:1000]})
 except Exception as e:records.append({'call':idx,'error':str(e),'filename':filename})
 finally:sys.argv=save
pat=re.compile(r"(?m)^cat (>>|>) *([^\n]+?) <<'([^']+)'\n(.*?)\n\3(?:\n|$)|^python3? - <<'([^']+)'\n(.*?)\n\5(?:\n|$)|^python3? ([^\n]+)",re.S)
for row in rows:
 cmd=row['cmd'];idx=str(row['log'])+':'+str(row['call'])
 if cmd.startswith('python3 -c '):
  args=shlex.split(cmd);run(args[2],idx,argv=args[3:]);continue
 if cmd.startswith('printf '):
  try:
   t=shlex.split(cmd)
   if len(t)==4 and t[3].startswith('>'):
    red='>>'if t[3].startswith('>>')else'>';t=[*t[:3],red,t[3][len(red):]]
   if len(t)==5 and t[3]in['>','>>'] and t[4].startswith(old+'/'):
    f=pathlib.Path(t[4].replace(old,str(out)));f.parent.mkdir(parents=True,exist_ok=True)
    with f.open('a'if t[3]=='>>'else'w')as h:h.write(t[2])
  except Exception as e:records.append({'call':idx,'printf_error':str(e)})
 # Normalize only the known directory-change prefix, never execute shell.
 cmd=re.sub(r'(?m)^cd '+re.escape(old)+r'\s*(?:&&|;)\s*','',cmd)
 cmd=re.sub(r"(?m)^(python3? [^\n]*?) && (cat [^\n]+)",r"\1\n\2",cmd)
 for m in pat.finditer(cmd):
  if m[1]:
   dest=pathlib.Path(shlex.split(m[2])[0].replace(old,str(out)));dest=dest if dest.is_absolute()else out/dest
   if not dest.is_relative_to(out):continue
   with dest.open('a'if m[1]=='>>'else'w')as f:f.write((m[4].replace(old,str(out))if dest.suffix=='.py'else m[4])+'\n')
  elif m[5]:
   code=m[6]
   if any(t in code for t in ['write_','.write(','json.dump(','exec(','save(','edit(','wr(','fix(','setslot(']):run(code,idx)
  else:
   if 'SyntaxError:'in(row.get('output')or''):continue
   try:a=shlex.split(m[7])
   except:continue
   if a[0]=='-c':
    run(a[1],idx,argv=a[2:]);continue
   try:f=pathlib.Path(a[0].replace(old,str(out)));f=f if f.is_absolute()else out/f
   except:continue
   if not f.is_relative_to(out)or not f.exists():continue
   # Script text has no external tools; run applies only text changes inside recovery directory.
   run(f.read_text(),idx,str(f),a[1:])
(root/(book+'-reconstruction-report.json')).write_text(json.dumps(records,ensure_ascii=False,indent=2));print(json.dumps([x for x in records if 'error'in x or 'skip_imports'in x],indent=2));print('actions',len(records))
