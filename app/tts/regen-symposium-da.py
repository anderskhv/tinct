#!/usr/bin/env python3
"""Generate Symposium modern-da audio via Google Chirp 3 HD (Aoede voice).

Writes to ~/audio-staging/symposium/modern-da/ (non-iCloud).
Generates manifests + title.mp3 (using same Chirp voice for consistency).
Uploads everything to R2.
"""
import base64, json, os, subprocess, time, urllib.error, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
EDITIONS_DIR = HERE.parent / "public" / "data" / "editions"
AUDIO_DIR = Path("/Users/andershvelplund/audio-staging")
WRANGLER_DIR = HERE.parent
R2_BUCKET = "tinct-audio"

BOOK = "symposium"
EDITION = "modern-da"
VOICE = "da-DK-Chirp3-HD-Aoede"
LANG_CODE = "da-DK"


def ts():
    return time.strftime('%Y-%m-%d %H:%M:%S')


def log(msg):
    print(f"[{ts()}] {msg}", flush=True)


def chirp_synthesize(text, api_key, speaking_rate=0.95):
    url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"
    payload = json.dumps({
        "input": {"text": text or "."},
        "voice": {"languageCode": LANG_CODE, "name": VOICE},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": speaking_rate},
    }).encode()

    for attempt in range(4):
        try:
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
            return base64.b64decode(result["audioContent"])
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if e.code == 429:
                log(f"  rate limited, sleep 10s")
                time.sleep(10)
            elif e.code == 403:
                log(f"  ERR 403: {body[:200]} — API not enabled or key restricted")
                raise
            else:
                log(f"  HTTPError {e.code} attempt {attempt+1}: {body[:200]}")
                time.sleep(2)
        except (TimeoutError, OSError) as e:
            log(f"  network error attempt {attempt+1}: {e}")
            time.sleep(3)
    raise RuntimeError("Chirp synthesis failed after retries")


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


def r2_put(local, key, ctype, max_attempts=5, per_call_timeout=60):
    last_err = ""
    for attempt in range(1, max_attempts + 1):
        try:
            r = subprocess.run(
                ["npx", "wrangler", "r2", "object", "put", f"{R2_BUCKET}/{key}",
                 "--file", str(local), "--content-type", ctype, "--remote"],
                capture_output=True, text=True, cwd=str(WRANGLER_DIR),
                timeout=per_call_timeout,
            )
            if r.returncode == 0:
                return True, ""
            last_err = r.stderr[:200]
        except subprocess.TimeoutExpired:
            last_err = "subprocess timeout"
        if attempt == max_attempts:
            break
        time.sleep(2 ** attempt)
    return False, last_err


def main():
    api_key = os.environ.get("GOOGLE_TTS_API_KEY", "")
    if not api_key:
        log("ERROR: GOOGLE_TTS_API_KEY not set. Run via wrapper script.")
        return 1

    if not os.environ.get("CLOUDFLARE_API_TOKEN"):
        env = HERE.parent / ".env"
        if env.exists():
            for line in env.read_text().splitlines():
                if "CLOUDFLARE_API_TOKEN" in line:
                    val = line.split("=", 1)[1].strip()
                    os.environ["CLOUDFLARE_API_TOKEN"] = val

    edition_file = EDITIONS_DIR / f"{BOOK}-{EDITION}.json"
    edition = json.load(open(edition_file))
    chapters = edition["chapters"]
    ed_audio_dir = AUDIO_DIR / BOOK / EDITION
    ed_audio_dir.mkdir(parents=True, exist_ok=True)

    log(f"Output: {ed_audio_dir}")
    log(f"Voice: {VOICE}")
    log(f"═══ {BOOK}/{EDITION}: {len(chapters)} chapters ═══")

    total_ok, total_fail = 0, 0
    for ch in chapters:
        ch_num = ch["number"]
        ch_dir = ed_audio_dir / f"ch{ch_num}"
        ch_dir.mkdir(parents=True, exist_ok=True)
        paragraphs = ch.get("paragraphs", [])
        ch_start = time.time()

        # Paragraph MP3s (Chirp returns MP3 directly)
        for i, para in enumerate(paragraphs):
            mp3 = ch_dir / f"p{i}.mp3"
            if mp3.exists():
                continue  # idempotent if rerun
            text = para.replace("\n", " ").strip() or "."
            try:
                audio = chirp_synthesize(text, api_key)
                mp3.write_bytes(audio)
            except Exception as e:
                log(f"  ERR ch{ch_num}/p{i}: {e}")
            time.sleep(0.05)  # gentle pacing

        # Title.mp3
        title_mp3 = ch_dir / "title.mp3"
        if not title_mp3.exists():
            try:
                audio = chirp_synthesize(ch.get("title", f"Chapter {ch_num}"), api_key, speaking_rate=0.9)
                title_mp3.write_bytes(audio)
            except Exception as e:
                log(f"  ERR title ch{ch_num}: {e}")

        # Manifest
        entries = []
        if title_mp3.exists():
            entries.append({"paragraph": -1, "duration": ffprobe_duration(title_mp3), "file": "title.mp3"})
        for i in range(len(paragraphs)):
            mp3 = ch_dir / f"p{i}.mp3"
            if mp3.exists():
                entries.append({"paragraph": i, "duration": ffprobe_duration(mp3), "file": f"p{i}.mp3"})
        manifest = {"chapter": ch_num, "title": ch.get("title", f"Chapter {ch_num}"), "paragraphs": entries}
        (ch_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

        # Upload to R2
        files = sorted(ch_dir.glob("*.mp3")) + [ch_dir / "manifest.json"]
        ok, fail = 0, 0
        for f in files:
            ctype = "audio/mpeg" if f.suffix == ".mp3" else "application/json"
            key = f"{BOOK}/{EDITION}/ch{ch_num}/{f.name}"
            ok_flag, err = r2_put(f, key, ctype)
            if ok_flag:
                ok += 1
            else:
                fail += 1
                log(f"    R2 FAIL {key}: {err}")
        total_ok += ok
        total_fail += fail
        elapsed = time.time() - ch_start
        log(f"  ch{ch_num}: {len(paragraphs)}p → R2 {ok}/{ok+fail} ({elapsed:.0f}s)")

    log(f"═══ DONE: R2 {total_ok} ok / {total_fail} fail ═══")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
