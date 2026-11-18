import json,sys
a,b=[json.load(open(f))['chapters'] for f in ('source-original-en.json','modern-da.json')]
c=int(sys.argv[1]); l=int(sys.argv[2]) if len(sys.argv)>2 else 1; end=int(sys.argv[3]) if len(sys.argv)>3 else 100
for i,(en,da) in enumerate(zip(a[c-1]['paragraphs'],b[c-1]['paragraphs']),1):
 if l<=i<=end:print(i,en,da,sep='\n')
