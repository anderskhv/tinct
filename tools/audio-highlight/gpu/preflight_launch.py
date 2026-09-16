"""Fail closed before starting a new Tinct audio GPU pod."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def launch_blockers(report: dict, budget: float) -> list[str]:
    failures: list[str] = []
    active_owned = [
        pod for pod in report.get("ownedPods", [])
        if str(pod.get("status", "")).upper() != "EXITED"
    ]
    if active_owned:
        names = ", ".join(str(pod.get("name") or pod.get("id") or "unknown") for pod in active_owned)
        failures.append(f"owned pod is still active: {names}")
    if report.get("actions"):
        failures.append("owned pod already exceeds a guard limit")
    if report.get("unownedRunningPods"):
        failures.append("unowned billing pod is running")
    if float(report.get("estimatedTotalSpend", 0)) >= budget:
        failures.append("authorized aggregate envelope is exhausted")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", type=Path)
    parser.add_argument("--budget", required=True, type=float)
    args = parser.parse_args()
    report = json.loads(args.report.read_text())
    failures = launch_blockers(report, args.budget)
    if failures:
        print("; ".join(failures))
        return 2
    print("GPU launch preflight passed: no active owned pod and envelope available")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
