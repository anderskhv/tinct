#!/usr/bin/env python3
"""Pod watchdog — keeps pods at near-100% utilization, kills idle/stalled pods.

Fixes from prior version:
1. Polls every 5 min (was 20 min) — stalls detected 4× faster.
2. Stalls trip at 10 min unchanged log (was 20 min) — most chapters finish in <15 min.
3. **Always stops pods via API on DONE** — was only removing from watch, leaving
   orphans burning $0.69/hr. This was the #1 source of waste.
4. Bootstrap-stuck detection: if a pod has been RUNNING for >15 min and the
   launcher log has zero R2 uploads, kill it — the bootstrap script likely failed.
5. Cost tracking — accumulates $/pod/hr into /tmp/pod-watchdog-cost.json so we
   can see exactly what we're paying for.

Usage:
  pkill -f pod-watchdog.py
  nohup python3 /Users/andershvelplund/Documents/Projects/Tinct/app/tts/pod-watchdog.py \\
    > /tmp/pod-watchdog.log 2>&1 &

Edit /tmp/pod-watchdog-watch.json to add/remove pods. Reloaded every cycle.
"""
import json
import os
import re
import subprocess
import time
from pathlib import Path

WATCH_FILE = Path("/tmp/pod-watchdog-watch.json")
COST_FILE = Path("/tmp/pod-watchdog-cost.json")
POLL_INTERVAL = 5 * 60          # 5 minutes (was 20)
STALL_THRESHOLD = 10 * 60       # 10 minutes log unchanged → stall (was 20)
BOOTSTRAP_TIMEOUT = 15 * 60     # 15 minutes RUNNING with zero R2 uploads → kill
CLOUD_AUDIO_PY = "/Users/andershvelplund/Documents/Projects/Tinct/app/tts/cloud-audio.py"


def now():
    return time.strftime('%Y-%m-%d %H:%M:%S')


def log(msg):
    print(f"[{now()}] {msg}", flush=True)


