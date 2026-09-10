# Character-content handoff to Claude Opus

Anders requested that Codex pause new book authoring and hand the remainder to Claude Opus. Codex has stopped. Existing validated packages may continue through the release owner. Do not duplicate another active author’s work.

## Checkpoint

- Worktree: `/Users/andershvelplund/.codex/worktrees/171d/Tinct`
- Branch: `codex/character-cards-pilot`
- Last content commit: `2cdd2388` (King Lear); queue checkpoint: `73448845`.
- 100 published books: **51 validated packages, 46 not started, War and Peace draft, Bible partial Baruch only, The Awakening prior source-reviewed pilot needing reminder shortening**.
- Full content suite: **362 passing tests**, 24.414 seconds at checkpoint.
- King Lear: 67 cards per English edition, all 26 scenes, both sources byte-match release checkout. Included in queue; not individually handed off before pause.
- Shrew `5478a791`, Much Ado `89ff4bad`, As You Like It `f5525c42` were handed off as a grouped batch through queue `d8942d19`.
- Validated is not integrated or live. Per-book status.json, library-inventory.json and RELEASE-QUEUE.md are the authoritative separate status records.

## Assignment

Finish recognition cards for every remaining published book across its entire available text and both actual English editions. Preserve minor and reference coverage. Do not stop at opening chapters, character lists, candidate worksheets, or plans. Review existing partials rather than overwrite them. No per-book approval is needed. Read AGENTS.md, books/AGENTS.md, docs/workflow-boundaries.md, books/characters/EDITORIAL-POLICY.md, README.md and ROLLOUT.md first.

Use ordinary identity from first encounter: names, occupations and non-concealed family relationships. Later cards should become short recognition reminders. Gate concealed identities, changed relationships/ranks and outcomes to the reviewed source paragraph. Empty subtitles avoid duplication. Show Central / Major / Supporting / Reference beside the review copy. Historical actors are not automatically Reference; actual participants versus cited figures determine the category. Do not infer plot-critical bindings from inherited Threads aliases.

## Workflow

Stay in books/ content lane. Do not change app runtime, register assets, repair source editions or deploy concurrently with the release owner. Preserve unrelated changes in the main checkout, which is dirty. Do not run paid generation APIs, Anthropic API generation, or generate-editions.cjs; manually author prose in the agent conversation/files. A switch to an Opus interactive agent is not authorization for a separate API batch generator.

1. Read both source files at `app/public/data/editions/{id}-{original-en,modern-en}.json`. Inventory every scene/chapter and named/reference/speaking role. Read contexts and first mentions. Investigate namesakes and implicit ordinary identities; use primary editorial sources if needed.
2. Use a completed package such as king-lear as a structural example. Author `{id}/author_content.py` and `editorial.json` with explicit prose, categories, aliases and paragraph-end snapshots. Create `build_{id_with_underscores}.py` with reviewed context rules.
3. Shared `build_reviewed.py` deterministically compiles both sources; `reviewed_aliases.py` supplies exact aliases. Read these before extending. Run author_content.py then builder. Do not change the shared compiler casually.
4. Review generated cards.md and source-review.md. Add focused tests for real ambiguity and gates, source fingerprints, exact spans and resolution.
5. Run `python3 books/characters/build_<id>.py --check` and `python3 -m unittest discover -s books/characters -p 'test_*.py'` from repository root. Content-only packages do not independently deploy.
6. Write README.md with boundaries, source defects, references and release checks; status.json with validated-package / awaiting-integration. Run `python3 books/characters/inventory.py`. Published inventory must follow BOOKS; use `python3 books/wip_inventory.py` for publication inventory.
7. Compare source bytes against `/Users/andershvelplund/Documents/Projects/Tinct-reader-title` before handing off. Commit package and generated inventory, then add the content commit to RELEASE-QUEUE.md in a separate queue commit.
8. Release owner requested grouped handoffs (about three packages), not a message per book. Return actual live evidence to per-book status only after production checks. Asset existence is not evidence of enablement.

