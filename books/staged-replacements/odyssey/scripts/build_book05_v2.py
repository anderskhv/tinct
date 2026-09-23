#!/usr/bin/env python3
"""Build candidate-v2.json for Odyssey Book 5 from the frozen candidate-v1.json.

Deterministic and idempotent: re-running reproduces byte-identical output.

Round 1 (`book05/review/findings-v1.md`) returned *Accept after corrections*:
**1 substantive** (S-1), 14 minor, 18 optional, 8 records, coverage complete
over B05-P001..B05-P037.

**S-1 is the round, and it is subtle.** Book 5 v1 reports the highest splitting
rate in the package (+23.5%) and the second-highest retention (0.94211), and
those two facts have one cause: Butler's Book 5 carries **34 semicolons** and
the candidate carries **14**. Twenty of the thirty-six added sentences are a
semicolon rewritten as a period -- an operation that adds a sentence, moves no
clause, drops no word and costs no retention, so it scores at full value on
both of D17's axes while leaving the architecture exactly as Butler built it.
That is precisely the blindness **D17** declares of itself.

So this round does three things S-1 asks for and D17 cannot ask for:

* **Three paragraphs are really recast**, where Butler's period still governs
  the reading and no semicolon was available to cash: **P009** (the relative
  chain), **P017** (ruling 5 -- the drafter raised Butler's comma to an em
  dash, which is finding the seam and then declining to turn), and **P021**
  (the 54-word Bear sentence, whose trailing causal clause reaches back over a
  thirty-word parenthesis). Each costs retention, which is the point.
* **Three divisions are REVERSED** because they are worse than Butler's
  semicolon -- P021's `She … She also …` (both opening `gave him a`, the Book 4
  flow-read F-1 shape), and more mildly P020 and P027.
* **The semicolon count is reported beside the splitting rate** (records
  finding **R-6**), so D17's number can be read against the cost of producing
  it. Every later Book reports it -- **D19**.

The net sentence count is expected to stay near 189: three divisions added
where they were owed, three taken back where they hurt. A round that moved the
rate a long way would mean something other than the finding had been done.

Usage: python3 scripts/build_book05_v2.py
"""
import difflib
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compound_drift import compound_drift            # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book05"

