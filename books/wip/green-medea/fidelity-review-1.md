# Fidelity Review — Round 1 (Reviewer B / packet-based, against locked source)

**Book:** Medea (Euripides), id `medea`
**Source edition (fidelity anchor):** `books/wip/green-medea/source.json`
(= `app/public/data/editions/medea-original-en.json`, Gilbert Murray's
verse translation) — this and only this is the fidelity anchor; no other
translation of Medea was consulted.
**Candidate:** `books/wip/green-medea/candidate.json`
**Model performing this review:** Claude Sonnet 5 (claude-sonnet-5) — same
model/session as the accessibility review and as the drafting-repair pass
that will apply fixes. Not a different model.

## Coverage statement

Full non-sampled coverage. Read source and candidate side by side, chapter
by chapter, all 7 chapters, all 235 paragraphs, every paragraph individually
(not skimmed), including the paragraph immediately before and after each
working packet as context. Checked every paragraph against the full
checklist (actors, negation, causality, certainty/hedging, conditions,
omissions, additions, silent "corrections," unmodernized quotations).
Followed with a full second read-through for cross-boundary issues (see
"Whole-book re-read" below), per protocol step C.

## Blocking defects (fix required)

### D1 — Ch.1 "Prologue," paragraph 1: certainty/timing shift

- **Source:** "Not to be quite shut out from home . . . alas, / She knoweth
  now how rare a thing that was!"
- **Candidate:** "Now, locked out from any home — alas, she knows now how
  rare a thing that was."
- **Problem:** At this point in the play (Prologue, before Creon's edict
  in Ch.3), Medea has not yet been formally exiled — the Nurse is speaking
  generally about how precarious even having a home/refuge has been for
  Medea since her exile from Iolcus, not asserting she is *already*
  homeless right now. The candidate's "Now, locked out from any home"
  states a completed present fact ("locked out"), which overstates the
  source's more hedged, almost wistful phrasing and gets ahead of the
  plot (the formal exile order hasn't happened yet in the story's own
  timeline at this point).
- **Fix:** Restate without asserting a completed present exile, e.g.:
  "Not being entirely shut out from a home — alas, she knows now how
  rare a thing even that was."

### D2 — Ch.3 "First Episode," paragraph 0: unmodernized archaism

- **Source:** "And then, forsooth, 'tis they that face the call / Of war,
  while we sit sheltered..."
- **Candidate:** "And then, forsooth, they tell us they are the ones who
  face the call of war while we sit sheltered, hidden from all peril."
- **Problem:** "Forsooth" is an archaic interjection left un-translated
  inside otherwise fully modernized prose — flagged independently by the
  blind accessibility pass (Finding 1). This is Medea's own speech, not a
  quotation nested inside the source that the modernization mandate
  exempts.
- **Fix:** Drop or replace with a plain modern equivalent, e.g. "And then
  they tell us they are the ones who face the call of war..."

### D3 — Ch.5 "Third Episode," paragraph 9: tone/connotation reversal

- **Source:** "...Thy babes--though thine hardihood be fell, / When they
  cling about thy knee, / 'Twill be well!"
- **Candidate:** "Your children — however fierce your courage, when they
  cling about your knees, you will fail."
- **Problem:** In context, this is the Chorus's hopeful, sympathetic
  prediction that Medea's resolve will break when the children touch her
  — i.e. a reassurance that things will turn out all right (she'll
  relent). "'Twill be well" is affirmative/hopeful in register, matching
  every other line the Chorus speaks in this stanza (all pleading and
  reassuring). The candidate's "you will fail" reframes the same
  predicted outcome (Medea not killing them) as Medea's personal failure
  — a colder, more judgmental framing not licensed by the source's own
  word choice, and inconsistent with the Chorus's consistently
  sympathetic voice throughout this ode.
- **Fix:** Restore the hopeful register, e.g.: "...when they cling about
  your knees, it will be well."

## Non-blocking items (fixed for clarity, not fidelity)

### N1 — Ch.6 "Fourth Episode," paragraph 14: garbled clause

- **Source:** "I would not gold were spent, / But life's blood, ere that
  come."
- **Candidate:** "I would rather it were not gold spent than that — I
  would rather spend life's blood."
- **Note:** The core meaning (Medea would rather pay in blood than gold,
  darkly foreshadowing the poison plot) is preserved and the direction is
  not reversed, but the candidate's double "I would rather... than that —
  I would rather..." construction is redundant and reads as confusing
  rather than dense-but-clear. Recommended for a light clarity pass
  alongside the blocking fixes, not because it changes meaning.

## Preserved as-is (checked against source, not a defect)

- **Ch.1 "dark Symplegades" vs. source's "blue Symplegades" (paragraph
  1):** the source itself elsewhere calls the same landmark "the Dark
  Blue Rocks" (Ch.4, paragraph 1) and "the dark blue seas" (Ch.7,
  paragraph 11) around the Symplegades. "Dark" is not an invented detail;
  it is drawn from the source's own recurring description of the same
  place. Non-blocking — left as-is.
- **Ch.2 "Parodos," paragraph 3, "faith men have sworn" vs. source's
  "man's faith forsworn":** genuinely ambiguous archaic construction in
  the source; both readings point to the same oath-guardian-deity
  reference (Themis/Zeus) and neither adds or drops a claim. Non-blocking.
- **Ch.3 "First Episode," stage-direction ordering across paragraphs
  21/22 ("[Exit CREON with his suite.]" immediately followed by
  "CREON." speaking again):** independently verified this exact sequence
  exists in `source.json` itself, not introduced by the candidate — this
  was the one item the blind accessibility reviewer flagged for a source
  check (Finding 2), and the source check clears it. Left untouched, per
  the instruction never to "fix" something the source itself does.
- **Unnamed figures kept unnamed:** Medea's murdered brother is referred
  to only as "a brother" in both source and candidate throughout
  (Ch.2 paragraph 2, Ch.7 paragraph 31) — confirmed candidate never
  supplies the name (Absyrtus). No naming-gloss violations found anywhere
  in the file.
- **Long high-risk passages read at full density, no omissions found:**
  Medea's Ch.3 paragraph 0 opening speech, her Ch.4 paragraph 4 "I saved
  you" speech, the Ch.6 paragraph 29 final monologue before the
  infanticide (three separate emotional reversals — "I cannot do it" →
  the wrath-address wavering → "too late, too late" — each checked for
  correct actor/addressee and none collapsed or reordered), and the
  Ch.7 paragraph 6 Messenger's full death-of-the-princess narration (the
  single longest and most narratively dense paragraph in the book) were
  all verified clause-by-clause against source with no dropped content,
  no actor swaps, and no added claims.

## Whole-book cross-boundary re-read (step C)

Re-read the whole candidate straight through a second time after the
packet pass, watching specifically for: recurring epithets/terms used
inconsistently across chapters (Hecate, the Cyprian, the Argo, Pandion's
son Aegeus, the Symplegades), and claims set up in one chapter and paid
off in another (Medea's sharpened blade mentioned in Ch.1 and referenced
again in Ch.3; the Ch.4 Aegeus oath referenced and honored in Ch.7; the
Argo prophecy in Ch.7 paying off the Ch.1 opening curse on the Argo).
All consistent. No new defects found on the re-read beyond D1–D3/N1 above.

## Verdict

**ACCEPT WITH FIXES REQUIRED** — three blocking fixes (D1, D2, D3) plus one
non-blocking clarity fix (N1), all narrow, single-clause edits. No
re-draft needed; this is a strong, careful modern-en rendering overall.