def keychain(service):
    r = subprocess.run(["security", "find-generic-password", "-a", os.environ["USER"], "-s", service, "-w"],
                       capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def get_runpod():
    import runpod
    runpod.api_key = keychain("RUNPOD_API_KEY")
    return runpod


def load_watch():
    if not WATCH_FILE.exists():
        return {}
    try:
        return json.loads(WATCH_FILE.read_text())
    except Exception:
        return {}


def save_watch(data):
    WATCH_FILE.write_text(json.dumps(data, indent=2))


def load_cost():
    if not COST_FILE.exists():
        return {"total_usd": 0.0, "by_pod": {}, "last_tick": time.time()}
    try:
        return json.loads(COST_FILE.read_text())
    except Exception:
        return {"total_usd": 0.0, "by_pod": {}, "last_tick": time.time()}


def save_cost(data):
    COST_FILE.write_text(json.dumps(data, indent=2))


def log_age_seconds(path):
    p = Path(path)
    if not p.exists():
        return None
    return time.time() - p.stat().st_mtime


def is_done(path):
    """Returns True if the launcher log indicates the job finished cleanly."""
    p = Path(path)
    if not p.exists():
        return False
    try:
        text = p.read_text(errors="replace")
    except Exception:
        return False
    return "ALL JOBS DONE" in text or "Job finished." in text


def has_r2_uploads(path):
    """True if THIS pod incarnation has uploaded to R2.

    Launcher logs are appended across pod restarts, so we must only consider
    content after the LAST 'Pod created:' marker — earlier 'R2' lines belong
    to dead pods.
    """
    p = Path(path)
    if not p.exists():
        return False
    try:
        text = p.read_text(errors="replace")
    except Exception:
        return False
    last_pod = text.rfind("Pod created:")
    tail = text[last_pod:] if last_pod >= 0 else text
    return "→ R2" in tail


def stop_pod_safe(rp, pod_id):
    """Stop a pod, swallow API errors. Returns True if confirmed stopped."""
    try:
        rp.stop_pod(pod_id)
        return True
    except Exception as e:
        log(f"    stop err for {pod_id} (ignoring): {e}")
        return False


def restart_pod(rp, old_pod_id, jobs, log_path, force=True):
    """Stop the stalled pod, launch a fresh one with the same JOBS."""
    log(f"  Stopping {old_pod_id}…")
    stop_pod_safe(rp, old_pod_id)

    cmd = ["python3", CLOUD_AUDIO_PY, "--auto-stop"]
    if force:
        cmd.append("--force")
    cmd.extend(jobs)

    log(f"  Re-launching: {' '.join(cmd[:6])}… ({len(jobs)//2} books)")
    restart_marker = f"══════ WATCHDOG RESTART {now()} ══════"
    with open(log_path, "ab") as outfile:
        outfile.write(f"\n\n{restart_marker}\n".encode())
        proc = subprocess.Popen(cmd, stdout=outfile, stderr=subprocess.STDOUT,
                                stdin=subprocess.DEVNULL, start_new_session=True)
    log(f"  Launched (pid {proc.pid}), polling for new pod ID (up to 5 min)…")

    # Poll every 15s for up to 5 min; pod creation typically takes 30s-3min.
    deadline = time.time() + 5 * 60
    while time.time() < deadline:
        time.sleep(15)
        try:
            text = Path(log_path).read_text(errors="replace")
            # Only look at content after our restart marker
            tail_start = text.rfind(restart_marker)
            tail = text[tail_start:] if tail_start >= 0 else text
            m = re.search(r"Pod created: (\S+)", tail)
            if m:
                new_pod_id = m.group(1)
                log(f"  New pod ID: {new_pod_id} (after {int(time.time() - (deadline - 5*60))}s)")
                return new_pod_id
        except Exception:
            pass
    log(f"  Timeout — couldn't parse new pod ID after 5 min. Will retry on next cycle.")
    return None


def get_pod_status(rp, pod_id):
    """Returns (desiredStatus, age_seconds_since_creation) or (None, None)."""
    try:
        p = rp.get_pod(pod_id)
        status = p.get("desiredStatus")
        # createdAt is "2026-04-30T10:23:16.000Z"
        created_str = p.get("machine", {}).get("podHostId") or p.get("lastStatusChange", "")
        # Best-effort: use lastStatusChange if available
        return status, p
    except Exception as e:
        return None, None


def tick_costs(rp, watch, cost):
    """Add elapsed-time cost for each watched pod since last tick."""
    nowt = time.time()
    elapsed_hours = (nowt - cost.get("last_tick", nowt)) / 3600.0
    for pid in watch:
        try:
            p = rp.get_pod(pid)
            if p and p.get("desiredStatus") == "RUNNING":
                rate = float(p.get("costPerHr", 0))
                spend = rate * elapsed_hours
                cost["total_usd"] = cost.get("total_usd", 0.0) + spend
                cost["by_pod"][pid] = cost["by_pod"].get(pid, 0.0) + spend
        except Exception:
            pass
    cost["last_tick"] = nowt
    save_cost(cost)


def main():
    log(f"Watchdog v2 starting. Poll {POLL_INTERVAL}s, stall {STALL_THRESHOLD}s, "
        f"bootstrap timeout {BOOTSTRAP_TIMEOUT}s.")
    log(f"Watch: {WATCH_FILE}  Cost: {COST_FILE}")

    rp = get_runpod()

    while True:
        watch = load_watch()
        cost = load_cost()
        tick_costs(rp, watch, cost)

        if not watch:
            log(f"(empty watch — total spend so far: ${cost.get('total_usd', 0):.2f})")
        else:
            log(f"--- session spend: ${cost.get('total_usd', 0):.2f} ---")
            for pod_id, info in list(watch.items()):
                log_path = info["log"]
                jobs = info["jobs"]
                age = log_age_seconds(log_path)
                done = is_done(log_path)

                if age is None:
                    log(f"{pod_id}: log {log_path} missing — skipping")
                    continue

                # 1. DONE → stop the pod via API (the orphan fix).
                if done:
                    log(f"{pod_id}: DONE — stopping pod via API and removing from watch.")
                    stop_pod_safe(rp, pod_id)
                    del watch[pod_id]
                    save_watch(watch)
                    continue

                uploads_started = has_r2_uploads(log_path)

                # 2. Bootstrap phase: pod is RUNNING but Kokoro hasn't uploaded
                #    anything yet. Tolerate this up to BOOTSTRAP_TIMEOUT, then kill.
                if not uploads_started:
                    if age > BOOTSTRAP_TIMEOUT:
                        log(f"{pod_id}: BOOTSTRAP STUCK — {age:.0f}s with zero R2 uploads. Killing.")
                        new_id = restart_pod(rp, pod_id, jobs, log_path)
                        del watch[pod_id]
                        if new_id:
                            watch[new_id] = info
                        save_watch(watch)
                    else:
                        log(f"{pod_id}: bootstrapping ({age:.0f}s, no uploads yet — waiting)")
                    continue

                # 3. Working phase: uploads have started. Stall threshold applies now.
                if age > STALL_THRESHOLD:
                    log(f"{pod_id}: STALL — log unchanged for {age:.0f}s (uploads had started). Restarting.")
                    new_id = restart_pod(rp, pod_id, jobs, log_path)
                    del watch[pod_id]
                    if new_id:
                        watch[new_id] = info
                    save_watch(watch)
                    continue

                log(f"{pod_id}: healthy ({age:.0f}s since last upload)")

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
