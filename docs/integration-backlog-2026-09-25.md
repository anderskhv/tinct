# Integration backlog — 2026-09-25

Owner: Claude (explicit coding/integration assignment from Anders, 2026-09-25).
Branch: `claude/upbeat-johnson-o0kw06`. This is the single integration and
deployment owner. Releases are serialized through `main`, and the `deploy`
workflow must succeed before the next merge.

Status words have fixed meanings here:
- **staged**: an accepted package exists on a branch.
- **merged**: on `main`.
- **deployed**: the `deploy` workflow succeeded.
- **live-verified**: a post-deploy acceptance or a manual production check passed.

Everything below was checked against GitHub on 2026-09-25 against main `735701c7`.

## Ownership state at takeover

| Item | Evidence | State |
|---|---|---|
| PR #165 Crime | merged `39457473` | deployed. Post-deploy acceptance was intermittently red; see R0. |
| PR #166 WEB Revelation cleanup | merged `5dbf20cd`; `bible-web-en.json` = `b0f49165…` ends at "Amen." | live-verified (post-deploy run 36041334568 success) |
| PR #167 chat evidence | merged `e68232de` | deployed |
| PR #168 chapter Preview | merged `8f69bbb0` | live-verified (post-deploy run 36041334522 success) |
| library_2 PRs #169–#181 | merged. The last deploy, run 36038584578, succeeded on `735701c7`. | deployed |
| Active release | none. No queued or in-progress deploy runs. | — |

Previous Codex coding agent: finished #166 and #168, then stopped. No open Codex release PR is mid-flight.

## R0 — PR #182: user-reported regressions plus acceptance stability (in release)

- Bible pagination regression from #168 `fitChapterEnd`. The leaf before the chapter actions kept only its first words. Bisected: `5dbf20cd` good, `8f69bbb0` bad. Fixed.
- Bible audio resumed the wrong chapter's place after browsing chapters. The pause wrote the audio chapter's follow place under the visible chapter. Fixed; reproduced with a mocked narration Worker.
- Lock screen now shows the chapter as the title line, the book as the artist line, and the cover as artwork. The chapter clock is republished from native media events. Needs a real-iPhone check.
- Post-deploy Crime acceptance was flaky: card verification raced the gesture. Fixed with `data-characters-ready`.
- Verify workflows now fetch full history.
- Done when: merged, `deploy` green, post-deploy acceptances green, production verified.

## R1 — Jane Eyre + Pride and Prejudice structural release

Accepted inputs, all hash-verified:

| Book / edition | Source | SHA-256 | Chapters/¶ |
|---|---|---|---|
| Jane modern-en | cleanup `7994156f` + clarity `88ebdd4c` (JE-TC-1, 34.139) | `0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6` (reproduced with `apply.py`; not committed anywhere as a file) | 38 / 4034 |
| Jane original-en | cleanup `7994156f` | `d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257` | 38 / 4034 |
| Pride modern-en | cleanup `7994156f` | `6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463` | 61 / 2053 |
| Pride original-en | cleanup `7994156f` | `6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c` | 61 / 2053 |

- Superseded holds:
  - PR #159 (Pride, `a771e426`) and PR #160 (Jane, `e0306303`) swap text only, keep paragraph counts, and conflict with main.
  - Their card re-anchoring logic is reusable.
- Existing code:
  - `codex/edition-structure-migration-20260924` `922679bb` (no PR) holds the coordinate projection core, lab place and highlight migration, and staged maps (Jane `fa1c1ef6…`, Pride `61c3bba9…`).
  - It is not wired into the running reader.
