"""Cloud-side spend and termination guard for GPU word-timing runs.

The existing guard (`app/tts/pod-watchdog.py`) runs on Anders's Mac. When that
machine sleeps, nothing stops a running pod and it keeps billing. This guard
does the same job from anywhere with outbound HTTPS — a scheduled GitHub
Actions run, a cloud session, or the pod itself — so termination no longer
depends on one laptop being awake.

Three independent limits, any one of which stops a pod:

  rate      a pod billing above --max-rate ($/hr) is stopped on sight
  deadline  a pod running longer than --max-minutes is stopped
  budget    once accumulated spend crosses --budget, every owned pod is stopped

It only ever acts on pods whose name starts with --owner-prefix. Pods outside
that prefix are reported and left alone — retained resources are not ours to
remove.

Credential: RUNPOD_API_KEY in the environment. Never pass it on the command
line and never print it.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://rest.runpod.io/v1"
DEFAULT_OWNER_PREFIX = "tinct-wordtiming-"


def _call(method: str, path: str, key: str, body: dict | None = None):
    request = urllib.request.Request(
        f"{API}{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "tinct-runpod-guard/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = response.read()
            return response.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")[:400]
        return error.code, {"error": detail}


def list_pods(key: str) -> list[dict]:
    status, body = _call("GET", "/pods", key)
    if status != 200:
        raise SystemExit(f"RunPod list failed (HTTP {status}): {(body or {}).get('error')}")
    pods = body if isinstance(body, list) else (body or {}).get("data") or []
    rows = []
    for pod in pods:
        runtime = pod.get("runtime") or {}
        rows.append({
            "id": pod.get("id"),
            "name": pod.get("name") or "",
            "status": pod.get("desiredStatus") or pod.get("status"),
            "costPerHr": pod.get("costPerHr"),
            "uptimeSeconds": runtime.get("uptimeInSeconds"),
            "gpu": (pod.get("machine") or {}).get("gpuDisplayName") or pod.get("gpuTypeId"),
        })
    return rows


def stop_pod(key: str, pod_id: str, terminate: bool) -> tuple[int, dict | None]:
    if terminate:
        return _call("DELETE", f"/pods/{pod_id}", key)
    return _call("POST", f"/pods/{pod_id}/stop", key)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", choices=["status", "enforce", "stop-all"])
    parser.add_argument("--owner-prefix", default=DEFAULT_OWNER_PREFIX)
    parser.add_argument("--max-rate", type=float, default=1.00, help="$/hr ceiling per pod")
    parser.add_argument("--max-minutes", type=float, default=50.0, help="wall-clock deadline per pod")
    parser.add_argument("--budget", type=float, default=25.00, help="total $ envelope")
    parser.add_argument("--spent", type=float, default=0.0, help="$ already spent before this check")
    parser.add_argument("--terminate", action="store_true", help="delete rather than stop an owned pod")
    parser.add_argument("--apply", action="store_true", help="actually act; without it this is a dry run")
    parser.add_argument("--json-out")
    args = parser.parse_args()

    key = os.environ.get("RUNPOD_API_KEY")
    if not key:
        print("RUNPOD_API_KEY is not set — this guard cannot see or stop any pod.", file=sys.stderr)
        return 2

    pods = list_pods(key)
    owned = [p for p in pods if p["name"].startswith(args.owner_prefix)]
    foreign = [p for p in pods if not p["name"].startswith(args.owner_prefix)]

    live = [p for p in owned if (p["uptimeSeconds"] or 0) > 0 or p["status"] == "RUNNING"]
    running_cost = sum((p["costPerHr"] or 0) * (p["uptimeSeconds"] or 0) / 3600 for p in live)
    total_spend = args.spent + running_cost

    actions = []
    for pod in owned:
        reasons = []
        rate = pod["costPerHr"] or 0
        minutes = (pod["uptimeSeconds"] or 0) / 60
        if rate > args.max_rate:
            reasons.append(f"rate ${rate:.3f}/hr over ${args.max_rate:.2f}/hr")
        if minutes > args.max_minutes:
            reasons.append(f"uptime {minutes:.1f} min over {args.max_minutes:.0f} min")
        if total_spend > args.budget:
            reasons.append(f"envelope ${total_spend:.2f} over ${args.budget:.2f}")
        if args.command == "stop-all":
            reasons.append("stop-all requested")
        if reasons and pod["status"] != "EXITED":
            actions.append({"pod": pod, "reasons": reasons})

    report = {
        "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "ownerPrefix": args.owner_prefix,
        "ownedPods": owned,
        "foreignPodsLeftAlone": [{"id": p["id"], "name": p["name"], "status": p["status"]} for p in foreign],
        "estimatedRunningCost": round(running_cost, 4),
        "estimatedTotalSpend": round(total_spend, 4),
        "budget": args.budget,
        "actions": [{"id": a["pod"]["id"], "name": a["pod"]["name"], "reasons": a["reasons"]} for a in actions],
        "applied": bool(args.apply),
    }

    print(f"owned pods: {len(owned)}   other pods left alone: {len(foreign)}")
    for pod in owned:
        print(f"  {pod['id']} {pod['name']} {pod['status']} "
              f"${pod['costPerHr']}/hr up {(pod['uptimeSeconds'] or 0)/60:.1f}m {pod['gpu']}")
    print(f"estimated spend this envelope: ${total_spend:.2f} of ${args.budget:.2f}")

    for action in actions:
        pod = action["pod"]
        verb = "TERMINATE" if args.terminate else "STOP"
        print(f"  {verb} {pod['id']} {pod['name']}: {'; '.join(action['reasons'])}")
        if args.apply:
            status, body = stop_pod(key, pod["id"], args.terminate)
            ok = status in (200, 201, 202, 204)
            print(f"    -> HTTP {status} {'ok' if ok else (body or {}).get('error', '')}")
            action["result"] = {"status": status, "ok": ok}

    if args.json_out:
        with open(args.json_out, "w") as handle:
            json.dump(report, handle, indent=1)

    if actions and not args.apply:
        print("dry run — re-run with --apply to act")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
