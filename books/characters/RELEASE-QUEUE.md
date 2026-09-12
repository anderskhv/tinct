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
| The Iliad | 1b2f3048 | 750 / 750 | build_iliad.py |

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

## Lane A automation batch 1: On the Genealogy of Morals

Authored on branch `claude/tinct-character-content-1n5iqq` by the Lane A
automated author per `AUTOMATION-QUEUE.md` (queue item 1 of 15). Queued, not
production verified; this lane never sets `appStatus`.

| Book | Content commit | Original / modern entries | Builder |
|---|---:|---:|---|
| On the Genealogy of Morals | 0530df7b | 72 / 72 | build_genealogy_of_morals.py |

| Book | original-en | modern-en |
|---|---|---|
| On the Genealogy of Morals | 2377b4157b8e28c24a35bcb25e98c2b51a25be3abf0cb5bde71a59aa75550f4f | 72ca79453b9a485fa0a8277df452809dba80b87ecaf6985121e020ef51d30a9c |

199 exact mentions in each edition, identical locations on both sides, across
4 chapters (Preface, First Essay, Second Essay, Third Essay) and 124
paragraphs per edition. Zero omitted entities on either side. Commands:
`python3 books/characters/build_genealogy_of_morals.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Shared
dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was
changed.

### Release review points

A treatise with no invented cast and, unusually for this queue, **no
namesake collisions at all**: every one of the 72 bound names resolves to
exactly one person, verified by an exhaustive per-name location sweep of
both editions before authoring. The two things worth independent review are
both "person or not" traps rather than namesake ones:

- **Zarathustra** also names Nietzsche's own book. "My Zarathustra" (1:9)
  and the "Thus Spake Zarathustra" epigraph attribution (4:0) are book-title
  uses and carry no entity; only the Second Essay's closing invocation
  (3:31, "open alone to Zarathustra, Zarathustra the godless") is bound.
- **Zeus** is bound only at Nietzsche's own English-language invocations
  (3:19, 3:26); the Latin "ipso Jove" inside the quoted Tertullian passage
  (2:33) is a different author's reference in a different language and is
  deliberately left unbound, along with every other proper name inside that
  Latin block except Tertullian himself (named in the surrounding English
  gloss, not the Latin).

One reference could not be resolved from the text and is deliberately
unbound: **"Sir Christopher" in Shakespeare** (4:23), cited alongside
opponents of vegetarianism. See the package README's "Ambiguous or generic
references" section.

Categories: 70 of 72 entries are Reference; **Schopenhauer** and **Wagner**
are Major, since each anchors several consecutive paragraphs of sustained
analysis in the Third Essay rather than a single citation.

### Source defects, none blocking enablement

| Defect | Effect |
|---|---|
| `original-en` prints `Ubigaudeam` for `Ubi gaudeam` inside the Tertullian Latin quotation at 2:33 | Cosmetic; inside the untranslated Latin block already excluded from binding, so no offsets are affected |

No edition file was changed.

### Required production checks

Register both English editions, version the immutable asset URL, run the
normal app gates and deploy, then open the production reader and confirm on
the fetched asset:

1. A first-encounter card in each edition (1:6, "Schopenhauer").
2. That "Zarathustra" shows no card at 1:9 or 4:0, and shows one at 3:31.
3. That "Sir Christopher" (4:23) shows no card.

Report live evidence back to the package `status.json` and the generated
inventory only after those checks pass. Validated is not deployed.

## Lane A automation batch 2: Fear and Trembling

Authored on branch `claude/tinct-character-content-1n5iqq` by the Lane A
automated author per `AUTOMATION-QUEUE.md` (queue item 2 of 15). Queued, not
production verified; this lane never sets `appStatus`.

| Book | Content commit | Original / modern entries | Builder |
|---|---:|---:|---|
| Fear and Trembling | acaf280e | 68 / 68 | build_fear_and_trembling.py |

| Book | original-en | modern-en |
|---|---|---|
| Fear and Trembling | d6f7ab72adfe4c161c5ab69b5bedda7e3bb519a92b0050d8b0b6f07d294e45a1 | 152776f19e1b707b610d2bee033d6984ed0f1e26826b314e2d0541d9c0b49132 |

675 exact mentions in the original, 672 in the modern, across 8 chapters
(Preface, Exordium, Eulogy on Abraham, Preliminary Expectoration, Problema
I-III, Epilogue) and 232 paragraphs per edition. Zero omitted entities on
either side. Commands: `python3 books/characters/build_fear_and_trembling.py
--check`, then `python3 -m unittest discover -s books/characters -p
'test_*.py'`. Shared dependencies: `build_reviewed.py` and
`reviewed_aliases.py`; neither was changed.

### Release review points

The automation queue flagged this book by name for a namesake, and it was
real: **"Sarah" names two different people.** Abraham's wife is named
throughout the Exordium, the Eulogy, and the frame of Problema III; a wholly
different Sarah — daughter of Raguel and Edna in the Book of Tobit — is
named only within Johannes de Silentio's digression at 7:40-7:46. Every one
of 18 occurrences in both editions was read and verified; the package binds
"Sarah" with a location-scoped rule rather than a bare alias (`sarah` and
`sarah-tobit` carry no aliases of their own). Review 7:60 and 7:68 in
particular — both are back in the Abraham frame, immediately after and long
after the Tobit digression, and both must land on Abraham's wife.

Also review: "Cain" (6:15, "for Cain and Abraham are not identical") is a
genuine Cain/Abel-vs-Abraham/Isaac contrast, not a scribal slip; four
edition-specific spellings of the same entity, not namesakes — original's
Latin "Cartesius" vs. modern's "Descartes," the signature "Johannes de
silentio" vs. "Johannes de Silentio," "Gloster" vs. "Gloucester," and the
original's own drift from "Agnete" (7:27-29) to "Agnes" (7:30 onward)
against the modern edition's uniform "Agnes"; and one reference,
"Kildevalle" (7:46, named only inside a quotation from Baggesen),
deliberately left unbound as unresolved from the text alone.

Categories: Abraham is the only Central entry. Isaac, Sarah (Abraham's) and
Eliezer are Major/Supporting as the three from whom Abraham conceals his
undertaking. Agnete/Agnes, the Merman, Faust, and Sarah of the Book of
Tobit are Major — each is a sustained analytical figure Johannes de
Silentio builds and reworks across several paragraphs, not a single
citation. Everything else is Reference.

### Source defects, none blocking enablement

| Defect | Effect |
|---|---|
| Problema III's chapter title spells Abraham's servant "Eleazar" in `original-en` and "Eliezer" in `modern-en`; both editions' body paragraphs consistently say "Eliezer" | Chapter titles are not indexed paragraph text and are never bound, so no offsets are affected |

No edition file was changed.

### Required production checks

Register both English editions, version the immutable asset URL, run the
normal app gates and deploy, then open the production reader and confirm on
the fetched asset:

1. A first-encounter card in each edition (2:0, "Abraham").
2. That "Sarah" at 7:40 shows the Book of Tobit card, and that "Sarah" at
   7:60 (immediately after) shows Abraham's-wife card.
3. That "Kildevalle" (7:46) shows no card.

Report live evidence back to the package `status.json` and the generated
inventory only after those checks pass. Validated is not deployed.

## Lane A automation batch 3: Second Treatise of Government

Authored on branch `claude/tinct-character-content-1n5iqq` by the Lane A
automated author per `AUTOMATION-QUEUE.md` (queue item 3 of 15). Queued, not
production verified; this lane never sets `appStatus`.

| Book | Content commit | Original / modern entries | Builder |
|---|---:|---:|---|
| Second Treatise of Government | c6c53731 | 47 / 47 | build_second_treatise.py |

| Book | original-en | modern-en |
|---|---|---|
| Second Treatise of Government | efbd7cabd14ed99f98aabae7a95f48e8102db75f0b7aaae0054d0ffe4675b0d0 | 177b364414c437af89fe5d09b8922d71ff772ccf7da6ec2e64c710ed061269bf |

107 exact mentions in the original, 108 in the modern, across all 19
chapters and 301 paragraphs per edition. Zero omitted entities on either
side. Commands: `python3 books/characters/build_second_treatise.py --check`,
then `python3 -m unittest discover -s books/characters -p 'test_*.py'`.
Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither
was changed.

### Release review points

A political treatise, not a novel: 44 of 47 entries are Reference. Three
are Major because the whole argument turns on them, not a single citation:
**Sir Robert Filmer** (this entire treatise's polemical target throughout),
**Adam** (the linchpin of the paternal-dominion argument Locke dismantles
in chapters 1, 5, 6 and 18), and **Richard Hooker** (Locke's own chief
cited authority, quoted at length).

No namesake collisions anywhere in the book, verified by an exhaustive
per-name location sweep of both editions before authoring — including the
one real risk spot, five Genesis figures (Cain, Abel, Abraham, Lot, Esau)
all cited in a single sentence at 5:14. Two source-text spelling variants
handled as aliases, not namesakes: original-en's "Jeptha" (19:45, no middle
h) alongside its own "Jephtha" elsewhere (never the modern "Jephthah" in
either edition), and original-en's lowercase "juvenal" (19:33) where
modern-en capitalizes "Juvenal".

Left deliberately unbound, all cases where Locke's own text supplies no
name to bind: "the archphilosopher" (6:24, a Hooker-footnote epithet for
Aristotle), "one at Syracuse" (18:5, an unnamed tyrant), the kings of
Assyria in general (16:22, as distinct from the two named kings of Judah,
Hezekiah and Ahaz, who are bound), and "the author of the Mirrour" (19:43,
an anonymous medieval legal text).

### Source defects, none blocking enablement

None. Both editions match on chapter/paragraph structure exactly; the only
divergences are the two documented spelling variants above, both handled
as aliases with no source bytes touched.

### Required production checks

Register both English editions, version the immutable asset URL, run the
normal app gates and deploy, then open the production reader and confirm on
the fetched asset:

1. A first-encounter card in each edition (1:5, "Sir Robert Filmer").
2. That the five Genesis figures at 5:14 (Cain, Abel, Abraham, Lot, Esau)
   each show their own distinct card.
3. That "the archphilosopher" (6:24) and "one at Syracuse" (18:5) show no
   card.

Report live evidence back to the package `status.json` and the generated
inventory only after those checks pass. Validated is not deployed.

## Lane A automation batch 4: Beyond Good and Evil

Authored on branch `claude/tinct-character-content-1n5iqq` by the Lane A
automated author per `AUTOMATION-QUEUE.md` (queue item 4 of 15). Queued, not
production verified; this lane never sets `appStatus`.

| Book | Content commit | Original / modern entries | Builder |
|---|---:|---:|---|
| Beyond Good and Evil | f8637ad0b | 119 / 119 | build_beyond_good_and_evil.py |

| Book | original-en | modern-en |
|---|---|---|
| Beyond Good and Evil | a906a663863727ff37c8e40b5561165088d6835111f736210604dbf95f484e43 | 5b14eaa83a4b695afc10e74b203001ac33490f732a1fb42c141749687859d08a |

287 exact mentions in the original, 284 in the modern, across all 11
sections (Preface, nine numbered chapters, and the closing poem) and 325
paragraphs per edition. Zero omitted entities on either side. Commands:
`python3 books/characters/build_beyond_good_and_evil.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Shared
dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was
changed.

