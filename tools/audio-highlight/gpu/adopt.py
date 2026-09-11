"""Finish a pod whose launcher is gone: poll, snapshot, fetch, stop, terminate.

    python3 adopt.py --pod-id <id> --artifacts artifacts/audio-highlight-run1-2026-09-11

The token that gates the pod's read-only status server is recovered from the
pod's own environment through the RunPod REST API (it was placed there by
orchestrate.py at creation), so a pod launched by a session that has since
gone away can still be harvested rather than thrown away. The token is never
printed or written. Everything else — the poll loop, the four-minute
snapshots, the file list, the stop-then-terminate — is orchestrate.py's, so
the per-pod record under <artifacts>/pods/<name>/ has the same shape.
"""
from __future__ import annotations

import argparse
import json
import sys
import tarfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from orchestrate import agent_get, log, now, pod_get, stop_and_terminate  # noqa: E402


def pod_env(pod: dict) -> dict:
    env = pod.get("env") or {}
    if isinstance(env, list):
        env = {row.get("key"): row.get("value") for row in env if isinstance(row, dict)}
    return env


def adopt(args) -> int:
    pod = pod_get(args.pod_id)
    env = pod_env(pod)
    token = env.get("TINCT_TOKEN")
    if not token:
        raise SystemExit(f"pod {args.pod_id} carries no TINCT_TOKEN; cannot read its status server")
    name = pod.get("name") or args.pod_id
    batch = json.loads(env.get("TINCT_TARGETS") or "[]")
    pod_dir = Path(args.artifacts) / "pods" / name
    pod_dir.mkdir(parents=True, exist_ok=True)
    sink = pod_dir / "orchestrator.log"
    (pod_dir / "batch.json").write_text(json.dumps(batch, indent=1))
    record = {"name": name, "commit": env.get("TINCT_COMMIT"), "batch": len(batch),
              "createdAt": pod.get("createdAt"), "adoptedAt": now(), "adoptedBy": "adopt.py",
              "maxSeconds": int(env.get("TINCT_MAX_SECONDS") or 0), "arms": env.get("TINCT_ARMS"),
              "computeType": env.get("TINCT_COMPUTE_TYPE"), "podId": args.pod_id,
              "gpu": (pod.get("machine") or {}).get("gpuDisplayName") or pod.get("gpuTypeId"),
              "costPerHr": pod.get("costPerHr"), "image": pod.get("image"), "cloud": pod.get("cloudType")}
    ledger = pod_dir / "pod.json"

    def save():
        ledger.write_text(json.dumps(record, indent=1))

    save()
    log(f"adopted {args.pod_id} {name} gpu={record['gpu']} ${record['costPerHr']}/hr batch={len(batch)}", sink)
    base = f"https://{args.pod_id}-8000.proxy.runpod.net"
    started = time.time() - args.elapsed_minutes * 60
    outcome = "unknown"
    status: dict = {}
    try:
        last_phase = None
        last_snapshot = time.time()
        unreachable = 0
        while True:
            elapsed = (time.time() - started) / 60
            code, body = agent_get(base, token, "/status?log=8", timeout=30)
            status = json.loads(body) if code == 200 else {}
            phase = status.get("phase")
            if code != 200:
                unreachable += 1
                pod = pod_get(args.pod_id)
                if pod.get("desiredStatus") != "RUNNING":
                    outcome = "pod-exited-externally"
                    record["externalExit"] = pod.get("lastStatusChange")
                    log(f"pod is {pod.get('desiredStatus')} ({pod.get('lastStatusChange')}); using last snapshot", sink)
                    break
                if unreachable >= 6:
                    outcome = "agent-unreachable"
                    log("status server unreachable for 6 polls; using last snapshot", sink)
                    break
            else:
                unreachable = 0
            if phase == "aligning" and time.time() - last_snapshot >= args.snapshot_seconds:
                snap_code, snap = agent_get(base, token, "/tar?path=out&exclude=audio", timeout=300)
                if snap_code == 200 and snap:
                    (pod_dir / "out.snapshot.tar.gz").write_bytes(snap)
                    record["lastSnapshotAt"] = now()
                    log(f"snapshot {len(snap)} bytes", sink)
                last_snapshot = time.time()
            if phase != last_phase:
                log(f"phase {phase} at {elapsed:.1f} min; setup={json.dumps(status.get('setup', {}))[:300]}", sink)
                last_phase = phase
            log(f"{elapsed:.1f} min: {phase} {json.dumps(status.get('progress', {}))}", sink)
            if phase in ("done", "done-with-errors", "failed"):
                outcome = phase
                break
            if elapsed >= args.deadline_minutes:
                outcome = "launcher-deadline"
                log("launcher deadline reached; collecting whatever exists", sink)
                break
            time.sleep(args.poll_seconds)
        record["jobOutcome"] = outcome
        record["finalStatus"] = status
        save()

        for item in ["status.json", "targets.json", "cohort.log", "trial.log", "cohort/cohort-dropped.json",
                     "out/run.json", "out/process.log"]:
            code, body = agent_get(base, token, f"/file?path={item}", timeout=60)
            if code == 200:
                (pod_dir / item.replace("/", "__")).write_bytes(body)
        code, body = agent_get(base, token, "/tar?path=out&exclude=audio", timeout=600)
        if code == 200 and body:
            (pod_dir / "out.tar.gz").write_bytes(body)
            with tarfile.open(pod_dir / "out.tar.gz", "r:gz") as tar:
                tar.extractall(pod_dir)
            record["resultsFetched"] = True
            log(f"fetched out.tar.gz ({len(body)} bytes)", sink)
        elif (pod_dir / "out.snapshot.tar.gz").exists():
            with tarfile.open(pod_dir / "out.snapshot.tar.gz", "r:gz") as tar:
                tar.extractall(pod_dir)
            record["resultsFetched"] = "snapshot"
            log(f"final fetch failed (HTTP {code}); extracted last snapshot from {record.get('lastSnapshotAt')}", sink)
        else:
            record["resultsFetched"] = False
            log(f"results fetch failed: HTTP {code}", sink)
        code, body = agent_get(base, token, "/tar?path=cohort&exclude=audio", timeout=120)
        if code == 200 and body:
            (pod_dir / "cohort.tar.gz").write_bytes(body)
            with tarfile.open(pod_dir / "cohort.tar.gz", "r:gz") as tar:
                tar.extractall(pod_dir)
    except Exception as error:  # noqa: BLE001
        record["error"] = f"{type(error).__name__}: {error}"
        log(record["error"], sink)
    finally:
        record["uptimeMinutes"] = round((time.time() - started) / 60, 1)
        record["estimatedCost"] = round((record.get("costPerHr") or 0) * record["uptimeMinutes"] / 60, 4)
        save()
        stop_and_terminate(args.pod_id, sink, record)
        save()
        log(f"pod {args.pod_id} done: outcome={outcome} uptime={record['uptimeMinutes']}m "
            f"est ${record['estimatedCost']:.2f}", sink)
    return 0 if record.get("resultsFetched") else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pod-id", required=True)
    parser.add_argument("--artifacts", required=True)
    parser.add_argument("--elapsed-minutes", type=float, default=0.0,
                        help="minutes the pod had already been up when adopted, so the deadline counts from creation")
    parser.add_argument("--deadline-minutes", type=float, default=44.0)
    parser.add_argument("--poll-seconds", type=int, default=30)
    parser.add_argument("--snapshot-seconds", type=int, default=240)
    return adopt(parser.parse_args())


if __name__ == "__main__":
    raise SystemExit(main())
