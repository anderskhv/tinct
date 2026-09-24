# Pride and Prejudice accepted text release — 24 September 2026

Pinned acceptance: e004aad94981ccd203f7d603588d38392158cff5, books/wip/green-pride-and-prejudice/ACCEPTANCE-RECORD.md.
Accepted modern-en SHA256: 5ba867fe5e13a7c7c1f1f94946c6b6a575f342951467245a0d816723dd3f4c77.
The release retains the accepted bytes, 61 chapters and 2,060 paragraph positions. Original-en and character prose are unchanged.

The character package retains 3,206 of 3,211 existing modern-en links. Five projected spans are omitted conservatively rather than reassigned. Two are explicitly removed by the handoff (Darcy 35.4, Elizabeth 44.13). The other three are Elizabeth 12.0 (the specific repeated occurrence is now a pronoun), Darcy 45.7 (the specific occurrence is now "them"), and Mr. Bennet 55.20 (the prior span is replaced by Bingley). Other surviving occurrences retain their established identity; no new names or pronoun links are generated. The record's paragraph-wide name-presence count understates span-level removals.

The re-anchoring helper now projects snapshot evidence throughOffset fields alongside first-mention, role and snapshot reveal boundaries. A UTF-16 regression covers the previously stale evidence offset. All hash pins, mention spans, evidence boundaries and unchanged original/card prose are checked against the pinned baseline.

The seven existing mid-sentence source paragraph splits remain an explicitly tracked structural dependency. They require coordinated position/highlight mapping across editions and are not silently changed by this accepted text replacement.

No new edition or audio generation. Runtime narration remains keyed to exact approved text; historical recordings are preserved.

Verification: cloud preparation and similarity gate; exact remote acceptance and baseline evidence; full app tests/build/bundle verification; twelve isolated reader/card cases on Chromium desktop and WebKit phone across original and modern English. Browser checks require the reader's versioned source and card responses to match the committed bytes.
