import json,hashlib,sys,copy
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
sys.path.insert(0,"tools/audio-highlight/aligner")
import prodapi,publish_timings
from observed_prefix_repair import restore_observed_prefix
root=Path("artifacts/bella-context-repair-2026-09-21")
key="king-lear/original-en/ch3";path=root/"out"/key/"auto/words.candidate.json"
candidate=json.loads(path.read_text())
co=next(e for e in json.loads((root/"cohort.json").read_text()) if e["key"]==key)
for p in co["paragraphs"]:
 status,body=prodapi.audio_object(key+"/"+p["file"]);assert status==200 and hashlib.sha256(body).hexdigest()==p["sha256"]
changes=[]
for p in candidate["paragraphs"]:
 diagnostic=Path("artifacts/bella-completion-2026-09-21/out")/key/"auto"/f"p{p['paragraph']}.diagnostic.json"
 d=json.loads(diagnostic.read_text());a=next(x for x in d["attempts"] if x["mode"]==d["selected_mode"])
 assert [w["text"] for w in p["words"]]==a["expected_tokens"]
 p["words"],n=restore_observed_prefix(p["words"],a["expected_tokens"],a["acoustic_expected_tokens"],a["heard_words"])
 if n:
  p["alignment"]["expectedWords"]+=n;p["alignment"]["matchedWords"]+=n
  p["alignment"]["matchRatio"]=p["alignment"]["matchedWords"]/p["alignment"]["expectedWords"]
  changes.append(dict(paragraph=p["paragraph"],restored=n,diagnosticSha256=hashlib.sha256(diagnostic.read_bytes()).hexdigest()))
assert changes
for f in ["expectedWords","heardWords","matchedWords"]:candidate["alignment"][f]=sum(p["alignment"][f] for p in candidate["paragraphs"])
candidate["alignment"]["matchRatio"]=candidate["alignment"]["matchedWords"]/candidate["alignment"]["expectedWords"]
probe=next(x for x in json.loads((root/"probes.json").read_text()) if x["key"]==key)
anchors=[]
for a in probe["all_exact_match_anchors"]:
 w=next(p for p in candidate["paragraphs"] if p["paragraph"]==a["paragraph"])["words"][a["word"]];assert w["text"]==a["text"]
 anchors.append(dict(a,candidate_start=w["start"],candidate_end=w["end"],max_delta=max(abs(w["start"]-a["probe_start"]),abs(w["end"]-a["probe_end"]))))
selected=[anchors[i] for i in sorted({round(i*(len(anchors)-1)/29) for i in range(30)})]
within=sum(x["max_delta"]<=.3 for x in selected)
passed=len(selected)>=30 and within/len(selected)>=.95 and all(x["max_delta"]<=1 for x in selected)
assert not publish_timings.validate_candidate(candidate,"king-lear","original-en",3)
out=root/"prefix-repair";out.mkdir(parents=True,exist_ok=True)
(out/"words.candidate.json").write_text(json.dumps(candidate,indent=2))
report=dict(key=key,changes=changes,criterion_met=passed,within_300ms=within,selected_count=len(selected),max_delta=max(x["max_delta"] for x in selected),selected_anchors=selected,candidate_sha256=hashlib.sha256((out/"words.candidate.json").read_bytes()).hexdigest(),probe_model_sha256=probe["model_sha256"],source_audio_hashes_reverified=True)
(out/"evidence.json").write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=1))
