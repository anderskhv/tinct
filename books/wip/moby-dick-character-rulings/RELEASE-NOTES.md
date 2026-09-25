# Moby-Dick character rulings — release notes for the coding agent

**Status: content accepted and handed off. Not published.** No file under `app/**`, the registry, live data, audio or shared tooling was changed. The accepted body is not reopened, and the structural package is untouched.

## Pinned inputs (unchanged on main `1a7d89eb`)

| Input | sha256 |
|---|---|
| live modern-en `app/public/data/editions/moby-dick-modern-en.json` | `2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c` |
| accepted candidate `books/wip/green-moby-dick/candidate.json` (`claude/charming-shannon-mojaef`) | `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c` |
| original-en (Melville, PG #2701) | `30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952` |
| live card `app/public/data/characters/moby-dick.v1.json` | `dccdb35d2c4d2cfc7e1c8faba22807c1754cdaf356127f9229c836502fe34019` |
| accepted `books/wip/green-moby-dick/character-card-impact.json` (7 `goneMentions`) | `ef2830d360e7c4f0ff6ab29c542f3741ab09789f2ffd82c9113917a38c7fff3c` |
| `app/scripts/prepare-reviewed-editions.py` (main, used read-only) | `18707f6ea00430d25f9d05893ccce2c080b58150d864384f23eb459da756a9b2` |
| **this ledger** `ledger/final-mapping.jsonl` | `4ed6343f72440f4c8cea1cbfda413dafc04fe272332a1a06276b15ef0cc34b3f` |

## How to apply

This follows the pattern of `app/scripts/prepare-crime-release.py`: exact reviewed spans, no occurrence matching.

1. **Remove the 7 gone mentions.** Start from the live card's modern-en mentions (1,779) and remove the `goneMentions` of the accepted `character-card-impact.json`, matching on characterId, chapterNumber, paragraphIndex and text. 1,772 remain.
2. **Re-anchor.** Run `reanchor(asset, live, candidate, revision, allow_alias_changes=False)` as the prepare script did. Expect 1,749 retained mentions, 23 `droppedMentions` (the inventory) and 51 `relocatedExactNames`.
3. **Apply the ledger rows with `scope: "inventory-23"`.** Key each row by characterId, chapterNumber, paragraphIndex and `existingMention` (startOffset, endOffset, text).
   - **map** (MD-03, MD-11, MD-23): add the mention with the row's `finalSpan` (startOffset, endOffset, text), keeping its characterId and resolution.
   - **drop** (the other 20): keep it out.
   - Assert that `evidence.liveParagraphSha256` and `evidence.candidateParagraphSha256` equal sha256 of the normalized live and candidate paragraphs, and that each final span slices to its `text`.
4. **Apply MD-24, the one row outside the inventory.**
   - The relocation that `unchanged_name_span` makes for the live mention stubb 61.8 [252,257) "Stubb" lands on [344,349). The retained projection of live stubb 61.8 [314,319) already holds that span, so the card would carry `stubb 61.8 [344,349)` twice.
   - Remove the copy that originates from live @252. Track mentions by origin, not by final position.
   - This is the only duplicate or overlap in the entire re-anchored set.
5. **Expected result:** **1,751 modern-en mentions** (1,779 − 7 gone − 20 dropped − 1 duplicate; the 3 maps are kept).
   - Every span slices exactly.
   - No two mentions share or overlap a span.
   - The original-en block is untouched.
   - If you sort the list by (chapterNumber, paragraphIndex, startOffset, endOffset) and serialize with `json.dumps(…, ensure_ascii=False, sort_keys=True)`, the sha256 is `3d1dd3c54d44ffe2fa29917b53ed2e0aff801352ee95daea46acdd112560b01e`. See `resolved-dry-run.json`.
6. **Progression points.** None of the 24 affected spans anchors a firstMention, roleVisibleAt, snapshot or evidence point. Project those as the prepare script already does.
7. **Revision.** Bump the card revision as planned (the prepare script used `2026-09-24.1`).
8. **Drop the old count assertion.** The prepare script's `assert len(mentions)==1772` must become 1,751.
   - Its `assert not report["droppedMentions"]` must be replaced by applying this ledger.
   - Changing the script is the coding agent's work; this package changes no code.

Please do not use `approvedMentionMappings` for these rows. That mechanism picks the target by occurrence order, and occurrence order is exactly what fails here:

- In 16.2, naive order would pick the held span [483,491) instead of [557,565).
- In 61.8, occurrence order produced the duplicate that MD-24 removes.

## Observations (no action required for this release)

- **Three retained mentions sit on a loosely matching or wrong clause** in the 23 inventory paragraphs. Each still names the correct character.
  - 44.8 ahab [2173,2177): its live source is an invented sentence.
  - 44.9 moby-dick-whale [1021,1030): the closer counterpart is "the White Whale" [673,688).
  - 72.7 queequeg [575,583): same sentence, different clause.
  - The reviewer audited all 54 retained mentions in these paragraphs: 51 sit on the corresponding clause.
- **The other 50 occurrence-order relocations name the correct character**, but some sit on a different clause in heavily rewritten paragraphs (e.g. 72.0, 44.11). They were not ruled here. Audit them if clause-exact anchoring matters.
- **Melville's restored text brings back 15 name occurrences that stay unbound** under this release's no-new-binding scope. Each matches a binding the original-en card already has. They are candidates for a later binding pass:
  - 16.2 Queequeg [276,284)
  - 44.8 Moby Dick [655,664), Ahab [1161,1165), Ahab [1428,1432), Moby Dick [1674,1683)
  - 44.9 the White Whale [673,688)
  - 54.2 Captain Ahab [696,708)
  - 61.14 Stubb [585,590), [997,1002)
  - 64.4 Stubb [429,434)
  - 66.2 Queequeg [1273,1281)
  - 72.7 Tashtego [386,394), Daggoo [399,405), Queequeg [824,832), [906,914)
- **The descriptor at 78.4 is not bound.** "the negro" there is restored from Melville (as at 48.23 and 48.34 under lead decision 1), and no binding was made to it.

## Narration

This is a card-only compatibility change, and it has no audio effect of its own. The accepted body release already states the narration position: streaming only, and no legacy regeneration.
