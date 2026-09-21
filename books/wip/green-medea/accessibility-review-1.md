# Accessibility Review — Round 1 (Reviewer A / blind pass)

**Book:** Medea (Euripides), id `medea`
**Reviewed:** `books/wip/green-medea/candidate.json` (modern-en), all 7 chapters
**Model performing this review:** Claude Sonnet 5 (claude-sonnet-5), same
session/model as drafting-repair pass. Not a different model.

## Coverage statement

Read the entire candidate file start to finish, all 7 chapters (Prologue,
Parodos, First Episode, Second Episode, Third Episode, Fourth Episode,
Exodos), all 235 paragraphs, in full — no sampling. I was not shown
`source.json` or any drafter notes before or during this pass.

## Findings

### 1. Archaic word left unmodernized — Chapter 3 ("First Episode"), paragraph 0

> "And then, **forsooth**, they tell us they are the ones who face the call
> of war while we sit sheltered, hidden from all peril."

"Forsooth" is a period/archaic interjection that survived into otherwise
modern prose around it. A contemporary reader will either stumble on it or
read it as unintentionally comic/mock-archaic, which works against the
otherwise plain, direct register of the rest of Medea's speech. This is the
one clearly un-modernized word I found in the whole file (I ran a
sweep for other stock archaisms — "thee/thou/thy/hath/doth/wherefore" etc.
— across the full text; all other hits were false positives, ordinary words
like "though," "everywhere," "somewhere" that happen to contain the
substring). Flag for fidelity review to confirm the underlying source
meaning ("and yet ...") before proposing a fix, since the surrounding
clause needs to read naturally with whatever connective replaces it.

### 2. Possible staging inconsistency — Chapter 3, paragraph boundary 21/22

Paragraph 21 ends with the stage direction "[Exit CREON with his suite.]"
attributed inside a MEDEA-led paragraph, and paragraph 22 immediately opens
with "CREON. I am no tyrant..." — i.e., Creon appears to exit and then
speak again without a re-entrance direction. A first-time reader will be
briefly confused about whether Creon has left the stage. I have not checked
whether this placement is inherited from the source's own paragraph/stage-
direction layout (very possible for this kind of translated verse-drama
text) — flagging for the fidelity pass to check against `source.json`
rather than treating it as a drafting defect on my own say-so.

## What reads well

- The two-hander stichomythia exchanges (Medea/Creon in Ch.3, Medea/Aegeus
  in Ch.4, Medea/Jason in Ch.7) are crisp and easy to follow line by line —
  good rhythm, no padding.
- Medea's long set-piece speeches (Ch.3 para 0, Ch.4 para 4, Ch.6 para 29)
  are dense but genuinely readable: the syntax is rebuilt into ordinary
  clause order even where the emotional content is layered. I did not find
  choppy, mechanically-chopped prose anywhere in the file — long sentences
  read as long sentences should, with real connective tissue, not a string
  of short fragments standing in for modernization.
- Mythological/classical proper nouns (the Argo, the Symplegades, Pelias,
  Hecate, the Cyprian, Erechtheus, Cephisus, Pandion) are used the way the
  genre requires — as period color and allusion, not as load-bearing plot
  information a reader must decode to follow the story. None of them
  obstruct comprehension of what is actually happening on stage, so I am
  not flagging them as accessibility defects; a general reader can follow
  Medea's plot and reasoning without knowing precisely who Erechtheus was.
- Dialogue attribution and turn-taking (NURSE/ATTENDANT, CHORUS
  subdivisions A/B/C/D, SOME WOMEN/OTHERS) is easy to track throughout.

## Overall verdict

**Substantially accessible.** One concrete wording fix needed (the
"forsooth" archaism) and one staging/attribution point that needs a
source check before being called a defect at all. Nothing else in the
235-paragraph candidate reads as archaic, overloaded, or mechanically
choppy to a first-time contemporary reader.
