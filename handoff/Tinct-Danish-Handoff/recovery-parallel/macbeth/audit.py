from prep import *
import difflib,hashlib
D=rd('modern-da.json')['chapters'];E=rd('modern-en.json')['chapters'];m=rd('alignment.json');variants=rd('source-witness-variants.json')
def sha(f):return hashlib.sha256((p/f).read_bytes()).hexdigest()
assert len(D)==len(E)==len(da)==len(en)==28
s=re.split(r'^SCENE [IVX]+\.[^\n]*\n',(p/'witness.txt').read_text().split('*** END OF')[0],flags=re.M)[1:];assert len(s)==28
fused={(5,3):(5,2),(15,8):(15,7),(15,44):(15,41)}
df=[];ef=[];sc=[];tt=[]
for j,(o,d,e,b,y,ws) in enumerate(zip(en,D,E,da,modern,s),1):
 n=len(o['paragraphs']);assert n==len(e['paragraphs'])==len(d['paragraphs'])==len(y['paragraphs'])
 norm=lambda a:re.findall(r'[^\W_]+',a.casefold())
 left=norm(' '.join(o['paragraphs']));right=norm(re.sub(r'^ACT [IVX]+\s*$','',ws,flags=re.M));ops=[]
 for op,lo,hi,l,r in difflib.SequenceMatcher(None,left,right,autojunk=False).get_opcodes():
  if op=='equal':continue
  assert op=='delete' and set(left[lo:hi])<={'macbeth','lady','duncan','banquo','macduff','ross','hecate','first','murderer','gentlewoman'};ops.append(' '.join(left[lo:hi]))
 assert ops==[v['repoTokens'] for v in variants if v['scene']==j]
 kept=[]
 for i,(orig,v,z,zf) in enumerate(zip(o['paragraphs'],d['paragraphs'],y['paragraphs'],e['paragraphs']),1):
  old=m[f'{j}.{i}'];prev=b['paragraphs'][old-1] if old else None
  if old:kept.append(old)
  assert v.strip() and zf.strip() and ' | ' not in v and v.startswith('[')==orig.startswith('[')
  if not orig.startswith('['):assert re.match(r'^[A-ZÆØÅÉ ,]+\. ',v)
  rr={'scene':j,'slot':i,'source':orig,'retainedSlot':old,'before':prev,'after':v,'changed':v!=prev}
  if (j,i) in fused:rr['splitFromRetainedSlot']=fused[j,i][1]
  df.append(rr)
  if z!=zf:ef.append({'scene':j,'slot':i,'original':orig,'before':z,'after':zf})
 assert kept==list(range(1,len(b['paragraphs'])+1))
 sc.append({'scene':j,'title':o['title'],'correctSlots':n,'retainedDanishSlots':len(b['paragraphs']),'addedSlots':n-len(b['paragraphs']),'sourceTokens':len(left),'witnessTokens':len(right),'extraRepositorySpeakerLabels':ops})
 if d['title']!=b['title']:tt.append({'scene':j,'before':b['title'],'after':d['title']})
def dif(x,y,k=''):
 if isinstance(x,dict):assert x.keys()==y.keys();return sum([dif(v,y[a],k+'/'+a) for a,v in x.items()],[])
 if isinstance(x,list):assert len(x)==len(y);return sum([dif(v,y[i],k+'/'+str(i)) for i,v in enumerate(x)],[])
 return [] if x==y else [{'pointer':k,'before':x,'after':y}]
lg={k:dif(rd('source-onboarding-'+k+'.json'),rd('onboarding-'+k+'.json')) for k in ('en','da')}
for k,chs in [('en',E),('da',D)]:
 g=rd('onboarding-'+k+'.json');assert g['openingText']==chs[0]['paragraphs'][0] and g['openingChapterLabel']==chs[0]['title']
assert len(df)==840 and sum(x['retainedSlot'] is None for x in df)==34 and len(fused)==3
for f,c in [('modern-da-ledger.json',{'sceneTitles':tt,'paragraphs':df}),('modern-en-ledger.json',ef),('onboarding-ledger.json',lg)]:wr(f,c)
v={'scenes':sc,'acts':5,'totalScenes':28,'danishSlotsReviewed':len(df),'retainedDanishSlots':806,'danishSlotsChanged':sum(x['changed'] for x in df),'addedDanishSlots':34,'previouslyAbsentSpeeches':31,'previouslyFusedSpeeches':3,'affectedSceneLengths':sum(x['addedSlots']>0 for x in sc),'danishSceneTitlesChanged':len(tt),'modernEnglishSlotsChanged':len(ef),'guideFieldChanges':{k:len(v) for k,v in lg.items()},'sourceMainBlobShasRechecked':'2026-11-05','independentNativeDanishReview':'pending user-arranged reviewer','publication':'local preparation only'};wr('validation.json',v)
src=rd('provenance.json');wr('manifest.json',{'bookId':'macbeth','status':'complete candidate; native Danish review pending','inputs':src,'candidateFiles':[{'file':x['k']+'.json','target':x['p'],'sha256':sha(x['k']+'.json')} for x in src if x['k']!='original-en'],'reviewFiles':{f:sha(f) for f in ['validation.json','modern-da-ledger.json','modern-en-ledger.json','onboarding-ledger.json','alignment.json','source-witness-variants.json']},'witnesses':[{'file':f,'url':'https://www.gutenberg.org/ebooks/'+item,'sha256':sha(f)} for f,item in [('witness.txt','1533'),('witness-coleridge.txt','8533')]],'editorialNotes':['The retained text was short by 34 paragraph slots in 16 scenes. 31 speeches were absent; three survived fused with adjacent material. Both candidates now track the source’s 840 slots including speaker names and stage directions. The ledger preserves every retained paragraph at its old location, with precise old-to-new mapping.','Comparison with Gutenberg ebook 1533 across all 28 scenes found 34 differences confined to repeated speaker names at continuations in the repository original. Normalization excludes punctuation, case and whitespace. No missing lexical material in speeches or stage directions. The archived witness retains credits, dramatis personae and Gutenberg notices.','Historical court rank thane is rendered than with a brief explanation in the Danish introduction. The witches’ charm retains all ingredients, the 31 days, repeated refrains, and the ethnic and religious stereotyping spoken by the characters. The two songs in the Hecate scenes retain their cues as printed without importing lyrics from another work.','Coleridge’s critical observation checked against Literary Remains, vol. II, “Notes on Macbeth”. Localize the formal Danish address and listen to witches, porter, dagger, sleepwalking and final combat during the native read.','Local preparation only. Recheck blob identities before integration.'],'validation':'validation.json'})
print({k:b for k,b in v.items() if k!='scenes'})
