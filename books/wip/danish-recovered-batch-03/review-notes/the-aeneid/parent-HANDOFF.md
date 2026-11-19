# The Aeneid — local content preparation

Complete modern Danish first draft: all twelve books, 544 existing corpus paragraph slots, 100,316 words. No publication, branch, application-code or release changes were made. Native Danish review remains pending. This packet is ready for editorial review and Claude's integration planning; do not interpret its completeness as native-reader approval.

## Candidate files

- `candidate-the-aeneid-modern-da.json`: full replacement Danish reading text.
- `candidate-the-aeneid-modern-en.json`: existing modern English with 27 logged targeted correction entries.
- `candidate-the-aeneid.da.json` and `candidate-the-aeneid.json`: rewritten Danish and English reading guides, retaining existing top-level schemas.
- `01.draft` through `12.draft`: recoverable Danish working text, separated with § between exact corpus slots.
- `ENGLISH-REPAIRS.json`, `DANISH-POLISH.json`, `QA.json`: change evidence and mechanical validation.

## Edition and editorial approach

Corpus base: John Dryden's English translation of Virgil's Aeneid (1697), retained in `source-the-aeneid-original-en.json` and documented in the saved source metadata. Dryden's twelve editorial book summaries remain the first slot of each book, explicitly labelled `Drydens indledning.` in Danish. They are editorial additions, not Virgil's text.

Semantic authority for new Danish: Virgil's Latin in J. B. Greenough, *The Bucolics, Aeneid, and Georgics Of Virgil*, Boston, Ginn, 1881, saved as `source-perseus-lat2.xml`, from PerseusDL/canonical-latinLit. Independent English witness: Theodore C. Williams, *The Aeneid of Virgil*, Boston, Houghton Mifflin, 1910, a verse translation, saved as `source-perseus-eng2.xml`. Exact repository revisions are retained in `SOURCE-COMMIT.txt` and `SOURCE-LATIN-COMMIT.txt`.

The Danish is an independent contemporary free-verse rendering based on the Latin, aligned to Dryden's existing paragraph divisions. It preserves the narrative, speeches, similes, catalogues, divine machinery and final killing. It restores Latin particulars where Dryden paraphrases, adds moral commentary, changes proper names or changes physical actions. It is consequently not a sentence-for-sentence rendering of the retained Dryden-based English. Paragraph alignment remains exact; sentence/line correspondence does not. No new application structure is required to hold the candidate. No intentional narrative abridgment remains; exhaustive line-number coverage has not been machine-proven.

## Review performed

Source comparison throughout drafting; targeted Latin checks of disputed details; a subsequent Danish fluency pass, especially Book VIII; consistent Vulkan and Æolus names; removal of soft hyphens; balanced Danish dialogue quotation marks; JSON parsing; matching twelve-book structure and exact per-book slot counts; no empty passages. A clear Book VIII inversion was corrected: the wolf licks the twins, not the twins their mother. Other corrections include the woodland inhabitants eating tree fruit and Vulkan's reply about Venus' power over him.

English changes are deliberately targeted, not a full stylistic modernization. The log includes factual names, relationships and battle actions: Danes/Dahae, Orion's carried ash tree, Alcanor's injured arm, Dirae/Megaera, the weapons of Liger and Asylas, Camilla striking Butes from behind, and further source-verified corrections. Historical poetic expansions elsewhere remain in the Dryden-based English; do not call it newly translated from Latin.

Both guides were rebuilt around the completed text. They distinguish poem, legend and historical interpretation, correct the ending description, avoid unsupported claims about exact word counts and a commissioned propaganda brief, and remove unverified acclaim quotations. The existing standalone English preface (`source-the-aeneid.txt`) was read and needs no correction; it is not a new candidate file.

## Remaining review and integration

A native Danish reader should check sustained idiom, poetic flow and terminology, particularly the long catalogues and Book VIII. A second independent source/fluency pass is still useful: model drafting and self-review do not establish publication quality by themselves. Do not reuse the old saved spot-check report as approval of this new candidate or of the retained abbreviated Danish. No full audio/read-aloud check has been performed.

Claude should verify the source revision against current content, review the four candidate JSON files, preserve the app's expected book keys and handle any integration/release through the user's separate workflow. Check rendering of newline verse inside paragraphs before publication. The user has permitted launching without every personal test, but expressly reserved release coordination for Claude; this worker has not released anything.
