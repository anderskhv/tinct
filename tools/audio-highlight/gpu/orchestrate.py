"""Drive one RunPod GPU pod through one batch of word-timing alignment.

    python3 orchestrate.py run --name tinct-words-run1-1 --batch batch.json \
        --commit <sha> --artifacts artifacts/audio-highlight-run1-2026-09-11

Sequence, with every step recorded in `<artifacts>/pods/<name>/`:

  1. create the pod (REST, on-demand, cheapest acceptable GPU by availability,
     no persistent volume, one HTTP port, the batch and pins in its env);
  2. wait for it to run and for the job's read-only status server to answer;
  3. poll status until the job reports done / failed, or the pod's own
     deadline approaches (the launcher's deadline, below the guard's 50 min);
  4. pull the output tree (minus audio) and logs through the HTTP proxy;
  5. stop the pod, confirm it is not running, then terminate it so nothing
     lingers or bills disk.

Spend accounting is by the pod's own costPerHr × uptime, cross-checked later
against /billing/pods. RUNPOD_API_KEY comes from the environment and is never
printed. The pod itself receives no credential: only a random token that gates
read access to its status server.

The guard (`../runpod_guard.py enforce --apply`) must run alongside this on a
timer; this script does not replace it.
"""
from __future__ import annotations

import argparse
import json
import os
import secrets
import sys
import tarfile
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://rest.runpod.io/v1"
UA = "tinct-audio-orchestrator/1.0"
DEFAULT_IMAGE = "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
# Cheapest first; every one is well under the $1.00/hr ceiling.
DEFAULT_GPUS = ["NVIDIA GeForce RTX 3090", "NVIDIA RTX A4500", "NVIDIA RTX 4000 Ada Generation",
                "NVIDIA GeForce RTX 4090", "NVIDIA RTX A6000", "NVIDIA A40", "NVIDIA L4"]
MODEL_SHA256 = "f1fe271c349229677131d389a96d0a28062a6a2c2fee54a8ce119c43538315c5"
MODEL_REVISION = "d1d751a5f8271d482d14ca55d9e2deeebbae577f"


def now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def log(msg: str, sink: Path | None = None) -> None:
    line = f"[{now()}] {msg}"
    print(line, flush=True)
    if sink:
        with sink.open("a") as handle:
            handle.write(line + "\n")


