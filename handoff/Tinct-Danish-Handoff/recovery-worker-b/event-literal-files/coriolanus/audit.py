from prep import *
import hashlib
def sha(f):return hashlib.sha256((p/f).read_bytes()).hexdigest()
def dif(a,b,k=''):
 if isinstance(a,dict):assert a.keys()==b.keys();return sum([dif(v,b[h],k+'/'+str(h)) for h,v in a.items()],[])
 if isinstance(a,list):assert len(a)==len(b);return sum([dif(v,b[n],k+'/'+str(n)) for n,v in enumerate(a)],[])
 return [] if a==b else [{'pointer':k,'before':a,'after':b}]
D=rd('modern-da.json');E=rd('modern-en.json');pr=rd('review-progress.json')
wit=(p/'witness-modern-spelling.txt').read_text().split('*** END OF')[0];sc=re.split(r'^SCENE [IVX]+\.[^\n]*\n',wit,flags=re.M)[1:]
words=lambda s:re.findall(r'[^\W_]+',s.casefold())
assert len(en)==len(sc)==len(D['chapters'])==len(E['chapters'])==29
dlog=[];elog=[];stats=[];titles=[]
for n,(c,w,d,e,old,me) in enumerate(zip(en,sc,D['chapters'],E['chapters'],da,modern),1):
 sz=len(c['paragraphs']);assert sz==len(d['paragraphs'])==len(e['paragraphs'])==len(old['paragraphs'])==len(me['paragraphs'])==pr[str(n)]
 ow=words(' '.join(c['paragraphs']));assert ow==words(re.sub(r'^ACT [IVX]+\s*$','',w,flags=re.M));stats.append({'scene':n,'title':c['title'],'slots':sz,'matchingSourceWitnessTokens':len(ow)})
 if d['title']!=old['title']:titles.append({'scene':n,'before':old['title'],'after':d['title']})
 for i,(o,x,y,xx,yy) in enumerate(zip(c['paragraphs'],old['paragraphs'],d['paragraphs'],me['paragraphs'],e['paragraphs']),1):
  assert x.strip() and y.strip() and yy.strip();assert ' | ' not in y
  dlog.append({'scene':n,'slot':i,'original':o,'before':x,'after':y,'changed':x!=y})
  if xx!=yy:elog.append({'scene':n,'slot':i,'original':o,'before':xx,'after':yy})
wr('modern-da-ledger.json',{'sceneTitles':titles,'paragraphs':dlog});wr('modern-en-ledger.json',elog)
lg={k:dif(rd('source-onboarding-'+k+'.json'),rd('onboarding-'+k+'.json')) for k in ('da','en')};wr('onboarding-ledger.json',lg)
for k,doc in [('da',D),('en',E)]:g=rd('onboarding-'+k+'.json');assert g['openingText']==doc['chapters'][0]['paragraphs'][0] and g['openingChapterLabel']==doc['chapters'][0]['title']
v={'scenes':stats,'acts':5,'totalScenes':len(stats),'danishSlotsReviewed':len(dlog),'danishSlotsChanged':sum(x['changed'] for x in dlog),'danishSceneTitlesChanged':len(titles),'modernEnglishSlotsChanged':len(elog),'guideFieldChanges':{k:len(x) for k,x in lg.items()},'matchedGutenberg1535Tokens':sum(x['matchingSourceWitnessTokens'] for x in stats),'independentNativeDanishReview':'pending user-arranged reviewer','sourceMainBlobShasRechecked':'2026-11-05, five of five matched','publication':'local preparation only'};wr('validation.json',v)
sources=rd('provenance.json')
wr('manifest.json',{'bookId':'coriolanus','status':'complete candidate, native Danish review pending','inputs':sources,'candidateFiles':[{'file':x['k']+'.json','target':x['p'],'sha256':sha(x['k']+'.json')} for x in sources if x['k']!='original-en'],'reviewFiles':{f:sha(f) for f in ['validation.json','modern-da-ledger.json','modern-en-ledger.json','onboarding-ledger.json']},'witnesses':[{'url':'https://www.gutenberg.org/ebooks/'+str(id),'file':f,'sha256':sha(f),'use':use} for id,f,use in [(1535,'witness-modern-spelling.txt','PG Shakespeare Team transcription. All 29 original-English scenes match in full after case-folding, ignoring punctuation and whitespace and excluding location and act headings. Includes all spoken words and stage directions.'),(1131,'witness-first-folio.txt','First Folio spelling transcription; independent historical reference.'),(49007,'witness-cambridge.txt','Cambridge edition, vol. VI, edited by William George Clark and William Aldis Wright; Macmillan, 1865. Independent historical reference.')]],'editorialNotes':['Standard Project Gutenberg front and end notices are preserved in downloaded witnesses. No publisher license notice was identified in the repository dramatic body. The play itself is a historical public-domain work.','Retains the final scene heading Antium as in the repository and Gutenberg 1535; Coriolanus addresses the people of Corioles within the scene.','V.vi: the ambiguous fraction in the spoils is rendered as in the repository modern English (more than one third of campaign costs). III.ii: unbarbed read as uncovered.','Two guide quotes checked against primary texts: Eliot, Hamlet and His Problems, https://www.gutenberg.org/ebooks/57795 and Hazlitt, Characters of Shakespear’s Plays, https://www.gutenberg.org/ebooks/55932.','No deployment or repository changes. Compare blob IDs before integrating.'],'validation':'validation.json'})
print({k:v for k,v in v.items() if k!='scenes'})
