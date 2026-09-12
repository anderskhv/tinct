"""Harvest, publish and push every pod the moment it finishes. One at a time.

A pod is ready when its pod.json records a termination (estimatedCost present)
and out/ exists; it is done when candidates.json exists. Everything is
serialised through this one process so no two publishers or two git commits
overlap. Losing this process loses nothing: rerun it and it picks up where it
stopped, because both the readiness and the done marks live on disk.
"""
import json, os, subprocess, time
from pathlib import Path

A = Path("/home/user/tinct/artifacts/audio-highlight-run2-2026-09-11")


def log(msg):
    line = f"[{time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}] {msg}"
    with open(A / "harvest.log", "a") as fh:
        fh.write(line + "\n")
    print(line, flush=True)


def ready(pod_dir):
    if (pod_dir / "candidates.json").exists():
        return False
    if not (pod_dir / "out").exists():
        return False
    try:
        record = json.loads((pod_dir / "pod.json").read_text())
    except Exception:
        return False
    return record.get("estimatedCost") is not None


def main():
    idle = 0
    while True:
        did = False
        for pod_dir in sorted(A.glob("pods/*")):
            if not ready(pod_dir):
                continue
            name = pod_dir.name
            log(f"harvesting {name}")
            result = subprocess.run(["bash", str(A / "harvest_one.sh"), name],
                                    capture_output=True, text=True, cwd="/home/user/tinct")
            log(f"{name}: rc={result.returncode} {result.stdout.strip()[-400:]} {result.stderr.strip()[-200:]}")
            subprocess.run(["python3", str(A / "recompute_spent.py")], capture_output=True)
            did = True
        idle = 0 if did else idle + 1
        time.sleep(30)


if __name__ == "__main__":
    main()
