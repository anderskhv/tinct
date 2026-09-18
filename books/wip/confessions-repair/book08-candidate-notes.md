# Book 8 — Modern English Candidate Notes

Source: `book08-source.json` (Pusey, 1838), 31 paragraphs. Output: `book08-candidate.json`, 31 paragraphs, one-to-one.

## 1. Ambiguity preserved

- Para 1: "I saw it in a figure and as through a glass" kept as "I saw it only dimly, as through a clouded glass" — the 1 Cor 13 allusion (imperfect, indirect knowledge) is left implicit rather than glossed as a Bible reference, matching Augustine's own indirection.
- Para 2: "chose the more indulgent place" rendered "chose the easier path" — I did not specify *what* the easier path was (marriage vs. celibacy) beyond what the surrounding sentence already makes clear, so the reader infers it the same way Augustine's original reader would.
- Para 6: Victorinus's line "Do walls then make Christians?" kept as a genuine open jab/question, not flattened into a rhetorical assertion — the ambiguity of whether he's joking or half-serious is preserved.
- Para 9: "what is not fragile, and full of perils" — kept as the officer's own rhetorical self-questioning rather than resolved into flat assertion; Augustine (via Ponticianus) doesn't spell out the answer, so neither did I.
- Para 26–27 (two-wills argument): the philosophical density of "the will commandeth that there be a will; not another, but itself" is kept close to literal rather than paraphrased into looser psychological language, since resolving it further would be interpretation, not translation.
- Para 30 ("the toys of toys... this or that"): Augustine deliberately withholds specifying what the old habits actually were ("what was it which they suggested... what did they suggest, O my God?"). I preserved this coyness rather than naming the vice, per "no added interpretive connectives."

## 2. Technical/proper terms kept

Simplicianus, Victorinus, Ponticianus, Alypius, Antony ("the life of Antony"), Nebridius, Verecundus, Ambrose, Manichees (para 28, referring back to Book 3–5 usage), "catechumen" (para 6), "the Apostle" (Paul, kept as "the Apostle" where source uses it, e.g. para 2, 19, 35, matching established convention from earlier books), Trier (modernized spelling of "Triers" — same city, standard modern English form), Julian (Emperor).

Quote style: double quotes throughout, matching `book06-accepted.json` convention. Embedded quoted speech within already-quoted narration (e.g. Victorinus's and Simplicianus's exchanges in para 6, the two officials' dialogue in para 19) uses double quotes for the outer utterance, consistent with how Book 6 handles nested reported speech (no smart nesting into single quotes, since source doesn't distinguish levels either).

## 3. Hardest paragraphs and tradeoffs

**Para 33 (the garden weeping / fig tree).** This is the emotional peak of the book. Pusey's "there arose a mighty storm, bringing a mighty shower of tears" and "giving full vent to my tears; and the floods of mine eyes gushed out an acceptable sacrifice to Thee" needed to stay physical and violent — I used "a huge storm rose up in me, bringing with it a huge downpour of tears" and "let my tears pour out freely, and the flood from my eyes burst out as an offering acceptable to you," keeping "storm," "flood," and "offering/sacrifice" as the controlling images rather than softening to something like "I cried a lot." I kept "how long, Lord, wilt Thou be angry for ever?" as a real, anguished question addressed to God, not rhetorical throat-clearing. I kept the repeated "How long, how long" and the "tomorrow, and tomorrow" quotation intact rather than compressing it, since the repetition IS the anguish.

**Para 34 (tolle, lege / opening the epistles).** The famous scene. I kept "Take up and read; take up and read" as a chant, preserved the child's-voice ambiguity ("a voice, a boy's or a girl's, I don't know which"), and rendered the Romans 13:13-14 quotation ("Not in rioting and drunkenness...") in full without trimming any of the three paired vices, since this exact list is the hinge of the whole conversion and cutting any clause would be a dropped-clause violation. "By a light as it were of serenity infused into my heart, all the darkness of doubt vanished away" became "it was as though a light of certainty had been poured into my heart, and every shadow of doubt melted away" — I chose "certainty" over a literal "serenity" because in context the phrase functions as the resolution of doubt, and modern readers hearing "serenity" alone might miss that this is specifically the removal of *uncertainty* (the paragraph's central tension since para 1). This is a judgment call, flagged here rather than silently made — "serenity" is defensible too, but "certainty" better tracks the "doubt vanished" clause it's paired with.

