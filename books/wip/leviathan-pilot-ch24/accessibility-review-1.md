# Accessibility Review — Reviewer A (fresh, candidate-only)

**Chapter:** 24 / "Chapter 23. Of the Publique Ministers of Soveraign Power"
**File reviewed:** `candidate-sonnet.json`

## Coverage

I read all 13 paragraphs (indices 0–12) of `candidate-sonnet.json` in full,
start to finish, then re-read paragraph by paragraph. I did not open
`source.json`, `current-modern-en.json`, or any other file in this
directory or elsewhere in the repo.

## Per-paragraph issues

**Paragraph 0**
> "in this I shall speak of the organic parts — namely, the public ministers"

"Similar parts" (implied from "In the last chapter I spoke of the similar
parts") and "organic parts" are technical terms from a body-politic analogy
that this chapter doesn't itself explain — a reader coming to this chapter
without the prior one will have no idea what "similar parts" vs. "organic
parts" of a commonwealth means, and "organic" here doesn't mean what it
means in ordinary contemporary usage (natural/whole-food, or "not
artificial"). This is a soft stumble at the very first sentence, which
matters for a general reader's first impression.

**Paragraph 1**
> "nor stewards, chamberlains, cofferers, nor any other officers of a
> monarch's household"

"Cofferers" (household treasurers) is genuinely obscure vocabulary with no
gloss or context clue — most contemporary readers won't recognize the word
at all, and nothing in the sentence helps them guess its meaning (unlike
"chamberlains," which at least sounds like a household role). "Stewards"
and "chamberlains" are borderline-archaic but recoverable from context;
"cofferers" isn't.

**Paragraph 3**
> "At home, first, for the economy of the commonwealth"

"Economy" is being used in its older sense of "management/administration
(of a household or state)," not the modern financial-system sense. A
contemporary reader will likely default to the modern meaning and then have
to backtrack once the sentence turns to treasury officials — a small but
real misread risk.

**Paragraph 6**
> "As already explained, all judicature is essentially bound up with
> sovereignty, so all other judges are merely ministers of whoever holds
> the sovereign power."

"Judicature" (the administration of justice, or judicial authority) is a
formal/legal word not in common contemporary use. It's recoverable from
context but will cause a brief stumble for a general reader.

**Paragraph 7**
This whole paragraph is a chain of nested conditionals about how a
defendant comes to be understood as having "agreed" to his judges. It's
grammatically legal throughout, but the logic is dense enough (three
numbered sub-cases, each hinging on implicit consent) that it reads like a
legal brief rather than narrative prose. Example:
> "First, if the defendant is allowed to challenge any of his judges whose
> interest makes him suspect — since the complainant has already chosen his
> own judge — then the judges he does not challenge are ones he has himself
> agreed to."

This is parseable on a careful read but will likely require at least one
re-read for most general readers; the parenthetical "since the complainant
has already chosen his own judge" interrupts the main clause exactly where
the reader is trying to hold the conditional in mind.

**Paragraph 8**
> "So, having judges of his own choosing, the party could allege nothing
> against the sentence being final."

"Allege nothing against" is stiff/archaic legal phrasing for "he had no
grounds to object to" — a general reader will understand the gist but the
phrasing itself reads as translated-but-not-fully-modernized legalese.

Also in this paragraph: "twelve men were agreed on without objection, and
he was judged by those twelve" is clearly describing a jury, but the word
"jury" is never used — a reader has to infer the institution from the
description. This isn't wrong, but it's a missed opportunity for clarity
and a small extra cognitive step for a reader who already has to track
"Common Pleas," "Public Pleas," "Pleas of the Crown," lords vs. commons,
and county-based objection-to-judges procedure all in one paragraph. The
paragraph is a lot to hold at once even though each individual sentence is
reasonably clear.

**Paragraph 11**
> "are neither public nor private ministers of the commonwealth, because
> none of their actions have the commonwealth as their author"

"Have the commonwealth as their author" is confusing on its own terms —
"author" here is doing specialized work (the one who authorizes/owns
responsibility for an act) that isn't established anywhere in this
chapter. A general reader will likely read "author" in its ordinary sense
(writer) and the sentence will simply not parse.

> "since there is no one there to acknowledge any person in him but his
> own, he is only a private minister"

This is the hardest sentence in the chapter. The pronoun chain ("him,"
"his own," "he") is ambiguous, and "acknowledge any person in him but his
own" is very compressed — it's trying to say something like "there's no
one abroad who recognizes him as representing anyone but himself," but as
written it requires real effort to untangle, and a reader could easily
come away with the wrong meaning or none at all.

**Paragraph 12**
> "For the advice is addressed to the sovereign alone, and his person
> cannot, in his own presence, be represented to him by anyone else."

Dense repetition of "person / presence / represented / him" referring to
the same referent (the sovereign) in different grammatical roles within
one sentence. It's logically fine once worked out, but the surface reads
as circular and will likely need a second pass.

## What reads well

- The recurring body-politic comparisons (public ministers as "nerves and
  tendons," "hands," "eye," "ear," "organs of voice") are vivid, concrete,
  and land clearly each time they appear — they're doing real
  accessibility work, translating an abstract classification scheme into
  something visual and memorable.
- Paragraph 1's opening definition — "A PUBLIC MINISTER is someone who is
  employed by the sovereign... with authority to represent the person of
  the commonwealth in that employment" — is clean, plain, and states the
  chapter's core concept without hedging.
- The Latin phrases in paragraph 5 (*Dei Gratia*, *Dei Providentia et
  Voluntate Regis*) are handled well: each is immediately followed by a
  plain-English gloss in parentheses, so a reader never has to sit with
  untranslated Latin.
- Paragraph 8's definitions of "Common Pleas" and "Public Pleas" ("By
  Common Pleas I mean..."; "By Public Pleas (also called Pleas of the
  Crown) I mean...") are a good accessibility pattern — the text defines
  its own specialized terms inline rather than assuming familiarity.
- Paragraphs 4, 9, and 10 are short, direct, and read smoothly with no
  stumbles — good models for the rest of the chapter's register.

## Overall verdict

**Needs targeted fixes.**

The chapter is substantially readable as contemporary prose — the sentence
structures are generally sound, the recurring anatomical metaphors do real
work, and several potentially hard passages (the Latin, the court-system
terminology) are already glossed in place. But there's a cluster of
specific problems concentrated in paragraphs 1, 7, 8, 11, and 12: one
genuinely obscure word ("cofferers"), a couple of legal-register phrases
that weren't fully modernized ("allege nothing against," "judicature"),
one paragraph so dense with sub-clauses it reads like a legal brief
(paragraph 7), and — most importantly — one paragraph (11) that contains
the chapter's two hardest sentences: an unglossed technical use of
"author" and a genuinely tangled pronoun-heavy sentence about secret
agents abroad that a general reader is likely to misread or give up on.
None of this requires a broad rewrite; it's a short, specific list of
sentences to revisit.

## Summary

This chapter reads, on the whole, as clear and reasonably contemporary
prose, carried by a strong recurring metaphor (public ministers as organs
of a body) that a general reader can follow without difficulty. The
trouble spots are localized rather than pervasive: a handful of archaic or
overly formal word choices ("cofferers," "judicature," "allege nothing
against"), one paragraph (7) whose nested legal conditionals ask a lot of
the reader in a single breath, and one paragraph (11) containing the
chapter's real accessibility failure — a sentence built on an unglossed
technical sense of "author" followed immediately by a genuinely
hard-to-parse, pronoun-ambiguous sentence about secret agents abroad. Fix
those specific spots and the chapter is in good shape.