### Release review points

An aphoristic philosophical work naming more real historical, mythological
and literary figures than any prior Lane A book, exactly as flagged in the
automation queue ("Nietzsche's philosophers, composers and nations"): 111 of
119 entries are Reference. Eight are Major for sustained, repeated
engagement across multiple chapters rather than a single citation:
**Plato** and **Socrates** (the "morality as error" argument running
Preface-Chapter 6), **Kant** (Chapter 1's critique of synthetic judgments a
priori, revisited in Chapters 6-7), **Pascal** (the Religious Mood chapter's
central case study), **Napoleon** and **Goethe** (paired repeatedly as "good
Europeans," Chapters 6-9), **Wagner** (Chapters 3, 8-9), and **Schopenhauer**
(Chapters 1, 3, 4, 6, 7, 9).

Two genuine namesake collisions, both resolved by location-scoped binding
rather than a shared alias, verified against every mention in the book, not
a sample: **"Frederick"** names Frederick II of Hohenstaufen (6:14) and
Frederick the Great of Prussia (7:5); **"Sand"** names the novelist George
Sand (8:19) and Karl Ludwig Sand, Kotzebue's assassin (9:4) — the aphorism
about Kotzebue "knowing his Germans" is a dark joke about that
assassination. A third near-collision, original-en's "Caesar Borgia"
containing the bare word "Caesar," is excluded from the Julius Caesar alias
at that one location in the build script rather than left to chance;
modern-en's "Cesare Borgia" never collides at all. One false-positive was
caught and fixed: original-en's "Pascal-like" is an adjective (the hyphen
let the word-boundary matcher through), not a citation — modern-en's own
"Pascalian" there correctly never matches.

