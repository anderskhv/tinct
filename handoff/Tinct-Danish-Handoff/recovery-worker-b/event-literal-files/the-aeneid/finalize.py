from pathlib import Path
import json,re,hashlib
p=Path('/tmp/tinct-da-prep-20261104/the-aeneid')
def load(n):return json.loads((p/n).read_text())
def save(n,x):(p/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
j=load('candidate-the-aeneid-modern-en.json');log=load('ENGLISH-REPAIRS.json')
for b,n,changes,why in [
(9,37,[('Young Liger and Asylas slew two more: young Liger knew better how to bend the bow; Asylas best threw the pointed javelin.','Liger killed Emathion, and Asylas killed Corynaeus: Liger was skilled with the javelin, Asylas with the arrow that strikes from afar.')],'IX.571–572; Williams confirms weapon attribution.'),
(11,39,[('Your spear of mountain ash, driven with fury, transpierced Eumenius first, from side to side:','Your long fir spear, driven with fury, first pierced the exposed chest of Eunaeus, son of Clytius:'),('Liris and Pegasus','Liris and Pagasus'),('the slackened reins of his faint steed','the reins as his stabbed horse threw him'),('but Butes breast to breast: the spear descends','but Butes with his back turned: the spear descends')],'XI.666–672 and 690–693: name, spear wood, horse injury and direction of fatal blow.')]:
 old=j['chapters'][b-1]['paragraphs'][n-1];new=old
 for a,z in changes:assert a in new,a;new=new.replace(a,z)
 j['chapters'][b-1]['paragraphs'][n-1]=new
 log.append(dict(book=b,paragraph=n,before=old,after=new,reason=why))
save('candidate-the-aeneid-modern-en.json',j);save('ENGLISH-REPAIRS.json',log)
j=load('source-the-aeneid-modern-da.json'); counts=[]
for i,ch in enumerate(j['chapters'],1):
 paras=(p/f'{i:02}.draft').read_text().strip().split('\n§\n');assert len(paras)==len(ch['paragraphs']);ch['paragraphs']=paras;counts.append(len(paras))
save('candidate-the-aeneid-modern-da.json',j)
findings=[]
for i,ch in enumerate(j['chapters'],1):
 text='\n'.join(ch['paragraphs'])
 if text.count('»')!=text.count('«'):findings.append(f'Book {i}: quotation marks {text.count(chr(187))}/{text.count(chr(171))}')
 assert '\u00ad' not in text
 assert all(x.strip() for x in ch['paragraphs'])
for name in ['candidate-the-aeneid.json','candidate-the-aeneid.da.json']:
 g=load(name);assert set(g)==set(load(name.replace('candidate-','source-')))
save('QA.json',dict(status='complete-first-draft-reviewed-not-native-reviewed',paragraph_counts=counts,total=sum(counts),danish_words=sum(len(x.split())for c in j['chapters']for x in c['paragraphs']),english_repair_entries=len(log),quote_warnings=findings,slot_parity=True,empty_slots=False,soft_hyphens=False,native_review='pending',release_authorized=False))
print(json.dumps(load('QA.json'),indent=2))
