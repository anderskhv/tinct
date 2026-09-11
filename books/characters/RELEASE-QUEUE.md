# Character-card release queue

Updated September 10, 2026. This is a content-lane handoff to the existing release owner, not a separate deployment. Read each package README and validation report before integration. Sources were byte-compared with Tinct-reader-stabilization at authoring; recheck before enabling.

## September 11 reference release — current queue

US Founding Documents, Kant Groundwork and Descartes Meditations are now
production-verified in both English editions. Content95bdc8792; app1341dede0;
deployb7abab07a; workflow34580387836 passed. All60live browser checks and15smoke
checks passed. [Evidence](../../docs/character-reference-release-2026-09-11.md).

Current inventory:60validated =18live +41awaiting integration +1Tempest source hold.
37not-started and3partial/pilot statuses remain. Whole-book Awakening pilot and
partial Bible are separate from the18validated-live count. Do not re-integrate
these three or the already released nine-play batch from older sections below.
Next: independent review of remaining41, beginning with the queued literary batch
(Jekyll and Hyde, Oedipus Rex, Antigone); preserve the Tempest source-review hold.

## September 11 reconciliation

Authoring branch aec6edff contained 60 validated packages, 37 not-started books
and three partial/pilot scopes. Nine of its awaiting-integration statuses were
stale: the nine-play release was production verified September 10. Before the reference release, fixing
those statuses left **45 unreleased validated packages: 44 awaiting independent
release review/integration and The Tempest held for source review**. Six earlier
validated packages were already marked live; The Awakening pilot and partial Bible
are tracked separately. Thus 16 whole-book scopes plus partial Bible were previously
production verified, not zero. This is not 100-book coverage.

A September 11 main deployment from stale 93f7b9d9 temporarily regressed newer app
registration. Recovery 95029ffe2 merges the verified 68e7d1d0 release with current
main tooling/CI. Never derive runtime coverage from asset presence or stale status
alone. Release reports and current served registration are required.

Measure for Measure, Henry V, Winter’s Tale, Cymbeline, Coriolanus, Antony and
Cleopatra, Richard III, Henry IV Part 2 and Merry Wives are the nine released books.
Their content revision is 2026-09-10.1; details in
[the release record](../../docs/character-cards-nine-2026-09-10.md).
Cymbeline13:8 Caesar and RichardIII19:10/11 Plantagenet/Edward ambiguous pairs remain
unbound; these release corrections supersede tentative author assignments below.
Do not redeploy those books just because an older section calls them queued.

The reference batch named here was subsequently released; see the current queue above.
Lane A/B authorship remains with the external owners; no book is claimed here.

## Verified live

Reconciled against production on 2026-09-11 with `python3 books/characters/serving_check.py`. tinct.app serves exactly four sidecars; see `INTEGRATION-STATUS.md` for the full finding.

- Awakening: served. Earlier source-reviewed pilot; recognition-shortening follow-up remains.
- Bible: served. Baruch only. Preserve all three enabled English variants.
- Hamlet: served. Release-owner verified, index-CfVbJ712.js. Evidence docs/character-cards-hamlet-2026-09-10.md, on origin/main.
- Macbeth: served. Release-owner verified, index-BjPCOKB7.js. Evidence docs/character-cards-macbeth-2026-09-10.md, on origin/main.

### Verified but not being served

Crito, Apology, The Manual and The Art of War were production verified on 2026-09-10 (index-D_c4t1iT.js; Worker 07acbcbd-0c28-4cfc-b6e7-358ae2d3542b; evidence commit 10de86bb, docs/character-cards-four-2026-09-10.md). All four sidecars return 404 today, commit 10de86bb is not an object on this remote, its evidence doc is not on origin/main, and origin/main does not register the four ids in `supportedEditions`. The integration exists only in a local checkout and has been superseded by a later deploy. Their `appStatus` now reads `not-integrated` with the original verification preserved as `priorProductionVerification`; push the integration commit, redeploy, re-run the serving check, and restore `live`. The content is unchanged and needs no re-authoring.

These bundle names identify the verification releases, not necessarily the currently served bundle after later deployments. Integration status is asserted from the serving check, not from memory.

