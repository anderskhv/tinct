from prep import *
import difflib, hashlib
sha=lambda f:hashlib.sha256((p/f).read_bytes()).hexdigest()
def dif(a,b,k=''):
 if isinstance(a,dict):assert a.keys()==b.keys();return sum([dif(v,b[h],k+'/'+str(h)) for h,v in a.items()],[])
 if isinstance(a,list):assert len(a)==len(b);return sum([dif(v,b[n],k+'/'+str(n)) for n,v in enumerate(a)],[])
 return [] if a==b else [{'pointer':k,'before':a,'after':b}]
D=rd('modern-da.json');E=rd('modern-en.json');pr=rd('review-progress.json');w=(p/'witness.txt').read_text().split('*** END OF')[0]
s=re.split(r'^SCENE [IVX]+\.[^\n]*\n',w,flags=re.M)[1:];assert len(s)==len(en)==len(D['chapters'])==len(E['chapters'])==9
dl=[];el=[];st=[];tl=[]
for n,(o,ew,d,e,y,z) in enumerate(zip(en,s,D['chapters'],E['chapters'],da,modern),1):
 sz=len(o['paragraphs']);assert sz==len(d['paragraphs'])==len(e['paragraphs'])==len(y['paragraphs'])==len(z['paragraphs'])==pr[str(n)]
 norm=lambda t:re.findall(r'[^\W_]+',t.casefold());a=norm(' '.join(o['paragraphs']));b=norm(re.sub(r'^ACT [IVX]+\s*$','',ew,flags=re.M));ops=[]
 for tag,l,h,ll,hh in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
  if tag=='equal':continue
  assert set(a[l:h]+b[ll:hh])<={'theseus','lysander','helena','oberon','puck','bottom','pyramus'}
  ops.append({'kind':tag,'repoTokens':a[l:h],'witnessTokens':b[ll:hh],'repoIndex':l,'witnessIndex':ll})
 st.append({'scene':n,'slots':sz,'originalTitle':o['title'],'repositoryTokens':len(a),'gutenbergTokens':len(b),'speakerLabelVariants':ops})
 if d['title']!=y['title']:tl.append({'scene':n,'before':y['title'],'after':d['title']})
 for i,(org,before,after,befen,aften) in enumerate(zip(o['paragraphs'],y['paragraphs'],d['paragraphs'],z['paragraphs'],e['paragraphs']),1):
  assert after.strip() and aften.strip() and ' | ' not in after
  dl.append({'scene':n,'slot':i,'original':org,'before':before,'after':after,'changed':before!=after})
  if befen!=aften:el.append({'scene':n,'slot':i,'original':org,'before':befen,'after':aften})
wr('modern-da-ledger.json',{'sceneTitles':tl,'paragraphs':dl});wr('modern-en-ledger.json',el)
lg={k:dif(rd('source-onboarding-'+k+'.json'),rd('onboarding-'+k+'.json')) for k in ('en','da')};wr('onboarding-ledger.json',lg)
for k,doc in [('da',D),('en',E)]:
 g=rd('onboarding-'+k+'.json');assert g['openingText']==doc['chapters'][0]['paragraphs'][1] and g['openingChapterLabel']==doc['chapters'][0]['title']
v={'scenes':st,'totalScenes':9,'acts':5,'danishSlotsReviewed':len(dl),'danishSlotsChanged':sum(x['changed'] for x in dl),'danishSceneTitlesChanged':len(tl),'modernEnglishSlotsChanged':len(el),'guideFieldChanges':{k:len(x) for k,x in lg.items()},'sourceMainBlobShasRechecked':'2026-11-05','independentNativeDanishReview':'pending user-arranged reviewer','publication':'local preparation only'};wr('validation.json',v)
sources=rd('provenance.json')
wr('manifest.json',{'bookId':'midsummer','status':'complete candidate, native Danish review pending','inputs':sources,'candidateFiles':[{'file':x['k']+'.json','target':x['p'],'sha256':sha(x['k']+'.json')} for x in sources if x['k']!='original-en'],'reviewFiles':{f:sha(f) for f in ['validation.json','modern-da-ledger.json','modern-en-ledger.json','onboarding-ledger.json']},'witness':{'url':'https://www.gutenberg.org/ebooks/1514','file':'witness.txt','sha256':sha('witness.txt'),'coverage':'All nine scenes compared word by word, ignoring punctuation, case and whitespace. The only token differences are speaker headings around stage directions; their exact edits appear in validation.json. The Gutenberg front matter contains the list of characters, outside repository scene structure. No lines of dialogue or scene action missing.'},'editorialNotes':['Historical public-domain play. Gutenberg ebook credits the PG Shakespeare Team. Downloaded witness preserves its standard front and end notices.','Deliberate mixed-up myths, cues, puns and malapropisms are retained or recreated in modern Danish. The Bottom/bottom joke keeps the character name and uses Danish bund. The die/ace joke uses a die roll to preserve the one-to-zero sequence. Verse and song retain line breaks rather than uniform meter.','Guide corrections include who was enchanted, who applied the flower and who accuses whom. Hazlitt wording checked against Characters of Shakespear’s Plays (1817), https://www.gutenberg.org/ebooks/55932.','No release or repository changes. Recheck source blob IDs before integrating.'],'validation':'validation.json'})
print({k:v for k,v in v.items() if k!='scenes'})