Left deliberately unbound, all cases where the text itself supplies no name
or only a borrowed nickname: "the great Chinaman of Konigsberg" (7:6, Kant,
unnamed at that spot), the unnamed father of Frederick the Great (7:5) and
unnamed mother of Napoleon (8:24), and "ce senateur Pococurante" (8:14,
Galiani's borrowed-from-Voltaire nickname for Helvetius, not a reference to
an actual Pococurante in this book).

### Source defects, none blocking enablement

The poem's final paragraph (11:30) is Project Gutenberg's own end-of-text
credit line, left over from incomplete boilerplate stripping in both
editions — left as printed, not treated as a mention of Nietzsche himself.
original-en carries several bracketed footnotes (citing Schiller's *William
Tell*, Horace's *Epistles*, and the English translator of Schopenhauer's
*Grundprobleme der Ethik*) that modern-en folds into the main sentence or
drops outright; these account for every mention-count difference between
editions, none of them a missing or invented character.

### Required production checks

Register both English editions, version the immutable asset URL, run the
normal app gates and deploy, then open the production reader and confirm on
the fetched asset:

1. A first-encounter card in each edition (1:0, "Plato").
2. That the two Fredericks (6:14, 7:5) and two Sands (8:19, 9:4) each show
   their own distinct, correctly identified card.