## First four: production verified September 10

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Crito | 79dbf5f5 | 9 / 9 | build_crito.py |
| Apology | fced22f0 | 57 / 51 | build_apology.py |
| The Manual | 39e3437a | 16 / 14 | build_manual.py |
| The Art of War | 39e3437a | 7 / 5 | build_art_of_war.py |

Shared dependencies: build_reviewed.py; Manual/Art of War additionally reviewed_aliases.py. All files are under books/characters. Full sidecars are at `<book-id>/characters.v1.json`.

## Following validated batch

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Dr. Jekyll and Mr. Hyde | 2b7403b9 | 27 / 27 | build_jekyll.py |
| Oedipus Rex | 798f09ba | 33 / 33 | build_oedipus_rex.py |
| Antigone | 2ae5c2ce | 40 / 40 | build_antigone.py |

All use build_reviewed.py. Validate the concealed identity boundaries in the first two and ordinary betrothal identity in Antigone. Exact production checks are in each README.

## Additional validated batch

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| The Death of Ivan Ilyich | 6b2e9f11 | 48 / 48 | build_ivan_ilyich.py |
| Medea | 47bd0434 | 37 / 37 | build_medea.py |
| A Midsummer Night’s Dream | 7a02c049 | 72 / 66 | build_midsummer.py |

All use build_reviewed.py. Review the distinct Peters in Ivan, the Corinthian Creon in Medea, and the three Helen bindings and actor/role separation in Midsummer.

## Nonfiction reference batch

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Magna Carta | dac5baab | 51 / 51 | build_magna_carta.py |
| US Founding Documents | 4430b021 | 3 / 3 | build_us_founding.py |
| Kant: Groundwork | 2ba3c11a | 7 / 7 | build_kant_groundwork.py |
| Descartes: Meditations | 2ba3c11a | 6 / 6 | build_descartes_meditations.py |
| Poetics | 5d90bace | 105 / 105 | build_poetics.py |
| Communist Manifesto | 87f6fa7a | 10 / 10 | build_communist_manifesto.py |
| Utilitarianism | adbf1213 | 16 / 16 | build_utilitarianism.py |
| On Liberty | 6162b443 | 33 / 33 | build_on_liberty.py |

All use build_reviewed.py; most also use reviewed_aliases.py. These are Reference entries, not invented protagonists. The US documents legitimately have no individual entries in their last two sections. Review each README for title/context exclusions before enabling. No change to the active release batch is implied.

## Further literary batch

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Heart of Darkness | c880a0df | 59 / 59 | build_heart_of_darkness.py |
| Gilgamesh | 3e32cda1 | 70 / 69 | build_gilgamesh.py |
| The Bacchae | 58215ac7 | 42 / 42 | build_bacchae.py |
| Oedipus at Colonus | e114711d | 54 / 54 | build_oedipus_at_colonus.py |
| The Oresteia | b9960018 | 103 / 103 | build_oresteia.py |
| Candide | a6b3da7c | 210 / 210 | build_candide.py |
| A Little Princess | 52271f0b | 86 / 86 | build_a_little_princess.py |

All use build_reviewed.py. Gilgamesh, Bacchae, Oedipus at Colonus and Oresteia also use reviewed_aliases.py. Review Gilgamesh's inherited Imini/Irnini and mother Ninazu wording issues before enablement; the source is unchanged. Heart of Darkness separates the two accountants, Company officials and Kurtz's visitors. Bacchae distinguishes the two messengers and the two groups of worshippers. Candide gates returned identities and excludes the false Cunegonde; A Little Princess separates the Paris-school lead from Sara and the doll, and gates Carrisford’s business connection to reader knowledge. This queue does not expand the active release owner's current batch.

