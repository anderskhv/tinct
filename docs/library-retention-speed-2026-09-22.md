# Library retention and entry, 22 September 2026

The library compared a catalogue-level removal marker (`hidden.bible`) with
`books.bible`, although Bible positions are pinned under biblical book IDs.
A previously removed Bible therefore disappeared again after resuming it.
The shared library/switcher model now compares the marker with the resolved
position and session timestamps. Explicit removals still work; saved places
are never deleted or rewritten by rendering the library.

Library entry preloads the catalogue and critical layout from the document
head and starts the catalogue module earlier. Entering the library no longer
prepares a hidden Odyssey cover and edition samples. No auth, account or
position reconciliation is bypassed. Mobile performance remains network and
device dependent; do not infer a universal timing improvement from CI alone.

Desktop removes the redundant account-name header, starts the returning shelf
near the top, and places its caption beside the horizontally scrolling covers.
The phone keeps the native horizontal shelf and its caption below it.

Validation: 62 focused tests pass, including repeated Bible library rebuilds
and cloud reconciliation. Build and verify-bundle pass. The existing Chromium
and WebKit shelf acceptance now covers the re-added Bible, reload retention,
desktop top spacing, side-by-side details and absence of hidden-book requests.
Screenshots and loading measurements are saved in artifacts/reading-reel.