3. That "the great Chinaman of Konigsberg" (7:6) shows no card.

Report live evidence back to the package `status.json` and the generated
inventory only after those checks pass. Validated is not deployed.

## Opus batch 5: The Aeneid

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| The Aeneid | baba11fb | 340 / 342 | build_the_aeneid.py |

| Book | original-en | modern-en |
|---|---|---|
| The Aeneid | 4a763d99af704695d1fbe4fc6c9740c2335dedc7bbf7e2b22aff8af23903aaf0 | 1e9b6dd64911f96374ae6e9322379d4eb30a9d9dfc8e0a994e717c71f3a05c07 |

2,107 exact mentions in the original and 2,134 in the modern, across all 12 books and 544 paragraphs per edition. Commands: `python3 books/characters/build_the_aeneid.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Full content suite passes **482 tests**. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

The original is Dryden's rhymed couplets and the modern edition is prose. They align paragraph for paragraph, but Dryden paraphrases freely, which is why the mention counts differ by 27 and two entities are absent from the verse. Dryden uses the Roman names throughout, so there is no Greek/Roman split here.

**Pallas is three people and two of them are Major**: the goddess through books 1–7 plus 8:15, 8:24 and 11:27; Evander's son from 8:6 onward and through books 10–12; and Evander's great-grandsire once, at 8:3, where Pallanteum is named. Spot-check book 2 (goddess) against book 10 (the boy).

**The boat race names four galleys after monsters** — Chimaera, Scylla, Centaur and Dolphin. Ships are not cast, so no card appears on them in book 5, while the monsters themselves are still carded in books 3 and 6. Two more of the same kind: "Nisus' top" at 6:29 is Bacchus's mountain, not the Trojan; the Ufens at 7:44 is the river, not the captain.

Also review: three men named Abas, four named Butes, three named Amycus; and Serestus/Seresthus as one man against Sergesthus as another.

### Deliberately unbound, documented

At 9:36 Dryden compresses Virgil's "Liger killed Emathion, Asilas killed Corynaeus" into one line that loses which side either man is on, and the Etruscan Asylas has not yet landed at that point. Neither name is bound there, and a test asserts it.

### Source defects, none blocking enablement

| Defect | Effect |
|---|---|
| Dryden spells one captain **Serestus** at 1:31 and **Seresthus** in four later places | One entity, both spellings as aliases |
| Dryden's **Polydore / Polypheme / Hyarba / Cajeta / Penthisilea** against the modern's Polydorus / Polyphemus / Iarbas / Caieta / Penthesilea | One entity each, both forms as aliases |
| The modern edition breaks **Creüsa**, **Laocoön** and **Pasiphaë** on their diaereses | Both spellings carried |
| **Doto** and **Pirithous** are named only in the prose | Recorded as `omittedEntities` for the original — entities absent, not unresolved bindings |

No edition file was changed. Any repair to these bytes invalidates the recorded hashes and requires a restored-text review and a rebuild.

## Opus batch 6: The Divine Comedy

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| The Divine Comedy | f15dac3d | 574 / 587 | build_divine_comedy.py |

| Book | original-en | modern-en |
|---|---|---|
| The Divine Comedy | 494a37942b0005c1a6ca5fab8720dcd8db1f1a7c1ec80831d7bab9bdcbd4c452 | 5938ed2727d6a26ed7928e97b382254d7d2acfd382d180604e97b518a2660ad2 |

589 authored entities, 1,144 exact mentions in the original and 1,211 in the modern, across all 100 cantos and 4,812 paragraphs per edition — the largest source in the library. Commands: `python3 books/characters/build_divine_comedy.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

