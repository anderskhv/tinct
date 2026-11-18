# Editorial fixes: alice-in-wonderland modern-en

Applied to `app/public/data/editions/alice-in-wonderland-modern-en.json` (chapter:paragraph, 1-based, located by text match). Counts unchanged (12 chapters, 789 paragraphs).

- 12:71
  - before: She imagined Alice gathering
  - after: She imagined her sister gathering
- 12:63
  - before: “Who’s afraid of you?” Alice said.
  - after: “Who cares about you?” Alice said.
- 11:41
  - before: almost everything twinkled—except the March Hare said—”
  - after: almost everything twinkled—but the March Hare said—”
- 10:26
  - before: The farther off from England, the nearer you’re to France—
  - after: The farther from England, the nearer to France—
- 7:20
  - before: “In your case it _does_,” the Hatter said.
  - after: “It _is_ the same thing with you,” the Hatter said.
- 7:16
  - before: That’s the same thing, isn’t it?”
  - after: That’s the same thing, you know.”
- 7:15
  - before: “Then say what you mean,”
  - after: “Then you should say what you mean,”
- 7:66
  - before: every word you two said.”
  - after: every word you fellows were saying.”
- 9:3
  - before: so mean about giving it to us, you know
  - after: so mean about giving it, you know
- 6:18
  - before: She opened the door herself and walked in.
  - after: She opened the door and walked in.
- 4:18
  - before: “Now, Pat, tell me what that is in the window.”
  - after: “Now tell me, Pat, what’s that in the window?”
- 1:3
  - before: nothing _so_ extraordinary about that. Alice did not even find it _particularly_ strange
  - after: nothing _very_ remarkable about that. Alice did not even find it _very_ strange
- 1:8
  - before: not a _particularly_ good chance
  - after: not a _very_ good chance

Notes:
- 4:5: the source emphasis (`_something_`) is already preserved in the modern text; no change needed.
- 1:8 (not in the review list): same `_very_` emphasis shift as 1:3 (`_particularly_`); restored `_very_`.
- 1:16 (`_would_` -> `_refused_`), 4:15, 4:24, 4:33, 4:40 have emphasis changes that were not in the review list; left as is.

# Independent editorial review fixes — 2026-10-02

Applied to the live package paths (chapter:paragraph, 1-based). Counts unchanged (12 chapters, 789 paragraphs per edition).

Edition text:
- modern 12:45, 12:46 — verse restored verbatim from the original (metre and 4-space indents), consistent with 12:41–44.
- modern 10:25, 10:26, 10:59, 10:70 — verse restored verbatim, like every other poem in the book. Supersedes the 10:26 entry above.
- 4:25 — original-en emended “Shy” → “Why” (source variant; see `SOURCE.md`); modern now reads “Why, they do seem to leave everything to Bill!”
- modern 12:20 — “It’s the oldest rule in the book,” the King said.
- modern 12:71 — clarified that the little sister is Alice: “Finally she pictured how Alice, this same little sister of hers, would one day be a grown woman… She imagined the grown-up Alice gathering…” (adds two `alice` mentions in the character asset; no sister binding).
- modern 5:18 — restored “Keep your temper”.
- modern 4:20 — restored “you goose”.

Companion copy:
- Onboarding `whyItMatters[0]` — misattribution fixed: “The Hatter insists that meaning what you say is not the same as saying what you mean. The Gryphon explains that lessons are so called because they lessen.” (7:17, 9:88).
- Onboarding `about` and library preface — “a lesson becomes an accusation” → “a nursery rhyme becomes an accusation” (11:12). Preface remains verbatim `about` + newline; `release/manifest-entry.json` hash/word count updated.
- Intro preface ¶1 — “Alice is bored; her sister’s book has no pictures or conversations.”
- Threads: `alice` ch2 “grows so tall that her head hits the ceiling”; `white-rabbit` ch8 the Duchess news comes as Alice joins the procession, before the game; `two` ch8 “He begins to explain to the Queen when she demands what they have been doing.”

## Verse exemption — identical-long-paragraph gate

Policy decision: verse is reproduced verbatim in modern-en, never paraphrased to satisfy `classify-modern-en.py`. Carroll’s poems are parodies whose metre, rhyme and wording are the joke and are quoted later in the text (e.g. 12:41–46 as trial evidence); a modern rewording destroys them and makes the edition inconsistent (earlier only six of 31 verse paragraphs had been reworded, solely to pass the gate).

With all verse verbatim, the unchanged classifier reports `identical long paras: 31/546 = 5.7%` (whole book) and `16/205 = 7.8%` (chapters 9–12) and therefore prints GATE FAIL / exit 1. Every one of those 31 identical paragraphs is a lineated verse block or, at 2:3, the lineated parcel address (2:3, 2:11, 2:12, 3:34, 5:27–34, 6:36, 6:40, 7:53, 10:24–26, 10:58–59, 10:69–70, 10:76–77, 11:12, 12:41–46). Excluding the 31 verse paragraphs, identical prose is **0/515 = 0.0%**. All other gate measures pass (weighted similarity 0.532, light/mechanical 0/12, wrapped scaffolding 0, truncated quotations 0). The identical-paragraph criterion is therefore accepted as met under this documented verse exemption. The classifier was not modified (tool changes belong to Codex); a verse-aware exclusion in the tool would be the clean follow-up.
