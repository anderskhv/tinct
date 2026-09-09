# Pod 1 and pod 4 word-timing recovery — 9 September 2026

Completed at 13:06 UTC. **108 previously missing `words.json` objects restored;
three existing objects preserved; all 111 candidates now serve exact recovered
bytes through tinct.app.** This is an audio-data publication, with no app change,
Worker deployment, generation, GPU start or volume deletion.

## Publication

| Edition | Newly published chapters |
| --- | ---: |
| Moby-Dick / original-en | 63 |
| Peloponnesian War / original-en | 20 |
| Federalist Papers / modern-en | 23 |
| Democracy in America / modern-en | 1 (46) |
| Social Contract / original-en | 1 (37) |

Pod 1's Bible / modern-en chapter 1151 and Manual / original-en chapters 17 and
46 already existed and were byte-identical. They were not overwritten. Pod 4
contributed all 107 of its validated candidates; pod 1 contributed one new file.

For every write, an authenticated origin HEAD confirmed 404 immediately before
S3 PUT with **`If-None-Match: *`**. The precondition also prevents a competing
upload from being overwritten. Non-404 errors do not permit writes. Existing
R2 credentials were read locally without printing or copying their values.
Wrangler 4.124 was inspected, but its object PUT command does not expose this
precondition; the installed S3 SDK does. Cloudflare documents conditional PUT
support in its [S3 compatibility reference](https://developers.cloudflare.com/r2/api/s3/api/).

Every upload was followed by a production GET and SHA256 comparison. All 108
new objects and all three preserved objects returned 200 with exact bytes.
No existing object was replaced, and no MP3 or manifest was modified.

## Validation

Both local archives independently match the supplied SHA256s:

- Pod 4: `e80dcec78b929c4d6a344a1bf125a88a8a8cd886bb1563b8e79422e0b6b41d54`
- Pod 1: `b9cb74b18718d0e9da835f934f220ee30e6c062647129c3f1ce7176cb3db97e2`

Only regular files matching the expected book/edition/chapter sidecar pattern
were copied from the archives. Archive paths and scripts were not executed.
All 111 pass exact cleaned tokens and paragraph coverage against shipping
commit `1689f5d5` and freshly fetched live text, book/edition/chapter identity,
finite nonnegative monotonic timing, at least 85% observed paragraph alignment,
manifest file mapping and word ends within manifest duration plus 100 ms.
All **1,816 manifest-listed MP3/title objects** returned HEAD 200.

Social Contract and Manual use complete edition JSON rather than individual
chapter shards. Their initial shard 404s were not treated as missing book text:
the production full-edition files were fetched and the exact chapters validated.
The validator's six unit tests passed. Its source snapshot and SHA256 are saved
with the audit for reproducibility.

The pod helper/generator hash reports match each other and the actual files at
Git commit `f5b23de7795e73983edf55d922d0801d57d61287`. This verifies the supplied
source provenance; it is not an independent observation of a pod's runtime.
Pod stop state, billing and Grok's cost estimates were not independently verified.

## First-candidate production playback

Democracy in America / modern-en chapter 46 was published first. Production
SHA256: `b4698dc9c49058286d2089e1e06d084f6cdd942d71b10e013f62a409cb59044f`.

Chromium 1440×950 and WebKit 390×844 opened the actual production reader in an
isolated context. Both fetched those exact recovered bytes and played the real
chapter MP3. Forty-five clock/highlight samples per browser confirmed one
highlighted word at a time, advancement through at least eight word indexes,
and highlighted text/index corresponding to the sidecar at the playback clock.
Screenshots were inspected on both layouts. No model API or real user account
write was used. These are browser-engine checks, not physical-device tests.

This proves the reader consumes the restored timing data during real playback.
It does **not** certify every word against the audible speech throughout all
111 chapters; structural confidence and timestamp agreement are not a complete
acoustic audit. The existing confidence gate was not lowered.

## Pod 1 ledger and remaining repairs

The full `shard-1-en.log` matches the archived ledger byte-for-byte, SHA256
`e99ce8bc6c5bf58725cbfcef8f1d62aada7d1ea6355c4fd0086843c47d1d7962`.
Its final unique chapter outcomes reconcile exactly to **2,565 = 466 uploaded
+ 1,210 skipped + 889 failed**:

| Historical failure | Chapters |
| --- | ---: |
| Low observed alignment | 839 |
| HTTP 404 during generation | 35 |
| Network failures | 8 |
| Paragraph coverage/empty words | 4 |
| Upload failures | 3 |

All three upload failures have recovered files: Social Contract chapter 37
reported an API timeout; Manual chapters 17 and 46 reported connectivity
failures. The Manual files already existed at publication time. Bible modern-en
chapter 1151 has **no matching event in this shard ledger**; its recovery file
was nevertheless independently validated and already existed byte-identically.
Its generation history is not inferred. `fail-artifacts.txt` is empty.

Across the full pod 1 and pod 4 ledgers, 110 of 1,907 historical failed chapter
keys now have verified sidecars (108 restored here and two already present).
The **1,797 remaining historical failures** comprise 1,718 alignment, 60
historical HTTP 404, 12 network, six paragraph coverage and one invalid-audio
failure. Historical 404s are not a fresh diagnosis of which MP3 is absent.
Diagnose those paths and retain failed alignment evidence before any separately
approved GPU repair work. Other pod logs and remaining missing targets retain
their prior investigation scope.

All 108 new keys were in the earlier 4,361-key missing inventory. Subtracting
these verified repairs leaves **4,253** in that baseline list (8,172 present
out of 12,425 by baseline accounting). This is **not a new whole-corpus audit**;
other concurrent changes have not been counted. The original audit is retained.

## Evidence

All audit results, the full classified pod 1 ledger, publication journals,
remaining-key inventory, scripts and screenshots are under:

`/Users/andershvelplund/Documents/Projects/Tinct/output/audio-recovery-publication-2026-09-09/`

- `summary.json`, `audit-all.json`, `provenance.json`
- `publish-pilot.json`, `publish-rest.json`
- `pilot-playback.json`, `pilot-chromium.png`, `pilot-webkit.png`
- `pod1-ledger.json`, `pod1-ledger-summary.json`
- `recovery-repair-inventory.json`, `remaining-from-baseline.json`

The [readiness plan](word-sync-readiness-2026-09-09.md) remains authoritative for
the broader repair strategy. Raw recovery artifacts are not app assets and
were not added to the production bundle.
