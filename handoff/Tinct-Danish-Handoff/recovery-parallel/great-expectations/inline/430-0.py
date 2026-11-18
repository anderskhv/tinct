from more import *
run('fidelity.tsv')
d=get(p/'modern-da.json')['chapters'];e=get(p/'modern-en.json')['chapters']
setedit(15,2,'da',d[14]['paragraphs'][2].replace('Tu rul','tralulaj'))
