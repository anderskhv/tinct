#!/usr/bin/env python3
"""Build candidate-v2.json for Odyssey Book 4 from the frozen candidate-v1.json.

Deterministic and idempotent: re-running reproduces byte-identical output.

Round 1 of independent review (book04/review/findings-v1.md) returned
*Accept after corrections*: **1 substantive** (S-1), 16 minor, 11 optional,
7 records, 50 paragraphs with no material issue, coverage complete over
B04-P001..B04-P081.

S-1 is the whole point of this round. The reviewer split retention into a
vocabulary factor and an order factor, audited the split against the 98
accepted paragraphs of Books 1-3, and threw away the half that predicted
nothing there (chain load predicts sentence splitting, rho +0.380; it does not
predict order retention, rho +0.048). On the surviving channel the finding is
decisive: Book 4's Butler carries the package's densest supply of sixty-word
sentences (17 in 8,042 words), accepted Books 1, 2 and 3 broke 100%, 43% and
33% of theirs and added 20.5%, 16.1% and 5.5% to their sentence counts, and
**v1 broke one of seventeen and added 0.4%**. So this round DIVIDES sentences
Butler already wrote -- nine primary paragraphs and three secondary ones -- and
leaves B04-P038's 105-word shape-changing sentence alone, as the reviewer ruled.
No recast introduces wording that is not Butler's, apart from the connectives
named in the table below.

Retention is expected to stay near v1's 0.960: division neither drops a word
nor moves one, and several of the minor findings put Butler's own words back.
Per the reviewer's B.7, a correction round of this content that moved retention
a long way would mean something other than the finding had been done.

Usage: python3 scripts/build_book04_v2.py
"""
import difflib
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book04"

