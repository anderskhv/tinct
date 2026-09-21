"""Read-only edition inventory from current registry and published text/audio."""
import sys,json,hashlib,datetime,urllib.request,collections,concurrent.futures as cf,threading
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi,audit_production,verify_timings
root=Path("artifacts/bella-edition-inventory-2026-09-21");root.mkdir(parents=True,exist_ok=True)
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
prior=json.load(urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-sync-repair-20260921/artifacts/bella-sync-2026-09-21/chapters.json"))
old={(r["bookId"],r["edition"],r["chapter"]):r for r in prior}
books=audit_production.read_registry();jobs=[];editions=[];errors=[]
def edition(b,e):
 status,data=prodapi.edition_text(b["bookId"],e["key"])
 assert status==200,(b["bookId"],e["key"],status)
 return b,e,data,digest(data)
with cf.ThreadPoolExecutor(max_workers=12) as pool:
 futures=[pool.submit(edition,b,e) for b in books for e in b["editions"] if e["language"]=="en"]
 for f in cf.as_completed(futures):
  try:
   b,e,data,hash_=f.result()
   editions.append(dict(bookId=b["bookId"],title=b["title"],edition=e["key"],hasAudioFlag=e["hasAudio"],textHash=hash_,chapters=len(data["chapters"])))
   jobs.extend((b["bookId"],e["key"],c,data,hash_) for c in data["chapters"])
  except Exception as ex:errors.append(str(ex))
def one(t):
 b,e,c,data,hash_=t;ch=c["number"];key=(b,e,ch)
 r=dict(bookId=b,edition=e,chapter=ch,paragraphs=len(c["paragraphs"]))
 try:
  status,m=prodapi.chapter_manifest(b,e,ch);r["manifestStatus"]=status
  if status!=200 or not m:r["audio"]="absent" if status==404 else "unavailable";r["timing"]="no-audio";return r
  ps=[p for p in m.get("paragraphs",[]) if isinstance(p.get("paragraph"),int) and p["paragraph"]>=0]
  r["audio"]="manifest-present";r["voice"]=m.get("voice") or m.get("voiceId") or m.get("voice_id") or "unattributed"
  r["bodyEntries"]=len(ps);r["hours"]=sum(p.get("duration",0) or 0 for p in ps)/3600
  r["mappingMatches"]=sorted(p["paragraph"] for p in ps)==list(range(len(c["paragraphs"])))
  prev=old.get(key,{})
  unchanged=prev.get("editionContentHash")==hash_ and prev.get("manifestContentHash")==digest(m)
  if unchanged and prev.get("state")=="timings-pass-structural":
   r["timing"]="previous-structural-pass";r["timingCheckedAt"]=prev.get("checkedAt")
  elif e!="modern-en":
   status,words,raw=prodapi.chapter_words(b,e,ch)
   if status==200:
    v=verify_timings.check_chapter(b,e,ch,data);r["timing"]="structural-pass" if v["ok"] else "invalid";r["failures"]=v.get("failures")
   else:r["timing"]="missing" if status==404 else "unavailable"
  else:
   status,_=prodapi.audio_object_size(f"{b}/{e}/ch{ch}/words.json")
   r["timing"]="present-not-revalidated" if status in (200,206) else ("missing" if status==404 else "unavailable")
  if b=="jekyll-and-hyde" and e=="original-en" and ch==9:r["knownIssue"]="Spoken heading has all-zero timings; candidate repaired but not published."
  return r
 except Exception as ex:r["audio"]="error";r["error"]=str(ex);return r
rows=[]
with cf.ThreadPoolExecutor(max_workers=20) as pool:
 for i,r in enumerate(pool.map(one,jobs),1):
  rows.append(r)
  if i%500==0:print(i,len(jobs),flush=True)
(root/"chapters.json").write_text(json.dumps(rows,indent=1))
for e in editions:
 rr=[r for r in rows if r["bookId"]==e["bookId"] and r["edition"]==e["edition"]]
 e["audioCounts"]=dict(collections.Counter(r.get("audio") for r in rr));e["timingCounts"]=dict(collections.Counter(r.get("timing") for r in rr))
 e["audioChapters"]=sum(r.get("audio")=="manifest-present" for r in rr)
 e["mappingMismatchChapters"]=[r["chapter"] for r in rr if r.get("mappingMatches")==False]
 e["hours"]=round(sum(r.get("hours",0) for r in rr),2)
 e["timingGapChapters"]=[r["chapter"] for r in rr if r.get("timing") not in ("previous-structural-pass","structural-pass")]
 e["notes"]=[]
 if e["bookId"] in ("meditations","faust-part-1") and e["edition"]=="original-en":e["notes"].append("Sampled speech matches an older translation, not current text.")
 if e["bookId"]=="bible":e["notes"].append("Known missing MP3 body chunks despite manifests; full object coverage not certified.")
 if e["bookId"]=="jekyll-and-hyde" and e["edition"]=="original-en":e["notes"].append("Chapter 9 spoken-name timing repair is staged, not published.")
 if e["bookId"]=="the-histories" and e["edition"]=="original-en":e["notes"].append("Chapter 1390 content hold.")
 if e["edition"]=="web-en":e["notes"].append("Chapter 417 content hold.")
 if e["edition"]=="modern-en":e["notes"].append("Modern text will change; recording retention is undecided.")
 if not e["hasAudioFlag"]:e["notes"].append("No catalogue hasAudio flag; stored assets do not establish selectable playback.")
editions.sort(key=lambda e:(e["title"].lower(),e["edition"]))
summary=dict(asOf=datetime.datetime.now(datetime.timezone.utc).isoformat(),books=len(books),editions=len(editions),chapters=len(rows),errors=errors,manifestVoiceCounts=dict(collections.Counter(r.get("voice") for r in rows)),limits=["All current chapter manifests checked; body MP3 existence is not exhaustively checked.","Prior structural timing passes reused only when both published text and manifest hashes match.","Structural checks do not certify acoustic timing or narrator identity.","Legacy generator af_bella is supporting provenance, not per-file voice identification."])
(root/"editions.json").write_text(json.dumps(editions,indent=1));(root/"summary.json").write_text(json.dumps(summary,indent=1))
lines=["# Existing English audio by book and edition","",f"As of {summary['asOf']}. Read-only inventory of {len(books)} registered public books.","","Legacy audio is provisionally associated with Bella through generator history; manifests do not prove voice identity. Manifest coverage is not exhaustive MP3 or listening verification. Modern-English recordings may be superseded when translations change.","","| Book | Edition | Chapters with audio manifests | Timing status | Mapping gaps | Notes |","|---|---|---:|---|---:|---|"]
for e in editions:
 counts=", ".join(f"{v} {k}" for k,v in e["timingCounts"].items())
 lines.append(f"| {e['title']} | {e['edition']} | {e['audioChapters']}/{e['chapters']} | {counts} | {len(e['mappingMismatchChapters'])} | {' '.join(e['notes'])} |")
(root/"INVENTORY.md").write_text("\n".join(lines)+"\n")
print(json.dumps(summary),flush=True)
