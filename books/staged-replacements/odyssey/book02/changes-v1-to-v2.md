# The Odyssey, Book 2 — changes from `candidate-v1.json` to `candidate-v2.json`

Every change made at step 6, by paragraph ID, against the finding it answers.
Round 1's findings are in `review/findings-v1.md`.

| | |
|---|---|
| Frozen predecessor | `candidate-v1.json`, sha256 `2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea` — **not edited**; it is the record of what round 1 reviewed (**D10**) |
| Corrected file | `candidate-v2.json`, sha256 `71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126` |
| Readable copy | `candidate-v2-readable.md` |
| Built by | `../scripts/build_book02_v2.py` (asserts v1's frozen hash first; every `old` string must match exactly once; every hazard and standard re-asserted after) |
| Substitutions | **23**, in **15** of 35 paragraphs |
| Findings applied | **every paragraph-level finding — 14 minor and 8 optional. None declined.** Plus all four records findings, answered outside the text |
| Word ratio | 0.9993 → **1.0002** |
| Butler token retention | 0.889 → **0.902** |

**The ratio rose and so did retention, in the same direction, which is what
these corrections are.** Nineteen of the twenty-three substitutions put a word
of Butler's back (`comely`, `comeliness`, `noble`, `aggrieved`, `sacrificing`,
`sailing`, his causal `for`, `many`, `set upon`, `myself`, `infinite`, `rose`,
`may expect`, the removal of a supplied `my` and a supplied `down`). A round of
corrections that moves *toward* the source is the shape this package wants; a
round that moved away from it would be a warning.

---

## Minor findings — paragraph-level (14, all applied)

### B02-P001 — finding 1.1

| | |
|---|---|
| Butler | `He bound his sandals on to his **comely** feet` … `Minerva endowed him with a presence of such divine **comeliness** that all marvelled at him` |
| v1 | `on his **shapely** feet` … `such divine **grace of presence**` |
| **v2** | `on his **comely** feet` … `such divine **comeliness** of presence` |

Butler says *comely* of Telemachus's own feet and *comeliness* of what Athena
adds, twenty words apart in one paragraph. The young man is already fair to
look at and the goddess pours more of the same quality over him — which is why
the councillors make way for him. v1 broke the pair into two unrelated words
and the connection went with it.

The reviewer's primary proposal is taken rather than the alternative
(`divine beauty of presence`, which keeps the sense-pair but not the root),
because the finding is about the **echo**, and only the root restores it.
`comely` is in ordinary use; neither word is obscure.

**Consequence for the record:** `comeliness` was on v1's assert-list of dead
words in `README.md` and `continuity.md`. It is **removed** from that list,
deliberately and with the reason recorded — see records finding **R3** below.

### B02-P002 — finding 2.1

`Ilius, land of **fine** horses` → `Ilius, land of **noble** horses`.
Butler's `steeds` is dead and rightly goes; `noble` is neither dead nor
obscure, and it is the **epithet** — the same construction as *sea-girt
Ithaca*, which this package keeps. `fine` is the flattest adjective in English
and it also collided with `my fine hothead` at B02-P020, where *fine* is the
candidate's general-purpose upgrade word. An epithet is not built out of that.

### B02-P004 — finding 4.1

`it is I who am the most **wronged**` → `the most **aggrieved**`. Butler pairs
*aggrieved* with *grievance* one sentence later, and v1 broke the pair while
keeping its second half. The pair carries the argument: Telemachus is
answering *who called this assembly and why*, and the answer is a claim about
**standing** — I am the one with the grievance — which he immediately
qualifies as personal rather than public. `wronged` asserts instead that a
wrong has been done, which is what the rest of the speech goes on to argue and
has not yet established. `aggrieved` is current English.

### B02-P004 — finding 4.2

`**slaughtering** our oxen, sheep and fat goats` → `**sacrificing**`. Butler's
word is exact. These animals are killed at an altar and the suitors' feasts
are sacrificial feasts; part of what makes their consumption an outrage rather
than plain greed is that they are performing another man's sacrifices with
another man's animals in another man's house. `slaughtering` turns it into a
butchery bill. The word is neither archaic nor unclear, and a modern reader
hears the ritual sense of *sacrificing* in this context — the alternative is
to lose it entirely.

### B02-P009 — finding 9.1

eagles `**gliding** side by side` → `**sailing** side by side`. Butler's image,
and not archaic: eagles *sailing* on the wind is ordinary English for exactly
this motion. It also carries a resonance this paragraph is entitled to — Zeus's
birds sail over the assembly in the Book that ends with Telemachus's ship
sailing out of the harbor, omen and fulfilment sharing a verb. `gliding` is
accurate and inert.

