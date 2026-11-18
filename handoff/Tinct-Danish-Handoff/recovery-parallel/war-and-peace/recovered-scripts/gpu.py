import json,re,sys,time
from pathlib import Path
import numpy as np,mlx.core as mx
from tokenizers import Tokenizer
weights=mx.load('multilingual.safetensors')
w={k:v.astype(mx.float16) for k,v in weights.items()}; del weights
tk=Tokenizer.from_file('tokenizer.json');tk.enable_truncation(150)
def lin(x,name):return x@w[name+'.weight'].T+w[name+'.bias']
def ln(x,name):return mx.fast.layer_norm(x,w[name+'.weight'],w[name+'.bias'],1e-5)
def forward(ids,mask):
 n=ids.shape[1];x=ln(w['embeddings.word_embeddings.weight'][ids]+w['embeddings.position_embeddings.weight'][mx.arange(n)]+w['embeddings.token_type_embeddings.weight'][0],'embeddings.LayerNorm')
 attmask=mx.where(mask[:,None,None,:],mx.array(0.,mx.float16),mx.array(-1e4,mx.float16))
 for i in range(12):
  name=f'encoder.layer.{i}.'
  q,k,v=[lin(x,name+'attention.self.'+part).reshape(x.shape[0],n,12,32).transpose(0,2,1,3) for part in ('query','key','value')]
  h=mx.fast.scaled_dot_product_attention(q,k,v,scale=32**-.5,mask=attmask).transpose(0,2,1,3).reshape(x.shape)
  x=ln(x+lin(h,name+'attention.output.dense'),name+'attention.output.LayerNorm')
  h=lin(x,name+'intermediate.dense');h=.5*h*(1+mx.erf(h*2**-.5))
  x=ln(x+lin(h,name+'output.dense'),name+'output.LayerNorm')
 x=(x*mask[:,:,None]).astype(mx.float32).sum(1)
 return x/mx.maximum(1e-10,mx.linalg.norm(x,axis=1,keepdims=True))
def encode(lines):
 ts=tk.encode_batch(lines); order=sorted(range(len(ts)),key=lambda i:len(ts[i].ids));res=np.empty((len(ts),384),np.float32)
 for k in range(0,len(order),32):
  ids=order[k:k+32];n=max(len(ts[i].ids) for i in ids);arr=np.ones((len(ids),n),np.int32);mask=np.zeros_like(arr)
  for j,i in enumerate(ids):
   tok=ts[i].ids;arr[j,:len(tok)]=tok;mask[j,:len(tok)]=1
  res[ids]=np.array(forward(mx.array(arr),mx.array(mask)))
 return res
if __name__=='__main__':
 print(encode(['I am reading a book.','Jeg læser en bog.','A fine person.'])@encode(['Jeg læser en bog.']).T,flush=True)
 D=Path('/tmp/tinct-da-prep-20261104/war-and-peace')
 ed=[json.loads(f.read_text())['chapters'] for f in (D/'upstream/original-en.json',D/'modern-da.json',D/'modern-en.json')]
 for ix in list(range(201,365))+list(range(201)):
  dest=D/'qa'/f'parallel-{ix+1:03}.json'
  if dest.exists():continue
  ranges=[];lines=[]
  for p in zip(*(edition[ix]['paragraphs'] for edition in ed)):
   ixes=[]
   for v in p:
    parts=re.split(r'(?<=[.!?])\s+(?=[«»“”"A-ZÆØÅ])',v)
    ixes.append(list(range(len(lines),len(lines)+len(parts))));lines.extend(parts)
   ranges.append(ixes)
  vec=encode(lines);results=[]
  for j,(o,d,e) in enumerate(ranges):
   for lang,tr in [('da',d),('en',e)]:
    cos=vec[o]@vec[tr].T
    for backwards,mat in enumerate((cos,cos.T)):
     for z,score in enumerate(mat.max(1)):
      if score>=.57:continue
      ref=(tr if backwards else o)[z];best=(o if backwards else tr)[mat[z].argmax()];results.append([j+1,lang,backwards,round(float(score),3),lines[ref],lines[best]])
  dest.write_text(json.dumps(results,ensure_ascii=False))
  if ix%25==0:print(ix+1,flush=True)
