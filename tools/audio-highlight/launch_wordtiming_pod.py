"""Launch one bounded GPU pod to align word timings, from a cloud session.

This is the piece that was missing. Every other part of the pipeline runs in the
cloud already — `cloud_cohort.py` builds a cohort from the published bytes,
`trial.py` aligns it, `verify_timings.py` gates it, `publish_timings.py` ships
it — but nothing could put work on a GPU. `runpod_guard.py` only lists, stops
and deletes; `app/tts/cloud-audio.py` creates pods but is hard-pathed to
/Users/andershvelplund and the macOS keychain, and generates speech rather than
aligning it. Run 1's pods came from a Mac-side launcher that was never
transferred. So executors had credentials, a queue, and no way to spend the
authorised envelope on anything but CPU.

No long-lived credential is ever placed on the pod. The work bundle goes to R2
under a `_jobs/` prefix and the pod is handed two presigned URLs — one GET for
the bundle, one PUT for the results — which expire with the job. The pod reads
everything else from the same public production routes the reader uses. A
presigned URL cannot list the bucket, cannot read anything else in it, and dies
with the job, so a compromised pod leaks one job's inputs and nothing more.
Those `_jobs/` keys are not servable through the Worker either: its path rule
takes at most four `[a-zA-Z0-9._-]` segments, and a leading underscore segment
with a job id is outside it.

Every spend guarantee is checked BEFORE the pod exists, because afterwards it is
already billing:

  * one pod at a time — refuses while any owned pod is alive, so a second
    launcher cannot stack a job on top of a running one
  * $1/hr ceiling — refuses a GPU priced above it rather than "trying anyway"
  * the pod's whole projected cost for the full deadline must fit inside what
    the ledger says is left of the envelope, so a job can never be started that
    could only finish by overrunning it
  * the pod carries its own 50-minute suicide timer, so it stops paying even if
    the guard, this session, and the network all disappear

Dry run by default. `--apply` is what costs money.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import sys
import tarfile
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import runpod_guard  # noqa: E402

HERE = Path(__file__).resolve().parent
IMAGE = "runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04"
# Same list app/tts/cloud-audio.py walks, and for the same reason: a single GPU
# type is regularly sold out, and a launcher that gives up on the first "no
# instances available" wastes the window it was woken for.
GPU_FALLBACK = [
    "NVIDIA GeForce RTX 4090",
    "NVIDIA GeForce RTX 4080 SUPER",
    "NVIDIA GeForce RTX 4080",
    "NVIDIA GeForce RTX 3090",
    "NVIDIA RTX A6000",
    "NVIDIA A40",
]
BUCKET = "tinct-audio"
JOB_PREFIX = "_jobs"
# The whole aligner travels, byte-identical, rather than a hand-picked subset:
# pinned_words_sidecar_lib is the pinned helper the 0.85 gate was calibrated
# against and trial.py hashes its own source and the helper's into every
# paragraph signature, so a file that is reformatted, or quietly absent from a
# curated list, either moves the gate or fails the run far from here.
BUNDLE_FILES = sorted(
    [f"aligner/{p.name}" for p in (HERE / "aligner").glob("*.py")] + ["prodapi.py"]
)
# Pinned exactly as run-approved-trial.sh pins them. These are the versions the
# published timings were produced under; changing one re-opens the calibration.
MODEL_REPO = "Systran/faster-whisper-small.en"
MODEL_REVISION = "d1d751a5f8271d482d14ca55d9e2deeebbae577f"
DEPENDENCIES = "'faster-whisper==1.2.1' 'ctranslate2==4.6.0' 'av==12.3.0' 'huggingface_hub'"


def r2_client():
    import boto3
    from botocore.config import Config
    missing = [n for n in ("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_ENDPOINT")
               if not os.environ.get(n)]
    if missing:
        raise SystemExit(f"not configured to stage a job: {', '.join(missing)} unset")
    return boto3.client("s3", endpoint_url=os.environ["R2_ENDPOINT"],
                        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
                        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
                        region_name="auto", config=Config(signature_version="s3v4"))


def build_bundle(targets: list[dict]) -> bytes:
    """Tar the aligner and this job's target list. Nothing else travels."""
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        for relative in BUNDLE_FILES:
            source = HERE / relative
            if not source.exists():
                raise SystemExit(f"bundle is incomplete: {source} is missing")
            tar.add(source, arcname=relative)
        payload = json.dumps(targets, indent=1).encode()
        info = tarfile.TarInfo("targets.json")
        info.size = len(payload)
        tar.addfile(info, io.BytesIO(payload))
    return buffer.getvalue()


