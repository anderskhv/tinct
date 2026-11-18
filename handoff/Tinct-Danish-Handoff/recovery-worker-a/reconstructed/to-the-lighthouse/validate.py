import hashlib,json,datetime
from revise import *
o=load('source-original-en.json');r=load('review-progress.json');src=load('source-provenance.json')
counts=[len(c['paragraphs'])for c in o['chapters']];assert sum(counts)==495 and len(counts)==42
audit=load('source-completeness-audit.json');assert len(audit['chapters'])==42 and all(ch['editionsMatch'] for ch in audit['chapters'])
validation={'sourceTextMatchIndependentStandardEbooks':True,'chapters':42,'sectionCount':3,'paragraphs':sum(counts),'paragraphsByChapter':counts,'changedParagraphs':{},'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nativeDanishReview':'pending, user-arranged'}
targets={}
for lang,key in [('da','changes'),('en','englishChanges')]:
 name='modern-'+lang;now=load(name+'.json');old=load('source-'+name+'.json');assert len(now['chapters'])==42 and len(now['sections'])==3
 changes=sorted(r[key],key=lambda z:(z['chapter'],z['paragraph']));by={(z['chapter'],z['paragraph']):z for z in changes};diff=0
 for ci,(a,b,c) in enumerate(zip(o['chapters'],old['chapters'],now['chapters']),1):
  assert list(a['paragraphs']) and len(a['paragraphs'])==len(b['paragraphs'])==len(c['paragraphs']) and a['number']==c['number']==ci
  for i,(s,t,v) in enumerate(zip(a['paragraphs'],b['paragraphs'],c['paragraphs']),1):
   assert v.strip()
   if lang=='da':
    assert v.count('\n')==s.count('\n') and v.count('_')==s.count('_') and (s.startswith('['),s.endswith(']'))==(v.startswith('['),v.endswith(']'))
    assert ',,' not in v and '\ufffd' not in v
   if t!=v:
    diff+=1;z=by[ci,i];assert (z['before'],z['after'])==(t,v)
 assert diff==len(changes);write(name+'-ledger.json',changes);validation['changedParagraphs'][lang]=diff
 targets[name+'.json']='app/public/data/editions/to-the-lighthouse-'+name+'.json'
d=load('onboarding-da.json');en=load('onboarding-en.json');s=load('source-onboarding-en.json');assert d.keys()==s.keys()==en.keys()
for lang,obj in [('da',d),('en',en)]:
 assert all(obj[k] for k in obj); assert (len(obj['angleCards']),len(obj['cast']),len(obj['whyItMatters']))==(4,6,3)
 op=' '.join(load('modern-'+lang+'.json')['chapters'][0]['paragraphs']);assert op.startswith(obj['openingText'])
 targets['onboarding-'+lang+'.json']='app/public/data/onboarding/to-the-lighthouse'+('.da' if lang=='da' else '')+'.json'
write('onboarding-ledger.json',{'da':{'before':None,'after':d,'reason':'Danish introduction absent from main.'},'en':[{'field':k,'before':s[k],'after':en[k]}for k in s if en[k]!=s[k]]})
write('validation.json',validation)
r['status']='editorial_complete_native_review_pending';write('review-progress.json',r)
write('manifest.json',{'bookId':'to-the-lighthouse','status':'editorial_complete_integration_pending','preparedAt':validation['checkedAt'],'destinationMap':targets,'sourceBlobShasFreshlyReadFromMain':{k:v['sha'] for k,v in src.items()},'missingSourceFiles':['app/public/data/onboarding/to-the-lighthouse.da.json (404 at final check)'],'scope':'Complete 495-slot Danish source review, including all inset verse and bracketed narrative. Targeted source-supported modern-English fixes; not a comprehensive English rewrite. Danish introduction and aligned English opening.','validation':validation,'independentWitness':audit['primaryUrl'],'secondaryWitness':audit['otherWitness'],'reviewLedgers':['modern-da-ledger.json','modern-en-ledger.json','onboarding-ledger.json'],'artifactSha256':{f:hashlib.sha256((p/f).read_bytes()).hexdigest() for f in targets},'integration':'Prepared only, no publication, metadata enablement or repository writes. Recheck baseline SHAs before integration. Native reviewer pending.'})
print(validation)
