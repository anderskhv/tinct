from collate import *
from collections import Counter,defaultdict
import difflib
r=read('change-record.json')
edits=defaultdict(list)
for item in r: edits[(item['language'],item['chapter'],item['paragraph'])].append(item)
runs={}; bookmap={}; source=parse()
assert len(source)==365
for lang in ('da','en'):
 base=read('upstream/modern-'+lang+'.json')['chapters'];new=read('modern-'+lang+'.json')['chapters'];results=[];count=0;titles=0;updated=0;chapters=[]
 for i,((b,h,refs),old,now) in enumerate(zip(source,base,new),1):
  checkpoint=read(f'chapters/ch{i:03}.json');assert checkpoint['danish' if lang=='da' else 'english']==now
  assert old['number']==now['number']==i
  orig=read('chapters/ch%03d.json'%i); assert len(refs)==len(old['paragraphs'])==len(now['paragraphs'])
  assert all(v.strip() for v in now['paragraphs']);count+=len(refs)
  if old['title']!=now['title']:titles+=1
  for ix,(a,z) in enumerate(zip(old['paragraphs'],now['paragraphs']),1):
   chain=edits.get((lang,i,ix),[])
   t=a
   for step in chain:assert step['before']==t;t=step['after']
   assert t==z
   if t==a:continue
   updated+=1
   def offsets(s):
    v=[0]
    for ch in s:v.append(v[-1]+len(ch.encode('utf-16-le'))//2)
    return v
   before,after=offsets(a),offsets(z)
   blocks=difflib.SequenceMatcher(None,a,z,autojunk=False).get_matching_blocks()
   results.append({'chapter':i,'paragraph':ix,'oldSHA256':hashlib.sha256(a.encode()).hexdigest(),'newSHA256':hashlib.sha256(z.encode()).hexdigest(),'equalRunsUTF16':[[before[k.a],after[k.b],before[k.a+k.size]-before[k.a]] for k in blocks if k.size]})
   chapters.append(i)
 bookmap[lang]=results;runs[lang]=dict(chapters=len(new),paragraphs=count,changedParagraphs=updated,changedTextChapters=len(set(chapters)),changedTitles=titles)
assert all(x['paragraphs']==11340 for x in runs.values())
put('bookmark-map.json',{'coordinates':'Chapter and paragraph are one-based. Inside each changed paragraph equalRunsUTF16 contains old start, new start, and length in UTF-16 code units. Compare against the pinned input digest before applying. Only transfer a span automatically when its complete exact text is unambiguous in the candidate. Treat deleted or repeated matches as needing review.','oldPositions':'All 365 chapter numbers and all within-chapter paragraph indexes are retained. Reuse unchanged positions. A paragraph number can survive while its text changes or moves.','crossParagraphs':['EN 350: Old paragraph 1 contained new 1 and 2. Old 2 → new 3, old 3 → new 4, old 4 → new 5. Old 5 and 6 → new 6.','DA 350: Last sentence of old 1 → start of new 2.','EN 358: Old 15 and 16 → new 15; old 17 → 16, 18 → 17, 19 → 18. New 19 restores the missing ending.','EN 116: Old paragraph 6 borrowed material from the later 3 December entry (paragraph 10). The proper 27 November entry is restored at 6.','EN 150: Old 7 and 12 carried English renderings of French verse. The renderings belong to notes 8 and 13. In both languages a title or corrected name may need a new text anchor.','For any removed or invented passage, seek an exact retained quote in the same chapter, then inspect manually. Never move a highlight by subject alone.'],'changedParagraphs':bookmap})
put('validation.json',{'sourceParagraphsMatchedToCompleteReference':11340,'units':365,'sections':17,'replayedChanges':len(r),'editions':runs,'perChapterCheckpointVerified':365,'nativeDanishSignOff':'pending with designated reviewer','unitAddressing':'one-based','sourceEdition':'Maude via Project Gutenberg 2600','screening':'All chapters compared structurally against complete text. Translation checks are targeted, using paragraph and sentence comparison to locate possible omissions.'})
print(runs)