V1_SHA = "9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553"
SOURCE_SHA = "b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70"

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order; each
# `old` must occur exactly once in its paragraph or the build fails.
#
# S-1 recasts are marked S-1 and are DIVISIONS of Butler's own sentences.
# Where a division drops or exchanges a connective, the entry says so.
CORRECTIONS = [
    # --- B04-P002 -----------------------------------------------------------
    (1, "2.1 (minor) — Butler's `when` locates, it does not count",
     "in the middle of them whenever the man struck up his tune",
     "in the middle of them when the man struck up his tune"),
    # --- B04-P003 -----------------------------------------------------------
    (2, "64.2 (minor) — the connective set, 1 of 6; division",
     "stopped their horses at the gate, at which Eteoneus,",
     "stopped their horses at the gate. At that Eteoneus,"),
    # --- B04-P005 -----------------------------------------------------------
    (4, "5.1 (minor) — Butler's possessive says whose horses these are",
     "They took the sweating horses from under the yoke",
     "They took their sweating horses from under the yoke"),
    # --- B04-P009 -----------------------------------------------------------
    (8, "S-1 — division at Butler's own semicolon, 1 of 2",
     "everything about him is immortal; but among mortal men",
     "everything about him is immortal. But among mortal men"),
    (8, "S-1 — division at Butler's own semicolon, 2 of 2",
     "or there may not; but at all events I have traveled much",
     "or there may not. But at all events I have traveled much"),
    (8, "9.1 (optional, applied) — Butler's scale word is not archaic",
     "in the ruin of a stately house, fully and magnificently furnished",
     "in the ruin of a stately mansion, fully and magnificently furnished"),
    # --- B04-P011 -----------------------------------------------------------
    (10, "S-1 secondary — the Polybus catalogue, division 1 of 2",
     "which is the richest city in the whole world; he gave Menelaus",
     "which is the richest city in the whole world. He gave Menelaus"),
    (10, "S-1 secondary — the Polybus catalogue, division 2 of 2",
     "and ten talents of gold; besides all this, his wife gave Helen",
     "and ten talents of gold. Besides all this, his wife gave Helen"),
    # --- B04-P015 -----------------------------------------------------------
    (14, "15.1 (optional, applied) — degree, not quantity",
     "to entertain him with every mark of distinction",
     "to entertain him with the most marked distinction"),
    # --- B04-P017 -----------------------------------------------------------
    (16, "17.1 (optional, applied) — Butler's phrase carries no impatience",
     "Morning will come soon enough",
     "Morning will come in its own time"),
    # --- B04-P020 -----------------------------------------------------------
    (19, "20.1 (minor) — D9 is the AMERICAN standard, and it is `an herb`",
     "She drugged the wine with a herb that banishes",
     "She drugged the wine with an herb that banishes"),
    (19, "20.2 (minor) — `hewn in pieces` is dismemberment, not felling",
     "or he sees a brother or a son cut down before his very eyes",
     "or he sees a brother or a son hacked to pieces before his very eyes"),
    # --- B04-P021 -----------------------------------------------------------
    (20, "21.1 (minor) + S-1 — the dead connective removed AT the division",
     "before he reached the Argive camp, for all which things the Trojan "
     "women made lamentation, but for my own part I was glad, for my heart "
     "was beginning to yearn after my home, and I was unhappy about the wrong",
     "before he reached the Argive camp. For all this the Trojan women made "
     "lamentation, but for my own part I was glad, for my heart was beginning "
     "to yearn after my home. I was unhappy about the wrong"),
    # --- B04-P028 -----------------------------------------------------------
    (27, "28.1 (optional, applied) — Butler supplies no object",
     "I will not evade them nor deceive you",
     "I will not evade you nor deceive you"),
    # --- B04-P029 -----------------------------------------------------------
    (28, "S-1 — the Pharos geography out of the em-dash parenthesis; "
         "the division drops Butler's `and` at the second joint",
     "there is an island called Pharos—it has a good harbor from which "
     "vessels can get out into open sea when they have taken in water—and "
     "here the gods becalmed me twenty days",
     "there is an island called Pharos. It has a good harbor from which "
     "vessels can get out into open sea when they have taken in water. Here "
     "the gods becalmed me twenty days"),
    # --- B04-P033 -----------------------------------------------------------
    (32, "33.1 (minor) — Butler's stratagem must not collide with his `tricks`",
     "some trick by which I can catch this old god",
     "some scheme by which I can catch this old god"),
    # --- B04-P035 -----------------------------------------------------------
    (34, "35.1 (minor) — `put out` reads as extinguish; Butler's own words back",
     "put out all your strength and hold him fast",
     "put forth all your strength and hold him fast"),
    (34, "S-1 — the instruction sentence divided at Butler's semicolons, 1 of 2",
     "will become both fire and water as well; but you must hold him fast",
     "will become both fire and water as well. But you must hold him fast"),
    (34, "S-1 — the instruction sentence divided at Butler's semicolons, 2 of 2",
     "when you saw him go to sleep; then you may slacken your hold and let "
     "him go; and you can ask him",
     "when you saw him go to sleep. Then you may slacken your hold and let "
     "him go, and you can ask him"),
    # --- B04-P036 -----------------------------------------------------------
    (35, "64.2 (minor) — the connective set, 2 of 6; division",
     "she dived under the waves, and I turned back to the place",
     "she dived under the waves. At that I turned back to the place"),
    # --- B04-P037 -----------------------------------------------------------
    (36, "37.1 (minor) — the compound rule: the modern standard form, 1 of 2",
     "and went along by the sea side, praying heartily",
     "and went along by the seaside, praying heartily"),
    (36, "S-1 — the dash-parenthesis inside the `but here, too` reversal, "
         "given back its own sentence",
     "was most distressing—who would go to bed with a sea monster if he "
     "could help it?—but here, too, the goddess helped us",
     "was most distressing. Who would go to bed with a sea monster if he "
     "could help it? But here, too, the goddess helped us"),
    # --- B04-P038 -----------------------------------------------------------
    (37, "64.2 (minor) — the connective set, 3 of 6; NO division: the 105-word "
         "shape-changing sentence stands, per findings section B.6",
     "and seized him; on which he began at once with his old tricks",
     "and seized him; at that he began at once with his old tricks"),
    (37, "38.1 (minor) — Butler capitalizes Proteus's vocative in both places",
     "‘Which of the gods was it, son of Atreus, that hatched this plot",
     "‘Which of the gods was it, Son of Atreus, that hatched this plot"),
    # --- B04-P040 -----------------------------------------------------------
    (39, "S-1 — Proteus's conditions divided at Butler's semicolon; the "
         "division drops his `for`, the two sentences standing in sequence",
     "before embarking; for it is decreed that you shall not get back",
     "before embarking. It is decreed that you shall not get back"),
    # --- B04-P041 -----------------------------------------------------------
    (40, "S-1 — the clearest case in the Book, division 1 of 2",
     "long and terrible voyage to Egypt; nevertheless, I answered,",
     "long and terrible voyage to Egypt. Nevertheless, I answered,"),
    (40, "S-1 — the clearest case in the Book, division 2 of 2",
     "that you have laid upon me; but now tell me truly,",
     "that you have laid upon me. But now tell me truly,"),
    # --- B04-P043 -----------------------------------------------------------
    (42, "43.1 (minor) + 64.2 — the connective set, 4 of 6; the consequence "
         "Butler's `whereon` carries is restored, and the sentence divides",
     "and they reached home; and Agamemnon kissed his native soil",
     "and they reached home. At that Agamemnon kissed his native soil"),
    # --- B04-P044 -----------------------------------------------------------
    (43, "44.1 (minor) — the interrupted inversion into modern order; "
         "the division falls at Butler's own semicolon",
     "did not give him the slip and prepare war; when, therefore, this man "
     "saw Agamemnon go by,",
     "did not give him the slip and prepare war. So when the man saw "
     "Agamemnon go by,"),
    (43, "44.2 (optional, applied) — `nor yet` is concessive",
     "nor one of Aegisthus’s, but they were all killed",
     "nor even one of Aegisthus’s, but they were all killed"),
    # --- B04-P045 -----------------------------------------------------------
    (44, "S-1 — the old man's speech divided at Butler's second semicolon",
     "it can do no manner of good; find your way home",
     "it can do no manner of good. Find your way home"),
    # --- B04-P046 -----------------------------------------------------------
    (45, "46.1 (minor) — the same class as the B04-P040 repair, under one rule",
     "and unable to get home? or is he dead?",
     "and unable to get home? Or is he dead?"),
    # --- B04-P048 -----------------------------------------------------------
    (47, "64.2 (minor) — the connective set, 5 of 6; division",
     "he dived under the waves, and I turned back to the ships",
     "he dived under the waves. At that I turned back to the ships"),
    # --- B04-P050 -----------------------------------------------------------
    (49, "S-1 — the 61-word opening of Telemachus's reply, divided at "
         "Butler's third semicolon",
     "wish myself at home with my parents; but my crew, whom I have left",
     "wish myself at home with my parents. But my crew, whom I have left"),
    (49, "S-1 — Telemachus's refusal divided at Butler's semicolon; his "
         "`whereas` becomes the plain modern contrastive `But`",
     "and spreading ears; whereas in Ithaca we have neither open fields",
     "and spreading ears. But in Ithaca we have neither open fields"),
    # --- B04-P051 -----------------------------------------------------------
    (50, "51.1 (minor) — the dead dative, repaired as it was at B04-P056",
     "gave it me in the course of a visit",
     "gave it to me in the course of a visit"),
    # --- B04-P064 -----------------------------------------------------------
    (63, "64.2 (minor) + S-1 secondary — the connective set, 6 of 6; division",
     "on the floor of her own room and cry; at which all the maids",
     "on the floor of her own room and cry. At that all the maids"),
    # --- B04-P065 -----------------------------------------------------------
    (64, "65.1 (optional, applied) — Butler's near-identical idiom, one way",
     "no matter how much he was set on it",
     "no matter how much he was bent on it"),
    # --- B04-P066 -----------------------------------------------------------
    (65, "S-1 secondary — Eurycleia's confession divided at Butler's `but`",
     "in the way of bread and wine, but he made me take my solemn oath",
     "in the way of bread and wine. But he made me take my solemn oath"),
    # --- B04-P071 -----------------------------------------------------------
    (70, "76.1 (optional, applied) — Butler's apprehensive, 1 of 2",
     "let there be no loud talking, in case some of it gets carried inside",
     "let there be no loud talking, for fear some of it gets carried inside"),
    (70, "71.1 (minor) — the stranded preposition after a heavy noun phrase",
     "do in silence the thing we are all of a mind about.",
     "do in silence the thing we are all agreed on."),
    # --- B04-P072 -----------------------------------------------------------
    (71, "37.1 (minor) — the compound rule: the modern standard form, 2 of 2",
     "down to their ship and to the sea side; they drew",
     "down to their ship and to the seaside; they drew"),
    # --- B04-P076 -----------------------------------------------------------
    (75, "76.1 (optional, applied) — Butler's apprehensive, 2 of 2",
     "when I think of him, in case something should happen to him",
     "when I think of him, for fear something should happen to him"),
]

