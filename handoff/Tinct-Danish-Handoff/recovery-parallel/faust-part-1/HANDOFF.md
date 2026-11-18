# Faust, first part — Danish preparation

**Status.** The complete dramatic text is drafted in modern Danish. Native-Danish final reading and reader-position migration verification remain pending. These are private candidate files for Claude. The packet makes no release or visibility changes.

## Reader files

- candidate-faust-part-1-modern-da.json — 28 scenes, 1,095 paragraphs. Newly written directly from Goethe in speech and verse, with discrete lines inside paragraphs and stanza breaks in songs. This is a performable free-verse rendering; metre and end rhyme vary. The prose confrontation in scene 26 remains prose.
- candidate-faust-part-1-modern-en.json — 1,060 paragraphs on the previous English coordinates. Eight corrected paragraphs, with exact changes and German rationale in modern-en-corrections.json. The corrected English remains a modern rendering indebted to Taylor. This is a focused errata pass, not a new translation or an exhaustive bilingual line-by-line critical edition.
- candidate-faust-part-1.da.json and candidate-faust-part-1.json — corresponding Danish and English reading guides. Both guide openings quote the first stanza in the appropriate reading text. The guides distinguish the two wagers, retain Margaret’s agency and explain how to hear the four voices in the garden. The separate existing English editorial preface source-faust-part-1.txt was reviewed and can be retained.
- scene-ledger.tsv — per-scene mapping counts and draft word counts. The complete preparatory drafts are in 01.draft through 28.draft. Use the candidate JSON for integration.

## Source and scope

[Goethe, Faust. Eine Tragödie, 1808 printing](https://www.gutenberg.org/ebooks/21000), including the Gutenberg transcription’s bracketed corrections. The full archival text and exact corpus German used in this pass are retained privately. [Bayard Taylor’s English Faust](https://www.gutenberg.org/ebooks/14591) provides an independent historical English comparison. German governs the new Danish and disputed meanings. Only Part One is in scope. The dedication, theatrical prelude and heavenly prologue all precede the 25 dramatic scenes, including the Walpurgis intermezzo. Taylor’s translator’s preface and his own poem addressed to Goethe are outside Goethe’s dramatic text.

The actual corpus files contain 1,095 German, 1,060 historical-English, 1,060 modern-English and 895 retained-Danish paragraphs. Earlier counts in source-SOURCE.md are stale. New Danish preserves the numbered German boundaries. Inside them, the unabridged historical source restores omitted entrances, gestures, background action, changes of speaker and lyrics. For example, the second study’s long-robed speaker is Mephistopheles after Faust leaves. In the garden, the pairs pass the audience four times. In the dungeon, Gretchen’s line expresses fear of Heinrich, and Mephistopheles disappears with Faust while her voice still calls from within. The spelling correction Lied in the dedication changes “sorrow” to “song.” In the cathedral, the choir keeps the Latin Dies irae just as Goethe does. In the study, the Genesis allusion remains Latin.

## Remaining checks and integration

The native reader should read the songs aloud, try the rapidly changing registers of the two study scenes, check local choices between du and De, and review the language of the historical slurs in the devil’s speeches. The trade song, spinning song, May Night and intermezzo deliberately have distinct rhythms. Some stage directions in the source occupy the same German paragraph as dialogue. They remain on separate lines in those Danish paragraphs; the two opening witch-kitchen slots each carry part of one continuous action. The dramatic cast sometimes uses Gretchen and sometimes Margarete as in Goethe.

New Danish coordinates differ from the 895-slot retained file. Claude should inspect existing saved-reading-position and highlight migrations before any eventual replacement, especially the dedication (one Danish paragraph with four stanzas versus four English ones), the studies, and the crowded Walpurgis scenes. A same-number cross-language paragraph lookup will not reliably locate the same passage. A reader-position migration and visual device check have not been performed in this content-only packet.

Checks completed on the packet: 28 scene numbers in order, identical German/new-Danish paragraph counts in each scene, all slots populated, no working separators left inside Danish paragraphs, 1,060 English slots preserved, both guide schemas and openings checked. The English changes preserve existing coordinate counts. Source and candidate fingerprints are recorded in MANIFEST.json.
