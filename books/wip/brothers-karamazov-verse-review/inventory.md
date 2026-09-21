# Brothers Karamazov — Targeted Verse Review

Scope: locate every genuine rhymed/metrical verse or song passage in the
live `modern-en` edition, manually verify each against
`brothers-karamazov-original-en.json`, and check for the specific failure
class flagged by Codex: rhyme-driven additions, changed imagery, or
unnecessary retained archaism. This is **not** a full-novel rewrite —
prose "thee/thou" quotations of scripture (e.g. ch. 45, 51, 69) are
excluded; they are not verse and are out of scope here.

Method: searched the source edition for song/verse/poem markers
(`sang`, `song`, `verse`, `poem`, archaic verb forms) across all 91
chapters, then manually read every hit's surrounding context to separate
genuine quoted verse from prose mentions of "poetry"/"a poem" as a topic
of conversation. Confirmed via direct paragraph-index comparison between
`-original-en.json` and `-modern-en.json`.

## Full inventory

| # | Ch. | Paragraphs | What | Verdict |
|---|-----|-----------|------|---------|
| 1 | 16 | P41 (4 lines), P43 (18 lines), P45 (echoed closing line) | Mitya's "Confession of a Passionate Heart" — quotes Schiller's "An die Freude" ("Ode to Joy") in this edition's inherited English verse translation | **NOT MODERNIZED AT ALL.** Candidate text is byte-identical to source archaic diction throughout ("fostereth," "'Tis at her beck," "hath turned," "cling for ever"). No rhyme-driven addition (nothing was touched), but fails the modernization mandate wholesale and is inconsistent with the rest of the chapter's prose, which is modernized. See "Flagged, not corrected here" below. |
| 2 | 33 | P11 (song, sung), P12 (dialogue quoting the song) | Smerdyakov's guitar song, "What do I care for royal wealth / If but my dear one be in health?", and the woman's dialogue remembering a more tender prior rendition | **DEFECT, CORRECTED.** Rhyme-driven addition replaced "health" with invented "leisure" (P11) and invented "and gay" (P12), losing the "health" concept entirely and making P11/P12 mutually inconsistent even within the modern-en text itself. See correction-ledger.md items 1-2. |
| 3 | 36 | P1 | Epigraph couplet to "The Grand Inquisitor": "No signs from heaven come to-day / To add to what the heart doth say" | **DEFECT, CORRECTED.** Retains "doth say" though the *identical* phrase is correctly modernized to "says" one paragraph later (P2, in prose) — internal inconsistency, unnecessary archaism per the failure class named in the task. See correction-ledger.md item 3. |
| 4 | 50 | P134 | Two-line fragment Mitya recites: "Glory be to God in Heaven, Glory be to God in me...." | Clean. Minor natural modernization ("Glory be to" → "Glory to"), no content change, no invented rhyme. |
| 5 | 53 | P27-40 | Satirical folk song about a "master," "gypsy," "soldier" (deliberately elided — source withholds the "two indecent lines"), and "merchant" trying to win the girls' love | Clean. Light, faithful modernization; the deliberate omission of the soldier's indecent couplet is correctly preserved (not filled in, not described further than source does). |

## Flagged, not corrected in this pass

**Chapter 16 (Schiller's "Ode to Joy" quotation, P41/P43/P45)** is the one
verse passage in this inventory left completely unmodernized — full
archaic diction throughout an 18-line stanza plus a 4-line stanza. Given
the task's instruction that this is "a targeted verse review, not a new
full-novel rewrite," and that a careful modern rendering of an 18-line
rhymed stanza (preserving Schiller's actual claims and imagery, not just
the couplet-level swaps seen in ch. 33/36) is a nontrivial drafting task
in its own right — not a mechanical fix — this is recorded here as the
clearest concrete next-batch candidate rather than drafted speculatively
under this task's pilot scope. See `PILOT-REPORT.md` in this directory
for the recommendation.

## Not verse (excluded from scope)

Scanned and manually confirmed as prose, not rhymed/metrical verse,
despite containing archaic diction or the words "verse"/"poem":
ch. 4 P7, ch. 5 P5, ch. 7 P11/13/22, ch. 8 P5/8/23, ch. 12 P35, ch. 13
P22/35, ch. 18 P60, ch. 19 P12, ch. 23 P33, ch. 29 P57, ch. 35 P28-32
(Ivan's introduction of his poem — prose framing, not the poem itself),
ch. 36 P0/2/6/8/12/17-21/24/30/36/51 (the Grand Inquisitor's prose speech
— archaic "Thou/Thee" is direct-address register for the character, a
separate documented convention, not the rhyme-driven-addition failure
class this review targets), ch. 39 P47-48, ch. 40 P126-132 (Zosima
reading/discussing Job, prose scripture quotation), ch. 41 P29, ch. 42
P43, ch. 45 P7/13 (John's Gospel, prose scripture quotation), ch. 51 P38
(Mitya's prayer — prose, "Thou/Thee" register, not rhymed), ch. 52 P200,
ch. 56 P17, ch. 61 P44, ch. 69 P40/45 (Psalm quotation, prose), ch. 71
P20/34, ch. 73 P35, ch. 77 P2, ch. 78 P71/93/95, ch. 85 P0/5, ch. 88 P9.
