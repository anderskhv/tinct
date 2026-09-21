# Fidelity Review — Post-Acceptance Gap Closure
## Leviathan, Ch. 13 (Hobbes ch. 12, "Of Religion") — paragraph 31

**Scope:** Chapter 13 fidelity was ACCEPT AS-IS on a full non-sampled pass. One edit
landed after that verdict (commit `e5ee072a`, "ch13 round-4 - fix paragraph 31's
stacked double-\"that\""). This review closes the gap for that single edit only.

## What changed

Verified via `git show e5ee072a -- .../candidate-sonnet.json`: the commit touches
**exactly one line** in `candidate-sonnet.json` — paragraph index 31 (0-indexed;
the final paragraph, "priests who make themselves disliked"). No other paragraph
in either file is touched by this or any subsequent commit.

Within paragraph 31, the only textual change is:

> "...other Christian rulers, that if it weren't for the rivalry..."
> → "...other Christian rulers — enough that, if it weren't for the rivalry..."

An em-dash + "enough that" was inserted to break the stacked double-"that"
construction ("there are so many that... rulers, that if..."). No words were
removed, no clause was reordered, and no other sentence in the paragraph was
touched — confirmed by diffing the full paragraph string outside the edited
span, and by checking the paragraph count (32 in both source and candidate)
and surrounding paragraph text (unchanged).

## Fidelity check against source (Hobbes ch. 12, para 31)

Source clause: "there be so many, manifestly to the advantage of the Pope...
that were it not for the mutuall emulation of those Princes, they might
without warre, or trouble, exclude all forraign Authority."

Claim preserved exactly: the sheer number of articles favoring the Pope and
his subjects is what would let Rome exclude the foreign rulers' authority
entirely, if not for the rivalry among those rulers keeping it in check. The
inserted em-dash/"enough that" only separates the relative clause (describing
how many articles favor the Pope) from the result clause (what that number
would enable, absent rivalry) — it does not alter quantifier, causal
relationship, or any named entity (Pope, Christian rulers, foreign authority,
war/trouble, England).

The rest of paragraph 31 — the rhetorical-question list (coronation, clerical
marriage, legitimacy of princes judged by Rome, subjects freed from
allegiance, deposition of kings, clerical criminal immunity, Mass fees and
Purgatory payments) and the closing "priests who make themselves disliked"
line — is byte-identical to the pre-edit version per the diff; untouched.

## Other paragraphs

`git show` confirms the round-4 commit's diff hunk covers only paragraph 31.
Paragraph counts match (32/32) and no other paragraph text differs from the
prior accepted commit (`30c1d827`, round-3).

## Verdict

**ACCEPT AS-IS.** The edit is a pure syntactic readability fix with no change
to the claim, no touch to any other part of paragraph 31, and no change to
any other paragraph in the file.
