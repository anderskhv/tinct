"""Isolated no-upload paired diagnostic runner. Does not modify production files."""
from __future__ import annotations
import importlib.util
import argparse,dataclasses,difflib,hashlib,importlib.metadata,json,os,platform,signal,subprocess,sys,time
from pathlib import Path
import pinned_words_sidecar_lib as lib
from spoken_policy import validate_map
GATE=.85

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,obj):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);tmp=p.with_suffix(p.suffix+'.tmp');tmp.write_text(json.dumps(obj,indent=2,ensure_ascii=False));tmp.replace(p)
def tree_hash(path):return hashlib.sha256(json.dumps([(str(p.relative_to(path)),sha(p)) for p in sorted(Path(path).rglob('*')) if p.is_file() and '.cache' not in p.parts],separators=(',',':')).encode()).hexdigest()
def attempt(model,audio,text,mode):
 expected=lib.chapter_words_from_text(lib.clean_text(text.replace('\n',' ')))
 tokenizer=getattr(getattr(model,'hf_tokenizer',None),'encode',None)
 counter=(lambda text:len(tokenizer(' '+text,add_special_tokens=False).ids)) if tokenizer else None
 bias=lib.build_bias_request(expected,mode,count_tokens=counter)
 kwargs=dict(language='en',word_timestamps=True,vad_filter=True)
 if bias.initial_prompt:kwargs['initial_prompt']=bias.initial_prompt
 if bias.hotwords:kwargs['hotwords']=bias.hotwords
 started=time.monotonic();raw=[];heard=[]
 segments,info=model.transcribe(str(audio),**kwargs)
 for segment in segments:
  words=[]
  for w in segment.words or []:
   words.append(dict(text=w.word,start=w.start,end=w.end,probability=getattr(w,'probability',None)))
   if w.start is not None and w.end is not None and (w.word or '').strip():heard.append(lib.HeardWord((w.word or '').strip(),float(w.start),float(w.end)))
  raw.append(dict(text=segment.text,start=segment.start,end=segment.end,words=words))
 asr_seconds=time.monotonic()-started
 alignment_start=time.monotonic()
 aligned,stats=lib.align_tokens_with_stats(expected,heard)
 opcodes=list(difflib.SequenceMatcher(None,[lib.canonical_alignment_token(t) for t in expected],[lib.canonical_alignment_token(w.raw) for w in heard],autojunk=False).get_opcodes())
 observed={i:j1+i-i1 for tag,i1,i2,j1,j2 in opcodes if tag=='equal' for i in range(i1,i2)}
 provenance=[dict(index=i,source='observed' if i in observed else 'interpolated',heard_index=observed.get(i)) for i in range(len(expected))]
 assert len(observed)==stats.matched_words
 reasons=[]
 if stats.match_ratio<GATE:reasons.append('observed_alignment_below_85_percent')
 if not aligned and expected:reasons.append('no_timed_words')
 return dict(asr_seconds=asr_seconds,alignment_seconds=time.monotonic()-alignment_start,request=kwargs,mode=mode,raw_segments=raw,heard_words=[dataclasses.asdict(w) for w in heard],expected_tokens=expected,opcodes=opcodes,provenance=provenance,unresolved_gaps=[o for o in opcodes if o[0]!='equal'],candidate_words=aligned,stats=dataclasses.asdict(stats),match_ratio=stats.match_ratio,rejection_reasons=reasons,seconds=time.monotonic()-started)

def paragraph(model,audio,text,mode,out,configuration=None):
 signature=hashlib.sha256(json.dumps(dict(audio=sha(audio),text=text,mode=mode,configuration=configuration,helper=sha(lib.__file__),runner=sha(__file__)),sort_keys=True).encode()).hexdigest()
 if Path(out).exists():
  cached=json.loads(Path(out).read_text())
  if cached.get('complete') and cached.get('signature')==signature:
   return next(a for a in cached['attempts'] if a['mode']==cached['selected_mode'])
 attempts=[];best=None
 for request_mode in (*lib.bias_cascade(mode),'off'):
  try:record=attempt(model,audio,text,request_mode)
  except Exception as e:
   write(out,dict(attempts=attempts,error=dict(type=type(e).__name__,message=str(e)),audio_sha256=sha(audio)));raise
  attempts.append(record);stats=lib.AlignmentStats(**record['stats'])
  if best is None or stats.matched_words>best['stats']['matched_words']:best=record
  write(out,dict(attempts=attempts,selected_mode=best['mode'],audio_sha256=sha(audio),selected_reasons=best['rejection_reasons']))
  if request_mode!='off' and not lib.should_retry_without_bias(stats):break
 write(out,dict(complete=True,signature=signature,attempts=attempts,selected_mode=best['mode'],audio_sha256=sha(audio),selected_reasons=best['rejection_reasons']))
 return best

