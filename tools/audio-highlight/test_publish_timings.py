"""Tests for the word-timing publisher, especially the supersede path.

These exercise what the publisher writes and — more importantly — what it
refuses to write, against a stubbed storage layer and a stubbed production
read path. No credentials, no network, no bytes leave the process.

Run: python3 -m unittest discover -s tools/audio-highlight -p 'test_*.py'
"""
from __future__ import annotations

import contextlib
import hashlib
import io
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi  # noqa: E402
import publish_timings  # noqa: E402

BOOK, EDITION, CHAPTER = "niels-lyhne", "modern-en", 3
KEY = f"{BOOK}/{EDITION}/ch{CHAPTER}/words.json"

PARAGRAPH_TEXT = "The lamp burned low and the house was quiet as a held breath."


def sidecar(text: str = PARAGRAPH_TEXT, *, chapter: int = CHAPTER) -> dict:
    words, cursor = [], 0.0
    for token in text.split():
        words.append({"text": token, "start": round(cursor, 3), "end": round(cursor + 0.3, 3)})
        cursor += 0.35
    return {"bookId": BOOK, "editionKey": EDITION, "chapter": chapter,
            "paragraphs": [{"paragraph": 0, "file": "p0.mp3", "words": words}]}


class FakeStorage:
    """Stands in for both R2 (writes) and production (reads of what R2 holds)."""

    def __init__(self):
        self.objects: dict[str, bytes] = {}
        self.puts: list[dict] = []
        self.serve_override: bytes | None = None
        self.before_put = None  # hook to simulate a concurrent writer

    # --- the write side, shaped like the boto3 S3 client the publisher uses ---
    def head_object(self, Bucket, Key):
        if Key not in self.objects:
            raise RuntimeError("NoSuchKey")
        return {"ETag": '"' + hashlib.md5(self.objects[Key]).hexdigest() + '"'}

    def put_object(self, Bucket, Key, Body, ContentType, IfNoneMatch=None, IfMatch=None):
        if self.before_put is not None:
            hook, self.before_put = self.before_put, None
            hook(Key)
        if IfNoneMatch == "*" and Key in self.objects:
            raise RuntimeError("PreconditionFailed")
        if IfMatch is not None:
            current = self.head_object(Bucket=Bucket, Key=Key)["ETag"]
            if IfMatch != current:
                raise RuntimeError("PreconditionFailed")
        self.puts.append({"key": Key, "body": Body, "ifNoneMatch": IfNoneMatch, "ifMatch": IfMatch})
        self.objects[Key] = Body
        return {}

    # --- the read side, standing in for prodapi ---
    def audio_object(self, path):
        if self.serve_override is not None and path in self.objects:
            return 200, self.serve_override
        if path not in self.objects:
            return 404, b""
        return 200, self.objects[path]

    def audio_object_size(self, path):
        if path not in self.objects:
            return 404, None
        return 200, len(self.objects[path])


