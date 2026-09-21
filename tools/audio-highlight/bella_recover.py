"""Recover prior passing original-English candidates without new ASR or writes to production."""
import io, json, os, sys, hashlib, urllib.request, urllib.parse, zipfile, collections
class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        new=super().redirect_request(req,fp,code,msg,headers,newurl)
        if new is not None and urllib.parse.urlparse(newurl).netloc != urllib.parse.urlparse(req.full_url).netloc:
            new.remove_header("Authorization")
        return new
opener=urllib.request.build_opener(SafeRedirect())
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import prodapi, publish_timings, audio_readiness
OUT=Path("artifacts/bella-sync-recovery-2026-09-21");OUT.mkdir(parents=True,exist_ok=True)
def gh(path):
    url="https://api.github.com/repos/anderskhv/tinct/"+path
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+os.environ["GH_TOKEN"],"Accept":"application/vnd.github+json"})
    with opener.open(req,timeout=90) as r:return r.read()
def main():
    runs=json.loads(gh("actions/runs?branch=codex%2Faudio-canary-run-20260916&per_page=100"))["workflow_runs"]
    runs=[r for r in runs if r["name"]=="audio-align-canary" and r["conclusion"]=="success"][:20]
    reports=[]; staged=[];seen=set()
    for run in runs:
        artifacts=json.loads(gh(f"actions/runs/{run['id']}/artifacts"))["artifacts"]
        for a in artifacts:
            if a["expired"] or a["size_in_bytes"]>50_000_000: continue
            z=zipfile.ZipFile(io.BytesIO(gh(f"actions/artifacts/{a['id']}/zip")))
            names=set(z.namelist()); cohorts={}
            for n in names:
                if n.endswith("/cohort.json"):
                    value=json.loads(z.read(n))
                    if isinstance(value,list):
                        for e in value:
                            if isinstance(e,dict) and e.get("key"):cohorts[e["key"]]=e
            for n in sorted(names):
                if not n.endswith("/words.candidate.json"):continue
                c=json.loads(z.read(n));book=c.get("bookId");edition=c.get("editionKey");ch=c.get("chapter")
                key=f"{book}/{edition}/ch{ch}"
                if edition!="original-en":continue
                raw=z.read(n);h=hashlib.sha256(raw).hexdigest()
                if h in seen:continue
                seen.add(h)
                row={"key":key,"run":run["id"],"artifact":a["id"],"candidateSha256":h,"arm":n.split("/")[-2]}
                record_name=n.rsplit("/",1)[0]+"/chapter.json"
                record=json.loads(z.read(record_name)) if record_name in names else {}
                if record.get("status")!="candidate_requires_acoustic_review":
                    row["state"]="rejected-by-original-gate";reports.append(row);continue
                status=prodapi.audio_object_size(key+"/words.json")[0]
                row["publishedStatus"]=status
                if status in (200,206):
                    row["state"]="already-present";reports.append(row);continue
                if status!=404:
                    row["state"]="unavailable";reports.append(row);continue
                failures=publish_timings.validate_candidate(c,book,edition,ch);row["validationFailures"]=failures
                if failures:row["state"]="fails-current-text-validation";reports.append(row);continue
                co=cohorts.get(key)
                if not co:row["state"]="missing-cohort-provenance";reports.append(row);continue
                code,text=prodapi.edition_text(book,edition);texts=audio_readiness.paragraph_texts(text or {},ch)
                if not texts or any(p["index"]>=len(texts) or p["text"]!=texts[p["index"]] for p in co["paragraphs"]):
                    row["state"]="source-changed";reports.append(row);continue
                checked=[];same=True
                for p in co["paragraphs"]:
                    code,body=prodapi.audio_object(key+"/"+p["file"])
                    good=code==200 and hashlib.sha256(body).hexdigest()==p["sha256"]
                    checked.append({"file":p["file"],"sha256":p["sha256"],"match":good})
                    if not good:same=False;break
                row["audioIdentity"]=checked
                if not same:row["state"]="audio-changed";reports.append(row);continue
                destination=OUT/"candidates"/key/row["arm"];destination.mkdir(parents=True,exist_ok=True)
                (destination/"words.json").write_bytes(raw)
                (destination/"cohort.json").write_text(json.dumps(co,indent=1))
                row["state"]="recovered-needs-acoustic-review"
                staged.append({"bookId":book,"edition":edition,"chapter":ch,"path":str(destination/"words.json")})
                reports.append(row)
            print("recovered run",run["id"],"reports",len(reports),flush=True)
    (OUT/"report.json").write_text(json.dumps(reports,indent=1))
    (OUT/"candidates.json").write_text(json.dumps(staged,indent=1))
    summary={"runsInspected":len(runs),"states":dict(collections.Counter(r["state"] for r in reports)),"staged":len(staged),"published":0,"newAlignmentJobs":0}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2))
    print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