## Newly validated full-book packages

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Beowulf | e98abb4c | 121 / 121 | build_beowulf.py |
| Phaedo | 650626ed | 54 / 54 | build_phaedo.py |
| Phaedrus | 27e825aa | 89 / 88 | build_phaedrus.py |
| Symposium | 9a088916 | 93 / 91 | build_symposium.py |
| The Comedy of Errors | 5dbc6da6 | 51 / 51 | build_comedy_of_errors.py |
| Notes from Underground | bdadefbd | 79 / 79 | build_notes_from_underground.py |
| Romeo and Juliet | 6ef22663 | 99 / 96 | build_romeo_and_juliet.py |
| Othello | d9f844aa | 55 / 55 | build_othello.py |
| Around the World in Eighty Days | efd68231 | 111 / 111 | build_around_the_world_80_days.py |
| Julius Caesar | 77b9b2d1 | 73 / 73 | build_julius_caesar.py |
| The Merchant of Venice | 0e22523c | 90 / 90 | build_merchant_of_venice.py |
| Twelfth Night | d576b613 | 65 / 65 | build_twelfth_night.py |
| The Jungle Book | 648da045 | 104 / 104 | build_jungle_book.py |
| Hume’s Enquiry | 8c860012 | 89 / 89 | build_hume_enquiry.py |
| The Sorrows of Young Werther | 584b863a | 139 / 139 | build_werther.py |
| Discourse on Inequality | 18361ffc | 45 / 45 | build_discourse_on_inequality.py |
| The Social Contract | e666213e | 96 / 96 | build_social_contract.py |
| Frederick Douglass | 7964bb77 | 134 / 134 | build_frederick_douglass.py |
| The Prince | 1abbe67a | 145 / 145 | build_the_prince.py |
| The Taming of the Shrew | 5478a791 | 72 / 72 | build_taming_of_the_shrew.py |
| Much Ado About Nothing | 89ff4bad | 60 / 60 | build_much_ado_about_nothing.py |
| As You Like It | f5525c42 | 64 / 64 | build_as_you_like_it.py |
| King Lear | 2cdd2388 | 67 / 67 | build_king_lear.py |

All use existing build_reviewed.py and reviewed_aliases.py; no new shared dependency changes. Beowulf distinguishes Scyld’s son from the central hero and documents inherited Hall genealogy/wording without editing sources. Phaedo distinguishes framing and prison participants and contextual staff roles. Phaedrus scopes Here/Hera and mythical versus Eleatic Palamedes. Symposium retains the local unnamed listener and identifies Glaucon solely as Charmides’s father. Read package READMEs for precise exclusions and production checks. Both edition hashes matched the shipping checkout at authoring.

The release owner verified the first four on September 10 and will drain the remaining validated queue without new approval requests. Comedy of Errors scopes twin names and gates Emilia’s concealed identity. Notes from Underground separates narrator/author, officers, servants and literary references. Authoring continues independently; queued packages are not yet production verified.

Romeo and Juliet requires review of an inherited doubled FIRST WATCH / THIRD WATCH label at 25:74 before enablement. The current sidecar binds only the actual third-watch cue there. Read its README; regenerate if source correction changes bytes.

Around the World in Eighty Days separates both Forsters and both priest groups, identifies Fix immediately, and gates the actual robber and marriage. Its two source hashes matched the current Tinct-reader-title release checkout. Grouped handoff with Julius Caesar and The Merchant of Venice. Julius Caesar separates namesakes, Octavius/Julius and Lucilius’s assumed identity. Merchant gates marriages and courtroom disguise identities; its inherited court stage direction names Salerio while cue 18:22 says SALARINO, documented for release review. All six source files matched Tinct-reader-title at authoring.

Twelfth Night is validated and included in the grouped handoff with The Jungle Book and Hume’s Enquiry; both source hashes matched Tinct-reader-title. Review literal addressee versus reported-assailant twin bindings and marriage versus intended-marriage gates.

The Jungle Book is validated and included in that grouped handoff. Its seven stories and verse distinguish Nathoo from Mowgli, all four Toomai generations, the two Alice references and individual versus collective animal roles. Both source files match Tinct-reader-title.

Hume’s Enquiry is validated and included in the grouped handoff. Review its two Alexanders, two Catos, Paris/Pâris and staged Epicurean speech. Both source files match Tinct-reader-title; all six source files in this batch are byte-matched. Inherited last section heading “Part 0” is documented; no source edits.

Werther is validated and included in the grouped handoff with Discourse on Inequality and The Social Contract. Both sources match Tinct-reader-title. Review the README’s inherited Count C/O, N/R, I/J and W./Seldstadt differences, marriage and secretary gates, and embedded Ossian family bindings.

