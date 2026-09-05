#!/usr/bin/env python3
"""Unit tests for words.json sidecar helpers (no whisper required)."""
import unittest

from words_sidecar_lib import (
    AlignmentStats,
    BIAS_OFF,
    ParagraphAlignment,
    bias_cascade,
    align_tokens,
    align_tokens_with_stats,
    bias_hotwords,
    build_bias_prompt,
    build_bias_request,
    chapter_words_from_text,
    canonical_alignment_token,
    clean_text,
    estimate_prompt_tokens,
    HeardWord,
    prefer_plain_result,
    should_retry_without_bias,
    validate_sidecar,
    WHISPER_PROMPT_TOKEN_BUDGET,
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


GENEALOGY = (
    "Joktan became the father of Almodad, Sheleph, Hazarmaveth, Jerah, Hadoram, "
    "Uzal, Diklah, Obal, Abimael, Sheba, Ophir, Havilah, and Jobab. All these were "
    "the sons of Joktan. Their dwelling was from Mesha, as you go toward Sephar, "
    "the mountain of the east. Then all of them went."
).split()


def words_as_tokens(text: str) -> int:
    """Deterministic stand-in for the Whisper tokenizer: one token per word."""
    return len(text.split())


class TextBiasTest(unittest.TestCase):
    def test_hotwords_keep_names_and_drop_words_seen_lowercase(self):
        names = bias_hotwords(GENEALOGY)
        self.assertEqual(names[:3], ["Joktan", "Almodad", "Sheleph"])
        self.assertIn("Sephar", names)
        self.assertNotIn("All", names)        # "all" occurs lowercase later
        self.assertIn("Their", names)         # never seen lowercase: kept
        self.assertEqual(names.count("Joktan"), 1)
        self.assertEqual(bias_hotwords(["no", "names", "here."]), [])

    def test_hotwords_drop_sentence_initial_words_that_also_appear_lowercase(self):
        tokens = "The river runs. Then the Tigris meets the Euphrates.".split()
        self.assertEqual(bias_hotwords(tokens), ["Then", "Tigris", "Euphrates"])

    def test_prompt_is_full_paragraph_when_it_fits(self):
        prompt = build_bias_prompt(GENEALOGY, count_tokens=words_as_tokens)
        self.assertEqual(prompt, " ".join(GENEALOGY))
        self.assertEqual(
            build_bias_prompt(GENEALOGY, count_tokens=words_as_tokens, strategy="names"),
            prompt,
        )

    def test_prompt_head_truncates_to_token_budget_and_max_words(self):
        prompt = build_bias_prompt(
            GENEALOGY, max_tokens=10, count_tokens=words_as_tokens, strategy="head",
        )
        self.assertEqual(prompt.split(), GENEALOGY[:10])
        prompt = build_bias_prompt(GENEALOGY, max_words=4, count_tokens=words_as_tokens)
        self.assertEqual(prompt.split(), GENEALOGY[:4])
        self.assertEqual(build_bias_prompt([], count_tokens=words_as_tokens), "")

    def test_prompt_names_strategy_is_default_and_puts_names_first_when_truncating(self):
        prompt = build_bias_prompt(GENEALOGY, max_tokens=12, count_tokens=words_as_tokens)
        self.assertTrue(prompt.startswith("Joktan, Almodad, Sheleph"))
        self.assertLessEqual(words_as_tokens(prompt), 12)
        self.assertIn("became the father", prompt)
        with self.assertRaises(ValueError):
            build_bias_prompt(GENEALOGY, strategy="tail")

    def test_prompt_never_exceeds_whisper_budget_with_estimated_tokens(self):
        long_tokens = [f"Zebulunite{i}," for i in range(400)]
        for strategy in ("head", "names"):
            prompt = build_bias_prompt(long_tokens, strategy=strategy)
            self.assertLessEqual(estimate_prompt_tokens(prompt), WHISPER_PROMPT_TOKEN_BUDGET)
            self.assertLess(len(prompt.split()), 400)
            self.assertTrue(prompt.startswith("Zebulunite0,"))

    def test_bias_request_modes_and_shared_budget(self):
        self.assertIs(build_bias_request(GENEALOGY, "off"), BIAS_OFF)
        prompt_only = build_bias_request(GENEALOGY, "prompt", words_as_tokens)
        self.assertEqual(prompt_only.mode, "prompt")
        self.assertIsNone(prompt_only.hotwords)
        self.assertEqual(prompt_only.initial_prompt, " ".join(GENEALOGY))

        hot = build_bias_request(GENEALOGY, "hotwords", words_as_tokens)
        self.assertEqual(hot.mode, "hotwords")
        self.assertIsNone(hot.initial_prompt)
        self.assertTrue(hot.hotwords.startswith("Joktan, Almodad"))

        both = build_bias_request(GENEALOGY, "both", words_as_tokens, max_tokens=20, hotwords_budget=5)
        self.assertEqual(both.mode, "both")
        self.assertEqual(len(both.hotwords.split(", ")), 5)
        self.assertLessEqual(
            words_as_tokens(both.hotwords) + words_as_tokens(both.initial_prompt), 20,
        )
        with self.assertRaises(ValueError):
            build_bias_request(GENEALOGY, "loud")
        with self.assertRaises(ValueError):
            build_bias_request(GENEALOGY, "auto")   # cascade, not a request mode

    def test_bias_cascade_orders_request_modes(self):
        self.assertEqual(bias_cascade("off"), ())
        self.assertEqual(bias_cascade("prompt"), ("prompt",))
        self.assertEqual(bias_cascade("auto"), ("both", "hotwords"))
        with self.assertRaises(ValueError):
            bias_cascade("loud")

    def test_bias_request_degrades_to_off_without_names(self):
        request = build_bias_request(["all", "lowercase", "words"], "hotwords", words_as_tokens)
        self.assertTrue(request.is_off)
        self.assertEqual(request.mode, "off")
        both = build_bias_request(["all", "lowercase", "words"], "both", words_as_tokens)
        self.assertEqual(both.mode, "prompt")
        self.assertIsNone(both.hotwords)

    def test_retry_without_bias_on_echo_or_imperfect_match(self):
        echo = AlignmentStats(expected_words=80, heard_words=12, matched_words=11)
        self.assertTrue(should_retry_without_bias(echo, 0.0))
        below_gate = AlignmentStats(expected_words=80, heard_words=78, matched_words=60)
        self.assertTrue(should_retry_without_bias(below_gate, 0.85))
        self.assertFalse(should_retry_without_bias(below_gate, 0.70))
        good = AlignmentStats(expected_words=80, heard_words=79, matched_words=78)
        self.assertTrue(should_retry_without_bias(good))          # default 1.0
        self.assertFalse(should_retry_without_bias(good, 0.85))
        perfect = AlignmentStats(expected_words=80, heard_words=80, matched_words=80)
        self.assertFalse(should_retry_without_bias(perfect))
        self.assertFalse(should_retry_without_bias(AlignmentStats(0, 0, 0)))

    def test_plain_result_is_preferred_only_when_it_observes_more_words(self):
        biased = AlignmentStats(80, 70, 60)
        self.assertTrue(prefer_plain_result(biased, AlignmentStats(80, 79, 65)))
        self.assertFalse(prefer_plain_result(biased, AlignmentStats(80, 79, 60)))
        self.assertFalse(prefer_plain_result(biased, AlignmentStats(80, 79, 40)))

    def test_paragraph_alignment_defaults_to_unbiased_provenance(self):
        aligned = ParagraphAlignment(words=[], stats=AlignmentStats(1, 1, 1))
        self.assertEqual(aligned.bias, "off")
        self.assertFalse(aligned.bias_fallback)


if __name__ == "__main__":
    unittest.main()
