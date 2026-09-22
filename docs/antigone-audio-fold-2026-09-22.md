# Antigone audio and dark spread follow-up

The September 22 screenshot showed Modern English Prologue playback blocked by an edition-wide hold from September 10.

Read-only production audit: https://github.com/anderskhv/tinct/actions/runs/35702178188
The audit retrieved all 11 chapter manifests and checked every listed recording by range request. Chapters 1–9 and 11 have all recordings, and their word sidecars pass the existing identity, paragraph mapping, timestamp, and text-match checks at the unchanged 0.85 threshold (observed ratio 1.0). Chapter 10 still lacks `antigone/modern-en/ch10/p12.mp3` and its sidecar. The audit intentionally fails on that missing file. No recordings were generated or changed, and this is not acoustic certification.

The Play handler also incorrectly applied legacy recording holds when on-demand narration was available. Honor the active narration provider before applying legacy holds. Replace the blanket legacy edition hold with a chapter 10 hold. The reader checks that hold before playback and clears an unavailable notice when the chapter changes. Saved places remain unchanged. Chapter 10 remains an outstanding legacy recording repair; on-demand narration can still narrate its primary text. Other chapters are also playable through the repaired legacy recordings.

The dark spread measured centered in production (viewport 1363px, sheet x=30..1333, text columns x=71.875..1291.125). Its asymmetric reflected-light gradient made the center appear shifted. Balance dark-mode shading symmetrically without changing text or pagination geometry. Browser acceptance asserts that the fold remains centered in both the viewport and text columns.

Validation before review: audio policy and playback guard tests 15/15 passed; production build and verify-bundle passed. CI and production acceptance run through the normal deployment pipeline.
