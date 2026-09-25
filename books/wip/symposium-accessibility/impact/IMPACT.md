# Downstream impact of the accessibility pass

This pass changes the **text of 163 modern-en paragraphs**. It does not change structure: coordinates, chapters, titles and paragraph count all stay the same. **original-en is not changed.**

Everything below is staged for the coding owner. Nothing is applied to live files.

## 1. Reader data

See `migration/MIGRATION.md`. In short:

- **One combined release** from the live editions to the final ones.
- **Composed opcodes are supplied.** They cover positions, highlights and notes.
- **Unresolved highlights are kept, never discarded or snapped to a paragraph start.**
- **Danish is marked `aligned: false`** in the same release.

## 2. Character cards (`app/public/data/characters/symposium.v1.json`)

Details are in `impact/character-card-impact.json`, section `modern-en`. Every coordinate is in the final candidate's space (`a848700f…b76d`) and every offset is in UTF-16 code units.

### 2.1 Mentions

The chain runs: live card → completeness remap → this pass. The **533 mentions considered** are these:

- the 506 live modern-en mentions, remapped as in the completeness package;
- the completeness package's 25 proposed prologue mentions;
- its 2 optional informant mentions.

**453 of them lie in changed paragraphs.** Each one was mapped into the new text:

| Result | Count | What to do |
|---|---|---|
| Exact (same text, new offsets) | 441 | Apply the new `startOffset`/`endOffset` from `mentionChanges` |
| Text changed | 12 | Apply the new text and offsets. The characterId is unchanged. Examples: "God" becomes "god"/"gods", "Discretion" becomes "Prudence", "Diomede" becomes "Diomedes", "her whom he sought" becomes "the woman he had come for", and "Gorginian"/"Gorgonian" become "Gorgias"/"Gorgon" |
| Unresolved | 0 | None. v1's one case (6.4 "Love") was resolved when Jowett's capital was restored. The lowercased "love" in 3.0 is mapped as a text change with the same character, like "God" to "god" |

**Method.** A mention is mapped exactly when its characters lie in an unchanged span of a character-level diff. Explicitly listed wording changes are located by a context pattern. The remaining mentions (moved names) were matched to the same name in the new text and checked by hand, in context. `method` records which rule placed each one.

**Proposed new mentions: 35.** The card lists every personal name, so a name this pass adds for clarity needs a mention. Most are speaker tags or names that replace a pronoun:

- 1.14 "Aristodemus"; 1.15 "Socrates"; 1.17 "Agathon"; 1.19 "Agamemnon", "Menelaus"; 1.26 "Aristodemus", "Socrates" ×2; 1.28 "Aristodemus"; 1.32 "Aristodemus"; 1.47 "Phaedrus"; 2.7 "Patroclus" ×2, "Achilles"; 3.1 "Love"; 3.10 "Aristophanes"; 4.9 "Eryximachus"; 5.2 "Apollo"; 5.15 "Socrates"; 6.3 "Love"; 6.11 "Socrates" ×2; 7.0 "Love"; 7.30 "Socrates"; 7.45 "Socrates", "Agathon"; 7.48 "Aphrodite", "Love"; 8.0 "Aristophanes"; 8.10 "Homer"; 8.23 "Marsyas"; 8.29 "Homer"; 8.33 "Homer"; 8.39 "Silenus"; 8.43 "Agathon".

Each proposal gives its characterId, exact offsets and text. None is ambiguous.

### 2.2 Anchors

- **308 anchor offsets** (firstMention, roleVisibleAt, snapshot availableAt, evidence throughOffset) sit in changed paragraphs. Each moves exactly with the mention it ends on; `anchorOffsetChanges` lists them all.
- **Unresolved anchors: 0.**
- **`paragraphHashes` and `sourceSha256`.** Every modern-en chapter changes. The complete replacement values are in `paragraphHashesAfter` and `sourceSha256After`, and the card's `verifyCharacters` check requires both.

### 2.3 Availability check of the completeness package's anchor proposals

**This supersedes `proposed.anchorChanges` and the Phoenix card in the completeness package.** The task rule is that restored early mentions may allow recognition, but later facts must not be moved earlier.

Each existing snapshot was checked against the point where the text makes its facts available. `anchorProposal` gives the exact points for both English editions.

