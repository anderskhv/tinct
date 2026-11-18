import json,pathlib,shlex,shutil,ast,hashlib
root=pathlib.Path(__file__).parent
src=root/'literal-files/oresteia';dest=root/'reconstructed/oresteia';shutil.copytree(src,dest,dirs_exist_ok=True)
commands=json.loads((root/'executed-commands.json').read_text())
def read(n):return json.loads((dest/(n+'.json')).read_text())
def put(n,v):(dest/(n+'.json')).write_text(json.dumps(v,ensure_ascii=False,indent=2))
d=read('draft-modern-da');l=read('changes');s=read('modern-da');pr=read('progress');print('start',pr)
for rec in commands:
 cmd=rec['command'];line=rec['line']
 if line<18069 or line>18728:continue
 if cmd.startswith('python3 -c ') and "c,start,lines=json.loads(sys.argv[1])" in cmd:
  t=shlex.split(cmd);c,start,lines=json.loads(t[3]);base=sum(len(x['paragraphs']) for x in d['chapters'][:c-1]);assert base+start-1==pr['reviewedParagraphs'],(line,pr)
  for i,v in enumerate(lines,start):
   before=s['chapters'][c-1]['paragraphs'][i-1];d['chapters'][c-1]['paragraphs'][i-1]=v;l.append(dict(chapter=c,paragraph=i,before=before,after=v,reason='Recovered chronological full source comparison batch.'))
  pr.update(chapter=c,paragraph=start+len(lines)-1,reviewedParagraphs=base+start+len(lines)-1)
 if line==18168:
  a='og bad ham rense sig for skyld';b='for at blive renset for sin skyld';d['chapters'][21]['paragraphs'][21]=d['chapters'][21]['paragraphs'][21].replace(a,b)
  next(x for x in l if x['chapter']==22 and x['paragraph']==22)['after']=d['chapters'][21]['paragraphs'][21]
 if line in [18659,18660]:
  t=shlex.split(cmd);(dest/pathlib.Path(t[3]).name).write_text(t[4])
put('draft-modern-da',d);put('changes',l);put('progress',pr)
# This local-only guide transformation was inspected in full before execution.
rec=next(x for x in commands if x['line']==18688);code=rec['command'].split('\n',1)[1].rsplit('\nPY',1)[0].replace('/tmp/tinct-da-prep-20261104/oresteia',str(dest));exec(compile(code,'reviewed-guide-recovery','exec'),{})
for c,n,a,b in [(7,9,'som det eneste barn for en far, der har mistet','som det eneste barn for en far, der har mistet sine andre børn'),(4,13,'Han nærmer sig med olivenkransen skygget om panden.','Han nærmer sig med en olivenkrans, der skygger for panden.')]:
 old=d['chapters'][c-1]['paragraphs'][n-1];assert a in old;new=old.replace(a,b);d['chapters'][c-1]['paragraphs'][n-1]=new;next(x for x in l if x['chapter']==c and x['paragraph']==n)['after']=new
put('draft-modern-da',d);put('changes',l)
validation={}
for lang,ledger in [('da','changes'),('en','english-changes')]:
 old=read('modern-'+lang);new=read('draft-modern-'+lang);logs=read(ledger);shape=lambda d:[len(c['paragraphs']) for c in d['chapters']];assert shape(old)==shape(new);assert sum(shape(new))==771
 changed={(i+1,j+1) for i,(a,b) in enumerate(zip(old['chapters'],new['chapters'])) for j,(x,y) in enumerate(zip(a['paragraphs'],b['paragraphs'])) if x!=y};assert changed=={(x['chapter'],x['paragraph']) for x in logs if x['before']!=x['after']}
 for x in logs:assert x['before']==old['chapters'][x['chapter']-1]['paragraphs'][x['paragraph']-1] and x['after']==new['chapters'][x['chapter']-1]['paragraphs'][x['paragraph']-1]
 validation[lang]={'chapters':26,'paragraphs':771,'changed':len(changed),'ledgerVerified':True}
# Historical notes are extracted as data, not treated as instructions.
last=next(x for x in commands if x['line']==18728)['command'].split('\n',1)[1].rsplit('\nPY',1)[0]
for node in ast.parse(last).body:
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='notes' for t in node.targets):put('REVIEW',ast.literal_eval(node.value))
put('RECOVERY-TESTS',validation);print(validation)
