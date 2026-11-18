from prep import *
import hashlib,copy
report={}
for lang in ['da','en']:
 a=rd('source-modern-'+lang+'.json');b=rd('modern-'+lang+'.json');ledger=rd('working-'+lang+'-changes.json');idx={(x['episode'],x['slot']):x for x in ledger};assert len(idx)==len(ledger)
 assert len(a['chapters'])==len(b['chapters'])==18
 changes=[]
 for c,(old,new) in enumerate(zip(a['chapters'],b['chapters']),1):
  assert len(old['paragraphs'])==len(new['paragraphs'])==len(en[c-1]['paragraphs'])
  assert {k:v for k,v in old.items() if k!='paragraphs'}=={k:v for k,v in new.items() if k!='paragraphs'}
  for i,(s,t) in enumerate(zip(old['paragraphs'],new['paragraphs']),1):
   assert isinstance(t,str) and t.strip()
   if s!=t:
    assert idx[(c,i)]['before']==s and idx[(c,i)]['after']==t and idx[(c,i)]['original']==en[c-1]['paragraphs'][i-1]
    changes.append((c,i))
 assert len(changes)==len(ledger)
 assert {k:v for k,v in a.items() if k!='chapters'}=={k:v for k,v in b.items() if k!='chapters'}
 report[lang]={'slots':7148,'episodes':18,'changedSlots':len(changes),'exactLedgerValidated':True,'metadataUnchanged':True}
for lang in ['en','da']:
 a=rd('source-onboarding-'+lang+'.json');b=rd('onboarding-'+lang+'.json');ls=rd('working-guide-'+lang+'-changes.json');rebuilt=copy.deepcopy(a)
 for x in ls:
  old=a;new=b;target=rebuilt
  for k in x['path']:old=old[k];new=new[k]
  for k in x['path'][:-1]:target=target[k]
  assert old==x['before'] and new==x['after'];target[x['path'][-1]]=x['after']
 assert rebuilt==b
 report['guide-'+lang]={'fieldsChanged':len(ls),'exactLedgerValidated':True}
files=['modern-da.json','modern-en.json','onboarding-da.json','onboarding-en.json','working-da-changes.json','working-en-changes.json','working-guide-da-changes.json','working-guide-en-changes.json']
report['hashes']={f:hashlib.sha256((p/f).read_bytes()).hexdigest() for f in files}
report['status']='structurally-valid-full-editorial-draft-native-and-specialist-review-pending'
wr('validation.json',report)
print({k:v for k,v in report.items() if k!='hashes'})
