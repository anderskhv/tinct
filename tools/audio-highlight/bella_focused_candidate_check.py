import json,sys,urllib.request,hashlib
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi,verify_timings,publish_timings
OUT=Path("artifacts/bella-focused-candidate-check-2026-09-21");OUT.mkdir(parents=True,exist_ok=True)
def get(path):return urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-focused-collected-20260921/artifacts/bella-focused-acoustic-2026-09-21/"+path,timeout=90).read()
def dump(n,x):(OUT/n).write_text(json.dumps(x,indent=1))
summary=json.loads(get("live-summary.json"))
accepted=[r for r in summary if r["status"]=="acoustic-pass"]
assert accepted,"No acoustically accepted candidates yet"
fixtures=[];checks=[];receipts=[]
for row in accepted:
 book,ed,chap=row["key"].split("/");number=int(chap[2:]);prefix=f"{book}/{number}/"
 body=get(prefix+"words.candidate.json");assert hashlib.sha256(body).hexdigest()==row["candidateSha256"]
 candidate=json.loads(body);co=json.loads(get(prefix+"cohort.json"))[0]
 code,edition=prodapi.edition_text(book,ed);assert code==200
 texts=verify_timings.paragraph_texts(edition,number)
 for p in co["paragraphs"]:
  assert p["text"]==texts[p["index"]]
  status,raw=prodapi.audio_object(row["key"]+"/"+p["file"]);assert status==200 and hashlib.sha256(raw).hexdigest()==p["sha256"]
 assert not publish_timings.validate_candidate(candidate,book,ed,number)
 original=prodapi.chapter_words
 publishedStatus,_,served=original(book,ed,number)
 if publishedStatus==200:assert hashlib.sha256(served).hexdigest()==row["candidateSha256"]
 for ch in edition["chapters"]:
  n=ch["number"]
  if n==number:prodapi.chapter_words=lambda *a:(200,candidate,body)
  else:prodapi.chapter_words=original
  check=verify_timings.check_chapter(book,ed,n,edition);checks.append(check)
  # Federalist has two targets; one passing chapter must not imply edition completeness.
  if not check["ok"]:continue
  _,manifest=prodapi.chapter_manifest(book,ed,n);_,words,_=prodapi.chapter_words(book,ed,n)
  ts=verify_timings.paragraph_texts(edition,n)
  for p in words["paragraphs"]:
   assert verify_timings.tokenize(ts[p["paragraph"]])==verify_timings.tokenize(" ".join(w["text"] for w in p["words"]))
   assert any(w["end"]>w["start"] for w in p["words"])
  fixtures.append(dict(key=f"{book}/{ed}/ch{n}",manifest=manifest,sidecar=words,paragraphs=ts))
 prodapi.chapter_words=original
 receipts.append(dict(row,source="codex/bella-focused-collected-20260921",audioHashesRechecked=True,publishedBytesVerified=(publishedStatus==200),completeEditionStructural=all(x["ok"] for x in checks if x["bookId"]==book)))
dump("checks.json",checks);dump("accepted.json",receipts)
target=Path("artifacts/bella-reader-data-check-2026-09-21");target.mkdir(parents=True,exist_ok=True)
(target/"fixtures.json").write_text(json.dumps(fixtures))
print(json.dumps(receipts),flush=True)
