# Shared rules for Frankenstein / Jekyll modern-en work (read fully first)

Governing documents (read): /tmp/claude-0/-home-user-tinct/4eeb8e93-ff7e-5b9c-82c7-2f093a32c368/scratchpad/TP.md
(translation protocol), /home/user/tinct-fj/books/prompts/modern-en-draft-prompt.md,
/home/user/tinct-fj/books/AGENTS.md section "Modern English".

Files are JSON {"chapters":[{"number":N,"title":...,"paragraphs":[...]}]}. Refer to
paragraphs as (chapter number, 0-based paragraph index). Source = locked fidelity anchor.

Core rules:
- Faithful modern reading edition: preserve every claim, image, action, condition,
  quantity, name, hedge, deliberate repetition, irony, suspense and deliberate ambiguity.
  Never invent detail or interpretation. Never import wording from other editions.
- Never silently "correct" source names/facts to standard forms. Reproduce proper nouns
  as the source prints them.
- Preserve good existing prose. Only change what is demonstrably wrong (omission,
  addition, meaning change, actor swap, negation/causality/certainty change),
  genuinely hard to follow when read ALOUD by a first-time adult listener, or an
  unfamiliar reference that stops comprehension (add a brief, accurate gloss that a
  reference work would confirm; gloss once, at first need).
- Optional stylistic preferences are NOT defects. Do not churn.
- Length is not evidence. A shorter paragraph is fine if nothing is lost. Do not
  mechanically restore length.
- Character voice: keep it. In Frankenstein do NOT formalize the Creature's speech or
  remove its contractions merely for formality. BUT the narrators' own names/epithets
  for the Creature (fiend, daemon, wretch, monster, devil, being, creature...) are
  deliberate characterization; if the source says "the fiend" or "the daemon", a
  neutral substitute like "the creature" is a meaning change — flag/fix it.
- Keep paragraph count and order exactly. Never merge/split paragraphs.
- House style of the candidate (quote marks, dashes, American spelling) stays as is.

Proposal output format (when asked to propose fixes), a JSON array:
[{"chapter":N,"paragraph":i,"old":"<exact substring of CURRENT candidate paragraph, unique within it>",
  "new":"<replacement>","category":"omission|addition|meaning|epithet|aloud|reference|other",
  "blocking":true|false,"reason":"<one sentence, cite source wording>"}]
"old" must be copied exactly (character-for-character, including curly quotes and
dashes) and be as short as possible while unique in that paragraph. Verify every
"old" string programmatically with python before writing the file.
