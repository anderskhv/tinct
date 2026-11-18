import pathlib,json,re,unicodedata
p=pathlib.Path(__file__).parent
norm=lambda s:' '.join(re.findall(r"[a-z0-9]+",unicodedata.normalize('NFKD',s).lower()))
sources={n:norm((p/f'primary-pg{n}.txt').read_text()) for n in [815,816]}
d=json.loads((p/'source-democracy-in-america-original-en.json').read_text());out=[]
for c in d['chapters']:
 n=815 if c['number']<=20 else 816
 rows=[]
 for j,s in enumerate(c['paragraphs'],1):
  q=norm(s);pos=sources[n].find(q);rows.append(dict(slot=j,normalized_exact_found=pos>=0,source_character=pos,words=len(s.split())))
 out.append(dict(chapter=c['number'],title=c['title'],source=n,slots=rows))
(p/'SOURCE-SLOT-AUDIT.json').write_text(json.dumps(out,indent=2)+'\n')
print('Exact found',sum(r['normalized_exact_found'] for c in out for r in c['slots']),'of2258')
print('Not exact',[(c['chapter'],r['slot']) for c in out for r in c['slots'] if not r['normalized_exact_found']][:50])
for n in [815,816]:
 s=(p/f'primary-pg{n}.txt').read_text(); print(n,'end main',s.find('General Survey Of The Subject'),'appendix',[(m.start(),s[m.start():m.start()+65].replace('\n',' ')) for m in re.finditer('Appendix|Appendices|Constitution Of|Constitution of|Notes And',s)][-12:])
