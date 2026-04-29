#!/usr/bin/env python3
"""Cloud-GPU Kokoro audio generator. Designed to run on RunPod / Vast.ai / any
Linux box with NVIDIA GPU + PyTorch. Fetches edition JSON from tinct.app, writes
audio locally, uploads to R2 chapter-by-chapter.

Usage:
    python3 run-kokoro-cloud.py BOOK EDITION [BOOK EDITION ...]

Examples:
    python3 run-kokoro-cloud.py bible kjv-en bible web-en bible modern-en
    python3 run-kokoro-cloud.py ulysses original-en ulysses modern-en

Required env: CLOUDFLARE_API_TOKEN

Idempotent. Re-running skips chapters already on R2 (verified via HEAD request).
"""
import json, os, re, subprocess, sys, time, urllib.request
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────────
WORKSPACE = Path('/workspace')
AUDIO_DIR = WORKSPACE / 'audio'
EDITIONS_DIR = WORKSPACE / 'editions'
EDITION_BASE_URL = 'https://raw.githubusercontent.com/anderskhv/tinct/main/app/public/data/editions'
R2_BUCKET = 'tinct-audio'
R2_PUBLIC_BASE = 'https://pub-c34df89c93284423a39b03537595c2e2.r2.dev'

# ──────────────────────────────────────────────────────────────────────────────
# Text cleanup — same as run-audio-batch2.py / regen-bible-modern-en.py
# ──────────────────────────────────────────────────────────────────────────────

ROMAN_TO_ARABIC = {
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6',
    'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12',
    'XIII': '13', 'XIV': '14', 'XV': '15', 'XVI': '16', 'XVII': '17',
    'XVIII': '18', 'XIX': '19', 'XX': '20', 'XXI': '21', 'XXII': '22',
    'XXIII': '23', 'XXIV': '24',
}


def clean_text(text):
    superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹'
    text = re.sub(f'[{re.escape(superscripts)}]+', '', text)

    def _replace_roman(m):
        prefix, roman = m.group(1), m.group(2)
        return f'{prefix} {ROMAN_TO_ARABIC[roman]}' if roman in ROMAN_TO_ARABIC else m.group(0)

    text = re.sub(
        r'\b(Act|Scene|Book|Chapter|Part|Canto|Volume)\s+([IVX]+)\b',
        _replace_roman, text,
    )
    text = re.sub(r'\b([A-Z]{2,})\b', lambda m: m.group(1).title(), text)
    text = text.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    text = re.sub(r'  +', ' ', text).strip()
    return text


def clean_title(raw_title):
    def _replace_roman(m):
        val = ROMAN_TO_ARABIC.get(m.group(2).upper())
        return f'{m.group(1)} {val}' if val else m.group(0)
    title = re.sub(
        r'\b(Book|Chapter|Act|Scene|Part|Canto|Epistle|Letter|Psalm)\s+([IVXLCDM]+)\b',
        _replace_roman, raw_title, flags=re.IGNORECASE,
    )
    title = title.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return title


# ──────────────────────────────────────────────────────────────────────────────
def ts():
    return time.strftime('%Y-%m-%d %H:%M:%S')


def log(msg):
    print(f"[{ts()}] {msg}", flush=True)


def fetch_edition(book, edition):
    """Download edition JSON from tinct.app, cache in /workspace/editions."""
    EDITIONS_DIR.mkdir(parents=True, exist_ok=True)
    local = EDITIONS_DIR / f'{book}-{edition}.json'
    if local.exists() and local.stat().st_size > 1000:
        return local
    url = f'{EDITION_BASE_URL}/{book}-{edition}.json'
    log(f'  Fetching {url}')
    urllib.request.urlretrieve(url, local)
    return local


