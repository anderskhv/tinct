# Wuthering Heights — taxonomy proposal only

No registry, catalogue or reading list has been changed. Identifiers below were checked against `app/src/data/libraryTaxonomy.ts` at base commit `37876e623fd7bb69cce705a5fe14dfde9e8500d3` using read-only Git access.

| Field | Proposed value | Reason |
| --- | --- | --- |
| Book id | `wuthering-heights` | Assigned package identity |
| Title / author | Wuthering Heights / Emily Brontë | Verified Gutenberg 768 header |
| House | `novel` — Novels | Sustained prose fiction |
| Primary shelf | `english-novels` — 19th-Century English Novels | English novel, first published 1847 |
| Additional shelf | `gothic-novels` — The Gothic | Haunted interiors, threatened bodies and unsettled boundaries between living and dead |
| Form | `novel` | Existing form identifier |
| Era | `modern` — 19th Century (1800–1900) | Existing taxonomy uses “modern” for the nineteenth century; this is not a modernist classification |
| Display year / sort year | `1847` / `1847` | First publication, not the narrative’s opening year of 1801 |
| Tradition | English / British | Editorial descriptive metadata, not an invented runtime enum |
| Languages | `EN` only | This package contains no Danish |
| Themes | revenge, class, inheritance, attachment, family, storytelling | Editorial suggestions, not new shelf registrations |
| Canon/list memberships | `[]` pending evidence | No entry for the title/id was found in this base version’s reading-list definitions; no Bloom, Yale or other membership is inferred |
| Primary edition after acceptance | `modern-en` | Requires the complete assembled rendering and whole-book gate first |
| Comparison edition | `original-en` | 34 validated reading units, 1,931 paragraphs |

Proposed catalogue blurb: **Two Yorkshire households carry a childhood attachment, a family grievance and a struggle over property into another generation.**

The generic status of the novel as a classic is not evidence of inclusion in a particular canon list. Any later membership proposal needs the list’s actual primary contents and edition. Reading-time estimate for onboarding is 8–10 hours, based on the 115,815-word original at roughly 200–250 words per minute; it is not an audio duration.

Structure is flat, Chapter I–XXXIV, `sections: []`. The wh1 part covers I–XI only. Do not advertise modern-en as complete until the other sessions’ parts are accepted, assembled and gated. Character and onboarding proposals remain staged for Claude. Nothing is registered or published.
