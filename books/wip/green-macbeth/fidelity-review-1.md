# Macbeth — Fidelity Review (Round 1) — STOPPED, structural blocker found

**Status: this fidelity review is incomplete by design.** A genuine
paragraph-by-paragraph comparison of `candidate.json` against
`source.json` surfaced a critical finding at step B that made it
irresponsible to continue toward a clean acceptance claim (see
`PARKED.md`). This document records what was actually checked and found
before stopping, per TRANSLATION_PROTOCOL.md's rule that a reviewer must
state exactly what they read.

## Methodology (per dispatch instructions — not a word-list checklist)

1. Read `candidate.json` in full first, blind (see
   `accessibility-review-1.md`).
2. Read `source.json` in full, chapter by chapter, in three passes
   (lines 1–400, 400–700, 700–1060 of the raw JSON), immediately
   comparing each chapter against my memory of the corresponding
   candidate chapter, not sampling.
3. For every character with more than a few lines (Witches, Hecate,
   Porter, Lady Macbeth, Macbeth, Macduff, Ross, Banquo, Malcolm, Donalbain,
   Lennox, the Doctor, the Gentlewoman, the Old Man, Lady Macduff and her
   Son, Seyton, the Murderers) I checked for a repeated verbal tic or
   catchphrase in the source (e.g. the Witches' "hail" triad, the Porter's
   "knock, knock, knock," the recurring "Fair is foul, and foul is fair" /
   "Double, double, toil and trouble" refrains, Ross's habitual "Alas" /
   formal address) and confirmed each occurrence I found in source is
   preserved in candidate.
4. Built a location-keyed proper-noun pass while reading: Glamis, Cawdor,
   Forres, Inverness, Fife, Scone, Colmekill, Dunsinane, Birnam,
   Northumberland, Siward (old and young), Seyton, Fleance, Donalbain,
   Malcolm, Menteith, Caithness, Angus, Lennox, Ross, Macduff, Hecate,
   Acheron, Golgotha — all checked in place against candidate at their
   scene location, not just counted.
5. Ran targeted rare/capitalized-token and phrase cross-references via
   Python against the raw `source.json` text for a wide set of
   distinctive lines and phrases spanning every act, to detect whether
   any large passages were silently missing from the source parse itself
   (see "Critical structural finding" below) — this is what a
   scoped/named-defect sweep would not do, and it is what surfaced the
   blocker.
6. Checked emotionally charged / violent / sexual vocabulary as I read
   each paragraph side by side (not from a pre-made list): "unseam'd him
   from the nave to the chops," "blood-bolter'd Banquo," "dash'd the
   brains out," "the smell of the blood," the cauldron ingredients list,
   "shag-ear'd villain," the killing of Lady Macduff's son on stage,
   "Turn, hell-hound, turn!," Macduff's beheading of Macbeth. None of
   these were softened in the candidate text I read.

## Critical structural finding — content missing from the locked source

While cross-referencing distinctive phrases against `source.json` (step
5 above), I confirmed that **two of the most famous soliloquies in the
entire play are completely absent from `source.json`** — not merely
paraphrased or shortened, but not present as text at all, in either
edition:

1. **Lady Macbeth's "unsex me here" soliloquy** (canonically Act 1,
   Scene 5, beginning "The raven himself is hoarse / That croaks the
   fatal entrance of Duncan..."). In `source.json` chapter 5, the text
   jumps directly from `[Exit Messenger.]` to `[Enter Macbeth.]` /
   "MACBETH. My dearest love, Duncan comes here tonight." with nothing
   in between. Confirmed by direct text search: "raven", "unsex", "Come,
   you spirits", "thick blood", "Come, thick night", and "peep through
   the blanket" all return zero matches anywhere in `source.json`.
   Macbeth's own reply to this soliloquy ("Great Glamis! worthy Cawdor!
   / Greater than both, by the all-hail hereafter!...") is likewise
   entirely absent — search for "Great Glamis", "transported", and
   "ignorant present" also return zero matches.

2. **Macbeth's "Is this a dagger which I see before me" soliloquy**
   (canonically Act 2, Scene 1, the scene's final speech, spoken alone
   after Banquo, Fleance and the Servant have all exited). In
   `source.json` chapter 8, the text jumps directly from
   `[Exit Servant.]` to `[A bell rings.]` / `[Exit.]` with nothing in
   between. Confirmed by direct text search: "handle toward",
   "heat-oppressed", "gouts of blood", "Tarquin", and "witchcraft
   celebrates" all return zero matches anywhere in `source.json`
   (the bare word "dagger" is present elsewhere in the play, e.g. Lady
   Macbeth's "I laid their daggers ready," so a naive word-count check
   would have missed this).