| Character | Completeness proposal | Check | Decision |
|---|---|---|---|
| Apollodorus | Identity to 1.0 | "retelling … from Aristodemus's account": Aristodemus is named as the source only in 1.7 | **Split.** A recognition snapshot at 1.0 ("The narrator, stopped on his way into the city and asked to recount the speeches at Agathon's supper."), and the existing snapshot at his first mention after 1.7 (1.8) |
| Socrates | Identity to 1.0 | "Athenian philosopher attending Agathon's banquet": named at 1.0 among the speakers; the rest is ordinary identity | Accept |
| Alcibiades | Identity to 1.0 | "an admirer of Socrates, who joins the banquet": his late, drunken arrival and his feelings for Socrates come only in chapter 8 | **Split.** A recognition snapshot at 1.0 ("An Athenian statesman and commander, named at the start as one of those who spoke at Agathon's supper."), and the existing snapshot at his arrival (8.0). Conservative alternative: `roleVisibleAt` stays at 8.0 |
| Agathon | Identity to 1.0 | "tragic playwright … celebrate his victory": stated only in 1.5 | **Split.** A recognition snapshot at 1.0 (the host), and the existing snapshot at his 1.5 mention |
| Aristodemus | To 1.7 | Every fact is in 1.7 | Accept |
| Listener | To 1.8 | His request is at 1.0 and his label at 1.8 | Accept |
| Phoenix (new) | Identity at 1.0 | "heard about the banquet from Aristodemus": stated only in 1.7 | **Split.** A recognition snapshot at 1.0, and the identity snapshot at his 1.7 mention |
| Philip, Glaucon (questioner), Glaucon's informant (optional) | As proposed | Every fact available at the proposed point | Accept |

original-en is not changed by this pass. Its remap and new mentions stay as in the completeness package, with the anchor decisions above (the `original-en` points are in `anchorProposal`).

## 3. Narration and caches

**No audio is generated or authorized.** Grok streaming remains the supported provider.

- **Stale-cache list.** Grok chunks are content-addressed by the exact displayed text (plus provider, model, voice and settings), so every chunk built from changed text is stale. `impact/narration-stale-modern-en.tsv` lists every modern-en paragraph whose displayed text differs from what the live site serves:
  - the 163 changed paragraphs, with live and final coordinates and hashes;
  - the 9 restored opening paragraphs.

  Its `changed_since_completeness` column isolates the 163 paragraphs changed by this pass, for use if the completeness repair ships first.
- **Grok maps check the text already.** On main (`447a7a65`), `app/src/worker/routes/narration.ts` keys a paragraph's narration map by provider, book, edition, chapter, voice and paragraph index (`narrationMapKey`). It reuses the map only when the stored `textHash`, chunk count, voice and model match the current text (`mapEntryMatches`). A changed paragraph therefore reads as stale and is regenerated on demand, including at the regrouped chapter 7/8 coordinates. The list above is for verifying that, and for the caches keyed by coordinates or URL: legacy audio, seek maps and offline downloads.
- **Reusable.** The 54 unchanged modern-en paragraphs and all original-en paragraphs keep their cached chunks.
- **Seek maps.** Edition and sparse seek maps for **every modern-en chapter** must be invalidated or rebuilt, because every chapter has changed text. A chunk spanning a boundary with changed text is stale.
- **Retained Bella** (`bellaRetention.ts`) covers Symposium original-en only, so this pass does not affect it. The completeness package's Bella instructions for original-en chapters 1, 7 and 8 still apply.
- **Legacy R2 per-paragraph audio** for `symposium/modern-en`. The changed paragraphs are stale by text, in addition to the coordinate staleness the completeness package records. Keep the files for rollback and do not select them.
- If chapter titles are narrated, nothing changes: the titles are unchanged.

## 4. Other surfaces (checked, unaffected by this pass)

- **Threads** (`symposium-threads.json`) hold chapter-level summaries with no paragraph coordinates or quotations. No 7-word sequence of any changed paragraph's old text appears in them.
- **Onboarding** (`onboarding/symposium.json`). Its `openingText` quotes Jowett (original-en), not modern-en: every 7-word sequence it shares with a changed paragraph's old text (28, all from 5.0) is Jowett's own wording, and no other field shares any. The completeness package's optional correction still applies.
- **SEO.** `read/symposium/book.html` embeds original-en (Jowett). Chapter summaries come from `app/scripts/seo/symposium.cjs`. On main (`447a7a65`), none of the 14 files under `app/public/read/symposium/`, nor the SEO script, shares a 7-word sequence with the old modern-en wording of a changed paragraph, so no page needs regenerating for this pass. `bookMetaGenerated.ts` holds metadata only.
- **Danish** (`symposium-modern-da.json`). No Danish is written. The pairing requirement (`aligned: false`) comes from the combined structure; see `migration/MIGRATION.md`.
