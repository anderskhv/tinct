import json
import tempfile
import unittest
import sys
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).parents[1] / "aligner"))
import verify_active_batch as active
import trial
from host_retry_gate import replacement_spend


class ActiveBatchValidationTest(unittest.TestCase):
    def test_accepts_unique_bounded_targets(self):
        rows = [{"bookId": "book", "edition": "original-en", "chapter": 1}]
        self.assertEqual(active.validate_rows(rows), rows)

    def test_rejects_duplicate_and_extra_fields(self):
        row = {"bookId": "book", "edition": "original-en", "chapter": 1}
        with self.assertRaisesRegex(ValueError, "duplicate"):
            active.validate_rows([row, row])
        with self.assertRaisesRegex(ValueError, "only"):
            active.validate_rows([{**row, "waive": True}])

    def test_spend_ledger_must_reconcile_and_round_up(self):
        ledger = {
            "priorEstimate": 0.70,
            "attempts": [{"estimatedCost": 0.2373}],
            "exactConservativeTotal": 0.9373,
            "guardCarryForward": 1.00,
            "aggregateBudget": 15.0,
        }
        self.assertEqual(active.validate_spend(ledger), 1.0)
        ledger["guardCarryForward"] = 0.90
        with self.assertRaisesRegex(ValueError, "conservative"):
            active.validate_spend(ledger)

    def test_spend_ledger_rejects_rollback_rewrite_and_negative_append(self):
        reviewed = {
            "policy": "fixed",
            "priorEstimate": 0.70,
            "attempts": [{"run": 1, "estimatedCost": 0.10}],
            "exactConservativeTotal": 0.80,
            "guardCarryForward": 0.80,
            "aggregateBudget": 15.0,
        }
        current = {
            **reviewed,
            "attempts": [*reviewed["attempts"], {
                "run": 2, "pod": "pod2", "estimatedCost": 0.05,
                "status": "EXITED", "terminateHttp": 204,
            }],
            "exactConservativeTotal": 0.85,
            "guardCarryForward": 0.90,
        }
        self.assertEqual(active.validate_spend(current, reviewed), 0.90)
        with self.assertRaisesRegex(ValueError, "rewrites or removes"):
            active.validate_spend({**current, "attempts": current["attempts"][1:]}, reviewed)
        with self.assertRaisesRegex(ValueError, "rewrites reviewed priorEstimate"):
            active.validate_spend({**current, "priorEstimate": 0.60}, reviewed)
        bad = {**current, "attempts": [*reviewed["attempts"], {
            "run": 2, "pod": "pod2", "estimatedCost": -0.01,
            "status": "EXITED", "terminateHttp": 204,
        }], "exactConservativeTotal": 0.79}
        with self.assertRaisesRegex(ValueError, "invalid estimatedCost"):
            active.validate_spend(bad, reviewed)
        rewritten = json.loads(json.dumps(current))
        rewritten["attempts"][0]["estimatedCost"] = 0.01
        with self.assertRaisesRegex(ValueError, "rewrites or removes"):
            active.validate_spend(rewritten, reviewed)

    def test_resolves_nonpositional_chapter_number_and_rejects_duplicates(self):
        chapters = [{"number": 8, "paragraphs": ["later"]}, {"number": 3, "paragraphs": ["wanted"]}]
        self.assertEqual(active.resolve_chapter(chapters, 3)["paragraphs"], ["wanted"])
        with self.assertRaisesRegex(ValueError, "matched 0"):
            active.resolve_chapter(chapters, 4)
        with self.assertRaisesRegex(ValueError, "matched 2"):
            active.resolve_chapter([chapters[1], chapters[1]], 3)

    @mock.patch("verify_active_batch.subprocess.run")
    @mock.patch("verify_active_batch.subprocess.check_output")
    def test_trigger_allows_only_active_batch_and_unchanged_runner(self, output, run):
        output.side_effect = [
            active.ACTIVE_PATH + "\n" + active.LEDGER_PATH + "\n",
            "trigger-sha\n",
        ]
        run.return_value.returncode = 0
        result = active.verify_trigger_integrity("reviewed-sha")
        self.assertEqual(set(result["changedPaths"]), {active.ACTIVE_PATH, active.LEDGER_PATH})
        self.assertEqual(result["reviewedRunnerCommit"], "reviewed-sha")

    @mock.patch("verify_active_batch.subprocess.check_output")
    def test_trigger_rejects_executable_change(self, output):
        output.return_value = active.ACTIVE_PATH + "\n" + active.LEDGER_PATH + "\ntools/audio-highlight/aligner/trial.py\n"
        with self.assertRaisesRegex(ValueError, "must change exactly"):
            active.verify_trigger_integrity("reviewed-sha")


