from prepare import *
for l in (p/'register.tsv').read_text().splitlines():
 n,i,t=l.split('\t',2)
 with (p/'changes'/f'{n}-da.tsv').open('a') as f:f.write(i+'\t'+t+'\n')
