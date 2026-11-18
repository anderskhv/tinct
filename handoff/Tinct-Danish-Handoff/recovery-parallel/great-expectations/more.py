from prepare import *
def setedit(n,i,lang,t):
 q=p/'changes'/f'{n}-{lang}.tsv';ls=dict((int(k),v) for k,v in (l.split('\t',1) for l in q.read_text().splitlines())) if q.exists() else {}
 ls[i]=t;q.write_text(''.join(f'{k}\t{v}\n' for k,v in sorted(ls.items())))
def run(f):
 for l in (p/f).read_text().splitlines():
  n,i,lang,t=l.split('\t',3);setedit(int(n),int(i),lang,t)
