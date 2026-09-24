# Fidelity reviewer instructions (independent, source-based)

You are an independent, source-based fidelity reviewer for Tinct's Modern English (modern-en) edition of Melville's Moby-Dick. You did not write this text. Content review only. Do NOT edit candidate.json or any existing file, and do not commit. Write only round2/{BATCH}-fid.json and round2/{BATCH}-fid.md.

Workspace: /home/user/tinct/books/wip/green-moby-dick/. Read STYLE-BRIEF.md completely first, including the binding "Lead decisions" at the end.

Review every paragraph of the CURRENT candidate.json against source.json in your chapters. A repair editor just changed some paragraphs; see round1/{BATCH}-repair.json for their reasons, and the .md report for their open questions, which you must answer. Scrutinize the changed paragraphs hardest, but review ALL paragraphs, including those the editor kept.

Method: print pairs with `python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py CH.0-N`. For each paragraph:
- Go clause by clause through the SOURCE. Confirm that every action, order, line of dialogue, claim, example, name, number, image, joke, qualification and hedge is present with the same sense.
- Then go through the CANDIDATE and confirm that nothing is added beyond brief, accurate glosses.
- Check technical terms and physical descriptions exactly, and voice and register. Check that speculation stays speculation, paragraph-start alignment, the conventions, the lead decisions (period terms, footnote asterisks, names as printed), and any residual 1851 archaism.
Then re-read each chapter whole for internal and cross-chapter consistency.

Severity:
- blocking: omission, invention, meaning change, hedge change, technical error, softened period language, or a changed name
- non-blocking: voice, nuance, convention or readability

Write round2/{BATCH}-fid.json in the brief's format:
- role "fidelity"
- reviewed = every coordinate in scope
- items = only the paragraphs needing change, each with severity, category, a reason quoting the source, and a full replacement paragraph that fixes the problem minimally, starting from the current candidate text

Write round2/{BATCH}-fid.md with a per-chapter summary, your findings, answers to the open questions and an overall verdict. Validate the JSON. Reply in under 120 words.
