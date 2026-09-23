#!/usr/bin/env python3
"""The seven repairs the Books 1-6 collision backlog turned up, in ONE pass.

**Why one pass.** A5(a) of the ledger, proved again by the compound sweep:

> *"this is the THIRD time the package has paid successors for a compound found
> by a person reading ... paying a third round without closing the class
> guarantees a fourth."*

Six of the seven edits are in Book 1 and one Book is one successor, so the only
consolidation available is Book 1 and Book 4 together rather than one now and
one later. That is what this does.

**What was found, and by which arrow.** The 221 rows of the Books 1-6 backlog
were mostly noise: 109 fell to one missing mechanical class (`kept-elsewhere`),
and of the 77 hand rulings, 70 are dismissals. Seven are live, and **six of the
seven come from arrow C** — the proximity arrow added at Book 7 — which is the
arrow's fourth independent vindication.

  B01-P010  `conducted` -> `led`, twenty-five words from Butler's own `led the
            way`. The M-2 shape exactly: a repetition Butler avoided.
  B01-P019  `prevail upon` -> `urge`, in the same speech as Butler's own `urge`.
            Athena advises, then presses; the candidate does both with one verb,
            and the sentence that loses the second is the one asking for the
            voyage the Book turns on.
  B01-P019  `smart looking` -> `capable-looking`, against the candidate's own
            `capable` for Odysseus at B01-P006. A SENSE change as well as a
            collision: Butler's `smart looking` is appearance, and
            `capable-looking` makes Athena praise a competence she is at that
            moment telling Telemachus he has not yet shown. **Arrow B found
            this one, across paragraphs, which arrow C cannot see.**
  B01-P022  `wondered` -> `marveled`, where accepted Books 2 and 3 use
            `marveled` for Butler's own `marvelled`. Two Butler words flattened
            into one ACROSS Books, and the substitution bought nothing:
            `wondered at it` was already current English.
  B01-P024  `celebrate` -> `sing`, printing `poets love to sing. Sing the
            suitors one of those` — the word twice at a sentence join where
            Butler had two words. Repaired by restoring his own `celebrate`,
            which is current English here; the `fashioned` repair at Book 7.
  B04-P017  `forenoon` -> `morning`, beside Butler's own `Morning`. The
            candidate reads *`Morning will come in its own time, and in the
            morning I do not care how much I cry`* — a sentence that says a
            thing will come and that when it has come it will be there. The
            deferral Pisistratus is asking for is carried entirely by the
            second word. **The sharpest finding of the backlog.**
  B04-P040  `holy hecatombs` -> `holy sacrifices`, one sentence from Butler's
            own `sacrifices`. Accepted Books 1 and 3 both pay for the lost
            SCALE with an adjective (`great sacrifice`, `fine sacrifice`) and
            Book 4 did not: **Book 4 was the accepted Book out of step**, which
            is the `luscious` shape a third time. `great` matches Book 1's word.

**Two repairs deliberately declined**, recorded in the triage rather than
bought: `a couple of` / `a pair of` in Book 1 (`free-variation` — no reader can
act on the difference) and `scion` -> `young woman` in Book 6
(`unavoidable-merge` — no word both reads as modern English and keeps the graft
metaphor, and the palm-shoot simile three sentences later carries it in
Butler's own words).

**Nothing accepted is rewritten.** Every accepted candidate and every
`ACCEPTANCE.md` is hashed before and after and asserted byte-unchanged.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (source file, successor, [(0-based paragraph, old, new)])
SUCCESSORS = [
    ("book01/candidate-v3.json", "book01/candidate-v4.json", [
        (9, "and led her to a richly worked seat",
            "and showed her to a richly worked seat"),
        (18, "let me urge you to take the best ship",
             "let me persuade you to take the best ship"),
        (18, "You are a fine, capable-looking young man",
             "You are a fine, good-looking young man"),
        (21, "marveled at it", "wondered at it"),
        (23, "that poets love to sing. Sing the suitors one of those",
             "that poets love to celebrate. Sing the suitors one of those"),
    ]),
    ("book04/candidate-v4.json", "book04/candidate-v5.json", [
        (16, "and in the morning I do not care how much I cry",
             "and later in the day I do not care how much I cry"),
        (39, "and offered holy sacrifices to the immortal gods",
             "and offered great and holy sacrifices to the immortal gods"),
    ]),
]

# Every file that must be byte-unchanged across this build: each Book's
# accepted candidate, the newest file each successor is built FROM, and both
# acceptance records.
UNTOUCHED = ["book01/candidate-v2.json", "book01/candidate-v3.json",
             "book04/candidate-v2.json", "book04/candidate-v4.json",
             "book01/ACCEPTANCE.md", "book04/ACCEPTANCE.md"]

# What must be gone from each successor, and what must NOT have been disturbed.
GONE = {"book01/candidate-v4.json": ["capable-looking", "love to sing. Sing"],
        "book04/candidate-v5.json": ["and in the morning I do not care"]}
STILL = {"book01/candidate-v4.json": ["He led the way as he spoke",
                                      "Still, I urge you to set about",
                                      "the most capable man on earth"],
         "book04/candidate-v5.json": ["you must offer sacrifices to Zeus",
                                      "Morning will come in its own time"]}


def sha(p):
    return hashlib.sha256((ROOT / p).read_bytes()).hexdigest()


def fail(m):
    sys.exit("build_collision_backlog_sweep.py: " + m)


def main():
    before = {p: sha(p) for p in UNTOUCHED}
    for srcf, dstf, edits in SUCCESSORS:
        d = json.loads((ROOT / srcf).read_text(encoding="utf-8"))
        paras = list(d["paragraphs"])
        for idx, old, new in edits:
            if paras[idx].count(old) != 1:
                fail("%r occurs %d times in %s ¶%d, not once"
                     % (old, paras[idx].count(old), srcf, idx + 1))
            paras[idx] = paras[idx].replace(old, new, 1)
            if new not in paras[idx]:
                fail("the replacement did not land in %s ¶%d"
                     % (srcf, idx + 1))
        if len(paras) != len(d["paragraphs"]):
            fail("%s: the paragraph count moved" % dstf)
        d["paragraphs"] = paras
        (ROOT / dstf).write_text(
            json.dumps(d, indent=1, ensure_ascii=False) + "\n",
            encoding="utf-8")
        print("%-30s %s  (%d edit(s), from %s)"
              % (dstf, sha(dstf), len(edits), srcf))

    for p in UNTOUCHED:
        if sha(p) != before[p]:
            fail("%s was written by this build and must not have been" % p)
    print("\nevery accepted candidate, every file built FROM, and both "
          "acceptance records: byte-unchanged")

    for dstf, bads in GONE.items():
        t = (ROOT / dstf).read_text(encoding="utf-8")
        for bad in bads:
            if bad in t:
                fail("%s still carries %r" % (dstf, bad))
    # The other half, and the half a sweep usually forgets: the words the
    # repairs were made to PROTECT must still be there. A repair that silenced
    # the check by deleting Butler's own kept word would pass GONE alone.
    for dstf, goods in STILL.items():
        t = (ROOT / dstf).read_text(encoding="utf-8")
        for good in goods:
            if good not in t:
                fail("%s lost %r, which the repair exists to keep" %
                     (dstf, good))
    print("every word the repairs exist to protect: still present")
    return 0


if __name__ == "__main__":
    sys.exit(main())
