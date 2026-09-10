# The Tempest character package

Validated content package, not yet enabled in production. Content revision 2026-09-10.1. Authoring-agent review, not independent editorial approval.

52 original / 50 modern entries, covering named cast, all printed speaker labels, selected unnamed relations, masque roles, song figures, spirit hounds and cultural references. Original 1,022 exact bindings; modern 1,030. Both editions have 790 paragraphs in 10 reading units (nine scenes and the epilogue). Modern omits named Hymen and Phoebus references; their cards are omitted rather than injected into rewritten references.

See cards.md for categories and concise copy, source-review.md for first-mention contexts, validation-report.json for source hashes. Compile with `python3 books/characters/build_tempest.py --check`; nine focused tests join the 32 previous content tests, all passing.

## Editorial and binding decisions

- Prospero initially has the useful magician/father identity. His earlier dukedom is deliberately withheld by the dialogue and released after 2:16. Antonio's connection to him is released after 2:22. This differs from ordinary unconcealed family relationships.
- Engagement identities release after 5:24, restoration after 9:21 for Prospero and 9:28 for Antonio. Cards do not repeat scene events or disclose ending plans at introduction.
- Duke of Milan at 2:138 is Antonio; at 2:139 it is Prospero. Antonio's unnamed son is retained, including the modern wording “fine son.”
- Ship master/captain is scoped to the ship, excluding Prospero's servants' use of “master” and the sailors in Stephano's song. Sir Prudence identifies Gonzalo. No blanket binding of “king” to Alonso: hypothetical kings and Stephano occur frequently.
- Iris, Ceres and Juno are masque roles; no assertion that Ariel always plays Ceres is inferred from “presented Ceres.” The modern rendering makes that interpretation but the original is less explicit.
- Nobody is scoped to the comic reference; Mountain, Silver, Fury and Tyrant to the named hounds. Ordinary words remain unbound.
- Exclusions: places, generic pronouns/titles, hypothetical travelers/crowds, ordinary oaths, Jack as an idiom and Poor-John as a food term. No fictional cast is inferred from such terms.

## Source-text defects observed (source unchanged)

Both English files contain misleading inherited speaker labels around Ariel's songs: 2:116–120 labels PROSPERO, 2:123–125 labels FERDINAND, and 9:15 labels PROSPERO despite surrounding directions identifying Ariel. The card bindings identify the name literally printed; they do not silently correct the text. Source repair must update aligned editions as appropriate and regenerate this package before shipping a new fingerprint. This is a pre-existing edition defect, separate from card prose.

Supplementary reference: [Folger's cast and text](https://www.folger.edu/explore/shakespeares-works/the-tempest/read/); [First Folio cast at Internet Shakespeare Editions](https://internetshakespeare.uvic.ca/doc/Tmp_F1/scene/List%20of%20Characters/index.html). Repository edition text remains authoritative for offsets and release gates; external editorial prose is not copied.

Integration: verify source fingerprints, register both editions, copy the sidecar, version the asset request and check early/late/backward selections in production. Suggested checks: Prospero before/after 2:16; the two dukes at 2:138/139; ship master at 1:0 and 9:16; masque at 8:19 onward; return to scene 1. Paragraph indices here are zero-based.
