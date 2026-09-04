#!/usr/bin/env python3
"""Tests for the batch generator that do not require Whisper or network."""

import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from words_sidecar_lib import AlignmentStats


MODULE_PATH = Path(__file__).with_name("generate-words-sidecar.py")
SPEC = importlib.util.spec_from_file_location("generate_words_sidecar", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class GenerateWordsSidecarTests(unittest.TestCase):
    def test_downloaded_mp3_is_removed_when_alignment_fails(self):
        with tempfile.TemporaryDirectory() as temp:
            out_dir = Path(temp) / "ch1"
            words = [
                {"text": "Alpha", "start": 0.0, "end": 0.2},
                {"text": "beta", "start": 0.2, "end": 0.4},
            ]
            with (
                patch.object(MODULE, "load_chapter_text", return_value={
                    "number": 1,
                    "title": "Chapter 1",
                    "paragraphs": ["Alpha beta"],
                }),
                patch.object(MODULE, "fetch_manifest", return_value={
                    "paragraphs": [{"paragraph": 0, "file": "p0.mp3", "duration": 0.4}],
                }),
                patch.object(MODULE, "http_get_bytes", return_value=b"mp3"),
                patch.object(MODULE, "process_paragraph", return_value=(
                    words,
                    AlignmentStats(expected_words=2, heard_words=1, matched_words=1),
                )),
            ):
                ok, detail = MODULE.generate_chapter(
                    "example",
                    "modern-en",
                    1,
                    out_dir,
                    model=object(),
                    model_name="small.en",
                    language="en",
                    min_alignment=0.85,
                )

            self.assertFalse(ok)
            self.assertIn("low observed alignment", detail)
            self.assertFalse((out_dir / "p0.mp3").exists())
            self.assertFalse((out_dir / "words.json").exists())

    def test_valid_sidecar_records_observed_alignment(self):
        with tempfile.TemporaryDirectory() as temp:
            out_dir = Path(temp) / "ch1"
            words = [
                {"text": "Alpha", "start": 0.0, "end": 0.2},
                {"text": "beta", "start": 0.2, "end": 0.4},
            ]
            with (
                patch.object(MODULE, "load_chapter_text", return_value={
                    "number": 1,
                    "title": "Chapter 1",
                    "paragraphs": ["Alpha beta"],
                }),
                patch.object(MODULE, "fetch_manifest", return_value={
                    "paragraphs": [{"paragraph": 0, "file": "p0.mp3", "duration": 0.4}],
                }),
                patch.object(MODULE, "http_get_bytes", return_value=b"mp3"),
                patch.object(MODULE, "process_paragraph", return_value=(
                    words,
                    AlignmentStats(expected_words=2, heard_words=2, matched_words=2),
                )),
            ):
                ok, _detail = MODULE.generate_chapter(
                    "example",
                    "modern-en",
                    1,
                    out_dir,
                    model=object(),
                    model_name="small.en",
                    language="en",
                    min_alignment=0.85,
                )

            self.assertTrue(ok)
            sidecar = __import__("json").loads((out_dir / "words.json").read_text())
            self.assertEqual(sidecar["alignment"]["matchRatio"], 1.0)
            self.assertEqual(sidecar["paragraphs"][0]["alignment"]["matchRatio"], 1.0)
            self.assertFalse((out_dir / "p0.mp3").exists())

    def test_existing_sidecar_must_match_manifest_before_skip(self):
        with tempfile.TemporaryDirectory() as temp:
            out_dir = Path(temp) / "ch1"
            out_dir.mkdir(parents=True)
            (out_dir / "words.json").write_text(__import__("json").dumps({
                "bookId": "example", "editionKey": "modern-en", "chapter": 1,
                "paragraphs": [{"paragraph": 0, "file": "wrong.mp3", "alignment": {"matchRatio": 1}, "words": [
                    {"text": "Alpha", "start": 0, "end": 0.2},
                ]}],
            }))
            with (
                patch.object(MODULE, "load_chapter_text", return_value={"paragraphs": ["Alpha"]}),
                patch.object(MODULE, "fetch_manifest", return_value={"paragraphs": [
                    {"paragraph": 0, "file": "p0.mp3", "duration": 1.0},
                ]}),
                patch.object(MODULE, "http_get_bytes", return_value=b"mp3"),
                patch.object(MODULE, "process_paragraph", return_value=(
                    [{"text": "Alpha", "start": 0, "end": 0.2}],
                    AlignmentStats(expected_words=1, heard_words=1, matched_words=1),
                )),
            ):
                ok, _detail = MODULE.generate_chapter(
                    "example", "modern-en", 1, out_dir, model=object(), model_name="small.en",
                    language="en", min_alignment=0.85,
                )
            self.assertTrue(ok)


if __name__ == "__main__":
    unittest.main()
