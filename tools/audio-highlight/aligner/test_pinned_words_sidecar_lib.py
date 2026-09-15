"""Tests for the alignment comparison token.

The bug these were written for: `normalize_token` stripped `[^\\w]`, and `_` is
a word character in Python's `re`. Project Gutenberg wraps stage directions and
italics in underscores, so the edition token `[_Exeunt._]` normalized to
`_exeunt_` while Whisper's transcript of the very same audio normalized to
`exeunt`. The two never compared equal, the paragraph scored 0.0, and the
chapter was rejected for "observed_alignment_below_85_percent" even though the
recording was word-perfect.

That cost 13 chapters across the 2026-09 batches, and it concentrated in verse
drama (1 chapter passing out of 21) because plays carry a stage direction every
few lines and stage directions are short — a single unmatched token in a
two-word paragraph is a 0.0.

The gate is not what changed here. 0.85 per paragraph still stands; these tests
pin the comparison so that the gate measures the reading rather than the markup.
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pinned_words_sidecar_lib import (  # noqa: E402
    HeardWord,
    align_tokens_with_stats,
    canonical_alignment_token,
    normalize_token,
)


class NormalizeTokenTest(unittest.TestCase):
    def test_gutenberg_italic_markup_is_not_part_of_the_word(self):
        """`_` is \\w, so the old `[^\\w]` strip left it on. This is the bug."""
        self.assertEqual(normalize_token("[_Exeunt._]"), "exeunt")
        self.assertEqual(normalize_token("_Whispering._"), "whispering")
        self.assertEqual(normalize_token("him._]"), "him")

    def test_an_underscored_token_equals_the_word_whisper_hears(self):
        self.assertEqual(
            canonical_alignment_token("[_Whispering._]"),
            canonical_alignment_token("Whispering."),
        )

    def test_ordinary_punctuation_stripping_is_unchanged(self):
        self.assertEqual(normalize_token("Caesar,"), "caesar")
        self.assertEqual(normalize_token('"Fly,'), "fly")
        self.assertEqual(normalize_token("—No:"), "no")

    def test_digits_survive_so_cardinal_expansion_still_fires(self):
        self.assertEqual(normalize_token("16"), "16")
        self.assertEqual(canonical_alignment_token("16"), "sixteen")

    def test_a_token_that_is_only_markup_normalizes_away(self):
        self.assertEqual(normalize_token("_"), "")
        self.assertEqual(normalize_token("[__]"), "")


class StageDirectionAlignmentTest(unittest.TestCase):
    """The real paragraphs, verbatim from julius-caesar ch18's diagnostics."""

    def assert_ratio(self, expected, heard_raw, want):
        heard = [HeardWord(raw, 0.0, 0.0) for raw in heard_raw]
        _, stats = align_tokens_with_stats(expected, heard)
        self.assertAlmostEqual(stats.match_ratio, want, places=3)

    def test_single_word_stage_direction_now_matches(self):
        self.assert_ratio(["[_Exeunt._]"], ["Exeunt"], 1.0)

    def test_two_word_stage_direction_now_matches(self):
        self.assert_ratio(["[_Whispers", "him._]"], ["Whispers", "him."], 1.0)

    def test_a_genuine_mishearing_still_fails_the_gate(self):
        """"alarums" read as "alarms" is a real difference and must stay a miss.

        This is the control: the fix must recover markup, not manufacture
        agreement. Half of this paragraph matches, which is below 0.85.
        """
        self.assert_ratio(["[_Low", "alarums._]"], ["Low", "alarms."], 0.5)

    def test_interpolated_tokens_still_do_not_count_as_matched(self):
        _, stats = align_tokens_with_stats(
            ["[_Exeunt._]", "Caesar"], [HeardWord("Exeunt", 0.0, 0.5)]
        )
        self.assertEqual(stats.matched_words, 1)
        self.assertEqual(stats.expected_words, 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
