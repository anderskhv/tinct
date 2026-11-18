# Current release handoff

Use [CLAUDE-RELEASE-MASTER.md](CLAUDE-RELEASE-MASTER.md) and [MASTER-RELEASE-INDEX.json](MASTER-RELEASE-INDEX.json) for the current per-book recovery and release status. Earlier missing-file assessments below are historical and superseded. No books have been published by this recovery session.

> **Recovery update, 18 November:** The missing temporary folder is no longer a blanket blocker. The preparation branch (229 files, 45 Danish editions) and multiple later drafts have been recovered into this durable handoff directory. Start with `claude-release-batch-01/README.md` and its manifests/tests: ten books pass the current English content gate; Social Contract and The Awakening need English remediation. The old status below is historical triage, not the current release checklist. Further recovered packets and exact historical hash evidence are under the `recovery-*` directories. Nothing has been published by this recovery task.

# Claude handoff — modern Danish status and release triage

Prepared 18 November 2026 from the live public catalogue and this chat's preparation records. This is a release-triage brief, not a blanket quality certificate. Claude owns uploads, merges and publication. No release action was performed by this handoff.

## First: recover the latest candidate files

The previous preparation directory `/tmp/tinct-da-prep-20261104/` is absent on this machine today. Its completed candidate JSONs, manifests, source witnesses, exact repair ledgers and handoffs were verified when produced, but are NOT currently reverified or available at those links. Do not use old retained Danish files as substitutes merely because they have the same book ID. Locate any copied archive, another machine's preparation folder or recoverable task artifacts first; compare with the recorded manifests. Save recovered material somewhere durable outside `/tmp`.

The local checkout `/Users/andershvelplund/Developer/Tinct` exists but its HEAD inspected today is `cef51f690`, dated 2026-10-30. Its older `books/wip/` packages and `modern-da-quality-20261102/` material are useful recovery leads, not proof of containing November's finished work. No repository file was edited for this brief.

If recovery is impossible, report the affected candidates as unavailable. Chat completion records cannot replace full translation files. Codex's local task records may contain recoverable content/tool writes, but no complete reconstruction has been established.

## What is live now

Source fetched: https://tinct.app/lab/catalogue.json on 2026-11-18. Snapshot saved beside this brief as `live-catalogue-2026-11-18.json`.

The catalogue contains 114 books, 107 with a modern-da entry, of which **37 have discoveryAvailable=true**. The other 70 entries are not discoverable. Asset existence, catalogue visibility, reader operation, audio currency and editorial approval are separate facts. This was a catalogue inspection, not a 37-book UI/quality audit. Current corpus size differs from the earlier 112-book work plan.

Discoverable modern-da IDs:

`to-the-lighthouse`, `the-art-of-war`, `crime-and-punishment`, `meditations`, `the-manual`, `apology`, `phaedo`, `crito`, `phaedrus`, `poetics`, `moby-dick`, `the-prince`, `kant-groundwork`, `descartes-meditations`, `on-liberty`, `utilitarianism`, `aristotle-politics`, `communist-manifesto`, `hume-enquiry`, `werther`, `bacchae`, `medea`, `confessions`, `magna-carta`, `us-founding-documents`, `a-little-princess`, `jungle-book`, `around-the-world-80-days`, `jekyll-and-hyde`, `ivan-ilyich`, `alice-in-wonderland`, `wuthering-heights`, `middlemarch`, `grimms-fairy-tales`, `arabian-nights`, `master-and-margarita`, `pinocchio`.

Do not infer that the deployed versions are the recently prepared candidates. For already visible titles, compare deployed text hashes/versions before deciding whether a correction release is needed.

## Latest completed local packages — recover, review known issues, then assess release

No title below has recorded native-Danish final approval. The user arranged that reviewer and previously accepted launching without exhaustive personal testing; this does not resolve known meaning/coverage defects. Do not invent a new requirement for the user to test every page. Use the specific outstanding issues to decide what can ship.

