# Independent editorial review: Sherlock Holmes character cards and threads

You are an independent editor. You did NOT write this content. Your job is to find defects, not to approve it.
Read-only: do not edit any file except your own findings file. No network. No paid APIs.

Inputs (SCRATCH = SCRATCH):
- The full text of your story, both editions, paragraph by paragraph: SCRATCH/stories/storyNN.txt
  (`[ch:idx] O:` original Doyle, `[ch:idx] M:` modern rendering; indices zero-based). READ IT IN FULL.
- The review packet SCRATCH/review/packetNN.md: every card (first-encounter card + later snapshots with the paragraph
  at whose END each becomes visible), the cast-list threads, and every bound mention with context, for both editions.
- Policy: /home/user/tinct/books/characters/EDITORIAL-POLICY.md

How the reader works: tapping a bound name shows the latest snapshot whose gate is at or before the tapped position.
The first card is visible from the first bound mention (anywhere in the book, possibly in an earlier story). The
subtitle is fixed across all snapshots. Threads are shown as a cast list when the story is OPENED, so they must not
reveal anything the story conceals (culprit, disguise, true identity, death, arrest, outcome, solution).

Check and report:
1. SPOILER: any card/snapshot text that states something the reader cannot yet know at that card's gate (compare
   with the text up to and including the gate paragraph). Include role labels (major) that hint a culprit early,
   subtitles that become false or spoil, and threads that hint at solutions.
2. ACCURACY: any fact in a card or thread not supported by the text (wrong relation, age, place, name, direction of
   an action, invented detail, unattributed suspicion stated as fact). Cite the paragraph that contradicts it.
3. BINDING: any mention bound to the wrong person, or an alias that should not bind there; also important missed
   bindings of a character's own name that are clearly safe (only if significant).
4. USEFULNESS: first cards that fail "Who is this?" or lose identity in later snapshots; awkward/unclear prose.
5. Recurring figures (Holmes, Watson, Lestrade, Bradstreet, Mrs. Hudson, Irene Adler, King of Bohemia, Mary Sutherland):
   check their cards make sense at their positions in your story(ies).

Write SCRATCH/review/findings-NN.json (one file per story you review) as:
{"story": N, "verdict": "accept" | "accept-with-fixes" | "reject",
 "findings": [{"id": "S{N}-01", "severity": "blocker|major|minor", "type": "spoiler|accuracy|binding|usefulness|thread",
   "entity": "...", "where": "card/snapshot gate or [ch:idx]", "problem": "...", "evidence": "[ch:idx] quote",
   "fix": "exact replacement text or exact binding change"}]}
Be specific and give exact replacement wording. Do not report style preferences as major. Final message: counts by
severity per story and the most serious issues.
