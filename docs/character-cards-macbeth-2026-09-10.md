# Macbeth character cards — September 10

Second integrated package in the approved whole-library rollout, supplied in
content-owner commit `04bd2770`. Both English editions cover all 28 scenes and
806 paragraphs. Original has 63 entries / 1,014 mentions; modern has 58 entries /
1,036 mentions, with five absent references explicitly omitted. These are entry
counts, including groups and references, not counts of individual people.

Exact source hashes and paragraph spans gate lookup. The reviewed package
separates Cawdor's holders, the English and Scottish doctors, and anonymous roles;
title changes are released at their source passage. Apparitions are described
without interpreting their later fulfillment. See `books/characters/macbeth/`
for source review, omissions, and authoring-agent review limits. No independent
editorial review is claimed.

Runtime change only adds the two editions and their versioned asset. Existing
Awakening, Hamlet and Bible/Baruch versions are preserved. No source prose,
pagination, position writes, or per-click model calls changed.

Validation: compiler freshness and all 32 Python package tests passed; all 1,631
app tests passed; build and bundle verification passed. Browser matrix targets
24 cases across phone WebKit and desktop Chromium, both editions: stage group,
speaker, both Cawdor owners in the same speech, and both doctors. Each asserts
correct card content, unchanged reader position and no persisted highlight.
Test API requests are intercepted; no model or account writes.

Release verification pending.
