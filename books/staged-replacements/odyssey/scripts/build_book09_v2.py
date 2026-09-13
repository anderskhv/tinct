#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Book 9 step 6 — apply round 1's corrections and build `candidate-v2.json`.

`book09/review/findings-v1.md`, verdict **accept with corrections**: 7
substantive, 9 minor, 8 records, 3 optional, all 44 paragraphs ruled. Every
finding is answered either way (**D11**); the declined ones are asserted
**still present** in the built file, so a decline cannot be a silent
application.

`candidate-v1.json` is frozen and is not edited (**D10**): this script is the
only thing that produces v2, every `old` string is asserted to occur exactly
once in its paragraph, and every `new` string is asserted to have landed.

**The rule this Book's round produced, and it is free.** Of the fifteen
pre-freeze collision repairs, **eleven restore Butler's own word verbatim**,
two keep his phrasing and modernize only the word that is not current, two are
forced by words that are not current English at all — and **none invents a
paraphrase of the referent**. That is the general form of Book 8's
`minstrelsy` → *the playing that goes with it*, which described a bard instead
of naming what he does, and described him wrongly. So: **an arrow's repair
RESTORES; it does not paraphrase. A third rendering requires a reason.**
Arrow C's constraint says what a repair may not be; this says what it should
be. Six of the eight text corrections below are literally Butler's own word
put back — `clutch`, `sent`, `exclaimed`, `humane`, `whereas`, `besmirched` —
and the rule is what made them the obvious choice rather than one of several.

**The two marks that are restored rather than rewritten, and they cost
nothing.** M-1 found a cataphoric `this` stranded across a full stop at P021
and P031 — *"In the end I judged **this** would be the best plan. The Cyclops
had a great club…"* — where the reader takes `this` backward first and has to
re-read. Butler pointed both places himself, with a **colon** at P021 (`to do
as follows:`) and a **semicolon** at P031, and both are put back as the marks
he wrote. Butler's colon at P012 (`one housekeeper:`) is restored for the same
reason: it makes the mixing of the wine the **explanation** of the secrecy,
and the full stop made it a new fact. Three of Butler's marks return, three
sentence boundaries go, and the Book's numbers move because the text now
matches them — not the other way round.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import checks                                                   # noqa: E402

BOOK = ROOT / "book09"
N = 44
V1_SHA = "41f452ac577054aa820eba1cf1bb20cc24b382e6e3330b74af8c24f657c481fb"


def fail(msg):
    sys.exit("build_book09_v2: " + msg)


