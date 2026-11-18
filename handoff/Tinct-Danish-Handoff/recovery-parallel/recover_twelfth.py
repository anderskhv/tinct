# Recovery interpreter: only literal editorial operations are accepted; historic code is never executed.
import ast,json,pathlib,subprocess,copy,re,hashlib
R=pathlib.Path(__file__).parent;D=R/'twelfth-night';D.mkdir(exist_ok=True)
commit='225979e36743d21502ebbace6c253fbc5ce09bfa';repo='/Users/andershvelplund/Developer/Tinct'
data={}
for k in ['original-en','modern-en','modern-da']:
 raw=subprocess.check_output(['git','-C',repo,'show',f'{commit}:app/public/data/editions/twelfth-night-{k}.json']);(D/f'source-{k}.json').write_bytes(raw);data[k]=json.loads(raw)
en=copy.deepcopy(data['modern-en']);da=copy.deepcopy(data['modern-da'])
s=(R/'twelfth-night-recovered-editorial-script.txt').read_text().replace('overvældige djævel','hyperbolske djævel')
t=ast.parse(s)
def value(n):
 if isinstance(n,ast.Name):return {'en':en,'da':da}[n.id]
 return ast.literal_eval(n)
def setp(pos,txt,obj):
 c,i=map(int,pos.split('.'));obj['chapters'][c-1]['paragraphs'][i-1]=txt
for n in t.body:
 if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call):
  call=n.value;name=call.func.id;args=[value(a) for a in call.args]
  if name=='edits':
   for line in args[0].strip().splitlines():
    pos,txt=line.split(' ',1);setp(pos,txt,args[1] if len(args)>1 else da)
  elif name=='change':setp(args[0],args[1],args[2] if len(args)>2 else da)
  elif name=='repl':
   obj=args[3] if len(args)>3 else da;c,i=map(int,args[0].split('.'));old=obj['chapters'][c-1]['paragraphs'][i-1];assert args[1] in old,(n.lineno,args[0]);setp(args[0],old.replace(args[1],args[2]),obj)
  elif name!='wr':raise ValueError(name)
 elif isinstance(n,ast.For):
  # This exact historical loop only translated role labels and normalized Danish text.
  assert n.lineno==274
  fn=next(x for x in t.body if isinstance(x,ast.FunctionDef) and x.name=='subtext')
  labels=ast.literal_eval(fn.body[0].value);replacements=ast.literal_eval(fn.body[3].value)
  words={'fader':'far','faders':'fars','broder':'bror','broders':'brors','moders':'mors','hushovmester':'hovmester'}
  for c in da['chapters']:
   ps=[]
   for p in c['paragraphs']:
    key,sep,rest=p.partition('.')
    if key in labels:p=labels[key]+sep+rest
    for a,b in replacements.items():p=p.replace(a,b)
    for a,b in words.items():p=re.sub(r'\b'+a+r'\b',b,p)
    ps.append(p.replace(' / ','\n'))
   c['paragraphs']=ps;c['title']=c['title'].replace(', Scene',', scene');c['section']=c['section'].replace('Act','Akt')
for k,obj in [('modern-en',en),('modern-da',da)]:
 for a,b in zip(obj['chapters'],data['original-en']['chapters']):assert len(a['paragraphs'])==len(b['paragraphs']) and all(x.strip() for x in a['paragraphs'])
 (D/f'{k}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print('Recovered',len(da['chapters']),'scenes',sum(len(c['paragraphs']) for c in da['chapters']),'slots')
print({k:sum(x!=y for a,b in zip(obj['chapters'],data[k]['chapters']) for x,y in zip(a['paragraphs'],b['paragraphs'])) for k,obj in [('modern-en',en),('modern-da',da)]})
(D/'dansk‑laesekladde.md').write_text('\n\n'.join(['# Twelfth Night — recovered Danish candidate']+[x for c in da['chapters'] for x in ['## '+c['title'],*c['paragraphs']]])+'\n')