Both missing passages share a structural signature: each is the sole,
uninterrupted speech of one character left alone on stage, positioned as
the very last dialogue before the scene's closing stage direction/exit.
This strongly suggests a parsing failure specific to that pattern when
`source.json` was originally extracted from the public-domain text —
not a translation-stage omission, since both editions independently lack
the same content and chapter/paragraph counts still match between them
(the loss happened upstream, before either edition existed as a
paragraph-aligned pair).

**I then ran a broader sweep of ~60 other well-known lines and phrases
spanning every act and scene of the play** (the Captain's report, the
Witches' full chants, Duncan's "no art to find the mind's construction,"
Banquo's martlet speech, the Porter's whole routine, the discovery of the
murder, Banquo's ghost, Hecate's speech, the cauldron scene, Lady
Macduff and her son, the England scene, the sleepwalking scene, and every
Act 5 battle scene through Macbeth's death) — all of these are present
and intact in `source.json`. The loss appears to be confined to exactly
these two soliloquies, not a broader pattern of missing content
throughout the play, but that does not make it non-blocking: these are
arguably the two most load-bearing speeches in the entire tragedy
(Lady Macbeth's invocation of evil and Macbeth's psychological break
before the murder), and neither this lane nor the acceptance procedure
can supply text the locked source does not contain.

This is content loss in the locked source parse itself, discovered
during step B (fidelity review), not a candidate defect — directly
analogous to the Henry V precedent in this batch
(`books/wip/green-henry-v/PARKED.md`), where a missing Prologue chorus
was found to be structural source reconstruction and explicitly out of
scope for this lane. Fixing it here would mean re-parsing/re-extracting
the original public-domain text for these two passages and inserting new
paragraphs into `source.json`, which is locked and which this task
explicitly forbids editing. It would also require adding matching new
paragraphs to `candidate.json`, breaking every downstream index-based
tool (`safe_replace`, `diff_report`, `assert_only_changed`) that assumes
identical paragraph counts between source and candidate — this is
structural source reconstruction, not a repair this lane can perform.

## Candidate-introduced defects found before stopping

Two real fidelity defects were found in the material I did cross-check
(both distinct from the structural finding above, and both fixable
within this lane if this book resumes after a source fix):

1. **Erasure of a charged printed word ("Jew").** Act 4, Scene 1
   (chapter 18), Third Witch's cauldron-ingredients speech. Source: "...
   root of hemlock digg'd i' th' dark, **Liver of blaspheming Jew**, Gall
   of goat, and slips of yew ...". Candidate: "... root of hemlock dug up
   in the dark, **liver of a blasphemer**, gall of goat, and slips of yew
   ...". The word "Jew" is dropped entirely and replaced with a generic
   "a blasphemer." This is exactly the "erasure of source's own printed
   forms" defect class that recurred across Merchant of Venice, Merry
   Wives, Richard III and Romeo and Juliet in this batch. Per
   `books/AGENTS.md`: "Do not soften period language... Do not silently
   'correct' a source name, citation, or fact... reproduce the source
   exactly, even where it looks wrong." Not fixed in this round because
   the book is being parked on the structural finding above; flagged for
   whoever resumes this book.

2. **Broken joke: setup/payoff mismatch from a dropped proper name.**
   Act 2, Scene 3 (chapter 10), the Porter's speech. Source: "Who's
   there, i' th' name of **Belzebub**? ... [Knock, knock!] Who's there,
   i' th' **other devil's** name?" — the joke depends on the first devil
   being a specific named one (Belzebub), so that "the other devil"
   in the second knock reads as a callback ("this is a different
   specific devil from the one I just named"). Candidate: "Who's there,
   in the name of **the devil**? ... Who's there, in the **other
   devil's** name?" — with "Belzebub" replaced by the generic "the
   devil" in the setup, the payoff's "other devil's name" no longer
   parses as a callback; a reader has no idea what makes the second
   devil "other." This is exactly the "broken joke where setup and
   payoff use different erased words" pattern the dispatch instructions
   warned about by name. Not fixed in this round for the same reason as
   above.

No further paragraphs were exhaustively cross-checked at the same depth
as chapters 1–10 and 18 once the structural finding made a full
correction-and-acceptance pass premature; chapters 11–17 and 19–28 were
read against source (see above) for structure/completeness and the
targeted sweeps listed in the Methodology section, but not yet given the
same line-by-line fidelity scrutiny that chapters 1, 3, 10, and 18
received. **This review does not certify chapters 11–17, 19–28 as
fidelity-clean** — that work is deferred until the source's structural
completeness question is resolved, per the Henry V precedent (running a
full correction round now would risk producing a "verified clean"
record for a book whose source is known to be missing content, which is
worse than not certifying it).

## Verdict

**PARKED — structural, source-level defect, not fixable within this
lane's scope.** See `PARKED.md`.
