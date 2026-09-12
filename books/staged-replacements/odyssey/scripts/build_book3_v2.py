#!/usr/bin/env python3
"""Build candidate-v2.json for Odyssey Book 3 from the frozen candidate-v1.json.

Deterministic and idempotent: re-running reproduces byte-identical output.

Round 1 of independent review (book03/review/findings-v1.md) returned
*Accept after corrections*: 0 substantive, 18 minor, 12 optional, 5 records,
12 paragraphs with no material issue, coverage complete over
B03-P001..B03-P038.

This script applies **every paragraph-level finding, minor and optional** —
29 findings, 33 substitutions in 27 paragraphs. Each `old` must occur exactly
once in its paragraph or the build fails. The one finding that proposes no
change is 37.2, which recommends KEEPING `sweetmeats` and recording the
reason; it is asserted unchanged below rather than silently left alone.

The records findings (R1-R5) are answered in GLOSSARY.md, book03/continuity.md,
book03/README.md, PROVENANCE.md and 00-progress-ledger.md, not here — except
R5, the guard maintenance, which this build implements directly: `twelvemonth`,
`towards` and the phrase `in course of time` join the dead-form list, the
`sceptr` exemption is removed, and a **cross-Book typographic drift** check is
added for finding 27.1's shape (a compound hyphenated in one accepted Book and
open in another).

Usage: python3 scripts/build_book3_v2.py
"""
import difflib
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book03"

V1_SHA = "2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa"
SOURCE_SHA = "a3dc00566e0f4517bc7fc68ca6b6dbb363a4e191bb175d1b5c1cabb420815e6a"