def worker(args):
 from faster_whisper import WhisperModel
 model_start=time.monotonic()
 model=WhisperModel(str(args.model_path),device=getattr(args,'device','cuda'),compute_type=getattr(args,'compute_type','float16'),local_files_only=True)
 write(args.output/'model-load.json',dict(seconds=time.monotonic()-model_start))
 cohort=json.loads(args.input.read_text())
 for e in cohort:
  result=dict(key=e['key'],group=e['group'],status='pending',reasons=[],paragraphs=[])
  for mode in getattr(args,'arms',['off','auto']):
   directory=args.output/e['key']/mode;passed=[];expected=[[] for _ in range(e['text_paragraph_count'])];result=dict(key=e['key'],group=e['group'],mode=mode,status='running',reasons=[],paragraphs=[])
   write(directory/'chapter.json',result)
   for r in e['paragraphs']:
    audio=args.input.parent/r['path']
    if sha(audio)!=r['sha256']:raise ValueError('audio changed: '+str(audio))
    selected=paragraph(model,audio,r['text'],mode,directory/f"p{r['index']}.diagnostic.json",configuration=dict(model=getattr(args,'model_sha256',None),device=getattr(args,'device','cuda'),compute=getattr(args,'compute_type','float16')))
    words=selected['candidate_words'];stats=selected['stats'];expected[r['index']]=selected['expected_tokens'];passed.append((r['index'],r['file'],words))
    reasons=list(selected['rejection_reasons'])
    if any(w['end']>r['duration']+.1 for w in words):reasons.append('timing_exceeds_decoded_audio')
    result['paragraphs'].append(dict(index=r['index'],ratio=selected['match_ratio'],reasons=reasons))
    if reasons:result['reasons'].append(dict(paragraph=r['index'],reasons=reasons))
    write(directory/'chapter.json',result)
   book,edition,ch=e['key'].split('/')
   candidate=lib.build_sidecar(book,edition,int(ch[2:]),e['title'],passed)
   totals=dict(expectedWords=0,heardWords=0,matchedWords=0)
   for entry in candidate['paragraphs']:
    entry['file']=next(r['file'] for r in e['paragraphs'] if r['index']==entry['paragraph'])
    diagnostic=json.loads((directory/f"p{entry['paragraph']}.diagnostic.json").read_text())
    selected=next(a for a in diagnostic['attempts'] if a['mode']==diagnostic['selected_mode']);stats=selected['stats']
    entry['alignment']=dict(expectedWords=stats['expected_words'],heardWords=stats['heard_words'],matchedWords=stats['matched_words'],matchRatio=selected['match_ratio'],bias=selected['mode'])
    for field in totals:totals[field]+=entry['alignment'][field]
   candidate.update(model='small.en',language='en',alignment=dict(**totals,matchRatio=totals['matchedWords']/max(1,totals['expectedWords']),minimumParagraphRatio=GATE,bias=mode))
   valid,errors=lib.validate_sidecar(candidate,expected,{r['index']:dict(file=r['file'],duration=r['duration']) for r in e['paragraphs']})
   result['validation_errors']=errors;result['status']='candidate_requires_acoustic_review' if valid and not result['reasons'] else 'rejected'
   write(directory/'words.candidate.json',candidate);write(directory/'chapter.json',result)

def main():
 p=argparse.ArgumentParser();p.add_argument('--input',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--model-path',type=Path,required=True);p.add_argument('--model-sha256',required=True);p.add_argument('--max-seconds',type=int,default=3300);p.add_argument('--arms',nargs='+',choices=['off','auto'],default=['off','auto']);p.add_argument('--device',choices=['cpu','cuda'],default='cuda');p.add_argument('--compute-type',choices=['int8','float16'],default='float16');p.add_argument('--run',action='store_true');p.add_argument('--resume',action='store_true');p.add_argument('--worker',action='store_true',help=argparse.SUPPRESS);a=p.parse_args()
 if not 1<=a.max_seconds<=3300:p.error('process cap must be 1–3300 seconds')
 if not a.model_path.is_dir() or tree_hash(a.model_path)!=a.model_sha256:p.error('Pinned local model missing or hash mismatch')
 if a.output.exists() and any(a.output.iterdir()) and not a.worker and not a.resume:p.error('Use a fresh output directory or explicit --resume')
 entries=json.loads(a.input.read_text())
 for e in entries:
  if not validate_map(e):p.error('Incomplete chapter map: '+e['key'])
  for r in e['paragraphs']:
   if sha(a.input.parent/r['path'])!=r['sha256']:p.error('Audio hash mismatch')
 if a.worker:worker(a);return
 a.output.mkdir(parents=True,exist_ok=True)
 versions={k:importlib.metadata.version(k) if importlib.util.find_spec(k.replace('-','_')) else None for k in ['faster-whisper','ctranslate2']}
 hardware=subprocess.run(['nvidia-smi','--query-gpu=name,memory.total,driver_version','--format=csv,noheader'],capture_output=True,text=True).stdout if __import__('shutil').which('nvidia-smi') else None
 manifest=dict(hardware=hardware,argv=sys.argv,started=time.time(),platform=platform.platform(),python=sys.version,dependencies=versions,installed_packages=sorted((d.metadata['Name'],d.version) for d in importlib.metadata.distributions()),input_sha256=sha(a.input),model_tree_sha256=a.model_sha256,code_sha256=sha(__file__),helper_sha256=sha(lib.__file__),gate=GATE,upload=False,status='validated_only',max_process_seconds=a.max_seconds)
 write(a.output/'run.json',manifest)
 if not a.run:return
 manifest['status']='running';write(a.output/'run.json',manifest)
 command=[sys.executable,__file__,*sys.argv[1:],'--worker']
 with (a.output/'process.log').open('w') as log:
  child=subprocess.Popen(command,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try:code=child.wait(timeout=a.max_seconds);manifest['status']='complete' if code==0 else 'failed';manifest['exit_code']=code
  except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);child.wait();manifest['status']='process_time_cap_reached'
 manifest['finished']=time.time();write(a.output/'run.json',manifest)
 if manifest['status']!='complete':sys.exit(1)
if __name__=='__main__':main()
