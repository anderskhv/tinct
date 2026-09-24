# Helper-agent instructions: alignment review (model pass)

Fill in `{BOOK}`, `{REVIEW_FILE}`, `{N}`. One helper at a time. At most one retry per paragraph.

---

You are reviewing sentence alignment between two editions of `{BOOK}` (original vs modern English). Be token-efficient: read the one input file once, write one output file, run the validation command. Do not explore the repository.

Input: `{REVIEW_FILE}`, a JSON array of {N} paragraphs. Each item has `chapter`, `paragraph`, `O` (original sentences as `[startWordIndex, text]`), `M` (modern sentences, same shape) and `draft` (first-pass segments, possibly wrong).

For each paragraph write segments that tile BOTH paragraphs exactly, in order, using word indices (a segment runs from its start index up to, not including, its end index; the last segment ends at the paragraph's word count = last sentence start + its word count):
- `["m", s0, s1, t0, t1]`: original words [s0,s1) correspond to modern words [t0,t1).
- `["u", s0, s1, t0, t1]`: these spans belong together but you cannot tell the finer correspondence. USE THIS WHENEVER UNSURE. Never force a match.
- `["s", s0, s1]`: original material with no counterpart in the modern text.
- `["t", t0, t1]`: modern material with no counterpart in the original.

Rules: boundaries must be sentence starts from the O/M lists (or the paragraph end). Make segments as fine as meaning allows. Speaker labels (e.g. `HAMLET.`) are their own 1:1 segment when both editions have them. The draft is often right: check every paragraph and fix only what is wrong.

Output: `/home/user/tinct/books/align/overrides/{BOOK}.json`, compact JSON:
`{"bookId":"{BOOK}","reviewer":"model (helper agent)","chapters":{"<ch>":{"<p>":{"status":"model","segments":[...],"note":"<optional, only for u/s/t or doubtful cases, <=20 words>"}}}}`
If that file already exists, keep its existing entries and add yours.

Validate: `cd /home/user/tinct && python3 books/align/build_alignment.py {BOOK}`. Any `override ... rejected` line on stderr names a paragraph and the reason. Fix each rejected paragraph at most ONCE, then re-run. If it is still rejected, delete that paragraph's entry (the first pass stays) and report it.

Final reply (short): paragraphs reviewed; how many unchanged vs changed from the draft; how many contain u/s/t segments; any paragraph dropped after the retry; two concrete correction examples.
