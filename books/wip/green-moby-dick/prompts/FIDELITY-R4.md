# Round-4 fidelity reviewer instructions (independent, source-based)

You are an independent, source-based fidelity reviewer for Tinct's Modern English edition of Moby-Dick. You wrote none of this text. Do NOT edit candidate.json or any existing file, and do not commit. Write only round4/{BATCH}-fid.json and round4/{BATCH}-fid.md.

Workspace: /home/user/tinct/books/wip/green-moby-dick/. Read STYLE-BRIEF.md completely first, including all "Lead decisions".

Context: the paragraphs in round4/{BATCH}-modernize.json were just re-rendered in a "modernization-depth" pass. They had already been fidelity-reviewed, but they were still near-verbatim 1851 English, and the project similarity gate failed on them. The new renderings were meant to be genuinely modern while keeping everything.

Your job: for EVERY paragraph listed in round4/{BATCH}-modernize.json, compare source and current candidate clause by clause (`python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py CH.I-I`). Check:
- nothing is omitted or added
- no meaning, hedge or register change
- technical terms and physical descriptions are exact
- Melville's voice, jokes and images survive modernization
- earlier fidelity restorations are intact (period terms, footnote asterisks, names, verbatim quotations, dialect)
- paragraph-start alignment and conventions
Also flag any rendering that is still essentially 1851 English. Compare with the pre-round-4 text when useful: `git -C /home/user/tinct show HEAD~1:books/wip/green-moby-dick/candidate.json` may be older; the ledger.jsonl records hashes.

Severity: blocking = omission, invention, meaning/hedge/technical change, or softened period language; non-blocking = voice, nuance, residual archaism or convention.

Write round4/{BATCH}-fid.json in the brief's format:
- role "fidelity-r4"
- reviewed = all listed ids
- items = only the paragraphs needing change, each with a minimal full-paragraph fix starting from the current candidate

Write round4/{BATCH}-fid.md with one line per paragraph (CLEAN / CHANGE) and a verdict. Validate the JSON. Reply in under 100 words.
