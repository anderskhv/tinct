from prepare import *
from collections import Counter
from html import escape
source=get(src/'original-en.json')['chapters']; da=get(p/'modern-da.json')['chapters'];en=get(p/'modern-en.json')['chapters']
previous={lang:get(src/f'modern-{lang}.json')['chapters'] for lang in ['da','en']};wip=get(src/'wip-da.json')['chapters'];bases=[wip,previous['en']]
witness=(src/'gutenberg-1400-independent.txt').read_text().split('*** END OF')[0]
bodies=re.split(r'(?m)^Chapter [IVXLCDM]+\.[ \t]*$',witness)[1:]
norm=lambda t:' '.join(t.split())
progress=[];changesmap=[];scr={};counts=Counter()
assert len(source)==len(da)==len(en)==len(bodies)==59
for n,(o,d,e,raw) in enumerate(zip(source,da,en,bodies),1):
 pp=[norm(v) for v in re.split(r'\n\s*\n',raw.strip()) if v.strip()!='[Illustration]']
 assert pp==list(map(norm,o['paragraphs']))
 assert d['number']==e['number']==o['number']==n
 le=len(pp);counts['source_blocks']+=le
 assert len(d['paragraphs'])==len(e['paragraphs'])==le and all(v.strip() for v in d['paragraphs']+e['paragraphs'])
 assert get(p/'chapters'/f'{n:03}-da.json')==d and get(p/'chapters'/f'{n:03}-en.json')==e
 delta={};newedits={}
 for lang,c,base in zip(['da','en'],[d,e],bases):
  old=previous[lang][n-1]; delta[lang]=[i for i,(x,y) in enumerate(zip(old['paragraphs'],c['paragraphs'])) if x!=y]
  newedits[lang]=[i for i,(x,y) in enumerate(zip(base[n-1]['paragraphs'],c['paragraphs'])) if x!=y]
  counts[f'{lang}_vs_pinned']+=len(delta[lang]);counts[f'{lang}_editorial_edits_vs_base']+=len(newedits[lang])
  assert old['number']==c['number'] and len(old['paragraphs'])==le
 changesmap.append({'chapterNumber':n,'numberOfPositions':le,'oldParagraphIndexToNew':'identity','changedParagraphIndices':delta})
 semantic=p/'chapters'/f'semantic-{n:03}.json'
 progress.append({'chapter':n,'paragraphs':le,'pinned_original_matches_witness_paragraph_by_paragraph':True,'retained_danish_variants_compared':2,'current_danish_file':f'chapters/{n:03}-da.json','current_english_file':f'chapters/{n:03}-en.json','editorial_changes_relative_to_starting_drafts':newedits,'retained_declared_baseline':'wip-da','semantic_screen_of_retained_text_complete':semantic.exists(),'native_danish_signoff':'pending'})
 counts['source_illustration_labels']+=raw.count('[Illustration]')
 r=[]
 for i,(a,b,t) in enumerate(zip(o['paragraphs'],d['paragraphs'],e['paragraphs'])):
  r.append(f'<section id="p{i}" class="row"><h3>§ {i+1} <small>index {i}</small></h3><div><p lang="da">{escape(b)}</p><details><summary>English source and modern English</summary><p lang="en"><strong>1867 text</strong> {escape(a)}</p><p lang="en"><strong>Tinct modern English</strong> {escape(t)}</p></details></div></section>')
 css='body{font:18px/1.55 Georgia,serif;color:#252321;background:#fffdfa;max-width:820px;margin:3rem auto;padding:0 1.5rem}h1,h2,h3,summary,nav,small{font-family:system-ui,sans-serif}nav{display:flex;gap:1em}a{color:#084d61}.row{border-top:1px solid #d2d1cc;padding:.7em 0}.row h3{font-size:.8em;margin:.2em 0;color:#50514c}.row h3 small{font-size:.85em;font-weight:400}p{white-space:pre-line}summary{cursor:pointer;font-size:.8em}details p{font-size:.9em}'
 links=''.join(f'<a href="chapter-{k:03}.html">{v}</a>' for k,v in [(n-1,'Previous'),(n+1,'Next')] if 1<=k<=59);links+='<a href="index.html">All chapters</a>'
 view=p/'reading-copy';view.mkdir(exist_ok=True)
 (view/f'chapter-{n:03}.html').write_text(f'<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Store forventninger · Kapitel {n}</title><style>{css}</style><nav>{links}</nav><h1>Store forventninger</h1><h2>Kapitel {n}</h2>'+''.join(r)+f'<nav>{links}</nav>')
(view/'index.html').write_text('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Store forventninger</title><style>'+css+'</style><h1>Store forventninger</h1><p>Dansk manuskript til gennemlæsning. Fold kildeteksten og den moderne engelske tekst ud under hvert afsnit.</p><ol>'+''.join(f'<li><a href="chapter-{n:03}.html">Kapitel {n}</a></li>' for n in range(1,60))+'</ol>')
for lang in ['en','da']:
 du=get(p/f'modern-{lang}-ledger.json')
 assert len(du)==counts[f'{lang}_vs_pinned']
 for rec in du:
  i=rec['paragraphIndex']; n=rec['chapter']-1
  assert rec['before']==previous[lang][n]['paragraphs'][i]
  assert rec['after']==({'da':da,'en':en}[lang][n]['paragraphs'][i])
 guid=get(p/f'primer-{lang}.json')
 for notice in guid['notice']:
  for a in notice.get('passages',[]):
   seq=da if a['editionKey']=='modern-da' else source
   assert a['quote'] in seq[a['chapterNumber']-1]['paragraphs'][a['paragraphIndex']]
put(p/'bookmarks.json',changesmap);put(p/'review-progress.json',progress);put(p/'validation.json',{**counts,'chapters':59,'nonempty_aligned_positions':counts['source_blocks'],'full_postedit_native_readthrough':'pending','semantic_screen_chapters':sum(x['semantic_screen_of_retained_text_complete'] for x in progress),'illustration_label_count_excludes_front_matter':True,'anchored_guide_quotes_validated':2})
print(dict(counts))