def chapter_on_r2(book, edition, ch_num):
    """Quick check: does ch{N}/manifest.json already exist on R2? (skip if so).
    R2 public URLs block default Python UA — use a real browser UA."""
    url = f'{R2_PUBLIC_BASE}/{book}/{edition}/ch{ch_num}/manifest.json'
    try:
        req = urllib.request.Request(
            url, method='HEAD',
            headers={'User-Agent': 'Mozilla/5.0 (TinctKokoroCloud)'},
        )
        with urllib.request.urlopen(req, timeout=8) as r:
            return r.status == 200
    except Exception:
        return False


def ffprobe_duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    try:
        return round(float(r.stdout.strip()), 3)
    except Exception:
        return 0.0


def wav_to_mp3(wav, mp3):
    r = subprocess.run(
        ["ffmpeg", "-y", "-i", str(wav), "-b:a", "128k", "-loglevel", "error", str(mp3)],
        capture_output=True, text=True,
    )
    return r.returncode == 0


def r2_put(local, key, ctype, max_attempts=5, per_call_timeout=60):
    last_err = ""
    for attempt in range(1, max_attempts + 1):
        try:
            r = subprocess.run(
                ["wrangler", "r2", "object", "put", f"{R2_BUCKET}/{key}",
                 "--file", str(local), "--content-type", ctype, "--remote"],
                capture_output=True, text=True,
                cwd=str(WORKSPACE / 'tinct'),  # contains wrangler.toml
                timeout=per_call_timeout,
            )
            if r.returncode == 0:
                return True, ""
            last_err = r.stderr[:200]
            transient = any(c in last_err for c in ["503","500","502","504","Service Unavailable","timeout","EAI_AGAIN","ECONNRESET"])
        except subprocess.TimeoutExpired:
            last_err = "subprocess timeout"
            transient = True
        if not transient or attempt == max_attempts:
            break
        time.sleep(2 ** attempt)
    return False, last_err