### B02-P010 — finding 10.1

`it will be better for them**. I** am not prophesying without due knowledge:`
→ `it will be better for them**, for I** am not prophesying without due
knowledge:`. Butler's `for` makes the prophet's credentials the **reason** the
suitors should act; v1 demoted it to a separate assertion and cut one argument
into two remarks. Halitherses is saying *do it now, because when I tell you
something it comes true*. This is the same loss Book 1's review recorded at its
finding 7.2, which is why it is worth a row of its own here. The colon that
follows already carried the second link (credentials → evidence) correctly; it
was the first link that was gone.

### B02-P011 — finding 11.1 *(and it changes accepted Book 1)*

`all the marriage gifts a beloved daughter **deserves**` → `a beloved daughter
**may expect**`. Butler's `that so dear a daughter may expect` is a claim about
**custom**; `deserves` is a claim about **merit**, and it is spoken here by
**Eurymachus**, mid-threat, about a woman he has just called artful and is
proposing to evict. Raised at Book 1's round 1 as an unnumbered remark, carried
over here for consistency, and deferred twice; Book 2's reviewer was asked to
rule and did.

**Applied in both Books at once**, per the cross-Book formula rule:
`../book01/candidate-v3.json` is a recorded successor to accepted Book 1, with
`../book01/changes-v2-to-v3.md` and pointers from Book 1's README, provenance
and manifest. Book 1's accepted `candidate-v2.json` and its `ACCEPTANCE.md` are
byte-unchanged. `../GLOSSARY.md`'s formula row is rewritten from
deferred-and-flagged to settled.

### B02-P013 — finding 13.1

`He **too** spoke to them plainly` → `He **then** spoke to them plainly`.
Butler's `He, then,` is a sequential connective; `too` is a comparison, and it
asserts what Butler leaves the formula itself to say. The point of the repeated
tag is that it marks Halitherses and Mentor as the Book's two truth-tellers
**without comment** — the reader notices the repetition or does not. `He too`
points at the repetition and announces it. That the comparison is true is not
the issue: the standard forbids the explanatory addition, and the formula is
weaker for being flagged.

### B02-P015 — finding 15.1

`for one man to fight **a crowd** over his food` → `to fight **with many** over
his food`. Mentor has just closed, one paragraph earlier, with `for you are
many and they are few`; Leiocritus's opening move is to pick *many* up and turn
it round — one man against many is a bad bet, so your numbers prove nothing.
Butler's repetition is how the exchange is joined across the paragraph break.
`victuals` is dead and rightly goes; `many` is not.

### B02-P015 — finding 15.2

`were to **come upon** us while we were feasting` → `were to **set upon** us`.
`set upon` is an attack; `come upon` is merely finding them there. The whole of
Leiocritus's boast is a picture of Odysseus **attacking** and losing — which is
why the next clause reaches for his wife's disappointment and his blood on his
own head. With `come upon`, the aggression enters only at *do his best to drive
us out*, and the sentence's escalation flattens exactly where it should bite.
`set upon` is current English.

### B02-P020 — finding 20.1

`came up to him at once**, laughed, and took** his hand in his own` → `came up
to him at once **and laughed as he took** his hand in his own`. Butler's laugh
and the hand-taking are **one gesture**: Antinous laughs *while* taking the
hand, which is what makes the hand-taking a mockery rather than a greeting, and
why Telemachus snatches his hand back two paragraphs later. Three items in a
row read as a sequence of separate civilities.

### B02-P023 — finding 23.1