V1_SHA = "7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf"
SOURCE_SHA = "c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57"

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order; each
# `old` must occur exactly once in its paragraph or the build fails.
CORRECTIONS = [
    # --- B05-P001 -----------------------------------------------------------
    (0, "1.1 (optional, applied) — Dawn PRECEDES the light, she does not "
        "carry it; `herald` keeps Butler's forerunner and is not archaic",
     "bringer of light to mortals and immortals alike",
     "herald of light to mortals and immortals alike"),
    # --- B05-P003 -----------------------------------------------------------
    (2, "3.1 (optional, applied) — the compound's comic redundancy is the "
        "point: the suitors come back in an undignified rush",
     "have to come scurrying back",
     "have to come hurrying and scurrying back"),
    # --- B05-P006 -----------------------------------------------------------
    (5, "6.1 (minor) — D15: an attributive compound modifier, the class "
        "accepted Book 4 hyphenated (`fine-spun`, `violet-colored`)",
     "sweet smelling cypress trees",
     "sweet-smelling cypress trees"),
    (5, "6.2 (optional, applied) — `herbage` is the word a modern reader "
        "stumbles on; `luscious` is not, and v1 modernized the wrong half",
     "beds of violets and rich herbage",
     "beds of violets and lush greenery"),
    # --- B05-P009 -----------------------------------------------------------
    (8, "9.1 (minor) — every accepted Book renders *hecatomb* as `sacrifice` "
        "and reserves `offering` for Butler's own `offering`; `offerings` "
        "flattens two Butler words into one. `sacrifices` is unavailable "
        "(Butler's own, four words earlier), so the repair is a third word",
     "sacrifices or choice offerings",
     "sacrifices or choice victims"),
    (8, "S-1 — the relative chain, Butler's Victorian suspension, recast. "
        "No semicolon was available, so none was attempted in v1",
     "He says that you have here the most ill-starred of all those who "
     "fought nine years before the city of King Priam and sailed home in the "
     "tenth year after sacking it.",
     "He says that you have here the most ill-starred of all the men who "
     "fought nine years before the city of King Priam. They sailed home in "
     "the tenth year, after sacking it."),
    # --- B05-P010 -----------------------------------------------------------
    (9, "10.1 (minor) — D15: the modern standard is hyphenated, and accepted "
        "Book 1 met Butler's `mid ocean` and dissolved it",
     "sunk it in mid ocean", "sunk it in mid-ocean"),
    (9, "10.2 (minor) — ONE Butler connective, ONE rendering: `Nevertheless` "
        "is kept at P009 and P018 and must be kept here",
     "All the same, I will readily give him",
     "Nevertheless, I will readily give him"),
    (9, "10.3 (optional, applied) — `cherished` is neither archaic nor "
        "obscure, and `cared for` is what one does for an invalid; this is "
        "the one place in the Book where Calypso says what she felt",
     "I grew fond of him and cared for him",
     "I grew fond of him and cherished him"),
    # --- B05-P014 -----------------------------------------------------------
    (13, "14.1 (minor) — Butler wrote two different words eleven lines "
         "apart, in the one exchange of the Book where the exact wording of "
         "an oath is the subject; `harm` here collides with P015's `harm`. "
         "`mischief` is Butler's own and is ordinary modern English",
     "that you mean me no harm.”", "that you mean me no mischief.”"),
    # --- B05-P016 -----------------------------------------------------------
    (15, "16.1 (optional, applied) — `while` reads as simultaneity; Butler's "
         "`but` is opposition: mortal food for the man, immortal for the "
         "goddess, at the same table",
     "that mortals eat, while her maids brought",
     "that mortals eat, but her maids brought"),
    (15, "22.1 / 28.1 (minor) — the Victorian `saying` tag was dropped at "
         "P022 and P028 and kept here: two dispositions for one class "
         "(D16's standard, applied to a tag). Unified by dropping",
     "Calypso spoke, saying:", "Calypso spoke:"),
    # --- B05-P017 -----------------------------------------------------------
    (16, "Ruling 5 + S-1 — divide it. v1 raised Butler's comma to an em "
         "dash, which is saying *this is where the sentence turns* and then "
         "declining to turn it. The fronted relative `of whom you are "
         "thinking` is the most Victorian construction left in the Book",
     "and let me make you immortal—no matter how anxious you may be to see "
     "this wife of yours, of whom you are thinking all the time, day after "
     "day.",
     "and let me make you immortal. It makes no difference how anxious you "
     "may be to see this wife of yours, the one you think about all the "
     "time, day after day."),
    # --- B05-P020 -----------------------------------------------------------
    (19, "20.1 (optional, applied) — REVERSAL. The division left a "
         "seven-word sentence inside a run of four opening `She … So she … "
         "She also … Then she`. Butler's `and then led the way` was fine",
     "She also gave him a sharp adze. Then she led the way",
     "She also gave him a sharp adze, and then led the way"),
    # --- B05-P021 -----------------------------------------------------------
    (20, "21.1 (minor) — REVERSAL. Butler's semicolon became a period and "
         "left two consecutive sentences opening `She`, both `gave him a`: "
         "the Book 4 flow-read F-1 shape exactly. Butler's semicolon back",
     "and another larger one of water. She also gave him a bag",
     "and another larger one of water; she also gave him a bag"),
    (20, "S-1 — the 54-word Bear sentence. A trailing causal clause reached "
         "back over a thirty-word astronomical parenthesis to a main clause "
         "the reader has lost. Calypso's instruction moves to the front of "
         "its own sentence and the parenthesis becomes a statement",
     "He never closed his eyes, but kept them fixed on the Pleiads, on "
     "late-setting Bootes, and on the Bear—which men also call the Wain, and "
     "which turns round and round where it is, facing Orion, and alone never "
     "dips into the stream of Oceanus—for Calypso had told him to keep this "
     "on his left.",
     "Calypso had told him to keep the Bear on his left, so he never closed "
     "his eyes, but kept them fixed on the Pleiads, on late-setting Bootes, "
     "and on the Bear. Men also call it the Wain, and it turns round and "
     "round where it is, facing Orion, and alone never dips into the stream "
     "of Oceanus."),
    # Step 7's flow read, finding F-1: the recast above first read `and on the
    # Bear itself.`, which put `the Bear` twice in one sentence to carry a
    # contrast the sentence does not make. Butler names it once. `itself` is
    # dropped here rather than in a later version, exactly as Book 4's flow
    # read fed back into scripts/build_book04_v2.py.
    # --- B05-P024 -----------------------------------------------------------
    (23, "24.1 (minor) — D15: the modern standard is closed",
     "broke the mast half way up", "broke the mast halfway up"),
    (23, "Ruling 4 (upheld, one word dropped) — `between them` supplies a "
         "relation Butler leaves implicit, and with four winds named in the "
         "same clause it is the wrong preposition: Butler's `with it` is "
         "directed at the object. `at once` already carries the four-way "
         "simultaneity",
     "batting it back and forth between them at once",
     "batting it back and forth at once"),
    # --- B05-P025 -----------------------------------------------------------
    (24, "25.1 (optional, applied) — `mere` is not archaic and carries the "
         "diminishment that makes the promotion to goddess mean something",
     "She had once been an ordinary mortal",
     "She had once been a mere mortal"),
    # --- B05-P027 -----------------------------------------------------------
    (26, "27.1 (optional, applied) — REVERSAL, and Butler's own pointing "
         "restored on both joints. The division produced two consecutive "
         "sentences opening `I` in a speech that already opens six clauses "
         "with `I`; his semicolon held the resolve and its justification "
         "together",
     "as long as her timbers hold together; but when the sea breaks her up "
     "I will swim for it. I do not see",
     "as long as her timbers hold together, but when the sea breaks her up "
     "I will swim for it; I do not see"),
    # --- B05-P030 -----------------------------------------------------------
    (29, "30.1 (minor) — Butler's `but` turns the clause, and the turn is "
         "the whole point of the comparison: Odysseus is at the turn too. "
         "`and` flattens it into a list",
     "and the gods deliver him from evil", "but the gods deliver him from evil"),
    (29, "30.2 (records, acted on) — the recast came out at 65 words against "
         "Butler's 62. A recast that GROWS Butler's sentence is a defect. "
         "The untangling stands — Butler's `after having for a long time "
         "borne sore affliction sent him by` is the knot, and it stays "
         "untied — but it is done in Butler's own word count, 1 of 2",
     "after he has borne sore affliction for a long time, sent on him by "
     "some angry spirit",
     "after having borne sore affliction for a long time, sent him by some "
     "angry spirit"),
    (29, "30.2 (records, acted on) — 2 of 2; Butler writes `that he might`",
     "and swam on with all his strength so that he might once more set foot "
     "on dry ground",
     "and swam on with all his strength that he might once more set foot on "
     "dry ground"),
    # --- B05-P032 -----------------------------------------------------------
    (31, "32.1 (optional, applied) — `pulls` loses the sharp single motion "
         "the torn suckers depend on",
     "when someone pulls it from its bed", "when someone plucks it from its bed"),
    # --- B05-P035 -----------------------------------------------------------
    (34, "35.1 (minor) — D15's named failure mode: Butler hyphenates, v1 "
         "opens, modern English closes. `sea water` is a THIRD form, which "
         "is `sea side` exactly (Book 4's finding 37.1)",
     "ran down like a river with sea water",
     "ran down like a river with seawater"),
    (34, "35.2 (optional, applied) — a participle and a finite verb mixed "
         "across one `and`; Butler's two participles were parallel",
     "making all calm before him, and brought him safely into the mouth of "
     "the river.",
     "making all calm before him, and bringing him safely into the mouth of "
     "the river."),
    # --- B05-P036 -----------------------------------------------------------
    (35, "36.1 (minor) — D15: one paragraph closed `hill side` and left "
         "`river bed` open eleven words away. Modern standard is closed",
     "If I stay here on the river bed", "If I stay here on the riverbed"),
    # --- B05-P037 -----------------------------------------------------------
    (36, "37.1 (optional, applied) — `a man` supplies a gender Butler's "
         "`one` leaves open; `someone` costs nothing",
     "as a man who lives alone in the country",
     "as someone who lives alone in the country"),
]

