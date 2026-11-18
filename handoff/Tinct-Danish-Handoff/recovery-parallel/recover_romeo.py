import ast,json,pathlib,subprocess,copy
R=pathlib.Path(__file__).parent;D=R/'romeo-and-juliet';D.mkdir(exist_ok=True);commit='225979e36743d21502ebbace6c253fbc5ce09bfa';repo='/Users/andershvelplund/Developer/Tinct';src={}
for k in ['original-en','modern-en','modern-da']:
 raw=subprocess.check_output(['git','-C',repo,'show',f'{commit}:app/public/data/editions/romeo-and-juliet-{k}.json']);(D/f'source-{k}.json').write_bytes(raw);src[k]=json.loads(raw)
out=[copy.deepcopy(src[k]) for k in ['modern-en','modern-da']]
def setp(c,i,en=None,da=None):
 for a,s in zip(out,(en,da)):
  if s is not None:a['chapters'][c-1]['paragraphs'][i-1]=s
def rep(c,i,en=(),da=()):
 for a,ed in zip(out,(en,da)):
  s=a['chapters'][c-1]['paragraphs'][i-1]
  for old,new in ed:assert old in s,(c,i,old);s=s.replace(old,new)
  a['chapters'][c-1]['paragraphs'][i-1]=s
s=(R/'rjedit.py.txt').read_text();s='\n'.join(l for l in s.splitlines() if not l.startswith('rep(7,10,da=[("».  Sig"'))
t=ast.parse(s)
def val(n,env):
 if isinstance(n,ast.BinOp) and isinstance(n.op,ast.Add):return val(n.left,env)+val(n.right,env)
 if isinstance(n,ast.Subscript):return val(n.value,env)[val(n.slice,env)]
 if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='replace':return val(n.func.value,env).replace(*[val(a,env) for a in n.args])
 if isinstance(n,ast.Name) and n.id=='base':return [src['modern-en'],src['modern-da']]
 return env[n.id] if isinstance(n,ast.Name) else ast.literal_eval(n)
def walk(nodes,env={}):
 for n in nodes:
  if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call):
   c=n.value
   if isinstance(c.func,ast.Name) and c.func.id in ('setp','rep'):{'setp':setp,'rep':rep}[c.func.id](*[val(a,env) for a in c.args],**{k.arg:val(k.value,env) for k in c.keywords})
   elif not isinstance(c.func,ast.Name) or c.func.id!='write':raise ValueError(ast.unparse(c))
  elif isinstance(n,ast.For):
   for v in ast.literal_eval(n.iter):walk(n.body,{**env,n.target.id:v})
walk(t.body)
for k,obj in zip(['modern-en','modern-da'],out):
 (D/f'{k}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
 print(k,sum(x!=y for a,b in zip(obj['chapters'],src[k]['chapters']) for x,y in zip(a['paragraphs'],b['paragraphs'])))
