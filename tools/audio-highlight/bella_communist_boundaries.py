import sys,json,hashlib,urllib.request,traceback
from pathlib import Path
from faster_whisper import WhisperModel
from huggingface_hub import snapshot_download
sys.path.insert(0,"tools/audio-highlight");sys.path.insert(0,"tools/audio-highlight/aligner")
import trial,cloud_cohort,publish_timings
book="communist-manifesto";ch=4;key=f"{book}/original-en/ch{ch}"
root=Path("artifacts/bella-focused-communist-boundaries-2026-09-21")/book/str(ch);root.mkdir(parents=True,exist_ok=True)
work=Path("/tmp/communist-boundaries")
def get(n):return urllib.request.urlopen("https://raw.githubusercontent.com/anderskhv/tinct/codex/bella-focused-short-clips-20260921/artifacts/bella-focused-short-clips-2026-09-21/communist-manifesto/4/"+n,timeout=90).read()
def write(n,j):(root/n).write_text(json.dumps(j,indent=1,ensure_ascii=False))
def main():
 old=json.loads(get("cohort.json"))[0]
 e=cloud_cohort.build(dict(bookId=book,edition="original-en",chapter=ch),work,"boundary-review",{})
 assert "dropped" not in e
 assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in old["paragraphs"]]
 write("cohort.json",[e]);cand=json.loads(get("words.candidate.json"))
 probes={name:json.loads(get(name+"-probe.json")) for name in ["base","small"]}
 path=snapshot_download("Systran/faster-whisper-medium.en",revision="a29b04bd15381511a9af671baec01072039215e3",local_dir="/tmp/medium")
 mh=trial.tree_hash(Path(path));assert mh=="2cb92e2f7d762a12ad0b3b5360cd93f78bb20b7181be86e253db854a29d41572"
 model=WhisperModel(path,device="cpu",compute_type="int8",cpu_threads=4);decisions=[]
 for index in [18,37]:
  p=next(x for x in e["paragraphs"] if x["index"]==index)
  r=trial.paragraph(model,work/p["path"],p["text"],"auto",root/f"p{index}.medium.json",configuration=dict(modelTreeSha256=mh,device="cpu",compute="int8"))
  assert not r["rejection_reasons"]
  target=next(x for x in cand["paragraphs"] if x["paragraph"]==index)
  anchors=[a for probe in probes.values() for a in probe["all_exact_match_anchors"] if a["paragraph"]==index]
  def score(words):
   ds=[max(abs(words[a["word"]]["start"]-a["probe_start"]),abs(words[a["word"]]["end"]-a["probe_end"])) for a in anchors]
   return [sum(d>.3 for d in ds),max(ds,default=0),sum(ds)]
  decision=dict(paragraph=index,oldScore=score(target["words"]),newScore=score(r["candidate_words"]))
  decision["accepted"]=decision["newScore"]<decision["oldScore"];decisions.append(decision);write("paragraph-selection.json",decisions)
  if decision["accepted"]:target["words"]=r["candidate_words"]
 assert not publish_timings.validate_candidate(cand,book,"original-en",ch)
 for p in e["paragraphs"]:
  words=next(x["words"] for x in cand["paragraphs"] if x["paragraph"]==p["index"])
  assert [w["text"] for w in words]==trial.lib.chapter_words_from_text(p["text"].replace("\n"," "))
  assert any(w["end"]>w["start"] for w in words)
 body=(json.dumps(cand,indent=1,ensure_ascii=False)+"\n").encode();(root/"words.candidate.json").write_bytes(body);digest=hashlib.sha256(body).hexdigest();out=[]
 for name,probe in probes.items():
  anchors=[]
  for a in probe["all_exact_match_anchors"]:
   w=next(p for p in cand["paragraphs"] if p["paragraph"]==a["paragraph"])["words"][a["word"]];assert w["text"]==a["text"]
   anchors.append(dict(a,candidate_start=w["start"],candidate_end=w["end"],max_delta=max(abs(w["start"]-a["probe_start"]),abs(w["end"]-a["probe_end"]))))
  ids=sorted({round(i*(len(anchors)-1)/29) for i in range(30)});selected=[anchors[i] for i in ids];within=sum(a["max_delta"]<=.3 for a in selected)
  gate=len(selected)>=30 and within/len(selected)>=.95 and all(a["max_delta"]<=1 for a in selected)
  probe.update(all_exact_match_anchors=anchors,selected_anchors=selected,within_300ms=within,selected_count=len(selected),max_delta=max(a["max_delta"] for a in selected),criterion_met=gate,reusedRecognitionAudioHashesVerified=True,candidate_sha256=digest)
  write(name+"-probe.json",probe);out.append(dict(model=name,passGate=gate,within=within,maxDelta=probe["max_delta"]))
 result=dict(key=key,status="acoustic-pass" if all(p["passGate"] for p in out) else "acoustic-fail",candidateSha256=digest,probes=out)
 write("result.json",result);print(json.dumps(result),flush=True)
try:main()
except Exception as e:write("error.json",dict(error=str(e),traceback=traceback.format_exc()));raise
