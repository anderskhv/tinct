# Controlled reconstruction: no shell commands are executed. Historical Python uses
# restricted imports and an in-memory filesystem, then only recovered files export.
import pathlib,json,re,ast,types,hashlib,copy,collections,builtins
R=pathlib.Path(__file__).parent; old='/tmp/tinct-da-prep-20261104/don-quixote';vfs={};errors=[];done=[]
base=pathlib.Path('/Users/andershvelplund/Developer/Tinct/app/public/data')
for lang in ['original-en','modern-en','modern-da']:
 vfs[old+'/source-don-quixote-'+lang+'.json']=(base/'editions'/f'don-quixote-{lang}.json').read_bytes()
for lang in ['', '.da']:
 p=base/'onboarding'/f'don-quixote{lang}.json'
 if p.exists():vfs[old+'/source-don-quixote'+lang+'.json']=p.read_bytes()
vfs[old+'/don-quixote-modern-da.json']=vfs[old+'/source-don-quixote-modern-da.json']
vfs[old+'/don-quixote-modern-en.json']=vfs[old+'/source-don-quixote-modern-en.json']
vfs[old+'/progress.json']=b'{}'
class P:
 def __init__(self,s):self.s=str(s)
 def __str__(self):return self.s
 def __lt__(self,x):return self.s<str(x)
 def __fspath__(self):return self.s
 def __truediv__(self,x):return P(self.s+'/'+str(x))
 @property
 def parent(self):return P(self.s.rsplit('/',1)[0])
 @property
 def name(self):return self.s.rsplit('/',1)[-1]
 def exists(self):return self.s in vfs
 def read_bytes(self):return vfs[self.s]
 def read_text(self,*a,**kw):return self.read_bytes().decode(kw.get('encoding','utf-8'))
 def write_bytes(self,b):
  if not self.s.startswith(old+'/'):raise ValueError('outside book')
  vfs[self.s]=bytes(b);return len(b)
 def write_text(self,s,*a,**kw):return self.write_bytes(s.encode('utf-8'))
 def mkdir(self,*a,**kw):pass
 def stat(self):return types.SimpleNamespace(st_size=len(self.read_bytes()))
 def glob(self,pat):
  import fnmatch
  return [P(k) for k in vfs if k.startswith(self.s+'/') and fnmatch.fnmatch(k[len(self.s)+1:],pat)]
 def is_file(self):return self.exists()
mods={'json':json,'pathlib':types.SimpleNamespace(Path=P),'re':re,'hashlib':hashlib,'copy':copy,'collections':collections,'shutil':types.SimpleNamespace(copyfile=lambda a,b:P(b).write_bytes(P(a).read_bytes()))}
def imp(name,*a,**kw):
 if name not in mods:raise ValueError('Forbidden import '+name)
 return mods[name]
allowed=['str','int','float','bool','list','dict','set','tuple','len','range','enumerate','zip','sum','min','max','sorted','any','all','isinstance','print','repr','abs','round','reversed','Exception','AssertionError','ValueError','KeyError','TypeError','next','type']
bs={k:getattr(builtins,k) for k in allowed};bs['__import__']=imp;bs['print']=lambda *a,**k:None

def run(code,label,filename=old+'/inline.py'):
 try:
  if label=='1403':
   code="import pathlib,json\np=pathlib.Path('/tmp/tinct-da-prep-20261104/don-quixote')\n"+code[code.index("f=p/'don-quixote-modern-en.json'"):]
  tree=ast.parse(code)
  for n in ast.walk(tree):
   if isinstance(n,ast.Attribute) and n.attr.startswith('__'):raise ValueError('dunder denied')
   if isinstance(n,ast.Name) and n.id in ['exec','eval','compile','open','globals','locals','getattr','setattr','delattr','__builtins__']:raise ValueError('unsafe name '+n.id)
  exec(compile(tree,filename,'exec'),{'__builtins__':bs,'__file__':filename})
  done.append(label)
 except Exception as e:errors.append({'label':label,'error':str(e)[:300]})
cmds=json.loads((R/'commands-evidence.json').read_text())
for row in cmds:
 if not row['log'].startswith('01a1a716-41e8') or not 1282<=row['call']<=2240:continue
 cmd=row['cmd'];i=row['call']
 # Process all shell heredocs as data; Python snippets are separately interpreted.
 for hm in re.finditer(r'(?:^|\n)cat\s+(>{1,2})\s*([^\n]+?)\s*<<\s*[\'\"]?([A-Za-z_][\w]*)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[3])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  path=hm[2].strip().strip("'\"")
  if not path.startswith('/') and row['cwd']:path=row['cwd']+'/'+path
  if not path.startswith(old+'/'):continue
  body=cmd[hm.end():hm.end()+end.start()].encode()
  vfs[path]=(vfs.get(path,b'') if hm[1]=='>>' else b'')+body
 # All inline Python, with no actual shell.
 for hm in re.finditer(r'python3?\s+-\s*<<\s*[\'\"]?(\w+)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[1])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  code=cmd[hm.end():hm.end()+end.start()]
  if 'write_text' in code or 'copyfile' in code:run(code,str(i))
 for m in re.finditer(r'(?:^|\n)python3?\s+('+re.escape(old)+r'/[\w.-]+\.py)(?:\s|$)',cmd):
  if m[1] in vfs:run(vfs[m[1]].decode(),str(i)+':'+m[1].rsplit('/',1)[-1],m[1])
  else:errors.append({'label':str(i),'error':'missing script '+m[1]})
out=R/'reconstructed/don-quixote-replayed';out.mkdir(parents=True,exist_ok=True)
for k,b in vfs.items():
 rel=k[len(old)+1:]
 if '..' not in pathlib.Path(rel).parts:
  f=out/rel;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
(R/'don-quixote-replay-report.json').write_text(json.dumps({'successful':done,'errors':errors,'files':len(vfs)},ensure_ascii=False,indent=2))
print('succeeded',len(done),'errors',len(errors),'files',len(vfs));print(errors[-30:])
for k in ['don-quixote-modern-da.json','don-quixote-modern-en.json']:
 d=json.loads(vfs[old+'/'+k]);print(k,len(d['chapters']),sum(len(c['paragraphs']) for c in d['chapters']),sum(len(s.split()) for c in d['chapters'] for s in c['paragraphs']))
