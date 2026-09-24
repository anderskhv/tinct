# Review record — web-en Revelation 22 cleanup

**Outcome: ACCEPTED on 24 September 2026.** There are no blocking defects.

A reviewer with fresh context, who took no part in authoring the packet, checked it with separate code. The full report is in [REVIEW-independent.md](REVIEW-independent.md). The reviewer:
- downloaded Gutenberg #8294 again (hash matched the pin) and validated its header
- parsed the live and candidate editions and compared them in full. The only difference is chapter 1189, paragraph 4, where a single contiguous span after "Amen." is deleted. The deleted text is exactly the Gutenberg trailer, with no verse labels.
- recomputed all 21 verse offsets and text hashes
- reproduced the shard serialisation in memory, byte for byte
- confirmed the character-card hash convention and that all mentions resolve
- confirmed that `app/` is untouched and that no other Gutenberg text remains in the edition

Follow-ups from the review, and how each was handled:

| Item | Resolution |
| --- | --- |
| S1: `SHA256SUMS` was referenced but missing | Added; it covers every file in this folder except itself |
| S2: `REVIEW.md` was referenced but missing | This file |
| N1: the removed span is 18,180 units including the separator space | Now stated in the packet |
| N2: the paragraph-hash normalisation was not named | Now stated in the packet (`normalizeParagraph`; for this paragraph the raw and normalised hashes are the same) |
| N3: wording about `structural-report.json` | Corrected: the file holds a warning with a preview, not the trailer |
| N4: the Gutenberg file can change upstream | Noted. `prepare.py` fails closed on a hash mismatch. |

The candidate bytes did not change after review.
