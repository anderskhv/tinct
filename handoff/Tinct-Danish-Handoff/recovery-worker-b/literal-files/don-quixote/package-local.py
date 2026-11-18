import pathlib,json,hashlib
p=pathlib.Path(__file__).parent
read=lambda f:json.loads((p/f).read_text())
write=lambda f,x:(p/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
da=read('don-quixote-modern-da.json');en=read('don-quixote-modern-en.json');orig=read('source-don-quixote-original-en.json');old=read('source-don-quixote-modern-da.json');olde=read('source-don-quixote-modern-en.json')
shape=lambda x:[len(c['paragraphs']) for c in x['chapters']]
assert shape(da)==shape(en)==shape(orig)==shape(old)==shape(olde)
assert len(da['chapters'])==126 and sum(shape(da))==3939
changes=[]
for i,(a,b) in enumerate(zip(old['chapters'],da['chapters']),1):
 for j,(s,t) in enumerate(zip(a['paragraphs'],b['paragraphs']),1):
  assert isinstance(t,str) and t.strip()
  if s!=t:changes.append(dict(chapter=i,paragraph=j,before=s,after=t,reason='Sequential modern Danish rewrite with original-English comparison and targeted Spanish verification; final targeted polish ledger supplements this record.'))
write('DANISH-CHANGES.json',changes)
elog=read('ENGLISH-CHANGES.partial.json'); replay=json.loads(json.dumps(olde))
for x in elog:
 i=x['chapter']-1;j=x['paragraph']-1
 assert replay['chapters'][i]['paragraphs'][j]==x['before'],(i,j,'ledger chain')
 replay['chapters'][i]['paragraphs'][j]=x['after']
assert replay==en
write('ENGLISH-CHANGES.json',elog)
for lang,x in [('da',da),('en',en)]:
 g=read(f'don-quixote-onboarding-{lang}.json');assert g['openingText']==x['chapters'][0]['paragraphs'][1]
 v=read(f'supplement-verses-part1-{lang}.json');assert [len(q['lines']) for q in v['poems']]==[70,14,14,14,14,10,10,14,14,14,14]
 assert len(read(f'supplement-preface-part1-{lang}.json')['paragraphs'])==18
coverage=read('source-coverage-preliminary.json');assert len(coverage)==126 and not any(x['differences'] for x in coverage)
validation=dict(chapters=126,part1_chapters=52,part2_chapters=74,slots=3939,danish_words=sum(len(s.split()) for c in da['chapters'] for s in c['paragraphs']),changed_danish_slots=len(changes),english_correction_entries=len(elog),english_changed_unique_slots=sum(a!=b for c,d in zip(olde['chapters'],en['chapters']) for a,b in zip(c['paragraphs'],d['paragraphs'])),slot_vectors_equal=True,english_ledger_replays_exactly=True,guide_openings_match=True,original_chapters_normalized_match_ormsby=True,preliminary_poems=11,preliminary_verse_lines=202,native_review='pending',independent_full_review='not completed',release='local only')
write('VALIDATION.json',validation)
supp=[]
for lang in ['da','en']:
 for order,kind in enumerate(['dedication','preface','verses'],1):supp.append(dict(file=f'supplement-{kind}-part1-{lang}.json',language=lang,position='before main chapter 1',order=order,duplicate_warning='Do not insert Part II preliminaries again; they already reside in global chapter 52, slots 48–62.'))
write('SUPPLEMENT-PLACEMENT.json',supp)
write('REVIEW-STATUS.json',dict(status='Complete local editorial candidate; native and independent review pending',completed=['All 126 main chapters sequentially rewritten against corpus original, with targeted Spanish consultation recorded in checkpoints.','All 126 corpus original chapters compared to normalized Ormsby PG996 blocks.','Part I dedication, complete author preface and all 11 preliminary poems prepared in both languages.','Both reader guides rewritten and opening excerpts verified.','Focused final review applied meaning and fluency corrections; English change ledger replay verified.'],pending=['Native Danish final read, especially dialogue register, idiom adaptation, comic vulgarity, verse and formal address.','Independent full source comparison has not been performed; current source consultation is targeted rather than every Spanish sentence.','Targeted heraldry and catalogue review: I.18, I.48–49 and II.8; proper names and literary allusions should receive specialist spot checks.','Nautical terms in II.61–63, pedreñales firearm terminology in II.60, and historical measures/coins merit independent spot checks.','Ambiguous Sancho sagitario usage in II.54 remains literally Skytten; avoid asserting a settled emendation.','Review deliberately adapted puns and locally literal proverbs flagged in checkpoint notes, including I.21–22, II.19, II.25, II.29, II.36–41 and II.66–68.','Verify supplementary content rendering, poem line breaks, empty acclaim arrays and multilingual guide routing at integration; no app tests run.'],raw_notes='FINAL-REVIEW-NOTES-COLLECTED.json is a 567-entry work notebook, not 567 unresolved defects; many entries describe completed checks. No automated triage is asserted.',limits=['Readable unrhymed verse preserves content and paragraph slots; metre and clipped Spanish line endings are not reproduced.','Retains Ormsby chapter/paragraph order, including II.45 judgment order and Part II preliminaries at end of global52.','Spanish early-print legal apparatus, translator introduction and publisher apparatus are not added.','366 illustration references inventoried, images not downloaded or included.','Authorial inconsistencies and problematic historical character speech retained, not silently corrected.']))
files=['don-quixote-modern-da.json','don-quixote-modern-en.json','don-quixote-onboarding-da.json','don-quixote-onboarding-en.json','DANISH-CHANGES.json','ENGLISH-CHANGES.json','FINAL-POLISH.json','PRELIMINARY-REVIEW.json','SUPPLEMENT-PLACEMENT.json','REVIEW-STATUS.json','VALIDATION.json','source-pins.json','source-coverage-preliminary.json','illustration-inventory.json']+[x['file'] for x in supp]
manifest=dict(book='don-quixote',status='local editorial candidate; pending native and independent review; no release',validation=validation,source_pins=read('source-pins.json'),files=[dict(file=f,bytes=(p/f).stat().st_size,sha256=hashlib.sha256((p/f).read_bytes()).hexdigest()) for f in files])
write('MANIFEST.json',manifest)
pr=read('progress.json');pr.update(status='All main chapters, preliminaries and paired guides prepared; local handoff ready; native and independent review pending',next='Native Danish and independent source spot review; Claude may integrate later when user directs',validation=validation);write('progress.json',pr)
print(json.dumps(validation,ensure_ascii=False,indent=2))
