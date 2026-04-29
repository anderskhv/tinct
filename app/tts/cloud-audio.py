#!/usr/bin/env python3
"""End-to-end cloud audio generation: spin up a RunPod RTX 4090, run Kokoro
on the requested book/edition pairs, monitor, stop pod when done.

One command from the laptop:

    python3 cloud-audio.py ulysses original-en moby-dick modern-en

What it does:
1. Reads RUNPOD_API_KEY from macOS Keychain (security find-generic-password)
2. Reads CLOUDFLARE_API_TOKEN from app/.env
3. Calls RunPod API to deploy an RTX 4090 spot pod with PyTorch image
4. Polls until the pod is RUNNING and SSH is open
5. SSHes in, runs the bootstrap + Kokoro job inside a tmux session
6. Tails the job log to your terminal until it prints "ALL JOBS DONE."
7. Optionally stops the pod (--auto-stop) or leaves it for you to stop manually

Requirements (one-time):
    pip3 install --user runpod paramiko
    security add-generic-password -a "$USER" -s RUNPOD_API_KEY -w "<key>"

Optional flags:
    --gpu-type "NVIDIA GeForce RTX 4090"   (default)
    --auto-stop                             (stop pod when job finishes)
    --reuse-pod <pod_id>                    (skip pod creation, use existing)
    --no-bootstrap                          (skip bootstrap, assume pod has env ready)

Examples:
    # Single book:
    python3 cloud-audio.py the-republic modern-en

    # Multiple books, auto-stop when done:
    python3 cloud-audio.py --auto-stop ulysses original-en ulysses modern-en

    # Reuse a pod that's already set up:
    python3 cloud-audio.py --reuse-pod abc123 --no-bootstrap moby-dick original-en
"""
import argparse
import os
import shlex
import subprocess
import sys
import time
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
DEFAULT_GPU_TYPE = "NVIDIA GeForce RTX 4090"
PYTORCH_IMAGE = "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
VOLUME_GB = 50
CONTAINER_DISK_GB = 20
ENV_FILE = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/.env")
BOOTSTRAP_URL = "https://raw.githubusercontent.com/anderskhv/tinct/main/app/tts/runpod-bootstrap.sh"
SSH_USER = "root"
LOG_FILE_REMOTE = "/workspace/job.log"


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def keychain_get(service):
    r = subprocess.run(
        ["security", "find-generic-password", "-a", os.environ["USER"], "-s", service, "-w"],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        sys.exit(f"ERROR: {service} not in Keychain. Add it with:\n"
                 f"  security add-generic-password -a \"$USER\" -s {service} -w \"<value>\"")
    return r.stdout.strip()


def env_get(key, env_path=ENV_FILE):
    if not env_path.exists():
        sys.exit(f"ERROR: {env_path} not found")
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line.startswith(f"{key}=") or line.startswith(f"export {key}="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit(f"ERROR: {key} not found in {env_path}")


def runpod_init():
    try:
        import runpod
    except ImportError:
        sys.exit("ERROR: runpod SDK not installed. Run: pip3 install --user runpod")
    runpod.api_key = keychain_get("RUNPOD_API_KEY")
    return runpod


def find_gpu_type_id(rp, gpu_name):
    """RunPod uses friendly names directly as gpuTypeId, but verify availability."""
    try:
        gpus = rp.get_gpus()
    except Exception as e:
        log(f"WARN: couldn't list GPUs ({e}); using gpu_name as ID directly")
        return gpu_name
    matches = [g for g in gpus if gpu_name.lower() in g.get("displayName", "").lower()
               or gpu_name.lower() in g.get("id", "").lower()]
    if not matches:
        log(f"WARN: no exact match for '{gpu_name}'; using literal as ID")
        return gpu_name
    return matches[0]["id"]


def create_pod(rp, gpu_type_id, name="tinct-audio"):
    log(f"Creating pod with GPU '{gpu_type_id}'…")
    pod = rp.create_pod(
        name=name,
        image_name=PYTORCH_IMAGE,
        gpu_type_id=gpu_type_id,
        cloud_type="SECURE",  # SECURE = on-demand. Use "COMMUNITY" for spot.
        volume_in_gb=VOLUME_GB,
        container_disk_in_gb=CONTAINER_DISK_GB,
        volume_mount_path="/workspace",
        ports="22/tcp",
        support_public_ip=True,
        start_ssh=True,
    )
    log(f"Pod created: {pod['id']} (status={pod.get('desiredStatus','?')})")
    return pod


def wait_for_pod_ssh(rp, pod_id, timeout=300):
    log(f"Waiting for pod {pod_id} to be SSH-reachable…")
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            pod = rp.get_pod(pod_id)
        except Exception as e:
            log(f"  poll error ({e}); retrying")
            time.sleep(5)
            continue

        runtime = pod.get("runtime") or {}
        ports = runtime.get("ports") or []
        ssh_ports = [p for p in ports if p.get("privatePort") == 22 and p.get("isIpPublic")]
        if ssh_ports and pod.get("desiredStatus") == "RUNNING":
            ip = ssh_ports[0]["ip"]
            port = ssh_ports[0]["publicPort"]
            log(f"  pod RUNNING, SSH at {ip}:{port}")
            return ip, port, pod
        status = pod.get("desiredStatus", "?")
        log(f"  status={status}, ssh_ports={len(ssh_ports)}; waiting…")
        time.sleep(10)
    sys.exit(f"ERROR: pod {pod_id} not SSH-reachable within {timeout}s")


def ssh_exec(ip, port, command, *, capture=False, check=True):
    """Run a command on the pod via SSH. Returns CompletedProcess."""
    full = [
        "ssh",
        "-p", str(port),
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        "-o", "LogLevel=ERROR",
        f"{SSH_USER}@{ip}",
        command,
    ]
    return subprocess.run(full, capture_output=capture, text=True, check=check)


def ssh_stream(ip, port, command):
    """Stream stdout/stderr from a remote command (tail -f style)."""
    full = [
        "ssh",
        "-p", str(port),
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        "-o", "LogLevel=ERROR",
        f"{SSH_USER}@{ip}",
        command,
    ]
    return subprocess.Popen(full, stdout=sys.stdout, stderr=subprocess.STDOUT)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("jobs", nargs="+", help="Pairs: BOOK EDITION [BOOK EDITION ...]")
    p.add_argument("--gpu-type", default=DEFAULT_GPU_TYPE)
    p.add_argument("--auto-stop", action="store_true", help="Stop pod after job finishes")
    p.add_argument("--terminate", action="store_true", help="TERMINATE pod (wipe volume) after job")
    p.add_argument("--reuse-pod", help="Use existing pod ID instead of creating one")
    p.add_argument("--no-bootstrap", action="store_true", help="Skip bootstrap (pod must already be set up)")
    p.add_argument("--force", action="store_true", help="Pass --force to run-kokoro-cloud.py (regen even if R2 has audio)")
    args = p.parse_args()

    if len(args.jobs) % 2 != 0:
        sys.exit("ERROR: jobs must be pairs of BOOK EDITION")

    cf_token = env_get("CLOUDFLARE_API_TOKEN")
    log(f"Loaded CLOUDFLARE_API_TOKEN ({len(cf_token)} chars)")

    rp = runpod_init()
    log("Loaded RUNPOD_API_KEY from Keychain")

    if args.reuse_pod:
        ip, port, pod = wait_for_pod_ssh(rp, args.reuse_pod)
        pod_id = args.reuse_pod
    else:
        gpu_type_id = find_gpu_type_id(rp, args.gpu_type)
        pod = create_pod(rp, gpu_type_id)
        pod_id = pod["id"]
        ip, port, pod = wait_for_pod_ssh(rp, pod_id)

    if not args.no_bootstrap:
        log("Running bootstrap on pod…")
        ssh_exec(ip, port, f"curl -fsSL {BOOTSTRAP_URL} | bash")
        log("Bootstrap complete.")

    job_args = " ".join(shlex.quote(a) for a in args.jobs)
    force_flag = " --force" if args.force else ""
    remote_cmd = (
        f"export CLOUDFLARE_API_TOKEN={shlex.quote(cf_token)} && "
        f"cd /workspace/tinct/scripts && "
        f"tmux kill-session -t kokoro 2>/dev/null; "
        f"tmux new -d -s kokoro "
        f"'python3 run-kokoro-cloud.py{force_flag} {job_args} 2>&1 | tee {LOG_FILE_REMOTE}; "
        f"touch /workspace/job.done'"
    )
    log("Launching job in tmux on pod…")
    ssh_exec(ip, port, remote_cmd)

    log(f"Job started. Tailing {LOG_FILE_REMOTE} (Ctrl+C to detach; job keeps running on pod)…")
    log(f"  Pod: https://www.runpod.io/console/pods (id={pod_id})")
    log(f"  SSH: ssh -p {port} root@{ip}")
    log(f"  Reattach tmux: ssh -p {port} root@{ip} -t 'tmux attach -t kokoro'")
    print()

    # Tail the log until job.done appears
    try:
        tail_cmd = f"tail -F {LOG_FILE_REMOTE} & TAIL=$!; while [ ! -f /workspace/job.done ]; do sleep 5; done; kill $TAIL 2>/dev/null"
        ssh_stream(ip, port, tail_cmd).wait()
    except KeyboardInterrupt:
        print()
        log("Detached (job keeps running on pod). Reattach later with the SSH command above.")
        return 0

    log("Job finished.")
    if args.terminate:
        log(f"Terminating pod {pod_id}…")
        rp.terminate_pod(pod_id)
    elif args.auto_stop:
        log(f"Stopping pod {pod_id}…")
        rp.stop_pod(pod_id)
    else:
        log(f"Pod left running. Stop it manually at https://www.runpod.io/console/pods or rerun with --auto-stop.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
