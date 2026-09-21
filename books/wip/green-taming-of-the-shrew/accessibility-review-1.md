# Accessibility Review — The Taming of the Shrew, modern-en

Reviewer: fresh blind read of `candidate.json` only (no source.json, no
drafter notes consulted for this pass).

**Coverage:** All 12 chapters (Act 1 Scene 1 through Act 5 Scene 2), all
1021 paragraphs, read in full sequentially, not sampled. Coverage verified
by script (`python3 -c "..."` paragraph count = 1021, matches source
exactly — see acceptance record).

## Overall verdict: substantially accessible

The candidate renders Shakespeare's verse and prose into clear, idiomatic
modern English without flattening the play's wit. Dialogue keeps its
comic rhythm (Grumio/Petruchio's Act 1 Sc.2 knocking exchange, the tailor
scene in Act 4 Sc.3, the wager scene in Act 5 Sc.2). Archaic vocabulary
("Gramercies," "peat," "hilding," "crack-hemp," "backare," "cony-catching"
etc.) is consistently rebuilt into plain contemporary wording. Latin/
Italian tags (`Mi perdonato`, `Basta`, `Con tutto il cuore ben trovato`,
`cum privilegio ad imprimendum solum`) are left untranslated as the
source leaves them, which is correct — they are meant to be
half-opaque flourishes characters use to show off, and the surrounding
English carries the sense.

## Specific accessibility notes (paragraph indices refer to candidate.json)

- **Act 2 Sc.1 (ch3), wooing-match wordplay (¶75-127):** the Kate/cates,
  moveable/joint-stool, wasp-sting, and "should be/should buzz" exchanges
  are genuinely dense double-entendre even in modern dress. A reader will
  still have to slow down here, but that's inherent to the scene (a
  rapid-fire verbal fencing match) — no accessibility fix would help
  without gutting the wordplay itself, so this is a case where the
  irreducible difficulty is the point.
- **Act 4 Sc.1 (ch6), Grumio/Curtis "cold world" banter (¶1-41):** heavy
  wordplay on "fire"/cold and status ("office," "duty"). Readable, but a
  first-time reader may need to reread once. Not a defect — this is a
  deliberately fast, punning exchange in the source too.
- **Act 4 Sc.3 (ch8), tailor scene (¶59-61):** Grumio's "face"/"brave"
  argument with the tailor was rendered as "trim"/"face" in the
  candidate, swapping which English word carries which of the two source
  puns. The double meaning (sewing term vs. confrontation) survives, but
  a reader comparing closely to a modern-dress performance may notice the
  swap. Flagged for the fidelity reviewer as a borderline case, not an
  accessibility defect on its own.
- **Induction fragment (ch1 ¶74-78):** the "Presenters" / Christopher Sly
  material that survives in this source is only a few lines (the rest of
  the Induction is not present in this source text at all — see fidelity
  review for the structural note). The lines present ("Yes I am, by Saint
  Anne," "an excellent piece of work, madam lady") read clearly as a
  half-drunk audience member's comment; no accessibility issue.
- Latin/legal terms ("Imprimis," "ergo," dowry/jointure/specialities
  language in the marriage-negotiation scenes) are used precisely and in
  context that makes their meaning inferable; no glossing was added, none
  seemed necessary.

## What reads unusually well

- The Act 1 Sc.1 debate between Lucentio and Tranio about philosophy vs.
  pleasure reads naturally and keeps its argumentative shape.
- Petruchio's "kill a wife with kindness" falconry speech (ch6 ¶87) is
  fully clear in modern English while keeping every image (falcon, lure,
  haggard, kites).
- Katherina's final speech (ch12 ¶101) reads as a real, coherent piece of
  rhetoric start to finish — no compression, no softening, no added
  moralizing framing around it.

No paragraph was found unreadable or requiring a structural fix. This
review's findings were handed to the fidelity reviewer for verification
against source; see `fidelity-review-1.md`.
