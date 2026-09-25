# Release packet: Symposium modern-en accessibility successor

For the coding owner (integration, migration and publication) and for Anders's decisions. **Content only; nothing here is published.**

## 1. What this is

This is a **text-only successor** to the accepted completeness repair. It makes modern-en understandable to a first-time reader or listener, while keeping every argument, example, qualification and image in Jowett's translation. It also keeps the characters' distinct positions and the historically specific content.

| | Completeness repair (predecessor) | This package (successor) |
|---|---|---|
| Package | `books/wip/symposium-completeness-repair/` | `books/wip/symposium-accessibility/` |
| Accepted commit | `bebe95b42aa2ecaf77c7625602712e3a91ad376b` | Given in the handoff message |
| original-en | `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6` (restored opening, chapter 7/8 regroup) | **Unchanged**: use the completeness file |
| modern-en | `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f` | **`a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d`**: supersedes the completeness modern-en |
| Structure | 217 → 226 paragraphs; chapter 7/8 regroup | Unchanged (226; same coordinates, chapters and titles) |

The successor is built directly on the completeness candidate:

- the restored opening 1.0–1.8 is byte-identical;
- the three C-06 corrections are kept;
- the chapter boundaries are unchanged.

**Do not integrate the completeness modern-en on its own if this package is accepted.**

## 2. What to integrate

1. **Editions.**
   - `app/public/data/editions/symposium-original-en.json` ← `books/wip/symposium-completeness-repair/candidate/symposium-original-en.json` (`3521a12d…95a6`). Apply the completeness package's decision on the C-04 chapter-5 title variant.
   - `app/public/data/editions/symposium-modern-en.json` ← `books/wip/symposium-accessibility/candidate/symposium-modern-en.json` (`a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d`).
2. **One content release, not two** (§3).
3. **Character card.** Apply `impact/character-card-impact.json`:
   - for original-en, the completeness package's remap and new mentions;
   - for modern-en, the remap, then `mentionChanges`, `proposedNewMentions`, `proposedMentionDeletions` (if any), `anchorOffsetChanges`, `paragraphHashesAfter` and `sourceSha256After`;
   - for both editions, the availability-checked `anchorProposal`, which supersedes the completeness package's `anchorChanges` and Phoenix snapshot.

   Bump `contentVersion` and `characterReleases.symposium.revision`. Verify with `verifyCharacters`.
4. **Danish:** set `modern-da` to `aligned: false` in the same release. #193's `alignedEditions.test.ts` requires equal per-chapter splits (Danish 217 against English 226). No Danish text is written.
5. **Caches.** Exclude stale narration and seek maps (§5).
6. **SEO.** Regenerate `read/symposium/book.html` as the completeness package describes. That is for original-en; this pass changes no SEO input.

## 3. Release shape and reader-data migration (hard dependency)

- **Main does not yet carry the completeness repair.** `origin/main` `447a7a65` still serves modern-en `7816d1eb…fcce8` and original-en `e2943777…97c0`, and `CONTENT_RELEASES` has no `symposium` entry.
- **`CONTENT_RELEASES` supports one `before → after` hop per book.** Ship one release, from the live editions straight to the final editions, with the composed data in `migration/`:
  - `paragraph-map-live-to-final.tsv` (both editions);
  - `changed-paragraph-ops-live-to-final.json` (modern-en).
- **If the completeness repair is released first anyway,** this package becomes a separate text-only release. Use `migration/changed-paragraph-ops-completeness-to-final.json`, but only after the app supports chained, revision-keyed migrations. Otherwise records would be migrated twice or not at all.
- **Keep every unresolved highlight and note** with its quote and coordinates. **Never discard one or snap it to a paragraph start.** Run the remap before Invariant-6 bounds validation (`migration/MIGRATION.md`).

## 4. Checks run (unchanged repository tools, run read-only)

| Check | Result |
|---|---|
| `books/classify-modern-en.py symposium --gate`, completeness modern-en (before) | **FAIL**: weighted 0.866; 6/8 chapters LIGHT |
| Same, this candidate | **PASS**: weighted 0.523; LIGHT+MECHANICAL 0/8; identical long paragraphs 2/170 |
| `books/audit-truncation.py symposium en` | 0 flags |
| Package verifier (structure, protected text, house style) | 35 checks passed; 0 hard failures (soft findings reviewed by hand) |
| Quotation continuity (STYLE §3.4) | PASS: 28 open-ended paragraphs, each continued; double quotes balance |
| Non-regression (accepted fixes and every adopted review edit) | PASS: 245 adopted edits present or replaced by a later recorded edit; 0 failures |

The gate was run with `EDITIONS_DIR` pointed at a scratch copy; the scripts were not changed. The completeness package's gate decision (criterion 13) is resolved by this candidate: no waiver is needed.

## 5. Narration and caches

**No audio is generated.** Grok streaming remains supported.

- `impact/narration-stale-modern-en.tsv` lists every modern-en paragraph whose text differs from the live site. That is 163 changed paragraphs plus the 9 restored ones. Cached chunks built from the old text must not be used for the new text.
- Rebuild the seek maps for all modern-en chapters.
- original-en text is unchanged by this pass. The completeness package's Bella and legacy-audio instructions (chapters 1, 7 and 8) still apply.

## 6. Decisions and notes for Anders

None of these blocks integration. Each is recorded so it can be revisited.

1. **Source policy: Jowett is the text.** Wordings that v1 had taken from Plato's Greek were reverted to Jowett's after the reviews and rechecks (`SOURCE-NOTES.md` §3 lists them with the Greek readings the reviewers reported). Two v1 choices are kept on purpose, neither changing an argument: "what loves" for Jowett's "the principle of love" (7.49), and the image of giving birth in 7.54 where Jowett's inner phrases say "conception" (his own frame is childbirth: "goddess of parturition", "travail"). Three documented exceptions clarify genuinely opaque or ambiguous places:
   - 4.1: "the rule of love";
   - 7.0: "that is, whose child Love is";
   - 3.8: a gloss after the accepted 'uses base'.

   These are listed in `STYLE.md` §1a.
2. **Jowett's softenings are kept in his words, not corrected from the Greek.** Examples: "under the influence of true love" (7.64), "hear him tell what he knew" (8.26), and "servants"/"attendants" for slaves.
3. **Two modernizations of Jowett's words** (STYLE §4): "lord and minister" becomes "lord and provider" (5.6), because "minister" now suggests an official or a clergyman; Jowett's "fair" becomes "beautiful", or "noble" in its moral sense.
4. **Kept name forms:** Otys, Athene, Kronos, Mantineia, "the God of War". Heraclitus and Diomedes take their standard forms.
5. **Declined review findings** are each reasoned in `reviews/RESOLUTION.md`. The only blocking or should-fix item not adopted is Review 2 #1, a speaker label at 1.0: Jowett has none, and the restored opening stays byte-identical.
6. **Retained wording recorded, not changed:** the closing paragraph 8.46 has one Greek-derived detail, "from left to right" (`SOURCE-NOTES.md` §3).
7. **Danish** needs `aligned: false` (§2.4).

## 7. Status

| Stream | Status |
|---|---|
| Content (this package) | **Accepted and handed off.** Branch `claude/kind-fermi-a2b3g0`; the commit is given in the handoff message |
| Integration, migration, card, caches | Not started (coding owner) |
| Publication | Not published |
