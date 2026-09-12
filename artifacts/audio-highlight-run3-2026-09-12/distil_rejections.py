"""Keep what a future helper revision needs, drop what it does not.

A harvested pod's `rejected/` tree is the full per-paragraph diagnostic for every
rejected chapter: every bias attempt, every heard word, hundreds of megabytes a
pod. Helper v3 was built by replaying exactly that from run 2 — so throwing it
all away would leave run 4 with nothing to measure a v4 tokenizer against.

What the tokenizer study actually needs is much smaller: for each chapter and
arm, the paragraphs that sat below the gate, with their expected tokens and the
recogniser's own heard words and timings for the best attempt. That is what this
writes, per pod, as `rejected-extract.json`; the bulky tree is then removable.

usage: distil_rejections.py <pod dir>
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, "/home/user/tinct/tools/audio-highlight/aligner")
import pinned_words_sidecar_lib_v3 as v3

GATE = .85


def main() -> int:
    pod = Path(sys.argv[1])
    rejected = pod / "rejected"
    if not rejected.is_dir():
        return 0
    out = []
    for path in sorted(rejected.rglob("p*.diagnostic.json")):
        try:
            d = json.loads(path.read_text())
        except Exception:
            continue
        if not d.get("attempts"):
            continue
        directory = path.parent
        arm = directory.name
        key = "/".join(directory.parts[-4:-1])
        best = None
        for a in d["attempts"]:
            heard = [v3.HeardWord(h["raw"], h["start"], h["end"]) for h in a["heard_words"]]
            r = v3.align_tokens_detailed(a["expected_tokens"], heard)
            if best is None or r.stats.match_ratio > best[0]:
                best = (r.stats.match_ratio, a)
        if best is None or best[0] >= GATE:
            continue
        ratio, a = best
        out.append({
            "chapter": key, "arm": arm,
            "paragraph": int(path.stem[1:].split(".")[0]),
            "ratio": round(ratio, 4), "mode": a["mode"],
            "expected_tokens": a["expected_tokens"],
            "heard_words": a["heard_words"],
        })
    (pod / "rejected-extract.json").write_text(json.dumps(out, indent=1))
    print(f"{pod.name}: {len(out)} below-gate paragraphs kept")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
