# Round 1 — Independent source-based fidelity review, Pride and Prejudice (modern-en)

You are an independent fidelity reviewer for one batch of chapters in Tinct's
Modern English edition of *Pride and Prejudice* (Austen, 1813; Project Gutenberg #1342).
The existing modern-en edition (the CANDIDATE) was written earlier by someone else.
Do not trust it. Re-derive every verdict yourself from the SOURCE, which is the sole
fidelity anchor.

## Goal: light touch

The objective is a faithful, accessible edition — NOT maximum rewriting. The
candidate is already a genuine modernization and much of it is fine. Propose a change
only when a paragraph has a real defect in one of these classes:

1. **irony** — literal misreading of irony, free indirect speech, or indirect/polite speech
   (e.g. narration that voices a character's or the neighbourhood's opinion being turned
   into flat narrator fact, or vice versa; sarcasm made sincere; understatement inflated).
2. **attribution** — a change in WHO believes, says, thinks, feels or does something
   (speaker tags, pronoun referents, subject/object swaps, "she thought" vs narrator).
3. **qualification** — a lost or added qualification, hedge, negation, condition,
   degree, ambiguity, or social implication (rank, money, marriage, reputation,
   manners, forms of address such as "Miss Bennet" = the eldest daughter vs "Miss
   Elizabeth", "his lady", "ten thousand a year", entail, a "living", being "out",
   "connections", "condescension", "establishment", "attentions", "civility").
4. **omission** — a clause, detail, aside, name, number, or sentence dropped.
5. **addition** — an invented explanation, interpretation, emotion, or detail not
   licensed by the source (including explaining a joke inside the narrative).
6. **obstruction** — older syntax or vocabulary left in the candidate that genuinely
   obstructs a general adult reader today (not merely "old-fashioned" flavour), or a
   period term that needs a brief in-line clarification. Clarify briefly, never as a
   history lesson. Keep Austen's irony, rhythm, social distinctions and each
   character's voice (Mr. Collins's pomposity, Lady Catherine's imperiousness, Mrs.
   Bennet's effusions, Mr. Bennet's dry irony, Darcy's formality, Lydia's slang).
7. **tone** — a character made more agreeable, explicit, crude or modern in attitude
   than the source; register flattened in a way that changes characterization.

Do NOT propose: stylistic polish, synonyms you merely prefer, re-punctuation, changes
to already-clear prose, or changing the edition's conventions (American spelling —
honor, neighbor, favor; straight quotes " and '; em dashes —). A small number of
proposals is a successful outcome if the text works. If a candidate paragraph is
acceptable, leave it alone even if you would have written it differently.

Chapter 1 paragraph 0 was already repaired by the lead ("must be in want of a wife"
had been rendered "must be looking for a wife"; now "must be in need of a wife").
Check it like everything else but don't relitigate unless you find a real defect.

## Input

`{{SBS}}` — every paragraph of your chapters, labelled `[chapter.index]` (index is
0-based), SOURCE then CANDIDATE. Read it with the Read tool in chunks (it is
~160 KB; read all of it, e.g. 300-400 lines at a time). If you need wider context
the full files are `books/wip/green-pride-and-prejudice/source.json` and
`candidate.json` (repo root `/home/user/tinct`). Do NOT edit those files or any repo
file other than your two outputs.

## Method (do not skip)

1. Work in packets of ~5-10 paragraphs, comparing every source paragraph with its
   candidate paragraph, reading one neighbour on each side for context. Check actors,
   negation, causality, certainty/hedging, conditions, omissions, additions, silent
   corrections, irony and voice.
2. Cover EVERY paragraph of your batch individually. No sampling.
3. After all packets, re-read each whole chapter's candidate once for cross-boundary
   issues (things moved across paragraphs, inconsistent terms or names, set-ups and
   pay-offs, who knows what when).

## Output (write exactly these two files)

A. `/home/user/tinct/books/wip/green-pride-and-prejudice/round1/fid1-ch{{A}}-{{B}}.json` —
a JSON array of proposals:

```json
[{"ch": 3, "idx": 12,
  "old": "exact substring currently in the CANDIDATE paragraph",
  "new": "replacement text",
  "category": "irony|attribution|qualification|omission|addition|obstruction|tone",
  "blocking": true,
  "source": "the exact relevant source wording",
  "reason": "concrete one- or two-sentence reason"}]
```

Rules for proposals: `old` must occur EXACTLY ONCE in that candidate paragraph
(copy it character-for-character, straight quotes and em dashes as in the candidate);
keep `old` as short as possible while unique; `new` is the minimal fix, written in
the edition's style and conventions and fitting its surrounding sentence. At most one
proposal per non-overlapping span; if two fixes in a paragraph overlap, merge them
into one. `blocking: true` for fidelity/meaning defects (classes 1-5, 7);
`false` for obstruction-only improvements. Validate your JSON (e.g. with python3
`json.load` and a check that each `old` occurs exactly once in
`candidate.json` chapter `ch` paragraph `idx`) before finishing.

B. `/home/user/tinct/books/wip/green-pride-and-prejudice/round1/fid1-ch{{A}}-{{B}}.md` —
your report: (1) exact coverage statement (paragraph ranges read, all individually?);
(2) the proposals in brief; (3) notable things you CONSIDERED and deliberately left
alone, with why (this protects accepted passages); (4) per-chapter verdict: ACCEPT
AS-IS / ACCEPT WITH FIXES / DO NOT ACCEPT.

Your final message: the counts (paragraphs read, proposals, blocking) and the two paths.
