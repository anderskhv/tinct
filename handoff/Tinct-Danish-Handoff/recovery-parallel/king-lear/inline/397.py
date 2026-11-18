from pathlib import Path
p=Path('qa.py');s=p.read_text().replace("wr('modern-da.json',D);", """for c in D['chapters']:
 for i,v in enumerate(c['paragraphs']):
  def stage(m):
   s=m[0]
   for name in ['LEAR','KENT','EDMUND','EDGAR','CORDELIA','GLOUCESTER','CORNWALL','ALBANY','GONERIL','REGAN','OSWALD']:s=re.sub(r'\\b'+name+r'\\b',name.title(),s)
   return s.replace('FOOL','narren').replace('Til Narren','Til narren').replace('[narren','[Narren')
  c['paragraphs'][i]=re.sub(r'\\[[^\\]]+\\]',stage,v)
wr('modern-da.json',D);""");p.write_text(s)
