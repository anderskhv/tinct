# Confessions Book 9 — Correction Log

Source of corrections: `book09-review.md` (21 findings: 1 major, 3 moderate, 17 minor).
Base file: `book09-candidate.json` (38 paragraphs, frozen). Output: `book09-corrected.json` (38 paragraphs).

Paragraph numbers below are **0-based array indices**, script-verified against the actual JSON array (valid range 0–37). Review's own numbering is 1-based (P1–P38); index = P − 1 throughout, confirmed by direct text lookup, not assumed.

**Script-verified changed indices:** `[0, 3, 5, 6, 7, 13, 14, 16, 17, 18, 23, 24, 25, 26, 27, 28, 29, 33, 34, 37]` — 20 of 38 paragraphs touched (diff run: candidate vs corrected).

---

## 1. Major (1)

### Paragraph 5 (review P6) — Nebridius tense/direction reversal
**Problem:** Candidate put Nebridius's questioning in the present tense ("asking me now for so much"), implying Nebridius, now in heaven, is currently asking Augustine questions — directly contradicted by the very next sentence ("Now he no longer presses his ear to my mouth"). Source is past-tense: Nebridius *used to* ask Augustine (when alive, in Augustine's inexperience); the present state is Nebridius now resting in God, no longer needing to ask.

**Old:** "There he lives, asking me now for so much, the very things I, in my inexperience, used to be asked about by him. Now he no longer presses his ear to my mouth,"

**New:** "There he lives — the place about which he used to ask me so many questions, inexperienced little man that I was. Now he no longer presses his ear to my mouth,"

---

## 2. Moderate (3)

### Paragraph 17 (review P18) — direction inversion (maidservant's fear)
**Problem:** "because she feared her own anger" inverts the source's sense. Source (*ne et ipsa haberet malum, quod tam sero prodidisset*): she feared getting **in trouble herself** for having sat on the information so long — not that she feared an emotional reaction of her own anger.

**Old:** "or because she feared her own anger at bringing it up so late."

**New:** "or for fear that she herself would be in trouble for bringing it up so late."

### Paragraph 28 (review P29) — softened grief passage
**Problem:** "was on the point of overflowing into tears" converts an actual overflow (which Augustine then forcibly dams) into a near-miss that never happens. Source: the tears *do* overflow; the mind forcibly dries them. Bundled with this fix: the flattened exclamation "and it was a wretched struggle for me" (source: "and woe was me in such a strife!") and the wrong connective "For when she breathed her last" (source: "But when she breathed her last" — the contrast is between Augustine's suppression and the boy's unrestrained cry, not a causal explanation).

**Old:** "a great sorrow flowed into my heart and was on the point of overflowing into tears; but at the same time my eyes, under the violent command of my mind, drank their fountain completely dry, and it was a wretched struggle for me. For when she breathed her last,"

**New:** "a great sorrow flowed into my heart and was overflowing into tears; but at the same time my eyes, under the violent command of my mind, drank their fountain completely dry, and how wretched I was in that struggle! But when she breathed her last,"

### Systemic quote-style fix (global) — single quotes → double quotes
**Problem:** Candidate used single quotes for nearly all direct quotations throughout the chapter, while `book08-accepted.json` (the established project convention) uses double quotes exclusively, and paragraph 33's hymn (the one exception in the candidate) already used double quotes correctly. Fixed as a global pass across all 38 paragraphs, not only the paragraphs the review happened to flag — confirmed via a full apostrophe scan of the candidate (see script-verified section below) that no other single-quote-as-quotation-mark usages existed outside the ones listed.

Paragraphs touched by this fix: **16, 18 (restored as direct quote, see minor below), 23, 25, 26, 27, 29.**

- **Paragraph 16** (review P17): maidservant's advice on water/wine.
  Old: `adding this useful advice: 'You drink water now, because wine is not in your power; but when you are married, and become mistresses of storerooms and cellars, you will look down on water, but the habit of drinking will remain.'`
  New: `adding this useful advice: "You drink water now, because wine is not in your power; but when you are married, and become mistresses of storerooms and cellars, you will look down on water, but the habit of drinking will remain."`

