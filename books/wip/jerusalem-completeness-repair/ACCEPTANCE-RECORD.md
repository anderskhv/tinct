# Acceptance Record — Jerusalem chapter-split fix + 17 modern-en corrections

**Status: ACCEPTED (content, narrow scope), ready for Codex integration.
Not published. See RELEASE-PACKET.md "What this does NOT fix" — this is
explicitly a partial repair, not a full modern-en pass.**

| Item | Value |
|---|---|
| Package | `books/wip/jerusalem-completeness-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate original-en sha256 | `abc0618b87f5384b803432bf430fcdab4c31280924460609e9efc7c17286d407` |
| Candidate modern-en sha256 | `ae1c6461b8468cf3a7185f65fe98c948c983bffea19e10fdfc2a49851046bc06` |
| Replaces live sha256 | original-en `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c`; modern-en `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` |
| Author (this package) | Claude, this session, 2026-09-26 |
| Independent reviewer | A separate Claude agent instance, spawned with no visibility into this package's build notes, working only from the Gutenberg source and the candidate/live JSON |
| Review evidence | `INDEPENDENT-REVIEW.md` (this folder) |
| Review verdict | **DO NOT ACCEPT as staged** — one blocking metadata bug found. **Fixed and re-verified in this final candidate** (see below); both claimed content fixes were independently confirmed correct. |

## Independent review summary and disposition

**Found and fixed (blocking):** the top-level `sections` array (used for
Book/TOC navigation) was not updated when chapter 10 was merged into
chapter 9 — "Book Three" still listed chapters `[9, 10, ..., 18]` in both
candidate files, but chapter 18 no longer exists after the merge. **Fixed**:
now lists `[9, 10, ..., 17]` in both files. Hashes above reflect the fix.

**Confirmed correct (reviewer's independent checks):**

- **Chapter-split fix**: the reviewer fetched PG #15837 independently,
  confirmed line 6474 is genuinely mid-quote narrative text misread as a
  heading, confirmed the live served chapter 9 truly ends mid-quote and
  live chapter 10 is titled "Unity, Unity." with unrelated content exactly
  as claimed, and confirmed the candidate correctly merges them (86
  paragraphs = 75 + 11, quote completed: "...is UNITY, UNITY, UNITY."),
  correctly renumbers chapters 11–18 down to 10–17 with zero paragraphs
  lost, duplicated, or reordered (verified programmatically against the
  live file), and leaves chapters 1–8 untouched.
- **17-paragraph fix**: the reviewer independently confirmed all 17 live
  modern-en paragraphs are truncated, and that several substitute
  genuinely fabricated content contradicting the original — for example
  3.33 (live) invents angels and censers where the original explicitly
  says the vision of heaven was never divulged to a soul, and 8.148 (live)
  invents "white blossoms" where the original says "newly sprung leaves."
  All 17 candidate replacements were confirmed faithful, full-length
  (length ratio 0.89–1.02 against the original, versus 0.16–0.65 in the
  live text) and free of invented content.
- Both candidate JSON files parse cleanly; all 17 chapters have matching
  `original-en`/`modern-en` paragraph counts.

**New finding, recorded not fixed (explicitly out of scope for this
package, per its own disclosed limits):** the reviewer's requested
spot-check beyond the 17 fixed locations found the same
truncation-plus-fabrication pattern, uncaught here, at chapter 1
paragraphs 8, 16, 20, 21 and 47, and chapter 5 paragraph 12. Paragraph 21
is plot-relevant: the original reveals Brita's pregnancy, which the
strangled-infant reveal at paragraph 24 (one of the 17 this package did
fix) depends on, and the live modern-en instead invents an unrelated
near-breakup scene. This confirms — rather than contradicts — this
package's own disclosure that the 17 locations are a sample of a much
broader defect, not its full extent, and that the recommended full
re-render (see RELEASE-PACKET.md) needs to treat every LIGHT/MECHANICAL
chapter as suspect for fabrication, not just mechanical thinness.

## Open items handed to Codex

1. **The full modern-en re-render is NOT done.** 14 of 17 chapters remain
   LIGHT/MECHANICAL (similarity gate fails, 0.892 weighted vs. 0.75 limit)
   and, per the finding above, likely contain further fabricated content
   beyond what a similarity score alone would flag. Recommend queuing as
   its own content assignment.
2. **Character-card re-anchoring**: `CHARACTER-CARD-IMPACT.json` gives the
   full remap for both editions' 7 mentions each.
3. **Threads re-keying**: `app/public/data/editions/jerusalem-threads.json`
   needs chapter keys re-derived per `PARAGRAPH-MAP.json` — old key "10"'s
   content needs manual placement within chapter 9's now-larger range.
4. **Onboarding**: not inspected for chapter-count references; flag for
   Codex given the 18→17 renumbering.
5. **Danish scope decision**: same as the Macbeth/AYLI packages — needs
   Anders' decision on `modern-da` (1,787 paragraphs, 18 chapters, live)
   before it can be Compare-paired with the repaired editions.

## What "accepted" does not mean

This narrow content fix is accepted for integration. It does not mean
Jerusalem's modern-en edition is repaired — see "What this does NOT fix"
in `RELEASE-PACKET.md`. Not published, not live, not deployed. Codex owns
integration, the Danish-scope decision, app verification, and the
serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
