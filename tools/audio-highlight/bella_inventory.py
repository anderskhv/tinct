"""Read-only Bella timing census. No production writer or synthesizer."""
import concurrent.futures as cf
import collections, datetime, hashlib, json, os, sys, threading
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi, audit_production, audio_readiness, verify_timings
OUT=Path("artifacts/bella-sync-2026-09-21")
OUT.mkdir(parents=True,exist_ok=True)
def save(name,value): (OUT/name).write_text(json.dumps(value,indent=1))
def digest(value): return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
_thread=threading.local()
_original_manifest=prodapi.chapter_manifest
_original_words=prodapi.chapter_words
def cached_manifest(*key):
    if getattr(_thread,"manifest_key",None)!=key:
        _thread.manifest_key=key;_thread.manifest_value=_original_manifest(*key)
    return _thread.manifest_value
def cached_words(*key):
    if getattr(_thread,"words_key",None)!=key:
        _thread.words_key=key;_thread.words_value=_original_words(*key)
    return _thread.words_value
prodapi.chapter_manifest=cached_manifest
prodapi.chapter_words=cached_words
def one(target):
    book,key,ch,edition,source_hash=target
    row={"bookId":book,"edition":key,"chapter":ch,"editionContentHash":source_hash,"voice":"unknown","checkedAt":datetime.datetime.now(datetime.timezone.utc).isoformat()}
    if key=="modern-en":
        row["state"]="deferred-modern-text-retention"
        return row
    try:
        status,m=prodapi.chapter_manifest(book,key,ch)
        row["manifestStatus"]=status
        if status!=200 or not m:
            row["state"]="missing-audio" if status==404 else "unavailable"
            return row
        row["manifestContentHash"]=digest(m)
        row["manifestMetadata"]={k:v for k,v in m.items() if k!="paragraphs"}
        row["durationSeconds"]=sum(p.get("duration",0) or 0 for p in m.get("paragraphs",[]))
        voice=m.get("voice") or m.get("voiceId") or m.get("voice_id")
        if voice: row["voice"]=str(voice)
        words_status,parsed_words,words_raw=prodapi.chapter_words(book,key,ch)
        size=len(words_raw)
        row["wordsStatus"]=words_status
        row["wordsBytes"]=size
        if words_status in (200,206):
            report=verify_timings.check_chapter(book,key,ch,edition)
            row["verification"]=report
            row["state"]="timings-pass-structural" if report["ok"] else "timings-invalid"
        elif words_status==404:
            row["readiness"]=audio_readiness.assess(book,key,ch,edition,3)
            row["state"]="timings-missing"
        else: row["state"]="unavailable"
        return row
    except Exception as e:
        row["state"]="error"
        row["error"]=type(e).__name__+": "+str(e)[:250]
        return row
def main():
    books=audit_production.read_registry()
    jobs=[]; editions=[]; errors=[]
    for book in books:
        for e in book["editions"]:
            if e["language"]!="en": continue
            b,k=book["bookId"],e["key"]
            try:
                status,data=prodapi.edition_text(b,k)
                if status!=200 or not data: errors.append({"bookId":b,"edition":k,"status":status});continue
                chapters=data.get("chapters",[])
                source_hash=digest(data)
                editions.append({"bookId":b,"edition":k,"chapters":len(chapters),"textContentHash":source_hash})
                for ch in chapters:
                    if isinstance(ch.get("number"),int):jobs.append((b,k,ch["number"],data,source_hash))
            except Exception as exc:errors.append({"bookId":b,"edition":k,"error":type(exc).__name__})
    save("edition-inputs.json",editions);save("edition-errors.json",errors)
    previous=json.loads((OUT/"chapters.json").read_text()) if (OUT/"chapters.json").exists() else []
    previous={(r["bookId"],r["edition"],r["chapter"]):r for r in previous}
    rows=[];pending=[]
    for target in jobs:
        old=previous.get(target[:3])
        if old and old.get("editionContentHash")==target[4]:
            old.setdefault("verificationRun",35587234933)
            rows.append(old)
        else:pending.append(target)
    print(f"Reusing {len(rows)} checked chapters; {len(pending)} remaining",flush=True)
    def checkpoint():
        save("chapters.json",rows)
        save("progress.json",{"checked":len(rows),"total":len(jobs),"states":dict(collections.Counter(r["state"] for r in rows))})
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        futures=[pool.submit(one,t) for t in pending]
        for i,future in enumerate(cf.as_completed(futures),1):
            rows.append(future.result())
            if i%100==0:
                print(f"{len(rows)}/{len(jobs)} recorded",flush=True)
                checkpoint()
    rows.sort(key=lambda r:(r["bookId"],r["edition"],r["chapter"]))
    checkpoint()

    counts=collections.Counter(r["state"] for r in rows)
    voices=collections.Counter(r["voice"] for r in rows)
    readiness=collections.Counter(r.get("readiness",{}).get("outcome") for r in rows if r.get("readiness"))
    summary={"asOf":datetime.datetime.now(datetime.timezone.utc).isoformat(),"commit":os.environ.get("GITHUB_SHA"),
      "chapters":len(rows),"editions":len(editions),"states":dict(counts),"manifestVoices":dict(voices),
      "missingTimingReadiness":dict(readiness),"editionFetchErrors":errors,
      "limits":["Survey spans the initial and resumed runs; 7600 prior checks were reused only for identical edition hashes.",
      "Unaudited modern-en chapters are explicitly deferred pending text retention; not counted as missing or verified.",
      "Inventory covers actual published text chapter numbers; no 1200-chapter ceiling.",
      "Structural/text validation is not acoustic verification.",
      "Readiness samples three audio objects; it does not prove spoken text matches.",
      "Unknown voice is not claimed as Bella. Historical generator default is corroboration only.",
      "Modern-English retention and content holds must be reconciled before repair.",
      "Content hashes here are canonical JSON, not raw-object byte hashes."]}
    save("summary.json",summary)
    save("missing-targets.json",[{k:r[k] for k in ("bookId","edition","chapter")} for r in rows if r["state"]=="timings-missing"])
    (OUT/"SUMMARY.md").write_text("# Bella word-sync inventory — 2026-09-21\n\nRead-only cloud audit. No reader or audio changes.\n\n```json\n"+json.dumps(summary,indent=2)+"\n```\n")
    print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__": main()
