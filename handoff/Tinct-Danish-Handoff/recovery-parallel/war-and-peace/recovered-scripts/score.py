from pathlib import Path
import json,re,numpy as np,onnxruntime as ort,sys,time
from tokenizers import Tokenizer
D=Path(sys.argv[1])
ed=[json.loads((D/'input'/('war-and-peace-'+s+'.json')).read_text())['chapters'] for s in ('original-en','modern-da','modern-en')]
tk=Tokenizer.from_file('tokenizer.json'); tk.enable_truncation(150)
opts=ort.SessionOptions(); opts.intra_op_num_threads=3;opts.inter_op_num_threads=1
s=ort.InferenceSession('model.onnx',opts,providers=['CPUExecutionProvider'])
def encode(lines):
 ts=tk.encode_batch(lines); order=sorted(range(len(ts)),key=lambda i:len(ts[i].ids));vecs=np.empty((len(ts),384),np.float32)
 for k in range(0,len(order),24):
  ids=order[k:k+24];n=max(len(ts[i].ids) for i in ids);arr=np.ones((len(ids),n),np.int64);mask=np.zeros_like(arr)
  for j,i in enumerate(ids):
   tok=ts[i].ids;arr[j,:len(tok)]=tok;mask[j,:len(tok)]=1
  out=s.run(None,{'input_ids':arr,'attention_mask':mask,'token_type_ids':np.zeros_like(arr)})[0]
  v=(out*mask[:,:,None]).sum(axis=1);vecs[ids]=v/np.maximum(1e-10,np.linalg.norm(v,axis=1,keepdims=True))
 return vecs
for ix in range(365):
 dest=D/'chapters'/f'semantic-{ix+1:03}.json'
 if dest.exists():continue
 ps=[];lines=[]
 for p in zip(*(edition[ix]['paragraphs'] for edition in ed)):
  ixes=[]
  for v in p:
   parts=re.split(r'(?<=[.!?])\s+(?=[«»“”"A-ZÆØÅ])',v)
   ixes.append(list(range(len(lines),len(lines)+len(parts))));lines.extend(parts)
  ps.append(ixes)
 vec=encode(lines);results=[]
 for j,(o,d,e) in enumerate(ps):
  da=vec[o]@vec[d].T;en=vec[o]@vec[e].T
  for label,mat in [('da',da),('en',en)]:
   for t,score in enumerate(mat.max(axis=1)):
    if score<.65:results.append(dict(paragraph=j+1,language=label,score=round(float(score),3),source=lines[o[t]]))
 dest.write_text(json.dumps(results,ensure_ascii=False))
 if ix%20==0:print(ix+1,flush=True)