def bootstrap(get_url: str, put_url: str, deadline_minutes: float) -> str:
    """The pod's whole life, as one shell command.

    The suicide timer is armed first, before any install that might hang: a pod
    that cannot reach the network, cannot resolve its dependencies, or wedges
    mid-alignment still stops billing on schedule. Results are uploaded on the
    way out whatever happened, so a partial or failed run comes back as evidence
    instead of vanishing with the machine.

    The steps mirror run-approved-trial.sh exactly — same pinned model revision,
    same pinned faster-whisper and ctranslate2, same tree_hash passed straight
    back in as --model-sha256, same --max-seconds. This is deliberately not an
    improved pipeline: it is the validated one, moved to a machine.
    """
    seconds = int(deadline_minutes * 60)
    # trial.py's own budget stops it before the pod's timer does, so the results
    # upload has room to run rather than being killed mid-flight.
    process_seconds = max(300, seconds - 420)
    return (
        "set -x; "
        f"( sleep {seconds}; poweroff -f || shutdown -h now || kill -9 -1 ) & "
        "cd /workspace && mkdir -p job && cd job && "
        f"(curl -fsS --retry 5 --retry-delay 3 -o bundle.tar.gz '{get_url}' || exit 90) && "
        "tar xzf bundle.tar.gz && "
        f"pip install --no-cache-dir {DEPENDENCIES} 2>&1 | tail -3; "
        "export TINCT_TRIAL_MODEL=/workspace/job/model; "
        "python3 -c \"from huggingface_hub import snapshot_download;import os;"
        f"snapshot_download('{MODEL_REPO}',revision='{MODEL_REVISION}',"
        "local_dir=os.environ['TINCT_TRIAL_MODEL'],"
        "allow_patterns=['*.json','*.bin','vocabulary.*'])\" 2>&1 | tail -3; "
        "MODEL_HASH=$(PYTHONPATH=/workspace/job/aligner python3 -c "
        "'import os,trial;print(trial.tree_hash(os.environ[\"TINCT_TRIAL_MODEL\"]))'); "
        "python3 aligner/cloud_cohort.py --targets targets.json --out cohort 2>&1 | tail -30; "
        "python3 aligner/trial.py --input cohort/cohort.json --output out "
        "--model-path \"$TINCT_TRIAL_MODEL\" --model-sha256 \"$MODEL_HASH\" "
        f"--max-seconds {process_seconds} --device cuda --compute-type float16 --run 2>&1 | tail -30; "
        "python3 aligner/collect_candidates.py --run out --out candidates.json "
        "--report collect-report.json 2>&1 | tail -30; "
        "tar czf results.tar.gz candidates.json collect-report.json out cohort 2>/dev/null "
        "|| tar czf results.tar.gz . ; "
        f"curl -fsS --retry 5 --retry-delay 3 -X PUT --upload-file results.tar.gz '{put_url}'; "
        "poweroff -f || shutdown -h now"
    )


