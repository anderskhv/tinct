from inspect_pairs import *
import sys
z=get(p/'review'/'lexical-ranking.json')
for n in range(int(sys.argv[1]),int(sys.argv[2])+1):
 picks=[v for v in z if v[1]==n and 10<len(books[0][n-1]['paragraphs'][v[2]].split())<75]
 _,_,i,*_=picks[0]
 print(n,i,*(b[n-1]['paragraphs'][i] for b in [books[0],books[2],books[3]]),sep='|')
