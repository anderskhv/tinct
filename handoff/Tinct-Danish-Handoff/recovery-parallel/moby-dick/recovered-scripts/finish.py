from review import *
from bs4 import BeautifulSoup
import hashlib,difflib,collections
def put(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
repo=Path.home()/'Developer/Tinct';primary15=BeautifulSoup(Path('source/gutenberg-15.html').read_bytes(),'html.parser');primary27=BeautifulSoup(Path('source/gutenberg-2701.html').read_bytes(),'html.parser')
srcs={'gutenberg-15.html':('https://www.gutenberg.org/cache/epub/15/pg15-images.html','US-edition-shaped control; preliminary matter, poetry, chapter headings, dedication and epilogue. Credited to Eugene F. Irey; text updated 2026-06-10.'),'gutenberg-2701.html':('https://www.gutenberg.org/cache/epub/2701/pg2701-images.html','Independent control for every body section and epilogue. Daniel Lazarus, Jonesey, David Widger; text updated 2026-10-11.')}
for f in Path('source').glob('moby*.json'):
 path=repo/(('books/wip/moby-dick/editions/' if f.name.endswith('modern-da.json') else 'app/public/data/editions/') if 'modern-' in f.name or 'original-' in f.name else 'app/public/data/onboarding/')/f.name
 assert sha(path)==sha(f);srcs[f.name]=(str(path),'Retained input, copied read-only.')
pub=repo/'app/public/data/editions/moby-dick-modern-da.json'
put('source-details.json',{'book':'Moby-Dick; or, The Whale','author':'Herman Melville','edition':'1851 American version, Harper & Brothers, New York. Danish translations newly prepared here for the missing preliminary matter. No later Danish translator used.','accessed':'2026-11-05','retained_public_da_copy_matches_wip_bytes':sha(pub)==sha('source/moby-dick-modern-da.json'),'sources':[{ 'file':'source/'+k,'url_or_local_origin':v[0],'role':v[1],'sha256':sha(Path('source')/k)} for k,v in srcs.items()],'edition_history':'https://melville.electroniclibrary.org/moby-dick-side-by-side','guide_quote_source':'https://www.gutenberg.org/ebooks/60547','terminology_checks':['https://lex.dk/rethvaler','https://www.ordnet.dk/ods/ordbog/Harpuner'],'scope':'First-edition title page, publisher address, copyright entry, duplicate half title, printer information, contents table and Gutenberg wrapper are bibliographic or navigation matter; those are retained in the source witness and excluded from the reading sequence.'})
ed={l:load('moby-dick-modern-'+l+'.json')['chapters'] for l in ('da','en')}
for x in ed.values():
 assert len(x)==139 and [c['number'] for c in x]==list(range(1,140))
 assert all(isinstance(p,str) and p.strip() for c in x for p in c['paragraphs'])
 assert len(x[2]['paragraphs'])==84
assert [len(c['paragraphs']) for c in ed['en']]==[len(c['paragraphs']) for c in ed['da']]
for l in ed:
 name='moby-dick'+('.da' if l=='da' else '')+'.json';g=load(name);assert ed[l][3]['paragraphs'][0].startswith(g['openingText'])
 assert g.keys()==load('source/'+name).keys()
changes=load('changes.json'); anchors=load('bookmark-map.json')
assert len(anchors)==4864
for a in anchors:
 n=a['old_chapter'];j=a['old_slot']
 if a['new_slot'] is None:assert j==1 and n in (56,57,73)
 else:assert a['new_slot']==j-int(n in (56,57,73))
# Word-alignment report keeps every token variant, including single words that screens might overlook.
def toks(t):return re.findall(r'[^\W_]+',t.lower())
reports=[]
for i,h in enumerate(primary15.select('div.chapter'),1):
 q=load(f'chapters/{i:03}.json');ref=toks(' '.join(q['original_en']['paragraphs']));candidate=toks(' '.join(q['source']));diff=[]
 for op,x,y,z,v in difflib.SequenceMatcher(None,candidate,ref,autojunk=False).get_opcodes():
  if op!='equal':diff.append(dict(kind=op,primary_token_index=x,primary=' '.join(candidate[x:y]),retained=' '.join(ref[z:v])))
 row=dict(chapter=i,retained_title=q['original_en']['title'],output_unit=i+3,retained_slots=len(q['modern_da']['paragraphs']),draft_slots=len(ed['da'][i+2]['paragraphs']),independent_source_words=len(candidate),retained_source_words=len(ref),numeric_source_differences_2701=diff,danish_changed_slots=[c['slot'] for c in changes if c['chapter']==i and c['language']=='da' and c['field']=='paragraph'],english_changed_slots=[c['slot'] for c in changes if c['chapter']==i and c['language']=='en' and c['field']=='paragraph'])
 flags=Path(f'chapters/semantic-{i:03}.json')
 row['retained_semantic_screen']='complete' if flags.exists() else 'pending'
 if flags.exists():row['flagged_source_sentences']=dict(collections.Counter(x['language'] for x in load(flags)))
 reports.append(row)
put('chapter-review.json',reports)
put('guide-changes.json',[dict(language=l,field=k,before=load('source/'+name)[k],after=load(name)[k]) for l,name in [('en','moby-dick.json'),('da','moby-dick.da.json')] for k in load(name) if load(name)[k]!=load('source/'+name)[k]])
manifest={'book':'moby-dick','draft':'complete local content candidate','native_danish_signoff':'pending — assigned to user’s reviewer','coverage':{'numbered_chapters':135,'epilogue':1,'preliminary_units':3,'anthology_extracts':80,'retained_slots_per_edition':2432,'new_preliminary_slots':103,'title_continuations_moved_from_body':3,'candidate_slots_per_edition':2532,'numbered_body_sections_collated_including_epilogue':len(reports),'semantic_screened_sections':sum(r['retained_semantic_screen']=='complete' for r in reports)},'changes':{l:dict(changed_body_paragraphs=sum(c['field']=='paragraph' and c.get('after') is not None for c in changes if c['language']==l),reunited_heading_slots=3,chapter_title_changes=sum(c['field']=='title' for c in changes if c['language']==l)) for l in ed},'files':{f:sha(f) for f in ['moby-dick-modern-da.json','moby-dick-modern-en.json','moby-dick.da.json','moby-dick.json','changes.json','bookmark-map.json','guide-changes.json','source-details.json','chapter-review.json']}}
put('manifest.json',manifest)
print(manifest['coverage'],manifest['changes'])