Discourse on Inequality separates Pliny the Elder/Younger and identifies Montesquieu and Mandeville at implicit first references. The Social Contract distinguishes all three Catos and Borgia/Caesar. Its inherited footnotes have missing openings in both editions (examples: 16:13, 25:8, 27:16–17, 47:38–41); source review is required before enabling. Card offsets cover surviving text only. All six English source files in this grouped batch match Tinct-reader-title.

Frederick Douglass is validated and included in the grouped handoff with The Prince. All eleven chapters and appendix; both source files match Tinct-reader-title. Review Hopkins/Isaac/Thomas/Henry namesakes, Frederick Johnson versus Nathan Johnson, ships excluded from people, and ten separate parody figures. The full content suite passes 316 tests. Queued, not production verified.

The Prince is validated and included in the grouped handoff. Both sources match Tinct-reader-title. Namesakes include three Alexanders, two Philips, two Dariuses and multiple French kings. Release review: inherited notes 13:9 misidentify Joanna II as Ladislaus’s widow; 27:4 uses Giuliano for Giulio/Clement VII; 13:12 gives Colleoni’s death as 1457. Cards avoid repeating these errors. Rebuild if source bytes are repaired. All four source files in this batch match; full suite passes 326 tests.

The Taming of the Shrew is validated and included in the grouped handoff with Much Ado About Nothing and As You Like It; both source files match Tinct-reader-title. Full suite: 335 tests. Review inherited omission of the opening Induction: twelve scenes begin at Act 1, but Sly’s framing interruption survives at 1:74–78. Cards cover those surviving speakers; absent Induction cast is not silently imported. Source restoration needs a rebuild. Lucentio/Tranio and Vincentio/Pedant are scoped, the scene-4 insult pedant is Lucentio, and Troilus is a dog.

Much Ado About Nothing is validated and included in the grouped handoff with The Taming of the Shrew and As You Like It. Both source files match Tinct-reader-title; full suite passes 344 tests. Review the two Adams, three Seacoal/Francis roles, assumed names at 1:120 / 4:72 / 5:14 / 9:63, and the pending final weddings. Hero’s reported death is not presented as fact.

As You Like It is validated and included in that grouped handoff. Both source files match Tinct-reader-title; all six source files in this batch are byte-matched. Full suite: 353 tests. Review missing Act 1 Scene 1, combined scene units, incorrect later scene titles, and publishing footers documented in its README. Restoring source text requires review and rebuilding. Two Jaques, three Oliver uses and Adam namesakes are distinguished; marriages and the dukes’ changed circumstances are gated. These three packages are queued, not production verified.

King Lear is validated for the next grouped handoff; both source files match Tinct-reader-title. Full suite: 362 tests. Review father/son Gloucester title succession, stock Tom o’ Bedlam versus Edgar, country/ruler France, separate messengers and officers, and Dolphin/Dauphin song spelling. All twenty-six scenes; no source edits.

## Opus batch 1: Measure for Measure, Henry V, The Winter's Tale

Authored after the September 10 handoff, on branch `claude/tinct-character-content-1n5iqq`
(based on handoff commit `607ab9b1`). Grouped handoff to the release owner; queued,
not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Measure for Measure | 9a912f16 | 65 / 65 | build_measure_for_measure.py |
| Henry V | 17991485 | 129 / 127 | build_henry_v.py |
| The Winter's Tale | 1a071be8 | 59 / 60 | build_winters_tale.py |

Supported editions and source fingerprints (sha256 of the raw JSON bytes at authoring):

| Book | original-en | modern-en |
|---|---|---|
| Measure for Measure | b99ee3fc8f98dca8ec96d44d1f88d3851a67c34b575ea3818d1616e32d22b343 | d0e5a5ae2cf437bb6abaa4002d938224ec977e5d6f17360d7482d7e7a12f8331 |
| Henry V | c66a930a2d877fc78b00c4a793a4c63d550f2042609b51c922ec3d9a18da081b | f2b9cab47fef45f65a6bb9b53aec30aaaaa33e9944de3e62ee482df133b9bb42 |
| The Winter's Tale | e725492b2ca705fc0dc46687b555a88e106100dff1b76a2cc0900473ea0b4295 | b85a81abca26b0a3d5ba2afe80e39afc13618c44b1de3addff024be57d53c346 |

