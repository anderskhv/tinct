# Jane Eyre — Chapter 37 (Ferndean) — Round 2 Repair Notes

Second correction pass, applied after the independent adversarial reviewer's
recall-based scan (see `ch37-verification.md`) surfaced 9 paragraphs that the
round-1 word-ratio scan missed because the invented replacement text was the
same length as, or longer than, the source (so the length-ratio net let it
through). Round 1's 28 fixes are untouched. Only the 9 paragraphs below were
changed.

---

## Paragraph 6 — recognition beat / Rochester's full name

**Problem:** The chapter's central recognition moment — Jane identifying the
figure in the garden — was replaced with four invented sentences of
interiority about hesitating to reveal herself. "Edward Fairfax Rochester,"
the only full-name appearance in the chapter, was dropped entirely.

**Old:** "...Dark as it was, I recognized his strong shape and features. I
nearly revealed myself—but I held back. I was not yet ready to meet him. I
had still a thing or two to think through. I needed to prepare myself for
the shock—and to prepare him."

**New:** "...Dusk as it was, I had recognized him—it was my master, Edward
Fairfax Rochester, and no other."

---

## Paragraph 9 — kiss-on-the-brow image / "not yet"

**Problem:** Brontë's image (Jane's hope of one day daring to kiss his brow
and sealed lips) and the deliberate "not yet"/"I would not accost him yet" —
which motivates her continued concealment through the following paragraphs —
were replaced with vague, invented stage business about sensing his heartbeat
and "finding the right approach."

**Old:** "...A gentle hope blended with my sorrow. I could feel his heart was
still warm, still beating, still mighty. I was sure I could bring him
comfort. I just needed to find the right approach."

**New:** "...A gentle hope blended with my sorrow that soon I would dare to
press a kiss on that rocky brow, and on those lips so sternly sealed
beneath it—but not yet. I would not approach him yet."

---

## Paragraph 30 — dropped dialogue command

**Problem:** Rochester's imperious spoken line "Answer me—speak again!" was
deleted and replaced with an invented visual beat ("An expression of pain and
bewilderment crossed his face") that isn't in the source.

**Old:** "...'Who is this? Who is this?' he demanded, seeming to try to see
with those sightless eyes. An expression of pain and bewilderment crossed
his face."

**New:** "...'Who is this? Who is this?' he demanded, seeming to try to see
with those sightless eyes—a useless, distressing effort! 'Answer me—speak
again!' he ordered, loud and commanding."

---

## Paragraph 50 — interiority replaced with invented exterior beat

**Problem:** "the conviction of the reality of all this seized him" (his
internal realization that she is truly there) was swapped for an invented
description of his face ("A look of grateful joy broke over his worn face").

**Old:** "...He suddenly seemed to trust that I was real. A look of grateful
joy broke over his worn face."

**New:** "...He suddenly seemed to rouse himself: the conviction that all
this was real took hold of him."

---

## Paragraph 111 — dropped walk promise / invented unanswered question

**Problem:** "you shall have a walk soon" — which pays off later at paragraph
115 ("Most of the morning was spent outdoors...") — was deleted and replaced
with an invented question to a blind man ("Can you see the light?") that is
never answered anywhere in the text.

**Old:** "...There is a soft glow after it. You should feel it through the
open window. Can you see the light?"

**New:** "...There is a soft glow after it. You'll have a walk soon."

---

## Paragraph 117 — invented tail replacing Rochester's wounded reaction

**Problem:** Sits directly between two already-fixed paragraphs (116 and
118). The source's closing image — that even Jane's softened account of her
suffering "lacerated his faithful heart deeper than I wished" — was replaced
with an invented restatement of what she chose to omit.

**Old:** "...because telling him those things in full would have been
torture to him. His loving spirit could not have borne it. The hunger, the
cold, the exhaustion—I touched on them lightly, emphasizing instead my
rescue."

**New:** "...because to tell him everything would have caused him needless
pain—the little I did say wounded his faithful heart more deeply than I
wished."

---

## Paragraph 194 — setup/payoff break (feeds into paragraph 195)

**Problem:** The source ends this speech with a direct command — "Jane,
leave me: go and marry Rivers" — which paragraph 195 ("Shake me off, then,
sir—push me away. I won't leave on my own," left untouched) directly
answers. The command had been deleted and replaced with invented lines about
St. John's youth and looks, leaving 195 a non-sequitur.

**Old (ending):** "...But it's only natural enough. You said he was young,
handsome, talented. And I—what am I now?"

**New (ending):** "...But it's no use grieving. Jane, leave me—go and marry
Rivers."

Paragraph 195 itself was checked and left exactly as it was — it now follows
logically from the restored command.

---

## Paragraph 201 — dropped closing question

**Problem:** Jane's list of St. John's coldness toward her ends in the
source with a pointed question — "Then I must leave you, sir, to go to
him?" — that provokes Rochester's response in 202-203. The final two clauses
and the question were replaced with four invented sentences of padding.

**Old (ending):** "...He has no hold on my sympathy or warmth. I do not long
for his company. I am not drawn to his approval. No warmth rises in me at
his approach."

**New (ending):** "...He has no indulgence for me—no fondness. He sees
nothing attractive in me; not even youth—just a few useful qualities of
mind. Then must I leave you, sir, to go to him?"

---

## Paragraph 250 — distorted proposition + weakened supernatural cue

**Problem:** Two distinct distortions in the same paragraph:
1. Source has Jane pleading a statement about her own limit — "that I could
   scarcely endure more" — which was changed to a different claim about
   expecting mercy ("I could hardly expect mercy").
2. Source has the "Jane! Jane! Jane!" cry breaking out *involuntarily* from
   Rochester's lips — the telepathic/supernatural call that paragraphs
   251-257 depend on. The modern text made it a deliberate act ("Then I
   cried out"), undercutting that logic.

**Old (ending):** "...I admitted I deserved everything I'd endured. I could
hardly expect mercy. But I begged for it—urgently. Then I cried out: 'Jane!
Jane! Jane!'"

**New (ending):** "...I admitted I deserved everything I'd endured—but I
pleaded that I could scarcely bear any more. And the sum of my heart's whole
desire broke involuntarily from my lips in the words: 'Jane! Jane! Jane!'"

---

## Verification

Diff script (`diff_round2.py`) comparing `ch37-corrected-round2.json`
against `ch37-corrected.json` (round 1) byte-per-paragraph confirms:

```
changed indices: [6, 9, 30, 50, 111, 117, 194, 201, 250]
count: 9
```

Exactly the 9 paragraphs targeted by this round — nothing else in the 262-
paragraph file was touched, including all 28 round-1 fixes and paragraph
195 (checked, confirmed unchanged, now makes sense against the restored
paragraph 194).