The original is Longfellow's blank verse and the modern edition is prose. They align paragraph for paragraph across all 100 cantos. Longfellow capitalises every verse line-opening, so the inventory was built from the prose and checked back against the verse.

**Namesakes are the whole difficulty of this book, and the reason the builder carries position tables rather than a name list.** Five men called Guido in the Inferno; two Brutuses, two Alexanders, two Buosos; three Ugolins and two Bonifaces in the Purgatorio; and in the Paradiso **four men called Peter inside two cantos** (Peter Lombard 77:35, Peter Mangiatore and Peter of Spain in one line at 79:44, Peter Damian 88:40, Saint Peter everywhere else, Pietro Bernardone at 78:29), **two Bernards** (Quintavalle at 78:26, Clairvaux from canto 31 on), **two Dionysii** (the tyrant of Syracuse, the Areopagite), **two Thomases** (Aquinas, and the apostle at 83:42), **three Williams** (Monferrato, Orange, Sicily), **two Anselms**, **two Hughs**, **four Charleses** and **four Alberts**.

Spot-check, in order of risk: 50:41 Currado da Palazzo against 42:39 Currado Malaspina; 15:36 "Francis of Accorso" against Francis of Assisi; 77:35 Peter Lombard against Saint Peter; 87:20 William of Sicily against the Marquis William of Monferrato; 37:47 Manfred's daughter Constance against 37:37 his grandmother the Empress.

**Five figures the poem never names are bound by circumstance**, each on a span that exists in both editions: Solomon ("the fifth light" / "regal prudence" / "kingly prudence"), Hugh the Great ("the great baron"), Orosius ("the advocate of the Christian ages"), Charles II ("the Cripple of Jerusalem") and Clement V ("the Gascon"). A test asserts that no Solomon mention quotes his name, because the poem does not contain it.

**One editorial decision worth a second opinion.** Cacciaguida's roll-call of the old Florentine houses in Paradiso XV–XVI names about thirty families in forty lines. They are bound to **one card**, *The old houses of Florence*, rather than thirty near-identical ones. Gianni del Soldanieri, a person, keeps his own card at Inferno 32:40.