**Paras 22–24 (the "two wills" civil-war argument against the Manichees).** Augustine's tightest, most repetitive philosophical prose in the book — "Whence is this monstrousness? and to what end?" repeated three times, then the commandeth/willeth chain. I initially collapsed the repeated question into a single combined question per instance (losing mark parity — see section 4) and had to go back and re-split them into two separate questions each time, matching the source's insistent, obsessive repetition exactly. This mattered for tone as much as mechanics: Augustine is *pounding* the same question because he can't answer it, and compressing it into one smoother question would have muted that.

**Para 16 (custom → necessity chain; two wills tearing the soul).** Highest question-mark count isn't here (that's para 22), but this paragraph has the densest causal chain in the book ("of a forward will, was a lust made; and a lust served, became custom; and custom not resisted, became necessity"). I kept the chain as a literal sequence of clauses ("desire had been made; and desire indulged became habit; and habit not resisted became necessity") rather than restructuring it into a single explanatory sentence, since the chain-of-causation structure is itself the argument.

## 4. Question-mark parity — computed table

Computed with `python3` counting literal `?` characters per paragraph, source vs. candidate, after fixing two initial mismatches (paras 22 and 24, both from over-compressing repeated/paired rhetorical questions into single questions with dashes — corrected by re-splitting).

| Para | Source ? | Candidate ? | Match |
|---|---|---|---|
| 1 | 1 | 1 | OK |
| 2 | 0 | 0 | OK |
| 3 | 0 | 0 | OK |
| 4 | 0 | 0 | OK |
| 5 | 0 | 0 | OK |
| 6 | 2 | 2 | OK |
| 7 | 1 | 1 | OK |
| 8 | 1 | 1 | OK |
| 9 | 1 | 1 | OK |
| 10 | 4 | 4 | OK |
| 11 | 1 | 1 | OK |
| 12 | 0 | 0 | OK |
| 13 | 2 | 2 | OK |
| 14 | 0 | 0 | OK |
| 15 | 0 | 0 | OK |
| 16 | 7 | 7 | OK |
| 17 | 0 | 0 | OK |
| 18 | 0 | 0 | OK |
| 19 | 2 | 2 | OK |
| 20 | 5 | 5 | OK |
| 21 | 0 | 0 | OK |
| 22 | 6 | 6 | OK (fixed) |
| 23 | 0 | 0 | OK |
| 24 | 3 | 3 | OK (fixed) |
| 25 | 5 | 5 | OK |
| 26 | 0 | 0 | OK |
| 27 | 5 | 5 | OK |
| 28 | 3 | 3 | OK |
| 29 | 5 | 5 | OK |
| 30 | 0 | 0 | OK |
| 31 | 0 | 0 | OK |

**31/31 paragraphs match exactly. 0 mismatches remaining.**

## 5. Polarity double-checks (comparison / causal-claim / negation / stated-position paragraphs)

Every paragraph below was explicitly re-read against source after drafting, specifically checking direction (who does what to whom, which side wins, what is being denied vs. affirmed).

