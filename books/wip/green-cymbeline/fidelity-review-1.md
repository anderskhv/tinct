# Fidelity Review 1 — Cymbeline (modern-en)

Reviewer role: independent fidelity check against `source.json`, the sole
fidelity anchor. Per `books/prompts/fidelity-review-prompt.md`.

**Coverage statement:** Every paragraph of all 29 chapters (1133
paragraphs total) was read in `source.json` and `candidate.json` side by
side, in full continuous chapter-sequential passes (source and candidate
each read completely, in the same order, cross-referenced paragraph by
paragraph against each other) — not a sampled read. Neighboring context
was inherently present throughout since each chapter was read start to
finish alongside its counterpart, rather than in isolated packets. No
chapter, scene, or paragraph was skipped. Extra, sentence-level scrutiny
was applied to: the Iachimo bedchamber scene (Ch9, Act 2 Scene 2) and the
decapitation scene and its aftermath (Ch22, Act 4 Scene 2), per the task
instructions, plus a subsequent whole-book cross-boundary re-read (see
below) with a dedicated case-sensitive sweep for every proper noun.

## Method notes

For every paragraph, checked: actors, negation, causality,
certainty/hedging, conditions, omissions, additions, silent
"corrections" of names/facts, and unmodernized quotations (verse, songs,
oaths, the soothsayer's riddle). Ran automated cross-checks alongside the
manual read:

- `classify-modern-en.py cymbeline`: weighted similarity 0.648, buckets
  1 REAL-HEAVY / 28 REAL, 0 LIGHT, 0 MECHANICAL, 0 wrapped scaffolding,
  0 truncated quotations, 1/505 identical long paragraphs (0.2%,
  well under the 5% gate). Inspection signal only — no chapters flagged
  as unmodernized.
- `content_edit_helpers.validate_structure()` run per chapter: chapter
  numbers, paragraph counts, and paragraph order all match source
  exactly for all 29 chapters. No empty/whitespace-only paragraphs.
- `content_edit_helpers.word_count_ratios()` run per chapter: 10
  paragraphs flagged as ratio outliers (all single-line
  short-utterance paragraphs, e.g. "QUEEN. Dispatch." → "QUEEN. Get on
  with it."). All 10 were individually inspected — each is a faithful,
  slightly-expanded or slightly-compressed rendering of a very short
  source line; none drops or adds content. No blocking issue.
- Proper-noun occurrence counts (both mixed-case and ALL-CAPS
  speaker-tag forms) run against `source.json` for every named
  character (Imogen, Iachimo, Posthumus, Cloten, Belarius, Guiderius,
  Arviragus, Pisanio, Cymbeline, Cornelius, Lucius, Philario, Fidele,
  Cadwal, Polydore, Sicilius, Tenantius, Cassibelan, Mulmutius,
  Euriphile, Morgan, Philarmonus, Leonatus, Dorothy, Helen, Richard du
  Champ, Sienna). Source uses "Imogen" (never "Innogen") and "Iachimo"
  (never "Jachimo") consistently throughout, in both mixed-case and
  ALL-CAPS forms. Searched `candidate.json` for "Innogen"/"INNOGEN" and
  "Jachimo"/"JACHIMO" (the two well-known textual-crux alternate
  spellings named in the task brief): zero occurrences of either in
  either case. No other name-form drift found on manual read.

## Scene-by-scene fidelity notes

**Bedchamber scene (Ch9, Act 2 Scene 2)** — read word-for-word against
source. Every explicit/erotic beat is preserved intact and unsoftened:
"Our Tarquin... softly pressed the rushes before he woke the chastity he
then wounded"; "If only I could touch! Just kiss — one kiss!"; the mole
"On her left breast... a mole with five spots"; the reference to Imogen
reading "the tale of Tereus" with the page folded at "where Philomel
gave up" (i.e. the rape of Philomela) — all rendered plainly, nothing
euphemized or removed. "I lodge in fear — though this be a heavenly
angel, hell is here" preserved as the scene's closing moral tension. No
defects found.

**Decapitation scene and aftermath (Ch22, Act 4 Scene 2)** — read
word-for-word against source. "Enter GUIDERIUS with CLOTEN's head" is
preserved as a stage direction (not softened to e.g. "Cloten's body").
Guiderius's lines are frank and unsoftened: "cut off one Cloten's head,"
"I'll throw it into the creek behind our rock... and tell the fishes he
is the Queen's son, Cloten." The later reveal ("I have sent Cloten's
blockhead down the stream") preserves the source's "clotpoll" pun
(literally "clot" + "poll"/head, playing on Cloten's own name) via
"blockhead" rather than losing the wordplay by picking a neutral
synonym. Belarius's speech ordering the body treated with princely
honor despite the killing is intact, as is the horror of Imogen waking
beside the headless body in Posthumus's clothes and mistaking it for
her husband ("A headless man? The garments of Posthumus?..."). No
softening, no dropped content, no actor/negation/causality errors found.

**Iachimo/Posthumus wager and accusation scenes (Ch5, Ch11, Ch12, Ch29)**
— the frank sexual content throughout ("tasted her in bed," "she hath
been mounted/colted by him," "under her breast... lies a mole," "found
no opposition but what he looked for should oppose") is preserved
unsoftened in every instance, matching source's directness rather than
euphemizing it. Posthumus's misogynist rant (Ch12) is rendered in full,
with every clause of the "hers, hers, hers" catalogue intact and in the
same order.

**Comic/bawdy prose (Ch3, Ch8, Ch10)** — the "son-of-a-whore"
("whoreson") insults, the "cock and capon" jokes, and Cloten's crude
threats of rape (Ch14/17's "with that suit upon my back I will ravish
her") are all preserved at full force; none diluted to a milder register.

## Whole-book cross-boundary re-read

After the packet-style pass above, reread the whole book once more
specifically for: (a) name consistency across scene/act boundaries —
confirmed stable for every character across all 29 chapters, in both
mixed-case and ALL-CAPS forms; (b) recurring images/motifs — the ring
and bracelet exchanged in Ch2 are tracked correctly through every later
reference (Ch11 wager reveal, Ch29 return); "the boy Fidele" identity is
consistently used until the Ch29 reveal; the drug/poison from Cornelius
(Ch6) is correctly referenced as the same object in Ch16, Ch22, and
Ch29's explanation; (c) a dedicated final sweep of every instance of
every major proper noun for silent standardization — none found, per
the automated counts above.

## Defects found

**None.** No blocking fidelity defects (actor swaps, negation flips,
dropped/added content, silent corrections, softened content,
unmodernized-quotation defects) were found across the full book.

**Non-blocking stylistic notes** (not fidelity defects, no action
required):
- A handful of very short single-line utterances render at a different
  word count than source (see `word_count_ratios` flags above) — all
  individually verified as faithful, natural modern equivalents of
  short archaic lines ("Sayest thou?" → "What's that you said?").
- Ch9's "Cytherea" and Ch29's "mollis aer / mulier" Latin pun are left
  as in source without an inserted gloss, since (1) they are the
  source's own words/allusions, not invented, and (2) in the case of
  the soothsayer's pun, the surrounding dialogue explicitly walks
  through the etymology itself (the scene does the glossing in-text),
  so an added gloss would be redundant.

## Verdict

**ACCEPT AS-IS.** No fixes required going into the whole-book
cross-boundary re-read documented above (folded into this same review
since no defects surfaced to necessitate a second correction round).
