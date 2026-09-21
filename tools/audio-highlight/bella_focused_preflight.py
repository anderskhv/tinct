"""Focused retention preflight; production is read-only."""
import sys,json,hashlib,urllib.request,concurrent.futures
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi,verify_timings
OUT=Path("artifacts/bella-focused-retention-2026-09-21");OUT.mkdir(parents=True,exist_ok=True)
BOOKS={"jekyll-and-hyde":[9],"don-quixote":[52],"pride-and-prejudice":[2],"the-awakening":[12],"candide":[26],"federalist-papers":[48,84],"beyond-good-and-evil":[5],"nicomachean-ethics":[7],"communist-manifesto":[4]}
def raw(ref,path):
 return urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/"+ref+"/"+path,timeout=90).read()
def sha(b):return hashlib.sha256(b).hexdigest()
def dump(name,j):(OUT/name).write_text(json.dumps(j,indent=1))
def main():
 pending=json.loads(raw("codex/bella-completion-ledger-20260921","artifacts/bella-completion-ledger-2026-09-21/pending.json"))
 rows=[r for r in pending if r["bookId"] in BOOKS and r["edition"]=="original-en" and r["chapter"] in BOOKS[r["bookId"]]]
 dump("prior-targets.json",rows)
 dump("histories-hold.json",[r for r in pending if r["bookId"]=="histories" and r["edition"]=="original-en" and r["chapter"]==1390])
 reports=[]
 for book in BOOKS:
  status,edition=prodapi.edition_text(book,"original-en");assert status==200
  targets=[c["number"] for c in edition["chapters"]]
  with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
   rr=list(pool.map(lambda n:verify_timings.check_chapter(book,"original-en",n,edition),targets))
  reports.extend(rr);dump("edition-checks.json",reports)
 ref="878354336cb8f2cbcfae431a4093ffe4ff5fcad6";folder="artifacts/bella-jekyll-heading-2026-09-21/"
 candidate=raw(ref,folder+"words.candidate.json");old=raw(ref,folder+"previous-words.json")
 assert sha(candidate)=="3e46f266b0c46a6f7f34930a13acf3d808992b02a0c249208da1329cb05551f2"
 assert sha(old)=="a6a1875e8dc9fce2fba937cc54b2c2dc258a99a3f771331bcc9cf6a84d94ba11"
 c=json.loads(candidate);o=json.loads(old)
 diffs=[p["paragraph"] for p in c["paragraphs"] if p!=next(x for x in o["paragraphs"] if x["paragraph"]==p["paragraph"])]
 assert diffs==[33],diffs
 assert {k:v for k,v in c.items() if k!="paragraphs"}=={k:v for k,v in o.items() if k!="paragraphs"}
 co=json.loads(raw(ref,folder+"cohort.json"))[0]
 status,edition=prodapi.edition_text("jekyll-and-hyde","original-en");texts=verify_timings.paragraph_texts(edition,9)
 checked=[]
 for p in co["paragraphs"]:
  assert p["text"]==texts[p["index"]]
  status,body=prodapi.audio_object(co["key"]+"/"+p["file"]);assert status==200 and sha(body)==p["sha256"],p["index"]
  checked.append({"paragraph":p["index"],"file":p["file"],"sha256":sha(body)})
 status,served,current=prodapi.chapter_words("jekyll-and-hyde","original-en",9)
 assert status==200 and sha(current)==sha(old)
 original=prodapi.chapter_words;prodapi.chapter_words=lambda *a:(200,c,candidate)
 check=verify_timings.check_chapter("jekyll-and-hyde","original-en",9,edition);prodapi.chapter_words=original
 assert check["ok"],check
 for p in c["paragraphs"]:
  assert verify_timings.tokenize(texts[p["paragraph"]])==verify_timings.tokenize(" ".join(w["text"] for w in p["words"]))
  assert any(w["end"]>w["start"] for w in p["words"])
 probe=json.loads(raw(ref,folder+"probe.json"));assert probe["criterion_met"] and probe["candidate_sha256"]==sha(candidate)
 dump("jekyll-preflight.json",dict(candidateSha256=sha(candidate),previousSha256=sha(old),changedParagraphs=diffs,audioIdentity=checked,validation=check,probeSummary={k:probe[k] for k in ["criterion_met","within_300ms","selected_count","max_delta"]}))
 (OUT/"jekyll-words.candidate.json").write_bytes(candidate)
 print("Jekyll provenance and edition checks passed",flush=True)
if __name__=="__main__":main()
