import json,pathlib,hashlib
r=pathlib.Path(__file__).parent
expected={'coriolanus':(29,1379,1146,5),'midsummer':(9,641,398,21),'othello':(15,1391,892,45),'king-lear':(26,1371,900,15),'macbeth':(28,840,250,16),'as-you-like-it':(23,931,819,5)}
reports=[]
for s,exp in expected.items():
 p=r/s; get=lambda n:json.loads((p/n).read_text()); d=get('modern-da.json')['chapters']; en=get('modern-en.json')['chapters']; orig=get('source-original-en.json')['chapters']; old=get('source-modern-da.json')['chapters']; oe=get('source-modern-en.json')['chapters']; mapping={}
 assert [len(c['paragraphs']) for c in d]==[len(c['paragraphs']) for c in en]==[len(c['paragraphs']) for c in orig]
 assert all(isinstance(v,str) and v.strip() for c in d for v in c['paragraphs'])
 if s=='macbeth':mapping={(int(k.split('.')[0]),int(k.split('.')[1])):(int(k.split('.')[0]),v) if v else None for k,v in get('alignment.json').items()}
 if s=='as-you-like-it':mapping={(x['scene'],x['slot']):(x['retainedChapter'],x['retainedSlot']) for x in get('realignment.json')['mappings']}
 changes=[]
 for i,c in enumerate(d,1):
  for j,v in enumerate(c['paragraphs'],1):
   pos=mapping.get((i,j)) if mapping else (i,j); before=old[pos[0]-1]['paragraphs'][pos[1]-1] if pos else None
   if v!=before:changes.append({'chapter':i,'paragraph':j,'before':before,'after':v})
 ed=sum(a!=b for c,o in zip(en,oe) for a,b in zip(c['paragraphs'],o['paragraphs']))
 actual=(len(d),sum(len(c['paragraphs']) for c in d),len(changes),ed); assert actual==exp,(s,actual,exp)
 files=['modern-da.json','modern-en.json','onboarding-da.json','onboarding-en.json']
 for f in files:get(f)
 report={'book':s,'scenes':actual[0],'paragraph_positions':actual[1],'danish_changed_or_restored_positions':actual[2],'danish_new_positions':sum(x['before'] is None for x in changes),'english_changed_positions':ed,'shape_matches_original':True,'historical_final_counts_match':True,'guides_recovered':True,'sha256':{f:hashlib.sha256((p/f).read_bytes()).hexdigest() for f in files},'limitations':['Recovery and structural checks do not constitute a new complete literary review.','Native Danish sign-off remains pending.','Historical final file hashes were not available; matching counts corroborate reconstruction but are not byte-identity proof.']}
 notes=''
 if s=='macbeth':notes='The Danish reconstruction restores 34 missing positions and aligns the retained text. Its 250 changed/restored positions include these 34. The historical audit passed content assertions but stopped at final packaging because a secondary witness file was unavailable. Preserve alignment.json for bookmark migration.'
 if s=='as-you-like-it':notes='Restores the missing 47-position opening scene and realigns 17 retained units to 23 scenes. Preserve realignment.json for bookmark migration. The historical World Library source rights notice needs resolution before publication. The historical validator passed initial structure/ledger assertions but could not complete without its independent witness file.'
 if s=='othello':notes='Restores 37 witness-derived stage-direction variants in both languages; see source-witness-variants.json. Source witness was reacquired from a Gutenberg mirror.'
 report['publication_notes']=notes
 (p/'recovery-tests.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (p/'recovered-da-changes.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2)+'\n')
 (p/'dansk‑laesekladde.md').write_text('# '+s+' — dansk læsekladde\n\nGendannet redaktionel kladde. Dansk slutgodkendelse afventer.\n\n'+'\n\n'.join('## '+c['title']+'\n\n'+'\n\n'.join(c['paragraphs']) for c in d)+'\n')
 (p/'RECOVERY-STATUS.md').write_text(f'# Recovery status: {s}\n\nRecovered both full bodies and both reading guides from historical literal edits and reviewed local editorial transforms, using exact pinned Git source blobs.\n\nStructural checks pass: {actual[0]} scenes, {actual[1]} positions, {actual[2]} Danish changed/restored positions and {ed} English changed positions. These counts match historical final outputs.\n\n{notes}\n\nThis is recovery evidence, not a new full literary review or native sign-off. No publication has occurred. File hashes and check results are in recovery-tests.json.\n')
 reports.append(report)
(r/'ADDITIONAL-PLAYS-RECOVERY-TESTS.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
print('All six recovered candidates pass structural and historical count checks.')
