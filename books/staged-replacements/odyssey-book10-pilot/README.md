# Odyssey Book 10 — Independent-Review Pilot

Content-only staged work. Nothing in this directory is registered, live, or
deployed. No app code, registry entries, live editions, audio, or database
records were touched. This pilot continues the workflow test begun with the
Book 9 pilot on `claude/upbeat-brown-cuttkn`, applying the same draft →
independent-review procedure to Book 10.

## What was prepared

1. **`source-book10.json`** — Book 10 extracted from
   `app/public/data/editions/odyssey-original-en.json` (found by
   `chapter.number == 10`, not by array index; it happens to sit at index 9
   in the source array), with its original `number`, `title`, and 49-entry
   `paragraphs` array, byte-identical to the source paragraphs.
2. **`candidate-v1.json`** — the new Tinct Clear modern-English reading
   edition of the same 49 paragraphs, one-to-one with the source, in the same
   chapter schema (`number`, `title`, `paragraphs`). This is a **frozen
   first draft**: it was not edited after the review packets below were
   generated from it, so later correction rounds will live in separate files
   and the diff will show exactly what review changed.
3. **`candidate-v1-readable.md`** — the same candidate text as plain prose,
   with `B10-Pnnn` paragraph IDs printed outside the prose for reference.
4. **`continuity.md`** — the continuity sheet written before drafting:
   name/terminology mapping, recurring-formula decisions, the two glosses
   used (cubit, fathom→feet), and the unresolved source issues found.
5. **`provenance.json`** — repository, branch, and commit identifiers; the
   original source path; SHA-256 hashes of the source file, the extracted
   source JSON, and the candidate JSON; and the generation setting
   (Sonnet Medium, in-conversation, zero Anthropic API calls per
   `books/CLAUDE.md`/`books/AGENTS.md`).
6. **`review-packets/`** — 17 packets (`packet-01.md` … `packet-17.md`),
   16 of three consecutive paragraphs and a final one of the single
   remaining paragraph (49 = 16×3 + 1). Each packet shows the source and
   candidate text side by side for its assigned paragraphs, plus one
   preceding and one following paragraph where available, explicitly marked
   `CONTEXT ONLY — reviewed in another packet`. No self-review verdicts or
   findings are included in the packets.
7. **`review-instructions.md`** — the independent-review instructions,
   verbatim, ready to hand to the reviewer.
8. **`manifest.json`** — lists every packet path with its assigned
   paragraph IDs, plus a coverage check confirming all 49 IDs
   (`B10-P001`–`B10-P049`) are each assigned exactly once, in order, with no
   gaps or duplicates.
9. **`README.md`** — this file.

## How to reproduce the mechanical checks

From the repository root:

```bash
cd books/staged-replacements/odyssey-book10-pilot
python3 -c "
import json, hashlib

src = json.load(open('source-book10.json'))
cand = json.load(open('candidate-v1.json'))
assert src['number'] == 10 and cand['number'] == 10
assert len(src['paragraphs']) == len(cand['paragraphs']) == 49
print('paragraph counts OK')

manifest = json.load(open('manifest.json'))
ids = [pid for p in manifest['packets'] for pid in p['assigned_paragraph_ids']]
expected = [f'B10-P{i+1:03d}' for i in range(49)]
assert ids == expected
print('manifest coverage OK: exactly once, in order, no gaps/duplicates')

md = open('candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs'])
print('readable md matches candidate-v1.json verbatim')

for entry in manifest['packets']:
    text = open(entry['packet'], encoding='utf-8').read()
    for pid in entry['assigned_paragraph_ids']:
        idx = int(pid.split('-P')[1]) - 1
        assert src['paragraphs'][idx] in text
        assert cand['paragraphs'][idx] in text
print('every packet reproduces its assigned frozen source+candidate text exactly')

print('source-book10.json sha256   ', hashlib.sha256(open('source-book10.json','rb').read()).hexdigest())
print('candidate-v1.json sha256    ', hashlib.sha256(open('candidate-v1.json','rb').read()).hexdigest())
"
```

Expected hashes (also recorded in `provenance.json`):

- `source-book10.json` sha256: `15064e9ba044d246876933bcb7a3ca5cd3199e70e84e34feaeca825a6106455f`
- `candidate-v1.json` sha256: `6a5e9ef63ca6f80e020a089a94072de28c925302c0d233adb0a13a20b63d6a4f`
- Original `odyssey-original-en.json` sha256: `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07`

If hashes differ, the files were re-generated or edited after this handoff —
re-diff against this commit before trusting them as "frozen."

## What remains unverified

- **Edition provenance.** No `SOURCE.md` or Gutenberg header specific to
  `odyssey-original-en.json` was located in the repository. The Butler
  attribution is a textual identification, not a located citation. See
  `continuity.md` → "Unresolved source issues" and `provenance.json` →
  `edition_source_attribution`.
- **Fidelity of the candidate itself.** This pilot only covers drafting and
  review-packet preparation (steps 1–2 of the four-step workflow being
  tested). No independent review has been run against `candidate-v1.json`.
  The self-check performed while drafting is not a substitute for that
  review and is not claimed as proof of completeness.
- **Cross-chapter continuity beyond Book 9.** The Book 9 candidate on
  `claude/upbeat-brown-cuttkn` was used only to check name/voice
  consistency (e.g., "Odysseus, noble son of Laertes," the Cyclops/Polyphemus
  reference in Eurylochus's speech), not as an authority on Book 10 content.
- **Danish/audio/registry work.** None attempted; out of scope for this
  task.

## Next action

Hand the paste-ready Opus task below to a fresh independent-review session.
That session should read each packet in `review-packets/`, follow
`review-instructions.md` exactly, save findings by paragraph ID, make no
changes to `candidate-v1.json`, and finish with an Accept /
Accept-after-corrections / Substantial-revision-required verdict plus a
statement of review coverage and limitations. Any corrections that reviewer
verifies should be applied to a new `candidate-v2.json` (not by editing
`candidate-v1.json` in place), matching this pilot's frozen-draft discipline
and the Book 9 pilot's two-round correction pattern.
