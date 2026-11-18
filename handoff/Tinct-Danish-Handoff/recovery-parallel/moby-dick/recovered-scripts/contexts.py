import re,json,sys
cs=json.load(open('source/moby-dick-modern-da.json'))['chapters'];os=json.load(open('source/moby-dick-original-en.json'))['chapters']
for c,o in zip(cs,os):
 for j,(p,a) in enumerate(zip(c['paragraphs'],o['paragraphs'])):
  m=re.search(r'\b(?:'+sys.argv[1]+r')\b',p,re.I)
  if m:print(f"{c['number']}.{j+1}",p[max(0,m.start()-58):m.end()+70],'<',a[max(0,int(m.start()/len(p)*len(a))-55):int(m.start()/len(p)*len(a))+85])
