from prep import *
D=rd('aligned-da.json');E=rd('source-modern-en.json')
for f in ('restored.txt','edits.txt'):
 if not (p/f).exists():continue
 for l in (p/f).read_text().splitlines():
  if not l:continue
  j,i,s=l.split(' ',2);j=int(j);i=int(i);b=D['chapters'][j-1]['paragraphs']
  if f=='edits.txt' and not s.startswith('!'):s=b[i-1].split('. ',1)[0]+'. '+s
  b[i-1]=s.removeprefix('!').replace(' | ','\n')
wr('modern-da.json',D);wr('modern-en.json',E)
