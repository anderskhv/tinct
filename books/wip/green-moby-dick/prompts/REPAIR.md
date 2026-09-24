# Repair editor instructions

You are a repair editor for Tinct's Modern English (modern-en) edition of Melville's Moby-Dick. Content only. Do NOT edit candidate.json or any existing file, and do not commit. Write only round1/{BATCH}-repair.json and round1/{BATCH}-repair.md.

Workspace: /home/user/tinct/books/wip/green-moby-dick/. Read STYLE-BRIEF.md completely first, including the binding "Lead decisions" at the end, and follow it exactly.

Background: a 2026-09-11 audit found two failure modes in the live modern-en.
1. Content was deleted and replaced by fluent invented prose. This was worst in the cetological chapters, but it was also found as scattered slips in the narrative chapters: "Indian isles" became "Pacific isles"; "in their degree" was dropped; "gives no quarter in the truth" became "to the truth"; "appal" became "shake"; "butterfly cheeks" became "rosy cheeks".
2. Some paragraphs were left almost verbatim in 1851 English. In this edition, 1851 archaism (thee/thou/ye, -eth/-est, "ere", inverted syntax, obsolete words) is a defect. It needs a genuine modern rendering that keeps everything. A paragraph that is already plain modern English is kept.

The repairs in other batches also found silently softened period terms, dropped footnote asterisks and changed names; see the lead decisions. Short length alone does not prove loss, and long paragraphs can hide loss or invention. Establish defects only by paired reading.

Method:
1. For each paragraph, print source and candidate with `python3 /tmp/claude-0/-home-user-tinct/4842ad26-bf59-5bfd-abcc-9745fd551e61/scratchpad/show.py CH.0-N`, or load the JSON yourself. Read the source paragraph in full, then the candidate in full.
2. Decide KEEP or REPAIR using the brief's defect table. Do not rewrite for taste. For a REPAIR, write a complete new paragraph that renders the full source content in clear modern English. Keep the correct existing modern wording where possible. Preserve technical distinctions, physical descriptions, arguments, examples, qualifications, uncertainty, humour, metaphors, register, dialogue voice, allusions and names. Brief, accurate glosses are allowed. Never turn speculation into fact or add conclusions.
3. Self-check every repair:
   - Go through the source sentence by sentence and confirm every clause is represented.
   - Go through your text and confirm nothing is added beyond the allowed glosses.
   - Confirm paragraph N starts with the content of source paragraph N.
   - Check that no curly quotes, underscores, "harpooneer" or archaic pronouns remain.
4. Write round1/{BATCH}-repair.json in the brief's format:
   - role "repair"
   - batch "{BATCH}"
   - reviewed = EVERY coordinate in scope
   - items = the repairs, each with severity, a category list, a specific reason quoting the key source phrases, and the full "new" text
5. Write round1/{BATCH}-repair.md with:
   - counts (reviewed / repaired / kept)
   - a table of repaired ids with one-line reasons
   - notable kept-as-is decisions
   - glossing decisions
   - open source questions (don't block on them)

Validate the JSON loads and that every id exists. Reply in under 120 words.
