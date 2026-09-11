"""Tests for the cloud GPU spend guard.

These exercise the decisions the guard makes — which pods it stops and, more
importantly, which it refuses to touch — against a stubbed provider API, so the
logic is verified without a RunPod key and without spending anything.

Run: python3 -m unittest discover -s tools/audio-highlight -p 'test_*.py'
"""
from __future__ import annotations

import contextlib
import io
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import runpod_guard  # noqa: E402


def pod(name, *, minutes=1.0, rate=0.44, status="RUNNING", pod_id=None,
        runtime_uptime=True, started_at=None):
    entry = {
        "id": pod_id or f"pod-{name}",
        "name": name,
        "desiredStatus": status,
        "costPerHr": rate,
        "runtime": {"uptimeInSeconds": minutes * 60 if runtime_uptime else 0},
        "machine": {"gpuDisplayName": "RTX A4000"},
    }
    if started_at is not None:
        entry["lastStartedAt"] = started_at
    return entry


class GuardTest(unittest.TestCase):
    def setUp(self):
        self.stopped: list[tuple[str, str]] = []
        self.pods: list[dict] = []
        self._call = runpod_guard._call
        runpod_guard._call = self.fake_call
        os.environ["RUNPOD_API_KEY"] = "test-key-not-real"

    def tearDown(self):
        runpod_guard._call = self._call
        os.environ.pop("RUNPOD_API_KEY", None)

    def fake_call(self, method, path, key, body=None):
        if method == "GET" and path == "/pods":
            return 200, self.pods
        if path.endswith("/stop"):
            self.stopped.append(("stop", path.split("/")[2]))
            return 200, {}
        if method == "DELETE":
            self.stopped.append(("terminate", path.split("/")[2]))
            return 200, {}
        raise AssertionError(f"unexpected call {method} {path}")

    def run_guard(self, *args):
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory) / "report.json"
            argv = ["runpod_guard.py", *args, "--json-out", str(out)]
            old, sys.argv = sys.argv, argv
            try:
                with contextlib.redirect_stdout(io.StringIO()) as captured:
                    code = runpod_guard.main()
            finally:
                sys.argv = old
            return code, json.loads(out.read_text()), captured.getvalue()

    # --- the three limits ---

    def test_pod_over_the_rate_ceiling_is_stopped(self):
        self.pods = [pod("tinct-audio-wordtiming-01", rate=1.40, minutes=2)]
        _, report, _ = self.run_guard("enforce", "--apply")
        self.assertEqual(self.stopped, [("stop", "pod-tinct-audio-wordtiming-01")])
        self.assertIn("rate", report["actions"][0]["reasons"][0])

    def test_pod_past_the_deadline_is_stopped(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=55)]
        _, report, _ = self.run_guard("enforce", "--max-minutes", "50", "--apply")
        self.assertEqual(self.stopped, [("stop", "pod-tinct-audio-wordtiming-01")])
        self.assertIn("uptime", report["actions"][0]["reasons"][0])

    def test_crossing_the_envelope_stops_everything_owned(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=10), pod("tinct-audio-wordtiming-02", minutes=10)]
        _, report, _ = self.run_guard("enforce", "--budget", "25", "--spent", "24.90", "--apply")
        self.assertEqual(len(self.stopped), 2)
        self.assertTrue(all("envelope" in r for a in report["actions"] for r in a["reasons"] if "envelope" in r))

    def test_a_pod_inside_every_limit_is_left_running(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=12, rate=0.44)]
        code, report, _ = self.run_guard("enforce", "--apply")
        self.assertEqual(self.stopped, [])
        self.assertEqual(report["actions"], [])
        self.assertEqual(code, 0)

    # --- the safety properties that matter more than the limits ---

    def test_pods_that_are_not_ours_are_never_touched(self):
        self.pods = [
            pod("someone-elses-retained-pod", minutes=9999, rate=4.00),
            pod("grieving_coffee_cod", minutes=9999, rate=4.00),
        ]
        _, report, output = self.run_guard("enforce", "--apply")
        self.assertEqual(self.stopped, [], "a pod outside the owner prefix must never be stopped")
        self.assertEqual(report["actions"], [])
        self.assertEqual(len(report["foreignPodsLeftAlone"]), 2)
        self.assertIn("left alone", output)

    def test_stop_all_still_only_touches_owned_pods(self):
        self.pods = [pod("tinct-audio-wordtiming-01"), pod("unrelated-retained-pod")]
        self.run_guard("stop-all", "--apply")
        self.assertEqual(self.stopped, [("stop", "pod-tinct-audio-wordtiming-01")])

    def test_the_default_prefix_matches_how_pods_are_really_named(self):
        # The names observed on the account: if the prefix drifts from these,
        # the guard silently stops policing its own pods.
        self.pods = [pod("tinct-audio-bounded-trial-20260911-05", minutes=99),
                     pod("tinct-words-shard-4", minutes=99)]
        _, report, _ = self.run_guard("enforce", "--apply")
        self.assertEqual(len(self.stopped), 2, "real Tinct pod names must be treated as owned")
        self.assertEqual(report["foreignPodsLeftAlone"], [])

    def test_an_unowned_pod_that_is_running_hot_is_called_out(self):
        self.pods = [pod("grieving_coffee_cod", minutes=600, rate=2.50)]
        _, report, output = self.run_guard("enforce", "--apply")
        self.assertEqual(self.stopped, [], "still must not touch it")
        self.assertEqual(len(report["unownedRunningPods"]), 1)
        self.assertIn("will not stop it", output)

    def test_without_apply_nothing_is_stopped(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=99, rate=9.99)]
        _, report, output = self.run_guard("enforce")
        self.assertEqual(self.stopped, [], "a dry run must not act")
        self.assertTrue(report["actions"], "a dry run should still report what it would do")
        self.assertIn("dry run", output)

    def test_terminate_deletes_instead_of_stopping(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=99)]
        self.run_guard("enforce", "--terminate", "--apply")
        self.assertEqual(self.stopped, [("terminate", "pod-tinct-audio-wordtiming-01")])

    def test_already_exited_pod_is_not_stopped_again(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=99, status="EXITED")]
        self.run_guard("enforce", "--apply")
        self.assertEqual(self.stopped, [])

    def test_spend_estimate_counts_running_time(self):
        self.pods = [pod("tinct-audio-wordtiming-01", minutes=30, rate=0.44)]
        _, report, _ = self.run_guard("enforce", "--spent", "0.10")
        self.assertAlmostEqual(report["estimatedRunningCost"], 0.22, places=3)
        self.assertAlmostEqual(report["estimatedTotalSpend"], 0.32, places=3)

    def test_uptime_falls_back_to_the_start_timestamp(self):
        # RunPod returned uptimeInSeconds 0 for four live pods on 2026-09-11,
        # zeroing both the deadline and the spend estimate.
        import datetime
        started = (datetime.datetime.now(datetime.timezone.utc)
                   - datetime.timedelta(minutes=70)).isoformat().replace("+00:00", "Z")
        self.pods = [pod("tinct-wordtiming-01", runtime_uptime=False, started_at=started)]
        _, report, _ = self.run_guard("enforce", "--max-minutes", "50", "--apply")
        self.assertEqual(report["ownedPods"][0]["uptimeSource"], "timestamp")
        self.assertEqual(self.stopped, [("stop", "pod-tinct-wordtiming-01")],
                         "past the deadline must stop even without runtime uptime")

    def test_a_running_pod_with_no_measurable_uptime_is_stopped(self):
        self.pods = [pod("tinct-wordtiming-01", runtime_uptime=False)]
        _, report, _ = self.run_guard("enforce", "--apply")
        self.assertEqual(report["ownedPods"][0]["uptimeSource"], "unknown")
        self.assertEqual(self.stopped, [("stop", "pod-tinct-wordtiming-01")])
        self.assertTrue(any("unmeasurable" in r for r in report["actions"][0]["reasons"]))

    def test_an_exited_pod_without_uptime_is_left_alone(self):
        self.pods = [pod("tinct-wordtiming-01", runtime_uptime=False, status="EXITED")]
        self.run_guard("enforce", "--apply")
        self.assertEqual(self.stopped, [], "an exited pod bills nothing")

    def test_missing_credential_fails_closed(self):
        os.environ.pop("RUNPOD_API_KEY")
        sys.argv = ["runpod_guard.py", "enforce", "--apply"]
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(runpod_guard.main(), 2)
        self.assertEqual(self.stopped, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
