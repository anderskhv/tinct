"""Freeze an explicit repair queue without substitutions or production writes."""
import argparse,concurrent.futures,importlib.util,json,subprocess
from pathlib import Path
from prepare import ROOT,OUT,REC,sha,save

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--key',action='append',required=True);ap.add_argument('--name',required=True);a=ap.parse_args();assert len(set(a.key))==len(a.key)
 spec=importlib.util.spec_from_file_location('recovery',REC/'recover.py');rec=importlib.util.module_from_spec(spec);spec.loader.exec_module(rec);client=rec.client();result=[]
 for key in a.key:
  book,edition,ch=key.split('/');number=int(ch[2:]);source=OUT/'editions'/f'{book}-{edition}.json';source.parent.mkdir(parents=True,exist_ok=True)
  subprocess.run(['curl','--fail','--silent','--show-error','--location',f'https://tinct.app/data/editions/{book}-{edition}.json','-o',str(source)],check=True)
  raw=source.read_bytes();chapter=next(c for c in json.loads(raw)['chapters'] if c['number']==number);mr=client.get_object(Bucket='tinct-audio',Key=key+'/manifest.json')['Body'].read();manifest=json.loads(mr);(OUT/'manifests'/(key.replace('/','__')+'.json')).write_bytes(mr)
  entries=[p for p in manifest['paragraphs'] if p['paragraph']>=0];assert sorted(p['paragraph'] for p in entries)==list(range(len(chapter['paragraphs']))),key+' paragraph-map mismatch'
  def fetch(p):
   audio=OUT/'audio'/key/p['file'];audio.parent.mkdir(parents=True,exist_ok=True);data=client.get_object(Bucket='tinct-audio',Key=key+'/'+p['file'])['Body'].read();audio.write_bytes(data);assert data
   probe=subprocess.run(['ffprobe','-v','error','-show_format','-of','json',str(audio)],capture_output=True,text=True,check=True);subprocess.run(['ffmpeg','-v','error','-i',str(audio),'-f','null','-'],capture_output=True,check=True)
   return dict(index=p['paragraph'],file=p['file'],path=str(audio.relative_to(OUT)),sha256=sha(data),duration=float(json.loads(probe.stdout)['format']['duration']),manifest_duration=p['duration'],text=chapter['paragraphs'][p['paragraph']])
  with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:paragraphs=list(pool.map(fetch,entries))
  result.append(dict(key=key,group='complete-edition-repair',title=chapter['title'],text_sha256=sha(raw),manifest_sha256=sha(mr),text_paragraph_count=len(chapter['paragraphs']),paragraphs=sorted(paragraphs,key=lambda p:p['index'])))
 save(OUT/(a.name+'.json'),result);print(len(result),'targets',sum(len(e['paragraphs']) for e in result),'paragraphs')
if __name__=='__main__':main()
