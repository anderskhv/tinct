"""Read-only production access for audio highlighting audits.

Everything here uses the public, unauthenticated tinct.app endpoints, so an
audit can run from any cloud worker with no Cloudflare credentials and no
dependency on a local machine. Nothing in this module writes.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://tinct.app"
UA = "tinct-audio-highlight-audit/1.0"


def _get(url: str, *, headers: dict[str, str] | None = None, attempts: int = 4):
    """Return (status, body_bytes, response_headers). Retries 5xx and transport errors."""
    last = None
    for attempt in range(attempts):
        request = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.status, response.read(), dict(response.headers)
        except urllib.error.HTTPError as error:
            if error.code >= 500:
                last = error
                time.sleep(0.4 * (attempt + 1))
                continue
            return error.code, b"", dict(error.headers or {})
        except Exception as error:  # transport: reset, timeout, proxy hiccup
            last = error
            time.sleep(0.4 * (attempt + 1))
    raise RuntimeError(f"GET failed after {attempts} attempts: {url} ({last})")


def audio_object(path: str) -> tuple[int, bytes]:
    """GET an object from the audio bucket through the worker's read route."""
    url = f"{BASE}/api/audio-file?path={urllib.parse.quote(path, safe='')}"
    status, body, _ = _get(url)
    return status, body


def audio_object_size(path: str) -> tuple[int, int | None]:
    """Presence + size without downloading the body, via a one-byte range request."""
    url = f"{BASE}/api/audio-file?path={urllib.parse.quote(path, safe='')}"
    status, _, headers = _get(url, headers={"Range": "bytes=0-0"})
    total = None
    content_range = headers.get("Content-Range")
    if content_range and "/" in content_range:
        try:
            total = int(content_range.rsplit("/", 1)[1])
        except ValueError:
            total = None
    return status, total


def chapter_manifest(book_id: str, edition: str, chapter: int) -> tuple[int, dict | None]:
    path = f"{book_id}/{edition}/ch{chapter}/manifest.json"
    url = f"{BASE}/api/audio-manifest?path={urllib.parse.quote(path, safe='')}"
    status, body, _ = _get(url)
    if status != 200:
        return status, None
    try:
        return status, json.loads(body)
    except json.JSONDecodeError:
        return status, None


def chapter_words(book_id: str, edition: str, chapter: int) -> tuple[int, dict | None, bytes]:
    status, body = audio_object(f"{book_id}/{edition}/ch{chapter}/words.json")
    if status != 200:
        return status, None, b""
    try:
        return status, json.loads(body), body
    except json.JSONDecodeError:
        return status, None, body


def edition_text(book_id: str, edition: str) -> tuple[int, dict | None]:
    """Published edition text. Same bytes the reader renders."""
    url = f"{BASE}/data/editions/{book_id}-{edition}.json"
    status, body, _ = _get(url)
    if status != 200:
        return status, None
    try:
        return status, json.loads(body)
    except json.JSONDecodeError:
        return status, None
