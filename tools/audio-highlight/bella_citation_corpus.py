"""Measure citation normalization on retained historical diagnostics; no production writes."""
import collections,dataclasses,json,sys
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight/aligner")
import roman_reference_alignment as new,pinned_words_sidecar_lib_v7 as old
seen=0;changed=[];crossed=[];failures=[]
for path in sorted(Path("artifacts").glob("audio-highlight-run*/pods/*/rejected-extract.json")):
    for row in json.loads(path.read_text()):
        if "/original-en/" not in row.get("chapter",""):continue
        tokens=row.get("expected_tokens",[])
        heard=[old.HeardWord(**h) for h in row.get("heard_words",[])]
        before=old.align_tokens_detailed(tokens,heard)
        after,mapping=new.align(tokens,heard)
        seen+=1
        assert after.stats.matched_words>=before.stats.matched_words
        assert set(before.observed).issubset(after.observed)
        if not mapping:
            assert after.words==before.words and after.stats==before.stats
            continue
        result={"key":row["chapter"],"paragraph":row["paragraph"],"arm":row["arm"],"mode":row["mode"],"before":before.stats.match_ratio,"after":after.stats.match_ratio,"mapping":mapping,"source":str(path)}
        changed.append(result)
        if before.stats.match_ratio<.85<=after.stats.match_ratio:crossed.append(result)
out=Path("artifacts/bella-sync-pilot-2026-09-21")
summary={"historicalOriginalEnglishAttempts":seen,"changed":len(changed),"crossedGate":len(crossed),"distinctParagraphsCrossing":len({(r["key"],r["paragraph"]) for r in crossed}),"chaptersWithParagraphCrossing":len({r["key"] for r in crossed}),"regressions":0,"limit":"Historical diagnostic replay only; not current audio identity validation, acoustic acceptance or publication."}
(out/"citation-corpus-replay.json").write_text(json.dumps({"summary":summary,"changed":changed},indent=1))
print(json.dumps(summary,indent=2))
