"""Read-only sample diagnosis. Uses existing recovery credentials; never uploads."""
import concurrent.futures,hashlib,importlib.util,json,re,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'output/word-timing-diagnostic-pilot-2026-09-10'
REC=ROOT/'output/audio-recovery-publication-2026-09-09'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def save(path,data):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(data,indent=2,ensure_ascii=False))
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 spec=importlib.util.spec_from_file_location('recovery',REC/'recover.py');rec=importlib.util.module_from_spec(spec);spec.loader.exec_module(rec);client=rec.client()
 sample=json.loads((REC/'diagnostic-pilot-sample.json').read_text())
 def fetch(key):
  attempts=[]
  for attempt in range(1,4):
   start=time.monotonic()
   try:
    r=client.get_object(Bucket='tinct-audio',Key=key);raw=r['Body'].read();attempts.append(dict(attempt=attempt,http=200,seconds=time.monotonic()-start));return raw,attempts
   except Exception as e:
    status=e.response['ResponseMetadata']['HTTPStatusCode'] if hasattr(e,'response') else None
    attempts.append(dict(attempt=attempt,http=status,error=type(e).__name__,seconds=time.monotonic()-start))
    if status==404:break
  return None,attempts
 # Live edition bytes, once per edition; keep immutable evidence.
 for edition in sorted({'/'.join(e['key'].split('/')[:2]) for e in sample}):
  name=edition.replace('/','-')+'.json';dest=OUT/'editions'/name;dest.parent.mkdir(exist_ok=True)
  subprocess.run(['curl','--fail','--silent','--show-error','--location','--max-time','120','https://tinct.app/data/editions/'+name,'-o',str(dest)],check=True)
 def inspect(e):
  key=e['key'];book,edition,chn=key.split('/');ch=int(chn[2:]);raw=(OUT/'editions'/f'{book}-{edition}.json').read_bytes();source=json.loads(raw);paragraphs=next(c['paragraphs'] for c in source['chapters'] if c['number']==ch)
  mr,attempts=fetch(key+'/manifest.json');result=dict(key=key,group=e['group'],text_sha256=sha(raw),historical_records=e['historical_records'],manifest_attempts=attempts,acoustic_identity='unresolved — decode is not speech verification')
  if mr is None:result['blocker']='manifest_unavailable';return result
  manifest=json.loads(mr);save(OUT/'manifests'/(key.replace('/','__')+'.json'),manifest);result['manifest_sha256']=sha(mr)
  entries={p['paragraph']:p for p in manifest['paragraphs'] if p.get('paragraph',-1)>=0};missing=sorted(set(range(len(paragraphs)))-set(entries));extra=sorted(set(entries)-set(range(len(paragraphs))))
  result['paragraph_map']=dict(text_count=len(paragraphs),manifest_count=len(entries),missing=[dict(index=i,text=paragraphs[i],empty=not paragraphs[i].strip()) for i in missing],extra=extra)
  selected={0,len(paragraphs)//2,len(paragraphs)-1}
  for hist in e['historical_records']:
   ids=re.findall(r'\bp(\d+)\b',hist.get('historical_message',''));selected.update(int(i) for i in ids[:2])
  selected.update(int(a['file'][1:-4]) for a in e['audio_checks'] if re.fullmatch(r'p\d+\.mp3',a['file']) and (a.get('http')!=200 or a.get('bytes')==0))
  records=[]
  for i in sorted(selected):
   if i not in entries:continue
   item=entries[i];data,tries=fetch(key+'/'+item['file']);r=dict(paragraph=i,text=paragraphs[i] if i<len(paragraphs) else None,file=item['file'],manifest_duration=item.get('duration'),attempts=tries)
   if data is not None:
    dest=OUT/'audio'/key/item['file'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);r.update(bytes=len(data),sha256=sha(data),local_path=str(dest))
    probe=subprocess.run(['ffprobe','-v','error','-show_format','-of','json',str(dest)],capture_output=True,text=True);decode=subprocess.run(['ffmpeg','-v','error','-i',str(dest),'-f','null','-'],capture_output=True,text=True)
    r.update(probe_exit=probe.returncode,decode_exit=decode.returncode,decode_error=decode.stderr,probe_error=probe.stderr)
    if probe.returncode==0:
     duration=float(json.loads(probe.stdout)['format']['duration']);r.update(decoded_duration=duration,duration_delta=duration-(item.get('duration') or 0))
   records.append(r)
  result['audio_samples']=records
  result['findings']=[]
  if missing:result['findings'].append('manifest_omits_source_paragraphs')
  if extra:result['findings'].append('manifest_has_extra_paragraphs')
  if any(r.get('bytes')==0 or r.get('decode_exit',0)!=0 for r in records):result['findings'].append('invalid_audio_confirmed')
  if any(r['attempts'][-1].get('http')==404 for r in records):result['findings'].append('missing_audio_confirmed')
  if not result['findings']:result['findings'].append('sampled_transport_and_decode_pass; alignment_identity_unresolved')
  save(OUT/'chapters'/(key.replace('/','__')+'.json'),result);return result
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(inspect,sample))
 save(OUT/'diagnosis-ledger.json',results);print('Completed',len(results),'chapters;',sum(len(e.get('audio_samples',[])) for e in results),'decoded/transport samples')
if __name__=='__main__':main()
