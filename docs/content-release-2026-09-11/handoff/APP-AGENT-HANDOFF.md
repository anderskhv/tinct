# App-agent handoff — 2026-09-11 test-reader content release

From a content-only preparation pass (see `docs/content-release-2026-09-11/` for the full
release). Nothing in this handoff has been applied to the app. Everything below is a
recommendation for the app agent to review, adapt, and implement.

**Read this whole file before touching anything.** Several items depend on each other
(especially the Bible registry-key decision and the Henry IV Part 2 / Taming of the Shrew
chapter-renumbering warnings).

## 0. Explicit scope boundary — read first

This content-only pass did not touch, and this handoff does not ask you to change without
your own review: landing pages, public book-guide pages, marketing copy, SEO, React
components, reader behavior, library UI, routing, styles, availability policies or
edition-selection logic beyond what's explicitly proposed below, audio files, timing
files, storage, database records, or external services, or any other agent's branch or
unrelated changes. If anything below seems to require touching one of those, treat it as a
flag for your own judgment, not an instruction.

## 1. Bible replacement (highest priority)

### Files to place

| Staged source | Proposed app destination |
|---|---|
| `books/staged-replacements/bible-bsb/bible-bsb-en.staged.json` | `app/public/data/editions/bible-{key}.json` — key TBD, see decision below |

Do not copy `bsb.txt`, `build_bsb_edition.py`, `validation-report.md`,
`PROVENANCE.md`, `EDITION-METADATA.md`, or `berean-terms-2026-09-11.html` into `app/` —
those are working/evidence files, kept in `books/` for provenance, not app content.

### Registry key decision — needs your call

The current registry key for the AI-generated Bible edition is `modern-en`, `style:
'modern'`. BSB is a specific named human translation, not an AI modernization. Two
options (full detail in `books/staged-replacements/bible-bsb/EDITION-METADATA.md`):

1. Reuse the `modern-en` key, relabel it "Berean Standard Bible (2023)" — no schema
   change, but `style: 'modern'` becomes inaccurate.
2. Add a new key (e.g. `bsb-en`) alongside `kjv-en`/`web-en`, retire/hide `modern-en` for
   this book — cleaner, but touches the `Edition` type and anything assuming exactly one
   `style: 'modern'` edition per book.

Proposed metadata (option 1 shape, adapt if you choose option 2):

```ts
{
  key: 'modern-en',           // or new key, per your decision above
  language: 'en',
  style: 'modern',            // reconsider if you choose option 2
  label: 'Berean Standard Bible (2023)',
  translator: 'Berean Bible Translation Committee',
  year: 2023,
  aligned: true,
  hasAudio: false,             // see audio note below — do not set true without new audio
}
```

### Availability

**Recommend text-only until new narration exists.** `hasAudio: false` until Kokoro audio
is generated against the new text and a timing/manifest QA pass confirms sync (per the
existing pipeline gate in `books/AGENTS.md`).

### Audio/timing incompatibility — explicit

None of the existing Bible `modern-en` audio or its timing/highlight-sync files may be
reused. The new text differs from the old at effectively every verse, and the old file's
32-chapter verse-boundary-displacement bug (documented in the September audit) means whole
paragraphs of some chapters are different content entirely, not just reworded. Reusing old
audio against the new text will desynchronize immediately.

### Compare-mode / paragraph-alignment note

