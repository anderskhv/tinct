"""One row per published English edition: provenance, audio, timings, blockers.

Completion is measured in editions, not chapters. A book with one finished
chapter is not progress toward "this edition works"; an edition is only done
when every chapter with a recording has verified timings and the reader has
actually been watched playing it.

Combines the outputs of the other tools:

  classify_editions.py  provenance group — non-AI first, AI second
  audit_production.py   which chapters have a recording and which have timings
  audio_readiness.py    of the chapters lacking timings, which are alignable
                        now and which need a recording repaired
  verify_timings.py     whether the timings that exist actually hold up

and assigns each edition a state:

  complete-unverified   every chapter has timings, but they have not all been
                        checked, and nobody has watched the reader play it
  verified              timings present and checked across the edition
  processing            work remains and all of it is alignable today
  blocked-on-repair     work remains and some of it needs a recording fixed
  no-audio              nothing to align against

Read-only, offline. Takes the JSON the other tools already wrote.
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

GROUP_ORDER = {"non-ai": 0, "non-ai-undocumented": 1, "ai-created": 2, "needs-confirmation": 3}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--provenance", required=True)
    parser.add_argument("--coverage", required=True)
    parser.add_argument("--readiness", help="audio_readiness.py output, if it has been run")
    parser.add_argument("--verification", help="verify_timings.py report, if it has been run")
    parser.add_argument("--out", required=True)
    parser.add_argument("--csv")
    args = parser.parse_args()

    provenance = {(r["bookId"], r["edition"]): r for r in json.loads(Path(args.provenance).read_text())}
    coverage = json.loads(Path(args.coverage).read_text())["editions"]

    readiness: dict[tuple[str, str], list[dict]] = defaultdict(list)
    if args.readiness:
        for row in json.loads(Path(args.readiness).read_text())["results"]:
            readiness[(row["bookId"], row["edition"])].append(row)

    verified: dict[tuple[str, str], dict[str, int]] = defaultdict(lambda: {"pass": 0, "fail": 0})
    if args.verification:
        for row in json.loads(Path(args.verification).read_text())["results"]:
            verified[(row["bookId"], row["edition"])]["pass" if row["ok"] else "fail"] += 1

    rows = []
    for edition in coverage:
        key = (edition["bookId"], edition["edition"])
        chapters = [c for c in edition["chapters"] if c.get("manifest") == 200]
        timed = [c for c in chapters if c.get("words") in (200, 206)]
        missing = len(chapters) - len(timed)

        assessed = readiness.get(key, [])
        ready = [r for r in assessed if r["outcome"] in ("ready", "separator-gap")]
        repair = [r for r in assessed if r["outcome"].startswith("repair")]

        meta = provenance.get(key, {})
        checks = verified.get(key)

        if not chapters:
            state, blocker = "no-audio", "no chapter manifests in production"
        elif missing == 0:
            if checks and checks["fail"]:
                state, blocker = "blocked-on-repair", f"{checks['fail']} chapter(s) failed verification"
            elif checks and checks["pass"] >= len(timed):
                state, blocker = "verified", "reader playback check outstanding"
            else:
                state, blocker = "complete-unverified", "timings present; not all verified, reader not watched"
        elif repair:
            state = "blocked-on-repair"
            blocker = f"{len(repair)} chapter(s) need a recording repaired; {len(ready)} alignable now"
        elif assessed:
            state, blocker = "processing", f"{len(ready)} chapter(s) alignable now"
        else:
            state, blocker = "processing", f"{missing} chapter(s) lack timings; readiness not yet assessed"

        rows.append({
            "group": meta.get("group", "unknown"),
            "bookId": edition["bookId"],
            "edition": edition["edition"],
            "title": edition.get("title", ""),
            "provenance": meta.get("why", ""),
            "chapters": len(chapters),
            "timed": len(timed),
            "missing": missing,
            "alignableNow": len(ready),
            "needsRecordingRepair": len(repair),
            "verifiedPass": (checks or {}).get("pass", 0),
            "verifiedFail": (checks or {}).get("fail", 0),
            "audioHours": round(sum(c.get("durationSeconds") or 0 for c in chapters) / 3600, 2),
            "state": state,
            "blocker": blocker,
        })

    rows.sort(key=lambda r: (GROUP_ORDER.get(r["group"], 9), r["missing"], r["bookId"], r["edition"]))
    Path(args.out).write_text(json.dumps(rows, indent=1))
    if args.csv:
        with open(args.csv, "w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)

    for group in sorted({r["group"] for r in rows}, key=lambda g: GROUP_ORDER.get(g, 9)):
        members = [r for r in rows if r["group"] == group]
        print(f"\n=== {group}  ({len(members)} editions) ===")
        states = defaultdict(list)
        for row in members:
            states[row["state"]].append(row)
        for state in ("verified", "complete-unverified", "processing", "blocked-on-repair", "no-audio"):
            if state in states:
                group_rows = states[state]
                print(f"  {state:20} {len(group_rows):4} editions   "
                      f"{sum(r['missing'] for r in group_rows):5} chapters still missing timings")
    print(f"\ntotal editions {len(rows)}   "
          f"complete {sum(1 for r in rows if r['state'] in ('verified', 'complete-unverified'))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