Each package's `validation-report.json` carries the authoritative hashes for both of
its editions; treat that file as the source of truth and re-verify before enabling.

Commands: `python3 books/characters/build_<id>.py --check` for each, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Full content suite
passes **386 tests** at commit `1a071be8` (362 at the handoff baseline, plus 9 for
Measure for Measure, 8 for Henry V and 7 for The Winter's Tale).

Shared dependencies: `build_reviewed.py` for all three; `reviewed_aliases.py` for
Henry V and The Winter's Tale. Measure for Measure does **not** use
`reviewed_aliases.py` — see its source defect note below. No shared file was changed.

### Release review points

- **Measure for Measure** — the original is a Gutenberg-style setting whose italic
  underscores make `reviewed_aliases` blind to both ends of a speech cue, so this book
  binds with letter/digit boundaries in its own builder and adds 21 abbreviated cues as
  original-only aliases. Review the three senses of "Justice" (the magistrate, the
  morality figure at 5:70, Angelo at 10:86), "Thomas tapster" as Pompey, and the
  deliberate non-binding of Mariana at the Duke's "poor wronged lady" (9:65).
- **Henry V** — review the repeated given names (four Edwards, four Johns, three
  Richards, two Thomases, two Queen Isabels, two Dauphins), Alexander Court versus
  Alexander the Great, "Bar" as verb and duke in one paragraph, and the split between
  Montjoy and King Henry's own herald at 20:14.
- **The Winter's Tale** — review the four scene-local SERVANT roles and the two
  gates that carry the play's reveals: Hermione's survival at 15:33 and Perdita's
  acknowledgement at 14:7.

### Source defects, none blocking enablement

| Book | Defect | Effect |
|---|---|---|
| Measure for Measure | `Clandio` (12:29) and `Angclo` (12:64) compositor errors in `original-en` | Bound to the right person with resolution `reviewed-source-typo`; modern spells both correctly |
| Measure for Measure | Speech cues merged into the previous paragraph at 8:13 and 17:20, both editions | Both speakers bound; any paragraph-level speaker attribution downstream is wrong at these two places |
| Measure for Measure | Printed line numbers inside the prose of `original-en` | Splits "the constable's 150 wife" at 5:64, so that phrase is bound in neither edition. Numbers deliberately not stripped: stripping them moves every UTF-16 offset in the file |
| Henry V | Barbason (3:19) and Parca (22:6) replaced by common nouns in `modern-en` | Recorded as `omittedEntities` for that edition — entity absent, not an unresolved binding |
| Henry V | `modern-en` renders the interjection "Marry" as "By Mary" in six places | Deliberately unbound in both editions rather than putting a saint's card on an oath |
| The Winter's Tale | Judas named only in `modern-en` (2:118) | Recorded as `omittedEntities` for `original-en`, with the reason |
| The Winter's Tale | Cleomenes's seven cues printed without their stopping period in `original-en` | Cosmetic; binding unaffected |

Any repair to these source bytes invalidates the recorded hashes and requires a
restored-text review and a rebuild of the affected package.

### Required production checks

Register both English editions per book, version the immutable asset URL (character
assets carry immutable cache headers — bump the content revision in the request URL,
do not reuse it), run the normal app gates and deploy, then open the production reader
and confirm on the fetched asset, not the uploaded file:

1. A first-encounter card in each edition (Measure for Measure 1:3 Angelo; Henry V
   2:0 King Henry; The Winter's Tale 2:0 Hermione).
2. A gated later card on each side of its boundary — most importantly The Winter's
   Tale 15:33, where returning to any earlier passage must restore the card that does
   not mention Hermione's survival.
3. One namesake span per book (Measure for Measure 5:70 "Justice"; Henry V 14:45
   "Alexander Court"; The Winter's Tale 12:30 "Doricles").

Report live evidence back to the per-book `status.json` and the generated inventory
only after those checks pass. Validated is not deployed.

## Opus batch 2: the remaining Shakespeare

Authored after the September 10 handoff, on branch `claude/tinct-character-content-1n5iqq`.
With batch 1 this completes every Shakespeare play in the published registry. Grouped
handoff to the release owner; queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Coriolanus | 720ae6bc | 90 / 90 | build_coriolanus.py |
| Cymbeline | ff47fcb8 | 81 / 80 | build_cymbeline.py |
| Antony and Cleopatra | c0dc063c | 102 / 101 | build_antony_and_cleopatra.py |
| Richard III | a1b54fd2 | 94 / 94 | build_richard_iii.py |
| Henry IV Part 2 | 80517680 | 121 / 121 | build_henry_iv_part_2.py |
| The Merry Wives of Windsor | 12f7c982 | 47 / 47 | build_merry_wives_of_windsor.py |

Supported editions and source fingerprints (sha256 of the raw JSON bytes at authoring):

| Book | original-en | modern-en |
|---|---|---|
| Coriolanus | d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da | cb7175962445184e3d28082130a5eee53b66dee497c1f92d9d516f512de8b488 |
| Cymbeline | 5f25167f50db13c867e42eaa594a989b52651e122034987181c5065cfd919749 | 9fbacf6307e227a64ec6ccb4624a1afc4b41b890f045904eb2ca1276040580b0 |
| Antony and Cleopatra | 1e768f7514f9746ced869799b520c0592a96165101c6a8be4f1f5347093a8a8b | 6cd4739c60b8cda93545514560503eca9bfeef36355dff9896a6a087bf4c2654 |
| Richard III | 891ead74f6cbcfa6acd05afc92b3e7798c4aa2105a1e7011086e8b2853e3a449 | 30204ef16006235b5dfad0a5281469da176f220f6b89e97f071efb523ce56b6f |
| Henry IV Part 2 | 5312386825366dc9945e915fa5474a680d89fcc2dbceb740f84288a4f5e2f38c | 5488605e212b451b6693e21690babd7690cb5f295a62ffac479519cb394cd203 |
| The Merry Wives of Windsor | 4ee59167c634e42eb81ede9d58ec481aedf55931bfd5fd953b9c0713a2c6b280 | 9c5531e4d3ff43f4604e08517a3059460d3aee6f9f59fde3282fa61203f61010 |

Each package's `validation-report.json` is the authoritative record; re-verify before enabling.

Commands: `python3 books/characters/build_<id>.py --check` for each, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Full content suite
passes **434 tests** at the Merry Wives commit.

Shared dependencies: `build_reviewed.py` for all six; `reviewed_aliases.py` for all but
The Merry Wives of Windsor, which needs its own boundary rules (see below). No shared
file was changed by this batch.

### Release review points

- **Coriolanus** — the central figure changes speech cue from MARTIUS to CORIOLANUS when
  the army gives him the name. Review the three senses of the family name: Ancus Martius
  the king, young Martius the son, and the house of the Martians, all in the Senate's
  praise at 13:97, plus the Volscian's dead cousin Marcus at 29:45.
- **Cymbeline** — review the single gate at 15:11 that releases Belarius, Guiderius and
  Arviragus all at once, and the two Caesars of scene 13, where the bare name means
  Julius in one line and Augustus in the next. Cloten's 13:8 is the one genuinely
  uncertain case and is flagged in that README as a judgment.
- **Antony and Cleopatra** — review the exact set of thirteen Julius Caesar mentions and
  the four Pompey the Great mentions; everything else called Caesar or Pompey is the
  living Octavius or Sextus.
- **Richard III** — the heaviest namesake load in the canon. Five Edwards, four Richards,
  four Yorks, three Georges, Plantagenet across five people. A test walks both source
  files and fails if any occurrence of the five names is unbound.
- **Henry IV Part 2** — two Bardolphs split by scene, two Harrys, five Johns, and one
  KING cue in the original serving two reigns.
- **The Merry Wives of Windsor** — four Pages, two Fords, and the deliberately unbound
  surnames at 5:17.

### Source defects, none blocking enablement

| Book | Defect | Effect |
|---|---|---|
| Coriolanus | Italic underscores round "young Martius" at 26:28 and 26:32 in `original-en` | Bound with letter/digit boundaries so both editions cover the same three occurrences |
| Coriolanus | Cue spelled `VOLSCE.` in the original and `VOLSCIAN.` in the modern; `Dian` vs `Diana` at 26:24 | Both forms carried as aliases |
| Cymbeline | Truncated stage direction at 9:0, the bare fragment `in one corner.` in both editions | Loses the trunk from Imogen's bedchamber. Cosmetic; no binding affected |
| Cymbeline | "Titan" (16:32) replaced by "the sun" in `modern-en` | Recorded as an `omittedEntities` entry for that edition |
| Cymbeline | `Cæsar` / `Æneas` ligatures in the original only | Both forms carried as aliases |
| Antony and Cleopatra | "Ladies" (1:2) absent from `modern-en` | Recorded as an `omittedEntities` entry |
| Antony and Cleopatra | `Phœbus` ligature in the original only | Both forms carried as aliases |
| Richard III | Modern uppercases stage-direction names, which would shift every occurrence index | Builder matches both cases; per-paragraph counts verified identical across the two files |
| Richard III | Modern names the ghost twice at 23:51, and prints "Henry" where the original prints "Harry" | Tables allow for both |
| Henry IV Part 2 | One `KING.` cue for two reigns in `original-en`; modern splits into `HENRY IV.` / `HENRY V.` | Builder assigns the original's cue by scene; a test checks both editions reach the two men equally often |
| Henry IV Part 2 | `Rumour` / `Rumor` and `John a Gaunt` / `John of Gaunt` | Both forms carried as aliases |
| The Merry Wives of Windsor | Gutenberg-style italic underscores and 23 abbreviated cues in `original-en` | Needs letter/digit boundaries, so this book does not use `reviewed_aliases.py` |
| The Merry Wives of Windsor | Printed line numbers split "Anne Page" (1:18, 23:63) and "Mistress Page" (13:48) in `original-en` | Numbers deliberately not stripped — stripping moves every UTF-16 offset. The orphaned surnames are bound to the right person |
| The Merry Wives of Windsor | `Actæon` ligature in the original only | Both forms carried as aliases |

Any repair to these source bytes invalidates the recorded hashes and requires a
restored-text review and a rebuild of the affected package.

### Required production checks

Register both English editions per book, version the immutable asset URL (bump the
content revision in the request URL; do not reuse it), run the normal app gates and
deploy, then open the production reader and confirm on the fetched asset:

1. A first-encounter card in each edition per book.
2. The gated later cards on each side of their boundary. Most important: Cymbeline 15:11,
   where returning to any earlier passage must restore cards that do not mention the
   stolen princes; and Coriolanus 9:11, where the earlier card must not use the name
   Coriolanus.
3. One namesake span per book — Coriolanus 13:97 "Ancus Martius"; Cymbeline 13:11
   "Caesar"; Antony and Cleopatra 5:26 "Caesar"; Richard III 8:0's three "York" spans;
   Henry IV Part 2 3:7 "Lord Bardolph"; Merry Wives 5:17, which must show no card.

Report live evidence back to the per-book `status.json` and the generated inventory only
after those checks pass. Validated is not deployed.

## Held separately

The Tempest, commit 523f30e3: 52 / 50 entries. Content is validated, but source song-speaker labels around Ariel's songs are wrong in both editions. Release owner requested source repair review before enablement. See the-tempest/README.md. Regenerate bindings if any source bytes change.

## Verification and tracking

Current complete content suite: 434 passing tests via `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Each builder's `--check` verifies saved sidecar/report freshness. No paid generation APIs; source editions unchanged by these packages.

Integrate only approved packages, register supported edition pairs explicitly, version the immutable asset URL, run normal app gates/deploy/production checks, then report live evidence back to update the authoritative per-book status.json and generated library inventory. Asset presence alone is not live coverage. Do not import the unreviewed candidate worksheets into runtime.

## Opus batch 3: The Odyssey

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| The Odyssey | 16b9c83e | 356 / 354 | build_odyssey.py |

| Book | original-en | modern-en |
|---|---|---|
| The Odyssey | da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07 | 813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc |

3253 exact mentions in the original, 3243 in the modern, across all 24 books and 1027 paragraphs per edition. Commands: `python3 books/characters/build_odyssey.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Full content suite passes **447 tests**. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

This is the library's largest edition divergence. Butler's original uses the Roman names for the gods and for the hero — Ulysses, Jove, Minerva, Neptune, Mercury, Vulcan, Mars, Diana, Venus, Proserpine, Juno, Hercules, Hyperion, Saturn — where the modern edition uses the Greek. Both forms are aliases of one entity, so one card serves both editions; verify that a reader who switches edition mid-book keeps the same card.

Also review: the two Ajaxes (4:41 is the one wrecked at Gyrae, the rest are Telamon's son); four men named Polybus; Argos bound as Odysseus's dog at 17:26 and 17:29 and nowhere else, with the place left uncast; the singular Cyclops bound to Polyphemus; Odysseus's three assumed names (Noman/Nobody, Aethon, Eperitus) as their own entries; and the deliberate non-binding of the fountain-builder Polyctor at 17:17.

### Source defects, none blocking enablement

| Defect | Effect |
|---|---|
| `modern-en` calls Nausicaa's nurse **Eurynome** at 7:0 where the original has **Eurymedusa** — and Eurynome is also Penelope's housekeeper | An explicit builder rule binds that one paragraph to the Phaeacian nurse. Without it the modern edition would put Penelope's housekeeper on Scheria |
| `modern-en` uses two spellings each for the nurse (Eurycleia 16 / Euryclea 17) and the prophet (Tiresias 9 / Teiresias 7) | Both spellings are aliases; totals match the original exactly |
| Both editions spell Alcinous's son Halios at 8:7 and Halius at 8:31 | Cosmetic; both are aliases |
| `original-en` spells the suitor Leiocritus at 2:14 and Leocritus at 22:29 | Both are aliases |
| Gaia (7:25) and the Sicels (20:33) are replaced by common nouns in `modern-en` | Recorded as `omittedEntities` for that edition — entity absent, not an unresolved binding |

No edition file was changed. Any repair to these source bytes invalidates the recorded hashes and requires a restored-text review and a rebuild.

## Opus batch 4: The Iliad

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| The Iliad | (this commit) | 750 / 750 | build_iliad.py |

| Book | original-en | modern-en |
|---|---|---|
| The Iliad | 3ba331f36cb935cb861bedb51994a4d410cda83013ba8c63bb04a126bb45e86c | d424a2e68fd2e302781a4f2ecd4ce3f85ff84c7b80f35b066a32f342cd59fa75 |

**The largest package in the library.** 7,924 exact mentions in the original and 7,946 in the modern, across all 24 books and 1,137 paragraphs per edition. Zero omitted entities on either side. Commands: `python3 books/characters/build_iliad.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Full content suite passes **460 tests**. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

**Ajax is the thing to check.** The name occurs 175 times; only 48 carry a patronymic. Every bare occurrence was read in context, and the package binds **157 to Telamon's son, 18 to Oileus's, and 32 to the pair** — identical in both editions, which a test asserts slot by slot. Spot-check 7:18 (the duel with Hector, Telamon), 23:51 (wrestling, Telamon) and 23:55 (the foot race, Oileus).

Then: the four things called **Xanthus** (a son of Phaenops, one of Hector's horses, one of Achilles' immortal pair, and the river god — with the Lycian river of the same name left uncast); the **five** men called Chromius; the four called Alastor and the four called Thoon; and that no card appears on Troy, Ida, Olympus or Argos.

The Roman/Greek pairs are carried as aliases on one entity, so verify that a reader switching edition mid-book keeps the same card for Zeus/Jove, Athena/Minerva and Odysseus/Ulysses.

### Deliberately unbound, documented

In Phoenix's parable at 9:23 the Prayers and Sin are personified but printed in lower case; they are not bound, because binding them would mean binding the common nouns wherever they appear. Recorded in the package README rather than hidden.

### Source defects, none blocking enablement

| Defect | Effect |
|---|---|
| `original-en` writes **Zeus** once at 16:51 in a text that otherwise says Jove throughout; also **Jupiter** once and **Alexandria** once for Alexandrus | All bound to the right figure as aliases |
| `original-en` writes **Fandarus** for Pandarus once | Left unbound rather than repaired; binding a misprint would imply the text is corrected |
| Alcimedon's father is **Laerceus** at 16:10 and **Laerces** at 17:29 in both editions; Pylaemenes is **Pylaemanes** at first appearance in the original | One entity each, both spellings as aliases |

No edition file was changed. Any repair to these bytes invalidates the recorded hashes and requires a restored-text review and a rebuild.
