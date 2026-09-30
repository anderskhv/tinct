# Bible character cards — complete coverage, four editions

**Status: content accepted / handed off to Codex. Not published, not integrated.**

Branch `claude/magical-lovelace-85vhtw` · baseline `origin/main` `fe699e90` (checked again against `a9d3386a` before handoff; the four edition files and the live character file are byte-identical there — see `SOURCES-PINNED.md`) · owned path `books/wip/bible-characters-full/` · contentVersion `2026-09-30.1`.

## Result

Cards now link **every** appearance of each named person (name and real name variants, not pronouns) in **all four editions**, with identity decided per occurrence. The ~20-links-per-character cap is gone, BSB and WEB Catholic have cards, and the Catholic-only books have 46 new characters.

|  | kjv-en | web-en | bsb-en | webc-en |
|---|---|---|---|---|
| Characters | 149 | 149 | 149 | 195 |
| **Links** | **9,948** | **10,026** | **11,034** | **11,175** |
| Links in the live file (fe699e90) | 1,444 | 1,437 | — | — |
| David / Jesus / Moses links (live: 20 / 20 / 20) | 980 / 1,541 / 847 | 1,054 / 1,532 / 849 | 1,041 / 1,971 / 870 | 1,064 / 1,538 / 877 |
| Ambiguous occurrences decided one by one | 957 | 941 | 1,018 | 1,447 |
| Independently re-decided (blind) | 1,582 (agree 99.5%) | 1,555 (agree 99.6%) | 1,698 (agree 99.4%) | 2,341 (agree 99.6%) |
| Link sample audited (≥300 required) | 538 | 537 | 534 | 423 |
| Pinned `sourceSha256` (first 12) | `53823ea3d19a…` | `b0f491656782…` | `8da0bc1ae32d…` | `695cff11f0ec…` |

`package/bible.v1.json`: 9,446,701 bytes, SHA-256 `740258f37b4944efb105e40bb32b6e22d18d262548d2154f77ac271d3f24c9ed`. Same schema and the same 149 ids as the live file, plus 46 new ids in `webc-en`. The app’s own `verifyCharacters`/`resolveCharacter`/`releasedCard` accept it for all four editions with every mention resolving to its own card.

## Contents

| File | What it is |
|---|---|
| `package/bible.v1.json`, `package/MANIFEST.json` | The candidate character package and its hashes (file and per-edition slices). |
| `SOURCES-PINNED.md` | Hashes of the four served edition files, baseline and instruction revision, chapter-file check. |
| `RULINGS.md`, `rulings.json` | Identity rulings: the seven coding-window hypotheses, per-family results, verse-level rulings, reviewer disagreements, contested cases. |
| `identity-decisions.jsonl` | 6,898 lines: every reviewed occurrence with final card/`NONE`, basis, adjudicator reason and the blind reviewer’s answer. |
| `COVERAGE.md`, `coverage.json` | Per-edition counts, coverage buckets, per-character link counts (old vs new), new Catholic cards. |
| `REVIEW-RECORD.md`, `review/` | Who reviewed what and what it found: policy, 2,032 sample verdicts, 8 completeness reports, post-audit changes, structural check, first-mention moves. |
| `CHANGES-TO-EXISTING-LINKS.md`, `changes-to-existing-links.json` | Every old link that was kept, re-spanned, re-pointed or removed. |
| `INTEGRATION-NOTES.md` | What the coding window has to do, tests that need updating, the size question. |
| `name-forms.json` | The person-name lexicon (form → candidate cards) the scan used. |

No scripts or code are included, by design.

## The seven review hypotheses from the coding window

All confirmed against the exact spans and fixed in all four editions: Luke 2:16 Mary (was Bethany → mother of Jesus), Luke 10:39 Mary (was mother of Jesus → Bethany), Acts 1:13 James (was the Just → Zebedee; Alphaeus’ James and Judas of James are `the-other-apostles`, never Iscariot; the unspecified James is not linked), Acts 21:18 James (Zebedee → the Just), Matthew 2 Herod (Antipas → the Great), John 19:25 (Mary of Clopas has no card and is not linked; the Magdalene is), John 20:16 (mother of Jesus → Magdalene). Evidence in `RULINGS.md`.

## Open questions for Anders

1. **Non-person cards.** God/the LORD (20 links), Ark (14), Temple (12–13), Babylon (14) and Zion (8) were carried forward *unexpanded*: “complete coverage” of God/LORD would add about 4,000–4,400 “God” and 6,500–6,800 “LORD/Yahweh” links per edition and is a product call. Holy Spirit, the Word, the Lamb and the serpent are complete by exact phrase.
2. **Poetic Jacob/Israel.** Following the policy, the patriarch’s name used for the *people* in poetry and prophecy (Ps 105:23, Ezek 28:25 and 37:25, Mic 7:20, Isa 58:14, Malachi 1:2–3 as nations) is **not** linked, while patriarch formulas, genealogies, narrative and NT retrospectives are. The blind reviewers repeatedly read those verses as the man (most of the 35 remaining reviewer disagreements in `RULINGS.md`). If you prefer linking them, it is a one-rule change.
3. **Catholic-only figures** — done in this round at your request. 46 new cards in `webc-en`: the first 26 (Tobit … Jesus ben Sira) plus Nicanor, Bacchides, Alcimus, Gorgias, Tryphon, Lysias, Razis, Bagoas, Manasses (Judith’s husband), Gabael, Demetrius I and II, Alexander Balas, Ptolemy Philometor / son of Dorymenes / son of Abubus, Jason the high priest and three Apolloniuses (of Samaria, of Coelesyria, son of Menestheus). Same-name people whose identity the text does not settle stay **unlinked** and are recorded: Nicanor of Cyprus, Bacchides at 2 Macc 8:30, Ptolemy (1 Macc 15:16; 2 Macc 6:8, 8:8–9, 10:12), Apollonius of Tarsus / the ‘lord of pollutions’ / son of Gennaeus, Jason son of Eleazar and Jason of Cyrene, Alexander the Great, and Gabael the ancestor in Tobit 1:1. The mother and seven sons of 2 Macc 7 are never named in the text, so there is no name to link.
4. **Contested links kept** (Joshua 21:13 “children of Aaron”, “David their king” in the prophets, Levi = Matthew, and the others in `RULINGS.md`) are listed so you can overrule them.

## Known limits

- Reviewers and author are all Claude sessions; the reviews were blind and separate but a human spot check of the policy questions above is still advisable (`REVIEW-RECORD.md`).
- The lexicon covers name forms, not epithets. Completeness was sampled independently for 20 characters per edition (two reviewers × 10) and covered by class-wide searches and a cross-edition consistency scan for the rest.
- The candidate is 6× larger than the live file (2.8 MB gzip); how to serve it is a code decision for Codex.
- The 46 new Catholic cards’ text was written for this package and reviewed by the author only for reveal safety.