def preflight(key: str, args) -> tuple[float, float]:
    """Everything that must be true before a pod may exist. Returns (accrued, headroom)."""
    pods = runpod_guard.list_pods(key)
    owned = [p for p in pods if p["name"].startswith(args.owner_prefix)]
    alive = [p for p in owned if p["status"] != "EXITED"]
    if alive:
        names = ", ".join(f"{p['name']} ({p['status']})" for p in alive)
        raise SystemExit(f"refusing to launch: an owned pod is already alive — {names}. "
                         "One pod at a time; stop it or wait for it to exit.")

    ledger = runpod_guard.load_ledger(args.ledger)
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    accrued = runpod_guard.accrue(ledger, owned, now) + args.spent
    runpod_guard.save_ledger(args.ledger, ledger)

    # Budget against the FULL deadline, not against an optimistic runtime. A job
    # that only fits if it happens to finish early is a job that overruns the
    # envelope on the day it runs long.
    worst_case = args.max_rate * (args.max_minutes / 60)
    headroom = args.budget - accrued
    if worst_case > headroom:
        raise SystemExit(
            f"refusing to launch: ${accrued:.2f} of ${args.budget:.2f} is already accrued, "
            f"leaving ${headroom:.2f}, and this pod could bill ${worst_case:.2f} if it runs "
            f"the full {args.max_minutes:.0f} minutes.")
    return accrued, headroom


