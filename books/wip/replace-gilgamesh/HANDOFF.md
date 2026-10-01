# Handoff — blocked, not accepted

Primary blocker: the complete Thompson 1928 edition includes Hittite translations credited to Johannes Friedrich, who died in 1972. The primary therefore fails the hard all-contributor cutoff. Per user rule 1, the fallback was investigated.

Fallback blocker: a clean unchanged Muss-Arnolt 1901 narrative passage, verified visually against printed p.330 / PDF page 446, fails the unchanged coordinate-only checker at N=10 (1/1 paragraphs; 21 words inside shared runs) and N=8 (1/1; 30 words). See fallback-verified-passage.json and fallback-verified-passage-gates.txt. This is public-domain source wording, not text read from the live editions. It is impossible to preserve that original faithfully and also pass the specified zero-overlap original gate. Rephrasing the source or splitting it into sub-ten-word fragments would defeat other explicit requirements.

No completion is claimed. The requested final 12-tablet editions have not been delivered. No gate output is represented as a whole-book PASS.

## Decision needed

Permit authenticated public-domain overlap in original-en while retaining the strict independence gate for modern-en, or authorize another source that can satisfy all requirements. Recommended: the first option, using Muss-Arnolt as the full fallback. This changes an explicit hard gate and cannot be silently inferred from the authority to make routine editorial decisions.

## Preserved work

- Branch: content/replace-gilgamesh-codex, cut after git fetch from origin/integration/release-candidate-6, base 95837141b.
- Owned path: books/wip/replace-gilgamesh/ only.
- Source evidence, successful-download hashes, raw files and scan-verified counterexample are retained.
- rejected-thompson/: First–Third Tablets were transcribed and freshly rendered, 78 aligned paragraphs. Batch raw/folded classifier 0.282; 0 light/mechanical chapters; 0 identical long paragraphs; no truncated quotations; N=10 and N=8 both 0/78 for each candidate. Per-paragraph >=75% words and exclamation checks passed. These are historical partial-batch results, invalid as acceptance after primary source rejection.
- Additional Fourth/Fifth Tablet drafts are unfinished and unaccepted; the Fifth draft deliberately excluded borrowed Hittite text, but selective excision was abandoned because the user requires moving to the fallback when source verification fails.
- structure-map.json records only live chapter indices and paragraph counts. No replacement mapping is asserted.
- Muss-Arnolt was not mixed into the rejected Thompson text. The new verified excerpt is diagnostic only.

## Accidental exposure and source caution

The Thompson OCR read revealed its Hittite translated passage before its end footnote disclosed Friedrich’s credit. A subsequent batch of scan images included the same page; the opening of the next credited Hittite passage also appeared at the foot of the Sixth Tablet’s final page. This constitutes exposure to wording with an uncleared contributor. Neither passage was rendered into a candidate. This is reported under rights rule 3. No Colavito text, site, live edition wording, Heidel, George, Mitchell or Sandars wording was read. The downloaded Thompson PDF metadata reports an embedded Sandars HTML file; it was never extracted or opened. That PDF remains local research-only and is not pushed. All Thompson raw data and drafts remain rejected research evidence, not distribution assets.

## Scope and instructions

Read root AGENTS.md, books/BOOK-TASK-WORKFLOW.md and books/AGENTS.md at the assigned base; books/README.md, STRATEGY.md, books/CLAUDE.md and docs/workflow-boundaries.md from origin/main. User’s explicit content assignment overrides historical Claude-only ownership. No app, registry, live edition, shared script, tests or configuration edits. No PR, merge, deployment, API generation or Anthropic spend. generate-editions.cjs was never run. The exact requested overlap-check.py was obtained from origin/claude/busy-fermi-111knc and was not modified.

Evidence and rejected-draft SHA-256 values: artifact-hashes.json. Raw downloads: source/download-manifest.json. Instruction reference origin/main: 72af4a8bee9de1d16d8f9051863a4f244151770a. Final diagnostic rerun confirms N=10 and N=8 failure; no accepted edition exists to run whole-book gates against.