# Findings deliberately NOT applied, asserted unchanged so a later pass does
# not quietly "improve" them. (finding, 0-based index, fragment that must
# still be there, reason)
DECLINED = [
    ("39.1 (optional, declined)", 38, "so as to reach my home?’",
     "The reviewer proposes leaving it and this build agrees, under the rule "
     "now written into PUNCTUATION.md section 5: a Victorian mark is repaired "
     "when a modern reader reads it as an ERROR (B04-P040's double mark says "
     "the wrong person is speaking; B04-P046's lower-case opening is not a "
     "sentence opening at all), and kept when it is merely old-fashioned but "
     "correct. B04-P039's terminal question mark on an indirect question is "
     "correct, only dated. It is also one of the seven byte-identical "
     "paragraphs, and changing it would break that asserted list for a "
     "preference."),
    ("49.1 (optional, declined)", 48, "whenever you make a drink offering",
     "The reviewer asks for a recorded decision, not a change: `drink "
     "offering` IS the modern standard open form of the religious term, so "
     "the compound rule now in PUNCTUATION.md reaches it and leaves it open. "
     "Recorded rather than silent."),
    ("72.1 (optional, declined)", 71, "bound the oars to the thole pins",
     "Same rule, same disposition: `thole pin` is an attested modern open "
     "setting of a nautical term the sentence itself explains, and opening it "
     "changes nothing a reader says aloud. `sea side` -> `seaside` in the "
     "same sentence IS changed, because it landed on a form that is neither "
     "Butler's nor modern English's. Recorded, not silent."),
    ("80.1 (optional, declined)", 79, "was dissipated into thin air",
     "The reviewer leaves the decision to the flow read and names the reason "
     "against changing it: `vanished` is already the paragraph's first verb, "
     "so `vanished into thin air` repeats it and `melted` is a different "
     "image. The flow read agrees. It is also one of the seven byte-identical "
     "paragraphs; breaking that list for a preference is the wrong trade."),
    ("17.1 note (partly declined)", 16, "and in the morning I do not care",
     "`in its own time` IS applied. The `morning ... in the morning` echo the "
     "reviewer mentions alongside it is NOT removed: Butler's second word is "
     "`forenoon`, which is the morning, and every plainer rendering either "
     "moves the time of day or adds a word he did not write."),
]

