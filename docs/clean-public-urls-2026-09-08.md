# Clean public URLs — 8 September 2026

User requested removal of the awkward URLs left over from Lab promotion.

Normal navigation now uses `/library`, `/library?book=the-republic`, and `/reader`. Public reader mounts the new chrome and full voice trial without query flags. Explicit mini voice trials remain `?voiceTrial=mini`. Book detail links omit autoplay and view defaults; edition-specific views retain their meaningful view parameter.

Worker serves public addresses directly. Old `/lab/reader?chrome=v2` and `/lab/library` redirect to their public equivalents, preserving book/chapter and nondefault trial parameters. Explicit Lab QA routes and legacy reader previews remain available. Static runtime cache versions bumped. Browser Back/Forward uses the explicit book/view intent before the library pathname.

Verification: 141 files / 1,555 tests passed; build and bundle verification passed. Local browser check (Worker library asset serving emulated, routing separately unit-tested) verified direct book details, refresh, new-reader chrome, library search to book, Back and Forward. The final book action becomes Continue reading once it has been opened; the browser assertion accepts both states.

Deployed successfully via npm run deploy: Worker `e16a94cc-7834-4394-bb61-20ec8295c657`. Bundle `index-7G18c3yZ.js`, SHA256 `1e4997e13fbc26dc538ad3810409a8290d5f169142e903b06d690316b340597d`, live/local hashes match. Production mobile browser verified clean library/book/reader navigation, book refresh, new chrome and browser Back/Forward. Legacy `/lab/reader?chrome=v2&book=bible&chapter=3` responds 302 to `/reader?book=bible&chapter=3`. Screenshots: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/compact-editions/clean-reader.png` and `clean-library.png`.

Updated page-turn browser regression to accept the canonical reader destination.