# (paragraph index, finding, old, new)
CORRECTIONS = [
    # ---------------------------------------------------------------- S-3
    # Six rendering collisions survived the check, every one on a word under
    # arrow B's rarity gate (`RARE_MAX = 3` paragraphs, `MIN_LEN = 5`). The
    # words a narrative uses as DISCRIMINATORS are its common words, which is
    # exactly what the gate excludes. Four of the six appear nowhere in the
    # 110-row report; two were reported and dismissed by dispositions that
    # answer a different question (see §7 of `continuity.md`).
    (17, "S-3", "‘Poseidon,’ said I, ‘drove my ship",
     "‘Poseidon,’ said I, ‘sent my ship"),
    # Butler's own `sent`. The draft's `drove` collided with Butler's `drove`
    # seven times, always of driving flocks — and with his own `We were
    # **driven** on to them` in the very next sentence.
    (18, "S-3", "The cruel wretch gave me not one word of answer",
     "The cruel wretch did not answer me with one word"),
    # `vouchsafed` → `gave` was row 65, dispositioned `variant` on whether
    # `gave` is an acceptable modernization. It is; it is not FREE — Butler
    # uses `gave` at P005, P017, P021 and P024.
    (18, "S-3", "with a sudden snatch he gripped",
     "with a sudden clutch he gripped"),
    # Butler's own `clutch`, and the answer to question 3. The P020 repair
    # restored his `clutched up` to protect his `snatched` at P036 — and the
    # same draft wrote `snatch` here, one paragraph earlier, re-creating the
    # collision the repair removed and flattening his `clutch`/`clutched` pair
    # in the opposite direction at the same time.
    (18, "S-3", "made his supper of them", "devoured them"),
    # Butler's `supped upon them`; `supper` is his own at P014 (twice) and
    # P021. Row 126 dismissed it as `common-rendering` and handed the residue
    # to arrow C — which is SAME-PARAGRAPH ONLY, so the safety net the
    # disposition invoked does not cover the row it dismissed.
    (36, "S-3", "‘Do not,’ they cried", "‘Do not,’ they exclaimed"),
    # `cried` is Butler's own at P020 and P039. `exclaimed` is Butler's word
    # here and is current English: the repair restores.
    (32, "S-3", "but lead the flock at a run", "but lead them at a run"),
    # `flock` is Butler's own at P011, P013 and P021. His word is `mob`, which
    # is not current in this sense; `them` is the sentence's own referent
    # (`the ewes`, four words earlier) and introduces no third word.

    # ---------------------------------------------------------------- S-4
    (9, "S-4", "a hospitable and civilized race",
     "a hospitable and humane race"),
    # Butler's `humane` — *merciful, kind* — is the quality the Cyclops is
    # about to be shown not to have, in an episode whose whole subject is what
    # a host owes a guest. `civilized` makes the question one about technology
    # and law, which P006-P007 has already answered. And `continuity.md` §6
    # justified `uncivilised savages` → `wild savages` by citing `a hospitable
    # and civilized race` as *"which keeps the root"* — **the root was kept by
    # a word the draft wrote.** The reason was circular; §6 is rewritten.

    # ---------------------------------------------------------------- M-1
    (20, "M-1", "“In the end I judged this would be the best plan. The Cyclops "
     "had a great club",
     "“In the end I judged this would be the best plan: the Cyclops had a "
     "great club"),
    (30, "M-1", "In the end I judged that this plan would be the best. The "
     "male sheep were well grown",
     "In the end I judged that this plan would be the best; the male sheep "
     "were well grown"),
    # Butler's own colon and his own semicolon, in his own places. The
    # cataphoric `this` now points forward across the mark that licenses it.

    # -------------------------------------------- question 2's second colon
    (11, "Q2", "and one housekeeper. When he drank it",
     "and one housekeeper: when he drank it"),

    # ---------------------------------------------------------------- minors
    (2, "M-7", "but my men were fools and would not obey me",
     "but my men very foolishly would not obey me"),
    # Butler grades an ACTION; the draft graded the men, who are about to be
    # eaten.
    (12, "M-6", "found him bad to deal with", "found him hard to deal with"),
    # Butler's `ill to deal with` is *hard to deal with*; `bad to deal with`
    # is not English. `hard` is free — the draft's own `hard pressed` at P003
    # is Butler's.
    (15, "M-8", "and by the will of Zeus and stress of weather",
     "but by the will of Zeus and stress of weather"),
    # The concessive is the point: on our way home from Troy — BUT driven off
    # course.
    (15, "M-3", "Fear the wrath of heaven, sir,",
     "We beg you to fear the wrath of heaven, sir,"),
    # Butler: *"May your excellency fear the wrath of heaven"* — a
    # supplication. The draft made it an imperative, and Odysseus gives the
    # Cyclops no order until P035, after he is at sea. `your excellency` →
    # `sir` is right and was recorded; the mood is the part that moved and it
    # was not.
    (25, "M-5", "all besmeared with gore", "all besmirched with gore"),
    # A current English word replaced by a rarer one, for nothing — the
    # `luscious` shape, and it escaped the collision check because it is a
    # substitution and not a collision.
    (38, "M-4", "superhuman strength, and he turns out to be",
     "superhuman strength, whereas he turns out to be"),
    # `whereas` is kept at P022, so this was one Butler word two ways inside
    # one Book, and the rendering that changed is the one where the word was
    # load-bearing: the sentence is made of the contrast.
    (41, "M-2", "“So did he pray, and Poseidon heard his prayer.",
     "“So he prayed, and Poseidon heard his prayer."),
    # `So did he pray` reads first as *he prayed too*; Butler's `Thus did he
    # pray` cannot. This is Book 8's M-2 in a new place. Where the candidate
    # keeps the inversion AND the correlative (`Even so did we bore`, P026)
    # there is no hazard, so the fix is local.

    # ---------------------------------------------------------------- O-1
    (18, "O-1", "So we stayed where we were, sobbing and sighing, till "
     "morning came.",
     "So we stayed sobbing and sighing where we were till morning came."),
    # Butler puts the sobbing first, which is the point of the sentence.
]

# (finding, paragraph index, a fragment that must SURVIVE, why it is declined)
DECLINED = [
    ("S-5 (P035)", 34, "to eat up your visitors",
     "`eat up` → `to eat up` is a grammatical restructuring of Butler's "
     "verbless exclamation, not a word supplied to his sense. It is RECORDED "
     "in §5 rather than reverted; reverting it would print `You wretch, eat "
     "up your visitors in your own house!`, which is not English."),
    ("S-5 (P044)", 43, "I told my men to go on board",
     "`bade my men on board` → `told my men to go on board` supplies `to go` "
     "to an ellipsis Butler's `bade` licenses and modern English does not. "
     "Butler's own `go on board` at P005 is the parallel. RECORDED in §5."),
    ("M-9", 1, "farthest out to sea toward the sunset",
     "the crux of footnote [48] — Butler gives *the usual translation* and "
     "says he does not believe the Greek will warrant it. A modern edition "
     "MUST choose; the candidate's choice is defensible and the finding is "
     "that it was not recorded. It is recorded now, in §6, with Butler's own "
     "footnote quoted — not reverted."),
    ("O-2", 21, "drink offering",
     "`drink-offering` → `drink offering` opens a compound Butler closes. "
     "Neither direction is wrong and `compound_drift()` sees neither, because "
     "`drink` is a stop-word-adjacent element. RECORDED in §H.1 rather than "
     "changed, because changing it would be a change made for a check's "
     "convenience."),
    ("Q2 (P029)", 28, "you must be ill; when Zeus makes people ill",
     "the reviewer would cash this semicolon and I would not. It is the "
     "Cyclopes shouting through a door, and the semicolon is what holds the "
     "shout together as one utterance; three sentences is how a NARRATOR "
     "reports a shout, not how one sounds. Butler's mark, kept."),
    ("Q2 (P039)", 38, "till he grew old; he told me",
     "marginal and declined: the semicolon separates the prophet's career "
     "from the prophecy, which is the sentence's hinge. Cashing it would make "
     "the Book's dividing-mark census move for a sentence nobody misreads."),
]


