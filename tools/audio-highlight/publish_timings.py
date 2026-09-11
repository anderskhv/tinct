"""Publish verified word-timing sidecars to R2, conditionally and never over an existing object.

Order of operations for every candidate, with no step skippable:

  1. validate the candidate against production truth — the chapter manifest's
     paragraph/file mapping, timestamp bounds, and the published edition text
     at the existing 0.85 threshold (verify_timings.check_chapter, but run
     against the local candidate instead of a published object)
  2. refuse if the key already exists; this uploader creates, it never replaces
  3. upload with If-None-Match so a concurrent writer cannot be clobbered
  4. re-read the bytes production actually serves and compare the SHA-256
  5. append to the publication journal: key, hash, size, validation summary,
     source file, and when it happened

A candidate that fails any check is skipped and recorded as skipped. Nothing is
deleted and nothing is overwritten, so this is safe to run concurrently with
another owner's publisher.

Credentials come from R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ENDPOINT in
the environment (see app/.env.example). They are never logged.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi  # noqa: E402
import verify_timings  # noqa: E402

BUCKET = "tinct-audio"


def client():
    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        raise SystemExit("boto3 is required to publish: pip install boto3")
    key_id = os.environ.get("R2_ACCESS_KEY_ID")
    secret = os.environ.get("R2_SECRET_ACCESS_KEY")
    endpoint = os.environ.get("R2_ENDPOINT")
    missing = [n for n, v in [("R2_ACCESS_KEY_ID", key_id), ("R2_SECRET_ACCESS_KEY", secret),
                              ("R2_ENDPOINT", endpoint)] if not v]
    if missing:
        raise SystemExit(f"not configured for publishing: {', '.join(missing)} unset")
    return boto3.client("s3", endpoint_url=endpoint, aws_access_key_id=key_id,
                        aws_secret_access_key=secret, region_name="auto",
                        config=Config(signature_version="s3v4", retries={"max_attempts": 3}))


def validate_candidate(candidate: dict, book_id: str, edition: str, chapter: int) -> list[str]:
    """Run the published-sidecar checks against a candidate that is not published yet."""
    original = prodapi.chapter_words
    prodapi.chapter_words = lambda *_: (200, candidate, json.dumps(candidate).encode())
    try:
        status, text = prodapi.edition_text(book_id, edition)
        result = verify_timings.check_chapter(book_id, edition, chapter, text if status == 200 and text else {})
    finally:
        prodapi.chapter_words = original
    return result["failures"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--candidates", required=True,
                        help="JSON file: [{bookId, edition, chapter, path}, ...] where path is a local words.json")
    parser.add_argument("--journal", required=True, help="publication journal to append to")
    parser.add_argument("--apply", action="store_true", help="actually upload; without it, validate only")
    args = parser.parse_args()

    candidates = json.loads(Path(args.candidates).read_text())
    s3 = client() if args.apply else None
    journal_path = Path(args.journal)
    journal = json.loads(journal_path.read_text()) if journal_path.exists() else []

    published = skipped = 0
    for entry in candidates:
        book_id, edition, chapter = entry["bookId"], entry["edition"], int(entry["chapter"])
        key = f"{book_id}/{edition}/ch{chapter}/words.json"
        source = Path(entry["path"])
        record = {"key": key, "source": str(source),
                  "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}

        if not source.exists():
            record.update(outcome="skipped", reason="candidate file missing")
        else:
            body = source.read_bytes()
            record["sha256"] = hashlib.sha256(body).hexdigest()
            record["bytes"] = len(body)
            failures = validate_candidate(json.loads(body), book_id, edition, chapter)
            record["validationFailures"] = failures
            if failures:
                record.update(outcome="skipped", reason="failed validation")
            elif prodapi.audio_object_size(key)[0] in (200, 206):
                record.update(outcome="skipped", reason="object already exists; this uploader never overwrites")
            elif not args.apply:
                record.update(outcome="validated", reason="dry run")
            else:
                try:
                    s3.put_object(Bucket=BUCKET, Key=key, Body=body,
                                  ContentType="application/json", IfNoneMatch="*")
                except Exception as error:  # includes PreconditionFailed from a concurrent create
                    record.update(outcome="skipped", reason=f"upload refused: {type(error).__name__}")
                else:
                    status, served = prodapi.audio_object(key)
                    served_hash = hashlib.sha256(served).hexdigest() if status == 200 else None
                    record["servedSha256"] = served_hash
                    if served_hash == record["sha256"]:
                        record.update(outcome="published", reason="served bytes match")
                    else:
                        record.update(outcome="published-unverified",
                                      reason=f"served bytes differ or unreadable (HTTP {status})")

        journal.append(record)
        published += record["outcome"] == "published"
        skipped += record["outcome"].startswith("skipped")
        print(f"{record['outcome']:20} {key}  {record.get('reason','')}")

    journal_path.write_text(json.dumps(journal, indent=1))
    print(f"\npublished {published}, skipped {skipped}, journal {journal_path} ({len(journal)} entries)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
