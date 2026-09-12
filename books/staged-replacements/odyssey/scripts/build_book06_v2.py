#!/usr/bin/env python3
"""Book 6 step 6 — apply round 1's corrections and build `candidate-v2.json`.

`book06/review/findings-v1.md`, verdict **accept after corrections**: 2
substantive, 9 minor, 6 optional, 5 records. Every finding is answered either
way (**D11**); the declined ones are asserted **still present** in the built
file, so a decline cannot be a silent application.

`candidate-v1.json` is frozen and is not edited (**D10**): this script is the
only thing that produces v2, every `old` string is asserted to occur exactly
once in its paragraph, and every `new` string is asserted to have landed.

**This is the first correction script that does not carry its own copy of the
package's measures.** They are imported from `scripts/checks.py`, which is
substantive finding **S-2**'s answer, and the checks are *run* at the end
rather than described: `checks.run_book(6, version=2)` writes
`book06/checks-v2.md` and this build fails if any gate fails.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import checks                                                   # noqa: E402
from checks import sentences, sentence_profile                  # noqa: E402

BOOK = ROOT / "book06"
V1_SHA = "9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0"
SOURCE_SHA = "351c2f4647245348450458e2309214b96cf6f6af5e670e9efbc6ddbcdaec5668"

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order.
CORRECTIONS = [
    # ---- S-1(a) / M-4 — the hardest sentence in the Book, and the one the
    # paragraph's three cashed semicolons stepped around. Butler's simile puts
    # `a skillful workman` eleven words from its verb `enriches`, and every
    # reader garden-paths at "under Hephaestus and Athena enriches", taking
    # Athena for the subject before backing out. Round 1 offers two repairs
    # and calls either a real recast: point the relative clause, or put the
    # tenor first. **The second is taken**, because S-1's complaint is that
    # this paragraph did no syntactic work at all, and commas fence the garden
    # path rather than remove it. The subject and verb now touch; the relative
    # clause becomes an appositive where the praise belongs; Butler's coda
    # keeps its own em dash and every one of his words stands.
    (17, "S-1(a) / M-4 — the silver-plate sentence: subject and verb closed up",
     "She glorified him about the head and shoulders as a skillful workman who "
     "has studied every kind of art under Hephaestus and Athena enriches a "
     "piece of silver plate by gilding it—and his work is full of beauty.",
     "She glorified him about the head and shoulders as a skillful workman "
     "enriches a piece of silver plate by gilding it—a man who has studied "
     "every kind of art under Hephaestus and Athena—and his work is full of "
     "beauty."),

    # ---- M-3 — the Book 5 S-1 shape, and the Book 4 F-1 shape: two short
    # parallel sentences opening on the same subject, made by cashing a
    # semicolon that was doing the job better. Rejoined. Net -1 sentence, and
    # that is the correct direction: NORM RATE, not the raw rate, is the
    # number that should improve (round 1, §2).
    (17, "M-3 — `Athena then made … She also made …` rejoined at Butler's seam",
     "Athena then made him look taller and stronger than before. She also made "
     "the hair grow thick on the top of his head, and flow down in curls like "
     "hyacinth blossoms.",
     "Athena then made him look taller and stronger than before, and made the "
     "hair grow thick on the top of his head, and flow down in curls like "
     "hyacinth blossoms."),

    # ---- S-1(b) — 141 words, two word-level edits, one cashed semicolon, and
    # two untouched chains of 43 and 38 words. Butler's plainness here is
    # lexical, not syntactic. One division at the second `and` in each, with
    # the subject supplied — the smallest edit in the direction of the defect,
    # which is the B05-P012 / B06-P005 rule. Neither drops a word of Butler's.
    (15, "S-1(b) — the 43-word four-limb chain divided at its second `and`",
     "that juts into the sounding sea, and have nothing to do with any other "
     "people.",
     "that juts into the sounding sea. We have nothing to do with any other "
     "people."),
    (15, "S-1(b) — the 38-word chain of the same shape divided at its second "
         "`and`",
     "are under Zeus’s protection, and will take what they can get and be "
     "thankful.",
     "are under Zeus’s protection. They will take what they can get and be "
     "thankful."),

    # ---- M-1 — one rendering made to carry two Butler words inside one Book:
    # `grass` was made to render Butler's `herbage` at P009 while Butler's own
    # `grass` stands untouched 200 words later at P011. Found mechanically, by
    # arrow B of `scripts/rendering_collisions.py`. `greenery` also settles the
    # cross-Book half: accepted B05-P006 renders the same `herbage` as `lush
    # greenery`, so after this one word Butler's `herbage` has ONE rendering
    # across the package and his `grass` has its own.
    (8, "M-1 — `grass` for Butler's `herbage` collided with Butler's own "
        "`grass` at P011",
     "the sweet juicy grass that grew by the waterside",
     "the sweet juicy greenery that grew by the waterside"),

    # ---- M-8 — the `As … even so` correlative, broken by the division. The
    # division is right (§6.3); what it cost is the correlative. Split off, the
    # 60-word protasis stands as a complete sentence in which `As` reads as
    # *while* — a statement about what Artemis habitually does — and the simile
    # has to be reconstructed backwards from `Even so`. `Just as` cannot be
    # read as temporal, and `So` answers it.
    (8, "M-8 — the correlative restored across the division: `Just as … So …`",
     "As the huntress Artemis goes out over",
     "Just as the huntress Artemis goes out over"),
    (8, "M-8 — the correlative restored across the division: `Just as … So …`",
     "Even so did the girl outshine her handmaids.",
     "So did the girl outshine her handmaids."),

    # ---- M-2 — the fifth rendering collision, and the one the drafter's own
    # question 4 asked for and missed: Butler's `topes` was rendered `drinks`,
    # which is already the edition's rendering of Butler's OWN `drinks` at
    # accepted B04-P020. Same shape as `scion`/`creature`, refused there and
    # taken here. It also flattens the joke: *topes* is habitual, idle,
    # excessive drinking, which is the whole point of `like an immortal god`.
    (22, "M-2 — `topes` → `drinks` collided with accepted B04-P020's `drinks`",
     "where he sits and drinks like an immortal god",
     "where he sits over his wine like an immortal god"),

    # ---- M-5 — Butler writes `appear` here and `seem` at P021, six
    # paragraphs later, in a speech and its answer. v1 printed `seem` in both,
    # so a difference Butler wrote became a near-verbatim echo. This is the
    # mirror of the collision defect: one rendering flattening two Butler
    # words, in the direction of repetition rather than of ambiguity.
    (14, "M-5 — `appear` restored, so Butler's variation is not flattened "
         "into P021's `seem`",
     "you seem to be a sensible, well-disposed person",
     "you appear to be a sensible, well-disposed person"),

    # ---- M-6 — register. `picked up`, said of a man a girl is rumoured to be
    # marrying, carries a modern innuendo Butler's verb does not, and the voice
    # rules forbid modernizing into contemporary idiom that breaks register.
    # Round 1 proposes `taken off some foreign vessel`; **Butler's own
    # preposition is `from`**, `taken from` is ordinary modern English, and
    # there is no reason to move a preposition while repairing a verb. The
    # variant is recorded rather than taken silently.
    (21, "M-6 — `picked up` out of register; Butler's `taken`, with Butler's "
         "own preposition",
     "a vagabond sailor she has picked up from some foreign vessel",
     "a vagabond sailor she has taken from some foreign vessel"),

    # ---- M-7 — `prevent` is ordinary modern English and needed nothing, and
    # accepted B02-P011 keeps it. An unnecessary change that creates a
    # cross-Book difference is the cheapest kind of drift to avoid.
    (25, "M-7 — `prevent` restored, against accepted B02-P011",
     "in his efforts to keep Odysseus from getting home",
     "in his efforts to prevent Odysseus from getting home"),

    # ---- M-9 — *discomfit*, in Butler's sense, is to defeat or throw into
    # confusion. *Thwart* is to frustrate a PLAN, and imports a purpose the
    # enemies have not been given. `galls` is free and nearer.
    (13, "M-9 — `thwarts` imported a purpose; `galls` is Butler's sense",
     "It thwarts their enemies",
     "It galls their enemies"),

    # ---- O-2 — `the voices of the nymphs` repeats *voices* four words after
    # `the voices of young women`. Butler's own `those of` avoided it, is
    # ordinary modern English, and compares voices with voices — which round
    # 1's shorter proposal (`like nymphs that haunt mountain tops`) does not.
    # Applied in Butler's form; the variant is recorded.
    (10, "O-2 — the repeated `voices` removed, in Butler's own form",
     "they sound like the voices of the nymphs that haunt mountain tops",
     "they sound like those of the nymphs that haunt mountain tops"),

    # ---- O-5 — *ply* is current English and more exact: repeated,
    # workmanlike application. `used` was the one flat word in an otherwise
    # well-judged paragraph.
    (23, "O-5 — `plied` restored",
     "so she used her whip with judgment",
     "so she plied her whip with judgment"),
]

# Findings NOT applied. Each names the fragment that must still be present, so
# a decline cannot be a silent application (**D11**).
DECLINED = [
    ("O-1 — `scion` → `young woman`, and the palm-tree figure it severs", 12,
     "so fair a young woman as yourself",
     "Butler's `scion` is a plant word — a young shoot — and his very next "
     "sentence is the palm tree and *“never yet did such a young plant shoot "
     "out of the ground.”* The word prepares the simile and `young woman` "
     "severs it. Round 1's own instruction is the disposition: *if no "
     "rendering holds both senses, record the loss.* No rendering does. "
     "`creature` is Butler's own word at B04-P077 and B05-P010 and taking it "
     "would be the collision M-1 and M-2 exist to stop; `shoot`, `scion` and "
     "`sapling` said of a girl to her face are not modern English in this "
     "register. **The loss is recorded** in `continuity.md` §5 and here, "
     "which is what was owed and was missing."),
    # O-6 cites "B06-P009, B06-P011" and §8 repeats it against P009. The
    # string occurs at **P011 only**: P009's mountains are "the mountains of
    # Taygetus or Erymanthus", a different phrase. Corrected here, and the
    # misattribution recorded in the ledger — it is exactly the class the
    # decline-assertion exists to catch, and it caught it: the assertion
    # failed on P009 because the fragment was never there.
    ("O-6 — `mountain tops`, the standard closed form being `mountaintop`", 10,
     "mountain tops",
     "Declined at this Book, and escalated rather than deferred. The form is "
     "consistent with accepted B05-P030 and recorded, so it is not an "
     "unrecorded departure; closing it here would put Book 6 in drift with "
     "accepted Book 5 and closing it there costs a **sixth successor**, which "
     "is a coordinator decision and not a Book 6 one. It is ledger item "
     "**A4**(ii), where it sits beside the vendored word list that would "
     "settle the whole class mechanically. `scripts/checks.py` §11 now "
     "enumerates the class for a reader every time it runs."),
    ("S-1(c) — B06-P006, the third paragraph the drafter defended", 5,
     "Papa dear",
     "**Answered, not owed** — round 1's own ruling, and it is recorded here "
     "so the paragraph is not revisited by a later pass looking for the third "
     "of three. 94 words, one word-level edit, one cashed semicolon, longest "
     "candidate sentence 25 words, and the voice is a daughter coaxing her "
     "father. On this one the drafter's *“Butler is already writing plain "
     "modern English there”* survives inspection."),
]

# The three paragraphs S-1 is about, asserted by name and in the right
# direction. S-1(b)'s two divisions and M-3's rejoining move the sentence count
# in OPPOSITE directions, which is correct and is why each is asserted
# separately rather than by a net count.
S1_DIVIDED = [16]        # gains two sentences
S1_REJOINED = [18]       # loses one to M-3, gains none from M-4


def fail(msg):
    sys.exit("build_book06_v2.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def main():
    v1_bytes = (BOOK / "candidate-v1.json").read_bytes()
    if sha256_bytes(v1_bytes) != V1_SHA:
        fail("candidate-v1.json is not at its frozen hash %s" % V1_SHA)
    src_bytes = (BOOK / "source-book6.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book6.json is not at its recorded hash")

    v1 = json.loads(v1_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v1["paragraphs"])
    src_flat = [" ".join(p.split()) for p in src["paragraphs"]]
    if len(paras) != len(src_flat) or len(paras) != 26:
        fail("paragraph alignment broken before any correction")

    # ---- the corrections ---------------------------------------------------
    changed = {}
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        if p.count(old) != 1:
            fail("B06-P%03d / %s: old string occurs %d times, expected exactly "
                 "1:\n  %r" % (idx + 1, finding, p.count(old), old))
        if new in p:
            fail("B06-P%03d / %s: new string already present"
                 % (idx + 1, finding))
        paras[idx] = p.replace(old, new)
        changed.setdefault(idx, []).append(finding)
    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx]:
            fail("B06-P%03d / %s: correction did not land" % (idx + 1, finding))

    # ---- the findings NOT applied, asserted still present -------------------
    for finding, idx, frag, why in DECLINED:
        if frag not in paras[idx]:
            fail("B06-P%03d: a DECLINED finding was applied anyway (%s)"
                 % (idx + 1, finding))

    joined = "\n".join(paras)
    s_all = "\n".join(src_flat)

    def n(w, t=None):
        return len(re.findall(r"\b" + w + r"\b", joined if t is None else t))

    # ---- S-1, asserted by name and in both directions -----------------------
    for p_no in S1_DIVIDED:
        i = p_no - 1
        if sentence_profile([paras[i]])[0] != \
                sentence_profile([v1["paragraphs"][i]])[0] + 2:
            fail("S-1(b): B06-P%03d must gain exactly two sentences" % p_no)
    for p_no in S1_REJOINED:
        i = p_no - 1
        if sentence_profile([paras[i]])[0] != \
                sentence_profile([v1["paragraphs"][i]])[0] - 1:
            fail("M-3: B06-P%03d must LOSE exactly one sentence" % p_no)
    # S-1(a) is a recast, not a division: the silver-plate sentence must still
    # be one sentence, and `Athena` must no longer stand next to `enriches`.
    if "Athena enriches" in joined:
        fail("S-1(a): the garden path `Athena enriches` survives")
    if "workman enriches a piece of silver plate" not in paras[17]:
        fail("S-1(a): the subject and its verb must touch")
    if "—a man who has studied every kind of art under Hephaestus and Athena—" \
            not in paras[17]:
        fail("S-1(a): the relative clause must stand as an appositive")

    # ---- the rendering collisions this round closes -------------------------
    if "greenery" not in paras[8] or re.search(r"\bgrass\b", paras[8]):
        fail("M-1: P009 must render `herbage` as `greenery` and carry no "
             "`grass` of its own")
    if not re.search(r"\bgrass\b", paras[10]):
        fail("M-1: Butler's OWN `grass` at P011 must stand untouched")
    if re.search(r"\bdrinks\b", joined):
        fail("M-2: `drinks` is reserved for Butler's own `drinks` at B04-P020")
    if n("appear") != 1 or n("seem") != 3:
        fail("M-5: Butler's `appear`/`seem` distinction is not carried")
    if n("appear", s_all) != 1 or n("seem", s_all) != 3:
        fail("M-5: the source census moved")

    # ---- the minors that are one word each ----------------------------------
    for frag, finding in ((" taken from some foreign vessel", "M-6"),
                          ("to prevent Odysseus from getting home", "M-7"),
                          ("It galls their enemies", "M-9"),
                          ("like those of the nymphs", "O-2"),
                          ("she plied her whip with judgment", "O-5"),
                          ("Just as the huntress Artemis", "M-8"),
                          ("So did the girl outshine her handmaids.", "M-8")):
        if frag not in joined:
            fail("%s did not land: %r" % (finding, frag))
    for frag, finding in (("picked up", "M-6"), ("thwarts", "M-9"),
                          ("Even so did", "M-8"), ("used her whip", "O-5")):
        if frag in joined:
            fail("%s: the superseded form survives: %r" % (finding, frag))

    # ---- O-3, settled as a rule rather than carried forward (D11) ----------
    # One class, one rule, two outcomes: a Butler inversion is KEPT where it is
    # the second limb of a comparison the sentence needs in order to be read,
    # and un-inverted where it is a bare narrative tag. P009 and P012 are
    # correlative apodoses answering a simile; P026 is a tag.
    if "So did the girl outshine her handmaids." not in joined:
        fail("O-3: P009's correlative inversion must be kept")
    if "Even such did Odysseus seem" not in joined:
        fail("O-3: P012's correlative inversion must be kept")
    if "So he prayed" not in joined or "Thus did he pray" in joined:
        fail("O-3: P026's narrative tag must be un-inverted")

    # ---- the standing assertions of the Book, unmoved ------------------------
    for greek, roman, k in (("Odysseus", "Ulysses", 14), ("Athena", "Minerva", 11),
                            ("Zeus", "Jove", 6), ("Poseidon", "Neptune", 3),
                            ("Artemis", "Diana", 2), ("Hephaestus", "Vulcan", 1)):
        if n(greek) != k or n(roman, s_all) != k:
            fail("name census moved: %s" % greek)
    if n("Nausicaa") != 11 or n("Nausicaa", s_all) != 10:
        fail("the supplied `Nausicaa` at B06-P005 moved (10 → 11 is declared)")
    for roman in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
                  "Diana", "Euryclea", "Venus", "Juno", "Vulcan", "Ceres"):
        if n(roman):
            fail("Roman form survives: %s" % roman)
    if n("Rhea") or n("Helios") or n("Cronos"):
        fail("hazard 1: a general Roman→Greek list was applied")
    if "'" in joined or '"' in joined:
        fail("D9: an ASCII quote survives")
    for mark, k in (("“", 18), ("”", 15)):
        if sum(p.count(mark) for p in paras) != k or \
                sum(p.count(mark) for p in src["paragraphs"]) != k:
            fail("D4: %s totals moved" % mark)
    unbal = [i + 1 for i, p in enumerate(paras) if p.count("“") != p.count("”")]
    if unbal != [13, 21, 22]:
        fail("D4: the unbalanced paragraphs must be Butler's own three: %s"
             % unbal)
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    # R-2: the D16 repair at B06-P020, now recorded and therefore asserted.
    if "She got the linen folded and put into the wagon, then yoked the mules" \
            not in paras[19]:
        fail("R-2: the B06-P020 D16 comma-splice repair was disturbed")
    if any("\n" in p or "  " in p or p != p.strip() for p in paras):
        fail("whitespace defect in a candidate paragraph")
    if [i + 1 for i in range(26) if paras[i] == src_flat[i]]:
        fail("a paragraph became byte-identical to Butler")

    # ---- write --------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = ["# " + doc["title"] + " — modern-English candidate v2 (readable)",
             "",
             "Generated by `scripts/build_book06_v2.py` from the frozen",
             "`candidate-v1.json`. Paragraph IDs are outside the prose; the",
             "text itself is byte-identical to `candidate-v2.json`.", ""]
    for i, p in enumerate(paras):
        lines += ["**B06-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")

    diffs = [i for i in range(26) if v1["paragraphs"][i] != paras[i]]
    (BOOK / "changes-v1-to-v2.md").write_text("\n".join(
        ["# Book 6 — every change from `candidate-v1.json` to "
         "`candidate-v2.json`", "",
         "Written by `../scripts/build_book06_v2.py`, which is the only thing",
         "that produced them: `candidate-v1.json` is frozen and was not edited",
         "(**D10**). Each row is one substitution, in the order the build",
         "applies them, with the round-1 finding it answers. Every `old`",
         "string is asserted to occur exactly once in its paragraph, and every",
         "`new` string is asserted to have landed.", "",
         "%d substitutions in %d of the 26 paragraphs."
         % (len(CORRECTIONS), len(changed)), "",
         "| # | paragraph | finding | from | to |", "|---|---|---|---|---|"] +
        ["| %d | B06-P%03d | %s | `%s` | `%s` |"
         % (k + 1, idx + 1, f, o, nw)
         for k, (idx, f, o, nw) in enumerate(CORRECTIONS)] +
        ["", "## Findings not applied, and why", "",
         "Each is asserted **still present** in the built file, so a decline",
         "cannot be a silent application (**D11**).", "",
         "| finding | paragraph | reason |", "|---|---|---|"] +
        ["| %s | B06-P%03d | %s |" % (f, idx + 1, why)
         for f, idx, frag, why in DECLINED] +
        ["", "## Findings settled as a rule, with no change to the text", "",
         "| finding | rule |", "|---|---|",
         "| **O-3** — three archaic inversions, two kept and one removed | "
         "**A Butler inversion is kept where it is the second limb of a "
         "comparison the sentence needs in order to be read, and un-inverted "
         "where it is a bare narrative tag.** P009 (`So did the girl "
         "outshine…`) and P012 (`Even such did Odysseus seem…`) are "
         "correlative apodoses answering a simile: un-invert them and the "
         "reader has to reconstruct the comparison backwards. P026 (`Thus did "
         "he pray` → `So he prayed`) is a tag and carries nothing. One class, "
         "one rule, two outcomes that follow from it — which is what **D16** "
         "did for punctuation. Asserted in all three places by the build. |",
         "| **O-4** — `conduct`/`conducted` has four renderings across the "
         "Books | **Butler's `conduct` family is not a reserved term and has "
         "no fixed rendering: it is a general verb of accompaniment, and each "
         "instance takes the verb its own sentence's action calls for** "
         "(`take` B01-P007, `led` B01-P010, `conducted` B04-P024, `guide` "
         "B06-P010). This is the opposite disposition from `still undecided` "
         "for `thus in two minds`, and the difference is decidable: a formula "
         "Butler repeats verbatim gets one rendering, a common verb does not. "
         "Ruled at the Book that raised it rather than carried forward "
         "(**D11**). |", "",
         "## Paragraphs differing v1 → v2", "",
         ", ".join("B06-P%03d" % (i + 1) for i in diffs), ""]),
        encoding="utf-8")

    print("OK — candidate-v2.json written")
    print("  findings applied           %d substitutions in %d paragraphs; "
          "%d declined and asserted unchanged"
          % (len(CORRECTIONS), len(changed), len(DECLINED)))
    print("  paragraphs differing v1→v2 %d (%s)"
          % (len(diffs), ", ".join("B06-P%03d" % (i + 1) for i in diffs)))
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))
    print()

    # ---- S-2: the checks RUN, and this build fails if a gate fails ---------
    figs, gate = checks.run_book(6, version=2)
    if gate.failures:
        fail("%d gate(s) failed — see book06/checks-v2.md" % len(gate.failures))


if __name__ == "__main__":
    main()