class PublishTest(unittest.TestCase):
    def setUp(self):
        self.storage = FakeStorage()
        self.edition = {"chapters": [{"number": CHAPTER, "paragraphs": [PARAGRAPH_TEXT]}]}
        self.manifest = {"paragraphs": [{"paragraph": 0, "file": "p0.mp3", "duration": 30.0}]}

        self._saved = {name: getattr(prodapi, name)
                       for name in ("audio_object", "audio_object_size", "chapter_manifest",
                                    "edition_text", "chapter_words")}
        prodapi.audio_object = self.storage.audio_object
        prodapi.audio_object_size = self.storage.audio_object_size
        prodapi.chapter_manifest = lambda *_: (200, self.manifest)
        prodapi.edition_text = lambda *_: (200, self.edition)
        self._client = publish_timings.client
        publish_timings.client = lambda: self.storage
        for name in publish_timings.SUPERSEDE_ENV_NAMES:
            os.environ.pop(name, None)

    def tearDown(self):
        for name, value in self._saved.items():
            setattr(prodapi, name, value)
        publish_timings.client = self._client
        for name in publish_timings.SUPERSEDE_ENV_NAMES:
            os.environ.pop(name, None)

    # --- harness ---
    def run_publish(self, *args, candidate: dict | None = None, chapter: int = CHAPTER):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            words = root / "words.json"
            words.write_text(json.dumps(candidate if candidate is not None else sidecar()))
            candidates = root / "candidates.json"
            candidates.write_text(json.dumps([{"bookId": BOOK, "edition": EDITION,
                                               "chapter": chapter, "path": str(words)}]))
            journal = root / "journal.json"
            argv = ["publish_timings.py", "--candidates", str(candidates),
                    "--journal", str(journal), *args]
            old, sys.argv = sys.argv, argv
            try:
                with contextlib.redirect_stdout(io.StringIO()) as captured:
                    code = publish_timings.main()
            finally:
                sys.argv = old
            return code, json.loads(journal.read_text()), captured.getvalue()

    def publish_once(self):
        """Get a sidecar published the ordinary way, so there is something to supersede."""
        _, journal, _ = self.run_publish("--apply")
        self.assertEqual(journal[-1]["outcome"], "published")
        return journal[-1]

    # --- creating: unchanged ---

    def test_a_new_key_is_created_and_verified_against_the_served_bytes(self):
        _, journal, _ = self.run_publish("--apply")
        record = journal[-1]
        self.assertEqual(record["outcome"], "published")
        self.assertEqual(record["reason"], "served bytes match")
        self.assertEqual(record["servedSha256"], record["sha256"])
        self.assertEqual(self.storage.puts[0]["ifNoneMatch"], "*")

    def test_an_existing_key_is_still_skipped_and_journalled(self):
        self.publish_once()
        _, journal, _ = self.run_publish("--apply")
        record = journal[-1]
        self.assertEqual(record["outcome"], "skipped")
        self.assertEqual(record["reason"], "object already exists; this uploader never overwrites")
        self.assertEqual(len(self.storage.puts), 1, "nothing may be written over an existing key")

    def test_publication_is_unverified_when_production_serves_other_bytes(self):
        self.storage.serve_override = b"{}"
        _, journal, _ = self.run_publish("--apply")
        self.assertEqual(journal[-1]["outcome"], "published-unverified")

    # --- superseding: explicit, narrow, audited ---

    def test_superseding_without_the_flag_is_refused(self):
        original = self.publish_once()
        _, journal, _ = self.run_publish("--apply", candidate=sidecar("A wholly rewritten paragraph "
                                                                     "in plain modern prose entirely."))
        self.assertEqual(journal[-1]["outcome"], "skipped")
        self.assertEqual(self.storage.objects[KEY], json.dumps(sidecar()).encode(),
                         "the published object must be untouched")
        self.assertEqual(original["sha256"], hashlib.sha256(self.storage.objects[KEY]).hexdigest())

    def test_supersede_with_the_flag_replaces_and_journals_the_previous_sha_and_size(self):
        original = self.publish_once()
        replacement = sidecar()
        replacement["paragraphs"][0]["words"][0]["text"] = "The"  # same text, different bytes
        replacement["generator"] = "kokoro-2026-09-17"
        _, journal, _ = self.run_publish("--apply", "--supersede", KEY,
                                         "--supersede-reason", "modern-en chapter 3 retranslated",
                                         candidate=replacement)
        record = journal[-1]
        self.assertEqual(record["outcome"], "superseded")
        self.assertEqual(record["supersede"]["previousSha256"], original["sha256"])
        self.assertEqual(record["supersede"]["previousBytes"], original["bytes"])
        self.assertEqual(record["supersede"]["reason"], "modern-en chapter 3 retranslated")
        self.assertIn("previousETag", record["supersede"])
        self.assertEqual(record["servedSha256"], record["sha256"],
                         "a supersede is verified by the bytes production serves back, like any publication")
        self.assertEqual(self.storage.puts[-1]["ifMatch"], record["supersede"]["previousETag"],
                         "the replace must be conditional on the object we read")
        self.assertEqual(json.loads(self.storage.objects[KEY]), replacement)

    def test_supersede_that_fails_validation_is_refused_and_writes_nothing(self):
        self.publish_once()
        before = self.storage.objects[KEY]
        broken = sidecar("completely unrelated wording that shares nothing with the edition text here")
        _, journal, _ = self.run_publish("--apply", "--supersede", KEY,
                                         "--supersede-reason", "retranslation",
                                         candidate=broken)
        record = journal[-1]
        self.assertEqual(record["outcome"], "skipped")
        self.assertEqual(record["reason"], "failed validation")
        self.assertTrue(record["validationFailures"])
        self.assertTrue(any("below 0.85" in f for f in record["validationFailures"]))
        self.assertEqual(self.storage.objects[KEY], before, "a failing supersede writes nothing")
        self.assertEqual(len(self.storage.puts), 1)

    def test_supersede_of_a_key_that_does_not_exist_is_refused_not_created(self):
        _, journal, _ = self.run_publish("--apply", "--supersede", KEY,
                                         "--supersede-reason", "retranslation")
        record = journal[-1]
        self.assertEqual(record["outcome"], "skipped")
        self.assertIn("does not exist", record["reason"])
        self.assertEqual(self.storage.objects, {}, "a supersede must never create")
        self.assertEqual(self.storage.puts, [])

    def test_supersede_refuses_if_another_writer_changed_the_object_first(self):
        self.publish_once()
        replacement = sidecar()
        replacement["generator"] = "kokoro-2026-09-17"

        def concurrent_writer(key):
            self.storage.objects[key] = b'{"written": "by someone else"}'

        self.storage.before_put = concurrent_writer
        _, journal, _ = self.run_publish("--apply", "--supersede", KEY,
                                         "--supersede-reason", "retranslation",
                                         candidate=replacement)
        record = journal[-1]
        self.assertEqual(record["outcome"], "skipped")
        self.assertIn("supersede refused", record["reason"])
        self.assertEqual(self.storage.objects[KEY], b'{"written": "by someone else"}',
                         "the concurrent writer's bytes must survive")

    def test_supersede_needs_a_reason(self):
        with self.assertRaises(SystemExit):
            with contextlib.redirect_stdout(io.StringIO()):
                self.run_publish("--apply", "--supersede", KEY)

    def test_supersede_cannot_be_switched_on_by_an_environment_variable(self):
        self.publish_once()
        for name in publish_timings.SUPERSEDE_ENV_NAMES:
            os.environ[name] = KEY
            try:
                with self.assertRaises(SystemExit, msg=f"{name} must not enable superseding"):
                    with contextlib.redirect_stdout(io.StringIO()):
                        self.run_publish("--apply")
            finally:
                os.environ.pop(name, None)
        self.assertEqual(len(self.storage.puts), 1)

    def test_supersede_cannot_be_a_wildcard_or_a_blanket_switch(self):
        for value in ("*", f"{BOOK}/*", "all", f"{BOOK}/{EDITION}/ch?/words.json"):
            with self.assertRaises(Exception, msg=f"{value!r} must not be accepted"):
                publish_timings.normalise_supersede(value)

    def test_supersede_accepts_chapter_shorthand_for_the_same_object(self):
        self.assertEqual(publish_timings.normalise_supersede(f"{BOOK}/{EDITION}/{CHAPTER}"), KEY)
        self.assertEqual(publish_timings.normalise_supersede(KEY), KEY)

    def test_a_dry_run_supersede_writes_nothing_but_records_what_it_would_replace(self):
        original = self.publish_once()
        replacement = sidecar()
        replacement["generator"] = "kokoro-2026-09-17"
        _, journal, output = self.run_publish("--supersede", KEY, "--supersede-reason", "retranslation",
                                              candidate=replacement)
        record = journal[-1]
        self.assertEqual(record["outcome"], "validated")
        self.assertIn("dry run", record["reason"])
        self.assertEqual(record["supersede"]["previousSha256"], original["sha256"])
        self.assertEqual(len(self.storage.puts), 1, "a dry run uploads nothing")

    def test_supersede_naming_a_key_with_no_candidate_is_journalled_not_ignored(self):
        self.publish_once()
        other = f"{BOOK}/{EDITION}/ch9/words.json"
        _, journal, _ = self.run_publish("--apply", "--supersede", other,
                                         "--supersede-reason", "retranslation")
        self.assertEqual(journal[-1]["key"], other)
        self.assertIn("no candidate", journal[-1]["reason"])

    def test_a_byte_identical_supersede_is_a_no_op(self):
        self.publish_once()
        _, journal, _ = self.run_publish("--apply", "--supersede", KEY,
                                         "--supersede-reason", "retranslation")
        self.assertEqual(journal[-1]["outcome"], "skipped")
        self.assertIn("byte-identical", journal[-1]["reason"])
        self.assertEqual(len(self.storage.puts), 1)


if __name__ == "__main__":
    unittest.main()