The staged BSB file deliberately reuses the exact same 5-verses-per-paragraph chunking
convention already used uniformly across all 1189 chapters of `bible-kjv-en.json` and
`bible-web-en.json` (verified mechanical, not literary, before reuse — see
`validation-report.md`'s methodology note). This means Compare between the new edition and
`kjv-en`/`web-en` should work exactly as well as `kjv-en` vs. `web-en` already does — no
new alignment logic should be needed. If you'd rather use BSB's own natural paragraphing
instead, that's a straightforward re-run of `build_bsb_edition.py` with a different
chunking function — flag it back to content work rather than reformatting at the app
layer.

### Reader-position note

Because chapter numbers (1-1189) and titles are unchanged from the existing scheme, this
should be a drop-in replacement from a reading-position standpoint — a saved position keyed
on chapter number should still resolve to the same chapter. Paragraph-index positions
*within* a chapter may point to different text than before (new wording), which is normal
for any edition-content change and not specific to this replacement.

### World English Bible Catholic — separate, deferred

Staged at `books/staged-replacements/bible-web-catholic/`, fully independent of the BSB
package (73/73 books verified, rights confirmed — see its own `PROVENANCE.md`). **Not
recommended for this release.** It cannot be represented in the existing 1189-chapter
Protestant numbering without either a full renumbering (breaks every reader's saved
position and every audio manifest) or a new, separate book entity — a product decision,
not a content one. See `bible-web-catholic/INTEGRATION-NOTES.md` for the two options.
Recommend deferring past this release; the source work is done and won't need repeating
later.

### Acceptance checks before publishing the Bible replacement

- [ ] Registry key decision made and documented (option 1 or 2 above)
- [ ] `bible-bsb-en.staged.json` (or renamed per your key choice) copied into
      `app/public/data/editions/`, validated with `python3 -m json.tool`
- [ ] `hasAudio: false` set for the new edition/key
- [ ] Edition label/translator/year fields match `EDITION-METADATA.md`
- [ ] Manual spot check: open Genesis 1, Psalm 23, and Revelation 22 in the reader and
      confirm text renders correctly (no encoding artifacts, correct paragraph breaks)
- [ ] Compare mode checked against `kjv-en` for at least one chapter
- [ ] `npm run build` + `npm run verify-bundle` pass (per `AGENTS.md`)

## 2. Confirmed defect-ledger actions

Full evidence in `docs/content-release-2026-09-11/04-confirmed-defect-ledger.md` and
`defect-ledger/*.md`. Summary of what each book needs from you, if/when you act on it —
none of this is applied yet:

- **Jane Eyre** — patch `modern-en` chapters 27, 34-38 (regenerate from `original-en`,
  which is clean). No structural/chapter-count change, so this is a content-only patch you
  could hand back to a content pass rather than do yourself — flagging the chapter
  renumbering risk is zero here, unlike the two items below.
- **Moby-Dick** — recommend withholding `modern-en` (or defaulting the book to
  `original-en`) until chapters 76 and 134-135 are patched. No renumbering risk.
- **As You Like It** — re-ingest `original-en` from Project Gutenberg #1523 or Standard
  Ebooks. **This changes the chapter count** (restores the missing Act 1 Scene 1 and
  removes 16 boilerplate paragraphs currently occupying chapter slots) — treat as a
  structural replacement, not a patch, and coordinate with whoever owns reading-position
  migration for this book.
- **Henry IV, Part 2** — restore the Induction (from Gutenberg #100) to all 3 editions.
  **This inserts a new chapter at position 1 and renumbers everything after it.** All 3
  editions currently show `hasAudio: true` — inserting a chapter will break audio indexing
  and any persisted reading positions unless migrated together. Do not do this as a quick
  content patch; it needs your coordination.
- **Faust, Part One** — replace `original-en` with the real Bayard Taylor text (Gutenberg
  #14591), then regenerate `modern-en`/`modern-da`. Interim, low-risk fix available now:
  correct the false `translator: 'Bayard Taylor'` registry attribution
  (`app/src/data/bookRegistry.ts`, the `FAUST_PART_1` entry) even before the full
  replacement lands.
- **Magna Carta** — rebuild from the Henderson (1892) translation (confirmed complete,
  public domain in both the US and Denmark). Recommend withholding the whole book until
  this lands, since every current edition traces to the same corrupted lineage.

## 3. Odyssey pilot — do not publish yet

`books/staged-replacements/odyssey-pilot/odyssey-book9-candidate.json` is a single-chapter
candidate, explicitly **not** meant to replace the live Book 9 of `odyssey-modern-en.json`
until Opus/Anders/Codex have reviewed the packet at
`books/staged-replacements/odyssey-pilot/review-packet/`. No action needed from you on
this yet beyond being aware it exists — treat as informational until review completes.

## 4. Test-reader starting shelf

See `docs/content-release-2026-09-11/07-test-reader-starting-shelf.md` for the full,
evidence-backed list (14 "Ready" books, several "Usable with known local issues," and the
explicit "Needs correction"/"Blocked" lists above). This is a recommendation for whatever
mechanism you use to point early test users at specific books (a curated list, a featured
shelf, onboarding defaults) — no availability/registry code changes are proposed by this
handoff beyond the Bible and defect-ledger items above. Treasure Island (the one staged,
unpublished book) is content-ready per its own audit entry but remains your call on
whether to publish it as part of this release — this handoff does not instruct you to
add it to `BOOKS`.

## 5. What NOT to do with this handoff

- Do not merge, deploy, or treat anything in `books/staged-replacements/` as already live.
- Do not silently apply the Bible registry-key decision — pick one and document it.
- Do not restore the Henry IV Part 2 Induction or re-ingest As You Like It without
  planning the chapter-renumbering/reading-position/audio-index migration first.
- Do not reuse any existing Bible audio with the new BSB text under any circumstance.
- Do not mix the WEB Catholic package into the existing Bible book entry.
- Do not describe any of this as published, live, or verified beyond what each
  deliverable's own evidence supports.
