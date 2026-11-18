from prep import *
import sys
c=int(sys.argv[1]);lo=int(sys.argv[2]) if len(sys.argv)>2 else 1;hi=int(sys.argv[3]) if len(sys.argv)>3 else 200
for i,(x,y) in enumerate(zip(en[c-1]['paragraphs'],rd('modern-da.json')['chapters'][c-1]['paragraphs']),1):
 if lo<=i<=hi:print(i,x,'\n',y)
