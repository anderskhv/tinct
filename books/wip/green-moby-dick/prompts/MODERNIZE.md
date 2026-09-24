# Modernization-depth editor instructions (round 4)

You are a modernization editor for Tinct's Modern English (modern-en) edition of Melville's Moby-Dick. Content only. Do NOT edit candidate.json or any existing file, and do not commit. Write only round4/{BATCH}-modernize.json and round4/{BATCH}-modernize.md.

Workspace: /home/user/tinct/books/wip/green-moby-dick/. Read STYLE-BRIEF.md completely first, including all "Lead decisions".

**Why this pass exists.** Every paragraph has already been repaired for fidelity and independently reviewed. But the project's committed similarity gate (`books/classify-modern-en.py --gate`) fails. The paragraphs listed for you (batch {BATCH} in round4/M-TARGETS.json) are still ≥ 85% word-identical to the 1851 source. The project standard (books/AGENTS.md, "Modern English") says modern-en must be a fresh modern reading edition: "rewrite sentence by sentence for present-day clarity while preserving the source's claims, sequence, tone, and examples ... a light spelling pass is not enough."

**Your job.** For each listed paragraph, compare the source with the current candidate. Then write a genuine sentence-level modern rendering, of the same standard as the edition's strong chapters (for example ch42, ch1 and ch36). That means:
- modern vocabulary in place of obsolete or archaic words and idioms (keep whaling terms)
- modern syntax in place of inverted order, periodic 1851 constructions, "ere", "but" meaning "only", "nor ... neither", subjunctives and the like
- modern sentence rhythm, splitting overlong sentences where that makes the text clearer

**While doing that, preserve everything:**
- every claim, image, metaphor, example, name, number, hedge, joke, allusion and change of register
- Melville's voice (it should read as Melville in modern English, not as a summary)
- the fidelity restorations the reviewers made, especially period terms (decision 1), footnote asterisks (2), names as printed (3, 7), dialect (5) and verbatim quotations (8)

Keep the current candidate's good choices where they already work. Do not introduce any new content, gloss or interpretation beyond brief, accurate glosses the brief already allows.

**KEEP is allowed but must be justified.** Mark a paragraph KEEP (no item) only if it is already plain present-day English that a modern writer would produce unchanged, for example short simple dialogue ("I saw him almost that same instant, sir," said Tashtego.), a verbatim quotation (decision 8), or a speaker tag or stage direction. Record each KEEP with its reason in the .md. Aim to modernize the large majority; the gate needs it.

Self-check each item:
- Go through the source clause by clause and confirm everything is represented.
- Confirm nothing is added.
- Confirm paragraph-start alignment.
- Confirm conventions (straight quotes, spaced em dash, no underscores).
- Confirm the text is clearly modern.

Print pairs with `python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py CH.I-I`.

Output round4/{BATCH}-modernize.json in the brief's format:
- role "modernize"
- reviewed = your listed ids
- items = full new paragraphs, each with category ["unmodernized"], severity "non-blocking" and a short reason

Output round4/{BATCH}-modernize.md with counts and the KEEP list with reasons. Validate the JSON. Reply in under 100 words.
