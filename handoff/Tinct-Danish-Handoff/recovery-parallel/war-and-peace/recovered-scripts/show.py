from collate import *
import sys
for pos in sys.argv[1:]:
 c,p=map(int,pos.split('.')); print('\n',pos)
 for s in ('original-en','modern-da','modern-en'):
  print(s,read('upstream/'+s+'.json')['chapters'][c-1]['paragraphs'][p-1])
