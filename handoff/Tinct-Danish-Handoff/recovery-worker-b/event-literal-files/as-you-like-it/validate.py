from prep import *
import re,hashlib,collections
from datetime import datetime,timezone
d=rd('modern-da.json')['chapters'];e=rd('modern-en.json')['chapters'];progress=rd('review-progress.json')
assert [len(x['paragraphs']) for x in en]==[len(x['paragraphs']) for x in e]==[len(x['paragraphs']) for x in d]
assert {x['scene']:x['through'] for x in progress['reviewed']}=={i:len(ch['paragraphs']) for i,ch in enumerate(en,1)}
entries=[]; meta=[]; edits={(a['scene'],a['slot']):a for a in progress['edits']}
for c,(ch,m) in enumerate(zip(d,mapping),1):
 prev=da[m[0]-1] if m else {};meta.append({'chapter':c,'mappedRetainedChapter':m[0] if m else None,'before':{k:v for k,v in prev.items() if k!='paragraphs'} or None,'after':{k:v for k,v in ch.items() if k!='paragraphs'}})
 for i,after in enumerate(ch['paragraphs'],1):
  assert after.strip() and not re.search(r'\b(?:ACT|SCENE|Exeunt|Exit|Enter|Gutenberg|Eder|Eders|HERTUG SENIOR)\b| {3}',after),(c,i)
  before=prev['paragraphs'][m[1]+i-1] if m else None
  assert (before!=after)==((c,i) in edits)
  if (c,i) in edits:assert edits[c,i]['before']==before and edits[c,i]['after']==after
  entries.append({'scene':c,'slot':i,'retainedChapter':m[0] if m else None,'retainedSlot':m[1]+i if m else None,'before':before,'after':after})
wr('modern-da-ledger.json',{'chapterMetadata':meta,'allReviewedSlots':entries,'omittedNonNarrativeSlots':rd('realignment.json')['omittedNonNarrativeSlots']})
w=(p/'independent-witness.txt').read_text();witnessScenes=[(n,line) for n,line in enumerate(w.splitlines(),1) if re.match(r'^(?:Actus .+?\. )?Sc(?:o)?ena (?:Prima|Secunda|Tertius|Tertia|Quarta|Quinta|Sexta|Septima)\.',line,re.I)]
assert len(witnessScenes)==22 and 'not the fashion to see the Ladie the Epilogue' in w and 'that no man else will' in w
assert all(rd('onboarding-'+k+'.json')['openingText'] in z[0]['paragraphs'][2] for k,z in [('da',d),('en',e)])
assert sorted(x['number'] for x in d)==list(range(1,24))
def sha(f):return hashlib.sha256((p/f).read_bytes()).hexdigest()
v={'chapterSlots':[len(x['paragraphs']) for x in d],'chapterCount':23,'acts':5,'dramaticScenes':22,'epilogue':True,'reviewedSlots':len(entries),'changedOrRestoredDanishSlots':len(edits),'restoredOpeningSceneSlots':len(d[0]['paragraphs']),'retainedSlotsWithoutTextChanges':len(entries)-len(edits),'archivedNoticeAndTrailerSlots':17,'englishRepairs':len(rd('modern-en-ledger.json')),'introChangedFields':{k:len(v) for k,v in rd('onboarding-ledger.json').items()},'independentFolioSource':{'file':'independent-witness.txt','url':'https://www.gutenberg.org/cache/epub/1121/pg1121.txt','sha256':sha('independent-witness.txt'),'sceneHeadingLineNumbers':witnessScenes,'limits':'Structural comparison and selected readings against the Folio transcription. The aligned English original remains the paragraph reference.'},'allFiveInputBlobShasRecheckedAtMain':True,'nativeDanishFinalRead':'pending, user-arranged'}
wr('validation.json',v)
prov=rd('provenance.json');out=['modern-da.json','modern-en.json','onboarding-da.json','onboarding-en.json']
wr('manifest.json',{'bookId':'as-you-like-it','status':'locally prepared for native-Danish review','sourceRepository':'anderskhv/tinct','sourceRef':'main','inputs':prov,'deliverables':[{'file':x,'sha256':sha(x),'destination':next(y['path'] for y in prov if y['k']==x[:-5])} for x in out],'ledgers':['modern-da-ledger.json','modern-en-ledger.json','onboarding-ledger.json','realignment.json'],'validation':'validation.json','reviewedSlots':len(entries),'changedOrRestoredDanishSlots':len(edits),'englishRepairs':len(rd('modern-en-ledger.json')),'notes':['The retained Danish file omitted Act I, scene i, combined scenes, and mislabelled acts. The replacement follows the complete 23-chapter English slot structure.','Both introductions point to the orchard opening. Contemporary Danish, spoken registers, verse passages, songs, stage directions and the epilogue have received an editorial pass.','The source file embeds four copies of a World Library personal/noncommercial electronic-edition notice. Its complete text and locations are preserved in the input and realignment ledger. Confirm an acceptable source basis before commercial distribution. No rights clearance has been performed.','The First Folio transcription reads “no man else will” in V.iv; both proposed modern texts follow that reading.','User-arranged native Danish final reading pending. No release or catalog mutation performed.']})
print(v['reviewedSlots'],len(edits),v['introChangedFields'])
