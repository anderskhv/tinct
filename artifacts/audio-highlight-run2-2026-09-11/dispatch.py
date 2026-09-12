"""Keep wave-2 batches flowing: relaunch whenever RunPod has capacity again.

Holds concurrency at MAX_PODS owned pods, refuses to start a pod once the
envelope projection crosses BUDGET_STOP, and never touches a batch twice.
Each launch is an orchestrate.py run, which harvests and terminates itself.
State: pending.json (batches not yet launched), dispatch.log.
"""
import json, os, subprocess, sys, time
from pathlib import Path

A = Path("/home/user/tinct/artifacts/audio-highlight-run2-2026-09-11")
ROOT = Path("/home/user/tinct")
sys.path.insert(0, str(ROOT / "tools/audio-highlight/gpu"))
from orchestrate import api  # noqa: E402

COMMIT = "f53d744782e3c369fffd2980a013a7f199c0476e"
MAX_PODS = 12
BUDGET_STOP = 17.0          # stop launching; harvest and close out below $20
POD_PROJECTION = 0.22       # $ a fresh pod adds, measured over 60 run-2 pods


def log(msg):
    line = f"[{time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}] {msg}"
    with open(A / "dispatch.log", "a") as fh:
        fh.write(line + "\n")
    print(line, flush=True)


def owned_running():
    status, body = api("GET", "/pods")
    if status != 200:
        raise RuntimeError(f"list pods HTTP {status}")
    rows = body if isinstance(body, list) else (body or {}).get("data") or []
    return [p for p in rows if (p.get("name") or "").startswith("tinct-words-run2-")
            and p.get("desiredStatus") == "RUNNING"]


def spent():
    try:
        return float((A / "spent.txt").read_text().strip())
    except Exception:
        return 0.0


def next_pod_number():
    n = 0
    for f in A.glob("launch-*.log"):
        try:
            n = max(n, int(f.stem.split("-")[1]))
        except ValueError:
            pass
    return n + 1


def main():
    pending = json.loads((A / "pending.json").read_text())
    while pending:
        try:
            running = owned_running()
        except Exception as e:
            log(f"pod list failed: {e}")
            time.sleep(60)
            continue
        projected = spent() + len(running) * POD_PROJECTION
        if projected + POD_PROJECTION > BUDGET_STOP:
            log(f"budget stop: spent {spent():.2f} + {len(running)} running projects {projected:.2f}")
            break
        if len(running) >= MAX_PODS:
            time.sleep(60)
            continue
        batch = pending[0]
        n = next_pod_number()
        name = f"tinct-words-run2-{n}"
        cmd = [sys.executable, str(ROOT / "tools/audio-highlight/gpu/orchestrate.py"), "run",
               "--name", name, "--batch", str(A / f"wave2-batch-{batch}.json"),
               "--commit", COMMIT, "--artifacts", str(A), "--cloud", "SECURE"]
        out = open(A / f"launch-{n}.log", "w")
        proc = subprocess.Popen(cmd, stdout=out, stderr=subprocess.STDOUT)
        time.sleep(45)
        if proc.poll() is not None and proc.returncode != 0:
            tail = (A / f"launch-{n}.log").read_text()[-200:]
            if "no instances currently available" in tail:
                log(f"batch {batch}: no capacity, retrying later")
                (A / f"launch-{n}.log").unlink()
                time.sleep(60)
                continue
            log(f"batch {batch} on {name} failed: {tail.strip()[:200]}")
            pending.pop(0)
        else:
            log(f"launched {name} <- wave2-batch-{batch} ({len(pending)-1} pending)")
            pending.pop(0)
        (A / "pending.json").write_text(json.dumps(pending))
    log("dispatcher done: pending empty or budget stop")


if __name__ == "__main__":
    main()
