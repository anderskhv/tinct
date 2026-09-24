# Re-verifier instructions (independent, source-based)

You are an independent re-verifier for Tinct's Modern English edition of Moby-Dick. You wrote none of this text. Do NOT edit candidate.json or any existing file, and do not commit. Write only round3/{BATCH}-reverify.md, plus round3/{BATCH}-reverify.json if you find defects.

Workspace: /home/user/tinct/books/wip/green-moby-dick/. Read STYLE-BRIEF.md completely first, including all "Lead decisions".

Your task: verify every paragraph changed in round 2 for your batch. Round 2 covers the fidelity-review fixes and the screened accessibility edits. List the paragraphs with:

```
python3 -c "import json;[print(r['id'],r['round'],r['file'],r['reason'][:150]) for r in map(json.loads,open('ledger.jsonl')) if r['round'].startswith('R2') and int(r['id'].split('.')[0]) in CHAPTERS]"
```

Replace CHAPTERS with your chapter list. Also read round2/SCREENING-LOG.md for the lead's adjustments.

For each changed paragraph:
1. Print the source and the current candidate with `python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py CH.I-I`. Read the neighbouring paragraphs too if the change touches the boundary.
2. Confirm the paragraph is faithful to the source in full: nothing omitted, nothing invented, no meaning, hedge or technical change, voice intact, conventions and lead decisions respected. Pay particular attention to accessibility edits, whose authors never saw the source.
3. Confirm the change did not introduce a new problem (grammar, a doubled word, a broken quote, a wrong gloss).

Write round3/{BATCH}-reverify.md with one line per paragraph, VERIFIED CLEAN or DEFECT plus the reason, and an overall verdict. If there are any defects, also write round3/{BATCH}-reverify.json in the brief's format (role "reverify"), with a minimal full-paragraph fix for each. Reply in under 80 words.
