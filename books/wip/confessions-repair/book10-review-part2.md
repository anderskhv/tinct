# Book 10 — Independent Review, Part 2 (paragraphs 35–69, 0-based)

Reviewer: independent (did not draft). Source of truth: `book10-source.json` (Pusey 1838),
`paragraphs` array, 70 entries. Candidate: `book10-candidate.json`,
sha256 `3c37ac38119e956c7b61dede2a39086c35c2a20dfa7813b4aa60ba12f6026795`, 70 entries.
File structure verified sound: both files have exactly 70 paragraph entries, one-to-one.

Note on numbering: indices below are **0-based** (matching the JSON array). The drafter's
notes table is 1-based, so index *n* here = "¶*n*+1" in `book10-candidate-notes.md`.
Both are given as `IDX n (¶n+1)`.

---

## 1. Question-mark parity — independent count, indices 35–69

Counted independently with a script over both JSON files (not read off the drafter's table).

| IDX (¶) | src ? | cand ? | | IDX (¶) | src ? | cand ? |
|---|---|---|---|---|---|---|
| 35 (¶36) | 4 | 4 | | 53 (¶54) | 0 | 0 |
| 36 (¶37) | 2 | 2 | | 54 (¶55) | 1 | 1 |
| 37 (¶38) | 0 | 0 | | 55 (¶56) | 1 | 1 |
| 38 (¶39) | 4 | 4 | | 56 (¶57) | 4 | 4 |
| 39 (¶40) | 0 | 0 | | 57 (¶58) | 0 | 0 |
| 40 (¶41) | 5 | 5 | | 58 (¶59) | 2 | 2 |
| 41 (¶42) | 0 | 0 | | 59 (¶60) | 3 | 3 |
| 42 (¶43) | 0 | 0 | | 60 (¶61) | 4 | 4 |
| 43 (¶44) | 0 | 0 | | 61 (¶62) | 4 | 4 |
| 44 (¶45) | 0 | 0 | | 62 (¶63) | 0 | 0 |
| 45 (¶46) | 0 | 0 | | 63 (¶64) | 0 | 0 |
| 46 (¶47) | 1 | 1 | | 64 (¶65) | 1 | 1 |
| 47 (¶48) | 0 | 0 | | 65 (¶66) | 1 | 1 |
| 48 (¶49) | 0 | 0 | | 66 (¶67) | 4 | 4 |
| 49 (¶50) | 0 | 0 | | 67 (¶68) | 0 | 0 |
| 50 (¶51) | 0 | 0 | | 68 (¶69) | 0 | 0 |
| 51 (¶52) | 0 | 0 | | 69 (¶70) | 0 | 0 |
| 52 (¶53) | 0 | 0 | | | | |

**Range totals: source 41, candidate 41. Zero mismatches across indices 35–69.**
This independently corroborates the drafter's claim for the ¶36–¶70 rows of their table,
including the two self-caught fixes they report at ¶59/¶60 (their numbering) — those rows
now match. Risk pattern #1 (flattened rhetorical questions) is **clean** for this range.

### 1b. Exclamation-mark parity (not requested, checked anyway — it caught real defects)

**Range totals: source 16, candidate 12. Three paragraphs mismatch** (IDX 37, 38, 58).
Augustine's exclamatory outbursts are load-bearing under risk pattern #8 (don't soften).
See findings F-04, F-05 and F-14.

### 1c. Quote style and archaism — independent scan

- Scanned every `'` in indices 35–69 where neither neighbor is a letter (i.e. not a
  contraction/possessive): **0 hits.** No single-quote-as-quotation-mark defects.
- Double-quote balance: even count of `"` in every paragraph in range. No unclosed quotes.
- No curly quotes (`' ' " "`) anywhere in range.
- Only two quoted strings exist in range and both use double quotes correctly:
  IDX 51 `"O Lord, maker of all things"`, IDX 65 `"Who can reach up to that? ..."`.
- Archaism scan (thou/thee/thy/hath/doth/wert/saith/whereof/betwixt/oft/verily/whence/
  thither/perchance/etc.): **0 hits** across indices 35–69. Clean.

---

## 2. Packet-by-packet findings

### Packet A — IDX 35–37 (¶36–¶38): God's place in memory; "too late I loved you"

