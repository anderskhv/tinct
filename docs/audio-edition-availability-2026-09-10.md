# Temporary audio edition availability — 2026-09-10

Authorized through the audio execution task after Anders clarified edition-level
availability. Source proposal: output/audio-highlight-execution-2026-09-10/edition-availability-proposal.json.
The committed reversible policy is app/src/data/audioAvailability.json.

The current registry has 201 English editions: 148 eligible for new selection,
53 held. Ten books have no eligible English edition, so discovery lists 90 books.
The full 100-book registry, text assets and reader handoffs remain available.
Saved places, library membership and history are not deleted or migrated.
Danish remains excluded from new production selections. Audio metadata eligibility
does not certify word-highlight timing or acoustic accuracy.

Discovery shelves/search and new edition menus apply the policy independently
from reader-state validation. Existing held primary/compare editions remain
readable; current held options are retained disabled in settings. The Play action
shows an audio-unavailable notice without moving the reader. The audio hook also
blocks playback entry points for held editions, including resume.

Release code b9706eff retains verified token-group fix eb7f592c via base86a54b8c.
Validation: 153 test files / 1,644 tests pass. Build and verify-bundle pass.
Manifest regression compares every English registry entry, the full disjoint
partition, derived ten-book holds, unchanged saved handoffs and Bible availability.
Local WebKit390×844 and Chromium1440×950 verify90 discovery books, Biblemodern
as the only new choice and held Democracy original resuming paragraph2 unchanged
when Play is refused. Screenshots inspected. The same live phone/desktop checks pass on tinct.app.

Direct npm deployment succeeded (no Actions run used).
Worker87fb1277-f622-4990-b9b6-fb873905c917; bundle index-TwUGefRH.js.
SHA256531cad731be96b0f2562c972796414bcab081f84c748db6939eaeebd53c0207b.
Production /lab/phone references that exact bundle. JavaScript, catalogue JSON
and discovery runtime/model bytes match the build. All15 smoke tests passed.
Artifacts: /Users/andershvelplund/.codex/visualizations/2026/09/10/tinct-audio-availability/.

To restore editions, update the reviewed policy after the audio owner validates
repaired recordings, rerun partition and discovery regressions and deploy. No
saved-state rewrite or book re-registration is required. The audit manifest was
reconfirmed unchanged by the audio owner immediately before deployment.