### Don Quixote (`don-quixote`) — currently hidden

- Complete sequential first editorial pass: both parts, 126 chapters, 3,939 positions; 359,235 Danish words; 3,905 Danish positions changed.
- 104 English correction operations across 103 distinct positions.
- Both reading guides revised; paired Part I dedication, 18-paragraph author preface, and 11 preliminary poems/202 lines prepared. Restored 14 omitted Urganda lines.
- Spanish checks restored entire missing actions/passages, full poems shortened in English, quantities and names. Examples: full Merlin speech, Altisidora songs, dispatch of the page to Teresa, dressing-agent reversal, wool-tax collector, Dulcinea's age and missing tribute.
- Exact structural checks and English repair replay passed. Parent verified all 21 manifest-listed hashes.
- Original handoff: `don-quixote/HANDOFF.txt`; manifest: `MANIFEST.json`; review limits: `REVIEW-STATUS.json`.
- Remaining: native fluency and independent literary/allusion/nautical checks. Review the specific queued items before calling it final quality.

### Anna Karenina (`anna-karenina`) — currently hidden

- All 239 chapters / 7,442 positions reviewed against Russian sources; both guides rewritten.
- 7,192 Danish repair operations across 3,706 positions; 3,370 English operations across 2,199 positions. Operations are not unique passages.
- Full body/guide repair replay and structural checks passed; parent verified 19 manifest files.
- Fixed omitted clauses/sentences, reversed negations, wrong agents/genders, chronology, names, Orthodox ritual, estate/agricultural vocabulary and guide inaccuracies. Examples include long hesitation before proposal reversed to short, railway name rendered as a lower road, father/uncle glances reversed, twelve minutes rendered as twenty.
- **Known source-policy gate:** chapter 232 uses historically documented early/later edition variants and differently ordered philosophical paragraphs. These are NOT invented Garnett passages. Candidate follows selected later Russian wording while keeping corpus positions; decide a coherent edition/order and bookmark treatment.
- Other flagged checks include 220.22 awkward impact wording, 179.36 architecture, 234.5 harness terminology and botanical/historical terms in `REVIEW-REMAINING.json`.
- Original handoff: `anna-karenina/HANDOFF.txt`, `MANIFEST.json`.

### Hamlet (`hamlet`) — currently hidden

- Full first pass: 20 scenes / 1,391 positions; both guides and cast supplement.
- 1,183 Danish operations across 1,172 positions; 382 English operations across 258 positions.
- Four original-corpus attribution/stage-direction errors repaired in candidates: 9.23–24, 10.16, 19.97–98, 20.150.
- Full body/guide replay, structural/nonempty/bracket checks passed; parent verified 28 manifest files.
- **Known quality work remains:** rhyme joke 9.108, arms pun 19.14–16, botanical names 18.43, legal language 19.45, fencing 20.59/97/102, song performability and textual cruxes. Do not label these solved.
- Original handoff: `hamlet/HANDOFF.txt`, `MANIFEST.json`.

## Earlier completed packages in this chat

These are recorded preparation completions, not fresh file-level verification today:

- **Crime and Punishment**: 41 chapters / 3,904 positions, 1,012 Danish changed positions and 304 English; both guides; separate optional 11-block Garnett preface. Source questions were documented/closed to the stated limits. Already discoverable: check which revision is deployed.
- **Brothers Karamazov**: 96 chapters / 5,836 positions, both guides, nine note references and separate nine-position front matter. 7,048 Danish / 798 English operations. Independent root review was targeted, not full; two wording proposals were not integrated. Currently hidden.
- **Confessions**: 13 books / 462 positions, fresh Danish rewrite (~108,880 words), both guides; whole Pusey coverage checked, targeted Latin checks. English cakes→porridge correction. Already discoverable: compare deployed revision.
- **Ulysses**: 18 episodes / 7,148 positions; 3,195 Danish and 183 English changed positions; both guides. Five historical readings unresolved and three score images need integration. Currently hidden; literary/specialist review still material.
- Additional recorded completion entries included **Beyond Good and Evil**, **Fear and Trembling**, **To the Lighthouse**, **As You Like It**. The full additional ledger is missing with the preparation folder; do not infer the rest of its title list. As You Like It specifically carried a retained-source World Library rights-notice question.

