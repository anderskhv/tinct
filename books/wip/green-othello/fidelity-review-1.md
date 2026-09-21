# Fidelity Review 1 — Othello (`othello`, modern-en)

**Steps B and C of the acceptance procedure**, done together in this pass:
(B) full paragraph-by-paragraph comparison against `source.json`, every
chapter, not sampled; (C) a whole-book re-read afterward for
cross-boundary/recurring-term issues, including a dedicated case-sensitive
proper-noun/epithet consistency sweep.

## What was read

`source.json` and `candidate.json` compared paragraph-for-paragraph, all
1,391 paragraphs across all 15 chapters, printed side by side and read in
full (not just tripwire-flagged spots). Full diffs were produced and read
for chapters 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 (every chapter);
chapter 5 (2 paragraphs) was read in full as part of the initial candidate
read and confirmed word-for-word faithful.

## Structural checks (pre-review)

- 15 chapters in both files, all real Act/Scene units (no apparatus,
  editorial-note, or scene-crosswalk chapters). Apparatus-pattern scan
  (`SCENE`, `SCENA`, `Transcriber`, `Pope`, `Rowe`, `Hanmer`, `Capell`,
  `Collier`, `Ff`, `F1`-`F4`, `conj.`, `om.`) returned zero hits in either
  file.
- 1,391 paragraphs in both files; exact per-chapter paragraph-count match;
  paragraph order locked; no empty/whitespace-only paragraphs.
- Speaker-tag set and per-tag occurrence counts match **exactly** between
  source and candidate, including the case-sensitive ALL-CAPS form (23
  distinct tags, e.g. `OTHELLO` 273, `IAGO` 272, `DESDEMONA` 165, `EMILIA`
  103, `CASSIO` 111 — every count identical). This was checked specifically
  because a prior book in this batch (Bacchae) missed the all-caps
  speaker-tag form of a name after fixing only the mixed-case form.

## Word-count ratio tripwire

Ran `content_edit_helpers.word_count_ratios` per chapter. Only 6 paragraphs
in the whole book fell outside the 0.7–1.6 ratio band, all short
one-to-two-line exchanges (e.g. "Say you?" → "What did you say?"; "Why, I
pray you?" → "Why, please?"). Each was read directly against source: all
are faithful, proportionate modernizations of very short lines, not
truncation or padding. No further action needed.

## Targeted sweeps for this batch's documented recurring failure classes

- **Name/spelling "correction," including case-sensitive/short forms.**
  Found and fixed one instance: Ch9 ¶26, source's affectionate short form
  "sweet Desdemon" (used only here and once more, at Ch15 ¶161's "O
  Desdemon! Dead, Desdemon!") had been silently normalized to "sweet
  Desdemona" in the candidate. The candidate correctly preserved the short
  form at Ch15 ¶161 but not at Ch9 ¶26 — an inconsistent, partial
  "correction" of the exact kind this batch has repeatedly hit. Fixed (see
  Corrections below).
- **Imported wording from another edition/translation.** Checked the two
  best-known textual-crux lines in this play for imported emendations:
  "base Judean" (Ch15 ¶190) — a famous F1/Q1-adjacent crux where some
  editions substitute "Indian" — candidate correctly keeps source's own
  "Judean," not the "Indian" variant. "Chrysolite" (Ch15 ¶97) — kept as-is,
  not modernized to a different gemstone name. No imported wording found
  anywhere else in a full read.
- **Glosses naming what source leaves ambiguous.** No instance found of the
  candidate naming/identifying anything (a person, a fact) that the source
  leaves deliberately unnamed. The play doesn't have this kind of
  deliberate withholding in the way some other texts in this batch did.
- **Softened violent/sexual/frank content.** Specifically checked (word for
  word against source): "thick-lips" → "thick-lipped one" (Ch1 ¶9); "an old
  black ram / Is tupping your white ewe" → "an old black ram is mounting
  your white ewe" (Ch1 ¶20, full force kept, not softened to e.g.
  "approaching"); "cover'd with a Barbary horse" → "covered by a Barbary
  stallion" (Ch1 ¶31); "making the beast with two backs" → preserved
  verbatim (Ch1 ¶33); "Cassio did top her" → "Cassio lay with her" (Ch15
  ¶93, direct, not euphemized further); the willow-song and Emilia's
  closing speech on infidelity (Ch13) — full frankness preserved
  throughout, nothing diluted. No softening found anywhere.
- **Reversed meaning/direction.** Found and fixed one instance: Ch9 ¶172,
  Iago's vow to Othello — source's "and to obey shall be in me remorse,
  / What bloody business ever" (Elizabethan "remorse" = pity/compunction;
  Iago is calling obedience an act of pity, ironically, given what follows)
  had been rendered as "**remorseless**" in the candidate — the literal
  antonym of the source word, reversing the line's sense from "an act of
  pity" to "without pity." Fixed (see Corrections below). No other
  reversed-meaning, negation-flip, or actor-misattribution defects found in
  the full read.
