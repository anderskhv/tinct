import pathlib,json,hashlib,subprocess,copy
root=pathlib.Path(__file__).parent;git=root.parent/'recovery-git.git'
for book in ['to-the-lighthouse','fear-and-trembling','beyond-good-and-evil']:
 p=root/'reconstructed'/book;result={'book':book,'recovery_date':'2026-11-18','native_signoff':False,'new_full_semantic_review':False,'targets':[]};mapping={}
 if book=='to-the-lighthouse':
  mapping={'modern-da.json':f'editions/{book}-modern-da.json','modern-en.json':f'editions/{book}-modern-en.json','onboarding-da.json':f'onboarding/{book}.da.json','onboarding-en.json':f'onboarding/{book}.json'};review=json.loads((p/'review-progress.json').read_text());ledgers={'da':review['changes'],'en':review['englishChanges']}
 else:
  mapping={f'{book}-modern-da.json':f'editions/{book}-modern-da.json',f'{book}-modern-en.json':f'editions/{book}-modern-en.json',f'{book}.da.json':f'onboarding/{book}.da.json',f'{book}.json':f'onboarding/{book}.json'};ledgers={l:json.loads((p/('changes.json'if l=='da'else'english-changes.json')).read_text())for l in ['da','en']}
 for f,target in mapping.items():
  candidate=json.loads((p/f).read_text());proc=subprocess.run(['git','--git-dir='+str(git),'show','current-main:app/public/data/'+target],capture_output=True);main=json.loads(proc.stdout)if proc.returncode==0 else None;item={'file':f,'target':'app/public/data/'+target,'sha256':hashlib.sha256((p/f).read_bytes()).hexdigest(),'current_main_equals_candidate':main==candidate}
  if 'chapters'in candidate:
   l='da'if'modern-da'in f else'en';src=json.loads((p/('source-'+f)).read_text());counts=[len(c['paragraphs'])for c in src['chapters']];assert counts==[len(c['paragraphs'])for c in candidate['chapters']];assert all(t.strip()for c in candidate['chapters']for t in c['paragraphs']);replay=copy.deepcopy(src)
   for z in ledgers[l]:
    ci=z['chapter']-1;pi=z['paragraph']-1;assert replay['chapters'][ci]['paragraphs'][pi]==z['before'];replay['chapters'][ci]['paragraphs'][pi]=z['after']
   assert all(a['paragraphs']==b['paragraphs']for a,b in zip(replay['chapters'],candidate['chapters']));item.update(chapters=len(counts),slots=sum(counts),paragraph_ledger_replay=True,changed_slots=len(ledgers[l]),current_main_equals_source=main==src)
  result['targets'].append(item)
 (p/'RECOVERY-QA.json').write_text(json.dumps(result,indent=2)+'\n');print(book,result)
 (p/'RECOVERY-STATUS.md').write_text('# '+book+' recovery — 18 November 2026\n\nRecovered both bodies and both reading guides. See HISTORICAL-HASH-VERIFICATION.json for exact historical hashes available, and RECOVERY-QA.json for paragraph counts, ledger replay and comparison with current main. Recovery does not establish native sign-off or a new complete literary review. Historical source-audit files and some provenance/report documents remain incompletely recovered. No upload or release performed.\n')