- Remaining work:
  1. Rebase the migration core onto main.
  2. Wire it into the lab reader's place, recent-chapter, reading-memory and highlight read paths. Stamp `contentRevision` on new writes so migrated data is never re-projected.
  3. Cover the legacy reader keys: `position:` (paragraph) and `highlights:`/`notes:` (character offsets, using the map's `chars` ops). Keep unresolved marks for recovery.
  4. Re-anchor the character cards through the map and bump the card revision.
  5. Regenerate the chapter shards: Jane original-en, plus any other sharded English edition.
  6. Danish (`modern-da`, not retired):
     - leave the text and user data untouched;
     - stop aligned Compare between the Danish edition and a restructured English edition (different paragraph counts);
     - do not apply English deletions to Danish. Jane da 34.114 is not a caption.
  7. Audio: the changed paragraphs invalidate prepared or cached narration keyed to the old text. Keep fresh Grok streaming. No batch regeneration.
  8. Close #159 and #160 as superseded by the release PR.

## R2 — Fear and Trembling

- Package: `claude/hopeful-tesla-7s5ziw` `f5aa101b`, `books/wip/fear-and-trembling-tinct-en/`.
- Candidates:
  - modern-en `c48a3252…11fb8`
  - original-da `290fec6a…8934`
  - 8 chapters and 184 ¶ each, [4,15,14,35,29,22,61,4]
- Sidecars: `footnotes.json` (18 notes, UTF-16 anchors), `structure.json` (11), `front-matter.json` (4), `STRUCTURE-MAP.json` (232 served slots: 132 identical, 82 joined, 9 split, 9 removed), and `character-card-impact.json` (10 mentions).
- Reviews: R1–R3 plus re-verification, ending "ready for handoff".
  - The 7.18 Danish *i* is conjectural. It is documented in `CHANGED-PARAGRAPHS.md:12` and `source/CORRECTIONS.md:69,222`. Keep that documentation.
- Remaining work:
  1. Paragraph-level migration from the 232 slots to 184 ¶ for positions.
     - The English wording is new, so word or character offsets cannot carry over exactly. Highlights and notes stay unresolved but recoverable. Do not use the packet's "move to paragraph start" rule as if it were precise.
  2. Label modern-en "Tinct Modern English — translated from Danish".
  3. Retire the AI `original-en` through an explicit preference and data migration.
  4. Keep `modern-da` and its data. Prevent incompatible alignment with the 184-¶ editions.
  5. Rendering: footnotes, structure markers and front matter.
  6. Re-anchor the 10 character mentions. Update the terminology in onboarding, threads and cards (Attunement, de silentio, Preliminary Expectoration, "greater than everyone").
  7. Turn off modern-en `hasAudio` until matching narration exists. Streaming only.

## R3 — Bible: BSB default and complete WEB Catholic

**R3a — BSB (next release, prepared on `a7a482a4`, local until R0 is live):**
- Accepted artifact bytes are published as `bible/bsb-en`, first in the registry and the lab default.
- Saved Bible places keep their edition.
- Compare works verse by verse on phones.
- Desktop paired rows are explicitly unavailable for BSB pairs, because paragraphing differs.
- Streamed narration covers it. It has no cards and no difficulty rating yet.
- Verified in the browser: fresh device opens BSB; saved KJV stays KJV; Psalm 23 renders as lines; phone Compare anchors by verse.

**R3b — verse-paired desktop Compare:** rows that span several paragraphs on one side. Needed before desktop BSB↔KJV/WEB.

**R3c — WEB Catholic:** `claude/magical-wozniak-dim3fg` `30e7f823`.
- Candidate `ecaee43e…5bfb`: 73 books, 1,328 chapters, 35,379 verses.
- Passage map `8d55819e…2c28`, with native ESG/DAG and the reviewed Esther/Daniel mapping. It pins pre-cleanup WEB `46d20663`, so it needs a refresh.
- Uses a different chapter numbering, so it needs the crosswalk (`codex/bible-reference-integration-20260924` `8c2d01ef`) for edition switching, positions, Compare and retrieval, plus an explicit "not in this edition" state. No silent substitution.

**BSB staging follow-ups:**
- Rebuild the PR #131 WEB crosswalk against post-#166 WEB `b0f49165`.
- `verify_artifact.py` asserts `legacyUnsafeChapters`; update that assertion.
- The artifact expires 2026-12-20; archive it before then.

## Findings logged, not yet scheduled

- **Phone Compare anchoring (pre-existing):** after keyboard or swipe page turns, the swap anchors on the last *noted* place, not the visible page. Reproduced on main with KJV→WEB (verse 11 opens WEB at 7–8).
- **Aligned editions with different paragraph counts:** these are already paired by index on desktop Compare. faust-part-1, ivan-ilyich and the-prince/werther against their foreign-language originals, and niels-lyhne (all four editions). Candidate for the same "unavailable" gate.
- **Narration failure evidence:** "Audio couldn't start" is generic, and Worker logs are not reachable from the cloud session. Consider recording the failure reason in the error UI or telemetry.

## Holds (content; do not integrate)

| Item | Pinned evidence | Blocking evidence still missing |
|---|---|---|
| Odyssey (PR #163) | candidate `bd05c7f4…c9c` (content branch `0a76d6ce`) | The `classify-modern-en.py --gate` blocking gate fails: 0.784 > 0.75, 10/24 LIGHT. There is no disposition record and no A-vs-B+ decision for the Book 3/4 join. |
| Moby-Dick | body `1a3f31bb…d52c` (`claude/charming-shannon-mojaef` `52c72004`) | Identity rulings for 23 dropped or changed character spans (see the list in PR notes). The structural package (ch 56/57/73 and front matter) follows the body. |
| To the Lighthouse | `175a90f0` (modern-en `17c56b3d`) | A reviewed follow-up for 26.1 ("then"), 25.3 ("some"), the Prue card (same summer as her wedding), 40.10 (cosmogony) and 27.0 (dialect). |
| Bible cards | `bible.v1.json` | Identity rulings for Mary 975.3/983.7, James 1019.2/1039.3 and Herod 931.0. The resolver shows no card for these, and that is preserved. Further suspect bindings were found: Acts 1:13 "James" → james-the-just; "Judas the son of James" → iscariot; 1016.4 and 1017.3 Marys → mother of Jesus. They need the same independent review. |

## Standing constraints

- Grok streaming only. No Kokoro, no GPU, no batch audio.
- No new Danish translations.
- Accepted text is byte-exact.
- Unresolved annotations are retained.

## Queued by Anders (2026-09-25): make the book text discoverable in search

Not started. Anders asked to be reminded. His brief, kept as given:

> Make Tinct’s actual book text discoverable through search engines, with search visitors landing directly in the existing reader. The reader experience is stable. Preserve its appearance, pagination, controls, and reading-position behavior. My goal is for people to find books through searches such as “read Odyssey in modern English” or an exact quotation, then read the passage in context. Prioritize the books themselves; don’t generate additional SEO articles, summaries, or quote pages.
>
> A live-site spot check on September 25 found:
> - `/read/` has crawlable book links and `/sitemap.xml` exists.
> - `/read/odyssey` has metadata and an opening excerpt.
> - `/read/odyssey/chapter-9` and `/read/frankenstein/chapter-1` contain summaries rather than complete chapter text.
> - `/reader` sends `noindex, noarchive` in both HTML and response headers.
> - `/robots.txt` blocks `/data/` and `/lab/`, which currently supply content and interface resources.
> - The chapter 9 “Read” link, `/read/odyssey?chapter=9&edition=modern-en`, redirects to `/lab/?book=odyssey&view=book-detail`, losing the chapter and edition.
>
> Verify these findings against the current code and deployment, then implement the missing foundations:
> 1. Fix direct reading links so book, edition, chapter, and any passage position survive navigation and redirects. Opening a link in a fresh session must reach the requested location without requiring sign-in.
> 2. Provide permanent, indexable URLs for complete chapters in each publicly available edition. Serve the chapter text in the initial HTML, using the same content source as the reader. These URLs should open the existing reading experience, with usable text remaining available before JavaScript loads.
> 3. Keep chapter and passage identities independent of screen pagination, font size, and window size. Reuse existing stable identifiers where possible and support links to specific passages.
> 4. Add accurate edition-specific titles, descriptions, canonical URLs, and crawlable chapter navigation. Include the public reading URLs in the sitemap. Avoid indexing endless combinations of reader settings.
> 5. Adjust indexing directives and crawler access narrowly for public reading pages and resources they require. Don’t simply remove every restriction or expose private/account/API routes.
> 6. Preserve existing public URLs where practical. Don’t delete existing summary/theme/character pages as part of this work; keep the implementation focused on making the actual books discoverable.
>
> Use the smallest maintainable approach consistent with the current architecture. Don’t build a separate reading product or duplicate the book content into a second editorial source.
>
> Validate with the Odyssey and Frankenstein, covering original and modern English editions and a chapter beyond the opening:
> - The initial HTML contains the complete intended chapter and correct edition.
> - Public reading pages are indexable and have correct canonical URLs.
> - Direct chapter and passage links work in a fresh session and after refresh.
> - Pagination and font changes preserve the intended passage.
> - Existing reading progress and mobile/desktop behavior still work.
> - Internal links, sitemap entries, and crawler rules agree.
>
> Implement and run the appropriate checks. Report what changed, what was verified, and anything still needed before deployment. Distinguish technical readiness for indexing from actual Google indexing or ranking, which these checks cannot prove.
