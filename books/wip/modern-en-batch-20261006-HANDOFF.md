# Modern English batch of 2026-10-06: handoff index (content accepted, NOT published)

Branch `claude/inspiring-ritchie-zi00fu`. Each package is under `books/wip/<book>-modern-en/` and has its own
`RELEASE-PACKET.md` (integration steps) and `ACCEPTANCE-RECORD.md` (evidence, open issues, book-specific notes).
Nothing here touches the app, registry, live editions, character files, audio or tooling. Integration, shards,
character-card re-anchoring, audio invalidation and publication stay with the coding window.

All thirteen candidates pass the unmodified `books/classify-modern-en.py --gate` (run in a scratch mirror) and keep the
served structure 1:1 (same chapters and paragraph counts), so saved places, highlights and notes need no migration.
Every paragraph had one independent fidelity review; every corrected paragraph was re-checked by a fresh verifier.
The full text was not re-read by the coordinator.

| Book | Gate similarity (<= 0.75) | Paragraphs | Changed vs live | Character mentions / moved / need ruling | candidate.json sha256 |
|---|---|---|---|---|---|
| `coriolanus` | 0.574 | 1379 | 893 | 1587 / 206 / 21 | `7d0d264e3c874572…` |
| `winters-tale` | 0.589 | 911 | 660 | 1059 / 138 / 0 | `ed6f069e41b68ed0…` |
| `henry-iv-part-2` | 0.596 | 1081 | 747 | 1547 / 327 / 4 | `d54e3d958ec2ef39…` |
| `henry-v` | 0.597 | 883 | 608 | 1324 / 266 / 32 | `ec46baaf614b9f6d…` |
| `richard-iii` | 0.608 | 1420 | 964 | 1879 / 367 / 42 | `ef3386e368878460…` |
| `phaedo` | 0.749 | 652 | 419 | 466 / 252 / 10 | `f9145e7b1c0131a4…` |
| `symposium` | 0.696 | 226 | 217 | 531 / 459 / 5 | `e4f94572995511b1…` |
| `utilitarianism` | 0.721 | 94 | 94 | 42 / 42 / 0 | `534c43afa8af1f7d…` |
| `descartes-meditations` | 0.668 | 144 | 143 | 189 / 183 / 2 | `584a1672898ec274…` |
| `poetics` | 0.669 | 130 | 128 | 221 / 213 / 1 | `c14bf2d099284fad…` |
| `discourse-on-inequality` | 0.713 | 170 | 167 | 69 / 60 / 6 | `14a4b969a2b61cfd…` |
| `genealogy-of-morals` | 0.731 | 124 | 116 | 14 / 11 / 2 | `f108ea298f97f055…` |
| `peloponnesian-war` | 0.714 | 998 | 980 | 394 / 344 / 1 | `7343a0ac70f35635…` |

## Things the coding window should know

- **Phaedo is borderline** (0.749). Re-run the gate after integration.
- **Descartes 9:18 and 7:6, Discourse 3:21 and 4:55, Symposium 3:0** contain renderer guesses at damaged source text; see each acceptance record.
- **Character cards:** the last column of the table is mentions / moved (proposed re-anchor) / need ruling. `needsRuling` mentions are ones whose text no longer occurs in the candidate paragraph (the largest are Richard III 42, Henry V 32, Coriolanus 21). Check each package's `character-card-impact.json`; snapshot and reveal-point coordinates were not re-derived.
- **Plays: served stage directions and speaker labels.** The served modern-en normalizes stage directions (bracketed) and some labels (`KING HENRY V.`, `PRINCE HENRY.`, `KATHERINE.`, `VOLSCIAN.`). The renderers had copied the source forms, so after review those paragraphs were set back mechanically to the served text (`reviews/fixes-extra.json` in each play package). This restoration was not re-read by a reviewer.
- **Audio:** changed paragraphs invalidate prepared narration for each edition; keep Grok streaming, no batch regeneration.
- **modern-da** is stale for every book here and for Democracy; no new Danish.
- **Tool issues (not touched by this batch):** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path.
- Earlier packages (Democracy in America on this branch; Social Contract, Iliad, Federalist Papers and Brothers Karamazov on their own branches; Moby-Dick link rulings; the Othello pilot, which stays on hold) are described in the previous brief.
