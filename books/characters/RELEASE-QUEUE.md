# Character-card release queue

Updated September 10, 2026. This is a content-lane handoff to the existing release owner, not a separate deployment. Read each package README and validation report before integration. Sources were byte-compared with Tinct-reader-stabilization at authoring; recheck before enabling.

## Verified live

- Awakening: earlier source-reviewed pilot; recognition-shortening follow-up remains.
- Bible: Baruch only. Preserve all three enabled English variants.
- Hamlet: release-owner verified, index-CfVbJ712.js. Evidence docs/character-cards-hamlet-2026-09-10.md in shipping/main.
- Macbeth: release-owner verified, index-BjPCOKB7.js. Evidence docs/character-cards-macbeth-2026-09-10.md in shipping/main.

These bundle names identify the verification releases, not necessarily the currently served bundle after later deployments.

## Next approved batch: awaiting release-owner availability

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

All use build_reviewed.py. Gilgamesh, Bacchae, Oedipus at Colonus and Oresteia also use reviewed_aliases.py. Review Gilgamesh's inherited Imini/Irnini and mother Ninazu wording issues before enablement; the source is unchanged. Heart of Darkness separates the two accountants, Company officials and Kurtz's visitors. Bacchae distinguishes the two messengers and the two groups of worshippers. This queue does not expand the active release owner's current batch.

## Held separately

The Tempest, commit 523f30e3: 52 / 50 entries. Content is validated, but source song-speaker labels around Ariel's songs are wrong in both editions. Release owner requested source repair review before enablement. See the-tempest/README.md. Regenerate bindings if any source bytes change.

## Verification and tracking

Current complete content suite: 162 passing tests via `python3 -m unittest discover -s books/characters -p 'test_*.py'`. Each builder's `--check` verifies saved sidecar/report freshness. No paid generation APIs; source editions unchanged by these packages.

Integrate only approved packages, register supported edition pairs explicitly, version the immutable asset URL, run normal app gates/deploy/production checks, then report live evidence back to update the authoritative per-book status.json and generated library inventory. Asset presence alone is not live coverage. Do not import the unreviewed candidate worksheets into runtime.