def api(method: str, path: str, body: dict | None = None):
    key = os.environ.get("RUNPOD_API_KEY")
    if not key:
        raise SystemExit("RUNPOD_API_KEY is not set")
    request = urllib.request.Request(f"{API}{path}", method=method,
                                     data=json.dumps(body).encode() if body is not None else None,
                                     headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                                              "User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read()
            return response.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as error:
        return error.code, {"error": error.read().decode(errors="replace")[:600]}


def pod_get(pod_id: str) -> dict:
    status, body = api("GET", f"/pods/{pod_id}")
    if status != 200:
        raise RuntimeError(f"GET pod {pod_id}: HTTP {status} {body}")
    return body


def agent_get(base: str, token: str, path: str, timeout: int = 60) -> tuple[int, bytes]:
    request = urllib.request.Request(base + path, headers={"X-Tinct-Token": token, "User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()
    except Exception as error:  # noqa: BLE001 — proxy not up yet, resets, timeouts
        return 0, str(error).encode()


def create_pod(args, batch: list[dict], token: str) -> dict:
    env = {
        "TINCT_TOKEN": token,
        "TINCT_TARGETS": json.dumps(batch, separators=(",", ":")),
        "TINCT_COMMIT": args.commit,
        "TINCT_MODEL_SHA256": MODEL_SHA256,
        "TINCT_MODEL_REVISION": MODEL_REVISION,
        "TINCT_MAX_SECONDS": str(args.max_seconds),
        "TINCT_ARMS": args.arms,
        "TINCT_COMPUTE_TYPE": args.compute_type,
        "TINCT_DEVICE": "cuda",
        "TINCT_HELPER": args.helper,
        "PORT": "8000",
    }
    start = ("mkdir -p /workspace/run && cd /workspace/run && "
             f"curl -fsSL -o pod_job.py https://raw.githubusercontent.com/anderskhv/tinct/{args.commit}"
             "/tools/audio-highlight/gpu/pod_job.py && exec python3 pod_job.py")
    body = {
        "name": args.name,
        "imageName": args.image,
        "cloudType": args.cloud,
        "computeType": "GPU",
        "gpuCount": 1,
        "gpuTypeIds": args.gpus,
        "gpuTypePriority": "availability",
        "containerDiskInGb": 20,
        "volumeInGb": 0,
        "ports": ["8000/http"],
        "env": env,
        "dockerEntrypoint": ["bash", "-lc"],
        "dockerStartCmd": [start],
        "interruptible": False,
    }
    status, pod = api("POST", "/pods", body)
    if status not in (200, 201):
        raise RuntimeError(f"create pod: HTTP {status} {pod}")
    return pod


def stop_and_terminate(pod_id: str, sink: Path, record: dict) -> None:
    status, body = api("POST", f"/pods/{pod_id}/stop")
    log(f"stop {pod_id}: HTTP {status}", sink)
    record["stopRequestedAt"] = now()
    for _ in range(24):
        try:
            pod = pod_get(pod_id)
        except Exception as error:  # noqa: BLE001
            log(f"poll after stop: {error}", sink)
            time.sleep(5)
            continue
        if pod.get("desiredStatus") != "RUNNING":
            break
        time.sleep(5)
    record["statusAfterStop"] = pod.get("desiredStatus") if isinstance(pod, dict) else None
    record["stoppedAt"] = now()
    status, body = api("DELETE", f"/pods/{pod_id}")
    log(f"terminate {pod_id}: HTTP {status}", sink)
    record["terminatedAt"] = now()
    record["terminateHttp"] = status


def run(args) -> int:
    batch = json.loads(Path(args.batch).read_text())
    pod_dir = Path(args.artifacts) / "pods" / args.name
    pod_dir.mkdir(parents=True, exist_ok=True)
    sink = pod_dir / "orchestrator.log"
    token = secrets.token_urlsafe(24)
    (pod_dir / "batch.json").write_text(json.dumps(batch, indent=1))
    record = {"name": args.name, "commit": args.commit, "batch": len(batch), "createdAt": now(),
              "maxSeconds": args.max_seconds, "arms": args.arms, "computeType": args.compute_type}
    ledger = pod_dir / "pod.json"

    def save():
        ledger.write_text(json.dumps(record, indent=1))

    pod = create_pod(args, batch, token)
    pod_id = pod["id"]
    record.update(podId=pod_id, gpu=(pod.get("machine") or {}).get("gpuDisplayName") or pod.get("gpuTypeId"),
                  costPerHr=pod.get("costPerHr"), image=pod.get("image"), cloud=args.cloud)
    save()
    log(f"created {pod_id} {args.name} gpu={record['gpu']} ${record['costPerHr']}/hr", sink)
    base = f"https://{pod_id}-8000.proxy.runpod.net"
    started = time.time()
    outcome = "unknown"
    try:
        # 1. wait for the pod to run and the status server to answer
        ready = False
        while time.time() - started < args.boot_timeout:
            pod = pod_get(pod_id)
            record["costPerHr"] = pod.get("costPerHr") or record["costPerHr"]
            record["gpu"] = (pod.get("machine") or {}).get("gpuDisplayName") or record["gpu"]
            code, body = agent_get(base, token, "/status", timeout=20)
            if code == 200:
                ready = True
                break
            log(f"waiting: pod {pod.get('desiredStatus')} agent HTTP {code}", sink)
            time.sleep(15)
        if not ready:
            outcome = "boot-timeout"
            raise RuntimeError("status server never answered")
        record["agentUpAt"] = now()
        save()

        # 2. poll until done or deadline. Snapshot the output tree periodically
        #    so that a pod stopped from outside (another guard, a host failure)
        #    loses at most a few minutes of completed chapters.
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
                pod = pod_get(pod_id)
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
            progress = status.get("progress", {})
            log(f"{elapsed:.1f} min: {phase} {json.dumps(progress)}", sink)
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

        # 3. pull results
        for name in ["status.json", "targets.json", "cohort.log", "trial.log", "cohort/cohort-dropped.json",
                     "out/run.json", "out/process.log"]:
            code, body = agent_get(base, token, f"/file?path={name}", timeout=60)
            if code == 200:
                target = pod_dir / name.replace("/", "__")
                target.write_bytes(body)
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
        stop_and_terminate(pod_id, sink, record)
        save()
        log(f"pod {pod_id} done: outcome={outcome} uptime={record['uptimeMinutes']}m "
            f"est ${record['estimatedCost']:.2f}", sink)
    return 0 if record.get("resultsFetched") else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("run")
    p.add_argument("--name", required=True)
    p.add_argument("--batch", required=True)
    p.add_argument("--commit", required=True)
    p.add_argument("--artifacts", required=True)
    p.add_argument("--image", default=DEFAULT_IMAGE)
    p.add_argument("--gpus", nargs="+", default=DEFAULT_GPUS)
    p.add_argument("--cloud", default="COMMUNITY", choices=["COMMUNITY", "SECURE"])
    p.add_argument("--max-seconds", type=int, default=2100, help="trial.py worker cap")
    p.add_argument("--arms", default="off auto")
    p.add_argument("--compute-type", default="float16", choices=["float16", "int8"])
    p.add_argument("--helper", default="v2", choices=["v1", "v2"],
                   help="pinned helper revision the pod aligns with (PINS.md)")
    p.add_argument("--boot-timeout", type=int, default=900)
    p.add_argument("--deadline-minutes", type=float, default=44.0,
                   help="collect and stop at this uptime, below the guard's 50")
    p.add_argument("--poll-seconds", type=int, default=30)
    p.add_argument("--snapshot-seconds", type=int, default=240,
                   help="while aligning, pull the output tree this often so an external stop loses little")
    s = sub.add_parser("stop")
    s.add_argument("pod_id")
    s.add_argument("--artifacts", required=True)
    args = parser.parse_args()
    if args.command == "run":
        return run(args)
    record = {}
    stop_and_terminate(args.pod_id, Path(args.artifacts) / "manual-stop.log", record)
    print(json.dumps(record, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
