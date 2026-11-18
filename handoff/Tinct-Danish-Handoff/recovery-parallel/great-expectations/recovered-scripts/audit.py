from inspect_pairs import *
norm=lambda s:' '.join(s.split())
witness=(src/'gutenberg-1400-independent.txt').read_text().split('*** END OF')[0]
bodies=re.split(r'(?m)^Chapter [IVXLCDM]+\.[ \t]*$',witness)[1:]
assert len(bodies)==59
report=[]
for ix,(s,original,da,en,wip) in enumerate(zip(bodies,*books),1):
 raw=norm(s.replace('[Illustration]','')); o=original['paragraphs'];assert raw==norm(' '.join(o)),ix
 assert len(o)==len(da['paragraphs'])==len(en['paragraphs'])==len(wip['paragraphs'])
 doc={'chapter':ix,'source':'Gutenberg #1400, 1867 edition','source_body_matches_tinct_original':True,'illustration_placeholders':s.count('[Illustration]'),'paragraphs':len(o),'empty_slots':sum(not val.strip() for versions in [da,en,wip] for val in versions['paragraphs']),'english_targeted_review':[]}
 for i,(a,b) in enumerate(zip(o,en['paragraphs'])):
  words=lambda x:re.findall(r"[a-z]+",x.lower().replace('’',"'"))
  t=words(a);v=words(b);ops=difflib.SequenceMatcher(None,t,v,autojunk=False).get_opcodes()
  suspicious=[(j,k,l,m) for op,j,k,l,m in ops if k-j>=7 and k-j>=max(4*(m-l),1)]
  if suspicious:
   doc['english_targeted_review'].append({'paragraphIndex':i,'lost_candidate':[' '.join(t[j:k]) for j,k,l,m in suspicious]})
 put(p/'review'/f'ch{ix:04}.json',doc);report.append(doc)
put(p/'coverage.json',report)
print('total rows to check',sum(len(c['english_targeted_review']) for c in report))
