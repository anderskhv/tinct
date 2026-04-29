#!/usr/bin/env python3
"""Read-only status check for RunPod audio jobs.

Lists all running pods, SSHes in, summarizes the kokoro tmux log:
- Which book/edition is currently processing
- How many chapters done, paragraphs/sec pace
- Estimated time to completion
- Any errors

No interactive prompts. Designed to be invoked autonomously from Claude or shell.
Fails soft on missing credentials — prints what it can.

Usage:
    python3 cloud-audio-status.py           # all running pods
    python3 cloud-audio-status.py --pod ID  # specific pod
    python3 cloud-audio-status.py --tail 50 # show last 50 log lines per pod
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from datetime import datetime
from email.utils import parsedate_to_datetime

# R2 public URLs block default Python UA — always send a browser UA
UA = {"User-Agent": "Mozilla/5.0 (TinctStatusBot)"}
R2_BASE = "https://pub-c34df89c93284423a39b03537595c2e2.r2.dev"
EDITIONS_URL = "https://raw.githubusercontent.com/anderskhv/tinct/main/app/public/data/editions"


def http_head(url, timeout=4):
    req = urllib.request.Request(url, method="HEAD", headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception:
        return None, {}


def http_get_json(url, timeout=8):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except Exception:
        return None


def r2_chapter_status(book, edition, ch_num):
    """Returns (exists, fresh_today). fresh_today means generated after noon today."""
    url = f"{R2_BASE}/{book}/{edition}/ch{ch_num}/manifest.json"
    code, headers = http_head(url)
    if code != 200:
        return False, False
    lm = headers.get("Last-Modified") or headers.get("last-modified")
    if not lm:
        return True, False
    try:
        dt = parsedate_to_datetime(lm).replace(tzinfo=None)
        today_noon = datetime.utcnow().replace(hour=10, minute=0, second=0, microsecond=0)  # 12:00 CEST = 10:00 UTC
        return True, dt > today_noon
    except Exception:
        return True, False


def get_api_key():
    r = subprocess.run(
        ["security", "find-generic-password", "-a", os.environ["USER"], "-s", "RUNPOD_API_KEY", "-w"],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        sys.exit("ERROR: RUNPOD_API_KEY not in Keychain")
    return r.stdout.strip()


def init_runpod():
    try:
        import runpod
    except ImportError:
        sys.exit("ERROR: runpod SDK not installed. pip3 install --user runpod")
    runpod.api_key = get_api_key()
    return runpod


def list_pods(rp):
    return rp.get_pods() or []


def get_ssh_info(pod):
    """Extract public SSH host:port from pod runtime info."""
    runtime = pod.get("runtime") or {}
    ports = runtime.get("ports") or []
    for p in ports:
        if p.get("privatePort") == 22 and p.get("isIpPublic"):
            return p.get("ip"), p.get("publicPort")
    return None, None


def ssh_run(ip, port, command, timeout=15):
    """Run a command on the pod via SSH. Returns (returncode, stdout, stderr)."""
    full = [
        "ssh",
        "-p", str(port),
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        "-o", "LogLevel=ERROR",
        "-o", f"ConnectTimeout={timeout}",
        "-o", "BatchMode=yes",
        f"root@{ip}",
        command,
    ]
    try:
        r = subprocess.run(full, capture_output=True, text=True, timeout=timeout + 5)
        return r.returncode, r.stdout, r.stderr
    except subprocess.TimeoutExpired:
        return 124, "", "SSH timed out"


# ── Log parsing ────────────────────────────────────────────────────────────
CHAPTER_RE = re.compile(r"\[(?P<ts>[\d\- :]+)\]\s+ch(?P<num>\d+):\s+(?P<paras>\d+)p.*?\((?P<elapsed>\d+)s\)")
JOB_HEADER_RE = re.compile(r"═══\s+(?P<book>[\w-]+)\s+/\s+(?P<edition>[\w-]+):\s+(?P<chapters>\d+)\s+chapters\s+═══")
JOB_DONE_RE = re.compile(r"═══\s+(?P<book>[\w-]+)/(?P<edition>[\w-]+)\s+DONE")
ALL_DONE_RE = re.compile(r"ALL JOBS DONE\.")


def parse_log(text):
    """Return dict with current job, chapters processed, pace, status."""
    lines = text.splitlines()
    current_book = None
    current_edition = None
    current_chapters_total = None
    chapters_done_in_current = 0
    finished_jobs = []
    chapter_times = []
    last_event_ts = None
    all_done = False

    for line in lines:
        m = JOB_HEADER_RE.search(line)
        if m:
            current_book = m.group("book")
            current_edition = m.group("edition")
            current_chapters_total = int(m.group("chapters"))
            chapters_done_in_current = 0
            continue

        m = JOB_DONE_RE.search(line)
        if m:
            finished_jobs.append((m.group("book"), m.group("edition")))
            current_book = None
            chapters_done_in_current = 0
            continue

        m = CHAPTER_RE.search(line)
        if m:
            chapters_done_in_current += 1
            chapter_times.append(int(m.group("elapsed")))
            last_event_ts = m.group("ts")
            continue

        if ALL_DONE_RE.search(line):
            all_done = True

    # Use last 5 chapter times for pace
    recent = chapter_times[-5:] if chapter_times else []
    avg_chapter_secs = sum(recent) / len(recent) if recent else None

    return {
        "all_done": all_done,
        "finished_jobs": finished_jobs,
        "current_book": current_book,
        "current_edition": current_edition,
        "current_chapters_total": current_chapters_total,
        "chapters_done_in_current": chapters_done_in_current,
        "total_chapters_recorded": len(chapter_times),
        "avg_chapter_secs": avg_chapter_secs,
        "last_event_ts": last_event_ts,
    }


def fmt_duration(secs):
    if secs is None:
        return "?"
    secs = int(secs)
    if secs < 60:
        return f"{secs}s"
    if secs < 3600:
        return f"{secs//60}m {secs%60}s"
    return f"{secs//3600}h {(secs%3600)//60}m"


STALE_BACKLOG = [
    ("ulysses", "original-en"), ("ulysses", "modern-en"),
    ("moby-dick", "original-en"), ("moby-dick", "modern-en"),
    ("meditations", "modern-en"),
    ("great-expectations", "original-en"), ("great-expectations", "modern-en"),
    ("imitation-of-christ", "original-en"), ("imitation-of-christ", "modern-en"),
    ("phaedo", "original-en"), ("phaedo", "modern-en"),
    ("crime-and-punishment", "modern-en"),
    ("jane-eyre", "modern-en"),
    ("pride-and-prejudice", "modern-en"),
    ("war-and-peace", "original-en"), ("war-and-peace", "modern-en"),
    ("jerusalem", "original-en"), ("jerusalem", "modern-en"),
    ("the-republic", "modern-en"),
    ("confessions", "original-en"),
]


def edition_chapter_count(book, edition):
    d = http_get_json(f"{EDITIONS_URL}/{book}-{edition}.json")
    return len(d.get("chapters", [])) if d else None


def r2_progress_summary(books=STALE_BACKLOG):
    """For each book/edition, walk chapters until we hit one not on R2.
    Returns list of (book, edition, done, total, fresh_today)."""
    rows = []
    for book, edition in books:
        total = edition_chapter_count(book, edition)
        if not total:
            rows.append((book, edition, 0, 0, 0))
            continue
        done, fresh = 0, 0
        for n in range(1, total + 1):
            exists, is_fresh = r2_chapter_status(book, edition, n)
            if not exists:
                break
            done = n
            if is_fresh:
                fresh += 1
        rows.append((book, edition, done, total, fresh))
    return rows


def print_r2_progress():
    print("━━━ R2 progress (stale-audio backlog) ━━━")
    rows = r2_progress_summary()
    print(f"  {'book/edition':<35} {'done':<10} {'fresh today':<12} {'%':>6}")
    total_done = total_chapters = total_fresh = 0
    for book, edition, done, total, fresh in rows:
        if total == 0:
            continue
        pct = 100 * done / total if total else 0
        marker = "✓" if done == total else " "
        print(f"  {marker} {book+'/'+edition:<33} {done}/{total:<7} {fresh:<12} {pct:>5.1f}%")
        total_done += done
        total_chapters += total
        total_fresh += fresh
    print(f"  {'TOTAL':<35} {total_done}/{total_chapters} chapters ({100*total_done/total_chapters:.1f}%), {total_fresh} fresh today")


def summarize_pod(pod, tail_lines=15):
    pod_id = pod.get("id", "?")
    name = pod.get("name", "?")
    status = pod.get("desiredStatus", "?")
    machine = pod.get("machine") or {}
    gpus = machine.get("gpuTypeId") or "?"
    cost = pod.get("costPerHr", "?")
    print(f"━━━ Pod {pod_id} ({name}) ━━━")
    print(f"  Status: {status}  GPU: {gpus}  Cost: ${cost}/hr")

    if status != "RUNNING":
        return

    ip, port = get_ssh_info(pod)
    if not ip:
        print(f"  (no public SSH yet — pod still booting?)")
        return
    print(f"  SSH: ssh -p {port} root@{ip}")

    # Pull job log + tmux session info
    rc, out, err = ssh_run(ip, port,
        "test -f /workspace/job.log && wc -l /workspace/job.log; "
        "tmux ls 2>/dev/null; "
        "tail -200 /workspace/job.log 2>/dev/null | tail -" + str(tail_lines) + " ; "
        "ls /workspace/job.done 2>/dev/null && echo DONE_FILE_EXISTS"
    )
    if rc != 0:
        print(f"  SSH error ({rc}): {err.strip()[:200]}")
        return

    sections = out.split("\n")
    # Show summary (parse the FULL log via second SSH for accurate stats)
    rc2, full_log, _ = ssh_run(ip, port, "cat /workspace/job.log 2>/dev/null")
    if rc2 == 0 and full_log.strip():
        info = parse_log(full_log)
        if info["all_done"]:
            print("  STATUS: ALL JOBS DONE. ✓")
        elif info["current_book"]:
            ch_done = info["chapters_done_in_current"]
            ch_total = info["current_chapters_total"] or "?"
            pace = info["avg_chapter_secs"]
            print(f"  Now: {info['current_book']}/{info['current_edition']}  ch{ch_done}/{ch_total}  pace: {fmt_duration(pace)}/chapter")
            if pace and isinstance(ch_total, int):
                remaining_in_current = (ch_total - ch_done) * pace
                print(f"  Remaining in current book: ~{fmt_duration(remaining_in_current)}")
        if info["finished_jobs"]:
            done_str = ", ".join(f"{b}/{e}" for b, e in info["finished_jobs"])
            print(f"  Finished jobs: {done_str}")

    # Show last N raw lines
    print(f"  Last {tail_lines} log lines:")
    for line in sections[-tail_lines:]:
        if line.strip():
            print(f"    {line}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--pod", help="Specific pod ID (default: all running)")
    p.add_argument("--tail", type=int, default=15, help="Number of log lines per pod")
    args = p.parse_args()

    rp = init_runpod()
    pods = list_pods(rp)

    if not pods:
        print("No active pods.")
        return 0

    if args.pod:
        pods = [p for p in pods if p.get("id") == args.pod]
        if not pods:
            sys.exit(f"Pod {args.pod} not found")

    print(f"Active pods: {len(pods)}")
    print()
    for pod in pods:
        summarize_pod(pod, tail_lines=args.tail)
        print()

    # Always print R2 progress (works without SSH access)
    print_r2_progress()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
