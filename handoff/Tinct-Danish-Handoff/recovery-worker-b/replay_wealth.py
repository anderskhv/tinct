# Controlled reconstruction: no shell commands are executed. Historical Python uses
# restricted imports and an in-memory filesystem, then only recovered files export.
import pathlib,json,re,ast,types,hashlib,copy,collections,builtins,posixpath
R=pathlib.Path(__file__).parent; old='/tmp/tinct-da-prep-20261104/wealth-of-nations';vfs={};errors=[];done=[]
for f in (R/'source-blobs/wealth-of-nations').glob('*'):
 vfs[old+'/'+f.name]=f.read_bytes()
for lang in ['modern-da','modern-en']:vfs[old+'/wealth-of-nations-'+lang+'.json']=vfs[old+'/source-'+lang+'.json']
vfs[old+'/PROGRESS.json']=b'{}'
vfs[old+'/progress.json']=b'{}'
vfs[old+'/DANISH-REPAIRS.json']=b'[]'
vfs[old+'/ENGLISH-REPAIRS.json']=b'[]'
for f in (R/'recovered-witnesses').glob('wealth-primary-*.html'):vfs[old+'/'+f.name.removeprefix('wealth-')]=f.read_bytes()
current_cwd=old
class P:
 def __init__(self,s):self.s=posixpath.normpath(str(s) if str(s).startswith('/') else current_cwd+'/'+str(s))
 def __str__(self):return self.s
 def __lt__(self,x):return self.s<str(x)
 def __fspath__(self):return self.s
 def __truediv__(self,x):return P(self.s+'/'+str(x))
 @classmethod
 def cwd(cls):return P(current_cwd)
 def resolve(self):return self
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
 if name not in mods and name in ['review_helpers']:
  fname=old+'/'+name+'.py'
  module=types.ModuleType(name);module.__dict__.update({'__builtins__':bs,'__file__':fname,'__name__':name})
  code=vfs[fname].decode();check(code);exec(compile(code,fname,'exec'),module.__dict__);mods[name]=module
 if name not in mods:raise ValueError('Forbidden import '+name)
 return mods[name]
allowed=['str','int','float','bool','list','dict','set','tuple','len','range','enumerate','zip','sum','min','max','sorted','any','all','isinstance','print','repr','abs','round','reversed','Exception','AssertionError','ValueError','KeyError','TypeError','next','type','object','map','filter','divmod']
bs={k:getattr(builtins,k) for k in allowed};bs['__import__']=imp;bs['print']=lambda *a,**k:None

class VOpen:
 def __init__(self,path,mode='r',*a,**kw):self.p=P(path);self.mode=mode
 def read(self):return self.p.read_bytes() if 'b' in self.mode else self.p.read_text()
 def write(self,s):return self.p.write_bytes(s) if 'b' in self.mode else self.p.write_text(s)
 def __iter__(self):return iter(self.read().splitlines(True))
 def __enter__(self):return self
 def __exit__(self,*a):pass
bs['open']=VOpen

def check(code):
 tree=ast.parse(code)
 for n in ast.walk(tree):
  if isinstance(n,ast.Attribute) and n.attr.startswith('__'):raise ValueError('dunder denied')
  if isinstance(n,ast.Name) and n.id in ['exec','eval','compile','globals','locals','getattr','setattr','delattr','__builtins__']:raise ValueError('unsafe name '+n.id)
 return tree
import difflib,fractions,bs4,unicodedata,itertools
mods['bs4']=bs4
mods['unicodedata']=unicodedata
mods['itertools']=itertools
mods['fractions']=fractions
mods['sys']=types.SimpleNamespace(path=types.SimpleNamespace(insert=lambda *a:None))
mods['difflib']=difflib

def run(code,label,filename=old+'/inline.py'):
 try:
  tree=ast.parse(code)
  for n in ast.walk(tree):
   if isinstance(n,ast.Attribute) and n.attr.startswith('__'):raise ValueError('dunder denied')
   if isinstance(n,ast.Name) and n.id in ['exec','eval','compile','globals','locals','getattr','setattr','delattr','__builtins__']:raise ValueError('unsafe name '+n.id)
  exec(compile(tree,filename,'exec'),{'__builtins__':bs,'__file__':filename})
  done.append(label)
 except Exception as e:errors.append({'label':label,'error':str(e)[:300]})
cmds=json.loads((R/'event-commands-evidence.json').read_text())
for row in cmds:
 if not row['log'].startswith('01a1a716-41e8') or not 362<=row['call']<=1006:continue
 cmd=row['cmd'];i=row['call'];current_cwd=row['cwd'] or old
 cm=re.search(r'(?:^|&&|;)\s*cd\s+([^\s;&]+)',cmd)
 if cm:current_cwd=cm[1]
 # Process all shell heredocs as data; Python snippets are separately interpreted.
 for hm in re.finditer(r'(?:^|\n|&&|;)\s*cat\s+(>{1,2})\s*([^\n]+?)\s*<<\s*[\'\"]?([A-Za-z_][\w]*)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[3])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  path=hm[2].strip().strip("'\"")
  if not path.startswith('/'):path=current_cwd+'/'+path
  path=posixpath.normpath(path)
  if not path.startswith(old+'/'):continue
  body=cmd[hm.end():hm.end()+end.start()].encode()
  vfs[path]=(vfs.get(path,b'') if hm[1]=='>>' else b'')+body
 # All inline Python, with no actual shell.
 for hm in re.finditer(r'python3?\s+-\s*<<\s*[\'\"]?(\w+)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[1])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  code=cmd[hm.end():hm.end()+end.start()]
  run(code,str(i))
 for m in re.finditer(r'(?:^|\n|&&|;)\s*python3?\s+([\w./-]+\.py)(?:\s|$)',cmd):
  name=m[1] if m[1].startswith('/') else current_cwd+'/'+m[1]
  if name in vfs:run(vfs[name].decode(),str(i)+':'+name.rsplit('/',1)[-1],name)
  else:errors.append({'label':str(i),'error':'missing script '+name})
out=R/'reconstructed/wealth-of-nations-replayed';out.mkdir(parents=True,exist_ok=True)
for k,b in vfs.items():
 rel=k[len(old)+1:].lstrip('/')
 if '..' not in pathlib.Path(rel).parts:
  f=out/rel;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
(R/'wealth-of-nations-replay-report.json').write_text(json.dumps({'successful':done,'errors':errors,'files':len(vfs)},ensure_ascii=False,indent=2))
print('succeeded',len(done),'errors',len(errors),'files',len(vfs));print(errors[-30:])
for k in ['wealth-of-nations-modern-da.json','wealth-of-nations-modern-en.json']:
 d=json.loads(vfs[old+'/'+k]);print(k,len(d['chapters']),sum(len(c['paragraphs']) for c in d['chapters']),sum(len(s.split()) for c in d['chapters'] for s in c['paragraphs']))
