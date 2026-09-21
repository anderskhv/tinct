# Fidelity Review — Leviathan, Chapter 18 (Hobbes Ch. 17), candidate-B-revised

**Reviewer role:** Independent fidelity re-check of a targeted revision, per
`books/prompts/fidelity-review-prompt.md`, adapted for a re-check rather than
a full first pass. `source.json` is the sole fidelity anchor.

**Scope claimed by the requester:** paragraphs 0, 1, 5, 12, 13 changed;
2-4, 6-11, 14-15 byte-identical to `candidate-B.json`, which already passed
an independent full fidelity review (ACCEPT AS-IS).

---

## Coverage

1. **Diffed `candidate-B.json` vs `candidate-B-revised.json` programmatically**
   (full-text paragraph equality, all 16 paragraphs). Result: differing
   indices are exactly **{0, 1, 5, 12, 13}** — matches the claimed set, no
   other paragraph touched. Paragraph counts: source 16, candidate-B 16,
   candidate-B-revised 16 — no merge/split/reorder.
2. **Read every changed paragraph (0, 1, 5, 12, 13) individually against
   `source.json`**, each in a packet with its immediate neighbor(s) for
   context (paragraph -1/+1 read even where unchanged), specifically
   packets [S0-S2], [S4-S6], [S11-S14].
3. **Read all 16 paragraphs of `candidate-B-revised.json` in one final pass**
   for cross-boundary consistency (terminology, argument flow, and the
   para-12→para-13 "him"/"essence of the commonwealth" linkage specifically
   requested).
4. Did **not** re-run a full first-pass fidelity check on paragraphs 2-4,
   6-11, 14-15 (per instructions — they are unchanged and already accepted),
   but did read them in full during the final whole-chapter pass, which
   surfaced one cross-boundary defect (see D3 below) that a change-only
   review would have missed.

---

## Defects found

### D1 — Paragraph 5: broken parenthesis (BLOCKING)

Source (context, unquoted rendering): "...live sociably one with another,
(which are therefore by Aristotle numbred amongst Politicall creatures;)
and yet have no other direction..."

Candidate-B-revised, paragraph 5 (exact text):
> "...live sociably with one another (which is why Aristotle counted them
> among the political creatures — that is, creatures naturally suited to
> live in organized communities — and yet they have no direction beyond
> their individual judgments and appetites, and no speech by which one of
> them can tell another what he thinks would serve the common benefit. So
> someone may perhaps want to know why mankind cannot do the same. To which
> I answer:"

