import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import verify_active_batch as active
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

    @mock.patch("verify_active_batch.subprocess.run")
    @mock.patch("verify_active_batch.subprocess.check_output")
    def test_trigger_allows_only_active_batch_and_unchanged_runner(self, output, run):
        output.side_effect = [
            active.ACTIVE_PATH + "\n",
            "trigger-sha\n",
        ]
        run.return_value.returncode = 0
        result = active.verify_trigger_integrity("reviewed-sha")
        self.assertEqual(result["changedPaths"], [active.ACTIVE_PATH])
        self.assertEqual(result["reviewedRunnerCommit"], "reviewed-sha")

    @mock.patch("verify_active_batch.subprocess.check_output")
    def test_trigger_rejects_executable_change(self, output):
        output.return_value = active.ACTIVE_PATH + "\ntools/audio-highlight/aligner/trial.py\n"
        with self.assertRaisesRegex(ValueError, "only active-batch"):
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
    def test_mapping_exception_rejects_arm_before_candidate_build_and_continues(self):
        source = (Path(__file__).parents[1] / "aligner" / "trial.py").read_text()
        caught = source.index("processing_invariant_error")
        continuation = source.index("if arm_failed:continue")
        candidate = source.index("candidate=lib.build_sidecar")
        self.assertLess(caught, continuation)
        self.assertLess(continuation, candidate)
        self.assertIn("if sha(audio)!=r['sha256']:raise ValueError('audio changed:", source)


if __name__ == "__main__":
    unittest.main()
