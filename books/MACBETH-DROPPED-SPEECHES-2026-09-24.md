# Macbeth — dropped-speech repair (prepared, not published)

Found 2026-09-24 by the edition-alignment pilot. **Status: text repaired and
linked data rebuilt on branch `claude/mobile-version-compare-ux-gxwm07`. Not
published. Publication is Codex's, and requires the user-data migration and
linked-data updates below to ship in the same release.**

## Defect

The parser that built Macbeth kept a speech only when its block began with a
speaker label. A speech that continues after a stage direction, without the
label repeated, was dropped. Both served English editions were missing **34
passages** (~1,300 words), including "Is this a dagger which I see before me",
"The raven himself is hoarse", "To be thus is nothing", "Glamis thou art, and
Cawdor" and "I have liv'd long enough". modern-en had one of them (the Glamis
soliloquy, appended to the letter in 1.5), so the editions also disagreed there.

**Other plays checked** against fresh Project Gutenberg texts with the same
word-level comparison: all 23 Shakespeare plays in the registry plus Bacchae and
Oresteia. Only Macbeth is affected. (As You Like It's only difference is a song
refrain its source abbreviates as "&c."; Bacchae/Oresteia differ by notes and
cast lists, meant to be left out.)

## What was done (branch)

| Item | Result |
|---|---|
| Restoration tool | `books/repair/restore_play_continuations.py`: walks source and edition in step; restores each missing continuation **verbatim from the source**, attributed to the last speaker. Plan: `books/repair/macbeth-restore-plan.json`. |
| original-en | 32 new paragraphs `SPEAKER. <speech>` after their stage directions; 2 same-speaker continuations appended (5¶1 Glamis, 15¶6 "Be large in mirth"). 806 → 838 paragraphs. **No existing paragraph changed** except the 2 appends, which only gained text at the end. |
| modern-en | 32 new paragraphs rendered in-session (zero API): `books/repair/macbeth-modern-inserts.json`. The 2 appends were already present. 806 → 838. |
| Completeness | Restoration tool re-run: 0 missing. Source-vs-served word diff: only act/scene headings remain. Chapter paragraph counts equal across both English editions. |
| Source | All 34 passages are identical in both local sources (`books/raw/macbeth/raw.txt`, sha `03fa4dc2…`, and current PG #1533, sha `1371a47e…`). |
| Similarity gate | `classify-modern-en.py macbeth --gate`: PASS (weighted similarity 0.475; 0 light/mechanical). |
| `macbeth-lines.json` | Regenerated with `scripts/build-play-verse-lines.py` from PG #1533: 0 unmatched; 342 → 362 paragraphs with verse breaks. |
| Character package | Rebuilt with `books/characters/build_macbeth.py` (`contentVersion` 2026-09-24.1). Editorial snapshot gates remapped (4) and two hard-coded coordinates in the builder remapped (Norway 2.15→2.16; Banquo vision 18.52–53→18.53–54), each verified to point at the same text. `test_macbeth.py`: 10/10 pass. The app's `characterCards.test.ts` + verse-line tests: 72/72 pass **with** the rebuilt package in place, 2 fail closed with the currently published one (expected: it is bound to the old edition). |
| Alignment pilot data | Model reviews remapped through the paragraph map (22 still validate); 5¶1 dropped for re-review; file stays unapproved. |

Hashes (sha256):

| File | Before | After |
|---|---|---|
| macbeth-original-en.json | 2650bcc6…9e30608 | 7c01065a…a82d12 |
| macbeth-modern-en.json | 0c852730…5d02f1 | 2f8dc15d…b3bec34f |
| macbeth-lines.json | (edition 2650bcc6) | c49a22bb…74d8c0 |
| books/characters/macbeth/characters.v1.json | — | 4f07a8da…bbdbbda |

## Paragraph map

`books/repair/macbeth-paragraph-map.json`: for each changed chapter, old →
new 0-based paragraph index; chapters not listed are unchanged. It is the same
for original-en and modern-en. Changed chapters: 2, 4, 5, 7, 8, 10, 11, 12, 13,
15, 16, 18, 19, 21, 23, 25.

Because every pre-existing paragraph is byte-identical at its new index (two
gained text only at the end), **an exact remap is possible**: paragraph index
changes through the map; word indices and UTF-16 character offsets within a
paragraph stay valid. This is stronger than the Meditations precedent
(`app/src/data/rebasedEditions.ts`), which had no map and reset readers to the
chapter start.

## Required before publishing (Codex)

### 1. User-data migration (exact remap)

Every store below keys by paragraph index and must be remapped for
`bookId === 'macbeth'`, chapters in the map. Offsets are left unchanged.

| Store | Key / location | Fields to remap |
|---|---|---|
| Position | `position:macbeth` (localStorage + Supabase `user_data`) | `lastParagraphIndex` |
| Lab position | `tinct-lab-position`, IndexedDB `tinct-lab/kv/position`, KV `lab-position:<uid>` | `books.macbeth.paragraphIndex`, `recentChapters["macbeth:*"].paragraphIndex` |
| Highlights | `highlights:macbeth:<ch>` | `paragraphIndex` |
| Notes | `notes:macbeth:<ch>` | `paragraphIndex` |
| Lab highlights | `tinct-lab-highlights` (device-local) | `paragraphIndex`, `endParagraphIndex` |
| Reading log | `reading-log:macbeth` | session `startParagraphIndex`, `lastParagraphIndex` |
| Chat history | `chat-history:macbeth`; lab chat/talk history | conversation and message `paragraphIndex` |
| Reading memory | anchors and text ranges (`commit_user_data`) | `paragraphIndex`, `startParagraphIndex`, `endParagraphIndex` |

**Never remap twice.** A date gate alone is not safe for records that keep
their original timestamp when rewritten (highlights keep `timestamp`; lab
highlights have none). Rule:

1. A record needs remapping iff it was written before `MACBETH_RESTORED_AT`
   (the publish time) **and** does not carry the marker
   `anchorVersion: "macbeth-2026-09-24"`.
2. Missing timestamp counts as before (same reasoning as `rebasedEditions.ts`).
3. Remap, set the marker, and write back once through the normal versioned
   path (`commit_user_data` with `rev`), so a second device sees the marker
   and skips it.
4. Where a record stores quoted text (`text`, reading-memory `firstWords`),
   verify it against the new paragraph after remapping; on mismatch, fall back
   to the chapter start / hide the anchor (fail safe, like `textRangeMatches`).

Suggested tests: a pre-repair position at 12¶23 lands on 12¶28 ("FIRST
MURDERER. It was, so please your Highness."); a record at 8¶20 ("[A bell
rings.]") maps to 8¶22; a second run is a no-op; a post-repair record
is untouched.

### 2. Linked data in the same release

- Publish the rebuilt character package to
  `app/public/data/characters/macbeth.v1.json` (the minified form of
  `books/characters/macbeth/characters.v1.json`). Publishing the editions
  without it makes character cards fail closed for Macbeth.
- `macbeth-lines.json` (regenerated, on branch).
- **Audio:** manifests index paragraphs, so every changed chapter would narrate
  the wrong paragraph. Add `held_chapters` for `macbeth/original-en` and
  `macbeth/modern-en` = [2, 4, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 23,
  25] in `app/src/data/audioAvailability.json` until audio for those chapters
  is regenerated under the current audiobook architecture (separately scoped;
  this repair authorises no synthesis).
- SEO static pages `app/public/read/macbeth/*` via `app/scripts/seo/macbeth.cjs`.
- Threads (`macbeth-threads.json`) are chapter-level; no paragraph keys. No
  change required.

### 3. Decision for Anders: Danish edition

`macbeth-modern-da.json` still has 806 paragraphs. Danish editions are not
discoverable (`isEditionDiscoverable` excludes `da`), so readers are not
affected, but the edition is registered `aligned: true`. Options: (a) leave it
and record the divergence (recommended under the language strategy: no new
Danish work), (b) insert 32 Danish paragraphs, (c) unregister the edition.
