#!/usr/bin/env python3
"""Regression checks for quote truncation detection, not editorial approval."""
import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location("classifier", Path(__file__).with_name("classify-modern-en.py"))
classifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(classifier)

class TruncationTests(unittest.TestCase):
    def test_source_spaced_ellipsis_is_not_new_omission(self):
        self.assertFalse(classifier.is_truncation(
            "The sons . . . were always during the working season members of an artel.",
            "The sons… were working members of an artel."))

    def test_new_ellipsis_still_flags_material_shortening(self):
        self.assertTrue(classifier.is_truncation(
            "The sons were always during the working season members of an artel.",
            "The sons… were members."))

    def test_new_spaced_ellipsis_also_flags_material_shortening(self):
        self.assertTrue(classifier.is_truncation(
            "The sons were always during the working season members of an artel.",
            "The sons . . . were members."))

    def test_separate_sentence_periods_are_not_an_ellipsis(self):
        self.assertTrue(classifier.is_truncation(
            "The sons worked. They always worked. They stayed for the whole season.",
            "The sons… worked."))

if __name__ == "__main__":
    unittest.main()
