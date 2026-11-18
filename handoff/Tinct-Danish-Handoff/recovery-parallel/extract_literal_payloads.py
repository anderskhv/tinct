import pathlib,json,re,hashlib
root=pathlib.Path(__file__).parent
records=[]
def unescape(s):
 out=[];i=0
 while i<len(s):
  if s[i]=='\\' and i+1<len(s):
   c=s[i+1];out.append({'n':'\n','r':'\r','t':'\t','b':'\b','f':'\f','v':'\v','\n':''}.get(c,c));i+=2
  else:out.append(s[i]);i+=1
 return ''.join(out)
for p in sorted(root.glob('*.calls.json')):
 for r in json.loads(p.read_text()):
  m=re.search(r'cmd\s*:\s*`((?:\\.|[^`])*)`',r['input'],re.S)
  if not m:continue
  cmd=unescape(m.group(1))
  for h in re.finditer(r'cat\s*(>>?)\s*([^\n]*?)\s*<<\s*[\'\"]?(\w+)[\'\"]?\s*\n(.*?)\n\3(?:\n|$)',cmd,re.S):
   entry={'sourceLog':p.name.removesuffix('.calls.json'),'ordinal':r['ordinal'],'timestamp':r['timestamp'],'operation':'append' if h[1]=='>>' else 'write','targetExpression':h[2],'content':h[4]+'\n','commandContext':cmd[:h.start()]}
   records.append(entry)
records.sort(key=lambda e:(e['timestamp'],e['ordinal']))
(root/'literal-file-writes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Literal writes',len(records),'bytes',sum(len(e['content'].encode()) for e in records))
for e in records:print(e['operation'],e['targetExpression'],len(e['content']))
