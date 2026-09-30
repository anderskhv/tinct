# Sense and Sensibility — NOT READY

Repository: anderskhv/tinct. Branch: `content/sense-and-sensibility-codex`.
Package: `books/wip/sense-and-sensibility/`; source: `books/raw/sense-and-sensibility/`.
Instruction/start-main revision: `ab3cc43f2687e6682833db6a66182d150788ffa4`.
Initial source commit: `f7a0bc38` (superseded by the source-marker correction in this final checkpoint).
Modern-through-16/proposal commit: `8b1ccc76`. Use the branch tip for the complete checkpoint, including source correction and this handoff. Exact current artifact hashes: SHA256SUMS.json.

## Scope

Owned writes only in the two paths above. User explicitly assigned Codex content authorship, overriding the generic Claude/Codex role split. No app, registry, live editions, shared scripts, config, deployment, publication, narration or Anthropic API. No shared tracker or other assignment folder changed.

Read current books/BOOK-TASK-WORKFLOW.md, books/README.md, STRATEGY.md, root/books AGENTS.md, books/CLAUDE.md and docs/workflow-boundaries.md at the pinned revision. English-original JSON follows Pride and Prejudice, with sections empty for the requested flat units. No Danish/audio scope. Working checkout is /tmp/tinct-sense-and-sensibility; the pushed branch is the durable copy.

## Deliverables

- Original-en: 50 chapters, 1,806 paragraphs, verified header and full source-body correspondence. SHA-256 `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`. SOURCE.md records URL, raw hash and Denmark/EU/US rights evidence. Final audit removed only terminal volume markers at chapters 22/36; original reading-prose indices and all completed modern chapters are unaffected.
- Modern-en: partial chapters 1–16, 424 aligned paragraphs. SHA-256 `facc3508dc13c2d3c96d4f7811feba4945b4dfc654176a96f7e85c492b37efe0`. No placeholders for 17–50.
- Gates: 1–10 PASS, expanded 1–12 PASS, interim 13–16 PASS. Whole-book gate FAIL at 50 vs 16 chapters. See qa/REVIEW.md.
- Onboarding: About, exactly three whyItMatters entries with one contemporary line each, four angles, cast; acclaim omitted. Opening excerpt is original-en. Reading time is an estimate.
- Characters: 24 proposed identities, candidate aliases, source anchors, ambiguity/spoiler notes. No runtime offsets. The two Elizas are distinct; chapter 13 paternity gossip is not fact. Suggested reveal chapters need paragraph-level independent checking.
- Taxonomy/metadata: proposals only; house novel, shelf english-novels, form novel, era modern. No invented canon/list memberships.
- Changed-paragraph list: all authored paragraphs of 1–16 with source/target hashes in qa/changed-paragraphs.tsv. Mapping is one-to-one by chapter/paragraph. Source-marker removal is separately mapped in qa/source-cleanup.json.

## Resume

**Chapter 17, paragraph 1** is the next unwritten paragraph:

> Mrs. Dashwood was surprised only for a moment at seeing him; for his coming to Barton was, in her opinion, of all things the most natural. Her joy and expression of regard long outlived her wonder. He received the kindest welcome from her; and shyness, coldness, reserve could not stand against such a reception. They had begun to fail him before he entered the house, and they were quite overcome by the captivating manners of Mrs. Dashwood. Indeed a man could not very well be in love with either of her daughters, without extending the passion to her; and Elinor had the satisfaction of seeing him soon become more like himself. His affections seemed to reanimate towards them all, and his interest in their welfare again became perceptible. He was not in spirits, however; he praised their house, admired its prospect, was attentive, and kind; but still he was not in spirits. The whole family perceived it, and Mrs. Dashwood, attributing it to some want of liberality in his mother, sat down to table indignant against all selfish parents.

Continue sentence by sentence, one target paragraph per source paragraph, each at least 75% of source words. Retain names, dialogue, irony, period manners and complete quoted content. No replacement passes. Chapters 13–16 are already drafted; finish through 22, then gate the complete 13–22 batch and push. Continue 10–12-chapter batches through 50. Preserve existing completed text; do not fill missing chapters with originals.

The classifier requires equal chapter counts before applying --chapters. Create exact source/candidate batch slices within qa/batches/, retain actual chapter numbers, and invoke the unchanged classifier with the slice’s absolute prefix. Its per-chapter display uses ordinal positions; titles preserve real chapter numbers. Never point the gate at live editions.

Whole-book command:

`python3 books/classify-modern-en.py /tmp/tinct-sense-and-sensibility/books/wip/sense-and-sensibility/editions/sense-and-sensibility --gate`

After all 50 chapters: whole-book gate, complete paragraph/length audit, full source-content and quotation review, independent accessibility review, and recheck corrections. Update hashes, reports and STATUS; push. A partial-batch PASS is not whole-book approval. Independent acceptance remains pending.

## Future integration — separate assignment

Not authorized here. Later integration must verify accepted hashes against current main, generate edition-specific character mentions with disclosure gates, integrate approved onboarding/metadata/taxonomy, and run applicable app checks. Proposed primary after acceptance: modern-en; Compare: original-en. Runtime narration/cache identity requires later verification; no audio was generated and no availability is claimed. No merge or publication is requested.
