# Controlled reconstruction: no shell commands are executed. Historical Python uses
# restricted imports and an in-memory filesystem, then only recovered files export.
import pathlib,json,re,ast,types,hashlib,copy,collections,builtins,posixpath,unicodedata
R=pathlib.Path(__file__).parent
import sys
slug=sys.argv[1]; old='/tmp/tinct-da-prep-20261104/'+slug; vfs={};errors=[];done=[]
for f in (R/slug).glob('source-*'):vfs[old+'/'+f.name]=f.read_bytes()
current_cwd=old
class P:
 def __init__(self,s="."):self.s=posixpath.normpath(str(s) if str(s).startswith('/') else current_cwd+'/'+str(s))
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
 @property
 def stem(self):return pathlib.Path(self.s).stem
 @property
 def suffix(self):return pathlib.Path(self.s).suffix
 def iterdir(self):return [P(k) for k in vfs if k.rsplit('/',1)[0]==self.s]
mods={'unicodedata':unicodedata,'json':json,'pathlib':types.SimpleNamespace(Path=P),'re':re,'hashlib':hashlib,'copy':copy,'collections':collections,'shutil':types.SimpleNamespace(copyfile=lambda a,b:P(b).write_bytes(P(a).read_bytes()))}
def imp(name,*a,**kw):
 if name not in mods and name in ['review_helpers']:
  fname=old+'/'+name+'.py'
  module=types.ModuleType(name);module.__dict__.update({'__builtins__':bs,'__file__':fname,'__name__':name})
  code=vfs[fname].decode();check(code);exec(compile(code,fname,'exec'),module.__dict__);mods[name]=module
 if name not in mods:raise ValueError('Forbidden import '+name)
 return mods[name]
allowed=['str','int','float','bool','list','dict','set','tuple','len','range','enumerate','zip','sum','min','max','sorted','any','all','isinstance','print','repr','abs','round','reversed','Exception','AssertionError','ValueError','KeyError','TypeError','next','type','object','slice','UnicodeError','map']
bs={k:getattr(builtins,k) for k in allowed};bs['__import__']=imp;bs['print']=lambda *a,**k:None

class VOpen:
 def __init__(self,path,mode='r',*a,**kw):
  self.p=P(path);self.mode=mode;self.buffer=b'' if 'b' in mode else ''
 def read(self):return self.p.read_bytes() if 'b' in self.mode else self.p.read_text()
 def write(self,s):
  self.buffer+=s;return self.p.write_bytes(self.buffer) if 'b' in self.mode else self.p.write_text(self.buffer)
 def __iter__(self):return iter(self.read().splitlines(True))
 def __enter__(self):return self
 def __exit__(self,*a):pass
bs['open']=VOpen
bs['zip']=lambda *a,**kw:zip(*a)

def check(code):
 tree=ast.parse(code)
 for n in ast.walk(tree):
  if isinstance(n,ast.Attribute) and n.attr.startswith('__'):raise ValueError('dunder denied')
  if isinstance(n,ast.Name) and n.id in ['exec','eval','compile','globals','locals','getattr','setattr','delattr','__builtins__']:raise ValueError('unsafe name '+n.id)
 return tree
import difflib,xml.etree.ElementTree as ET
mods['xml']=types.SimpleNamespace(etree=types.SimpleNamespace(ElementTree=types.SimpleNamespace(parse=lambda p:ET.ElementTree(ET.fromstring(P(p).read_text())))))
mods['xml.etree.ElementTree']=mods['xml']
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

cmds=json.loads((R.parent/'recovery-worker-b/event-commands-evidence.json').read_text())
lo,hi=(427,478) if slug=='faust-part-1' else (561,779)
for row in cmds:
 if not row['log'].startswith('01a1a716-0f2') or not lo<=row['call']<=hi:continue
 cmd=row['cmd']; i=row['call'];current_cwd=old
 # No shell execution: heredocs enter virtual files only.
 for hm in re.finditer(r'cat\s+(>{1,2})\s*([^\n]+?)\s*<<\s*[\'\"]?([A-Za-z_][\w]*)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[3])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  path=hm[2].strip().strip("'\"")
  if not path.startswith('/'):path=old+'/'+path
  if not path.startswith(old+'/'):continue
  body=cmd[hm.end():hm.end()+end.start()].encode();vfs[path]=(vfs.get(path,b'') if hm[1]=='>>' else b'')+body
 # Restricted sed substitutions: only s/pattern/replacement/ on in-book files.
 for sm in re.finditer(r"sed -i '' '([^']+)' ([\w.-]+)",cmd):
  target=old+'/'+sm[2]
  if target not in vfs:continue
  value=vfs[target].decode()
  for sub in sm[1].split(';'):
   parts=sub.split('/')
   if len(parts)!=4 or parts[0]!='s' or parts[3] not in ['','g']:raise ValueError('unsupported sed')
   replacement=parts[2].replace(r'\x27',"'")
   value='\n'.join(re.sub(parts[1],lambda m:replacement,line,count=0 if parts[3]=='g' else 1) for line in value.split('\n'))
  vfs[target]=value.encode()
 if slug=='the-aeneid' and i==776:
  for rr in cmds:
   if rr['log'].startswith('01a1a716-41e') and rr['call']==1022:
    code=rr['cmd'].split("<<'PY'\n",1)[1].rsplit('\nPY',1)[0];run(code,'independent-review-1022')
 for hm in re.finditer(r'python3?\s+-\s*<<\s*[\'\"]?(\w+)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(hm[1])+r'\s*$',cmd[hm.end():],re.M)
  if not end:continue
  code=cmd[hm.end():hm.end()+end.start()]
  code=code.replace("('Så lad jer råde','Så lad jer råde').__getitem__(slice(None)),",'')
  if any(k in code for k in ['write_text','json.dump','write_bytes']):run(code,str(i))
 for m in re.finditer(r'(?:^|\n)python3?\s+([\w/.-]+\.py)(?:\s|$)',cmd):
  path=m[1] if m[1].startswith('/') else old+'/'+m[1]
  if path in vfs:run(vfs[path].decode(),str(i)+':'+path.rsplit('/',1)[-1],path)
  else:errors.append({'label':str(i),'error':'missing script '+path})
out=R/slug
for k,b in vfs.items():
 rel=k[len(old)+1:]
 if '..' not in pathlib.Path(rel).parts:
  f=out/rel;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
(out/'replay-report.json').write_text(json.dumps({'successful':done,'errors':errors,'files':len(vfs)},ensure_ascii=False,indent=2))
print('succeeded',len(done),'errors',len(errors),'files',len(vfs));print(errors)
