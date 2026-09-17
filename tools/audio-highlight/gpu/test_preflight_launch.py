import math
import unittest

from preflight_launch import launch_blockers


class LaunchPreflightTest(unittest.TestCase):
    def test_allows_only_exited_owned_pods_below_budget(self):
        report = {
            "ownedPods": [{"name": "old", "status": "EXITED"}],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": 0.70,
        }
        self.assertEqual(launch_blockers(report, 15.0), [])

    def test_blocks_healthy_running_owned_pod(self):
        report = {
            "ownedPods": [{"name": "tinct-existing", "status": "RUNNING"}],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": 0.71,
        }
        self.assertIn("owned pod is still active", launch_blockers(report, 15.0)[0])

    def test_blocks_non_exited_owned_pod_even_without_guard_action(self):
        report = {
            "ownedPods": [{"name": "tinct-starting", "status": "CREATED"}],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": 0.70,
        }
        self.assertTrue(launch_blockers(report, 15.0))

    def test_blocks_exhausted_envelope(self):
        report = {
            "ownedPods": [],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": 15.0,
        }
        self.assertIn("envelope", launch_blockers(report, 15.0)[0])

    def test_reservation_blocks_launch_just_below_cap(self):
        report = {
            "ownedPods": [],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": 14.90,
        }
        failures = launch_blockers(report, 15.0, reserve=0.70)
        self.assertTrue(any("cannot reserve" in failure for failure in failures))

    def test_reservation_allows_current_reconciled_spend(self):
        report = {
            "ownedPods": [],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": 1.00,
        }
        self.assertEqual(launch_blockers(report, 15.0, reserve=0.70), [])

    def test_invalid_spend_or_reservation_fails_closed(self):
        base = {
            "ownedPods": [],
            "actions": [],
            "unownedRunningPods": [],
            "estimatedTotalSpend": math.nan,
        }
        self.assertTrue(launch_blockers(base, 15.0, reserve=0.70))
        base["estimatedTotalSpend"] = 1.0
        self.assertTrue(launch_blockers(base, 15.0, reserve=-0.01))


if __name__ == "__main__":
    unittest.main()
