#!/usr/bin/env python3
"""Tests for the batch generator that do not require Whisper or network."""

import contextlib
import importlib.util
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from words_sidecar_lib import AlignmentStats, BIAS_OFF, BiasRequest, ParagraphAlignment


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


class FakeWhisperModel:
    """Records transcribe() kwargs and returns a scripted transcript per call."""

    def __init__(self, scripts):
        self.scripts = list(scripts)
        self.calls = []

    def transcribe(self, audio, **kwargs):
        self.calls.append(kwargs)
        words = self.scripts.pop(0)

        class Word:
            def __init__(self, text, index):
                self.word = " " + text
                self.start = float(index)
                self.end = float(index) + 0.5

        class Segment:
            def __init__(self, items):
                self.words = [Word(text, index) for index, text in enumerate(items)]

        return iter([Segment(words)]), None


class TextBiasPlumbingTests(unittest.TestCase):
    def test_cli_flag_defaults_and_choices(self):
        args = MODULE.parse_args(["bible", "web-en", "--chapter", "5"])
        self.assertEqual(args.bias_text, MODULE.DEFAULT_BIAS_MODE)
        self.assertEqual(args.bias_retry_below, 1.0)
        args = MODULE.parse_args(["bible", "web-en", "--bias-retry-below", "0.85"])
        self.assertEqual(args.bias_retry_below, 0.85)
        for mode in ("off", "prompt", "hotwords", "both", "auto"):
            args = MODULE.parse_args(["bible", "web-en", "--bias-text", mode])
            self.assertEqual(args.bias_text, mode)
        with self.assertRaises(SystemExit), contextlib.redirect_stderr(io.StringIO()):
            MODULE.parse_args(["bible", "web-en", "--bias-text", "loud"])

    def test_transcribe_words_passes_prompt_and_hotwords_only_when_set(self):
        model = FakeWhisperModel([["Seth", "lived"], ["Seth", "lived"]])
        MODULE.transcribe_words(model, Path("p0.mp3"), "en", BIAS_OFF)
        self.assertNotIn("initial_prompt", model.calls[0])
        self.assertNotIn("hotwords", model.calls[0])
        MODULE.transcribe_words(
            model, Path("p0.mp3"), "en",
            BiasRequest(mode="both", initial_prompt="Seth lived", hotwords="Seth"),
        )
        self.assertEqual(model.calls[1]["initial_prompt"], "Seth lived")
        self.assertEqual(model.calls[1]["hotwords"], "Seth")
        self.assertTrue(model.calls[1]["word_timestamps"])

    def test_align_paragraph_records_bias_mode_that_produced_the_words(self):
        text = "Seth lived after he became the father of Enosh."
        model = FakeWhisperModel([text.replace(".", "").split()])
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "prompt", 0.85)
        self.assertEqual(aligned.bias, "prompt")
        self.assertFalse(aligned.bias_fallback)
        self.assertEqual(aligned.stats.match_ratio, 1.0)
        self.assertEqual(len(model.calls), 1)
        self.assertEqual(model.calls[0]["initial_prompt"], text)

    def test_align_paragraph_skips_retry_when_ratio_meets_threshold(self):
        text = "Seth lived after he became the father of Enosh and Kenan and Mahalalel."
        biased = text.replace(".", "").split()[:-2]      # 11/13 = 0.846
        model = FakeWhisperModel([biased])
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "prompt", 0.80)
        self.assertEqual(len(model.calls), 1)
        self.assertEqual(aligned.bias, "prompt")

    def test_align_paragraph_off_never_prompts(self):
        text = "Seth lived after he became the father of Enosh."
        model = FakeWhisperModel([text.replace(".", "").split()])
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "off", 0.85)
        self.assertEqual(aligned.bias, "off")
        self.assertNotIn("initial_prompt", model.calls[0])

    def test_align_paragraph_retries_plain_when_prompt_is_echoed(self):
        text = "Seth lived after he became the father of Enosh and Kenan and Mahalalel."
        plain = text.replace(".", "").split()
        model = FakeWhisperModel([["Seth", "lived"], plain])   # echo, then a real pass
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "prompt", 0.85)
        self.assertEqual(len(model.calls), 2)
        self.assertIn("initial_prompt", model.calls[0])
        self.assertNotIn("initial_prompt", model.calls[1])
        self.assertEqual(aligned.bias, "off")
        self.assertTrue(aligned.bias_fallback)
        self.assertEqual(aligned.stats.match_ratio, 1.0)

    def test_align_paragraph_keeps_biased_result_when_retry_is_not_better(self):
        text = "Seth lived after he became the father of Enosh and Kenan and Mahalalel."
        biased = text.replace(".", "").split()[:-2]      # 11/13: imperfect, cross-checked
        plain = text.replace(".", "").split()[:-4]       # worse
        model = FakeWhisperModel([biased, plain])
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "hotwords")
        self.assertEqual(len(model.calls), 2)
        self.assertEqual(aligned.bias, "hotwords")
        self.assertFalse(aligned.bias_fallback)
        self.assertEqual(aligned.stats.matched_words, 11)

    def test_align_paragraph_auto_cascades_both_then_hotwords_then_plain(self):
        text = "Joktan became the father of Almodad, Sheleph, Hazarmaveth, and Jerah."
        full = text.replace(".", "").replace(",", "").split()
        model = FakeWhisperModel([full[-2:], full])      # both echoes, hotwords clean
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "auto")
        self.assertEqual(len(model.calls), 2)
        self.assertIn("initial_prompt", model.calls[0])
        self.assertIn("hotwords", model.calls[0])
        self.assertNotIn("initial_prompt", model.calls[1])
        self.assertIn("hotwords", model.calls[1])
        self.assertEqual(aligned.bias, "hotwords")
        self.assertFalse(aligned.bias_fallback)

        model = FakeWhisperModel([full[-2:], full[:3], full[:6]])   # both bad, hotwords bad, plain best
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "auto")
        self.assertEqual(len(model.calls), 3)
        self.assertNotIn("hotwords", model.calls[2])
        self.assertEqual(aligned.bias, "off")
        self.assertTrue(aligned.bias_fallback)
        self.assertEqual(aligned.stats.matched_words, 6)

        model = FakeWhisperModel([full[:7], full[:3], full[:6]])    # biased beats plain
        aligned = MODULE.align_paragraph(model, Path("p0.mp3"), text, "en", "auto")
        self.assertEqual(aligned.bias, "both")
        self.assertEqual(aligned.stats.matched_words, 7)

    def test_generate_chapter_writes_bias_provenance(self):
        with tempfile.TemporaryDirectory() as temp:
            out_dir = Path(temp) / "ch1"
            words = [
                {"text": "Alpha", "start": 0.0, "end": 0.2},
                {"text": "beta", "start": 0.2, "end": 0.4},
            ]
            with (
                patch.object(MODULE, "load_chapter_text", return_value={
                    "number": 1, "title": "Chapter 1", "paragraphs": ["Alpha beta"],
                }),
                patch.object(MODULE, "fetch_manifest", return_value={
                    "paragraphs": [{"paragraph": 0, "file": "p0.mp3", "duration": 0.4}],
                }),
                patch.object(MODULE, "http_get_bytes", return_value=b"mp3"),
                patch.object(MODULE, "align_paragraph", return_value=ParagraphAlignment(
                    words, AlignmentStats(2, 2, 2), bias="off", bias_fallback=True,
                )) as align,
            ):
                ok, _detail = MODULE.generate_chapter(
                    "example", "modern-en", 1, out_dir, model=object(),
                    model_name="small.en", language="en", min_alignment=0.85,
                    bias_mode="prompt", bias_retry_below=0.9,
                )
            self.assertTrue(ok)
            self.assertEqual(align.call_args.args[4], "prompt")
            self.assertEqual(align.call_args.args[5], 0.9)
            sidecar = __import__("json").loads((out_dir / "words.json").read_text())
            self.assertEqual(sidecar["alignment"]["bias"], "prompt")
            self.assertEqual(sidecar["alignment"]["biasRetryBelow"], 0.9)
            paragraph = sidecar["paragraphs"][0]["alignment"]
            self.assertEqual(paragraph["bias"], "off")
            self.assertTrue(paragraph["biasFallback"])
            self.assertEqual(paragraph["matchRatio"], 1.0)

    def test_generate_chapter_rejects_unknown_bias_mode(self):
        with self.assertRaises(ValueError):
            MODULE.generate_chapter(
                "example", "modern-en", 1, Path("/nonexistent"), model=object(),
                model_name="small.en", language="en", min_alignment=0.85, bias_mode="loud",
            )


if __name__ == "__main__":
    unittest.main()
