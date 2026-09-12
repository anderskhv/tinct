#!/usr/bin/env python3
"""The two-clause control rule (**D18**), as one callable.

Written at Book 5's step 6, from records findings **R-1** and **R-2** of
`book05/review/findings-v1.md`.

**The history.** Book 5's drafter audited its own source-verification rule
before trusting it and found two negative controls written as
`paragraph.replace("the", …)` — a **no-op** on a paragraph that happens not to
contain `the`, which is a control that cannot fail. It fixed them by building
the mutation from the paragraph's own words and asserting that the text had
changed. Round 1 then found the same shape in three further scripts
(`scripts/verify_source_book4.py:234`, `book04/review/…:275`,
`book03/review/…:135`) plus two unasserted-precondition variants, none of them
a no-op today and none of them saying so.

**And the drafter's fix is necessary and not sufficient.** The round-1
reviewer's own rule had a control that deleted twelve words from a paragraph,
asserted that the deletion had changed the text, and **still did not fire** —
every surviving token still aligned, and the statistic stayed at 1.00000. The
mutation was real; the *measure* was blind to it. A control that cannot fail
and a control whose measure cannot see it are indistinguishable from outside,
and only the second clause catches the second.

**The rule, in two clauses.**

> A negative control asserts **(a)** that its mutation changed the input, and
> **(b)** that the check's own verdict changed. Where (b) cannot be made to
> hold, the blindness is **declared by name** and a second check is made to
> carry that class.

`control()` is clause (a) and clause (b) together; `declare_blind()` is the
escape, and it is not free — it requires the name of the check that carries the
class instead.

Usage:

    from controls import control, declare_blind

    control("B: one letter changed",
            original=paras,
            mutated=flip_one_letter(paras, 40),
            verdict=lambda ps: diffs_against(ps))          # any comparable value

    declare_blind("a paragraph MERGE",
                  because="a merge leaves the token stream untouched",
                  carried_by="the blank-line block count, step 3")
"""
import sys

PASSED = []
BLIND = []


def _fail(msg):
    sys.exit("control rule (D18) violated: " + msg)


def control(name, original, mutated, verdict, expect_same=False):
    """Run one negative control under both clauses.

    `verdict` is called on the ORIGINAL and on the MUTATED input and must
    return a value that compares equal when the check's answer is the same.
    Pass `expect_same=True` only for a *positive* control — an input the check
    is supposed to go on accepting.
    """
    # clause (a) — the mutation is real
    if original == mutated:
        _fail("%s: the mutation did not change the input (clause a). "
              "A control that cannot fail is worse than no control." % name)
    v0, v1 = verdict(original), verdict(mutated)
    # clause (b) — the check's verdict moved
    if expect_same:
        if v0 != v1:
            _fail("%s: a POSITIVE control changed the verdict (%r → %r)"
                  % (name, v0, v1))
    elif v0 == v1:
        _fail("%s: the mutation changed the input and the verdict did NOT "
              "change (both %r) — clause (b). The measure is blind to what "
              "this control mutates; either fix the measure or declare the "
              "blindness with declare_blind() and name the check that carries "
              "the class." % (name, v0))
    PASSED.append(name)
    return True


def declare_blind(name, because, carried_by):
    """The escape from clause (b), and it costs the name of another check."""
    if not carried_by:
        _fail("%s: a declared blindness must name the check that carries the "
              "class instead" % name)
    BLIND.append((name, because, carried_by))
    return True


def summary(prefix="  "):
    out = ["%scontrols under D18: %d fired on BOTH clauses"
           % (prefix, len(PASSED))]
    for n in PASSED:
        out.append("%s  ✓ %s" % (prefix, n))
    for n, because, carried in BLIND:
        out.append("%s  ! blind to %s (%s); carried by %s"
                   % (prefix, n, because, carried))
    return "\n".join(out)


def _self_test():
    """This module is itself a check, so it gets its own controls."""
    seen = []
    try:
        control("no-op", [1, 2], [1, 2], verdict=lambda x: len(x))
    except SystemExit as e:
        seen.append("clause a" if "clause a" in str(e) else str(e))
    try:
        control("blind measure", [1, 2], [1, 3], verdict=lambda x: len(x))
    except SystemExit as e:
        seen.append("clause b" if "clause (b)" in str(e) else str(e))
    control("real", [1, 2], [1, 2, 3], verdict=lambda x: len(x))
    assert seen == ["clause a", "clause b"], seen
    print("controls.py self-test: clause (a) and clause (b) each reject; "
          "a sound control passes")


if __name__ == "__main__":
    _self_test()
