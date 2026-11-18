# Recovered Shakespeare candidates — 18 November 2026

All four complete Danish and modern-English candidates were reconstructed from preserved literal editorial tool payloads against source commit `225979e36743d21502ebbace6c253fbc5ce09bfa`, still available in local Git. Recovery did not execute historical shell commands or generate replacement prose. Explicit literal operations were interpreted by limited recovery code. Historical `sed` and inline substitution adjustments were incorporated.

| Play | Scenes | Slots | Danish changed | English changed |
|---|---:|---:|---:|---:|
| Romeo and Juliet |25|1062|158|67|
| The Tempest |10|790|212|44|
| Comedy of Errors |11|690|549|32|
| Twelfth Night |18|1120|416|23|

Every total matches the final historical tool output in the November 5 parent session. Current checks establish valid JSON, exact chapter/paragraph counts, nonempty strings, and the matching changed-position totals. `SHAKESPEARE-RECOVERY-TESTS.json` records newly calculated hashes. Original final candidate hashes have not been recovered, so matching totals are corroboration, not proof of byte-identical recovery.

Historical review notes are preserved as historical documents. Their witness-comparison and close-reading claims have not been rerun during this recovery. The native Danish/performance review limitations remain. No upload or release occurred. Claude should reconcile these candidates against current main before integrating; source baselines and exact before/after change records are included in each book folder.
