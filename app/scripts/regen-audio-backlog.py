#!/usr/bin/env python3
"""
Regen Audio Backlog — run this whenever you open your PC.

Fetches pending audio regen requests from Supabase (created by the
auto-fix pipeline when a user's translation issue is confirmed),
regenerates the affected paragraph's MP3 via Edge TTS, uploads it
to R2, updates the chapter manifest, and marks the task done.

Usage:
  python3 scripts/regen-audio-backlog.py

Requires:
  pip install edge-tts boto3 requests
"""

import asyncio
import json
import os
import sys
import tempfile
import time

import boto3
import edge_tts
import requests

def load_env_file(path: str):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

SCRIPT_DIR = os.path.dirname(__file__)
APP_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
load_env_file(os.path.join(APP_DIR, ".env"))
load_env_file(os.path.join(APP_DIR, ".env.local"))

# ── Config ────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
R2_BUCKET = os.environ.get("R2_BUCKET", "tinct-audio")
R2_ACCESS = os.environ.get("R2_ACCESS_KEY_ID", "")
R2_SECRET = os.environ.get("R2_SECRET_ACCESS_KEY", "")
R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "")

VOICE_FOR_LANG = {
    "da": "da-DK-ChristelNeural",
    "en": "en-US-AriaNeural",
}

def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

def fetch_pending():
    url = f"{SUPABASE_URL}/rest/v1/pending_audio_regen?status=eq.pending&order=created_at.asc"
    r = requests.get(url, headers=supabase_headers())
    r.raise_for_status()
    return r.json()

def mark_done(row_id):
    url = f"{SUPABASE_URL}/rest/v1/pending_audio_regen?id=eq.{row_id}"
    requests.patch(url, headers=supabase_headers(), json={"status": "done"})

def get_voice(edition_key: str) -> str:
    lang = edition_key.split("-")[-1]  # "modern-en" → "en", "modern-da" → "da"
    return VOICE_FOR_LANG.get(lang, "en-US-AriaNeural")

async def generate_paragraph_mp3(text: str, voice: str, out_path: str):
    comm = edge_tts.Communicate(text, voice, rate="-8%")
    await comm.save(out_path)

def get_audio_duration(mp3_path: str) -> float:
    """Best-effort duration using mutagen if available, else 0."""
    try:
        from mutagen.mp3 import MP3
        return MP3(mp3_path).info.length
    except Exception:
        return 0.0

def s3_client():
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS,
        aws_secret_access_key=R2_SECRET,
        region_name="auto",
    )

def fetch_manifest(s3, book_id: str, edition_key: str, chapter: int) -> dict:
    key = f"{book_id}/{edition_key}/ch{chapter}/manifest.json"
    try:
        obj = s3.get_object(Bucket=R2_BUCKET, Key=key)
        return json.loads(obj["Body"].read())
    except Exception:
        return {"chapter": chapter, "paragraphs": []}

def upload_file(s3, local_path: str, r2_key: str, content_type: str):
    s3.upload_file(
        local_path, R2_BUCKET, r2_key,
        ExtraArgs={"ContentType": content_type}
    )

def process_row(row: dict):
    book_id       = row["book_id"]
    edition_key   = row["edition_key"]
    chapter       = row["chapter_number"]
    para_idx      = row["paragraph_index"]
    patched_text  = row["patched_text"]
    row_id        = row["id"]

    voice = get_voice(edition_key)
    print(f"  → {book_id}/{edition_key} ch{chapter} p{para_idx} ({voice})")

    s3 = s3_client()

    with tempfile.TemporaryDirectory() as tmp:
        mp3_local = os.path.join(tmp, f"p{para_idx}.mp3")

        # Generate audio
        asyncio.run(generate_paragraph_mp3(patched_text, voice, mp3_local))
        duration = get_audio_duration(mp3_local)

        # Upload MP3
        r2_mp3_key = f"{book_id}/{edition_key}/ch{chapter}/p{para_idx}.mp3"
        upload_file(s3, mp3_local, r2_mp3_key, "audio/mpeg")
        print(f"    Uploaded {r2_mp3_key} ({duration:.1f}s)")

        # Update manifest
        manifest = fetch_manifest(s3, book_id, edition_key, chapter)
        updated = False
        for entry in manifest.get("paragraphs", []):
            if entry.get("paragraph") == para_idx:
                entry["duration"] = round(duration, 3)
                updated = True
                break
        if not updated:
            manifest.setdefault("paragraphs", []).append({
                "paragraph": para_idx,
                "duration": round(duration, 3),
                "file": f"p{para_idx}.mp3",
            })
            manifest["paragraphs"].sort(key=lambda e: e["paragraph"])

        manifest_local = os.path.join(tmp, "manifest.json")
        with open(manifest_local, "w") as f:
            json.dump(manifest, f, indent=2)

        r2_manifest_key = f"{book_id}/{edition_key}/ch{chapter}/manifest.json"
        upload_file(s3, manifest_local, r2_manifest_key, "application/json")
        print(f"    Updated manifest for ch{chapter}")

    mark_done(row_id)
    print(f"    ✓ Done (row {row_id})")

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.")
        print("  export SUPABASE_URL=https://xxx.supabase.co")
        print("  export SUPABASE_SERVICE_ROLE_KEY=...")
        sys.exit(1)
    if not R2_ACCESS or not R2_SECRET or not R2_ENDPOINT:
        print("Error: Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT env vars.")
        print("  export R2_ACCESS_KEY_ID=...")
        print("  export R2_SECRET_ACCESS_KEY=...")
        print("  export R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com")
        sys.exit(1)

    print("Checking audio regen backlog…")
    rows = fetch_pending()

    if not rows:
        print("Nothing to regen. All clear.")
        return

    print(f"Found {len(rows)} pending item(s).")
    for row in rows:
        try:
            process_row(row)
        except Exception as e:
            print(f"  ✗ Failed for row {row.get('id')}: {e}")

    print("\nDone.")

if __name__ == "__main__":
    main()
