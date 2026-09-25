# Method — Odyssey accessibility follow-up (Books 3–10, 23, 24)

## Scope and inputs

- **Books reviewed.** The ten Books that the unchanged similarity gate classes LIGHT on the accepted candidate: 3, 4, 5, 6, 7, 8, 9, 10, 23 and 24. Together they are 428 paragraphs.
  - The gate run on the candidate, reproduced here, gave weighted similarity 0.784 and 10/24 LIGHT.
  - That matches the hold on PR #163 (run `35978578726`).
- **Accepted candidate.** `books/staged-replacements/odyssey/edition/odyssey-modern-en.candidate.json` on `claude/odyssey-modern-en-completion` (`0a76d6ce`), sha256 `bd05c7f43da64bfe4ad9908531f2a1434e79acc8635ca54cb1ad39942e9afc9c`. This is PR #163's modern-en.
- **Source.** Butler's 1900 prose translation, PG #1727, as the served original-en. For the release pairing this is option A `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` from `7994156f`, which differs from the served `da03f6ac…` only at 3.37.
- **Package rules applied to every repair.** These come from `GLOSSARY.md`, `PUNCTUATION.md` and each Book's `continuity.md` on the same branch:
  - Greek name forms;
  - fixed formulas and renderings;
  - American spelling and typographic punctuation;
  - Butler's bracket rule D12;
  - the within-paragraph collision rule D26 ("arrow C");
  - D29 (prefer Butler's own word when it is still current).

## Stages

1. **Blind comprehension read.** Six independent readers each saw only the modern text of their Books:
   - B3; B4; B5–6; B7–8; B9–10; B23–24.
   - They never saw Butler, the repository or any other translation.
   - For every paragraph they wrote a plain paraphrase (actions, who does what to whom, relationships, arguments, what each image compares). They listed every barrier with the exact words, their best reading, their confidence, and the impact (`misread` / `unsure` / `pause`).
   - Outputs: `reviews/blind-read/bookNN.json`.
2. **Source-aware adjudication.** Six further agents compared each reader's understanding with Butler, paragraph by paragraph. They identified three kinds of problem:
   - real misunderstandings caused by the wording;
   - barriers that block a present-day reader;
   - false friends the reader did not flag (their own sweep).
   - They proposed minimal, faithful repairs and recorded rejected barriers and reader errors not caused by the text.
   - Outputs: `reviews/adjudication/bookNN.json`.
   - Cross-Book context gaps are not text defects: each blind reader saw only its own Books. The Book 3/4 join (option A) was out of scope.
3. **Lead screening.** Every proposal was accepted, adjusted or rejected with a reason, and the decisions are recorded in `CHANGES.md`. The lead applied the accepted edits to the candidate. Each `old` substring had to occur exactly once in its paragraph.
4. **Independent fidelity verification.** Fresh verifiers saw BUTLER / BEFORE / AFTER for every changed paragraph, with neighbouring context. They checked meaning, content, conventions, collisions, grammar and unnecessary change. Defects were fixed and re-verified.
   - Outputs: `reviews/verification/`.
5. **Gates and compatibility.**
   - The unchanged `books/classify-modern-en.py --gate`.
   - Structure and alignment against original-en.
   - The PR #163 character-card procedure, run read-only: remove the 30 rejected spans, then `reanchor(allow_alias_changes=True)`.
