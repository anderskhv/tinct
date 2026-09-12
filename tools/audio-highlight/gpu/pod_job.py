"""Fixed word-timing job for a RunPod GPU pod, with a read-only progress server.

Runs once, unattended, and accepts no inbound commands. Everything the pod
does is decided by the launcher before the pod exists:

  * the batch of chapters arrives as JSON in TINCT_TARGETS (the launcher sets
    it at pod creation; nothing can change it afterwards),
  * the aligner is fetched from one pinned commit on GitHub,
  * the model is fetched from Hugging Face at one pinned revision and its
    tree hash must equal TINCT_MODEL_SHA256 or the job stops,
  * edition text and recordings come from tinct.app's public read routes.

The pod holds no credentials of any kind. Results leave the pod only through
a GET-only HTTP server (status, single files, and a tar of the output tree)
that requires the X-Tinct-Token header. Killing the job is the launcher's
business through the RunPod API; `trial.py --max-seconds` caps the worker and
`runpod_guard.py` caps the pod, independently.

Environment:
  TINCT_TOKEN           shared secret required on every request
  TINCT_TARGETS         JSON list of {bookId, edition, chapter}
  TINCT_COMMIT          commit the aligner files are fetched from
  TINCT_MODEL_SHA256    expected tree hash of the model snapshot
  TINCT_MODEL_REVISION  Hugging Face revision (default: the canary's pin)
  TINCT_MAX_SECONDS     trial.py worker cap (default 2400)
  TINCT_ARMS            space-separated arms (default "off auto")
  TINCT_COMPUTE_TYPE    float16 (default) or int8
  TINCT_DEVICE          cuda (default) or cpu
  TINCT_HELPER          pinned helper revision, v1, v2 or v3 (default v3; PINS.md)
  PORT                  HTTP port (default 8000)
"""
from __future__ import annotations

import io
import json
import os
import subprocess
import sys
import tarfile
import threading
import time
import traceback
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(os.environ.get("TINCT_RUN_ROOT", "/workspace/run")).resolve()
TOKEN = os.environ.get("TINCT_TOKEN", "")
COMMIT = os.environ.get("TINCT_COMMIT", "main")
MODEL_SHA = os.environ.get("TINCT_MODEL_SHA256", "")
MODEL_REV = os.environ.get("TINCT_MODEL_REVISION", "d1d751a5f8271d482d14ca55d9e2deeebbae577f")
DEVICE = os.environ.get("TINCT_DEVICE", "cuda")
RAW = f"https://raw.githubusercontent.com/anderskhv/tinct/{COMMIT}"
HELPER = os.environ.get("TINCT_HELPER", "v3")
# Every pin travels to the pod: trial.py imports the default at module scope and
# selects the requested pin at startup, so a missing file is an immediate
# ImportError on the pod rather than a silently different comparison.
ALIGNER_FILES = ["trial.py", "pinned_words_sidecar_lib.py", "pinned_words_sidecar_lib_v2.py",
                 "pinned_words_sidecar_lib_v3.py", "spoken_policy.py", "cloud_cohort.py"]

STATE: dict = {"phase": "booting", "started": time.time(), "setup": {}, "job": {}, "log": []}
LOCK = threading.Lock()


def log(msg: str) -> None:
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with LOCK:
        STATE["log"].append(line)
        STATE["log"] = STATE["log"][-400:]


def save_state() -> None:
    with LOCK:
        snapshot = json.dumps({k: v for k, v in STATE.items() if k != "log"}, indent=1)
    (ROOT / "status.json").write_text(snapshot)


