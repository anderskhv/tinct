import pathlib,json,hashlib
r=pathlib.Path(__file__).parent
for slug in ['faust-part-1','the-aeneid']:
 p=r/slug
 for lang in ['da','en']:
  (p/f'modern-{lang}.json').write_bytes((p/f'candidate-{slug}-modern-{lang}.json').read_bytes());suffix='.da' if lang=='da' else '';(p/f'onboarding-{lang}.json').write_bytes((p/f'candidate-{slug}{suffix}.json').read_bytes())
 d=json.loads((p/'modern-da.json').read_text())
 (p/'dansk‑laesekladde.md').write_text('# '+slug+' — dansk læsekladde\n\nGendannet redaktionel kladde. Dansk slutgodkendelse afventer.\n\n'+'\n\n'.join('## '+c['title']+'\n\n'+'\n\n'.join(c['paragraphs']) for c in d['chapters'])+'\n')
 notes=('Danish follows 1,095 German slots, English preserves 1,060 slots. Retained Danish had 895 slots. A cross-language and reader-position migration is required. Historical structural validator rerun successfully; native sign-off pending.' if slug=='faust-part-1' else 'Latest historical QA matches exactly: 544 slots, 100,248 Danish words, 28 English repair entries, 210 polish entries. Eight later independent-review suggestions were not integrated into the final historical candidate and are preserved separately. The Latin XML witness was unavailable during recovery; no fresh Latin comparison is claimed. One historical source-inspection step stopped at that missing witness after its editorial replacement had executed.')
 (p/'RECOVERY-STATUS.md').write_text('# Recovery status: '+slug+'\n\nFull bodies, both guides and review evidence reconstructed. Source files recovered from Git commit a1ee0ff; Faust source byte sizes match all ten historical download sizes. Exact historical final SHA fingerprints were not available.\n\n'+notes+'\n')
books=['romeo-and-juliet','the-tempest','comedy-of-errors','twelfth-night','moby-dick','middlemarch','great-expectations','war-and-peace','coriolanus','midsummer','othello','king-lear','macbeth','as-you-like-it','faust-part-1','the-aeneid'];out=[]
for slug in books:
 p=r/slug;files={};counts={}
 for lang in ['da','en']:
  f=p/f'modern-{lang}.json';d=json.loads(f.read_text());assert all(isinstance(s,str) and s.strip() for c in d['chapters'] for s in c['paragraphs']);counts[lang]={'units':len(d['chapters']),'positions':sum(len(c['paragraphs']) for c in d['chapters'])};files[f.name]={'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size}
  g=p/f'onboarding-{lang}.json'
  if not g.exists() and slug=='moby-dick':g=p/('moby-dick.da.json' if lang=='da' else 'moby-dick.json')
  if g.exists():json.loads(g.read_text());files[g.name]={'sha256':hashlib.sha256(g.read_bytes()).hexdigest(),'bytes':g.stat().st_size}
 out.append({'book':slug,'counts':counts,'files':files,'native_review':'pending','release_performed':False,'guide_review':'Opening excerpts updated; remaining current-main guide prose unreviewed' if slug in books[:4] else 'Historical prepared guides recovered; no new full guide review claimed'})
(r/'ALL-16-RECOVERY-INVENTORY.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
lines=['# Recovered Danish preparation — 16 books','', 'All bodies parse and contain populated paragraph slots. This inventory describes recovered work, not publication approval. Native Danish sign-off remains pending. Claude must reconcile these candidates with newer published content.', '', '| Book | Danish units / positions | English units / positions |','|---|---:|---:|']
for x in out:lines.append('| '+x['book']+' | '+str(x['counts']['da']['units'])+' / '+str(x['counts']['da']['positions'])+' | '+str(x['counts']['en']['units'])+' / '+str(x['counts']['en']['positions'])+' |')
lines+=['','## Integration notes','','- The first four plays contain fresh current-main guides with candidate opening excerpts. Remaining guide prose is explicitly unreviewed.','- Moby-Dick adds front matter and moves three heading-continuation slots. Preserve its bookmark map.','- Macbeth restores 34 Danish slots; As You Like It restores 47 opening-scene slots and realigns scenes. Preserve their maps.','- Faust uses German-aligned Danish coordinates, which differ from English and retained Danish. Migration is necessary.','- As You Like It retains an unresolved historical source-rights notice.','- Aeneid includes eight later review suggestions saved separately; they were not integrated into the recovered historical final.','- Parent validation flags Great Expectations’ retained English similarity; resolve that independently of recovery integrity.','- Consult per-book RECOVERY-STATUS.md, HANDOFF.md where present, change records, and aggregate hash inventories. No uploads or releases were made.']
(r/'ALL-16-RECOVERY-INVENTORY.md').write_text('\n'.join(lines)+'\n');print('16 candidate pairs checked and inventoried.')
