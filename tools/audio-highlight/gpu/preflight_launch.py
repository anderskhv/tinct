"""Fail closed before starting a new Tinct audio GPU pod."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path


def launch_blockers(report: dict, budget: float, reserve: float = 0.0) -> list[str]:
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
    try:
        spend = float(report.get("estimatedTotalSpend", 0))
    except (TypeError, ValueError):
        spend = math.nan
    if not math.isfinite(budget) or budget < 0:
        failures.append("authorized aggregate envelope is invalid")
    if not math.isfinite(reserve) or reserve < 0:
        failures.append("launch reservation is invalid")
    if not math.isfinite(spend) or spend < 0:
        failures.append("estimated aggregate spend is invalid")
    elif math.isfinite(budget) and budget >= 0 and math.isfinite(reserve) and reserve >= 0:
        if spend + reserve > budget:
            failures.append(
                f"authorized aggregate envelope cannot reserve this launch "
                f"({spend:.4f} + {reserve:.4f} > {budget:.4f})"
            )
    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("report", type=Path)
    parser.add_argument("--budget", required=True, type=float)
    parser.add_argument("--reserve", type=float, default=0.0)
    args = parser.parse_args()
    report = json.loads(args.report.read_text())
    failures = launch_blockers(report, args.budget, args.reserve)
    if failures:
        print("; ".join(failures))
        return 2
    print(
        "GPU launch preflight passed: no active owned pod and "
        f"{args.reserve:.4f} reserved inside the aggregate envelope"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