def fetch(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "tinct-pod-job/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        dest.write_bytes(response.read())


def nvidia_lib_dirs() -> list[str]:
    dirs = []
    for base in sys.path:
        nvidia = Path(base) / "nvidia"
        if nvidia.is_dir():
            dirs.extend(str(lib) for lib in nvidia.glob("*/lib"))
    return sorted(set(dirs))


def setup() -> Path:
    tools = ROOT / "tools" / "audio-highlight"
    STATE["phase"] = "deps"
    save_state()
    pip = subprocess.run([sys.executable, "-m", "pip", "install", "-q", "faster-whisper==1.2.1",
                          "ctranslate2==4.8.2", "av", "huggingface_hub"], capture_output=True, text=True)
    if pip.returncode != 0:
        raise RuntimeError("pip failed: " + pip.stderr[-2000:])
    import importlib.metadata as metadata
    STATE["setup"]["versions"] = {k: metadata.version(k) for k in ["faster-whisper", "ctranslate2", "av"]}

    STATE["phase"] = "code"
    save_state()
    fetch(f"{RAW}/tools/audio-highlight/prodapi.py", tools / "prodapi.py")
    for name in ALIGNER_FILES:
        fetch(f"{RAW}/tools/audio-highlight/aligner/{name}", tools / "aligner" / name)
    STATE["setup"]["commit"] = COMMIT

    STATE["phase"] = "model"
    save_state()
    from huggingface_hub import snapshot_download
    model_dir = ROOT / "model"
    snapshot_download("Systran/faster-whisper-small.en", revision=MODEL_REV, local_dir=str(model_dir))
    sys.path.insert(0, str(tools / "aligner"))
    import trial  # noqa: E402
    tree = trial.tree_hash(model_dir)
    STATE["setup"]["model_tree_sha256"] = tree
    if MODEL_SHA and tree != MODEL_SHA:
        raise RuntimeError(f"model tree hash {tree} != expected {MODEL_SHA}")

    STATE["phase"] = "cuda"
    save_state()
    libs = nvidia_lib_dirs()
    if libs:
        os.environ["LD_LIBRARY_PATH"] = ":".join(libs + [os.environ.get("LD_LIBRARY_PATH", "")]).strip(":")
    STATE["setup"]["ld_library_path"] = os.environ.get("LD_LIBRARY_PATH", "")
    import shutil
    if shutil.which("nvidia-smi"):
        smi = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader"],
                             capture_output=True, text=True)
        STATE["setup"]["gpu"] = (smi.stdout or smi.stderr).strip()
    else:
        STATE["setup"]["gpu"] = "nvidia-smi not present"
    if DEVICE == "cuda":
        probe = subprocess.run([sys.executable, "-c",
                                "import ctranslate2,faster_whisper;"
                                "n=ctranslate2.get_cuda_device_count();print('cuda devices',n);assert n>0;"
                                f"faster_whisper.WhisperModel('{model_dir}',device='cuda',compute_type='float16',"
                                "local_files_only=True);print('model loaded on cuda')"],
                               capture_output=True, text=True)
        STATE["setup"]["cuda_probe"] = (probe.stdout + probe.stderr)[-1500:]
        if probe.returncode != 0:
            raise RuntimeError("cuda probe failed: " + (probe.stdout + probe.stderr)[-2000:])
    STATE["setup"]["setup_seconds"] = round(time.time() - STATE["started"], 1)
    log(f"setup complete in {STATE['setup']['setup_seconds']}s")
    return tools


def job() -> None:
    record = STATE["job"]
    try:
        targets = json.loads(os.environ.get("TINCT_TARGETS") or "[]")
        if not targets:
            raise RuntimeError("TINCT_TARGETS is empty")
        (ROOT / "targets.json").write_text(json.dumps(targets, indent=1))
        tools = setup()
        cohort_dir, out_dir = ROOT / "cohort", ROOT / "out"

        STATE["phase"] = "cohort"
        record.update(started=time.time(), targets=len(targets))
        save_state()
        with (ROOT / "cohort.log").open("w") as handle:
            code = subprocess.call([sys.executable, str(tools / "aligner" / "cloud_cohort.py"), "--targets",
                                    str(ROOT / "targets.json"), "--out", str(cohort_dir), "--workers", "6"],
                                   stdout=handle, stderr=subprocess.STDOUT)
        record["cohort_exit"] = code
        record["cohort_seconds"] = round(time.time() - record["started"], 1)
        if code != 0:
            raise RuntimeError("cloud_cohort failed; see cohort.log")
        cohort = json.loads((cohort_dir / "cohort.json").read_text())
        record["cohort_chapters"] = len(cohort)
        record["cohort_audio_seconds"] = round(sum(p["duration"] for r in cohort for p in r["paragraphs"]), 1)
        if not cohort:
            raise RuntimeError("cohort is empty")

        STATE["phase"] = "aligning"
        record["align_started"] = time.time()
        save_state()
        command = [sys.executable, str(tools / "aligner" / "trial.py"), "--input", str(cohort_dir / "cohort.json"),
                   "--output", str(out_dir), "--model-path", str(ROOT / "model"),
                   "--model-sha256", STATE["setup"]["model_tree_sha256"], "--device", DEVICE,
                   "--compute-type", os.environ.get("TINCT_COMPUTE_TYPE", "float16"),
                   "--arms", *os.environ.get("TINCT_ARMS", "off auto").split(),
                   "--max-seconds", os.environ.get("TINCT_MAX_SECONDS", "2400"),
                   "--helper", HELPER, "--run"]
        record["command"] = command
        log("$ " + " ".join(command))
        with (ROOT / "trial.log").open("w") as handle:
            code = subprocess.call(command, stdout=handle, stderr=subprocess.STDOUT, cwd=str(tools / "aligner"))
        record["trial_exit"] = code
        record["align_seconds"] = round(time.time() - record["align_started"], 1)
        run_json = out_dir / "run.json"
        record["run_status"] = json.loads(run_json.read_text()).get("status") if run_json.exists() else None
        STATE["phase"] = "done" if code == 0 else "done-with-errors"
    except Exception as error:  # noqa: BLE001
        record["error"] = f"{type(error).__name__}: {error}"
        record["traceback"] = traceback.format_exc()[-3000:]
        STATE["phase"] = "failed"
        log("job failed: " + record["error"])
    finally:
        record["finished"] = time.time()
        save_state()
        log(f"job finished with phase {STATE['phase']}")


