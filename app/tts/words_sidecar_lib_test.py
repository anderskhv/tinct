#!/usr/bin/env python3
"""Unit tests for words.json sidecar helpers (no whisper required)."""
import unittest

from words_sidecar_lib import (
    align_tokens,
    align_tokens_with_stats,
    chapter_words_from_text,
    canonical_alignment_token,
    clean_text,
    HeardWord,
    validate_sidecar,
)


class WordsSidecarLibTest(unittest.TestCase):
    def test_align_tokens_exact(self):
        expected = ["Tell", "me,", "O", "Muse,"]
        heard = [
            HeardWord("Tell", 0.05, 0.55),
            HeardWord("me", 0.55, 0.77),
            HeardWord("O", 1.03, 1.03),
            HeardWord("Muse", 1.03, 1.35),
        ]
        words = align_tokens(expected, heard)
        self.assertEqual(len(words), 4)
        self.assertEqual(words[0]["text"], "Tell")
        self.assertEqual(words[0]["start"], 0.05)

    def test_alignment_stats_do_not_count_interpolated_words_as_matches(self):
        expected = ["Alpha", "beta", "gamma", "delta"]
        heard = [
            HeardWord("Alpha", 0.1, 0.4),
            HeardWord("delta", 1.4, 1.8),
        ]
        words, stats = align_tokens_with_stats(expected, heard)
        self.assertEqual(len(words), 4)
        self.assertEqual(stats.expected_words, 4)
        self.assertEqual(stats.heard_words, 2)
        self.assertEqual(stats.matched_words, 2)
        self.assertEqual(stats.match_ratio, 0.5)

    def test_alignment_counts_safe_digit_and_spoken_cardinal_as_observed(self):
        words, stats = align_tokens_with_stats(
            ["1.", "21."],
            [HeardWord("one", 0.0, 0.2), HeardWord("twenty-one", 0.3, 0.7)],
        )
        self.assertEqual([word["text"] for word in words], ["1.", "21."])
        self.assertEqual(stats.matched_words, 2)
        self.assertEqual(stats.match_ratio, 1.0)
        self.assertEqual(canonical_alignment_token("40"), "forty")

    def test_speaker_label_is_not_fuzzily_equated_to_spelled_audio(self):
        _words, stats = align_tokens_with_stats(
            ["Phaedo:"],
            [
                HeardWord("P", 0.0, 0.1), HeardWord("H", 0.1, 0.2),
                HeardWord("A", 0.2, 0.3), HeardWord("E", 0.3, 0.4),
                HeardWord("D", 0.4, 0.5), HeardWord("O", 0.5, 0.6),
            ],
        )
        self.assertEqual(stats.matched_words, 0)

    def test_clean_text_strips_superscripts(self):
        raw = "¹ In the beginning God created"
        cleaned = clean_text(raw)
        self.assertFalse("¹" in cleaned)
        self.assertTrue(cleaned.startswith("In"))

    def test_validate_sidecar_word_count(self):
        text = "Tell me O Muse"
        tokens = chapter_words_from_text(text)
        sidecar = {
            "chapter": 1,
            "paragraphs": [{
                "paragraph": 0,
                "file": "p0.mp3",
                "words": [{"text": t, "start": i, "end": i + 1} for i, t in enumerate(tokens)],
            }],
        }
        ok, errors = validate_sidecar(sidecar, [tokens])
        self.assertTrue(ok)
        self.assertEqual(errors, [])

    def test_validate_rejects_bad_times(self):
        sidecar = {
            "paragraphs": [{
                "paragraph": 0,
                "words": [{"text": "a", "start": 2, "end": 1}],
            }],
        }
        ok, errors = validate_sidecar(sidecar)
        self.assertFalse(ok)

    def test_validate_rejects_duplicate_missing_and_wrong_edition_tokens(self):
        sidecar = {
            "paragraphs": [
                {
                    "paragraph": 0,
                    "words": [{"text": "Wrong", "start": 0, "end": 1}],
                },
                {
                    "paragraph": 0,
                    "words": [{"text": "Alpha", "start": 0, "end": 1}],
                },
            ],
        }
        ok, errors = validate_sidecar(sidecar, [["Alpha"], ["Beta"]])
        self.assertFalse(ok)
        self.assertTrue(any("duplicate" in error for error in errors))
        self.assertTrue(any("does not match" in error for error in errors))
        self.assertTrue(any("paragraph 1: missing" in error for error in errors))

    def test_validate_binds_files_and_times_to_audio_manifest(self):
        sidecar = {
            "paragraphs": [{
                "paragraph": 0,
                "file": "wrong.mp3",
                "words": [{"text": "Alpha", "start": 0, "end": 1.1}],
            }],
        }
        ok, errors = validate_sidecar(
            sidecar,
            [["Alpha"]],
            {0: {"file": "p0.mp3", "duration": 1.0}},
        )
        self.assertFalse(ok)
        self.assertTrue(any("file does not match" in error for error in errors))
        self.assertTrue(any("exceeds audio duration" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
