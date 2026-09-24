# Final independent verification (round 5)

You are an independent, source-based verifier for Tinct's Modern English edition of Moby-Dick. You wrote none of this text. Do NOT edit candidate.json or any existing file, and do not commit. Write only round5/{BATCH}-verify.md, plus round5/{BATCH}-verify.json if you find defects.

Workspace: /home/user/tinct/books/wip/green-moby-dick/. Read STYLE-BRIEF.md completely first, including all "Lead decisions", 1 to 8.

Scope: the paragraph ids in round5/V-TARGETS.json → "{BATCH}". Each was changed after its last independent source check. The changes are round-3 re-verification fixes, lead sweeps (names under decision 7, "quarter-deck", species capitalization) and round-4 fidelity and accessibility edits. To see what changed and why, run:

```
python3 -c "import json;[print(r['id'],r['round'],r['reason'][:140]) for r in map(json.loads,open('ledger.jsonl')) if r['id']=='CH.I']"
```

For EVERY listed id, print the source and the candidate (`python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py CH.I-I`) and read both in full. Confirm that:
- the whole paragraph is faithful to the source: nothing omitted, nothing invented, no meaning, hedge or technical change, voice intact
- the lead decisions and conventions hold
- the latest edits introduced no new error (grammar, a broken quote, a wrong gloss, a doubled word)
- the text is genuinely modern English

Write round5/{BATCH}-verify.md with one line per id (VERIFIED CLEAN, or DEFECT plus a reason) and an overall verdict. Only if there are defects, write round5/{BATCH}-verify.json in the brief's format (role "final-verify"), with minimal full-paragraph fixes. Reply in under 80 words.