# Ruling 1: the closed `seashore`, and the two instances it costs in this Book.
SEASHORE = [(6, "was on the sea shore as usual"),
            (11, "on the rocks and on the sea shore, weeping")]

# Findings NOT applied, each with the fragment asserted still present.
DECLINED = [
    ("C-15 (optional) — the colon before an opening quotation mark",
     7, "and then said:",
     "The four instances are ONE disposition, not two, and the rule was "
     "simply never written down: a COLON where the speech begins in the "
     "NEXT paragraph (P008 → P009, P016 → P017), a COMMA or full stop where "
     "it follows inline (P007, P015). Recorded in continuity.md §5 instead "
     "of changed."),
    ("21.2 (optional) — `the wain` → `the Wain`",
     20, "call it the Wain",
     "The capital stands; what was wrong was its classification. Recorded "
     "in continuity.md §5 as a RENDERING decision under D15's own test, not "
     "as typographic normalization."),
    ("7.1 (optional) — `Odysseus was not in the cave`",
     6, "but Odysseus was not in the cave",
     "The supplied location stands — it is an improvement, and the same "
     "class as ruling 2's upheld `and`. What was missing was the record; it "
     "is now in continuity.md §5."),
    ("12.1 (optional) — `crying aloud in his despair`",
     11, "crying aloud in his despair",
     "The repair stands; it is a D16 instance and is now recorded in "
     "continuity.md §5 beside B05-P011's."),
    ("23.1 (optional) — `so hard` against `sorely against my will`",
     22, "pressing me so hard",
     "The disposition is defensible and the reviewer says so: the second is "
     "a carried cross-Book formula, the first is ordinary use. Recorded in "
     "continuity.md §5 as a one-word-two-ways row rather than changed."),
]

# S-1: the paragraphs really recast, and the divisions taken back.
# P021 is BOTH: its `She … She also …` division is taken back and its Bear
# sentence is recast, so its sentence count is unchanged and the generic
# gained-a-sentence / lost-a-sentence tests cannot see it. It is asserted by
# name, in both directions, further down.
S1_RECAST = [9, 17]
S1_REVERSED = [20, 27]

NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'ceres': 'demeter'}

BRITISH = ('grey', 'honour', 'harbour', 'marvelled', 'woollen', 'travelled',
           'travelling', 'favour', 'neighbour', 'colour', 'sceptre', 'towards',
           'armour', 'splendour', 'humour', 'levelled', 'skilfully', 'ploughed')

