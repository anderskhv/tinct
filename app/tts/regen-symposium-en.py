#!/usr/bin/env python3
"""One-shot: regenerate Symposium English audio (original-en + modern-en) with the
current clean_text() fix that title-cases ALL-CAPS speaker tags.

Writes to ~/audio-staging/symposium/ (non-iCloud), uploads to R2 with overwrite.
Runs in parallel with batch2 — accepts GPU contention since job is small (~217p × 2).
"""
import json, os, re, subprocess, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
EDITIONS_DIR = HERE.parent / "public" / "data" / "editions"
AUDIO_DIR = Path("/Users/andershvelplund/audio-staging")
WRANGLER_DIR = HERE.parent
R2_BUCKET = "tinct-audio"

JOBS = [("symposium", "original-en"), ("symposium", "modern-en")]

ROMAN_TO_ARABIC = {
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6',
    'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12',
    'XIII': '13', 'XIV': '14', 'XV': '15', 'XVI': '16', 'XVII': '17',
    'XVIII': '18', 'XIX': '19', 'XX': '20', 'XXI': '21', 'XXII': '22',
    'XXIII': '23', 'XXIV': '24',
}


def clean_text(text):
    """The fix — title-case ALL-CAPS so Kokoro doesn't spell letter-by-letter."""
    superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹'
    text = re.sub(f'[{re.escape(superscripts)}]+', '', text)

    def _replace_roman(m):
        prefix, roman = m.group(1), m.group(2)
        return f'{prefix} {ROMAN_TO_ARABIC[roman]}' if roman in ROMAN_TO_ARABIC else m.group(0)

    text = re.sub(
        r'\b(Act|Scene|Book|Chapter|Part|Canto|Volume)\s+([IVX]+)\b',
        _replace_roman, text,
    )
    # THE FIX: ALL-CAPS → Title Case
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


def ts():
    return time.strftime('%Y-%m-%d %H:%M:%S')


def log(msg):
    print(f"[{ts()}] {msg}", flush=True)


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
                ["npx", "wrangler", "r2", "object", "put", f"{R2_BUCKET}/{key}",
                 "--file", str(local), "--content-type", ctype, "--remote"],
                capture_output=True, text=True, cwd=str(WRANGLER_DIR),
                timeout=per_call_timeout,
            )
            if r.returncode == 0:
                return True, ""
            last_err = r.stderr[:200]
            transient = any(c in last_err for c in ["503","500","502","504","Service Unavailable","timeout","EAI_AGAIN","ECONNRESET","401","400","Bad Request"])
        except subprocess.TimeoutExpired:
            last_err = f"subprocess timeout after {per_call_timeout}s"
            transient = True
        if not transient or attempt == max_attempts:
            break
        time.sleep(2 ** attempt)
    return False, last_err


def main():
    if not os.environ.get("CLOUDFLARE_API_TOKEN"):
        # Try to load from .env
        env = HERE.parent / ".env"
        if env.exists():
            for line in env.read_text().splitlines():
                if "CLOUDFLARE_API_TOKEN" in line:
                    val = line.split("=", 1)[1].strip()
                    os.environ["CLOUDFLARE_API_TOKEN"] = val
                    log("Loaded CLOUDFLARE_API_TOKEN from .env")
                    break

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    log(f"Output dir: {AUDIO_DIR}/symposium")
    log("Loading Kokoro…")
    import numpy as np
    import soundfile as sf
    import kokoro
    pipeline = kokoro.KPipeline(lang_code="a")
    log("Kokoro ready.")

    for book_id, edition_key in JOBS:
        edition_file = EDITIONS_DIR / f"{book_id}-{edition_key}.json"
        edition = json.load(open(edition_file))
        chapters = edition["chapters"]
        ed_audio_dir = AUDIO_DIR / book_id / edition_key
        ed_audio_dir.mkdir(parents=True, exist_ok=True)

        log(f"═══ {book_id}/{edition_key}: {len(chapters)} chapters ═══")
        total_ok, total_fail = 0, 0
        for ch in chapters:
            ch_num = ch["number"]
            ch_dir = ed_audio_dir / f"ch{ch_num}"
            ch_dir.mkdir(parents=True, exist_ok=True)
            paragraphs = ch.get("paragraphs", [])
            ch_start = time.time()

            # Generate WAVs (FORCE OVERWRITE — this is a regen)
            for i, para in enumerate(paragraphs):
                wav = ch_dir / f"p{i}.wav"
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
                    log(f"  ERR gen ch{ch_num}/p{i}: {e}")
                    sf.write(str(wav), np.zeros(2400, dtype=np.float32), 24000)

            # Convert WAVs → MP3 (force)
            for i in range(len(paragraphs)):
                wav = ch_dir / f"p{i}.wav"
                mp3 = ch_dir / f"p{i}.mp3"
                if wav.exists():
                    wav_to_mp3(wav, mp3)

            # Title.mp3 (force)
            title_wav = ch_dir / "title.wav"
            title_mp3 = ch_dir / "title.mp3"
            raw_title = ch.get("title", f"Chapter {ch_num}")
            tts_t = clean_title(raw_title)
            try:
                chunks = []
                for r in pipeline(tts_t, voice="af_bella", speed=0.9):
                    chunks.append(r.audio.numpy())
                if chunks:
                    sf.write(str(title_wav), np.concatenate(chunks), 24000)
                    wav_to_mp3(title_wav, title_mp3)
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

            # Upload to R2 (overwrites existing)
            files = sorted(ch_dir.glob("*.mp3")) + [ch_dir / "manifest.json"]
            ok, fail = 0, 0
            for f in files:
                ctype = "audio/mpeg" if f.suffix == ".mp3" else "application/json"
                key = f"{book_id}/{edition_key}/ch{ch_num}/{f.name}"
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
        log(f"═══ {book_id}/{edition_key} DONE: R2 {total_ok} ok / {total_fail} fail ═══\n")

    log("ALL DONE.")


if __name__ == "__main__":
    main()