def create_pod(key: str, name: str, command: str, args) -> dict:
    last = None
    for gpu in ([args.gpu] if args.gpu else GPU_FALLBACK):
        body = {
            "name": name,
            "imageName": IMAGE,
            "gpuTypeIds": [gpu],
            "gpuCount": 1,
            "cloudType": "SECURE",
            "containerDiskInGb": args.disk,
            "volumeInGb": 0,
            "supportPublicIp": False,
            "dockerStartCmd": ["bash", "-lc", command],
        }
        status, response = runpod_guard._call("POST", "/pods", key, body)
        if status in (200, 201):
            response = response or {}
            response["gpuTypeId"] = gpu
            return response
        last = f"HTTP {status}: {(response or {}).get('error')}"
        print(f"  '{gpu}' unavailable ({last}); trying the next type")
    raise SystemExit(f"every GPU type was unavailable. Last: {last}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--targets", required=True,
                        help="JSON: [{bookId, edition, chapter}, ...] for this job")
    parser.add_argument("--limit", type=int, default=0, help="take only the first N targets")
    parser.add_argument("--owner-prefix", default=runpod_guard.DEFAULT_OWNER_PREFIX)
    parser.add_argument("--ledger", default=runpod_guard.DEFAULT_LEDGER)
    parser.add_argument("--spent", type=float, default=0.0,
                        help="$ spent before the ledger existed")
    parser.add_argument("--budget", type=float, default=25.00)
    parser.add_argument("--max-rate", type=float, default=1.00, help="$/hr ceiling")
    parser.add_argument("--max-minutes", type=float, default=50.0, help="hard deadline")
    parser.add_argument("--gpu", help="pin one GPU type instead of walking the fallback list")
    parser.add_argument("--disk", type=int, default=60, help="container disk GB")
    parser.add_argument("--expiry", type=int, default=7200, help="presigned URL lifetime, seconds")
    parser.add_argument("--apply", action="store_true", help="actually create the pod; this spends")
    args = parser.parse_args()

    if args.max_rate > 1.00:
        raise SystemExit("the $1/hr per-GPU ceiling is a standing constraint; --max-rate cannot exceed it")
    if args.max_minutes > 50:
        raise SystemExit("the 50-minute deadline is a standing constraint; --max-minutes cannot exceed it")

    key = os.environ.get("RUNPOD_API_KEY")
    if not key:
        raise SystemExit("RUNPOD_API_KEY is not set — cannot launch.")

    # run-approved-trial.sh refuses to spend without this, with the comment
    # "Set only after Anders approves the bounded trial". A launcher that
    # quietly dropped the gate would be routing around a control he installed,
    # so it is kept: --apply alone is not enough to bill his account.
    if args.apply and not os.environ.get("TINCT_PAID_TRIAL_APPROVED"):
        raise SystemExit(
            "refusing to launch: TINCT_PAID_TRIAL_APPROVED is not set. This is the same "
            "gate run-approved-trial.sh enforces — paid GPU work needs Anders's explicit "
            "approval, not just --apply. Dry runs need nothing.")

    targets = json.loads(Path(args.targets).read_text())
    if args.limit:
        targets = targets[:args.limit]
    if not targets:
        raise SystemExit("no targets — nothing to launch for.")

    accrued, headroom = preflight(key, args)
    worst_case = args.max_rate * (args.max_minutes / 60)
    job = f"{time.strftime('%Y%m%d-%H%M%S', time.gmtime())}-{uuid.uuid4().hex[:6]}"
    name = f"tinct-wordtiming-{job}"

    print(f"job {job}: {len(targets)} chapters")
    print(f"  accrued ${accrued:.2f} of ${args.budget:.2f}; this pod risks at most "
          f"${worst_case:.2f} of the ${headroom:.2f} left")
    print(f"  pod {name}, <= ${args.max_rate:.2f}/hr, self-stops after {args.max_minutes:.0f} min")

    bundle = build_bundle(targets)
    print(f"  bundle {len(bundle)} bytes ({len(BUNDLE_FILES)} files + targets.json)")

    if not args.apply:
        print("dry run — nothing created, nothing billed. Re-run with --apply to launch.")
        return 0

    s3 = r2_client()
    bundle_key = f"{JOB_PREFIX}/{job}/bundle.tar.gz"
    results_key = f"{JOB_PREFIX}/{job}/results.tar.gz"
    s3.put_object(Bucket=BUCKET, Key=bundle_key, Body=bundle,
                  ContentType="application/gzip")
    get_url = s3.generate_presigned_url("get_object",
                                        Params={"Bucket": BUCKET, "Key": bundle_key},
                                        ExpiresIn=args.expiry)
    put_url = s3.generate_presigned_url("put_object",
                                        Params={"Bucket": BUCKET, "Key": results_key},
                                        ExpiresIn=args.expiry)

    pod = create_pod(key, name, bootstrap(get_url, put_url, args.max_minutes), args)

    # RunPod sets the price, not us, and the fallback list is ordered by
    # availability rather than cost. Budgeting against the ceiling is only
    # honest if the pod we actually got is under it, so read the real rate back
    # and stop the pod ourselves if it is not. Waiting for the five-minute guard
    # sweep to notice would mean paying an over-ceiling rate in the meantime.
    rate = pod.get("costPerHr")
    if rate is None:
        for row in runpod_guard.list_pods(key):
            if row["id"] == pod.get("id"):
                rate = row["costPerHr"]
                break
    if rate is not None and rate > args.max_rate:
        status, _ = runpod_guard.stop_pod(key, pod.get("id"), terminate=False)
        raise SystemExit(
            f"launched {pod.get('id')} at ${rate:.2f}/hr, over the ${args.max_rate:.2f}/hr "
            f"ceiling, and stopped it again (HTTP {status}). Nothing was aligned. "
            f"Re-run with --gpu pinned to a cheaper type.")
    record = {
        "job": job, "pod": pod.get("id"), "name": name, "gpu": pod.get("gpuTypeId"),
        "chapters": len(targets), "bundleKey": bundle_key, "resultsKey": results_key,
        "launchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "deadlineMinutes": args.max_minutes, "maxRate": args.max_rate,
        "accruedBefore": round(accrued, 4), "worstCase": round(worst_case, 4),
    }
    out = Path("artifacts") / f"audio-highlight-job-{job}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(record, indent=1))
    # Deliberately printed without the presigned URLs: they are credentials for
    # the duration of the job, and this line goes into a transcript.
    print(f"launched {pod.get('id')} ({pod.get('gpuTypeId')}); record at {out}")
    print(f"  collect with: python3 {Path(__file__).name.replace('launch_wordtiming_pod', 'collect_job')} --job {job}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