## Compiler traps

- Source normalization: newlines become spaces and ASCII whitespace collapses. Positions use UTF-16, not Python code-point indices. Source hashes pin exact raw JSON bytes; paragraph hashes pin normalized text.
- First snapshot gates at the END of the first exact selected span. This is a recognition rule, not a claim every ordinary biographical fact already precedes that span.
- `snapshots: [{after: [chapterNumber, zeroBasedParagraph], body: ...}]` gates at paragraph END. Chapters are source reading-unit numbers, not necessarily printed chapter numbers.
- Names live in snapshots, not top-level compiled characters. Use lookup_reference.py to exercise resolve/reminder/gallery.
- Exact aliases are case-sensitive and use word boundaries; underscore-marked italic names and abbreviated play cues require explicit handling. Inspect originals and moderns separately.
- Longest span wins. Same-span competing character IDs assert. A label-only source match is not proof the person is in the scene. Distinguish quote speaker, addressee, assumed name and actual identity.
- Do not bind generic titles, locations, ships, songs or printed footers as named people. Do not invent identities from false allegations. Do not turn intended marriages into completed marriages.

## Partial ownership

- **War and Peace:** 45-entry recognition draft and chapter-one sample in war-and-peace/. Both texts have 365 units. Full source inventory, ambiguity review and compilation remain. Father/son Bezukhov and Bolkonski, Natasha/mother, the two Tikhons and Petya/Pierre need explicit scope.
- **Bible:** only Baruch son of Neriah is live. The shipping checkout’s `books/characters/bible/baruch.json` is authoritative; preserve it and coordinate with release owner before expansion. Do not replace it with this older checkout’s candidate data. Full Bible remains unreviewed.
- **The Awakening:** existing whole-book pilot is live, but remaining running reminders need shortening under approved policy. Preserve source gates and integration; do not rebuild from vague inherited descriptions.
- **Measure for Measure:** only preliminary source review was performed after King Lear. No author_content/editorial/builder files exist. Notes below preserve that work. Codex has not started another book or retained authorship.

## Measure for Measure preliminary review (not validated)

Both sources use 17 scene units. Original has underscore-marked abbreviated cues (`_Duke._`, `_Escal._`, `_Ang._`, `_Claud._`, `_Pom._`, `_Mrs Ov._`, `_Fri. T._`, `_Fri. P._`); modern expands to capitals. Must cover each cue without losing italic names. Original also retains embedded line numbers and textual ellipsis at 1:3; never silently strip them from offset input.

Ordinary core cast: Duke of Vienna, deputy Angelo, adviser Escalus, Claudio and sister Isabella (novice, not a vowed nun), Juliet/Julietta (Claudio’s contracted partner; formal wedding lacking), Lucio, Pompey Bum (Mistress Overdone’s tapster/bawd), Mistress Overdone, Elbow and wife, Froth, prison Provost, Francisca, Friars Thomas and Peter, Mariana and her late brother Frederick, Abhorson, Barnardine, boy singer, Varrius, servants/messenger/justice and the two Gentlemen.

