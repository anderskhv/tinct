# Moby-Dick · Danish content handoff

**Ready for native Danish review.** The Danish and modern English reading drafts each contain the Hawthorne dedication, Etymology, Extracts, chapters 1–135 and the Epilogue. The 139 reading units have 2,532 nonempty text slots in each language. The two guides are aligned with the candidate text.

| Local deliverable | Purpose |
|---|---|
| [Danish reading draft](../moby-dick-modern-da.json) | Complete assembled candidate |
| [Modern English](../moby-dick-modern-en.json) | Corrected counterpart, including source quotations and verse |
| [Danish guide](../moby-dick.da.json) · [English guide](../moby-dick.json) | Revised opening, synopsis, cast, approaches, acclaim and reading prompts |
| [Reviewer notes in Danish](REVIEWER-NOTES.md) | Voice, terminology and passages for read-aloud review |
| [Source details](../source-details.json) · [chapter collation](../chapter-review.json) | Local witnesses, URLs, fingerprints and per-chapter results |
| [Body changes](../changes.json) · [guide changes](../guide-changes.json) | Before and after, with original chapter and paragraph coordinates |
| [Bookmark map](../bookmark-map.json) · [validation manifest](../manifest.json) | One-based addressing and candidate fingerprints |

## Sources and coverage

The starting text is the retained Tinct Danish edition in the book's WIP folder. The copy in the app data directory has the same SHA-256. The full English body of every original Tinct chapter and the epilogue was collated against Project Gutenberg 2701. A second check used Gutenberg 15, which follows the 1851 American edition. The normalized body comparison with 2701 found three ordinal-format differences on the memorial tablets in chapter 7, three orphaned title fragments, and “soil” where both published witnesses read “soul” in Ahab's speech in chapter 132. The corrected modern English reads “soul.” The retained Danish already had *sjæl*. [Gutenberg 15](https://www.gutenberg.org/ebooks/15) · [Gutenberg 2701](https://www.gutenberg.org/ebooks/2701)

The Danish preliminaries are newly translated, including the 13 entries in the etymological list and all 80 individually attributed extracts. They retain the scholarly burlesque, sailors’ calls, biblical cadences, verse and embedded bibliographic jokes. The earlier British *The Whale* places the Etymology and Extracts at the end of volume III and omits the Epilogue. The candidate follows the American order. In chapter 24 the source witnesses place the same footnote at different points. The retained Tinct placement is preserved. The local witnesses include publishers’ preliminaries, duplicate display titles and the contents list for reference. [Herman Melville Electronic Library](https://melville.electroniclibrary.org/moby-dick-side-by-side)

The chapter checks include source collation, original/modern English/Danish slot alignment, length and spelling diagnostics, and editorial comparison of openings, flagged passages and changes of register. Passage edits include the hymns and songs, Ahab's parting defiance, Starbuck's appeal, the sensual double meaning in the spermacet chapter and the final rescue. Historical quoted verse in modern English uses the source lineation. Low similarity scores are rough prompts for inspection of the **retained** draft; padding in the original scoring pass makes their absolute values unreliable. The proof of structural coverage comes from the source collation and slot maps. Neither that collation nor the diagnostic pass certifies every translated sentence.

The guide now identifies the month in Ishmael's soul as November and the coin as Ecuadorian. The man Queequeg saves on the Nantucket crossing is distinguished from the later rescue of Tashtego. The white whale's colouring, the author's changes of narrator and form, and the range of responses to the whale now have their own textual evidence. The Lawrence quotation comes from his chapter on Melville; the Danish guide labels its translation. [Lawrence, *Studies in Classic American Literature*](https://www.gutenberg.org/ebooks/60547)

## Bookmarks and resumption

The three restored opening units shift every old section index by three. The heading on each numbered chapter retains its literary number. For instance, old chapter 1 is now unit 4; the old epilogue, unit 136, is now unit 139. In chapters 56, 57 and 73, the old first text slot continued a title. Its words are back in the heading. In those chapters only, subtract one from every subsequent old paragraph number. Map a bookmark on the former title fragment to the chapter heading, or to the start of the chapter if only paragraphs are supported. Verse line breaks occur inside existing slots. Rewritten slots may invalidate character offsets. The map identifies each such slot; the change record supplies the exact old and new strings for quote-based recovery. If a highlighted passage can no longer be located exactly, preserve its original quotation for manual recovery.

The map describes this candidate's two modern editions against the retained inputs. Existing reader positions, original-English comparison links, chapter guides, audio timings and other data keyed to the older numbering need integration review by Claude. The existing app migration files cover an earlier revision and should not be mistaken for the map for this draft.

Chapter inputs and the two source witnesses are under `source/` and `chapters/`. Each numbered chapter and the epilogue have an independently saved candidate in `draft-chapters/`; use the original printed chapter number in these filenames. The three preliminary units are saved separately in `front-matter-da.json` and `front-matter-en.json`. For resumption, start with the manifest and the specific chapter's candidate and comparison files. All writes stayed in local preparation.
