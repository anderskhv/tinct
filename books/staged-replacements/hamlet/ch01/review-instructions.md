# Independent Review Instructions — Hamlet, Act 1 Scene 1

Give this exact text to the independent reviewer, unmodified.

---

You are independently reviewing a proposed modern-English reading edition of
Shakespeare's Hamlet, Act 1 Scene 1, against its supplied source: the served
`hamlet-original-en.json` (Project Gutenberg ebook #1524's text), one
paragraph per speech, stage direction, or heading. Read `../GLOSSARY.md`
first: it fixes the renderings of archaic grammar (thou/thee/thy →
you/your, 'tis → it's, hath → has, dost/didst/art → do/did/are, -'d
participles spelled out) and of period terms and titles established in this
scene (the Dane; liegemen → loyal subjects; partisan → spear; sledded
Polacks → sledded Poles; russet mantle → dressed in reddish-brown;
Neptune's empire → the sea; climatures → lands; moiety competent → an equal
portion; shark'd up → gathered; resolutes → lawless men). A glossary
rendering used consistently is not a finding; an unexplained departure from
it is. Read `continuity.md` next: it records the per-paragraph decisions,
two open judgment calls (C01-P028 "Tush, tush" rendered once as "Nonsense";
C01-P039 "usurp'st" rendered "take on" rather than "seize"), and confirms no
base-text defects were found in this scene.

Review each packet carefully. Neighboring context is supplied to help
interpret the assigned paragraphs. For every assigned paragraph, return
either specific findings or "No material issue found."

Check:

- The argument and narrative sequence: the changing of the guard and the
  password exchange (C01-P001–C01-P019); Marcellus's account of the Ghost
  seen twice before and Horatio's skepticism (C01-P020–C01-P030); the
  Ghost's first appearance and Horatio's challenge to it (C01-P031–C01-P044);
  the aftermath and Horatio's confirmation that it looked like the dead King
  in the very armor he wore against Norway (C01-P045–C01-P050); Marcellus's
  question about the reason for the war preparations and Horatio's full
  account of the elder Hamlet's combat with Fortinbras of Norway, the
  compact, and young Fortinbras's mustering of a mercenary force
  (C01-P051–C01-P053); Horatio's Rome/Julius Caesar comparison
  (C01-P054–C01-P055); the Ghost's second appearance, Horatio's direct
  appeal to it, and its silent departure at the cock's crow
  (C01-P056–C01-P065); Horatio's and Marcellus's folk explanations of cocks
  and the Christmas season (C01-P066–C01-P068); the decision to tell young
  Hamlet (C01-P069–C01-P071).
- Distinct character voice: Francisco and Barnardo plain and clipped;
  Horatio measured, learned, doing most of the scene's explaining;
  Marcellus urgent and questioning. Flag anywhere the candidate flattens
  these into one uniform register.
- Every image kept, not replaced by an explanation: the star westward from
  the pole; the sledded Poles on the ice; the graves standing empty and the
  shrouded dead in Rome's streets; stars trailing fire and dew of blood; the
  moon sick with eclipse; the cock as trumpet to the morn; the wandering
  spirit hurrying to its confine; the bird of dawning singing all night; the
  morning dressed in reddish-brown walking over the dew.
- Qualifications, negation, and sequence in the longer speeches, especially
  Horatio's Fortinbras history (C01-P053) and the Rome comparison
  (C01-P055) — check nothing is dropped, reordered, or added.
- Whether the two flagged judgment calls (C01-P028, C01-P039) should stand
  or be corrected, and why.
- Whether "usurp'st" → "take on" (C01-P039) loses the sense of an
  illegitimate claim on the hour, and whether "seize" would serve better.
- Stage directions: every one of the eight in this scene must be copied
  verbatim from the source into the candidate, with no rewording.
- Missing content and unsupported additions, including any modern gloss not
  licensed by `../GLOSSARY.md` or `continuity.md`.
- Remaining archaic vocabulary or syntax that would obstruct a general
  modern reader, beyond what `../GLOSSARY.md` already addresses.
- Whether any line already in plain modern English (e.g. "Not a mouse
  stirring", "Who's there?") was needlessly altered.
- Whether suggested corrections preserve natural spoken rhythm and the
  source's meaning; this is verse-derived dialogue, not narrative prose, so
  a correction that reads as flat exposition is itself a finding.

For each finding, provide:

- Stable paragraph ID (C01-P001 … C01-P071).
- Short exact source and candidate quotations.
- The precise difference and why it matters.
- Severity: Must fix / Worth improving / Optional preference.
- The smallest proposed correction.
- Confidence and any plausible alternative reading.

Do not invent objections to fill a quota. Do not equate different wording
with an error. Do not claim a phrase came from another modernization (e.g.
No Fear Shakespeare) unless verified against that text. Word and paragraph
counts do not prove semantic completeness.

Save findings by paragraph ID under `review/`. Make no changes to
`candidate-v1.json`.

After reviewing every packet, read the full candidate continuously
(`candidate-v1-readable.md`) for voice, pacing, verse rhythm, terminology,
and stage-direction placement. Report any additional chapter-level
findings.

Finish with: Accept / Accept after corrections / Substantial revision
required. State review coverage and limitations. Do not assign a numerical
score or claim that no errors can remain.
