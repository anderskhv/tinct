from pathlib import Path
import json,subprocess,ast,re,types,builtins,hashlib,copy,collections,difflib,posixpath
root=Path(__file__).parents[1];R=root/'recovery-worker-b';old='/tmp/tinct-da-prep-20261104/the-republic';vfs={};errors=[];done=[];current_cwd=old
repo=root/'recovery-git.git'
for folder,names in [('editions',['the-republic-'+l+'.json' for l in ['original-en','modern-en','modern-da']]),('onboarding',['the-republic.json','the-republic.da.json'])]:
 for n in names:vfs[old+'/source-'+n]=(R/'source-blobs/the-republic'/('source-'+n)).read_bytes()
src=json.loads(vfs[old+'/source-the-republic-modern-da.json']);vfs[old+'/book-ledger.json']=json.dumps([{'book':c['number'],'slots':len(c['paragraphs'])} for c in src['chapters']]).encode()
base=(R/'replay_confessions.py').read_text();prefix=base[base.index('class P:'):base.index('cmds=json.loads')]
prefix=prefix.replace("self.s=str(s) if str(s).startswith('/') else current_cwd+'/'+str(s)","self.s=posixpath.normpath(str(s) if str(s).startswith('/') else current_cwd+'/'+str(s))")
prefix=prefix.replace("'next','type'","'next','type','map','tuple','set','open'")
prefix=prefix.replace("self.p.write_bytes(s) if 'b' in self.mode else self.p.write_text(s)","self.p.write_bytes((self.p.read_bytes() if 'a' in self.mode and self.p.exists() else b'')+(s if isinstance(s,bytes) else s.encode()))")
exec(compile(prefix,'controlled-vfs','exec'),globals());mods['difflib']=difflib;mods['xml.etree']=types.SimpleNamespace(ElementTree=__import__('xml.etree.ElementTree',fromlist=['ElementTree']))
def recovered_print(*args,sep=' ',end='\n',file=None,**kw):
 if file is not None:file.write(sep.join(str(x) for x in args)+end)
bs['print']=recovered_print
rows=json.loads((R/'event-commands-evidence.json').read_text())
for row in rows:
 if not row['log'].startswith('01a1a716-0f29') or not 486<=row['call']<=556:continue
 cmd=row['cmd'];label=str(row['call'])
 for m in re.finditer(r'cat\s*(>{1,2})\s*([^\n]+?)\s*<<[\'\"]?(\w+)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(m[3])+r'\s*$',cmd[m.end():],re.M)
  if not end:continue
  name=m[2].strip().strip("'\"");path=old+'/'+name;body=cmd[m.end():m.end()+end.start()].encode();vfs[path]=(vfs.get(path,b'') if m[1]=='>>' else b'')+body
 # Three known literal sed operations from the saved commands, applied as data.
 if row['call']==497:
  p=P('danish-revisions.tsv');p.write_text(p.read_text().replace('god afkom','godt afkom'))
 if row['call']==506:
  p=P('danish-revisions.tsv');p.write_text(p.read_text().replace('hvilke virksomhed­ER der gør','hvilke måder at leve på der gør'))
 if row['call']==529:
  p=P('danish-revisions.tsv');p.write_text(p.read_text().replace('en bukkebuk med hjortegevir','en buk med hjortegevir'))
 if row['call']==556:
  p=P('HANDOFF.md');p.write_text(p.read_text().replace('the Germanic/Danish wording','the Danish wording'))
 for m in re.finditer(r'python3\s+-\s*<<[\'\"]?(\w+)[\'\"]?\s*\n',cmd):
  end=re.search(r'^'+re.escape(m[1])+r'\s*$',cmd[m.end():],re.M)
  if not end:continue
  code=cmd[m.end():m.end()+end.start()]
  if 'write_text' not in code and ",'a')" not in code:continue
  run(code,label)
  if label=='551':
   c=json.loads(vfs[old+'/candidate-the-republic-modern-da.json'])['chapters'];z=json.loads(vfs[old+'/danish-changes.json']);print([(x['number'],sum(len(t.split()) for t in x['paragraphs']),sum(y['book']==x['number'] for y in z)) for x in c])
out=root/'recovery-parent/reconstructed/the-republic';out.mkdir(parents=True,exist_ok=True)
for k,b in vfs.items():
 if k.startswith(old+'/'):(out/k[len(old)+1:]).write_bytes(b)
(out/'RECOVERY-ERRORS.json').write_text(json.dumps(errors,indent=2));print('executed',done,'errors',errors)
for l in ['da','en']:
 p=out/f'candidate-the-republic-modern-{l}.json'
 if p.exists():
  d=json.loads(p.read_text());print(l,len(d['chapters']),sum(len(c['paragraphs']) for c in d['chapters']),sum(len(p.split()) for c in d['chapters'] for p in c['paragraphs']))
