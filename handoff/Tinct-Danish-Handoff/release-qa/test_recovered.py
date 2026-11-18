from pathlib import Path
import json,subprocess,concurrent.futures
r=Path(__file__).parents[1];qa=r/'release-qa';repo=r/'recovery-git.git';items=[]
for id in ['comedy-of-errors','romeo-and-juliet','the-tempest','twelfth-night','great-expectations','middlemarch','war-and-peace','moby-dick']:
 p=r/'recovery-parallel'/id;items.append((id,p/'modern-en.json',p/'modern-da.json'))
for id in ['anna-karenina','hamlet']:
 p=r/'recovery-worker-a/reconstructed'/id;items.append((id,p/f'candidate-{id}-modern-en.json',p/f'candidate-{id}-modern-da.json'))
for id in ['to-the-lighthouse','fear-and-trembling']:
 p=r/'recovery-worker-a/reconstructed'/id;prefix='fear-and-trembling-' if id=='fear-and-trembling' else '';items.append((id,p/(prefix+'modern-en.json'),p/(prefix+'modern-da.json')))
for id,prefix in [('confessions','confessions-'),('crime-and-punishment',''),('don-quixote','don-quixote-')]:
 p=r/'recovery-worker-b/reconstructed'/f'{id}-replayed';items.append((id,p/(prefix+'modern-en.json'),p/(prefix+'modern-da.json')))
p=r/'recovery-parent/reconstructed/oresteia';items.append(('oresteia',p/'draft-modern-en.json',p/'draft-modern-da.json'))
res=[]
for id,en,da in items:
 if not en.exists() or not da.exists():continue
 original=json.loads(subprocess.check_output(['git','--git-dir='+str(repo),'show',f'current-main:app/public/data/editions/{id}-original-en.json']))
 e=json.loads(en.read_text());d=json.loads(da.read_text());shape=lambda x:[len(c['paragraphs']) for c in x['chapters']]
 row={'bookId':id,'englishCandidate':str(en.relative_to(r)),'danishCandidate':str(da.relative_to(r)),'pairedShape':shape(e)==shape(d),'nonemptyDanish':all(isinstance(t,str) and t.strip() for c in d['chapters'] for t in c['paragraphs']),'chapters':len(d['chapters']),'paragraphs':sum(shape(d))}
 if id=='moby-dick':e=dict(e,chapters=e['chapters'][3:]);row['gateScope']='existing 136 narrative units; three restored preliminary units require separate source/structural review'
 row['originalShapeMatchesGateScope']=shape(e)==shape(original)
 for lang,obj in [('original-en',original),('modern-en',e)]: (qa/'app/public/data/editions'/f'{id}-{lang}.json').write_text(json.dumps(obj,ensure_ascii=False))
 p=subprocess.run(['python3',str(qa/'books/classify-modern-en.py'),id,'--gate'],capture_output=True,text=True);row.update(englishGateExitCode=p.returncode,englishGateOutput=p.stdout+p.stderr);res.append(row)
(r/'RECOVERED-CANDIDATE-TESTS.json').write_text(json.dumps(res,indent=2));print('\n'.join(f"{x['bookId']}: shape={x['pairedShape']} ENgate={x['englishGateExitCode']}" for x in res))
