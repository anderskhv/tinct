from collate import *
import sys
for flag in read('english-inspection.json')[:int(sys.argv[1])]:
 import difflib,unicodedata
 a=read('modern-en.json')['chapters'][flag['chapter']-1]['paragraphs'][flag['paragraph']-1].split();b=read('upstream/original-en.json')['chapters'][flag['chapter']-1]['paragraphs'][flag['paragraph']-1].split()
 def norm(s):return re.sub(r'[^a-z0-9]','',''.join(x for x in unicodedata.normalize('NFKD',s.lower()) if not unicodedata.combining(x)))
 changes=difflib.SequenceMatcher(None,list(map(norm,b)),list(map(norm,a)),autojunk=False).get_opcodes()
 tag,i,j,k,l=max(changes,key=lambda z:z[2]-z[1]-(z[4]-z[3]))
 print(f"{flag['chapter']}.{flag['paragraph']}",' '.join(b[i:min(i+9,j)]),'…',' '.join(b[max(i,j-9):j]),' | ',' '.join(a[k:min(l,k+8)]),'…',' '.join(a[max(k,l-8):l]))
