# Clean public URLs — 8 September 2026

User requested removal of the awkward URLs left over from Lab promotion.

Normal navigation now uses `/library`, `/library?book=the-republic`, and `/reader`. Public reader mounts the new chrome and full voice trial without query flags. Explicit mini voice trials remain `?voiceTrial=mini`. Book detail links omit autoplay and view defaults; edition-specific views retain their meaningful view parameter.

Worker serves public addresses directly. Old `/lab/reader?chrome=v2` and `/lab/library` redirect to their public equivalents, preserving book/chapter and nondefault trial parameters. Explicit Lab QA routes and legacy reader previews remain available. Static runtime cache versions bumped. Browser Back/Forward uses the explicit book/view intent before the library pathname.

Verification: 141 files / 1,555 tests passed; build and bundle verification passed. Local browser check (Worker library asset serving emulated, routing separately unit-tested) verified direct book details, refresh, new-reader chrome, library search to book, Back and Forward. The final book action becomes Continue reading once it has been opened; the browser assertion accepts both states.

Deployment verification pending.
