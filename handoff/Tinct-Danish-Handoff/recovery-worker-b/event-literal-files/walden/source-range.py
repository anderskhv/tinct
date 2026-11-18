import json,sys
a,b=map(int,sys.argv[1:]);p=json.load(open('source-walden-original-en.json'))['chapters'][0]['paragraphs'];r=json.load(open('state.json'))['remainingForCloseDanishRead']
for i,t in enumerate(p,1):
 if a<=i<=b and f'1:{i}' in r:print(i,t)
