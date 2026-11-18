import json,pathlib,hashlib,re,datetime
p=pathlib.Path(__file__).parent
load=lambda f:json.loads((p/f).read_text())
write=lambda f,x:(p/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
da=load('modern-da.json');en=load('modern-en.json');orig=load('source-original-en.json');old=load('source-modern-da.json');r=load('review-progress.json')
def fix(c,n,a,b):
 s=da['chapters'][c-1]['paragraphs'][n-1]; assert a in s
 t=s.replace(a,b);da['chapters'][c-1]['paragraphs'][n-1]=t
 for row in r['changes']:
  if(row['chapter'],row['paragraph'])==(c,n):row['after']=t;break
fix(13,17,'en lille, skarpsindig frøken','en lille frøken med spidse ansigtstræk')
fix(14,60,'en såkaldt vild','en vild')
da['chapters'][14]['title']=da['chapters'][14]['title'].replace('dårskab','tåbelighed')
write('modern-da.json',da)
# Rebuild complete actual change ledger from immutable before state to capture every edit accurately.
ledger=[]
for a,b in zip(old['chapters'],da['chapters']):
 if a['title']!=b['title']:ledger.append({'chapter':a['number'],'field':'title','before':a['title'],'after':b['title'],'reason':'Modern Danish heading preserving source meaning.'})
 for j,(s,t)in enumerate(zip(a['paragraphs'],b['paragraphs']),1):
  if s!=t:ledger.append({'chapter':a['number'],'paragraph':j,'before':s,'after':t,'reason':'Original-led full modern Danish translation and fidelity review; retain original argument, notes and quotations.'})
write('modern-da-ledger.json',ledger);write('modern-en-ledger.json',r['englishChanges'])
r['status']='content_complete_native_review_pending';write('review-progress.json',r)
assert [len(c['paragraphs'])for c in orig['chapters']]==[len(c['paragraphs'])for c in da['chapters']]==[len(c['paragraphs'])for c in en['chapters']]
assert all(t.strip()for c in da['chapters']for t in c['paragraphs'])
assert len(r['reviewedChapters'])==15
ident=[];short=[]
for c,(a,b)in enumerate(zip(orig['chapters'],da['chapters']),1):
 for j,(s,t)in enumerate(zip(a['paragraphs'],b['paragraphs']),1):
  if s==t:ident.append({'chapter':c,'paragraph':j,'text':t})
  if len(s.split())>50 and len(t.split())/len(s.split())<.68:short.append([c,j])
assert len(ident)==3 and not short
sha={'source-original-en.json':'3c44ae5bb8999fcfe8f3c6443d9b904e378a80af','source-modern-en.json':'4b6226e91552a8a1c162aadf9a502560d69df54e','source-modern-da.json':'c836a86740536f6aff33dea0a927296e1e952b9b','source-onboarding-en.json':'8813ff81dfd8ca9415ba73e107c2a82d3cfed330','source-onboarding-da.json':'ca88c609624207fb9638fa82ee401edecb9a8c5e'}
# Local snapshots were pretty printed; keep independent content hashes, no unsupported byte-equality claim.
validation={'mainSlots':778,'reviewedMainSlots':778,'chapters':15,'chapterSlotCounts':[len(c['paragraphs'])for c in da['chapters']],'shapeMatchesOriginalAndEnglish':True,'nonempty':True,'sourceIdenticalSlots':ident,'englishFallbackParagraphs':0,'longSourceParagraphsBelow068WordRatio':short,'biographyBlocks':13,'modernDanishChangedParagraphs':sum('paragraph'in z for z in ledger),'modernDanishChangedTitles':sum('field'in z for z in ledger),'englishChangedParagraphs':len(r['englishChanges']),'nativeDanishReview':'pending_user_arranged','qualityStatus':'Full translator source pass completed; automated checks are structural/heuristic, not native certification.'}
write('validation.json',validation)
audit=load('source-completeness-audit.json');audit['biographyStatus']='All13 recovered blocks translated in editorial-biography-modern-da.json; separate supplement, not inserted into778 main slots.';write('source-completeness-audit.final.json',audit)
files=['modern-da.json','modern-en.json','onboarding-da.json','onboarding-en.json','editorial-biography-modern-da.json','modern-da-ledger.json','modern-en-ledger.json','onboarding-da-ledger.json','onboarding-en-ledger.json','editorial-biography-ledger.json','validation.json','source-completeness-audit.final.json']
manifest={'bookId':'vindication-rights-of-woman','status':'prepared_for_parent_review_not_released','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Complete modern Danish main text, all retained inline notes/poems,13-block recovered historical editorial biography, DA/EN onboarding, one clear modern-English source correction.','destinationMap':{'modern-da.json':'app/public/data/editions/vindication-rights-of-woman-modern-da.json','modern-en.json':'app/public/data/editions/vindication-rights-of-woman-modern-en.json','onboarding-da.json':'app/public/data/onboarding/vindication-rights-of-woman.da.json','onboarding-en.json':'app/public/data/onboarding/vindication-rights-of-woman.json'},'sourceBlobShasFreshlyReadFromDefaultBranch':sha,'sourceEdition':'Project Gutenberg3420 HTML','sourceUrl':audit['sourceUrl'],'mainSourceCompleteness':'All778 stored original slots normalized-identical to primary edition including inline notes. Completeness claim is edition-bound, not comparison of every historical edition.','biographyIntegration':'Separate historical supplement requiring destination choice by integrating worker; do not silently add chapters or replace main slots. Biography claims are historical source statements, not modern verified biography.','validation':validation,'reviewAttention':['Native Danish final reading pending user-arranged reviewer.','Preserved historical religious, racial and gender judgments as source content.','Section7:139 English reason→season repaired against independent edition; original-en unchanged.','Section14:56 source allusions interpreted as illusions in Danish; modern English still carries source wording and may warrant a further source-edition check.','Section14:73 source justice context rendered uret (injustice); review original printing before changing English.','Section7:122 Medicean symmetry interpreted as Venus de Medici proportions; literary reference merits editorial check.','Danish verse is faithful semantic translation with line structure, not a metrical recreation.'],'releaseBoundary':'No repo write, commit, push, merge, deployment, catalogue enabling or Claude workflow change performed. Claude must receive explicit user handoff; refresh source SHAs and reconcile changes before integration.','files':[{ 'name':f,'sha256':hashlib.sha256((p/f).read_bytes()).hexdigest()}for f in files]}
write('manifest.json',manifest)
print(json.dumps(validation,ensure_ascii=False))
