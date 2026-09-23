# Odyssey Modern English — release packet (handoff to the coding agent)

**Status: accepted content, NOT live.** This packet hands the accepted edition to the coding agent, who owns publication. Nothing in `app/`, the live edition files, the character cards, audio or deployment configuration has been changed by this content work.

## Candidate and destination

| | |
|---|---|
| Candidate | `books/staged-replacements/odyssey/edition/odyssey-modern-en.candidate.json` |
| Candidate sha256 | `bd05c7f43da64bfe4ad9908531f2a1434e79acc8635ca54cb1ad39942e9afc9c` |
| Size | 607698 bytes, serialized like the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline) |
| Destination | `app/public/data/editions/odyssey-modern-en.json` |
| Live baseline replaced | sha256 `813127d77b4041f613a11b46e50890f46519252782188a6a1156ebc050898cdc` (identical on `origin/main` at handoff) |
| Structure | 24 chapters, 1027 paragraphs, per-chapter counts identical to live and to `odyssey-original-en.json`; keys `chapters` → `number`, `title`, `paragraphs` |
| Built by | `edition/assemble.py` from the 24 accepted Book files below (byte-for-byte survival asserted) |

## Source

Samuel Butler, *The Odyssey* (1900), Project Gutenberg #1727: `source-texts/pg1727-butler-1900.txt`, sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9`. Served `odyssey-original-en.json` sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`. `scripts/pg_source.py` confirms that all 24 `source-bookN.json` files derive from PG #1727 and equal the served chapters character for character, apart from the 4 enumerated A7 divergences. Per-Book source hashes are in `EDITION-VERIFICATION.md`.

## Accepted Book files

| Book | File | sha256 | ¶ |
|---|---|---|---|
| 1 | `book01/candidate-v4.json` | `6e5ecb0a4b7a40d2ca2ccf17ef36408bb95c6980a2584b522d37526959a77de8` | 32 |
| 2 | `book02/candidate-v8.json` | `028601a4330cc6474e54d834a5895bfabffeabf7960146cf1f27bad01211f997` | 35 |
| 3 | `book03/candidate-v3.json` | `a79bacf6fd5f4a995b27d404e38e58790487bd4586bb144c7a0503408554ce1e` | 38 |
| 4 | `book04/candidate-v6.json` | `289384111ad98c014acb13f75a5474e9e58e682073d99c4dd15d848c595fcfbe` | 81 |
| 5 | `book05/candidate-v4.json` | `4af9bf49b055db83f6895e743572ea248988ebffbee6317d3219c1b771dd207e` | 37 |
| 6 | `book06/candidate-v4.json` | `2c416c4028517f413963feb9a4e2adf58c1e17b910d78ded88f98589e6f890f0` | 26 |
| 7 | `book07/candidate-v3.json` | `59d8eed4af9b3d5a68b6725a2aed67d692efe7fcca074c328ab8d3beb0bcbbb3` | 29 |
| 8 | `book08/candidate-v3.json` | `b23e8b302ea09fbe5b7fcdbf4b8b6e3da473ac425842d4d3923f2bcd9666536c` | 50 |
| 9 | `book09/candidate-v4.json` | `62518c853316a36c2222266fce2db751b5109c651dbad57c89bf2c810ee5a375` | 44 |
| 10 | `book10/candidate-accepted.json` | `49cd316c6433aa9a6af597bfda0a8a88ce5c9fcb04b43eb554cb5ad08eed7935` | 49 |
| 11 | `book11/candidate-accepted.json` | `f957b876d42039a4e4ea00468256b301533679260e3c5607fcc926d0e8566bec` | 54 |
| 12 | `book12/candidate-accepted.json` | `fef04e2968ad52ce698c767a7b0df8c75c6920fb1acbc8ee6ca09ac1839517fe` | 39 |
| 13 | `book13/candidate-accepted.json` | `fd79d3bdb1bfdf2abc342e2725ec73261701669bd53cce2c17edff1b2424e119` | 38 |
| 14 | `book14/candidate-accepted.json` | `bb3c62a850be4692703a8c861d3dd5bfa5bdbdd29bb3f2b7756398023ec95d2d` | 35 |
| 15 | `book15/candidate-accepted.json` | `78d1d95921a68a3dfcb51f6647b29b54fce691d11c2ddf19672a45583d1339ec` | 48 |
| 16 | `book16/candidate-accepted.json` | `0c34afd1476af6837cbbfbb4cce2442e13008149801f520b8f7af24edaf59b3d` | 45 |
| 17 | `book17/candidate-accepted.json` | `c95b983d113c18dbe8ba14f944e8091da45daf4b9f87191db543fad04bf48de6` | 63 |
| 18 | `book18/candidate-accepted.json` | `c2a220e39f1e50bac109aaf7be45d1814055f416b4cd238aaa8a6358535d9b4e` | 41 |
| 19 | `book19/candidate-accepted.json` | `06a6c113737296cf6de839d24d06cc4667e7effef6eedc2d5dc14117839687bc` | 39 |
| 20 | `book20/candidate-accepted.json` | `573dc1cb5a0cfad0dd288feea4395f5bffcd155aa16b425968179104a59d4436` | 36 |
| 21 | `book21/candidate-accepted.json` | `d4896082617d79a6bcb46531faefa3ee3c4e3d7b9b5f57d4cf69785eb6f75c75` | 42 |
| 22 | `book22/candidate-accepted.json` | `e84c31a2ca47459fa01b49029f2f80a8c9bd0f8c8632c601b9fdff1343cd34f5` | 52 |
| 23 | `book23/candidate-accepted.json` | `b9faa10fa399a11a1600c4372e33d72102b90f730620517d1d56be28c45ae8b4` | 29 |
| 24 | `book24/candidate-accepted.json` | `90eab71390e8cdabdd7f8a4fbbd417b8072d4790e82358fd116f35bff92da1bc` | 45 |

