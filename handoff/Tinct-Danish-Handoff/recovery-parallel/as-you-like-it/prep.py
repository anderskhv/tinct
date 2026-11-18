from pathlib import Path
import json
p=Path(__file__).parent
def rd(f):return json.loads((p/f).read_text())
def wr(f,v):(p/f).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
en=rd('source-original-en.json')['chapters'];da=rd('source-modern-da.json')['chapters']
mapping=[None,(1,0),(2,0),(2,55),(3,0),(4,0),(5,0),(6,0),(7,0),(8,0),(8,43),(9,0),(10,0),(11,0),(12,0),(12,31),(13,0),(14,0),(14,65),(15,0),(16,0),(17,0),(17,67)]
def initial():
 import copy
 obj={'chapters':copy.deepcopy(en)};used=set();entries=[]
 for j,(ch,m) in enumerate(zip(obj['chapters'],mapping),1):
  ch['title']=ch['title'].replace('Act ','Akt ').replace('Scene ','scene ').replace('Epilogue','Epilog');ch['section']=ch['section'].replace('Act ','Akt ').replace('Epilogue','Epilog')
  if m:
   k,b=m;l=len(ch['paragraphs']);ch['paragraphs']=da[k-1]['paragraphs'][b:b+l];assert len(ch['paragraphs'])==l
   for i,s in enumerate(ch['paragraphs']):used.add((k,b+i+1));entries.append({'scene':j,'slot':i+1,'retainedChapter':k,'retainedSlot':b+i+1})
  else:ch['paragraphs']=[None]*len(ch['paragraphs'])
 wr('modern-da.json',obj);wr('realignment.json',{'mappings':entries,'omittedNonNarrativeSlots':[{'retainedChapter':k,'retainedSlot':i,'before':t} for k,c in enumerate(da,1) for i,t in enumerate(c['paragraphs'],1) if (k,i) not in used],'restoredEntireScene':1})
 wr('review-progress.json',{'reviewed':[],'edits':[]})
def save(c,ed,end):
 obj=rd('modern-da.json');s=obj['chapters'][c-1]['paragraphs'];ledger=rd('review-progress.json');m=mapping[c-1]
 for i,t in ed.items():
  orig=da[m[0]-1]['paragraphs'][m[1]+i-1] if m else None;s[i-1]=t
  ledger['edits']=[e for e in ledger['edits'] if (e['scene'],e['slot'])!=(c,i)]
  if orig!=t:ledger['edits'].append({'scene':c,'slot':i,'before':orig,'after':t})
 ledger['reviewed']=[i for i in ledger['reviewed'] if i['scene']!=c]+[{'scene':c,'through':end}];wr('review-progress.json',ledger);wr('modern-da.json',obj)
if __name__=='__main__':initial()
