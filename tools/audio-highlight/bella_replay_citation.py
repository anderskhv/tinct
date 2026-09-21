"""Replay saved recognition, preserving observed timestamps and source words."""
import copy,dataclasses,hashlib,json,sys
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight/aligner")
sys.path.insert(0,"tools/audio-highlight")
import trial,roman_reference_alignment as normal,pinned_words_sidecar_lib_v7 as lib,publish_timings
root=Path("artifacts/bella-sync-pilot-2026-09-21")
source=root/"out/imitation-of-christ/original-en/ch76/auto"
candidate=json.loads((source/"words.candidate.json").read_text())
evidence=[]
for p in candidate["paragraphs"]:
    path=source/f"p{p['paragraph']}.diagnostic.json";diag=json.loads(path.read_text())
    original=next(a for a in diag["attempts"] if a["mode"]==diag["selected_mode"])
    expected=original["acoustic_expected_tokens"]
    heard=[lib.HeardWord(**h) for h in original["heard_words"]]
    result,changes=normal.align(expected,heard)
    if not changes:continue
    assert result.stats.match_ratio>=.85
    restored=trial.restore_source_tokens(result.words,original["expected_tokens"],expected)
    p["words"]=restored
    p["alignment"].update(expectedWords=result.stats.expected_words,heardWords=result.stats.heard_words,matchedWords=result.stats.matched_words,matchRatio=result.stats.match_ratio)
    evidence.append({"paragraph":p["paragraph"],"changes":changes,"before":original["stats"],"after":dataclasses.asdict(result.stats),"diagnosticSha256":hashlib.sha256(path.read_bytes()).hexdigest()})
assert evidence
assert all(p["alignment"]["matchRatio"]>=.85 for p in candidate["paragraphs"])
for field in ["expectedWords","heardWords","matchedWords"]:candidate["alignment"][field]=sum(p["alignment"][field] for p in candidate["paragraphs"])
candidate["alignment"]["matchRatio"]=candidate["alignment"]["matchedWords"]/candidate["alignment"]["expectedWords"]
candidate["alignment"]["comparisonRevision"]="citation-roman-experiment-20260921"
failures=publish_timings.validate_candidate(candidate,"imitation-of-christ","original-en",76)
assert not failures,failures
out=root/"replay/imitation-of-christ/original-en/ch76/auto";out.mkdir(parents=True,exist_ok=True)
(out/"words.candidate.json").write_text(json.dumps(candidate,indent=2))
(out/"replay-evidence.json").write_text(json.dumps({"evidence":evidence,"normalizerSha256":hashlib.sha256(Path(normal.__file__).read_bytes()).hexdigest(),"productionWrites":0},indent=2))
print(json.dumps(evidence,indent=2))
