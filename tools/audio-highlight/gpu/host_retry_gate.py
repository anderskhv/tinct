#!/usr/bin/env python3
"""Allow one replacement pod only for a proven pre-processing CUDA host failure."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def replacement_spend(record: object, base_spend: float) -> float:
    if not isinstance(record, dict):
        raise ValueError("pod record is invalid")
    final = record.get("finalStatus") or {}
    progress = final.get("progress") or {}
    probe = str((final.get("setup") or {}).get("cuda_probe") or "")
    error = str(record.get("error") or (final.get("job") or {}).get("error") or "")
    if record.get("statusAfterStop") != "EXITED" or record.get("terminateHttp") != 204:
        raise ValueError("failed pod teardown is not proven")
    if record.get("resultsFetched") not in (False, None):
        raise ValueError("pod produced candidate state; automatic replacement forbidden")
    if any(int(progress.get(field, 0) or 0) for field in (
        "arm_chapters_passed", "arm_chapters_rejected", "arm_chapters_running", "paragraph_diagnostics"
    )):
        raise ValueError("pod began chapter processing; automatic replacement forbidden")
    if "cuda devices 0" not in probe or "cuda probe failed" not in error:
        raise ValueError("failure is not the approved CUDA=0 host class")
    estimate = float(record.get("estimatedCost") or 0)
    if estimate < 0 or estimate > 0.10:
        raise ValueError("failed-host estimate exceeds the replacement bound")
    return round(base_spend + estimate, 4)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pod_json", type=Path)
    parser.add_argument("--base-spend", type=float, required=True)
    args = parser.parse_args()
    print(f"{replacement_spend(json.loads(args.pod_json.read_text()), args.base_spend):.4f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