def progress() -> dict:
    out_dir = ROOT / "out"
    counts = {"arm_chapters_passed": 0, "arm_chapters_rejected": 0, "arm_chapters_running": 0}
    if out_dir.exists():
        for chapter_file in out_dir.rglob("chapter.json"):
            try:
                status = json.loads(chapter_file.read_text()).get("status")
            except Exception:  # noqa: BLE001
                continue
            if status == "candidate_requires_acoustic_review":
                counts["arm_chapters_passed"] += 1
            elif status == "rejected":
                counts["arm_chapters_rejected"] += 1
            else:
                counts["arm_chapters_running"] += 1
        counts["paragraph_diagnostics"] = sum(1 for _ in out_dir.rglob("p*.diagnostic.json"))
    return counts


def safe_path(rel: str) -> Path:
    path = (ROOT / rel).resolve()
    if path != ROOT and ROOT not in path.parents:
        raise ValueError("path escapes run root")
    return path


class ReadOnlyHandler(BaseHTTPRequestHandler):
    """GET only. No route writes, executes, or changes anything."""

    protocol_version = "HTTP/1.1"

    def log_message(self, *_):
        pass

    def _send(self, code: int, body: bytes, content_type: str = "text/plain") -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):  # noqa: N802
        if not TOKEN or self.headers.get("X-Tinct-Token") != TOKEN:
            self._send(401, b"unauthorized")
            return
        url = urllib.parse.urlparse(self.path)
        query = dict(urllib.parse.parse_qsl(url.query))
        try:
            if url.path == "/status":
                with LOCK:
                    tail = STATE["log"][-int(query.get("log", 40)):]
                    body = {"phase": STATE["phase"], "uptime_seconds": round(time.time() - STATE["started"], 1),
                            "setup": STATE["setup"], "job": STATE["job"], "log": tail}
                body["progress"] = progress()
                self._send(200, json.dumps(body, indent=1).encode(), "application/json")
            elif url.path == "/file":
                path = safe_path(query["path"])
                if not path.is_file():
                    self._send(404, b"not found")
                else:
                    self._send(200, path.read_bytes(), "application/octet-stream")
            elif url.path == "/tar":
                path = safe_path(query.get("path", "out"))
                exclude = set(filter(None, query.get("exclude", "").split(",")))
                buffer = io.BytesIO()
                with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
                    tar.add(str(path), arcname=path.name,
                            filter=lambda info: None if set(Path(info.name).parts) & exclude else info)
                self._send(200, buffer.getvalue(), "application/gzip")
            else:
                self._send(404, b"no such route")
        except Exception as error:  # noqa: BLE001
            self._send(500, f"{type(error).__name__}: {error}".encode())


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), ReadOnlyHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    log(f"read-only status server on {port}; run root {ROOT}; commit {COMMIT}")
    job()
    # Keep serving results until the launcher stops the pod.
    while True:
        time.sleep(60)


if __name__ == "__main__":
    main()
