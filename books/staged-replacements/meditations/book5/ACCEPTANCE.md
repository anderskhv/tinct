# Acceptance — Meditations, Book V

**Accepted file:** `candidate-v2.json`, sha256 `9a14c3ae5d14be57649348a443d5919fdc27c486789d040c6276803c123ca5ce` (36 paragraphs, V.1–V.36, one per numbered meditation, aligned 1:1 with `source-book5.json`; word ratio 0.995 to Long, minimum paragraph ratio 0.95, V.4's three "out of which" → "from which").

**Date:** 2026-09-11. **By:** the content agent for this thread, after the steps below; the coordinator's reviewer session did not draft the candidate.

## Review rounds applied

1. **Round 1** — `review/findings-v1.md`, independent reviewer session spawned by the coordinator, on `candidate-v1.json` (sha256 `9b061974…`). Verdict: *Accept after corrections*. 0 substantive findings, 5 minor (3 "worth improving": 1.1, 26.1, 36.1; 2 "optional preference": 10.1, 33.1), 31 paragraphs with no material issue. Rulings on the five base-text defects and the V.28 bracket, all confirming the draft's handling except that V.1 "rather than to perfect" is not a defect at all.

No second round was requested: there was no substantive finding, every correction is confined to the clause the finding quotes, and every new wording is the reviewer's own first proposal or Long's own word, so the review's condition for a second round was not met.

## Step 6 — corrections applied and verified

- **Applied:** all five findings. 1.1 "the vainglorious man his little glory" (Long's "vain-glorious" spelled solid; the fourth of his four cognate pairs restored — the drafter's v1 reason, Book I's "vanity" for "vain-glory" at I.16, does not carry, since I.16 has no paired object); 26.1 "but do not let the ruling part, of itself, add to the sensation the opinion that it is either good or bad" (the reviewer's first proposal: "do not let" for Long's "let not", commas around "of itself", so the concluding prohibition is read at first sight); 36.1 "I do not know how" (the one "not"-after-verb form left in the book, recast to the edition's own standard; the set phrase was not judged worth an exception); 10.1 "Things are so enveloped" (Long's own root, current, and free of the "so wrapped up" idiom for being absorbed — the v1 reason, "the plain verb keeps the image", had not weighed that idiom); 33.1 "but name is sound and echo" (Long's bare noun restored: the sentence moves from the countable "a name … not even a name" to name as such, which is what he calls sound and echo).
- **Declined:** none. On the two optional findings the decision was to apply both, under the D8 pattern (a minor finding is applied unless `continuity.md` already records a considered reason not to, and neither v1 reason survived the reviewer's point).
- The reviewer's "also noted" points (not numbered findings) were left as v1 has them, each with a reason in `changes-v1-to-v2.md`: V.1 "hurry", V.8 "as we receive those that Aesculapius prescribes" (an interpretive decision the reviewer endorsed), V.19's last clause in Long's construction, V.28 "I wish you well of your discovery".
- Full list, old and new text side by side with the finding ID, in `changes-v1-to-v2.md`; applied mechanically by `scripts/build_book5_v2.py`, which asserts that each old string occurs exactly once in its paragraph, that the four named dagger clauses are still present in source and candidate, and that the V.29 ellipsis is present in both. 5 paragraphs touched (V.1, V.10, V.26, V.33, V.36), 31 untouched; paragraph count 36; numbering intact.
- Each changed passage was re-read against `source-book5.json` after the build, using the script's per-paragraph word diff: only the intended words changed (V.1 −vain +vainglorious; V.10 −wrapped −up +enveloped; V.26 +do +not −not, commas around "of itself"; V.33 −a; V.36 −not +do +not), and every new word is Long's own (vainglorious, name, the root of enveloped) or the modern form of Long's construction (do not let; do not know).
- The four dagger clauses (seven marks — V.9 ×1, V.12 ×4, V.28 ×2) stand verbatim: V.9 "For thus you will not fail to obey reason, and you will repose in it" (pronouns modernised only); V.12 "anything which should not be in harmony with what is really good" and "Thus even the many perceive the difference."; V.28 "Neither tragic actor nor whore." (Long's literal rendering of a corrupt fragment, confirmed by the reviewer from his footnote as text rather than D11 apparatus, kept as the last sentence without the brackets).
- Base-text defects: the reviewer's rulings are recorded in `continuity.md`. V.15 "snowed" → "showed", V.29 "them art" → "you have", V.32 "though" → "through" confirmed as scan/printing errors with the evident word right; V.5 "formed from them" → "for them" confirmed as the only reading the context allows, the nature of the error left open; V.1 "rather than to perfect" ruled **not a defect** (reads as "prefer neither X nor Y to Z"), and the v1 `continuity.md` lines that had called it a sentence that "seems to want a negative" are corrected — a record change, no text change.
- Glossary: no departure introduced or removed. The two Book V rows (affects → feelings; the formal / the material → form / matter) and the two extended rows stand as drafted and as the reviewer found them applied. No new glossary row needed.
- Mechanical checks from `README.md` re-run against both v1 (frozen hash `9b061974…` confirmed) and v2: paragraph count, numbering, packet coverage, readable copies identical to the JSON, no `[Illustration` in the staged file, dagger clauses present in source, v1 and v2, V.29 ellipsis present. All passed.

## Step 7 — flow read

`candidate-v2-readable.md` read continuously from V.1 to V.36. The book reads as one self-address in one voice: the long meditations (V.1, V.6, V.8, V.9, V.10, V.12, V.15, V.16, V.31, V.33, V.36) carry Long's argument in his order with the lists and dialogue dashes intact; the one- and two-line sayings (V.2, V.7, V.17, V.18, V.24, V.25, V.35) stay at Long's length; the imperatives stay bare ("Live with the gods."; "Show him where his error is."). The five corrected clauses read without a snag in place. Terminology was checked across the accepted books at the read — the ruling part, the god within, the nature of the whole (as II.9 and IV.36 v2), rational being, social being, the common good, discontented, calm, in a way, feelings beside Long's own "emotions" (V.36), impulse (V.3) beside "the movements in the flesh" (V.26), vex (as IV.44 v2), resent — all as the glossary and the earlier acceptances have them. Long's own redundancy "return back again" (V.9) and his "get away out of life" (V.29) stand because they are his. No change was made from the read.

## Step 8 — acceptance

No substantive issue remains. Book V is accepted as `candidate-v2.json`.

## What remains open

- Nothing content-side for Book V. The registry misattribution and the 412 → 487 paragraph re-basing decision (`../00-progress-ledger.md`, "Needs Anders") are unchanged and outside this book's acceptance.
- Errors can remain; this record claims the process was followed, not that the text is beyond correction. A later reader's finding goes into a `candidate-v3.json` with the same change-log discipline.
