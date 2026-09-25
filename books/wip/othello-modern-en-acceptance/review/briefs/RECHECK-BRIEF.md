# Othello v2 — independent re-check brief

You are an independent re-checker. You did not render this text, review it earlier, triage the findings, or make these edits.

## Background

- The Othello Modern English candidate v1 (sha256 `012ede1e…`) had a full fidelity review.
- It then had an acceptance pass by independent agents:
  - alignment validators A1–A4;
  - blind readers B1–B3, who had no access to the original;
  - a contested-gloss resolver G1, who worked from Schmidt, Onions and Furness.
- The editor applied the accepted findings to make v2. Your packet lists every text change from v1 to v2 (`E<n>`), each with its source and reason. The packet ends with the re-cut Compare units.

The standard is `../STANDARD-DRAFT.md`. The key point is that a first-time **listener** understands what each speaker means and wants, while imagery, voice, qualifications and deliberate ambiguity survive. Modern sentences are natural, and alignment is by short units of meaning, not by forced line order. `../othello/pg1531.txt` is the full source. You may use the public-domain lexicons cached in `../../refs/` (Schmidt, Onions, Furness). Never consult a copyrighted modernization.

## For every edit, give a verdict

- `accept`: the AFTER text is faithful to the ORIGINAL lines, fixes the stated problem, reads naturally by ear, follows the conventions, and introduces no new defect.
- `revise`: the edit is right in direction, but the wording needs a change. Give the exact replacement for the AFTER text of that edit.
- `reject`: the edit makes things worse or is wrong. Say whether to restore BEFORE or what else to do.

Give explicit attention to these:

- **1.33**: the removal of the late-added "— having sex". This edit was never independently checked.
- **15.2**: line 0 reverts to "It's the cause, it's the cause, my soul;". Also confirm line 2 ("It's the cause. Still, I won't spill her blood,"), which is unchanged in v2 but was never independently re-checked before G1.
- **15.153**: the revert to "But why should honor outlive honesty?".
- **Glosses added for the listener.** Check each for invention, and for sounding like an editor's footnote. Examples: 9.100's horns; the names added in 3.24, 3.33, 15.151 and 15.61.
- **The US-spelling edits** marked `house style`. They should change spelling only.

## Also check the re-cut Compare units

For each re-cut Compare unit, confirm that the modern span corresponds in meaning to the original span, with nothing crossing a unit boundary. Report only problems.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/recheck-<ID>.json`:

```json
{"rechecker": "<ID>", "verdicts": [
  {"edit": "E1", "id": "1.4", "lines": [2, 2], "verdict": "accept" | "revise" | "reject",
   "note": "...", "proposed_after": "<only for revise>"}],
 "unit_problems": [{"id": "x.y", "lines": [a, b], "issue": "..."}],
 "summary": "..."}
```

Give one verdict for every edit in your packet. Validate the file with `python3 -m json.tool`. Your final message should give the counts of accept, revise and reject, and one line for each revise or reject. Do not edit any other file, and do not run git.