def main():
    v1p = BOOK / "candidate-v1.json"
    if hashlib.sha256(v1p.read_bytes()).hexdigest() != V1_SHA:
        fail("candidate-v1.json is not the frozen file (D10)")
    v1 = json.loads(v1p.read_text(encoding="utf-8"))
    src = json.loads((BOOK / "source-book9.json").read_text(encoding="utf-8"))
    paras = list(v1["paragraphs"])
    if len(paras) != N or len(src["paragraphs"]) != N:
        fail("paragraph count moved")

    for idx, finding, old, new in CORRECTIONS:
        if paras[idx].count(old) != 1:
            fail("%s: %r occurs %d times in B09-P%03d, not once"
                 % (finding, old, paras[idx].count(old), idx + 1))
        paras[idx] = paras[idx].replace(old, new, 1)
        if new not in paras[idx]:
            fail("%s: the replacement did not land in B09-P%03d"
                 % (finding, idx + 1))

    for finding, idx, frag, _why in DECLINED:
        if frag not in paras[idx]:
            fail("%s is declined and must therefore be unchanged, but %r is "
                 "gone from B09-P%03d" % (finding, frag, idx + 1))

    joined = "\n".join(paras)
    if "'" in joined or '"' in joined:
        fail("D9: an ASCII quote or apostrophe survives")
    if "[" in joined or "]" in joined:
        fail("D12: a square-bracket mark survives")
    src_flat = [" ".join(p.split()) for p in src["paragraphs"]]

    # ---- S-1, asserted on the corrected basis (D28) -------------------------
    # The census that `README.md` published as `41 kept + 0 added` counted a
    # mark as kept when Butler's mark in the span was ANY member of
    # `{; : —}`. Two of his colons had been cashed and two colons of the
    # draft's own written over his semicolons, and the class census read
    # `: 7 → 7`. Here the three marks he wrote are restored and the two class
    # changes at P009 and P013 are KEPT and DECLARED — both introduce a list,
    # which is the one job modern English keeps the colon for, and both are
    # improvements to Butler's pointing rather than additions to it.
    kept, changed, added = checks.kept_class_added_div(src_flat, paras)
    if added:
        fail("D27/D21: %d dividing mark(s) are the draft's own; this Book "
             "adds none" % added)
    want_changed = [(9, ";", ":"), (13, ";", ":")]
    got_changed = [(r[0], r[1], r[2])
                   for r in checks.class_changed_rows(src_flat, paras)]
    if got_changed != want_changed:
        fail("S-1/D28: the class changes must be exactly %s and they are %s"
             % (want_changed, got_changed))
    if changed != 2:
        fail("S-1/D28: two class changes, and there are %d" % changed)

    # ---- the restored marks, asserted by paragraph and by identity ---------
    # Butler's colon at P012, his colon at P021 and his semicolon at P031. The
    # assertion is on the MARK and the PARAGRAPH, so a fourth restoration
    # anywhere, or a different mark in one of these places, fails.
    for para, mark, frag in ((12, ":", "one housekeeper: when he drank"),
                             (21, ":", "the best plan: the Cyclops"),
                             (31, ";", "would be the best; the male sheep")):
        if frag not in paras[para - 1]:
            fail("M-1/Q2: the restored %s at B09-P%03d did not land"
                 % (mark, para))

    same = [i + 1 for i, (a, b) in enumerate(zip(src_flat, paras)) if a == b]
    if same:
        fail("byte-identical paragraphs %s and this Book declares none" % same)

    doc = {"number": 9, "title": src["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n",
                   encoding="utf-8")
    lines = ["# " + doc["title"] + " — modern-English candidate v2 "
             "(readable)", "",
             "Generated by `scripts/build_book09_v2.py`. Paragraph IDs are",
             "outside the prose; the text itself is byte-identical to",
             "`candidate-v2.json`.", ""]
    for i, p in enumerate(paras):
        lines += ["**B09-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")
    print("OK — candidate-v2.json written, %d paragraphs" % N)
    print("  %d corrections in %d paragraphs, %d findings declined"
          % (len(CORRECTIONS), len({i for i, _, _, _ in CORRECTIONS}),
             len(DECLINED)))
    print("  dividing marks kept / class-changed / added (D28)   %d / %d / %d"
          % (kept, changed, added))
    print("  sha256                        %s"
          % hashlib.sha256(out.read_bytes()).hexdigest())


if __name__ == "__main__":
    main()