DEAD = (r'\bthereon\b', r'\bwhereon\b', r'\bwhereupon\b', r'\bhaply\b',
        r'\babode\b', r'\bbade\b', r'\bvictuals\b', r'\bhither\b',
        r'\bthither\b', r'\bvouchsafe\b', r'\bshewed\b', r'\baforetime\b',
        r'\bamongst\b', r'\bbethought\b', r'\btwelvemonth\b', r'\bstaid\b',
        r'\bmethinks\b', r'\bperadventure\b', r'\bthou\b', r'\bthy\b',
        r'\bthee\b', r'\bon this\b', r'\bat which\b', r'\bforthwith\b',
        r'\bdeemed\b', r'\bwherefore\b', r'\bharbinger of\b', r'\bno whit\b',
        r'\bpolypus\b', r'\bwherein\b', r'\bequitably\b', r'\braiment\b',
        r'\bconvoyed\b', r'\bbattledore\b', r'\bshuttlecock\b',
        r'”\s*(said|replied|answered) (he|she|i)\b',
        r'\b(said|replied) (he|she|i),')

# The accepted Books' own figures, computed from the accepted files.
ACCEPTED = {1: ("book01/source-book1.json", "book01/candidate-v3.json"),
            2: ("book02/source-book2.json", "book02/candidate-v3.json"),
            3: ("book03/source-book3.json", "book03/candidate-v2.json"),
            4: ("book04/source-book4.json", "book04/candidate-v2.json")}


