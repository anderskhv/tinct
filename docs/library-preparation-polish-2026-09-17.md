# Library and preparation polish — September 17, 2026

Anders approved the compact animated preparation mockup and production release.
Base: 93f55e8, which includes the completed reader feedback and cache removal.

Failure class: retired library CSS overrides hide desktop captions and clip covers;
pointer capture suppresses book clicks; the first-category preview substitutes for
the complete catalogue. Preparation enlarges portrait artwork to a blurry landscape,
and content-driven centered bounds move when sections expand.

General correction: complete eligible Houses/Shelves catalogue; reel drag capture
only after movement; one explicit layout at both widths. Preparation retains all
existing callbacks and Primary/Secondary/None/Audiobook controls, uses a fixed dark
frame with one internal scroll area, starts Characters collapsed, and animates the
cover from its actual displayed bounds. Reading position and narration are untouched.

Verification pending: remote tests, build, bundle verification, desktop/phone browser
acceptance and production acceptance. Browser checks prohibit audio and microphone.
The earlier PR 95 is superseded by this release, pending successful verification.