# Butler's sentential connective, one rendering each (finding 64.2). `whereon`
# (x5) and the sentential `on which` (x1) all become `at that`; Butler's other
# sentential connective `On this` (x4) keeps its accepted `At this`. Two Butler
# forms, two renderings, no flattening and no drift. The relative `on which`
# with a nominal antecedent (B04-P042, `the part on which Ajax was sitting`) is
# ordinary modern English and is untouched.
CONNECTIVE_AT_THAT = [2, 35, 37, 42, 47, 63]     # 0-based
CONNECTIVE_AT_THIS = [7, 18, 23, 45]             # 0-based, Butler's `On this`

# The nine primary and three secondary S-1 paragraphs (1-based), and the one
# explicitly left long.
S1_PRIMARY = [9, 21, 29, 35, 37, 40, 41, 45, 50]
S1_SECONDARY = [11, 64, 66]
S1_LEFT_LONG = 38

DEAD = (r'\bthereon\b', r'\bwhereon\b', r'\bwhereupon\b', r'\bere long\b',
        r'\bhaply\b', r'\babode\b', r'\bbade\b', r'\bvictuals\b', r'\bhither\b',
        r'\bthither\b', r'\bhereabouts\b', r'\bvouchsafe\b', r'\bshewed\b',
        r'\baforetime\b', r'\bamongst\b', r'\bbethought\b', r'\bnothing loth\b',
        r'\btwelvemonth\b', r'\btwelve-month\b', r'\bin course of time\b',
        r'\bambuscade\b', r'\bstaid\b', r'\bforenoon\b', r'\bprevaricate\b',
        r'\bmethinks\b', r'\bperadventure\b', r'\bthou\b', r'\bthy\b',
        r'\bthee\b', r'\bon this\b', r'\bfor all which\b', r'\bat which\b',
        r'”\s*(said|replied|answered) (he|she|i)\b',
        r'\b(said|replied) (he|she|i),')

BRITISH = ('grey', 'honour', 'harbour', 'marvelled', 'woollen', 'travelled',
           'travelling', 'favour', 'neighbour', 'colour', 'sceptre', 'towards',
           'armour', 'splendour', 'humour', 'levelled')

# The accepted Books' own figures, for the S-1 comparison. Computed by this
# script from the accepted files, never hard-coded as a claim.
ACCEPTED = {1: ("book01/source-book1.json", "book01/candidate-v3.json"),
            2: ("book02/source-book2.json", "book02/candidate-v3.json"),
            3: ("book03/source-book3.json", "book03/candidate-v2.json")}

NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'mycene': 'mycenae'}