- **Paragraph 23** (review P24): the "having been"/"going to be"/"being" scare-quoted tense terms.
  Old: `or rather, 'having been' and 'going to be' do not apply to her at all, but only 'being,' since she is eternal. For 'having been' and 'being hereafter' are not eternal.`
  New: `or rather, "having been" and "going to be" do not apply to her at all, but only "being," since she is eternal. For "having been" and "being hereafter" are not eternal.`

- **Paragraph 25** (review P26): Monica's window speech.
  Old: `my mother said, 'Son, as for me, I no longer find any delight...What am I still doing here?'`
  New: same text with `"..."` in place of `'...'`.

- **Paragraph 26** (review P27): four separate quotations in the deathbed scene — "Where was I?"; "Here you will bury your mother."; "See what he says."; "Lay this body anywhere...wherever you are." All converted single → double.

- **Paragraph 27** (review P28): three quotations — "What am I still doing here?"; "Was she not afraid to leave her body so far from her own city?"; "Nothing is far from God...raise me from." All converted single → double.

- **Paragraph 29** (review P30): 'devoted' → "devoted".

- **Paragraph 18** (review P19): see minor finding below — this one required restoring the quote itself (it had been flattened to indirect speech), and was written directly in double quotes rather than converted from single.

---

## 3. Minor (17)

### Paragraph 0 (review P1) — dropped "where"
Old: "But through all those years, and out of what low and deep hiding place, was my free will summoned forth in a single moment,"
New: "But where, through all those years, and out of what low and deep hiding place, was my free will summoned forth in a single moment,"

### Paragraph 3 (review P4) — "one more hour" adds a word not in source
Old: "I let myself sit even one more hour in that chair of lies."
New: "I let myself sit even one hour in that chair of lies."

### Paragraph 5 (review P6) — added causation
Old: "that our conversion had come at such a cost to him;"
New: "that our conversion was of such a kind;"

### Paragraph 6 (review P7) — lost "whence" (spatial claim reduced to bare comparison)
Old: "You rescued my tongue, as you had already rescued my heart."
New: "You rescued my tongue from where you had already rescued my heart."

### Paragraph 7 (review P8) — "woman's body" for *habitus* (dress/bearing, not physical nature)
Old: "in a woman's body but a man's faith"
New: "in a woman's dress but with a man's faith"

### Paragraph 13 (review P14) — "our equal in grace" adds a rank claim; source (*coaevum in gratia*) is a temporal claim
Old: "We brought him along with us, our equal in grace, to be raised in your discipline;"
New: "We brought him along with us, of the same age as us in grace, to be raised in your discipline;"

### Paragraph 14 (review P15) — "a great share" demotes Monica from the leading role (*primas partes*)
Old: "bearing a great share of that anxiety and those vigils, lived for prayer."
New: "bearing the leading part in that anxiety and those vigils, lived for prayer."

### Paragraph 18 (review P19) — direct speech flattened to indirect
Source gives Monica's advice as a direct quotation. Candidate reported it indirectly, losing the one place before her deathbed where Monica speaks in her own words.
Old: "she would instead blame their tongues, giving them, as if in jest, serious advice: that from the moment they heard the marriage contract read aloud to them, they should think of it as a bond of service, by which they had become servants — and so, remembering their position, should not set themselves up against their masters."
New: "she would instead blame their tongues, giving them, as if in jest, serious advice: \"From the moment you hear the marriage contract read aloud to you, think of it as a bond of service, by which you have become servants — and so, remembering your position, do not set yourselves up against your masters.\""

### Paragraph 23 (review P24) — "for one instant" converts a degree qualifier ("slightly") into a duration qualifier
Old: "we touched her for one instant with the whole reach of our hearts;"
New: "we barely touched her, for one instant, with the whole reach of our hearts;"

