from prep import *
import difflib,collections
w=(p/'witness.txt').read_text().split('*** END OF')[0];arr=re.split(r'^\[ \d+ \]\s*$',w,flags=re.M)[1:];assert len(arr)==18
norm=lambda s:re.findall(r'[^\W_]+',s.casefold())
res=[]
for j,(c,ws) in enumerate(zip(en,arr),1):
 a=norm(' '.join(c['paragraphs']));b=norm(ws);ops=[];m=difflib.SequenceMatcher(None,a,b,autojunk=True)
 for k,l,h,ll,hh in m.get_opcodes():
  if k!='equal':ops.append({'kind':k,'repo':a[l:h],'witness':b[ll:hh],'repoIndex':l,'witnessIndex':ll})
 res.append({'ep':j,'repoTokens':len(a),'witnessTokens':len(b),'differences':ops});print(j,len(a),len(b),len(ops),[(x['repo'][:4],x['witness'][:4]) for x in ops[:5]])
wr('source-witness-collation.json',res)
