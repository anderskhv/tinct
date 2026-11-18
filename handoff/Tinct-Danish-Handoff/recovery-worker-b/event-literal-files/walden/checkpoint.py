import json,hashlib
from pathlib import Path
def read(f):return json.loads(Path(f).read_text())
def save(f,d):Path(f).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
files='edits-da verse-da prose-da prose2-da opening-da chapter-openings-da chapter-openings2-da chapter-openings3-da arguments-da conclusion-da village-da reading-da solitude-da'.split()
direct={k for f in files for k in read(f+'.json')}
b=read('source-walden-modern-da.json')['chapters'];d=read('walden-modern-da.partial.json')['chapters']
eb=read('source-walden-modern-en.json')['chapters'];e=read('walden-modern-en.partial.json')['chapters']
assert [len(x['paragraphs']) for x in b]==[len(x['paragraphs']) for x in d]==[len(x['paragraphs']) for x in e]
rows=[];erows=[];rem=[]
for c,(p,q) in enumerate(zip(b,d),1):
 for j,(t,v) in enumerate(zip(p['paragraphs'],q['paragraphs']),1):
  k=f'{c}:{j}'
  if k not in direct:rem.append(k)
  if t!=v:rows.append({'slot':k,'scope':'direct source-based editorial draft' if k in direct else 'terminology/measurement repair; full close read pending','before':t,'after':v})
  et,ev=[z[c-1]['paragraphs'][j-1] for z in [eb,e]]
  if et!=ev:erows.append({'slot':k,'before':et,'after':ev})
save('changes.partial.json',rows);save('english-changes.partial.json',erows)
save('state.json',{'status':'partial; do not release','paragraphs':502,'danishParagraphsChanged':len(rows),'directSourceBasedDanishDrafts':len(direct),'remainingForCloseDanishRead':rem,'modernEnglishChanges':len(erows),'modernEnglishFullRead':'pending','wholeChaptersWithDirectSourceBasedDraft':[3,5,8,18],'onboardings':'Both drafted, reconcile before handoff.','primaryAudit':'All 18 original chapter bodies compared to Gutenberg #205, tokens accounted for, map and Greek repairs logged.','nativeReview':'pending'})
print(len(rows),len(direct),len(rem),len(erows))
