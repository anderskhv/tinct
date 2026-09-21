"""Read-only Bella timing census. No production writer or synthesizer."""
import concurrent.futures as cf
import collections, datetime, hashlib, json, os, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi, audit_production, audio_readiness, verify_timings
OUT=Path("artifacts/bella-sync-2026-09-21")
OUT.mkdir(parents=True,exist_ok=True)
def save(name,value): (OUT/name).write_text(json.dumps(value,indent=1))
def digest(value): return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
def one(target):
    book,key,ch,edition=target
    row={"bookId":book,"edition":key,"chapter":ch,"editionContentHash":digest(edition),"voice":"unknown"}
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
        words_status,size=prodapi.audio_object_size(f"{book}/{key}/ch{ch}/words.json")
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
                editions.append({"bookId":b,"edition":k,"chapters":len(chapters),"textContentHash":digest(data)})
                for ch in chapters:
                    if isinstance(ch.get("number"),int):jobs.append((b,k,ch["number"],data))
            except Exception as exc:errors.append({"bookId":b,"edition":k,"error":type(exc).__name__})
    save("edition-inputs.json",editions);save("edition-errors.json",errors)
    rows=[]
    with cf.ThreadPoolExecutor(max_workers=6) as pool:
        for i,row in enumerate(pool.map(one,jobs),1):
            rows.append(row)
            if i%200==0:
                print(f"{i}/{len(jobs)} chapters checked",flush=True)
                save("chapters.json",rows)
    save("chapters.json",rows)
    counts=collections.Counter(r["state"] for r in rows)
    voices=collections.Counter(r["voice"] for r in rows)
    readiness=collections.Counter(r.get("readiness",{}).get("outcome") for r in rows if r.get("readiness"))
    summary={"asOf":datetime.datetime.now(datetime.timezone.utc).isoformat(),"commit":os.environ.get("GITHUB_SHA"),
      "chapters":len(rows),"editions":len(editions),"states":dict(counts),"manifestVoices":dict(voices),
      "missingTimingReadiness":dict(readiness),"editionFetchErrors":errors,
      "limits":["Inventory covers actual published text chapter numbers; no 1200-chapter ceiling.",
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