### Deliberately unbound, documented

"Whichever John you choose" (71:9), where Beatrice declines to say which John she means; "Count Guido" (83:32), who is not one of the five; Can Grande della Scala (84:25); and Agamemnon, the Sultan, Boethius and Hezekiah, each identified by a circumstance the two editions phrase too differently to share a span.

### Source defects, none blocking enablement

None. Both editions parse cleanly, align paragraph for paragraph across all 100 chapters, and carry no printed line numbers or compositor debris. Fifteen entities are absent from Longfellow's verse and two from the prose — translation choices, recorded as `omittedEntities` and asserted by a test. **No entity is absent from both**, which is the check that distinguishes paraphrase from a binding that was never made.

### Required production checks

Register both English editions, version the immutable asset URL, run the normal app gates and deploy, then open the production reader and confirm on the fetched asset:

1. Canto 33 of the Inferno shows Ugolino and his four children, and canto 16 of the Purgatorio shows Currado da Palazzo — not Currado Malaspina.
2. Paradiso X–XII show Peter Lombard, Peter Mangiatore and Peter of Spain as three distinct cards.
3. "The fifth light" at 77:36 shows the Solomon card in both editions.
4. Paradiso XVI shows *The old houses of Florence* on the family names and nothing on the place names beside them.

Report live evidence back to the package `status.json` and the generated inventory only after those checks pass. Validated is not deployed.

## Opus batch 7: Paradise Lost

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Paradise Lost | d489a282 | 167 / 171 | build_paradise_lost.py |

| Book | original-en | modern-en |
|---|---|---|
| Paradise Lost | 56c47aa192f17e38ae996d1abfc268dc0090a8c365a2e8f7578160dea2f81185 | 87727e7760ea487d5b4527570d9bdaeaeb3158c782ed372f9c0a554cbf8562ba |

171 authored entities, 1,138 exact mentions in the original and 1,208 in the modern, across all 12 books and 1,188 paragraphs per edition. Commands: `python3 books/characters/build_paradise_lost.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

The original is Milton's blank verse, which capitalises every line-opening, so the inventory was built from the prose and checked back against the verse.

**Book 1 is the reason this package exists.** Eighteen fallen angels are named in ninety lines and none is explained, on the argument that the gods of Canaan, Egypt and Greece were these same devils under other names. Moloch's card is therefore both the devil who argues for open war and the idol smeared with children's blood in the valley of Hinnom; the same doubling runs through Chemos, Astoreth, Thammuz, Dagon, Rimmon and Osiris.

**Three words are a person and a thing at once, deliberately**: Sin, Death and Chaos. They are bound as the persons, with two skipped exceptions ("Sin-bred" at 4:36, and Book 12's "stirring up Sin against law"). **Night is not treated the same way** — she is Chaos's consort in Books 1-3 and 10 and plain nightfall everywhere else, so she is bound at fifteen listed locations only, and a test asserts nothing outside those four books is hers.

**Serpent is bound exactly once**, at 1:4, where the poem says "It was the infernal Serpent". The other thirty-one are the animal Satan borrows. A test pins that to one location — worth a reviewer's eye, since the opposite choice is defensible and would have changed thirty-one cards.

Spot-check, in order of risk: 5:55 "Son of Heaven and Earth" (Adam, not the Son); 10:30 "O Son" (Death, not the Son); 12:39 "Joshua, whom the Gentiles Jesus call" (Joshua, not Christ); 1:0 the Heavenly Muse (Urania, not one of the nine); 7:3 "nor could the Muse defend her son" (Calliope, who is not Urania).

### Deliberately unbound, documented

Aeneas at 9:1, whom Milton calls only "Cytherea's son"; Noah throughout Book 11, shown at length and never named; Nimrod in Book 12, called only "a mighty hunter"; Cain, Abel and Enoch, all shown in Adam's visions and none of them named. Arthur is supplied by the prose at 1:56 where Milton writes only "Uther's son" — Uther is bound, Arthur is recorded as an original-edition omission.

### Source defects, none blocking enablement

None. Both editions parse cleanly into 12 books and 1,188 paragraphs and align paragraph for paragraph. Four entities are absent from the verse (Aeneas, Arthur, Noah, the Chaldeans) and none from the prose; **no entity is absent from both**. No edition byte was touched.

### Required production checks

Register both English editions, version the immutable asset URL, run the normal app gates and deploy, then open the production reader and confirm on the fetched asset:

1. Book 1's catalogue shows a distinct card for each of Moloch, Chemos, Astoreth, Thammuz, Dagon and Rimmon, and each card mentions both the devil and the idol.
2. "Serpent" carries a card at 1:4 and no card anywhere in Book 9.
3. Book 2's Night (2:79) carries a card and Book 4's nightfall (4:75) does not.
4. 5:55 shows Adam's card, not the Son's.

Report live evidence back to the package `status.json` and the generated inventory only after those checks pass. Validated is not deployed.

## Opus batch 8: Faust, Part One

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| Faust, Part One | ede80fed | 96 / 97 | build_faust_part_1.py |

| Book | original-en | modern-en |
|---|---|---|
| Faust, Part One | bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395 | 9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b |

97 authored entities, 1,101 exact mentions in the original and 1,143 in the modern, across 28 scenes and 895 paragraphs per edition. Commands: `python3 books/characters/build_faust_part_1.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