The last reconstructed ledger total was 76 non-Bible works with recorded editorial preparation, leaving 35 of the original 111 non-Bible works. This includes earlier/provisional statuses and is NOT a count of current verified release-ready packages. Do not equate 76 with high-quality approved or available files.

## Parallel-chat completions supplied by the user

Reported as completed packages, not independently re-audited in this chat:

- Romeo and Juliet, The Tempest, The Comedy of Errors, Twelfth Night: full plays checked including songs/wordplay/cues/directions, 166 English passages changed across four plays. All currently hidden.
- Moby-Dick: 135 chapters plus epilogue, dedication, etymology and 80 extracts. Restored three sections before chapter1; bookmark map needed. Currently discoverable.
- Middlemarch: dedication, Prelude, 86 chapters, Finale; 4,674 positions. Currently discoverable.
- Great Expectations: 59 chapters, 3,835 positions, 1867 text. Currently hidden.
- War and Peace: 365 chapters, 15 books and both epilogues, 11,340 positions, Maude base; repaired passages shifted into neighbouring paragraphs, bookmark map needed. Currently hidden.

Original package subfolders under missing `/tmp/tinct-da-prep-20261104/` use their book IDs. Related Codex chats: “Prepare four Danish classics” and “Prepare four Danish Shakespeare drafts”. Their own reports/source notes must be checked before release.

## Explicitly unfinished / hold

- **Montaigne:** last saved report 4,154/4,897 positions, through chapter103/122; next103/123. Remaining main text, guides and source apparatus outstanding. Includes a displaced epigram-gloss repair at69/120 and128 and a retained edition that omits La Boétie's29sonnets; no claim those poems were translated.
- **Peloponnesian War:** BookI and chapter6 complete,180/998positions;818 unread. 672DA operations/173positions,74EN/62positions. Targeted Greek checks, no exhaustive Greek collation; funeral speech clause2.42 flagged. Guides pending.
- **Democracy in America:** source baseline audited,96units/2258positions,bothvolumes; no full editorial rewrite reported. Appendices/Constitution and edition-specific introductory material need explicit handling; global9 section boundary issue noted.
- **Divine Comedy:**259/4812positions;InfernoI–V and VI1–20 first-pass reviewed; nextVI21. Free verse with tercet structure, not rhyme/metre equivalence. Remaining text unreviewed.
- **Bible/Romans:** no Bible publication. Romans16chapter433verse pilot exists only as an unapproved experiment; user comparison exposed awkwardness and source-policy issues. Only chapter1 got a separate second draft. Do not publish or expand other Bible books. Doxology14→16 relocation and WEB/Greek differences require specialist decisions.

## Integration work for Claude

1. Recover and identify exact latest candidates. If unavailable, state that before promising release.
2. Reconcile current main, existing PRs/releases and live catalogue. This brief did not inspect your current release queue.
3. Triage known content issues above; distinguish native polish from material meaning/completeness/source-policy blockers. Do not enable all retained modern-da assets wholesale.
4. Integrate agreed Danish bodies, associated English fixes, both guides, supplements and source records together. Preserve old bookmarks or provide explicit mapping for changes in structure.
5. Rebuild relevant edition/shard/catalogue outputs using the repository's current process; check discovery availability, reader selection, comparison alignment and first/last chapter coverage. Avoid serving old audio against revised text.
6. Keep one release owner and batch changes to avoid the release races that previously delayed issue710. Claude remains that owner.
7. Report a concrete per-title result: exact deployed version, newly enabled versus corrected-in-place, and any remaining hold. No blanket claim that all translated files are approved.