`from Pylos, or **from Sparta again**, where he seems bent on going` → `or
**else from Sparta**, where he seems bent on going`. Butler's `or again from
Sparta` uses *again* as the discourse word meaning *or else, for another
thing*. Moved to after *Sparta* it becomes the ordinary adverb meaning *a
second time* — so v1 said Telemachus would be fetching friends from Sparta once
more, and then contradicted itself four words later with *where he seems bent
on going*, which tells the reader he has not been. `or else` is the reviewer's
first proposal and keeps the discourse sense in a word a modern reader cannot
misparse.

### B02-P026 — finding 26.1

`the best wine you have, **after** what you are keeping for my father's own
drinking` → `**apart from** what you are keeping`. The one Victorian
construction carried over intact that still obstructs: `after what you are
keeping` means *next best after the wine you are reserving*, and a modern
reader meets `after` as temporal — draw the wine *after* doing something else —
and has to reread. The clause cannot simply go: Telemachus takes the
second-best because his father's wine stays untouched against his return, which
is the same tenderness as the casks *in case Odysseus should come home again
after all* one paragraph earlier. One word, and the ambiguity is gone.

### B02-P034 — finding 34.1

`deep blue waves, **whereupon** Telemachus told them` → `**and then**
Telemachus told them`. `whereupon` is `whereon` lightly respelled — a legalism
in current English and exactly the register the voice rules exclude. v1's own
assert-list required `whereon` to be absent; it passed, and the word survived
under one letter's disguise.

**On which rendering to standardize**, since the reviewer left it open:
`and then` is chosen, matching B02-P009. `whereon` is a connective, not a
content word, so it is **not** fixed as a formula the way an epithet is — it is
rendered by what it connects. See `continuity.md` for the rule and for why
B02-P007's `and after that` correctly stays different.

---

## Optional findings — paragraph-level (8, every one decided, every one applied)

Decision **D11** governs: a finding is answered either way, and none is carried
forward as a preference. Each row records the reason, not just the outcome.

| Finding | Change | Decision and reason |
|---|---|---|
| **1.2** B02-P001 | `Telemachus **got up** and dressed` → `**rose** and dressed` | **Applied.** `rose` is not archaic, and the candidate already keeps it three paragraphs later — B02-P004's `rose at once` is Butler's own, unchanged. One plain Butler verb rendered two ways inside four paragraphs is exactly the class the package's "recurring words the edition holds steady" table exists to stop, and the changed one was the Book's opening sentence, where `got up` lands a register below the dawn formula it follows. |
| **2.2** B02-P002 | `of **vast** experience` → `of **infinite** experience` | **Applied.** `infinite` is Butler's hyperbole and is not archaic; `vast` is the same figure one size smaller, bought for nothing. Downgrading a qualifier that costs nothing to keep is the small-loss class Book 1's review named. |
| **6.1** B02-P006 | `I would not have **my** skill in needlework perish` → `I would not have skill in needlework perish` | **Applied**, though the reviewer's confidence was low. The package's rule is that nothing is supplied which Butler does not have, and this is a supplied word. It also has an effect: Butler's bare `skill in needlework` is the art itself, not Penelope's possession of it, and the boast is more graceful for being impersonal — she is in the middle of her most famous deception. The sentence is very slightly harder with the word gone; that is the trade the rule makes. |
| **7.1** B02-P007 | `so long **we shall** go on eating up your estate` → `so long **shall we** go on` | **Applied.** The correlative `as long as … so long` is the sentence's spine and v1 kept it, but `so long we shall go on` is not a construction modern English makes without the inversion; the inversion is what signals that `so long` is the correlative and not an adverb out of place. Not a breach of the voice rule against inverted word order: a fronted correlative adverbial takes subject-verb inversion in ordinary modern English. The reviewer's second option (`for exactly that long`) was rejected as more words for less of Butler. |
| **11.2** B02-P011 | `I can read these omens far better` → `I can read these omens **myself** far better` | **Applied.** `myself` is the word that makes the line a challenge to Halitherses's **standing** rather than a remark about his competence: Eurymachus, who is not a seer, is claiming the seer's own ground. It is easy to hear as redundant emphasis, which is presumably why it went; it is not. |
| **15.3** B02-P015 | `let **the boy's father's** old friends … speed **him** on his journey` → `let **his father's** old friends … speed **the boy** on his journey` | **Applied.** v1's rearrangement stacked two possessives on one noun phrase, which English reads badly, and did so to avoid a pronoun that was never ambiguous. Butler's own arrangement restored; pure prose, no change of sense. |
| **31.1** B02-P031 | `**Then** she went to the house of Odysseus` → `**Next** she went` | **Applied.** Butler opens the paragraph with an additive (`Furthermore` — one more thing Athena did) and closes it with a sequential (`Then`); v1 used `Then` for both, so the paragraph opened and closed on the same word four sentences apart. `Next` keeps the additive force without Butler's dead adverb. |
| **34.2** B02-P034 | `brought the things **down** as he told them` → `brought the things as he told them` | **Applied.** `down` is supplied, and harmless, and probably right — but it is a physical direction Butler does not give, in the Book's most physically exact paragraph, where the package's own rule is that concrete detail is kept exactly and **not supplied**. Applying it here and declining it would have left the rule meaning whatever the drafter liked. |

