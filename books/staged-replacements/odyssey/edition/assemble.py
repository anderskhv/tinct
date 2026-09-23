# assemble.py <out.json> : builds the Odyssey modern-en edition from the accepted per-Book files
import json,sys,hashlib
P='/home/user/tinct-ody/books/staged-replacements/odyssey/'
FILES={1:'book01/candidate-v4.json',2:'book02/candidate-v8.json',3:'book03/candidate-v3.json',4:'book04/candidate-v6.json',
 5:'book05/candidate-v4.json',6:'book06/candidate-v4.json',7:'book07/candidate-v3.json',8:'book08/candidate-v3.json',9:'book09/candidate-v4.json'}
for n in range(10,25): FILES[n]='book%02d/candidate-accepted.json'%n
chs=[]
for n in range(1,25):
    raw=open(P+FILES[n],'rb').read(); c=json.loads(raw)
    assert c['number']==n and list(c.keys())==['number','title','paragraphs'],n
    chs.append(c); print(n,FILES[n],hashlib.sha256(raw).hexdigest(),len(c['paragraphs']))
out=json.dumps({'chapters':chs},ensure_ascii=False,indent=2)
open(sys.argv[1],'w',encoding='utf-8').write(out)
print('edition',hashlib.sha256(out.encode()).hexdigest())