A play, so most bindings are speaker tags. Every speaking part is carried under its capitalised tag and under the name other characters use for it, and case is significant: `MARGARET` is the tag, `Margaret` is the dialogue name, both are one person.

**Two grouping decisions to confirm.** The anonymous crowd of "Before the Gate" (A MECHANIC, ANOTHER BURGHER, A THIRD, SERVANT-GIRL and the rest) is one card rather than a dozen, because the crowd is deliberately faceless. The **Walpurgis-Night's Dream** goes the other way — thirty one-line speakers, each carded, because each is a caricature of a named contemporary journal or school and without a card the whole intermezzo is noise.

Spot-check, in order of risk: 9:36 "you may call me Lord Baron" (Mephistopheles, not the Lord — skipped by table, with a test); scene 4's SPIRIT (the Earth Spirit, not the Evil Spirit of scene 23); 20:0 "Marearet" (scanning damage, carried as an alias); 28:51 the Voice from Above, which is the last line of the play.

### ⚠ Source defect worth fixing before further offset work

**The last four paragraphs of scene 25 duplicate the first four of scene 26.** "A Gloomy Day" begins twice — once at the tail of the Walpurgis-Night's Dream chapter and again at the head of its own. Present identically in both editions, so alignment holds and this package's offsets are correct as they stand, but **a reader sees the scene's opening twice**. Repairing it moves every offset after 25:31 and requires a rebuild of this package against new hashes.

### Other source defects, none blocking enablement

The original edition is a scan with visible damage — the most defective source in the library so far. No byte was touched.

| Defect | Where | Effect |
|---|---|---|
| Speaker tag **CHORUS OF DISCIPLES** lost; the speech runs on from Faust's line | 4:26 | The one `omittedEntities` divergence; a test pins it |
| **Marearet** for Margaret | 20:0 | Alias |
| German running heads left in the text: **ABEND**, **OA ABEND**, **GARTEN**, **FELD**, **BB KERKER**, **BRUBER**, **MARTHE**, **MARGARETE** | scenes 10-27 | MARTHE and MARGARETE carried as aliases; the rest is page furniture and is not cast |
| **PRELUDE ON TIE STAGE**; **FAust—** for FAUST | 2:0, 26:0 | Not bound at those occurrences |
| **PROCKTOPHANTASMIST** against the modern **PROKTOPHANTASMIST** | 24:32 | Both carried |
| **Will-o'-the- Wisps** broken across a line with a space | 25:26 | Not bound there; the entity binds at 24:4 |

### Required production checks

Register both English editions, version the immutable asset URL, run the normal app gates and deploy, then open the production reader and confirm on the fetched asset:

