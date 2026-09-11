# Character integration status

Reviewed: 2026-09-11 (re-measured after the Divine Comedy, Paradise Lost and
Faust packages landed)

**Integration truth is measured, not assumed.** `python3 books/characters/serving_check.py`
probes production for each package's sidecar and reports the HTTP status beside
the package's own `appStatus`. The numbers below come from that probe, not from
any status file.

## Measured now

**58/72 packages are served by https://tinct.app.**

That is up from 4 when this file was first written, and from 20 at the first
re-measure. The Codex release owner has been integrating steadily.

Served:

a-little-princess, antigone, antony-and-cleopatra, apology, around-the-world-80-days, bacchae, beowulf, bible, candide, comedy-of-errors, communist-manifesto, coriolanus, crito, cymbeline, descartes-meditations, discourse-on-inequality, frederick-douglass, gilgamesh, hamlet, heart-of-darkness, henry-iv-part-2, henry-v, hume-enquiry, ivan-ilyich, jekyll-and-hyde, julius-caesar, jungle-book, kant-groundwork, king-lear, macbeth, measure-for-measure, medea, merchant-of-venice, merry-wives-of-windsor, midsummer, much-ado-about-nothing, notes-from-underground, oedipus-at-colonus, oedipus-rex, on-liberty, oresteia, othello, phaedo, phaedrus, poetics, richard-iii, romeo-and-juliet, social-contract, symposium, the-art-of-war, the-awakening, the-manual, the-prince, twelfth-night, us-founding-documents, utilitarianism, werther, winters-tale

## The status files lag production

38 packages return HTTP 200 from production while their own `status.json` still
says `appStatus: awaiting-integration`. **The packages are live; the status
files are stale.** This authoring lane never sets `appStatus` — that is the
release owner's field — so the correction has to come from Codex, not from here.
Until it does, read this file and the serving check rather than the per-package
`appStatus`.

Nothing in that list needs re-authoring. Anyone picking up the queue should
treat every name above as done and integrated, and take the next `not-started`
book from AUTOMATION-QUEUE.md.

## Still not served

Everything authored after the last integration pass, including the three largest
packages in the library: `divine-comedy` (589 entities, 100 cantos),
`paradise-lost` (171) and `faust-part-1` (97). These are queued in
RELEASE-QUEUE.md with their commit hashes, entry counts and source sha256 values,
and each carries its own required-production-checks list.

## How to re-measure

    python3 books/characters/serving_check.py            # against tinct.app
    python3 books/characters/serving_check.py <host>     # against any host

Validated is not deployed. Only the release owner's own evidence may set a
package's `appStatus` to live.
