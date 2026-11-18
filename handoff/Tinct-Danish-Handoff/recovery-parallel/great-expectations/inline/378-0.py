from more import *
run('accents.tsv')
d=get(p/'modern-da.json')['chapters'];e=get(p/'modern-en.json')['chapters']
for n,i,x,y in [(1,35,'gamle Battery','gamle kanonbatteri'),(1,36,'ved Battery','ved batteriet'),(3,2,'Battery','batteriet'),(3,6,'Battery','batteriet'),(21,0,'efter hans laserne på hans skjorte at dømme','efter hans flossede skjorte at dømme')]:
 a=d[n-1]['paragraphs'][i];assert x in a;setedit(n,i,'da',a.replace(x,y))
for n,i,x,y in [(24,50,'a woman under examination','a woman under examination or cross-examination, I couldn’t tell which'),(39,65,'as ever I got rich','as ever I speculated and got rich'),(39,77,'whenever it was I went for','whatever it was I went for'),(39,99,'never, never, never undo','never, never undo')]:
 a=e[n-1]['paragraphs'][i];assert x in a;setedit(n,i,'en',a.replace(x,y).replace('hunted, mangled dog','hunted dunghill dog'))
