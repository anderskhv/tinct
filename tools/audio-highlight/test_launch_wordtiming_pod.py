"""Tests for the launcher's refusals.

The launcher's job is mostly to say no. Every check it makes happens before the
pod exists, because once RunPod has accepted the request the money is already
being spent and a mistake can only be cleaned up, not prevented. So these tests
are about the refusals rather than the happy path: each one asserts that a
specific way of overspending Anders's envelope is impossible.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tarfile
import io
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import launch_wordtiming_pod as launcher  # noqa: E402
import runpod_guard  # noqa: E402


def pod(name, status="RUNNING", rate=0.44, uptime=600):
    return {"id": f"pod-{name}", "name": name, "status": status, "costPerHr": rate,
            "uptimeSeconds": uptime, "uptimeSource": "runtime", "gpu": "RTX 4090"}


def options(**overrides):
    base = dict(owner_prefix="tinct-", ledger="", spent=0.0, budget=25.0,
                max_rate=1.00, max_minutes=50.0)
    base.update(overrides)
    return argparse.Namespace(**base)


class PreflightTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.ledger_path = str(Path(self.directory.name) / "ledger.json")
        self.pods = []
        self._real = runpod_guard.list_pods
        runpod_guard.list_pods = lambda key: self.pods
        self.addCleanup(lambda: setattr(runpod_guard, "list_pods", self._real))

    def test_refuses_while_an_owned_pod_is_alive(self):
        """One pod at a time — otherwise two launchers double the burn rate."""
        self.pods = [pod("tinct-wordtiming-earlier")]
        with self.assertRaises(SystemExit) as caught:
            launcher.preflight("k", options(ledger=self.ledger_path))
        self.assertIn("already alive", str(caught.exception))

    def test_an_exited_owned_pod_does_not_block(self):
        self.pods = [pod("tinct-wordtiming-earlier", status="EXITED")]
        accrued, headroom = launcher.preflight("k", options(ledger=self.ledger_path))
        self.assertGreater(headroom, 0)

    def test_a_foreign_pod_neither_blocks_nor_is_touched(self):
        """Anders's other RunPod work is not ours to stop or to wait for."""
        self.pods = [pod("someone-elses-experiment")]
        accrued, headroom = launcher.preflight("k", options(ledger=self.ledger_path))
        self.assertEqual(accrued, 0.0)

    def test_refuses_when_the_worst_case_would_not_fit(self):
        """Budgeted against the full deadline, not against a hoped-for early finish."""
        with self.assertRaises(SystemExit) as caught:
            launcher.preflight("k", options(ledger=self.ledger_path, spent=24.80))
        self.assertIn("refusing to launch", str(caught.exception))

    def test_accrued_spend_from_the_ledger_counts_against_the_envelope(self):
        Path(self.ledger_path).write_text(json.dumps(
            {"pod-old": {"name": "tinct-old", "estCost": 24.90}}))
        with self.assertRaises(SystemExit):
            launcher.preflight("k", options(ledger=self.ledger_path))

    def test_headroom_is_reported_after_the_ledger_is_read(self):
        Path(self.ledger_path).write_text(json.dumps(
            {"pod-old": {"name": "tinct-old", "estCost": 5.00}}))
        accrued, headroom = launcher.preflight("k", options(ledger=self.ledger_path))
        self.assertAlmostEqual(accrued, 5.00, places=2)
        self.assertAlmostEqual(headroom, 20.00, places=2)


class BundleTest(unittest.TestCase):
    def test_the_bundle_carries_the_pinned_helper(self):
        """trial.py hashes the helper into every signature; it must travel."""
        blob = launcher.build_bundle([{"bookId": "x", "edition": "original-en", "chapter": 1}])
        with tarfile.open(fileobj=io.BytesIO(blob)) as tar:
            names = tar.getnames()
        self.assertIn("aligner/pinned_words_sidecar_lib.py", names)
        self.assertIn("aligner/trial.py", names)
        self.assertIn("targets.json", names)

    def test_targets_travel_verbatim(self):
        targets = [{"bookId": "medea", "edition": "original-en", "chapter": 4}]
        blob = launcher.build_bundle(targets)
        with tarfile.open(fileobj=io.BytesIO(blob)) as tar:
            got = json.loads(tar.extractfile("targets.json").read())
        self.assertEqual(got, targets)


class BootstrapTest(unittest.TestCase):
    def test_the_deadline_timer_is_armed_before_anything_that_can_hang(self):
        """A pod that wedges during pip install must still stop billing."""
        script = launcher.bootstrap("https://get", "https://put", 50)
        self.assertLess(script.index("sleep 3000"), script.index("pip install"))

    def test_the_aligner_budget_ends_before_the_pod_does(self):
        """Otherwise the machine dies mid-upload and the work is lost."""
        script = launcher.bootstrap("https://get", "https://put", 50)
        self.assertIn("--max-seconds 2580", script)

    def test_the_model_revision_is_pinned(self):
        script = launcher.bootstrap("https://get", "https://put", 50)
        self.assertIn(launcher.MODEL_REVISION, script)
        self.assertIn("faster-whisper==1.2.1", script)

    def test_results_are_uploaded_even_when_a_step_fails(self):
        """Steps are chained with ';' after the fetch, not '&&', so a failed
        alignment still returns its evidence instead of vanishing."""
        script = launcher.bootstrap("https://get", "https://put", 50)
        self.assertLess(script.index("collect_candidates.py"), script.index("--upload-file"))
        self.assertIn("|| tar czf results.tar.gz . ", script)


if __name__ == "__main__":
    unittest.main(verbosity=2)
