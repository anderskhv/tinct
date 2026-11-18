from pathlib import Path
import json,subprocess
r=Path(__file__).parents[1];qa=r/'release-qa';repo=r/'recovery-git.git';items=[]
for id in ['coriolanus','midsummer','othello','king-lear','macbeth','as-you-like-it','the-aeneid','faust-part-1']:
 p=r/'recovery-parallel'/id;prefix=f'candidate-{id}-' if id in ['the-aeneid','faust-part-1'] else '';items.append((id,p,prefix))
for id in ['ulysses','beyond-good-and-evil']:
 items.append((id,r/'recovery-worker-a/reconstructed'/id,'' if id=='ulysses' else id+'-'))
for id,prefix in [('walden','walden-'),('wealth-of-nations','wealth-of-nations-'),('brothers-karamazov','candidate-brothers-karamazov-')]:items.append((id,r/'recovery-worker-b/reconstructed'/(id+'-replayed'),prefix))
items.append(('the-republic',r/'recovery-parent/reconstructed/the-republic','candidate-the-republic-'))
results=[]
for id,p,prefix in items:
 en=p/(prefix+'modern-en.json');da=p/(prefix+'modern-da.json')
 if not en.exists() or not da.exists():continue
 e=json.loads(en.read_text());d=json.loads(da.read_text());s=lambda x:[len(c['paragraphs']) for c in x['chapters']]
 try:o=json.loads(subprocess.check_output(['git','--git-dir='+str(repo),'show',f'current-main:app/public/data/editions/{id}-original-en.json'],stderr=subprocess.DEVNULL))
 except:continue
 row=dict(bookId=id,englishCandidate=str(en.relative_to(r)),danishCandidate=str(da.relative_to(r)),pairedShape=s(e)==s(d),originalShapeMatches=s(e)==s(o),nonemptyDanish=all(isinstance(t,str) and t.strip() for c in d['chapters'] for t in c['paragraphs']),chapters=len(d['chapters']),paragraphs=sum(s(d)))
 if s(e)==s(o):
  for lang,obj in [('modern-en',e),('original-en',o)]:(qa/'app/public/data/editions'/f'{id}-{lang}.json').write_text(json.dumps(obj,ensure_ascii=False))
  out=subprocess.run(['python3',str(qa/'books/classify-modern-en.py'),id,'--gate'],capture_output=True,text=True);row.update(englishGateExitCode=out.returncode,englishGateOutput=out.stdout+out.stderr)
 else:row.update(englishGateExitCode=None,englishGateOutput='Shape differs: integration mapping required before classifier.')
 results.append(row);print(id,row['englishGateExitCode'],flush=True)
(r/'ADDITIONAL-CANDIDATE-TESTS.json').write_text(json.dumps(results,indent=2))
