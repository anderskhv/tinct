# Three reference-card packages — September 11, 2026

Reviewed: 2026-09-11

## Review and scope

US Founding Documents (3 entries per English edition), Kant Groundwork (7), and
Descartes Meditations (6) were independently reviewed for release. Content import
95bdc8792; app registration 1341dede0; revision 2026-09-11.1. This follows production
recovery 95029ffe2; no previously released package was re-authored or re-enabled as
new work. The independent audio hold on Descartes stays in place; saved/direct
text remains readable.

Review checked every named identity and selected mention contexts in both
English editions, source fingerprints, exclusions, and candidate capitalized names.
This was an independent targeted editorial review, not a second full translation
review or a claim that every unnamed/pronominal reference is linked.

- Founding Documents: George III is the specific king/prince in the Declaration;
  generic constitutional offices are not historical officeholders. God and the
  Constitution’s Christian dating formula are religious references. The source
  omits signer lists, so no selectable Jefferson/Washington was invented.
  [National Archives](https://www.archives.gov/founding-docs/declaration-history)
  corroborates the Declaration context.
- Groundwork: Wolf identifies Christian Wolff; Sulzer and Hutcheson footnotes
  are included; the Gospel epithet identifies Jesus; Juno stays a mythic reference.
  The [Cambridge name index](https://assets.cambridge.org/97805215/14576/index/9780521514576_index.pdf)
  independently corroborates the named philosophers. No hypothetical moral agent
  was promoted to cast.
- Descartes: mathematical references remain distinct; Leo X identifies the pope
  named in the dedication ([Vatican record](https://www.vatican.va/content/vatican/de/holy-father/leone-x.html)).
  The demon is explicitly hypothetical and scoped to 4:11, 5:2, 5:5. Descartes as his
  own deceiver at 4:10 does not bind to it. God’s card adds no later argument outcome.

All six source hashes match shipping editions. No source text, position writer,
audio file, authoring assignment, dependency or database schema changed.

## Verification

135 release content tests and all three builder --check runs passed. 1,670 app
tests in 153 files passed, including all mention resolution and snapshot boundary
checks; build and verify-bundle passed. Local WebKit 390×844 and Chromium 1440×950
passed 44 card cases and 16 negative cases. Saved place stayed unchanged and selecting
a card created no highlight. Negative cases include generic President/Prince,
Providence Plantations and the narrator as his own deceiver.

GitHub deploy 34580387836 succeeded from b7abab07a:
https://github.com/anderskhv/tinct/actions/runs/34580387836
Worker dedba700-80cf-4b13-b8d4-c89f3cd484e7; bundle index-ByP0wWUD.js;
SHA256 cfa295abcbb25b58cc9148f6d86cc48d3bf3818b7821bd8992c383be330e4f50.
CI verified exact served bundle bytes and all 15 smoke checks passed. Production
WebKit/Chromium passed all 44 card and 16 negative scenarios. All 20 versioned assets
match released files; /lab/phone screenshot saved. Representative card screenshots
were inspected. These are browser tests, not physical-device certification.

Artifacts: /Users/andershvelplund/.codex/visualizations/2026/09/11/tinct-reference-characters/
Includes per-book results/screenshots, omissions, asset-verification.json,
lab-phone.png and workflow-evidence.txt.

## Queue reconciliation

Remote authority: claude/tinct-character-content-1n5iqq, books/characters/
AUTOMATION-QUEUE.md and per-book status.json, with generated library-inventory.json.
The external authoring schedule was not inspected or changed. A schedule or remote
commit is not proof that an author is running at this moment.

The 60 validated / 37 not-started / 3 partial snapshot was re-read from current files.
Nine awaiting-integration statuses were stale. The concurrent four-only audit
captured a real main deployment regression; that observation is preserved as history
on the content branch and superseded by verified recovery. Runtime now has 20 book scopes: 18 validated packages plus the whole-book Awakening
pilot and partial Bible.42 validated packages remain unreleased: 41 awaiting review
and integration, plus the Tempest source hold.37 books remain not-started; the three
partial/pilot statuses are preserved separately.
The Tempest remains held for source speaker-label review, not silently enabled.

Next: continue independent review of the remaining queue. Keep authored, validated,
served, registered and production-verified status distinct. Lane assignments remain
unchanged; a new qualification rejects the claim that treatises have no identity or
spoiler hazards. Rejected claims/pushes require rereading remote ownership before
reconciliation, rather than blindly retrying.
