import ast,json,pathlib,subprocess,copy
R=pathlib.Path(__file__).parent;D=R/'the-tempest';D.mkdir(exist_ok=True);src={}
for k in ['original-en','modern-en','modern-da']:
 raw=subprocess.check_output(['git','-C','/Users/andershvelplund/Developer/Tinct','show',f'225979e36743d21502ebbace6c253fbc5ce09bfa:app/public/data/editions/the-tempest-{k}.json']);(D/f'source-{k}.json').write_bytes(raw);src[k]=json.loads(raw)
out=[copy.deepcopy(src[k]) for k in ['modern-da','modern-en']]
es=json.loads((R/'literal-file-writes.json').read_text())
s='\n'.join(e['content'].split('for edition,l in zip(data,langs):')[0] for e in es if e['targetExpression'] in ['/tmp/tempest-edit.py','/tmp/tempest-add','/tmp/tempest-last'])
s=s.replace("('går i borgen','står inde').__class__ and ", '')
for n in ast.parse(s).body:
 if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call):
  c=n.value;assert c.func.id=='change';a=[ast.literal_eval(v) for v in c.args];i,j=a[:2]
  for obj,edit in zip(out,a[2:]):
   if edit is None:continue
   p=obj['chapters'][i-1]['paragraphs']
   if isinstance(edit,tuple):assert edit[0] in p[j-1],(i,j,edit[0]);p[j-1]=p[j-1].replace(*edit)
   else:p[j-1]=edit
for k,obj in zip(['modern-da','modern-en'],out):
 if k=='modern-da':
  for c in obj['chapters']:c['paragraphs']=[p.replace(' -- ',' – ') for p in c['paragraphs']]
 (D/f'{k}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
 print(k,sum(x!=y for a,b in zip(obj['chapters'],src[k]['chapters']) for x,y in zip(a['paragraphs'],b['paragraphs'])))
