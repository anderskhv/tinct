"""Collect passing chapters from a trial.py output tree into a publish list.

`trial.py` writes one candidate sidecar per arm per chapter and marks each
chapter `candidate_requires_acoustic_review` or `rejected`. This selects only
the chapters that passed, picks one arm per chapter, and emits the
`[{bookId, edition, chapter, path}, ...]` shape `publish_timings.py` consumes.

Selection, when both arms pass: the higher whole-chapter `matchRatio` wins, ties
break toward the unbiased `off` arm, since a result that needed no bias is the
less surprising one to publish. The chosen arm is recorded per chapter.

A rejected chapter is never promoted and never silently dropped: everything
excluded is written to the report with its reasons, so the gate's decisions stay
visible instead of vanishing between steps.

This selects; it does not validate. `publish_timings.py` re-validates every
candidate against production truth before it uploads anything.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

PASS = "candidate_requires_acoustic_review"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--run", type=Path, required=True, help="a trial.py --output directory")
    parser.add_argument("--out", type=Path, required=True, help="candidates file for publish_timings.py")
    parser.add_argument("--report", type=Path, required=True, help="per-chapter outcome, including exclusions")
    arguments = parser.parse_args()

    chapters: dict[str, dict] = {}
    for chapter_file in sorted(arguments.run.rglob("chapter.json")):
        arm = chapter_file.parent.name
        record = json.loads(chapter_file.read_text())
        key = record.get("key")
        if not key:
            continue
        sidecar = chapter_file.parent / "words.candidate.json"
        ratio = None
        if sidecar.exists():
            ratio = (json.loads(sidecar.read_text()).get("alignment") or {}).get("matchRatio")
        entry = chapters.setdefault(key, {"key": key, "arms": {}})
        entry["arms"][arm] = {
            "status": record.get("status"),
            "matchRatio": ratio,
            "reasons": record.get("reasons", []),
            "validationErrors": record.get("validation_errors"),
            "sidecar": str(sidecar) if sidecar.exists() else None,
        }

    candidates, report = [], []
    for key, entry in sorted(chapters.items()):
        passing = {
            arm: data for arm, data in entry["arms"].items()
            if data["status"] == PASS and data["sidecar"] and not data["validationErrors"]
        }
        if not passing:
            report.append({**entry, "outcome": "excluded",
                           "reason": "no arm passed the gate and sidecar validation"})
            continue
        # Highest whole-chapter ratio; a tie goes to the unbiased arm.
        arm = min(passing, key=lambda a: (-(passing[a]["matchRatio"] or 0), a != "off"))
        book, edition, chapter = key.split("/")
        candidates.append({"bookId": book, "edition": edition,
                           "chapter": int(chapter[2:]), "path": passing[arm]["sidecar"]})
        report.append({**entry, "outcome": "candidate", "selectedArm": arm,
                       "matchRatio": passing[arm]["matchRatio"]})

    arguments.out.write_text(json.dumps(candidates, indent=1))
    arguments.report.write_text(json.dumps(report, indent=1))

    excluded = [r for r in report if r["outcome"] == "excluded"]
    print(f"{len(candidates)} candidates, {len(excluded)} excluded, {len(chapters)} chapters seen")
    for row in excluded:
        reasons = sorted({
            reason
            for data in row["arms"].values()
            for item in (data["reasons"] or [])
            for reason in item.get("reasons", [])
        })
        print(f"  excluded {row['key']}: {', '.join(reasons) or 'no arm passed'}")


if __name__ == "__main__":
    main()
