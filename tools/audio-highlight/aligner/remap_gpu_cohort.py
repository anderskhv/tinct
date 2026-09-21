"""Stage remapped identical recordings; no source text or production mutation."""
import json,sys,urllib.request,hashlib
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
sys.path.insert(0,"tools/audio-highlight/aligner")
import prodapi,cloud_cohort
import argparse
parser=argparse.ArgumentParser();parser.add_argument("--targets",required=True);parser.add_argument("--out",required=True);parser.add_argument("--workers")
args=parser.parse_args()
work=Path(args.out);work.mkdir(parents=True,exist_ok=True)
root=work
targets=json.loads(Path(args.targets).read_text())
cohort=[];plans=[]
for target in targets:
 book,ch=target["bookId"],target["chapter"]
 key=f"{book}/original-en/ch{ch}"
 if prodapi.audio_object_size(key+"/words.json")[0]!=404:
  print("skip existing timing",key,flush=True);continue
 data=json.load(urllib.request.urlopen(f"https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-source-map-20260921/artifacts/bella-source-map-2026-09-21/{book}.json"))
 rows=[p for p in data["paragraphs"] if p["chapter"]==ch]
 assert rows and all(p["source"] and p["source"]["structuralSourceMatch"] for p in rows)
 status,ed=prodapi.edition_text(book,"original-en");assert status==200
 current=next(c for c in ed["chapters"] if c["number"]==ch)
 assert current["paragraphs"]==[p["text"] for p in rows]
 status,old=prodapi.audio_object(key+"/manifest.json");assert status==200
 entry=dict(key=key,group="source-remap",title=current["title"],text_paragraph_count=len(rows),paragraphs=[])
 plan=dict(key=key,oldManifestSha256=hashlib.sha256(old).hexdigest(),oldManifest=json.loads(old),sourceCommit=data["summary"]["oldCommit"],sourceText=current,recordings=[])
 for p in rows:
  src=p["source"];srcpath=f"{book}/original-en/ch{src['chapter']}/{src['file']}"
  code,body=prodapi.audio_object(srcpath);assert code==200 and len(body)>1000
  sha=hashlib.sha256(body).hexdigest();name=f"bella-sync-{sha[:16]}-p{p['paragraph']}.mp3"
  dest=work/"audio"/key/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(body)
  dur=cloud_cohort.decoded_duration(dest)
  entry["paragraphs"].append(dict(index=p["paragraph"],text=p["text"],file=name,path=str(dest.relative_to(work)),sha256=sha,bytes=len(body),duration=dur,manifest_duration=dur))
  plan["recordings"].append(dict(paragraph=p["paragraph"],source=srcpath,destination=key+"/"+name,sha256=sha,bytes=len(body),duration=dur))
 cohort.append(entry);plans.append(plan)
(work/"cohort.json").write_text(json.dumps(cohort,indent=1))
(root/"cohort.json").write_text(json.dumps(cohort,indent=1))
(root/"remap-plans.json").write_text(json.dumps(plans,indent=1))
print("staged remap chapters",len(cohort),flush=True)
if not cohort:raise SystemExit("No eligible remap chapters")
