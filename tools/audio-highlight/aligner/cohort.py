"""Prepare complete local inputs for eligible paired chapters; read-only R2."""
import concurrent.futures,importlib.util,json,hashlib,subprocess
from pathlib import Path
from prepare import ROOT,OUT,REC,save,sha

def main():
 spec=importlib.util.spec_from_file_location('recovery',REC/'recover.py');rec=importlib.util.module_from_spec(spec);spec.loader.exec_module(rec);client=rec.client()
 ledger=json.loads((OUT/'diagnosis-ledger.json').read_text());cohort=[];jobs=[];excluded=[]
 for e in ledger:
  if e['group'] not in ['alignment','control']:continue
  if e['paragraph_map']['missing'] or e['paragraph_map']['extra']:
   excluded.append(dict(key=e['key'],reason='source_manifest_paragraph_map_mismatch'));continue
  book,edition,ch=e['key'].split('/');source=json.loads((OUT/'editions'/f'{book}-{edition}.json').read_text());chapter=next(c for c in source['chapters'] if c['number']==int(ch[2:]));manifest=json.loads((OUT/'manifests'/(e['key'].replace('/','__')+'.json')).read_text())
  row=dict(key=e['key'],group=e['group'],title=chapter['title'],text_sha256=e['text_sha256'],manifest_sha256=e['manifest_sha256'],text_paragraph_count=len(chapter['paragraphs']),paragraphs=[]);cohort.append(row)
  for p in manifest['paragraphs']:
   if p['paragraph']<0:continue
   jobs.append((row,p,chapter['paragraphs'][p['paragraph']]))
 def get(job):
  row,p,text=job;key=row['key']+'/'+p['file'];dest=OUT/'audio'/key;dest.parent.mkdir(parents=True,exist_ok=True)
  if not dest.exists():dest.write_bytes(client.get_object(Bucket='tinct-audio',Key=key)['Body'].read())
  raw=dest.read_bytes();probe=subprocess.run(['ffprobe','-v','error','-show_format','-of','json',str(dest)],capture_output=True,text=True);decode=subprocess.run(['ffmpeg','-v','error','-i',str(dest),'-f','null','-'],capture_output=True,text=True)
  if not raw or probe.returncode or decode.returncode:raise ValueError('Invalid input '+key)
  duration=float(json.loads(probe.stdout)['format']['duration'])
  return row,dict(index=p['paragraph'],file=p['file'],path=str(dest.relative_to(OUT)),sha256=sha(raw),duration=duration,manifest_duration=p['duration'],text=text)
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
  for row,result in pool.map(get,jobs):row['paragraphs'].append(result)
 for row in cohort:row['paragraphs'].sort(key=lambda p:p['index'])
 save(OUT/'cohort.json',cohort);save(OUT/'cohort-exclusions.json',excluded)
 print(len(cohort),'chapters',len(jobs),'audio files',sum(p['duration'] for e in cohort for p in e['paragraphs'])/3600,'hours')
if __name__=='__main__':main()