- **Inconsistently-rendered recurring fixed epithets/phrases.** Ran an
  occurrence-location map (not just totals) for every major proper noun
  (Moor, Desdemona, Cassio, Iago, Cyprus, Venice, Othello, Emilia, Bianca,
  Roderigo, Brabantio, Montano, Gratiano, Lodovico) and diffed
  location-by-location, not just count-by-count, specifically because a
  matching total count can still hide one dropped + one added occurrence
  in different places. Two archaic terms are **consistently** modernized
  throughout the whole book and confirmed not to be meaningful variants:
  "ancient" (military rank) → "ensign," all 9 occurrences, source itself
  never uses "ensign"; "napkin" (period synonym for handkerchief) →
  "handkerchief," all 3 occurrences, alongside source's other 27
  "handkerchief" occurrences — these are period-vocabulary synonyms for the
  identical referent, not a deliberately meaningful spelling variant like
  "Antonius"/"Antony" was in Julius Caesar, so consistently modernizing
  them is correct, not an error.
- **Corrected deliberate malapropisms/mangled dialect.** The Clown's
  wordplay ("thereby hangs a tail" / "Whereby hangs a tale, sir?"; "to
  invent a lodging... would be to lie in my own throat") is preserved
  verbatim/pun-intact throughout Ch7 and Ch10. No malapropism erasure
  found.

## Location-based proper-noun sweep: minor pronoun-disambiguation instances
(reviewed individually, judged non-blocking)

A handful of paragraphs render a source pronoun ("he," "his," "him") as the
character's name for clarity, where Shakespeare's verse tracks a fast
pronoun-antecedent chain across several *different* named characters in one
sentence (a chain modern prose punctuation doesn't carry as automatically
as verse line-breaks do):

- Ch1 ¶4: "of whom his eyes had seen the proof" → "whom **Othello's** own
  eyes have seen tested." Referent is unambiguous in context (the Moor,
  established two lines earlier); naming him removes a real ambiguity risk
  in prose (the immediately prior clause is also about Cassio).
- Ch1 ¶10: "make after him" → "Go after **Othello**." The referent is
  already Othello elsewhere in the same short speech; naming him here
  avoids the reader losing the thread across "her father... rouse him...
  make after him."
- Ch3 ¶95 (in the original numbering, this is Iago's soliloquy on his plan):
  "That he is too familiar with his wife" / "He hath a person..." →
  "that **Cassio** is too familiar with his wife" / "**Cassio** has the
  looks..." — same referent, named for clarity since "Othello's ear" had
  just been mentioned in the same sentence and an unlabelled "He" risks
  misreading.
- Ch6 ¶124: "I'll pour this pestilence into his ear" → "into **the Moor's**
  ear." Same referent (established one clause earlier as "the Moor"),
  named for clarity.

In every case, this is the same real character already named or clearly
established moments earlier in the same speech, not a new interpretation,
not a name imposed on an ambiguous or unnamed figure, and not a fact the
source withholds. Judged non-blocking: legitimate prose disambiguation of
what verse line-breaks and immediate proximity make clear without
needing to, consistent with `TRANSLATION_PROTOCOL.md`'s instruction to
rebuild difficult syntax into ordinary vocabulary. Not corrected.

## Corrections applied this round

1. **Ch9 ¶26 — name-form "correction."** `sweet Desdemona` → `sweet
   Desdemon`, restoring source's own affectionate short form (used
   consistently with source's other instance at Ch15 ¶161).
2. **Ch9 ¶172 — reversed meaning.** `remorseless` → `an act of pity`,
   restoring the sense of source's "remorse" (Elizabethan usage: pity/
   compunction), which the candidate had rendered as its literal opposite.

Both applied via `content_edit_helpers.safe_replace`, each targeting the
single exact paragraph, verified with `validate_structure` (chapter number,
paragraph count/order unchanged) and a before/after `diff_report` (exactly
the 2 intended paragraph indices changed across the whole 1,391-paragraph
book, nothing else touched, no new ratio outliers). Both fixed paragraphs
were then independently re-read against `source.json` fresh (not trusting
the fix's own stated rationale) — both match source's wording and intent.

## Whole-book re-read (Step C)

After applying the two fixes, re-read the whole book once more for
cross-boundary relationships and recurring terms/images: the handkerchief's
provenance and journey (Emilia → Iago → Cassio's chamber → Bianca), the
willow-song's foreshadowing (Ch13) paying off in the final scene's diction
("Willow, willow, willow," Ch15 ¶154), and the "green-eyed monster" /
jealousy imagery Iago introduces (Ch9 ¶74) tracked against Othello's later
self-description. No further defects found; both corrections confirmed
still faithful in context.

## Verdict

2 defects found and fixed (1 name-form correction, 1 meaning reversal).
No other blocking defects found across a full, non-sampled read of the
whole book. No softened frank content, no imported wording, no
malapropism erasure, no dropped content.
