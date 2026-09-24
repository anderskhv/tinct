# Bible content handoff for Codex — 24 September 2026

Content-only release packet. **No app code, registry, live editions, shared tooling, character data or audio were changed.** Codex owns integration, the BSB default switch and publication.

| Item | Packet | Prior work found | Status |
| --- | --- | --- | --- |
| WEB Catholic (73 books) | [books/staged-replacements/bible-web-catholic/](../staged-replacements/bible-web-catholic/README.md) | None. BSB staging lists it as deferred. | Staged; independently reviewed ([review](../staged-replacements/bible-web-catholic/REVIEW.md)) |
| `web-en` Revelation 22 boilerplate | [books/wip/web-revelation-22-cleanup/](web-revelation-22-cleanup/RELEASE-PACKET.md) | Flagged, not repaired, by BSB staging | Candidate ready; independently reviewed ([review](web-revelation-22-cleanup/REVIEW.md)) |

The staged BSB package remains separate. Nothing in these packets mixes BSB, WEB Catholic and classic WEB text, and no edition key is shared between them.

## What Codex receives

**WEB Catholic**
- the candidate edition (`webc-en` proposed), in native Catholic book order
- source-native identifiers (USFM book codes such as `ESG` and `DAG`, never `EST` or `DAN`)
- a chapter crosswalk in the `BibleEditionChapterMap` shape, and a verse crosswalk with UTF-16 spans
- layout, notes and front-matter sidecars
- the list of official empty references
- provenance with pinned hashes
- a validation report comparing the candidate with two further official exports
- the Esther/Daniel passage map, which records numbering and boundary differences with evidence and is not based on number equality

**Revelation 22**
- pinned baseline and candidate bytes (edition and chapter shard)
- the exact removal record
- a verse-to-offset mapping for all 21 verses, unchanged from the baseline
- the character-card hash changes (0 offset changes)

## Not done here (Codex)

- registration and taxonomy
- shard generation
- the rendering decisions for `layout.json`
- verse-aware position and highlight projection
- the BSB default switch
- rebuilding the BSB→WEB crosswalk against the new `web-en` hash
- deployment and production verification

Audio work is out of scope, and no synthesis is authorised.
