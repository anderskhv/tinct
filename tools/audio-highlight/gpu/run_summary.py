"""Print the evidence tables for the run report from the artifacts directory.

    python3 run_summary.py artifacts/audio-highlight-run1-2026-09-11

Reads pods/*/pod.json, pods/*/collect-report.json, publication-journal.json
and run-queue.json; prints markdown for pods, spend, published chapters,
failed chapters and edition completion. Registry chapter counts come from the
queue file, which carries chaptersTotal / alreadyTimed per edition.
"""
from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path


def main() -> None:
    root = Path(sys.argv[1])
    pods = []
    for pod_json in sorted(root.glob("pods/*/pod.json")):
        pods.append(json.loads(pod_json.read_text()))
    pods.sort(key=lambda p: p.get("createdAt", ""))
    print("## Pods\n")
    print("| pod | id | gpu | $/hr | created | terminated | uptime min | outcome | est. $ |")
    print("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    total = 0.0
    for p in pods:
        gpu = (p.get("finalStatus") or {}).get("setup", {}).get("gpu") or p.get("gpu") or "?"
        gpu = gpu.split(",")[0]
        cost = p.get("estimatedCost") or 0.0
        total += cost
        print(f"| {p['name']} | `{p.get('podId','')}` | {gpu} | {p.get('costPerHr')} | {p.get('createdAt','')[11:19]} | "
              f"{p.get('terminatedAt','')[11:19]} | {p.get('uptimeMinutes','')} | {p.get('jobOutcome','')} | {cost:.2f} |")
    print(f"\nEstimated spend across pods (costPerHr × uptime): **${total:.2f}**.\n")

    journal_path = root / "publication-journal.json"
    journal = json.loads(journal_path.read_text()) if journal_path.exists() else []
    published = [r for r in journal if r["outcome"] == "published"]
    others = [r for r in journal if r["outcome"] != "published"]
    print(f"## Published and verified — {len(published)} chapters\n")
    print("| edition | ch | SHA-256 | bytes | at (UTC) |")
    print("| --- | --- | --- | --- | --- |")
    for r in published:
        book, edition, ch, _ = r["key"].split("/")
        print(f"| `{book}/{edition}` | {ch[2:]} | `{r['sha256']}` | {r['bytes']} | {r['at'][11:19]} |")
    exists = [r for r in others if "already exists" in (r.get("reason") or "")]
    others = [r for r in others if r not in exists]
    if exists:
        print(f"\n{len(exists)} journal entries are re-runs that found the object already published and were skipped "
              "(the uploader never overwrites).")
    if others:
        print("\nJournal entries that did not publish:\n")
        for r in others:
            print(f"- `{r['key']}` — {r['outcome']}: {r.get('reason')}")

    print("\n## Chapters that failed the gate\n")
    failed, cut = [], []
    for report in sorted(root.glob("pods/*/collect-report.json")):
        for row in json.loads(report.read_text()):
            if row["outcome"] == "excluded":
                statuses = {arm: data.get("status") for arm, data in row["arms"].items()}
                if len(statuses) < 2 or any(s not in ("rejected", "candidate_requires_acoustic_review")
                                            for s in statuses.values()):
                    cut.append((row["key"], report.parent.name))
                    continue
                reasons = defaultdict(list)
                for arm, data in row["arms"].items():
                    for item in data.get("reasons") or []:
                        reasons[item["paragraph"]].append(f"{arm}:{','.join(item['reasons'])}")
                failed.append((row["key"], report.parent.name, dict(sorted(reasons.items()))))
    if not failed:
        print("None.")
    for key, pod, reasons in failed:
        print(f"- `{key}` ({pod}) — paragraphs {list(reasons)}: below 0.85 on every arm; not published")
    if cut:
        print("\n## Chapters cut off by the worker time cap and re-queued\n")
        for key, pod in cut:
            print(f"- `{key}` ({pod}) — not a rejection; re-run in the leftovers batch")
    dropped = []
    for path in sorted(root.glob("pods/*/cohort__cohort-dropped.json")):
        for row in json.loads(path.read_text()):
            dropped.append((row["key"], row["dropped"], path.parent.name))
    if dropped:
        print("\n## Chapters dropped before alignment (repair class)\n")
        for key, why, pod in dropped:
            print(f"- `{key}` ({pod}) — {why}")

    queue = json.loads((root / "run-queue.json").read_text())
    editions = {}
    for r in queue:
        editions.setdefault((r["bookId"], r["edition"]), {"total": r["chaptersTotal"], "before": r["alreadyTimed"],
                                                          "queued": 0, "done": 0})
        editions[(r["bookId"], r["edition"])]["queued"] += 1
    done_keys = {r["key"] for r in published}
    for r in queue:
        if f"{r['bookId']}/{r['edition']}/ch{r['chapter']}/words.json" in done_keys:
            editions[(r["bookId"], r["edition"])]["done"] += 1
    complete = [(k, v) for k, v in editions.items() if v["before"] + v["done"] >= v["total"]]
    partial = [(k, v) for k, v in editions.items() if 0 < v["done"] and v["before"] + v["done"] < v["total"]]
    print(f"\n## Editions completed this run — {len(complete)}\n")
    for (book, edition), v in sorted(complete):
        print(f"- `{book}/{edition}` — {v['total']}/{v['total']} chapters timed ({v['done']} added this run)")
    print(f"\n## Editions advanced but not complete — {len(partial)}\n")
    for (book, edition), v in sorted(partial):
        print(f"- `{book}/{edition}` — {v['before'] + v['done']}/{v['total']} timed ({v['done']} added; "
              f"{v['queued'] - v['done']} queued chapters still open)")


if __name__ == "__main__":
    main()