The opening `(` before "which is why Aristotle" is **never closed** —
verified programmatically: 1 open paren, 0 close parens in this paragraph.
The inserted gloss ("— that is, creatures naturally suited to live in
organized communities —") uses em-dashes that read like the parenthetical's
close, but the actual `)` that should close the Aristotle aside is missing.
This isn't cosmetic: as written, everything from "which is why Aristotle..."
through "...To which I answer:" is nested inside one unclosed parenthetical,
which garbles the sentence boundary between the Aristotle aside and the main
clause ("and yet they have no direction...").

**Fix:** close the parenthesis where the source closes it, before "and yet":
`(which is why Aristotle counted them among the political creatures — that
is, creatures naturally suited to live in organized communities) and yet
they have no direction beyond their individual judgments and appetites...`

### D2 — Paragraph 5: unlicensed addition (non-blocking, flag per method)

"— that is, creatures naturally suited to live in organized communities —"
has no counterpart in the source, which only says "numbred amongst
Politicall creatures." This is a "helpful" invented gloss under the review
method's Additions criterion. It happens to be an accurate gloss of
Aristotle's ζῷον πολιτικόν, so I'm not treating it as a meaning-distorting
defect, but it should be logged: the source makes no such aside, and no
other technical term in this chapter (e.g. "CIVITAS," "Mortal God") gets a
parenthetical definition — see D4, which is the same pattern in paragraph
12 and *is* blocking there because it also adds unlicensed content. If kept,
fine on its own terms once D1's punctuation is fixed; if the project wants
zero unlicensed additions, cut it.

### D3 — Paragraphs 0 vs 3/11: cross-boundary terminology inconsistency (BLOCKING)

Source uses the phrase "keep them in awe" as a recurring, deliberate image
for sovereign power, at three points in this chapter:
- Para 0: "...no visible Power to keep them **in awe**, and tye them by
  feare of punishment..."
- Para 3 (unchanged): "...without a Common power to keep them all **in
  awe**..."
- Para 11 (unchanged): "...a Common Power, to keep them **in awe**, and to
  direct their actions..."

Pre-revision candidate-B rendered all three consistently as "in awe."
Candidate-B-revised changes **only** paragraph 0 to "keep them in check,"
while paragraphs 3 and 11 (untouched by this revision round) still read
"in awe." The revision brief said paragraph 0 "reworded 'in awe'" as if
it were a local stylistic call, but it's a recurring technical image
Hobbes reuses across the chapter (and the book) — now 2-of-3 instances say
"in awe" and 1 says "in check," which reads as an inconsistency, not a
deliberate variation, and "in check" also has a distinct connotation
(mechanical restraint) versus "in awe" (reverential/fearful submission to a
power), which is exactly the psychological mechanism Hobbes is describing.

**Fix:** revert paragraph 0 to "keep them in awe" (matching 3 and 11) rather
than "keep them in check." If "in check" is preferred for readability, it
must be applied to all three instances — but changing only the one instance
in a revision batch that didn't touch 3 or 11 is out of scope for this round
and should not happen silently.

### D4 — Paragraph 12: unlicensed addition in the central definitional passage (BLOCKING)

Source: "...is called a COMMON-WEALTH, in latine CIVITAS."

Candidate-B-revised: "...is called a COMMONWEALTH — in Latin, CIVITAS
(Latin for "commonwealth," or "state")."

The added parenthetical `(Latin for "commonwealth," or "state")` is not in
the source and is also circular/redundant — the sentence has just said
CIVITAS is Latin for commonwealth by translating it. This is exactly the
kind of "helpful invented explanation" the review method flags, and it
lands in the paragraph the task specifically called out as doctrinally
central. It doesn't distort Hobbes's claim, but it is unlicensed content in
the passage that most needs word-for-word discipline.

**Fix:** delete the added parenthetical: "...is called a COMMONWEALTH — in
Latin, CIVITAS." (matches source content exactly, no gloss).

### D5 — Paragraph 1: "pretences" → "claim" loses skeptical connotation (fix recommended)

Source: "...enlarge their Dominions, upon all **pretences** of danger, and
fear of Invasion..."

Pre-revision candidate-B: "...enlarge their dominions on any **pretext** of
danger or fear of invasion..."

Candidate-B-revised: "...enlarge their dominions on any **claim** of danger
or fear of invasion..."

"Pretence"/"pretext" carries an implication that the stated justification
is an excuse, not necessarily the real motive — consistent with Hobbes's
skeptical, almost cynical framing of state expansion in this paragraph
(states behave like the small-family raiders described earlier, dressed up
in "pretences"). "Claim" is neutral — it doesn't carry that
alleged-vs-real distinction, and softens the irony the paragraph is going
for. This is a certainty/hedging-class shift, not a wholesale meaning
change, so I'm not blocking the whole paragraph on it, but it should be
fixed since a more faithful, already-approved rendering ("pretext") existed
one revision ago and was needlessly changed.

**Fix:** restore "pretext" (or "pretence"): "...enlarge their dominions on
any pretext of danger or fear of invasion..."

---

## Checked and clear

- **Paragraph 0** — removal of the inserted rhetorical question ("Why,
  then, do they accept...?") is correctly done: the replacement sentence
  ("Yet we see them living under restraint in commonwealths, accepting
  limits on themselves.") tracks the source's parenthetical "(in which wee
  see them live in Common-wealths)" without inventing new content. No
  omission, no new claim. (Separately from the "in awe"→"in check" issue in
  D3, which is the only remaining problem in this paragraph.)
- **Paragraph 1** — sentence restructuring around "notwithstanding the Lawes
  of Nature (which every one hath then kept, when he has the will...)" into
  two sentences ("So the laws of nature only bind a man when... Despite
  them, then, if no power is set up...") preserves the source's logic
  (laws are only actually adhered to when safe; absent that, and absent a
  sovereign, every man relies on his own strength). It shifts a descriptive
  parenthetical into something closer to a normative claim about when the
  laws "bind," which is a close paraphrase rather than a clean one-to-one
  rendering, but I did not find a dropped or added claim — non-blocking.
  Also confirmed: "so far from being reputed against the Law of Nature,
  that the greater spoyles... the greater was their honour" is preserved as
  "this was not thought contrary to the law of nature — quite the
  opposite: the greater the plunder... the greater their honor" — same
  claim, restructured, nothing lost.
- **Paragraph 12, the performative contract formula** — "I Authorise and
  give up my Right of Governing my selfe, to this Man, or to this Assembly
  of men, on this condition, that thou give up thy Right to him, and
  Authorise all his Actions in like manner" is modernized clause-for-clause
  ("I authorize and give up my right of governing myself to this man, or to
  this assembly of men, on this condition, that you give up your right to
  him, and authorize all his actions in the same manner"). Every clause
  present: the grant, the addressee (man or assembly), the reciprocal
  condition, the reciprocal grant, the scope ("all his actions"). Nothing
  dropped, nothing added, "thou/thy" → "you/your" and "in like manner" →
  "in the same manner" are pure modernizations with no semantic drift.
  ACCEPT as modernized.
- **Paragraph 12, "plurality" vs "majority"** — this revision correctly
  restores "by a plurality of voices" (matching source's "by plurality of
  voices" exactly), where the pre-revision candidate had silently narrowed
  it to "majority of voices" (plurality ≠ majority — plurality is not
  necessarily >50%). This is a genuine improvement introduced by the
  revision, not flagged as a defect.
- **Paragraph 13, the formal definition** — "One Person, of whose Acts a
  great Multitude, by mutuall Covenants one with another, have made
  themselves every one the Author, to the end he may use the strength and
  means of them all, as he shall think expedient, for their Peace and
  Common Defence" is modernized as "one person, whose acts a great
  multitude, by mutual covenants one with another, have made themselves
  every one the author of, to the end that he may use the strength and
  means of them all, as he thinks fit, for their peace and common defense."
  Every clause present: the actor (multitude), the mechanism (mutual
  covenants), the act of authorization ("author of" his acts), the purpose
  clause (strength/means, at his discretion, for peace and common
  defense). "of whose Acts... have made themselves... the Author" →
  "whose acts... have made themselves... the author of" is a legal,
  acceptable reordering of an archaic construction, not a meaning change.
  "as he shall think expedient" → "as he thinks fit" is a minor,
  non-blocking nuance shift (expedient carries a slightly more pragmatic/
  discretionary shade than "fit"), noted but not blocking.
- **Paragraph count / structure** — 16 paragraphs in source, candidate-B,
  and candidate-B-revised; no merges, splits, or reordering anywhere.

---

## Cross-boundary check (final whole-chapter pass)

- **Para 12 → Para 13 linkage** (specifically requested): paragraph 13's
  "And in him consists the essence of the commonwealth" still refers
  cleanly to "one man, or one assembly of men" from paragraph 12 — the
  antecedent is unambiguous across the boundary, and both paragraphs use
  "Person"/"commonwealth" terminology consistently with each other and with
  paragraph 14 ("the one who carries this Person is called the SOVEREIGN").
  This linkage is intact and reads correctly.
- **"in awe" recurring image** — broken across paragraphs 0/3/11, see D3.
  This is the one real cross-boundary defect the final pass surfaced beyond
  the packet-level review.
- No other terminology drift found between the revised paragraphs and their
  unchanged neighbors (e.g., "commonwealth," "covenant," "sovereign,"
  "Person" are all used consistently throughout).

---

## Verdict: ACCEPT WITH FIXES REQUIRED

Fixes required before acceptance:
1. **D1** — close the broken parenthesis in paragraph 5.
2. **D3** — revert "keep them in check" to "keep them in awe" in paragraph 0
   (or apply the change consistently to paragraphs 3 and 11 as well, if the
   team decides "in check" is the better modernization — but pick one and
   make it uniform).
3. **D4** — remove the added `(Latin for "commonwealth," or "state")` gloss
   in paragraph 12.
4. **D5** — restore "pretext" (or "pretence") in place of "claim" in
   paragraph 1.

D2 (the "political creatures" gloss) is a judgment call, not a blocking
fidelity defect on its own — flagging it for the team's call, not requiring
its removal, as long as D1's punctuation is fixed regardless.

None of these four required fixes are severe misreadings or dropped
doctrine — the two doctrinally central passages (paragraphs 12 and 13,
the contract formula and the formal definition of a commonwealth) came
through the modernization intact, clause-for-clause, which was the
highest-risk part of this revision. The required fixes are: one syntax bug,
one internal-consistency regression on a recurring key term, and two
small unlicensed/softened-connotation word choices. All are cheap, local
patches; no re-draft needed.