class FullChainValidationTest(unittest.TestCase):
    def test_manifest_rejects_malformed_duplicate_and_missing_spoken_rows(self):
        with self.assertRaisesRegex(ValueError, "not an object"):
            active.validate_manifest({"paragraphs": ["bad"]}, ["spoken"])
        duplicate = {"paragraphs": [
            {"paragraph": 0, "file": "p0.mp3", "duration": 1},
            {"paragraph": 0, "file": "p1.mp3", "duration": 1},
        ]}
        with self.assertRaisesRegex(ValueError, "duplicates"):
            active.validate_manifest(duplicate, ["spoken"])
        with self.assertRaisesRegex(ValueError, "omits spoken"):
            active.validate_manifest({"paragraphs": [{"paragraph": -1, "file": "title.mp3", "duration": 1}]}, ["spoken"])

    def test_workflow_reads_repo_input_then_launches_resolved_output(self):
        workflow = (Path(__file__).parents[3] / ".github" / "workflows" / "audio-align-canary.yml").read_text()
        self.assertIn("--batch artifacts/audio-highlight-cloud-resume-2026-09-16/active-batch.json", workflow)
        self.assertIn('--resolved-batch "$ARTIFACT_DIR/resolved-batch.json"', workflow)
        self.assertEqual(workflow.count('--batch "$ARTIFACT_DIR/resolved-batch.json"'), 2)

    def test_empty_trigger_diff_is_rejected(self):
        with mock.patch("verify_active_batch.subprocess.check_output", return_value=""):
            with self.assertRaisesRegex(ValueError, "must change exactly"):
                active.verify_trigger_integrity("reviewed-sha")


class HostRetryGateTest(unittest.TestCase):
    def good_record(self):
        return {
            "statusAfterStop": "EXITED",
            "terminateHttp": 204,
            "resultsFetched": False,
            "estimatedCost": 0.0232,
            "error": "RuntimeError: cuda probe failed: cuda devices 0",
            "finalStatus": {
                "setup": {"cuda_probe": "cuda devices 0"},
                "progress": {
                    "arm_chapters_passed": 0,
                    "arm_chapters_rejected": 0,
                    "arm_chapters_running": 0,
                    "paragraph_diagnostics": 0,
                },
            },
        }

    def test_allows_one_proven_preprocessing_cuda_zero_replacement(self):
        self.assertEqual(replacement_spend(self.good_record(), 1.0), 1.0232)

    def test_rejects_any_candidate_state_or_unproven_teardown(self):
        record = self.good_record()
        record["finalStatus"]["progress"]["paragraph_diagnostics"] = 1
        with self.assertRaisesRegex(ValueError, "began chapter"):
            replacement_spend(record, 1.0)
        record = self.good_record()
        record["terminateHttp"] = 500
        with self.assertRaisesRegex(ValueError, "teardown"):
            replacement_spend(record, 1.0)


class WorkerIsolationSourceTest(unittest.TestCase):
    def test_injected_arm_fault_is_recorded_and_does_not_block_next_arm(self):
        with tempfile.TemporaryDirectory() as temporary:
            first = Path(temporary) / "first"
            second = Path(temporary) / "second"
            entry = {"key": "book/original-en/ch1", "group": "alignment"}
            context = {"paragraph": 7}
            def fail():
                raise RuntimeError("injected mapping fault")
            self.assertFalse(trial.execute_arm(fail, first, entry, "auto", context))
            record = json.loads((first / "chapter.json").read_text())
            self.assertEqual(record["processing_error"]["paragraph"], 7)
            self.assertEqual(record["processing_error"]["type"], "RuntimeError")
            reached = []
            self.assertTrue(trial.execute_arm(lambda: reached.append(True), second, entry, "off", {"paragraph": None}))
            self.assertEqual(reached, [True])

    def test_cohort_fails_closed_on_source_manifest_or_audio_drift(self):
        source = (Path(__file__).parents[1] / "aligner" / "cloud_cohort.py").read_text()
        self.assertIn("edition text changed after preflight", source)
        self.assertIn("manifest changed after preflight", source)
        self.assertIn("recording {name} changed after preflight", source)

    def test_worker_invokes_isolated_arm_for_each_target_and_mode(self):
        source = (Path(__file__).parents[1] / "aligner" / "trial.py").read_text()
        self.assertIn("for e in cohort:", source)
        self.assertIn("for mode in getattr(args,'arms',['off','auto']):", source)
        self.assertIn("execute_arm(lambda:process_arm", source)
        self.assertIn("if sha(audio)!=r['sha256']:raise ValueError('audio changed:", source)


if __name__ == "__main__":
    unittest.main()