# ---------------------------------------------------------------- corrections
# (0-based paragraph index, finding id, old, new). Applied in list order; where
# two corrections touch the same clause the earlier one is written so the later
# one still matches (see B03-P013, findings 13.2 then 13.1).
CORRECTIONS = [
    # --- B03-P001 -----------------------------------------------------------
    (0, "1.1 (minor)",
     "on mortals and immortals alike, they reached",
     "on mortals and immortals, they reached"),
    # --- B03-P002 -----------------------------------------------------------
    (1, "2.1 (minor)",
     "You have made this voyage to find out where",
     "You have made this voyage to try to find out where"),
    (1, "2.2 (minor) — Butler's two warranties are NOT identical",
     "and he will tell you no lies",
     "and he will tell no lies"),
    # --- B03-P003 -----------------------------------------------------------
    (2, "3.1 (minor)",
     "I am ashamed to begin by questioning",
     "I am ashamed to start questioning"),
    # --- B03-P004 -----------------------------------------------------------
    (3, "4.1 (optional, applied)",
     "heaven will prompt you with the rest",
     "heaven will prompt you further"),
    # --- B03-P005 -----------------------------------------------------------
    (4, "5.1 (optional, applied)",
     "while the men around him were busy",
     "while his companions around him were busy"),
    # --- B03-P006 -----------------------------------------------------------
    (5, "6.1 (optional, applied)",
     "for a man cannot live without God in the world",
     "for man cannot live without God in the world"),
    # --- B03-P007 -----------------------------------------------------------
    (6, "7.1 (minor) — Butler's causal 'accordingly'",
     "to have given it to her first, and she began praying",
     "to have given it to her first, so she began praying"),
    # --- B03-P008 -----------------------------------------------------------
    (7, "8.1 (optional, applied) — Butler's 'likewise' is manner, not sequence",
     "he prayed in his turn",
     "he prayed in the same way"),
    # --- B03-P009 -----------------------------------------------------------
    (8, "9.1 (minor) — 'sir strangers' keeps its noun",
     "Who are you, then, sirs, and from what port",
     "Who are you, then, strangers, and from what port"),
    # --- B03-P011 -----------------------------------------------------------
    (10, "11.1 (minor) — the 'honour TO the Achaean name' idiom",
     "honor of the Achaean name",
     "honor to the Achaean name"),
    # --- B03-P012 -----------------------------------------------------------
    (11, "12.1 (optional, applied)",
     "what mortal tongue could tell the whole story?",
     "what mortal tongue indeed could tell the whole story?"),
    # --- B03-P013 -----------------------------------------------------------
    (12, "13.2 (minor) — Butler's pluperfect 'had dispersed'",
     "as heaven scattered us",
     "as heaven had scattered us"),
    (12, "13.1 (minor) — the 'When ... then' frame keeps its 'then'",
     "as heaven had scattered us, Zeus saw fit",
     "as heaven had scattered us, then Zeus saw fit"),
    # --- B03-P015 -----------------------------------------------------------
    (14, "15.1 (optional, applied)",
     "This we did, and a fair wind",
     "This we therefore did, and a fair wind"),
    # --- B03-P016 -----------------------------------------------------------
    (15, "16.1 (optional, applied)",
     "and a fearful reckoning Aegisthus paid for it before long",
     "and Aegisthus paid a fearful reckoning for it before long"),
    # --- B03-P017 -----------------------------------------------------------
    (16, "17.1 (minor) — with 11.1, and the glossary row with them",
     "honor of the Achaean name",
     "honor to the Achaean name"),
    # --- B03-P018 -----------------------------------------------------------
    (17, "18.2 (minor) — D9, American spelling",
     "ill-disposed towards you",
     "ill-disposed toward you"),
    (17, "18.1 (optional, applied) — Butler varies suitors/wooers",
     "some of these suitors would soon forget their wooing",
     "some of these wooers would soon forget their wooing"),
    # --- B03-P021 -----------------------------------------------------------
    (20, "24.1 (minor) — Butler's 'counselled', 1 of 3",
     "the gods long ago decided on his destruction",
     "the gods long ago decreed his destruction"),
    # --- B03-P022 -----------------------------------------------------------
    (21, "22.1 (minor) — Butler's 'cajoled' needed no replacing",
     "worked on Agamemnon’s wife Clytemnestra with unceasing flattery",
     "cajoled Agamemnon’s wife Clytemnestra with unceasing flattery"),
    # --- B03-P023 -----------------------------------------------------------
    (22, "24.1 (minor) — Butler's 'counselled', 2 of 3",
     "when heaven had decided on her destruction",
     "when heaven had decreed her destruction"),
    (22, "23.1 (optional, applied) — Butler's 'batten upon' is gorging",
     "for crows and seagulls to feed on",
     "for crows and seagulls to gorge on"),
    # --- B03-P024 -----------------------------------------------------------
    (23, "24.1 (minor) — Butler's 'counselled', 3 of 3",
     "Zeus planned evil against him",
     "Zeus decreed evil against him"),
    (23, "18.2 (minor) — D9, American spelling",
     "took the one half towards Crete",
     "took the one half toward Crete"),
    # --- B03-P025 -----------------------------------------------------------
    (24, "25.1 (minor) — 'twelvemonth' is dead; the span is unchanged",
     "even birds cannot fly that distance in a twelvemonth",
     "even birds cannot fly that distance in a year"),
    # --- B03-P027 -----------------------------------------------------------
    (26, "27.1 (minor) — first cross-Book typographic drift; Book 1 is accepted",
     "filled the mixing bowls with wine",
     "filled the mixing-bowls with wine"),
    # --- B03-P028 -----------------------------------------------------------
    (27, "28.1 (minor) — Butler's corrective 'but', not a cause",
     "—nor will my sons after me, for they will keep open house as I have done.",
     "—nor will my sons after me; they will keep open house as I have done."),
    # --- B03-P029 -----------------------------------------------------------
    (28, "29.1 (optional, applied)",
     "He shall go back with you and sleep at your house",
     "He shall therefore go back with you and sleep at your house"),
    # --- B03-P032 -----------------------------------------------------------
    (31, "32.1 (minor) — D9; sceptre/scepter is a US-UK spelling pair",
     "sceptre in hand",
     "scepter in hand"),
    # --- B03-P035 -----------------------------------------------------------
    (34, "35.1 (optional, applied) — Butler's 'all in due course'",
     "They cut out the thigh bones in due order",
     "They cut out all the thigh bones in due order"),
    # --- B03-P037 -----------------------------------------------------------
    (36, "37.1 (minor) — the Book's only outright error",
     "and in course of time completed their journey",
     "and in the course of time completed their journey"),
]

# Dead words and forms asserted absent. Extended at records finding R5 with the
# three that stood through round 1: `twelvemonth` (finding 25.1), `towards`
# (18.2) and the article-less phrase `in course of time` (37.1).
DEAD = ("thereon", "ere long", "whereon", "whereupon", "spunging", "victuals",
        "naughtiness", "prating", "hither and thither", "abode", "save only",
        "bade", "moodily", "endowed", "tambour", "singlehanded", "unblended",
        "steeds", "amongst", "bethought", "fuddle", "aforetime", "shewed",
        "vouchsafe", "haply", "nothing loth", "knight of", "public weal",
        "privateering", "elsewhither", "thou", "thy", "thee",
        "twelvemonth", "twelve-month", "in course of time")

