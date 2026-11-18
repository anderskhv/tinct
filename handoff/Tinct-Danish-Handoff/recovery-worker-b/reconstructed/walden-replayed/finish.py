import json,hashlib,re,collections
from pathlib import Path
def rd(f):return json.loads(Path(f).read_text())
def wr(f,d):Path(f).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def slot(s):return tuple(map(int,s.split(':')))
def detail(k):return {'chapter':slot(k)[0],'paragraph':slot(k)[1]}
src=rd('source-metadata.json')
for f,meta in src.items():
 b=Path(f).read_bytes();assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==meta['sha']
o=rd('source-walden-original-en.json')['chapters']
ec=rd('walden-modern-en.partial.json');dc=rd('walden-modern-da.partial.json')
state=rd('state.json');assert state['directSourceBasedDanishDrafts']==502 and not state['remainingForCloseDanishRead']
for lang,d in [('da',dc),('en',ec)]:
 b=rd(f'source-walden-modern-{lang}.json');assert list(b)==list(d)
 for bo,src0,rev in zip(b['chapters'],o,d['chapters']):
  assert bo['number']==src0['number']==rev['number'] and len(bo['paragraphs'])==len(src0['paragraphs'])==len(rev['paragraphs']) and all(isinstance(t,str) and t.strip() for t in rev['paragraphs'])
  for t in rev['paragraphs']:assert '\ufffd' not in t and '\x00' not in t and '\r' not in t
 wr(f'walden-modern-{lang}.json',d)
def different(x,y,path=''):
 if isinstance(x,dict) and isinstance(y,dict):
  assert set(x)==set(y)
  return [z for k in x for z in different(x[k],y[k],(path+'.'+k).strip('.'))]
 if isinstance(x,list) and isinstance(y,list) and len(x)==len(y):return [z for j in range(len(x)) for z in different(x[j],y[j],f'{path}[{j}]')]
 return [{'field':path,'before':x,'after':y}] if x!=y else []
guides=[];titles=[]
for l,d in [('da',dc),('en',ec)]:
 f='walden.da.json' if l=='da' else 'walden.json';b=rd('source-'+f);g=rd(f)
 assert g['openingChapterLabel']==d['chapters'][0]['title'] and g['openingText']==d['chapters'][0]['paragraphs'][0]
 guides.extend({'language':l,**r} for r in different(b,g));orig=rd('source-walden-modern-'+l+'.json')
 titles.extend({'language':l,'chapter':i,'before':x['title'],'after':y['title']} for i,(x,y) in enumerate(zip(orig['chapters'],d['chapters']),1) if x['title']!=y['title'])
wr('title-changes.json',titles);wr('onboarding-changes.json',guides)
features=rd('special-source-slot-map.json');verse={f"{f['ch']}:{i}" for f in features if f['typ']=='poem' for i in f['slots']};accounts={f"{f['ch']}:{i}" for f in features if f['typ']=='pre' for i in f['slots']}
assert (len(verse),len(accounts))==(44,9)
for k in accounts:
 c,p=slot(k);assert '\n' in dc['chapters'][c-1]['paragraphs'][p-1] and '\n' in ec['chapters'][c-1]['paragraphs'][p-1]
reasons=['Household economy, cost figures, biblical and classical citations, and the contrast between work and living.','House sites, the narrator’s actual cabin, the Concord landscape and the argument for deliberate living.','Classical languages, rhetorical questions and the library and town-education argument.','Distinct train, trade, birdsong and night sounds, passage joins and natural-history details.','Solitude, social company and the changing senses of distance and mood.','Visitors’ voices, the Canadian woodchopper, questioning neighbors and natural comparisons.','Cultivation, dimensions, historical allusions, bean-field yields and costs.','Village life, night walks, jail and property in Thoreau’s narrative voice.','Measurements, optical descriptions, named ponds, local legend, property and species.','Fishing, shelter, John Field’s dialogue and Thoreau’s social criticism.','Hunting, appetite, chastity, artistic and spiritual ideals without converting them to prescriptions.','Animal observation, dialogue, the ant battle, species and loon chase.','House construction and heat, hand tools, wood, ice observations and domestic jokes.','Identification and social histories of people around Walden and the winter visit scenes.','Tracks, hunters, birds, mammals and winter calls.','Surveying, cross-section descriptions, measurements, ice harvest and destinations.','Date series, weather, sand forms and wordplay, return of birds, literary and biblical allusions.','Calls to self-exploration, legends, literary figures and final awakening.']
changes=[]
for row in rd('changes.partial.json'):
 k=row['slot'];c,p=slot(k)
 why='Translated and set verse against the primary lineation and its neighboring prose.' if k in verse else 'Restored the account as distinct rows with the original figures and fractional cents.' if k in accounts else reasons[c-1]
 changes.append({**detail(k),'before':row['before'],'after':row['after'],'reason':why})
def enreason(k):
 if k in ['1:90','1:91','1:100','1:103','8:2','13:6']:return 'Modernize the historical food term Indian meal to cornmeal, retaining the distinction from rye and wheat.'
 return {'1:80':'Identify Harvard in Cambridge, Massachusetts, removing the ambiguous modern name Cambridge College.','4:14':'Rejoin the moving pine to the ensuing Milton quotation.','4:15':'Restore the dependent infinitive after 4:14 and the sense of the flagship, preserving the verse break.','9:13':'Identify the Fahrenheit scale of the water and room observations.','14:12':'Make the historical trade in pulling wool from sheep pelts intelligible, keeping the original quoted words.','17:1':'Identify the Fahrenheit scale of the ice and water observations.','17:7':'Restore λείβω and λοβός from the independent primary text after encoding damage in the reader.','17:20':'Restore the starred verse omission marker separating the two excerpts of Ovid.','18:2':'Preserve the metaphor of the self as quarry, rather than reducing the sentence to literal self-shooting.','18:21':'Modern identify the periodical cicada behind the historical common name seventeen-year locust.','18:22':'Retain the cicada reference echoed from the preceding paragraph.'}[k]
