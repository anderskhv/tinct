"""Turn one pod's fetched output into publications, with rejections kept.

    python3 harvest.py <artifacts>/pods/<name> <artifacts>/publication-journal.json --apply

1. collect_candidates.py picks one passing arm per chapter;
2. publish_timings.py re-validates every candidate against production and
   uploads without ever overwriting, verifying the served bytes;
3. diagnostics for every rejected chapter are copied to <pod>/rejected/ so
   they survive the .gitignore that drops the bulky passing-chapter ones;
4. a short rejection digest (expected vs heard for the failing paragraphs)
   is written to <pod>/rejections.md for the report.

Needs boto3 for --apply; run under the venv that has it.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ALIGNER = HERE.parent / "aligner"


def main() -> int:
    pod = Path(sys.argv[1])
    journal = sys.argv[2]
    apply = "--apply" in sys.argv[3:]
    out = pod / "out"
    if not out.exists():
        print(f"{pod}: no out/ directory", file=sys.stderr)
        return 1
    subprocess.check_call([sys.executable, str(ALIGNER / "collect_candidates.py"), "--run", str(out),
                           "--out", str(pod / "candidates.json"), "--report", str(pod / "collect-report.json")])
    command = [sys.executable, str(HERE.parent / "publish_timings.py"), "--candidates", str(pod / "candidates.json"),
               "--journal", journal]
    if apply:
        command.append("--apply")
    subprocess.check_call(command)

    lines = []
    for row in json.loads((pod / "collect-report.json").read_text()):
        if row["outcome"] != "excluded":
            continue
        for arm in row["arms"]:
            src, dst = out / row["key"] / arm, pod / "rejected" / row["key"] / arm
            dst.mkdir(parents=True, exist_ok=True)
            for item in src.glob("*"):
                shutil.copy(item, dst / item.name)
        for arm in ("auto", "off"):
            chapter_file = out / row["key"] / arm / "chapter.json"
            if not chapter_file.exists():
                continue
            chapter = json.loads(chapter_file.read_text())
            bad = [p for p in chapter["paragraphs"] if p["reasons"]]
            lines.append(f"### `{row['key']}` — {arm} arm: {len(bad)} of {len(chapter['paragraphs'])} paragraphs below the gate\n")
            for p in bad[:6]:
                diag = json.loads((out / row["key"] / arm / f"p{p['index']}.diagnostic.json").read_text())
                selected = next(a for a in diag["attempts"] if a["mode"] == diag["selected_mode"])
                text = " ".join(selected["expected_tokens"])[:160]
                heard = " ".join(w["raw"] for w in selected["heard_words"])[:160]
                lines.append(f"- p{p['index']} ratio {p['ratio']:.2f}\n  - text: {text}\n  - heard: {heard}")
            lines.append("")
            break
    (pod / "rejections.md").write_text("\n".join(lines) if lines else "No rejections.\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
