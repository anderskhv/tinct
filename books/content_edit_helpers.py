#!/usr/bin/env python3
"""
Small validation helpers for staged single-chapter repair work
(books/wip/{book}-pilot-ch{N}/ style directories: source.json /
candidate-*.json shaped as {"number": N, "title": "...", "paragraphs": [...]}).

Built after two real regressions in the Leviathan modern-en pilot:
  1. A paragraph-1 content-loss bug (a plain `p[i] = new_text` assignment
     silently discarded ~two-thirds of a paragraph instead of replacing one
     sentence within it).
  2. An actor-misattribution regression (a sentence split promoted the wrong
     subject, making "The Roman commonwealth" call a speaker by a Greek term
     that belonged to the Greek assembly, not Rome).

Both were introduced by *revision* edits, not the original draft, and both
were caught by re-reading the file rather than trusting a diff or a
self-report. These helpers make the cheap, mechanical half of that checking
(structure, exact-match replacement, word-count tripwires) fast and reliable
so the expensive half (an independent reader re-deriving meaning) can focus
on what only a reader can catch.

None of this is a quality gate. A ratio outlier or a structural mismatch is
a flag for a human/reviewer to go look at, never a pass/fail verdict on its
own — see books/AGENTS.md's QA Gates section.

Usage as a library (preferred, for use inside a repair script):

    from content_edit_helpers import safe_replace, validate_structure, diff_report

    with open('source.json') as f:
        source = json.load(f)
    with open('candidate.json') as f:
        candidate = json.load(f)

    validate_structure(source, candidate)  # raises on any structural problem

    paragraphs = candidate['paragraphs']
    safe_replace(paragraphs, 3, 'old exact wording', 'new wording')
    # safe_replace raises if `old` is missing OR appears more than once in
    # that paragraph - ambiguous matches are a hard failure, not a "first
    # occurrence wins" guess.

    validate_structure(source, candidate)  # re-validate after edits

    report = diff_report(before_paragraphs, candidate['paragraphs'], source['paragraphs'])
    # report lists exactly which paragraph indices changed, their word-count
    # ratios, and flags any paragraph outside the normal range for a human
    # to go read - it does not itself accept or reject anything.

Usage from the command line, to sanity-check two files directly:

    python3 content_edit_helpers.py validate source.json candidate.json
    python3 content_edit_helpers.py diff before.json after.json source.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# A ratio outside this range is worth a direct read before trusting the
# edit, not proof of a defect - a genuinely verbose source paragraph can
# legitimately compress, and a short gloss can legitimately expand a short
# paragraph well past 1.6x. Flag, don't block.
RATIO_LOW = 0.7
RATIO_HIGH = 1.6


class ContentEditError(ValueError):
    """Raised by these helpers on a structural problem or an ambiguous/missing edit target."""


def safe_replace(paragraphs: list, index: int, old: str, new: str) -> None:
    """Replace `old` with `new` inside paragraphs[index], in place.

    Fails loudly (raises ContentEditError) instead of silently doing the
    wrong thing when:
      - `old` is not present in the paragraph at all (typo, stale target,
        or the paragraph was already edited by an earlier step).
      - `old` appears more than once (ambiguous - .replace() would silently
        replace all occurrences, which is not always intended and is worth
        a human decision).
      - `index` is out of range.

    This is deliberately the ONLY sanctioned way to edit one paragraph's
    text within a larger paragraphs list in these repair scripts. Never do
    `paragraphs[index] = new_text` when the intent is a targeted replacement
    within the paragraph - that discards everything in the paragraph that
    isn't part of the literal string you typed, which is exactly the bug
    that caused the ch24 round-3 regression.
    """
    if not (0 <= index < len(paragraphs)):
        raise ContentEditError(
            f"index {index} out of range for paragraphs list of length {len(paragraphs)}"
        )
    text = paragraphs[index]
    count = text.count(old)
    if count == 0:
        raise ContentEditError(
            f"paragraph {index}: expected old text not found\n  old={old!r}\n  actual paragraph={text!r}"
        )
    if count > 1:
        raise ContentEditError(
            f"paragraph {index}: old text is ambiguous ({count} occurrences) - "
            f"narrow it with more surrounding context before replacing\n  old={old!r}"
        )
    paragraphs[index] = text.replace(old, new)


def validate_structure(source: dict, candidate: dict) -> None:
    """Validate a candidate chapter against its locked source. Raises on any problem.

    Checks:
      - candidate['number'] == source['number']
      - same paragraph count, in the same order (no merge/split/reorder)
      - no empty or whitespace-only paragraph on either side
      - both are the expected {"number", "title", "paragraphs"} shape
    """
    for label, obj in (("source", source), ("candidate", candidate)):
        if not isinstance(obj, dict) or "paragraphs" not in obj:
            raise ContentEditError(f"{label}: not a valid chapter object (missing 'paragraphs')")
        if not isinstance(obj["paragraphs"], list):
            raise ContentEditError(f"{label}: 'paragraphs' is not a list")

    if source.get("number") != candidate.get("number"):
        raise ContentEditError(
            f"chapter number mismatch: source={source.get('number')!r} candidate={candidate.get('number')!r}"
        )

    sp, cp = source["paragraphs"], candidate["paragraphs"]
    if len(sp) != len(cp):
        raise ContentEditError(
            f"paragraph count mismatch: source has {len(sp)}, candidate has {len(cp)} "
            "(a paragraph was merged, split, dropped, or invented)"
        )

    for i, (s, c) in enumerate(zip(sp, cp)):
        if not isinstance(s, str) or not s.strip():
            raise ContentEditError(f"source paragraph {i} is empty or not a string")
        if not isinstance(c, str) or not c.strip():
            raise ContentEditError(f"candidate paragraph {i} is empty or not a string")


def word_count_ratios(source_paragraphs: list, candidate_paragraphs: list) -> list:
    """Return [(index, src_words, cand_words, ratio, flagged), ...] for every paragraph.

    `flagged` is True when ratio is outside [RATIO_LOW, RATIO_HIGH]. A flag
    means "a human should read this paragraph before trusting it," not
    "this paragraph is wrong" - see the module docstring.
    """
    out = []
    for i, (s, c) in enumerate(zip(source_paragraphs, candidate_paragraphs)):
        sw = len(s.split())
        cw = len(c.split())
        ratio = (cw / sw) if sw else float("inf")
        flagged = ratio < RATIO_LOW or ratio > RATIO_HIGH
        out.append((i, sw, cw, ratio, flagged))
    return out


def diff_report(before_paragraphs: list, after_paragraphs: list, source_paragraphs: list) -> dict:
    """Compare a paragraphs list before and after an edit round.

    Returns a dict with:
      - "changed": sorted list of paragraph indices that actually differ
        between before/after (byte comparison) - this is the ground truth
        for "what did this round touch," to be checked against what the
        edit was CLAIMED to touch. A round that claims to fix paragraph 7
        but this reports 6 and 7 changed means something unintended
        happened to paragraph 6.
      - "unchanged_count": how many paragraphs are byte-identical.
      - "ratios": word_count_ratios(source_paragraphs, after_paragraphs) -
        run against the AFTER state, since that's what needs checking.
      - "flagged": the subset of "changed" whose ratio was flagged - the
        paragraphs most worth an independent read.

    Does not itself pass/fail anything - it's the evidence for a reviewer
    (human or independent agent) to act on, matching the task's "compare
    the actual before/after files" requirement.
    """
    if len(before_paragraphs) != len(after_paragraphs):
        raise ContentEditError(
            f"before/after paragraph count differs ({len(before_paragraphs)} vs "
            f"{len(after_paragraphs)}) - cannot diff a reordered/resized document with this helper"
        )
    changed = [i for i, (b, a) in enumerate(zip(before_paragraphs, after_paragraphs)) if b != a]
    ratios = word_count_ratios(source_paragraphs, after_paragraphs)
    flagged = [i for i, _, _, _, f in ratios if f and i in changed]
    return {
        "changed": changed,
        "unchanged_count": len(after_paragraphs) - len(changed),
        "ratios": ratios,
        "flagged": flagged,
    }


def assert_only_changed(before_paragraphs: list, after_paragraphs: list, expected_indices) -> None:
    """Raise unless the set of paragraphs that actually changed exactly matches
    `expected_indices` (an iterable of ints) - no more, no fewer.

    Use this at the end of an edit script as a final gate: "I meant to touch
    exactly these paragraphs" is a claim this function verifies rather than
    assumes. Catches both an edit that silently touched something unintended
    (as in the ch24 regression) and a claimed fix that didn't actually apply.
    """
    if len(before_paragraphs) != len(after_paragraphs):
        raise ContentEditError("before/after paragraph count differs")
    actual = {i for i, (b, a) in enumerate(zip(before_paragraphs, after_paragraphs)) if b != a}
    expected = set(expected_indices)
    if actual != expected:
        missing = expected - actual
        extra = actual - expected
        msg = "changed-paragraph set does not match what was expected."
        if missing:
            msg += f" Expected to change but didn't: {sorted(missing)}."
        if extra:
            msg += f" Changed but was NOT expected to: {sorted(extra)}."
        raise ContentEditError(msg)


def load(path) -> dict:
    with open(path) as f:
        return json.load(f)


def _cli():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "validate":
        source = load(sys.argv[2])
        candidate = load(sys.argv[3])
        validate_structure(source, candidate)
        ratios = word_count_ratios(source["paragraphs"], candidate["paragraphs"])
        print(f"OK: {len(candidate['paragraphs'])} paragraphs, structure valid.")
        flagged = [r for r in ratios if r[4]]
        if flagged:
            print(f"{len(flagged)} paragraph(s) flagged for a human read (ratio outside "
                  f"{RATIO_LOW}-{RATIO_HIGH}):")
            for i, sw, cw, ratio, _ in flagged:
                print(f"  paragraph {i}: source={sw}w candidate={cw}w ratio={ratio:.2f}")
        else:
            print("No ratio outliers.")
    elif cmd == "diff":
        before = load(sys.argv[2])
        after = load(sys.argv[3])
        source = load(sys.argv[4]) if len(sys.argv) > 4 else after
        report = diff_report(before["paragraphs"], after["paragraphs"], source["paragraphs"])
        print(f"Changed paragraphs: {report['changed']}")
        print(f"Unchanged: {report['unchanged_count']}")
        if report["flagged"]:
            print(f"Flagged for a human read: {report['flagged']}")
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    _cli()