1. Speaker tags carry cards: open scene 8 (Auerbach's Cellar) and confirm Frosch, Brander, Siebel and Altmayer are four distinct cards.
2. Scene 25 (Walpurgis-Night's Dream) shows a distinct card on each one-line speaker.
3. 9:36 "Lord Baron" shows no card, and 3:4 "Lord" shows the Lord's card.
4. 20:0 "Marearet" in the original edition shows Margaret's card.

Report live evidence back to the package `status.json` and the generated inventory only after those checks pass. Validated is not deployed.

## Opus batch 9: The Republic

Authored on branch `claude/tinct-character-content-1n5iqq`. Queued, not production verified.

| Book | Content commit | Original / modern entries | Builder |
|---|---|---:|---|
| The Republic | COMMIT | 139 / 143 | build_the_republic.py |

| Book | original-en | modern-en |
|---|---|---|
| The Republic | 338cc5908ed34b108c6775dad4e437feccb19ba86f6fdcd868ea5821d777b0a6 | 02082bbef9bf9026cdcdb11c0bc60e0e518a832d63f19dcbcab65ca794078f57 |

143 authored entities, 620 exact mentions in the original and 652 in the modern, across 10 books and 4,308 paragraphs per edition. Commands: `python3 books/characters/build_the_republic.py --check`, then `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Shared dependencies: `build_reviewed.py` and `reviewed_aliases.py`; neither was changed.

### Release review points

A dialogue with no speaker tags — Socrates narrates and everyone else is "he said" — so nothing here is inferred from position. Every binding is a name the text prints.

**Two translation divergences needed position rules rather than aliases**, and both are worth a reviewer's eye because the alternative was unsafe:

- **Jowett spells Hera "Here."** That cannot be an alias; the goddess is bound at the three paragraphs where the word is her name (2:245, 2:309, 3:92) and nowhere else. A test pins all three.
- **Jowett writes "idea" where the modern edition writes "Form."** The Forms are bound in the older translation only at the four passages that define them (6:330, 6:332, 6:396, 10:14), each pattern written so it cannot also match the modern wording. A plain alias on "idea" would have carded several hundred ordinary uses of the word.

Jowett also writes **Athene**, **Cheiron**, and **Love** for Eros; all carried as aliases.

Spot-check, in order of risk: 10:278 Glaucus the sea-god against Glaucon the interlocutor (one letter apart); 6:143 "the necessity of Diomede" against Diomedes the hero (one entity, two spellings); 1:18, where Ariston and Aristonymus are named one clause apart.

**One decision to confirm.** *The Forms* are cast although they are not a person. They are what Books 5 to 7 are about, and a reader meeting "the Forms are known but not seen" with no card is stuck. If the release owner would rather the cast stayed strictly to persons, this is the entity to drop.

### Deliberately unbound, documented

The anonymous "he said" speakers, since a dialogue's attribution cannot be recovered from a name that is not printed; "the Muse of Philosophy" at 6:210, a figure of speech rather than one of the nine; the planets at 10:313 (Saturn, Mercury, Venus, Mars, Jupiter), which are the translator's parenthetical gloss on the colours of the whorls, not gods.

### Source defects, none blocking enablement

None. Both editions parse cleanly into 10 books and 4,308 paragraphs and align paragraph for paragraph. Four entities are absent from the original — Insolence, Anarchy, Waste and Shamelessness, which the modern edition capitalises into persons in Book 8 and Jowett leaves as lower-case nouns — and none from the modern. **No entity is absent from both.** No edition byte was touched.

### Required production checks

Register both English editions, version the immutable asset URL, run the normal app gates and deploy, then open the production reader and confirm on the fetched asset:

1. Book 1 shows a distinct card for each of the eleven men in Cephalus's house, including the four silent ones at 1:18.
2. 10:278 shows Glaucus the sea-god, not Glaucon.
3. In the original edition, 2:245 "Here" shows Hera's card, and an ordinary "Here" elsewhere in the same book shows none.
4. 6:332 shows the Forms card in both editions.

Report live evidence back to the package `status.json` and the generated inventory only after those checks pass. Validated is not deployed.
