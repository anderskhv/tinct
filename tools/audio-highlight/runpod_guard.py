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
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://rest.runpod.io/v1"
# Every Tinct launcher names its pods from the "tinct-audio" base
# (app/tts/cloud-audio.py, run-kokoro-cloud.py), and the observed pods are
# tinct-audio-bounded-trial-* and tinct-words-shard-*. The prefix has to match
# what is actually used, or the guard classifies its own runaway pods as
# somebody else's and never stops them.
DEFAULT_OWNER_PREFIX = "tinct-"


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


def _parse_stamp(stamp: str) -> datetime.datetime | None:
    """A RunPod timestamp as an aware datetime, or None.

    RunPod's REST pod list returns `2026-09-11 12:35:42.57 +0000 UTC` — a space
    before the offset and a trailing ` UTC` — which `fromisoformat` rejects.
    The 2026-09-11 run lost two in-progress batches to exactly that: the guard
    read every live pod as unmeasurable and stopped it. ISO-8601 stays accepted.
    """
    text = str(stamp).strip().replace(" UTC", "")
    try:
        started = datetime.datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        started = None
        for fmt in ("%Y-%m-%d %H:%M:%S.%f %z", "%Y-%m-%d %H:%M:%S %z"):
            try:
                started = datetime.datetime.strptime(text, fmt)
                break
            except ValueError:
                continue
        if started is None:
            return None
    if started.tzinfo is None:
        started = started.replace(tzinfo=datetime.timezone.utc)
    return started


def _age_seconds(pod: dict) -> float | None:
    """Seconds since the pod started, from whichever timestamp the API gives us."""
    for field in ("lastStartedAt", "startedAt", "createdAt", "creationTime"):
        stamp = pod.get(field)
        if not stamp:
            continue
        started = _parse_stamp(stamp)
        if started is None:
            continue
        return max(0.0, (datetime.datetime.now(datetime.timezone.utc) - started).total_seconds())
    return None


# The envelope is a TOTAL, not a rate, so it cannot be read off the pods that
# happen to be alive right now. Before this ledger existed the guard printed
# "estimated spend $0.00" whenever nothing was running, which reads as "nothing
# has ever been spent" and is not what it measured — run 1 billed ~19 pods and
# every report after they exited still said $0.00. Cost is therefore accrued to
# a file: each pod's highest observed (rate x uptime) is remembered under its
# id, so a pod that has since exited still counts against the envelope.
#
# The known gap: a pod that starts and exits entirely between two guard runs is
# never observed and never accrued. The five-minute schedule and the 50-minute
# deadline make that unlikely, not impossible, so treat the total as a floor on
# spend rather than a precise figure.
DEFAULT_LEDGER = "artifacts/audio-highlight-spend-ledger.json"


def load_ledger(path: str) -> dict:
    try:
        with open(path) as handle:
            return json.load(handle)
    except (FileNotFoundError, ValueError):
        return {}


def accrue(ledger: dict, pods: list[dict], now: str) -> float:
    """Record each pod's highest observed cost and return the total accrued."""
    for pod in pods:
        rate = pod["costPerHr"] or 0
        uptime = pod["uptimeSeconds"] or 0
        entry = ledger.setdefault(pod["id"], {"name": pod["name"], "firstSeen": now})
        cost = round(rate * uptime / 3600, 4)
        # Uptime can reset or come back unmeasured; never let a later reading
        # lower a cost we have already seen billed.
        entry["estCost"] = max(entry.get("estCost", 0.0), cost)
        entry["costPerHr"] = rate
        entry["maxUptimeSeconds"] = max(entry.get("maxUptimeSeconds", 0), uptime)
        entry["lastSeen"] = now
    return round(sum(e.get("estCost", 0.0) for e in ledger.values()), 4)


def save_ledger(path: str, ledger: dict) -> None:
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with open(path, "w") as handle:
        json.dump(ledger, handle, indent=1, sort_keys=True)


def list_pods(key: str) -> list[dict]:
    status, body = _call("GET", "/pods", key)
    if status != 200:
        raise SystemExit(f"RunPod list failed (HTTP {status}): {(body or {}).get('error')}")
    pods = body if isinstance(body, list) else (body or {}).get("data") or []
    rows = []
    for pod in pods:
        runtime = pod.get("runtime") or {}
        # RunPod does not always populate runtime.uptimeInSeconds — it came back
        # 0 for four live pods on 2026-09-11, which silently zeroed both the
        # deadline check and the spend estimate. Fall back to the pod's own start
        # timestamp, and mark the uptime unmeasured when neither is available, so
        # an unenforceable pod is never mistaken for a compliant one.
        uptime = runtime.get("uptimeInSeconds")
        source = "runtime"
        if not uptime:
            uptime = _age_seconds(pod)
            source = "timestamp" if uptime is not None else "unknown"
        rows.append({
            "id": pod.get("id"),
            "name": pod.get("name") or "",
            "status": pod.get("desiredStatus") or pod.get("status"),
            "costPerHr": pod.get("costPerHr"),
            "uptimeSeconds": uptime,
            "uptimeSource": source,
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
    parser.add_argument("--spent", type=float, default=0.0,
                        help="$ spent before the ledger existed; added to the accrued total")
    parser.add_argument("--ledger", default=DEFAULT_LEDGER,
                        help="file accruing each pod's observed cost so exited pods still count")
    parser.add_argument("--no-ledger", action="store_true",
                        help="do not read or write the ledger (spend is then current burn only)")
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

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if args.no_ledger:
        accrued = running_cost
        ledger = {}
    else:
        ledger = load_ledger(args.ledger)
        accrued = accrue(ledger, owned, now)
    total_spend = args.spent + accrued

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
        if pod["status"] == "RUNNING" and pod["uptimeSource"] == "unknown":
            # We cannot tell how long it has been billing, so we cannot promise
            # the deadline or the envelope holds. Stop it rather than guess.
            reasons.append("uptime is unmeasurable, so neither the deadline nor "
                           "the envelope can be enforced for it")
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
        "ledger": args.ledger if not args.no_ledger else None,
        "podsAccrued": len(ledger),
        "budget": args.budget,
        "actions": [{"id": a["pod"]["id"], "name": a["pod"]["name"], "reasons": a["reasons"]} for a in actions],
        "applied": bool(args.apply),
    }

    print(f"owned pods: {len(owned)}   other pods left alone: {len(foreign)}")
    for pod in owned:
        print(f"  {pod['id']} {pod['name']} {pod['status']} "
              f"${pod['costPerHr']}/hr up {(pod['uptimeSeconds'] or 0)/60:.1f}m "
              f"({pod['uptimeSource']}) {pod['gpu']}")
    if not args.no_ledger:
        save_ledger(args.ledger, ledger)
    print(f"spend accrued to date: ${total_spend:.2f} of ${args.budget:.2f} "
          f"(billing right now: ${running_cost:.2f})")

    # A pod we do not own but which is running and billing is the one case the
    # guard cannot act on. Say so loudly rather than leaving it in a list of
    # exited pods where nobody will notice it.
    hot = [p for p in foreign
           if p["status"] == "RUNNING" and (p["costPerHr"] or 0) > 0]
    for pod in hot:
        print(f"::warning::unowned pod {pod['id']} ({pod['name']}) is RUNNING at "
              f"${pod['costPerHr']}/hr and is outside the owner prefix, so this guard "
              f"will not stop it")
    report["unownedRunningPods"] = [{"id": p["id"], "name": p["name"],
                                     "costPerHr": p["costPerHr"]} for p in hot]

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
