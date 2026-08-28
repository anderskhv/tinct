#!/usr/bin/env python3
"""Unit tests for words.json sidecar helpers (no whisper required)."""
import unittest

from words_sidecar_lib import (
    align_tokens,
    chapter_words_from_text,
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


if __name__ == "__main__":
    unittest.main()