english=[{**detail(r['slot']),'before':r['before'],'after':r['after'],'reason':enreason(r['slot'])} for r in rd('english-changes.partial.json')]
wr('changes.json',changes);wr('english-changes.json',english)
counts=[len(z['paragraphs']) for z in o];audit=rd('english-slot-audit.json')
assert len(audit)==sum(counts)==502 and all(not z['tokenFiguresAbsentVerbatim'] for z in audit)
wr('provenance.json',{'author':'Henry David Thoreau','work':'Walden; or, Life in the Woods (1854)','source':'https://www.gutenberg.org/cache/epub/205/pg205-images.html','primaryLocalFile':'primary-thoreau.html','primarySha256':sha('primary-thoreau.html'),'contents':'Only the 18 chapters of Walden, excluding later matter in the omnibus. Retained Danish is an input for comparison. Danish passages are directly edited against Thoreau. No third-party Danish translation used.','repositoryWitnesses':src,'secondaryChecks':[{'work':'Jeffrey S. Cramer, Walden: A Fully Annotated Edition, Yale University Press, 2004','use':'Former Inhabitants n. 70 identifies the wool-pulling trade; Conclusion nn. 93, 100 contextualize China pride and the periodical cicada. Annotations are not reproduced.'},{'work':'Dansk Ornitologisk Forening, Navne på alverdens fugle','url':'https://www.dof.dk/images/grupper/navne/dokumenter/Navne_pa_alverdens_fugle._Systematiske_danske_engelske_og_tyske_navne_PDF.pdf','use':'Taxonomic checks for the modern Danish bird names.'},{'work':'Pontederiaceae, Lex','url':'https://lex.dk/Pontederiaceae','use':'Hjertevandkærte.'}],'ownership':'Original English text and author’s historical map are public-domain work. Modern retained corpus files belong to the project.','sourceCheck':'Five frozen input files match their Git blob identities; upstream branch may subsequently change.'})
wr('REVIEW.json',{'book':'walden','state':'Complete local preparatory Danish draft; native-Danish review pending. No publication actions.','danishParagraphsReviewed':502,'danishParagraphsChanged':len(changes),'englishParagraphsCompared':len(audit),'englishParagraphsChanged':len(english),'englishReviewScope':'All 502 slots screened against their corresponding source for alignment, numeric tokens, names, relative length, corruption and low lexical overlap. Close editorial checks focused on source features, high-risk meanings and flagged outliers. This was not a separate exhaustive English copyedit.','chapterSlots':counts,'verseBlocks':34,'verseSlots':len(verse),'accountBlocks':8,'accountSlots':len(accounts),'titleChanges':len(titles),'onboardingFieldsChanged':dict(collections.Counter(g['language'] for g in guides)),'guideChecks':'Both exact opening previews, titles, length and component shape checked. Empty acclaim arrays in the candidates remove unsupported promotional quotations.','illustration':'Original 1846 pond survey map absent from upstream corpus. Standalone source JPEG and EN/DA descriptions supplied for optional placement after 16:5. Do not add a narrator paragraph or assume the app already displays it.','primaryCompleteness':'All original body tokens traced as documented in primary-completeness-audit.json; THE END colophon omitted in the project, two Greek forms corrected in the modern editions, map supplied separately.','reviewPriorities':['Read Economy’s extended jokes about labor, bondage, building and accounting aloud. Verify the fractional-cent convention and joins surrounding the financial tables.','Check term consistency and tone for historical social labels, indigenous and immigrant people, slavery and satire; retain the attribution of historical claims.','Check Thoreau’s sound effects, borrowed verse and allusions, especially 4:14–15 and 17:19–21, and the Danish handling of the English-language etymologies in 17:7–8.','Review mixed historical imperial units and metric parallels, wildlife common names, and the map placement/description.','A first-language Danish reviewer and reader UI check remain outstanding. Nobody has published or enabled the packet.']})
wr('state.json',{'status':'complete-local-draft','nativeReview':'pending','published':False,'book':'walden','chapters':18,'paragraphs':502,'directSourceBasedDanishDrafts':502,'remainingForCloseDanishRead':[],'wholeChaptersWithDirectSourceBasedDraft':list(range(1,19)),'danishParagraphsChanged':502,'englishParagraphsScreened':502,'modernEnglishChanges':len(english),'onboardings':'both complete','map':'supplied separately; existing reader lacks it'})
files=['walden-modern-da.json','walden-modern-en.json','walden.da.json','walden.json','walden_pond_map.jpg','map-descriptions.json','changes.json','english-changes.json','title-changes.json','onboarding-changes.json','REVIEW.json','provenance.json','state.json','primary-completeness-audit.json','primary-comparison.json','special-source-slot-map.json','english-slot-audit.json']
wr('manifest.json',[{'name':f,'path':str(Path(f).resolve()),'bytes':Path(f).stat().st_size,'sha256':sha(f)} for f in files])
print(len(changes),len(english),len(titles),len(guides),len(files))
