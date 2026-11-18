from prep import *
def setslot(lang,c,i,s):
 key=f'{c} {i} ';found=False
 for f in sorted(p.glob(f'patch-{lang}-*.txt')):
  lines=f.read_text().splitlines()
  for n,line in enumerate(lines):
   if line.startswith(key):lines[n]=key+s.replace('\n',' | ');found=True;f.write_text('\n'.join(lines)+'\n');break
  if found:break
 if not found:
  f=p/f'patch-{lang}-audit.txt'
  with f.open('a') as h:h.write(key+s.replace('\n',' | ')+'\n')
def fix(lang,c,i,reps):
 doc=rd('modern-'+lang+'.json');s=doc['chapters'][c-1]['paragraphs'][i-1]
 for a,b in reps:
  assert a in s,(lang,c,i,a)
  s=s.replace(a,b)
 setslot(lang,c,i,s)