def fail(msg):
    sys.exit("build_book05_v2.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]


def token_retention(src_paragraphs, cand_paragraphs):
    """The package's canonical measure, the aggregate-join form."""
    s = toks(" ".join(src_paragraphs))
    c = toks(" ".join(cand_paragraphs))
    sm = difflib.SequenceMatcher(a=s, b=c, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks()) / len(s)


def sentences(t):
    """The round-1 reviewer's splitter of Book 4, verbatim."""
    t = t.replace("\n", " ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]


def sentence_profile(paragraphs):
    ss = [s for p in paragraphs for s in sentences(p)]
    return len(ss), sum(1 for s in ss if len(s.split()) >= 60)


def splitting_rate(src_paragraphs, cand_paragraphs):
    sn, s60 = sentence_profile(src_paragraphs)
    cn, c60 = sentence_profile(cand_paragraphs)
    return (sn, cn, 100.0 * (cn - sn) / sn, s60, c60,
            100.0 * (s60 - c60) / s60 if s60 else 0.0)


def semicolons(paragraphs):
    """Records finding R-6, and D19. The single most informative number about
    Book 5's draft, and the package did not compute it. It gives D17 the
    denominator it is missing: how much of the added sentence count came from
    the one operation that moves nothing."""
    return sum(p.count(";") for p in paragraphs)


def one_word_two_ways(src_paragraphs, cand_paragraphs):
    changed, kept = Counter(), {}
    for i, (s, c) in enumerate(zip(src_paragraphs, cand_paragraphs)):
        a, b = toks(s), toks(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for w in a[i1:i2]:
                    kept.setdefault(w, []).append(i + 1)
            else:
                for w in a[i1:i2]:
                    changed[w] += 1
    return [(w, n, len(kept[w]), kept[w][:6])
            for w, n in sorted(changed.items()) if w in kept]


def near_identical(src_paragraphs, cand_paragraphs, max_edits=4, min_words=40):
    out = []
    for i, (s, c) in enumerate(zip(src_paragraphs, cand_paragraphs)):
        a, b = toks(s), toks(c)
        if len(a) < min_words:
            continue
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        edits = sum(max(i2 - i1, j2 - j1)
                    for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal")
        if edits <= max_edits:
            out.append((i + 1, len(a), edits,
                        max(len(x.split()) for x in sentences(c))))
    return out


def main():
    v1_bytes = (BOOK / "candidate-v1.json").read_bytes()
    if sha256_bytes(v1_bytes) != V1_SHA:
        fail("candidate-v1.json is not at its frozen hash %s" % V1_SHA)
    src_bytes = (BOOK / "source-book5.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book5.json is not at its recorded hash")

    v1 = json.loads(v1_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v1["paragraphs"])
    src_flat = [" ".join(p.split()) for p in src["paragraphs"]]
    if len(paras) != len(src_flat) or len(paras) != 37:
        fail("paragraph alignment broken before any correction")

    joined_v1 = "\n".join(paras)
    for name, n in (("Odysseus", 29), ("Zeus", 12), ("Hermes", 9),
                    ("Athena", 6), ("Poseidon", 6), ("Artemis", 1),
                    ("Demeter", 1)):
        if len(re.findall(r"\b%s\b" % name, joined_v1)) != n:
            fail("v1 name count wrong for %s" % name)
    if "'" in joined_v1 or '"' in joined_v1:
        fail("v1 carries an ASCII quote")

    # ---- the corrections ---------------------------------------------------
    changed = {}
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        if p.count(old) != 1:
            fail("B05-P%03d / finding %s: old string occurs %d times, "
                 "expected exactly 1:\n  %r"
                 % (idx + 1, finding, p.count(old), old))
        if new in p:
            fail("B05-P%03d / finding %s: new string already present"
                 % (idx + 1, finding))
        paras[idx] = p.replace(old, new)
        changed.setdefault(idx, []).append(finding)
    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx]:
            fail("B05-P%03d / %s: correction did not land" % (idx + 1, finding))

    # ---- ruling 1: the closed `seashore`, both instances -------------------
    for idx, frag in SEASHORE:
        if paras[idx].count(frag) != 1:
            fail("ruling 1: B05-P%03d does not carry %r once" % (idx + 1, frag))
        paras[idx] = paras[idx].replace(frag, frag.replace("sea shore",
                                                           "seashore"))
        changed.setdefault(idx, []).append("Ruling 1 — the closed `seashore`")

    # ---- the findings NOT applied, asserted unchanged ----------------------
    for finding, idx, frag, why in DECLINED:
        if frag not in paras[idx]:
            fail("B05-P%03d: a DECLINED finding was applied anyway (%s)"
                 % (idx + 1, finding))

    joined = "\n".join(paras)
    low = joined.lower()
    s_all = "\n".join(src_flat)

    def n(w, t=None):
        return len(re.findall(r"\b" + w + r"\b", joined if t is None else t))

    # ---- names, hazards, possessives --------------------------------------
    for greek, roman, k in (("Odysseus", "Ulysses", 29), ("Zeus", "Jove", 12),
                            ("Hermes", "Mercury", 9), ("Athena", "Minerva", 6),
                            ("Poseidon", "Neptune", 6), ("Artemis", "Diana", 1),
                            ("Demeter", "Ceres", 1)):
        if n(greek) != k or n(roman, s_all) != k:
            fail("name census: %s" % greek)
    for roman in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
                  "Diana", "Euryclea", "Venus", "Juno", "Vulcan", "Ceres"):
        if n(roman) != 0:
            fail("Roman form survives: %s" % roman)
    if n("Rhea") or n("Helios") or n("Cronos"):
        fail("hazard 1: a general Roman->Greek list was applied")
    if joined.count("Odysseus’s") != 3 or s_all.count("Ulysses’ ") != 3:
        fail("D7 possessives moved")
    if re.search("(Odysseus|Zeus|Calypso|Ino|Achilles)’(?!s)", joined):
        fail("D7: a bare possessive survives")

    # ---- punctuation: D4 does not fire, and the absence is asserted -------
    if "'" in joined or '"' in joined:
        fail("an ASCII quote survives")
    for mark, k in (("“", 31), ("”", 31)):
        if sum(p.count(mark) for p in paras) != k or \
                sum(p.count(mark) for p in src["paragraphs"]) != k:
            fail("D4: %s totals moved" % mark)
    if [i for i, p in enumerate(paras) if p.count("“") != p.count("”")] != []:
        fail("D4: a paragraph became unbalanced")
    if "punish you.”" not in paras[10]:
        fail("the B05-P011 D16 repair was disturbed")
    if "Then Calypso went close up to him and said:" not in paras[11]:
        fail("ruling 2: the upheld supplied `and` was disturbed")

    # ---- the rulings, each asserted by name --------------------------------
    if n("heaven") != 4 or n("heaven", s_all) != 4:
        fail("ruling 3: the UNBROKEN heaven census moved")
    if "How black Zeus is making heaven with his clouds" not in paras[22]:
        fail("ruling 3: B05-P023's `heaven` must stand")
    if "batting it back and forth at once" not in paras[23] or \
            "between them" in joined:
        fail("ruling 4: `between them` must be gone and the image kept")
    if "sea shore" in low or "sea-shore" in low:
        fail("ruling 1: an open or hyphenated `sea shore` survives")
    if low.count("seashore") != 2:
        fail("ruling 1: exactly two `seashore`")

    # ---- D3, D12, connectives ---------------------------------------------
    if n("hecatomb") or n("hecatombs") or n("hecatombs", s_all) != 1:
        fail("D3: a hecatomb survived")
    if "sacrifices or choice victims" not in paras[8]:
        fail("9.1: the hecatomb rendering must not collide with `offering`")
    if re.search(r"\boffering", low):
        fail("9.1: `offering` is reserved for Butler's own `offering`")
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    if len(re.findall(r"\bAt this\b", joined)) != 2 or \
            len(re.findall(r"\bAt that\b", joined)) != 2:
        fail("64.2: the connective rows moved")
    if len(re.findall(r"\bNevertheless\b", joined)) != 3 or \
            len(re.findall(r"\bNevertheless\b", s_all)) != 3:
        fail("10.2: one Butler connective, one rendering — three of each")
    if re.search(r"\bsaying[,:]", joined):
        fail("22.1/28.1: the Victorian `saying` tag is dropped everywhere")

    # ---- spelling, archaisms, compounds ------------------------------------
    for brit in BRITISH:
        if n(brit):
            fail("British spelling survives: %s" % brit)
    for dead in DEAD:
        if re.search(dead, low):
            fail("archaism or superseded form survives: %s" % dead)
    for closed in ("sandalwood", "homesickness", "seagull", "goatskin",
                   "yardarm", "foothold", "hillside", "daytime", "seashore",
                   "halfway", "riverbed"):
        if closed not in low:
            fail("D15: %s must be closed" % closed)
    for hyph in ("well-found", "sweet-smelling", "mid-ocean", "low-lying",
                 "well-disposed"):
        if hyph not in low:
            fail("D15: %s must be hyphenated" % hyph)
    for third in ("sea water", "half way", "river bed", "mid ocean",
                  "sweet smelling"):
        if third in low:
            fail("D15: a compound landed on a form that is neither Butler's "
                 "nor modern English's: %s" % third)
    if re.search(r"\w+- \w+", joined):
        fail("a hyphenated compound was split by a rewrap")
    if any("\n" in p for p in paras) or any("  " in p for p in paras):
        fail("whitespace defect in a candidate paragraph")
    if any(p != p.strip() for p in paras):
        fail("leading or trailing space in a candidate paragraph")
    if [i + 1 for i in range(37) if paras[i] == src_flat[i]] != []:
        fail("a paragraph became byte-identical to Butler")

    # ---- ruling 1's real cost: the cross-Book check that forces it --------
    # This is the extended compound_drift(), on the closed/open axis. With the
    # three successors present it is silent; without them it names them.
    books = {"book05-v2": paras}
    for label, rel in (("book01", "book01/candidate-v3.json"),
                       ("book02", "book02/candidate-v4.json"),
                       ("book03", "book03/candidate-v3.json"),
                       ("book04", "book04/candidate-v3.json")):
        p = ROOT / rel
        if p.exists():
            books[label] = json.loads(p.read_bytes().decode("utf-8"))["paragraphs"]
    attest = [json.loads((ROOT / ("book0%d/source-book%d.json" % (i, i)))
                         .read_bytes().decode("utf-8"))["paragraphs"]
              for i in range(1, 6)]
    drift = compound_drift(books, attest=attest)
    if drift and len(books) == 5:
        fail("cross-Book compound drift with all successors present: "
             + "; ".join("%s: %s" % (k, v) for k, v in drift))

    # ---- alignment, ratio, retention ---------------------------------------
    sw = [len(p.split()) for p in src_flat]
    cw = [len(p.split()) for p in paras]
    ratio = sum(cw) / sum(sw)
    if not 0.90 <= ratio <= 1.10:
        fail("word ratio %.4f outside 0.90-1.10" % ratio)
    if min(c / s for c, s in zip(cw, sw)) < 0.90:
        fail("a paragraph fell below 0.90 of its source's length")
    retention = token_retention(src["paragraphs"], paras)

    # ---- D17, and the number D17 was missing (R-6 / D19) -------------------
    sn, cn, pct, s60, c60, broken = splitting_rate(src_flat, paras)
    acc = {}
    for bk, (sf, cf) in ACCEPTED.items():
        a = json.loads((ROOT / sf).read_bytes().decode("utf-8"))["paragraphs"]
        b = json.loads((ROOT / cf).read_bytes().decode("utf-8"))["paragraphs"]
        if bk == 3:
            a, b = a[:-1], b[:-1]
        a = [" ".join(p.split()) for p in a]
        acc[bk] = splitting_rate(a, b) + (semicolons(a), semicolons(b))
    floor = min(x[2] for x in acc.values())
    if pct < floor * 0.5:
        fail("D17: %.1f%% added against a floor of %.1f%%" % (pct, floor))
    if c60 > s60 * 0.75:
        fail("D17: %d of %d sixty-word sentences survive" % (c60, s60))
    semi_src, semi_v1, semi_v2 = (semicolons(src_flat),
                                  semicolons(v1["paragraphs"]),
                                  semicolons(paras))

    # S-1: the three recasts gained a sentence; the three reversals lost one.
    for p_no in S1_RECAST:
        i = p_no - 1
        if sentence_profile([paras[i]])[0] <= \
                sentence_profile([v1["paragraphs"][i]])[0]:
            fail("S-1: B05-P%03d was named for recast and gained no sentence"
                 % p_no)
    for p_no in S1_REVERSED:
        i = p_no - 1
        if sentence_profile([paras[i]])[0] >= \
                sentence_profile([v1["paragraphs"][i]])[0]:
            fail("S-1: B05-P%03d's division was ruled worse than Butler's "
                 "semicolon and must be taken back" % p_no)
    # B05-P021 both loses a division and gains one; assert both by name.
    if "and another larger one of water; she also gave him a bag" not in paras[20]:
        fail("S-1: B05-P021's `She … She also …` must be back at Butler's ;")
    if "Bear itself" in joined:
        fail("flow read F-1: `the Bear itself` was reintroduced")
    if not paras[20].count("Calypso had told him to keep the Bear on his left,"):
        fail("S-1: B05-P021's Bear sentence must be recast")
    # Round 1's section H.6: the 60+ census counts sentences at or above 60
    # words and does not report the delta, so B05-P030 going 62 -> 65 was
    # invisible. Generalized: NO paragraph's longest sentence may exceed its
    # source paragraph's longest. (Narrower than the general statement -- a
    # paragraph can still grow a sentence that is not its longest -- but it is
    # what caught P030, and it is cheap.) The gate applies only where the
    # RESULT is a long sentence: growing a 27-word sentence to 29 is not the
    # defect, and B05-P003 and B05-P033 do exactly that, harmlessly. Every
    # growth is REPORTED; only a grown long sentence fails the build.
    grew = [(i + 1,
             max(len(s.split()) for s in sentences(src_flat[i])),
             max(len(s.split()) for s in sentences(paras[i])))
            for i in range(37)
            if max(len(s.split()) for s in sentences(paras[i])) >
            max(len(s.split()) for s in sentences(src_flat[i]))]
    grew_long = [g for g in grew if g[2] >= 50]
    if grew_long:
        fail("30.2 generalized: a recast GROWS a long sentence of Butler's: "
             + "; ".join("B05-P%03d %d→%d" % g for g in grew_long))
    long_in = sorted({i + 1 for i, p in enumerate(paras)
                      for x in sentences(p) if len(x.split()) >= 60})
    # P037's fire-seed simile fell from 60 words to 59 when finding 37.1
    # replaced `as a man who lives alone` with `as someone`, so the only
    # sixty-word sentence left in the Book is P030's, at Butler's own 62.
    if long_in != [30]:
        fail("the only sentence left long is P030's: %s" % long_in)
    if max(len(s.split()) for s in sentences(paras[36])) != 59:
        fail("37.1: P037's simile is 59 words and is still one sentence")

    twoways = one_word_two_ways(src_flat, paras)
    near = near_identical(src_flat, paras)

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")
    (BOOK / "word-counts-v2.json").write_text(
        dump_json({"note": "records finding R5 of Book 4's round 1: the 37 "
                           "per-paragraph word counts, source and candidate.",
                   "source": sw, "candidate": cw}), encoding="utf-8")

    lines = ["# " + doc["title"] + " — modern-English candidate v2 (readable)",
             "",
             "Generated by `scripts/build_book05_v2.py` from the frozen",
             "`candidate-v1.json`. Paragraph IDs are outside the prose; the",
             "text itself is byte-identical to `candidate-v2.json`.", ""]
    for i, p in enumerate(paras):
        lines += ["**B05-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")

    rows = [(idx, f, o, nw) for idx, f, o, nw in CORRECTIONS] + \
           [(idx, "Ruling 1 — the closed `seashore` (D15, and the cross-Book "
                  "check that now sees the class)", frag,
             frag.replace("sea shore", "seashore")) for idx, frag in SEASHORE]
    (BOOK / "changes-v1-to-v2.md").write_text("\n".join(
        ["# Book 5 — every change from `candidate-v1.json` to "
         "`candidate-v2.json`", "",
         "Written by `../scripts/build_book05_v2.py`, which is the only thing",
         "that produced them: `candidate-v1.json` is frozen and was not",
         "edited (**D10**). Each row is one substitution, in the order the",
         "build applies them, with the round-1 finding it answers. Every",
         "`old` string is asserted to occur exactly once in its paragraph,",
         "and every `new` string is asserted to have landed.", "",
         "%d substitutions in %d of the 37 paragraphs."
         % (len(rows), len(changed)), "",
         "| # | paragraph | finding | from | to |", "|---|---|---|---|---|"] +
        ["| %d | B05-P%03d | %s | `%s` | `%s` |"
         % (k + 1, idx + 1, f, o, nw) for k, (idx, f, o, nw) in enumerate(rows)] +
        ["", "## Findings not applied, and why", "",
         "Each is asserted still present in the built file, so a decline "
         "cannot be a silent application.", "",
         "| finding | paragraph | reason |", "|---|---|---|"] +
        ["| %s | B05-P%03d | %s |" % (f, idx + 1, why)
         for f, idx, frag, why in DECLINED] + [""]), encoding="utf-8")

    diffs = [i for i in range(37) if v1["paragraphs"][i] != paras[i]]
    print("OK — candidate-v2.json written")
    print("  paragraphs                 37, 1:1 with source")
    print("  findings applied           %d substitutions in %d paragraphs; "
          "%d declined and asserted unchanged"
          % (len(CORRECTIONS) + len(SEASHORE), len(changed), len(DECLINED)))
    print("  paragraphs differing v1→v2 %d (%s)"
          % (len(diffs), ", ".join("B05-P%03d" % (i + 1) for i in diffs)))
    print("  word ratio                 %.5f (v1 was 0.99871)" % ratio)
    print("  Butler token retention     %.5f (v1 was 0.94211)" % retention)
    print()
    print("  --- D17, and the number it was missing (S-1 / R-6 / D19) ---")
    print("  sentences src → cand       %d → %d  (%+.1f%%)" % (sn, cn, pct))
    print("  60+ word sentences         %d → %d  (%.0f%% broken)"
          % (s60, c60, broken))
    print("  semicolons Butler → cand   %d → %d  (v1 was %d)"
          % (semi_src, semi_v2, semi_v1))
    print("  of the %+d added sentences, at most %d are a semicolon rewritten "
          "as a period" % (cn - sn, semi_src - semi_v2))
    for bk in sorted(acc):
        a = acc[bk]
        print("    accepted Book %d          %d → %d (%+.1f%%), 60+: %d → %d "
              "(%.0f%% broken), semicolons %d → %d"
              % (bk, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]))
    print()
    print("  --- one Butler word rendered two ways ---")
    print("  %d Butler word-types changed somewhere and left alone elsewhere; "
          "full list in book05/checks-v2.md" % len(twoways))
    print("  --- paragraphs near-identical to Butler (40+ words, ≤4 edits) ---")
    for pid, w, e, longest in near:
        print("    B05-P%03d  %3d words, %d edit(s), longest sentence %d words"
              % (pid, w, e, longest))
    print()
    print("  longest sentence grown     %s  (the build fails only at 50+ "
          "words — round 1's H.6)"
          % ("; ".join("B05-P%03d %d→%d" % g for g in grew) or "none"))
    print("  cross-Book compound drift  %s"
          % ("none, over " + ", ".join(sorted(books)) if not drift
             else "; ".join("%s %s" % (k, v) for k, v in drift)))
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))

    (BOOK / "checks-v2.md").write_text("\n".join(
        ["# Book 5 — the checks this round adds", "",
         "Written by `scripts/build_book05_v2.py`.", "",
         "## 1. The semicolon count beside the splitting rate (R-6, D19)", "",
         "Round 1's substantive finding was that Book 5 v1's splitting rate "
         "was bought with semicolons: a semicolon rewritten as a period adds "
         "a sentence, moves no clause, drops no word and costs no retention, "
         "so it scores at full value on both of D17's axes. The package did "
         "not compute the number that shows it.", "",
         "| corpus | sentences src → cand | % added | 60+ src → cand | "
         "semicolons src → cand |",
         "|---|---|---|---|---|"] +
        ["| accepted Book %d | %d → %d | %+.1f%% | %d → %d | %d → %d |"
         % (bk, acc[bk][0], acc[bk][1], acc[bk][2], acc[bk][3], acc[bk][4],
            acc[bk][6], acc[bk][7]) for bk in sorted(acc)] +
        ["| Book 5 **v1** | 153 → 189 | +23.5%% | 9 → 3 | %d → %d |"
         % (semi_src, semi_v1),
         "| **Book 5 v2** | **%d → %d** | **%+.1f%%** | **%d → %d** | "
         "**%d → %d** |" % (sn, cn, pct, s60, c60, semi_src, semi_v2), "",
         "Read the last column as the denominator D17 is missing: at most "
         "**%d** of Book 5 v2's %+d added sentences are a semicolon "
         "conversion, and the rest are real division."
         % (semi_src - semi_v2, cn - sn), "",
         "## 2. Cross-Book compound drift, closed against open (ruling 1)", "",
         "`scripts/compound_drift.py`. The package's `hyphen_drift()` compared "
         "*hyphenated in one Book* against *open in another* and was blind to "
         "*closed against open*. The extension keys each compound on its "
         "letters with the separator stripped and fails on any key carrying "
         "more than one setting across the Books. It is what makes the "
         "`seashore` ruling cost three successors rather than pass silently.",
         "", "Result over this Book and the accepted Books: **%s**."
         % ("no drift" if not drift else "; ".join(
             "%s %s" % (k, v) for k, v in drift)), "",
         "## 3. One Butler word rendered two ways", "",
         "| Butler word | times changed | times kept | kept at (first six) |",
         "|---|---|---|---|"] +
        ["| `%s` | %d | %d | %s |"
         % (w, ch, kp, ", ".join("P%03d" % x for x in ex))
         for w, ch, kp, ex in twoways] +
        ["", "## 4. Paragraphs near-identical to Butler (R-7)", "",
         "Round 1's R-7: this report was computed and then not published, and "
         "`review-instructions.md` quoted three paragraphs it does **not** "
         "flag. It is published here and in `continuity.md` §11.", "",
         "| paragraph | source words | edits | longest sentence |",
         "|---|---|---|---|"] +
        ["| B05-P%03d | %d | %d | %d words |" % r for r in near] +
        ["", "## 5. Per-paragraph word counts", "",
         "`book05/word-counts-v2.json` stores the 37 source and 37 candidate "
         "word counts.", ""]), encoding="utf-8")


if __name__ == "__main__":
    main()