### Paragraph 24 (review P25) — "far lesser kind" adds a value judgment; source says *dissimilar*, not *inferior*
Old: "and other visions of a far lesser kind be taken away,"
New: "and other visions of a far different kind be taken away,"

### Paragraph 26 (review P27) — "as if it were the happier outcome" injects narratorial doubt not in source
Old: "wishing, as if it were the happier outcome, that she might die not in a foreign place but in her own country."
New: "wishing, as the happier lot, that she might die not in a foreign place but in her own country."

### Paragraph 28 (review P29) — flattened exclamation and wrong connective (bundled with the moderate fix above)
Old: "...and it was a wretched struggle for me. For when she breathed her last,"
New: "...and how wretched I was in that struggle! But when she breathed her last,"
(Both changes applied together with the moderate "overflow" fix — see §2.)

### Paragraph 33 (review P34) — "died before my eyes" breaks the my-eyes/your-eyes antithesis
Source: "dead to mine eyes ... that I might live in Thine eyes" (she is, for now, lost to my sight / I hope she lives in your sight). Candidate's "died before my eyes...live before yours" turns the first half into a claim that Augustine watched her die, breaking the parallel the second half depends on.
Old: "the mother who had, for that time, died before my eyes, who had for so many years wept for me, that I might live before yours"
New: "the mother who was, for that time, dead to my eyes, who had for so many years wept for me, that I might live in yours"

### Paragraph 33 (review P34) — broken grammar, "Let whoever wants to read it" has no main verb for the permission
Old: "Let whoever wants to read it, and interpret it however he likes;"
New: "Let anyone who wishes read it, and interpret it however he likes;"

### Paragraph 34 (review P35) — softened imprecation; "would be in trouble" is far too mild for *vae* ("woe")
Old: "And even the most admirable life of men would be in trouble, if you, setting mercy aside, were to examine it closely."
New: "And woe even to the praiseworthy life of men, if you were to set mercy aside and examine it."

### Paragraph 37 (review P38) — dropped Exodus allusion, generalized away
Old: "which your people, on pilgrimage, sigh for from the day they set out until the day they return there —"
New: "which your people, on pilgrimage, sigh for from their exodus until their return there —"

---

## 4. Declined findings

None declined. All 21 findings (1 major, 3 moderate, 17 minor) from the review were accepted and applied as proposed, including the bundled minors in paragraph 28 (P29) and the quote-style conversions beyond the specific paragraphs the review enumerated (verified by a full independent apostrophe scan of the candidate — see below).

Note on "The Teacher" (review §5): the review explicitly recommends **not** reverting "The Teacher" back to "The Master" (P14/idx13). This is not a finding requiring correction — no change made, per the review's own verdict.

---

## 5. Script-verified checks (re-run after all fixes applied)

- **Paragraph count:** 38 (candidate), 38 (corrected), 38 (source). Match.
- **Changed paragraph indices** (`candidate != corrected`, script diff): `[0, 3, 5, 6, 7, 13, 14, 16, 17, 18, 23, 24, 25, 26, 27, 28, 29, 33, 34, 37]` — 20 paragraphs.
- **Question-mark parity:** source total 39, corrected total 39. Zero per-paragraph mismatches.
- **Archaism scan** (thou/thee/thy/thine/hath/hast/doth/dost/didst/shalt/wilt/unto/whence/whither/betwixt/ye/saith/perchance/aught): zero hits in corrected file.
- **Single-quote-as-quotation-mark scan:** zero remaining anywhere in the file (full apostrophe scan of corrected file — every remaining `'` is a contraction or possessive, e.g. "friend's," "don't," "mother's").
- **Word-count floor check** (corrected/source ratio ≥ 0.75 per paragraph): no paragraph falls below the floor.
- **JSON validity:** `python3 -m json.tool book09-corrected.json` — valid.
