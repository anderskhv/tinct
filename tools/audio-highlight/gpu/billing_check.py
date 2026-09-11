"""Cross-check this run's estimated spend against RunPod's own billing rows.

    python3 billing_check.py artifacts/audio-highlight-run1-2026-09-11

Reads every pods/*/pod.json for the pod IDs this run created, pulls
/billing/pods, and prints what RunPod actually billed for those IDs — the
ground truth the per-pod costPerHr × uptime estimate is checked against.
Also totals what the rest of the account billed today, to make lingering
storage spend visible. RUNPOD_API_KEY from the environment; never printed.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.request
from collections import defaultdict
from pathlib import Path


def main() -> int:
    root = Path(sys.argv[1])
    key = os.environ.get("RUNPOD_API_KEY")
    if not key:
        print("RUNPOD_API_KEY is not set", file=sys.stderr)
        return 2
    ours = {}
    for pod_json in root.glob("pods/*/pod.json"):
        record = json.loads(pod_json.read_text())
        if record.get("podId"):
            ours[record["podId"]] = record["name"]
    request = urllib.request.Request("https://rest.runpod.io/v1/billing/pods",
                                     headers={"Authorization": f"Bearer {key}",
                                              "User-Agent": "tinct-billing-check/1.0"})
    rows = json.load(urllib.request.urlopen(request, timeout=60))
    today = time.strftime("%Y-%m-%d", time.gmtime())
    billed = defaultdict(float)
    other_today = 0.0
    for row in rows:
        if row["podId"] in ours:
            billed[row["podId"]] += row["amount"]
        elif row["time"].startswith(today):
            other_today += row["amount"]
    total = 0.0
    print("| pod | id | billed by RunPod ($) |")
    print("| --- | --- | --- |")
    for pod_id, name in sorted(ours.items(), key=lambda kv: kv[1]):
        amount = billed.get(pod_id, 0.0)
        total += amount
        print(f"| {name} | `{pod_id}` | {amount:.4f} |")
    print(f"\nRunPod-billed total for this run's pods: **${total:.2f}**")
    print(f"Rest of the account billed today (mostly stored volumes of older pods): ${other_today:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
