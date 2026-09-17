"""Publish verified word-timing sidecars to R2: create by default, supersede only when named.

Order of operations for every candidate, with no step skippable:

  1. validate the candidate against production truth — the chapter manifest's
     paragraph/file mapping, timestamp bounds, and the published edition text
     at the existing 0.85 threshold (verify_timings.check_chapter, but run
     against the local candidate instead of a published object)
  2. refuse if the key already exists, unless this exact key was named on the
     command line with --supersede; this uploader creates, and it replaces only
     what an operator has pointed at by name
  3. upload with If-None-Match (create) or If-Match on the current ETag
     (supersede) so a concurrent writer cannot be clobbered either way
  4. re-read the bytes production actually serves and compare the SHA-256
  5. append to the publication journal: key, hash, size, validation summary,
     source file, and when it happened — plus, for a supersede, the SHA-256,
     size and ETag of the object that was replaced and the operator's stated
     reason, so the replacement is auditable and reversible

A candidate that fails any check is skipped and recorded as skipped. Nothing is
deleted, and nothing is overwritten that was not named, so this is safe to run
concurrently with another owner's publisher.

Superseding exists because a chapter's text can genuinely change (a modern-en
edition rewritten from a word-swap into a real translation), which makes its
audio and its timing sidecar stale. It is deliberately narrow:

  * it is per-key: --supersede takes an exact object key (or bookId/edition/chapter),
    repeatable. There is no "overwrite everything" switch and no wildcard.
  * it cannot come from the environment. The flag is read from argv only, and a
    run that sets a supersede-looking environment variable is refused outright
    so the behaviour cannot be switched on by a CI variable.
  * it requires --supersede-reason, recorded in the journal.
  * it runs the identical validation, at the identical 0.85 threshold. There is
    no bypass flag.
  * it refuses if the named key does not already exist, rather than creating it.

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

# Superseding must be an explicit act by the person running the command. These
# names are refused rather than honoured so that nobody can turn replacement on
# for a whole pipeline by setting a variable.
SUPERSEDE_ENV_NAMES = (
    "TINCT_SUPERSEDE",
    "PUBLISH_SUPERSEDE",
    "AUDIO_HIGHLIGHT_SUPERSEDE",
    "SUPERSEDE_KEYS",
)


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


def object_key(book_id: str, edition: str, chapter: int) -> str:
    return f"{book_id}/{edition}/ch{chapter}/words.json"


def normalise_supersede(value: str) -> str:
    """Accept either the full object key or bookId/edition/chapter shorthand.

    Deliberately does not accept wildcards, prefixes or 'all': a supersede names
    exactly one object.
    """
    target = value.strip().strip("/")
    if not target:
        raise argparse.ArgumentTypeError("--supersede needs an object key")
    if any(character in target for character in "*?") or target.lower() == "all":
        raise argparse.ArgumentTypeError(
            f"--supersede names exactly one object key; {value!r} is not one")
    parts = target.split("/")
    if len(parts) == 3 and not parts[2].startswith("ch"):
        book_id, edition, chapter = parts
        try:
            return object_key(book_id, edition, int(chapter))
        except ValueError:
            raise argparse.ArgumentTypeError(f"{value!r} is not a chapter or an object key")
    if len(parts) == 4 and parts[3] == "words.json" and parts[2].startswith("ch"):
        return target
    raise argparse.ArgumentTypeError(
        f"{value!r} is not an object key (bookId/edition/chN/words.json) or bookId/edition/chapter")


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


def describe_existing(key: str) -> dict | None:
    """Read the object currently published under this key, for the audit trail.

    Returns None if production will not serve it back; a supersede that cannot
    record what it replaced is not reversible, so it is refused.
    """
    status, body = prodapi.audio_object(key)
    if status != 200 or not body:
        return None
    return {"sha256": hashlib.sha256(body).hexdigest(), "bytes": len(body)}


def publish(candidates: list[dict], journal_path: Path, *, apply: bool,
            supersede: list[str], supersede_reason: str, s3=None) -> tuple[int, int, int]:
    journal = json.loads(journal_path.read_text()) if journal_path.exists() else []
    pending_supersede = set(supersede)

    published = superseded = skipped = 0
    for entry in candidates:
        book_id, edition, chapter = entry["bookId"], entry["edition"], int(entry["chapter"])
        key = object_key(book_id, edition, chapter)
        source = Path(entry["path"])
        record = {"key": key, "source": str(source),
                  "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        replacing = key in pending_supersede
        pending_supersede.discard(key)

        if not source.exists():
            record.update(outcome="skipped", reason="candidate file missing")
        else:
            body = source.read_bytes()
            record["sha256"] = hashlib.sha256(body).hexdigest()
            record["bytes"] = len(body)
            failures = validate_candidate(json.loads(body), book_id, edition, chapter)
            record["validationFailures"] = failures
            exists = prodapi.audio_object_size(key)[0] in (200, 206)
            if failures:
                # Identical for a supersede: validation is never bypassed, and a
                # failing supersede writes nothing.
                record.update(outcome="skipped", reason="failed validation")
                if replacing:
                    record["supersede"] = {"requested": True, "reason": supersede_reason}
            elif replacing and not exists:
                record.update(outcome="skipped",
                              reason="supersede names a key that does not exist; "
                                     "publish it as an ordinary creation instead")
            elif replacing:
                previous = describe_existing(key)
                if previous is None:
                    record.update(outcome="skipped",
                                  reason="supersede refused: production would not serve the "
                                         "object being replaced, so the replacement could not be recorded")
                else:
                    record["supersede"] = {
                        "requested": True,
                        "reason": supersede_reason,
                        "previousSha256": previous["sha256"],
                        "previousBytes": previous["bytes"],
                    }
                    if previous["sha256"] == record["sha256"]:
                        record.update(outcome="skipped",
                                      reason="supersede is a no-op: candidate is byte-identical to what is published")
                    elif not apply:
                        record.update(outcome="validated", reason="dry run (supersede)")
                    else:
                        record.update(_replace(s3, key, body, record))
            elif exists:
                # Unchanged wording: a run that named no supersede key behaves
                # exactly as this uploader always has.
                record.update(outcome="skipped", reason="object already exists; this uploader never overwrites")
            elif not apply:
                record.update(outcome="validated", reason="dry run")
            else:
                record.update(_create(s3, key, body, record))

        journal.append(record)
        published += record["outcome"] == "published"
        superseded += record["outcome"] == "superseded"
        skipped += record["outcome"].startswith("skipped")
        print(f"{record['outcome']:20} {key}  {record.get('reason','')}")

    for key in sorted(pending_supersede):
        record = {"key": key, "source": None,
                  "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                  "outcome": "skipped",
                  "reason": "supersede named a key with no candidate in this run",
                  "supersede": {"requested": True, "reason": supersede_reason}}
        journal.append(record)
        skipped += 1
        print(f"{record['outcome']:20} {key}  {record['reason']}")

    journal_path.write_text(json.dumps(journal, indent=1))
    return published, superseded, skipped


def _verify_served(key: str, record: dict) -> dict:
    """Production must serve the bytes back with a matching SHA before this counts."""
    status, served = prodapi.audio_object(key)
    served_hash = hashlib.sha256(served).hexdigest() if status == 200 else None
    return {"servedSha256": served_hash,
            "matched": served_hash == record["sha256"],
            "status": status}


def _create(s3, key: str, body: bytes, record: dict) -> dict:
    try:
        s3.put_object(Bucket=BUCKET, Key=key, Body=body,
                      ContentType="application/json", IfNoneMatch="*")
    except Exception as error:  # includes PreconditionFailed from a concurrent create
        return {"outcome": "skipped", "reason": f"upload refused: {type(error).__name__}"}
    served = _verify_served(key, record)
    record["servedSha256"] = served["servedSha256"]
    if served["matched"]:
        return {"outcome": "published", "reason": "served bytes match"}
    return {"outcome": "published-unverified",
            "reason": f"served bytes differ or unreadable (HTTP {served['status']})"}


def _replace(s3, key: str, body: bytes, record: dict) -> dict:
    """Conditional replace of one named object, guarded by its current ETag."""
    try:
        head = s3.head_object(Bucket=BUCKET, Key=key)
    except Exception as error:
        return {"outcome": "skipped", "reason": f"supersede refused: {type(error).__name__} reading current object"}
    etag = head.get("ETag")
    if not etag:
        return {"outcome": "skipped", "reason": "supersede refused: current object has no ETag to match against"}
    record["supersede"]["previousETag"] = etag
    try:
        # If another owner replaced this object since we read it, the ETag no
        # longer matches and the write is refused rather than clobbering them.
        s3.put_object(Bucket=BUCKET, Key=key, Body=body,
                      ContentType="application/json", IfMatch=etag)
    except Exception as error:  # includes PreconditionFailed from a concurrent write
        return {"outcome": "skipped", "reason": f"supersede refused: {type(error).__name__}"}
    served = _verify_served(key, record)
    record["servedSha256"] = served["servedSha256"]
    if served["matched"]:
        return {"outcome": "superseded", "reason": "served bytes match the replacement"}
    return {"outcome": "superseded-unverified",
            "reason": f"served bytes differ or unreadable (HTTP {served['status']})"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--candidates", required=True,
                        help="JSON file: [{bookId, edition, chapter, path}, ...] where path is a local words.json")
    parser.add_argument("--journal", required=True, help="publication journal to append to")
    parser.add_argument("--apply", action="store_true", help="actually upload; without it, validate only")
    parser.add_argument("--supersede", action="append", default=[], type=normalise_supersede,
                        metavar="KEY",
                        help="replace exactly this already-published object (bookId/edition/chN/words.json "
                             "or bookId/edition/chapter). Repeatable, never a wildcard. Requires "
                             "--supersede-reason. Validation is unchanged and a key that does not exist "
                             "is refused, not created.")
    parser.add_argument("--supersede-reason", default="",
                        help="why the text this sidecar describes changed; recorded in the journal")
    args = parser.parse_args()

    set_env = [name for name in SUPERSEDE_ENV_NAMES if os.environ.get(name)]
    if set_env:
        raise SystemExit(
            f"refusing to run: {', '.join(set_env)} is set. Superseding is an explicit, per-key "
            "command-line act and is never taken from the environment; pass --supersede KEY instead.")
    if args.supersede and not args.supersede_reason.strip():
        raise SystemExit("--supersede requires --supersede-reason: a replacement must record why")
    if args.supersede_reason and not args.supersede:
        raise SystemExit("--supersede-reason given without --supersede: nothing would be replaced")

    candidates = json.loads(Path(args.candidates).read_text())
    s3 = client() if args.apply else None
    journal_path = Path(args.journal)

    published, superseded, skipped = publish(
        candidates, journal_path, apply=args.apply, supersede=args.supersede,
        supersede_reason=args.supersede_reason.strip(), s3=s3)

    journal = json.loads(journal_path.read_text())
    replaced = f"superseded {superseded}, " if args.supersede else ""
    print(f"\npublished {published}, {replaced}skipped {skipped}, "
          f"journal {journal_path} ({len(journal)} entries)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
