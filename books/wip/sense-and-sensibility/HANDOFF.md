# Sense and Sensibility — complete candidate, independent acceptance pending

Repository: `anderskhv/tinct`.
Branch: `content/sense-and-sensibility-codex`.
Owned package: `books/wip/sense-and-sensibility/`.
Owned source archive: `books/raw/sense-and-sensibility/`.
Working checkout: `/tmp/tinct-sense-and-sensibility`; the pushed branch is the durable copy.

## Revisions and scope

Complete text and editorial candidate commit: `4ded9a527a9ced2cc2aa9c599f363568408b6901`. This handoff/manifest update follows that commit without changing edition text. Use the branch tip for the complete package. Exact artifact hashes are in SHA256SUMS.json; the manifest excludes itself.

Initial instruction/start-main revision: `ab3cc43f2687e6682833db6a66182d150788ffa4`.
Instructions rechecked against fetched main: `6dd90ae199a4fff7fc4692c0776158d73cbe171c`. Read books/BOOK-TASK-WORKFLOW.md, books/README.md, STRATEGY.md, root/books AGENTS.md, books/CLAUDE.md and docs/workflow-boundaries.md. No main merge or other stream’s work was imported.

The user explicitly assigned Codex content authorship. Writes are confined to the two owned paths. No application, registry, live edition/onboarding, shared tracker, script, configuration or runtime character file was changed. No deploy, publication, narration generation or Anthropic API calls. The ChatGPT project’s synced sources were not edited.

## Candidate and provenance

- Original-en: 50 numbered flat chapters; 1,806 paragraphs; 118,639 whitespace-delimited words. SHA-256 `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`.
- Modern-en: all 50 chapters; 1,806 exactly aligned paragraphs; 106,042 words (89.38% of original). SHA-256 `c86c2708f95b94c9bd8eecb54873cfe988f00ede3853a10c42c04a28316df512`.
- Raw Gutenberg #161: verified Title Sense and Sensibility / Author Jane Austen. SHA-256 `22272ec4d4da2f50cda51edf34ab8486b325c4a99580120db565fb8917228a22`. SOURCE.md supplies the retrieval URL and Denmark/EU/US rights evidence. No other ebook text was mixed in.
- Original prose matches all 50 raw chapter bodies after whitespace unwrapping and exclusion of headings/apparatus. Three end markers are excluded. The volume markers at chapters 22 and 36 were removed after initial source commit `f7a0bc38`; original prose coordinates are unchanged. Use the corrected source hash above.
- English-original edition structure follows the existing Pride and Prejudice format: chapters with number/title/paragraphs, and sections empty.

These are exact **candidate** hashes. They are not independently accepted hashes yet.

## Validation and content records

Whole-book classifier PASS: similarity 0.475 <= 0.75; light/mechanical chapters 0%; identical long paragraphs 0%; wrapped scaffolding 0; flagged truncated quotations 0. Every paragraph independently meets the 75% word floor; minimum ratio is exactly 0.75. Existing truncation audit: zero flags. Complete alignment and JSON checks pass.

Batch gates 1–10, expanded 1–12, interim 13–16, 13–22, 23–32, 33–42 and final 41–50 all pass. Chapters 41–42 are intentionally repeated in the final batch to keep a ten-chapter slice. All slice files were refreshed against the final corrected candidate and gated again. Earlier checkpoints are preserved in Git history. The classifier’s displayed chapter indices are slice positions; stored numbers/titles preserve actual book chapter numbers.

`qa/REVIEW.md` is the current author editorial review. It records spot-reads of the first three paragraphs of chapters 1, 25 and 50, name/reference corrections, short-paragraph checks, supporting-content checks, and limitations. `qa/review-01-10.md` and `qa/truncation-01-16.txt` are historical partial-checkpoint records, superseded for whole-book status by REVIEW.md and truncation-whole-book.txt.

`qa/changed-paragraphs.tsv` lists all 1,806 source/modern coordinate pairs with hashes; coordinates are one-based, including unchanged short utterances. `qa/alignment-and-length.json` records per-paragraph lengths and hashes. Source and modern boundary reports provide all chapter openings/endings. No structural remapping is needed: each modern paragraph maps to the same original chapter/paragraph.

Onboarding includes About, three whyItMatters entries with one contemporary line each, four reading angles and eleven cast members. Acclaim is omitted. The opening excerpt is the original opening; reading time is an estimate.

Characters: 24 identities with literal source evidence, aliases and introductory copy, all proposals. Fanny’s family disclosure waits through chapter 3; Anne/Nancy is one identity; the two Elizas are separate. Miss Williams is the early display name, with Eliza Williams/history held until chapter 31. Mrs. Jennings’s chapter 13 paternity gossip is not fact. Mrs. Brandon is the elder Eliza in the retrospective story and Marianne at the ending. Bare Dashwood/Ferrars titles require local scene/time disambiguation. Proposed card gates require completed chapters; any earlier runtime reveal needs paragraph-level verification. No mention offsets were generated.

Taxonomy and metadata are proposals only: house novel, shelf english-novels, form novel, era modern (19th Century). No unverified acclaim, featured status or canon/list membership. No Danish/audio content is in scope.

## Remaining work — no unwritten chapters

**NOT READY for accepted-content handoff solely because independent review is outstanding.** Author review and automated checks are complete. The mandatory workflow says: “Complete the authorized content work and independent reviews.” No independent semantic/accessibility or character/spoiler reviewer has approved this candidate.

The session’s agent policy requires an explicit instruction before spawning reviewers. A parallel-agent question was presented and has not been answered; no agents were spawned. Do not treat elapsed time or automated PASS as reviewer approval.

Resume at independent review of the exact candidate hashes above. Review all 50 source/modern chapter pairs for meaning, sequence, names/allusions, complete quoted content, historical attitudes, tone and accessibility. Separately review onboarding claims, character identities, source anchors and spoiler gates. Record findings with one-based coordinates and reviewer identity; correct only owned content, rerun affected batch and whole-book gates, regenerate hashes and record acceptance. If review finds no changes necessary, record that against these exact hashes. No chapter drafting remains.

Gate command (use absolute staged prefix):

`python3 books/classify-modern-en.py /tmp/tinct-sense-and-sensibility/books/wip/sense-and-sensibility/editions/sense-and-sensibility --gate --per-chapter`

Truncation command:

`python3 books/audit-truncation.py /tmp/tinct-sense-and-sensibility/books/wip/sense-and-sensibility/editions/sense-and-sensibility en`

## Later integration — separate assignment

After independent acceptance, proposed primary edition is modern-en, Compare is original-en. The integration owner must verify accepted hashes against the current branch/main, integrate only approved onboarding/metadata/taxonomy, generate edition-specific character mentions, enforce exact disclosure gates and run applicable app checks. Do not reuse original-en offsets in modern-en.

Verify runtime narration eligibility and exact text/language/provider/model/voice/settings cache identity during integration. No audio was generated and no availability is claimed. Changed text must not use stale speech chunks. App integration, main merge, release, deployment and publication remain outside this assignment.
