import unittest
from contextlib import redirect_stdout
from io import StringIO

from r2_words_sidecar_coverage import (
    EditionAudit,
    EditionTarget,
    audit,
    compact_ranges,
    parse_registry_targets,
    print_runpod_command,
    runpod_targets,
)


class WordsSidecarCoverageTests(unittest.TestCase):
    def test_compact_ranges(self):
        self.assertEqual(compact_ranges([5, 1, 2, 2, 4, 8, 9, 10]), "1-2, 4-5, 8-10")
        self.assertEqual(compact_ranges([]), "")

    def test_registry_discovers_kjv_audio_target(self):
        kjv = next(
            target
            for target in parse_registry_targets()
            if target.book_id == "bible" and target.edition == "kjv-en"
        )
        self.assertEqual(kjv.language, "en")
        self.assertEqual(kjv.scope, "public")
        self.assertTrue(kjv.has_audio)
        self.assertEqual(kjv.chapters[0], 1)
        self.assertEqual(kjv.chapters[-1], 1189)

    def test_audit_checks_sidecars_only_where_audio_exists(self):
        target = EditionTarget(
            book_id="example",
            edition="modern-en",
            language="en",
            scope="public",
            has_audio=True,
            chapters=(1, 2, 3),
        )

        def fake_checker(book, edition, chapter, artifact):
            available = {
                (1, "manifest"),
                (2, "manifest"),
                (1, "words"),
            }
            return book, edition, chapter, artifact, (chapter, artifact) in available, ""

        result = audit([target], workers=2, checker=fake_checker)[0]
        self.assertEqual(result.audio_ok, 2)
        self.assertEqual(result.audio_missing, [3])
        self.assertEqual(result.sidecars_ok, 1)
        self.assertEqual(result.sidecars_missing, [2])
        self.assertEqual(runpod_targets([result]), ["example/modern-en"])

    def test_runpod_commands_use_language_specific_models(self):
        base = dict(
            scope="public",
            chapters=1,
            audio_ok=1,
            audio_missing=[],
            sidecars_ok=0,
            sidecars_missing=[1],
            errors=[],
        )
        results = [
            EditionAudit(book_id="english", edition="modern-en", language="en", **base),
            EditionAudit(book_id="danish", edition="modern-da", language="da", **base),
        ]
        output = StringIO()
        with redirect_stdout(output):
            print_runpod_command(results)
        command = output.getvalue()
        self.assertIn("--target english/modern-en", command)
        self.assertIn("--model small.en", command)
        self.assertIn("--target danish/modern-da", command)
        self.assertIn("--model small", command)


if __name__ == "__main__":
    unittest.main()

