import sys,json,hashlib,urllib.request,os,time
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight");sys.path.insert(0,"tools/audio-highlight/aligner")
import prodapi,verify_timings,cloud_cohort
OUT=Path("artifacts/bella-focused-acceptance-2026-09-21");OUT.mkdir(parents=True,exist_ok=True)
def dump(name,obj):(OUT/name).write_text(json.dumps(obj,indent=1))
def main():
 fixtures=[];checks=[];cohorts=[]
 book="jekyll-and-hyde";ed="original-en"
 status,edition=prodapi.edition_text(book,ed);assert status==200
 for ch in edition["chapters"]:
  n=ch["number"];check=verify_timings.check_chapter(book,ed,n,edition);checks.append(check);assert check["ok"],check
  co=cloud_cohort.build(dict(bookId=book,edition=ed,chapter=n),Path("/tmp/jekyll-acceptance"),"whole-edition-acceptance",{(book,ed):edition})
  assert "dropped" not in co,co
  cohorts.append(co);dump("recordings.json",cohorts)
  _,manifest=prodapi.chapter_manifest(book,ed,n);_,words,body=prodapi.chapter_words(book,ed,n)
  texts=verify_timings.paragraph_texts(edition,n)
  for p in words["paragraphs"]:
   assert any(w["end"]>w["start"] for w in p["words"]),p["paragraph"]
   assert verify_timings.tokenize(texts[p["paragraph"]])==verify_timings.tokenize(" ".join(w["text"] for w in p["words"])),(n,p["paragraph"])
  if n==9:assert hashlib.sha256(body).hexdigest()=="3e46f266b0c46a6f7f34930a13acf3d808992b02a0c249208da1329cb05551f2"
  fixtures.append(dict(key=f"{book}/{ed}/ch{n}",manifest=manifest,sidecar=words,paragraphs=texts))
 dump("structural.json",checks)
 target=Path("artifacts/bella-reader-data-check-2026-09-21");target.mkdir(parents=True,exist_ok=True)
 (target/"fixtures.json").write_text(json.dumps(fixtures))
 print("All Jekyll text, recordings, timings and zero-paragraph checks passed")
if __name__=="__main__":main()