# British spellings asserted absent. The `sceptr` exemption is REMOVED at
# finding 32.1: sceptre/scepter is a US-UK spelling pair like centre/center,
# not a distinct word as `draughts` is. `towards` joins the list at 18.2.
BRITISH = ("grey", "honour", "harbour", "marvelled", "woollen", "travelled",
           "travelling", "favour", "neighbour", "colour", "sceptre", "towards")

# Deliberately kept, with the reason, so a later pass does not "improve" them.
KEPT_WITH_REASON = {
    "sweetmeats": "finding 37.2: the plain modern word here is *delicacies*, "
                  "and `delicacies fit for princes` is verbatim the served "
                  "modern-en splice this build asserts has NOT reached the "
                  "candidate. Keeping Butler's word is the only reading that "
                  "does not collide with that assertion.",
    "draughts": "D9: the game's name, not a spelling variant.",
}


def fail(msg):
    sys.exit("build_book3_v2.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def count(word, text):
    return len(re.findall(r"\b" + re.escape(word) + r"\b", text))


def token_retention(src_paragraphs, cand_paragraphs):
    """The Book 2 reviewer's measure: the fraction of Butler's word tokens the
    candidate carries over unchanged AND in order."""
    NAME_MAP = {"ulysses": "odysseus", "minerva": "athena", "jove": "zeus",
                "neptune": "poseidon", "mercury": "hermes", "saturn": "cronus",
                "diana": "artemis", "euryclea": "eurycleia",
                "mycene": "mycenae"}

    def toks(text):
        return [NAME_MAP.get(w, w)
                for w in re.findall(r"[a-z]+", text.replace("\n", " ").lower())]

    s = toks(" ".join(src_paragraphs))
    c = toks(" ".join(cand_paragraphs))
    sm = difflib.SequenceMatcher(a=s, b=c, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks()) / len(s)


def hyphen_drift(books):
    """Records finding 27.1's SHAPE, generalized: a compound printed hyphenated
    in one accepted Book and open in another. `books` is {label: [paragraphs]}.
    Returns a list of (compound, hyphenated-in, open-in) triples.

    **SUPERSEDED by `scripts/compound_drift.py`.** This function is blind to
    *closed against open* (`seashore` beside `sea shore`), which cost three
    successors at Book 5, and blind to a pair no hyphen attests anywhere
    (`waterside` beside `water side`), which cost a fourth at Book 6. It is
    kept here, unchanged, for exactly one reason: this build script must go on
    reproducing its frozen `candidate-v2.json` byte for byte (**D10**).
    **Nothing new should call it.** And the lesson that outlived it is not
    about compounds: it was written at Book 3 and never run again -- Book 4's
    build script does not call it -- so two drifts it COULD already see sat in
    accepted work for two Books. A check nobody runs is worth what an absent
    one is worth."""
    text = {k: " ".join(v) for k, v in books.items()}
    compounds = {}
    for label, t in text.items():
        for m in re.finditer(r"\b([a-z]+)-([a-z]+)\b", t.lower()):
            compounds.setdefault((m.group(1), m.group(2)), set()).add(label)
    out = []
    for (a, b), hyph_in in sorted(compounds.items()):
        open_form = re.compile(r"\b%s %s\b" % (re.escape(a), re.escape(b)))
        open_in = {label for label, t in text.items()
                   if open_form.search(t.lower())}
        if open_in:
            out.append(("%s-%s" % (a, b), sorted(hyph_in), sorted(open_in)))
    return out


def main():
    v1_bytes = (BOOK / "candidate-v1.json").read_bytes()
    if sha256_bytes(v1_bytes) != V1_SHA:
        fail("candidate-v1.json is not at its frozen hash %s" % V1_SHA)
    src_bytes = (BOOK / "source-book3.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book3.json is not at its recorded hash")

    v1 = json.loads(v1_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v1["paragraphs"])
    joined_v1 = "\n".join(paras)

    # ---- pre-flight: v1 is at the naming and punctuation standard ----------
    for name, n in (("Odysseus", 7), ("Athena", 18), ("Zeus", 8),
                    ("Poseidon", 6)):
        if count(name, joined_v1) != n:
            fail("v1 name count wrong for %s" % name)
    if "'" in joined_v1 or '"' in joined_v1:
        fail("v1 carries an ASCII quote")

    # ---- the corrections ---------------------------------------------------
    changed = {}
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        n = p.count(old)
        if n != 1:
            fail("B03-P%03d / finding %s: old string occurs %d times, "
                 "expected exactly 1:\n  %r" % (idx + 1, finding, n, old))
        if new in p:
            fail("B03-P%03d / finding %s: new string already present"
                 % (idx + 1, finding))
        paras[idx] = p.replace(old, new)
        changed.setdefault(idx, []).append(finding)
    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx]:
            fail("B03-P%03d / %s: correction did not land" % (idx + 1, finding))

    joined = "\n".join(paras)

    # ---- finding 37.2 proposes no change, and says so on the record --------
    if "sweetmeats fit for the sons of princes" not in paras[36]:
        fail("37.2: `sweetmeats` must be KEPT, with the reason recorded")
    for stolen in ("delicacies fit for princes", "echoing portico",
                   "wheat lands", "It is getting late",
                   "libations have been made"):
        if stolen in joined:
            fail("a word of the served modern-en splice reached the "
                 "candidate: %s" % stolen)

    # ---- the readings the reviewer considered and DECLINED to raise --------
    for idx, frag, why in (
        (0, "The people of Pylos were gathered",
         "1.x: Butler's narrative 'Now' dropped here; declined"),
        (0, "companies", "1.x: guilds -> companies; recorded, not raised"),
        (1, "for a moment", "2.x: 'in the least' -> 'for a moment'; declined"),
        (2, "I have never been used", "3.x: Butler's 'yet' dropped; declined"),
        (10, "being harried among the Trojans",
         "11.x: 'harassed' -> 'harried'; declined for the connotation"),
        (10, "wretched end", "11.x: 'melancholy' -> 'wretched'; in range"),
        (11, "while raiding under Achilles",
         "12.x: rovers/privateering both to the raid root; declined"),
        (16, "for he avenged his father nobly",
         "17.x: present perfect dropped; small enough to leave"),
        (21, "you have guessed for yourself",
         "22.x: 'divined' -> 'guessed'; declined"),
        (23, "sheltered", "24.x: protected/shelter echo; recorded, not urged"),
        (29, "everyone marveled as they watched her go",
         "30.x: departure added to Butler's 'it'; nothing asserted"),
        (31, "white polished marble",
         "32.x: Butler's 'and' dropped between the attributes; trivial"),
        (32, "win the favor of", "33.x: 'propitiate'; context supports it"),
        (32, "The rest of you, stay where you are",
         "33.x: Butler's emphatic 'all' dropped; declined"),
    ):
        if frag not in paras[idx]:
            fail("B03-P%03d: a declined 'also noted' reading was changed (%s)"
                 % (idx + 1, why))

    # ---- every hazard and standard, post-correction ------------------------
    for name, n in (("Odysseus", 7), ("Athena", 18), ("Zeus", 8),
                    ("Poseidon", 6)):
        if count(name, joined) != n:
            fail("name count changed: %s" % name)
        if count({"Odysseus": "Ulysses", "Athena": "Minerva", "Zeus": "Jove",
                  "Poseidon": "Neptune"}[name],
                 " ".join(p.replace("\n", " ") for p in src["paragraphs"])) != n:
            fail("name count no longer matches the source: %s" % name)
    for bad in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
                "Diana", "Euryclea", "Rhea", "Helios", "Cronos"):
        if count(bad, joined) != 0:
            fail("forbidden form appeared: %s" % bad)
    if count("heaven", joined) != 12 or count(
            "heaven", " ".join(p.replace("\n", " ")
                               for p in src["paragraphs"])) != 12:
        fail("hazard 5: the metonym 'heaven' was disturbed")
    if not (count("Apollo", joined) == count("Hades", joined)
            == count("Amphitrite", joined) == 1):
        fail("an already-Greek name was disturbed")
    # D13, first application: the CITY takes Mycenae; no bare Mycene
    if count("Mycenae", joined) != 1 or count("Mycene", joined) != 0:
        fail("D13: Mycenae once, no bare Mycene")
    if "he ruled in Mycenae" not in joined:
        fail("D13: the city sentence was disturbed")
    if count("Diomed", joined) != 1:
        fail("Diomed is flagged, not corrected")
    # D7 possessives
    if joined.count("Telemachus’s") != 4:
        fail("D7: Telemachus’s x4")
    if "Achilles’s son Neoptolemus" not in joined or "Menelaus’s ship" not in joined:
        fail("D7: a possessive was disturbed")
    if re.search("(Telemachus|Achilles|Menelaus)’(?!s)", joined):
        fail("D7: a bare possessive survives")

    # ---- punctuation and spelling -----------------------------------------
    if "'" in joined or '"' in joined:
        fail("an ASCII quote survives")
    opens = sum(p.count("“") for p in paras)
    closes = sum(p.count("”") for p in paras)
    if (opens, closes) != (42, 35):
        fail("quotation balance changed: %d/%d, expected 42/35" % (opens, closes))
    unbal = [i for i, p in enumerate(paras) if p.count("“") != p.count("”")]
    src_unbal = [i for i, p in enumerate(src["paragraphs"])
                 if p.count("“") != p.count("”")]
    if unbal != src_unbal or unbal != [11, 12, 13, 14, 21, 22, 23]:
        fail("D4: the unbalanced paragraphs must be the source's seven")
    for i in (12, 13, 14, 15, 22, 23, 24):
        if not paras[i].lstrip().startswith("“"):
            fail("D4: B03-P%03d must open its own mark" % (i + 1))
    low = joined.lower()
    for dead in DEAD:
        if re.search(r"\b" + re.escape(dead) + r"\b", low):
            fail("archaism survives: %s" % dead)
    for brit in BRITISH:
        if count(brit, joined) != 0:
            fail("British spelling survives: %s" % brit)
    if "scepter in hand" not in paras[31]:
        fail("32.1: the American spelling did not land")
    for kept, reason in KEPT_WITH_REASON.items():
        if kept == "draughts":
            continue          # Book 1's row; Book 3 does not contain the game
        if kept not in low:
            fail("a deliberately kept word vanished: %s (%s)" % (kept, reason))

    # ---- D12 class B: the bracket mark dropped, Butler's words kept --------
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    if "burning the thigh bones on the embers" not in paras[0]:
        fail("D12 class B: the bracketed words were lost")
    if "[on the embers]" not in src["paragraphs"][0]:
        fail("D12 class B: the source bracket is not where it was")

    # ---- formulas that repeat inside this Book ----------------------------
    if joined.count("he is an excellent man") != 2:
        fail("the 'excellent man' formula must stand twice")
    # finding 2.2 / records R1: Butler's two warranties DIFFER by one word,
    # and the edition now differs in the same place.
    if "he will tell no lies, for he is an excellent man" not in paras[1]:
        fail("2.2: B03-P002 must carry the BARE warranty")
    if "he will tell you no lies, for he is an excellent man" not in paras[24]:
        fail("2.2: B03-P025 must keep the 'you' Butler wrote there")
    src_flat = [p.replace("\n", " ") for p in src["paragraphs"]]
    if "he will tell no lies" not in src_flat[1] \
            or "he will tell you no lies" not in src_flat[24]:
        fail("2.2: the source no longer shows the difference being preserved")
    if joined.count("honor to the Achaean name") != 2 \
            or "honor of the Achaean name" in joined:
        fail("11.1/17.1: the idiom must be 'honor TO' in both places")
    if joined.count("the equal of the gods in counsel") != 2:
        fail("the 'peer of gods in counsel' formula drifted")
    if joined.count("When Dawn, the rosy-fingered child of morning, appeared") != 2:
        fail("the dawn formula drifted")
    if joined.count("readily enough") != 2:
        fail("Butler's 'nothing loth' pair drifted")
    if joined.count("inner meats") != 3 or joined.count("outer meats") != 2:
        fail("the inner/outer meats pair drifted")
    if "Nestor, the horseman of Gerene" not in paras[7]:
        fail("the Gerene epithet drifted")
    if "the Trito-born" not in paras[29]:
        fail("the Trito-born was glossed or dropped")
    if "no mound heaped up for him" not in paras[21]:
        fail("the barrow -> mound row drifted")
    # finding 24.1: one Butler word, one rendering. `counselled` x3 -> `decreed`
    if joined.count("decreed") != 3:
        fail("24.1: Butler's three 'counselled's must have ONE rendering")
    for i in (20, 22, 23):
        if "decreed" not in paras[i]:
            fail("24.1: B03-P%03d lost its rendering" % (i + 1))
    if count("counselled", " ".join(src_flat)) != 3:
        fail("24.1: the source no longer shows three 'counselled's")

    # ---- formulas shared with accepted Books 1 and 2 ----------------------
    b1 = json.loads((ROOT / "book01/candidate-v3.json").read_bytes()
                    .decode("utf-8"))["paragraphs"]
    b2 = json.loads((ROOT / "book02/candidate-v3.json").read_bytes()
                    .decode("utf-8"))["paragraphs"]
    if "show your mettle and make yourself a name in story" not in paras[15]:
        fail("the Book 1 formula drifted")
    if not any("show your mettle, then, and make yourself a name in story" in p
               for p in b1):
        fail("Book 1's own one-word difference is gone")
    if not any("raise a mound to his memory" in p for p in b1 + b2):
        fail("the mound row is missing from the accepted Books")

    # ---- records finding 27.1, generalized: cross-Book typographic drift ---
    drift = hyphen_drift({"book01-v3": b1, "book02-v3": b2, "book03-v2": paras})
    if drift:
        fail("cross-Book typographic drift (finding 27.1's shape): "
             + "; ".join("%s hyphenated in %s but open in %s"
                         % (c, "/".join(h), "/".join(o)) for c, h, o in drift))
    if "mixing-bowls" not in joined:
        fail("27.1: Book 3 must print mixing-bowls, as accepted Book 1 does")

    # ---- D14 / B03-P038: Butler's twelve words, and nothing of the splice --
    if paras[37] != "Now when the sun had set and darkness lay over the land,":
        fail("D14: B03-P038 must be Butler's clause and nothing else")
    if len(src["paragraphs"][37].split()) != 208 or len(paras[37].split()) != 12:
        fail("D14: the 208-against-12 asymmetry is the recorded cost")

    # ---- alignment, newlines, ratios --------------------------------------
    if len(paras) != len(src["paragraphs"]) or len(paras) != 38:
        fail("paragraph alignment broken")
    if any("\n" in p for p in paras):
        fail("a candidate paragraph contains a newline")
    if any(paras[i] == src["paragraphs"][i].replace("\n", " ") for i in range(38)):
        fail("a candidate paragraph is byte-identical to Butler")
    sw = [len(p.split()) for p in src["paragraphs"]]
    cw = [len(p.split()) for p in paras]
    ratio = sum(cw) / sum(sw)
    ratio_ex = sum(cw[:-1]) / sum(sw[:-1])
    if not 0.90 <= ratio <= 1.10:
        fail("word ratio %.4f outside 0.90-1.10" % ratio)

    retention = token_retention(src["paragraphs"][:-1], paras[:-1])
    if retention < 0.895:
        fail("retention fell to %.3f; a correction round must not lose "
             "Butler's words" % retention)

    # ---- write -------------------------------------------------------------
    doc = {"number": v1["number"], "title": v1["title"], "paragraphs": paras}
    out = BOOK / "candidate-v2.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = [
        "# " + doc["title"] + " — modern-English candidate v2 (readable)",
        "",
        "Generated by `scripts/build_book3_v2.py` from the frozen",
        "`candidate-v1.json`. Paragraph IDs are outside the prose; the text",
        "itself is byte-identical to `candidate-v2.json`.",
        "",
    ]
    for i, p in enumerate(paras):
        lines.append("**B03-P%03d**" % (i + 1))
        lines.append("")
        lines.append(p)
        lines.append("")
    (BOOK / "candidate-v2-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")

    diffs = [i for i in range(38) if v1["paragraphs"][i] != paras[i]]
    print("OK — candidate-v2.json written")
    print("  paragraphs                 38, 1:1 with source")
    print("  findings applied           29 paragraph-level (18 minor, 11 of 12 "
          "optional); 37.2 proposes no change and is asserted unchanged")
    print("  substitutions              %d in %d paragraphs"
          % (len(CORRECTIONS), len(changed)))
    print("  paragraphs differing v1→v2 %d (%s)"
          % (len(diffs), ", ".join("B03-P%03d" % (i + 1) for i in diffs)))
    print("  word ratio                 %.4f (v1 was 0.9561)" % ratio)
    print("  word ratio excl. P038      %.4f (v1 was 0.9959)" % ratio_ex)
    print("  Butler token retention     %.3f (v1 was 0.895)" % retention)
    print("  cross-Book hyphen drift    none over Books 1-3")
    print("  candidate-v2.json sha256   %s" % sha256_bytes(out.read_bytes()))


if __name__ == "__main__":
    main()