def fail(msg):
    sys.exit("build_book04_v2.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]


def token_retention(src_paragraphs, cand_paragraphs):
    """The package's canonical measure, the aggregate-join form: the fraction
    of Butler's word tokens the candidate carries over unchanged AND in order.
    Identical to token_retention() in scripts/build_book02_v2.py."""
    s = toks(" ".join(src_paragraphs))
    c = toks(" ".join(cand_paragraphs))
    sm = difflib.SequenceMatcher(a=s, b=c, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks()) / len(s)


# ---------------------------------------------------------------------------
# CHECK STRENGTHENING, records finding M-1/M-2/M-5 of the round-1 sheet.
# Nothing in the package's checks counted a sentence; a pure vocabulary swap
# satisfied every one of them perfectly. These three functions are what this
# round adds, and they are what a later Book must run BEFORE freezing.
# ---------------------------------------------------------------------------

def sentences(t):
    """The reviewer's own splitter (book04/review/retention_measure.py), used
    verbatim so this Book's numbers are comparable with the sheet's."""
    t = t.replace("\n", " ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]


def sentence_profile(paragraphs):
    ss = [s for p in paragraphs for s in sentences(p)]
    return len(ss), sum(1 for s in ss if len(s.split()) >= 60)


def splitting_rate(src_paragraphs, cand_paragraphs):
    """The four lines the sheet asked for: how much of Butler's SYNTAX moved.
    Returns (src sentences, cand sentences, % added, src 60+, cand 60+,
    % of 60+ broken)."""
    sn, s60 = sentence_profile(src_paragraphs)
    cn, c60 = sentence_profile(cand_paragraphs)
    return (sn, cn, 100.0 * (cn - sn) / sn, s60, c60,
            100.0 * (s60 - c60) / s60 if s60 else 0.0)


def one_word_two_ways(src_paragraphs, cand_paragraphs):
    """Records finding M-2: for every Butler word-type this candidate CHANGES
    somewhere, report the paragraphs where the same Butler type is left alone.
    Neither side need be archaic and neither need be a glossary row, which is
    exactly why no other check in the package sees this class (`gave it me`
    kept while `lent it him` is repaired; `Son of Atreus` capitalized once and
    lower-cased once; one connective rendered four ways). The output is a list
    for a human to read, not an assertion: most of it is innocuous."""
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
    rows = []
    for w, n in sorted(changed.items()):
        if w in kept:
            rows.append((w, n, len(kept[w]), kept[w][:6]))
    return rows


def near_identical(src_paragraphs, cand_paragraphs, max_edits=4, min_words=40):
    """Records finding M-5: the byte-identical list stops at Hamming distance
    zero, so B04-P041 -- eighty-nine words with two changed -- passes it. This
    reports every paragraph of `min_words` or more whose word-level edit count
    is at or below `max_edits`, identical ones included."""
    out = []
    for i, (s, c) in enumerate(zip(src_paragraphs, cand_paragraphs)):
        a, b = toks(s), toks(c)
        if len(a) < min_words:
            continue
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        edits = sum(max(i2 - i1, j2 - j1)
                    for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal")
        if edits <= max_edits:
            longest = max(len(x.split()) for x in sentences(c))
            out.append((i + 1, len(a), edits, longest))
    return out


def main():
    v1_bytes = (BOOK / "candidate-v1.json").read_bytes()
    if sha256_bytes(v1_bytes) != V1_SHA:
        fail("candidate-v1.json is not at its frozen hash %s" % V1_SHA)
    src_bytes = (BOOK / "source-book4.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book4.json is not at its recorded hash")

    v1 = json.loads(v1_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v1["paragraphs"])
    src_flat = [" ".join(p.split()) for p in src["paragraphs"]]
    if len(paras) != len(src_flat) != 81:
        fail("paragraph alignment broken before any correction")

    # ---- pre-flight: v1 is at the naming and punctuation standard ----------
    joined_v1 = "\n".join(paras)
    for name, n in (("Odysseus", 18), ("Zeus", 11), ("Athena", 7),
                    ("Poseidon", 3), ("Aphrodite", 2), ("Artemis", 1),
                    ("Hera", 1), ("Hephaestus", 1), ("Eurycleia", 1)):
        if len(re.findall(r"\b%s\b" % name, joined_v1)) != n:
            fail("v1 name count wrong for %s" % name)
    if "'" in joined_v1 or '"' in joined_v1:
        fail("v1 carries an ASCII quote")

    # ---- the corrections ---------------------------------------------------
    changed = {}
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        n = p.count(old)
        if n != 1:
            fail("B04-P%03d / finding %s: old string occurs %d times, "
                 "expected exactly 1:\n  %r" % (idx + 1, finding, n, old))
        if new in p:
            fail("B04-P%03d / finding %s: new string already present"
                 % (idx + 1, finding))
        paras[idx] = p.replace(old, new)
        changed.setdefault(idx, []).append(finding)
    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx]:
            fail("B04-P%03d / %s: correction did not land" % (idx + 1, finding))

    # ---- the findings NOT applied, asserted unchanged ----------------------
    for finding, idx, frag, why in DECLINED:
        if frag not in paras[idx]:
            fail("B04-P%03d: a DECLINED finding was applied anyway (%s)"
                 % (idx + 1, finding))

    joined = "\n".join(paras)
    low = joined.lower()

    # ---- finding 64.2: ONE Butler connective, ONE rendering ----------------
    for i in CONNECTIVE_AT_THAT:
        if "at that" not in paras[i].lower():
            fail("64.2: B04-P%03d must carry `at that`" % (i + 1))
        if not re.search(r"\bwhereon\b|\bon which\b", src_flat[i]):
            fail("64.2: B04-P%03d is not one of Butler's own instances" % (i + 1))
    # B04-P022's `At that moment` is Butler's own temporal phrase, not the
    # connective, and is excluded by name rather than by a loose count.
    if len(re.findall(r"\bat that\b(?! moment)", low)) != 6:
        fail("64.2: exactly six connective `at that`, one per Butler instance")
    if "At that moment you came up to us" not in paras[21]:
        fail("64.2: B04-P022's temporal `At that moment` is Butler's own")
    for i in CONNECTIVE_AT_THIS:
        if "at this" not in paras[i].lower():
            fail("64.2: B04-P%03d must keep the accepted `At this`" % (i + 1))
        if not re.search(r"\bon this\b", src_flat[i].lower()):
            fail("64.2: B04-P%03d is not one of Butler's `On this`" % (i + 1))
    if len(re.findall(r"\bat this\b", low)) != 4:
        fail("64.2: exactly four `at this`, one per Butler `On this`")
    # the ordinary relative with a nominal antecedent is NOT the connective
    if "the part on which Ajax was sitting" not in paras[41]:
        fail("64.2: B04-P042's ordinary relative must stand")

    # ---- S-1: the sentences actually divided -------------------------------
    for n in S1_PRIMARY + S1_SECONDARY:
        i = n - 1
        before = sentence_profile([v1["paragraphs"][i]])[0]
        after = sentence_profile([paras[i]])[0]
        if after <= before:
            fail("S-1: B04-P%03d was named for recast and gained no sentence"
                 % n)
    if sentence_profile([paras[S1_LEFT_LONG - 1]])[0] != \
            sentence_profile([v1["paragraphs"][S1_LEFT_LONG - 1]])[0]:
        fail("S-1: B04-P%03d's 105-word sentence was ruled to STAND"
             % S1_LEFT_LONG)
    if max(len(s.split()) for s in sentences(paras[S1_LEFT_LONG - 1])) < 100:
        fail("S-1: B04-P038's long sentence was divided after all")

    # ---- names, hazards, possessives, punctuation, spelling ----------------
    def n(w, t=None):
        return len(re.findall(r"\b" + w + r"\b", joined if t is None else t))
    s_all = "\n".join(src_flat)
    for greek, roman, k in (("Odysseus", "Ulysses", 18), ("Zeus", "Jove", 11),
                            ("Athena", "Minerva", 7), ("Poseidon", "Neptune", 3),
                            ("Aphrodite", "Venus", 2), ("Artemis", "Diana", 1),
                            ("Hera", "Juno", 1), ("Hephaestus", "Vulcan", 1),
                            ("Eurycleia", "Euryclea", 1)):
        if n(greek) != n(roman, s_all) != k:
            fail("name census: %s" % greek)
    for roman in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
                  "Diana", "Euryclea", "Venus", "Juno", "Vulcan"):
        if n(roman) != 0:
            fail("Roman form survives: %s" % roman)
    if n("Rhea") or n("Helios") or n("Cronos"):
        fail("hazard 1: a general Roman->Greek list was applied")
    if n("Idothea") != 1 or n("Eidothea") != 0:
        fail("D8 is silent on Idothea; Butler's spelling stands")
    if n("Diomed") != 2 or n("Diomedes") != 0:
        fail("Diomed is flagged, not corrected")
    if n("heaven") != 15 or n("heaven", s_all) != 16:
        fail("the ONE deliberate break in the heaven census moved")
    if "the middle of the sky" not in paras[33]:
        fail("the mid heaven rendering moved")
    for poss in ("Odysseus’s", "Achilles’s", "Telemachus’s", "Aegisthus’s",
                 "Hephaestus’s", "Zeus’s"):
        if poss not in joined:
            fail("D7: %s" % poss)
    if re.search("(Odysseus|Achilles|Telemachus|Aegisthus|Hephaestus|Zeus)’(?!s)",
                 joined):
        fail("D7: a bare possessive survives")
    if "'" in joined or '"' in joined:
        fail("an ASCII quote survives")
    opens = sum(p.count("“") for p in paras)
    closes = sum(p.count("”") for p in paras)
    if opens != sum(p.count("“") for p in src["paragraphs"]) != 71:
        fail("D4: opening double marks moved")
    if closes != sum(p.count("”") for p in src["paragraphs"]) != 50:
        fail("D4: closing double marks moved")
    unbal = [i + 1 for i, p in enumerate(paras) if p.count("“") != p.count("”")]
    if unbal != [i + 1 for i, p in enumerate(src["paragraphs"])
                 if p.count("“") != p.count("”")] != list(range(28, 49)):
        fail("D4: the twenty-one unbalanced paragraphs are the source's")
    for i in range(28, 48):
        if not paras[i].lstrip().startswith("“"):
            fail("D4: B04-P%03d must open its own mark" % (i + 1))
    if sum(p.count("‘") for p in paras) != \
            sum(p.count("‘") for p in src["paragraphs"]) + 1 != 25:
        fail("the B04-P040 repair is the ONLY single-mark difference")
    if not paras[39].startswith("“‘Then,’ he said,"):
        fail("the B04-P040 repair was disturbed")
    for brit in BRITISH:
        if n(brit) != 0:
            fail("British spelling survives: %s" % brit)
    for dead in DEAD:
        if re.search(dead, low):
            fail("archaism or superseded form survives: %s" % dead)
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    if "and found him in his own house, feasting with his many clansmen" \
            not in paras[0] or "in the courts." not in paras[51]:
        fail("D12 class C: bracketed words were lost")
    if n("hecatomb") or n("hecatombs"):
        fail("D3: a hecatomb survived")
    if re.search(r"\w+- \w+", joined):
        fail("a hyphenated compound was split by a rewrap")
    if any("\n" in p for p in paras) or any("  " in p for p in paras):
        fail("whitespace defect in a candidate paragraph")
    if any(p != p.strip() for p in paras):
        fail("leading or trailing space in a candidate paragraph")

    # ---- the compound rule, now a written rule (records R4) ----------------
    for closed in ("maidservant", "manservant", "tomorrow", "bathroom",
                   "seaside", "heartbroken"):
        if closed not in low:
            fail("compound rule: %s must be closed" % closed)
    for opened in ("drink offering", "thole pins", "work box", "sea shore"):
        if opened not in low:
            fail("compound rule: %s must be open" % opened)
    for hyph in ("fine-spun", "violet-colored", "mixing-bowl",
                 "lion-hearted", "scepter-bearing", "heaven-fed"):
        if hyph not in low:
            fail("compound rule: %s must be hyphenated" % hyph)
    if "sea side" in low or "seashore" in low:
        fail("compound rule: a compound landed on a form that is neither "
             "Butler's nor modern English's")

    # ---- formulas, inside the Book and across the accepted Books ----------
    if joined.count("they laid their hands on the good things that were "
                    "before them") != 2:
        fail("the guest-welcome formula drifted")
    if joined.count("my brave and lion-hearted husband, who had every good "
                    "quality under heaven, and whose name was great over all "
                    "Hellas and middle Argos") != 2:
        fail("Penelope's formula drifted")
    if joined.count("for night was falling, and camped down on the beach") != 2:
        fail("the beach-camp formula drifted")
    if joined.count("thought of another matter") != 2:
        fail("Butler's `bethought her` formula drifted")
    if joined.count("the heaven-fed stream of Egypt") != 2:
        fail("the Egypt formula drifted")
    if joined.count("I will make it all quite clear to you") != 2:
        fail("the `quite clear` formula drifted")
    if "tell me truly" not in paras[40] or "tell me true" in joined:
        fail("the tell me truly row drifted")
    b1 = json.loads((ROOT / "book01/candidate-v3.json").read_bytes()
                    .decode("utf-8"))["paragraphs"]
    b2 = json.loads((ROOT / "book02/candidate-v3.json").read_bytes()
                    .decode("utf-8"))["paragraphs"]
    b3 = json.loads((ROOT / "book03/candidate-v2.json").read_bytes()
                    .decode("utf-8"))["paragraphs"]
    if not any("the suitors grew loud throughout the covered gallery" in p
               for p in b1):
        fail("the Book 1 gallery formula is gone from the accepted Book")
    if "the suitors grew loud throughout the covered gallery" not in paras[68]:
        fail("the Book 1 gallery formula drifted in Book 4")
    if joined.count("mixing-bowl") != 2 or "mixing bowl" in joined:
        fail("the cross-Book mixing-bowl row drifted")

    # ---- the seven byte-identical paragraphs, still exactly seven ----------
    identical = [i + 1 for i in range(81) if paras[i] == src_flat[i]]
    if identical != [39, 54, 61, 63, 70, 79, 80]:
        fail("the byte-identical list changed: %s" % identical)

    # ---- alignment, per-paragraph word counts (records R5), ratio ---------
    sw = [len(p.split()) for p in src_flat]
    cw = [len(p.split()) for p in paras]
    ratio = sum(cw) / sum(sw)
    if not 0.90 <= ratio <= 1.10:
        fail("word ratio %.4f outside 0.90-1.10" % ratio)
    if min(c / s for c, s in zip(cw, sw)) < 0.90:
        fail("a paragraph fell below 0.90 of its source's length")
    retention = token_retention(src["paragraphs"], paras)

    # ---- THE CHECKS THIS ROUND ADDS ---------------------------------------
    sn, cn, pct, s60, c60, broken = splitting_rate(src_flat, paras)
    acc = {}
    for bk, (sf, cf) in ACCEPTED.items():
        a = json.loads((ROOT / sf).read_bytes().decode("utf-8"))["paragraphs"]
        b = json.loads((ROOT / cf).read_bytes().decode("utf-8"))["paragraphs"]
        if bk == 3:                      # book03/README.md excludes B03-P038
            a, b = a[:-1], b[:-1]
        acc[bk] = splitting_rate([" ".join(p.split()) for p in a], b)
    floor = min(x[2] for x in acc.values())          # +5.5%, Book 3
    if pct < floor * 0.5:
        fail("S-1 would stand: the candidate adds %.1f%% sentences against a "
             "floor of %.1f%% in the accepted Books" % (pct, floor))
    if c60 > s60 * 0.75:
        fail("S-1 would stand: %d of %d sixty-word sentences survive"
             % (c60, s60))

    twoways = one_word_two_ways(src_flat, paras)
    near = near_identical(src_flat, paras)

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")
    (BOOK / "word-counts-v2.json").write_text(
        dump_json({"note": "records finding R5: the 81 per-paragraph word "
                           "counts, source and candidate, stored so every "
                           "shape of rewrap damage is one failing assertion "
                           "rather than a formula check that happened to "
                           "cover the damaged paragraph.",
                   "source": sw, "candidate": cw}), encoding="utf-8")

    lines = [
        "# " + doc["title"] + " — modern-English candidate v2 (readable)",
        "",
        "Generated by `scripts/build_book04_v2.py` from the frozen",
        "`candidate-v1.json`. Paragraph IDs are outside the prose; the text",
        "itself is byte-identical to `candidate-v2.json`.",
        "",
    ]
    for i, p in enumerate(paras):
        lines += ["**B04-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")

    diffs = [i for i in range(81) if v1["paragraphs"][i] != paras[i]]
    print("OK — candidate-v2.json written")
    print("  paragraphs                 81, 1:1 with source")
    print("  findings applied           %d substitutions in %d paragraphs; "
          "%d declined and asserted unchanged"
          % (len(CORRECTIONS), len(changed), len(DECLINED)))
    print("  paragraphs differing v1→v2 %d (%s)"
          % (len(diffs), ", ".join("B04-P%03d" % (i + 1) for i in diffs)))
    print("  word ratio                 %.4f (v1 was 0.9999)" % ratio)
    print("  Butler token retention     %.5f (v1 was 0.95958)" % retention)
    print()
    print("  --- the measure the package did not have (S-1) ---")
    print("  sentences src → cand       %d → %d  (%+.1f%%)" % (sn, cn, pct))
    print("  60+ word sentences         %d → %d  (%.0f%% broken)"
          % (s60, c60, broken))
    for bk in sorted(acc):
        a = acc[bk]
        print("    accepted Book %d          %d → %d (%+.1f%%), 60+: %d → %d "
              "(%.0f%% broken)" % (bk, a[0], a[1], a[2], a[3], a[4], a[5]))
    print()
    print("  --- one Butler word rendered two ways (nothing else sees this) ---")
    print("  %d Butler word-types are changed somewhere and left alone "
          "elsewhere; the full list is in book04/checks-v2.md" % len(twoways))
    print("  --- paragraphs near-identical to Butler (40+ words, <=4 edits) ---")
    for pid, w, e, longest in near:
        print("    B04-P%03d  %3d words, %d edit(s), longest sentence %d words"
              % (pid, w, e, longest))
    print()
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))

    (BOOK / "checks-v2.md").write_text("\n".join(
        ["# Book 4 — the checks this round adds", "",
         "Written by `scripts/build_book04_v2.py`. Round 1's section M listed "
         "six classes the package's own checks could not catch. Three of them "
         "are now measured here; the rest are rules, in `PUNCTUATION.md` and "
         "`GLOSSARY.md`.", "",
         "## 1. Sentence counting and the splitting rate (M-1)", "",
         "| corpus | sentences src → cand | % added | 60+ word src → cand | % broken |",
         "|---|---|---|---|---|"] +
        ["| accepted Book %d | %d → %d | %+.1f%% | %d → %d | %.0f%% |"
         % (bk, *acc[bk][:3], acc[bk][3], acc[bk][4], acc[bk][5])
         for bk in sorted(acc)] +
        ["| **Book 4 v2** | **%d → %d** | **%+.1f%%** | **%d → %d** | **%.0f%%** |"
         % (sn, cn, pct, s60, c60, broken), "",
         "The build FAILS if the rate falls below half the accepted floor, or "
         "if more than three quarters of the source's sixty-word sentences "
         "survive. Book 4 v1 would have failed both.", "",
         "## 2. One Butler word rendered two ways (M-2)", "",
         "For every Butler word-type the candidate changes somewhere, the "
         "paragraphs where the same type is left alone. Printed for a human "
         "to read, never asserted: most of it is innocuous, and that is the "
         "point — nothing mechanical can tell `gave it me` kept beside "
         "`lent it him` repaired from a hundred harmless cases.", "",
         "| Butler word | times changed | times kept | kept at (first six) |",
         "|---|---|---|---|"] +
        ["| `%s` | %d | %d | %s |"
         % (w, ch, kp, ", ".join("P%03d" % x for x in ex))
         for w, ch, kp, ex in twoways] +
        ["", "## 3. Better than a byte-identical list (M-5)", "",
         "The asserted list of identical paragraphs stops at Hamming distance "
         "zero. B04-P041 — eighty-nine words, two changed — passed it in v1 "
         "and was the clearest instance of the substantive finding. This "
         "reports every paragraph of forty words or more within four "
         "word-level edits of Butler, identical ones included.", "",
         "| paragraph | source words | edits | longest sentence |",
         "|---|---|---|---|"] +
        ["| B04-P%03d | %d | %d | %d words |" % r for r in near] +
        ["", "## 4. Per-paragraph word counts (R5)", "",
         "`book04/word-counts-v2.json` stores the 81 source and 81 candidate "
         "word counts. A rewrap that breaks on a hyphen, an em-dash, a "
         "dropped line or a duplicated line is then one failing assertion "
         "instead of a formula check that happened to cover the damage.", ""]),
        encoding="utf-8")


if __name__ == "__main__":
    main()