**A note on the count.** The reviewer's summary table says 11 optional (9
paragraph-level + 2 records). Enumerating the numbered `(optional)` entries in
`findings-v1.md` gives **8** paragraph-level — 1.2, 2.2, 6.1, 7.1, 11.2, 15.3,
31.1, 34.2 — plus records R3 and R4, for **10**. Every numbered optional
finding in the file is applied and listed above; the discrepancy is in the
summary table, not in the coverage. Recorded rather than quietly reconciled.

---

## Records findings (4, all answered outside the text)

**R1 — `Mycene` in `GLOSSARY.md`.** Answered, and it became a package-wide
decision: **D13**. Butler spells the **city** `Mycene` too (PG 1377, Book 3;
PG 9326, Book 21), so the row filing her under *names that change in no Book*
would have misled Book 3's drafter four hundred PG lines later. The woman keeps
Butler's spelling; the **city takes `Mycenae`** under **D8**, because
`odyssey-threads.json` gives Agamemnon the epithet *"Murdered King of Mycenae"*
— its only occurrence of either spelling — and has no entry for the woman.
Confirmed independently: the served `modern-en` being replaced already draws
this exact line (`Mycene` at its Book 2 ¶7, `Mycenae` at Book 3 ¶24 and Book 21
¶6) without recording it. Book 2's own text is unaffected; the build now
asserts that `Mycenae` does **not** appear here.

**R2 — `continuity.md`'s B02-P003 entry is wrong on a countable fact.** It said
"Butler's three questions stay three". Butler has **two** question marks in
B02-P003 and the candidate has three. The split is good and no finding is made
against the text; the continuity sheet is the audit trail and a claim in it has
to hold. Restated as what actually happened: Butler's second interrogative,
which carries three limbs, is split into two questions.

**R3 — the archaism assert-list has a gap the text walked through.**
`README.md` asserted that `whereon` does not survive; it did not, and
`whereupon` did. `whereupon` is **added** to the list, and `comeliness` is
**removed** from it (finding 1.1 restores the word deliberately, and the
reviewer ruled it neither obscure nor archaic). The general point is recorded
where it belongs, in `README.md` and `continuity.md`: **an assert-list of exact
dead words is a regression guard, not a check** — it cannot catch a dead word
respelled, and nothing in this package should be read as claiming it can.

**R4 — the `[do not]` bracket is classified on the wrong grounds.**
`continuity.md` called it "a textual mark … rather than a translator's
supplement". Butler's footnote 18 says the opposite in terms: *"The authoress
has bungled by borrowing these words verbatim from the 'Iliad', without
prefixing the necessary 'do not,' which I have supplied."* The disposition is
unaffected and **gets stronger** — Butler calls the words necessary, so keeping
them is his judgement and not ours. The record now quotes him, and the class
table the reviewer asked for is written into `../GLOSSARY.md` and the ledger as
decision **D12**, with all fifteen brackets in the poem enumerated from this
package's own pass over PG #1727's body. **Class C is open and blocks Book 4.**

---

## The Book-level flow read (step 7)

The corrected book was read straight through for voice, pacing, repetition,
terminology and transitions. **No further change was made.** Three things
checked because the corrections touched them:

- **`rose` is now one verb in one Book** — B02-P001 and B02-P004, matching
  Butler in both places.
- **`whereon` is now rendered two ways, and the difference is principled, not
  residual**: `and then` at B02-P009 and B02-P034, where it joins two actions
  in immediate sequence, and `and after that` at B02-P007, where it follows a
  speech and covers three years of nightly unpicking. Recorded in
  `continuity.md` so a later Book does not "fix" it into one.
- **The two `plainly and in all honesty` tags are still identical** (B02-P009,
  B02-P013) and now carry Butler's sequential `then` rather than an announced
  comparison.

## Nothing else moved

The build asserts, after the corrections: the four name counts against the
source's (Odysseus 17, Athena 8, Zeus 6, Eurycleia 2); no Roman form, no
`Rhea`, `Helios` or `Cronos`; `Ops` once with `daughter of Ops, son of Pisenor`
intact; `Ilius` and `Troy` each once; `Mycene` once and no `Mycenae`; no
bracket mark, with the class-A words and their supplied colon standing; the
Erinyes gloss; zero ASCII quotes; the 29/28 quotation balance with **D4**'s
single unbalanced paragraph at B02-P006 and B02-P007 opening its own mark and
Penelope's inner quotation still closed; twenty-one dead words absent and six
British spellings absent; the eight cross-Book formulas present in **both**
Book 2 v2 and Book 1 **v3**; 35 paragraphs one-to-one, no newlines, no
paragraph byte-identical to Butler; ratio inside 0.90–1.10. It also refuses to
run if any of the six "also noted" readings the reviewer **declined** to raise
has been changed.
