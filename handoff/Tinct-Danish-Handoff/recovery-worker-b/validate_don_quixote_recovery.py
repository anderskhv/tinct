import pathlib,json,hashlib,copy
r=pathlib.Path(__file__).parent;p=r/'reconstructed/don-quixote-replayed'
read=lambda f:json.loads((p/f).read_text())
write=lambda f,x:(p/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
d=read('don-quixote-modern-da.json');e=read('don-quixote-modern-en.json');o=read('source-don-quixote-original-en.json');bd=read('source-don-quixote-modern-da.json');be=read('source-don-quixote-modern-en.json')
shape=lambda x:[len(c['paragraphs']) for c in x['chapters']]
assert shape(d)==shape(e)==shape(o)==shape(bd)==shape(be)
assert len(d['chapters'])==126 and sum(shape(d))==3939
assert all(isinstance(s,str) and s.strip() for c in d['chapters'] for s in c['paragraphs'])
assert sum(len(s.split()) for c in d['chapters'] for s in c['paragraphs'])==359235
assert sum(a!=b for c,z in zip(bd['chapters'],d['chapters']) for a,b in zip(c['paragraphs'],z['paragraphs']))==3905
for lang,base,final in [('DANISH',bd,d),('ENGLISH',be,e)]:
 ledger=read(lang+'-CHANGES.json');x=copy.deepcopy(base)
 for row in ledger:
  c=row['chapter']-1;n=row['paragraph']-1;assert x['chapters'][c]['paragraphs'][n]==row['before'];x['chapters'][c]['paragraphs'][n]=row['after']
 assert x==final
assert len(read('ENGLISH-CHANGES.json'))==104
assert len({(x['chapter'],x['paragraph']) for x in read('ENGLISH-CHANGES.json')})==103
for lang,final in [('da',d),('en',e)]:
 assert read('don-quixote-onboarding-'+lang+'.json')['openingText']==final['chapters'][0]['paragraphs'][1]
 assert len(read('supplement-preface-part1-'+lang+'.json')['paragraphs'])==18
 assert [len(x['lines']) for x in read('supplement-verses-part1-'+lang+'.json')['poems']]==[70,14,14,14,14,10,10,14,14,14,14]
for f,x in read('source-pins.json').items():
 if 'sha' in x:
  b=(p/('source-'+f)).read_bytes();assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==x['sha']
# Recover informational review status and placement by statically extracting literal arguments only.
import ast
src=ast.parse((p/'package-local.py').read_text()); env={'dict':dict}
for node in src.body:
 if isinstance(node,ast.Expr) and isinstance(node.value,ast.Call) and isinstance(node.value.func,ast.Name) and node.value.func.id=='write' and isinstance(node.value.args[0],ast.Constant) and node.value.args[0].value=='REVIEW-STATUS.json':
  val=node.value.args[1]
  assert isinstance(val,ast.Call) and val.func.id=='dict'
  payload={k.arg:ast.literal_eval(k.value) for k in val.keywords};write('REVIEW-STATUS.json',payload)
supp=[dict(file=f'supplement-{kind}-part1-{lang}.json',language=lang,position='before main chapter 1',order=i,duplicate_warning='Part II preliminaries already reside in global chapter52,slots48–62.') for lang in ['da','en'] for i,kind in enumerate(['dedication','preface','verses'],1)]
write('SUPPLEMENT-PLACEMENT.json',supp)
report={'recovered':True,'recovery_date':'2026-11-18','chapters':126,'slots':3939,'danish_words':359235,'danish_changed_slots':3905,'english_change_operations':104,'english_changed_slots':103,'all_source_git_blob_pins_match':True,'both_change_ledgers_replay_exactly':True,'guide_openings_match':True,'preliminary_preface_paragraphs':18,'preliminary_poems':11,'preliminary_lines':202,'historical_validation_counts_match':True,'original_candidate_sha256_available':False,'new_independent_linguistic_review':False,'native_review':'pending','release':'none','remaining_recovery_limits':['Original candidate SHA256 manifest was not printed in preserved logs; exact baseline pins, sequential edit replay and historical metrics verify reconstruction without claiming original-manifest equality.','Gutenberg witness downloads and full original-to-Ormsby audit file not recovered; historical successful validation is preserved separately.','Illustration inventory and source body audit missing; do not claim newly rechecked source audit.','Recovered HANDOFF describes old paths and historical validation; this RECOVERY-VALIDATION.json controls recovery assertions.']}
write('RECOVERY-VALIDATION.json',report)
files=['don-quixote-modern-da.json','don-quixote-modern-en.json','don-quixote-onboarding-da.json','don-quixote-onboarding-en.json','DANISH-CHANGES.json','ENGLISH-CHANGES.json','FINAL-POLISH.json','PRELIMINARY-REVIEW.json','SUPPLEMENT-PLACEMENT.json','REVIEW-STATUS.json','RECOVERY-VALIDATION.json','HANDOFF.txt','source-pins.json']+[x['file'] for x in supp]
write('RECOVERED-MANIFEST.json',{'book':'don-quixote','date':'2026-11-18','files':[{'file':f,'bytes':(p/f).stat().st_size,'sha256':hashlib.sha256((p/f).read_bytes()).hexdigest()} for f in files]})
print(json.dumps(report,indent=2))