Coordinate clues from actual originals, zero-based paragraphs:
- 2:21 Madam Mitigation = Mistress Overdone; 2:61 Thomas tapster addresses Pompey, not Friar Thomas. Review independently before binding.
- 3:7 Duke proposes friar disguise. Friar Lodowick is explicitly named at 17:42; do not name disguise prematurely. Readers know the Duke before the public reveal 17:128.
- 4:18–20 Juliet is Isabella’s schoolfriend called cousin, not necessarily a blood relative. 4:32 Mother = convent superior.
- 5:21 Elbow’s wife implicit; 5:35 Mistress Elbow pregnant; 5:45 Froth’s dead father; 5:70 Justice/Iniquity allusions; 5:71 Hannibal insult; 5:93 Bum surname; 5:94 Pompey the Great is the bawd’s nickname, not automatically a separate Roman participant.
- 9:65 poor wronged lady = Mariana, 9:67 Mariana/Frederick introduced, 9:69 prior betrothal to Angelo. 9:77 Saint Luke’s is a place.
- 10:15 Caesar and Pygmalion allusions; 10:27 Bridget; 10:34 Emperor of Russia (unnamed) versus Rome place; 10:73 Mistress Kate Keepdown, her/Lucio’s child and Philip/Jacob feast allusion. Keep child distinct.
- 12:4 Pompey accepts executioner assistant role. 12:29 typo Clandio = Claudio; 12:64 Angclo = Angelo. 12:77 unnamed professed saint must not be arbitrarily identified.
- 13:1 prison customer inventory: Rash, Caper, Three-pile (creditor mercer), Dizy, Deep-vow, Copper-spur, Starve-lackey, Drop-heir, Pudding (victim), Forthlight, Shooty, Half-can, Pots (victim). Retain each; inspect modern spelling.
- 13:33 Ragozine deceased pirate, head substitution; do not say Claudio is dead because characters are told so.
- 15:2 Flavius, Valentius, Rowland and Crassus are the Duke’s local contacts, not assumed classical namesakes.
- 17:137 marriage ordered; 17:144 return and 17:145 new-married man explicitly confirm Angelo/Mariana marriage. 17:147 threatened widowhood is not an accomplished outcome.
- 17:169 Claudio muffled remains Claudio; 17:173 unveiling. 17:172 Barnardine pardon; 17:174 Claudio pardon. 17:178–180 Lucio ordered to marry child’s mother, not completed wedding. Duke proposes to Isabella 17:174/184; her acceptance is not supplied. Claudio/Juliet instructed to regularize union at end, not falsely marked already married.

These are preliminary clues, not a finished review or copy approval.

## Release ownership and known holds

Codex release task **Move coding to Codex**, ID `01a07ff0-a87f-7031-8b2f-d050d06d52bd`, owns integration, gates, deployment and production evidence in Tinct-reader-title, branch `codex/character-release-batch-20260910`. Main project checkout must not be reset/stashed/cleaned. Existing integration may continue while Opus authors remaining books.

Read every package README, especially Tempest wrong Ariel-song speakers (held); Romeo/Juliet doubled watch cue; Merchant Salerio/Salarino cue mismatch; Social Contract truncated note openings; Prince inherited Joanna/Clement/Colleoni errors; Shrew absent Induction; As You Like It missing opening scene, combined units, wrong titles and publishing footers. Coverage is all *available* text, not a claim missing scenes are complete. Source repairs invalidate hashes and require restored-text review and rebuilt sidecars. Gilgamesh/Beowulf and other translation quirks are likewise documented in their READMEs.

## Remaining IDs

not-started (46):

`odyssey`, `ulysses`, `pride-and-prejudice`, `crime-and-punishment`, `the-republic`, `meditations`, `divine-comedy`, `jane-eyre`, `the-aeneid`, `paradise-lost`, `frankenstein`, `moby-dick`, `great-expectations`, `the-histories`, `niels-lyhne`, `imitation-of-christ`, `jerusalem`, `brothers-karamazov`, `iliad`, `nicomachean-ethics`, `beyond-good-and-evil`, `democracy-in-america`, `genealogy-of-morals`, `peloponnesian-war`, `aristotle-politics`, `leviathan`, `fear-and-trembling`, `second-treatise`, `wealth-of-nations`, `faust-part-1`, `confessions`, `federalist-papers`, `walden`, `vindication-rights-of-woman`, `henry-v`, `winters-tale`, `measure-for-measure`, `henry-iv-part-2`, `merry-wives-of-windsor`, `antony-and-cleopatra`, `richard-iii`, `coriolanus`, `cymbeline`, `anna-karenina`, `don-quixote`, `essays-montaigne`

recognition-draft (1):

`war-and-peace`

partial-baruch-only (1):

`bible`

source-reviewed-pilot (1):

`the-awakening`
