"""Accept staged chapter candidates against whole current editions and existing reader functions."""
import json,sys,urllib.request,urllib.error,hashlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi,verify_timings,publish_timings
OUT=Path("artifacts/bella-focused-candidate-check-2026-09-21");OUT.mkdir(parents=True,exist_ok=True)
def fetch(url):return urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"tinct-focused-check"}),timeout=90).read()
def pin(branch):
 return json.loads(fetch("https://api.github.com/repos/anderskhv/tinct/git/ref/heads/"+branch))["object"]["sha"]
def raw(ref,path):return fetch("https://raw.githubusercontent.com/anderskhv/tinct/"+ref+"/"+path)
def sha(b):return hashlib.sha256(b).hexdigest()
def dump(n,x):
 p=OUT/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,indent=1))
ref=pin("codex/bella-focused-collected-20260921");folder="artifacts/bella-focused-acoustic-2026-09-21"
summary=json.loads(raw(ref,folder+"/live-summary.json"));chosen={}
for row in summary:
 if row["status"]=="acoustic-pass":
  b,ed,ch=row["key"].split("/");chosen[row["key"]]=dict(row,sourceCommit=ref,sourceFolder=f"{folder}/{b}/{int(ch[2:])}")
for branch,folder,keys in [
 ("codex/bella-focused-communist-boundaries-20260921","bella-focused-communist-boundaries-2026-09-21",["communist-manifesto/original-en/ch4"]),
 ("codex/bella-focused-pride-ready-20260921","bella-focused-short-clips-2026-09-21",["pride-and-prejudice/original-en/ch2"]),
 ("codex/bella-focused-nicomachean-resume-20260921","bella-focused-acoustic-2026-09-21",["nicomachean-ethics/original-en/ch7"]),
 ("codex/bella-focused-short-clips-20260921","bella-focused-short-clips-2026-09-21",["pride-and-prejudice/original-en/ch2","communist-manifesto/original-en/ch4"]),
 ("codex/bella-focused-beyond-20260921","bella-focused-beyond-2026-09-21",["beyond-good-and-evil/original-en/ch5"])
]:
 ref=pin(branch)
 for key in keys:
  b,ed,ch=key.split("/");prefix=f"artifacts/{folder}/{b}/{int(ch[2:])}"
  try:row=json.loads(raw(ref,prefix+"/result.json"))
  except urllib.error.HTTPError as e:
   if e.code==404:continue
   raise
  if row["status"]=="acoustic-pass":chosen[key]=dict(row,sourceCommit=ref,sourceFolder=prefix)
assert chosen
staged={};receipts=[];editions={}
for key,row in sorted(chosen.items()):
 book,ed,chap=key.split("/");n=int(chap[2:])
 body=raw(row["sourceCommit"],row["sourceFolder"]+"/words.candidate.json");assert sha(body)==row["candidateSha256"]
 candidate=json.loads(body);co=json.loads(raw(row["sourceCommit"],row["sourceFolder"]+"/cohort.json"))[0]
 if (book,ed) not in editions:
  code,edition=prodapi.edition_text(book,ed);assert code==200;editions[(book,ed)]=edition
 texts=verify_timings.paragraph_texts(editions[(book,ed)],n)
 def check_audio(p):
  assert p["text"]==texts[p["index"]]
  code,audio=prodapi.audio_object(key+"/"+p["file"]);assert code==200 and sha(audio)==p["sha256"]
 with ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(check_audio,co["paragraphs"]))
 assert not publish_timings.validate_candidate(candidate,book,ed,n)
 status,_,served=prodapi.chapter_words(book,ed,n)
 if status==200:assert sha(served)==sha(body),"Existing publication differs"
 staged[(book,ed,n)]=(candidate,body)
 dest=OUT/"candidates"/book/str(n);dest.mkdir(parents=True,exist_ok=True);(dest/"words.candidate.json").write_bytes(body)
 (dest/"cohort.json").write_text(json.dumps([co],indent=1))
 receipts.append(dict(row,audioHashesRechecked=True,publishedBytesVerified=(status==200)))
original=prodapi.chapter_words
def proposed(b,e,n):
 if (b,e,n) in staged:
  c,body=staged[(b,e,n)];return 200,c,body
 return original(b,e,n)
prodapi.chapter_words=proposed
fixtures=[];checks=[]
def check_chapter_task(task):
 book,ed,edition,ch=task;n=ch["number"];check=verify_timings.check_chapter(book,ed,n,edition)
 if not check["ok"]:return check,None
 _,manifest=prodapi.chapter_manifest(book,ed,n);_,words,_=proposed(book,ed,n);texts=verify_timings.paragraph_texts(edition,n)
 for p in words["paragraphs"]:
  assert verify_timings.tokenize(texts[p["paragraph"]])==verify_timings.tokenize(" ".join(w["text"] for w in p["words"]))
  assert any(w["end"]>w["start"] for w in p["words"]),(book,n,p["paragraph"])
 return check,dict(key=f"{book}/{ed}/ch{n}",manifest=manifest,sidecar=words,paragraphs=texts)
tasks=[(book,ed,edition,ch) for (book,ed),edition in editions.items() for ch in edition["chapters"]]
with ThreadPoolExecutor(max_workers=8) as pool:
 for check,fixture in pool.map(check_chapter_task,tasks):
  checks.append(check)
  if fixture is not None:fixtures.append(fixture)
for row in receipts:
 book=row["key"].split("/")[0]
 row["completeEditionStructural"]=all(x["ok"] for x in checks if x["bookId"]==book)
dump("checks.json",checks);dump("accepted.json",receipts)
p=Path("artifacts/bella-reader-data-check-2026-09-21");p.mkdir(parents=True,exist_ok=True);(p/"fixtures.json").write_text(json.dumps(fixtures))
print(json.dumps(receipts),flush=True)
