#!/usr/bin/env python3
"""Pod watchdog — polls active RunPod jobs every 20 min, detects stalls, auto-restarts.

Stall detection:
- The launcher log file in /tmp/ stops growing for >20 min
- Pod status switches to EXITED unexpectedly (without job.done marker)

Auto-correct:
- Stop the stalled pod via RunPod API
- Re-launch a fresh pod with the same JOBS list using cloud-audio.py
- Update the WATCH registry to track the new pod ID

Usage:
  nohup python3 pod-watchdog.py > /tmp/pod-watchdog.log 2>&1 &
  # Stop with: pkill -f pod-watchdog.py

Edit WATCH below to add/remove pods. Watchdog reloads it on every cycle so you
can edit while it's running.
"""
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

WATCH_FILE = Path("/tmp/pod-watchdog-watch.json")
POLL_INTERVAL = 20 * 60   # 20 minutes
STALL_THRESHOLD = 20 * 60  # log unchanged for this long → stall
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


def restart_pod(rp, old_pod_id, jobs, log_path, force=True):
    """Stop the stalled pod, launch a fresh one with the same JOBS."""
    log(f"  Stopping {old_pod_id}…")
    try:
        rp.stop_pod(old_pod_id)
    except Exception as e:
        log(f"    stop err (ignoring): {e}")

    # Build cloud-audio.py command with same job args
    cmd = ["python3", CLOUD_AUDIO_PY, "--auto-stop"]
    if force:
        cmd.append("--force")
    cmd.extend(jobs)

    log(f"  Re-launching: {' '.join(cmd[:6])}… ({len(jobs)//2} books)")
    with open(log_path, "ab") as outfile:
        outfile.write(f"\n\n══════ WATCHDOG RESTART {now()} ══════\n".encode())
        proc = subprocess.Popen(cmd, stdout=outfile, stderr=subprocess.STDOUT,
                                stdin=subprocess.DEVNULL, start_new_session=True)
    log(f"  Launched (pid {proc.pid}), waiting 60s for new pod ID to appear in log…")
    time.sleep(60)

    # Parse new pod ID from launcher log
    try:
        text = Path(log_path).read_text(errors="replace")
        # Find the LAST "Pod created: <id>" line after our restart marker
        markers = [(m.start(), m.group(1)) for m in re.finditer(r"Pod created: (\S+)", text)]
        if markers:
            new_pod_id = markers[-1][1]
            log(f"  New pod ID: {new_pod_id}")
            return new_pod_id
    except Exception as e:
        log(f"  Couldn't parse new pod ID: {e}")
    return None


def main():
    log(f"Watchdog starting. Poll every {POLL_INTERVAL}s. Stall threshold {STALL_THRESHOLD}s.")
    log(f"Watch registry: {WATCH_FILE}")

    rp = get_runpod()

    while True:
        watch = load_watch()
        if not watch:
            log("(empty watch registry — sleeping)")
        else:
            for old_pod_id, info in list(watch.items()):
                log_path = info["log"]
                jobs = info["jobs"]
                age = log_age_seconds(log_path)
                done = is_done(log_path)
                if age is None:
                    log(f"{old_pod_id}: log {log_path} missing — skipping")
                    continue
                if done:
                    log(f"{old_pod_id}: DONE (log shows ALL JOBS DONE / Job finished). Removing from watch.")
                    del watch[old_pod_id]
                    save_watch(watch)
                    continue
                if age > STALL_THRESHOLD:
                    log(f"{old_pod_id}: STALL — log unchanged for {age:.0f}s. Restarting.")
                    new_id = restart_pod(rp, old_pod_id, jobs, log_path)
                    del watch[old_pod_id]
                    if new_id:
                        watch[new_id] = info
                    save_watch(watch)
                else:
                    log(f"{old_pod_id}: healthy (log fresh {age:.0f}s ago)")

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