Each file's `ACCEPTANCE.md` records its review coverage and every successor since acceptance. `REVIEW-COVERAGE.md` gives the per-Book summary.

## Changed passages

See `CHANGED-PARAGRAPHS.md` (summary, indexes, reasons, notable meaning corrections) and `changed-paragraphs.tsv` (live and candidate hash per changed paragraph). Accepted paragraph hashes are in `accepted-paragraph-hashes.tsv`, both raw and under the card's `prose-reader-v1` normalization.

**Chapter titles changed in 6 Books (9, 17, 19, 20, 22, 23)** (see CHANGED-PARAGRAPHS.md). `app/scripts/prepare-reviewed-editions.py`'s `prepare()` rejects chapter-identity changes. If that tool is reused, the title change is expected and intended: American spelling, Greek names, "gallery" for cloister, and the Book 9 PG typo. Its `reanchor()` checks only structure, so it accepts this edition.

## Character-card impact (read-only dry run; the card was not modified)

Card `app/public/data/characters/odyssey.v1.json` (contentVersion `2026-09-12.1`, release entry `odyssey: { editions: EN, revision: '2026-09-12.1' }` in `app/src/services/characters/characterCards.ts`). The card's `modern-en` block pins the live edition (sourceSha256 and paragraph hashes), so publishing this text **requires re-anchoring the card's modern-en block**. Its `original-en` block is unaffected.

I ran the existing `reanchor()` from `app/scripts/prepare-reviewed-editions.py`, imported read-only, against this candidate (`edition/card_impact.py`):
- the live card verifies against the live edition: its paragraph hashes and every mention offset match;
- 1011 changed paragraphs contain 660 of 662 modern-en mentions;
- **632 mentions re-anchor automatically and 30 drop** (list below). The drops fall into three kinds: places where the live text named a figure and Butler (so the candidate) uses a pronoun or other wording; live-text errors that were corrected (the invented "Helios" is Butler's Hyperion at 1 ¶0 and 12 ¶20, and at 15 ¶1 the right suitor is Eurymachus, not Antinous); and spans that were reworded so much that difflib projection lands on a fragment. None of the drops is a mention that should survive unchanged. The candidate text may contain new mentions at these places, and the re-anchor does not add them;
- 78 progression points (firstMention, roleVisibleAt, snapshot availableAt) lie in changed paragraphs; reanchor() projects them;
- the original-en block is unchanged by the re-anchor: True.

Full detail is in `character-card-impact.json`. The coding agent owns character-card compatibility and decides whether the dropped mentions need re-review.

| Chapter | ¶ | Character | Old mention text | Projected text |
|---|---|---|---|---|
| 1 | 6 | odysseus | Odysseus | — |
| 1 | 14 | odysseus | Odysseus | — |
| 1 | 17 | odysseus | Odysseus | him |
| 4 | 31 | poseidon | Poseidon | Poseidon’s head man |
| 4 | 41 | poseidon | Poseidon | he |
| 3 | 26 | zeus | Zeus | the |
| 3 | 30 | zeus | Zeus | aegis |
| 4 | 7 | zeus | Zeus | — |
| 4 | 65 | zeus | Zeus | — |
| 8 | 25 | hermes | Hermes | — |
| 5 | 20 | calypso | Calypso | — |
| 6 | 12 | calypso | Calypso | the Ogygia |
| 10 | 11 | circe | Circe | — |
| 10 | 24 | circe | Circe | the |
| 10 | 34 | circe | Circe | the |
| 1 | 0 | helios | Helios | Hyperio |
| 12 | 20 | helios | Helios | Hyperio |
| 19 | 2 | eurycleia | Euryclea | — |
| 2 | 21 | antinous | Antinous | Antinous’s |
| 15 | 1 | antinous | Antinous | Eurymachus |
| 4 | 64 | laertes | Laertes | te |
| 3 | 20 | nestor | Nestor | — |
| 3 | 34 | nestor | Nestor | e |
| 3 | 37 | nestor | Nestor | — |
| 15 | 9 | helen | Helen | my own |
| 23 | 18 | helen | Helen | — |
| 12 | 20 | tiresias | Tiresias | the |
| 4 | 42 | agamemnon | Agamemnon | At that Agamemnon |
| 24 | 6 | achilles | Achilles | — |
| 10 | 3 | aeolus | Aeolus | Aeol |

## Verification

`EDITION-VERIFICATION.md` covers source completeness, structural alignment, byte-for-byte survival of every accepted Book, cross-Book consistency passes (all independently VERIFIED CLEAN) and the screening-tool output.

## Known issue outside this content scope

Served `odyssey-original-en.json` Book 3 ¶38 is a splice (ruling D14; A3 in the ledger). The modern candidate renders Butler's 12 words there. A one-line repair of the original-en file is recommended; it is not part of this packet.

## Audio

This packet has no audio prerequisite. Text acceptance and publication do not depend on audio regeneration.