**IDX 35 (¶36)** — no issues. The three-stage search (images of bodily things → stored
feelings → seat of the mind) is present with all three negations intact ("did not find
you there" ×3). The "not a bodily image / not a feeling / not the mind itself, because you
are the Lord God of the mind" chain keeps its order and its reasons. Rhetorical questions
preserved.

**IDX 36 (¶37)** — no issues. The two closing asymmetries are correctly preserved and not
levelled: "You answer clearly, though not everyone hears clearly" and "Your best servant is
the one who looks not so much to hear from you what he himself wants, as rather to want
what he hears from you." Direction correct (wanting what you hear, not hearing what you want).

**F-01 — IDX 37 (¶38) — minor — adversative flattened.**
Source: "Thou wert with me, but I was **not** with Thee."
Candidate: "You were with me, **and** I was not with you."
The `but` carries the whole point of the reversal. Latin has `et`, but Pusey is the locked
ground truth here and Pusey has `but`.
*Proposed:* "You were with me, but I was not with you."

**F-02 — IDX 37 (¶38) — minor — objects supplied to two bare verbs.**
Source: "Thou breathedst odours, and I drew in breath and panted for Thee. I tasted, and
hunger and thirst."
Candidate: "You breathed your fragrance **on me** … and I **pant** for you. I tasted **you**,
and **now** I hunger and thirst **for you**."
Two supplied objects ("on me", "you") and a tense shift ("panted" → "pant"). The supplied
objects are the standard reading and defensible; flagged only for the record. The tense
shift is inconsistent with "I tasted" immediately before.
*Proposed (optional):* "…and I drew in my breath, and I panted for you."

**F-03 — IDX 37 (¶38) — minor — doubled exclamation collapsed.**
Source: "Too late loved I Thee, O Thou Beauty of ancient days, yet ever new**!** too late I
loved Thee**!**" (2 `!`)
Candidate: "Too late I loved you, O Beauty so ancient and so new**,** too late I loved you!" (1 `!`)
The most famous sentence in the Confessions; the first exclamation is swallowed by a comma,
turning two hammer-blows into one running clause.
*Proposed:* "Too late I loved you, O Beauty so ancient and so new! Too late I loved you!"

### Packet B — IDX 38–40 (¶39–¶41): life is all trial; continence; sleep

**F-04 — IDX 38 (¶39) — moderate — lament flattened, two exclamations lost.**
Source: "Woe is me**!** lo**!** I hide not my wounds; Thou art the Physician, I the sick;"
Candidate: "Woe is me **—** look, I do not hide my wounds; you are the physician, I am the
sick one;"
Source has 5 `!` in this paragraph, candidate 3. The third "Woe is me!" is the climax of a
triple repetition (the first two are preserved with `!`); demoting only the third to an
em-dash breaks the pattern and softens the outburst. Risk pattern #8.
*Proposed:* "Woe is me! Look — I do not hide my wounds; …"

**F-05 — IDX 38 (¶39) — minor — "lest" → "because".**
Source: "…and because adversity itself is a hard thing, **and lest it shatter endurance**."
Candidate: "…and because adversity itself is a hard thing, **and because it might shatter
endurance**."
"Lest" is a fear-clause (the dread that endurance will break), not a stated cause. Candidate
converts fear into asserted causation — mild instance of risk pattern #2.
*Proposed:* "…and for fear that it may shatter endurance."

Everything else in IDX 38 checks out, including the difficult "No one loves what he endures,
even though he may love to endure it" — the loving-the-endurance / not-loving-the-hardship
distinction is intact and not flattened, and "You command us to endure them, not to love them"
keeps its polarity.

**IDX 39 (¶40)** — no issues. "Give what you command, and command what you will" is rendered
identically here and at its two other occurrences in range (IDX 44, IDX 59), which is correct —
it is a refrain. "A man loves you too little who loves anything alongside you that he does not
love for your sake" keeps both the comparative and the "for your sake" qualifier.

**F-06 — IDX 40 (¶41) + IDX 46 (¶47) — minor — same source term rendered two ways.**
Source uses "concubinage" in both paragraphs, and IDX 46 explicitly back-references IDX 40
("as I could of concubinage").
Candidate: IDX 40 "illicit sex"; IDX 46 "sex outside marriage".
The back-reference is weakened because the reader does not see the same phrase twice.
*Proposed:* use one rendering in both places — "sex outside marriage" reads better and is
accurate for Augustine's own past.

IDX 40 otherwise clean: all five questions preserved; "Is it shut off along with the eyes? Is
it put to sleep along with the senses of the body?" keeps both halves; the closing "we discover
that we did not do what we are nonetheless sorry was somehow done in us" preserves the exact
did-not-do / still-sorry tension without resolving it.

### Packet C — IDX 41–43 (¶42–¶44): dreams; eating as medicine

**IDX 41 (¶42)** — no issues of substance. "rejoicing with trembling in what you have given me,
and mourning over what in me is still incomplete" keeps the two-sided posture. The awkward
Pusey clause "not even such as a thought would restrain" is rendered as "no more than a mere
thought would be able to restrain" — one of two possible readings of an ambiguous source, but
the candidate does not add anything to force it, so acceptable.

**IDX 42 (¶43)** — no issues. The Matt. 6:34 allusion ("another evil belonging to the day, which
I wish were enough on its own") survives; "my pains are driven off by pleasure" keeps the
uncomfortable formulation rather than smoothing it.

**F-07 — IDX 43 (¶44) — moderate — self-accusation softened.**
Source: "In this uncertainty the unhappy soul **rejoiceth**, and therein prepares an excuse to
shield itself…"
Candidate: "In this uncertainty my unhappy soul **takes a kind of comfort**, and in it prepares
an excuse to shield itself…"
Augustine's charge is that the soul *delights* in its own uncertainty because uncertainty gives
it cover. "Takes a kind of comfort" is passive and exculpatory — it makes the soul a sufferer
rather than an accomplice. Direct hit on risk pattern #8.
*Proposed:* "In this uncertainty my unhappy soul rejoices, and in it prepares an excuse to
shield itself…"

**F-08 — IDX 43 (¶44) — minor — "wish to do" → "think".**
Source: "…so that I may for her sake do what I say I do, **or wish to do**, for health's sake."
Candidate: "…what I say — **or think** — I am doing for health's sake."
"Wish to do" is an intention Augustine ascribes to himself; "think" is a belief. The wilful
element is what makes the self-accusation bite.
*Proposed:* "…what I say I am doing — or mean to be doing — for health's sake."

**F-09 — IDX 43 (¶44) — minor — register.**
Source: "…because I have as yet no settled **counsel** herein."
Candidate: "…because I have as yet no settled **policy** about this."
"Policy" is corporate/administrative and clashes badly with the surrounding voice.
*Proposed:* "…no settled rule about this" or "no settled counsel in this matter."

### Packet D — IDX 44–46 (¶45–¶47): scriptural voices on food; the bridle of the throat

**IDX 44 (¶45)** — no issues. Long and dense; checked clause by clause. The "we received it
before we prayed, so that we might later know it came from you" logic is intact and not
inverted. "the one will not make me rich, nor the other miserable" preserves both halves.
"Here is a soldier of the heavenly camp, and not the dust that we are" keeps the contrast,
and the following correction ("Nor could he have done this of himself… was made of the same
dust") is not dropped.

**F-10 — IDX 45 (¶46) — minor — subject supplied that the source leaves elliptical.**
Source: "…that Elijah was fed with flesh; **that endued with an admirable abstinence, was not
polluted** by feeding on living creatures, locusts."
Candidate: "…that **John the Baptist**, gifted with a remarkable abstinence, was not defiled by
feeding on living creatures, the locusts."
The locked source leaves the subject unstated (a gap in this Pusey text). Identifying him is
almost certainly right and is a reader service — but it is an addition to the locked source,
so it should be a deliberate accepted call, not a silent one. No objection if accepted knowingly.

IDX 45 otherwise clean, including two important not-X-but-Y constructions with correct polarity:
"tempted not concerning meat but concerning bread" and "deserved reproof, not for desiring meat,
but because… they grumbled against the Lord."

**F-11 — IDX 46 (¶47) — moderate — referent shifted, scriptural allusion narrowed.**
Source: "…numbering me among the weak members of His body; because Thine eyes have seen **that
of Him** which is imperfect, and in Thy book shall all be written."
Candidate: "…counting me among the weak members of his body, because your eyes have seen **what
is still imperfect in me**, and in your book all shall be written."
Source: God's eyes have seen the imperfect part *of Christ's body* — which is precisely why
Augustine can be numbered among its weak members. Candidate narrows it to Augustine personally,
which breaks the logical link with the preceding clause (the "because" no longer explains
anything about the *body*).
*Proposed:* "…counting me among the weak members of his body, because your eyes have seen what
in him is still imperfect, and in your book all shall be written."

Also in IDX 46: "who is not carried at least a little beyond the limits of what is necessary?"
correctly keeps the question and its scope, and "I am not such a man, for I am a sinful man"
keeps the flat self-verdict.

### Packet E — IDX 47–49 (¶48–¶50): smell; the ear; church music

**F-12 — IDX 47 (¶48) — minor — added intensifier.**
Source: "…that he who hath been capable of worse to be made better, may **likewise** of better
be made worse."
Candidate: "…could **just as easily** be changed from better to worse."
Direction is correct (the inversion risk here is real and the candidate avoids it). But
"likewise" = "in the same way"; "just as easily" adds a probability claim not in the source.
*Proposed:* "…could in the same way be changed from better to worse."

**IDX 48 (¶49)** — no issues. This is a high-risk paragraph for polarity and it holds up. The
sense/reason relationship is correct in both directions: sense is "let in only for reason's
sake" but "tries instead to run ahead of it and lead it" — not reversed. "In this way I sin
without noticing, and only afterward become aware of it" keeps the unflattering sequence.

**F-13 — IDX 49 (¶50) — minor — ambiguous antecedent.**
Source: "Thus I fluctuate between peril of pleasure and **approved wholesomeness**;"
Candidate: "So I waver between the danger of pleasure and **the proven benefit of it**,"
"Of it" most naturally attaches to *pleasure*, producing "the proven benefit of pleasure" —
which is not the contrast. Augustine is weighing the danger of pleasure against the proven
benefit of *the practice of singing*.
*Proposed:* "So I waver between the danger of pleasure and the proven benefit of the practice,"

Also IDX 49, not a finding but noted: "I go wrong in the opposite direction, into too great a
strictness" adds "in the opposite direction," which the source leaves implicit. It is a true
inference and aids the reader; acceptable, but it is an added connective (risk pattern #2) —
if the standard is strict, "I go wrong through too great a strictness" is closer.

The rest of IDX 49 is correct and unsoftened, including the hard admission "I confess that I
have sinned in a way that deserves punishment" and the Athanasius example with its detail
("so slight an inflection of voice that it was closer to speaking than to singing") intact.
"weep with me, and weep for me" and the exclusion "For those of you who do not act on it, these
things do not touch you" are both preserved.

### Packet F — IDX 50–52 (¶51–¶53): light; the Light of the patriarchs; manufactured beauty

**IDX 50 (¶51)** — no issues. "let God take hold of it instead, God who made these things — very
good indeed, yet he is my good, not they" keeps the corrective clause exactly.

**F-14 — IDX 51 (¶52) — minor — proper noun changed.**
Source: "O Thou Light, which **Tobias** saw…"
Candidate: "O that Light which **Tobit** saw…"
Pusey's "Tobias" is the elder Tobit; "Tobit" is the modern name and is *substantively* correct,
but the Translation Rules say preserve proper nouns. Flagging so the change is deliberate.

**F-15 — IDX 51 (¶52) — minor — added intensifier.**
Source: "Thou dost ever and anon pluck them out, for they are ensnared."
Candidate: "You draw them out again and again, for they are **constantly** caught."
"Constantly" is not in the source; the next sentence already carries the repetition ("You never
stop drawing them out, while I keep tangling myself…"). Minor over-egg.

Not a finding: "all who see it and love it are made one **in it**" adds "in it" to the source's
"all are one, who see and love it." Defensible as disambiguation.

**F-16 — IDX 52 (¶53) — minor — added qualifier reverses a flat denial into a partial one.**
Source: "But the framers and followers of the outward beauties derive thence the rule of judging
of them, **but not of using them**."
Candidate: "…draw from that Beauty their rule for judging them, though not their rule for using
them **rightly**."
Source: they take no rule of *use* from that Beauty at all. Candidate's "rightly" converts this
into "they do take a rule of use, just not the right one." Small but it is a polarity softening.
*Proposed:* "…their rule for judging them, but not their rule for using them."

IDX 52 otherwise clean; the three-beat chiasmus ("outwardly chasing after what they themselves
have made, while inwardly abandoning the one by whom they themselves were made, and destroying
what they themselves have been made to be") is preserved in order and voice.

### Packet G — IDX 53–55 (¶54–¶56): curiosity defined; the mangled corpse; magic and sign-seeking

**F-17 — IDX 53 (¶54) + IDX 59 (¶60) + IDX 65 (¶66) — moderate — "concupiscence" rendered
inconsistently with the named triad (risk pattern #6).**

The candidate correctly fixes the triad as **"lust of the flesh / lust of the eyes / pride of
life (ambition of the world)"** at IDX 40 and IDX 50, and correctly uses "**the lust of the
eyes**" twice in IDX 53. But "concupiscence" is rendered "desire" at exactly the places where
Augustine is naming the structure:

| IDX (¶) | Source | Candidate |
|---|---|---|
| 53 (¶54) | "that **concupiscence of the flesh** which consisteth in the delight of all senses" | "the **desire of the flesh**, which lies in the delight of every sense" |
| 59 (¶60) | "all of **the three concupiscences**" | "all three of **these forms of desire**" |
| 65 (¶66) | "in that **threefold concupiscence**" | "in that **threefold desire**" |

IDX 53's case is the worst: three paragraphs earlier the candidate wrote "so bring to a close the
temptations of **the lust of the flesh**", and IDX 53 opens by contrasting the *new* temptation
with that same named category — but calls it "the desire of the flesh," so the reader cannot see
that it is the same named thing. IDX 65 is the book's structural summary and should name the
triad it is summarizing.
*Proposed:* IDX 53 → "besides the **lust of the flesh**, which lies in…"; IDX 59 → "all three of
**these lusts**"; IDX 65 → "in that **threefold lust**".
(Elsewhere in range, freestanding "concupiscence" rendered "desire" — IDX 41 birdlime, IDX 43
snare, IDX 46 "desire in eating and drinking" — is fine and reads well. The fix is only needed
where the triad is being named.)

**IDX 54 (¶55)** — no issues. The corpse example keeps every step: no pleasure in it → yet people
flock to it → to be made sad and turn pale → they are afraid to see it even in sleep → "As if,
when awake, anyone forced them to look at it, or any report of its beauty drew them there!"
(sarcasm and exclamation preserved). The three derived cases (theatre spectacle, prying into
nature's hidden powers, magical arts) and the fourth (tempting God with demanded signs) are all
present with their motive-clauses ("not desired for any good purpose, but merely to make trial of
him") polarity-correct.

**F-18 — IDX 55 (¶56) — minor — added temporal qualifier weakens a petition.**
Source: "…that **as any consenting thereto is far from me**, so may it ever be further and further."
Candidate: "…that just as any consent to such a thing is far from me **now**, so may it be pushed
ever further and further away."
"Now" introduces an implicit "but who knows about later" that the source does not state — and it
slightly changes the prayer from "it is far; keep pushing it further" to a time-bounded claim.
*Proposed:* drop "now".

IDX 55 otherwise clean, including the deliberately stammered repetition "when would I dare to say
— when would I dare to say," which the candidate preserves rather than tidying.

### Packet H — IDX 56–58 (¶57–¶59): dog, hare, lizard, spider; pride of life

**IDX 56 (¶57)** — **no issues; this is the best paragraph in the range.** Explicitly checked
against risk pattern #3 (dropped clauses in example-driven passages). Every element survives:

- the vain-stories drift ("start out as though merely tolerating… so as not to offend those
  weaker than us, and then, little by little, find ourselves taking an interest") — including the
  "lest we offend the weak" motive, which is the kind of subordinate clause that usually goes missing;
- the dog/hare: no longer the circus, *but* the countryside; "might well distract me even from
  some serious thought"; and crucially the fine distinction "not that I turn my animal's body
  aside, but my mind still leans that way" — intact;
- the two-branch remedy ("either to rise toward you through some reflection on the sight itself,
  or else to despise it entirely and pass it by") — both branches present;
- the lizard *and* the spider, with the spider's flies "rushing into her web" — both present;
- "Is it any different just because these are small creatures?" — question preserved;
- the sting: "I move on from them to praise you… **but that praise is not what first draws my
  attention**" — the self-accusing qualification is kept, not dropped;
- "It is one thing to get back up quickly, another thing not to fall at all" (adds "at all" —
  harmless);
- the prayer-distraction coda with all four beats and the closing double question, both `?` intact.

**IDX 57 (¶58)** — no issues. Note the candidate renders "the lust of vindicating myself" as "the
desire to justify myself," which is fine (not a triad-naming context; see F-17).

**F-19 — IDX 58 (¶59) — MAJOR — direction inversion (risk pattern #5).**
Source: "…he also is praised, **while Thou dispraisest**; better is he who praised than he who
is praised."
Candidate: "…he too is being praised **while you are being slighted**; and better is the one who
gave the praise than the one who received it."

In the source **God is the agent**: the man is praised by men at the very moment God is finding
fault with him. The candidate makes God the **patient** — "you are being slighted" — which is a
different and much weaker claim (God's honour is diminished, rather than God's verdict standing
against the man). This destroys the parallel with the candidate's own earlier sentence in the
same paragraph, which gets it right: "Whoever wants to be praised by men **when you find fault**
will not be defended by men when you judge, nor delivered when you condemn." The whole force of
the passage is the *clash of two verdicts*, human and divine, on the same man at the same moment.
This is exactly the defect class confirmed in Books 4, 5, 6 and 8.
*Proposed:* "…he too is praised while you find fault with him; and better is the one who gave the
praise than the one who received it."

**F-20 — IDX 58 (¶59) — moderate — exclamatory verdict flattened to a statement.**
Source: "A miserable life this and a foul boastfulness**!**"
Candidate: "This is a miserable life, and a shameless kind of boasting**.**"
The paragraph's only exclamation (source 1 `!`, candidate 0). This sentence is the recoil after
the definition of the third temptation; as a flat declarative it reads like a classification
rather than a cry. Also "**foul**" → "shameless" trades disgust for impropriety.
*Proposed:* "A miserable life this, and a foul kind of boasting!"

**IDX 58 (¶59) — verified correct, no finding:**
- "to have a joy in it that is **no true joy at all**" — kept as a flat denial (drafter's note 12
  checks out; not softened to "a lesser joy"). The candidate's added "true" is acceptable here
  because the denial itself remains absolute.
- "be pleased at being loved and feared **not for your sake but in your place**" — the critical
  *for-God's-sake vs. in-God's-stead* distinction, rendered exactly and not collapsed into "not
  for your sake but for our own."
- "not through the bonds of love but through the bonds of punishment" — polarity correct.
- the two roles in the closing sentence ("the one took pleasure in the gift of God in a man; the
  other was better pleased with the gift of man than with the gift of God") are **not** swapped —
  the praiser delights in God's gift, the praised man prefers the human gift. Drafter's note 13
  independently confirmed.

### Packet I — IDX 59–61 (¶60–¶62): testing oneself without praise; the examination of praise

**F-21 — IDX 59 (¶60) — minor — comparative dropped.**
Source: "For I cannot learn how far I am **more** cleansed from this plague…"
Candidate: "For I cannot tell how far I have been cleansed from this plague…"
The source's "more" makes this a question about *progress* — how much further along am I than I
was — which is the point of the whole self-examination that follows (he can measure progress with
the other two temptations but not this one). The candidate's version asks a static question.
*Proposed:* "For I cannot tell how much further I have been cleansed from this plague…"

IDX 59 otherwise clean, including the argument's hardest turn — that praise cannot be given up
experimentally the way food or wealth can, because to be without praise you would have to live so
badly that everyone detests you ("What greater madness could be spoken or imagined?"), and
therefore praise "does and should go along with a good life." Both halves survive, and the
closing admission ("I do not know whether I can be without something well or badly, unless it is
actually absent") is left unresolved, correctly.

**F-22 — IDX 60 (¶61) — minor — "misery" softened to "weakness".**
Source: "And when I am troubled at this my **misery**, an excuse occurs to me…"
Candidate: "And when I am troubled by this **weakness** of mine, an excuse occurs to me…"
Minor, but "weakness" is the candidate's standing rendering of *infirmitas* elsewhere in range
(IDX 57, 68, 70), so using it for *miseria* here both softens and blurs a distinction.
*Proposed:* "…troubled by this misery of mine…"

IDX 60 otherwise clean and this is a difficult paragraph. Checked specifically: the opening
comparative is not inverted ("I am pleased by praise — but more pleased by the truth itself than
by praise"); the frenzied-but-praised vs. settled-but-blamed choice keeps both horns and does not
state which he chooses ("I can see which I would choose" — left unspecified, as in the source);
the "not only continence… but righteousness too" pair keeps both; and the self-suspicion at the
end ("not out of concern for him, but because the same good things that please me in myself
please me more when they please someone else too") is polarity-correct and unflinching. The
closing question is left as a question.

**IDX 61 (¶62)** — no issues. All four questions preserved. The key self-test — "why am I less
moved when someone else is unjustly criticized than when it is myself?" — keeps its comparative
direction, and the candidate does **not** supply a verdict: "Do I not know this either? Or is it,
in the end, that I am deceiving myself…" stays open, followed by the petition, not an answer.
The closing "yet best off when, in hidden groans, I am displeased with myself, and seek your
mercy" is correct (displeased with *himself*, not with God or others).

### Packet J — IDX 62–64 (¶63–¶65): the pride-in-confession paradox; inward vanity; Truth as companion

See §3 below for IDX 62 in full. Two findings there (F-23, F-24).

**F-25 — IDX 63 (¶64) — minor — referent of "if they credit them" supplied.**
Source: "…but in Thy good things, as though their own; **or even if as Thine**, yet as though for
their own merits; **or even if as though from Thy grace**, yet not with brotherly rejoicing…"
Candidate: "…but even in your good things as though they were their own; or, **if they credit them
to you**, still as though they had earned them by their own merit; or even **if they credit them to
your grace**, still not with a brotherly rejoicing…"
"If they credit them to you" is a supplied paraphrase of an elliptical source. It is accurate and
much clearer; noted only because it is an added interpretive expansion (risk pattern #2). The
three-step descent (mine / yours but earned / your grace but begrudged) is fully preserved, which
is the important thing. No change needed.

Also IDX 63, verified: the closing "I feel my wounds being healed by you far more than I feel them
not being inflicted by me in the first place" preserves the source's grim point — he goes on
inflicting them; God goes on healing. Not inverted, not softened. The added "far" and "in the
first place" are padding but harmless.

**IDX 64 (¶65)** — no issues. Long; checked clause by clause. The double negation ("Nor was I
myself the one who discovered these things… Nor was it I myself who did this, either — that is,
the power by which I did it — nor was it you") follows Pusey's awkward structure without tidying
it into something cleaner than the source. The three-verb memory work ("turning some things over,
storing up others, drawing out others") is intact. The strange-sweetness passage keeps its
conditional and its agnosticism ("if it were made complete in me, I do not know what there would
be in it that would not belong to the life to come") rather than asserting. The closing chiasmus
"Here I am able to stay, but do not want to; there I want to be, but cannot; both ways, I am
miserable" is direction-correct — he *can* stay in the lower things but doesn't want to, and
*wants* the higher but can't.

### Packet K — IDX 65–67 (¶66–¶68): the false mediator and the true Mediator

**F-26 — IDX 65 (¶66) — moderate — not-X-but-Y construction now parses backwards.**
Source: "…but I through my covetousness would **not indeed forego Thee**, but would **with Thee
possess a lie**;"
Candidate: "…but I, through my own greed, **wanted not to lose you but to possess a lie along with
you**"
As punctuated, the candidate reads on first pass as a standard "not X but Y": *wanted — not to
lose you — but to possess a lie*, i.e. "he did not want to keep God; he wanted a lie." That is the
opposite of Augustine's point, which is greed: he wanted to keep God **and** a lie at the same
time, and lost God because God will not be co-possessed with a lie (the very next sentence).
The words could be parsed correctly, but the default reading is inverted. Risk pattern #5, and
the candidate's own next sentence contradicts the misreading.
*Proposed:* "…but I, through my own greed, did not want to lose you — I wanted to possess a lie
along with you."

Also IDX 65: "threefold desire" → see F-17.

**IDX 66 (¶67)** — no issues. The mediator dilemma is symmetric and neither horn collapses: "if in
both respects he were merely like man, he would be too far from God, and if in both respects he
were like God, he would be too unlike man, and so would not be a mediator at all." Both `?` groups
preserved ("Was I to turn to the angels? With what prayers? With what sacraments?"). The false
mediator's asymmetry is correct — one thing genuinely in common with man (sin), one thing he only
*wants to seem* to share with God (immortality) — and the reversal at the end ("since the wages of
sin is death, this he has in common with men — that with them he is condemned to death") lands.
"puffing out their chests rather than beating their breasts" preserves Pusey's contrast.

**F-27 — IDX 67 (¶68) — minor — capitalization of "Mediator" drops at the point it matters.**
Source: "For as Man, He was a **Mediator**; but as the Word, not in the middle between God and man…"
Candidate: "For as man, he was a **mediator**; but as the Word, he was not in the middle…"
The candidate correctly capitalizes "the true Mediator" and "that Mediator between God and man"
earlier in the same paragraph, then lowercases the final one, where the source keeps the capital.
Since the candidate uses lowercase "mediator" throughout IDX 66 for the *false* mediator, the
lowercase here reads as a downgrade at exactly the wrong moment.
*Proposed:* "For as man, he was a Mediator; but as the Word, he was not in the middle…"

IDX 67 otherwise clean; the "mortal with men, just with God" chiasmus and the forward/backward
faith symmetry ("through faith in his Passion still to come, just as we through faith in it
already past") are both preserved.

### Packet L — IDX 68–69 (¶69–¶70): Victor and Victim; the close

**F-28 — IDX 68 (¶69) — minor — modifier placement garbles a phrase.**
Source: "…making us **to Thee, of servants, sons** by being born of Thee, and serving us."
Candidate: "…making us **sons instead of servants to you**, by being born of you and serving us."
"To you" now attaches to "servants," producing "servants to you" — but the point is that he makes
us *sons to God* where we had been servants.
*Proposed:* "…making us your sons instead of servants, by being born of you and serving us."

**IDX 68 (¶69) — verified, no finding:** the Christological causal direction the drafter flags in
note 17 is correct — "therefore Victor **because he was the Victim**", "therefore Priest **because
he was the Sacrifice**". Victimhood grounds victory, not the reverse. Not inverted.

**F-29 — IDX 69 (¶70) — minor — tense shift.**
Source: "and poor, **desired** to be satisfied from Him, amongst those that eat and are satisfied"
Candidate: "and, poor as I am, I **long** to be satisfied by him, among those who eat and are
satisfied"
Present for past. The surrounding verbs in the candidate are past/perfect ("has redeemed me"), and
Pusey's past tense places this desire in the same completed movement. Very minor; the present
tense arguably reads better and could be accepted deliberately.

IDX 69 otherwise clean. The final sentence keeps all three actions on the ransom ("I meditate on
my ransom, and eat and drink it, and share it with others") — the third is easy to drop and is
present.

---

## 3. Dedicated assessment: the pride/confession paradox (IDX 62 / ¶63)

**Verdict: the paradox survives structurally and is NOT resolved in either direction — but two
small additions blunt its edge, and one of them creates a referential muddle.**

Source:
> "It tempts, even when it is reproved by myself in myself, on the very ground that it is reproved;
> and often glories more vainly of the very contempt of vain-glory; and so it is no longer contempt
> of vain-glory, whereof it glories; for it doth not contemn when it glorieth."

Candidate:
> "It tempts even when it is rebuked by myself in myself, on the very ground that it is rebuked,
> and it often boasts more emptily of the very contempt of empty glory — and so it is no longer
> contempt of empty glory that it boasts of, since it does not truly despise what it boasts of."

**What is right, and it is most of it.** The three-beat self-cancelling loop is intact and in
order: (1) the temptation feeds on the very act of being rebuked; (2) it then boasts of despising
boasting; (3) therefore what it boasts of is not contempt at all. Crucially the candidate does
**not** commit either of the two failure modes the brief warns about. It does not resolve into
false confidence ("so it is fine, since I have noticed it") and it does not resolve into false
despair ("so confessing is always prideful and hopeless"). The loop is left running, and the
candidate correctly moves straight into IDX 63's *different* vanity (inward self-pleasing) rather
than inserting a closing verdict. The self-referential danger of the confession itself is
therefore still live for the reader, which is the whole point.

**F-23 — moderate — added hedge "truly" weakens the flat contradiction.**
"for it doth not contemn when it glorieth" is an absolute: in the act of boasting, contempt is not
happening. "since it does **not truly** despise" opens a gap — it half-despises, just not
*truly*. That gap is exactly what Augustine is refusing to allow himself. Risk pattern #8 applied
to the paragraph the brief singles out for maximum care.

**F-24 — moderate — the object of "despise" is changed, and points the wrong way.**
Source has no object: *it does not contemn* (full stop) *when it glories*. The candidate supplies
"**what it boasts of**". But what it boasts of is *its own contempt of vainglory* — so the sentence
now says "it does not despise its own contempt," which is a different and slightly incoherent
claim. The thing not being despised is **vainglory**.

*Proposed correction for the final clause:*
> "…— and so it is no longer contempt of empty glory that it boasts of, for it does not despise
> at all in the very act of boasting."

or, keeping an explicit object:
> "…for in the act of boasting it is not despising empty glory."

**F-30 — minor — "an excellence of its own" should be "of our own".**
Source: "which, **to establish a certain excellency of our own**, solicits and collects men's
suffrages." Candidate: "which, in order to build up some excellence **of its own**, courts and
collects the votes of men." The source implicates *us*; the candidate makes the love of praise a
freestanding agent pursuing its own ends, which lets the confessing "I" off the hook a fraction.
*Proposed:* "in order to build up some excellence of our own."

**One terminology note, not a finding:** "vain-glory" is rendered "empty glory" throughout the
paragraph. "Vainglory" is ordinary modern English, is the standard term for this vice, and holds
the "vain = empty + vain = self-regarding" double sense that "empty glory" loses. Recommend
switching, though this is a preference call, not a defect.

---

## 4. Straight-through read: flow, voice, unsparing self-accusation

Read indices 35–69 continuously. The voice is consistent with Books 3–6/8/9 as accepted: plain,
direct second person, no archaism, no inserted modern idiom, sentence rhythm that survives the
long periodic structures without breaking them into choppy modern units. Word-count ratios sit
between 1.03 and 1.19 of source throughout — expansion, never compression. No paragraph reads as
summary.

The self-accusation holds at full strength in the places it most matters: the eating section
admits "the necessity is sweet to me, and I fight against that very sweetness"; the music section
does not let him off ("I confess that I have sinned in a way that deserves punishment"); the
curiosity section keeps the humiliating specificity of a grown bishop distracted by a spider; the
praise section leaves him genuinely unable to tell whether he is vain or not.

Three places where the unsparing edge is measurably dulled — all already itemized: F-07 ("rejoices"
→ "takes a kind of comfort"), F-20 (the exclamation "A miserable life this and a foul
boastfulness!" flattened to a classification), F-23 ("does not truly despise"). None is
catastrophic; together they are the beginning of the softening drift, and correcting all three is
cheap.

The one genuine reversal, F-19, is the same defect class that has been confirmed in four previous
books and would be invisible to a reader who does not have Pusey open. It must be fixed before
acceptance.

---

## 5. Summary verdict — indices 35–69

**Question-mark parity: 41 / 41. Exact. Zero mismatches.** (Independently counted; corroborates
the drafter's table for this range, including their two self-caught fixes.)
**Exclamation-mark parity: 16 source / 12 candidate. Three paragraphs mismatch** (IDX 37, 38, 58).
**Quote style: clean.** Zero single-quote-as-quotation-mark defects, zero curly quotes, all
double-quote pairs balanced.
**Archaism: clean.** Zero hits.
**File structure: sound.** 70 entries, one-to-one with source.

### Findings by severity (this range only)

| Severity | Count | Findings |
|---|---|---|
| **Major** | **1** | F-19 |
| **Moderate** | **8** | F-04, F-07, F-11, F-17, F-20, F-23, F-24, F-26 (F-23 and F-24 fall in the same paragraph but are two independent defects) |
| **Minor** | **21** | F-01, F-02, F-03, F-05, F-06, F-08, F-09, F-10, F-12, F-13, F-14, F-15, F-16, F-18, F-21, F-22, F-25, F-27, F-28, F-29, F-30 |

**Tally: 1 major, 8 moderate, 21 minor = 30 findings across 35 paragraphs.**

Paragraphs with **no issues at all**: IDX 35, 36, 41, 42, 44, 48, 50, 54, 56, 57, 61, 64, 66, 67
(14 of 35).

### Must-fix before acceptance

1. **F-19 (IDX 58 / ¶59)** — "while you are being slighted" → "while you find fault with him".
   Direction inversion; the fifth confirmed instance of this defect class across the project.
2. **F-26 (IDX 65 / ¶66)** — repunctuate so the not-X-but-Y does not parse backwards.
3. **F-17** — name the triad consistently at IDX 53, 59, 65.
4. **F-23 / F-24 (IDX 62 / ¶63)** — drop "truly", fix the object of "despise".
5. **F-07, F-11, F-20, F-04** — the softening and referent findings.

### Overall

Fidelity in this range is high and the two structurally hardest passages — the pride/confession
paradox and the mediator dilemma — are handled correctly, with the paradox left genuinely
unresolved as required. Rhetorical-question parity is exact, there is no archaism, no quote-style
defect, and no compression anywhere (IDX 56, the dog/hare/lizard/spider paragraph flagged as a
drop risk, is fully intact down to its subordinate motive-clauses). The single major defect is one
more instance of the direction inversion that has appeared in every prior book, in a clause where
God's role as judge is silently converted into God's role as victim; it is a one-line fix.
**Recommendation: accept after correction**, on the same basis as Books 3–6, 8 and 9.