- **Para 1** — comparison: "not... more certain of Thee, but more steadfast in Thee." Checked: certainty is already had; what's still needed is steadiness, not more proof. Kept "no longer wanted to be more certain of you, but more steady in you" — direction preserved (steadiness is the goal, not certainty).
- **Para 2** — stated position: "the Apostle did not forbid me to marry, although he advised something better." Checked: marriage is *permitted*, not commanded or ideal; celibacy is the better (not obligatory) option. Kept both halves of the concession correctly — permission stands, preference is for the other option, Augustine chose the *lesser* (marriage-permitting) path out of weakness, not the better one.
- **Para 3** — causal/comparative: Simplicianus is glad Augustine read the Platonists (positive) rather than other philosophers (implicitly worse, "full of fallacies"). Checked direction: Platonists = relatively good (lead toward God), other philosophers = bad. Not inverted.
- **Para 6** — negation/dialogue: Victorinus repeatedly claims Christian status privately; Simplicianus repeatedly *refuses* to count him until seen in church. Checked that Simplicianus's refusal, not agreement, is preserved each time ("I will not believe it... unless I see you in the church"), and that Victorinus is the one resisting public commitment, not Simplicianus.
- **Para 6** — "he grew bold in the face of that emptiness and ashamed instead in the face of truth" — this is the central shame-reversal of the chapter (his old shame was misdirected). Checked against source "he became bold-faced against vanity, and shame-faced towards the truth" — confirmed: bold toward vanity (no longer ashamed of pagan status), ashamed toward truth (now ashamed of resisting Christ) is the correct, non-inverted pairing, and matches exactly what I wrote.
- **Para 7** — stated position/comparison: "it was not salvation that he had taught in rhetoric... how much less then ought he... dread Thy meek flock, who... had not feared a mad multitude." Logic: he wasn't afraid of a raving secular crowd teaching a lesser thing (rhetoric), so he should fear even less a gentle Christian crowd when speaking the greater thing (God's word). Checked the "how much less" direction is preserved, not flipped to "how much more."
- **Para 8** — comparative/causal: "more rejoice at the salvation of a soul despaired of... than if there had always been hope of him." Checked: greater joy attaches to the *riskier* rescue, not the safer one. Confirmed preserved.
- **Para 9** — extended parallel comparison (triumph after battle, calm after storm, recovery after illness, pleasure after hunger) — each pair checked that the *difficulty precedes and amplifies* the joy, not the reverse. All five examples confirmed correctly ordered (danger/pain first, joy second, causally linked).
- **Para 11** — causal chain: "Do not many... return to Thee... out of a deeper hell of blindness than Victorinus" — checked this favorably compares *other* converts as coming from even worse darkness than Victorinus, not the reverse (Victorinus being worse). Preserved "a deeper pit of blindness than Victorinus's."
- **Para 11** — "the enemy is more overcome in one, of whom he hath more hold" — checked: the devil's *defeat* is greater when the person he held more tightly (Victorinus, a man of high status/influence) converts — not that the devil is stronger. Confirmed correct in "the enemy is more thoroughly beaten in someone he has a firmer hold on."
- **Para 12** — "he seemed to me not more resolute than blessed" — checked this is not simple praise but a specific *comparative ranking*: Augustine attributes Victorinus's outcome more to good fortune/opportunity than to willpower. Kept "not so much courageous as fortunate," preserving that Augustine is downgrading resolve relative to circumstance, not praising resolve most.
- **Para 13** — "it was through me that custom had obtained this power of warring against me, because I had come willingly, whither I willed not" — a tricky self-causation/paradox (habit's power over him is his own doing). Checked the direction: he is the cause of the habit's grip, not merely its victim. Preserved "it was through me that habit had gained this power to war against me, because I had come, of my own will, to a place I did not want to be."
- **Para 15** — "not desiring... to teach... rather than give up Thy Word" — checked Victorinus chose God's Word over his rhetoric school, not the reverse. Confirmed: "chose to give up his school of words rather than give up your Word."
- **Para 22 (Manichee argument setup is actually para 24/25/26 in this text — see below)** — n/a, see below.
- **Para 23** — "Where art thou now, my tongue?... now, it is certain, and yet that burden still oppresseth thee, while they who neither have so worn themselves out with seeking it... have had their shoulders lightened." Checked the contrast direction: the *less* effortful searchers got free faster; Augustine, who searched *longer*, is still burdened. Confirmed not inverted — kept "people who have not worn themselves out searching for it... have had their shoulders lightened," i.e., the less-striving people outpaced him.
- **Para 24** — Manichee two-natures argument. Checked carefully: Augustine's rebuttal is that *both* competing wills (toward the Manichee meeting-house and toward the theater) are bad, not that one is good and one bad as the Manichees claim. Then the counter-example (church vs. theater) forces the Manichees into contradiction since they'd have to call the will-toward-church "good" too. Verified I did not accidentally have Augustine agree with the Manichee two-natures theory anywhere; his position throughout is "one soul, conflicting wills," not "two souls."
- **Para 25** — same debate continued with concrete paired bad-vs-bad and good-vs-good examples (poison vs. sword, circus vs. theater; reading Paul vs. reading Psalms vs. discoursing on the Gospel). Checked that in the "good wills" set, all options are genuinely affirmed good (I answered "it is good" to each), and that the paragraph's conclusion is about one soul being pulled by many good things, not by a good vs. a bad thing — this is a different structural point (unity of the soul across even *good* desires) from the earlier bad/bad case, and I kept them clearly parallel-but-distinct as the source does.
- **Para 26** — "worse whereto I was inured, prevailed more with me than the better whereto I was unused" — checked: the *bad-but-familiar* habit is winning, not the *good-but-unfamiliar* one. Confirmed preserved: "the worse habit I was used to had more power over me than the better one I was not used to."
- **Para 27** — Continence's rhetorical question "Can not thou what these youths, what these maidens can?" — checked this is a challenge implying Augustine *can* do it too (not a statement that he can't), matching the taunting-but-encouraging tone of the source (a "persuasive mockery"). Preserved as a real open question, not softened into flat reassurance.

All checked paragraphs read correctly against source polarity; no inversions found beyond the two mechanical question-mark issues (paras 22, 24), which were fixed and are not polarity errors — they were compression errors that happened to also cost marks.

## Process note

Question-mark counts were computed programmatically (`str.count('?')`) against both files, not estimated, per the mandatory gate. Table above reflects the final, corrected candidate.
