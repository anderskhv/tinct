#!/usr/bin/env python3
"""Audio batch #2 — 12 books added after the original run, plus Bible KJV+WEB.

Generates Kokoro audio for specific (book, edition) pairs that the first
run-all-original-en.py didn't cover. Same pipeline as before:
  1. Generate paragraph WAVs via Kokoro (loaded once across all jobs)
  2. Convert WAVs → MP3s
  3. Generate title.mp3 per chapter
  4. Write manifest.json
  5. Upload paragraph MP3s + title + manifest to R2

Idempotent: re-running skips any chapter/paragraph already done locally.

Invocation (run via the .sh wrapper which loads CLOUDFLARE_API_TOKEN from .env):
  caffeinate -dimsu python3 run-audio-batch2.py 2>&1 | tee batch2-log.txt

Estimated runtime: ~18 hours. Bible is ~54% of the work.

NOT included:
- Fear and Trembling original-da (needs Chirp for Danish, not Kokoro)
- Fear and Trembling modern-da (same — needs Chirp)
- War and Peace original-en (already on R2 from earlier session)
"""
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
EDITIONS_DIR = HERE.parent / "public" / "data" / "editions"
AUDIO_DIR = HERE / "audio"
WRANGLER_DIR = HERE.parent
R2_BUCKET = "tinct-audio"

# Each job: (book_id, edition_key)
# Order: smallest first so progress is visible early; Bible last because biggest.
JOBS = [
    # 12 new books × 2 editions each (or 1 where modern-da is the missing one we skip)
    ("genealogy-of-morals", "original-en"),    # 124p
    ("genealogy-of-morals", "modern-en"),      # 124p
    ("on-liberty", "original-en"),             # 126p
    ("on-liberty", "modern-en"),               # 126p
    ("descartes-meditations", "original-en"),  # 144p
    ("descartes-meditations", "modern-en"),    # 144p
    ("fear-and-trembling", "modern-en"),       # 232p (Danish editions skipped — need Chirp)
    ("antigone", "original-en"),               # 318p
    ("antigone", "modern-en"),                 # 318p
    ("aristotle-politics", "original-en"),     # 478p
    ("aristotle-politics", "modern-en"),       # 478p
    ("oedipus-rex", "original-en"),            # 474p
    ("oedipus-rex", "modern-en"),              # 474p
    ("oedipus-at-colonus", "original-en"),     # 566p
    ("oedipus-at-colonus", "modern-en"),       # 566p
    ("peloponnesian-war", "original-en"),      # 998p
    ("peloponnesian-war", "modern-en"),        # 998p
    ("democracy-in-america", "original-en"),   # 2258p
    ("democracy-in-america", "modern-en"),     # 2258p
    # Bible — KJV (Early Modern English: thee/thou) + WEB (modern). Both English, Kokoro.
    ("bible", "kjv-en"),                       # 6704p
    ("bible", "web-en"),                       # 6704p
]


# ──────────────────────────────────────────────────────────────────────────────
# Text cleanup — copied from run-all-original-en.py
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
    if ' — ' in title:
        prefix, rest = title.split(' — ', 1)
        subtitle = rest.split('—')[0].strip()
        title = f'{prefix} — {subtitle}' if len(subtitle) <= 40 else prefix
    return title


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

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
    """Upload to R2 with subprocess timeout + exponential backoff."""
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
            transient = any(code in last_err for code in ["503", "500", "502", "504", "Service Unavailable", "timeout", "EAI_AGAIN", "ECONNRESET", "401", "400", "Bad Request"])
        except subprocess.TimeoutExpired:
            last_err = f"subprocess timeout after {per_call_timeout}s (wrangler hung)"
            transient = True
        if not transient or attempt == max_attempts:
            break
        time.sleep(2 ** attempt)  # 2, 4, 8, 16s
    return False, last_err


def process_chapter(pipeline, edition_key, chapter, ed_audio_dir, np, sf):
    """Generate WAVs, convert to MP3s, write manifest, generate title.mp3."""
    ch_num = chapter["number"]
    ch_dir = ed_audio_dir / f"ch{ch_num}"
    ch_dir.mkdir(parents=True, exist_ok=True)
    paragraphs = chapter.get("paragraphs", [])

    # 1. Generate paragraph WAVs (skip existing)
    for i, para in enumerate(paragraphs):
        wav = ch_dir / f"p{i}.wav"
        mp3 = ch_dir / f"p{i}.mp3"
        if mp3.exists():
            continue
        if wav.exists():
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

    # 2. Convert WAVs → MP3s
    for i in range(len(paragraphs)):
        wav = ch_dir / f"p{i}.wav"
        mp3 = ch_dir / f"p{i}.mp3"
        if mp3.exists() and (not wav.exists() or mp3.stat().st_mtime >= wav.stat().st_mtime):
            continue
        if wav.exists():
            wav_to_mp3(wav, mp3)

    # 3. Title.mp3
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

    # 4. Manifest
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
    """Upload all MP3s + manifest in a chapter to R2."""
    ch_name = ch_dir.name
    files = sorted(ch_dir.glob("*.mp3")) + sorted(ch_dir.glob("manifest.json"))
    ok, fail = 0, 0
    for f in files:
        ctype = "audio/mpeg" if f.suffix == ".mp3" else "application/json"
        key = f"{book_id}/{edition_key}/{ch_name}/{f.name}"
        success, err = r2_put(f, key, ctype)
        if success:
            ok += 1
        else:
            fail += 1
            log(f"    R2 FAIL {key}: {err}")
    return ok, fail


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    if not os.environ.get("CLOUDFLARE_API_TOKEN"):
        log("WARN: CLOUDFLARE_API_TOKEN not set in env — wrangler will probably fail.")
        log("      Run via the wrapper script run-audio-batch2.sh which auto-loads .env")

    log("Loading Kokoro + dependencies…")
    import numpy as np
    import soundfile as sf
    import kokoro
    pipeline = kokoro.KPipeline(lang_code="a")
    log("Kokoro ready.")

    for book_id, edition_key in JOBS:
        job_start = time.time()
        edition_file = EDITIONS_DIR / f"{book_id}-{edition_key}.json"
        if not edition_file.exists():
            log(f"SKIP {book_id}/{edition_key}: edition file missing")
            continue
        with open(edition_file) as f:
            edition = json.load(f)
        chapters = edition.get("chapters", [])
        ed_audio_dir = AUDIO_DIR / book_id / edition_key
        ed_audio_dir.mkdir(parents=True, exist_ok=True)

        log(f"═══ {book_id} / {edition_key}: {len(chapters)} chapters ═══")
        total_ok, total_fail = 0, 0
        for ch in chapters:
            ch_num = ch["number"]
            ch_start = time.time()
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
        log(f"═══ {book_id}/{edition_key} DONE: R2 {total_ok} ok / {total_fail} fail / {elapsed_min:.1f} min ═══\n")

    log("ALL JOBS DONE.")


if __name__ == "__main__":
    main()