def process_chapter(pipeline, edition_key, chapter, ed_audio_dir, np, sf):
    ch_num = chapter["number"]
    ch_dir = ed_audio_dir / f"ch{ch_num}"
    ch_dir.mkdir(parents=True, exist_ok=True)
    paragraphs = chapter.get("paragraphs", [])

    for i, para in enumerate(paragraphs):
        wav = ch_dir / f"p{i}.wav"
        mp3 = ch_dir / f"p{i}.mp3"
        if mp3.exists() or wav.exists():
            continue
        text = clean_text(para.replace("\n", " "))
        if not text:
            sf.write(str(wav), np.zeros(2400, dtype=np.float32), 24000)
            continue
        try:
            chunks = []
            for result in pipeline(text, voice="af_bella", speed=1.0):
                chunks.append(result.audio.numpy())
            if chunks:
                sf.write(str(wav), np.concatenate(chunks), 24000)
        except Exception as e:
            log(f"    ERR gen ch{ch_num}/p{i}: {e}")
            sf.write(str(wav), np.zeros(2400, dtype=np.float32), 24000)

    for i in range(len(paragraphs)):
        wav = ch_dir / f"p{i}.wav"
        mp3 = ch_dir / f"p{i}.mp3"
        if mp3.exists() and (not wav.exists() or mp3.stat().st_mtime >= wav.stat().st_mtime):
            continue
        if wav.exists():
            wav_to_mp3(wav, mp3)

    title_mp3 = ch_dir / "title.mp3"
    title_wav = ch_dir / "title.wav"
    if not title_mp3.exists():
        raw_title = chapter.get("title", f"Chapter {ch_num}")
        tts_t = clean_title(raw_title)
        try:
            chunks = []
            for result in pipeline(tts_t, voice="af_bella", speed=0.9):
                chunks.append(result.audio.numpy())
            if chunks:
                sf.write(str(title_wav), np.concatenate(chunks), 24000)
                wav_to_mp3(title_wav, title_mp3)
        except Exception as e:
            log(f"    ERR title ch{ch_num}: {e}")

    entries = []
    if title_mp3.exists():
        entries.append({"paragraph": -1, "duration": ffprobe_duration(title_mp3), "file": "title.mp3"})
    for i in range(len(paragraphs)):
        mp3 = ch_dir / f"p{i}.mp3"
        if mp3.exists():
            entries.append({"paragraph": i, "duration": ffprobe_duration(mp3), "file": f"p{i}.mp3"})
    manifest = {"chapter": ch_num, "title": chapter.get("title", f"Chapter {ch_num}"), "paragraphs": entries}
    (ch_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
    return ch_dir


def upload_chapter(book_id, edition_key, ch_dir):
    ch_name = ch_dir.name
    files = sorted(ch_dir.glob("*.mp3")) + [ch_dir / "manifest.json"]
    ok, fail = 0, 0
    for f in files:
        if not f.exists():
            continue
        ctype = "audio/mpeg" if f.suffix == ".mp3" else "application/json"
        key = f"{book_id}/{edition_key}/{ch_name}/{f.name}"
        success, err = r2_put(f, key, ctype)
        if success:
            ok += 1
        else:
            fail += 1
            log(f"    R2 FAIL {key}: {err}")
    return ok, fail


def main():
    args = sys.argv[1:]
    # --force flag: regenerate every chapter (don't skip already-on-R2)
    force = False
    if "--force" in args:
        force = True
        args = [a for a in args if a != "--force"]
        log("FORCE mode: idempotent skip disabled, all chapters will be regenerated.")
    if len(args) < 2 or len(args) % 2 != 0:
        print(__doc__)
        return 1

    if not os.environ.get("CLOUDFLARE_API_TOKEN"):
        log("ERROR: CLOUDFLARE_API_TOKEN not set. export it before running.")
        return 1

    JOBS = [(args[i], args[i+1]) for i in range(0, len(args), 2)]
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    log(f"Output: {AUDIO_DIR}")
    log(f"Jobs: {JOBS}")

    log("Loading Kokoro + dependencies…")
    import numpy as np
    import soundfile as sf
    import kokoro
    pipeline = kokoro.KPipeline(lang_code="a")
    log("Kokoro ready.")

    # Try to enable CUDA for Kokoro's underlying torch model
    try:
        import torch
        if torch.cuda.is_available():
            log(f"CUDA available: {torch.cuda.get_device_name(0)}")
            # Kokoro's pipeline uses torch internally; set default device
            torch.set_default_device('cuda')
        else:
            log("CUDA NOT available — running on CPU (much slower)")
    except Exception as e:
        log(f"torch check failed: {e}")

    for book_id, edition_key in JOBS:
        job_start = time.time()
        edition_file = fetch_edition(book_id, edition_key)
        edition = json.load(open(edition_file))
        chapters = edition.get("chapters", [])
        ed_audio_dir = AUDIO_DIR / book_id / edition_key
        ed_audio_dir.mkdir(parents=True, exist_ok=True)

        log(f"═══ {book_id} / {edition_key}: {len(chapters)} chapters ═══")
        total_ok, total_fail, total_skipped = 0, 0, 0
        for ch in chapters:
            ch_num = ch["number"]
            ch_start = time.time()

            # Skip if already on R2 (idempotent) — unless --force was passed
            if not force and chapter_on_r2(book_id, edition_key, ch_num):
                total_skipped += 1
                continue

            try:
                ch_dir = process_chapter(pipeline, edition_key, ch, ed_audio_dir, np, sf)
                ok, fail = upload_chapter(book_id, edition_key, ch_dir)
                total_ok += ok
                total_fail += fail
                elapsed = time.time() - ch_start
                log(f"  ch{ch_num}: {len(ch.get('paragraphs', []))}p → R2 {ok}/{ok+fail} ({elapsed:.0f}s)")
            except Exception as e:
                log(f"  ch{ch_num}: UNEXPECTED ERROR {e}")
                total_fail += 1

        elapsed_min = (time.time() - job_start) / 60
        log(f"═══ {book_id}/{edition_key} DONE: R2 {total_ok} ok / {total_fail} fail / {total_skipped} skipped / {elapsed_min:.1f} min ═══\n")

    log("ALL JOBS DONE.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
