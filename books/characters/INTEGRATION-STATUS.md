# Character integration status

Reviewed: 2026-09-11

The earlier four-package observation captured a deployment regression, not the
complete release history. [Preserved observation](integration-status-before-recovery-2026-09-11.md).
Main had deployed stale93f7b9d9 over later releases. Recovery95029ffe2 merges
verified68e7d1d0 with current main tooling/CI. GitHub deploy34579232785 succeeded,
including exact bundle-byte comparison and15smoke checks. Current recovery bundle
index-DnUXeTyY.js, Worker2afbdd92-12a7-4ad3-bf8e-087ef9bd3731.

After reference release b7abab07a, the reader registers 20 book scopes: 18 validated
packages, the whole-book Awakening pilot, and partial Bible (Baruch only). All 20
versioned live assets match release files. Reference release workflow34580387836
passed; bundle index-ByP0wWUD.js; all 60 new browser scenarios passed. The content inventory remains60validated,
37not-started, and3partial/pilot scopes; **45validated packages remain unreleased**:
44awaiting independent release review/integration plus The Tempest source hold.

Authored, mechanically validated, served assets, registered editions and
production-verified behavior are separate states. HTTP200 alone is not evidence:
SPA fallback HTML and stale immutable URLs must not count as character packages.
`serving_check.py` checks JSON identity and records the fetched URL; its result is
asset availability only. Verify supportedEditions, release provenance, source hashes
and actual reader gestures before changing appStatus to live.

Latest detailed release: [nine plays](../../docs/character-cards-nine-2026-09-10.md).
Runtime and release history are now pushed to main. Preserve source ambiguity
exclusions from20b4d7bc; do not overwrite them with older author-side assets.

US Founding Documents, Kant Groundwork and Descartes Meditations are now live;
see the [reference release](../../docs/character-reference-release-2026-09-11.md).
Next: independently review the remaining 41 queued packages; preserve the separate
Tempest hold. No authoring lane or external routine was changed.
