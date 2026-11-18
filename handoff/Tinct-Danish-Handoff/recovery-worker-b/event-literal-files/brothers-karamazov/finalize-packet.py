import json,pathlib,hashlib,re
p=pathlib.Path(__file__).parent
def read(n):return json.loads((p/n).read_text())
def write(n,d):(p/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
orig=read('source-brothers-karamazov-original-en.json');qa={'status':'full first source and language review complete; independent and native review pending','release_ready':False,'checks':{},'sha256':{}}
for lang,ledger in [('da','DANISH-REPAIRS.json'),('en','ENGLISH-REPAIRS.json')]:
 n=f'candidate-brothers-karamazov-modern-{lang}.json';d=read(n);source=read(f'source-brothers-karamazov-modern-{lang}.json')
 assert len(d['chapters'])==96 and sum(len(c['paragraphs']) for c in d['chapters'])==5836
 assert [len(c['paragraphs']) for c in d['chapters']]==[len(c['paragraphs']) for c in orig['chapters']]
 assert all(isinstance(t,str) and t.strip() for c in d['chapters'] for t in c['paragraphs'])
 for r in read(ledger):
  c=source['chapters'][int(r['chapter'])-1];field=r.get('field') or (r.get('paragraph') if isinstance(r.get('paragraph'),str) else None)
  text=c[field] if field else c['paragraphs'][r['paragraph']-1];assert r['before'] in text
  text=text.replace(r['before'],r['after'])
  if field:c[field]=text
  else:c['paragraphs'][r['paragraph']-1]=text
 assert source['chapters']==d['chapters']
 assert [x for s in d['sections'] for x in s['chapters']]==list(range(1,97))
 for no,cn,pn in [(1,16,35),(2,19,13),(3,31,7),(4,38,15),(5,40,8),(6,42,45),(7,69,17),(8,78,85),(9,85,6)]:
  assert f'[{no}]' in d['chapters'][cn-1]['paragraphs'][pn-1]
  assert d['chapters'][95]['paragraphs'][77+no].startswith(f'[{no}]')
 guide=read('candidate-brothers-karamazov'+('.da' if lang=='da' else '')+'.json');assert guide['openingText']==d['chapters'][0]['paragraphs'][0]
 qa['checks'][lang]={'chapters':96,'slots':5836,'nonempty':True,'per_chapter_slot_parity':True,'repair_ledger_replay_exact_chapter_match':True,'section_membership_complete_ordered':True,'nine_note_references_and_notes_present':True,'guide_opening_matches':True,'words_approx':sum(len(t.split()) for c in d['chapters'] for t in c['paragraphs'])}
qa['checks']['russian_witness_pages_saved']=len(list(p.glob('source-russian-*.txt')))
qa['checks']['danish_section_labels']=all(c['section'].startswith(('Bog ','Epilog')) for c in read('candidate-brothers-karamazov-modern-da.json')['chapters'])
for f in sorted(p.glob('candidate-*.json')):qa['sha256'][f.name]=hashlib.sha256(f.read_bytes()).hexdigest()
write('QA-FINAL.json',qa);write('QA-CHECKPOINT.json',qa)
g=read('PROGRESS.json');g.update(status='full-first-pass-complete; independent and native review pending',chapters_reviewed=list(range(1,97)),slots_reviewed=5836,danish_repairs=len(read('DANISH-REPAIRS.json')),english_repairs=len(read('ENGLISH-REPAIRS.json')),independent_review='pending',native_review='pending',release_authorized=False);write('PROGRESS.json',g)
(p/'CHECKPOINT.txt').write_text(f'Full first source/language pass complete: 96/96 chapters, 5836/5836 slots, {g["danish_repairs"]} Danish and {g["english_repairs"]} English repair entries. Both guides complete. Nine note references present. Independent/native review pending. Local only; no releases. See HANDOFF.txt and QA-FINAL.json.\n')
write('NOTE-REFERENCE-GAPS.json',{'status':'all nine inherited references restored/checked in both candidates; all endnotes reviewed','remaining_missing_references':[],'danish_note8':'Adapted to Danish long-nose idiom, with literal Russian explanation.'})
s=read('SOURCES.json');s['base']['saved_witness_versions']={'source-raw.txt':'header April 13, 2026; used for retained-slot raw correspondence','source-gutenberg.txt':'header September 18, 2026; additionally downloaded witness'};s['review_scope']='All 96 retained chapter objects compared across Danish, modern English, Garnett and Russian witness. Russian page N+1 maps to corpus N except chapters39–40 redistribute pages40–41. All 97 Russian pages saved; page1 supplies proposed frontmatter.';write('SOURCES.json',s)
write('COVERAGE-FINAL.json',{'retained_body':'96 chapters / 5836 slots retained in both languages, all reviewed. Nine inherited translator endnotes remain at end of chapter96. Inner omissions identified against Russian repaired within existing slots.','raw_correspondence_audit':'SOURCE-COVERAGE-GAPS.json is original raw matching evidence, not a current unresolved-gap list. Its whitespace, frontmatter, table-of-contents and heading interstices are not missing novel paragraphs.','not_integrated':'Russian dedication, John12:24 epigraph and author preface absent from retained English body; separate candidate-additional-frontmatter-da/en.json provides 9 proposed new slots. Claude must decide structural integration. Do not claim full Russian-edition coverage without addressing this.','structure':'Four part boundaries flattened into 12 book sections and epilogue. Candidate retains application slot structure; chapter section labels now Danish.','limitations':'Full primary-agent source pass is not independent certification. Native review pending. Deliberate speaker contradictions, source inconsistencies and historical claims retained; source-note files enumerate review-sensitive decisions.'})
write('REVIEW-PRIORITIES.json',{'independent_followup':'pending; prioritize source accuracy plus fluent idiomatic Danish, not merely automated parity','targets':['96.57 and96.60 final memory/upbringing speech; formal De/Dem among boys and Alyosha; batyushka affectionate little-father in96.13/35/39','Courtroom85–92: first-person collective rhetoric, two abysses, hypothetical evidence, guilt and punishment; source conditional clauses','63–69 Kolya address; læge/doktor status distinction69; 64.4 fur-seal correction','73 verse, Efik mock malapropism and mock Latin; tower vs pillar interpretation at73.52','78.65–67 historical billion/quadrillion ambiguity, Danish milliard/kvadrillion editorial decision needed','88.68–69 literal wading-bird exchange restored; idiomatic Danish needs native/editorial assessment','96 endnotes; retained Garnett liturgical explanation is translator apparatus rather than new scholarly certification','83 witness4000/5000 Russian/Garnett discrepancy, retained Russian5000 with source note; source narrative inconsistencies should not be silently normalized','Additional frontmatter integration and 4-part navigation boundaries'],'native_review':'user-arranged, pending','source_notes':sorted(x.name for x in p.glob('SOURCE-NOTE-*.json'))+['SOURCE-CONTINUITY-070.json']})
(p/'HANDOFF.txt').write_text(f'''BROTHERS KARAMAZOV — LOCAL CONTENT HANDOFF
Status: full first source/language review complete; independent follow-up and native Danish final read pending. NOT a release instruction or native-quality certification.

Base repository snapshot: {(p/'SOURCE-COMMIT.txt').read_text().strip()}.
96 chapters, 5836 paragraph slots, 12 books + epilogue. {g['danish_repairs']} Danish repair entries and {g['english_repairs']} clear English repair entries. Entries are edit operations, not distinct paragraphs. Exact ledger replay reproduces all candidate chapter objects from retained source. Per-chapter slot parity and nonempty checks pass.

Content payloads:
- candidate-brothers-karamazov-modern-da.json: complete reviewed Danish body.
- candidate-brothers-karamazov-modern-en.json: targeted corrected English body.
- candidate-brothers-karamazov.da.json / candidate-brothers-karamazov.json: Danish/English onboarding guides; opening excerpts synchronized.
- candidate-additional-frontmatter-da.json / candidate-additional-frontmatter-en.json: proposed separate restoration of dedication, biblical epigraph and author preface, nine slots each. NOT inserted into 96-chapter body. Requires integration decision to make full Russian-edition coverage claim.

Use SOURCES.json, COVERAGE-FINAL.json, REVIEW-PRIORITIES.json and source-note files. All nine inherited note references and corresponding endnotes present. Danish section labels and recurring surnames aligned. Historical character beliefs and intentionally fallacious arguments remain character speech.

Raw source/ledger files and review scripts are audit materials, not application assets. Compare current repository before applying: this snapshot can be stale, and Claude owns release coordination. No branch, repository, upload or release changed by this task. Do not overwrite other sessions' edits. Refresh manifest after any further accepted changes with finalize-packet.py.
''')
manifest={'status':g['status'],'base_commit':(p/'SOURCE-COMMIT.txt').read_text().strip(),'files':{}}
for f in sorted(p.iterdir()):
 if f.is_file() and f.name!='MANIFEST.json' and f.suffix in ['.json','.txt','.draft']:
  manifest['files'][f.name]={'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
write('MANIFEST.json',manifest)
print((p/'CHECKPOINT.txt').read_text())
